# 📅 Week 6 Day 6：人机协作：Human-in-the-Loop 模式

## 🧭 今日方向
> 完全自主的 Agent 可能做出危险决策。Human-in-the-Loop (HITL) 让人类在关键节点介入，既保持 Agent 的效率，又确保安全性。

## 🎯 生乐比喻
> HITL 就像自动驾驶的"人工接管"模式。正常情况下汽车自己开（Agent 自主执行），但遇到复杂路况时会提醒你接管方向盘（人类审批）。你确认后，汽车继续自动驾驶。

## 📋 今日三件事
1. 理解 HITL 的三种介入模式：审批、反馈、纠正
2. 用 LangGraph 实现带人工审批的工作流
3. 实现人类反馈循环（Feedback Loop）

## 🗺️ 手把手路线

### Step 1: HITL 设计模式
- 做什么: 画出三种 HITL 模式的流程图
- 为什么: 不同场景需要不同的介入方式
- 成功标志: 能说出审批、反馈、纠正的区别

### Step 2: 审批工作流
- 做什么: 用 LangGraph 实现"Agent 提议 → 人类审批 → 执行/拒绝"
- 为什么: 高风险操作必须有人类审批
- 成能标志: 工作流能在人工节点暂停等待

### Step 3: 反馈循环
- 做什么: 实现人类对 Agent 输出的实时反馈
- 为什么: 反馈让 Agent 持续改进
- 成功标志: 能收集并利用人类反馈

## 💻 代码区

```python
"""
Week 6 Day 6: 人机协作：Human-in-the-Loop 模式
安装依赖: pip install langgraph langchain langchain-openai
"""

from typing import TypedDict, Annotated, List, Literal
from langgraph.graph import StateGraph, END, interrupt
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# ========== 1. HITL 设计模式 ==========
print("=== 1. HITL 设计模式 ===")

print("""
三种 HITL 模式:

1. 审批模式 (Approval):
   Agent 执行前 → 人类审批 → 执行/拒绝
   场景: 删除数据、发送邮件、支付操作

2. 反馈模式 (Feedback):
   Agent 输出 → 人类反馈 → Agent 改进
   场景: 内容生成、代码审查、翻译

3. 纠正模式 (Correction):
   Agent 输出 → 人类纠正 → Agent 学习
   场景: 分类错误、回答不准确
""")

# ========== 2. 审批工作流 ==========
print("=== 2. 审批工作流 ===")

class ApprovalState(TypedDict):
    task: str                    # 任务描述
    proposal: str                # Agent 提案
    approval_status: str         # 审批状态: pending/approved/rejected
    human_feedback: str          # 人类反馈
    execution_result: str        # 执行结果
    step: str                    # 当前步骤

def agent_propose(state: ApprovalState):
    """Agent 提出方案"""
    print("  [Agent] 正在分析任务并提出方案...")

    prompt = f"""分析以下任务，提出执行方案。

任务：{state['task']}

请提供：
1. 方案描述
2. 预期结果
3. 潜在风险

以 JSON 格式返回：{{"proposal": "方案", "risks": ["风险1", "风险2"]}}"""

    response = llm.invoke([HumanMessage(content=prompt)])

    return {
        "proposal": response.content,
        "step": "pending_approval"
    }

def human_review(state: ApprovalState):
    """人类审批节点（使用 interrupt 暂停）"""
    print("  [系统] 等待人类审批...")

    # interrupt 会暂停图的执行，等待人类输入
    human_decision = interrupt({
        "type": "approval_required",
        "task": state["task"],
        "proposal": state["proposal"],
        "instructions": "请回复 'approve' 批准或 'reject' 拒绝，并可附带反馈"
    })

    # 处理人类决策
    decision = human_decision.get("decision", "reject").lower()
    feedback = human_decision.get("feedback", "")

    return {
        "approval_status": "approved" if decision == "approve" else "rejected",
        "human_feedback": feedback,
        "step": "approved" if decision == "approve" else "rejected"
    }

def execute_task(state: ApprovalState):
    """执行任务（仅在审批通过后）"""
    print("  [系统] 执行任务...")

    return {
        "execution_result": f"任务 '{state['task']}' 已成功执行",
        "step": "completed"
    }

def reject_task(state: ApprovalState):
    """拒绝任务"""
    print(f"  [系统] 任务被拒绝: {state['human_feedback']}")

    return {
        "execution_result": f"任务被拒绝: {state['human_feedback']}",
        "step": "rejected"
    }

def should_execute(state: ApprovalState) -> Literal["execute", "reject"]:
    """条件路由"""
    return "execute" if state["approval_status"] == "approved" else "reject"

# 构建审批工作流图
approval_graph = StateGraph(ApprovalState)

approval_graph.add_node("propose", agent_propose)
approval_graph.add_node("review", human_review)
approval_graph.add_node("execute", execute_task)
approval_graph.add_node("reject", reject_task)

approval_graph.set_entry_point("propose")
approval_graph.add_edge("propose", "review")
approval_graph.add_conditional_edges(
    "review",
    should_execute,
    {"execute": "execute", "reject": "reject"}
)
approval_graph.add_edge("execute", END)
approval_graph.add_edge("reject", END)

# 使用 MemorySaver 支持断点续传
checkpointer = MemorySaver()
approval_app = approval_graph.compile(checkpointer=checkpointer)

# 运行工作流
print("\n--- 运行审批工作流 ---")
config = {"configurable": {"thread_id": "approval_demo_1"}}

# 启动工作流
initial_state = {
    "task": "删除所有过期的用户数据",
    "proposal": "",
    "approval_status": "pending",
    "human_feedback": "",
    "execution_result": "",
    "step": "starting"
}

# 运行到人工审批节点
result = approval_app.invoke(initial_state, config)
print(f"\n工作流状态: {result['step']}")
print(f"Agent 提案: {result['proposal'][:100]}...")

# 模拟人类审批（在实际应用中，这是用户界面的操作）
print("\n--- 模拟人类审批 ---")
human_decision = {"decision": "approve", "feedback": "同意，但请先备份"}

# 继续执行（传入人类决策）
result = approval_app.invoke(human_decision, config)
print(f"审批结果: {result['approval_status']}")
print(f"执行结果: {result['execution_result']}")

# ========== 3. 反馈循环 ==========
print("\n=== 3. 反馈循环 ===")

class FeedbackState(TypedDict):
    task: str
    generated_content: str
    feedback_history: List[dict]
    current_version: int
    is_satisfactory: bool

def generate_content(state: FeedbackState):
    """生成内容"""
    version = state.get("current_version", 1)
    feedback_context = ""
    if state.get("feedback_history"):
        latest_feedback = state["feedback_history"][-1]
        feedback_context = f"\n\n上一版本的反馈：{latest_feedback.get('comment', '')}"

    prompt = f"""请生成关于以下主题的内容（第 {version} 版）：

主题：{state['task']}
{feedback_context}

请根据反馈改进内容。"""

    response = llm.invoke([HumanMessage(content=prompt)])

    return {
        "generated_content": response.content,
        "current_version": version + 1
    }

def collect_feedback(state: FeedbackState):
    """收集人类反馈（interrupt）"""
    print("  [系统] 等待人类反馈...")

    feedback = interrupt({
        "type": "feedback_required",
        "content": state["generated_content"],
        "version": state["current_version"],
        "instructions": "请提供反馈：满意回复 'ok'，不满意请描述改进意见"
    })

    comment = feedback.get("comment", "ok")
    is_satisfactory = comment.lower() == "ok"

    new_feedback = {
        "version": state["current_version"],
        "comment": comment,
        "satisfactory": is_satisfactory
    }

    return {
        "feedback_history": state.get("feedback_history", []) + [new_feedback],
        "is_satisfactory": is_satisfactory
    }

def should_continue(state: FeedbackState) -> Literal["improve", "done"]:
    """条件路由"""
    return "done" if state["is_satisfactory"] else "improve"

# 构建反馈循环图
feedback_graph = StateGraph(FeedbackState)

feedback_graph.add_node("generate", generate_content)
feedback_graph.add_node("feedback", collect_feedback)

feedback_graph.set_entry_point("generate")
feedback_graph.add_edge("generate", "feedback")
feedback_graph.add_conditional_edges(
    "feedback",
    should_continue,
    {"improve": "generate", "done": END}
)

feedback_app = feedback_graph.compile(checkpointer=MemorySaver())

# 运行反馈循环
print("\n--- 运行反馈循环 ---")
config = {"configurable": {"thread_id": "feedback_demo_1"}}

result = feedback_app.invoke({
    "task": "写一篇关于 AI Agent 的技术博客",
    "generated_content": "",
    "feedback_history": [],
    "current_version": 1,
    "is_satisfactory": False
}, config)

print(f"最终版本: 第 {result['current_version']} 版")
print(f"反馈历史: {len(result['feedback_history'])} 轮")

# ========== 4. 纠正模式 ==========
print("\n=== 4. 纠正模式 ===")

class CorrectionState(TypedDict):
    text: str
    classification: str
    corrected_label: str
    learning_examples: List[dict]

def classify_text(state: CorrectionState):
    """文本分类"""
    prompt = f"""对以下文本进行情感分析：

文本：{state['text']}

请返回分类结果：positive/negative/neutral"""

    response = llm.invoke([HumanMessage(content=prompt)])
    classification = response.content.strip().lower()

    # 提取分类结果
    for label in ["positive", "negative", "neutral"]:
        if label in classification:
            classification = label
            break

    return {"classification": classification}

def human_correct(state: CorrectionState):
    """人类纠正（interrupt）"""
    print(f"  [系统] 当前分类: {state['classification']}")
    print("  [系统] 等待人类确认或纠正...")

    correction = interrupt({
        "type": "correction_required",
        "text": state["text"],
        "current_label": state["classification"],
        "instructions": "回复 'ok' 确认，或输入正确标签 (positive/negative/neutral)"
    })

    corrected_label = correction.get("label", state["classification"])

    # 记录学习样本
    example = {
        "text": state["text"],
        "predicted": state["classification"],
        "corrected": corrected_label
    }

    return {
        "corrected_label": corrected_label,
        "learning_examples": state.get("learning_examples", []) + [example]
    }

# 构建纠正图
correction_graph = StateGraph(CorrectionState)

correction_graph.add_node("classify", classify_text)
correction_graph.add_node("correct", human_correct)

correction_graph.set_entry_point("classify")
correction_graph.add_edge("classify", "correct")
correction_graph.add_edge("correct", END)

correction_app = correction_graph.compile(checkpointer=MemorySaver())

# 运行纠正流程
print("\n--- 运行纠正流程 ---")
config = {"configurable": {"thread_id": "correction_demo_1"}}

result = correction_app.invoke({
    "text": "这个产品还行吧，一般般",
    "classification": "",
    "corrected_label": "",
    "learning_examples": []
}, config)

print(f"最终标签: {result['corrected_label']}")
print(f"学习样本数: {len(result['learning_examples'])}")

# ========== 5. 完整 HITL 系统 ==========
print("\n=== 5. 完整 HITL 系统 ===")

class HITLSystem:
    """人机协作系统"""

    def __init__(self):
        self.approval_workflow = approval_app
        self.feedback_workflow = feedback_app
        self.correction_workflow = correction_app

    def request_approval(self, task: str, thread_id: str):
        """请求审批"""
        config = {"configurable": {"thread_id": thread_id}}
        initial_state = {
            "task": task,
            "proposal": "",
            "approval_status": "pending",
            "human_feedback": "",
            "execution_result": "",
            "step": "starting"
        }
        return self.approval_workflow.invoke(initial_state, config)

    def submit_approval(self, decision: str, feedback: str, thread_id: str):
        """提交审批决策"""
        config = {"configurable": {"thread_id": thread_id}}
        return self.approval_workflow.invoke(
            {"decision": decision, "feedback": feedback},
            config
        )

# 使用 HITL 系统
hitl = HITLSystem()

# 请求审批
print("\n--- HITL 系统测试 ---")
result = hitl.request_approval("备份生产数据库", "test_thread_1")
print(f"任务: {result['task']}")
print(f"提案: {result['proposal'][:80]}...")

# 提交审批
result = hitl.submit_approval("approve", "同意，但请在凌晨执行", "test_thread_1")
print(f"审批结果: {result['approval_status']}")
print(f"执行结果: {result['execution_result']}")

print("""
=== HITL 最佳实践 ===

1. 介入点设计:
   - 高风险操作必须审批
   - 生成内容需要反馈
   - 分类结果可以纠正

2. 用户体验:
   - 提供清晰的上下文
   - 支持快捷操作
   - 保留历史记录

3. 系统设计:
   - 使用断点续传
   - 支持异步处理
   - 实现超时机制

4. 数据收集:
   - 记录人类决策
   - 用于模型改进
   - 建立反馈数据集
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | `interrupt` 报错 | 确保使用 LangGraph >= 0.2，并配置 checkpointer |
| 2 | 工作流无法恢复 | 检查 thread_id 是否一致 |
| 3 | 人类输入格式错误 | 在 interrupt 中明确说明输入格式 |
| 4 | 反馈循环无限进行 | 添加最大迭代次数限制 |
| 5 | 并发请求冲突 | 为每个请求分配唯一 thread_id |
| 6 | 状态丢失 | 使用 MemorySaver 或数据库持久化 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Human-in-the-Loop | 人类参与 Agent 决策循环的协作模式 |
| 审批模式 | Agent 提出方案，人类审批后执行 |
| 反馈模式 | Agent 生成内容，人类提供反馈改进 |
| 纠正模式 | Agent 做出预测，人类纠正并记录 |
| interrupt | LangGraph 中暂停执行等待人类输入的机制 |
| MemorySaver | LangGraph 的内存检查点，支持断点续传 |
| Thread ID | 请求标识符，用于跟踪和恢复会话 |
| 反馈循环 | 人类反馈驱动 Agent 持续改进的闭环 |
| 断点续传 | 工作流暂停后从断点恢复执行 |
| 优雅降级 | 人类不响应时的超时处理机制 |

## ✅ 验收清单
- [ ] 能说出三种 HITL 模式的区别和适用场景
- [ ] 能用 `interrupt` 实现人工审批节点
- [ ] 能用 MemorySaver 实现断点续传
- [ ] 能构建反馈循环工作流
- [ ] 理解 thread_id 的作用
- [ ] 能设计 HITL 系统的超时和降级策略

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
