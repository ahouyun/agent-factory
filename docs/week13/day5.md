# Day 5: Agent 自进化详解

> **Week 13 深度选修 | 第 5 天**

---

## 今日方向

今天我们深入研究 Agent 的自进化能力——让 Agent 能够从经验中学习、优化自身策略、实现自我改进。你将实现经验回放、Prompt 进化、Reflexion 反思模式和元学习机制，让 Agent 越用越聪明。

---

## 生活比喻

想象你在学骑自行车。第一次骑会摔倒（失败经验），但你会记住摔倒的原因（经验积累），下次调整姿势（策略优化），逐渐越骑越好（自我进化）。Agent 自进化也是同样的道理——从每次执行中学习，不断优化自己的行为策略。

---

## 今日三件事

1. **实现经验回放系统** — 存储、检索、重用历史经验
2. **构建 Reflexion 反思模式** — 用自然语言反思并改进
3. **实现 Prompt 进化** — 自动优化 Agent 的提示词

---

## 手把手路线

### 阶段一：环境准备

```bash
pip install numpy collections-extended
```

### 阶段二：理解自进化架构

```
执行任务 -> 记录经验 -> 评估结果 -> 反思总结 -> 更新策略 -> 执行新任务
    |                                                            |
    +----------- 经验回放 + 策略优化 + Prompt 进化 ------------+
```

### 阶段三：编写代码（见下方完整代码区）

---

## 代码区

```python
#!/usr/bin/env python3
"""
Day 5: Agent 自进化详解
Agent Factory Week 13 - Deep Dive Elective
pip install numpy
"""

import json
import time
import hashlib
import random
import copy
from datetime import datetime
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple
from enum import Enum
from collections import defaultdict, deque
import numpy as np


# ============================================================
# 第一部分：经验存储与回放
# ============================================================

class ExperienceType(Enum):
    SUCCESS = "success"
    FAILURE = "failure"
    PARTIAL = "partial"


@dataclass
class Experience:
    """单条经验记录"""
    exp_id: str
    task: str
    task_type: str
    actions: List[Dict]
    result: str
    exp_type: ExperienceType
    reward: float  # 0-1
    reflection: str = ""
    lessons: List[str] = field(default_factory=list)
    timestamp: float = field(default_factory=time.time)

    def to_dict(self):
        return {
            "id": self.exp_id, "task": self.task, "type": self.exp_type.value,
            "reward": self.reward, "reflection": self.reflection,
            "lessons": self.lessons, "actions": self.actions,
        }


class ExperienceReplay:
    """经验回放系统
    支持优先级采样、相似经验检索、经验衰减
    """
    def __init__(self, max_size=1000):
        self.max_size = max_size
        self.experiences: List[Experience] = []
        self.index_by_type: Dict[ExperienceType, List[int]] = defaultdict(list)
        self.index_by_task_type: Dict[str, List[int]] = defaultdict(list)

    def add(self, experience: Experience):
        """添加经验"""
        if len(self.experiences) >= self.max_size:
            # 移除最旧且最低奖励的经验
            min_idx = min(range(len(self.experiences)),
                         key=lambda i: (self.experiences[i].reward, self.experiences[i].timestamp))
            removed = self.experiences.pop(min_idx)
            self._rebuild_indices()

        idx = len(self.experiences)
        self.experiences.append(experience)
        self.index_by_type[experience.exp_type].append(idx)
        self.index_by_task_type[experience.task_type].append(idx)

    def sample_by_priority(self, n=10) -> List[Experience]:
        """优先级采样：高奖励和最近的经验更可能被采样"""
        if not self.experiences:
            return []

        # 计算采样概率：奖励越高 + 时间越新 -> 概率越高
        rewards = np.array([e.reward for e in self.experiences])
        timestamps = np.array([e.timestamp for e in self.experiences])
        recency = (timestamps - timestamps.min()) / max(timestamps.max() - timestamps.min(), 1)

        priorities = rewards * 0.7 + recency * 0.3
        priorities = priorities / priorities.sum()

        indices = np.random.choice(len(self.experiences),
                                   size=min(n, len(self.experiences)),
                                   replace=False, p=priorities)
        return [self.experiences[i] for i in indices]

    def get_similar(self, task: str, task_type: str = None, n=5) -> List[Experience]:
        """检索相似经验"""
        candidates = []
        if task_type and task_type in self.index_by_task_type:
            candidates = [self.experiences[i] for i in self.index_by_task_type[task_type]]
        else:
            candidates = self.experiences

        # 简单关键词匹配评分
        task_words = set(task.lower().split())
        scored = []
        for exp in candidates:
            exp_words = set(exp.task.lower().split())
            score = len(task_words & exp_words) / max(len(task_words), 1)
            scored.append((score, exp))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [exp for _, exp in scored[:n]]

    def get_best(self, task_type: str = None, n=10) -> List[Experience]:
        """获取最高奖励的经验"""
        candidates = self.experiences
        if task_type:
            candidates = [self.experiences[i] for i in self.index_by_task_type.get(task_type, [])]
        return sorted(candidates, key=lambda e: e.reward, reverse=True)[:n]

    def get_statistics(self) -> Dict:
        stats = {"total": len(self.experiences)}
        for t in ExperienceType:
            stats[t.value] = len(self.index_by_type.get(t, []))
        if self.experiences:
            stats["avg_reward"] = np.mean([e.reward for e in self.experiences])
        return stats

    def _rebuild_indices(self):
        self.index_by_type.clear()
        self.index_by_task_type.clear()
        for i, exp in enumerate(self.experiences):
            self.index_by_type[exp.exp_type].append(i)
            self.index_by_task_type[exp.task_type].append(i)


# 测试经验回放
print("=" * 60)
print("测试经验回放系统")
print("=" * 60)
replay = ExperienceReplay(max_size=100)

# 添加经验
tasks = [
    ("搜索 Python 教程", "search", 0.8, ["找到高质量教程"]),
    ("搜索机器学习资料", "search", 0.7, ["资料较全面"]),
    ("计算 2+2", "calc", 0.95, ["计算正确"]),
    ("搜索失败的尝试", "search", 0.3, ["搜索词不准确"]),
    ("计算复杂表达式", "calc", 0.6, ["部分正确"]),
]

for task, task_type, reward, lessons in tasks:
    exp = Experience(
        exp_id=hashlib.md5(task.encode()).hexdigest()[:8],
        task=task, task_type=task_type, actions=[{"type": "search", "query": task}],
        result=f"完成: {task}", exp_type=ExperienceType.SUCCESS if reward > 0.5 else ExperienceType.FAILURE,
        reward=reward, lessons=lessons
    )
    replay.add(exp)

# 统计
print(f"统计: {replay.get_statistics()}")

# 优先级采样
sampled = replay.sample_by_priority(3)
print(f"优先级采样 {len(sampled)} 条: {[(e.task, e.reward) for e in sampled]}")

# 相似检索
similar = replay.get_similar("搜索 Python", task_type="search")
print(f"相似经验: {[(e.task, e.reward) for e in similar]}")

# 最佳经验
best = replay.get_best(n=3)
print(f"最佳经验: {[(e.task, e.reward) for e in best]}")
print()


# ============================================================
# 第二部分：Reflexion 反思模式
# ============================================================

class ReflexionModule:
    """Reflexion: 用自然语言反思并改进
    核心思想: 将失败经验转化为语言反馈，指导后续决策
    """
    def __init__(self):
        self.reflections: List[Dict] = []
        self.feedback_history: List[str] = []

    def reflect(self, experience: Experience, context: Dict = None) -> Dict:
        """对经验进行反思"""
        reflection = {
            "task": experience.task,
            "success": experience.exp_type == ExperienceType.SUCCESS,
            "what_worked": [],
            "what_failed": [],
            "improvement_suggestions": [],
            "feedback_for_next_time": "",
        }

        if experience.exp_type == ExperienceType.SUCCESS:
            reflection["what_worked"] = experience.lessons
            reflection["feedback_for_next_time"] = (
                f"任务 '{experience.task}' 成功。关键因素: {', '.join(experience.lessons)}"
            )
        else:
            reflection["what_failed"] = experience.lessons
            reflection["improvement_suggestions"] = self._generate_suggestions(experience)
            reflection["feedback_for_next_time"] = (
                f"任务 '{experience.task}' 失败。原因: {', '.join(experience.lessons)}。"
                f"建议: {'; '.join(reflection['improvement_suggestions'])}"
            )

        self.reflections.append(reflection)
        self.feedback_history.append(reflection["feedback_for_next_time"])
        return reflection

    def _generate_suggestions(self, experience: Experience) -> List[str]:
        """生成改进建议"""
        suggestions = []
        task_type = experience.task_type

        if task_type == "search":
            suggestions.extend([
                "尝试更精确的搜索关键词",
                "使用引号进行精确匹配",
                "尝试不同的搜索引擎",
            ])
        elif task_type == "calc":
            suggestions.extend([
                "检查输入表达式的语法",
                "使用括号明确运算优先级",
                "分步计算复杂表达式",
            ])
        else:
            suggestions.extend([
                "将复杂任务分解为更小的子任务",
                "参考成功经验中的做法",
                "尝试不同的策略",
            ])

        return suggestions

    def get_feedback_prompt(self, n=3) -> str:
        """获取最近的反馈用于 Prompt"""
        if not self.feedback_history:
            return ""
        recent = self.feedback_history[-n:]
        return "历史反馈:\n" + "\n".join(f"  - {f}" for f in recent)


# 测试 Reflexion
print("=" * 60)
print("测试 Reflexion 反思模式")
print("=" * 60)
reflexion = ReflexionModule()

# 反思成功经验
success_exp = Experience(
    exp_id="s1", task="搜索 Python 教程", task_type="search",
    actions=[{"type": "search", "query": "Python tutorial"}],
    result="找到高质量教程", exp_type=ExperienceType.SUCCESS,
    reward=0.8, lessons=["使用英文关键词效果更好"]
)
ref1 = reflexion.reflect(success_exp)
print(f"成功反思: {ref1['feedback_for_next_time']}")

# 反思失败经验
failure_exp = Experience(
    exp_id="f1", task="搜索不存在的资料", task_type="search",
    actions=[{"type": "search", "query": "不存在的资料"}],
    result="未找到结果", exp_type=ExperienceType.FAILURE,
    reward=0.2, lessons=["搜索词过于具体"]
)
ref2 = reflexion.reflect(failure_exp)
print(f"失败反思: {ref2['feedback_for_next_time']}")
print(f"改进建议: {ref2['improvement_suggestions']}")

# 获取反馈 Prompt
print(f"\n反馈 Prompt:\n{reflexion.get_feedback_prompt()}")
print()


# ============================================================
# 第三部分：Prompt 进化
# ============================================================

class PromptEvolver:
    """Prompt 进化：自动优化 Agent 的提示词"""
    def __init__(self, base_prompt: str):
        self.base_prompt = base_prompt
        self.variants: List[Dict] = [{"prompt": base_prompt, "score": 0.5, "uses": 0}]
        self.generation = 0

    def get_current_prompt(self) -> str:
        """获取当前最佳 Prompt"""
        best = max(self.variants, key=lambda v: v["score"])
        return best["prompt"]

    def evaluate(self, prompt: str, success: bool, reward: float):
        """评估 Prompt 效果"""
        for variant in self.variants:
            if variant["prompt"] == prompt:
                variant["uses"] += 1
                # 指数移动平均更新分数
                alpha = 0.3
                variant["score"] = (1 - alpha) * variant["score"] + alpha * reward
                break

    def evolve(self) -> str:
        """进化：生成新的 Prompt 变体"""
        self.generation += 1
        current = self.get_current_prompt()

        # 变异策略
        mutations = [
            self._add_instruction,
            self._rephrase,
            self._add_example,
            self._simplify,
        ]

        mutated = random.choice(mutations)(current)
        new_variant = {"prompt": mutated, "score": 0.5, "uses": 0}
        self.variants.append(new_variant)

        # 保留最好的 5 个变体
        if len(self.variants) > 5:
            self.variants.sort(key=lambda v: v["score"], reverse=True)
            self.variants = self.variants[:5]

        return mutated

    def _add_instruction(self, prompt: str) -> str:
        additions = [
            "\n注意: 确保每一步都有明确的目标。",
            "\n提示: 优先使用最简单的方法。",
            "\n要求: 输出结果需要验证正确性。",
            "\n策略: 如果第一次失败，尝试不同的方法。",
        ]
        return prompt + random.choice(additions)

    def _rephrase(self, prompt: str) -> str:
        replacements = [
            ("请", "你需要"),
            ("完成", "实现"),
            ("搜索", "查找"),
            ("使用", "利用"),
        ]
        result = prompt
        for old, new in replacements:
            if old in result:
                result = result.replace(old, new, 1)
                break
        return result

    def _add_example(self, prompt: str) -> str:
        return prompt + "\n示例: 输入 '搜索 Python' -> 输出: 执行搜索并返回结果"

    def _simplify(self, prompt: str) -> str:
        lines = prompt.split("\n")
        # 移除空行和过长的行
        simplified = [l for l in lines if l.strip() and len(l) < 100]
        return "\n".join(simplified[:5])  # 只保留前5行

    def get_stats(self) -> Dict:
        return {
            "generation": self.generation,
            "variants": len(self.variants),
            "best_score": max(v["score"] for v in self.variants),
            "current_prompt": self.get_current_prompt()[:100] + "...",
        }


# 测试 Prompt 进化
print("=" * 60)
print("测试 Prompt 进化")
print("=" * 60)
evolver = PromptEvolver("你是一个智能助手，请帮助用户完成任务。")
print(f"初始 Prompt: {evolver.get_current_prompt()}")

# 模拟评估和进化
for i in range(5):
    prompt = evolver.get_current_prompt()
    success = random.random() > 0.3
    reward = random.uniform(0.5, 1.0) if success else random.uniform(0.1, 0.4)
    evolver.evaluate(prompt, success, reward)
    new_prompt = evolver.evolve()
    print(f"\n进化 {i+1}:")
    print(f"  新 Prompt: {new_prompt[:80]}...")
    print(f"  统计: {evolver.get_stats()}")

print(f"\n最终最佳 Prompt: {evolver.get_current_prompt()}")
print()


# ============================================================
# 第四部分：策略优化器
# ============================================================

class StrategyOptimizer:
    """策略优化器：根据经验调整行动策略"""
    def __init__(self):
        self.strategy_scores: Dict[str, Dict[str, float]] = defaultdict(
            lambda: {"success": 0, "failure": 0, "total": 0}
        )
        self.temperature = 1.0  # 探索 vs 利用的温度参数

    def record(self, task_type: str, strategy: str, success: bool):
        """记录策略效果"""
        key = f"{task_type}:{strategy}"
        self.strategy_scores[key]["total"] += 1
        if success:
            self.strategy_scores[key]["success"] += 1
        else:
            self.strategy_scores[key]["failure"] += 1

    def get_success_rate(self, task_type: str, strategy: str) -> float:
        """获取策略成功率"""
        key = f"{task_type}:{strategy}"
        data = self.strategy_scores[key]
        if data["total"] == 0:
            return 0.5
        return data["success"] / data["total"]

    def select_strategy(self, task_type: str, available_strategies: List[str]) -> str:
        """选择策略：epsilon-greedy"""
        if random.random() < 0.2 * self.temperature:
            # 探索：随机选择
            return random.choice(available_strategies)

        # 利用：选择成功率最高的
        best_strategy = max(available_strategies,
                           key=lambda s: self.get_success_rate(task_type, s))
        return best_strategy

    def decay_temperature(self, decay=0.95):
        """降低温度，减少探索"""
        self.temperature = max(0.1, self.temperature * decay)

    def get_stats(self) -> Dict:
        stats = {}
        for key, data in self.strategy_scores.items():
            rate = data["success"] / max(data["total"], 1)
            stats[key] = {"success_rate": round(rate, 3), "total": data["total"]}
        return stats


# 测试策略优化器
print("=" * 60)
print("测试策略优化器")
print("=" * 60)
optimizer = StrategyOptimizer()
strategies = ["关键词搜索", "高级搜索", "语义搜索"]

# 模拟策略选择和记录
for i in range(20):
    task_type = random.choice(["search", "calc"])
    strategy = optimizer.select_strategy(task_type, strategies)
    success = random.random() > 0.3
    optimizer.record(task_type, strategy, success)

# 查看统计
print("策略统计:")
for key, data in optimizer.get_stats().items():
    print(f"  {key}: 成功率={data['success_rate']}, 使用次数={data['total']}")

# 选择最佳策略
best = optimizer.select_strategy("search", strategies)
print(f"\n为 'search' 任务选择的策略: {best}")
print()


# ============================================================
# 第五部分：自进化 Agent
# ============================================================

class SelfEvolvingAgent:
    """自进化 Agent：整合经验回放、反思、Prompt 进化、策略优化"""
    def __init__(self, name="EvolvingAgent"):
        self.name = name
        self.replay = ExperienceReplay(max_size=500)
        self.reflexion = ReflexionModule()
        self.prompt_evolver = PromptEvolver("你是一个智能助手，请帮助用户完成任务。")
        self.strategy_optimizer = StrategyOptimizer()
        self.generation = 0
        self.task_history: List[Dict] = []

    def _get_task_type(self, task: str) -> str:
        if "搜索" in task or "查找" in task:
            return "search"
        elif "计算" in task or "算" in task:
            return "calc"
        elif "写" in task or "生成" in task:
            return "generate"
        return "general"

    def think(self, task: str) -> Dict:
        """思考：基于经验和策略决定行动"""
        task_type = self._get_task_type(task)

        # 检索相似经验
        similar_exps = self.replay.get_similar(task, task_type, n=3)

        # 获取策略建议
        available_strategies = ["直接执行", "分步执行", "参考经验"]
        strategy = self.strategy_optimizer.select_strategy(task_type, available_strategies)

        # 获取 Prompt
        prompt = self.prompt_evolver.get_current_prompt()

        # 获取反思反馈
        feedback = self.reflexion.get_feedback_prompt()

        return {
            "task_type": task_type,
            "strategy": strategy,
            "similar_experiences": len(similar_exps),
            "prompt_version": self.prompt_evolver.generation,
            "feedback": feedback[:100] if feedback else "无",
        }

    def act(self, task: str, thought: Dict) -> Tuple[str, float]:
        """执行任务"""
        # 模拟执行
        success = random.random() > 0.25
        reward = random.uniform(0.6, 1.0) if success else random.uniform(0.1, 0.4)
        result = f"任务 '{task}' {'成功' if success else '失败'}"

        # 记录策略
        self.strategy_optimizer.record(thought["task_type"], thought["strategy"], success)

        return result, reward

    def evaluate_and_learn(self, task: str, result: str, reward: float, thought: Dict):
        """评估并学习"""
        exp_type = ExperienceType.SUCCESS if reward > 0.5 else ExperienceType.FAILURE
        lessons = ["执行成功"] if reward > 0.5 else ["需要改进策略"]

        experience = Experience(
            exp_id=hashlib.md5(task.encode()).hexdigest()[:8],
            task=task, task_type=thought["task_type"],
            actions=[thought], result=result,
            exp_type=exp_type, reward=reward, lessons=lessons
        )

        # 存储经验
        self.replay.add(experience)

        # 反思
        self.reflexion.reflect(experience)

        # 评估 Prompt
        self.prompt_evolver.evaluate(
            self.prompt_evolver.get_current_prompt(), reward > 0.5, reward
        )

        # 定期进化 Prompt
        if self.generation % 3 == 0:
            self.prompt_evolver.evolve()

        # 降低探索温度
        self.strategy_optimizer.decay_temperature()

        self.generation += 1

    def run(self, task: str) -> Dict:
        """完整执行循环"""
        print(f"\n[{self.name}] 任务: {task}")

        # 思考
        thought = self.think(task)
        print(f"  策略: {thought['strategy']}, 相似经验: {thought['similar_experiences']}")

        # 执行
        result, reward = self.act(task, thought)
        print(f"  结果: {result}, 奖励: {reward:.2f}")

        # 学习
        self.evaluate_and_learn(task, result, reward, thought)

        return {"task": task, "result": result, "reward": reward, "generation": self.generation}

    def get_stats(self):
        return {
            "generation": self.generation,
            "experience_pool": self.replay.get_statistics(),
            "prompt_stats": self.prompt_evolver.get_stats(),
            "strategy_stats": self.strategy_optimizer.get_stats(),
        }


# 测试自进化 Agent
print("=" * 60)
print("测试自进化 Agent")
print("=" * 60)
agent = SelfEvolvingAgent("EvolvingAgent")

# 运行多个任务
tasks = [
    "搜索 Python 教程",
    "计算 123 * 456",
    "搜索机器学习资料",
    "搜索深度学习框架",
    "计算复杂数学表达式",
]

for task in tasks:
    agent.run(task)

# 查看进化状态
stats = agent.get_stats()
print(f"\n进化状态:")
print(f"  代数: {stats['generation']}")
print(f"  经验库: {stats['experience_pool']}")
print(f"  Prompt 代数: {stats['prompt_stats']['generation']}")
print(f"  最佳 Prompt 分数: {stats['prompt_stats']['best_score']:.3f}")
print()


# ============================================================
# 第六部分：元学习 (Meta-Learning)
# ============================================================

class MetaLearner:
    """元学习：学会如何学习"""
    def __init__(self):
        self.task_type_performance: Dict[str, List[float]] = defaultdict(list)
        self.learning_strategies: Dict[str, str] = {}

    def record_performance(self, task_type: str, performance: float):
        """记录任务类型的表现"""
        self.task_type_performance[task_type].append(performance)
        # 自动选择学习策略
        self._update_strategy(task_type)

    def _update_strategy(self, task_type: str):
        """更新学习策略"""
        performances = self.task_type_performance[task_type]
        if len(performances) < 3:
            self.learning_strategies[task_type] = "exploration"
            return

        recent = performances[-5:]
        avg = np.mean(recent)
        trend = np.polyfit(range(len(recent)), recent, 1)[0]

        if avg > 0.7 and trend > 0:
            self.learning_strategies[task_type] = "exploitation"
        elif avg < 0.3:
            self.learning_strategies[task_type] = "rethink"
        elif trend < -0.1:
            self.learning_strategies[task_type] = "diversify"
        else:
            self.learning_strategies[task_type] = "refinement"

    def get_strategy(self, task_type: str) -> str:
        """获取推荐的学习策略"""
        return self.learning_strategies.get(task_type, "exploration")

    def get_insights(self) -> Dict:
        """获取学习洞察"""
        insights = {}
        for task_type, perfs in self.task_type_performance.items():
            insights[task_type] = {
                "avg_performance": np.mean(perfs),
                "trend": "improving" if len(perfs) > 1 and perfs[-1] > perfs[0] else "stable",
                "strategy": self.get_strategy(task_type),
                "trials": len(perfs),
            }
        return insights


# 测试元学习
print("=" * 60)
print("测试元学习器")
print("=" * 60)
meta = MetaLearner()

# 模拟学习过程
for i in range(10):
    perf = 0.3 + i * 0.07 + random.uniform(-0.1, 0.1)  # 逐渐提升
    meta.record_performance("search", perf)

for i in range(5):
    perf = 0.8 + random.uniform(-0.1, 0.1)  # 已经很好
    meta.record_performance("calc", perf)

insights = meta.get_insights()
print("学习洞察:")
for task_type, info in insights.items():
    print(f"  {task_type}: 平均表现={info['avg_performance']:.3f}, "
          f"趋势={info['trend']}, 策略={info['strategy']}")
print()


# ============================================================
# 总结
# ============================================================

print("=" * 60)
print("Day 5 总结")
print("=" * 60)
print("构建的组件:")
print("  1. ExperienceReplay -- 经验回放系统（优先级采样）")
print("  2. ReflexionModule -- Reflexion 反思模式")
print("  3. PromptEvolver -- Prompt 自动进化")
print("  4. StrategyOptimizer -- 策略优化器")
print("  5. SelfEvolvingAgent -- 自进化 Agent")
print("  6. MetaLearner -- 元学习器")
print()
print("自进化循环:")
print("  执行 -> 记录经验 -> 反思 -> 优化策略 -> 进化 Prompt -> 再执行")
print()
print("关键收获:")
print("  1. 经验回放让 Agent 重用历史经验")
print("  2. Reflexion 用自然语言反思改进")
print("  3. Prompt 进化自动优化提示词")
print("  4. 策略优化平衡探索与利用")
print("  5. 元学习让 Agent 学会如何学习")
print()
print("明天预告: Day 6 真实世界案例分析 + 开发踩坑！")
```

---

## 预期输出

```
============================================================
测试经验回放系统
============================================================
统计: {'total': 5, 'success': 4, 'failure': 1, 'avg_reward': 0.67}
优先级采样 3 条: [('计算 2+2', 0.95), ('搜索 Python 教程', 0.8), ...]

============================================================
测试 Reflexion 反思模式
============================================================
成功反思: 任务 '搜索 Python 教程' 成功。关键因素: 使用英文关键词效果更好
失败反思: 任务 '搜索不存在的资料' 失败。原因: 搜索词过于具体。建议: ...

============================================================
测试自进化 Agent
============================================================
[EvolvingAgent] 任务: 搜索 Python 教程
  策略: 直接执行, 相似经验: 0
  结果: 任务 '搜索 Python 教程' 成功, 奖励: 0.82
...

进化状态:
  代数: 5
  经验库: {'total': 5, 'success': 4, 'failure': 1}
  Prompt 代数: 2
  最佳 Prompt 分数: 0.687

============================================================
测试元学习器
============================================================
学习洞察:
  search: 平均表现=0.612, 趋势=improving, 策略=refinement
  calc: 平均表现=0.803, 趋势=stable, 策略=exploitation
```

---

## 常见错误与解决方案

### 错误 1: 经验池溢出
**解决**: 增加 `max_size` 或使用更智能的淘汰策略

### 错误 2: Prompt 过度进化导致偏离
**解决**: 设置进化上限，保留原始 Prompt 作为 baseline

### 错误 3: 策略陷入局部最优
**解决**: 增加探索率（提高 temperature），定期重置策略

### 错误 4: 反思内容质量差
**解决**: 使用更强的 LLM 生成反思，或添加反思模板

---

## 每日挑战

### 挑战 1: 实现基于向量的经验检索
```python
# 使用 sentence-transformers 计算经验嵌入
# 实现真正的语义相似度检索
```

### 挑战 2: 实现 Prompt A/B 测试
```python
# 同时运行多个 Prompt 变体
# 根据效果自动选择最佳版本
```

### 挑战 3: 实现经验图谱
```python
# 将经验组织成图结构
# 分析经验之间的因果关系
```

---

## 今日小结

今天我们深入实现了 Agent 的自进化能力。这些机制让 Agent 能够从每次执行中学习，不断优化自己的行为。

**明天预告**: Day 6 真实世界案例分析 + 开发踩坑！
