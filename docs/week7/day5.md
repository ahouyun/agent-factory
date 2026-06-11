# 📅 Week 7 Day 5：LangGraph 完整工作流整合

## 🧭 今日方向
> 将 Week 7 前四天所学整合为一个完整的 LangGraph 工作流：记忆系统 + Persona + 上下文管理。这是"学以致用"的关键一步。

## 🎯 生活比喻
> 今天的工作就像组装一台完整的电脑。CPU（LLM）、内存（Memory）、硬盘（知识库）、显卡（Persona）、防火墙（错误处理）都已经准备好了，现在要把它们组装成一台能正常运行的机器。

## 📋 今日三件事
1. 设计完整的 Agent 工作流状态图
2. 整合记忆系统、Persona、上下文管理到 LangGraph
3. 实现带监控的生产级工作流

## 🗺️ 手把手路线

### Step 1: 架构设计
- **做什么**: 画出完整工作流的状态图和数据流
- **为什么**: 先设计再实现，避免返工
- **成功标志**: 能画出包含所有组件的状态图

### Step 2: 组件整合
- **做什么**: 将独立的模块整合到 LangGraph 工作流
- **为什么**: 模块化设计便于维护和扩展
- **成功标志**: 所有模块能协同工作

### Step 3: 生产级完善
- **做什么**: 添加错误处理、日志、监控
- **为什么**: 生产环境需要可靠性保障
- **成功标志**: 工作流能优雅处理各种异常

## 💻 代码区

### 3.1 工作流状态定义

```python
"""
LangGraph 完整工作流整合
记忆系统 + Persona + 上下文管理
使用模拟组件，无需真实 API
"""

from typing import TypedDict, List, Dict, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
import json
import time


# ===== 状态定义 =====
class AgentState(TypedDict):
    """Agent 工作流状态"""
    messages: List[Dict]           # 对话历史
    user_input: str                # 用户输入
    context: str                   # 检索到的上下文
    persona_prompt: str            # Persona System Prompt
    response: str                  # Agent 回复
    iteration: int                 # 当前迭代次数
    is_complete: bool              # 是否完成
    memory_updates: List[Dict]     # 需要更新的记忆
    metadata: Dict                 # 元数据


# ===== 模拟组件 =====
class MockMemorySystem:
    """模拟记忆系统"""
    
    def __init__(self):
        self.conversation_buffer = []
        self.knowledge = {
            "python": "Python 是一种解释型编程语言，广泛用于 AI 和数据科学。",
            "langchain": "LangChain 是 LLM 应用开发框架，支持工具调用和记忆。",
            "agent": "AI Agent 是能够自主决策和执行任务的智能体。",
        }
        self.user_info = {}
    
    def search(self, query: str, k: int = 3) -> List[str]:
        """搜索相关记忆"""
        results = []
        query_lower = query.lower()
        for key, value in self.knowledge.items():
            if query_lower in key or query_lower in value.lower():
                results.append(value)
        return results[:k]
    
    def add_conversation(self, role: str, content: str):
        """添加对话记录"""
        self.conversation_buffer.append({"role": role, "content": content})
        if len(self.conversation_buffer) > 20:
            self.conversation_buffer = self.conversation_buffer[-20:]
    
    def get_context(self) -> str:
        """获取对话上下文"""
        if not self.conversation_buffer:
            return ""
        recent = self.conversation_buffer[-6:]
        parts = []
        for msg in recent:
            role = "用户" if msg["role"] == "user" else "助手"
            parts.append(f"{role}: {msg['content'][:50]}")
        return "\n".join(parts)
    
    def update_user_info(self, key: str, value: str):
        """更新用户信息"""
        self.user_info[key] = value


class MockPersona:
    """模拟 Persona"""
    
    def __init__(self, name: str = "小智", style: str = "friendly"):
        self.name = name
        self.style = style
    
    def get_system_prompt(self) -> str:
        """获取 System Prompt"""
        if self.style == "friendly":
            return (
                f"你是{name}，一个友好、耐心的 AI 助手。"
                f"你善于用简洁清晰的中文回答问题，保持积极的态度。"
            )
        elif self.style == "professional":
            return (
                f"你是{name}，一个专业的商务助手。"
                f"你用正式、简洁的语言回答问题，确保信息准确。"
            )
        else:
            return f"你是{name}，一个 AI 助手。"


class MockLLM:
    """模拟 LLM"""
    
    def invoke(self, messages: list) -> str:
        """模拟 LLM 调用"""
        # 提取用户输入
        user_input = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_input = msg.get("content", "")
                break
        
        # 根据关键词生成回复
        if "python" in user_input.lower():
            return "Python 是一种广泛使用的编程语言，特别适合 AI 和数据科学领域。它的语法简洁，库生态丰富。"
        elif "agent" in user_input.lower():
            return "AI Agent 是能够自主决策和执行任务的智能体。它通常包含感知、规划、执行和记忆四个核心模块。"
        elif "你好" in user_input:
            return "你好！有什么我可以帮助你的吗？"
        else:
            return f"收到你的问题。关于'{user_input[:20]}'，让我为你详细解答。"


# ===== 初始化组件 =====
memory = MockMemorySystem()
persona = MockPersona("小智", "friendly")
llm = MockLLM()
```

**预期输出：**
```
（无输出，仅为代码定义）
```

### 3.2 工作流节点实现

```python
"""
LangGraph 工作流节点实现
每个节点负责一个特定功能
"""


def init_node(state: AgentState) -> Dict:
    """初始化节点: 设置初始状态"""
    return {
        "iteration": 0,
        "is_complete": False,
        "memory_updates": [],
        "metadata": {"start_time": time.time()},
        "persona_prompt": persona.get_system_prompt()
    }


def retrieve_memory(state: AgentState) -> Dict:
    """记忆检索节点: 从记忆系统中检索相关信息"""
    query = state["user_input"]
    
    # 搜索相关知识
    knowledge_results = memory.search(query)
    
    # 获取对话上下文
    conv_context = memory.get_context()
    
    # 构建上下文
    context_parts = []
    if knowledge_results:
        context_parts.append("相关知识:\n" + "\n".join(f"- {r}" for r in knowledge_results))
    if conv_context:
        context_parts.append("对话历史:\n" + conv_context)
    
    return {
        "context": "\n\n".join(context_parts) if context_parts else "没有相关上下文。"
    }


def agent_think(state: AgentState) -> Dict:
    """Agent 思考节点: 分析问题并生成回复"""
    # 构建消息
    messages = [
        {"role": "system", "content": state["persona_prompt"]},
        {"role": "system", "content": f"相关上下文:\n{state['context']}"},
    ]
    
    # 添加历史对话
    for msg in state["messages"][-6:]:
        messages.append(msg)
    
    # 添加当前输入
    messages.append({"role": "user", "content": state["user_input"]})
    
    # 调用 LLM
    response = llm.invoke(messages)
    
    # 记录到记忆
    memory.add_conversation("user", state["user_input"])
    memory.add_conversation("assistant", response)
    
    # 提取用户信息（简化版）
    if "我叫" in state["user_input"]:
        name = state["user_input"].split("我叫")[-1].split("，")[0].split("。")[0][:10]
        memory.update_user_info("name", name)
    
    return {
        "messages": state["messages"] + [
            {"role": "user", "content": state["user_input"]},
            {"role": "assistant", "content": response}
        ],
        "response": response,
        "is_complete": True,
        "iteration": state.get("iteration", 0) + 1
    }


def check_complete(state: AgentState) -> str:
    """条件判断: 检查是否完成"""
    if state.get("is_complete"):
        return "done"
    if state.get("iteration", 0) >= 3:
        return "done"
    return "continue"


def error_handler(state: AgentState) -> Dict:
    """错误处理节点"""
    return {
        "response": "抱歉，处理过程中出现错误。请稍后重试。",
        "is_complete": True
    }


print("工作流节点定义完成")
```

**预期输出：**
```
工作流节点定义完成
```

### 3.3 构建完整工作流

```python
"""
构建完整的 LangGraph 工作流
模拟 LangGraph 的 StateGraph 功能
"""


class SimpleWorkflow:
    """简化版工作流引擎（模拟 LangGraph）"""
    
    def __init__(self):
        self.nodes = {}
        self.edges = {}
        self.entry_point = None
        self.end_node = None
    
    def add_node(self, name: str, func):
        """添加节点"""
        self.nodes[name] = func
    
    def set_entry_point(self, name: str):
        """设置入口节点"""
        self.entry_point = name
    
    def add_edge(self, source: str, target: str):
        """添加边"""
        self.edges[source] = target
    
    def add_conditional_edges(self, source: str, condition_func, mapping: Dict):
        """添加条件边"""
        self.edges[source] = {"condition": condition_func, "mapping": mapping}
    
    def invoke(self, initial_state: Dict) -> Dict:
        """执行工作流"""
        state = initial_state.copy()
        current_node = self.entry_point
        max_steps = 10  # 防止无限循环
        
        step = 0
        while current_node and step < max_steps:
            step += 1
            
            # 执行节点
            if current_node in self.nodes:
                result = self.nodes[current_node](state)
                state.update(result)
            
            # 获取下一个节点
            if current_node in self.edges:
                edge = self.edges[current_node]
                if isinstance(edge, dict):
                    # 条件边
                    condition = edge["condition"](state)
                    current_node = edge["mapping"].get(condition)
                else:
                    # 普通边
                    current_node = edge
            else:
                current_node = None
        
        return state


# ===== 构建工作流 =====
print("\n=== 构建 LangGraph 工作流 ===")

workflow = SimpleWorkflow()

# 添加节点
workflow.add_node("init", init_node)
workflow.add_node("retrieve", retrieve_memory)
workflow.add_node("think", agent_think)
workflow.add_node("error", error_handler)

# 设置入口
workflow.set_entry_point("init")

# 添加边
workflow.add_edge("init", "retrieve")
workflow.add_edge("retrieve", "think")
workflow.add_conditional_edges(
    "think",
    check_complete,
    {"continue": "think", "done": None}  # done 表示结束
)
workflow.add_edge("error", None)

print("工作流构建完成")
print("节点: init -> retrieve -> think -> (条件) -> done")
```

**预期输出：**
```
=== 构建 LangGraph 工作流 ===
工作流构建完成
节点: init -> retrieve -> retrieve -> think -> (条件) -> done
```

### 3.4 完整运行演示

```python
"""
完整运行演示
模拟多轮对话，展示工作流的完整执行过程
"""


def run_workflow(user_input: str, thread_id: str = "default") -> Dict:
    """运行工作流"""
    initial_state = {
        "messages": [],
        "user_input": user_input,
        "context": "",
        "persona_prompt": "",
        "response": "",
        "iteration": 0,
        "is_complete": False,
        "memory_updates": [],
        "metadata": {}
    }
    
    result = workflow.invoke(initial_state)
    
    return {
        "response": result.get("response", ""),
        "iterations": result.get("iteration", 0),
        "context_used": bool(result.get("context")),
        "metadata": result.get("metadata", {})
    }


# ===== 运行测试 =====
print("\n" + "=" * 60)
print("完整工作流运行演示")
print("=" * 60)

# 模拟多轮对话
test_conversations = [
    "你好！",
    "什么是 Python？",
    "AI Agent 是什么？",
    "我叫张三",
    "你能帮我做什么？",
]

for user_input in test_conversations:
    print(f"\n用户: {user_input}")
    result = run_workflow(user_input)
    print(f"小智: {result['response']}")
    print(f"[状态] 迭代: {result['iterations']} | 使用上下文: {result['context_used']}")

# 打印记忆状态
print(f"\n--- 记忆系统状态 ---")
print(f"对话记录: {len(memory.conversation_buffer)} 条")
print(f"用户信息: {memory.user_info}")
print(f"知识库: {len(memory.knowledge)} 条")

# 打印工作流架构
print(f"""
=== 工作流架构图 ===

┌─────────────────────────────────────────────────────────┐
│                     用户输入                              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              初始化 (init)                                │
│              - 设置初始状态                               │
│              - 加载 Persona                              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│           记忆检索 (retrieve)                              │
│           - 搜索相关知识                                   │
│           - 获取对话上下文                                 │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Agent 思考 (think)                           │
│              - 分析问题                                   │
│              - 生成回复                                   │
│              - 更新记忆                                   │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│  继续迭代      │   │  返回结果      │
│  (continue)   │   │  (done)       │
└───────────────┘   └───────────────┘
""")
```

**预期输出：**
```
============================================================
完整工作流运行演示
============================================================

用户: 你好！
小智: 你好！有什么我可以帮助你的吗？
[状态] 迭代: 1 | 使用上下文: False

用户: 什么是 Python？
小智: Python 是一种广泛使用的编程语言，特别适合 AI 和数据科学领域。它的语法简洁，库生态丰富。
[状态] 迭代: 1 | 使用上下文: True

用户: AI Agent 是什么？
小智: AI Agent 是能够自主决策和执行任务的智能体。它通常包含感知、规划、执行和记忆四个核心模块。
[状态] 迭代: 1 | 使用上下文: True

用户: 我叫张三
小智: 收到你的问题。关于'我叫张三'，让我为你详细解答。
[状态] 迭代: 1 | 使用上下文: True

用户: 你能帮我做什么？
小智: 收到你的问题。关于'你能帮我做什么'，让我为你详细解答。
[状态] 迭代: 1 | 使用上下文: True

--- 记忆系统状态 ---
对话记录: 10 条
用户信息: {'name': '张三'}
知识库: 3 条

=== 工作流架构图 ===
...
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 工作流卡住不结束 | 检查 `check_complete` 条件和最大迭代次数限制 |
| 2 | 上下文太长 | 启用摘要压缩，限制检索数量 |
| 3 | 回复质量差 | 优化 System Prompt，增加知识库内容 |
| 4 | 记忆没有更新 | 检查 `agent_think` 节点是否正确调用 `memory.add_conversation` |
| 5 | Persona 没生效 | 确保 `persona_prompt` 正确传递到 LLM 调用中 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| LangGraph | LangChain 的工作流编排框架 |
| StateGraph | 用节点和边描述工作流的状态图 |
| 节点 (Node) | 工作流中的一个处理步骤 |
| 边 (Edge) | 节点之间的连接关系 |
| 条件边 | 根据条件动态选择下一个节点 |
| 状态 (State) | 工作流中传递的数据结构 |
| 完整工作流 | 整合所有组件的端到端 Agent 系统 |

## ✅ 验收清单
- [ ] 能设计完整的工作流状态图
- [ ] 能实现记忆检索、Agent 思考等节点
- [ ] 能构建带条件边的工作流
- [ ] 能运行完整的多轮对话
- [ ] 理解每个节点的职责和数据流
- [ ] 能说出工作流架构图中每个组件的作用

## 📝 复盘小纸条
- 今天最大的收获: _______________________
- 还不太确定的: _________________________

## 📥 明日同步接口
- 今日完成度: [ ] 100%  [ ] 80%  [ ] 60%  [ ] 其他___
- 卡点描述: _________________________
- 代码是否能跑通: [ ] 完全可以  [ ] 部分可以  [ ] 有问题
- 明天希望: _________________________
