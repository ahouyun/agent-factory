# 📅 Week 9 Day 1：项目选型 + 技术方案设计

## 🧭 今日方向
> 从"学习模式"切换到"实战模式"。今天确定项目方向、选型技术栈、设计整体方案，为后续开发打下基础。我们要完成一个 **AI 知识库助手** 的完整技术设计。

## 🎯 生活比喻
> 今天的工作就像"装修前的设计阶段"。你需要先确定风格（技术选型）、画好图纸（架构设计）、列出材料清单（依赖清单），然后才能开始施工（编码）。没有蓝图就开始装修，最后很可能要返工。

## 📋 今日三件事
1. 确定项目方向和核心功能
2. 选型技术栈并评估可行性
3. 设计系统架构、数据模型和 API 接口

---

## 🗺️ 手把手路线

### Step 1: 项目定义与需求分析
- **做什么:** 明确项目目标、用户场景、核心功能
- **为什么:** 清晰的需求是成功的基础
- **成功标志:** 能用一句话描述项目，并列出完整的功能清单

### Step 2: 技术选型
- **做什么:** 评估和选择技术栈
- **为什么:** 技术选型决定了开发效率和系统能力
- **成功标志:** 有一个完整的技术选型表，包含每个选择的理由

### Step 3: 架构与数据模型设计
- **做什么:** 画出系统架构图、数据模型、API 设计
- **为什么:** 架构设计是开发的蓝图
- **成功标志:** 能画出分层架构图，定义完整数据模型

---

## 💻 代码区

### 完整可运行代码：项目定义与技术选型

```python
"""
Week 9 Day 1: 项目选型 + 技术方案设计
运行方式: python day1_project_design.py
"""

from dataclasses import dataclass, field
from typing import List, Dict
import json


# =============================================
# 1. 项目定义
# =============================================
print("=" * 60)
print("=== 1. 项目定义 ===")
print("=" * 60)

project_definition = {
    "name": "AI 知识库助手",
    "tagline": "基于 RAG 的智能问答系统，支持多文档类型和多轮对话",
    "target_users": "企业内部员工 / 个人知识管理者",
    "core_features": [
        "文档上传和解析（PDF / Word / Markdown / TXT）",
        "文档自动分块与向量化存储",
        "基于语义的智能问答（RAG）",
        "多轮对话（带上下文记忆）",
        "引用追溯（显示答案来源段落）",
        "对话历史管理（创建、查看、删除）",
        "用户注册与登录（JWT 认证）",
    ],
    "non_functional": [
        "单次问答响应时间 < 3 秒",
        "支持 50 并发用户",
        "文档上传大小限制 10MB",
        "数据安全（不泄露私有文档内容）",
        "系统可用性 > 99%",
    ],
}

print(f"项目名称: {project_definition['name']}")
print(f"一句话描述: {project_definition['tagline']}")
print(f"目标用户: {project_definition['target_users']}")
print()
print("核心功能:")
for i, feature in enumerate(project_definition["core_features"], 1):
    print(f"  {i}. {feature}")
print()
print("非功能需求:")
for req in project_definition["non_functional"]:
    print(f"  - {req}")


# =============================================
# 2. 技术选型
# =============================================
print("\n" + "=" * 60)
print("=== 2. 技术选型 ===")
print("=" * 60)

tech_stack = {
    "后端框架": {
        "options": ["FastAPI", "Flask", "Django"],
        "choice": "FastAPI",
        "reason": "原生异步、自动 OpenAPI 文档、类型安全、性能优异",
        "version": "0.115.0",
    },
    "ORM": {
        "options": ["SQLAlchemy", "Tortoise ORM", "Prisma"],
        "choice": "SQLAlchemy",
        "reason": "Python 生态最成熟的 ORM、文档丰富、支持异步",
        "version": "2.0.35",
    },
    "数据库": {
        "options": ["PostgreSQL", "SQLite", "MySQL"],
        "choice": "SQLite（开发）/ PostgreSQL（生产）",
        "reason": "SQLite 零配置适合原型，PostgreSQL 功能完整适合生产",
        "version": "3.x",
    },
    "向量数据库": {
        "options": ["ChromaDB", "Pinecone", "Milvus", "FAISS"],
        "choice": "ChromaDB",
        "reason": "轻量级、零配置、本地持久化、Python 原生支持",
        "version": "0.5.0",
    },
    "AI 框架": {
        "options": ["LangChain", "LlamaIndex", "直接调用 API"],
        "choice": "LangChain",
        "reason": "生态最丰富、RAG 支持完善、社区活跃、文档齐全",
        "version": "0.3.0",
    },
    "Embedding 模型": {
        "options": ["OpenAI text-embedding-3-small", "BGE-large-zh", "Jina Embeddings"],
        "choice": "OpenAI text-embedding-3-small",
        "reason": "性价比高（$0.02/1M tokens）、多语言支持好",
        "version": "text-embedding-3-small",
    },
    "LLM 模型": {
        "options": ["GPT-4o-mini", "GPT-4o", "Claude 3.5 Sonnet"],
        "choice": "GPT-4o-mini",
        "reason": "性价比极高、中文能力强、Function Calling 支持好",
        "version": "gpt-4o-mini",
    },
    "认证方案": {
        "options": ["JWT", "Session", "OAuth2"],
        "choice": "JWT",
        "reason": "无状态、易于扩展、前后端分离友好",
        "version": "python-jose 3.3.0",
    },
}

print()
for category, info in tech_stack.items():
    print(f"\n  {category}:")
    print(f"    选择: {info['choice']} (v{info['version']})")
    print(f"    理由: {info['reason']}")
    print(f"    备选: {', '.join(info['options'])}")


# =============================================
# 3. 系统架构设计
# =============================================
print("\n" + "=" * 60)
print("=== 3. 系统架构设计 ===")
print("=" * 60)

architecture = """
  系统分层架构图:

  ┌───────────────────────────────────────────────────────────┐
  │                      前端层 (Future)                       │
  │                Web UI / API Client / CLI                   │
  └────────────────────────┬──────────────────────────────────┘
                           │ HTTP / WebSocket
  ┌────────────────────────┴──────────────────────────────────┐
  │                     API 网关层 (FastAPI)                    │
  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
  │   │ JWT 认证  │  │ 输入验证  │  │ 限流器   │  │ 日志记录  │ │
  │   └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
  └────────────────────────┬──────────────────────────────────┘
                           │
  ┌────────────────────────┴──────────────────────────────────┐
  │                      业务逻辑层                            │
  │   ┌──────────┐  ┌──────────┐  ┌──────────┐               │
  │   │ 文档服务  │  │ RAG 服务  │  │ Agent   │               │
  │   │ (解析/   │  │ (检索/   │  │ (意图/  │               │
  │   │  存储)   │  │  向量化)  │  │  生成)  │               │
  │   └──────────┘  └──────────┘  └──────────┘               │
  └───────────┬──────────────┬──────────────┬─────────────────┘
              │              │              │
  ┌───────────┴───┐  ┌──────┴──────┐  ┌───┴───────────────┐
  │  PostgreSQL   │  │  ChromaDB   │  │   文件系统          │
  │  (元数据存储)  │  │  (向量存储)  │  │   (原始文档)       │
  └───────────────┘  └─────────────┘  └───────────────────┘
"""
print(architecture)


# =============================================
# 4. 数据模型设计
# =============================================
print("=" * 60)
print("=== 4. 数据模型设计 ===")
print("=" * 60)

data_models = """
  核心数据模型 (SQLAlchemy ORM):

  ┌─────────────────────┐     ┌─────────────────────┐
  │   User (用户表)      │     │  Document (文档表)    │
  ├─────────────────────┤     ├─────────────────────┤
  │ id: UUID (PK)       │◄────│ id: UUID (PK)       │
  │ email: str (UNIQUE) │ 1:N │ user_id: UUID (FK)  │
  │ name: str           │     │ filename: str       │
  │ password_hash: str  │     │ file_path: str      │
  │ role: enum          │     │ file_size: int      │
  │ created_at: datetime│     │ content_type: str   │
  └─────────────────────┘     │ chunk_count: int    │
                              │ status: enum        │
                              │ created_at: datetime│
                              └──────────┬──────────┘
                                         │ 1:N
                              ┌──────────┴──────────┐
                              │  Chunk (文档块表)     │
                              ├─────────────────────┤
                              │ id: UUID (PK)       │
                              │ document_id: UUID(FK)│
                              │ content: text       │
                              │ chunk_index: int    │
                              │ metadata: JSON      │
                              └─────────────────────┘

  ┌─────────────────────┐     ┌─────────────────────┐
  │ Conversation (对话)  │     │  Message (消息表)     │
  ├─────────────────────┤     ├─────────────────────┤
  │ id: UUID (PK)       │◄────│ id: UUID (PK)       │
  │ user_id: UUID (FK)  │ 1:N │ conversation_id(FK) │
  │ title: str          │     │ role: enum          │
  │ created_at: datetime│     │ content: text       │
  │ updated_at: datetime│     │ sources: JSON       │
  └─────────────────────┘     │ created_at: datetime│
                              └─────────────────────┘
"""
print(data_models)


# =============================================
# 5. API 接口设计
# =============================================
print("=" * 60)
print("=== 5. API 接口设计 ===")
print("=" * 60)

api_design = """
  RESTful API 接口清单:

  【认证模块】
  POST   /api/v1/auth/register      用户注册
         Body: { email, name, password }
         Response: { id, email, name, token }

  POST   /api/v1/auth/login          用户登录
         Body: { email, password }
         Response: { token, user }

  GET    /api/v1/auth/me             获取当前用户
         Headers: Authorization: Bearer <token>
         Response: { id, email, name, role }

  【文档管理模块】
  POST   /api/v1/documents/upload    上传文档
         Headers: Authorization: Bearer <token>
         Body: multipart/form-data (file)
         Response: { id, filename, chunk_count, status }

  GET    /api/v1/documents           获取文档列表
         Headers: Authorization: Bearer <token>
         Response: [{ id, filename, created_at }]

  DELETE /api/v1/documents/{id}      删除文档
         Headers: Authorization: Bearer <token>
         Response: { message: "删除成功" }

  【知识问答模块】
  POST   /api/v1/chat/query          提交问题
         Headers: Authorization: Bearer <token>
         Body: { conversation_id, message }
         Response: { response, sources, intent }

  GET    /api/v1/chat/history/{id}   获取对话历史
         Headers: Authorization: Bearer <token>
         Response: [{ role, content, sources, timestamp }]

  DELETE /api/v1/chat/history/{id}   删除对话
         Headers: Authorization: Bearer <token>
         Response: { message: "删除成功" }

  【系统模块】
  GET    /health                     健康检查（无需认证）
         Response: { status, version, uptime }
"""
print(api_design)


# =============================================
# 6. 依赖清单
# =============================================
print("=" * 60)
print("=== 6. 依赖清单 (requirements.txt) ===")
print("=" * 60)

requirements = """# === Web 框架 ===
fastapi==0.115.0
uvicorn[standard]==0.30.0
python-multipart==0.0.9

# === 数据库 ===
sqlalchemy==2.0.35
aiosqlite==0.20.0

# === LLM 和 RAG ===
langchain==0.3.0
langchain-openai==0.2.0
langchain-community==0.3.0
langchain-chroma==0.1.0
chromadb==0.5.0

# === 文档处理 ===
pypdf==4.3.1
python-docx==1.1.2

# === 认证和安全 ===
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# === 配置管理 ===
pydantic==2.9.0
pydantic-settings==2.5.0
python-dotenv==1.0.1
"""
print(requirements)


# =============================================
# 7. 开发计划
# =============================================
print("=" * 60)
print("=== 7. 开发计划 (9 天) ===")
print("=" * 60)

dev_plan = [
    ("Day 1", "项目选型 + 技术方案设计", "✅ 今天"),
    ("Day 2", "后端骨架搭建 (FastAPI + 数据库)", "明天"),
    ("Day 3", "RAG 检索服务集成", ""),
    ("Day 4", "Agent 核心逻辑", ""),
    ("Day 5", "安全层集成", ""),
    ("Day 6", "端到端联调", ""),
    ("Day 7", "复盘 + 优化", "本周最后"),
]

print()
for day, task, note in dev_plan:
    marker = f" [{note}]" if note else ""
    print(f"  {day}: {task}{marker}")

print()
print("  里程碑:")
print("    M1: 后端骨架完成 (Day 2)")
print("    M2: RAG 服务可用 (Day 3)")
print("    M3: Agent 可对话 (Day 4)")
print("    M4: 系统完整运行 (Day 6)")


# =============================================
# 8. 项目目录结构
# =============================================
print("\n" + "=" * 60)
print("=== 8. 项目目录结构 ===")
print("=" * 60)

directory_structure = """
  ai-knowledge-assistant/
  ├── app/
  │   ├── __init__.py
  │   ├── main.py                  # FastAPI 应用入口
  │   ├── config.py                # 配置管理 (Pydantic Settings)
  │   ├── database.py              # 数据库连接和 Session
  │   ├── models/                  # SQLAlchemy 数据模型
  │   │   ├── __init__.py
  │   │   ├── user.py
  │   │   ├── document.py
  │   │   └── conversation.py
  │   ├── schemas/                 # Pydantic 请求/响应模型
  │   │   ├── __init__.py
  │   │   ├── user.py
  │   │   ├── document.py
  │   │   └── chat.py
  │   ├── api/                     # API 路由
  │   │   ├── __init__.py
  │   │   ├── auth.py
  │   │   ├── documents.py
  │   │   └── chat.py
  │   ├── services/                # 业务逻辑
  │   │   ├── __init__.py
  │   │   ├── rag_service.py
  │   │   ├── agent_service.py
  │   │   └── auth_service.py
  │   └── utils/                   # 工具函数
  │       ├── __init__.py
  │       ├── security.py
  │       └── file_parser.py
  ├── data/
  │   ├── raw/                     # 原始文档存储
  │   ├── processed/               # 处理后数据
  │   └── chroma_db/               # 向量数据库持久化
  ├── tests/
  │   ├── test_api.py
  │   ├── test_rag.py
  │   └── test_agent.py
  ├── docs/
  │   └── TECHNICAL_DESIGN.md
  ├── scripts/
  │   └── verify_structure.py
  ├── .env.example
  ├── .gitignore
  ├── requirements.txt
  └── README.md
"""
print(directory_structure)


# =============================================
# 总结
# =============================================
print("=" * 60)
print("✅ Day 1 完成清单")
print("=" * 60)
print("""
  [x] 项目定义和需求分析完成
  [x] 技术选型评估完成
  [x] 系统架构图设计完成
  [x] 数据模型设计完成
  [x] API 接口设计完成
  [x] 依赖清单准备完成
  [x] 项目目录结构规划完成

  明天预告: Day 2 将搭建后端骨架，创建 FastAPI 应用、
  定义数据库模型、实现基础 API 路由。
""")
```

---

## 📤 预期输出

运行 `python day1_project_design.py` 后，你将看到：

```
============================================================
=== 1. 项目定义 ===
============================================================
项目名称: AI 知识库助手
一句话描述: 基于 RAG 的智能问答系统，支持多文档类型和多轮对话
目标用户: 企业内部员工 / 个人知识管理者

核心功能:
  1. 文档上传和解析（PDF / Word / Markdown / TXT）
  2. 文档自动分块与向量化存储
  3. 基于语义的智能问答（RAG）
  ...

============================================================
=== 2. 技术选型 ===
============================================================

  后端框架:
    选择: FastAPI (v0.115.0)
    理由: 原生异步、自动 OpenAPI 文档、类型安全、性能优异
    备选: FastAPI, Flask, Django
  ...
```

---

## ⚠️ 常见错误与解决方案

| # | 错误信息 | 原因 | 解决方案 |
|---|---------|------|---------|
| 1 | `ModuleNotFoundError: No module named 'pydantic_settings'` | pydantic v2 将 BaseSettings 移到独立包 | `pip install pydantic-settings` |
| 2 | `ImportError: cannot import name 'BaseSettings'` | 同上 | `pip install pydantic[dotenv]` |
| 3 | `SyntaxError: invalid syntax` | Python 版本过低 | 使用 Python 3.10+ |
| 4 | `UnicodeDecodeError` | 文件编码问题 | 确保文件使用 UTF-8 编码 |

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| 技术选型 | 评估并选择最适合项目的技术方案 |
| 架构设计 | 系统的整体结构和组件关系 |
| MVP | 最小可行产品，包含核心功能的最简版本 |
| 分层架构 | 将系统分为多个层次，每层职责单一 |
| RESTful API | 基于 HTTP 方法的接口设计规范 |
| 数据模型 | 定义系统中数据的结构和关系 |
| ORM | 对象关系映射，将数据库表映射为 Python 类 |
| RAG | 检索增强生成，结合检索和生成的 AI 技术 |

---

## 🏆 每日挑战

### 挑战 1：基础（必做）
1. 理解并运行今日代码
2. 修改技术选型表，添加一个你自己评估的技术组件
3. 画出你理解的系统架构图（手绘或工具均可）

### 挑战 2：进阶（推荐）
1. 在技术设计文档中添加性能指标设计
2. 设计数据库索引策略（哪些字段需要索引）
3. 编写 `requirements.txt` 并在虚拟环境中安装

### 挑战 3：挑战（可选）
编写一个项目结构验证脚本，自动检查所有必要的文件和目录是否存在，并输出验证报告。

---

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...
- 明天需要重点关注: ...

---

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望重点解决: ...
