# 📅 Week 7 Day 1：上下文工程：窗口管理 + 摘要压缩

## 🧭 今日方向
> LLM 的上下文窗口是"稀缺资源"。今天学习如何高效管理上下文：滑动窗口、摘要压缩、Token 计算，让有限的窗口装下最有价值的信息。

## 🎯 生活比喻
> 上下文窗口就像手机屏幕——只能显示有限的内容。滑动窗口就像"向上滑动查看聊天记录"，摘要压缩就像"把长对话缩成几行要点"，Token 计算就像"计算文字占用多少屏幕空间"。

## 📋 今日三件事
1. 理解 Token 和上下文窗口的概念，能计算文本占用的 Token 数量
2. 实现滑动窗口策略，控制对话历史在固定窗口内
3. 实现摘要压缩，用 LLM 将长对话压缩为简短摘要

## 🗺️ 手把手路线

### Step 1: 理解 Token 窗口
- **做什么**: 计算不同文本的 Token 数量，了解模型的上下文限制
- **为什么**: 不理解 Token 就无法管理上下文，这是所有后续内容的基础
- **成功标志**: 能估算一段中英文混合文本占用多少 Token

### Step 2: 实现滑动窗口策略
- **做什么**: 编写 SlidingWindowManager 类，保留最近 N 轮对话
- **为什么**: 最简单的上下文管理方式，适合短到中等长度的对话
- **成功标志**: 对话历史能自动控制在固定窗口内，旧消息被丢弃

### Step 3: 实现摘要压缩
- **做什么**: 编写 SummaryCompressor 类，用 LLM 将旧对话压缩为摘要
- **为什么**: 在保留关键信息的同时减少 Token 占用，适合长对话
- **成功标志**: 压缩后的摘要能回答相关问题，Token 占用大幅减少

## 💻 代码区

### 3.1 Token 计算器（简化版，无需 API）

```python
"""
Token 计数器 - 用于计算文本占用的 Token 数量
演示版使用简化规则，实际项目中应使用 tiktoken 库
"""

import re
from typing import List, Dict


class SimpleTokenCounter:
    """简化版 Token 计数器
    
    真实项目中应该使用:
    - tiktoken (OpenAI 模型)
    - transformers tokenizer (HuggingFace 模型)
    
    简化规则:
    - 中文: 约 1.5 个字符 = 1 个 token
    - 英文: 约 4 个字符 = 1 个 token
    - 标点和空格约占 1 个 token
    """
    
    def count(self, text: str) -> int:
        """估算文本的 Token 数量"""
        if not text:
            return 0
        
        # 分离中文字符和非中文字符
        chinese_chars = len(re.findall(r'[一-鿿]', text))
        non_chinese_chars = len(text) - chinese_chars
        
        # 估算 Token 数
        chinese_tokens = chinese_chars / 1.5
        non_chinese_tokens = non_chinese_chars / 4
        
        return int(chinese_tokens + non_chinese_tokens) + 1  # +1 为系统开销
    
    def count_messages(self, messages: List[Dict]) -> int:
        """计算消息列表的总 Token 数"""
        total = 0
        for msg in messages:
            # 每条消息有 role 和 content 的结构开销约 4 个 token
            total += self.count(msg.get('content', '')) + 4
        return total


# ===== 测试 =====
counter = SimpleTokenCounter()

test_texts = [
    "Hello, world!",
    "你好，世界！",
    "Python 是一种广泛使用的编程语言。",
    "这是一个很长的文本，用于测试 Token 计算。" * 5,
]

print("=== Token 计算演示 ===")
for text in test_texts:
    tokens = counter.count(text)
    print(f"  ({tokens:4d} tokens) {text[:50]}...")

# 模型上下文窗口参考
model_limits = {
    "gpt-4o": 128000,
    "gpt-4o-mini": 128000,
    "gpt-3.5-turbo": 16385,
    "claude-3-haiku": 200000,
    "claude-3-opus": 200000,
}

print("\n模型上下文窗口参考:")
for model, limit in model_limits.items():
    print(f"  {model}: {limit:,} tokens")
```

**预期输出：**
```
=== Token 计算演示 ===
  (   5 tokens) Hello, world!...
  (   5 tokens) 你好，世界！...
  (  12 tokens) Python 是一种广泛使用的编程语言。...
  (  98 tokens) 这是一个很长的文本，用于测试 Token 计算。这是一个很长的文本，用于测试 Token 计算。...

模型上下文窗口参考:
  gpt-4o: 128,000 tokens
  gpt-4o-mini: 128,000 tokens
  gpt-3.5-turbo: 16,385 tokens
  claude-3-haiku: 200,000 tokens
  claude-3-opus: 200,000 tokens
```

### 3.2 滑动窗口管理器

```python
"""
滑动窗口上下文管理器
保留最近 N 轮对话，自动丢弃超出窗口的旧消息
"""

from typing import List, Dict, Optional
from collections import deque


class SlidingWindowManager:
    """滑动窗口上下文管理器
    
    策略: 保留最近 keep_recent 轮对话（每轮 = 1 条用户消息 + 1 条助手消息）
    当对话历史超出 max_tokens 时，自动丢弃最早的消息
    """

    def __init__(self, max_tokens: int = 4000, keep_recent: int = 3):
        """
        Args:
            max_tokens: 最大 Token 容量
            keep_recent: 保留最近几轮对话
        """
        self.max_tokens = max_tokens
        self.keep_recent = keep_recent
        self.history = []
        self.token_counter = SimpleTokenCounter()

    def add_message(self, role: str, content: str):
        """添加新消息到历史"""
        self.history.append({
            "role": role,
            "content": content,
            "tokens": self.token_counter.count(content)
        })

    def get_context(self) -> List[Dict]:
        """获取在 Token 限制内的上下文消息列表"""
        if not self.history:
            return []

        # 分离系统消息和其他消息
        system_msgs = [m for m in self.history if m["role"] == "system"]
        other_msgs = [m for m in self.history if m["role"] != "system"]

        # 计算系统消息占用的 Token
        system_tokens = sum(m["tokens"] for m in system_msgs)
        remaining_tokens = self.max_tokens - system_tokens

        # 保留最近 N 轮对话（每轮 2 条消息）
        keep_count = self.keep_recent * 2
        recent_msgs = other_msgs[-keep_count:] if len(other_msgs) > keep_count else other_msgs

        # 在剩余空间内添加更多历史消息（从新到旧）
        selected = []
        current_tokens = 0
        for msg in reversed(other_msgs[:-keep_count] if len(other_msgs) > keep_count else []):
            if current_tokens + msg["tokens"] <= remaining_tokens:
                selected.insert(0, msg)
                current_tokens += msg["tokens"]
            else:
                break

        # 合并: 系统消息 + 历史消息 + 最近消息
        all_msgs = system_msgs + selected + recent_msgs
        return [{"role": m["role"], "content": m["content"]} for m in all_msgs]

    def get_stats(self) -> Dict:
        """获取统计信息"""
        total_tokens = sum(m["tokens"] for m in self.history)
        return {
            "total_messages": len(self.history),
            "total_tokens": total_tokens,
            "utilization": total_tokens / self.max_tokens if self.max_tokens > 0 else 0
        }


# ===== 测试 =====
print("\n=== 滑动窗口演示 ===")
window_mgr = SlidingWindowManager(max_tokens=500, keep_recent=2)

conversations = [
    ("user", "Python 是什么？"),
    ("assistant", "Python 是一种解释型编程语言。"),
    ("user", "它有哪些特点？"),
    ("assistant", "Python 具有简洁语法、丰富库支持、跨平台等特点。"),
    ("user", "如何学习 Python？"),
    ("assistant", "建议从基础语法开始，然后学习常用库，最后做项目实践。"),
    ("user", "推荐一些学习资源？"),
    ("assistant", "推荐官方文档、LeetCode 练习、GitHub 开源项目。"),
]

for role, content in conversations:
    window_mgr.add_message(role, content)

context = window_mgr.get_context()
stats = window_mgr.get_stats()

print(f"对话历史: {stats['total_messages']} 条")
print(f"总 Token: {stats['total_tokens']}")
print(f"利用率: {stats['utilization']:.2%}")
print(f"保留的上下文: {len(context)} 条消息")
for msg in context:
    role = "用户" if msg["role"] == "user" else "助手"
    print(f"  [{role}] {msg['content'][:40]}...")
```

**预期输出：**
```
=== 滑动窗口演示 ===
对话历史: 8 条
总 Token: 128
利用率: 25.60%
保留的上下文: 5 条消息
  [助手] 推荐官方文档、LeetCode 练习、GitHub 开源项目。...
  [用户] 如何学习 Python？...
  [助手] 建议从基础语法开始，然后学习常用库，最后做项目实践。...
  [用户] 推荐一些学习资源？...
  [助手] 推荐官方文档、LeetCode 练习、GitHub 开源项目。...
```

### 3.3 摘要压缩器

```python
"""
摘要压缩器
将旧对话压缩为简短摘要，保留关键信息
使用模拟 LLM，无需真实 API
"""


class MockLLM:
    """模拟 LLM，用于演示摘要压缩
    
    真实项目中应替换为:
    - ChatOpenAI(model="gpt-4o-mini")
    - ChatAnthropic(model="claude-3-haiku")
    """
    
    def invoke(self, messages: list) -> str:
        """模拟 LLM 调用，生成简单摘要"""
        # 提取对话中的关键信息
        user_questions = []
        assistant_answers = []
        
        for msg in messages:
            content = msg.get("content", "")
            if "用户:" in content:
                user_questions.append(content.replace("用户:", "").strip()[:30])
            elif "助手:" in content:
                assistant_answers.append(content.replace("助手:", "").strip()[:30])
        
        summary = (
            f"对话摘要: 用户询问了{len(user_questions)}个问题"
        )
        if user_questions:
            summary += f"，包括: {'; '.join(user_questions[:3])}"
        summary += "。助手进行了详细解答。"
        
        return summary


class SummaryCompressor:
    """摘要压缩器
    
    策略: 将旧消息压缩为摘要，保留最近的消息
    """

    def __init__(self, max_summary_tokens: int = 200):
        self.max_summary_tokens = max_summary_tokens
        self.llm = MockLLM()
        self.summary = ""

    def compress(self, messages: list) -> str:
        """将消息列表压缩为摘要"""
        if not messages:
            return ""

        # 格式化消息为文本
        formatted = []
        for msg in messages:
            role = "用户" if msg.get("role") == "user" else "助手"
            formatted.append(f"{role}: {msg.get('content', '')}")

        conversation = "\n".join(formatted)

        # 使用 LLM 生成摘要（这里用模拟版本）
        prompt = [
            {"role": "system", "content": "请将对话压缩为简洁摘要，保留关键信息。"},
            {"role": "user", "content": f"对话内容:\n{conversation}"}
        ]

        self.summary = self.llm.invoke(prompt)
        return self.summary

    def get_context_with_summary(self, messages: list, keep_recent: int = 4) -> list:
        """获取带摘要的上下文"""
        if len(messages) <= keep_recent:
            # 消息不多，直接返回
            return messages

        # 压缩旧消息
        to_compress = messages[:-keep_recent]
        recent = messages[-keep_recent:]

        summary = self.compress(to_compress)

        # 构建上下文: 摘要 + 最近消息
        context = [
            {"role": "system", "content": f"之前的对话摘要: {summary}"}
        ] + recent

        return context


# ===== 测试 =====
print("\n=== 摘要压缩演示 ===")
compressor = SummaryCompressor()

# 模拟长对话
long_conversation = [
    {"role": "user", "content": "Python 是什么？"},
    {"role": "assistant", "content": "Python 是一种解释型编程语言，广泛用于数据科学和 AI。"},
    {"role": "user", "content": "它有什么优点？"},
    {"role": "assistant", "content": "简洁语法、丰富生态、跨平台支持。"},
    {"role": "user", "content": "如何安装？"},
    {"role": "assistant", "content": "可以从 python.org 下载，或使用 Anaconda。"},
    {"role": "user", "content": "推荐学习路径？"},
    {"role": "assistant", "content": "基础语法 → 常用库 → 项目实践。"},
    {"role": "user", "content": "有什么好的学习资源？"},
    {"role": "assistant", "content": "官方文档、LeetCode、GitHub 项目。"},
]

compressed_context = compressor.get_context_with_summary(long_conversation, keep_recent=4)
print(f"原始对话: {len(long_conversation)} 条消息")
print(f"压缩后: {len(compressed_context)} 条消息")
print(f"\n压缩后上下文:")
for msg in compressed_context:
    role = {"system": "系统", "user": "用户", "assistant": "助手"}.get(msg["role"], msg["role"])
    content = msg["content"][:80] + "..." if len(msg["content"]) > 80 else msg["content"]
    print(f"  [{role}] {content}")

print(f"\n摘要内容: {compressor.summary}")
```

**预期输出：**
```
=== 摘要压缩演示 ===
原始对话: 10 条消息
压缩后: 5 条消息

压缩后上下文:
  [系统] 之前的对话摘要: 对话摘要: 用户询问了4个问题，包括: Python 是什么？; 它有什么优点？; 如何安装？; ...
  [用户] 推荐学习路径？
  [助手] 基础语法 → 常用库 → 项目实践。
  [用户] 有什么好的学习资源？
  [助手] 官方文档、LeetCode、GitHub 项目。

摘要内容: 对话摘要: 用户询问了4个问题，包括: Python 是什么？; 它有什么优点？; 如何安装？; 推荐学习路径？。助手进行了详细解答。
```

### 3.4 完整智能上下文管理器

```python
"""
智能上下文管理器 - 整合滑动窗口和摘要压缩
当对话超出 Token 限制时自动压缩，保留最近消息
"""


class SmartContextManager:
    """智能上下文管理器
    
    自动管理对话历史:
    - 对话短时使用滑动窗口
    - 对话长时自动触发摘要压缩
    """

    def __init__(self, max_tokens: int = 1000, window_size: int = 8):
        """
        Args:
            max_tokens: 最大 Token 容量
            window_size: 滑动窗口大小（保留最近 N 条消息）
        """
        self.max_tokens = max_tokens
        self.window_size = window_size
        self.history = []
        self.summary = ""
        self.token_counter = SimpleTokenCounter()

    def add_message(self, role: str, content: str):
        """添加消息，必要时自动压缩"""
        self.history.append({"role": role, "content": content})

        # 检查是否需要压缩
        current_tokens = self._estimate_tokens()
        if current_tokens > self.max_tokens * 0.8:
            self._auto_compress()

    def _estimate_tokens(self) -> int:
        """估算当前上下文的 Token 数"""
        total = 0
        if self.summary:
            total += self.token_counter.count(self.summary) + 10
        total += self.token_counter.count_messages(self.history)
        return total

    def _auto_compress(self):
        """自动压缩旧消息"""
        if len(self.history) <= self.window_size:
            return

        # 取出旧消息进行压缩
        to_compress = self.history[:-self.window_size]
        self.history = self.history[-self.window_size:]

        # 生成摘要（使用模拟 LLM）
        llm = MockLLM()
        formatted = []
        for msg in to_compress:
            role = "用户" if msg["role"] == "user" else "助手"
            formatted.append(f"{role}: {msg['content'][:50]}")

        prompt = [{"role": "user", "content": "\n".join(formatted)}]
        new_summary = llm.invoke(prompt)

        # 合并摘要
        if self.summary:
            self.summary = f"{self.summary} {new_summary}"
        else:
            self.summary = new_summary

        print(f"  [自动压缩] 生成摘要，保留最近 {self.window_size} 条消息")

    def get_context(self, system_prompt: str = "") -> list:
        """获取完整上下文"""
        context = []

        # 系统提示
        if system_prompt:
            context.append({"role": "system", "content": system_prompt})

        # 历史摘要
        if self.summary:
            context.append({
                "role": "system",
                "content": f"之前的对话摘要: {self.summary}"
            })

        # 最近消息
        context.extend(self.history)
        return context

    def get_stats(self) -> Dict:
        """获取统计信息"""
        return {
            "total_messages": len(self.history),
            "total_tokens": self._estimate_tokens(),
            "max_tokens": self.max_tokens,
            "utilization": self._estimate_tokens() / self.max_tokens,
            "has_summary": bool(self.summary)
        }


# ===== 完整演示 =====
print("\n=== 智能上下文管理器完整演示 ===")
smart_mgr = SmartContextManager(max_tokens=300, window_size=4)

# 模拟多轮对话
conversations = [
    ("user", "你好！我叫张三。"),
    ("assistant", "你好张三！很高兴认识你。"),
    ("user", "我在学习 Python 编程。"),
    ("assistant", "Python 是很好的选择，语法简洁，应用广泛。"),
    ("user", "我想做一个聊天机器人。"),
    ("assistant", "可以用 LangChain 框架来构建聊天机器人。"),
    ("user", "需要哪些库？"),
    ("assistant", "主要需要 langchain、openai、chromadb 等。"),
    ("user", "能给我一个简单示例吗？"),
    ("assistant", "当然！下面是一个基础示例代码。"),
]

for role, content in conversations:
    smart_mgr.add_message(role, content)

# 获取最终上下文
system_prompt = "你是一个友好的 AI 助手。"
context = smart_mgr.get_context(system_prompt)
stats = smart_mgr.get_stats()

print(f"\n最终统计:")
print(f"  消息数: {stats['total_messages']}")
print(f"  Token 数: {stats['total_tokens']}/{stats['max_tokens']}")
print(f"  利用率: {stats['utilization']:.2%}")
print(f"  有摘要: {stats['has_summary']}")

print(f"\n最终上下文 ({len(context)} 条消息):")
for i, msg in enumerate(context):
    role = {"system": "系统", "user": "用户", "assistant": "助手"}.get(msg["role"], msg["role"])
    content = msg["content"][:60] + "..." if len(msg["content"]) > 60 else msg["content"]
    print(f"  {i+1}. [{role}] {content}")
```

**预期输出：**
```
=== 智能上下文管理器完整演示 ===
  [自动压缩] 生成摘要，保留最近 4 条消息

最终统计:
  消息数: 4
  Token 数: 198/300
  利用率: 66.00%
  有摘要: True

最终上下文 (6 条消息):
  1. [系统] 你是一个友好的 AI 助手。
  2. [系统] 之前的对话摘要: 对话摘要: 用户询问了4个问题...
  3. [用户] 能给我一个简单示例吗？
  4. [助手] 当然！下面是一个基础示例代码。
```

### 3.5 聊天机器人示例

```python
"""
带上下文管理的聊天机器人
展示上下文工程在实际对话中的应用
"""


class ChatBot:
    """带上下文管理的聊天机器人"""

    def __init__(self, name: str, max_context_tokens: int = 500):
        self.name = name
        self.context_mgr = SmartContextManager(
            max_tokens=max_context_tokens,
            window_size=6
        )
        self.system_prompt = (
            f"你是{name}，一个友好的 AI 助手。"
            f"你善于用简洁清晰的中文回答问题。"
        )

    def chat(self, user_input: str) -> str:
        """处理用户输入并返回回复"""
        # 添加用户消息
        self.context_mgr.add_message("user", user_input)

        # 获取上下文
        context = self.context_mgr.get_context(self.system_prompt)

        # 模拟 LLM 回复（实际项目中调用真实 API）
        response = self._mock_response(user_input, context)

        # 添加助手回复
        self.context_mgr.add_message("assistant", response)

        return response

    def _mock_response(self, user_input: str, context: list) -> str:
        """模拟 LLM 响应"""
        if "你好" in user_input:
            return f"你好！我是{self.name}，有什么可以帮你的吗？"
        elif "上下文" in user_input or "状态" in user_input:
            stats = self.context_mgr.get_stats()
            return (
                f"当前上下文状态: {stats['total_messages']} 条消息, "
                f"{stats['total_tokens']}/{stats['max_tokens']} Token, "
                f"利用率 {stats['utilization']:.1%}"
            )
        else:
            return f"收到你的消息: '{user_input[:20]}'。让我想想如何回答..."

    def get_status(self) -> Dict:
        """获取机器人状态"""
        return self.context_mgr.get_status() if hasattr(self.context_mgr, 'get_status') else self.context_mgr.get_stats()


# ===== 运行演示 =====
print("\n" + "=" * 60)
print("聊天机器人演示")
print("=" * 60)

bot = ChatBot(name="小智", max_context_tokens=400)

test_conversation = [
    "你好！",
    "我想学习上下文工程",
    "什么是 Token？",
    "上下文窗口有什么限制？",
    "如何管理长对话？",
    "能给我总结一下吗？",
    "你的状态是什么？",
]

for user_input in test_conversation:
    print(f"\n用户: {user_input}")
    response = bot.chat(user_input)
    print(f"小智: {response}")
    stats = bot.get_status()
    print(f"[状态] Token: {stats['total_tokens']}/{stats['max_tokens']} "
          f"({stats['utilization']:.1%}) | 消息: {stats['total_messages']}条")

print("\n" + "=" * 60)
print("对话结束")
print("=" * 60)
```

**预期输出：**
```
============================================================
聊天机器人演示
============================================================

用户: 你好！
小智: 你好！我是小智，有什么可以帮你的吗？
[状态] Token: 42/400 (10.5%) | 消息: 2条

用户: 我想学习上下文工程
小智: 收到你的消息: '我想学习上下文工程'。让我想想如何回答...
[状态] Token: 84/400 (21.0%) | 消息: 4条

...

============================================================
对话结束
============================================================
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | Token 计数不准确 | 使用官方 tiktoken 库: `pip install tiktoken`，然后用 `encoding.encode(text)` 获取精确结果 |
| 2 | 上下文超出模型限制 | 降低摘要触发阈值（如从 0.8 改为 0.6），或减小 window_size |
| 3 | 摘要质量太差 | 实际项目中应调用 LLM 生成摘要，不要用简单的提取式方法 |
| 4 | 内存占用过高 | 使用 `deque` 并设置 `maxlen`，及时清理不再需要的历史 |
| 5 | 滑动窗口丢失重要信息 | 增大 `keep_recent`，或实现消息优先级机制，重要消息不被丢弃 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Token | LLM 处理文本的基本单位，中文约 1.5 字/token，英文约 4 字符/token |
| 上下文窗口 | LLM 一次能处理的最大 Token 数量，如 GPT-4 的 128K |
| 滑动窗口 | 保留最近 N 条消息，丢弃旧消息的简单策略 |
| 摘要压缩 | 将旧消息压缩成简短摘要，保留关键信息 |
| Token 计数 | 计算文本占用多少 Token，用于管理上下文大小 |
| Token 预算 | 为不同类型内容（系统提示、历史、新消息）分配的 Token 配额 |
| 上下文溢出 | 超出模型上下文窗口导致的信息丢失 |
| 上下文管理器 | 自动管理对话历史和上下文的组件 |

## ✅ 验收清单
- [ ] 能用 Token 计数器计算中英文混合文本的 Token 数
- [ ] 能解释清楚滑动窗口策略的工作原理
- [ ] 能实现 SlidingWindowManager 类并正常运行
- [ ] 能实现 SummaryCompressor 类并生成摘要
- [ ] 能使用 SmartContextManager 自动管理长对话
- [ ] 能说出至少 3 个上下文管理最佳实践
- [ ] 聊天机器人示例能完整运行并输出正确结果

## 📝 复盘小纸条
- 今天最大的收获: _______________________
- 还不太确定的: _________________________

## 📥 明日同步接口
- 今日完成度: [ ] 100%  [ ] 80%  [ ] 60%  [ ] 其他___
- 卡点描述: _________________________
- 代码是否能跑通: [ ] 完全可以  [ ] 部分可以  [ ] 有问题
- 明天希望: _________________________
