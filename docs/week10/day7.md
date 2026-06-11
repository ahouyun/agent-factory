# 📅 Week 10 Day 7：Week Review — Agentic RL 总结

---

## 🧭 今日方向

今天是第十周的最后一天，我们回顾本周学习的 Agentic RL 核心概念，梳理关键知识点，总结实践经验，并为下周的学习做准备。

**核心问题：** 本周我们学到了什么？这些知识如何应用到实际项目中？

---

## 🎯 生活比喻

- **本周学习** = 学习了一门新手艺（大模型微调）
- **今天复盘** = 整理笔记、总结心得、规划下一步
- **知识串联** = 把零散的技能点串成完整的技能树

---

## 📋 今日三件事

1. **回顾本周核心概念**——形成完整的知识体系
2. **梳理关键技术对比**——明确各技术的适用场景
3. **制定后续学习计划**——从入门到精通的路径

---

## 🗺️ 手把手路线

### 第一步：回顾知识图谱

```
第十周知识体系:
─────────────────────────────────────────────────────

大模型训练全流程
├── 预训练 (Pre-training)
│   └── 海量文本，学习语言能力
├── 监督微调 (SFT)
│   ├── 指令数据格式
│   └── PyTorch 手写训练循环
├── 奖励模型 (Reward Model)
│   ├── Bradley-Terry 损失
│   └── 偏好对比数据
└── RLHF / 对齐
    ├── PPO (传统方法)
    ├── DPO (直接偏好优化)
    └── GRPO (组相对策略优化)

参数高效微调 (PEFT)
├── LoRA
│   ├── 低秩分解原理
│   ├── rank 和 alpha 参数
│   └── 目标模块选择
├── QLoRA
│   ├── 4-bit NF4 量化
│   ├── 双重量化
│   └── 分页优化器
└── Hugging Face PEFT 库

数据工程
├── 数据格式规范
│   ├── SFT 格式
│   ├── 偏好格式
│   └── RLHF 格式
├── 数据清洗
│   ├── 文本清洗
│   ├── 质量过滤
│   └── 去重处理
└── 数据合成
    └── LLM 辅助生成

评测方法
├── 困惑度 (Perplexity)
├── 自动评测 (BLEU, ROUGE)
├── 人工评测
└── A/B 对比分析
```

---

## 💻 代码区

### 代码 1：本周核心公式回顾

```python
"""
Day 7 - 本周核心公式回顾
整理所有关键公式和概念
"""

import torch
import torch.nn.functional as F
import numpy as np

print("=" * 60)
print("第十周核心公式回顾")
print("=" * 60)

# ============================================================
# 1. 语言模型训练目标
# ============================================================
print("\n1. 语言模型训练目标")
print("-" * 40)
print("""
  预训练目标 (自回归):
    L_pretrain = -Σ log P(x_t | x_1, ..., x_{t-1}; θ)

  SFT 目标 (指令微调):
    L_sft = -Σ log P(y_t | x, y_1, ..., y_{t-1}; θ)
    其中 x 是指令，y 是回答

  直觉: 让模型学会"给定指令，生成正确回答"
""")

# 数值演示
log_probs = torch.tensor([-0.5, -0.3, -0.8, -0.2])
sft_loss = -log_probs.mean()
print(f"  示例 SFT 损失: {-log_probs.mean():.4f}")
print(f"  各 token 损失: {-log_probs.tolist()}")

# ============================================================
# 2. 奖励模型损失
# ============================================================
print("\n2. 奖励模型损失 (Bradley-Terry)")
print("-" * 40)
print("""
  Bradley-Terry 损失:
    L_rm = -log σ(r(x, y_w) - r(x, y_l))

  其中:
    r(x, y) = 奖励模型对 (prompt, response) 的评分
    y_w = 优选回答 (chosen)
    y_l = 劣选回答 (rejected)
    σ = sigmoid 函数

  直觉: 让优选回答的分数高于劣选回答
""")

# 数值演示
reward_chosen = torch.tensor([2.5, 3.0, 1.8])
reward_rejected = torch.tensor([0.5, 1.0, 0.8])
bt_loss = -torch.log(torch.sigmoid(reward_chosen - reward_rejected)).mean()
print(f"  优选分数: {reward_chosen.tolist()}")
print(f"  劣选分数: {reward_rejected.tolist()}")
print(f"  Bradley-Terry 损失: {bt_loss.item():.4f}")

# ============================================================
# 3. DPO 损失
# ============================================================
print("\n3. DPO 损失 (Direct Preference Optimization)")
print("-" * 40)
print("""
  DPO 损失:
    L_dpo = -log σ(β * (log π_θ(y_w|x)/π_ref(y_w|x)
                       - log π_θ(y_l|x)/π_ref(y_l|x)))

  等价形式 (去除常数):
    L_dpo = -log σ(β * Δ)
    其中 Δ = log π_θ(y_w|x) - log π_θ(y_l|x)
            - (log π_ref(y_w|x) - log π_ref(y_l|x))

  直觉:
    - 不需要显式训练奖励模型
    - 直接从偏好数据中学习策略
    - β 控制偏离参考策略的程度
""")

# 数值演示
policy_chosen = torch.tensor([-0.5, -0.3, -0.4])
policy_rejected = torch.tensor([-1.5, -1.2, -1.8])
ref_chosen = torch.tensor([-0.8, -0.7, -0.9])
ref_rejected = torch.tensor([-0.9, -0.8, -0.85])

beta = 0.1
chosen_ratio = policy_chosen - ref_chosen
rejected_ratio = policy_rejected - ref_rejected
logits = beta * (chosen_ratio - rejected_ratio)
dpo_loss = -F.logsigmoid(logits).mean()

print(f"  β = {beta}")
print(f"  优选 log 比值: {chosen_ratio.tolist()}")
print(f"  劣选 log 比值: {rejected_ratio.tolist()}")
print(f"  DPO 损失: {dpo_loss.item():.4f}")

# ============================================================
# 4. LoRA 数学
# ============================================================
print("\n4. LoRA 数学原理")
print("-" * 40)
print("""
  LoRA (Low-Rank Adaptation):
    W' = W + ΔW = W + B × A

  其中:
    W ∈ R^(d×k): 原始权重矩阵（冻结）
    A ∈ R^(r×k): 低秩矩阵（可训练）
    B ∈ R^(d×r): 低秩矩阵（可训练）
    r << d: 秩（rank）
    α: 缩放因子

  可训练参数: 2 × d × r（远小于 d × k）

  前向传播:
    h = Wx + (BAx) × (α/r)
""")

# 参数量计算
d, k = 4096, 4096
for r in [4, 8, 16, 32]:
    original = d * k
    lora = r * k + d * r
    ratio = lora / original * 100
    print(f"  rank={r:2d}: LoRA参数={lora:>10,}, 占比={ratio:.2f}%")

# ============================================================
# 5. PPO 目标函数
# ============================================================
print("\n5. PPO 目标函数 (RLHF)")
print("-" * 40)
print("""
  PPO 目标:
    J(θ) = E[min(r_t(θ) * A_t, clip(r_t(θ), 1-ε, 1+ε) * A_t)]
           - β * KL(π_θ || π_ref)

  其中:
    r_t(θ) = π_θ(a_t|s_t) / π_old(a_t|s_t): 概率比
    A_t: 优势函数
    ε: 裁剪范围（通常 0.2）
    β: KL 惩罚系数

  直觉:
    - 最大化奖励
    - 限制策略更新幅度（裁剪）
    - 防止偏离参考策略太远（KL 惩罚）
""")
```

### 代码 2：技术选择决策树

```python
"""
Day 7 - 技术选择决策树
帮助你根据实际情况选择合适的技术方案
"""

print("=" * 60)
print("技术选择决策树")
print("=" * 60)

def select_method(requirements):
    """
    根据需求选择合适的技术方案

    Args:
        requirements: 需求字典
    """
    print("\n  技术选择建议:")
    print("-" * 40)

    # 1. 选择对齐方法
    if requirements.get("has_reward_model"):
        if requirements.get("large_scale", False):
            alignment = "GRPO（DeepSeek 推荐）"
        else:
            alignment = "RLHF (PPO)"
    else:
        if requirements.get("quick_iteration", False):
            alignment = "DPO（最简单）"
        else:
            alignment = "DPO 或 GRPO"

    print(f"  对齐方法: {alignment}")

    # 2. 选择微调方法
    gpu_memory = requirements.get("gpu_memory_gb", 8)

    if gpu_memory >= 24:
        peft = "LoRA (r=16-32)"
    elif gpu_memory >= 12:
        peft = "QLoRA (r=8-16)"
    elif gpu_memory >= 6:
        peft = "QLoRA (r=4-8, 4-bit 量化)"
    else:
        peft = "CPU 推理 + 云端微调"

    print(f"  微调方法: {peft}")

    # 3. 选择模型规模
    task_complexity = requirements.get("task_complexity", "medium")

    if task_complexity == "simple":
        model = "0.5B-1B 模型"
    elif task_complexity == "medium":
        model = "3B-7B 模型"
    else:
        model = "13B+ 模型"

    print(f"  模型规模: {model}")

    # 4. 数据量建议
    method = requirements.get("method", "sft")

    if method == "sft":
        if task_complexity == "simple":
            data = "500-2000 条高质量指令数据"
        elif task_complexity == "medium":
            data = "2000-10000 条指令数据"
        else:
            data = "10000+ 条指令数据"
    elif method in ["dpo", "grpo"]:
        data = "1000-5000 条偏好对比数据"
    else:
        data = "根据具体任务确定"

    print(f"  数据量: {data}")

    return alignment, peft, model, data

# ============================================================
# 示例：不同场景的技术选择
# ============================================================

scenarios = [
    {
        "name": "场景 1: 个人学习项目",
        "requirements": {
            "gpu_memory_gb": 8,
            "task_complexity": "simple",
            "quick_iteration": True,
            "has_reward_model": False,
            "method": "sft",
        }
    },
    {
        "name": "场景 2: 公司内部工具",
        "requirements": {
            "gpu_memory_gb": 24,
            "task_complexity": "medium",
            "quick_iteration": False,
            "has_reward_model": False,
            "method": "dpo",
        }
    },
    {
        "name": "场景 3: 大规模对齐研究",
        "requirements": {
            "gpu_memory_gb": 80,
            "task_complexity": "complex",
            "quick_iteration": False,
            "has_reward_model": True,
            "large_scale": True,
            "method": "grpo",
        }
    },
]

for scenario in scenarios:
    print(f"\n  {scenario['name']}")
    print("  " + "=" * 40)
    select_method(scenario["requirements"])
```

### 代码 3：本周关键概念速查表

```python
"""
Day 7 - 关键概念速查表
快速回顾本周所有核心概念
"""

print("=" * 60)
print("关键概念速查表")
print("=" * 60)

concepts = {
    "SFT": {
        "定义": "监督微调，用指令-回答对训练模型",
        "数据格式": "messages: [{role, content}, ...]",
        "损失函数": "交叉熵损失 (Cross-Entropy Loss)",
        "适用场景": "教模型遵循特定指令格式",
        "关键参数": "learning_rate=2e-5, epochs=2-3",
    },
    "RLHF": {
        "定义": "基于人类反馈的强化学习",
        "核心组件": "策略模型 + 奖励模型 + 参考模型",
        "损失函数": "PPO 目标函数 + KL 惩罚",
        "适用场景": "大规模对齐，InstructGPT",
        "关键参数": "β=0.1, clip_range=0.2",
    },
    "DPO": {
        "定义": "直接偏好优化，跳过奖励模型",
        "核心思想": "从偏好数据直接学习策略",
        "损失函数": "DPO 损失 (Bradley-Terry 变体)",
        "适用场景": "中小规模对齐，快速迭代",
        "关键参数": "β=0.1",
    },
    "GRPO": {
        "定义": "组相对策略优化 (DeepSeek)",
        "核心创新": "组内相对排名，无需价值函数",
        "损失函数": "PPO 变体 + 组内 baseline",
        "适用场景": "大规模对齐，DeepSeek 系列",
        "关键参数": "group_size=8-32",
    },
    "LoRA": {
        "定义": "低秩适应，参数高效微调",
        "核心公式": "W' = W + B×A",
        "可训练参数": "2×d×r（远小于 d×k）",
        "适用场景": "GPU 显存有限时的微调",
        "关键参数": "r=8-32, alpha=2×r",
    },
    "QLoRA": {
        "定义": "量化 LoRA，4-bit 量化 + LoRA",
        "核心创新": "NF4 量化 + 双重量化",
        "显存节省": "比 LoRA 再节省 4 倍",
        "适用场景": "消费级 GPU 微调大模型",
        "关键参数": "bnb_4bit_quant_type='nf4'",
    },
    "Perplexity": {
        "定义": "困惑度，衡量语言模型预测能力",
        "计算公式": "PPL = exp(-1/N × Σ log P(x_i|x_<i))",
        "取值范围": "越低越好，理想值→1",
        "适用场景": "评估语言建模能力",
        "局限性": "不直接反映回答质量",
    },
    "BLEU": {
        "定义": "双语评估替换，机器翻译常用指标",
        "计算方式": "n-gram 精度的几何平均",
        "取值范围": "0-1，越高越好",
        "适用场景": "翻译、文本生成评估",
        "局限性": "不考虑语义相似度",
    },
    "ROUGE": {
        "定义": "召回导向的摘要评估",
        "计算方式": "基于最长公共子序列",
        "常见变体": "ROUGE-1, ROUGE-2, ROUGE-L",
        "适用场景": "文本摘要评估",
        "局限性": "对同义词不敏感",
    },
}

for concept, info in concepts.items():
    print(f"\n  {concept}")
    print("  " + "-" * 40)
    for key, value in info.items():
        print(f"    {key}: {value}")

# ============================================================
# 本周学习成果自测
# ============================================================
print("\n" + "=" * 60)
print("本周学习成果自测")
print("=" * 60)

quiz = [
    {
        "question": "1. SFT 的数据格式是什么？",
        "answer": "messages: [{role: 'system/user/assistant', content: '...'}, ...]"
    },
    {
        "question": "2. Bradley-Terry 损失的公式是什么？",
        "answer": "L = -log σ(r_chosen - r_rejected)"
    },
    {
        "question": "3. DPO 相比 RLHF 的主要优势是什么？",
        "answer": "不需要训练奖励模型，直接从偏好数据学习，训练更简单稳定"
    },
    {
        "question": "4. LoRA 的核心思想是什么？",
        "answer": "权重更新矩阵是低秩的，用两个小矩阵 B×A 近似全量更新"
    },
    {
        "question": "5. QLoRA 的三板斧是什么？",
        "answer": "NF4 量化 + 双重量化 + 分页优化器"
    },
    {
        "question": "6. 为什么 LoRA 的 B 矩阵初始化为零？",
        "answer": "确保初始时 ΔW=0，模型行为与原始模型一致，训练稳定"
    },
    {
        "question": "7. 困惑度（Perplexity）的含义是什么？",
        "answer": "模型在每个位置平均有 PPL 个等概率候选词，越低表示预测越确定"
    },
    {
        "question": "8. 何时使用 DPO vs GRPO？",
        "answer": "DPO 适合中小规模、快速迭代；GRPO 适合大规模、需要强对齐"
    },
]

for q in quiz:
    print(f"\n  {q['question']}")
    print(f"  答案: {q['answer']}")
```

### 代码 4：后续学习路径

```python
"""
Day 7 - 后续学习路径
规划从入门到精通的学习路线
"""

print("=" * 60)
print("后续学习路径")
print("=" * 60)

# ============================================================
# 学习路径规划
# ============================================================
print("\n1. Agentic RL 进阶学习路径")
print("-" * 40)

learning_path = """
  ┌─────────────────────────────────────────────────────────┐
  │                    学习路径规划                          │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │  第一阶段：基础巩固（1-2 周）                            │
  │  ├── 复习 PyTorch 基础                                  │
  │  ├── 深入理解 Transformer 架构                          │
  │  └── 完成至少 2 个微调实验                               │
  │                                                         │
  │  第二阶段：进阶学习（2-4 周）                            │
  │  ├── 学习更多对齐方法（RLCD, KTO, IPO）                 │
  │  ├── 探索 Agent 训练（ReAct, Tool-use）                 │
  │  └── 学习多模态微调（Vision-Language Model）             │
  │                                                         │
  │  第三阶段：实战项目（4-8 周）                            │
  │  ├── 构建领域专属助手                                   │
  │  ├── 参与开源项目贡献                                   │
  │  └── 发表技术博客或论文                                 │
  │                                                         │
  │  第四阶段：前沿探索（持续）                              │
  │  ├── 跟进最新论文和开源模型                             │
  │  ├── 尝试新发布的框架和工具                             │
  │  └── 参与社区讨论和知识分享                             │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
"""
print(learning_path)

# ============================================================
# 推荐资源
# ============================================================
print("\n2. 推荐学习资源")
print("-" * 40)

resources = {
    "论文": [
        "InstructGPT (OpenAI, 2022) - RLHF 奠基论文",
        "LoRA (Hu et al., 2021) - 参数高效微调",
        "DPO (Rafailov et al., 2023) - 直接偏好优化",
        "QLoRA (Dettmers et al., 2023) - 量化 LoRA",
        "DeepSeek-Math (2024) - GRPO 方法",
    ],
    "开源框架": [
        "Hugging Face TRL - RLHF/DPO 训练框架",
        "Hugging Face PEFT - 参数高效微调",
        "LLaMA-Factory - 一站式微调框架",
        "Axolotl - 简化微调流程",
    ],
    "数据集": [
        "Alpaca - 指令微调数据集",
        "Dolly - 人工标注指令数据",
        "HH-RLHF - Anthropic 偏好数据",
        "UltraFeedback - 大规模偏好数据",
    ],
    "社区": [
        "Hugging Face 社区",
        "r/LocalLLaMA (Reddit)",
        "GitHub Issues/Discussions",
        "技术博客和教程",
    ],
}

for category, items in resources.items():
    print(f"\n  {category}:")
    for item in items:
        print(f"    - {item}")

# ============================================================
# 实践建议
# ============================================================
print("\n3. 实践建议")
print("-" * 40)

advice = """
  关键建议：
  ─────────────────────────────────────────────────
  1. 动手实践 > 理论学习
     - 至少完成 3 个完整的微调实验
     - 用不同的数据集和配置
     - 记录每次实验的结果

  2. 数据质量 > 数据数量
     - 100 条高质量数据 > 10000 条低质量数据
     - 投入时间清洗和筛选数据
     - 使用数据合成扩充优质数据

  3. 从小模型开始
     - 0.5B-3B 模型适合快速迭代
     - 验证想法后再扩展到大模型
     - 消费级 GPU 也能做很多事情

  4. 评测驱动开发
     - 建立自动化的评测流水线
     - 不要只看 loss，要关注实际效果
     - 进行 A/B 对比测试

  5. 关注社区和最新进展
     - 订阅相关论文和博客
     - 参与开源项目
     - 分享自己的经验和发现
"""
print(advice)
```

---

## 📤 预期输出

```
============================================================
第十周核心公式回顾
============================================================

1. 语言模型训练目标
----------------------------------------
  预训练目标: L = -Σ log P(x_t | x_1, ..., x_{t-1}; θ)
  SFT 目标: L = -Σ log P(y_t | x, y_1, ..., y_{t-1}; θ)

2. 奖励模型损失 (Bradley-Terry)
----------------------------------------
  优选分数: [2.5, 3.0, 1.8]
  劣选分数: [0.5, 1.0, 0.8]
  Bradley-Terry 损失: 0.3133

3. DPO 损失
----------------------------------------
  β = 0.1
  DPO 损失: 0.0067

4. LoRA 数学原理
----------------------------------------
  rank= 4: LoRA参数=    32,768, 占比=0.20%
  rank= 8: LoRA参数=    65,536, 占比=0.39%
  rank=16: LoRA参数=   131,072, 占比=0.78%
  rank=32: LoRA参数=   262,144, 占比=1.56%

============================================================
技术选择决策树
============================================================

  场景 1: 个人学习项目
  对齐方法: DPO（最简单）
  微调方法: QLoRA (r=4-8, 4-bit 量化)
  模型规模: 0.5B-1B 模型
  数据量: 500-2000 条高质量指令数据

  场景 2: 公司内部工具
  对齐方法: DPO 或 GRPO
  微调方法: LoRA (r=16-32)
  模型规模: 3B-7B 模型
  数据量: 1000-5000 条偏好对比数据
```

---

## ⚠️ 常见误区

### 误区 1：微调万能论
**错误想法：** 微调可以让任何模型做好任何事
**正确认知：**
- 微调只能在预训练能力范围内优化
- 基础模型不具备的能力，微调很难教会
- 选择合适的基座模型比微调更重要

### 误区 2：数据越多越好
**错误想法：** 增加数据量一定能提升效果
**正确认知：**
- 数据质量远比数量重要
- 低质量数据可能降低模型性能
- 100 条精选数据可能优于 10000 条噪声数据

### 误区 3：Loss 下降 = 效果提升
**错误想法：** 训练 loss 降低说明模型变好了
**正确认知：**
- Loss 只是训练指标，不代表实际效果
- 过拟合时 loss 很低但效果很差
- 必须结合评测指标综合判断

### 误区 4：越大越好
**错误想法：** 模型越大、rank 越高、epoch 越多越好
**正确认知：**
- 要根据任务复杂度选择合适的规模
- 过大的模型可能过拟合
- 从小规模开始，逐步验证

---

## 🏋️ 每日挑战（本周总结挑战）

1. **知识梳理**：画一张思维导图，整理本周学习的所有核心概念及其关系。

2. **项目实践**：选择一个你感兴趣的领域，从数据准备到模型评测，完成一次完整的微调实验。

3. **分享输出**：写一篇技术博客，总结你在 Agentic RL 学习中的收获和踩坑经验。

4. **下周预习**：了解下周的学习内容，提前准备相关环境和数据。
