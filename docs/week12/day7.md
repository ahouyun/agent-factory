# 📅 Week 12 Day 7：复盘

## 🧭 今日方向
> 回顾 Week 12 生产部署学习内容，总结关键知识点，梳理遗留问题，为下周做准备。

## 🎯 生活比喻
> 复盘就像飞行后的航后分析。飞行员不会因为安全着陆就忽略任何异常数据。每一次飞行都有值得总结的地方：哪些操作完美，哪些可以改进，哪些需要警惕。学习也是一样，复盘是提升的关键。

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
Week 12 复盘：知识图谱 + 问题梳理 + 学习计划生成器
"""
from dataclasses import dataclass, field
from typing import List, Dict
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
        graph = "知识图谱\n" + "=" * 50 + "\n\n"
        
        for day in range(1, 8):
            nodes = self.get_by_day(day)
            if nodes:
                day_names = {1: "Docker容器化", 2: "CI/CD", 3: "模型Fallback", 
                            4: "成本优化", 5: "限流熔断", 6: "监控告警", 7: "复盘"}
                graph += f"Day {day}: {day_names.get(day, '')}\n"
                for node in nodes:
                    status = {"learning": "●", "familiar": "◐", "mastered": "○"}
                    graph += f"  {status[node.mastery]} {node.name}\n"
                    if node.connections:
                        graph += f"    → 关联: {', '.join(node.connections[:3])}\n"
                graph += "\n"
        
        return graph


def create_week12_graph() -> KnowledgeGraph:
    graph = KnowledgeGraph()
    
    # Day 1: Docker 容器化
    graph.add_node(KnowledgeNode("Docker", "容器化技术", 1, "high", "familiar", ["Docker Compose"]))
    graph.add_node(KnowledgeNode("Dockerfile", "镜像构建脚本", 1, "high", "familiar"))
    graph.add_node(KnowledgeNode("Docker Compose", "多容器编排", 1, "high", "familiar", ["Docker"]))
    graph.add_node(KnowledgeNode("容器网络", "容器间通信", 1, "medium", "learning"))
    
    # Day 2: CI/CD
    graph.add_node(KnowledgeNode("GitHub Actions", "CI/CD 平台", 2, "high", "familiar"))
    graph.add_node(KnowledgeNode("工作流", "自动化流程", 2, "high", "familiar"))
    graph.add_node(KnowledgeNode("自动化测试", "测试自动化", 2, "medium", "familiar"))
    
    # Day 3: 模型 Fallback
    graph.add_node(KnowledgeNode("Fallback", "降级方案", 3, "high", "familiar", ["健康检查"]))
    graph.add_node(KnowledgeNode("多供应商", "多模型切换", 3, "high", "familiar"))
    graph.add_node(KnowledgeNode("健康检查", "服务状态检测", 3, "medium", "familiar"))
    
    # Day 4: 成本优化
    graph.add_node(KnowledgeNode("Token 计数", "成本计算", 4, "high", "familiar", ["模型路由"]))
    graph.add_node(KnowledgeNode("模型路由", "智能选择模型", 4, "high", "learning"))
    graph.add_node(KnowledgeNode("成本监控", "成本告警", 4, "medium", "learning"))
    
    # Day 5: 限流/熔断/重试
    graph.add_node(KnowledgeNode("限流", "请求频率限制", 5, "high", "familiar"))
    graph.add_node(KnowledgeNode("熔断器", "防止级联故障", 5, "high", "familiar"))
    graph.add_node(KnowledgeNode("重试策略", "自动重试", 5, "high", "familiar"))
    
    # Day 6: 监控告警
    graph.add_node(KnowledgeNode("监控指标", "Metrics 收集", 6, "high", "familiar", ["告警规则"]))
    graph.add_node(KnowledgeNode("告警规则", "告警触发条件", 6, "high", "familiar"))
    graph.add_node(KnowledgeNode("日志聚合", "日志收集查询", 6, "high", "familiar"))
    
    connections = [
        ("Docker", "Docker Compose"), ("Fallback", "健康检查"),
        ("Token 计数", "模型路由"), ("监控指标", "告警规则")
    ]
    for from_node, to_node in connections:
        graph.add_connection(from_node, to_node)
    
    return graph


# ========== 2. 问题梳理 ==========

@dataclass
class Problem:
    id: int
    day: int
    category: str
    question: str
    solution: str
    status: str


def create_problem_list() -> List[Problem]:
    return [
        Problem(1, 1, "concept", "Docker 镜像和容器有什么区别？",
                "镜像是只读模板，容器是运行实例", "solved"),
        Problem(2, 2, "code", "GitHub Actions 如何使用 Secrets？",
                "在 Settings 中配置，在 workflow 中用 ${{ secrets.NAME }} 引用", "solved"),
        Problem(3, 3, "concept", "Fallback 的触发条件有哪些？",
                "API 超时、错误状态码、健康检查失败、频率超限", "solved"),
        Problem(4, 4, "code", "如何准确计算 Token 数量？",
                "使用 tiktoken 库，或根据供应商提供的计数器", "partial"),
        Problem(5, 5, "concept", "熔断器的三种状态是什么？",
                "关闭（正常）、打开（熔断）、半开（恢复中）", "solved"),
        Problem(6, 6, "code", "如何设置合理的告警阈值？",
                "基于历史数据，考虑业务特点，设置分级告警", "solved"),
        Problem(7, 6, "concept", "日志保留策略怎么设计？",
                "热数据 7 天，温数据 30 天，冷数据归档", "solved"),
    ]


# ========== 3. 自我评估 ==========

def create_self_assessment() -> Dict:
    return {
        "知识掌握度": {
            "Docker 容器化": "familiar",
            "CI/CD 流水线": "familiar",
            "模型 Fallback": "familiar",
            "成本优化": "learning",
            "限流/熔断/重试": "familiar",
            "监控告警": "familiar"
        },
        "技能掌握度": {
            "编写 Dockerfile": "familiar",
            "配置 GitHub Actions": "familiar",
            "实现 Fallback 机制": "familiar",
            "设计监控系统": "familiar"
        },
        "本周收获": [
            "掌握了 Docker 容器化部署",
            "学会了 GitHub Actions CI/CD",
            "理解了生产级保护机制",
            "建立了监控告警思维"
        ],
        "遗留问题": [
            "Token 计数的准确性",
            "成本优化的深度实践",
            "监控系统的生产部署"
        ]
    }


# ========== 4. 学习计划 ==========

def generate_week_plan() -> str:
    return """
下周学习计划 (Week 13: Deep Dive)

周一: 选择深入方向（A-F）
周二: 开始深度实践
周三: 继续深入实践
周四: 整理学习成果
周五: 准备项目实战
周六: 项目启动
周日: 本周复盘

重点任务:
1. 选择一个深入方向（LLM/Agent框架/多模态等）
2. 完成该方向的核心实践
3. 为 Week 14-17 项目实战做准备
"""


# ========== 5. 主函数 ==========

def main():
    print("=" * 60)
    print("Week 12 复盘")
    print("=" * 60)
    
    # 1. 知识图谱
    print("\n1. 知识图谱")
    graph = create_week12_graph()
    print(graph.visualize())
    
    # 2. 问题梳理
    print("\n2. 问题梳理")
    problems = create_problem_list()
    solved = sum(1 for p in problems if p.status == "solved")
    print(f"   总问题数: {len(problems)}, 已解决: {solved}")
    
    # 3. 自我评估
    print("\n3. 自我评估")
    assessment = create_self_assessment()
    print("\n   知识掌握度:")
    for topic, level in assessment["知识掌握度"].items():
        print(f"     {topic}: {level}")
    
    # 4. 下周计划
    print("\n4. 下周计划")
    print(generate_week_plan())
    
    print("=" * 60)
    print("Week 12 复盘完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 不知道从哪里开始复盘 | 按时间顺序回顾每天内容 |
| 2 | 知识点太多记不住 | 用思维导图整理，抓核心 |
| 3 | 遗留问题太多 | 按优先级排序，先解决关键问题 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| 复盘 | 回顾总结，发现改进机会 |
| 知识图谱 | 可视化知识点及其关联 |
| 掌握程度 | learning → familiar → mastered |

## ✅ 验收清单
- [ ] 完成知识图谱绘制
- [ ] 整理本周所有问题和解法
- [ ] 完成自我评估
- [ ] 制定下周学习计划

## 📝 复盘小纸条
- 今天最大的收获: 完成了 Week 12 生产部署的系统复盘
- 还不太确定的: 成本优化的深度实践

## 📥 明日同步接口
- 今日完成度: 100%
- 卡点描述: 无
- 代码是否能跑通: 是
- 明天希望: 开始 Week 13 Deep Dive 选修方向
