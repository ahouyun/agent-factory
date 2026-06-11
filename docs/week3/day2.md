# Day 2: Transformer 架构 + 自注意力机制

## 今日学习目标

1. 理解 Transformer 的整体架构
2. 学习自注意力机制的原理
3. 理解 Q、K、V 的概念
4. 了解位置编码的作用
5. 理解多头注意力的意义

---

## 第一部分：为什么需要 Transformer？

### 传统模型的局限

```
RNN/LSTM 的问题：
1. 无法并行计算（必须按顺序处理）
2. 长距离依赖问题（信息会丢失）
3. 训练速度慢

Transformer 的优势：
1. 可以并行计算（所有位置同时处理）
2. 长距离依赖（通过注意力直接连接）
3. 训练速度快
```

### Transformer 架构图

```
Transformer 架构
================

输入序列
    ↓
┌─────────────────────────────────────┐
│           输入嵌入层                  │
│    (Input Embedding + Pos Encoding) │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│          Encoder (N层)               │
│  ┌───────────────────────────────┐  │
│  │    Multi-Head Self-Attention  │  │
│  └───────────────────────────────┘  │
│              ↓                       │
│  ┌───────────────────────────────┐  │
│  │    Add & Layer Normalization  │  │
│  └───────────────────────────────┘  │
│              ↓                       │
│  ┌───────────────────────────────┐  │
│  │    Feed-Forward Network       │  │
│  └───────────────────────────────┘  │
│              ↓                       │
│  ┌───────────────────────────────┐  │
│  │    Add & Layer Normalization  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│          Decoder (N层)               │
│  ┌───────────────────────────────┐  │
│  │    Masked Multi-Head Attention│  │
│  └───────────────────────────────┘  │
│              ↓                       │
│  ┌───────────────────────────────┐  │
│  │    Multi-Head Attention       │  │
│  │    (Encoder-Decoder Attention)│  │
│  └───────────────────────────────┘  │
│              ↓                       │
│  ┌───────────────────────────────┐  │
│  │    Feed-Forward Network       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│           输出层                     │
│      (Linear + Softmax)             │
└─────────────────────────────────────┘
    ↓
输出序列
```

---

## 第二部分：自注意力机制

### 什么是自注意力？

**类比理解：**
自注意力就像阅读时的眼睛移动：
- 读到"它"时，眼睛会回看"它"指的是什么
- 读到"北京"时，可能会关注"中国"
- 每个词都会"关注"序列中所有其他词

### 自注意力计算

```
自注意力公式：
Attention(Q, K, V) = softmax(QK^T / √d_k) V

其中：
- Q (Query): 查询向量，表示"我在找什么"
- K (Key): 键向量，表示"我包含什么信息"
- V (Value): 值向量，表示"我能提供什么"
- d_k: 向量维度
```

### 文件：app/transformer/attention.py

```python
"""
自注意力机制实现
"""

import numpy as np
from typing import Tuple, List


class SelfAttention:
    """
    自注意力机制
    
    用于演示原理，非高效实现
    """
    
    def __init__(self, embed_dim: int):
        """
        初始化自注意力层
        
        Args:
            embed_dim: 嵌入维度
        """
        self.embed_dim = embed_dim
        
        # 随机初始化权重矩阵（实际应用中需要训练）
        np.random.seed(42)
        self.W_q = np.random.randn(embed_dim, embed_dim) * 0.1  # Query 权重
        self.W_k = np.random.randn(embed_dim, embed_dim) * 0.1  # Key 权重
        self.W_v = np.random.randn(embed_dim, embed_dim) * 0.1  # Value 权重
    
    def softmax(self, x: np.ndarray) -> np.ndarray:
        """Softmax 函数"""
        exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
        return exp_x / np.sum(exp_x, axis=-1, keepdims=True)
    
    def forward(self, x: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        前向传播
        
        Args:
            x: 输入序列，形状 (seq_len, embed_dim)
        
        Returns:
            输出和注意力权重
        """
        seq_len = x.shape[0]
        
        # 1. 计算 Q, K, V
        Q = x @ self.W_q  # (seq_len, embed_dim)
        K = x @ self.W_k  # (seq_len, embed_dim)
        V = x @ self.W_v  # (seq_len, embed_dim)
        
        # 2. 计算注意力分数
        # scores = Q @ K^T / sqrt(d_k)
        scores = Q @ K.T / np.sqrt(self.embed_dim)  # (seq_len, seq_len)
        
        # 3. 应用 Softmax 得到注意力权重
        attention_weights = self.softmax(scores)  # (seq_len, seq_len)
        
        # 4. 加权求和
        output = attention_weights @ V  # (seq_len, embed_dim)
        
        return output, attention_weights


class MultiHeadAttention:
    """
    多头注意力机制
    
    多个注意力头并行计算，每个头关注不同的信息
    """
    
    def __init__(self, embed_dim: int, num_heads: int):
        """
        初始化多头注意力
        
        Args:
            embed_dim: 嵌入维度
            num_heads: 注意力头数量
        """
        assert embed_dim % num_heads == 0, "embed_dim 必须能被 num_heads 整除"
        
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        
        # 初始化权重
        np.random.seed(42)
        self.W_q = np.random.randn(embed_dim, embed_dim) * 0.1
        self.W_k = np.random.randn(embed_dim, embed_dim) * 0.1
        self.W_v = np.random.randn(embed_dim, embed_dim) * 0.1
        self.W_o = np.random.randn(embed_dim, embed_dim) * 0.1
    
    def softmax(self, x: np.ndarray) -> np.ndarray:
        """Softmax 函数"""
        exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
        return exp_x / np.sum(exp_x, axis=-1, keepdims=True)
    
    def forward(self, x: np.ndarray) -> Tuple[np.ndarray, List[np.ndarray]]:
        """
        前向传播
        
        Args:
            x: 输入序列，形状 (seq_len, embed_dim)
        
        Returns:
            输出和每个头的注意力权重
        """
        seq_len = x.shape[0]
        
        # 1. 计算 Q, K, V
        Q = x @ self.W_q
        K = x @ self.W_k
        V = x @ self.W_v
        
        # 2. 分割成多个头
        # (seq_len, embed_dim) -> (num_heads, seq_len, head_dim)
        Q = Q.reshape(seq_len, self.num_heads, self.head_dim).transpose(1, 0, 2)
        K = K.reshape(seq_len, self.num_heads, self.head_dim).transpose(1, 0, 2)
        V = V.reshape(seq_len, self.num_heads, self.head_dim).transpose(1, 0, 2)
        
        # 3. 计算注意力
        scores = Q @ K.transpose(0, 2, 1) / np.sqrt(self.head_dim)
        attention_weights = self.softmax(scores)
        
        # 4. 加权求和
        output = attention_weights @ V
        
        # 5. 合并多个头
        # (num_heads, seq_len, head_dim) -> (seq_len, embed_dim)
        output = output.transpose(1, 0, 2).reshape(seq_len, self.embed_dim)
        
        # 6. 输出投影
        output = output @ self.W_o
        
        return output, attention_weights


# 使用示例
if __name__ == "__main__":
    # 设置参数
    seq_len = 4  # 序列长度
    embed_dim = 8  # 嵌入维度
    num_heads = 2  # 注意力头数量
    
    # 模拟输入（4个词的嵌入）
    np.random.seed(42)
    x = np.random.randn(seq_len, embed_dim)
    
    print("=== 自注意力机制演示 ===\n")
    print(f"输入形状: {x.shape}")
    print(f"序列长度: {seq_len}")
    print(f"嵌入维度: {embed_dim}\n")
    
    # 创建自注意力层
    attention = SelfAttention(embed_dim)
    
    # 前向传播
    output, attn_weights = attention.forward(x)
    
    print("注意力权重矩阵:")
    print("(每一行表示一个词对其他词的关注程度)")
    print(attn_weights.round(3))
    print()
    
    print("输出形状:", output.shape)
    print("\n解释:")
    print("- 第0行: 第1个词对所有词的注意力分布")
    print("- 权重之和为1（每行加起来等于1）")
    print("- 值越大表示越关注对应的词")
    
    print("\n=== 多头注意力演示 ===\n")
    
    # 创建多头注意力层
    multi_head = MultiHeadAttention(embed_dim, num_heads)
    
    # 前向传播
    output, attn_weights = multi_head.forward(x)
    
    print(f"多头注意力输出形状: {output.shape}")
    print(f"注意力权重形状: {attn_weights.shape}")
    print(f"(头数: {num_heads}, 序列长度: {seq_len})")
```

---

## 第三部分：位置编码

### 为什么需要位置编码？

**问题：**
自注意力本身不关心顺序，"我爱你"和"你爱我"在注意力计算中是一样的。

**解决方案：**
为每个位置添加唯一的位置编码，让模型知道词的顺序。

### 位置编码公式

```
PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))

其中：
- pos: 词在序列中的位置
- i: 维度索引
- d_model: 嵌入维度
```

### 文件：app/transformer/positional_encoding.py

```python
"""
位置编码实现
"""

import numpy as np
from typing import List


class PositionalEncoding:
    """
    位置编码
    
    为序列中的每个位置添加位置信息
    """
    
    def __init__(self, embed_dim: int, max_len: int = 1000):
        """
        初始化位置编码
        
        Args:
            embed_dim: 嵌入维度
            max_len: 最大序列长度
        """
        self.embed_dim = embed_dim
        
        # 生成位置编码矩阵
        pe = np.zeros((max_len, embed_dim))
        position = np.arange(0, max_len).reshape(-1, 1)
        div_term = np.exp(np.arange(0, embed_dim, 2) * -(np.log(10000.0) / embed_dim))
        
        pe[:, 0::2] = np.sin(position * div_term)  # 偶数维度
        pe[:, 1::2] = np.cos(position * div_term)  # 奇数维度
        
        self.pe = pe
    
    def get_encoding(self, seq_len: int) -> np.ndarray:
        """获取位置编码"""
        return self.pe[:seq_len]
    
    def add_positional_encoding(self, x: np.ndarray) -> np.ndarray:
        """
        添加位置编码到输入
        
        Args:
            x: 输入序列，形状 (seq_len, embed_dim)
        
        Returns:
            添加位置编码后的序列
        """
        seq_len = x.shape[0]
        return x + self.pe[:seq_len]


def demo_positional_encoding():
    """位置编码演示"""
    print("=== 位置编码演示 ===\n")
    
    embed_dim = 8
    max_len = 10
    
    pos_encoder = PositionalEncoding(embed_dim, max_len)
    
    # 获取前5个位置的编码
    encodings = pos_encoder.get_encoding(5)
    
    print(f"位置编码形状: {encodings.shape}")
    print(f"前5个位置的编码（前4维）:")
    print(encodings[:, :4].round(3))
    
    print("\n解释:")
    print("- 每个位置有唯一的位置编码")
    print("- 编码使用正弦和余弦函数")
    print("- 不同维度有不同的频率")


def demo_add_positional_encoding():
    """演示添加位置编码"""
    print("\n=== 添加位置编码 ===\n")
    
    seq_len = 4
    embed_dim = 8
    
    # 创建输入
    np.random.seed(42)
    x = np.random.randn(seq_len, embed_dim)
    
    print("原始输入:")
    print(x[:, :4].round(3))
    
    # 添加位置编码
    pos_encoder = PositionalEncoding(embed_dim)
    x_with_pos = pos_encoder.add_positional_encoding(x)
    
    print("\n添加位置编码后:")
    print(x_with_pos[:, :4].round(3))
    
    print("\n位置编码:")
    print(pos_encoder.get_encoding(seq_len)[:, :4].round(3))


# 使用示例
if __name__ == "__main__":
    demo_positional_encoding()
    demo_add_positional_encoding()
```

---

## 第四部分：Transformer 完整实现

### 文件：app/transformer/transformer.py

```python
"""
Transformer 架构实现
"""

import numpy as np
from typing import Tuple, List

from app.transformer.attention import SelfAttention, MultiHeadAttention
from app.transformer.positional_encoding import PositionalEncoding


class FeedForward:
    """前馈网络"""
    
    def __init__(self, embed_dim: int, ff_dim: int):
        """
        初始化前馈网络
        
        Args:
            embed_dim: 嵌入维度
            ff_dim: 前馈网络维度
        """
        self.embed_dim = embed_dim
        self.ff_dim = ff_dim
        
        # 初始化权重
        np.random.seed(42)
        self.W1 = np.random.randn(embed_dim, ff_dim) * 0.1
        self.b1 = np.zeros(ff_dim)
        self.W2 = np.random.randn(ff_dim, embed_dim) * 0.1
        self.b2 = np.zeros(embed_dim)
    
    def relu(self, x: np.ndarray) -> np.ndarray:
        """ReLU 激活函数"""
        return np.maximum(0, x)
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        前向传播
        
        Args:
            x: 输入，形状 (seq_len, embed_dim)
        
        Returns:
            输出，形状 (seq_len, embed_dim)
        """
        # 第一层
        h = x @ self.W1 + self.b1
        h = self.relu(h)
        
        # 第二层
        output = h @ self.W2 + self.b2
        
        return output


class TransformerBlock:
    """Transformer 块"""
    
    def __init__(self, embed_dim: int, num_heads: int, ff_dim: int):
        """
        初始化 Transformer 块
        
        Args:
            embed_dim: 嵌入维度
            num_heads: 注意力头数量
            ff_dim: 前馈网络维度
        """
        self.embed_dim = embed_dim
        
        # 多头注意力
        self.attention = MultiHeadAttention(embed_dim, num_heads)
        
        # 前馈网络
        self.feed_forward = FeedForward(embed_dim, ff_dim)
        
        # 层归一化参数
        np.random.seed(42)
        self.gamma1 = np.ones(embed_dim)
        self.beta1 = np.zeros(embed_dim)
        self.gamma2 = np.ones(embed_dim)
        self.beta2 = np.zeros(embed_dim)
    
    def layer_norm(self, x: np.ndarray, gamma: np.ndarray, beta: np.ndarray) -> np.ndarray:
        """层归一化"""
        mean = np.mean(x, axis=-1, keepdims=True)
        std = np.std(x, axis=-1, keepdims=True)
        return gamma * (x - mean) / (std + 1e-8) + beta
    
    def forward(self, x: np.ndarray) -> Tuple[np.ndarray, List[np.ndarray]]:
        """
        前向传播
        
        Args:
            x: 输入，形状 (seq_len, embed_dim)
        
        Returns:
            输出和注意力权重
        """
        # 1. 多头注意力
        attn_output, attn_weights = self.attention.forward(x)
        
        # 2. 残差连接 + 层归一化
        x = self.layer_norm(x + attn_output, self.gamma1, self.beta1)
        
        # 3. 前馈网络
        ff_output = self.feed_forward.forward(x)
        
        # 4. 残差连接 + 层归一化
        output = self.layer_norm(x + ff_output, self.gamma2, self.beta2)
        
        return output, attn_weights


class Transformer:
    """Transformer 模型"""
    
    def __init__(
        self,
        vocab_size: int,
        embed_dim: int,
        num_heads: int,
        num_layers: int,
        ff_dim: int,
        max_len: int = 512
    ):
        """
        初始化 Transformer
        
        Args:
            vocab_size: 词表大小
            embed_dim: 嵌入维度
            num_heads: 注意力头数量
            num_layers: Transformer 块数量
            ff_dim: 前馈网络维度
            max_len: 最大序列长度
        """
        self.embed_dim = embed_dim
        
        # 词嵌入
        np.random.seed(42)
        self.embedding = np.random.randn(vocab_size, embed_dim) * 0.1
        
        # 位置编码
        self.pos_encoding = PositionalEncoding(embed_dim, max_len)
        
        # Transformer 块
        self.blocks = [
            TransformerBlock(embed_dim, num_heads, ff_dim)
            for _ in range(num_layers)
        ]
        
        # 输出层
        self.output_layer = np.random.randn(embed_dim, vocab_size) * 0.1
    
    def forward(self, input_ids: np.ndarray) -> Tuple[np.ndarray, List[List[np.ndarray]]]:
        """
        前向传播
        
        Args:
            input_ids: 输入ID序列，形状 (seq_len,)
        
        Returns:
            输出 logits 和所有层的注意力权重
        """
        # 1. 词嵌入
        x = self.embedding[input_ids]
        
        # 2. 添加位置编码
        x = self.pos_encoding.add_positional_encoding(x)
        
        # 3. 通过 Transformer 块
        all_attention_weights = []
        for block in self.blocks:
            x, attn_weights = block.forward(x)
            all_attention_weights.append(attn_weights)
        
        # 4. 输出层
        logits = x @ self.output_layer
        
        return logits, all_attention_weights


# 使用示例
if __name__ == "__main__":
    print("=== Transformer 模型演示 ===\n")
    
    # 创建 Transformer
    vocab_size = 1000
    embed_dim = 64
    num_heads = 8
    num_layers = 4
    ff_dim = 256
    
    transformer = Transformer(
        vocab_size=vocab_size,
        embed_dim=embed_dim,
        num_heads=num_heads,
        num_layers=num_layers,
        ff_dim=ff_dim
    )
    
    print(f"词表大小: {vocab_size}")
    print(f"嵌入维度: {embed_dim}")
    print(f"注意力头数: {num_heads}")
    print(f"Transformer 块数: {num_layers}")
    print(f"前馈网络维度: {ff_dim}")
    
    # 创建输入
    seq_len = 10
    input_ids = np.random.randint(0, vocab_size, size=(seq_len,))
    
    print(f"\n输入序列长度: {seq_len}")
    
    # 前向传播
    logits, attention_weights = transformer.forward(input_ids)
    
    print(f"输出 logits 形状: {logits.shape}")
    print(f"注意力权重层数: {len(attention_weights)}")
    print(f"每层注意力权重形状: {attention_weights[0].shape}")
```

---

## 第五部分：注意力可视化

### 文件：app/transformer/visualization.py

```python
"""
Transformer 可视化
"""

import numpy as np
from typing import List


def create_attention_heatmap(
    words: List[str],
    attention_weights: np.ndarray,
    title: str = "注意力权重"
):
    """创建注意力热力图（文本版本）"""
    print(f"\n{title}")
    print("=" * 60)
    
    # 打印表头
    print("     ", end="")
    for word in words:
        print(f"{word:>8}", end="")
    print()
    print("-" * (8 * len(words) + 6))
    
    # 打印每行
    for i, word in enumerate(words):
        print(f"{word:>4} |", end="")
        for j in range(len(words)):
            weight = attention_weights[i, j]
            # 用星号表示权重大小
            stars = int(weight * 20)
            print(f"{'*' * stars:>8}", end="")
        print()
    
    print("\n注: 星号越多表示注意力权重越大")


def visualize_multi_head_attention(
    words: List[str],
    attention_weights: np.ndarray,
    num_heads: int
):
    """可视化多头注意力"""
    print("\n=== 多头注意力可视化 ===\n")
    
    seq_len = attention_weights.shape[-1]
    
    for head in range(num_heads):
        print(f"\n注意力头 {head + 1}:")
        head_weights = attention_weights[head]
        
        # 打印表头
        print("     ", end="")
        for word in words:
            print(f"{word:>8}", end="")
        print()
        
        # 打印权重
        for i, word in enumerate(words):
            print(f"{word:>4} |", end="")
            for j in range(seq_len):
                weight = head_weights[i, j]
                print(f"{weight:>8.3f}", end="")
            print()


def demonstrate_attention_patterns():
    """演示不同的注意力模式"""
    print("=== 注意力模式演示 ===\n")
    
    words = ["我", "喜欢", "学习", "Python"]
    
    # 模式1：局部注意力（每个词更关注自己和相邻词）
    local_attention = np.array([
        [0.5, 0.3, 0.15, 0.05],
        [0.3, 0.4, 0.2, 0.1],
        [0.15, 0.2, 0.45, 0.2],
        [0.05, 0.1, 0.2, 0.65]
    ])
    
    create_attention_heatmap(words, local_attention, "局部注意力")
    
    # 模式2：全局注意力（每个词关注所有词）
    global_attention = np.ones((4, 4)) / 4
    
    create_attention_heatmap(words, global_attention, "全局注意力")
    
    # 模式3：语法注意力（关注语法相关的词）
    syntax_attention = np.array([
        [0.7, 0.1, 0.1, 0.1],  # "我" 关注自己
        [0.2, 0.5, 0.2, 0.1],  # "喜欢" 关注自己
        [0.1, 0.3, 0.4, 0.2],  # "学习" 关注 "喜欢"
        [0.1, 0.1, 0.3, 0.5]   # "Python" 关注 "学习"
    ])
    
    create_attention_heatmap(words, syntax_attention, "语法注意力")


if __name__ == "__main__":
    demonstrate_attention_patterns()
```

---

## 验证清单

完成今日学习后，检查以下项目：

- [ ] 理解 Transformer 的整体架构
- [ ] 能解释自注意力机制的计算过程
- [ ] 理解 Q、K、V 的概念
- [ ] 理解位置编码的作用
- [ ] 理解多头注意力的意义
- [ ] 理解残差连接和层归一化
- [ ] 完成了注意力可视化练习

---

## 今日小结

| 概念 | 关键点 |
|------|--------|
| Transformer | 基于自注意力的序列到序列模型 |
| 自注意力 | 每个位置关注序列中所有位置 |
| Q, K, V | Query, Key, Value，注意力的三个输入 |
| 位置编码 | 为序列添加位置信息 |
| 多头注意力 | 多个注意力头并行计算 |
| 残差连接 | 跳跃连接，保留原始信息 |
| 层归一化 | 稳定训练过程 |

---

## 明日预告

明天我们将学习：
- 大模型概览
- GPT/Claude/LLaMA 对比
- 开源 vs 闭源模型
- 模型选择指南

---

## 参考资源

- [Attention Is All You Need 原论文](https://arxiv.org/abs/1706.03762)
- [Transformer 详解](https://jalammar.github.io/illustrated-transformer/)
- [可视化 Transformer](https://transformer-circuits.pub/)
