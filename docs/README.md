# Agent Factory 学习计划

## 项目概述

Agent Factory 是一个系统化的 AI Agent 学习项目，包含 Week 0-4 共 35 天的学习内容。

## 学习路线

### Week 0: 基础准备 (7天)
- Day 1: 学习路线总览 + 工具链搭建
- Day 2: Claude Code / Codex CLI 上手
- Day 3: 项目仓库初始化 + CLAUDE.md 配置
- Day 4: Obsidian 知识库搭建
- Day 5: Python 速通（变量/函数/类/模块）
- Day 6: Python 数据结构 + 类型提示
- Day 7: 周复盘 + 环境检查清单

### Week 1: Python + HTTP (7天)
- Day 1: 虚拟环境 + 包管理 + 项目结构
- Day 2: HTTP 协议 + requests/httpx
- Day 3: 大模型 API 最小调用
- Day 4: 异步编程 asyncio + 并发调用
- Day 5: CLI 工具搭建（typer）
- Day 6: 日志系统 + 错误处理 + .env 管理
- Day 7: 重构 + 测试 + 复盘

### Week 2: FastAPI (7天)
- Day 1: FastAPI 入门 + Pydantic v2 模型
- Day 2: 路由设计 + 请求验证 + 错误处理
- Day 3: 数据库 ORM（SQLAlchemy 2.0）+ CRUD
- Day 4: JWT 认证 + 中间件
- Day 5: WebSocket 实时通信
- Day 6: 结构化输出：JSON Mode + Pydantic Schema
- Day 7: 测试 + 复盘

### Week 3: LLM 基础 (7天)
- Day 1: NLP 基础 + 文本表示演进
- Day 2: Transformer 架构：自注意力机制
- Day 3: 大模型概览：GPT/Claude/LLaMA 架构对比
- Day 4: 提示工程：Few-shot / CoT / 结构化输出
- Day 5: "When NOT to build agents" 判断框架
- Day 6: LLM API 工程实践：流式调用 + Token 管理
- Day 7: 复盘

### Week 4: Agent 范式 (7天)
- Day 1: 智能体定义、类型、发展史
- Day 2: ReAct 范式：推理 + 行动交替
- Day 3: Plan-and-Solve 范式
- Day 4: Reflection 范式：自我反思
- Day 5: Metacognition 范式：元认知
- Day 6: 五种 Agent 工作流模式
- Day 7: 复盘

## 文件结构

```
docs/
├── README.md              # 本文件
├── week0/                 # Week 0 学习文件
│   ├── day1.md
│   ├── day2.md
│   ├── ...
│   └── day7.md
├── week1/                 # Week 1 学习文件
│   ├── day1.md
│   ├── day2.md
│   ├── ...
│   └── day7.md
├── week2/                 # Week 2 学习文件
│   ├── day1.md
│   ├── day2.md
│   ├── ...
│   └── day7.md
├── week3/                 # Week 3 学习文件
│   ├── day1.md
│   ├── day2.md
│   ├── ...
│   └── day7.md
└── week4/                 # Week 4 学习文件
    ├── day1.md
    ├── day2.md
    ├── ...
    └── day7.md
```

## 每日文件结构

每个学习文件包含以下部分：

1. **今日方向**: 学习目标和重点
2. **生活比喻**: 用生活中的例子解释概念
3. **今日三件事**: 今天要完成的三个主要任务
4. **手把手路线**: 详细的步骤说明
5. **代码区**: 完整的、可运行的代码示例
6. **急救包**: 常见问题和解决方案
7. **概念对照表**: 术语和解释
8. **验收清单**: 学习成果检查
9. **复盘小纸条**: 今日收获和疑问
10. **明日同步接口**: 进度同步信息

## 学习建议

1. **每天坚持**: 每天完成一个学习文件
2. **动手实践**: 运行所有代码示例
3. **做笔记**: 使用 Obsidian 记录学习笔记
4. **及时复盘**: 每周进行复盘总结
5. **项目驱动**: 将所学应用到 Agent Factory 项目

## 技术栈

- Python 3.10+
- FastAPI
- SQLAlchemy 2.0
- OpenAI/Anthropic API
- asyncio
- Pydantic v2
- typer
- pytest

## 获取帮助

如果在学习过程中遇到问题：

1. 查看文件中的"急救包"部分
2. 检查代码是否正确运行
3. 参考官方文档
4. 在社区中寻求帮助

## 贡献

欢迎提交改进建议和问题反馈！

---

**开始学习**: 从 `week0/day1.md` 开始！
