# 📅 Week 7 Day 3：记忆实现：对话缓冲 + 实体记忆 + 向量记忆

## 🧭 今日方向
> 深入实现三种具体的记忆机制：对话缓冲（最简单）、实体记忆（记住关键实体）、向量记忆（语义检索）。这些是构建记忆系统的"积木"。

## 🎯 生乐比喻
> 对话缓冲就像"最近通话记录"，实体记忆就像"通讯录"，向量记忆就像"搜索引擎"。三个工具配合使用，Agent 就能"记住"该记住的一切。

## 📋 今日三件事
1. 实现对话缓冲记忆（ConversationBufferMemory）
2. 实现实体记忆（EntityMemory）
3. 实现向量记忆（VectorMemory）

## 🗺️ 手把手路线

### Step 1: 对话缓冲
- 做什么: 实现保留最近 N 条对话的缓冲区
- 为什么: 这是最基础的记忆形式
- 成功标志: 能控制保留的对话条数

### Step 2: 实体记忆
- 做什么: 从对话中提取并记住关键实体（人名、地点、项目等）
- 为什么: Agent 需要"记住"用户提到的关键信息
- 成功标志: 能自动提取并存储实体信息

### Step 3: 向量记忆
- 做什么: 用向量数据库存储和检索历史对话
- 为什么: 语义检索能找到相关的历史信息
- 成功标志: 能根据当前问题检索相关历史

## 💻 代码区

```python
"""
Week 7 Day 3: 记忆实现：对话缓冲 + 实体记忆 + 向量记忆
安装依赖: pip install langchain langchain-openai chromadb
"""

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.messages import HumanMessage, AIMessage
from langchain_community.vectorstores import Chroma
import json
import time
from datetime import datetime
from typing import List, Dict, Optional

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
embeddings = OpenAIEmbeddings()

# ========== 1. 对话缓冲记忆 ==========
print("=== 1. 对话缓冲记忆 ===")

class ConversationBufferMemory:
    """
    对话缓冲记忆：保留最近的对话历史
    """

    def __init__(self, max_messages: int = 20, return_messages: bool = True):
        self.max_messages = max_messages
        self.return_messages = return_messages
        self.messages = []
        self.summary = ""  # 可选：保存摘要

    def add_user_message(self, content: str):
        """添加用户消息"""
        self.messages.append(HumanMessage(content=content))
        self._trim()

    def add_ai_message(self, content: str):
        """添加 AI 消息"""
        self.messages.append(AIMessage(content=content))
        self._trim()

    def _trim(self):
        """修剪超出限制的消息"""
        if len(self.messages) > self.max_messages:
            # 保留最近的消息
            self.messages = self.messages[-self.max_messages:]

    def get_messages(self) -> List:
        """获取消息列表"""
        return self.messages.copy()

    def get_context_string(self) -> str:
        """获取上下文字符串"""
        parts = []
        for msg in self.messages:
            if isinstance(msg, HumanMessage):
                parts.append(f"用户: {msg.content}")
            elif isinstance(msg, AIMessage):
                parts.append(f"助手: {msg.content}")
        return "\n".join(parts)

    def clear(self):
        """清空记忆"""
        self.messages.clear()

    def save_summary(self, summary: str):
        """保存摘要（在消息被修剪前）"""
        self.summary = summary

# 测试对话缓冲
buffer = ConversationBufferMemory(max_messages=10)

# 模拟对话
conversations = [
    ("user", "Python 是什么？"),
    ("assistant", "Python 是一种解释型编程语言。"),
    ("user", "它有什么特点？"),
    ("assistant", "简洁语法、丰富生态、跨平台支持。"),
    ("user", "如何学习？"),
    ("assistant", "建议从基础语法开始。"),
]

for role, content in conversations:
    if role == "user":
        buffer.add_user_message(content)
    else:
        buffer.add_ai_message(content)

print(f"消息数量: {len(buffer.get_messages())}")
print(f"上下文:\n{buffer.get_context_string()}\n")

# ========== 2. 实体记忆 ==========
print("=== 2. 实体记忆 ===")

class EntityMemory:
    """
    实体记忆：提取并记住关键实体
    """

    def __init__(self, llm):
        self.llm = llm
        self.entities = {}  # entity_name -> {attributes}

    def extract_entities(self, text: str) -> List[dict]:
        """从文本中提取实体"""
        prompt = f"""从以下文本中提取关键实体（人名、地名、组织、产品等）。

文本：{text}

请以 JSON 格式返回：
{{
    "entities": [
        {{"name": "实体名", "type": "类型", "attributes": {{"属性": "值"}}}}
    ]
}}"""

        response = self.llm.invoke([HumanMessage(content=prompt)])

        try:
            # 提取 JSON
            content = response.content
            start = content.find("{")
            end = content.rfind("}") + 1
            if start != -1 and end != -1:
                data = json.loads(content[start:end])
                return data.get("entities", [])
        except json.JSONDecodeError:
            pass

        return []

    def update(self, text: str):
        """更新实体记忆"""
        entities = self.extract_entities(text)

        for entity in entities:
            name = entity["name"]
            if name not in self.entities:
                self.entities[name] = {
                    "type": entity.get("type", "unknown"),
                    "attributes": entity.get("attributes", {}),
                    "first_seen": datetime.now().isoformat(),
                    "mentions": 1
                }
            else:
                # 更新属性
                self.entities[name]["attributes"].update(entity.get("attributes", {}))
                self.entities[name]["mentions"] += 1
                self.entities[name]["last_seen"] = datetime.now().isoformat()

    def get_entity(self, name: str) -> Optional[dict]:
        """获取实体信息"""
        return self.entities.get(name)

    def search(self, query: str) -> List[dict]:
        """搜索相关实体"""
        results = []
        query_lower = query.lower()

        for name, data in self.entities.items():
            # 简单的关键词匹配
            if query_lower in name.lower():
                results.append({"name": name, **data})
            else:
                # 检查属性
                for attr_name, attr_value in data.get("attributes", {}).items():
                    if query_lower in str(attr_value).lower():
                        results.append({"name": name, **data})
                        break

        return results

    def to_prompt(self) -> str:
        """转换为 Prompt 格式"""
        if not self.entities:
            return "没有已知的实体信息。"

        parts = ["已知实体信息:"]
        for name, data in self.entities.items():
            attrs = json.dumps(data.get("attributes", {}), ensure_ascii=False)
            parts.append(f"- {name} ({data.get('type', 'unknown')}): {attrs}")

        return "\n".join(parts)

# 测试实体记忆
entity_mem = EntityMemory(llm)

# 更新实体
texts = [
    "张三是我们公司的 Python 开发工程师，负责后端开发。",
    "李四是产品经理，正在开发一个 AI Agent 项目。",
    "张三完成了用户认证模块的开发。",
]

for text in texts:
    print(f"处理: {text[:30]}...")
    entity_mem.update(text)

print(f"\n已知实体:\n{entity_mem.to_prompt()}")

# 搜索实体
print("\n搜索 '张三':")
results = entity_mem.search("张三")
for r in results:
    print(f"  {r['name']}: {r.get('attributes', {})}")

# ========== 3. 向量记忆 ==========
print("\n=== 3. 向量记忆 ===")

class VectorMemory:
    """
    向量记忆：使用向量数据库存储和检索历史
    """

    def __init__(self, collection_name: str = "conversation_memory"):
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma(
            collection_name=collection_name,
            embedding_function=self.embeddings
        )
        self.message_id = 0

    def add(self, role: str, content: str, metadata: dict = None):
        """添加消息"""
        self.message_id += 1

        if metadata is None:
            metadata = {}

        metadata.update({
            "role": role,
            "timestamp": datetime.now().isoformat(),
            "message_id": self.message_id
        })

        self.vectorstore.add_texts(
            texts=[content],
            metadatas=[metadata],
            ids=[f"msg_{self.message_id}"]
        )

    def search(self, query: str, k: int = 5, role_filter: str = None) -> List[dict]:
        """搜索相关消息"""
        kwargs = {"k": k}
        if role_filter:
            kwargs["filter"] = {"role": role_filter}

        results = self.vectorstore.similarity_search_with_score(query, **kwargs)

        memories = []
        for doc, score in results:
            memories.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "relevance_score": 1 - score
            })

        return memories

    def get_context(self, query: str, k: int = 3) -> str:
        """获取相关上下文"""
        memories = self.search(query, k=k)

        if not memories:
            return "没有找到相关的历史对话。"

        parts = ["相关历史对话:"]
        for i, mem in enumerate(memories, 1):
            role = "用户" if mem["metadata"].get("role") == "user" else "助手"
            parts.append(f"{i}. [{role}] {mem['content'][:80]}...")

        return "\n".join(parts)

    def clear(self):
        """清空记忆"""
        self.vectorstore.delete_collection()
        self.vectorstore = Chroma(
            collection_name=self.vectorstore._collection.name,
            embedding_function=self.embeddings
        )

# 测试向量记忆
vector_mem = VectorMemory("test_vector_memory")

# 添加对话
conversations = [
    ("user", "我想学习 Python 数据分析"),
    ("assistant", "建议从 pandas 和 matplotlib 开始"),
    ("user", "pandas 是什么？"),
    ("assistant", "pandas 是 Python 的数据分析库"),
    ("user", "如何安装 pandas？"),
    ("assistant", "使用 pip install pandas 安装"),
    ("user", "Docker 怎么用？"),
    ("assistant", "Docker 用于容器化部署"),
]

for role, content in conversations:
    vector_mem.add(role, content)

# 搜索
print("搜索 'Python 数据分析':")
results = vector_mem.search("Python 数据分析")
for r in results:
    print(f"  [{r['relevance_score']:.2f}] {r['content'][:50]}...")

# 获取上下文
print(f"\n上下文:\n{vector_mem.get_context('如何分析数据')}")

# ========== 4. 组合记忆系统 ==========
print("\n=== 4. 组合记忆系统 ===")

class CombinedMemorySystem:
    """
    组合记忆系统
    整合三种记忆机制
    """

    def __init__(self, llm, max_buffer: int = 20):
        self.buffer = ConversationBufferMemory(max_messages=max_buffer)
        self.entity = EntityMemory(llm)
        self.vector = VectorMemory("combined_memory")

    def add_conversation(self, role: str, content: str):
        """添加对话"""
        # 更新所有记忆
        if role == "user":
            self.buffer.add_user_message(content)
            self.entity.update(content)
        else:
            self.buffer.add_ai_message(content)

        self.vector.add(role, content)

    def get_context(self, query: str) -> dict:
        """获取完整上下文"""
        return {
            "buffer": self.buffer.get_context_string(),
            "entities": self.entity.to_prompt(),
            "vector": self.vector.get_context(query)
        }

    def get_full_prompt(self, query: str) -> str:
        """获取完整 Prompt"""
        context = self.get_context(query)

        parts = [
            "=== 对话历史 ===",
            context["buffer"],
            "\n=== 实体信息 ===",
            context["entities"],
            "\n=== 相关记忆 ===",
            context["vector"],
        ]

        return "\n".join(parts)

# 测试组合记忆系统
combined = CombinedMemorySystem(llm)

# 添加对话
conversations = [
    ("user", "我是王五，正在开发一个聊天机器人"),
    ("assistant", "你好王五！聊天机器人开发是个有趣的项目"),
    ("user", "我使用 Python 和 LangChain"),
    ("assistant", "LangChain 是很好的选择，支持多种 LLM"),
    ("user", "如何添加记忆功能？"),
    ("assistant", "可以使用对话缓冲或向量记忆"),
]

for role, content in conversations:
    combined.add_conversation(role, content)

# 获取上下文
print("完整上下文:")
print(combined.get_full_prompt("如何添加记忆"))

print("""
=== 记忆机制对比 ===

| 机制 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 对话缓冲 | 简单、快速 | 容量有限 | 短对话、实时交互 |
| 实体记忆 | 结构化、精确 | 提取依赖 LLM | 需要记住关键信息 |
| 向量记忆 | 语义检索、容量大 | 检索有延迟 | 长期历史、知识检索 |

最佳实践：
1. 三种机制组合使用
2. 根据场景选择重点
3. 定期清理过期记忆
4. 监控记忆系统的性能
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 实体提取不准 | 在 Prompt 中提供更明确的示例 |
| 2 | 向量检索慢 | 增加 Embedding 缓存，或使用更快的模型 |
| 3 | 对话缓冲丢失信息 | 启用摘要压缩，在修剪前保存摘要 |
| 4 | 内存占用高 | 清理过期数据，使用磁盘持久化 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| ConversationBufferMemory | 对话缓冲：保留最近 N 条对话的简单记忆 |
| EntityMemory | 实体记忆：提取并存储关键实体（人、地、物）|
| VectorMemory | 向量记忆：用 Embedding 存储和语义检索历史 |
| 对话修剪 | 删除超出容量限制的旧对话 |
| 实体提取 | 从文本中自动识别关键实体 |
| 语义检索 | 基于语义相似度搜索相关记忆 |
| 上下文注入 | 将记忆内容注入到 LLM 输入中 |
| 记忆持久化 | 将内存数据保存到磁盘或数据库 |

## ✅ 验收清单
- [ ] 能实现 ConversationBufferMemory
- [ ] 能用 LLM 提取实体并存储
- [ ] 能用向量数据库实现 VectorMemory
- [ ] 能组合三种记忆机制
- [ ] 理解每种机制的优缺点
- [ ] 能根据场景选择合适的记忆策略

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
