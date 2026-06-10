# 📅 Week 5 Day 1：RAG 原理 + 架构概览

## 🧭 今日方向
> 理解 RAG（Retrieval-Augmented Generation）的核心思想：先检索、后生成。从传统 LLM 的局限出发，掌握 RAG 如何让模型"开卷考试"，并建立完整架构认知。

## 🎯 生活比喻
> 想象你是一个学生参加考试。传统 LLM 就像"闭卷考试"——只能凭记忆答题。而 RAG 就像"开卷考试"——你可以先翻书找到相关段落，再根据书本内容来答题。这样答案更准确、更有依据。

## 📋 今日三件事
1. 理解 LLM 的三大局限：知识截止、幻觉、私有数据不可见
2. 掌握 RAG 架构的四大核心组件：文档加载、向量索引、检索、生成
3. 用 Python 从零实现一个最简 RAG Demo，跑通完整流程

## 🗺️ 手把手路线

### Step 1: 了解 LLM 的局限性
- 做什么: 运行一段代码，让 GPT 回答一个它不知道的知识（比如你公司的内部文档）
- 为什么: 亲身感受 LLM 的"知识盲区"，理解为什么需要 RAG
- 成功标志: LLM 给出错误答案或表示不知道

### Step 2: 理解 RAG 的四步流程
- 做什么: 画出 RAG 架构图（Ingestion → Retrieval → Augmentation → Generation）
- 为什么: 建立全局视野，后面每一步都是这个流程的细节
- 成功标志: 能用自己的话描述四个阶段

### Step 3: 搭建最简 RAG Demo
- 做什么: 用 LangChain + OpenAI 搭建一个能回答 PDF 问题的系统
- 为什么: 先跑通完整流程，建立直觉，后面再逐个深入
- 成功标志: 输入一个 PDF，提出相关问题，得到有依据的回答

## 💻 代码区

```python
"""
Week 5 Day 1: 最简 RAG Demo
安装依赖: pip install langchain langchain-openai chromadb
"""

# ========== 1. 模拟知识库 ==========
# 真实场景中，这些文本来自 PDF、网页、数据库等
knowledge_base = [
    "公司成立于2020年，总部位于北京海淀区。",
    "公司主要产品是智能客服系统，支持多轮对话。",
    "公司目前有200名员工，其中研发占60%。",
    "2024年营收达到5000万元，同比增长30%。",
    "公司正在研发基于大模型的下一代产品，预计2025年Q2发布。",
]

# ========== 2. 文档切分（最简版：每条作为一个 chunk）==========
# 真实场景中需要按语义、长度、重叠等策略切分
chunks = knowledge_base
print(f"文档切分完成，共 {len(chunks)} 个 chunks")

# ========== 3. 向量化 + 存入向量数据库 ==========
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# 使用 OpenAI 的 Embedding 模型将文本转为向量
embeddings = OpenAIEmbeddings()

# 存入 Chroma 向量数据库（自动完成 embedding）
vectorstore = Chroma.from_texts(
    texts=chunks,
    embedding=embeddings,
    collection_name="demo_rag"
)
print(f"向量索引构建完成，共 {vectorstore._collection.count()} 条记录")

# ========== 4. 检索 ==========
query = "公司有多少员工？"
retriever = vectorstore.as_retriever(search_kwargs={"k": 2})
relevant_docs = retriever.invoke(query)

print(f"\n查询: {query}")
print(f"检索到 {len(relevant_docs)} 个相关文档:")
for i, doc in enumerate(relevant_docs):
    print(f"  [{i+1}] {doc.page_content}")

# ========== 5. 生成 ==========
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

# 构建 Prompt：注入检索到的上下文
prompt = ChatPromptTemplate.from_template("""
你是一个专业的助手。请根据以下参考资料回答问题。
如果参考资料中没有相关信息，请坦诚告知。

参考资料：
{context}

问题：{question}

回答：""")

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 将检索结果拼接为 context 字符串
context = "\n".join([doc.page_content for doc in relevant_docs])

# 调用 LLM 生成回答
chain = prompt | llm
response = chain.invoke({"context": context, "question": query})

print(f"\n回答: {response.content}")
print("\n--- RAG 完整流程跑通！---")

# ========== 6. 用 LCEL 封装成完整 Chain ==========
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

def format_docs(docs):
    """将检索到的文档格式化为字符串"""
    return "\n\n".join([doc.page_content for doc in docs])

# 完整 RAG Chain
rag_chain = (
    {
        "context": retriever | format_docs,  # 检索 + 格式化
        "question": RunnablePassthrough(),     # 直通问题
    }
    | prompt     # 填入 Prompt
    | llm        # 调用 LLM
    | StrOutputParser()  # 提取字符串
)

# 测试完整 Chain
print("\n--- 测试封装后的 RAG Chain ---")
result = rag_chain.invoke("公司的主要产品是什么？")
print(f"回答: {result}")

# ========== 对比：不用 RAG 的回答 ==========
print("\n--- 对比：不用 RAG 的回答 ---")
direct_prompt = ChatPromptTemplate.from_template("公司有多少员工？")
direct_chain = direct_prompt | llm | StrOutputParser()
direct_result = direct_chain.invoke({})
print(f"直接问 LLM: {direct_result}")
print(f"通过 RAG: {response.content}")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | `ModuleNotFoundError: No module named 'langchain'` | 运行 `pip install langchain langchain-openai chromadb` |
| 2 | `OpenAI API key not found` | 设置环境变量 `export OPENAI_API_KEY=sk-xxx`（或用 `.env` 文件） |
| 3 | 检索结果不相关 | 增大 `k` 值（如 `search_kwargs={"k": 5}`），或检查 embedding 模型是否匹配 |
| 4 | 回答出现幻觉 | 在 Prompt 中强调"如果资料中没有相关信息，请说不知道" |
| 5 | Chroma 数据库冲突 | 删除 `./chroma_db` 目录重新运行，或换一个 `collection_name` |
| 6 | 网络超时（国内环境） | 设置代理或使用兼容 API：`export OPENAI_API_BASE=https://your-proxy/v1` |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| RAG | 检索增强生成：先从知识库找到相关信息，再让 LLM 基于这些信息生成回答 |
| Ingestion | 文档摄入：将原始文档加载、切分、向量化并存入数据库的过程 |
| Embedding | 将文本转为数字向量，使计算机能计算文本之间的语义相似度 |
| Vector Store | 向量数据库：专门存储和检索向量的数据库，支持高效的相似度搜索 |
| Chunk | 文档被切分成的小段，每段独立向量化并索引 |
| Retriever | 检索器：根据用户问题，从向量库中找到最相关的文档片段 |
| Augmentation | 增强：将检索到的文档注入到 Prompt 中，为 LLM 提供额外上下文 |
| LCEL | LangChain Expression Language：LangChain 的链式调用语法 |
| Prompt Template | 提示词模板：包含变量占位符的 Prompt，运行时填入具体值 |
| 闭卷考试 vs 开卷考试 | 传统 LLM = 闭卷（只靠记忆），RAG = 开卷（翻书找答案再回答） |

## ✅ 验收清单
- [ ] 能说出 LLM 三大局限（知识截止、幻觉、私有数据）
- [ ] 能画出 RAG 四步流程图（加载→索引→检索→生成）
- [ ] 代码能完整运行，输出相关回答
- [ ] 理解 `vectorstore.as_retriever()` 的作用
- [ ] 能对比"用 RAG"和"不用 RAG"的区别
- [ ] 理解 `RunnablePassthrough` 的作用（直通原始输入）

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
