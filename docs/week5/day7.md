# 📅 Week 5 Day 7：Agentic RAG — Agent + RAG 融合

## 🧭 今日方向
> 传统 RAG 是"一问一答"的被动模式。Agentic RAG 让 Agent 主动决定：要不要检索、检索什么、检索结果够不够、要不要再查一次。这是 RAG 的进阶形态，也是构建生产级 AI 应用的关键。

## 🎯 生活比喻
> **被动回答 vs 主动研究员**。传统 RAG 像一个只会翻书的学生——老师问什么就翻什么书，翻到就答，翻不到就说不知道。Agentic RAG 像一个主动的研究员——接到问题后会先分析"我需要查什么"，然后去多个数据库搜索，评估结果够不够，不够就换关键词再搜，搜到的信息还会交叉验证，最后才给出有理有据的回答。

## 📋 今日三件事
1. 理解从静态 RAG 到 Agentic RAG 的演进
2. 掌握 LangGraph 状态机的核心概念
3. 用 LangGraph 构建一个完整的 Agentic RAG 工作流

---

## 🗺️ 手把手路线

### Step 1: 静态 RAG vs Agentic RAG
- **做什么**: 对比两种模式的差异，理解 Agentic RAG 的优势
- **为什么**: 明确为什么需要"Agent 化"
- **成功标志**: 能说出 Agentic RAG 的三个核心优势

### Step 2: LangGraph 基础
- **做什么**: 学习 StateGraph、Node、Edge 的概念
- **为什么**: LangGraph 是构建 Agentic RAG 的核心框架
- **成功标志**: 能画出简单的状态机流程图

### Step 3: 构建 Agentic RAG
- **做什么**: 用 LangGraph 实现完整的 Agentic RAG 工作流
- **为什么**: 这是本周的终极目标
- **成功标志**: 代码能运行，展示 Agent 主动检索和自纠正

---

## 💻 代码区

### 代码 1：静态 RAG vs Agentic RAG 对比

```python
"""
静态 RAG vs Agentic RAG 对比
"""

print("=" * 70)
print("静态 RAG vs Agentic RAG")
print("=" * 70)

# ============================================================
# 静态 RAG：线性流程
# ============================================================
class StaticRAG:
    """
    静态 RAG：固定流程，一问一答
    查询 → 检索 → 生成 → 输出
    """

    def __init__(self, documents):
        self.documents = documents

    def retrieve(self, query, top_k=3):
        """简单关键词匹配检索"""
        scored = []
        for doc in self.documents:
            score = sum(1 for word in query if word in doc)
            scored.append((score, doc))
        scored.sort(reverse=True)
        return [doc for _, doc in scored[:top_k]]

    def generate(self, query, context):
        """生成回答"""
        return f"根据资料：{context[0][:50] if context else '未找到相关信息'}..."

    def run(self, query):
        """固定流程"""
        docs = self.retrieve(query)
        answer = self.generate(query, docs)
        return answer


# ============================================================
# Agentic RAG：智能流程
# ============================================================
class AgenticRAG:
    """
    Agentic RAG：智能决策流程
    分析 → 决定是否检索 → 检索 → 评估 → 决定是否再检索 → 生成
    """

    def __init__(self, documents):
        self.documents = documents
        self.max_retries = 3

    def analyze_query(self, query):
        """Step 1: 分析查询，判断复杂度"""
        analysis = {
            "original_query": query,
            "is_complex": len(query) > 10,
            "needs_decomposition": "?" in query or "还是" in query,
            "sub_queries": [],
        }

        # 如果查询复杂，分解为子查询
        if analysis["needs_decomposition"]:
            analysis["sub_queries"] = self._decompose(query)
        else:
            analysis["sub_queries"] = [query]

        return analysis

    def _decompose(self, query):
        """查询分解"""
        # 简化实现：按标点分割
        import re
        parts = re.split(r'[？?、还是和与]', query)
        return [p.strip() for p in parts if p.strip()]

    def should_retrieve(self, query):
        """Step 2: 决定是否需要检索"""
        # 简单规则：如果查询包含特定关键词则检索
        retrieve_keywords = ["什么", "多少", "怎么", "为什么", "政策", "规定", "制度"]
        return any(kw in query for kw in retrieve_keywords)

    def retrieve_with_retry(self, query, attempt=1):
        """Step 3: 带重试的检索"""
        print(f"    [检索尝试 {attempt}] 查询: '{query}'")

        results = []
        for doc in self.documents:
            # 模拟检索分数
            score = sum(1 for word in query if word in doc)
            if score > 0:
                results.append({"doc": doc, "score": score})

        results.sort(key=lambda x: x["score"], reverse=True)
        return results

    def evaluate_results(self, results, query):
        """Step 4: 评估检索结果质量"""
        if not results:
            return {"quality": "poor", "reason": "没有检索到任何结果"}

        top_score = results[0]["score"]
        if top_score >= 3:
            return {"quality": "good", "reason": "检索结果高度相关"}
        elif top_score >= 1:
            return {"quality": "medium", "reason": "检索结果部分相关"}
        else:
            return {"quality": "poor", "reason": "检索结果不太相关"}

    def self_correct(self, query, results, evaluation):
        """Step 5: 自纠正"""
        if evaluation["quality"] == "poor":
            # 尝试改写查询
            corrected_query = self._rewrite_query(query)
            print(f"    [自纠正] 原查询: '{query}' → 改写: '{corrected_query}'")
            return corrected_query, True
        return query, False

    def _rewrite_query(self, query):
        """查询改写"""
        # 简化：添加同义词
        rewrites = {
            "年假": "年假 带薪假 假期天数",
            "远程": "远程办公 在家办公",
            "报销": "报销 差旅费 报销流程",
        }
        for key, rewrite in rewrites.items():
            if key in query:
                return rewrite
        return query

    def generate_answer(self, query, results):
        """Step 6: 生成最终回答"""
        if not results:
            return "根据现有资料，暂未找到相关信息。建议咨询相关部门。"

        top_doc = results[0]["doc"]
        return f"根据公司政策，{query}的回答是：{top_doc[:80]}..."

    def run(self, query):
        """完整 Agentic RAG 流程"""
        print(f"\n{'='*60}")
        print(f"Agentic RAG 处理查询: '{query}'")
        print(f"{'='*60}")

        # Step 1: 分析查询
        analysis = self.analyze_query(query)
        print(f"\n  [Step 1] 查询分析:")
        print(f"    复杂查询: {analysis['is_complex']}")
        print(f"    子查询数: {len(analysis['sub_queries'])}")

        # Step 2: 决定是否检索
        shouldRetrieve = self.should_retrieve(query)
        print(f"\n  [Step 2] 是否需要检索: {shouldRetrieve}")

        if not shouldRetrieve:
            answer = self.generate_answer(query, [])
            print(f"  [跳过检索] 直接生成回答")
            return answer

        # Step 3-5: 检索 + 评估 + 自纠正
        current_query = query
        for attempt in range(1, self.max_retries + 1):
            results = self.retrieve_with_retry(current_query, attempt)
            evaluation = self.evaluate_results(results, query)
            print(f"    [评估] 质量: {evaluation['quality']} - {evaluation['reason']}")

            if evaluation["quality"] != "poor":
                break

            current_query, corrected = self.self_correct(current_query, results, evaluation)
            if not corrected:
                break

        # Step 6: 生成回答
        answer = self.generate_answer(query, results)
        print(f"\n  [Step 6] 最终回答: {answer[:100]}...")
        return answer


# ============================================================
# 对比测试
# ============================================================
documents = [
    "公司员工每年享有 15 天带薪年假。入职满 5 年后增加至 20 天。",
    "公司支持每周最多 2 天远程办公。远程办公需提前一天申请。",
    "差旅报销需在出差结束后 5 个工作日内提交。餐饮补贴每日 100 元。",
]

print("\n" + "=" * 70)
print("【静态 RAG】")
print("=" * 70)
static = StaticRAG(documents)
answer_static = static.run("年假")
print(f"  结果: {answer_static}")

print("\n" + "=" * 70)
print("【Agentic RAG】")
print("=" * 70)
agentic = AgenticRAG(documents)
answer_agentic = agentic.run("年假有多少天")

print("\n" + "=" * 70)
print("对比总结:")
print("  静态 RAG: 直接检索 → 直接回答（不判断质量）")
print("  Agentic RAG: 分析 → 检索 → 评估 → 自纠正 → 回答（智能决策）")
print("=" * 70)
```

**预期输出：**
```
======================================================================
静态 RAG vs Agentic RAG
======================================================================

======================================================================
【静态 RAG】
======================================================================
  结果: 根据资料：公司员工每年享有 15 天带薪年假。入职满 5 年后增...

======================================================================
【Agentic RAG】
======================================================================

============================================================
Agentic RAG 处理查询: '年假有多少天'
============================================================

  [Step 1] 查询分析:
    复杂查询: True
    子查询数: 1

  [Step 2] 是否需要检索: True

    [检索尝试 1] 查询: '年假有多少天'
    [评估] 质量: good - 检索结果高度相关

  [Step 6] 最终回答: 根据公司政策，年假有多少天的回答是：公司员工每年享有 15 天带薪年假。入职满 5 年后增...

======================================================================
对比总结:
  静态 RAG: 直接检索 → 直接回答（不判断质量）
  Agentic RAG: 分析 → 检索 → 评估 → 自纠正 → 回答（智能决策）
======================================================================
```

---

### 代码 2：LangGraph 状态机基础

```python
"""
LangGraph 基础概念
StateGraph: 状态图
Node: 节点（处理函数）
Edge: 边（状态转移）
Conditional Edge: 条件边（根据状态决定下一步）
"""

from enum import Enum
from dataclasses import dataclass, field
from typing import Any


# ============================================================
# 模拟 LangGraph 核心概念（无需安装 langgraph）
# ============================================================

class GraphState:
    """图状态：在节点间传递的数据"""
    def __init__(self, **kwargs):
        self.data = kwargs

    def get(self, key, default=None):
        return self.data.get(key, default)

    def set(self, key, value):
        self.data[key] = value

    def __repr__(self):
        return f"GraphState({self.data})"


class StateGraph:
    """
    状态图：定义节点和边
    实际使用 LangGraph 时：
    from langgraph.graph import StateGraph
    """

    def __init__(self):
        self.nodes = {}
        self.edges = {}
        self.conditional_edges = {}
        self.entry_point = None

    def add_node(self, name, func):
        """添加节点"""
        self.nodes[name] = func

    def add_edge(self, source, target):
        """添加边"""
        self.edges[source] = target

    def add_conditional_edges(self, source, condition_func, mapping):
        """添加条件边"""
        self.conditional_edges[source] = {
            "condition": condition_func,
            "mapping": mapping,
        }

    def set_entry_point(self, node_name):
        """设置入口点"""
        self.entry_point = node_name

    def compile(self):
        """编译图（验证结构）"""
        if not self.entry_point:
            raise ValueError("未设置入口点")
        print("  图编译成功！")
        return self

    def run(self, initial_state):
        """运行图"""
        if self.entry_point not in self.nodes:
            raise ValueError(f"入口节点 '{self.entry_point}' 不存在")

        current = self.entry_point
        state = initial_state
        step = 0

        print(f"\n{'─'*50}")
        print(f"  开始执行 | 入口: {current}")
        print(f"{'─'*50}")

        while current is not None and step < 20:  # 防止无限循环
            step += 1
            node_func = self.nodes.get(current)
            if node_func:
                print(f"\n  [Step {step}] 执行节点: {current}")
                state = node_func(state)
                print(f"    输出状态: {state}")

            # 确定下一个节点
            if current in self.conditional_edges:
                ce = self.conditional_edges[current]
                next_key = ce["condition"](state)
                current = ce["mapping"].get(next_key)
                print(f"    条件分支: {next_key} → {current}")
            elif current in self.edges:
                current = self.edges[current]
                print(f"    固定边: → {current}")
            else:
                print(f"    到达终点")
                current = None

        print(f"\n{'─'*50}")
        print(f"  执行完毕 | 共 {step} 步")
        print(f"{'─'*50}")
        return state


# ============================================================
# 构建一个简单的 LangGraph 示例
# ============================================================
print("=" * 70)
print("LangGraph 状态机示例")
print("=" * 70)

# 定义节点函数
def analyze_node(state):
    """分析节点：判断查询复杂度"""
    query = state.get("query", "")
    is_complex = len(query) > 8
    state.set("is_complex", is_complex)
    state.set("retrieved_docs", [])
    state.set("retry_count", 0)
    print(f"    分析结果: 查询='{query}', 复杂={is_complex}")
    return state

def retrieve_node(state):
    """检索节点：执行文档检索"""
    query = state.get("query", "")
    # 模拟检索
    docs = ["文档A: 年假15天", "文档B: 远程办公2天"]
    state.set("retrieved_docs", docs)
    print(f"    检索到 {len(docs)} 篇文档")
    return state

def evaluate_node(state):
    """评估节点：检查检索质量"""
    docs = state.get("retrieved_docs", [])
    quality = "good" if len(docs) >= 2 else "poor"
    state.set("quality", quality)
    print(f"    评估结果: {quality}")
    return state

def generate_node(state):
    """生成节点：生成回答"""
    docs = state.get("retrieved_docs", [])
    query = state.get("query", "")
    answer = f"根据 {len(docs)} 篇文档，关于'{query}'的回答已生成。"
    state.set("answer", answer)
    print(f"    生成回答: {answer[:60]}...")
    return state

def rewrite_node(state):
    """改写节点：重写查询"""
    query = state.get("query", "")
    state.set("query", query + " 相关政策")
    state.set("retry_count", state.get("retry_count", 0) + 1)
    print(f"    查询改写: '{state.get('query')}'")
    return state

# 条件函数
def should_rewrite(state):
    """判断是否需要改写"""
    quality = state.get("quality", "poor")
    retry = state.get("retry_count", 0)
    if quality == "poor" and retry < 2:
        return "rewrite"
    return "proceed"

# 构建图
graph = StateGraph()

# 添加节点
graph.add_node("analyze", analyze_node)
graph.add_node("retrieve", retrieve_node)
graph.add_node("evaluate", evaluate_node)
graph.add_node("rewrite", rewrite_node)
graph.add_node("generate", generate_node)

# 设置入口
graph.set_entry_point("analyze")

# 添加边
graph.add_edge("analyze", "retrieve")
graph.add_edge("retrieve", "evaluate")
graph.add_conditional_edges("evaluate", should_rewrite, {
    "rewrite": "rewrite",
    "proceed": "generate",
})
graph.add_edge("rewrite", "retrieve")
graph.add_edge("generate", None)  # 终点

# 编译并运行
print("\n编译状态图:")
app = graph.compile()

print("\n运行 Agentic RAG:")
initial = GraphState(query="年假", is_complex=False, retrieved_docs=[], retry_count=0)
final_state = app.run(initial)

print(f"\n最终结果:")
print(f"  查询: {final_state.get('query')}")
print(f"  回答: {final_state.get('answer', '无')}")
```

**预期输出：**
```
======================================================================
LangGraph 状态机示例
======================================================================

编译状态图:
  图编译成功！

运行 Agentic RAG:

──────────────────────────────────────────────────
  开始执行 | 入口: analyze
──────────────────────────────────────────────────

  [Step 1] 执行节点: analyze
    分析结果: 查询='年假', 复杂=False
    输出状态: GraphState({...})

  [Step 2] 执行节点: retrieve
    检索到 2 篇文档

  [Step 3] 执行节点: evaluate
    评估结果: good

    条件分支: proceed → generate

  [Step 4] 执行节点: generate
    生成回答: 根据 2 篇文档，关于'年假'的回答已生成。...

    到达终点

──────────────────────────────────────────────────
  执行完毕 | 共 4 步
──────────────────────────────────────────────────

最终结果:
  查询: 年假
  回答: 根据 2 篇文档，关于'年假'的回答已生成。
```

---

### 代码 3：完整 Agentic RAG 工作流

```python
"""
完整 Agentic RAG 工作流
集成查询分析、自适应检索、自我评估、自纠正
"""
import re


class AgenticRAGWorkflow:
    """
    完整的 Agentic RAG 工作流
    模拟 LangGraph 的行为，但不依赖外部库
    """

    def __init__(self, documents):
        self.documents = documents
        self.state = {}
        self.step_count = 0

    def _log(self, step, message):
        print(f"  [{step}] {message}")

    # --------------------------------------------------------
    # Node 1: 查询分析
    # --------------------------------------------------------
    def analyze_query(self):
        self.step_count += 1
        query = self.state["query"]

        # 分析查询类型
        is_question = "?" in query or "什么" in query or "多少" in query
        is_comparison = "还是" in query or "对比" in query
        keywords = re.findall(r'[一-鿿]{2,4}', query)

        self.state["analysis"] = {
            "is_question": is_question,
            "is_comparison": is_comparison,
            "keywords": keywords,
            "complexity": "high" if is_comparison else ("medium" if is_question else "low"),
        }

        self._log(f"Step {self.step_count}", f"查询分析完成")
        self._log(f"  ", f"  类型: {'问答' if is_question else '比较' if is_comparison else '陈述'}")
        self._log(f"  ", f"  复杂度: {self.state['analysis']['complexity']}")
        self._log(f"  ", f"  关键词: {keywords}")
        return True

    # --------------------------------------------------------
    # Node 2: 自适应检索
    # --------------------------------------------------------
    def adaptive_retrieve(self):
        self.step_count += 1
        query = self.state["query"]
        keywords = self.state["analysis"]["keywords"]

        # 自适应检索策略
        if self.state["analysis"]["complexity"] == "high":
            # 复杂查询：多查询策略
            sub_queries = [query] + [f"{kw}政策" for kw in keywords[:2]]
            self._log(f"Step {self.step_count}", f"复杂查询 → 多查询检索 ({len(sub_queries)} 个查询)")
        else:
            # 简单查询：单查询
            sub_queries = [query]
            self._log(f"Step {self.step_count}", f"简单查询 → 单查询检索")

        # 执行检索
        all_results = []
        for sq in sub_queries:
            for doc in self.documents:
                score = sum(1 for kw in keywords if kw in doc)
                if score > 0:
                    all_results.append({"doc": doc, "score": score, "source_query": sq})

        # 去重并排序
        seen = set()
        unique_results = []
        for r in sorted(all_results, key=lambda x: x["score"], reverse=True):
            if r["doc"] not in seen:
                seen.add(r["doc"])
                unique_results.append(r)

        self.state["retrieved"] = unique_results[:5]  # top 5
        self._log(f"  ", f"  检索到 {len(unique_results)} 个候选，保留 Top {len(self.state['retrieved'])}")
        for i, r in enumerate(self.state["retrieved"]):
            self._log(f"  ", f"    {i+1}. [score={r['score']}] {r['doc'][:50]}...")
        return True

    # --------------------------------------------------------
    # Node 3: 自我评估
    # --------------------------------------------------------
    def self_evaluate(self):
        self.step_count += 1
        results = self.state["retrieved"]

        if not results:
            quality = "no_results"
            reason = "未检索到任何文档"
        elif results[0]["score"] >= 3:
            quality = "high"
            reason = "最佳匹配高度相关"
        elif results[0]["score"] >= 1:
            quality = "medium"
            reason = "有部分相关文档"
        else:
            quality = "low"
            reason = "匹配度较低"

        self.state["evaluation"] = {"quality": quality, "reason": reason}
        self._log(f"Step {self.step_count}", f"自我评估: {quality} - {reason}")
        return quality

    # --------------------------------------------------------
    # Node 4: 自纠正
    # --------------------------------------------------------
    def self_correct(self):
        self.step_count += 1
        quality = self.state["evaluation"]["quality"]

        if quality in ("low", "no_results"):
            # 改写查询
            original = self.state["query"]
            keywords = self.state["analysis"]["keywords"]
            corrected = " ".join(keywords) + " 相关政策 规定"
            self.state["query"] = corrected
            self.state["correction_count"] = self.state.get("correction_count", 0) + 1
            self._log(f"Step {self.step_count}", f"自纠正: '{original}' → '{corrected}'")
            return True  # 需要重新检索
        else:
            self._log(f"Step {self.step_count}", f"质量可接受，无需纠正")
            return False  # 不需要重新检索

    # --------------------------------------------------------
    # Node 5: 生成回答
    # --------------------------------------------------------
    def generate_answer(self):
        self.step_count += 1
        results = self.state["retrieved"]
        query = self.state["original_query"]  # 用原始查询

        if not results:
            answer = "根据现有资料，暂未找到与您问题直接相关的信息。"
        else:
            top_doc = results[0]["doc"]
            answer = f"根据公司政策，{query}的回答如下：{top_doc}"

            if len(results) > 1:
                answer += f"\n\n另外，还参考了以下资料："
                for r in results[1:3]:
                    answer += f"\n  - {r['doc'][:60]}..."

        self.state["answer"] = answer
        self._log(f"Step {self.step_count}", f"生成回答完成")
        return answer

    # --------------------------------------------------------
    # 主流程
    # --------------------------------------------------------
    def run(self, query):
        print(f"\n{'='*60}")
        print(f"Agentic RAG 完整工作流")
        print(f"{'='*60}")
        print(f"查询: '{query}'")

        self.state = {
            "query": query,
            "original_query": query,
            "retrieved": [],
            "correction_count": 0,
        }
        self.step_count = 0

        # Step 1: 分析查询
        self.analyze_query()

        # Step 2-4: 检索 → 评估 → 自纠正（循环）
        max_iterations = 3
        for iteration in range(max_iterations):
            self.adaptive_retrieve()
            quality = self.self_evaluate()

            if quality in ("high", "medium"):
                break

            needs_retry = self.self_correct()
            if not needs_retry:
                break

            print(f"\n  --- 第 {iteration+2} 轮检索 ---")

        # Step 5: 生成回答
        answer = self.generate_answer()

        print(f"\n{'='*60}")
        print(f"最终回答:")
        print(f"{answer}")
        print(f"{'='*60}")
        print(f"自纠正次数: {self.state.get('correction_count', 0)}")
        print(f"总步骤数: {self.step_count}")

        return answer


# ============================================================
# 测试完整工作流
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

workflow = AgenticRAGWorkflow(documents)

# 测试用例 1：简单查询
print("\n" + "#" * 60)
print("测试用例 1: 简单查询")
print("#" * 60)
workflow.run("年假有多少天")

# 测试用例 2：复杂查询
print("\n\n" + "#" * 60)
print("测试用例 2: 复杂查询")
print("#" * 60)
workflow.run("年假和远程办公的政策分别是什么？")

# 测试用例 3：模糊查询（触发自纠正）
print("\n\n" + "#" * 60)
print("测试用例 3: 模糊查询")
print("#" * 60)
workflow.run("福利")
```

**预期输出：**
```
##############################################################
测试用例 1: 简单查询
##############################################################

============================================================
Agentic RAG 完整工作流
============================================================
查询: '年假有多少天'
  [Step 1] 查询分析完成
      类型: 问答
      复杂度: medium
      关键词: ['年假', '多少', '天']
  [Step 2] 简单查询 → 单查询检索
      检索到 1 个候选，保留 Top 1
        1. [score=2] 公司员工每年享有 15 天带薪年假。入...
  [Step 3] 自我评估: medium - 有部分相关文档
  [Step 4] 质量可接受，无需纠正
  [Step 5] 生成回答完成

============================================================
最终回答:
根据公司政策，年假有多少天的回答如下：公司员工每年享有 15 天带薪年假。入职满 5 年后增加至 20 天。
============================================================
自纠正次数: 0
总步骤数: 5
```

---

### 代码 4：Agentic RAG vs 静态 RAG 总结对比

```python
"""
Agentic RAG vs 静态 RAG —— 全面对比
"""

print("=" * 70)
print("Agentic RAG vs 静态 RAG —— 全面对比")
print("=" * 70)

comparison = """
┌──────────────────┬───────────────────────┬───────────────────────┐
│       维度       │      静态 RAG         │    Agentic RAG        │
├──────────────────┼───────────────────────┼───────────────────────┤
│ 流程             │ 固定线性              │ 动态自适应            │
│ 查询分析         │ 无                    │ 分析复杂度/类型       │
│ 检索策略         │ 单次检索              │ 多次检索+重试         │
│ 结果评估         │ 无                    │ 自我评估质量          │
│ 自纠正           │ 无                    │ 查询改写+重新检索     │
│ 多轮交互         │ 不支持                │ 支持                  │
│ 复杂查询处理     │ 效果差                │ 分解为子查询          │
│ 实现复杂度       │ 低                    │ 中-高                 │
│ 延迟             │ 低（1次调用）         │ 高（多次调用）        │
│ 成本             │ 低                    │ 较高                  │
│ 回答质量         │ 一般                  │ 显著提升              │
│ 适用场景         │ 简单FAQ               │ 复杂企业应用          │
└──────────────────┴───────────────────────┴───────────────────────┘
"""
print(comparison)

print("=" * 70)
print("LangGraph 核心概念回顾")
print("=" * 70)

concepts = """
📌 StateGraph（状态图）：
   - 定义整个工作流的结构
   - 包含节点（处理函数）和边（转移关系）

📌 Node（节点）：
   - 每个节点是一个处理函数
   - 接收状态，处理后返回新状态
   - 例如：分析节点、检索节点、生成节点

📌 Edge（边）：
   - 连接两个节点，定义执行顺序
   - 无条件边：固定转移
   - 条件边：根据状态决定下一步

📌 Conditional Edge（条件边）：
   - 根据当前状态动态决定下一步
   - 例如：检索质量好 → 生成；质量差 → 改写重试

📌 编译与运行：
   1. 创建 StateGraph
   2. 添加节点：graph.add_node("name", func)
   3. 添加边：graph.add_edge("source", "target")
   4. 设置入口：graph.set_entry_point("start")
   5. 编译：app = graph.compile()
   6. 运行：result = app.invoke(initial_state)
"""
print(concepts)

print("=" * 70)
print("本周学习路线回顾")
print("=" * 70)

week_review = """
Day 1: RAG 原理 ──── 理解"为什么需要 RAG"和四阶段流水线
Day 2: Chroma ────── 掌握向量数据库的 CRUD 操作
Day 3: 文档加载 ──── 学会加载不同格式 + 四种分块策略
Day 4: 混合检索 ──── 向量 + BM25 + Reranking 组合拳
Day 5: 查询改写 ──── Query 改写 + 上下文注入 + Redis 缓存
Day 6: 评估指标 ──── Precision/Recall/MRR/Faithfulness
Day 7: Agentic RAG ─ Agent 化的 RAG，状态机驱动
"""
print(week_review)

print("=" * 70)
print("下周预告：Week 6 - 多 Agent 协作系统")
print("=" * 70)
```

**预期输出：**
```
======================================================================
Agentic RAG vs 静态 RAG —— 全面对比
======================================================================

┌──────────────────┬───────────────────────┬───────────────────────┐
│       维度       │      静态 RAG         │    Agentic RAG        │
├──────────────────┼───────────────────────┼───────────────────────┤
│ 流程             │ 固定线性              │ 动态自适应            │
│ 查询分析         │ 无                    │ 分析复杂度/类型       │
│ 检索策略         │ 单次检索              │ 多次检索+重试         │
│ 结果评估         │ 无                    │ 自我评估质量          │
│ 自纠正           │ 无                    │ 查询改写+重新检索     │
│ 回答质量         │ 一般                  │ 显著提升              │
│ 适用场景         │ 简单FAQ               │ 复杂企业应用          │
└──────────────────┴───────────────────────┴───────────────────────┘

======================================================================
LangGraph 核心概念回顾
======================================================================

📌 StateGraph（状态图）：...
📌 Node（节点）：...
📌 Edge（边）：...
📌 Conditional Edge（条件边）：...

======================================================================
本周学习路线回顾
======================================================================

Day 1: RAG 原理 ──── 理解"为什么需要 RAG"和四阶段流水线
Day 2: Chroma ────── 掌握向量数据库的 CRUD 操作
Day 3: 文档加载 ──── 学会加载不同格式 + 四种分块策略
Day 4: 混合检索 ──── 向量 + BM25 + Reranking 组合拳
Day 5: 查询改写 ──── Query 改写 + 上下文注入 + Redis 缓存
Day 6: 评估指标 ──── Precision/Recall/MRR/Faithfulness
Day 7: Agentic RAG ─ Agent 化的 RAG，状态机驱动

======================================================================
下周预告：Week 6 - 多 Agent 协作系统
======================================================================
```

---

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | Agent 陷入无限循环 | 设置 max_retries 限制，添加退出条件 |
| 2 | 自纠正后结果更差 | 限制纠正次数（最多 2 次），设置回退策略 |
| 3 | LangGraph 安装失败 | 使用 `pip install langgraph`，确保 Python >= 3.9 |
| 4 | 条件边逻辑错误 | 打印中间状态调试，确保所有分支都有出口 |
| 5 | 状态在节点间丢失 | 检查是否正确返回了 state 对象 |
| 6 | Agent 决策不合理 | 调整判断规则，或用 LLM 做决策而非硬编码 |

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Agentic RAG | 带有 Agent 决策能力的 RAG，能自主决定检索策略 |
| LangGraph | LangChain 生态的状态机框架，用于构建有状态的 Agent 工作流 |
| StateGraph | 状态图，定义节点和边的有向图 |
| Node | 图中的处理节点，每个节点执行一个函数 |
| Edge | 连接节点的边，定义执行流程 |
| Conditional Edge | 条件边，根据状态动态选择下一个节点 |
| Self-Correction | 自纠正，Agent 检测到问题后自动修正 |
| Adaptive Retrieval | 自适应检索，根据查询复杂度选择检索策略 |
| Multi-Query | 多查询，从不同角度生成多个查询变体 |
| Query Decomposition | 查询分解，将复杂查询拆分为多个子查询 |

---

## ✅ 验收清单

- [ ] 能说出静态 RAG 和 Agentic RAG 的三个核心差异
- [ ] 理解 LangGraph 的 StateGraph、Node、Edge 概念
- [ ] 能从零构建一个简单的状态机并运行
- [ ] 理解"自适应检索"：根据查询复杂度选择策略
- [ ] 理解"自纠正"：检索质量差时自动改写查询重试
- [ ] 成功运行完整 Agentic RAG 工作流代码
- [ ] 能对比静态 RAG 和 Agentic RAG 的适用场景

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
