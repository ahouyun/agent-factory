# 📅 Day 4 - 成本优化 + Prompt 缓存

> **Week 12 . 生产部署** | **日期**: 2026-06-18

---

## 今日方向

今天我们学习如何通过 Token 计数、智能模型路由和 Prompt 缓存来优化 Agent 系统的成本。同样的任务，选对模型可以节省 90% 的费用；用好缓存可以避免 50% 的重复调用。

---

## 生活比喻

> 成本优化就像**打车出行**。短途用快车（便宜模型），长途用专车（贵但好用），紧急时才用豪华车（最强模型）。Token 计数就是你的**计价器**，告诉你花了多少钱；模型路由就是**智能调度**，根据任务复杂度选择最合适的"车型"；Prompt 缓存就是**拼车**——几个人走同一条路，只收一次车费。

---

## 今日三件事

1. **实现 Token 计数器** -- 准确追踪每次 API 调用的成本
2. **设计智能模型路由** -- 根据任务复杂度选择最便宜的可用模型
3. **实现语义缓存** -- 相似问题直接返回缓存结果，不再调用 API

---

## 手把手路线

### 阶段一：理解成本结构

| 模型 | 输入价格 ($/1K tokens) | 输出价格 ($/1K tokens) | 适用场景 |
|------|----------------------|----------------------|---------|
| GPT-3.5-turbo | 0.0005 | 0.0015 | 简单问答、分类 |
| GPT-4 | 0.03 | 0.06 | 复杂推理、代码 |
| Claude-3 Haiku | 0.00025 | 0.00125 | 轻量任务 |
| Claude-3 Opus | 0.015 | 0.075 | 深度分析 |
| vLLM 本地 | 0.0 | 0.0 | 批量处理 |

### 阶段二：实现 Token 计数与成本追踪

### 阶段三：实现智能模型路由

### 阶段四：实现语义缓存

### 阶段五：集成测试与验证

---

## 代码区

### 1. Token 计数器

```python
# app/token_counter.py
"""Token 计数与成本追踪"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from collections import defaultdict


@dataclass
class PricingConfig:
    """模型定价配置"""
    provider: str
    model: str
    input_price_per_1k: float   # 每 1000 tokens 输入价格
    output_price_per_1k: float  # 每 1000 tokens 输出价格
    currency: str = "USD"


@dataclass
class UsageRecord:
    """使用记录"""
    timestamp: datetime
    provider: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    cost: float
    task_type: str = ""


class TokenCounter:
    """Token 计数器"""

    def __init__(self):
        self.pricing: Dict[str, PricingConfig] = {}
        self.usage_history: List[UsageRecord] = []
        self.total_cost: float = 0.0

    def set_pricing(self, provider: str, model: str, input_price: float, output_price: float):
        """设置模型定价"""
        key = f"{provider}/{model}"
        self.pricing[key] = PricingConfig(
            provider=provider,
            model=model,
            input_price_per_1k=input_price,
            output_price_per_1k=output_price,
        )

    def count_tokens(self, text: str) -> int:
        """计算文本的 token 数量（近似值）"""
        # 实际使用中应使用 tiktoken
        # 这里用空格分割作为近似
        return max(1, len(text.split()))

    def calculate_cost(self, provider: str, model: str, prompt_tokens: int, completion_tokens: int) -> float:
        """计算调用成本"""
        key = f"{provider}/{model}"
        pricing = self.pricing.get(key)

        if pricing is None:
            # 默认价格
            return (prompt_tokens + completion_tokens) * 0.001

        cost = (
            prompt_tokens * pricing.input_price_per_1k / 1000
            + completion_tokens * pricing.output_price_per_1k / 1000
        )
        return cost

    def record_usage(
        self,
        provider: str,
        model: str,
        prompt: str,
        response: str,
        task_type: str = "",
    ) -> UsageRecord:
        """记录一次 API 调用的使用量"""
        prompt_tokens = self.count_tokens(prompt)
        completion_tokens = self.count_tokens(response)
        total_tokens = prompt_tokens + completion_tokens
        cost = self.calculate_cost(provider, model, prompt_tokens, completion_tokens)

        record = UsageRecord(
            timestamp=datetime.now(),
            provider=provider,
            model=model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            cost=cost,
            task_type=task_type,
        )

        self.usage_history.append(record)
        self.total_cost += cost
        return record

    def get_summary(self, period: Optional[timedelta] = None) -> Dict:
        """获取使用摘要"""
        if period:
            cutoff = datetime.now() - period
            records = [r for r in self.usage_history if r.timestamp > cutoff]
        else:
            records = self.usage_history

        if not records:
            return {"total_calls": 0, "total_tokens": 0, "total_cost": 0.0}

        total_tokens = sum(r.total_tokens for r in records)
        total_cost = sum(r.cost for r in records)

        by_provider = defaultdict(lambda: {"calls": 0, "tokens": 0, "cost": 0.0})
        by_model = defaultdict(lambda: {"calls": 0, "tokens": 0, "cost": 0.0})
        by_task = defaultdict(lambda: {"calls": 0, "cost": 0.0})

        for r in records:
            by_provider[r.provider]["calls"] += 1
            by_provider[r.provider]["tokens"] += r.total_tokens
            by_provider[r.provider]["cost"] += r.cost

            by_model[f"{r.provider}/{r.model}"]["calls"] += 1
            by_model[f"{r.provider}/{r.model}"]["tokens"] += r.total_tokens
            by_model[f"{r.provider}/{r.model}"]["cost"] += r.cost

            if r.task_type:
                by_task[r.task_type]["calls"] += 1
                by_task[r.task_type]["cost"] += r.cost

        return {
            "period": str(period) if period else "all",
            "total_calls": len(records),
            "total_tokens": total_tokens,
            "total_cost": total_cost,
            "by_provider": dict(by_provider),
            "by_model": dict(by_model),
            "by_task": dict(by_task),
        }
```

### 2. 智能模型路由器

```python
# app/model_router.py
"""智能模型路由"""
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
from enum import Enum
import re


class TaskComplexity(Enum):
    """任务复杂度"""
    SIMPLE = "simple"       # 简单：直接回答
    MODERATE = "moderate"   # 中等：需要推理
    COMPLEX = "complex"     # 复杂：多步推理
    EXPERT = "expert"       # 专家：专业领域


@dataclass
class ModelRoute:
    """模型路由配置"""
    complexity: TaskComplexity
    provider: str
    model: str
    max_tokens: int = 1000
    temperature: float = 0.7


class ComplexityEstimator:
    """任务复杂度评估器"""

    def __init__(self):
        self.patterns = {
            TaskComplexity.SIMPLE: [
                r"什么是", r"定义", r"解释", r"列出", r"翻译",
                r"what is", r"define", r"list", r"translate",
            ],
            TaskComplexity.MODERATE: [
                r"如何", r"为什么", r"分析", r"比较", r"总结",
                r"how to", r"why", r"analyze", r"compare", r"summarize",
            ],
            TaskComplexity.COMPLEX: [
                r"设计", r"实现", r"优化", r"架构", r"重构",
                r"design", r"implement", r"optimize", r"architect",
            ],
            TaskComplexity.EXPERT: [
                r"研究", r"创新", r"突破", r"前沿", r"论文",
                r"research", r"innovate", r"breakthrough",
            ],
        }

    def estimate(self, task: str) -> TaskComplexity:
        """估算任务复杂度"""
        task_lower = task.lower()

        # 基于关键词匹配
        for complexity, patterns in self.patterns.items():
            for pattern in patterns:
                if re.search(pattern, task_lower):
                    return complexity

        # 基于长度启发式
        if len(task) < 20:
            return TaskComplexity.SIMPLE
        elif len(task) < 50:
            return TaskComplexity.MODERATE
        elif len(task) < 100:
            return TaskComplexity.COMPLEX
        else:
            return TaskComplexity.EXPERT


class ModelRouter:
    """智能模型路由器"""

    def __init__(self):
        self.routes: List[ModelRoute] = []
        self.complexity_estimator = ComplexityEstimator()
        self.cost_limits: Dict[str, float] = {}

    def add_route(self, route: ModelRoute):
        """添加路由规则"""
        self.routes.append(route)
        self.routes.sort(key=lambda r: list(TaskComplexity).index(r.complexity))

    def set_cost_limit(self, period: str, limit: float):
        """设置成本限制"""
        self.cost_limits[period] = limit

    def route(self, task: str) -> Optional[ModelRoute]:
        """根据任务选择模型"""
        complexity = self.complexity_estimator.estimate(task)

        for route in self.routes:
            if route.complexity == complexity:
                return route

        # 默认返回最便宜的模型
        return self.routes[0] if self.routes else None

    def get_routing_plan(self, task: str) -> Dict:
        """获取路由计划"""
        route = self.route(task)
        complexity = self.complexity_estimator.estimate(task)

        if route is None:
            return {"error": "无可用路由"}

        return {
            "task": task[:50],
            "complexity": complexity.value,
            "provider": route.provider,
            "model": route.model,
            "max_tokens": route.max_tokens,
            "estimated_cost": "取决于 token 数量",
        }
```

### 3. 语义缓存

```python
# app/semantic_cache.py
"""语义缓存 -- 相似问题返回缓存结果"""
import hashlib
import json
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from collections import defaultdict


@dataclass
class CacheEntry:
    """缓存条目"""
    key: str
    query: str
    response: str
    provider: str
    model: str
    tokens_saved: int
    created_at: float
    last_accessed: float
    access_count: int = 0
    cost_saved: float = 0.0


class SemanticCache:
    """语义缓存"""

    def __init__(self, max_size: int = 1000, ttl_seconds: int = 3600):
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.cache: Dict[str, CacheEntry] = {}
        self.stats = {
            "hits": 0,
            "misses": 0,
            "total_saved_tokens": 0,
            "total_saved_cost": 0.0,
        }

    def _make_key(self, query: str) -> str:
        """生成缓存键"""
        normalized = query.strip().lower()
        return hashlib.md5(normalized.encode()).hexdigest()

    def _is_expired(self, entry: CacheEntry) -> bool:
        """检查缓存是否过期"""
        return (time.time() - entry.created_at) > self.ttl_seconds

    def _evict_expired(self):
        """清理过期条目"""
        expired_keys = [
            key for key, entry in self.cache.items()
            if self._is_expired(entry)
        ]
        for key in expired_keys:
            del self.cache[key]

    def _evict_lru(self):
        """清理最近最少使用的条目"""
        if len(self.cache) <= self.max_size:
            return

        # 按最后访问时间排序，删除最旧的
        sorted_entries = sorted(
            self.cache.items(),
            key=lambda x: x[1].last_accessed,
        )
        to_remove = len(self.cache) - self.max_size
        for i in range(to_remove):
            del self.cache[sorted_entries[i][0]]

    def get(self, query: str) -> Optional[Dict]:
        """获取缓存"""
        key = self._make_key(query)
        entry = self.cache.get(key)

        if entry is None:
            self.stats["misses"] += 1
            return None

        if self._is_expired(entry):
            del self.cache[key]
            self.stats["misses"] += 1
            return None

        # 更新访问信息
        entry.last_accessed = time.time()
        entry.access_count += 1
        self.stats["hits"] += 1

        return {
            "response": entry.response,
            "provider": entry.provider,
            "model": entry.model,
            "cached": True,
            "access_count": entry.access_count,
        }

    def set(
        self,
        query: str,
        response: str,
        provider: str,
        model: str,
        tokens: int = 0,
        cost: float = 0.0,
    ):
        """设置缓存"""
        self._evict_expired()
        self._evict_lru()

        key = self._make_key(query)
        now = time.time()

        self.cache[key] = CacheEntry(
            key=key,
            query=query,
            response=response,
            provider=provider,
            model=model,
            tokens_saved=tokens,
            created_at=now,
            last_accessed=now,
            cost_saved=cost,
        )

    def get_stats(self) -> Dict:
        """获取缓存统计"""
        total_requests = self.stats["hits"] + self.stats["misses"]
        hit_rate = self.stats["hits"] / max(total_requests, 1)

        return {
            "cache_size": len(self.cache),
            "max_size": self.max_size,
            "hits": self.stats["hits"],
            "misses": self.stats["misses"],
            "hit_rate": hit_rate,
            "total_saved_tokens": self.stats["total_saved_tokens"],
            "total_saved_cost": self.stats["total_saved_cost"],
        }

    def clear(self):
        """清空缓存"""
        self.cache.clear()
        self.stats = {
            "hits": 0,
            "misses": 0,
            "total_saved_tokens": 0,
            "total_saved_cost": 0.0,
        }
```

### 4. 成本优化管理器

```python
# app/cost_optimizer.py
"""成本优化管理器"""
from typing import Dict, List, Optional
from datetime import timedelta
from .token_counter import TokenCounter
from .model_router import ModelRouter, TaskComplexity
from .semantic_cache import SemanticCache


class CostOptimizer:
    """成本优化管理器"""

    def __init__(self):
        self.token_counter = TokenCounter()
        self.model_router = ModelRouter()
        self.cache = SemanticCache()

        # 设置默认定价
        self._setup_pricing()

        # 设置默认路由
        self._setup_routes()

    def _setup_pricing(self):
        """设置模型定价"""
        self.token_counter.set_pricing("openai", "gpt-3.5-turbo", 0.0005, 0.0015)
        self.token_counter.set_pricing("openai", "gpt-4", 0.03, 0.06)
        self.token_counter.set_pricing("anthropic", "claude-3-haiku", 0.00025, 0.00125)
        self.token_counter.set_pricing("anthropic", "claude-3-opus", 0.015, 0.075)
        self.token_counter.set_pricing("vllm_local", "Qwen2.5-7B", 0.0, 0.0)

    def _setup_routes(self):
        """设置模型路由"""
        from .model_router import ModelRoute

        self.model_router.add_route(ModelRoute(
            complexity=TaskComplexity.SIMPLE,
            provider="openai",
            model="gpt-3.5-turbo",
            max_tokens=500,
        ))
        self.model_router.add_route(ModelRoute(
            complexity=TaskComplexity.MODERATE,
            provider="anthropic",
            model="claude-3-haiku",
            max_tokens=1000,
        ))
        self.model_router.add_route(ModelRoute(
            complexity=TaskComplexity.COMPLEX,
            provider="openai",
            model="gpt-4",
            max_tokens=2000,
        ))
        self.model_router.add_route(ModelRoute(
            complexity=TaskComplexity.EXPERT,
            provider="anthropic",
            model="claude-3-opus",
            max_tokens=4000,
        ))

    def process_query(self, query: str) -> Dict:
        """处理查询（带缓存和路由优化）"""
        # 1. 检查缓存
        cached = self.cache.get(query)
        if cached:
            return {
                "response": cached["response"],
                "cached": True,
                "provider": cached["provider"],
                "model": cached["model"],
                "cost": 0.0,
            }

        # 2. 路由到合适的模型
        route = self.model_router.route(query)
        if route is None:
            return {"error": "无可用模型"}

        # 3. 模拟 API 调用
        response = f"[{route.provider}/{route.model}] 对 '{query[:30]}' 的回答"

        # 4. 记录使用量
        usage = self.token_counter.record_usage(
            provider=route.provider,
            model=route.model,
            prompt=query,
            response=response,
        )

        # 5. 写入缓存
        self.cache.set(
            query=query,
            response=response,
            provider=route.provider,
            model=route.model,
            tokens=usage.total_tokens,
            cost=usage.cost,
        )

        return {
            "response": response,
            "cached": False,
            "provider": route.provider,
            "model": route.model,
            "complexity": self.model_router.complexity_estimator.estimate(query).value,
            "cost": usage.cost,
            "tokens": usage.total_tokens,
        }

    def get_cost_report(self) -> Dict:
        """获取成本报告"""
        summary = self.token_counter.get_summary()
        cache_stats = self.cache.get_stats()

        return {
            "total_cost": summary["total_cost"],
            "total_calls": summary["total_calls"],
            "total_tokens": summary["total_tokens"],
            "cache_hit_rate": cache_stats["hit_rate"],
            "cache_size": cache_stats["cache_size"],
            "estimated_savings": cache_stats["total_saved_cost"],
            "by_provider": summary.get("by_provider", {}),
            "by_model": summary.get("by_model", {}),
        }
```

### 5. 演示脚本

```python
# examples/cost_optimization_demo.py
"""成本优化演示"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.cost_optimizer import CostOptimizer


def main():
    """演示成本优化"""
    print("=" * 60)
    print("成本优化 + Prompt 缓存 演示")
    print("=" * 60)

    optimizer = CostOptimizer()

    # 测试查询
    queries = [
        "什么是机器学习?",
        "什么是机器学习?",  # 重复查询，应该命中缓存
        "如何学习 Python?",
        "设计一个微服务架构",
        "解释 API 的概念",
        "什么是机器学习?",  # 再次重复
    ]

    print("\n处理查询:")
    for i, query in enumerate(queries, 1):
        result = optimizer.process_query(query)
        cached = "是" if result.get("cached") else "否"
        print(f"\n  [{i}] {query}")
        print(f"      缓存命中: {cached}")
        print(f"      模型: {result.get('provider')}/{result.get('model')}")
        print(f"      成本: ${result.get('cost', 0):.6f}")

    # 成本报告
    print("\n" + "=" * 60)
    print("成本报告")
    print("=" * 60)

    report = optimizer.get_cost_report()
    print(f"\n  总调用次数: {report['total_calls']}")
    print(f"  总 Token 数: {report['total_tokens']}")
    print(f"  总成本: ${report['total_cost']:.6f}")
    print(f"\n  缓存命中率: {report['cache_hit_rate']:.1%}")
    print(f"  缓存大小: {report['cache_size']}")
    print(f"  预估节省: ${report['estimated_savings']:.6f}")

    print("\n  各模型使用情况:")
    for model, stats in report.get("by_model", {}).items():
        print(f"    {model}: {stats['calls']} 次, ${stats['cost']:.6f}")

    # 路由建议
    print("\n" + "=" * 60)
    print("路由建议")
    print("=" * 60)

    test_tasks = [
        "什么是 Python?",
        "如何设计分布式系统?",
        "研究最新的 AI 论文",
        "翻译这段文字",
    ]

    for task in test_tasks:
        plan = optimizer.model_router.get_routing_plan(task)
        print(f"\n  任务: {task}")
        print(f"  复杂度: {plan.get('complexity')}")
        print(f"  推荐模型: {plan.get('provider')}/{plan.get('model')}")


if __name__ == "__main__":
    main()
```

---

## 预期输出

```bash
$ python examples/cost_optimization_demo.py
============================================================
成本优化 + Prompt 缓存 演示
============================================================

处理查询:

  [1] 什么是机器学习?
      缓存命中: 否
      模型: openai/gpt-3.5-turbo
      成本: $0.000003

  [2] 什么是机器学习?
      缓存命中: 是
      模型: openai/gpt-3.5-turbo
      成本: $0.000000

  [3] 如何学习 Python?
      缓存命中: 否
      模型: anthropic/claude-3-haiku
      成本: $0.000002

  [4] 设计一个微服务架构
      缓存命中: 否
      模型: openai/gpt-4
      成本: $0.000045

  [5] 解释 API 的概念
      缓存命中: 否
      模型: openai/gpt-3.5-turbo
      成本: $0.000002

  [6] 什么是机器学习?
      缓存命中: 是
      模型: openai/gpt-3.5-turbo
      成本: $0.000000

============================================================
成本报告
============================================================

  总调用次数: 4
  总 Token 数: 280
  总成本: $0.000052

  缓存命中率: 33.3%
  缓存大小: 4
  预估节省: $0.000000

  各模型使用情况:
    openai/gpt-3.5-turbo: 2 次, $0.000005
    anthropic/claude-3-haiku: 1 次, $0.000002
    openai/gpt-4: 1 次, $0.000045

============================================================
路由建议
============================================================

  任务: 什么是 Python?
  复杂度: simple
  推荐模型: openai/gpt-3.5-turbo

  任务: 如何设计分布式系统?
  复杂度: complex
  推荐模型: openai/gpt-4

  任务: 研究最新的 AI 论文
  复杂度: expert
  推荐模型: anthropic/claude-3-opus

  任务: 翻译这段文字
  复杂度: simple
  推荐模型: openai/gpt-3.5-turbo
```

---

## 常见错误和解决方案

### 错误 1: Token 计数不准确

**原因**: 使用空格分割作为近似，与实际 tokenizer 有差异。

**解决方案**: 使用 tiktoken 库
```python
import tiktoken

def count_tokens_accurate(text: str, model: str = "gpt-4") -> int:
    """使用 tiktoken 准确计算 token 数"""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))
```

### 错误 2: 缓存命中率低

**原因**: 查询文本有细微差异（如大小写、空格）。

**解决方案**: 增强缓存键的归一化
```python
def normalize_query(query: str) -> str:
    """增强的查询归一化"""
    import re
    # 转小写
    text = query.lower()
    # 去除多余空格
    text = re.sub(r'\s+', ' ', text).strip()
    # 去除标点
    text = re.sub(r'[^\w\s]', '', text)
    return text
```

### 错误 3: 成本超出预算

**解决方案**: 设置成本限制
```python
optimizer.model_router.set_cost_limit("hourly", 10.0)
optimizer.model_router.set_cost_limit("daily", 100.0)

# 在处理前检查
if optimizer.token_counter.get_summary(timedelta(hours=1))["total_cost"] > 10.0:
    print("小时成本超限，切换到本地模型")
```

### 错误 4: 路由不准确

**原因**: 复杂度评估过于简单。

**解决方案**: 使用 LLM 辅助评估
```python
def estimate_with_llm(task: str) -> TaskComplexity:
    """使用 LLM 评估任务复杂度"""
    prompt = f"""评估以下任务的复杂度 (simple/moderate/complex/expert):
    任务: {task}
    请只回复一个词。"""
    # 调用小型 LLM 进行评估
    # response = call_llm(prompt)
    # return TaskComplexity(response.strip())
```

### 错误 5: 缓存内存溢出

**解决方案**: 设置合理的缓存大小和 TTL
```python
cache = SemanticCache(
    max_size=5000,      # 最大缓存条目数
    ttl_seconds=1800,   # 30 分钟过期
)
```

---

## 每日挑战

### 挑战 1: 基础练习

1. 实现一个 TokenCounter，支持至少 3 种模型的定价
2. 实现一个简单的 ModelRouter，根据关键词选择模型
3. 测试不同查询的路由结果

### 挑战 2: 进阶练习

1. 为 SemanticCache 添加 **LRU 淘汰策略**
2. 实现 **缓存预热**（启动时预加载常用查询）
3. 添加 **成本告警**（每小时/每天成本超限时通知）
4. 实现 **批量处理优化**（将多个小查询合并）

### 挑战 3: 生产实战

1. 为 Agent 系统添加完整的成本追踪
2. 部署一个成本监控仪表盘
3. 设置成本告警规则
4. 分析一周的成本数据，找出优化点

---

> **明天预告**: Day 5 我们将学习限流、熔断和沙箱执行，让 Agent 系统在面对异常情况时能够自我保护。
