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

## 📚 如何学习

### 第一步：环境准备

```bash
# 1. 克隆仓库
git clone https://github.com/ahouyun/agent-factory.git
cd agent-factory

# 2. 安装 Python 3.10+
# 3. 安装 Claude Code（可选）
npm install -g @anthropic-ai/claude-code
```

### 第二步：选择学习方式

| 方式 | 适合人群 | 说明 |
|------|---------|------|
| 🤖 **AI 助手模式** | 想要互动学习的人 | 加载 SKILL.md，每天生成任务 |
| 📖 **直接阅读** | 喜欢自学的人 | 直接打开 `docs/week{N}/day{M}.md` |
| 📓 **Obsidian 笔记** | 喜欢做笔记的人 | 用 Obsidian 打开项目目录 |

### 第三步：开始学习

```
# AI 助手模式
你: 生成 Day 1
AI: 📅 Day 1：学习路线总览 + 工具链搭建
    🧭 今日方向: ...
    🎯 生活比喻: ...
    📋 今日三件事: ...
    💻 代码区: ...
```

### 第四步：跟踪进度

每天学完后填写反馈：

```
- 今日完成度: 全部完成 / 部分完成 / 卡住了
- 卡点描述: （具体问题）
- 代码是否能跑通: 是 / 否
- 明天希望: 继续推进 / 复习巩固 / 加难挑战
```

---

## 📖 课程大纲

### Phase 0: 预备周

<details>
<summary><b>Week 0 — 环境搭建 + Python 速通</b></summary>

| Day | 主题 | 文件 |
|-----|------|------|
| Day 1 | 学习路线总览 + 工具链搭建 | [day1.md](docs/week0/day1.md) |
| Day 2 | Claude Code / Codex CLI 上手 | [day2.md](docs/week0/day2.md) |
| Day 3 | 项目仓库初始化 + CLAUDE.md | [day3.md](docs/week0/day3.md) |
| Day 4 | Obsidian 知识库搭建 | [day4.md](docs/week0/day4.md) |
| Day 5 | Python 速通（变量/函数/类/模块） | [day5.md](docs/week0/day5.md) |
| Day 6 | Python 数据结构 + 类型提示 | [day6.md](docs/week0/day6.md) |
| Day 7 | 周复盘 + 环境检查清单 | [day7.md](docs/week0/day7.md) |

</details>

---

### Phase 1: 地基（Week 1-4）

<details>
<summary><b>Week 1 — Python 工程化 + HTTP 基础</b></summary>

| Day | 主题 | 文件 |
|-----|------|------|
| Day 1 | 虚拟环境 + 包管理 + 项目结构 | [day1.md](docs/week1/day1.md) |
| Day 2 | HTTP 协议 + requests/httpx | [day2.md](docs/week1/day2.md) |
| Day 3 | 大模型 API 最小调用（OpenAI/Anthropic） | [day3.md](docs/week1/day3.md) |
| Day 4 | 异步编程 asyncio + 并发调用 | [day4.md](docs/week1/day4.md) |
| Day 5 | CLI 工具搭建（typer） | [day5.md](docs/week1/day5.md) |
| Day 6 | 日志系统 + 错误处理 + .env 管理 | [day6.md](docs/week1/day6.md) |
| Day 7 | 重构 + 测试 + 复盘 | [day7.md](docs/week1/day7.md) |

</details>

<details>
<summary><b>Week 2 — FastAPI 后端开发</b></summary>

| Day | 主题 | 文件 |
|-----|------|------|
| Day 1 | FastAPI 入门 + Pydantic v2 模型 | [day1.md](docs/week2/day1.md) |
| Day 2 | 路由设计 + 请求验证 + 错误处理 | [day2.md](docs/week2/day2.md) |
| Day 3 | 数据库 ORM（SQLAlchemy 2.0）+ CRUD | [day3.md](docs/week2/day3.md) |
| Day 4 | JWT 认证 + 中间件 | [day4.md](docs/week2/day4.md) |
| Day 5 | WebSocket 实时通信 | [day5.md](docs/week2/day5.md) |
| Day 6 | 结构化输出：JSON Mode + Pydantic Schema | [day6.md](docs/week2/day6.md) |
| Day 7 | 测试 + 复盘 | [day7.md](docs/week2/day7.md) |

</details>

<details>
<summary><b>Week 3 — LLM 原理与应用基础</b></summary>

| Day | 主题 | 文件 |
|-----|------|------|
| Day 1 | NLP 基础 + 文本表示演进 | [day1.md](docs/week3/day1.md) |
| Day 2 | Transformer 架构：自注意力机制（概念级） | [day2.md](docs/week3/day2.md) |
| Day 3 | 大模型概览：GPT/Claude/LLaMA 架构对比 | [day3.md](docs/week3/day3.md) |
| Day 4 | 提示工程：Few-shot / CoT / 结构化输出 | [day4.md](docs/week3/day4.md) |
| Day 5 | "When NOT to build agents" 判断框架 | [day5.md](docs/week3/day5.md) |
| Day 6 | LLM API 工程实践：流式调用 + Token 管理 | [day6.md](docs/week3/day6.md) |
| Day 7 | 复盘 | [day7.md](docs/week3/day7.md) |

</details>

<details>
<summary><b>Week 4 — Agent 经典范式</b></summary>

| Day | 主题 | 文件 |
|-----|------|------|
| Day 1 | 智能体定义、类型、发展史 | [day1.md](docs/week4/day1.md) |
| Day 2 | ReAct 范式：推理 + 行动交替 | [day2.md](docs/week4/day2.md) |
| Day 3 | Plan-and-Solve 范式 | [day3.md](docs/week4/day3.md) |
| Day 4 | Reflection 范式：自我反思 | [day4.md](docs/week4/day4.md) |
| Day 5 | Metacognition 范式：元认知 | [day5.md](docs/week4/day5.md) |
| Day 6 | 五种 Agent 工作流模式 | [day6.md](docs/week4/day6.md) |
| Day 7 | 复盘 | [day7.md](docs/week4/day7.md) |

</details>

---

### Phase 2: 核心能力（Week 5-9）

<details>
<summary><b>Week 5 — RAG 检索增强</b></summary>

| Day | 主题 | 文件 |
|-----|------|------|
| Day 1 | RAG 原理 + 架构概览 | [day1.md](docs/week5/day1.md) |
| Day 2 | 向量数据库（Chroma）+ Embedding 模型 | [day2.md](docs/week5/day2.md) |
| Day 3 | 文档加载 + 分块策略 + 向量索引 | [day3.md](docs/week5/day3.md) |
| Day 4 | 混合检索：向量 + BM25 + Reranking | [day4.md](docs/week5/day4.md) |
| Day 5 | Query 改写 + 上下文注入 + Redis 缓存 | [day5.md](docs/week5/day5.md) |
| Day 6 | RAG 评估：忠实度、相关性、召回率 | [day6.md](docs/week5/day6.md) |
| Day 7 | Agentic RAG：Agent + RAG 融合 | [day7.md](docs/week5/day7.md) |

</details>

<details>
<summary><b>Week 6 — Agent 框架 + 安全</b></summary>

| Day | 主题 | 文件 |
|-----|------|------|
| Day 1 | Function Calling / Tool Use 原理与实现 | [day1.md](docs/week6/day1.md) |
| Day 2 | LangChain 核心概念 + 链式调用 | [day2.md](docs/week6/day2.md) |
| Day 3 | LangGraph 状态机：节点 + 边 + 条件路由 | [day3.md](docs/week6/day3.md) |
| Day 4 | Agent 安全：Prompt Injection 防御 | [day4.md](docs/week6/day4.md) |
| Day 5 | Guardrails：输入/输出验证层 | [day5.md](docs/week6/day5.md) |
| Day 6 | 人机协作：Human-in-the-Loop 模式 | [day6.md](docs/week6/day6.md) |
| Day 7 | 复盘 | [day7.md](docs/week6/day7.md) |

</details>

<details>
<summary><b>Week 7 — 上下文工程 + 记忆系统</b></summary>

| Day | 主题 | 文件 |
|-----|------|------|
| Day 1 | 上下文工程：窗口管理 + 摘要压缩 | [day1.md](docs/week7/day1.md) |
| Day 2 | 记忆架构：Core/Archival/Recall 三层模型 | [day2.md](docs/week7/day2.md) |
| Day 3 | 记忆实现：对话缓冲 + 实体记忆 + 向量记忆 | [day3.md](docs/week7/day3.md) |
| Day 4 | Agent Persona 设计：System Prompt + 行为一致性 | [day4.md](docs/week7/day4.md) |
| Day 5 | LangGraph 完整工作流整合 | [day5.md](docs/week7/day5.md) |
| Day 6 | 错误处理 + 重试 + 优雅降级 | [day6.md](docs/week7/day6.md) |
| Day 7 | 复盘 | [day7.md](docs/week7/day7.md) |

</details>

<details>
<summary><b>Week 8 — 通信协议与多 Agent 协作</b></summary>

| Day | 主题 | 文件 |
|-----|------|------|
| Day 1 | MCP（Model Context Protocol）原理与实现 | [day1.md](docs/week8/day1.md) |
| Day 2 | A2A + NLWeb 协议：三大协议 | [day2.md](docs/week8/day2.md) |
| Day 3 | 多 Agent 架构设计：主从 / 对等 / 分层 | [day3.md](docs/week8/day3.md) |
| Day 4 | Handoff 模式：结构化任务委派 | [day4.md](docs/week8/day4.md) |
| Day 5 | CrewAI：角色驱动的多 Agent 编排 | [day5.md](docs/week8/day5.md) |
| Day 6 | 构建多 Agent 协作 Demo | [day6.md](docs/week8/day6.md) |
| Day 7 | 复盘 | [day7.md](docs/week8/day7.md) |

</details>

<details>
<summary><b>Week 9 — 项目实战入门</b></summary>

| Day | 主题 | 文件 |
|-----|------|------|
| Day 1 | 项目选型 + 技术方案设计 | [day1.md](docs/week9/day1.md) |
| Day 2 | 后端骨架搭建 | [day2.md](docs/week9/day2.md) |
| Day 3 | RAG 检索服务集成 | [day3.md](docs/week9/day3.md) |
| Day 4 | Agent 核心逻辑 | [day4.md](docs/week9/day4.md) |
| Day 5 | 安全层集成 | [day5.md](docs/week9/day5.md) |
| Day 6 | 端到端联调 | [day6.md](docs/week9/day6.md) |
| Day 7 | 复盘 | [day7.md](docs/week9/day7.md) |

</details>

---

### Phase 3: 进阶专精（Week 10-13）

<details>
<summary><b>Week 10 — Agentic RL 基础</b></summary>

| Day | 主题 | 文件 |
|-----|------|------|
| Day 1 | 从 SFT 到 RLHF：大模型训练全景 | [day1.md](docs/week10/day1.md) |
| Day 2 | LoRA / QLoRA 高效微调原理 | [day2.md](docs/week10/day2.md) |
| Day 3 | DPO / GRPO 偏好对齐算法 | [day3.md](docs/week10/day3.md) |
| Day 4 | Agent 训练数据构造 + 奖励模型设计 | [day4.md](docs/week10/day4.md) |
| Day 5 | 动手微调一个小模型（可选） | [day5.md](docs/week10/day5.md) |
| Day 6 | 评测微调效果 + 对比分析 | [day6.md](docs/week10/day6.md) |
| Day 7 | 复盘 | [day7.md](docs/week10/day7.md) |

</details>

<details>
<summary><b>Week 11 — 智能体评估与可观测性</b></summary>

| Day | 主题 | 文件 |
|-----|------|------|
| Day 1 | Agent 评估框架：核心指标与基准测试 | [day1.md](docs/week11/day1.md) |
| Day 2 | 行业基准：SWE-bench / HumanEval / GAIA | [day2.md](docs/week11/day2.md) |
| Day 3 | 自动化评估 Pipeline 设计 | [day3.md](docs/week11/day3.md) |
| Day 4 | 可观测性三支柱：Traces / Metrics / Logs | [day4.md](docs/week11/day4.md) |
| Day 5 | LangSmith / Arize Phoenix 实践 | [day5.md](docs/week11/day5.md) |
| Day 6 | 评估驱动的迭代优化 | [day6.md](docs/week11/day6.md) |
| Day 7 | 复盘 | [day7.md](docs/week11/day7.md) |

</details>

<details>
<summary><b>Week 12 — 生产部署</b></summary>

| Day | 主题 | 文件 |
|-----|------|------|
| Day 1 | Docker 容器化 + Docker Compose 编排 | [day1.md](docs/week12/day1.md) |
| Day 2 | CI/CD 流水线：GitHub Actions | [day2.md](docs/week12/day2.md) |
| Day 3 | 模型 Fallback：多供应商切换 | [day3.md](docs/week12/day3.md) |
| Day 4 | 成本优化：Token 计数 + 模型路由 | [day4.md](docs/week12/day4.md) |
| Day 5 | 限流/熔断/重试 | [day5.md](docs/week12/day5.md) |
| Day 6 | 监控告警 + 日志聚合 | [day6.md](docs/week12/day6.md) |
| Day 7 | 复盘 | [day7.md](docs/week12/day7.md) |

</details>

<details>
<summary><b>Week 13 — 深度技术探索（选修）</b></summary>

| Day | 主题 | 文件 |
|-----|------|------|
| Day 1 | 方向A: 从零搭建 LLM | [day1.md](docs/week13/day1.md) |
| Day 2 | 方向B: 从零构建 Agent 框架 | [day2.md](docs/week13/day2.md) |
| Day 3 | 方向C: 多模态 Agent | [day3.md](docs/week13/day3.md) |
| Day 4 | 方向D: GUI/Web Agent | [day4.md](docs/week13/day4.md) |
| Day 5 | 方向E: Agent 自进化 | [day5.md](docs/week13/day5.md) |
| Day 6 | 方向F: 真实世界案例分析 | [day6.md](docs/week13/day6.md) |
| Day 7 | 方向G-I: Agent辩论/本地Agent/DevOps | [day7.md](docs/week13/day7.md) |

</details>

---

### Phase 4: 综合项目（Week 14-17）

<details>
<summary><b>Week 14-17 — 项目实战（3 选 1）</b></summary>

| 周 | 主题 | 文件 |
|----|------|------|
| Week 14 | 项目实战第 1 周 | [day1-7.md](docs/week14/day1-7.md) |
| Week 15 | 项目实战第 2 周 | [day1-7.md](docs/week15/day1-7.md) |
| Week 16 | 项目实战第 3 周 | [day1-7.md](docs/week16/day1-7.md) |
| Week 17 | 项目实战第 4 周 | [day1-7.md](docs/week17/day1-7.md) |

**可选项目：**
- ⭐ AI-Interview 智能模拟面试系统 — FastAPI + RAG + LangGraph + Guardrails
- DeepResearch 深度研究 Agent — 多 Agent + 搜索 + Handoff
- 多智能体旅行助手 — MCP + CrewAI + 外部 API

</details>

---

### Phase 5: 毕业冲刺（Week 18-20）

<details>
<summary><b>Week 18-20 — 项目打磨 + 简历 + 模拟面试</b></summary>

| 周 | 主题 | 文件 |
|----|------|------|
| Week 18 | 项目打磨 + README + 技术博客 | [day1-7.md](docs/week18/day1-7.md) |
| Week 19 | Demo 演示 + 简历话术 | [day1-7.md](docs/week19/day1-7.md) |
| Week 20 | 模拟面试 + 查漏补缺 | [day1-7.md](docs/week20/day1-7.md) |

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

本项目融合了以下优秀开源项目的内容与设计理念：

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

我们欢迎以下形式的贡献：

- 🐛 **报告 Bug** — 发现问题请提交 Issue
- 💡 **提出建议** — 功能改进或内容补充
- 📝 **完善内容** — 补充代码示例或学习笔记
- ✍️ **分享实践** — 分享你的学习心得

---

## 🙏 致谢

感谢所有为本项目提供灵感和内容的开源社区。

特别感谢 [Datawhale](https://github.com/datawhalechina) 社区的 [hello-agents](https://github.com/datawhalechina/hello-agents) 和 [happy-llm](https://github.com/datawhalechina/happy-llm) 项目。

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

</div>
