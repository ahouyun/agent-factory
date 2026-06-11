# 📅 Week 10 Day 2：LoRA/QLoRA + 小模型微调原理

---

## 🧭 今日方向

今天我们深入参数高效微调（PEFT）的核心技术——LoRA 和 QLoRA。这些技术让我们用极少的计算资源就能微调大模型，是实际工程中最常用的微调方案。

**核心问题：** 如何用一张消费级显卡（甚至 CPU）微调一个数十亿参数的大模型？

---

## 🎯 生活比喻

想象你要给一栋大楼（预训练模型）重新装修：

- **全量微调** = 把整栋楼拆了重建，成本极高、耗时极长
- **LoRA** = 只在关键房间（注意力层）装上可拆卸的模块，不动主体结构
- **QLoRA** = 先把不常用的房间锁起来（4-bit 量化），再在关键房间装模块

LoRA 的核心思想是：**大模型的权重更新矩阵是低秩的**，不需要更新全部参数，只需要更新一个低秩的"增量矩阵"即可。

---

## 📋 今日三件事

1. **理解 LoRA 的数学原理**——低秩分解与参数效率
2. **理解 QLoRA 的量化机制**——如何用 4-bit 存储 + 16-bit 训练
3. **掌握 Hugging Face PEFT 库的使用**——配置 LoRA 适配器

---

## 🗺️ 手把手路线

### 第一步：环境准备

```bash
pip install torch transformers datasets peft bitsandbytes accelerate
```

### 第二步：理解 LoRA 的数学原理

```
原始权重矩阵 W ∈ R^(d×k)（例如 4096×4096 = 16M 参数）

LoRA 分解:
  W' = W + ΔW = W + B × A

  其中:
    A ∈ R^(r×k)    例如 r=8, k=4096 → 32K 参数
    B ∈ R^(d×r)    例如 d=4096, r=8 → 32K 参数
    r << d          秩（rank），通常 4-64

  可训练参数: 2 × d × r = 2 × 4096 × 8 = 65K 参数
  占原始参数比例: 65K / 16M = 0.4%
```

---

## 💻 代码区

### 代码 1：LoRA 数学原理与手动实现

```python
"""
Day 2 - LoRA 数学原理与手动实现
不依赖 PEFT 库，用纯 PyTorch 演示 LoRA 的核心思想
"""

import torch
import torch.nn as nn
import math

print("=" * 60)
print("LoRA 数学原理与手动实现")
print("=" * 60)

# ============================================================
# 1. 原始线性层 vs LoRA 线性层
# ============================================================

class LoRALinear(nn.Module):
    """
    LoRA 线性层：在原始线性层旁添加低秩分解矩阵

    前向传播:
      h = W_0 @ x + (B @ A) @ x @ (alpha / r)

    其中:
      W_0: 原始权重矩阵（冻结，不训练）
      A, B: 低秩分解矩阵（可训练）
      alpha: 缩放因子
      r: 秩（rank）
    """

    def __init__(self, original_linear, r=8, alpha=16):
        super().__init__()
        self.original = original_linear
        self.original.weight.requires_grad = False  # 冻结原始权重

        in_features = original_linear.in_features
        out_features = original_linear.out_features

        # LoRA 分解矩阵
        self.lora_A = nn.Parameter(torch.randn(r, in_features) * (1 / math.sqrt(r)))
        self.lora_B = nn.Parameter(torch.zeros(out_features, r))
        self.scaling = alpha / r

    def forward(self, x):
        # 原始输出
        original_output = self.original(x)
        # LoRA 增量
        lora_output = (x @ self.lora_A.T @ self.lora_B.T) * self.scaling
        return original_output + lora_output


# 演示
print("\n1. LoRA 参数量对比")
print("-" * 40)

d, k = 4096, 4096  # 原始矩阵维度
r = 8               # LoRA 秩
alpha = 16          # 缩放因子

original_params = d * k
lora_params = r * k + d * r  # A矩阵 + B矩阵

print(f"  原始矩阵 W: {d} x {k} = {original_params:,} 参数")
print(f"  LoRA 矩阵 A: {r} x {k} = {r * k:,} 参数")
print(f"  LoRA 矩阵 B: {d} x {r} = {d * r:,} 参数")
print(f"  LoRA 总参数: {lora_params:,}")
print(f"  参数比例: {lora_params / original_params * 100:.2f}%")

# ============================================================
# 2. 不同 rank 的参数量对比
# ============================================================
print("\n2. 不同 rank 的参数量对比")
print("-" * 40)

for rank in [4, 8, 16, 32, 64]:
    lora_p = rank * k + d * rank
    ratio = lora_p / original_params * 100
    print(f"  rank={rank:2d}: {lora_p:>10,} 参数 ({ratio:.2f}%)")

# ============================================================
# 3. 手动实现 LoRA 微调
# ============================================================
print("\n3. 手动 LoRA 微调示例")
print("-" * 40)

# 创建一个原始线性层
original_linear = nn.Linear(512, 512)
print(f"  原始参数量: {sum(p.numel() for p in original_linear.parameters()):,}")

# 包装为 LoRA 层
lora_layer = LoRALinear(original_linear, r=8, alpha=16)
print(f"  LoRA 后参数量: {sum(p.numel() for p in lora_layer.parameters()):}")
print(f"  可训练参数量: {sum(p.numel() for p in lora_layer.parameters() if p.requires_grad):}")

# 冻结比例
total = sum(p.numel() for p in lora_layer.parameters())
trainable = sum(p.numel() for p in lora_layer.parameters() if p.requires_grad)
frozen = total - trainable
print(f"  冻结参数: {frozen:,} ({frozen/total*100:.1f}%)")
print(f"  可训练参数: {trainable:,} ({trainable/total*100:.1f}%)")

# ============================================================
# 4. LoRA 应用到 Transformer 注意力层
# ============================================================
print("\n4. LoRA 应用到 Transformer 注意力层")
print("-" * 40)

from transformers import AutoModelForCausalLM

print("""
  在 Transformer 中，LoRA 通常应用到以下层：

  1. 注意力层:
     - q_proj (Query 投影矩阵)
     - v_proj (Value 投影矩阵)
     - k_proj (Key 投影矩阵) -- 可选
     - o_proj (Output 投影矩阵) -- 可选

  2. FFN 层:
     - gate_proj (门控投影)
     - up_proj (上投影)
     - down_proj (下投影)

  推荐配置:
     target_modules = ["q_proj", "v_proj"]  # 最小配置，效果好
     target_modules = ["q_proj", "k_proj", "v_proj", "o_proj"]  # 全注意力
     target_modules = ["q_proj", "v_proj", "gate_proj", "up_proj", "down_proj"]  # 全部
""")

# ============================================================
# 5. LoRA 初始化策略
# ============================================================
print("5. LoRA 初始化策略")
print("-" * 40)
print("""
  A 矩阵: 高斯随机初始化（或 Kaiming 初始化）
  B 矩阵: 全零初始化

  为什么 B 初始化为零？
  - 初始时 ΔW = B @ A = 0
  - 模型行为与原始预训练模型完全一致
  - 训练过程中 B 逐渐学到有意义的值
  - 这确保了训练稳定性
""")

# 验证：B 初始化为零时，ΔW = 0
A_init = torch.randn(8, 512) * 0.01
B_init = torch.zeros(512, 8)  # 零初始化
delta_W = B_init @ A_init
print(f"  ΔW 的 Frobenius 范数: {delta_W.norm():.6f} (应为 0)")
```

### 代码 2：QLoRA 原理与 4-bit 量化

```python
"""
Day 2 - QLoRA 原理与 4-bit 量化
展示 QLoRA 如何进一步降低显存需求
"""

import torch
import torch.nn as nn

print("=" * 60)
print("QLoRA 原理与 4-bit 量化")
print("=" * 60)

# ============================================================
# 1. 显存占用分析
# ============================================================
print("\n1. 不同精度的显存占用")
print("-" * 40)

model_sizes = [
    ("0.5B", 0.5e9),
    ("1B", 1e9),
    ("3B", 3e9),
    ("7B", 7e9),
    ("13B", 13e9),
]

for name, params in model_sizes:
    fp32_mb = params * 4 / 1e6
    fp16_mb = params * 2 / 1e6
    int8_mb = params * 1 / 1e6
    int4_mb = params * 0.5 / 1e6
    print(f"  {name:>4s} 模型: FP32={fp32_mb:>7.0f}MB, "
          f"FP16={fp16_mb:>7.0f}MB, INT8={int8_mb:>7.0f}MB, INT4={int4_mb:>7.0f}MB")

# ============================================================
# 2. QLoRA 三板斧
# ============================================================
print("\n2. QLoRA 三板斧")
print("-" * 40)
print("""
  QLoRA（Quantized LoRA）的核心创新：

  1. 4-bit NormalFloat (NF4) 量化
     - 将预训练权重从 FP16 量化到 4-bit
     - 使用正态分布最优量化点
     - 显存占用降低 4 倍

  2. 双重量化（Double Quantization）
     - 对量化常数本身也进行量化
     - 进一步节省约 0.37 bit/参数

  3. 分页优化器（Paged Optimizer）
     - 使用 NVIDIA 统一内存处理显存溢出
     - 避免 OOM（Out of Memory）错误

  效果: 7B 模型可以在 24GB 显存的 GPU 上微调
""")

# ============================================================
# 3. 模拟 NF4 量化
# ============================================================
print("3. 模拟 NF4 量化过程")
print("-" * 40)

def simulate_nf4_quantize(tensor, group_size=64):
    """
    模拟 NF4 量化过程（简化版）
    实际实现使用 bitsandbytes 库
    """
    # 1. 分组
    flat = tensor.flatten()
    n_groups = (flat.numel() + group_size - 1) // group_size

    # 2. 每组独立量化到 4-bit（16 个量化级别）
    quantized = []
    scales = []
    for i in range(n_groups):
        group = flat[i * group_size: (i + 1) * group_size]
        max_val = group.abs().max()
        scale = max_val / 7.0  # 4-bit 有 16 个级别 [-8, 7]
        quantized_group = torch.clamp(torch.round(group / scale), -8, 7).to(torch.int8)
        quantized.append(quantized_group)
        scales.append(scale)

    return quantized, scales

# 测试量化
original = torch.randn(256)
quantized_groups, scales = simulate_nf4_quantize(original)

# 计算压缩率
original_bits = original.numel() * 16  # FP16
quantized_bits = original.numel() * 4 + len(scales) * 16  # 4-bit + scale
compression = original_bits / quantized_bits

print(f"  原始大小: {original_bits / 8:.0f} bytes (FP16)")
print(f"  量化后大小: ~{quantized_bits / 8:.0f} bytes (NF4)")
print(f"  压缩比: {compression:.2f}x")

# ============================================================
# 4. 显存节省计算
# ============================================================
print("\n4. 显存节省计算（以 7B 模型为例）")
print("-" * 40)

params_7b = 7e9
print(f"  7B 模型参数量: {params_7b:.0e}")
print(f"  FP16 训练: {params_7b * 2 / 1e9:.1f} GB (仅模型权重)")
print(f"  FP16 + Adam: {params_7b * (2 + 8) / 1e9:.1f} GB (模型 + 优化器)")
print(f"  QLoRA (NF4 + FP16 LoRA): ~{params_7b * 0.5 / 1e9 + 0.5:.1f} GB (4-bit 基座 + FP16 LoRA)")
print(f"  节省: ~{(params_7b * 10 / 1e9) - (params_7b * 0.5 / 1e9 + 0.5):.1f} GB")
```

### 代码 3：使用 PEFT 库配置 LoRA

```python
"""
Day 2 - 使用 Hugging Face PEFT 库配置 LoRA
实际工程中最常用的 LoRA 配置方式
"""

from peft import (
    LoraConfig,
    get_peft_model,
    TaskType,
    prepare_model_for_kbit_training,
)
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
)

print("=" * 60)
print("使用 PEFT 库配置 LoRA")
print("=" * 60)

# ============================================================
# 1. LoRA 配置参数详解
# ============================================================
print("\n1. LoRA 配置参数详解")
print("-" * 40)

lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,   # 因果语言模型任务
    r=8,                             # 秩（rank），越大越强但参数越多
    lora_alpha=32,                   # 缩放因子，通常 = 2 * r
    lora_dropout=0.1,                # LoRA 层的 dropout
    target_modules=[                 # 应用 LoRA 的层
        "q_proj",                    # Query 投影
        "v_proj",                    # Value 投影
        # "k_proj",                  # Key 投影（可选）
        # "o_proj",                  # Output 投影（可选）
        # "gate_proj",              # FFN 门控（可选）
        # "up_proj",                # FFN 上投影（可选）
        # "down_proj",              # FFN 下投影（可选）
    ],
    bias="none",                     # 不训练 bias
    modules_to_save=None,            # 额外需要训练的模块
)

print(f"  任务类型: {lora_config.task_type}")
print(f"  秩 (r): {lora_config.r}")
print(f"  缩放因子 (alpha): {lora_config.lora_alpha}")
print(f"  Dropout: {lora_config.lora_dropout}")
print(f"  目标模块: {lora_config.target_modules}")
print(f"  Bias: {lora_config.bias}")

# ============================================================
# 2. 常见 LoRA 配置方案
# ============================================================
print("\n2. 常见 LoRA 配置方案")
print("-" * 40)

configs = {
    "最小配置（推荐入门）": {
        "r": 8, "alpha": 16,
        "targets": ["q_proj", "v_proj"],
        "desc": "参数最少，效果够用"
    },
    "标准配置": {
        "r": 16, "alpha": 32,
        "targets": ["q_proj", "k_proj", "v_proj", "o_proj"],
        "desc": "全注意力层，效果好"
    },
    "高精度配置": {
        "r": 64, "alpha": 128,
        "targets": ["q_proj", "k_proj", "v_proj", "o_proj",
                     "gate_proj", "up_proj", "down_proj"],
        "desc": "全层 LoRA，效果最好但参数多"
    },
}

for name, cfg in configs.items():
    print(f"  {name}:")
    print(f"    r={cfg['r']}, alpha={cfg['alpha']}")
    print(f"    目标模块: {cfg['targets']}")
    print(f"    说明: {cfg['desc']}")
    print()

# ============================================================
# 3. QLoRA 配置（4-bit 量化 + LoRA）
# ============================================================
print("3. QLoRA 配置（4-bit 量化 + LoRA）")
print("-" * 40)

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,                    # 4-bit 量化加载
    bnb_4bit_quant_type="nf4",            # NF4 量化类型
    bnb_4bit_compute_dtype="float16",     # 计算精度
    bnb_4bit_use_double_quant=True,       # 双重量化
)

print(f"  量化类型: {bnb_config.bnb_4bit_quant_type}")
print(f"  计算精度: {bnb_config.bnb_4bit_compute_dtype}")
print(f"  双重量化: {bnb_config.bnb_4bit_use_double_quant}")
print()

# ============================================================
# 4. 完整的 QLoRA + SFT 配置示例
# ============================================================
print("4. 完整的 QLoRA + SFT 配置示例")
print("-" * 40)

code_example = '''
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer, SFTConfig

# 1. 量化配置
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype="float16",
    bnb_4bit_use_double_quant=True,
)

# 2. 加载量化模型
model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2-7B",
    quantization_config=bnb_config,
    device_map="auto",
)
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2-7B")

# 3. 准备量化训练
model = prepare_model_for_kbit_training(model)

# 4. LoRA 配置
lora_config = LoraConfig(
    r=16, lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

# 5. 应用 LoRA
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# 6. 训练
training_args = SFTConfig(
    output_dir="./output",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    learning_rate=2e-4,
    fp16=True,
)

trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
    processing_class=tokenizer,
)
trainer.train()
'''
print(code_example)

# ============================================================
# 5. 为什么微调小模型
# ============================================================
print("5. 为什么微调小模型（0.5B-3B）")
print("-" * 40)
print("""
  小模型微调的优势：
  ─────────────────────
  1. 推理速度快: 0.5B 模型推理速度是 70B 的 100+ 倍
  2. 部署成本低: 可以在消费级 GPU 甚至 CPU 上运行
  3. 适合嵌入式: 可以部署到手机、边缘设备
  4. 数据需求少: 小模型过拟合风险更低
  5. 迭代更快: 训练时间短，方便快速实验

  小模型微调的适用场景：
  ─────────────────────
  - 特定领域的问答系统
  - 简单的指令遵循任务
  - 分类、提取等结构化任务
  - 需要低延迟的在线服务
  - 数据量有限的垂直领域

  不适合的场景：
  ─────────────────────
  - 需要复杂推理的任务
  - 需要广泛知识的任务
  - 多语言、多任务场景
""")
```

---

## 📤 预期输出

```
============================================================
LoRA 数学原理与手动实现
============================================================

1. LoRA 参数量对比
----------------------------------------
  原始矩阵 W: 4096 x 4096 = 16,777,216 参数
  LoRA 矩阵 A: 8 x 4096 = 32,768 参数
  LoRA 矩阵 B: 4096 x 8 = 32,768 参数
  LoRA 总参数: 65,536
  参数比例: 0.39%

2. 不同 rank 的参数量对比
----------------------------------------
  rank= 4:     32,768 参数 (0.20%)
  rank= 8:     65,536 参数 (0.39%)
  rank=16:    131,072 参数 (0.78%)
  rank=32:    262,144 参数 (1.56%)
  rank=64:    524,288 参数 (3.13%)

============================================================
QLoRA 原理与 4-bit 量化
============================================================

1. 不同精度的显存占用
----------------------------------------
  0.5B 模型: FP32=   2000MB, FP16=   1000MB, INT8=    500MB, INT4=    250MB
     1B 模型: FP32=   4000MB, FP16=   2000MB, INT8=   1000MB, INT4=    500MB
     3B 模型: FP32=  12000MB, FP16=   6000MB, INT8=   3000MB, INT4=   1500MB
     7B 模型: FP32=  28000MB, FP16=  14000MB, INT8=   7000MB, INT4=   3500MB
    13B 模型: FP32=  52000MB, FP16=  26000MB, INT8=  13000MB, INT4=   6500MB
```

---

## ⚠️ 常见错误和解决方案

### 错误 1：bitsandbytes 在 Windows 上不支持
```
NotImplementedError: 8-bit and 4-bit quantization is not supported on CPU
```
**解决方案：**
- QLoRA 需要 NVIDIA GPU（CUDA）
- Windows 上可使用 WSL2 + CUDA
- 或使用 `pip install bitsandbytes-windows`（社区维护版本）

### 错误 2：LoRA 微调后模型效果变差
**解决方案：**
- 增大 rank（从 8 → 16 → 32）
- 添加更多目标模块（如 k_proj, o_proj）
- 检查学习率是否合适（QLoRA 通常用 1e-4 到 3e-4）
- 确保数据质量足够好

### 错误 3：target_modules 名称不匹配
```
ValueError: Target modules not found in model
```
**解决方案：**
- 查看模型结构：`print(model.named_modules())`
- 确认层名称是否正确（不同模型命名不同）
- 使用 `target_modules="all"` 匹配所有线性层

### 错误 4：训练时 loss 为 NaN
**解决方案：**
- 降低学习率
- 检查数据中是否有异常值
- 使用更稳定的优化器（如 paged_adamw_8bit）
- 确保 `bnb_4bit_compute_dtype` 设置正确

---

## 🏋️ 每日挑战

1. **计算挑战**：一个 7B 模型（d=4096, 隐藏层=32），使用 rank=16 的 LoRA 应用到 q_proj 和 v_proj，计算 LoRA 参数占总参数的比例。

2. **对比实验**：分别用 rank=4, 8, 16, 32 配置 LoRA，在同一数据集上微调，比较训练时间和最终效果。

3. **思考题**：为什么 LoRA 的 B 矩阵初始化为零，而 A 矩阵用随机初始化？如果反过来会怎样？
