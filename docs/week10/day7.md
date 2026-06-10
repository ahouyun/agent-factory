# 📅 Week 10 Day 7：复盘

## 🧭 今日方向
> 回顾本周 Agentic RL 学习内容，总结关键知识点，梳理遗留问题，为下周做准备。

## 🎯 生活比喻
> 复盘就像考试后的错题本。你不会把每道错题都重做一遍，而是分析为什么错、是概念不清还是粗心大意、下次遇到类似题怎么避免。学习也是一样，复盘不是简单重复，而是找到知识盲区，建立知识连接。

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
Week 10 复盘：知识图谱 + 问题梳理 + 学习计划生成器
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
    day: int  # 所在天数
    importance: str  # high, medium, low
    mastery: str = "learning"  # learning, familiar, mastered
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
                day_names = {1: "SFT到RLHF", 2: "LoRA/QLoRA", 3: "DPO/GRPO", 
                            4: "Agent数据+奖励", 5: "动手微调", 6: "评测分析", 7: "复盘"}
                graph += f"Day {day}: {day_names.get(day, '')}\n"
                for node in nodes:
                    status = {"learning": "●", "familiar": "◐", "mastered": "○"}
                    graph += f"  {status[node.mastery]} {node.name}\n"
                    if node.connections:
                        graph += f"    → 关联: {', '.join(node.connections[:3])}\n"
                graph += "\n"
        
        return graph


def create_week10_graph() -> KnowledgeGraph:
    """创建 Week 10 知识图谱"""
    graph = KnowledgeGraph()
    
    # Day 1: SFT 到 RLHF
    graph.add_node(KnowledgeNode("预训练", "自回归语言建模", 1, "high", "mastered"))
    graph.add_node(KnowledgeNode("SFT", "监督微调", 1, "high", "familiar", ["预训练", "RLHF"]))
    graph.add_node(KnowledgeNode("RLHF", "人类反馈强化学习", 1, "high", "learning", ["SFT", "奖励模型", "PPO"]))
    graph.add_node(KnowledgeNode("奖励模型", "学习人类偏好的模型", 1, "medium", "learning"))
    graph.add_node(KnowledgeNode("PPO", "策略梯度算法", 1, "medium", "learning"))
    
    # Day 2: LoRA / QLoRA
    graph.add_node(KnowledgeNode("LoRA", "低秩适配", 2, "high", "familiar", ["全参数微调"]))
    graph.add_node(KnowledgeNode("QLoRA", "量化+LoRA", 2, "high", "learning", ["LoRA", "量化"]))
    graph.add_node(KnowledgeNode("低秩分解", "矩阵近似", 2, "medium", "familiar"))
    graph.add_node(KnowledgeNode("量化", "减少模型精度", 2, "medium", "learning"))
    
    # Day 3: DPO / GRPO
    graph.add_node(KnowledgeNode("DPO", "直接偏好优化", 3, "high", "familiar", ["RLHF", "GRPO"]))
    graph.add_node(KnowledgeNode("GRPO", "组相对策略优化", 3, "high", "learning", ["DPO"]))
    graph.add_node(KnowledgeNode("偏好数据", "chosen/rejected对", 3, "medium", "familiar"))
    
    # Day 4: Agent 数据 + 奖励
    graph.add_node(KnowledgeNode("轨迹数据", "Agent交互记录", 4, "high", "familiar", ["SFT数据"]))
    graph.add_node(KnowledgeNode("多维奖励", "任务/工具/推理", 4, "high", "learning", ["奖励模型"]))
    graph.add_node(KnowledgeNode("数据增强", "增加数据多样性", 4, "medium", "familiar"))
    
    # Day 5: 动手微调
    graph.add_node(KnowledgeNode("GPT-2微调", "实际模型训练", 5, "high", "familiar", ["LoRA", "SFT"]))
    graph.add_node(KnowledgeNode("训练循环", "前向/反向传播", 5, "medium", "mastered"))
    graph.add_node(KnowledgeNode("文本生成", "采样/解码", 5, "medium", "familiar"))
    
    # Day 6: 评测分析
    graph.add_node(KnowledgeNode("BLEU", "机器翻译指标", 6, "medium", "familiar"))
    graph.add_node(KnowledgeNode("ROUGE", "文本摘要指标", 6, "medium", "familiar"))
    graph.add_node(KnowledgeNode("Bad Case分析", "错误案例分析", 6, "high", "mastered", ["评测集"]))
    graph.add_node(KnowledgeNode("对比实验", "baseline对比", 6, "high", "familiar"))
    
    # 添加连接
    connections = [
        ("SFT", "预训练"), ("RLHF", "SFT"), ("奖励模型", "RLHF"),
        ("QLoRA", "LoRA"), ("QLoRA", "量化"),
        ("DPO", "RLHF"), ("GRPO", "DPO"),
        ("多维奖励", "奖励模型"),
        ("GPT-2微调", "LoRA"), ("GPT-2微调", "SFT"),
        ("Bad Case分析", "评测集")
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
    category: str  # concept, code, tool
    question: str
    solution: str
    status: str  # solved, pending, partial


def create_problem_list() -> List[Problem]:
    """创建问题列表"""
    problems = [
        Problem(1, 1, "concept", "RLHF 中的 KL 散度惩罚是什么作用？",
                "防止策略偏离参考模型太远，保持生成质量", "solved"),
        Problem(2, 2, "concept", "LoRA 的 rank 怎么选？",
                "根据任务复杂度选择，简单任务 rank=4，复杂任务 rank=16-64", "solved"),
        Problem(3, 2, "code", "LoRA 层初始化为什么 lora_B 要设为 0？",
                "确保训练开始时 LoRA 分支输出为 0，不影响原始模型", "solved"),
        Problem(4, 3, "concept", "DPO 和 RLHF 的本质区别是什么？",
                "DPO 绕过奖励模型，直接从偏好数据学习", "solved"),
        Problem(5, 4, "code", "Agent 轨迹数据如何处理多轮交互？",
                "使用 conversation 格式，区分 user/assistant/tool 角色", "partial"),
        Problem(6, 5, "code", "训练时 GPU 内存不足怎么办？",
                "减小 batch_size，使用梯度累积，尝试 QLoRA", "solved"),
        Problem(7, 6, "concept", "BLEU 分数高但效果差怎么办？",
                "结合人工评测，使用多个指标综合评估", "solved"),
        Problem(8, 6, "code", "如何设计公平的对比实验？",
                "保持超参数一致，使用相同评测集和评测指标", "solved"),
    ]
    return problems


# ========== 3. 学习计划 ==========

@dataclass
class LearningTask:
    """学习任务"""
    task: str
    priority: str  # high, medium, low
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
            task="使用 LoRA 微调一个实际模型",
            priority="high",
            estimated_time="4-6小时",
            dependencies=["LoRA", "QLoRA"]
        ))
        
        tasks.append(LearningTask(
            task="构建完整的评测 pipeline",
            priority="medium",
            estimated_time="3-4小时",
            dependencies=["评测指标", "Bad Case分析"]
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
  周一: 巩固 LoRA/QLoRA 概念
  周二: 实践 Agent 数据构造
  周三: 微调实验
  周四: 评测 pipeline 搭建
  周五: Bad case 分析 + 优化
  周六: 项目整合
  周日: 本周复盘 + 下周规划
"""
        
        return plan


# ========== 4. 自我评估 ==========

def create_self_assessment() -> Dict:
    """创建自我评估"""
    assessment = {
        "知识掌握度": {
            "预训练/SFT/RLHF 流程": "familiar",
            "LoRA/QLoRA 原理": "familiar",
            "DPO/GRPO 算法": "learning",
            "Agent 数据构造": "familiar",
            "奖励模型设计": "learning",
            "评测指标": "familiar"
        },
        "技能掌握度": {
            "实现 LoRA 层": "familiar",
            "训练循环编写": "mastered",
            "评测 pipeline": "familiar",
            "Bad case 分析": "mastered"
        },
        "本周收获": [
            "理解了大模型训练的完整流程",
            "掌握了 LoRA 的低秩分解原理",
            "学会了 DPO 的核心思想",
            "实践了 Agent 数据构造方法"
        ],
        "遗留问题": [
            "DPO 的数学推导还不够清晰",
            "GRPO 的实际应用还需要更多练习",
            "评测指标的选择和组合还需要经验"
        ],
        "下周重点": [
            "深入 DPO/GRPO 的数学原理",
            "动手微调一个实际模型",
            "构建完整的评测体系"
        ]
    }
    return assessment


# ========== 5. 主函数 ==========

def main():
    """复盘主函数"""
    print("=" * 60)
    print("Week 10 复盘")
    print("=" * 60)
    
    # 1. 创建知识图谱
    print("\n1. 知识图谱")
    graph = create_week10_graph()
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
        "week": 10,
        "topic": "Agentic RL",
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
    print(f"   可保存为: week10_recap.json")
    
    print("\n" + "=" * 60)
    print("Week 10 复盘完成！")
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
| 消融实验 | 逐一移除组件验证重要性 |
| Baseline | 对比实验的基准模型 |
| 学习计划 | 规划未来学习任务 |
| 自我评估 | 客观评价自己的掌握程度 |

## ✅ 验收清单
- [ ] 完成知识图谱绘制
- [ ] 整理本周所有问题和解法
- [ ] 完成自我评估
- [ ] 制定下周学习计划
- [ ] 复盘文档保存完毕

## 📝 复盘小纸条
- 今天最大的收获: 完成了 Week 10 的系统复盘，梳理了知识体系
- 还不太确定的: DPO 的完整数学推导

## 📥 明日同步接口
- 今日完成度: 100%
- 卡点描述: 无
- 代码是否能跑通: 是
- 明天希望: 开始 Week 11 评估框架的学习
