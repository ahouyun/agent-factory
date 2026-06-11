# 📅 Week 4 Day 4：Reflection 范式——自我反思与迭代改进

## 🧭 今日方向
> 学习 Reflection（反思）范式——让 Agent 能够评估自己的输出、发现不足并迭代改进。实现一个完整的"生成-评估-改进"循环，用写作助手作为实战案例。

## 🎯 生活比喻
> 反思就像写作文：你先写一版初稿（Generate），然后自己检查"哪里不够好"（Evaluate），接着根据反馈修改（Refine），再检查……直到满意为止。好的作者都是改出来的，好的 Agent 也是。

## 📋 今日三件事
1. 理解 Reflection 的生成-评估-改进循环
2. 实现 Evaluator（评估器）和 Refiner（改进器）
3. 用写作助手示例演示完整的反思迭代过程

---

## 🗺️ 手把手路线

### Step 1: 设计评估标准
- **做什么**: 定义多维度的评估标准（准确性、完整性、清晰度等）
- **为什么**: 没有明确的评估标准，反思就无从谈起
- **成功标志**: 能设计包含 3+ 个维度的评估体系

### Step 2: 实现评估器
- **做什么**: 实现 Evaluator 类，能对输出进行多维度评分
- **为什么**: 评估是反思的基础
- **成功标志**: 能对一段文本给出各项评分和反馈

### Step 3: 实现完整反思循环
- **做什么**: 将生成、评估、改进整合为循环，观察每次迭代的质量变化
- **为什么**: 反思的核心是迭代改进
- **成功标志**: 运行示例能看到分数逐轮提升

---

## 💻 代码区

### 代码 1: 评估器实现

```python
"""
Reflection 范式：评估器（Evaluator）
对输出进行多维度评估，给出评分和改进建议
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
from enum import Enum


class FeedbackType(str, Enum):
    """反馈类型"""
    POSITIVE = "positive"      # 正面反馈（继续保持）
    NEGATIVE = "negative"      # 负面反馈（需要改进）
    SUGGESTION = "suggestion"  # 建议（可以优化）


@dataclass
class DimensionScore:
    """单个维度的评分"""
    dimension: str       # 维度名称
    score: float         # 评分 0.0-1.0
    feedback: str        # 反馈说明
    feedback_type: FeedbackType  # 反馈类型
    suggestions: List[str] = field(default_factory=list)  # 改进建议


@dataclass
class EvaluationResult:
    """评估结果"""
    dimensions: List[DimensionScore]  # 各维度评分
    overall_score: float              # 综合评分
    summary: str                      # 评估总结
    needs_improvement: bool           # 是否需要改进


class Evaluator:
    """
    评估器：对输出进行多维度评估

    支持的评估维度：
    - 准确性（Accuracy）：信息是否正确
    - 完整性（Completeness）：是否覆盖所有要点
    - 清晰度（Clarity）：表达是否清晰
    - 相关性（Relevance）：是否针对问题
    - 简洁性（Conciseness）：是否简洁无冗余
    """

    def __init__(self):
        # 评估维度和权重
        self.dimensions = {
            "accuracy":    {"name": "准确性", "weight": 0.25, "threshold": 0.7},
            "completeness": {"name": "完整性", "weight": 0.25, "threshold": 0.7},
            "clarity":     {"name": "清晰度", "weight": 0.20, "threshold": 0.7},
            "relevance":   {"name": "相关性", "weight": 0.15, "threshold": 0.7},
            "conciseness": {"name": "简洁性", "weight": 0.15, "threshold": 0.7},
        }

    def evaluate(self, output: str, task: str,
                 previous_eval: Optional[EvaluationResult] = None) -> EvaluationResult:
        """
        评估输出

        参数:
            output: 待评估的输出文本
            task: 原始任务描述
            previous_eval: 上一次评估结果（用于对比改进）
        返回:
            EvaluationResult 评估结果
        """
        print(f"\n  🔍 开始评估...")

        dimension_scores = []

        for dim_key, dim_info in self.dimensions.items():
            score = self._score_dimension(dim_key, output, task)
            feedback, feedback_type, suggestions = self._generate_feedback(
                dim_key, score, dim_info["threshold"], output, previous_eval
            )

            dim_score = DimensionScore(
                dimension=dim_info["name"],
                score=score,
                feedback=feedback,
                feedback_type=feedback_type,
                suggestions=suggestions,
            )
            dimension_scores.append(dim_score)
            print(f"    {dim_info['name']}: {score:.2f} {feedback_type.value}")

        # 计算综合评分
        overall = sum(
            ds.score * self.dimensions[list(self.dimensions.keys())[i]]["weight"]
            for i, ds in enumerate(dimension_scores)
        )

        # 判断是否需要改进
        needs_improvement = overall < 0.85

        # 生成总结
        summary = self._generate_summary(dimension_scores, overall, needs_improvement)

        result = EvaluationResult(
            dimensions=dimension_scores,
            overall_score=overall,
            summary=summary,
            needs_improvement=needs_improvement,
        )

        print(f"    综合评分: {overall:.2f}")
        print(f"    {'需要改进' if needs_improvement else '质量良好'}")

        return result

    def _score_dimension(self, dimension: str, output: str, task: str) -> float:
        """对单个维度进行评分（简化版，实际应用中会用LLM）"""
        base_score = 0.5

        if dimension == "accuracy":
            # 基于关键词匹配和长度的简化评分
            if len(output) > 30:
                base_score = 0.7
            if "正确" in output or "验证" in output or "确认" in output:
                base_score += 0.1

        elif dimension == "completeness":
            # 基于要点数量
            points = output.count("1.") + output.count("2.") + output.count("3.")
            base_score = min(0.5 + points * 0.1, 1.0)

        elif dimension == "clarity":
            # 基于句子长度和结构
            sentences = output.split("。")
            avg_len = sum(len(s) for s in sentences) / max(len(sentences), 1)
            if 10 < avg_len < 50:
                base_score = 0.8
            else:
                base_score = 0.6

        elif dimension == "relevance":
            # 基于任务关键词出现频率
            task_words = set(task)
            output_words = set(output)
            overlap = len(task_words & output_words) / max(len(task_words), 1)
            base_score = 0.5 + overlap * 0.4

        elif dimension == "conciseness":
            # 基于冗余度
            if len(output) < 200:
                base_score = 0.8
            elif len(output) < 500:
                base_score = 0.7
            else:
                base_score = 0.5

        return min(max(base_score, 0.0), 1.0)

    def _generate_feedback(self, dimension: str, score: float, threshold: float,
                           output: str, previous_eval: Optional[EvaluationResult]):
        """根据评分生成反馈"""
        suggestions = []

        if score >= threshold:
            feedback_type = FeedbackType.POSITIVE
            feedback = "表现良好"
        else:
            feedback_type = FeedbackType.NEGATIVE
            feedback = "需要改进"

        # 对比上一次评估
        if previous_eval:
            prev_dim = None
            for d in previous_eval.dimensions:
                dim_keys = list(self.dimensions.keys())
                for i, key in enumerate(dim_keys):
                    if d.dimension == self.dimensions[key]["name"] and key == dimension:
                        prev_dim = d
                        break
            if prev_dim and score > prev_dim.score:
                feedback += f" (较上次 +{score - prev_dim.score:.2f})"

        # 生成改进建议
        if dimension == "accuracy" and score < 0.7:
            suggestions.append("增加事实依据和数据支撑")
        elif dimension == "completeness" and score < 0.7:
            suggestions.append("补充更多要点和细节")
        elif dimension == "clarity" and score < 0.7:
            suggestions.append("使用更简洁的表达，避免冗长句子")
        elif dimension == "relevance" and score < 0.7:
            suggestions.append("更紧密地围绕主题展开")
        elif dimension == "conciseness" and score < 0.7:
            suggestions.append("删除不必要的重复内容")

        return feedback, feedback_type, suggestions

    def _generate_summary(self, dimensions: List[DimensionScore],
                          overall: float, needs_improvement: bool) -> str:
        """生成评估总结"""
        strengths = [d for d in dimensions if d.feedback_type == FeedbackType.POSITIVE]
        weaknesses = [d for d in dimensions if d.feedback_type == FeedbackType.NEGATIVE]

        lines = []
        if strengths:
            lines.append(f"优势: {', '.join(d.dimension for d in strengths)}")
        if weaknesses:
            lines.append(f"不足: {', '.join(d.dimension for d in weaknesses)}")

        return " | ".join(lines) if lines else "评估完成"
```

### 代码 2: 改进器和反思循环

```python
"""
Reflection 范式：改进器（Refiner）和反思循环
"""

import random


class Refiner:
    """
    改进器：根据评估反馈改进输出

    核心逻辑：
    1. 接收评估反馈
    2. 识别薄弱维度
    3. 针对性改进
    4. 生成改进后的输出
    """

    def __init__(self):
        self.improvement_strategies = {
            "准确性": "增加具体数据、引用来源、验证事实",
            "完整性": "补充遗漏的要点、增加细节描述、添加示例",
            "清晰度": "简化长句、使用列表格式、添加过渡词",
            "相关性": "删除离题内容、强化主题句、聚焦核心观点",
            "简洁性": "删除重复表述、合并相似内容、精简修饰语",
        }

    def refine(self, output: str, evaluation: EvaluationResult, task: str) -> str:
        """
        根据评估结果改进输出

        参数:
            output: 原始输出
            evaluation: 评估结果
            task: 原始任务
        返回:
            改进后的输出
        """
        print(f"\n  🔧 开始改进...")

        # 找出需要改进的维度
        weak_dims = [
            d for d in evaluation.dimensions
            if d.feedback_type in (FeedbackType.NEGATIVE, FeedbackType.SUGGESTION)
        ]

        if not weak_dims:
            print(f"    无需改进，保持原样")
            return output

        # 按评分排序，优先改进最弱的维度
        weak_dims.sort(key=lambda d: d.score)

        # 逐步改进
        improved = output
        for dim in weak_dims[:3]:  # 最多改进3个维度
            strategy = self.improvement_strategies.get(dim.dimension, "进行优化")
            print(f"    改进 {dim.dimension} (当前: {dim.score:.2f}): {strategy}")

            # 根据策略生成改进内容
            improved = self._apply_improvement(improved, dim, strategy, task)

        print(f"    改进完成")
        return improved

    def _apply_improvement(self, output: str, dim: DimensionScore,
                           strategy: str, task: str) -> str:
        """应用具体改进策略"""
        # 简化版：在实际应用中，这里会调用LLM进行改进
        # 这里用规则模拟改进效果

        if dim.dimension == "完整性" and dim.score < 0.7:
            # 补充要点
            improvements = [
                "\n补充说明：以上内容涵盖了主要方面，还需要考虑实际应用场景。",
                "\n补充细节：每个要点都经过了详细分析，确保全面性。",
                "\n额外建议：在实施过程中，建议分阶段推进，降低风险。",
            ]
            output += random.choice(improvements)

        elif dim.dimension == "准确性" and dim.score < 0.7:
            # 增加依据
            output += "\n[补充事实依据] 以上分析基于相关领域的最佳实践。"

        elif dim.dimension == "清晰度" and dim.score < 0.7:
            # 结构化
            output = self._restructure(output)

        elif dim.dimension == "简洁性" and dim.score < 0.7:
            # 精简
            output = self._condense(output)

        return output

    def _restructure(self, text: str) -> str:
        """重组文本结构"""
        # 简化版：添加结构化标记
        if "1." not in text:
            sentences = [s.strip() for s in text.split("。") if s.strip()]
            if len(sentences) > 1:
                structured = "\n".join(f"  {i+1}. {s}。" for i, s in enumerate(sentences))
                return structured
        return text

    def _condense(self, text: str) -> str:
        """精简文本"""
        # 简化版：移除重复表述
        lines = text.split("\n")
        seen = set()
        unique_lines = []
        for line in lines:
            normalized = line.strip()
            if normalized and normalized not in seen:
                seen.add(normalized)
                unique_lines.append(line)
        return "\n".join(unique_lines)


class ReflectionAgent:
    """
    反思 Agent：完整的反思循环

    流程：Generate -> Evaluate -> Refine -> Re-evaluate -> ...
    """

    def __init__(self, name: str, max_iterations: int = 3,
                 quality_threshold: float = 0.85):
        """
        参数:
            name: Agent名称
            max_iterations: 最大反思轮次
            quality_threshold: 质量阈值，达到此分数停止反思
        """
        self.name = name
        self.max_iterations = max_iterations
        self.quality_threshold = quality_threshold
        self.evaluator = Evaluator()
        self.refiner = Refiner()
        self.iteration_log: List[Dict] = []

    def solve(self, task: str, initial_output: str = None) -> Dict:
        """
        执行反思循环

        参数:
            task: 任务描述
            initial_output: 初始输出（为None时自动生成）
        返回:
            包含最终输出和迭代历史的字典
        """
        print(f"\n{'=' * 60}")
        print(f"🤖 [{self.name}] 反思 Agent 启动")
        print(f"📝 任务: {task}")
        print(f"⚙️ 最大轮次: {self.max_iterations}, 质量阈值: {self.quality_threshold}")
        print(f"{'=' * 60}")

        # 1. 生成初始输出
        if initial_output is None:
            current_output = self._generate_initial(task)
        else:
            current_output = initial_output

        print(f"\n📄 初始输出:")
        print(f"  {current_output[:200]}...")

        previous_eval = None

        # 2. 反思循环
        for iteration in range(1, self.max_iterations + 1):
            print(f"\n{'─' * 50}")
            print(f"  🔄 反思轮次 {iteration}/{self.max_iterations}")

            # 评估
            evaluation = self.evaluator.evaluate(current_output, task, previous_eval)

            # 记录
            self.iteration_log.append({
                "iteration": iteration,
                "score": evaluation.overall_score,
                "needs_improvement": evaluation.needs_improvement,
                "dimensions": {d.dimension: d.score for d in evaluation.dimensions},
            })

            # 检查是否达标
            if not evaluation.needs_improvement:
                print(f"\n  ✅ 质量达标 ({evaluation.overall_score:.2f} >= {self.quality_threshold})，停止反思")
                break

            # 改进
            current_output = self.refiner.refine(current_output, evaluation, task)

            print(f"  📄 改进后输出:")
            preview = current_output[:150].replace("\n", " ")
            print(f"    {preview}...")

            previous_eval = evaluation

        # 3. 最终评估
        final_eval = self.evaluator.evaluate(current_output, task, previous_eval)

        # 4. 生成总结
        summary = self._generate_summary(task, current_output, final_eval)

        return {
            "task": task,
            "final_output": current_output,
            "final_score": final_eval.overall_score,
            "iterations": self.iteration_log,
            "summary": summary,
        }

    def _generate_initial(self, task: str) -> str:
        """生成初始输出（模拟LLM生成）"""
        return (
            f"关于'{task}'的分析：\n"
            f"1. 首先需要了解背景信息\n"
            f"2. 然后分析主要因素\n"
            f"3. 最后给出建议"
        )

    def _generate_summary(self, task: str, output: str, final_eval: EvaluationResult) -> str:
        """生成反思总结"""
        lines = [
            f"\n{'=' * 60}",
            f"📊 反思总结",
            f"{'=' * 60}",
            f"  任务: {task}",
            f"  反思轮次: {len(self.iteration_log)}",
            f"  最终评分: {final_eval.overall_score:.2f}",
            f"  最终状态: {'质量良好' if not final_eval.needs_improvement else '仍需改进'}",
        ]

        if self.iteration_log:
            first_score = self.iteration_log[0]["score"]
            last_score = self.iteration_log[-1]["score"]
            lines.append(f"  评分变化: {first_score:.2f} -> {last_score:.2f} (+{last_score - first_score:.2f})")

        # 各维度详情
        lines.append(f"\n  各维度评分:")
        for dim in final_eval.dimensions:
            icon = "+" if dim.feedback_type == FeedbackType.POSITIVE else "!"
            lines.append(f"    [{icon}] {dim.dimension}: {dim.score:.2f} - {dim.feedback}")

        lines.append(f"{'=' * 60}")
        return "\n".join(lines)
```

### 代码 3: 运行写作助手示例

```python
"""
Reflection 实战：写作助手
演示完整的反思迭代过程
"""

if __name__ == "__main__":
    # 1. 创建反思 Agent
    agent = ReflectionAgent(
        name="写作助手",
        max_iterations=3,
        quality_threshold=0.80,
    )

    # 2. 定义任务
    task = "写一段关于人工智能发展趋势的分析"

    # 3. 提供一个较简单的初始输出
    initial = (
        "人工智能正在发展。"
        "越来越多的公司在用AI。"
        "未来AI会更厉害。"
    )

    # 4. 执行反思循环
    result = agent.solve(task, initial_output=initial)

    # 5. 输出最终结果
    print(result["summary"])

    print(f"\n📄 最终输出:")
    print(result["final_output"])
```

**预期输出（模拟）：**
```
============================================================
🤖 [写作助手] 反思 Agent 启动
📝 任务: 写一段关于人工智能发展趋势的分析
⚙️ 最大轮次: 3, 质量阈值: 0.85
============================================================

📄 初始输出:
  人工智能正在发展。越来越多的公司在用AI。未来AI会更厉害。...

--------------------------------------------------
  🔄 反思轮次 1/3

  🔍 开始评估...
    准确性: 0.70 NEGATIVE
    完整性: 0.50 NEGATIVE
    清晰度: 0.60 NEGATIVE
    相关性: 0.72 SUGGESTION
    简洁性: 0.80 POSITIVE
    综合评分: 0.65
    需要改进

  🔧 开始改进...
    改进 准确性 (当前: 0.70): 增加具体数据、引用来源
    改进 完整性 (当前: 0.50): 补充遗漏的要点、增加细节
    改进 清晰度 (当前: 0.60): 简化长句、使用列表格式
    改进完成

  🔄 反思轮次 2/3
  🔍 开始评估...
    综合评分: 0.82
    需要改进

  🔄 反思轮次 3/3
  ✅ 质量达标 (0.85 >= 0.80)，停止反思

============================================================
📊 反思总结
============================================================
  任务: 写一段关于人工智能发展趋势的分析
  反思轮次: 3
  最终评分: 0.87
  最终状态: 质量良好
  评分变化: 0.65 -> 0.87 (+0.22)
============================================================
```

---

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 分数一直不提升 | 检查 Refiner 的改进策略是否真的针对了弱项维度 |
| 2 | 反思轮次用完仍未达标 | 增加 max_iterations，或降低 quality_threshold |
| 3 | 评估分数全是0.5 | 检查 _score_dimension 的评分逻辑是否过于简单 |
| 4 | 改进后输出变差了 | 在 Refiner 中增加"保留原文优点"的逻辑 |
| 5 | 无限反思循环 | 确保 max_iterations 有上限，且评估逻辑能检测改进 |
| 6 | 不知道如何自定义评估维度 | 在 Evaluator.__init__ 的 self.dimensions 中添加新维度 |

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Reflection | Agent 自我评估并迭代改进的范式 |
| Evaluator（评估器） | 对输出进行多维度评分的组件 |
| Refiner（改进器） | 根据评估反馈改进输出的组件 |
| 反思轮次 | 一次评估-改进循环 |
| 质量阈值 | 达到此分数时停止反思 |
| 反馈类型 | positive（保持）/ negative（改进）/ suggestion（优化） |
| 改进策略 | 针对不同弱项维度的具体改进方法 |
| 评分变化 | 衡量每次迭代改进幅度的指标 |

---

## ✅ 验收清单

- [ ] 能解释 Generate -> Evaluate -> Refine 循环的每一步
- [ ] 能运行写作助手示例，观察 3 轮反思的评分变化
- [ ] 能解释 Evaluator 中 5 个评估维度的含义和权重
- [ ] 能为新场景（如代码审查）设计自定义评估维度
- [ ] 能解释为什么需要 quality_threshold 来终止循环
- [ ] 能对比 Reflection 与 ReAct 的区别
- [ ] 能说出 Reflection 在实际应用中的典型场景

---

## 📝 复盘小纸条
- 今天最大的收获: ________________________________
- 还不太确定的: ________________________________
- Reflection 最适合的场景是: ________________________________
- 明天需要用到的基础: ________________________________

---

## 📥 明日同步接口
- 今日完成度: ____%
- 卡点描述: ________________________________
- 代码是否能跑通: ✅ 全部通过 / ⚠️ 部分通过 / ❌ 未通过
- 明天希望: 学习 Metacognition 如何让 Agent "思考自己的思考"
