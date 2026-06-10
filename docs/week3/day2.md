# 📅 Week 3 Day 2：Transformer 架构：自注意力机制（概念级）

## 🧭 今日方向
> 今天我们将从概念层面理解 Transformer 架构和自注意力机制，这是现代大模型的核心技术。

## 🎯 生活比喻
> 自注意力机制就像在阅读时，眼睛会自动关注与当前词相关的其他词。比如读到"它"时，眼睛会回看"它"指的是什么。

## 📋 今日三件事
1. 理解 Transformer 的整体架构
2. 学习自注意力机制的原理
3. 了解位置编码的作用

## 🗺️ 手把手路线

### Step 1: Transformer 架构概览
- **做什么**: 了解 Transformer 的 Encoder-Decoder 结构
- **为什么**: 这是理解大模型的基础
- **成功标志**: 能画出 Transformer 的简化结构图

### Step 2: 自注意力机制
- **做什么**: 理解 Q、K、V 的概念和计算过程
- **为什么**: 自注意力是 Transformer 的核心创新
- **成功标志**: 能解释自注意力的计算步骤

### Step 3: 位置编码
- **做什么**: 了解为什么需要位置编码
- **为什么**: Transformer 不像 RNN 那样有顺序信息
- **成功标志**: 理解位置编码的作用

## 💻 代码区

```python
# 自注意力机制概念演示

import numpy as np
from typing import List, Tuple

class SelfAttention:
    """
    自注意力机制的概念实现
    
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

# 位置编码（简化版正弦余弦编码）
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

def demo_self_attention():
    """自注意力机制演示"""
    print("=== 自注意力机制演示 ===\n")
    
    # 设置参数
    seq_len = 4  # 序列长度
    embed_dim = 8  # 嵌入维度
    
    # 模拟输入（4个词的嵌入）
    np.random.seed(42)
    x = np.random.randn(seq_len, embed_dim)
    
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

def demo_positional_encoding():
    """位置编码演示"""
    print("\n=== 位置编码演示 ===\n")
    
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

def demo_attention_flow():
    """注意力流程演示"""
    print("\n=== 注意力计算流程 ===\n")
    
    # 简化的例子
    # 假设有3个词: "我", "喜欢", "编程"
    
    words = ["我", "喜欢", "编程"]
    embed_dim = 4
    
    # 模拟词嵌入
    np.random.seed(123)
    word_embeddings = np.random.randn(3, embed_dim)
    
    print("词嵌入:")
    for i, word in enumerate(words):
        print(f"  {word}: {word_embeddings[i].round(2)}")
    
    # 简化的注意力计算
    # Q, K, V (使用相同权重简化演示)
    W = np.random.randn(embed_dim, embed_dim) * 0.5
    
    Q = word_embeddings @ W
    K = word_embeddings @ W
    V = word_embeddings @ W
    
    # 计算注意力分数
    scores = Q @ K.T / np.sqrt(embed_dim)
    
    # Softmax
    exp_scores = np.exp(scores - np.max(scores, axis=-1, keepdims=True))
    attn_weights = exp_scores / np.sum(exp_scores, axis=-1, keepdims=True)
    
    print("\n注意力权重:")
    print("(行: 当前词, 列: 关注的词)")
    print("     ", end="")
    for word in words:
        print(f"{word:>6}", end="")
    print()
    
    for i, word in enumerate(words):
        print(f"{word:>4} ", end="")
        for j in range(3):
            print(f"{attn_weights[i, j]:>6.3f}", end="")
        print()
    
    print("\n解读示例:")
    print("- '我' 对 '喜欢' 的关注度:", f"{attn_weights[0, 1]:.3f}")
    print("- '喜欢' 对 '编程' 的关注度:", f"{attn_weights[1, 2]:.3f}")

if __name__ == "__main__":
    demo_self_attention()
    demo_positional_encoding()
    demo_attention_flow()
```

```python
# Transformer 架构概念图

transformer_architecture = """
Transformer 架构概念图
=====================

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


关键概念
--------

1. Self-Attention (自注意力)
   - 每个词可以"看到"序列中的所有词
   - 通过 Q, K, V 计算注意力权重
   - 公式: Attention(Q, K, V) = softmax(QK^T / √d_k) V

2. Multi-Head Attention (多头注意力)
   - 多个注意力头并行计算
   - 每个头关注不同的信息
   - 最后拼接所有头的输出

3. Position Encoding (位置编码)
   - 为每个位置添加唯一的位置信息
   - 使用正弦/余弦函数生成
   - 让模型知道词的顺序

4. Feed-Forward Network (前馈网络)
   - 两层全连接网络
   - 激活函数通常是 ReLU
   - 对每个位置独立计算

5. Layer Normalization (层归一化)
   - 稳定训练过程
   - 加速收敛
   - 放在每个子层之后

6. Residual Connection (残差连接)
   - 缓解梯度消失问题
   - 保留原始信息
   - 公式: x + Sublayer(x)
"""

print(transformer_architecture)

# GPT vs BERT vs T5 对比
model_comparison = """
大模型架构对比
=============

1. GPT (Generative Pre-trained Transformer)
   - 架构: Decoder-only
   - 训练: 自回归语言建模
   - 应用: 文本生成
   - 特点: 单向注意力，适合生成任务

2. BERT (Bidirectional Encoder Representations from Transformers)
   - 架构: Encoder-only
   - 训练: 掩码语言建模
   - 应用: 文本理解、分类
   - 特点: 双向注意力，适合理解任务

3. T5 (Text-to-Text Transfer Transformer)
   - 架构: Encoder-Decoder
   - 训练: 文本到文本格式
   - 应用: 各种NLP任务
   - 特点: 统一的文本到文本格式

4. LLaMA (Large Language Model Meta AI)
   - 架构: Decoder-only (类似GPT)
   - 训练: 自回归语言建模
   - 应用: 开源大模型
   - 特点: 高效、开源

5. Claude (Anthropic)
   - 架构: Decoder-only (定制)
   - 训练: RLHF + Constitutional AI
   - 应用: 对话、任务
   - 特点: 安全、有帮助
"""

print(model_comparison)
```

```python
# 注意力可视化

import numpy as np
from typing import List

def create_attention_heatmap(
    words: List[str],
    attention_weights: np.ndarray,
    title: str = "注意力权重"
):
    """
    创建注意力热力图（文本版本）
    
    Args:
        words: 词列表
        attention_weights: 注意力权重矩阵
        title: 标题
    """
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

def simulate_transformer_attention():
    """模拟 Transformer 注意力"""
    print("=== Transformer 注意力可视化 ===\n")
    
    # 句子示例
    sentence = "The cat sat on the mat"
    words = sentence.split()
    
    # 模拟自注意力权重（实际由模型计算）
    np.random.seed(42)
    
    # 创建更真实的注意力模式
    n = len(words)
    attention = np.random.rand(n, n)
    
    # 让对角线更强（每个词更关注自己）
    for i in range(n):
        attention[i, i] += 2.0
    
    # 让相邻词之间有更强的联系
    for i in range(n):
        for j in range(max(0, i-2), min(n, i+3)):
            if i != j:
                attention[i, j] += 0.5
    
    # 归一化
    attention = attention / attention.sum(axis=-1, keepdims=True)
    
    create_attention_heatmap(words, attention, "自注意力权重")
    
    # 解释
    print("\n解释:")
    print("- 每行表示一个词对所有词的注意力分布")
    print("- 每行权重之和为1")
    print("- 模型通过注意力学习词与词之间的关系")

def demonstrate_multi_head():
    """多头注意力演示"""
    print("\n=== 多头注意力演示 ===\n")
    
    heads = [
        ("语法关注", ["主语", "谓语", "宾语"]),
        ("语义关注", ["名词", "动词", "形容词"]),
        ("位置关注", ["前文", "当前", "后文"]),
    ]
    
    for head_name, focus in heads:
        print(f"注意力头: {head_name}")
        print(f"  关注点: {', '.join(focus)}")
        print(f"  作用: 学习不同类型的关系")
        print()

if __name__ == "__main__":
    simulate_transformer_attention()
    demonstrate_multi_head()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 数值不稳定 | 使用 softmax 时减去最大值 |
| 2 | 维度不匹配 | 检查矩阵乘法的维度要求 |
| 3 | 梯度消失 | 理解残差连接和层归一化的作用 |
| 4 | 概念混淆 | 区分 Encoder 和 Decoder 的不同用途 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Transformer | 基于自注意力的序列到序列模型 |
| Self-Attention | 每个位置关注序列中所有位置 |
| Multi-Head | 多个注意力头并行计算 |
| Q, K, V | Query, Key, Value，注意力的三个输入 |
| Position Encoding | 为序列添加位置信息 |
| Residual Connection | 跳跃连接，保留原始信息 |
| Layer Normalization | 层归一化，稳定训练 |

## ✅ 验收清单
- [ ] 理解 Transformer 的整体架构
- [ ] 能解释自注意力机制的计算过程
- [ ] 理解位置编码的作用
- [ ] 了解不同大模型的架构差异

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
