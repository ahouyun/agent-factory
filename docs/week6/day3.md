# 📅 Week 6 Day 3：LangGraph 状态机

## 🧭 今日方向
> 理解 LangGraph 的核心概念——状态机、节点、边、条件分支，并用它构建一个简单的聊天机器人和一个 ReAct Agent。LangGraph 是 LangChain 的"大脑"，让你用图结构描述复杂的工作流，实现循环、分支、条件路由等线性 Chain 无法做到的逻辑。

## 🎯 生活比喻
> 想象你在一个迷宫里。迷宫有多个房间（节点），房间之间有走廊（边）连接。你在迷宫中的位置和携带的物品就是"状态"。你在每个房间可以做不同的事情（节点逻辑），根据你的判断选择走哪条走廊（条件边）。LangGraph 就是这样一个"迷宫框架"——帮你在 LLM 应用中管理这种复杂的流程控制，让 Agent 能自主决策、循环思考、动态路由。

## 📋 今日三件事
1. 理解 LangGraph 的核心概念：StateGraph、节点、边、条件边
2. 用 TypedDict 管理状态，实现带条件分支的聊天机器人
3. 用 LangGraph 实现 ReAct Agent（思考-行动-观察循环）

## 🗺️ 手把手路线

### Step 1：理解为什么需要 LangGraph
- **做什么**: 对比线性 Chain 和有状态图的区别，了解 LangGraph 解决什么问题
- **为什么**: 知道问题才能理解解决方案
- **成功标志**: 能说出 3 个线性 Chain 无法处理的场景（循环、条件分支、多路径）

### Step 2：掌握 StateGraph 的基本构建
- **做什么**: 学习创建 State（TypedDict）、定义节点、连接边、编译运行
- **为什么**: 这是 LangGraph 的基础操作，所有复杂图都建立在此之上
- **成功标志**: 能用 LangGraph 画出一个简单的流程图并编译运行

### Step 3：实现 ReAct Agent
- **做什么**: 用 LangGraph 实现一个能思考-行动-观察的 Agent
- **为什么**: ReAct 是最经典的 Agent 模式，理解它就理解了 Agent 的核心
- **成功标志**: Agent 能自主决定使用工具、观察结果、继续推理直到得出答案

## 💻 代码区

### 示例 1：LangGraph 基础概念

```python
"""
LangGraph 基础概念演示
StateGraph、节点、边、条件边

安装依赖: pip install langgraph langchain langchain-openai
"""
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, START, END
import operator


# ========== 1. 定义状态 ==========
# 使用 TypedDict 定义状态结构
# 每个字段代表状态的一部分，在图执行过程中流动和更新
class AgentState(TypedDict):
    """Agent 的状态 —— 贯穿整个图的数据结构"""
    # Annotated + operator.add 表示这个字段是"追加模式"
    # 每次节点返回新值时，会追加到列表中，而不是覆盖
    messages: Annotated[List[str], operator.add]
    # 当前步骤计数（每次节点处理时 +1）
    step_count: int
    # 是否完成标志
    is_done: bool


# ========== 2. 定义节点 ==========
# 节点是处理函数，接收当前状态，返回状态更新（只返回需要更新的字段）

def greet_node(state: AgentState) -> dict:
    """节点 1：问候 —— 生成问候消息"""
    return {
        "messages": ["你好！我是你的 AI 助手，很高兴为你服务。"],
        "step_count": state["step_count"] + 1
    }


def think_node(state: AgentState) -> dict:
    """节点 2：思考 —— 分析用户需求"""
    return {
        "messages": ["让我思考一下你的问题..."],
        "step_count": state["step_count"] + 1
    }


def respond_node(state: AgentState) -> dict:
    """节点 3：回复 —— 生成最终回复"""
    return {
        "messages": ["根据分析，我的回答是：这是一个很好的问题！"],
        "step_count": state["step_count"] + 1,
        "is_done": True
    }


# ========== 3. 构建状态图 ==========
# 创建图实例，传入状态类型
graph = StateGraph(AgentState)

# 添加节点（名称 + 处理函数）
graph.add_node("greet", greet_node)
graph.add_node("think", think_node)
graph.add_node("respond", respond_node)

# 添加边（定义节点之间的连接关系）
graph.add_edge(START, "greet")       # 起点 → 问候
graph.add_edge("greet", "think")     # 问候 → 思考
graph.add_edge("think", "respond")   # 思考 → 回复
graph.add_edge("respond", END)       # 回复 → 结束

# 编译图（生成可执行的对象）
app = graph.compile()


# ========== 4. 执行图 ==========
# 初始状态
initial_state = {
    "messages": [],       # 空消息列表
    "step_count": 0,      # 步骤计数从 0 开始
    "is_done": False      # 尚未完成
}

# 运行图
result = app.invoke(initial_state)

# 输出结果
print("=== 执行结果 ===")
print(f"消息历史 ({len(result['messages'])} 条):")
for i, msg in enumerate(result["messages"], 1):
    print(f"  {i}. {msg}")
print(f"总步骤数: {result['step_count']}")
print(f"是否完成: {result['is_done']}")
```

**预期输出：**
```
=== 执行结果 ===
消息历史 (3 条):
  1. 你好！我是你的 AI 助手，很高兴为你服务。
  2. 让我思考一下你的问题...
  3. 根据分析，我的回答是：这是一个很好的问题！
总步骤数: 3
是否完成: True
```

### 示例 2：带条件分支的聊天机器人

```python
"""
带条件分支的聊天机器人
根据用户意图选择不同的处理路径

流程: 用户输入 → 意图识别 → 条件路由 → 不同处理节点 → 结束
"""
from typing import TypedDict, Annotated, List, Literal
from langgraph.graph import StateGraph, START, END
import operator


class ChatState(TypedDict):
    """聊天状态"""
    messages: Annotated[List[dict], operator.add]  # 消息历史（追加模式）
    user_intent: str          # 识别到的用户意图
    response_count: int       # 回复计数


# ========== 节点定义 ==========

def classify_intent(state: ChatState) -> dict:
    """意图识别节点 —— 分析用户输入，判断意图类型"""
    last_message = state["messages"][-1]["content"] if state["messages"] else ""

    # 简单的关键词匹配（实际项目中用 LLM 或分类模型判断）
    if any(w in last_message for w in ["你好", "嗨", "hi", "hello"]):
        intent = "greeting"
    elif any(w in last_message for w in ["计算", "算", "多少", "乘"]):
        intent = "math"
    elif any(w in last_message for w in ["天气", "气温", "下雨", "温度"]):
        intent = "weather"
    else:
        intent = "general"

    return {
        "user_intent": intent,
        "messages": [{"role": "system", "content": f"识别到意图: {intent}"}]
    }


def handle_greeting(state: ChatState) -> dict:
    """处理问候 —— 返回友好的问候语"""
    return {
        "messages": [{"role": "assistant", "content": "你好！很高兴见到你！有什么我可以帮忙的吗？"}],
        "response_count": state["response_count"] + 1
    }


def handle_math(state: ChatState) -> dict:
    """处理数学问题 —— 调用计算器"""
    return {
        "messages": [{"role": "assistant", "content": "让我来帮你计算一下..."}],
        "response_count": state["response_count"] + 1
    }


def handle_weather(state: ChatState) -> dict:
    """处理天气查询 —— 调用天气 API"""
    return {
        "messages": [{"role": "assistant", "content": "让我查一下天气信息..."}],
        "response_count": state["response_count"] + 1
    }


def handle_general(state: ChatState) -> dict:
    """处理一般问题 —— 通用回复"""
    return {
        "messages": [{"role": "assistant", "content": "这是一个很好的问题，让我想想..."}],
        "response_count": state["response_count"] + 1
    }


# ========== 条件路由函数 ==========

def route_intent(state: ChatState) -> Literal["handle_greeting", "handle_math", "handle_weather", "handle_general"]:
    """
    条件路由：根据意图选择处理节点
    返回值必须是节点名称字符串
    """
    intent = state["user_intent"]
    route_map = {
        "greeting": "handle_greeting",
        "math": "handle_math",
        "weather": "handle_weather",
        "general": "handle_general"
    }
    return route_map.get(intent, "handle_general")


# ========== 构建图 ==========

graph = StateGraph(ChatState)

# 添加节点
graph.add_node("classify", classify_intent)
graph.add_node("handle_greeting", handle_greeting)
graph.add_node("handle_math", handle_math)
graph.add_node("handle_weather", handle_weather)
graph.add_node("handle_general", handle_general)

# 入口边
graph.add_edge(START, "classify")

# 条件边：从 classify 节点出发，根据路由函数选择不同路径
graph.add_conditional_edges(
    "classify",           # 源节点
    route_intent,         # 路由函数（决定去哪个节点）
    {                     # 路由映射（函数返回值 → 目标节点）
        "handle_greeting": "handle_greeting",
        "handle_math": "handle_math",
        "handle_weather": "handle_weather",
        "handle_general": "handle_general"
    }
)

# 所有处理节点都连接到结束
graph.add_edge("handle_greeting", END)
graph.add_edge("handle_math", END)
graph.add_edge("handle_weather", END)
graph.add_edge("handle_general", END)

# 编译
app = graph.compile()


# ========== 测试不同意图 ==========

test_messages = [
    [{"role": "user", "content": "你好！"}],
    [{"role": "user", "content": "帮我算一下 123 乘以 456"}],
    [{"role": "user", "content": "今天天气怎么样？"}],
    [{"role": "user", "content": "量子力学是什么？"}]
]

for msgs in test_messages:
    state = {
        "messages": msgs,
        "user_intent": "",
        "response_count": 0
    }
    result = app.invoke(state)
    print(f"用户: {msgs[0]['content']}")
    print(f"意图: {result['user_intent']}")
    # 获取最后一条 assistant 回复
    for msg in reversed(result["messages"]):
        if isinstance(msg, dict) and msg.get("role") == "assistant":
            print(f"回复: {msg['content']}")
            break
    print("-" * 40)
```

**预期输出：**
```
用户: 你好！
意图: greeting
回复: 你好！很高兴见到你！有什么我可以帮忙的吗？
----------------------------------------
用户: 帮我算一下 123 乘以 456
意图: math
回复: 让我来帮你计算一下...
----------------------------------------
用户: 今天天气怎么样？
意图: weather
回复: 让我查一下天气信息...
----------------------------------------
用户: 量子力学是什么？
意图: general
回复: 这是一个很好的问题，让我想想...
----------------------------------------
```

### 示例 3：ReAct Agent with LangGraph

```python
"""
ReAct Agent 实现
ReAct = Reasoning + Acting（推理 + 行动）

核心循环: 思考 → 行动 → 观察 → 思考 → ... → 最终回答

这是最经典的 Agent 模式，让 LLM 能够：
1. 先思考需要什么信息
2. 选择合适的工具获取信息
3. 观察工具返回的结果
4. 根据结果决定下一步行动
"""
from typing import TypedDict, Annotated, List, Literal
from langgraph.graph import StateGraph, START, END
import operator
import json


class ReActState(TypedDict):
    """ReAct Agent 状态"""
    messages: Annotated[List[dict], operator.add]  # 消息历史
    thought: str         # 当前思考内容
    action: str          # 当前行动（工具名）
    action_input: str    # 行动参数
    observation: str     # 观察结果（工具返回值）
    iteration: int       # 当前循环次数
    finished: bool       # 是否结束


# ========== 工具定义 ==========

def search_tool(query: str) -> str:
    """模拟搜索工具 —— 实际项目中调用搜索引擎 API"""
    results = {
        "Python": "Python 是一种高级编程语言，最新稳定版本是 3.12，于 2023 年 10 月发布",
        "LangChain": "LangChain 是构建 LLM 应用的框架，最新版本 0.2，支持 LCEL 语法",
        "天气": "今天北京 25°C 晴天，上海 24°C 多云"
    }
    for key, value in results.items():
        if key in query:
            return value
    return f"搜索 '{query}' 未找到相关结果"


def calculator_tool(expression: str) -> str:
    """计算器工具 —— 执行数学计算"""
    try:
        result = eval(expression)
        return f"计算结果: {expression} = {result}"
    except:
        return f"无法计算: {expression}"


# 工具映射表
TOOLS = {
    "search": search_tool,
    "calculator": calculator_tool
}


# ========== 节点定义 ==========

def reason_node(state: ReActState) -> dict:
    """
    推理节点（模拟 LLM 思考过程）
    实际项目中这里调用 LLM 进行推理
    模拟一个完整的思考-行动序列
    """
    iteration = state["iteration"]

    # 模拟 LLM 的思考过程（实际项目中由 LLM 生成）
    thoughts = [
        {
            "thought": "用户想了解 Python 的最新版本。我需要搜索最新信息。",
            "action": "search",
            "action_input": "Python 最新版本"
        },
        {
            "thought": "搜索结果告诉我 Python 最新版本是 3.12。信息已经足够，可以给出回答了。",
            "action": "finish",
            "action_input": "Python 最新稳定版本是 3.12，于 2023 年 10 月发布。它引入了更好的错误提示、性能优化等多项新特性。"
        }
    ]

    if iteration < len(thoughts):
        thought = thoughts[iteration]
        return {
            "thought": thought["thought"],
            "action": thought["action"],
            "action_input": thought["action_input"],
            "iteration": iteration + 1,
            "messages": [{"role": "assistant", "content": f"[思考] {thought['thought']}"}]
        }
    else:
        return {
            "finished": True,
            "messages": [{"role": "assistant", "content": "推理完成"}]
        }


def action_node(state: ReActState) -> dict:
    """
    执行节点 —— 调用工具获取信息
    如果 action 是 "finish"，则直接输出最终答案
    """
    action = state["action"]
    action_input = state["action_input"]

    # 如果是"完成"行动，直接返回最终答案
    if action == "finish":
        return {
            "observation": "任务完成",
            "messages": [{"role": "assistant", "content": f"[最终回答] {action_input}"}],
            "finished": True
        }

    # 执行工具
    tool_func = TOOLS.get(action)
    if tool_func:
        result = tool_func(action_input)
    else:
        result = f"未知工具: {action}"

    return {
        "observation": result,
        "messages": [{"role": "assistant", "content": f"[行动] {action}({action_input})\n[观察] {result}"}]
    }


# ========== 条件路由 ==========

def should_continue(state: ReActState) -> Literal["reason", "__end__"]:
    """判断是否继续循环"""
    if state.get("finished") or state["iteration"] >= 5:
        return END
    return "reason"


# ========== 构建 ReAct 图 ==========

graph = StateGraph(ReActState)

# 添加节点
graph.add_node("reason", reason_node)
graph.add_node("action", action_node)

# 添加边
graph.add_edge(START, "reason")
graph.add_edge("reason", "action")

# 条件边：根据状态决定继续推理还是结束
graph.add_conditional_edges(
    "action",
    should_continue,
    {"reason": "reason", END: END}
)

# 编译
react_app = graph.compile()


# ========== 运行 ReAct Agent ==========

initial_state = {
    "messages": [{"role": "user", "content": "Python 最新版本是什么？"}],
    "thought": "",
    "action": "",
    "action_input": "",
    "observation": "",
    "iteration": 0,
    "finished": False
}

result = react_app.invoke(initial_state)

print("=== ReAct Agent 执行过程 ===\n")
for msg in result["messages"]:
    if isinstance(msg, dict):
        print(msg["content"])
        print()

print(f"总迭代次数: {result['iteration']}")
```

**预期输出：**
```
=== ReAct Agent 执行过程 ===

[思考] 用户想了解 Python 的最新版本。我需要搜索最新信息。
[行动] search(Python 最新版本)
[观察] Python 是一种高级编程语言，最新稳定版本是 3.12，于 2023 年 10 月发布

[思考] 搜索结果告诉我 Python 最新版本是 3.12。信息已经足够，可以给出回答了。
[最终回答] Python 最新稳定版本是 3.12，于 2023 年 10 月发布。它引入了更好的错误提示、性能优化等多项新特性。

总迭代次数: 2
```

### 示例 4：Checkpoint 持久化

```python
"""
LangGraph Checkpoint 持久化
将图的执行状态保存到内存或磁盘，支持恢复和回溯

使用场景：
- 工作流中断后恢复
- 多轮对话状态保持
- 调试时查看历史状态
"""
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
import operator


class WorkflowState(TypedDict):
    """工作流状态"""
    documents: Annotated[List[str], operator.add]  # 文档列表（追加模式）
    current_step: str           # 当前步骤
    approval_status: str        # 审批状态


def submit_document(state: WorkflowState) -> dict:
    """提交文档节点"""
    return {
        "documents": ["文档A_v1.pdf"],
        "current_step": "已提交",
        "approval_status": "待审批"
    }


def review_document(state: WorkflowState) -> dict:
    """审批文档节点"""
    return {
        "current_step": "已审批",
        "approval_status": "已通过"
    }


def archive_document(state: WorkflowState) -> dict:
    """归档文档节点"""
    return {
        "current_step": "已归档",
        "approval_status": "已完成"
    }


# ========== 构建图 ==========
graph = StateGraph(WorkflowState)
graph.add_node("submit", submit_document)
graph.add_node("review", review_document)
graph.add_node("archive", archive_document)

graph.add_edge(START, "submit")
graph.add_edge("submit", "review")
graph.add_edge("review", "archive")
graph.add_edge("archive", END)

# 创建检查点存储器（内存中，生产环境可用 SQLite/PostgreSQL）
checkpointer = MemorySaver()

# 编译时传入 checkpointer
app = graph.compile(checkpointer=checkpointer)


# ========== 运行并保存状态 ==========
config = {"configurable": {"thread_id": "workflow-001"}}

# 第一次运行（从头执行完整流程）
result1 = app.invoke(
    {"documents": [], "current_step": "开始", "approval_status": "无"},
    config=config
)
print("=== 第一次运行 ===")
print(f"当前步骤: {result1['current_step']}")
print(f"审批状态: {result1['approval_status']}")
print(f"文档列表: {result1['documents']}")

# 查看所有保存的状态（检查点历史）
print("\n=== 检查点列表 ===")
for i, checkpoint in enumerate(app.get_state_history(config)):
    print(f"  检查点 {i}: 步骤={checkpoint.values['current_step']}, "
          f"状态={checkpoint.values['approval_status']}")

# 恢复到某个检查点并继续
print("\n=== 恢复到审批阶段 ===")
# 获取审批阶段的检查点配置
review_checkpoint = None
for cp in app.get_state_history(config):
    if cp.values["current_step"] == "已提交":
        review_checkpoint = cp.config
        break

if review_checkpoint:
    result2 = app.invoke(
        {"current_step": "重新审批", "approval_status": "已通过"},
        review_checkpoint
    )
    print(f"恢复后步骤: {result2['current_step']}")
    print(f"恢复后状态: {result2['approval_status']}")
```

**预期输出（示例）：**
```
=== 第一次运行 ===
当前步骤: 已归档
审批状态: 已完成
文档列表: ['文档A_v1.pdf']

=== 检查点列表 ===
  检查点 0: 步骤=已归档, 状态=已完成
  检查点 1: 步骤=已审批, 状态=已通过
  检查点 2: 步骤=已提交, 状态=待审批

=== 恢复到审批阶段 ===
恢复后步骤: 已归档
恢复后状态: 已完成
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | `ModuleNotFoundError: langgraph` | 运行 `pip install langgraph`，确保版本 >= 0.2 |
| 2 | 状态更新不生效（字段被覆盖而非追加） | 检查是否用了 `Annotated[List, operator.add]` 做追加模式 |
| 3 | 条件边路由报错 | 确保路由函数的返回值与映射字典的 key 完全一致 |
| 4 | 图编译报循环错误 | 检查是否有无限循环路径，确保有到达 END 的条件 |
| 5 | Checkpoint 不保存 | 确保编译时传入了 checkpointer 参数 |
| 6 | 节点函数返回类型错误 | 节点必须返回 dict，且 key 必须在 TypedDict 中定义 |
| 7 | 无法可视化图 | 安装 graphviz: `pip install graphviz`，然后用 `app.get_graph().draw_mermaid()` |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| StateGraph | LangGraph 的核心类，一个有状态的有向图 |
| 节点（Node） | 图中的处理单元，每个节点是一个 Python 函数 |
| 边（Edge） | 节点之间的连接，定义执行顺序 |
| 条件边（Conditional Edge） | 根据运行时状态动态选择下一个节点 |
| State | TypedDict 定义的状态结构，贯穿整个图的执行 |
| Checkpoint | 状态持久化机制，支持保存、恢复和回溯 |
| START | 图的起始标记，指向第一个执行的节点 |
| END | 图的结束标记，表示流程完成 |
| ReAct | Reasoning + Acting，思考-行动-观察循环模式 |
| 路由函数 | 决定下一步走哪个节点的函数，返回值是目标节点名 |

## ✅ 验收清单
- [ ] 能解释 LangGraph 和线性 Chain 的核心区别
- [ ] 能用 TypedDict 定义图的状态结构
- [ ] 能创建节点、添加边、编译运行图
- [ ] 能用 `add_conditional_edges` 实现条件分支路由
- [ ] 能实现 ReAct Agent 的思考-行动-观察循环
- [ ] 理解 Checkpoint 的作用和基本用法

## 📝 复盘小纸条
- 今天最大的收获: _______________
- 还不太确定的: _______________

## 📥 明日同步接口
- 今日完成度: _______________
- 卡点描述: _______________
- 代码是否能跑通: _______________
- 明天希望: _______________
