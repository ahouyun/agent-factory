# 📅 Week 6 Day 3：LangGraph 状态机：节点 + 边 + 条件路由

## 🧭 今日方向
> LangGraph 是 LangChain 的"大脑"——用图结构描述复杂的工作流。今天掌握状态机的核心概念：节点（做什么）、边（怎么走）、条件路由（根据情况选择路径）。

## 🎯 生乐比喻
> LangGraph 就像一个"智能导航系统"。节点是地图上的城市（每个城市做一件事），边是道路（从 A 到 B 的路径），条件路由是"根据天气选择走高速还是国道"。整个系统根据当前状态决定下一步去哪里。

## 📋 今日三件事
1. 理解 LangGraph 的核心概念：State、Node、Edge、Conditional Edge
2. 用 LangGraph 构建一个带条件分支的简单工作流
3. 实现一个循环式的 Agent 工作流

## 🗺️ 手把手路线

### Step 1: LangGraph 架构
- 做什么: 理解 StateGraph、节点、边的关系
- 为什么: 这是 LangGraph 的思维模型
- 成功标志: 能画出一个简单的状态图

### Step 2: 带条件路由的工作流
- 做什么: 实现一个根据输入决定走不同路径的 Graph
- 为什么: 条件路由是 Agent 决策的基础
- 成功标志: Graph 能根据条件选择不同分支

### Step 3: 循环式 Agent
- 做什么: 实现一个能循环执行直到完成的 Agent
- 为什么: Agent 的核心特征就是能自主循环决策
- 成功标志: Agent 能自动循环直到任务完成

## 💻 代码区

```python
"""
Week 6 Day 3: LangGraph 状态机
安装依赖: pip install langgraph langchain langchain-openai
"""

from typing import TypedDict, Annotated, List, Literal
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

# ========== 1. LangGraph 核心概念 ==========
print("=== 1. LangGraph 基础 ===")

# 定义状态（State）：图中流动的数据结构
class SimpleState(TypedDict):
    input: str              # 用户输入
    processed: str          # 处理后的结果
    step_count: int         # 步骤计数
    is_complete: bool       # 是否完成

# 定义节点（Node）：每个节点是一个处理函数
def process_input(state: SimpleState):
    """节点 1: 处理输入"""
    print(f"  [节点1] 处理输入: {state['input']}")
    return {
        "processed": state["input"].upper(),
        "step_count": state.get("step_count", 0) + 1
    }

def enrich_result(state: SimpleState):
    """节点 2: 丰富结果"""
    print(f"  [节点2] 丰富结果")
    return {
        "processed": state["processed"] + " [已丰富]",
        "step_count": state["step_count"] + 1
    }

def finalize(state: SimpleState):
    """节点 3: 最终处理"""
    print(f"  [节点3] 最终处理")
    return {
        "processed": state["processed"] + " [已完成]",
        "is_complete": True,
        "step_count": state["step_count"] + 1
    }

# 构建图
graph = StateGraph(SimpleState)

# 添加节点
graph.add_node("process", process_input)
graph.add_node("enrich", enrich_result)
graph.add_node("finalize", finalize)

# 设置入口
graph.set_entry_point("process")

# 添加边（Edge）：定义节点间的连接
graph.add_edge("process", "enrich")
graph.add_edge("enrich", "finalize")
graph.add_edge("finalize", END)

# 编译图
app = graph.compile()

# 运行
print("--- 运行简单线性图 ---")
result = app.invoke({
    "input": "hello langgraph",
    "step_count": 0,
    "is_complete": False
})
print(f"最终结果: {result}\n")

# ========== 2. 条件路由 ==========
print("=== 2. 条件路由 ===")

class RouterState(TypedDict):
    input: str
    category: str
    response: str
    step_count: int

def classify_input(state: RouterState):
    """节点: 分类输入"""
    text = state["input"].lower()
    if any(word in text for word in ["价格", "多少钱", "费用"]):
        category = "pricing"
    elif any(word in text for word in ["bug", "错误", "报错"]):
        category = "support"
    else:
        category = "general"
    print(f"  [分类] 类别: {category}")
    return {"category": category, "step_count": state.get("step_count", 0) + 1}

def handle_pricing(state: RouterState):
    """节点: 处理价格咨询"""
    return {"response": "我们的产品价格从 99 元起。"}

def handle_support(state: RouterState):
    """节点: 处理技术支持"""
    return {"response": "请描述您遇到的问题，我们会尽快处理。"}

def handle_general(state: RouterState):
    """节点: 处理一般咨询"""
    return {"response": "感谢您的咨询，我们会尽快回复。"}

def route_by_category(state: RouterState) -> Literal["pricing", "support", "general"]:
    """条件路由函数：根据类别选择路径"""
    return state["category"]

# 构建带条件路由的图
router_graph = StateGraph(RouterState)

router_graph.add_node("classify", classify_input)
router_graph.add_node("pricing", handle_pricing)
router_graph.add_node("support", handle_support)
router_graph.add_node("general", handle_general)

router_graph.set_entry_point("classify")

# 条件边：根据 classify 节点的输出选择路径
router_graph.add_conditional_edges(
    "classify",                    # 源节点
    route_by_category,             # 路由函数
    {                              # 路由映射
        "pricing": "pricing",
        "support": "support",
        "general": "general"
    }
)

# 所有处理节点都指向 END
router_graph.add_edge("pricing", END)
router_graph.add_edge("support", END)
router_graph.add_edge("general", END)

router_app = router_graph.compile()

# 测试不同路径
test_inputs = [
    "这个产品多少钱？",
    "我的代码报错了",
    "你们公司是做什么的？"
]

for input_text in test_inputs:
    print(f"\n输入: {input_text}")
    result = router_app.invoke({"input": input_text, "category": "", "response": "", "step_count": 0})
    print(f"响应: {result['response']}")

# ========== 3. 循环式 Agent ==========
print("\n=== 3. 循环式 Agent ===")

from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

@tool
def search_info(query: str) -> str:
    """搜索信息"""
    mock_data = {
        "python": "Python 是最流行的编程语言之一",
        "agent": "AI Agent 是能自主决策的智能体",
        "rag": "RAG 是检索增强生成技术",
    }
    for key, value in mock_data.items():
        if key in query.lower():
            return value
    return "未找到相关信息"

class AgentState(TypedDict):
    messages: Annotated[List, "对话历史"]
    tool_results: List[str]
    iteration: int
    is_done: bool

def agent_think(state: AgentState):
    """节点: Agent 思考"""
    messages = state["messages"]
    response = llm.invoke(messages)
    print(f"  [思考] {response.content[:100]}...")
    return {
        "messages": messages + [response],
        "iteration": state.get("iteration", 0) + 1
    }

def agent_decide(state: AgentState):
    """节点: Agent 决定是否需要工具"""
    last_message = state["messages"][-1]
    # 简单判断：如果包含"搜索"、"查询"等关键词，使用工具
    content = last_message.content if hasattr(last_message, "content") else str(last_message)
    need_tool = any(word in content for word in ["搜索", "查询", "查找", "不知道"])
    return {"is_done": not need_tool}

def agent_tool_use(state: AgentState):
    """节点: 使用工具"""
    last_message = state["messages"][-1]
    content = last_message.content if hasattr(last_message, "content") else str(last_message)
    result = search_info.invoke({"query": content})
    print(f"  [工具] 结果: {result}")
    return {
        "tool_results": state.get("tool_results", []) + [result],
        "messages": state["messages"] + [HumanMessage(content=f"工具搜索结果: {result}")]
    }

def should_use_tool(state: AgentState) -> Literal["tool", "end"]:
    """条件路由: 根据 is_done 决定"""
    if state.get("is_done", False):
        return "end"
    if state.get("iteration", 0) >= 3:
        return "end"
    return "tool"

# 构建循环 Agent 图
agent_graph = StateGraph(AgentState)

agent_graph.add_node("think", agent_think)
agent_graph.add_node("decide", agent_decide)
agent_graph.add_node("tool", agent_tool_use)

agent_graph.set_entry_point("think")
agent_graph.add_edge("think", "decide")
agent_graph.add_conditional_edges(
    "decide",
    should_use_tool,
    {"tool": "tool", "end": END}
)
agent_graph.add_edge("tool", "think")  # 工具使用后回到思考

agent_app = agent_graph.compile()

# 运行
print("--- 运行循环 Agent ---")
result = agent_app.invoke({
    "messages": [HumanMessage(content="帮我搜索 Python 的信息")],
    "tool_results": [],
    "iteration": 0,
    "is_done": False
})
print(f"\n迭代次数: {result['iteration']}")
print(f"最终消息: {result['messages'][-1].content[:200]}")

# ========== 4. 图可视化 ==========
print("\n=== 4. 图结构信息 ===")

# 获取图的节点和边信息
print("节点:", list(graph.get_graph().nodes))
print("边:", [(e.source, e.target) for e in graph.get_graph().edges])

# 导出为 Mermaid 格式（可在 Mermaid Live 中查看）
try:
    mermaid_code = app.get_graph().draw_mermaid()
    print(f"\nMermaid 代码:\n{mermaid_code}")
except Exception as e:
    print(f"Mermaid 导出需要安装 graphviz: {e}")

print("""
=== LangGraph 核心概念速查 ===

| 概念 | 说明 | 类比 |
|------|------|------|
| State | 图中流动的数据 | 传送带上的包裹 |
| Node | 处理函数 | 工作站 |
| Edge | 节点间的连接 | 传送带 |
| Conditional Edge | 根据条件选择路径 | 分拣机 |
| Entry Point | 图的起始节点 | 仓库入口 |
| END | 图的终止节点 | 出口 |

使用场景:
1. 线性流程: 简单的 A → B → C
2. 条件分支: 根据输入走不同路径
3. 循环处理: Agent 多轮思考和工具调用
4. 并行处理: 多个任务同时执行
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | `langgraph` 导入失败 | `pip install langgraph`，确保版本 >= 0.2 |
| 2 | State 类型错误 | 确保 TypedDict 中字段类型正确 |
| 3 | 条件路由不生效 | 检查路由函数的返回值是否与映射键匹配 |
| 4 | 图陷入无限循环 | 添加迭代次数限制或终止条件 |
| 5 | 节点输入输出不匹配 | 检查前一个节点的输出是否包含下一个节点需要的字段 |
| 6 | 无法可视化图 | 安装 graphviz：`pip install graphviz` |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| StateGraph | LangGraph 的核心类，定义状态和图结构 |
| State | 图中流动的数据结构，用 TypedDict 定义 |
| Node | 图中的处理节点，接收 State 并返回更新 |
| Edge | 节点间的无条件连接 |
| Conditional Edge | 根据运行时状态选择不同路径的连接 |
| Entry Point | 图的起始执行节点 |
| END | 图的终止标记 |
| 路由函数 | 决定下一步走哪个节点的函数 |
| 状态更新 | 节点返回的字典会合并到 State 中 |
| 图编译 | `compile()` 将图结构编译为可执行对象 |

## ✅ 验收清单
- [ ] 能定义 TypedDict 作为图的 State
- [ ] 能用 `add_node` 和 `add_edge` 构建线性图
- [ ] 能用 `add_conditional_edges` 实现条件路由
- [ ] 理解路由函数的返回值如何决定路径
- [ ] 能构建循环式的 Agent 工作流
- [ ] 能说出 StateGraph 的完整生命周期

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
