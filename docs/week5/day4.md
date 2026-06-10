# 📅 Week 5 Day 4：混合检索：向量 + BM25 + Reranking

## 🧭 今日方向
> 单一检索方式各有短板：向量检索擅长语义但容易漏掉精确关键词，BM25 擅长关键词但不懂语义。今天学习如何"混搭"多种检索方式，并用 Reranker 提升最终排序质量。

## 🎯 生活比喻
> 混合检索就像找餐厅。你同时用大众点评搜"评分高"（关键词匹配/BM25），又问朋友推荐"氛围好的"（语义理解/向量检索）。最后再让一个美食专家（Reranker）从候选里挑出最合适的。

## 📋 今日三件事
1. 理解 BM25 算法原理及其与向量检索的互补性
2. 实现 Hybrid Retriever（向量 + BM25 融合）
3. 添加 Reranker 提升最终排序质量

## 🗺️ 手把手路线

### Step 1: 理解 BM25
- 做什么: 手动运行 BM25 搜索，观察其特性
- 为什么: BM25 是传统搜索的基石，理解它才能理解为什么需要混合
- 成功标志: 能说出 BM25 的优势（精确匹配）和劣势（不懂语义）

### Step 2: 实现混合检索
- 做什么: 将向量检索和 BM25 的结果用 RRF 算法融合
- 为什么: 两者互补，融合后效果通常优于单一方法
- 成功标志: 能对比纯向量、纯 BM25、混合检索三种结果

### Step 3: 添加 Reranker
- 做什么: 用 Cross-Encoder 对混合检索结果进行重排序
- 为什么: 第一阶段检索追求召回率，第二阶段 Rerank 追求精确度
- 成功标志: 能看到 Reranking 后排序明显改善

## 💻 代码区

```python
"""
Week 5 Day 4: 混合检索 + Reranking
安装依赖: pip install rank_bm25 langchain langchain-community chromadb sentence-transformers
"""

import numpy as np
from rank_bm25 import BM25Okapi
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.schema import Document

# ========== 1. 准备测试数据 ==========
documents = [
    Document(page_content="Python 是一种解释型、面向对象的编程语言，广泛用于数据科学和人工智能。",
             metadata={"source": "wiki", "topic": "python"}),
    Document(page_content="JavaScript 是 Web 前端开发的核心语言，Node.js 让它也能做后端。",
             metadata={"source": "wiki", "topic": "javascript"}),
    Document(page_content="Rust 以内存安全和零成本抽象著称，适合系统级编程。",
             metadata={"source": "wiki", "topic": "rust"}),
    Document(page_content="TensorFlow 是 Google 开发的深度学习框架，支持 GPU 加速。",
             metadata={"source": "tech", "topic": "ml"}),
    Document(page_content="PyTorch 是 Facebook 开发的深度学习框架，以动态计算图闻名。",
             metadata={"source": "tech", "topic": "ml"}),
    Document(page_content="LangChain 是一个用于构建 LLM 应用的开源框架。",
             metadata={"source": "tech", "topic": "llm"}),
    Document(page_content="Docker 容器化技术让应用部署更简单，一次构建到处运行。",
             metadata={"source": "devops", "topic": "docker"}),
    Document(page_content="Kubernetes 是容器编排平台，管理大规模容器集群。",
             metadata={"source": "devops", "topic": "k8s"}),
    Document(page_content="PostgreSQL 是功能强大的开源关系型数据库，支持 JSON 和全文搜索。",
             metadata={"source": "db", "topic": "rdbms"}),
    Document(page_content="Redis 是内存中的键值存储，常用作缓存和消息队列。",
             metadata={"source": "db", "topic": "cache"}),
]

texts = [doc.page_content for doc in documents]

# ========== 2. 纯向量检索 ==========
print("=== 2. 向量检索 ===")
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_texts(
    texts=texts,
    embedding=embeddings,
    collection_name="hybrid_demo"
)
vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

query = "用于数据科学的编程语言"
vector_results = vector_retriever.invoke(query)
print(f"查询: '{query}'")
for i, doc in enumerate(vector_results):
    print(f"  [{i+1}] {doc.page_content[:60]}...")

# ========== 3. 纯 BM25 检索 ==========
print("\n=== 3. BM25 检索 ===")

# BM25 需要分词（中文需要 jieba，这里简化处理）
import jieba

def tokenize_chinese(text):
    """中文分词"""
    return list(jieba.cut(text))

# 构建 BM25 索引
tokenized_corpus = [tokenize_chinese(text) for text in texts]
bm25 = BM25Okapi(tokenized_corpus)

# BM25 检索
tokenized_query = tokenize_chinese(query)
bm25_scores = bm25.get_scores(tokenized_query)

# 按得分排序
bm25_ranking = np.argsort(bm25_scores)[::-1][:5]
print(f"查询: '{query}'")
for rank, idx in enumerate(bm25_ranking):
    print(f"  [{rank+1}] (BM25得分: {bm25_scores[idx]:.4f}) {texts[idx][:60]}...")

# ========== 4. 混合检索（RRF 融合）==========
print("\n=== 4. 混合检索 (RRF) ===")

def reciprocal_rank_fusion(
    rankings: list[list[int]],
    k: int = 60
) -> list[tuple[int, float]]:
    """
    Reciprocal Rank Fusion (RRF)
    将多个排序列表融合为一个统一排序
    k=60 是论文推荐的常数
    """
    fused_scores = {}
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking):
            if doc_id not in fused_scores:
                fused_scores[doc_id] = 0
            fused_scores[doc_id] += 1.0 / (k + rank + 1)

    # 按融合分数排序
    sorted_docs = sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_docs

# 获取两种检索的排名
vector_ranking = [texts.index(doc.page_content) for doc in vector_results]
bm25_ranking_list = list(bm25_ranking)

# RRF 融合
fused_results = reciprocal_rank_fusion([vector_ranking, bm25_ranking_list])

print(f"查询: '{query}'")
for rank, (idx, score) in enumerate(fused_results[:5]):
    source = "向量" if idx in vector_ranking else ""
    source += "+BM25" if idx in bm25_ranking_list else ""
    print(f"  [{rank+1}] (RRF: {score:.4f}) [{source}] {texts[idx][:60]}...")

# ========== 5. 更完整的混合检索实现 ==========
class HybridRetriever:
    """
    混合检索器：向量检索 + BM25 + RRF 融合
    """
    def __init__(self, documents, embeddings, k_vector=5, k_bm25=5, k_final=3):
        self.documents = documents
        self.texts = [doc.page_content for doc in documents]
        self.k_final = k_final

        # 初始化向量检索
        self.vectorstore = Chroma.from_texts(
            texts=self.texts,
            embedding=embeddings,
            collection_name="hybrid_retriever"
        )
        self.vector_retriever = self.vectorstore.as_retriever(
            search_kwargs={"k": k_vector}
        )

        # 初始化 BM25
        tokenized_corpus = [tokenize_chinese(text) for text in self.texts]
        self.bm25 = BM25Okapi(tokenized_corpus)

    def retrieve(self, query, k=None):
        """混合检索"""
        k = k or self.k_final

        # 向量检索
        vector_results = self.vector_retriever.invoke(query)
        vector_ranking = [self.texts.index(doc.page_content) for doc in vector_results]

        # BM25 检索
        tokenized_query = tokenize_chinese(query)
        bm25_scores = self.bm25.get_scores(tokenized_query)
        bm25_ranking = list(np.argsort(bm25_scores)[::-1][:len(vector_ranking)])

        # RRF 融合
        fused = reciprocal_rank_fusion([vector_ranking, bm25_ranking])

        # 返回 top-k
        results = []
        for idx, score in fused[:k]:
            results.append({
                "content": self.texts[idx],
                "score": score,
                "metadata": self.documents[idx].metadata,
            })
        return results

# 使用混合检索器
hybrid = HybridRetriever(documents, embeddings)

print("\n=== 混合检索器测试 ===")
queries = ["深度学习框架", "容器部署"]
for q in queries:
    results = hybrid.retrieve(q)
    print(f"\n查询: '{q}'")
    for i, r in enumerate(results):
        print(f"  [{i+1}] (分数: {r['score']:.4f}) {r['content'][:60]}...")

# ========== 6. Reranker（重排序）==========
print("\n=== 6. Reranker 重排序 ===")

from sentence_transformers import CrossEncoder

# 加载 Cross-Encoder 模型（中英双语推荐 bge-reranker）
reranker = CrossEncoder("BAAI/bge-reranker-base")

def rerank(query, documents, top_k=3):
    """
    使用 Cross-Encoder 对文档进行重排序
    Cross-Encoder 同时看 query 和 doc，精度比 Bi-Encoder 高
    """
    pairs = [(query, doc.page_content) for doc in documents]
    scores = reranker.predict(pairs)

    # 按得分排序
    ranked = sorted(
        zip(documents, scores),
        key=lambda x: x[1],
        reverse=True
    )
    return ranked[:top_k]

# 先用混合检索获取候选，再用 Reranker 精排
query = "用于数据科学的编程语言"
print(f"查询: '{query}'")

# 第一阶段：混合检索（召回）
candidate_docs = [Document(page_content=r["content"], metadata=r["metadata"]) for r in hybrid.retrieve(query, k=5)]
print(f"第一阶段召回 {len(candidate_docs)} 个候选:")
for i, doc in enumerate(candidate_docs):
    print(f"  [{i+1}] {doc.page_content[:50]}...")

# 第二阶段：Reranker 精排
reranked = rerank(query, candidate_docs, top_k=3)
print(f"\n第二阶段 Rerank 后 top-3:")
for i, (doc, score) in enumerate(reranked):
    print(f"  [{i+1}] (相关度: {score:.4f}) {doc.page_content[:50]}...")

print("""
=== 混合检索 vs 纯向量检索 ===
混合检索通常在以下场景表现更好:
1. 查询包含专有名词（如具体版本号、产品名）
2. 查询很短或很模糊
3. 需要精确匹配（如搜索特定错误代码）
4. 知识库中术语不统一
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | jieba 分词报错 | `pip install jieba` |
| 2 | Cross-Encoder 下载慢 | 设置 HF 镜像或手动下载模型到本地 |
| 3 | BM25 对英文效果差 | 英文先做 tokenize（空格分词），或用 `nltk.word_tokenize()` |
| 4 | RRF 融合后排序不合理 | 调整 k 参数（默认 60），或给不同检索器不同权重 |
| 5 | Reranker 推理太慢 | 换用更小的模型如 `BAAI/bge-reranker-base`，或减少候选数量 |
| 6 | 内存不足（Cross-Encoder） | 用 `pip install sentence-transformers` 后确认 CUDA 可用 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| BM25 | 基于词频和逆文档频率的经典搜索算法，擅长精确匹配 |
| TF-IDF | 词频-逆文档频率，BM25 的前身 |
| RRF | Reciprocal Rank Fusion，将多个排序列表融合为一个 |
| Reranker | 重排序器，对第一阶段检索结果进行精细排序 |
| Cross-Encoder | 同时编码 query 和 doc 的模型，精度高但速度慢 |
| Bi-Encoder | 分别编码 query 和 doc 的模型，速度快但精度稍低 |
| 召回率 (Recall) | 相关文档被检索到的比例 |
| 精确率 (Precision) | 检索结果中相关文档的比例 |
| 第一阶段检索 | 追求高召回率，快速从海量文档中捞出候选 |
| 第二阶段 Rerank | 追求高精确率，从候选中精选最相关的结果 |

## ✅ 验收清单
- [ ] 能说出 BM25 和向量检索各自的优劣
- [ ] 理解 RRF 融合算法的原理
- [ ] HybridRetriever 类能正常运行
- [ ] 能使用 Cross-Encoder 进行 Reranking
- [ ] 理解"两阶段检索"（召回 + 精排）的设计思路
- [ ] 能对比混合检索和纯向量检索的结果差异

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
