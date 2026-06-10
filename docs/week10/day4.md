# 📅 Week 10 Day 4：Agent 训练数据构造 + 奖励模型设计

## 🧭 今日方向
> 学习如何为 Agent 构造高质量的训练数据，以及如何设计合适的奖励模型来引导 Agent 行为。

## 🎯 生活比喻
> 训练一个 Agent 就像训练一只导盲犬。训练数据就是"正确行为示范"：遇到红灯停下、遇到障碍物绕行、引导主人安全过马路。奖励模型就是"评分标准"：安全过马路得高分、闯红灯得低分、走错路扣分。好的数据和奖励设计，决定了 Agent 最终能不能真正"上岗"。

## 📋 今日三件事
1. 掌握 Agent 训练数据的构造方法（轨迹数据、偏好数据）
2. 学习 Agent 奖励模型的设计原则
3. 实现一个完整的 Agent 数据构造 pipeline

## 🗺️ 手把手路线

### Step 1：理解 Agent 训练数据的特殊性
- 做什么: 学习 Agent 数据与普通 SFT 数据的区别
- 为什么: Agent 数据包含多轮交互、工具调用、环境反馈
- 成功标志: 能列出 Agent 数据的三个核心要素

### Step 2：学习轨迹数据构造
- 做什么: 掌握如何从 expert demonstrations 构造训练数据
- 为什么: 轨迹数据是 Agent 学习的基础
- 成功标志: 能构造一条完整的 Agent 轨迹数据

### Step 3：学习奖励模型设计
- 做什么: 理解 Agent 场景下的多维奖励设计
- 为什么: 奖励模型决定了 Agent 学到什么行为
- 成功标志: 能设计一个包含 3 个维度的奖励函数

### Step 4：代码实践
- 做什么: 实现完整的 Agent 数据构造 pipeline
- 为什么: 代码是最好的理解方式
- 成功标志: 代码跑通并输出训练数据

## 💻 代码区

```python
"""
Agent 训练数据构造 + 奖励模型设计
包含轨迹数据构造、偏好数据构造、多维奖励模型
"""
import torch
import torch.nn as nn
import numpy as np
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
from enum import Enum
import json
import random

# ========== 1. 数据结构定义 ==========

class ActionType(Enum):
    """Agent 动作类型"""
    THINK = "think"        # 思考
    ACT = "act"            # 执行动作
    OBSERVE = "observe"    # 观察环境
    ANSWER = "answer"      # 给出答案


@dataclass
class AgentStep:
    """Agent 单步交互"""
    action_type: ActionType
    content: str
    tool_name: Optional[str] = None
    tool_input: Optional[str] = None
    tool_output: Optional[str] = None
    timestamp: float = 0.0


@dataclass
class AgentTrajectory:
    """Agent 完整轨迹"""
    task: str
    steps: List[AgentStep]
    final_answer: str
    success: bool
    metadata: Dict = field(default_factory=dict)


@dataclass
class PreferencePair:
    """偏好对比对"""
    prompt: str
    chosen_trajectory: AgentTrajectory
    rejected_trajectory: AgentTrajectory
    preference_reason: str


# ========== 2. Agent 训练数据构造 ==========

class AgentDataConstructor:
    """Agent 训练数据构造器"""
    
    def __init__(self):
        self.tools = self._define_tools()
    
    def _define_tools(self) -> Dict:
        """定义可用工具"""
        return {
            "search": {
                "description": "搜索信息",
                "input_format": "搜索关键词",
                "output_format": "搜索结果列表"
            },
            "calculate": {
                "description": "数学计算",
                "input_format": "数学表达式",
                "output_format": "计算结果"
            },
            "code_exec": {
                "description": "执行代码",
                "input_format": "Python 代码",
                "output_format": "执行结果"
            },
            "read_file": {
                "description": "读取文件",
                "input_format": "文件路径",
                "output_format": "文件内容"
            }
        }
    
    def create_expert_trajectory(self, task: str, solution_steps: List[Dict]) -> AgentTrajectory:
        """
        从专家解决方案构造轨迹数据
        
        Args:
            task: 任务描述
            solution_steps: 专家解决方案步骤
        """
        steps = []
        
        for i, step_data in enumerate(solution_steps):
            step = AgentStep(
                action_type=ActionType(step_data["type"]),
                content=step_data["content"],
                tool_name=step_data.get("tool_name"),
                tool_input=step_data.get("tool_input"),
                tool_output=step_data.get("tool_output"),
                timestamp=i * 1.0
            )
            steps.append(step)
        
        # 判断是否成功
        success = solution_steps[-1].get("success", True) if solution_steps else False
        final_answer = steps[-1].content if steps else ""
        
        return AgentTrajectory(
            task=task,
            steps=steps,
            final_answer=final_answer,
            success=success,
            metadata={"source": "expert_demonstration"}
        )
    
    def create_preference_pair(
        self,
        task: str,
        good_solution: List[Dict],
        bad_solution: List[Dict],
        reason: str
    ) -> PreferencePair:
        """创建偏好对比对"""
        chosen = self.create_expert_trajectory(task, good_solution)
        rejected = self.create_expert_trajectory(task, bad_solution)
        
        return PreferencePair(
            prompt=task,
            chosen_trajectory=chosen,
            rejected_trajectory=rejected,
            preference_reason=reason
        )
    
    def augment_trajectory(self, trajectory: AgentTrajectory) -> List[AgentTrajectory]:
        """数据增强：对轨迹进行变换"""
        augmented = []
        
        # 1. 路径扰动：随机删除某些步骤
        if len(trajectory.steps) > 2:
            for _ in range(2):
                new_steps = trajectory.steps.copy()
                # 随机删除一个非关键步骤
                del_idx = random.randint(0, len(new_steps) - 2)
                new_steps.pop(del_idx)
                augmented.append(AgentTrajectory(
                    task=trajectory.task,
                    steps=new_steps,
                    final_answer=trajectory.final_answer,
                    success=False,
                    metadata={"augmentation": "step_deletion"}
                ))
        
        # 2. 工具替换：将一个工具换成另一个
        for i, step in enumerate(trajectory.steps):
            if step.tool_name:
                new_steps = trajectory.steps.copy()
                other_tools = [t for t in self.tools.keys() if t != step.tool_name]
                if other_tools:
                    new_step = AgentStep(
                        action_type=step.action_type,
                        content=step.content,
                        tool_name=random.choice(other_tools),
                        tool_input=step.tool_input,
                        tool_output="[模拟输出]",
                        timestamp=step.timestamp
                    )
                    new_steps[i] = new_step
                    augmented.append(AgentTrajectory(
                        task=trajectory.task,
                        steps=new_steps,
                        final_answer=trajectory.final_answer,
                        success=False,
                        metadata={"augmentation": "tool_swap"}
                    ))
        
        return augmented
    
    def format_for_sft(self, trajectory: AgentTrajectory) -> Dict:
        """将轨迹格式化为 SFT 训练数据"""
        conversation = []
        
        # 添加任务
        conversation.append({
            "role": "user",
            "content": trajectory.task
        })
        
        # 添加步骤
        for step in trajectory.steps:
            if step.action_type == ActionType.THINK:
                conversation.append({
                    "role": "assistant",
                    "content": f"[思考] {step.content}"
                })
            elif step.action_type == ActionType.ACT:
                tool_call = f"\n```tool\n{step.tool_name}: {step.tool_input}\n```\n"
                conversation.append({
                    "role": "assistant",
                    "content": f"[行动] {step.content}{tool_call}"
                })
            elif step.action_type == ActionType.OBSERVE:
                conversation.append({
                    "role": "tool",
                    "content": step.tool_output or step.content
                })
            elif step.action_type == ActionType.ANSWER:
                conversation.append({
                    "role": "assistant",
                    "content": f"[回答] {step.content}"
                })
        
        return {
            "conversations": conversation,
            "metadata": {
                "task": trajectory.task,
                "success": trajectory.success,
                "num_steps": len(trajectory.steps),
                "tools_used": list(set(
                    s.tool_name for s in trajectory.steps if s.tool_name
                ))
            }
        }


# ========== 3. 奖励模型设计 ==========

class AgentRewardModel(nn.Module):
    """
    Agent 多维奖励模型
    
    评估维度：
    1. 任务完成度 (task_completion)
    2. 工具使用效率 (tool_efficiency)
    3. 推理质量 (reasoning_quality)
    """
    def __init__(self, input_dim=128, hidden_dim=64):
        super().__init__()
        
        # 共享编码器
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim)
        )
        
        # 多维度奖励头
        self.task_completion_head = nn.Linear(hidden_dim, 1)
        self.tool_efficiency_head = nn.Linear(hidden_dim, 1)
        self.reasoning_quality_head = nn.Linear(hidden_dim, 1)
        
        # 权重（可学习或手动设置）
        self.weights = nn.Parameter(torch.tensor([0.4, 0.3, 0.3]))
    
    def forward(self, trajectory_features: torch.Tensor) -> Dict[str, torch.Tensor]:
        """
        计算多维度奖励
        
        Args:
            trajectory_features: 轨迹特征向量
        
        Returns:
            各维度奖励和总奖励
        """
        encoded = self.encoder(trajectory_features)
        
        # 各维度奖励
        task_reward = torch.sigmoid(self.task_completion_head(encoded))
        tool_reward = torch.sigmoid(self.tool_efficiency_head(encoded))
        reasoning_reward = torch.sigmoid(self.reasoning_quality_head(encoded))
        
        # 加权总奖励
        weights = F.softmax(self.weights, dim=0)
        total_reward = (
            weights[0] * task_reward +
            weights[1] * tool_reward +
            weights[2] * reasoning_reward
        )
        
        return {
            "task_completion": task_reward,
            "tool_efficiency": tool_reward,
            "reasoning_quality": reasoning_reward,
            "total_reward": total_reward,
            "weights": weights.detach()
        }
    
    def extract_features(self, trajectory: AgentTrajectory) -> torch.Tensor:
        """从轨迹中提取特征"""
        features = []
        
        # 1. 轨迹长度（归一化）
        trajectory_length = min(len(trajectory.steps) / 10.0, 1.0)
        features.append(trajectory_length)
        
        # 2. 工具使用率
        tool_steps = sum(1 for s in trajectory.steps if s.tool_name)
        tool_usage_rate = tool_steps / max(len(trajectory.steps), 1)
        features.append(tool_usage_rate)
        
        # 3. 成功标志
        features.append(1.0 if trajectory.success else 0.0)
        
        # 4. 各工具使用次数（归一化）
        tool_counts = {}
        for step in trajectory.steps:
            if step.tool_name:
                tool_counts[step.tool_name] = tool_counts.get(step.tool_name, 0) + 1
        
        for tool_name in ["search", "calculate", "code_exec", "read_file"]:
            count = tool_counts.get(tool_name, 0) / max(len(trajectory.steps), 1)
            features.append(count)
        
        # 填充到固定长度
        while len(features) < 128:
            features.append(0.0)
        
        return torch.tensor(features[:128], dtype=torch.float32)


class RewardModelTrainer:
    """奖励模型训练器"""
    
    def __init__(self, reward_model: AgentRewardModel, lr=1e-4):
        self.reward_model = reward_model
        self.optimizer = torch.optim.Adam(reward_model.parameters(), lr=lr)
    
    def train_step(self, chosen_trajectory: AgentTrajectory, rejected_trajectory: AgentTrajectory):
        """单步训练"""
        self.reward_model.train()
        
        # 提取特征
        chosen_features = self.reward_model.extract_features(chosen_trajectory).unsqueeze(0)
        rejected_features = self.reward_model.extract_features(rejected_trajectory).unsqueeze(0)
        
        # 计算奖励
        chosen_rewards = self.reward_model(chosen_features)
        rejected_rewards = self.reward_model(rejected_features)
        
        # Pairwise Ranking Loss
        loss = -torch.log(
            torch.sigmoid(chosen_rewards["total_reward"] - rejected_rewards["total_reward"])
        )
        
        # 反向传播
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        
        return {
            "loss": loss.item(),
            "chosen_reward": chosen_rewards["total_reward"].item(),
            "rejected_reward": rejected_rewards["total_reward"].item()
        }
    
    def evaluate(self, trajectory: AgentTrajectory) -> Dict[str, float]:
        """评估单条轨迹"""
        self.reward_model.eval()
        with torch.no_grad():
            features = self.reward_model.extract_features(trajectory).unsqueeze(0)
            rewards = self.reward_model(features)
        return {k: v.item() for k, v in rewards.items() if k != "weights"}


# ========== 4. 完整 Pipeline ==========

def create_sample_data() -> List[PreferencePair]:
    """创建示例数据"""
    constructor = AgentDataConstructor()
    
    # 示例 1：数学计算任务
    good_solution_1 = [
        {"type": "think", "content": "需要计算 123 + 456 的结果"},
        {"type": "act", "content": "使用计算器", "tool_name": "calculate", "tool_input": "123 + 456", "tool_output": "579"},
        {"type": "observe", "content": "计算结果是 579"},
        {"type": "answer", "content": "123 + 456 = 579", "success": True}
    ]
    
    bad_solution_1 = [
        {"type": "think", "content": "让我想想...123 + 456...大概是600左右？"},
        {"type": "answer", "content": "答案是 600", "success": False}
    ]
    
    # 示例 2：信息查询任务
    good_solution_2 = [
        {"type": "think", "content": "需要查找 Python 的最新版本"},
        {"type": "act", "content": "搜索 Python 版本", "tool_name": "search", "tool_input": "Python latest version 2024", "tool_output": "Python 3.12"},
        {"type": "observe", "content": "搜索结果显示 Python 3.12 是最新稳定版"},
        {"type": "answer", "content": "Python 的最新稳定版本是 3.12", "success": True}
    ]
    
    bad_solution_2 = [
        {"type": "think", "content": "Python 版本...我记得是 3.x"},
        {"type": "answer", "content": "Python 版本是 3.0", "success": False}
    ]
    
    # 创建偏好对
    preference_pairs = [
        constructor.create_preference_pair(
            "计算 123 + 456",
            good_solution_1,
            bad_solution_1,
            "好的回答使用了工具精确计算，而不是猜测"
        ),
        constructor.create_preference_pair(
            "Python 的最新版本是什么",
            good_solution_2,
            bad_solution_2,
            "好的回答使用了搜索工具获取准确信息"
        ),
    ]
    
    return preference_pairs


def run_pipeline():
    """运行完整的数据构造和训练流程"""
    print("=" * 60)
    print("Agent 训练数据构造 + 奖励模型训练")
    print("=" * 60)
    
    # 1. 创建示例数据
    print("\n1. 创建偏好对比数据...")
    preference_pairs = create_sample_data()
    print(f"   创建了 {len(preference_pairs)} 个偏好对")
    
    # 2. 格式化为 SFT 数据
    print("\n2. 格式化为 SFT 训练数据...")
    constructor = AgentDataConstructor()
    sft_dataset = []
    for pair in preference_pairs:
        sft_data = constructor.format_for_sft(pair.chosen_trajectory)
        sft_dataset.append(sft_data)
        print(f"\n   任务: {pair.prompt}")
        print(f"   步骤数: {len(pair.chosen_trajectory.steps)}")
        print(f"   成功: {pair.chosen_trajectory.success}")
    
    # 3. 数据增强
    print("\n3. 数据增强...")
    augmented_dataset = []
    for pair in preference_pairs:
        augmented = constructor.augment_trajectory(pair.chosen_trajectory)
        augmented_dataset.extend(augmented)
        print(f"   原始轨迹增强为 {len(augmented) + 1} 条")
    
    # 4. 训练奖励模型
    print("\n4. 训练奖励模型...")
    reward_model = AgentRewardModel(input_dim=128, hidden_dim=64)
    trainer = RewardModelTrainer(reward_model, lr=1e-3)
    
    for step in range(5):
        pair = random.choice(preference_pairs)
        result = trainer.train_step(
            pair.chosen_trajectory,
            pair.rejected_trajectory
        )
        print(f"   Step {step+1}/5 - Loss: {result['loss']:.4f}, "
              f"Chosen: {result['chosen_reward']:.4f}, "
              f"Rejected: {result['rejected_reward']:.4f}")
    
    # 5. 评估示例轨迹
    print("\n5. 评估示例轨迹...")
    for pair in preference_pairs[:1]:
        chosen_eval = trainer.evaluate(pair.chosen_trajectory)
        rejected_eval = trainer.evaluate(pair.rejected_trajectory)
        
        print(f"\n   任务: {pair.prompt}")
        print(f"   好的回答:")
        print(f"     任务完成度: {chosen_eval['task_completion']:.4f}")
        print(f"     工具效率: {chosen_eval['tool_efficiency']:.4f}")
        print(f"     推理质量: {chosen_eval['reasoning_quality']:.4f}")
        print(f"     总奖励: {chosen_eval['total_reward']:.4f}")
        
        print(f"   差的回答:")
        print(f"     任务完成度: {rejected_eval['task_completion']:.4f}")
        print(f"     工具效率: {rejected_eval['tool_efficiency']:.4f}")
        print(f"     推理质量: {rejected_eval['reasoning_quality']:.4f}")
        print(f"     总奖励: {rejected_eval['total_reward']:.4f}")
    
    # 6. 保存数据集
    print("\n6. 保存训练数据...")
    export_data = []
    for pair in preference_pairs:
        export_data.append({
            "prompt": pair.prompt,
            "chosen": pair.chosen_trajectory.final_answer,
            "rejected": pair.rejected_trajectory.final_answer,
            "reason": pair.preference_reason
        })
    
    print(f"\n   导出格式示例:")
    print(json.dumps(export_data[0], ensure_ascii=False, indent=2))
    
    print("\n" + "=" * 60)
    print("Pipeline 完成！")
    print("=" * 60)


if __name__ == "__main__":
    run_pipeline()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 训练数据质量差 | 验证专家轨迹的正确性，增加多样性 |
| 2 | 奖励模型过拟合 | 增加训练数据，使用数据增强 |
| 3 | 奖励信号稀疏 | 设计中间奖励，分解任务目标 |
| 4 | 工具调用格式错误 | 定义严格的工具调用模板 |
| 5 | 数据不平衡 | 使用过采样或欠采样平衡数据 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Agent Trajectory | Agent 从任务开始到结束的完整交互轨迹 |
| Expert Demonstration | 专家提供的正确行为示范 |
| Preference Pair | 包含 chosen 和 rejected 的偏好对比对 |
| Reward Model | 学习评估 Agent 行为质量的模型 |
| Task Completion | 任务是否成功完成的评估维度 |
| Tool Efficiency | 工具使用是否合理的评估维度 |
| Reasoning Quality | 推理过程是否清晰的评估维度 |
| Data Augmentation | 通过变换增加训练数据多样性的技术 |

## ✅ 验收清单
- [ ] 能构造一条完整的 Agent 轨迹数据
- [ ] 能解释多维奖励模型的设计思路
- [ ] 代码能跑通并输出训练数据
- [ ] 能设计针对特定任务的奖励函数
- [ ] 理解数据增强对 Agent 训练的重要性

## 📝 训练数据预处理

在构造 Agent 训练数据之前，需要进行预处理：

### 数据清洗

| 步骤 | 说明 | 工具 |
|------|------|------|
| 去重 | 移除重复样本 | deduplicate-text-datasets |
| 过滤 | 移除低质量/有害内容 | detoxify |
| 格式化 | 统一对话格式 | 自定义脚本 |
| 标注 | 添加质量标签 | 人工 + LLM 辅助 |

### 数据格式转换

```python
# 将对话数据转换为训练格式
def convert_to_training_format(conversations):
    """将多轮对话转换为 SFT 训练格式"""
    messages = []
    for turn in conversations:
        messages.append({
            "role": turn["role"],
            "content": turn["content"]
        })
    return {"messages": messages}

# 示例
data = [
    {"role": "user", "content": "请帮我查询天气"},
    {"role": "assistant", "content": "我来帮你查询天气...", "tool_calls": [...]},
    {"role": "tool", "content": '{"temperature": 25}'},
    {"role": "assistant", "content": "今天气温 25°C，适合外出。"}
]
training_sample = convert_to_training_format(data)
```

### 数据质量评估

| 指标 | 说明 | 目标值 |
|------|------|--------|
| 对话完整性 | 每轮都有合理的回复 | > 95% |
| 工具调用正确性 | tool_calls 格式正确 | > 90% |
| 内容相关性 | 回复与问题相关 | > 85% |
| 多样性 | 涵盖多种场景 | 高 |

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
