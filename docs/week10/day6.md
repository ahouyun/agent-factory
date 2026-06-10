# 📅 Week 10 Day 6：评测微调效果 + 对比分析

## 🧭 今日方向
> 学习如何科学地评估微调效果，掌握评测指标、对比分析方法，以及如何从评测结果中发现问题。

## 🎯 生活比喻
> 评测微调效果就像给学生考试。你教了他一个月（微调），现在要出一套试卷（评测集）来检验学习效果。考试不能只看总分（整体准确率），还要看各科成绩（分维度评估）、错题分析（bad case 分析）、和之前的成绩对比（baseline 对比）。这样才能知道哪里教得好，哪里还需要加强。

## 📋 今日三件事
1. 掌握微调效果的评测指标（自动指标 + 人工指标）
2. 学习如何设计对比实验（baseline 对比、消融实验）
3. 实现一个完整的评测 pipeline

## 🗺️ 手把手路线

### Step 1：理解评测指标
- 做什么: 学习常用的评测指标（准确率、BLEU、ROUGE、困惑度等）
- 为什么: 没有指标就无法量化微调效果
- 成功标志: 能解释每个指标的含义和适用场景

### Step 2：设计评测集
- 做什么: 学习如何构造高质量的评测集
- 为什么: 评测集质量决定评测结果的可信度
- 成功标志: 能设计一个包含 50+ 样本的评测集

### Step 3：对比实验设计
- 做什么: 学习 baseline 对比和消融实验的设计方法
- 为什么: 对比才能看出改进效果
- 成功标志: 能设计一个完整的对比实验方案

### Step 4：代码实践
- 做什么: 实现完整的评测 pipeline
- 为什么: 代码是最好的理解方式
- 成功标志: 代码跑通并输出评测报告

## 💻 代码区

```python
"""
微调效果评测 + 对比分析
包含多种评测指标、对比实验、bad case 分析
"""
import torch
import torch.nn.functional as F
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import json
from collections import Counter
import re

# ========== 1. 评测指标 ==========

class MetricsCalculator:
    """评测指标计算器"""
    
    @staticmethod
    def accuracy(predictions: List[str], references: List[str]) -> float:
        """准确率：完全匹配的比例"""
        correct = sum(1 for p, r in zip(predictions, references) if p.strip() == r.strip())
        return correct / len(predictions)
    
    @staticmethod
    def partial_accuracy(predictions: List[str], references: List[str], threshold: float = 0.8) -> float:
        """部分准确率：包含关键信息的比例"""
        correct = 0
        for pred, ref in zip(predictions, references):
            # 检查预测是否包含参考答案的关键部分
            ref_keywords = set(ref.split())
            pred_keywords = set(pred.split())
            if len(ref_keywords) > 0:
                overlap = len(ref_keywords & pred_keywords) / len(ref_keywords)
                if overlap >= threshold:
                    correct += 1
        return correct / len(predictions)
    
    @staticmethod
    def bleu_score(prediction: str, reference: str, max_n: int = 4) -> float:
        """BLEU 分数：机器翻译常用指标"""
        pred_tokens = prediction.split()
        ref_tokens = reference.split()
        
        if len(pred_tokens) == 0 or len(ref_tokens) == 0:
            return 0.0
        
        # 计算各阶 n-gram 精度
        precisions = []
        for n in range(1, max_n + 1):
            pred_ngrams = Counter([tuple(pred_tokens[i:i+n]) for i in range(len(pred_tokens)-n+1)])
            ref_ngrams = Counter([tuple(ref_tokens[i:i+n]) for i in range(len(ref_tokens)-n+1)])
            
            # 计算匹配数
            matches = 0
            for ngram, count in pred_ngrams.items():
                matches += min(count, ref_ngrams.get(ngram, 0))
            
            # 精度
            total = sum(pred_ngrams.values())
            precision = matches / total if total > 0 else 0
            precisions.append(precision)
        
        # 几何平均
        if min(precisions) == 0:
            return 0.0
        
        log_avg = sum(np.log(p) for p in precisions) / len(precisions)
        bleu = np.exp(log_avg)
        
        # 长度惩罚
        bp = min(1.0, np.exp(1 - len(ref_tokens) / max(len(pred_tokens), 1)))
        
        return bp * bleu
    
    @staticmethod
    def rouge_l(prediction: str, reference: str) -> float:
        """ROUGE-L：最长公共子序列"""
        pred_tokens = prediction.split()
        ref_tokens = reference.split()
        
        # 计算 LCS 长度
        lcs_length = MetricsCalculator._lcs_length(pred_tokens, ref_tokens)
        
        # 计算 precision 和 recall
        precision = lcs_length / len(pred_tokens) if len(pred_tokens) > 0 else 0
        recall = lcs_length / len(ref_tokens) if len(ref_tokens) > 0 else 0
        
        # F1 分数
        if precision + recall == 0:
            return 0.0
        
        f1 = 2 * precision * recall / (precision + recall)
        return f1
    
    @staticmethod
    def _lcs_length(x: List, y: List) -> int:
        """计算最长公共子序列长度"""
        m, n = len(x), len(y)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if x[i-1] == y[j-1]:
                    dp[i][j] = dp[i-1][j-1] + 1
                else:
                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
        
        return dp[m][n]
    
    @staticmethod
    def perplexity(model, tokenizer_func, text: str) -> float:
        """困惑度：语言模型常用指标"""
        tokens = tokenizer_func(text)
        if len(tokens) < 2:
            return float('inf')
        
        # 计算交叉熵
        with torch.no_grad():
            input_ids = torch.tensor([tokens[:-1]], dtype=torch.long)
            target_ids = torch.tensor([tokens[1:]], dtype=torch.long)
            
            # 这里需要实际的模型，这里用随机概率模拟
            logits = torch.randn(1, len(tokens)-1, 1000)
            loss = F.cross_entropy(logits.view(-1, 1000), target_ids.view(-1))
            
            # 困惑度 = exp(交叉熵)
            ppl = torch.exp(loss).item()
        
        return ppl
    
    @staticmethod
    def factual_consistency(predictions: List[str], references: List[str]) -> float:
        """事实一致性：基于关键词匹配的简化版"""
        consistent = 0
        for pred, ref in zip(predictions, references):
            # 提取数字、专有名词等关键信息
            pred_facts = set(re.findall(r'\d+|[A-Z][a-z]+', pred))
            ref_facts = set(re.findall(r'\d+|[A-Z][a-z]+', ref))
            
            if len(ref_facts) == 0:
                consistent += 1
            elif len(pred_facts & ref_facts) / len(ref_facts) >= 0.5:
                consistent += 1
        
        return consistent / len(predictions)


# ========== 2. 评测集管理 ==========

@dataclass
class EvalSample:
    """评测样本"""
    id: str
    instruction: str
    input: str
    expected_output: str
    category: str
    difficulty: str  # easy, medium, hard
    metadata: Dict = None


class EvalDataset:
    """评测数据集"""
    def __init__(self):
        self.samples: List[EvalSample] = []
    
    def add_sample(self, sample: EvalSample):
        self.samples.append(sample)
    
    def get_by_category(self, category: str) -> List[EvalSample]:
        return [s for s in self.samples if s.category == category]
    
    def get_by_difficulty(self, difficulty: str) -> List[EvalSample]:
        return [s for s in self.samples if s.difficulty == difficulty]
    
    def summary(self) -> Dict:
        categories = Counter(s.category for s in self.samples)
        difficulties = Counter(s.difficulty for s in self.samples)
        return {
            "total": len(self.samples),
            "categories": dict(categories),
            "difficulties": dict(difficulties)
        }


def create_eval_dataset() -> EvalDataset:
    """创建评测数据集"""
    dataset = EvalDataset()
    
    samples = [
        EvalSample(
            id="eval_001",
            instruction="请用一句话解释什么是机器学习",
            input="",
            expected_output="机器学习是让计算机从数据中自动学习规律并做出预测的方法。",
            category="概念解释",
            difficulty="easy"
        ),
        EvalSample(
            id="eval_002",
            instruction="请将以下英文翻译成中文",
            input="The weather is nice today.",
            expected_output="今天天气很好。",
            category="翻译",
            difficulty="easy"
        ),
        EvalSample(
            id="eval_003",
            instruction="请解释什么是 RESTful API",
            input="",
            expected_output="RESTful API 是一种遵循 REST 架构风格的 Web API，使用 HTTP 方法进行资源操作。",
            category="概念解释",
            difficulty="medium"
        ),
        EvalSample(
            id="eval_004",
            instruction="请用 SQL 查询所有年龄大于 25 的用户",
            input="表名: users, 字段: name, age",
            expected_output="SELECT * FROM users WHERE age > 25;",
            category="代码生成",
            difficulty="medium"
        ),
        EvalSample(
            id="eval_005",
            instruction="请将列表去重并排序",
            input="[3, 1, 4, 1, 5, 9, 2, 6, 5]",
            expected_output="sorted(set([3, 1, 4, 1, 5, 9, 2, 6, 5]))",
            category="代码生成",
            difficulty="medium"
        ),
        EvalSample(
            id="eval_006",
            instruction="请总结以下技术文档的核心要点",
            input="Docker 是一个开源的容器化平台，它允许开发者将应用程序及其依赖打包到一个轻量级、可移植的容器中。容器可以在任何支持 Docker 的环境中运行，确保了应用的一致性。",
            expected_output="Docker 是容器化平台，用于打包应用和依赖到可移植容器中，确保环境一致性。",
            category="文本摘要",
            difficulty="hard"
        ),
        EvalSample(
            id="eval_007",
            instruction="请设计一个用户认证系统的数据库表结构",
            input="需要支持邮箱注册、密码登录、记住我功能",
            expected_output="需要 users 表（id, email, password_hash, created_at）和 sessions 表（id, user_id, token, expires_at）",
            category="系统设计",
            difficulty="hard"
        ),
        EvalSample(
            id="eval_008",
            instruction="请比较 MySQL 和 PostgreSQL 的主要区别",
            input="",
            expected_output="MySQL 轻量易用适合 Web 应用；PostgreSQL 功能强大支持复杂查询和 JSON",
            category="对比分析",
            difficulty="hard"
        ),
    ]
    
    for sample in samples:
        dataset.add_sample(sample)
    
    return dataset


# ========== 3. 评测器 ==========

class ModelEvaluator:
    """模型评测器"""
    
    def __init__(self, model, tokenizer_func=None):
        self.model = model
        self.tokenizer_func = tokenizer_func
        self.metrics = MetricsCalculator()
    
    def generate_response(self, instruction: str, input_text: str = "") -> str:
        """生成模型回答"""
        # 构造 prompt
        if input_text:
            prompt = f"### 指令:\n{instruction}\n### 输入:\n{input_text}\n### 回答:\n"
        else:
            prompt = f"### 指令:\n{instruction}\n### 回答:\n"
        
        # 简化：返回模拟的生成结果
        # 实际应用中应该调用模型生成
        responses = {
            "请用一句话解释什么是机器学习": "机器学习是让计算机从数据中自动学习规律的方法。",
            "请将以下英文翻译成中文": "今天天气很好。",
            "请解释什么是 RESTful API": "RESTful API 是遵循 REST 风格的 Web API。",
            "请用 SQL 查询所有年龄大于 25 的用户": "SELECT * FROM users WHERE age > 25;",
            "请将列表去重并排序": "sorted(set([3, 1, 4, 1, 5, 9, 2, 6, 5]))",
        }
        
        return responses.get(instruction, "模拟生成的回答。")
    
    def evaluate_single(self, sample: EvalSample) -> Dict:
        """评测单个样本"""
        prediction = self.generate_response(sample.instruction, sample.input)
        
        results = {
            "id": sample.id,
            "instruction": sample.instruction[:50],
            "prediction": prediction,
            "reference": sample.expected_output,
            "category": sample.category,
            "difficulty": sample.difficulty,
            "metrics": {}
        }
        
        # 计算各指标
        results["metrics"]["accuracy"] = 1.0 if prediction.strip() == sample.expected_output.strip() else 0.0
        results["metrics"]["bleu"] = self.metrics.bleu_score(prediction, sample.expected_output)
        results["metrics"]["rouge_l"] = self.metrics.rouge_l(prediction, sample.expected_output)
        
        return results
    
    def evaluate_dataset(self, dataset: EvalDataset) -> Dict:
        """评测整个数据集"""
        all_results = []
        
        for sample in dataset.samples:
            result = self.evaluate_single(sample)
            all_results.append(result)
        
        # 汇总统计
        summary = {
            "total_samples": len(all_results),
            "overall": {},
            "by_category": {},
            "by_difficulty": {}
        }
        
        # 整体指标
        accuracies = [r["metrics"]["accuracy"] for r in all_results]
        bleus = [r["metrics"]["bleu"] for r in all_results]
        rouges = [r["metrics"]["rouge_l"] for r in all_results]
        
        summary["overall"] = {
            "accuracy": np.mean(accuracies),
            "bleu": np.mean(bleus),
            "rouge_l": np.mean(rouges)
        }
        
        # 按类别统计
        categories = set(r["category"] for r in all_results)
        for category in categories:
            cat_results = [r for r in all_results if r["category"] == category]
            summary["by_category"][category] = {
                "count": len(cat_results),
                "accuracy": np.mean([r["metrics"]["accuracy"] for r in cat_results]),
                "bleu": np.mean([r["metrics"]["bleu"] for r in cat_results])
            }
        
        # 按难度统计
        difficulties = set(r["difficulty"] for r in all_results)
        for difficulty in difficulties:
            diff_results = [r for r in all_results if r["difficulty"] == difficulty]
            summary["by_difficulty"][difficulty] = {
                "count": len(diff_results),
                "accuracy": np.mean([r["metrics"]["accuracy"] for r in diff_results]),
                "bleu": np.mean([r["metrics"]["bleu"] for r in diff_results])
            }
        
        return {"results": all_results, "summary": summary}


# ========== 4. Bad Case 分析 ==========

class BadCaseAnalyzer:
    """Bad Case 分析器"""
    
    def __init__(self, results: List[Dict]):
        self.results = results
        self.bad_cases = [r for r in results if r["metrics"]["accuracy"] == 0]
    
    def analyze(self) -> Dict:
        """分析 bad cases"""
        analysis = {
            "total_bad_cases": len(self.bad_cases),
            "bad_case_ratio": len(self.bad_cases) / len(self.results) if self.results else 0,
            "by_category": {},
            "by_difficulty": {},
            "common_patterns": []
        }
        
        # 按类别统计
        for case in self.bad_cases:
            cat = case["category"]
            if cat not in analysis["by_category"]:
                analysis["by_category"][cat] = []
            analysis["by_category"][cat].append(case)
        
        # 按难度统计
        for case in self.bad_cases:
            diff = case["difficulty"]
            if diff not in analysis["by_difficulty"]:
                analysis["by_difficulty"][diff] = []
            analysis["by_difficulty"][diff].append(case)
        
        # 分析常见模式
        patterns = []
        for case in self.bad_cases:
            pred = case["prediction"]
            ref = case["reference"]
            
            if len(pred) < len(ref) * 0.5:
                patterns.append("回答过短")
            elif len(pred) > len(ref) * 2:
                patterns.append("回答过长")
            elif not any(word in pred for word in ref.split()[:3]):
                patterns.append("关键信息缺失")
            else:
                patterns.append("表达不准确")
        
        analysis["common_patterns"] = list(Counter(patterns).items())
        
        return analysis
    
    def generate_report(self) -> str:
        """生成 bad case 分析报告"""
        analysis = self.analyze()
        
        report = f"""
Bad Case 分析报告
================

总样本数: {len(self.results)}
Bad Case 数: {analysis['total_bad_cases']}
Bad Case 比例: {analysis['bad_case_ratio']*100:.1f}%

按类别分布:
"""
        for cat, cases in analysis["by_category"].items():
            report += f"  - {cat}: {len(cases)} 个\n"
        
        report += "\n按难度分布:\n"
        for diff, cases in analysis["by_difficulty"].items():
            report += f"  - {diff}: {len(cases)} 个\n"
        
        report += "\n常见问题模式:\n"
        for pattern, count in analysis["common_patterns"]:
            report += f"  - {pattern}: {count} 次\n"
        
        report += "\nBad Case 示例:\n"
        for case in self.bad_cases[:3]:
            report += f"\n  ID: {case['id']}"
            report += f"\n  指令: {case['instruction'][:50]}..."
            report += f"\n  期望: {case['reference'][:50]}..."
            report += f"\n  实际: {case['prediction'][:50]}..."
            report += f"\n  BLEU: {case['metrics']['bleu']:.3f}"
            report += "\n"
        
        return report


# ========== 5. 对比实验 ==========

class ComparisonExperiment:
    """对比实验"""
    
    def __init__(self):
        self.results = {}
    
    def add_model_result(self, model_name: str, eval_result: Dict):
        """添加模型评测结果"""
        self.results[model_name] = eval_result
    
    def compare(self) -> Dict:
        """对比各模型"""
        comparison = {
            "models": list(self.results.keys()),
            "metrics": {},
            "best_model": {}
        }
        
        # 提取各指标
        metrics = ["accuracy", "bleu", "rouge_l"]
        for metric in metrics:
            comparison["metrics"][metric] = {}
            for model_name, result in self.results.items():
                if "summary" in result:
                    comparison["metrics"][metric][model_name] = result["summary"]["overall"].get(metric, 0)
        
        # 找出最佳模型
        for metric in metrics:
            if comparison["metrics"][metric]:
                best_model = max(comparison["metrics"][metric].items(), key=lambda x: x[1])
                comparison["best_model"][metric] = best_model[0]
        
        return comparison
    
    def generate_comparison_report(self) -> str:
        """生成对比报告"""
        comparison = self.compare()
        
        report = f"""
模型对比报告
============

对比模型: {', '.join(comparison['models'])}

指标对比:
"""
        for metric, scores in comparison["metrics"].items():
            report += f"\n{metric.upper()}:\n"
            for model_name, score in scores.items():
                report += f"  - {model_name}: {score:.4f}\n"
        
        report += "\n最佳模型:\n"
        for metric, model_name in comparison["best_model"].items():
            report += f"  - {metric}: {model_name}\n"
        
        return report


# ========== 6. 主函数 ==========

def main():
    """主函数：完整的评测流程"""
    print("=" * 60)
    print("微调效果评测 + 对比分析")
    print("=" * 60)
    
    # 1. 创建评测集
    print("\n1. 创建评测数据集...")
    eval_dataset = create_eval_dataset()
    summary = eval_dataset.summary()
    print(f"   总样本数: {summary['total']}")
    print(f"   类别分布: {summary['categories']}")
    print(f"   难度分布: {summary['difficulties']}")
    
    # 2. 评测模型
    print("\n2. 评测微调模型...")
    evaluator = ModelEvaluator(None)  # 实际应用中传入真实模型
    eval_result = evaluator.evaluate_dataset(eval_dataset)
    
    print(f"\n   整体指标:")
    for metric, value in eval_result["summary"]["overall"].items():
        print(f"     {metric}: {value:.4f}")
    
    print(f"\n   按类别指标:")
    for category, metrics in eval_result["summary"]["by_category"].items():
        print(f"     {category}: accuracy={metrics['accuracy']:.4f}, bleu={metrics['bleu']:.4f}")
    
    print(f"\n   按难度指标:")
    for difficulty, metrics in eval_result["summary"]["by_difficulty"].items():
        print(f"     {difficulty}: accuracy={metrics['accuracy']:.4f}, bleu={metrics['bleu']:.4f}")
    
    # 3. Bad Case 分析
    print("\n3. Bad Case 分析...")
    analyzer = BadCaseAnalyzer(eval_result["results"])
    report = analyzer.generate_report()
    print(report)
    
    # 4. 对比实验
    print("\n4. 对比实验...")
    experiment = ComparisonExperiment()
    experiment.add_model_result("微调模型", eval_result)
    
    # 添加 baseline（模拟）
    baseline_result = {
        "summary": {
            "overall": {
                "accuracy": 0.3,
                "bleu": 0.25,
                "rouge_l": 0.28
            }
        }
    }
    experiment.add_model_result("Baseline", baseline_result)
    
    comparison_report = experiment.generate_comparison_report()
    print(comparison_report)
    
    # 5. 保存结果
    print("\n5. 保存评测结果...")
    save_data = {
        "eval_summary": eval_result["summary"],
        "comparison": experiment.compare(),
        "bad_cases": [r for r in eval_result["results"] if r["metrics"]["accuracy"] == 0]
    }
    
    # 实际应用中可以保存为 JSON
    # with open("eval_results.json", "w") as f:
    #     json.dump(save_data, f, ensure_ascii=False, indent=2)
    
    print("   评测结果已准备就绪")
    
    print("\n" + "=" * 60)
    print("评测完成！")
    print("=" * 60)
    
    return eval_result


if __name__ == "__main__":
    result = main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 评测指标都很低 | 检查训练数据质量，增加训练轮数 |
| 2 | BLEU 分数高但效果差 | 结合人工评测，使用更多指标 |
| 3 | Bad case 太多 | 分析失败模式，针对性增加训练数据 |
| 4 | 对比实验不公平 | 确保超参数一致，使用相同评测集 |
| 5 | 评测集太小 | 增加样本数量，确保覆盖各类场景 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| BLEU | 基于 n-gram 精度的机器翻译评测指标 |
| ROUGE | 基于召回率的文本摘要评测指标 |
| Perplexity | 语言模型困惑度，越低越好 |
| Bad Case | 模型预测错误的样本 |
| Ablation Study | 消融实验，逐一移除组件看影响 |
| Baseline | 对比实验中的基准模型 |
| Factual Consistency | 生成内容与事实的一致性 |
| Human Evaluation | 人工评测，最可靠的评估方式 |

## ✅ 验收清单
- [ ] 能解释 BLEU、ROUGE、困惑度等指标
- [ ] 能设计一个完整的评测集
- [ ] 能进行 bad case 分析
- [ ] 能设计对比实验
- [ ] 代码能跑通并输出评测报告

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
