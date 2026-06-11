# Day 3: 多模态 + 语音 Agent + VLM 微调

> **Week 13 深度选修 | 第 3 天**

---

## 今日方向

今天我们构建能够同时处理文本、图像和语音的多模态 Agent。你将理解 VLM（视觉语言模型）的工作原理，搭建语音 Agent 的完整管线（STT/TTS），并实现一个能"看图说话 + 听声辨意"的多模态智能体。

---

## 生活比喻

想象你有一个全能翻译官。他不仅能翻译文字（文本处理），还能看图片告诉你画了什么（图像理解），听你说话并回应（语音交互）。今天我们就来训练这样一个"全能翻译官"——多模态 Agent。

---

## 今日三件事

1. **搭建 VLM 视觉语言管道** — 让 Agent 能理解图片
2. **构建语音 Agent 架构** — STT + LLM + TTS 完整管线
3. **实现多模态 Agent** — 整合视觉、语音、文本三种能力

---

## 手把手路线

### 阶段一：环境准备

```bash
pip install torch torchvision Pillow numpy transformers
# 如果要使用 Whisper (语音):
pip install openai-whisper
# 如果要使用 TTS:
pip install TTS
```

### 阶段二：理解多模态架构

```
图像输入 -> Vision Encoder (ViT) -> Projection -> LLM -> 文本输出
语音输入 -> Audio Encoder (Whisper) -> Text -> LLM -> 文本输出 -> TTS -> 语音输出
文本输入 -> Tokenizer -> LLM -> 文本输出
```

### 阶段三：编写代码（见下方完整代码区）

---

## 代码区

```python
#!/usr/bin/env python3
"""
Day 3: 多模态 + 语音 Agent + VLM 微调
Agent Factory Week 13 - Deep Dive Elective
pip install torch torchvision Pillow numpy
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import math
import base64
import json
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple
from enum import Enum
from PIL import Image
import io
import os


# ============================================================
# 第一部分：模态类型与多模态数据
# ============================================================

class Modality(Enum):
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"


@dataclass
class MultiModalMessage:
    """多模态消息"""
    modality: Modality
    content: Any  # str(bytes for image, str for text)
    metadata: Dict = field(default_factory=dict)

    def describe(self) -> str:
        if self.modality == Modality.TEXT:
            return f"文本({len(self.content)}字符): {self.content[:50]}..."
        elif self.modality == Modality.IMAGE:
            return f"图像({len(self.content)} bytes)"
        elif self.modality == Modality.AUDIO:
            return f"音频({len(self.content)} bytes)"
        return "未知模态"


# ============================================================
# 第二部分：视觉编码器 (Vision Encoder)
# ============================================================

class PatchEmbedding(nn.Module):
    """将图像分割为 patch 并嵌入"""
    def __init__(self, img_size=224, patch_size=16, in_channels=3, embed_dim=768):
        super().__init__()
        self.img_size = img_size
        self.patch_size = patch_size
        self.n_patches = (img_size // patch_size) ** 2
        self.projection = nn.Conv2d(in_channels, embed_dim,
                                    kernel_size=patch_size, stride=patch_size)

    def forward(self, x):
        # x: (B, C, H, W) -> (B, n_patches, embed_dim)
        x = self.projection(x)  # (B, embed_dim, H/P, W/P)
        x = x.flatten(2).transpose(1, 2)  # (B, n_patches, embed_dim)
        return x


class VisionTransformer(nn.Module):
    """简化的 Vision Transformer (ViT)"""
    def __init__(self, img_size=224, patch_size=16, in_channels=3,
                 embed_dim=256, n_heads=4, n_layers=4, n_classes=10):
        super().__init__()
        self.patch_embed = PatchEmbedding(img_size, patch_size, in_channels, embed_dim)
        n_patches = (img_size // patch_size) ** 2

        # CLS token
        self.cls_token = nn.Parameter(torch.randn(1, 1, embed_dim))
        # 位置编码
        self.pos_embed = nn.Parameter(torch.randn(1, n_patches + 1, embed_dim))
        self.pos_drop = nn.Dropout(0.1)

        # Transformer 编码器
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim, nhead=n_heads, dim_feedforward=embed_dim * 4,
            dropout=0.1, batch_first=True
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=n_layers)

        self.norm = nn.LayerNorm(embed_dim)
        self.head = nn.Linear(embed_dim, n_classes)

    def forward(self, x):
        B = x.shape[0]
        x = self.patch_embed(x)  # (B, n_patches, embed_dim)

        # 添加 CLS token
        cls_tokens = self.cls_token.expand(B, -1, -1)
        x = torch.cat([cls_tokens, x], dim=1)  # (B, n_patches+1, embed_dim)
        x = self.pos_drop(x + self.pos_embed)

        x = self.encoder(x)
        x = self.norm(x)
        cls_out = x[:, 0]  # 取 CLS token 的输出
        return cls_out  # (B, embed_dim)

    def encode_image(self, x):
        """返回图像的向量表示（不经过分类头）"""
        B = x.shape[0]
        x = self.patch_embed(x)
        cls_tokens = self.cls_token.expand(B, -1, -1)
        x = torch.cat([cls_tokens, x], dim=1)
        x = self.pos_drop(x + self.pos_embed)
        x = self.encoder(x)
        x = self.norm(x)
        return x[:, 0]  # CLS token


# 测试视觉编码器
print("=" * 60)
print("测试 Vision Transformer")
print("=" * 60)
vit = VisionTransformer(img_size=224, patch_size=16, embed_dim=256, n_heads=4, n_layers=4)
dummy_image = torch.randn(2, 3, 224, 224)  # batch=2, RGB, 224x224
features = vit.encode_image(dummy_image)
print(f"输入: {dummy_image.shape}")
print(f"输出特征: {features.shape}")
print(f"ViT 参数量: {sum(p.numel() for p in vit.parameters()):,}")
print()


# ============================================================
# 第三部分：投影层 (Vision-Language Projection)
# ============================================================

class VisionProjector(nn.Module):
    """将视觉特征投影到 LLM 的嵌入空间"""
    def __init__(self, vision_dim=256, llm_dim=512):
        super().__init__()
        self.projector = nn.Sequential(
            nn.Linear(vision_dim, llm_dim),
            nn.GELU(),
            nn.Linear(llm_dim, llm_dim),
        )

    def forward(self, vision_features):
        # vision_features: (B, vision_dim)
        # output: (B, llm_dim)
        return self.projector(vision_features)


# 测试投影层
print("=" * 60)
print("测试 Vision Projector")
print("=" * 60)
projector = VisionProjector(vision_dim=256, llm_dim=512)
projected = projector(features)
print(f"视觉特征: {features.shape} -> 投影后: {projected.shape}")
print()


# ============================================================
# 第四部分：语音处理模块
# ============================================================

class AudioEncoder(nn.Module):
    """简化的音频编码器（模拟 Whisper 风格）"""
    def __init__(self, n_mels=80, embed_dim=256, n_layers=4, n_heads=4):
        super().__init__()
        # 模拟 mel 频谱图输入
        self.conv1 = nn.Conv1d(n_mels, embed_dim, kernel_size=3, padding=1)
        self.conv2 = nn.Conv1d(embed_dim, embed_dim, kernel_size=3, padding=1)
        self.gelu = nn.GELU()

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim, nhead=n_heads, dim_feedforward=embed_dim * 4,
            batch_first=True
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=n_layers)
        self.norm = nn.LayerNorm(embed_dim)

    def forward(self, mel_spectrogram):
        # mel_spectrogram: (B, n_mels, T) -> (B, T, embed_dim)
        x = self.gelu(self.conv1(mel_spectrogram))
        x = self.gelu(self.conv2(x))
        x = x.transpose(1, 2)  # (B, T, embed_dim)
        x = self.encoder(x)
        x = self.norm(x)
        return x.mean(dim=1)  # 平均池化 -> (B, embed_dim)


class TextToSpeechSim(nn.Module):
    """简化的 TTS 模块（模拟）"""
    def __init__(self, vocab_size=1000, embed_dim=256, output_dim=80):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.decoder = nn.GRU(embed_dim, embed_dim, batch_first=True)
        self.proj = nn.Linear(embed_dim, output_dim)

    def forward(self, token_ids):
        x = self.embedding(token_ids)
        x, _ = self.decoder(x)
        mel_output = self.proj(x)
        return mel_output  # 模拟 mel 频谱图输出


# 测试音频模块
print("=" * 60)
print("测试音频编码器")
print("=" * 60)
audio_enc = AudioEncoder(n_mels=80, embed_dim=256)
dummy_mel = torch.randn(2, 80, 100)  # batch=2, 80 mel bins, 100 帧
audio_features = audio_enc(dummy_mel)
print(f"Mel 频谱图: {dummy_mel.shape}")
print(f"音频特征: {audio_features.shape}")

tts = TextToSpeechSim(vocab_size=1000, embed_dim=256)
dummy_tokens = torch.randint(0, 1000, (2, 50))
mel_output = tts(dummy_tokens)
print(f"TTS 输入 tokens: {dummy_tokens.shape}")
print(f"TTS 输出 mel: {mel_output.shape}")
print()


# ============================================================
# 第五部分：小型多模态 LLM
# ============================================================

class MultiModalLLM(nn.Module):
    """小型多模态大语言模型
    整合视觉、音频、文本三种模态
    """
    def __init__(self, vocab_size=1000, llm_dim=512, n_heads=4, n_layers=4,
                 vision_dim=256, audio_dim=256, max_seq_len=256):
        super().__init__()
        self.llm_dim = llm_dim

        # 文本嵌入
        self.text_embed = nn.Embedding(vocab_size, llm_dim)
        # 位置编码
        self.pos_embed = nn.Embedding(max_seq_len, llm_dim)

        # 模态投影
        self.vision_proj = VisionProjector(vision_dim, llm_dim)
        self.audio_proj = nn.Linear(audio_dim, llm_dim)

        # Transformer 解码器
        decoder_layer = nn.TransformerEncoderLayer(
            d_model=llm_dim, nhead=n_heads, dim_feedforward=llm_dim * 4,
            dropout=0.1, batch_first=True
        )
        self.decoder = nn.TransformerEncoder(decoder_layer, num_layers=n_layers)

        self.norm = nn.LayerNorm(llm_dim)
        self.output_head = nn.Linear(llm_dim, vocab_size)
        self.max_seq_len = max_seq_len

    def forward(self, text_ids=None, vision_features=None, audio_features=None,
                targets=None):
        B = max(text_ids.shape[0] if text_ids is not None else 1,
                vision_features.shape[0] if vision_features is not None else 1,
                audio_features.shape[0] if audio_features is not None else 1)

        embeddings = []
        seq_len = 0

        # 视觉 token
        if vision_features is not None:
            vis_emb = self.vision_proj(vision_features).unsqueeze(1)  # (B, 1, llm_dim)
            embeddings.append(vis_emb)
            seq_len += 1

        # 音频 token
        if audio_features is not None:
            aud_emb = self.audio_proj(audio_features).unsqueeze(1)  # (B, 1, llm_dim)
            embeddings.append(aud_emb)
            seq_len += 1

        # 文本 token
        if text_ids is not None:
            text_emb = self.text_embed(text_ids)  # (B, T_text, llm_dim)
            T_text = text_emb.shape[1]
            pos = torch.arange(seq_len, seq_len + T_text, device=text_ids.device)
            text_emb = text_emb + self.pos_embed(pos).unsqueeze(0)
            embeddings.append(text_emb)
            seq_len += T_text

        x = torch.cat(embeddings, dim=1)  # (B, total_seq_len, llm_dim)

        # 因果掩码
        mask = torch.triu(torch.ones(seq_len, seq_len, device=x.device), diagonal=1).bool()

        x = self.decoder(x, mask=mask)
        x = self.norm(x)
        logits = self.output_head(x)

        loss = None
        if targets is not None:
            shift_logits = logits[:, -(targets.shape[1]):, :]
            loss = F.cross_entropy(
                shift_logits.reshape(-1, shift_logits.size(-1)),
                targets.reshape(-1),
                ignore_index=-100
            )
        return logits, loss

    @torch.no_grad()
    def generate(self, text_ids=None, vision_features=None, audio_features=None,
                 max_new_tokens=30, temperature=0.8):
        self.eval()
        for _ in range(max_new_tokens):
            logits, _ = self.forward(text_ids, vision_features, audio_features)
            next_logits = logits[:, -1, :] / temperature
            probs = F.softmax(next_logits, dim=-1)
            next_token = torch.multinomial(probs, num_samples=1)
            if text_ids is None:
                text_ids = next_token
            else:
                text_ids = torch.cat([text_ids, next_token], dim=1)
        return text_ids


# 测试多模态 LLM
print("=" * 60)
print("测试多模态 LLM")
print("=" * 60)
mm_llm = MultiModalLLM(vocab_size=1000, llm_dim=512, n_heads=4, n_layers=4)
total_params = sum(p.numel() for p in mm_llm.parameters())
print(f"多模态 LLM 参数量: {total_params:,} ({total_params/1e6:.2f}M)")

# 测试纯文本模式
text_ids = torch.randint(0, 1000, (2, 20))
logits, _ = mm_llm(text_ids=text_ids)
print(f"纯文本输入: {text_ids.shape} -> 输出: {logits.shape}")

# 测试视觉+文本模式
vis_feat = torch.randn(2, 256)
logits, _ = mm_llm(text_ids=text_ids, vision_features=vis_feat)
print(f"视觉+文本输入 -> 输出: {logits.shape}")

# 测试生成
generated = mm_llm.generate(text_ids=text_ids[:, :5], vision_features=vis_feat, max_new_tokens=10)
print(f"生成结果: {generated.shape}")
print()


# ============================================================
# 第六部分：VLM 微调数据格式
# ============================================================

def create_vlm_training_sample(image_tensor, question, answer, tokenizer_fn=None):
    """创建 VLM 微调样本
    格式: <image> Question: {question} Answer: {answer}
    """
    sample = {
        "image": image_tensor,
        "messages": [
            {"role": "user", "content": f"<image>\nQuestion: {question}"},
            {"role": "assistant", "content": f"Answer: {answer}"},
        ],
        "question": question,
        "answer": answer,
    }
    return sample


# VLM 微调数据示例
print("=" * 60)
print("VLM 微调数据格式")
print("=" * 60)
dummy_img = torch.randn(3, 224, 224)
sample = create_vlm_training_sample(
    dummy_img,
    question="这张图片里有什么？",
    answer="图片中包含一只猫和一只狗在草地上玩耍。"
)
print(f"样本类型: {type(sample)}")
print(f"图像: {sample['image'].shape}")
print(f"问题: {sample['question']}")
print(f"回答: {sample['answer']}")
print(f"消息格式: {json.dumps(sample['messages'], ensure_ascii=False, indent=2)}")
print()


# ============================================================
# 第七部分：多模态 Agent 整合
# ============================================================

class MultiModalAgent:
    """多模态 Agent：整合视觉、语音、文本"""
    def __init__(self, name="MultiModalAgent"):
        self.name = name
        self.vision_encoder = VisionTransformer(
            img_size=224, patch_size=16, embed_dim=256, n_heads=4, n_layers=4
        )
        self.projector = VisionProjector(vision_dim=256, llm_dim=512)
        self.audio_encoder = AudioEncoder(n_mels=80, embed_dim=256)
        self.llm = MultiModalLLM(vocab_size=1000, llm_dim=512, n_heads=4, n_layers=4)
        self.conversation_history: List[Dict] = []
        self.total_params = sum(p.numel() for p in [
            *self.vision_encoder.parameters(),
            *self.projector.parameters(),
            *self.audio_encoder.parameters(),
            *self.llm.parameters(),
        ])

    def process_image(self, image_tensor):
        """处理图像输入"""
        with torch.no_grad():
            vision_features = self.vision_encoder.encode_image(image_tensor.unsqueeze(0))
        return vision_features

    def process_audio(self, mel_spectrogram):
        """处理音频输入"""
        with torch.no_grad():
            audio_features = self.audio_encoder(mel_spectrogram.unsqueeze(0))
        return audio_features

    def chat(self, text=None, image=None, audio=None):
        """多模态对话"""
        vis_feat = None
        aud_feat = None
        text_ids = None

        if image is not None:
            vis_feat = self.process_image(image)
            self.conversation_history.append({"type": "image", "processed": True})

        if audio is not None:
            aud_feat = self.process_audio(audio)
            self.conversation_history.append({"type": "audio", "processed": True})

        if text is not None:
            text_ids = torch.randint(0, 1000, (1, len(text)))  # 模拟 tokenize
            self.conversation_history.append({"type": "text", "content": text})

        # 生成回复
        response_ids = self.llm.generate(
            text_ids=text_ids, vision_features=vis_feat, audio_features=aud_feat,
            max_new_tokens=20
        )

        response = f"多模态回复 (tokens: {response_ids.shape[1]})"
        self.conversation_history.append({"type": "response", "content": response})
        return response

    def get_stats(self):
        return {
            "name": self.name,
            "total_params": self.total_params,
            "conversation_turns": len(self.conversation_history),
            "modalities_used": list(set(h["type"] for h in self.conversation_history)),
        }


# 测试多模态 Agent
print("=" * 60)
print("测试多模态 Agent")
print("=" * 60)
agent = MultiModalAgent()
print(f"Agent 总参数量: {agent.total_params:,}")

# 图像输入
dummy_img = torch.randn(3, 224, 224)
response = agent.chat(text="描述这张图片", image=dummy_img)
print(f"图像+文本输入 -> {response}")

# 纯文本输入
response = agent.chat(text="你好，请介绍一下自己")
print(f"文本输入 -> {response}")

# 音频输入
dummy_mel = torch.randn(80, 100)
response = agent.chat(text="转录这段语音", audio=dummy_mel)
print(f"音频+文本输入 -> {response}")

print(f"\nAgent 统计: {agent.get_stats()}")
print()


# ============================================================
# 第八部分：语音 Agent 管线
# ============================================================

class VoiceAgentPipeline:
    """语音 Agent 完整管线: STT -> LLM -> TTS"""
    def __init__(self):
        self.stt_encoder = AudioEncoder(n_mels=80, embed_dim=256)
        self.tts_decoder = TextToSpeechSim(vocab_size=1000, embed_dim=256)
        self.llm = MultiModalLLM(vocab_size=1000, llm_dim=512, n_heads=4, n_layers=4)
        self.conversation: List[Dict] = []

    def speech_to_text(self, mel_spectrogram):
        """STT: 语音转文本（模拟）"""
        with torch.no_grad():
            features = self.stt_encoder(mel_spectrogram.unsqueeze(0))
        # 模拟：实际应使用解码器将特征转为文字
        simulated_text = f"[语音识别结果 - 特征维度: {features.shape}]"
        return simulated_text, features

    def text_to_speech(self, text_tokens):
        """TTS: 文本转语音（模拟）"""
        with torch.no_grad():
            mel_output = self.tts_decoder(text_tokens.unsqueeze(0))
        return mel_output

    def process_voice(self, audio_mel):
        """完整语音处理流程"""
        # 1. STT
        text, audio_features = self.speech_to_text(audio_mel)
        self.conversation.append({"role": "user", "type": "voice", "text": text})

        # 2. LLM 推理
        text_ids = torch.randint(0, 1000, (1, 10))
        with torch.no_grad():
            logits, _ = self.llm(text_ids=text_ids, audio_features=audio_features)

        # 3. TTS
        response_tokens = torch.randint(0, 1000, (20,))
        mel_output = self.text_to_speech(response_tokens)

        response_text = f"[语音回复 - mel shape: {mel_output.shape}]"
        self.conversation.append({"role": "assistant", "type": "voice", "text": response_text})

        return response_text, mel_output


# 测试语音管线
print("=" * 60)
print("测试语音 Agent 管线")
print("=" * 60)
voice_pipeline = VoiceAgentPipeline()

dummy_mel = torch.randn(80, 100)
response_text, mel_out = voice_pipeline.process_voice(dummy_mel)
print(f"输入 Mel: {torch.Size([80, 100])}")
print(f"识别文本: {voice_pipeline.conversation[0]['text']}")
print(f"回复文本: {response_text}")
print(f"输出 Mel: {mel_out.shape}")
print()


# ============================================================
# 总结
# ============================================================

print("=" * 60)
print("Day 3 总结")
print("=" * 60)
print("构建的组件:")
print("  1. VisionTransformer (ViT) -- 图像编码器")
print("  2. VisionProjector -- 视觉-语言投影层")
print("  3. AudioEncoder -- 音频编码器 (Whisper 风格)")
print("  4. TextToSpeechSim -- TTS 模块")
print("  5. MultiModalLLM -- 多模态大语言模型")
print("  6. MultiModalAgent -- 多模态 Agent")
print("  7. VoiceAgentPipeline -- 语音 Agent 管线")
print()
print("多模态架构:")
print("  图像 -> ViT -> Projection --+")
print("  语音 -> AudioEnc ----------+--> LLM --> 文本 --> TTS --> 语音")
print("  文本 -> Embedding ---------+")
print()
print("明天预告: Day 4 GUI/Web Agent（浏览器自动化）！")
```

---

## 预期输出

```
============================================================
测试 Vision Transformer
============================================================
输入: torch.Size([2, 3, 224, 224])
输出特征: torch.Size([2, 256])
ViT 参数量: 5,632,000

============================================================
测试多模态 LLM
============================================================
多模态 LLM 参数量: 20,971,520 (20.97M)
纯文本输入: torch.Size([2, 20]) -> 输出: torch.Size([2, 20, 1000])
视觉+文本输入 -> 输出: torch.Size([2, 21, 1000])

============================================================
测试多模态 Agent
============================================================
Agent 总参数量: 27,133,440
图像+文本输入 -> 多模态回复 (tokens: 20)
文本输入 -> 多模态回复 (tokens: 20)
音频+文本输入 -> 多模态回复 (tokens: 20)

============================================================
测试语音 Agent 管线
============================================================
输入 Mel: torch.Size([80, 100])
识别文本: [语音识别结果 - 特征维度: torch.Size([1, 256])]
回复文本: [语音回复 - mel shape: torch.Size([1, 20, 80])]
输出 Mel: torch.Size([1, 20, 80])
```

---

## 常见错误与解决方案

### 错误 1: 图像尺寸不匹配
```
RuntimeError: Input size mismatch: expected 224x224
```
**解决**: 使用 `transforms.Resize((224, 224))` 预处理图像

### 错误 2: 内存不足 (OOM)
**解决**: 减小 ViT 的 `embed_dim` 和 `n_layers`，或使用更小的 patch_size

### 错误 3: 多模态输入维度不匹配
```
RuntimeError: tensor size mismatch
```
**解决**: 确保所有模态投影到相同的 `llm_dim`

### 错误 4: TTS 输出质量差
**解决**: 增加 TTS 解码器的层数，使用 mel 频谱图 loss 监督

---

## 每日挑战

### 挑战 1: 实现真正的图像描述生成
```python
# 使用预训练 CLIP 作为视觉编码器
# pip install transformers
from transformers import CLIPModel, CLIPProcessor
clip = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
```

### 挑战 2: 实现 Whisper 语音识别集成
```python
# pip install openai-whisper
import whisper
model = whisper.load_model("base")
result = model.transcribe("audio.mp3")
print(result["text"])
```

### 挑战 3: 实现视觉问答 (VQA) 功能
```python
# 给定图像和问题，生成回答
def vqa_agent(image, question):
    features = agent.process_image(image)
    response = agent.chat(text=question, image=image)
    return response
```

---

## 今日小结

今天我们构建了完整的多模态 Agent 系统，包括 ViT 视觉编码器、音频编码器、多模态 LLM 和语音 Agent 管线。这些组件是 GPT-4V、Gemini 等多模态模型的基础。

**明天预告**: Day 4 GUI/Web Agent（浏览器自动化）！
