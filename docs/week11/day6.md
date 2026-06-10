# 📅 Week 11 Day 6：评估驱动的迭代优化

## 🧭 今日方向
> 学习如何用评估结果驱动 Agent 的迭代优化，建立"评估-分析-改进-再评估"的闭环。

## 🎯 生活比喻
> 评估驱动的迭代就像医生看病：先检查（评估）→ 分析病因（分析 bad case）→ 开药治疗（改进）→ 复查（再评估）。这个循环不断重复，直到"病人"（Agent）的"健康状况"（性能）达到预期。

## 📋 今日三件事
1. 理解评估驱动优化的闭环流程
2. 学习 bad case 分析和根因定位方法
3. 实现一个迭代优化框架

## 🗺️ 手把手路线

### Step 1：理解闭环流程
- 做什么: 学习"评估-分析-改进-再评估"的循环
- 为什么: 这是持续改进的基础
- 成功标志: 能画出完整的迭代闭环图

### Step 2：Bad Case 分析
- 做什么: 学习如何从错误中提取改进方向
- 为什么: bad case 是最直接的改进线索
- 成功标志: 能分析 bad case 并提出改进方案

### Step 3：改进策略
- 做什么: 学习针对不同问题的改进方法
- 为什么: 不同问题需要不同的解决方案
- 成功标志: 能选择合适的改进策略

### Step 4：代码实践
- 做什么: 实现完整的迭代优化框架
- 为什么: 代码是最好的理解方式
- 成功标志: 代码跑通

## 💻 代码区

```python
"""
评估驱动的迭代优化
完整的闭环优化框架
"""
from dataclasses import dataclass, field
from typing import List, Dict, Callable, Optional, Any
from enum import Enum
import json
from datetime import datetime

# ========== 1. 问题分类 ==========

class IssueType(Enum):
    """问题类型"""
    WRONG_ANSWER = "wrong_answer"        # 答案错误
    INCOMPLETE = "incomplete"            # 回答不完整
    IRRELEVANT = "irrelevant"            # 回答不相关
    HALLUCINATION = "hallucination"      # 幻觉/编造
    FORMAT_ERROR = "format_error"        # 格式错误
    TOOL_MISUSE = "tool_misuse"          # 工具误用
    LOGIC_ERROR = "logic_error"          # 逻辑错误
    OTHER = "other"


@dataclass
class BadCase:
    """Bad Case 记录"""
    case_id: str
    input_text: str
    expected_output: str
    actual_output: str
    issue_type: IssueType
    severity: str  # high, medium, low
    root_cause: str = ""
    improvement_suggestion: str = ""
    metadata: Dict = field(default_factory=dict)


@dataclass
class IterationResult:
    """单次迭代结果"""
    iteration_id: int
    timestamp: str
    metrics: Dict[str, float]
    bad_cases: List[BadCase]
    improvements_made: List[str]
    next_actions: List[str]


# ========== 2. Bad Case 分析器 ==========

class BadCaseAnalyzer:
    """Bad Case 分析器"""
    
    def __init__(self):
        self.bad_cases: List[BadCase] = []
    
    def add_case(self, case: BadCase):
        self.bad_cases.append(case)
    
    def analyze_patterns(self) -> Dict:
        """分析问题模式"""
        # 按问题类型统计
        by_type = {}
        for case in self.bad_cases:
            issue_type = case.issue_type.value
            by_type[issue_type] = by_type.get(issue_type, 0) + 1
        
        # 按严重程度统计
        by_severity = {}
        for case in self.bad_cases:
            by_severity[case.severity] = by_severity.get(case.severity, 0) + 1
        
        # 找出高频问题
        most_common_type = max(by_type.items(), key=lambda x: x[1]) if by_type else None
        
        return {
            "total_cases": len(self.bad_cases),
            "by_type": by_type,
            "by_severity": by_severity,
            "most_common_issue": most_common_type[0] if most_common_type else None,
            "high_severity_count": by_severity.get("high", 0)
        }
    
    def identify_root_causes(self) -> List[Dict]:
        """识别根本原因"""
        root_causes = []
        
        # 按问题类型分析根因
        type_groups = {}
        for case in self.bad_cases:
            if case.issue_type not in type_groups:
                type_groups[case.issue_type] = []
            type_groups[case.issue_type].append(case)
        
        for issue_type, cases in type_groups.items():
            # 分析常见根因
            common_causes = {}
            for case in cases:
                if case.root_cause:
                    common_causes[case.root_cause] = common_causes.get(case.root_cause, 0) + 1
            
            if common_causes:
                top_cause = max(common_causes.items(), key=lambda x: x[1])
                root_causes.append({
                    "issue_type": issue_type.value,
                    "root_cause": top_cause[0],
                    "frequency": top_cause[1],
                    "affected_cases": len(cases)
                })
        
        return root_causes
    
    def generate_improvement_plan(self) -> List[Dict]:
        """生成改进计划"""
        plan = []
        
        # 分析结果
        analysis = self.analyze_patterns()
        root_causes = self.identify_root_causes()
        
        # 根据问题类型生成改进建议
        for root_cause in root_causes:
            issue_type = root_cause["issue_type"]
            cause = root_cause["root_cause"]
            
            suggestion = self._suggest_improvement(issue_type, cause)
            plan.append({
                "issue_type": issue_type,
                "root_cause": cause,
                "suggestion": suggestion,
                "priority": "high" if root_cause["affected_cases"] > 3 else "medium"
            })
        
        return plan
    
    def _suggest_improvement(self, issue_type: str, root_cause: str) -> str:
        """根据问题类型和根因建议改进方案"""
        suggestions = {
            "wrong_answer": "检查模型知识是否准确，考虑增加领域训练数据",
            "incomplete": "优化 prompt 设计，确保覆盖所有要点",
            "irrelevant": "改进检索策略，确保上下文相关性",
            "hallucination": "添加事实检查模块，使用 RAG 增强",
            "format_error": "规范输出格式，添加格式验证",
            "tool_misuse": "优化工具选择逻辑，增加工具使用示例",
            "logic_error": "检查推理链路，添加逻辑验证步骤"
        }
        return suggestions.get(issue_type, "需要进一步分析")


# ========== 3. 迭代优化器 ==========

class IterationOptimizer:
    """迭代优化器"""
    
    def __init__(self, agent_func: Callable, eval_func: Callable):
        self.agent_func = agent_func
        self.eval_func = eval_func
        self.history: List[IterationResult] = []
        self.analyzer = BadCaseAnalyzer()
    
    def run_iteration(
        self,
        eval_data: List[Dict],
        iteration_id: int
    ) -> IterationResult:
        """运行单次迭代"""
        print(f"\n{'='*50}")
        print(f"迭代 {iteration_id}")
        print(f"{'='*50}")
        
        # 1. 运行评估
        print("1. 运行评估...")
        eval_results = self.eval_func(self.agent_func, eval_data)
        
        # 2. 提取 bad cases
        print("2. 分析 bad cases...")
        bad_cases = self._extract_bad_cases(eval_results)
        
        # 3. 分析模式
        print("3. 分析问题模式...")
        patterns = self.analyzer.analyze_patterns()
        print(f"   总 bad cases: {patterns['total_cases']}")
        print(f"   最常见问题: {patterns['most_common_issue']}")
        
        # 4. 识别根因
        print("4. 识别根本原因...")
        root_causes = self.analyzer.identify_root_causes()
        for rc in root_causes[:3]:
            print(f"   - {rc['issue_type']}: {rc['root_cause']} ({rc['frequency']}次)")
        
        # 5. 生成改进计划
        print("5. 生成改进计划...")
        improvement_plan = self.analyzer.generate_improvement_plan()
        
        # 6. 记录结果
        result = IterationResult(
            iteration_id=iteration_id,
            timestamp=datetime.now().isoformat(),
            metrics=eval_results.get("metrics", {}),
            bad_cases=bad_cases,
            improvements_made=[p["suggestion"] for p in improvement_plan],
            next_actions=[p["suggestion"] for p in improvement_plan if p["priority"] == "high"]
        )
        
        self.history.append(result)
        
        # 7. 打印摘要
        self._print_iteration_summary(result)
        
        return result
    
    def _extract_bad_cases(self, eval_results: Dict) -> List[BadCase]:
        """从评估结果中提取 bad cases"""
        bad_cases = []
        
        for result in eval_results.get("details", []):
            if not result.get("correct", True):
                # 分析错误类型
                issue_type = self._classify_error(result)
                
                case = BadCase(
                    case_id=result.get("id", str(len(bad_cases))),
                    input_text=result.get("input", ""),
                    expected_output=result.get("reference", ""),
                    actual_output=result.get("prediction", ""),
                    issue_type=issue_type,
                    severity=self._assess_severity(result),
                    metadata=result.get("metadata", {})
                )
                bad_cases.append(case)
                self.analyzer.add_case(case)
        
        return bad_cases
    
    def _classify_error(self, result: Dict) -> IssueType:
        """分类错误类型"""
        prediction = result.get("prediction", "")
        reference = result.get("reference", "")
        
        # 简化的错误分类逻辑
        if not prediction:
            return IssueType.INCOMPLETE
        elif len(prediction) < len(reference) * 0.3:
            return IssueType.INCOMPLETE
        elif "我不知道" in prediction or "无法" in prediction:
            return IssueType.WRONG_ANSWER
        else:
            return IssueType.WRONG_ANSWER
    
    def _assess_severity(self, result: Dict) -> str:
        """评估严重程度"""
        # 简化的严重程度评估
        return "medium"
    
    def _print_iteration_summary(self, result: IterationResult):
        """打印迭代摘要"""
        print(f"\n迭代 {result.iteration_id} 摘要:")
        print(f"  指标: {json.dumps(result.metrics, indent=4)}")
        print(f"  Bad Cases: {len(result.bad_cases)}")
        print(f"  改进建议: {len(result.improvements_made)}")
        
        if result.next_actions:
            print(f"  优先行动:")
            for action in result.next_actions[:3]:
                print(f"    - {action[:50]}...")
    
    def get_optimization_history(self) -> Dict:
        """获取优化历史"""
        if not self.history:
            return {}
        
        # 追踪指标变化
        metrics_over_time = {}
        for result in self.history:
            for metric, value in result.metrics.items():
                if metric not in metrics_over_time:
                    metrics_over_time[metric] = []
                metrics_over_time[metric].append(value)
        
        # 追踪 bad cases 数量变化
        bad_cases_over_time = [len(r.bad_cases) for r in self.history]
        
        return {
            "iterations": len(self.history),
            "metrics_trend": metrics_over_time,
            "bad_cases_trend": bad_cases_over_time,
            "latest_metrics": self.history[-1].metrics if self.history else {},
            "improvement_summary": self._summarize_improvements()
        }
    
    def _summarize_improvements(self) -> List[str]:
        """总结改进"""
        all_improvements = []
        for result in self.history:
            all_improvements.extend(result.improvements_made)
        
        # 去重并统计频率
        improvement_counts = {}
        for imp in all_improvements:
            improvement_counts[imp] = improvement_counts.get(imp, 0) + 1
        
        # 按频率排序
        sorted_improvements = sorted(
            improvement_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return [imp[0] for imp in sorted_improvements[:5]]


# ========== 4. 示例运行 ==========

def create_sample_data() -> List[Dict]:
    """创建示例评估数据"""
    return [
        {"id": "1", "instruction": "什么是机器学习？", "input": "", "output": "机器学习是让计算机从数据中学习的方法。"},
        {"id": "2", "instruction": "Python 中如何定义函数？", "input": "", "output": "使用 def 关键字定义函数。"},
        {"id": "3", "instruction": "什么是 API？", "input": "", "output": "API 是应用程序编程接口。"},
    ]


def sample_agent(task: Dict) -> str:
    """示例 Agent"""
    instruction = task.get("instruction", "")
    
    # 模拟一些正确和错误的回答
    if "机器学习" in instruction:
        return "机器学习是让计算机从数据中学习的方法。"
    elif "函数" in instruction:
        return "使用 def 关键字。"  # 不完整
    elif "API" in instruction:
        return "不知道。"  # 错误
    
    return "模拟回答"


def sample_evaluator(agent_func: Callable, data: List[Dict]) -> Dict:
    """示例评估器"""
    results = []
    correct_count = 0
    
    for sample in data:
        prediction = agent_func(sample)
        correct = prediction.strip() == sample["output"].strip()
        if correct:
            correct_count += 1
        
        results.append({
            "id": sample["id"],
            "input": sample["instruction"],
            "prediction": prediction,
            "reference": sample["output"],
            "correct": correct
        })
    
    return {
        "metrics": {
            "accuracy": correct_count / max(len(data), 1),
            "total": len(data),
            "correct": correct_count
        },
        "details": results
    }


# ========== 5. 主函数 ==========

def main():
    """主函数"""
    print("=" * 60)
    print("评估驱动的迭代优化")
    print("=" * 60)
    
    # 创建优化器
    optimizer = IterationOptimizer(
        agent_func=sample_agent,
        eval_func=sample_evaluator
    )
    
    # 创建评估数据
    eval_data = create_sample_data()
    
    # 运行多轮迭代
    for i in range(3):
        result = optimizer.run_iteration(eval_data, iteration_id=i+1)
    
    # 获取优化历史
    print("\n" + "=" * 60)
    print("优化历史")
    print("=" * 60)
    
    history = optimizer.get_optimization_history()
    print(f"总迭代次数: {history['iterations']}")
    print(f"最新指标: {json.dumps(history['latest_metrics'], indent=2)}")
    
    if history['metrics_trend']:
        print("\n指标趋势:")
        for metric, values in history['metrics_trend'].items():
            print(f"  {metric}: {' -> '.join(f'{v:.3f}' for v in values)}")
    
    print(f"\nBad Cases 趋势: {history['bad_cases_trend']}")
    
    print("\n改进建议总结:")
    for imp in history['improvement_summary'][:3]:
        print(f"  - {imp[:60]}...")
    
    print("\n" + "=" * 60)
    print("迭代优化完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 迭代后指标没提升 | 分析改进方向是否正确，调整策略 |
| 2 | Bad case 分析不准确 | 增加人工审核，优化分类逻辑 |
| 3 | 改进方向太多 | 聚焦高优先级问题，分步实施 |
| 4 | 无法定位根因 | 增加详细日志，追踪中间结果 |
| 5 | 迭代速度太慢 | 自动化评估流程，并行化处理 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Bad Case | 模型预测错误的案例 |
| Root Cause | 问题的根本原因 |
| Iteration | 一次完整的评估-改进循环 |
| Drift | 模型性能随时间下降 |
| Feedback Loop | 评估结果反馈到改进的闭环 |
| A/B Testing | 对比不同改进方案的效果 |
| Regression | 改进导致其他方面性能下降 |

## ✅ 验收清单
- [ ] 理解评估驱动优化的闭环流程
- [ ] 能进行 bad case 分析
- [ ] 能生成改进计划
- [ ] 代码能跑通并输出结果

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
