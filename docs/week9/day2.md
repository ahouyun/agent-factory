# 📅 Week 9 Day 2：后端骨架搭建

## 🧭 今日方向
> 搭建项目的后端骨架：FastAPI 应用、数据库连接、SQLAlchemy 数据模型、基础 CRUD API。这是后续所有功能的基础骨架。

## 🎯 生活比喻
> 今天的工作就像"盖房子打地基和立框架"。虽然还看不到漂亮的装修（功能），但坚固的地基（数据库）和钢架（API 路由）是必须的。地基不牢，房子迟早要塌。

## 📋 今日三件事
1. 创建 FastAPI 应用并配置项目结构
2. 定义 SQLAlchemy 数据模型（User / Document / Conversation / Message）
3. 实现基础 CRUD API 路由并验证可用

---

## 🗺️ 手把手路线

### Step 1: 项目初始化
- **做什么:** 创建项目目录、安装依赖、配置环境变量
- **为什么:** 标准化的项目结构便于团队协作和维护
- **成功标志:** 能成功创建虚拟环境并安装所有依赖

### Step 2: 数据库与数据模型
- **做什么:** 配置 SQLAlchemy、定义 ORM 模型、创建数据库表
- **为什么:** 数据模型是所有业务逻辑的基础
- **成功标志:** 模型能正常创建表、插入数据、查询数据

### Step 3: API 路由框架
- **做什么:** 实现 FastAPI 路由、注册到主应用、验证可用
- **为什么:** API 是前后端交互的桥梁
- **成功标志:** 所有 API 能通过 Swagger UI 正常调用

---

## 💻 代码区

### 完整可运行代码：后端骨架搭建

```python
"""
Week 9 Day 2: 后端骨架搭建
运行方式: python day2_backend_skeleton.py

注意: 本脚本使用 SQLite 内存数据库，无需额外安装数据库。
实际项目中请替换为 PostgreSQL。
"""

import sqlite3
import json
from datetime import datetime
from typing import Optional, List
from dataclasses import dataclass, field, asdict
from enum import Enum


# =============================================
# 1. 项目结构说明
# =============================================
print("=" * 60)
print("=== 1. 项目目录结构 ===")
print("=" * 60)

project_structure = """
  ai-knowledge-assistant/
  ├── app/
  │   ├── __init__.py
  │   ├── main.py                  # FastAPI 应用入口
  │   ├── config.py                # 配置管理
  │   ├── database.py              # 数据库连接
  │   ├── models/                  # SQLAlchemy 数据模型
  │   │   ├── __init__.py
  │   │   ├── user.py
  │   │   ├── document.py
  │   │   └── conversation.py
  │   ├── schemas/                 # Pydantic 请求/响应模型
  │   ├── api/                     # API 路由
  │   │   ├── __init__.py
  │   │   ├── auth.py
  │   │   ├── documents.py
  │   │   └── chat.py
  │   ├── services/                # 业务逻辑层
  │   └── utils/                   # 工具函数
  ├── requirements.txt
  ├── .env.example
  └── README.md
"""
print(project_structure)


# =============================================
# 2. 配置管理 (模拟 Pydantic Settings)
# =============================================
print("=" * 60)
print("=== 2. 配置管理 ===")
print("=" * 60)

@dataclass
class Settings:
    """应用配置 - 实际项目使用 pydantic-settings"""
    APP_NAME: str = "AI 知识库助手"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # 数据库
    DATABASE_URL: str = "sqlite:///./data/ai_knowledge.db"

    # LLM 配置
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    EMBEDDING_MODEL: str = "text-embedding-3-small"

    # 向量数据库
    CHROMA_PERSIST_DIR: str = "./data/chroma_db"
    CHROMA_COLLECTION: str = "documents"

    # JWT 认证
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # RAG 配置
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    TOP_K_RESULTS: int = 3

    # 限流
    RATE_LIMIT_PER_MINUTE: int = 60


settings = Settings()
print(f"  应用名称: {settings.APP_NAME}")
print(f"  版本: {settings.APP_VERSION}")
print(f"  数据库: {settings.DATABASE_URL}")
print(f"  LLM 模型: {settings.OPENAI_MODEL}")
print(f"  Embedding: {settings.EMBEDDING_MODEL}")


# =============================================
# 3. 数据库设置 (SQLite 演示)
# =============================================
print("\n" + "=" * 60)
print("=== 3. 数据库设置 (SQLite 演示) ===")
print("=" * 60)

# 创建 SQLite 内存数据库（演示用）
conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print("  数据库连接成功: SQLite 内存数据库")
print("  注意: 生产环境请使用 PostgreSQL")


# =============================================
# 4. 数据模型定义 (SQLAlchemy 风格)
# =============================================
print("\n" + "=" * 60)
print("=== 4. 数据模型定义 ===")
print("=" * 60)

# --- 创建 User 表 ---
cursor.execute("""
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")
print("  [OK] users 表创建成功")

# --- 创建 Document 表 ---
cursor.execute("""
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER DEFAULT 0,
    content_type TEXT DEFAULT 'text/plain',
    chunk_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
""")
print("  [OK] documents 表创建成功")

# --- 创建 Conversation 表 ---
cursor.execute("""
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
""")
print("  [OK] conversations 表创建成功")

# --- 创建 Message 表 ---
cursor.execute("""
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    sources TEXT DEFAULT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
)
""")
print("  [OK] messages 表创建成功")

conn.commit()

# 打印数据模型说明
model_info = """
  数据模型说明:

  User (用户表):
    id         TEXT PK    用户唯一标识 (UUID)
    email      TEXT UNIQ  邮箱地址
    name       TEXT       用户名称
    password_hash TEXT    密码哈希值
    role       TEXT       角色 (admin/user)
    created_at TEXT       创建时间

  Document (文档表):
    id         TEXT PK    文档唯一标识 (UUID)
    user_id    TEXT FK    所属用户
    filename   TEXT       文件名
    file_path  TEXT       存储路径
    file_size  INTEGER    文件大小 (bytes)
    content_type TEXT     内容类型
    chunk_count INTEGER   分块数量
    status     TEXT       状态 (pending/processed/error)
    created_at TEXT       创建时间

  Conversation (对话表):
    id         TEXT PK    对话唯一标识 (UUID)
    user_id    TEXT FK    所属用户
    title      TEXT       对话标题
    created_at TEXT       创建时间
    updated_at TEXT       更新时间

  Message (消息表):
    id              TEXT PK    消息唯一标识 (UUID)
    conversation_id TEXT FK    所属对话
    role            TEXT       角色 (user/assistant)
    content         TEXT       消息内容
    sources         TEXT       引用来源 (JSON)
    created_at      TEXT       创建时间
"""
print(model_info)


# =============================================
# 5. 基础 CRUD 操作
# =============================================
print("=" * 60)
print("=== 5. 基础 CRUD 操作演示 ===")
print("=" * 60)

import uuid

# --- 创建 (Create) ---
print("\n--- 创建数据 ---")

# 创建用户
user_id = str(uuid.uuid4())
cursor.execute(
    "INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
    (user_id, "zhang@example.com", "张三", "hashed_password_123", "admin")
)
print(f"  [CREATE] 用户创建成功: 张三 (ID: {user_id[:8]}...)")

# 创建文档
doc_id = str(uuid.uuid4())
cursor.execute(
    "INSERT INTO documents (id, user_id, filename, file_path, file_size, content_type, chunk_count, status) "
    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    (doc_id, user_id, "产品说明书.pdf", "/data/raw/产品说明书.pdf", 1024000, "application/pdf", 45, "processed")
)
print(f"  [CREATE] 文档创建成功: 产品说明书.pdf (ID: {doc_id[:8]}...)")

# 创建对话
conv_id = str(uuid.uuid4())
cursor.execute(
    "INSERT INTO conversations (id, user_id, title) VALUES (?, ?, ?)",
    (conv_id, user_id, "关于产品功能的咨询")
)
print(f"  [CREATE] 对话创建成功: 关于产品功能的咨询 (ID: {conv_id[:8]}...)")

# 创建消息
msg_id = str(uuid.uuid4())
cursor.execute(
    "INSERT INTO messages (id, conversation_id, role, content, sources) VALUES (?, ?, ?, ?, ?)",
    (msg_id, conv_id, "user", "这个产品有哪些核心功能？", None)
)
print(f"  [CREATE] 消息创建成功: 用户提问 (ID: {msg_id[:8]}...)")

# 助手回复
reply_id = str(uuid.uuid4())
sources = json.dumps([{"doc_id": doc_id, "chunk_index": 3, "score": 0.92}])
cursor.execute(
    "INSERT INTO messages (id, conversation_id, role, content, sources) VALUES (?, ?, ?, ?, ?)",
    (reply_id, conv_id, "assistant", "根据文档内容，该产品具有以下核心功能：...", sources)
)
print(f"  [CREATE] 消息创建成功: 助手回复 (ID: {reply_id[:8]}...)")

conn.commit()

# --- 读取 (Read) ---
print("\n--- 读取数据 ---")

# 查询用户
cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
user = dict(cursor.fetchone())
print(f"  [READ] 用户: {user['name']} ({user['email']})")

# 查询文档列表
cursor.execute("SELECT * FROM documents WHERE user_id = ?", (user_id,))
docs = [dict(row) for row in cursor.fetchall()]
print(f"  [READ] 文档列表: {len(docs)} 个")
for doc in docs:
    print(f"    - {doc['filename']} ({doc['status']}, {doc['chunk_count']} chunks)")

# 查询对话消息
cursor.execute("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at", (conv_id,))
messages = [dict(row) for row in cursor.fetchall()]
print(f"  [READ] 对话消息: {len(messages)} 条")
for msg in messages:
    role_label = "用户" if msg["role"] == "user" else "助手"
    print(f"    [{role_label}] {msg['content'][:50]}...")

# --- 更新 (Update) ---
print("\n--- 更新数据 ---")

cursor.execute(
    "UPDATE documents SET chunk_count = ?, status = ? WHERE id = ?",
    (52, "processed", doc_id)
)
conn.commit()
print(f"  [UPDATE] 文档 chunk_count 更新为 52")

# --- 删除 (Delete) ---
print("\n--- 删除数据 ---")

cursor.execute("DELETE FROM messages WHERE id = ?", (reply_id,))
conn.commit()
print(f"  [DELETE] 助手回复消息已删除")


# =============================================
# 6. FastAPI 应用入口 (模板代码)
# =============================================
print("\n" + "=" * 60)
print("=== 6. FastAPI 应用入口 (app/main.py 模板) ===")
print("=" * 60)

main_py_template = '''
# app/main.py
"""
AI 知识库助手 - FastAPI 应用入口
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import auth, documents, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} 启动中...")
    # 初始化数据库、向量存储等资源
    yield
    # 清理资源
    print("🛑 应用关闭")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["文档管理"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["知识问答"])


@app.get("/health", tags=["系统"])
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
'''
print(main_py_template)


# =============================================
# 7. API 路由模板
# =============================================
print("=" * 60)
print("=== 7. API 路由模板 (app/api/documents.py) ===")
print("=" * 60)

documents_api_template = '''
# app/api/documents.py
"""
文档管理 API 路由
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from typing import List

router = APIRouter()

# 模拟数据存储（实际使用数据库）
documents_db = {}


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """上传文档"""
    # 读取文件内容
    content = await file.read()
    file_size = len(content)

    # 验证文件大小
    if file_size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="文件大小超过 10MB 限制")

    # 验证文件类型
    allowed_types = [".pdf", ".docx", ".md", ".txt"]
    if not any(file.filename.endswith(ext) for ext in allowed_types):
        raise HTTPException(status_code=400, detail=f"不支持的文件类型，支持: {allowed_types}")

    # 保存文档记录
    doc_id = f"doc_{len(documents_db) + 1}"
    documents_db[doc_id] = {
        "id": doc_id,
        "filename": file.filename,
        "file_size": file_size,
        "content_type": file.content_type,
        "status": "uploaded",
    }

    return {
        "id": doc_id,
        "filename": file.filename,
        "file_size": file_size,
        "status": "uploaded",
        "message": "文档上传成功，等待处理",
    }


@router.get("")
async def list_documents():
    """获取文档列表"""
    return {"documents": list(documents_db.values())}


@router.get("/{doc_id}")
async def get_document(doc_id: str):
    """获取文档详情"""
    if doc_id not in documents_db:
        raise HTTPException(status_code=404, detail="文档不存在")
    return documents_db[doc_id]


@router.delete("/{doc_id}")
async def delete_document(doc_id: str):
    """删除文档"""
    if doc_id not in documents_db:
        raise HTTPException(status_code=404, detail="文档不存在")
    del documents_db[doc_id]
    return {"message": "删除成功"}
'''
print(documents_api_template)


# =============================================
# 8. 启动命令
# =============================================
print("\n" + "=" * 60)
print("=== 8. 启动命令 ===")
print("=" * 60)

startup_commands = """
  # 安装依赖
  pip install fastapi uvicorn[standard] python-multipart sqlalchemy python-dotenv

  # 开发模式启动（带热重载）
  cd ai-knowledge-assistant
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

  # 生产模式启动
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

  # 访问 API 文档
  http://localhost:8000/docs          # Swagger UI
  http://localhost:8000/redoc         # ReDoc 文档

  # 健康检查
  curl http://localhost:8000/health
"""
print(startup_commands)


# =============================================
# 总结
# =============================================
print("=" * 60)
print("✅ Day 2 完成清单")
print("=" * 60)
print("""
  [x] 项目目录结构创建完成
  [x] 配置管理系统搭建完成
  [x] 数据库模型定义完成 (User/Document/Conversation/Message)
  [x] CRUD 操作验证通过
  [x] FastAPI 应用入口模板准备
  [x] API 路由模板准备

  明天预告: Day 3 将集成 RAG 检索服务，实现文档解析、
  向量化存储和语义检索的完整流程。
""")
```

---

## 📤 预期输出

运行 `python day2_backend_skeleton.py` 后，你将看到：

```
============================================================
=== 1. 项目目录结构 ===
============================================================

  ai-knowledge-assistant/
  ├── app/
  │   ├── __init__.py
  │   ├── main.py                  # FastAPI 应用入口
  ...

============================================================
=== 2. 配置管理 ===
============================================================
  应用名称: AI 知识库助手
  版本: 0.1.0
  数据库: sqlite:///./data/ai_knowledge.db
  LLM 模型: gpt-4o-mini
  Embedding: text-embedding-3-small

============================================================
=== 3. 数据库设置 (SQLite 演示) ===
============================================================
  数据库连接成功: SQLite 内存数据库

============================================================
=== 4. 数据模型定义 ===
============================================================
  [OK] users 表创建成功
  [OK] documents 表创建成功
  [OK] conversations 表创建成功
  [OK] messages 表创建成功

============================================================
=== 5. 基础 CRUD 操作演示 ===
============================================================

--- 创建数据 ---
  [CREATE] 用户创建成功: 张三 (ID: a1b2c3d4...)
  [CREATE] 文档创建成功: 产品说明书.pdf (ID: e5f6a7b8...)
  ...

--- 读取数据 ---
  [READ] 用户: 张三 (zhang@example.com)
  [READ] 文档列表: 1 个
    - 产品说明书.pdf (processed, 45 chunks)
  ...
```

---

## ⚠️ 常见错误与解决方案

### 错误 1：`ModuleNotFoundError: No module named 'fastapi'`

```
ModuleNotFoundError: No module named 'fastapi'
```

**原因:** 未安装 FastAPI 或未激活虚拟环境。

**解决方案:**
```bash
# 激活虚拟环境
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 安装依赖
pip install fastapi uvicorn[standard] python-multipart
```

### 错误 2：`sqlite3.OperationalError: table already exists`

```
sqlite3.OperationalError: table users already exists
```

**原因:** 重复创建已存在的表。

**解决方案:**
```sql
-- 使用 IF NOT EXISTS
CREATE TABLE IF NOT EXISTS users (...)
```

### 错误 3：`pydantic_settings` 导入错误

```
ImportError: cannot import name 'BaseSettings' from 'pydantic'
```

**原因:** pydantic v2 将 BaseSettings 移到了独立包。

**解决方案:**
```bash
pip install pydantic-settings
# 或
pip install "pydantic[dotenv]"
```

### 错误 4：端口 8000 被占用

```
ERROR: [Errno 10048] 通常每个套接字地址只允许使用一次
```

**解决方案:**
```bash
# 查找占用端口的进程 (Windows)
netstat -ano | findstr :8000

# 使用其他端口
uvicorn app.main:app --port 8001
```

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| FastAPI | 高性能 Python Web 框架，自动生成 API 文档 |
| SQLAlchemy | Python ORM，将数据库表映射为 Python 类 |
| Pydantic | 数据验证库，基于 Python 类型注解 |
| CRUD | Create / Read / Update / Delete 四种基本操作 |
| ORM | 对象关系映射，用 Python 代码操作数据库 |
| Alembic | SQLAlchemy 的数据库迁移工具 |
| uvicorn | ASGI 服务器，用于运行 FastAPI 应用 |
| lifespan | FastAPI 的应用生命周期管理机制 |

---

## 🏆 每日挑战

### 挑战 1：基础（必做）
1. 按照模板创建完整的项目目录结构
2. 在虚拟环境中安装所有依赖
3. 使用 SQLite 演示代码验证 CRUD 操作

### 挑战 2：进阶（推荐）
1. 安装 Alembic 并初始化数据库迁移
2. 编写 `app/config.py`，使用 pydantic-settings 管理配置
3. 编写 `app/database.py`，配置 SQLAlchemy 异步连接

### 挑战 3：挑战（可选）
使用 FastAPI 创建一个完整的文档管理 API，包含：
- 文件上传（支持 PDF/MD/TXT）
- 文档列表查询
- 文档详情查询
- 文档删除

然后用 `curl` 或 Postman 测试所有接口。

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
