# Day 1: FastAPI 入门 - 构建你的第一个 API

## 今日学习目标

1. 理解 FastAPI 框架的核心优势
2. 安装并配置 FastAPI 开发环境
3. 创建第一个 API 端点
4. 理解 Pydantic 模型的概念和用法
5. 运行服务器并在浏览器/curl 中测试
6. 掌握 FastAPI 自动文档功能

---

## 第一部分：为什么选择 FastAPI？

### 传统框架 vs FastAPI

```
性能对比（请求/秒）：

Flask:     ████████████  ~5,000 req/s
Django:    ████████      ~3,000 req/s
FastAPI:   ████████████████████  ~15,000+ req/s
```

### FastAPI 的核心优势

| 特性 | 说明 | 实际好处 |
|------|------|----------|
| 高性能 | 基于 Starlette 和 Pydantic | 接近 Node.js 的性能 |
| 自动生成文档 | 内置 Swagger UI 和 ReDoc | 无需额外编写 API 文档 |
| 类型安全 | 使用 Python 类型注解 | IDE 自动补全，减少错误 |
| 异步支持 | 原生支持 async/await | 高并发场景性能优异 |
| 数据验证 | Pydantic 自动验证 | 减少大量样板代码 |

---

## 第二部分：环境准备与安装

### 步骤 1：创建项目目录

```bash
# 创建项目文件夹
mkdir agent-factory-api
cd agent-factory-api

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 步骤 2：安装 FastAPI

```bash
# 安装 FastAPI 和 uvicorn（ASGI 服务器）
pip install fastapi uvicorn[standard]

# 验证安装
pip list | grep -i "fastapi\|uvicorn"
```

**预期输出：**
```
fastapi                    0.104.1
uvicorn                    0.24.0
```

### 步骤 3：创建项目结构

```bash
# 创建目录结构
mkdir -p app/routers app/models app/schemas
touch app/__init__.py
touch app/main.py
touch app/routers/__init__.py
touch app/models/__init__.py
touch app/schemas/__init__.py
```

最终项目结构：
```
agent-factory-api/
├── venv/
├── app/
│   ├── __init__.py
│   ├── main.py          # 主应用文件
│   ├── routers/
│   │   └── __init__.py
│   ├── models/
│   │   └── __init__.py
│   └── schemas/
│       └── __init__.py
└── requirements.txt
```

---

## 第三部分：创建第一个 API

### 文件：app/main.py（完整代码）

```python
"""
Agent Factory API - 第一个 FastAPI 应用
"""

from fastapi import FastAPI
from datetime import datetime

# 创建 FastAPI 应用实例
app = FastAPI(
    title="Agent Factory API",
    description="智能体工厂的后端 API 服务",
    version="0.1.0"
)


# 定义根路由
@app.get("/")
async def root():
    """根端点 - 返回欢迎信息"""
    return {
        "message": "欢迎来到 Agent Factory API",
        "version": "0.1.0",
        "timestamp": datetime.now().isoformat()
    }


# 带路径参数的路由
@app.get("/hello/{name}")
async def say_hello(name: str):
    """打招呼端点 - 接受名字参数"""
    return {
        "message": f"你好, {name}!",
        "timestamp": datetime.now().isoformat()
    }


# 带查询参数的路由
@app.get("/items/")
async def read_items(skip: int = 0, limit: int = 10):
    """查询参数示例"""
    items = [
        {"id": i, "name": f"项目 {i}"} 
        for i in range(skip, skip + limit)
    ]
    return {
        "items": items,
        "total": len(items),
        "skip": skip,
        "limit": limit
    }


# 启动命令：uvicorn app.main:app --reload
```

### 运行服务器

```bash
# 在项目根目录执行
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**预期输出：**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345]
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 测试端点

**方法 1：使用 curl**

```bash
# 测试根端点
curl http://localhost:8000/
```

**预期输出：**
```json
{
  "message": "欢迎来到 Agent Factory API",
  "version": "0.1.0",
  "timestamp": "2024-01-15T10:30:00.000000"
}
```

```bash
# 测试打招呼端点
curl http://localhost:8000/hello/小明
```

**预期输出：**
```json
{
  "message": "你好, 小明!",
  "timestamp": "2024-01-15T10:30:05.000000"
}
```

```bash
# 测试查询参数
curl "http://localhost:8000/items/?skip=0&limit=5"
```

**预期输出：**
```json
{
  "items": [
    {"id": 0, "name": "项目 0"},
    {"id": 1, "name": "项目 1"},
    {"id": 2, "name": "项目 2"},
    {"id": 3, "name": "项目 3"},
    {"id": 4, "name": "项目 4"}
  ],
  "total": 5,
  "skip": 0,
  "limit": 5
}
```

**方法 2：使用浏览器**

直接访问：`http://localhost:8000/docs`

你将看到自动生成的 Swagger UI 文档，可以直接在浏览器中测试所有端点。

---

## 第四部分：Pydantic 模型详解

### 什么是 Pydantic？

**类比理解：**
把 Pydantic 想象成一个严格的门卫。当你传递数据时，门卫会检查：
- 数据类型是否正确？
- 必填字段是否都有？
- 数据格式是否符合要求？

如果全部通过，数据才能进入你的应用。

### 安装 Pydantic

```bash
# FastAPI 已经包含 Pydantic，但可以单独安装最新版
pip install pydantic
```

### 基础 Pydantic 模型

创建文件 `app/schemas/user.py`：

```python
"""
Pydantic 模型示例
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# 枚举类型
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"


# 基础用户模型
class UserBase(BaseModel):
    """用户基础字段"""
    username: str = Field(
        ..., 
        min_length=3, 
        max_length=50,
        description="用户名，3-50个字符",
        examples=["john_doe"]
    )
    email: str = Field(
        ..., 
        description="邮箱地址",
        examples=["john@example.com"]
    )
    full_name: Optional[str] = Field(
        None, 
        max_length=100,
        description="全名",
        examples=["John Doe"]
    )


# 创建用户请求模型
class UserCreate(UserBase):
    """创建用户时的请求体"""
    password: str = Field(
        ..., 
        min_length=8,
        description="密码，至少8位",
        examples=["securepassword123"]
    )
    role: UserRole = Field(
        default=UserRole.USER,
        description="用户角色"
    )


# 响应模型（不包含敏感信息）
class UserResponse(UserBase):
    """返回给客户端的用户信息"""
    id: int = Field(..., description="用户ID")
    created_at: datetime = Field(..., description="创建时间")
    is_active: bool = Field(default=True, description="是否激活")

    class Config:
        # 允许从 ORM 对象读取数据
        from_attributes = True


# 更新用户请求模型
class UserUpdate(BaseModel):
    """更新用户时的请求体（所有字段可选）"""
    email: Optional[str] = Field(None, description="邮箱地址")
    full_name: Optional[str] = Field(None, description="全名")
    password: Optional[str] = Field(None, min_length=8, description="新密码")


# 登录请求模型
class LoginRequest(BaseModel):
    """登录请求体"""
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


# 登录响应模型
class LoginResponse(BaseModel):
    """登录响应体"""
    access_token: str = Field(..., description="访问令牌")
    token_type: str = Field(default="bearer", description="令牌类型")
    expires_in: int = Field(..., description="过期时间（秒）")
```

### 在 API 中使用 Pydantic 模型

更新 `app/main.py`：

```python
"""
Agent Factory API - 使用 Pydantic 模型
"""

from fastapi import FastAPI, HTTPException, status
from datetime import datetime
from typing import List

# 导入我们定义的模型
from app.schemas.user import (
    UserCreate, 
    UserResponse, 
    UserUpdate,
    LoginRequest,
    LoginResponse
)

app = FastAPI(
    title="Agent Factory API",
    description="智能体工厂的后端 API 服务",
    version="0.1.0"
)

# 模拟数据库
fake_users_db = {}
user_id_counter = 1


@app.get("/")
async def root():
    """根端点"""
    return {"message": "欢迎来到 Agent Factory API"}


@app.post("/users/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    """
    创建新用户
    
    - **username**: 用户名（3-50字符）
    - **email**: 邮箱地址
    - **password**: 密码（至少8位）
    - **role**: 用户角色（admin/user/guest）
    """
    global user_id_counter
    
    # 检查用户名是否已存在
    for existing_user in fake_users_db.values():
        if existing_user["username"] == user.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已存在"
            )
    
    # 创建新用户
    new_user = {
        "id": user_id_counter,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "created_at": datetime.now(),
        "is_active": True
    }
    
    fake_users_db[user_id_counter] = new_user
    user_id_counter += 1
    
    return new_user


@app.get("/users/", response_model=List[UserResponse])
async def list_users(skip: int = 0, limit: int = 10):
    """获取用户列表"""
    users = list(fake_users_db.values())
    return users[skip:skip + limit]


@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """根据ID获取用户"""
    if user_id not in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户ID {user_id} 不存在"
        )
    return fake_users_db[user_id]


@app.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_update: UserUpdate):
    """更新用户信息"""
    if user_id not in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户ID {user_id} 不存在"
        )
    
    # 获取现有用户数据
    user_data = fake_users_db[user_id]
    
    # 只更新提供的字段
    update_data = user_update.model_dump(exclude_unset=True)
    user_data.update(update_data)
    
    return user_data


@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int):
    """删除用户"""
    if user_id not in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户ID {user_id} 不存在"
        )
    
    del fake_users_db[user_id]
    return None


@app.post("/login/", response_model=LoginResponse)
async def login(request: LoginRequest):
    """用户登录"""
    # 简单验证（实际项目应使用数据库和密码哈希）
    for user in fake_users_db.values():
        if user["username"] == request.username:
            return LoginResponse(
                access_token="fake_token_123456789",
                token_type="bearer",
                expires_in=3600
            )
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="用户名或密码错误"
    )
```

### 测试 Pydantic 验证

```bash
# 测试创建用户 - 正常情况
curl -X POST http://localhost:8000/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "password": "securepassword123",
    "role": "user"
  }'
```

**预期输出：**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "role": "user",
  "created_at": "2024-01-15T10:35:00.000000",
  "is_active": true
}
```

```bash
# 测试创建用户 - 密码太短（会触发验证错误）
curl -X POST http://localhost:8000/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane_doe",
    "email": "jane@example.com",
    "password": "123"
  }'
```

**预期输出（验证错误）：**
```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "password"],
      "msg": "String should have at least 8 characters",
      "input": "123",
      "min_length": 8
    }
  ]
}
```

---

## 第五部分：常见错误与解决方案

### 错误 1：ImportError

```
ImportError: cannot import name 'FastAPI' from 'fastapi'
```

**解决方案：**
```bash
# 重新安装 FastAPI
pip uninstall fastapi
pip install fastapi[all]
```

### 错误 2：Address already in use

```
OSError: [Errno 98] Address already in use
```

**解决方案：**
```bash
# 查找占用端口的进程（Windows）
netstat -ano | findstr :8000

# 终止进程（替换 PID）
taskkill /PID <PID> /F

# 或者使用其他端口
uvicorn app.main:app --port 8001
```

### 错误 3：Pydantic 验证错误

```
ValidationError: 1 validation error for UserCreate
```

**解决方案：**
检查请求体是否符合模型定义，确保：
- 必填字段都已提供
- 字段类型正确
- 满足约束条件（如最小长度）

---

## 第六部分：FastAPI 自动文档

### Swagger UI（推荐）

访问：`http://localhost:8000/docs`

功能：
- 查看所有端点
- 查看请求/响应模型
- 直接在浏览器中测试 API
- 查看验证错误详情

### ReDoc

访问：`http://localhost:8000/redoc`

功能：
- 更详细的 API 文档
- 支持导出 OpenAPI 规范
- 适合分享给前端开发者

---

## 第七部分：实战练习

### 练习 1：创建书籍管理 API

创建文件 `app/schemas/book.py`：

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class BookCategory(str, Enum):
    TECH = "技术"
    SCIENCE = "科学"
    LITERATURE = "文学"
    HISTORY = "历史"


class BookCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="书名")
    author: str = Field(..., min_length=1, max_length=100, description="作者")
    category: BookCategory = Field(..., description="分类")
    price: float = Field(..., gt=0, description="价格（大于0）")
    pages: int = Field(..., gt=0, description="页数")
    description: Optional[str] = Field(None, max_length=1000, description="简介")


class BookResponse(BookCreate):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
```

在 `app/main.py` 中添加：

```python
from app.schemas.book import BookCreate, BookResponse

# 模拟书籍数据库
fake_books_db = {}
book_id_counter = 1


@app.post("/books/", response_model=BookResponse, status_code=201)
async def create_book(book: BookCreate):
    """创建新书籍"""
    global book_id_counter
    
    new_book = {
        "id": book_id_counter,
        **book.model_dump(),
        "created_at": datetime.now()
    }
    
    fake_books_db[book_id_counter] = new_book
    book_id_counter += 1
    
    return new_book


@app.get("/books/", response_model=List[BookResponse])
async def list_books(
    category: Optional[BookCategory] = None,
    min_price: float = 0,
    max_price: float = float('inf')
):
    """获取书籍列表，支持筛选"""
    books = list(fake_books_db.values())
    
    # 按分类筛选
    if category:
        books = [b for b in books if b["category"] == category]
    
    # 按价格筛选
    books = [b for b in books if min_price <= b["price"] <= max_price]
    
    return books
```

### 练习 2：创建待办事项 API

创建文件 `app/schemas/todo.py`：

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class TodoPriority(str, Enum):
    LOW = "低"
    MEDIUM = "中"
    HIGH = "高"


class TodoStatus(str, Enum):
    PENDING = "待完成"
    IN_PROGRESS = "进行中"
    COMPLETED = "已完成"


class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="任务标题")
    description: Optional[str] = Field(None, max_length=1000, description="任务描述")
    priority: TodoPriority = Field(default=TodoPriority.MEDIUM, description="优先级")
    due_date: Optional[datetime] = Field(None, description="截止日期")


class TodoResponse(TodoCreate):
    id: int
    status: TodoStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[TodoPriority] = None
    status: Optional[TodoStatus] = None
    due_date: Optional[datetime] = None
```

---

## 验证清单

完成今日学习后，检查以下项目：

- [ ] FastAPI 安装成功（`pip list` 可以看到）
- [ ] 服务器可以正常启动（`uvicorn app.main:app --reload`）
- [ ] 根端点返回正确响应（`curl http://localhost:8000/`）
- [ ] 路径参数正常工作（`curl http://localhost:8000/hello/测试`）
- [ ] 查询参数正常工作（`curl "http://localhost:8000/items/?skip=0&limit=5"`）
- [ ] Pydantic 模型验证正常（发送错误格式的数据会返回错误）
- [ ] 创建用户的 POST 请求正常工作
- [ ] Swagger UI 文档可以访问（`http://localhost:8000/docs`）
- [ ] 完成了至少一个实战练习

---

## 今日小结

| 概念 | 关键点 |
|------|--------|
| FastAPI | 高性能、自动文档、类型安全 |
| 路由装饰器 | `@app.get()`, `@app.post()` 等 |
| 路径参数 | `{name}` 传递到函数参数 |
| 查询参数 | `?key=value` 自动解析 |
| Pydantic | 数据验证和序列化 |
| HTTPException | 抛出 HTTP 错误 |
| 自动文档 | Swagger UI (`/docs`) 和 ReDoc (`/redoc`) |

---

## 明日预告

明天我们将学习：
- 路由设计最佳实践
- 请求验证的高级技巧
- 错误处理的完整策略
- 完整的 CRUD 操作示例

---

## 参考资源

- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [Pydantic 文档](https://docs.pydantic.dev/)
- [Uvicorn 文档](https://www.uvicorn.org/)
- [HTTP 状态码参考](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
