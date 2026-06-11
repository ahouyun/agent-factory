# 📅 Day 5 - 限流/熔断 + 沙箱 Agent

> **Week 12 . 生产部署** | **日期**: 2026-06-19

---

## 今日方向

今天我们学习分布式系统中的三大保护机制：限流、熔断和沙箱执行。限流防止系统被过多请求压垮，熔断在服务故障时自动切断调用链，沙箱确保 Agent 执行代码时不会影响宿主系统。

---

## 生活比喻

> 限流就像**高速公路收费站**——车太多时会限制进入，防止堵死。熔断就像**家里的保险丝**——电流过大时自动断开，防止火灾。沙箱就像**儿童游乐场的围栏**——孩子可以在里面自由玩耍，但不会跑到马路上去。

---

## 今日三件事

1. **实现限流器** -- 令牌桶算法，控制请求频率
2. **实现熔断器** -- 三状态模式（关闭/打开/半开），防止级联故障
3. **实现沙箱执行** -- 在隔离环境中安全执行 Agent 代码

---

## 手把手路线

### 阶段一：理解限流算法

```
令牌桶 (Token Bucket):
  - 固定速率向桶中添加令牌
  - 每个请求消耗一个令牌
  - 桶空时拒绝请求
  - 允许突发流量（桶中有令牌时）

滑动窗口 (Sliding Window):
  - 统计时间窗口内的请求数
  - 超过限制时拒绝
  - 更平滑的限流效果
```

### 阶段二：实现令牌桶限流器

### 阶段三：实现熔断器

### 阶段四：实现沙箱执行器

### 阶段五：集成测试

---

## 代码区

### 1. 令牌桶限流器

```python
# app/rate_limiter.py
"""限流器实现"""
import time
import threading
from collections import deque
from dataclasses import dataclass
from typing import Optional


@dataclass
class RateLimitConfig:
    """限流配置"""
    max_requests: int          # 窗口内最大请求数
    window_seconds: float      # 时间窗口（秒）
    burst_size: int = 0        # 突发容量（令牌桶模式）


class SlidingWindowRateLimiter:
    """滑动窗口限流器"""

    def __init__(self, config: RateLimitConfig):
        self.config = config
        self.requests: deque = deque()
        self.lock = threading.Lock()

    def is_allowed(self) -> bool:
        """检查是否允许请求"""
        with self.lock:
            now = time.time()

            # 清理过期请求
            while self.requests and self.requests[0] < now - self.config.window_seconds:
                self.requests.popleft()

            # 检查是否超出限制
            if len(self.requests) >= self.config.max_requests:
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
            if oldest < now - self.config.window_seconds:
                return 0.0
            return self.config.window_seconds - (now - oldest)

    def get_status(self) -> dict:
        """获取限流器状态"""
        with self.lock:
            now = time.time()
            while self.requests and self.requests[0] < now - self.config.window_seconds:
                self.requests.popleft()
            return {
                "current_requests": len(self.requests),
                "max_requests": self.config.max_requests,
                "window_seconds": self.config.window_seconds,
                "wait_time": self.get_wait_time(),
            }


class TokenBucketRateLimiter:
    """令牌桶限流器"""

    def __init__(self, capacity: int, refill_rate: float):
        """
        Args:
            capacity: 桶的最大容量
            refill_rate: 每秒补充的令牌数
        """
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = float(capacity)
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

    def get_status(self) -> dict:
        """获取状态"""
        with self.lock:
            self._refill()
            return {
                "tokens": self.tokens,
                "capacity": self.capacity,
                "refill_rate": self.refill_rate,
            }
```

### 2. 熔断器

```python
# app/circuit_breaker.py
"""熔断器实现"""
import time
import threading
from dataclasses import dataclass
from enum import Enum
from typing import Dict, Callable, Any


class CircuitState(Enum):
    """熔断器状态"""
    CLOSED = "closed"        # 正常：允许所有请求
    OPEN = "open"            # 熔断：拒绝所有请求
    HALF_OPEN = "half_open"  # 半开：允许少量请求测试


@dataclass
class CircuitBreakerConfig:
    """熔断器配置"""
    failure_threshold: int = 5       # 失败阈值：连续失败多少次触发熔断
    recovery_timeout: float = 30.0   # 恢复超时：熔断后多久尝试恢复
    half_open_max_calls: int = 3     # 半开状态最大调用数
    success_threshold: int = 3       # 半开状态成功阈值：连续成功多少次关闭熔断


class CircuitBreaker:
    """熔断器"""

    def __init__(self, name: str = "default", config: CircuitBreakerConfig = None):
        self.name = name
        self.config = config or CircuitBreakerConfig()
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = 0.0
        self.half_open_calls = 0
        self.lock = threading.Lock()

        # 统计
        self.total_calls = 0
        self.total_failures = 0
        self.total_rejected = 0

    def can_execute(self) -> bool:
        """检查是否可以执行"""
        with self.lock:
            self.total_calls += 1

            if self.state == CircuitState.CLOSED:
                return True

            elif self.state == CircuitState.OPEN:
                # 检查是否应该进入半开状态
                if time.time() - self.last_failure_time > self.config.recovery_timeout:
                    self.state = CircuitState.HALF_OPEN
                    self.half_open_calls = 0
                    self.success_count = 0
                    return True
                self.total_rejected += 1
                return False

            elif self.state == CircuitState.HALF_OPEN:
                if self.half_open_calls < self.config.half_open_max_calls:
                    return True
                self.total_rejected += 1
                return False

            return False

    def record_success(self):
        """记录成功"""
        with self.lock:
            if self.state == CircuitState.HALF_OPEN:
                self.success_count += 1
                self.half_open_calls += 1

                # 半开状态下连续成功，关闭熔断器
                if self.success_count >= self.config.success_threshold:
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
            self.total_failures += 1
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
        with self.lock:
            return {
                "name": self.name,
                "state": self.state.value,
                "failure_count": self.failure_count,
                "success_count": self.success_count,
                "total_calls": self.total_calls,
                "total_failures": self.total_failures,
                "total_rejected": self.total_rejected,
                "last_failure_time": self.last_failure_time,
            }

    def reset(self):
        """重置熔断器"""
        with self.lock:
            self.state = CircuitState.CLOSED
            self.failure_count = 0
            self.success_count = 0
            self.half_open_calls = 0
```

### 3. 沙箱执行器

```python
# app/sandbox.py
"""沙箱执行器 -- 隔离环境执行代码"""
import os
import sys
import json
import time
import tempfile
import subprocess
import resource
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from enum import Enum


class SandboxStatus(Enum):
    """沙箱状态"""
    READY = "ready"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"


@dataclass
class SandboxConfig:
    """沙箱配置"""
    timeout_seconds: int = 30          # 执行超时
    max_memory_mb: int = 256           # 最大内存
    max_output_bytes: int = 1024 * 1024  # 最大输出（1MB）
    allowed_modules: List[str] = field(default_factory=lambda: [
        "json", "math", "random", "datetime", "collections",
        "itertools", "functools", "re", "string",
    ])
    blocked_builtins: List[str] = field(default_factory=lambda: [
        "exec", "eval", "compile", "__import__",
        "open", "input", "globals", "locals",
    ])


@dataclass
class SandboxResult:
    """沙箱执行结果"""
    status: SandboxStatus
    output: str = ""
    error: str = ""
    return_value: Any = None
    execution_time: float = 0.0
    memory_used_mb: float = 0.0


class PythonSandbox:
    """Python 沙箱执行器"""

    def __init__(self, config: SandboxConfig = None):
        self.config = config or SandboxConfig()
        self.execution_history: List[Dict] = []

    def execute(self, code: str, timeout: Optional[int] = None) -> SandboxResult:
        """在沙箱中执行代码"""
        timeout = timeout or self.config.timeout_seconds
        start_time = time.time()

        # 创建临时文件
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".py", delete=False, encoding="utf-8"
        ) as f:
            # 包装代码，添加安全限制
            wrapped_code = self._wrap_code(code)
            f.write(wrapped_code)
            temp_path = f.name

        try:
            # 使用 subprocess 执行（隔离进程）
            result = subprocess.run(
                [sys.executable, temp_path],
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=tempfile.gettempdir(),
                env=self._get_safe_env(),
            )

            execution_time = time.time() - start_time

            if result.returncode == 0:
                # 尝试解析返回值
                try:
                    return_value = json.loads(result.stdout)
                except (json.JSONDecodeError, ValueError):
                    return_value = result.stdout.strip()

                return SandboxResult(
                    status=SandboxStatus.COMPLETED,
                    output=result.stdout,
                    return_value=return_value,
                    execution_time=execution_time,
                )
            else:
                return SandboxResult(
                    status=SandboxStatus.FAILED,
                    output=result.stdout,
                    error=result.stderr,
                    execution_time=execution_time,
                )

        except subprocess.TimeoutExpired:
            return SandboxResult(
                status=SandboxStatus.TIMEOUT,
                error=f"执行超时 ({timeout}s)",
                execution_time=timeout,
            )
        except Exception as e:
            return SandboxResult(
                status=SandboxStatus.FAILED,
                error=str(e),
                execution_time=time.time() - start_time,
            )
        finally:
            # 清理临时文件
            try:
                os.unlink(temp_path)
            except OSError:
                pass

    def _wrap_code(self, code: str) -> str:
        """包装代码，添加安全限制"""
        # 生成安全的内置函数白名单
        safe_builtins = self._get_safe_builtins()

        wrapper = f'''
import sys
import json

# 安全限制
_safe_builtins = {json.dumps(safe_builtins)}
__builtins__ = {{k: __builtins__.get(k) for k in _safe_builtins if hasattr(__builtins__, 'get') and k in __builtins__}}
if not isinstance(__builtins__, dict):
    __builtins__ = {{k: getattr(__builtins__, k, None) for k in _safe_builtins}}

# 用户代码
{code}
'''
        return wrapper

    def _get_safe_builtins(self) -> List[str]:
        """获取安全的内置函数列表"""
        default_builtins = [
            "abs", "all", "any", "bin", "bool", "bytearray", "bytes",
            "callable", "chr", "dict", "dir", "divmod", "enumerate",
            "filter", "float", "format", "frozenset", "getattr",
            "hasattr", "hash", "hex", "id", "int", "isinstance",
            "issubclass", "iter", "len", "list", "map", "max",
            "memoryview", "min", "next", "object", "oct", "ord",
            "pow", "print", "property", "range", "repr", "reversed",
            "round", "set", "setattr", "slice", "sorted", "str",
            "sum", "super", "tuple", "type", "vars", "zip",
        ]
        return [b for b in default_builtins if b not in self.config.blocked_builtins]

    def _get_safe_env(self) -> Dict[str, str]:
        """获取安全的环境变量"""
        return {
            "PATH": os.environ.get("PATH", ""),
            "HOME": tempfile.gettempdir(),
            "PYTHONUNBUFFERED": "1",
        }
```

### 4. 弹性客户端

```python
# app/resilient_client.py
"""弹性客户端 -- 综合限流/熔断/重试"""
import time
import random
from typing import Dict, Any, Callable, Optional
from dataclasses import dataclass

from .rate_limiter import TokenBucketRateLimiter
from .circuit_breaker import CircuitBreaker, CircuitBreakerConfig


@dataclass
class RetryConfig:
    """重试配置"""
    max_retries: int = 3
    base_delay: float = 1.0
    max_delay: float = 30.0
    exponential_base: float = 2.0
    jitter: bool = True


class ResilientClient:
    """弹性客户端"""

    def __init__(
        self,
        rate_limiter: Optional[TokenBucketRateLimiter] = None,
        circuit_breaker: Optional[CircuitBreaker] = None,
        retry_config: Optional[RetryConfig] = None,
    ):
        self.rate_limiter = rate_limiter or TokenBucketRateLimiter(capacity=100, refill_rate=10)
        self.circuit_breaker = circuit_breaker or CircuitBreaker("api", CircuitBreakerConfig())
        self.retry_config = retry_config or RetryConfig()
        self.call_history = []

    def call(self, func: Callable, *args, **kwargs) -> Dict[str, Any]:
        """带保护的调用"""
        start_time = time.time()

        # 1. 检查限流
        if not self.rate_limiter.is_allowed():
            return {
                "success": False,
                "error": "限流: 请求过于频繁",
                "wait_time": self.rate_limiter.get_wait_time(),
                "latency": time.time() - start_time,
            }

        # 2. 检查熔断器
        if not self.circuit_breaker.can_execute():
            return {
                "success": False,
                "error": "熔断: 服务不可用",
                "circuit_state": self.circuit_breaker.get_state()["state"],
                "latency": time.time() - start_time,
            }

        # 3. 带重试的执行
        last_exception = None
        for attempt in range(self.retry_config.max_retries + 1):
            try:
                result = func(*args, **kwargs)

                # 记录成功
                self.circuit_breaker.record_success()
                self.call_history.append({
                    "success": True,
                    "attempt": attempt + 1,
                    "latency": time.time() - start_time,
                })

                return {
                    "success": True,
                    "result": result,
                    "attempts": attempt + 1,
                    "latency": time.time() - start_time,
                }

            except Exception as e:
                last_exception = e

                # 检查是否应该重试
                if attempt >= self.retry_config.max_retries:
                    break

                # 计算等待时间（指数退避 + 抖动）
                delay = self._calculate_delay(attempt)
                time.sleep(delay)

        # 所有重试都失败
        self.circuit_breaker.record_failure()
        self.call_history.append({
            "success": False,
            "error": str(last_exception),
            "attempts": self.retry_config.max_retries + 1,
            "latency": time.time() - start_time,
        })

        return {
            "success": False,
            "error": str(last_exception),
            "attempts": self.retry_config.max_retries + 1,
            "latency": time.time() - start_time,
        }

    def _calculate_delay(self, attempt: int) -> float:
        """计算重试等待时间"""
        delay = self.retry_config.base_delay * (
            self.retry_config.exponential_base ** attempt
        )
        delay = min(delay, self.retry_config.max_delay)

        if self.retry_config.jitter:
            delay = delay * (0.5 + random.random())

        return delay

    def get_status(self) -> Dict:
        """获取状态"""
        total_calls = len(self.call_history)
        successful = sum(1 for h in self.call_history if h["success"])

        return {
            "rate_limiter": self.rate_limiter.get_status(),
            "circuit_breaker": self.circuit_breaker.get_state(),
            "call_stats": {
                "total": total_calls,
                "successful": successful,
                "success_rate": successful / max(total_calls, 1),
            },
        }
```

### 5. 沙箱 Agent 示例

```python
# examples/sandbox_agent_demo.py
"""沙箱 Agent 演示"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.sandbox import PythonSandbox, SandboxConfig
from app.resilient_client import ResilientClient
from app.circuit_breaker import CircuitBreaker, CircuitBreakerConfig
from app.rate_limiter import TokenBucketRateLimiter


def main():
    print("=" * 60)
    print("限流/熔断 + 沙箱 Agent 演示")
    print("=" * 60)

    # ===== 1. 限流器测试 =====
    print("\n1. 令牌桶限流器测试:")
    print("-" * 40)

    limiter = TokenBucketRateLimiter(capacity=5, refill_rate=2)
    print(f"  桶容量: 5, 补充速率: 2/秒")

    allowed_count = 0
    for i in range(10):
        if limiter.is_allowed():
            allowed_count += 1
    print(f"  10 次请求中允许: {allowed_count} 次")
    print(f"  剩余令牌: {limiter.get_tokens():.1f}")

    # ===== 2. 熔断器测试 =====
    print("\n2. 熔断器测试:")
    print("-" * 40)

    breaker = CircuitBreaker("test", CircuitBreakerConfig(
        failure_threshold=3,
        recovery_timeout=2.0,
    ))

    # 模拟连续失败
    for i in range(5):
        if i < 3:
            breaker.record_failure()
            state = breaker.get_state()
            print(f"  失败 {i+1}: 状态={state['state']}, 失败计数={state['failure_count']}")
        else:
            can_execute = breaker.can_execute()
            print(f"  尝试调用: {'允许' if can_execute else '拒绝'}")

    # 等待恢复
    print("  等待熔断器恢复...")
    time.sleep(2.5)
    can_execute = breaker.can_execute()
    print(f"  恢复后调用: {'允许' if can_execute else '拒绝'}")

    # ===== 3. 沙箱执行测试 =====
    print("\n3. 沙箱执行测试:")
    print("-" * 40)

    sandbox = PythonSandbox(SandboxConfig(timeout_seconds=5))

    # 正常代码
    code1 = """
result = sum(range(10))
print(f"计算结果: {result}")
"""
    print("  测试 1: 正常代码")
    result1 = sandbox.execute(code1)
    print(f"    状态: {result1.status.value}")
    print(f"    输出: {result1.output.strip()}")

    # 错误代码
    code2 = """
raise ValueError("这是一个测试错误")
"""
    print("\n  测试 2: 错误代码")
    result2 = sandbox.execute(code2)
    print(f"    状态: {result2.status.value}")
    print(f"    错误: {result2.error[:50]}...")

    # 危险代码
    code3 = """
import os
os.system("rm -rf /")
"""
    print("\n  测试 3: 危险代码")
    result3 = sandbox.execute(code3)
    print(f"    状态: {result3.status.value}")
    print(f"    输出/错误: {(result3.output or result3.error)[:50]}...")

    # ===== 4. 弹性客户端测试 =====
    print("\n4. 弹性客户端测试:")
    print("-" * 40)

    client = ResilientClient(
        rate_limiter=TokenBucketRateLimiter(capacity=10, refill_rate=5),
        circuit_breaker=CircuitBreaker("api", CircuitBreakerConfig(failure_threshold=3)),
    )

    def mock_api_call():
        import random
        if random.random() < 0.3:
            raise Exception("模拟 API 错误")
        return "成功"

    success_count = 0
    for i in range(10):
        result = client.call(mock_api_call)
        if result["success"]:
            success_count += 1

    print(f"  10 次调用中成功: {success_count} 次")

    status = client.get_status()
    print(f"  熔断器状态: {status['circuit_breaker']['state']}")
    print(f"  调用成功率: {status['call_stats']['success_rate']:.1%}")

    # 架构图
    print("\n" + "=" * 60)
    print("保护机制架构:")
    print("=" * 60)
    print("""
    请求 --> [限流器] --> [熔断器] --> [重试] --> API 调用
              |              |            |
              v              v            v
           令牌桶         三状态      指数退避
           滑动窗口       关闭/打开    随机抖动
                          半开
    """)


if __name__ == "__main__":
    import time
    main()
```

---

## 预期输出

```bash
$ python examples/sandbox_agent_demo.py
============================================================
限流/熔断 + 沙箱 Agent 演示
============================================================

1. 令牌桶限流器测试:
----------------------------------------
  桶容量: 5, 补充速率: 2/秒
  10 次请求中允许: 5 次
  剩余令牌: 0.0

2. 熔断器测试:
----------------------------------------
  失败 1: 状态=closed, 失败计数=1
  失败 2: 状态=closed, 失败计数=2
  失败 3: 状态=open, 失败计数=3
  尝试调用: 拒绝
  尝试调用: 拒绝
  等待熔断器恢复...
  恢复后调用: 允许

3. 沙箱执行测试:
----------------------------------------
  测试 1: 正常代码
    状态: completed
    输出: 计算结果: 45

  测试 2: 错误代码
    状态: failed
    错误: Traceback (most recent call last):
      File "/tmp/tmpxxxxx.py", line 2, in <module>
    ValueEr...

  测试 3: 危险代码
    状态: failed
    输出/错误: Traceback (most recent call last):
      File "/tmp/tmpxxxxx.py", line 2, in <module>
    ...

4. 弹性客户端测试:
----------------------------------------
  10 次调用中成功: 7 次
  熔断器状态: closed
  调用成功率: 70.0%

============================================================
保护机制架构:
============================================================

    请求 --> [限流器] --> [熔断器] --> [重试] --> API 调用
              |              |            |
              v              v            v
           令牌桶         三状态      指数退避
           滑动窗口       关闭/打开    随机抖动
                          半开
```

---

## 常见错误和解决方案

### 错误 1: 限流器误拦正常请求

**原因**: 限流窗口太小或阈值太低。

**解决方案**:
```python
# 调整限流参数
limiter = TokenBucketRateLimiter(
    capacity=100,    # 增大桶容量
    refill_rate=20,  # 提高补充速率
)
```

### 错误 2: 熔断器频繁打开

**原因**: 失败阈值太低。

**解决方案**:
```python
breaker = CircuitBreaker("api", CircuitBreakerConfig(
    failure_threshold=10,      # 增加失败阈值
    recovery_timeout=60.0,     # 增加恢复等待时间
    success_threshold=5,       # 增加恢复所需成功次数
))
```

### 错误 3: 沙箱执行超时

```python
# 增加超时时间
sandbox = PythonSandbox(SandboxConfig(timeout_seconds=60))
```

### 错误 4: 沙箱中无法导入模块

**原因**: 模块不在白名单中。

**解决方案**:
```python
config = SandboxConfig(
    allowed_modules=["json", "math", "requests"],  # 添加需要的模块
)
```

### 错误 5: 重试风暴

**原因**: 多个客户端同时重试，导致服务压力更大。

**解决方案**: 添加随机抖动
```python
retry_config = RetryConfig(
    max_retries=3,
    base_delay=1.0,
    jitter=True,  # 启用抖动
)
```

---

## 每日挑战

### 挑战 1: 基础练习

1. 实现一个滑动窗口限流器
2. 实现一个简单的熔断器（只有关闭和打开状态）
3. 编写测试验证限流和熔断逻辑

### 挑战 2: 进阶练习

1. 为沙箱添加 **内存限制**（使用 resource 模块）
2. 实现 **沙箱结果缓存**（相同代码不重复执行）
3. 添加 **熔断器状态持久化**（重启后恢复状态）

### 挑战 3: 生产实战

1. 为 Agent API 添加完整的保护层
2. 配置 Redis 实现分布式限流
3. 添加熔断器监控仪表盘
4. 测试在高并发下的保护效果

---

> **明天预告**: Day 6 我们将学习监控和告警，使用 Prometheus + Grafana 构建完整的监控体系。
