# 📅 Week 12 Day 6：监控告警 + 日志聚合

## 🧭 今日方向
> 学习如何设计 Agent 系统的监控告警和日志聚合方案，实现生产级的运维能力。

## 🎯 生活比喻
> 监控告警就像医院的监护仪。心电图（Metrics）显示心跳规律，体温计（Logs）记录体温变化，当指标异常时（告警阈值），警报响起，医生立即处理。日志聚合就像病历系统，把所有检查结果汇总在一起，方便医生诊断。

## 📋 今日三件事
1. 设计监控指标和告警规则
2. 实现日志聚合和查询
3. 构建完整的监控告警系统

## 🗺️ 手把手路线

### Step 1：监控指标设计
- 做什么: 学习如何设计有效的监控指标
- 为什么: 没有指标就无法发现问题
- 成功标志: 能设计 5 个以上关键指标

### Step 2：告警规则
- 做什么: 学习如何设置告警阈值和通知
- 为什么: 及时发现问题并处理
- 成功标志: 能设置合理的告警规则

### Step 3：日志聚合
- 做什么: 学习日志收集、存储和查询
- 为什么: 问题排查的基础
- 成功标志: 能实现日志聚合系统

### Step 4：代码实践
- 做什么: 实现完整的监控告警系统
- 为什么: 代码是最好的理解方式
- 成功标志: 代码跑通

## 💻 代码区

```python
"""
监控告警 + 日志聚合
生产级监控系统
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Callable, Any
from enum import Enum
import time
import json
from datetime import datetime, timedelta
from collections import defaultdict
import statistics

# ========== 1. 监控指标 ==========

class MetricType(Enum):
    """指标类型"""
    COUNTER = "counter"      # 计数器
    GAUGE = "gauge"          # 仪表盘
    HISTOGRAM = "histogram"  # 直方图
    SUMMARY = "summary"      # 摘要


@dataclass
class MetricDefinition:
    """指标定义"""
    name: str
    metric_type: MetricType
    description: str
    unit: str = ""
    labels: List[str] = field(default_factory=list)


class MetricsCollector:
    """指标收集器"""
    
    def __init__(self):
        self.metrics: Dict[str, List[Dict]] = defaultdict(list)
        self.counters: Dict[str, int] = defaultdict(int)
        self.gauges: Dict[str, float] = {}
        self.histograms: Dict[str, List[float]] = defaultdict(list)
    
    def increment(self, name: str, value: int = 1, labels: Dict = None):
        """递增计数器"""
        key = self._make_key(name, labels)
        self.counters[key] += value
        self._record(name, self.counters[key], labels)
    
    def set_gauge(self, name: str, value: float, labels: Dict = None):
        """设置仪表盘值"""
        key = self._make_key(name, labels)
        self.gauges[key] = value
        self._record(name, value, labels)
    
    def observe(self, name: str, value: float, labels: Dict = None):
        """记录直方图值"""
        key = self._make_key(name, labels)
        self.histograms[key].append(value)
        # 保留最近 1000 个值
        self.histograms[key] = self.histograms[key][-1000:]
        self._record(name, value, labels)
    
    def _make_key(self, name: str, labels: Dict = None) -> str:
        if labels:
            label_str = ",".join(f"{k}={v}" for k, v in sorted(labels.items()))
            return f"{name}{{{label_str}}}"
        return name
    
    def _record(self, name: str, value: float, labels: Dict = None):
        self.metrics[name].append({
            "timestamp": time.time(),
            "value": value,
            "labels": labels or {}
        })
    
    def get_counter(self, name: str, labels: Dict = None) -> int:
        key = self._make_key(name, labels)
        return self.counters.get(key, 0)
    
    def get_gauge(self, name: str, labels: Dict = None) -> float:
        key = self._make_key(name, labels)
        return self.gauges.get(key, 0.0)
    
    def get_histogram_stats(self, name: str, labels: Dict = None) -> Dict:
        key = self._make_key(name, labels)
        values = self.histograms.get(key, [])
        
        if not values:
            return {}
        
        sorted_vals = sorted(values)
        return {
            "count": len(values),
            "min": sorted_vals[0],
            "max": sorted_vals[-1],
            "mean": statistics.mean(values),
            "median": statistics.median(values),
            "p95": sorted_vals[int(len(sorted_vals) * 0.95)],
            "p99": sorted_vals[int(len(sorted_vals) * 0.99)]
        }
    
    def get_summary(self) -> Dict:
        return {
            "counters": dict(self.counters),
            "gauges": dict(self.gauges),
            "histograms": {
                name: self.get_histogram_stats(name)
                for name in self.histograms.keys()
            }
        }


# ========== 2. 告警系统 ==========

class AlertSeverity(Enum):
    """告警级别"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


@dataclass
class AlertRule:
    """告警规则"""
    name: str
    metric_name: str
    condition: str  # "gt", "lt", "eq"
    threshold: float
    severity: AlertSeverity
    duration: int = 60  # 持续时间（秒）
    message: str = ""


@dataclass
class Alert:
    """告警"""
    rule_name: str
    severity: AlertSeverity
    message: str
    timestamp: datetime
    value: float
    resolved: bool = False


class AlertManager:
    """告警管理器"""
    
    def __init__(self, metrics: MetricsCollector):
        self.metrics = metrics
        self.rules: List[AlertRule] = []
        self.alerts: List[Alert] = []
        self.notification_handlers: List[Callable] = []
    
    def add_rule(self, rule: AlertRule):
        """添加告警规则"""
        self.rules.append(rule)
    
    def add_notification_handler(self, handler: Callable):
        """添加通知处理器"""
        self.notification_handlers.append(handler)
    
    def check_alerts(self) -> List[Alert]:
        """检查告警"""
        new_alerts = []
        
        for rule in self.rules:
            value = self._get_metric_value(rule.metric_name)
            triggered = self._evaluate_condition(value, rule.condition, rule.threshold)
            
            if triggered:
                # 检查是否已存在未解决的告警
                existing = next(
                    (a for a in self.alerts 
                     if a.rule_name == rule.name and not a.resolved),
                    None
                )
                
                if not existing:
                    alert = Alert(
                        rule_name=rule.name,
                        severity=rule.severity,
                        message=rule.message or f"{rule.metric_name} {rule.condition} {rule.threshold}",
                        timestamp=datetime.now(),
                        value=value
                    )
                    self.alerts.append(alert)
                    new_alerts.append(alert)
                    
                    # 发送通知
                    self._send_notifications(alert)
        
        return new_alerts
    
    def _get_metric_value(self, metric_name: str) -> float:
        """获取指标值"""
        # 获取最新的 gauge 或 counter 值
        if metric_name in self.metrics.gauges:
            return self.metrics.gauges[metric_name]
        elif metric_name in self.metrics.counters:
            return self.metrics.counters[metric_name]
        return 0.0
    
    def _evaluate_condition(self, value: float, condition: str, threshold: float) -> bool:
        """评估条件"""
        if condition == "gt":
            return value > threshold
        elif condition == "lt":
            return value < threshold
        elif condition == "eq":
            return value == threshold
        return False
    
    def _send_notifications(self, alert: Alert):
        """发送通知"""
        for handler in self.notification_handlers:
            try:
                handler(alert)
            except Exception as e:
                print(f"通知发送失败: {e}")
    
    def resolve_alert(self, rule_name: str):
        """解决告警"""
        for alert in self.alerts:
            if alert.rule_name == rule_name and not alert.resolved:
                alert.resolved = True
    
    def get_active_alerts(self) -> List[Alert]:
        """获取活跃告警"""
        return [a for a in self.alerts if not a.resolved]


# ========== 3. 日志系统 ==========

class LogLevel(Enum):
    """日志级别"""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


@dataclass
class LogEntry:
    """日志条目"""
    timestamp: datetime
    level: LogLevel
    message: str
    source: str
    trace_id: str = ""
    metadata: Dict = field(default_factory=dict)


class LogAggregator:
    """日志聚合器"""
    
    def __init__(self):
        self.logs: List[LogEntry] = []
        self.indexes: Dict[str, List[int]] = defaultdict(list)
    
    def add_log(self, entry: LogEntry):
        """添加日志"""
        idx = len(self.logs)
        self.logs.append(entry)
        
        # 建立索引
        self.indexes[entry.level.value].append(idx)
        self.indexes[entry.source].append(idx)
        
        if entry.trace_id:
            self.indexes[f"trace:{entry.trace_id}"].append(idx)
    
    def query(
        self,
        level: LogLevel = None,
        source: str = None,
        trace_id: str = None,
        start_time: datetime = None,
        end_time: datetime = None,
        keyword: str = None,
        limit: int = 100
    ) -> List[LogEntry]:
        """查询日志"""
        # 使用索引快速过滤
        if trace_id:
            indices = self.indexes.get(f"trace:{trace_id}", [])
        elif level:
            indices = self.indexes.get(level.value, [])
        elif source:
            indices = self.indexes.get(source, [])
        else:
            indices = range(len(self.logs))
        
        results = []
        for idx in indices:
            if idx >= len(self.logs):
                continue
            
            entry = self.logs[idx]
            
            # 时间过滤
            if start_time and entry.timestamp < start_time:
                continue
            if end_time and entry.timestamp > end_time:
                continue
            
            # 关键词过滤
            if keyword and keyword not in entry.message:
                continue
            
            results.append(entry)
            
            if len(results) >= limit:
                break
        
        return results
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        by_level = defaultdict(int)
        by_source = defaultdict(int)
        
        for entry in self.logs:
            by_level[entry.level.value] += 1
            by_source[entry.source] += 1
        
        return {
            "total_logs": len(self.logs),
            "by_level": dict(by_level),
            "by_source": dict(by_source)
        }
    
    def export(self, format: str = "json") -> str:
        """导出日志"""
        if format == "json":
            logs_dict = [
                {
                    "timestamp": entry.timestamp.isoformat(),
                    "level": entry.level.value,
                    "message": entry.message,
                    "source": entry.source,
                    "trace_id": entry.trace_id
                }
                for entry in self.logs
            ]
            return json.dumps(logs_dict, ensure_ascii=False, indent=2)
        return ""


# ========== 4. 监控系统整合 ==========

class MonitoringSystem:
    """监控系统"""
    
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.metrics = MetricsCollector()
        self.alert_manager = AlertManager(self.metrics)
        self.log_aggregator = LogAggregator()
    
    def log(self, level: LogLevel, message: str, source: str = "", **metadata):
        """记录日志"""
        entry = LogEntry(
            timestamp=datetime.now(),
            level=level,
            message=message,
            source=source or self.service_name,
            metadata=metadata
        )
        self.log_aggregator.add_log(entry)
    
    def record_metric(self, name: str, value: float, labels: Dict = None):
        """记录指标"""
        self.metrics.set_gauge(name, value, labels)
    
    def increment_counter(self, name: str, value: int = 1, labels: Dict = None):
        """递增计数器"""
        self.metrics.increment(name, value, labels)
    
    def check_alerts(self) -> List[Alert]:
        """检查告警"""
        return self.alert_manager.check_alerts()
    
    def get_dashboard(self) -> Dict:
        """获取仪表盘数据"""
        return {
            "service": self.service_name,
            "metrics": self.metrics.get_summary(),
            "alerts": [
                {
                    "rule": a.rule_name,
                    "severity": a.severity.value,
                    "message": a.message,
                    "timestamp": a.timestamp.isoformat(),
                    "resolved": a.resolved
                }
                for a in self.alert_manager.get_active_alerts()
            ],
            "logs": self.log_aggregator.get_statistics()
        }


# ========== 5. 示例运行 ==========

def create_monitoring_system() -> MonitoringSystem:
    """创建监控系统"""
    system = MonitoringSystem("agent-service")
    
    # 添加告警规则
    system.alert_manager.add_rule(AlertRule(
        name="high_error_rate",
        metric_name="error_rate",
        condition="gt",
        threshold=0.1,
        severity=AlertSeverity.CRITICAL,
        message="错误率超过 10%"
    ))
    
    system.alert_manager.add_rule(AlertRule(
        name="high_latency",
        metric_name="avg_latency",
        condition="gt",
        threshold=1.0,
        severity=AlertSeverity.WARNING,
        message="平均延迟超过 1 秒"
    ))
    
    system.alert_manager.add_rule(AlertRule(
        name="low_success_rate",
        metric_name="success_rate",
        condition="lt",
        threshold=0.9,
        severity=AlertSeverity.WARNING,
        message="成功率低于 90%"
    ))
    
    # 添加通知处理器
    def console_notifier(alert: Alert):
        print(f"[{alert.severity.value.upper()}] {alert.message}")
    
    system.alert_manager.add_notification_handler(console_notifier)
    
    return system


def main():
    """主函数"""
    print("=" * 60)
    print("监控告警 + 日志聚合")
    print("=" * 60)
    
    # 1. 创建监控系统
    system = create_monitoring_system()
    
    # 2. 模拟指标收集
    print("\n1. 收集指标:")
    print("-" * 40)
    
    # 模拟请求
    for i in range(100):
        latency = 0.1 + (i % 10) * 0.1
        system.record_metric("avg_latency", latency)
        system.increment_counter("total_requests")
        
        if i % 10 == 0:
            system.increment_counter("error_count")
            system.log(LogLevel.ERROR, f"请求错误 #{i}", source="api")
        else:
            system.log(LogLevel.INFO, f"请求成功 #{i}", source="api")
    
    # 计算错误率和成功率
    total = system.metrics.get_counter("total_requests")
    errors = system.metrics.get_counter("error_count")
    system.record_metric("error_rate", errors / max(total, 1))
    system.record_metric("success_rate", (total - errors) / max(total, 1))
    
    # 3. 检查告警
    print("\n2. 检查告警:")
    print("-" * 40)
    
    alerts = system.check_alerts()
    if alerts:
        for alert in alerts:
            print(f"  [{alert.severity.value}] {alert.message}")
    else:
        print("  无活跃告警")
    
    # 4. 查询日志
    print("\n3. 日志查询:")
    print("-" * 40)
    
    error_logs = system.log_aggregator.query(level=LogLevel.ERROR, limit=5)
    print(f"  错误日志 (最近 5 条):")
    for log in error_logs:
        print(f"    {log.timestamp.strftime('%H:%M:%S')} - {log.message}")
    
    # 5. 仪表盘
    print("\n4. 监控仪表盘:")
    print("-" * 40)
    
    dashboard = system.get_dashboard()
    print(f"  服务: {dashboard['service']}")
    print(f"  总请求数: {dashboard['metrics']['counters'].get('total_requests', 0)}")
    print(f"  错误数: {dashboard['metrics']['counters'].get('error_count', 0)}")
    print(f"  错误率: {dashboard['metrics']['gauges'].get('error_rate', 0)*100:.1f}%")
    print(f"  活跃告警: {len(dashboard['alerts'])}")
    
    # 6. 日志统计
    print("\n5. 日志统计:")
    print("-" * 40)
    
    log_stats = dashboard['logs']
    print(f"  总日志数: {log_stats['total_logs']}")
    print(f"  按级别: {log_stats['by_level']}")
    print(f"  按来源: {log_stats['by_source']}")
    
    # 7. 架构图
    print("\n6. 监控系统架构:")
    print("-" * 40)
    print("""
    ┌─────────────────────────────────────────┐
    │           监控告警系统                    │
    │  ┌─────────────┐  ┌─────────────┐     │
    │  │  指标收集器   │  │  日志聚合器  │     │
    │  │  (Metrics)   │  │   (Logs)    │     │
    │  └─────────────┘  └─────────────┘     │
    │           │                │              │
    │  ┌────────▼────────────────▼────────┐   │
    │  │           告警管理器               │   │
    │  │     (Alert Rules & Notifications) │   │
    │  └───────────────────────────────────┘   │
    │                    │                      │
    │  ┌─────────────────▼─────────────────┐   │
    │  │           监控仪表盘                │   │
    │  │      (Dashboard & Visualization)   │   │
    │  └───────────────────────────────────┘   │
    └─────────────────────────────────────────┘
""")
    
    print("\n7. 监控最佳实践:")
    print("-" * 40)
    print("  1. 监控四大黄金指标:")
    print("     - 延迟 (Latency)")
    print("     - 流量 (Traffic)")
    print("     - 错误 (Errors)")
    print("     - 饱和度 (Saturation)")
    print("  2. 告警分级: INFO → WARNING → CRITICAL")
    print("  3. 日志结构化: 使用 JSON 格式")
    print("  4. 保留策略: 热数据 7 天，温数据 30 天")


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 告警太多 | 调整阈值，合并相似告警 |
| 2 | 告警漏报 | 增加监控指标，优化检测逻辑 |
| 3 | 日志查询慢 | 建立索引，优化查询条件 |
| 4 | 存储空间不足 | 配置日志轮转和保留策略 |
| 5 | 通知延迟 | 使用异步通知，增加通知渠道 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Counter | 只增不减的计数器 |
| Gauge | 可增可减的仪表盘 |
| Histogram | 值分布的直方图 |
| Alert Rule | 告警触发条件 |
| Severity | 告警严重程度 |
| Log Aggregation | 日志收集和汇总 |
| Trace ID | 追踪请求的唯一标识 |

## ✅ 验收清单
- [ ] 能设计监控指标
- [ ] 能设置告警规则
- [ ] 能实现日志聚合
- [ ] 代码能跑通

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
