# 📅 Week 8 Day 5：CrewAI —— 角色驱动的多 Agent 编排

## 🎯 今日方向

> CrewAI 是目前最流行的多 Agent 框架之一，通过"角色-任务-流程"的方式编排 Agent。今天学习 CrewAI 的核心概念，动手搭建一个内容创作团队，并对比 CrewAI 与 LangGraph 的差异。

## 🏠 生活比喻

> CrewAI 就像"组建一个电影剧组"：
> - **选角** = 定义 Agent 角色（导演、编剧、演员）
> - **剧本** = 分配 Task（每场戏的具体内容）
> - **拍摄计划** = Process（顺序拍还是并行拍）
> - **导演** = Crew（协调整个团队）
>
> 你不需要指挥每个演员的每个动作，只需要告诉他们角色和目标，他们会自己发挥。

## 📋 今日三件事

1. **理解 CrewAI 核心概念** —— Agent、Task、Crew、Process
2. **构建内容创作团队** —— 用 CrewAI 实现研究-写作-发布流程
3. **对比 CrewAI vs LangGraph** —— 理解各自的适用场景

## 🗺️ 手把手路线

### Step 1: CrewAI 架构理解（15 分钟）

- 做什么: 理解 Agent → Task → Crew → Process 的层级关系
- 为什么: 这是 CrewAI 的核心设计
- 成功标志: 能画出 CrewAI 的架构图

### Step 2: 定义 Agent 角色（20 分钟）

- 做什么: 定义角色、目标、背景故事
- 为什么: 好的角色定义决定了 Agent 的表现
- 成功标志: 每个 Agent 有清晰的职责

### Step 3: 设计 Task 流程（20 分钟）

- 做什么: 设计有依赖关系的任务链
- 为什么: 任务设计影响执行效率
- 成功标志: 任务能正确串联执行

### Step 4: 运行 Crew（25 分钟）

- 做什么: 创建 Crew 并运行
- 为什么: 实践是检验理解的唯一标准
- 成功标志: Crew 能正常运行并输出结果

## 💻 代码区

### 代码 1：CrewAI 核心概念与基础实现

```python
"""
Week 8 Day 5: CrewAI —— 角色驱动的多 Agent 编排
安装依赖: pip install crewai crewai-tools
注意: 如果安装失败，可以使用下方的纯 Python 模拟版本
"""

import json
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime


# ========== 1. CrewAI 概念概览 ==========
print("=" * 60)
print("1. CrewAI 核心概念")
print("=" * 60)

crewai_overview = """
CrewAI 架构:

┌─────────────────────────────────────────┐
│                  Crew                    │
│              (团队/项目)                  │
├─────────────────────────────────────────┤
│  Process (流程)                          │
│  - sequential: 顺序执行                  │
│  - hierarchical: 层级管理                │
├─────────────────────────────────────────┤
│  Tasks (任务)                            │
│  - 每个任务有明确的目标和期望输出         │
│  - 支持任务间依赖                        │
├─────────────────────────────────────────┤
│  Agents (角色)                           │
│  - role: 角色定位                        │
│  - goal: 要达成的目标                    │
│  - backstory: 背景故事                  │
│  - tools: 可用工具                       │
└─────────────────────────────────────────┘

核心概念:
  Agent: 有角色、目标和专长的 AI 助手
  Task: 需要完成的具体任务（有描述、期望输出、负责 Agent）
  Crew: Agent 和 Task 的组合（代表一个团队）
  Process: 任务执行的流程（sequential/hierarchical）
"""
print(crewai_overview)


# ========== 2. 纯 Python 模拟 CrewAI ==========
print("=" * 60)
print("2. 纯 Python 模拟 CrewAI（无需外部依赖）")
print("=" * 60)


@dataclass
class AgentRole:
    """Agent 角色定义"""
    role: str           # 角色名称
    goal: str           # 目标
    backstory: str      # 背景故事
    allow_delegation: bool = False  # 是否允许委派

    def __repr__(self):
        return f"Agent(role='{self.role}')"


@dataclass
class TaskDefinition:
    """任务定义"""
    description: str        # 任务描述
    expected_output: str    # 期望输出
    agent: AgentRole        # 负责的 Agent
    context_tasks: List[str] = field(default_factory=list)  # 依赖的任务名

    def __repr__(self):
        return f"Task(description='{self.description[:30]}...')"


class SimpleCrew:
    """简化版 CrewAI 实现"""

    def __init__(self, name: str = "Crew"):
        self.name = name
        self.agents: List[AgentRole] = []
        self.tasks: List[TaskDefinition] = []
        self.results: Dict[int, str] = {}  # task_index -> result
        self.execution_log: List[Dict] = []

    def add_agent(self, agent: AgentRole):
        """添加 Agent"""
        self.agents.append(agent)
        print(f"  [Crew] 添加 Agent: {agent.role}")

    def add_task(self, task: TaskDefinition):
        """添加 Task"""
        self.tasks.append(task)
        print(f"  [Crew] 添加 Task: {task.description[:40]}...")

    def kickoff(self) -> Dict[int, str]:
        """启动 Crew 执行"""
        print(f"\n{'='*50}")
        print(f"[{self.name}] 开始执行")
        print(f"{'='*50}")

        for i, task in enumerate(self.tasks):
            print(f"\n--- Task {i+1}: {task.agent.role} ---")
            print(f"  描述: {task.description[:50]}...")

            # 收集上下文（来自依赖任务的结果）
            context = ""
            for ctx_idx in task.context_tasks:
                # 查找依赖任务的索引
                for j, t in enumerate(self.tasks):
                    if t.description[:20] in ctx_idx:
                        context += self.results.get(j, "") + "\n"

            # 模拟执行
            result = self._simulate_execution(task, context)
            self.results[i] = result

            # 记录日志
            self.execution_log.append({
                "task_index": i,
                "agent": task.agent.role,
                "description": task.description[:50],
                "result_preview": result[:80],
                "timestamp": datetime.now().isoformat(),
            })

            print(f"  结果: {result[:80]}...")

        print(f"\n{'='*50}")
        print(f"[{self.name}] 执行完成")
        print(f"{'='*50}")

        return self.results

    def _simulate_execution(self, task: TaskDefinition, context: str) -> str:
        """模拟任务执行"""
        agent = task.agent

        if "研究" in agent.role or "分析" in agent.role:
            return f"【研究结果】\n关于 '{task.description[:20]}' 的分析:\n1. 趋势一: 大模型持续进化\n2. 趋势二: 多模态融合\n3. 趋势三: Agent 技术落地"
        elif "撰写" in agent.role or "写作" in agent.role:
            return f"【撰写内容】\n基于研究结果，撰写了关于 '{task.description[:20]}' 的文章:\n标题: AI 技术发展趋势\n正文: 随着技术的不断进步..."
        elif "审查" in agent.role or "审核" in agent.role:
            return f"【审查报告】\n内容质量评分: 8.5/10\n优点: 结构清晰，论据充分\n建议: 增加数据支撑，优化结论部分"
        elif "发布" in agent.role:
            return f"【发布确认】\n内容已准备发布:\n- 格式: Markdown\n- 字数: 约 2000 字\n- 状态: 待发布"
        else:
            return f"【任务完成】{task.agent.role} 已完成任务"


# ========== 3. 创建内容创作团队 ==========
print("\n" + "=" * 60)
print("3. 创建内容创作团队")
print("=" * 60)

# 定义 Agent
researcher = AgentRole(
    role="高级研究分析师",
    goal="发现关于给定主题的最新、最准确的信息",
    backstory="""你是一位经验丰富的研究分析师，擅长从各种来源收集和分析信息。
你对细节有敏锐的洞察力，总是能发现别人忽略的关键信息。""",
)

writer = AgentRole(
    role="技术内容撰写人",
    goal="将研究结果转化为清晰、引人入胜的内容",
    backstory="""你是一位专业的技术写作专家，擅长将复杂的概念用简单易懂的语言表达。
你的文章总是逻辑清晰、结构严谨。""",
)

reviewer = AgentRole(
    role="质量审查专家",
    goal="确保内容的准确性和质量",
    backstory="""你是一位严格的质量审查专家，对内容的准确性和完整性有极高的要求。
你会仔细检查每一个事实和数据。""",
)

publisher = AgentRole(
    role="内容发布专员",
    goal="确保内容格式正确并成功发布",
    backstory="""你是一位经验丰富的内容发布专员，熟悉各种发布平台的格式要求。""",
)

# 定义 Task
research_task = TaskDefinition(
    description="研究 AI Agent 技术的最新发展趋势，包括主流框架、应用场景和未来方向",
    expected_output="一份包含最新趋势、数据和案例的详细研究报告",
    agent=researcher,
)

writing_task = TaskDefinition(
    description="基于研究结果，撰写一篇关于 AI Agent 技术趋势的文章",
    expected_output="一篇完整的、结构清晰的技术文章",
    agent=writer,
    context_tasks=["研究 AI Agent 技术的最新发展趋势"],  # 依赖研究任务
)

review_task = TaskDefinition(
    description="审查文章的质量和准确性，提供修改建议",
    expected_output="审查报告，包含修改建议",
    agent=reviewer,
    context_tasks=["基于研究结果，撰写一篇关于 AI Agent 技术趋势的文章"],  # 依赖写作任务
)

publish_task = TaskDefinition(
    description="将审查通过的文章格式化并准备发布",
    expected_output="发布就绪的内容",
    agent=publisher,
    context_tasks=["审查文章的质量和准确性"],  # 依赖审查任务
)

# 创建 Crew
crew = SimpleCrew(name="内容创作团队")
crew.add_agent(researcher)
crew.add_agent(writer)
crew.add_agent(reviewer)
crew.add_agent(publisher)

crew.add_task(research_task)
crew.add_task(writing_task)
crew.add_task(review_task)
crew.add_task(publish_task)

# 运行 Crew
results = crew.kickoff()

# 查看执行日志
print("\n--- 执行日志 ---")
for log in crew.execution_log:
    print(f"  [{log['agent']}] {log['description']}")
```

### 代码 2：CrewAI 高级特性模拟

```python
"""
Week 8 Day 5: CrewAI 高级特性
委派、记忆、工具集成
"""

import json
from typing import Dict, List, Callable
from dataclasses import dataclass, field
from datetime import datetime


# ========== 1. Agent 工具系统 ==========
print("=" * 60)
print("1. Agent 工具系统")
print("=" * 60)


class AgentTool:
    """Agent 工具"""

    def __init__(self, name: str, description: str, func: Callable):
        self.name = name
        self.description = description
        self.func = func

    def run(self, **kwargs) -> str:
        """执行工具"""
        return self.func(**kwargs)


# 定义工具
def search_web(query: str) -> str:
    """模拟网页搜索"""
    return f"搜索结果: 关于 '{query}' 找到了 5 篇相关文章"

def read_file(filename: str) -> str:
    """模拟读取文件"""
    return f"文件 {filename} 的内容: 这是一些示例内容..."

def write_file(filename: str, content: str) -> str:
    """模拟写入文件"""
    return f"已将内容写入 {filename}"

def calculate(expression: str) -> str:
    """模拟计算"""
    try:
        result = eval(expression)
        return f"计算结果: {expression} = {result}"
    except:
        return f"计算错误: {expression}"


# 创建工具实例
tools = [
    AgentTool("search", "搜索互联网获取信息", search_web),
    AgentTool("read_file", "读取文件内容", read_file),
    AgentTool("write_file", "写入文件", write_file),
    AgentTool("calculate", "执行数学计算", calculate),
]

print("可用工具:")
for tool in tools:
    print(f"  - {tool.name}: {tool.description}")

# 测试工具
print("\n工具测试:")
print(f"  {tools[0].run(query='Python 教程')}")
print(f"  {tools[3].run(expression='2 + 3 * 4')}")


# ========== 2. 带工具的 Agent ==========
print("\n" + "=" * 60)
print("2. 带工具的 Agent")
print("=" * 60)


@dataclass
class EnhancedAgent:
    """增强版 Agent（支持工具和记忆）"""
    name: str
    role: str
    goal: str
    tools: List[AgentTool] = field(default_factory=list)
    memory: List[str] = field(default_factory=list)
    allow_delegation: bool = False

    def use_tool(self, tool_name: str, **kwargs) -> str:
        """使用工具"""
        for tool in self.tools:
            if tool.name == tool_name:
                result = tool.run(**kwargs)
                self.memory.append(f"使用工具 {tool_name}: {result[:50]}")
                return result
        return f"工具 {tool_name} 不存在"

    def think(self, task: str) -> str:
        """思考（模拟 LLM 推理）"""
        # 根据任务决定使用哪个工具
        if "搜索" in task or "查找" in task:
            result = self.use_tool("search", query=task)
            return f"通过搜索找到信息: {result}"
        elif "计算" in task:
            result = self.use_tool("calculate", expression="2+3")
            return f"通过计算得到结果: {result}"
        else:
            return f"直接处理任务: {task}"

    def delegate(self, task: str, target: 'EnhancedAgent') -> str:
        """委派任务给其他 Agent"""
        if not self.allow_delegation:
            return f"{self.name} 不允许委派"

        print(f"  [{self.name}] 委派任务给 [{target.name}]: {task[:30]}...")
        result = target.think(task)
        self.memory.append(f"委派给 {target.name}: {result[:50]}")
        return result

    def get_memory_summary(self) -> str:
        """获取记忆摘要"""
        if not self.memory:
            return "无记忆"
        return "\n".join(f"  - {m}" for m in self.memory[-5:])  # 最近 5 条


# 创建带工具的 Agent
researcher_agent = EnhancedAgent(
    name="研究员",
    role="research",
    goal="收集信息",
    tools=[tools[0], tools[1]],  # search, read_file
    allow_delegation=False,
)

writer_agent = EnhancedAgent(
    name="撰写人",
    role="writing",
    goal="撰写内容",
    tools=[tools[2]],  # write_file
    allow_delegation=False,
)

coordinator_agent = EnhancedAgent(
    name="协调者",
    role="coordination",
    goal="协调团队",
    tools=[],
    allow_delegation=True,  # 允许委派
)

# 测试 Agent
print("\nAgent 工具使用:")
print(f"  {researcher_agent.use_tool('search', query='最新 AI 技术')}")
print(f"  {researcher_agent.use_tool('read_file', filename='data.txt')}")

print("\nAgent 委派:")
print(f"  {coordinator_agent.delegate('搜索 Python 教程', researcher_agent)}")

print("\n记忆摘要:")
print(researcher_agent.get_memory_summary())


# ========== 3. CrewAI Memory 系统 ==========
print("\n" + "=" * 60)
print("3. CrewAI Memory 系统")
print("=" * 60)


class CrewMemory:
    """Crew 记忆系统"""

    def __init__(self):
        self.short_term: List[Dict] = []    # 短期记忆（当前会话）
        self.long_term: List[Dict] = []     # 长期记忆（持久化）
        self.entity_memory: Dict[str, Dict] = {}  # 实体记忆

    def add_short_term(self, content: str, metadata: Dict = None):
        """添加短期记忆"""
        self.short_term.append({
            "content": content,
            "metadata": metadata or {},
            "timestamp": datetime.now().isoformat(),
        })

    def add_long_term(self, content: str, category: str):
        """添加长期记忆"""
        self.long_term.append({
            "content": content,
            "category": category,
            "timestamp": datetime.now().isoformat(),
        })

    def remember_entity(self, entity: str, info: Dict):
        """记住实体信息"""
        if entity not in self.entity_memory:
            self.entity_memory[entity] = {}
        self.entity_memory[entity].update(info)

    def recall(self, query: str) -> List[str]:
        """回忆相关信息"""
        results = []
        # 搜索短期记忆
        for mem in self.short_term:
            if query in mem["content"]:
                results.append(f"[短期] {mem['content'][:80]}")
        # 搜索长期记忆
        for mem in self.long_term:
            if query in mem["content"]:
                results.append(f"[长期] {mem['content'][:80]}")
        return results

    def get_stats(self) -> Dict:
        """获取记忆统计"""
        return {
            "short_term_count": len(self.short_term),
            "long_term_count": len(self.long_term),
            "entities": list(self.entity_memory.keys()),
        }


# 使用记忆系统
memory = CrewMemory()

# 添加记忆
memory.add_short_term("讨论了 AI Agent 的发展趋势")
memory.add_short_term("决定使用 CrewAI 框架")
memory.add_long_term("CrewAI 是角色驱动的多 Agent 框架", "framework")
memory.remember_entity("CrewAI", {"type": "framework", "language": "Python"})

# 回忆
print("回忆 'Agent':")
for result in memory.recall("Agent"):
    print(f"  {result}")

print(f"\n记忆统计: {memory.get_stats()}")


# ========== 4. CrewAI vs LangGraph 对比 ==========
print("\n" + "=" * 60)
print("4. CrewAI vs LangGraph 对比")
print("=" * 60)

comparison = [
    {"维度": "抽象级别", "CrewAI": "高（角色-任务-流程）", "LangGraph": "低（图-节点-边）"},
    {"维度": "学习曲线", "CrewAI": "低（概念直观）", "LangGraph": "高（需要理解图论）"},
    {"维度": "灵活性", "CrewAI": "中（受限于框架设计）", "LangGraph": "高（完全可定制）"},
    {"维度": "状态管理", "CrewAI": "内置（简单）", "LangGraph": "灵活（可深度定制）"},
    {"维度": "调试难度", "CrewAI": "易（黑盒）", "LangGraph": "中（可视化）"},
    {"维度": "适用场景", "CrewAI": "快速原型、角色扮演", "LangGraph": "复杂工作流、定制需求"},
    {"维度": "社区生态", "CrewAI": "活跃（增长快）", "LangGraph": "完善（LangChain 生态）"},
]

print(f"\n{'维度':<10} | {'CrewAI':<25} | {'LangGraph':<25}")
print("-" * 65)
for row in comparison:
    print(f"{row['维度']:<10} | {row['CrewAI']:<25} | {row['LangGraph']:<25}")

print("""
选型建议:
  1. 快速原型 → CrewAI（上手快，概念清晰）
  2. 复杂定制 → LangGraph（灵活，可深度定制）
  3. 角色扮演 → CrewAI（原生支持 role/goal/backstory）
  4. 状态管理 → LangGraph（更精细的控制）
  5. 混合使用 → 两者可以结合（CrewAI 做高层编排，LangGraph 做底层逻辑）
""")


# ========== 5. CrewAI 最佳实践 ==========
print("=" * 60)
print("5. CrewAI 最佳实践")
print("=" * 60)

best_practices = """
1. 角色设计:
   - 每个角色有明确的职责，避免重叠
   - 提供丰富的 backstory，帮助 LLM 理解角色
   - goal 要具体可衡量

2. 任务设计:
   - 任务描述要清晰具体，包含所有必要信息
   - 明确期望输出格式（JSON/Markdown/纯文本）
   - 合理设置依赖关系，避免循环依赖

3. 流程选择:
   - sequential: 简单流程，任务间有明确依赖
   - hierarchical: 复杂项目，需要动态分配任务

4. 性能优化:
   - 减少不必要的 Agent（每个 Agent 都有开销）
   - 并行处理独立任务
   - 使用缓存避免重复计算

5. 错误处理:
   - 设置合理的超时时间
   - 添加重试机制
   - 记录详细日志便于调试

6. 工具使用:
   - 为 Agent 提供必要的工具
   - 工具描述要准确，避免误用
   - 限制工具权限，防止误操作
"""
print(best_practices)
```

## 📤 预期输出

```
============================================================
1. CrewAI 核心概念
============================================================
CrewAI 架构:
┌─────────────────────────────────────────┐
│                  Crew                    │
│              (团队/项目)                  │
├─────────────────────────────────────────┤
│  Process (流程)                          │
│  - sequential: 顺序执行                  │
│  - hierarchical: 层级管理                │
├─────────────────────────────────────────┤
│  Tasks (任务)                            │
│  - 每个任务有明确的目标和期望输出         │
├─────────────────────────────────────────┤
│  Agents (角色)                           │
│  - role: 角色定位                        │
│  - goal: 要达成的目标                    │
│  - backstory: 背景故事                  │
└─────────────────────────────────────────┘

============================================================
3. 创建内容创作团队
============================================================
  [Crew] 添加 Agent: 高级研究分析师
  [Crew] 添加 Agent: 技术内容撰写人
  [Crew] 添加 Agent: 质量审查专家
  [Crew] 添加 Agent: 内容发布专员

==================================================
[内容创作团队] 开始执行
==================================================

--- Task 1: 高级研究分析师 ---
  描述: 研究 AI Agent 技术的最新发展趋势...
  结果: 【研究结果】关于 '研究 AI Agent 技术...' 的分析...

--- Task 2: 技术内容撰写人 ---
  描述: 基于研究结果，撰写一篇关于 AI Agent...
  结果: 【撰写内容】基于研究结果，撰写了...

--- Task 3: 质量审查专家 ---
  描述: 审查文章的质量和准确性...
  结果: 【审查报告】内容质量评分: 8.5/10...

--- Task 4: 内容发布专员 ---
  描述: 将审查通过的文章格式化并准备发布...
  结果: 【发布确认】内容已准备发布...

==================================================
[内容创作团队] 执行完成
==================================================

============================================================
4. CrewAI vs LangGraph 对比
============================================================
维度       | CrewAI                    | LangGraph
-----------------------------------------------------------------
抽象级别   | 高（角色-任务-流程）       | 低（图-节点-边）
学习曲线   | 低（概念直观）            | 高（需要理解图论）
灵活性     | 中（受限于框架设计）       | 高（完全可定制）
适用场景   | 快速原型、角色扮演        | 复杂工作流、定制需求
```

## ⚠️ 常见错误与解决方案

| # | 问题 | 原因 | 解决方案 |
|---|------|------|---------|
| 1 | `crewai` 安装失败 | Python 版本不兼容 | 需要 Python 3.10+，运行 `pip install crewai` |
| 2 | Agent 角色冲突 | 角色职责重叠 | 确保每个 Agent 有独特且不重叠的职责 |
| 3 | 任务执行太慢 | Agent 数量过多 | 减少不必要的 Agent，优化任务描述 |
| 4 | 结果质量差 | backstory 太简单 | 丰富 backstory，提供更多上下文 |
| 5 | 循环依赖 | Task 依赖设置错误 | 检查 context_tasks，确保无循环 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| CrewAI | 角色驱动的多 Agent 编排框架 |
| Agent | 有角色、目标和专长的 AI 助手 |
| Task | 需要完成的具体任务 |
| Crew | Agent 和 Task 的组合，代表一个团队 |
| Process | 任务执行流程（sequential/hierarchical） |
| Role | Agent 的角色定位 |
| Goal | Agent 要达成的目标 |
| Backstory | Agent 的背景故事 |
| Delegation | Agent 将子任务委派给其他 Agent |
| Kickoff | 启动 Crew 执行 |

## 🏋️ 每日挑战

### 挑战 1：添加新角色（难度：⭐）

在内容创作团队中添加一个"SEO 优化师"角色，负责优化文章的搜索引擎排名。

### 挑战 2：并行任务（难度：⭐⭐）

修改 Crew 支持并行任务：如果两个任务没有依赖关系，可以同时执行。

### 挑战 3：自定义工具（难度：⭐⭐⭐）

为 Agent 添加自定义工具：实现一个"API 调用工具"，让 Agent 能调用外部 API。

### 挑战 4：CrewAI 实战（难度：⭐⭐⭐）

使用真正的 CrewAI 库（`pip install crewai`）实现一个完整的多 Agent 项目。

## ✅ 验收清单

- [ ] 能说出 CrewAI 的四个核心概念
- [ ] 能定义 Agent 的 role、goal、backstory
- [ ] 能设计有依赖关系的 Task
- [ ] 能创建和运行 Crew
- [ ] 理解 sequential 和 hierarchical 的区别
- [ ] 能对比 CrewAI 和 LangGraph 的优缺点

## 📝 复盘小纸条

- 今天最大的收获: ...
- 还不太确定的: ...
