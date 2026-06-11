# 📅 Week 4 Day 3：Plan-and-Solve 范式——先规划后执行

## 🧭 今日方向
> 学习 Plan-and-Solve（先规划后执行）范式——将复杂目标分解为有依赖关系的子任务，然后按序或并行执行。掌握 Planner（规划器）和 Executor（执行器）的设计，以及任务失败时的重新规划。

## 🎯 生活比喻
> Plan-and-Solve 就像搬家：你不会直接开始搬东西，而是先列清单（规划）——"先打包厨房，再打包卧室，然后叫搬家公司，最后验收"。每个步骤有先后顺序（依赖），如果打包时发现箱子不够，就要调整计划（重规划）。

## 📋 今日三件事
1. 理解任务分解、依赖关系、执行顺序的概念
2. 实现一个完整的 Plan-and-Solve Agent（Planner + Executor + 重规划）
3. 运行"策划公司活动"的完整示例，观察 5+ 子任务的执行过程

---

## 🗺️ 手把手路线

### Step 1: 设计任务模型
- **做什么**: 定义 Task（任务）和 Plan（计划）的数据结构
- **为什么**: 清晰的数据模型是实现的基础
- **成功标志**: 能定义包含状态、依赖关系的 Task 类

### Step 2: 实现规划器
- **做什么**: 实现 Planner 类，能将目标分解为任务列表并确定依赖
- **为什么**: 规划是 Plan-and-Solve 的核心
- **成功标志**: 能将一个复杂目标分解为 5+ 个子任务

### Step 3: 实现执行器和重规划
- **做什么**: 实现 Executor 类，按依赖顺序执行任务，失败时重新规划
- **为什么**: 真实场景中任务可能失败，需要动态调整
- **成功标志**: 能处理任务失败并重新规划

---

## 💻 代码区

### 代码 1: 任务模型和状态管理

```python
"""
Plan-and-Solve 范式：任务模型和状态管理
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Callable
from enum import Enum
import time

class TaskStatus(str, Enum):
    """任务状态"""
    PENDING = "pending"        # 待执行
    IN_PROGRESS = "in_progress"  # 执行中
    COMPLETED = "completed"    # 已完成
    FAILED = "failed"          # 失败
    SKIPPED = "skipped"        # 跳过

@dataclass
class Task:
    """任务数据模型"""
    id: str                          # 任务唯一ID
    name: str                        # 任务名称
    description: str                 # 任务描述
    status: TaskStatus = TaskStatus.PENDING
    dependencies: List[str] = field(default_factory=list)  # 依赖的任务ID列表
    result: Optional[str] = None     # 执行结果
    priority: int = 0                # 优先级（越高越先执行）
    max_retries: int = 2             # 最大重试次数
    retry_count: int = 0             # 当前重试次数

    def can_execute(self, completed_tasks: Dict[str, TaskStatus]) -> bool:
        """检查是否可以执行（所有依赖已完成）"""
        for dep_id in self.dependencies:
            if completed_tasks.get(dep_id) != TaskStatus.COMPLETED:
                return False
        return True

    def __str__(self):
        deps = ", ".join(self.dependencies) if self.dependencies else "无"
        return f"[{self.id}] {self.name} (状态:{self.status.value}, 依赖:{deps})"


@dataclass
class Plan:
    """计划数据模型"""
    goal: str                           # 最终目标
    tasks: List[Task]                   # 任务列表
    strategy: str = "sequential"        # 执行策略
    estimated_steps: int = 0            # 预估步骤数
    created_at: float = 0.0            # 创建时间

    def get_task_by_id(self, task_id: str) -> Optional[Task]:
        """根据ID获取任务"""
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None

    def get_status_summary(self) -> Dict[str, int]:
        """获取状态汇总"""
        summary = {}
        for status in TaskStatus:
            count = sum(1 for t in self.tasks if t.status == status)
            if count > 0:
                summary[status.value] = count
        return summary
```

### 代码 2: Planner 规划器

```python
"""
Plan-and-Solve 范式：Planner 规划器
负责将目标分解为任务列表并确定依赖关系
"""

class Planner:
    """
    规划器：将复杂目标分解为子任务

    核心能力：
    1. 分析目标复杂度
    2. 分解为子任务
    3. 确定任务依赖关系
    4. 选择执行策略
    """

    def __init__(self):
        # 任务模板：不同目标类型的分解模板
        self.decomposition_templates = {
            "event": [
                ("确定预算", "明确活动预算范围和资金来源"),
                ("选择日期", "确定活动日期，检查场地可用性"),
                ("预订场地", "联系场地方，签订合同"),
                ("邀请嘉宾", "准备嘉宾名单，发送邀请函"),
                ("安排餐饮", "联系餐饮供应商，确定菜单"),
                ("布置现场", "设计现场布局，准备物料"),
                ("活动执行", "按计划执行活动"),
            ],
            "project": [
                ("需求分析", "收集和分析需求"),
                ("方案设计", "设计技术方案和架构"),
                ("开发实现", "编写代码实现功能"),
                ("测试验证", "编写测试用例并执行"),
                ("部署上线", "部署到生产环境"),
            ],
            "learning": [
                ("调研资源", "查找学习资料和教程"),
                ("制定计划", "安排学习时间和进度"),
                ("基础学习", "学习核心概念和基础"),
                ("实践练习", "通过项目实践巩固"),
                ("总结复习", "回顾和总结学习内容"),
            ],
        }

    def create_plan(self, goal: str, goal_type: str = "event") -> Plan:
        """
        创建计划

        参数:
            goal: 目标描述
            goal_type: 目标类型 (event/project/learning)
        返回:
            Plan 对象
        """
        print(f"\n📋 规划器开始工作")
        print(f"  🎯 目标: {goal}")
        print(f"  📁 类型: {goal_type}")

        # 1. 获取分解模板
        template = self.decomposition_templates.get(goal_type, [])

        # 2. 分解为任务
        tasks = self._decompose(goal, template)

        # 3. 确定依赖关系
        self._set_dependencies(tasks)

        # 4. 选择策略
        strategy = self._select_strategy(tasks)

        plan = Plan(
            goal=goal,
            tasks=tasks,
            strategy=strategy,
            estimated_steps=len(tasks),
            created_at=time.time(),
        )

        print(f"  📊 生成 {len(tasks)} 个子任务")
        print(f"  🔧 执行策略: {strategy}")

        return plan

    def _decompose(self, goal: str, template: list) -> List[Task]:
        """将目标分解为子任务"""
        tasks = []
        for i, (name, desc) in enumerate(template):
            task = Task(
                id=f"task_{i+1}",
                name=name,
                description=f"针对'{goal}': {desc}",
            )
            tasks.append(task)
        return tasks

    def _set_dependencies(self, tasks: List[Task]):
        """设置任务间的依赖关系（线性依赖）"""
        for i in range(1, len(tasks)):
            tasks[i].dependencies.append(tasks[i-1].id)

    def _select_strategy(self, tasks: List[Task]) -> str:
        """根据任务数量选择执行策略"""
        if len(tasks) <= 3:
            return "sequential"
        elif len(tasks) <= 6:
            return "sequential_with_checkpoints"
        else:
            return "iterative"

    def replan(self, original_plan: Plan, failed_task: Task) -> Plan:
        """
        重新规划：当任务失败时调整计划

        策略：
        1. 标记失败任务为跳过
        2. 移除依赖失败任务的后续依赖
        3. 如果是关键任务，尝试替代方案
        """
        print(f"\n🔄 重新规划中...")
        print(f"  ❌ 失败任务: {failed_task.name}")

        # 重新创建任务列表
        new_tasks = []
        for task in original_plan.tasks:
            if task.id == failed_task.id:
                task.status = TaskStatus.SKIPPED
                print(f"  ⏭️ 跳过: {task.name}")
            else:
                # 移除对失败任务的依赖
                if failed_task.id in task.dependencies:
                    task.dependencies.remove(failed_task.id)
                    print(f"  🔗 移除依赖: {task.name} 不再依赖 {failed_task.name}")
            new_tasks.append(task)

        new_plan = Plan(
            goal=original_plan.goal,
            tasks=new_tasks,
            strategy=original_plan.strategy,
            estimated_steps=len(new_tasks),
            created_at=time.time(),
        )

        print(f"  📊 新计划包含 {len(new_tasks)} 个任务")
        return new_plan
```

### 代码 3: Executor 执行器

```python
"""
Plan-and-Solve 范式：Executor 执行器
负责按依赖顺序执行任务，处理失败和重试
"""

class Executor:
    """
    执行器：按计划执行任务

    核心能力：
    1. 按依赖顺序执行任务
    2. 处理任务失败和重试
    3. 记录执行日志
    4. 返回执行结果
    """

    def __init__(self, action_registry: Optional[Dict[str, Callable]] = None):
        """
        参数:
            action_registry: 动作注册表，映射任务名到执行函数
        """
        self.action_registry = action_registry or {}
        self.execution_log: List[Dict] = []

    def register_action(self, task_name: str, action_func: Callable):
        """注册任务执行函数"""
        self.action_registry[task_name] = action_func

    def execute_plan(self, plan: Plan) -> Dict:
        """
        执行整个计划

        返回:
            包含所有任务结果的字典
        """
        print(f"\n🚀 开始执行计划")
        print(f"  🎯 目标: {plan.goal}")
        print(f"  📋 任务数: {len(plan.tasks)}")
        print(f"  🔧 策略: {plan.strategy}")

        results = {}

        for task in plan.tasks:
            # 跳过已跳过的任务
            if task.status == TaskStatus.SKIPPED:
                print(f"\n  ⏭️ 跳过: {task.name}")
                continue

            # 检查依赖是否满足
            completed_statuses = {t.id: t.status for t in plan.tasks}
            if not task.can_execute(completed_statuses):
                print(f"\n  ⏳ 等待依赖: {task.name}")
                continue

            # 执行任务
            result = self._execute_task(task)
            results[task.id] = result

        return results

    def _execute_task(self, task: Task) -> str:
        """执行单个任务"""
        print(f"\n  {'─' * 40}")
        print(f"  📌 执行任务: {task.name}")
        print(f"  📝 描述: {task.description}")
        print(f"  🔗 依赖: {task.dependencies or '无'}")

        task.status = TaskStatus.IN_PROGRESS

        try:
            # 查找并执行对应的action
            if task.name in self.action_registry:
                result = self.action_registry[task.name](task)
            else:
                # 默认执行逻辑
                result = self._default_execute(task)

            task.status = TaskStatus.COMPLETED
            task.result = result

            print(f"  ✅ 完成: {result}")

            # 记录日志
            self.execution_log.append({
                "task_id": task.id,
                "task_name": task.name,
                "status": "completed",
                "result": result,
            })

            return result

        except Exception as e:
            task.retry_count += 1
            if task.retry_count <= task.max_retries:
                print(f"  ⚠️ 失败 (重试 {task.retry_count}/{task.max_retries}): {e}")
                task.status = TaskStatus.PENDING  # 重置为待执行
                return f"重试中: {e}"
            else:
                task.status = TaskStatus.FAILED
                print(f"  ❌ 最终失败: {e}")
                self.execution_log.append({
                    "task_id": task.id,
                    "task_name": task.name,
                    "status": "failed",
                    "result": str(e),
                })
                return f"失败: {e}"

    def _default_execute(self, task: Task) -> str:
        """默认执行逻辑"""
        # 模拟执行
        time.sleep(0.05)
        return f"{task.name} 已完成"

    def get_log(self) -> List[Dict]:
        """获取执行日志"""
        return self.execution_log
```

### 代码 4: PlanAndSolveAgent 完整示例——策划公司活动

```python
"""
Plan-and-Solve 完整示例：策划公司年终活动
包含：规划 -> 执行 -> 失败处理 -> 重规划
"""

class PlanAndSolveAgent:
    """
    Plan-and-Solve Agent：先规划后执行

    完整流程：
    1. 接收目标
    2. 规划器分解任务
    3. 执行器按序执行
    4. 失败时重新规划
    5. 输出最终结果
    """

    def __init__(self, name: str):
        self.name = name
        self.planner = Planner()
        self.executor = Executor()

    def solve(self, goal: str, goal_type: str = "event") -> Dict:
        """
        解决问题的主入口

        参数:
            goal: 目标描述
            goal_type: 目标类型
        返回:
            执行结果字典
        """
        print(f"\n{'=' * 60}")
        print(f"🤖 [{self.name}] Plan-and-Solve Agent 启动")
        print(f"🎯 目标: {goal}")
        print(f"{'=' * 60}")

        # 1. 创建计划
        plan = self.planner.create_plan(goal, goal_type)

        # 2. 打印计划
        self._print_plan(plan)

        # 3. 执行计划
        results = self.executor.execute_plan(plan)

        # 4. 检查失败任务，重新规划
        failed_tasks = [t for t in plan.tasks if t.status == TaskStatus.FAILED]
        if failed_tasks:
            print(f"\n⚠️ 有 {len(failed_tasks)} 个任务失败，尝试重新规划...")
            for failed in failed_tasks:
                plan = self.planner.replan(plan, failed)
            # 重新执行
            results.update(self.executor.execute_plan(plan))

        # 5. 生成总结
        summary = self._generate_summary(plan)

        return {
            "goal": goal,
            "plan": plan,
            "results": results,
            "summary": summary,
        }

    def _print_plan(self, plan: Plan):
        """打印计划详情"""
        print(f"\n📝 执行计划:")
        print(f"  目标: {plan.goal}")
        print(f"  策略: {plan.strategy}")
        print(f"  任务列表:")
        for task in plan.tasks:
            status_icon = {
                TaskStatus.PENDING: "⏳",
                TaskStatus.COMPLETED: "✅",
                TaskStatus.FAILED: "❌",
                TaskStatus.SKIPPED: "⏭️",
            }.get(task.status, "❓")
            deps = f" <- {task.dependencies}" if task.dependencies else ""
            print(f"    {status_icon} [{task.id}] {task.name}{deps}")

    def _generate_summary(self, plan: Plan) -> str:
        """生成执行总结"""
        summary = plan.get_status_summary()
        completed = summary.get("completed", 0)
        total = len(plan.tasks)

        lines = [
            f"\n{'=' * 60}",
            f"📊 执行总结",
            f"{'=' * 60}",
            f"  目标: {plan.goal}",
            f"  完成: {completed}/{total} 任务",
            f"  成功率: {completed/total*100:.0f}%" if total > 0 else "  成功率: N/A",
            f"  最终状态: {'全部成功' if completed == total else '部分完成'}",
            f"{'=' * 60}",
        ]
        return "\n".join(lines)


# ====== 运行完整示例 ======
if __name__ == "__main__":
    # 1. 创建 Agent
    agent = PlanAndSolveAgent(name="活动策划助手")

    # 2. 注册自定义动作
    agent.executor.register_action("确定预算", lambda t: "预算确定为50000元")
    agent.executor.register_action("选择日期", lambda t: "日期定在12月28日")
    agent.executor.register_action("预订场地", lambda t: "场地预订成功：国际会议中心A厅")
    agent.executor.register_action("邀请嘉宾", lambda t: "已邀请20位嘉宾，确认出席15人")
    agent.executor.register_action("安排餐饮", lambda t: "餐饮安排：自助餐，人均200元")

    def布置现场_func(task):
        """模拟布置现场失败"""
        if task.retry_count == 0:
            raise Exception("物料供应商临时涨价，需要更换供应商")
        return "现场布置完成（使用备选供应商）"

    agent.executor.register_action("布置现场", 布置现场_func)
    agent.executor.register_action("活动执行", lambda t: "活动顺利举办，参与度95%")

    # 3. 执行
    result = agent.solve("策划公司年终总结活动", goal_type="event")

    # 4. 输出总结
    print(result["summary"])

    # 5. 打印执行日志
    print("\n📋 执行日志:")
    for log in agent.executor.get_log():
        print(f"  {log['task_name']}: {log['status']} -> {log['result']}")
```

**预期输出：**
```
============================================================
🤖 [活动策划助手] Plan-and-Solve Agent 启动
🎯 目标: 策划公司年终总结活动
============================================================

📋 规划器开始工作
  🎯 目标: 策划公司年终总结活动
  📁 类型: event
  📊 生成 7 个子任务
  🔧 执行策略: sequential_with_checkpoints

📝 执行计划:
  目标: 策划公司年终总结活动
  策略: sequential_with_checkpoints
  任务列表:
    ⏳ [task_1] 确定预算
    ⏳ [task_2] 选择日期 <- ['task_1']
    ...

🚀 开始执行计划
  📌 执行任务: 确定预算
  ✅ 完成: 预算确定为50000元

  📌 执行任务: 选择日期
  ✅ 完成: 日期定在12月28日

  ...

  📌 执行任务: 布置现场
  ⚠️ 失败 (重试 1/2): 物料供应商临时涨价，需要更换供应商
  ✅ 完成: 现场布置完成（使用备选供应商）

============================================================
📊 执行总结
============================================================
  目标: 策划公司年终总结活动
  完成: 7/7 任务
  成功率: 100%
  最终状态: 全部成功
============================================================
```

---

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 任务永远 PENDING | 检查依赖是否形成了循环（A依赖B，B依赖A） |
| 2 | 所有任务同时执行 | 确认 `_set_dependencies` 正确设置了线性依赖 |
| 3 | 重规划后任务顺序错乱 | 重新规划只移除失败依赖，不改变原有的顺序逻辑 |
| 4 | 默认执行无意义输出 | 用 `register_action` 为每个任务注册具体的执行函数 |
| 5 | 不知道如何自定义任务模板 | 在 `decomposition_templates` 中添加新的目标类型 |
| 6 | 任务失败后没有重试 | 检查 `max_retries` 设置，确保大于 0 |

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Plan-and-Solve | 先规划后执行的 Agent 范式 |
| Planner（规划器） | 将目标分解为子任务并确定依赖关系的组件 |
| Executor（执行器） | 按计划执行任务并处理结果的组件 |
| 任务分解 | 将复杂目标拆分为可管理的子任务 |
| 依赖关系 | 任务之间的先后约束（B依赖A表示A必须先完成） |
| 重规划（Re-planning） | 任务失败时动态调整计划 |
| TaskStatus | 任务状态：pending/in_progress/completed/failed/skipped |
| 执行策略 | 任务的执行方式（顺序/带检查点/迭代） |

---

## ✅ 验收清单

- [ ] 能解释 Plan-and-Solve 的完整工作流程
- [ ] 能设计 Task 数据结构并设置依赖关系
- [ ] 能运行"策划公司活动"示例，观察 7 个子任务的执行
- [ ] 能解释重规划的工作机制
- [ ] 能为新场景（如"学习Python"）创建自定义任务模板
- [ ] 能在执行日志中追踪每个任务的状态变化
- [ ] 能对比 Plan-and-Solve 与 ReAct 的区别和各自适用场景

---

## 📝 复盘小纸条
- 今天最大的收获: ________________________________
- 还不太确定的: ________________________________
- Plan-and-Solve 最适合的场景是: ________________________________
- 明天需要用到的基础: ________________________________

---

## 📥 明日同步接口
- 今日完成度: ____%
- 卡点描述: ________________________________
- 代码是否能跑通: ✅ 全部通过 / ⚠️ 部分通过 / ❌ 未通过
- 明天希望: 学习 Reflection 范式如何让 Agent 自我评估和改进
