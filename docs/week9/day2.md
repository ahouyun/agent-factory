# 📅 Week 9 Day 2：后端骨架搭建

## 🧭 今日方向
> 搭建项目的后端骨架：FastAPI 应用、数据库模型、API 路由。这是后续所有功能的基础。

## 🎯 生活比喻
> 今天的工作就像"盖房子打地基"。虽然还看不到漂亮的房子（功能），但坚固的地基（骨架）是必须的。

## 📋 今日三件事
1. 搭建 FastAPI 应用骨架
2. 定义数据库模型
3. 实现基础 CRUD API

## 🗺️ 手把手路线

### Step 1: 项目结构
- 做什么: 创建标准的项目目录结构
- 为什么: 良好的结构便于维护和扩展
- 成功标志: 有一个清晰的项目结构

### Step 2: 数据库模型
- 做什么: 用 SQLAlchemy 定义数据模型
- 为什么: 数据模型是业务逻辑的基础
- 成功标志: 模型能正常创建和查询

### Step 3: API 路由
- 做什么: 实现基础的 CRUD API
- 为什么: API 是前后端交互的桥梁
- 成功标志: API 能正常调用

## 💻 代码区

```python
"""
Week 9 Day 2: 后端骨架搭建
"""

# ========== 1. 项目结构 ==========
print("=== 1. 项目结构 ===")

project_structure = """
agent-factory/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── config.py            # 配置管理
│   ├── database.py          # 数据库连接
│   ├── models/              # 数据模型
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── document.py
│   │   └── conversation.py
│   ├── schemas/             # Pydantic 模型
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── document.py
│   │   └── conversation.py
│   ├── api/                 # API 路由
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── documents.py
│   │   └── conversations.py
│   ├── services/            # 业务逻辑
│   │   ├── __init__.py
│   │   ├── rag_service.py
│   │   └── agent_service.py
│   └── utils/               # 工具函数
│       ├── __init__.py
│       └── helpers.py
├── requirements.txt
├── .env.example
└── README.md
"""
print(project_structure)

# ========== 2. 配置管理 ==========
print("\n=== 2. 配置管理 ===")

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """应用配置"""
    # 应用
    APP_NAME: str = "AI Agent 知识助手"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # 数据库
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/agent_factory"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    EMBEDDING_MODEL: str = "text-embedding-3-small"

    # Chroma
    CHROMA_PERSIST_DIR: str = "./chroma_data"
    CHROMA_COLLECTION: str = "documents"

    # 安全
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

# 使用配置
settings = Settings()
print(f"应用名称: {settings.APP_NAME}")
print(f"数据库: {settings.DATABASE_URL[:30]}...")

# ========== 3. 数据库设置 ==========
print("\n=== 3. 数据库设置 ===")

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 创建数据库引擎
# 注意：实际使用时需要配置真实的数据库 URL
# engine = create_engine(settings.DATABASE_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# 模拟数据库（用于演示）
print("数据库配置:")
print("  引擎: PostgreSQL")
print("  ORM: SQLAlchemy")
print("  迁移: Alembic")

# ========== 4. 数据模型 ==========
print("\n=== 4. 数据模型 ===")

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum

# 枚举类型
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class DocumentType(str, Enum):
    PDF = "pdf"
    DOCX = "docx"
    MD = "md"
    TXT = "txt"

# 用户模型
class UserBase(BaseModel):
    email: str
    name: str
    role: UserRole = UserRole.USER

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: "user_001")
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True

# 文档模型
class DocumentBase(BaseModel):
    name: str
    file_type: DocumentType

class DocumentCreate(DocumentBase):
    content: str

class Document(DocumentBase):
    id: str = Field(default_factory=lambda: "doc_001")
    user_id: str
    chunk_count: int = 0
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True

# 对话模型
class ConversationBase(BaseModel):
    title: str

class ConversationCreate(ConversationBase):
    pass

class Conversation(ConversationBase):
    id: str = Field(default_factory=lambda: "conv_001")
    user_id: str
    message_count: int = 0
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True

# 消息模型
class MessageBase(BaseModel):
    role: str  # user/assistant
    content: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: str = Field(default_factory=lambda: "msg_001")
    conversation_id: str
    sources: Optional[List[dict]] = None
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True

# 打印模型
print("用户模型字段:", list(User.model_fields.keys()))
print("文档模型字段:", list(Document.model_fields.keys()))
print("对话模型字段:", list(Conversation.model_fields.keys()))
print("消息模型字段:", list(Message.model_fields.keys()))

# ========== 5. API 路由 ==========
print("\n=== 5. API 路由 ===")

from fastapi import FastAPI, HTTPException, Depends
from typing import List

# 创建 FastAPI 应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="基于 RAG 的智能问答系统"
)

# 模拟数据存储
users_db = {}
documents_db = {}
conversations_db = {}
messages_db = {}

# 认证路由
@app.post("/api/auth/register", response_model=User)
async def register(user: UserCreate):
    """用户注册"""
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="邮箱已注册")

    new_user = User(
        id=f"user_{len(users_db) + 1}",
        email=user.email,
        name=user.name,
        role=user.role
    )
    users_db[user.email] = new_user
    return new_user

@app.post("/api/auth/login")
async def login(email: str, password: str):
    """用户登录"""
    if email not in users_db:
        raise HTTPException(status_code=401, detail="用户不存在")
    return {"token": "fake_token", "user": users_db[email]}

# 文档路由
@app.post("/api/documents", response_model=Document)
async def create_document(doc: DocumentCreate, user_id: str = "user_001"):
    """上传文档"""
    new_doc = Document(
        id=f"doc_{len(documents_db) + 1}",
        name=doc.name,
        file_type=doc.file_type,
        user_id=user_id
    )
    documents_db[new_doc.id] = new_doc
    return new_doc

@app.get("/api/documents", response_model=List[Document])
async def list_documents(user_id: str = "user_001"):
    """获取文档列表"""
    return [doc for doc in documents_db.values() if doc.user_id == user_id]

@app.get("/api/documents/{doc_id}", response_model=Document)
async def get_document(doc_id: str):
    """获取文档详情"""
    if doc_id not in documents_db:
        raise HTTPException(status_code=404, detail="文档不存在")
    return documents_db[doc_id]

@app.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: str):
    """删除文档"""
    if doc_id not in documents_db:
        raise HTTPException(status_code=404, detail="文档不存在")
    del documents_db[doc_id]
    return {"message": "删除成功"}

# 对话路由
@app.post("/api/conversations", response_model=Conversation)
async def create_conversation(conv: ConversationCreate, user_id: str = "user_001"):
    """创建对话"""
    new_conv = Conversation(
        id=f"conv_{len(conversations_db) + 1}",
        title=conv.title,
        user_id=user_id
    )
    conversations_db[new_conv.id] = new_conv
    return new_conv

@app.get("/api/conversations", response_model=List[Conversation])
async def list_conversations(user_id: str = "user_001"):
    """获取对话列表"""
    return [c for c in conversations_db.values() if c.user_id == user_id]

@app.post("/api/conversations/{conv_id}/messages", response_model=Message)
async def send_message(conv_id: str, msg: MessageCreate):
    """发送消息"""
    if conv_id not in conversations_db:
        raise HTTPException(status_code=404, detail="对话不存在")

    new_msg = Message(
        id=f"msg_{len(messages_db) + 1}",
        conversation_id=conv_id,
        role=msg.role,
        content=msg.content
    )
    messages_db[new_msg.id] = new_msg
    return new_msg

print("API 路由已定义:")
print("  POST   /api/auth/register")
print("  POST   /api/auth/login")
print("  POST   /api/documents")
print("  GET    /api/documents")
print("  GET    /api/documents/{id}")
print("  DELETE /api/documents/{id}")
print("  POST   /api/conversations")
print("  GET    /api/conversations")
print("  POST   /api/conversations/{id}/messages")

# ========== 6. 启动应用 ==========
print("\n=== 6. 启动应用 ===")

print("""
启动命令:

# 开发模式
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生产模式
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# 访问 API 文档
http://localhost:8000/docs
""")

# 测试 API
print("--- API 测试 ---")

# 模拟测试
import asyncio

async def test_api():
    # 注册用户
    user = await register(UserCreate(
        email="test@example.com",
        name="测试用户",
        password="123456"
    ))
    print(f"注册用户: {user.name}")

    # 上传文档
    doc = await create_document(DocumentCreate(
        name="测试文档",
        file_type="md",
        content="这是一个测试文档"
    ))
    print(f"上传文档: {doc.name}")

    # 创建对话
    conv = await create_conversation(ConversationCreate(
        title="测试对话"
    ))
    print(f"创建对话: {conv.title}")

    # 发送消息
    msg = await send_message(conv.id, MessageCreate(
        role="user",
        content="你好"
    ))
    print(f"发送消息: {msg.content}")

# asyncio.run(test_api())

print("""
=== 今日完成 ===

1. 项目结构已创建
2. 配置管理系统已搭建
3. 数据模型已定义
4. 基础 API 已实现
5. 应用可以启动

下一步:
- 连接真实数据库
- 实现 RAG 服务
- 添加认证中间件
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | FastAPI 启动失败 | 检查端口占用，或安装 `uvicorn[standard]` |
| 2 | 数据库连接失败 | 检查 DATABASE_URL 配置 |
| 3 | 模型导入错误 | 检查 __init__.py 是否正确导出 |
| 4 | API 404 | 检查路由路径和函数名 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| FastAPI | 高性能 Python Web 框架，自动生成 API 文档 |
| SQLAlchemy | Python ORM，用于数据库操作 |
| Pydantic | 数据验证库，基于类型注解 |
| CRUD | Create/Read/Update/Delete 四种基本操作 |
| ORM | 对象关系映射，将数据库表映射为 Python 类 |
| Alembic | SQLAlchemy 的数据库迁移工具 |

## ✅ 验收清单
- [ ] 项目结构清晰完整
- [ ] 配置管理系统可用
- [ ] 数据模型定义完整
- [ ] 基础 API 能正常调用
- [ ] 应用能正常启动
- [ ] API 文档能访问

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
