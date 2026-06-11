# Day 3: 数据库 ORM（SQLAlchemy 2.0）+ CRUD

## 今日学习目标

1. 理解 ORM 的概念和优势
2. 安装和配置 SQLAlchemy 2.0
3. 定义数据库模型和关系
4. 实现完整的数据库 CRUD 操作
5. 集成 FastAPI 和 SQLAlchemy

---

## 第一部分：ORM 基础概念

### 什么是 ORM？

**类比理解：**
ORM（对象关系映射）就像翻译官：
- 你用 Python 对象说话（`User` 类）
- 翻译官把它翻译成 SQL 语句（`INSERT INTO users...`）
- 数据库执行 SQL 语句
- 翻译官把结果翻译回 Python 对象

### ORM vs 原生 SQL

```python
# 原生 SQL
"""
INSERT INTO users (username, email, password_hash) 
VALUES ('john', 'john@example.com', 'hashed_password');
"""

# SQLAlchemy ORM
"""
user = User(username="john", email="john@example.com", password_hash="hashed_password")
db.add(user)
db.commit()
"""
```

### SQLAlchemy 2.0 新特性

| 特性 | 1.x | 2.0 |
|------|-----|-----|
| 模型定义 | `declarative_base()` | `DeclarativeBase` 类 |
| 查询语法 | `session.query()` | `select()` 语句 |
| 异步支持 | 需要扩展 | 原生支持 |
| 类型注解 | 有限 | 完整支持 |

---

## 第二部分：环境配置

### 安装依赖

```bash
# 安装 SQLAlchemy 和相关依赖
pip install sqlalchemy aiosqlite

# 验证安装
pip list | grep -i sqlalchemy
```

**预期输出：**
```
SQLAlchemy              2.0.23
aiosqlite               0.19.0
```

### 项目结构

```
agent-factory-api/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py        # 数据库配置
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py        # 用户模型
│   │   └── task.py        # 任务模型
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py        # 用户 Pydantic 模型
│   │   └── task.py        # 任务 Pydantic 模型
│   └── crud/
│       ├── __init__.py
│       ├── user.py        # 用户 CRUD 操作
│       └── task.py        # 任务 CRUD 操作
└── requirements.txt
```

---

## 第三部分：数据库配置

### 文件：app/database.py

```python
"""
数据库配置和会话管理
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from typing import Generator
import os

# ==================== 数据库 URL ====================

# 同步数据库 URL（用于开发和测试）
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./agent_factory.db"
)

# 异步数据库 URL（用于生产环境）
ASYNC_DATABASE_URL = os.getenv(
    "ASYNC_DATABASE_URL",
    "sqlite+aiosqlite:///./agent_factory.db"
)

# ==================== 引擎创建 ====================

# 同步引擎
engine = create_engine(
    DATABASE_URL,
    echo=True,  # 打印 SQL 语句（开发环境）
    connect_args={"check_same_thread": False}  # SQLite 特有参数
)

# 异步引擎
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,
    connect_args={"check_same_thread": False}
)

# ==================== 会话工厂 ====================

# 同步会话工厂
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 异步会话工厂
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


# ==================== 基础模型 ====================

class Base(DeclarativeBase):
    """SQLAlchemy 2.0 基础模型类"""
    pass


# ==================== 会话依赖 ====================

def get_db() -> Generator[SessionLocal, None, None]:
    """
    获取数据库会话（用于 FastAPI 依赖注入）
    
    使用方式：
    @app.get("/users/")
    def get_users(db: Session = Depends(get_db)):
        ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_async_db() -> AsyncSession:
    """
    获取异步数据库会话
    
    使用方式：
    @app.get("/users/")
    async def get_users(db: AsyncSession = Depends(get_async_db)):
        ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ==================== 数据库初始化 ====================

def init_db():
    """初始化数据库（创建所有表）"""
    Base.metadata.create_all(bind=engine)
    print("数据库表创建完成")


def drop_db():
    """删除所有表（危险操作！）"""
    Base.metadata.drop_all(bind=engine)
    print("数据库表已删除")
```

---

## 第四部分：定义数据库模型

### 文件：app/models/user.py

```python
"""
用户数据库模型
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    """用户模型"""
    __tablename__ = "users"
    
    # 主键
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # 基本信息
    username = Column(
        String(50), 
        unique=True, 
        index=True, 
        nullable=False,
        comment="用户名"
    )
    email = Column(
        String(100), 
        unique=True, 
        index=True, 
        nullable=False,
        comment="邮箱地址"
    )
    full_name = Column(
        String(100), 
        nullable=True,
        comment="全名"
    )
    
    # 安全信息
    password_hash = Column(
        String(200), 
        nullable=False,
        comment="密码哈希"
    )
    
    # 状态信息
    is_active = Column(
        Boolean, 
        default=True,
        comment="是否激活"
    )
    is_superuser = Column(
        Boolean, 
        default=False,
        comment="是否超级管理员"
    )
    
    # 时间戳
    created_at = Column(
        DateTime, 
        default=datetime.utcnow,
        comment="创建时间"
    )
    updated_at = Column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow,
        comment="更新时间"
    )
    last_login = Column(
        DateTime, 
        nullable=True,
        comment="最后登录时间"
    )
    
    # 关系
    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"
    
    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "is_superuser": self.is_superuser,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None
        }
```

### 文件：app/models/task.py

```python
"""
任务数据库模型
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


class TaskStatus(str, enum.Enum):
    """任务状态枚举"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, enum.Enum):
    """任务优先级枚举"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Task(Base):
    """任务模型"""
    __tablename__ = "tasks"
    
    # 主键
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # 基本信息
    title = Column(
        String(200), 
        nullable=False,
        comment="任务标题"
    )
    description = Column(
        Text, 
        nullable=True,
        comment="任务描述"
    )
    
    # 状态和优先级
    status = Column(
        String(20), 
        default=TaskStatus.PENDING.value,
        comment="任务状态"
    )
    priority = Column(
        String(20), 
        default=TaskPriority.MEDIUM.value,
        comment="任务优先级"
    )
    
    # 标签（JSON 字符串存储）
    tags = Column(
        Text, 
        nullable=True,
        comment="标签（JSON 格式）"
    )
    
    # 时间信息
    due_date = Column(
        DateTime, 
        nullable=True,
        comment="截止日期"
    )
    completed_at = Column(
        DateTime, 
        nullable=True,
        comment="完成时间"
    )
    
    # 时间戳
    created_at = Column(
        DateTime, 
        default=datetime.utcnow,
        comment="创建时间"
    )
    updated_at = Column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow,
        comment="更新时间"
    )
    
    # 外键
    owner_id = Column(
        Integer, 
        nullable=False,
        comment="所有者ID"
    )
    
    # 关系
    owner = relationship("User", back_populates="tasks")
    
    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status}')>"
    
    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }
```

### 文件：app/models/__init__.py

```python
"""
模型包初始化
"""

from app.models.user import User
from app.models.task import Task, TaskStatus, TaskPriority

__all__ = ["User", "Task", "TaskStatus", "TaskPriority"]
```

---

## 第五部分：Pydantic 模型（请求/响应）

### 文件：app/schemas/user.py

```python
"""
用户 Pydantic 模型
"""

from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """用户基础字段"""
    username: str = Field(
        ..., 
        min_length=3, 
        max_length=50,
        description="用户名",
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
        description="全名"
    )

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        """验证用户名格式"""
        if not v.isalnum() and '_' not in v:
            raise ValueError('用户名只能包含字母、数字和下划线')
        return v.lower()


class UserCreate(UserBase):
    """创建用户请求"""
    password: str = Field(
        ..., 
        min_length=8,
        description="密码",
        examples=["securepassword123"]
    )

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """验证密码强度"""
        if not any(c.isupper() for c in v):
            raise ValueError('密码必须包含至少一个大写字母')
        if not any(c.islower() for c in v):
            raise ValueError('密码必须包含至少一个小写字母')
        if not any(c.isdigit() for c in v):
            raise ValueError('密码必须包含至少一个数字')
        return v


class UserUpdate(BaseModel):
    """更新用户请求"""
    email: Optional[str] = Field(None, description="邮箱地址")
    full_name: Optional[str] = Field(None, max_length=100, description="全名")
    password: Optional[str] = Field(None, min_length=8, description="新密码")


class UserResponse(UserBase):
    """用户响应"""
    id: int = Field(..., description="用户ID")
    is_active: bool = Field(..., description="是否激活")
    is_superuser: bool = Field(..., description="是否超级管理员")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")
    last_login: Optional[datetime] = Field(None, description="最后登录时间")

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """用户登录请求"""
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class UserListResponse(BaseModel):
    """用户列表响应"""
    users: list[UserResponse]
    total: int
    page: int
    page_size: int
```

### 文件：app/schemas/task.py

```python
"""
任务 Pydantic 模型
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TaskStatusEnum(str, Enum):
    """任务状态枚举"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriorityEnum(str, Enum):
    """任务优先级枚举"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskCreate(BaseModel):
    """创建任务请求"""
    title: str = Field(
        ..., 
        min_length=1, 
        max_length=200,
        description="任务标题",
        examples=["学习 FastAPI"]
    )
    description: Optional[str] = Field(
        None, 
        max_length=1000,
        description="任务描述"
    )
    priority: TaskPriorityEnum = Field(
        default=TaskPriorityEnum.MEDIUM,
        description="任务优先级"
    )
    tags: List[str] = Field(
        default_factory=list,
        description="任务标签"
    )


class TaskUpdate(BaseModel):
    """更新任务请求"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[TaskStatusEnum] = None
    priority: Optional[TaskPriorityEnum] = None
    tags: Optional[List[str]] = None


class TaskResponse(BaseModel):
    """任务响应"""
    id: int = Field(..., description="任务ID")
    title: str = Field(..., description="任务标题")
    description: Optional[str] = Field(None, description="任务描述")
    status: TaskStatusEnum = Field(..., description="任务状态")
    priority: TaskPriorityEnum = Field(..., description="任务优先级")
    owner_id: int = Field(..., description="所有者ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")
    completed_at: Optional[datetime] = Field(None, description="完成时间")

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """任务列表响应"""
    tasks: list[TaskResponse]
    total: int
    page: int
    page_size: int
```

---

## 第六部分：CRUD 操作

### 文件：app/crud/user.py

```python
"""
用户 CRUD 操作
"""

from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from typing import Optional, List
from datetime import datetime

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


def get_user(db: Session, user_id: int) -> Optional[User]:
    """根据ID获取用户"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """根据用户名获取用户"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """根据邮箱获取用户"""
    return db.query(User).filter(User.email == email).first()


def get_users(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    is_active: Optional[bool] = None
) -> List[User]:
    """获取用户列表"""
    query = db.query(User)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()


def create_user(db: Session, user_in: UserCreate, password_hash: str) -> User:
    """创建用户"""
    user = User(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        password_hash=password_hash
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(
    db: Session, 
    user: User, 
    user_in: UserUpdate,
    password_hash: Optional[str] = None
) -> User:
    """更新用户"""
    update_data = user_in.model_dump(exclude_unset=True)
    
    if password_hash:
        update_data["password_hash"] = password_hash
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> bool:
    """删除用户"""
    user = get_user(db, user_id)
    if not user:
        return False
    
    db.delete(user)
    db.commit()
    return True


def authenticate_user(
    db: Session, 
    username: str, 
    password_hash: str
) -> Optional[User]:
    """验证用户"""
    user = get_user_by_username(db, username)
    if not user:
        return None
    if user.password_hash != password_hash:
        return None
    return user


def update_last_login(db: Session, user: User) -> User:
    """更新最后登录时间"""
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user
```

### 文件：app/crud/task.py

```python
"""
任务 CRUD 操作
"""

from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.models.task import Task, TaskStatus, TaskPriority
from app.schemas.task import TaskCreate, TaskUpdate


def get_task(db: Session, task_id: int) -> Optional[Task]:
    """根据ID获取任务"""
    return db.query(Task).filter(Task.id == task_id).first()


def get_tasks(
    db: Session,
    owner_id: Optional[int] = None,
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> tuple[List[Task], int]:
    """获取任务列表"""
    query = db.query(Task)
    
    # 过滤条件
    if owner_id:
        query = query.filter(Task.owner_id == owner_id)
    if status:
        query = query.filter(Task.status == status.value)
    if priority:
        query = query.filter(Task.priority == priority.value)
    if search:
        query = query.filter(Task.title.contains(search))
    
    # 总数
    total = query.count()
    
    # 分页
    tasks = query.offset(skip).limit(limit).all()
    
    return tasks, total


def create_task(db: Session, task_in: TaskCreate, owner_id: int) -> Task:
    """创建任务"""
    task = Task(
        title=task_in.title,
        description=task_in.description,
        priority=task_in.priority.value,
        owner_id=owner_id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task: Task, task_in: TaskUpdate) -> Task:
    """更新任务"""
    update_data = task_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "status":
            setattr(task, field, value.value)
            if value == TaskStatus.COMPLETED:
                task.completed_at = datetime.utcnow()
        elif field == "priority":
            setattr(task, field, value.value)
        else:
            setattr(task, field, value)
    
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int) -> bool:
    """删除任务"""
    task = get_task(db, task_id)
    if not task:
        return False
    
    db.delete(task)
    db.commit()
    return True


def get_user_tasks_stats(db: Session, owner_id: int) -> dict:
    """获取用户任务统计"""
    tasks = db.query(Task).filter(Task.owner_id == owner_id).all()
    
    stats = {
        "total": len(tasks),
        "by_status": {},
        "by_priority": {}
    }
    
    for task in tasks:
        # 按状态统计
        status = task.status
        stats["by_status"][status] = stats["by_status"].get(status, 0) + 1
        
        # 按优先级统计
        priority = task.priority
        stats["by_priority"][priority] = stats["by_priority"].get(priority, 0) + 1
    
    return stats
```

---

## 第七部分：FastAPI 集成

### 文件：app/main.py（完整版本）

```python
"""
Agent Factory API - 完整版本（含数据库）
"""

from fastapi import FastAPI, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db, init_db
from app.models.user import User
from app.models.task import Task
from app.schemas.user import (
    UserCreate, UserUpdate, UserResponse, UserLogin, UserListResponse
)
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskListResponse,
    TaskStatusEnum, TaskPriorityEnum
)
from app.crud.user import (
    get_user, get_user_by_username, get_user_by_email,
    get_users, create_user, update_user, delete_user,
    authenticate_user, update_last_login
)
from app.crud.task import (
    get_task, get_tasks, create_task, update_task, delete_task,
    get_user_tasks_stats
)

# 创建应用
app = FastAPI(
    title="Agent Factory API",
    description="智能体工厂的后端 API 服务",
    version="0.1.0"
)


# 启动事件
@app.on_event("startup")
async def startup():
    """应用启动时初始化数据库"""
    init_db()


# ==================== 用户 API ====================

@app.post(
    "/api/v1/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="创建用户"
)
async def create_user_endpoint(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """创建新用户"""
    # 检查用户名是否已存在
    if get_user_by_username(db, user_in.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    # 检查邮箱是否已存在
    if get_user_by_email(db, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已被注册"
        )
    
    # 创建用户（实际应用中应该哈希密码）
    return create_user(db, user_in, user_in.password)


@app.get(
    "/api/v1/users",
    response_model=UserListResponse,
    summary="获取用户列表"
)
async def list_users_endpoint(
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(10, ge=1, le=100, description="返回数量"),
    is_active: bool = Query(None, description="是否激活"),
    db: Session = Depends(get_db)
):
    """获取用户列表"""
    users = get_users(db, skip=skip, limit=limit, is_active=is_active)
    total = len(users)  # 实际应用中应该单独查询总数
    
    return UserListResponse(
        users=users,
        total=total,
        page=skip // limit + 1,
        page_size=limit
    )


@app.get(
    "/api/v1/users/{user_id}",
    response_model=UserResponse,
    summary="获取用户详情"
)
async def get_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db)
):
    """根据ID获取用户"""
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户ID {user_id} 不存在"
        )
    return user


@app.put(
    "/api/v1/users/{user_id}",
    response_model=UserResponse,
    summary="更新用户"
)
async def update_user_endpoint(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db)
):
    """更新用户信息"""
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户ID {user_id} 不存在"
        )
    
    # 如果更新邮箱，检查是否已存在
    if user_in.email:
        existing_user = get_user_by_email(db, user_in.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被注册"
            )
    
    return update_user(db, user, user_in)


@app.delete(
    "/api/v1/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="删除用户"
)
async def delete_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db)
):
    """删除用户"""
    if not delete_user(db, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户ID {user_id} 不存在"
        )
    return None


# ==================== 任务 API ====================

@app.post(
    "/api/v1/users/{user_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="创建任务"
)
async def create_task_endpoint(
    user_id: int,
    task_in: TaskCreate,
    db: Session = Depends(get_db)
):
    """为用户创建任务"""
    # 检查用户是否存在
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户ID {user_id} 不存在"
        )
    
    return create_task(db, task_in, user_id)


@app.get(
    "/api/v1/users/{user_id}/tasks",
    response_model=TaskListResponse,
    summary="获取用户任务列表"
)
async def list_user_tasks_endpoint(
    user_id: int,
    status: TaskStatusEnum = Query(None, description="按状态过滤"),
    priority: TaskPriorityEnum = Query(None, description="按优先级过滤"),
    search: str = Query(None, description="搜索标题"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取用户的任务列表"""
    # 检查用户是否存在
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户ID {user_id} 不存在"
        )
    
    tasks, total = get_tasks(
        db,
        owner_id=user_id,
        status=status,
        priority=priority,
        search=search,
        skip=skip,
        limit=limit
    )
    
    return TaskListResponse(
        tasks=tasks,
        total=total,
        page=skip // limit + 1,
        page_size=limit
    )


@app.get(
    "/api/v1/tasks/{task_id}",
    response_model=TaskResponse,
    summary="获取任务详情"
)
async def get_task_endpoint(
    task_id: int,
    db: Session = Depends(get_db)
):
    """根据ID获取任务"""
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"任务ID {task_id} 不存在"
        )
    return task


@app.put(
    "/api/v1/tasks/{task_id}",
    response_model=TaskResponse,
    summary="更新任务"
)
async def update_task_endpoint(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db)
):
    """更新任务信息"""
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"任务ID {task_id} 不存在"
        )
    
    return update_task(db, task, task_in)


@app.delete(
    "/api/v1/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="删除任务"
)
async def delete_task_endpoint(
    task_id: int,
    db: Session = Depends(get_db)
):
    """删除任务"""
    if not delete_task(db, task_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"任务ID {task_id} 不存在"
        )
    return None


@app.get(
    "/api/v1/users/{user_id}/tasks/stats",
    summary="获取用户任务统计"
)
async def get_user_tasks_stats_endpoint(
    user_id: int,
    db: Session = Depends(get_db)
):
    """获取用户的任务统计信息"""
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"用户ID {user_id} 不存在"
        )
    
    return get_user_tasks_stats(db, user_id)


# ==================== 启动 ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 第八部分：测试完整流程

### 测试脚本

```bash
#!/bin/bash
# test_api.sh - 测试脚本

echo "=== 创建用户 ==="
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "password": "SecurePass123"
  }' | jq .

echo -e "\n=== 创建任务 ==="
curl -X POST http://localhost:8000/api/v1/users/1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "学习 FastAPI",
    "description": "完成 Day 3 的学习内容",
    "priority": "high",
    "tags": ["学习", "Python"]
  }' | jq .

echo -e "\n=== 获取用户任务列表 ==="
curl "http://localhost:8000/api/v1/users/1/tasks" | jq .

echo -e "\n=== 更新任务状态 ==="
curl -X PUT http://localhost:8000/api/v1/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }' | jq .

echo -e "\n=== 获取任务统计 ==="
curl "http://localhost:8000/api/v1/users/1/tasks/stats" | jq .
```

---

## 验证清单

完成今日学习后，检查以下项目：

- [ ] 理解 ORM 的概念和优势
- [ ] SQLAlchemy 2.0 安装成功
- [ ] 数据库模型定义正确
- [ ] 数据库表创建成功
- [ ] 用户 CRUD 操作正常
- [ ] 任务 CRUD 操作正常
- [ ] 关系查询正常工作
- [ ] FastAPI 集成成功
- [ ] 完成了测试脚本

---

## 今日小结

| 概念 | 关键点 |
|------|--------|
| ORM | 对象关系映射，简化数据库操作 |
| SQLAlchemy | Python 最流行的 ORM |
| 模型定义 | 使用类定义数据库表结构 |
| 关系 | 一对一、一对多、多对多 |
| CRUD | 创建、读取、更新、删除 |
| 会话 | 数据库连接的封装 |
| 依赖注入 | FastAPI 自动管理数据库会话 |

---

## 明日预告

明天我们将学习：
- JWT 认证机制
- 密码哈希
- 认证中间件
- 保护 API 端点

---

## 参考资源

- [SQLAlchemy 2.0 文档](https://docs.sqlalchemy.org/)
- [FastAPI 数据库教程](https://fastapi.tiangolo.com/tutorial/sql-databases/)
- [SQLite 文档](https://www.sqlite.org/docs.html)
