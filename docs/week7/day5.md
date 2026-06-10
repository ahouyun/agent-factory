# 📅 Week 7 Day 5：LangGraph 完整工作流整合

## 🧭 今日方向
> 将 Week 5-7 所学整合为一个完整的 LangGraph 工作流：Agent + RAG + Memory + Tools + Safety。这是"学以致用"的关键一步。

## 🎯 生活比喻
> 今天的工作就像组装一台完整的电脑。CPU（LLM）、内存（Memory）、硬盘（RAG）、显卡（Tools）、防火墙（Safety）都已经准备好了，现在要把它们组装成一台能正常运行的机器。

## 📋 今日三件事
1. 设计完整的 Agent 工作流架构
2. 整合 RAG、Memory、Tools 到 LangGraph
3. 实现带错误处理和监控的生产级工作流

## 🗺️ 手把手路线

### Step 1: 架构设计
- 做什么: 画出完整工作流的状态图
- 为什么: 先设计再实现，避免返工
- 成功标志: 能画出包含所有组件的状态图

### Step 2: 组件整合
- 做什么: 将独立的模块整合到 LangGraph
- 为什么: 模块化设计便于维护和扩展
- 成功标志: 所有模块能协同工作

### Step 3: 生产级完善
- 做什么: 添加错误处理、日志、监控
- 为什么: 生产环境需要可靠性保障
- 成功标志: 工作流能优雅处理各种异常

## 💻 代码区

```python
"""
Week 7 Day 5: LangGraph 完整工作流整合
安装依赖: pip install langgraph langchain langchain-openai chromadb
"""

from typing import TypedDict, Annotated, List, Optional, Literal
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langchain_core.tools import tool
from langchain.prompts import ChatPromptTemplate
import json
import time
from datetime import datetime

# ========== 1. 初始化组件 ==========
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
embeddings = OpenAIEmbeddings()

# 知识库
docs_texts = [
    "Python 3.12 引入了新的类型参数语法（PEP 695）。",
    "FastAPI 使用 Pydantic V2 进行数据验证。",
    "Django 5.0 支持异步 ORM 查询。",
    "Redis 7.0 支持 Redis Functions。",
    "Docker 容器化让部署更简单。",
]

vectorstore = Chroma.from_texts(docs_texts, embeddings, collection_name="full_workflow")
retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

# ========== 2. 定义工具 ==========
@tool
def search_knowledge(query: str) -> str:
    """搜索知识库获取相关信息"""
    docs = retriever.invoke(query)
    return "\n".join([doc.page_content for doc in docs])

@tool
def get_current_time() -> str:
    """获取当前时间"""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

@tool
def calculate(expression: str) -> str:
    """计算数学表达式"""
    try:
        allowed = "0123456789+-*/.() "
        if all(c in allowed for c in expression):
            return str(eval(expression))
        return "不支持的表达式"
    except Exception as e:
        return f"计算错误: {str(e)}"

tools = [search_knowledge, get_current_time, calculate]

# ========== 3. 定义状态 ==========
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], "对话历史"]
    user_input: str
    tool_calls: List[dict]
    tool_results: List[str]
    response: str
    iteration: int
    is_complete: bool
    context: str
    metadata: dict

# ========== 4. 定义节点 ==========
def init_node(state: AgentState):
    """初始化节点"""
    return {
        "iteration": 0,
        "is_complete": False,
        "tool_calls": [],
        "tool_results": [],
        "metadata": {"start_time": time.time()}
    }

def retrieve_context(state: AgentState):
    """检索上下文"""
    query = state["user_input"]
    docs = retriever.invoke(query)
    context = "\n".join([doc.page_content for doc in docs])
    return {"context": context}

def agent_think(state: AgentState):
    """Agent 思考"""
    messages = state["messages"]
    context = state["context"]

    # 构建带上下文的消息
    system_msg = SystemMessage(content=f"""你是一个智能助手。

相关知识：
{context}

请根据用户的问题和相关知识回答。如果需要使用工具，可以调用可用工具。""")

    all_messages = [system_msg] + messages + [HumanMessage(content=state["user_input"])]

    # 调用 LLM
    response = llm.bind_tools(tools).invoke(all_messages)

    return {
        "messages": messages + [HumanMessage(content=state["user_input"]), response],
        "iteration": state.get("iteration", 0) + 1
    }

def tool_executor(state: AgentState):
    """工具执行"""
    messages = state["messages"]
    last_msg = messages[-1]

    tool_calls = []
    tool_results = []

    if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
        for tc in last_msg.tool_calls:
            tool_name = tc["name"]
            tool_args = tc["args"]

            # 执行工具
            tool_map = {t.name: t for t in tools}
            if tool_name in tool_map:
                result = tool_map[tool_name].invoke(tool_args)
                tool_calls.append({"name": tool_name, "args": tool_args})
                tool_results.append(str(result))

    return {
        "tool_calls": state.get("tool_calls", []) + tool_calls,
        "tool_results": state.get("tool_results", []) + tool_results
    }

def generate_response(state: AgentState):
    """生成最终响应"""
    messages = state["messages"]
    tool_results = state.get("tool_results", [])

    # 如果有工具结果，添加到消息中
    if tool_results:
        tool_msg = AIMessage(content=f"工具执行结果: {json.dumps(tool_results, ensure_ascii=False)}")
        messages = messages + [tool_msg]

    # 生成最终响应
    response = llm.invoke(messages)

    return {
        "response": response.content,
        "is_complete": True
    }

def check_complete(state: AgentState) -> Literal["continue", "done"]:
    """检查是否完成"""
    if state.get("is_complete"):
        return "done"
    if state.get("iteration", 0) >= 3:
        return "done"
    return "continue"

def error_handler(state: AgentState):
    """错误处理"""
    return {
        "response": "抱歉，处理过程中出现错误。请稍后重试。",
        "is_complete": True
    }

# ========== 5. 构建工作流图 ==========
workflow = StateGraph(AgentState)

# 添加节点
workflow.add_node("init", init_node)
workflow.add_node("retrieve", retrieve_context)
workflow.add_node("think", agent_think)
workflow.add_node("tools", tool_executor)
workflow.add_node("respond", generate_response)
workflow.add_node("error", error_handler)

# 设置入口
workflow.set_entry_point("init")

# 添加边
workflow.add_edge("init", "retrieve")
workflow.add_edge("retrieve", "think")
workflow.add_conditional_edges(
    "think",
    check_complete,
    {"continue": "tools", "done": "respond"}
)
workflow.add_edge("tools", "think")
workflow.add_edge("respond", END)
workflow.add_edge("error", END)

# 编译
app = workflow.compile(checkpointer=MemorySaver())

# ========== 6. 运行测试 ==========
print("=== 完整工作流测试 ===")

# 测试 1: 普通查询
print("\n--- 测试 1: 普通查询 ---")
config = {"configurable": {"thread_id": "test_1"}}
result = app.invoke({
    "messages": [],
    "user_input": "Python 3.12 有什么新特性？",
    "tool_calls": [],
    "tool_results": [],
    "response": "",
    "iteration": 0,
    "is_complete": False,
    "context": "",
    "metadata": {}
}, config)
print(f"问题: Python 3.12 有什么新特性？")
print(f"回答: {result['response'][:200]}...")
print(f"迭代次数: {result['iteration']}")

# 测试 2: 需要工具的查询
print("\n--- 测试 2: 需要工具 ---")
config = {"configurable": {"thread_id": "test_2"}}
result = app.invoke({
    "messages": [],
    "user_input": "现在几点了？",
    "tool_calls": [],
    "tool_results": [],
    "response": "",
    "iteration": 0,
    "is_complete": False,
    "context": "",
    "metadata": {}
}, config)
print(f"问题: 现在几点了？")
print(f"回答: {result['response'][:200]}...")
print(f"工具调用: {result['tool_calls']}")

# ========== 7. 生产级完善 ==========
print("\n=== 生产级工作流 ===")

class ProductionWorkflow:
    """生产级工作流"""

    def __init__(self):
        self.app = app
        self.metrics = {
            "total_requests": 0,
            "successful": 0,
            "failed": 0,
            "avg_response_time": 0
        }

    def run(self, user_input: str, thread_id: str = None) -> dict:
        """运行工作流"""
        if thread_id is None:
            thread_id = f"thread_{int(time.time())}"

        start_time = time.time()

        try:
            config = {"configurable": {"thread_id": thread_id}}
            result = self.app.invoke({
                "messages": [],
                "user_input": user_input,
                "tool_calls": [],
                "tool_results": [],
                "response": "",
                "iteration": 0,
                "is_complete": False,
                "context": "",
                "metadata": {}
            }, config)

            response_time = time.time() - start_time

            # 更新指标
            self.metrics["total_requests"] += 1
            self.metrics["successful"] += 1
            self.metrics["avg_response_time"] = (
                (self.metrics["avg_response_time"] * (self.metrics["total_requests"] - 1) + response_time)
                / self.metrics["total_requests"]
            )

            return {
                "success": True,
                "response": result["response"],
                "metadata": {
                    "iterations": result["iteration"],
                    "tool_calls": result["tool_calls"],
                    "response_time": response_time
                }
            }

        except Exception as e:
            self.metrics["total_requests"] += 1
            self.metrics["failed"] += 1

            return {
                "success": False,
                "error": str(e),
                "response": "抱歉，处理过程中出现错误。"
            }

    def get_metrics(self) -> dict:
        """获取指标"""
        return self.metrics.copy()

# 使用生产级工作流
production = ProductionWorkflow()

# 测试
test_queries = [
    "Python 是什么？",
    "现在几点？",
    "计算 123 * 456",
    "FastAPI 的特点？",
]

for query in test_queries:
    result = production.run(query)
    status = "成功" if result["success"] else "失败"
    print(f"\n[{status}] {query}")
    print(f"  回答: {result['response'][:100]}...")

# 打印指标
print(f"\n=== 运行指标 ===")
metrics = production.get_metrics()
print(f"总请求数: {metrics['total_requests']}")
print(f"成功: {metrics['successful']}")
print(f"失败: {metrics['failed']}")
print(f"平均响应时间: {metrics['avg_response_time']:.2f}s")

print("""
=== 完整工作流架构 ===

┌─────────────────────────────────────────────────────────┐
│                     用户输入                              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              初始化 (init)                                │
│              - 设置初始状态                               │
│              - 初始化元数据                               │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│           检索上下文 (retrieve)                            │
│           - RAG 向量检索                                  │
│           - 加载相关知识                                   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Agent 思考 (think)                           │
│              - 分析问题                                   │
│              - 决定是否使用工具                            │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│  工具执行      │   │  生成响应      │
│  (tools)      │   │  (respond)    │
└───────┬───────┘   └───────┬───────┘
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│  回到思考      │   │     END       │
│  (think)      │   │               │
└───────────────┘   └───────────────┘
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 工作流卡住不结束 | 检查 `check_complete` 条件和 `iteration` 限制 |
| 2 | 工具调用失败 | 检查工具参数格式，添加异常处理 |
| 3 | 上下文太长 | 启用摘要压缩，限制检索数量 |
| 4 | 响应质量差 | 优化 System Prompt，增加知识库内容 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| 完整工作流 | 整合所有组件的端到端 Agent 系统 |
| 状态图 | LangGraph 中用节点和边描述工作流 |
| 工具编排 | Agent 自主决定调用哪些工具 |
| 错误处理 | 捕获和恢复各种异常情况 |
| 监控指标 | 跟踪系统性能和健康状态 |
| 生产级 | 适合实际部署的高质量实现 |

## ✅ 验收清单
- [ ] 能设计完整的工作流状态图
- [ ] 能整合 RAG、Memory、Tools
- [ ] 能实现带错误处理的工作流
- [ ] 能收集和分析运行指标
- [ ] 工作流能正常运行并输出结果
- [ ] 理解每个节点的职责

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
