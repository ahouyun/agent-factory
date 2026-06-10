# 📅 Week 10 Day 2：LoRA / QLoRA 高效微调原理

## 🧭 今日方向
> 掌握 LoRA 和 QLoRA 的核心思想，学会用极少的参数量微调大模型，降低显存需求。

## 🎯 生活比喻
> 想象你要修改一本 500 页的教科书。Full Fine-tuning 相当于把整本书重新抄一遍（改所有参数）；LoRA 相当于在书页边缘贴便利贴，只写需要修改的批注（低秩矩阵）；QLoRA 相当于先用缩印版（量化模型）来贴批注，省纸又省空间。三者的区别在于"改多少"和"占多少空间"。

## 📋 今日三件事
1. 理解 LoRA 的低秩分解原理（为什么可以只训练 0.1% 的参数）
2. 掌握 QLoRA 的量化 + LoRA 组合方案（4bit 训练）
3. 动手实现一个 LoRA 层并验证参数量对比

## 🗺️ 手把手路线

### Step 1：理解矩阵低秩分解
- 做什么: 学习 SVD 分解，理解为什么大矩阵可以用两个小矩阵近似
- 为什么: LoRA 的核心就是低秩分解，不理解这个就无法理解 LoRA
- 成功标志: 能手算一个 4x4 矩阵的低秩近似

### Step 2：理解 LoRA 层
- 做什么: 学习 LoRA 如何在原始权重旁插入低秩旁路
- 为什么: 这是高效微调的核心创新
- 成功标志: 能画出 LoRA 的结构图并标注参数量

### Step 3：理解 QLoRA
- 做什么: 学习 4-bit 量化原理 + NF4 数据类型 + 双重量化
- 为什么: QLoRA 让单张消费级 GPU 也能微调大模型
- 成功标志: 能解释 QLoRA 比 LoRA 省多少显存

### Step 4：代码实践
- 做什么: 从零实现 LoRA 层，对比参数量
- 为什么: 代码是最好的理解方式
- 成功标志: 代码跑通，输出参数量对比表

## 💻 代码区

```python
"""
从零实现 LoRA 和 QLoRA 的核心原理
不依赖 PEFT 库，手动实现 LoRA 层
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Optional, Tuple
import math

# ========== 1. 原始线性层 vs LoRA 层 ==========

class OriginalLinear(nn.Module):
    """原始的全连接层"""
    def __init__(self, in_features: int, out_features: int):
        super().__init__()
        self.weight = nn.Parameter(torch.randn(out_features, in_features))
        self.bias = nn.Parameter(torch.randn(out_features))
    
    def forward(self, x):
        return F.linear(x, self.weight, self.bias)
    
    def num_parameters(self):
        return self.weight.numel() + self.bias.numel()


class LoRALinear(nn.Module):
    """
    LoRA 线性层
    核心思想：W' = W + B @ A，其中 A, B 是低秩矩阵
    训练时冻结原始权重 W，只训练 A 和 B
    """
    def __init__(
        self,
        in_features: int,
        out_features: int,
        rank: int = 4,
        alpha: float = 1.0,
        dropout: float = 0.1
    ):
        super().__init__()
        # 原始权重（冻结，不训练）
        self.weight = nn.Parameter(
            torch.randn(out_features, in_features), requires_grad=False
        )
        self.bias = nn.Parameter(
            torch.randn(out_features), requires_grad=False
        )
        
        # LoRA 旁路：低秩矩阵 A 和 B
        self.lora_A = nn.Parameter(torch.randn(rank, in_features))
        self.lora_B = nn.Parameter(torch.zeros(out_features, rank))
        
        # 缩放因子
        self.scaling = alpha / rank
        
        # Dropout
        self.dropout = nn.Dropout(dropout) if dropout > 0 else nn.Identity()
        
        # 初始化
        nn.init.kaiming_uniform_(self.lora_A, a=math.sqrt(5))
        nn.init.zeros_(self.lora_B)
    
    def forward(self, x):
        # 原始路径
        original_output = F.linear(x, self.weight, self.bias)
        
        # LoRA 路径
        lora_output = F.linear(F.linear(self.dropout(x), self.lora_A), self.lora_B)
        
        return original_output + lora_output * self.scaling
    
    def num_parameters(self):
        """只计算可训练参数"""
        return self.lora_A.numel() + self.lora_B.numel()


# ========== 2. 低秩分解的数学原理 ==========

def demonstrate_low_rank():
    """演示低秩分解的原理"""
    print("低秩分解演示")
    print("=" * 50)
    
    # 创建一个低秩矩阵
    m, k, n = 8, 8, 8
    rank = 2
    
    # 生成一个秩为 rank 的矩阵
    A = torch.randn(m, rank)
    B = torch.randn(rank, n)
    W_low_rank = A @ B  # 秩为 rank 的矩阵
    
    print(f"原始矩阵形状: {W_low_rank.shape}")
    print(f"矩阵的秩: {torch.linalg.matrix_rank(W_low_rank).item()}")
    
    # Full 参数量
    full_params = m * n
    # LoRA 参数量
    lora_params = m * rank + rank * n
    
    print(f"\nFull 参数量: {full_params}")
    print(f"LoRA 参数量 (rank={rank}): {lora_params}")
    print(f"压缩比: {lora_params/full_params*100:.1f}%")
    
    # SVD 分解
    U, S, Vh = torch.linalg.svd(W_low_rank)
    print(f"\nSVD 分解后:")
    print(f"  U 形状: {U.shape}")
    print(f"  S (奇异值): {S.tolist()}")
    print(f"  Vh 形状: {Vh.shape}")


# ========== 3. QLoRA：量化 + LoRA ==========

def demonstrate_qlora_concept():
    """演示 QLoRA 的概念（不实际量化，用模拟展示）"""
    print("\nQLoRA 概念演示")
    print("=" * 50)
    
    # 模拟量化过程
    W = torch.randn(4, 4)
    print(f"原始权重 (FP32, 32bit):")
    print(f"  占用内存: {W.element_size() * W.numel()} bytes")
    print(f"  数据类型: float32")
    
    # 模拟 INT8 量化
    W_int8 = W.to(torch.int8)
    print(f"\n量化后 (INT8, 8bit):")
    print(f"  占用内存: {W_int8.element_size() * W_int8.numel()} bytes")
    print(f"  压缩比: {W_int8.element_size() / W.element_size() * 100:.1f}%")
    
    # 模拟 INT4 量化（QLoRA 使用的精度）
    print(f"\nQLoRA 使用的 NF4 量化 (4bit):")
    print(f"  理论占用: {W.numel() * 0.5} bytes (4bit = 0.5 byte)")
    print(f"  压缩比: {(0.5 / W.element_size()) * 100:.1f}%")
    
    # 显存对比
    print("\n7B 模型显存对比:")
    print(f"  FP32: {7 * 1024**3 / 1024**3:.1f} GB")
    print(f"  FP16: {7 * 2 / 1024**3 * 1024**3:.1f} GB")
    print(f"  INT8: {7 * 1 / 1024**3 * 1024**3:.1f} GB")
    print(f"  INT4 (QLoRA): {7 * 0.5 / 1024**3 * 1024**3:.2f} GB")


# ========== 4. 完整的 LoRA 微调流程 ==========

class SimpleTransformerBlock(nn.Module):
    """简化的 Transformer Block"""
    def __init__(self, d_model=128, n_heads=4):
        super().__init__()
        self.attention = nn.MultiheadAttention(d_model, n_heads, batch_first=True)
        self.norm1 = nn.LayerNorm(d_model)
        self.ff = nn.Sequential(
            nn.Linear(d_model, d_model * 4),
            nn.ReLU(),
            nn.Linear(d_model * 4, d_model)
        )
        self.norm2 = nn.LayerNorm(d_model)
    
    def forward(self, x):
        attn_out, _ = self.attention(x, x, x)
        x = self.norm1(x + attn_out)
        ff_out = self.ff(x)
        x = self.norm2(x + ff_out)
        return x


def apply_lora_to_model():
    """展示如何给模型添加 LoRA"""
    print("\nLoRA 应用演示")
    print("=" * 50)
    
    # 创建原始模型
    d_model = 128
    model = SimpleTransformerBlock(d_model=d_model)
    
    # 计算原始参数量
    total_params = sum(p.numel() for p in model.parameters())
    print(f"原始模型参数量: {total_params:,}")
    
    # 模拟 LoRA 应用
    lora_rank = 4
    lora_params = 2 * d_model * lora_rank  # A + B 矩阵
    print(f"\nLoRA 配置:")
    print(f"  Rank: {lora_rank}")
    print(f"  每层 LoRA 参数: {lora_params:,}")
    print(f"  可训练参数占比: {lora_params/total_params*100:.2f}%")
    
    # LoRA 微调的优势
    print(f"\nLoRA 微调优势:")
    print(f"  1. 显存占用: 只需存储 LoRA 参数的梯度")
    print(f"  2. 训练速度: 冻结原始权重，减少计算量")
    print(f"  3. 模型合并: W' = W + B@A，推理无额外开销")


# ========== 5. LoRA 参数选择指南 ==========

def lora_rank_guide():
    """LoRA rank 选择指南"""
    print("\nLoRA Rank 选择指南")
    print("=" * 50)
    
    ranks = [2, 4, 8, 16, 32, 64]
    d_model = 2048  # 典型的大模型维度
    
    print(f"假设 d_model = {d_model}:")
    print(f"{'Rank':<8}{'参数量':<15}{'占 d_model^2 比例':<20}{'适用场景'}")
    print("-" * 70)
    
    scenarios = {
        2: "简单分类/NER",
        4: "基础指令微调",
        8: "复杂指令微调",
        16: "多任务学习",
        32: "领域适应",
        64: "接近全参数微调"
    }
    
    for rank in ranks:
        params = d_model * rank * 2  # A + B
        ratio = params / (d_model ** 2) * 100
        scenario = scenarios[rank]
        print(f"{rank:<8}{params:<15,}{ratio:<20.2f}%{scenario}")


if __name__ == "__main__":
    # 运行所有演示
    demonstrate_low_rank()
    demonstrate_qlora_concept()
    apply_lora_to_model()
    lora_rank_guide()
    
    # 实际的 LoRA 层测试
    print("\n" + "=" * 50)
    print("LoRA 层功能测试")
    print("=" * 50)
    
    in_features, out_features = 64, 64
    rank = 4
    
    # 原始层
    original = OriginalLinear(in_features, out_features)
    # LoRA 层
    lora = LoRALinear(in_features, out_features, rank=rank)
    
    # 测试输入
    x = torch.randn(2, 10, in_features)
    
    # 前向传播
    with torch.no_grad():
        out_original = original(x)
        out_lora = lora(x)
    
    print(f"\n输入形状: {x.shape}")
    print(f"输出形状: {out_original.shape}")
    print(f"原始层参数量: {original.num_parameters():,}")
    print(f"LoRA 可训练参数: {lora.num_parameters():,}")
    print(f"参数压缩比: {lora.num_parameters()/original.num_parameters()*100:.1f}%")
    print(f"\n输出是否接近 (初始化时): {torch.allclose(out_original, out_lora, atol=0.1)}")
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | LoRA 微调后效果差 | 增大 rank，检查学习率，增加训练步数 |
| 2 | 显存仍然不够 | 使用 QLoRA (4-bit)，减小 batch_size |
| 3 | LoRA 模型合并后异常 | 检查 scaling 参数，确保 lora_B 初始化为零 |
| 4 | 训练 loss 震荡 | 降低学习率，增加 warmup 步骤 |
| 5 | 不知道选什么 rank | 从 rank=8 开始，根据任务复杂度调整 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| LoRA | 通过低秩矩阵旁路实现高效微调 |
| Rank | LoRA 矩阵的秩，控制参数量和表达能力 |
| Alpha | LoRA 的缩放因子，通常等于 rank |
| QLoRA | 量化基础模型 + LoRA 微调的组合方案 |
| NF4 | QLoRA 使用的 4-bit NormalFloat 数据类型 |
| 双重量化 | 对量化常数再次量化的技术 |
| Adapter | 另一种高效微调方法，在层间插入小模块 |
| Prefix Tuning | 在输入前添加可训练前缀向量 |
| Full Fine-tuning | 更新所有模型参数的微调方式 |

## ✅ 验收清单
- [ ] 能解释 LoRA 的低秩分解原理
- [ ] 能手算 LoRA 参数量 vs 全参数量
- [ ] 能解释 QLoRA 如何降低显存需求
- [ ] 代码实现的 LoRA 层能正确运行
- [ ] 能根据任务选择合适的 rank

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
