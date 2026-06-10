# 📅 Week 11 Day 7：复盘

## 🧭 今日方向
> 回顾 Week 11 评估框架学习内容，总结关键知识点，梳理遗留问题，为下周做准备。

## 🎯 生活比喻
> 复盘就像项目总结会。你不是简单地汇报"做了什么"，而是深入分析"为什么这样做"、"效果如何"、"下次怎么改进"。好的复盘能让你的经验变成可复用的知识。

## 📋 今日三件事
1. 回顾本周 6 天的学习内容，画出知识图谱
2. 整理本周遇到的问题和解决方案
3. 制定下周学习计划

## 🗺️ 手把手路线

### Step 1：知识回顾
- 做什么: 快速浏览每天的笔记，标注掌握程度
- 为什么: 只有回顾才能发现遗忘的知识点
- 成功标志: 能说出每天的核心知识点

### Step 2：问题梳理
- 做什么: 整理本周遇到的所有问题和解决方案
- 为什么: 问题就是最好的学习机会
- 成功标志: 能列出 5 个以上的问题及解法

### Step 3：知识连接
- 做什么: 找出各知识点之间的联系
- 为什么: 知识只有连接起来才有价值
- 成功标志: 能画出知识图谱

### Step 4：制定计划
- 做什么: 规划下周的学习重点
- 为什么: 有计划才能高效学习
- 成功标志: 有明确的下周目标

## 💻 代码区

```python
"""
Week 11 复盘：知识图谱 + 问题梳理 + 学习计划生成器
"""
from dataclasses import dataclass, field
from typing import List, Dict, Set
from collections import defaultdict
import json

# ========== 1. 知识图谱 ==========

@dataclass
class KnowledgeNode:
    """知识节点"""
    name: str
    description: str
    day: int
    importance: str
    mastery: str = "learning"
    connections: List[str] = field(default_factory=list)
    notes: str = ""


class KnowledgeGraph:
    """知识图谱"""
    def __init__(self):
        self.nodes: Dict[str, KnowledgeNode] = {}
    
    def add_node(self, node: KnowledgeNode):
        self.nodes[node.name] = node
    
    def add_connection(self, from_name: str, to_name: str):
        if from_name in self.nodes:
            self.nodes[from_name].connections.append(to_name)
        if to_name in self.nodes:
            self.nodes[to_name].connections.append(from_name)
    
    def get_by_day(self, day: int) -> List[KnowledgeNode]:
        return [n for n in self.nodes.values() if n.day == day]
    
    def get_weak_areas(self) -> List[KnowledgeNode]:
        return [n for n in self.nodes.values() if n.mastery == "learning"]
    
    def visualize(self) -> str:
        """可视化知识图谱"""
        graph = "知识图谱\n" + "=" * 50 + "\n\n"
        
        for day in range(1, 8):
            nodes = self.get_by_day(day)
            if nodes:
                day_names = {1: "评估框架", 2: "行业基准", 3: "自动化Pipeline", 
                            4: "可观测性", 5: "监控工具", 6: "迭代优化", 7: "复盘"}
                graph += f"Day {day}: {day_names.get(day, '')}\n"
                for node in nodes:
                    status = {"learning": "●", "familiar": "◐", "mastered": "○"}
                    graph += f"  {status[node.mastery]} {node.name}\n"
                    if node.connections:
                        graph += f"    → 关联: {', '.join(node.connections[:3])}\n"
                graph += "\n"
        
        return graph


def create_week11_graph() -> KnowledgeGraph:
    """创建 Week 11 知识图谱"""
    graph = KnowledgeGraph()
    
    # Day 1: 评估框架
    graph.add_node(KnowledgeNode("评估指标", "核心评估维度", 1, "high", "mastered", ["任务完成率", "效率指标"]))
    graph.add_node(KnowledgeNode("任务完成率", "任务完成度评估", 1, "high", "familiar"))
    graph.add_node(KnowledgeNode("效率指标", "步骤效率和时间效率", 1, "medium", "familiar"))
    graph.add_node(KnowledgeNode("安全性指标", "安全违规评估", 1, "medium", "learning"))
    
    # Day 2: 行业基准
    graph.add_node(KnowledgeNode("SWE-bench", "软件工程基准", 2, "high", "familiar", ["HumanEval"]))
    graph.add_node(KnowledgeNode("HumanEval", "代码生成基准", 2, "high", "familiar", ["pass@k"]))
    graph.add_node(KnowledgeNode("GAIA", "通用AI助手基准", 2, "high", "learning"))
    graph.add_node(KnowledgeNode("pass@k", "代码生成评测指标", 2, "medium", "familiar"))
    
    # Day 3: 自动化Pipeline
    graph.add_node(KnowledgeNode("Pipeline架构", "模块化评估流程", 3, "high", "familiar", ["数据模块", "推理模块"]))
    graph.add_node(KnowledgeNode("数据模块", "数据加载和预处理", 3, "medium", "mastered"))
    graph.add_node(KnowledgeNode("推理模块", "模型推理封装", 3, "medium", "familiar"))
    graph.add_node(KnowledgeNode("指标模块", "评估指标计算", 3, "medium", "mastered"))
    
    # Day 4: 可观测性
    graph.add_node(KnowledgeNode("Traces", "分布式追踪", 4, "high", "familiar", ["Metrics", "Logs"]))
    graph.add_node(KnowledgeNode("Metrics", "量化指标", 4, "high", "familiar"))
    graph.add_node(KnowledgeNode("Logs", "结构化日志", 4, "high", "mastered"))
    
    # Day 5: 监控工具
    graph.add_node(KnowledgeNode("LangSmith", "LangChain监控平台", 5, "high", "familiar", ["Arize Phoenix"]))
    graph.add_node(KnowledgeNode("Arize Phoenix", "开源可观测性平台", 5, "high", "learning"))
    
    # Day 6: 迭代优化
    graph.add_node(KnowledgeNode("Bad Case分析", "错误案例分析", 6, "high", "mastered", ["根因分析"]))
    graph.add_node(KnowledgeNode("根因分析", "问题根本原因定位", 6, "high", "familiar"))
    graph.add_node(KnowledgeNode("迭代优化", "评估-改进闭环", 6, "high", "familiar"))
    
    # 添加连接
    connections = [
        ("评估指标", "任务完成率"), ("评估指标", "效率指标"),
        ("SWE-bench", "HumanEval"), ("HumanEval", "pass@k"),
        ("Pipeline架构", "数据模块"), ("Pipeline架构", "推理模块"),
        ("Traces", "Metrics"), ("Traces", "Logs"),
        ("LangSmith", "Arize Phoenix"),
        ("Bad Case分析", "根因分析"), ("根因分析", "迭代优化")
    ]
    for from_node, to_node in connections:
        graph.add_connection(from_node, to_node)
    
    return graph


# ========== 2. 问题梳理 ==========

@dataclass
class Problem:
    """问题记录"""
    id: int
    day: int
    category: str
    question: str
    solution: str
    status: str


def create_problem_list() -> List[Problem]:
    """创建问题列表"""
    problems = [
        Problem(1, 1, "concept", "Agent 评估和传统 ML 评估有什么区别？",
                "Agent 涉及多步交互、工具调用、环境反馈，需要更复杂的评估体系", "solved"),
        Problem(2, 2, "concept", "pass@k 是怎么计算的？",
                "pass@k = 1 - C(n-c, k) / C(n, k)，n是生成次数，c是成功次数", "solved"),
        Problem(3, 3, "code", "Pipeline 如何支持并行评估？",
                "使用多线程或异步处理，每个样本独立评估", "partial"),
        Problem(4, 4, "concept", "Traces 和 Logs 有什么区别？",
                "Traces 追踪请求完整路径，Logs 记录具体事件；Traces 是 Logs 的有序集合", "solved"),
        Problem(5, 5, "tool", "LangSmith 和 Arize Phoenix 怎么选？",
                "LangChain 生态用 LangSmith，需要漂移检测用 Arize Phoenix", "solved"),
        Problem(6, 6, "code", "如何避免迭代优化陷入局部最优？",
                "多样性探索，定期引入新数据，监控多个指标", "pending"),
        Problem(7, 6, "concept", "评估指标之间冲突怎么办？",
                "明确优先级，使用加权综合评分，进行 trade-off 分析", "solved"),
    ]
    return problems


# ========== 3. 学习计划 ==========

@dataclass
class LearningTask:
    """学习任务"""
    task: str
    priority: str
    estimated_time: str
    dependencies: List[str] = field(default_factory=list)


class WeeklyPlanner:
    """周计划生成器"""
    
    def __init__(self, knowledge_graph: KnowledgeGraph, problems: List[Problem]):
        self.graph = knowledge_graph
        self.problems = problems
    
    def analyze_weak_areas(self) -> List[str]:
        """分析薄弱环节"""
        weak_areas = []
        for node in self.graph.get_weak_areas():
            weak_areas.append(f"{node.name} ({node.day}天学习)")
        return weak_areas
    
    def generate_tasks(self) -> List[LearningTask]:
        """生成下周学习任务"""
        tasks = []
        
        # 1. 巩固薄弱知识点
        weak_nodes = self.graph.get_weak_areas()
        for node in weak_nodes[:3]:
            tasks.append(LearningTask(
                task=f"深入学习 {node.name}",
                priority="high",
                estimated_time="2-3小时",
                dependencies=[node.name]
            ))
        
        # 2. 解决遗留问题
        pending_problems = [p for p in self.problems if p.status == "pending"]
        for problem in pending_problems[:2]:
            tasks.append(LearningTask(
                task=f"解决遗留问题: {problem.question[:30]}...",
                priority="medium",
                estimated_time="1-2小时"
            ))
        
        # 3. 实践项目
        tasks.append(LearningTask(
            task="搭建完整的评估 Pipeline",
            priority="high",
            estimated_time="4-6小时",
            dependencies=["Pipeline架构", "指标模块"]
        ))
        
        tasks.append(LearningTask(
            task="使用 LangSmith/Phoenix 监控 Agent",
            priority="medium",
            estimated_time="3-4小时",
            dependencies=["LangSmith", "Arize Phoenix"]
        ))
        
        return tasks
    
    def generate_week_plan(self) -> str:
        """生成周计划"""
        weak_areas = self.analyze_weak_areas()
        tasks = self.generate_tasks()
        
        plan = f"""
下周学习计划
============

本周薄弱环节:
"""
        for area in weak_areas:
            plan += f"  - {area}\n"
        
        plan += "\n下周任务:"
        for i, task in enumerate(tasks, 1):
            plan += f"\n{i}. {task.task}"
            plan += f"\n   优先级: {task.priority}"
            plan += f"\n   预计时间: {task.estimated_time}"
            if task.dependencies:
                plan += f"\n   依赖: {', '.join(task.dependencies)}"
            plan += "\n"
        
        plan += """
每日安排建议:
  周一: 巩固 Traces/Metrics/Logs
  周二: 实践 LangSmith/Arize Phoenix
  周三: 搭建评估 Pipeline
  周四: Bad Case 分析实践
  周五: 迭代优化实践
  周六: 项目整合
  周日: 本周复盘 + 下周规划
"""
        
        return plan


# ========== 4. 自我评估 ==========

def create_self_assessment() -> Dict:
    """创建自我评估"""
    assessment = {
        "知识掌握度": {
            "评估指标体系": "familiar",
            "行业基准测试": "familiar",
            "自动化Pipeline": "familiar",
            "可观测性三支柱": "familiar",
            "监控工具使用": "learning",
            "迭代优化方法": "familiar"
        },
        "技能掌握度": {
            "设计评估框架": "familiar",
            "实现Pipeline": "familiar",
            "Bad Case分析": "mastered",
            "使用LangSmith": "learning",
            "使用Arize Phoenix": "learning"
        },
        "本周收获": [
            "建立了系统化的评估思维",
            "掌握了三大可观测性支柱",
            "学会了用评估驱动迭代优化",
            "了解了行业主流基准测试"
        ],
        "遗留问题": [
            "Pipeline并行化还需要实践",
            "LangSmith/Arize Phoenix的高级功能",
            "迭代优化避免局部最优的方法"
        ],
        "下周重点": [
            "深入实践监控工具",
            "搭建完整的评估体系",
            "实践迭代优化流程"
        ]
    }
    return assessment


# ========== 5. 主函数 ==========

def main():
    """复盘主函数"""
    print("=" * 60)
    print("Week 11 复盘")
    print("=" * 60)
    
    # 1. 创建知识图谱
    print("\n1. 知识图谱")
    graph = create_week11_graph()
    print(graph.visualize())
    
    # 2. 问题梳理
    print("\n2. 问题梳理")
    problems = create_problem_list()
    solved = sum(1 for p in problems if p.status == "solved")
    print(f"   总问题数: {len(problems)}")
    print(f"   已解决: {solved}")
    print(f"   待解决: {len(problems) - solved}")
    
    print("\n   问题列表:")
    for p in problems:
        status_icon = "✓" if p.status == "solved" else "○"
        print(f"   {status_icon} [{p.day}天] {p.question}")
    
    # 3. 自我评估
    print("\n3. 自我评估")
    assessment = create_self_assessment()
    
    print("\n   知识掌握度:")
    for topic, level in assessment["知识掌握度"].items():
        print(f"     {topic}: {level}")
    
    print("\n   技能掌握度:")
    for skill, level in assessment["技能掌握度"].items():
        print(f"     {skill}: {level}")
    
    print("\n   本周收获:")
    for收获 in assessment["本周收获"]:
        print(f"     + {收获}")
    
    print("\n   遗留问题:")
    for问题 in assessment["遗留问题"]:
        print(f"     ? {问题}")
    
    # 4. 生成下周计划
    print("\n4. 下周计划")
    planner = WeeklyPlanner(graph, problems)
    plan = planner.generate_week_plan()
    print(plan)
    
    # 5. 保存复盘
    print("\n5. 复盘保存")
    recap = {
        "week": 11,
        "topic": "评估框架",
        "knowledge_graph": {
            "nodes": len(graph.nodes),
            "weak_areas": [n.name for n in graph.get_weak_areas()]
        },
        "problems": {
            "total": len(problems),
            "solved": solved
        },
        "assessment": assessment
    }
    
    print(f"   复盘数据已准备就绪")
    print(f"   可保存为: week11_recap.json")
    
    print("\n" + "=" * 60)
    print("Week 11 复盘完成！")
    print("=" * 60)
    
    return recap


if __name__ == "__main__":
    recap = main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 不知道从哪里开始复盘 | 按时间顺序回顾每天内容 |
| 2 | 知识点太多记不住 | 用思维导图整理，抓核心 |
| 3 | 遗留问题太多 | 按优先级排序，先解决关键问题 |
| 4 | 下周计划太满 | 聚焦 3 个核心任务，其他作为备选 |
| 5 | 感觉没学到东西 | 列出具体代码和成果，量化学习效果 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| 复盘 | 回顾总结，发现改进机会 |
| 知识图谱 | 可视化知识点及其关联 |
| 掌握程度 | learning → familiar → mastered |
| Bad Case | 模型预测错误的案例 |
| 迭代优化 | 评估-分析-改进的循环 |
| 闭环流程 | 从评估到改进的完整循环 |

## ✅ 验收清单
- [ ] 完成知识图谱绘制
- [ ] 整理本周所有问题和解法
- [ ] 完成自我评估
- [ ] 制定下周学习计划
- [ ] 复盘文档保存完毕

## 📝 复盘小纸条
- 今天最大的收获: 完成了 Week 11 的系统复盘，建立了评估框架的完整认知
- 还不太确定的: LangSmith/Arize Phoenix 的高级功能

## 📥 明日同步接口
- 今日完成度: 100%
- 卡点描述: 无
- 代码是否能跑通: 是
- 明天希望: 开始 Week 12 生产部署的学习
