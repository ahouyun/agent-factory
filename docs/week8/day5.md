# 📅 Week 8 Day 5：CrewAI：角色驱动的多 Agent 编排

## 🧭 今日方向
> CrewAI 是目前最流行的多 Agent 框架之一，通过"角色-任务-流程"的方式编排 Agent。今天学习 CrewAI 的核心概念，动手搭建一个多 Agent 团队。

## 🎯 生活比喻
> CrewAI 就像"组建一个电影剧组"。你先选角（定义 Agent 角色），然后分配剧本（任务），最后按拍摄计划（流程）开拍。导演（Crew）负责协调整个团队。

## 📋 今日三件事
1. 理解 CrewAI 的核心概念：Agent、Task、Crew、Process
2. 用 CrewAI 构建一个多 Agent 研究团队
3. 对比 CrewAI 和 LangGraph 的差异

## 🗺️ 手把手路线

### Step 1: CrewAI 架构
- 做什么: 理解 Agent → Task → Crew → Process 的层级关系
- 为什么: 这是 CrewAI 的核心设计
- 成功标志: 能画出 CrewAI 的架构图

### Step 2: 构建 Crew
- 做什么: 定义角色、分配任务、运行 Crew
- 为什么: 这是 CrewAI 的标准用法
- 成功标志: Crew 能正常运行并输出结果

### Step 3: 高级特性
- 做什么: 学习 delegation、memory、工具集成
- 为什么: 这些特性让 Crew 更强大
- 成功标志: 能使用 CrewAI 的高级功能

## 💻 代码区

```python
"""
Week 8 Day 5: CrewAI：角色驱动的多 Agent 编排
安装依赖: pip install crewai crewai-tools
"""

from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
from typing import List

# ========== 1. CrewAI 概念 ==========
print("=== 1. CrewAI 核心概念 ===")

print("""
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
│  - 每个 Agent 有角色、目标、背景故事     │
└─────────────────────────────────────────┘

核心概念:
- Agent: 有角色、目标和专长的 AI 助手
- Task: 需要完成的具体任务
- Crew: Agent 和 Task 的组合
- Process: 任务执行的流程
""")

# ========== 2. 定义 Agent ==========
print("=== 2. 定义 Agent ===")

# 初始化 LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 定义研究团队的 Agent
researcher = Agent(
    role="高级研究分析师",
    goal="发现关于给定主题的最新、最准确的信息",
    backstory="""你是一位经验丰富的研究分析师，擅长从各种来源收集和分析信息。
你对细节有敏锐的洞察力，总是能发现别人忽略的关键信息。""",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

writer = Agent(
    role="技术内容撰写人",
    goal="将研究结果转化为清晰、引人入胜的内容",
    backstory="""你是一位专业的技术写作专家，擅长将复杂的概念用简单易懂的语言表达。
你的文章总是逻辑清晰、结构严谨。""",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

reviewer = Agent(
    role="质量审查专家",
    goal="确保内容的准确性和质量",
    backstory="""你是一位严格的质量审查专家，对内容的准确性和完整性有极高的要求。
你会仔细检查每一个事实和数据。""",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

print("已定义 3 个 Agent:")
print(f"  1. {researcher.role}")
print(f"  2. {writer.role}")
print(f"  3. {reviewer.role}")

# ========== 3. 定义 Task ==========
print("\n=== 3. 定义 Task ===")

# 研究任务
research_task = Task(
    description="""研究 AI Agent 技术的最新发展趋势。

请关注以下方面:
1. 主流框架和技术栈
2. 行业应用场景
3. 未来发展方向

请提供详细的研究报告，包含具体的数据和案例。""",
    expected_output="一份包含最新趋势、数据和案例的详细研究报告",
    agent=researcher
)

# 写作任务
writing_task = Task(
    description="""基于研究结果，撰写一篇关于 AI Agent 技术趋势的文章。

要求:
1. 标题吸引人
2. 结构清晰（引言、正文、结论）
3. 语言通俗易懂
4. 包含具体案例""",
    expected_output="一篇完整的、结构清晰的技术文章",
    agent=writer,
    context=[research_task]  # 依赖研究任务的结果
)

# 审查任务
review_task = Task(
    description="""审查文章的质量和准确性。

检查要点:
1. 事实是否准确
2. 逻辑是否清晰
3. 语言是否流畅
4. 格式是否规范

请提供详细的修改建议。""",
    expected_output="审查报告，包含修改建议",
    agent=reviewer,
    context=[writing_task]  # 依赖写作任务的结果
)

print("已定义 3 个 Task:")
print(f"  1. {research_task.description[:50]}...")
print(f"  2. {writing_task.description[:50]}...")
print(f"  3. {review_task.description[:50]}...")

# ========== 4. 创建和运行 Crew ==========
print("\n=== 4. 创建 Crew ===")

# 创建 Crew
crew = Crew(
    agents=[researcher, writer, reviewer],
    tasks=[research_task, writing_task, review_task],
    process=Process.sequential,  # 顺序执行
    verbose=True
)

print("Crew 已创建:")
print(f"  Agent 数量: {len(crew.agents)}")
print(f"  Task 数量: {len(crew.tasks)}")
print(f"  流程: {crew.process}")

# 运行 Crew
print("\n--- 运行 Crew ---")
# 注意：实际运行需要有效的 API 密钥
# result = crew.kickoff()
# print(f"最终结果: {result}")

print("""
运行方式:
result = crew.kickoff()
print(result)
""")

# ========== 5. 高级特性 ==========
print("\n=== 5. 高级特性 ===")

# 5a. 带工具的 Agent
from crewai_tools import SerperDevTool

# 搜索工具（需要 Serper API 密钥）
# search_tool = SerperDevTool()

researcher_with_tools = Agent(
    role="研究分析师",
    goal="搜索最新信息",
    backstory="你是一位擅长使用搜索工具的研究员。",
    tools=[],  # [search_tool]
    llm=llm,
    allow_delegation=True  # 允许委派任务
)

print("高级特性:")
print("  1. 工具集成: Agent 可以使用外部工具")
print("  2. 任务委派: Agent 可以将子任务委派给其他 Agent")
print("  3. 记忆: Crew 可以记住之前的对话和决策")

# 5b. Hierarchical 流程
hierarchical_crew = Crew(
    agents=[researcher, writer, reviewer],
    tasks=[research_task, writing_task, review_task],
    process=Process.hierarchical,
    manager_llm=llm,  # 管理者 LLM
    verbose=True
)

print("\n流程类型:")
print("  - sequential: 顺序执行，简单可靠")
print("  - hierarchical: 层级管理，适合复杂项目")

# ========== 6. CrewAI vs LangGraph ==========
print("\n=== 6. CrewAI vs LangGraph ===")

comparison = {
    "维度": ["抽象级别", "学习曲线", "灵活性", "适用场景", "社区生态"],
    "CrewAI": ["高", "低", "中", "快速原型、角色扮演", "活跃"],
    "LangGraph": ["低", "高", "高", "复杂工作流、定制需求", "完善"],
}

print("\n对比表:")
print("="*60)
for i, dim in enumerate(comparison["维度"]):
    crew_val = comparison["CrewAI"][i]
    lang_val = comparison["LangGraph"][i]
    print(f"{dim:10} | CrewAI: {crew_val:10} | LangGraph: {lang_val:10}")

print("""
选型建议:
1. 快速原型 → CrewAI（上手快，概念清晰）
2. 复杂定制 → LangGraph（灵活，可深度定制）
3. 角色扮演 → CrewAI（原生支持）
4. 状态管理 → LangGraph（更精细的控制）
5. 混合使用 → 两者可以结合
""")

# ========== 7. CrewAI 最佳实践 ==========
print("\n=== 7. CrewAI 最佳实践 ===")

print("""
1. 角色设计:
   - 每个角色有明确的职责
   - 避免角色重叠
   - 提供丰富的背景故事

2. 任务设计:
   - 任务描述要清晰具体
   - 明确期望输出格式
   - 合理设置依赖关系

3. 流程选择:
   - 简单流程用 sequential
   - 复杂项目用 hierarchical
   - 需要协作用 consensus（实验性）

4. 性能优化:
   - 减少不必要的 Agent
   - 并行处理独立任务
   - 使用缓存避免重复计算

5. 错误处理:
   - 设置合理的超时
   - 添加重试机制
   - 记录详细日志
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | `crewai` 安装失败 | `pip install crewai crewai-tools`，需要 Python 3.10+ |
| 2 | Agent 角色冲突 | 确保每个 Agent 职责明确，避免重叠 |
| 3 | 任务执行太慢 | 减少 Agent 数量，优化任务描述 |
| 4 | 结果质量差 | 丰富 Agent 的 backstory，提供更详细的 Task 描述 |
| 5 | Crew 运行报错 | 检查 LLM 配置和 API 密钥 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| CrewAI | 角色驱动的多 Agent 编排框架 |
| Agent | 有角色、目标和专长的 AI 助手 |
| Task | 需要完成的具体任务 |
| Crew | Agent 和 Task 的组合，代表一个团队 |
| Process | 任务执行流程（sequential/hierarchical）|
| Role | Agent 的角色定位 |
| Goal | Agent 要达成的目标 |
| Backstory | Agent 的背景故事，帮助 LLM 理解角色 |
| Delegation | Agent 将子任务委派给其他 Agent |
| Kickoff | 启动 Crew 执行 |

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

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
