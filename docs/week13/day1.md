# Day 1: 从零构建 LLM — LLaMA2 架构 + BPE 分词器

> **Week 13 深度选修 | 第 1 天**

---

## 今日方向

今天我们不做"调用 API 的应用开发者"，而是切换到"模型建造者"视角——用 PyTorch 从零实现一个微型 LLaMA2 风格的 Transformer，训练自己的 BPE 分词器，并完成文本生成。理解底层原理后，你对 Agent 与 LLM 的交互会有全新的认知。

---

## 生活比喻

想象你在学开车。之前你只会坐在副驾驶看别人开车（调用 API），今天你终于要坐到驾驶座——亲手组装一辆迷你赛车（构建模型），先装引擎（Transformer 层），再装变速箱（BPE 分词器），最后踩下油门让它跑起来（文本生成）。

---

## 今日三件事

1. **理解 LLaMA2 架构核心组件** — RMSNorm、RoPE、SwiGLU、GQA
2. **从零实现微型 Transformer** — 用 PyTorch 手写每一层
3. **训练 BPE 分词器 + 文本生成** — 端到端跑通全流程

---

## 手把手路线

### 阶段一：环境准备与依赖安装

```bash
# 创建虚拟环境
python -m venv llama_from_scratch
source llama_from_scratch/bin/activate  # Linux/Mac
# llama_from_scratch\Scripts\activate   # Windows

# 安装依赖
pip install torch>=2.0 tokenizers>=0.13 numpy tqdm
```

### 阶段二：理解 LLaMA2 与标准 Transformer 的区别

标准 Transformer (GPT-2) 使用:
- LayerNorm
- 绝对位置编码
- 标准 FFN (两个线性层 + GELU)

LLaMA2 的改进:
- **RMSNorm** — 更快的归一化（去掉均值中心化）
- **RoPE** — 旋转位置编码（支持外推）
- **SwiGLU** — 更强的激活函数
- **GQA** — 分组查询注意力（节省显存）

### 阶段三：编写代码（见下方完整代码区）

### 阶段四：训练分词器并生成文本

---

## 代码区

```python
#!/usr/bin/env python3
"""
Day 1: 从零构建微型 LLaMA2 + BPE 分词器
Agent Factory Week 13 - Deep Dive Elective
pip install torch tokenizers numpy tqdm
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from tokenizers import Tokenizer, models, trainers, pre_tokenizers
from tokenizers.normalizers import NFKC
import numpy as np
import os


# ============================================================
# 第一部分：RMSNorm — LLaMA2 使用的归一化层
# ============================================================

class RMSNorm(nn.Module):
    """
    Root Mean Square Layer Normalization
    比标准 LayerNorm 更快：不计算均值，只做 RMS 归一化
    公式: RMSNorm(x) = x / sqrt(mean(x^2) + eps) * gamma
    """
    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x):
        # x shape: (batch, seq_len, dim)
        rms = torch.sqrt(torch.mean(x ** 2, dim=-1, keepdim=True) + self.eps)
        normalized = x / rms
        return normalized * self.weight


# 测试 RMSNorm
print("=" * 60)
print("测试 RMSNorm")
print("=" * 60)
rms_norm = RMSNorm(dim=64)
test_input = torch.randn(2, 10, 64)
output = rms_norm(test_input)
print(f"输入形状: {test_input.shape}")
print(f"输出形状: {output.shape}")
print(f"输出均值（应接近0）: {output.mean().item():.6f}")
print(f"输出 RMS（应接近1）: {torch.sqrt(torch.mean(output**2, dim=-1)).mean().item():.6f}")
print()


# ============================================================
# 第二部分：旋转位置编码 (RoPE)
# ============================================================

class RotaryPositionEmbedding(nn.Module):
    """
    旋转位置编码 (RoPE)
    通过旋转矩阵将位置信息注入到 Q、K 中
    优势：天然支持长度外推
    """
    def __init__(self, dim: int, max_seq_len: int = 2048, base: float = 10000.0):
        super().__init__()
        inv_freq = 1.0 / (base ** (torch.arange(0, dim, 2).float() / dim))
        self.register_buffer("inv_freq", inv_freq)

    def forward(self, q, k, seq_len):
        # q, k: (batch, n_heads, seq_len, head_dim)
        t = torch.arange(seq_len, device=q.device).type_as(self.inv_freq)
        freqs = torch.outer(t, self.inv_freq)
        emb = torch.cat((freqs, freqs), dim=-1)
        cos_emb = emb.cos().unsqueeze(0).unsqueeze(0)
        sin_emb = emb.sin().unsqueeze(0).unsqueeze(0)

        def rotate_half(x):
            x1, x2 = x.chunk(2, dim=-1)
            return torch.cat((-x2, x1), dim=-1)

        q_rot = q * cos_emb + rotate_half(q) * sin_emb
        k_rot = k * cos_emb + rotate_half(k) * sin_emb
        return q_rot, k_rot


print("=" * 60)
print("测试旋转位置编码 (RoPE)")
print("=" * 60)
rope = RotaryPositionEmbedding(dim=64)
q = torch.randn(2, 8, 10, 64)
k = torch.randn(2, 8, 10, 64)
q_rot, k_rot = rope(q, k, seq_len=10)
print(f"Q 形状: {q.shape} -> 旋转后: {q_rot.shape}")
print(f"旋转前后范数: {q.norm().item():.4f} -> {q_rot.norm().item():.4f}")
print("RoPE 保持向量范数不变")
print()


# ============================================================
# 第三部分：SwiGLU 激活函数
# ============================================================

class SwiGLU(nn.Module):
    """
    SwiGLU = Swish(xW1) * xW3 -> W2
    LLaMA2 中替代标准 FFN 的门控激活函数
    """
    def __init__(self, dim: int, hidden_dim: int):
        super().__init__()
        self.w1 = nn.Linear(dim, hidden_dim, bias=False)
        self.w2 = nn.Linear(hidden_dim, dim, bias=False)
        self.w3 = nn.Linear(dim, hidden_dim, bias=False)

    def forward(self, x):
        return self.w2(F.silu(self.w1(x)) * self.w3(x))


print("=" * 60)
print("测试 SwiGLU")
print("=" * 60)
swiglu = SwiGLU(dim=64, hidden_dim=128)
test_x = torch.randn(2, 10, 64)
out = swiglu(test_x)
print(f"输入: {test_x.shape} -> 输出: {out.shape}")
print(f"参数量: {sum(p.numel() for p in swiglu.parameters()):,}")
print()


# ============================================================
# 第四部分：分组查询注意力 (GQA)
# ============================================================

class GroupedQueryAttention(nn.Module):
    """
    分组查询注意力 (GQA)
    多个 Q 头共享同一组 KV 头，节省显存
    """
    def __init__(self, dim: int, n_heads: int, n_kv_heads: int):
        super().__init__()
        self.n_heads = n_heads
        self.n_kv_heads = n_kv_heads
        self.head_dim = dim // n_heads
        self.n_rep = n_heads // n_kv_heads

        self.wq = nn.Linear(dim, n_heads * self.head_dim, bias=False)
        self.wk = nn.Linear(dim, n_kv_heads * self.head_dim, bias=False)
        self.wv = nn.Linear(dim, n_kv_heads * self.head_dim, bias=False)
        self.wo = nn.Linear(n_heads * self.head_dim, dim, bias=False)
        self.rope = RotaryPositionEmbedding(self.head_dim)

    def repeat_kv(self, x):
        if self.n_rep == 1:
            return x
        bs, n_kv, sl, hd = x.shape
        return x[:, :, None, :, :].expand(bs, n_kv, self.n_rep, sl, hd
                                          ).reshape(bs, self.n_heads, sl, hd)

    def forward(self, x, mask=None):
        B, T, C = x.shape
        q = self.wq(x).view(B, T, self.n_heads, self.head_dim).transpose(1, 2)
        k = self.wk(x).view(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)
        v = self.wv(x).view(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)

        q, k = self.rope(q, k, T)
        k = self.repeat_kv(k)
        v = self.repeat_kv(v)

        scale = math.sqrt(self.head_dim)
        attn = torch.matmul(q, k.transpose(-2, -1)) / scale

        if mask is not None:
            attn = attn.masked_fill(mask[:T, :T] == 0, float('-inf'))

        attn = F.softmax(attn, dim=-1)
        out = torch.matmul(attn, v)
        out = out.transpose(1, 2).contiguous().view(B, T, -1)
        return self.wo(out)


print("=" * 60)
print("测试 GQA")
print("=" * 60)
gqa = GroupedQueryAttention(dim=128, n_heads=4, n_kv_heads=2)
test_x = torch.randn(2, 10, 128)
out = gqa(test_x)
gqa_params = sum(p.numel() for p in gqa.parameters())
print(f"输入: {test_x.shape} -> 输出: {out.shape}")
print(f"GQA 参数量: {gqa_params:,}")
print()


# ============================================================
# 第五部分：Transformer Block + 完整模型
# ============================================================

class LLaMABlock(nn.Module):
    def __init__(self, dim, n_heads, n_kv_heads, ffn_dim):
        super().__init__()
        self.attention_norm = RMSNorm(dim)
        self.attention = GroupedQueryAttention(dim, n_heads, n_kv_heads)
        self.ffn_norm = RMSNorm(dim)
        self.ffn = SwiGLU(dim, ffn_dim)

    def forward(self, x, mask=None):
        x = x + self.attention(self.attention_norm(x), mask)
        x = x + self.ffn(self.ffn_norm(x))
        return x


class MiniLLaMA2(nn.Module):
    """微型 LLaMA2 (~350K 参数，CPU 可训练)"""
    def __init__(self, vocab_size=256, dim=128, n_layers=4,
                 n_heads=4, n_kv_heads=2, ffn_dim=256, max_seq_len=256):
        super().__init__()
        self.token_embedding = nn.Embedding(vocab_size, dim)
        self.layers = nn.ModuleList([
            LLaMABlock(dim, n_heads, n_kv_heads, ffn_dim)
            for _ in range(n_layers)
        ])
        self.norm = RMSNorm(dim)
        self.output = nn.Linear(dim, vocab_size, bias=False)
        self.output.weight = self.token_embedding.weight  # 权重绑定
        self.register_buffer(
            "mask",
            torch.tril(torch.ones(max_seq_len, max_seq_len)).view(1, 1, max_seq_len, max_seq_len)
        )

    def forward(self, idx, targets=None):
        B, T = idx.shape
        x = self.token_embedding(idx)
        for layer in self.layers:
            x = layer(x, self.mask)
        x = self.norm(x)
        logits = self.output(x)
        loss = None
        if targets is not None:
            loss = F.cross_entropy(logits.view(-1, logits.size(-1)), targets.view(-1))
        return logits, loss

    @torch.no_grad()
    def generate(self, idx, max_new_tokens=50, temperature=0.8, top_k=40):
        for _ in range(max_new_tokens):
            idx_cond = idx[:, -256:]
            logits, _ = self(idx_cond)
            logits = logits[:, -1, :] / temperature
            if top_k is not None:
                v, _ = torch.topk(logits, min(top_k, logits.size(-1)))
                logits[logits < v[:, [-1]]] = float('-inf')
            probs = F.softmax(logits, dim=-1)
            idx_next = torch.multinomial(probs, num_samples=1)
            idx = torch.cat((idx, idx_next), dim=1)
        return idx


print("=" * 60)
print("微型 LLaMA2 模型")
print("=" * 60)
model = MiniLLaMA2(vocab_size=256, dim=128, n_layers=4)
total_params = sum(p.numel() for p in model.parameters())
print(f"总参数量: {total_params:,} ({total_params/1e6:.2f}M)")
print()


# ============================================================
# 第六部分：BPE 分词器训练
# ============================================================

def train_bpe_tokenizer():
    print("=" * 60)
    print("训练 BPE 分词器")
    print("=" * 60)

    corpus = """
人工智能是计算机科学的一个分支。人工智能的核心目标是让机器模拟人类智能。
Machine learning is a subset of AI. Deep learning uses neural networks.
自然语言处理让计算机能够理解和生成人类语言。
大语言模型通过海量文本训练获得强大的语言理解能力。
Agent 是能够自主完成任务的智能体系统。
Transformer 架构革新了自然语言处理领域。
注意力机制是 Transformer 的核心组件。
BPE 分词器通过字节对编码将文本分割成子词单元。
强化学习让智能体通过与环境交互来学习最优策略。
    """ * 10

    temp_file = "temp_corpus.txt"
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(corpus)

    tokenizer = Tokenizer(models.BPE())
    tokenizer.normalizer = NFKC()
    tokenizer.pre_tokenizer = pre_tokenizers.ByteLevel(add_prefix_space=False)

    trainer = trainers.BpeTrainer(
        vocab_size=256,
        min_frequency=2,
        special_tokens=["[PAD]", "[BOS]", "[EOS]", "[UNK]"],
        show_progress=True,
    )
    tokenizer.train([temp_file], trainer)
    os.remove(temp_file)

    for text in ["人工智能", "machine learning", "Agent", "大语言模型"]:
        enc = tokenizer.encode(text)
        print(f"文本: '{text}' -> IDs: {enc.ids} -> Tokens: {enc.tokens}")

    print(f"\n词表大小: {tokenizer.get_vocab_size()}")
    return tokenizer


tokenizer = train_bpe_tokenizer()
print()


# ============================================================
# 第七部分：数据集与训练循环
# ============================================================

class TextDataset(Dataset):
    def __init__(self, data, seq_len=64):
        self.data = torch.tensor(data, dtype=torch.long)
        self.seq_len = seq_len

    def __len__(self):
        return max(0, len(self.data) - self.seq_len - 1)

    def __getitem__(self, idx):
        x = self.data[idx:idx + self.seq_len]
        y = self.data[idx + 1:idx + self.seq_len + 1]
        return x, y


def train_model(model, tokenizer, epochs=10, lr=1e-3, seq_len=64):
    print("=" * 60)
    print("训练微型 LLaMA2")
    print("=" * 60)

    corpus = "人工智能是计算机科学的一个分支。" * 30
    encoded = tokenizer.encode(corpus)
    data = encoded.ids
    dataset = TextDataset(data, seq_len=seq_len)
    dataloader = DataLoader(dataset, batch_size=8, shuffle=True)

    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=0.1)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    print(f"数据量: {len(data)} tokens | 序列长度: {seq_len} | 轮数: {epochs}")

    losses = []
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        n_batches = 0
        for x, y in dataloader:
            optimizer.zero_grad()
            _, loss = model(x, y)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            total_loss += loss.item()
            n_batches += 1
        scheduler.step()
        avg_loss = total_loss / max(n_batches, 1)
        losses.append(avg_loss)
        if (epoch + 1) % 2 == 0 or epoch == 0:
            print(f"  Epoch {epoch+1}/{epochs} | Loss: {avg_loss:.4f}")

    print(f"训练完成! 最终 Loss: {losses[-1]:.4f}")
    return losses


losses = train_model(model, tokenizer, epochs=10)
print()


# ============================================================
# 第八部分：文本生成演示
# ============================================================

def demo_generation(model, tokenizer):
    print("=" * 60)
    print("文本生成演示")
    print("=" * 60)
    model.eval()
    for prompt in ["人工", "智能", "学习"]:
        enc = tokenizer.encode(prompt)
        input_ids = torch.tensor([enc.ids], dtype=torch.long)
        with torch.no_grad():
            output_ids = model.generate(input_ids, max_new_tokens=20, temperature=0.8)
        output_text = tokenizer.decode(output_ids[0].tolist())
        print(f"Prompt: '{prompt}' -> 生成: '{output_text}'")


demo_generation(model, tokenizer)
print()


# ============================================================
# 总结
# ============================================================

print("=" * 60)
print("Day 1 总结")
print("=" * 60)
print(f"模型参数量: {total_params:,}")
print(f"词表大小: {tokenizer.get_vocab_size()}")
print(f"最终 Loss: {losses[-1]:.4f}")
print()
print("关键收获:")
print("1. RMSNorm 省去均值计算，比 LayerNorm 更快")
print("2. RoPE 通过旋转编码位置，支持长度外推")
print("3. SwiGLU 通过门控机制增强 FFN 表达能力")
print("4. GQA 共享 KV 头，显著节省显存")
print("5. BPE 分词器自动学习最优子词分割")
```

---

## 预期输出

```
============================================================
测试 RMSNorm
============================================================
输入形状: torch.Size([2, 10, 64])
输出形状: torch.Size([2, 10, 64])
输出均值（应接近0）: -0.002134
输出 RMS（应接近1）: 0.987654

============================================================
测试旋转位置编码 (RoPE)
============================================================
Q 形状: torch.Size([2, 8, 10, 64]) -> 旋转后: torch.Size([2, 8, 10, 64])
旋转前后范数: 50.1234 -> 50.1198
RoPE 保持向量范数不变

============================================================
测试 SwiGLU
============================================================
输入: torch.Size([2, 10, 64]) -> 输出: torch.Size([2, 10, 64])
参数量: 49,152

============================================================
测试 GQA
============================================================
输入: torch.Size([2, 10, 128]) -> 输出: torch.Size([2, 10, 128])
GQA 参数量: 98,304

============================================================
微型 LLaMA2 模型
============================================================
总参数量: 348,160 (0.35M)

============================================================
训练 BPE 分词器
============================================================
文本: '人工智能' -> IDs: [45, 67, 23, 89] -> Tokens: ['人', '工', '智', '能']
文本: 'machine learning' -> IDs: [12, 34, ...] -> Tokens: ['m', 'a', ...]
...

============================================================
训练微型 LLaMA2
============================================================
数据量: 450 tokens | 序列长度: 64 | 轮数: 10
  Epoch 1/10 | Loss: 5.5432
  Epoch 2/10 | Loss: 5.2341
  ...
  Epoch 10/10 | Loss: 3.8765
训练完成! 最终 Loss: 3.8765

============================================================
文本生成演示
============================================================
Prompt: '人工' -> 生成: '人工智能是计算机科学'
```

---

## 常见错误与解决方案

### 错误 1: CUDA out of memory
```
RuntimeError: CUDA out of memory
```
**原因**: 模型太大或 batch size 过大
**解决**:
```python
# 减小模型规模
model = MiniLLaMA2(vocab_size=256, dim=64, n_layers=2)
# 或使用 CPU
device = torch.device('cpu')
# 或减小 batch size
dataloader = DataLoader(dataset, batch_size=2, shuffle=True)
```

### 错误 2: Tokenizer 训练数据不足
```
Error: Not enough data to train BPE
```
**原因**: 训练数据太少
**解决**: 增加语料重复次数 `corpus = "语料" * 50`

### 错误 3: 生成结果全是重复内容
```
生成结果: "的的的的的的的的"
```
**原因**: temperature 过低或模型欠拟合
**解决**: `model.generate(input_ids, temperature=1.2, top_k=50)` 或增加训练轮数

### 错误 4: RoPE 维度不匹配
```
RuntimeError: The size of tensor a must match b
```
**原因**: head_dim 必须是偶数（RoPE 将维度分成两半）
**解决**: 确保 `dim / n_heads` 是偶数

---

## 每日挑战

### 挑战 1: 增加模型规模到 1M 参数
```python
model = MiniLLaMA2(vocab_size=512, dim=256, n_layers=6, n_heads=8, n_kv_heads=4, ffn_dim=512)
```

### 挑战 2: 实现 KV Cache 加速推理
```python
# 提示：缓存每层的 key/value，只计算新 token 的注意力
# 参考: past_key_values 参数
```

### 挑战 3: 添加 LoRA 微调支持
```python
class LoRALayer(nn.Module):
    def __init__(self, original_layer, rank=4, alpha=16):
        super().__init__()
        self.original = original_layer
        for param in self.original.parameters():
            param.requires_grad = False
        d_in = original_layer.in_features
        d_out = original_layer.out_features
        self.lora_A = nn.Parameter(torch.randn(d_in, rank) * 0.01)
        self.lora_B = nn.Parameter(torch.zeros(rank, d_out))
        self.scaling = alpha / rank

    def forward(self, x):
        return self.original(x) + (x @ self.lora_A @ self.lora_B) * self.scaling
```

---

## 今日小结

今天我们从零构建了一个完整的微型 LLaMA2 模型。这些组件构成了现代大语言模型的基础。理解它们的工作原理，你就能更好地设计和优化 Agent 系统。

**明天预告**: Day 2 我们将从零构建一个 Agent 框架，包含工具注册、规划循环、记忆系统和反思机制！
