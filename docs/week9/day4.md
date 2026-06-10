# 📅 Week 9 Day 4：Agent 核心逻辑

## 🧭 今日方向
> 实现 Agent 的核心能力：理解用户意图、检索相关信息、生成回答、管理对话上下文。

## 🎯 生活比喻
> 今天的工作就像"训练一个客服"。需要教会它：听懂问题（意图理解）、查资料（RAG 检索）、组织语言（回答生成）、记住对话（上下文管理）。

## 📋 今日三件事
1. 实现意图分类和路由
2. 集成 RAG 和 LLM 生成回答
3. 实现对话上下文管理

## 🗺️ 手把手路线

### Step 1: 意图分类
- 做什么: 识别用户问题是关于文档、闲聊还是其他
- 为什么: 不同意图需要不同的处理方式
- 成功标志: 能正确分类用户意图

### Step 2: 回答生成
- 做什么: 结合 RAG 检索结果和 LLM 生成回答
- 为什么: 这是 Agent 的核心功能
- 成功标志: 能基于文档内容回答问题

### Step 3: 对话管理
- 做什么: 管理多轮对话的上下文
- 为什么: 支持连续对话是基本需求
- 成功标志: Agent 能记住之前的对话

## 💻 代码区

```python
"""
Week 9 Day 4: Agent 核心逻辑
"""

from typing import List, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json

# ========== 1. 意图分类器 ==========
print("=== 1. 意图分类器 ===")

@dataclass
class Intent:
    """意图"""
    name: str
    confidence: float
    parameters: dict = field(default_factory=dict)

class IntentClassifier:
    """意图分类器"""

    def __init__(self):
        self.intents = {
            "document_query": ["文档", "资料", "内容", "查询", "搜索"],
            "general_chat": ["你好", "谢谢", "再见", "帮助"],
            "system_command": ["设置", "配置", "管理"],
        }

    def classify(self, text: str) -> Intent:
        """分类意图"""
        text_lower = text.lower()

        # 简单的关键词匹配（实际可用 LLM）
        scores = {}
        for intent, keywords in self.intents.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            scores[intent] = score

        # 选择最高分的意图
        if max(scores.values()) > 0:
            intent_name = max(scores, key=scores.get)
        else:
            intent_name = "document_query"  # 默认为文档查询

        return Intent(
            name=intent_name,
            confidence=0.8,
            parameters={"text": text}
        )

# 测试意图分类
classifier = IntentClassifier()
test_queries = [
    "文档里说了什么？",
    "你好",
    "如何设置？",
    "Python 是什么？",
]

for query in test_queries:
    intent = classifier.classify(query)
    print(f"  '{query}' → {intent.name} (置信度: {intent.confidence})")

# ========== 2. 对话上下文管理 ==========
print("\n=== 2. 对话上下文管理 ===")

@dataclass
class Message:
    """消息"""
    role: str  # user/assistant
    content: str
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: dict = field(default_factory=dict)

class ConversationContext:
    """对话上下文管理"""

    def __init__(self, max_history: int = 10):
        self.max_history = max_history
        self.messages: List[Message] = []
        self.user_info: Dict = {}

    def add_message(self, role: str, content: str, metadata: dict = None):
        """添加消息"""
        msg = Message(
            role=role,
            content=content,
            metadata=metadata or {}
        )
        self.messages.append(msg)

        # 限制历史长度
        if len(self.messages) > self.max_history:
            self.messages = self.messages[-self.max_history:]

    def get_history(self, k: int = None) -> List[Message]:
        """获取对话历史"""
        if k:
            return self.messages[-k:]
        return self.messages.copy()

    def get_context_string(self) -> str:
        """获取上下文字符串"""
        parts = []
        for msg in self.messages:
            role = "用户" if msg.role == "user" else "助手"
            parts.append(f"{role}: {msg.content}")
        return "\n".join(parts)

    def clear(self):
        """清空上下文"""
        self.messages.clear()

# 测试上下文管理
context = ConversationContext()
context.add_message("user", "Python 是什么？")
context.add_message("assistant", "Python 是一种编程语言。")
context.add_message("user", "它有什么特点？")

print(f"对话历史: {len(context.get_history())} 条")
print(f"上下文:\n{context.get_context_string()}")

# ========== 3. Agent 核心类 ==========
print("\n=== 3. Agent 核心类 ===")

class KnowledgeAgent:
    """知识助手 Agent"""

    def __init__(self, rag_service=None):
        self.classifier = IntentClassifier()
        self.conversations: Dict[str, ConversationContext] = {}
        self.rag_service = rag_service

    def _get_context(self, conversation_id: str) -> ConversationContext:
        """获取对话上下文"""
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = ConversationContext()
        return self.conversations[conversation_id]

    def _retrieve_documents(self, query: str, k: int = 3) -> List[dict]:
        """检索相关文档"""
        if self.rag_service:
            return self.rag_service.retrieve(query, k)
        # 模拟检索结果
        return [
            {"content": "Python 是一种解释型编程语言。", "score": 0.9},
            {"content": "Python 支持多种编程范式。", "score": 0.8},
        ]

    def _generate_answer(self, query: str, context: str, documents: List[dict]) -> str:
        """生成回答"""
        # 实际调用 LLM
        # 这里模拟
        doc_context = "\n".join([d["content"] for d in documents])
        return f"基于文档内容，关于 '{query}' 的回答：\n{doc_context}"

    def chat(self, conversation_id: str, user_input: str) -> dict:
        """处理用户输入"""
        # 获取上下文
        context = self._get_context(conversation_id)

        # 添加用户消息
        context.add_message("user", user_input)

        # 分类意图
        intent = self.classifier.classify(user_input)

        # 根据意图处理
        if intent.name == "document_query":
            # 检索文档
            documents = self._retrieve_documents(user_input)

            # 生成回答
            context_str = context.get_context_string()
            answer = self._generate_answer(user_input, context_str, documents)

            # 添加助手消息
            context.add_message("assistant", answer, {"sources": documents})

            return {
                "response": answer,
                "intent": intent.name,
                "sources": documents
            }

        elif intent.name == "general_chat":
            # 闲聊
            answer = "你好！我是 AI 知识助手，可以帮你查询文档内容。"
            context.add_message("assistant", answer)

            return {
                "response": answer,
                "intent": intent.name,
                "sources": []
            }

        else:
            answer = "抱歉，我目前只支持文档查询功能。"
            context.add_message("assistant", answer)

            return {
                "response": answer,
                "intent": intent.name,
                "sources": []
            }

    def get_conversation_history(self, conversation_id: str) -> List[dict]:
        """获取对话历史"""
        context = self._get_context(conversation_id)
        return [
            {"role": msg.role, "content": msg.content, "timestamp": msg.timestamp.isoformat()}
            for msg in context.get_history()
        ]

# 测试 Agent
agent = KnowledgeAgent()

# 模拟对话
conversation_id = "conv_001"

test_conversation = [
    "你好",
    "Python 是什么？",
    "它有什么特点？",
    "如何学习？",
]

for user_input in test_conversation:
    print(f"\n用户: {user_input}")
    result = agent.chat(conversation_id, user_input)
    print(f"助手: {result['response'][:100]}...")
    print(f"意图: {result['intent']}")

# 查看对话历史
print(f"\n对话历史: {len(agent.get_conversation_history(conversation_id))} 条")

# ========== 4. Agent 配置 ==========
print("\n=== 4. Agent 配置 ===")

@dataclass
class AgentConfig:
    """Agent 配置"""
    name: str = "知识助手"
    max_history: int = 10
    max_tokens: int = 2000
    temperature: float = 0.7
    top_k: int = 3
    enable_memory: bool = True
    system_prompt: str = "你是一个专业的知识助手。"

config = AgentConfig()
print(f"Agent 配置:")
print(f"  名称: {config.name}")
print(f"  最大历史: {config.max_history}")
print(f"  温度: {config.temperature}")
print(f"  检索数量: {config.top_k}")

# ========== 5. API 集成 ==========
print("\n=== 5. API 集成 ===")

print("""
API 端点:

POST /api/agent/chat
  - 与 Agent 对话
  - 请求: { conversation_id, message }
  - 响应: { response, intent, sources }

GET /api/agent/history/{conversation_id}
  - 获取对话历史
  - 响应: [{ role, content, timestamp }]

DELETE /api/agent/history/{conversation_id}
  - 清空对话历史
  - 响应: { message: "已清空" }
""")

# ========== 6. 完整流程 ==========
print("\n=== 6. 完整流程 ===")

print("""
用户输入
    │
    ▼
意图分类
    │
    ├─→ 文档查询 → RAG 检索 → LLM 生成 → 返回回答
    │
    ├─→ 闲聊 → 通用回答 → 返回回答
    │
    └─→ 其他 → 提示信息 → 返回回答
    │
    ▼
更新对话上下文
    │
    ▼
返回响应
""")

print("""
=== Agent 最佳实践 ===

1. 意图分类:
   - 支持多种意图
   - 置信度阈值
   - 兜底策略

2. 上下文管理:
   - 限制历史长度
   - 摘要压缩
   - 关键信息提取

3. 回答生成:
   - 引用来源
   - 不确定时说明
   - 保持一致性

4. 错误处理:
   - 检索失败时的降级
   - LLM 超时处理
   - 友好的错误提示
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 意图分类不准 | 增加关键词，或用 LLM 分类 |
| 2 | 回答不相关 | 优化 RAG 检索，增加知识库 |
| 3 | 上下文丢失 | 检查历史管理逻辑 |
| 4 | 响应太慢 | 缓存检索结果，优化 Prompt |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| 意图分类 | 识别用户输入的目的 |
| 对话上下文 | 多轮对话的历史信息 |
| 回答生成 | 基于检索结果和 LLM 生成回答 |
| 兜底策略 | 无法处理时的默认行为 |
| 置信度 | 分类结果的可信程度 |

## ✅ 验收清单
- [ ] 能实现意图分类
- [ ] 能管理对话上下文
- [ ] 能基于 RAG 生成回答
- [ ] Agent 能进行多轮对话
- [ ] 理解 Agent 的配置选项
- [ ] 能说出 Agent 的最佳实践

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
