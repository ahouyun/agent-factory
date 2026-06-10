# 📅 Week 11 Day 1：Agent 评估框架：核心指标与基准测试

## 🧭 今日方向
> 建立 Agent 评估的系统化思维，理解核心评估指标和基准测试方法。

## 🎯 生活比喻
> 评估 Agent 就像给学生打分。不能只看"答对了多少题"（准确率），还要看"解题速度"（效率）、"步骤是否合理"（可解释性）、"能否举一反三"（泛化能力）。一个好的评估框架就像一份科学的考卷，能全面考察学生的能力。

## 📋 今日三件事
1. 掌握 Agent 评估的核心指标体系
2. 理解任务完成率、效率、安全性等维度
3. 实现一个基础的 Agent 评估框架

## 🗺️ 手把手路线

### Step 1：理解 Agent 评估的特殊性
- 做什么: 学习 Agent 评估与传统 ML 评估的区别
- 为什么: Agent 涉及多步交互、工具调用、环境反馈，评估更复杂
- 成功标志: 能列出 Agent 评估的 3 个特殊挑战

### Step 2：掌握核心指标
- 做什么: 学习任务完成率、效率、安全性等指标
- 为什么: 指标是评估的基础
- 成功标志: 能解释每个指标的计算方式

### Step 3：设计评估框架
- 做什么: 设计一个可扩展的评估框架
- 为什么: 框架化才能系统化评估
- 成功标志: 能设计出框架的类结构

### Step 4：代码实践
- 做什么: 实现基础评估框架
- 为什么: 代码是最好的理解方式
- 成功标志: 代码跑通并输出评估结果

## 💻 代码区

```python
"""
Agent 评估框架：核心指标与基准测试
"""
from dataclasses import dataclass, field
from typing import List, Dict, Any, Callable
from enum import Enum
import time
import json

# ========== 1. 评估指标定义 ==========

class MetricType(Enum):
    """指标类型"""
    COMPLETION = "completion"      # 任务完成度
    EFFICIENCY = "efficiency"      # 效率
    SAFETY = "safety"              # 安全性
    COST = "cost"                  # 成本
    QUALITY = "quality"            # 输出质量
    ROBUSTNESS = "robustness"      # 鲁棒性


@dataclass
class Metric:
    """评估指标"""
    name: str
    metric_type: MetricType
    description: str
    weight: float = 1.0
    range: tuple = (0.0, 1.0)  # 范围
    higher_is_better: bool = True


@dataclass
class MetricResult:
    """指标结果"""
    metric_name: str
    value: float
    details: Dict = field(default_factory=dict)


# ========== 2. 评估指标集 ==========

class AgentMetrics:
    """Agent 评估指标集"""
    
    @staticmethod
    def task_completion_rate(success: bool, partial_credit: float = 0.0) -> float:
        """
        任务完成率
        - 完全完成: 1.0
        - 部分完成: partial_credit
        - 失败: 0.0
        """
        return 1.0 if success else partial_credit
    
    @staticmethod
    def step_efficiency(total_steps: int, optimal_steps: int) -> float:
        """
        步骤效率
        - optimal_steps: 最优步骤数
        - 总是 >= 0，越接近 1 越好
        """
        if optimal_steps == 0:
            return 0.0
        return min(1.0, optimal_steps / max(total_steps, 1))
    
    @staticmethod
    def tool_usage_efficiency(correct_tools: int, total_tools: int) -> float:
        """
        工具使用效率
        - correct_tools: 正确使用的工具数
        - total_tools: 总共使用的工具数
        """
        if total_tools == 0:
            return 1.0
        return correct_tools / total_tools
    
    @staticmethod
    def safety_score(violations: int, total_actions: int) -> float:
        """
        安全性分数
        - violations: 安全违规次数
        - total_actions: 总动作数
        """
        if total_actions == 0:
            return 1.0
        return 1.0 - (violations / total_actions)
    
    @staticmethod
    def cost_score(estimated_cost: float, budget: float) -> float:
        """
        成本分数
        - estimated_cost: 预估成本
        - budget: 预算
        """
        if budget == 0:
            return 0.0
        return min(1.0, budget / max(estimated_cost, 0.01))
    
    @staticmethod
    def response_quality(relevance: float, accuracy: float, completeness: float) -> float:
        """
        输出质量
        - relevance: 相关性
        - accuracy: 准确性
        - completeness: 完整性
        """
        return (relevance + accuracy + completeness) / 3
    
    @staticmethod
    def robustness_score(success_count: int, total_attempts: int) -> float:
        """
        鲁棒性
        - success_count: 成功次数
        - total_attempts: 总尝试次数
        """
        if total_attempts == 0:
            return 0.0
        return success_count / total_attempts


# ========== 3. 评估场景定义 ==========

@dataclass
class EvalScenario:
    """评估场景"""
    id: str
    name: str
    description: str
    task: str
    expected_steps: int
    available_tools: List[str]
    max_steps: int = 10
    timeout: float = 30.0  # 秒
    budget: float = 1.0  # 成本预算


@dataclass
class AgentAction:
    """Agent 动作记录"""
    step: int
    action_type: str  # think, act, observe, answer
    content: str
    tool_name: str = None
    tool_input: str = None
    tool_output: str = None
    timestamp: float = 0.0


@dataclass
class AgentTrace:
    """Agent 执行轨迹"""
    scenario_id: str
    actions: List[AgentAction]
    final_answer: str
    success: bool
    total_time: float
    total_cost: float


# ========== 4. 评估器 ==========

class AgentEvaluator:
    """Agent 评估器"""
    
    def __init__(self):
        self.metrics = AgentMetrics()
        self.results: List[Dict] = []
    
    def evaluate_trace(self, trace: AgentTrace, scenario: EvalScenario) -> Dict:
        """评估单个轨迹"""
        results = []
        
        # 1. 任务完成率
        completion = self.metrics.task_completion_rate(trace.success)
        results.append(MetricResult("task_completion", completion))
        
        # 2. 步骤效率
        total_steps = len(trace.actions)
        efficiency = self.metrics.step_efficiency(total_steps, scenario.expected_steps)
        results.append(MetricResult("step_efficiency", efficiency, {
            "total_steps": total_steps,
            "optimal_steps": scenario.expected_steps
        }))
        
        # 3. 工具使用效率
        tool_actions = [a for a in trace.actions if a.tool_name]
        correct_tools = sum(1 for a in tool_actions if a.tool_output is not None)
        tool_efficiency = self.metrics.tool_usage_efficiency(correct_tools, len(tool_actions))
        results.append(MetricResult("tool_efficiency", tool_efficiency, {
            "total_tool_uses": len(tool_actions),
            "correct_uses": correct_tools
        }))
        
        # 4. 安全性
        safety = self.metrics.safety_score(0, len(trace.actions))  # 假设无违规
        results.append(MetricResult("safety", safety))
        
        # 5. 成本
        cost = self.metrics.cost_score(trace.total_cost, scenario.budget)
        results.append(MetricResult("cost_score", cost, {
            "actual_cost": trace.total_cost,
            "budget": scenario.budget
        }))
        
        # 6. 时间效率
        time_efficiency = min(1.0, scenario.timeout / max(trace.total_time, 0.01))
        results.append(MetricResult("time_efficiency", time_efficiency, {
            "actual_time": trace.total_time,
            "timeout": scenario.timeout
        }))
        
        # 计算总分（加权平均）
        total_score = sum(r.value for r in results) / len(results)
        
        return {
            "scenario_id": scenario.id,
            "metrics": {r.metric_name: r.value for r in results},
            "details": {r.metric_name: r.details for r in results},
            "total_score": total_score
        }
    
    def evaluate_batch(self, traces: List[AgentTrace], scenarios: List[EvalScenario]) -> Dict:
        """批量评估"""
        scenario_map = {s.id: s for s in scenarios}
        all_results = []
        
        for trace in traces:
            if trace.scenario_id in scenario_map:
                result = self.evaluate_trace(trace, scenario_map[trace.scenario_id])
                all_results.append(result)
        
        # 汇总统计
        summary = {
            "total_traces": len(all_results),
            "avg_score": sum(r["total_score"] for r in all_results) / max(len(all_results), 1),
            "completion_rate": sum(1 for r in all_results if r["metrics"]["task_completion"] == 1.0) / max(len(all_results), 1),
            "avg_efficiency": sum(r["metrics"]["step_efficiency"] for r in all_results) / max(len(all_results), 1),
        }
        
        return {
            "results": all_results,
            "summary": summary
        }


# ========== 5. 基准测试套件 ==========

class BenchmarkSuite:
    """基准测试套件"""
    
    def __init__(self, name: str):
        self.name = name
        self.scenarios: List[EvalScenario] = []
        self.results: Dict = {}
    
    def add_scenario(self, scenario: EvalScenario):
        self.scenarios.append(scenario)
    
    def run_benchmark(self, agent_func: Callable) -> Dict:
        """运行基准测试"""
        evaluator = AgentEvaluator()
        traces = []
        
        for scenario in self.scenarios:
            # 运行 Agent
            start_time = time.time()
            try:
                actions, final_answer, success = agent_func(scenario)
                total_time = time.time() - start_time
                
                trace = AgentTrace(
                    scenario_id=scenario.id,
                    actions=actions,
                    final_answer=final_answer,
                    success=success,
                    total_time=total_time,
                    total_cost=0.0  # 简化
                )
            except Exception as e:
                trace = AgentTrace(
                    scenario_id=scenario.id,
                    actions=[],
                    final_answer="",
                    success=False,
                    total_time=time.time() - start_time,
                    total_cost=0.0
                )
            
            traces.append(trace)
        
        # 评估
        results = evaluator.evaluate_batch(traces, self.scenarios)
        self.results = results
        
        return results
    
    def generate_report(self) -> str:
        """生成测试报告"""
        if not self.results:
            return "未运行测试"
        
        summary = self.results["summary"]
        report = f"""
基准测试报告: {self.name}
========================

测试场景数: {summary['total_traces']}
平均得分: {summary['avg_score']:.4f}
完成率: {summary['completion_rate']*100:.1f}%
平均效率: {summary['avg_efficiency']*100:.1f}%

详细结果:
"""
        for result in self.results["results"]:
            report += f"\n  场景 {result['scenario_id']}:"
            for metric, value in result["metrics"].items():
                report += f"\n    {metric}: {value:.4f}"
            report += "\n"
        
        return report


# ========== 6. 示例场景 ==========

def create_sample_benchmark() -> BenchmarkSuite:
    """创建示例基准测试"""
    suite = BenchmarkSuite("Agent 评估基准 v1")
    
    # 场景 1: 简单问答
    suite.add_scenario(EvalScenario(
        id="qa_001",
        name="简单问答",
        description="回答一个简单的问题",
        task="什么是机器学习？",
        expected_steps=2,
        available_tools=["search"],
        max_steps=3,
        timeout=10.0,
        budget=0.1
    ))
    
    # 场景 2: 代码生成
    suite.add_scenario(EvalScenario(
        id="code_001",
        name="代码生成",
        description="生成一个 Python 函数",
        task="写一个计算斐波那契数列的函数",
        expected_steps=3,
        available_tools=["code_exec"],
        max_steps=5,
        timeout=20.0,
        budget=0.2
    ))
    
    # 场景 3: 多步推理
    suite.add_scenario(EvalScenario(
        id="reason_001",
        name="多步推理",
        description="需要多步推理的任务",
        task="如果小明有5个苹果，给了小红2个，又买了3个，最后有多少个？",
        expected_steps=4,
        available_tools=["calculate"],
        max_steps=6,
        timeout=15.0,
        budget=0.15
    ))
    
    return suite


def sample_agent_func(scenario: EvalScenario) -> tuple:
    """示例 Agent 函数"""
    actions = [
        AgentAction(1, "think", f"分析任务: {scenario.task}"),
        AgentAction(2, "act", "执行操作", "search", scenario.task, "搜索结果"),
        AgentAction(3, "answer", "给出回答")
    ]
    return actions, "这是回答", True


# ========== 7. 主函数 ==========

def main():
    """主函数"""
    print("=" * 60)
    print("Agent 评估框架演示")
    print("=" * 60)
    
    # 1. 展示指标
    print("\n1. 核心评估指标:")
    metrics = AgentMetrics()
    print(f"   任务完成率: {metrics.task_completion_rate(True):.2f}")
    print(f"   步骤效率: {metrics.step_efficiency(5, 3):.2f}")
    print(f"   工具效率: {metrics.tool_usage_efficiency(3, 4):.2f}")
    print(f"   安全性: {metrics.safety_score(0, 10):.2f}")
    
    # 2. 运行基准测试
    print("\n2. 运行基准测试...")
    suite = create_sample_benchmark()
    results = suite.run_benchmark(sample_agent_func)
    
    # 3. 生成报告
    print("\n3. 测试报告:")
    print(suite.generate_report())
    
    print("=" * 60)
    print("评估框架演示完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 指标太多不知道选哪个 | 根据任务类型选择核心 3-5 个指标 |
| 2 | 评估结果不稳定 | 增加测试样本，多次运行取平均 |
| 3 | 评估速度太慢 | 并行化评估，减少不必要的日志 |
| 4 | 指标之间矛盾 | 使用加权综合评分，明确优先级 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Task Completion Rate | 任务是否成功完成的比例 |
| Step Efficiency | 实际步骤与最优步骤的比值 |
| Safety Score | 无安全违规的比例 |
| Cost Score | 成本控制在预算内的程度 |
| Robustness | 多次运行结果的一致性 |
| Benchmark | 标准化的测试套件 |
| Agent Trace | Agent 执行过程的完整记录 |

## ✅ 验收清单
- [ ] 能解释 Agent 评估的核心指标
- [ ] 能设计评估场景
- [ ] 代码能跑通并输出评估结果
- [ ] 理解评估框架的可扩展性设计

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
