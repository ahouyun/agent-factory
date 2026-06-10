# 📅 Week 5 Day 6：RAG 评估：忠实度、相关性、召回率

## 🧭 今日方向
> "没有度量就没有改进"。今天学习如何系统性地评估 RAG 系统的质量，掌握三大核心指标（忠实度、相关性、召回率）以及评估框架 RAGAS 的使用方法。

## 🎯 生活比喻
> 评估 RAG 就像给学生批改"开卷考试"。你需要检查三个维度：1）答案是不是从书里抄的（忠实度）；2）翻的书页对不对（相关性）；3）该翻的书页都翻到了吗（召回率）。

## 📋 今日三件事
1. 理解 RAG 评估的三大核心指标及其计算方式
2. 学会构建评估数据集（Question + Context + Answer）
3. 用 RAGAS 框架对 RAG 系统进行自动化评估

## 🗺️ 手把手路线

### Step 1: 理解评估指标
- 做什么: 用人工方式手动评估 5 个问答对的质量
- 为什么: 只有先手动评估过，才能理解自动评估的含义
- 成功标志: 能用 1-5 分评价每个问答对的忠实度、相关性

### Step 2: 构建评估数据集
- 做什么: 准备 Question + Ground Truth Answer + Context 三元组
- 为什么: 评估需要基准数据，没有基准就无法量化
- 成功标志: 构建至少 5 条评估样本

### Step 3: RAGAS 自动评估
- 做什么: 用 RAGAS 框架对 RAG 系统进行自动打分
- 为什么: 人工评估耗时，自动评估可以持续监控
- 成功标志: 运行 RAGAS 并解读评估报告

## 💻 代码区

```python
"""
Week 5 Day 6: RAG 评估
安装依赖: pip install ragas langchain langchain-openai chromadb datasets
"""

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.schema import Document
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import json

# ========== 0. 搭建待评估的 RAG 系统 ==========
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
embeddings = OpenAIEmbeddings()

# 知识库
docs = [
    Document(page_content="Python 3.12 引入了新的类型参数语法（PEP 695），支持用 type 语句定义类型别名。", metadata={"source": "python312"}),
    Document(page_content="Python 3.12 的 f-string 支持嵌套引号，不再需要转义。", metadata={"source": "python312"}),
    Document(page_content="Python 3.12 性能提升约 5%，主要来自改进的字节码解释器。", metadata={"source": "python312"}),
    Document(page_content="FastAPI 0.110 版本新增了 WebSocket 连接的依赖注入支持。", metadata={"source": "fastapi"}),
    Document(page_content="FastAPI 使用 Pydantic V2 进行数据验证，性能提升 5-50 倍。", metadata={"source": "fastapi"}),
    Document(page_content="Django 5.0 引入了 Field Groups，简化了表单字段的分组渲染。", metadata={"source": "django"}),
    Document(page_content="Django 5.0 的数据库约束现在可以定义在 model 层面。", metadata={"source": "django"}),
    Document(page_content="Redis 7.0 支持 Redis Functions，可以替代 Lua 脚本。", metadata={"source": "redis"}),
]

vectorstore = Chroma.from_documents(docs, embeddings, collection_name="eval_demo")
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# RAG Chain
prompt = ChatPromptTemplate.from_template("""
基于以下参考资料回答问题。只使用参考资料中的信息。

参考资料：
{context}

问题：{question}

回答：""")

def format_docs(docs_list):
    return "\n\n".join([d.page_content for d in docs_list])

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# ========== 1. 手动评估（建立直觉）==========
print("=== 1. 手动评估 ===")
test_questions = [
    "Python 3.12 有什么新特性？",
    "FastAPI 性能如何？",
    "Django 5.0 做了哪些改进？",
    "Redis 支持脚本吗？",
    "Python 3.12 的性能提升多少？",
]

for q in test_questions:
    answer = rag_chain.invoke(q)
    print(f"\n问题: {q}")
    print(f"回答: {answer}")
    print("手动评分 (1-5):")
    print("  忠实度 (答案是否基于资料): ?")
    print("  相关性 (答案是否回答了问题): ?")
    print("---")

# ========== 2. 构建评估数据集 ==========
print("\n=== 2. 构建评估数据集 ===")

evaluation_dataset = {
    "question": [
        "Python 3.12 有什么新特性？",
        "FastAPI 性能如何？",
        "Django 5.0 做了哪些改进？",
        "Redis 支持脚本吗？",
        "Python 3.12 的性能提升多少？",
    ],
    "ground_truth": [
        "Python 3.12 引入了新的类型参数语法（PEP 695），支持用 type 语句定义类型别名，f-string 支持嵌套引号。",
        "FastAPI 使用 Pydantic V2 进行数据验证，性能提升 5-50 倍。",
        "Django 5.0 引入了 Field Groups 简化表单渲染，数据库约束可以定义在 model 层面。",
        "Redis 7.0 支持 Redis Functions，可以替代 Lua 脚本。",
        "Python 3.12 性能提升约 5%，主要来自改进的字节码解释器。",
    ],
    "contexts": [
        ["Python 3.12 引入了新的类型参数语法（PEP 695）", "Python 3.12 的 f-string 支持嵌套引号"],
        ["FastAPI 使用 Pydantic V2 进行数据验证，性能提升 5-50 倍"],
        ["Django 5.0 引入了 Field Groups", "Django 5.0 的数据库约束现在可以定义在 model 层面"],
        ["Redis 7.0 支持 Redis Functions，可以替代 Lua 脚本"],
        ["Python 3.12 性能提升约 5%，主要来自改进的字节码解释器"],
    ],
    "answer": []  # 待填充
}

# 用 RAG 系统生成回答
for q in evaluation_dataset["question"]:
    answer = rag_chain.invoke(q)
    evaluation_dataset["answer"].append(answer)

# 打印评估数据集
print(json.dumps(evaluation_dataset, ensure_ascii=False, indent=2))

# ========== 3. RAGAS 自动评估 ==========
print("\n=== 3. RAGAS 自动评估 ===")

from datasets import Dataset

# 转换为 RAGAS 格式
eval_data = {
    "question": evaluation_dataset["question"],
    "answer": evaluation_dataset["answer"],
    "contexts": evaluation_dataset["contexts"],
    "ground_truth": evaluation_dataset["ground_truth"],
}

dataset = Dataset.from_dict(eval_data)
print(f"评估数据集: {len(dataset)} 条样本")

# RAGAS 评估
from ragas import evaluate
from ragas.metrics import (
    faithfulness,      # 忠实度
    answer_relevancy,  # 回答相关性
    context_precision, # 上下文精确率
    context_recall,    # 上下文召回率
)

# 注意：RAGAS 需要 OpenAI API 来运行评估
# 如果不想用 OpenAI，可以使用本地评估模型
try:
    result = evaluate(
        dataset=dataset,
        metrics=[
            faithfulness,
            answer_relevancy,
            context_precision,
            context_recall,
        ],
    )
    print("\n=== RAGAS 评估结果 ===")
    print(result)

    # 转为 DataFrame 查看详细结果
    df = result.to_pandas()
    print("\n=== 各指标详细得分 ===")
    for col in ["faithfulness", "answer_relevancy", "context_precision", "context_recall"]:
        if col in df.columns:
            print(f"{col}: {df[col].mean():.4f}")
except Exception as e:
    print(f"RAGAS 评估需要 OpenAI API: {e}")
    print("以下是手动评估替代方案：")

# ========== 4. 手动评估替代方案 ==========
print("\n=== 4. 手动评估替代方案 ===")

def manual_evaluate(question, answer, ground_truth, retrieved_contexts):
    """
    手动评估函数，模拟 RAGAS 的评估逻辑
    """
    scores = {}

    # 忠实度：答案是否完全基于检索到的上下文
    context_text = " ".join(retrieved_contexts)
    # 简单的关键词重叠检查
    answer_keywords = set(answer.split())
    context_keywords = set(context_text.split())
    if len(answer_keywords) > 0:
        scores["faithfulness"] = len(answer_keywords & context_keywords) / len(answer_keywords)
    else:
        scores["faithfulness"] = 0.0

    # 相关性：答案是否回答了问题
    question_keywords = set(question.split())
    answer_keywords = set(answer.split())
    if len(question_keywords) > 0:
        scores["relevancy"] = len(question_keywords & answer_keywords) / len(question_keywords)
    else:
        scores["relevancy"] = 0.0

    # 召回率：ground_truth 中的关键信息是否被包含
    gt_keywords = set(ground_truth.split())
    if len(gt_keywords) > 0:
        scores["recall"] = len(gt_keywords & answer_keywords) / len(gt_keywords)
    else:
        scores["recall"] = 0.0

    return scores

# 对每个问答对进行手动评估
print("\n手动评估结果:")
all_scores = {"faithfulness": [], "relevancy": [], "recall": []}

for i, q in enumerate(evaluation_dataset["question"]):
    answer = evaluation_dataset["answer"][i]
    ground_truth = evaluation_dataset["ground_truth"][i]
    contexts = evaluation_dataset["contexts"][i]

    scores = manual_evaluate(q, answer, ground_truth, contexts)
    for key, value in scores.items():
        all_scores[key].append(value)

    print(f"\n[{i+1}] {q}")
    print(f"  忠实度: {scores['faithfulness']:.2f}")
    print(f"  相关性: {scores['relevancy']:.2f}")
    print(f"  召回率: {scores['recall']:.2f}")

# 平均分
print("\n=== 平均评估得分 ===")
for key, values in all_scores.items():
    print(f"{key}: {sum(values)/len(values):.4f}")

# ========== 5. 评估报告生成 ==========
print("\n=== 5. 评估报告 ===")

def generate_eval_report(questions, answers, ground_truths, contexts_list):
    """生成评估报告"""
    report = []
    for i, (q, a, gt, ctx) in enumerate(zip(questions, answers, ground_truths, contexts_list)):
        scores = manual_evaluate(q, a, gt, ctx)
        status = "PASS" if all(v > 0.5 for v in scores.values()) else "WARN"
        report.append({
            "id": i + 1,
            "question": q,
            "status": status,
            "scores": scores,
        })

    # 统计
    total = len(report)
    passed = sum(1 for r in report if r["status"] == "PASS")
    failed = total - passed

    print(f"评估总数: {total}")
    print(f"通过: {passed} ({passed/total*100:.1f}%)")
    print(f"警告: {failed} ({failed/total*100:.1f}%)")

    for r in report:
        print(f"\n[{r['status']}] #{r['id']}: {r['question'][:40]}...")
        for k, v in r["scores"].items():
            print(f"  {k}: {v:.2f}")

    return report

report = generate_eval_report(
    evaluation_dataset["question"],
    evaluation_dataset["answer"],
    evaluation_dataset["ground_truth"],
    evaluation_dataset["contexts"],
)

print("""
=== RAG 评估最佳实践 ===

1. 评估频率:
   - 开发阶段: 每次修改后评估
   - 生产环境: 每日/每周自动评估

2. 关键指标解读:
   - 忠实度 < 0.7: 模型可能在幻觉，检查 Prompt
   - 相关性 < 0.6: 检索质量差，优化分块或 Embedding
   - 召回率 < 0.5: 知识库覆盖不足，补充文档

3. 改进方向:
   - 忠实度低 → 强化"只用参考资料"的 Prompt 约束
   - 相关性低 → 优化 Query 改写和检索策略
   - 召回率低 → 增加知识库文档，优化分块粒度
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | `ragas` 安装失败 | `pip install ragas --no-cache-dir`，或使用 `evaluate` 的本地模式 |
| 2 | RAGAS 评估报错需要 OpenAI | 设置 `OPENAI_API_KEY`，或用手动评估替代 |
| 3 | 评估分数全是 0 | 检查 ground_truth 是否与 answer 完全不相关 |
| 4 | Dataset 格式不匹配 | 确保字段名完全一致：question, answer, contexts, ground_truth |
| 5 | 评估结果波动大 | 增加评估样本量（至少 20 条），多次运行取平均 |
| 6 | 不知道如何改进低分指标 | 参考评估报告中的"改进方向"部分 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| 忠实度 (Faithfulness) | 回答是否完全基于检索到的文档，是否有编造内容 |
| 回答相关性 (Answer Relevancy) | 回答是否真正回答了用户的问题 |
| 上下文精确率 (Context Precision) | 检索到的文档中，有多少是真正相关的 |
| 上下文召回率 (Context Recall) | 相关文档中有多少被成功检索到了 |
| RAGAS | RAG 评估框架，自动化评估 RAG 系统质量 |
| Ground Truth | 标准答案，人工标注的参考基准 |
| 评估数据集 | 包含问题、标准答案、参考上下文的测试集 |
| 幻觉 (Hallucination) | 模型生成了训练数据或参考资料中不存在的信息 |
| 评估指标 | 量化 RAG 系统质量的数值指标 |
| 评估 Pipeline | 自动化的评估流程，定期运行并生成报告 |

## ✅ 验收清单
- [ ] 能说出 RAG 三大评估指标的含义
- [ ] 能构建包含 question/answer/contexts/ground_truth 的评估数据集
- [ ] 理解 RAGAS 的评估流程
- [ ] 能运行手动评估函数并解读结果
- [ ] 能根据评估结果提出改进方向
- [ ] 理解忠实度低和相关性低分别意味着什么

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
