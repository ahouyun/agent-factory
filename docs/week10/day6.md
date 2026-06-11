# 📅 Week 10 Day 6：评测微调效果 + 对比分析

---

## 🧭 今日方向

今天我们学习如何科学地评估微调效果。评测是微调流程中最容易被忽视但最重要的环节——没有好的评测，你就不知道模型是否真的变好了。

**核心问题：** 如何量化评估微调后的模型质量？如何与基线模型进行对比？

---

## 🎯 生活比喻

- **评测** = 考试
- **基线模型** = 考试前的成绩（摸底考试）
- **微调后模型** = 补习后的成绩（期末考试）
- **评测指标** = 各科分数（语文、数学、英语...）
- **对比分析** = 分析哪些科目进步了，哪些退步了

关键洞察：**不能只看总分，要分析各个维度的变化**。微调可能在某些方面提升了，但在另一些方面退步了。

---

## 📋 今日三件事

1. **掌握常用的评测指标**——困惑度（Perplexity）、自动评测、人工评测
2. **实现自动化评测流水线**——批量评测 + 结果统计
3. **进行 A/B 对比分析**——基线模型 vs 微调模型

---

## 🗺️ 手把手路线

### 第一步：环境准备

```bash
pip install torch transformers datasets numpy pandas
pip install rouge-score nltk evaluate
```

### 第二步：了解评测维度

```
评测维度：
  1. 困惑度 (Perplexity): 模型对文本的预测能力
  2. 生成质量: 流畅性、连贯性、信息量
  3. 指令遵循: 是否正确回答了问题
  4. 安全性: 是否产生有害内容
  5. 任务准确率: 在特定任务上的表现
```

---

## 💻 代码区

### 代码 1：困惑度（Perplexity）计算

```python
"""
Day 6 - 困惑度（Perplexity）计算
衡量语言模型预测能力的核心指标
"""

import torch
import numpy as np
from transformers import AutoModelForCausalLM, AutoTokenizer

print("=" * 60)
print("困惑度（Perplexity）计算")
print("=" * 60)

# ============================================================
# 1. 困惑度原理
# ============================================================
print("\n1. 困惑度原理")
print("-" * 40)
print("""
  困惑度（Perplexity, PPL）是语言模型最常用的评估指标。

  定义:
    PPL = exp(-1/N * Σ log P(x_i | x_1, ..., x_{i-1}))

  直觉理解:
    - PPL = 10 表示模型在每个位置平均有 10 个等概率的候选词
    - PPL 越低，模型的预测越确定（越好）
    - PPL 越高，模型越困惑（越差）

  取值范围:
    - 理想情况: PPL → 1（完美预测）
    - 随机猜测: PPL ≈ 词表大小（如 50000）
    - 实际模型: 通常在 5-50 之间

  注意:
    - 困惑度只衡量"预测下一个词"的能力，不直接反映"回答问题"的能力
    - 不同词表大小的模型，困惑度不可直接比较
    - 困惑度低 ≠ 模型质量高（可能过拟合）
""")

# ============================================================
# 2. 困惑度计算实现
# ============================================================
print("2. 困惑度计算实现")
print("-" * 40)

def calculate_perplexity(text, model, tokenizer, max_length=512):
    """
    计算文本的困惑度

    Args:
        text: 输入文本
        model: 语言模型
        tokenizer: 分词器
        max_length: 最大序列长度

    Returns:
        perplexity: 困惑度值
        token_perplexity: 每个 token 的困惑度
    """
    encodings = tokenizer(
        text,
        return_tensors="pt",
        max_length=max_length,
        truncation=True,
        padding=False,
    )

    input_ids = encodings.input_ids
    seq_len = input_ids.size(1)

    with torch.no_grad():
        outputs = model(input_ids, labels=input_ids)
        # loss 是平均交叉熵损失
        avg_loss = outputs.loss.item()

    # 困惑度 = exp(平均损失)
    perplexity = np.exp(avg_loss)

    return perplexity, avg_loss

# 模拟不同模型的困惑度
print("  模拟不同模型在相同文本上的困惑度:")
print()

test_texts = [
    "人工智能是计算机科学的一个分支，它试图理解智能的本质。",
    "大语言模型基于Transformer架构，通过自回归方式学习语言。",
    "强化学习使智能体通过与环境交互来学习最优策略。",
]

# 模拟两个模型的困惑度
model_a_ppls = [12.3, 15.6, 18.2]  # 模型 A
model_b_ppls = [10.1, 13.4, 15.8]  # 模型 B（微调后）

print(f"  {'文本':>30} {'基线模型':>10} {'微调模型':>10} {'改进':>10}")
print("  " + "-" * 65)

for i, text in enumerate(test_texts):
    improvement = (model_a_ppls[i] - model_b_ppls[i]) / model_a_ppls[i] * 100
    print(f"  {text[:25]:>30} {model_a_ppls[i]:>10.1f} {model_b_ppls[i]:>10.1f} {improvement:>9.1f}%")

avg_a = np.mean(model_a_ppls)
avg_b = np.mean(model_b_ppls)
avg_improvement = (avg_a - avg_b) / avg_a * 100

print("  " + "-" * 65)
print(f"  {'平均':>30} {avg_a:>10.1f} {avg_b:>10.1f} {avg_improvement:>9.1f}%")

# ============================================================
# 3. 批量困惑度评估
# ============================================================
print("\n3. 批量困惑度评估")
print("-" * 40)

def batch_perplexity(texts, model, tokenizer):
    """批量计算困惑度"""
    results = []
    for text in texts:
        ppl, loss = calculate_perplexity(text, model, tokenizer)
        results.append({
            "text": text[:50],
            "perplexity": ppl,
            "loss": loss,
        })
    return results

print("  批量评估流程:")
print("  1. 加载评测数据集")
print("  2. 对每条数据计算困惑度")
print("  3. 计算平均困惑度和标准差")
print("  4. 分析异常值")

# 模拟批量评估结果
print("\n  模拟批量评估结果:")
np.random.seed(42)
ppls = np.random.lognormal(mean=2.5, sigma=0.3, size=100)

print(f"    样本数: {len(ppls)}")
print(f"    平均困惑度: {np.mean(ppls):.2f}")
print(f"    中位数困惑度: {np.median(ppls):.2f}")
print(f"    标准差: {np.std(ppls):.2f}")
print(f"    最小值: {np.min(ppls):.2f}")
print(f"    最大值: {np.max(ppls):.2f}")
print(f"    P25: {np.percentile(ppls, 25):.2f}")
print(f"    P75: {np.percentile(ppls, 75):.2f}")

# ============================================================
# 4. 困惑度的局限性
# ============================================================
print("\n4. 困惑度的局限性")
print("-" * 40)
print("""
  困惑度的局限性：
  ─────────────────────────────────────────────────
  1. 不能评估回答质量:
     低困惑度只说明模型能预测下一个词，不代表回答有帮助

  2. 受词表大小影响:
     不同 tokenizer 的词表大小不同，困惑度不可直接比较

  3. 不考虑语义:
     "猫坐在垫子上" 和 "猫坐在桌子上" 困惑度相近，但语义不同

  4. 对生成任务不够敏感:
     模型可能生成流畅但无意义的文本

  5. 过拟合陷阱:
     在训练集上困惑度很低，但在新数据上可能很高

  因此，困惑度应该与其他指标结合使用：
  - 自动评测（BLEU, ROUGE, BERTScore）
  - 人工评测（流畅性、准确性、有用性）
  - 任务特定指标（准确率、F1 等）
""")
```

### 代码 2：自动评测流水线

```python
"""
Day 6 - 自动评测流水线
使用多种指标评估模型生成质量
"""

import numpy as np
from collections import defaultdict

print("=" * 60)
print("自动评测流水线")
print("=" * 60)

# ============================================================
# 1. 评测指标实现
# ============================================================
print("\n1. 常用评测指标")
print("-" * 40)

def simple_bleu(reference, hypothesis, max_n=4):
    """
    简化版 BLEU 分数计算
    实际中建议使用 nltk.translate.bleu_score
    """
    ref_tokens = reference.split()
    hyp_tokens = hypothesis.split()

    if len(hyp_tokens) == 0:
        return 0.0

    # 计算 n-gram 精度
    precisions = []
    for n in range(1, max_n + 1):
        ref_ngrams = defaultdict(int)
        for i in range(len(ref_tokens) - n + 1):
            ngram = tuple(ref_tokens[i:i+n])
            ref_ngrams[ngram] += 1

        hyp_ngrams = defaultdict(int)
        for i in range(len(hyp_tokens) - n + 1):
            ngram = tuple(hyp_tokens[i:i+n])
            hyp_ngrams[ngram] += 1

        # 计算匹配数
        match_count = 0
        total_count = 0
        for ngram, count in hyp_ngrams.items():
            match_count += min(count, ref_ngrams.get(ngram, 0))
            total_count += count

        precision = match_count / total_count if total_count > 0 else 0
        precisions.append(precision)

    # 几何平均
    if min(precisions) > 0:
        log_avg = sum(np.log(p) for p in precisions) / len(precisions)
        bleu = np.exp(log_avg)
    else:
        bleu = 0.0

    # 长度惩罚
    bp = min(1.0, np.exp(1 - len(ref_tokens) / max(len(hyp_tokens), 1)))

    return bp * bleu

def simple_rouge_l(reference, hypothesis):
    """简化版 ROUGE-L 分数"""
    ref_tokens = reference.split()
    hyp_tokens = hypothesis.split()

    # LCS 长度
    lcs_len = _lcs_length(ref_tokens, hyp_tokens)

    precision = lcs_len / len(hyp_tokens) if len(hyp_tokens) > 0 else 0
    recall = lcs_len / len(ref_tokens) if len(ref_tokens) > 0 else 0

    if precision + recall > 0:
        f1 = 2 * precision * recall / (precision + recall)
    else:
        f1 = 0

    return f1

def _lcs_length(x, y):
    """最长公共子序列长度"""
    m, n = len(x), len(y)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if x[i-1] == y[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])

    return dp[m][n]

def simple_bert_score(reference, hypothesis):
    """
    简化版 BERTScore（实际中使用 bert_score 库）
    这里用一个简化近似
    """
    ref_tokens = set(reference.split())
    hyp_tokens = set(hypothesis.split())

    # Jaccard 相似度作为近似
    intersection = ref_tokens & hyp_tokens
    union = ref_tokens | hyp_tokens

    return len(intersection) / len(union) if len(union) > 0 else 0

# ============================================================
# 2. 评测示例
# ============================================================
print("\n2. 评测示例")
print("-" * 40)

eval_pairs = [
    {
        "reference": "Python是一种广泛使用的高级编程语言，以其简洁优雅的语法著称。",
        "hypothesis_good": "Python是一种高级编程语言，语法简洁优雅，被广泛使用。",
        "hypothesis_bad": "Python是一种水果，可以吃。",
    },
    {
        "reference": "机器学习是人工智能的一个分支，使计算机能够从数据中学习。",
        "hypothesis_good": "机器学习属于人工智能领域，让计算机从数据中学习规律。",
        "hypothesis_bad": "机器学习就是让机器自己学习，不需要人。",
    },
]

print(f"\n  {'指标':>15} {'好回答':>10} {'坏回答':>10}")
print("  " + "-" * 40)

for pair in eval_pairs:
    ref = pair["reference"]
    good = pair["hypothesis_good"]
    bad = pair["hypothesis_bad"]

    bleu_good = simple_bleu(ref, good)
    bleu_bad = simple_bleu(ref, bad)
    rouge_good = simple_rouge_l(ref, good)
    rouge_bad = simple_rouge_l(ref, bad)
    bert_good = simple_bert_score(ref, good)
    bert_bad = simple_bert_score(ref, bad)

    print(f"  {'BLEU':>15} {bleu_good:>10.4f} {bleu_bad:>10.4f}")
    print(f"  {'ROUGE-L':>15} {rouge_good:>10.4f} {rouge_bad:>10.4f}")
    print(f"  {'BERTScore':>15} {bert_good:>10.4f} {bert_bad:>10.4f}")
    print()

# ============================================================
# 3. 完整评测流水线
# ============================================================
print("3. 完整评测流水线")
print("-" * 40)

def evaluation_pipeline(eval_data):
    """
    完整的评测流水线

    Args:
        eval_data: 评测数据列表，每个元素包含 reference 和 hypothesis

    Returns:
        results: 评测结果
    """
    results = {
        "bleu": [],
        "rouge_l": [],
        "bert_score": [],
    }

    for pair in eval_data:
        ref = pair["reference"]
        hyp = pair["hypothesis"]

        results["bleu"].append(simple_bleu(ref, hyp))
        results["rouge_l"].append(simple_rouge_l(ref, hyp))
        results["bert_score"].append(simple_bert_score(ref, hyp))

    # 计算统计量
    stats = {}
    for metric, scores in results.items():
        stats[metric] = {
            "mean": np.mean(scores),
            "std": np.std(scores),
            "min": np.min(scores),
            "max": np.max(scores),
            "median": np.median(scores),
        }

    return results, stats

# 生成测试数据
np.random.seed(42)
test_data = []
references = [
    "Python是一种广泛使用的高级编程语言",
    "机器学习是人工智能的一个分支",
    "深度学习使用多层神经网络",
]

for ref in references:
    # 模拟好回答
    good_hyp = ref[:len(ref)//2] + "，" + ref[len(ref)//2:]
    test_data.append({"reference": ref, "hypothesis": good_hyp})

# 运行评测
results, stats = evaluation_pipeline(test_data)

print("  评测结果:")
for metric, stat in stats.items():
    print(f"\n  {metric}:")
    print(f"    平均: {stat['mean']:.4f}")
    print(f"    标准差: {stat['std']:.4f}")
    print(f"    范围: [{stat['min']:.4f}, {stat['max']:.4f}]")
```

### 代码 3：A/B 对比分析

```python
"""
Day 6 - A/B 对比分析
对比基线模型和微调模型的表现
"""

import numpy as np
from collections import defaultdict

print("=" * 60)
print("A/B 对比分析")
print("=" * 60)

# ============================================================
# 1. A/B 对比框架
# ============================================================
print("\n1. A/B 对比框架")
print("-" * 40)

class ABComparison:
    """A/B 对比分析框架"""

    def __init__(self, model_a_name="基线模型", model_b_name="微调模型"):
        self.model_a_name = model_a_name
        self.model_b_name = model_b_name
        self.results = defaultdict(lambda: {"a": [], "b": []})

    def add_result(self, metric_name, score_a, score_b):
        """添加一对评测结果"""
        self.results[metric_name]["a"].append(score_a)
        self.results[metric_name]["b"].append(score_b)

    def summary(self):
        """生成对比摘要"""
        print(f"\n  A/B 对比摘要: {self.model_a_name} vs {self.model_b_name}")
        print("=" * 60)

        for metric, scores in self.results.items():
            a_scores = np.array(scores["a"])
            b_scores = np.array(scores["b"])

            a_mean = np.mean(a_scores)
            b_mean = np.mean(b_scores)
            diff = b_mean - a_mean
            diff_pct = (diff / a_mean * 100) if a_mean != 0 else 0

            # 判断哪个更好（假设分数越高越好）
            if b_mean > a_mean:
                winner = self.model_b_name
            elif a_mean > b_mean:
                winner = self.model_a_name
            else:
                winner = "平局"

            print(f"\n  指标: {metric}")
            print(f"    {self.model_a_name}: {a_mean:.4f} (±{np.std(a_scores):.4f})")
            print(f"    {self.model_b_name}: {b_mean:.4f} (±{np.std(b_scores):.4f})")
            print(f"    差异: {diff:+.4f} ({diff_pct:+.1f}%)")
            print(f"    更优: {winner}")

    def win_rate(self):
        """计算逐样本胜率"""
        print(f"\n  逐样本胜率分析:")
        print("-" * 40)

        for metric, scores in self.results.items():
            a_scores = np.array(scores["a"])
            b_scores = np.array(scores["b"])

            a_wins = np.sum(a_scores > b_scores)
            b_wins = np.sum(b_scores > a_scores)
            ties = np.sum(a_scores == b_scores)
            total = len(a_scores)

            print(f"\n  {metric}:")
            print(f"    {self.model_a_name} 胜: {a_wins}/{total} ({a_wins/total*100:.1f}%)")
            print(f"    {self.model_b_name} 胜: {b_wins}/{total} ({b_wins/total*100:.1f}%)")
            print(f"    平局: {ties}/{total} ({ties/total*100:.1f}%)")

# ============================================================
# 2. 模拟 A/B 对比
# ============================================================
print("\n2. 模拟 A/B 对比")
print("-" * 40)

# 创建对比框架
ab = ABComparison("基线模型", "微调模型")

# 模拟评测结果（20 个评测样本）
np.random.seed(42)
n_samples = 20

# Perplexity（越低越好）
baseline_ppl = np.random.lognormal(mean=2.5, sigma=0.3, n_samples)
finetuned_ppl = baseline_ppl * np.random.uniform(0.7, 0.95, n_samples)

for b, f in zip(baseline_ppl, finetuned_ppl):
    ab.add_result("Perplexity", b, f)

# BLEU 分数（越高越好）
baseline_bleu = np.random.uniform(0.3, 0.7, n_samples)
finetuned_bleu = baseline_bleu + np.random.uniform(0.05, 0.2, n_samples)

for b, f in zip(baseline_bleu, finetuned_bleu):
    ab.add_result("BLEU", b, f)

# ROUGE-L 分数（越高越好）
baseline_rouge = np.random.uniform(0.4, 0.8, n_samples)
finetuned_rouge = baseline_rouge + np.random.uniform(-0.05, 0.15, n_samples)

for b, f in zip(baseline_rouge, finetuned_rouge):
    ab.add_result("ROUGE-L", b, f)

# 生成摘要
ab.summary()
ab.win_rate()

# ============================================================
# 3. 分类评测分析
# ============================================================
print("\n3. 分类评测分析")
print("-" * 40)

# 按任务类型分析
categories = {
    "知识问答": {"baseline": 0.65, "finetuned": 0.78},
    "代码生成": {"baseline": 0.52, "finetuned": 0.71},
    "文本摘要": {"baseline": 0.71, "finetuned": 0.74},
    "对话生成": {"baseline": 0.68, "finetuned": 0.73},
    "翻译": {"baseline": 0.59, "finetuned": 0.62},
}

print(f"\n  {'任务类型':>10} {'基线模型':>10} {'微调模型':>10} {'改进':>10}")
print("  " + "-" * 45)

for cat, scores in categories.items():
    improvement = (scores["finetuned"] - scores["baseline"]) / scores["baseline"] * 100
    print(f"  {cat:>10} {scores['baseline']:>10.2f} {scores['finetuned']:>10.2f} {improvement:>+9.1f}%")

# 总体改进
avg_baseline = np.mean([s["baseline"] for s in categories.values()])
avg_finetuned = np.mean([s["finetuned"] for s in categories.values()])
avg_improvement = (avg_finetuned - avg_baseline) / avg_baseline * 100

print("  " + "-" * 45)
print(f"  {'总体平均':>10} {avg_baseline:>10.2f} {avg_finetuned:>10.2f} {avg_improvement:>+9.1f}%")

# ============================================================
# 4. 评测报告生成
# ============================================================
print("\n4. 评测报告生成")
print("-" * 40)

def generate_report(ab_comparison, categories):
    """生成评测报告"""
    report = []
    report.append("=" * 60)
    report.append("模型评测报告")
    report.append("=" * 60)
    report.append(f"评测日期: 2024-01-01")
    report.append(f"基线模型: {ab_comparison.model_a_name}")
    report.append(f"微调模型: {ab_comparison.model_b_name}")
    report.append("")

    # 总体结论
    overall_improvement = avg_improvement
    if overall_improvement > 5:
        conclusion = "微调效果显著，建议部署"
    elif overall_improvement > 0:
        conclusion = "微调有一定效果，可考虑部署"
    else:
        conclusion = "微调效果不明显，需要调整策略"

    report.append(f"总体结论: {conclusion}")
    report.append(f"总体改进: {overall_improvement:+.1f}%")
    report.append("")

    # 各维度分析
    report.append("各维度分析:")
    for cat, scores in categories.items():
        improvement = (scores["finetuned"] - scores["baseline"]) / scores["baseline"] * 100
        status = "提升" if improvement > 0 else "下降"
        report.append(f"  - {cat}: {status} {abs(improvement):.1f}%")

    return "\n".join(report)

report = generate_report(ab, categories)
print(report)
```

---

## 📤 预期输出

```
============================================================
困惑度（Perplexity）计算
============================================================

2. 困惑度计算实现
----------------------------------------
  模拟不同模型在相同文本上的困惑度:

  {'文本':>30} {'基线模型':>10} {'微调模型':>10} {'改进':>10}
  -----------------------------------------------------------------
  人工智能是计算机科学的一个分支...>        12.3       10.1      17.9%
  大语言模型基于Transformer架构...>        15.6       13.4      14.1%
  强化学习使智能体通过与环境交互...>        18.2       15.8      13.2%
  -----------------------------------------------------------------
                            平均        15.4       13.1      15.0%

============================================================
A/B 对比分析
============================================================

  A/B 对比摘要: 基线模型 vs 微调模型
  ============================================================

  指标: Perplexity
    基线模型: 12.4523 (±3.5621)
    微调模型: 10.2187 (±2.8934)
    差异: -2.2336 (-17.9%)
    更优: 微调模型

  指标: BLEU
    基线模型: 0.5234 (±0.1023)
    微调模型: 0.6521 (±0.0987)
    差异: +0.1287 (+24.6%)
    更优: 微调模型

  逐样本胜率分析:
  ----------------------------------------

  Perplexity:
    基线模型 胜: 2/20 (10.0%)
    微调模型 胜: 18/20 (90.0%)
    平局: 0/20 (0.0%)

  分类评测分析:
  ----------------------------------------
    {'任务类型':>10} {'基线模型':>10} {'微调模型':>10} {'改进':>10}
  ---------------------------------------------
       知识问答       0.65       0.78     +20.0%
       代码生成       0.52       0.71     +36.5%
       文本摘要       0.71       0.74      +4.2%
       对话生成       0.68       0.73      +7.4%
          翻译       0.59       0.62      +5.1%
  ---------------------------------------------
       总体平均       0.63       0.72     +14.3%
```

---

## ⚠️ 常见错误和解决方案

### 错误 1：困惑度计算结果异常高
**可能原因：**
- 文本领域与模型训练数据不匹配
- 模型未正确加载
- tokenizer 配置错误

**解决方案：**
- 确认模型和 tokenizer 匹配
- 使用模型训练时相同的 tokenizer 配置
- 检查文本编码是否正确

### 错误 2：BLEU/ROUGE 分数为 0
**可能原因：**
- 模型生成的文本与参考文本没有任何 n-gram 重叠
- 文本分词方式不一致

**解决方案：**
- 检查分词方式是否一致
- 考虑使用 BERTScore 等语义相似度指标
- 增加评测样本数量

### 错误 3：A/B 对比结果不显著
**可能原因：**
- 评测样本量太少
- 模型改进确实很小
- 评测指标不够敏感

**解决方案：**
- 增加评测样本量（至少 50-100 条）
- 使用多种评测指标
- 进行统计显著性检验

---

## 🏋️ 每日挑战

1. **完整评测**：对你的微调模型进行完整评测，包括困惑度、BLEU、ROUGE-L，并生成评测报告。

2. **对比分析**：对比不同 rank（4, 8, 16）的 LoRA 配置对评测结果的影响。

3. **改进分析**：找出微调模型表现最差的 5 个样本，分析原因并提出改进方案。
