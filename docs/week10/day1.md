# 📅 Week 10 Day 1：从 SFT 到 RLHF：大模型训练全景

## 🧭 今日方向
> 理解大语言模型从预训练到对齐的完整训练流水线，掌握 SFT、RLHF 各阶段的核心思想与工程实践。

## 🎯 生味比喻
> 想象你是一个刚毕业的医学生。预训练就像在学校里读了所有的医学教科书（海量知识）；SFT（监督微调）就像跟着主治医生查房，学习怎么写病历、怎么和病人沟通；RLHF（人类反馈强化学习）就像你独立值班后，护士长根据病人满意度给你打分，你根据反馈不断改进。三阶段缺一不可：先有知识，再学规范，最后学偏好。

## 📋 今日三件事
1. 掌握预训练 → SFT → RLHF 的三阶段训练流水线
2. 理解每个阶段的数据格式、损失函数和优化目标
3. 动手用代码模拟完整的训练流程（含数据构造）

## 🗺️ 手把手路线

### Step 1：理解预训练阶段
- 做什么: 学习自回归语言建模的目标函数，理解 next token prediction
- 为什么: 这是所有 LLM 的基础，理解了才能明白后续微调在改什么
- 成功标志: 能解释 loss = -log P(x_t | x_{<t}) 的含义

### Step 2：理解 SFT 阶段
- 做什么: 学习监督微调的数据格式（instruction-input-output）和训练目标
- 为什么: SFT 是让预训练模型学会"对话"的关键步骤
- 成功标志: 能构造一条合格的 SFT 训练样本

### Step 3：理解 RLHF 阶段
- 做什么: 学习奖励模型训练 + PPO 优化的完整流程
- 为什么: RLHF 是让模型输出更符合人类偏好的核心手段
- 成功标志: 能画出 RLHF 的完整数据流图

### Step 4：代码实践
- 做什么: 用 Python 模拟从数据准备到训练的完整流程
- 为什么: 代码是最好的理解方式
- 成功标志: 代码能跑通，输出训练 loss 曲线

## 💻 代码区

```python
"""
从 SFT 到 RLHF 的完整训练流水线模拟
使用 PyTorch 实现核心逻辑
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Tuple
import json

# ========== 1. 预训练阶段：自回归语言模型 ==========

class MiniGPT(nn.Module):
    """微型 GPT 模型，用于演示训练流程"""
    def __init__(self, vocab_size=1000, d_model=128, n_heads=4, n_layers=2):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.position_encoding = nn.Embedding(512, d_model)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=n_heads, batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=n_layers)
        self.output_head = nn.Linear(d_model, vocab_size)
    
    def forward(self, input_ids):
        batch_size, seq_len = input_ids.shape
        positions = torch.arange(seq_len).unsqueeze(0).expand(batch_size, -1)
        x = self.embedding(input_ids) + self.position_encoding(positions)
        # 因果掩码
        mask = torch.triu(torch.ones(seq_len, seq_len), diagonal=1).bool()
        x = self.transformer(x, mask=mask)
        logits = self.output_head(x)
        return logits


def pretrain_loss(model, input_ids):
    """预训练损失：Next Token Prediction"""
    logits = model(input_ids[:, :-1])
    targets = input_ids[:, 1:]
    loss = F.cross_entropy(logits.reshape(-1, logits.size(-1)), targets.reshape(-1))
    return loss


# ========== 2. SFT 阶段：监督微调 ==========

def create_sft_dataset() -> List[Dict]:
    """构造 SFT 训练数据集"""
    dataset = [
        {
            "instruction": "请用一句话解释什么是机器学习",
            "input": "",
            "output": "机器学习是让计算机从数据中自动学习规律并做出预测的方法。"
        },
        {
            "instruction": "请将以下英文翻译成中文",
            "input": "The weather is nice today.",
            "output": "今天天气很好。"
        },
        {
            "instruction": "请总结以下文本的核心观点",
            "input": "深度学习在图像识别领域取得了突破性进展，特别是在医学影像诊断中。",
            "output": "深度学习在图像识别尤其是医学影像诊断方面有重大突破。"
        },
        {
            "instruction": "请列出三个优点",
            "input": "学习编程",
            "output": "1. 提升逻辑思维能力 2. 增强就业竞争力 3. 可以创造自己的产品"
        },
        {
            "instruction": "请判断以下说法是否正确",
            "input": "地球是太阳系中最大的行星",
            "output": "错误。太阳系中最大的行星是木星。"
        },
    ]
    return dataset


def format_sft_sample(sample: Dict) -> str:
    """将 SFT 数据格式化为模型输入"""
    prompt = f"### 指令:\n{sample['instruction']}\n"
    if sample['input']:
        prompt += f"### 输入:\n{sample['input']}\n"
    prompt += f"### 回答:\n{sample['output']}"
    return prompt


def sft_loss(model, input_ids, labels):
    """SFT 损失：只在回答部分计算 loss"""
    logits = model(input_ids)
    # 将 labels 中非目标位置设为 -100，忽略这些位置的损失
    loss = F.cross_entropy(
        logits.view(-1, logits.size(-1)),
        labels.view(-1),
        ignore_index=-100
    )
    return loss


# ========== 3. RLHF 阶段：奖励模型 + PPO ==========

class RewardModel(nn.Module):
    """奖励模型：给模型输出打分"""
    def __init__(self, base_model: MiniGPT):
        super().__init__()
        self.base_model = base_model
        self.reward_head = nn.Linear(base_model.output_head.out_features, 1)
    
    def forward(self, input_ids):
        logits = self.base_model(input_ids)
        # 取最后一个 token 的 hidden state 作为整句表示
        last_hidden = logits[:, -1, :]
        reward = self.reward_head(last_hidden)
        return reward


def create_preference_data() -> List[Dict]:
    """构造偏好对比数据（用于训练奖励模型）"""
    preferences = [
        {
            "prompt": "什么是人工智能？",
            "chosen": "人工智能是模拟人类智能的计算机系统，能够执行学习、推理等任务。",
            "rejected": "AI就是很厉害的电脑。"
        },
        {
            "prompt": "如何学好 Python？",
            "chosen": "建议从基础语法开始，每天写代码练习，参与开源项目，阅读优秀源码。",
            "rejected": "背下来就行了。"
        },
        {
            "prompt": "解释一下什么是 API",
            "chosen": "API 是应用程序编程接口，它定义了不同软件组件之间交互的规范和协议。",
            "rejected": "不知道，自己去查。"
        },
    ]
    return preferences


def reward_loss(reward_model, chosen_ids, rejected_ids):
    """奖励模型损失：Pairwise Ranking Loss"""
    chosen_reward = reward_model(chosen_ids)
    rejected_reward = reward_model(rejected_ids)
    loss = -torch.log(torch.sigmoid(chosen_reward - rejected_reward))
    return loss.mean()


def ppo_step(policy_model, reward_model, prompts, kl_coef=0.1):
    """PPO 优化的简化版：策略梯度更新"""
    # 生成回答
    responses = []
    for prompt in prompts:
        # 简化：随机生成 token 序列作为响应
        response_len = 10
        response = torch.randint(0, 1000, (1, response_len))
        responses.append(response)
    
    # 计算奖励
    rewards = []
    for resp in responses:
        reward = reward_model(resp)
        rewards.append(reward.item())
    
    # 加入 KL 散度惩罚（防止策略偏离太远）
    kl_penalty = 0.0  # 简化处理
    adjusted_rewards = [r - kl_coef * kl_penalty for r in rewards]
    
    return adjusted_rewards


# ========== 4. 完整训练流水线 ==========

def run_full_pipeline():
    """运行完整的训练流水线"""
    print("=" * 60)
    print("Phase 1: 预训练 (Pre-training)")
    print("=" * 60)
    
    model = MiniGPT(vocab_size=1000, d_model=128, n_heads=4, n_layers=2)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    
    # 模拟预训练数据
    pretrain_losses = []
    for step in range(5):
        dummy_input = torch.randint(0, 1000, (4, 32))
        loss = pretrain_loss(model, dummy_input)
        loss.backward()
        optimizer.step()
        optimizer.zero_grad()
        pretrain_losses.append(loss.item())
        print(f"  预训练 Step {step+1}/5, Loss: {loss.item():.4f}")
    
    print("\n" + "=" * 60)
    print("Phase 2: SFT (监督微调)")
    print("=" * 60)
    
    dataset = create_sft_dataset()
    print(f"  SFT 数据集大小: {len(dataset)}")
    for i, sample in enumerate(dataset[:2]):
        formatted = format_sft_sample(sample)
        print(f"\n  样本 {i+1}:")
        print(f"  {formatted[:80]}...")
    
    # 模拟 SFT 训练
    sft_losses = []
    for step in range(5):
        dummy_input = torch.randint(0, 1000, (2, 32))
        dummy_labels = torch.randint(0, 1000, (2, 32))
        dummy_labels[:, :16] = -100  # 只在回答部分计算 loss
        loss = sft_loss(model, dummy_input, dummy_labels)
        loss.backward()
        optimizer.step()
        optimizer.zero_grad()
        sft_losses.append(loss.item())
        print(f"  SFT Step {step+1}/5, Loss: {loss.item():.4f}")
    
    print("\n" + "=" * 60)
    print("Phase 3: RLHF (人类反馈强化学习)")
    print("=" * 60)
    
    reward_model = RewardModel(MiniGPT(vocab_size=1000, d_model=128, n_heads=4, n_layers=2))
    
    # 训练奖励模型
    print("\n  --- 奖励模型训练 ---")
    pref_data = create_preference_data()
    rm_optimizer = torch.optim.Adam(reward_model.parameters(), lr=1e-3)
    
    for step in range(3):
        total_loss = 0
        for pair in pref_data:
            chosen = torch.randint(0, 1000, (1, 16))
            rejected = torch.randint(0, 1000, (1, 16))
            loss = reward_loss(reward_model, chosen, rejected)
            loss.backward()
            rm_optimizer.step()
            rm_optimizer.zero_grad()
            total_loss += loss.item()
        print(f"  RM Step {step+1}/3, Loss: {total_loss/len(pref_data):.4f}")
    
    # PPO 优化
    print("\n  --- PPO 策略优化 ---")
    prompts = ["什么是AI？", "如何编程？", "什么是数据？"]
    for step in range(3):
        rewards = ppo_step(model, reward_model, prompts)
        print(f"  PPO Step {step+1}/3, Avg Reward: {np.mean(rewards):.4f}")
    
    print("\n" + "=" * 60)
    print("训练完成！")
    print("=" * 60)
    
    # 输出训练曲线数据
    print("\n训练曲线数据:")
    print(f"  预训练 Loss: {[f'{l:.3f}' for l in pretrain_losses]}")
    print(f"  SFT Loss: {[f'{l:.3f}' for l in sft_losses]}")


if __name__ == "__main__":
    run_full_pipeline()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | GPU 内存不足 | 减小 batch_size 或 d_model，使用 gradient accumulation |
| 2 | SFT loss 不下降 | 检查 labels 是否正确设置 ignore_index=-100 |
| 3 | 奖励模型过拟合 | 增加偏好数据量，添加 dropout 正则化 |
| 4 | PPO 训练不稳定 | 降低学习率，增大 KL 惩罚系数 |
| 5 | 模型输出重复 | 增大 temperature，使用 top-p 采样 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Pre-training | 在海量无标注文本上学习语言规律 |
| SFT | 用指令-回答对训练模型学会对话 |
| RLHF | 用人类偏好信号通过强化学习优化模型 |
| Token | 模型处理文本的最小单位 |
| Attention | 让模型关注输入中不同位置信息的机制 |
| Reward Model | 学习人类偏好的打分模型 |
| PPO | 一种策略梯度强化学习算法 |
| KL Divergence | 衡量两个概率分布差异的指标 |
| Instruction Tuning | 用指令格式的数据微调模型 |

## ✅ 验收清单
- [ ] 能画出 Pre-train → SFT → RLHF 三阶段流程图
- [ ] 能解释每个阶段的损失函数
- [ ] 能构造一条合格的 SFT 训练数据
- [ ] 能解释奖励模型的 Pairwise Ranking Loss
- [ ] 代码能跑通并输出训练 loss

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
