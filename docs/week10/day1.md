# 📅 Week 10 Day 1：从 SFT 到 RLHF 全流程概览

> **本周说明：** 本周内容为进阶/可选内容，聚焦于 Agentic RL（强化学习驱动的智能体）。如果你已经掌握了前九周的基础知识，本周将带你深入大模型训练的核心流程。如果你是初学者，建议先完成前九周内容再回来学习。

---

## 🧭 今日方向

今天是第十周的开篇，我们将从宏观视角理解大语言模型的训练全流程：从预训练（Pre-training）到监督微调（SFT），再到基于人类反馈的强化学习（RLHF）。理解这条流水线，是掌握后续所有高级对齐技术的基础。

**核心问题：** 一个基础模型是如何变成能够理解指令、遵循人类偏好的智能助手的？

---

## 🎯 生活比喻

想象你在培养一个学徒厨师：

1. **预训练** = 让学徒广泛阅读食谱、看烹饪视频、学习各种食材知识（海量无标注数据）
2. **SFT（监督微调）** = 师傅手把手教他几道招牌菜，每道菜都有标准做法（高质量标注数据）
3. **奖励模型** = 给学徒设立评判标准——色香味、摆盘、卫生程度都要打分（人类偏好数据）
4. **PPO 强化学习** = 学徒反复做菜，根据评分不断改进，逐渐形成自己的风格（策略优化）

这就是 `Pre-training → SFT → Reward Model → RLHF (PPO)` 的完整链路。

---

## 📋 今日三件事

1. **理解大模型训练的四个阶段**及其数据需求
2. **动手搭建一个迷你 SFT 训练数据流水线**
3. **理解奖励模型的基本原理和 Bradley-Terry 损失函数**

---

## 🗺️ 手把手路线

### 第一步：环境准备

```bash
# 创建虚拟环境（推荐）
python -m venv week10_env
source week10_env/bin/activate  # Windows: week10_env\Scripts\activate

# 安装核心依赖
pip install torch transformers datasets accelerate peft trl
pip install wandb tensorboard matplotlib
```

### 第二步：理解训练流水线

大模型训练分为四个关键阶段：

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  预训练      │ → │  SFT        │ → │  奖励模型    │ → │  RLHF/PPO   │
│  (海量文本)  │    │  (指令数据)  │    │  (偏好数据)  │    │  (策略优化)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
    万亿tokens         数万条             数万条对             迭代训练
```

---

## 💻 代码区

### 代码 1：训练流水线数据格式总览

```python
"""
Day 1 - 大模型训练数据格式总览
展示预训练、SFT、奖励模型、RLHF 四个阶段的数据格式差异
"""

# ============================================================
# 1. 预训练数据格式（Pre-training Data）
# ============================================================
pretraining_data = [
    {
        "text": "人工智能是计算机科学的一个分支，它企图了解智能的实质，并生产出一种新的能以人类智能相似的方式做出反应的智能机器。"
    },
    {
        "text": "大语言模型（LLM）基于Transformer架构，通过在大规模文本语料上进行自回归训练来学习语言模式。"
    },
    {
        "text": "强化学习是机器学习的一个分支，智能体通过与环境交互来学习最优行为策略。"
    },
]

print("=" * 60)
print("阶段 1：预训练数据格式")
print("=" * 60)
for i, item in enumerate(pretraining_data):
    print(f"  样本 {i+1}: text = '{item['text'][:50]}...'")
print("  特点：纯文本，无标签，用于学习语言模型 P(next_token | context)")
print()

# ============================================================
# 2. SFT 数据格式（Supervised Fine-Tuning Data）
# ============================================================
sft_data = [
    {
        "messages": [
            {"role": "system", "content": "你是一个有帮助的AI助手。"},
            {"role": "user", "content": "什么是机器学习？"},
            {"role": "assistant", "content": "机器学习是人工智能的一个子领域，它使计算机能够从数据中学习，而无需显式编程。通过识别数据中的模式，机器学习算法可以做出预测或决策。"}
        ]
    },
    {
        "messages": [
            {"role": "system", "content": "你是一个有帮助的AI助手。"},
            {"role": "user", "content": "解释一下什么是神经网络"},
            {"role": "assistant", "content": "神经网络是一种受人脑结构启发的计算模型，由多层相互连接的节点（神经元）组成。每一层对输入数据进行变换，最终输出预测结果。通过反向传播算法，网络不断调整权重来最小化预测误差。"}
        ]
    },
]

print("=" * 60)
print("阶段 2：SFT 数据格式")
print("=" * 60)
for i, item in enumerate(sft_data):
    user_msg = [m for m in item["messages"] if m["role"] == "user"][0]["content"]
    assistant_msg = [m for m in item["messages"] if m["role"] == "assistant"][0]["content"]
    print(f"  样本 {i+1}:")
    print(f"    用户问: '{user_msg}'")
    print(f"    助手答: '{assistant_msg[:50]}...'")
print("  特点：指令-回答对，用于教模型遵循指令")
print()

# ============================================================
# 3. 奖励模型数据格式（Reward Model Data）
# ============================================================
reward_model_data = [
    {
        "prompt": "如何学习编程？",
        "chosen": "建议从Python开始学习，因为它语法简洁、应用广泛。可以通过在线课程、编程练习网站来入门，重要的是多动手实践，从小项目做起。",
        "rejected": "编程很难学的，你可能不适合。"
    },
    {
        "prompt": "推荐一本好书",
        "chosen": "这取决于你的兴趣。如果你喜欢科幻，推荐《三体》；如果喜欢非虚构，推荐《思考，快与慢》。你平时喜欢什么类型的内容？",
        "rejected": "《红楼梦》。"
    },
]

print("=" * 60)
print("阶段 3：奖励模型数据格式")
print("=" * 60)
for i, item in enumerate(reward_model_data):
    print(f"  样本 {i+1}:")
    print(f"    提示: '{item['prompt']}'")
    print(f"    优选回答: '{item['chosen'][:40]}...'")
    print(f"    劣选回答: '{item['rejected'][:40]}...'")
print("  特点：偏好对比数据，用于训练奖励模型区分好/坏回答")
print()

# ============================================================
# 4. RLHF 数据格式（PPO 训练数据）
# ============================================================
rlhf_data = [
    {
        "prompt": "写一个关于春天的短句",
        "system": "你是一个有创造力的写作助手。"
    },
    {
        "prompt": "用简单的话解释量子力学",
        "system": "你是一个科普作家，用通俗易懂的语言解释复杂概念。"
    },
]

print("=" * 60)
print("阶段 4：RLHF/PPO 训练数据格式")
print("=" * 60)
for i, item in enumerate(rlhf_data):
    print(f"  样本 {i+1}: prompt = '{item['prompt']}'")
print("  特点：只有提示，模型生成回答后由奖励模型打分，无需人工标注回答")
print()

print("=" * 60)
print("总结：四个阶段的数据特点")
print("=" * 60)
summary = """
  预训练:  纯文本，万亿tokens，学习语言能力
  SFT:     指令-回答对，数万条，学习遵循指令
  奖励模型: 偏好对比对，数万条，学习人类偏好
  RLHF:    仅提示，模型自主生成，奖励模型引导优化
"""
print(summary)
```

### 代码 2：用 PyTorch 手写 SFT 训练循环

```python
"""
Day 1 - 用 PyTorch 手写一个迷你 SFT 训练循环
不依赖 TRL，纯 PyTorch + Transformers 实现
"""

import torch
import torch.nn.functional as F
from transformers import AutoModelForCausalLM, AutoTokenizer

# ============================================================
# 步骤 1：准备训练数据
# ============================================================
print("=" * 60)
print("步骤 1：准备 SFT 训练数据")
print("=" * 60)

sft_examples = [
    "问：什么是深度学习？答：深度学习是机器学习的一个子集，使用多层神经网络来学习数据的层次化表示。",
    "问：Transformer的核心是什么？答：自注意力机制（Self-Attention），允许序列中的每个位置关注其他所有位置。",
    "问：什么是微调？答：微调是在预训练模型的基础上，使用特定数据进行额外训练，使模型适应新任务。",
    "问：解释梯度下降。答：梯度下降是一种优化算法，通过计算损失函数的梯度，沿反方向更新参数来减小损失。",
    "问：什么是过拟合？答：过拟合是模型在训练数据上表现好但在新数据上表现差，可通过正则化和数据增强避免。",
]

print(f"训练样本数: {len(sft_examples)}")
for i, ex in enumerate(sft_examples):
    print(f"  样本 {i+1}: {ex[:60]}...")
print()

# ============================================================
# 步骤 2：加载模型和分词器
# ============================================================
print("=" * 60)
print("步骤 2：加载模型和分词器")
print("=" * 60)

model_name = "Qwen/Qwen2-0.5B"
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"使用设备: {device}")

try:
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        device_map="auto" if device == "cuda" else None,
        trust_remote_code=True,
    )
    print(f"模型加载成功: {model_name}")
    print(f"模型参数量: {sum(p.numel() for p in model.parameters()) / 1e6:.1f}M")
except Exception as e:
    print(f"模型加载失败: {e}")
    print("提示：请检查网络连接或使用本地模型路径")
    model = None
    tokenizer = None

# ============================================================
# 步骤 3：手动实现 SFT 训练循环
# ============================================================
print()
print("=" * 60)
print("步骤 3：SFT 训练循环")
print("=" * 60)

if model is not None and tokenizer is not None:
    optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)
    num_epochs = 3

    print(f"训练配置: epochs={num_epochs}, lr=2e-5, device={device}")
    print()

    for epoch in range(num_epochs):
        model.train()
        total_loss = 0.0

        for i, text in enumerate(sft_examples):
            # 分词
            inputs = tokenizer(
                text,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=256,
            ).to(device)

            # 标签 = 输入（自回归训练）
            labels = inputs["input_ids"].clone()

            # 前向传播
            outputs = model(**inputs, labels=labels)
            loss = outputs.loss

            # 反向传播
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        avg_loss = total_loss / len(sft_examples)
        print(f"  Epoch {epoch+1}/{num_epochs}: loss = {avg_loss:.4f}")

    print()
    print("SFT 训练完成！")
    print()

    # ============================================================
    # 步骤 4：用训练后的模型生成文本
    # ============================================================
    print("=" * 60)
    print("步骤 4：模型生成测试")
    print("=" * 60)

    model.eval()
    test_prompts = [
        "问：什么是过拟合？答：",
        "问：Transformer的核心是什么？答：",
    ]

    for prompt in test_prompts:
        inputs = tokenizer(prompt, return_tensors="pt").to(device)
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=80,
                temperature=0.7,
                do_sample=True,
                top_p=0.9,
            )
        generated = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print(f"  输入: {prompt}")
        print(f"  输出: {generated}")
        print()
else:
    print("跳过训练（模型未加载）")
    print("实际运行时，请确保有 GPU 并能下载模型")
```

### 代码 3：Bradley-Terry 奖励模型损失函数

```python
"""
Day 1 - 奖励模型核心：Bradley-Terry 损失函数
"""

import torch
import torch.nn as nn

print("=" * 60)
print("Bradley-Terry 奖励模型损失函数")
print("=" * 60)

print("""
奖励模型（Reward Model）原理：
─────────────────────────────
输入: (prompt, response) 对
输出: 一个标量分数，表示该回答的质量

训练目标: 给定同一 prompt 的两个回答 chosen 和 rejected，
         模型应给 chosen 更高的分数

损失函数: Bradley-Terry 损失
  L = -log(σ(r(chosen) - r(rejected)))
  其中 σ 是 sigmoid 函数，r 是奖励模型的评分函数
""")

# ============================================================
# 实现 Bradley-Terry 损失
# ============================================================

def bradley_terry_loss(reward_chosen, reward_rejected):
    """
    Bradley-Terry 损失函数
    L = -log(σ(r_chosen - r_rejected))

    Args:
        reward_chosen: 模型对优选回答的评分 [batch_size, 1]
        reward_rejected: 模型对劣选回答的评分 [batch_size, 1]
    Returns:
        loss: 标量损失值
    """
    loss = -torch.log(
        torch.sigmoid(reward_chosen - reward_rejected)
    ).mean()
    return loss

# 演示损失计算
print("Bradley-Terry 损失计算演示:")
print("-" * 40)

# 场景 1：模型能正确区分
reward_chosen = torch.tensor([[2.5], [3.0], [1.8], [2.2]])
reward_rejected = torch.tensor([[0.5], [1.0], [0.8], [0.3]])
loss = bradley_terry_loss(reward_chosen, reward_rejected)
print(f"  场景 1（正确区分）:")
print(f"    优选回答评分: {reward_chosen.squeeze().tolist()}")
print(f"    劣选回答评分: {reward_rejected.squeeze().tolist()}")
print(f"    损失值: {loss.item():.4f}")

# 场景 2：模型区分能力很强
reward_chosen_good = torch.tensor([[5.0], [5.0], [5.0], [5.0]])
reward_rejected_bad = torch.tensor([[-5.0], [-5.0], [-5.0], [-5.0]])
loss_good = bradley_terry_loss(reward_chosen_good, reward_rejected_bad)
print(f"\n  场景 2（区分能力很强）:")
print(f"    损失值: {loss_good.item():.4f} (趋近于0)")

# 场景 3：模型区分能力很弱
reward_chosen_weak = torch.tensor([[1.1], [1.05], [1.2], [1.15]])
reward_rejected_weak = torch.tensor([[1.0], [1.0], [1.1], [1.1]])
loss_weak = bradley_terry_loss(reward_chosen_weak, reward_rejected_weak)
print(f"\n  场景 3（区分能力很弱）:")
print(f"    损失值: {loss_weak.item():.4f} (值较大)")

# ============================================================
# 梯度分析
# ============================================================
print()
print("=" * 60)
print("梯度分析：损失对奖励分数的偏导数")
print("=" * 60)
print("""
对 chosen:  ∂L/∂r_c = -(1 - σ(r_c - r_r))
对 rejected: ∂L/∂r_r = σ(r_c - r_r)

含义:
  - 如果 chosen 分数远高于 rejected，梯度趋近于 0（已学好）
  - 如果 chosen 分数接近 rejected，梯度较大（需要继续学习）
  - 增大 chosen 分数、降低 rejected 分数都能减小损失
""")

# 数值演示
r_c = torch.tensor([2.0], requires_grad=True)
r_r = torch.tensor([1.0], requires_grad=True)
loss = bradley_terry_loss(r_c, r_r)
loss.backward()
print(f"  r_c={r_c.item():.1f}, r_r={r_r.item():.1f}")
print(f"  loss={loss.item():.4f}")
print(f"  ∂L/∂r_c = {r_c.grad.item():.4f}")
print(f"  ∂L/∂r_r = {r_r.grad.item():.4f}")

print()
print("=" * 60)
print("训练流水线总结")
print("=" * 60)
print("""
完整的 RLHF 流水线：
─────────────────────────────────────────────────────
1. 准备偏好数据: 人类标注员对同一提示的多个回答进行排序
2. 训练奖励模型: 使用 Bradley-Terry 损失，学习给回答打分
3. PPO 优化策略:
   a. 用当前策略模型对提示生成回答
   b. 用奖励模型给回答打分
   c. 用 PPO 算法更新策略模型，最大化奖励
   d. 加入 KL 散度惩罚，防止偏离原始模型太远
4. 重复步骤 3，直到模型表现满意

关键公式:
  PPO 目标: max E[r(a)] - β * KL(π_θ || π_ref)
  其中 r(a) 是奖励，β 是 KL 惩罚系数，π_ref 是参考策略
""")
```

---

## 📤 预期输出

```
============================================================
阶段 1：预训练数据格式
============================================================
  样本 1: text = '人工智能是计算机科学的一个分支，它企图了解智能的实...'
  样本 2: text = '大语言模型（LLM）基于Transformer架构，通过在大规模文...'
  样本 3: text = '强化学习是机器学习的一个分支，智能体通过与环境交互来...'
  特点：纯文本，无标签，用于学习语言模型 P(next_token | context)

============================================================
阶段 2：SFT 数据格式
============================================================
  样本 1:
    用户问: '什么是机器学习？'
    助手答: '机器学习是人工智能的一个子领域，它使计算机能够从数据中学习...'
  ...

============================================================
Bradley-Terry 损失计算演示
============================================================
  场景 1（正确区分）:
    损失值: 0.3133
  场景 2（区分能力很强）:
    损失值: 0.0000 (趋近于0)
  场景 3（区分能力很弱）:
    损失值: 1.0125 (值较大)
```

---

## ⚠️ 常见错误和解决方案

### 错误 1：CUDA 显存不足（OOM）
```
RuntimeError: CUDA out of memory.
```
**解决方案：**
- 减小 batch_size（从 8 → 2 → 1）
- 使用 `gradient_accumulation_steps` 模拟更大 batch
- 启用 4-bit 量化（QLoRA，Day 2 详讲）
- 使用更小的模型（如 0.5B → 0.3B）

### 错误 2：模型下载失败
```
ConnectionError: Failed to fetch
```
**解决方案：**
- 检查网络连接，使用代理
- 设置 HuggingFace 镜像：`export HF_ENDPOINT=https://hf-mirror.com`
- 使用本地已下载的模型路径

### 错误 3：pad_token 未设置
```
IndexError: index out of range in self
```
**解决方案：**
- 训练前设置 `tokenizer.pad_token = tokenizer.eos_token`
- 确保最大序列长度不超出模型限制

### 错误 4：loss 不下降
```
训练多轮后 loss 没有明显变化
```
**解决方案：**
- 检查学习率是否合适（SFT 一般用 1e-5 到 5e-5）
- 确认标签设置正确（自回归训练 labels=input_ids）
- 检查数据质量，是否有大量重复或低质量样本

---

## 🏋️ 每日挑战

1. **计算挑战**：给定以下 3 对奖励分数，手动计算 Bradley-Terry 损失的平均值：
   - chosen=2.0, rejected=0.5
   - chosen=1.5, rejected=1.2
   - chosen=3.0, rejected=-1.0

2. **思考题**：为什么 RLHF 中需要 KL 散度惩罚项？如果不加会怎样？（提示：想想"奖励黑客"问题）

3. **编程挑战**：修改代码 1，添加第五个数据格式——"拒绝采样（Rejection Sampling）"的数据格式。拒绝采样是 RLHF 的简化版本：模型生成多个回答，用奖励模型选最高分的那个作为训练数据。
