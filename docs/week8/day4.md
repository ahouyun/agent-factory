# 📅 Week 8 Day 4：Handoff 模式：结构化任务委派

## 🧭 今日方向
> Handoff 是多 Agent 系统中的"接力棒"——将任务从一个 Agent 传递给另一个 Agent。今天学习结构化 Handoff 的设计模式，确保任务交接不丢失信息。

## 🎯 生乐比喻
> Handoff 就像医院的"病人交接班"。早班护士把病人的所有信息（病历、用药、注意事项）完整地交给晚班护士，确保治疗不中断。好的 Handoff = 完整信息 + 明确责任 + 跟踪状态。

## 📋 今日三件事
1. 理解 Handoff 的核心要素：上下文、状态、责任
2. 实现结构化的 Handoff 协议
3. 构建带跟踪的 Agent 委派系统

## 🗺️ 手把手路线

### Step 1: Handoff 设计
- 做什么: 设计 Handoff 的数据结构
- 为什么: 结构化的交接比随意传递更可靠
- 成功标志: 能定义完整的 Handoff 数据模型

### Step 2: 实现 Handoff 协议
- 做什么: 用 LangGraph 实现 Agent 间任务交接
- 为什么: 这是多 Agent 协作的核心机制
- 成功标志: 任务能正确地从一个 Agent 传递给另一个

### Step 3: 跟踪和监控
- 做什么: 记录 Handoff 历史，支持任务追踪
- 为什么: 生产环境需要可追溯性
- 成功标志: 能查看完整的任务交接记录

## 💻 代码区

```python
"""
Week 8 Day 4: Handoff 模式：结构化任务委派
安装依赖: pip install langgraph langchain langchain-openai
"""

from typing import TypedDict, List, Optional, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from dataclasses import dataclass, field
from datetime import datetime
import json
import uuid

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# ========== 1. Handoff 数据结构 ==========
print("=== 1. Handoff 数据结构 ===")

@dataclass
class HandoffPackage:
    """Handoff 数据包"""
    task_id: str
    task_description: str
    context: Dict[str, Any]           # 任务上下文
    state: Dict[str, Any]             # 当前状态
    history: List[Dict]               # 执行历史
    required_output: str              # 期望输出格式
    priority: str = "normal"          # 优先级
    deadline: Optional[str] = None    # 截止时间
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self):
        return {
            "task_id": self.task_id,
            "task_description": self.task_description,
            "context": self.context,
            "state": self.state,
            "history": self.history,
            "required_output": self.required_output,
            "priority": self.priority,
            "deadline": self.deadline,
            "created_at": self.created_at
        }

    def add_history(self, agent: str, action: str, result: str):
        """添加历史记录"""
        self.history.append({
            "agent": agent,
            "action": action,
            "result": result,
            "timestamp": datetime.now().isoformat()
        })

    def update_state(self, key: str, value: Any):
        """更新状态"""
        self.state[key] = value

# 创建 Handoff 数据包
package = HandoffPackage(
    task_id=str(uuid.uuid4())[:8],
    task_description="分析用户反馈并生成改进建议",
    context={"user_count": 1000, "feedback_source": "app_store"},
    state={"status": "pending", "progress": 0},
    history=[],
    required_output="JSON 格式的改进建议列表"
)

print(f"Handoff 数据包:")
print(json.dumps(package.to_dict(), indent=2, ensure_ascii=False))

# ========== 2. 结构化 Agent ==========
print("\n=== 2. 结构化 Agent ===")

class StructuredAgent:
    """支持 Handoff 的 Agent"""

    def __init__(self, name: str, role: str, capabilities: List[str]):
        self.name = name
        self.role = role
        self.capabilities = capabilities
        self.handoff_log = []

    def receive_handoff(self, package: HandoffPackage) -> HandoffPackage:
        """接收 Handoff"""
        print(f"  [{self.name}] 接收任务: {package.task_id}")
        package.add_history(self.name, "receive", "任务已接收")
        self.handoff_log.append({
            "action": "receive",
            "task_id": package.task_id,
            "timestamp": datetime.now().isoformat()
        })
        return package

    def execute(self, package: HandoffPackage) -> HandoffPackage:
        """执行任务"""
        print(f"  [{self.name}] 执行任务: {package.task_description[:30]}...")

        # 模拟执行
        prompt = f"""作为{self.role}，请执行以下任务：

任务：{package.task_description}
上下文：{json.dumps(package.context, ensure_ascii=False)}
当前状态：{json.dumps(package.state, ensure_ascii=False)}

请完成任务并更新状态。"""

        response = llm.invoke([HumanMessage(content=prompt)])

        # 更新状态
        package.update_state("status", "completed")
        package.update_state("progress", 100)
        package.update_state(f"{self.name}_output", response.content)
        package.add_history(self.name, "execute", "任务执行完成")

        return package

    def create_handoff(self, package: HandoffPackage, target_agent: str) -> HandoffPackage:
        """创建 Handoff"""
        package.update_state("status", "handoff_pending")
        package.update_state("target_agent", target_agent)
        package.add_history(self.name, "handoff", f"交接给 {target_agent}")

        print(f"  [{self.name}] 创建 Handoff → {target_agent}")
        return package

# ========== 3. Handoff 工作流 ==========
print("\n=== 3. Handoff 工作流 ===")

class HandoffWorkflow:
    """Handoff 工作流管理器"""

    def __init__(self):
        self.agents = {}
        self.handoff_history = []

    def register_agent(self, agent: StructuredAgent):
        """注册 Agent"""
        self.agents[agent.name] = agent

    def execute_with_handoff(self, initial_package: HandoffPackage) -> HandoffPackage:
        """执行带 Handoff 的工作流"""
        package = initial_package

        # 工作流：agent1 → agent2 → agent3
        workflow = ["data_analyst", "report_writer", "reviewer"]

        for i, agent_name in enumerate(workflow):
            if agent_name not in self.agents:
                print(f"  [错误] Agent {agent_name} 不存在")
                continue

            agent = self.agents[agent_name]

            # 接收
            package = agent.receive_handoff(package)

            # 执行
            package = agent.execute(package)

            # 创建 Handoff（如果不是最后一个）
            if i < len(workflow) - 1:
                next_agent = workflow[i + 1]
                package = agent.create_handoff(package, next_agent)

            # 记录
            self.handoff_history.append({
                "task_id": package.task_id,
                "agent": agent_name,
                "timestamp": datetime.now().isoformat(),
                "state": package.state.copy()
            })

        return package

# 创建工作流
workflow_manager = HandoffWorkflow()

# 注册 Agent
workflow_manager.register_agent(StructuredAgent("data_analyst", "数据分析师", ["数据分析", "统计"]))
workflow_manager.register_agent(StructuredAgent("report_writer", "报告撰写人", ["写作", "总结"]))
workflow_manager.register_agent(StructuredAgent("reviewer", "审查员", ["审查", "质量控制"]))

# 执行工作流
print("--- 执行 Handoff 工作流 ---")
initial_package = HandoffPackage(
    task_id="task_001",
    task_description="分析 Q4 用户反馈并生成改进报告",
    context={"period": "Q4", "feedback_count": 500},
    state={"status": "new", "progress": 0},
    history=[],
    required_output="改进建议报告"
)

final_package = workflow_manager.execute_with_handoff(initial_package)

print(f"\n最终状态: {final_package.state}")
print(f"执行历史: {len(final_package.history)} 步")

# ========== 4. 带条件的 Handoff ==========
print("\n=== 4. 带条件的 Handoff ===")

class ConditionalHandoff:
    """带条件的 Handoff"""

    def __init__(self):
        self.conditions = {}

    def add_condition(self, condition_name: str, check_fn):
        """添加条件"""
        self.conditions[condition_name] = check_fn

    def should_handoff(self, package: HandoffPackage, target: str) -> bool:
        """检查是否应该 Handoff"""
        # 检查各种条件
        if package.state.get("status") == "failed":
            return False
        if package.state.get("priority") == "urgent":
            # 紧急任务直接完成，不交接
            return False
        return True

class SmartHandoffAgent:
    """智能 Handoff Agent"""

    def __init__(self, name: str, expertise: str):
        self.name = name
        self.expertise = expertise
        self.conditional_handoff = ConditionalHandoff()

    def process(self, package: HandoffPackage) -> HandoffPackage:
        """处理任务"""
        print(f"  [{self.name}] 处理任务...")

        # 分析任务复杂度
        prompt = f"""分析以下任务的复杂度，决定是否需要交接给其他专家。

任务：{package.task_description}
你的专长：{self.expertise}

如果任务超出你的能力范围，说明需要什么专家。
如果可以自己完成，直接执行。

返回 JSON：{{"can_handle": true/false, "reason": "原因"}}"""

        response = llm.invoke([HumanMessage(content=prompt)])

        try:
            import json
            decision = json.loads(response.content)
        except:
            decision = {"can_handle": True, "reason": "默认处理"}

        if decision.get("can_handle", False):
            # 自己处理
            package.update_state("handled_by", self.name)
            package.add_history(self.name, "process", "任务已处理")
            return package
        else:
            # 需要交接
            package.update_state("needs_handoff", True)
            package.update_state("handoff_reason", decision.get("reason", ""))
            package.add_history(self.name, "decision", f"需要交接: {decision.get('reason', '')}")
            return package

# 测试智能 Handoff
smart_agent = SmartHandoffAgent("generalist", "通用技能")
package = HandoffPackage(
    task_id="smart_001",
    task_description="编写一个深度学习模型的训练代码",
    context={},
    state={},
    history=[],
    required_output="Python 代码"
)

result = smart_agent.process(package)
print(f"处理结果: {result.state}")

# ========== 5. Handoff 跟踪系统 ==========
print("\n=== 5. Handoff 跟踪系统 ===")

class HandoffTracker:
    """Handoff 跟踪系统"""

    def __init__(self):
        self.tasks = {}

    def start_task(self, task_id: str, description: str) -> HandoffPackage:
        """开始新任务"""
        package = HandoffPackage(
            task_id=task_id,
            task_description=description,
            context={},
            state={"status": "started"},
            history=[],
            required_output=""
        )
        self.tasks[task_id] = package
        return package

    def record_handoff(self, task_id: str, from_agent: str, to_agent: str, reason: str):
        """记录 Handoff"""
        if task_id in self.tasks:
            self.tasks[task_id].add_history(
                from_agent,
                f"handoff_to_{to_agent}",
                reason
            )

    def get_task_history(self, task_id: str) -> List[Dict]:
        """获取任务历史"""
        if task_id in self.tasks:
            return self.tasks[task_id].history
        return []

    def get_task_status(self, task_id: str) -> Dict:
        """获取任务状态"""
        if task_id in self.tasks:
            package = self.tasks[task_id]
            return {
                "task_id": task_id,
                "status": package.state.get("status", "unknown"),
                "history_count": len(package.history),
                "last_agent": package.history[-1]["agent"] if package.history else "none"
            }
        return {"error": "任务不存在"}

# 使用跟踪系统
tracker = HandoffTracker()

# 模拟任务流程
task_id = "tracked_001"
tracker.start_task(task_id, "开发新功能")

# 记录 Handoff
tracker.record_handoff(task_id, "pm", "dev", "需求分析完成，转开发")
tracker.record_handoff(task_id, "dev", "qa", "开发完成，转测试")
tracker.record_handoff(task_id, "qa", "pm", "测试通过，转产品验收")

# 查看历史
print("任务历史:")
history = tracker.get_task_history(task_id)
for h in history:
    print(f"  [{h['agent']}] {h['action']}: {h['result']}")

# 查看状态
print(f"\n任务状态: {tracker.get_task_status(task_id)}")

print("""
=== Handoff 最佳实践 ===

1. 数据完整性:
   - 包含完整上下文
   - 记录执行历史
   - 明确期望输出

2. 状态跟踪:
   - 每次 Handoff 记录日志
   - 支持任务状态查询
   - 实现超时处理

3. 错误处理:
   - Handoff 失败时回滚
   - 支持重新委派
   - 记录失败原因

4. 性能优化:
   - 减少不必要的 Handoff
   - 并行处理独立任务
   - 缓存常用上下文
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | Handoff 信息丢失 | 确保 HandoffPackage 包含完整上下文 |
| 2 | 任务卡住 | 添加超时机制和错误恢复 |
| 3 | 历史记录太多 | 定期清理过期记录，保留摘要 |
| 4 | 条件判断不准 | 优化判断逻辑，添加人工确认 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Handoff | Agent 间的任务交接机制 |
| HandoffPackage | 包含任务信息、上下文和状态的数据包 |
| 上下文传递 | 将任务相关的背景信息传递给下一个 Agent |
| 状态跟踪 | 记录任务在各阶段的状态变化 |
| 条件 Handoff | 根据条件决定是否交接 |
| 任务历史 | 任务执行过程的完整记录 |
| 责任转移 | 将任务责任从一个 Agent 转移到另一个 |

## ✅ 验收清单
- [ ] 能设计 HandoffPackage 数据结构
- [ ] 能实现 Agent 间的任务交接
- [ ] 能构建带条件的 Handoff 逻辑
- [ ] 能实现 Handoff 跟踪系统
- [ ] 理解 Handoff 的最佳实践
- [ ] 能说出至少 3 个 Handoff 设计要点

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
