<div align="center">

# 🤖 Agent Factory

### 从零到精通的 AI Agent 系统学习课程

*融合 10 个优秀开源项目，20 周掌握 AI Agent 开发*

<br/>

[![GitHub stars](https://img.shields.io/github/stars/ahouyun/agent-factory?style=flat&logo=github)](https://github.com/ahouyun/agent-factory/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ahouyun/agent-factory?style=flat&logo=github)](https://github.com/ahouyun/agent-factory/network/members)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat)](LICENSE)
[![Language](https://img.shields.io/badge/language-中文-brightgreen?style=flat)]()
[![Weeks](https://img.shields.io/badge/学习周期-20周-orange?style=flat)]()

</div>

---

## 🎯 项目介绍

**Agent Factory** 是一套系统性的 AI Agent 学习课程，专为零基础学习者设计。课程融合了 **ai-agent-daily-mentor**、**hello-agents**、**happy-llm**、**Microsoft AI Agents**、**OpenAI Agents SDK** 等 10 个优秀开源项目的精华，经过去重和优化后，形成了一套完整的 20 周学习路径。

&emsp;最终目标：**学完后你能独立完成一个可展示、可面试的 Agent 项目。**

---

## ✨ 你将收获什么？

| 阶段 | 收获 |
|------|------|
| 🐍 **Phase 1** (Week 1-4) | Python 工程化 + FastAPI + LLM API 调用 |
| 🤖 **Phase 2** (Week 5-9) | Agent 范式 + RAG + 安全 + 记忆 + 多 Agent |
| 🔬 **Phase 3** (Week 10-13) | Agentic RL + 评估 + 生产部署 |
| 🏗️ **Phase 4** (Week 14-17) | 完整 Agent 项目（面试用） |
| 🎓 **Phase 5** (Week 18-20) | 简历话术 + 模拟面试 |

---

## 📖 课程大纲

### Phase 0: 预备周

<details>
<summary><b>Week 0 — 环境搭建 + Python 速通</b></summary>

| Day | 主题 | 产出 |
|-----|------|------|
| Day 1 | 学习路线总览 + 工具链搭建 | Git + VS Code + Python |
| Day 2 | Claude Code / Codex CLI 上手 | 第一个 AI 脚本 |
| Day 3 | 项目仓库初始化 + CLAUDE.md | 项目骨架 |
| Day 4 | Obsidian 知识库搭建 | 笔记系统 |
| Day 5 | Python 速通（变量/函数/类/模块） | 50 行脚本 |
| Day 6 | Python 数据结构 + 类型提示 | Pydantic 基础 |
| Day 7 | 周复盘 + 环境检查清单 | ✅ 环境就绪 |

</details>

---

### Phase 1: 地基（Week 1-4）

<details>
<summary><b>Week 1 — Python 工程化 + HTTP 基础</b> <a href="docs/phase1/week1-python-http/README.md">📖 查看详情</a></summary>

| Day | 主题 | 产出 |
|-----|------|------|
| Day 1 | 虚拟环境 + 包管理 + 项目结构 | 标准化骨架 |
| Day 2 | HTTP 协议 + requests/httpx | 能调用 API |
| Day 3 | 大模型 API 最小调用（OpenAI/Anthropic） | 能调用 Claude |
| Day 4 | 异步编程 asyncio + 并发调用 | 异步 LLM 调用 |
| Day 5 | CLI 工具搭建（typer） | CLI 工具 |
| Day 6 | 日志系统 + 错误处理 + .env 管理 | 生产级处理 |
| Day 7 | 重构 + 测试 + 复盘 | ✅ **LLM CLI 工具** |

</details>

<details>
<summary><b>Week 2 — FastAPI 后端开发</b> <a href="docs/phase1/week2-fastapi/README.md">📖 查看详情</a></summary>

| Day | 主题 | 产出 |
|-----|------|------|
| Day 1 | FastAPI 入门 + Pydantic v2 模型 | 第一个 API |
| Day 2 | 路由设计 + 请求验证 + 错误处理 | CRUD 接口 |
| Day 3 | 数据库 ORM（SQLAlchemy 2.0）+ CRUD | 数据持久化 |
| Day 4 | JWT 认证 + 中间件 | 安全 API |
| Day 5 | WebSocket 实时通信 | 流式响应 |
| Day 6 | 结构化输出：JSON Mode + Pydantic Schema | LLM 输出 |
| Day 7 | 测试 + 复盘 | ✅ **Agent 后端骨架** |

</details>

<details>
<summary><b>Week 3 — LLM 原理与应用基础</b> <a href="docs/phase1/week3-llm-basics/README.md">📖 查看详情</a></summary>

| Day | 主题 | 产出 |
|-----|------|------|
| Day 1 | NLP 基础 + 文本表示演进 | Token/Embedding |
| Day 2 | Transformer 架构：自注意力机制（概念级） | Attention 理解 |
| Day 3 | 大模型概览：GPT/Claude/LLaMA 架构对比 | LLM 理解 |
| Day 4 | 提示工程：Few-shot / CoT / 结构化输出 | 有效 Prompt |
| Day 5 | "When NOT to build agents" 判断框架 | 决策能力 |
| Day 6 | LLM API 工程实践：流式调用 + Token 管理 | 生产级调用 |
| Day 7 | 复盘 | ✅ **最佳实践笔记** |

</details>

<details>
<summary><b>Week 4 — Agent 经典范式</b> <a href="docs/phase1/week4-agent-paradigms/README.md">📖 查看详情</a></summary>

| Day | 主题 | 产出 |
|-----|------|------|
| Day 1 | 智能体定义、类型、发展史 | Agent 本质 |
| Day 2 | ReAct 范式：推理 + 行动交替 | ReAct Agent |
| Day 3 | Plan-and-Solve 范式 | 规划型 Agent |
| Day 4 | Reflection 范式：自我反思 | 自省型 Agent |
| Day 5 | Metacognition 范式：元认知 | 元认知 Agent |
| Day 6 | 五种 Agent 工作流模式 | Chaining 等 |
| Day 7 | 复盘 | ✅ **范式对比报告** |

</details>

---

### Phase 2: 核心能力（Week 5-9）

<details>
<summary><b>Week 5 — RAG 检索增强</b> <a href="docs/phase2/week5-rag/README.md">📖 查看详情</a></summary>

| Day | 主题 | 产出 |
|-----|------|------|
| Day 1 | RAG 原理 + 架构概览 | RAG 理解 |
| Day 2 | 向量数据库（Chroma）+ Embedding 模型 | 向量检索 |
| Day 3 | 文档加载 + 分块策略 + 向量索引 | 文档处理 |
| Day 4 | 混合检索：向量 + BM25 + Reranking | 多策略检索 |
| Day 5 | Query 改写 + 上下文注入 + Redis 缓存 | 检索优化 |
| Day 6 | RAG 评估：忠实度、相关性、召回率 | 质量量化 |
| Day 7 | Agentic RAG：Agent + RAG 融合 | ✅ **RAG 检索服务** |

</details>

<details>
<summary><b>Week 6 — Agent 框架 + 安全</b> <a href="docs/phase2/week6-agent-frameworks-safety/README.md">📖 查看详情</a></summary>

| Day | 主题 | 产出 |
|-----|------|------|
| Day 1 | Function Calling / Tool Use 原理与实现 | 工具调用 |
| Day 2 | LangChain 核心概念 + 链式调用 | Chain 理解 |
| Day 3 | LangGraph 状态机：节点 + 边 + 条件路由 | 状态图 |
| Day 4 | Agent 安全：Prompt Injection 防御 | 安全理解 |
| Day 5 | Guardrails：输入/输出验证层 | 安全验证 |
| Day 6 | 人机协作：Human-in-the-Loop 模式 | 审批工作流 |
| Day 7 | 复盘 | ✅ **安全 Agent Demo** |

</details>

<details>
<summary><b>Week 7 — 上下文工程 + 记忆系统</b> <a href="docs/phase2/week7-context-memory/README.md">📖 查看详情</a></summary>

| Day | 主题 | 产出 |
|-----|------|------|
| Day 1 | 上下文工程：窗口管理 + 摘要压缩 | 窗口管理 |
| Day 2 | 记忆架构：Core/Archival/Recall 三层模型 | 记忆架构 |
| Day 3 | 记忆实现：对话缓冲 + 实体记忆 + 向量记忆 | 多种记忆 |
| Day 4 | Agent Persona 设计：System Prompt + 行为一致性 | 人格设计 |
| Day 5 | LangGraph 完整工作流整合 | 完整工作流 |
| Day 6 | 错误处理 + 重试 + 优雅降级 | 生产级 Agent |
| Day 7 | 复盘 | ✅ **有记忆的 Agent** |

</details>

<details>
<summary><b>Week 8 — 通信协议与多 Agent 协作</b> <a href="docs/phase2/week8-communication-protocols/README.md">📖 查看详情</a></summary>

| Day | 主题 | 产出 |
|-----|------|------|
| Day 1 | MCP（Model Context Protocol）原理与实现 | MCP Server |
| Day 2 | A2A + NLWeb 协议：三大协议 | 协议理解 |
| Day 3 | 多 Agent 架构设计：主从 / 对等 / 分层 | 架构设计 |
| Day 4 | Handoff 模式：结构化任务委派 | 任务委派 |
| Day 5 | CrewAI：角色驱动的多 Agent 编排 | 角色编排 |
| Day 6 | 构建多 Agent 协作 Demo | 协作系统 |
| Day 7 | 复盘 | ✅ **MCP + 多 Agent** |

</details>

<details>
<summary><b>Week 9 — 项目实战入门</b> <a href="docs/phase2/week9-project-intro/README.md">📖 查看详情</a></summary>

| Day | 主题 | 产出 |
|-----|------|------|
| Day 1 | 项目选型 + 技术方案设计 | 设计文档 |
| Day 2 | 后端骨架搭建 | FastAPI + DB |
| Day 3 | RAG 检索服务集成 | 检索服务 |
| Day 4 | Agent 核心逻辑 | LangGraph |
| Day 5 | 安全层集成 | Guardrails |
| Day 6 | 端到端联调 | 流程跑通 |
| Day 7 | 复盘 | ✅ **项目 MVP** |

</details>

---

### Phase 3: 进阶专精（Week 10-13）

<details>
<summary><b>Week 10 — Agentic RL 基础</b> <a href="docs/phase3/week10-agentic-rl/README.md">📖 查看详情</a></summary>

| Day | 主题 | 产出 |
|-----|------|------|
| Day 1 | 从 SFT 到 RLHF：大模型训练全景 | 训练理解 |
| Day 2 | LoRA / QLoRA 高效微调原理 | 微调理解 |
| Day 3 | DPO / GRPO 偏好对齐算法 | 对齐理解 |
| Day 4 | Agent 训练数据构造 + 奖励模型设计 | 数据构造 |
| Day 5 | 动手微调一个小模型（可选） | 微调实验 |
| Day 6 | 评测微调效果 + 对比分析 | 对比分析 |
| Day 7 | 复盘 | ✅ **微调实验报告** |

</details>

<details>
<summary><b>Week 11 — 智能体评估与可观测性</b> <a href="docs/phase3/week11-evaluation-observability/README.md">📖 查看详情</a></summary>

| Day | 主题 | 产出 |
|-----|------|------|
| Day 1 | Agent 评估框架：核心指标与基准测试 | 评估理解 |
| Day 2 | 行业基准：SWE-bench / HumanEval / GAIA | 基准了解 |
| Day 3 | 自动化评估 Pipeline 设计 | 评估流水线 |
| Day 4 | 可观测性三支柱：Traces / Metrics / Logs | 可观测实现 |
| Day 5 | LangSmith / Arize Phoenix 实践 | 工具使用 |
| Day 6 | 评估驱动的迭代优化 | 优化能力 |
| Day 7 | 复盘 | ✅ **评估报告** |

</details>

<details>
<summary><b>Week 12 — 生产部署</b> <a href="docs/phase3/week12-production-deployment/README.md">📖 查看详情</a></summary>

| Day | 主题 | 产出 |
|-----|------|------|
| Day 1 | Docker 容器化 + Docker Compose 编排 | 容器化 |
| Day 2 | CI/CD 流水线：GitHub Actions | 自动化部署 |
| Day 3 | 模型 Fallback：多供应商切换 | 高可用 |
| Day 4 | 成本优化：Token 计数 + 模型路由 | 成本控制 |
| Day 5 | 限流/熔断/重试：Resilience4j 模式 | 高韧性 |
| Day 6 | 监控告警 + 日志聚合 | 生产级监控 |
| Day 7 | 复盘 | ✅ **可部署的 Agent** |

</details>

<details>
<summary><b>Week 13 — 深度技术探索（选修）</b> <a href="docs/phase3/week13-deep-dive/README.md">📖 查看详情</a></summary>

**9 个选修方向（选 2-3 个）：**

| 方向 | 内容 |
|------|------|
| A. 从零搭建 LLM | LLaMA2 实现 + Tokenizer 训练 + Transformer 代码实现 |
| B. 从零构建 Agent 框架 | 自研轻量 Agent 框架 |
| C. 多模态 Agent | Vision API + 图像理解 + 文档 OCR + 语音 Agent |
| D. GUI/Web Agent | 浏览器自动化 + Computer Use API |
| E. Agent 自进化 | 自我学习与能力提升 |
| F. 真实世界案例分析 | Replit / Cursor / Devin 等 Agent 架构解析 |
| G. Agent 辩论系统 | 多 Agent 从不同视角讨论问题 |
| H. 本地 Agent | 不依赖云 API，用 Ollama/llama.cpp 本地运行 |
| I. DevOps Agent | 监控基础设施、自动创建工单 |

</details>

---

### Phase 4: 综合项目（Week 14-17）

选择 **1-2 个项目**完成：

<details>
<summary><b>⭐ 项目一：AI-Interview 智能模拟面试系统（推荐首选）</b> <a href="docs/phase4/project-ai-interview/README.md">📖 查看详情</a></summary>

- **技术栈**: FastAPI + RAG + LangGraph + Function Calling + WebSocket + Guardrails
- **亮点**: 简历解析 → 岗位匹配 → 题库检索 → AI 面试 → 评分报告
- **项目规模**: 约 3000-5000 行代码

| 周 | 任务 |
|----|------|
| W14 | 后端骨架 + RAG 检索服务 |
| W15 | LangGraph 工作流 + Agent 安全层 |
| W16 | WebSocket 实时通信 + 人机协作 |
| W17 | 测试 + 优化 + 文档 |

**面试价值**: ⭐⭐⭐⭐⭐

</details>

<details>
<summary><b>项目二：DeepResearch 深度研究 Agent</b> <a href="docs/phase4/project-deep-research/README.md">📖 查看详情</a></summary>

- **技术栈**: 多 Agent 协作 + 搜索引擎 + 长文档处理 + Handoff
- **亮点**: 自动规划研究路径 → 多源检索 → 交叉验证 → 生成研究报告
- **项目规模**: 约 2000-3000 行代码

**面试价值**: ⭐⭐⭐⭐

</details>

<details>
<summary><b>项目三：多智能体旅行助手</b> <a href="docs/phase4/project-travel-agent/README.md">📖 查看详情</a></summary>

- **技术栈**: MCP + CrewAI + 外部 API 集成
- **亮点**: 行程规划 Agent + 订票 Agent + 推荐 Agent 协作
- **项目规模**: 约 2000-3000 行代码

**面试价值**: ⭐⭐⭐⭐

</details>

---

### Phase 5: 毕业冲刺（Week 18-20）

<details>
<summary><b>Week 18-20 — 项目打磨 + 简历 + 模拟面试</b> <a href="docs/phase5/week18-20-graduation.md">📖 查看详情</a></summary>

| 周 | 主题 |
|----|------|
| W18 | 项目打磨：Bug 修复 + 性能优化 + README + 技术博客 |
| W19 | 演示准备：Demo 演示 + 代码走读 + 简历话术四大象限 |
| W20 | 面试冲刺：模拟面试 + 查漏补缺 + 长期学习路线 |

</details>

---

## 🚀 如何使用

### 方式 1：AI 助手模式（推荐）

1. 克隆仓库
```bash
git clone https://github.com/ahouyun/agent-factory.git
cd agent-factory
```

2. 打开 Obsidian，选择 `agent-factory` 目录作为 vault

3. 在 Claude Code 中加载 `skill/SKILL.md`

4. 开始学习
```
你: 生成 Day 1
AI: 📅 Day 1：学习路线总览 + 工具链搭建
    ...
```

### 方式 2：直接阅读

直接打开 `docs/` 目录下的 Markdown 文件阅读。

---

## 📚 来源致谢

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

- 🐛 **报告 Bug** — 发现问题请提交 Issue
- 💡 **提出建议** — 功能改进或内容补充
- 📝 **完善内容** — 补充代码示例或学习笔记
- ✍️ **分享实践** — 分享你的学习心得

---

## 📜 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。引用的 CC BY-NC-SA 4.0 内容已注明出处。
