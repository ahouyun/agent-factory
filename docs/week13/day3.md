# 📅 Week 13 Day 3：方向C - 多模态 Agent

## 🎤 语音 Agent 架构

语音 Agent 的核心流程：

```
用户语音 → [STT] 文本 → [LLM] 推理 → [TTS] 语音 → 用户
```

### 关键组件

| 组件 | 功能 | 代表方案 |
|------|------|---------|
| STT（语音转文本） | 识别用户语音 | Whisper / 阿里 Paraformer |
| LLM（大语言模型） | 理解和生成回复 | GPT-4o / Claude / DeepSeek |
| TTS（文本转语音） | 生成语音回复 | ElevenLabs / CosyVoice |

### 实现示例

```python
import openai
from faster_whisper import WhisperModel

# 1. 语音转文本
whisper = WhisperModel("base")
segments, _ = whisper.transcribe("audio.wav")
text = " ".join([s.text for s in segments])

# 2. LLM 推理
client = OpenAI()
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": text}]
)
reply = response.choices[0].message.content

# 3. 文本转语音（使用 TTS API）
speech_response = client.audio.speech.create(
    model="tts-1",
    voice="alloy",
    input=reply
)
speech_response.stream_to_file("output.mp3")
```

> 语音 Agent 是 2025-2026 年的热门方向，OpenAI 的 Advanced Voice Mode 和 Gemini 的多模态能力都在推动这一领域发展。

## 🧭 今日方向
> 学习如何构建能够处理多种模态（文本、图像、音频）的 Agent 系统。

## 🎯 生活比喻
> 多模态 Agent 就像一个全能助手。他不仅能读文字（文本处理），还能看图片（图像理解），听声音（语音识别），甚至能生成图片和语音。就像一个会读、会看、会听、会说的"超级人类"。

## 📋 今日三件事
1. 理解多模态数据的表示方法
2. 实现图像和文本的融合处理
3. 构建一个多模态 Agent 示例

## 🗺️ 手把手路线

### Step 1：多模态数据表示
- 做什么: 学习如何统一表示不同模态的数据
- 为什么: 不同模态需要统一的接口
- 成功标志: 能设计多模态数据结构

### Step 2：模态融合
- 做什么: 学习如何融合不同模态的信息
- 为什么: 多模态的核心是融合
- 成功标志: 能实现简单的融合方法

### Step 3：多模态 Agent
- 做什么: 构建能处理多模态输入的 Agent
- 为什么: 这是实际应用的需求
- 成功标志: Agent 能处理图像和文本输入

## 💻 代码区

```python
"""
多模态 Agent
处理文本、图像等多种模态
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Union
from enum import Enum
import base64

# ========== 1. 模态类型 ==========

class Modality(Enum):
    """模态类型"""
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"


# ========== 2. 多模态数据 ==========

@dataclass
class MultiModalData:
    """多模态数据"""
    modality: Modality
    content: Any
    metadata: Dict = field(default_factory=dict)
    
    @property
    def description(self) -> str:
        if self.modality == Modality.TEXT:
            return f"文本: {str(self.content)[:50]}..."
        elif self.modality == Modality.IMAGE:
            return f"图像: {self.metadata.get('size', '未知大小')}"
        elif self.modality == Modality.AUDIO:
            return f"音频: {self.metadata.get('duration', '未知时长')}秒"
        return f"{self.modality.value}: 未知"


# ========== 3. 模态编码器 ==========

class TextEncoder:
    """文本编码器"""
    
    def encode(self, text: str) -> List[float]:
        """编码文本为向量"""
        # 简化：使用字符 ASCII 值的平均
        if not text:
            return [0.0] * 8
        return [ord(c) / 255.0 for c in text[:8]]


class ImageEncoder:
    """图像编码器"""
    
    def encode(self, image_data: bytes) -> List[float]:
        """编码图像为向量"""
        # 简化：使用字节值的统计特征
        if not image_data:
            return [0.0] * 8
        data = list(image_data[:8])
        return [b / 255.0 for b in data]
    
    def analyze(self, image_data: bytes) -> Dict:
        """分析图像"""
        return {
            "size": len(image_data),
            "format": "unknown",
            "features": self.encode(image_data)
        }


# ========== 4. 模态融合器 ==========

class ModalityFuser:
    """模态融合器"""
    
    def fuse(self, encodings: Dict[Modality, List[float]]) -> List[float]:
        """融合多个模态的编码"""
        if not encodings:
            return [0.0] * 8
        
        # 简单平均融合
        fused = [0.0] * 8
        count = 0
        
        for encoding in encodings.values():
            if encoding:
                for i in range(min(len(encoding), 8)):
                    fused[i] += encoding[i]
                count += 1
        
        if count > 0:
            fused = [v / count for v in fused]
        
        return fused


# ========== 5. 多模态 Agent ==========

class MultiModalAgent:
    """多模态 Agent"""
    
    def __init__(self):
        self.text_encoder = TextEncoder()
        self.image_encoder = ImageEncoder()
        self.fuser = ModalityFuser()
        self.memory: List[Dict] = []
        self.tools: Dict[str, Any] = {}
    
    def process_input(self, data: MultiModalData) -> Dict:
        """处理输入"""
        # 编码
        if data.modality == Modality.TEXT:
            encoding = self.text_encoder.encode(data.content)
        elif data.modality == Modality.IMAGE:
            encoding = self.image_encoder.encode(data.content)
        else:
            encoding = [0.0] * 8
        
        # 记忆
        self.memory.append({
            "modality": data.modality.value,
            "description": data.description,
            "encoding": encoding
        })
        
        return {
            "modality": data.modality.value,
            "encoding": encoding,
            "memory_size": len(self.memory)
        }
    
    def think(self) -> str:
        """思考"""
        if not self.memory:
            return "还没有收到任何输入。"
        
        modalities = [m["modality"] for m in self.memory]
        return f"已处理 {len(self.memory)} 个输入，模态类型: {', '.join(set(modalities))}"
    
    def respond(self, question: str) -> str:
        """响应"""
        thought = self.think()
        
        # 融合所有记忆
        encodings = {}
        for item in self.memory[-3:]:  # 最近 3 个
            modality = Modality(item["modality"])
            encodings[modality] = item["encoding"]
        
        fused = self.fuser.fuse(encodings)
        
        return f"基于 {len(self.memory)} 个输入的记忆，我回答: {question}\n融合特征: {[f'{v:.2f}' for v in fused[:4]]}..."
    
    def process_image(self, image_data: bytes, caption: str = "") -> Dict:
        """处理图像"""
        analysis = self.image_encoder.analyze(image_data)
        
        data = MultiModalData(
            modality=Modality.IMAGE,
            content=image_data,
            metadata={**analysis, "caption": caption}
        )
        
        return self.process_input(data)


# ========== 6. 示例运行 ==========

def main():
    print("=" * 60)
    print("多模态 Agent")
    print("=" * 60)
    
    # 1. 创建 Agent
    agent = MultiModalAgent()
    
    # 2. 处理文本
    print("\n1. 处理文本输入:")
    text_data = MultiModalData(
        modality=Modality.TEXT,
        content="这是一段示例文本"
    )
    result = agent.process_input(text_data)
    print(f"   结果: {result}")
    
    # 3. 处理图像
    print("\n2. 处理图像输入:")
    image_data = b'\x89PNG\r\n' + b'\x00' * 100  # 模拟图像数据
    result = agent.process_image(image_data, "示例图像")
    print(f"   结果: {result}")
    
    # 4. 思考和响应
    print("\n3. Agent 思考:")
    print(f"   {agent.think()}")
    
    print("\n4. Agent 响应:")
    response = agent.respond("描述一下你看到的内容")
    print(f"   {response}")
    
    # 5. 架构图
    print("\n5. 多模态 Agent 架构:")
    print("-" * 40)
    print("""
    ┌─────────────────────────────────────────┐
    │         多模态 Agent                     │
    │  ┌─────────────────────────────────┐   │
    │  │         输入处理                 │   │
    │  │  ┌─────┐  ┌─────┐  ┌─────┐   │   │
    │  │  │文本 │  │图像 │  │音频 │   │   │
    │  │  └──┬──┘  └──┬──┘  └──┬──┘   │   │
    │  └─────┼────────┼────────┼───────┘   │
    │        │        │        │             │
    │  ┌─────▼────────▼────────▼───────┐   │
    │  │         模态融合               │   │
    │  │    (Modality Fusion)          │   │
    │  └───────────────┬───────────────┘   │
    │                  │                      │
    │  ┌───────────────▼───────────────┐   │
    │  │         记忆系统               │   │
    │  │    (Multi-Modal Memory)       │   │
    │  └───────────────┬───────────────┘   │
    │                  │                      │
    │  ┌───────────────▼───────────────┐   │
    │  │         思考与响应             │   │
    │  └───────────────────────────────┘   │
    └─────────────────────────────────────────┘
""")
    
    print("\n6. 多模态应用场景:")
    print("-" * 40)
    print("  1. 图像描述: 输入图像，生成文字描述")
    print("  2. 视觉问答: 根据图像回答问题")
    print("  3. 文档理解: 理解图文混合文档")
    print("  4. 多模态检索: 根据文本搜索图像")


if __name__ == "__main__":
    main()
```

## 🖼️ VLM 视觉语言模型微调

### 什么是 VLM

VLM（Vision Language Model）是能够同时理解图像和文本的模型：

| 模型 | 特点 | 适用场景 |
|------|------|---------|
| GPT-4o | 多模态，支持图像理解 | 通用图像理解 |
| Claude 3.5 | 强大的视觉推理 | 复杂图像分析 |
| Qwen-VL | 开源，支持中文 | 本地部署 |
| LLaVA | 开源，可微调 | 定制化需求 |

### 微调 VLM 的场景

- **文档 OCR**：识别特定格式的文档
- **产品质检**：识别产品缺陷
- **医学影像**：辅助诊断
- **自动驾驶**：场景理解

### 微调方法

```python
# 使用 LLaVA 微调示例
from llava.model import LlavaLlamaForCausalLM
from transformers import TrainingArguments

# 加载预训练模型
model = LlavaLlamaForCausalLM.from_pretrained("liuhaotian/llava-v1.5-7b")

# 配置训练参数
training_args = TrainingArguments(
    output_dir="./vlm-finetuned",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    learning_rate=2e-5,
)

# 准备图像-文本对数据
# 每个样本包含：图像 + 问题 + 回答
```

> VLM 微调需要 GPU 资源（建议 24GB+ 显存），初学者可以先了解概念，后续有资源时再实践。

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 模态融合效果差 | 尝试不同的融合方法 |
| 2 | 图像处理失败 | 检查图像数据格式 |
| 3 | 内存占用过高 | 使用更小的编码器 |
| 4 | 推理速度慢 | 使用批处理，优化模型 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Multi-Modal | 多种模态（文本、图像等） |
| Encoder | 将数据编码为向量 |
| Fusion | 融合多模态信息 |
| Embedding | 数据的向量表示 |
| Modality | 数据的类型（文本、图像等） |

## ✅ 验收清单
- [ ] 理解多模态数据表示
- [ ] 能实现模态编码和融合
- [ ] 能构建多模态 Agent
- [ ] 代码能跑通

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
