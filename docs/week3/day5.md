# Day 5: "When NOT to build agents" 判断框架

## 今日学习目标

1. 理解 Agent 的适用场景
2. 学习判断框架和决策树
3. 分析成功和失败的案例
4. 了解常见的替代方案
5. 建立理性决策的思维方式

---

## 第一部分：为什么需要这个框架？

### 问题：过度使用 Agent

```
常见错误：
1. 简单的脚本任务 → 用 Agent（过度设计）
2. 固定的 API 调用 → 用 Agent（不需要灵活性）
3. 确定性的数据转换 → 用 Agent（增加成本）

后果：
- 增加复杂性
- 提高成本
- 降低可靠性
- 增加维护难度
```

### 正确的思维方式

```
不是："这个任务能用 Agent 吗？"
而是："这个任务需要 Agent 吗？"

不是："Agent 能做什么？"
而是："什么方案最适合这个任务？"
```

---

## 第二部分：判断框架

### 文件：app/agent_framework/decision.py

```python
"""
Agent 决策框架
"""

from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum


class TaskComplexity(str, Enum):
    """任务复杂度"""
    SIMPLE = "simple"          # 简单
    MODERATE = "moderate"      # 中等
    COMPLEX = "complex"        # 复杂
    VERY_COMPLEX = "very_complex"  # 非常复杂


class TaskType(str, Enum):
    """任务类型"""
    DETERMINISTIC = "deterministic"    # 确定性
    CREATIVE = "creative"              # 创造性
    ANALYTICAL = "analytical"          # 分析性
    INTERACTIVE = "interactive"        # 交互性


class DecisionFactor(str, Enum):
    """决策因素"""
    TASK_COMPLEXITY = "task_complexity"
    UNCERTAINTY_LEVEL = "uncertainty_level"
    TOOL_DEPENDENCY = "tool_dependency"
    USER_INTERACTION = "user_interaction"
    ERROR_TOLERANCE = "error_tolerance"
    COST_SENSITIVITY = "cost_sensitivity"


@dataclass
class TaskAnalysis:
    """任务分析"""
    name: str
    description: str
    complexity: TaskComplexity
    task_type: TaskType
    uncertainty_level: float  # 0-1
    tool_dependency: float  # 0-1
    user_interaction: float  # 0-1
    error_tolerance: float  # 0-1 (越高越能容忍错误)
    cost_sensitivity: float  # 0-1 (越高越敏感)


@dataclass
class Recommendation:
    """推荐方案"""
    use_agent: bool
    confidence: float
    reason: str
    alternatives: List[str]
    risk_factors: List[str]


class AgentDecisionFramework:
    """Agent 决策框架"""
    
    def __init__(self):
        self.decision_threshold = 0.6
    
    def analyze_task(self, task: TaskAnalysis) -> Recommendation:
        """
        分析任务并给出推荐
        
        Args:
            task: 任务分析
        
        Returns:
            推荐方案
        """
        # 计算 Agent 适用性得分
        agent_score = self._calculate_agent_score(task)
        
        # 判断是否使用 Agent
        use_agent = agent_score >= self.decision_threshold
        
        # 生成推荐
        if use_agent:
            recommendation = self._recommend_agent(task, agent_score)
        else:
            recommendation = self._recommend_alternative(task, agent_score)
        
        return recommendation
    
    def _calculate_agent_score(self, task: TaskAnalysis) -> float:
        """计算 Agent 适用性得分"""
        scores = {
            DecisionFactor.TASK_COMPLEXITY: self._complexity_score(task.complexity),
            DecisionFactor.UNCERTAINTY_LEVEL: task.uncertainty_level,
            DecisionFactor.TOOL_DEPENDENCY: task.tool_dependency,
            DecisionFactor.USER_INTERACTION: task.user_interaction,
            DecisionFactor.ERROR_TOLERANCE: task.error_tolerance,
            DecisionFactor.COST_SENSITIVITY: 1 - task.cost_sensitivity,
        }
        
        # 加权平均
        weights = {
            DecisionFactor.TASK_COMPLEXITY: 0.25,
            DecisionFactor.UNCERTAINTY_LEVEL: 0.2,
            DecisionFactor.TOOL_DEPENDENCY: 0.2,
            DecisionFactor.USER_INTERACTION: 0.15,
            DecisionFactor.ERROR_TOLERANCE: 0.1,
            DecisionFactor.COST_SENSITIVITY: 0.1,
        }
        
        total_score = sum(
            scores[factor] * weights[factor]
            for factor in scores
        )
        
        return total_score
    
    def _complexity_score(self, complexity: TaskComplexity) -> float:
        """复杂度得分"""
        scores = {
            TaskComplexity.SIMPLE: 0.2,
            TaskComplexity.MODERATE: 0.5,
            TaskComplexity.COMPLEX: 0.8,
            TaskComplexity.VERY_COMPLEX: 1.0
        }
        return scores[complexity]
    
    def _recommend_agent(self, task: TaskAnalysis, score: float) -> Recommendation:
        """推荐使用 Agent"""
        risk_factors = []
        
        if task.error_tolerance < 0.3:
            risk_factors.append("错误容忍度低，需要严格的错误处理")
        if task.cost_sensitivity > 0.7:
            risk_factors.append("成本敏感，需要优化 API 调用")
        if task.uncertainty_level > 0.8:
            risk_factors.append("不确定性高，需要人工审核")
        
        return Recommendation(
            use_agent=True,
            confidence=score,
            reason=f"任务复杂度高，需要 Agent 的灵活性和推理能力",
            alternatives=["使用更简单的自动化脚本", "使用规则引擎"],
            risk_factors=risk_factors
        )
    
    def _recommend_alternative(self, task: TaskAnalysis, score: float) -> Recommendation:
        """推荐替代方案"""
        alternatives = []
        
        if task.complexity in [TaskComplexity.SIMPLE, TaskComplexity.MODERATE]:
            alternatives.append("使用简单的自动化脚本")
            alternatives.append("使用规则引擎")
        
        if task.task_type == TaskType.DETERMINISTIC:
            alternatives.append("使用传统算法")
            alternatives.append("使用工作流引擎")
        
        if task.tool_dependency < 0.3:
            alternatives.append("使用 API 调用")
            alternatives.append("使用批处理任务")
        
        return Recommendation(
            use_agent=False,
            confidence=1 - score,
            reason="任务相对简单，不需要 Agent 的复杂性",
            alternatives=alternatives,
            risk_factors=[]
        )


# 使用示例
if __name__ == "__main__":
    framework = AgentDecisionFramework()
    
    # 示例1：复杂数据分析任务
    task1 = TaskAnalysis(
        name="复杂数据分析",
        description="分析销售数据，生成洞察报告",
        complexity=TaskComplexity.COMPLEX,
        task_type=TaskType.ANALYTICAL,
        uncertainty_level=0.7,
        tool_dependency=0.8,
        user_interaction=0.3,
        error_tolerance=0.5,
        cost_sensitivity=0.4
    )
    
    recommendation1 = framework.analyze_task(task1)
    print("任务1: 复杂数据分析")
    print(f"  使用 Agent: {recommendation1.use_agent}")
    print(f"  置信度: {recommendation1.confidence:.2f}")
    print(f"  原因: {recommendation1.reason}")
    print()
    
    # 示例2：简单的数据转换任务
    task2 = TaskAnalysis(
        name="数据格式转换",
        description="将 CSV 转换为 JSON",
        complexity=TaskComplexity.SIMPLE,
        task_type=TaskType.DETERMINISTIC,
        uncertainty_level=0.1,
        tool_dependency=0.2,
        user_interaction=0.1,
        error_tolerance=0.9,
        cost_sensitivity=0.8
    )
    
    recommendation2 = framework.analyze_task(task2)
    print("任务2: 数据格式转换")
    print(f"  使用 Agent: {recommendation2.use_agent}")
    print(f"  置信度: {recommendation2.confidence:.2f}")
    print(f"  原因: {recommendation2.reason}")
    print(f"  替代方案: {', '.join(recommendation2.alternatives)}")
```

---

## 第三部分：决策树和检查清单

### 文件：app/agent_framework/checklist.py

```python
"""
决策树和检查清单
"""

DECISION_TREE = """
Agent 决策树
===========

开始
  |
  +-- 任务是否需要推理？
  |   +-- 否 -> 使用简单脚本/规则
  |   +-- 是 -> |
  |
  +-- 任务是否需要多步骤？
  |   +-- 否 -> 使用单步 API 调用
  |   +-- 是 -> |
  |
  +-- 任务是否需要工具使用？
  |   +-- 否 -> 使用纯 LLM 调用
  |   +-- 是 -> |
  |
  +-- 任务是否有不确定性？
  |   +-- 否 -> 使用确定性算法
  |   +-- 是 -> |
  |
  +-- 任务是否需要用户交互？
  |   +-- 否 -> 使用批处理 Agent
  |   +-- 是 -> |
  |
  +-- 使用交互式 Agent
"""

CHECKLIST = """
Agent 使用检查清单
=================

在决定使用 Agent 之前，请回答以下问题：

[ ] 任务是否需要推理能力？
  - 是：需要理解上下文、做出判断
  - 否：简单的规则匹配即可

[ ] 任务是否涉及多个步骤？
  - 是：需要编排多个操作
  - 否：单步完成

[ ] 任务是否需要使用外部工具？
  - 是：需要调用 API、查询数据库等
  - 否：纯文本处理

[ ] 任务是否有不确定性？
  - 是：输入变化大，需要动态处理
  - 否：输入格式固定

[ ] 任务是否需要错误处理？
  - 是：可能失败，需要重试或回退
  - 否：总能成功

[ ] 任务的错误容忍度如何？
  - 高：可以接受偶尔错误
  - 低：必须保证准确性

[ ] 任务的成本敏感度如何？
  - 高：需要控制 API 调用成本
  - 低：成本不是主要考虑

如果大部分回答是"是"，那么 Agent 可能是合适的选择。
"""

ALTERNATIVES = """
Agent 替代方案
=============

1. 简单脚本
   适用：确定性任务，格式固定
   优点：简单、快速、成本低
   缺点：不灵活，无法处理变化

2. 规则引擎
   适用：有明确规则的任务
   优点：可预测，易于维护
   缺点：规则多时复杂

3. 工作流引擎
   适用：固定的多步骤流程
   优点：可视化，易于监控
   缺点：不灵活

4. API 调用
   适用：单一功能调用
   优点：简单直接
   缺点：无法组合

5. 传统机器学习
   适用：有大量标注数据的任务
   优点：性能稳定
   缺点：需要训练数据

6. 规则 + LLM 混合
   适用：部分确定，部分需要推理
   优点：平衡灵活性和成本
   缺点：架构复杂
"""

print(DECISION_TREE)
print(CHECKLIST)
print(ALTERNATIVES)
```

---

## 第四部分：案例分析

### 文件：app/agent_framework/cases.py

```python
"""
案例分析
"""

from dataclasses import dataclass
from typing import List
from enum import Enum


class CaseOutcome(str, Enum):
    """案例结果"""
    SUCCESS = "success"
    FAILURE = "failure"
    PARTIAL = "partial"


@dataclass
class CaseStudy:
    """案例研究"""
    name: str
    description: str
    used_agent: bool
    outcome: CaseOutcome
    lessons_learned: List[str]
    recommendation: str
    alternative_solution: str


# 案例数据库
CASE_STUDIES = [
    CaseStudy(
        name="智能客服系统",
        description="使用 Agent 处理客户咨询，自动回答常见问题",
        used_agent=True,
        outcome=CaseOutcome.SUCCESS,
        lessons_learned=[
            "Agent 适合处理多样化的客户问题",
            "需要良好的知识库支持",
            "人工介入机制很重要"
        ],
        recommendation="适合使用 Agent，但需要完善的回退机制",
        alternative_solution="简单问答可用规则引擎"
    ),
    CaseStudy(
        name="数据格式转换",
        description="将 CSV 文件转换为 JSON 格式",
        used_agent=True,
        outcome=CaseOutcome.FAILURE,
        lessons_learned=[
            "简单的确定性任务不需要 Agent",
            "脚本更简单、更可靠、成本更低",
            "过度设计导致维护困难"
        ],
        recommendation="不建议使用 Agent，简单的 Python 脚本即可",
        alternative_solution="使用 pandas 或 csv 模块"
    ),
    CaseStudy(
        name="代码审查助手",
        description="自动审查代码，提供改进建议",
        used_agent=True,
        outcome=CaseOutcome.PARTIAL,
        lessons_learned=[
            "Agent 能发现一些明显问题",
            "复杂逻辑仍需人工审查",
            "误报率需要控制"
        ],
        recommendation="可以作为辅助工具，但不能完全替代人工",
        alternative_solution="使用 linter + 静态分析工具"
    ),
    CaseStudy(
        name="报表生成",
        description="根据数据库数据生成固定格式的报表",
        used_agent=True,
        outcome=CaseOutcome.FAILURE,
        lessons_learned=[
            "固定格式的输出不需要 Agent",
            "模板引擎更合适",
            "Agent 的不确定性会导致格式错误"
        ],
        recommendation="不建议使用 Agent，使用模板引擎",
        alternative_solution="使用 Jinja2 或类似模板引擎"
    ),
    CaseStudy(
        name="研究助手",
        description="帮助研究人员收集和分析文献",
        used_agent=True,
        outcome=CaseOutcome.SUCCESS,
        lessons_learned=[
            "Agent 适合处理非结构化信息",
            "需要整合多个数据源",
            "推理能力很有价值"
        ],
        recommendation="非常适合使用 Agent",
        alternative_solution="无合适的替代方案"
    ),
    CaseStudy(
        name="定时任务",
        description="每天定时发送邮件报告",
        used_agent=True,
        outcome=CaseOutcome.FAILURE,
        lessons_learned=[
            "定时任务是确定性的",
            "cron + 脚本更简单可靠",
            "Agent 增加了不必要的复杂性"
        ],
        recommendation="不建议使用 Agent，使用定时任务调度器",
        alternative_solution="使用 cron、APScheduler 等"
    ),
    CaseStudy(
        name="多语言翻译",
        description="将文档翻译成多种语言",
        used_agent=True,
        outcome=CaseOutcome.SUCCESS,
        lessons_learned=[
            "Agent 适合处理语言任务",
            "可以保持上下文一致性",
            "支持批量处理"
        ],
        recommendation="适合使用 Agent",
        alternative_solution="使用传统翻译 API（如 Google Translate）"
    ),
    CaseStudy(
        name="文件备份",
        description="定期备份文件到云存储",
        used_agent=True,
        outcome=CaseOutcome.FAILURE,
        lessons_learned=[
            "文件备份是确定性任务",
            "rsync + cron 更简单可靠",
            "Agent 增加了失败风险"
        ],
        recommendation="不建议使用 Agent，使用 rsync + cron",
        alternative_solution="rsync、rclone + cron"
    ),
]


def analyze_cases():
    """分析案例"""
    print("=== Agent 使用案例分析 ===\n")
    
    success_cases = [c for c in CASE_STUDIES if c.outcome == CaseOutcome.SUCCESS]
    failure_cases = [c for c in CASE_STUDIES if c.outcome == CaseOutcome.FAILURE]
    partial_cases = [c for c in CASE_STUDIES if c.outcome == CaseOutcome.PARTIAL]
    
    print(f"成功案例: {len(success_cases)}")
    print(f"失败案例: {len(failure_cases)}")
    print(f"部分成功: {len(partial_cases)}")
    print()
    
    # 成功案例特点
    print("成功案例特点:")
    for case in success_cases:
        print(f"  - {case.name}: {case.description}")
        print(f"    教训: {case.lessons_learned[0]}")
    print()
    
    # 失败案例特点
    print("失败案例特点:")
    for case in failure_cases:
        print(f"  - {case.name}: {case.description}")
        print(f"    教训: {case.lessons_learned[0]}")
        print(f"    替代方案: {case.alternative_solution}")
    print()
    
    # 总结
    print("总结:")
    print("1. Agent 适合：需要推理、多步骤、工具使用的复杂任务")
    print("2. Agent 不适合：简单、确定性、固定格式的任务")
    print("3. 选择时要考虑：复杂度、成本、维护难度")


if __name__ == "__main__":
    analyze_cases()
```

---

## 第五部分：实战练习

### 练习：评估任务

```python
"""
实战练习：评估以下任务是否应该使用 Agent
"""

from app.agent_framework.decision import (
    AgentDecisionFramework,
    TaskAnalysis,
    TaskComplexity,
    TaskType
)


def evaluate_task(name: str, description: str, **kwargs):
    """评估任务"""
    framework = AgentDecisionFramework()
    
    task = TaskAnalysis(
        name=name,
        description=description,
        **kwargs
    )
    
    recommendation = framework.analyze_task(task)
    
    print(f"\n任务: {name}")
    print(f"描述: {description}")
    print(f"使用 Agent: {'是' if recommendation.use_agent else '否'}")
    print(f"置信度: {recommendation.confidence:.2f}")
    print(f"原因: {recommendation.reason}")
    if recommendation.alternatives:
        print(f"替代方案: {', '.join(recommendation.alternatives)}")
    
    return recommendation


# 练习任务
if __name__ == "__main__":
    print("=== 任务评估练习 ===")
    
    # 任务1：情感分析
    evaluate_task(
        "情感分析",
        "分析用户评论的情感倾向",
        complexity=TaskComplexity.MODERATE,
        task_type=TaskType.ANALYTICAL,
        uncertainty_level=0.6,
        tool_dependency=0.5,
        user_interaction=0.2,
        error_tolerance=0.7,
        cost_sensitivity=0.5
    )
    
    # 任务2：数据清洗
    evaluate_task(
        "数据清洗",
        "清洗CSV文件中的脏数据",
        complexity=TaskComplexity.SIMPLE,
        task_type=TaskType.DETERMINISTIC,
        uncertainty_level=0.2,
        tool_dependency=0.3,
        user_interaction=0.1,
        error_tolerance=0.8,
        cost_sensitivity=0.9
    )
    
    # 任务3：智能客服
    evaluate_task(
        "智能客服",
        "处理客户咨询，自动回答问题",
        complexity=TaskComplexity.COMPLEX,
        task_type=TaskType.INTERACTIVE,
        uncertainty_level=0.8,
        tool_dependency=0.7,
        user_interaction=0.9,
        error_tolerance=0.4,
        cost_sensitivity=0.3
    )
    
    # 任务4：定时报告
    evaluate_task(
        "定时报告",
        "每天定时生成销售报告",
        complexity=TaskComplexity.SIMPLE,
        task_type=TaskType.DETERMINISTIC,
        uncertainty_level=0.1,
        tool_dependency=0.4,
        user_interaction=0.0,
        error_tolerance=0.9,
        cost_sensitivity=0.8
    )
```

---

## 验证清单

完成今日学习后，检查以下项目：

- [ ] 理解 Agent 的适用场景
- [ ] 能使用判断框架分析任务
- [ ] 了解常见的替代方案
- [ ] 能从案例中总结经验
- [ ] 建立了理性决策的思维方式

---

## 今日小结

| 概念 | 关键点 |
|------|--------|
| Agent 适用性 | 不是所有任务都需要 Agent |
| 决策框架 | 系统化评估任务复杂度 |
| 替代方案 | 脚本、规则引擎、工作流等 |
| 案例分析 | 从成功和失败中学习 |
| 过度设计 | 使用复杂方案解决简单问题 |
| 成本效益 | 考虑开发和维护成本 |

---

## 明日预告

明天我们将学习：
- LLM API 工程实践
- 流式调用
- Token 管理
- 成本优化

---

## 参考资源

- [Agent 设计模式](https://www.deeplearning.ai/the-batch/how-agents-can-improve-llm-performance/)
- [何时使用 AI Agent](https://towardsdatascience.com/when-to-use-ai-agents/)
