# 📅 Week 8 Day 4：Handoff 模式 —— Agent 间的接力棒

## 🎯 今日方向

> Handoff 是多 Agent 系统中的"接力棒"——将任务从一个 Agent 完整地传递给另一个 Agent。今天学习结构化 Handoff 的设计模式，确保任务交接不丢失信息，并构建带跟踪的客户服务体系。

## 🏠 生活比喻

> Handoff 就像医院的"病人交接班"：
> - 早班护士把病人的**所有信息**（病历、用药、注意事项）完整地交给晚班护士
> - 确保治疗不中断，信息不遗漏
> - 好的 Handoff = 完整信息 + 明确责任 + 跟踪状态
>
> 如果交接不清，可能导致重复检查、用药错误等严重问题。Agent 系统也是如此。

## 📋 今日三件事

1. **理解 Handoff 核心要素** —— 上下文、状态、责任、历史
2. **实现结构化 Handoff 协议** —— 定义数据包和交接流程
3. **构建客户服务体系** —— 带升级机制的多级客服

## 🗺️ 手把手路线

### Step 1: Handoff 数据结构设计（15 分钟）

- 做什么: 设计 HandoffPackage 数据结构
- 为什么: 结构化的交接比随意传递更可靠
- 成功标志: 能定义完整的 Handoff 数据模型

### Step 2: 实现 Agent 间交接（25 分钟）

- 做什么: 实现 Agent 的接收、执行、交接流程
- 为什么: 这是多 Agent 协作的核心机制
- 成功标志: 任务能正确地从一个 Agent 传递给另一个

### Step 3: 客户服务 Handoff 系统（30 分钟）

- 做什么: 构建带升级机制的客服系统
- 为什么: 这是 Handoff 最典型的应用场景
- 成功标志: 客服能根据问题复杂度自动升级

### Step 4: 跟踪与监控（15 分钟）

- 做什么: 记录 Handoff 历史，支持任务追踪
- 为什么: 生产环境需要可追溯性
- 成功标志: 能查看完整的任务交接记录

## 💻 代码区

### 代码 1：Handoff 数据结构与基础实现

```python
"""
Week 8 Day 4: Handoff 模式 —— 结构化任务委派
安装依赖: 无需额外依赖
"""

import json
import uuid
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime


# ========== 1. Handoff 数据结构 ==========
print("=" * 60)
print("1. Handoff 数据结构设计")
print("=" * 60)


@dataclass
class HandoffPackage:
    """Handoff 数据包 - 任务交接的核心载体"""
    task_id: str
    task_description: str
    context: Dict[str, Any]           # 任务上下文（背景信息）
    state: Dict[str, Any]             # 当前状态
    history: List[Dict]               # 执行历史
    required_output: str              # 期望输出格式
    priority: str = "normal"          # 优先级: low/normal/high/urgent
    assigned_to: Optional[str] = None  # 当前负责人
    deadline: Optional[str] = None     # 截止时间
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> dict:
        return {
            "task_id": self.task_id,
            "task_description": self.task_description,
            "context": self.context,
            "state": self.state,
            "history_count": len(self.history),
            "required_output": self.required_output,
            "priority": self.priority,
            "assigned_to": self.assigned_to,
            "created_at": self.created_at,
        }

    def add_history(self, agent: str, action: str, result: str):
        """添加历史记录"""
        self.history.append({
            "agent": agent,
            "action": action,
            "result": result,
            "timestamp": datetime.now().isoformat(),
        })
        self.updated_at = datetime.now().isoformat()

    def update_state(self, key: str, value: Any):
        """更新状态"""
        self.state[key] = value
        self.updated_at = datetime.now().isoformat()

    def get_context_summary(self) -> str:
        """获取上下文摘要"""
        summary_parts = []
        for key, value in self.context.items():
            summary_parts.append(f"  {key}: {value}")
        return "\n".join(summary_parts) if summary_parts else "  无上下文"


# 创建 Handoff 数据包示例
package = HandoffPackage(
    task_id="task_" + uuid.uuid4().hex[:8],
    task_description="分析用户反馈并生成改进建议",
    context={
        "user_count": 1000,
        "feedback_source": "app_store",
        "time_range": "2026-Q1",
        "key_issues": ["加载慢", "界面复杂", "缺少教程"],
    },
    state={"status": "pending", "progress": 0},
    history=[],
    required_output="JSON 格式的改进建议列表",
    priority="high",
)

print("Handoff 数据包:")
print(json.dumps(package.to_dict(), indent=2, ensure_ascii=False))
print(f"\n上下文摘要:\n{package.get_context_summary()}")


# ========== 2. 支持 Handoff 的 Agent ==========
print("\n" + "=" * 60)
print("2. 支持 Handoff 的 Agent")
print("=" * 60)


class HandoffAgent:
    """支持 Handoff 的 Agent"""

    def __init__(self, name: str, role: str, capabilities: List[str]):
        self.name = name
        self.role = role
        self.capabilities = capabilities
        self.handoff_log: List[Dict] = []

    def receive_handoff(self, package: HandoffPackage) -> HandoffPackage:
        """接收 Handoff"""
        print(f"  [{self.name}] 接收任务 {package.task_id}")
        package.assigned_to = self.name
        package.add_history(self.name, "receive", f"任务已接收，当前状态: {package.state.get('status', 'unknown')}")
        self.handoff_log.append({
            "action": "receive",
            "task_id": package.task_id,
            "timestamp": datetime.now().isoformat(),
        })
        return package

    def execute(self, package: HandoffPackage) -> HandoffPackage:
        """执行任务（模拟）"""
        print(f"  [{self.name}] 执行任务: {package.task_description[:40]}...")

        # 根据角色模拟不同执行逻辑
        if "分析" in self.role or "研究" in self.role:
            result = self._execute_analysis(package)
        elif "撰写" in self.role or "写作" in self.role:
            result = self._execute_writing(package)
        elif "审查" in self.role or "审核" in self.role:
            result = self._execute_review(package)
        else:
            result = f"[{self.name}] 任务执行完成"

        package.update_state("status", "completed")
        package.update_state("progress", 100)
        package.update_state(f"{self.name}_output", result)
        package.add_history(self.name, "execute", result[:100])

        return package

    def _execute_analysis(self, package: HandoffPackage) -> str:
        """执行分析任务"""
        issues = package.context.get("key_issues", [])
        return f"分析完成: 发现 {len(issues)} 个关键问题 - {', '.join(issues)}"

    def _execute_writing(self, package: HandoffPackage) -> str:
        """执行写作任务"""
        return "报告撰写完成，包含执行摘要、详细分析和改进建议三个部分"

    def _execute_review(self, package: HandoffPackage) -> str:
        """执行审查任务"""
        return "审查通过，质量评分 8.5/10，建议增加数据可视化"

    def create_handoff(self, package: HandoffPackage, target_agent: str, reason: str = "") -> HandoffPackage:
        """创建 Handoff - 将任务交接给下一个 Agent"""
        package.update_state("status", "handoff_pending")
        package.update_state("target_agent", target_agent)
        package.update_state("handoff_reason", reason)
        package.add_history(self.name, "handoff", f"交接给 {target_agent}: {reason}")

        print(f"  [{self.name}] 创建 Handoff → {target_agent} ({reason})")
        return package


# 创建 Agent 示例
analyst = HandoffAgent("数据分析师", "数据分析", ["数据分析", "统计"])
writer = HandoffAgent("报告撰写人", "报告撰写", ["写作", "总结"])
reviewer = HandoffAgent("质量审查员", "质量审查", ["审查", "质量控制"])

print("已创建 3 个 Agent:")
print(f"  1. {analyst.name} - {analyst.role}")
print(f"  2. {writer.name} - {writer.role}")
print(f"  3. {reviewer.name} - {reviewer.role}")


# ========== 3. Handoff 工作流 ==========
print("\n" + "=" * 60)
print("3. Handoff 工作流")
print("=" * 60)


class HandoffWorkflow:
    """Handoff 工作流管理器"""

    def __init__(self, name: str):
        self.name = name
        self.agents: Dict[str, HandoffAgent] = {}
        self.handoff_history: List[Dict] = []

    def register_agent(self, agent: HandoffAgent):
        """注册 Agent"""
        self.agents[agent.name] = agent

    def execute(self, initial_package: HandoffPackage, workflow: List[str]) -> HandoffPackage:
        """执行带 Handoff 的工作流"""
        print(f"\n  [{self.name}] 开始执行工作流")
        print(f"  工作流: {' → '.join(workflow)}")

        package = initial_package

        for i, agent_name in enumerate(workflow):
            if agent_name not in self.agents:
                print(f"  [错误] Agent {agent_name} 不存在，跳过")
                continue

            agent = self.agents[agent_name]

            # 接收
            package = agent.receive_handoff(package)

            # 执行
            package = agent.execute(package)

            # 创建 Handoff（如果不是最后一个）
            if i < len(workflow) - 1:
                next_agent = workflow[i + 1]
                package = agent.create_handoff(package, next_agent, "阶段完成，交接下一阶段")

            # 记录
            self.handoff_history.append({
                "task_id": package.task_id,
                "agent": agent_name,
                "timestamp": datetime.now().isoformat(),
                "state_snapshot": package.state.copy(),
            })

        print(f"\n  [{self.name}] 工作流完成")
        return package

    def get_history(self) -> List[Dict]:
        """获取工作流历史"""
        return self.handoff_history


# 创建并运行工作流
workflow = HandoffWorkflow("用户反馈分析工作流")

# 注册 Agent
workflow.register_agent(analyst)
workflow.register_agent(writer)
workflow.register_agent(reviewer)

# 创建初始任务
initial_package = HandoffPackage(
    task_id="feedback_analysis_001",
    task_description="分析 Q1 用户反馈并生成改进报告",
    context={
        "period": "2026-Q1",
        "feedback_count": 500,
        "key_issues": ["加载速度", "UI 复杂度", "缺少文档"],
    },
    state={"status": "new", "progress": 0},
    history=[],
    required_output="改进建议报告",
    priority="high",
)

# 执行工作流
final_package = workflow.execute(initial_package, [
    "数据分析师",
    "报告撰写人",
    "质量审查员",
])

# 查看结果
print(f"\n最终状态: {json.dumps(final_package.state, indent=2, ensure_ascii=False)}")
print(f"执行历史: {len(final_package.history)} 步")
for h in final_package.history:
    print(f"  [{h['agent']}] {h['action']}: {h['result'][:60]}...")
```

### 代码 2：客户服务 Handoff 系统

```python
"""
Week 8 Day 4: 客户服务 Handoff 系统
实现带升级机制的多级客服
"""

import json
import uuid
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


# ========== 客户服务等级 ==========
class ServiceLevel(Enum):
    """服务等级"""
    L1 = "L1_一线客服"      # 基础问题
    L2 = "L2_技术支持"      # 技术问题
    L3 = "L3_专家团队"      # 复杂问题
    L4 = "L4_管理层"        # 危机处理


# ========== 客户问题 ==========
@dataclass
class CustomerIssue:
    """客户问题"""
    issue_id: str
    customer_name: str
    description: str
    category: str  # tech/billing/feature/complaint
    severity: str  # low/medium/high/critical
    current_level: ServiceLevel
    history: List[Dict] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> dict:
        return {
            "issue_id": self.issue_id,
            "customer": self.customer_name,
            "description": self.description,
            "category": self.category,
            "severity": self.severity,
            "current_level": self.current_level.value,
            "history_count": len(self.history),
        }

    def add_history(self, agent: str, action: str, detail: str):
        self.history.append({
            "agent": agent, "action": action, "detail": detail,
            "timestamp": datetime.now().isoformat(),
        })


# ========== 客服 Agent ==========
class CustomerServiceAgent:
    """客服 Agent"""

    def __init__(self, name: str, level: ServiceLevel, expertise: List[str]):
        self.name = name
        self.level = level
        self.expertise = expertise
        self.handled_issues: List[str] = []

    def handle_issue(self, issue: CustomerIssue) -> CustomerIssue:
        """处理客户问题"""
        print(f"  [{self.name}] 处理问题 {issue.issue_id}")
        issue.add_history(self.name, "start", f"开始处理，等级: {self.level.value}")

        # 根据等级模拟处理
        if self.level == ServiceLevel.L1:
            result = self._handle_basic(issue)
        elif self.level == ServiceLevel.L2:
            result = self._handle_technical(issue)
        elif self.level == ServiceLevel.L3:
            result = self._handle_expert(issue)
        else:
            result = self._handle_management(issue)

        issue.add_history(self.name, "complete", result)
        self.handled_issues.append(issue.issue_id)

        return issue

    def _handle_basic(self, issue: CustomerIssue) -> str:
        """L1: 基础问题处理"""
        if issue.category == "billing":
            return "账单问题已解答，已发送详细说明邮件"
        elif issue.category == "feature":
            return "功能咨询已解答，已推荐相关文档"
        else:
            return "问题已记录，需要升级处理"

    def _handle_technical(self, issue: CustomerIssue) -> str:
        """L2: 技术问题处理"""
        return f"技术问题已诊断，提供了解决方案: 检查配置 → 重启服务 → 验证结果"

    def _handle_expert(self, issue: CustomerIssue) -> str:
        """L3: 专家处理"""
        return "复杂问题已深入分析，提供了定制化解决方案，安排工程师跟进"

    def _handle_management(self, issue: CustomerIssue) -> str:
        """L4: 管理层处理"""
        return "紧急问题已升级处理，已安排专人对接，24小时内给出最终方案"

    def should_escalate(self, issue: CustomerIssue) -> bool:
        """判断是否需要升级"""
        # 基础规则
        if issue.severity == "critical":
            return True
        if issue.category == "complaint" and issue.severity == "high":
            return True
        if self.level == ServiceLevel.L1 and issue.category == "tech":
            return True
        return False

    def get_escalation_target(self) -> ServiceLevel:
        """获取升级目标等级"""
        level_order = [ServiceLevel.L1, ServiceLevel.L2, ServiceLevel.L3, ServiceLevel.L4]
        current_idx = level_order.index(self.level)
        if current_idx < len(level_order) - 1:
            return level_order[current_idx + 1]
        return self.level  # 已经是最高级


# ========== 客服系统 ==========
class CustomerServiceSystem:
    """客户服务系统 - 带自动升级"""

    def __init__(self):
        self.agents: Dict[ServiceLevel, CustomerServiceAgent] = {}
        self.active_issues: Dict[str, CustomerIssue] = {}
        self.resolved_issues: List[CustomerIssue] = []
        self.escalation_log: List[Dict] = []

    def register_agent(self, agent: CustomerServiceAgent):
        """注册客服 Agent"""
        self.agents[agent.level] = agent
        print(f"  [系统] 注册客服: {agent.name} ({agent.level.value})")

    def create_issue(self, customer: str, description: str, category: str, severity: str) -> CustomerIssue:
        """创建客户问题"""
        issue = CustomerIssue(
            issue_id="issue_" + uuid.uuid4().hex[:8],
            customer_name=customer,
            description=description,
            category=category,
            severity=severity,
            current_level=ServiceLevel.L1,
        )
        self.active_issues[issue.issue_id] = issue
        print(f"\n  [系统] 新问题: {issue.issue_id} from {customer}")
        print(f"         描述: {description[:50]}...")
        print(f"         类别: {category}, 严重度: {severity}")
        return issue

    def process_issue(self, issue_id: str) -> CustomerIssue:
        """处理客户问题（带自动升级）"""
        if issue_id not in self.active_issues:
            raise ValueError(f"问题 {issue_id} 不存在")

        issue = self.active_issues[issue_id]
        max_escalations = 4  # 最多升级 3 次
        escalation_count = 0

        while escalation_count < max_escalations:
            level = issue.current_level
            agent = self.agents.get(level)

            if not agent:
                print(f"  [系统] 等级 {level.value} 没有可用客服")
                break

            # 处理问题
            issue = agent.handle_issue(issue)

            # 检查是否需要升级
            if agent.should_escalate(issue):
                target_level = agent.get_escalation_target()
                if target_level != issue.current_level:
                    print(f"  [系统] 自动升级: {issue.current_level.value} → {target_level.value}")
                    self.escalation_log.append({
                        "issue_id": issue_id,
                        "from_level": issue.current_level.value,
                        "to_level": target_level.value,
                        "timestamp": datetime.now().isoformat(),
                    })
                    issue.current_level = target_level
                    escalation_count += 1
                    continue

            # 问题已解决
            break

        # 移动到已解决
        if issue_id in self.active_issues:
            del self.active_issues[issue_id]
            self.resolved_issues.append(issue)

        return issue

    def get_stats(self) -> dict:
        """获取系统统计"""
        return {
            "active_issues": len(self.active_issues),
            "resolved_issues": len(self.resolved_issues),
            "total_escalations": len(self.escalation_log),
            "agents": {
                level.value: agent.name
                for level, agent in self.agents.items()
            },
        }


# ========== 运行客户服务系统 ==========
print("=" * 60)
print("客户服务 Handoff 系统")
print("=" * 60)

# 创建系统
cs_system = CustomerServiceSystem()

# 注册客服
cs_system.register_agent(CustomerServiceAgent("小明", ServiceLevel.L1, ["基础咨询", "账单问题"]))
cs_system.register_agent(CustomerServiceAgent("小红", ServiceLevel.L2, ["技术支持", "问题诊断"]))
cs_system.register_agent(CustomerServiceAgent("张专家", ServiceLevel.L3, ["复杂问题", "架构设计"]))
cs_system.register_agent(CustomerServiceAgent("李总", ServiceLevel.L4, ["危机处理", "客户关系"]))

# 模拟客户问题
print("\n--- 模拟客户问题 ---")

# 问题1: 简单账单问题（L1 直接解决）
issue1 = cs_system.create_issue(
    "张三", "我的账单金额不对，多收了费用", "billing", "low"
)
result1 = cs_system.process_issue(issue1.issue_id)
print(f"\n结果: {result1.history[-1]['detail']}")

# 问题2: 技术问题（需要升级到 L2）
issue2 = cs_system.create_issue(
    "李四", "API 返回 500 错误，无法正常使用", "tech", "medium"
)
result2 = cs_system.process_issue(issue2.issue_id)
print(f"\n最终等级: {result2.current_level.value}")
print(f"结果: {result2.history[-1]['detail']}")

# 问题3: 严重投诉（需要升级到 L3/L4）
issue3 = cs_system.create_issue(
    "王五", "系统宕机导致我们损失了大量数据，必须立即处理", "complaint", "critical"
)
result3 = cs_system.process_issue(issue3.issue_id)
print(f"\n最终等级: {result3.current_level.value}")
print(f"结果: {result3.history[-1]['detail']}")

# 查看统计
print("\n--- 系统统计 ---")
stats = cs_system.get_stats()
print(json.dumps(stats, indent=2, ensure_ascii=False))

# 查看升级日志
print("\n--- 升级日志 ---")
for log in cs_system.escalation_log:
    print(f"  {log['issue_id']}: {log['from_level']} → {log['to_level']}")
```

### 代码 3：Handoff 跟踪系统

```python
"""
Week 8 Day 4: Handoff 跟踪系统
记录和查询任务交接历史
"""

import json
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class HandoffRecord:
    """Handoff 记录"""
    record_id: str
    task_id: str
    from_agent: str
    to_agent: str
    reason: str
    context_passed: Dict
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    status: str = "completed"  # completed/failed/pending


class HandoffTracker:
    """Handoff 跟踪系统"""

    def __init__(self):
        self.records: List[HandoffRecord] = []
        self.task_flows: Dict[str, List[Dict]] = {}  # task_id -> flow

    def record_handoff(self, task_id: str, from_agent: str, to_agent: str,
                       reason: str, context: Dict = None) -> HandoffRecord:
        """记录一次 Handoff"""
        record = HandoffRecord(
            record_id=f"rec_{len(self.records) + 1:04d}",
            task_id=task_id,
            from_agent=from_agent,
            to_agent=to_agent,
            reason=reason,
            context_passed=context or {},
        )
        self.records.append(record)

        # 更新任务流程
        if task_id not in self.task_flows:
            self.task_flows[task_id] = []
        self.task_flows[task_id].append({
            "from": from_agent,
            "to": to_agent,
            "reason": reason,
            "timestamp": record.timestamp,
        })

        return record

    def get_task_flow(self, task_id: str) -> List[Dict]:
        """获取任务的完整流转路径"""
        return self.task_flows.get(task_id, [])

    def get_agent_handoff_count(self, agent_name: str) -> Dict:
        """获取 Agent 的 Handoff 统计"""
        sent = sum(1 for r in self.records if r.from_agent == agent_name)
        received = sum(1 for r in self.records if r.to_agent == agent_name)
        return {"sent": sent, "received": received, "total": sent + received}

    def get_bottleneck_analysis(self) -> Dict:
        """分析瓶颈"""
        agent_counts = {}
        for record in self.records:
            agent_counts[record.to_agent] = agent_counts.get(record.to_agent, 0) + 1
        return dict(sorted(agent_counts.items(), key=lambda x: x[1], reverse=True))

    def get_timeline(self, task_id: str) -> str:
        """获取任务时间线（可视化）"""
        flow = self.get_task_flow(task_id)
        if not flow:
            return f"任务 {task_id} 无流转记录"

        lines = [f"任务 {task_id} 流转路径:"]
        lines.append("=" * 50)
        for i, step in enumerate(flow):
            arrow = "  → " if i > 0 else "  ● "
            lines.append(f"{arrow}{step['from']} → {step['to']}")
            lines.append(f"    原因: {step['reason']}")
            lines.append(f"    时间: {step['timestamp']}")
        lines.append("=" * 50)
        return "\n".join(lines)


# ========== 运行跟踪系统 ==========
print("=" * 60)
print("Handoff 跟踪系统")
print("=" * 60)

tracker = HandoffTracker()

# 模拟任务流转
tasks = [
    ("task_001", "产品经理", "设计师", "需求分析完成，转设计"),
    ("task_001", "设计师", "开发工程师", "设计稿完成，转开发"),
    ("task_001", "开发工程师", "测试工程师", "开发完成，转测试"),
    ("task_001", "测试工程师", "产品经理", "测试通过，转产品验收"),

    ("task_002", "客服", "技术支持", "技术问题，转技术支持"),
    ("task_002", "技术支持", "专家团队", "复杂问题，转专家"),
]

print("\n记录 Handoff:")
for task_id, from_agent, to_agent, reason in tasks:
    record = tracker.record_handoff(task_id, from_agent, to_agent, reason)
    print(f"  {record.record_id}: {from_agent} → {to_agent}")

# 查看任务流转
print("\n" + tracker.get_timeline("task_001"))
print("\n" + tracker.get_timeline("task_002"))

# 统计分析
print("\n--- Agent Handoff 统计 ---")
for agent in ["产品经理", "设计师", "开发工程师", "测试工程师", "客服", "技术支持", "专家团队"]:
    stats = tracker.get_agent_handoff_count(agent)
    if stats["total"] > 0:
        print(f"  {agent}: 发送 {stats['sent']}, 接收 {stats['received']}")

print("\n--- 瓶颈分析 ---")
bottlenecks = tracker.get_bottleneck_analysis()
for agent, count in bottlenecks.items():
    print(f"  {agent}: 接收 {count} 次 Handoff")
```

## 📤 预期输出

```
============================================================
1. Handoff 数据结构设计
============================================================
Handoff 数据包:
{
  "task_id": "task_a1b2c3d4",
  "task_description": "分析用户反馈并生成改进建议",
  "context": {
    "user_count": 1000,
    "feedback_source": "app_store",
    "key_issues": ["加载慢", "界面复杂", "缺少教程"]
  },
  "priority": "high"
}

============================================================
3. Handoff 工作流
============================================================
  [用户反馈分析工作流] 开始执行工作流
  工作流: 数据分析师 → 报告撰写人 → 质量审查员

  [数据分析师] 接收任务 feedback_analysis_001
  [数据分析师] 执行任务: 分析 Q1 用户反馈并生成改进报告...
  [数据分析师] 创建 Handoff → 报告撰写人 (阶段完成，交接下一阶段)
  [报告撰写人] 接收任务 feedback_analysis_001
  [报告撰写人] 执行任务: 分析 Q1 用户反馈并生成改进报告...
  [报告撰写人] 创建 Handoff → 质量审查员 (阶段完成，交接下一阶段)
  [质量审查员] 接收任务 feedback_analysis_001
  [质量审查员] 执行任务: 分析 Q1 用户反馈并生成改进报告...

============================================================
客户服务 Handoff 系统
============================================================
  [系统] 注册客服: 小明 (L1_一线客服)
  [系统] 注册客服: 小红 (L2_技术支持)
  [系统] 注册客服: 张专家 (L3_专家团队)
  [系统] 注册客服: 李总 (L4_管理层)

  [系统] 新问题: issue_x1y2z3w4 from 张三
  [小明] 处理问题 issue_x1y2z3w4
  结果: 账单问题已解答，已发送详细说明邮件

  [系统] 新问题: issue_a2b3c4d5 from 王五
  [小明] 处理问题 issue_a2b3c4d5
  [系统] 自动升级: L1_一线客服 → L2_技术支持
  [小红] 处理问题 issue_a2b3c4d5
  [系统] 自动升级: L2_技术支持 → L3_专家团队
  [张专家] 处理问题 issue_a2b3c4d5
  结果: 紧急问题已升级处理，已安排专人对接

--- 系统统计 ---
{
  "active_issues": 0,
  "resolved_issues": 3,
  "total_escalations": 4
}
```

## ⚠️ 常见错误与解决方案

| # | 问题 | 原因 | 解决方案 |
|---|------|------|---------|
| 1 | Handoff 信息丢失 | HandoffPackage 不完整 | 确保包含 context、state、history |
| 2 | 无限升级 | 升级条件太宽松 | 设置最大升级次数限制 |
| 3 | 任务卡住 | 没有超时机制 | 添加 deadline 和超时处理 |
| 4 | 历史记录膨胀 | 记录太多细节 | 定期清理，保留摘要 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Handoff | Agent 间的任务交接机制 |
| HandoffPackage | 包含任务信息、上下文和状态的数据包 |
| 上下文传递 | 将任务相关的背景信息传递给下一个 Agent |
| 升级机制 | 问题超出当前能力时自动转给更高级别的 Agent |
| 任务历史 | 任务执行过程的完整记录 |
| 瓶颈分析 | 识别系统中处理能力不足的环节 |

## 🏋️ 每日挑战

### 挑战 1：添加超时机制（难度：⭐）

为 HandoffPackage 添加 `deadline` 字段，如果任务超时未完成，自动升级或告警。

### 挑战 2：并行处理（难度：⭐⭐）

修改客服系统，支持同时处理多个客户问题（使用 Python `asyncio`）。

### 挑战 3：智能升级（难度：⭐⭐⭐）

实现基于机器学习的升级预测：根据历史数据预测问题是否需要升级，提前分配资源。

### 挑战 4：Web 界面（难度：⭐⭐⭐）

为客服系统添加一个简单的 Web 界面（使用 Flask），支持实时查看问题状态。

## ✅ 验收清单

- [ ] 能设计 HandoffPackage 数据结构
- [ ] 能实现 Agent 间的任务交接
- [ ] 能构建带升级机制的客服系统
- [ ] 能实现 Handoff 跟踪系统
- [ ] 理解 Handoff 的最佳实践
- [ ] 代码能正确运行并输出预期结果

## 📝 复盘小纸条

- 今天最大的收获: ...
- 还不太确定的: ...
