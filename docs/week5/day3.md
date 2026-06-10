# 📅 Week 5 Day 3：文档加载 + 分块策略 + 向量索引

## 🧭 今日方向
> RAG 质量的 80% 取决于"切得好不好"。今天掌握不同文档格式的加载方法，以及核心分块策略：固定长度、递归字符、语义分块。

## 🎯 生活比喻
> 分块就像切菜。太大的块（整篇文档）吃不下去，太小的碎片（单个字）没有意义。好的切法是：大小适中、保留完整意思、每块之间有一点"重叠"以防遗漏关键信息。

## 📋 今日三件事
1. 掌握 PDF / Markdown / 网页等格式的文档加载方法
2. 理解并对比三种分块策略的优劣
3. 实现一个完整的 Ingestion Pipeline（加载 → 切分 → 向量化 → 存储）

## 🗺️ 手把手路线

### Step 1: 文档加载器
- 做什么: 用 LangChain 加载 PDF、TXT、Markdown 三种格式
- 为什么: 真实项目中数据格式千差万别，需要掌握多种加载方式
- 成功标志: 能成功加载三种格式的文档并获取内容

### Step 2: 分块策略对比
- 做什么: 用相同文档分别测试固定长度、递归字符、语义分块
- 为什么: 分块策略直接影响检索质量
- 成功标志: 能说出三种策略的优劣和适用场景

### Step 3: 完整 Pipeline
- 做什么: 把加载、切分、向量化串成一个完整流水线
- 为什么: 这是生产环境中的标准做法
- 成功标志: 从原始文件到可检索的向量库，一条命令完成

## 💻 代码区

```python
"""
Week 5 Day 3: 文档加载 + 分块策略 + 向量索引
安装依赖: pip install langchain langchain-community chromadb pypdf
"""

import os
from langchain.text_splitter import (
    CharacterTextSplitter,
    RecursiveCharacterTextSplitter,
)

# ========== 1. 文档加载 ==========

# --- 1a. 加载纯文本文件 ---
# 创建示例文件
sample_text = """
# 人工智能发展简史

## 1950s - 起源
阿兰·图灵提出了著名的图灵测试，被认为是人工智能的起点。

## 1960s-1970s - 第一次热潮
专家系统兴起，LISP 语言成为 AI 研究的主要工具。

## 1980s-1990s - AI 寒冬与复苏
两次 AI 寒冬让研究经费大幅削减。但机器学习方法逐渐成熟。

## 2000s-2010s - 深度学习崛起
2012 年 AlexNet 在 ImageNet 竞赛中获胜，深度学习进入爆发期。

## 2020s - 大模型时代
GPT、BERT 等大语言模型改变了 AI 的应用范式。
RAG（检索增强生成）成为连接知识库与 LLM 的关键技术。
"""

with open("ai_history.txt", "w", encoding="utf-8") as f:
    f.write(sample_text)

# LangChain 文档加载器
from langchain_community.document_loaders import TextLoader, DirectoryLoader

# 加载单个文件
loader = TextLoader("ai_history.txt", encoding="utf-8")
docs = loader.load()
print(f"加载了 {len(docs)} 个文档")
print(f"文档来源: {docs[0].metadata['source']}")
print(f"文档长度: {len(docs[0].page_content)} 字符\n")

# 加载整个目录
# loader = DirectoryLoader("./docs/", glob="**/*.txt", loader_cls=TextLoader)

# --- 1b. 加载 PDF 文件 ---
# from langchain_community.document_loaders import PyPDFLoader
# pdf_loader = PyPDFLoader("document.pdf")
# pdf_docs = pdf_loader.load()
# print(f"PDF 共 {len(pdf_docs)} 页")

# --- 1c. 加载 Markdown ---
# from langchain_community.document_loaders import UnstructuredMarkdownLoader
# md_loader = UnstructuredMarkdownLoader("readme.md")

# ========== 2. 分块策略对比 ==========

text = docs[0].page_content

# --- 2a. 固定长度分块（最简单）---
splitter_fixed = CharacterTextSplitter(
    chunk_size=100,       # 每块最大 100 字符
    chunk_overlap=20,     # 相邻块重叠 20 字符
    separator="\n",       # 优先在换行处切分
)
chunks_fixed = splitter_fixed.split_text(text)
print("=== 固定长度分块 ===")
for i, chunk in enumerate(chunks_fixed):
    print(f"  [{i}] ({len(chunk)}字) {chunk[:50]}...")
print()

# --- 2b. 递归字符分块（推荐，按层级递归切分）---
splitter_recursive = RecursiveCharacterTextSplitter(
    chunk_size=150,
    chunk_overlap=30,
    separators=["\n\n", "\n", "。", "，", " ", ""],  # 按层级递归
    length_function=len,
)
chunks_recursive = splitter_recursive.split_text(text)
print("=== 递归字符分块 ===")
for i, chunk in enumerate(chunks_recursive):
    print(f"  [{i}] ({len(chunk)}字) {chunk[:60]}...")
print()

# --- 2c. 语义分块（基于语义相似度，效果最好但最慢）---
# 语义分块需要 Embedding 模型，原理：
# 1. 将文本按句子切分
# 2. 计算相邻句子的语义相似度
# 3. 相似度低于阈值的地方就是分块边界
#
# from langchain_experimental.text_splitter import SemanticChunker
# from langchain_openai import OpenAIEmbeddings
#
# semantic_splitter = SemanticChunker(
#     OpenAIEmbeddings(),
#     breakpoint_threshold_type="percentile",
#     breakpoint_percentile_threshold=85,
# )
# chunks_semantic = semantic_splitter.split_text(text)

# ========== 3. 分块策略效果对比 ==========
print("=== 分块策略对比 ===")
print(f"固定长度: {len(chunks_fixed)} 块, 平均长度 {sum(len(c) for c in chunks_fixed)/len(chunks_fixed):.0f} 字")
print(f"递归字符: {len(chunks_recursive)} 块, 平均长度 {sum(len(c) for c in chunks_recursive)/len(chunks_recursive):.0f} 字")
print()

# ========== 4. 完整 Ingestion Pipeline ==========

from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

def create_rag_pipeline(
    documents_path: str,
    chunk_size: int = 500,
    chunk_overlap: int = 50,
    collection_name: str = "my_docs"
):
    """
    完整的 RAG Ingestion Pipeline
    输入: 文档路径
    输出: 可检索的向量数据库
    """
    print(f"\n{'='*50}")
    print(f"Pipeline 启动: {documents_path}")
    print(f"{'='*50}")

    # Step 1: 加载文档
    print("[1/4] 加载文档...")
    if os.path.isfile(documents_path):
        loader = TextLoader(documents_path, encoding="utf-8")
        docs = loader.load()
    elif os.path.isdir(documents_path):
        loader = DirectoryLoader(
            documents_path,
            glob="**/*.txt",
            loader_cls=TextLoader,
            loader_kwargs={"encoding": "utf-8"}
        )
        docs = loader.load()
    else:
        raise FileNotFoundError(f"路径不存在: {documents_path}")
    print(f"  ✓ 加载了 {len(docs)} 个文档")

    # Step 2: 分块
    print("[2/4] 文档分块...")
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", "。", "！", "？", "，", " ", ""],
    )
    chunks = splitter.split_documents(docs)
    print(f"  ✓ 切分为 {len(chunks)} 个 chunks")

    # Step 3: 向量化 + 存储
    print("[3/4] 向量化并存入 Chroma...")
    embeddings = OpenAIEmbeddings()
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=collection_name,
        persist_directory="./chroma_index"  # 持久化
    )
    print(f"  ✓ 索引完成，共 {vectorstore._collection.count()} 条记录")

    # Step 4: 创建检索器
    print("[4/4] 创建检索器...")
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 3}
    )
    print(f"  ✓ 检索器就绪 (top_k=3)")

    return retriever, vectorstore

# 运行 Pipeline
retriever, vectorstore = create_rag_pipeline("ai_history.txt")

# 测试检索
print("\n=== 检索测试 ===")
test_queries = ["什么时候 AI 经历了寒冬？", "RAG 是什么？"]
for query in test_queries:
    docs = retriever.invoke(query)
    print(f"\n查询: {query}")
    for i, doc in enumerate(docs):
        print(f"  [{i+1}] {doc.page_content[:80]}...")

# ========== 5. 最佳实践总结 ==========
print("""
=== 分块最佳实践 ===

1. chunk_size 选择:
   - 通用问答: 500-1000 字符
   - 精确引用: 200-500 字符
   - 摘要生成: 1000-2000 字符

2. chunk_overlap:
   - 通常为 chunk_size 的 10%-20%
   - 防止关键信息被切断

3. 分块策略选择:
   - 快速原型: 固定长度 (CharacterTextSplitter)
   - 生产环境: 递归字符 (RecursiveCharacterTextSplitter)
   - 高质量要求: 语义分块 (SemanticChunker)

4. 质量检验:
   - 每个 chunk 应该能独立回答一个问题
   - chunk 之间不应有过多重复内容
   - 专业术语不应被切断
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | PDF 加载乱码 | 检查 PDF 是否为扫描件，扫描件需先 OCR |
| 2 | 分块后内容不完整 | 增大 `chunk_size`，或调整 `separators` 优先在自然断句处切 |
| 3 | 分块太大/太小 | 用 `len(chunks)` 检查数量，一般 500-1000 字符/块较合理 |
| 4 | `DirectoryLoader` 读不到文件 | 检查 `glob` 参数和文件编码 |
| 5 | 向量索引构建很慢 | Embedding API 调用有延迟，可批量处理或用本地模型 |
| 6 | 持久化目录权限报错 | 以管理员权限运行，或换个目录路径 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Ingestion Pipeline | 文档摄入流水线：从原始文件到可检索向量库的自动化流程 |
| Chunk Size | 每个文本块的最大长度，直接影响检索粒度 |
| Chunk Overlap | 相邻文本块的重叠部分，防止关键信息在边界处丢失 |
| Separator | 分隔符列表，递归分块按优先级依次尝试切分 |
| RecursiveCharacterTextSplitter | 按字符层级递归切分的分割器，LangChain 推荐默认 |
| SemanticChunker | 基于语义相似度切分，效果最好但需要 Embedding 模型 |
| Metadata | 文档的元数据（来源、页码、分类等），支持过滤检索 |
| Persist Directory | 向量数据库的磁盘持久化目录 |
| 文档加载器 | LangChain 的 Loader，将不同格式文档统一为 Document 对象 |
| Document 对象 | LangChain 的标准文档格式，包含 page_content 和 metadata |

## ✅ 验收清单
- [ ] 能用 TextLoader 加载 txt 文件
- [ ] 理解 CharacterTextSplitter 和 RecursiveCharacterTextSplitter 的区别
- [ ] 能说出 chunk_size 和 chunk_overlap 的含义
- [ ] 完整 Pipeline 能跑通（加载 → 切分 → 索引 → 检索）
- [ ] 理解语义分块的原理（句子向量 → 相似度 → 切分边界）
- [ ] 能说出至少 2 个分块最佳实践

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
