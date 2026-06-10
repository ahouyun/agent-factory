# 📅 Week 3 Day 6：LLM API 工程实践：流式调用 + Token 管理

## 🧭 今日方向
> 今天我们将学习 LLM API 的工程实践，包括流式调用、Token 管理和成本优化。

## 🎯 生享比喻
> 流式调用就像看直播，实时看到内容生成；Token 管理就像预算管理，确保不超支。

## 📋 今日三件事
1. 掌握流式调用的实现方法
2. 学习 Token 计数和管理
3. 实践成本优化策略

## 🗺️ 手把手路线

### Step 1: 流式调用
- **做什么**: 学习使用流式响应提高用户体验
- **为什么**: 流式调用能让用户更快看到结果
- **成功标志**: 能实现流式输出

### Step 2: Token 管理
- **做什么**: 学习 Token 计数和上下文管理
- **为什么**: Token 是计费单位，需要精确管理
- **成功标志**: 能计算和控制 Token 使用

### Step 3: 成本优化
- **做什么**: 学习降低 API 调用成本的策略
- **为什么**: 成本控制很重要
- **成功标志**: 能应用成本优化技巧

## 💻 代码区

```python
# 流式调用实现

import asyncio
from typing import AsyncGenerator, Generator
from dataclasses import dataclass
import time

@dataclass
class StreamChunk:
    """流式响应块"""
    content: str
    finish_reason: str = None
    usage: dict = None

# 1. OpenAI 流式调用
async def openai_streaming_example():
    """OpenAI 流式调用示例"""
    print("=== OpenAI 流式调用 ===\n")
    
    # 模拟流式响应
    chunks = [
        StreamChunk(content="你好"),
        StreamChunk(content="，我"),
        StreamChunk(content="是"),
        StreamChunk(content="AI"),
        StreamChunk(content="助手"),
        StreamChunk(content="。", finish_reason="stop", 
                   usage={"prompt_tokens": 10, "completion_tokens": 5})
    ]
    
    print("响应: ", end="", flush=True)
    for chunk in chunks:
        print(chunk.content, end="", flush=True)
        await asyncio.sleep(0.1)  # 模拟延迟
    print("\n")
    
    if chunks[-1].usage:
        print(f"Token 使用: {chunks[-1].usage}")

# 2. Anthropic 流式调用
async def anthropic_streaming_example():
    """Anthropic 流式调用示例"""
    print("\n=== Anthropic 流式调用 ===\n")
    
    # 模拟 Anthropic 事件流
    events = [
        {"type": "message_start", "data": {}},
        {"type": "content_block_start", "data": {"index": 0}},
        {"type": "content_block_delta", "data": {"delta": {"text": "你好"}}},
        {"type": "content_block_delta", "data": {"delta": {"text": "，我是Claude"}}},
        {"type": "content_block_stop", "data": {"index": 0}},
        {"type": "message_delta", "data": {"stop_reason": "end_turn"}},
        {"type": "message_stop", "data": {}}
    ]
    
    print("响应: ", end="", flush=True)
    for event in events:
        if event["type"] == "content_block_delta":
            text = event["data"]["delta"]["text"]
            print(text, end="", flush=True)
        await asyncio.sleep(0.1)
    print("\n")

# 3. 自定义流式管理器
class StreamingManager:
    """流式响应管理器"""
    
    def __init__(self):
        self.buffer = []
        self.callbacks = []
    
    def add_callback(self, callback):
        """添加回调函数"""
        self.callbacks.append(callback)
    
    async def process_stream(self, chunks: AsyncGenerator[StreamChunk, None]):
        """处理流式响应"""
        async for chunk in chunks:
            self.buffer.append(chunk.content)
            
            # 触发回调
            for callback in self.callbacks:
                await callback(chunk)
            
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

async def demo_streaming_manager():
    """流式管理器演示"""
    print("\n=== 流式管理器演示 ===\n")
    
    # 创建管理器
    manager = StreamingManager()
    
    # 添加回调
    async def log_callback(chunk: StreamChunk):
        print(f"[日志] 收到块: {chunk.content}")
    
    manager.add_callback(log_callback)
    
    # 模拟流式响应
    async def mock_stream():
        chunks = ["你好", "，", "世界", "！"]
        for chunk in chunks:
            yield StreamChunk(content=chunk)
            await asyncio.sleep(0.1)
    
    # 处理流
    response = await manager.process_stream(mock_stream())
    print(f"\n完整响应: {response}")

# 运行示例
if __name__ == "__main__":
    asyncio.run(openai_streaming_example())
    asyncio.run(anthropic_streaming_example())
    asyncio.run(demo_streaming_manager())
```

```python
# Token 管理和计数

from dataclasses import dataclass
from typing import List, Dict, Optional
import re

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
    
    def analyze_usage(self, text: str) -> TokenUsage:
        """分析 Token 使用情况"""
        tokens = self.estimate_tokens(text)
        cost = self.calculate_cost(tokens, 0)
        
        return TokenUsage(
            prompt_tokens=tokens,
            completion_tokens=0,
            total_tokens=tokens,
            estimated_cost=cost
        )

class ContextManager:
    """上下文管理器"""
    
    def __init__(self, max_tokens: int = 4096):
        self.max_tokens = max_tokens
        self.messages: List[Dict] = []
        self.system_prompt: Optional[str] = None
    
    def set_system_prompt(self, prompt: str):
        """设置系统提示"""
        self.system_prompt = prompt
    
    def add_message(self, role: str, content: str):
        """添加消息"""
        self.messages.append({"role": role, "content": content})
    
    def get_total_tokens(self) -> int:
        """获取总 Token 数"""
        counter = TokenCounter()
        
        total = 0
        if self.system_prompt:
            total += counter.estimate_tokens(self.system_prompt)
        
        for msg in self.messages:
            total += counter.estimate_tokens(msg["content"])
        
        return total
    
    def trim_to_fit(self) -> List[Dict]:
        """裁剪消息以适应上下文窗口"""
        counter = TokenCounter()
        available_tokens = self.max_tokens - 1000  # 留出生成空间
        
        # 保留系统提示
        if self.system_prompt:
            available_tokens -= counter.estimate_tokens(self.system_prompt)
        
        # 从最新消息开始保留
        trimmed_messages = []
        current_tokens = 0
        
        for msg in reversed(self.messages):
            msg_tokens = counter.estimate_tokens(msg["content"])
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
        "这是一个很长的文本..." * 100
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

```python
# 成本优化策略

class CostOptimizer:
    """成本优化器"""
    
    def __init__(self, budget: float = 10.0):
        self.budget = budget
        self.spent = 0.0
        self.call_count = 0
    
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

# 成本优化策略
COST_OPTIMIZATION_STRATEGIES = """
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

print(COST_OPTIMIZATION_STRATEGIES)

# 优化示例
class SmartLLMClient:
    """智能 LLM 客户端"""
    
    def __init__(self, budget: float = 10.0):
        self.optimizer = CostOptimizer(budget)
        self.cache = {}
    
    def get_cache_key(self, messages: list, model: str) -> str:
        """生成缓存键"""
        import hashlib
        import json
        
        content = json.dumps(messages, sort_keys=True) + model
        return hashlib.md5(content.encode()).hexdigest()
    
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
            cache_key = self.get_cache_key(messages, model)
            if cache_key in self.cache:
                print("[缓存命中]")
                return self.cache[cache_key]
        
        # 估算成本
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
            cache_key = self.get_cache_key(messages, model)
            self.cache[cache_key] = response
        
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
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 流式输出卡顿 | 检查网络连接，调整 chunk 大小 |
| 2 | Token 超限 | 裁剪上下文，减少历史消息 |
| 3 | 成本超预算 | 使用缓存，降级模型 |
| 4 | 响应延迟高 | 使用异步调用，批量处理 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| 流式调用 | 边生成边返回的响应方式 |
| Token | 模型处理文本的基本单位 |
| 上下文窗口 | 模型能处理的最大文本长度 |
| 缓存 | 存储之前的响应以重用 |
| 成本优化 | 降低 API 调用费用的策略 |
| 预算控制 | 限制总支出的方法 |

## ✅ 验收清单
- [ ] 能实现流式调用
- [ ] 理解 Token 计数方法
- [ ] 能管理上下文窗口
- [ ] 掌握成本优化策略

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
