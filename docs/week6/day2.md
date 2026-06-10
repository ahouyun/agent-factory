# 📅 Week 6 Day 2：LangChain 核心概念 + 链式调用

## 🧭 今日方向
> LangChain 是构建 LLM 应用的"乐高积木"。今天掌握其核心抽象：Model、Prompt、Chain、OutputParser，以及 LCEL（LangChain Expression Language）的链式调用语法。

## 🎯 生乐比喻
> LangChain 就像一个"厨房流水线"。你把食材（输入）放上传送带，经过洗菜（Prompt 模板）、切菜（LLM 处理）、摆盘（Output Parser），最终端出一道菜（输出）。每个环节可以单独替换和组合。

## 📋 今日三件事
1. 理解 LangChain 的四大核心模块（Model / Prompt / Chain / Parser）
2. 掌握 LCEL 的链式调用语法（`|` 管道符）
3. 构建一个多步骤的 RAG Chain

## 🗺️ 手把手路线

### Step 1: LangChain 架构全景
- 做什么: 画出 LangChain 的模块关系图
- 为什么: 理解全局才能灵活组合
- 成功标志: 能说出四大模块的职责和关系

### Step 2: LCEL 链式调用
- 做什么: 用 `|` 管道符串联多个组件
- 为什么: LCEL 是 LangChain 的核心语法
- 成功标志: 能用 LCEL 构建 3 步以上的链

### Step 3: 实战 RAG Chain
- 做什么: 构建一个完整的 RAG Chain
- 为什么: 这是实际项目中最常用的模式
- 成功标志: 从检索到生成全链路跑通

## 💻 代码区

```python
"""
Week 6 Day 2: LangChain 核心概念 + 链式调用
安装依赖: pip install langchain langchain-openai
"""

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda, RunnableParallel
from langchain_core.messages import HumanMessage, SystemMessage

# ========== 1. LangChain 四大核心模块 ==========
print("=== 1. LangChain 核心模块 ===")

# --- 1a. Model（模型层）---
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
print(f"模型: {llm.model_name}")

# 基本调用
response = llm.invoke("用一句话解释 LangChain")
print(f"直接调用: {response.content}\n")

# --- 1b. Prompt（提示词层）---
# PromptTemplate: 静态模板
simple_prompt = ChatPromptTemplate.from_template(
    "你是一个{role}。请用{style}风格回答：{question}"
)
# 格式化
formatted = simple_prompt.invoke({
    "role": "老师",
    "style": "简洁",
    "question": "什么是 AI Agent？"
})
print(f"格式化后的 Prompt:\n{formatted}\n")

# MessagesPlaceholder: 支持对话历史
from langchain.prompts import MessagesPlaceholder

chat_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个专业的技术顾问。"),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}")
])

# --- 1c. Output Parser（输出解析层）---
# StrOutputParser: 提取字符串
str_parser = StrOutputParser()

# JsonOutputParser: 提取 JSON
json_parser = JsonOutputParser()

# --- 1d. Chain（链）: 用 LCEL 串联 ---
# 最简单的链: Prompt → LLM → Parser
chain = simple_prompt | llm | str_parser
result = chain.invoke({
    "role": "程序员",
    "style": "幽默",
    "question": "什么是 bug？"
})
print(f"简单链结果: {result}\n")

# ========== 2. LCEL 链式调用详解 ==========
print("=== 2. LCEL 详解 ===")

# --- 2a. 管道符 | ---
# A | B 表示 A 的输出作为 B 的输入
prompt = ChatPromptTemplate.from_template("写一首关于{topic}的诗")
poem_chain = prompt | llm | str_parser
print(f"诗歌: {poem_chain.invoke({'topic': '月亮'})}\n")

# --- 2b. RunnablePassthrough: 直通 ---
# 将输入原样传递给下一个组件
passthrough_chain = (
    RunnablePassthrough.assign(
        topic=lambda x: x["topic"].upper()  # 添加新字段
    )
    | prompt
    | llm
    | str_parser
)

# --- 2c. RunnableParallel: 并行执行 ---
# 同时执行多个任务
parallel_chain = RunnableParallel(
    poem=poem_chain,           # 并行任务 1: 写诗
    story=(                    # 并行任务 2: 写故事
        ChatPromptTemplate.from_template("写一个关于{topic}的短故事")
        | llm
        | str_parser
    )
)

result = parallel_chain.invoke({"topic": "猫咪"})
print(f"并行结果:")
print(f"  诗: {result['poem'][:80]}...")
print(f"  故事: {result['story'][:80]}...\n")

# --- 2d. RunnableLambda: 自定义函数 ---
def word_count(text: str) -> dict:
    """统计字数"""
    return {"text": text, "word_count": len(text)}

chain_with_count = (
    ChatPromptTemplate.from_template("用100字介绍{topic}")
    | llm
    | str_parser
    | RunnableLambda(word_count)  # 添加字数统计
)

result = chain_with_count.invoke({"topic": "Python"})
print(f"带字数统计: {result}\n")

# --- 2e. assign: 添加计算字段 ---
chain_with_meta = (
    RunnablePassthrough.assign(
        upper_topic=lambda x: x["topic"].upper(),
        char_count=lambda x: len(x["topic"])
    )
    | ChatPromptTemplate.from_template("介绍 {upper_topic}（{char_count}个字符）")
    | llm
    | str_parser
)
print(f"assign 结果: {chain_with_meta.invoke({'topic': 'python'})}\n")

# ========== 3. 实战：多步骤 RAG Chain ==========
print("=== 3. 多步骤 RAG Chain ===")

from langchain_community.vectorstores import Chroma
from langchain.schema import Document

# 准备知识库
docs = [
    Document(page_content="Python 是一种解释型编程语言，由 Guido van Rossum 于 1991 年发布。", metadata={"source": "python"}),
    Document(page_content="Python 支持多种编程范式，包括面向对象、函数式和过程式编程。", metadata={"source": "python"}),
    Document(page_content="Python 3.12 是最新的稳定版本，引入了多项新特性。", metadata={"source": "python"}),
    Document(page_content="JavaScript 是 Web 开发的核心语言，运行在浏览器和 Node.js 中。", metadata={"source": "javascript"}),
]

embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(docs, embeddings, collection_name="lcel_demo")
retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

# 自定义格式化函数
def format_docs(docs_list):
    """将文档列表格式化为字符串"""
    formatted = []
    for i, doc in enumerate(docs_list):
        source = doc.metadata.get("source", "unknown")
        formatted.append(f"[来源: {source}] {doc.page_content}")
    return "\n\n".join(formatted)

# 完整 RAG Chain
rag_prompt = ChatPromptTemplate.from_template("""
你是一个技术专家。基于以下参考资料回答问题。

参考资料：
{context}

问题：{question}

要求：
1. 只使用参考资料中的信息
2. 如果资料不足，坦诚告知
3. 引用来源
""")

rag_chain = (
    {
        "context": retriever | format_docs,     # 并行: 检索 + 格式化
        "question": RunnablePassthrough(),       # 直通问题
    }
    | rag_prompt      # 填入 Prompt
    | llm             # 调用 LLM
    | str_parser      # 提取字符串
)

# 测试
result = rag_chain.invoke("Python 是什么？")
print(f"RAG 回答: {result}\n")

# --- 添加中间处理步骤 ---
def add_metadata(input_dict):
    """添加元数据"""
    return {
        **input_dict,
        "timestamp": "2024-01-01",
        "version": "1.0"
    }

enhanced_chain = (
    RunnablePassthrough.assign(metadata=add_metadata)
    | {
        "context": lambda x: x["context"],
        "question": lambda x: x["question"],
        "metadata": lambda x: x["metadata"],
    }
    | rag_prompt
    | llm
    | str_parser
)

# ========== 4. Chain 组合与复用 ==========
print("=== 4. Chain 组合 ===")

# 定义可复用的组件
analysis_prompt = ChatPromptTemplate.from_template("""
分析以下文本的情感和主题：

文本：{text}

请以 JSON 格式返回：
{{"sentiment": "positive/negative/neutral", "topic": "主题"}}""")

summary_prompt = ChatPromptTemplate.from_template("""
请用一句话总结以下内容：

{content}""")

# 组合：分析 + 总结
analysis_chain = analysis_prompt | llm | str_parser
summary_chain = summary_prompt | llm | str_parser

# 完整流程
full_pipeline = (
    {"text": RunnablePassthrough()}
    | RunnableParallel(
        analysis=analysis_chain,
        summary=summary_chain
    )
)

result = full_pipeline.invoke("Python 是最流行的编程语言之一，广泛用于 AI 开发。")
print(f"分析+总结结果: {result}\n")

# ========== 5. 错误处理与重试 ==========
print("=== 5. 错误处理 ===")

from langchain_core.runnables import RunnableConfig
from langchain_core.callbacks import CallbackManagerForLLMRun

# 带重试的 Chain
retry_chain = (
    ChatPromptTemplate.from_template("回答: {question}")
    | llm
    | str_parser
)

# 使用 with_config 添加配置
config = RunnableConfig(
    tags=["production"],
    metadata={"user_id": "test_user"},
    max_concurrency=3
)

result = retry_chain.invoke({"question": "你好"}, config=config)
print(f"带配置的结果: {result}")

print("""
=== LCEL 速查表 ===

| 语法 | 作用 | 示例 |
|------|------|------|
| A \| B | 顺序执行 | prompt \| llm |
| RunnablePassthrough() | 直通输入 | 保持原样传递 |
| RunnableParallel(a=A, b=B) | 并行执行 | 同时运行多个任务 |
| RunnableLambda(fn) | 自定义函数 | 添加处理逻辑 |
| RunnablePassthrough.assign(key=fn) | 添加字段 | 计算新字段 |
| .invoke(input) | 同步执行 | 单次调用 |
| .batch(inputs) | 批量执行 | 多次调用 |
| .stream(input) | 流式输出 | 实时返回结果 |
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | `\|` 管道符报错 | 检查前后组件是否兼容（输入/输出类型匹配） |
| 2 | `RunnableParallel` 结果缺少字段 | 确保所有并行任务的输入一致 |
| 3 | LCEL Chain 调试困难 | 用 `verbose=True` 或添加 logging 回调 |
| 4 | Prompt 变量名错误 | 检查 `{variable}` 是否与 invoke 参数匹配 |
| 5 | 组件顺序搞反 | LCEL 是从左到右执行，prompt → llm → parser |
| 6 | `invoke` vs `batch` 混淆 | `invoke` 单次调用，`batch` 批量调用 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| LangChain | 构建 LLM 应用的开源框架，提供模块化组件 |
| LCEL | LangChain Expression Language，用 `\|` 管道符串联组件 |
| Runnable | LangChain 中可执行组件的统称（Prompt、LLM、Parser 等）|
| RunnablePassthrough | 直通组件，将输入原样传递给下一个组件 |
| RunnableParallel | 并行组件，同时执行多个子任务 |
| RunnableLambda | 函数组件，将普通 Python 函数包装为可执行链 |
| StrOutputParser | 从 LLM 响应中提取字符串内容 |
| JsonOutputParser | 从 LLM 响应中提取 JSON 内容 |
| MessagesPlaceholder | Prompt 中的对话历史占位符 |
| Chain | 由多个 Runnable 组成的执行链 |

## ✅ 验收清单
- [ ] 能说出 LangChain 四大模块的职责
- [ ] 能用 `|` 管道符串联组件
- [ ] 理解 `RunnablePassthrough` 和 `RunnableParallel` 的区别
- [ ] 能用 `RunnableLambda` 添加自定义处理
- [ ] 能构建完整的 RAG Chain
- [ ] 理解 LCEL 的执行顺序（从左到右）

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
