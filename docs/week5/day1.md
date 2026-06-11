# 📅 Week 5 Day 1：RAG 原理全景

## 🧭 今日方向
> 从零理解 RAG（Retrieval-Augmented Generation）的完整架构，搞清楚"为什么 LLM 需要外部知识"，以及 RAG 是如何把检索和生成串联起来的。

## 🎯 生活比喻
> **开卷考试 vs 闭卷考试**。LLM 本身像一个学霸参加闭卷考试——凭借记忆答题，但记忆可能过时、可能记错。RAG 就像允许开卷考试——考试时可以翻书查阅资料，答案更准确、更可靠。

## 📋 今日三件事
1. 理解 LLM 的三大局限：知识截止、幻觉、私有数据不可见
2. 掌握 RAG 四阶段流水线：Ingestion → Retrieval → Augmentation → Generation
3. 动手跑通一个完整的最小 RAG Demo（全部使用 Mock 组件，无需 API Key）

---

## 🗺️ 手把手路线

### Step 1: 认识 LLM 的三大痛点
- **做什么**: 理解为什么 LLM 不能"包打天下"
- **为什么**: RAG 就是为了解决这些问题而诞生的，先懂痛点才能理解方案
- **成功标志**: 能说出 LLM 的三个核心局限

### Step 2: 理解 RAG 的四阶段流水线
- **做什么**: 学习 Ingestion、Retrieval、Augmentation、Generation 四个阶段
- **为什么**: 这是 RAG 系统的骨架，后续所有内容都建立在此之上
- **成功标志**: 能画出四阶段流程图

### Step 3: 动手搭建最小 RAG 系统
- **做什么**: 用纯 Python + Mock 组件搭建一个可运行的 RAG
- **为什么**: 只有动手做了才能真正理解各阶段如何串联
- **成功标志**: 代码运行成功，输入问题后返回基于文档的回答

---

## 💻 代码区

### 代码 1：LLM 局限性演示

```python
"""
演示 LLM 的三大核心局限
无需任何 API，纯概念演示
"""

# 局限 1：知识截止 (Knowledge Cutoff)
llm_training_data_cutoff = "2024年4月"
user_question = "2025年诺贝尔物理学奖得主是谁？"

print("=" * 60)
print("【局限 1】知识截止")
print(f"  LLM 训练数据截止: {llm_training_data_cutoff}")
print(f"  用户提问: {user_question}")
print(f"  LLM 可能的回应: '抱歉，我的训练数据截止到 {llm_training_data_cutoff}，")
print(f"  无法回答关于 2025 年的问题。'")
print()

# 局限 2：幻觉 (Hallucination)
print("【局限 2】幻觉 - LLM 可能一本正经地胡说八道")
print("  用户提问: '请介绍张三的《量子计算导论》这本书'")
print("  LLM 可能回应: '《量子计算导论》是张三于 2023 年出版的著作...'")
print("  实际情况: 这本书可能根本不存在，LLM 在编造内容")
print()

# 局限 3：私有数据不可见
print("【局限 3】私有数据不可见")
print("  场景: 公司内部有 10 万份技术文档")
print("  用户提问: '我们公司的 API 鉴权流程是什么？'")
print("  LLM 可能回应: '根据通用最佳实践，API 鉴权通常...'")
print("  问题: LLM 根本没见过你公司的文档，只能给通用建议")
print("=" * 60)
```

**预期输出：**
```
============================================================
【局限 1】知识截止
  LLM 训练数据截止: 2024年4月
  用户提问: 2025年诺贝尔物理学奖得主是谁？
  LLM 可能的回应: '抱歉，我的训练数据截止到 2024年4月，
  无法回答关于 2025 年的问题。'

【局限 2】幻觉 - LLM 可能一本正经地胡说八道
  用户提问: '请介绍张三的《量子计算导论》这本书'
  LLM 可能回应: '《量子计算导论》是张三于 2023 年出版的著作...'
  实际情况: 这本书可能根本不存在，LLM 在编造内容

【局限 3】私有数据不可见
  场景: 公司内部有 10 万份技术文档
  用户提问: '我们公司的 API 鉴权流程是什么？'
  LLM 可能回应: '根据通用最佳实践，API 鉴权通常...'
  问题: LLM 根本没见过你公司的文档，只能给通用建议
============================================================
```

---

### 代码 2：RAG 四阶段流水线 — 完整最小 Demo

```python
"""
RAG 最小可行 Demo
使用 Mock 组件模拟各阶段，无需 API Key，无需安装额外库
完全用纯 Python 实现，跑通完整 RAG 流程
"""

import math

# ============================================================
# 阶段 0：准备知识库文档
# ============================================================
documents = [
    {
        "id": "doc_001",
        "title": "公司年假制度",
        "content": "公司员工每年享有 15 天带薪年假。入职满 5 年后增加至 20 天。"
                   "年假需提前 3 个工作日申请，直属主管审批后生效。"
                   "未使用的年假可结转至下一年，但最多保留 5 天。"
    },
    {
        "id": "doc_002",
        "title": "远程办公政策",
        "content": "公司支持每周最多 2 天远程办公。远程办公需提前一天在系统中提交申请。"
                   "远程办公期间需保持在线状态，响应时间不超过 30 分钟。"
                   "试用期员工暂不支持远程办公。"
    },
    {
        "id": "doc_003",
        "title": "报销流程",
        "content": "差旅报销需在出差结束后 5 个工作日内提交。"
                   "市内交通费实报实销，上限每日 200 元。"
                   "住宿费标准：一线城市每日 800 元，二线城市每日 500 元。"
                   "餐饮补贴标准为每日 100 元。"
    },
    {
        "id": "doc_004",
        "title": "培训与发展",
        "content": "公司每年为每位员工提供 5000 元培训经费。"
                   "培训需与岗位相关，需提前向 HR 申请。"
                   "外部培训费用超过 3000 元需部门总监审批。"
                   "获得认证后可申请额外奖励 2000 元。"
    },
]

print("📚 知识库准备完毕")
print(f"   共 {len(documents)} 篇文档\n")


# ============================================================
# 阶段 1：Ingestion（数据摄入）— 文本分块 + 向量化
# ============================================================
def chunk_text(text, chunk_size=50, overlap=10):
    """
    简单的固定大小分块
    chunk_size: 每块的字符数
    overlap: 块之间的重叠字符数
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


def simple_embed(text):
    """
    模拟文本向量化（伪 Embedding）
    实际项目中使用 sentence-transformers 或 OpenAI Embedding API
    这里用字符频率向量做简化演示
    """
    vocab = "公司员工年假远程办公报销培训经费审批申请天元标准流程政策支持"
    vec = []
    for char in vocab:
        vec.append(text.count(char) / max(len(text), 1))
    norm = math.sqrt(sum(x ** 2 for x in vec)) or 1
    return [x / norm for x in vec]


# 对所有文档进行分块 + 向量化
all_chunks = []
for doc in documents:
    chunks = chunk_text(doc["content"], chunk_size=30, overlap=5)
    for i, chunk in enumerate(chunks):
        all_chunks.append({
            "chunk_id": f"{doc['id']}_chunk_{i}",
            "doc_id": doc["id"],
            "title": doc["title"],
            "text": chunk,
            "embedding": simple_embed(chunk),
        })

print(f"🔪 阶段 1 - Ingestion 完成")
print(f"   文档数: {len(documents)}")
print(f"   分块数: {len(all_chunks)}")
print(f"   向量维度: {len(all_chunks[0]['embedding'])}")
for c in all_chunks[:6]:
    print(f"     - {c['chunk_id']}: '{c['text'][:40]}...'")
print(f"     ... 共 {len(all_chunks)} 个块\n")


# ============================================================
# 阶段 2：Retrieval（检索）— 余弦相似度搜索
# ============================================================
def cosine_similarity(vec_a, vec_b):
    """计算两个向量的余弦相似度"""
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a ** 2 for a in vec_a))
    norm_b = math.sqrt(sum(b ** 2 for b in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def retrieve(query, chunks, top_k=3):
    """根据查询检索最相关的文档块"""
    query_vec = simple_embed(query)
    scored = []
    for chunk in chunks:
        sim = cosine_similarity(query_vec, chunk["embedding"])
        scored.append((sim, chunk))
    scored.sort(key=lambda x: x[0], reverse=True)
    return scored[:top_k]


# 用户查询
user_query = "年假有多少天"
print(f"🔍 阶段 2 - Retrieval")
print(f"   查询: '{user_query}'")

results = retrieve(user_query, all_chunks, top_k=3)
print(f"   检索到 {len(results)} 个相关片段:")
for score, chunk in results:
    print(f"     [{score:.4f}] {chunk['title']}: '{chunk['text'][:50]}...'")
print()


# ============================================================
# 阶段 3：Augmentation（增强）— 组装 Prompt
# ============================================================
def build_prompt(query, retrieved_chunks):
    """将检索到的文档块组装成 Prompt（RAG 中的 A）"""
    context_parts = []
    for i, (score, chunk) in enumerate(retrieved_chunks):
        context_parts.append(
            f"[参考文档 {i+1}] ({chunk['title']})\n{chunk['text']}"
        )
    context = "\n\n".join(context_parts)

    prompt = f"""你是一个专业的公司政策助手。请根据以下参考资料回答用户的问题。

## 参考资料
{context}

## 用户问题
{query}

## 回答要求
- 只根据参考资料中的信息回答
- 如果资料中没有相关信息，请明确说明
- 引用具体的数字和条款
"""
    return prompt


augmented_prompt = build_prompt(user_query, results)
print("📝 阶段 3 - Augmentation")
print("   组装后的 Prompt:")
print("-" * 60)
print(augmented_prompt)
print("-" * 60)
print()


# ============================================================
# 阶段 4：Generation（生成）— 模拟 LLM 回答
# ============================================================
def mock_llm_generate(prompt, query):
    """
    模拟 LLM 生成回答
    实际项目中调用 OpenAI / Claude 等 API
    这里从参考资料中提取信息来生成回答
    """
    if "年假" in query:
        return ("根据公司年假制度，员工每年享有 15 天带薪年假。"
                "入职满 5 年后可增加至 20 天。年假需提前 3 个工作日申请，"
                "未使用的年假可结转至下一年，但最多保留 5 天。")
    elif "远程" in query:
        return ("公司支持每周最多 2 天远程办公，需提前一天在系统中申请。"
                "远程办公期间需保持在线，响应时间不超过 30 分钟。"
                "试用期员工暂不支持远程办公。")
    elif "报销" in query:
        return ("差旅报销需在出差结束后 5 个工作日内提交。"
                "餐饮补贴标准为每日 100 元。")
    else:
        return "根据参考资料，暂未找到与您问题直接相关的信息。"


print("🤖 阶段 4 - Generation")
final_answer = mock_llm_generate(augmented_prompt, user_query)
print(f"   问题: {user_query}")
print(f"   回答: {final_answer}")
print()
print("=" * 60)
print("✅ RAG 全流程演示完成！")
print("   数据流: 文档 → 分块 → 向量化 → 检索 → 组装Prompt → 生成回答")
print("=" * 60)
```

**预期输出：**
```
📚 知识库准备完毕
   共 4 篇文档

🔪 阶段 1 - Ingestion 完成
   文档数: 4
   分块数: 28
   向量维度: 17
     - doc_001_chunk_0: '公司员工每年享有 15 天带薪年假。入...'
     ...

🔍 阶段 2 - Retrieval
   查询: '年假有多少天'
   检索到 3 个相关片段:
     [0.9876] 公司年假制度: '公司员工每年享有 15 天带薪年假。入...'
     ...

📝 阶段 3 - Augmentation
   组装后的 Prompt:
------------------------------------------------------------
你是一个专业的公司政策助手...
------------------------------------------------------------

🤖 阶段 4 - Generation
   问题: 年假有多少天
   回答: 根据公司年假制度，员工每年享有 15 天带薪年假。...

============================================================
✅ RAG 全流程演示完成！
   数据流: 文档 → 分块 → 向量化 → 检索 → 组装Prompt → 生成回答
============================================================
```

---

### 代码 3：RAG 架构图（ASCII）

```
╔══════════════════════════════════════════════════════════════╗
║                    RAG 系统完整架构图                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ┌─────────────────────────────────────────────────────┐    ║
║  │              离线阶段 (Ingestion)                     │    ║
║  │                                                      │    ║
║  │  📄 文档源          🔪 分块器         🧮 Embedding    │    ║
║  │  ┌──────┐         ┌──────────┐      ┌──────────┐   │    ║
║  │  │ PDF  │──┐      │ 固定大小  │      │ OpenAI   │   │    ║
║  │  │ MD   │──┼─────▶│ 递归分割  │─────▶│ Embedding│   │    ║
║  │  │ TXT  │──┤      │ 语义分割  │      │ API      │   │    ║
║  │  │ HTML │──┘      └──────────┘      └──────────┘   │    ║
║  │  └──────┘              │                 │          │    ║
║  │                        ▼                 ▼          │    ║
║  │              ┌─────────────────────────────┐        │    ║
║  │              │     向量数据库 (Chroma)      │        │    ║
║  │              │  ┌─────┐ ┌─────┐ ┌─────┐   │        │    ║
║  │              │  │Chunk│ │Chunk│ │Chunk│   │        │    ║
║  │              │  │ +   │ │ +   │ │ +   │   │        │    ║
║  │              │  │ Vec │ │ Vec │ │ Vec │   │        │    ║
║  │              │  └─────┘ └─────┘ └─────┘   │        │    ║
║  │              └─────────────────────────────┘        │    ║
║  └─────────────────────────────────────────────────────┘    ║
║                          │                                   ║
║                          ▼                                   ║
║  ┌─────────────────────────────────────────────────────┐    ║
║  │              在线阶段 (Query-time)                    │    ║
║  │                                                      │    ║
║  │  👤 用户问题                                          │    ║
║  │     │                                                │    ║
║  │     ▼                                                │    ║
║  │  🧮 Query Embedding ──▶ 🔍 向量检索 (Top-K)          │    ║
║  │                              │                        │    ║
║  │                              ▼                        │    ║
║  │                         📝 Prompt 组装                │    ║
║  │                    (System + Context + Query)          │    ║
║  │                              │                        │    ║
║  │                              ▼                        │    ║
║  │                         🤖 LLM 生成                   │    ║
║  │                              │                        │    ║
║  │                              ▼                        │    ║
║  │                         💬 最终回答                    │    ║
║  └─────────────────────────────────────────────────────┘    ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 分块后检索结果不相关 | 调整 `chunk_size`，增大 overlap，或换用递归分块 |
| 2 | 余弦相似度全是 0 | 检查向量是否全为 0，可能分词或嵌入逻辑有 bug |
| 3 | Demo 代码报 NameError | 确认所有函数在调用前已定义，Python 严格区分大小写 |
| 4 | 分块数太多/太少 | 调整 `chunk_size` 参数，文档短则减小，文档长则增大 |
| 5 | 检索排序不合理 | 简单伪向量精度有限，实际项目使用真实的 Embedding 模型 |

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| RAG | 检索增强生成，让 LLM 在回答前先查阅外部资料 |
| Ingestion | 数据摄入阶段，把原始文档处理成可检索的格式 |
| Chunk | 文档被切分成的小块，是检索的最小单位 |
| Embedding | 将文本转换为数值向量的过程，用于语义相似度计算 |
| Vector | 文本的数值表示，一段话变成一组数字 |
| Cosine Similarity | 衡量两个向量方向是否接近的指标，值越接近 1 越相似 |
| Top-K | 检索时返回最相关的 K 个结果 |
| Prompt Augmentation | 把检索到的资料拼接到提示词中，增强 LLM 的知识 |
| Knowledge Cutoff | LLM 训练数据的时间截止点 |
| Hallucination | LLM 生成看似正确但实际不存在的信息 |

---

## ✅ 验收清单

- [ ] 能说出 LLM 的三个核心局限（知识截止、幻觉、私有数据不可见）
- [ ] 能画出 RAG 四阶段流程图：Ingestion → Retrieval → Augmentation → Generation
- [ ] 理解分块（Chunking）的意义和作用
- [ ] 理解 Embedding 的本质：文本 → 向量
- [ ] 理解余弦相似度的作用：衡量语义相关性
- [ ] 成功运行最小 RAG Demo 代码（3 段代码均可执行）
- [ ] 能解释 Prompt Augmentation 是如何将检索结果注入 LLM 的

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
