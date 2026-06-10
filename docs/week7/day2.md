# 📅 Week 7 Day 2：记忆架构：Core/Archival/Recall 三层模型

## 🧭 今日方向
> 让 Agent 拥有"记忆"：短期记忆（对话上下文）、长期记忆（知识库）、工作记忆（当前任务状态）。今天学习 MemGPT 的三层记忆架构。

## 🧠 记忆类型详解

### 工作记忆（Working Memory）
- 类比：人的工作台，同时处理的信息
- 实现：对话历史的最近 N 条消息
- 特点：容量有限（受上下文窗口限制）

### 情景记忆（Episodic Memory）
- 类比：人的经历回忆，记得"上周二发生的事"
- 实现：带时间戳的事件记录
- 特点：按时间索引，支持"回忆过去"

### 语义记忆（Semantic Memory）
- 类比：人的知识库，记得"Python 是编程语言"
- 实现：向量数据库中的知识条目
- 特点：按语义相似度检索

### 程序记忆（Procedural Memory）
- 类比：人的肌肉记忆，"知道怎么做"
- 实现：Agent 的技能/Skill 注册表
- 特点：存储可执行的操作流程

## 📉 遗忘曲线与记忆衰减

长期记忆需要定期整理，否则会积累大量无用信息：

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| 时间衰减 | 越久的记忆权重越低 | 对话历史 |
| 访问频率 | 经常访问的记忆保留 | 知识库 |
| 重要性评分 | 按重要性排序保留 | 关键事件 |
| 压缩摘要 | 定期将旧记忆压缩为摘要 | 长期对话 |

## 🎯 生活比喻
> 人的记忆有三层：
> - **Core Memory**（核心记忆）= 你的性格和价值观，始终影响你的行为
> - **Archival Memory**（档案记忆）= 你的知识库，需要时可以查阅
> - **Recall Memory**（回忆记忆）= 最近发生的事，可以随时回想

## 📋 今日三件事
1. 理解三层记忆模型的设计思想和各自职责
2. 实现 Core Memory（持久化关键信息）
3. 实现 Archival Memory（向量存储长期知识）

## 🗺️ 手把手路线

### Step 1: 三层记忆架构
- 做什么: 画出三层记忆的架构图和数据流
- 为什么: 理解设计思想才能正确实现
- 成功标志: 能说出三层记忆的区别和关系

### Step 2: Core Memory 实现
- 做什么: 用 JSON 实现持久化的关键信息存储
- 为什么: Core Memory 是 Agent 的"身份"和"偏好"
- 成功标志: 能读写和更新 Core Memory

### Step 3: Archival Memory 实现
- 做什么: 用向量数据库存储长期知识
- 为什么: Archival Memory 是 Agent 的"知识库"
- 成功标志: 能向 Archival Memory 添加和检索知识

## 💻 代码区

```python
"""
Week 7 Day 2: 记忆架构：Core/Archival/Recall 三层模型
安装依赖: pip install langchain chromadb
"""

import json
import time
from datetime import datetime
from typing import Dict, List, Optional
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.schema import Document

embeddings = OpenAIEmbeddings()

# ========== 1. 三层记忆架构概览 ==========
print("=== 1. 三层记忆架构 ===")

print("""
┌─────────────────────────────────────────────────────┐
│                   Memory System                      │
├─────────────────────────────────────────────────────┤
│  Core Memory (核心记忆)                              │
│  - 用户偏好、性格、关键事实                           │
│  - 始终加载到上下文                                   │
│  - 小容量，高优先级                                   │
├─────────────────────────────────────────────────────┤
│  Archival Memory (档案记忆)                          │
│  - 长期知识、文档、历史记录                           │
│  - 按需检索（向量搜索）                               │
│  - 大容量，持久化存储                                 │
├─────────────────────────────────────────────────────┤
│  Recall Memory (回忆记忆)                            │
│  - 最近的对话历史                                     │
│  - 滑动窗口管理                                      │
│  - 中等容量，时间衰减                                 │
└─────────────────────────────────────────────────────┘
""")

# ========== 2. Core Memory ==========
print("=== 2. Core Memory 实现 ===")

class CoreMemory:
    """
    Core Memory: 核心记忆
    存储 Agent 必须始终知道的关键信息
    """

    def __init__(self, agent_name: str = "Assistant"):
        self.agent_name = agent_name
        self.data = {
            "persona": f"我是 {agent_name}，一个 helpful 的助手。",
            "user_profile": {},  # 用户信息
            "preferences": {},   # 用户偏好
            "key_facts": {},     # 关键事实
        }
        self.last_updated = datetime.now()

    def update(self, category: str, key: str, value: str):
        """更新核心记忆"""
        if category in self.data:
            self.data[category][key] = value
            self.last_updated = datetime.now()
            print(f"  [Core] 更新: {category}.{key} = {value}")

    def get(self, category: str = None, key: str = None) -> str:
        """获取核心记忆"""
        if category and key:
            return self.data.get(category, {}).get(key, "")
        elif category:
            return json.dumps(self.data.get(category, {}), ensure_ascii=False)
        else:
            return json.dumps(self.data, ensure_ascii=False)

    def to_prompt(self) -> str:
        """转换为 Prompt 格式"""
        parts = []
        parts.append(f"Agent 名称: {self.agent_name}")
        parts.append(f"角色设定: {self.data['persona']}")

        if self.data["user_profile"]:
            parts.append(f"用户信息: {json.dumps(self.data['user_profile'], ensure_ascii=False)}")

        if self.data["preferences"]:
            parts.append(f"用户偏好: {json.dumps(self.data['preferences'], ensure_ascii=False)}")

        if self.data["key_facts"]:
            parts.append(f"关键事实: {json.dumps(self.data['key_facts'], ensure_ascii=False)}")

        return "\n".join(parts)

    def save(self, filepath: str):
        """保存到文件"""
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
        print(f"  [Core] 已保存到 {filepath}")

    def load(self, filepath: str):
        """从文件加载"""
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                self.data = json.load(f)
            print(f"  [Core] 已从 {filepath} 加载")
        except FileNotFoundError:
            print(f"  [Core] 文件不存在，使用默认值")

# 测试 Core Memory
core = CoreMemory("小智")

# 更新记忆
core.update("user_profile", "name", "张三")
core.update("user_profile", "role", "Python 开发者")
core.update("preferences", "language", "中文")
core.update("preferences", "style", "简洁")
core.update("key_facts", "project", "正在开发 AI Agent 系统")

# 获取记忆
print(f"\n用户信息: {core.get('user_profile')}")
print(f"用户偏好: {core.get('preferences')}")

# 转换为 Prompt
print(f"\nCore Memory Prompt:\n{core.to_prompt()}")

# 保存和加载
core.save("core_memory.json")
core.load("core_memory.json")

# ========== 3. Archival Memory ==========
print("\n=== 3. Archival Memory 实现 ===")

class ArchivalMemory:
    """
    Archival Memory: 档案记忆
    存储长期知识，支持向量检索
    """

    def __init__(self, collection_name: str = "archival_memory"):
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma(
            collection_name=collection_name,
            embedding_function=self.embeddings
        )
        self.metadata_store = {}  # 额外的元数据

    def add(self, content: str, metadata: dict = None) -> str:
        """添加记忆"""
        memory_id = f"mem_{int(time.time() * 1000)}"

        if metadata is None:
            metadata = {}

        metadata["id"] = memory_id
        metadata["timestamp"] = datetime.now().isoformat()

        self.vectorstore.add_texts(
            texts=[content],
            metadatas=[metadata],
            ids=[memory_id]
        )

        self.metadata_store[memory_id] = {
            "content": content,
            "metadata": metadata
        }

        print(f"  [Archival] 添加记忆: {memory_id}")
        return memory_id

    def search(self, query: str, k: int = 3) -> List[dict]:
        """搜索记忆"""
        results = self.vectorstore.similarity_search_with_score(query, k=k)

        memories = []
        for doc, score in results:
            memories.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "relevance_score": 1 - score  # 转换为相关性分数
            })

        return memories

    def get(self, memory_id: str) -> Optional[dict]:
        """获取特定记忆"""
        results = self.vectorstore.get(ids=[memory_id])
        if results["documents"]:
            return {
                "content": results["documents"][0],
                "metadata": results["metadatas"][0]
            }
        return None

    def delete(self, memory_id: str):
        """删除记忆"""
        self.vectorstore.delete(ids=[memory_id])
        print(f"  [Archival] 删除记忆: {memory_id}")

    def to_prompt(self, query: str, k: int = 3) -> str:
        """根据查询获取相关记忆并转换为 Prompt"""
        memories = self.search(query, k=k)

        if not memories:
            return "没有找到相关的档案记忆。"

        parts = ["相关档案记忆:"]
        for i, mem in enumerate(memories, 1):
            parts.append(f"{i}. {mem['content']} (相关度: {mem['relevance_score']:.2f})")

        return "\n".join(parts)

# 测试 Archival Memory
archival = ArchivalMemory("test_archival")

# 添加记忆
archival.add("Python 是一种解释型编程语言，由 Guido van Rossum 于 1991 年发布。", {"topic": "python"})
archival.add("Python 3.12 引入了新的类型参数语法（PEP 695）。", {"topic": "python"})
archival.add("FastAPI 是一个高性能的 Python Web 框架。", {"topic": "fastapi"})
archival.add("Docker 是一种容器化技术，用于打包和部署应用。", {"topic": "docker"})
archival.add("Redis 是一个高性能的内存键值数据库。", {"topic": "redis"})

# 搜索记忆
print("\n搜索 'Python 特性':")
results = archival.search("Python 特性")
for r in results:
    print(f"  [{r['relevance_score']:.2f}] {r['content'][:50]}...")

# 转换为 Prompt
print(f"\nArchival Prompt:\n{archival.to_prompt('Python 是什么')}")

# ========== 4. Recall Memory ==========
print("\n=== 4. Recall Memory 实现 ===")

class RecallMemory:
    """
    Recall Memory: 回忆记忆
    存储最近的对话历史，支持时间衰减
    """

    def __init__(self, max_messages: int = 50, decay_factor: float = 0.95):
        self.max_messages = max_messages
        self.decay_factor = decay_factor
        self.messages = []

    def add(self, role: str, content: str):
        """添加消息"""
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now(),
            "importance": 1.0  # 初始重要性
        })

        # 如果超过最大数量，删除最不重要的消息
        if len(self.messages) > self.max_messages:
            self._prune()

    def _prune(self):
        """修剪不重要的消息"""
        # 应用时间衰减
        now = datetime.now()
        for msg in self.messages:
            age_hours = (now - msg["timestamp"]).total_seconds() / 3600
            msg["importance"] *= (self.decay_factor ** age_hours)

        # 按重要性排序，保留最重要的
        self.messages.sort(key=lambda x: x["importance"], reverse=True)
        self.messages = self.messages[:self.max_messages]

    def search(self, query: str, k: int = 5) -> List[dict]:
        """搜索相关消息（简单关键词匹配）"""
        query_lower = query.lower()
        scored = []

        for msg in self.messages:
            # 简单的相关性计算
            content_lower = msg["content"].lower()
            relevance = sum(1 for word in query_lower.split() if word in content_lower)
            if relevance > 0:
                scored.append({
                    **msg,
                    "relevance": relevance * msg["importance"]
                })

        scored.sort(key=lambda x: x["relevance"], reverse=True)
        return scored[:k]

    def get_recent(self, k: int = 10) -> List[dict]:
        """获取最近的消息"""
        return self.messages[-k:]

    def to_prompt(self, k: int = 10) -> str:
        """获取最近对话转换为 Prompt"""
        recent = self.get_recent(k)

        if not recent:
            return "没有最近的对话记录。"

        parts = ["最近的对话:"]
        for msg in recent:
            role = "用户" if msg["role"] == "user" else "助手"
            parts.append(f"{role}: {msg['content'][:100]}...")

        return "\n".join(parts)

# 测试 Recall Memory
recall = RecallMemory(max_messages=20)

# 添加消息
for i in range(15):
    recall.add("user", f"问题 {i+1}: 关于 Python 的第 {i+1} 个方面")
    recall.add("assistant", f"回答 {i+1}: 这是关于第 {i+1} 个方面的解答。")

print(f"消息数量: {len(recall.messages)}")
print(f"\n最近 5 条消息:")
for msg in recall.get_recent(5):
    print(f"  [{msg['role']}] {msg['content'][:40]}...")

# ========== 5. 统一记忆系统 ==========
print("\n=== 5. 统一记忆系统 ===")

class MemorySystem:
    """
    统一记忆系统
    整合三层记忆，提供统一接口
    """

    def __init__(self, agent_name: str = "Assistant"):
        self.core = CoreMemory(agent_name)
        self.archival = ArchivalMemory(f"{agent_name}_archival")
        self.recall = RecallMemory()

    def process_message(self, role: str, content: str):
        """处理消息，更新记忆"""
        # 添加到 Recall Memory
        self.recall.add(role, content)

        # 检测是否需要更新 Core Memory
        if role == "user":
            self._extract_and_update_core(content)

    def _extract_and_update_core(self, text: str):
        """从文本中提取关键信息更新 Core Memory"""
        # 简单的规则匹配（生产环境可用 LLM 提取）
        if "我叫" in text or "我是" in text:
            # 提取姓名
            name_match = text.split("我叫")[-1].split("，")[0].split("。")[0]
            if name_match:
                self.core.update("user_profile", "name", name_match)

    def query(self, question: str) -> dict:
        """查询记忆系统"""
        # 获取 Core Memory
        core_context = self.core.to_prompt()

        # 获取 Archival Memory
        archival_context = self.archival.to_prompt(question)

        # 获取 Recall Memory
        recall_context = self.recall.to_prompt()

        return {
            "core": core_context,
            "archival": archival_context,
            "recall": recall_context,
            "full_context": f"{core_context}\n\n{archival_context}\n\n{recall_context}"
        }

    def add_knowledge(self, content: str, metadata: dict = None):
        """添加长期知识"""
        self.archival.add(content, metadata)

# 测试统一记忆系统
memory = MemorySystem("小智")

# 添加知识
memory.add_knowledge("用户正在学习 AI Agent 开发", {"topic": "user"})
memory.add_knowledge("项目使用 Python + LangChain", {"topic": "project"})

# 处理对话
memory.process_message("user", "我叫李四，正在学习 Python")
memory.process_message("assistant", "你好李四！很高兴帮助你学习 Python。")

# 查询
result = memory.query("用户是谁？在学什么？")
print(f"\n查询结果:")
print(f"Core: {result['core'][:100]}...")
print(f"Archival: {result['archival'][:100]}...")
print(f"Recall: {result['recall'][:100]}...")

print("""
=== 三层记忆对比 ===

| 层级 | 容量 | 访问方式 | 持久化 | 用途 |
|------|------|----------|--------|------|
| Core | 小 (KB) | 始终加载 | 文件/DB | 用户偏好、关键事实 |
| Archival | 大 (GB) | 向量检索 | 向量DB | 长期知识、文档 |
| Recall | 中 (MB) | 滑动窗口 | 内存 | 最近对话、短期记忆 |
""")
```

## 🔗 OpenAI Agents SDK 的 Sessions & Memory

OpenAI Agents SDK 提供了内置的持久化记忆层，支持跨会话保持工作上下文：

### 支持的后端

| 后端 | 适用场景 | 特点 |
|------|---------|------|
| SQLite | 开发/测试 | 轻量级，无需额外服务 |
| SQLAlchemy | 生产环境 | 支持 PostgreSQL/MySQL |
| Redis | 高性能场景 | 内存级速度 |
| MongoDB | 灵活 schema | 文档型存储 |

### 使用示例

```python
from agents import Agent, Runner
from agents.memory import SQLiteMemory

# 创建带记忆的 Agent
memory = SQLiteMemory(db_path="./agent_memory.db")
agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant with memory.",
    memory=memory
)

# 第一轮对话
result1 = Runner.run_sync(agent, "我叫张三，是程序员")
# 记忆自动保存

# 第二轮对话（跨会话）
result2 = Runner.run_sync(agent, "我叫什么名字？")
# Agent 会记住：你叫张三，是程序员
```

> Sessions & Memory 是 OpenAI Agents SDK 的核心特性之一，适合需要长期交互的 Agent 场景。

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | Core Memory 保存失败 | 检查文件路径和写入权限 |
| 2 | Archival Memory 搜索不准 | 调整 Embedding 模型，或增加文档数量 |
| 3 | Recall Memory 消息过多 | 减小 `max_messages`，或调整 `decay_factor` |
| 4 | 三层记忆不同步 | 确保 `process_message` 更新所有相关层 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Core Memory | 核心记忆：始终加载的关键信息（用户偏好、关键事实）|
| Archival Memory | 档案记忆：长期存储的知识，按需向量检索 |
| Recall Memory | 回忆记忆：最近的对话历史，滑动窗口管理 |
| MemGPT | 提出三层记忆架构的论文 |
| 时间衰减 | 记忆随时间推移重要性降低 |
| 记忆修剪 | 删除不重要的记忆以释放空间 |
| 上下文注入 | 将记忆注入到 LLM 的输入中 |
| 记忆提取 | 从对话中自动提取关键信息 |
| 向量检索 | 使用 Embedding 进行语义搜索 |
| 持久化 | 将内存数据保存到磁盘或数据库 |

## ✅ 验收清单
- [ ] 能说出三层记忆的区别和各自职责
- [ ] 能实现 Core Memory 的读写和持久化
- [ ] 能用向量数据库实现 Archival Memory
- [ ] 能实现带时间衰减的 Recall Memory
- [ ] 能构建统一的记忆系统
- [ ] 理解记忆系统如何与 LLM 集成

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
