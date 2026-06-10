# 📅 Week 4 Day 3：Plan-and-Solve 范式

## 🧭 今日方向
> 今天我们将学习 Plan-and-Solve 范式，这是一种先规划后执行的 Agent 设计模式。

## 🎯 生活比喻
> Plan-and-Solve 就像项目经理：先制定详细计划（Plan），然后按计划执行（Solve），遇到问题再调整计划。

## 📋 今日三件事
1. 理解 Plan-and-Solve 的工作原理
2. 学习规划算法和执行策略
3. 通过代码实践 Plan-and-Solve 模式

## 🗺️ 手把手路线

### Step 1: 规划原理
- **做什么**: 理解如何将复杂任务分解为子任务
- **为什么**: 规划是解决复杂问题的关键
- **成功标志**: 能设计任务分解策略

### Step 2: 执行策略
- **做什么**: 学习如何按计划执行任务
- **为什么**: 好的执行策略确保计划落地
- **成功标志**: 能实现任务执行器

### Step 3: 实践应用
- **做什么**: 通过实际案例应用 Plan-and-Solve
- **为什么**: 实践是最好的学习方式
- **成功标志**: 能用 Plan-and-Solve 解决实际问题

## 💻 代码区

```python
# Plan-and-Solve 范式实现

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Callable
from enum import Enum
import json

class TaskStatus(str, Enum):
    """任务状态"""
    PENDING = "pending"      # 待处理
    IN_PROGRESS = "in_progress"  # 进行中
    COMPLETED = "completed"  # 已完成
    FAILED = "failed"        # 失败

@dataclass
class Task:
    """任务"""
    id: str
    description: str
    status: TaskStatus = TaskStatus.PENDING
    dependencies: List[str] = field(default_factory=list)
    result: Optional[str] = None
    subtasks: List['Task'] = field(default_factory=list)

@dataclass
class Plan:
    """计划"""
    goal: str
    tasks: List[Task]
    estimated_steps: int
    strategy: str

class Planner:
    """规划器"""
    
    def __init__(self):
        self.planning_strategies = {
            "decomposition": "任务分解",
            "sequential": "顺序执行",
            "parallel": "并行执行",
            "iterative": "迭代优化"
        }
    
    def create_plan(self, goal: str, context: Dict = None) -> Plan:
        """创建计划"""
        print(f"\n📋 创建计划: {goal}")
        
        # 分析目标
        analysis = self._analyze_goal(goal, context)
        
        # 分解任务
        tasks = self._decompose_tasks(goal, analysis)
        
        # 确定依赖关系
        self._determine_dependencies(tasks)
        
        # 选择策略
        strategy = self._select_strategy(tasks)
        
        plan = Plan(
            goal=goal,
            tasks=tasks,
            estimated_steps=len(tasks),
            strategy=strategy
        )
        
        print(f"  任务数量: {len(tasks)}")
        print(f"  执行策略: {strategy}")
        
        return plan
    
    def _analyze_goal(self, goal: str, context: Dict = None) -> Dict:
        """分析目标"""
        analysis = {
            "complexity": "medium",
            "required_tools": [],
            "estimated_time": "medium",
            "risk_level": "low"
        }
        
        # 简化的分析逻辑
        if len(goal) > 100:
            analysis["complexity"] = "high"
        elif len(goal) < 20:
            analysis["complexity"] = "low"
        
        return analysis
    
    def _decompose_tasks(self, goal: str, analysis: Dict) -> List[Task]:
        """分解任务"""
        tasks = []
        
        # 根据目标创建任务
        task_descriptions = [
            f"理解目标: {goal}",
            "收集必要信息",
            "制定详细方案",
            "执行方案",
            "验证结果"
        ]
        
        for i, desc in enumerate(task_descriptions):
            task = Task(
                id=f"task_{i+1}",
                description=desc,
                status=TaskStatus.PENDING
            )
            tasks.append(task)
        
        return tasks
    
    def _determine_dependencies(self, tasks: List[Task]):
        """确定依赖关系"""
        for i, task in enumerate(tasks):
            if i > 0:
                task.dependencies.append(tasks[i-1].id)
    
    def _select_strategy(self, tasks: List[Task]) -> str:
        """选择执行策略"""
        # 简化的策略选择
        if len(tasks) <= 3:
            return "sequential"
        elif len(tasks) <= 6:
            return "parallel"
        else:
            return "iterative"

class Executor:
    """执行器"""
    
    def __init__(self, tools: Dict[str, Callable] = None):
        self.tools = tools or {}
        self.execution_log = []
    
    def execute_plan(self, plan: Plan) -> Dict:
        """执行计划"""
        print(f"\n🚀 开始执行计划: {plan.goal}")
        
        results = {}
        
        for task in plan.tasks:
            print(f"\n执行任务: {task.description}")
            
            # 检查依赖
            if not self._check_dependencies(task, results):
                print(f"  ⏸️ 等待依赖任务完成")
                continue
            
            # 执行任务
            result = self._execute_task(task)
            results[task.id] = result
            
            # 更新任务状态
            task.status = TaskStatus.COMPLETED
            task.result = result
            
            # 记录日志
            self.execution_log.append({
                "task_id": task.id,
                "description": task.description,
                "result": result,
                "status": "completed"
            })
            
            print(f"  ✅ 完成: {result[:100]}...")
        
        return results
    
    def _check_dependencies(self, task: Task, completed_tasks: Dict) -> bool:
        """检查依赖是否满足"""
        for dep_id in task.dependencies:
            if dep_id not in completed_tasks:
                return False
        return True
    
    def _execute_task(self, task: Task) -> str:
        """执行单个任务"""
        # 模拟任务执行
        import time
        time.sleep(0.1)  # 模拟耗时
        
        # 根据任务类型执行
        if "理解" in task.description:
            return "目标已理解，关键要素已提取"
        elif "收集" in task.description:
            return "已收集必要信息，数据完整"
        elif "制定" in task.description:
            return "详细方案已制定，步骤清晰"
        elif "执行" in task.description:
            return "方案已执行，主要工作完成"
        elif "验证" in task.description:
            return "结果已验证，符合预期"
        else:
            return "任务完成"

class PlanAndSolveAgent:
    """Plan-and-Solve 智能体"""
    
    def __init__(self, name: str, tools: Dict[str, Callable] = None):
        self.name = name
        self.planner = Planner()
        self.executor = Executor(tools)
    
    def solve(self, goal: str, context: Dict = None) -> Dict:
        """解决问题"""
        print(f"\n{'='*60}")
        print(f"🤖 {self.name} 开始解决问题")
        print(f"目标: {goal}")
        print(f"{'='*60}")
        
        # 1. 创建计划
        plan = self.planner.create_plan(goal, context)
        
        # 2. 打印计划
        self._print_plan(plan)
        
        # 3. 执行计划
        results = self.executor.execute_plan(plan)
        
        # 4. 生成总结
        summary = self._generate_summary(plan, results)
        
        return {
            "goal": goal,
            "plan": plan,
            "results": results,
            "summary": summary
        }
    
    def _print_plan(self, plan: Plan):
        """打印计划"""
        print(f"\n📝 执行计划:")
        print(f"  目标: {plan.goal}")
        print(f"  策略: {plan.strategy}")
        print(f"  任务数: {len(plan.tasks)}")
        
        for task in plan.tasks:
            deps = ", ".join(task.dependencies) if task.dependencies else "无"
            print(f"  - [{task.id}] {task.description}")
            print(f"    依赖: {deps}")
    
    def _generate_summary(self, plan: Plan, results: Dict) -> str:
        """生成总结"""
        completed = sum(1 for task in plan.tasks if task.status == TaskStatus.COMPLETED)
        total = len(plan.tasks)
        
        summary = f"""
执行总结:
- 目标: {plan.goal}
- 完成任务: {completed}/{total}
- 执行策略: {plan.strategy}
- 总体状态: {'成功' if completed == total else '部分完成'}
"""
        return summary

# 使用示例
if __name__ == "__main__":
    # 创建 Agent
    agent = PlanAndSolveAgent(
        name="任务规划助手",
        tools={
            "search": lambda query: f"搜索结果: {query}",
            "calculate": lambda expr: f"计算结果: {eval(expr)}"
        }
    )
    
    # 解决问题
    result = agent.solve("帮我制定一个学习 Python 的计划")
    
    # 打印结果
    print(result["summary"])
```

```python
# Plan-and-Solve 提示模板

PLAN_AND_SOLVE_PROMPT = """
你是一个能够规划和解决问题的AI助手。

请使用以下步骤解决问题：

Step 1: 理解问题
- 分析问题的关键要素
- 确定目标和约束条件

Step 2: 制定计划
- 将问题分解为子任务
- 确定任务的执行顺序
- 识别可能的障碍

Step 3: 执行计划
- 按顺序执行每个子任务
- 记录执行结果
- 处理遇到的问题

Step 4: 验证结果
- 检查是否达成目标
- 总结经验和教训

现在请解决问题：
{problem}
"""

# 任务分解策略
DECOMPOSITION_STRATEGIES = """
任务分解策略
===========

1. 顺序分解
   适用: 任务有明确的先后顺序
   示例: 学习编程 → 基础语法 → 项目实践

2. 并行分解
   适用: 任务可以同时进行
   示例: 数据收集 + 数据清洗

3. 递归分解
   适用: 任务可以不断细分
   示例: 开发软件 → 模块 → 组件 → 函数

4. 目标驱动分解
   适用: 有明确目标的任务
   示例: 提升销售额 → 营销 + 销售 + 服务

5. 问题驱动分解
   适用: 解决具体问题
   示例: 系统故障 → 诊断 → 修复 → 验证
"""

print(DECOMPOSITION_STRATEGIES)
```

```python
# Plan-and-Solve 实战：项目规划

class ProjectPlanner:
    """项目规划器"""
    
    def __init__(self):
        self.project = {}
    
    def plan_project(self, project_name: str, requirements: List[str]) -> Dict:
        """规划项目"""
        print(f"\n项目规划: {project_name}")
        print("=" * 50)
        
        # 分析需求
        analysis = self._analyze_requirements(requirements)
        
        # 制定计划
        plan = self._create_project_plan(project_name, analysis)
        
        # 分配资源
        resources = self._allocate_resources(plan)
        
        # 估算时间
        timeline = self._estimate_timeline(plan)
        
        self.project = {
            "name": project_name,
            "requirements": requirements,
            "analysis": analysis,
            "plan": plan,
            "resources": resources,
            "timeline": timeline
        }
        
        return self.project
    
    def _analyze_requirements(self, requirements: List[str]) -> Dict:
        """分析需求"""
        return {
            "total_requirements": len(requirements),
            "complexity": "medium",
            "priority": "high",
            "dependencies": []
        }
    
    def _create_project_plan(self, name: str, analysis: Dict) -> List[Dict]:
        """创建项目计划"""
        phases = [
            {"phase": "需求分析", "tasks": ["收集需求", "分析需求", "确认需求"]},
            {"phase": "设计", "tasks": ["架构设计", "详细设计", "设计评审"]},
            {"phase": "开发", "tasks": ["编码", "单元测试", "代码审查"]},
            {"phase": "测试", "tasks": ["集成测试", "系统测试", "用户验收"]},
            {"phase": "部署", "tasks": ["部署准备", "生产部署", "监控"]},
        ]
        return phases
    
    def _allocate_resources(self, plan: List[Dict]) -> Dict:
        """分配资源"""
        return {
            "developers": 3,
            "testers": 1,
            "designers": 1,
            "budget": 100000
        }
    
    def _estimate_timeline(self, plan: List[Dict]) -> List[Dict]:
        """估算时间"""
        timeline = []
        current_week = 1
        
        for phase in plan:
            duration = len(phase["tasks"]) * 2  # 每个任务2周
            timeline.append({
                "phase": phase["phase"],
                "start_week": current_week,
                "end_week": current_week + duration - 1,
                "duration_weeks": duration
            })
            current_week += duration
        
        return timeline

# 使用示例
if __name__ == "__main__":
    planner = ProjectPlanner()
    
    project = planner.plan_project(
        "Agent Factory 项目",
        ["构建智能对话系统", "支持多轮对话", "集成外部工具"]
    )
    
    print("\n项目计划:")
    for phase in project["plan"]:
        print(f"\n{phase['phase']}:")
        for task in phase["tasks"]:
            print(f"  - {task}")
    
    print("\n时间线:")
    for item in project["timeline"]:
        print(f"  {item['phase']}: 第{item['start_week']}-{item['end_week']}周")
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 任务分解不合理 | 使用不同的分解策略 |
| 2 | 依赖关系混乱 | 重新分析任务依赖 |
| 3 | 执行效率低 | 考虑并行执行 |
| 4 | 计划过于复杂 | 简化任务，分阶段执行 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Plan-and-Solve | 先规划后执行的 Agent 范式 |
| 任务分解 | 将复杂任务拆分为子任务 |
| 依赖关系 | 任务之间的先后关系 |
| 执行策略 | 任务的执行方式 |
| 资源分配 | 分配人力、时间、预算 |
| 时间线 | 任务的时间安排 |

## ✅ 验收清单
- [ ] 理解 Plan-and-Solve 的工作原理
- [ ] 能设计任务分解策略
- [ ] 能实现任务执行器
- [ ] 能用 Plan-and-Solve 解决实际问题

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
