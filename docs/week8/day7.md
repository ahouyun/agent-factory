# 📅 Week 8 Day 7：复盘

## 🧭 今日方向
> 回顾 Week 8（Protocols + Multi-Agent）的全部内容，梳理知识脉络，查漏补缺。

## 🎯 生活比喻
> 复盘就像"拆解乐高"。把 Week 8 搭建的复杂结构拆开，看看每个零件（协议、架构、框架）是怎么工作的，下次搭建时就能更快更好。

## 📋 今日三件事
1. 回顾 Week 8 六天的核心知识点
2. 完成综合练习：多 Agent 协作项目
3. 整理代码片段和笔记

## 🗺️ 手把手路线

### Step 1: 知识回顾
- 做什么: 用思维导图整理 Week 8 的知识脉络
- 为什么: 系统化记忆更有效
- 成功标志: 能画出完整的知识图谱

### Step 2: 综合练习
- 做什么: 构建一个多 Agent 协作系统
- 为什么: 综合练习检验真实掌握程度
- 成功标志: 完整项目能跑通

### Step 3: 笔记整理
- 做什么: 整理代码片段和最佳实践
- 为什么: 好的笔记是未来的加速器
- 成功标志: 有一个可复用的参考文档

## 💻 代码区

```python
"""
Week 8 Day 7: 综合练习 - 多 Agent 研讨会
综合 Week 8 所学：协议 + 架构 + Handoff + CrewAI
"""

from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# ========== 1. 多 Agent 研讨会场景 ==========
print("=== 多 Agent 研讨会 ===")

print("""
场景：技术方案评审会

参与者:
1. Architect (架构师): 评估技术可行性
2. Developer (开发者): 评估实现难度
3. PM (产品经理): 评估业务价值
4. Moderator (主持人): 协调讨论，汇总结论

流程:
提案 → 架构评估 → 开发评估 → 业务评估 → 主持人汇总
""")

# ========== 2. 定义状态 ==========
class WorkshopState(TypedDict):
    proposal: str
    architect_view: str
    developer_view: str
    pm_view: str
    conclusion: str
    discussion_round: int

# ========== 3. 定义 Agent 节点 ==========
def architect_assess(state: WorkshopState):
    """架构师评估"""
    prompt = f"""作为架构师，请从技术可行性角度评估以下提案：

提案：{state['proposal']}

请评估：
1. 技术可行性
2. 架构设计建议
3. 潜在风险

请给出专业意见。"""

    response = llm.invoke([HumanMessage(content=prompt)])
    return {"architect_view": response.content}

def developer_assess(state: WorkshopState):
    """开发者评估"""
    prompt = f"""作为开发者，请从实现难度角度评估以下提案：

提案：{state['proposal']}

架构师意见：{state['architect_view']}

请评估：
1. 实现复杂度
2. 所需资源
3. 开发周期

请给出专业意见。"""

    response = llm.invoke([HumanMessage(content=prompt)])
    return {"developer_view": response.content}

def pm_assess(state: WorkshopState):
    """产品经理评估"""
    prompt = f"""作为产品经理，请从业务价值角度评估以下提案：

提案：{state['proposal']}

技术评估：{state['architect_view']}
实现评估：{state['developer_view']}

请评估：
1. 业务价值
2. 用户需求匹配度
3. ROI 预估

请给出专业意见。"""

    response = llm.invoke([HumanMessage(content=prompt)])
    return {"pm_view": response.content}

def moderator_conclude(state: WorkshopState):
    """主持人汇总"""
    prompt = f"""作为主持人，请汇总各位专家的意见，给出最终结论。

提案：{state['proposal']}

架构师意见：{state['architect_view']}
开发者意见：{state['developer_view']}
产品经理意见：{state['pm_view']}

请：
1. 总结各方观点
2. 找出共识和分歧
3. 给出最终建议
4. 列出后续行动项"""

    response = llm.invoke([HumanMessage(content=prompt)])
    return {
        "conclusion": response.content,
        "discussion_round": state.get("discussion_round", 0) + 1
    }

# ========== 4. 构建工作流 ==========
workflow = StateGraph(WorkshopState)

workflow.add_node("architect", architect_assess)
workflow.add_node("developer", developer_assess)
workflow.add_node("pm", pm_assess)
workflow.add_node("moderator", moderator_conclude)

workflow.set_entry_point("architect")
workflow.add_edge("architect", "developer")
workflow.add_edge("developer", "pm")
workflow.add_edge("pm", "moderator")
workflow.add_edge("moderator", END)

app = workflow.compile()

# ========== 5. 运行研讨会 ==========
print("\n--- 运行研讨会 ---")
result = app.invoke({
    "proposal": "构建一个基于 RAG 的企业知识库系统，支持多模态检索和智能问答。",
    "architect_view": "",
    "developer_view": "",
    "pm_view": "",
    "conclusion": "",
    "discussion_round": 0
})

print(f"\n提案: {result['proposal']}")
print(f"\n架构师评估:\n{result['architect_view'][:200]}...")
print(f"\n开发者评估:\n{result['developer_view'][:200]}...")
print(f"\n产品经理评估:\n{result['pm_view'][:200]}...")
print(f"\n最终结论:\n{result['conclusion'][:300]}...")

# ========== 6. 知识回顾清单 ==========
print("\n=== Week 8 知识回顾 ===")

knowledge_checklist = {
    "Day 1: MCP": [
        "理解 MCP 三层架构",
        "能区分 Tools/Resources/Prompts",
        "能实现简单的 MCP Server",
        "理解 stdio/SSE 传输模式",
    ],
    "Day 2: A2A + NLWeb": [
        "理解三大协议的定位",
        "理解 A2A 的 Agent Card",
        "理解 NLWeb 的工作原理",
        "能根据场景选择协议",
    ],
    "Day 3: 多 Agent 架构": [
        "理解主从/对等/分层架构",
        "能实现 Supervisor Agent",
        "能模拟对等讨论",
        "能构建分层执行结构",
    ],
    "Day 4: Handoff": [
        "能设计 HandoffPackage",
        "能实现 Agent 间任务交接",
        "能实现条件 Handoff",
        "能构建跟踪系统",
    ],
    "Day 5: CrewAI": [
        "理解 Agent/Task/Crew/Process",
        "能定义 Agent 角色和目标",
        "能创建和运行 Crew",
        "理解 CrewAI vs LangGraph",
    ],
    "Day 6: Demo": [
        "能设计多 Agent 场景",
        "能实现意图分类和路由",
        "能构建 Supervisor 质量控制",
        "能记录和分析执行路径",
    ],
}

for day, items in knowledge_checklist.items():
    print(f"\n{day}:")
    for item in items:
        print(f"  [ ] {item}")

print("""
=== Week 8 核心概念速查 ===

| 概念 | 一句话解释 |
|------|-----------|
| MCP | LLM 与工具的通信标准 |
| A2A | Agent 间通信标准 |
| NLWeb | 自然语言 Web 接口标准 |
| 主从架构 | 一个 Supervisor 协调多个 Worker |
| 对等架构 | Agent 间平等协作 |
| 分层架构 | 多级管理，逐层分解 |
| Handoff | Agent 间的任务交接机制 |
| CrewAI | 角色驱动的多 Agent 框架 |
| Agent Card | A2A 中 Agent 的"名片" |
""")

print("""
=== 下周预告 ===
Week 9 将学习:
- 项目选型 + 技术方案设计
- 后端骨架搭建
- RAG 检索服务集成
- Agent 核心逻辑
- 安全层集成
- 端到端联调
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 知识点混淆 | 用对比表格区分相似概念 |
| 2 | 综合练习报错 | 逐步调试，确保每个模块正常 |
| 3 | 不知道选哪个框架 | 根据场景需求和团队熟悉度决定 |

## 📖 Week 8 核心概念速查

| 概念 | 一句话解释 |
|------|-----------|
| MCP | LLM ↔ 工具的通信标准 |
| A2A | Agent ↔ Agent 的通信标准 |
| NLWeb | LLM ↔ Web 的通信标准 |
| 多 Agent 架构 | 主从/对等/分层三种模式 |
| Handoff | Agent 间的任务交接 |
| CrewAI | 角色驱动的多 Agent 框架 |

## ✅ 验收清单
- [ ] 能完成知识回顾清单中的所有项目
- [ ] 综合练习代码能正常运行
- [ ] 能说出 Week 8 每天的核心知识点
- [ ] 代码片段已整理到个人笔记
- [ ] 对 Week 9 的内容有基本了解

## 📝 复盘小纸条
- 本周最大的收获: ...
- 还不太确定的: ...
- 下周学习重点: ...

## 📥 明日同步接口
- 本周完成度: ...
- 主要卡点: ...
- 代码仓库状态: ...
- 下周期望: ...
