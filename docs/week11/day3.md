# 📅 Week 11 Day 3：自动化评估 Pipeline 设计

## 🧭 今日方向
> 学习如何设计可复用、可扩展的自动化评估 Pipeline，实现从数据准备到结果报告的全流程自动化。

## 🎯 生活比喻
> 自动化评估 Pipeline 就像工厂的流水线。原材料（评测数据）进去，经过一道道工序（预处理、模型推理、指标计算），成品（评测报告）出来。好的流水线要能自动运行、易于扩展、出错时能快速定位问题。

## 📋 今日三件事
1. 设计评估 Pipeline 的整体架构
2. 实现数据准备、模型推理、指标计算等模块
3. 构建可配置的评估流程

## 🗺️ 手把手路线

### Step 1：理解 Pipeline 架构
- 做什么: 学习评估 Pipeline 的模块化设计
- 为什么: 模块化才能复用和扩展
- 成功标志: 能画出 Pipeline 架构图

### Step 2：数据准备模块
- 做什么: 实现评测数据的加载和预处理
- 为什么: 数据是评估的基础
- 成功标志: 能加载和预处理评测数据

### Step 3：推理模块
- 做什么: 实现模型推理的封装
- 为什么: 统一的推理接口便于对比
- 成功标志: 能调用不同模型进行推理

### Step 4：评估报告生成
- 做什么: 实现评测结果的汇总和报告生成
- 为什么: 清晰的报告便于分析
- 成功标志: 能生成结构化的评测报告

## 💻 代码区

```python
"""
自动化评估 Pipeline 设计
模块化、可配置、可扩展
"""
from dataclasses import dataclass, field
from typing import List, Dict, Any, Callable, Optional
from enum import Enum
import json
import time
from datetime import datetime

# ========== 1. 配置管理 ==========

@dataclass
class PipelineConfig:
    """Pipeline 配置"""
    name: str
    version: str = "1.0"
    model_name: str = "default"
    max_samples: int = 100
    batch_size: int = 32
    timeout: float = 300.0  # 秒
    output_dir: str = "./eval_results"
    metrics: List[str] = field(default_factory=lambda: ["accuracy", "f1"])
    verbose: bool = True


@dataclass
class ModelConfig:
    """模型配置"""
    name: str
    model_type: str  # api, local, huggingface
    endpoint: str = ""
    api_key: str = ""
    model_path: str = ""
    max_tokens: int = 1000
    temperature: float = 0.7


# ========== 2. 数据模块 ==========

class DataModule:
    """数据准备模块"""
    
    def __init__(self):
        self.datasets: Dict[str, List[Dict]] = {}
    
    def load_dataset(self, name: str, data: List[Dict]):
        """加载数据集"""
        self.datasets[name] = data
        return self
    
    def preprocess(self, dataset_name: str, preprocess_func: Callable) -> List[Dict]:
        """预处理数据"""
        if dataset_name not in self.datasets:
            raise ValueError(f"Dataset {dataset_name} not found")
        
        processed = []
        for sample in self.datasets[dataset_name]:
            try:
                processed_sample = preprocess_func(sample)
                processed.append(processed_sample)
            except Exception as e:
                print(f"Preprocessing error: {e}")
                continue
        
        self.datasets[dataset_name] = processed
        return processed
    
    def split(self, dataset_name: str, train_ratio: float = 0.8) -> tuple:
        """分割数据集"""
        data = self.datasets[dataset_name]
        split_idx = int(len(data) * train_ratio)
        return data[:split_idx], data[split_idx:]
    
    def get_batch(self, dataset_name: str, batch_size: int, start: int = 0) -> List[Dict]:
        """获取批次数据"""
        data = self.datasets[dataset_name]
        return data[start:start + batch_size]


# ========== 3. 推理模块 ==========

class InferenceModule:
    """推理模块"""
    
    def __init__(self, model_config: ModelConfig):
        self.config = model_config
        self.call_count = 0
        self.total_tokens = 0
    
    def predict(self, input_data: Dict) -> Dict:
        """单条预测"""
        self.call_count += 1
        
        # 模拟推理（实际应用中调用真实模型）
        prompt = input_data.get("prompt", "")
        response = f"模拟回答: {prompt[:20]}..."
        
        # 模拟 token 统计
        tokens = len(prompt.split()) + len(response.split())
        self.total_tokens += tokens
        
        return {
            "input": prompt,
            "output": response,
            "tokens_used": tokens,
            "latency": 0.1  # 模拟延迟
        }
    
    def batch_predict(self, batch_data: List[Dict]) -> List[Dict]:
        """批量预测"""
        results = []
        for sample in batch_data:
            result = self.predict(sample)
            results.append(result)
        return results
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        return {
            "total_calls": self.call_count,
            "total_tokens": self.total_tokens,
            "avg_tokens_per_call": self.total_tokens / max(self.call_count, 1)
        }


# ========== 4. 评估指标模块 ==========

class MetricsModule:
    """评估指标模块"""
    
    def __init__(self, metric_names: List[str]):
        self.metric_names = metric_names
        self.results: List[Dict] = []
    
    def compute_metrics(self, predictions: List[str], references: List[str]) -> Dict[str, float]:
        """计算所有指标"""
        metrics = {}
        
        for metric_name in self.metric_names:
            if metric_name == "accuracy":
                metrics["accuracy"] = self._accuracy(predictions, references)
            elif metric_name == "f1":
                metrics["f1"] = self._f1(predictions, references)
            elif metric_name == "precision":
                metrics["precision"] = self._precision(predictions, references)
            elif metric_name == "recall":
                metrics["recall"] = self._recall(predictions, references)
            elif metric_name == "bleu":
                metrics["bleu"] = self._bleu(predictions, references)
            elif metric_name == "rouge":
                metrics["rouge"] = self._rouge(predictions, references)
        
        return metrics
    
    def _accuracy(self, predictions: List[str], references: List[str]) -> float:
        correct = sum(1 for p, r in zip(predictions, references) if p.strip() == r.strip())
        return correct / max(len(predictions), 1)
    
    def _f1(self, predictions: List[str], references: List[str]) -> float:
        # 简化的 F1 计算
        tp = sum(1 for p, r in zip(predictions, references) if p.strip() == r.strip())
        fp = len(predictions) - tp
        fn = len(references) - tp
        
        precision = tp / max(tp + fp, 1)
        recall = tp / max(tp + fn, 1)
        f1 = 2 * precision * recall / max(precision + recall, 1e-10)
        return f1
    
    def _precision(self, predictions: List[str], references: List[str]) -> float:
        tp = sum(1 for p, r in zip(predictions, references) if p.strip() == r.strip())
        return tp / max(len(predictions), 1)
    
    def _recall(self, predictions: List[str], references: List[str]) -> float:
        tp = sum(1 for p, r in zip(predictions, references) if p.strip() == r.strip())
        return tp / max(len(references), 1)
    
    def _bleu(self, predictions: List[str], references: List[str]) -> float:
        # 简化的 BLEU 计算
        scores = []
        for pred, ref in zip(predictions, references):
            pred_tokens = pred.split()
            ref_tokens = ref.split()
            if not pred_tokens or not ref_tokens:
                scores.append(0.0)
                continue
            # 一元精度
            matches = sum(1 for t in pred_tokens if t in ref_tokens)
            scores.append(matches / len(pred_tokens))
        return sum(scores) / max(len(scores), 1)
    
    def _rouge(self, predictions: List[str], references: List[str]) -> float:
        # 简化的 ROUGE-L 计算
        scores = []
        for pred, ref in zip(predictions, references):
            pred_tokens = pred.split()
            ref_tokens = ref.split()
            if not pred_tokens or not ref_tokens:
                scores.append(0.0)
                continue
            # 简化的 LCS
            lcs_len = len(set(pred_tokens) & set(ref_tokens))
            scores.append(lcs_len / max(len(ref_tokens), 1))
        return sum(scores) / max(len(scores), 1)


# ========== 5. 报告生成模块 ==========

class ReportModule:
    """报告生成模块"""
    
    def __init__(self):
        self.report_data: Dict = {}
    
    def generate_report(
        self,
        config: PipelineConfig,
        eval_results: List[Dict],
        model_stats: Dict,
        metrics_summary: Dict
    ) -> Dict:
        """生成评估报告"""
        report = {
            "meta": {
                "pipeline_name": config.name,
                "version": config.version,
                "timestamp": datetime.now().isoformat(),
                "model": config.model_name
            },
            "summary": {
                "total_samples": len(eval_results),
                "metrics": metrics_summary,
                "model_stats": model_stats
            },
            "details": eval_results,
            "analysis": self._analyze_results(eval_results, metrics_summary)
        }
        
        self.report_data = report
        return report
    
    def _analyze_results(self, results: List[Dict], metrics: Dict) -> Dict:
        """分析结果"""
        correct = sum(1 for r in results if r.get("correct", False))
        incorrect = len(results) - correct
        
        # 错误类型分析
        error_types = {}
        for r in results:
            if not r.get("correct", False):
                error_type = r.get("error_type", "unknown")
                error_types[error_type] = error_types.get(error_type, 0) + 1
        
        return {
            "correct_count": correct,
            "incorrect_count": incorrect,
            "error_distribution": error_types,
            "recommendations": self._generate_recommendations(metrics, error_types)
        }
    
    def _generate_recommendations(self, metrics: Dict, error_types: Dict) -> List[str]:
        """生成改进建议"""
        recommendations = []
        
        if metrics.get("accuracy", 0) < 0.7:
            recommendations.append("考虑增加训练数据或调整模型参数")
        
        if metrics.get("f1", 0) < 0.6:
            recommendations.append("模型在精确率和召回率之间存在不平衡")
        
        if error_types.get("timeout", 0) > len(error_types) * 0.3:
            recommendations.append("增加超时时间或优化推理速度")
        
        return recommendations
    
    def save_report(self, filepath: str):
        """保存报告"""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.report_data, f, ensure_ascii=False, indent=2)
    
    def print_summary(self):
        """打印摘要"""
        summary = self.report_data.get("summary", {})
        print(f"\n评估摘要:")
        print(f"  总样本数: {summary.get('total_samples', 0)}")
        print(f"  指标: {json.dumps(summary.get('metrics', {}), indent=4)}")
        print(f"  模型统计: {json.dumps(summary.get('model_stats', {}), indent=4)}")


# ========== 6. Pipeline 编排器 ==========

class EvalPipeline:
    """评估 Pipeline 编排器"""
    
    def __init__(self, config: PipelineConfig):
        self.config = config
        self.data_module = DataModule()
        self.metrics_module = MetricsModule(config.metrics)
        self.report_module = ReportModule()
        self.model_module: Optional[InferenceModule] = None
    
    def set_model(self, model_config: ModelConfig) -> 'EvalPipeline':
        """设置模型"""
        self.model_module = InferenceModule(model_config)
        return self
    
    def load_data(self, dataset_name: str, data: List[Dict]) -> 'EvalPipeline':
        """加载数据"""
        self.data_module.load_dataset(dataset_name, data)
        return self
    
    def run(self, dataset_name: str) -> Dict:
        """运行评估"""
        print(f"开始评估: {self.config.name}")
        print(f"模型: {self.config.model_name}")
        print(f"数据集: {dataset_name}")
        
        # 1. 获取数据
        data = self.data_module.datasets.get(dataset_name, [])
        if self.config.max_samples:
            data = data[:self.config.max_samples]
        
        print(f"样本数: {len(data)}")
        
        # 2. 推理
        print("运行推理...")
        predictions = []
        references = []
        eval_results = []
        
        for sample in data:
            # 构造输入
            input_data = {
                "prompt": sample.get("instruction", ""),
                "input": sample.get("input", "")
            }
            
            # 预测
            result = self.model_module.predict(input_data)
            predictions.append(result["output"])
            references.append(sample.get("output", ""))
            
            # 记录结果
            eval_result = {
                "id": sample.get("id", ""),
                "input": input_data["prompt"],
                "prediction": result["output"],
                "reference": sample.get("output", ""),
                "correct": result["output"].strip() == sample.get("output", "").strip(),
                "tokens": result["tokens_used"],
                "latency": result["latency"]
            }
            eval_results.append(eval_result)
        
        # 3. 计算指标
        print("计算指标...")
        metrics = self.metrics_module.compute_metrics(predictions, references)
        
        # 4. 生成报告
        print("生成报告...")
        model_stats = self.model_module.get_stats()
        report = self.report_module.generate_report(
            self.config, eval_results, model_stats, metrics
        )
        
        # 5. 打印摘要
        self.report_module.print_summary()
        
        print(f"\n评估完成！")
        
        return report
    
    def save_results(self, filepath: str):
        """保存结果"""
        self.report_module.save_report(filepath)


# ========== 7. 示例运行 ==========

def create_sample_data() -> List[Dict]:
    """创建示例数据"""
    return [
        {"id": "1", "instruction": "什么是机器学习？", "input": "", "output": "机器学习是让计算机从数据中学习的方法。"},
        {"id": "2", "instruction": "Python 中如何定义函数？", "input": "", "output": "使用 def 关键字定义函数。"},
        {"id": "3", "instruction": "什么是 API？", "input": "", "output": "API 是应用程序编程接口。"},
        {"id": "4", "instruction": "如何在 Python 中读取文件？", "input": "", "output": "使用 open() 函数读取文件。"},
        {"id": "5", "instruction": "什么是数据库索引？", "input": "", "output": "索引是加速数据检索的数据结构。"},
    ]


def main():
    """主函数"""
    print("=" * 60)
    print("自动化评估 Pipeline 演示")
    print("=" * 60)
    
    # 1. 创建配置
    config = PipelineConfig(
        name="Agent评估Pipeline",
        version="1.0",
        model_name="demo-model",
        max_samples=5,
        metrics=["accuracy", "f1", "bleu"]
    )
    
    # 2. 创建模型配置
    model_config = ModelConfig(
        name="demo",
        model_type="local"
    )
    
    # 3. 创建 Pipeline
    pipeline = EvalPipeline(config)
    pipeline.set_model(model_config)
    
    # 4. 加载数据
    sample_data = create_sample_data()
    pipeline.load_data("eval_dataset", sample_data)
    
    # 5. 运行评估
    report = pipeline.run("eval_dataset")
    
    # 6. 保存结果
    pipeline.save_results("eval_report.json")
    
    print("\n" + "=" * 60)
    print("Pipeline 演示完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | Pipeline 运行太慢 | 增加批处理大小，使用异步推理 |
| 2 | 内存不足 | 分批处理数据，及时释放内存 |
| 3 | 指标计算错误 | 检查数据格式，确保指标函数正确 |
| 4 | 报告生成失败 | 检查数据结构，添加异常处理 |
| 5 | 难以扩展新指标 | 使用注册机制，支持动态添加指标 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Pipeline | 评估流程的模块化编排 |
| Data Module | 数据加载和预处理模块 |
| Inference Module | 模型推理封装模块 |
| Metrics Module | 评估指标计算模块 |
| Report Module | 评测报告生成模块 |
| Batch Processing | 批量处理数据提高效率 |
| Config Management | 配置管理，支持灵活配置 |

## ✅ 验收清单
- [ ] 理解 Pipeline 的模块化架构
- [ ] 能配置和运行评估 Pipeline
- [ ] 能生成结构化的评测报告
- [ ] 代码能跑通并输出结果

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
