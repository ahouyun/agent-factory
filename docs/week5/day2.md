# 📅 Week 5 Day 2：向量数据库（Chroma）+ Embedding 模型

## 🧭 今日方向
> 深入理解"向量化"的本质：把文字变成数学，让计算机能算出"语义距离"。掌握 Chroma 的基本操作和 Embedding 模型的选型策略。

## 🎯 生活比喻
> 向量化就像给每本书贴一个"GPS 坐标"。普通搜索是按书名关键词匹配（精确匹配），向量搜索是按"地理位置"找最近的书——即使书名完全不同，只要内容语义接近，就能被找到。

## 📋 今日三件事
1. 理解 Embedding 的数学原理（余弦相似度、向量空间）
2. 熟练使用 Chroma 的 CRUD 操作
3. 对比不同 Embedding 模型的效果和成本

## 🗺️ 手把手路线

### Step 1: 理解向量和相似度
- 做什么: 手动计算两个简单向量的余弦相似度
- 为什么: 这是 RAG 检索的数学基础，不懂原理就无法调优
- 成功标志: 能手算 2 维向量的余弦相似度

### Step 2: Chroma 基础操作
- 响什么: 完成 Chroma 的增删改查全流程
- 为什么: 这是实际项目中最常用的向量数据库
- 成功标志: 能独立完成 collection 创建、文档添加、查询、删除

### Step 3: Embedding 模型对比
- 做什么: 用相同文本测试不同 Embedding 模型，对比相似度得分
- 为什么: 选错 Embedding 模型会让检索效果大打折扣
- 成功标志: 能说出 OpenAI / BGE / Jina 各自的适用场景

## 💻 代码区

```python
"""
Week 5 Day 2: 向量数据库 Chroma + Embedding 模型
安装依赖: pip install chromadb sentence-transformers
"""

import chromadb
import numpy as np

# ========== 1. 手动计算余弦相似度（理解原理）==========
def cosine_similarity(vec_a, vec_b):
    """计算两个向量的余弦相似度"""
    a = np.array(vec_a)
    b = np.array(vec_b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# 示例：两个 3 维向量
vec_apple_fruit = [0.9, 0.1, 0.2]   # "苹果"（水果）
vec_apple_phone = [0.1, 0.9, 0.2]   # "苹果"（手机）
vec_orange = [0.8, 0.2, 0.3]         # "橘子"

print("=== 余弦相似度演示 ===")
print(f"苹果(水果) vs 苹果(手机): {cosine_similarity(vec_apple_fruit, vec_apple_phone):.4f}")
print(f"苹果(水果) vs 橘子:       {cosine_similarity(vec_apple_fruit, vec_orange):.4f}")
print(f"苹果(手机) vs 橘子:       {cosine_similarity(vec_apple_phone, vec_orange):.4f}")
print("→ 语义越接近，余弦相似度越接近 1\n")

# ========== 2. Chroma 基础操作 ==========

# 创建内存数据库（生产环境用 PersistentClient）
client = chromadb.Client()
# 持久化存储: client = chromadb.PersistentClient(path="./chroma_data")

# 创建 Collection（类似数据库中的"表"）
collection = client.create_collection(
    name="tech_articles",
    metadata={"hnsw:space": "cosine"}  # 使用余弦相似度
)
print(f"Collection '{collection.name}' 创建成功\n")

# --- 增（Add）：添加文档 ---
collection.add(
    documents=[
        "Python 是一种解释型编程语言，广泛用于数据分析和机器学习。",
        "Rust 是一种系统级编程语言，以内存安全和高性能著称。",
        "React 是 Facebook 开发的前端 JavaScript 框架。",
        "Docker 是一种容器化技术，用于打包和部署应用。",
        "Kubernetes 是 Docker 容器的编排平台。",
        "PostgreSQL 是一种开源的关系型数据库。",
        "MongoDB 是一种 NoSQL 文档数据库。",
        "Redis 是一种高性能的内存键值数据库。",
    ],
    ids=[f"doc_{i}" for i in range(8)],
    metadatas=[
        {"category": "language", "year": 2020},
        {"category": "language", "year": 2021},
        {"category": "frontend", "year": 2019},
        {"category": "devops", "year": 2020},
        {"category": "devops", "year": 2021},
        {"category": "database", "year": 2018},
        {"category": "database", "year": 2019},
        {"category": "database", "year": 2020},
    ]
)
print(f"添加了 {collection.count()} 条文档\n")

# --- 查（Query）：语义搜索 ---
results = collection.query(
    query_texts=["什么语言适合做数据分析？"],
    n_results=3
)
print("=== 语义搜索: '什么语言适合做数据分析？' ===")
for i, (doc, dist) in enumerate(zip(results["documents"][0], results["distances"][0])):
    print(f"  [{i+1}] (相似度: {1-dist:.4f}) {doc}")

# --- 带过滤条件的搜索 ---
results_filtered = collection.query(
    query_texts=["数据库技术"],
    n_results=3,
    where={"category": "database"}  # 只搜 database 类别
)
print("\n=== 带过滤的搜索: '数据库技术' (category=database) ===")
for i, doc in enumerate(results_filtered["documents"][0]):
    print(f"  [{i+1}] {doc}")

# --- 改（Update）：更新文档 ---
collection.update(
    ids=["doc_0"],
    documents=["Python 是一种解释型编程语言，广泛用于数据分析、机器学习和 AI Agent 开发。"],
    metadatas=[{"category": "language", "year": 2024, "updated": True}]
)
print("\n文档 doc_0 已更新")

# --- 删（Delete）：删除文档 ---
collection.delete(ids=["doc_7"])
print(f"删除 doc_7 后，剩余 {collection.count()} 条文档\n")

# ========== 3. Embedding 模型对比 ==========

# --- 3a. 使用 Chroma 内置的默认 Embedding（基于 sentence-transformers）---
client2 = chromadb.Client()
collection2 = client2.create_collection("embedding_demo")

texts = [
    "机器学习是人工智能的一个分支",
    "深度学习使用多层神经网络",
    "自然语言处理让计算机理解人类语言",
    "计算机视觉让机器看懂图片",
    "强化学习通过奖励机制训练模型",
]

collection2.add(documents=texts, ids=[f"item_{i}" for i in range(5)])

# 测试不同查询
queries = [
    "AI 和神经网络",
    "让机器听懂说话",
    "看图识别物体",
]

print("=== Embedding 模型检索效果 ===")
for q in queries:
    results = collection2.query(query_texts=[q], n_results=2)
    print(f"\n查询: '{q}'")
    for i, (doc, dist) in enumerate(zip(results["documents"][0], results["distances"][0])):
        print(f"  [{i+1}] (距离: {dist:.4f}) {doc}")

# ========== 4. 持久化存储示例 ==========
import os

PERSIST_DIR = "./chroma_persistent_data"
os.makedirs(PERSIST_DIR, exist_ok=True)

persistent_client = chromadb.PersistentClient(path=PERSIST_DIR)
persist_collection = persistent_client.get_or_create_collection(
    name="my_documents",
    metadata={"hnsw:space": "cosine"}
)

# 添加数据
persist_collection.upsert(
    documents=["持久化存储的测试文档"],
    ids=["persist_1"]
)
print(f"\n持久化存储成功，共 {persist_collection.count()} 条记录")
print(f"数据保存在: {os.path.abspath(PERSIST_DIR)}")

# 重启后数据仍在
reloaded_client = chromadb.PersistentClient(path=PERSIST_DIR)
reloaded_collection = reloaded_client.get_collection("my_documents")
print(f"重新加载后仍有 {reloaded_collection.count()} 条记录")

# ========== 5. Embedding 模型选型参考 ==========
print("""
=== Embedding 模型选型指南 ===

| 模型 | 维度 | 特点 | 适用场景 |
|------|------|------|----------|
| text-embedding-3-small | 1536 | OpenAI 最新，性价比高 | 通用场景（推荐） |
| text-embedding-3-large | 3072 | OpenAI 最高精度 | 追求极致效果 |
| BGE-large-zh-v1.5 | 1024 | 中文优秀，开源免费 | 中文为主场景 |
| BGE-m3 | 1024 | 多语言，支持稀疏+稠密 | 多语言场景 |
| Jina-embeddings-v3 | 1024 | 多语言，8K 长上下文 | 长文档场景 |
| mxbai-embed-large | 1024 | 本地部署，性能强 | 数据敏感场景 |

选择建议:
1. 预算充足 + 英文为主 → text-embedding-3-large
2. 性价比优先 → text-embedding-3-small
3. 中文为主 + 免费 → BGE-large-zh-v1.5
4. 数据敏感不能上云 → 本地部署 BGE 或 Jina
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | Chroma 安装报错 | 尝试 `pip install chromadb --no-cache-dir` |
| 2 | sentence-transformers 下载慢 | 设置镜像：`export HF_ENDPOINT=https://hf-mirror.com` |
| 3 | 向量维度不匹配 | 确保查询和存储使用同一个 Embedding 模型 |
| 4 | 搜索结果全是噪音 | 尝试不同的 `hnsw:space`（cosine / l2 / ip） |
| 5 | 内存不够 | 改用 `PersistentClient` 做磁盘持久化 |
| 6 | 中文搜索效果差 | 换用 BGE 或 Jina 等支持中文的 Embedding 模型 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Embedding | 把文本映射为固定维度的数字向量，保留语义信息 |
| 余弦相似度 | 衡量两个向量方向是否一致的指标，值越接近 1 越相似 |
| Chroma | 轻量级向量数据库，适合快速原型开发 |
| Collection | Chroma 中的数据集合，类似数据库的"表" |
| HNSW | 分层可导航小世界图，一种高效的向量索引算法 |
| Metadata | 附加在文档上的元数据，支持过滤搜索 |
| Upsert | 如果记录已存在则更新，不存在则插入 |
| Distance Metric | 距离度量：cosine（余弦）、l2（欧几里得）、ip（内积） |
| 降维 | 将高维向量压缩到低维空间，减少存储和计算成本 |
| 本地 Embedding | 在本地运行 Embedding 模型，不需要调用外部 API |

## ✅ 验收清单
- [ ] 能手算余弦相似度并解释其含义
- [ ] 能独立完成 Chroma 的增删改查
- [ ] 能使用 `where` 过滤条件进行搜索
- [ ] 理解 `PersistentClient` 和 `Client` 的区别
- [ ] 能说出至少 3 个 Embedding 模型及其适用场景
- [ ] 理解 embedding 维度不匹配会导致什么问题

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
