# 📅 Week 14：项目实战第 1 周 - 项目规划与核心架构

## 🧭 本周方向
> 选定项目方向，完成项目规划、核心架构设计和基础功能实现。

## 🎯 生活比喻
> 项目实战第 1 周就像盖房子的地基阶段。你不能急着装修（实现花哨功能），而是要先画好图纸（架构设计）、打好地基（核心框架）、立好柱子（基础功能）。这周结束时，你应该能看到一个"毛坯房"的雏形。

## 📋 本周目标
1. 确定项目方向和 MVP 范围
2. 完成技术选型和架构设计
3. 搭建项目骨架和基础框架
4. 实现核心功能的原型

## 🗺️ 每日计划

### Day 1：项目选题与需求分析
- **上午**: 调研 3-5 个候选项目方向
- **下午**: 确定最终选题，撰写需求文档
- **产出**: 项目需求文档 (PRD)

```python
"""
项目选题评估框架
"""
from dataclasses import dataclass
from typing import List

@dataclass
class ProjectIdea:
    name: str
    description: str
    difficulty: str  # easy, medium, hard
    innovation: int  # 1-5
    feasibility: int  # 1-5
    market_value: int  # 1-5

def evaluate_ideas(ideas: List[ProjectIdea]) -> List[ProjectIdea]:
    """评估项目想法"""
    for idea in ideas:
        idea.score = idea.innovation + idea.feasibility + idea.market_value
    return sorted(ideas, key=lambda x: x.score, reverse=True)

# 示例
ideas = [
    ProjectIdea("AI 代码审查助手", "自动审查代码质量和安全", "medium", 4, 4, 5),
    ProjectIdea("智能文档问答系统", "基于文档的问答助手", "medium", 3, 5, 4),
    ProjectIdea("Agent 自动化测试", "使用 Agent 进行软件测试", "hard", 5, 3, 4),
]

ranked = evaluate_ideas(ideas)
for i, idea in enumerate(ranked):
    print(f"{i+1}. {idea.name} - 得分: {idea.score}")
```

### Day 2：架构设计
- **上午**: 设计系统架构图
- **下午**: 定义核心接口和数据模型
- **产出**: 架构设计文档

```python
"""
架构设计示例
"""
from dataclasses import dataclass
from typing import Dict, List

@dataclass
class SystemArchitecture:
    name: str
    components: List[str]
    interfaces: Dict[str, str]
    data_flow: List[str]

# 示例：AI 代码审查助手架构
arch = SystemArchitecture(
    name="AI 代码审查助手",
    components=[
        "代码解析器 (Code Parser)",
        "LLM 推理引擎 (LLM Engine)",
        "规则引擎 (Rule Engine)",
        "报告生成器 (Report Generator)",
        "Web UI"
    ],
    interfaces={
        "Code Parser → LLM Engine": "AST 数据",
        "LLM Engine → Rule Engine": "审查结果",
        "Rule Engine → Report Generator": "问题列表",
    },
    data_flow=[
        "用户提交代码 → 代码解析器",
        "代码解析器 → LLM 推理引擎",
        "LLM 推理引擎 → 规则引擎",
        "规则引擎 → 报告生成器",
        "报告生成器 → 用户界面"
    ]
)

print(f"系统: {arch.name}")
print(f"组件: {len(arch.components)} 个")
print(f"数据流: {len(arch.data_flow)} 步")
```

### Day 3：项目骨架搭建
- **上午**: 初始化项目结构
- **下午**: 配置开发环境
- **产出**: 可运行的项目骨架

### Day 4：核心功能实现 (Part 1)
- **上午**: 实现核心模块 A
- **下午**: 编写单元测试
- **产出**: 核心模块代码

### Day 5：核心功能实现 (Part 2)
- **上午**: 实现核心模块 B
- **下午**: 集成测试
- **产出**: 核心功能原型

### Day 6：功能验证与优化
- **上午**: 端到端测试
- **下午**: 性能优化和 bug 修复
- **产出**: 可演示的 MVP

### Day 7：本周复盘与下周规划
- **上午**: 代码审查和文档更新
- **下午**: 复盘会议和下周计划
- **产出**: 周报和下周计划

## 💻 项目模板

```python
"""
项目目录结构模板
"""
import os

PROJECT_STRUCTURE = """
project-name/
├── README.md
├── requirements.txt
├── setup.py
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── src/
│   ├── __init__.py
│   ├── core/           # 核心逻辑
│   │   ├── __init__.py
│   │   ├── engine.py
│   │   └── models.py
│   ├── tools/          # 工具实现
│   │   ├── __init__.py
│   │   └── tool1.py
│   ├── api/            # API 接口
│   │   ├── __init__.py
│   │   └── routes.py
│   └── utils/          # 工具函数
│       ├── __init__.py
│       └── helpers.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── architecture.md
│   └── api.md
└── scripts/
    ├── setup.sh
    └── deploy.sh
"""

print(PROJECT_STRUCTURE)
```

## 🆘 常见问题
| # | 症状 | 解法 |
|---|------|------|
| 1 | 选题困难 | 从实际需求出发，选择有数据的题目 |
| 2 | 架构过度设计 | 先实现 MVP，后续迭代优化 |
| 3 | 开发环境配置问题 | 使用 Docker 保证环境一致 |
| 4 | 核心功能实现困难 | 拆分小任务，逐步实现 |

## ✅ 本周验收清单
- [ ] 完成项目需求文档
- [ ] 完成架构设计
- [ ] 搭建项目骨架
- [ ] 实现核心功能原型
- [ ] 编写基础测试
- [ ] 完成周报和下周计划

## 📝 复盘小纸条
- 本周最大收获: ...
- 遇到的主要挑战: ...
- 下周重点: ...
