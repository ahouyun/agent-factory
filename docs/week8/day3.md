# 📅 Week 8 Day 3：多 Agent 架构设计：主从 / 对等 / 分层

## 🧭 今日方向
> 单个 Agent 能力有限，多个 Agent 协作能完成更复杂的任务。今天学习三种经典的多 Agent 架构模式：主从、对等、分层，理解各自的优缺点和适用场景。

## 🎯 生活比喻
> 三种架构就像三种团队组织方式：
> - **主从架构** = 项目经理 + 执行团队（一个领导，多个执行者）
> - **对等架构** = 开源社区（没有领导，大家平等协作）
> - **分层架构** = 公司组织（CEO → VP → Manager → Engineer）

## 📋 今日三件事
1. 理解三种多 Agent 架构的设计思想
2. 实现主从架构的 Supervisor Agent
3. 对比三种架构的优缺点

## 🗺️ 手把手路线

### Step 1: 架构设计原则
- 做什么: 理解多 Agent 系统的设计考量
- 为什么: 架构决定了系统的可扩展性和维护性
- 成功标志: 能说出选择架构的关键因素

### Step 2: 主从架构实现
- 做什么: 用 LangGraph 实现 Supervisor + Worker 模式
- 为什么: 这是最常用的多 Agent 模式
- 成功标志: Supervisor 能正确分配和汇总任务

### Step 3: 架构对比
- 做什么: 制作三种架构的对比表格
- 为什么: 理解差异才能正确选型
- 成功标志: 能根据场景推荐合适的架构

## 💻 代码区

```python
"""
Week 8 Day 3: 多 Agent 架构设计
安装依赖: pip install langgraph langchain langchain-openai
"""

from typing import TypedDict, List, Literal, Annotated
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# ========== 1. 多 Agent 架构概览 ==========
print("=== 1. 多 Agent 架构概览 ===")

print("""
三种经典架构:

1. 主从架构 (Supervisor):
   ┌─────────────┐
   │  Supervisor  │  ← 决策中心
   └──────┬──────┘
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
  Agent1 Agent2 Agent3  ← 执行者

2. 对等架构 (Peer-to-Peer):
   Agent1 ←→ Agent2
     ↕         ↕
   Agent3 ←→ Agent4

3. 分层架构 (Hierarchical):
        CEO
       /    \
     VP1    VP2
    / \    / \
  M1  M2  M3  M4

选择因素:
- 任务复杂度
- 通信频率
- 扩展需求
- 容错要求
""")

# ========== 2. 主从架构实现 ==========
print("=== 2. 主从架构 (Supervisor) ===")

class SupervisorState(TypedDict):
    task: str
    plan: List[str]
    agent_results: dict
    final_result: str
    current_agent: str

def supervisor_plan(state: SupervisorState):
    """Supervisor 制定计划"""
    prompt = f"""你是项目负责人。请分析以下任务，制定执行计划。

任务：{state['task']}

请列出需要执行的步骤，每步分配给一个专家：
1. researcher: 负责信息收集
2. writer: 负责内容撰写
3. reviewer: 负责质量审查

以 JSON 格式返回：{{"steps": [{{"agent": "xxx", "action": "xxx"}}]}}"""

    response = llm.invoke([HumanMessage(content=prompt)])
    try:
        import json
        plan_data = json.loads(response.content)
        plan = [f"{s['agent']}: {s['action']}" for s in plan_data.get("steps", [])]
    except:
        plan = ["researcher: 收集信息", "writer: 撰写内容"]

    return {"plan": plan}

def researcher_agent(state: SupervisorState):
    """研究员 Agent"""
    task = state["task"]
    prompt = f"作为研究员，请收集关于以下任务的信息：{task}"
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"agent_results": {**state.get("agent_results", {}), "researcher": response.content}}

def writer_agent(state: SupervisorState):
    """撰稿人 Agent"""
    task = state["task"]
    research = state.get("agent_results", {}).get("researcher", "")
    prompt = f"基于以下研究结果，撰写关于 '{task}' 的内容：\n{research}"
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"agent_results": {**state.get("agent_results", {}), "writer": response.content}}

def reviewer_agent(state: SupervisorState):
    """审查员 Agent"""
    content = state.get("agent_results", {}).get("writer", "")
    prompt = f"请审查以下内容的质量，给出修改建议：\n{content}"
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"agent_results": {**state.get("agent_results", {}), "reviewer": response.content}}

def supervisor_summarize(state: SupervisorState):
    """Supervisor 汇总结果"""
    results = state.get("agent_results", {})
    prompt = f"""基于各专家的工作结果，汇总最终输出。

任务：{state['task']}

研究员结果：{results.get('researcher', '无')}
撰稿人结果：{results.get('writer', '无')}
审查员结果：{results.get('reviewer', '无')}"""

    response = llm.invoke([HumanMessage(content=prompt)])
    return {"final_result": response.content}

# 构建主从架构图
supervisor_graph = StateGraph(SupervisorState)

supervisor_graph.add_node("plan", supervisor_plan)
supervisor_graph.add_node("research", researcher_agent)
supervisor_graph.add_node("write", writer_agent)
supervisor_graph.add_node("review", reviewer_agent)
supervisor_graph.add_node("summarize", supervisor_summarize)

supervisor_graph.set_entry_point("plan")
supervisor_graph.add_edge("plan", "research")
supervisor_graph.add_edge("research", "write")
supervisor_graph.add_edge("write", "review")
supervisor_graph.add_edge("review", "summarize")
supervisor_graph.add_edge("summarize", END)

supervisor_app = supervisor_graph.compile()

# 测试
print("--- 测试主从架构 ---")
result = supervisor_app.invoke({
    "task": "编写一份关于 AI Agent 技术趋势的报告",
    "plan": [],
    "agent_results": {},
    "final_result": "",
    "current_agent": ""
})
print(f"任务: {result['task']}")
print(f"计划: {result['plan']}")
print(f"最终结果: {result['final_result'][:200]}...")

# ========== 3. 对等架构模拟 ==========
print("\n=== 3. 对等架构 (Peer-to-Peer) ===")

class PeerAgent:
    """对等 Agent"""

    def __init__(self, name: str, expertise: str):
        self.name = name
        self.expertise = expertise
        self.neighbors = []

    def connect(self, other: 'PeerAgent'):
        """连接到其他 Agent"""
        self.neighbors.append(other)
        other.neighbors.append(self)

    def discuss(self, topic: str, messages: List[dict] = None) -> dict:
        """参与讨论"""
        if messages is None:
            messages = []

        # 基于自己的专业知识贡献观点
        prompt = f"""你是一个{self.expertise}专家。

讨论主题：{topic}

已有讨论：
{chr(10).join([f'{m["agent"]}: {m["content"]}' for m in messages[-3:]])}

请基于你的专业角度发表观点（100字以内）。"""

        response = llm.invoke([HumanMessage(content=prompt)])
        return {"agent": self.name, "content": response.content}

class PeerNetwork:
    """对等网络"""

    def __init__(self):
        self.agents = []

    def add_agent(self, agent: PeerAgent):
        """添加 Agent"""
        self.agents.append(agent)
        # 自动连接到现有 Agent
        for existing in self.agents[:-1]:
            agent.connect(existing)

    def group_discussion(self, topic: str, rounds: int = 2) -> List[dict]:
        """群组讨论"""
        all_messages = []

        for round_num in range(rounds):
            print(f"\n--- 讨论第 {round_num + 1} 轮 ---")
            for agent in self.agents:
                result = agent.discuss(topic, all_messages)
                all_messages.append(result)
                print(f"  {result['agent']}: {result['content'][:80]}...")

        return all_messages

# 创建对等网络
network = PeerNetwork()
network.add_agent(PeerAgent("Alice", "技术架构"))
network.add_agent(PeerAgent("Bob", "产品设计"))
network.add_agent(PeerAgent("Charlie", "用户体验"))

# 进行讨论
print("--- 对等架构讨论 ---")
messages = network.group_discussion("如何设计一个好的 AI Agent 产品", rounds=1)

# ========== 4. 分层架构模拟 ==========
print("\n=== 4. 分层架构 (Hierarchical) ===")

class HierarchicalAgent:
    """分层 Agent"""

    def __init__(self, name: str, level: int, role: str):
        self.name = name
        self.level = level
        self.role = role
        self.subordinates = []

    def add_subordinate(self, agent: 'HierarchicalAgent'):
        """添加下属"""
        self.subordinates.append(agent)

    def delegate(self, task: str) -> dict:
        """委派任务"""
        if not self.subordinates:
            # 叶子节点，直接执行
            prompt = f"作为{self.role}，请执行以下任务：{task}"
            response = llm.invoke([HumanMessage(content=prompt)])
            return {self.name: response.content}

        # 分解任务给下属
        results = {}
        for i, subordinate in enumerate(self.subordinates):
            sub_task = f"任务的第 {i+1} 部分：{task}"
            sub_result = subordinate.delegate(sub_task)
            results.update(sub_result)

        return results

# 创建分层结构
ceo = HierarchicalAgent("CEO", 0, "决策者")
vp_eng = HierarchicalAgent("VP_Engineering", 1, "技术副总裁")
vp_product = HierarchicalAgent("VP_Product", 1, "产品副总裁")
dev1 = HierarchicalAgent("Dev1", 2, "开发工程师")
dev2 = HierarchicalAgent("Dev2", 2, "开发工程师")
pm = HierarchicalAgent("PM", 2, "产品经理")

# 建立层级关系
ceo.add_subordinate(vp_eng)
ceo.add_subordinate(vp_product)
vp_eng.add_subordinate(dev1)
vp_eng.add_subordinate(dev2)
vp_product.add_subordinate(pm)

# 执行任务
print("--- 分层架构执行 ---")
result = ceo.delegate("开发一个新的 AI Agent 功能")
print(f"最终结果: {result}")

# ========== 5. 架构对比 ==========
print("\n=== 5. 架构对比 ===")

comparison = {
    "维度": ["复杂度", "扩展性", "容错性", "通信开销", "适用场景"],
    "主从架构": ["低", "中", "低", "低", "流程化任务"],
    "对等架构": ["中", "高", "高", "高", "创意讨论"],
    "分层架构": ["高", "高", "中", "中", "大型项目"],
}

print("\n架构对比表:")
print("="*60)
for i, dim in enumerate(comparison["维度"]):
    sup = comparison["主从架构"][i]
    peer = comparison["对等架构"][i]
    hier = comparison["分层架构"][i]
    print(f"{dim:10} | 主从: {sup:6} | 对等: {peer:6} | 分层: {hier:6}")

print("""
=== 架构选型指南 ===

1. 主从架构适合:
   - 任务流程固定
   - 需要统一调度
   - 团队规模较小

2. 对等架构适合:
   - 需要多角度思考
   - 创意讨论
   - 去中心化场景

3. 分层架构适合:
   - 大型复杂项目
   - 需要多级管理
   - 资源分配复杂

混合架构:
- 实际项目常混合使用
- 核心流程用主从
- 创意环节用对等
- 大规模用分层
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | Agent 间通信混乱 | 定义清晰的消息格式和协议 |
| 2 | Supervisor 决策失误 | 优化 System Prompt，增加示例 |
| 3 | 对等讨论跑题 | 添加主持人角色或讨论规则 |
| 4 | 分层架构太复杂 | 简化层级，减少中间管理层 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| 主从架构 | 一个 Supervisor 协调多个 Worker Agent |
| 对等架构 | Agent 间平等协作，无中心节点 |
| 分层架构 | 多级管理，逐层分解任务 |
| Supervisor | 主从架构中的决策和协调者 |
| Worker | 主从架构中的任务执行者 |
| Agent 网络 | 对等架构中 Agent 的连接关系 |
| 任务分解 | 将复杂任务拆分为子任务 |
| 结果汇总 | 收集各 Agent 的结果并整合 |

## ✅ 验收清单
- [ ] 能说出三种架构的核心特点
- [ ] 能实现 Supervisor Agent
- [ ] 能模拟对等网络讨论
- [ ] 能构建分层执行结构
- [ ] 能根据场景选择合适的架构
- [ ] 理解混合架构的设计思路

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
