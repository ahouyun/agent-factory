# 📅 Week 5 Day 7：Agentic RAG：Agent + RAG 融合

## 🧭 今日方向
> 传统 RAG 是"一问一答"的被动模式。Agentic RAG 让 Agent 主动决定：要不要检索、检索什么、检索结果够不够、要不要再查一次。这是 RAG 的进阶形态，也是构建生产级 AI 应用的关键。

## 🎯 生活比喻
> 传统 RAG 像一个只会查字典的学生——你问什么他就查什么。Agentic RAG 像一个聪明的研究员——他会先判断你的问题，决定去哪里找资料，如果资料不够会换一个地方再找，找到后还会自己检查信息是否充分。

## 📋 今日三件事
1. 理解 Agentic RAG 与传统 RAG 的核心区别
2. 实现一个具备"自适应检索"能力的 Agent
3. 构建带工具调用和循环判断的完整 Agentic RAG 系统

## 🗺️ 手把手路线

### Step 1: 理解 Agentic RAG 的决策循环
- 做什么: 画出 Agent 的决策流程图（判断→检索→评估→回答/再检索）
- 为什么: 这是 Agentic RAG 的核心思维模型
- 成功标志: 能描述 Agent 每一步的决策逻辑

### Step 2: 实现工具化的检索器
- 做什么: 将 RAG 检索封装为 Agent 可调用的工具
- 为什么: Agent 需要通过工具与外部世界交互
- 成功标志: 能用 LangChain Tool 定义检索工具

### Step 3: 完整 Agentic RAG 系统
- 做什么: 实现一个能自主判断、多轮检索、自我验证的 Agent
- 为什么: 这是实际项目中最实用的 RAG 形态
- 成功标志: Agent 能在信息不足时自动再次检索

## 💻 代码区

```python
"""
Week 5 Day 7: Agentic RAG：Agent + RAG 融合
安装依赖: pip install langchain langchain-openai chromadb
"""

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.schema import Document
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.tools import tool
import json

# ========== 0. 准备知识库 ==========
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
embeddings = OpenAIEmbeddings()

knowledge_base = [
    # Python 相关
    Document(page_content="Python 3.12 引入了新的类型参数语法（PEP 695），支持用 type 语句定义类型别名。", metadata={"category": "python"}),
    Document(page_content="Python 3.12 的 f-string 支持嵌套引号，不再需要转义。", metadata={"category": "python"}),
    Document(page_content="Python 3.12 性能提升约 5%，主要来自改进的字节码解释器。", metadata={"category": "python"}),
    Document(page_content="Python 3.13 将引入实验性的 JIT 编译器，进一步提升性能。", metadata={"category": "python"}),

    # FastAPI 相关
    Document(page_content="FastAPI 0.110 版本新增了 WebSocket 连接的依赖注入支持。", metadata={"category": "fastapi"}),
    Document(page_content="FastAPI 使用 Pydantic V2 进行数据验证，性能提升 5-50 倍。", metadata={"category": "fastapi"}),
    Document(page_content="FastAPI 支持自动生成 OpenAPI 文档，方便 API 测试。", metadata={"category": "fastapi"}),

    # Django 相关
    Document(page_content="Django 5.0 引入了 Field Groups，简化了表单字段的分组渲染。", metadata={"category": "django"}),
    Document(page_content="Django 5.0 的数据库约束现在可以定义在 model 层面。", metadata={"category": "django"}),

    # Redis 相关
    Document(page_content="Redis 7.0 支持 Redis Functions，可以替代 Lua 脚本。", metadata={"category": "redis"}),
    Document(page_content="Redis 支持多种数据结构：String、List、Hash、Set、Sorted Set。", metadata={"category": "redis"}),
]

vectorstore = Chroma.from_documents(
    knowledge_base, embeddings, collection_name="agentic_rag"
)

# ========== 1. 将检索封装为工具 ==========
@tool
def search_knowledge_base(query: str, category: str = "") -> str:
    """搜索知识库获取相关信息。query 为搜索内容，category 可指定分类（python/fastapi/django/redis）。"""
    kwargs = {"k": 3}
    if category:
        # Chroma 的 where 过滤
        results = vectorstore.similarity_search(
            query, k=3, filter={"category": category}
        )
    else:
        results = vectorstore.similarity_search(query, k=3)

    if not results:
        return "未找到相关信息"

    context = "\n".join([f"[{i+1}] {doc.page_content}" for i, doc in enumerate(results)])
    return f"找到 {len(results)} 条相关信息:\n{context}"

@tool
def check_answer_completeness(question: str, answer: str) -> str:
    """检查回答是否完整，是否有遗漏信息。返回评估结果。"""
    check_prompt = f"""请评估以下回答是否完整地回答了问题。

问题：{question}
回答：{answer}

请从以下维度评估：
1. 是否回答了核心问题？(是/否)
2. 是否有遗漏的重要信息？(有/无，如果有请列出)
3. 是否需要补充检索？(需要/不需要)

以 JSON 格式返回：{{"complete": true/false, "missing": [], "need_more": true/false}}"""

    response = llm.invoke(check_prompt)
    return response.content

# ========== 2. 传统 RAG（对比用）==========
print("=== 1. 传统 RAG ===")

from langchain_core.runnables import RunnablePassthrough

def format_docs(docs):
    return "\n\n".join([d.page_content for d in docs])

prompt = ChatPromptTemplate.from_template("""
基于以下参考资料回答问题。

参考资料：
{context}

问题：{question}

回答：""")

retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

traditional_rag = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
)

# 传统 RAG 的局限：只检索一次，可能信息不全
query = "Python 3.12 的新特性和性能如何？"
result = traditional_rag.invoke(query)
print(f"问题: {query}")
print(f"传统 RAG 回答: {result.content[:200]}...")
print("（注意：可能只涵盖部分信息）\n")

# ========== 3. Agentic RAG 核心实现 ==========
print("=== 2. Agentic RAG ===")

class AgenticRAG:
    """
    Agentic RAG 系统
    Agent 能自主决定：
    1. 是否需要检索
    2. 检索什么内容
    3. 检索结果是否足够
    4. 是否需要再次检索
    """
    def __init__(self, llm, tools, max_iterations=3):
        self.llm = llm
        self.tools = {tool.name: tool for tool in tools}
        self.max_iterations = max_iterations

    def _build_system_prompt(self):
        return """你是一个智能研究助手。你可以使用工具来搜索知识库。

工作流程：
1. 分析用户的问题，判断是否需要检索
2. 如果需要，使用 search_knowledge_base 搜索相关信息
3. 如果信息不完整，可以换个关键词或指定分类再搜
4. 搜索完成后，用 check_answer_completeness 检查回答
5. 如果不完整，继续补充检索
6. 最终给出完整、准确的回答

你可以使用的工具：
- search_knowledge_base(query, category): 搜索知识库
- check_answer_completeness(question, answer): 检查回答完整性

重要：每次检索后都要评估信息是否充分，不充分就继续检索。"""

    def _bind_tools(self):
        """将工具绑定到 LLM"""
        tool_descriptions = "\n".join([
            f"- {name}: {tool.description}"
            for name, tool in self.tools.items()
        ])

        return self.llm.bind_tools(
            list(self.tools.values()),
            tool_choice="auto"
        )

    def _execute_tool(self, tool_call):
        """执行工具调用"""
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]

        if tool_name in self.tools:
            result = self.tools[tool_name].invoke(tool_args)
            return {"tool": tool_name, "result": result}
        return {"tool": tool_name, "error": f"工具 {tool_name} 不存在"}

    def run(self, question):
        """运行 Agentic RAG"""
        print(f"\n{'='*50}")
        print(f"Agentic RAG 启动")
        print(f"问题: {question}")
        print(f"{'='*50}")

        messages = [
            ("system", self._build_system_prompt()),
            ("human", question)
        ]

        tool_model = self._bind_tools()
        iteration = 0
        tool_calls_log = []

        while iteration < self.max_iterations:
            iteration += 1
            print(f"\n--- 迭代 {iteration} ---")

            response = tool_model.invoke(messages)
            messages.append(response)

            # 检查是否有工具调用
            if hasattr(response, "tool_calls") and response.tool_calls:
                for tool_call in response.tool_calls:
                    print(f"  调用工具: {tool_call['name']}({tool_call['args']})")
                    result = self._execute_tool(tool_call)
                    tool_calls_log.append(result)
                    print(f"  工具结果: {result.get('result', result.get('error', ''))[:100]}...")

                    # 将工具结果加入消息
                    messages.append({
                        "role": "tool",
                        "content": str(result.get("result", result.get("error", ""))),
                        "tool_call_id": tool_call.get("id", "unknown")
                    })
            else:
                # 没有工具调用 = Agent 认为信息足够，准备回答
                print(f"\n  Agent 认为信息充足，生成最终回答")
                break

        # 提取最终回答
        final_answer = response.content if response.content else "抱歉，无法回答该问题"

        print(f"\n{'='*50}")
        print(f"最终回答: {final_answer}")
        print(f"工具调用次数: {len(tool_calls_log)}")
        print(f"{'='*50}")

        return {
            "answer": final_answer,
            "iterations": iteration,
            "tool_calls": tool_calls_log
        }

# 创建 Agentic RAG 实例
agentic_rag = AgenticRAG(
    llm=llm,
    tools=[search_knowledge_base, check_answer_completeness],
    max_iterations=3
)

# 测试
result = agentic_rag.run("Python 3.12 和 Python 3.13 分别有什么新特性？")

# ========== 4. 带条件路由的 Agentic RAG ==========
print("\n=== 3. 带条件路由的 Agentic RAG ===")

from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List

class AgentState(TypedDict):
    question: str
    search_queries: List[str]
    retrieved_docs: List[str]
    answer: str
    is_complete: bool
    iteration: int

# 定义节点函数
def analyze_question(state: AgentState):
    """分析问题，生成搜索策略"""
    question = state["question"]

    analysis_prompt = f"""分析以下问题，生成 1-3 个搜索查询。

问题：{question}

请以 JSON 格式返回：{{"queries": ["查询1", "查询2"]}}"""

    response = llm.invoke(analysis_prompt)
    try:
        queries_data = json.loads(response.content)
        queries = queries_data.get("queries", [question])
    except:
        queries = [question]

    return {"search_queries": queries, "iteration": state.get("iteration", 0) + 1}

def retrieve_documents(state: AgentState):
    """根据搜索查询检索文档"""
    all_docs = []
    for query in state["search_queries"]:
        results = vectorstore.similarity_search(query, k=2)
        for doc in results:
            if doc.page_content not in all_docs:
                all_docs.append(doc.page_content)

    return {"retrieved_docs": all_docs}

def generate_answer(state: AgentState):
    """生成回答"""
    context = "\n\n".join(state["retrieved_docs"])
    prompt = ChatPromptTemplate.from_template("""
基于以下参考资料回答问题。如果信息不足，明确说明。

参考资料：
{context}

问题：{question}

回答：""")

    chain = prompt | llm
    response = chain.invoke({"context": context, "question": state["question"]})

    return {"answer": response.content}

def check_completeness(state: AgentState):
    """检查回答完整性"""
    check_prompt = f"""评估以下回答是否完整：

问题：{state["question"]}
回答：{state["answer"]}

返回 JSON：{{"complete": true/false, "reason": "原因"}}"""

    response = llm.invoke(check_prompt)
    try:
        result = json.loads(response.content)
        is_complete = result.get("complete", True)
    except:
        is_complete = True

    return {"is_complete": is_complete}

def should_continue(state: AgentState):
    """条件路由：决定是继续检索还是结束"""
    if state.get("is_complete", True):
        return "end"
    if state.get("iteration", 0) >= 3:
        return "end"  # 最多 3 轮
    return "continue"

# 构建 Graph
workflow = StateGraph(AgentState)

workflow.add_node("analyze", analyze_question)
workflow.add_node("retrieve", retrieve_documents)
workflow.add_node("generate", generate_answer)
workflow.add_node("check", check_completeness)

workflow.set_entry_point("analyze")
workflow.add_edge("analyze", "retrieve")
workflow.add_edge("retrieve", "generate")
workflow.add_edge("generate", "check")
workflow.add_conditional_edges(
    "check",
    should_continue,
    {"continue": "analyze", "end": END}
)

app = workflow.compile()

# 运行
print("运行带条件路由的 Agentic RAG...")
final_state = app.invoke({
    "question": "Python 3.12 的完整特性列表",
    "search_queries": [],
    "retrieved_docs": [],
    "answer": "",
    "is_complete": False,
    "iteration": 0
})

print(f"\n最终回答: {final_state['answer'][:300]}...")
print(f"迭代次数: {final_state['iteration']}")
print(f"检索文档数: {len(final_state['retrieved_docs'])}")

print("""
=== Agentic RAG vs 传统 RAG ===

| 维度 | 传统 RAG | Agentic RAG |
|------|----------|-------------|
| 检索次数 | 固定 1 次 | 自适应（1-N 次）|
| 查询策略 | 用户原始查询 | Agent 自动生成多种查询 |
| 质量检查 | 无 | 自动评估回答完整性 |
| 信息不全时 | 直接回答（可能遗漏）| 继续检索补充 |
| 适用场景 | 简单问答 | 复杂研究、多跳推理 |
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | Agent 陷入无限循环 | 设置 `max_iterations` 限制，或优化停止条件 |
| 2 | LangGraph 导入报错 | `pip install langgraph`，确保版本 >= 0.2 |
| 3 | 工具调用没有执行 | 检查 `bind_tools` 是否正确，工具描述是否清晰 |
| 4 | Agent 总是不检索 | 在 System Prompt 中强调"应该先检索再回答" |
| 5 | 多轮检索结果重复 | 在检索时加入已检索文档的去重逻辑 |
| 6 | 回答质量不如传统 RAG | 检查 System Prompt 是否过于复杂，简化决策逻辑 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Agentic RAG | 具备自主决策能力的 RAG，Agent 控制检索流程 |
| 工具调用 (Tool Use) | Agent 通过调用外部工具获取信息或执行操作 |
| 自适应检索 | 根据信息充分程度动态决定是否继续检索 |
| 条件路由 | 根据运行时状态决定下一步执行哪个节点 |
| 状态图 (State Graph) | LangGraph 中用节点和边描述工作流的方式 |
| 迭代循环 | Agent 多次执行"检索-评估-决策"的过程 |
| 信息充分性评估 | 判断当前信息是否足以回答用户问题 |
| 传统 RAG | 一次性检索 + 生成的固定流程 |
| LangGraph | LangChain 的图结构工作流框架 |
| 多跳推理 | 需要多步检索和推理才能回答的复杂问题 |

## ✅ 验收清单
- [ ] 能说出 Agentic RAG 和传统 RAG 的核心区别
- [ ] 能用 `@tool` 装饰器定义检索工具
- [ ] 理解 Agent 的决策循环（判断→检索→评估→再检索/回答）
- [ ] 能用 LangGraph 构建带条件路由的工作流
- [ ] Agentic RAG 系统能运行并输出结果
- [ ] 理解 `max_iterations` 的必要性

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
