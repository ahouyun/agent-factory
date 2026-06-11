# 📅 Week 4 Day 5：Metacognition 范式——元认知与自我监控

## 🧭 今日方向
> 学习 Metacognition（元认知）范式——让 Agent 能够"思考自己的思考"。实现自我监控、自信评估、策略选择和自我纠正四个核心能力，用问题求解器演示完整的元认知流程。

## 🎯 生活比喻
> 元认知就像考试时的心理活动：你做完一道题后会想"我确定这个答案吗？"（自信评估），"还有没有其他解法？"（策略选择），"等等，我刚才算错了"（自我纠正）。好的学习者不只是做题，还会监控自己做题的过程。

## 📋 今日三件事
1. 理解元认知的四个核心能力：监控、评估、策略选择、纠正
2. 实现 CognitiveMonitor（认知监控器）和 MetacognitiveAgent
3. 运行问题求解示例，观察 Agent 的自我监控和调整过程

---

## 🗺️ 手把手路线

### Step 1: 实现认知监控器
- **做什么**: 实现 CognitiveMonitor，能跟踪 Agent 的每一步操作和性能
- **为什么**: 监控是元认知的基础，不知道自己在做什么就无法优化
- **成功标志**: 能记录并统计 Agent 的操作历史

### Step 2: 实现自信评估和策略选择
- **做什么**: 让 Agent 能评估自己的置信度，并选择合适的解题策略
- **为什么**: 知道自己"有多确定"比"给出答案"更重要
- **成功标志**: Agent 能输出自信分数并根据自信度调整行为

### Step 3: 运行完整元认知示例
- **做什么**: 用数学问题求解器展示完整的监控-评估-选择-纠正循环
- **为什么**: 只有完整运行才能理解元认知的实际效果
- **成功标志**: 能观察到 Agent 在不确定时主动调整策略

---

## 💻 代码区

### 代码 1: 认知监控器

```python
"""
Metacognition 范式：认知监控器（CognitiveMonitor）
跟踪和记录 Agent 的认知过程
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from enum import Enum
import time


class CognitiveState(str, Enum):
    """认知状态"""
    IDLE = "idle"                  # 空闲
    THINKING = "thinking"          # 思考中
    EXECUTING = "executing"        # 执行中
    EVALUATING = "evaluating"      # 评估中
    UNCERTAIN = "uncertain"        # 不确定
    CONFIDENT = "confident"        # 自信


@dataclass
class CognitiveStep:
    """认知步骤记录"""
    step_id: int
    action: str              # 操作描述
    input_data: Any          # 输入
    output_data: Any         # 输出
    confidence: float        # 自信度 0.0-1.0
    duration: float          # 耗时（秒）
    state: CognitiveState    # 认知状态
    metadata: Dict = field(default_factory=dict)


class CognitiveMonitor:
    """
    认知监控器：跟踪 Agent 的每一步操作

    功能：
    1. 记录每个认知步骤
    2. 统计性能指标
    3. 检测异常模式
    4. 提供自我分析报告
    """

    def __init__(self):
        self.steps: List[CognitiveStep] = []
        self.current_state = CognitiveState.IDLE
        self.start_time = time.time()

    def record_step(self, action: str, input_data: Any, output_data: Any,
                    confidence: float, state: CognitiveState = None) -> CognitiveStep:
        """记录一个认知步骤"""
        step_id = len(self.steps) + 1

        # 计算耗时
        now = time.time()
        duration = now - (self.steps[-1].step_id if self.steps else self.start_time)
        duration = min(duration, 10.0)  # 限制最大值避免异常

        if state is None:
            state = self.current_state

        step = CognitiveStep(
            step_id=step_id,
            action=action,
            input_data=str(input_data)[:100],
            output_data=str(output_data)[:100],
            confidence=confidence,
            duration=duration,
            state=state,
        )

        self.steps.append(step)
        return step

    def set_state(self, state: CognitiveState):
        """设置当前认知状态"""
        self.current_state = state

    def get_statistics(self) -> Dict:
        """获取性能统计"""
        if not self.steps:
            return {"total_steps": 0}

        confidences = [s.confidence for s in self.steps]
        durations = [s.duration for s in self.steps]

        return {
            "total_steps": len(self.steps),
            "avg_confidence": sum(confidences) / len(confidences),
            "min_confidence": min(confidences),
            "max_confidence": max(confidences),
            "total_duration": sum(durations),
            "avg_duration": sum(durations) / len(durations),
            "low_confidence_steps": sum(1 for c in confidences if c < 0.5),
        }

    def detect_patterns(self) -> List[str]:
        """检测异常模式"""
        patterns = []

        if len(self.steps) < 3:
            return patterns

        # 模式1：连续低自信
        recent = self.steps[-3:]
        if all(s.confidence < 0.5 for s in recent):
            patterns.append("连续3步自信度低，可能需要改变策略")

        # 模式2：耗时过长
        if any(s.duration > 5.0 for s in recent):
            patterns.append("最近步骤耗时过长，可能陷入死循环")

        # 模式3：状态反复跳转
        states = [s.state for s in self.steps[-5:]]
        if len(set(states)) > 3:
            patterns.append("认知状态频繁切换，可能缺乏明确方向")

        return patterns

    def generate_report(self) -> str:
        """生成监控报告"""
        stats = self.get_statistics()
        patterns = self.detect_patterns()

        lines = [
            "  认知监控报告:",
            f"    总步骤: {stats.get('total_steps', 0)}",
            f"    平均自信度: {stats.get('avg_confidence', 0):.2f}",
            f"    低自信步骤: {stats.get('low_confidence_steps', 0)}",
            f"    总耗时: {stats.get('total_duration', 0):.2f}s",
        ]

        if patterns:
            lines.append("    异常模式:")
            for p in patterns:
                lines.append(f"      ⚠️ {p}")

        return "\n".join(lines)
```

### 代码 2: 元认知引擎和 Agent

```python
"""
Metacognition 范式：元认知引擎和 Agent
实现自我监控、自信评估、策略选择、自我纠正
"""

class Strategy:
    """解题策略"""

    def __init__(self, name: str, description: str,
                 accuracy: float, speed: float):
        self.name = name
        self.description = description
        self.accuracy = accuracy       # 预期准确率
        self.speed = speed             # 预期速度（1=快，0=慢）
        self.usage_count = 0           # 使用次数
        self.success_count = 0         # 成功次数

    @property
    def success_rate(self) -> float:
        """成功率"""
        if self.usage_count == 0:
            return self.accuracy  # 使用默认准确率
        return self.success_count / self.usage_count

    def record_usage(self, success: bool):
        """记录使用结果"""
        self.usage_count += 1
        if success:
            self.success_count += 1

    def __str__(self):
        return f"{self.name}(成功率:{self.success_rate:.0%})"


class MetacognitiveEngine:
    """
    元认知引擎：思考自己的思考

    核心能力：
    1. 自信评估：评估当前推理的可信度
    2. 策略选择：根据问题特征选择最佳策略
    3. 自我纠正：在发现问题时调整方向
    """

    def __init__(self):
        self.monitor = CognitiveMonitor()
        self.strategies: Dict[str, Strategy] = {}
        self._init_strategies()

    def _init_strategies(self):
        """初始化默认策略"""
        self.strategies = {
            "direct": Strategy("直接求解", "直接计算得出结果", 0.6, 0.9),
            "decompose": Strategy("分步求解", "将问题分解为小步骤", 0.8, 0.5),
            "verify": Strategy("验证求解", "先求解再验证结果", 0.9, 0.3),
            "analogy": Strategy("类比求解", "参考类似问题的解法", 0.7, 0.6),
        }

    def assess_confidence(self, problem: str, current_approach: str,
                          partial_result: Any = None) -> float:
        """
        评估自信度

        考虑因素：
        - 问题复杂度
        - 当前方法的适用性
        - 部分结果的合理性
        """
        self.monitor.set_state(CognitiveState.EVALUATING)

        # 基础自信度
        base_confidence = 0.5

        # 因素1：问题复杂度（基于长度和关键词）
        complexity_indicators = ["证明", "推导", "优化", "证明题", "积分", "微分"]
        complexity = sum(1 for w in complexity_indicators if w in problem)
        base_confidence -= complexity * 0.05

        # 因素2：当前方法的适用性
        if current_approach == "direct" and complexity > 2:
            base_confidence -= 0.15  # 复杂问题不适合直接求解
        elif current_approach == "decompose":
            base_confidence += 0.1   # 分步求解适合大多数问题

        # 因素3：部分结果
        if partial_result is not None:
            result_str = str(partial_result)
            if "错误" in result_str or "失败" in result_str:
                base_confidence -= 0.2
            elif "正确" in result_str or "成功" in result_str:
                base_confidence += 0.1

        confidence = max(0.1, min(0.95, base_confidence))

        # 记录
        self.monitor.record_step(
            action=f"自信评估: {current_approach}",
            input_data=problem,
            output_data=f"自信度: {confidence:.2f}",
            confidence=confidence,
            state=CognitiveState.CONFIDENT if confidence > 0.7 else CognitiveState.UNCERTAIN,
        )

        return confidence

    def select_strategy(self, problem: str, confidence: float) -> Strategy:
        """
        根据自信度和问题特征选择策略

        逻辑：
        - 自信度高 -> 使用快速策略
        - 自信度低 -> 使用准确策略
        """
        self.monitor.set_state(CognitiveState.THINKING)

        if confidence > 0.7:
            # 自信度高，选择快速策略
            selected = self.strategies["direct"]
        elif confidence > 0.4:
            # 自信度中等，选择平衡策略
            selected = self.strategies["decompose"]
        else:
            # 自信度低，选择最准确的策略
            selected = self.strategies["verify"]

        self.monitor.record_step(
            action=f"策略选择: {selected.name}",
            input_data=f"自信度={confidence:.2f}",
            output_data=selected.name,
            confidence=confidence,
        )

        return selected

    def should_correct(self, confidence: float, result: Any) -> bool:
        """判断是否需要自我纠正"""
        # 自信度过低
        if confidence < 0.3:
            return True
        # 结果包含错误标记
        if result and ("错误" in str(result) or "失败" in str(result)):
            return True
        return False

    def correct(self, problem: str, strategy: Strategy,
                confidence: float) -> Strategy:
        """自我纠正：切换到更可靠的策略"""
        self.monitor.set_state(CognitiveState.UNCERTAIN)

        print(f"    🔄 自我纠正: 从 {strategy.name} 切换")

        # 按成功率排序，选择最佳策略
        sorted_strategies = sorted(
            self.strategies.values(),
            key=lambda s: s.success_rate,
            reverse=True,
        )

        # 选择与当前不同的最佳策略
        for s in sorted_strategies:
            if s.name != strategy.name:
                print(f"    🔄 切换到: {s.name}")
                self.monitor.record_step(
                    action=f"自我纠正: {strategy.name} -> {s.name}",
                    input_data=f"原策略成功率: {strategy.success_rate:.0%}",
                    output_data=s.name,
                    confidence=confidence,
                )
                return s

        return strategy
```

### 代码 3: 元认知 Agent 完整示例

```python
"""
Metacognition 完整示例：数学问题求解器
展示完整的自我监控-评估-选择-纠正循环
"""

class MetacognitiveAgent:
    """
    元认知 Agent：能够思考自己思考过程的问题求解器

    流程：
    1. 分析问题
    2. 选择策略
    3. 执行求解
    4. 评估自信度
    5. 如果不够自信，纠正并重试
    """

    def __init__(self, name: str, max_retries: int = 3):
        self.name = name
        self.engine = MetacognitiveEngine()
        self.max_retries = max_retries

    def solve(self, problem: str) -> Dict:
        """
        解决问题

        参数:
            problem: 问题描述
        返回:
            包含解题过程和结果的字典
        """
        print(f"\n{'=' * 60}")
        print(f"🤖 [{self.name}] 元认知问题求解器")
        print(f"📝 问题: {problem}")
        print(f"{'=' * 60}")

        # 1. 分析问题
        print(f"\n  📊 第1步: 分析问题")
        problem_features = self._analyze_problem(problem)
        print(f"    特征: {problem_features}")

        # 2. 选择初始策略
        print(f"\n  🎯 第2步: 选择策略")
        confidence = self.engine.assess_confidence(problem, "direct")
        strategy = self.engine.select_strategy(problem, confidence)
        print(f"    初始策略: {strategy.name} (自信度: {confidence:.2f})")

        # 3. 迭代求解
        result = None
        for attempt in range(1, self.max_retries + 1):
            print(f"\n  🔧 第3步: 执行求解 (尝试 {attempt}/{self.max_retries})")

            # 执行求解
            result = self._execute_solve(problem, strategy, problem_features)
            print(f"    结果: {result}")

            # 评估自信度
            confidence = self.engine.assess_confidence(problem, strategy.name, result)
            print(f"    自信度: {confidence:.2f}")

            # 判断是否需要纠正
            if self.engine.should_correct(confidence, result):
                print(f"    ⚠️ 自信度不足，需要纠正")
                strategy = self.engine.correct(problem, strategy, confidence)
                strategy.record_usage(False)
            else:
                print(f"    ✅ 自信度充足，接受结果")
                strategy.record_usage(True)
                break
        else:
            print(f"\n  ⚠️ 达到最大重试次数，使用最佳可用结果")

        # 4. 生成监控报告
        print(f"\n  📋 第4步: 监控报告")
        print(self.engine.monitor.generate_report())

        # 5. 生成最终报告
        summary = self._generate_summary(problem, result, strategy, confidence)

        return {
            "problem": problem,
            "result": result,
            "strategy": strategy.name,
            "final_confidence": confidence,
            "attempts": attempt,
            "summary": summary,
        }

    def _analyze_problem(self, problem: str) -> Dict:
        """分析问题特征"""
        features = {
            "length": len(problem),
            "has_numbers": any(c.isdigit() for c in problem),
            "complexity": "low",
        }

        complex_words = ["证明", "推导", "优化", "积分", "微分", "矩阵"]
        if any(w in problem for w in complex_words):
            features["complexity"] = "high"
        elif len(problem) > 50:
            features["complexity"] = "medium"

        return features

    def _execute_solve(self, problem: str, strategy: Strategy,
                       features: Dict) -> str:
        """执行求解（模拟）"""
        # 根据策略模拟不同的求解过程
        if strategy.name == "直接求解":
            if features["complexity"] == "high":
                return "错误: 复杂问题无法直接求解"
            return f"直接计算结果: 答案为42"

        elif strategy.name == "分步求解":
            return "分步求解: 步骤1完成, 步骤2完成, 最终答案: 42"

        elif strategy.name == "验证求解":
            return "验证求解: 计算结果=42, 逆向验证通过, 答案: 42"

        else:
            return f"使用{strategy.name}得到结果: 42"

    def _generate_summary(self, problem: str, result: str,
                          strategy: Strategy, confidence: float) -> str:
        """生成最终报告"""
        stats = self.engine.monitor.get_statistics()
        lines = [
            f"\n{'=' * 60}",
            f"📊 元认知求解报告",
            f"{'=' * 60}",
            f"  问题: {problem}",
            f"  最终结果: {result}",
            f"  使用策略: {strategy.name}",
            f"  最终自信度: {confidence:.2f}",
            f"  策略成功率: {strategy.success_rate:.0%}",
            f"  总步骤数: {stats.get('total_steps', 0)}",
            f"  平均自信度: {stats.get('avg_confidence', 0):.2f}",
            f"{'=' * 60}",
        ]
        return "\n".join(lines)


# ====== 运行示例 ======
if __name__ == "__main__":
    agent = MetacognitiveAgent(name="元认知数学家", max_retries=3)

    # 问题1：简单问题（直接求解即可）
    result1 = agent.solve("计算 15 + 27")
    print(result1["summary"])

    # 问题2：复杂问题（可能需要策略切换）
    result2 = agent.solve("证明勾股定理在任意三角形中成立")
    print(result2["summary"])
```

**预期输出（模拟）：**
```
============================================================
🤖 [元认知数学家] 元认知问题求解器
📝 问题: 计算 15 + 27
============================================================

  📊 第1步: 分析问题
    特征: {'length': 8, 'has_numbers': True, 'complexity': 'low'}

  🎯 第2步: 选择策略
    初始策略: 直接求解 (自信度: 0.50)

  🔧 第3步: 执行求解 (尝试 1/3)
    结果: 直接计算结果: 答案为42
    自信度: 0.55
    ✅ 自信度充足，接受结果

  📋 第4步: 监控报告
    认知监控报告:
      总步骤: 3
      平均自信度: 0.52
      低自信步骤: 0

============================================================
🤖 [元认知数学家] 元认知问题求解器
📝 问题: 证明勾股定理在任意三角形中成立
============================================================

  📊 第1步: 分析问题
    特征: {'length': 16, 'has_numbers': False, 'complexity': 'high'}

  🎯 第2步: 选择策略
    初始策略: 验证求解 (自信度: 0.35)
    ⚠️ 自信度不足，需要纠正
    🔄 自我纠正: 从 验证求解 切换
    🔄 切换到: 分步求解

  🔧 第3步: 执行求解 (尝试 1/3)
    结果: 分步求解: 步骤1完成, 步骤2完成, 最终答案: 42
    自信度: 0.72
    ✅ 自信度充足，接受结果
```

---

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 自信度始终很高不下降 | 检查 assess_confidence 中的复杂度评估逻辑 |
| 2 | 策略切换后结果更差 | 在 correct 中优先选择成功率最高的策略 |
| 3 | 监控报告总是空的 | 确保每个操作都调用了 monitor.record_step |
| 4 | 步骤耗时显示异常 | 检查 time.time() 的差值计算逻辑 |
| 5 | 不知道如何添加新策略 | 在 MetacognitiveEngine._init_strategies 中添加 Strategy 对象 |
| 6 | Agent 陷入死循环 | 确保 max_retries 有上限，且 should_correct 有退出条件 |

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Metacognition | "关于思考的思考"，Agent 对自身认知过程的监控和调节 |
| 自信度 (Confidence) | Agent 对当前推理结果的确定程度，0.0-1.0 |
| 策略选择 | 根据问题特征和自信度选择最佳解题方法 |
| 自我纠正 | 在发现推理有误时主动切换策略 |
| 认知监控 | 跟踪和记录 Agent 的每一步操作 |
| 认知状态 | Agent 当前的思维状态（思考中/执行中/不确定等） |
| 异常模式 | 连续低自信、耗时过长等需要关注的行为 |

---

## ✅ 验收清单

- [ ] 能解释元认知的四个核心能力
- [ ] 能运行问题求解示例，观察自信度评估和策略切换
- [ ] 能解释 CognitiveMonitor 如何记录操作历史
- [ ] 能说明为什么"自信评估"对 Agent 很重要
- [ ] 能为新场景设计自定义的策略列表
- [ ] 能对比 Metacognition 与 Reflection 的区别
- [ ] 能说出 Metacognition 在实际 Agent 系统中的应用

---

## 📝 复盘小纸条
- 今天最大的收获: ________________________________
- 还不太确定的: ________________________________
- 元认知最让我惊讶的是: ________________________________
- 明天需要用到的基础: ________________________________

---

## 📥 明日同步接口
- 今日完成度: ____%
- 卡点描述: ________________________________
- 代码是否能跑通: ✅ 全部通过 / ⚠️ 部分通过 / ❌ 未通过
- 明天希望: 学习五种 Agent 工作流模式的对比和选择
