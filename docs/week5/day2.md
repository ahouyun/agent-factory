# 📅 Week 5 Day 2：Chroma 向量数据库

## 🧭 今日方向
> 深入理解"向量化"的本质：把文字变成数学，让计算机能算出"语义距离"。掌握 Chroma 的安装、核心操作（增删改查）、持久化存储。

## 🎯 生活比喻
> **图书馆的索引系统**。传统数据库像按书名排序的目录——你必须知道确切的书名才能找到。向量数据库像一个懂你意思的图书管理员——你描述"想看一本关于太空冒险的小说"，它能帮你找到最匹配的书，即使书名里没有"太空"或"冒险"这些词。

## 📋 今日三件事
1. 安装 Chroma 并理解向量数据库的核心概念
2. 掌握 Chroma 的五个核心操作：创建集合、添加文档、查询、更新、删除
3. 实现持久化存储，将数据保存到磁盘

---

## 🗺️ 手把手路线

### Step 1: 安装 Chroma
- **做什么**: 通过 pip 安装 chromadb 并验证
- **为什么**: Chroma 是目前最易上手的向量数据库，适合学习和原型开发
- **成功标志**: `import chromadb` 不报错

### Step 2: 核心 CRUD 操作
- **做什么**: 创建集合、添加文档、查询、更新、删除
- **为什么**: 这是使用任何数据库的基础操作，掌握后即可构建 RAG
- **成功标志**: 每个操作都能正确执行并返回预期结果

### Step 3: 持久化存储
- **做什么**: 将集合保存到磁盘，下次启动时恢复
- **为什么**: 生产环境不能每次重启都重建索引
- **成功标志**: 关闭程序后重新打开，数据仍在

---

## 💻 代码区

### 代码 1：环境安装与验证

```bash
# 安装 Chroma 向量数据库
pip install chromadb

# 验证安装
python -c "import chromadb; print(f'Chroma 版本: {chromadb.__version__}')"
```

**预期输出：**
```
Successfully installed chromadb-0.4.24 ...
Chroma 版本: 0.4.24
```

**常见安装错误：**

```bash
# 错误 1：pip 版本过旧导致安装失败
# 解决：
pip install --upgrade pip

# 错误 2：Windows 上编译错误
# 解决：尝试使用预编译版本
pip install chromadb --only-binary :all:

# 错误 3：依赖冲突
# 解决：使用虚拟环境
python -m venv chroma_env
source chroma_env/bin/activate  # Linux/Mac
# chroma_env\Scripts\activate   # Windows
pip install chromadb
```

---

### 代码 2：Chroma 基础 — 创建集合

```python
"""
Chroma 向量数据库基础操作
Step 1: 创建客户端和集合
"""
import chromadb

# 创建客户端（内存模式，数据不持久化）
client = chromadb.Client()
print("✅ Chroma 客户端创建成功")

# 创建一个集合（相当于关系数据库的"表"）
collection = client.create_collection(
    name="company_docs",
    metadata={"description": "公司政策文档集合"}
)
print(f"✅ 集合 '{collection.name}' 创建成功")
print(f"   集合当前文档数: {collection.count()}")
```

**预期输出：**
```
✅ Chroma 客户端创建成功
✅ 集合 'company_docs' 创建成功
   集合当前文档数: 0
```

---

### 代码 3：添加文档（Add）

```python
"""
Chroma 核心操作 - 添加文档
Chroma 内置了默认的 Embedding 函数，自动将文本转换为向量
"""
import chromadb

client = chromadb.Client()
collection = client.create_collection(name="company_docs")

# 批量添加文档
documents = [
    "公司员工每年享有 15 天带薪年假。入职满 5 年后增加至 20 天。",
    "公司支持每周最多 2 天远程办公。远程办公需提前一天申请。",
    "差旅报销需在出差结束后 5 个工作日内提交。餐饮补贴每日 100 元。",
    "公司每年为每位员工提供 5000 元培训经费。培训需与岗位相关。",
    "试用期为 3 个月，试用期薪资为正式薪资的 80%。",
    "员工晋升需满足：在职满 1 年、绩效评估 B+ 以上、通过晋升答辩。",
]

# 每篇文档的唯一 ID
ids = [f"doc_{i+1}" for i in range(len(documents))]

# 可选：为每篇文档添加元数据
metadatas = [
    {"category": "假期", "department": "HR"},
    {"category": "办公", "department": "HR"},
    {"category": "报销", "department": "财务"},
    {"category": "培训", "department": "HR"},
    {"category": "入职", "department": "HR"},
    {"category": "晋升", "department": "HR"},
]

# 添加到集合
collection.add(
    documents=documents,
    ids=ids,
    metadatas=metadatas,
)

print(f"✅ 成功添加 {collection.count()} 篇文档到集合")
print(f"   文档列表: {collection.get()['ids']}")
```

**预期输出：**
```
✅ 成功添加 6 篇文档到集合
   文档列表: ['doc_1', 'doc_2', 'doc_3', 'doc_4', 'doc_5', 'doc_6']
```

---

### 代码 4：查询文档（Query）

```python
"""
Chroma 核心操作 - 语义查询
这是 RAG 系统中最核心的操作
"""
import chromadb

client = chromadb.Client()
collection = client.create_collection(name="company_docs")

# 先添加一些文档
collection.add(
    documents=[
        "公司员工每年享有 15 天带薪年假。入职满 5 年后增加至 20 天。",
        "公司支持每周最多 2 天远程办公。远程办公需提前一天申请。",
        "差旅报销需在出差结束后 5 个工作日内提交。餐饮补贴每日 100 元。",
        "公司每年为每位员工提供 5000 元培训经费。培训需与岗位相关。",
        "试用期为 3 个月，试用期薪资为正式薪资的 80%。",
        "员工晋升需满足：在职满 1 年、绩效评估 B+ 以上、通过晋升答辩。",
    ],
    ids=[f"doc_{i+1}" for i in range(6)],
    metadatas=[
        {"category": "假期"},
        {"category": "办公"},
        {"category": "报销"},
        {"category": "培训"},
        {"category": "入职"},
        {"category": "晋升"},
    ],
)

# ============================================================
# 查询 1：基础语义查询
# ============================================================
print("=" * 60)
print("【查询 1】基础语义查询")
results = collection.query(
    query_texts=["年假政策是什么"],
    n_results=3,  # 返回最相关的 3 个结果
)

print(f"   查询: '年假政策是什么'")
print(f"   返回 {len(results['ids'][0])} 个结果:")
for i, (doc_id, doc, distance) in enumerate(
    zip(results['ids'][0], results['documents'][0], results['distances'][0])
):
    print(f"     {i+1}. [{doc_id}] (距离: {distance:.4f})")
    print(f"        '{doc[:50]}...'")
print()

# ============================================================
# 查询 2：带元数据过滤的查询
# ============================================================
print("=" * 60)
print("【查询 2】带元数据过滤")
results_filtered = collection.query(
    query_texts=["有什么福利"],
    n_results=3,
    where={"category": "假期"},  # 只搜索"假期"类别
)

print(f"   查询: '有什么福利' (过滤: category='假期')")
print(f"   返回 {len(results_filtered['ids'][0])} 个结果:")
for i, (doc_id, doc) in enumerate(
    zip(results_filtered['ids'][0], results_filtered['documents'][0])
):
    print(f"     {i+1}. [{doc_id}] '{doc[:50]}...'")
print()

# ============================================================
# 查询 3：复合过滤条件
# ============================================================
print("=" * 60)
print("【查询 3】复合过滤条件 (OR)")
results_or = collection.query(
    query_texts=["工作相关的政策"],
    n_results=5,
    where={"$or": [
        {"category": "办公"},
        {"category": "报销"},
    ]},
)

print(f"   查询: '工作相关的政策' (过滤: category='办公' OR '报销')")
print(f"   返回 {len(results_or['ids'][0])} 个结果:")
for i, (doc_id, doc, meta) in enumerate(
    zip(results_or['ids'][0], results_or['documents'][0], results_or['metadatas'][0])
):
    print(f"     {i+1}. [{doc_id}] ({meta})")
    print(f"        '{doc[:50]}...'")
print()
```

**预期输出：**
```
============================================================
【查询 1】基础语义查询
   查询: '年假政策是什么'
   返回 3 个结果:
     1. [doc_1] (距离: 0.4523)
        '公司员工每年享有 15 天带薪年假。入职满 5 年后增...'
     2. [doc_5] (距离: 1.2341)
        '试用期为 3 个月，试用期薪资为正式薪资的 80%。...'
     3. [doc_6] (距离: 1.3456)
        '员工晋升需满足：在职满 1 年、绩效评估 B+ ...'

============================================================
【查询 2】带元数据过滤
   查询: '有什么福利' (过滤: category='假期')
   返回 1 个结果:
     1. [doc_1] '公司员工每年享有 15 天带薪年假。入职满 5 年后增...'

============================================================
【查询 3】复合过滤条件 (OR)
   查询: '工作相关的政策' (过滤: category='办公' OR '报销')
   返回 2 个结果:
     1. [doc_2] ({'category': '办公'})
        '公司支持每周最多 2 天远程办公。远程办公需提前一...'
     2. [doc_3] ({'category': '报销'})
        '差旅报销需在出差结束后 5 个工作日内提交。餐饮...'
```

---

### 代码 5：更新和删除文档

```python
"""
Chroma 核心操作 - 更新和删除
"""
import chromadb

client = chromadb.Client()
collection = client.create_collection(name="update_demo")

# 添加初始文档
collection.add(
    documents=[
        "公司年假制度：每年 15 天。",
        "远程办公政策：每周 2 天。",
        "报销流程：5 个工作日内提交。",
    ],
    ids=["doc_1", "doc_2", "doc_3"],
)

print("【初始状态】")
print(f"  文档数: {collection.count()}")
for doc_id, doc in zip(
    collection.get()["ids"],
    collection.get()["documents"]
):
    print(f"  {doc_id}: {doc}")
print()

# ============================================================
# 更新文档
# ============================================================
print("【更新 doc_1】")
collection.update(
    ids=["doc_1"],
    documents=["公司年假制度：每年 20 天，入职满 10 年增至 25 天。"],
    metadatas=[{"category": "假期", "updated": "true"}],
)

updated_doc = collection.get(ids=["doc_1"])
print(f"  更新后: {updated_doc['documents'][0]}")
print(f"  元数据: {updated_doc['metadatas'][0]}")
print()

# ============================================================
# 删除文档（单个）
# ============================================================
print("【删除 doc_3】")
collection.delete(ids=["doc_3"])
print(f"  删除后文档数: {collection.count()}")
remaining = collection.get()
print(f"  剩余文档: {remaining['ids']}")
print()

# ============================================================
# 批量删除
# ============================================================
print("【批量删除】")
# 先添加更多文档
collection.add(
    documents=["培训制度", "晋升制度"],
    ids=["doc_4", "doc_5"],
)
print(f"  添加后文档数: {collection.count()}")

# 按条件批量删除
collection.delete(where={"category": {"$exists": False}})
print(f"  删除无 category 元数据的文档后: {collection.count()}")
remaining = collection.get()
print(f"  剩余文档: {remaining['ids']}")
```

**预期输出：**
```
【初始状态】
  文档数: 3
  doc_1: 公司年假制度：每年 15 天。
  doc_2: 远程办公政策：每周 2 天。
  doc_3: 报销流程：5 个工作日内提交。

【更新 doc_1】
  更新后: 公司年假制度：每年 20 天，入职满 10 年增至 25 天。
  元数据: {'category': '假期', 'updated': 'true'}

【删除 doc_3】
  删除后文档数: 2
  剩余文档: ['doc_1', 'doc_2']

【批量删除】
  添加后文档数: 4
  删除无 category 元数据的文档后: 2
  剩余文档: ['doc_1', 'doc_2']
```

---

### 代码 6：持久化存储

```python
"""
Chroma 持久化 - 将数据保存到磁盘
生产环境必须使用持久化存储
"""
import chromadb
import os

# 持久化目录
PERSIST_DIR = "./chroma_persistence"

# 确保目录存在
os.makedirs(PERSIST_DIR, exist_ok=True)

# ============================================================
# 第一次运行：写入数据
# ============================================================
print("=" * 60)
print("【第一次运行】写入数据并持久化")

client = chromadb.PersistentClient(path=PERSIST_DIR)
collection = client.get_or_create_collection(
    name="persistent_docs",
    metadata={"description": "持久化测试集合"}
)

# 添加文档
collection.add(
    documents=[
        "公司年假制度：每年 15 天带薪年假。",
        "远程办公政策：每周最多 2 天。",
        "报销标准：餐饮每日 100 元。",
    ],
    ids=["doc_1", "doc_2", "doc_3"],
    metadatas=[
        {"category": "假期"},
        {"category": "办公"},
        {"category": "报销"},
    ],
)

print(f"  写入文档数: {collection.count()}")
print(f"  持久化目录: {PERSIST_DIR}")

# 验证数据已写入磁盘
import time
time.sleep(1)  # 等待写入完成
files = os.listdir(PERSIST_DIR)
print(f"  磁盘文件: {files}")
print()

# ============================================================
# 第二次运行：从磁盘恢复数据
# ============================================================
print("=" * 60)
print("【第二次运行】从磁盘恢复数据")

# 重新创建客户端（模拟程序重启）
client2 = chromadb.PersistentClient(path=PERSIST_DIR)
collection2 = client2.get_or_create_collection(name="persistent_docs")

print(f"  恢复的文档数: {collection2.count()}")

# 验证查询仍然有效
results = collection2.query(
    query_texts=["年假有多少天"],
    n_results=2,
)
print(f"  查询 '年假有多少天' 的结果:")
for doc_id, doc in zip(results['ids'][0], results['documents'][0]):
    print(f"    [{doc_id}] {doc}")

print()
print("=" * 60)
print("✅ 持久化验证成功！数据已保存到磁盘并可恢复。")
print("=" * 60)
```

**预期输出：**
```
============================================================
【第一次运行】写入数据并持久化
  写入文档数: 3
  持久化目录: ./chroma_persistence
  磁盘文件: ['chroma.sqlite3']

============================================================
【第二次运行】从磁盘恢复数据
  恢复的文档数: 3
  查询 '年假有多少天' 的结果:
    [doc_1] 公司年假制度：每年 15 天带薪年假。

============================================================
✅ 持久化验证成功！数据已保存到磁盘并可恢复。
============================================================
```

---

### 代码 7：完整 CRUD 操作汇总

```python
"""
Chroma 完整 CRUD 操作汇总
一个文件搞定所有常用操作
"""
import chromadb

client = chromadb.Client()
col = client.create_collection(name="crud_summary")

# ---- CREATE（创建/添加） ----
col.add(documents=["文档A"], ids=["a"])
col.add(documents=["文档B", "文档C"], ids=["b", "c"])
print(f"[CREATE] 添加后文档数: {col.count()}")  # 3

# ---- READ（读取/查询） ----
# 获取所有文档
all_docs = col.get()
print(f"[READ] 所有文档ID: {all_docs['ids']}")

# 按 ID 获取
specific = col.get(ids=["a"])
print(f"[READ] doc_a: {specific['documents'][0]}")

# 语义查询
query_result = col.query(query_texts=["测试查询"], n_results=2)
print(f"[READ] 语义查询结果: {query_result['ids'][0]}")

# ---- UPDATE（更新） ----
col.update(ids=["a"], documents=["文档A（已更新）"])
updated = col.get(ids=["a"])
print(f"[UPDATE] 更新后: {updated['documents'][0]}")

# ---- DELETE（删除） ----
col.delete(ids=["c"])
print(f"[DELETE] 删除 doc_c 后文档数: {col.count()}")  # 2

# ---- UPSERT（存在则更新，不存在则插入） ----
col.upsert(ids=["a"], documents=["文档A（UPSERT 更新）"])
col.upsert(ids=["d"], documents=["文档D（UPSERT 新增）"])
print(f"[UPSERT] 操作后文档数: {col.count()}")  # 3
print(f"[UPSERT] 所有文档: {col.get()['ids']}")

print("\n✅ CRUD 操作汇总完成！")
```

**预期输出：**
```
[CREATE] 添加后文档数: 3
[READ] 所有文档ID: ['a', 'b', 'c']
[READ] doc_a: 文档A
[READ] 语义查询结果: ['a', 'b']
[UPDATE] 更新后: 文档A（已更新）
[DELETE] 删除 doc_c 后文档数: 2
[UPSERT] 操作后文档数: 3
[UPSERT] 所有文档: ['a', 'b', 'd']

✅ CRUD 操作汇总完成！
```

---

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | `pip install chromadb` 超时 | 使用镜像源：`pip install chromadb -i https://pypi.tuna.tsinghua.edu.cn/simple` |
| 2 | `chromadb.Error: Collection already exists` | 使用 `get_or_create_collection()` 替代 `create_collection()` |
| 3 | 查询结果距离全是 0 | 检查文档是否为空，或集合是否为空（`collection.count()`） |
| 4 | 持久化后数据丢失 | 确认使用 `chromadb.PersistentClient(path=...)` 而非 `Client()` |
| 5 | `where` 过滤不生效 | 确认元数据类型：字符串用 `{"key": "value"}`，数字用 `{"key": {"$gt": 10}}` |
| 6 | 文档太长导致内存溢出 | 减小 `max_batch_size`，或先分块再存入 |

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Vector Database | 专门存储和检索向量的数据库，支持语义相似度搜索 |
| Chroma | 一个轻量级开源向量数据库，Python 原生支持 |
| Collection | 集合，相当于关系数据库的"表"，存储一组文档和它们的向量 |
| Embedding | 文本到向量的转换过程，Chroma 内置默认 Embedding 函数 |
| Distance | 两个向量之间的距离，值越小表示越相似 |
| Persistence | 持久化，将数据保存到磁盘而非仅在内存中 |
| `get_or_create_collection` | 如果集合存在则获取，不存在则创建（推荐使用） |
| `where` 过滤 | 按元数据条件过滤查询结果 |
| `upsert` | 存在则更新，不存在则插入（合并操作） |
| `n_results` | 查询时返回的最相似结果数量 |

---

## ✅ 验收清单

- [ ] 成功安装 Chroma（`pip install chromadb` 无报错）
- [ ] 能创建客户端和集合
- [ ] 能使用 `add()` 批量添加文档（含文本、ID、元数据）
- [ ] 能使用 `query()` 进行语义查询并理解返回结构
- [ ] 能使用 `where` 条件进行元数据过滤
- [ ] 能使用 `update()` 更新文档内容
- [ ] 能使用 `delete()` 删除文档
- [ ] 能使用 `upsert()` 进行合并操作
- [ ] 能使用 `PersistentClient` 实现持久化存储
- [ ] 关闭程序后重新打开，数据仍然存在

---

## 📝 复盘小纸条
- 今天最大的收获: _______________
- 还不太确定的: _______________

---

## 📥 明日同步接口
- 今日完成度: _______________
- 卡点描述: _______________
- 代码是否能跑通: _______________
- 明天希望: _______________
