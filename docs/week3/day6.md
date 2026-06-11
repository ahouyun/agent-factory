# Day 6: LLM API 工程实践 - 流式调用 + Token 管理

## 今日学习目标

1. 掌握流式调用的实现方法
2. 学习 Token 计数和管理
3. 理解成本优化策略
4. 实现缓存机制
5. 掌握异步调用

---

## 第一部分：流式调用

### 什么是流式调用？

**类比理解：**
流式调用就像看直播：
- 边生成边返回，实时看到内容
- 不用等待完整响应
- 用户体验更好

### 对比

```
普通调用：
用户等待... → 服务器处理... → 返回完整响应
（等待时间长，用户体验差）

流式调用：
用户立即看到 → 服务器逐步返回 → 实时更新
（等待时间短，用户体验好）
```

---

## 第二部分：流式调用实现

### 文件：app/llm/streaming.py

```python
"""
流式调用实现
"""

import asyncio
from typing import AsyncGenerator, Generator, List, Optional
from dataclasses import dataclass
import time


@dataclass
class StreamChunk:
    """流式响应块"""
    content: str
    finish_reason: Optional[str] = None
    usage: Optional[dict] = None


class StreamingManager:
    """流式响应管理器"""
    
    def __init__(self):
        self.buffer: List[str] = []
        self.callbacks: List[callable] = []
    
    def add_callback(self, callback: callable):
        """添加回调函数"""
        self.callbacks.append(callback)
    
    async def process_stream(self, chunks: AsyncGenerator[StreamChunk, None]) -> str:
        """处理流式响应"""
        self.buffer.clear()
        
        async for chunk in chunks:
            self.buffer.append(chunk.content)
            
            # 触发回调
            for callback in self.callbacks:
                if asyncio.iscoroutinefunction(callback):
                    await callback(chunk)
                else:
                    callback(chunk)
            
            # 输出到控制台
            print(chunk.content, end="", flush=True)
        
        print()  # 换行
        
        # 返回完整响应
        return "".join(self.buffer)
    
    def get_full_response(self) -> str:
        """获取完整响应"""
        return "".join(self.buffer)
    
    def clear(self):
        """清空缓冲区"""
        self.buffer.clear()


# ==================== 模拟 LLM 流式响应 ====================

async def mock_openai_streaming(
    prompt: str, 
    model: str = "gpt-3.5-turbo"
) -> AsyncGenerator[StreamChunk, None]:
    """
    模拟 OpenAI 流式响应
    """
    # 模拟响应内容
    responses = {
        "你好": "你好！有什么我可以帮助你的吗？",
        "今天天气": "今天天气很好，适合外出活动。",
        "default": "这是一个模拟的流式响应。在实际应用中，这里会调用 OpenAI API。"
    }
    
    # 选择响应
    response = responses.get(prompt, responses["default"])
    
    # 模拟流式输出
    for char in response:
        yield StreamChunk(content=char)
        await asyncio.sleep(0.05)  # 模拟网络延迟
    
    # 结束标记
    yield StreamChunk(
        content="",
        finish_reason="stop",
        usage={
            "prompt_tokens": len(prompt),
            "completion_tokens": len(response),
            "total_tokens": len(prompt) + len(response)
        }
    )


async def mock_anthropic_streaming(
    prompt: str,
    model: str = "claude-3-sonnet"
) -> AsyncGenerator[StreamChunk, None]:
    """
    模拟 Anthropic 流式响应
    """
    response = "这是一个模拟的 Anthropic 流式响应。Claude 会以流式方式返回内容。"
    
    for char in response:
        yield StreamChunk(content=char)
        await asyncio.sleep(0.05)
    
    yield StreamChunk(
        content="",
        finish_reason="end_turn",
        usage={
            "input_tokens": len(prompt),
            "output_tokens": len(response)
        }
    )


# ==================== 使用示例 ====================

async def demo_streaming():
    """流式调用演示"""
    print("=== 流式调用演示 ===\n")
    
    # 创建管理器
    manager = StreamingManager()
    
    # 添加回调
    def log_callback(chunk: StreamChunk):
        if chunk.finish_reason:
            print(f"\n[完成] 原因: {chunk.finish_reason}")
            if chunk.usage:
                print(f"[统计] Token 使用: {chunk.usage}")
    
    manager.add_callback(log_callback)
    
    # 测试 OpenAI 风格
    print("OpenAI 风格:")
    await manager.process_stream(mock_openai_streaming("你好"))
    
    print()
    
    # 测试 Anthropic 风格
    print("Anthropic 风格:")
    await manager.process_stream(mock_anthropic_streaming("你好"))


if __name__ == "__main__":
    asyncio.run(demo_streaming())
```

---

## 第三部分：Token 管理

### 什么是 Token？

**类比理解：**
Token 就像单词：
- 英文：一个单词或子词是一个 token
- 中文：一个汉字或词组是一个 token
- Token 是计费单位

### Token 计数

### 文件：app/llm/token_manager.py

```python
"""
Token 管理和计数
"""

import re
from dataclasses import dataclass
from typing import List, Dict, Optional


@dataclass
class TokenUsage:
    """Token 使用情况"""
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    estimated_cost: float


class TokenCounter:
    """Token 计数器"""
    
    # 价格表（每1M tokens，美元）
    PRICING = {
        "gpt-4": {"input": 30.0, "output": 60.0},
        "gpt-4-turbo": {"input": 10.0, "output": 30.0},
        "gpt-3.5-turbo": {"input": 0.5, "output": 1.5},
        "claude-3-opus": {"input": 15.0, "output": 75.0},
        "claude-3-sonnet": {"input": 3.0, "output": 15.0},
        "claude-3-haiku": {"input": 0.25, "output": 1.25},
    }
    
    def __init__(self, model: str = "gpt-3.5-turbo"):
        self.model = model
    
    def estimate_tokens(self, text: str) -> int:
        """
        估算 Token 数量（简化版）
        
        实际应用中应使用 tiktoken 或模型的 tokenizer
        """
        # 简化估算：英文约4字符/token，中文约2字符/token
        chinese_chars = len(re.findall(r'[一-鿿]', text))
        other_chars = len(text) - chinese_chars
        
        estimated = chinese_chars / 2 + other_chars / 4
        return max(1, int(estimated))
    
    def calculate_cost(
        self,
        prompt_tokens: int,
        completion_tokens: int
    ) -> float:
        """计算成本"""
        if self.model not in self.PRICING:
            return 0.0
        
        pricing = self.PRICING[self.model]
        cost = (
            prompt_tokens * pricing["input"] / 1_000_000 +
            completion_tokens * pricing["output"] / 1_000_000
        )
        
        return cost
    
    def analyze_usage(self, text: str, is_prompt: bool = True) -> TokenUsage:
        """分析 Token 使用情况"""
        tokens = self.estimate_tokens(text)
        
        if is_prompt:
            prompt_tokens = tokens
            completion_tokens = 0
        else:
            prompt_tokens = 0
            completion_tokens = tokens
        
        cost = self.calculate_cost(prompt_tokens, completion_tokens)
        
        return TokenUsage(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
            estimated_cost=cost
        )


class ContextManager:
    """上下文管理器"""
    
    def __init__(self, max_tokens: int = 4096):
        self.max_tokens = max_tokens
        self.messages: List[Dict] = []
        self.system_prompt: Optional[str] = None
        self.token_counter = TokenCounter()
    
    def set_system_prompt(self, prompt: str):
        """设置系统提示"""
        self.system_prompt = prompt
    
    def add_message(self, role: str, content: str):
        """添加消息"""
        self.messages.append({"role": role, "content": content})
    
    def get_total_tokens(self) -> int:
        """获取总 Token 数"""
        total = 0
        if self.system_prompt:
            total += self.token_counter.estimate_tokens(self.system_prompt)
        
        for msg in self.messages:
            total += self.token_counter.estimate_tokens(msg["content"])
        
        return total
    
    def trim_to_fit(self) -> List[Dict]:
        """裁剪消息以适应上下文窗口"""
        available_tokens = self.max_tokens - 1000  # 留出生成空间
        
        # 保留系统提示
        if self.system_prompt:
            available_tokens -= self.token_counter.estimate_tokens(self.system_prompt)
        
        # 从最新消息开始保留
        trimmed_messages = []
        current_tokens = 0
        
        for msg in reversed(self.messages):
            msg_tokens = self.token_counter.estimate_tokens(msg["content"])
            if current_tokens + msg_tokens <= available_tokens:
                trimmed_messages.insert(0, msg)
                current_tokens += msg_tokens
            else:
                break
        
        return trimmed_messages
    
    def get_context_window(self) -> List[Dict]:
        """获取上下文窗口"""
        result = []
        
        if self.system_prompt:
            result.append({"role": "system", "content": self.system_prompt})
        
        result.extend(self.trim_to_fit())
        
        return result


# 使用示例
if __name__ == "__main__":
    print("=== Token 管理示例 ===\n")
    
    # Token 计数
    counter = TokenCounter("gpt-4")
    
    texts = [
        "Hello, how are you?",
        "你好，今天天气怎么样？",
        "人工智能技术正在快速发展，已经应用到各个领域。从医疗到教育，从金融到制造，AI都在发挥着重要作用。"
    ]
    
    for text in texts:
        usage = counter.analyze_usage(text)
        print(f"文本: {text[:30]}...")
        print(f"  估算 Token: {usage.prompt_tokens}")
        print(f"  预估成本: ${usage.estimated_cost:.6f}")
        print()
    
    # 上下文管理
    print("\n=== 上下文管理 ===\n")
    
    ctx = ContextManager(max_tokens=1000)
    ctx.set_system_prompt("你是一个有帮助的助手。")
    
    # 添加多轮对话
    for i in range(10):
        ctx.add_message("user", f"这是第{i+1}个问题")
        ctx.add_message("assistant", f"这是第{i+1}个回答，包含一些详细解释。")
    
    print(f"总消息数: {len(ctx.messages)}")
    print(f"总 Token 数: {ctx.get_total_tokens()}")
    print(f"裁剪后消息数: {len(ctx.trim_to_fit())}")
```

---

## 第四部分：成本优化

### 文件：app/llm/cost_optimizer.py

```python
"""
成本优化策略
"""

import hashlib
import json
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import asyncio


@dataclass
class CacheEntry:
    """缓存条目"""
    key: str
    value: dict
    created_at: datetime
    ttl: int  # 生存时间（秒）
    
    def is_expired(self) -> bool:
        """检查是否过期"""
        return datetime.now() - self.created_at > timedelta(seconds=self.ttl)


class CostOptimizer:
    """成本优化器"""
    
    def __init__(self, budget: float = 10.0):
        self.budget = budget
        self.spent = 0.0
        self.call_count = 0
        self.cache: Dict[str, CacheEntry] = {}
    
    def record_call(self, cost: float):
        """记录 API 调用成本"""
        self.spent += cost
        self.call_count += 1
    
    def can_afford(self, estimated_cost: float) -> bool:
        """检查是否能负担"""
        return self.spent + estimated_cost <= self.budget
    
    def get_remaining_budget(self) -> float:
        """获取剩余预算"""
        return self.budget - self.spent
    
    def get_stats(self) -> dict:
        """获取统计信息"""
        return {
            "budget": self.budget,
            "spent": self.spent,
            "remaining": self.get_remaining_budget(),
            "call_count": self.call_count,
            "avg_cost_per_call": self.spent / self.call_count if self.call_count > 0 else 0
        }
    
    def get_cache_key(self, messages: list, model: str) -> str:
        """生成缓存键"""
        content = json.dumps(messages, sort_keys=True) + model
        return hashlib.md5(content.encode()).hexdigest()
    
    def get_from_cache(self, key: str) -> Optional[dict]:
        """从缓存获取"""
        if key in self.cache:
            entry = self.cache[key]
            if not entry.is_expired():
                return entry.value
            else:
                del self.cache[key]
        return None
    
    def set_cache(self, key: str, value: dict, ttl: int = 3600):
        """设置缓存"""
        self.cache[key] = CacheEntry(
            key=key,
            value=value,
            created_at=datetime.now(),
            ttl=ttl
        )
    
    def clear_expired_cache(self):
        """清理过期缓存"""
        expired_keys = [
            key for key, entry in self.cache.items()
            if entry.is_expired()
        ]
        for key in expired_keys:
            del self.cache[key]


class SmartLLMClient:
    """智能 LLM 客户端"""
    
    def __init__(self, budget: float = 10.0):
        self.optimizer = CostOptimizer(budget)
    
    async def chat(
        self,
        messages: list,
        model: str = "gpt-3.5-turbo",
        use_cache: bool = True,
        max_tokens: int = 1000
    ) -> dict:
        """智能聊天"""
        # 检查缓存
        if use_cache:
            cache_key = self.optimizer.get_cache_key(messages, model)
            cached = self.optimizer.get_from_cache(cache_key)
            if cached:
                print("[缓存命中]")
                return cached
        
        # 估算成本
        from app.llm.token_manager import TokenCounter
        counter = TokenCounter(model)
        prompt_tokens = sum(
            counter.estimate_tokens(msg["content"])
            for msg in messages
        )
        estimated_cost = counter.calculate_cost(prompt_tokens, max_tokens)
        
        # 检查预算
        if not self.optimizer.can_afford(estimated_cost):
            # 降级到更便宜的模型
            model = "gpt-3.5-turbo"
            print(f"[预算不足，降级到 {model}]")
        
        # 调用 API（模拟）
        response = {
            "content": "模拟响应",
            "usage": {
                "prompt_tokens": prompt_tokens,
                "completion_tokens": 100
            }
        }
        
        # 记录成本
        actual_cost = counter.calculate_cost(
            prompt_tokens,
            response["usage"]["completion_tokens"]
        )
        self.optimizer.record_call(actual_cost)
        
        # 缓存响应
        if use_cache:
            cache_key = self.optimizer.get_cache_key(messages, model)
            self.optimizer.set_cache(cache_key, response)
        
        return response


# 使用示例
if __name__ == "__main__":
    print("=== 成本优化示例 ===\n")
    
    client = SmartLLMClient(budget=1.0)
    
    # 模拟多次调用
    messages = [{"role": "user", "content": "你好"}]
    
    for i in range(5):
        response = client.chat(messages)
        stats = client.optimizer.get_stats()
        print(f"调用 {i+1}: 剩余预算 ${stats['remaining']:.4f}")
    
    print(f"\n最终统计: {stats}")
    
    # 成本优化策略
    print("\n=== 成本优化策略 ===\n")
    strategies = """
LLM API 成本优化策略
===================

1. 模型选择策略
   - 简单任务使用小模型（GPT-3.5, Claude Haiku）
   - 复杂任务使用大模型（GPT-4, Claude Opus）
   - 根据任务复杂度动态选择

2. 缓存策略
   - 缓存相同输入的响应
   - 使用语义相似度匹配
   - 设置合理的缓存过期时间

3. 提示优化
   - 精简提示长度
   - 避免冗余信息
   - 使用 Few-shot 而非长提示

4. 上下文管理
   - 限制上下文长度
   - 只保留相关信息
   - 定期清理旧消息

5. 批处理
   - 合并多个请求
   - 使用批量 API
   - 减少请求次数

6. 流式调用
   - 及时停止生成
   - 避免生成过长内容
   - 使用 max_tokens 限制

7. 异步处理
   - 并发处理多个请求
   - 使用队列管理请求
   - 避免重复调用

8. 监控和告警
   - 实时监控成本
   - 设置预算告警
   - 分析成本趋势
"""
    print(strategies)
```

---

## 第五部分：异步调用

### 文件：app/llm/async_client.py

```python
"""
异步 LLM 客户端
"""

import asyncio
from typing import List, Dict, Optional
from dataclasses import dataclass
import time


@dataclass
class LLMResponse:
    """LLM 响应"""
    content: str
    model: str
    usage: Dict[str, int]
    latency: float


class AsyncLLMClient:
    """异步 LLM 客户端"""
    
    def __init__(self, max_concurrent: int = 5):
        self.max_concurrent = max_concurrent
        self.semaphore = asyncio.Semaphore(max_concurrent)
    
    async def single_call(
        self, 
        messages: List[Dict], 
        model: str = "gpt-3.5-turbo"
    ) -> LLMResponse:
        """单次调用"""
        async with self.semaphore:
            start_time = time.time()
            
            # 模拟 API 调用
            await asyncio.sleep(0.1)
            
            # 模拟响应
            response = LLMResponse(
                content="模拟响应内容",
                model=model,
                usage={"prompt_tokens": 100, "completion_tokens": 50},
                latency=time.time() - start_time
            )
            
            return response
    
    async def batch_call(
        self, 
        requests: List[Dict],
        model: str = "gpt-3.5-turbo"
    ) -> List[LLMResponse]:
        """批量调用"""
        tasks = [
            self.single_call(req["messages"], model)
            for req in requests
        ]
        
        responses = await asyncio.gather(*tasks)
        return responses
    
    async def parallel_different_models(
        self, 
        messages: List[Dict],
        models: List[str]
    ) -> Dict[str, LLMResponse]:
        """并行调用不同模型"""
        tasks = {
            model: self.single_call(messages, model)
            for model in models
        }
        
        results = {}
        for model, task in tasks.items():
            results[model] = await task
        
        return results


# 使用示例
async def demo_async_client():
    """异步客户端演示"""
    print("=== 异步 LLM 客户端演示 ===\n")
    
    client = AsyncLLMClient(max_concurrent=3)
    
    # 单次调用
    print("单次调用:")
    response = await client.single_call([{"role": "user", "content": "你好"}])
    print(f"  延迟: {response.latency:.3f}s")
    print(f"  内容: {response.content}")
    
    # 批量调用
    print("\n批量调用 (5个请求):")
    requests = [
        {"messages": [{"role": "user", "content": f"问题{i}"}]}
        for i in range(5)
    ]
    
    start_time = time.time()
    responses = await client.batch_call(requests)
    total_time = time.time() - start_time
    
    print(f"  总时间: {total_time:.3f}s")
    print(f"  平均延迟: {sum(r.latency for r in responses) / len(responses):.3f}s")
    
    # 并行不同模型
    print("\n并行不同模型:")
    messages = [{"role": "user", "content": "你好"}]
    models = ["gpt-3.5-turbo", "gpt-4", "claude-3-sonnet"]
    
    results = await client.parallel_different_models(messages, models)
    for model, response in results.items():
        print(f"  {model}: {response.latency:.3f}s")


if __name__ == "__main__":
    asyncio.run(demo_async_client())
```

---

## 验证清单

完成今日学习后，检查以下项目：

- [ ] 理解流式调用的原理
- [ ] 能实现流式输出
- [ ] 理解 Token 计数方法
- [ ] 能管理上下文窗口
- [ ] 掌握成本优化策略
- [ ] 实现了缓存机制
- [ ] 理解异步调用

---

## 今日小结

| 概念 | 关键点 |
|------|--------|
| 流式调用 | 边生成边返回，用户体验好 |
| Token | 模型处理文本的基本单位 |
| 上下文窗口 | 模型能处理的最大文本长度 |
| 缓存 | 存储之前的响应以重用 |
| 成本优化 | 降低 API 调用费用的策略 |
| 预算控制 | 限制总支出的方法 |
| 异步调用 | 并发处理多个请求 |

---

## 明日预告

明天我们将学习：
- Week 3 复盘
- 学习效果评估
- 知识点掌握度分析
- Week 4 计划

---

## 参考资源

- [OpenAI API 文档](https://platform.openai.com/docs/)
- [Anthropic API 文档](https://docs.anthropic.com/)
- [Token 计数工具](https://platform.openai.com/tokenizer)
