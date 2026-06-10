# 📅 Week 10 Day 3：DPO / GRPO 偏好对齐算法

## 🧭 今日方向
> 深入理解 DPO 和 GRPO 两种无需奖励模型的偏好对齐方法，对比它们与 RLHF 的区别。

## 🎯 生活比喻
> RLHF 像是先找一个评委（奖励模型）打分，然后根据分数改进；DPO 像是直接看两个回答，记住哪个更好，然后自己学着往好的方向靠；GRPO 像是同时生成多个回答，让它们互相竞争，最好的留下。三种方法目标相同（让模型输出更符合人类偏好），但路径不同。

## 📋 今日三件事
1. 理解 DPO 如何绕过奖励模型，直接从偏好数据学习
2. 掌握 GRPO 的组相对策略优化原理
3. 对比 RLHF、DPO、GRPO 三种方法的优劣

## 🗺️ 手把手路线

### Step 1：理解 DPO 的数学推导
- 做什么: 学习 DPO 的核心公式：L = -log σ(β(log π(y_w|x)/π_ref(y_w|x) - log π(y_l|x)/π_ref(y_l|x)))
- 为什么: DPO 是目前最流行的对齐方法，理解公式才能正确使用
- 成功标志: 能解释公式中每个变量的含义

### Step 2：理解 GRPO 的组相对策略
- 做什么: 学习 GRPO 如何通过组内对比来优化策略
- 为什么: GRPO 是 DeepSeek 提出的方法，效率更高
- 成功标志: 能画出 GRPO 的训练流程图

### Step 3：三种方法对比
- 做什么: 整理 RLHF、DPO、GRPO 的优劣对比表
- 为什么: 理解差异才能在实际项目中选择合适的方法
- 成功标志: 能说出每种方法的最佳适用场景

### Step 4：代码实践
- 做什么: 实现 DPO 损失函数并测试
- 为什么: 代码是最好的理解方式
- 成功标志: 代码跑通，输出训练 loss

## 💻 代码区

```python
"""
DPO 和 GRPO 偏好对齐算法实现
对比 RLHF、DPO、GRPO 三种方法
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass

# ========== 1. 基础模型 ==========

class PolicyModel(nn.Module):
    """策略模型（简化版）"""
    def __init__(self, vocab_size=1000, d_model=128):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.fc = nn.Linear(d_model, vocab_size)
    
    def forward(self, input_ids):
        x = self.embedding(input_ids)
        # 简化：取平均池化
        x = x.mean(dim=1)
        logits = self.fc(x)
        return logits
    
    def log_prob(self, input_ids, action_ids):
        """计算 log 概率"""
        logits = self.forward(input_ids)
        log_probs = F.log_softmax(logits, dim=-1)
        # 选择 action 对应的 log 概率
        action_log_probs = log_probs.gather(1, action_ids.unsqueeze(1))
        return action_log_probs.squeeze(1)


# ========== 2. DPO 损失函数 ==========

class DPOLoss(nn.Module):
    """
    DPO (Direct Preference Optimization) 损失函数
    
    核心思想：直接从偏好数据学习，无需训练奖励模型
    
    损失公式：
    L = -E[log σ(β * (log π(y_w|x)/π_ref(y_w|x) - log π(y_l|x)/π_ref(y_l|x)))]
    
    其中：
    - y_w: chosen response (更好的回答)
    - y_l: rejected response (更差的回答)
    - π_ref: 参考模型（通常是 SFT 后的模型）
    - β: 温度参数，控制策略偏离参考模型的程度
    """
    def __init__(self, beta: float = 0.1):
        super().__init__()
        self.beta = beta
    
    def forward(
        self,
        policy_chosen_logps: torch.Tensor,
        policy_rejected_logps: torch.Tensor,
        reference_chosen_logps: torch.Tensor,
        reference_rejected_logps: torch.Tensor
    ) -> torch.Tensor:
        """
        计算 DPO 损失
        
        Args:
            policy_chosen_logps: 策略模型对 chosen 的 log 概率
            policy_rejected_logps: 策略模型对 rejected 的 log 概率
            reference_chosen_logps: 参考模型对 chosen 的 log 概率
            reference_rejected_logps: 参考模型对 rejected 的 log 概率
        
        Returns:
            DPO 损失
        """
        # 计算 logits
        chosen_logratios = policy_chosen_logps - reference_chosen_logps
        rejected_logratios = policy_rejected_logps - reference_rejected_logps
        
        # DPO 核心公式
        logits = self.beta * (chosen_logratios - rejected_logratios)
        
        # 损失
        loss = -F.logsigmoid(logits).mean()
        
        return loss
    
    def compute_rewards(
        self,
        policy_chosen_logps: torch.Tensor,
        policy_rejected_logps: torch.Tensor,
        reference_chosen_logps: torch.Tensor,
        reference_rejected_logps: torch.Tensor
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """从 DPO 隐式奖励"""
        chosen_logratios = policy_chosen_logps - reference_chosen_logps
        rejected_logratios = policy_rejected_logps - reference_rejected_logps
        
        chosen_rewards = self.beta * chosen_logratios
        rejected_rewards = self.beta * rejected_logratios
        
        return chosen_rewards, rejected_rewards


# ========== 3. GRPO 损失函数 ==========

class GRPOLoss(nn.Module):
    """
    GRPO (Group Relative Policy Optimization) 损失函数
    
    核心思想：生成一组回答，通过组内对比来优化策略
    
    优点：
    1. 无需训练奖励模型
    2. 无需参考模型
    3. 通过组内对比减少方差
    """
    def __init__(self, beta: float = 0.1, clip_range: float = 0.2):
        super().__init__()
        self.beta = beta
        self.clip_range = clip_range
    
    def forward(
        self,
        policy_logps: torch.Tensor,  # [group_size, seq_len]
        old_policy_logps: torch.Tensor,
        advantages: torch.Tensor,  # [group_size]
        rewards: torch.Tensor  # [group_size]
    ) -> torch.Tensor:
        """
        计算 GRPO 损失
        
        Args:
            policy_logps: 当前策略的 log 概率
            old_policy_logps: 旧策略的 log 概率
            advantages: 优势函数值
            rewards: 原始奖励
        
        Returns:
            GRPO 损失
        """
        # 计算概率比
        log_ratio = policy_logps.sum(dim=-1) - old_policy_logps.sum(dim=-1)
        ratio = torch.exp(log_ratio)
        
        # PPO 裁剪
        clipped_ratio = torch.clamp(
            ratio,
            1 - self.clip_range,
            1 + self.clip_range
        )
        
        # 计算损失
        loss1 = ratio * advantages
        loss2 = clipped_ratio * advantages
        policy_loss = -torch.min(loss1, loss2).mean()
        
        # KL 散度惩罚（相对于旧策略）
        kl_penalty = self.beta * (log_ratio.exp() - log_ratio - 1).mean()
        
        total_loss = policy_loss + kl_penalty
        
        return total_loss


# ========== 4. 数据准备 ==========

def create_preference_dataset() -> List[Dict]:
    """构造偏好对比数据集"""
    dataset = [
        {
            "prompt": "什么是机器学习？",
            "chosen": "机器学习是人工智能的一个分支，它使计算机能够从数据中学习，而无需显式编程。通过算法分析数据模式，机器学习可以做出预测和决策。",
            "rejected": "机器学习就是让电脑自己学东西。"
        },
        {
            "prompt": "如何提高编程能力？",
            "chosen": "提高编程能力需要：1. 坚持每天写代码 2. 阅读优秀开源项目 3. 参与实际项目 4. 学习算法和数据结构 5. 接受代码审查并改进。",
            "rejected": "多写代码就行了。"
        },
        {
            "prompt": "解释一下什么是 API",
            "chosen": "API（应用程序编程接口）是一组定义和协议，用于构建和集成应用程序软件。它允许不同的软件系统之间进行通信和数据交换。",
            "rejected": "API 就是接口。"
        },
        {
            "prompt": "什么是深度学习？",
            "chosen": "深度学习是机器学习的一个子领域，使用多层神经网络来学习数据的层次化表示。它在图像识别、自然语言处理等领域取得了突破性进展。",
            "rejected": "深度学习就是很多层的神经网络。"
        },
        {
            "prompt": "如何调试代码？",
            "chosen": "调试代码的有效方法包括：1. 使用 print 或日志输出 2. 使用调试器逐步执行 3. 检查变量值 4. 阅读错误信息 5. 搜索类似问题 6. 简化问题复现。",
            "rejected": "看报错信息啊。"
        },
    ]
    return dataset


def encode_sample(sample: Dict, tokenizer_func=None) -> Dict:
    """将样本编码为模型输入"""
    if tokenizer_func is None:
        # 简化：使用随机整数模拟 token ids
        def simple_tokenizer(text, max_len=32):
            # 简单的哈希模拟
            tokens = [ord(c) % 1000 for c in text[:max_len]]
            tokens += [0] * (max_len - len(tokens))
            return torch.tensor(tokens)
        tokenizer_func = simple_tokenizer
    
    return {
        "prompt_ids": tokenizer_func(sample["prompt"]),
        "chosen_ids": tokenizer_func(sample["chosen"]),
        "rejected_ids": tokenizer_func(sample["rejected"]),
    }


# ========== 5. 训练循环 ==========

def train_with_dpo():
    """使用 DPO 训练"""
    print("=" * 60)
    print("DPO 训练演示")
    print("=" * 60)
    
    # 初始化模型
    policy_model = PolicyModel(vocab_size=1000, d_model=128)
    reference_model = PolicyModel(vocab_size=1000, d_model=128)
    
    # 复制参数到参考模型
    reference_model.load_state_dict(policy_model.state_dict())
    reference_model.eval()
    for param in reference_model.parameters():
        param.requires_grad = False
    
    # DPO 损失
    dpo_loss_fn = DPOLoss(beta=0.1)
    
    # 优化器
    optimizer = torch.optim.Adam(policy_model.parameters(), lr=1e-4)
    
    # 准备数据
    dataset = create_preference_dataset()
    
    # 训练
    losses = []
    for epoch in range(3):
        epoch_loss = 0
        for sample in dataset:
            encoded = encode_sample(sample)
            
            # 计算 log 概率
            with torch.no_grad():
                ref_chosen_logps = reference_model.log_prob(
                    encoded["prompt_ids"].unsqueeze(0),
                    encoded["chosen_ids"][0]
                )
                ref_rejected_logps = reference_model.log_prob(
                    encoded["prompt_ids"].unsqueeze(0),
                    encoded["rejected_ids"][0]
                )
            
            policy_chosen_logps = policy_model.log_prob(
                encoded["prompt_ids"].unsqueeze(0),
                encoded["chosen_ids"][0]
            )
            policy_rejected_logps = policy_model.log_prob(
                encoded["prompt_ids"].unsqueeze(0),
                encoded["rejected_ids"][0]
            )
            
            # 计算损失
            loss = dpo_loss_fn(
                policy_chosen_logps,
                policy_rejected_logps,
                ref_chosen_logps,
                ref_rejected_logps
            )
            
            # 反向传播
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
        
        avg_loss = epoch_loss / len(dataset)
        losses.append(avg_loss)
        print(f"Epoch {epoch+1}/3, Loss: {avg_loss:.4f}")
    
    # 计算隐式奖励
    print("\n隐式奖励对比:")
    with torch.no_grad():
        for sample in dataset[:2]:
            encoded = encode_sample(sample)
            
            policy_chosen = policy_model.log_prob(
                encoded["prompt_ids"].unsqueeze(0),
                encoded["chosen_ids"][0]
            )
            policy_rejected = policy_model.log_prob(
                encoded["prompt_ids"].unsqueeze(0),
                encoded["rejected_ids"][0]
            )
            ref_chosen = reference_model.log_prob(
                encoded["prompt_ids"].unsqueeze(0),
                encoded["chosen_ids"][0]
            )
            ref_rejected = reference_model.log_prob(
                encoded["prompt_ids"].unsqueeze(0),
                encoded["rejected_ids"][0]
            )
            
            chosen_reward, rejected_reward = dpo_loss_fn.compute_rewards(
                policy_chosen, policy_rejected, ref_chosen, ref_rejected
            )
            
            print(f"  Prompt: {sample['prompt'][:20]}...")
            print(f"    Chosen reward: {chosen_reward.item():.4f}")
            print(f"    Rejected reward: {rejected_reward.item():.4f}")
            print(f"    Margin: {(chosen_reward - rejected_reward).item():.4f}")
    
    return losses


def train_with_grpo():
    """使用 GRPO 训练"""
    print("\n" + "=" * 60)
    print("GRPO 训练演示")
    print("=" * 60)
    
    # 初始化模型
    policy_model = PolicyModel(vocab_size=1000, d_model=128)
    old_policy_model = PolicyModel(vocab_size=1000, d_model=128)
    old_policy_model.load_state_dict(policy_model.state_dict())
    
    # GRPO 损失
    grpo_loss_fn = GRPOLoss(beta=0.1, clip_range=0.2)
    
    # 优化器
    optimizer = torch.optim.Adam(policy_model.parameters(), lr=1e-4)
    
    # 模拟训练
    group_size = 4
    losses = []
    
    for step in range(5):
        # 生成一组回答
        group_rewards = torch.randn(group_size)
        group_rewards = group_rewards - group_rewards.mean()  # 归一化
        
        # 计算优势
        advantages = group_rewards
        
        # 模拟策略 log 概率
        policy_logps = torch.randn(group_size, 10)
        old_policy_logps = torch.randn(group_size, 10)
        
        # 计算损失
        loss = grpo_loss_fn(policy_logps, old_policy_logps, advantages, group_rewards)
        
        # 反向传播
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        losses.append(loss.item())
        print(f"Step {step+1}/5, Loss: {loss.item():.4f}, Avg Reward: {group_rewards.mean().item():.4f}")
    
    return losses


# ========== 6. 三种方法对比 ==========

def compare_methods():
    """对比 RLHF、DPO、GRPO 三种方法"""
    print("\n" + "=" * 60)
    print("三种偏好对齐方法对比")
    print("=" * 60)
    
    comparison = {
        "方法": ["RLHF", "DPO", "GRPO"],
        "是否需要奖励模型": ["是", "否", "否"],
        "是否需要参考模型": ["否", "是", "否"],
        "训练稳定性": ["中等", "高", "高"],
        "计算开销": ["高", "中", "低"],
        "实现复杂度": ["高", "中", "低"],
        "适用场景": [
            "需要精确奖励信号的复杂任务",
            "有充足偏好数据的通用场景",
            "需要高效训练的资源受限场景"
        ]
    }
    
    # 打印对比表
    print("\n方法对比:")
    for key in comparison:
        if key == "方法":
            print(f"\n{key}:")
        else:
            print(f"\n{key}:")
            for i, method in enumerate(comparison["方法"]):
                print(f"  {method}: {comparison[key][i]}")
    
    # 选择指南
    print("\n选择指南:")
    print("1. 如果有充足的偏好数据且追求稳定性 → DPO")
    print("2. 如果资源有限且需要高效训练 → GRPO")
    print("3. 如果需要精确控制奖励信号 → RLHF")


if __name__ == "__main__":
    # 运行 DPO 训练
    dpo_losses = train_with_dpo()
    
    # 运行 GRPO 训练
    grpo_losses = train_with_grpo()
    
    # 对比三种方法
    compare_methods()
    
    # 绘制训练曲线（可选）
    try:
        import matplotlib.pyplot as plt
        
        plt.figure(figsize=(10, 4))
        plt.subplot(1, 2, 1)
        plt.plot(dpo_losses, marker='o', label='DPO')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.title('DPO Training Loss')
        plt.legend()
        plt.grid(True)
        
        plt.subplot(1, 2, 2)
        plt.plot(grpo_losses, marker='s', label='GRPO', color='orange')
        plt.xlabel('Step')
        plt.ylabel('Loss')
        plt.title('GRPO Training Loss')
        plt.legend()
        plt.grid(True)
        
        plt.tight_layout()
        plt.savefig('alignment_comparison.png', dpi=150)
        print("\n训练曲线已保存为 alignment_comparison.png")
    except ImportError:
        print("\nmatplotlib 未安装，跳过图表绘制")
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | DPO 训练后 chosen reward 下降 | 检查数据质量，降低 β 参数 |
| 2 | GRPO 训练不稳定 | 增大 group_size，降低学习率 |
| 3 | 模型输出变得保守 | 增大 β，减少 KL 惩罚 |
| 4 | 不知道选哪种方法 | 从 DPO 开始，它最简单稳定 |
| 5 | 偏好数据不足 | 使用 DPO，它对数据量要求较低 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| DPO | 直接从偏好数据学习，无需奖励模型 |
| GRPO | 组相对策略优化，通过组内对比训练 |
| Chosen | 偏好数据中更好的回答 |
| Rejected | 偏好数据中更差的回答 |
| Reference Model | DPO 中的参考策略，通常是 SFT 模型 |
| β (Beta) | 控制策略偏离参考模型程度的温度参数 |
| Implicit Reward | DPO 隐式学习的奖励函数 |
| Advantage | GRPO 中的优势函数，衡量动作相对好坏 |
| KL Divergence | 衡量两个策略分布差异的指标 |

## ✅ 验收清单
- [ ] 能解释 DPO 的核心公式
- [ ] 能解释 GRPO 的组相对策略原理
- [ ] 能说出 RLHF、DPO、GRPO 的主要区别
- [ ] 代码实现的 DPO 损失函数能正确运行
- [ ] 能根据场景选择合适的对齐方法

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
