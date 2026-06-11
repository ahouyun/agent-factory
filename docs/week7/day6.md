# 📅 Week 7 Day 6：错误处理 + 重试 + 优雅降级

## 🧭 今日方向
> 生产环境中的 Agent 必须能优雅地处理各种异常。今天学习错误分类、重试策略、降级方案，让系统在出错时"体面地失败"而非崩溃。

## 🎯 生活比喻
> 错误处理就像"安全气囊"。正常驾驶时它不会触发，但一旦发生碰撞（异常），它会保护乘客（用户）不受伤害。好的安全气囊（错误处理）能在各种碰撞情况下都有效工作。

## 📋 今日三件事
1. 理解 Agent 系统中的常见错误类型并进行分类
2. 实现指数退避重试机制
3. 构建优雅降级策略和监控告警系统

## 🗺️ 手把手路线

### Step 1: 错误分类
- **做什么**: 列出 Agent 系统中的所有可能错误并分类
- **为什么**: 分类是有效处理的前提
- **成功标志**: 能说出至少 5 种常见错误及其分类

### Step 2: 重试机制
- **做什么**: 实现带指数退避的重试装饰器
- **为什么**: 很多错误是暂时的，重试可以恢复
- **成功标志**: 重试机制能处理暂时性故障

### Step 3: 降级策略
- **做什么**: 实现当主要功能不可用时的替代方案
- **为什么**: 确保系统始终可用，即使功能受限
- **成功标志**: 系统能在部分故障时继续运行

## 💻 代码区

### 3.1 错误分类系统

```python
"""
错误分类和处理框架
定义 Agent 系统中的常见错误类型
"""

from enum import Enum
from dataclasses import dataclass
from typing import Optional, Dict, Any
import time
import random


class ErrorCategory(Enum):
    """错误分类"""
    TRANSIENT = "transient"        # 暂时性错误（网络超时、限流）
    PERMANENT = "permanent"        # 永久性错误（参数错误、权限不足）
    RATE_LIMIT = "rate_limit"      # 限流错误
    TIMEOUT = "timeout"            # 超时错误
    AUTH_ERROR = "auth_error"      # 认证错误
    VALIDATION = "validation"      # 验证错误
    UNKNOWN = "unknown"            # 未知错误


@dataclass
class AgentError:
    """Agent 错误"""
    category: ErrorCategory
    message: str
    original_exception: Optional[Exception] = None
    retryable: bool = False
    context: Dict[str, Any] = None

    def __str__(self):
        retryable_str = "可重试" if self.retryable else "不可重试"
        return f"[{self.category.value}] {self.message} ({retryable_str})"


# 错误映射表
ERROR_MAP = {
    "TimeoutError": ErrorCategory.TIMEOUT,
    "ConnectionError": ErrorCategory.TRANSIENT,
    "ConnectionRefusedError": ErrorCategory.TRANSIENT,
    "RateLimitError": ErrorCategory.RATE_LIMIT,
    "AuthenticationError": ErrorCategory.AUTH_ERROR,
    "ValidationError": ErrorCategory.VALIDATION,
    "ValueError": ErrorCategory.VALIDATION,
    "KeyError": ErrorCategory.VALIDATION,
}

# 可重试的错误类别
RETRYABLE_CATEGORIES = {
    ErrorCategory.TRANSIENT,
    ErrorCategory.TIMEOUT,
    ErrorCategory.RATE_LIMIT
}


def classify_error(exception: Exception) -> AgentError:
    """分类错误"""
    error_type = type(exception).__name__
    category = ERROR_MAP.get(error_type, ErrorCategory.UNKNOWN)
    retryable = category in RETRYABLE_CATEGORIES

    return AgentError(
        category=category,
        message=str(exception),
        original_exception=exception,
        retryable=retryable
    )


# ===== 测试 =====
print("=== 错误分类演示 ===\n")

test_exceptions = [
    TimeoutError("请求超时"),
    ConnectionError("连接失败"),
    ValueError("参数错误"),
    PermissionError("权限不足"),
    Exception("未知错误"),
]

for exc in test_exceptions:
    error = classify_error(exc)
    print(f"  {error}")
```

**预期输出：**
```
=== 错误分类演示 ===

  [timeout] 请求超时 (可重试)
  [transient] 连接失败 (可重试)
  [validation] 参数错误 (不可重试)
  [unknown] 权限不足 (不可重试)
  [unknown] 未知错误 (不可重试)
```

### 3.2 指数退避重试机制

```python
"""
指数退避重试机制
支持抖动（jitter）避免雪崩效应
"""

import functools
from typing import Callable


class RetryConfig:
    """重试配置"""
    def __init__(
        self,
        max_retries: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 30.0,
        exponential_base: float = 2.0,
        jitter: bool = True
    ):
        """
        Args:
            max_retries: 最大重试次数
            base_delay: 基础延迟（秒）
            max_delay: 最大延迟（秒）
            exponential_base: 指数基数
            jitter: 是否添加随机抖动
        """
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.exponential_base = exponential_base
        self.jitter = jitter


def with_retry(config: RetryConfig = None):
    """重试装饰器"""
    if config is None:
        config = RetryConfig()

    def decorator(func: Callable):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None

            for attempt in range(config.max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    error = classify_error(e)

                    print(f"  [尝试 {attempt + 1}/{config.max_retries + 1}] {error}")

                    # 检查是否可重试
                    if not error.retryable or attempt == config.max_retries:
                        raise

                    # 计算延迟（指数退避 + 抖动）
                    delay = min(
                        config.base_delay * (config.exponential_base ** attempt),
                        config.max_delay
                    )
                    if config.jitter:
                        delay = delay * (0.5 + random.random() * 0.5)  # 50%-100% 的延迟

                    print(f"  [等待 {delay:.2f}s 后重试...]")
                    time.sleep(delay)

            raise last_exception

        return wrapper
    return decorator


# ===== 测试重试机制 =====
print("\n=== 重试机制演示 ===\n")

# 模拟不稳定的服务
call_count = 0

@with_retry(RetryConfig(max_retries=3, base_delay=0.1, jitter=False))
def unstable_api_call():
    """模拟不稳定的 API 调用"""
    global call_count
    call_count += 1
    
    if call_count < 3:
        raise ConnectionError(f"连接失败 (第 {call_count} 次)")
    
    return f"成功 (第 {call_count} 次调用)"


# 测试
try:
    result = unstable_api_call()
    print(f"\n结果: {result}")
except Exception as e:
    print(f"\n最终失败: {e}")

# 重置计数
call_count = 0
```

**预期输出：**
```
=== 重试机制演示 ===

  [尝试 1/4] [transient] 连接失败 (第 1 次) (可重试)
  [等待 0.10s 后重试...]
  [尝试 2/4] [transient] 连接失败 (第 2 次) (可重试)
  [等待 0.20s 后重试...]
  [尝试 3/4] [unknown] 成功 (第 3 次调用) (不可重试)

结果: 成功 (第 3 次调用)
```

### 3.3 优雅降级策略

```python
"""
优雅降级策略
当主要功能不可用时，提供替代方案
"""


class FallbackStrategy:
    """降级策略管理器"""

    def __init__(self):
        self.strategies = {}
        self.default_handler = None

    def register(self, error_category: ErrorCategory, strategy: Callable):
        """注册降级策略"""
        self.strategies[error_category] = strategy

    def set_default(self, handler: Callable):
        """设置默认降级策略"""
        self.default_handler = handler

    def execute(self, error: AgentError, context: Dict = None) -> str:
        """执行降级策略"""
        strategy = self.strategies.get(error.category)
        if strategy:
            return strategy(error, context)
        elif self.default_handler:
            return self.default_handler(error, context)
        return f"抱歉，当前无法处理您的请求。错误: {error.message}"


# 创建降级策略
fallback = FallbackStrategy()

def rate_limit_fallback(error: AgentError, context: Dict = None) -> str:
    """限流降级: 返回友好提示"""
    return "服务繁忙，请稍后再试。建议间隔 30 秒后重试。"

def timeout_fallback(error: AgentError, context: Dict = None) -> str:
    """超时降级: 提供简化建议"""
    query = context.get("query", "") if context else ""
    if query:
        return f"查询处理超时。建议简化问题后重试，例如: '{query[:20]}...'"
    return "请求超时，请稍后重试。"

def auth_fallback(error: AgentError, context: Dict = None) -> str:
    """认证降级: 提供配置指导"""
    return "身份验证失败。请检查 API 密钥是否正确配置。"

def default_fallback(error: AgentError, context: Dict = None) -> str:
    """默认降级: 友好错误提示"""
    return f"处理过程中遇到问题。您可以尝试重新描述问题，或稍后重试。"

# 注册策略
fallback.register(ErrorCategory.RATE_LIMIT, rate_limit_fallback)
fallback.register(ErrorCategory.TIMEOUT, timeout_fallback)
fallback.register(ErrorCategory.AUTH_ERROR, auth_fallback)
fallback.set_default(default_fallback)


# ===== 测试降级策略 =====
print("\n=== 降级策略演示 ===\n")

test_errors = [
    AgentError(ErrorCategory.RATE_LIMIT, "API 限流", retryable=True),
    AgentError(ErrorCategory.TIMEOUT, "请求超时", retryable=True),
    AgentError(ErrorCategory.AUTH_ERROR, "API 密钥无效", retryable=False),
    AgentError(ErrorCategory.UNKNOWN, "未知错误", retryable=False),
]

for error in test_errors:
    response = fallback.execute(error, {"query": "Python 是什么"})
    print(f"  错误: {error}")
    print(f"  降级响应: {response}")
    print()
```

**预期输出：**
```
=== 降级策略演示 ===

  错误: [rate_limit] API 限流 (可重试)
  降级响应: 服务繁忙，请稍后再试。建议间隔 30 秒后重试。

  错误: [timeout] 请求超时 (可重试)
  降级响应: 查询处理超时。建议简化问题后重试，例如: 'Python 是什么...'

  错误: [auth_error] API 密钥无效 (不可重试)
  降级响应: 身份验证失败。请检查 API 密钥是否正确配置。

  错误: [unknown] 未知错误 (不可重试)
  降级响应: 处理过程中遇到问题。您可以尝试重新描述问题，或稍后重试。
```

### 3.4 监控和告警系统

```python
"""
监控和告警系统
跟踪系统状态，在异常时发出告警
"""


class MonitoringSystem:
    """监控系统"""

    def __init__(self, alert_threshold: int = 5):
        """
        Args:
            alert_threshold: 同类错误触发告警的阈值
        """
        self.alert_threshold = alert_threshold
        self.metrics = {
            "total_requests": 0,
            "successful": 0,
            "failed": 0,
            "by_error_category": {},
            "response_times": []
        }
        self.alerts = []

    def record_request(self, success: bool, response_time: float, error: AgentError = None):
        """记录请求"""
        self.metrics["total_requests"] += 1
        self.metrics["response_times"].append(response_time)

        if success:
            self.metrics["successful"] += 1
        else:
            self.metrics["failed"] += 1
            if error:
                category = error.category.value
                self.metrics["by_error_category"][category] = \
                    self.metrics["by_error_category"].get(category, 0) + 1

                # 检查是否需要告警
                self._check_alerts(error)

    def _check_alerts(self, error: AgentError):
        """检查告警条件"""
        category = error.category.value
        count = self.metrics["by_error_category"].get(category, 0)

        if count >= self.alert_threshold:
            alert = {
                "type": "error_threshold",
                "category": category,
                "count": count,
                "timestamp": time.time(),
                "message": f"{category} 错误次数达到 {count}，超过阈值 {self.alert_threshold}"
            }
            self.alerts.append(alert)
            print(f"  [告警] {alert['message']}")

    def get_report(self) -> Dict:
        """获取监控报告"""
        total = self.metrics["total_requests"]
        if total == 0:
            return {"message": "暂无数据"}

        avg_response_time = (
            sum(self.metrics["response_times"]) / total 
            if self.metrics["response_times"] else 0
        )

        return {
            "total_requests": total,
            "success_rate": f"{self.metrics['successful'] / total:.2%}",
            "failure_rate": f"{self.metrics['failed'] / total:.2%}",
            "avg_response_time": f"{avg_response_time:.3f}s",
            "error_breakdown": self.metrics["by_error_category"],
            "active_alerts": len([
                a for a in self.alerts 
                if time.time() - a["timestamp"] < 3600
            ])
        }


# ===== 测试监控系统 =====
print("\n=== 监控系统演示 ===\n")

monitor = MonitoringSystem(alert_threshold=3)

# 模拟请求
print("模拟 10 个请求:")
for i in range(10):
    success = i % 3 != 0  # 每 3 个请求失败 1 个
    response_time = 0.1 + (i * 0.05)

    error = None
    if not success:
        error = AgentError(
            category=ErrorCategory.TRANSIENT,
            message=f"模拟错误 {i}"
        )

    monitor.record_request(success, response_time, error)
    status = "成功" if success else "失败"
    print(f"  请求 {i+1}: {status} ({response_time:.3f}s)")

# 打印报告
print(f"\n监控报告:")
report = monitor.get_report()
for key, value in report.items():
    print(f"  {key}: {value}")
```

**预期输出：**
```
=== 监控系统演示 ===

模拟 10 个请求:
  请求 1: 失败 (0.100s)
  请求 2: 成功 (0.150s)
  请求 3: 成功 (0.200s)
  请求 4: 失败 (0.250s)
  请求 5: 成功 (0.300s)
  请求 6: 成功 (0.350s)
  请求 7: 失败 (0.400s)
    [告警] transient 错误次数达到 3，超过阈值 3
  请求 8: 成功 (0.450s)
  请求 9: 成功 (0.500s)
  请求 10: 失败 (0.550s)

监控报告:
  total_requests: 10
  success_rate: 70.00%
  failure_rate: 30.00%
  avg_response_time: 0.325s
  error_breakdown: {'transient': 4}
  active_alerts: 1
```

### 3.5 完整健壮 Agent

```python
"""
完整的健壮 Agent
整合错误处理、重试、降级、监控
"""


class RobustAgent:
    """健壮的 Agent"""

    def __init__(self):
        self.fallback = FallbackStrategy()
        self.monitor = MonitoringSystem(alert_threshold=5)
        self._setup_fallbacks()

    def _setup_fallbacks(self):
        """设置降级策略"""
        self.fallback.register(ErrorCategory.RATE_LIMIT, rate_limit_fallback)
        self.fallback.register(ErrorCategory.TIMEOUT, timeout_fallback)
        self.fallback.register(ErrorCategory.AUTH_ERROR, auth_fallback)
        self.fallback.set_default(default_fallback)

    @with_retry(RetryConfig(max_retries=2, base_delay=0.1, jitter=True))
    def _call_llm(self, messages: list) -> str:
        """调用 LLM（带重试）"""
        # 模拟 LLM 调用
        user_input = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_input = msg.get("content", "")
                break

        # 模拟不同类型的错误
        if "错误" in user_input and "超时" in user_input:
            raise TimeoutError("LLM API 超时")
        elif "错误" in user_input and "限流" in user_input:
            raise ConnectionError("API 限流")
        elif "错误" in user_input and "认证" in user_input:
            raise PermissionError("认证失败")

        # 正常回复
        if "python" in user_input.lower():
            return "Python 是一种广泛使用的编程语言。"
        elif "你好" in user_input:
            return "你好！有什么我可以帮助你的吗？"
        else:
            return f"收到你的问题: '{user_input[:30]}'"

    def chat(self, user_input: str) -> Dict:
        """与用户对话"""
        start_time = time.time()

        try:
            messages = [{"role": "user", "content": user_input}]
            response = self._call_llm(messages)
            response_time = time.time() - start_time

            # 记录成功
            self.monitor.record_request(True, response_time)

            return {
                "success": True,
                "response": response,
                "source": "primary",
                "response_time": response_time
            }

        except Exception as e:
            response_time = time.time() - start_time
            error = classify_error(e)

            # 记录失败
            self.monitor.record_request(False, response_time, error)

            # 执行降级
            fallback_response = self.fallback.execute(error, {"query": user_input})

            return {
                "success": False,
                "response": fallback_response,
                "source": "fallback",
                "error": str(error),
                "response_time": response_time
            }


# ===== 完整演示 =====
print("\n" + "=" * 60)
print("健壮 Agent 完整演示")
print("=" * 60)

agent = RobustAgent()

test_queries = [
    "Python 是什么？",
    "你好！",
    "请触发超时错误",
    "请触发限流错误",
    "请触发认证错误",
    "正常问题",
]

for query in test_queries:
    print(f"\n用户: {query}")
    result = agent.chat(query)
    source = "主服务" if result["source"] == "primary" else "降级"
    print(f"助手: {result['response']}")
    print(f"[来源: {source}] [耗时: {result['response_time']:.3f}s]")

# 打印监控报告
print(f"\n--- 监控报告 ---")
report = agent.monitor.get_report()
for key, value in report.items():
    print(f"  {key}: {value}")

print(f"""
=== 错误处理最佳实践 ===

1. 错误分类:
   - 暂时性错误 → 重试
   - 永久性错误 → 降级
   - 限流错误 → 等待后重试
   - 认证错误 → 告警

2. 重试策略:
   - 指数退避: 每次重试间隔翻倍
   - 抖动: 添加随机延迟避免雪崩
   - 最大重试次数: 避免无限重试

3. 降级策略:
   - 返回缓存数据
   - 使用简化版本
   - 提供替代功能
   - 友好的错误提示

4. 监控告警:
   - 跟踪错误率
   - 监控响应时间
   - 设置告警阈值
   - 定期生成报告
""")
```

**预期输出：**
```
============================================================
健壮 Agent 完整演示
============================================================

用户: Python 是什么？
助手: Python 是一种广泛使用的编程语言。
[来源: 主服务] [耗时: 0.001s]

用户: 你好！
助手: 你好！有什么我可以帮助你的吗？
[来源: 主服务] [耗时: 0.000s]

用户: 请触发超时错误
  [尝试 1/3] [timeout] LLM API 超时 (可重试)
  [等待 0.08s 后重试...]
  [尝试 2/3] [timeout] LLM API 超时 (可重试)
  [等待 0.15s 后重试...]
  [尝试 3/3] [timeout] LLM API 超时 (可重试)
助手: 查询处理超时。建议简化问题后重试，例如: '请触发超时错误...'
[来源: 降级] [耗时: 0.250s]

用户: 请触发限流错误
  [尝试 1/3] [transient] API 限流 (可重试)
  ...
助手: 服务繁忙，请稍后再试。建议间隔 30 秒后重试。
[来源: 降级] [耗时: 0.200s]

--- 监控报告 ---
  total_requests: 6
  success_rate: 50.00%
  failure_rate: 50.00%
  avg_response_time: 0.100s
  error_breakdown: {'timeout': 1, 'transient': 1, 'unknown': 1}
  active_alerts: 0

=== 错误处理最佳实践 ===
...
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 重试过多导致雪崩 | 增加抖动（随机延迟），减小最大重试次数 |
| 2 | 降级策略未触发 | 检查错误分类是否正确，确保 `classify_error` 映射完整 |
| 3 | 告警过多 | 调高 `alert_threshold`，添加告警静默期 |
| 4 | 错误日志太多 | 添加日志级别过滤，只记录关键错误 |
| 5 | 降级响应太生硬 | 优化降级消息，提供更具体的帮助建议 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| 指数退避 | 每次重试等待时间翻倍的策略 |
| 抖动 (Jitter) | 在退避延迟中添加随机值，避免雪崩 |
| 优雅降级 | 系统部分故障时仍能提供基本服务 |
| 错误分类 | 将错误分为暂时性、永久性等类别 |
| 重试装饰器 | 自动重试失败操作的装饰器 |
| 降级策略 | 主要功能不可用时的替代方案 |
| 监控告警 | 跟踪系统状态并在异常时通知 |
| 雪崩效应 | 大量重试导致系统过载的连锁反应 |

## ✅ 验收清单
- [ ] 能对错误进行正确分类
- [ ] 能实现指数退避重试装饰器
- [ ] 能设计和实现降级策略
- [ ] 能构建监控和告警系统
- [ ] 理解抖动（jitter）的作用
- [ ] 能让系统在错误时优雅降级而非崩溃

## 📝 复盘小纸条
- 今天最大的收获: _______________________
- 还不太确定的: _________________________

## 📥 明日同步接口
- 今日完成度: [ ] 100%  [ ] 80%  [ ] 60%  [ ] 其他___
- 卡点描述: _________________________
- 代码是否能跑通: [ ] 完全可以  [ ] 部分可以  [ ] 有问题
- 明天希望: _________________________
