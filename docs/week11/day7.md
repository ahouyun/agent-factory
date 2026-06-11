# 📝 Day 7: Week 11 复盘 — 评估方法论总结与自我评估

## 今日方向

> "学而不思则罔，思而不学则殆。" -- 《论语》

今天我们来回顾 Week 11 的评估框架学习内容，总结关键知识点，构建你自己的评估清单，并进行自我评估。

## 生活比喻

想象你在准备一场重要考试：

- **前六天** = 学习各科知识
- **今天** = 考前复习，整理笔记，查漏补缺

今天就是我们的"考前复习日"。

## 今日三件事

1. **回顾本周内容**：梳理评估框架的核心知识点
2. **构建评估清单**：创建你自己的 Agent 评估检查表
3. **自我评估**：评估你对评估方法论的掌握程度

---

## 手把手路线

### 第一步：回顾本周核心概念

```python
# week_review.py
"""Week 11 核心概念回顾"""

import json
from typing import Dict, List, Any
from dataclasses import dataclass, field


@dataclass
class ConceptSummary:
    """概念摘要"""
    day: int
    title: str
    key_points: List[str]
    code_examples: List[str]
    tools: List[str]

    def to_dict(self) -> dict:
        return {
            "day": self.day, "title": self.title,
            "key_points": self.key_points,
            "code_examples": self.code_examples,
            "tools": self.tools,
        }


class Week11Review:
    """Week 11 复盘"""

    def __init__(self):
        self.concepts = self._build_concept_map()

    def _build_concept_map(self) -> List[ConceptSummary]:
        """构建概念图"""
        return [
            ConceptSummary(
                day=1, title="Agent 评估框架",
                key_points=[
                    "四大评估维度：准确性、延迟、成本、安全性",
                    "评估量表（Rubric）：结构化评分标准",
                    "测试套件（Test Suite）：自动化评估",
                ],
                code_examples=["eval_dimensions.py", "rubric.py", "test_agent_eval.py"],
                tools=["pytest", "dataclasses"],
            ),
            ConceptSummary(
                day=2, title="业界基准测试",
                key_points=[
                    "SWE-bench：真实软件工程问题",
                    "HumanEval：代码生成能力",
                    "GAIA：综合推理能力",
                    "MMLU：知识理解广度",
                ],
                code_examples=["swe_bench_intro.py", "humaneval_intro.py", "run_benchmark.py"],
                tools=["datasets", "pytest"],
            ),
            ConceptSummary(
                day=3, title="自动化评估流水线",
                key_points=[
                    "pytest 评估流水线",
                    "LLM-as-Judge 模式",
                    "回归测试机制",
                ],
                code_examples=["eval_pipeline.py", "llm_judge.py", "test_eval_pipeline.py"],
                tools=["pytest", "openai"],
            ),
            ConceptSummary(
                day=4, title="可观测性",
                key_points=[
                    "三大支柱：Traces、Metrics、Logs",
                    "OpenTelemetry 集成",
                    "监控仪表板设计",
                ],
                code_examples=["observability_basics.py", "opentelemetry_integration.py", "dashboard.py"],
                tools=["opentelemetry", "psutil"],
            ),
            ConceptSummary(
                day=5, title="LangSmith / Arize Phoenix",
                key_points=[
                    "LangSmith 追踪设置",
                    "Arize Phoenix 部署",
                    "完整仪表化 Agent",
                ],
                code_examples=["langsmith_setup.py", "phoenix_setup.py", "instrumented_agent.py"],
                tools=["langsmith", "arize-phoenix"],
            ),
            ConceptSummary(
                day=6, title="评估驱动迭代",
                key_points=[
                    "评估结果分析",
                    "A/B 测试框架",
                    "反馈循环系统",
                ],
                code_examples=["eval_analysis.py", "ab_testing.py", "feedback_loop.py"],
                tools=["pandas", "numpy"],
            ),
        ]

    def print_overview(self):
        """打印本周概览"""
        print("=" * 70)
        print("Week 11: Agent 评估 — 完整回顾")
        print("=" * 70)
        print()
        for concept in self.concepts:
            print(f"Day {concept.day}: {concept.title}")
            print("-" * 50)
            for point in concept.key_points:
                print(f"  - {point}")
            print(f"  代码示例: {', '.join(concept.code_examples)}")
            print(f"  工具: {', '.join(concept.tools)}")
            print()

    def get_all_tools(self) -> List[str]:
        """获取所有工具"""
        tools = set()
        for concept in self.concepts:
            tools.update(concept.tools)
        return sorted(tools)

    def get_all_code_examples(self) -> List[str]:
        """获取所有代码示例"""
        examples = []
        for concept in self.concepts:
            examples.extend(concept.code_examples)
        return examples

    def export_review(self, filepath: str):
        """导出复盘内容"""
        data = {
            "week": 11,
            "theme": "Agent 评估",
            "concepts": [c.to_dict() for c in self.concepts],
            "all_tools": self.get_all_tools(),
            "all_code_examples": self.get_all_code_examples(),
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"复盘内容已导出到: {filepath}")


if __name__ == "__main__":
    review = Week11Review()
    review.print_overview()

    print("\n本周使用的工具:")
    for tool in review.get_all_tools():
        print(f"  - {tool}")

    print(f"\n代码示例总数: {len(review.get_all_code_examples())}")

    review.export_review("week11_review.json")
```

### 第二步：构建评估清单

```python
# eval_checklist.py
"""Agent 评估检查表"""

import json
from typing import Dict, List, Any
from dataclasses import dataclass, field
from enum import Enum


class ChecklistStatus(Enum):
    """检查项状态"""
    DONE = "done"
    PARTIAL = "partial"
    TODO = "todo"
    NA = "na"


@dataclass
class ChecklistItem:
    """检查项"""
    id: str
    category: str
    name: str
    description: str
    status: ChecklistStatus = ChecklistStatus.TODO
    notes: str = ""

    def to_dict(self) -> dict:
        return {
            "id": self.id, "category": self.category,
            "name": self.name, "description": self.description,
            "status": self.status.value, "notes": self.notes,
        }


class AgentEvalChecklist:
    """Agent 评估检查表"""

    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.items: List[ChecklistItem] = []
        self._build_checklist()

    def _build_checklist(self):
        """构建检查表"""
        items = [
            # 评估框架
            ChecklistItem("EF01", "评估框架", "定义评估维度",
                         "明确定义准确性、延迟、成本、安全性等维度"),
            ChecklistItem("EF02", "评估框架", "设计评估量表",
                         "为每个维度设计结构化的评分标准"),
            ChecklistItem("EF03", "评估框架", "创建测试数据集",
                         "准备足够数量和多样性的测试用例"),

            # 基准测试
            ChecklistItem("BT01", "基准测试", "选择合适的基准",
                         "根据 Agent 场景选择 SWE-bench/HumanEval/GAIA/MMLU"),
            ChecklistItem("BT02", "基准测试", "运行基准测试",
                         "使用标准工具运行基准测试"),
            ChecklistItem("BT03", "基准测试", "解读结果",
                         "理解各指标的含义和局限性"),

            # 自动化流水线
            ChecklistItem("AP01", "自动化流水线", "构建 pytest 流水线",
                         "用 pytest 组织评估测试"),
            ChecklistItem("AP02", "自动化流水线", "实现 LLM-as-Judge",
                         "让 LLM 评估 LLM 的输出"),
            ChecklistItem("AP03", "自动化流水线", "建立回归测试",
                         "确保改进不引入新问题"),

            # 可观测性
            ChecklistItem("OB01", "可观测性", "实现 Tracing",
                         "为 Agent 添加追踪功能"),
            ChecklistItem("OB02", "可观测性", "收集 Metrics",
                         "记录关键性能指标"),
            ChecklistItem("OB03", "可观测性", "结构化 Logging",
                         "实现结构化日志记录"),

            # 工具集成
            ChecklistItem("TI01", "工具集成", "配置 LangSmith",
                         "设置 LangSmith 追踪"),
            ChecklistItem("TI02", "工具集成", "部署 Phoenix",
                         "部署 Arize Phoenix 可观测性"),

            # 迭代优化
            ChecklistItem("IO01", "迭代优化", "分析评估结果",
                         "从数据中发现问题"),
            ChecklistItem("IO02", "迭代优化", "实施 A/B 测试",
                         "对比不同版本的表现"),
            ChecklistItem("IO03", "迭代优化", "建立反馈循环",
                         "收集和整合反馈"),
        ]
        self.items = items

    def update_status(self, item_id: str, status: ChecklistStatus, notes: str = ""):
        """更新检查项状态"""
        for item in self.items:
            if item.id == item_id:
                item.status = status
                if notes:
                    item.notes = notes
                break

    def get_progress(self) -> Dict[str, Any]:
        """获取进度"""
        total = len(self.items)
        done = sum(1 for i in self.items if i.status == ChecklistStatus.DONE)
        partial = sum(1 for i in self.items if i.status == ChecklistStatus.PARTIAL)
        todo = sum(1 for i in self.items if i.status == ChecklistStatus.TODO)

        # 按类别统计
        by_category = {}
        for item in self.items:
            if item.category not in by_category:
                by_category[item.category] = {"total": 0, "done": 0}
            by_category[item.category]["total"] += 1
            if item.status == ChecklistStatus.DONE:
                by_category[item.category]["done"] += 1

        return {
            "total_items": total,
            "done": done, "partial": partial, "todo": todo,
            "completion_rate": round(done / total, 4) if total > 0 else 0,
            "by_category": by_category,
        }

    def get_pending_items(self) -> List[Dict]:
        """获取待办项"""
        return [i.to_dict() for i in self.items if i.status != ChecklistStatus.DONE]

    def print_checklist(self):
        """打印检查表"""
        print(f"\nAgent 评估检查表: {self.agent_name}")
        print("=" * 70)

        current_category = ""
        for item in self.items:
            if item.category != current_category:
                current_category = item.category
                print(f"\n{current_category}:")
                print("-" * 50)

            status_icon = {
                ChecklistStatus.DONE: "[x]",
                ChecklistStatus.PARTIAL: "[~]",
                ChecklistStatus.TODO: "[ ]",
                ChecklistStatus.NA: "[-]",
            }[item.status]

            print(f"  {status_icon} {item.id}: {item.name}")
            print(f"       {item.description}")
            if item.notes:
                print(f"       备注: {item.notes}")

        progress = self.get_progress()
        print(f"\n进度: {progress['done']}/{progress['total_items']} "
              f"({progress['completion_rate']*100:.1f}%)")

    def export_checklist(self, filepath: str):
        """导出检查表"""
        data = {
            "agent_name": self.agent_name,
            "items": [i.to_dict() for i in self.items],
            "progress": self.get_progress(),
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"检查表已导出到: {filepath}")


if __name__ == "__main__":
    checklist = AgentEvalChecklist("我的 Agent")

    # 模拟完成一些项目
    checklist.update_status("EF01", ChecklistStatus.DONE, "已完成")
    checklist.update_status("EF02", ChecklistStatus.DONE, "已完成")
    checklist.update_status("EF03", ChecklistStatus.PARTIAL, "部分完成")
    checklist.update_status("BT01", ChecklistStatus.DONE, "选择 HumanEval")
    checklist.update_status("AP01", ChecklistStatus.DONE, "pytest 流水线已搭建")

    checklist.print_checklist()

    print("\n待办项:")
    for item in checklist.get_pending_items()[:5]:
        print(f"  - {item['id']}: {item['name']}")

    checklist.export_checklist("eval_checklist.json")
```

### 第三步：自我评估

```python
# self_assessment.py
"""自我评估系统"""

import json
from typing import Dict, List, Any
from dataclasses import dataclass, field


@dataclass
class AssessmentQuestion:
    """评估问题"""
    question_id: str
    category: str
    question: str
    options: List[str]
    correct_answer: int  # 正确答案索引
    explanation: str

    def to_dict(self) -> dict:
        return {
            "question_id": self.question_id,
            "category": self.category,
            "question": self.question,
            "options": self.options,
            "explanation": self.explanation,
        }


class SelfAssessment:
    """自我评估系统"""

    def __init__(self):
        self.questions = self._build_questions()
        self.answers: Dict[str, int] = {}
        self.score = 0

    def _build_questions(self) -> List[AssessmentQuestion]:
        """构建评估问题"""
        return [
            AssessmentQuestion(
                "Q01", "评估框架",
                "以下哪个不是 Agent 评估的核心维度？",
                ["准确性", "延迟", "美观度", "安全性"],
                2, "美观度不是评估 Agent 的核心维度。"),
            AssessmentQuestion(
                "Q02", "评估框架",
                "评估量表（Rubric）的主要作用是什么？",
                ["记录日志", "提供结构化评分标准", "运行测试", "部署模型"],
                1, "评估量表提供结构化的评分标准。"),
            AssessmentQuestion(
                "Q03", "基准测试",
                "SWE-bench 主要评估什么能力？",
                ["知识广度", "代码生成", "软件工程问题解决", "多轮对话"],
                2, "SWE-bench 评估解决真实软件工程问题的能力。"),
            AssessmentQuestion(
                "Q04", "自动化流水线",
                "LLM-as-Judge 模式是什么？",
                ["用 LLM 生成测试用例", "用 LLM 评估 LLM 输出",
                 "用 LLM 运行测试", "用 LLM 部署模型"],
                1, "LLM-as-Judge 是用 LLM 来评估 LLM 的输出。"),
            AssessmentQuestion(
                "Q05", "可观测性",
                "可观测性的三大支柱是什么？",
                ["CPU、内存、磁盘", "Traces、Metrics、Logs",
                 "输入、处理、输出", "开发、测试、部署"],
                1, "Traces、Metrics、Logs 是可观测性的三大支柱。"),
            AssessmentQuestion(
                "Q06", "可观测性",
                "OpenTelemetry 的主要作用是什么？",
                ["运行 LLM", "提供标准化的可观测性框架",
                 "生成报告", "管理用户"],
                1, "OpenTelemetry 提供标准化的可观测性框架。"),
            AssessmentQuestion(
                "Q07", "工具集成",
                "LangSmith 是什么类型的工具？",
                ["代码编辑器", "LLM 追踪平台", "数据库", "Web 服务器"],
                1, "LangSmith 是 LangChain 的 LLM 追踪平台。"),
            AssessmentQuestion(
                "Q08", "迭代优化",
                "A/B 测试的主要目的是什么？",
                ["记录日志", "对比不同版本的表现", "运行基准测试", "部署模型"],
                1, "A/B 测试用于对比不同版本的表现。"),
            AssessmentQuestion(
                "Q09", "迭代优化",
                "反馈循环的正确顺序是什么？",
                ["评估-改进-分析-再评估", "分析-评估-改进-再评估",
                 "评估-分析-改进-再评估", "改进-评估-分析-再评估"],
                2, "正确顺序是：评估-分析-改进-再评估。"),
            AssessmentQuestion(
                "Q10", "综合",
                "以下哪个不是评估驱动迭代的步骤？",
                ["收集评估数据", "分析失败模式", "直接修改代码", "验证改进效果"],
                2, "应该先分析再改进，而不是直接修改代码。"),
        ]

    def answer_question(self, question_id: str, answer_index: int):
        """回答问题"""
        self.answers[question_id] = answer_index

    def calculate_score(self) -> Dict[str, Any]:
        """计算分数"""
        total = len(self.questions)
        correct = 0
        details = []

        for q in self.questions:
            user_answer = self.answers.get(q.question_id, -1)
            is_correct = user_answer == q.correct_answer
            if is_correct:
                correct += 1

            details.append({
                "question_id": q.question_id,
                "correct": is_correct,
                "user_answer": user_answer,
                "correct_answer": q.correct_answer,
                "explanation": q.explanation,
            })

        score = round(correct / total, 4) if total > 0 else 0
        self.score = score

        # 评估等级
        if score >= 0.9:
            level = "优秀"
            comment = "你对评估框架有深入的理解！"
        elif score >= 0.7:
            level = "良好"
            comment = "基础扎实，建议深入学习高级主题。"
        elif score >= 0.5:
            level = "一般"
            comment = "建议回顾本周内容，加强实践。"
        else:
            level = "需努力"
            comment = "建议从基础开始重新学习。"

        return {
            "total_questions": total,
            "correct_answers": correct,
            "score": score,
            "level": level,
            "comment": comment,
            "details": details,
        }

    def run_assessment(self) -> Dict:
        """运行自我评估"""
        print("Agent 评估方法论 - 自我评估")
        print("=" * 60)

        # 模拟回答（实际使用时应由用户输入）
        import random
        for q in self.questions:
            # 模拟用户回答（70% 概率正确）
            if random.random() < 0.7:
                self.answer_question(q.question_id, q.correct_answer)
            else:
                wrong = [i for i in range(len(q.options)) if i != q.correct_answer]
                self.answer_question(q.question_id, random.choice(wrong))

        result = self.calculate_score()

        print(f"\n评估结果:")
        print(f"  总题数: {result['total_questions']}")
        print(f"  正确数: {result['correct_answers']}")
        print(f"  得分: {result['score']*100:.1f}%")
        print(f"  等级: {result['level']}")
        print(f"  评语: {result['comment']}")

        print(f"\n详细结果:")
        for detail in result["details"]:
            status = "正确" if detail["correct"] else "错误"
            print(f"  {detail['question_id']}: {status}")
            if not detail["correct"]:
                print(f"    你的答案: {detail['user_answer']}")
                print(f"    正确答案: {detail['correct_answer']}")
                print(f"    解释: {detail['explanation']}")

        return result

    def export_result(self, filepath: str, result: Dict):
        """导出评估结果"""
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"\n评估结果已导出到: {filepath}")


if __name__ == "__main__":
    assessment = SelfAssessment()
    result = assessment.run_assessment()
    assessment.export_result("self_assessment_result.json", result)
```

---

## 预期输出

### 运行本周回顾

```bash
python week_review.py
```

```
======================================================================
Week 11: Agent 评估 — 完整回顾
======================================================================

Day 1: Agent 评估框架
--------------------------------------------------
  - 四大评估维度：准确性、延迟、成本、安全性
  - 评估量表（Rubric）：结构化评分标准
  - 测试套件（Test Suite）：自动化评估
  代码示例: eval_dimensions.py, rubric.py, test_agent_eval.py
  工具: pytest, dataclasses

Day 2: 业界基准测试
--------------------------------------------------
  - SWE-bench：真实软件工程问题
  - HumanEval：代码生成能力
  - GAIA：综合推理能力
  - MMLU：知识理解广度
  ...

本周使用的工具:
  - arize-phoenix
  - datasets
  - langsmith
  - numpy
  - opentelemetry
  - pandas
  - psutil
  - pytest

代码示例总数: 18
```

### 运行评估检查表

```bash
python eval_checklist.py
```

```
Agent 评估检查表: 我的 Agent
======================================================================

评估框架:
--------------------------------------------------
  [x] EF01: 定义评估维度
  [x] EF02: 设计评估量表
  [~] EF03: 创建测试数据集
       备注: 部分完成

基准测试:
--------------------------------------------------
  [x] BT01: 选择合适的基准
  [ ] BT02: 运行基准测试
  [ ] BT03: 解读结果

进度: 4/16 (25.0%)
```

### 运行自我评估

```bash
python self_assessment.py
```

```
Agent 评估方法论 - 自我评估
============================================================

评估结果:
  总题数: 10
  正确数: 7
  得分: 70.0%
  等级: 良好
  评语: 基础扎实，建议深入学习高级主题。

详细结果:
  Q01: 正确
  Q02: 正确
  Q03: 正确
  Q04: 错误
    你的答案: 0
    正确答案: 1
    解释: LLM-as-Judge 是用 LLM 来评估 LLM 的输出。
  ...
```

---

## 常见错误及解决方案

### 错误 1: 评估问题理解不清

**解决方案：** 仔细阅读问题和选项，理解每个概念的定义。

### 错误 2: 检查表项目遗漏

**解决方案：** 参考本周内容，确保覆盖所有关键点。

---

## 每日挑战

### 挑战 1: 完善评估清单

根据你的具体项目，添加更多自定义的检查项。

### 挑战 2: 创建评估模板

为你的团队创建一个可复用的 Agent 评估模板。

### 挑战 3: 规划下一步

基于评估结果，规划下一周的学习和改进方向。

---

## 本周小结

Week 11 我们系统学习了 Agent 评估：

### 核心知识点

| 日期 | 主题 | 核心内容 |
|------|------|----------|
| Day 1 | 评估框架 | 四大维度、Rubric、测试套件 |
| Day 2 | 基准测试 | SWE-bench、HumanEval、GAIA、MMLU |
| Day 3 | 自动化流水线 | pytest、LLM-as-Judge、回归测试 |
| Day 4 | 可观测性 | Traces、Metrics、Logs、OpenTelemetry |
| Day 5 | 工具集成 | LangSmith、Arize Phoenix |
| Day 6 | 迭代优化 | 分析、A/B 测试、反馈循环 |

### 关键公式

```
评估得分 = sum(权重 x 标准化分数)

通过率 = 通过数 / 总数

改进幅度 = (新指标 - 旧指标) / 旧指标
```

### 工具清单

- **评估**: pytest, pandas, numpy
- **基准测试**: datasets, openai
- **可观测性**: opentelemetry, langsmith, arize-phoenix
- **分析**: tabulate, matplotlib

### 下周预告

Week 12 我们将学习 Agent 的部署与运维，包括：

- Docker 容器化部署
- Kubernetes 编排
- CI/CD 流水线
- 生产环境监控

---

*恭喜你完成了 Week 11 的学习！评估是持续改进的基础，希望你能在实际项目中应用这些知识。*

*下周见！*
