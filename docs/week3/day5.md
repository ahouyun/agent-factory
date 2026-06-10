# 📅 Week 3 Day 5："When NOT to build agents" 判断框架

## 🧭 今日方向
> 今天我们将学习一个重要但常被忽视的话题：什么时候不应该构建 Agent。了解这个判断框架能避免过度设计。

## 🎯 生活比喻
> 就像不是所有问题都需要用锤子解决一样，不是所有任务都需要 Agent。有时候简单的管道脚本比复杂的 Agent 更合适。

## 📋 今日三件事
1. 理解 Agent 的适用场景
2. 学习判断框架和决策树
3. 分析实际案例

## 🗺️ 手把手路线

### Step 1: Agent 适用性分析
- **做什么**: 了解什么任务适合用 Agent 解决
- **为什么**: 避免在不需要 Agent 的场景中使用
- **成功标志**: 能判断任务是否需要 Agent

### Step 2: 判断框架
- **做什么**: 学习系统的判断方法
- **为什么**: 有框架才能做出理性决策
- **成功标志**: 能使用框架分析具体场景

### Step 3: 案例分析
- **做什么**: 分析成功和失败的 Agent 案例
- **为什么**: 从实际案例中学习
- **成功标志**: 能总结经验教训

## 💻 代码区

```python
# Agent 适用性判断框架

from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum

class TaskComplexity(str, Enum):
    """任务复杂度"""
    SIMPLE = "simple"      # 简单
    MODERATE = "moderate"   # 中等
    COMPLEX = "complex"     # 复杂
    VERY_COMPLEX = "very_complex"  # 非常复杂

class TaskType(str, Enum):
    """任务类型"""
    DETERMINISTIC = "deterministic"  # 确定性
    CREATIVE = "creative"            # 创造性
    ANALYTICAL = "analytical"        # 分析性
    INTERACTIVE = "interactive"      # 交互性

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
            DecisionFactor.COST_SENSITIVITY: 1 - task.cost_sensitivity,  # 成本敏感度越低越好
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

```python
# 决策树和检查清单

DECISION_TREE = """
Agent 决策树
===========

开始
  │
  ├─ 任务是否需要推理？
  │   ├─ 否 → 使用简单脚本/规则
  │   └─ 是 ↓
  │
  ├─ 任务是否需要多步骤？
  │   ├─ 否 → 使用单步 API 调用
  │   └─ 是 ↓
  │
  ├─ 任务是否需要工具使用？
  │   ├─ 否 → 使用纯 LLM 调用
  │   └─ 是 ↓
  │
  ├─ 任务是否有不确定性？
  │   ├─ 否 → 使用确定性算法
  │   └─ 是 ↓
  │
  ├─ 任务是否需要用户交互？
  │   ├─ 否 → 使用批处理 Agent
  │   └─ 是 ↓
  │
  └─ 使用交互式 Agent
"""

CHECKLIST = """
Agent 使用检查清单
=================

在决定使用 Agent 之前，请回答以下问题：

□ 任务是否需要推理能力？
  - 是：需要理解上下文、做出判断
  - 否：简单的规则匹配即可

□ 任务是否涉及多个步骤？
  - 是：需要编排多个操作
  - 否：单步完成

□ 任务是否需要使用外部工具？
  - 是：需要调用 API、查询数据库等
  - 否：纯文本处理

□ 任务是否有不确定性？
  - 是：输入变化大，需要动态处理
  - 否：输入格式固定

□ 任务是否需要错误处理？
  - 是：可能失败，需要重试或回退
  - 否：总能成功

□ 任务的错误容忍度如何？
  - 高：可以接受偶尔错误
  - 低：必须保证准确性

□ 任务的成本敏感度如何？
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

```python
# 实际案例分析

from dataclasses import dataclass
from typing import List, Dict
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
        recommendation="适合使用 Agent，但需要完善的回退机制"
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
        recommendation="不建议使用 Agent，简单的 Python 脚本即可"
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
        recommendation="可以作为辅助工具，但不能完全替代人工"
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
        recommendation="不建议使用 Agent，使用模板引擎"
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
        recommendation="非常适合使用 Agent"
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
        recommendation="不建议使用 Agent，使用定时任务调度器"
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
    print()
    
    # 总结
    print("总结:")
    print("1. Agent 适合：需要推理、多步骤、工具使用的复杂任务")
    print("2. Agent 不适合：简单、确定性、固定格式的任务")
    print("3. 选择时要考虑：复杂度、成本、维护难度")

if __name__ == "__main__":
    analyze_cases()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 过度设计 | 使用决策树评估必要性 |
| 2 | 成本过高 | 考虑替代方案 |
| 3 | 可靠性差 | 考虑使用确定性方案 |
| 4 | 维护困难 | 重新评估架构选择 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Agent | 能自主执行任务的智能程序 |
| 确定性任务 | 结果可预测的任务 |
| 非确定性任务 | 结果有变化的任务 |
| 工具使用 | Agent 调用外部 API 或函数 |
| 推理能力 | 理解上下文并做出判断 |
| 过度设计 | 使用复杂方案解决简单问题 |

## ✅ 验收清单
- [ ] 理解 Agent 的适用场景
- [ ] 能使用判断框架分析任务
- [ ] 了解常见的替代方案
- [ ] 能从案例中总结经验

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
