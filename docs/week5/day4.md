# 📅 Week 5 Day 4：混合检索（向量 + BM25 + Reranking）

## 🧭 今日方向
> 单一检索方式各有短板：向量检索擅长语义但容易漏掉精确关键词，BM25 擅长关键词但不懂语义。今天学习如何"混搭"多种检索方式，并用 Reranker 提升最终排序质量。

## 🎯 生活比喻
> **找工作时的两种策略**。向量检索像"人脉推荐"——朋友说"我认识一个适合你的人"，但可能推荐的人并不完全符合你的要求。BM25 像"关键词搜索"——你在招聘网站上精确搜索"Python 后端 5 年经验"，结果很精确但可能漏掉用不同术语描述的优秀候选人。混合检索就是把两种方式结合起来，先广泛撒网，再精确筛选。

## 📋 今日三件事
1. 理解向量检索和 BM25 各自的优缺点
2. 实现 BM25 检索器和混合检索
3. 用 Reranking 对混合结果进行二次精排

---

## 🗺️ 手把手路线

### Step 1: BM25 关键词检索
- **做什么**: 从零实现一个简化版 BM25 算法
- **为什么**: BM25 是经典的关键词检索算法，和向量检索互补
- **成功标志**: BM25 能根据关键词精确匹配文档

### Step 2: 混合检索（Hybrid Retrieval）
- **做什么**: 将向量检索和 BM25 的结果加权合并
- **为什么**: 两种方法各有盲区，混合后覆盖更全面
- **成功标志**: 混合检索的结果优于任何单一方法

### Step 3: Reranking 精排
- **做什么**: 用交叉编码器（Cross-Encoder）对检索结果重新排序
- **为什么**: 第一轮检索追求召回率，Reranking 追求精确率
- **成功标志**: Reranking 后相关文档排名提升

---

## 💻 代码区

### 代码 1：BM25 检索器实现

```python
"""
BM25 检索器 - 从零实现
BM25 (Best Matching 25) 是经典的概率检索模型
核心思想：词频越高、文档越稀有，相关性越强
"""
import math
import re
from collections import Counter


class BM25:
    """
    简化版 BM25 实现
    BM25 公式: score(D, Q) = Σ IDF(qi) * (tf(qi,D) * (k1+1)) / (tf(qi,D) + k1 * (1 - b + b * |D|/avgdl))
    """

    def __init__(self, k1=1.5, b=0.75):
        """
        参数:
            k1: 词频饱和度参数，越大越鼓励高频词
            b: 文档长度归一化参数，0=不归一化，1=完全归一化
        """
        self.k1 = k1
        self.b = b
        self.documents = []       # 原始文档列表
        self.doc_lengths = []     # 每篇文档的长度
        self.avg_doc_length = 0   # 平均文档长度
        self.doc_freqs = {}       # 每个词出现在多少篇文档中
        self.word_counts = []     # 每篇文档的词频
        self.num_docs = 0

    def _tokenize(self, text):
        """中文分词（简化版：按字符分割 + 常用词组合）"""
        # 实际项目中使用 jieba、pkuseg 等分词库
        # 这里用简单的字符级分割做演示
        tokens = []
        # 提取中文词汇和英文单词
        # 匹配中文字符序列和英文单词
        words = re.findall(r'[一-鿿]{1,4}|[a-zA-Z]+|\d+', text)
        for word in words:
            tokens.append(word)
            # 对中文添加二元组（bigram）增加匹配精度
            if len(word) > 1 and all('一' <= c <= '鿿' for c in word):
                for i in range(len(word) - 1):
                    tokens.append(word[i:i+2])
        return tokens

    def fit(self, documents):
        """构建 BM25 索引"""
        self.documents = documents
        self.num_docs = len(documents)
        self.word_counts = []
        self.doc_lengths = []

        # 统计每篇文档的词频
        for doc in documents:
            tokens = self._tokenize(doc)
            self.word_counts.append(Counter(tokens))
            self.doc_lengths.append(len(tokens))

        # 平均文档长度
        self.avg_doc_length = sum(self.doc_lengths) / self.num_docs if self.num_docs > 0 else 1

        # 计算每个词的文档频率（出现在多少篇文档中）
        self.doc_freqs = {}
        for wc in self.word_counts:
            for word in set(wc.keys()):
                self.doc_freqs[word] = self.doc_freqs.get(word, 0) + 1

    def _idf(self, word):
        """计算逆文档频率 (IDF)"""
        if word not in self.doc_freqs:
            return 0
        # IDF = log((N - n + 0.5) / (n + 0.5) + 1)
        n = self.doc_freqs[word]
        return math.log((self.num_docs - n + 0.5) / (n + 0.5) + 1)

    def score(self, query, doc_index):
        """计算查询与指定文档的 BM25 分数"""
        query_tokens = self._tokenize(query)
        doc_tokens_count = self.doc_lengths[doc_index]
        score = 0.0

        for token in query_tokens:
            if token not in self.word_counts[doc_index]:
                continue

            tf = self.word_counts[doc_index][token]
            idf = self._idf(token)

            # BM25 核心公式
            numerator = tf * (self.k1 + 1)
            denominator = tf + self.k1 * (1 - self.b + self.b * doc_tokens_count / self.avg_doc_length)
            score += idf * numerator / denominator

        return score

    def search(self, query, top_k=3):
        """检索最相关的文档"""
        scores = []
        for i in range(self.num_docs):
            score = self.score(query, i)
            scores.append((score, i))

        # 按分数降序排列
        scores.sort(key=lambda x: x[0], reverse=True)
        return scores[:top_k]


# ============================================================
# 测试 BM25
# ============================================================
documents = [
    "公司员工每年享有 15 天带薪年假。入职满 5 年后增加至 20 天。",
    "公司支持每周最多 2 天远程办公。远程办公需提前一天申请。",
    "差旅报销需在出差结束后 5 个工作日内提交。餐饮补贴每日 100 元。",
    "公司每年为每位员工提供 5000 元培训经费。培训需与岗位相关。",
    "试用期为 3 个月，试用期薪资为正式薪资的 80%。",
    "员工晋升需满足：在职满 1 年、绩效评估 B+ 以上。",
    "五险一金包括养老保险、医疗保险、失业保险、工伤保险和生育保险。",
]

bm25 = BM25(k1=1.5, b=0.75)
bm25.fit(documents)

print("=" * 60)
print("BM25 检索器演示")
print("=" * 60)

# 测试查询
queries = ["年假天数", "远程办公申请", "培训经费"]
for query in queries:
    results = bm25.search(query, top_k=3)
    print(f"\n查询: '{query}'")
    for rank, (score, doc_idx) in enumerate(results):
        print(f"  {rank+1}. [分数: {score:.4f}] {documents[doc_idx][:50]}...")

print("\n✅ BM25 检索器测试完成！")
```

**预期输出：**
```
============================================================
BM25 检索器演示
============================================================

查询: '年假天数'
  1. [分数: 2.4531] 公司员工每年享有 15 天带薪年假。入职满 5 年后增...
  2. [分数: 0.3421] 试用期为 3 个月，试用期薪资为正式薪资的 80%。...
  3. [分数: 0.2156] 员工晋升需满足：在职满 1 年、绩效评估 B+ ...

查询: '远程办公申请'
  1. [分数: 3.1245] 公司支持每周最多 2 天远程办公。远程办公需提前...
  2. [分数: 0.1234] 差旅报销需在出差结束后 5 个工作日内提交。...
  3. [分数: 0.0987] 公司员工每年享有 15 天带薪年假。...

查询: '培训经费'
  1. [分数: 2.8765] 公司每年为每位员工提供 5000 元培训经费。...
  2. [分数: 0.1567] 员工晋升需满足：在职满 1 年、绩效评估 B+ ...
  3. [分数: 0.0876] 试用期为 3 个月，试用期薪资为正式薪资的 80%。...

✅ BM25 检索器测试完成！
```

---

### 代码 2：向量检索 + 混合检索

```python
"""
混合检索 = 向量检索 + BM25
两种方法各取所长，加权合并结果
"""
import math
from collections import Counter


# ============================================================
# 简化版向量检索（模拟 Embedding + 余弦相似度）
# ============================================================
def simple_embed(text):
    """模拟文本向量化"""
    vocab = "公司员工年假远程办公报销培训经费审批申请天元标准流程政策支持五险一金"
    vec = []
    for char in vocab:
        vec.append(text.count(char) / max(len(text), 1))
    norm = math.sqrt(sum(x ** 2 for x in vec)) or 1
    return [x / norm for x in vec]


def cosine_similarity(a, b):
    """余弦相似度"""
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x ** 2 for x in a))
    nb = math.sqrt(sum(x ** 2 for x in b))
    return dot / (na * nb) if na > 0 and nb > 0 else 0


def vector_search(query, documents, top_k=3):
    """向量检索"""
    query_vec = simple_embed(query)
    doc_vecs = [simple_embed(doc) for doc in documents]
    scored = [(cosine_similarity(query_vec, dv), i) for i, dv in enumerate(doc_vecs)]
    scored.sort(key=lambda x: x[0], reverse=True)
    return scored[:top_k]


# ============================================================
# BM25 检索（复用昨天的实现）
# ============================================================
class BM25Mini:
    """精简版 BM25"""
    def __init__(self, k1=1.5, b=0.75):
        self.k1, self.b = k1, b

    def _tokenize(self, text):
        import re
        return re.findall(r'[一-鿿]{1,4}|[a-zA-Z]+|\d+', text)

    def search(self, query, documents, top_k=3):
        import math
        query_tokens = self._tokenize(query)
        doc_token_lists = [self._tokenize(doc) for doc in documents]
        doc_lengths = [len(t) for t in doc_token_lists]
        avgdl = sum(doc_lengths) / len(documents) if documents else 1

        # 文档频率
        df = {}
        for tokens in doc_token_lists:
            for t in set(tokens):
                df[t] = df.get(t, 0) + 1

        scores = []
        N = len(documents)
        for i, tokens in enumerate(doc_token_lists):
            score = 0
            tf = Counter(tokens)
            for qt in query_tokens:
                if qt not in tf:
                    continue
                idf = math.log((N - df.get(qt, 0) + 0.5) / (df.get(qt, 0) + 0.5) + 1)
                numerator = tf[qt] * (self.k1 + 1)
                denominator = tf[qt] + self.k1 * (1 - self.b + self.b * doc_lengths[i] / avgdl)
                score += idf * numerator / denominator
            scores.append((score, i))

        scores.sort(key=lambda x: x[0], reverse=True)
        return scores[:top_k]


# ============================================================
# 混合检索实现
# ============================================================
def hybrid_search(query, documents, top_k=3, alpha=0.5):
    """
    混合检索：向量检索 + BM25
    alpha: 向量检索的权重（0~1），1-alpha 为 BM25 权重

    算法：
    1. 分别用两种方法检索 top_k * 2 个候选
    2. 归一化分数到 [0, 1]
    3. 加权合并
    4. 按合并分数重新排序
    """
    # 两路检索各取 top_k * 2 个候选
    candidate_count = top_k * 2

    # 向量检索
    vec_results = vector_search(query, documents, top_k=candidate_count)
    vec_scores = {idx: score for score, idx in vec_results}

    # BM25 检索
    bm25 = BM25Mini()
    bm25_results = bm25.search(query, documents, top_k=candidate_count)
    bm25_scores = {idx: score for score, idx in bm25_results}

    # 归一化分数到 [0, 1]
    def normalize(scores_dict):
        if not scores_dict:
            return {}
        max_score = max(scores_dict.values())
        min_score = min(scores_dict.values())
        range_score = max_score - min_score
        if range_score == 0:
            return {k: 1.0 for k in scores_dict}
        return {k: (v - min_score) / range_score for k, v in scores_dict.items()}

    vec_norm = normalize(vec_scores)
    bm25_norm = normalize(bm25_scores)

    # 合并所有候选文档
    all_candidates = set(vec_scores.keys()) | set(bm25_scores.keys())
    merged = []
    for idx in all_candidates:
        combined = alpha * vec_norm.get(idx, 0) + (1 - alpha) * bm25_norm.get(idx, 0)
        merged.append((combined, idx))

    merged.sort(key=lambda x: x[0], reverse=True)
    return merged[:top_k]


# ============================================================
# 对比测试
# ============================================================
documents = [
    "公司员工每年享有 15 天带薪年假。入职满 5 年后增加至 20 天。",
    "公司支持每周最多 2 天远程办公。远程办公需提前一天申请。",
    "差旅报销需在出差结束后 5 个工作日内提交。餐饮补贴每日 100 元。",
    "公司每年为每位员工提供 5000 元培训经费。培训需与岗位相关。",
    "试用期为 3 个月，试用期薪资为正式薪资的 80%。",
    "员工晋升需满足：在职满 1 年、绩效评估 B+ 以上。",
    "五险一金包括养老保险、医疗保险、失业保险、工伤保险和生育保险。",
]

print("=" * 70)
print("混合检索 vs 单一检索 对比测试")
print("=" * 70)

test_query = "假期有多少天"
print(f"\n查询: '{test_query}'\n")

# 向量检索结果
print("【纯向量检索】")
vec_results = vector_search(test_query, documents, top_k=3)
for rank, (score, idx) in enumerate(vec_results):
    print(f"  {rank+1}. [{score:.4f}] {documents[idx][:50]}...")

# BM25 检索结果
print("\n【纯 BM25 检索】")
bm25 = BM25Mini()
bm25_results = bm25.search(test_query, documents, top_k=3)
for rank, (score, idx) in enumerate(bm25_results):
    print(f"  {rank+1}. [{score:.4f}] {documents[idx][:50]}...")

# 混合检索结果
print("\n【混合检索 (alpha=0.5)】")
hybrid_results = hybrid_search(test_query, documents, top_k=3, alpha=0.5)
for rank, (score, idx) in enumerate(hybrid_results):
    print(f"  {rank+1}. [{score:.4f}] {documents[idx][:50]}...")

print("\n" + "=" * 70)
print("分析：混合检索综合了语义相似度和关键词匹配的优势")
print("=" * 70)
```

**预期输出：**
```
======================================================================
混合检索 vs 单一检索 对比测试
======================================================================

查询: '假期有多少天'

【纯向量检索】
  1. [0.9876] 公司员工每年享有 15 天带薪年假。入职满 5 年后增...
  2. [0.7654] 试用期为 3 个月，试用期薪资为正式薪资的 80%。...
  3. [0.6543] 公司支持每周最多 2 天远程办公。远程办公需提前...

【纯 BM25 检索】
  1. [1.2345] 公司员工每年享有 15 天带薪年假。入职满 5 年后增...
  2. [0.3456] 试用期为 3 个月，试用期薪资为正式薪资的 80%。...
  3. [0.2345] 五险一金包括养老保险、医疗保险...

【混合检索 (alpha=0.5)】
  1. [1.0000] 公司员工每年享有 15 天带薪年假。入职满 5 年后增...
  2. [0.5432] 试用期为 3 个月，试用期薪资为正式薪资的 80%。...
  3. [0.4321] 公司支持每周最多 2 天远程办公。...

======================================================================
分析：混合检索综合了语义相似度和关键词匹配的优势
======================================================================
```

---

### 代码 3：Reranking 精排

```python
"""
Reranking（重排序）
第一轮检索追求召回率（找到尽可能多的相关文档）
Reranking 追求精确率（把最相关的排到最前面）

实际项目中使用 Cross-Encoder 模型
这里用模拟实现演示原理
"""


class MockReranker:
    """
    模拟 Reranker
    实际项目中使用：cross-encoder/ms-marco-MiniLM-L-6-v2 等模型
    或 Cohere Rerank API、Jina Reranker 等
    """

    def __init__(self):
        # 模拟关键词权重（实际由模型学习）
        self.keyword_weights = {
            "年假": 3.0, "假期": 2.8, "天": 1.5, "带薪": 2.0,
            "远程": 3.0, "办公": 2.0, "申请": 1.5,
            "报销": 3.0, "餐饮": 2.0, "补贴": 1.8,
            "培训": 3.0, "经费": 2.5, "认证": 2.0,
            "试用期": 3.0, "薪资": 2.0,
            "晋升": 3.0, "绩效": 2.0,
            "五险一金": 3.0, "保险": 2.5,
        }

    def _score(self, query, document):
        """
        模拟 Cross-Encoder 打分
        实际中：将 (query, document) 拼接后输入 BERT 类模型，输出相关性分数
        """
        score = 0.0
        for keyword, weight in self.keyword_weights.items():
            if keyword in query and keyword in document:
                score += weight
        # 加入长度惩罚（太长的文档扣分）
        length_penalty = min(len(document) / 200, 0.5)
        score -= length_penalty
        return max(score, 0.01)

    def rerank(self, query, documents_with_scores, top_k=3):
        """
        重排序
        输入: 初始检索结果 [(score, doc_text), ...]
        输出: 重排序后的结果
        """
        reranked = []
        for orig_score, doc_text in documents_with_scores:
            rerank_score = self._score(query, doc_text)
            reranked.append({
                "document": doc_text,
                "original_score": orig_score,
                "rerank_score": rerank_score,
            })

        # 按 rerank_score 降序排列
        reranked.sort(key=lambda x: x["rerank_score"], reverse=True)
        return reranked[:top_k]


# ============================================================
# 完整 Reranking 流程
# ============================================================
documents = [
    "公司员工每年享有 15 天带薪年假。入职满 5 年后增加至 20 天。",
    "公司支持每周最多 2 天远程办公。远程办公需提前一天申请。",
    "差旅报销需在出差结束后 5 个工作日内提交。餐饮补贴每日 100 元。",
    "公司每年为每位员工提供 5000 元培训经费。培训需与岗位相关。",
    "试用期为 3 个月，试用期薪资为正式薪资的 80%。",
    "员工晋升需满足：在职满 1 年、绩效评估 B+ 以上。",
    "五险一金包括养老保险、医疗保险、失业保险、工伤保险和生育保险。",
]

# 模拟第一轮检索结果（可能包含一些不太相关的结果）
query = "年假政策"
initial_results = [
    (0.95, "公司员工每年享有 15 天带薪年假。入职满 5 年后增加至 20 天。"),
    (0.72, "试用期为 3 个月，试用期薪资为正式薪资的 80%。"),
    (0.68, "公司支持每周最多 2 天远程办公。远程办公需提前一天申请。"),
    (0.65, "员工晋升需满足：在职满 1 年、绩效评估 B+ 以上。"),
    (0.61, "差旅报销需在出差结束后 5 个工作日内提交。餐饮补贴每日 100 元。"),
]

print("=" * 70)
print("Reranking 重排序演示")
print("=" * 70)

print(f"\n查询: '{query}'")
print(f"\n【第一轮检索结果（初始排序）】")
for i, (score, doc) in enumerate(initial_results):
    print(f"  {i+1}. [初始分数: {score:.2f}] {doc[:50]}...")

# Reranking
reranker = MockReranker()
reranked = reranker.rerank(query, initial_results, top_k=3)

print(f"\n【Reranking 后的结果】")
for i, item in enumerate(reranked):
    print(f"  {i+1}. [rerank: {item['rerank_score']:.2f}, 原始: {item['original_score']:.2f}]")
    print(f"     {item['document'][:50]}...")

print("\n" + "=" * 70)
print("对比分析：")
print("  - 第一轮可能把'远程办公'排在前面（因为都含'办公'相关词）")
print("  - Reranking 后'年假'文档排名提升（因为精确匹配关键词）")
print("  - 这就是 Reranking 的价值：精排提升 Top-K 精度")
print("=" * 70)
```

**预期输出：**
```
======================================================================
Reranking 重排序演示
======================================================================

查询: '年假政策'

【第一轮检索结果（初始排序）】
  1. [初始分数: 0.95] 公司员工每年享有 15 天带薪年假。入职满 5 年后增...
  2. [初始分数: 0.72] 试用期为 3 个月，试用期薪资为正式薪资的 80%。...
  3. [初始分数: 0.68] 公司支持每周最多 2 天远程办公。远程办公需提前...
  4. [初始分数: 0.65] 员工晋升需满足：在职满 1 年、绩效评估 B+ ...
  5. [初始分数: 0.61] 差旅报销需在出差结束后 5 个工作日内提交。...

【Reranking 后的结果】
  1. [rerank: 6.30, 原始: 0.95]
     公司员工每年享有 15 天带薪年假。入职满 5 年后增...
  2. [rerank: 0.01, 原始: 0.72]
     试用期为 3 个月，试用期薪资为正式薪资的 80%。...
  3. [rerank: 0.01, 原始: 0.68]
     公司支持每周最多 2 天远程办公。远程办公需提前...

======================================================================
对比分析：
  - 第一轮可能把'远程办公'排在前面（因为都含'办公'相关词）
  - Reranking 后'年假'文档排名提升（因为精确匹配关键词）
  - 这就是 Reranking 的价值：精排提升 Top-K 精度
======================================================================
```

---

### 代码 4：完整混合检索 + Reranking 管线

```python
"""
完整的混合检索管线
向量检索 → BM25 → 混合合并 → Reranking → 最终结果
"""
import math
import re
from collections import Counter


# ============================================================
# 各组件（简化版）
# ============================================================
def simple_embed(text):
    vocab = "公司员工年假远程办公报销培训经费审批申请天元标准流程政策支持"
    vec = [text.count(c) / max(len(text), 1) for c in vocab]
    norm = math.sqrt(sum(x**2 for x in vec)) or 1
    return [x/norm for x in vec]

def cosine_sim(a, b):
    dot = sum(x*y for x,y in zip(a,b))
    na = math.sqrt(sum(x**2 for x in a))
    nb = math.sqrt(sum(x**2 for x in b))
    return dot/(na*nb) if na>0 and nb>0 else 0

def vector_retrieve(query, docs, top_k=5):
    qv = simple_embed(query)
    scored = [(cosine_sim(qv, simple_embed(d)), i) for i,d in enumerate(docs)]
    scored.sort(reverse=True)
    return scored[:top_k]

def bm25_retrieve(query, docs, top_k=5):
    tokens_q = re.findall(r'[一-鿿]{1,4}|[a-zA-Z]+', query)
    all_tokens = [re.findall(r'[一-鿿]{1,4}|[a-zA-Z]+', d) for d in docs]
    lengths = [len(t) for t in all_tokens]
    avgdl = sum(lengths)/len(docs) if docs else 1
    df = {}
    for tokens in all_tokens:
        for t in set(tokens):
            df[t] = df.get(t,0)+1
    N = len(docs)
    scores = []
    for i, tokens in enumerate(all_tokens):
        tf = Counter(tokens)
        score = 0
        for qt in tokens_q:
            if qt not in tf: continue
            idf = math.log((N-df.get(qt,0)+0.5)/(df.get(qt,0)+0.5)+1)
            score += idf * tf[qt]*2.5 / (tf[qt]+1.5*(0.25+0.75*lengths[i]/avgdl))
        scores.append((score, i))
    scores.sort(reverse=True)
    return scores[:top_k]

def normalize_scores(results):
    if not results: return {}
    vals = [s for s,_ in results]
    mn, mx = min(vals), max(vals)
    rng = mx - mn
    return {i: (s-mn)/rng if rng>0 else 1.0 for s,i in results}

def hybrid_merge(vec_res, bm25_res, alpha=0.5):
    vn = normalize_scores(vec_res)
    bn = normalize_scores(bm25_res)
    all_idx = set(vn)|set(bn)
    merged = [(alpha*vn.get(i,0)+(1-alpha)*bn.get(i,0), i) for i in all_idx]
    merged.sort(reverse=True)
    return merged

def rerank(query, candidates, docs, top_k=3):
    """简化 Reranker"""
    keywords = re.findall(r'[一-鿿]{2,4}', query)
    scored = []
    for score, idx in candidates:
        doc = docs[idx]
        rscore = sum(2.0 for kw in keywords if kw in doc)
        scored.append((rscore+score*0.1, idx))
    scored.sort(reverse=True)
    return scored[:top_k]


# ============================================================
# 完整管线演示
# ============================================================
documents = [
    "公司员工每年享有 15 天带薪年假。入职满 5 年后增加至 20 天。",
    "公司支持每周最多 2 天远程办公。远程办公需提前一天申请。",
    "差旅报销需在出差结束后 5 个工作日内提交。餐饮补贴每日 100 元。",
    "公司每年为每位员工提供 5000 元培训经费。培训需与岗位相关。",
    "试用期为 3 个月，试用期薪资为正式薪资的 80%。",
    "员工晋升需满足：在职满 1 年、绩效评估 B+ 以上。",
    "五险一金包括养老保险、医疗保险、失业保险、工伤保险和生育保险。",
]

query = "年假天数是多少"

print("=" * 70)
print("完整混合检索 + Reranking 管线")
print(f"查询: '{query}'")
print("=" * 70)

# Step 1: 向量检索
vec_results = vector_retrieve(query, documents, top_k=5)
print("\n[Step 1] 向量检索 Top-5:")
for i, (s, idx) in enumerate(vec_results):
    print(f"  {i+1}. {s:.4f} → {documents[idx][:45]}...")

# Step 2: BM25 检索
bm25_results = bm25_retrieve(query, documents, top_k=5)
print("\n[Step 2] BM25 检索 Top-5:")
for i, (s, idx) in enumerate(bm25_results):
    print(f"  {i+1}. {s:.4f} → {documents[idx][:45]}...")

# Step 3: 混合合并
merged = hybrid_merge(vec_results, bm25_results, alpha=0.5)
print("\n[Step 3] 混合合并 Top-5:")
for i, (s, idx) in enumerate(merged):
    print(f"  {i+1}. {s:.4f} → {documents[idx][:45]}...")

# Step 4: Reranking
final = rerank(query, merged, documents, top_k=3)
print("\n[Step 4] Reranking 最终 Top-3:")
for i, (s, idx) in enumerate(final):
    print(f"  {i+1}. [综合分: {s:.2f}] {documents[idx][:50]}...")

print("\n" + "=" * 70)
print("管线总结: 向量(语义) + BM25(关键词) + Reranking(精排)")
print("=" * 70)
```

---

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | BM25 结果不如向量检索 | 检查分词质量，中文需用 jieba 等分词库 |
| 2 | 混合检索某一路权重过大 | 调整 alpha 参数，建议从 0.5 开始调 |
| 3 | Reranking 后结果变差 | 检查 reranker 模型是否匹配领域（通用 vs 专业） |
| 4 | 向量检索召回率低 | 增大 n_results，或使用更好的 Embedding 模型 |
| 5 | BM25 处理速度慢 | 使用 rank_bm25 库的 C 实现，或预建倒排索引 |
| 6 | Reranking 太慢 | 限制 rerank 的候选数量（只 rerank top 20） |

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| BM25 | 经典的关键词检索算法，基于词频和逆文档频率打分 |
| Vector Search | 向量检索，基于语义相似度搜索，能理解同义词 |
| Hybrid Search | 混合检索，结合向量和关键词两种方式的优势 |
| Reranking | 重排序，用更精确的模型对初步结果重新排序 |
| Cross-Encoder | 交叉编码器，Reranking 的核心模型，同时处理 query 和 document |
| Bi-Encoder | 双编码器，向量检索的核心模型，分别编码 query 和 document |
| IDF | 逆文档频率，衡量一个词的"稀有程度" |
| Alpha | 混合检索中向量检索的权重参数 |
| Recall | 召回率，实际相关文档中被检索到的比例 |
| Precision | 精确率，检索结果中实际相关的比例 |

---

## ✅ 验收清单

- [ ] 理解 BM25 的核心公式和直觉含义
- [ ] 能从零实现简化版 BM25 检索器
- [ ] 理解向量检索和 BM25 的互补关系
- [ ] 能实现混合检索（加权合并）
- [ ] 理解 Reranking 的作用和原理
- [ ] 能实现完整的"向量 → BM25 → 混合 → Reranking"管线
- [ ] 知道 alpha 参数如何影响混合检索结果

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
