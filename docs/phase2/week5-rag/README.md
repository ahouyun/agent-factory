# Week 5：RAG 检索增强生成

> **Phase 2 第一周** — 让大模型不再"闭卷考试"，学会开卷答题

---

## Day 1：RAG 基础原理

### 📅 Day 1：RAG 基础原理 — 让模型学会"查字典"

### 🧭 今日方向
理解 RAG（Retrieval-Augmented Generation）的核心思想：先检索、再生成。

### 🎯 生活比喻
想象你在考试。闭卷考试只能凭记忆答题，但如果是开卷考试，你可以翻书找到相关段落再组织答案。RAG 就是让大模型从"闭卷"变成"开卷"——先从知识库中检索相关内容，再基于检索结果生成回答。

### 📋 今日三件事
1. 理解 RAG 的完整流程（索引 → 检索 → 生成）
2. 掌握 Embedding 向量化的基本概念
3. 用 LangChain + OpenAI 搭建第一个 RAG Demo

### 🗺️ 手把手路线

#### Step 1：安装环境
**做什么**：创建虚拟环境并安装依赖
**为什么**：隔离项目环境，避免版本冲突
**成功标志**：`pip list` 能看到 langchain、chromadb、openai 等包

```bash
python -m venv rag-env
source rag-env/bin/activate  # Windows: rag-env\Scripts\activate
pip install langchain langchain-openai chromadb tiktoken
```

#### Step 2：理解 RAG 三阶段
**做什么**：画出 RAG 流程图并标注每一步
**为什么**：理解全局才能写好每一步代码
**成功标志**：能手绘出 Index → Retrieve → Generate 三步流程

#### Step 3：编写第一个 RAG Demo
**做什么**：用 LangChain 实现文档问答
**为什么**：动手做是最快的学习方式
**成功标志**：能基于文档内容回答用户提问，且回答准确

### 💻 代码区

```python
"""
Week 5 Day 1：第一个 RAG Demo
功能：加载一段文本，建立索引，回答用户提问
"""
import os
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# ========== 第一步：准备文档 ==========
# 模拟一段关于Python的知识库文本
raw_text = """
Python 是一种高级编程语言，由 Guido van Rossum 于 1991 年发布。
Python 的设计哲学强调代码的可读性和简洁性。
Python 支持多种编程范式，包括面向对象、函数式和过程式编程。
Python 拥有庞大的标准库和第三方库生态系统。
Django 和 Flask 是 Python 最流行的 Web 框架。
NumPy 和 Pandas 是 Python 数据分析的核心库。
PyTorch 和 TensorFlow 是 Python 深度学习的主要框架。
Python 3.12 引入了类型参数语法的重大改进。
"""

# 将文本写入临时文件
with open("python_knowledge.txt", "w", encoding="utf-8") as f:
    f.write(raw_text)

# ========== 第二步：文档分块 ==========
# 为什么分块？因为 Embedding 模型有 token 限制，且太长的文本检索效果差
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=200,       # 每个块最大 200 字符
    chunk_overlap=50,     # 块之间重叠 50 字符，保证上下文连续性
    separators=["\n\n", "\n", "。", "，", " "]  # 分割优先级
)
loader = TextLoader("python_knowledge.txt", encoding="utf-8")
documents = loader.load()
chunks = text_splitter.split_documents(documents)
print(f"文档被切分为 {len(chunks)} 个块")

# ========== 第三步：向量化并存入 Chroma ==========
# Embedding 模型将文本转换为向量，向量相似度用于检索
embeddings = OpenAIEmbeddings()  # 默认使用 text-embedding-3-small
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"  # 持久化存储目录
)
print(f"向量库中存入 {vectorstore._collection.count()} 个向量")

# ========== 第四步：检索 + 生成 ==========
# 构建 Prompt 模板，告诉模型如何基于检索结果回答
prompt_template = PromptTemplate(
    template="""你是一个专业的技术助手。请根据以下参考内容回答用户的问题。
如果参考内容中没有相关信息，请坦诚说"我不确定"，不要编造答案。

参考内容：
{context}

用户问题：{question}

回答：""",
    input_variables=["context", "question"]
)

# 初始化大语言模型
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 构建 RAG 链：检索相关文档 → 填入 Prompt → 送入 LLM
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",  # 将所有检索结果拼接后一次性送入
    retriever=vectorstore.as_retriever(
        search_kwargs={"k": 3}  # 检索最相关的 3 个块
    ),
    chain_type_kwargs={"prompt": prompt_template},
    return_source_documents=True  # 返回引用的源文档
)

# ========== 第五步：测试问答 ==========
question = "Python 有哪些流行的 Web 框架？"
result = qa_chain.invoke({"query": question})
print(f"\n问题：{question}")
print(f"回答：{result['result']}")
print(f"\n引用了 {len(result['source_documents'])} 个源文档")

# 清理临时文件
os.remove("python_knowledge.txt")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| `No module named 'chromadb'` | 确认激活了虚拟环境，重新 `pip install chromadb` |
| OpenAI API 超时 | 设置 `export OPENAI_API_KEY=sk-xxx`，检查网络/代理 |
| 检索结果为空 | 检查 chunk_size 是否太小，或文本内容是否为空 |
| 向量库持久化失败 | 检查 `persist_directory` 路径是否有写权限 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| RAG | 检索增强生成，先查后答 | 开卷考试 |
| Embedding | 将文本转为数字向量 | 给每句话画一个"指纹" |
| Vector Store | 存储向量的数据库 | 按指纹分类的图书馆 |
| Chunk | 文档切分后的片段 | 书中的段落索引 |
| Similarity Search | 基于向量距离的检索 | 找"指纹"最像的文档 |

### ✅ 验收清单
- [ ] 能画出 RAG 三阶段流程图
- [ ] 理解为什么要分块（chunk）
- [ ] 成功运行 Day 1 的代码
- [ ] 能解释 Embedding 的作用
- [ ] 换一个问题测试，确认检索结果合理

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 2 将深入学习 Chroma 向量库的高级用法和文档分块策略，请确保 Chroma 已安装并能正常运行。

---

## Day 2：Chroma 向量库与文档分块

### 📅 Day 2：Chroma 向量库深度使用 — 给知识建一座"智能图书馆"

### 🧭 今日方向
深入掌握 Chroma 向量库的 CRUD 操作和多种文档分块策略。

### 🎯 生活比喻
昨天我们把书拆成了段落放进图书馆（Chroma）。今天我们要学习如何高效管理这座图书馆——如何分类编目（元数据过滤）、如何优化书架摆放（分块策略），以及如何处理不同格式的"书籍"（PDF、网页等）。

### 📋 今日三件事
1. 掌握 Chroma 的增删改查操作
2. 对比 3 种文档分块策略的优劣
3. 学会使用元数据过滤提升检索精度

### 🗺️ 手把手路线

#### Step 1：Chroma CRUD 操作
**做什么**：手动创建集合、添加文档、查询、更新、删除
**为什么**：理解底层操作才能在出问题时排查
**成功标志**：能独立完成集合的完整生命周期管理

#### Step 2：对比分块策略
**做什么**：用固定长度、递归分割、语义分割三种方式处理同一文档
**为什么**：分块策略直接影响检索质量
**成功标志**：能说出每种策略的适用场景

#### Step 3：元数据过滤
**做什么**：为文档添加元数据标签，用过滤条件精准检索
**为什么**：不是所有检索都适合纯语义搜索
**成功标志**：能按"来源+语义"双重条件检索

### 💻 代码区

```python
"""
Week 5 Day 2：Chroma 向量库深度使用与分块策略对比
"""
import chromadb
from chromadb.config import Settings
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    CharacterTextSplitter,
)
from langchain_openai import OpenAIEmbeddings

# ========== Part 1：Chroma CRUD 操作 ==========

# 创建 Chroma 客户端（内存模式，重启即清空）
client = chromadb.Client()

# 创建一个集合（相当于数据库中的"表"）
collection = client.create_collection(
    name="python_docs",
    metadata={"description": "Python 技术文档集合"}
)
print(f"集合 '{collection.name}' 创建成功，当前文档数：{collection.count()}")

# 添加文档（自动调用 Embedding 模型向量化）
collection.add(
    documents=[
        "Python 的 GIL（全局解释器锁）限制了多线程的并行执行。",
        "Python 3.11 引入了异常组和 except* 语法。",
        "FastAPI 是一个高性能的 Python Web 框架，基于类型提示。",
        "SQLAlchemy 是 Python 最流行的 ORM 框架。",
        "Celery 是 Python 分布式任务队列的标准解决方案。",
    ],
    ids=["doc1", "doc2", "doc3", "doc4", "doc5"],
    # 元数据：可以用来过滤
    metadatas=[
        {"topic": "python-core", "version": "3.9"},
        {"topic": "python-core", "version": "3.11"},
        {"topic": "web-framework", "version": "latest"},
        {"topic": "database", "version": "latest"},
        {"topic": "async", "version": "latest"},
    ]
)
print(f"添加完成，集合文档数：{collection.count()}")

# 查询：语义搜索
results = collection.query(
    query_texts=["Python 如何处理并发任务？"],
    n_results=3  # 返回最相关的 3 个结果
)
print("\n--- 语义搜索结果 ---")
for i, doc in enumerate(results["documents"][0]):
    distance = results["distances"][0][i]
    print(f"  {i+1}. [距离:{distance:.4f}] {doc}")

# 查询：带元数据过滤
results_filtered = collection.query(
    query_texts=["Python 框架"],
    n_results=2,
    where={"topic": "web-framework"}  # 只检索 web-framework 类别
)
print("\n--- 过滤后搜索结果 ---")
for doc in results_filtered["documents"][0]:
    print(f"  - {doc}")

# 更新文档
collection.update(
    ids=["doc1"],
    documents=["Python 的 GIL（全局解释器锁）限制了多线程并行，multiprocessing 是替代方案。"],
    metadatas=[{"topic": "python-core", "version": "3.9", "updated": True}]
)
print(f"\n更新后查询 doc1：{collection.get(ids=['doc1'])['documents'][0]}")

# 删除文档
collection.delete(ids=["doc5"])
print(f"删除后集合文档数：{collection.count()}")

# ========== Part 2：分块策略对比 ==========

sample_text = """
人工智能（AI）是计算机科学的一个分支，致力于创建能够执行通常需要人类智能才能完成的任务的系统。
机器学习是人工智能的核心子领域，它使计算机能够从数据中学习而无需显式编程。
深度学习是机器学习的一个子集，使用多层神经网络来学习数据的层次化表示。
自然语言处理（NLP）是 AI 的一个重要方向，专注于让计算机理解和生成人类语言。
大语言模型（LLM）如 GPT 和 BERT 是 NLP 领域的革命性突破。
RAG（检索增强生成）通过将检索系统与 LLM 结合，有效减少了模型的幻觉问题。
向量数据库如 Chroma、Pinecone 和 Weaviate 为 RAG 提供了高效的相似性搜索能力。
"""

# 策略1：固定长度分割
splitter_fixed = CharacterTextSplitter(
    chunk_size=100,
    chunk_overlap=0,
    separator="\n"
)
chunks_fixed = splitter_fixed.split_text(sample_text)
print(f"\n--- 策略1：固定长度分割 → {len(chunks_fixed)} 块 ---")
for i, chunk in enumerate(chunks_fixed):
    print(f"  [{i}] ({len(chunk)}字) {chunk[:50]}...")

# 策略2：递归分割（推荐）
splitter_recursive = RecursiveCharacterTextSplitter(
    chunk_size=150,
    chunk_overlap=30,
    separators=["\n\n", "\n", "。", "，", " "]
)
chunks_recursive = splitter_recursive.split_text(sample_text)
print(f"\n--- 策略2：递归分割 → {len(chunks_recursive)} 块 ---")
for i, chunk in enumerate(chunks_recursive):
    print(f"  [{i}] ({len(chunk)}字) {chunk[:50]}...")

# 策略3：按段落分割
splitter_paragraph = CharacterTextSplitter(
    chunk_size=500,  # 设大一些，让段落保持完整
    chunk_overlap=0,
    separator="\n"
)
chunks_paragraph = splitter_paragraph.split_text(sample_text)
print(f"\n--- 策略3：按段落分割 → {len(chunks_paragraph)} 块 ---")
for i, chunk in enumerate(chunks_paragraph):
    print(f"  [{i}] ({len(chunk)}字) {chunk[:60]}...")

print("\n总结：")
print("  固定长度：简单粗暴，可能切断语义")
print("  递归分割：智能寻找最佳分割点（推荐）")
print("  段落分割：保持语义完整，但块大小不均匀")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| Chroma 查询返回空 | 确认 `add()` 已执行且 `query_texts` 不为空 |
| 元数据过滤不生效 | 检查 where 条件的 key 必须和添加时一致 |
| 分块后出现乱码 | 检查文本编码，使用 `encoding="utf-8"` |
| 内存模式数据丢失 | 正常现象，用 `PersistentClient(path="./db")` 持久化 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Collection | Chroma 中的文档集合 | 图书馆的一个书架 |
| Metadata | 附在文档上的标签信息 | 图书的分类编号 |
| where 过滤 | 按元数据条件筛选 | 按分类号找书 |
| chunk_size | 每个文本块的最大长度 | 每页纸的字数上限 |
| chunk_overlap | 相邻块的重叠部分 | 翻页时上下文的衔接 |

### ✅ 验收清单
- [ ] 能独立完成 Chroma 的增删改查
- [ ] 理解元数据过滤的使用场景
- [ ] 对比了 3 种分块策略并能说出各自优劣
- [ ] 代码运行无报错

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 3 将学习混合检索（BM25 + 向量检索）和 Query 改写技术，请确保已安装 `rank_bm25` 包。

---

## Day 3：混合检索与 Query 改写

### 📅 Day 3：混合检索 — 关键词 + 语义，两条腿走路更稳

### 🧭 今日方向
掌握 BM25 关键词检索 + 向量语义检索的混合策略，以及 Query 改写技术。

### 🎯 生活比喻
想象你要在图书馆找一本书。如果你记得书名关键词（比如"Python机器学习"），直接搜关键词最快；如果你只记得"教计算机从数据中学习的技术"，语义搜索更合适。混合检索就是两种方式同时用，取长补短。Query 改写则是帮你把模糊的问题变成精确的搜索词。

### 📋 今日三件事
1. 实现 BM25 关键词检索
2. 构建 BM25 + 向量检索的混合检索系统
3. 实现 Query 改写（HyDE + 多查询扩展）

### 🗺️ 手把手路线

#### Step 1：实现 BM25 检索
**做什么**：用 `rank_bm25` 库实现关键词检索
**为什么**：BM25 是经典的信息检索算法，对精确关键词匹配效果好
**成功标志**：输入关键词能返回相关文档

#### Step 2：构建混合检索器
**做什么**：将 BM25 和向量检索的结果用 RRF（倒数排名融合）合并
**为什么**：两种检索方式互补，混合效果通常优于单一方式
**成功标志**：混合检索结果排序合理

#### Step 3：Query 改写
**做什么**：用 LLM 将用户 Query 改写为更适合检索的形式
**为什么**：用户的问题往往口语化，不适合直接检索
**成功标志**：改写后的 Query 检索结果更精准

### 💻 代码区

```python
"""
Week 5 Day 3：混合检索与 Query 改写
"""
import numpy as np
from rank_bm25 import BM25Okapi
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate

# ========== 准备文档库 ==========
documents = [
    Document(page_content="Python GIL 是全局解释器锁，限制了多线程并发执行。", metadata={"source": "python_core"}),
    Document(page_content="asyncio 是 Python 的异步编程框架，基于事件循环实现并发。", metadata={"source": "python_async"}),
    Document(page_content="FastAPI 使用 Starlette 框架，支持异步请求处理。", metadata={"source": "web_framework"}),
    Document(page_content="Django 是全功能的 Python Web 框架，内置 ORM 和管理后台。", metadata={"source": "web_framework"}),
    Document(page_content="SQLAlchemy 是 Python 的 ORM 库，支持同步和异步操作。", metadata={"source": "database"}),
    Document(page_content="Redis 是内存数据库，常用于缓存和消息队列。", metadata={"source": "database"}),
    Document(page_content="Celery 是分布式任务队列，支持 Redis 和 RabbitMQ 作为 broker。", metadata={"source": "async"}),
    Document(page_content="LangChain 是构建 LLM 应用的框架，支持 RAG、Agent 等模式。", metadata={"source": "ai_framework"}),
    Document(page_content="RAG 通过检索外部知识来增强大语言模型的回答准确性。", metadata={"source": "ai_concept"}),
    Document(page_content="向量数据库 Chroma 支持相似性搜索，是 RAG 的核心组件。", metadata={"source": "ai_tool"}),
]

doc_texts = [doc.page_content for doc in documents]

# ========== Part 1：BM25 关键词检索 ==========
# BM25 基于词频和逆文档频率计算相关性
# 先做分词（中文按字符切分，实际项目用 jieba）
tokenized_corpus = [list(text) for text in doc_texts]  # 简单按字符分词
bm25 = BM25Okapi(tokenized_corpus)

query = "Python 异步编程"
tokenized_query = list(query)
bm25_scores = bm25.get_scores(tokenized_query)

print("--- BM25 关键词检索 ---")
ranked_indices = np.argsort(bm25_scores)[::-1]
for idx in ranked_indices[:3]:
    print(f"  [分数:{bm25_scores[idx]:.4f}] {doc_texts[idx]}")

# ========== Part 2：向量检索 ==========
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(documents=documents, embedding=embeddings)
vector_results = vectorstore.similarity_search_with_relevance_scores(query, k=3)

print("\n--- 向量语义检索 ---")
for doc, score in vector_results:
    print(f"  [分数:{score:.4f}] {doc.page_content}")

# ========== Part 3：混合检索 (RRF 融合) ==========
def reciprocal_rank_fusion(
    lists: list[list],
    k: int = 60
) -> list[tuple]:
    """
    倒数排名融合（Reciprocal Rank Fusion）
    将多个排序列表合并为一个统一排序
    k=60 是论文中的默认值
    """
    fused_scores = {}
    for doc_content in set().union(*[set(l) for l in lists]):
        fused_scores[doc_content] = 0
        for rank_list in lists:
            for rank, item in enumerate(rank_list):
                if item == doc_content:
                    fused_scores[doc_content] += 1 / (k + rank + 1)
    # 按融合分数排序
    sorted_results = sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_results

# 构造两个排序列表
bm25_ranked = [doc_texts[i] for i in ranked_indices[:5]]
vector_ranked = [doc.page_content for doc, _ in vectorstore.similarity_search(query, k=5)]

fused = reciprocal_rank_fusion([bm25_ranked, vector_ranked])
print("\n--- 混合检索（RRF）---")
for content, score in fused[:3]:
    print(f"  [融合分数:{score:.6f}] {content}")

# ========== Part 4：Query 改写 ==========

# 方法1：HyDE（假设性文档嵌入）
# 思路：让 LLM 先生成一个"假想答案"，再用这个答案去检索
hyde_prompt = ChatPromptTemplate.from_template(
    "请写一段简短的技术文档来回答以下问题（约100字）：\n问题：{question}"
)
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

hyde_chain = hyde_prompt | llm
hyde_response = hyde_chain.invoke({"question": query})
hyde_text = hyde_response.content
print(f"\n--- HyDE 假想文档 ---")
print(f"  {hyde_text}")

# 用假想文档进行向量检索
hyde_results = vectorstore.similarity_search(hyde_text, k=3)
print(f"\n--- 基于 HyDE 的检索结果 ---")
for doc in hyde_results:
    print(f"  - {doc.page_content}")

# 方法2：多查询扩展
# 思路：让 LLM 将一个问题拆成多个子问题，分别检索后合并
multi_query_prompt = ChatPromptTemplate.from_template(
    "请将以下技术问题改写为 3 个不同的检索查询，每行一个：\n问题：{question}"
)
multi_query_chain = multi_query_prompt | llm
mq_response = multi_query_chain.invoke({"question": query})
queries = [q.strip() for q in mq_response.content.strip().split("\n") if q.strip()]
print(f"\n--- 多查询扩展 ---")
for q in queries:
    print(f"  - {q}")

# 对每个改写后的查询分别检索
all_results = []
for q in queries:
    results = vectorstore.similarity_search(q, k=2)
    all_results.extend(results)

# 去重
seen = set()
unique_results = []
for doc in all_results:
    if doc.page_content not in seen:
        seen.add(doc.page_content)
        unique_results.append(doc)
print(f"\n--- 多查询扩展检索结果（去重后 {len(unique_results)} 条）---")
for doc in unique_results:
    print(f"  - {doc.page_content}")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| BM25 分词效果差 | 中文项目用 `jieba` 分词替代按字符切分 |
| RRF 融合分数全为 0 | 检查列表中是否有重复元素，确保匹配逻辑正确 |
| HyDE 生成内容太长 | 在 prompt 中明确限制字数 |
| 多查询结果重复多 | 调整每个查询的 `k` 值，或增加去重逻辑 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| BM25 | 基于词频的经典检索算法 | 按关键词搜书名 |
| RRF | 倒数排名融合，合并多个排序 | 综合多个评委打分 |
| HyDE | 先生成假想答案再检索 | 先写草稿再找参考 |
| Query 改写 | 把口语化问题变成检索友好的查询 | 把"那个啥"翻译成专业术语 |

### ✅ 验收清单
- [ ] BM25 能返回合理的关键词匹配结果
- [ ] 混合检索效果优于单一检索
- [ ] 理解 HyDE 和多查询扩展的原理
- [ ] 代码运行无报错

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 4 将学习 RAG 评估方法和 RAGAS 框架，请确保理解 Recall、Precision 等指标含义。

---

## Day 4：RAG 评估

### 📅 Day 4：RAG 评估 — 你的 RAG 到底好不好用？量化说了算

### 🧭 今日方向
掌握 RAG 系统的评估指标体系和自动化评估工具。

### 🎯 生活比喻
你做了一个搜索引擎，但怎么知道它好不好用？就像考试后要对答案一样，我们需要用标准化的方法来评估 RAG 系统——检索准不准（Precision）、回答全不全（Recall）、答案对不对（Faithfulness）。

### 📋 今日三件事
1. 理解 RAG 评估的 4 个核心维度
2. 用 RAGAS 框架搭建自动化评估 Pipeline
3. 分析评估结果并优化 RAG 系统

### 🗺️ 手把手路线

#### Step 1：准备评估数据集
**做什么**：构建包含 question、context、answer、ground_truth 的评估数据集
**为什么**：评估需要"标准答案"作为参照
**成功标志**：成功创建包含至少 5 个样本的评估数据集

#### Step 2：运行 RAGAS 评估
**做什么**：用 RAGAS 库对 RAG 系统进行自动化评估
**为什么**：手动评估效率低且主观，自动化评估更客观可靠
**成功标志**：输出 4 个核心指标的评分

#### Step 3：分析并优化
**做什么**：根据评估结果定位 RAG 系统的薄弱环节
**为什么**：评估的目的是指导优化，不是走形式
**成功标志**：能根据低分指标给出具体的优化方向

### 💻 代码区

```python
"""
Week 5 Day 4：RAG 评估实践
功能：手动实现 RAG 评估指标（不依赖 RAGAS 库的复杂依赖）
"""
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import json

# ========== 准备知识库 ==========
knowledge_base = [
    "Python 3.12 引入了改进的错误消息和类型参数语法。",
    "Django 是一个全功能的 Web 框架，提供 ORM、Admin、Auth 等内置功能。",
    "FastAPI 基于 Starlette 和 Pydantic，支持自动生成 API 文档。",
    "SQLAlchemy 2.0 引入了新的异步 API 和声明式映射方式。",
    "Redis 支持字符串、哈希、列表、集合、有序集合五种数据结构。",
    "Celery 支持定时任务（beat）和异步任务，broker 支持 Redis 和 RabbitMQ。",
    "LangChain 提供了 LCEL（LangChain Expression Language）用于构建链。",
    "ChromaDB 是一个轻量级的嵌入式向量数据库，支持持久化存储。",
]

# ========== 构建简易 RAG 系统 ==========
class SimpleRAG:
    def __init__(self, docs: list[str]):
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        self.embeddings = OpenAIEmbeddings()

        # 创建向量库
        documents = [Document(page_content=doc) for doc in docs]
        self.vectorstore = Chroma.from_documents(documents, self.embeddings)

        # Prompt 模板
        self.prompt = ChatPromptTemplate.from_template(
            """基于以下参考资料回答问题。只使用参考资料中的信息。

参考资料：
{context}

问题：{question}

回答："""
        )
        self.chain = self.prompt | self.llm | StrOutputParser()

    def query(self, question: str, k: int = 3) -> dict:
        """执行 RAG 查询，返回回答和检索到的文档"""
        # 检索
        retrieved_docs = self.vectorstore.similarity_search(question, k=k)
        context = "\n".join([doc.page_content for doc in retrieved_docs])

        # 生成
        answer = self.chain.invoke({"context": context, "question": question})

        return {
            "question": question,
            "answer": answer,
            "retrieved_contexts": [doc.page_content for doc in retrieved_docs],
        }

# ========== 评估指标实现 ==========

def precision_at_k(retrieved: list[str], ground_truth: str, k: int = 3) -> float:
    """
    检索精确率：检索到的文档中有多少与问题相关
    简化实现：检查标准答案中的关键词是否出现在检索结果中
    """
    gt_keywords = set(ground_truth.lower().split())
    retrieved_text = " ".join(retrieved[:k]).lower()
    hits = sum(1 for kw in gt_keywords if kw in retrieved_text)
    return hits / len(gt_keywords) if gt_keywords else 0.0

def recall_at_k(retrieved: list[str], ground_truth: str, k: int = 3) -> float:
    """
    检索召回率：相关文档有多少被检索到了
    简化实现：检查检索结果覆盖了多少标准答案
    """
    gt_keywords = set(ground_truth.lower().split())
    all_retrieved = " ".join(retrieved[:k]).lower()
    hits = sum(1 for kw in gt_keywords if kw in all_retrieved)
    return hits / len(gt_keywords) if gt_keywords else 0.0

def faithfulness(answer: str, contexts: list[str]) -> float:
    """
    忠实度：回答是否忠实于检索到的文档
    简化实现：检查回答中的关键词是否能在上下文中找到
    """
    answer_words = set(answer.lower().split())
    context_text = " ".join(contexts).lower()
    # 排除停用词
    stopwords = {"的", "了", "是", "在", "和", "有", "a", "the", "is", "and", "or", "in", "to"}
    answer_words -= stopwords
    if not answer_words:
        return 1.0
    grounded = sum(1 for w in answer_words if w in context_text)
    return grounded / len(answer_words)

# ========== 运行评估 ==========

rag = SimpleRAG(knowledge_base)

# 评估数据集（问题 + 标准答案 + 相关知识）
eval_dataset = [
    {
        "question": "FastAPI 有什么特点？",
        "ground_truth": "FastAPI 基于 Starlette 和 Pydantic，支持自动生成 API 文档",
    },
    {
        "question": "Redis 支持哪些数据结构？",
        "ground_truth": "Redis 支持字符串、哈希、列表、集合、有序集合五种数据结构",
    },
    {
        "question": "LangChain 的 LCEL 是什么？",
        "ground_truth": "LangChain 提供了 LCEL 用于构建链",
    },
    {
        "question": "Django 和 FastAPI 有什么区别？",
        "ground_truth": "Django 是全功能框架提供 ORM Admin Auth FastAPI 基于 Starlette Pydantic 自动生成文档",
    },
    {
        "question": "Celery 支持哪些 broker？",
        "ground_truth": "Celery 支持 Redis 和 RabbitMQ 作为 broker",
    },
]

# 运行评估
results = []
for item in eval_dataset:
    rag_result = rag.query(item["question"])
    metrics = {
        "question": item["question"],
        "precision": precision_at_k(rag_result["retrieved_contexts"], item["ground_truth"]),
        "recall": recall_at_k(rag_result["retrieved_contexts"], item["ground_truth"]),
        "faithfulness": faithfulness(rag_result["answer"], rag_result["retrieved_contexts"]),
    }
    results.append(metrics)
    print(f"\nQ: {metrics['question']}")
    print(f"  精确率: {metrics['precision']:.2f}  召回率: {metrics['recall']:.2f}  忠实度: {metrics['faithfulness']:.2f}")

# 汇总统计
avg_precision = sum(r["precision"] for r in results) / len(results)
avg_recall = sum(r["recall"] for r in results) / len(results)
avg_faithfulness = sum(r["faithfulness"] for r in results) / len(results)
print(f"\n========== 评估汇总 ==========")
print(f"平均精确率: {avg_precision:.2f}")
print(f"平均召回率: {avg_recall:.2f}")
print(f"平均忠实度: {avg_faithfulness:.2f}")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| RAGAS 安装依赖冲突 | 使用本文手写评估指标，避免复杂依赖 |
| 精确率/召回率全为 0 | 检查 ground_truth 格式，确保关键词匹配逻辑正确 |
| 忠实度波动大 | 这是正常的，LLM 生成具有随机性 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Precision | 检索结果中相关的比例 | 找的 10 本书里有几本是对的 |
| Recall | 相关文档被找到的比例 | 书架上 10 本对的书你找到了几本 |
| Faithfulness | 回答是否忠实于检索内容 | 答案有没有"抄"参考资料 |
| Ground Truth | 标准答案 | 考试的参考答案 |

### ✅ 验收清单
- [ ] 理解 4 个核心评估维度
- [ ] 成功运行评估代码并得到评分
- [ ] 能根据评分判断 RAG 系统的优劣
- [ ] 知道哪些指标低时应该怎么优化

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 5 将学习 Agentic RAG — 让 Agent 自主决定是否检索、检索什么、何时停止，请确保已理解基础 RAG 流程。

---

## Day 5：Agentic RAG

### 📅 Day 5：Agentic RAG — 让 Agent 自主决策的智能检索

### 🧭 今日方向
将 RAG 升级为 Agentic RAG：Agent 自主决定何时检索、检索什么、如何处理检索结果。

### 🎯 生活比喻
传统的 RAG 就像一个只会查字典的学生——每次被问到问题就去查。而 Agentic RAG 就像一个聪明的研究员：它会先判断自己知不知道答案，如果知道就直接回答；如果不确定，它会主动选择去哪个"图书馆"查、用什么关键词查；查到结果后还会评估质量，觉得不够好就再查一次。

### 📋 今日三件事
1. 理解 Agentic RAG 与传统 RAG 的区别
2. 实现带路由决策的多知识库 RAG
3. 实现带反思机制的 Agentic RAG

### 🗺️ 手把手路线

#### Step 1：理解 Agent Loop
**做什么**：理解 "Observe → Think → Act → Observe..." 的循环
**为什么**：Agentic RAG 的核心是 Agent 的自主决策循环
**成功标志**：能画出 Agent Loop 的流程图

#### Step 2：实现多路由 RAG
**做什么**：创建多个知识库（技术文档、产品文档、FAQ），Agent 根据问题路由到正确的知识库
**为什么**：不同知识库内容不同，精准路由能提升检索效果
**成功标志**：Agent 能正确将问题路由到对应知识库

#### Step 3：添加反思机制
**做什么**：让 Agent 评估检索结果质量，不满意时重新检索
**为什么**：一次检索不一定能拿到最好的结果
**成功标志**：Agent 能在结果不好时自动重试

### 💻 代码区

```python
"""
Week 5 Day 5：Agentic RAG — 带路由和反思的智能检索
"""
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.tools import tool
from typing import Literal
import json

# ========== 准备多个知识库 ==========

# 技术文档库
tech_docs = [
    "Python 3.12 引入了改进的错误消息格式和类型参数语法。",
    "FastAPI 基于 Starlette 和 Pydantic，支持异步请求和自动文档生成。",
    "Django 是全功能 Web 框架，内置 ORM、Admin、Auth、Forms 等组件。",
    "Celery 是分布式任务队列，支持 Redis 和 RabbitMQ 作为消息 broker。",
]

# 产品文档库
product_docs = [
    "我们的产品支持 SSO 单点登录，兼容 SAML 2.0 和 OIDC 协议。",
    "产品定价分为三个层级：基础版（免费）、专业版（99元/月）、企业版（定制）。",
    "数据导出支持 CSV、Excel、JSON 三种格式，每日有导出次数限制。",
]

# FAQ 知识库
faq_docs = [
    "忘记密码可以通过邮箱重置，链接有效期为 24 小时。",
    "API 调用限制为每分钟 60 次，超出会返回 429 状态码。",
    "技术支持邮箱为 support@example.com，工作日 24 小时内回复。",
]

# 为每个知识库创建独立的向量库
embeddings = OpenAIEmbeddings()

def create_store(docs: list[str], name: str) -> Chroma:
    documents = [Document(page_content=doc) for doc in docs]
    return Chroma.from_documents(documents, embeddings, collection_name=name)

tech_store = create_store(tech_docs, "tech")
product_store = create_store(product_docs, "product")
faq_store = create_store(faq_docs, "faq")

stores = {
    "tech": tech_store,
    "product": product_store,
    "faq": faq_store,
}

# ========== 路由 Agent ==========
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

routing_prompt = ChatPromptTemplate.from_template(
    """你是一个智能路由助手。根据用户的问题，决定应该查询哪个知识库。

可选的知识库：
- tech: 技术文档（编程、框架、工具相关）
- product: 产品文档（功能、定价、规格相关）
- faq: 常见问题（使用帮助、账号、客服相关）

用户问题：{question}

请只回复知识库名称（tech/product/faq），不要回复其他内容。"""
)

routing_chain = routing_prompt | llm | StrOutputParser()

def route_query(question: str) -> str:
    """将问题路由到合适的知识库"""
    result = routing_chain.invoke({"question": question})
    # 提取知识库名称
    for key in stores:
        if key in result.lower():
            return key
    return "tech"  # 默认路由到技术文档

# ========== 反思 Agent ==========
reflect_prompt = ChatPromptTemplate.from_template(
    """你是一个严格的回答质量评估员。

用户问题：{question}
AI 回答：{answer}
检索到的参考资料：{contexts}

请评估回答质量，输出 JSON 格式：
{{"score": 1-5, "issues": ["问题1", "问题2"], "should_retry": true/false}}

评分标准：
- 5分：完美回答，准确且完整
- 4分：基本准确，略有遗漏
- 3分：部分正确，有明显遗漏
- 2分：大量错误或不相关
- 1分：完全错误或无法回答"""
)

reflect_chain = reflect_prompt | llm | StrOutputParser()

def reflect_on_answer(question: str, answer: str, contexts: list[str]) -> dict:
    """评估回答质量，决定是否需要重试"""
    result = reflect_chain.invoke({
        "question": question,
        "answer": answer,
        "contexts": "\n".join(contexts)
    })
    try:
        # 提取 JSON
        start = result.find("{")
        end = result.rfind("}") + 1
        return json.loads(result[start:end])
    except (json.JSONDecodeError, ValueError):
        return {"score": 3, "issues": ["解析失败"], "should_retry": False}

# ========== Agentic RAG 核心 ==========
answer_prompt = ChatPromptTemplate.from_template(
    """基于以下参考资料回答用户问题。

参考资料：
{context}

用户问题：{question}

回答："""
)
answer_chain = answer_prompt | llm | StrOutputParser()

def agentic_rag(question: str, max_retries: int = 2) -> dict:
    """
    Agentic RAG：自主决策的智能检索
    流程：路由 → 检索 → 生成 → 反思 → （重试）
    """
    history = []  # 记录决策过程

    # Step 1: 路由决策
    target_store = route_query(question)
    history.append(f"路由决策：选择 '{target_store}' 知识库")
    print(f"  [路由] 问题 '{question}' → {target_store} 知识库")

    for attempt in range(max_retries + 1):
        # Step 2: 检索
        docs = stores[target_store].similarity_search(question, k=2)
        contexts = [doc.page_content for doc in docs]
        history.append(f"检索（第{attempt+1}次）：获取 {len(contexts)} 条结果")

        # Step 3: 生成回答
        answer = answer_chain.invoke({
            "context": "\n".join(contexts),
            "question": question
        })
        history.append(f"生成回答：{answer[:80]}...")

        # Step 4: 反思
        if attempt < max_retries:
            reflection = reflect_on_answer(question, answer, contexts)
            history.append(f"反思评分：{reflection['score']}/5")

            if not reflection.get("should_retry", False):
                history.append("反思通过，无需重试")
                break

            history.append(f"反思不通过，重试原因：{reflection.get('issues', [])}")
            print(f"  [反思] 评分 {reflection['score']}/5，重试中...")
        else:
            history.append("已达最大重试次数，返回当前结果")

    return {
        "question": question,
        "answer": answer,
        "retrieved_contexts": contexts,
        "target_store": target_store,
        "attempts": attempt + 1,
        "history": history,
    }

# ========== 测试 ==========
test_questions = [
    "Python 的 FastAPI 框架有什么特点？",  # 应路由到 tech
    "产品的专业版多少钱？",                  # 应路由到 product
    "忘记密码怎么办？",                      # 应路由到 faq
]

for q in test_questions:
    print(f"\n{'='*50}")
    print(f"问题：{q}")
    result = agentic_rag(q)
    print(f"回答：{result['answer']}")
    print(f"检索次数：{result['attempts']}")
    print(f"决策过程：")
    for h in result["history"]:
        print(f"  - {h}")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| 路由判断错误 | 优化路由 prompt，增加更多示例 |
| 反思 JSON 解析失败 | 添加异常处理，返回默认评估 |
| 检索结果跨知识库 | 考虑使用混合检索，同时查多个知识库 |
| 无限循环重试 | 设置 `max_retries` 上限 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Agentic RAG | Agent 自主决策的 RAG | 聪明的研究员 |
| Router | 将问题分配到合适知识库 | 前台分诊台 |
| Reflection | 对回答质量的自我评估 | 答完题后检查一遍 |
| Retry | 检索/生成不满意时重试 | 查不到就换个关键词再查 |

### ✅ 验收清单
- [ ] 理解 Agentic RAG 与传统 RAG 的区别
- [ ] 路由 Agent 能正确分类问题
- [ ] 反思机制能有效评估回答质量
- [ ] 整个流程能端到端运行

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Week 5 结束！下周将进入 Agent 框架与安全领域，学习 Function Calling 和 LangChain。请确保 Python 环境正常，OpenAI API Key 可用。

---

## 📚 本周总结

| Day | 主题 | 核心技能 |
|-----|------|---------|
| 1 | RAG 基础原理 | 理解 RAG 三阶段，搭建第一个 Demo |
| 2 | Chroma 向量库 | CRUD 操作、元数据过滤、分块策略对比 |
| 3 | 混合检索 | BM25 + 向量检索、RRF 融合、Query 改写 |
| 4 | RAG 评估 | Precision/Recall/Faithfulness、自动化评估 |
| 5 | Agentic RAG | 路由决策、反思机制、自主检索 |

### 🎯 本周产出
- [x] 一个完整的 RAG Demo
- [x] 混合检索系统
- [x] RAG 评估 Pipeline
- [x] Agentic RAG 原型

### 📖 推荐阅读
- [LangChain RAG Tutorial](https://python.langchain.com/docs/tutorials/rag/)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [RAGAS Evaluation Framework](https://docs.ragas.io/)
- 论文：*Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks* (Lewis et al., 2020)
