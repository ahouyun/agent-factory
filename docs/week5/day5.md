# 📅 Week 5 Day 5：查询改写、上下文注入、Redis 缓存

## 🧭 今日方向
> 用户的查询往往"言简意赅"但信息不足。今天学习如何让系统更聪明地理解用户意图：通过 Query 改写提升检索质量，通过上下文注入优化 Prompt，通过 Redis 缓存加速重复查询。

## 🎯 生活比喻
> **图书馆找书的三种技巧**。你跟图书管理员说"那个讲太空的书"（模糊查询），管理员会帮你改写成"关于太空探索的科普书籍"（Query 改写）。找到书后，管理员不是把整本书给你，而是翻到最相关的章节夹好标签（上下文注入）。如果下一个人也问同样的问题，管理员直接从桌上的备忘录里拿答案（Redis 缓存）。

## 📋 今日三件事
1. 掌握三种查询改写技术：扩展、HyDE、多查询
2. 学会上下文注入的最佳实践
3. 实现 Redis 缓存层，避免重复计算

---

## 🗺️ 手把手路线

### Step 1: 查询改写（Query Rewriting）
- **做什么**: 实现扩展查询、HyDE、多查询三种技术
- **为什么**: 原始查询太短太模糊，改写后检索效果显著提升
- **成功标志**: 改写后的查询能检索到更相关的结果

### Step 2: 上下文注入（Context Injection）
- **做什么**: 将检索结果组装成高质量的 Prompt
- **为什么**: 同样的检索结果，不同的 Prompt 组织方式效果差异巨大
- **成功标志**: 能构建结构化的、信息丰富的 Prompt

### Step 3: Redis 缓存
- **做什么**: 实现基于 Redis 的查询缓存
- **为什么**: 避免对相同查询重复调用 Embedding 和 LLM
- **成功标志**: 缓存命中时响应时间大幅缩短

---

## 💻 代码区

### 代码 1：查询改写技术

```python
"""
查询改写（Query Rewriting）
将用户原始查询转换为更适合检索的形式
"""
import re
import random


# ============================================================
# 技术 1：查询扩展（Query Expansion）
# ============================================================
class QueryExpander:
    """
    查询扩展：在原始查询基础上添加相关词汇
    原理：用户说"年假"，系统扩展为"年假 带薪假 年休假 假期制度"
    """

    def __init__(self):
        # 同义词/扩展词典（实际项目中用 WordNet 或 LLM 生成）
        self.synonyms = {
            "年假": ["带薪假", "年休假", "假期天数"],
            "远程": ["在家办公", "居家办公", "远程工作"],
            "报销": ["费用报销", "差旅费", "报销流程"],
            "培训": ["培训经费", "学习发展", "职业培训"],
            "试用期": ["实习期", "考察期", "试用"],
            "晋升": ["升职", "晋级", "职级晋升"],
            "五险一金": ["社保", "社会保险", "住房公积金"],
        }

    def expand(self, query, max_expansions=2):
        """扩展查询"""
        expansions = [query]
        for keyword, synonyms in self.synonyms.items():
            if keyword in query:
                # 随机选取同义词
                selected = random.sample(
                    synonyms, min(max_expansions, len(synonyms))
                )
                expanded = query + " " + " ".join(selected)
                expansions.append(expanded)

        return expansions


# ============================================================
# 技术 2：HyDE（Hypothetical Document Embeddings）
# ============================================================
class HyDERewriter:
    """
    HyDE：假设性文档嵌入
    原理：让 LLM 先生成一个"假设性答案"，用这个答案去检索
    优点：假设性答案在语义空间中更接近真实文档
    """

    def __init__(self):
        # 模拟 LLM 生成假设性文档
        self.hypothetical_templates = {
            "年假": "根据公司年假制度，员工每年享有带薪年假，具体天数根据工龄有所不同。",
            "远程": "公司支持远程办公政策，员工每周可以有几天在家办公，需要提前申请。",
            "报销": "公司差旅报销流程包括提交报销单、附上发票、主管审批等步骤。",
            "培训": "公司提供培训经费支持员工职业发展，可用于外部培训和认证考试。",
        }

    def rewrite(self, query):
        """生成假设性文档"""
        for keyword, template in self.hypothetical_templates.items():
            if keyword in query:
                return template

        # 默认假设性文档
        return f"关于{query}，公司有相应的政策和制度规定。"


# ============================================================
# 技术 3：多查询（Multi-Query）
# ============================================================
class MultiQueryGenerator:
    """
    多查询：从不同角度生成多个查询
    原理：一个问题可以有多种问法，覆盖不同的检索路径
    """

    def __init__(self):
        self.rewrite_templates = [
            "请解释{query}",
            "{query}的具体规定是什么",
            "关于{query}的政策",
            "{query}相关的制度",
            "如何{query}",
        ]

    def generate(self, query, num_queries=3):
        """生成多个查询变体"""
        queries = [query]  # 保留原始查询

        for template in self.rewrite_templates[:num_queries]:
            variant = template.format(query=query)
            if variant != query:
                queries.append(variant)

        return queries


# ============================================================
# 演示三种查询改写技术
# ============================================================
print("=" * 70)
print("查询改写技术演示")
print("=" * 70)

# 测试查询
test_query = "年假"

# 1. 查询扩展
print(f"\n【技术 1】查询扩展")
print(f"  原始查询: '{test_query}'")
expander = QueryExpander()
expanded = expander.expand(test_query)
for i, q in enumerate(expanded):
    print(f"  扩展 {i+1}: '{q}'")

# 2. HyDE
print(f"\n【技术 2】HyDE 假设性文档")
print(f"  原始查询: '{test_query}'")
hyde = HyDERewriter()
hypothetical = hyde.rewrite(test_query)
print(f"  假设性文档: '{hypothetical}'")
print(f"  说明: 用这段假设性文档去检索，比用原始查询更接近真实文档")

# 3. 多查询
print(f"\n【技术 3】多查询变体")
print(f"  原始查询: '{test_query}'")
mq_gen = MultiQueryGenerator()
queries = mq_gen.generate(test_query)
for i, q in enumerate(queries):
    print(f"  查询 {i+1}: '{q}'")

print(f"\n  说明: 对每个查询分别检索，合并去重后返回")
print(f"  好处: 覆盖更多相关文档，提升召回率")

print("\n" + "=" * 70)
print("总结：查询改写 = 让用户的模糊意图变得更精确")
print("=" * 70)
```

**预期输出：**
```
======================================================================
查询改写技术演示
======================================================================

【技术 1】查询扩展
  原始查询: '年假'
  扩展 1: '年假'
  扩展 2: '年假 带薪假 年休假 假期天数'

【技术 2】HyDE 假设性文档
  原始查询: '年假'
  假设性文档: '根据公司年假制度，员工每年享有带薪年假，具体天数根据工龄有所不同。'
  说明: 用这段假设性文档去检索，比用原始查询更接近真实文档

【技术 3】多查询变体
  原始查询: '年假'
  查询 1: '年假'
  查询 2: '请解释年假'
  查询 3: '年假的具体规定是什么'
  查询 4: '关于年假的政策'

  说明: 对每个查询分别检索，合并去重后返回
  好处: 覆盖更多相关文档，提升召回率

======================================================================
总结：查询改写 = 让用户的模糊意图变得更精确
======================================================================
```

---

### 代码 2：上下文注入（Context Injection）

```python
"""
上下文注入：将检索结果组装成高质量的 Prompt
同样的检索结果，不同的 Prompt 组织方式效果差异巨大
"""


# ============================================================
# 方法 1：简单拼接（Baseline）
# ============================================================
def inject_simple(query, documents):
    """最简单的上下文注入：直接拼接"""
    context = "\n\n".join(documents)
    return f"""参考资料：
{context}

问题：{query}
"""


# ============================================================
# 方法 2：带编号的结构化注入
# ============================================================
def inject_structured(query, documents, metadata=None):
    """结构化注入：带编号和来源"""
    parts = []
    for i, doc in enumerate(documents):
        source_info = ""
        if metadata and i < len(metadata):
            meta = metadata[i]
            source_info = f" (来源: {meta.get('source', '未知')}, 相关度: {meta.get('score', 'N/A')})"
        parts.append(f"[文档 {i+1}]{source_info}\n{doc}")

    context = "\n\n".join(parts)

    return f"""你是一个专业的政策助手。请根据以下参考资料回答问题。

## 参考资料

{context}

## 回答要求
- 只根据参考资料中的信息回答
- 引用具体文档编号，例如"根据文档 [1]..."
- 如果资料中没有相关信息，请明确说明"参考资料中未找到相关信息"
- 保持回答简洁准确

## 用户问题
{query}
"""


# ============================================================
# 方法 3：分层注入（摘要 + 详情）
# ============================================================
def inject_layered(query, documents, summaries=None):
    """分层注入：先给摘要，再给详情"""
    # 先给 LLM 一个全景
    overview = "本文档集包含以下内容：\n"
    for i, doc in enumerate(documents):
        summary = summaries[i] if summaries else doc[:50] + "..."
        overview += f"  {i+1}. {summary}\n"

    # 再给详情
    details = ""
    for i, doc in enumerate(documents):
        details += f"\n--- 文档 {i+1} 详情 ---\n{doc}\n"

    return f"""## 概览
{overview}

## 详细资料
{details}

## 用户问题
{query}

## 回答指引
1. 先根据概览确定哪些文档可能相关
2. 再阅读相关文档的详情
3. 综合信息给出完整回答
"""


# ============================================================
# 方法 4：对话历史注入
# ============================================================
def inject_with_history(query, documents, chat_history=None):
    """带对话历史的上下文注入"""
    history_text = ""
    if chat_history:
        for role, content in chat_history[-3:]:  # 只保留最近 3 轮
            emoji = "👤" if role == "user" else "🤖"
            history_text += f"{emoji} {role}: {content}\n"

    context = "\n\n".join([f"[参考 {i+1}] {doc}" for i, doc in enumerate(documents)])

    return f"""## 对话历史
{history_text if history_text else '(这是对话的开始)'}

## 参考资料
{context}

## 当前问题
{query}

## 回答要求
- 结合对话历史和参考资料回答
- 如果问题涉及之前的对话，保持上下文连贯
- 只使用参考资料中的信息，不要编造
"""


# ============================================================
# 演示
# ============================================================
documents = [
    "公司员工每年享有 15 天带薪年假。入职满 5 年后增加至 20 天。",
    "公司支持每周最多 2 天远程办公。远程办公需提前一天申请。",
    "差旅报销需在出差结束后 5 个工作日内提交。",
]
metadata = [
    {"source": "员工手册 v2.1", "score": "0.95"},
    {"source": "远程办公FAQ", "score": "0.72"},
    {"source": "财务制度", "score": "0.61"},
]
summaries = ["年假制度", "远程办公政策", "报销流程"]

query = "年假有多少天"

print("=" * 70)
print("上下文注入方法对比")
print("=" * 70)

print("\n【方法 1】简单拼接")
prompt1 = inject_simple(query, documents)
print(prompt1[:300] + "...")

print("\n【方法 2】结构化注入")
prompt2 = inject_structured(query, documents, metadata)
print(prompt2[:400] + "...")

print("\n【方法 3】分层注入")
prompt3 = inject_layered(query, documents, summaries)
print(prompt3[:400] + "...")

print("\n【方法 4】带对话历史注入")
chat_history = [
    ("user", "你好，我想了解一下公司的假期政策"),
    ("assistant", "公司有年假、病假等多种假期制度，您想了解哪种？"),
    ("user", "年假"),
]
prompt4 = inject_with_history(query, documents, chat_history)
print(prompt4[:500] + "...")

print("\n" + "=" * 70)
print("方法对比：")
print("  方法 1 - 简单但缺少结构，LLM 可能忽略部分文档")
print("  方法 2 - 最常用，带编号便于引用，有回答约束")
print("  方法 3 - 适合文档多的场景，先概览再详情")
print("  方法 4 - 适合多轮对话，保持上下文连贯")
print("=" * 70)
```

**预期输出：**
```
======================================================================
上下文注入方法对比
======================================================================

【方法 1】简单拼接
参考资料：
公司员工每年享有 15 天带薪年假。入职满 5 年后增加至 20 天。

公司支持每周最多 2 天远程办公。远程办公需提前一天申请。
...

【方法 2】结构化注入
你是一个专业的政策助手。请根据以下参考资料回答问题。

## 参考资料

[文档 1] (来源: 员工手册 v2.1, 相关度: 0.95)
公司员工每年享有 15 天带薪年假。入职满 5 年后增加至 20 天。
...

======================================================================
方法对比：
  方法 1 - 简单但缺少结构，LLM 可能忽略部分文档
  方法 2 - 最常用，带编号便于引用，有回答约束
  方法 3 - 适合文档多的场景，先概览再详情
  方法 4 - 适合多轮对话，保持上下文连贯
======================================================================
```

---

### 代码 3：Redis 缓存层

```python
"""
Redis 缓存层
避免对相同查询重复调用 Embedding 模型和 LLM
使用内存字典模拟 Redis（无需安装 Redis）
"""

import hashlib
import json
import time
from functools import wraps


# ============================================================
# 内存版 Redis 模拟器（无需安装 Redis）
# ============================================================
class MockRedis:
    """
    内存版 Redis 模拟器
    接口与真实 Redis 兼容，方便后续切换
    实际项目中替换为: redis.Redis(host='localhost', port=6379)
    """

    def __init__(self):
        self.store = {}
        self.ttls = {}  # 过期时间

    def set(self, key, value, ex=None):
        """设置键值对，ex 为过期秒数"""
        self.store[key] = json.dumps(value, ensure_ascii=False)
        if ex:
            self.ttls[key] = time.time() + ex

    def get(self, key):
        """获取值"""
        if key in self.ttls and time.time() > self.ttls[key]:
            del self.store[key]
            del self.ttls[key]
            return None
        value = self.store.get(key)
        return json.loads(value) if value else None

    def delete(self, *keys):
        """删除键"""
        for key in keys:
            self.store.pop(key, None)
            self.ttls.pop(key, None)

    def exists(self, key):
        """检查键是否存在"""
        return key in self.store

    def keys(self, pattern="*"):
        """获取所有匹配的键"""
        import fnmatch
        return [k for k in self.store if fnmatch.fnmatch(k, pattern)]

    def flushall(self):
        """清空所有数据"""
        self.store.clear()
        self.ttls.clear()


# ============================================================
# RAG 缓存管理器
# ============================================================
class RAGCacheManager:
    """
    RAG 系统的缓存管理器
    缓存层：查询 → Embedding → 检索结果 → LLM 回答
    """

    def __init__(self, redis_client=None, default_ttl=3600):
        """
        参数:
            redis_client: Redis 客户端（默认使用 MockRedis）
            default_ttl: 默认缓存过期时间（秒），默认 1 小时
        """
        self.redis = redis_client or MockRedis()
        self.default_ttl = default_ttl
        self.stats = {"hits": 0, "misses": 0}

    def _make_key(self, prefix, query, **kwargs):
        """生成缓存键"""
        # 对查询内容做哈希，确保相同查询生成相同键
        query_hash = hashlib.md5(
            (query + json.dumps(kwargs, sort_keys=True)).encode()
        ).hexdigest()[:12]
        return f"rag:{prefix}:{query_hash}"

    # --------------------------------------------------------
    # 缓存 1：Embedding 缓存
    # --------------------------------------------------------
    def get_cached_embedding(self, query):
        """获取缓存的 Embedding"""
        key = self._make_key("embed", query)
        result = self.redis.get(key)
        if result:
            self.stats["hits"] += 1
            return result
        self.stats["misses"] += 1
        return None

    def set_cached_embedding(self, query, embedding):
        """缓存 Embedding"""
        key = self._make_key("embed", query)
        self.redis.set(key, embedding, ex=self.default_ttl)

    # --------------------------------------------------------
    # 缓存 2：检索结果缓存
    # --------------------------------------------------------
    def get_cached_results(self, query, top_k=3):
        """获取缓存的检索结果"""
        key = self._make_key("results", query, top_k=top_k)
        result = self.redis.get(key)
        if result:
            self.stats["hits"] += 1
            return result
        self.stats["misses"] += 1
        return None

    def set_cached_results(self, query, results, top_k=3):
        """缓存检索结果"""
        key = self._make_key("results", query, top_k=top_k)
        self.redis.set(key, results, ex=self.default_ttl)

    # --------------------------------------------------------
    # 缓存 3：LLM 回答缓存
    # --------------------------------------------------------
    def get_cached_answer(self, query):
        """获取缓存的 LLM 回答"""
        key = self._make_key("answer", query)
        result = self.redis.get(key)
        if result:
            self.stats["hits"] += 1
            return result
        self.stats["misses"] += 1
        return None

    def set_cached_answer(self, query, answer):
        """缓存 LLM 回答"""
        key = self._make_key("answer", query)
        self.redis.set(key, answer, ex=self.default_ttl)

    # --------------------------------------------------------
    # 缓存统计
    # --------------------------------------------------------
    def get_stats(self):
        """获取缓存命中率"""
        total = self.stats["hits"] + self.stats["misses"]
        hit_rate = self.stats["hits"] / total if total > 0 else 0
        return {
            "hits": self.stats["hits"],
            "misses": self.stats["misses"],
            "total": total,
            "hit_rate": f"{hit_rate:.1%}",
        }


# ============================================================
# 演示：缓存命中 vs 未命中
# ============================================================
print("=" * 70)
print("Redis 缓存层演示")
print("=" * 70)

cache = RAGCacheManager(default_ttl=300)

# 模拟 RAG 流程
def mock_rag_with_cache(query, cache_manager):
    """带缓存的 RAG 流程"""
    start = time.time()

    # 1. 检查 LLM 回答缓存
    cached_answer = cache_manager.get_cached_answer(query)
    if cached_answer:
        elapsed = time.time() - start
        return {"answer": cached_answer, "source": "cache", "time": elapsed}

    # 2. 检查检索结果缓存
    cached_results = cache_manager.get_cached_results(query)
    if cached_results:
        results = cached_results
    else:
        # 模拟检索（耗时操作）
        time.sleep(0.01)
        results = [
            {"doc": "公司年假制度：15天带薪年假", "score": 0.95},
            {"doc": "试用期为3个月", "score": 0.45},
        ]
        cache_manager.set_cached_results(query, results)

    # 3. 模拟 LLM 生成（耗时操作）
    time.sleep(0.01)
    answer = f"根据参考资料，{query}的回答是：员工每年享有 15 天带薪年假。"

    # 4. 缓存 LLM 回答
    cache_manager.set_cached_answer(query, answer)

    elapsed = time.time() - start
    return {"answer": answer, "source": "computed", "time": elapsed}


# 测试：第一次查询（全部 miss）
print("\n【第 1 次查询】'年假有多少天' - 全部未命中")
result1 = mock_rag_with_cache("年假有多少天", cache)
print(f"  来源: {result1['source']}")
print(f"  耗时: {result1['time']*1000:.1f}ms")
print(f"  回答: {result1['answer'][:60]}...")

# 测试：第二次查询（全部 hit）
print("\n【第 2 次查询】'年假有多少天' - 全部命中")
result2 = mock_rag_with_cache("年假有多少天", cache)
print(f"  来源: {result2['source']}")
print(f"  耗时: {result2['time']*1000:.1f}ms")

# 测试：不同查询
print("\n【第 3 次查询】'远程办公政策' - 未命中")
result3 = mock_rag_with_cache("远程办公政策", cache)
print(f"  来源: {result3['source']}")
print(f"  耗时: {result3['time']*1000:.1f}ms")

print("\n【第 4 次查询】'远程办公政策' - 命中")
result4 = mock_rag_with_cache("远程办公政策", cache)
print(f"  来源: {result4['source']}")
print(f"  耗时: {result4['time']*1000:.1f}ms")

# 缓存统计
print("\n" + "=" * 70)
print("缓存统计:")
stats = cache.get_stats()
for k, v in stats.items():
    print(f"  {k}: {v}")
print("=" * 70)
```

**预期输出：**
```
======================================================================
Redis 缓存层演示
======================================================================

【第 1 次查询】'年假有多少天' - 全部未命中
  来源: computed
  耗时: 20.3ms
  回答: 根据参考资料，年假有多少天的回答是：员工每年享有 15 天带薪年假。...

【第 2 次查询】'年假有多少天' - 全部命中
  来源: cache
  耗时: 0.2ms

【第 3 次查询】'远程办公政策' - 未命中
  来源: computed
  耗时: 20.1ms

【第 4 次查询】'远程办公政策' - 命中
  来源: cache
  耗时: 0.1ms

======================================================================
缓存统计:
  hits: 2
  misses: 6
  total: 8
  hit_rate: 25.0%
======================================================================
```

---

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 查询扩展后检索结果变差 | 减少扩展词数量，只保留高相关性的同义词 |
| 2 | HyDE 生成的假设文档不准确 | 确保 LLM 理解查询意图，可用 Few-shot 提示 |
| 3 | 多查询导致结果太多 | 对每个查询只取 top-3，合并后取 top-5 |
| 4 | Prompt 太长超出 LLM 上下文限制 | 减少文档数量，或使用分层注入先概览后详情 |
| 5 | Redis 缓存键冲突 | 使用查询内容的哈希值作为键的一部分 |
| 6 | 缓存数据过期但仍有价值 | 增大 TTL，或实现缓存刷新机制 |

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Query Rewriting | 查询改写，将用户原始查询转换为更适合检索的形式 |
| Query Expansion | 查询扩展，在原始查询中添加同义词和相关词 |
| HyDE | 假设性文档嵌入，先让 LLM 生成假设答案再去检索 |
| Multi-Query | 多查询，从不同角度生成多个查询变体 |
| Context Injection | 上下文注入，将检索结果组装到 Prompt 中 |
| Redis | 内存数据库，常用于缓存热点数据 |
| Cache Hit | 缓存命中，请求的数据在缓存中找到 |
| Cache Miss | 缓存未命中，需要重新计算 |
| TTL | Time To Live，缓存数据的过期时间 |

---

## ✅ 验收清单

- [ ] 能实现查询扩展（同义词替换）
- [ ] 理解 HyDE 的原理和使用场景
- [ ] 能实现多查询生成
- [ ] 能实现至少两种上下文注入方法
- [ ] 理解"结构化注入"为何优于"简单拼接"
- [ ] 能实现 Redis 缓存层（含命中/未命中逻辑）
- [ ] 能计算缓存命中率

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
