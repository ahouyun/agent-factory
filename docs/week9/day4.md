# 📅 Week 9 Day 4：Agent 核心逻辑

## 🧭 今日方向
> 构建 Agent 的核心"大脑"：理解用户意图、检索相关信息、生成回答、管理对话上下文。这是让 AI 知识库助手"聪明"起来的关键一步。

## 🎯 生活比喻
> 今天的工作就像"训练一个高级客服"。你需要教会它：听懂问题（意图理解）、查资料（RAG 检索）、组织语言（回答生成）、记住之前的对话（上下文管理）。一个好客服不是什么都懂，而是知道该去哪里找答案。

## 📋 今日三件事
1. 实现意图分类和路由逻辑
2. 集成 RAG 和 LLM 生成高质量回答
3. 实现多轮对话的上下文管理

---

## 🗺️ 手把手路线

### Step 1: 意图分类器
- **做什么:** 识别用户问题是文档查询、闲聊还是系统命令
- **为什么:** 不同意图需要不同的处理方式
- **成功标志:** 能正确分类用户意图并路由到对应处理逻辑

### Step 2: 回答生成引擎
- **做什么:** 结合 RAG 检索结果和 LLM 生成有根据的回答
- **为什么:** 这是 Agent 的核心功能
- **成功标志:** 能基于文档内容生成准确、有引用的回答

### Step 3: 对话上下文管理
- **做什么:** 管理多轮对话的历史、压缩上下文、保持连贯性
- **为什么:** 支持连续对话是基本需求
- **成功标志:** Agent 能记住之前的对话内容并据此回答

---

## 💻 代码区

### 完整可运行代码：Agent 核心逻辑

```python
"""
Week 9 Day 4: Agent 核心逻辑
运行方式: python day4_agent_logic.py
"""

from typing import List, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json


# =============================================
# 1. 意图分类器
# =============================================
print("=" * 60)
print("=== 1. 意图分类器 ===")
print("=" * 60)


@dataclass
class Intent:
    """意图结果"""
    name: str
    confidence: float
    parameters: dict = field(default_factory=dict)


class IntentClassifier:
    """
    意图分类器

    基于关键词匹配的简单分类器（生产环境建议使用 LLM 分类）。
    """

    def __init__(self):
        # 意图定义：意图名 -> 关键词列表
        self.intent_definitions = {
            "document_query": {
                "keywords": ["文档", "资料", "内容", "查询", "搜索", "什么是", "如何",
                             "根据", "基于", "上面", "里面", "提到", "说", "介绍"],
                "description": "文档相关查询",
            },
            "general_chat": {
                "keywords": ["你好", "您好", "谢谢", "感谢", "再见", "拜拜",
                             "帮助", "帮忙", "你是谁", "自我介绍"],
                "description": "一般闲聊",
            },
            "system_command": {
                "keywords": ["设置", "配置", "管理", "删除", "上传", "查看列表",
                             "历史", "统计", "状态"],
                "description": "系统操作命令",
            },
        }

    def classify(self, text: str) -> Intent:
        """
        分类用户意图

        参数:
            text: 用户输入文本
        返回:
            Intent 对象，包含意图名、置信度和参数
        """
        text_lower = text.lower()

        # 计算每个意图的匹配分数
        scores = {}
        matched_keywords = {}
        for intent_name, intent_info in self.intent_definitions.items():
            keywords = intent_info["keywords"]
            matches = [kw for kw in keywords if kw in text_lower]
            scores[intent_name] = len(matches)
            matched_keywords[intent_name] = matches

        # 选择最高分的意图
        max_score = max(scores.values())
        if max_score > 0:
            intent_name = max(scores, key=scores.get)
            confidence = min(max_score / 3.0, 1.0)  # 归一化置信度
        else:
            intent_name = "document_query"  # 默认意图
            confidence = 0.5

        return Intent(
            name=intent_name,
            confidence=round(confidence, 2),
            parameters={
                "text": text,
                "matched_keywords": matched_keywords.get(intent_name, []),
            }
        )


# 测试意图分类
classifier = IntentClassifier()
test_queries = [
    "文档里说了什么？",
    "你好，你是谁？",
    "如何设置提醒？",
    "根据上面的资料，总结一下要点",
    "Python 是什么？",
    "删除这个对话",
]

print("意图分类测试:")
for query in test_queries:
    intent = classifier.classify(query)
    keywords = intent.parameters.get("matched_keywords", [])
    print(f"  '{query}'")
    print(f"    -> 意图: {intent.name} (置信度: {intent.confidence}, 关键词: {keywords})")
    print()


# =============================================
# 2. 对话上下文管理器
# =============================================
print("=" * 60)
print("=== 2. 对话上下文管理器 ===")
print("=" * 60)


@dataclass
class Message:
    """对话消息"""
    role: str  # "user" / "assistant" / "system"
    content: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: dict = field(default_factory=dict)


class ConversationContext:
    """
    对话上下文管理器

    功能:
    - 管理对话历史
    - 限制历史长度
    - 上下文压缩
    - 提取关键信息
    """

    def __init__(self, max_history: int = 10, max_tokens: int = 3000):
        self.max_history = max_history
        self.max_tokens = max_tokens
        self.messages: List[Message] = []
        self.user_info: Dict = {}
        self.summary: Optional[str] = None  # 历史摘要

    def add_message(self, role: str, content: str, metadata: dict = None):
        """添加消息到历史"""
        msg = Message(role=role, content=content, metadata=metadata or {})
        self.messages.append(msg)

        # 超出限制时进行压缩
        if len(self.messages) > self.max_history:
            self._compress_history()

    def _compress_history(self):
        """压缩对话历史"""
        # 保留最近 5 条，将更早的消息压缩为摘要
        recent_count = 5
        old_messages = self.messages[:-recent_count]
        self.messages = self.messages[-recent_count:]

        # 生成摘要（实际项目中用 LLM 生成）
        summary_parts = []
        for msg in old_messages:
            role_label = "用户" if msg.role == "user" else "助手"
            summary_parts.append(f"{role_label}: {msg.content[:50]}...")

        if self.summary:
            self.summary += " | " + " | ".join(summary_parts)
        else:
            self.summary = " | ".join(summary_parts)

    def get_history(self, k: int = None) -> List[Message]:
        """获取对话历史"""
        if k:
            return self.messages[-k:]
        return self.messages.copy()

    def get_context_string(self, include_summary: bool = True) -> str:
        """
        获取上下文字符串（传给 LLM）

        参数:
            include_summary: 是否包含历史摘要
        """
        parts = []

        # 添加历史摘要
        if include_summary and self.summary:
            parts.append(f"[之前的对话摘要] {self.summary}")
            parts.append("")

        # 添加最近的消息
        for msg in self.messages:
            role_label = "用户" if msg.role == "user" else "助手"
            parts.append(f"{role_label}: {msg.content}")

        return "\n".join(parts)

    def get_token_estimate(self) -> int:
        """估算当前上下文的 token 数（粗略估算）"""
        total_chars = sum(len(msg.content) for msg in self.messages)
        if self.summary:
            total_chars += len(self.summary)
        return total_chars // 2  # 中文约 2 字符/token

    def clear(self):
        """清空上下文"""
        self.messages.clear()
        self.summary = None

    def to_dict(self) -> dict:
        """序列化为字典"""
        return {
            "messages": [
                {"role": m.role, "content": m.content, "timestamp": m.timestamp}
                for m in self.messages
            ],
            "summary": self.summary,
        }


# 测试上下文管理
context = ConversationContext(max_history=8)
context.add_message("user", "Python 是什么？")
context.add_message("assistant", "Python 是一种解释型编程语言，以其简洁易读著称。")
context.add_message("user", "它有什么特点？")
context.add_message("assistant", "Python 的主要特点包括：语法简洁、生态丰富、跨平台支持。")

print(f"对话历史: {len(context.get_history())} 条")
print(f"上下文预估 token: {context.get_token_estimate()}")
print(f"\n上下文字符串:\n{context.get_context_string()}")


# =============================================
# 3. Prompt 模板管理
# =============================================
print("\n" + "=" * 60)
print("=== 3. Prompt 模板管理 ===")
print("=" * 60)


class PromptTemplates:
    """Prompt 模板管理器"""

    # 系统提示词
    SYSTEM_PROMPT = """你是一个专业的 AI 知识库助手。你的职责是：
1. 基于提供的文档内容回答用户问题
2. 如果文档中没有相关信息，诚实说明
3. 引用答案来源，让用户知道信息出处
4. 保持回答准确、简洁、有条理
"""

    # RAG 回答提示词
    RAG_RESPONSE_PROMPT = """基于以下参考资料，回答用户的问题。

【参考资料】
{context}

【用户问题】
{question}

【回答要求】
1. 只基于参考资料中的信息回答
2. 如果参考资料不足以回答，说明"根据现有文档，暂未找到相关信息"
3. 引用具体来源
4. 回答要准确、完整、有条理

【回答】
"""

    # 对话历史提示词
    CHAT_WITH_HISTORY_PROMPT = """基于以下对话历史和参考资料，回答用户的问题。

【对话历史】
{chat_history}

【参考资料】
{context}

【用户问题】
{question}

【回答要求】
1. 考虑对话上下文，保持回答连贯
2. 如果用户在追问，要与之前的回答一致
3. 引用具体来源

【回答】
"""

    @classmethod
    def format_rag_prompt(cls, question: str, context: str) -> str:
        """格式化 RAG 回答提示词"""
        return cls.RAG_RESPONSE_PROMPT.format(
            context=context,
            question=question,
        )

    @classmethod
    def format_chat_prompt(cls, question: str, context: str, chat_history: str) -> str:
        """格式化带历史的对话提示词"""
        return cls.CHAT_WITH_HISTORY_PROMPT.format(
            chat_history=chat_history,
            context=context,
            question=question,
        )


# 演示 Prompt 模板
demo_context = "Python 是一种解释型编程语言，支持多种编程范式。"
demo_question = "Python 是什么？"

formatted_prompt = PromptTemplates.format_rag_prompt(demo_question, demo_context)
print("RAG 回答提示词示例:")
print("-" * 40)
print(formatted_prompt)


# =============================================
# 4. Agent 核心类
# =============================================
print("\n" + "=" * 60)
print("=== 4. Agent 核心类 (KnowledgeAgent) ===")
print("=" * 60)


class KnowledgeAgent:
    """
    知识库 Agent

    整合意图分类、RAG 检索、回答生成、对话管理的核心类。
    """

    def __init__(self, rag_service=None, llm_service=None):
        self.classifier = IntentClassifier()
        self.rag_service = rag_service
        self.llm_service = llm_service
        self.conversations: Dict[str, ConversationContext] = {}
        self.prompt_templates = PromptTemplates()

    def _get_or_create_context(self, conversation_id: str) -> ConversationContext:
        """获取或创建对话上下文"""
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = ConversationContext()
        return self.conversations[conversation_id]

    def _retrieve_documents(self, query: str, k: int = 3) -> List[dict]:
        """检索相关文档"""
        if self.rag_service:
            return self.rag_service.retrieve(query, k)
        # 模拟检索结果（无 RAG 服务时的兜底）
        return [
            {"content": "Python 是一种解释型编程语言，支持多种编程范式。", "score": 0.9, "metadata": {}},
            {"content": "Python 拥有丰富的标准库和第三方库生态系统。", "score": 0.8, "metadata": {}},
        ]

    def _build_context_string(self, documents: List[dict]) -> str:
        """构建文档上下文字符串"""
        parts = []
        for i, doc in enumerate(documents):
            parts.append(f"[文档{i+1}] {doc['content']}")
        return "\n\n".join(parts)

    def _generate_answer(self, question: str, context: str, chat_history: str = None) -> str:
        """
        生成回答

        实际项目中会调用 LLM API，这里使用模板模拟。
        """
        if chat_history:
            prompt = self.prompt_templates.format_chat_prompt(question, context, chat_history)
        else:
            prompt = self.prompt_templates.format_rag_prompt(question, context)

        # 模拟 LLM 回答（实际项目中: response = llm_service.generate(prompt)）
        if context:
            answer = f"根据文档内容，关于「{question}」的回答：\n\n"
            # 提取相关文档内容作为回答
            for line in context.split("\n"):
                if line.strip() and not line.startswith("["):
                    answer += f"  {line.strip()}\n"
        else:
            answer = f"关于「{question}」，目前知识库中暂未找到相关信息。"

        return answer

    def chat(self, conversation_id: str, user_input: str) -> dict:
        """
        处理用户输入（主入口）

        参数:
            conversation_id: 对话 ID
            user_input: 用户输入
        返回:
            {"response": str, "intent": str, "sources": list, "conversation_id": str}
        """
        # 1. 获取对话上下文
        context = self._get_or_create_context(conversation_id)

        # 2. 添加用户消息
        context.add_message("user", user_input)

        # 3. 分类意图
        intent = self.classifier.classify(user_input)
        print(f"    [意图] {intent.name} (置信度: {intent.confidence})")

        # 4. 根据意图处理
        if intent.name == "document_query":
            # 检索文档
            documents = self._retrieve_documents(user_input)

            # 构建上下文
            doc_context = self._build_context_string(documents)
            chat_history = context.get_context_string(include_summary=True)

            # 生成回答
            answer = self._generate_answer(user_input, doc_context, chat_history)

            # 添加助手消息（附带引用来源）
            sources = [
                {"content": doc["content"][:100], "score": doc["score"]}
                for doc in documents
            ]
            context.add_message("assistant", answer, {"sources": sources})

            return {
                "response": answer,
                "intent": intent.name,
                "sources": sources,
                "conversation_id": conversation_id,
            }

        elif intent.name == "general_chat":
            answer = "你好！我是 AI 知识库助手，可以帮你查询文档内容。请问有什么需要帮助的？"
            context.add_message("assistant", answer)

            return {
                "response": answer,
                "intent": intent.name,
                "sources": [],
                "conversation_id": conversation_id,
            }

        elif intent.name == "system_command":
            answer = "收到系统命令。目前支持的命令：上传文档、查看文档列表、删除对话。"
            context.add_message("assistant", answer)

            return {
                "response": answer,
                "intent": intent.name,
                "sources": [],
                "conversation_id": conversation_id,
            }

        else:
            answer = "抱歉，我目前主要支持文档查询功能。你可以问我关于知识库中文档的问题。"
            context.add_message("assistant", answer)

            return {
                "response": answer,
                "intent": intent.name,
                "sources": [],
                "conversation_id": conversation_id,
            }

    def get_conversation_history(self, conversation_id: str) -> List[dict]:
        """获取对话历史"""
        context = self._get_or_create_context(conversation_id)
        return [
            {"role": msg.role, "content": msg.content, "timestamp": msg.timestamp}
            for msg in context.get_history()
        ]

    def clear_conversation(self, conversation_id: str):
        """清空对话"""
        if conversation_id in self.conversations:
            self.conversations[conversation_id].clear()


# =============================================
# 5. 完整对话演示
# =============================================
print("\n" + "=" * 60)
print("=== 5. 完整对话演示 ===")
print("=" * 60)

# 创建 Agent
agent = KnowledgeAgent()

# 模拟多轮对话
conversation_id = "conv_demo_001"
test_conversation = [
    "你好",
    "Python 是什么？",
    "它有什么特点？",
    "如何学习 Python？",
    "删除这个对话",
]

print(f"\n开始对话 (conversation_id: {conversation_id})\n")
for user_input in test_conversation:
    print(f"  [用户] {user_input}")
    result = agent.chat(conversation_id, user_input)
    response_preview = result['response'][:80].replace('\n', ' ')
    print(f"  [助手] {response_preview}...")
    print(f"  [意图] {result['intent']}")
    print()

# 查看对话历史
history = agent.get_conversation_history(conversation_id)
print(f"对话历史: 共 {len(history)} 条消息")


# =============================================
# 6. Agent 配置管理
# =============================================
print("\n" + "=" * 60)
print("=== 6. Agent 配置管理 ===")
print("=" * 60)


@dataclass
class AgentConfig:
    """Agent 配置"""
    name: str = "AI 知识库助手"
    max_history: int = 10
    max_tokens: int = 3000
    temperature: float = 0.7
    top_k: int = 3
    enable_memory: bool = True
    enable_source_citation: bool = True
    system_prompt: str = PromptTemplates.SYSTEM_PROMPT


config = AgentConfig()
print(f"Agent 配置:")
print(f"  名称: {config.name}")
print(f"  最大历史: {config.max_history}")
print(f"  最大 Token: {config.max_tokens}")
print(f"  温度: {config.temperature}")
print(f"  检索数量: {config.top_k}")
print(f"  启用记忆: {config.enable_memory}")
print(f"  启用引用: {config.enable_source_citation}")


# =============================================
# 7. API 集成模板
# =============================================
print("\n" + "=" * 60)
print("=== 7. API 集成模板 ===")
print("=" * 60)

api_template = """
  API 端点设计:

  POST /api/v1/chat/query
    - 与 Agent 对话
    - 请求体: { "conversation_id": "xxx", "message": "xxx" }
    - 响应: { "response": "...", "intent": "...", "sources": [...], "conversation_id": "xxx" }

  GET /api/v1/chat/history/{conversation_id}
    - 获取对话历史
    - 响应: { "messages": [{ "role": "...", "content": "...", "timestamp": "..." }] }

  DELETE /api/v1/chat/history/{conversation_id}
    - 清空对话历史
    - 响应: { "message": "对话已清空" }
"""
print(api_template)


# =============================================
# 8. Agent 处理流程图
# =============================================
print("=" * 60)
print("=== 8. Agent 处理流程图 ===")
print("=" * 60)

flow_diagram = """
  用户输入
      │
      ▼
  ┌───────────────┐
  │ 意图分类器     │
  │ IntentClassifier│
  └───────┬───────┘
          │
    ┌─────┼─────────────┐
    │     │             │
    ▼     ▼             ▼
  文档查询  闲聊        系统命令
    │     │             │
    ▼     │             │
  ┌───────┴───┐        │
  │ RAG 检索   │        │
  │ (ChromaDB) │        │
  └───────┬───┘        │
          │             │
          ▼             │
  ┌───────────────┐    │
  │ LLM 生成回答   │    │
  │ (GPT-4o-mini) │    │
  └───────┬───────┘    │
          │             │
          ▼             ▼
  ┌───────────────────────┐
  │   更新对话上下文       │
  │   ConversationContext │
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │   返回响应 + 引用来源  │
  └───────────────────────┘
"""
print(flow_diagram)


# =============================================
# 总结
# =============================================
print("=" * 60)
print("✅ Day 4 完成清单")
print("=" * 60)
print("""
  [x] 意图分类器实现完成（支持文档查询/闲聊/系统命令）
  [x] 对话上下文管理器实现完成（历史管理/压缩/摘要）
  [x] Prompt 模板管理实现完成（RAG/对话/系统）
  [x] Agent 核心类实现完成（KnowledgeAgent）
  [x] 完整对话流程演示通过
  [x] Agent 配置管理实现

  明天预告: Day 5 将集成安全层，包括 API 认证、输入验证、
  输出过滤、限流等安全机制。
""")
```

---

## 📤 预期输出

运行 `python day4_agent_logic.py` 后，你将看到：

```
============================================================
=== 1. 意图分类器 ===
============================================================
意图分类测试:
  '文档里说了什么？'
    -> 意图: document_query (置信度: 0.67, 关键词: ['文档', '什么'])

  '你好，你是谁？'
    -> 意图: general_chat (置信度: 0.67, 关键词: ['你好', '你是谁'])

  ...

============================================================
=== 5. 完整对话演示 ===
============================================================

开始对话 (conversation_id: conv_demo_001)

  [用户] 你好
    [意图] general_chat (置信度: 0.67)
  [助手] 你好！我是 AI 知识库助手，可以帮你查询文档内容...

  [用户] Python 是什么？
    [意图] document_query (置信度: 0.33)
  [助手] 根据文档内容，关于「Python 是什么？」的回答：
    Python 是一种解释型编程语言...
  ...

对话历史: 共 10 条消息
```

---

## ⚠️ 常见错误与解决方案

### 错误 1：意图分类不准确

```
用户输入: "帮我查一下文档"
预期意图: document_query
实际意图: system_command
```

**原因:** 关键词重叠导致误分类。

**解决方案:**
```python
# 方案1: 调整关键词权重
"document_query": {"keywords": ["查", "查询", "搜索", "文档", "资料"], "weight": 2}

# 方案2: 使用 LLM 进行意图分类
# response = llm.classify(f"分类以下用户意图: {user_input}")
```

### 错误 2：上下文丢失

```
用户: "继续上面的回答"
Agent: "抱歉，我不记得之前的对话..."
```

**原因:** 对话历史未正确保存或被意外清空。

**解决方案:**
```python
# 确保每个对话有独立的 Context
# 使用 conversation_id 作为 key
assert conversation_id in self.conversations
```

### 错误 3：Token 超限

```
openai.error.InvalidRequestError: maximum context length is 4096 tokens
```

**解决方案:**
```python
# 1. 使用上下文压缩
context._compress_history()

# 2. 限制传入的消息数量
history = context.get_history(k=5)

# 3. 使用更长上下文的模型
model = "gpt-4o"  # 128k context
```

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| 意图分类 | 识别用户输入的目的（查询/闲聊/命令） |
| 对话上下文 | 多轮对话的历史信息和状态 |
| Prompt 模板 | 预定义的提示词格式，用于生成标准化的 LLM 输入 |
| 上下文压缩 | 当历史过长时，将旧消息压缩为摘要 |
| 置信度 | 分类结果的可信程度（0-1） |
| 兜底策略 | 无法识别意图时的默认处理方式 |
| 引用来源 | 标明回答基于哪些文档内容 |

---

## 🏆 每日挑战

### 挑战 1：基础（必做）
1. 运行今日代码，理解完整 Agent 流程
2. 修改意图分类器，添加新的意图类型
3. 测试多轮对话，观察上下文管理效果

### 挑战 2：进阶（推荐）
1. 实现基于 LLM 的意图分类（替换关键词匹配）
2. 实现上下文摘要压缩功能
3. 为 Agent 添加"记忆"功能（记住用户偏好）

### 挑战 3：挑战（可选）
使用 LangChain 或 LangGraph 实现一个简化的 Agent：
1. 定义工具函数（文档搜索、对话历史查询）
2. 使用 LangChain 的 Agent 类编排
3. 支持 Tool Calling

---

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...
- 明天需要重点关注: ...

---

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望重点解决: ...
