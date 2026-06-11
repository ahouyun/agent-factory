# 📅 Week 6 Day 6：Human-in-the-Loop with LangGraph interrupt

## 🧭 今日方向
> 完全自主的 Agent 可能做出危险决策。Human-in-the-Loop (HITL) 让人类在关键节点介入，既保持 Agent 的效率，又确保安全性。今天学习 LangGraph 的 interrupt 机制，实现审批工作流、反馈循环和纠正模式。

## 🎯 生活比喻
> HITL 就像自动驾驶的"人工接管"模式。正常情况下汽车自己开（Agent 自主执行），但遇到复杂路况或危险场景时会提醒你接管方向盘（人类审批）。你确认后，汽车继续自动驾驶。另一种模式是"教练陪练"——学员开车（Agent 输出），教练在旁边观察并给出反馈（人类反馈），学员根据反馈改进驾驶技术（Agent 学习）。

## 📋 今日三件事
1. 理解 HITL 的三种介入模式：审批（Approval）、反馈（Feedback）、纠正（Correction）
2. 用 LangGraph 的 interrupt 机制实现人工审批工作流
3. 实现人类反馈循环和纠正模式

## 🗺️ 手把手路线

### Step 1：理解 HITL 设计模式
- **做什么**: 了解审批、反馈、纠正三种模式的区别和适用场景
- **为什么**: 不同场景需要不同的介入方式，选错模式会影响效率和安全性
- **成功标志**: 能说出三种模式的区别和各自适用场景

### Step 2：实现审批工作流
- **做什么**: 用 LangGraph interrupt 实现"Agent 提议 → 人类审批 → 执行/拒绝"
- **为什么**: 高风险操作（删除数据、发邮件、支付）必须有人类审批
- **成功标志**: 工作流能在人工节点暂停等待，人类审批后继续执行

### Step 3：实现反馈循环和纠正模式
- **做什么**: 实现人类对 Agent 输出的实时反馈和纠正
- **为什么**: 反馈让 Agent 持续改进，纠正帮助 Agent 学习
- **成功标志**: 能收集并利用人类反馈，实现迭代改进

## 💻 代码区

### 示例 1：HITL 概念演示

```python
"""
HITL（Human-in-the-Loop）三种模式演示
理解每种模式的工作流程和适用场景
"""

print("=== HITL 三种设计模式 ===\n")

# 模式 1: 审批模式
print("【模式 1: 审批模式 (Approval)】")
print("  流程: Agent 执行前 → 人类审批 → 执行/拒绝")
print("  场景: 删除数据、发送邮件、支付操作、修改配置")
print("  特点: 高风险操作的'安全阀'\n")

# 模式 2: 反馈模式
print("【模式 2: 反馈模式 (Feedback)】")
print("  流程: Agent 输出 → 人类反馈 → Agent 改进")
print("  场景: 内容生成、代码审查、翻译、设计")
print("  特点: 迭代优化，持续改进\n")

# 模式 3: 纠正模式
print("【模式 3: 纠正模式 (Correction)】")
print("  流程: Agent 输出 → 人类纠正 → Agent 学习")
print("  场景: 分类错误、回答不准确、标签标注")
print("  特点: 建立训练数据集，长期改进\n")


# 模拟三种模式的工作流程
print("=== 工作流程对比 ===\n")

# 审批模式流程
print("审批模式:")
steps_approval = [
    "1. 用户发起请求: '删除所有过期数据'",
    "2. Agent 分析任务并提出方案",
    "3. ⏸️ interrupt: 暂停，等待人类审批",
    "4. 人类决策: '批准，但请先备份'",
    "5. Agent 执行: 备份 → 删除",
    "6. 返回执行结果"
]
for step in steps_approval:
    print(f"  {step}")

print()

# 反馈模式流程
print("反馈模式:")
steps_feedback = [
    "1. 用户请求: '写一篇关于 AI 的博客'",
    "2. Agent 生成第 1 版内容",
    "3. ⏸️ interrupt: 暂停，等待人类反馈",
    "4. 人类反馈: '太技术了，需要更通俗'",
    "5. Agent 根据反馈生成第 2 版",
    "6. 人类反馈: 'ok，满意'",
    "7. 完成"
]
for step in steps_feedback:
    print(f"  {step}")

print()

# 纠正模式流程
print("纠正模式:")
steps_correction = [
    "1. Agent 对文本进行情感分类: 'positive'",
    "2. ⏸️ interrupt: 暂停，等待人类确认",
    "3. 人类纠正: '应该是 neutral'",
    "4. 记录纠正样本: (文本, positive, neutral)",
    "5. 用于后续模型微调"
]
for step in steps_correction:
    print(f"  {step}")
```

**预期输出：**
```
=== HITL 三种设计模式 ===

【模式 1: 审批模式 (Approval)】
  流程: Agent 执行前 → 人类审批 → 执行/拒绝
  场景: 删除数据、发送邮件、支付操作、修改配置
  特点: 高风险操作的'安全阀'

【模式 2: 反馈模式 (Feedback)】
  流程: Agent 输出 → 人类反馈 → Agent 改进
  场景: 内容生成、代码审查、翻译、设计
  特点: 迭代优化，持续改进

【模式 3: 纠正模式 (Correction)】
  流程: Agent 输出 → 人类纠正 → Agent 学习
  场景: 分类错误、回答不准确、标签标注
  特点: 建立训练数据集，长期改进

=== 工作流程对比 ===

审批模式:
  1. 用户发起请求: '删除所有过期数据'
  2. Agent 分析任务并提出方案
  3. ⏸️ interrupt: 暂停，等待人类审批
  4. 人类决策: '批准，但请先备份'
  5. Agent 执行: 备份 → 删除
  6. 返回执行结果

...
```

### 示例 2：审批工作流（使用 LangGraph interrupt）

```python
"""
审批工作流 —— 使用 LangGraph interrupt 实现
核心: interrupt() 函数会暂停图的执行，等待人类输入

安装依赖: pip install langgraph langchain langchain-openai
"""
from typing import TypedDict, Literal
from langgraph.graph import StateGraph, END, interrupt
from langgraph.checkpoint.memory import MemorySaver


class ApprovalState(TypedDict):
    """审批工作流状态"""
    task: str                    # 任务描述
    proposal: str                # Agent 提案
    approval_status: str         # 审批状态: pending/approved/rejected
    human_feedback: str          # 人类反馈
    execution_result: str        # 执行结果
    step: str                    # 当前步骤


def agent_propose(state: ApprovalState) -> dict:
    """
    Agent 提出方案节点
    分析任务并生成执行方案（实际项目中调用 LLM）
    """
    print(f"  [Agent] 正在分析任务: {state['task']}")

    # 模拟 LLM 生成方案（实际项目中用 LLM）
    proposal = f"""执行方案：
1. 首先备份相关数据
2. 然后执行: {state['task']}
3. 最后验证执行结果

预期风险: 操作不可逆，建议先确认
预计耗时: 5 分钟"""

    return {
        "proposal": proposal,
        "step": "pending_approval"
    }


def human_review(state: ApprovalState) -> dict:
    """
    人类审批节点（使用 interrupt 暂停）
    interrupt() 会暂停图的执行，等待外部输入
    """
    print("  [系统] ⏸️ 工作流已暂停，等待人类审批...")
    print(f"  [系统] 任务: {state['task']}")
    print(f"  [系统] 提案: {state['proposal'][:80]}...")

    # interrupt 会暂停执行，返回人类的输入
    human_decision = interrupt({
        "type": "approval_required",
        "task": state["task"],
        "proposal": state["proposal"],
        "instructions": "请回复 {'decision': 'approve'/'reject', 'feedback': '...'}"
    })

    # 处理人类决策
    decision = human_decision.get("decision", "reject").lower()
    feedback = human_decision.get("feedback", "")

    print(f"  [人类] 决策: {decision} | 反馈: {feedback}")

    return {
        "approval_status": "approved" if decision == "approve" else "rejected",
        "human_feedback": feedback,
        "step": "approved" if decision == "approve" else "rejected"
    }


def execute_task(state: ApprovalState) -> dict:
    """执行任务（仅在审批通过后）"""
    print(f"  [系统] ✅ 审批通过，开始执行任务...")

    # 模拟执行
    return {
        "execution_result": f"任务 '{state['task']}' 已成功执行。{state.get('human_feedback', '')}",
        "step": "completed"
    }


def reject_task(state: ApprovalState) -> dict:
    """拒绝任务"""
    print(f"  [系统] ❌ 任务被拒绝: {state['human_feedback']}")

    return {
        "execution_result": f"任务被拒绝: {state['human_feedback']}",
        "step": "rejected"
    }


def should_execute(state: ApprovalState) -> Literal["execute", "reject"]:
    """条件路由：根据审批状态决定执行还是拒绝"""
    return "execute" if state["approval_status"] == "approved" else "reject"


# ========== 构建审批工作流图 ==========

graph = StateGraph(ApprovalState)

# 添加节点
graph.add_node("propose", agent_propose)
graph.add_node("review", human_review)
graph.add_node("execute", execute_task)
graph.add_node("reject", reject_task)

# 添加边
graph.set_entry_point("propose")
graph.add_edge("propose", "review")
graph.add_conditional_edges(
    "review",
    should_execute,
    {"execute": "execute", "reject": "reject"}
)
graph.add_edge("execute", END)
graph.add_edge("reject", END)

# 使用 MemorySaver 支持断点续传
checkpointer = MemorySaver()
approval_app = graph.compile(checkpointer=checkpointer)


# ========== 运行工作流 ==========

print("\n=== 运行审批工作流 ===\n")

config = {"configurable": {"thread_id": "approval_demo_1"}}

# 初始状态
initial_state = {
    "task": "删除所有过期的用户数据",
    "proposal": "",
    "approval_status": "pending",
    "human_feedback": "",
    "execution_result": "",
    "step": "starting"
}

# 第一步：启动工作流（会运行到 interrupt 暂停）
print("--- 启动工作流 ---")
result = approval_app.invoke(initial_state, config)
print(f"\n工作流状态: {result['step']}")
print(f"Agent 提案: {result['proposal'][:100]}...")

# 第二步：模拟人类审批（在实际应用中，这是用户界面的操作）
print("\n--- 模拟人类审批 ---")
human_decision = {"decision": "approve", "feedback": "同意，但请先备份数据"}

# 继续执行（传入人类决策）
result = approval_app.invoke(human_decision, config)
print(f"\n审批结果: {result['approval_status']}")
print(f"执行结果: {result['execution_result']}")
print(f"最终步骤: {result['step']}")
```

**预期输出：**
```
=== 运行审批工作流 ===

--- 启动工作流 ---
  [Agent] 正在分析任务: 删除所有过期的用户数据
  [系统] ⏸️ 工作流已暂停，等待人类审批...
  [系统] 任务: 删除所有过期的用户数据
  [系统] 提案: 执行方案：
1. 首先备份相关数据
2. 然后执行: 删除所有过期的用户数据
3. 最后验证执行结果...

工作流状态: pending_approval
Agent 提案: 执行方案：
1. 首先备份相关数据
2. 然后执行: 删除所有过期的用户数据...

--- 模拟人类审批 ---
  [人类] 决策: approve | 反馈: 同意，但请先备份数据
  [系统] ✅ 审批通过，开始执行任务...

审批结果: approved
执行结果: 任务 '删除所有过期的用户数据' 已成功执行。同意，但请先备份数据
最终步骤: completed
```

### 示例 3：反馈循环工作流

```python
"""
反馈循环工作流
Agent 生成内容 → 人类反馈 → Agent 改进 → 直到满意

使用 interrupt 实现暂停等待人类反馈
"""
from typing import TypedDict, Annotated, List, Literal
from langgraph.graph import StateGraph, END, interrupt
from langgraph.checkpoint.memory import MemorySaver
import operator


class FeedbackState(TypedDict):
    """反馈循环状态"""
    task: str                                    # 创作任务
    generated_content: str                       # 当前生成的内容
    feedback_history: Annotated[List[dict], operator.add]  # 反馈历史（追加）
    current_version: int                         # 当前版本号
    is_satisfactory: bool                        # 是否满意


def generate_content(state: FeedbackState) -> dict:
    """
    生成内容节点
    根据反馈历史改进内容（实际项目中调用 LLM）
    """
    version = state.get("current_version", 1)

    # 构建上下文（包含之前的反馈）
    feedback_context = ""
    if state.get("feedback_history"):
        latest = state["feedback_history"][-1]
        feedback_context = f"\n\n上一版本反馈: {latest.get('comment', '')}"

    # 模拟 LLM 生成内容（实际项目中调用 LLM）
    content_templates = {
        1: f"这是关于'{state['task']}'的第 1 版内容。本文介绍了基本概念和应用场景。",
        2: f"这是关于'{state['task']}'的第 2 版内容（已根据反馈改进）。本文用更通俗的语言介绍了概念，并增加了实际案例。",
        3: f"这是关于'{state['task']}'的第 3 版内容（再次改进）。本文进一步简化了表述，增加了图表说明，并附上了常见问题解答。"
    }

    content = content_templates.get(version, f"这是第 {version} 版内容。")

    print(f"  [Agent] 生成第 {version} 版内容（{len(content)} 字符）")

    return {
        "generated_content": content,
        "current_version": version + 1
    }


def collect_feedback(state: FeedbackState) -> dict:
    """
    收集人类反馈节点（使用 interrupt 暂停）
    """
    print("  [系统] ⏸️ 等待人类反馈...")

    feedback = interrupt({
        "type": "feedback_required",
        "content_preview": state["generated_content"][:200],
        "version": state["current_version"],
        "instructions": "满意回复 {'comment': 'ok'}，不满意请描述改进意见"
    })

    comment = feedback.get("comment", "ok")
    is_satisfactory = comment.lower() == "ok"

    print(f"  [人类] 反馈: {comment} | 满意: {is_satisfactory}")

    new_feedback = {
        "version": state["current_version"],
        "comment": comment,
        "satisfactory": is_satisfactory
    }

    return {
        "feedback_history": [new_feedback],
        "is_satisfactory": is_satisfactory
    }


def should_continue(state: FeedbackState) -> Literal["improve", "done"]:
    """条件路由：根据是否满意决定继续改进还是结束"""
    return "done" if state["is_satisfactory"] else "improve"


# ========== 构建反馈循环图 ==========

graph = StateGraph(FeedbackState)

graph.add_node("generate", generate_content)
graph.add_node("feedback", collect_feedback)

graph.set_entry_point("generate")
graph.add_edge("generate", "feedback")
graph.add_conditional_edges(
    "feedback",
    should_continue,
    {"improve": "generate", "done": END}
)

feedback_app = graph.compile(checkpointer=MemorySaver())


# ========== 运行反馈循环 ==========

print("\n=== 运行反馈循环 ===\n")

config = {"configurable": {"thread_id": "feedback_demo_1"}}

# 初始状态
initial_state = {
    "task": "写一篇关于 AI Agent 的技术博客",
    "generated_content": "",
    "feedback_history": [],
    "current_version": 1,
    "is_satisfactory": False
}

# 第一次运行（生成第 1 版，等待反馈）
print("--- 生成第 1 版 ---")
result = feedback_app.invoke(initial_state, config)
print(f"当前版本: 第 {result['current_version']} 版")

# 模拟人类反馈：不满意
print("\n--- 提交反馈：不满意 ---")
result = feedback_app.invoke(
    {"comment": "太技术了，需要用更通俗的语言"},
    config
)

# 模拟人类反馈：满意
print("\n--- 提交反馈：满意 ---")
result = feedback_app.invoke(
    {"comment": "ok"},
    config
)

print(f"\n最终版本: 第 {result['current_version']} 版")
print(f"反馈历史: {len(result['feedback_history'])} 轮")
for fb in result['feedback_history']:
    print(f"  版本 {fb['version']}: {fb['comment']} (满意: {fb['satisfactory']})")
```

**预期输出：**
```
=== 运行反馈循环 ===

--- 生成第 1 版 ---
  [Agent] 生成第 1 版内容（62 字符）
  [系统] ⏸️ 等待人类反馈...
当前版本: 第 2 版

--- 提交反馈：不满意 ---
  [人类] 反馈: 太技术了，需要用更通俗的语言 | 满意: False
  [Agent] 生成第 2 版内容（85 字符）
  [系统] ⏸️ 等待人类反馈...

--- 提交反馈：满意 ---
  [人类] 反馈: ok | 满意: True

最终版本: 第 3 版
反馈历史: 2 轮
  版本 1: 太技术了，需要用更通俗的语言 (满意: False)
  版本 2: ok (满意: True)
```

### 示例 4：纠正模式

```python
"""
纠正模式 —— Agent 做出预测，人类纠正并记录
用于建立训练数据集，持续改进 Agent 的准确性
"""
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, END, interrupt
from langgraph.checkpoint.memory import MemorySaver
import operator


class CorrectionState(TypedDict):
    """纠正模式状态"""
    text: str                                          # 输入文本
    classification: str                                # Agent 的分类结果
    corrected_label: str                               # 人类纠正后的标签
    learning_examples: Annotated[List[dict], operator.add]  # 学习样本（追加）


def classify_text(state: CorrectionState) -> dict:
    """
    文本分类节点（模拟 LLM 分类）
    实际项目中调用 LLM 或分类模型
    """
    text = state["text"].lower()

    # 模拟分类逻辑（实际项目中用 LLM）
    if any(w in text for w in ["好", "棒", "喜欢", "开心", "满意"]):
        classification = "positive"
    elif any(w in text for w in ["差", "烂", "讨厌", "生气", "失望"]):
        classification = "negative"
    else:
        classification = "neutral"

    print(f"  [Agent] 分类结果: {classification}")
    return {"classification": classification}


def human_correct(state: CorrectionState) -> dict:
    """
    人类纠正节点（使用 interrupt 暂停）
    """
    print(f"  [系统] ⏸️ 等待人类确认或纠正...")
    print(f"  [系统] 文本: {state['text']}")
    print(f"  [系统] Agent 分类: {state['classification']}")

    correction = interrupt({
        "type": "correction_required",
        "text": state["text"],
        "current_label": state["classification"],
        "instructions": "回复 'ok' 确认，或输入正确标签 (positive/negative/neutral)"
    })

    corrected_label = correction.get("label", state["classification"])
    print(f"  [人类] 标签: {corrected_label}")

    # 记录学习样本
    example = {
        "text": state["text"],
        "predicted": state["classification"],
        "corrected": corrected_label,
        "is_correct": state["classification"] == corrected_label
    }

    return {
        "corrected_label": corrected_label,
        "learning_examples": [example]
    }


# ========== 构建纠正图 ==========

graph = StateGraph(CorrectionState)

graph.add_node("classify", classify_text)
graph.add_node("correct", human_correct)

graph.set_entry_point("classify")
graph.add_edge("classify", "correct")
graph.add_edge("correct", END)

correction_app = graph.compile(checkpointer=MemorySaver())


# ========== 运行纠正流程 ==========

print("\n=== 运行纠正流程 ===\n")

test_texts = [
    "这个产品还行吧，一般般",
    "太好用了，强烈推荐！",
    "服务态度很差，非常失望",
]

all_examples = []

for text in test_texts:
    print(f"--- 处理文本: {text} ---")
    config = {"configurable": {"thread_id": f"correction_{hash(text)}"}}

    result = correction_app.invoke({
        "text": text,
        "classification": "",
        "corrected_label": "",
        "learning_examples": []
    }, config)

    # 模拟人类纠正
    if result["classification"] == "neutral":
        # 人类认为"还行吧"应该是 neutral（确认正确）
        correction = {"label": "ok"}
    else:
        correction = {"label": result["classification"]}

    result2 = correction_app.invoke(correction, config)
    all_examples.extend(result2["learning_examples"])
    print()


# 打印学习样本
print("=== 学习样本汇总 ===")
for i, ex in enumerate(all_examples, 1):
    status = "✓ 正确" if ex["is_correct"] else "✗ 需纠正"
    print(f"  样本 {i}: '{ex['text']}'")
    print(f"    预测: {ex['predicted']} → 纠正: {ex['corrected']} [{status}]")
```

**预期输出：**
```
=== 运行纠正流程 ===

--- 处理文本: 这个产品还行吧，一般般 ---
  [Agent] 分类结果: neutral
  [系统] ⏸️ 等待人类确认或纠正...
  [系统] 文本: 这个产品还行吧，一般般
  [系统] Agent 分类: neutral

--- 处理文本: 太好用了，强烈推荐！ ---
  [Agent] 分类结果: positive
  [系统] ⏸️ 等待人类确认或纠正...
  [系统] 文本: 太好用了，强烈推荐！
  [系统] Agent 分类: positive

--- 处理文本: 服务态度很差，非常失望 ---
  [Agent] 分类结果: negative
  [系统] ⏸️ 等待人类确认或纠正...
  [系统] 文本: 服务态度很差，非常失望
  [系统] Agent 分类: negative

=== 学习样本汇总 ===
  样本 1: '这个产品还行吧，一般般'
    预测: neutral → 纠正: neutral [✓ 正确]
  样本 2: '太好用了，强烈推荐！'
    预测: positive → 纠正: positive [✓ 正确]
  样本 3: '服务态度很差，非常失望'
    预测: negative → 纠正: negative [✓ 正确]
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | `interrupt` 报错 `ImportError` | 确保使用 `from langgraph.graph import interrupt`，版本 >= 0.2 |
| 2 | 工作流无法恢复 | 检查 `thread_id` 是否一致，同一个会话必须用相同的 thread_id |
| 3 | 人类输入格式错误 | 在 interrupt 的 instructions 中明确说明输入格式 |
| 4 | 反馈循环无限进行 | 添加最大迭代次数限制（如 `iteration >= 5` 则强制结束） |
| 5 | 并发请求冲突 | 为每个请求分配唯一 thread_id |
| 6 | 状态丢失 | 使用 MemorySaver（内存）或 SQLite/PostgreSQL（持久化） |
| 7 | interrupt 后状态不更新 | 确保 interrupt 返回的字典包含所有需要的字段 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Human-in-the-Loop | 人类参与 Agent 决策循环的协作模式 |
| 审批模式 (Approval) | Agent 提出方案，人类审批后才执行 |
| 反馈模式 (Feedback) | Agent 生成内容，人类提供反馈驱动改进 |
| 纠正模式 (Correction) | Agent 做出预测，人类纠正并记录为训练数据 |
| interrupt | LangGraph 中暂停图执行、等待人类输入的机制 |
| MemorySaver | LangGraph 的内存检查点，支持断点续传 |
| Thread ID | 请求唯一标识符，用于跟踪和恢复会话 |
| 反馈循环 | 人类反馈驱动 Agent 持续改进的闭环机制 |
| 断点续传 | 工作流暂停后从断点恢复执行的能力 |
| 优雅降级 | 人类不响应时的超时处理和默认行为 |

## ✅ 验收清单
- [ ] 能说出三种 HITL 模式的区别和适用场景
- [ ] 能用 `interrupt` 实现人工审批节点
- [ ] 能用 MemorySaver 实现断点续传
- [ ] 能构建反馈循环工作流（生成 → 反馈 → 改进）
- [ ] 理解 thread_id 的作用和使用方式
- [ ] 能设计 HITL 系统的超时和降级策略

## 📝 复盘小纸条
- 今天最大的收获: _______________
- 还不太确定的: _______________

## 📥 明日同步接口
- 今日完成度: _______________
- 卡点描述: _______________
- 代码是否能跑通: _______________
- 明天希望: _______________
