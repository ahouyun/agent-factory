# 📅 Week 7 Day 1：上下文工程：窗口管理 + 摘要压缩

## 🧭 今日方向
> LLM 的上下文窗口是"稀缺资源"。今天学习如何高效管理上下文：滑动窗口、摘要压缩、重要性排序，让有限的窗口装下最有价值的信息。

## 🎯 生活比喻
> 上下文窗口就像手机屏幕——只能显示有限的内容。滑动窗口就像"向上滑动查看聊天记录"，摘要压缩就像"把长对话缩成几行要点"，重要性排序就像"置顶重要消息"。

## 📋 今日三件事
1. 理解上下文窗口的限制和 token 计算方式
2. 实现滑动窗口和摘要压缩策略
3. 构建智能上下文管理器

## 🗺️ 手把手路线

### Step 1: 理解 Token 窗口
- 做什么: 计算不同文本的 token 数量
- 为什么: 不理解 token 就无法管理上下文
- 成功标志: 能估算一段文本占用多少 token

### Step 2: 滑动窗口策略
- 做什么: 实现保留最近 N 轮对话的策略
- 为什么: 最简单的上下文管理方式
- 成功标志: 能控制对话历史在固定窗口内

### Step 3: 摘要压缩
- 做什么: 用 LLM 将长对话压缩为摘要
- 为什么: 在保留关键信息的同时减少 token 占用
- 成功标志: 压缩后的摘要能回答相关问题

## 💻 代码区

```python
"""
Week 7 Day 1: 上下文工程：窗口管理 + 摘要压缩
安装依赖: pip install langchain langchain-openai tiktoken
"""

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain.prompts import ChatPromptTemplate
import tiktoken

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# ========== 1. Token 计算 ==========
print("=== 1. Token 计算 ===")

def count_tokens(text: str, model: str = "gpt-4o-mini") -> int:
    """计算文本的 token 数量"""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))

# 测试 token 计算
test_texts = [
    "Hello, world!",
    "你好，世界！",
    "Python 是一种广泛使用的编程语言。",
    "这是一个很长的文本，用于测试 token 计算。" * 10,
]

for text in test_texts:
    tokens = count_tokens(text)
    print(f"  ({tokens:4d} tokens) {text[:40]}...")

# 计算模型的上下文窗口
model_limits = {
    "gpt-4o": 128000,
    "gpt-4o-mini": 128000,
    "gpt-3.5-turbo": 16385,
    "claude-3-haiku": 200000,
    "claude-3-opus": 200000,
}

print("\n模型上下文窗口:")
for model, limit in model_limits.items():
    print(f"  {model}: {limit:,} tokens")

# ========== 2. 滑动窗口策略 ==========
print("\n=== 2. 滑动窗口策略 ===")

class SlidingWindowManager:
    """滑动窗口上下文管理器"""

    def __init__(self, max_tokens: int = 4000, keep_recent: int = 3):
        """
        max_tokens: 最大 token 数
        keep_recent: 保留最近几轮对话
        """
        self.max_tokens = max_tokens
        self.keep_recent = keep_recent
        self.history = []

    def add_message(self, role: str, content: str):
        """添加消息"""
        self.history.append({
            "role": role,
            "content": content,
            "tokens": count_tokens(content)
        })

    def get_context(self) -> list:
        """获取上下文（在 token 限制内）"""
        if not self.history:
            return []

        # 保留 System Message（如果有）
        system_msgs = [m for m in self.history if m["role"] == "system"]
        other_msgs = [m for m in self.history if m["role"] != "system"]

        # 计算 System Message 占用的 token
        system_tokens = sum(m["tokens"] for m in system_msgs)
        remaining_tokens = self.max_tokens - system_tokens

        # 保留最近 N 轮对话
        recent_msgs = other_msgs[-self.keep_recent * 2:]  # 2 = user + assistant

        # 如果还有剩余空间，添加更多历史
        selected = []
        current_tokens = 0

        for msg in reversed(other_msgs[:-len(recent_msgs)]):
            if current_tokens + msg["tokens"] <= remaining_tokens:
                selected.insert(0, msg)
                current_tokens += msg["tokens"]
            else:
                break

        # 合并
        all_msgs = system_msgs + selected + recent_msgs

        # 转换为 LangChain 消息格式
        messages = []
        for msg in all_msgs:
            if msg["role"] == "system":
                messages.append(SystemMessage(content=msg["content"]))
            elif msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))

        return messages

    def get_stats(self) -> dict:
        """获取统计信息"""
        total_tokens = sum(m["tokens"] for m in self.history)
        return {
            "total_messages": len(self.history),
            "total_tokens": total_tokens,
            "utilization": total_tokens / self.max_tokens
        }

# 测试滑动窗口
window_mgr = SlidingWindowManager(max_tokens=2000, keep_recent=2)

# 模拟多轮对话
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

# ========== 3. 摘要压缩 ==========
print("\n=== 3. 摘要压缩 ===")

class SummaryCompressor:
    """摘要压缩器"""

    def __init__(self, llm, max_summary_tokens: int = 500):
        self.llm = llm
        self.max_summary_tokens = max_summary_tokens
        self.summary = ""

    def compress(self, messages: list) -> str:
        """将消息压缩为摘要"""
        if not messages:
            return ""

        # 格式化消息
        formatted = []
        for msg in messages:
            if isinstance(msg, HumanMessage):
                formatted.append(f"用户: {msg.content}")
            elif isinstance(msg, AIMessage):
                formatted.append(f"助手: {msg.content}")

        conversation = "\n".join(formatted)

        # 使用 LLM 生成摘要
        prompt = ChatPromptTemplate.from_template("""
请将以下对话压缩为简洁的摘要，保留关键信息和决策。

对话：
{conversation}

要求：
1. 保留用户的主要问题
2. 保留助手的关键回答
3. 保留重要的决策和结论
4. 长度控制在 {max_tokens} tokens 以内
""")

        chain = prompt | self.llm
        response = chain.invoke({
            "conversation": conversation,
            "max_tokens": self.max_summary_tokens
        })

        self.summary = response.content
        return self.summary

    def get_context_with_summary(self, messages: list, max_tokens: int = 4000) -> list:
        """获取带摘要的上下文"""
        # 先压缩历史
        if len(messages) > 4:
            summary = self.compress(messages[:-4])  # 压缩除最近 4 条外的所有消息
            recent = messages[-4:]

            context = [
                SystemMessage(content=f"对话摘要：{summary}")
            ] + recent
        else:
            context = messages

        return context

# 测试摘要压缩
compressor = SummaryCompressor(llm, max_summary_tokens=200)

# 模拟长对话
long_conversation = [
    HumanMessage(content="Python 是什么？"),
    AIMessage(content="Python 是一种解释型编程语言，广泛用于数据科学和 AI。"),
    HumanMessage(content="它有什么优点？"),
    AIMessage(content="简洁语法、丰富生态、跨平台支持。"),
    HumanMessage(content="如何安装？"),
    AIMessage(content="可以从 python.org 下载，或使用 Anaconda。"),
    HumanMessage(content="推荐学习路径？"),
    AIMessage(content="基础语法 → 常用库 → 项目实践。"),
    HumanMessage(content="有什么好的学习资源？"),
    AIMessage(content="官方文档、LeetCode、GitHub 项目。"),
]

compressed_context = compressor.get_context_with_summary(long_conversation)
print(f"原始对话: {len(long_conversation)} 条消息")
print(f"压缩后: {len(compressed_context)} 条消息")
print(f"摘要内容: {compressor.summary[:200]}...")

# ========== 4. 智能上下文管理器 ==========
print("\n=== 4. 智能上下文管理器 ===")

class SmartContextManager:
    """智能上下文管理器"""

    def __init__(self, llm, max_tokens: int = 4000):
        self.llm = llm
        self.max_tokens = max_tokens
        self.history = []
        self.summary = ""

    def add_message(self, role: str, content: str):
        """添加消息"""
        self.history.append({"role": role, "content": content})

    def _estimate_tokens(self, messages: list) -> int:
        """估算消息的 token 数"""
        total = 0
        for msg in messages:
            total += count_tokens(msg.get("content", ""))
        return total

    def _summarize_if_needed(self):
        """如果超出限制，自动摘要"""
        current_tokens = self._estimate_tokens(self.history)

        if current_tokens > self.max_tokens * 0.8:  # 超过 80% 时触发
            # 保留最近 6 条消息
            to_summarize = self.history[:-6]
            recent = self.history[-6:]

            # 生成摘要
            formatted = []
            for msg in to_summarize:
                role = "用户" if msg["role"] == "user" else "助手"
                formatted.append(f"{role}: {msg['content']}")

            prompt = ChatPromptTemplate.from_template("""
将以下对话压缩为简洁摘要，保留关键信息：

{conversation}
""")

            chain = prompt | self.llm
            response = chain.invoke({"conversation": "\n".join(formatted)})

            self.summary = response.content
            self.history = recent

    def get_context(self) -> list:
        """获取上下文"""
        self._summarize_if_needed()

        messages = []
        if self.summary:
            messages.append(SystemMessage(content=f"之前的对话摘要：{self.summary}"))

        for msg in self.history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))

        return messages

# 测试智能管理器
smart_mgr = SmartContextManager(llm, max_tokens=1500)

# 模拟多轮对话
for i in range(10):
    smart_mgr.add_message("user", f"第 {i+1} 个问题：关于 Python 的第 {i+1} 个方面")
    smart_mgr.add_message("assistant", f"第 {i+1} 个回答：这是关于 Python 第 {i+1} 个方面的详细解答。" * 5)

context = smart_mgr.get_context()
print(f"管理器状态:")
print(f"  历史消息: {len(smart_mgr.history)} 条")
print(f"  有摘要: {bool(smart_mgr.summary)}")
print(f"  上下文长度: {len(context)} 条消息")

print("""
=== 上下文管理最佳实践 ===

1. Token 预算分配:
   - System Prompt: 10-15%
   - 历史摘要: 20-30%
   - 最近对话: 40-50%
   - 新查询+回答: 10-20%

2. 压缩策略:
   - 滑动窗口: 最简单，适合短对话
   - 摘要压缩: 保留关键信息，适合长对话
   - 混合策略: 摘要 + 最近窗口

3. 优化技巧:
   - 缓存 token 计算结果
   - 异步执行摘要生成
   - 增量式摘要更新
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | `tiktoken` 安装失败 | `pip install tiktoken`，Windows 可能需要 Visual C++ |
| 2 | token 数超出模型限制 | 减小 `max_tokens`，或启用摘要压缩 |
| 3 | 摘要质量差 | 调整 Prompt，明确要求"保留关键信息" |
| 4 | 上下文丢失关键信息 | 增大 `keep_recent`，或调整摘要策略 |
| 5 | 性能下降（摘要慢） | 缓存摘要结果，或异步生成 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Token | LLM 处理文本的基本单位，1 个 token 约 0.75 个英文单词 |
| 上下文窗口 | LLM 能处理的最大 token 数量 |
| 滑动窗口 | 保留最近 N 轮对话的简单策略 |
| 摘要压缩 | 用 LLM 将长对话压缩为简短摘要 |
| Token 预算 | 为不同类型内容分配的 token 配额 |
| 上下文溢出 | 超出模型上下文窗口导致的信息丢失 |
| 增量摘要 | 只对新增内容进行摘要，而非重新生成 |
| 重要性排序 | 根据内容重要性决定保留或丢弃 |
| 上下文管理器 | 自动管理对话历史和上下文的组件 |
| System Prompt | 系统提示词，通常需要始终保留 |

## ✅ 验收清单
- [ ] 能用 tiktoken 计算文本 token 数
- [ ] 能实现滑动窗口策略
- [ ] 能用 LLM 实现摘要压缩
- [ ] 理解 token 预算分配
- [ ] 能构建智能上下文管理器
- [ ] 能说出至少 3 个上下文管理最佳实践

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
