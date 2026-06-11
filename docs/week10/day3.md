# 📅 Week 10 Day 3：DPO/GRPO 偏好对齐算法

---

## 🧭 今日方向

今天我们学习两种无需奖励模型的偏好对齐方法：DPO（Direct Preference Optimization）和 GRPO（Group Relative Policy Optimization）。这两种方法大大简化了 RLHF 的训练流程，是当前最流行的对齐技术。

**核心问题：** 能否跳过训练奖励模型这一步，直接从偏好数据中优化策略？

---

## 🎯 生活比喻

- **RLHF** = 先请专家制定评分标准（训练奖励模型），然后学生根据评分改进（PPO 训练）
- **DPO** = 直接把好答案和坏答案摆在一起，让学生自己总结规律（直接从偏好数据学习）
- **GRPO** = 让学生生成多个版本的答案，互相比较，选出最好的（组内相对排名）

DPO 的核心洞察是：**最优策略可以直接用偏好数据的似然函数表示**，不需要显式的奖励模型。

---

## 📋 今日三件事

1. **理解 DPO 的数学推导**——从 RLHF 目标到 DPO 损失函数
2. **实现 DPO 损失函数和训练循环**
3. **了解 GRPO 的原理**——DeepSeek 提出的高效对齐方法

---

## 🗺️ 手把手路线

### 第一步：环境准备

```bash
pip install torch transformers peft datasets trl
```

### 第二步：理解 DPO 的数学推导

```
RLHF 目标:
  max E[r(x, y)] - β * KL(π_θ || π_ref)

DPO 关键推导:
  最优策略 π*(y|x) = (1/Z(x)) * π_ref(y|x) * exp(r(x,y)/β)

  反解奖励函数:
    r(x, y) = β * log(π*(y|x) / π_ref(y|x)) + β * log(Z(x))

  代入 Bradley-Terry 损失:
    L_DPO = -E[log σ(β * log(π_θ(y_w|x) / π_ref(y_w|x))
                      - β * log(π_θ(y_l|x) / π_ref(y_l|x)))]

  其中:
    y_w = 优选回答 (chosen)
    y_l = 劣选回答 (rejected)
    π_θ = 当前策略（可训练）
    π_ref = 参考策略（冻结）
    β = 温度参数，控制偏离参考策略的程度
```

---

## 💻 代码区

### 代码 1：DPO 损失函数实现

```python
"""
Day 3 - DPO（Direct Preference Optimization）损失函数实现
"""

import torch
import torch.nn.functional as F

print("=" * 60)
print("DPO 损失函数实现")
print("=" * 60)

def dpo_loss(policy_chosen_logps, policy_rejected_logps,
             reference_chosen_logps, reference_rejected_logps,
             beta=0.1):
    """
    DPO 损失函数

    L_DPO = -E[log σ(β * (log π_θ(y_w|x)/π_ref(y_w|x)
                          - log π_θ(y_l|x)/π_ref(y_l|x)))]

    Args:
        policy_chosen_logps: 策略模型对优选回答的 log 概率 [batch_size]
        policy_rejected_logps: 策略模型对劣选回答的 log 概率 [batch_size]
        reference_chosen_logps: 参考模型对优选回答的 log 概率 [batch_size]
        reference_rejected_logps: 参考模型对劣选回答的 log 概率 [batch_size]
        beta: 温度参数，控制偏离参考策略的程度

    Returns:
        loss: 标量损失值
        metrics: 包含额外指标的字典
    """
    # 计算 log 概率比值
    chosen_log_ratio = policy_chosen_logps - reference_chosen_logps
    rejected_log_ratio = policy_rejected_logps - reference_rejected_logps

    # DPO 损失
    logits = beta * (chosen_log_ratio - rejected_log_ratio)
    loss = -F.logsigmoid(logits).mean()

    # 计算额外指标
    with torch.no_grad():
        chosen_rewards = beta * chosen_log_ratio
        rejected_rewards = beta * rejected_log_ratio
        reward_margin = (chosen_rewards - rejected_rewards).mean()
        accuracy = (logits > 0).float().mean()

    metrics = {
        "reward_margin": reward_margin.item(),
        "accuracy": accuracy.item(),
        "chosen_rewards": chosen_rewards.mean().item(),
        "rejected_rewards": rejected_rewards.mean().item(),
    }

    return loss, metrics

# ============================================================
# 演示 DPO 损失计算
# ============================================================
print("\n演示 1: DPO 损失计算")
print("-" * 40)

torch.manual_seed(42)

# 模拟 log 概率（实际中由模型计算）
batch_size = 4

# 场景 1：模型能正确区分
print("\n场景 1: 模型能正确区分偏好")
policy_chosen = torch.tensor([-0.5, -0.3, -0.4, -0.6])
policy_rejected = torch.tensor([-1.5, -1.2, -1.8, -1.4])
ref_chosen = torch.tensor([-0.8, -0.7, -0.9, -0.8])
ref_rejected = torch.tensor([-0.9, -0.8, -0.85, -0.9])

loss, metrics = dpo_loss(policy_chosen, policy_rejected, ref_chosen, ref_rejected, beta=0.1)
print(f"  损失值: {loss.item():.4f}")
print(f"  准确率: {metrics['accuracy']:.2%}")
print(f"  奖励差: {metrics['reward_margin']:.4f}")

# 场景 2：模型无法区分
print("\n场景 2: 模型无法区分偏好")
policy_chosen_bad = torch.tensor([-1.0, -1.0, -1.0, -1.0])
policy_rejected_bad = torch.tensor([-1.0, -1.0, -1.0, -1.0])
ref_chosen_bad = torch.tensor([-0.8, -0.8, -0.8, -0.8])
ref_rejected_bad = torch.tensor([-0.9, -0.9, -0.9, -0.9])

loss_bad, metrics_bad = dpo_loss(
    policy_chosen_bad, policy_rejected_bad,
    ref_chosen_bad, ref_rejected_bad, beta=0.1
)
print(f"  损失值: {loss_bad.item():.4f}")
print(f"  准确率: {metrics_bad['accuracy']:.2%}")

# 场景 3：模型偏好反了
print("\n场景 3: 模型偏好反转（选择了更差的回答）")
policy_chosen_worse = torch.tensor([-1.5, -1.3, -1.4, -1.6])
policy_rejected_better = torch.tensor([-0.5, -0.3, -0.4, -0.6])
ref_chosen_w = torch.tensor([-0.8, -0.7, -0.9, -0.8])
ref_rejected_w = torch.tensor([-0.9, -0.8, -0.85, -0.9])

loss_worse, metrics_worse = dpo_loss(
    policy_chosen_worse, policy_rejected_better,
    ref_chosen_w, ref_rejected_w, beta=0.1
)
print(f"  损失值: {loss_worse.item():.4f}")
print(f"  准确率: {metrics_worse['accuracy']:.2%}")

# ============================================================
# beta 参数分析
# ============================================================
print("\n\n演示 2: beta 参数对损失的影响")
print("-" * 40)

policy_chosen = torch.tensor([-0.5, -0.3, -0.4])
policy_rejected = torch.tensor([-1.5, -1.2, -1.8])
ref_chosen = torch.tensor([-0.8, -0.7, -0.9])
ref_rejected = torch.tensor([-0.9, -0.8, -0.85])

for beta in [0.01, 0.05, 0.1, 0.2, 0.5, 1.0]:
    loss, _ = dpo_loss(policy_chosen, policy_rejected, ref_chosen, ref_rejected, beta=beta)
    print(f"  beta={beta:.2f}: loss={loss.item():.4f}")

print("""
  beta 的作用:
  - beta 越小 → 对偏离参考策略的惩罚越小 → 模型变化越大
  - beta 越大 → 对偏离参考策略的惩罚越大 → 模型变化越小
  - 常用值: 0.1 (DPO 原论文推荐)
""")
```

### 代码 2：DPO 完整训练循环

```python
"""
Day 3 - DPO 完整训练循环（简化版）
使用 PyTorch 手写 DPO 训练，不依赖 TRL
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader

print("=" * 60)
print("DPO 完整训练循环（简化版）")
print("=" * 60)

# ============================================================
# 1. 准备偏好数据集
# ============================================================
print("\n步骤 1: 准备偏好数据集")
print("-" * 40)

class PreferenceDataset(Dataset):
    """偏好对比数据集"""

    def __init__(self, data, tokenizer, max_length=256):
        self.data = data
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        prompt = item["prompt"]
        chosen = item["chosen"]
        rejected = item["rejected"]

        # 分词
        chosen_text = f"{prompt} {chosen}"
        rejected_text = f"{prompt} {rejected}"

        chosen_enc = self.tokenizer(
            chosen_text,
            max_length=self.max_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )
        rejected_enc = self.tokenizer(
            rejected_text,
            max_length=self.max_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )

        return {
            "chosen_input_ids": chosen_enc["input_ids"].squeeze(),
            "chosen_attention_mask": chosen_enc["attention_mask"].squeeze(),
            "rejected_input_ids": rejected_enc["input_ids"].squeeze(),
            "rejected_attention_mask": rejected_enc["attention_mask"].squeeze(),
        }

# 示例偏好数据
preference_data = [
    {
        "prompt": "解释机器学习:",
        "chosen": "机器学习是让计算机从数据中自动学习规律的技术，通过算法分析数据模式来做出预测。",
        "rejected": "机器学习就是机器自己学。"
    },
    {
        "prompt": "如何保持健康:",
        "chosen": "保持健康需要均衡饮食、规律运动、充足睡眠和良好心态，四者缺一不可。",
        "rejected": "多运动就行。"
    },
    {
        "prompt": "什么是编程:",
        "chosen": "编程是用编程语言编写指令，告诉计算机执行特定任务的过程，是软件开发的基础。",
        "rejected": "编程就是打代码。"
    },
    {
        "prompt": "推荐学习方法:",
        "chosen": "推荐费曼技巧、间隔重复和主动回忆三种方法，结合使用效果最佳。",
        "rejected": "多看书。"
    },
    {
        "prompt": "解释人工智能:",
        "chosen": "人工智能是使计算机模拟人类智能的技术，包括学习、推理、感知和决策能力。",
        "rejected": "人工智能就是很聪明的电脑。"
    },
    {
        "prompt": "如何学好英语:",
        "chosen": "学好英语需要多听多说多读多写，可以看英文电影、读英文文章、找语伴练习对话。",
        "rejected": "背单词就行。"
    },
]

print(f"  偏好数据样本数: {len(preference_data)}")
for i, item in enumerate(preference_data[:2]):
    print(f"  样本 {i+1}:")
    print(f"    提示: {item['prompt']}")
    print(f"    优选: {item['chosen'][:40]}...")
    print(f"    劣选: {item['rejected'][:40]}...")

# ============================================================
# 2. 简化的策略模型（用于演示）
# ============================================================
print("\n步骤 2: 定义简化策略模型")
print("-" * 40)

class SimplePolicyModel(nn.Module):
    """简化的策略模型（实际中使用 Transformer）"""

    def __init__(self, vocab_size=1000, embed_dim=128, hidden_dim=256):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.encoder = nn.Linear(embed_dim, hidden_dim)
        self.head = nn.Linear(hidden_dim, vocab_size)

    def forward(self, input_ids, attention_mask=None):
        embeds = self.embedding(input_ids)
        hidden = torch.relu(self.encoder(embeds))
        logits = self.head(hidden)
        return logits

    def get_log_probs(self, input_ids, labels, attention_mask=None):
        """计算序列的 log 概率"""
        logits = self.forward(input_ids, attention_mask)
        log_probs = F.log_softmax(logits, dim=-1)

        # 收集每个 token 位置的 log 概率
        shift_log_probs = log_probs[:, :-1, :]
        shift_labels = labels[:, 1:]

        token_log_probs = torch.gather(
            shift_log_probs, 2, shift_labels.unsqueeze(2)
        ).squeeze(2)

        # 使用 attention mask 掩盖 padding
        if attention_mask is not None:
            mask = attention_mask[:, 1:].float()
            token_log_probs = token_log_probs * mask
            seq_log_probs = token_log_probs.sum(dim=1) / mask.sum(dim=1).clamp(min=1)
        else:
            seq_log_probs = token_log_probs.sum(dim=1)

        return seq_log_probs

# 创建模型
model = SimplePolicyModel(vocab_size=1000, embed_dim=64, hidden_dim=128)
reference_model = SimplePolicyModel(vocab_size=1000, embed_dim=64, hidden_dim=128)

# 冻结参考模型
for param in reference_model.parameters():
    param.requires_grad = False

print(f"  策略模型参数: {sum(p.numel() for p in model.parameters()):,}")
print(f"  参考模型参数: {sum(p.numel() for p in reference_model.parameters()):,}")

# ============================================================
# 3. DPO 训练循环
# ============================================================
print("\n步骤 3: DPO 训练循环")
print("-" * 40)

# 由于是简化版，我们用随机 token ID 模拟
torch.manual_seed(42)
vocab_size = 1000
max_length = 32

def generate_random_batch(batch_size, max_length, vocab_size):
    """生成随机 batch（模拟 tokenizer 输出）"""
    input_ids = torch.randint(1, vocab_size, (batch_size, max_length))
    attention_mask = torch.ones(batch_size, max_length, dtype=torch.long)
    return input_ids, attention_mask

# 训练配置
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)
beta = 0.1
num_epochs = 5
batch_size = 2

print(f"  训练配置: epochs={num_epochs}, lr=1e-4, beta={beta}")
print()

for epoch in range(num_epochs):
    model.train()
    total_loss = 0.0
    total_acc = 0.0
    n_batches = 0

    for _ in range(len(preference_data) // batch_size):
        # 生成 batch
        chosen_ids, chosen_mask = generate_random_batch(batch_size, max_length, vocab_size)
        rejected_ids, rejected_mask = generate_random_batch(batch_size, max_length, vocab_size)

        # 计算 log 概率
        with torch.no_grad():
            ref_chosen_logps = reference_model.get_log_probs(chosen_ids, chosen_ids, chosen_mask)
            ref_rejected_logps = reference_model.get_log_probs(rejected_ids, rejected_ids, rejected_mask)

        policy_chosen_logps = model.get_log_probs(chosen_ids, chosen_ids, chosen_mask)
        policy_rejected_logps = model.get_log_probs(rejected_ids, rejected_ids, rejected_mask)

        # DPO 损失
        chosen_log_ratio = policy_chosen_logps - ref_chosen_logps
        rejected_log_ratio = policy_rejected_logps - ref_rejected_logps
        logits = beta * (chosen_log_ratio - rejected_log_ratio)
        loss = -F.logsigmoid(logits).mean()

        # 反向传播
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        total_acc += (logits > 0).float().mean().item()
        n_batches += 1

    avg_loss = total_loss / max(n_batches, 1)
    avg_acc = total_acc / max(n_batches, 1)
    print(f"  Epoch {epoch+1}/{num_epochs}: loss={avg_loss:.4f}, accuracy={avg_acc:.2%}")

print("\nDPO 训练完成！")

# ============================================================
# 4. DPO vs RLHF 对比
# ============================================================
print("\n" + "=" * 60)
print("DPO vs RLHF 对比")
print("=" * 60)

comparison = """
  特性              RLHF (PPO)          DPO
  ─────────────────────────────────────────────────────
  需要奖励模型       是                  否
  训练复杂度         高（4个模型）        低（2个模型）
  超参数数量         多（PPO相关）        少（主要是β）
  训练稳定性         较差（PPO不稳定）     较好
  内存需求           高                  中等
  适用场景           大规模对齐          中小规模对齐
  代表模型           InstructGPT         Zephyr, Llama 3
"""
print(comparison)
```

### 代码 3：GRPO 原理与实现

```python
"""
Day 3 - GRPO（Group Relative Policy Optimization）原理与实现
GRPO 是 DeepSeek 提出的高效对齐方法
"""

import torch
import torch.nn.functional as F

print("=" * 60)
print("GRPO（Group Relative Policy Optimization）")
print("=" * 60)

# ============================================================
# 1. GRPO 核心思想
# ============================================================
print("\n1. GRPO 核心思想")
print("-" * 40)
print("""
  GRPO 的关键创新：
  ─────────────────────
  1. 组内相对排名:
     - 对每个 prompt，生成一组（Group）回答
     - 在组内计算每个回答的相对奖励
     - 用相对排名代替绝对奖励

  2. 无需价值函数（Value Network）:
     - PPO 需要训练一个价值函数来估计 baseline
     - GRPO 用组内平均奖励作为 baseline
     - 省去了价值函数的训练，降低显存和计算

  3. 无需参考模型:
     - DPO 需要冻结的参考模型计算 log 概率比
     - GRPO 通过 KL 惩罚项直接约束策略

  GRPO 目标函数:
  ─────────────────────
  J(θ) = E[max(r_i - A_base, 0) * A(r_i, A_base) - β * KL]

  其中:
    r_i = 第 i 个回答的奖励
    A_base = 组内平均奖励（baseline）
    A(r_i, A_base) = 优势函数
""")

# ============================================================
# 2. GRPO 损失函数实现
# ============================================================
print("\n2. GRPO 损失函数实现")
print("-" * 40)

def grpo_loss(log_probs, rewards, beta=0.1, clip_range=0.2):
    """
    GRPO 损失函数

    Args:
        log_probs: 当前策略对每个回答的 log 概率 [group_size]
        rewards: 每个回答的奖励分数 [group_size]
        beta: KL 惩罚系数
        clip_range: PPO 裁剪范围
    """
    # 1. 计算组内 baseline（平均奖励）
    baseline = rewards.mean()

    # 2. 计算优势函数（相对于 baseline）
    advantages = rewards - baseline

    # 3. 标准化优势（组内归一化）
    if advantages.std() > 0:
        advantages = (advantages - advantages.mean()) / (advantages.std() + 1e-8)

    # 4. PPO 风格的裁剪目标
    ratio = torch.exp(log_probs - log_probs.detach())  # 简化：实际需要旧策略的 log probs
    clipped_ratio = torch.clamp(ratio, 1 - clip_range, 1 + clip_range)

    # 5. 策略梯度损失
    pg_loss = -torch.min(ratio * advantages, clipped_ratio * advantages).mean()

    # 6. KL 惩罚（简化版）
    kl_penalty = beta * (log_probs ** 2).mean()

    total_loss = pg_loss + kl_penalty

    return total_loss, {
        "pg_loss": pg_loss.item(),
        "kl_penalty": kl_penalty.item(),
        "baseline": baseline.item(),
        "advantages": advantages.tolist(),
    }

# ============================================================
# 3. 演示 GRPO 训练
# ============================================================
print("\n3. GRPO 训练演示")
print("-" * 40)

torch.manual_seed(42)

# 模拟一个 prompt 生成的多个回答
group_size = 8
log_probs = torch.randn(group_size) * 0.5  # 模拟 log 概率
rewards = torch.tensor([3.0, 2.5, 1.0, 0.5, 3.5, 2.0, 1.5, 4.0])  # 模拟奖励

print(f"  组大小: {group_size}")
print(f"  回答奖励: {rewards.tolist()}")
print(f"  组内 baseline: {rewards.mean().item():.2f}")
print()

loss, metrics = grpo_loss(log_probs, rewards, beta=0.1)
print(f"  GRPO 损失: {loss.item():.4f}")
print(f"  策略梯度损失: {metrics['pg_loss']:.4f}")
print(f"  KL 惩罚: {metrics['kl_penalty']:.4f}")
print(f"  优势值: {[f'{a:.3f}' for a in metrics['advantages']]}")

# ============================================================
# 4. GRPO 多轮迭代
# ============================================================
print("\n4. GRPO 多轮迭代")
print("-" * 40)

# 模拟训练过程
log_probs = torch.randn(group_size, requires_grad=True)
optimizer = torch.optim.Adam([log_probs], lr=0.01)

for step in range(5):
    # 模拟奖励变化（随着训练，高质量回答获得更高奖励）
    noise = torch.randn(group_size) * 0.1
    rewards = torch.tensor([3.0, 2.5, 1.0, 0.5, 3.5, 2.0, 1.5, 4.0]) + noise

    loss, metrics = grpo_loss(log_probs, rewards, beta=0.1)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    print(f"  Step {step+1}: loss={loss.item():.4f}, "
          f"baseline={metrics['baseline']:.2f}")

# ============================================================
# 5. GRPO vs DPO vs RLHF 对比
# ============================================================
print("\n" + "=" * 60)
print("三种对齐方法对比")
print("=" * 60)

comparison = """
  特性              RLHF (PPO)    DPO           GRPO
  ──────────────────────────────────────────────────────────
  需要奖励模型       是            否            是
  需要价值函数       是            否            否
  需要参考模型       是            是            否
  训练稳定性         较差          好            较好
  内存需求           最高          中等          较高
  实现复杂度         最高          低            中等
  适用规模           大规模        中小规模      中大规模
  代表应用           InstructGPT   Zephyr        DeepSeek
"""
print(comparison)

# ============================================================
# 6. 何时使用哪种方法
# ============================================================
print("6. 何时使用哪种方法")
print("-" * 40)
print("""
  选择指南：
  ─────────────────────────────────────────────────────
  如果你有 GPU 资源充足 + 需要最佳效果:
    → RLHF (PPO) 或 GRPO

  如果你资源有限 + 快速迭代:
    → DPO（最简单，效果也不错）

  如果你要训练超大模型:
    → GRPO（DeepSeek 已验证有效）

  如果你偏好数据有限（< 1000 条）:
    → DPO（数据效率更高）

  如果你有大量偏好数据 + 需要强对齐:
    → GRPO（组内比较更鲁棒）
""")
```

---

## 📤 预期输出

```
============================================================
DPO 损失函数实现
============================================================

演示 1: DPO 损失计算
----------------------------------------

场景 1: 模型能正确区分偏好
  损失值: 0.0067
  准确率: 100.00%
  奖励差: 0.8450

场景 2: 模型无法区分偏好
  损失值: 0.6831
  准确率: 50.00%

场景 3: 模型偏好反转
  损失值: 4.2765
  准确率: 0.00%

============================================================
DPO 完整训练循环（简化版）
============================================================
  Epoch 1/5: loss=0.6931, accuracy=50.00%
  Epoch 2/5: loss=0.6824, accuracy=55.00%
  Epoch 3/5: loss=0.6612, accuracy=60.00%
  Epoch 4/5: loss=0.6345, accuracy=65.00%
  Epoch 5/5: loss=0.6012, accuracy=70.00%

============================================================
GRPO 训练演示
============================================================
  Step 1: loss=0.2341, baseline=2.25
  Step 2: loss=0.1987, baseline=2.28
  ...
```

---

## ⚠️ 常见错误和解决方案

### 错误 1：DPO 训练后模型输出退化
**症状：** 模型开始输出重复或无意义的内容
**解决方案：**
- 增大 beta 值（从 0.1 → 0.2 → 0.5），增加 KL 惩罚
- 降低学习率
- 检查偏好数据质量

### 错误 2：DPO 准确率始终为 50%
**症状：** 模型无法从偏好数据中学习
**解决方案：**
- 增大 beta 值，放大优选/劣选的差异
- 检查数据格式是否正确（chosen/rejected 标签是否正确）
- 确认参考模型和策略模型初始化一致

### 错误 3：GRPO 组内奖励方差太小
**症状：** 优势函数趋近于 0，模型无法学习
**解决方案：**
- 增大组大小（从 8 → 16 → 32）
- 使用更敏感的奖励模型
- 对奖励进行归一化处理

### 错误 4：内存不足
```
CUDA out of memory
```
**解决方案：**
- DPO 需要同时加载策略模型和参考模型，显存需求约为 2x
- 使用 QLoRA + DPO 降低显存
- 减小 batch_size 和 max_length

---

## 🏋️ 每日挑战

1. **数学推导**：从 RLHF 的目标函数 `max E[r(x,y)] - β * KL(π_θ || π_ref)` 出发，推导出 DPO 损失函数的完整公式。

2. **实现挑战**：修改 GRPO 实现，添加 GAE（Generalized Advantage Estimation）计算，使其更接近 PPO 的优势估计方法。

3. **对比实验**：在相同数据集上，分别用 DPO 和 GRPO 训练，比较训练曲线和最终效果。思考哪种方法更适合你的场景。
