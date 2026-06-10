# 📅 Week 11 Day 5：LangSmith / Arize Phoenix 实践

## 🧭 今日方向
> 学习使用 LangSmith 和 Arize Phoenix 进行 Agent 可观测性实践，掌握生产级监控工具的使用方法。

## 🎯 生味比喻
> LangSmith 和 Arize Phoenix 就像两个不同的监控中心。LangSmith 像是"调度中心"，专注于 LLM 调用链路的追踪和调试；Arize Phoenix 像是"数据中心"，专注于模型性能的长期监控和漂移检测。两者结合，你就能全面掌控 Agent 的运行状态。

## 📋 今日三件事
1. 了解 LangSmith 的核心功能和使用方法
2. 了解 Arize Phoenix 的核心功能和使用方法
3. 对比两者的特点，选择合适的工具

## 🗺️ 手把手路线

### Step 1：LangSmith 概览
- 做什么: 学习 LangSmith 的追踪、评估、监控功能
- 为什么: LangSmith 是 LangChain 生态的官方监控工具
- 成功标志: 能解释 LangSmith 的核心概念

### Step 2：Arize Phoenix 概览
- 做什么: 学习 Arize Phoenix 的追踪、评估、漂移检测功能
- 为什么: Arize Phoenix 是开源的 LLM 可观测性工具
- 成功标志: 能解释 Arize Phoenix 的核心概念

### Step 3：对比与选择
- 做什么: 对比两个工具的优缺点
- 为什么: 不同场景需要不同的工具
- 成功标志: 能根据需求选择合适的工具

### Step 4：代码实践
- 做什么: 模拟两个工具的核心功能
- 为什么: 代码是最好的理解方式
- 成功标志: 代码跑通

## 💻 代码区

```python
"""
LangSmith / Arize Phoenix 实践
模拟核心功能实现
"""
import time
import uuid
import json
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime
from enum import Enum

# ========== 1. LangSmith 模拟 ==========

class LangSmithRunType(Enum):
    """运行类型"""
    LLM = "llm"
    CHAIN = "chain"
    TOOL = "tool"
    RETRIEVER = "retriever"


@dataclass
class LangSmithRun:
    """LangSmith 运行记录"""
    run_id: str
    run_type: LangSmithRunType
    name: str
    start_time: datetime
    end_time: Optional[datetime] = None
    inputs: Dict = field(default_factory=dict)
    outputs: Dict = field(default_factory=dict)
    error: Optional[str] = None
    metadata: Dict = field(default_factory=dict)
    parent_run_id: Optional[str] = None
    child_runs: List['LangSmithRun'] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)


class LangSmithClient:
    """LangSmith 客户端模拟"""
    
    def __init__(self, project_name: str = "default"):
        self.project_name = project_name
        self.runs: List[LangSmithRun] = []
        self.current_run: Optional[LangSmithRun] = None
    
    def create_run(
        self,
        run_type: LangSmithRunType,
        name: str,
        inputs: Dict = None,
        parent_run_id: Optional[str] = None,
        tags: List[str] = None,
        metadata: Dict = None
    ) -> str:
        """创建运行"""
        run_id = str(uuid.uuid4())
        
        run = LangSmithRun(
            run_id=run_id,
            run_type=run_type,
            name=name,
            start_time=datetime.now(),
            inputs=inputs or {},
            parent_run_id=parent_run_id,
            tags=tags or [],
            metadata=metadata or {}
        )
        
        self.runs.append(run)
        
        if parent_run_id:
            # 添加为子运行
            for r in self.runs:
                if r.run_id == parent_run_id:
                    r.child_runs.append(run)
        
        self.current_run = run
        return run_id
    
    def update_run(
        self,
        run_id: str,
        outputs: Dict = None,
        error: Optional[str] = None,
        metadata: Dict = None
    ):
        """更新运行"""
        for run in self.runs:
            if run.run_id == run_id:
                if outputs:
                    run.outputs = outputs
                if error:
                    run.error = error
                if metadata:
                    run.metadata.update(metadata)
                run.end_time = datetime.now()
                break
    
    def get_run(self, run_id: str) -> Optional[LangSmithRun]:
        """获取运行"""
        for run in self.runs:
            if run.run_id == run_id:
                return run
        return None
    
    def get_runs_by_type(self, run_type: LangSmithRunType) -> List[LangSmithRun]:
        """按类型获取运行"""
        return [r for r in self.runs if r.run_type == run_type]
    
    def get_trace(self, run_id: str) -> List[LangSmithRun]:
        """获取完整追踪"""
        run = self.get_run(run_id)
        if not run:
            return []
        
        trace = [run]
        for child in run.child_runs:
            trace.extend(self.get_trace(child.run_id))
        
        return trace
    
    def feedback(self, run_id: str, score: float, comment: str = ""):
        """添加反馈"""
        run = self.get_run(run_id)
        if run:
            run.metadata["feedback_score"] = score
            run.metadata["feedback_comment"] = comment
    
    def get_project_stats(self) -> Dict:
        """获取项目统计"""
        total_runs = len(self.runs)
        by_type = {}
        for run in self.runs:
            run_type = run.run_type.value
            by_type[run_type] = by_type.get(run_type, 0) + 1
        
        error_runs = sum(1 for r in self.runs if r.error)
        
        return {
            "project": self.project_name,
            "total_runs": total_runs,
            "by_type": by_type,
            "error_runs": error_runs,
            "error_rate": error_runs / max(total_runs, 1)
        }


# ========== 2. Arize Phoenix 模拟 ==========

class MetricType(Enum):
    """指标类型"""
    ACCURACY = "accuracy"
    F1 = "f1"
    LATENCY = "latency"
    TOKEN_USAGE = "token_usage"
    COST = "cost"
    DRIFT = "drift"


@dataclass
class PhoenixTrace:
    """Phoenix 追踪"""
    trace_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    spans: List[Dict] = field(default_factory=list)
    metadata: Dict = field(default_factory=dict)
    labels: Dict[str, str] = field(default_factory=dict)
    embedding: Optional[List[float]] = None


@dataclass
class PhoenixDataset:
    """Phoenix 数据集"""
    dataset_id: str
    name: str
    traces: List[PhoenixTrace] = field(default_factory=list)
    baseline_traces: List[PhoenixTrace] = field(default_factory=list)


class ArizePhoenixClient:
    """Arize Phoenix 客户端模拟"""
    
    def __init__(self, project_name: str = "default"):
        self.project_name = project_name
        self.traces: List[PhoenixTrace] = []
        self.datasets: Dict[str, PhoenixDataset] = {}
        self.metrics_history: List[Dict] = []
    
    def log_trace(self, trace: PhoenixTrace):
        """记录追踪"""
        self.traces.append(trace)
    
    def create_dataset(self, name: str) -> str:
        """创建数据集"""
        dataset_id = str(uuid.uuid4())
        self.datasets[dataset_id] = PhoenixDataset(
            dataset_id=dataset_id,
            name=name
        )
        return dataset_id
    
    def add_to_dataset(self, dataset_id: str, traces: List[PhoenixTrace]):
        """添加追踪到数据集"""
        if dataset_id in self.datasets:
            self.datasets[dataset_id].traces.extend(traces)
    
    def set_baseline(self, dataset_id: str, baseline_traces: List[PhoenixTrace]):
        """设置基线"""
        if dataset_id in self.datasets:
            self.datasets[dataset_id].baseline_traces = baseline_traces
    
    def compute_metric(
        self,
        dataset_id: str,
        metric_type: MetricType,
        metric_func: Callable
    ) -> Dict:
        """计算指标"""
        if dataset_id not in self.datasets:
            return {"error": "Dataset not found"}
        
        dataset = self.datasets[dataset_id]
        current_traces = dataset.traces
        baseline_traces = dataset.baseline_traces
        
        # 计算当前指标
        current_value = metric_func(current_traces)
        
        # 计算基线指标
        baseline_value = metric_func(baseline_traces) if baseline_traces else None
        
        # 计算漂移
        drift = None
        if baseline_value is not None and baseline_value != 0:
            drift = (current_value - baseline_value) / baseline_value
        
        result = {
            "metric": metric_type.value,
            "current_value": current_value,
            "baseline_value": baseline_value,
            "drift": drift,
            "timestamp": datetime.now().isoformat()
        }
        
        self.metrics_history.append(result)
        return result
    
    def detect_drift(
        self,
        dataset_id: str,
        threshold: float = 0.1
    ) -> Dict:
        """检测数据漂移"""
        if dataset_id not in self.datasets:
            return {"error": "Dataset not found"}
        
        dataset = self.datasets[dataset_id]
        
        if not dataset.baseline_traces:
            return {"drift_detected": False, "reason": "No baseline"}
        
        # 简化的漂移检测
        current_count = len(dataset.traces)
        baseline_count = len(dataset.baseline_traces)
        
        count_drift = abs(current_count - baseline_count) / max(baseline_count, 1)
        
        return {
            "drift_detected": count_drift > threshold,
            "count_drift": count_drift,
            "threshold": threshold,
            "current_count": current_count,
            "baseline_count": baseline_count
        }
    
    def get_performance_summary(self) -> Dict:
        """获取性能摘要"""
        if not self.metrics_history:
            return {}
        
        summary = {}
        for metric in self.metrics_history:
            metric_name = metric["metric"]
            if metric_name not in summary:
                summary[metric_name] = []
            summary[metric_name].append(metric["current_value"])
        
        return {
            metric_name: {
                "latest": values[-1],
                "avg": sum(values) / len(values),
                "min": min(values),
                "max": max(values)
            }
            for metric_name, values in summary.items()
        }


# ========== 3. 工具对比 ==========

def compare_tools():
    """对比 LangSmith 和 Arize Phoenix"""
    comparison = """
LangSmith vs Arize Phoenix 对比
================================

1. LangSmith
   - 开发者: LangChain
   - 定位: LLM 应用开发平台
   - 核心功能:
     * 追踪 LangChain 调用链
     * 评估 LLM 输出质量
     * 调试 prompt 问题
     * 版本管理
   - 优势:
     * 与 LangChain 深度集成
     * 易于上手
     * 支持在线评估
   - 劣势:
     * 主要面向 LangChain 生态
     * 高级功能需付费

2. Arize Phoenix
   - 开发者: Arize AI
   - 定位: LLM 可观测性平台
   - 核心功能:
     * 追踪和可视化 LLM 调用
     * 检测数据漂移
     * 评估模型性能
     * 根因分析
   - 优势:
     * 开源且免费
     * 支持多种框架
     * 强大的漂移检测
   - 劣势:
     * 配置相对复杂
     * 文档不如 LangSmith 完善

选择建议:
  - 使用 LangChain → LangSmith
  - 需要漂移检测 → Arize Phoenix
  - 预算有限 → Arize Phoenix (开源)
  - 需要全功能 → 两者结合使用
"""
    print(comparison)


# ========== 4. 实践示例 ==========

def langsmith_practice():
    """LangSmith 实践示例"""
    print("\n1. LangSmith 实践")
    print("-" * 40)
    
    # 创建客户端
    client = LangSmithClient("demo-project")
    
    # 模拟 LLM 调用链
    # 1. 用户输入
    chain_run_id = client.create_run(
        run_type=LangSmithRunType.CHAIN,
        name="qa_chain",
        inputs={"query": "什么是机器学习？"},
        tags=["qa", "v1"]
    )
    
    # 2. Prompt 处理
    prompt_run_id = client.create_run(
        run_type=LangSmithRunType.LLM,
        name="prompt_template",
        inputs={"template": "请回答: {query}"},
        parent_run_id=chain_run_id
    )
    client.update_run(
        prompt_run_id,
        outputs={"formatted_prompt": "请回答: 什么是机器学习？"}
    )
    
    # 3. LLM 调用
    llm_run_id = client.create_run(
        run_type=LangSmithRunType.LLM,
        name="openai_llm",
        inputs={"model": "gpt-4", "temperature": 0.7},
        parent_run_id=chain_run_id,
        metadata={"token_usage": {"prompt_tokens": 10, "completion_tokens": 50}}
    )
    client.update_run(
        llm_run_id,
        outputs={"response": "机器学习是让计算机从数据中学习的方法。"},
        metadata={"latency_ms": 250}
    )
    
    # 4. 添加反馈
    client.feedback(chain_run_id, score=0.9, comment="回答准确")
    
    # 获取统计
    stats = client.get_project_stats()
    print(f"   项目: {stats['project']}")
    print(f"   总运行数: {stats['total_runs']}")
    print(f"   错误率: {stats['error_rate']*100:.1f}%")
    
    # 获取追踪
    trace = client.get_trace(chain_run_id)
    print(f"   追踪长度: {len(trace)} 步")
    
    return client


def phoenix_practice():
    """Arize Phoenix 实践示例"""
    print("\n2. Arize Phoenix 实践")
    print("-" * 40)
    
    # 创建客户端
    client = ArizePhoenixClient("demo-project")
    
    # 创建数据集
    dataset_id = client.create_dataset("qa_dataset")
    
    # 添加当前追踪
    current_traces = [
        PhoenixTrace(
            trace_id=str(uuid.uuid4()),
            start_time=datetime.now(),
            end_time=datetime.now(),
            labels={"task": "qa"}
        )
        for _ in range(10)
    ]
    client.add_to_dataset(dataset_id, current_traces)
    
    # 设置基线
    baseline_traces = [
        PhoenixTrace(
            trace_id=str(uuid.uuid4()),
            start_time=datetime.now(),
            end_time=datetime.now(),
            labels={"task": "qa"}
        )
        for _ in range(8)
    ]
    client.set_baseline(dataset_id, baseline_traces)
    
    # 计算指标
    def latency_metric(traces):
        return sum(0.2 for _ in traces) / max(len(traces), 1)  # 模拟延迟
    
    result = client.compute_metric(
        dataset_id,
        MetricType.LATENCY,
        latency_metric
    )
    print(f"   延迟指标:")
    print(f"     当前值: {result['current_value']:.3f}")
    print(f"     基线值: {result['baseline_value']:.3f}")
    print(f"     漂移: {result['drift']*100:.1f}%")
    
    # 检测漂移
    drift_result = client.detect_drift(dataset_id, threshold=0.1)
    print(f"\n   漂移检测:")
    print(f"     漂移检测: {'是' if drift_result['drift_detected'] else '否'}")
    print(f"     数量漂移: {drift_result['count_drift']*100:.1f}%")
    
    # 性能摘要
    summary = client.get_performance_summary()
    print(f"\n   性能摘要: {json.dumps(summary, indent=2)}")
    
    return client


# ========== 5. 主函数 ==========

def main():
    """主函数"""
    print("=" * 60)
    print("LangSmith / Arize Phoenix 实践")
    print("=" * 60)
    
    # LangSmith 实践
    langsmith_client = langsmith_practice()
    
    # Arize Phoenix 实践
    phoenix_client = phoenix_practice()
    
    # 工具对比
    print("\n3. 工具对比")
    print("-" * 40)
    compare_tools()
    
    print("\n" + "=" * 60)
    print("实践完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | LangSmith 连接失败 | 检查 API key 和网络配置 |
| 2 | Phoenix 数据加载慢 | 增加服务器资源，优化查询 |
| 3 | 指标计算不准确 | 检查指标函数实现 |
| 4 | 漂移检测误报 | 调整阈值，增加样本量 |
| 5 | 不知道选哪个工具 | 根据是否使用 LangChain 决定 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| LangSmith | LangChain 生态的 LLM 应用开发平台 |
| Arize Phoenix | 开源的 LLM 可观测性平台 |
| Run | LangSmith 中的单次执行记录 |
| Trace | 追踪请求的完整执行路径 |
| Drift Detection | 检测数据分布变化的技术 |
| Baseline | 用于对比的基线数据 |
| Feedback | 对 LLM 输出的评分反馈 |
| Dataset | 用于评估的数据集 |

## ✅ 验收清单
- [ ] 能解释 LangSmith 的核心功能
- [ ] 能解释 Arize Phoenix 的核心功能
- [ ] 能对比两个工具的优缺点
- [ ] 代码能跑通并输出结果

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
