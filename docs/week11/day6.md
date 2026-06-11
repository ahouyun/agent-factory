# 🔄 Day 6: 评估驱动的迭代优化 — 让 Agent 越来越聪明

## 今日方向

> "失败是成功之母，但只有从失败中学习才能成功。" -- 通用智慧

今天我们来学习如何用评估结果驱动 Agent 的迭代优化。评估不是终点，而是改进的起点。建立"评估-分析-改进-再评估"的闭环，让 Agent 持续进化。

## 生活比喻

想象你在训练一支足球队：

- **评估** = 看比赛录像，分析表现
- **分析** = 找出问题：传球不准？防守漏洞？
- **改进** = 针对性训练
- **再评估** = 下一场比赛看效果

这个循环就是持续改进的核心。

## 今日三件事

1. **分析评估结果**：学会从数据中发现问题
2. **A/B 测试框架**：对比不同版本的表现
3. **建立反馈循环**：让优化成为常态

---

## 手把手路线

### 第一步：安装依赖

```bash
pip install pandas numpy tabulate
```

### 第二步：分析评估结果

```python
# eval_analysis.py
"""评估结果分析"""

import json
import time
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import statistics


@dataclass
class EvalRecord:
    """单次评估记录"""
    case_id: str
    input_text: str
    expected_output: str
    actual_output: str
    score: float
    latency: float
    passed: bool
    feedback: str = ""
    category: str = ""
    timestamp: str = ""

    def to_dict(self) -> dict:
        return {
            "case_id": self.case_id, "score": self.score,
            "passed": self.passed, "latency": self.latency,
            "feedback": self.feedback,
        }


@dataclass
class AnalysisReport:
    """分析报告"""
    total_cases: int
    pass_rate: float
    avg_score: float
    avg_latency: float
    score_distribution: Dict[str, int]
    failure_patterns: List[Dict]
    improvement_suggestions: List[str]

    def to_dict(self) -> dict:
        return {
            "total_cases": self.total_cases,
            "pass_rate": round(self.pass_rate, 4),
            "avg_score": round(self.avg_score, 4),
            "avg_latency": round(self.avg_latency, 4),
            "score_distribution": self.score_distribution,
            "failure_patterns": self.failure_patterns,
            "improvement_suggestions": self.improvement_suggestions,
        }


class EvalAnalyzer:
    """评估结果分析器"""

    def __init__(self):
        self.records: List[EvalRecord] = []

    def add_record(self, record: EvalRecord):
        self.records.append(record)

    def analyze(self) -> AnalysisReport:
        """分析所有记录"""
        if not self.records:
            return AnalysisReport(0, 0, 0, 0, {}, [], [])

        # 基础统计
        total = len(self.records)
        passed = sum(1 for r in self.records if r.passed)
        scores = [r.score for r in self.records]
        latencies = [r.latency for r in self.records]

        # 分数分布
        dist = {"excellent": 0, "good": 0, "average": 0, "poor": 0, "fail": 0}
        for s in scores:
            if s >= 0.9:
                dist["excellent"] += 1
            elif s >= 0.7:
                dist["good"] += 1
            elif s >= 0.5:
                dist["average"] += 1
            elif s >= 0.3:
                dist["poor"] += 1
            else:
                dist["fail"] += 1

        # 失败模式分析
        failures = [r for r in self.records if not r.passed]
        failure_patterns = self._analyze_failures(failures)

        # 改进建议
        suggestions = self._generate_suggestions(
            pass_rate=passed / total,
            avg_score=sum(scores) / total,
            avg_latency=sum(latencies) / total,
            failure_patterns=failure_patterns,
        )

        return AnalysisReport(
            total_cases=total,
            pass_rate=passed / total,
            avg_score=sum(scores) / total,
            avg_latency=sum(latencies) / total,
            score_distribution=dist,
            failure_patterns=failure_patterns,
            improvement_suggestions=suggestions,
        )

    def _analyze_failures(self, failures: List[EvalRecord]) -> List[Dict]:
        """分析失败模式"""
        patterns = []

        # 按类别分组
        by_category = {}
        for f in failures:
            cat = f.category or "unknown"
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(f)

        for cat, records in by_category.items():
            avg_score = sum(r.score for r in records) / len(records)
            patterns.append({
                "category": cat,
                "count": len(records),
                "avg_score": round(avg_score, 4),
                "example": records[0].case_id if records else None,
            })

        return patterns

    def _generate_suggestions(self, pass_rate: float, avg_score: float,
                             avg_latency: float, failure_patterns: List[Dict]) -> List[str]:
        """生成改进建议"""
        suggestions = []

        if pass_rate < 0.7:
            suggestions.append("通过率较低，建议检查核心逻辑是否正确")

        if avg_latency > 2.0:
            suggestions.append("平均延迟较高，建议优化 LLM 调用或添加缓存")

        if avg_score < 0.6:
            suggestions.append("平均分较低，建议改进 Prompt 模板")

        for pattern in failure_patterns:
            if pattern["count"] > 2:
                suggestions.append(
                    f"类别 '{pattern['category']}' 失败较多，建议针对性优化"
                )

        if not suggestions:
            suggestions.append("整体表现良好，建议添加更多测试用例覆盖边界情况")

        return suggestions

    def get_worst_cases(self, n: int = 5) -> List[Dict]:
        """获取表现最差的用例"""
        sorted_records = sorted(self.records, key=lambda r: r.score)
        return [r.to_dict() for r in sorted_records[:n]]

    def get_improvement_trend(self) -> List[Dict]:
        """获取改进趋势"""
        if len(self.records) < 2:
            return []

        # 按时间排序
        sorted_records = sorted(self.records, key=lambda r: r.timestamp)

        # 计算滚动平均
        window_size = max(1, len(sorted_records) // 5)
        trend = []
        for i in range(window_size, len(sorted_records)):
            window = sorted_records[i - window_size:i]
            avg_score = sum(r.score for r in window) / len(window)
            trend.append({
                "index": i,
                "avg_score": round(avg_score, 4),
                "pass_rate": sum(1 for r in window if r.passed) / len(window),
            })

        return trend


if __name__ == "__main__":
    print("评估结果分析示例")
    print("=" * 60)

    analyzer = EvalAnalyzer()

    # 模拟评估记录
    test_records = [
        EvalRecord("TC001", "问题1", "答案1", "答案1", 1.0, 0.5, True, category="常识"),
        EvalRecord("TC002", "问题2", "答案2", "答案2", 1.0, 0.6, True, category="常识"),
        EvalRecord("TC003", "问题3", "答案3", "错误答案", 0.0, 0.8, False, category="技术"),
        EvalRecord("TC004", "问题4", "答案4", "部分正确", 0.5, 0.4, False, category="技术"),
        EvalRecord("TC005", "问题5", "答案5", "答案5", 1.0, 0.3, True, category="编程"),
        EvalRecord("TC006", "问题6", "答案6", "答案6", 0.9, 0.7, True, category="编程"),
        EvalRecord("TC007", "问题7", "答案7", "完全错误", 0.0, 1.2, False, category="技术"),
        EvalRecord("TC008", "问题8", "答案8", "答案8", 1.0, 0.4, True, category="常识"),
    ]

    for record in test_records:
        analyzer.add_record(record)

    # 分析结果
    report = analyzer.analyze()
    print("\n分析报告:")
    print(json.dumps(report.to_dict(), indent=2, ensure_ascii=False))

    # 最差用例
    print("\n表现最差的用例:")
    for case in analyzer.get_worst_cases(3):
        print(f"  {case['case_id']}: score={case['score']}, feedback={case['feedback']}")

    # 改进建议
    print("\n改进建议:")
    for i, suggestion in enumerate(report.improvement_suggestions, 1):
        print(f"  {i}. {suggestion}")
```

### 第三步：A/B 测试框架

```python
# ab_testing.py
"""A/B 测试框架"""

import json
import time
import random
import uuid
from typing import Dict, List, Any, Callable, Optional
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class ABTestVariant:
    """A/B 测试变体"""
    variant_id: str
    name: str
    description: str
    agent_func: Callable = None
    config: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "variant_id": self.variant_id,
            "name": self.name,
            "description": self.description,
            "config": self.config,
        }


@dataclass
class ABTestResult:
    """A/B 测试结果"""
    test_id: str
    variant_id: str
    case_id: str
    input_text: str
    output: str
    score: float
    latency: float
    timestamp: str = ""

    def to_dict(self) -> dict:
        return {
            "test_id": self.test_id, "variant_id": self.variant_id,
            "case_id": self.case_id, "score": self.score,
            "latency": self.latency,
        }


class ABTestFramework:
    """A/B 测试框架"""

    def __init__(self, test_name: str):
        self.test_name = test_name
        self.test_id = str(uuid.uuid4())[:8]
        self.variants: Dict[str, ABTestVariant] = {}
        self.results: List[ABTestResult] = []
        self._traffic_split: Dict[str, float] = {}

    def add_variant(self, variant: ABTestVariant, traffic_pct: float = 50):
        """添加测试变体"""
        self.variants[variant.variant_id] = variant
        self._traffic_split[variant.variant_id] = traffic_pct

    def _select_variant(self) -> str:
        """根据流量分配选择变体"""
        rand = random.random() * 100
        cumulative = 0
        for vid, pct in self._traffic_split.items():
            cumulative += pct
            if rand <= cumulative:
                return vid
        return list(self.variants.keys())[0]

    def run_test(self, test_cases: List[Dict], runs_per_case: int = 1) -> Dict:
        """运行 A/B 测试"""
        print(f"开始 A/B 测试: {self.test_name}")
        print(f"测试 ID: {self.test_id}")
        print(f"变体数: {len(self.variants)}")
        print(f"测试用例数: {len(test_cases)}")
        print("=" * 60)

        for case in test_cases:
            for run in range(runs_per_case):
                variant_id = self._select_variant()
                variant = self.variants[variant_id]

                start_time = time.time()
                try:
                    output = variant.agent_func(case["input"])
                    score = self._evaluate(output, case["expected"])
                except Exception as e:
                    output = str(e)
                    score = 0.0

                latency = time.time() - start_time

                result = ABTestResult(
                    test_id=self.test_id, variant_id=variant_id,
                    case_id=case["id"], input_text=case["input"],
                    output=output, score=score, latency=round(latency, 4),
                    timestamp=datetime.now().isoformat(),
                )
                self.results.append(result)

        return self.get_analysis()

    def _evaluate(self, actual: str, expected: str) -> float:
        """简单的评估函数"""
        if expected.lower() in actual.lower():
            return 1.0
        elif len(actual) > 0:
            return 0.5
        return 0.0

    def get_analysis(self) -> Dict:
        """分析测试结果"""
        if not self.results:
            return {"error": "No results"}

        # 按变体分组
        by_variant = {}
        for result in self.results:
            vid = result.variant_id
            if vid not in by_variant:
                by_variant[vid] = []
            by_variant[vid].append(result)

        analysis = {"test_name": self.test_name, "variants": {}}

        for vid, results in by_variant.items():
            scores = [r.score for r in results]
            latencies = [r.latency for r in results]
            variant = self.variants[vid]

            analysis["variants"][vid] = {
                "name": variant.name,
                "total_runs": len(results),
                "avg_score": round(sum(scores) / len(scores), 4),
                "avg_latency": round(sum(latencies) / len(latencies), 4),
                "pass_rate": round(sum(1 for s in scores if s >= 0.7) / len(scores), 4),
            }

        # 确定获胜者
        best_variant = max(
            analysis["variants"].items(),
            key=lambda x: x[1]["avg_score"],
        )
        analysis["winner"] = {
            "variant_id": best_variant[0],
            "name": best_variant[1]["name"],
            "improvement": "N/A",
        }

        return analysis

    def export_results(self, filepath: str):
        """导出测试结果"""
        data = {
            "test_name": self.test_name,
            "test_id": self.test_id,
            "variants": {vid: v.to_dict() for vid, v in self.variants.items()},
            "results": [r.to_dict() for r in self.results],
            "analysis": self.get_analysis(),
            "export_time": datetime.now().isoformat(),
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"测试结果已导出到: {filepath}")


# 模拟不同版本的 Agent
def agent_v1(query: str) -> str:
    """Agent V1 - 基础版本"""
    time.sleep(0.1)
    if "机器学习" in query:
        return "机器学习是一种人工智能技术"
    return f"V1回答: {query[:20]}"


def agent_v2(query: str) -> str:
    """Agent V2 - 改进版本"""
    time.sleep(0.08)
    if "机器学习" in query:
        return "机器学习是人工智能的一个分支，它使计算机能够从数据中学习模式"
    return f"V2回答: {query[:20]}，这是一个更详细的回答"


if __name__ == "__main__":
    print("A/B 测试框架示例")
    print("=" * 60)

    # 创建测试
    framework = ABTestFramework("Agent Prompt 优化测试")

    # 添加变体
    framework.add_variant(
        ABTestVariant("v1", "基础版本", "原始 Prompt", agent_v1),
        traffic_pct=50,
    )
    framework.add_variant(
        ABTestVariant("v2", "改进版本", "优化后的 Prompt", agent_v2),
        traffic_pct=50,
    )

    # 测试用例
    test_cases = [
        {"id": "TC1", "input": "什么是机器学习？", "expected": "机器学习"},
        {"id": "TC2", "input": "Python是什么？", "expected": "Python"},
        {"id": "TC3", "input": "什么是API？", "expected": "API"},
        {"id": "TC4", "input": "Docker怎么用？", "expected": "Docker"},
        {"id": "TC5", "input": "什么是微服务？", "expected": "微服务"},
    ]

    # 运行测试
    analysis = framework.run_test(test_cases, runs_per_case=3)

    # 打印结果
    print("\n测试分析:")
    print(json.dumps(analysis, indent=2, ensure_ascii=False))

    # 导出结果
    framework.export_results("ab_test_results.json")
```

### 第四步：建立反馈循环

```python
# feedback_loop.py
"""反馈循环系统"""

import json
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class FeedbackEntry:
    """反馈条目"""
    entry_id: str
    case_id: str
    feedback_type: str  # "user", "automatic", "expert"
    score: float
    comment: str
    timestamp: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "entry_id": self.entry_id, "case_id": self.case_id,
            "feedback_type": self.feedback_type, "score": self.score,
            "comment": self.comment, "timestamp": self.timestamp,
        }


@dataclass
class IterationRecord:
    """迭代记录"""
    iteration_id: str
    version: str
    changes: List[str]
    before_metrics: Dict[str, float]
    after_metrics: Dict[str, float]
    improvement: float
    timestamp: str = ""

    def to_dict(self) -> dict:
        return {
            "iteration_id": self.iteration_id, "version": self.version,
            "changes": self.changes, "before_metrics": self.before_metrics,
            "after_metrics": self.after_metrics, "improvement": self.improvement,
        }


class FeedbackLoop:
    """反馈循环系统"""

    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.feedback: List[FeedbackEntry] = []
        self.iterations: List[IterationRecord] = []
        self.current_version = "1.0.0"

    def add_feedback(self, case_id: str, feedback_type: str,
                     score: float, comment: str, metadata: Dict = None):
        """添加反馈"""
        entry = FeedbackEntry(
            entry_id=f"fb_{len(self.feedback) + 1}",
            case_id=case_id, feedback_type=feedback_type,
            score=score, comment=comment,
            timestamp=datetime.now().isoformat(),
            metadata=metadata or {},
        )
        self.feedback.append(entry)
        return entry.entry_id

    def get_feedback_summary(self) -> Dict:
        """获取反馈摘要"""
        if not self.feedback:
            return {"total": 0}

        scores = [f.score for f in self.feedback]
        by_type = {}
        for f in self.feedback:
            if f.feedback_type not in by_type:
                by_type[f.feedback_type] = []
            by_type[f.feedback_type].append(f.score)

        return {
            "total": len(self.feedback),
            "avg_score": round(sum(scores) / len(scores), 4),
            "by_type": {
                ft: {"count": len(ss), "avg": round(sum(ss) / len(ss), 4)}
                for ft, ss in by_type.items()
            },
        }

    def record_iteration(self, version: str, changes: List[str],
                        before_metrics: Dict, after_metrics: Dict):
        """记录迭代"""
        # 计算改进幅度
        improvements = []
        for key in before_metrics:
            if key in after_metrics:
                if before_metrics[key] > 0:
                    imp = (after_metrics[key] - before_metrics[key]) / before_metrics[key]
                    improvements.append(imp)

        avg_improvement = sum(improvements) / len(improvements) if improvements else 0

        iteration = IterationRecord(
            iteration_id=f"iter_{len(self.iterations) + 1}",
            version=version, changes=changes,
            before_metrics=before_metrics, after_metrics=after_metrics,
            improvement=round(avg_improvement, 4),
            timestamp=datetime.now().isoformat(),
        )
        self.iterations.append(iteration)
        self.current_version = version
        return iteration.iteration_id

    def get_improvement_history(self) -> List[Dict]:
        """获取改进历史"""
        return [i.to_dict() for i in self.iterations]

    def suggest_next_actions(self) -> List[str]:
        """建议下一步行动"""
        suggestions = []

        if not self.feedback:
            suggestions.append("收集更多用户反馈")
            return suggestions

        summary = self.get_feedback_summary()

        if summary["avg_score"] < 0.7:
            suggestions.append("平均分较低，建议重新设计 Prompt")

        # 检查各类型的反馈
        for ftype, stats in summary.get("by_type", {}).items():
            if stats["avg"] < 0.6:
                suggestions.append(f"{ftype}反馈分数较低，建议关注该类型问题")

        # 检查最近的反馈
        recent = self.feedback[-10:] if len(self.feedback) >= 10 else self.feedback
        recent_scores = [f.score for f in recent]
        if recent_scores and sum(recent_scores) / len(recent_scores) < 0.5:
            suggestions.append("最近反馈分数下降，建议检查是否有回归问题")

        if not suggestions:
            suggestions.append("表现良好，建议扩展测试覆盖范围")

        return suggestions

    def export_history(self, filepath: str):
        """导出历史记录"""
        data = {
            "agent_name": self.agent_name,
            "current_version": self.current_version,
            "feedback_summary": self.get_feedback_summary(),
            "iterations": self.get_improvement_history(),
            "suggestions": self.suggest_next_actions(),
            "export_time": datetime.now().isoformat(),
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"历史记录已导出到: {filepath}")


if __name__ == "__main__":
    print("反馈循环系统示例")
    print("=" * 60)

    loop = FeedbackLoop("my-agent")

    # 模拟反馈收集
    feedback_data = [
        ("TC001", "user", 0.9, "回答很好"),
        ("TC002", "user", 0.8, "基本正确"),
        ("TC003", "automatic", 0.6, "部分匹配"),
        ("TC004", "expert", 0.4, "需要改进"),
        ("TC005", "user", 0.95, "非常准确"),
    ]

    for case_id, ftype, score, comment in feedback_data:
        loop.add_feedback(case_id, ftype, score, comment)

    # 记录迭代
    loop.record_iteration(
        version="1.1.0",
        changes=["优化 Prompt 模板", "添加错误处理"],
        before_metrics={"accuracy": 0.7, "latency": 1.5},
        after_metrics={"accuracy": 0.85, "latency": 1.2},
    )

    loop.record_iteration(
        version="1.2.0",
        changes=["添加缓存", "优化检索逻辑"],
        before_metrics={"accuracy": 0.85, "latency": 1.2},
        after_metrics={"accuracy": 0.88, "latency": 0.8},
    )

    # 查看结果
    print("\n反馈摘要:")
    print(json.dumps(loop.get_feedback_summary(), indent=2, ensure_ascii=False))

    print("\n改进历史:")
    for item in loop.get_improvement_history():
        print(f"  {item['version']}: 改进 {item['improvement']*100:.1f}%")

    print("\n下一步建议:")
    for suggestion in loop.suggest_next_actions():
        print(f"  - {suggestion}")

    loop.export_history("feedback_history.json")
```

---

## 预期输出

### 运行评估分析

```bash
python eval_analysis.py
```

```
评估结果分析示例
============================================================

分析报告:
{
  "total_cases": 8,
  "pass_rate": 0.625,
  "avg_score": 0.6563,
  "failure_patterns": [
    {"category": "技术", "count": 3, "avg_score": 0.1667}
  ],
  "improvement_suggestions": [
    "通过率较低，建议检查核心逻辑是否正确",
    "类别 '技术' 失败较多，建议针对性优化"
  ]
}

改进建议:
  1. 通过率较低，建议检查核心逻辑是否正确
  2. 类别 '技术' 失败较多，建议针对性优化
```

### 运行 A/B 测试

```bash
python ab_testing.py
```

```
A/B 测试框架示例
============================================================
开始 A/B 测试: Agent Prompt 优化测试
测试 ID: a1b2c3d4
变体数: 2
测试用例数: 5
============================================================

测试分析:
{
  "variants": {
    "v1": {"name": "基础版本", "avg_score": 0.6, "pass_rate": 0.4},
    "v2": {"name": "改进版本", "avg_score": 0.8, "pass_rate": 0.6}
  },
  "winner": {"variant_id": "v2", "name": "改进版本"}
}
```

### 运行反馈循环

```bash
python feedback_loop.py
```

```
反馈循环系统示例
============================================================

反馈摘要:
{
  "total": 5,
  "avg_score": 0.73,
  "by_type": {
    "user": {"count": 3, "avg": 0.8833},
    "automatic": {"count": 1, "avg": 0.6},
    "expert": {"count": 1, "avg": 0.4}
  }
}

改进历史:
  1.1.0: 改进 12.5%
  1.2.0: 改进 13.3%

下一步建议:
  - expert反馈分数较低，建议关注该类型问题
```

---

## 常见错误及解决方案

### 错误 1: A/B 测试流量分配不均

**解决方案：** 确保流量百分比总和为 100%。

### 错误 2: 评估结果偏差

**解决方案：** 增加测试用例数量，确保样本代表性。

### 错误 3: 反馈数据不足

**解决方案：** 结合自动评估和人工反馈。

---

## 每日挑战

### 挑战 1: 实现更复杂的评估

使用 LLM-as-Judge 进行更详细的评估。

### 挑战 2: 构建可视化仪表板

为 A/B 测试结果创建可视化仪表板。

### 挑战 3: 实现自动化优化

基于反馈自动调整 Prompt 模板。

---

## 今日小结

今天我们学习了评估驱动的迭代优化：

1. **评估结果分析**：从数据中发现问题
2. **A/B 测试框架**：对比不同版本的表现
3. **反馈循环系统**：建立持续改进机制

**关键流程：**

```
评估 --> 分析 --> 改进 --> 再评估
  |       |       |        |
 数据   问题    变更     验证
```

---

*明天见！我们将进行 Week 11 的总结复盘。*
