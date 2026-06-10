<div align="center">

# 🤖 Agent Factory

### 从零到精通的 AI Agent 系统学习课程

*融合 10 个优秀开源项目，20 周掌握 AI Agent 开发*

<br/>

[![GitHub stars](https://img.shields.io/github/stars/ahouyun/agent-factory?style=flat-square&logo=github)](https://github.com/ahouyun/agent-factory/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ahouyun/agent-factory?style=flat-square&logo=github)](https://github.com/ahouyun/agent-factory/network/members)
[![GitHub issues](https://img.shields.io/github/issues/ahouyun/agent-factory?style=flat-square&logo=github)](https://github.com/ahouyun/agent-factory/issues)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Language](https://img.shields.io/badge/language-中文-brightgreen?style=flat-square)]()
[![Weeks](https://img.shields.io/badge/学习周期-20周-orange?style=flat-square)]()
[![Days](https://img.shields.io/badge/每日任务-140+天-yellow?style=flat-square)]()

<br/>

[📚 在线阅读](#-如何学习) | [🚀 快速开始](#-快速开始) | [📖 课程大纲](#-课程大纲) | [🙋 贡献指南](#-如何贡献)

</div>

---

## 🎯 项目介绍

<div align="center">

**Agent Factory** 是一套系统性的 AI Agent 学习课程，专为**零基础学习者**设计。

课程融合了 **10 个优秀开源项目**的精华，经过去重和优化后，形成了一套完整的 **20 周学习路径**。

**最终目标：学完后你能独立完成一个可展示、可面试的 Agent 项目。**

</div>

---

## ✨ 你将收获什么？

<div align="center">

| 阶段 | 周数 | 收获 | 产出 |
|:-----:|:----:|------|------|
| 🐍 **Phase 1** | Week 1-4 | Python 工程化 + FastAPI + LLM API | CLI 工具 + 后端骨架 |
| 🤖 **Phase 2** | Week 5-9 | Agent 范式 + RAG + 安全 + 记忆 | 面试 Agent v2 |
| 🔬 **Phase 3** | Week 10-13 | Agentic RL + 评估 + 生产部署 | 可部署的 Agent |
| 🏗️ **Phase 4** | Week 14-17 | 完整 Agent 项目实战 | ⭐ 简历项目 |
| 🎓 **Phase 5** | Week 18-20 | 项目打磨 + 简历 + 模拟面试 | 🎓 毕业 |

</div>

---

## 🚀 快速开始

### 第一步：环境准备

```bash
# 克隆仓库
git clone https://github.com/ahouyun/agent-factory.git
cd agent-factory
```

### 第二步：选择学习方式

<div align="center">

| 方式 | 适合人群 | 说明 |
|:----:|---------|------|
| 🤖 | **AI 助手模式** | 加载 SKILL.md，每天生成任务 |
| 📖 | **直接阅读** | 打开 `docs/week{N}/day{M}.md` |
| 📓 | **Obsidian 笔记** | 用 Obsidian 打开项目目录 |

</div>

### 第三步：开始学习

```
你: 生成 Day 1
AI: 📅 Day 1：学习路线总览 + 工具链搭建
    🧭 今日方向: ...
    🎯 生活比喻: ...
    📋 今日三件事: ...
    💻 代码区: ...
```

---

## 📖 课程大纲

<div align="center">

> 💡 **提示**：点击展开查看每周详细内容，点击文件链接直接跳转到对应文档

</div>

### Phase 0: 预备周

<details>
<summary><b>🔧 Week 0 — 环境搭建 + Python 速通</b> （7天）</summary>

<br/>

| Day | 主题 | 产出 | 文件 |
|:---:|------|------|:----:|
| 1 | 学习路线总览 + 工具链搭建 | Git + VS Code + Python | [📄](docs/week0/day1.md) |
| 2 | Claude Code / Codex CLI 上手 | 第一个 AI 脚本 | [📄](docs/week0/day2.md) |
| 3 | 项目仓库初始化 + CLAUDE.md | 项目骨架 | [📄](docs/week0/day3.md) |
| 4 | Obsidian 知识库搭建 | 笔记系统 | [📄](docs/week0/day4.md) |
| 5 | Python 速通（变量/函数/类/模块） | 50 行脚本 | [📄](docs/week0/day5.md) |
| 6 | Python 数据结构 + 类型提示 | Pydantic 基础 | [📄](docs/week0/day6.md) |
| 7 | 周复盘 + 环境检查清单 | ✅ 环境就绪 | [📄](docs/week0/day7.md) |

</details>

---

### Phase 1: 地基（Week 1-4）

<details>
<summary><b>🐍 Week 1 — Python 工程化 + HTTP 基础</b> （7天）</summary>

<br/>

| Day | 主题 | 产出 | 文件 |
|:---:|------|------|:----:|
| 1 | 虚拟环境 + 包管理 + 项目结构 | 标准化骨架 | [📄](docs/week1/day1.md) |
| 2 | HTTP 协议 + requests/httpx | 能调用 API | [📄](docs/week1/day2.md) |
| 3 | 大模型 API 最小调用（OpenAI/Anthropic） | 能调用 Claude | [📄](docs/week1/day3.md) |
| 4 | 异步编程 asyncio + 并发调用 | 异步 LLM 调用 | [📄](docs/week1/day4.md) |
| 5 | CLI 工具搭建（typer） | CLI 工具 | [📄](docs/week1/day5.md) |
| 6 | 日志系统 + 错误处理 + .env 管理 | 生产级处理 | [📄](docs/week1/day6.md) |
| 7 | 重构 + 测试 + 复盘 | ✅ **LLM CLI 工具** | [📄](docs/week1/day7.md) |

</details>

<details>
<summary><b>⚡ Week 2 — FastAPI 后端开发</b> （7天）</summary>

<br/>

| Day | 主题 | 产出 | 文件 |
|:---:|------|------|:----:|
| 1 | FastAPI 入门 + Pydantic v2 模型 | 第一个 API | [📄](docs/week2/day1.md) |
| 2 | 路由设计 + 请求验证 + 错误处理 | CRUD 接口 | [📄](docs/week2/day2.md) |
| 3 | 数据库 ORM（SQLAlchemy 2.0）+ CRUD | 数据持久化 | [📄](docs/week2/day3.md) |
| 4 | JWT 认证 + 中间件 | 安全 API | [📄](docs/week2/day4.md) |
| 5 | WebSocket 实时通信 | 流式响应 | [📄](docs/week2/day5.md) |
| 6 | 结构化输出：JSON Mode + Pydantic Schema | LLM 输出 | [📄](docs/week2/day6.md) |
| 7 | 测试 + 复盘 | ✅ **Agent 后端骨架** | [📄](docs/week2/day7.md) |

</details>

<details>
<summary><b>🧠 Week 3 — LLM 原理与应用基础</b> （7天）</summary>

<br/>

| Day | 主题 | 产出 | 文件 |
|:---:|------|------|:----:|
| 1 | NLP 基础 + 文本表示演进 | Token/Embedding | [📄](docs/week3/day1.md) |
| 2 | Transformer 架构：自注意力机制（概念级） | Attention 理解 | [📄](docs/week3/day2.md) |
| 3 | 大模型概览：GPT/Claude/LLaMA 架构对比 | LLM 理解 | [📄](docs/week3/day3.md) |
| 4 | 提示工程：Few-shot / CoT / 结构化输出 | 有效 Prompt | [📄](docs/week3/day4.md) |
| 5 | "When NOT to build agents" 判断框架 | 决策能力 | [📄](docs/week3/day5.md) |
| 6 | LLM API 工程实践：流式调用 + Token 管理 | 生产级调用 | [📄](docs/week3/day6.md) |
| 7 | 复盘 | ✅ **最佳实践笔记** | [📄](docs/week3/day7.md) |

</details>

<details>
<summary><b>🤖 Week 4 — Agent 经典范式</b> （7天）</summary>

<br/>

| Day | 主题 | 产出 | 文件 |
|:---:|------|------|:----:|
| 1 | 智能体定义、类型、发展史 | Agent 本质 | [📄](docs/week4/day1.md) |
| 2 | ReAct 范式：推理 + 行动交替 | ReAct Agent | [📄](docs/week4/day2.md) |
| 3 | Plan-and-Solve 范式 | 规划型 Agent | [📄](docs/week4/day3.md) |
| 4 | Reflection 范式：自我反思 | 自省型 Agent | [📄](docs/week4/day4.md) |
| 5 | Metacognition 范式：元认知 | 元认知 Agent | [📄](docs/week4/day5.md) |
| 6 | 五种 Agent 工作流模式 | Chaining 等 | [📄](docs/week4/day6.md) |
| 7 | 复盘 | ✅ **范式对比报告** | [📄](docs/week4/day7.md) |

</details>

---

### Phase 2: 核心能力（Week 5-9）

<details>
<summary><b>📚 Week 5 — RAG 检索增强</b> （7天）</summary>

<br/>

| Day | 主题 | 产出 | 文件 |
|:---:|------|------|:----:|
| 1 | RAG 原理 + 架构概览 | RAG 理解 | [📄](docs/week5/day1.md) |
| 2 | 向量数据库（Chroma）+ Embedding 模型 | 向量检索 | [📄](docs/week5/day2.md) |
| 3 | 文档加载 + 分块策略 + 向量索引 | 文档处理 | [📄](docs/week5/day3.md) |
| 4 | 混合检索：向量 + BM25 + Reranking | 多策略检索 | [📄](docs/week5/day4.md) |
| 5 | Query 改写 + 上下文注入 + Redis 缓存 | 检索优化 | [📄](docs/week5/day5.md) |
| 6 | RAG 评估：忠实度、相关性、召回率 | 质量量化 | [📄](docs/week5/day6.md) |
| 7 | Agentic RAG：Agent + RAG 融合 | ✅ **RAG 检索服务** | [📄](docs/week5/day7.md) |

</details>

<details>
<summary><b>🛡️ Week 6 — Agent 框架 + 安全</b> （7天）</summary>

<br/>

| Day | 主题 | 产出 | 文件 |
|:---:|------|------|:----:|
| 1 | Function Calling / Tool Use 原理与实现 | 工具调用 | [📄](docs/week6/day1.md) |
| 2 | LangChain 核心概念 + 链式调用 | Chain 理解 | [📄](docs/week6/day2.md) |
| 3 | LangGraph 状态机：节点 + 边 + 条件路由 | 状态图 | [📄](docs/week6/day3.md) |
| 4 | Agent 安全：Prompt Injection 防御 | 安全理解 | [📄](docs/week6/day4.md) |
| 5 | Guardrails：输入/输出验证层 | 安全验证 | [📄](docs/week6/day5.md) |
| 6 | 人机协作：Human-in-the-Loop 模式 | 审批工作流 | [📄](docs/week6/day6.md) |
| 7 | 复盘 | ✅ **安全 Agent Demo** | [📄](docs/week6/day7.md) |

</details>

<details>
<summary><b>💾 Week 7 — 上下文工程 + 记忆系统</b> （7天）</summary>

<br/>

| Day | 主题 | 产出 | 文件 |
|:---:|------|------|:----:|
| 1 | 上下文工程：窗口管理 + 摘要压缩 | 窗口管理 | [📄](docs/week7/day1.md) |
| 2 | 记忆架构：Core/Archival/Recall 三层模型 | 记忆架构 | [📄](docs/week7/day2.md) |
| 3 | 记忆实现：对话缓冲 + 实体记忆 + 向量记忆 | 多种记忆 | [📄](docs/week7/day3.md) |
| 4 | Agent Persona 设计：System Prompt + 行为一致性 | 人格设计 | [📄](docs/week7/day4.md) |
| 5 | LangGraph 完整工作流整合 | 完整工作流 | [📄](docs/week7/day5.md) |
| 6 | 错误处理 + 重试 + 优雅降级 | 生产级 Agent | [📄](docs/week7/day6.md) |
| 7 | 复盘 | ✅ **有记忆的 Agent** | [📄](docs/week7/day7.md) |

</details>

<details>
<summary><b>🔗 Week 8 — 通信协议与多 Agent 协作</b> （7天）</summary>

<br/>

| Day | 主题 | 产出 | 文件 |
|:---:|------|------|:----:|
| 1 | MCP（Model Context Protocol）原理与实现 | MCP Server | [📄](docs/week8/day1.md) |
| 2 | A2A + NLWeb 协议：三大协议 | 协议理解 | [📄](docs/week8/day2.md) |
| 3 | 多 Agent 架构设计：主从 / 对等 / 分层 | 架构设计 | [📄](docs/week8/day3.md) |
| 4 | Handoff 模式：结构化任务委派 | 任务委派 | [📄](docs/week8/day4.md) |
| 5 | CrewAI：角色驱动的多 Agent 编排 | 角色编排 | [📄](docs/week8/day5.md) |
| 6 | 构建多 Agent 协作 Demo | 协作系统 | [📄](docs/week8/day6.md) |
| 7 | 复盘 | ✅ **MCP + 多 Agent** | [📄](docs/week8/day7.md) |

</details>

<details>
<summary><b>🏗️ Week 9 — 项目实战入门</b> （7天）</summary>

<br/>

| Day | 主题 | 产出 | 文件 |
|:---:|------|------|:----:|
| 1 | 项目选型 + 技术方案设计 | 设计文档 | [📄](docs/week9/day1.md) |
| 2 | 后端骨架搭建 | FastAPI + DB | [📄](docs/week9/day2.md) |
| 3 | RAG 检索服务集成 | 检索服务 | [📄](docs/week9/day3.md) |
| 4 | Agent 核心逻辑 | LangGraph | [📄](docs/week9/day4.md) |
| 5 | 安全层集成 | Guardrails | [📄](docs/week9/day5.md) |
| 6 | 端到端联调 | 流程跑通 | [📄](docs/week9/day6.md) |
| 7 | 复盘 | ✅ **项目 MVP** | [📄](docs/week9/day7.md) |

</details>

---

### Phase 3: 进阶专精（Week 10-13）

<details>
<summary><b>🧬 Week 10 — Agentic RL 基础</b> （7天）</summary>

<br/>

| Day | 主题 | 产出 | 文件 |
|:---:|------|------|:----:|
| 1 | 从 SFT 到 RLHF：大模型训练全景 | 训练理解 | [📄](docs/week10/day1.md) |
| 2 | LoRA / QLoRA 高效微调原理 | 微调理解 | [📄](docs/week10/day2.md) |
| 3 | DPO / GRPO 偏好对齐算法 | 对齐理解 | [📄](docs/week10/day3.md) |
| 4 | Agent 训练数据构造 + 奖励模型设计 | 数据构造 | [📄](docs/week10/day4.md) |
| 5 | 动手微调一个小模型（可选） | 微调实验 | [📄](docs/week10/day5.md) |
| 6 | 评测微调效果 + 对比分析 | 对比分析 | [📄](docs/week10/day6.md) |
| 7 | 复盘 | ✅ **微调实验报告** | [📄](docs/week10/day7.md) |

</details>

<details>
<summary><b>📊 Week 11 — 智能体评估与可观测性</b> （7天）</summary>

<br/>

| Day | 主题 | 产出 | 文件 |
|:---:|------|------|:----:|
| 1 | Agent 评估框架：核心指标与基准测试 | 评估理解 | [📄](docs/week11/day1.md) |
| 2 | 行业基准：SWE-bench / HumanEval / GAIA | 基准了解 | [📄](docs/week11/day2.md) |
| 3 | 自动化评估 Pipeline 设计 | 评估流水线 | [📄](docs/week11/day3.md) |
| 4 | 可观测性三支柱：Traces / Metrics / Logs | 可观测实现 | [📄](docs/week11/day4.md) |
| 5 | LangSmith / Arize Phoenix 实践 | 工具使用 | [📄](docs/week11/day5.md) |
| 6 | 评估驱动的迭代优化 | 优化能力 | [📄](docs/week11/day6.md) |
| 7 | 复盘 | ✅ **评估报告** | [📄](docs/week11/day7.md) |

</details>

<details>
<summary><b>🚀 Week 12 — 生产部署</b> （7天）</summary>

<br/>

| Day | 主题 | 产出 | 文件 |
|:---:|------|------|:----:|
| 1 | Docker 容器化 + Docker Compose 编排 | 容器化 | [📄](docs/week12/day1.md) |
| 2 | CI/CD 流水线：GitHub Actions | 自动化部署 | [📄](docs/week12/day2.md) |
| 3 | 模型 Fallback：多供应商切换 | 高可用 | [📄](docs/week12/day3.md) |
| 4 | 成本优化：Token 计数 + 模型路由 | 成本控制 | [📄](docs/week12/day4.md) |
| 5 | 限流/熔断/重试 | 高韧性 | [📄](docs/week12/day5.md) |
| 6 | 监控告警 + 日志聚合 | 生产级监控 | [📄](docs/week12/day6.md) |
| 7 | 复盘 | ✅ **可部署的 Agent** | [📄](docs/week12/day7.md) |

</details>

<details>
<summary><b>🔍 Week 13 — 深度技术探索（选修）</b> （7天）</summary>

<br/>

| Day | 方向 | 内容 | 文件 |
|:---:|:----:|------|:----:|
| 1 | A | 从零搭建 LLM（LLaMA2 + Tokenizer） | [📄](docs/week13/day1.md) |
| 2 | B | 从零构建 Agent 框架 | [📄](docs/week13/day2.md) |
| 3 | C | 多模态 Agent（Vision + OCR + 语音） | [📄](docs/week13/day3.md) |
| 4 | D | GUI/Web Agent（浏览器自动化） | [📄](docs/week13/day4.md) |
| 5 | E | Agent 自进化 | [📄](docs/week13/day5.md) |
| 6 | F | 真实世界案例分析（Replit/Cursor/Devin） | [📄](docs/week13/day6.md) |
| 7 | G-I | Agent辩论 / 本地Agent / DevOps | [📄](docs/week13/day7.md) |

</details>

---

### Phase 4: 综合项目（Week 14-17）

<details>
<summary><b>🏗️ Week 14-17 — 项目实战（3 选 1）</b> （28天）</summary>

<br/>

| 周 | 主题 | 文件 |
|:--:|------|:----:|
| 14 | 项目实战第 1 周 | [📄](docs/week14/day1-7.md) |
| 15 | 项目实战第 2 周 | [📄](docs/week15/day1-7.md) |
| 16 | 项目实战第 3 周 | [📄](docs/week16/day1-7.md) |
| 17 | 项目实战第 4 周 | [📄](docs/week17/day1-7.md) |

**可选项目：**

| 项目 | 技术栈 | 面试价值 |
|------|--------|:--------:|
| ⭐ **AI-Interview** | FastAPI + RAG + LangGraph + Guardrails | ⭐⭐⭐⭐⭐ |
| **DeepResearch** | 多 Agent + 搜索 + Handoff | ⭐⭐⭐⭐ |
| **旅行助手** | MCP + CrewAI + 外部 API | ⭐⭐⭐⭐ |

</details>

---

### Phase 5: 毕业冲刺（Week 18-20）

<details>
<summary><b>🎓 Week 18-20 — 项目打磨 + 简历 + 模拟面试</b> （21天）</summary>

<br/>

| 周 | 主题 | 文件 |
|:--:|------|:----:|
| 18 | 项目打磨：Bug 修复 + 性能优化 + README | [📄](docs/week18/day1-7.md) |
| 19 | 演示准备：Demo + 代码走读 + 简历话术 | [📄](docs/week19/day1-7.md) |
| 20 | 面试冲刺：模拟面试 + 查漏补缺 | [📄](docs/week20/day1-7.md) |

</details>

---

## 📁 项目结构

```
agent-factory/
├── skill/                    # AI Skill 定义
│   ├── SKILL.md              # 核心 Skill 文件
│   └── references/           # 参考模板（5个）
├── docs/                     # 20 周教程文档
│   ├── week0/                # Day 1-7
│   ├── week1/                # Day 1-7
│   ├── ...
│   └── week20/               # Day 1-7
├── code/                     # 代码示例（学习时填充）
├── knowledge-base/           # Obsidian 知识库（学习时填充）
└── assessments/              # 评估题库
```

---

## 📚 来源致谢

<div align="center">

本项目融合了以下优秀开源项目的内容与设计理念：

</div>

| 项目 | 社区 | Stars | 许可证 |
|------|------|:-----:|--------|
| [ai-agent-daily-mentor](https://github.com/Marcos-wu/ai-agent-daily-mentor) | Marcos-wu | 72 | MIT |
| [hello-agents](https://github.com/datawhalechina/hello-agents) | Datawhale | 58.3k | CC BY-NC-SA 4.0 |
| [happy-llm](https://github.com/datawhalechina/happy-llm) | Datawhale | 31.1k | CC BY-NC-SA 4.0 |
| [Microsoft AI Agents](https://github.com/microsoft/ai-agents-for-beginners) | Microsoft | 66.9k | MIT |
| [OpenAI Agents SDK](https://github.com/openai/openai-agents-python) | OpenAI | 14.8k | Apache-2.0 |
| [Letta/MemGPT](https://github.com/letta-ai/letta) | Letta AI | - | Apache-2.0 |
| [CrewAI](https://github.com/joaomdmoura/crewAI) | CrewAI | - | MIT |
| [Guardrails AI](https://github.com/guardrails-ai/guardrails) | Guardrails AI | - | Apache-2.0 |
| [ShareAI](https://learn.shareai.run/zh/) | ShareAI | - | - |
| [Anthropic](https://docs.anthropic.com/en/docs/claude-code) | Anthropic | - | - |

---

## 🤝 如何贡献

<div align="center">

我们欢迎以下形式的贡献：

</div>

| 类型 | 说明 |
|:----:|------|
| 🐛 | **报告 Bug** — 发现问题请提交 Issue |
| 💡 | **提出建议** — 功能改进或内容补充 |
| 📝 | **完善内容** — 补充代码示例或学习笔记 |
| ✍️ | **分享实践** — 分享你的学习心得 |

---

## 🙏 致谢

<div align="center">

感谢所有为本项目提供灵感和内容的开源社区。

特别感谢 [Datawhale](https://github.com/datawhalechina) 社区。

<br/>

<a href="https://github.com/ahouyun/agent-factory/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ahouyun/agent-factory" />
</a>

</div>

---

## 🎓 引用

如果你在论文或项目中使用了本课程，可以通过以下 BibTeX 引用：

```bibtex
@misc{agent_factory2026,
  title  = {Agent Factory: 从零到精通的 AI Agent 系统学习课程},
  author = {ahouyun},
  year   = {2026},
  url    = {https://github.com/ahouyun/agent-factory},
  note   = {GitHub repository}
}
```

---

## 📜 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

引用的 CC BY-NC-SA 4.0 内容已注明出处。

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！⭐**

*你的 Star 是我们持续更新的动力！*

</div>
