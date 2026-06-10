# Phase 1 Week 4：Agent 经典范式

> **目标**：深入学习 Agent 的经典范式——ReAct、Plan-and-Solve、Reflection、Metacognition 以及五种工作流模式，为构建自己的 Agent 系统打下理论和实践基础。
> **周期**：Week 4，共 7 天

---

## 📅 Day 1：ReAct 范式——推理与行动

### 🧭 今日方向
学习 ReAct（Reasoning + Acting）范式，理解"思考-行动-观察"循环的核心思想。

### 🎯 生活比喻
ReAct 就像"侦探破案"——先推理（分析线索），再行动（调查取证），再观察（发现新线索），循环往复直到破案。

### 📋 今日三件事
1. 理解 ReAct 范式的原理
2. 实现一个简单的 ReAct Agent
3. 体验推理-行动-观察循环

---

### 🗺️ 手把手路线

#### 第一步：理解 ReAct

**做什么**：阅读代码区中的 ReAct 概念说明，理解 Thought-Action-Observation 循环。

**为什么**：ReAct 是 Agent 最经典的范式，理解它是后续所有范式的基础。

**成功标志**：能画出 ReAct 的循环流程图。

---

#### 第二步：实现 ReAct Agent

**做什么**：运行代码区中的 ReAct 实现代码，观察 Agent 如何循环执行。

**为什么**：亲手实现才能真正理解。

**成功标志**：能看到 Agent 自动进行多轮推理和行动。

---

#### 第三步：分析 ReAct 的优缺点

**做什么**：思考 ReAct 的优势和局限性。

**为什么**：理解范式的局限性才能知道何时使用、何时改进。

**成功标志**：能说出 ReAct 的 2 个优点和 2 个缺点。

---

### 💻 代码区

```python
# react_agent.py —— ReAct 范式实现

from dataclasses import dataclass, field
from typing import Callable
from enum import Enum

# === 数据模型 ===
class ActionType(Enum):
    """行动类型"""
    SEARCH = "search"           # 搜索
    CALCULATE = "calculate"     # 计算
    FINISH = "finish"           # 完成

@dataclass
class ReActStep:
    """ReAct 单步记录"""
    thought: str                # 推理过程
    action: ActionType          # 行动类型
    action_input: str           # 行动输入
    observation: str = ""       # 观察结果

# === ReAct Agent ===
class ReActAgent:
    """
    ReAct Agent 实现
    
    核心循环：Thought → Action → Observation → Thought → ...
    """
    
    def __init__(self, name: str = "ReAct Agent"):
        self.name = name
        self.steps: list[ReActStep] = []
        self.max_steps = 10  # 最大循环次数（防止死循环）
        
        # 注册工具
        self.tools: dict[str, Callable] = {
            "search": self._search_tool,
            "calculate": self._calculate_tool,
        }
    
    def _search_tool(self, query: str) -> str:
        """模拟搜索工具"""
        # 实际应调用搜索引擎 API
        mock_results = {
            "python": "Python 是一种解释型、面向对象的高级编程语言。",
            "agent": "Agent 是能够自主决策和行动的智能系统。",
            "llm": "LLM（大语言模型）是基于 Transformer 的语言模型。",
        }
        
        query_lower = query.lower()
        for key, value in mock_results.items():
            if key in query_lower:
                return f"搜索结果: {value}"
        
        return f"搜索结果: 关于 '{query}' 的相关信息..."
    
    def _calculate_tool(self, expression: str) -> str:
        """模拟计算工具"""
        try:
            # 安全的数学计算（实际应使用专门的数学库）
            result = eval(expression, {"__builtins__": {}}, {})
            return f"计算结果: {expression} = {result}"
        except Exception as e:
            return f"计算错误: {str(e)}"
    
    def think(self, task: str, context: str = "") -> ReActStep:
        """
        思考阶段 - LLM 推理下一步行动
        
        实际应用中，这应该调用 LLM API
        """
        # 模拟 LLM 推理（实际应调用 API）
        if not context:
            thought = f"我需要回答关于 '{task}' 的问题。让我先搜索相关信息。"
            action = ActionType.SEARCH
            action_input = task
        elif "搜索结果" in context:
            thought = "我已经获得了一些信息。让我检查是否需要进一步计算或可以直接回答。"
            action = ActionType.FINISH
            action_input = f"基于搜索结果回答: {context}"
        else:
            thought = "让我搜索更多信息来补充。"
            action = ActionType.SEARCH
            action_input = task
        
        return ReActStep(
            thought=thought,
            action=action,
            action_input=action_input,
        )
    
    def act(self, step: ReActStep) -> str:
        """执行行动"""
        tool = self.tools.get(step.action.value)
        if tool:
            return tool(step.action_input)
        return f"未知行动: {step.action}"
    
    def run(self, task: str) -> str:
        """
        执行 ReAct 循环
        
        参数:
            task: 用户任务
        返回:
            最终回答
        """
        print(f"\n{'='*60}")
        print(f"任务: {task}")
        print(f"{'='*60}")
        
        context = ""
        
        for i in range(self.max_steps):
            print(f"\n--- 步骤 {i+1} ---")
            
            # 思考
            step = self.think(task, context)
            print(f"💭 思考: {step.thought}")
            
            # 如果是完成动作，返回结果
            if step.action == ActionType.FINISH:
                print(f"✅ 完成: {step.action_input}")
                self.steps.append(step)
                return step.action_input
            
            # 行动
            print(f"🔧 行动: {step.action.value}({step.action_input})")
            
            # 观察
            observation = self.act(step)
            print(f"👁️ 观察: {observation}")
            
            # 记录
            step.observation = observation
            self.steps.append(step)
            context = observation
        
        return "达到最大步骤数，未能完成任务"
    
    def get_trace(self) -> list[dict]:
        """获取执行轨迹"""
        return [
            {
                "step": i + 1,
                "thought": step.thought,
                "action": step.action.value,
                "observation": step.observation,
            }
            for i, step in enumerate(self.steps)
        ]

# === 使用示例 ===
if __name__ == "__main__":
    agent = ReActAgent()
    
    # 执行任务
    result = agent.run("什么是 Python？")
    
    # 查看执行轨迹
    print("\n=== 执行轨迹 ===")
    for step in agent.get_trace():
        print(f"\n步骤 {step['step']}:")
        print(f"  思考: {step['thought']}")
        print(f"  行动: {step['action']}")
        print(f"  观察: {step['observation'][:100]}...")

# === ReAct 流程图 ===
"""
ReAct 范式流程：

用户提问
    ↓
┌─────────────────────────────┐
│        Thought（推理）       │
│  分析问题，决定下一步行动     │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│        Action（行动）        │
│  调用工具执行具体操作         │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│      Observation（观察）     │
│  获取行动结果，更新上下文     │
└─────────────┬───────────────┘
              ↓
        是否需要继续？
        ├─ 是 → 回到 Thought
        └─ 否 → 输出最终答案
"""
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| Agent 陷入死循环 | 设置 max_steps 限制，或检测重复步骤 |
| 工具调用失败 | 添加错误处理，返回友好提示 |
| 推理不准确 | 优化提示模板，提供更多上下文 |
| 步骤太多效率低 | 添加早期停止条件，如"已获得足够信息" |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| ReAct | 推理与行动 | "边想边做" |
| Thought | 推理过程 | "侦探分析线索" |
| Action | 执行行动 | "侦探调查取证" |
| Observation | 观察结果 | "发现新线索" |
| 循环 | 重复执行直到完成 | "反复调查直到破案" |
| 工具 | Agent 可调用的外部功能 | "侦探的工具箱" |
| 轨迹 | 执行过程的记录 | "破案记录" |

---

### ✅ 验收清单

- [ ] 能画出 ReAct 的循环流程图
- [ ] 能实现一个简单的 ReAct Agent
- [ ] 能说出 ReAct 的 2 个优点和 2 个缺点
- [ ] 理解 Thought-Action-Observation 循环
- [ ] 运行了代码区的示例代码

---

### 📝 复盘小纸条

> **ReAct 范式最吸引我的地方是什么？**
>
> 
>
> **ReAct 有什么局限性？**
>
> 
>
> **明天我想学习什么？**
>
> 

---

### 📥 明日同步接口

- 输入：ReAct 范式已掌握
- 输出：准备学习 Plan-and-Solve 范式
- 关键交接物：能实现 ReAct Agent

---

## 📅 Day 2：Plan-and-Solve 范式——规划与解决

### 🧭 今日方向
学习 Plan-and-Solve 范式，理解"先规划，再执行"的思想。

### 🎯 生活比喻
Plan-and-Solve 就像"做菜谱"——先想好做什么菜、需要什么食材、按什么步骤做，然后一步步执行。不像 ReAct 那样走一步看一步。

### 📋 今日三件事
1. 理解 Plan-and-Solve 和 ReAct 的区别
2. 实现 Plan-and-Solve Agent
3. 对比两种范式的适用场景

---

### 🗺️ 手把手路线

#### 第一步：理解 Plan-and-Solve

**做什么**：阅读代码区中的概念说明，理解"规划优先"的思想。

**为什么**：复杂任务需要先规划，否则容易迷失方向。

**成功标志**：能说出 Plan-and-Solve 和 ReAct 的核心区别。

---

#### 第二步：实现 Plan-and-Solve Agent

**做什么**：运行代码区中的实现代码，观察 Agent 如何先制定计划再执行。

**为什么**：亲手实现才能理解规划的价值。

**成功标志**：能看到 Agent 先生成完整计划，再逐步执行。

---

#### 第三步：对比分析

**做什么**：对比 ReAct 和 Plan-and-Solve 的优缺点。

**为什么**：不同范式适合不同场景。

**成功标志**：能根据任务类型选择合适的范式。

---

### 💻 代码区

```python
# plan_and_solve_agent.py —— Plan-and-Solve 范式实现

from dataclasses import dataclass, field
from typing import Any

# === 数据模型 ===
@dataclass
class PlanStep:
    """计划步骤"""
    step_id: int
    description: str            # 步骤描述
    tool: str                   # 使用的工具
    input_template: str         # 输入模板
    depends_on: list[int] = field(default_factory=list)  # 依赖的步骤
    result: Any = None          # 执行结果

@dataclass
class Plan:
    """执行计划"""
    goal: str                   # 目标
    steps: list[PlanStep]       # 步骤列表
    status: str = "pending"     # pending/executing/completed/failed

# === Plan-and-Solve Agent ===
class PlanAndSolveAgent:
    """
    Plan-and-Solve Agent 实现
    
    核心思想：先制定完整计划，再逐步执行
    """
    
    def __init__(self, name: str = "Plan-and-Solve Agent"):
        self.name = name
        self.plan: Plan | None = None
        
        # 注册工具
        self.tools: dict[str, callable] = {
            "search": self._search,
            "calculate": self._calculate,
            "summarize": self._summarize,
            "format": self._format_output,
        }
    
    def _search(self, query: str) -> str:
        """搜索工具"""
        return f"搜索结果: 关于 '{query}' 的信息已找到"
    
    def _calculate(self, expression: str) -> str:
        """计算工具"""
        try:
            result = eval(expression)
            return f"计算结果: {expression} = {result}"
        except:
            return f"计算错误: {expression}"
    
    def _summarize(self, content: str) -> str:
        """摘要工具"""
        return f"摘要: {content[:100]}..."
    
    def _format_output(self, content: str) -> str:
        """格式化工具"""
        return f"格式化输出: {content}"
    
    def create_plan(self, goal: str) -> Plan:
        """
        创建执行计划
        
        实际应用中，这应该调用 LLM API
        """
        print(f"\n{'='*60}")
        print(f"目标: {goal}")
        print(f"{'='*60}")
        
        # 模拟 LLM 生成计划（实际应调用 API）
        steps = [
            PlanStep(
                step_id=1,
                description="分析任务需求，确定关键信息",
                tool="search",
                input_template=goal,
            ),
            PlanStep(
                step_id=2,
                description="收集相关资料和数据",
                tool="search",
                input_template="相关信息",
                depends_on=[1],
            ),
            PlanStep(
                step_id=3,
                description="整理和分析收集到的信息",
                tool="summarize",
                input_template="原始数据",
                depends_on=[2],
            ),
            PlanStep(
                step_id=4,
                description="生成最终结果",
                tool="format",
                input_template="分析结果",
                depends_on=[3],
            ),
        ]
        
        self.plan = Plan(goal=goal, steps=steps)
        
        # 打印计划
        print("\n📋 执行计划:")
        for step in steps:
            deps = f" (依赖: {step.depends_on})" if step.depends_on else ""
            print(f"  步骤 {step.step_id}: {step.description}{deps}")
        
        return self.plan
    
    def execute_step(self, step: PlanStep, context: dict) -> str:
        """执行单个步骤"""
        tool = self.tools.get(step.tool)
        if not tool:
            return f"工具 {step.tool} 不存在"
        
        # 准备输入（替换模板中的变量）
        input_data = step.input_template
        for key, value in context.items():
            input_data = input_data.replace(f"{{{key}}}", str(value))
        
        # 执行工具
        result = tool(input_data)
        step.result = result
        
        return result
    
    def execute_plan(self) -> str:
        """执行整个计划"""
        if not self.plan:
            return "没有计划可执行"
        
        self.plan.status = "executing"
        context = {}  # 执行上下文
        
        print("\n🚀 开始执行计划...")
        
        for step in self.plan.steps:
            print(f"\n--- 执行步骤 {step.step_id}: {step.description} ---")
            
            # 检查依赖
            deps_met = all(
                context.get(f"step_{dep}") is not None
                for dep in step.depends_on
            )
            
            if not deps_met:
                print(f"  ⚠️ 依赖未满足，跳过步骤 {step.step_id}")
                continue
            
            # 执行步骤
            result = self.execute_step(step, context)
            context[f"step_{step.step_id}"] = result
            
            print(f"  ✅ 完成: {result[:100]}...")
        
        self.plan.status = "completed"
        
        # 返回最终结果
        final_step = self.plan.steps[-1]
        return final_step.result or "计划执行完成"
    
    def run(self, goal: str) -> str:
        """运行 Plan-and-Solve 循环"""
        # 创建计划
        self.create_plan(goal)
        
        # 执行计划
        result = self.execute_plan()
        
        return result

# === 使用示例 ===
if __name__ == "__main__":
    agent = PlanAndSolveAgent()
    result = agent.run("分析 Python 的主要应用领域")
    print(f"\n最终结果: {result}")

# === Plan-and-Solve vs ReAct ===
"""
对比：

Plan-and-Solve:
  优点：
    - 全局规划，不易迷失方向
    - 适合复杂、多步骤任务
    - 可以并行执行无依赖的步骤
  缺点：
    - 初始规划可能不准确
    - 难以处理计划外的情况
    - 规划阶段耗时

ReAct:
  优点：
    - 灵活，能根据观察调整策略
    - 适合动态变化的任务
    - 实现简单
  缺点：
    - 容易陷入局部最优
    - 可能浪费步骤
    - 缺乏全局视野

适用场景：
  Plan-and-Solve: 项目规划、论文写作、数据分析报告
  ReAct: 搜索问答、动态决策、实时交互
"""
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| 计划不准确 | 允许在执行中修改计划（动态规划） |
| 依赖管理复杂 | 使用拓扑排序确定执行顺序 |
| 计划步骤太多 | 简化计划，合并相关步骤 |
| 执行中遇到意外 | 添加异常处理，回退或调整计划 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| Plan-and-Solve | 规划与解决 | "先做菜谱再做菜" |
| 计划 | 执行步骤的有序列表 | "菜谱" |
| 依赖 | 步骤之间的前后关系 | "先洗菜才能切菜" |
| 上文 | 执行过程中积累的信息 | "做菜过程中的笔记" |
| 动态规划 | 执行中修改计划 | "做菜时调整口味" |
| 拓扑排序 | 确定步骤执行顺序 | "安排做菜顺序" |

---

### ✅ 验收清单

- [ ] 能说出 Plan-and-Solve 和 ReAct 的区别
- [ ] 能实现 Plan-and-Solve Agent
- [ ] 理解计划和依赖的概念
- [ ] 能根据任务类型选择合适的范式
- [ ] 运行了代码区的示例代码

---

### 📝 复盘小纸条

> **Plan-and-Solve 比 ReAct 好在哪里？**
>
> 
>
> **什么情况下应该选择 Plan-and-Solve？**
>
> 
>
> **明天我想学习什么？**
>
> 

---

### 📥 明日同步接口

- 输入：Plan-and-Solve 范式已掌握
- 输出：准备学习 Reflection 范式
- 关键交接物：能实现 Plan-and-Solve Agent

---

## 📅 Day 3：Reflection 范式——自我反思

### 🧭 今日方向
学习 Reflection 范式，理解 Agent 如何通过自我反思来改进输出。

### 🎯 生活比喻
Reflection 就像"写作文后自己批改"——写完初稿后，回头检查哪里不好，然后修改，循环直到满意。

### 📋 今日三件事
1. 理解 Reflection 范式的原理
2. 实现带自我反思的 Agent
3. 体验迭代优化的过程

---

### 🗺️ 手把手路线

#### 第一步：理解 Reflection

**做什么**：阅读代码区中的概念说明，理解"生成-评估-改进"循环。

**为什么**：Reflection 是提升 Agent 输出质量的关键技术。

**成功标志**：能画出 Reflection 的循环流程图。

---

#### 第二步：实现 Reflection Agent

**做什么**：运行代码区中的实现代码，观察 Agent 如何迭代改进。

**为什么**：亲手实现才能理解反思的价值。

**成功标志**：能看到 Agent 的输出质量随迭代次数提升。

---

#### 第三步：分析 Reflection 的价值

**做什么**：思考 Reflection 解决了什么问题。

**为什么**：理解范式的价值才能正确使用。

**成功标志**：能说出 Reflection 的 2 个应用场景。

---

### 💻 代码区

```python
# reflection_agent.py —— Reflection 范式实现

from dataclasses import dataclass, field

# === 数据模型 ===
@dataclass
class ReflectionResult:
    """反思结果"""
    iteration: int              # 迭代次数
    output: str                 # 当前输出
    critique: str               # 自我批评
    improvements: list[str]     # 改进建议
    score: float                # 质量评分 (0-10)

# === Reflection Agent ===
class ReflectionAgent:
    """
    Reflection Agent 实现
    
    核心循环：生成 → 评估 → 改进 → 生成 → ...
    """
    
    def __init__(
        self,
        name: str = "Reflection Agent",
        max_iterations: int = 3,
        quality_threshold: float = 8.0,
    ):
        self.name = name
        self.max_iterations = max_iterations
        self.quality_threshold = quality_threshold
        self.history: list[ReflectionResult] = []
    
    def generate(self, task: str, context: str = "") -> str:
        """
        生成初始输出
        
        实际应用中，这应该调用 LLM API
        """
        # 模拟 LLM 生成
        if not context:
            return f"关于 '{task}' 的初步回答：这是一个基础的回答，可能不够完善。"
        else:
            return f"改进后的回答：{context}"
    
    def self_critique(self, task: str, output: str) -> tuple[str, list[str], float]:
        """
        自我评估和批评
        
        返回: (批评, 改进建议, 评分)
        """
        # 模拟 LLM 评估
        critique = f"当前回答存在以下问题："
        improvements = []
        score = 6.0  # 基础分
        
        if len(output) < 100:
            critique += "内容太简短。"
            improvements.append("添加更多细节和例子")
            score -= 1
        
        if "可能" in output or "也许" in output:
            critique += "表达不够确定。"
            improvements.append("使用更肯定的语言")
            score -= 0.5
        
        if "基础" in output or "初步" in output:
            critique += "深度不够。"
            improvements.append("深入分析关键点")
            score += 1  # 识别出问题本身是加分项
        
        if not improvements:
            improvements.append("保持当前质量")
            score = 8.5
        
        return critique, improvements, min(score, 10.0)
    
    def improve(self, task: str, output: str, critique: str, improvements: list[str]) -> str:
        """
        基于批评改进输出
        """
        # 构建改进提示
        improvement_prompt = f"""
原始输出: {output}

自我批评: {critique}

改进建议: {', '.join(improvements)}

请基于以上批评和建议，改进输出内容。
"""
        
        # 实际应调用 LLM API
        improved = f"经过反思改进的回答：{output}（已根据建议优化）"
        return improved
    
    def reflect(self, task: str) -> str:
        """
        执行 Reflection 循环
        
        参数:
            task: 用户任务
        返回:
            最终优化后的输出
        """
        print(f"\n{'='*60}")
        print(f"任务: {task}")
        print(f"{'='*60}")
        
        # 初始生成
        current_output = self.generate(task)
        print(f"\n📝 初始生成:")
        print(f"   {current_output}")
        
        for iteration in range(1, self.max_iterations + 1):
            print(f"\n--- 迭代 {iteration} ---")
            
            # 自我批评
            critique, improvements, score = self.self_critique(task, current_output)
            print(f"🔍 自我批评: {critique}")
            print(f"💡 改进建议: {improvements}")
            print(f"📊 质量评分: {score}/10")
            
            # 记录历史
            self.history.append(ReflectionResult(
                iteration=iteration,
                output=current_output,
                critique=critique,
                improvements=improvements,
                score=score,
            ))
            
            # 检查是否达到质量标准
            if score >= self.quality_threshold:
                print(f"\n✅ 达到质量标准 ({score} >= {self.quality_threshold})，停止迭代")
                break
            
            # 改进
            current_output = self.improve(task, current_output, critique, improvements)
            print(f"🔄 改进后: {current_output}")
        
        return current_output
    
    def get_improvement_history(self) -> list[dict]:
        """获取改进历史"""
        return [
            {
                "iteration": h.iteration,
                "score": h.score,
                "improvements": h.improvements,
            }
            for h in self.history
        ]

# === 使用示例 ===
if __name__ == "__main__":
    agent = ReflectionAgent(max_iterations=3, quality_threshold=8.0)
    
    result = agent.reflect("解释什么是人工智能")
    
    print("\n=== 改进历史 ===")
    for record in agent.get_improvement_history():
        print(f"迭代 {record['iteration']}: 评分 {record['score']}, 改进: {record['improvements']}")

# === Reflection 流程图 ===
"""
Reflection 范式流程：

用户任务
    ↓
┌─────────────────────────────┐
│        生成 (Generate)       │
│  基于任务生成初始输出         │
└─────────────┬───────────────┘
              ↓
┌─────────────────────────────┐
│       评估 (Evaluate)        │
│  自我批评，识别不足           │
└─────────────┬───────────────┘
              ↓
        质量是否达标？
        ├─ 否 → 改进 (Improve) → 回到生成
        └─ 是 → 输出最终结果
"""
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| 评估不准确 | 优化评估提示，提供更明确的标准 |
| 改进效果不明显 | 添加更具体的改进建议 |
| 迭代次数过多 | 提高质量阈值，或提前停止 |
| 陷入过度优化 | 设置最大迭代次数限制 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| Reflection | 自我反思 | "作文自己批改" |
| 自我批评 | 识别输出的不足 | "找毛病" |
| 改进建议 | 如何提升输出质量 | "修改意见" |
| 迭代 | 反复优化 | "修改、修改、再修改" |
| 质量评分 | 量化输出质量 | "打分" |
| 收敛 | 达到满意质量 | "改不动了" |

---

### ✅ 验收清单

- [ ] 能画出 Reflection 的循环流程图
- [ ] 能实现 Reflection Agent
- [ ] 理解生成-评估-改进循环
- [ ] 能说出 Reflection 的 2 个应用场景
- [ ] 运行了代码区的示例代码

---

### 📝 复盘小纸条

> **Reflection 解决了 Agent 的什么问题？**
>
> 
>
> **在什么情况下应该使用 Reflection？**
>
> 
>
> **明天我想学习什么？**
>
> 

---

### 📥 明日同步接口

- 输入：Reflection 范式已掌握
- 输出：准备学习 Metacognition 范式
- 关键交接物：能实现 Reflection Agent

---

## 📅 Day 4：Metacognition 范式——元认知

### 🧭 今日方向
学习 Metacognition（元认知）范式，理解 Agent 如何"思考自己的思考过程"。

### 🎯 生活比喻
Metacognition 就像"学习如何学习"——不只是解题，还要反思解题方法对不对，有没有更好的方法。

### 📋 今日三件事
1. 理解 Metacognition 的概念
2. 实现带元认知能力的 Agent
3. 体验多层反思的过程

---

### 🗺️ 手把手路线

#### 第一步：理解 Metacognition

**做什么**：阅读代码区中的概念说明，理解"关于思考的思考"。

**为什么**：元认知是高级 Agent 的核心能力。

**成功标志**：能说出 Metacognition 和 Reflection 的区别。

---

#### 第二步：实现 Metacognition Agent

**做什么**：运行代码区中的实现代码，观察 Agent 如何进行多层反思。

**为什么**：亲手实现才能理解元认知的价值。

**成功标志**：能看到 Agent 不仅反思输出，还反思策略本身。

---

#### 第三步：分析 Metacognition 的价值

**做什么**：思考元认知解决了什么问题。

**为什么**：理解范式的价值才能正确使用。

**成功标志**：能说出元认知的 2 个应用场景。

---

### 💻 代码区

```python
# metacognition_agent.py —— Metacognition 范式实现

from dataclasses import dataclass, field
from typing import Any

# === 数据模型 ===
@dataclass
class Thought:
    """思维记录"""
    level: int                  # 思维层级（0=行动，1=反思，2=元反思）
    content: str                # 思维内容
    strategy: str               # 使用的策略
    evaluation: str = ""        # 评估结果

@dataclass
class CognitiveProcess:
    """认知过程"""
    task: str                   # 任务
    thoughts: list[Thought] = field(default_factory=list)
    strategies_used: list[str] = field(default_factory=list)
    meta_strategies: list[str] = field(default_factory=list)

# === Metacognition Agent ===
class MetacognitionAgent:
    """
    Metacognition Agent 实现
    
    核心思想：思考自己的思考过程，优化策略选择
    """
    
    def __init__(self, name: str = "Metacognition Agent"):
        self.name = name
        self.process = None
        self.strategy_library: dict[str, str] = {
            "direct_answer": "直接回答",
            "step_by_step": "分步骤推理",
            "analogy": "类比推理",
            "decomposition": "分解问题",
        }
    
    def think_at_level(self, content: str, level: int, strategy: str = "") -> Thought:
        """
        在指定层级进行思考
        
        level 0: 行动层（执行具体操作）
        level 1: 反思层（评估行动结果）
        level 2: 元反思层（优化思考策略）
        """
        level_names = {0: "行动", 1: "反思", 2: "元反思"}
        
        if level == 0:
            evaluation = "行动完成，等待评估"
        elif level == 1:
            evaluation = "策略有效，可以继续"
        else:
            evaluation = "策略优化，效率提升"
        
        return Thought(
            level=level,
            content=content,
            strategy=strategy,
            evaluation=evaluation,
        )
    
    def select_strategy(self, task: str) -> str:
        """
        选择执行策略
        
        元认知能力：根据任务特点选择最优策略
        """
        # 模拟 LLM 推理（实际应调用 API）
        if "分析" in task or "比较" in task:
            return "step_by_step"
        elif "解释" in task or "什么是" in task:
            return "direct_answer"
        elif "如何" in task or "方法" in task:
            return "analogy"
        else:
            return "decomposition"
    
    def execute_with_metacognition(self, task: str) -> str:
        """
        使用元认知执行任务
        """
        self.process = CognitiveProcess(task=task)
        
        print(f"\n{'='*60}")
        print(f"任务: {task}")
        print(f"{'='*60}")
        
        # Level 2: 元反思 - 选择策略
        strategy = self.select_strategy(task)
        strategy_name = self.strategy_library.get(strategy, strategy)
        
        thought_l2 = self.think_at_level(
            f"分析任务特点，选择策略: {strategy_name}",
            level=2,
            strategy=strategy,
        )
        self.process.thoughts.append(thought_l2)
        self.process.meta_strategies.append(strategy)
        
        print(f"\n🧠 [元反思] 选择策略: {strategy_name}")
        print(f"   理由: {thought_l2.evaluation}")
        
        # Level 1: 反思 - 评估策略
        thought_l1 = self.think_at_level(
            f"评估策略 '{strategy_name}' 的适用性",
            level=1,
            strategy=strategy,
        )
        self.process.thoughts.append(thought_l1)
        
        print(f"\n🔍 [反思] 评估策略:")
        print(f"   {thought_l1.content}")
        print(f"   {thought_l1.evaluation}")
        
        # Level 0: 行动 - 执行策略
        result = self._execute_strategy(task, strategy)
        thought_l0 = self.think_at_level(
            f"使用 {strategy_name} 执行任务",
            level=0,
            strategy=strategy,
        )
        thought_l0.evaluation = f"执行完成: {result}"
        self.process.thoughts.append(thought_l0)
        self.process.strategies_used.append(strategy)
        
        print(f"\n⚙️ [行动] 执行策略:")
        print(f"   结果: {result}")
        
        # 元反思：评估整体效果
        final_thought = self.think_at_level(
            "评估整体执行效果，记录经验",
            level=2,
            strategy=strategy,
        )
        self.process.thoughts.append(final_thought)
        
        print(f"\n📊 [元反思] 总结经验:")
        print(f"   策略有效性: {final_thought.evaluation}")
        
        return result
    
    def _execute_strategy(self, task: str, strategy: str) -> str:
        """执行具体策略"""
        # 模拟不同策略的执行
        if strategy == "direct_answer":
            return f"直接回答: 关于 '{task}' 的答案"
        elif strategy == "step_by_step":
            return f"分步推理: 1. 分析 2. 推理 3. 结论"
        elif strategy == "analogy":
            return f"类比解释: '{task}' 就像..."
        else:
            return f"分解执行: {task} → 子任务1, 子任务2, 子任务3"
    
    def get_cognitive_report(self) -> dict:
        """获取认知过程报告"""
        if not self.process:
            return {}
        
        return {
            "task": self.process.task,
            "thoughts_count": len(self.process.thoughts),
            "strategies_used": self.process.strategies_used,
            "meta_strategies": self.process.meta_strategies,
            "levels": {
                "action": len([t for t in self.process.thoughts if t.level == 0]),
                "reflection": len([t for t in self.process.thoughts if t.level == 1]),
                "meta_reflection": len([t for t in self.process.thoughts if t.level == 2]),
            },
        }

# === 使用示例 ===
if __name__ == "__main__":
    agent = MetacognitionAgent()
    
    result = agent.execute_with_metacognition("分析 Python 的主要应用领域")
    
    print("\n=== 认知报告 ===")
    report = agent.get_cognitive_report()
    for key, value in report.items():
        print(f"  {key}: {value}")

# === Metacognition vs Reflection ===
"""
Metacognition vs Reflection:

Reflection:
  - 反思输出质量
  - 优化具体内容
  - 单层反思

Metacognition:
  - 反思思考过程
  - 优化策略选择
  - 多层反思（行动→反思→元反思）

元认知的核心能力：
  1. 策略选择：根据任务选择最优策略
  2. 过程监控：实时评估执行效果
  3. 经验学习：从每次执行中学习
"""
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| 策略选择不准确 | 优化策略选择算法，添加更多策略 |
| 元反思太耗时 | 限制元反思深度，只在关键节点反思 |
| 多层反思混乱 | 清晰定义每层的职责边界 |
| 经验学习效果差 | 建立经验库，使用向量检索相似经验 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| Metacognition | 元认知 | "思考自己的思考" |
| 策略选择 | 选择最优执行方法 | "选择最合适的工具" |
| 过程监控 | 实时评估执行效果 | "边做边检查" |
| 经验学习 | 从执行中积累经验 | "吃一堑长一智" |
| 认知层级 | 行动/反思/元反思 | "思考的深度" |
| 策略库 | 可用策略的集合 | "工具箱" |

---

### ✅ 验收清单

- [ ] 能说出 Metacognition 和 Reflection 的区别
- [ ] 能实现 Metacognition Agent
- [ ] 理解多层反思的概念
- [ ] 能说出元认知的 2 个应用场景
- [ ] 运行了代码区的示例代码

---

### 📝 复盘小纸条

> **Metacognition 比 Reflection 好在哪里？**
>
> 
>
> **元认知能力对 Agent 有什么价值？**
>
> 
>
> **明天我想学习什么？**
>
> 

---

### 📥 明日同步接口

- 输入：Metacognition 范式已掌握
- 输出：准备学习五种工作流模式
- 关键交接物：能实现 Metacognition Agent

---

## 📅 Day 5：五种工作流模式

### 🧭 今日方向
学习 Agent 开发中的五种常见工作流模式，理解它们各自的特点和适用场景。

### 🎯 生活比喻
五种工作流就像五种不同的"工作方式"——有的一条道走到底（链式），有的同时做多件事（并行），有的像树形展开（层级）。

### 📋 今日三件事
1. 了解五种工作流模式的定义
2. 理解每种模式的优缺点
3. 根据场景选择合适的工作流

---

### 🗺️ 手把手路线

#### 第一步：了解五种模式

**做什么**：阅读代码区中的模式说明，理解每种模式的特点。

**为什么**：不同任务需要不同的工作流。

**成功标志**：能说出五种模式的名称和基本特点。

---

#### 第二步：对比分析

**做什么**：对比五种模式的优缺点和适用场景。

**为什么**：选对模式事半功倍。

**成功标志**：能根据任务类型推荐合适的工作流。

---

#### 第三步：实践场景选择

**做什么**：为给定的任务场景选择最合适的工作流。

**为什么**：理论结合实践才能真正掌握。

**成功标志**：能为 3 个场景选择合适的工作流。

---

### 💻 代码区

```python
# workflow_patterns.py —— 五种工作流模式

from dataclasses import dataclass, field
from typing import Callable, Any
from enum import Enum

# === 五种工作流模式 ===

class WorkflowType(Enum):
    """工作流类型"""
    CHAIN = "chain"                 # 链式
    PARALLEL = "parallel"           # 并行
    ROUTING = "routing"             # 路由
    ORCHESTRATOR = "orchestrator"   # 编排
    HIERARCHICAL = "hierarchical"   # 层级

# === 模式 1：链式工作流 (Chain) ===
@dataclass
class ChainStep:
    """链式步骤"""
    name: str
    func: Callable

class ChainWorkflow:
    """
    链式工作流
    
    特点：步骤按顺序执行，上一步的输出是下一步的输入
    适合：数据处理管道、ETL 流程
    """
    
    def __init__(self):
        self.steps: list[ChainStep] = []
    
    def add_step(self, name: str, func: Callable):
        self.steps.append(ChainStep(name=name, func=func))
    
    def execute(self, input_data: Any) -> Any:
        result = input_data
        for step in self.steps:
            print(f"  链式执行: {step.name}")
            result = step.func(result)
        return result

# === 模式 2：并行工作流 (Parallel) ===
class ParallelWorkflow:
    """
    并行工作流
    
    特点：多个任务同时执行，最后合并结果
    适合：需要同时处理多个独立任务的场景
    """
    
    def __init__(self):
        self.tasks: list[tuple[str, Callable]] = []
    
    def add_task(self, name: str, func: Callable):
        self.tasks.append((name, func))
    
    def execute(self, input_data: Any) -> list[Any]:
        results = []
        for name, func in self.tasks:
            print(f"  并行执行: {name}")
            results.append(func(input_data))
        return results

# === 模式 3：路由工作流 (Routing) ===
class RoutingWorkflow:
    """
    路由工作流
    
    特点：根据输入类型选择不同的处理路径
    适合：需要根据不同条件执行不同逻辑的场景
    """
    
    def __init__(self):
        self.routes: dict[str, Callable] = {}
        self.default_route: Callable | None = None
    
    def add_route(self, route_key: str, func: Callable):
        self.routes[route_key] = func
    
    def set_default(self, func: Callable):
        self.default_route = func
    
    def execute(self, route_key: str, input_data: Any) -> Any:
        func = self.routes.get(route_key, self.default_route)
        if func:
            print(f"  路由到: {route_key}")
            return func(input_data)
        return None

# === 模式 4：编排工作流 (Orchestrator) ===
@dataclass
class OrchestratorTask:
    """编排任务"""
    name: str
    agent: Any
    dependencies: list[str] = field(default_factory=list)

class OrchestratorWorkflow:
    """
    编排工作流
    
    特点：中央协调者分配任务，管理依赖和结果
    适合：多 Agent 协作的复杂任务
    """
    
    def __init__(self):
        self.tasks: dict[str, OrchestratorTask] = {}
        self.results: dict[str, Any] = {}
    
    def add_task(self, name: str, agent: Any, dependencies: list[str] = None):
        self.tasks[name] = OrchestratorTask(
            name=name,
            agent=agent,
            dependencies=dependencies or [],
        )
    
    def execute(self, task_name: str) -> Any:
        task = self.tasks.get(task_name)
        if not task:
            return None
        
        # 检查依赖
        for dep in task.dependencies:
            if dep not in self.results:
                self.execute(dep)  # 递归执行依赖
        
        print(f"  编排执行: {task_name}")
        # 实际应调用 agent.execute()
        result = f"{task_name} 完成"
        self.results[task_name] = result
        return result

# === 模式 5：层级工作流 (Hierarchical) ===
class HierarchicalWorkflow:
    """
    层级工作流
    
    特点：树形结构，任务分解为子任务
    适合：复杂项目的任务分解和管理
    """
    
    def __init__(self):
        self.root: dict[str, Any] = {}
    
    def add_node(self, parent: str, node: str, executor: Callable = None):
        if parent not in self.root:
            self.root[parent] = {"children": [], "executor": None}
        if node not in self.root:
            self.root[node] = {"children": [], "executor": None}
        self.root[parent]["children"].append(node)
        if executor:
            self.root[node]["executor"] = executor
    
    def execute(self, node: str) -> Any:
        if node not in self.root:
            return None
        
        node_data = self.root[node]
        
        # 执行子节点
        child_results = []
        for child in node_data["children"]:
            child_results.append(self.execute(child))
        
        # 执行当前节点
        print(f"  层级执行: {node}")
        if node_data["executor"]:
            return node_data["executor"](child_results)
        return child_results

# === 使用示例 ===
if __name__ == "__main__":
    print("=== 链式工作流 ===")
    chain = ChainWorkflow()
    chain.add_step("步骤1", lambda x: f"{x} -> 处理1")
    chain.add_step("步骤2", lambda x: f"{x} -> 处理2")
    chain.add_step("步骤3", lambda x: f"{x} -> 处理3")
    result = chain.execute("初始数据")
    print(f"结果: {result}")
    
    print("\n=== 并行工作流 ===")
    parallel = ParallelWorkflow()
    parallel.add_task("任务A", lambda x: f"A处理: {x}")
    parallel.add_task("任务B", lambda x: f"B处理: {x}")
    parallel.add_task("任务C", lambda x: f"C处理: {x}")
    results = parallel.execute("输入数据")
    print(f"结果: {results}")
    
    print("\n=== 路由工作流 ===")
    routing = RoutingWorkflow()
    routing.add_route("type_a", lambda x: f"A类型处理: {x}")
    routing.add_route("type_b", lambda x: f"B类型处理: {x}")
    routing.set_default(lambda x: f"默认处理: {x}")
    result = routing.execute("type_a", "测试数据")
    print(f"结果: {result}")

# === 工作流选择指南 ===
"""
五种工作流模式对比：

1. 链式 (Chain):
   优点：简单直观，易于实现
   缺点：不灵活，一步出错全链失败
   适合：数据处理管道、ETL

2. 并行 (Parallel):
   优点：速度快，资源利用率高
   缺点：合并结果可能复杂
   适合：多数据源聚合、批量处理

3. 路由 (Routing):
   优点：灵活，可扩展
   缺点：路由逻辑可能复杂
   适合：多类型输入处理、条件分支

4. 编排 (Orchestrator):
   优点：管理复杂协作
   缺点：协调开销大
   适合：多 Agent 协作、复杂任务

5. 层级 (Hierarchical):
   优点：任务分解清晰
   缺点：层次过深难管理
   适合：项目管理、复杂任务分解

选择建议：
- 简单顺序任务 → 链式
- 独立并行任务 → 并行
- 条件分支任务 → 路由
- 多 Agent 协作 → 编排
- 复杂项目分解 → 层级
"""
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| 不知道选哪种工作流 | 从简单开始，链式或并行 |
| 工作流太复杂 | 简化设计，合并相关步骤 |
| 依赖管理困难 | 使用拓扑排序确定执行顺序 |
| 并行结果合并困难 | 设计好数据结构，统一输出格式 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| 链式工作流 | 顺序执行 | "流水线" |
| 并行工作流 | 同时执行 | "多线程" |
| 路由工作流 | 条件分支 | "分拣中心" |
| 编排工作流 | 中央协调 | "指挥中心" |
| 层级工作流 | 树形分解 | "组织架构" |
| 依赖 | 步骤间的前后关系 | "先做 A 才能做 B" |
| 协调 | 管理多个任务 | "调度员" |

---

### ✅ 验收清单

- [ ] 能说出五种工作流模式的名称
- [ ] 理解每种模式的特点和适用场景
- [ ] 能根据任务类型选择合适的工作流
- [ ] 运行了代码区的示例代码
- [ ] 能画出五种模式的简化流程图

---

### 📝 复盘小纸条

> **五种工作流中我最常用的是哪种？**
>
> 
>
> **什么场景下需要组合使用多种工作流？**
>
> 
>
> **明天我想学习什么？**
>
> 

---

### 📥 明日同步接口

- 输入：五种工作流模式已了解
- 输出：准备进行周复盘和项目整合
- 关键交接物：理解五种工作流模式的特点和适用场景

---

## 📅 Day 6：范式整合与实战

### 🧭 今日方向
将本周学习的所有范式整合到一个完整的项目中，体验不同范式的组合使用。

### 🎯 生活比喻
今天我们把各种"工具"组合成一个"完整的工具箱"——根据任务选择最合适的范式。

### 📋 今日三件事
1. 回顾本周学习的所有范式
2. 整合不同范式到一个项目中
3. 分析不同场景下的范式选择

---

### 🗺️ 手把手路线

#### 第一步：范式回顾

**做什么**：快速回顾 ReAct、Plan-and-Solve、Reflection、Metacognition 和五种工作流。

**为什么**：巩固记忆，建立知识网络。

**成功标志**：能快速说出每种范式的核心特点。

---

#### 第二步：范式整合

**做什么**：运行代码区中的整合项目，体验不同范式的组合。

**为什么**：实际项目往往需要组合使用多种范式。

**成功标志**：能看到不同范式在项目中的协作。

---

#### 第三步：场景分析

**做什么**：分析不同场景应该选择什么范式组合。

**为什么**：选对范式组合能大幅提升效果。

**成功标志**：能为 3 个场景设计范式组合方案。

---

### 💻 代码区

```python
# paradigm_integration.py —— 范式整合示例

from dataclasses import dataclass, field
from typing import Any

# === 综合 Agent 框架 ===
class IntegratedAgent:
    """
    整合多种范式的 Agent 框架
    
    根据任务特点自动选择和组合范式
    """
    
    def __init__(self, name: str = "综合 Agent"):
        self.name = name
        self.memory: list[dict] = []
        
        # 范式库
        self.paradigms = {
            "react": self._react_paradigm,
            "plan_and_solve": self._plan_and_solve_paradigm,
            "reflection": self._reflection_paradigm,
            "metacognition": self._metacognition_paradigm,
        }
    
    def _react_paradigm(self, task: str) -> str:
        """ReAct 范式"""
        print("  使用 ReAct 范式: 推理 → 行动 → 观察")
        return f"ReAct 处理: {task}"
    
    def _plan_and_solve_paradigm(self, task: str) -> str:
        """Plan-and-Solve 范式"""
        print("  使用 Plan-and-Solve 范式: 规划 → 执行")
        return f"Plan-and-Solve 处理: {task}"
    
    def _reflection_paradigm(self, task: str) -> str:
        """Reflection 范式"""
        print("  使用 Reflection 范式: 生成 → 评估 → 改进")
        return f"Reflection 处理: {task}"
    
    def _metacognition_paradigm(self, task: str) -> str:
        """Metacognition 范式"""
        print("  使用 Metacognition 范式: 策略选择 → 执行 → 元反思")
        return f"Metacognition 处理: {task}"
    
    def analyze_task(self, task: str) -> str:
        """分析任务，选择最合适的范式"""
        # 简化的任务分析（实际应调用 LLM）
        if "分析" in task or "比较" in task:
            return "plan_and_solve"
        elif "搜索" in task or "查找" in task:
            return "react"
        elif "写作" in task or "创作" in task:
            return "reflection"
        elif "优化" in task or "改进" in task:
            return "metacognition"
        else:
            return "react"
    
    def execute(self, task: str) -> str:
        """
        执行任务
        """
        print(f"\n{'='*60}")
        print(f"任务: {task}")
        print(f"{'='*60}")
        
        # 分析任务
        paradigm = self.analyze_task(task)
        print(f"\n选择范式: {paradigm}")
        
        # 执行范式
        result = self.paradigms[paradigm](task)
        
        # 记录到记忆
        self.memory.append({
            "task": task,
            "paradigm": paradigm,
            "result": result,
        })
        
        return result
    
    def get_paradigm_stats(self) -> dict:
        """获取范式使用统计"""
        stats = {}
        for record in self.memory:
            paradigm = record["paradigm"]
            stats[paradigm] = stats.get(paradigm, 0) + 1
        return stats

# === 使用示例 ===
if __name__ == "__main__":
    agent = IntegratedAgent()
    
    # 执行不同类型的任务
    tasks = [
        "分析 Python 和 Java 的区别",
        "搜索关于 AI Agent 的资料",
        "写一篇关于机器学习的文章",
        "优化代码性能",
    ]
    
    for task in tasks:
        agent.execute(task)
    
    # 查看统计
    print("\n=== 范式使用统计 ===")
    stats = agent.get_paradigm_stats()
    for paradigm, count in stats.items():
        print(f"  {paradigm}: {count} 次")

# === 范式选择决策树 ===
"""
范式选择指南：

任务分析
    │
    ├─ 需要搜索/查询？
    │   └─ 是 → ReAct
    │
    ├─ 需要多步骤规划？
    │   └─ 是 → Plan-and-Solve
    │
    ├─ 需要高质量输出？
    │   └─ 是 → Reflection
    │
    ├─ 需要策略优化？
    │   └─ 是 → Metacognition
    │
    └─ 其他 → ReAct（最通用）

组合使用场景：
- 写作任务：Reflection + Metacognition
- 研究任务：Plan-and-Solve + ReAct
- 复杂项目：编排工作流 + 多种范式
"""
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| 范式选择不准确 | 优化任务分析算法，添加更多特征 |
| 范式组合冲突 | 定义清晰的接口，避免范式间直接耦合 |
| 性能问题 | 选择轻量级范式，避免不必要的元认知 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| 范式整合 | 组合使用多种范式 | "工具箱" |
| 范式选择 | 根据任务选择范式 | "选择工具" |
| 协同效应 | 范式组合产生更好效果 | "1+1>2" |
| 任务分析 | 分析任务特点 | "诊断问题" |
| 决策树 | 范式选择的流程 | "选择指南" |

---

### ✅ 验收清单

- [ ] 能快速说出每种范式的核心特点
- [ ] 能整合不同范式到一个项目中
- [ ] 能根据场景选择合适的范式组合
- [ ] 运行了代码区的示例代码
- [ ] 能画出范式选择决策树

---

### 📝 复盘小纸条

> **范式整合解决了什么问题？**
>
> 
>
> **在什么场景下需要组合使用多种范式？**
>
> 
>
> **明天我想学习什么？**
>
> 

---

### 📥 明日同步接口

- 输入：范式整合已完成
- 输出：准备进行周复盘和总结
- 关键交接物：能根据任务选择和组合范式

---

## 📅 Day 7：周复盘 + Phase 1 总结

### 🧭 今日方向
回顾 Week 4 和整个 Phase 1 的所有内容，完成知识整合和复盘。

### 🎯 生活比喻
今天我们进行"期末考试"——回顾所有学过的内容，查漏补缺，为下一阶段做好准备。

### 📋 今日三件事
1. 回顾 Week 4 的所有内容
2. 回顾整个 Phase 1 的知识体系
3. 完成 Phase 1 总结和 Phase 2 预备

---

### 🗺️ 手把手路线

#### 第一步：回顾 Week 4

**做什么**：快速回顾 ReAct、Plan-and-Solve、Reflection、Metacognition 和五种工作流。

**为什么**：巩固本周学习的知识。

**成功标志**：能快速说出每种范式的核心特点。

---

#### 第二步：回顾 Phase 1

**做什么**：回顾 Phase 1 的四个 Week 的核心内容。

**为什么**：建立完整的知识体系。

**成功标志**：能画出 Phase 1 的知识图谱。

---

#### 第三步：完成复盘

**做什么**：在 Obsidian 中完成 Phase 1 的复盘笔记。

**为什么**：输出倒逼输入，写下来才是真正的掌握。

**成功标志**：完成一篇完整的 Phase 1 复盘笔记。

---

### 💻 代码区：Phase 1 知识图谱

```python
# phase1_summary.py —— Phase 1 知识总结

# === Phase 1 知识图谱 ===
phase1_knowledge = {
    "Week 1: Python 工程化 + HTTP": {
        "虚拟环境": "venv/poetry 项目隔离",
        "包管理": "pip/poetry 依赖管理",
        "HTTP": "请求/响应/状态码",
        "asyncio": "异步编程基础",
        "CLI": "命令行工具开发",
        "logging": "日志系统",
        "pytest": "测试框架",
    },
    "Week 2: FastAPI 后端开发": {
        "路由": "URL 到函数的映射",
        "Pydantic": "数据验证和序列化",
        "依赖注入": "资源共享和复用",
        "SQLAlchemy": "ORM 数据库操作",
        "JWT": "身份认证和授权",
        "WebSocket": "实时双向通信",
        "结构化输出": "API 响应格式控制",
    },
    "Week 3: LLM 原理与应用": {
        "NLP 基础": "自然语言处理概念",
        "Transformer": "注意力机制架构",
        "LLM 对比": "主流模型选型",
        "提示工程": "Prompt 设计技巧",
        "API 工程": "LLM API 调用实践",
        "应用模式": "RAG/Agent/多轮对话",
    },
    "Week 4: Agent 经典范式": {
        "ReAct": "推理与行动循环",
        "Plan-and-Solve": "规划优先范式",
        "Reflection": "自我反思改进",
        "Metacognition": "元认知策略优化",
        "工作流模式": "链式/并行/路由/编排/层级",
    },
}

print("=" * 60)
print("  Phase 1 知识图谱")
print("=" * 60)

for week, topics in phase1_knowledge.items():
    print(f"\n{week}:")
    for topic, description in topics.items():
        print(f"  • {topic}: {description}")

# === Phase 1 核心能力 ===
print("\n" + "=" * 60)
print("  Phase 1 核心能力")
print("=" * 60)

core_abilities = [
    "Python 工程化开发能力",
    "FastAPI 后端开发能力",
    "LLM API 调用和集成能力",
    "Agent 范式理解和应用能力",
    "提示工程设计能力",
    "数据库操作能力",
    "API 设计和文档能力",
]

for i, ability in enumerate(core_abilities, 1):
    print(f"  {i}. {ability}")

# === Phase 2 预告 ===
print("\n" + "=" * 60)
print("  Phase 2 预告")
print("=" * 60)

phase2_preview = {
    "Week 5": "Agent 核心机制 - 工具使用和记忆系统",
    "Week 6": "RAG 系统 - 向量数据库和检索增强",
    "Week 7": "多 Agent 协作 - 通信和协调",
    "Week 8": "项目实战 - 完整 Agent 系统开发",
}

for week, topic in phase2_preview.items():
    print(f"  {week}: {topic}")

# === 学习建议 ===
print("\n" + "=" * 60)
print("  学习建议")
print("=" * 60)

suggestions = [
    "每天复习 Obsidian 中的笔记，巩固记忆",
    "尝试将学到的知识应用到实际项目中",
    "多动手实践，代码是最好的老师",
    "遇到问题先思考，再查资料，最后问 AI",
    "保持好奇心，多问"为什么"",
]

for i, suggestion in enumerate(suggestions, 1):
    print(f"  {i}. {suggestion}")
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| 知识点太多记不住 | 制作思维导图，建立知识关联 |
| 概念混淆 | 通过对比和实践来区分 |
| 不知道怎么应用 | 找一个实际项目来练习 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| 知识图谱 | 知识点的可视化 | "学习地图" |
| 核心能力 | Phase 1 掌握的关键技能 | "毕业证书" |
| 复盘 | 回顾总结经验 | "期末总结" |
| 预备 | 为下一阶段做准备 | "预习新课" |

---

### ✅ 验收清单

- [ ] 回顾了 Week 4 的所有学习笔记
- [ ] 回顾了整个 Phase 1 的知识体系
- [ ] 在 Obsidian 中创建了 Phase 1 复盘笔记
- [ ] 了解了 Phase 2 的学习内容
- [ ] 能用自己的话说出 Phase 1 的核心收获

---

### 📝 复盘小纸条

> **Phase 1 最大的收获是什么？**
>
> 
>
> **哪个知识点还需要巩固？**
>
> 
>
> **我对 Phase 2 的期待是什么？**
>
> 

---

### 📥 明日同步接口

- 输入：Phase 1 全部完成
- 输出：正式进入 Phase 2 Agent 核心机制学习
- 关键交接物：完整的 Phase 1 知识体系 + Phase 2 学习准备
