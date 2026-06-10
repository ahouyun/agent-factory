# 📅 Week 7 Day 6：错误处理 + 重试 + 优雅降级

## 🧭 今日方向
> 生产环境中的 Agent 必须能优雅地处理各种异常。今天学习错误分类、重试策略、降级方案，让系统在出错时"体面地失败"而非崩溃。

## 🎯 生活比喻
> 错误处理就像"安全气囊"。正常驾驶时它不会触发，但一旦发生碰撞（异常），它会保护乘客（用户）不受伤害。好的安全气囊（错误处理）能在各种碰撞情况下都有效工作。

## 📋 今日三件事
1. 理解 Agent 系统中的常见错误类型
2. 实现指数退避重试机制
3. 构建优雅降级策略

## 🗺️ 手把手路线

### Step 1: 错误分类
- 做什么: 列出 Agent 系统中的所有可能错误
- 为什么: 分类是有效处理的前提
- 成功标志: 能说出至少 5 种常见错误

### Step 2: 重试机制
- 做什么: 实现带指数退避的重试装饰器
- 为什么: 很多错误是暂时的，重试可以恢复
- 成功标志: 重试机制能处理暂时性故障

### Step 3: 降级策略
- 做什么: 实现当主要功能不可用时的替代方案
- 为什么: 确保系统始终可用，即使功能受限
- 成功标志: 系统能在部分故障时继续运行

## 💻 代码区

```python
"""
Week 7 Day 6: 错误处理 + 重试 + 优雅降级
安装依赖: pip install langchain langchain-openai tenacity
"""

import time
import functools
from typing import Any, Callable, Optional, Type
from enum import Enum
from dataclasses import dataclass
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# ========== 1. 错误分类 ==========
print("=== 1. 错误分类 ===")

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

    def __str__(self):
        return f"[{self.category.value}] {self.message}"

# 常见错误映射
ERROR_MAP = {
    "TimeoutError": ErrorCategory.TIMEOUT,
    "ConnectionError": ErrorCategory.TRANSIENT,
    "RateLimitError": ErrorCategory.RATE_LIMIT,
    "AuthenticationError": ErrorCategory.AUTH_ERROR,
    "ValidationError": ErrorCategory.VALIDATION,
}

def classify_error(exception: Exception) -> AgentError:
    """分类错误"""
    error_type = type(exception).__name__
    category = ERROR_MAP.get(error_type, ErrorCategory.UNKNOWN)

    retryable = category in [
        ErrorCategory.TRANSIENT,
        ErrorCategory.TIMEOUT,
        ErrorCategory.RATE_LIMIT
    ]

    return AgentError(
        category=category,
        message=str(exception),
        original_exception=exception,
        retryable=retryable
    )

# ========== 2. 重试机制 ==========
print("\n=== 2. 重试机制 ===")

class RetryConfig:
    """重试配置"""
    def __init__(
        self,
        max_retries: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 30.0,
        exponential_base: float = 2.0,
        retryable_categories: list = None
    ):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.exponential_base = exponential_base
        self.retryable_categories = retryable_categories or [
            ErrorCategory.TRANSIENT,
            ErrorCategory.TIMEOUT,
            ErrorCategory.RATE_LIMIT
        ]

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

                    # 计算延迟（指数退避）
                    delay = min(
                        config.base_delay * (config.exponential_base ** attempt),
                        config.max_delay
                    )
                    print(f"  [等待 {delay:.1f}s 后重试...]")
                    time.sleep(delay)

            raise last_exception

        return wrapper
    return decorator

# 测试重试机制
@with_retry(RetryConfig(max_retries=3, base_delay=0.5))
def unreliable_api_call(success_on_attempt: int = 3):
    """模拟不稳定的 API 调用"""
    attempt = getattr(unreliable_api_call, '_attempt', 0) + 1
    unreliable_api_call._attempt = attempt

    if attempt < success_on_attempt:
        raise ConnectionError(f"连接失败 (尝试 {attempt})")

    return f"成功 (尝试 {attempt})"

# 测试
print("--- 测试重试机制 ---")
try:
    result = unreliable_api_call(success_on_attempt=2)
    print(f"结果: {result}")
except Exception as e:
    print(f"最终失败: {e}")

# ========== 3. 优雅降级 ==========
print("\n=== 3. 优雅降级 ===")

class FallbackStrategy:
    """降级策略"""
    def __init__(self):
        self.strategies = {}

    def register(self, error_category: ErrorCategory, strategy: Callable):
        """注册降级策略"""
        self.strategies[error_category] = strategy

    def execute(self, error: AgentError, context: dict = None) -> Any:
        """执行降级策略"""
        strategy = self.strategies.get(error.category)
        if strategy:
            return strategy(error, context)
        return self.default_fallback(error, context)

    def default_fallback(self, error: AgentError, context: dict = None) -> str:
        """默认降级策略"""
        return f"抱歉，当前无法处理您的请求。错误: {error.message}"

# 创建降级策略
fallback = FallbackStrategy()

def rate_limit_fallback(error: AgentError, context: dict = None) -> str:
    """限流降级"""
    return "服务繁忙，请稍后再试。建议间隔 30 秒后重试。"

def timeout_fallback(error: AgentError, context: dict = None) -> str:
    """超时降级"""
    query = context.get("query", "") if context else ""
    if query:
        # 尝试简化查询
        return f"查询 '{query}' 处理超时。建议简化问题后重试。"
    return "请求超时，请稍后重试。"

def auth_fallback(error: AgentError, context: dict = None) -> str:
    """认证降级"""
    return "身份验证失败。请检查 API 密钥是否正确配置。"

# 注册降级策略
fallback.register(ErrorCategory.RATE_LIMIT, rate_limit_fallback)
fallback.register(ErrorCategory.TIMEOUT, timeout_fallback)
fallback.register(ErrorCategory.AUTH_ERROR, auth_fallback)

# ========== 4. 完整的错误处理系统 ==========
print("\n=== 4. 完整的错误处理系统 ===")

class RobustAgent:
    """健壮的 Agent"""

    def __init__(self, llm, retry_config: RetryConfig = None):
        self.llm = llm
        self.retry_config = retry_config or RetryConfig()
        self.fallback = FallbackStrategy()
        self._setup_fallbacks()

    def _setup_fallbacks(self):
        """设置降级策略"""
        self.fallback.register(ErrorCategory.RATE_LIMIT, lambda e, c: "服务繁忙，请稍后重试。")
        self.fallback.register(ErrorCategory.TIMEOUT, lambda e, c: "请求超时，请简化问题后重试。")
        self.fallback.register(ErrorCategory.AUTH_ERROR, lambda e, c: "API 配置错误，请检查密钥。")

    @with_retry(RetryConfig(max_retries=2, base_delay=1.0))
    def _call_llm(self, messages):
        """调用 LLM（带重试）"""
        return self.llm.invoke(messages)

    def chat(self, user_input: str) -> dict:
        """与用户对话"""
        try:
            messages = [HumanMessage(content=user_input)]
            response = self._call_llm(messages)

            return {
                "success": True,
                "response": response.content,
                "source": "primary"
            }

        except Exception as e:
            error = classify_error(e)
            print(f"  [错误] {error}")

            # 尝试降级
            fallback_response = self.fallback.execute(error, {"query": user_input})

            return {
                "success": False,
                "response": fallback_response,
                "source": "fallback",
                "error": str(error)
            }

# 测试健壮的 Agent
agent = RobustAgent(llm)

test_queries = [
    "Python 是什么？",
    "如何学习编程？",
    "今天天气怎么样？",
]

for query in test_queries:
    print(f"\n--- 查询: {query} ---")
    result = agent.chat(query)
    print(f"来源: {result['source']}")
    print(f"回答: {result['response'][:100]}...")

# ========== 5. 监控和告警 ==========
print("\n=== 5. 监控和告警 ===")

class MonitoringSystem:
    """监控系统"""

    def __init__(self):
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

        # 如果同类错误超过 5 次，触发告警
        if count >= 5:
            alert = {
                "type": "error_threshold",
                "category": category,
                "count": count,
                "timestamp": time.time()
            }
            self.alerts.append(alert)
            print(f"  [告警] {category} 错误次数: {count}")

    def get_report(self) -> dict:
        """获取监控报告"""
        total = self.metrics["total_requests"]
        if total == 0:
            return {"message": "暂无数据"}

        avg_response_time = sum(self.metrics["response_times"]) / total if self.metrics["response_times"] else 0

        return {
            "total_requests": total,
            "success_rate": self.metrics["successful"] / total,
            "failure_rate": self.metrics["failed"] / total,
            "avg_response_time": avg_response_time,
            "error_breakdown": self.metrics["by_error_category"],
            "active_alerts": len([a for a in self.alerts if time.time() - a["timestamp"] < 3600])
        }

# 测试监控
monitor = MonitoringSystem()

# 模拟请求
for i in range(10):
    success = i % 3 != 0  # 每 3 个请求失败 1 个
    response_time = 0.5 + (i * 0.1)

    error = None
    if not success:
        error = AgentError(
            category=ErrorCategory.TRANSIENT,
            message=f"模拟错误 {i}"
        )

    monitor.record_request(success, response_time, error)

print("\n监控报告:")
report = monitor.get_report()
print(json.dumps(report, indent=2, ensure_ascii=False))

print("""
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

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 重试过多导致雪崩 | 增加抖动（随机延迟），减小最大重试次数 |
| 2 | 降级策略未触发 | 检查错误分类是否正确 |
| 3 | 告警过多 | 调整告警阈值，添加告警静默期 |
| 4 | 错误日志太多 | 添加日志级别过滤，只记录关键错误 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| 指数退避 | 每次重试等待时间翻倍的策略 |
| 优雅降级 | 系统部分故障时仍能提供基本服务 |
| 错误分类 | 将错误分为暂时性、永久性等类别 |
| 重试装饰器 | 自动重试失败操作的装饰器 |
| 降级策略 | 主要功能不可用时的替代方案 |
| 监控告警 | 跟踪系统状态并在异常时通知 |
| 雪崩效应 | 大量重试导致系统过载 |

## ✅ 验收清单
- [ ] 能对错误进行分类
- [ ] 能实现指数退避重试
- [ ] 能设计和实现降级策略
- [ ] 能构建监控和告警系统
- [ ] 理解错误处理的最佳实践
- [ ] 能让系统在错误时优雅降级

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
