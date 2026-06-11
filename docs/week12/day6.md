# 📅 Day 6 - 监控与告警

> **Week 12 . 生产部署** | **日期**: 2026-06-20

---

## 今日方向

今天我们学习如何为 Agent 系统构建完整的监控和告警体系。使用 Prometheus 收集指标，Grafana 可视化展示，Loki 聚合日志，Alertmanager 发送告警。让你的生产系统"看得见、摸得着、告得出"。

---

## 生活比喻

> 监控系统就像医院的**监护仪**。心电图（Metrics）实时显示心跳，体温计（Logs）记录温度变化，当指标异常时（Alert），警报响起，医生立即处理。没有监护仪，病人可能在睡梦中出事都没人知道。

---

## 今日三件事

1. **配置 Prometheus 指标收集** -- 定义和暴露关键业务指标
2. **配置 Grafana 仪表盘** -- 可视化展示系统状态
3. **配置告警规则** -- 异常时自动通知运维人员

---

## 手把手路线

### 阶段一：理解监控四大黄金指标

```
Google SRE 四大黄金指标:
1. 延迟 (Latency) -- 请求处理时间
2. 流量 (Traffic) -- 请求量/并发数
3. 错误 (Errors) -- 失败请求比例
4. 饱和度 (Saturation) -- 资源使用率
```

### 阶段二：添加 Prometheus 指标

### 阶段三：配置 Prometheus + Grafana

### 阶段四：配置告警规则

### 阶段五：配置日志聚合

---

## 代码区

### 1. Prometheus 指标定义

```python
# app/metrics.py
"""Prometheus 指标定义"""
from prometheus_client import (
    Counter,
    Histogram,
    Gauge,
    Summary,
    Info,
    generate_latest,
    CONTENT_TYPE_LATEST,
)
from typing import Dict, Optional
import time
from functools import wraps


# ========== 业务指标 ==========

# 请求计数器
REQUEST_COUNT = Counter(
    "agent_requests_total",
    "Agent 请求总数",
    ["method", "endpoint", "status"],
)

# 请求延迟直方图
REQUEST_LATENCY = Histogram(
    "agent_request_duration_seconds",
    "Agent 请求延迟（秒）",
    ["method", "endpoint"],
    buckets=[0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0],
)

# 模型调用计数
MODEL_CALLS = Counter(
    "agent_model_calls_total",
    "模型调用总数",
    ["provider", "model", "status"],
)

# 模型调用延迟
MODEL_LATENCY = Histogram(
    "agent_model_duration_seconds",
    "模型调用延迟（秒）",
    ["provider", "model"],
    buckets=[0.5, 1.0, 2.0, 5.0, 10.0, 30.0],
)

# Token 使用量
TOKEN_USAGE = Counter(
    "agent_tokens_total",
    "Token 使用总量",
    ["provider", "model", "type"],
)

# 活跃连接数
ACTIVE_CONNECTIONS = Gauge(
    "agent_active_connections",
    "当前活跃连接数",
)

# 系统信息
SYSTEM_INFO = Info(
    "agent_system",
    "Agent 系统信息",
)

# 内存使用
MEMORY_USAGE = Gauge(
    "agent_memory_usage_bytes",
    "内存使用量（字节）",
)

# 缓存命中率
CACHE_HITS = Counter(
    "agent_cache_hits_total",
    "缓存命中总数",
)

CACHE_MISSES = Counter(
    "agent_cache_misses_total",
    "缓存未命中总数",
)


# ========== 指标装饰器 ==========

def track_request_metrics(method: str, endpoint: str):
    """请求指标追踪装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            status = "success"

            try:
                result = await func(*args, **kwargs)
                return result
            except Exception as e:
                status = "error"
                raise
            finally:
                latency = time.time() - start_time
                REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=status).inc()
                REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(latency)
                ACTIVE_CONNECTIONS.dec()

        return wrapper
    return decorator


def track_model_call(provider: str, model: str):
    """模型调用指标追踪装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            status = "success"

            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                status = "error"
                raise
            finally:
                latency = time.time() - start_time
                MODEL_CALLS.labels(provider=provider, model=model, status=status).inc()
                MODEL_LATENCY.labels(provider=provider, model=model).observe(latency)

        return wrapper
    return decorator


# ========== 指标管理器 ==========

class MetricsManager:
    """指标管理器"""

    def __init__(self):
        SYSTEM_INFO.info({
            "version": "1.0.0",
            "environment": "production",
        })

    def get_metrics(self) -> bytes:
        """获取所有指标"""
        return generate_latest()

    def get_content_type(self) -> str:
        """获取内容类型"""
        return CONTENT_TYPE_LATEST

    def record_cache_hit(self):
        """记录缓存命中"""
        CACHE_HITS.inc()

    def record_cache_miss(self):
        """记录缓存未命中"""
        CACHE_MISSES.inc()

    def update_memory_usage(self, bytes_used: int):
        """更新内存使用"""
        MEMORY_USAGE.set(bytes_used)
```

### 2. 告警规则配置

```yaml
# monitoring/prometheus/alert_rules.yml
groups:
  - name: agent_alerts
    rules:
      # 高错误率告警
      - alert: HighErrorRate
        expr: |
          rate(agent_requests_total{status="error"}[5m])
          / rate(agent_requests_total[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Agent 错误率过高"
          description: "过去 5 分钟错误率超过 10%，当前值: {{ $value }}"

      # 高延迟告警
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, rate(agent_request_duration_seconds_bucket[5m])) > 5.0
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Agent 延迟过高"
          description: "P95 延迟超过 5 秒，当前值: {{ $value }}s"

      # 模型调用失败告警
      - alert: ModelCallFailures
        expr: |
          rate(agent_model_calls_total{status="error"}[5m]) > 0.05
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "模型调用失败率过高"
          description: "模型调用失败率超过 5%"

      # 内存使用告警
      - alert: HighMemoryUsage
        expr: |
          agent_memory_usage_bytes / 1024 / 1024 > 1024
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "内存使用过高"
          description: "内存使用超过 1GB，当前值: {{ $value }}MB"

      # 缓存命中率低
      - alert: LowCacheHitRate
        expr: |
          rate(agent_cache_hits_total[5m])
          / (rate(agent_cache_hits_total[5m]) + rate(agent_cache_misses_total[5m])) < 0.3
        for: 10m
        labels:
          severity: info
        annotations:
          summary: "缓存命中率低"
          description: "缓存命中率低于 30%，可能需要优化缓存策略"

      # 服务不可用
      - alert: ServiceDown
        expr: up{job="agent-service"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Agent 服务不可用"
          description: "服务实例已停止响应"
```

### 3. Prometheus 配置

```yaml
# monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: "agent-service"
    static_configs:
      - targets: ["agent-api:8000"]
    metrics_path: "/metrics"
    scrape_interval: 10s

  - job_name: "redis"
    static_configs:
      - targets: ["redis:6379"]

  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]
```

### 4. Grafana 仪表盘配置

```json
{
  "dashboard": {
    "title": "Agent Factory Dashboard",
    "tags": ["agent", "production"],
    "panels": [
      {
        "title": "请求量",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(agent_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}} {{status}}"
          }
        ]
      },
      {
        "title": "错误率",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(agent_requests_total{status='error'}[5m]) / rate(agent_requests_total[5m]) * 100"
          }
        ],
        "format": "percent"
      },
      {
        "title": "P95 延迟",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(agent_request_duration_seconds_bucket[5m]))",
            "legendFormat": "P95 Latency"
          }
        ]
      },
      {
        "title": "模型调用分布",
        "type": "piechart",
        "targets": [
          {
            "expr": "sum by (provider) (rate(agent_model_calls_total[5m]))",
            "legendFormat": "{{provider}}"
          }
        ]
      },
      {
        "title": "Token 使用量",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(agent_tokens_total[5m])) by (type)",
            "legendFormat": "{{type}}"
          }
        ]
      },
      {
        "title": "缓存命中率",
        "type": "gauge",
        "targets": [
          {
            "expr": "rate(agent_cache_hits_total[5m]) / (rate(agent_cache_hits_total[5m]) + rate(agent_cache_misses_total[5m])) * 100"
          }
        ],
        "format": "percent"
      }
    ]
  }
}
```

### 5. Alertmanager 配置

```yaml
# monitoring/alertmanager/alertmanager.yml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'webhook'

  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
      group_wait: 10s

    - match:
        severity: warning
      receiver: 'warning-alerts'

receivers:
  - name: 'webhook'
    webhook_configs:
      - url: 'http://agent-api:8000/webhook/alerts'
        send_resolved: true

  - name: 'critical-alerts'
    webhook_configs:
      - url: 'http://agent-api:8000/webhook/alerts'
        send_resolved: true
    # 可以添加邮件、Slack 等通知方式

  - name: 'warning-alerts'
    webhook_configs:
      - url: 'http://agent-api:8000/webhook/alerts'
        send_resolved: true

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname']
```

### 6. Docker Compose（监控栈）

```yaml
# monitoring/docker-compose.monitoring.yml
version: "3.9"

services:
  # ===== Prometheus =====
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./prometheus/alert_rules.yml:/etc/prometheus/alert_rules.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - monitoring

  # ===== Grafana =====
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana-data:/var/lib/grafana
    depends_on:
      - prometheus
    networks:
      - monitoring

  # ===== Alertmanager =====
  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
    networks:
      - monitoring

  # ===== Loki (日志聚合) =====
  loki:
    image: grafana/loki:latest
    container_name: loki
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki
    networks:
      - monitoring

  # ===== Promtail (日志收集) =====
  promtail:
    image: grafana/promtail:latest
    container_name: promtail
    volumes:
      - /var/log:/var/log
      - ./promtail/promtail.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
    depends_on:
      - loki
    networks:
      - monitoring

volumes:
  prometheus-data:
  grafana-data:
  loki-data:

networks:
  monitoring:
    driver: bridge
```

### 7. 应用中集成指标

```python
# app/main_with_metrics.py
"""FastAPI 应用 -- 集成 Prometheus 指标"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import Response

from .config import get_config
from .agent import Agent
from .metrics import (
    MetricsManager,
    REQUEST_COUNT,
    REQUEST_LATENCY,
    ACTIVE_CONNECTIONS,
    track_request_metrics,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

metrics_manager = MetricsManager()
agent: Agent = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global agent
    config = get_config()
    agent = Agent(config)
    logger.info("Agent 应用启动完成")
    yield
    logger.info("Agent 应用关闭")


app = FastAPI(title="Agent Factory API", lifespan=lifespan)


@app.get("/metrics")
async def metrics():
    """Prometheus 指标端点"""
    return Response(
        content=metrics_manager.get_metrics(),
        media_type=metrics_manager.get_content_type(),
    )


@app.get("/health")
@track_request_metrics("GET", "/health")
async def health_check():
    ACTIVE_CONNECTIONS.inc()
    return agent.health_check()


@app.post("/chat")
@track_request_metrics("POST", "/chat")
async def chat(request: dict):
    ACTIVE_CONNECTIONS.inc()
    message = request.get("message", "")
    if not message.strip():
        return {"error": "消息不能为空"}
    result = await agent.process(message)
    return result
```

---

## 预期输出

### Prometheus 启动

```bash
$ docker compose -f monitoring/docker-compose.monitoring.yml up -d
[+] Running 5/5
 ✔ Container prometheus      Started
 ✔ Container alertmanager    Started
 ✔ Container loki            Started
 ✔ Container grafana         Started
 ✔ Container promtail        Started

# 访问 Prometheus
$ curl http://localhost:9090/api/v1/targets
{
  "data": {
    "activeTargets": [
      {
        "scrapeUrl": "http://agent-api:8000/metrics",
        "health": "up",
        "lastScrape": "2026-06-20T10:00:00Z"
      }
    ]
  }
}
```

### Grafana 访问

```
打开浏览器: http://localhost:3000
用户名: admin
密码: admin123

添加数据源:
1. 点击 Configuration -> Data Sources
2. 添加 Prometheus
3. URL: http://prometheus:9090
4. 保存并测试
```

### 指标输出

```bash
$ curl http://localhost:8000/metrics
# HELP agent_requests_total Agent 请求总数
# TYPE agent_requests_total counter
agent_requests_total{endpoint="/chat",method="POST",status="success"} 150.0
agent_requests_total{endpoint="/health",method="GET",status="success"} 500.0

# HELP agent_request_duration_seconds Agent 请求延迟（秒）
# TYPE agent_request_duration_seconds histogram
agent_request_duration_seconds_bucket{endpoint="/chat",method="POST",le="0.5"} 120.0
agent_request_duration_seconds_bucket{endpoint="/chat",method="POST",le="1.0"} 145.0
agent_request_duration_seconds_bucket{endpoint="/chat",method="POST",le="2.5"} 150.0

# HELP agent_model_calls_total 模型调用总数
# TYPE agent_model_calls_total counter
agent_model_calls_total{model="gpt-4",provider="openai",status="success"} 148.0
agent_model_calls_total{model="gpt-4",provider="openai",status="error"} 2.0

# HELP agent_tokens_total Token 使用总量
# TYPE agent_tokens_total counter
agent_tokens_total{model="gpt-4",provider="openai",type="completion"} 7500.0
agent_tokens_total{model="gpt-4",provider="openai",type="prompt"} 4500.0
```

### 告警触发示例

```bash
# 模拟高错误率
$ for i in {1..20}; do
    curl -X POST http://localhost:8000/chat \
      -d '{"message": ""}' > /dev/null 2>&1
  done

# 查看告警
$ curl http://localhost:9090/api/v1/alerts
{
  "data": {
    "alerts": [
      {
        "labels": {
          "alertname": "HighErrorRate",
          "severity": "critical"
        },
        "annotations": {
          "summary": "Agent 错误率过高",
          "description": "过去 5 分钟错误率超过 10%"
        },
        "state": "firing"
      }
    ]
  }
}
```

---

## 常见错误和解决方案

### 错误 1: Prometheus 无法抓取指标

```
Get "http://agent-api:8000/metrics": dial tcp: connection refused
```

**解决方案**:
```bash
# 检查服务是否运行
docker compose ps
# 检查网络连通性
docker network inspect monitoring_monitoring
# 手动测试
curl http://localhost:8000/metrics
```

### 错误 2: Grafana 无法连接 Prometheus

**解决方案**:
```
1. 检查数据源配置
2. 确保 Prometheus URL 正确: http://prometheus:9090
3. 使用 Docker 网络中的服务名，不要用 localhost
```

### 错误 3: 告警规则语法错误

```bash
# 检查规则语法
$ docker exec prometheus promtool check rules /etc/prometheus/alert_rules.yml
```

### 错误 4: 日志量过大导致 Loki 存储满了

**解决方案**:
```yaml
# 在 promtail 配置中添加日志过滤
scrape_configs:
  - job_name: agent-logs
    pipeline_stages:
      - regex:
          expression: '.*DEBUG.*'
      - drop:
          expression: '.*DEBUG.*'
```

### 错误 5: 告警风暴（同一问题收到大量告警）

**解决方案**:
```yaml
# 在 alertmanager.yml 中配置分组和抑制
route:
  group_by: ['alertname', 'severity']
  group_wait: 30s      # 等待 30 秒再发送
  group_interval: 5m   # 同组告警间隔
  repeat_interval: 4h  # 重复告警间隔

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname']
```

---

## 每日挑战

### 挑战 1: 基础练习

1. 为 Agent 应用添加 3 个自定义指标
2. 配置 Prometheus 抓取这些指标
3. 在 Grafana 中创建一个简单的仪表盘

### 挑战 2: 进阶练习

1. 添加 **请求追踪**（每个请求生成唯一 trace ID）
2. 实现 **日志结构化**（JSON 格式日志）
3. 配置 **告警通知**（发送到 Slack 或邮件）
4. 创建 **SLI/SLO 仪表盘**（服务级别指标）

### 挑战 3: 生产实战

1. 部署完整的监控栈（Prometheus + Grafana + Loki + Alertmanager）
2. 配置 5 个以上告警规则
3. 模拟各种故障场景，验证告警是否正常触发
4. 优化日志保留策略，平衡存储成本和查询需求

---

> **明天预告**: Day 7 我们将进行 Week 12 的全面复盘，总结生产部署的关键知识点，梳理最佳实践。
