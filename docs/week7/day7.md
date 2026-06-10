# 📅 Week 7 Day 7：复盘

## 🧭 今日方向
> 回顾 Week 7（Context + Memory）的全部内容，梳理知识脉络，查漏补缺，为 Week 8 做好准备。

## 🎯 生活比喻
> 复盘就像"整理工具箱"。Week 7 学了很多"工具"（上下文管理、记忆系统、Persona 设计等），今天要把它们分类整理好，贴上标签，方便下周随时取用。

## 📋 今日三件事
1. 回顾 Week 7 六天的核心知识点
2. 完成综合练习：构建带记忆的智能 Agent
3. 整理代码片段和笔记

## 🗺️ 手把手路线

### Step 1: 知识回顾
- 做什么: 用思维导图整理 Week 7 的知识脉络
- 为什么: 系统化记忆更有效
- 成功标志: 能画出完整的知识图谱

### Step 2: 综合练习
- 做什么: 构建一个带完整记忆系统的 Agent
- 为什么: 综合练习检验真实掌握程度
- 成功标志: 完整项目能跑通

### Step 3: 笔记整理
- 做什么: 整理代码片段和最佳实践
- 为什么: 好的笔记是未来的加速器
- 成功标志: 有一个可复用的参考文档

## 💻 代码区

```python
"""
Week 7 Day 7: 综合练习 - 带记忆的智能 Agent
综合 Week 7 所学：上下文管理 + 记忆系统 + Persona + 错误处理
"""

from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
import json
import time
from datetime import datetime

# ========== 1. 初始化组件 ==========
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
embeddings = OpenAIEmbeddings()

# ========== 2. 记忆系统 ==========
class MemorySystem:
    """完整的记忆系统"""

    def __init__(self):
        self.core = {
            "persona": "我是一个智能助手",
            "user_profile": {},
            "preferences": {}
        }
        self.vectorstore = Chroma(
            collection_name="agent_memory",
            embedding_function=embeddings
        )
        self.conversation_buffer = []
        self.max_buffer = 20

    def add_message(self, role: str, content: str):
        """添加消息到所有记忆"""
        self.conversation_buffer.append({"role": role, "content": content})
        if len(self.conversation_buffer) > self.max_buffer:
            self.conversation_buffer = self.conversation_buffer[-self.max_buffer:]

        # 添加到向量存储
        self.vectorstore.add_texts(
            texts=[content],
            metadatas=[{"role": role, "timestamp": datetime.now().isoformat()}]
        )

    def search(self, query: str, k: int = 3) -> List[str]:
        """搜索相关记忆"""
        results = self.vectorstore.similarity_search(query, k=k)
        return [doc.page_content for doc in results]

    def get_context(self) -> str:
        """获取对话上下文"""
        parts = []
        for msg in self.conversation_buffer[-10:]:
            role = "用户" if msg["role"] == "user" else "助手"
            parts.append(f"{role}: {msg['content']}")
        return "\n".join(parts)

memory = MemorySystem()

# ========== 3. 工具定义 ==========
@tool
def search_knowledge(query: str) -> str:
    """搜索知识库"""
    docs = memory.search(query)
    return "\n".join(docs) if docs else "未找到相关信息"

# ========== 4. Agent 状态 ==========
class AgentState(TypedDict):
    messages: List[dict]
    user_input: str
    context: str
    response: str
    iteration: int
    is_complete: bool

# ========== 5. 工作流节点 ==========
def init_node(state: AgentState):
    """初始化"""
    return {"iteration": 0, "is_complete": False, "context": ""}

def retrieve_context(state: AgentState):
    """检索上下文"""
    query = state["user_input"]
    context_parts = []

    # 从记忆中检索
    memory_results = memory.search(query)
    if memory_results:
        context_parts.append("相关记忆:\n" + "\n".join(memory_results))

    # 对话历史
    conv_context = memory.get_context()
    if conv_context:
        context_parts.append("对话历史:\n" + conv_context)

    return {"context": "\n\n".join(context_parts)}

def agent_think(state: AgentState):
    """Agent 思考"""
    context = state["context"]
    user_input = state["user_input"]

    system_msg = SystemMessage(content=f"""你是一个智能助手。

{context}

请根据用户的问题和上下文回答。保持友好、专业的态度。""")

    messages = [system_msg, HumanMessage(content=user_input)]
    response = llm.invoke(messages)

    # 记录到记忆
    memory.add_message("user", user_input)
    memory.add_message("assistant", response.content)

    return {
        "messages": state["messages"] + [
            {"role": "user", "content": user_input},
            {"role": "assistant", "content": response.content}
        ],
        "response": response.content,
        "is_complete": True,
        "iteration": state.get("iteration", 0) + 1
    }

# ========== 6. 构建工作流 ==========
workflow = StateGraph(AgentState)

workflow.add_node("init", init_node)
workflow.add_node("retrieve", retrieve_context)
workflow.add_node("think", agent_think)

workflow.set_entry_point("init")
workflow.add_edge("init", "retrieve")
workflow.add_edge("retrieve", "think")
workflow.add_edge("think", END)

app = workflow.compile(checkpointer=MemorySaver())

# ========== 7. 测试 ==========
print("=== 带记忆的智能 Agent ===")

config = {"configurable": {"thread_id": "week7_demo"}}

# 模拟多轮对话
conversations = [
    "你好，我叫张三",
    "我是一名 Python 开发者",
    "我想学习 AI Agent 开发",
    "你能推荐一些学习资源吗？",
    "我之前说过我叫什么？",  # 测试记忆
]

for query in conversations:
    print(f"\n用户: {query}")
    result = app.invoke({
        "messages": [],
        "user_input": query,
        "context": "",
        "response": "",
        "iteration": 0,
        "is_complete": False
    }, config)
    print(f"助手: {result['response'][:150]}...")

# ========== 8. 知识回顾清单 ==========
print("\n=== Week 7 知识回顾 ===")

knowledge_checklist = {
    "Day 1: 上下文工程": [
        "理解 Token 和上下文窗口",
        "能实现滑动窗口策略",
        "能用 LLM 进行摘要压缩",
        "理解 token 预算分配",
    ],
    "Day 2: 记忆架构": [
        "理解三层记忆模型",
        "能实现 Core Memory",
        "能实现 Archival Memory",
        "能实现 Recall Memory",
    ],
    "Day 3: 记忆实现": [
        "能实现对话缓冲记忆",
        "能提取和存储实体记忆",
        "能实现向量记忆",
        "能组合三种记忆机制",
    ],
    "Day 4: Agent Persona": [
        "能设计完整的 Persona 配置",
        "能生成 System Prompt",
        "能实现行为一致性检查",
        "理解不同 Persona 的适用场景",
    ],
    "Day 5: LangGraph 整合": [
        "能设计完整的工作流状态图",
        "能整合所有组件",
        "能实现错误处理",
        "能收集监控指标",
    ],
    "Day 6: 错误处理": [
        "能对错误进行分类",
        "能实现指数退避重试",
        "能设计降级策略",
        "能构建监控告警系统",
    ],
}

for day, items in knowledge_checklist.items():
    print(f"\n{day}:")
    for item in items:
        print(f"  [ ] {item}")

print("""
=== Week 7 核心概念速查 ===

| 概念 | 一句话解释 |
|------|-----------|
| Token | LLM 处理文本的基本单位 |
| 滑动窗口 | 保留最近 N 条对话的策略 |
| 摘要压缩 | 用 LLM 将长对话压缩为摘要 |
| Core Memory | 核心记忆：始终加载的关键信息 |
| Archival Memory | 档案记忆：长期存储的知识 |
| Recall Memory | 回忆记忆：最近的对话历史 |
| Entity Memory | 实体记忆：提取并存储关键实体 |
| Vector Memory | 向量记忆：语义检索历史 |
| Agent Persona | Agent 的角色设定 |
| 一致性检查 | 验证输出是否符合 Persona |
""")

print("""
=== 下周预告 ===
Week 8 将学习:
- MCP（Model Context Protocol）
- A2A + NLWeb 协议
- 多 Agent 架构设计
- Handoff 模式
- CrewAI
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 记忆系统占用内存高 | 清理过期数据，使用磁盘持久化 |
| 2 | 检索结果不相关 | 调整检索参数，增加知识库内容 |
| 3 | Agent 行为不一致 | 检查 Persona 配置和 System Prompt |
| 4 | 工作流报错 | 逐步调试，确保每个节点正常 |

## 📖 Week 7 核心概念速查

| 概念 | 一句话解释 |
|------|-----------|
| 上下文窗口 | LLM 能处理的最大 token 数量 |
| Token 预算 | 为不同类型内容分配的 token 配额 |
| 三层记忆 | Core/Archival/Recall 三层记忆架构 |
| 对话缓冲 | 保留最近 N 条对话的简单策略 |
| 实体记忆 | 提取并存储关键实体 |
| 向量记忆 | 用 Embedding 进行语义检索 |
| Agent Persona | Agent 的角色设定和行为约束 |
| 优雅降级 | 系统故障时仍能提供基本服务 |

## ✅ 验收清单
- [ ] 能完成知识回顾清单中的所有项目
- [ ] 综合练习代码能正常运行
- [ ] 能说出 Week 7 每天的核心知识点
- [ ] 代码片段已整理到个人笔记
- [ ] 对 Week 8 的内容有基本了解

## 📝 复盘小纸条
- 本周最大的收获: ...
- 还不太确定的: ...
- 下周学习重点: ...

## 📥 明日同步接口
- 本周完成度: ...
- 主要卡点: ...
- 代码仓库状态: ...
- 下周期望: ...
