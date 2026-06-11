<div align="center">

# 🤖 Agent Factory

### 从零到精通的 AI Agent 系统学习课程

*融合 10 个优秀开源项目，20 周掌握 AI Agent 开发*

<br/>

[![GitHub stars](https://img.shields.io/github/stars/ahouyun/agent-factory?style=flat-square&logo=github)](https://github.com/ahouyun/agent-factory/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ahouyun/agent-factory?style=flat-square&logo=github)](https://github.com/ahouyun/agent-factory/network/members)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Language](https://img.shields.io/badge/language-中文-brightgreen?style=flat-square)]()
[![Weeks](https://img.shields.io/badge/学习周期-20周-orange?style=flat-square)]()

<br/>

[📚 在线阅读](https://ahouyun.github.io/agent-factory/) | [🚀 快速开始](#-快速开始) | [📖 课程大纲](#-课程大纲) | [🙋 贡献指南](#-如何贡献)

</div>

---

## 🎯 项目介绍

&emsp;&emsp;**Agent Factory** 是一套系统性的 AI Agent 学习课程，专为零基础学习者设计。课程融合了 **ai-agent-daily-mentor**、**hello-agents**、**happy-llm**、**Microsoft AI Agents**、**OpenAI Agents SDK** 等 10 个优秀开源项目的精华，经过去重和优化后，形成了一套完整的 20 周学习路径。

&emsp;&emsp;最终目标：**学完后你能独立完成一个可展示、可面试的 Agent 项目。**

---

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/ahouyun/agent-factory.git
cd agent-factory
```

| 方式 | 适合人群 | 说明 |
|:----:|---------|------|
| 🌐 | **在线阅读** | [点击访问](https://ahouyun.github.io/agent-factory/)，无需下载 |
| 🤖 | **AI 助手模式** | 加载 SKILL.md，每天生成任务 |
| 📓 | **Obsidian 笔记** | 用 Obsidian 打开项目目录 |

---

## 📖 课程大纲

### Phase 0: 预备周

<details>
<summary><b>🔧 Week 0 — 环境搭建 + Python 速通</b>（7天）</summary>

| Day | 主题 | 文件 |
|:---:|------|:----:|
| 1 | 学习路线总览 + 工具链搭建 | [📄](docs/week0/day1.md) |
| 2 | Claude Code / Codex CLI 上手 | [📄](docs/week0/day2.md) |
| 3 | 项目仓库初始化 + CLAUDE.md | [📄](docs/week0/day3.md) |
| 4 | Obsidian 知识库搭建 | [📄](docs/week0/day4.md) |
| 5 | Python 速通（变量/函数/类/模块） | [📄](docs/week0/day5.md) |
| 6 | Python 数据结构 + 类型提示 | [📄](docs/week0/day6.md) |
| 7 | 周复盘 + 环境检查清单 | [📄](docs/week0/day7.md) |

</details>

---

### Phase 1: 地基（Week 1-4）

<details>
<summary><b>🐍 Week 1 — Python 工程化 + HTTP 基础</b>（7天）</summary>

| Day | 主题 | 文件 |
|:---:|------|:----:|
| 1 | 虚拟环境 + 包管理 + 项目结构 | [📄](docs/week1/day1.md) |
| 2 | HTTP 协议 + requests/httpx | [📄](docs/week1/day2.md) |
| 3 | 大模型 API 最小调用 + 国内模型替代 | [📄](docs/week1/day3.md) |
| 4 | 异步编程 asyncio + 并发调用 | [📄](docs/week1/day4.md) |
| 5 | CLI 工具搭建（typer） | [📄](docs/week1/day5.md) |
| 6 | 日志系统 + 错误处理 + .env 管理 | [📄](docs/week1/day6.md) |
| 7 | 重构 + 测试 + 复盘 | [📄](docs/week1/day7.md) |

</details>

<details>
<summary><b>⚡ Week 2 — FastAPI 后端开发</b>（7天）</summary>

| Day | 主题 | 文件 |
|:---:|------|:----:|
| 1 | FastAPI 入门 + Pydantic v2 模型 | [📄](docs/week2/day1.md) |
| 2 | 路由设计 + 请求验证 + 错误处理 | [📄](docs/week2/day2.md) |
| 3 | 数据库 ORM（SQLAlchemy 2.0）+ CRUD | [📄](docs/week2/day3.md) |
| 4 | JWT 认证 + 中间件 | [📄](docs/week2/day4.md) |
| 5 | WebSocket 实时通信 | [📄](docs/week2/day5.md) |
| 6 | 结构化输出：JSON Mode + Pydantic Schema | [📄](docs/week2/day6.md) |
| 7 | 测试 + 复盘 | [📄](docs/week2/day7.md) |

</details>

<details>
<summary><b>🧠 Week 3 — LLM 原理与应用基础</b>（7天）</summary>

| Day | 主题 | 文件 |
|:---:|------|:----:|
| 1 | NLP 基础 + 文本表示演进 | [📄](docs/week3/day1.md) |
| 2 | Transformer 架构：自注意力机制（概念级） | [📄](docs/week3/day2.md) |
| 3 | 大模型概览：GPT/Claude/LLaMA 架构对比 | [📄](docs/week3/day3.md) |
| 4 | 提示工程：Few-shot / CoT / 结构化输出 | [📄](docs/week3/day4.md) |
| 5 | "When NOT to build agents" 判断框架 | [📄](docs/week3/day5.md) |
| 6 | LLM API 工程实践：流式调用 + Token 管理 | [📄](docs/week3/day6.md) |
| 7 | 复盘 | [📄](docs/week3/day7.md) |

</details>

<details>
<summary><b>🤖 Week 4 — Agent 经典范式</b>（7天）</summary>

| Day | 主题 | 文件 |
|:---:|------|:----:|
| 1 | 智能体定义、类型、发展史 | [📄](docs/week4/day1.md) |
| 2 | ReAct 范式：推理 + 行动交替 | [📄](docs/week4/day2.md) |
| 3 | Plan-and-Solve 范式 | [📄](docs/week4/day3.md) |
| 4 | Reflection 范式：自我反思 | [📄](docs/week4/day4.md) |
| 5 | Metacognition 范式：元认知 | [📄](docs/week4/day5.md) |
| 6 | 五种 Agent 工作流模式 | [📄](docs/week4/day6.md) |
| 7 | 复盘 | [📄](docs/week4/day7.md) |

</details>

---

### Phase 2: 核心能力（Week 5-9）

<details>
<summary><b>📚 Week 5 — RAG 检索增强</b>（7天）</summary>

| Day | 主题 | 文件 |
|:---:|------|:----:|
| 1 | RAG 原理 + 架构概览 | [📄](docs/week5/day1.md) |
| 2 | 向量数据库（Chroma）+ Embedding 模型 | [📄](docs/week5/day2.md) |
| 3 | 文档加载 + 分块策略 + 向量索引 | [📄](docs/week5/day3.md) |
| 4 | 混合检索：向量 + BM25 + Reranking | [📄](docs/week5/day4.md) |
| 5 | Query 改写 + 上下文注入 + Redis 缓存 | [📄](docs/week5/day5.md) |
| 6 | RAG 评估：忠实度、相关性、召回率 | [📄](docs/week5/day6.md) |
| 7 | Agentic RAG：Agent + RAG 融合 | [📄](docs/week5/day7.md) |

</details>

<details>
<summary><b>🛡️ Week 6 — Agent 框架 + 安全</b>（7天）</summary>

| Day | 主题 | 文件 |
|:---:|------|:----:|
| 1 | Function Calling / Tool Use 原理与实现 | [📄](docs/week6/day1.md) |
| 2 | LangChain 核心概念 + 链式调用 | [📄](docs/week6/day2.md) |
| 3 | LangGraph 状态机：节点 + 边 + 条件路由 | [📄](docs/week6/day3.md) |
| 4 | Agent 安全：Prompt Injection + OWASP + 红队 | [📄](docs/week6/day4.md) |
| 5 | Guardrails：输入/输出验证层 | [📄](docs/week6/day5.md) |
| 6 | 人机协作：Human-in-the-Loop 模式 | [📄](docs/week6/day6.md) |
| 7 | 复盘 | [📄](docs/week6/day7.md) |

</details>

<details>
<summary><b>💾 Week 7 — 上下文工程 + 记忆系统</b>（7天）</summary>

| Day | 主题 | 文件 |
|:---:|------|:----:|
| 1 | 上下文工程：窗口管理 + 摘要压缩 | [📄](docs/week7/day1.md) |
| 2 | 记忆架构：4种记忆类型 + MemGPT 三层模型 | [📄](docs/week7/day2.md) |
| 3 | 记忆实现：对话缓冲 + 实体记忆 + 向量记忆 | [📄](docs/week7/day3.md) |
| 4 | Agent Persona 设计：System Prompt + 行为一致性 | [📄](docs/week7/day4.md) |
| 5 | LangGraph 完整工作流整合 | [📄](docs/week7/day5.md) |
| 6 | 错误处理 + 重试 + 优雅降级 | [📄](docs/week7/day6.md) |
| 7 | 复盘 | [📄](docs/week7/day7.md) |

</details>

<details>
<summary><b>🔗 Week 8 — 通信协议与多 Agent 协作</b>（7天）</summary>

| Day | 主题 | 文件 |
|:---:|------|:----:|
| 1 | MCP 原理与实现 + Agent Skills vs MCP | [📄](docs/week8/day1.md) |
| 2 | A2A + NLWeb 协议：三大协议 | [📄](docs/week8/day2.md) |
| 3 | 多 Agent 架构设计：主从 / 对等 / 分层 | [📄](docs/week8/day3.md) |
| 4 | Handoff 模式：结构化任务委派 | [📄](docs/week8/day4.md) |
| 5 | CrewAI：角色驱动的多 Agent 编排 | [📄](docs/week8/day5.md) |
| 6 | 构建多 Agent 协作 Demo | [📄](docs/week8/day6.md) |
| 7 | 复盘 | [📄](docs/week8/day7.md) |

</details>

<details>
<summary><b>🏗️ Week 9 — 项目实战入门</b>（7天）</summary>

| Day | 主题 | 文件 |
|:---:|------|:----:|
| 1 | 项目选型 + 技术方案设计 | [📄](docs/week9/day1.md) |
| 2 | 后端骨架搭建 | [📄](docs/week9/day2.md) |
| 3 | RAG 检索服务集成 | [📄](docs/week9/day3.md) |
| 4 | Agent 核心逻辑 | [📄](docs/week9/day4.md) |
| 5 | 安全层集成 | [📄](docs/week9/day5.md) |
| 6 | 端到端联调 | [📄](docs/week9/day6.md) |
| 7 | 复盘 | [📄](docs/week9/day7.md) |

</details>

---

### Phase 3: 进阶专精（Week 10-13）

<details>
<summary><b>🧬 Week 10 — Agentic RL 基础（选修）</b>（7天）</summary>

| Day | 主题 | 文件 |
|:---:|------|:----:|
| 1 | 从 SFT 到 RLHF：大模型训练全景 | [📄](docs/week10/day1.md) |
| 2 | LoRA / QLoRA 高效微调 + 小模型微调理由 | [📄](docs/week10/day2.md) |
| 3 | DPO / GRPO 偏好对齐算法 | [📄](docs/week10/day3.md) |
| 4 | Agent 训练数据构造 + 数据预处理 | [📄](docs/week10/day4.md) |
| 5 | 动手微调一个小模型（可选） | [📄](docs/week10/day5.md) |
| 6 | 评测微调效果 + 对比分析 | [📄](docs/week10/day6.md) |
| 7 | 复盘 | [📄](docs/week10/day7.md) |

</details>

<details>
<summary><b>📊 Week 11 — 智能体评估与可观测性</b>（7天）</summary>

| Day | 主题 | 文件 |
|:---:|------|:----:|
| 1 | Agent 评估框架：核心指标与基准测试 | [📄](docs/week11/day1.md) |
| 2 | 行业基准：SWE-bench / HumanEval / GAIA | [📄](docs/week11/day2.md) |
| 3 | 自动化评估 Pipeline 设计 | [📄](docs/week11/day3.md) |
| 4 | 可观测性三支柱：Traces / Metrics / Logs | [📄](docs/week11/day4.md) |
| 5 | LangSmith / Arize Phoenix 实践 | [📄](docs/week11/day5.md) |
| 6 | 评估驱动的迭代优化 | [📄](docs/week11/day6.md) |
| 7 | 复盘 | [📄](docs/week11/day7.md) |

</details>

<details>
<summary><b>🚀 Week 12 — 生产部署</b>（7天）</summary>

| Day | 主题 | 文件 |
|:---:|------|:----:|
| 1 | Docker + Docker Compose + 密钥管理 | [📄](docs/week12/day1.md) |
| 2 | CI/CD 流水线：GitHub Actions | [📄](docs/week12/day2.md) |
| 3 | 模型 Fallback + vLLM 推理优化 | [📄](docs/week12/day3.md) |
| 4 | 成本优化：Token 计数 + Prompt 缓存 | [📄](docs/week12/day4.md) |
| 5 | 限流/熔断/重试 + Sandbox Agents | [📄](docs/week12/day5.md) |
| 6 | 监控告警 + 日志聚合 | [📄](docs/week12/day6.md) |
| 7 | 复盘 | [📄](docs/week12/day7.md) |

</details>

<details>
<summary><b>🔍 Week 13 — 深度技术探索（选修）</b>（7天）</summary>

| Day | 主题 | 文件 |
|:---:|------|:----:|
| 1 | 从零搭建 LLM（LLaMA2 + Tokenizer） | [📄](docs/week13/day1.md) |
| 2 | 从零构建 Agent 框架 | [📄](docs/week13/day2.md) |
| 3 | 多模态 Agent + 语音 Agent + VLM 微调 | [📄](docs/week13/day3.md) |
| 4 | GUI/Web Agent（浏览器自动化） | [📄](docs/week13/day4.md) |
| 5 | Agent 自进化详解 | [📄](docs/week13/day5.md) |
| 6 | 真实世界案例分析 + 开发踩坑 | [📄](docs/week13/day6.md) |
| 7 | Skill 写作指南 + Agent 辩论/本地/DevOps | [📄](docs/week13/day7.md) |

</details>

---

### Phase 4: 综合项目（Week 14-17）

<details>
<summary><b>🏗️ Week 14-17 — 项目实战（3 选 1）</b>（28天）</summary>

| 周 | 主题 | 文件 |
|:--:|------|:----:|
| 14 | 项目实战第 1 周 | [📄](docs/week14/day1-7.md) |
| 15 | 项目实战第 2 周 | [📄](docs/week15/day1-7.md) |
| 16 | 项目实战第 3 周 | [📄](docs/week16/day1-7.md) |
| 17 | 项目实战第 4 周 | [📄](docs/week17/day1-7.md) |

| 项目 | 技术栈 | 面试价值 |
|------|--------|:--------:|
| ⭐ **AI-Interview** | FastAPI + RAG + LangGraph + Guardrails | ⭐⭐⭐⭐⭐ |
| **DeepResearch** | 多 Agent + 搜索 + Handoff | ⭐⭐⭐⭐ |
| **旅行助手** | MCP + CrewAI + 外部 API | ⭐⭐⭐⭐ |

</details>

---

### Phase 5: 毕业冲刺（Week 18-20）

<details>
<summary><b>🎓 Week 18-20 — 项目打磨 + 简历 + 模拟面试</b>（21天）</summary>

| 周 | 主题 | 文件 |
|:--:|------|:----:|
| 18 | 项目打磨 + README + 技术博客 | [📄](docs/week18/day1-7.md) |
| 19 | Demo 演示 + 简历话术 | [📄](docs/week19/day1-7.md) |
| 20 | 模拟面试 + 查漏补缺 | [📄](docs/week20/day1-7.md) |

</details>

---

## 📁 项目结构

```
agent-factory/
├── skill/                    # AI Skill 定义
├── docs/                     # 20 周教程文档
│   ├── week0/ ~ week20/      # 每周每天的文件
├── code/                     # 代码示例
├── knowledge-base/           # Obsidian 知识库
└── assessments/              # 评估题库
```

---

## 📚 来源致谢

| 项目 | Stars | 许可证 |
|------|:-----:|--------|
| [ai-agent-daily-mentor](https://github.com/Marcos-wu/ai-agent-daily-mentor) | 72 | MIT |
| [hello-agents](https://github.com/datawhalechina/hello-agents) | 58.3k | CC BY-NC-SA 4.0 |
| [happy-llm](https://github.com/datawhalechina/happy-llm) | 31.1k | CC BY-NC-SA 4.0 |
| [Microsoft AI Agents](https://github.com/microsoft/ai-agents-for-beginners) | 66.9k | MIT |
| [OpenAI Agents SDK](https://github.com/openai/openai-agents-python) | 14.8k | Apache-2.0 |

---

## 🤝 如何贡献

- 🐛 **报告 Bug** — 提交 Issue
- 💡 **提出建议** — 发起讨论
- 📝 **完善内容** — 提交 PR
- ✍️ **分享实践** — 分享学习心得

---

## 📜 开源协议

本项目采用 [MIT License](LICENSE)。引用的 CC BY-NC-SA 4.0 内容已注明出处。

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！⭐**

</div>
