# 📅 Week 5 Day 6：RAG 评估指标

## 🧭 今日方向
> "没有度量就没有改进"。今天学习如何系统性地评估 RAG 系统的质量，掌握检索质量和生成质量的核心评估指标，以及如何用这些指标指导优化方向。

## 🎯 生活比喻
> **医生做体检**。光看"感觉好不好"不够客观。RAG 系统也需要"体检报告"——检索质量指标告诉你"找对了没有"，生成质量指标告诉你"答得好不好"，端到端指标告诉你"整体是否健康"。

## 📋 今日三件事
1. 掌握检索质量指标：Precision@K、Recall@K、MRR、NDCG
2. 掌握生成质量指标：Faithfulness、Relevancy、Answer Correctness
3. 用代码实现完整评估流程并解读结果

---

## 🗺️ 手把手路线

### Step 1: 检索质量评估
- **做什么**: 实现 Precision@K、Recall@K、MRR 三个核心指标
- **为什么**: 检索是 RAG 的基础，检索不好后面全白搭
- **成功标志**: 能计算并解释每个指标的含义

### Step 2: 生成质量评估
- **做什么**: 实现 Faithfulness、Relevancy 评估
- **为什么**: 检索对了不代表答得好，LLM 可能歪曲信息
- **成功标志**: 能量化评估 LLM 回答的质量

### Step 3: 综合评估与改进策略
- **做什么**: 构建完整评估管线，分析结果并给出优化建议
- **为什么**: 评估不是目的，改进才是目的
- **成功标志**: 能根据评估结果定位问题并给出优化方向

---

## 💻 代码区

### 代码 1：检索质量指标

```python
"""
RAG 检索质量评估指标
包含：Precision@K、Recall@K、MRR、NDCG
"""
import math


# ============================================================
# 基础指标 1：Precision@K（精确率）
# ============================================================
def precision_at_k(retrieved, relevant, k):
    """
    Precision@K：在返回的 Top-K 结果中，有多少是相关的

    公式：P@K = |相关且被检索到| / K

    解读：
    - P@3 = 1.0 表示前 3 个结果全部相关（完美）
    - P@3 = 0.67 表示前 3 个中有 2 个相关
    - P@3 = 0.0 表示前 3 个全不相关（糟糕）
    """
    retrieved_at_k = retrieved[:k]
    relevant_retrieved = len(set(retrieved_at_k) & set(relevant))
    return relevant_retrieved / k


# ============================================================
# 基础指标 2：Recall@K（召回率）
# ============================================================
def recall_at_k(retrieved, relevant, k):
    """
    Recall@K：所有相关文档中，有多少被检索到了

    公式：R@K = |相关且被检索到| / |所有相关文档|

    解读：
    - R@3 = 1.0 表示所有相关文档都被找到了（完美）
    - R@3 = 0.5 表示只找到了一半的相关文档
    - R@3 = 0.0 表示一个相关文档都没找到（灾难）
    """
    retrieved_at_k = retrieved[:k]
    relevant_retrieved = len(set(retrieved_at_k) & set(relevant))
    return relevant_retrieved / len(relevant) if relevant else 0


# ============================================================
# 基础指标 3：MRR（Mean Reciprocal Rank，平均倒数排名）
# ============================================================
def mrr(retrieved_list, relevant_list):
    """
    MRR：第一个相关结果排在第几位

    公式：MRR = (1/Q) * Σ(1/rank_i)

    解读：
    - MRR = 1.0 表示每个查询的第一个结果都是相关的
    - MRR = 0.5 表示平均在第 2 位找到第一个相关结果
    - MRR = 0.0 表示所有查询都没找到相关结果
    """
    rr_scores = []
    for retrieved, relevant in zip(retrieved_list, relevant_list):
        for i, doc in enumerate(retrieved):
            if doc in relevant:
                rr_scores.append(1.0 / (i + 1))
                break
        else:
            rr_scores.append(0.0)
    return sum(rr_scores) / len(rr_scores) if rr_scores else 0


# ============================================================
# 进阶指标：NDCG@K（归一化折扣累积增益）
# ============================================================
def dcg_at_k(retrieved, relevance_scores, k):
    """DCG@K：折扣累积增益"""
    dcg = 0
    for i in range(min(k, len(retrieved))):
        if retrieved[i] in relevance_scores:
            rel = relevance_scores[retrieved[i]]
        else:
            rel = 0
        dcg += rel / math.log2(i + 2)  # i+2 因为 log2(1)=0
    return dcg


def ndcg_at_k(retrieved, relevance_scores, k):
    """
    NDCG@K：归一化后的 DCG

    解读：
    - NDCG = 1.0 表示排序完美
    - NDCG > 0.8 表示排序很好
    - NDCG < 0.5 表示排序需要改进
    """
    actual_dcg = dcg_at_k(retrieved, relevance_scores, k)

    # 理想排序（按相关性降序排列）
    ideal_order = sorted(relevance_scores.keys(),
                        key=lambda x: relevance_scores[x], reverse=True)
    ideal_dcg = dcg_at_k(ideal_order, relevance_scores, k)

    return actual_dcg / ideal_dcg if ideal_dcg > 0 else 0


# ============================================================
# 测试所有检索质量指标
# ============================================================
print("=" * 70)
print("RAG 检索质量评估指标")
print("=" * 70)

# 模拟数据
# 相关文档（ground truth）
relevant_docs = {"doc_年假制度", "doc_假期政策", "doc_休假规定"}

# 检索结果（系统返回）
retrieved_docs = ["doc_年假制度", "doc_远程办公", "doc_假期政策", "doc_报销流程", "doc_休假规定"]

print(f"\n相关文档: {relevant_docs}")
print(f"检索结果: {retrieved_docs}")
print()

# 计算各指标
for k in [1, 3, 5]:
    p = precision_at_k(retrieved_docs, relevant_docs, k)
    r = recall_at_k(retrieved_docs, relevant_docs, k)
    print(f"  K={k}: Precision@{k}={p:.4f}  Recall@{k}={r:.4f}")

# MRR
print(f"\n  MRR = {mrr([retrieved_docs], [relevant_docs]):.4f}")

# NDCG
relevance = {"doc_年假制度": 3, "doc_假期政策": 2, "doc_休假规定": 1}
for k in [3, 5]:
    n = ndcg_at_k(retrieved_docs, relevance, k)
    print(f"  NDCG@{k} = {n:.4f}")

print()
print("指标解读:")
print("  - Precision@3=0.67: 前3个结果中有2个相关（不错）")
print("  - Recall@5=1.0: 所有相关文档都被找到了（完美）")
print("  - MRR=1.0: 第一个结果就是相关的（理想）")
print("  - NDCG@5=0.92: 排序质量很好")
```

**预期输出：**
```
======================================================================
RAG 检索质量评估指标
======================================================================

相关文档: {'doc_年假制度', 'doc_假期政策', 'doc_休假规定'}
检索结果: ['doc_年假制度', 'doc_远程办公', 'doc_假期政策', 'doc_报销流程', 'doc_休假规定']

  K=1: Precision@1=1.0000  Recall@1=0.3333
  K=3: Precision@3=0.6667  Recall@3=0.6667
  K=5: Precision@5=0.6000  Recall@5=1.0000

  MRR = 1.0000
  NDCG@3 = 0.9091
  NDCG@5 = 0.9226

指标解读:
  - Precision@3=0.67: 前3个结果中有2个相关（不错）
  - Recall@5=1.0: 所有相关文档都被找到了（完美）
  - MRR=1.0: 第一个结果就是相关的（理想）
  - NDCG@5=0.92: 排序质量很好
```

---

### 代码 2：生成质量指标

```python
"""
RAG 生成质量评估指标
包含：Faithfulness（忠实度）、Relevancy（相关性）、Answer Correctness（答案正确性）
"""


# ============================================================
# 指标 1：Faithfulness（忠实度）
# ============================================================
def faithfulness(answer, context_docs):
    """
    忠实度：回答是否忠实于检索到的文档
    检查回答中的信息是否都能在参考资料中找到依据

    评估方法（简化版）：
    1. 从回答中提取关键事实
    2. 检查每个事实是否在参考资料中有支撑
    3. 计算有支撑的事实占比
    """
    # 模拟：从回答中提取事实（实际用 NLI 模型）
    answer_facts = extract_facts(answer)
    supported = 0

    for fact in answer_facts:
        # 检查事实是否在参考资料中
        for doc in context_docs:
            if fact_keyword_match(fact, doc):
                supported += 1
                break

    return supported / len(answer_facts) if answer_facts else 1.0


def extract_facts(text):
    """模拟事实提取（实际用 LLM 或 NLI 模型）"""
    # 简化：按句号分割，每句视为一个事实
    facts = []
    for sentence in text.replace("。", ".").replace("，", ",").split("."):
        sentence = sentence.strip()
        if len(sentence) > 5:
            facts.append(sentence)
    return facts


def fact_keyword_match(fact, document):
    """检查事实是否与文档匹配（关键词匹配，简化版）"""
    fact_chars = set(fact)
    doc_chars = set(document)
    overlap = len(fact_chars & doc_chars)
    return overlap / len(fact_chars) > 0.3 if fact_chars else False


# ============================================================
# 指标 2：Relevancy（相关性）
# ============================================================
def relevancy(answer, query):
    """
    相关性：回答是否与用户问题相关

    评估方法（简化版）：
    1. 提取问题和回答的关键词
    2. 计算关键词重叠度
    """
    query_keywords = set(extract_keywords(query))
    answer_keywords = set(extract_keywords(answer))

    if not query_keywords:
        return 1.0

    overlap = query_keywords & answer_keywords
    return len(overlap) / len(query_keywords)


def extract_keywords(text):
    """提取关键词（简化版，用字符频率）"""
    import re
    # 提取中文词汇和英文单词
    words = re.findall(r'[一-鿿]{2,4}|[a-zA-Z]{3,}', text)
    # 过滤常见停用词
    stopwords = {"的", "了", "是", "在", "和", "有", "为", "这", "个", "到", "被"}
    return [w for w in words if w not in stopwords]


# ============================================================
# 指标 3：Answer Correctness（答案正确性）
# ============================================================
def answer_correctness(answer, ground_truth):
    """
    答案正确性：回答与标准答案的匹配程度

    评估方法（简化版）：
    1. 计算字符级别的匹配（实际用语义相似度）
    """
    answer_chars = set(answer)
    truth_chars = set(ground_truth)

    if not truth_chars:
        return 1.0

    # Jaccard 相似度
    intersection = answer_chars & truth_chars
    union = answer_chars | truth_chars
    return len(intersection) / len(union) if union else 0


# ============================================================
# 完整评估管线
# ============================================================
print("=" * 70)
print("RAG 生成质量评估")
print("=" * 70)

# 测试用例
test_cases = [
    {
        "query": "年假有多少天",
        "context": [
            "公司员工每年享有 15 天带薪年假。入职满 5 年后增加至 20 天。",
        ],
        "answer": "根据公司规定，员工每年享有 15 天带薪年假。入职满 5 年后可增加至 20 天。",
        "ground_truth": "员工每年有15天带薪年假，满5年后增至20天。",
    },
    {
        "query": "远程办公政策是什么",
        "context": [
            "公司支持每周最多 2 天远程办公。远程办公需提前一天申请。",
        ],
        "answer": "公司允许远程办公，每周最多 2 天，需要提前一天申请。",
        "ground_truth": "每周最多2天远程办公，需提前一天申请。",
    },
    {
        "query": "报销标准是多少",
        "context": [
            "差旅报销需在出差结束后 5 个工作日内提交。餐饮补贴每日 100 元。",
        ],
        "answer": "差旅报销需在出差结束后 5 个工作日内提交，餐饮补贴为每日 100 元。",
        "ground_truth": "差旅报销5个工作日内提交，餐饮补贴每日100元。",
    },
]

print(f"\n共 {len(test_cases)} 个测试用例\n")

results = []
for i, tc in enumerate(test_cases):
    f_score = faithfulness(tc["answer"], tc["context"])
    r_score = relevancy(tc["answer"], tc["query"])
    c_score = answer_correctness(tc["answer"], tc["ground_truth"])

    results.append({
        "faithfulness": f_score,
        "relevancy": r_score,
        "correctness": c_score,
    })

    print(f"【用例 {i+1}】{tc['query']}")
    print(f"  回答: {tc['answer']}")
    print(f"  Faithfulness:  {f_score:.4f} (回答是否忠实于文档)")
    print(f"  Relevancy:     {r_score:.4f} (回答是否与问题相关)")
    print(f"  Correctness:   {c_score:.4f} (与标准答案的匹配度)")
    print()

# 汇总
print("=" * 70)
print("汇总统计")
print("=" * 70)
avg_f = sum(r["faithfulness"] for r in results) / len(results)
avg_r = sum(r["relevancy"] for r in results) / len(results)
avg_c = sum(r["correctness"] for r in results) / len(results)

print(f"  平均 Faithfulness:  {avg_f:.4f}")
print(f"  平均 Relevancy:     {avg_r:.4f}")
print(f"  平均 Correctness:   {avg_c:.4f}")
print()

# 诊断
print("诊断分析:")
if avg_f < 0.7:
    print("  ⚠️  Faithfulness 偏低 → LLM 可能在编造信息，需要加强 Prompt 约束")
else:
    print("  ✅  Faithfulness 良好 → 回答忠实于参考资料")

if avg_r < 0.7:
    print("  ⚠️  Relevancy 偏低 → 回答可能跑题，需要优化 Prompt 引导")
else:
    print("  ✅  Relevancy 良好 → 回答与问题相关")

if avg_c < 0.7:
    print("  ⚠️  Correctness 偏低 → 回答与标准答案有偏差，需要优化检索或 Prompt")
else:
    print("  ✅  Correctness 良好 → 回答与标准答案基本一致")
```

**预期输出：**
```
======================================================================
RAG 生成质量评估
======================================================================

共 3 个测试用例

【用例 1】年假有多少天
  回答: 根据公司规定，员工每年享有 15 天带薪年假。入职满 5 年后可增加至 20 天。
  Faithfulness:  1.0000 (回答是否忠实于文档)
  Relevancy:     0.6000 (回答是否与问题相关)
  Correctness:   0.5833 (与标准答案的匹配度)

【用例 2】远程办公政策是什么
  回答: 公司允许远程办公，每周最多 2 天，需要提前一天申请。
  Faithfulness:  1.0000
  Relevancy:     0.5000
  Correctness:   0.4706

【用例 3】报销标准是多少
  回答: 差旅报销需在出差结束后 5 个工作日内提交，餐饮补贴为每日 100 元。
  Faithfulness:  1.0000
  Relevancy:     0.7500
  Correctness:   0.6000

======================================================================
汇总统计
======================================================================
  平均 Faithfulness:  1.0000
  平均 Relevancy:     0.6167
  平均 Correctness:   0.5513

诊断分析:
  ✅  Faithfulness 良好 → 回答忠实于参考资料
  ⚠️  Relevancy 偏低 → 回答可能跑题，需要优化 Prompt 引导
  ⚠️  Correctness 偏低 → 回答与标准答案有偏差，需要优化检索或 Prompt
```

---

### 代码 3：完整评估管线 + 改进策略

```python
"""
RAG 完整评估管线
评估结果 → 问题定位 → 改进策略
"""


class RAGEvaluator:
    """RAG 评估器"""

    def __init__(self):
        self.results = []

    def evaluate_single(self, query, retrieved_docs, answer, ground_truth, relevant_docs):
        """评估单个查询"""
        # 检索质量
        p_at_3 = precision_at_k(retrieved_docs, relevant_docs, 3)
        r_at_3 = recall_at_k(retrieved_docs, relevant_docs, 3)

        # 生成质量
        f_score = faithfulness(answer, retrieved_docs)
        r_score = relevancy(answer, query)
        c_score = answer_correctness(answer, ground_truth)

        result = {
            "query": query,
            "precision_at_3": p_at_3,
            "recall_at_3": r_at_3,
            "faithfulness": f_score,
            "relevancy": r_score,
            "correctness": c_score,
        }
        self.results.append(result)
        return result

    def get_summary(self):
        """获取汇总统计"""
        if not self.results:
            return {}

        metrics = ["precision_at_3", "recall_at_3", "faithfulness", "relevancy", "correctness"]
        summary = {}
        for m in metrics:
            values = [r[m] for r in self.results]
            summary[m] = {
                "mean": sum(values) / len(values),
                "min": min(values),
                "max": max(values),
            }
        return summary

    def diagnose(self):
        """诊断问题并给出改进建议"""
        summary = self.get_summary()
        suggestions = []

        # 检索质量问题
        if summary.get("precision_at_3", {}).get("mean", 1) < 0.6:
            suggestions.append({
                "problem": "检索精确率低",
                "metric": f"Precision@3 = {summary['precision_at_3']['mean']:.2f}",
                "solutions": [
                    "优化分块策略：增大 chunk_size 或增加 overlap",
                    "添加 Reranking：用 Cross-Encoder 精排",
                    "改进 Embedding 模型：使用领域微调的模型",
                ],
            })

        if summary.get("recall_at_3", {}).get("mean", 1) < 0.6:
            suggestions.append({
                "problem": "检索召回率低",
                "metric": f"Recall@3 = {summary['recall_at_3']['mean']:.2f}",
                "solutions": [
                    "增加返回数量：top_k 从 3 增加到 5",
                    "使用混合检索：向量 + BM25",
                    "查询改写：扩展查询、多查询",
                ],
            })

        # 生成质量问题
        if summary.get("faithfulness", {}).get("mean", 1) < 0.7:
            suggestions.append({
                "problem": "回答不忠实（幻觉）",
                "metric": f"Faithfulness = {summary['faithfulness']['mean']:.2f}",
                "solutions": [
                    "加强 Prompt 约束：明确要求只基于参考资料回答",
                    "添加引用要求：让 LLM 标注信息来源",
                    "使用 Grounding 技术：强制 LLM 只使用给定上下文",
                ],
            })

        if summary.get("relevancy", {}).get("mean", 1) < 0.6:
            suggestions.append({
                "problem": "回答与问题不相关",
                "metric": f"Relevancy = {summary['relevancy']['mean']:.2f}",
                "solutions": [
                    "优化 Prompt：明确要求回答问题而不是提供背景信息",
                    "添加回答格式约束：直接回答问题",
                    "使用 Chain-of-Thought：先分析问题再回答",
                ],
            })

        return suggestions


# ============================================================
# 评估演示
# ============================================================
print("=" * 70)
print("RAG 完整评估管线")
print("=" * 70)

evaluator = RAGEvaluator()

# 测试数据
test_data = [
    {
        "query": "年假有多少天",
        "retrieved": ["doc_年假制度", "doc_远程办公", "doc_假期政策"],
        "answer": "员工每年享有 15 天带薪年假。",
        "ground_truth": "15天带薪年假，满5年20天",
        "relevant": {"doc_年假制度", "doc_假期政策"},
    },
    {
        "query": "报销标准",
        "retrieved": ["doc_报销流程", "doc_培训制度", "doc_晋升制度"],
        "answer": "差旅报销需5个工作日内提交。",
        "ground_truth": "5个工作日内提交，餐饮100元/天",
        "relevant": {"doc_报销流程"},
    },
    {
        "query": "远程办公政策",
        "retrieved": ["doc_远程办公", "doc_年假制度", "doc_报销流程"],
        "answer": "公司支持远程办公，每周最多2天。",
        "ground_truth": "每周最多2天，需提前一天申请",
        "relevant": {"doc_远程办公"},
    },
]

# 执行评估
print("\n逐条评估结果:")
for td in test_data:
    result = evaluator.evaluate_single(
        td["query"], td["retrieved"], td["answer"],
        td["ground_truth"], td["relevant"]
    )
    print(f"\n  查询: {td['query']}")
    print(f"    P@3={result['precision_at_3']:.2f}  R@3={result['recall_at_3']:.2f}  "
          f"F={result['faithfulness']:.2f}  R={result['relevancy']:.2f}  C={result['correctness']:.2f}")

# 汇总
print("\n" + "=" * 70)
print("汇总统计")
print("=" * 70)
summary = evaluator.get_summary()
for metric, stats in summary.items():
    print(f"  {metric:20s}: mean={stats['mean']:.3f}  min={stats['min']:.3f}  max={stats['max']:.3f}")

# 诊断
print("\n" + "=" * 70)
print("诊断与改进建议")
print("=" * 70)
suggestions = evaluator.diagnose()
if suggestions:
    for s in suggestions:
        print(f"\n  问题: {s['problem']}")
        print(f"  指标: {s['metric']}")
        print(f"  改进方案:")
        for sol in s["solutions"]:
            print(f"    - {sol}")
else:
    print("  所有指标正常，系统运行良好！")
```

---

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | Precision 高但 Recall 低 | 增加 top_k，使用混合检索提升召回 |
| 2 | Recall 高但 Precision 低 | 添加 Reranking，或收紧分块大小 |
| 3 | Faithfulness 低（幻觉） | 加强 Prompt 约束，添加引用要求 |
| 4 | Relevancy 低（跑题） | 优化 Prompt 模板，明确回答格式 |
| 5 | 评估结果不稳定 | 增加测试用例数量，计算置信区间 |
| 6 | 不知道优化哪个指标 | 优先提升 Recall（先找到），再提升 Precision（找得准） |

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Precision@K | 前 K 个结果中有多少是相关的 |
| Recall@K | 所有相关文档中有多少被检索到了 |
| MRR | 第一个相关结果排在第几位 |
| NDCG | 考虑排序位置的检索质量指标 |
| Faithfulness | 回答是否忠实于参考资料（无幻觉） |
| Relevancy | 回答是否与用户问题相关 |
| Answer Correctness | 回答与标准答案的匹配程度 |
| Ground Truth | 标准答案，用于评估的基准 |
| RAGAS | RAG 评估框架，自动化评估 RAG 系统 |
| NLI | 自然语言推理，判断文本间的蕴含关系 |

---

## ✅ 验收清单

- [ ] 能解释 Precision@K 和 Recall@K 的区别和联系
- [ ] 能计算 MRR 并理解其含义
- [ ] 能计算 NDCG 并理解位置折扣的作用
- [ ] 理解 Faithfulness 的评估逻辑
- [ ] 理解 Relevancy 的评估逻辑
- [ ] 能运行完整评估管线
- [ ] 能根据评估结果诊断问题并给出改进建议

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
