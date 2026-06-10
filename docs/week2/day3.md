# 📅 Week 2 Day 3：数据库 ORM（SQLAlchemy 2.0）+ CRUD

## 🧭 今日方向
> 今天我们将学习 SQLAlchemy 2.0 ORM，掌握数据库操作的现代化方法，并实现完整的 CRUD 操作。

## 🎯 生活比喻
> SQLAlchemy 就像一个智能仓库管理系统：ORM 是仓库的布局图，数据库是仓库本身，CRUD 就是入库、查询、更新、出库操作。

## 📋 今日三件事
1. 搭建 SQLAlchemy 2.0 环境
2. 定义数据模型和关系
3. 实现完整的 CRUD 操作

## 🗺️ 手把手路线

### Step 1: SQLAlchemy 基础
- **做什么**: 安装 SQLAlchemy 并配置数据库连接
- **为什么**: SQLAlchemy 是 Python 最流行的 ORM
- **成功标志**: 能连接数据库并创建表

### Step 2: 数据模型定义
- **做什么**: 使用 SQLAlchemy 2.0 的新语法定义模型
- **为什么**: 清晰的模型是数据库操作的基础
- **成功标志**: 能定义复杂的数据模型和关系

### Step 3: CRUD 操作
- **做什么**: 实现创建、读取、更新、删除操作
- **为什么**: CRUD 是数据库操作的核心
- **成功标志**: 能完成各种数据库操作

## 💻 代码区

```python
# SQLAlchemy 2.0 基础配置

from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, relationship, DeclarativeBase
from datetime import datetime
from typing import Optional, List
from contextlib import asynccontextmanager

# 数据库配置
DATABASE_URL = "sqlite:///./agent_factory.db"
ASYNC_DATABASE_URL = "sqlite+aiosqlite:///./agent_factory.db"

# 创建引擎
engine = create_engine(DATABASE_URL, echo=True)
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AsyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# 基础模型类
class Base(DeclarativeBase):
    """SQLAlchemy 2.0 基础模型"""
    pass

# 数据模型
class User(Base):
    """用户模型"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    tasks = relationship("Task", back_populates="owner")
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"

class Task(Base):
    """任务模型"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String(500))
    status = Column(String(20), default="pending")
    priority = Column(Integer, default=2)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 外键
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")
    
    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}')>"

# 创建数据库表
def create_tables():
    """创建数据库表"""
    Base.metadata.create_all(bind=engine)
    print("✅ 数据库表创建完成")

# 获取数据库会话
def get_db():
    """获取数据库会话（同步）"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@asynccontextmanager
async def get_async_db():
    """获取数据库会话（异步）"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

if __name__ == "__main__":
    # 创建数据库表
    create_tables()
    print("数据库配置完成")
```

```python
# 完整的 CRUD 操作

from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from typing import List, Optional
from datetime import datetime

class CRUDOperations:
    """CRUD 操作类"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # ============ 用户 CRUD ============
    
    def create_user(
        self,
        username: str,
        email: str,
        hashed_password: str
    ) -> User:
        """创建用户"""
        user = User(
            username=username,
            email=email,
            hashed_password=hashed_password
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def get_user(self, user_id: int) -> Optional[User]:
        """根据ID获取用户"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        return self.db.query(User).filter(User.username == username).first()
    
    def get_users(
        self,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> List[User]:
        """获取用户列表"""
        query = self.db.query(User)
        
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        return query.offset(skip).limit(limit).all()
    
    def update_user(
        self,
        user_id: int,
        **kwargs
    ) -> Optional[User]:
        """更新用户"""
        user = self.get_user(user_id)
        if user:
            for key, value in kwargs.items():
                if hasattr(user, key):
                    setattr(user, key, value)
            user.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(user)
        return user
    
    def delete_user(self, user_id: int) -> bool:
        """删除用户"""
        user = self.get_user(user_id)
        if user:
            self.db.delete(user)
            self.db.commit()
            return True
        return False
    
    # ============ 任务 CRUD ============
    
    def create_task(
        self,
        title: str,
        owner_id: int,
        description: str = None,
        priority: int = 2
    ) -> Task:
        """创建任务"""
        task = Task(
            title=title,
            description=description,
            priority=priority,
            owner_id=owner_id
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task
    
    def get_task(self, task_id: int) -> Optional[Task]:
        """根据ID获取任务"""
        return self.db.query(Task).filter(Task.id == task_id).first()
    
    def get_tasks(
        self,
        owner_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        """获取任务列表"""
        query = self.db.query(Task)
        
        if owner_id is not None:
            query = query.filter(Task.owner_id == owner_id)
        if status is not None:
            query = query.filter(Task.status == status)
        
        return query.offset(skip).limit(limit).all()
    
    def update_task(
        self,
        task_id: int,
        **kwargs
    ) -> Optional[Task]:
        """更新任务"""
        task = self.get_task(task_id)
        if task:
            for key, value in kwargs.items():
                if hasattr(task, key):
                    setattr(task, key, value)
            task.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(task)
        return task
    
    def delete_task(self, task_id: int) -> bool:
        """删除任务"""
        task = self.get_task(task_id)
        if task:
            self.db.delete(task)
            self.db.commit()
            return True
        return False
    
    # ============ 复杂查询 ============
    
    def search_tasks(
        self,
        keyword: str,
        owner_id: Optional[int] = None
    ) -> List[Task]:
        """搜索任务"""
        query = self.db.query(Task)
        
        if keyword:
            query = query.filter(
                (Task.title.contains(keyword)) |
                (Task.description.contains(keyword))
            )
        
        if owner_id:
            query = query.filter(Task.owner_id == owner_id)
        
        return query.all()
    
    def get_user_tasks_with_stats(self, user_id: int) -> dict:
        """获取用户任务统计"""
        user = self.get_user(user_id)
        if not user:
            return {}
        
        tasks = self.db.query(Task).filter(Task.owner_id == user_id).all()
        
        stats = {
            "total": len(tasks),
            "pending": sum(1 for t in tasks if t.status == "pending"),
            "in_progress": sum(1 for t in tasks if t.status == "in_progress"),
            "completed": sum(1 for t in tasks if t.status == "completed"),
        }
        
        return {
            "user": user.username,
            "stats": stats
        }

# 使用示例
if __name__ == "__main__":
    # 创建数据库表
    create_tables()
    
    # 创建数据库会话
    db = SessionLocal()
    
    try:
        # 创建 CRUD 操作对象
        crud = CRUDOperations(db)
        
        # 创建用户
        user1 = crud.create_user(
            username="zhangsan",
            email="zhangsan@example.com",
            hashed_password="hashed_password_123"
        )
        print(f"创建用户: {user1}")
        
        # 创建任务
        task1 = crud.create_task(
            title="学习 SQLAlchemy",
            description="掌握 ORM 基础",
            owner_id=user1.id,
            priority=3
        )
        print(f"创建任务: {task1}")
        
        # 查询用户
        user = crud.get_user(user1.id)
        print(f"查询用户: {user}")
        
        # 查询任务
        tasks = crud.get_tasks(owner_id=user1.id)
        print(f"用户任务: {tasks}")
        
        # 更新任务状态
        updated_task = crud.update_task(task1.id, status="completed")
        print(f"更新任务: {updated_task}")
        
        # 获取统计信息
        stats = crud.get_user_tasks_with_stats(user1.id)
        print(f"统计信息: {stats}")
        
    finally:
        db.close()
```

```python
# FastAPI 集成示例

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Agent Factory API - SQLAlchemy 集成")

# Pydantic 模型
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    
    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: int = 2

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: int
    owner_id: int
    
    class Config:
        from_attributes = True

# 依赖注入：获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API 端点
@app.post("/users/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """创建用户"""
    crud = CRUDOperations(db)
    
    # 检查用户名是否已存在
    existing_user = crud.get_user_by_username(user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 创建用户（实际应用中应该哈希密码）
    return crud.create_user(
        username=user.username,
        email=user.email,
        hashed_password=user.password  # 实际应用中应该哈希
    )

@app.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    """获取用户"""
    crud = CRUDOperations(db)
    user = crud.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user

@app.get("/users/", response_model=List[UserResponse])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取用户列表"""
    crud = CRUDOperations(db)
    return crud.get_users(skip=skip, limit=limit)

@app.post("/tasks/", response_model=TaskResponse)
def create_task(task: TaskCreate, owner_id: int, db: Session = Depends(get_db)):
    """创建任务"""
    crud = CRUDOperations(db)
    
    # 检查用户是否存在
    user = crud.get_user(owner_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    return crud.create_task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        owner_id=owner_id
    )

@app.get("/tasks/{task_id}", response_model=TaskResponse)
def read_task(task_id: int, db: Session = Depends(get_db)):
    """获取任务"""
    crud = CRUDOperations(db)
    task = crud.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task

@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskCreate,
    db: Session = Depends(get_db)
):
    """更新任务"""
    crud = CRUDOperations(db)
    task = crud.update_task(task_id, **task_update.model_dump())
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """删除任务"""
    crud = CRUDOperations(db)
    if not crud.delete_task(task_id):
        raise HTTPException(status_code=404, detail="任务不存在")
    return {"message": "任务已删除"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 数据库连接失败 | 检查数据库 URL，确保文件路径正确 |
| 2 | 表已存在错误 | 使用 `check_same_thread=False` 参数 |
| 3 | 关系查询报错 | 检查 relationship 定义和外键 |
| 4 | 异步操作报错 | 确保使用 aiosqlite 驱动 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| ORM | 对象关系映射，将类映射到数据库表 |
| SQLAlchemy | Python 的 SQL 工具包和 ORM |
| 会话 | 数据库连接的封装 |
| 模型 | 映射到数据库表的 Python 类 |
| 关系 | 表之间的关联（一对一、一对多等） |
| CRUD | 创建、读取、更新、删除操作 |

## ✅ 验收清单
- [ ] 能配置 SQLAlchemy 2.0 数据库连接
- [ ] 能定义复杂的数据模型和关系
- [ ] 实现完整的 CRUD 操作
- [ ] 能在 FastAPI 中集成数据库操作

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
