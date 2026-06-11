# 📅 Week 8 Day 3：多 Agent 架构设计 —— 从混乱到有序

## 🎯 今日方向

> 多 Agent 系统不是简单地把几个 Agent 放在一起，而是需要精心设计的架构。今天我们将学习多 Agent 系统的设计模式、消息传递机制、共享状态管理和分布式协调，掌握构建可靠多 Agent 系统的核心方法。

## 🏠 生活比喻

> 多 Agent 系统就像一个公司：
> - **集中式架构** = 一个 CEO 管理所有员工（简单但瓶颈大）
> - **分布式架构** = 部门自治，部门间协作（灵活但复杂）
> - **层级式架构** = CEO → VP → Manager → 员工（可扩展但层级多）
>
> 选择哪种架构取决于任务复杂度、团队规模和协作需求。

## 📋 今日三件事

1. **理解设计模式** —— 主从、对等、分层、混合四种架构
2. **实现消息传递** —— Agent 间如何安全高效地通信
3. **构建协调系统** —— 多个 Agent 如何协作完成复杂任务

## 🗺️ 手把手路线

### Step 1: 多 Agent 架构模式（20 分钟）

- 做什么: 理解四种主要架构模式的优缺点
- 为什么: 正确的架构是系统成功的基础
- 成功标志: 能根据场景选择合适的架构

### Step 2: 消息传递系统（25 分钟）

- 做什么: 实现一个 Agent 间的消息传递系统
- 为什么: 消息是 Agent 协作的基础
- 成功标志: Agent 能安全地发送和接收消息

### Step 3: 共享状态管理（20 分钟）

- 做什么: 实现多 Agent 共享状态的管理
- 为什么: 协作需要共享信息
- 成功标志: 多个 Agent 能读写共享状态

### Step 4: 协调器实现（25 分钟）

- 做什么: 实现一个协调多个 Agent 的协调器
- 为什么: 复杂任务需要协调分工
- 成功标志: 协调器能正确分配和监控任务

## 💻 代码区

### 代码 1：多 Agent 架构模式概览与消息系统

```python
"""
Week 8 Day 3: 多 Agent 架构设计
安装依赖: 无需额外依赖，使用标准库即可
"""

import json
import uuid
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


# ========== 1. 架构模式概览 ==========
print("=" * 60)
print("1. 多 Agent 架构模式概览")
print("=" * 60)

architecture_overview = """
四种主要架构模式:

1. 主从架构 (Supervisor)
   ┌─────────────┐
   │  Supervisor  │  ← 决策中心
   └──────┬──────┘
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
  Agent1 Agent2 Agent3  ← 执行者

   优点: 简单、易控制、调试方便
   缺点: Supervisor 是瓶颈，单点故障
   适用: 小规模团队、流程化任务

2. 对等架构 (Peer-to-Peer)
   Agent1 ←→ Agent2
     ↕         ↕
   Agent3 ←→ Agent4

   优点: 无瓶颈、高容错、可扩展
   缺点: 复杂、难调试、一致性难保证
   适用: 大规模系统、去中心化场景

3. 分层架构 (Hierarchical)
        CEO
       /    \\
     VP1    VP2
    / \\    / \\
  M1  M2  M3  M4

   优点: 可扩展、职责清晰、支持复杂组织
   缺点: 层级多、延迟高、管理开销大
   适用: 企业级系统、大型项目

4. 混合架构 (Hybrid)
   结合以上模式的优点，根据子系统需求选择

   优点: 灵活、最优适配
   缺点: 设计复杂、需要经验
   适用: 实际生产环境
"""
print(architecture_overview)


# ========== 2. 消息类型定义 ==========
print("=" * 60)
print("2. 消息类型与数据结构")
print("=" * 60)


class MessageType(Enum):
    """消息类型"""
    REQUEST = "request"         # 请求消息
    RESPONSE = "response"       # 响应消息
    BROADCAST = "broadcast"     # 广播消息
    HEARTBEAT = "heartbeat"     # 心跳消息
    ERROR = "error"             # 错误消息
    HANDOFF = "handoff"         # 任务交接


@dataclass
class AgentMessage:
    """Agent 间消息"""
    msg_id: str
    sender: str
    receiver: str
    msg_type: MessageType
    content: dict
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    reply_to: Optional[str] = None
    ttl: int = 300  # 生存时间（秒）

    def to_dict(self) -> dict:
        return {
            "msg_id": self.msg_id,
            "sender": self.sender,
            "receiver": self.receiver,
            "type": self.msg_type.value,
            "content": self.content,
            "timestamp": self.timestamp,
            "reply_to": self.reply_to,
        }

    def is_expired(self) -> bool:
        """检查消息是否过期"""
        created = datetime.fromisoformat(self.timestamp)
        return (datetime.now() - created).total_seconds() > self.ttl


# 创建示例消息
msg = AgentMessage(
    msg_id="msg_001",
    sender="agent_a",
    receiver="agent_b",
    msg_type=MessageType.REQUEST,
    content={"action": "search", "query": "Python 教程"},
)
print("消息示例:")
print(json.dumps(msg.to_dict(), indent=2, ensure_ascii=False))


# ========== 3. 消息总线 ==========
print("\n" + "=" * 60)
print("3. 消息总线（Message Bus）")
print("=" * 60)


class MessageBus:
    """消息总线 - Agent 间通信的中介"""

    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}
        self.message_log: List[AgentMessage] = []
        self.message_id_counter = 0

    def subscribe(self, agent_id: str, callback: Callable):
        """订阅消息"""
        if agent_id not in self.subscribers:
            self.subscribers[agent_id] = []
        self.subscribers[agent_id].append(callback)
        print(f"  [总线] {agent_id} 已订阅")

    def unsubscribe(self, agent_id: str):
        """取消订阅"""
        if agent_id in self.subscribers:
            del self.subscribers[agent_id]

    def publish(self, message: AgentMessage):
        """发布消息"""
        self.message_id_counter += 1
        self.message_log.append(message)

        # 路由消息
        if message.receiver == "*":
            # 广播：发送给所有订阅者（除了发送者）
            for agent_id, callbacks in self.subscribers.items():
                if agent_id != message.sender:
                    for callback in callbacks:
                        callback(message)
            print(f"  [总线] 广播消息 from {message.sender}")
        elif message.receiver in self.subscribers:
            # 单播：发送给指定订阅者
            for callback in self.subscribers[message.receiver]:
                callback(message)
            print(f"  [总线] 路由消息 {message.sender} → {message.receiver}")
        else:
            print(f"  [总线] 目标 {message.receiver} 不存在，消息丢弃")

    def get_message_log(self) -> List[dict]:
        """获取消息日志"""
        return [msg.to_dict() for msg in self.message_log]

    def get_stats(self) -> dict:
        """获取统计信息"""
        return {
            "total_messages": len(self.message_log),
            "subscribers": list(self.subscribers.keys()),
            "message_types": {
                mt.value: sum(1 for m in self.message_log if m.msg_type == mt)
                for mt in MessageType
            },
        }


# 创建消息总线
bus = MessageBus()


# ========== 4. 基础 Agent 实现 ==========
print("=" * 60)
print("4. 基础 Agent 实现")
print("=" * 60)


class BaseAgent:
    """基础 Agent"""

    def __init__(self, agent_id: str, name: str, bus: MessageBus):
        self.agent_id = agent_id
        self.name = name
        self.bus = bus
        self.inbox: List[AgentMessage] = []
        self.bus.subscribe(agent_id, self._on_message)

    def _on_message(self, message: AgentMessage):
        """收到消息时的回调"""
        self.inbox.append(message)

    def send(self, receiver: str, msg_type: MessageType, content: dict):
        """发送消息"""
        msg = AgentMessage(
            msg_id=f"msg_{self.bus.message_id_counter + 1:04d}",
            sender=self.agent_id,
            receiver=receiver,
            msg_type=msg_type,
            content=content,
        )
        self.bus.publish(msg)
        print(f"  [{self.name}] 发送消息给 {receiver}")

    def broadcast(self, content: dict):
        """广播消息"""
        self.send("*", MessageType.BROADCAST, content)

    def process_inbox(self):
        """处理收件箱中的所有消息"""
        while self.inbox:
            msg = self.inbox.pop(0)
            self.handle_message(msg)

    def handle_message(self, message: AgentMessage):
        """处理消息（子类可重写）"""
        print(f"  [{self.name}] 收到来自 {message.sender} 的消息")


# 创建 Agent
agent_a = BaseAgent("agent_a", "Agent-A", bus)
agent_b = BaseAgent("agent_b", "Agent-B", bus)
agent_c = BaseAgent("agent_c", "Agent-C", bus)

# 测试消息传递
print("\n--- 测试消息传递 ---")
agent_a.send("agent_b", MessageType.REQUEST, {"action": "search", "query": "test"})
agent_b.process_inbox()

agent_a.broadcast({"action": "heartbeat"})
agent_b.process_inbox()
agent_c.process_inbox()

# 查看统计
print(f"\n总线统计: {json.dumps(bus.get_stats(), indent=2, ensure_ascii=False)}")


# ========== 5. 共享状态管理 ==========
print("\n" + "=" * 60)
print("5. 共享状态管理")
print("=" * 60)


class SharedState:
    """共享状态管理器"""

    def __init__(self):
        self.state: Dict[str, any] = {}
        self.locks: Dict[str, str] = {}  # key -> owner_agent_id
        self.history: List[Dict] = []

    def get(self, key: str, agent_id: str = "") -> Optional[any]:
        """读取状态"""
        value = self.state.get(key)
        self.history.append({
            "action": "get", "key": key, "agent": agent_id,
            "timestamp": datetime.now().isoformat(),
        })
        return value

    def set(self, key: str, value: any, agent_id: str) -> bool:
        """设置状态（带锁检查）"""
        if key in self.locks and self.locks[key] != agent_id:
            print(f"  [状态] {agent_id} 无法写入 {key}，已被 {self.locks[key]} 锁定")
            return False

        old_value = self.state.get(key)
        self.state[key] = value
        self.history.append({
            "action": "set", "key": key, "value": value,
            "old_value": old_value, "agent": agent_id,
            "timestamp": datetime.now().isoformat(),
        })
        print(f"  [状态] {agent_id} 设置 {key} = {str(value)[:50]}")
        return True

    def lock(self, key: str, agent_id: str) -> bool:
        """锁定状态（独占写入）"""
        if key in self.locks and self.locks[key] != agent_id:
            print(f"  [状态] {key} 已被 {self.locks[key]} 锁定")
            return False
        self.locks[key] = agent_id
        print(f"  [状态] {agent_id} 锁定了 {key}")
        return True

    def unlock(self, key: str, agent_id: str):
        """解锁状态"""
        if self.locks.get(key) == agent_id:
            del self.locks[key]
            print(f"  [状态] {agent_id} 解锁了 {key}")

    def get_history(self, key: Optional[str] = None) -> List[Dict]:
        """获取历史记录"""
        if key:
            return [h for h in self.history if h["key"] == key]
        return self.history

    def get_all(self) -> Dict[str, any]:
        """获取所有状态"""
        return self.state.copy()


# 测试共享状态
state = SharedState()

print("\n--- 测试共享状态 ---")
state.set("research_result", "Python 3.12 新特性分析", "agent_a")
state.set("summary", "简短总结内容", "agent_b")

print(f"\n  读取 research_result: {state.get('research_result', 'agent_c')}")

# 测试锁机制
state.lock("draft", "agent_a")
state.set("draft", "初稿内容 v1", "agent_a")
state.set("draft", "其他内容", "agent_b")  # 会被拒绝
state.unlock("draft", "agent_a")
state.set("draft", "现在可以写入了", "agent_b")  # 现在可以

print(f"\n  历史记录数: {len(state.get_history())}")
print(f"  所有状态: {state.get_all()}")
```

### 代码 2：层级式协调器与完整协作系统

```python
"""
Week 8 Day 3: 层级式协调器与多 Agent 协作系统
"""

import json
import uuid
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime


# ========== 共享状态 ==========
class SharedState:
    """共享状态"""

    def __init__(self):
        self.data: Dict[str, any] = {}
        self.history: List[Dict] = []

    def get(self, key: str) -> Optional[any]:
        return self.data.get(key)

    def set(self, key: str, value: any, agent: str):
        self.data[key] = value
        self.history.append({
            "key": key, "value_preview": str(value)[:80],
            "agent": agent, "timestamp": datetime.now().isoformat(),
        })


# ========== Agent 基类 ==========
class Agent:
    """Agent 基类"""

    def __init__(self, name: str, role: str, state: SharedState):
        self.name = name
        self.role = role
        self.state = state
        self.task_queue: List[Dict] = []

    def receive_task(self, task: Dict):
        """接收任务"""
        self.task_queue.append(task)
        print(f"  [{self.name}] 收到任务: {task.get('description', '无描述')}")

    def process(self):
        """处理任务队列"""
        while self.task_queue:
            task = self.task_queue.pop(0)
            result = self.execute(task)
            self.state.set(f"{self.name}_result", result, self.name)
            print(f"  [{self.name}] 完成任务，结果已存入共享状态")

    def execute(self, task: Dict) -> str:
        """执行任务（子类重写）"""
        raise NotImplementedError


# ========== 研究 Agent ==========
class ResearchAgent(Agent):
    """研究 Agent - 负责信息收集"""

    def __init__(self, state: SharedState):
        super().__init__("研究员", "research", state)

    def execute(self, task: Dict) -> str:
        topic = task.get("topic", "未知主题")
        result = f"关于 '{topic}' 的研究结果:\n"
        result += "1. 发现了 5 篇相关论文\n"
        result += "2. 总结了 3 个核心观点:\n"
        result += "   - 大模型持续进化，参数规模不再是唯一指标\n"
        result += "   - 多模态能力成为标配\n"
        result += "   - Agent 技术从概念走向落地\n"
        result += "3. 收集了 10 个参考链接"
        return result


# ========== 写作 Agent ==========
class WriterAgent(Agent):
    """写作 Agent - 负责内容撰写"""

    def __init__(self, state: SharedState):
        super().__init__("写手", "writing", state)

    def execute(self, task: Dict) -> str:
        research = self.state.get("研究员_result") or "无研究结果"
        result = "=" * 50 + "\n"
        result += "标题: 2026年 AI 发展趋势深度分析\n"
        result += "=" * 50 + "\n\n"
        result += "引言:\n"
        result += "人工智能技术正在经历前所未有的变革。基于最新研究，\n"
        result += "我们总结了以下关键趋势...\n\n"
        result += "正文:\n"
        result += "一、大模型进化\n"
        result += "二、多模态融合\n"
        result += "三、Agent 技术落地\n\n"
        result += "结论:\n"
        result += "AI 技术正从实验室走向产业化，未来可期。\n"
        result += "=" * 50
        return result


# ========== 审核 Agent ==========
class ReviewerAgent(Agent):
    """审核 Agent - 负责质量把关"""

    def __init__(self, state: SharedState):
        super().__init__("审核员", "review", state)

    def execute(self, task: Dict) -> str:
        draft = self.state.get("写手_result") or "无草稿"
        result = "审核报告:\n"
        result += "-" * 40 + "\n"
        result += "内容完整性: 通过 (8/10)\n"
        result += "逻辑连贯性: 通过 (9/10)\n"
        result += "数据准确性: 通过 (8/10)\n"
        result += "语言流畅度: 通过 (9/10)\n"
        result += "-" * 40 + "\n"
        result += "建议修改:\n"
        result += "  1. 标题可更具吸引力\n"
        result += "  2. 建议增加具体数据支撑\n"
        result += "总体评价: 良好，可以发布"
        return result


# ========== 流水线协调器 ==========
class PipelineCoordinator:
    """流水线协调器 - 按顺序协调多个 Agent"""

    def __init__(self):
        self.state = SharedState()
        self.agents: List[Agent] = []

    def add_agent(self, agent: Agent):
        """添加 Agent 到流水线"""
        self.agents.append(agent)
        print(f"  [协调器] 添加 {agent.name} ({agent.role})")

    def run(self, initial_task: Dict):
        """运行流水线"""
        print("\n" + "=" * 60)
        print("开始执行多 Agent 协作流水线")
        print("=" * 60)

        # 将初始任务分配给第一个 Agent
        self.agents[0].receive_task(initial_task)

        # 按顺序执行每个 Agent
        for i, agent in enumerate(self.agents):
            print(f"\n--- 步骤 {i+1}: {agent.name} 开始工作 ---")
            agent.process()

        # 输出最终结果
        print("\n" + "=" * 60)
        print("协作完成！执行历史:")
        print("=" * 60)
        for entry in self.state.history:
            print(f"  [{entry['agent']}] {entry['key']}")


# ========== 层级式协调器 ==========
class HierarchicalCoordinator:
    """层级式协调器 - 支持任务分解和委派"""

    def __init__(self, name: str):
        self.name = name
        self.children: Dict[str, Agent] = {}
        self.state = SharedState()

    def add_worker(self, agent: Agent):
        """添加工作 Agent"""
        self.children[agent.name] = agent
        print(f"  [{self.name}] 添加工人: {agent.name}")

    def delegate(self, task: Dict) -> Dict[str, str]:
        """委派任务给多个工人"""
        print(f"\n  [{self.name}] 收到任务，开始分解...")
        results = {}

        for name, agent in self.children.items():
            print(f"\n  [{self.name}] 委派给 {name}")
            agent.receive_task(task)
            agent.process()
            result = self.state.get(f"{name}_result")
            results[name] = result

        return results


# ========== 运行示例 1: 流水线 ==========
print("=" * 60)
print("示例 1: 流水线协作")
print("=" * 60)

pipeline = PipelineCoordinator()
pipeline.add_agent(ResearchAgent(pipeline.state))
pipeline.add_agent(WriterAgent(pipeline.state))
pipeline.add_agent(ReviewerAgent(pipeline.state))

pipeline.run({
    "topic": "2026年 AI 发展趋势",
    "description": "研究并撰写一篇关于 AI 趋势的文章",
})

# 查看共享状态
print("\n--- 共享状态一览 ---")
for key, value in pipeline.state.data.items():
    preview = str(value)[:100] + "..." if len(str(value)) > 100 else str(value)
    print(f"  {key}: {preview}")


# ========== 运行示例 2: 层级式 ==========
print("\n" + "=" * 60)
print("示例 2: 层级式协调")
print("=" * 60)

hierarchical = HierarchicalCoordinator("技术总监")
hierarchical.add_worker(ResearchAgent(hierarchical.state))
hierarchical.add_worker(WriterAgent(hierarchical.state))
hierarchical.add_worker(ReviewerAgent(hierarchical.state))

results = hierarchical.delegate({
    "topic": "AI Agent 技术栈分析",
    "description": "全面分析当前 AI Agent 技术栈",
})

print("\n--- 各工人结果 ---")
for name, result in results.items():
    preview = str(result)[:80] + "..." if len(str(result)) > 80 else str(result)
    print(f"  {name}: {preview}")


# ========== 架构对比 ==========
print("\n" + "=" * 60)
print("架构对比总结")
print("=" * 60)

comparison = [
    {"维度": "复杂度", "主从": "低", "对等": "中", "分层": "高"},
    {"维度": "扩展性", "主从": "中", "对等": "高", "分层": "高"},
    {"维度": "容错性", "主从": "低", "对等": "高", "分层": "中"},
    {"维度": "通信开销", "主从": "低", "对等": "高", "分层": "中"},
    {"维度": "调试难度", "主从": "易", "对等": "难", "分层": "中"},
    {"维度": "适用场景", "主从": "流程化任务", "对等": "创意讨论", "分层": "大型项目"},
]

print(f"\n{'维度':<10} | {'主从':<12} | {'对等':<12} | {'分层':<12}")
print("-" * 50)
for row in comparison:
    print(f"{row['维度']:<10} | {row['主从']:<12} | {row['对等']:<12} | {row['分层']:<12}")

print("""
选型建议:
  - 初学者/小团队: 主从架构（简单可靠）
  - 创意/讨论场景: 对等架构（多角度思考）
  - 企业级项目: 分层架构（可扩展）
  - 生产环境: 混合架构（按需组合）
""")
```

## 📤 预期输出

```
============================================================
1. 多 Agent 架构模式概览
============================================================
四种主要架构模式:
1. 主从架构 (Supervisor) - 一个决策者，多个执行者
2. 对等架构 (Peer-to-Peer) - Agent 间平等协作
3. 分层架构 (Hierarchical) - 多级管理结构
4. 混合架构 (Hybrid) - 结合以上模式

============================================================
3. 消息总线（Message Bus）
============================================================
  [总线] agent_a 已订阅
  [总线] agent_b 已订阅
  [总线] agent_c 已订阅

--- 测试消息传递 ---
  [总线] 路由消息 agent_a → agent_b
  [Agent-A] 发送消息给 agent_b
  [Agent-B] 收到来自 agent_a 的消息
  [总线] 广播消息 from agent_a
  [Agent-B] 收到来自 agent_a 的消息
  [Agent-C] 收到来自 agent_a 的消息

============================================================
5. 共享状态管理
============================================================
  [状态] agent_a 设置 research_result = Python 3.12 新特性分析
  [状态] agent_b 设置 summary = 简短总结内容
  读取 research_result: Python 3.12 新特性分析
  [状态] agent_a 锁定了 draft
  [状态] agent_a 设置 draft = 初稿内容 v1
  [状态] agent_b 无法写入 draft，已被 agent_a 锁定
  [状态] agent_a 解锁了 draft
  [状态] agent_b 设置 draft = 现在可以写入了

============================================================
示例 1: 流水线协作
============================================================
  [协调器] 添加 研究员 (research)
  [协调器] 添加 写手 (writing)
  [协调器] 添加 审核员 (review)

--- 步骤 1: 研究员 开始工作 ---
  [研究员] 收到任务: 研究并撰写一篇关于 AI 趋势的文章
  [研究员] 完成任务，结果已存入共享状态

--- 步骤 2: 写手 开始工作 ---
  [写手] 完成任务，结果已存入共享状态

--- 步骤 3: 审核员 开始工作 ---
  [审核员] 完成任务，结果已存入共享状态

============================================================
架构对比总结
============================================================
维度       | 主从         | 对等         | 分层
--------------------------------------------------
复杂度     | 低           | 中           | 高
扩展性     | 中           | 高           | 高
容错性     | 低           | 高           | 中
适用场景   | 流程化任务   | 创意讨论     | 大型项目
```

## ⚠️ 常见错误与解决方案

| # | 问题 | 原因 | 解决方案 |
|---|------|------|---------|
| 1 | Agent 间消息丢失 | 消息总线未正确订阅 | 确保 Agent 初始化时调用 `subscribe` |
| 2 | 共享状态竞争 | 多 Agent 同时写入 | 使用 `lock/unlock` 机制 |
| 3 | 死锁 | 循环等待资源释放 | 设置超时和死锁检测 |
| 4 | 协调器瓶颈 | 所有任务经过协调器 | 考虑分布式架构或并行处理 |
| 5 | 状态不一致 | 读写顺序问题 | 使用事务或版本控制 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| 主从架构 | 一个 Supervisor 协调多个 Worker Agent |
| 对等架构 | Agent 间平等协作，无中心节点 |
| 分层架构 | 多级管理，逐层分解任务 |
| 消息总线 | Agent 间通信的中介，负责消息路由 |
| 共享状态 | 多个 Agent 可以读写的数据存储 |
| 心跳 | Agent 定期发送的存活信号 |
| 死锁 | 多个 Agent 互相等待对方释放资源 |

## 🏋️ 每日挑战

### 挑战 1：添加心跳检测（难度：⭐）

在消息总线中实现心跳检测：Agent 定期发送心跳，如果 30 秒没有收到心跳，标记为离线。

### 挑战 2：并行执行（难度：⭐⭐）

修改流水线协调器，让独立的任务可以并行执行（使用 Python `asyncio` 或 `threading`）。

### 挑战 3：错误恢复（难度：⭐⭐⭐）

实现错误恢复机制：如果某个 Agent 失败，协调器能重新分配任务或跳过该步骤继续执行。

### 挑战 4：性能监控（难度：⭐⭐⭐）

添加性能监控系统：记录每个 Agent 的处理时间、成功率、消息吞吐量等指标。

## ✅ 验收清单

- [ ] 能说出四种架构模式的优缺点
- [ ] 能实现消息总线和 Agent 间通信
- [ ] 能管理多 Agent 共享状态
- [ ] 能构建流水线和层级式协调器
- [ ] 理解锁机制防止状态竞争
- [ ] 代码能正确运行并输出预期结果

## 📝 复盘小纸条

- 今天最大的收获: ...
- 还不太确定的: ...
