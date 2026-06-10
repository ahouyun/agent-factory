# 📅 Week 11 Day 4：可观测性三支柱：Traces / Metrics / Logs

## 🧭 今日方向
> 理解可观测性的三大支柱（Traces、Metrics、Logs），学会如何用它们监控和调试 Agent 系统。

## 🎯 生活比喻
> 可观测性就像汽车的仪表盘。Traces 是 GPS 轨迹，记录你从 A 到 B 的完整路线；Metrics 是速度表、油量表，告诉你当前状态；Logs 是行车记录仪，记录沿途发生的具体事件。三者结合，你才能全面了解"车"（Agent）的运行状况。

## 📋 今日三件事
1. 理解 Traces、Metrics、Logs 的定义和区别
2. 学习如何在 Agent 系统中实现可观测性
3. 实现一个简单的可观测性框架

## 🗺️ 手把手路线

### Step 1：理解三大支柱
- 做什么: 学习 Traces、Metrics、Logs 的核心概念
- 为什么: 这是监控 Agent 的基础
- 成功标志: 能解释三者的区别和联系

### Step 2：Traces 实践
- 做什么: 学习分布式追踪的实现原理
- 为什么: Traces 能追踪请求的完整执行路径
- 成功标志: 能实现简单的 Trace 上下文管理

### Step 3：Metrics 实践
- 做什么: 学习指标收集和聚合
- 为什么: Metrics 能量化系统性能
- 成功标志: 能定义和收集关键指标

### Step 4：Logs 实践
- 做什么: 学习结构化日志的记录方式
- 为什么: Logs 能记录详细的运行信息
- 成功标志: 能实现结构化日志记录

## 💻 代码区

```python
"""
可观测性三支柱：Traces / Metrics / Logs
完整的实现示例
"""
import time
import uuid
import json
import logging
from datetime import datetime
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Callable
from contextlib import contextmanager
from collections import defaultdict
from enum import Enum

# ========== 1. 日志级别 ==========

class LogLevel(Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


# ========== 2. 结构化日志 ==========

@dataclass
class LogEntry:
    """日志条目"""
    timestamp: str
    level: LogLevel
    message: str
    trace_id: str = ""
    span_id: str = ""
    attributes: Dict[str, Any] = field(default_factory=dict)


class StructuredLogger:
    """结构化日志记录器"""
    
    def __init__(self, name: str):
        self.name = name
        self.entries: List[LogEntry] = []
        self.min_level = LogLevel.INFO
    
    def set_level(self, level: LogLevel):
        self.min_level = level
    
    def _should_log(self, level: LogLevel) -> bool:
        levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARNING, LogLevel.ERROR, LogLevel.CRITICAL]
        return levels.index(level) >= levels.index(self.min_level)
    
    def log(self, level: LogLevel, message: str, **attributes):
        if not self._should_log(level):
            return
        
        entry = LogEntry(
            timestamp=datetime.now().isoformat(),
            level=level,
            message=message,
            attributes=attributes
        )
        self.entries.append(entry)
    
    def debug(self, message: str, **attributes):
        self.log(LogLevel.DEBUG, message, **attributes)
    
    def info(self, message: str, **attributes):
        self.log(LogLevel.INFO, message, **attributes)
    
    def warning(self, message: str, **attributes):
        self.log(LogLevel.WARNING, message, **attributes)
    
    def error(self, message: str, **attributes):
        self.log(LogLevel.ERROR, message, **attributes)
    
    def critical(self, message: str, **attributes):
        self.log(LogLevel.CRITICAL, message, **attributes)
    
    def get_entries(self, level: Optional[LogLevel] = None) -> List[LogEntry]:
        if level:
            return [e for e in self.entries if e.level == level]
        return self.entries
    
    def to_json(self) -> str:
        entries_dict = [
            {
                "timestamp": e.timestamp,
                "level": e.level.value,
                "message": e.message,
                "trace_id": e.trace_id,
                "attributes": e.attributes
            }
            for e in self.entries
        ]
        return json.dumps(entries_dict, ensure_ascii=False, indent=2)


# ========== 3. Traces 追踪 ==========

@dataclass
class Span:
    """追踪跨度"""
    span_id: str
    trace_id: str
    name: str
    start_time: float
    end_time: float = 0.0
    parent_span_id: Optional[str] = None
    attributes: Dict[str, Any] = field(default_factory=dict)
    events: List[Dict] = field(default_factory=list)
    status: str = "OK"
    
    @property
    def duration_ms(self) -> float:
        return (self.end_time - self.start_time) * 1000
    
    def add_event(self, name: str, attributes: Dict = None):
        self.events.append({
            "name": name,
            "timestamp": time.time(),
            "attributes": attributes or {}
        })
    
    def finish(self):
        self.end_time = time.time()


class Tracer:
    """分布式追踪器"""
    
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.spans: List[Span] = []
        self._current_trace_id: Optional[str] = None
        self._current_span_id: Optional[str] = None
    
    def start_trace(self, name: str) -> str:
        """开始新的追踪"""
        trace_id = str(uuid.uuid4())
        self._current_trace_id = trace_id
        
        span = Span(
            span_id=str(uuid.uuid4()),
            trace_id=trace_id,
            name=name,
            start_time=time.time()
        )
        self.spans.append(span)
        self._current_span_id = span.span_id
        
        return trace_id
    
    def start_span(self, name: str) -> Span:
        """开始新的跨度"""
        span = Span(
            span_id=str(uuid.uuid4()),
            trace_id=self._current_trace_id or str(uuid.uuid4()),
            name=name,
            start_time=time.time(),
            parent_span_id=self._current_span_id
        )
        self.spans.append(span)
        self._current_span_id = span.span_id
        
        return span
    
    @contextmanager
    def trace(self, name: str):
        """追踪上下文管理器"""
        span = self.start_span(name)
        try:
            yield span
        except Exception as e:
            span.status = "ERROR"
            span.add_event("error", {"message": str(e)})
            raise
        finally:
            span.finish()
    
    def finish_trace(self):
        """结束追踪"""
        self._current_trace_id = None
        self._current_span_id = None
    
    def get_trace(self, trace_id: str) -> List[Span]:
        """获取追踪的所有跨度"""
        return [s for s in self.spans if s.trace_id == trace_id]
    
    def get_trace_tree(self, trace_id: str) -> Dict:
        """获取追踪树结构"""
        spans = self.get_trace(trace_id)
        span_map = {s.span_id: s for s in spans}
        
        roots = [s for s in spans if s.parent_span_id is None]
        
        def build_tree(span):
            children = [s for s in spans if s.parent_span_id == span.span_id]
            return {
                "span_id": span.span_id,
                "name": span.name,
                "duration_ms": span.duration_ms,
                "status": span.status,
                "children": [build_tree(c) for c in children]
            }
        
        return {
            "trace_id": trace_id,
            "spans": [build_tree(r) for r in roots]
        }


# ========== 4. Metrics 指标 ==========

@dataclass
class MetricPoint:
    """指标数据点"""
    name: str
    value: float
    timestamp: float
    labels: Dict[str, str] = field(default_factory=dict)


class MetricsCollector:
    """指标收集器"""
    
    def __init__(self):
        self.counters: Dict[str, int] = defaultdict(int)
        self.gauges: Dict[str, float] = {}
        self.histograms: Dict[str, List[float]] = defaultdict(list)
        self.points: List[MetricPoint] = []
    
    def increment(self, name: str, value: int = 1, **labels):
        """递增计数器"""
        key = self._make_key(name, labels)
        self.counters[key] += value
        self._record_point(name, self.counters[key], labels)
    
    def set_gauge(self, name: str, value: float, **labels):
        """设置仪表盘值"""
        key = self._make_key(name, labels)
        self.gauges[key] = value
        self._record_point(name, value, labels)
    
    def observe(self, name: str, value: float, **labels):
        """记录直方图值"""
        key = self._make_key(name, labels)
        self.histograms[key].append(value)
        self._record_point(name, value, labels)
    
    def _make_key(self, name: str, labels: Dict) -> str:
        label_str = ",".join(f"{k}={v}" for k, v in sorted(labels.items()))
        return f"{name}{{{label_str}}}" if label_str else name
    
    def _record_point(self, name: str, value: float, labels: Dict):
        self.points.append(MetricPoint(
            name=name,
            value=value,
            timestamp=time.time(),
            labels=labels
        ))
    
    def get_counter(self, name: str, **labels) -> int:
        key = self._make_key(name, labels)
        return self.counters.get(key, 0)
    
    def get_gauge(self, name: str, **labels) -> float:
        key = self._make_key(name, labels)
        return self.gauges.get(key, 0.0)
    
    def get_histogram_stats(self, name: str, **labels) -> Dict:
        key = self._make_key(name, labels)
        values = self.histograms.get(key, [])
        if not values:
            return {}
        
        sorted_vals = sorted(values)
        return {
            "count": len(values),
            "min": sorted_vals[0],
            "max": sorted_vals[-1],
            "avg": sum(values) / len(values),
            "p50": sorted_vals[len(sorted_vals) // 2],
            "p95": sorted_vals[int(len(sorted_vals) * 0.95)],
            "p99": sorted_vals[int(len(sorted_vals) * 0.99)]
        }
    
    def get_summary(self) -> Dict:
        return {
            "counters": dict(self.counters),
            "gauges": dict(self.gauges),
            "histograms": {
                k: self.get_histogram_stats(k.split("{")[0]) 
                for k in self.histograms.keys()
            }
        }


# ========== 5. 可观测性整合 ==========

class ObservabilityFramework:
    """可观测性框架"""
    
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.logger = StructuredLogger(service_name)
        self.tracer = Tracer(service_name)
        self.metrics = MetricsCollector()
    
    @contextmanager
    def trace_operation(self, operation_name: str):
        """追踪操作"""
        span = self.tracer.start_span(operation_name)
        self.logger.info(f"开始操作: {operation_name}")
        
        start_time = time.time()
        try:
            yield span
        except Exception as e:
            span.status = "ERROR"
            self.logger.error(f"操作失败: {operation_name}", error=str(e))
            self.metrics.increment("errors", operation=operation_name)
            raise
        finally:
            span.finish()
            duration = time.time() - start_time
            self.metrics.observe("operation_duration", duration * 1000, operation=operation_name)
            self.logger.info(f"操作完成: {operation_name}", duration_ms=duration * 1000)
    
    def record_metric(self, name: str, value: float, **labels):
        """记录指标"""
        self.metrics.set_gauge(name, value, **labels)
    
    def increment_metric(self, name: str, value: int = 1, **labels):
        """递增指标"""
        self.metrics.increment(name, value, **labels)


# ========== 6. Agent 可观测性示例 ==========

class ObservableAgent:
    """可观察的 Agent"""
    
    def __init__(self, obs: ObservabilityFramework):
        self.obs = obs
    
    def process_task(self, task: str) -> str:
        """处理任务"""
        with self.obs.trace_operation("process_task") as span:
            span.attributes["task"] = task
            self.obs.logger.info(f"处理任务: {task}")
            
            # 步骤 1: 理解任务
            with self.obs.trace_operation("understand_task") as inner_span:
                self.obs.increment_metric("task_steps", step="understand")
                understanding = self._understand_task(task)
            
            # 步骤 2: 执行任务
            with self.obs.trace_operation("execute_task") as inner_span:
                self.obs.increment_metric("task_steps", step="execute")
                result = self._execute_task(task)
            
            # 步骤 3: 验证结果
            with self.obs.trace_operation("verify_result") as inner_span:
                self.obs.increment_metric("task_steps", step="verify")
                verified = self._verify_result(result)
            
            self.obs.record_metric("task_success", 1.0 if verified else 0.0)
            
            return result
    
    def _understand_task(self, task: str) -> str:
        """理解任务"""
        self.obs.logger.debug(f"理解任务: {task[:50]}...")
        time.sleep(0.01)  # 模拟处理
        return f"任务理解: {task[:20]}..."
    
    def _execute_task(self, task: str) -> str:
        """执行任务"""
        self.obs.logger.debug("执行任务中...")
        time.sleep(0.02)  # 模拟处理
        return f"任务结果: {task[:20]}..."
    
    def _verify_result(self, result: str) -> bool:
        """验证结果"""
        self.obs.logger.debug("验证结果...")
        time.sleep(0.01)  # 模拟处理
        return True


# ========== 7. 主函数 ==========

def main():
    """主函数"""
    print("=" * 60)
    print("可观测性三支柱演示")
    print("=" * 60)
    
    # 1. 创建框架
    obs = ObservabilityFramework("demo-agent")
    obs.logger.set_level(LogLevel.DEBUG)
    
    # 2. 创建 Agent
    agent = ObservableAgent(obs)
    
    # 3. 执行任务
    print("\n1. 执行任务...")
    tasks = [
        "什么是机器学习？",
        "如何学习 Python？",
        "解释 API 的概念"
    ]
    
    for task in tasks:
        result = agent.process_task(task)
        print(f"   完成: {task[:20]}...")
    
    # 4. 查看日志
    print("\n2. 日志:")
    for entry in obs.logger.get_entries()[:5]:
        print(f"   [{entry.level.value}] {entry.message}")
    
    # 5. 查看追踪
    print("\n3. 追踪:")
    print(f"   总跨度数: {len(obs.tracer.spans)}")
    
    # 6. 查看指标
    print("\n4. 指标:")
    summary = obs.metrics.get_summary()
    print(f"   计数器: {summary['counters']}")
    print(f"   仪表盘: {summary['gauges']}")
    
    # 7. 生成报告
    print("\n5. 可观测性报告:")
    report = {
        "service": obs.service_name,
        "logs_count": len(obs.logger.entries),
        "spans_count": len(obs.tracer.spans),
        "metrics": summary
    }
    print(json.dumps(report, indent=2, ensure_ascii=False))
    
    print("\n" + "=" * 60)
    print("演示完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 日志太多影响性能 | 调整日志级别，使用异步日志 |
| 2 | 追踪数据丢失 | 确保 trace_id 正确传递 |
| 3 | 指标不准确 | 检查指标聚合逻辑 |
| 4 | 无法定位问题 | 增加关键节点的 trace 和 log |
| 5 | 存储空间不足 | 配置日志轮转和数据保留策略 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Traces | 追踪请求的完整执行路径 |
| Metrics | 量化的系统性能指标 |
| Logs | 详细的运行时事件记录 |
| Span | 追踪中的单个操作单元 |
| Counter | 只增不减的计数器 |
| Gauge | 可增可减的仪表盘 |
| Histogram | 值分布的直方图 |
| Structured Logging | 结构化格式的日志 |

## ✅ 验收清单
- [ ] 能解释三大支柱的区别和联系
- [ ] 能实现基本的 Trace 追踪
- [ ] 能收集和查询 Metrics
- [ ] 能记录结构化日志
- [ ] 代码能跑通并输出结果

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
