# 20 周课程主线

## Phase 0: 预备周（Week 0）

| Day | 主题 | 产出 |
|-----|------|------|
| 1 | 学习路线总览 + 工具链搭建 | Git + VS Code + Python |
| 2 | Claude Code / Codex CLI 上手 | 第一个 AI 脚本 |
| 3 | 项目仓库初始化 + CLAUDE.md | 项目骨架 |
| 4 | Obsidian 知识库搭建 | 笔记系统 |
| 5 | Python 速通 | 50 行脚本 |
| 6 | Python 数据结构 + 类型提示 | Pydantic 基础 |
| 7 | 周复盘 | 环境就绪 |

**里程碑**: 🔧 能用 Claude Code 生成代码并运行

---

## Phase 1: 地基（Week 1-4）

### Week 1: Python 工程化 + HTTP 基础

| Day | 主题 | 产出 |
|-----|------|------|
| 1 | 虚拟环境 + 包管理 + 项目结构 | 标准化骨架 |
| 2 | HTTP 协议 + requests/httpx | 能调用 API |
| 3 | 大模型 API 最小调用 | 能调用 Claude |
| 4 | 异步编程 asyncio | 异步 LLM 调用 |
| 5 | CLI 工具搭建（typer） | CLI 工具 |
| 6 | 日志 + 错误处理 + .env | 生产级处理 |
| 7 | 重构 + 测试 + 复盘 | **LLM CLI 工具** |

### Week 2: FastAPI 后端开发

| Day | 主题 | 产出 |
|-----|------|------|
| 1 | FastAPI + Pydantic v2 | 第一个 API |
| 2 | 路由 + 验证 + 错误处理 | CRUD 接口 |
| 3 | SQLAlchemy 2.0 ORM | 数据持久化 |
| 4 | JWT 认证 + 中间件 | 安全 API |
| 5 | WebSocket 实时通信 | 流式响应 |
| 6 | 结构化输出：JSON Mode | LLM 输出 |
| 7 | 测试 + 复盘 | **后端骨架** |

### Week 3: LLM 原理与应用基础

| Day | 主题 | 产出 |
|-----|------|------|
| 1 | NLP 基础 + 文本表示 | Token/Embedding |
| 2 | Transformer 概念级 | Attention 理解 |
| 3 | LLM 架构对比 | GPT/Claude/LLaMA |
| 4 | 提示工程 | 有效 Prompt |
| 5 | "When NOT to build agents" | 判断框架 |
| 6 | LLM API 工程实践 | 生产级调用 |
| 7 | 复盘 | **最佳实践笔记** |

### Week 4: Agent 经典范式

| Day | 主题 | 产出 |
|-----|------|------|
| 1 | 智能体定义、类型、发展史 | Agent 本质 |
| 2 | ReAct 范式 | ReAct Agent |
| 3 | Plan-and-Solve 范式 | 规划型 Agent |
| 4 | Reflection 范式 | 自省型 Agent |
| 5 | Metacognition 范式 | 元认知 Agent |
| 6 | 五种工作流模式 | Chaining 等 |
| 7 | 复盘 | **范式对比报告** |

**里程碑**: 🚀 能调通 LLM API + 理解 5 种 Agent 范式

---

## Phase 2: 核心能力（Week 5-9）

### Week 5: RAG 检索增强

| Day | 主题 | 产出 |
|-----|------|------|
| 1 | RAG 原理 + 架构 | RAG 理解 |
| 2 | Chroma + Embedding | 向量检索 |
| 3 | 文档加载 + 分块 | 文档处理 |
| 4 | 混合检索 | 多策略检索 |
| 5 | Query 改写 + Redis | 检索优化 |
| 6 | RAG 评估 | 质量量化 |
| 7 | Agentic RAG | Agent+RAG |

### Week 6: Agent 框架 + 安全

| Day | 主题 | 产出 |
|-----|------|------|
| 1 | Function Calling | 工具调用 |
| 2 | LangChain 核心 | Chain 理解 |
| 3 | LangGraph 状态机 | 状态图 |
| 4 | Prompt Injection 防御 | 安全理解 |
| 5 | Guardrails 验证层 | 安全验证 |
| 6 | Human-in-the-Loop | 审批工作流 |
| 7 | 复盘 | **安全 Agent Demo** |

### Week 7: 上下文工程 + 记忆系统

| Day | 主题 | 产出 |
|-----|------|------|
| 1 | 上下文工程 | 窗口管理 |
| 2 | MemGPT 三层记忆 | 记忆架构 |
| 3 | 记忆实现 | 多种记忆 |
| 4 | Agent Persona | 人格设计 |
| 5 | LangGraph 整合 | 完整工作流 |
| 6 | 错误处理 + 降级 | 生产级 Agent |
| 7 | 复盘 | **有记忆的 Agent** |

### Week 8: 通信协议与多 Agent 协作

| Day | 主题 | 产出 |
|-----|------|------|
| 1 | MCP 协议 | MCP Server |
| 2 | A2A + NLWeb | 三大协议 |
| 3 | 多 Agent 架构 | 架构设计 |
| 4 | Handoff 模式 | 任务委派 |
| 5 | CrewAI | 角色编排 |
| 6 | 多 Agent Demo | 协作系统 |
| 7 | 复盘 | **MCP + 多 Agent** |

### Week 9: 项目实战入门

| Day | 主题 | 产出 |
|-----|------|------|
| 1 | 项目选型 + 设计 | 设计文档 |
| 2 | 后端骨架 | FastAPI + DB |
| 3 | RAG 集成 | 检索服务 |
| 4 | Agent 核心 | LangGraph |
| 5 | 安全层 | Guardrails |
| 6 | 端到端联调 | 流程跑通 |
| 7 | 复盘 | **项目 MVP** |

**里程碑**: 🤖 能构建安全的 Agent + 项目 MVP 跑通

---

## Phase 3: 进阶专精（Week 10-13）

### Week 10: Agentic RL 基础
### Week 11: 智能体评估与可观测性
### Week 12: 生产部署
### Week 13: 深度技术探索（选修，选 2-3 个方向）

**里程碑**: 🔬 能评估和优化 Agent

---

## Phase 4: 综合项目（Week 14-17）

选择 1-2 个项目完成：
- AI-Interview 智能模拟面试系统
- DeepResearch 深度研究 Agent
- 多智能体旅行助手

**里程碑**: 🏗️ 能交付完整项目

---

## Phase 5: 毕业冲刺（Week 18-20）

- W18: 项目打磨 + README + 技术博客
- W19: Demo 演示 + 简历话术
- W20: 模拟面试 + 查漏补缺

**里程碑**: 🎓 能通过面试
