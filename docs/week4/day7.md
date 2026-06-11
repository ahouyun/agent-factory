# 📅 Week 4 Day 7：Agent 范式——周复盘

## 🧭 今日方向
> 系统回顾 Week 4 全部 6 天的学习内容，梳理五大 Agent 类型、四大 Agent 范式和五种工作流模式的知识脉络，通过对比表、练习题和自测验证掌握程度。

## 🎯 生活比喻
> 复盘就像旅行结束后的地图回顾：你把走过的路标出来，看看哪里绕了弯路，哪里风景最好，下次出发就知道该怎么走了。

## 📋 今日三件事
1. 回顾 Week 4 每天的核心知识点
2. 完成范式对比表和自测练习
3. 输出个人复盘报告和后续计划

---

## 🗺️ 手把手路线

### Step 1: 知识点回顾
- **做什么**: 按天回顾 Week 4 的核心概念
- **为什么**: 系统化的回顾能发现知识盲点
- **成功标志**: 能说出每天的核心内容和关键代码

### Step 2: 范式对比与练习
- **做什么**: 完成对比表、选择题和场景分析题
- **为什么**: 对比和练习是巩固知识的最佳方式
- **成功标志**: 对比表填写完整，自测题正确率 > 80%

### Step 3: 输出复盘报告
- **做什么**: 填写个人复盘报告和后续计划
- **为什么**: 结构化的复盘能明确下一步方向
- **成功标志**: 报告包含收获、不足和可执行的后续计划

---

## 💻 代码区

### 代码 1: Week 4 知识图谱

```python
"""
Week 4 知识图谱：Agent 范式全景
"""

knowledge_map = {
    "Day 1: Agent 定义与类型": {
        "核心概念": [
            "Agent 定义：能自主感知环境并采取行动的实体",
            "四大特征：自主性、反应性、主动性、社交能力",
            "五大类型：Simple Reflex / Model-Based / Goal-Based / Utility-Based / Learning",
        ],
        "演化历史": "符号AI(1950s) -> 专家系统(1980s) -> ML(2000s) -> LLM(2020s) -> Agent(2024+)",
        "核心代码": "BaseAgent + 5种Agent子类实现",
        "关键收获": "理解不同类型Agent的适用场景是架构设计的基础",
    },
    "Day 2: ReAct 范式": {
        "核心概念": [
            "ReAct = Reasoning + Acting",
            "循环：Thought -> Action -> Observation",
            "工具注册与调用机制",
        ],
        "核心代码": "ToolRegistry + ReActAgent + ReActParser",
        "关键收获": "ReAct让Agent能够边思考边行动，是最基础的Agent范式",
    },
    "Day 3: Plan-and-Solve 范式": {
        "核心概念": [
            "Planner（规划器）：目标分解 + 依赖管理",
            "Executor（执行器）：按序执行 + 失败重试",
            "Re-planning（重规划）：失败时动态调整",
        ],
        "核心代码": "Planner + Executor + PlanAndSolveAgent",
        "关键收获": "先规划后执行适合复杂的多步骤任务",
    },
    "Day 4: Reflection 范式": {
        "核心概念": [
            "Generate -> Evaluate -> Refine 循环",
            "多维度评估：准确性、完整性、清晰度等",
            "迭代改进直到达标",
        ],
        "核心代码": "Evaluator + Refiner + ReflectionAgent",
        "关键收获": "Reflection让Agent能自我改进，适合质量要求高的场景",
    },
    "Day 5: Metacognition 范式": {
        "核心概念": [
            "自我监控：跟踪认知过程",
            "自信评估：评估推理可信度",
            "策略选择：根据情况选最佳方法",
            "自我纠正：主动切换策略",
        ],
        "核心代码": "CognitiveMonitor + MetacognitiveEngine + MetacognitiveAgent",
        "关键收获": "Metacognition让Agent更可靠，适合需要高可信度的场景",
    },
    "Day 6: 五种工作流模式": {
        "核心概念": [
            "Sequential Chaining: A -> B -> C 流水线",
            "Routing: 分类 -> 分发",
            "Parallelization: 并行执行 + 汇总",
            "Orchestrator-Worker: 统筹分配",
            "Evaluator-Optimizer: 生成 -> 评估 -> 循环",
        ],
        "核心代码": "Pipeline + Router + ParallelExecutor + Orchestrator + EvaluatorOptimizer",
        "关键收获": "不同场景需要不同工作流，组合使用效果更佳",
    },
}

# 打印知识图谱
print("=" * 65)
print("  Week 4 知识图谱：Agent 范式全景")
print("=" * 65)

for day, info in knowledge_map.items():
    print(f"\n{'─' * 55}")
    print(f"  📌 {day}")
    print(f"{'─' * 55}")
    for key, value in info.items():
        if isinstance(value, list):
            print(f"  {key}:")
            for item in value:
                print(f"    • {item}")
        else:
            print(f"  {key}: {value}")
```

### 代码 2: 范式对比表

```python
"""
四大 Agent 范式 + 五种工作流模式 对比表
"""

# ====== 四大范式对比 ======
paradigm_comparison = """
╔═══════════════════╦═══════════════════╦══════════════╦══════════════╦════════════════╗
║ 范式              ║ 核心思想          ║ 优点         ║ 缺点         ║ 典型场景       ║
╠═══════════════════╬═══════════════════╬══════════════╬══════════════╬════════════════╣
║ ReAct             ║ 推理+行动交替     ║ 简单直观     ║ 缺乏全局规划 ║ 信息查询、工具 ║
║                   ║ Thought->Action   ║ 实现容易     ║ 可能循环     ║ 调用           ║
║                   ║ ->Observation     ║              ║              ║                ║
╠═══════════════════╬═══════════════════╬══════════════╬══════════════╬════════════════╣
║ Plan-and-Solve    ║ 先规划后执行      ║ 全局视野     ║ 规划耗时     ║ 复杂多步骤任务 ║
║                   ║ 分解+依赖管理     ║ 支持重规划   ║ 灵活性较低   ║ 项目管理       ║
╠═══════════════════╬═══════════════════╬══════════════╬══════════════╬════════════════╣
║ Reflection        ║ 生成->评估->改进  ║ 质量高       ║ 时间长       ║ 内容创作、代码 ║
║                   ║ 迭代优化          ║ 自我改进     ║ 资源消耗大   ║ 审查           ║
╠═══════════════════╬═══════════════════╬══════════════╬══════════════╬════════════════╣
║ Metacognition     ║ 思考自己的思考    ║ 更可靠       ║ 实现复杂     ║ 需要高可信度   ║
║                   ║ 自我监控+纠正     ║ 自适应       ║ 开销较大     ║ 的决策场景     ║
╚═══════════════════╩═══════════════════╩══════════════╩══════════════╩════════════════╝
"""

# ====== 五大类型对比 ======
type_comparison = """
╔═══════════════════╦══════╦══════╦══════╦══════╦═══════════════════╗
║ Agent类型         ║ 记忆 ║ 目标 ║ 效用 ║ 学习 ║ 一句话描述        ║
╠═══════════════════╬══════╬══════╬══════╬══════╬═══════════════════╣
║ Simple Reflex     ║  N   ║  N   ║  N   ║  N   ║ 看当前状态直接反应 ║
║ Model-Based       ║  Y   ║  N   ║  N   ║  N   ║ 维护世界模型      ║
║ Goal-Based        ║  Y   ║  Y   ║  N   ║  N   ║ 有目标选动作      ║
║ Utility-Based     ║  Y   ║  Y   ║  Y   ║  N   ║ 选效用最高的动作  ║
║ Learning          ║  Y   ║  Y   ║  Y   ║  Y   ║ 从经验中学习改进  ║
╚═══════════════════╩══════╩══════╩══════╩══════╩═══════════════════╝
"""

# ====== 工作流模式对比 ======
workflow_comparison = """
╔═══════════════════╦═══════════════════╦══════════════╦══════════════╗
║ 工作流模式        ║ 核心思想          ║ 适用场景     ║ 复杂度       ║
╠═══════════════════╬═══════════════════╬══════════════╬══════════════╣
║ Sequential        ║ A -> B -> C       ║ 数据管道     ║ 低           ║
║ Routing           ║ 分类 -> 分发      ║ 多类型任务   ║ 中           ║
║ Parallelization   ║ A + B + C 并行    ║ 独立任务     ║ 中           ║
║ Orchestrator      ║ 统筹分配给专家    ║ 复杂项目     ║ 高           ║
║ Eval-Optimizer    ║ 生成->评估->循环  ║ 高质量要求   ║ 高           ║
╚═══════════════════╩═══════════════════╩══════════════╩══════════════╝
"""

print("四大 Agent 范式对比")
print(paradigm_comparison)
print("五大 Agent 类型对比")
print(type_comparison)
print("五种工作流模式对比")
print(workflow_comparison)
```

### 代码 3: 自测练习

```python
"""
Week 4 自测练习：选择题 + 场景分析题
"""

quiz = {
    "选择题": [
        {
            "question": "1. 以下哪个不是 Agent 的核心特征？",
            "options": ["A. 自主性", "B. 反应性", "C. 确定性", "D. 社交能力"],
            "answer": "C",
            "explanation": "确定性不是Agent的核心特征。Agent的核心特征包括自主性、反应性、主动性和社交能力。",
        },
        {
            "question": "2. ReAct 模式中，Thought->Action->Observation 的循环中，Observation 是什么？",
            "options": ["A. Agent的思考过程", "B. 工具返回的结果", "C. 最终答案", "D. 用户的输入"],
            "answer": "B",
            "explanation": "Observation是Action执行后工具返回的结果，作为下一步Thought的输入。",
        },
        {
            "question": "3. Plan-and-Solve 中，当某个子任务失败时应该怎么做？",
            "options": ["A. 放弃整个计划", "B. 重新规划，移除失败依赖", "C. 忽略失败继续执行", "D. 无限重试"],
            "answer": "B",
            "explanation": "应该重新规划(Re-planning)，移除对失败任务的依赖，让后续任务可以继续。",
        },
        {
            "question": "4. Reflection 模式中，什么时候应该停止迭代？",
            "options": ["A. 永不停止", "B. 达到最大轮次或质量达标", "C. 输出不再变化时", "D. 评分达到1.0时"],
            "answer": "B",
            "explanation": "当达到质量阈值(如0.85)或最大迭代次数时应该停止。",
        },
        {
            "question": "5. 以下哪种场景最适合使用 Routing 工作流模式？",
            "options": ["A. 数据清洗管道", "B. 多语言客服系统", "C. 批量图片处理", "D. AI写作助手"],
            "answer": "B",
            "explanation": "多语言客服系统需要根据输入语言分类到不同处理器，是典型的Routing场景。",
        },
        {
            "question": "6. Metacognition 中，Agent评估自己的"自信度"有什么作用？",
            "options": ["A. 美化输出", "B. 决定是否需要改变策略", "C. 加快执行速度", "D. 减少工具调用"],
            "answer": "B",
            "explanation": "自信度帮助Agent判断当前推理是否可靠，低自信度时主动切换策略可以提高准确性。",
        },
        {
            "question": "7. Orchestrator-Worker 模式中，如何实现负载均衡？",
            "options": ["A. 随机分配", "B. 分配给完成任务最少的工作者", "C. 分配给最贵的工作者", "D. 所有工作者平均分配"],
            "answer": "B",
            "explanation": "负载均衡通常是将任务分配给当前负载最低（完成任务最少）的工作者。",
        },
        {
            "question": "8. Simple Reflex Agent 和 Model-Based Agent 的核心区别是什么？",
            "options": ["A. 速度不同", "B. 后者有内部世界模型（记忆）", "C. 使用的语言不同", "D. 目标不同"],
            "answer": "B",
            "explanation": "Model-Based Agent 维护内部世界模型，能记住历史状态变化，Simple Reflex只看当前。",
        },
    ],
}

print("=" * 60)
print("  Week 4 自测练习")
print("=" * 60)

correct = 0
total = len(quiz["选择题"])

for q in quiz["选择题"]:
    print(f"\n{q['question']}")
    for opt in q["options"]:
        print(f"  {opt}")

    user_answer = input("  你的答案 (A/B/C/D): ").strip().upper()
    if user_answer == q["answer"]:
        print(f"  ✅ 正确！{q['explanation']}")
        correct += 1
    else:
        print(f"  ❌ 错误。正确答案: {q['answer']}")
        print(f"  💡 {q['explanation']}")

print(f"\n{'=' * 60}")
print(f"  得分: {correct}/{total} ({correct/total*100:.0f}%)")
if correct >= total * 0.8:
    print("  🎉 优秀！你对 Week 4 的内容掌握得很好！")
elif correct >= total * 0.6:
    print("  👍 不错！建议回顾错题对应的知识点。")
else:
    print("  📖 需要复习！建议重新阅读对应天数的内容。")
print("=" * 60)
```

### 代码 4: 场景分析练习

```python
"""
场景分析练习：为给定场景选择合适的 Agent 范式和工作流模式
"""

scenarios = [
    {
        "场景": "构建一个智能客服系统",
        "需要处理": "用户输入 -> 意图识别 -> 回答生成 -> 质量检查",
        "推荐范式": "ReAct + Routing",
        "推荐工作流": "Routing（按意图分类）+ Evaluator-Optimizer（回答质量检查）",
        "理由": "不同意图需要不同处理（Routing），回答需要质量保证（Eval-Opt）",
    },
    {
        "场景": "自动化数据分析报告",
        "需要处理": "数据收集 -> 清洗 -> 分析 -> 可视化 -> 撰写报告",
        "推荐范式": "Plan-and-Solve + Reflection",
        "推荐工作流": "Sequential Chaining（数据管道）+ Reflection（报告质量）",
        "理由": "有明确的步骤顺序（Sequential），报告质量需要迭代优化（Reflection）",
    },
    {
        "场景": "AI辅助代码审查",
        "需要处理": "读取代码 -> 分析问题 -> 生成建议 -> 验证建议",
        "推荐范式": "ReAct + Metacognition",
        "推荐工作流": "Evaluator-Optimizer（生成-验证循环）",
        "理由": "需要调用工具分析代码（ReAct），自信度评估避免误报（Metacognition）",
    },
    {
        "场景": "多模态内容创作平台",
        "需要处理": "文本生成 + 图片生成 + 视频脚本 + 排版设计",
        "推荐范式": "Plan-and-Solve + Reflection",
        "推荐工作流": "Parallelization（多模态并行生成）+ Orchestrator-Worker（分配给专业Agent）",
        "理由": "不同模态可并行（Parallel），需要专家协作（Orch-Worker），质量需迭代（Reflection）",
    },
]

print("=" * 65)
print("  场景分析练习：为场景选择最佳范式和工作流")
print("=" * 65)

for i, scenario in enumerate(scenarios, 1):
    print(f"\n{'─' * 55}")
    print(f"  场景 {i}: {scenario['场景']}")
    print(f"  需要处理: {scenario['需要处理']}")
    print(f"  推荐范式: {scenario['推荐范式']}")
    print(f"  推荐工作流: {scenario['推荐工作流']}")
    print(f"  理由: {scenario['理由']}")
```

### 代码 5: 个人复盘报告生成器

```python
"""
Week 4 个人复盘报告生成器
"""

from datetime import datetime


class Week4Report:
    """Week 4 复盘报告"""

    def __init__(self):
        self.days = {
            1: {"topic": "Agent定义与类型", "score": 0, "notes": ""},
            2: {"topic": "ReAct范式", "score": 0, "notes": ""},
            3: {"topic": "Plan-and-Solve范式", "score": 0, "notes": ""},
            4: {"topic": "Reflection范式", "score": 0, "notes": ""},
            5: {"topic": "Metacognition范式", "score": 0, "notes": ""},
            6: {"topic": "五种工作流模式", "score": 0, "notes": ""},
        }
        self.quiz_score = 0
        self.quiz_total = 0
        self.best_day = ""
        self.hardest_day = ""
        self.key_takeaway = ""
        self.next_steps = []

    def set_day_score(self, day: int, score: int, notes: str = ""):
        """设置每天的掌握程度 (1-5)"""
        if day in self.days:
            self.days[day]["score"] = score
            self.days[day]["notes"] = notes

    def set_quiz_score(self, correct: int, total: int):
        """设置自测成绩"""
        self.quiz_score = correct
        self.quiz_total = total

    def generate(self) -> str:
        """生成复盘报告"""
        lines = [
            "=" * 60,
            "  Week 4 复盘报告",
            f"  生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            "=" * 60,
            "",
            "  每日掌握度:",
        ]

        total_score = 0
        for day, info in self.days.items():
            bar = "█" * info["score"] + "░" * (5 - info["score"])
            lines.append(f"    Day {day} {info['topic']}: [{bar}] {info['score']}/5")
            total_score += info["score"]

        avg_score = total_score / len(self.days) if self.days else 0
        lines.append(f"\n  平均掌握度: {avg_score:.1f}/5")

        if self.quiz_total > 0:
            pct = self.quiz_score / self.quiz_total * 100
            lines.append(f"  自测成绩: {self.quiz_score}/{self.quiz_total} ({pct:.0f}%)")

        if self.best_day:
            lines.append(f"  掌握最好的: {self.best_day}")
        if self.hardest_day:
            lines.append(f"  最需复习的: {self.hardest_day}")

        lines.extend([
            "",
            "  核心收获:",
            f"    {self.key_takeaway or '(请填写)'}",
            "",
            "  后续计划:",
        ])
        for step in self.next_steps:
            lines.append(f"    - {step}")

        if not self.next_steps:
            lines.append("    - (请填写)")

        lines.append("")
        lines.append("=" * 60)
        return "\n".join(lines)


# ====== 使用示例 ======
if __name__ == "__main__":
    report = Week4Report()

    # 填写数据（请根据实际情况修改）
    report.set_day_score(1, 4, "理解了五大类型的区别")
    report.set_day_score(2, 4, "ReAct的循环机制掌握了")
    report.set_day_score(3, 3, "重规划的逻辑还需加强")
    report.set_day_score(4, 4, "反思循环运行良好")
    report.set_day_score(5, 3, "元认知概念较抽象")
    report.set_day_score(6, 4, "五种模式对比清晰")

    report.set_quiz_score(7, 8)

    report.best_day = "Day 2 ReAct范式"
    report.hardest_day = "Day 5 Metacognition"

    report.key_takeaway = "不同场景需要不同范式，组合使用效果更佳"

    report.next_steps = [
        "复习 Day 3 的重规划逻辑",
        "复习 Day 5 的自信评估机制",
        "在 Agent Factory 项目中实践 ReAct 模式",
        "阅读 ReAct 原始论文加深理解",
    ]

    # 生成报告
    print(report.generate())
```

---

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 复盘时想不起某天的内容 | 回看对应天数的知识图谱条目 |
| 2 | 对比表填不出来 | 回到对应天数的代码区重新运行示例 |
| 3 | 自测题错误较多 | 针对错题回看对应知识点，重新阅读概念对照表 |
| 4 | 场景分析题不确定 | 从最简单的范式开始思考，逐步增加复杂度 |
| 5 | 不知道如何写后续计划 | 从"最弱的知识点"和"最想实践的范式"出发 |
| 6 | 感觉内容太多记不住 | 重点记住每个范式的一句话核心思想 |

---

## 📖 概念对照表（Week 4 总汇）

| 术语 | 一句话解释 |
|------|-----------|
| Agent | 能自主感知环境并采取行动的实体 |
| ReAct | 推理(Reasoning) + 行动(Acting) 交替的范式 |
| Plan-and-Solve | 先规划分解任务，再按依赖顺序执行 |
| Reflection | 生成 -> 评估 -> 改进的迭代循环 |
| Metacognition | "思考自己的思考"，自我监控和调节 |
| Sequential Chaining | 步骤按顺序执行的流水线 |
| Routing | 按输入类型分发到不同处理分支 |
| Parallelization | 多个任务同时执行，最后汇总 |
| Orchestrator-Worker | 中央协调器分配任务给专业工作者 |
| Evaluator-Optimizer | 生成-评估-优化的质量循环 |
| 世界模型 | Agent 对环境的内部表示 |
| 效用函数 | 将 (状态, 动作) 映射为标量值的函数 |
| 重规划 | 任务失败时动态调整计划 |
| 自信度 | Agent 对当前推理结果的确定程度 |
| 负载均衡 | 在多个工作者之间均匀分配任务 |

---

## ✅ 验收清单

- [ ] 能说出 Week 4 每天的核心知识点
- [ ] 能解释四大 Agent 范式的区别和适用场景
- [ ] 能解释五种工作流模式的区别和适用场景
- [ ] 能为给定场景选择合适的范式和工作流组合
- [ ] 自测题正确率 >= 80%
- [ ] 填写完整的个人复盘报告
- [ ] 有可执行的后续学习计划

---

## 📝 复盘小纸条
- 今天最大的收获: ________________________________
- 还不太确定的: ________________________________
- Week 4 最重要的一个知识点: ________________________________
- 最想在项目中实践的范式: ________________________________

---

## 📥 Week 5 预告：Prompt Engineering 与 LLM 应用

> Week 5 将深入学习提示工程（Prompt Engineering）和大模型应用开发：
> - Day 1: Prompt Engineering 基础——零样本、少样本、思维链
> - Day 2: 高级提示技术——角色扮演、结构化输出、自洽性
> - Day 3: Prompt 模板与动态组装
> - Day 4: LLM API 深度实践——流式输出、重试、成本控制
> - Day 5: LLM 应用架构——RAG、知识库、对话管理
> - Day 6: 综合项目——构建一个完整的 LLM 应用
> - Day 7: Week 5 复盘
>
> 准备工作：确保 Week 4 的所有代码能正常运行，理解 Agent 范式是 Week 5 的基础。
