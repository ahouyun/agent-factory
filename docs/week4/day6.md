# 📅 Week 4 Day 6：五种 Agent 工作流模式

## 🧭 今日方向
> 今天我们将学习五种常见的 Agent 工作流模式，了解它们的优缺点和适用场景。

## 🎯 生活比喻
> 如果把 Agent 比作一个团队，那么不同的工作流模式就像不同的团队协作方式：有些是流水线（顺序），有些是分工合作（并行），有些是项目经理制（路由）。

## 📋 今日三件事
1. 学习五种 Agent 工作流模式
2. 对比不同模式的优缺点
3. 分析适用场景和选择策略

## 🗺️ 手把手路线

### Step 1: 工作流模式概览
- **做什么**: 了解五种主要的工作流模式
- **为什么**: 不同任务需要不同的工作流
- **成功标志**: 能描述五种工作流模式

### Step 2: 模式对比分析
- **做什么**: 对比不同模式的优缺点
- **为什么**: 选择合适的模式很重要
- **成功标志**: 能分析不同模式的适用场景

### Step 3: 选择策略
- **做什么**: 学习如何选择合适的工作流
- **为什么**: 正确的选择能提高效率
- **成功标志**: 能根据任务选择合适的工作流

## 💻 代码区

```python
# 五种 Agent 工作流模式

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Callable
from enum import Enum
import asyncio

class WorkflowPattern(str, Enum):
    """工作流模式"""
    SEQUENTIAL = "sequential"          # 顺序执行
    PARALLEL = "parallel"              # 并行执行
    ROUTING = "routing"                # 路由分发
    ORCHESTRATION = "orchestration"    # 编排协调
    EVALUATION = "evaluation"          # 评估优化

@dataclass
class WorkflowStep:
    """工作流步骤"""
    name: str
    agent: str
    input_schema: Dict
    output_schema: Dict
    dependencies: List[str] = field(default_factory=list)

class SequentialWorkflow:
    """顺序工作流模式"""
    
    def __init__(self, name: str):
        self.name = name
        self.steps: List[WorkflowStep] = []
    
    def add_step(self, step: WorkflowStep):
        """添加步骤"""
        self.steps.append(step)
    
    def execute(self, input_data: Dict) -> Dict:
        """执行工作流"""
        print(f"\n📋 执行顺序工作流: {self.name}")
        
        current_data = input_data
        
        for i, step in enumerate(self.steps):
            print(f"  步骤 {i+1}: {step.name}")
            
            # 模拟执行
            result = self._execute_step(step, current_data)
            current_data = result
            
            print(f"    输出: {result}")
        
        return current_data
    
    def _execute_step(self, step: WorkflowStep, input_data: Dict) -> Dict:
        """执行单个步骤"""
        # 模拟步骤执行
        return {"output": f"{step.name} 完成", "data": input_data}

class ParallelWorkflow:
    """并行工作流模式"""
    
    def __init__(self, name: str):
        self.name = name
        self.steps: List[WorkflowStep] = []
    
    def add_step(self, step: WorkflowStep):
        """添加步骤"""
        self.steps.append(step)
    
    def execute(self, input_data: Dict) -> Dict:
        """执行工作流"""
        print(f"\n⚡ 执行并行工作流: {self.name}")
        
        results = {}
        
        # 并行执行所有步骤
        for step in self.steps:
            print(f"  并行执行: {step.name}")
            result = self._execute_step(step, input_data)
            results[step.name] = result
        
        # 合并结果
        merged = self._merge_results(results)
        
        return merged
    
    def _execute_step(self, step: WorkflowStep, input_data: Dict) -> Dict:
        """执行单个步骤"""
        # 模拟步骤执行
        return {"output": f"{step.name} 完成", "data": input_data}
    
    def _merge_results(self, results: Dict) -> Dict:
        """合并结果"""
        merged = {"parallel_results": results}
        return merged

class RoutingWorkflow:
    """路由工作流模式"""
    
    def __init__(self, name: str):
        self.name = name
        self.routes: Dict[str, WorkflowStep] = {}
        self.default_route: Optional[str] = None
    
    def add_route(self, route_name: str, step: WorkflowStep):
        """添加路由"""
        self.routes[route_name] = step
    
    def set_default_route(self, route_name: str):
        """设置默认路由"""
        self.default_route = route_name
    
    def execute(self, input_data: Dict, route: str = None) -> Dict:
        """执行工作流"""
        print(f"\n🔀 执行路由工作流: {self.name}")
        
        # 确定路由
        if route and route in self.routes:
            selected_route = route
        elif self.default_route:
            selected_route = self.default_route
        else:
            selected_route = list(self.routes.keys())[0]
        
        print(f"  选择路由: {selected_route}")
        
        # 执行路由
        step = self.routes[selected_route]
        result = self._execute_step(step, input_data)
        
        return {"route": selected_route, "result": result}
    
    def _execute_step(self, step: WorkflowStep, input_data: Dict) -> Dict:
        """执行单个步骤"""
        # 模拟步骤执行
        return {"output": f"{step.name} 完成", "data": input_data}

class OrchestrationWorkflow:
    """编排协调工作流模式"""
    
    def __init__(self, name: str):
        self.name = name
        self.steps: List[WorkflowStep] = []
        self.dependencies: Dict[str, List[str]] = {}
    
    def add_step(self, step: WorkflowStep):
        """添加步骤"""
        self.steps.append(step)
        self.dependencies[step.name] = step.dependencies
    
    def execute(self, input_data: Dict) -> Dict:
        """执行工作流"""
        print(f"\n🎭 执行编排协调工作流: {self.name}")
        
        # 拓扑排序
        execution_order = self._topological_sort()
        
        print(f"  执行顺序: {execution_order}")
        
        results = {}
        
        for step_name in execution_order:
            step = next(s for s in self.steps if s.name == step_name)
            
            # 检查依赖
            if not self._check_dependencies(step_name, results):
                print(f"  ⏸️ 等待依赖: {step_name}")
                continue
            
            # 执行步骤
            print(f"  执行: {step_name}")
            result = self._execute_step(step, input_data)
            results[step_name] = result
        
        return results
    
    def _topological_sort(self) -> List[str]:
        """拓扑排序"""
        # 简化的拓扑排序
        return [step.name for step in self.steps]
    
    def _check_dependencies(self, step_name: str, completed: Dict) -> bool:
        """检查依赖"""
        deps = self.dependencies.get(step_name, [])
        return all(dep in completed for dep in deps)
    
    def _execute_step(self, step: WorkflowStep, input_data: Dict) -> Dict:
        """执行单个步骤"""
        # 模拟步骤执行
        return {"output": f"{step.name} 完成", "data": input_data}

class EvaluationWorkflow:
    """评估优化工作流模式"""
    
    def __init__(self, name: str, max_iterations: int = 3):
        self.name = name
        self.max_iterations = max_iterations
        self.steps: List[WorkflowStep] = []
    
    def add_step(self, step: WorkflowStep):
        """添加步骤"""
        self.steps.append(step)
    
    def execute(self, input_data: Dict) -> Dict:
        """执行工作流"""
        print(f"\n📊 执行评估优化工作流: {self.name}")
        
        current_result = input_data
        
        for iteration in range(self.max_iterations):
            print(f"\n  迭代 {iteration + 1}:")
            
            # 执行步骤
            for step in self.steps:
                result = self._execute_step(step, current_result)
                current_result = result
            
            # 评估结果
            evaluation = self._evaluate_result(current_result)
            print(f"    评估分数: {evaluation['score']}")
            
            # 检查是否满足要求
            if evaluation['score'] > 0.8:
                print("    ✅ 满足要求，停止迭代")
                break
        
        return current_result
    
    def _execute_step(self, step: WorkflowStep, input_data: Dict) -> Dict:
        """执行单个步骤"""
        # 模拟步骤执行
        return {"output": f"{step.name} 完成", "data": input_data}
    
    def _evaluate_result(self, result: Dict) -> Dict:
        """评估结果"""
        # 简化的评估逻辑
        return {"score": 0.7, "feedback": "结果良好"}

# 使用示例
if __name__ == "__main__":
    # 创建步骤
    step1 = WorkflowStep(
        name="数据收集",
        agent="数据收集Agent",
        input_schema={},
        output_schema={}
    )
    
    step2 = WorkflowStep(
        name="数据处理",
        agent="数据处理Agent",
        input_schema={},
        output_schema={},
        dependencies=["数据收集"]
    )
    
    step3 = WorkflowStep(
        name="结果生成",
        agent="结果生成Agent",
        input_schema={},
        output_schema={},
        dependencies=["数据处理"]
    )
    
    # 1. 顺序工作流
    sequential = SequentialWorkflow("顺序处理")
    sequential.add_step(step1)
    sequential.add_step(step2)
    sequential.add_step(step3)
    
    result = sequential.execute({"input": "测试数据"})
    print(f"\n顺序工作流结果: {result}")
    
    # 2. 并行工作流
    parallel = ParallelWorkflow("并行处理")
    parallel.add_step(step1)
    parallel.add_step(step2)
    
    result = parallel.execute({"input": "测试数据"})
    print(f"\n并行工作流结果: {result}")
    
    # 3. 路由工作流
    routing = RoutingWorkflow("路由处理")
    routing.add_route("fast", step1)
    routing.add_route("slow", step2)
    routing.set_default_route("fast")
    
    result = routing.execute({"input": "测试数据"}, route="slow")
    print(f"\n路由工作流结果: {result}")
    
    # 4. 编排协调工作流
    orchestration = OrchestrationWorkflow("编排协调")
    orchestration.add_step(step1)
    orchestration.add_step(step2)
    orchestration.add_step(step3)
    
    result = orchestration.execute({"input": "测试数据"})
    print(f"\n编排协调工作流结果: {result}")
    
    # 5. 评估优化工作流
    evaluation = EvaluationWorkflow("评估优化")
    evaluation.add_step(step1)
    evaluation.add_step(step2)
    
    result = evaluation.execute({"input": "测试数据"})
    print(f"\n评估优化工作流结果: {result}")
```

```python
# 工作流模式对比

WORKFLOW_COMPARISON = """
五种 Agent 工作流模式对比
========================

1. 顺序工作流（Sequential）
   特点: 步骤按顺序执行，前一步的输出是后一步的输入
   优点:
   - 简单直观
   - 易于调试
   - 资源消耗低
   缺点:
   - 执行速度慢
   - 单点故障
   - 灵活性差
   适用场景:
   - 简单的线性任务
   - 需要严格顺序的流程
   - 资源受限的环境

2. 并行工作流（Parallel）
   特点: 多个步骤同时执行
   优点:
   - 执行速度快
   - 资源利用率高
   - 容错性好
   缺点:
   - 资源消耗大
   - 结果合并复杂
   - 可能产生竞争
   适用场景:
   - 独立的任务
   - 时间敏感的任务
   - 多数据源处理

3. 路由工作流（Routing）
   特点: 根据条件选择不同的执行路径
   优点:
   - 灵活性高
   - 可定制性强
   - 资源优化
   缺点:
   - 路由逻辑复杂
   - 可能出现死循环
   - 测试困难
   适用场景:
   - 多类型任务处理
   - 条件分支
   - 个性化服务

4. 编排协调工作流（Orchestration）
   特点: 由中央协调器管理任务执行顺序
   优点:
   - 灵活性最高
   - 支持复杂依赖
   - 易于扩展
   缺点:
   - 实现复杂
   - 协调开销大
   - 调试困难
   适用场景:
   - 复杂的多步骤任务
   - 有复杂依赖关系
   - 需要动态调整

5. 评估优化工作流（Evaluation）
   特点: 执行后评估结果，根据反馈优化
   优点:
   - 质量高
   - 持续改进
   - 适应性强
   缺点:
   - 执行时间长
   - 资源消耗大
   - 可能过度优化
   适用场景:
   - 质量要求高的任务
   - 需要迭代优化
   - 有明确的评估标准
"""

print(WORKFLOW_COMPARISON)

# 工作流选择指南
def select_workflow_pattern(task_requirements: Dict) -> str:
    """选择工作流模式"""
    
    # 简化的选择逻辑
    if task_requirements.get("sequential", False):
        return "sequential"
    elif task_requirements.get("parallel", False):
        return "parallel"
    elif task_requirements.get("conditional", False):
        return "routing"
    elif task_requirements.get("complex_dependencies", False):
        return "orchestration"
    elif task_requirements.get("quality_focused", False):
        return "evaluation"
    else:
        return "sequential"

# 使用示例
if __name__ == "__main__":
    # 测试选择逻辑
    test_cases = [
        {"sequential": True},
        {"parallel": True},
        {"conditional": True},
        {"complex_dependencies": True},
        {"quality_focused": True}
    ]
    
    for case in test_cases:
        pattern = select_workflow_pattern(case)
        print(f"需求: {case} → 选择: {pattern}")
```

```python
# 工作流组合模式

class CompositeWorkflow:
    """组合工作流"""
    
    def __init__(self, name: str):
        self.name = name
        self.workflows: List[Any] = []
    
    def add_workflow(self, workflow: Any):
        """添加子工作流"""
        self.workflows.append(workflow)
    
    def execute(self, input_data: Dict) -> Dict:
        """执行组合工作流"""
        print(f"\n🔄 执行组合工作流: {self.name}")
        
        current_data = input_data
        
        for i, workflow in enumerate(self.workflows):
            print(f"\n子工作流 {i+1}: {workflow.name}")
            
            # 执行子工作流
            result = workflow.execute(current_data)
            current_data = result
        
        return current_data

# 使用示例
if __name__ == "__main__":
    # 创建组合工作流
    composite = CompositeWorkflow("数据处理流水线")
    
    # 添加子工作流
    sequential = SequentialWorkflow("预处理")
    sequential.add_step(WorkflowStep("清洗", "Agent1", {}, {}))
    
    parallel = ParallelWorkflow("并行分析")
    parallel.add_step(WorkflowStep("分析A", "Agent2", {}, {}))
    parallel.add_step(WorkflowStep("分析B", "Agent3", {}, {}))
    
    composite.add_workflow(sequential)
    composite.add_workflow(parallel)
    
    # 执行
    result = composite.execute({"input": "原始数据"})
    print(f"\n组合工作流结果: {result}")
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 选择困难 | 使用决策树或规则系统 |
| 2 | 性能不佳 | 考虑并行化或缓存 |
| 3 | 调试困难 | 添加日志和监控 |
| 4 | 扩展性差 | 使用组合模式 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| 顺序工作流 | 步骤按顺序执行 |
| 并行工作流 | 步骤同时执行 |
| 路由工作流 | 根据条件选择路径 |
| 编排协调 | 中央协调器管理执行 |
| 评估优化 | 执行后评估并优化 |
| 组合工作流 | 多种模式组合使用 |

## ✅ 验收清单
- [ ] 理解五种工作流模式
- [ ] 能对比不同模式的优缺点
- [ ] 能根据任务选择合适的工作流
- [ ] 理解工作流组合的方法

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
