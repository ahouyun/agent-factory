# 📅 Week 9 Day 1：项目选型 + 技术方案设计

## 🧭 今日方向
> 从"学习模式"切换到"实战模式"。今天确定项目方向、选型技术栈、设计整体方案，为后续开发打下基础。

## 🎯 生活比喻
> 今天的工作就像"装修前的设计阶段"。你需要先确定风格（技术选型）、画好图纸（架构设计）、列出材料清单（依赖清单），然后才能开始施工（编码）。

## 📋 今日三件事
1. 确定项目方向和核心功能
2. 选型技术栈并评估可行性
3. 设计系统架构和技术方案

## 🗺️ 手把手路线

### Step 1: 项目定义
- 做什么: 明确项目目标、用户场景、核心功能
- 为什么: 清晰的需求是成功的基础
- 成功标志: 能用一句话描述项目

### Step 2: 技术选型
- 做什么: 评估和选择技术栈
- 为什么: 技术选型决定了开发效率和系统能力
- 成功标志: 有一个完整的技术选型表

### Step 3: 架构设计
- 做什么: 画出系统架构图
- 为什么: 架构设计是开发的蓝图
- 成功标志: 能画出分层架构图

## 💻 代码区

```python
"""
Week 9 Day 1: 项目选型 + 技术方案设计
"""

# ========== 1. 项目定义 ==========
print("=== 1. 项目定义 ===")

project_definition = {
    "name": "AI Agent 知识助手",
    "description": "基于 RAG 的智能问答系统，支持多文档类型和多轮对话",
    "target_users": "企业内部员工",
    "core_features": [
        "文档上传和解析（PDF/Word/Markdown）",
        "智能问答（基于文档内容）",
        "多轮对话（带上下文记忆）",
        "引用追溯（显示答案来源）",
        "对话历史管理"
    ],
    "non_functional": [
        "响应时间 < 3 秒",
        "支持 100 并发用户",
        "数据安全（不泄露私有文档）"
    ]
}

print("项目名称:", project_definition["name"])
print("项目描述:", project_definition["description"])
print("\n核心功能:")
for i, feature in enumerate(project_definition["core_features"], 1):
    print(f"  {i}. {feature}")
print("\n非功能需求:")
for req in project_definition["non_functional"]:
    print(f"  - {req}")

# ========== 2. 技术选型 ==========
print("\n=== 2. 技术选型 ===")

tech_stack = {
    "后端框架": {
        "选项": ["FastAPI", "Flask", "Django"],
        "选择": "FastAPI",
        "理由": "异步支持、自动文档、类型安全"
    },
    "LLM 框架": {
        "选项": ["LangChain", "LlamaIndex", "直接调用 API"],
        "选择": "LangChain",
        "理由": "生态丰富、RAG 支持好、社区活跃"
    },
    "向量数据库": {
        "选项": ["Chroma", "Pinecone", "Milvus", "Weaviate"],
        "选择": "Chroma",
        "理由": "轻量级、易于部署、适合原型"
    },
    "Embedding 模型": {
        "选项": ["OpenAI text-embedding-3-small", "BGE-large-zh", "Jina"],
        "选择": "OpenAI text-embedding-3-small",
        "理由": "性价比高、多语言支持"
    },
    "前端": {
        "选项": ["React", "Vue", "Streamlit"],
        "选择": "Streamlit (原型) / React (生产)",
        "理由": "Streamlit 快速原型，React 生产部署"
    },
    "数据库": {
        "选项": ["PostgreSQL", "SQLite", "MongoDB"],
        "选择": "PostgreSQL",
        "理由": "可靠、功能完整、适合生产"
    },
    "缓存": {
        "选项": ["Redis", "Memcached", "无"],
        "选择": "Redis",
        "理由": "功能丰富、支持多种数据结构"
    }
}

print("技术选型表:")
print("="*60)
for category, info in tech_stack.items():
    print(f"\n{category}:")
    print(f"  选择: {info['选择']}")
    print(f"  理由: {info['理由']}")
    print(f"  备选: {', '.join(info['选项'])}")

# ========== 3. 架构设计 ==========
print("\n=== 3. 架构设计 ===")

architecture = """
系统架构图:

┌─────────────────────────────────────────────────────┐
│                    前端 (Frontend)                    │
│              Streamlit / React                       │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/WebSocket
                      ▼
┌─────────────────────────────────────────────────────┐
│                    API 网关                           │
│              FastAPI + 认证授权                       │
└───────┬─────────────┼─────────────┬─────────────────┘
        │             │             │
        ▼             ▼             ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│  RAG 服务 │ │ Agent 服务│ │ 用户服务  │
│          │ │          │ │          │
│ 文档解析  │ │ 对话管理  │ │ 认证授权  │
│ 向量检索  │ │ 上下文   │ │ 历史记录  │
│ Reranking│ │ 工具调用  │ │ 权限管理  │
└────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │
     ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Chroma   │ │ Redis    │ │ PostgreSQL│
│ 向量存储  │ │ 缓存     │ │ 业务数据  │
└──────────┘ └──────────┘ └──────────┘
"""
print(architecture)

# ========== 4. 数据模型设计 ==========
print("=== 4. 数据模型设计 ===")

data_models = """
核心数据模型:

1. Document (文档)
   - id: UUID
   - name: str
   - content: text
   - file_type: str (pdf/docx/md)
   - created_at: datetime
   - user_id: UUID

2. Chunk (文档块)
   - id: UUID
   - document_id: UUID
   - content: text
   - embedding: vector
   - metadata: json

3. Conversation (对话)
   - id: UUID
   - user_id: UUID
   - title: str
   - created_at: datetime
   - updated_at: datetime

4. Message (消息)
   - id: UUID
   - conversation_id: UUID
   - role: str (user/assistant)
   - content: text
   - sources: json (引用来源)
   - created_at: datetime

5. User (用户)
   - id: UUID
   - email: str
   - name: str
   - role: str (admin/user)
   - created_at: datetime
"""
print(data_models)

# ========== 5. API 设计 ==========
print("\n=== 5. API 设计 ===")

api_design = """
RESTful API 设计:

文档管理:
  POST   /api/documents          上传文档
  GET    /api/documents          获取文档列表
  GET    /api/documents/{id}     获取文档详情
  DELETE /api/documents/{id}     删除文档

对话管理:
  POST   /api/conversations      创建对话
  GET    /api/conversations      获取对话列表
  GET    /api/conversations/{id} 获取对话详情
  DELETE /api/conversations/{id} 删除对话

消息:
  POST   /api/conversations/{id}/messages  发送消息
  GET    /api/conversations/{id}/messages  获取消息历史

认证:
  POST   /api/auth/login         登录
  POST   /api/auth/register      注册
  GET    /api/auth/me            获取当前用户
"""
print(api_design)

# ========== 6. 开发计划 ==========
print("\n=== 6. 开发计划 ===")

dev_plan = """
开发计划 (9 天):

Day 1: 项目选型 + 技术方案设计 (今天)
Day 2: 后端骨架搭建 (FastAPI + 数据库)
Day 3: RAG 检索服务集成
Day 4: Agent 核心逻辑
Day 5: 安全层集成
Day 6: 端到端联调
Day 7: 复盘 + 优化

里程碑:
- M1: 后端骨架完成 (Day 2)
- M2: RAG 服务可用 (Day 3)
- M3: Agent 可对话 (Day 4)
- M4: 系统完整运行 (Day 6)
"""
print(dev_plan)

# ========== 7. 依赖清单 ==========
print("\n=== 7. 依赖清单 ===")

dependencies = """
requirements.txt:

# Web 框架
fastapi==0.115.0
uvicorn[standard]==0.30.0
python-multipart==0.0.9

# 数据库
sqlalchemy==2.0.35
alembic==1.13.2
psycopg2-binary==2.9.9

# LLM 和 RAG
langchain==0.3.0
langchain-openai==0.2.0
langchain-community==0.3.0
chromadb==0.5.0

# 向量化
sentence-transformers==3.1.0
tiktoken==0.7.0

# 缓存
redis==5.0.8

# 工具
python-dotenv==1.0.1
pydantic==2.9.0

# 文档处理
pypdf==4.3.1
python-docx==1.1.2
"""
print(dependencies)
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 不知道选什么技术 | 根据团队熟悉度和社区活跃度决定 |
| 2 | 架构设计太复杂 | 先做最小可行产品（MVP），再迭代 |
| 3 | 需求不明确 | 先定义核心功能，非功能需求后续补充 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| 技术选型 | 选择适合项目的技术栈 |
| 架构设计 | 系统的整体结构和组件关系 |
| MVP | 最小可行产品，包含核心功能的最简版本 |
| 分层架构 | 将系统分为多个层次，每层职责单一 |
| API 设计 | 定义系统对外提供的接口规范 |
| 数据模型 | 定义系统中数据的结构和关系 |

## ✅ 验收清单
- [ ] 能用一句话描述项目
- [ ] 有完整的技术选型表
- [ ] 能画出系统架构图
- [ ] 有数据模型设计
- [ ] 有 API 设计
- [ ] 有开发计划和依赖清单

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
