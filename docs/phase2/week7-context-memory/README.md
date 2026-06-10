# Week 7：上下文工程 + 记忆系统

> **Phase 2 第三周** — 给 Agent 装上"大脑"和"笔记本"

---

## Day 1：上下文窗口管理

### 📅 Day 1：上下文窗口管理 — Agent 的"工作台"只有这么大

### 🧭 今日方向
理解大模型的上下文窗口限制，掌握消息压缩、滑动窗口等管理策略。

### 🎯 生活比喻
大模型的上下文窗口就像一张办公桌。桌子只有这么大（比如 128K tokens），你不可能把所有文件都摊在桌上。你需要定期整理——把不重要的文件收起来（丢弃旧消息），把冗长的报告缩写成摘要（压缩），只保留当前工作需要的资料（优先级排序）。

### 📋 今日三件事
1. 理解 Token 和上下文窗口的关系
2. 实现滑动窗口消息管理
3. 实现消息摘要压缩

### 🗺️ 手把手路线

#### Step 1：Token 计算与窗口限制
**做什么**：用 tiktoken 计算消息的 token 数量
**为什么**：不知道消息占了多少空间就无法管理
**成功标志**：能精确计算每条消息的 token 数

#### Step 2：滑动窗口
**做什么**：保留系统提示 + 最近 N 条消息，丢弃旧消息
**为什么**：最简单有效的窗口管理策略
**成功标志**：对话历史始终保持在 token 限制内

#### Step 3：摘要压缩
**做什么**：将旧消息用 LLM 压缩成摘要
**为什么**：比简单丢弃保留更多信息
**成功标志**：压缩后的摘要能被 LLM 正确理解

### 💻 代码区

```python
"""
Week 7 Day 1：上下文窗口管理
"""
import tiktoken
from openai import OpenAI

client = OpenAI()

# ========== Token 计算工具 ==========

def count_tokens(text: str, model: str = "gpt-4o-mini") -> int:
    """计算文本的 token 数量"""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

def count_message_tokens(messages: list[dict], model: str = "gpt-4o-mini") -> int:
    """计算消息列表的 token 数量"""
    encoding = tiktoken.encoding_for_model(model)
    total = 0
    for msg in messages:
        # 每条消息有固定开销（role + 分隔符）
        total += 4
        for key, value in msg.items():
            total += len(encoding.encode(value))
    total += 2  # 对话结尾的特殊 token
    return total

# 测试 token 计算
test_messages = [
    {"role": "system", "content": "你是一个有帮助的助手。"},
    {"role": "user", "content": "什么是机器学习？"},
    {"role": "assistant", "content": "机器学习是人工智能的一个分支..."}
]
print(f"消息 token 数：{count_message_tokens(test_messages)}")

# ========== 策略1：滑动窗口 ==========

class SlidingWindowMemory:
    """滑动窗口消息管理"""

    def __init__(self, max_tokens: int = 4000, model: str = "gpt-4o-mini"):
        self.max_tokens = max_tokens
        self.model = model
        self.messages: list[dict] = []

    def add_message(self, role: str, content: str):
        """添加消息并自动管理窗口"""
        self.messages.append({"role": role, "content": content})
        self._trim()

    def _trim(self):
        """裁剪消息以满足 token 限制"""
        # 始终保留系统消息
        system_messages = [m for m in self.messages if m["role"] == "system"]
        other_messages = [m for m in self.messages if m["role"] != "system"]

        system_tokens = count_message_tokens(system_messages, self.model)

        # 从最新的消息开始保留，直到达到 token 限制
        kept = []
        current_tokens = system_tokens
        for msg in reversed(other_messages):
            msg_tokens = count_message_tokens([msg], self.model)
            if current_tokens + msg_tokens > self.max_tokens:
                break
            kept.insert(0, msg)
            current_tokens += msg_tokens

        self.messages = system_messages + kept

    def get_messages(self) -> list[dict]:
        return self.messages.copy()

    def get_stats(self) -> dict:
        return {
            "total_messages": len(self.messages),
            "total_tokens": count_message_tokens(self.messages, self.model),
            "max_tokens": self.max_tokens,
            "utilization": count_message_tokens(self.messages, self.model) / self.max_tokens
        }

# 测试滑动窗口
print("\n--- 滑动窗口测试 ---")
memory = SlidingWindowMemory(max_tokens=500)
memory.add_message("system", "你是一个助手。")

for i in range(20):
    memory.add_message("user", f"这是第 {i+1} 个问题，关于 Python 编程的第 {i} 个话题。")
    memory.add_message("assistant", f"这是第 {i+1} 个回答，详细解释了相关内容。")

stats = memory.get_stats()
print(f"总消息数：{stats['total_messages']}")
print(f"Token 使用：{stats['total_tokens']}/{stats['max_tokens']} ({stats['utilization']:.1%})")

# ========== 策略2：摘要压缩 ==========

class SummaryMemory:
    """摘要压缩消息管理"""

    def __init__(self, max_tokens: int = 4000, summary_threshold: float = 0.7):
        self.max_tokens = max_tokens
        self.summary_threshold = summary_threshold  # 触发压缩的阈值
        self.summary = ""  # 历史摘要
        self.messages: list[dict] = []
        self.client = OpenAI()

    def add_message(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})

        # 检查是否需要压缩
        current_tokens = count_message_tokens(self.messages)
        if current_tokens > self.max_tokens * self.summary_threshold:
            self._compress()

    def _compress(self):
        """将旧消息压缩为摘要"""
        # 保留最近 4 条消息不动
        preserve_count = 4
        if len(self.messages) <= preserve_count:
            return

        to_compress = self.messages[:-preserve_count]
        to_keep = self.messages[-preserve_count:]

        # 用 LLM 生成摘要
        compression_prompt = [
            {"role": "system", "content": "请将以下对话内容压缩成简洁的摘要，保留关键信息。"},
            {"role": "user", "content": str(to_compress)}
        ]

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=compression_prompt,
            temperature=0,
            max_tokens=200
        )

        new_summary = response.choices[0].message.content

        # 合并摘要
        if self.summary:
            self.summary = f"{self.summary}\n{new_summary}"
        else:
            self.summary = new_summary

        # 更新消息列表
        self.messages = [
            {"role": "system", "content": f"对话历史摘要：{self.summary}"}
        ] + to_keep

        print(f"  [压缩] 旧消息 {len(to_compress)} 条 → 摘要 {len(self.summary)} 字符")

    def get_messages(self) -> list[dict]:
        return self.messages.copy()

# ========== 策略3：优先级排序 ==========

class PriorityMemory:
    """带优先级的消息管理"""

    def __init__(self, max_tokens: int = 4000):
        self.max_tokens = max_tokens
        self.system_messages: list[dict] = []
        self.high_priority: list[dict] = []  # 工具调用结果等
        self.medium_priority: list[dict] = []  # 最近的对话
        self.low_priority: list[dict] = []  # 旧对话

    def add_message(self, role: str, content: str, priority: str = "medium"):
        msg = {"role": role, "content": content}
        if role == "system":
            self.system_messages.append(msg)
        elif priority == "high":
            self.high_priority.append(msg)
        elif priority == "low":
            self.low_priority.append(msg)
        else:
            self.medium_priority.append(msg)

    def get_messages(self) -> list[dict]:
        """按优先级获取消息，确保总 token 不超限"""
        result = self.system_messages.copy()
        current_tokens = count_message_tokens(result)

        # 按优先级依次加入
        for priority_list in [self.high_priority, self.medium_priority, self.low_priority]:
            for msg in reversed(priority_list):  # 最新的优先
                msg_tokens = count_message_tokens([msg])
                if current_tokens + msg_tokens <= self.max_tokens:
                    result.insert(len(self.system_messages), msg)
                    current_tokens += msg_tokens

        return result

# ========== 对话演示 ==========

def chat_with_memory(memory, user_input: str) -> str:
    """使用记忆管理的对话"""
    memory.add_message("user", user_input)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=memory.get_messages(),
        temperature=0
    )

    answer = response.choices[0].message.content
    memory.add_message("assistant", answer)
    return answer

# 测试摘要压缩
print("\n--- 摘要压缩测试 ---")
summary_memory = SummaryMemory(max_tokens=800)
summary_memory.add_message("system", "你是一个Python助手。")

topics = [
    "什么是装饰器？",
    "列表推导式怎么用？",
    "生成器和迭代器的区别？",
    "async/await 怎么用？",
    "什么是上下文管理器？",
]

for topic in topics:
    answer = chat_with_memory(summary_memory, topic)
    print(f"Q: {topic}")
    print(f"A: {answer[:80]}...")
    print(f"当前消息数：{len(summary_memory.messages)}")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| tiktoken 模型不支持 | 使用 `cl100k_base` 编码作为 fallback |
| 压缩后摘要丢失关键信息 | 增加 `preserve_count`，保留更多近期消息 |
| Token 计算不准确 | 考虑消息格式开销（role、分隔符等） |
| 压缩太频繁 | 调高 `summary_threshold` |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Token | 模型处理文本的最小单位 | 单词 |
| Context Window | 模型一次能处理的最大 token 数 | 办公桌面积 |
| Sliding Window | 保留最近 N 条消息 | 只看最近的文件 |
| Summary Compression | 将旧消息压缩为摘要 | 把报告缩写成一页 |

### ✅ 验收清单
- [ ] 能计算消息的 token 数量
- [ ] 滑动窗口能正确裁剪消息
- [ ] 摘要压缩能有效减少 token 使用
- [ ] 理解不同策略的适用场景

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 2 将学习 MemGPT 的三层记忆架构（工作记忆 + 长期记忆 + 归档），请确保理解今日的窗口管理策略。

---

## Day 2：MemGPT 三层记忆架构

### 📅 Day 2：MemGPT — 给 Agent 一个"记忆宫殿"

### 🧭 今日方向
学习 MemGPT 的核心思想：工作记忆、长期记忆、归档存储的三层架构。

### 🎯 生俗比喻
人脑有三种记忆：工作记忆（正在想的事）、短期记忆（今天发生的事）、长期记忆（深刻的知识）。MemGPT 让 Agent 拥有类似的能力——工作记忆是当前对话上下文（贵但快），长期记忆是向量数据库存储的重要信息（便宜但需要检索），归档是完整的对话日志（最便宜但最慢）。

### 📋 今日三件事
1. 理解 MemGPT 的三层记忆架构
2. 实现核心记忆（Core Memory）的读写操作
3. 实现归档记忆（Archival Memory）的存储和检索

### 🗺️ 手把手路线

#### Step 1：设计记忆架构
**做什么**：定义 Core Memory、Archival Memory、Recall Memory 三种存储
**为什么**：不同类型的记忆有不同的存取策略
**成功标志**：能画出三层记忆的架构图

#### Step 2：实现核心记忆
**做什么**：实现可读写的"人物档案"式核心记忆
**为什么**：核心记忆是 Agent 的"身份认同"，始终在上下文中
**成功标志**：Agent 能记住并更新用户的关键信息

#### Step 3：实现归档记忆
**做什么**：用向量数据库存储历史信息，支持语义检索
**为什么**：不是所有信息都需要放在上下文中，按需检索更高效
**成功标志**：Agent 能从归档中检索相关信息

### 💻 代码区

```python
"""
Week 7 Day 2：MemGPT 三层记忆架构
"""
import json
import time
from datetime import datetime
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

# ========== 三层记忆架构 ==========

class CoreMemory:
    """
    核心记忆（工作记忆）
    - 始终在上下文中
    - 可读可写
    - 存储关键的人设和事实信息
    """

    def __init__(self):
        # 人物档案（预设）
        self.persona = "你是一个有帮助的AI助手，名叫小智。你友好、耐心、专业。"

        # 关键事实（动态更新）
        self.facts: dict[str, str] = {
            "user_name": "未知",
            "user_role": "未知",
            "preferences": "未知",
        }

    def read(self, key: str = None) -> str:
        """读取核心记忆"""
        if key:
            return self.facts.get(key, "未记录")
        # 返回完整的核心记忆
        lines = [f"人物设定：{self.persona}"]
        for k, v in self.facts.items():
            if v != "未知":
                lines.append(f"{k}: {v}")
        return "\n".join(lines)

    def write(self, key: str, value: str):
        """写入/更新核心记忆"""
        old_value = self.facts.get(key, "未记录")
        self.facts[key] = value
        print(f"  [核心记忆更新] {key}: {old_value} → {value}")

    def to_system_prompt(self) -> str:
        """转为系统提示的一部分"""
        return f"""以下是你的核心记忆（人物设定和已知事实）：
{self.read()}

你可以使用 core_memory_replace 工具来更新这些记忆。"""


class ArchivalMemory:
    """
    归档记忆（长期记忆）
    - 存储在向量数据库中
    - 支持语义检索
    - 用于存储不常访问但需要保留的信息
    """

    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma(
            collection_name="archival_memory",
            embedding_function=self.embeddings
        )
        self.entries: list[dict] = []

    def insert(self, content: str, metadata: dict = None):
        """插入新的归档记忆"""
        entry = {
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        self.entries.append(entry)

        # 存入向量数据库
        doc = Document(
            page_content=content,
            metadata={"timestamp": entry["timestamp"], **(metadata or {})}
        )
        self.vectorstore.add_documents([doc])
        print(f"  [归档插入] {content[:50]}...")

    def search(self, query: str, k: int = 3) -> list[str]:
        """语义检索归档记忆"""
        results = self.vectorstore.similarity_search(query, k=k)
        return [doc.page_content for doc in results]

    def count(self) -> int:
        return len(self.entries)


class RecallMemory:
    """
    回忆记忆（对话历史）
    - 存储完整的对话记录
    - 支持按时间范围检索
    """

    def __init__(self):
        self.conversations: list[dict] = []

    def add(self, role: str, content: str):
        """添加对话记录"""
        self.conversations.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })

    def get_recent(self, n: int = 10) -> list[dict]:
        """获取最近 n 条对话"""
        return self.conversations[-n:]

    def search_by_keyword(self, keyword: str) -> list[dict]:
        """按关键词搜索对话历史"""
        return [
            msg for msg in self.conversations
            if keyword.lower() in msg["content"].lower()
        ]

    def get_stats(self) -> dict:
        return {
            "total_messages": len(self.conversations),
            "first_message": self.conversations[0]["timestamp"] if self.conversations else None,
            "last_message": self.conversations[-1]["timestamp"] if self.conversations else None,
        }


# ========== MemGPT Agent ==========

class MemGPTAgent:
    """带三层记忆的 Agent"""

    def __init__(self):
        self.core = CoreMemory()
        self.archival = ArchivalMemory()
        self.recall = RecallMemory()

        from openai import OpenAI
        self.client = OpenAI()

    def chat(self, user_input: str) -> str:
        """带记忆管理的对话"""
        # 记录用户消息
        self.recall.add("user", user_input)

        # 检测是否需要更新核心记忆
        self._maybe_update_core_memory(user_input)

        # 检测是否需要归档
        self._maybe_archive(user_input)

        # 构建带记忆的 Prompt
        messages = [
            {"role": "system", "content": self._build_system_prompt()},
            *self.recall.get_recent(10),  # 最近 10 条对话
        ]

        # 调用 LLM
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0
        )

        answer = response.choices[0].message.content

        # 记录助手回复
        self.recall.add("assistant", answer)

        return answer

    def _build_system_prompt(self) -> str:
        """构建包含记忆的系统提示"""
        # 从归档中检索相关记忆
        recent_topics = " ".join([
            msg["content"][:50]
            for msg in self.recall.get_recent(3)
            if msg["role"] == "user"
        ])

        archival_context = ""
        if recent_topics:
            relevant_memories = self.archival.search(recent_topics, k=2)
            if relevant_memories:
                archival_context = "\n相关历史记忆：\n" + "\n".join(
                    f"- {m}" for m in relevant_memories
                )

        return f"""{self.core.to_system_prompt()}
{archival_context}

请根据以上记忆信息回答用户的问题。如果用户提到了新的重要信息，你可以在回答后提示需要更新记忆。"""

    def _maybe_update_core_memory(self, user_input: str):
        """检测是否需要更新核心记忆"""
        # 简单的关键词检测（生产环境用 LLM 判断）
        if "我叫" in user_input or "我是" in user_input:
            # 提取姓名
            if "我叫" in user_input:
                name = user_input.split("我叫")[-1].split("，")[0].split("。")[0]
                self.core.write("user_name", name.strip())

        if "我是一个" in user_input or "我的工作是" in user_input:
            role = user_input.split("我是一个")[-1].split("，")[0].split("。")[0] if "我是一个" in user_input else \
                   user_input.split("我的工作是")[-1].split("，")[0].split("。")[0]
            self.core.write("user_role", role.strip())

    def _maybe_archive(self, user_input: str):
        """检测是否需要归档"""
        # 长消息或包含重要信息的消息自动归档
        if len(user_input) > 50:
            self.archival.insert(
                user_input,
                metadata={"source": "user_input"}
            )

    def status(self) -> dict:
        """获取记忆系统状态"""
        return {
            "core_memory": self.core.read(),
            "archival_count": self.archival.count(),
            "recall_stats": self.recall.get_stats(),
        }


# ========== 测试 ==========

agent = MemGPTAgent()

# 模拟多轮对话
conversations = [
    "你好！我叫张明，我是一个Python开发者。",
    "我最近在学习RAG技术，感觉很有意思。",
    "我之前用过LangChain，觉得LCEL语法很优雅。",
    "我的偏好是用VSCode作为IDE，喜欢深色主题。",
    "对了，我之前提到的RAG项目用了Chroma数据库。",
    "你还记得我叫什么名字吗？",
]

print("="*60)
for msg in conversations:
    print(f"\n用户：{msg}")
    response = agent.chat(msg)
    print(f"助手：{response}")

# 查看记忆状态
print("\n" + "="*60)
print("记忆系统状态：")
status = agent.status()
print(f"核心记忆：\n{status['core_memory']}")
print(f"归档记忆数：{status['archival_count']}")
print(f"对话记录数：{status['recall_stats']['total_messages']}")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| 核心记忆提取不准 | 用 LLM 替代关键词匹配来提取信息 |
| 归档检索效果差 | 优化文档分块策略，添加更多元数据 |
| 对话历史太长 | 结合 Day 1 的滑动窗口策略 |
| Chroma 集合冲突 | 使用唯一的 collection_name |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Core Memory | 始终在上下文中的关键信息 | 大脑的工作记忆 |
| Archival Memory | 存储在数据库中的历史信息 | 图书馆的档案室 |
| Recall Memory | 完整的对话历史记录 | 日记本 |
| Memory Edit | 更新记忆的操作 | 修改笔记 |

### ✅ 验收清单
- [ ] 能画出三层记忆的架构图
- [ ] 核心记忆能正确读写
- [ ] 归档记忆能存储和检索
- [ ] Agent 能在对话中利用记忆

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 3 将动手实现完整的记忆系统，结合 LangGraph 构建有状态的 Agent，请确保已理解三层记忆的概念。

---

## Day 3：记忆系统实战

### 📅 Day 3：记忆系统实战 — 用 LangGraph 构建有记忆的 Agent

### 🧭 今日方向
将记忆系统与 LangGraph 结合，构建一个能自主管理记忆的 Agent。

### 🎯 生活比喻
前两天我们学了"记忆的理论"，今天是"实践课"。就像学游泳——看再多教程也不如下水一次。我们将用 LangGraph 的状态机来编排记忆的读写流程，让 Agent 自己决定什么时候记、记什么、什么时候忘。

### 📋 今日三件事
1. 用 LangGraph 状态机管理记忆的读写
2. 实现自动记忆提取和存储
3. 实现基于记忆的个性化回复

### 🗺️ 手把手路线

#### Step 1：定义记忆状态
**做什么**：用 TypedDict 定义包含所有记忆类型的状态
**为什么**：LangGraph 需要明确的状态定义
**成功标志**：状态类包含核心记忆、归档记忆、对话历史

#### Step 2：创建记忆管理节点
**做什么**：创建记忆提取、记忆更新、记忆检索三个节点
**为什么**：每个节点负责记忆的一个方面
**成功标志**：每个节点能正确操作对应的记忆

#### Step 3：编排工作流
**做什么**：用条件边串联记忆管理的完整流程
**为什么**：确保记忆操作的顺序正确
**成功标志**：工作流能端到端运行

### 💻 代码区

```python
"""
Week 7 Day 3：记忆系统实战 — LangGraph + 三层记忆
"""
from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage, AIMessage

# ========== 状态定义 ==========

class AgentState(TypedDict):
    """Agent 的完整状态"""
    user_input: str
    core_memory: dict       # 核心记忆
    conversation_history: list[dict]  # 对话历史
    retrieved_context: str  # 从归档检索的内容
    response: str           # Agent 的回复
    memory_updates: list[dict]  # 待更新的记忆

# ========== 初始化组件 ==========

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
embeddings = OpenAIEmbeddings()
archival_store = Chroma(
    collection_name="agent_archival",
    embedding_function=embeddings
)

# ========== 节点实现 ==========

def extract_memory(state: AgentState) -> dict:
    """节点：从用户输入中提取需要记忆的信息"""
    user_input = state["user_input"]
    current_memory = state["core_memory"]

    # 用 LLM 提取关键信息
    extract_prompt = f"""分析以下用户输入，提取需要记住的关键信息。

当前已知信息：{current_memory}

用户输入：{user_input}

请输出需要更新或新增的记忆（JSON格式）：
{{
    "updates": [{{"key": "字段名", "value": "值"}}],
    "should_archive": true/false,
    "archive_content": "需要归档的长文本（如果有）"
}}
只输出 JSON，不要其他内容。"""

    response = llm.invoke([{"role": "user", "content": extract_prompt}])

    import json
    try:
        result = json.loads(response.content)
    except json.JSONDecodeError:
        result = {"updates": [], "should_archive": False}

    return {"memory_updates": result.get("updates", [])}

def update_memory(state: AgentState) -> dict:
    """节点：更新核心记忆"""
    updates = state["memory_updates"]
    core_memory = state["core_memory"].copy()

    for update in updates:
        key = update.get("key", "")
        value = update.get("value", "")
        if key and value:
            core_memory[key] = value
            print(f"  [记忆更新] {key}: {value}")

    return {"core_memory": core_memory}

def archive_info(state: AgentState) -> dict:
    """节点：将重要信息存入归档"""
    user_input = state["user_input"]

    # 长消息自动归档
    if len(user_input) > 30:
        doc = Document(
            page_content=user_input,
            metadata={"source": "conversation", "timestamp": "now"}
        )
        archival_store.add_documents([doc])

    return {}

def retrieve_from_archive(state: AgentState) -> dict:
    """节点：从归档检索相关信息"""
    user_input = state["user_input"]

    results = archival_store.similarity_search(user_input, k=2)
    context = "\n".join([doc.page_content for doc in results]) if results else ""

    return {"retrieved_context": context}

def generate_response(state: AgentState) -> dict:
    """节点：生成回复"""
    # 构建系统提示
    memory_str = json.dumps(state["core_memory"], ensure_ascii=False, indent=2)
    system_prompt = f"""你是一个有记忆的AI助手。

核心记忆：
{memory_str}

相关历史信息：
{state.get('retrieved_context', '无')}

请根据以上记忆信息，个性化地回答用户的问题。"""

    messages = [
        {"role": "system", "content": system_prompt},
        *state["conversation_history"][-6:],  # 最近 6 条
        {"role": "user", "content": state["user_input"]}
    ]

    response = llm.invoke(messages)

    return {"response": response.content}

def update_conversation(state: AgentState) -> dict:
    """节点：更新对话历史"""
    history = state["conversation_history"].copy()
    history.append({"role": "user", "content": state["user_input"]})
    history.append({"role": "assistant", "content": state["response"]})

    # 限制历史长度
    if len(history) > 20:
        history = history[-20:]

    return {"conversation_history": history}

# ========== 构建工作流 ==========

import json

workflow = StateGraph(AgentState)

# 添加节点
workflow.add_node("extract_memory", extract_memory)
workflow.add_node("update_memory", update_memory)
workflow.add_node("archive_info", archive_info)
workflow.add_node("retrieve_archive", retrieve_from_archive)
workflow.add_node("generate_response", generate_response)
workflow.add_node("update_conversation", update_conversation)

# 定义边
workflow.set_entry_point("extract_memory")
workflow.add_edge("extract_memory", "update_memory")
workflow.add_edge("update_memory", "archive_info")
workflow.add_edge("archive_info", "retrieve_archive")
workflow.add_edge("retrieve_archive", "generate_response")
workflow.add_edge("generate_response", "update_conversation")
workflow.add_edge("update_conversation", END)

app = workflow.compile()

# ========== 测试 ==========

# 初始状态
initial_state = {
    "user_input": "",
    "core_memory": {"user_name": "未知", "user_role": "未知", "preferences": "未知"},
    "conversation_history": [],
    "retrieved_context": "",
    "response": "",
    "memory_updates": [],
}

# 模拟对话
test_messages = [
    "你好！我叫李华，是一名数据科学家。",
    "我主要用Python做数据分析和机器学习。",
    "我最近在研究如何将LLM应用到我们的产品中。",
    "你还记得我是谁吗？",
]

for msg in test_messages:
    print(f"\n{'='*50}")
    print(f"用户：{msg}")

    initial_state["user_input"] = msg
    result = app.invoke(initial_state)

    print(f"助手：{result['response']}")
    print(f"记忆：{result['core_memory']}")

    # 更新状态
    initial_state = result
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| LLM 提取记忆不准确 | 优化 prompt，增加示例 |
| Chroma 向量库为空 | 确认 `add_documents` 已执行 |
| 状态传递出错 | 检查 TypedDict 字段名是否一致 |
| 工作流死循环 | 确保所有路径最终到达 END |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| State Graph | 基于状态的有向图 | 流程图 |
| Node | 状态转换函数 | 流程步骤 |
| Edge | 节点间的连接 | 流程箭头 |

### ✅ 验收清单
- [ ] 记忆提取能正确识别用户信息
- [ ] 核心记忆能被更新
- [ ] 归档检索能找到相关信息
- [ ] Agent 能基于记忆个性化回复

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 4 将学习 Agent Persona（人设设计）和多 Agent 协作，让 Agent 不仅有记忆，还有"个性"。

---

## Day 4：Agent Persona

### 📅 Day 4：Agent Persona — 给 Agent 设计"人格"和"说话方式"

### 🧭 今日方向
学习如何设计 Agent 的人设（Persona），包括角色定位、说话风格、知识边界、行为规范。

### 🎯 生活比喻
同一个人在不同场合会表现不同：在公司是专业员工，在朋友面前是搞笑担当，在家人面前是贴心管家。Agent Persona 就是给 Agent 设定一个"社会角色"——它知道自己的身份、该说什么话、不该说什么话。

### 📋 今日三件事
1. 理解 Persona 的核心要素（角色、风格、边界、价值观）
2. 实现可配置的 Persona 系统
3. 对比不同 Persona 对回答风格的影响

### 🗺️ 手把手路线

#### Step 1：设计 Persona 要素
**做什么**：定义角色名、背景故事、说话风格、知识范围、行为边界
**为什么**：Persona 的一致性依赖于完整的定义
**成功标志**：能写出一个完整的 Persona 配置

#### Step 2：实现 Persona 引擎
**做什么**：将 Persona 配置转为系统提示
**为什么**：系统提示是控制 LLM 行为的主要手段
**成功标志**：不同 Persona 生成不同的系统提示

#### Step 3：测试不同 Persona
**做什么**：用相同问题测试不同 Persona 的回答差异
**为什么**：验证 Persona 的有效性
**成功标志**：能观察到明显的风格差异

### 💻 代码区

```python
"""
Week 7 Day 4：Agent Persona 系统
"""
from dataclasses import dataclass, field
from openai import OpenAI

client = OpenAI()

# ========== Persona 定义 ==========

@dataclass
class Persona:
    """Agent 人格配置"""
    name: str                          # 名字
    role: str                          # 角色定位
    background: str                    # 背景故事
    speaking_style: str                # 说话风格
    personality_traits: list[str]      # 性格特征
    knowledge_scope: list[str]         # 知识范围
    boundaries: list[str]              # 行为边界
    values: list[str]                  # 核心价值观
    greeting: str = ""                 # 默认问候语

    def to_system_prompt(self) -> str:
        """将 Persona 转为系统提示"""
        traits = "、".join(self.personality_traits)
        knowledge = "、".join(self.knowledge_scope)
        boundaries = "\n".join(f"- {b}" for b in self.boundaries)
        values = "\n".join(f"- {v}" for v in self.values)

        return f"""你是{self.name}，{self.role}。

## 背景
{self.background}

## 说话风格
{self.speaking_style}

## 性格特征
{traits}

## 知识范围
你擅长以下领域：{knowledge}
在这些领域之外，你应该坦诚表示不确定，而不是编造答案。

## 行为边界
{boundaries}

## 核心价值观
{values}

请始终以{self.name}的身份和风格回答问题。"""


# ========== 预设 Persona ==========

TEACHER_PERSONA = Persona(
    name="李老师",
    role="一位经验丰富的Python编程教师",
    background="李老师有15年的Python开发和教学经验，曾在多所大学任教，帮助过上千名学生入门编程。",
    speaking_style="耐心、循循善诱，善于用生活中的例子解释技术概念。会主动询问学生的理解程度。",
    personality_traits=["耐心", "鼓励型", "善于类比", "严谨但不枯燥"],
    knowledge_scope=["Python编程", "数据结构与算法", "Web开发", "机器学习基础"],
    boundaries=[
        "不帮学生写完整的作业代码",
        "不回答与编程无关的问题",
        "发现学生想放弃时会鼓励他们"
    ],
    values=["授人以渔", "激发兴趣", "循序渐进"],
    greeting="同学你好！我是李老师，今天想学点什么？"
)

HACKER_PERSONA = Persona(
    name="极客小黑",
    role="一位硬核的技术极客",
    background="小黑是开源社区的活跃贡献者，精通系统底层和逆向工程，喜欢挑战技术难题。",
    speaking_style="直接、简洁，偶尔夹杂技术术语和网络用语。喜欢用代码说话。",
    personality_traits=["极客", "追求效率", "不拘小节", "技术至上"],
    knowledge_scope=["系统底层", "网络安全", "Linux", "性能优化"],
    boundaries=[
        "不回答违法的黑客行为",
        "对商业产品不感冒",
        "推崇开源精神"
    ],
    values=["技术自由", "开源共享", "底层原理"],
    greeting="yo，有什么技术问题？直接说，别绕弯子。"
)

CONSULTANT_PERSONA = Persona(
    name="王顾问",
    role="一位资深的技术咨询顾问",
    background="王顾问在IT咨询行业工作了20年，服务过多家世界500强企业，擅长将技术与商业结合。",
    speaking_style="专业、有条理，善于用框架思维分析问题。会先了解业务背景再给建议。",
    personality_traits=["专业", "全局观", "注重ROI", "善于沟通"],
    knowledge_scope=["技术架构", "项目管理", "数字化转型", "技术选型"],
    boundaries=[
        "不做纯技术实现",
        "会从商业价值角度评估技术方案",
        "必要时会建议客户调整预算"
    ],
    values=["价值导向", "全局思维", "可持续性"],
    greeting="您好，我是王顾问。在给技术建议前，我想先了解一下您的业务背景和目标。"
)


# ========== Persona 对比测试 ==========

def test_persona(persona: Persona, question: str) -> str:
    """使用指定 Persona 回答问题"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": persona.to_system_prompt()},
            {"role": "user", "content": question}
        ],
        temperature=0.7,
        max_tokens=300
    )
    return response.choices[0].message.content

# 测试问题
question = "Python 的装饰器是什么？能举个例子吗？"

personas = [
    ("李老师（教学型）", TEACHER_PERSONA),
    ("极客小黑（极客型）", HACKER_PERSONA),
    ("王顾问（商业型）", CONSULTANT_PERSONA),
]

for name, persona in personas:
    print(f"\n{'='*50}")
    print(f"Persona：{name}")
    print(f"问题：{question}")
    answer = test_persona(persona, question)
    print(f"回答：{answer}")


# ========== 动态 Persona ==========

class DynamicPersona:
    """根据对话动态调整 Persona"""

    def __init__(self, base_persona: Persona):
        self.base = base_persona
        self.adjustments: list[str] = []

    def adjust(self, adjustment: str):
        """添加动态调整"""
        self.adjustments.append(adjustment)

    def to_system_prompt(self) -> str:
        base_prompt = self.base.to_system_prompt()
        if self.adjustments:
            adjustments_text = "\n".join(f"- {a}" for a in self.adjustments)
            base_prompt += f"\n\n## 本次对话的额外调整\n{adjustments_text}"
        return base_prompt

# 动态调整示例
dynamic = DynamicPersona(TEACHER_PERSONA)
dynamic.adjust("学生今天心情不好，多给一些鼓励")
dynamic.adjust("用更简单的语言解释，避免术语")

print("\n" + "="*50)
print("动态调整后的 Persona：")
answer = test_persona(dynamic, "装饰器太难了，我是不是不适合学编程？")
print(f"回答：{answer}")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| Persona 不一致 | 检查系统提示是否完整覆盖所有要素 |
| 回答风格不明显 | 加强 speaking_style 的描述 |
| 超出知识范围 | 在 boundaries 中明确限制 |
| Persona 之间的差异不大 | 增加 personality_traits 的区分度 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Persona | Agent 的人格设定 | 演员的角色设定 |
| Speaking Style | 说话风格 | 口头禅和语气 |
| Boundary | 行为边界 | 职业道德底线 |
| Dynamic Adjustment | 动态调整人设 | 根据场合调整表现 |

### ✅ 验收清单
- [ ] 能设计一个完整的 Persona
- [ ] 理解 Persona 各要素的作用
- [ ] 不同 Persona 能产生不同的回答风格
- [ ] 能根据场景动态调整 Persona

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 5 将学习 Agent 的错误处理和容错策略，确保 Agent 在异常情况下也能优雅处理。

---

## Day 5：错误处理与容错

### 📅 Day 5：错误处理 — 让 Agent 面对意外也能优雅应对

### 🧭 今日方向
实现 Agent 的错误处理、重试、降级和异常恢复机制。

### 🎯 生活比喻
好的客服即使遇到系统故障也不会慌张——它会说"系统正在维护，我先帮您记录问题，稍后回复"。Agent 也一样，需要在 API 超时、工具出错、模型异常等情况下降级处理，而不是直接崩溃。

### 📋 今日三件事
1. 实现 LLM 调用的重试和超时机制
2. 实现工具调用的异常处理和降级策略
3. 构建带错误恢复的完整 Agent

### 🗺️ 手把手路线

#### Step 1：LLM 调用容错
**做什么**：实现指数退避重试、超时控制
**为什么**：API 调用可能因网络、限流等原因失败
**成功标志**：能在 API 失败时自动重试

#### Step 2：工具调用容错
**做什么**：为每个工具添加异常捕获和 fallback
**为什么**：工具可能因为各种原因失败
**成功标志**：工具失败时 Agent 能优雅降级

#### Step 3：整体 Agent 容错
**做什么**：实现完整的错误恢复工作流
**为什么**：端到端的容错才能保证用户体验
**成功标志**：Agent 在各种异常场景下都能给出有意义的回复

### 💻 代码区

```python
"""
Week 7 Day 5：Agent 错误处理与容错
"""
import time
import json
from functools import wraps
from openai import OpenAI, APITimeoutError, APIError, RateLimitError

client = OpenAI()

# ========== 装饰器：重试机制 ==========

def retry_with_backoff(max_retries=3, base_delay=1, backoff_factor=2):
    """指数退避重试装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except RateLimitError as e:
                    delay = base_delay * (backoff_factor ** attempt)
                    print(f"  [限流] 等待 {delay}s 后重试（第{attempt+1}次）")
                    time.sleep(delay)
                    last_exception = e
                except APITimeoutError as e:
                    delay = base_delay * (backoff_factor ** attempt)
                    print(f"  [超时] 等待 {delay}s 后重试（第{attempt+1}次）")
                    time.sleep(delay)
                    last_exception = e
                except APIError as e:
                    if e.status_code >= 500:
                        delay = base_delay * (backoff_factor ** attempt)
                        print(f"  [服务器错误] 等待 {delay}s 后重试（第{attempt+1}次）")
                        time.sleep(delay)
                        last_exception = e
                    else:
                        raise
            raise last_exception
        return wrapper
    return decorator

# ========== 工具异常处理 ==========

class ToolResult:
    """工具调用结果"""
    def __init__(self, success: bool, data=None, error=None, fallback_used=False):
        self.success = success
        self.data = data
        self.error = error
        self.fallback_used = fallback_used

    def to_dict(self):
        return {
            "success": self.success,
            "data": self.data,
            "error": self.error,
            "fallback_used": self.fallback_used
        }

def safe_calculator(expression: str) -> ToolResult:
    """带异常处理的计算器"""
    try:
        # 简单计算（生产环境用 ast.literal_eval 或沙箱）
        result = eval(expression, {"__builtins__": {}, "abs": abs, "round": round})
        return ToolResult(success=True, data={"result": result})
    except ZeroDivisionError:
        return ToolResult(success=False, error="除数不能为零")
    except SyntaxError:
        return ToolResult(success=False, error="表达式语法错误")
    except Exception as e:
        return ToolResult(success=False, error=f"计算错误：{str(e)}")

def safe_api_call(url: str) -> ToolResult:
    """带超时和重试的 API 调用"""
    import urllib.request
    import urllib.error

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Agent/1.0"})
        response = urllib.request.urlopen(req, timeout=5)
        data = response.read().decode("utf-8")
        return ToolResult(success=True, data=data)
    except urllib.error.URLError as e:
        # 降级：返回缓存数据
        return ToolResult(
            success=False,
            error=f"API 调用失败：{str(e)}",
            fallback_used=True,
            data="（使用缓存数据）API 不可用时的降级响应"
        )
    except Exception as e:
        return ToolResult(success=False, error=str(e))

# ========== 带错误恢复的 Agent ==========

class ResilientAgent:
    """带完整错误处理的 Agent"""

    def __init__(self):
        self.client = OpenAI()
        self.error_log: list[dict] = []

    @retry_with_backoff(max_retries=3, base_delay=1)
    def _call_llm(self, messages: list[dict], **kwargs) -> str:
        """带重试的 LLM 调用"""
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0,
            **kwargs
        )
        return response.choices[0].message.content

    def chat(self, user_input: str) -> dict:
        """带错误恢复的对话"""
        try:
            # Step 1：理解用户意图
            intent = self._understand_intent(user_input)

            # Step 2：执行操作（带容错）
            result = self._execute_with_fallback(intent, user_input)

            # Step 3：生成回复
            response = self._generate_response(user_input, result)

            return {
                "success": True,
                "response": response,
                "fallback_used": result.get("fallback_used", False)
            }

        except Exception as e:
            # 最终降级：通用错误回复
            self.error_log.append({
                "input": user_input,
                "error": str(e),
                "time": time.time()
            })
            return {
                "success": False,
                "response": "抱歉，系统遇到了一些问题。请稍后重试，或联系客服。",
                "error": str(e)
            }

    def _understand_intent(self, user_input: str) -> str:
        """理解用户意图"""
        try:
            response = self._call_llm([
                {"role": "system", "content": "将用户输入分类为：math/api/general。只回复分类名。"},
                {"role": "user", "content": user_input}
            ])
            return response.strip().lower()
        except Exception:
            return "general"  # 分类失败时的降级

    def _execute_with_fallback(self, intent: str, user_input: str) -> dict:
        """执行操作（带降级策略）"""
        if intent == "math":
            result = safe_calculator(user_input)
            if result.success:
                return {"type": "math", "data": result.data, "fallback_used": False}
            else:
                # 降级：让 LLM 直接回答
                return {
                    "type": "llm_fallback",
                    "data": f"计算失败（{result.error}），尝试直接理解...",
                    "fallback_used": True
                }

        elif intent == "api":
            result = safe_api_call("https://api.example.com/data")
            return {
                "type": "api",
                "data": result.data,
                "fallback_used": result.fallback_used
            }

        else:
            return {"type": "general", "data": None, "fallback_used": False}

    def _generate_response(self, user_input: str, context: dict) -> str:
        """生成回复"""
        system_prompt = f"""你是一个有用的助手。
当前执行结果：{json.dumps(context, ensure_ascii=False)}
请根据以上信息回答用户问题。如果使用了降级策略，请自然地融入回答。"""

        return self._call_llm([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ])

    def get_error_stats(self) -> dict:
        """获取错误统计"""
        return {
            "total_errors": len(self.error_log),
            "recent_errors": self.error_log[-5:] if self.error_log else []
        }


# ========== 测试 ==========

agent = ResilientAgent()

test_cases = [
    "请计算 100 / 0",           # 除零错误
    "123 + 456 * 789",           # 正常计算
    "你好，今天天气怎么样？",     # 一般对话
]

for msg in test_cases:
    print(f"\n{'='*50}")
    print(f"用户：{msg}")
    result = agent.chat(msg)
    print(f"助手：{result['response'][:100]}")
    if result.get("fallback_used"):
        print("⚠️ 使用了降级策略")

print(f"\n错误统计：{agent.get_error_stats()}")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| 重试次数过多 | 调整 `max_retries` 和 `base_delay` |
| 降级回复不自然 | 优化降级时的 system prompt |
| 错误日志太多 | 添加日志轮转和清理机制 |
| 超时设置不合理 | 根据 API 响应时间调整 timeout |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Retry with Backoff | 指数退避重试 | 等一会儿再试 |
| Fallback/降级 | 失败时使用替代方案 | 备用方案 |
| Circuit Breaker | 熔断器，连续失败时停止调用 | 保险丝 |
| Error Recovery | 错误后恢复到正常状态 | 系统自愈 |

### ✅ 验收清单
- [ ] LLM 调用有重试机制
- [ ] 工具调用有异常处理
- [ ] 降级策略能正常工作
- [ ] Agent 在异常时不会崩溃

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Week 7 结束！下周将学习通信协议（MCP、A2A）和多 Agent 协作，让 Agent 之间能互相沟通。

---

## 📚 本周总结

| Day | 主题 | 核心技能 |
|-----|------|---------|
| 1 | 上下文窗口管理 | Token 计算、滑动窗口、摘要压缩 |
| 2 | MemGPT 三层记忆 | Core Memory、Archival Memory、Recall Memory |
| 3 | 记忆系统实战 | LangGraph + 三层记忆的完整实现 |
| 4 | Agent Persona | 角色设计、说话风格、行为边界 |
| 5 | 错误处理与容错 | 重试机制、降级策略、异常恢复 |

### 🎯 本周产出
- [x] 上下文窗口管理器
- [x] MemGPT 三层记忆系统
- [x] 可配置的 Persona 系统
- [x] 带容错的 Resilient Agent

### 📖 推荐阅读
- [MemGPT Paper](https://arxiv.org/abs/2310.08560)
- [LangChain Memory Guide](https://python.langchain.com/docs/modules/memory/)
- [上下文工程最佳实践](https://www.anthropic.com/research/building-effective-agents)
