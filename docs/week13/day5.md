# 📅 Week 13 Day 5：方向E - Agent 自进化

## 🧭 今日方向
> 学习如何让 Agent 能够从经验中学习，实现自我改进和进化。

## 🎯 生活比喻
> Agent 自进化就像人类的成长。婴儿（初始 Agent）只会简单的反应；随着成长（训练），他学会了走路、说话、思考；成年后（成熟 Agent），他能自主学习、总结经验、不断进步。自进化 Agent 也能从错误中学习，优化自己的行为策略。

## 📋 今日三件事
1. 理解 Agent 自进化的机制
2. 实现经验存储和回放
3. 构建自我改进的 Agent

## 🗺️ 手把手路线

### Step 1：自进化机制
- 做什么: 学习 Agent 如何从经验中学习
- 为什么: 这是智能系统的核心能力
- 成功标志: 能解释自进化的基本原理

### Step 2：经验管理
- 做什么: 实现经验存储、检索和回放
- 为什么: 经验是学习的基础
- 成功标志: 能实现经验管理系统

### Step 3：自我改进
- 做什么: 实现基于经验的策略优化
- 为什么: 这是进化的关键
- 成功标志: Agent 能从错误中改进

## 💻 代码区

```python
"""
Agent 自进化
从经验中学习和改进
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple
from enum import Enum
import json
import time
from collections import defaultdict

# ========== 1. 经验类型 ==========

class ExperienceType(Enum):
    """经验类型"""
    SUCCESS = "success"      # 成功经验
    FAILURE = "failure"      # 失败经验
    PARTIAL = "partial"      # 部分成功
    OBSERVATION = "observation"  # 观察


@dataclass
class Experience:
    """经验"""
    exp_id: str
    exp_type: ExperienceType
    task: str
    actions: List[Dict]
    result: str
    reward: float
    metadata: Dict = field(default_factory=dict)
    timestamp: float = 0.0
    embedding: List[float] = field(default_factory=list)


# ========== 2. 经验库 ==========

class ExperienceMemory:
    """经验记忆"""
    
    def __init__(self, max_size: int = 1000):
        self.experiences: List[Experience] = []
        self.max_size = max_size
        self.index_by_type: Dict[ExperienceType, List[int]] = defaultdict(list)
    
    def add(self, experience: Experience):
        """添加经验"""
        if len(self.experiences) >= self.max_size:
            # 移除最旧的经验
            removed = self.experiences.pop(0)
            self.index_by_type[removed.exp_type].pop(0)
        
        idx = len(self.experiences)
        self.experiences.append(experience)
        self.index_by_type[experience.exp_type].append(idx)
    
    def get_by_type(self, exp_type: ExperienceType, n: int = 10) -> List[Experience]:
        """按类型获取经验"""
        indices = self.index_by_type.get(exp_type, [])
        return [self.experiences[i] for i in indices[-n:]]
    
    def get_recent(self, n: int = 10) -> List[Experience]:
        """获取最近的经验"""
        return self.experiences[-n:]
    
    def get_best(self, n: int = 10) -> List[Experience]:
        """获取最好的经验"""
        sorted_exps = sorted(self.experiences, key=lambda e: e.reward, reverse=True)
        return sorted_exps[:n]
    
    def search_similar(self, task: str, n: int = 5) -> List[Experience]:
        """搜索相似经验"""
        # 简化：基于关键词匹配
        results = []
        task_lower = task.lower()
        
        for exp in self.experiences:
            if task_lower in exp.task.lower():
                results.append(exp)
        
        return results[:n]
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        stats = {
            "total": len(self.experiences),
            "by_type": {t.value: len(indices) for t, indices in self.index_by_type.items()},
            "avg_reward": sum(e.reward for e in self.experiences) / max(len(self.experiences), 1)
        }
        return stats


# ========== 3. 策略优化器 ==========

class StrategyOptimizer:
    """策略优化器"""
    
    def __init__(self):
        self.strategies: Dict[str, float] = {}
        self.strategy_history: List[Dict] = []
    
    def update_strategy(self, task_type: str, success: bool, reward: float):
        """更新策略"""
        if task_type not in self.strategies:
            self.strategies[task_type] = 0.5  # 初始置信度
        
        # 更新策略
        current = self.strategies[task_type]
        if success:
            self.strategies[task_type] = min(1.0, current + 0.1 * reward)
        else:
            self.strategies[task_type] = max(0.0, current - 0.1)
        
        self.strategy_history.append({
            "task_type": task_type,
            "success": success,
            "reward": reward,
            "new_confidence": self.strategies[task_type]
        })
    
    def get_confidence(self, task_type: str) -> float:
        """获取策略置信度"""
        return self.strategies.get(task_type, 0.5)
    
    def suggest_action(self, task_type: str) -> str:
        """建议动作"""
        confidence = self.get_confidence(task_type)
        
        if confidence > 0.8:
            return "使用高效策略"
        elif confidence > 0.5:
            return "使用标准策略"
        else:
            return "使用保守策略"


# ========== 4. 自进化 Agent ==========

class SelfEvolvingAgent:
    """自进化 Agent"""
    
    def __init__(self, name: str = "EvolvingAgent"):
        self.name = name
        self.memory = ExperienceMemory()
        self.optimizer = StrategyOptimizer()
        self.current_task: str = ""
        self.current_actions: List[Dict] = []
        self.generation: int = 0
    
    def _get_task_type(self, task: str) -> str:
        """获取任务类型"""
        if "搜索" in task:
            return "search"
        elif "计算" in task:
            return "calculate"
        elif "生成" in task:
            return "generate"
        return "general"
    
    def think(self, task: str) -> Dict:
        """思考"""
        self.current_task = task
        task_type = self._get_task_type(task)
        
        # 获取相似经验
        similar_exps = self.memory.search_similar(task)
        
        # 获取策略建议
        suggestion = self.optimizer.suggest_action(task_type)
        confidence = self.optimizer.get_confidence(task_type)
        
        # 决定是否借鉴经验
        if similar_exps and confidence < 0.8:
            # 使用成功经验的策略
            best_exp = max(similar_exps, key=lambda e: e.reward)
            strategy = f"借鉴经验: {best_exp.actions[0] if best_exp.actions else '无'}"
        else:
            strategy = suggestion
        
        return {
            "task_type": task_type,
            "confidence": confidence,
            "similar_experiences": len(similar_exps),
            "strategy": strategy
        }
    
    def act(self, action: Dict):
        """执行动作"""
        self.current_actions.append(action)
    
    def evaluate(self, result: str, reward: float) -> Experience:
        """评估结果"""
        # 创建经验
        experience = Experience(
            exp_id=f"exp_{self.memory.get_statistics()['total']}",
            exp_type=ExperienceType.SUCCESS if reward > 0.5 else ExperienceType.FAILURE,
            task=self.current_task,
            actions=self.current_actions.copy(),
            result=result,
            reward=reward,
            timestamp=time.time()
        )
        
        # 存储经验
        self.memory.add(experience)
        
        # 更新策略
        task_type = self._get_task_type(self.current_task)
        self.optimizer.update_strategy(
            task_type,
            reward > 0.5,
            reward
        )
        
        # 清空当前状态
        self.current_task = ""
        self.current_actions = []
        self.generation += 1
        
        return experience
    
    def learn_from_experience(self, n: int = 5):
        """从经验中学习"""
        # 获取最近的成功经验
        success_exps = self.memory.get_by_type(ExperienceType.SUCCESS, n)
        
        # 分析成功模式
        action_patterns = defaultdict(int)
        for exp in success_exps:
            for action in exp.actions:
                action_type = action.get("type", "unknown")
                action_patterns[action_type] += 1
        
        # 返回最常见的动作模式
        if action_patterns:
            return dict(sorted(action_patterns.items(), key=lambda x: x[1], reverse=True))
        return {}
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        return {
            "generation": self.generation,
            "memory_stats": self.memory.get_statistics(),
            "strategies": dict(self.optimizer.strategies)
        }


# ========== 5. 示例运行 ==========

def main():
    print("=" * 60)
    print("Agent 自进化")
    print("=" * 60)
    
    # 1. 创建 Agent
    agent = SelfEvolvingAgent("EvolvingAgent")
    
    # 2. 模拟任务和学习
    print("\n1. 模拟任务学习...")
    tasks = [
        ("搜索 Python 教程", 0.8),
        ("搜索机器学习资料", 0.7),
        ("计算 2+2", 0.9),
        ("搜索失败的尝试", 0.3),
    ]
    
    for task, expected_reward in tasks:
        # 思考
        thought = agent.think(task)
        print(f"\n   任务: {task}")
        print(f"   思考: {thought['strategy']}")
        
        # 执行
        agent.act({"type": "search", "query": task})
        
        # 评估
        result = f"完成: {task}"
        experience = agent.evaluate(result, expected_reward)
        
        print(f"   结果: {experience.exp_type.value}")
        print(f"   奖励: {experience.reward}")
    
    # 3. 从经验学习
    print("\n2. 从经验学习...")
    patterns = agent.learn_from_experience()
    print(f"   成功模式: {patterns}")
    
    # 4. 查看进化状态
    print("\n3. 进化状态:")
    stats = agent.get_stats()
    print(f"   进化代数: {stats['generation']}")
    print(f"   经验库: {stats['memory_stats']}")
    print(f"   策略: {stats['strategies']}")
    
    # 5. 架构图
    print("\n4. 自进化 Agent 架构:")
    print("-" * 40)
    print("""
    ┌─────────────────────────────────────────┐
    │         自进化 Agent                     │
    │  ┌─────────────────────────────────┐   │
    │  │         思考与规划               │   │
    │  │    (借鉴历史经验)                │   │
    │  └───────────────┬─────────────────┘   │
    │                  │                      │
    │  ┌───────────────▼───────────────┐   │
    │  │         执行与观察             │   │
    │  └───────────────┬───────────────┘   │
    │                  │                      │
    │  ┌───────────────▼───────────────┐   │
    │  │         评估与存储             │   │
    │  │    (Experience Memory)        │   │
    │  └───────────────┬───────────────┘   │
    │                  │                      │
    │  ┌───────────────▼───────────────┐   │
    │  │         策略优化               │   │
    │  │    (Strategy Optimizer)       │   │
    │  └───────────────────────────────┘   │
    └─────────────────────────────────────────┘
""")
    
    print("\n5. 自进化机制:")
    print("-" * 40)
    print("  1. 经验存储: 记录每次任务的执行过程")
    print("  2. 经验检索: 查找相似任务的历史经验")
    print("  3. 策略借鉴: 从成功经验中学习策略")
    print("  4. 策略优化: 根据结果调整策略置信度")
    print("  5. 持续进化: 每次任务都是一次学习机会")


if __name__ == "__main__":
    main()
```

## 🧬 Agent 自进化详解

### 自进化的四种模式

| 模式 | 说明 | 实现方式 |
|------|------|---------|
| 经验积累 | 记住成功/失败的经验 | 长期记忆 + 反馈循环 |
| 技能学习 | 从新任务中学习新技能 | Few-shot + 工具注册 |
| 策略优化 | 优化决策策略 | 强化学习 + 奖励模型 |
| 知识更新 | 更新内部知识库 | RAG + 知识图谱 |

### 自进化循环

```
执行任务 → 观察结果 → 反思总结 → 更新策略 → 执行新任务
    ↑                                              │
    └──────────────────────────────────────────────┘
```

### 代表项目

| 项目 | 自进化方式 | 特点 |
|------|-----------|------|
| Voyager (Minecraft) | 技能库 + 代码生成 | 在游戏中学习新技能 |
| Generative Agents | 记忆 + 反思 | 模拟人类行为 |
| Reflexion | 语言反思 | 用自然语言总结经验 |
| ADAS | 自动决策 | 自动调整 Agent 策略 |

### 实现一个简单的自进化 Agent

```python
class SelfEvolvingAgent:
    def __init__(self):
        self.memory = []  # 经验记忆
        self.skills = {}  # 已学会的技能

    def execute(self, task):
        # 1. 尝试用已有技能
        if task in self.skills:
            result = self.skills[task]()
        else:
            result = self.learn_new_skill(task)

        # 2. 反思结果
        reflection = self.reflect(task, result)
        self.memory.append(reflection)

        # 3. 更新策略
        if reflection["success"]:
            self.reinforce(task)
        else:
            self.adapt(task, reflection)

        return result

    def learn_new_skill(self, task):
        """从新任务中学习技能"""
        # 用 LLM 生成解决方案
        solution = self.llm.generate(f"如何完成: {task}")
        # 保存为新技能
        self.skills[task] = solution
        return solution()

    def reflect(self, task, result):
        """反思执行结果"""
        return self.llm.analyze(f"任务:{task}, 结果:{result}, 总结经验")
```

> Agent 自进化是 Agent 技术的终极方向之一，让 Agent 能够越用越聪明。

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 学习速度慢 | 调整学习率，增加经验权重 |
| 2 | 策略不稳定 | 添加经验回放缓冲区 |
| 3 | 忘记旧经验 | 使用优先级经验回放 |
| 4 | 探索不足 | 添加随机探索策略 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Self-Evolving | 能自我改进的系统 |
| Experience | 执行任务的经验记录 |
| Experience Replay | 经验回放，重用历史经验 |
| Strategy Optimization | 策略优化 |
| Reward | 任务执行的奖励信号 |
| Confidence | 策略的置信度 |

## ✅ 验收清单
- [ ] 理解 Agent 自进化机制
- [ ] 能实现经验管理系统
- [ ] 能实现策略优化
- [ ] 代码能跑通

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
