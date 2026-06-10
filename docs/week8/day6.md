# 📅 Week 8 Day 6：构建多 Agent 协作 Demo

## 🧭 今日方向
> 将 Week 8 所学整合为一个完整的多 Agent 协作 Demo。实践是检验理解的唯一标准。

## 🎯 生活比喻
> 今天的工作就像"产品发布会"。前几天都在准备（学概念、写代码），今天要把所有东西组合成一个能演示的完整产品。

## 📋 今日三件事
1. 设计完整的多 Agent 协作场景
2. 用 LangGraph 实现 Agent 间通信和 Handoff
3. 构建交互式演示界面

## 🗺️ 手把手路线

### Step 1: 场景设计
- 做什么: 设计一个多 Agent 协作的完整场景
- 为什么: 明确需求才能正确实现
- 成功标志: 能描述场景和 Agent 分工

### Step 2: 核心实现
- 做什么: 用 LangGraph 实现多 Agent 工作流
- 为什么: 这是 Demo 的核心逻辑
- 成功标志: 多个 Agent 能协同完成任务

### Step 3: 演示界面
- 做什么: 构建命令行交互界面
- 为什么: 便于展示和测试
- 成能标志: 能通过命令行与系统交互

## 💻 代码区

```python
"""
Week 8 Day 6: 构建多 Agent 协作 Demo
安装依赖: pip install langgraph langchain langchain-openai
"""

from typing import TypedDict, List, Dict, Any, Literal, Annotated
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from dataclasses import dataclass, field
import json
from datetime import datetime

# ========== 1. Demo 场景 ==========
print("=== 多 Agent 协作 Demo ===")

print("""
场景：智能客服系统

角色分工:
1. IntentClassifier (意图分类器): 识别用户意图
2. TechSupport (技术支持): 处理技术问题
3. Sales (销售顾问): 处理销售咨询
4. Supervisor (主管): 协调和汇总

工作流程:
用户输入 → 意图分类 → 路由到专家 → 专家处理 → 主管审核 → 返回结果
""")

# ========== 2. 初始化 ==========
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# ========== 3. 定义状态 ==========
class DemoState(TypedDict):
    user_input: str
    intent: str
    expert_response: str
    supervisor_review: str
    final_response: str
    messages: List[dict]
    agent_path: List[str]

# ========== 4. 定义 Agent 节点 ==========
def intent_classifier(state: DemoState):
    """意图分类 Agent"""
    prompt = f"""分析用户输入，判断其意图。

用户输入：{state['user_input']}

请返回 JSON 格式：
{{"intent": "tech/sales/general", "confidence": 0.9, "reason": "原因"}}"""

    response = llm.invoke([HumanMessage(content=prompt)])

    try:
        import json
        result = json.loads(response.content)
        intent = result.get("intent", "general")
    except:
        intent = "general"

    return {
        "intent": intent,
        "agent_path": state.get("agent_path", []) + ["IntentClassifier"]
    }

def tech_support(state: DemoState):
    """技术支持 Agent"""
    prompt = f"""你是一个技术支持专家。

用户问题：{state['user_input']}

请提供专业的技术解答。如果有代码示例，请提供。"""

    response = llm.invoke([HumanMessage(content=prompt)])

    return {
        "expert_response": response.content,
        "agent_path": state.get("agent_path", []) + ["TechSupport"]
    }

def sales_consultant(state: DemoState):
    """销售顾问 Agent"""
    prompt = f"""你是一个销售顾问。

用户咨询：{state['user_input']}

请提供专业的产品介绍和建议。"""

    response = llm.invoke([HumanMessage(content=prompt)])

    return {
        "expert_response": response.content,
        "agent_path": state.get("agent_path", []) + ["Sales"]
    }

def general_agent(state: DemoState):
    """通用 Agent"""
    prompt = f"""你是一个通用助手。

用户问题：{state['user_input']}

请提供 helpful 的回答。"""

    response = llm.invoke([HumanMessage(content=prompt)])

    return {
        "expert_response": response.content,
        "agent_path": state.get("agent_path", []) + ["GeneralAgent"]
    }

def supervisor(state: DemoState):
    """主管 Agent - 审核和优化"""
    prompt = f"""你是客服主管，负责审核回复质量。

用户原始问题：{state['user_input']}
专家回复：{state['expert_response']}

请审核回复质量，如果需要改进，请优化后返回。否则返回原回复。"""

    response = llm.invoke([HumanMessage(content=prompt)])

    return {
        "supervisor_review": response.content,
        "final_response": response.content,
        "agent_path": state.get("agent_path", []) + ["Supervisor"]
    }

# ========== 5. 路由逻辑 ==========
def route_by_intent(state: DemoState) -> Literal["tech", "sales", "general"]:
    """根据意图路由"""
    intent = state.get("intent", "general")
    if "tech" in intent:
        return "tech"
    elif "sales" in intent:
        return "sales"
    return "general"

# ========== 6. 构建工作流 ==========
workflow = StateGraph(DemoState)

# 添加节点
workflow.add_node("classify", intent_classifier)
workflow.add_node("tech", tech_support)
workflow.add_node("sales", sales_consultant)
workflow.add_node("general", general_agent)
workflow.add_node("supervisor", supervisor)

# 设置入口
workflow.set_entry_point("classify")

# 添加条件边
workflow.add_conditional_edges(
    "classify",
    route_by_intent,
    {"tech": "tech", "sales": "sales", "general": "general"}
)

# 所有专家节点都指向 Supervisor
workflow.add_edge("tech", "supervisor")
workflow.add_edge("sales", "supervisor")
workflow.add_edge("general", "supervisor")

# Supervisor 后结束
workflow.add_edge("supervisor", END)

# 编译
app = workflow.compile(checkpointer=MemorySaver())

# ========== 7. 演示运行 ==========
print("\n=== 演示运行 ===")

test_cases = [
    "Python 如何实现多线程？",
    "你们的产品有哪些套餐？",
    "今天天气怎么样？",
    "如何部署 Docker 容器？",
    "产品的价格是多少？",
]

for query in test_cases:
    print(f"\n{'='*50}")
    print(f"用户: {query}")

    config = {"configurable": {"thread_id": f"demo_{hash(query)}"}}
    result = app.invoke({
        "user_input": query,
        "intent": "",
        "expert_response": "",
        "supervisor_review": "",
        "final_response": "",
        "messages": [],
        "agent_path": []
    }, config)

    print(f"意图: {result['intent']}")
    print(f"Agent 路径: {' → '.join(result['agent_path'])}")
    print(f"回复: {result['final_response'][:150]}...")

# ========== 8. 交互式界面 ==========
print("\n=== 交互式界面 ===")

class InteractiveDemo:
    """交互式 Demo"""

    def __init__(self):
        self.app = app
        self.history = []

    def process(self, user_input: str) -> dict:
        """处理用户输入"""
        config = {"configurable": {"thread_id": f"interactive_{len(self.history)}"}}

        result = self.app.invoke({
            "user_input": user_input,
            "intent": "",
            "expert_response": "",
            "supervisor_review": "",
            "final_response": "",
            "messages": [],
            "agent_path": []
        }, config)

        self.history.append({
            "input": user_input,
            "output": result["final_response"],
            "intent": result["intent"],
            "path": result["agent_path"]
        })

        return result

    def get_stats(self) -> dict:
        """获取统计信息"""
        if not self.history:
            return {"total": 0}

        intents = {}
        for h in self.history:
            intent = h["intent"]
            intents[intent] = intents.get(intent, 0) + 1

        return {
            "total": len(self.history),
            "intent_distribution": intents
        }

# 使用交互式 Demo
demo = InteractiveDemo()

print("交互式 Demo 已启动")
print("输入问题开始测试，输入 'quit' 退出\n")

# 模拟交互
simulated_inputs = [
    "如何安装 Python？",
    "你们有企业版吗？",
    "谢谢你的帮助",
]

for user_input in simulated_inputs:
    print(f"\n用户: {user_input}")
    result = demo.process(user_input)
    print(f"助手: {result['final_response'][:100]}...")

# 显示统计
print(f"\n统计信息: {demo.get_stats()}")

# ========== 9. 代码总结 ==========
print("\n=== Demo 总结 ===")

print("""
本次 Demo 实现了:

1. 意图分类:
   - 自动识别用户意图
   - 根据意图路由到专家

2. 多专家协作:
   - TechSupport: 技术问题
   - Sales: 销售咨询
   - General: 通用问题

3. 质量控制:
   - Supervisor 审核回复质量
   - 必要时优化回复

4. 可观测性:
   - 记录 Agent 执行路径
   - 统计意图分布

扩展方向:
1. 添加更多专家角色
2. 集成 RAG 知识库
3. 添加记忆功能
4. 构建 Web UI
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 意图分类不准 | 优化 Prompt，增加示例 |
| 2 | Agent 路由错误 | 检查路由逻辑和意图映射 |
| 3 | Supervisor 审核太慢 | 简化审核逻辑，或异步处理 |
| 4 | 内存占用高 | 清理历史记录，限制对话长度 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| 意图分类 | 识别用户输入的目的和需求 |
| 路由 | 根据条件将请求分配给不同的处理者 |
| Agent 路径 | 请求经过的 Agent 序列 |
| Supervisor | 负责审核和协调的管理 Agent |
| 多 Agent 协作 | 多个 Agent 共同完成任务 |
| Handoff | Agent 间的任务交接 |

## ✅ 验收清单
- [ ] 能设计完整的多 Agent 场景
- [ ] 能用 LangGraph 实现意图路由
- [ ] 能实现多专家协作
- [ ] 能添加 Supervisor 质量控制
- [ ] 能记录和分析执行路径
- [ ] Demo 能正常运行并展示

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
