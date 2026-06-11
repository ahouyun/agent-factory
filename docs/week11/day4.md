# 🔍 Day 4: 可观测性 — 给 Agent 装上"监控摄像头"

## 今日方向

> "你无法改进你无法测量的东西。" -- Peter Drucker

今天我们来学习 Agent 的可观测性（Observability）。通过 Traces（追踪）、Metrics（指标）和 Logs（日志）三大支柱，让你能够实时监控和调试 Agent 的行为。

## 生活比喻

想象你是一家快递公司的管理者：

- **Traces（追踪）** = 快递的完整运输路线（从发货到签收的全过程）
- **Metrics（指标）** = 每天的快递量、准时率、投诉率（量化数据）
- **Logs（日志）** = 每个快递员的工作记录（详细事件）

有了这三样东西，你就能全面掌控整个快递系统。

## 今日三件事

1. **理解三大支柱**：Traces、Metrics、Logs 的概念和用途
2. **使用 OpenTelemetry**：为 Agent 添加追踪和指标
3. **设计监控仪表板**：构建可视化的监控系统

---

## 手把手路线

### 第一步：安装依赖

```bash
pip install opentelemetry-api opentelemetry-sdk psutil
```

### 第二步：理解三大支柱

```python
# observability_basics.py
"""可观测性三大支柱基础"""

import json
import time
import random
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from enum import Enum


class MetricType(Enum):
    """指标类型"""
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"


@dataclass
class LogEntry:
    """日志条目"""
    timestamp: str
    level: str
    message: str
    context: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {"timestamp": self.timestamp, "level": self.level,
                "message": self.message, "context": self.context}


@dataclass
class TraceSpan:
    """追踪跨度"""
    span_id: str
    trace_id: str
    name: str
    start_time: float
    end_time: float = 0.0
    parent_span_id: Optional[str] = None
    attributes: Dict[str, Any] = field(default_factory=dict)
    events: List[Dict] = field(default_factory=list)

    @property
    def duration(self) -> float:
        return self.end_time - self.start_time

    def to_dict(self) -> dict:
        return {
            "span_id": self.span_id, "trace_id": self.trace_id,
            "name": self.name, "start_time": self.start_time,
            "end_time": self.end_time,
            "duration_ms": round(self.duration * 1000, 2),
            "parent_span_id": self.parent_span_id,
            "attributes": self.attributes,
        }


@dataclass
class Metric:
    """指标"""
    name: str
    value: float
    metric_type: MetricType
    timestamp: float
    labels: Dict[str, str] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {"name": self.name, "value": self.value,
                "type": self.metric_type.value, "timestamp": self.timestamp}


class ObservabilityManager:
    """可观测性管理器"""

    def __init__(self, service_name: str):
        self.service_name = service_name
        self.logs: List[LogEntry] = []
        self.traces: List[TraceSpan] = []
        self.metrics: List[Metric] = []
        self._current_trace_id = None
        self._span_stack: List[TraceSpan] = []

    def start_trace(self, operation_name: str) -> str:
        """开始一个新的追踪"""
        trace_id = f"trace_{int(time.time() * 1000)}_{random.randint(1000, 9999)}"
        self._current_trace_id = trace_id
        root_span = TraceSpan(
            span_id=f"span_{int(time.time() * 1000)}",
            trace_id=trace_id, name=operation_name,
            start_time=time.time(),
            attributes={"service": self.service_name},
        )
        self._span_stack.append(root_span)
        self.traces.append(root_span)
        self.log("INFO", f"开始追踪: {operation_name}", {"trace_id": trace_id})
        return trace_id

    def start_span(self, span_name: str, attributes: Dict = None) -> str:
        """开始一个新的跨度"""
        span = TraceSpan(
            span_id=f"span_{int(time.time() * 1000)}_{random.randint(100, 999)}",
            trace_id=self._current_trace_id, name=span_name,
            start_time=time.time(),
            parent_span_id=self._span_stack[-1].span_id if self._span_stack else None,
            attributes=attributes or {},
        )
        self._span_stack.append(span)
        self.traces.append(span)
        return span.span_id

    def end_span(self):
        """结束当前跨度"""
        if self._span_stack:
            span = self._span_stack.pop()
            span.end_time = time.time()
            self.log("DEBUG", f"结束跨度: {span.name}",
                     {"duration_ms": span.duration * 1000})

    def end_trace(self):
        """结束当前追踪"""
        while self._span_stack:
            self.end_span()
        self.log("INFO", "追踪结束", {"trace_id": self._current_trace_id})
        self._current_trace_id = None

    def log(self, level: str, message: str, context: Dict = None):
        """记录日志"""
        entry = LogEntry(
            timestamp=datetime.now().isoformat(),
            level=level, message=message, context=context or {},
        )
        self.logs.append(entry)
        print(f"[{level}] {message}")

    def record_metric(self, name: str, value: float,
                     metric_type: MetricType = MetricType.GAUGE,
                     labels: Dict[str, str] = None):
        """记录指标"""
        metric = Metric(name=name, value=value, metric_type=metric_type,
                        timestamp=time.time(), labels=labels or {})
        self.metrics.append(metric)

    def get_trace_summary(self, trace_id: str = None) -> Dict:
        """获取追踪摘要"""
        spans = [s for s in self.traces if s.trace_id == trace_id] if trace_id else self.traces
        if not spans:
            return {"error": "No traces found"}
        total_duration = sum(s.duration for s in spans)
        return {
            "trace_id": spans[0].trace_id if spans else None,
            "span_count": len(spans),
            "total_duration_ms": round(total_duration * 1000, 2),
            "spans": [s.to_dict() for s in spans],
        }

    def get_metrics_summary(self) -> Dict:
        """获取指标摘要"""
        if not self.metrics:
            return {"error": "No metrics found"}
        metrics_by_name = {}
        for metric in self.metrics:
            if metric.name not in metrics_by_name:
                metrics_by_name[metric.name] = []
            metrics_by_name[metric.name].append(metric.value)
        summary = {}
        for name, values in metrics_by_name.items():
            summary[name] = {
                "count": len(values), "min": min(values), "max": max(values),
                "avg": round(sum(values) / len(values), 4), "latest": values[-1],
            }
        return summary

    def export_all(self, filepath: str):
        """导出所有数据"""
        data = {
            "service": self.service_name,
            "export_time": datetime.now().isoformat(),
            "traces": [t.to_dict() for t in self.traces],
            "metrics": [m.to_dict() for m in self.metrics],
            "logs": [l.to_dict() for l in self.logs],
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"数据已导出到: {filepath}")


if __name__ == "__main__":
    manager = ObservabilityManager("agent-service")

    print("可观测性三大支柱示例")
    print("=" * 60)

    trace_id = manager.start_trace("agent_query")

    manager.start_span("parse_input")
    time.sleep(0.05)
    manager.end_span()

    manager.start_span("llm_call")
    time.sleep(0.1)
    manager.end_span()

    manager.start_span("post_process")
    time.sleep(0.02)
    manager.end_span()

    manager.record_metric("request_count", 1, MetricType.COUNTER)
    manager.record_metric("response_time", 0.17, MetricType.HISTOGRAM)
    manager.record_metric("tokens_used", 150, MetricType.GAUGE)

    manager.end_trace()

    print("\n追踪摘要:")
    print(json.dumps(manager.get_trace_summary(), indent=2, ensure_ascii=False))

    print("\n指标摘要:")
    print(json.dumps(manager.get_metrics_summary(), indent=2, ensure_ascii=False))
```

### 第三步：使用 OpenTelemetry

```python
# opentelemetry_integration.py
"""OpenTelemetry 集成示例"""

import json
import time
import random
from typing import Dict, Any, Optional
from dataclasses import dataclass, field


@dataclass
class OTelSpan:
    """模拟 OpenTelemetry Span"""
    name: str
    trace_id: str
    span_id: str
    start_time: float
    end_time: float = 0.0
    attributes: Dict[str, Any] = None
    status: str = "OK"

    def __post_init__(self):
        if self.attributes is None:
            self.attributes = {}

    def set_attribute(self, key: str, value: Any):
        self.attributes[key] = value

    def set_status(self, status: str):
        self.status = status

    def end(self):
        self.end_time = time.time()

    def to_dict(self) -> dict:
        return {
            "name": self.name, "trace_id": self.trace_id,
            "span_id": self.span_id, "start_time": self.start_time,
            "end_time": self.end_time,
            "duration_ms": round((self.end_time - self.start_time) * 1000, 2),
            "attributes": self.attributes, "status": self.status,
        }


class OTelTracer:
    """模拟 OpenTelemetry Tracer"""

    def __init__(self, service_name: str):
        self.service_name = service_name
        self.spans: List[OTelSpan] = []
        self._span_stack: List[OTelSpan] = []

    def start_span(self, name: str, attributes: Dict = None) -> OTelSpan:
        parent_id = self._span_stack[-1].span_id if self._span_stack else None
        span = OTelSpan(
            name=name,
            trace_id=f"trace_{int(time.time() * 1000)}",
            span_id=f"span_{int(time.time() * 1000)}_{len(self.spans)}",
            start_time=time.time(), attributes=attributes or {},
        )
        if parent_id:
            span.set_attribute("parent_span_id", parent_id)
        self.spans.append(span)
        self._span_stack.append(span)
        return span

    def end_span(self):
        if self._span_stack:
            span = self._span_stack.pop()
            span.end()
            return span
        return None

    def get_all_spans(self) -> list:
        return [s.to_dict() for s in self.spans]


# 需要导入 List
from typing import List


class AgentInstrumentation:
    """Agent 仪表化"""

    def __init__(self, service_name: str = "ai-agent"):
        self.tracer = OTelTracer(service_name)
        self.metrics = {}

    def instrument_agent(self, agent_func):
        """仪表化 Agent 函数"""
        def wrapped_agent(query: str, **kwargs) -> Dict:
            span = self.tracer.start_span("agent_query")
            span.set_attribute("query", query)
            span.set_attribute("query_length", len(query))
            start_time = time.time()
            try:
                result = agent_func(query, **kwargs)
                span.set_status("OK")
                span.set_attribute("result_length", len(str(result)))
                span.set_attribute("success", True)
                self._update_metric("success_count", 1)
                self._update_metric("total_queries", 1)
                return result
            except Exception as e:
                span.set_status("ERROR")
                span.set_attribute("error", str(e))
                span.set_attribute("success", False)
                self._update_metric("error_count", 1)
                self._update_metric("total_queries", 1)
                raise
            finally:
                latency = time.time() - start_time
                span.set_attribute("latency_ms", round(latency * 1000, 2))
                span.end()
                self._update_metric("latency_sum", latency)
        return wrapped_agent

    def _update_metric(self, name: str, value: float):
        if name not in self.metrics:
            self.metrics[name] = 0
        self.metrics[name] += value

    def get_metrics(self) -> Dict:
        return self.metrics.copy()

    def get_traces(self) -> list:
        return self.tracer.get_all_spans()


if __name__ == "__main__":
    print("OpenTelemetry Agent 仪表化示例")
    print("=" * 60)

    instrumentation = AgentInstrumentation("my-agent")

    @instrumentation.instrument_agent
    def my_agent(query: str) -> str:
        time.sleep(0.1)
        if "error" in query:
            raise ValueError("模拟错误")
        return f"这是对 '{query[:20]}...' 的回答"

    test_queries = [
        "你好，请问今天天气怎么样？",
        "Python中如何读取文件？",
        "什么是机器学习？",
        "这是一个错误测试",
        "最后一个问题",
    ]

    for query in test_queries:
        try:
            result = my_agent(query)
            print(f"\n查询: {query}")
            print(f"结果: {result}")
        except Exception as e:
            print(f"\n查询: {query}")
            print(f"错误: {e}")

    print("\n" + "=" * 60)
    print("Agent 指标:")
    print(json.dumps(instrumentation.get_metrics(), indent=2))

    print("\n" + "=" * 60)
    print("Agent 追踪:")
    traces = instrumentation.get_traces()
    for trace in traces[-5:]:
        print(f"  {trace['name']}: {trace.get('attributes', {}).get('latency_ms', 'N/A')}ms")
```

### 第四步：结构化日志

```python
# structured_logging.py
"""结构化日志实现"""

import json
import time
from datetime import datetime
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from enum import Enum
import traceback


class LogLevel(Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


@dataclass
class StructuredLog:
    """结构化日志"""
    timestamp: str
    level: str
    message: str
    logger: str
    trace_id: Optional[str] = None
    span_id: Optional[str] = None
    extra: Dict[str, Any] = field(default_factory=dict)
    exception: Optional[str] = None

    def to_dict(self) -> dict:
        result = {"timestamp": self.timestamp, "level": self.level,
                  "message": self.message, "logger": self.logger}
        if self.trace_id:
            result["trace_id"] = self.trace_id
        if self.span_id:
            result["span_id"] = self.span_id
        if self.extra:
            result["extra"] = self.extra
        if self.exception:
            result["exception"] = self.exception
        return result

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), ensure_ascii=False)


class StructuredLogger:
    """结构化日志器"""

    def __init__(self, name: str, level: LogLevel = LogLevel.INFO):
        self.name = name
        self.level = level
        self.logs: List[StructuredLog] = []
        self._trace_id = None
        self._span_id = None

    def set_trace_context(self, trace_id: str, span_id: str = None):
        self._trace_id = trace_id
        self._span_id = span_id

    def _log(self, level: LogLevel, message: str, extra: Dict = None,
             exception: Exception = None):
        log_entry = StructuredLog(
            timestamp=datetime.now().isoformat(), level=level.value,
            message=message, logger=self.name,
            trace_id=self._trace_id, span_id=self._span_id,
            extra=extra or {},
        )
        if exception:
            log_entry.exception = traceback.format_exc()
        self.logs.append(log_entry)
        print(f"[{level.value}] {message}")
        return log_entry

    def debug(self, message: str, extra: Dict = None):
        return self._log(LogLevel.DEBUG, message, extra)

    def info(self, message: str, extra: Dict = None):
        return self._log(LogLevel.INFO, message, extra)

    def warning(self, message: str, extra: Dict = None):
        return self._log(LogLevel.WARNING, message, extra)

    def error(self, message: str, extra: Dict = None, exception: Exception = None):
        return self._log(LogLevel.ERROR, message, extra, exception)

    def critical(self, message: str, extra: Dict = None, exception: Exception = None):
        return self._log(LogLevel.CRITICAL, message, extra, exception)

    def get_logs(self, level: LogLevel = None) -> list:
        if level:
            return [l for l in self.logs if l.level == level.value]
        return self.logs

    def export_logs(self, filepath: str):
        data = [log.to_dict() for log in self.logs]
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"日志已导出到: {filepath}")


if __name__ == "__main__":
    print("结构化日志示例")
    print("=" * 60)

    logger = StructuredLogger("agent-service")
    logger.info("开始处理用户查询", {"user_id": "user_123"})
    logger.set_trace_context("trace_001", "span_001")
    logger.info("解析输入", {"query_length": 50})
    logger.debug("输入解析完成", {"parsed_tokens": 12})
    logger.info("调用 LLM", {"model": "gpt-4", "max_tokens": 100})
    time.sleep(0.1)
    logger.info("LLM 响应完成", {"response_length": 200, "tokens_used": 150})
    logger.info("处理完成", {"latency_ms": 150})

    try:
        raise ValueError("模拟错误")
    except Exception as e:
        logger.error("处理失败", {"error_type": type(e).__name__}, e)

    print("\n" + "=" * 60)
    print("所有日志:")
    for log in logger.get_logs():
        print(f"  {log.to_json()}")

    logger.export_logs("agent_logs.json")
```

### 第五步：设计监控仪表板

```python
# dashboard.py
"""监控仪表板设计"""

import json
import time
import random
from datetime import datetime
from typing import Dict, List, Any
from dataclasses import dataclass, field


@dataclass
class DashboardMetric:
    """仪表板指标"""
    name: str
    value: float
    unit: str
    trend: str  # up, down, stable
    status: str  # normal, warning, critical

    def to_dict(self) -> dict:
        return {"name": self.name, "value": self.value, "unit": self.unit,
                "trend": self.trend, "status": self.status}


@dataclass
class DashboardPanel:
    """仪表板面板"""
    title: str
    metrics: List[DashboardMetric] = field(default_factory=list)
    chart_data: List[Dict] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {"title": self.title, "metrics": [m.to_dict() for m in self.metrics],
                "chart_data": self.chart_data}


class AgentDashboard:
    """Agent 监控仪表板"""

    def __init__(self, service_name: str):
        self.service_name = service_name
        self.panels: List[DashboardPanel] = []
        self._setup_panels()

    def _setup_panels(self):
        """设置仪表板面板"""
        overview = DashboardPanel(title="服务概览")
        overview.metrics = [
            DashboardMetric("总请求数", 1234, "count", "up", "normal"),
            DashboardMetric("成功率", 98.5, "%", "stable", "normal"),
            DashboardMetric("平均延迟", 245, "ms", "down", "normal"),
            DashboardMetric("错误数", 3, "count", "up", "warning"),
        ]
        self.panels.append(overview)

        perf = DashboardPanel(title="性能指标")
        perf.metrics = [
            DashboardMetric("P50 延迟", 180, "ms", "stable", "normal"),
            DashboardMetric("P95 延迟", 450, "ms", "up", "warning"),
            DashboardMetric("P99 延迟", 890, "ms", "up", "critical"),
            DashboardMetric("吞吐量", 45, "req/s", "up", "normal"),
        ]
        self.panels.append(perf)

        resource = DashboardPanel(title="资源使用")
        resource.metrics = [
            DashboardMetric("CPU 使用率", 45.2, "%", "stable", "normal"),
            DashboardMetric("内存使用率", 62.8, "%", "up", "normal"),
            DashboardMetric("磁盘使用率", 35.6, "%", "stable", "normal"),
        ]
        self.panels.append(resource)

    def update_metric(self, panel_title: str, metric_name: str, value: float):
        """更新指标值"""
        for panel in self.panels:
            if panel.title == panel_title:
                for metric in panel.metrics:
                    if metric.name == metric_name:
                        metric.value = value
                        return True
        return False

    def generate_html(self) -> str:
        """生成 HTML 仪表板"""
        html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>{self.service_name} 监控仪表板</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
        .dashboard {{ max-width: 1200px; margin: 0 auto; }}
        .header {{ background: #2196F3; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
        .panel {{ background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        .panel-title {{ font-size: 18px; font-weight: bold; margin-bottom: 15px; }}
        .metrics-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }}
        .metric-card {{ background: #f9f9f9; padding: 15px; border-radius: 6px; border-left: 4px solid #2196F3; }}
        .metric-card.warning {{ border-left-color: #FF9800; }}
        .metric-card.critical {{ border-left-color: #F44336; }}
        .metric-name {{ font-size: 14px; color: #666; }}
        .metric-value {{ font-size: 24px; font-weight: bold; color: #333; }}
        .metric-unit {{ font-size: 12px; color: #999; }}
        .trend {{ font-size: 12px; margin-top: 5px; }}
        .trend.up {{ color: #4CAF50; }}
        .trend.down {{ color: #F44336; }}
        .trend.stable {{ color: #9E9E9E; }}
    </style>
</head>
<body>
<div class="dashboard">
    <div class="header">
        <h1>{self.service_name} 监控仪表板</h1>
        <p>最后更新: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
"""
        for panel in self.panels:
            html += f'    <div class="panel">\n'
            html += f'        <div class="panel-title">{panel.title}</div>\n'
            html += '        <div class="metrics-grid">\n'
            for metric in panel.metrics:
                cls = f" {metric.status}" if metric.status != "normal" else ""
                html += f'            <div class="metric-card{cls}">\n'
                html += f'                <div class="metric-name">{metric.name}</div>\n'
                html += f'                <div class="metric-value">{metric.value}<span class="metric-unit">{metric.unit}</span></div>\n'
                html += f'                <div class="trend {metric.trend}">趋势: {metric.trend}</div>\n'
                html += '            </div>\n'
            html += '        </div>\n    </div>\n'
        html += '</div>\n</body>\n</html>'
        return html

    def export_dashboard(self, filepath: str):
        """导出仪表板"""
        data = {"service": self.service_name, "timestamp": datetime.now().isoformat(),
                "panels": [p.to_dict() for p in self.panels]}
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        html = self.generate_html()
        with open(filepath.replace(".json", ".html"), "w", encoding="utf-8") as f:
            f.write(html)
        print(f"仪表板已导出: {filepath} 和 {filepath.replace('.json', '.html')}")


if __name__ == "__main__":
    print("监控仪表板示例")
    print("=" * 60)

    dashboard = AgentDashboard("AI Agent 服务")

    for i in range(5):
        dashboard.update_metric("服务概览", "总请求数", 1234 + i * 10)
        dashboard.update_metric("服务概览", "成功率", 98.5 - i * 0.2)
        time.sleep(0.1)

    dashboard.export_dashboard("dashboard.json")

    print("\n仪表板面板摘要:")
    for panel in dashboard.panels:
        print(f"\n{panel.title}:")
        for metric in panel.metrics:
            print(f"  {metric.name}: {metric.value} {metric.unit} ({metric.trend})")
```

---

## 预期输出

### 运行可观测性基础

```bash
python observability_basics.py
```

```
可观测性三大支柱示例
============================================================
[INFO] 开始追踪: agent_query
[DEBUG] 结束跨度: parse_input
[DEBUG] 结束跨度: llm_call
[DEBUG] 结束跨度: post_process
[INFO] 追踪结束

追踪摘要:
{
  "span_count": 3,
  "total_duration_ms": 170.54
}

指标摘要:
{
  "request_count": {"count": 1, "min": 1, "max": 1, "avg": 1.0}
}
```

### 运行 OpenTelemetry 集成

```bash
python opentelemetry_integration.py
```

```
OpenTelemetry Agent 仪表化示例
============================================================

查询: 你好，请问今天天气怎么样？
结果: 这是对 '你好，请问今天天气怎么样？...' 的回答
...

Agent 指标:
{
  "success_count": 4,
  "total_queries": 5,
  "error_count": 1
}
```

### 运行结构化日志

```bash
python structured_logging.py
```

```
结构化日志示例
============================================================
[INFO] 开始处理用户查询
[INFO] 解析输入
[DEBUG] 输入解析完成
[INFO] 调用 LLM
[INFO] LLM 响应完成
[INFO] 处理完成
[ERROR] 处理失败
```

### 运行监控仪表板

```bash
python dashboard.py
```

```
监控仪表板示例
============================================================
仪表板已导出: dashboard.json 和 dashboard.html

仪表板面板摘要:

服务概览:
  总请求数: 1274 count (up)
  成功率: 97.7 % (down)
```

---

## 常见错误及解决方案

### 错误 1: OpenTelemetry 库未安装

```
ModuleNotFoundError: No module named 'opentelemetry'
```

**解决方案：**

```bash
pip install opentelemetry-api opentelemetry-sdk
```

### 错误 2: 导出器配置错误

**解决方案：** 确保正确配置导出端点。

### 错误 3: 日志级别配置错误

**解决方案：** 使用正确的 LogLevel 枚举值。

---

## 每日挑战

### 挑战 1: 实现真实 OpenTelemetry 集成

将模拟的 OpenTelemetry 替换为真实的库。

### 挑战 2: 添加实时监控

使用 WebSocket 实现仪表板的实时更新。

### 挑战 3: 构建告警系统

基于指标构建简单的告警系统。

---

## 今日小结

今天我们学习了 Agent 的可观测性：

1. **三大支柱**：Traces（追踪）、Metrics（指标）、Logs（日志）
2. **OpenTelemetry**：标准化的可观测性框架
3. **监控仪表板**：可视化的监控界面

**关键架构：**

```
可观测性 = Traces + Metrics + Logs
     |           |            |
     v           v            v
  追踪数据    指标数据     日志数据
     |           |            |
     +-----------+------------+
                 |
           监控仪表板 (Dashboard)
```

---

*明天见！我们将一起探索 LangSmith 和 Arize Phoenix。*
