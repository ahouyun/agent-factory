# 📅 Week 12 Day 5：限流/熔断/重试

## 🧭 今日方向
> 学习分布式系统中的限流、熔断、重试机制，提高 Agent 系统的稳定性和容错能力。

## 🎯 生味比喻
> 限流/熔断/重试就像电力系统的保护装置。限流是保险丝，防止电流过大烧坏设备；熔断是断路器，检测到故障时自动断开，防止问题扩大；重试是自动恢复装置，故障排除后自动重新连接。三者配合，确保系统安全稳定运行。

## 📋 今日三件事
1. 理解限流算法（令牌桶、滑动窗口）
2. 实现熔断器模式
3. 设计智能重试策略

## 🗺️ 手把手路线

### Step 1：限流机制
- 做什么: 学习令牌桶、漏桶、滑动窗口等限流算法
- 为什么: 防止系统过载
- 成功标志: 能实现一个限流器

### Step 2：熔断器
- 做什么: 学习熔断器的状态转换（关闭-打开-半开）
- 为什么: 防止级联故障
- 成功标志: 能实现熔断器

### Step 3：重试策略
- 做什么: 学习指数退避、抖动等重试策略
- 为什么: 提高调用成功率
- 成功标志: 能实现智能重试

### Step 4：代码实践
- 做什么: 实现完整的保护机制
- 为什么: 代码是最好的理解方式
- 成功标志: 代码跑通

## 💻 代码区

```python
"""
限流/熔断/重试
分布式系统保护机制
"""
import time
import random
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Callable, Any
from enum import Enum
from collections import deque
import threading

# ========== 1. 限流器 ==========

class RateLimiter:
    """限流器"""
    
    def __init__(self, max_requests: int, window_seconds: float):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: deque = deque()
        self.lock = threading.Lock()
    
    def is_allowed(self) -> bool:
        """检查是否允许请求"""
        with self.lock:
            now = time.time()
            
            # 清理过期请求
            while self.requests and self.requests[0] < now - self.window_seconds:
                self.requests.popleft()
            
            # 检查是否超出限制
            if len(self.requests) >= self.max_requests:
                return False
            
            # 记录请求
            self.requests.append(now)
            return True
    
    def get_wait_time(self) -> float:
        """获取需要等待的时间"""
        with self.lock:
            if not self.requests:
                return 0.0
            
            oldest = self.requests[0]
            now = time.time()
            
            if oldest < now - self.window_seconds:
                return 0.0
            
            return self.window_seconds - (now - oldest)


class TokenBucketRateLimiter:
    """令牌桶限流器"""
    
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = capacity
        self.last_refill = time.time()
        self.lock = threading.Lock()
    
    def _refill(self):
        """补充令牌"""
        now = time.time()
        elapsed = now - self.last_refill
        new_tokens = elapsed * self.refill_rate
        self.tokens = min(self.capacity, self.tokens + new_tokens)
        self.last_refill = now
    
    def is_allowed(self, tokens: int = 1) -> bool:
        """检查是否允许请求"""
        with self.lock:
            self._refill()
            
            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
            return False
    
    def get_tokens(self) -> float:
        """获取当前令牌数"""
        with self.lock:
            self._refill()
            return self.tokens


# ========== 2. 熔断器 ==========

class CircuitState(Enum):
    """熔断器状态"""
    CLOSED = "closed"      # 正常
    OPEN = "open"          # 熔断
    HALF_OPEN = "half_open"  # 半开


@dataclass
class CircuitBreakerConfig:
    """熔断器配置"""
    failure_threshold: int = 5  # 失败阈值
    recovery_timeout: float = 30.0  # 恢复超时
    half_open_max_calls: int = 3  # 半开状态最大调用数


class CircuitBreaker:
    """熔断器"""
    
    def __init__(self, config: CircuitBreakerConfig = None):
        self.config = config or CircuitBreakerConfig()
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = 0.0
        self.half_open_calls = 0
        self.lock = threading.Lock()
    
    def can_execute(self) -> bool:
        """检查是否可以执行"""
        with self.lock:
            if self.state == CircuitState.CLOSED:
                return True
            
            elif self.state == CircuitState.OPEN:
                # 检查是否应该进入半开状态
                if time.time() - self.last_failure_time > self.config.recovery_timeout:
                    self.state = CircuitState.HALF_OPEN
                    self.half_open_calls = 0
                    return True
                return False
            
            elif self.state == CircuitState.HALF_OPEN:
                return self.half_open_calls < self.config.half_open_max_calls
            
            return False
    
    def record_success(self):
        """记录成功"""
        with self.lock:
            if self.state == CircuitState.HALF_OPEN:
                self.success_count += 1
                self.half_open_calls += 1
                
                # 半开状态下连续成功，关闭熔断器
                if self.success_count >= self.config.half_open_max_calls:
                    self.state = CircuitState.CLOSED
                    self.failure_count = 0
                    self.success_count = 0
            else:
                self.failure_count = 0
                self.success_count += 1
    
    def record_failure(self):
        """记录失败"""
        with self.lock:
            self.failure_count += 1
            self.success_count = 0
            self.last_failure_time = time.time()
            
            if self.state == CircuitState.HALF_OPEN:
                # 半开状态下失败，重新打开熔断器
                self.state = CircuitState.OPEN
                self.half_open_calls = 0
            
            elif self.state == CircuitState.CLOSED:
                # 达到失败阈值，打开熔断器
                if self.failure_count >= self.config.failure_threshold:
                    self.state = CircuitState.OPEN
    
    def get_state(self) -> Dict:
        """获取状态"""
        return {
            "state": self.state.value,
            "failure_count": self.failure_count,
            "success_count": self.success_count,
            "last_failure_time": self.last_failure_time
        }


# ========== 3. 重试器 ==========

@dataclass
class RetryConfig:
    """重试配置"""
    max_retries: int = 3
    base_delay: float = 1.0
    max_delay: float = 30.0
    exponential_base: float = 2.0
    jitter: bool = True


class RetryHandler:
    """重试处理器"""
    
    def __init__(self, config: RetryConfig = None):
        self.config = config or RetryConfig()
        self.retry_history: List[Dict] = []
    
    def calculate_delay(self, attempt: int) -> float:
        """计算重试延迟"""
        # 指数退避
        delay = self.config.base_delay * (self.config.exponential_base ** attempt)
        
        # 限制最大延迟
        delay = min(delay, self.config.max_delay)
        
        # 添加抖动
        if self.config.jitter:
            delay = delay * (0.5 + random.random())
        
        return delay
    
    def should_retry(self, attempt: int, exception: Exception) -> bool:
        """判断是否应该重试"""
        # 检查重试次数
        if attempt >= self.config.max_retries:
            return False
        
        # 检查异常类型（某些异常不应该重试）
        non_retryable = [KeyboardInterrupt, SystemExit]
        if any(isinstance(exception, e) for e in non_retryable):
            return False
        
        return True
    
    def execute_with_retry(
        self,
        func: Callable,
        *args,
        **kwargs
    ) -> Any:
        """带重试的执行"""
        last_exception = None
        
        for attempt in range(self.config.max_retries + 1):
            try:
                result = func(*args, **kwargs)
                
                # 记录成功
                if attempt > 0:
                    self.retry_history.append({
                        "attempt": attempt,
                        "success": True,
                        "timestamp": time.time()
                    })
                
                return result
                
            except Exception as e:
                last_exception = e
                
                # 检查是否应该重试
                if not self.should_retry(attempt + 1, e):
                    break
                
                # 等待
                delay = self.calculate_delay(attempt)
                time.sleep(delay)
                
                # 记录重试
                self.retry_history.append({
                    "attempt": attempt + 1,
                    "success": False,
                    "error": str(e),
                    "delay": delay,
                    "timestamp": time.time()
                })
        
        # 所有重试都失败
        raise last_exception
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        if not self.retry_history:
            return {"total_retries": 0, "success_rate": 0}
        
        total = len(self.retry_history)
        successes = sum(1 for h in self.retry_history if h["success"])
        
        return {
            "total_retries": total,
            "successes": successes,
            "success_rate": successes / total if total > 0 else 0
        }


# ========== 4. 综合保护器 ==========

class ResilientClient:
    """弹性客户端（综合限流/熔断/重试）"""
    
    def __init__(
        self,
        rate_limiter: RateLimiter = None,
        circuit_breaker: CircuitBreaker = None,
        retry_handler: RetryHandler = None
    ):
        self.rate_limiter = rate_limiter or RateLimiter(100, 60)
        self.circuit_breaker = circuit_breaker or CircuitBreaker()
        self.retry_handler = retry_handler or RetryHandler()
        self.call_history: List[Dict] = []
    
    def call(self, func: Callable, *args, **kwargs) -> Dict:
        """带保护的调用"""
        start_time = time.time()
        
        # 1. 检查限流
        if not self.rate_limiter.is_allowed():
            return {
                "success": False,
                "error": "限流: 请求过于频繁",
                "wait_time": self.rate_limiter.get_wait_time()
            }
        
        # 2. 检查熔断器
        if not self.circuit_breaker.can_execute():
            state = self.circuit_breaker.get_state()
            return {
                "success": False,
                "error": "熔断: 服务不可用",
                "circuit_state": state["state"]
            }
        
        # 3. 执行调用（带重试）
        try:
            result = self.retry_handler.execute_with_retry(func, *args, **kwargs)
            
            # 记录成功
            self.circuit_breaker.record_success()
            self.call_history.append({
                "success": True,
                "latency": time.time() - start_time,
                "timestamp": time.time()
            })
            
            return {
                "success": True,
                "result": result,
                "latency": time.time() - start_time
            }
            
        except Exception as e:
            # 记录失败
            self.circuit_breaker.record_failure()
            self.call_history.append({
                "success": False,
                "error": str(e),
                "latency": time.time() - start_time,
                "timestamp": time.time()
            })
            
            return {
                "success": False,
                "error": str(e),
                "latency": time.time() - start_time
            }
    
    def get_status(self) -> Dict:
        """获取状态"""
        total_calls = len(self.call_history)
        successful = sum(1 for h in self.call_history if h["success"])
        
        return {
            "rate_limiter": {
                "allowed": self.rate_limiter.is_allowed()
            },
            "circuit_breaker": self.circuit_breaker.get_state(),
            "retry_handler": self.retry_handler.get_stats(),
            "call_history": {
                "total": total_calls,
                "successful": successful,
                "success_rate": successful / max(total_calls, 1)
            }
        }


# ========== 5. 示例运行 ==========

def simulate_api_call(success_rate: float = 0.8) -> str:
    """模拟 API 调用"""
    time.sleep(0.01)  # 模拟延迟
    
    if random.random() < success_rate:
        return "成功"
    else:
        raise Exception("模拟 API 错误")


def main():
    """主函数"""
    print("=" * 60)
    print("限流/熔断/重试")
    print("=" * 60)
    
    # 1. 测试限流器
    print("\n1. 限流器测试:")
    print("-" * 40)
    
    limiter = RateLimiter(max_requests=5, window_seconds=1.0)
    print(f"  限制: 5 次/秒")
    
    allowed_count = 0
    for i in range(10):
        if limiter.is_allowed():
            allowed_count += 1
    print(f"  10 次请求中允许: {allowed_count} 次")
    
    # 2. 测试熔断器
    print("\n2. 熔断器测试:")
    print("-" * 40)
    
    breaker = CircuitBreaker(CircuitBreakerConfig(failure_threshold=3))
    print(f"  失败阈值: 3")
    
    for i in range(5):
        if i < 3:
            breaker.record_failure()
            state = breaker.get_state()
            print(f"  失败 {i+1}: 状态={state['state']}, 失败计数={state['failure_count']}")
        else:
            can_execute = breaker.can_execute()
            print(f"  尝试调用: {'允许' if can_execute else '拒绝'}")
    
    # 3. 测试重试器
    print("\n3. 重试器测试:")
    print("-" * 40)
    
    retry_handler = RetryHandler(RetryConfig(max_retries=3, base_delay=0.1))
    
    try:
        result = retry_handler.execute_with_retry(simulate_api_call, 0.5)
        print(f"  调用结果: {result}")
    except Exception as e:
        print(f"  调用失败: {e}")
    
    stats = retry_handler.get_stats()
    print(f"  重试统计: {stats}")
    
    # 4. 综合测试
    print("\n4. 综合保护测试:")
    print("-" * 40)
    
    client = ResilientClient(
        rate_limiter=RateLimiter(10, 1.0),
        circuit_breaker=CircuitBreaker(CircuitBreakerConfig(failure_threshold=3)),
        retry_handler=RetryHandler(RetryConfig(max_retries=2, base_delay=0.05))
    )
    
    # 模拟多次调用
    success_count = 0
    for i in range(15):
        result = client.call(simulate_api_call, 0.7)
        if result["success"]:
            success_count += 1
    
    print(f"  15 次调用中成功: {success_count} 次")
    
    # 获取状态
    status = client.get_status()
    print(f"\n  系统状态:")
    print(f"    熔断器状态: {status['circuit_breaker']['state']}")
    print(f"    调用成功率: {status['call_history']['success_rate']*100:.1f}%")
    
    # 5. 架构图
    print("\n5. 保护机制架构:")
    print("-" * 40)
    print("""
    ┌─────────────────────────────────────────┐
    │              弹性客户端                   │
    │  ┌─────────────────────────────────┐   │
    │  │           限流器                 │   │
    │  │    (令牌桶/滑动窗口)              │   │
    │  └───────────────┬─────────────────┘   │
    │                  │                      │
    │  ┌───────────────▼─────────────────┐   │
    │  │           熔断器                 │   │
    │  │    (关闭 → 打开 → 半开)           │   │
    │  └───────────────┬─────────────────┘   │
    │                  │                      │
    │  ┌───────────────▼─────────────────┐   │
    │  │           重试器                 │   │
    │  │    (指数退避 + 抖动)              │   │
    │  └───────────────┬─────────────────┘   │
    │                  │                      │
    │  ┌───────────────▼─────────────────┐   │
    │  │           API 调用               │   │
    │  └─────────────────────────────────┘   │
    └─────────────────────────────────────────┘
""")
    
    print("\n6. 保护机制配置建议:")
    print("-" * 40)
    print("  限流:")
    print("    - 根据 API 限额设置")
    print("    - 预留 20% 余量")
    print("  熔断:")
    print("    - 失败阈值: 5 次")
    print("    - 恢复超时: 30 秒")
    print("  重试:")
    print("    - 最大重试: 3 次")
    print("    - 指数退避: 1s, 2s, 4s")


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 限流太严格 | 调整窗口大小和请求数限制 |
| 2 | 熔断器频繁打开 | 增大失败阈值和恢复超时 |
| 3 | 重试风暴 | 添加抖动，限制重试次数 |
| 4 | 系统响应慢 | 检查限流配置，优化超时设置 |
| 5 | 级联故障 | 确保熔断器正确配置 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Rate Limiting | 限制请求频率的机制 |
| Token Bucket | 令牌桶限流算法 |
| Circuit Breaker | 熔断器，防止级联故障 |
| Half-Open | 熔断器的中间恢复状态 |
| Exponential Backoff | 指数退避重试策略 |
| Jitter | 随机抖动，防止重试风暴 |
| Retry | 失败后自动重试 |
| Fallback | 降级方案 |

## ✅ 验收清单
- [ ] 能实现限流器
- [ ] 能实现熔断器
- [ ] 能实现智能重试
- [ ] 代码能跑通

## 📦 Sandbox Agents（隔离沙箱）

OpenAI Agents SDK 支持在隔离沙箱中运行 Agent，提高安全性：

### 什么是 Sandbox

Sandbox 为 Agent 提供一个隔离的执行环境：
- 文件系统隔离：Agent 只能访问指定文件
- 网络隔离：可限制网络访问
- 资源限制：CPU/内存/磁盘配额
- 可恢复：中断后可从 checkpoint 恢复

### 使用场景

| 场景 | 为什么需要 Sandbox |
|------|-------------------|
| 代码执行 Agent | 防止恶意代码破坏系统 |
| 文件处理 Agent | 限制文件访问范围 |
| 多租户 Agent | 隔离不同用户的数据 |
| 测试环境 | 安全地测试 Agent 行为 |

### 实现示例

```python
from agents import Agent, Runner
from agents.sandbox import DockerSandbox

# 创建沙箱配置
sandbox = DockerSandbox(
    image="python:3.11-slim",
    memory_limit="512m",
    cpu_period=100000,
    cpu_quota=50000,  # 50% CPU
)

# 在沙箱中运行 Agent
agent = Agent(
    name="CodeExecutor",
    instructions="Execute code safely",
    sandbox=sandbox
)
result = Runner.run_sync(agent, "写一个排序算法")
```

> Sandbox 是生产环境的重要安全措施，特别是 Agent 需要执行不受信任的代码时。

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
