# Phase 1 Week 2：FastAPI 后端开发

> **目标**：掌握 FastAPI 框架的核心概念，能独立开发 RESTful API、集成数据库、实现认证授权。
> **周期**：Week 2，共 7 天

---

## 📅 Day 1：FastAPI 入门——第一个 API

### 🧭 今日方向
安装 FastAPI，理解路由、请求、响应的基本概念，编写并运行第一个 API 服务。

### 🎯 生活比喻
FastAPI 就像一个"餐厅前台"——你告诉它你要什么菜（路由），它把后厨（函数）做好的菜端给你（响应）。

### 📋 今日三件事
1. 安装 FastAPI 和 uvicorn
2. 理解路由、请求、响应的概念
3. 编写并运行第一个 API 服务

---

### 🗺️ 手把手路线

#### 第一步：安装 FastAPI

**做什么**：
```bash
pip install fastapi uvicorn[standard]
```

**为什么**：FastAPI 是 Web 框架，uvicorn 是运行它的服务器。

**成功标志**：`pip show fastapi` 能显示版本信息。

---

#### 第二步：编写第一个 API

**做什么**：运行代码区中的代码，用 uvicorn 启动服务。

**为什么**：亲手写一个能运行的 API，建立信心。

**成功标志**：浏览器打开 `http://127.0.0.1:8000/docs` 能看到交互式文档。

---

#### 第三步：理解自动生成的文档

**做什么**：访问 `/docs`（Swagger UI）和 `/redoc`（ReDoc），体验自动生成的 API 文档。

**为什么**：FastAPI 最大的卖点之一就是自动文档，理解它能大幅提升开发效率。

**成功标志**：能在 Swagger UI 中测试 API 并看到返回结果。

---

### 💻 代码区

```python
# src/main.py —— FastAPI 第一个 API

from fastapi import FastAPI, HTTPException   # FastAPI 核心类和异常
from pydantic import BaseModel               # 数据模型
from datetime import datetime                # 时间模块

# 创建 FastAPI 应用实例
app = FastAPI(
    title="Agent Factory API",
    description="Agent Factory 学习项目的后端 API",
    version="0.1.0",
)

# === 数据模型 ===
class Item(BaseModel):
    """商品数据模型"""
    name: str                                # 商品名称
    price: float                             # 价格
    description: str | None = None           # 可选描述
    in_stock: bool = True                    # 是否有货

class ItemResponse(BaseModel):
    """商品响应模型"""
    id: int                                  # 商品 ID
    name: str
    price: float
    created_at: str

# 内存数据库（后续会替换为真实数据库）
items_db: list[dict] = []

# === 路由定义 ===
@app.get("/")
async def root():
    """根路径 —— 返回欢迎信息"""
    return {
        "message": "欢迎来到 Agent Factory API!",
        "docs": "访问 /docs 查看交互式文档",
    }

@app.get("/items", response_model=list[ItemResponse])
async def get_items():
    """获取所有商品"""
    return items_db

@app.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(item: Item):
    """
    创建新商品
    
    参数:
        item: 商品数据（JSON 格式）
    返回:
        创建成功的商品信息
    """
    new_item = {
        "id": len(items_db) + 1,
        "name": item.name,
        "price": item.price,
        "description": item.description,
        "in_stock": item.in_stock,
        "created_at": datetime.now().isoformat(),
    }
    items_db.append(new_item)
    return new_item

@app.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int):
    """根据 ID 获取单个商品"""
    for item in items_db:
        if item["id"] == item_id:
            return item
    raise HTTPException(status_code=404, detail=f"商品 {item_id} 不存在")

@app.delete("/items/{item_id}", status_code=204)
async def delete_item(item_id: int):
    """删除商品"""
    global items_db
    original_length = len(items_db)
    items_db = [item for item in items_db if item["id"] != item_id]
    if len(items_db) == original_length:
        raise HTTPException(status_code=404, detail=f"商品 {item_id} 不存在")
    return None

# === 启动命令 ===
# uvicorn src.main:app --reload
# 访问 http://127.0.0.1:8000/docs 查看交互式文档
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| `uvicorn` 未找到 | 运行 `pip install uvicorn[standard]` |
| 端口被占用 | 使用 `--port 8001` 指定其他端口 |
| 中文乱码 | Windows 终端运行 `chcp 65001` |
| 422 Unprocessable Entity | 请求体格式不符合模型定义，检查 JSON 结构 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| FastAPI | 现代 Python Web 框架 | "餐厅前台" |
| uvicorn | ASGI 服务器 | "餐厅的厨师长" |
| 路由 | URL 到函数的映射 | "菜单上的菜品编号" |
| 请求 (Request) | 客户端发来的数据 | "顾客点的菜" |
| 响应 (Response) | 服务器返回的数据 | "端上来的菜" |
| 状态码 | HTTP 响应状态 | "服务员的暗号" |
| /docs | 自动生成的 API 文档 | "餐厅的菜单（带图片）" |
| 422 错误 | 请求数据验证失败 | "你点的菜不对" |

---

### ✅ 验收清单

- [ ] FastAPI 和 uvicorn 安装成功
- [ ] 能编写基本的 GET/POST 路由
- [ ] 能用 uvicorn 启动服务
- [ ] 能访问 `/docs` 查看交互式文档
- [ ] 能在 Swagger UI 中测试 API

---

### 📝 复盘小纸条

> **FastAPI 和之前学的 requests 有什么区别？**
>
> 
>
> **路由、请求、响应这三个概念我理解了吗？**
>
> 
>
> **明天我想深入学习什么？**
>
> 

---

### 📥 明日同步接口

- 输入：FastAPI 基础已掌握
- 输出：准备学习 Pydantic 数据验证
- 关键交接物：能运行一个基本的 FastAPI 服务

---

## 📅 Day 2：Pydantic 数据验证进阶

### 🧭 今日方向
深入学习 Pydantic 的高级用法，掌握复杂数据模型的定义和验证。

### 🎯 生活比喻
Pydantic 就像"严格的门卫"——所有数据进来之前都要检查，不符合规矩的一律不让进。

### 📋 今日三件事
1. 掌握 Pydantic 的 Field 配置
2. 学习嵌套模型和模型继承
3. 理解数据序列化和反序列化

---

### 🗺️ 手把手路线

#### 第一步：Field 高级配置

**做什么**：运行代码区中的 Field 示例，理解验证规则、默认值、别名。

**为什么**：Field 是控制数据验证细节的核心工具。

**成功标志**：能用 Field 定义带验证规则的字段。

---

#### 第二步：嵌套模型

**做什么**：理解如何在一个模型中嵌套使用其他模型。

**为什么**：真实数据往往是嵌套的（如用户有多个地址）。

**成功标志**：能定义并验证嵌套的 Pydantic 模型。

---

#### 第三步：模型方法

**做什么**：学习 `model_validator`、`model_dump` 等高级方法。

**为什么**：数据转换和验证是 API 开发的核心需求。

**成功标志**：能用模型方法做数据转换。

---

### 💻 代码区

```python
# src/models.py —— Pydantic 数据模型

from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime
from typing import Optional
from enum import Enum

# === 枚举类型 ===
class TaskStatus(str, Enum):
    """任务状态枚举"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

# === 基础模型 ===
class UserBase(BaseModel):
    """用户基础模型"""
    username: str = Field(
        ...,                                    # ... 表示必填
        min_length=3,
        max_length=50,
        description="用户名（3-50 个字符）",
        examples=["agent_learner"],
    )
    email: str = Field(
        ...,
        pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$',   # 正则验证邮箱格式
        description="邮箱地址",
    )
    age: int = Field(
        ...,
        ge=0,                                   # 大于等于 0
        le=150,                                  # 小于等于 150
        description="年龄",
    )

class UserCreate(UserBase):
    """创建用户的请求模型"""
    password: str = Field(
        ...,
        min_length=8,
        description="密码（至少 8 个字符）",
    )
    
    @field_validator("password")
    @classmethod
    def password_must_contain_digit(cls, v: str) -> str:
        """自定义验证：密码必须包含数字"""
        if not any(c.isdigit() for c in v):
            raise ValueError("密码必须包含至少一个数字")
        return v

class UserResponse(UserBase):
    """用户响应模型"""
    id: int
    created_at: datetime
    is_active: bool = True
    
    model_config = {"from_attributes": True}    # 允许从 ORM 对象创建

# === 嵌套模型 ===
class Address(BaseModel):
    """地址模型"""
    street: str
    city: str
    country: str = "中国"
    postal_code: Optional[str] = None

class UserWithAddress(UserCreate):
    """带地址的用户模型"""
    addresses: list[Address] = Field(
        default_factory=list,
        description="用户地址列表",
    )

# === 复杂验证 ===
class Task(BaseModel):
    """任务模型 —— 展示高级验证"""
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    priority: int = Field(default=1, ge=1, le=5)
    tags: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    
    @field_validator("title")
    @classmethod
    def title_must_be_meaningful(cls, v: str) -> str:
        """标题不能全是空格"""
        if not v.strip():
            raise ValueError("标题不能为空白字符")
        return v.strip()
    
    @model_validator(mode="after")
    def validate_completed_task(self):
        """已完成的任务必须有描述"""
        if self.status == TaskStatus.COMPLETED and not self.description:
            raise ValueError("已完成的任务必须填写描述")
        return self

# === 使用示例 ===
if __name__ == "__main__":
    # 创建用户
    try:
        user_data = {
            "username": "agent_learner",
            "email": "learner@example.com",
            "age": 25,
            "password": "secure123",
        }
        user = UserCreate(**user_data)
        print(f"用户创建成功: {user.username}")
    except Exception as e:
        print(f"验证失败: {e}")
    
    # 创建任务
    task = Task(
        title="学习 FastAPI",
        description="完成 Week 2 的所有学习内容",
        status=TaskStatus.IN_PROGRESS,
        priority=1,
        tags=["学习", "FastAPI"],
    )
    print(f"任务创建成功: {task.title}")
    
    # 模型转字典
    task_dict = task.model_dump()
    print(f"任务字典: {task_dict}")
    
    # JSON 序列化
    task_json = task.model_dump_json(indent=2)
    print(f"任务 JSON:\n{task_json}")
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| `field_validator` 报错 | 确保使用 `@classmethod` 装饰器 |
| 嵌套模型验证失败 | 检查嵌套数据的结构是否符合子模型定义 |
| `model_dump()` 不存在 | Pydantic v2 使用 `model_dump()`，v1 用 `.dict()` |
| 枚举验证失败 | 确保传入的值是枚举成员的值 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| Field | 字段配置 | "给字段贴标签" |
| field_validator | 字段级验证 | "单个字段的质检" |
| model_validator | 模型级验证 | "整体数据的质检" |
| 序列化 | 模型 → 字典/JSON | "打包" |
| 反序列化 | JSON/字典 → 模型 | "拆包" |
| 枚举 (Enum) | 限定值的范围 | "只能选这几个" |
| from_attributes | 从 ORM 对象创建 | "从数据库对象转换" |

---

### ✅ 验收清单

- [ ] 能用 Field 定义带验证规则的字段
- [ ] 能定义嵌套的 Pydantic 模型
- [ ] 能用 field_validator 做自定义验证
- [ ] 能用 model_validator 做跨字段验证
- [ ] 能用 model_dump() 和 model_dump_json() 做数据转换

---

### 📝 复盘小纸条

> **Pydantic 的验证机制解决了什么问题？**
>
> 
>
> **field_validator 和 model_validator 什么时候用哪个？**
>
> 
>
> **明天我想学什么？**
>
> 

---

### 📥 明日同步接口

- 输入：Pydantic 数据验证已掌握
- 输出：准备学习 FastAPI 路由和依赖注入
- 关键交接物：能定义复杂的数据模型并验证

---

## 📅 Day 3：路由系统与依赖注入

### 🧭 今日方向
掌握 FastAPI 的路由系统和依赖注入机制，学会组织复杂的 API 结构。

### 🎯 生活比喻
路由就像"快递分拣中心"——不同地址的包裹（请求）被分到不同的处理线（函数）。依赖注入就像"外包服务"——你不用自己做所有事，需要什么就让系统自动提供。

### 📋 今日三件事
1. 掌握路由组织和分组
2. 学习依赖注入机制
3. 理解中间件的概念

---

### 🗺️ 手把手路线

#### 第一步：路由组织

**做什么**：学习使用 `APIRouter` 将路由拆分到不同模块。

**为什么**：真实项目的路由很多，需要合理组织。

**成功标志**：能用 `APIRouter` 创建模块化的路由。

---

#### 第二步：依赖注入

**做什么**：理解 `Depends` 的用法，学会共享数据库连接、认证等资源。

**为什么**：依赖注入是 FastAPI 的核心特性，让代码更可测试、更可复用。

**成功标志**：能用 Depends 创建可复用的依赖。

---

#### 第三步：中间件

**做什么**：理解中间件的概念，学会添加 CORS、日志等中间件。

**为什么**：中间件能在每个请求前后执行通用逻辑。

**成功标志**：能为 API 添加 CORS 中间件。

---

### 💻 代码区

```python
# src/routes/users.py —— 用户路由模块

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

router = APIRouter(
    prefix="/users",            # 路由前缀
    tags=["用户"],              # 在文档中分组
    responses={404: {"description": "用户不存在"}},
)

# 简化的用户数据库
users_db = {
    1: {"id": 1, "name": "张三", "email": "zhangsan@example.com"},
    2: {"id": 2, "name": "李四", "email": "lisi@example.com"},
}

class UserUpdate(BaseModel):
    """用户更新请求模型"""
    name: str | None = None
    email: str | None = None

# === 路由定义 ===
@router.get("/", summary="获取用户列表")
async def list_users(
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(10, ge=1, le=100, description="返回数量"),
):
    """获取用户列表，支持分页"""
    users = list(users_db.values())
    return {
        "total": len(users),
        "items": users[skip:skip + limit],
    }

@router.get("/{user_id}", summary="获取用户详情")
async def get_user(user_id: int):
    """根据 ID 获取用户详情"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="用户不存在")
    return users_db[user_id]

@router.put("/{user_id}", summary="更新用户")
async def update_user(user_id: int, user_update: UserUpdate):
    """更新用户信息"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    user = users_db[user_id]
    update_data = user_update.model_dump(exclude_unset=True)  # 只获取设置了的字段
    user.update(update_data)
    return user

@router.delete("/{user_id}", status_code=204, summary="删除用户")
async def delete_user(user_id: int):
    """删除用户"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="用户不存在")
    del users_db[user_id]
    return None
```

```python
# src/deps.py —— 依赖注入示例

from fastapi import Depends, Header, HTTPException
from typing import Annotated

# === 简单依赖 ===
async def get_current_timestamp():
    """提供当前时间戳的依赖"""
    from datetime import datetime
    return datetime.now().isoformat()

# === 带参数的依赖 ===
def pagination_params(
    skip: int = Depends(lambda: 0),
    limit: int = Depends(lambda: 10),
):
    """分页参数依赖"""
    return {"skip": skip, "limit": limit}

# === 认证依赖 ===
async def verify_api_key(x_api_key: str = Header(...)):
    """
    验证 API Key 的依赖
    
    从请求头中获取 X-Api-Key 并验证
    """
    valid_keys = {"secret-key-123", "test-key-456"}
    if x_api_key not in valid_keys:
        raise HTTPException(
            status_code=401,
            detail="无效的 API Key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return x_api_key

# === 数据库会话依赖（模拟）===
class FakeDBSession:
    """模拟数据库会话"""
    def __init__(self):
        self.connected = True
    
    def query(self, model):
        return self
    
    def filter(self, *args):
        return self
    
    def all(self):
        return []

async def get_db():
    """数据库会话依赖 —— 每次请求创建新会话"""
    db = FakeDBSession()
    try:
        yield db        # yield 使其成为生成器依赖（请求结束后清理）
    finally:
        db.connected = False  # 清理资源

# === 使用依赖的路由 ===
from fastapi import APIRouter

router = APIRouter(prefix="/demo", tags=["依赖演示"])

@router.get("/timestamp")
async def get_timestamp(timestamp: str = Depends(get_current_timestamp)):
    """使用时间戳依赖"""
    return {"timestamp": timestamp}

@router.get("/protected")
async def protected_route(api_key: str = Depends(verify_api_key)):
    """需要 API Key 的路由"""
    return {"message": "访问成功", "api_key": api_key}

@router.get("/with-db")
async def with_database(db: FakeDBSession = Depends(get_db)):
    """使用数据库会话依赖"""
    return {"connected": db.connected}
```

```python
# src/main_v2.py —— 整合路由的主应用

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import users
from deps import router as demo_router

app = FastAPI(
    title="Agent Factory API v2",
    version="0.2.0",
)

# === 中间件配置 ===
# CORS 中间件 —— 允许跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # 允许所有来源（生产环境应限制）
    allow_credentials=True,
    allow_methods=["*"],           # 允许所有方法
    allow_headers=["*"],           # 允许所有头
)

# === 注册路由 ===
app.include_router(users.router)   # 用户路由
app.include_router(demo_router)    # 依赖演示路由

@app.get("/", tags=["根路径"])
async def root():
    return {"message": "Agent Factory API v2 运行中"}

# === 启动命令 ===
# uvicorn src.main_v2:app --reload
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| 路由冲突 | 检查是否有重复的路径和方法组合 |
| 依赖注入不生效 | 确保使用 `Depends()` 包装依赖函数 |
| CORS 错误 | 添加 CORSMiddleware 中间件 |
| yield 依赖报错 | 确保使用 async for 或在 async 函数中 yield |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| APIRouter | 路由分组工具 | "分拣中心的传送带" |
| prefix | 路由前缀 | "传送带的编号" |
| Depends | 依赖注入 | "需要什么就自动提供" |
| yield 依赖 | 有清理逻辑的依赖 | "用完记得还回去" |
| 中间件 | 请求前后的拦截器 | "门卫检查" |
| CORS | 跨域资源共享 | "允许不同网站访问" |
| Query | 查询参数验证 | "URL 问号后面的参数" |
| Header | 请求头验证 | "信封上的备注" |

---

### ✅ 验收清单

- [ ] 能用 APIRouter 组织路由
- [ ] 能用 Depends 创建依赖
- [ ] 理解 yield 依赖的清理机制
- [ ] 能配置 CORS 中间件
- [ ] 能用 Query 和 Header 验证参数

---

### 📝 复盘小纸条

> **依赖注入解决了什么问题？**
>
> 
>
> **什么时候用 yield 依赖？**
>
> 
>
> **明天我想学什么？**
>
> 

---

### 📥 明日同步接口

- 输入：路由和依赖注入已掌握
- 输出：准备学习数据库 ORM
- 关键交接物：能组织模块化的 FastAPI 项目

---

## 📅 Day 4：SQLAlchemy ORM 数据库操作

### 🧭 今日方向
学习 SQLAlchemy ORM 的使用，实现数据库的增删改查操作。

### 🎯 生活比喻
ORM 就像"翻译官"——你用 Python 对象操作数据，ORM 帮你翻译成 SQL 语句去操作数据库。

### 📋 今日三件事
1. 理解 ORM 的概念和优势
2. 定义 SQLAlchemy 模型
3. 实现 CRUD 操作

---

### 🗺️ 手把手路线

#### 第一步：安装和配置

**做什么**：
```bash
pip install sqlalchemy aiosqlite
```

**为什么**：SQLAlchemy 是 Python 最流行的 ORM，aiosqlite 支持异步操作。

**成功标志**：能导入 SQLAlchemy 并创建数据库引擎。

---

#### 第二步：定义模型

**做什么**：运行代码区中的模型定义，理解 Column、Relationship。

**为什么**：模型定义了数据库表的结构。

**成功标志**：能定义带关系的 SQLAlchemy 模型。

---

#### 第三步：CRUD 操作

**做什么**：实现增删改查操作。

**为什么**：CRUD 是所有数据库操作的基础。

**成功标志**：能完成完整的 CRUD 流程。

---

### 💻 代码区

```python
# src/database.py —— 数据库配置

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator

# 数据库 URL
DATABASE_URL = "sqlite+aiosqlite:///./agent_factory.db"

# 创建异步引擎
engine = create_async_engine(
    DATABASE_URL,
    echo=True,                    # 打印 SQL 语句（调试用）
    future=True,
)

# 创建异步会话工厂
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# 基础模型类
class Base(DeclarativeBase):
    pass

# 依赖：获取数据库会话
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """每次请求创建新的数据库会话"""
    async with async_session() as session:
        try:
            yield session
            await session.commit()     # 提交事务
        except Exception:
            await session.rollback()   # 回滚
            raise
        finally:
            await session.close()      # 关闭会话
```

```python
# src/models_db.py —— SQLAlchemy 数据模型

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)    # 主键
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    
    # 关系：一个用户有多个任务
    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"

class Task(Base):
    """任务表"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="pending")      # pending/in_progress/completed
    priority = Column(Integer, default=1)                # 1-5
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # 外键：关联用户
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # 关系
    owner = relationship("User", back_populates="tasks")
    
    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status}')>"
```

```python
# src/crud.py —— CRUD 操作

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models_db import User, Task
from pydantic import BaseModel

# === Pydantic 模型（用于数据验证）===
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    priority: int = 1

class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: int | None = None

# === 用户 CRUD ===
async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    """创建用户"""
    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=f"hashed_{user_data.password}",  # 实际应使用 bcrypt
    )
    db.add(user)                     # 添加到会话
    await db.flush()                 # 刷新获取 ID
    return user

async def get_user(db: AsyncSession, user_id: int) -> User | None:
    """根据 ID 获取用户"""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    """根据用户名获取用户"""
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()

async def get_users(db: AsyncSession, skip: int = 0, limit: int = 10) -> list[User]:
    """获取用户列表"""
    result = await db.execute(select(User).offset(skip).limit(limit))
    return list(result.scalars().all())

# === 任务 CRUD ===
async def create_task(db: AsyncSession, task_data: TaskCreate, owner_id: int) -> Task:
    """创建任务"""
    task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        owner_id=owner_id,
    )
    db.add(task)
    await db.flush()
    return task

async def get_tasks(db: AsyncSession, owner_id: int) -> list[Task]:
    """获取用户的任务列表"""
    result = await db.execute(
        select(Task).where(Task.owner_id == owner_id)
    )
    return list(result.scalars().all())

async def update_task(db: AsyncSession, task_id: int, task_data: TaskUpdate) -> Task | None:
    """更新任务"""
    task = await db.get(Task, task_id)
    if not task:
        return None
    
    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    
    return task

async def delete_task(db: AsyncSession, task_id: int) -> bool:
    """删除任务"""
    task = await db.get(Task, task_id)
    if not task:
        return False
    
    await db.delete(task)
    return True
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| `sqlalchemy` 安装失败 | 运行 `pip install sqlalchemy aiosqlite` |
| 数据库锁错误 | 检查是否有未提交的事务 |
| 关系查询报错 | 检查 `relationship` 和 `ForeignKey` 配置 |
| `flush` 后 ID 为 None | 确保表有自增主键 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| ORM | 对象关系映射 | "Python 对象 ↔ 数据库表" |
| SQLAlchemy | Python ORM 框架 | "翻译官" |
| Model | 数据库表的 Python 表示 | "表的蓝图" |
| Session | 数据库会话 | "一次对话" |
| CRUD | 增删改查 | "数据库基本操作" |
| Relationship | 表之间的关联 | "表之间的桥梁" |
| ForeignKey | 外键 | "引用其他表的 ID" |
| flush | 刷新到数据库但不提交 | "写草稿" |
| commit | 提交事务 | "定稿" |

---

### ✅ 验收清单

- [ ] 理解 ORM 的概念和优势
- [ ] 能定义 SQLAlchemy 模型
- [ ] 能配置异步数据库会话
- [ ] 能实现完整的 CRUD 操作
- [ ] 理解 relationship 的用法

---

### 📝 复盘小纸条

> **ORM 比直接写 SQL 有什么优势？**
>
> 
>
> **Session、flush、commit 这三个概念我理清了吗？**
>
> 
>
> **明天我想学什么？**
>
> 

---

### 📥 明日同步接口

- 输入：SQLAlchemy ORM 已掌握
- 输出：准备学习 JWT 认证
- 关键交接物：能用 SQLAlchemy 进行数据库操作

---

## 📅 Day 5：JWT 认证与授权

### 🧭 今日方向
实现基于 JWT 的用户认证和授权系统。

### 🎯 生活比喻
JWT 就像"临时通行证"——登录时发给你，之后每次出示通行证就能证明身份，不用每次都重新登录。

### 📋 今日三件事
1. 理解 JWT 的工作原理
2. 实现登录和令牌生成
3. 实现令牌验证中间件

---

### 🗺️ 手把手路线

#### 第一步：理解 JWT

**做什么**：阅读 JWT 的概念说明，理解 Header、Payload、Signature 三部分。

**为什么**：JWT 是现代 Web 认证的主流方案。

**成功标志**：能画出 JWT 的三个组成部分。

---

#### 第二步：实现登录接口

**做什么**：运行代码区中的登录代码，理解密码验证和令牌生成。

**为什么**：登录是认证的入口。

**成功标志**：能成功登录并获取 JWT 令牌。

---

#### 第三步：实现令牌验证

**做什么**：用 Depends 实现依赖注入式的令牌验证。

**为什么**：所有需要认证的路由都要验证令牌。

**成功标志**：未认证的请求被拒绝，认证后的请求正常通过。

---

### 💻 代码区

```python
# src/auth.py —— JWT 认证模块

from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import hashlib
import json
import base64

# === 配置 ===
SECRET_KEY = "your-secret-key-change-in-production"   # 密钥（生产环境要保密）
ALGORITHM = "HS256"                                   # 签名算法
ACCESS_TOKEN_EXPIRE_MINUTES = 30                      # 令牌过期时间（分钟）

# === 数据模型 ===
class TokenData(BaseModel):
    """令牌数据"""
    username: str | None = None
    user_id: int | None = None

class Token(BaseModel):
    """令牌响应"""
    access_token: str
    token_type: str = "bearer"

# === 简化的令牌生成（演示用，实际应使用 PyJWT）===
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    创建访问令牌
    
    参数:
        data: 要编码的数据
        expires_delta: 过期时间增量
    返回:
        JWT 令牌字符串
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire.timestamp()})
    
    # 简化的编码（实际应使用 jwt.encode）
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode()
    payload = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode()
    signature = hashlib.sha256(f"{header}.{payload}.{SECRET_KEY}".encode()).hexdigest()[:32]
    
    return f"{header}.{payload}.{signature}"

def verify_token(token: str) -> TokenData:
    """
    验证令牌
    
    参数:
        token: JWT 令牌字符串
    返回:
        解码后的令牌数据
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise HTTPException(status_code=401, detail="无效的令牌格式")
        
        # 解码 payload
        payload = json.loads(base64.urlsafe_b64decode(parts[1] + "=="))
        
        # 检查过期时间
        if payload.get("exp", 0) < datetime.utcnow().timestamp():
            raise HTTPException(status_code=401, detail="令牌已过期")
        
        return TokenData(
            username=payload.get("sub"),
            user_id=payload.get("user_id"),
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"令牌验证失败: {str(e)}")

# === 认证依赖 ===
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> TokenData:
    """
    获取当前认证用户的依赖
    
    从请求头中提取 Bearer 令牌并验证
    """
    token = credentials.credentials
    token_data = verify_token(token)
    
    if token_data.username is None:
        raise HTTPException(
            status_code=401,
            detail="无效的认证凭证",
        )
    
    return token_data

# === 登录接口 ===
from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["认证"])

# 模拟用户数据库
fake_users_db = {
    "admin": {
        "id": 1,
        "username": "admin",
        "password_hash": hashlib.sha256("admin123".encode()).hexdigest(),
    }
}

class LoginRequest(BaseModel):
    """登录请求"""
    username: str
    password: str

@router.post("/login", response_model=Token)
async def login(request: LoginRequest):
    """
    用户登录
    
    参数:
        username: 用户名
        password: 密码
    返回:
        JWT 令牌
    """
    user = fake_users_db.get(request.username)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="用户名或密码错误",
        )
    
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    if password_hash != user["password_hash"]:
        raise HTTPException(
            status_code=401,
            detail="用户名或密码错误",
        )
    
    # 生成令牌
    access_token = create_access_token(
        data={"sub": user["username"], "user_id": user["id"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    
    return Token(access_token=access_token)

@router.get("/me")
async def read_current_user(current_user: TokenData = Depends(get_current_user)):
    """获取当前用户信息"""
    return {
        "username": current_user.username,
        "user_id": current_user.user_id,
    }
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| 令牌验证总是失败 | 检查令牌格式是否正确，是否包含 "Bearer " 前缀 |
| 令牌过期 | 重新登录获取新令牌 |
| 密码比较失败 | 确保使用相同的哈希算法 |
| `HTTPBearer` 不生效 | 确保在请求头中添加 `Authorization: Bearer <token>` |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| JWT | JSON Web Token | "数字通行证" |
| 认证 (Authentication) | 你是谁？ | "出示身份证" |
| 授权 (Authorization) | 你能做什么？ | "检查权限" |
| Bearer Token | 持有者令牌 | "谁拿到谁就能用" |
| Payload | 令牌负载 | "通行证上的信息" |
| Signature | 签名 | "防伪标记" |
| 过期时间 (exp) | 令牌有效期 | "通行证的有效期" |
| HS256 | HMAC-SHA256 签名算法 | "防伪技术" |

---

### ✅ 验收清单

- [ ] 理解 JWT 的三个组成部分
- [ ] 能生成 JWT 令牌
- [ ] 能验证 JWT 令牌
- [ ] 能实现登录接口
- [ ] 能用 Depends 创建认证依赖

---

### 📝 复盘小纸条

> **JWT 比 Session 认证有什么优势？**
>
> 
>
> **安全性方面有哪些注意事项？**
>
> 
>
> **明天我想学什么？**
>
> 

---

### 📥 明日同步接口

- 输入：JWT 认证已掌握
- 输出：准备学习 WebSocket 实时通信
- 关键交接物：能实现基于 JWT 的认证系统

---

## 📅 Day 6：WebSocket 实时通信

### 🧭 今日方向
学习 WebSocket 的使用，实现实时双向通信。

### 🎯 生活比喻
HTTP 就像"寄信"——一来一回，每次都要重新连接。WebSocket 就像"打电话"——建立连接后可以随时双向通话。

### 📋 今日三件事
1. 理解 WebSocket 和 HTTP 的区别
2. 实现 WebSocket 服务器
3. 实现简单的聊天室功能

---

### 🗺️ 手把手路线

#### 第一步：理解 WebSocket

**做什么**：阅读 WebSocket 的概念说明，理解它的优势和使用场景。

**为什么**：Agent 开发中经常需要实时通信（如流式输出、状态更新）。

**成功标志**：能说出 WebSocket 和 HTTP 的区别。

---

#### 第二步：实现 WebSocket 服务器

**做什么**：运行代码区中的 WebSocket 示例，体验实时通信。

**为什么**：WebSocket 是实现实时功能的基础。

**成功标志**：能建立 WebSocket 连接并收发消息。

---

#### 第三步：实现聊天室

**做什么**：扩展为多用户聊天室。

**为什么**：这是 WebSocket 最经典的应用场景。

**成功标志**：多个客户端能同时通信。

---

### 💻 代码区

```python
# src/websocket_demo.py —— WebSocket 示例

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import json

app = FastAPI(title="WebSocket Demo")

# === HTML 客户端页面 ===
html = """
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket 聊天室</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; }
        #messages { border: 1px solid #ccc; height: 300px; overflow-y: scroll; padding: 10px; margin-bottom: 10px; }
        .message { margin: 5px 0; padding: 5px; background: #f0f0f0; border-radius: 5px; }
        .own { background: #d4edda; }
        input, button { padding: 8px; margin-right: 5px; }
    </style>
</head>
<body>
    <h1>WebSocket 聊天室</h1>
    <div id="messages"></div>
    <input type="text" id="messageText" placeholder="输入消息..." onkeypress="if(event.key==='Enter')sendMessage()">
    <button onclick="sendMessage()">发送</button>
    <button onclick="disconnect()">断开连接</button>

    <script>
        let ws;
        const messagesDiv = document.getElementById('messages');
        
        function connect() {
            ws = new WebSocket(`ws://${window.location.host}/ws`);
            
            ws.onmessage = function(event) {
                const message = document.createElement('div');
                message.className = 'message';
                message.textContent = event.data;
                messagesDiv.appendChild(message);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            };
            
            ws.onclose = function() {
                addMessage('系统: 连接已断开');
            };
            
            addMessage('系统: 已连接到服务器');
        }
        
        function sendMessage() {
            const input = document.getElementById('messageText');
            if (input.value) {
                ws.send(input.value);
                addMessage('我: ' + input.value, true);
                input.value = '';
            }
        }
        
        function addMessage(text, isOwn = false) {
            const message = document.createElement('div');
            message.className = 'message' + (isOwn ? ' own' : '');
            message.textContent = text;
            messagesDiv.appendChild(message);
        }
        
        function disconnect() {
            ws.close();
        }
        
        connect();
    </script>
</body>
</html>
"""

@app.get("/")
async def get():
    """返回聊天室 HTML 页面"""
    return HTMLResponse(html)

# === WebSocket 路由 ===
class ConnectionManager:
    """WebSocket 连接管理器"""
    
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        """接受新连接"""
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        """断开连接"""
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: str):
        """广播消息给所有连接"""
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket 端点
    
    建立连接后，可以实时收发消息
    """
    await manager.connect(websocket)
    try:
        while True:
            # 接收客户端消息
            data = await websocket.receive_text()
            
            # 广播给所有客户端
            await manager.broadcast(f"客户端说: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast("有客户端断开了连接")

# === 启动命令 ===
# uvicorn src.websocket_demo:app --reload
# 访问 http://127.0.0.1:8000 打开聊天室
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| WebSocket 连接失败 | 检查防火墙设置，确保端口开放 |
| 消息收不到 | 检查 WebSocket URL 是否正确（ws:// 或 wss://） |
| 连接频繁断开 | 检查服务器是否有超时设置 |
| 中文消息乱码 | 确保使用 UTF-8 编码 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| WebSocket | 全双工通信协议 | "打电话" |
| HTTP | 半双工通信协议 | "寄信" |
| 全双工 | 双方可同时发送数据 | "同时说话" |
| 连接管理器 | 管理所有 WebSocket 连接 | "电话总机" |
| 广播 | 向所有连接发送消息 | "群发短信" |
| disconnect | 断开连接 | "挂电话" |
| ws:// | WebSocket 协议前缀 | "WebSocket 地址" |

---

### ✅ 验收清单

- [ ] 能说出 WebSocket 和 HTTP 的区别
- [ ] 能建立 WebSocket 连接
- [ ] 能实现简单的 WebSocket 服务器
- [ ] 能实现消息广播
- [ ] 运行了聊天室示例

---

### 📝 复盘小纸条

> **WebSocket 适合什么场景？HTTP 适合什么场景？**
>
> 
>
> **WebSocket 的安全性有哪些注意事项？**
>
> 
>
> **明天我想学什么？**
>
> 

---

### 📥 明日同步接口

- 输入：WebSocket 已掌握
- 输出：准备学习结构化输出
- 关键交接物：能实现 WebSocket 实时通信

---

## 📅 Day 7：结构化输出 + 周复盘

### 🧭 今日方向
学习 FastAPI 的结构化输出方式，并对 Week 2 进行全面复盘。

### 🎯 生活比喻
结构化输出就像"快递包装"——你把数据按照标准格式打包，客户收到后能直接使用。

### 📋 今日三件事
1. 掌握 FastAPI 的多种响应格式
2. 学习 OpenAPI 规范
3. 完成 Week 2 复盘

---

### 🗺️ 手把手路线

#### 第一步：结构化输出

**做什么**：运行代码区中的结构化输出示例，理解 response_model 的作用。

**为什么**：清晰的输出格式让 API 更易用、更安全。

**成功标志**：能用 response_model 控制 API 输出格式。

---

#### 第二步：OpenAPI 规范

**做什么**：访问 `/openapi.json`，理解 FastAPI 自动生成的 API 规范。

**为什么**：OpenAPI 是 API 文档的标准格式，支持多种工具链。

**成功标志**：能看懂 OpenAPI JSON 的基本结构。

---

#### 第三步：周复盘

**做什么**：回顾 Week 2 的所有内容，完成复盘笔记。

**为什么**：巩固知识，为 Week 3 做准备。

**成功标志**：完成一篇完整的周复盘笔记。

---

### 💻 代码区

```python
# src/responses.py —— 结构化输出示例

from fastapi import FastAPI
from fastapi.responses import JSONResponse, HTMLResponse, PlainTextResponse
from pydantic import BaseModel
from typing import Any

app = FastAPI()

# === 响应模型 ===
class Product(BaseModel):
    """商品模型"""
    id: int
    name: str
    price: float
    description: str | None = None

class ProductList(BaseModel):
    """商品列表响应"""
    total: int
    items: list[Product]
    page: int
    page_size: int

class ErrorResponse(BaseModel):
    """错误响应模型"""
    error: str
    detail: str | None = None
    code: int

# === 使用 response_model 控制输出 ===
@app.get(
    "/products",
    response_model=ProductList,
    summary="获取商品列表",
    responses={
        200: {"description": "成功返回商品列表"},
        500: {"model": ErrorResponse, "description": "服务器错误"},
    },
)
async def list_products(page: int = 1, page_size: int = 10):
    """
    获取商品列表
    
    返回格式由 ProductList 模型定义，
    未在模型中定义的字段会被自动过滤
    """
    # 模拟数据
    products = [
        Product(id=1, name="Agent 工具包", price=99.9, description="AI Agent 开发必备"),
        Product(id=2, name="FastAPI 指南", price=49.9),
        Product(id=3, name="Python 进阶", price=79.9, description="深入 Python 内核"),
    ]
    
    return ProductList(
        total=len(products),
        items=products,
        page=page,
        page_size=page_size,
    )

# === 不同响应类型 ===
@app.get("/json")
async def json_response():
    """JSON 响应（默认）"""
    return {"message": "这是 JSON 响应"}

@app.get("/html")
async def html_response():
    """HTML 响应"""
    content = """
    <html>
        <head><title>HTML 响应</title></head>
        <body>
            <h1>这是 HTML 响应</h1>
            <p>FastAPI 可以返回多种格式</p>
        </body>
    </html>
    """
    return HTMLResponse(content=content)

@app.get("/text")
async def text_response():
    """纯文本响应"""
    return PlainTextResponse(content="这是纯文本响应")

@app.get("/custom-status")
async def custom_status_code():
    """自定义状态码"""
    return JSONResponse(
        content={"message": "自定义状态码"},
        status_code=201,
        headers={"X-Custom-Header": "custom-value"},
    )

# === 错误响应示例 ===
@app.get("/error")
async def error_example():
    """返回错误响应"""
    return JSONResponse(
        status_code=400,
        content={
            "error": "Invalid request",
            "detail": "缺少必需参数",
            "code": 400,
        },
    )

# === OpenAPI 文档 ===
@app.get("/openapi-info")
async def openapi_info():
    """查看 OpenAPI 规范信息"""
    openapi_schema = app.openapi()
    return {
        "title": openapi_schema["info"]["title"],
        "version": openapi_schema["info"]["version"],
        "endpoints": len(openapi_schema["paths"]),
        "schemas": len(openapi_schema.get("components", {}).get("schemas", {})),
    }
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| response_model 过滤了字段 | 检查模型定义是否包含需要的字段 |
| 响应格式不符合预期 | 使用 `response_model_exclude_unset=True` |
| OpenAPI 文档不显示 | 检查路由是否正确注册 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| response_model | 响应数据模型 | "输出的模板" |
| OpenAPI | API 规范标准 | "API 的说明书格式" |
| Swagger UI | 交互式 API 文档 | "API 的图形界面" |
| ReDoc | 另一种 API 文档 | "API 的精美说明书" |
| 状态码 | HTTP 响应状态 | "结果的暗号" |
| Content-Type | 响应内容类型 | "包裹里的东西是什么" |

---

### ✅ 验收清单

- [ ] 能用 response_model 控制输出格式
- [ ] 能返回不同类型的响应（JSON、HTML、纯文本）
- [ ] 能自定义状态码和响应头
- [ ] 能看懂 OpenAPI 规范
- [ ] 完成了 Week 2 复盘笔记

---

### 📝 复盘小纸条

> **Week 2 最大的收获是什么？**
>
> 
>
> **FastAPI 的哪个特性最让我惊喜？**
>
> 
>
> **我对 Week 3（LLM）的期待是什么？**
>
> 

---

### 📥 明日同步接口

- 输入：Week 2 全部完成
- 输出：正式进入 Week 3 LLM 学习
- 关键交接物：完整的 FastAPI 后端开发能力
