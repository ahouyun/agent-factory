# 📅 Week 19：Demo 演示 + 简历话术

## 🧭 本周方向
> 准备项目演示，打磨简历话术，为求职做好准备。

## 🎯 生活比喻
> 第 19 周就像面试前的最后准备。你需要练习自我介绍（Demo 演示）、准备回答常见问题（简历话术）、整理着装（作品集展示）。这是从"技术能力"到"表达能力"的转变。

## 📋 本周目标
1. 完成 Demo 演示脚本
2. 打磨简历项目描述
3. 准备常见问题回答
4. 模拟演示练习

## 🗺️ 每日计划

### Day 1：Demo 脚本设计
- 确定演示重点
- 设计演示流程
- 准备演示数据

### Day 2：演示材料准备
- 制作 PPT/Slides
- 准备演示视频
- 测试演示环境

### Day 3：简历项目描述
- 优化项目经历描述
- 突出技术亮点
- 量化成果

### Day 4：面试话术准备
- 准备项目介绍
- 准备技术问答
- 准备行为面试

### Day 5：模拟演示
- 完整演示练习
- 时间控制
- 应对问题

### Day 6：优化改进
- 根据反馈改进
- 完善细节
- 最终准备

### Day 7：本周复盘
- 回顾准备过程
- 最终检查
- 心态调整

## 💻 代码示例：简历话术

```python
"""
简历项目描述优化器
"""
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class ProjectExperience:
    name: str
    role: str
    duration: str
    tech_stack: List[str]
    responsibilities: List[str]
    achievements: List[str]

class ResumeOptimizer:
    """简历优化器"""
    
    def __init__(self):
        self.action_verbs = [
            "设计", "实现", "优化", "重构", "部署",
            "开发", "集成", "测试", "维护", "领导"
        ]
    
    def optimize_description(self, responsibility: str) -> str:
        """优化描述"""
        # 添加量化数据
        # 使用强动词
        # 突出成果
        return responsibility
    
    def generate_bullet_points(self, project: ProjectExperience) -> List[str]:
        """生成要点"""
        bullets = []
        
        for resp in project.responsibilities:
            bullet = f"• {resp}"
            bullets.append(bullet)
        
        for achievement in project.achievements:
            bullet = f"• {achievement}"
            bullets.append(bullet)
        
        return bullets
    
    def generate_project_summary(self, project: ProjectExperience) -> str:
        """生成项目摘要"""
        summary = f"""
项目名称: {project.name}
角色: {project.role}
时间: {project.duration}
技术栈: {', '.join(project.tech_stack)}

主要职责:
"""
        for resp in project.responsibilities:
            summary += f"  - {resp}\n"
        
        summary += "\n主要成果:\n"
        for achievement in project.achievements:
            summary += f"  - {achievement}\n"
        
        return summary

# 使用示例
optimizer = ResumeOptimizer()

project = ProjectExperience(
    name="AI Agent 智能助手",
    role="核心开发者",
    duration="2024.01 - 2024.03",
    tech_stack=["Python", "LangChain", "FastAPI", "Docker"],
    responsibilities=[
        "设计并实现了基于 LLM 的 Agent 系统架构",
        "集成了多种外部工具，支持自动化任务执行",
        "实现了对话管理和上下文维护功能"
    ],
    achievements=[
        "系统响应时间优化 40%",
        "任务完成率达到 85%",
        "获得 100+ GitHub Stars"
    ]
)

print(optimizer.generate_project_summary(project))
```

## 📋 Demo 演示脚本模板

```python
"""
Demo 演示脚本
"""

DEMO_SCRIPT = """
# Demo 演示脚本

## 开场 (1 分钟)
大家好，我叫 [你的名字]，今天我要展示的是 [项目名称]。

这个项目是我在 Agent Factory 学习期间完成的一个实战项目。

## 项目背景 (1 分钟)
[介绍项目背景和解决的问题]

## 技术亮点 (2 分钟)
[介绍 2-3 个技术亮点]

## 功能演示 (5 分钟)
[演示核心功能]

1. 功能 1: [演示]
2. 功能 2: [演示]
3. 功能 3: [演示]

## 技术架构 (1 分钟)
[展示架构图，简要说明]

## 成果与收获 (1 分钟)
[量化成果和个人收获]

## Q&A (2 分钟)
[回答问题]

## 总结 (30 秒)
感谢大家的聆听！
"""

print(DEMO_SCRIPT)
```

## 📋 常见面试问题

```python
"""
常见面试问题准备
"""

INTERVIEW_QUESTIONS = {
    "项目介绍": [
        "请介绍一下你的项目",
        "项目中最有挑战的部分是什么？",
        "为什么选择这个技术方案？",
        "项目中遇到的最大困难是什么？如何解决的？"
    ],
    "技术深度": [
        "Agent 的核心工作原理是什么？",
        "如何处理 LLM 的幻觉问题？",
        "如何优化 Agent 的响应速度？",
        "如何保证 Agent 的安全性？"
    ],
    "系统设计": [
        "如何设计一个高可用的 Agent 系统？",
        "如何处理大量并发请求？",
        "如何监控和诊断 Agent 的问题？"
    ],
    "行为面试": [
        "描述一次你解决复杂问题的经历",
        "你如何处理与团队成员的分歧？",
        "你如何保持技术学习？"
    ]
}

for category, questions in INTERVIEW_QUESTIONS.items():
    print(f"\n{category}:")
    for q in questions:
        print(f"  - {q}")
```

## ✅ 本周验收清单
- [ ] Demo 脚本完成
- [ ] 演示材料准备
- [ ] 简历项目描述优化
- [ ] 面试话术准备
- [ ] 模拟演示完成
- [ ] 最终准备就绪

## 📝 复盘小纸条
- 本周最大收获: ...
- 演示效果如何: ...
- 简历优化要点: ...
- 面试准备情况: ...
