# 📅 Week 20：模拟面试 + 查漏补缺

## 🧭 本周方向
> 进行模拟面试，查漏补缺，完成毕业准备。

## 🎯 生活比喻
> 第 20 周就像高考前的最后一周。所有的学习已经完成（课程内容），现在要做的是：做模拟题（模拟面试）、复习错题本（查漏补缺）、调整心态（毕业准备）。这是从"学习者"到"实践者"的最后一步。

## 📋 本周目标
1. 完成 2-3 次模拟面试
2. 补充知识短板
3. 完善作品集
4. 准备毕业答辩

## 🗺️ 每日计划

### Day 1：知识复习
- 回顾核心知识点
- 整理知识图谱
- 识别薄弱环节

### Day 2：模拟面试 (1)
- 技术面试模拟
- 记录问题和回答
- 分析改进点

### Day 3：查漏补缺
- 针对性学习
- 补充知识短板
- 强化薄弱环节

### Day 4：模拟面试 (2)
- 系统设计面试模拟
- 行为面试模拟
- 复盘改进

### Day 5：作品集完善
- 更新项目文档
- 优化 GitHub 项目
- 准备在线作品集

### Day 6：毕业准备
- 整理学习成果
- 准备毕业答辩
- 规划未来发展

### Day 7：毕业总结
- 课程总结
- 学习心得
- 未来展望

## 💻 代码示例：知识自测

```python
"""
知识自测工具
"""
from dataclasses import dataclass
from typing import List, Dict
from enum import Enum

class MasteryLevel(Enum):
    UNKNOWN = 0
    LEARNING = 1
    FAMILIAR = 2
    MASTERED = 3

@dataclass
class KnowledgeItem:
    name: str
    category: str
    level: MasteryLevel
    notes: str = ""

class KnowledgeAssessment:
    """知识评估"""
    
    def __init__(self):
        self.items: List[KnowledgeItem] = []
    
    def add_item(self, item: KnowledgeItem):
        self.items.append(item)
    
    def get_weak_areas(self) -> List[KnowledgeItem]:
        """获取薄弱环节"""
        return [item for item in self.items if item.level.value < 2]
    
    def get_report(self) -> Dict:
        """生成报告"""
        total = len(self.items)
        by_level = {}
        
        for item in self.items:
            level = item.level.name
            by_level[level] = by_level.get(level, 0) + 1
        
        return {
            "total_items": total,
            "by_level": by_level,
            "weak_areas": len(self.get_weak_areas()),
            "mastery_rate": by_level.get("MASTERED", 0) / max(total, 1)
        }

# 使用示例
assessment = KnowledgeAssessment()

# 添加知识项
topics = [
    ("Transformer 架构", "核心概念", MasteryLevel.MASTERED),
    ("LoRA 微调", "微调技术", MasteryLevel.FAMILIAR),
    ("DPO 算法", "对齐技术", MasteryLevel.LEARNING),
    ("Docker 容器化", "部署技术", MasteryLevel.FAMILIAR),
    ("CI/CD 流水线", "工程实践", MasteryLevel.LEARNING),
    ("监控告警", "运维技术", MasteryLevel.FAMILIAR),
]

for name, category, level in topics:
    assessment.add_item(KnowledgeItem(name, category, level))

# 生成报告
report = assessment.get_report()
print("知识评估报告:")
print(f"  总知识点: {report['total_items']}")
print(f"  掌握率: {report['mastery_rate']*100:.1f}%")
print(f"  薄弱环节: {report['weak_areas']}")

# 获取薄弱环节
print("\n需要加强的知识点:")
for item in assessment.get_weak_areas():
    print(f"  - {item.name} ({item.category}): {item.level.name}")
```

## 📋 模拟面试复盘模板

```python
"""
模拟面试复盘
"""
from dataclasses import dataclass
from typing import List

@dataclass
class InterviewQuestion:
    question: str
    my_answer: str
    ideal_answer: str
    score: int  # 1-5
    improvement: str

class InterviewReview:
    """面试复盘"""
    
    def __init__(self, round_num: int):
        self.round_num = round_num
        self.questions: List[InterviewQuestion] = []
    
    def add_question(self, q: InterviewQuestion):
        self.questions.append(q)
    
    def get_average_score(self) -> float:
        if not self.questions:
            return 0
        return sum(q.score for q in self.questions) / len(self.questions)
    
    def get_improvements(self) -> List[str]:
        improvements = []
        for q in self.questions:
            if q.score < 4:
                improvements.append(f"[{q.question[:30]}...] {q.improvement}")
        return improvements
    
    def generate_report(self) -> str:
        report = f"""
模拟面试 #{self.round_num} 复盘
==========================

问题数: {len(self.questions)}
平均分: {self.get_average_score():.1f}/5

改进建议:
"""
        for improvement in self.get_improvements():
            report += f"  - {improvement}\n"
        
        return report

# 使用示例
review = InterviewReview(1)

review.add_question(InterviewQuestion(
    question="请介绍你的 Agent 项目",
    my_answer="我做了一个 Agent 助手...",
    ideal_answer="项目背景 -> 技术方案 -> 核心功能 -> 成果数据",
    score=4,
    improvement="需要添加量化数据"
))

review.add_question(InterviewQuestion(
    question="如何处理 LLM 的幻觉问题？",
    my_answer="可以检查事实...",
    ideal_answer="RAG + 事实检查 + 置信度评估 + 降级方案",
    score=3,
    improvement="回答不够全面，需要补充技术方案"
))

print(review.generate_report())
```

## 📋 毕业检查清单

```python
"""
毕业检查清单
"""
graduation_checklist = {
    "知识掌握": [
        "LLM 核心原理",
        "Agent 架构设计",
        "微调技术（LoRA/QLoRA）",
        "评估与优化",
        "生产部署"
    ],
    "技能掌握": [
        "Python 编程",
        "框架使用（LangChain等）",
        "Docker 容器化",
        "CI/CD 实践",
        "监控与运维"
    ],
    "项目完成": [
        "项目功能完整",
        "代码质量达标",
        "文档编写完善",
        "部署方案可行",
        "演示效果良好"
    ],
    "求职准备": [
        "简历优化完成",
        "面试话术准备",
        "模拟面试完成",
        "作品集整理",
        "GitHub 项目完善"
    ]
}

print("=" * 50)
print("毕业检查清单")
print("=" * 50)

for category, items in graduation_checklist.items():
    print(f"\n{category}:")
    for item in items:
        print(f"  □ {item}")
```

## 🎓 毕业感言模板

```python
"""
毕业感言
"""

GRADUATION_SPEECH = """
# 毕业感言

## 回顾
从 Week 1 到 Week 20，我完成了从 Agent 小白到能够独立开发的转变。

## 收获
1. 技术能力：掌握了 Agent 开发的核心技术栈
2. 项目能力：完成了完整的项目实战
3. 工程能力：学会了生产级的开发实践
4. 学习能力：建立了持续学习的方法论

## 感谢
感谢导师的指导，感谢同学们的互助，感谢自己的坚持。

## 展望
毕业不是终点，而是新的起点。我会继续保持学习，将所学应用到实际工作中。

## 寄语
给后来的同学：坚持就是胜利，实践出真知。
"""

print(GRADUATION_SPEECH)
```

## ✅ 本周验收清单
- [ ] 完成模拟面试
- [ ] 知识短板补齐
- [ ] 作品集完善
- [ ] 毕业答辩准备
- [ ] 学习成果整理
- [ ] 毕业总结完成

## 📝 复盘小纸条
- 本周最大收获: ...
- 模拟面试心得: ...
- 20 周学习总结: ...
- 未来规划: ...

## 🎓 毕业寄语

> 20 周的学习旅程结束了，但 Agent 的探索才刚刚开始。
> 希望你能将所学知识应用到实际项目中，持续学习，不断进步。
> 祝你在 Agent 领域取得更大的成就！
