# 📅 Week 5 Day 5：Query 改写 + 上下文注入 + Redis 缓存

## 🧭 今日方向
> 用户的查询往往"言简意赅"但信息不足。今天学习如何让系统更聪明地理解用户意图：通过 Query 改写提升检索质量，通过 Prompt Engineering 优化上下文注入，通过 Redis 缓存加速重复查询。

## 🎯 生活比喻
> Query 改写就像翻译官。用户说了一句方言（模糊查询），翻译官先理解意思，翻译成标准普通话（改写后的查询），再去图书馆找书，找到后把相关内容整理成一份简报（上下文注入）交给用户。如果下次有人问同样的问题，简报可以复用（Redis 缓存）。

## 📋 今日三件事
1. 掌握三种 Query 改写技术：HyDE、Multi-Query、Step-Back
2. 学会上下文注入的最佳实践（压缩、排序、去重）
3. 用 Redis 实现查询缓存层

## 🗺️ 手把手路线

### Step 1: HyDE（假设文档嵌入）
- 做什么: 先让 LLM 生成一个"假设答案"，再用这个答案去检索
- 为什么: 假设答案比原始查询更接近目标文档的表述方式
- 成功标志: 能对比 HyDE 前后的检索效果差异

### Step 2: Multi-Query 扩展
- 做什么: 让 LLM 生成多个不同角度的查询，合并检索结果
- 为什么: 一个问题可以有多种表述方式，多查询提高召回率
- 成功标志: 能生成 3 个不同角度的查询并合并结果

### Step 3: Redis 缓存
- 做什么: 对常见查询结果做缓存，避免重复计算
- 为什么: Embedding 计算和 LLM 调用都有成本，缓存能显著加速
- 成功标志: 相同查询第二次运行明显更快

## 💻 代码区

```python
"""
Week 5 Day 5: Query 改写 + 上下文注入 + Redis 缓存
安装依赖: pip install langchain langchain-openai chromadb redis
"""

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain_community.vectorstores import Chroma
from langchain.schema import Document
import hashlib
import json
import time

# ========== 0. 初始化 ==========
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
embeddings = OpenAIEmbeddings()

# 模拟知识库
knowledge_docs = [
    Document(page_content="Python 3.12 引入了类型参数语法（PEP 695），使泛型定义更简洁。", metadata={"source": "python_release"}),
    Document(page_content="Python 3.12 的性能提升约 5%，主要来自改进的解释器和更好的 JIT 编译。", metadata={"source": "python_release"}),
    Document(page_content="Python 3.12 支持更好的错误提示，能精确指出语法错误位置。", metadata={"source": "python_release"}),
    Document(page_content="FastAPI 0.110 版本支持后台任务的依赖注入，简化了异步任务管理。", metadata={"source": "fastapi"}),
    Document(page_content="FastAPI 使用 Pydantic V2 进行数据验证，性能提升 5-50 倍。", metadata={"source": "fastapi"}),
    Document(page_content="Django 5.0 引入了字段组（Field Groups），简化表单渲染。", metadata={"source": "django"}),
    Document(page_content="Django 5.0 支持异步视图中的 ORM 查询，终于可以 async 了。", metadata={"source": "django"}),
]

vectorstore = Chroma.from_documents(
    documents=knowledge_docs,
    embedding=embeddings,
    collection_name="query_rewrite_demo"
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# ========== 1. HyDE（Hypothetical Document Embeddings）==========
print("=== 1. HyDE 查询改写 ===")

hyde_prompt = ChatPromptTemplate.from_template("""
请根据以下问题，写一段简短的、可能包含答案的段落（假设这是某篇文档中的一段）。
只写段落，不要添加任何解释。

问题：{question}
""")

def hyde_retrieve(query, retriever, llm):
    """
    HyDE 检索流程：
    1. 用 LLM 生成假设文档
    2. 用假设文档进行向量检索
    3. 返回检索结果
    """
    # 生成假设文档
    chain = hyde_prompt | llm
    hypothetical_doc = chain.invoke({"question": query}).content
    print(f"  原始查询: {query}")
    print(f"  假设文档: {hypothetical_doc}")

    # 用假设文档检索
    results = retriever.invoke(hypothetical_doc)
    return results

query = "Python 有什么新特性？"
print(f"\n普通检索:")
normal_results = retriever.invoke(query)
for i, doc in enumerate(normal_results):
    print(f"  [{i+1}] {doc.page_content[:60]}...")

print(f"\nHyDE 检索:")
hyde_results = hyde_retrieve(query, retriever, llm)
for i, doc in enumerate(hyde_results):
    print(f"  [{i+1}] {doc.page_content[:60]}...")

# ========== 2. Multi-Query 扩展 ==========
print("\n=== 2. Multi-Query 扩展 ===")

multi_query_prompt = ChatPromptTemplate.from_template("""
你是一个 helpful assistant。请根据用户的问题，生成 3 个不同角度的搜索查询。
每个查询一行，不要编号，不要解释。

原始问题：{question}
""")

def multi_query_retrieve(query, retriever, llm, num_queries=3):
    """
    Multi-Query 检索流程：
    1. 用 LLM 生成多个不同角度的查询
    2. 对每个查询分别检索
    3. 合并去重
    """
    # 生成多个查询
    chain = multi_query_prompt | llm
    response = chain.invoke({"question": query}).content
    queries = [q.strip() for q in response.strip().split("\n") if q.strip()]
    print(f"  原始查询: {query}")
    print(f"  扩展查询: {queries}")

    # 对每个查询检索并合并
    all_results = {}
    for q in queries[:num_queries]:
        docs = retriever.invoke(q)
        for doc in docs:
            # 用内容哈希去重
            content_hash = hashlib.md5(doc.page_content.encode()).hexdigest()
            if content_hash not in all_results:
                all_results[content_hash] = doc

    return list(all_results.values())

multi_results = multi_query_retrieve("FastAPI 性能优化", retriever, llm)
print(f"合并后得到 {len(multi_results)} 个文档:")
for i, doc in enumerate(multi_results):
    print(f"  [{i+1}] {doc.page_content[:60]}...")

# ========== 3. Step-Back Prompting ==========
print("\n=== 3. Step-Back 查询改写 ===")

stepback_prompt = ChatPromptTemplate.from_template("""
请将以下具体问题改写为一个更宽泛、更基础的查询，以便从知识库中检索到更多相关背景信息。

具体问题：{question}

更宽泛的查询：""")

def stepback_retrieve(query, retriever, llm):
    """Step-Back 检索：先获取背景知识，再回答具体问题"""
    # 生成宽泛查询
    chain = stepback_prompt | llm
    broad_query = chain.invoke({"question": query}).content
    print(f"  原始查询: {query}")
    print(f"  宽泛查询: {broad_query}")

    # 检索
    results = retriever.invoke(broad_query)
    return results, broad_query

stepback_results, broad_q = stepback_retrieve(
    "Python 3.12 的类型参数语法是什么？", retriever, llm
)
for i, doc in enumerate(stepback_results):
    print(f"  [{i+1}] {doc.page_content[:60]}...")

# ========== 4. 上下文注入最佳实践 ==========
print("\n=== 4. 上下文注入 ===")

def compress_context(docs, max_tokens=500):
    """
    上下文压缩：去除重复内容，截断过长文档
    真实项目中可以使用 LLM 做更智能的摘要压缩
    """
    seen = set()
    compressed = []
    total_length = 0

    for doc in docs:
        content = doc.page_content.strip()
        # 去重
        if content in seen:
            continue
        seen.add(content)

        # 截断
        if total_length + len(content) > max_tokens * 4:  # 粗略估算 1 token ≈ 4 字符
            remaining = max_tokens * 4 - total_length
            content = content[:remaining] + "..."

        compressed.append(content)
        total_length += len(content)

    return compressed

def build_rag_prompt(query, docs, template_type="standard"):
    """
    构建带上下文的 Prompt
    支持多种模板类型
    """
    context_parts = compress_context(docs)
    context = "\n\n---\n\n".join(context_parts)

    templates = {
        "standard": """基于以下参考资料回答问题。
如果参考资料中没有相关信息，请坦诚告知。

参考资料：
{context}

问题：{question}

回答：""",
        "concise": """简洁地回答以下问题。只基于提供的参考资料，不要编造。

{context}

问题：{question}

回答（50字以内）：""",
        "cited": """基于参考资料回答问题，并在关键信息后标注来源 [来源X]。

参考资料：
{context}

问题：{question}

回答（标注来源）：""",
    }

    prompt = ChatPromptTemplate.from_template(templates[template_type])
    return prompt, {"context": context, "question": query}

# 测试不同的 Prompt 模板
docs = retriever.invoke("Django 新版本有什么改进？")
for template_type in ["standard", "concise", "cited"]:
    prompt, inputs = build_rag_prompt("Django 新版本有什么改进？", docs, template_type)
    chain = prompt | llm
    result = chain.invoke(inputs)
    print(f"\n[{template_type}] {result.content[:100]}...")

# ========== 5. Redis 缓存层 ==========
print("\n=== 5. Redis 缓存 ===")

import redis

class RetrievalCache:
    """
    检索结果缓存层
    支持 Embedding 缓存和检索结果缓存
    """
    def __init__(self, host="localhost", port=6379, db=0, ttl=3600):
        """
        ttl: 缓存过期时间（秒），默认 1 小时
        """
        try:
            self.client = redis.Redis(host=host, port=port, db=db, decode_responses=True)
            self.client.ping()
            self.available = True
            print(f"  Redis 连接成功 (TTL={ttl}s)")
        except redis.ConnectionError:
            self.client = None
            self.available = False
            print("  Redis 不可用，使用内存缓存替代")
            self._memory_cache = {}

        self.ttl = ttl

    def _make_key(self, prefix, text):
        """生成缓存键"""
        text_hash = hashlib.md5(text.encode()).hexdigest()
        return f"rag:{prefix}:{text_hash}"

    def get(self, prefix, text):
        """获取缓存"""
        key = self._make_key(prefix, text)
        if self.available:
            cached = self.client.get(key)
        else:
            cached = self._memory_cache.get(key)

        if cached:
            return json.loads(cached)
        return None

    def set(self, prefix, text, value):
        """设置缓存"""
        key = self._make_key(prefix, text)
        serialized = json.dumps(value, ensure_ascii=False)
        if self.available:
            self.client.setex(key, self.ttl, serialized)
        else:
            self._memory_cache[key] = serialized

    def get_retrieval_results(self, query):
        """获取检索结果缓存"""
        return self.get("retrieval", query)

    def set_retrieval_results(self, query, results):
        """缓存检索结果"""
        serializable = [
            {"content": doc.page_content, "metadata": doc.metadata}
            for doc in results
        ]
        self.set("retrieval", query, serializable)

    def get_llm_response(self, prompt_text):
        """获取 LLM 响应缓存"""
        return self.get("llm", prompt_text)

    def set_llm_response(self, prompt_text, response):
        """缓存 LLM 响应"""
        self.set("llm", prompt_text, {"content": response})

# 使用缓存
cache = RetrievalCache(ttl=300)  # 5 分钟过时

def cached_retrieve(query, retriever, cache):
    """带缓存的检索"""
    # 1. 检查缓存
    cached = cache.get_retrieval_results(query)
    if cached:
        print(f"  [缓存命中] {query[:30]}...")
        return [Document(page_content=r["content"], metadata=r["metadata"]) for r in cached]

    # 2. 执行检索
    print(f"  [缓存未命中] 执行检索: {query[:30]}...")
    results = retriever.invoke(query)

    # 3. 写入缓存
    cache.set_retrieval_results(query, results)
    return results

# 测试缓存
query = "Python 新特性"
start = time.time()
result1 = cached_retrieve(query, retriever, cache)
time1 = time.time() - start

start = time.time()
result2 = cached_retrieve(query, retriever, cache)
time2 = time.time() - start

print(f"\n首次检索: {time1:.4f}s")
print(f"缓存检索: {time2:.4f}s")
print(f"加速比: {time1/time2:.1f}x (如果有真实 Redis)")
```

## 🆘 怎救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | HyDE 生成的假设文档质量差 | 尝试不同的 temperature（0.3-0.7），或用更强的模型 |
| 2 | Multi-Query 生成的查询太相似 | 在 Prompt 中明确要求"不同角度、不同关键词" |
| 3 | Redis 连接失败 | 确保 Redis 已运行：`redis-server`，或使用内存缓存替代 |
| 4 | 缓存命中率低 | 调整缓存 key 的生成策略，或增大 TTL |
| 5 | 上下文太长超出 token 限制 | 用 `compress_context` 截断，或用 LLM 做摘要 |
| 6 | Step-Back 改写方向跑偏 | 在 Prompt 中给出更多约束和示例 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| HyDE | 假设文档嵌入：先让 LLM 编一个"假答案"，再用假答案去检索 |
| Multi-Query | 多查询扩展：一个问题生成多个不同角度的查询 |
| Step-Back | 退后一步：把具体问题改写为更宽泛的背景查询 |
| Query Rewrite | 查询改写：将用户原始查询转换为更适合检索的形式 |
| 上下文注入 | 将检索到的文档拼接到 Prompt 中，为 LLM 提供回答依据 |
| 上下文压缩 | 去除冗余、截断过长内容，控制 Prompt 长度 |
| Cache Hit | 缓存命中：请求的数据已在缓存中，无需重新计算 |
| TTL | Time To Live，缓存数据的过期时间 |
| RAG Cache | RAG 缓存层：缓存检索结果和 LLM 响应，提升响应速度 |
| Prompt 模板 | 包含变量占位符的 Prompt，支持动态填充上下文 |

## ✅ 验收清单
- [ ] 理解 HyDE 的原理（假设文档 → 检索 → 返回真实文档）
- [ ] 能实现 Multi-Query 多角度检索
- [ ] 能说出 Step-Back 的适用场景
- [ ] 理解上下文压缩的必要性
- [ ] 能用 Redis（或内存替代）实现检索缓存
- [ ] 对比缓存前后的响应速度差异

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
