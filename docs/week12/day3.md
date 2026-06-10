# 📅 Week 12 Day 3：模型 Fallback：多供应商切换

## 🧭 今日方向
> 学习如何设计模型 Fallback 机制，实现多供应商切换，提高 Agent 系统的可用性。

## 🎯 生活比喻
> 模型 Fallback 就像导航软件。当你主路堵车时，导航会自动切换到备选路线。同样，当主模型 API 不可用时，系统自动切换到备用模型，确保 Agent 服务不中断。

## 📋 今日三件事
1. 理解 Fallback 机制的设计原则
2. 实现多供应商模型切换逻辑
3. 设计降级策略和优先级管理

## 🗺️ 手把手路线

### Step 1：理解 Fallback 设计
- 做什么: 学习 Fallback 的触发条件和策略
- 为什么: 高可用系统必须有降级方案
- 成功标志: 能解释 Fallback 的触发条件

### Step 2：多供应商管理
- 做什么: 设计统一的模型接口和供应商管理
- 为什么: 不同供应商有不同的 API 格式
- 成功标志: 能设计统一的模型调用接口

### Step 3：优先级和健康检查
- 做什么: 实现模型优先级管理和健康检查
- 为什么: 确保优先使用最佳模型
- 成功标志: 能实现健康检查和自动切换

### Step 4：代码实践
- 做什么: 实现完整的 Fallback 机制
- 为什么: 代码是最好的理解方式
- 成功标志: 代码跑通

## 💻 代码区

```python
"""
模型 Fallback：多供应商切换
完整的降级和切换机制
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Callable
from enum import Enum
import time
import random
from datetime import datetime, timedelta
import json

# ========== 1. 供应商配置 ==========

class ModelProvider(Enum):
    """模型供应商"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    LOCAL = "local"


@dataclass
class ModelConfig:
    """模型配置"""
    provider: ModelProvider
    model_name: str
    api_key: str = ""
    endpoint: str = ""
    priority: int = 1  # 优先级，数字越小优先级越高
    max_retries: int = 3
    timeout: float = 30.0
    rate_limit: int = 100  # 每分钟请求数
    cost_per_1k_tokens: float = 0.0
    enabled: bool = True


# ========== 2. 健康状态追踪 ==========

class HealthStatus(Enum):
    """健康状态"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"


@dataclass
class HealthRecord:
    """健康记录"""
    provider: ModelProvider
    status: HealthStatus
    last_check: datetime
    success_rate: float
    avg_latency: float
    error_count: int = 0
    last_error: str = ""


class HealthTracker:
    """健康状态追踪器"""
    
    def __init__(self):
        self.records: Dict[ModelProvider, HealthRecord] = {}
        self.success_history: Dict[ModelProvider, List[bool]] = {}
        self.latency_history: Dict[ModelProvider, List[float]] = {}
    
    def record_success(self, provider: ModelProvider, latency: float):
        """记录成功调用"""
        if provider not in self.success_history:
            self.success_history[provider] = []
        if provider not in self.latency_history:
            self.latency_history[provider] = []
        
        self.success_history[provider].append(True)
        self.latency_history[provider].append(latency)
        
        # 保留最近 100 条记录
        self.success_history[provider] = self.success_history[provider][-100:]
        self.latency_history[provider] = self.latency_history[provider][-100:]
        
        self._update_health(provider)
    
    def record_failure(self, provider: ModelProvider, error: str):
        """记录失败调用"""
        if provider not in self.success_history:
            self.success_history[provider] = []
        
        self.success_history[provider].append(False)
        self.success_history[provider] = self.success_history[provider][-100:]
        
        self._update_health(provider, error)
    
    def _update_health(self, provider: ModelProvider, error: str = ""):
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
        elif success_rate >= 0.8:
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
            last_error=error
        )
    
    def get_health(self, provider: ModelProvider) -> Optional[HealthRecord]:
        """获取健康状态"""
        return self.records.get(provider)
    
    def is_healthy(self, provider: ModelProvider) -> bool:
        """检查是否健康"""
        record = self.records.get(provider)
        return record.status == HealthStatus.HEALTHY if record else True


# ========== 3. 模型客户端 ==========

class ModelClient:
    """模型调用客户端"""
    
    def __init__(self, config: ModelConfig):
        self.config = config
        self.call_count = 0
        self.total_tokens = 0
    
    def call(self, prompt: str, **kwargs) -> Dict:
        """调用模型"""
        start_time = time.time()
        self.call_count += 1
        
        try:
            # 模拟模型调用
            # 实际应用中这里会调用真实的 API
            response = self._mock_call(prompt, **kwargs)
            
            latency = time.time() - start_time
            tokens = response.get("usage", {}).get("total_tokens", 100)
            self.total_tokens += tokens
            
            return {
                "success": True,
                "response": response["text"],
                "latency": latency,
                "tokens": tokens,
                "provider": self.config.provider.value,
                "model": self.config.model_name
            }
        except Exception as e:
            latency = time.time() - start_time
            return {
                "success": False,
                "error": str(e),
                "latency": latency,
                "provider": self.config.provider.value,
                "model": self.config.model_name
            }
    
    def _mock_call(self, prompt: str, **kwargs) -> Dict:
        """模拟调用（实际使用时替换为真实 API 调用）"""
        # 模拟延迟
        time.sleep(0.01)
        
        # 模拟偶尔失败
        if random.random() < 0.1:
            raise Exception("模拟 API 错误")
        
        return {
            "text": f"来自 {self.config.provider.value} 的回答: {prompt[:50]}...",
            "usage": {"prompt_tokens": 50, "completion_tokens": 50, "total_tokens": 100}
        }


# ========== 4. Fallback 管理器 ==========

class FallbackManager:
    """Fallback 管理器"""
    
    def __init__(self, configs: List[ModelConfig]):
        # 按优先级排序
        self.configs = sorted(configs, key=lambda c: c.priority)
        self.clients: Dict[ModelProvider, ModelClient] = {}
        self.health_tracker = HealthTracker()
        
        # 初始化客户端
        for config in self.configs:
            self.clients[config.provider] = ModelClient(config)
    
    def call(self, prompt: str, **kwargs) -> Dict:
        """
        带 Fallback 的模型调用
        
        策略：
        1. 按优先级尝试调用
        2. 失败时自动切换到下一个
        3. 记录健康状态
        """
        errors = []
        
        for config in self.configs:
            if not config.enabled:
                continue
            
            # 检查健康状态
            if not self.health_tracker.is_healthy(config.provider):
                print(f"跳过不健康的供应商: {config.provider.value}")
                continue
            
            client = self.clients[config.provider]
            
            try:
                result = client.call(prompt, **kwargs)
                
                if result["success"]:
                    # 记录成功
                    self.health_tracker.record_success(
                        config.provider,
                        result["latency"]
                    )
                    result["fallback_used"] = len(errors) > 0
                    result["attempted_providers"] = [e["provider"] for e in errors]
                    return result
                else:
                    # 记录失败
                    self.health_tracker.record_failure(
                        config.provider,
                        result["error"]
                    )
                    errors.append({
                        "provider": config.provider.value,
                        "error": result["error"]
                    })
            except Exception as e:
                self.health_tracker.record_failure(config.provider, str(e))
                errors.append({
                    "provider": config.provider.value,
                    "error": str(e)
                })
        
        # 所有供应商都失败
        return {
            "success": False,
            "error": "所有模型供应商都不可用",
            "errors": errors
        }
    
    def get_available_providers(self) -> List[Dict]:
        """获取可用供应商列表"""
        providers = []
        for config in self.configs:
            if not config.enabled:
                continue
            
            health = self.health_tracker.get_health(config.provider)
            providers.append({
                "provider": config.provider.value,
                "model": config.model_name,
                "priority": config.priority,
                "enabled": config.enabled,
                "health": health.status.value if health else "unknown",
                "success_rate": health.success_rate if health else 1.0
            })
        
        return providers
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        stats = {
            "total_calls": sum(c.call_count for c in self.clients.values()),
            "total_tokens": sum(c.total_tokens for c in self.clients.values()),
            "providers": {}
        }
        
        for provider, client in self.clients.items():
            stats["providers"][provider.value] = {
                "calls": client.call_count,
                "tokens": client.total_tokens
            }
        
        return stats


# ========== 5. 示例运行 ==========

def create_configs() -> List[ModelConfig]:
    """创建示例配置"""
    return [
        ModelConfig(
            provider=ModelProvider.OPENAI,
            model_name="gpt-4",
            priority=1,
            cost_per_1k_tokens=0.03,
            rate_limit=60
        ),
        ModelConfig(
            provider=ModelProvider.ANTHROPIC,
            model_name="claude-3-opus",
            priority=2,
            cost_per_1k_tokens=0.015,
            rate_limit=50
        ),
        ModelConfig(
            provider=ModelProvider.GOOGLE,
            model_name="gemini-pro",
            priority=3,
            cost_per_1k_tokens=0.01,
            rate_limit=100
        ),
        ModelConfig(
            provider=ModelProvider.LOCAL,
            model_name="llama-2-70b",
            priority=4,
            cost_per_1k_tokens=0.0,
            rate_limit=1000
        ),
    ]


def main():
    """主函数"""
    print("=" * 60)
    print("模型 Fallback：多供应商切换")
    print("=" * 60)
    
    # 1. 创建配置
    configs = create_configs()
    
    # 2. 创建 Fallback 管理器
    manager = FallbackManager(configs)
    
    # 3. 展示可用供应商
    print("\n1. 可用供应商:")
    print("-" * 40)
    providers = manager.get_available_providers()
    for p in providers:
        print(f"  {p['provider']}/{p['model']}: 优先级={p['priority']}, 健康={p['health']}")
    
    # 4. 模拟调用
    print("\n2. 模拟调用:")
    print("-" * 40)
    
    prompts = [
        "什么是机器学习？",
        "如何学习 Python？",
        "解释 API 的概念"
    ]
    
    for prompt in prompts:
        result = manager.call(prompt)
        status = "成功" if result["success"] else "失败"
        provider = result.get("provider", "unknown")
        fallback = "是" if result.get("fallback_used", False) else "否"
        
        print(f"\n  问题: {prompt[:30]}...")
        print(f"  状态: {status}")
        print(f"  供应商: {provider}")
        print(f"  使用 Fallback: {fallback}")
        if result.get("attempted_providers"):
            print(f"  尝试过的供应商: {', '.join(result['attempted_providers'])}")
    
    # 5. 统计信息
    print("\n3. 统计信息:")
    print("-" * 40)
    stats = manager.get_stats()
    print(f"  总调用次数: {stats['total_calls']}")
    print(f"  总 Token 数: {stats['total_tokens']}")
    for provider, p_stats in stats["providers"].items():
        print(f"  {provider}: {p_stats['calls']} 次调用")
    
    # 6. 架构图
    print("\n4. Fallback 架构:")
    print("-" * 40)
    print("""
    ┌─────────────────────────────────────────┐
    │              Fallback Manager            │
    │  ┌─────────────────────────────────┐   │
    │  │     优先级队列 (Priority Queue)   │   │
    │  │  1. OpenAI GPT-4                 │   │
    │  │  2. Anthropic Claude             │   │
    │  │  3. Google Gemini                │   │
    │  │  4. Local LLaMA                  │   │
    │  └─────────────────────────────────┘   │
    │                                          │
    │  ┌─────────────────────────────────┐   │
    │  │       健康检查 (Health Check)     │   │
    │  │  ✓ 成功率监控                     │   │
    │  │  ✓ 延迟监控                       │   │
    │  │  ✓ 错误率监控                     │   │
    │  └─────────────────────────────────┘   │
    └─────────────────────────────────────────┘
""")
    
    print("\n5. Fallback 触发条件:")
    print("-" * 40)
    print("  - API 超时")
    print("  - 返回错误状态码")
    print("  - 供应商健康状态为 UNHEALTHY")
    print("  - 请求频率超限")
    print("  - Token 余额不足")


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 所有供应商都失败 | 检查网络连接和 API 密钥 |
| 2 | Fallback 太频繁 | 调整健康检查阈值 |
| 3 | 延迟太高 | 优化超时设置，使用缓存 |
| 4 | 成本超预算 | 添加成本监控和限制 |
| 5 | 健康状态不准确 | 调整统计窗口大小 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Fallback | 主服务不可用时的降级方案 |
| Provider | 模型服务供应商 |
| Priority | 供应商优先级 |
| Health Check | 服务健康状态检查 |
| Degraded | 服务性能下降但可用 |
| Circuit Breaker | 熔断器，防止级联故障 |
| Rate Limiting | 请求频率限制 |

## ✅ 验收清单
- [ ] 理解 Fallback 的设计原则
- [ ] 能实现多供应商管理
- [ ] 能实现健康检查和自动切换
- [ ] 代码能跑通

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
