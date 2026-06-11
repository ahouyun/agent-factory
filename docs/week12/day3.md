# 📅 Day 3 - Model Fallback + vLLM 推理优化

> **Week 12 . 生产部署** | **日期**: 2026-06-17

---

## 今日方向

今天我们学习如何设计模型 Fallback 机制，实现多供应商自动切换，并使用 vLLM 搭建高性能本地推理服务。当主模型 API 不可用时，系统自动降级到备用模型，确保 Agent 服务永不中断。

---

## 生活比喻

> 模型 Fallback 就像**导航软件**。当你主路堵车时，导航自动切换到备选路线。vLLM 就像在你家门口建了一个**私人加油站**——不用排队等公共加油站（API 服务），自己的车随时能加满油（推理）。

---

## 今日三件事

1. **设计多供应商 Fallback 链** -- 实现自动降级和恢复
2. **实现健康检查和状态追踪** -- 监控每个模型供应商的健康状态
3. **部署 vLLM 推理服务** -- 搭建本地高性能推理引擎

---

## 手把手路线

### 阶段一：理解 Fallback 设计模式

```
Fallback 链: 主模型 -> 备用模型1 -> 备用模型2 -> 降级响应

触发条件:
  - API 超时 (> 30s)
  - 返回错误状态码 (5xx)
  - 健康检查失败 (成功率 < 80%)
  - Token 余额不足
  - 请求频率超限 (429)
```

### 阶段二：实现健康状态追踪器

### 阶段三：实现 Fallback 管理器

### 阶段四：部署 vLLM 服务

### 阶段五：集成测试

---

## 代码区

### 1. 供应商配置

```python
# app/providers.py
"""多供应商模型管理"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from enum import Enum
import time
import random
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class ModelProvider(Enum):
    """模型供应商枚举"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    VLLM_LOCAL = "vllm_local"


@dataclass
class ModelConfig:
    """模型配置"""
    provider: ModelProvider
    model_name: str
    api_key: str = ""
    endpoint: str = ""
    priority: int = 1
    max_retries: int = 3
    timeout: float = 30.0
    cost_per_1k_tokens: float = 0.0
    enabled: bool = True
```

### 2. 健康状态追踪器

```python
# app/health_tracker.py
"""模型供应商健康状态追踪"""
from dataclasses import dataclass
from typing import Dict, List, Optional
from enum import Enum
from datetime import datetime
import threading


class HealthStatus(Enum):
    """健康状态"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"


@dataclass
class HealthRecord:
    """健康记录"""
    provider: str
    status: HealthStatus
    last_check: datetime
    success_rate: float
    avg_latency: float
    error_count: int = 0
    last_error: str = ""


class HealthTracker:
    """健康状态追踪器"""

    def __init__(self, window_size: int = 100):
        self.window_size = window_size
        self.records: Dict[str, HealthRecord] = {}
        self.success_history: Dict[str, List[bool]] = {}
        self.latency_history: Dict[str, List[float]] = {}
        self.lock = threading.Lock()

    def record_success(self, provider: str, latency: float):
        """记录成功调用"""
        with self.lock:
            if provider not in self.success_history:
                self.success_history[provider] = []
                self.latency_history[provider] = []

            self.success_history[provider].append(True)
            self.latency_history[provider].append(latency)

            # 保留最近 N 条记录
            self.success_history[provider] = self.success_history[provider][-self.window_size:]
            self.latency_history[provider] = self.latency_history[provider][-self.window_size:]

            self._update_health(provider)

    def record_failure(self, provider: str, error: str = ""):
        """记录失败调用"""
        with self.lock:
            if provider not in self.success_history:
                self.success_history[provider] = []

            self.success_history[provider].append(False)
            self.success_history[provider] = self.success_history[provider][-self.window_size:]

            self._update_health(provider, error)

    def _update_health(self, provider: str, error: str = ""):
        """更新健康状态"""
        history = self.success_history.get(provider, [])
        latency = self.latency_history.get(provider, [])

        if not history:
            return

        success_rate = sum(history) / len(history)
        avg_latency = sum(latency) / len(latency) if latency else 0

        # 判断健康状态
        if success_rate >= 0.95:
            status = HealthStatus.HEALTHY
        elif success_rate >= 0.80:
            status = HealthStatus.DEGRADED
        else:
            status = HealthStatus.UNHEALTHY

        self.records[provider] = HealthRecord(
            provider=provider,
            status=status,
            last_check=datetime.now(),
            success_rate=success_rate,
            avg_latency=avg_latency,
            error_count=sum(1 for h in history if not h),
            last_error=error,
        )

    def is_healthy(self, provider: str) -> bool:
        """检查供应商是否健康"""
        record = self.records.get(provider)
        if record is None:
            return True  # 未记录视为健康
        return record.status != HealthStatus.UNHEALTHY

    def get_health(self, provider: str) -> Optional[HealthRecord]:
        """获取供应商健康记录"""
        return self.records.get(provider)

    def get_all_health(self) -> Dict[str, HealthRecord]:
        """获取所有供应商健康状态"""
        return dict(self.records)
```

### 3. 模型客户端

```python
# app/model_client.py
"""模型调用客户端"""
import time
import random
from typing import Dict, Any


class ModelClient:
    """模型调用客户端"""

    def __init__(self, provider: str, model_name: str, endpoint: str = ""):
        self.provider = provider
        self.model_name = model_name
        self.endpoint = endpoint
        self.call_count = 0
        self.total_tokens = 0

    def call(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """调用模型 API"""
        start_time = time.time()
        self.call_count += 1

        try:
            # 模拟 API 调用（实际使用时替换为真实 API）
            response = self._mock_api_call(prompt, **kwargs)

            latency = time.time() - start_time
            tokens = response.get("usage", {}).get("total_tokens", 100)
            self.total_tokens += tokens

            return {
                "success": True,
                "response": response["text"],
                "latency": latency,
                "tokens": tokens,
                "provider": self.provider,
                "model": self.model_name,
            }
        except Exception as e:
            latency = time.time() - start_time
            return {
                "success": False,
                "error": str(e),
                "latency": latency,
                "provider": self.provider,
                "model": self.model_name,
            }

    def _mock_api_call(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """模拟 API 调用（开发/测试用）"""
        time.sleep(0.01)  # 模拟网络延迟

        # 模拟 10% 的失败率
        if random.random() < 0.1:
            raise Exception(f"模拟 {self.provider} API 错误")

        return {
            "text": f"[{self.provider}/{self.model_name}] 对 '{prompt[:30]}...' 的回答",
            "usage": {
                "prompt_tokens": len(prompt.split()),
                "completion_tokens": 50,
                "total_tokens": len(prompt.split()) + 50,
            },
        }
```

### 4. Fallback 管理器

```python
# app/fallback_manager.py
"""模型 Fallback 管理器"""
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field

from .providers import ModelConfig, ModelProvider
from .health_tracker import HealthTracker, HealthStatus
from .model_client import ModelClient


@dataclass
class FallbackResult:
    """Fallback 调用结果"""
    success: bool
    response: str = ""
    provider: str = ""
    model: str = ""
    latency: float = 0.0
    tokens: int = 0
    fallback_used: bool = False
    attempted_providers: List[str] = field(default_factory=list)
    error: str = ""


class FallbackManager:
    """模型 Fallback 管理器"""

    def __init__(self, configs: List[ModelConfig]):
        # 按优先级排序
        self.configs = sorted(configs, key=lambda c: c.priority)
        self.clients: Dict[str, ModelClient] = {}
        self.health_tracker = HealthTracker()

        # 初始化客户端
        for config in self.configs:
            client = ModelClient(
                provider=config.provider.value,
                model_name=config.model_name,
                endpoint=config.endpoint,
            )
            self.clients[config.provider.value] = client

    def call(self, prompt: str, **kwargs) -> FallbackResult:
        """
        带 Fallback 的模型调用

        策略:
        1. 按优先级尝试调用
        2. 失败时自动切换到下一个供应商
        3. 记录健康状态用于后续决策
        """
        attempted = []
        errors = []

        for config in self.configs:
            if not config.enabled:
                continue

            provider_key = config.provider.value

            # 跳过不健康的供应商
            if not self.health_tracker.is_healthy(provider_key):
                logger.info(f"跳过不健康的供应商: {provider_key}")
                continue

            client = self.clients[provider_key]

            try:
                result = client.call(prompt, **kwargs)

                if result["success"]:
                    # 记录成功
                    self.health_tracker.record_success(
                        provider_key, result["latency"]
                    )
                    return FallbackResult(
                        success=True,
                        response=result["response"],
                        provider=provider_key,
                        model=config.model_name,
                        latency=result["latency"],
                        tokens=result["tokens"],
                        fallback_used=len(attempted) > 0,
                        attempted_providers=attempted,
                    )
                else:
                    # 记录失败
                    self.health_tracker.record_failure(provider_key, result["error"])
                    attempted.append(provider_key)
                    errors.append({"provider": provider_key, "error": result["error"]})

            except Exception as e:
                self.health_tracker.record_failure(provider_key, str(e))
                attempted.append(provider_key)
                errors.append({"provider": provider_key, "error": str(e)})

        # 所有供应商都失败
        return FallbackResult(
            success=False,
            error="所有模型供应商都不可用",
            attempted_providers=attempted,
        )

    def get_available_providers(self) -> List[Dict]:
        """获取可用供应商列表"""
        providers = []
        for config in self.configs:
            if not config.enabled:
                continue
            health = self.health_tracker.get_health(config.provider.value)
            providers.append({
                "provider": config.provider.value,
                "model": config.model_name,
                "priority": config.priority,
                "health": health.status.value if health else "unknown",
                "success_rate": health.success_rate if health else 1.0,
            })
        return providers

    def get_stats(self) -> Dict:
        """获取统计信息"""
        return {
            "total_calls": sum(c.call_count for c in self.clients.values()),
            "total_tokens": sum(c.total_tokens for c in self.clients.values()),
            "providers": {
                name: {"calls": c.call_count, "tokens": c.total_tokens}
                for name, c in self.clients.items()
            },
            "health": {
                name: {
                    "status": h.status.value,
                    "success_rate": h.success_rate,
                }
                for name, h in self.health_tracker.get_all_health().items()
            },
        }


# 避免循环导入
import logging
logger = logging.getLogger(__name__)
```

### 5. vLLM 配置与部署

```bash
#!/bin/bash
# scripts/setup-vllm.sh
# vLLM 推理服务部署脚本
set -euo pipefail

echo "=== vLLM 推理服务部署 ==="

# 检查 GPU
if ! command -v nvidia-smi &> /dev/null; then
    echo "警告: 未检测到 NVIDIA GPU，vLLM 将使用 CPU 模式（性能较低）"
fi

# 安装 vLLM
echo "步骤 1: 安装 vLLM..."
pip install vllm

# 创建模型目录
echo "步骤 2: 创建模型目录..."
mkdir -p models

# 下载模型（以 Qwen2.5-7B 为例）
echo "步骤 3: 下载模型..."
python -c "
from huggingface_hub import snapshot_download
snapshot_download(
    'Qwen/Qwen2.5-7B-Instruct',
    local_dir='models/Qwen2.5-7B-Instruct'
)
print('模型下载完成')
"

# 启动 vLLM 服务
echo "步骤 4: 启动 vLLM 服务..."
echo "服务将在 http://localhost:8001 启动"

python -m vllm.entrypoints.openai.api_server \
    --model models/Qwen2.5-7B-Instruct \
    --host 0.0.0.0 \
    --port 8001 \
    --max-model-len 4096 \
    --gpu-memory-utilization 0.9 \
    --dtype auto

echo "vLLM 服务启动完成"
```

### 6. docker-compose.yml（含 vLLM）

```yaml
# docker-compose.yml
version: "3.9"

services:
  # ===== Agent 主服务 =====
  agent-api:
    build: .
    container_name: agent-api
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - VLLM_ENDPOINT=http://vllm:8001
      - OPENAI_API_KEY=${OPENAI_API_KEY:-dummy}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-dummy}
    depends_on:
      - vllm
      - redis
    networks:
      - agent-network

  # ===== vLLM 本地推理服务 =====
  vllm:
    image: vllm/vllm-openai:latest
    container_name: vllm-service
    restart: unless-stopped
    ports:
      - "8001:8001"
    volumes:
      - ./models:/models
    environment:
      - HUGGING_FACE_HUB_TOKEN=${HF_TOKEN:-}
    command: >
      --model /models/Qwen2.5-7B-Instruct
      --host 0.0.0.0
      --port 8001
      --max-model-len 4096
      --gpu-memory-utilization 0.9
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    networks:
      - agent-network

  # ===== Redis =====
  redis:
    image: redis:7-alpine
    container_name: agent-redis
    ports:
      - "6379:6379"
    networks:
      - agent-network

networks:
  agent-network:
    driver: bridge
```

### 7. 完整 Fallback 使用示例

```python
# examples/fallback_demo.py
"""Fallback 机制演示"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.providers import ModelConfig, ModelProvider
from app.fallback_manager import FallbackManager


def main():
    """演示 Fallback 机制"""
    print("=" * 60)
    print("模型 Fallback 机制演示")
    print("=" * 60)

    # 创建模型配置
    configs = [
        ModelConfig(
            provider=ModelProvider.OPENAI,
            model_name="gpt-4",
            priority=1,
            cost_per_1k_tokens=0.03,
        ),
        ModelConfig(
            provider=ModelProvider.ANTHROPIC,
            model_name="claude-3-opus",
            priority=2,
            cost_per_1k_tokens=0.015,
        ),
        ModelConfig(
            provider=ModelProvider.GOOGLE,
            model_name="gemini-pro",
            priority=3,
            cost_per_1k_tokens=0.01,
        ),
        ModelConfig(
            provider=ModelProvider.VLLM_LOCAL,
            model_name="Qwen2.5-7B-Instruct",
            endpoint="http://localhost:8001",
            priority=4,
            cost_per_1k_tokens=0.0,
        ),
    ]

    # 创建 Fallback 管理器
    manager = FallbackManager(configs)

    # 展示可用供应商
    print("\n可用供应商:")
    for p in manager.get_available_providers():
        print(f"  [{p['priority']}] {p['provider']}/{p['model']} "
              f"- 健康: {p['health']}, 成功率: {p['success_rate']:.1%}")

    # 测试调用
    prompts = [
        "什么是机器学习?",
        "解释 API 的概念",
        "设计一个微服务架构",
    ]

    print("\n调用测试:")
    for prompt in prompts:
        result = manager.call(prompt)
        status = "成功" if result.success else "失败"
        fallback = "是" if result.fallback_used else "否"
        print(f"\n  问题: {prompt}")
        print(f"  状态: {status}")
        print(f"  供应商: {result.provider}/{result.model}")
        print(f"  使用 Fallback: {fallback}")
        if result.attempted_providers:
            print(f"  尝试过: {', '.join(result.attempted_providers)}")
        if not result.success:
            print(f"  错误: {result.error}")

    # 统计信息
    stats = manager.get_stats()
    print("\n统计信息:")
    print(f"  总调用次数: {stats['total_calls']}")
    print(f"  总 Token 数: {stats['total_tokens']}")
    print("\n各供应商统计:")
    for provider, s in stats["providers"].items():
        print(f"  {provider}: {s['calls']} 次调用, {s['tokens']} tokens")


if __name__ == "__main__":
    main()
```

---

## 预期输出

### Fallback 演示输出

```bash
$ python examples/fallback_demo.py
============================================================
模型 Fallback 机制演示
============================================================

可用供应商:
  [1] openai/gpt-4 - 健康: healthy, 成功率: 100.0%
  [2] anthropic/claude-3-opus - 健康: healthy, 成功率: 100.0%
  [3] google/gemini-pro - 健康: healthy, 成功率: 100.0%
  [4] vllm_local/Qwen2.5-7B-Instruct - 健康: healthy, 成功率: 100.0%

调用测试:

  问题: 什么是机器学习?
  状态: 成功
  供应商: openai/gpt-4
  使用 Fallback: 否

  问题: 解释 API 的概念
  状态: 成功
  供应商: openai/gpt-4
  使用 Fallback: 否

  问题: 设计一个微服务架构
  状态: 成功
  供应商: openai/gpt-4
  使用 Fallback: 否

统计信息:
  总调用次数: 3
  总 Token 数: 450

各供应商统计:
  openai: 3 次调用, 450 tokens
  anthropic: 0 次调用, 0 tokens
  google: 0 次调用, 0 tokens
  vllm_local: 0 次调用, 0 tokens
```

### vLLM 服务启动输出

```bash
$ python -m vllm.entrypoints.openai.api_server \
    --model models/Qwen2.5-7B-Instruct \
    --port 8001
INFO 06-17 10:00:00 api_server.py:195] vLLM API server started on http://0.0.0.0:8001
INFO 06-17 10:00:01 llm_engine.py:100] Initializing LLM engine with model: models/Qwen2.5-7B-Instruct
INFO 06-17 10:00:05 llm_engine.py:200] Starting scheduling loop
INFO 06-17 10:00:05 api_server.py:200] Application startup complete.

# 测试 vLLM API
$ curl http://localhost:8001/v1/models
{
  "data": [
    {
      "id": "Qwen2.5-7B-Instruct",
      "object": "model",
      "owned_by": "local"
    }
  ]
}

$ curl -X POST http://localhost:8001/v1/chat/completions \
    -H "Content-Type: application/json" \
    -d '{
      "model": "Qwen2.5-7B-Instruct",
      "messages": [{"role": "user", "content": "Hello!"}]
    }'
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      }
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 12,
    "total_tokens": 22
  }
}
```

### 健康状态变化输出

```bash
# 模拟供应商故障
$ python -c "
from app.health_tracker import HealthTracker

tracker = HealthTracker()

# 模拟 OpenAI 连续失败
for i in range(10):
    tracker.record_failure('openai', f'错误 {i}')

health = tracker.get_health('openai')
print(f'OpenAI 状态: {health.status.value}')
print(f'成功率: {health.success_rate:.1%}')
print(f'错误数: {health.error_count}')
"
OpenAI 状态: unhealthy
成功率: 0.0%
错误数: 10
```

---

## 常见错误和解决方案

### 错误 1: 所有供应商都不可用

```
FallbackResult(success=False, error='所有模型供应商都不可用')
```

**原因**: 所有供应商的健康状态都变为 UNHEALTHY。

**解决方案**:
```python
# 检查健康状态
for provider, health in manager.health_tracker.get_all_health().items():
    print(f"{provider}: {health.status.value}")

# 手动重置健康状态（紧急情况）
manager.health_tracker.records.clear()
```

### 错误 2: vLLM GPU 内存不足

```
torch.cuda.OutOfMemoryError: CUDA out of memory
```

**解决方案**:
```bash
# 减少 GPU 内存使用
python -m vllm.entrypoints.openai.api_server \
    --model models/Qwen2.5-7B-Instruct \
    --gpu-memory-utilization 0.7 \
    --max-model-len 2048

# 或使用量化模型
python -m vllm.entrypoints.openai.api_server \
    --model models/Qwen2.5-7B-Instruct-GPTQ \
    --quantization gptq
```

### 错误 3: vLLM 模型下载失败

```
HTTPSConnectionPool: Max retries exceeded
```

**解决方案**:
```bash
# 使用镜像源
export HF_ENDPOINT=https://hf-mirror.com
python -m vllm.entrypoints.openai.api_server \
    --model Qwen/Qwen2.5-7B-Instruct

# 或手动下载后指定路径
python -m vllm.entrypoints.openai.api_server \
    --model /path/to/local/model
```

### 错误 4: Fallback 切换太频繁

**原因**: 健康检查窗口太小，导致误判。

**解决方案**:
```python
# 增大健康检查窗口
tracker = HealthTracker(window_size=200)

# 调整健康阈值
if success_rate >= 0.90:  # 降低阈值
    status = HealthStatus.HEALTHY
```

### 错误 5: 延迟统计不准确

**解决方案**:
```python
# 使用滑动窗口计算延迟
import statistics

def get_recent_latency(self, provider: str, window: int = 50) -> float:
    """获取最近 N 次调用的平均延迟"""
    latencies = self.latency_history.get(provider, [])
    recent = latencies[-window:]
    return statistics.mean(recent) if recent else 0.0
```

---

## 每日挑战

### 挑战 1: 基础练习

1. 实现一个简单的 FallbackManager，支持 3 个供应商
2. 添加健康检查功能，当供应商成功率低于 80% 时自动跳过
3. 编写测试验证 Fallback 逻辑

### 挑战 2: 进阶练习

1. 为 FallbackManager 添加 **延迟统计** 功能
2. 实现 **延迟感知路由**（优先选择延迟最低的供应商）
3. 添加 **成本追踪**（记录每次调用的成本）
4. 实现 **自动恢复**（供应商恢复后自动重新启用）

### 挑战 3: 生产实战

1. 使用 Docker Compose 部署 vLLM 服务
2. 配置 FallbackManager 连接 vLLM 和云端 API
3. 测试当云端 API 不可用时，自动切换到本地 vLLM
4. 监控切换过程中的延迟变化

---

> **明天预告**: Day 4 我们将学习成本优化和 Prompt 缓存策略，让 Agent 在保证质量的同时大幅降低 API 调用成本。
