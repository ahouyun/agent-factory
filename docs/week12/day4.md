# 📅 Week 12 Day 4：成本优化：Token 计数 + 模型路由

## 💾 Prompt 缓存策略

Prompt 缓存可以显著降低 API 调用成本：

### 1. 语义缓存
将相似的查询缓存起来，避免重复调用 LLM：
```python
# 伪代码
cache_key = compute_embedding(query)
if cache_key in semantic_cache:
    return semantic_cache[cache_key]
else:
    result = llm.call(query)
    semantic_cache[cache_key] = result
    return result
```

### 2. 前缀缓存（Prefix Caching）
OpenAI 和 Anthropic 都支持 System Prompt 缓存：
- OpenAI: 自动缓存相同前缀的请求
- Anthropic: 使用 `cache_control` 参数控制

### 3. 批量处理
对非实时任务使用 Batch API，成本降低 50%：
```python
# OpenAI Batch API
response = client.batches.create(input_file_id=file_id, endpoint="/v1/chat/completions")
```

### 成本对比
| 方案 | 节省比例 | 适用场景 |
|------|---------|---------|
| 语义缓存 | 30-60% | 重复性查询 |
| 前缀缓存 | 50-90% | 长 System Prompt |
| 批量处理 | 50% | 非实时任务 |

## 🧭 今日方向
> 学习如何通过 Token 计数和智能模型路由来优化 Agent 系统的成本。

## 🎯 生活比喻
> 成本优化就像打车出行。短途用滴滴快车（便宜模型），长途用专车（贵但好用），紧急时才用豪华车（最贵）。Token 计数就是你的"计价器"，告诉你花了多少钱；模型路由就是"智能调度"，根据任务复杂度选择最合适的"车型"。

## 📋 今日三件事
1. 理解 Token 计数和成本计算
2. 实现智能模型路由策略
3. 设计成本监控和告警机制

## 🗺️ 手把手路线

### Step 1：Token 计数
- 做什么: 学习如何准确计算 Token 数量和成本
- 为什么: 这是成本优化的基础
- 成功标志: 能实现准确的 Token 计数器

### Step 2：模型路由
- 做什么: 学习根据任务复杂度选择模型
- 为什么: 不同任务需要不同级别的模型
- 成功标志: 能实现智能路由逻辑

### Step 3：成本监控
- 做什么: 设计成本监控和告警机制
- 为什么: 防止成本失控
- 成功标志: 能实现成本告警

### Step 4：代码实践
- 做什么: 实现完整的成本优化系统
- 为什么: 代码是最好的理解方式
- 成功标志: 代码跑通

## 💻 代码区

```python
"""
成本优化：Token 计数 + 模型路由
完整的成本管理系统
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from enum import Enum
import time
from datetime import datetime, timedelta
import json

# ========== 1. Token 计数器 ==========

@dataclass
class TokenUsage:
    """Token 使用量"""
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    
    @property
    def cost(self) -> float:
        """计算成本（需要设置单价）"""
        return self.total_tokens * 0.001  # 示例单价


@dataclass
class PricingTier:
    """定价层级"""
    provider: str
    model: str
    input_price_per_1k: float  # 每 1000 tokens 的输入价格
    output_price_per_1k: float  # 每 1000 tokens 的输出价格
    currency: str = "USD"


class TokenCounter:
    """Token 计数器"""
    
    def __init__(self):
        self.usage_history: List[Dict] = []
        self.pricing: Dict[str, PricingTier] = {}
        self.total_cost: float = 0.0
    
    def set_pricing(self, provider: str, model: str, input_price: float, output_price: float):
        """设置定价"""
        key = f"{provider}/{model}"
        self.pricing[key] = PricingTier(
            provider=provider,
            model=model,
            input_price_per_1k=input_price,
            output_price_per_1k=output_price
        )
    
    def count_tokens(self, text: str) -> int:
        """计算文本的 Token 数量（简化版）"""
        # 实际应用中使用 tiktoken 或其他分词器
        # 这里用空格分割作为近似
        return len(text.split())
    
    def record_usage(
        self,
        provider: str,
        model: str,
        prompt: str,
        response: str,
        metadata: Dict = None
    ) -> Dict:
        """记录使用量"""
        prompt_tokens = self.count_tokens(prompt)
        completion_tokens = self.count_tokens(response)
        total_tokens = prompt_tokens + completion_tokens
        
        # 计算成本
        key = f"{provider}/{model}"
        pricing = self.pricing.get(key)
        if pricing:
            cost = (
                prompt_tokens * pricing.input_price_per_1k / 1000 +
                completion_tokens * pricing.output_price_per_1k / 1000
            )
        else:
            cost = total_tokens * 0.001  # 默认价格
        
        usage = {
            "timestamp": datetime.now().isoformat(),
            "provider": provider,
            "model": model,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "cost": cost,
            "metadata": metadata or {}
        }
        
        self.usage_history.append(usage)
        self.total_cost += cost
        
        return usage
    
    def get_summary(self, period: timedelta = None) -> Dict:
        """获取使用摘要"""
        if period:
            cutoff = datetime.now() - period
            usage = [
                u for u in self.usage_history
                if datetime.fromisoformat(u["timestamp"]) > cutoff
            ]
        else:
            usage = self.usage_history
        
        if not usage:
            return {"total_cost": 0, "total_tokens": 0}
        
        total_tokens = sum(u["total_tokens"] for u in usage)
        total_cost = sum(u["cost"] for u in usage)
        
        by_provider = {}
        for u in usage:
            provider = u["provider"]
            if provider not in by_provider:
                by_provider[provider] = {"tokens": 0, "cost": 0, "calls": 0}
            by_provider[provider]["tokens"] += u["total_tokens"]
            by_provider[provider]["cost"] += u["cost"]
            by_provider[provider]["calls"] += 1
        
        return {
            "period": str(period) if period else "all",
            "total_calls": len(usage),
            "total_tokens": total_tokens,
            "total_cost": total_cost,
            "by_provider": by_provider
        }


# ========== 2. 任务复杂度评估 ==========

class TaskComplexity(Enum):
    """任务复杂度"""
    SIMPLE = "simple"      # 简单：直接回答
    MODERATE = "moderate"  # 中等：需要推理
    COMPLEX = "complex"    # 复杂：多步推理
    EXPERT = "expert"      # 专家：专业领域


class ComplexityEstimator:
    """任务复杂度评估器"""
    
    def __init__(self):
        self.keywords = {
            TaskComplexity.SIMPLE: ["什么是", "定义", "解释", "列出"],
            TaskComplexity.MODERATE: ["如何", "为什么", "分析", "比较"],
            TaskComplexity.COMPLEX: ["设计", "实现", "优化", "架构"],
            TaskComplexity.EXPERT: ["研究", "创新", "突破", "前沿"]
        }
    
    def estimate(self, task: str) -> TaskComplexity:
        """估算任务复杂度"""
        task_lower = task.lower()
        
        # 基于关键词匹配
        for complexity, keywords in self.keywords.items():
            if any(kw in task_lower for kw in keywords):
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


# ========== 3. 模型路由器 ==========

@dataclass
class ModelRoute:
    """模型路由配置"""
    complexity: TaskComplexity
    provider: str
    model: str
    max_tokens: int = 1000
    temperature: float = 0.7


class ModelRouter:
    """智能模型路由器"""
    
    def __init__(self):
        self.routes: List[ModelRoute] = []
        self.complexity_estimator = ComplexityEstimator()
        self.token_counter = TokenCounter()
        self.cost_limits: Dict[str, float] = {}
    
    def add_route(self, route: ModelRoute):
        """添加路由规则"""
        self.routes.append(route)
        # 按复杂度排序
        self.routes.sort(key=lambda r: list(TaskComplexity).index(r.complexity))
    
    def set_cost_limit(self, period: str, limit: float):
        """设置成本限制"""
        self.cost_limits[period] = limit
    
    def route(self, task: str) -> ModelRoute:
        """根据任务选择模型"""
        complexity = self.complexity_estimator.estimate(task)
        
        # 查找匹配的路由
        for route in self.routes:
            if route.complexity == complexity:
                return route
        
        # 默认返回最简单的模型
        return self.routes[0] if self.routes else None
    
    def check_cost_limit(self) -> Tuple[bool, str]:
        """检查是否超出成本限制"""
        for period, limit in self.cost_limits.items():
            if period == "hourly":
                summary = self.token_counter.get_summary(timedelta(hours=1))
            elif period == "daily":
                summary = self.token_counter.get_summary(timedelta(days=1))
            else:
                continue
            
            if summary["total_cost"] > limit:
                return False, f"{period} 成本限制超出: {summary['total_cost']:.4f} > {limit}"
        
        return True, "成本在限制内"
    
    def call_with_routing(self, task: str) -> Dict:
        """带路由的模型调用"""
        # 检查成本限制
        within_limit, message = self.check_cost_limit()
        if not within_limit:
            return {
                "success": False,
                "error": f"成本限制: {message}"
            }
        
        # 选择模型
        route = self.route(task)
        if not route:
            return {
                "success": False,
                "error": "无可用路由"
            }
        
        # 模拟调用
        start_time = time.time()
        response = f"来自 {route.provider}/{route.model} 的回答"
        latency = time.time() - start_time
        
        # 记录使用量
        usage = self.token_counter.record_usage(
            provider=route.provider,
            model=route.model,
            prompt=task,
            response=response,
            metadata={"complexity": route.complexity.value}
        )
        
        return {
            "success": True,
            "response": response,
            "provider": route.provider,
            "model": route.model,
            "complexity": route.complexity.value,
            "cost": usage["cost"],
            "latency": latency
        }


# ========== 4. 成本优化器 ==========

class CostOptimizer:
    """成本优化器"""
    
    def __init__(self, router: ModelRouter):
        self.router = router
        self.optimization_log: List[Dict] = []
    
    def analyze_usage(self) -> Dict:
        """分析使用模式"""
        summary = self.router.token_counter.get_summary()
        
        # 分析各提供商成本
        provider_costs = summary.get("by_provider", {})
        
        # 计算成本占比
        total_cost = summary["total_cost"]
        cost_distribution = {}
        for provider, stats in provider_costs.items():
            cost_distribution[provider] = {
                "cost": stats["cost"],
                "percentage": stats["cost"] / max(total_cost, 0.001) * 100,
                "calls": stats["calls"],
                "avg_cost_per_call": stats["cost"] / max(stats["calls"], 1)
            }
        
        return {
            "total_cost": total_cost,
            "total_calls": summary["total_calls"],
            "cost_distribution": cost_distribution,
            "recommendations": self._generate_recommendations(cost_distribution)
        }
    
    def _generate_recommendations(self, cost_distribution: Dict) -> List[str]:
        """生成优化建议"""
        recommendations = []
        
        # 检查是否有高成本提供商
        for provider, stats in cost_distribution.items():
            if stats["percentage"] > 60:
                recommendations.append(
                    f"{provider} 占成本 {stats['percentage']:.1f}%，考虑使用更便宜的替代方案"
                )
        
        # 检查平均成本
        total_calls = sum(s["calls"] for s in cost_distribution.values())
        total_cost = sum(s["cost"] for s in cost_distribution.values())
        avg_cost = total_cost / max(total_calls, 1)
        
        if avg_cost > 0.01:
            recommendations.append(
                f"平均每次调用成本 {avg_cost:.4f} 较高，考虑使用更小的模型"
            )
        
        return recommendations
    
    def suggest_optimization(self, task: str) -> Dict:
        """为特定任务建议优化方案"""
        # 当前路由
        current_route = self.router.route(task)
        
        # 分析是否可以使用更便宜的模型
        alternatives = []
        for route in self.router.routes:
            if route.complexity.value <= current_route.complexity.value:
                alternatives.append({
                    "provider": route.provider,
                    "model": route.model,
                    "complexity": route.complexity.value
                })
        
        return {
            "current_model": f"{current_route.provider}/{current_route.model}",
            "alternatives": alternatives,
            "potential_savings": "可以通过选择更小的模型节省成本"
        }


# ========== 5. 示例运行 ==========

def create_sample_router() -> ModelRouter:
    """创建示例路由器"""
    router = ModelRouter()
    
    # 添加路由规则
    router.add_route(ModelRoute(
        complexity=TaskComplexity.SIMPLE,
        provider="openai",
        model="gpt-3.5-turbo",
        max_tokens=500,
        temperature=0.5
    ))
    
    router.add_route(ModelRoute(
        complexity=TaskComplexity.MODERATE,
        provider="openai",
        model="gpt-4",
        max_tokens=1000,
        temperature=0.7
    ))
    
    router.add_route(ModelRoute(
        complexity=TaskComplexity.COMPLEX,
        provider="anthropic",
        model="claude-3-opus",
        max_tokens=2000,
        temperature=0.8
    ))
    
    router.add_route(ModelRoute(
        complexity=TaskComplexity.EXPERT,
        provider="anthropic",
        model="claude-3-opus",
        max_tokens=4000,
        temperature=0.9
    ))
    
    # 设置定价
    router.token_counter.set_pricing("openai", "gpt-3.5-turbo", 0.0015, 0.002)
    router.token_counter.set_pricing("openai", "gpt-4", 0.03, 0.06)
    router.token_counter.set_pricing("anthropic", "claude-3-opus", 0.015, 0.075)
    
    # 设置成本限制
    router.set_cost_limit("hourly", 10.0)
    router.set_cost_limit("daily", 100.0)
    
    return router


def main():
    """主函数"""
    print("=" * 60)
    print("成本优化：Token 计数 + 模型路由")
    print("=" * 60)
    
    # 1. 创建路由器
    router = create_sample_router()
    optimizer = CostOptimizer(router)
    
    # 2. 测试路由
    print("\n1. 任务路由测试:")
    print("-" * 40)
    
    tasks = [
        "什么是 Python？",
        "如何设计一个分布式系统？",
        "解释量子计算的原理",
        "研究最新的 AI 论文",
        "列出三个编程语言"
    ]
    
    for task in tasks:
        result = router.call_with_routing(task)
        print(f"\n  任务: {task[:30]}...")
        print(f"  路由到: {result['provider']}/{result['model']}")
        print(f"  复杂度: {result['complexity']}")
        print(f"  成本: ${result['cost']:.6f}")
    
    # 3. 成本分析
    print("\n2. 成本分析:")
    print("-" * 40)
    
    analysis = optimizer.analyze_usage()
    print(f"  总调用次数: {analysis['total_calls']}")
    print(f"  总成本: ${analysis['total_cost']:.4f}")
    
    print("\n  各提供商成本:")
    for provider, stats in analysis["cost_distribution"].items():
        print(f"    {provider}: ${stats['cost']:.4f} ({stats['percentage']:.1f}%)")
    
    # 4. 优化建议
    print("\n3. 优化建议:")
    print("-" * 40)
    for rec in analysis["recommendations"]:
        print(f"  - {rec}")
    
    # 5. 任务优化建议
    print("\n4. 任务优化建议:")
    print("-" * 40)
    suggestion = optimizer.suggest_optimization("什么是机器学习？")
    print(f"  当前模型: {suggestion['current_model']}")
    print(f"  可选替代: {len(suggestion['alternatives'])} 个")
    
    # 6. 架构图
    print("\n5. 成本优化架构:")
    print("-" * 40)
    print("""
    ┌─────────────────────────────────────────┐
    │           成本优化系统                    │
    │  ┌─────────────┐  ┌─────────────┐     │
    │  │ Token 计数器 │  │ 成本监控器  │     │
    │  └─────────────┘  └─────────────┘     │
    │                                          │
    │  ┌─────────────────────────────────┐   │
    │  │         智能路由器                │   │
    │  │  ┌─────────┐  ┌─────────┐     │   │
    │  │  │ 任务分析 │→│ 模型选择 │     │   │
    │  │  └─────────┘  └─────────┘     │   │
    │  └─────────────────────────────────┘   │
    │                                          │
    │  ┌─────────────────────────────────┐   │
    │  │       成本限制与告警              │   │
    │  └─────────────────────────────────┘   │
    └─────────────────────────────────────────┘
""")
    
    print("\n6. 成本优化策略:")
    print("-" * 40)
    print("  1. 根据任务复杂度选择模型")
    print("  2. 简单任务使用便宜模型")
    print("  3. 设置成本上限告警")
    print("  4. 监控使用模式")
    print("  5. 定期分析和优化")


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | Token 计数不准确 | 使用官方分词器，如 tiktoken |
| 2 | 成本超出预算 | 设置更严格的成本限制 |
| 3 | 路由不准确 | 优化复杂度评估算法 |
| 4 | 延迟太高 | 使用缓存，减少重复调用 |
| 5 | 无法分析使用模式 | 增加详细的日志记录 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Token | 模型处理文本的最小单位 |
| Token Counter | 计算 Token 数量和成本 |
| Model Router | 根据任务选择模型 |
| Task Complexity | 任务的复杂度级别 |
| Cost Limit | 成本上限限制 |
| Pricing Tier | 定价层级配置 |
| Usage Analytics | 使用量分析 |

## ✅ 验收清单
- [ ] 能实现 Token 计数器
- [ ] 能实现智能模型路由
- [ ] 能设置和检查成本限制
- [ ] 代码能跑通

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
