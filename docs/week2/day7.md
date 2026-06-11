# Day 7: 测试 + Week 2 复盘

## 今日学习目标

1. 掌握 FastAPI 测试方法
2. 编写完整的测试用例
3. 执行测试并修复问题
4. 完成 Week 2 的复盘总结
5. 制定 Week 3 的学习计划

---

## 第一部分：FastAPI 测试基础

### 为什么需要测试？

**类比理解：**
测试就像质量检查：
- 单元测试 = 检查每个零件
- 集成测试 = 检查组装是否正确
- 端到端测试 = 检查整体功能

### 测试金字塔

```
        /\
       /  \        端到端测试（少）
      /----\
     /      \      集成测试（中）
    /--------\
   /          \    单元测试（多）
  /------------\
```

### 安装测试依赖

```bash
# 安装测试相关依赖
pip install pytest pytest-asyncio httpx

# 验证安装
pip list | grep -i "pytest\|httpx"
```

**预期输出：**
```
pytest                  7.4.3
pytest-asyncio          0.23.2
httpx                   0.25.2
```

---

## 第二部分：测试配置

### 文件：tests/conftest.py

```python
"""
测试配置和 fixtures
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import Generator

from app.database import Base, get_db
from app.main import app

# ==================== 测试数据库配置 ====================

# 使用 SQLite 内存数据库
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# ==================== Fixtures ====================

@pytest.fixture(scope="function")
def db_session():
    """创建测试数据库会话"""
    # 创建表
    Base.metadata.create_all(bind=engine)
    
    # 创建会话
    session = TestingSessionLocal()
    
    yield session
    
    # 清理
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """创建测试客户端"""
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def sample_user():
    """示例用户数据"""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "full_name": "Test User",
        "password": "SecurePass123"
    }


@pytest.fixture
def sample_task():
    """示例任务数据"""
    return {
        "title": "测试任务",
        "description": "这是一个测试任务",
        "priority": "medium"
    }
```

---

## 第三部分：单元测试

### 文件：tests/test_models.py

```python
"""
模型测试
"""

import pytest
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from pydantic import ValidationError


class TestUserSchemas:
    """用户 Schema 测试"""
    
    def test_create_user_valid(self):
        """测试创建有效用户"""
        user = UserCreate(
            username="testuser",
            email="test@example.com",
            password="SecurePass123"
        )
        assert user.username == "testuser"
        assert user.email == "test@example.com"
    
    def test_create_user_short_username(self):
        """测试用户名太短"""
        with pytest.raises(ValidationError):
            UserCreate(
                username="ab",  # 太短
                email="test@example.com",
                password="SecurePass123"
            )
    
    def test_create_user_weak_password(self):
        """测试弱密码"""
        with pytest.raises(ValidationError):
            UserCreate(
                username="testuser",
                email="test@example.com",
                password="weak"  # 太弱
            )
    
    def test_update_user_partial(self):
        """测试部分更新用户"""
        update = UserUpdate(email="new@example.com")
        assert update.email == "new@example.com"
        assert update.full_name is None


class TestTaskSchemas:
    """任务 Schema 测试"""
    
    def test_create_task_valid(self):
        """测试创建有效任务"""
        task = TaskCreate(
            title="测试任务",
            priority="high"
        )
        assert task.title == "测试任务"
        assert task.priority == "high"
    
    def test_create_task_empty_title(self):
        """测试空标题"""
        with pytest.raises(ValidationError):
            TaskCreate(title="", priority="medium")
```

### 文件：tests/test_crud.py

```python
"""
CRUD 操作测试
"""

import pytest
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.task import Task
from app.crud.user import (
    create_user, get_user, get_user_by_username,
    update_user, delete_user
)
from app.crud.task import (
    create_task, get_task, get_tasks, update_task, delete_task
)
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.task import TaskCreate, TaskUpdate


class TestUserCRUD:
    """用户 CRUD 测试"""
    
    def test_create_user(self, db_session: Session):
        """测试创建用户"""
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="SecurePass123"
        )
        
        user = create_user(db_session, user_data, "hashed_password")
        
        assert user.id is not None
        assert user.username == "testuser"
        assert user.email == "test@example.com"
    
    def test_get_user(self, db_session: Session):
        """测试获取用户"""
        # 创建用户
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="SecurePass123"
        )
        created_user = create_user(db_session, user_data, "hashed_password")
        
        # 获取用户
        user = get_user(db_session, created_user.id)
        
        assert user is not None
        assert user.username == "testuser"
    
    def test_get_user_by_username(self, db_session: Session):
        """测试根据用户名获取用户"""
        # 创建用户
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="SecurePass123"
        )
        create_user(db_session, user_data, "hashed_password")
        
        # 根据用户名获取
        user = get_user_by_username(db_session, "testuser")
        
        assert user is not None
        assert user.username == "testuser"
    
    def test_update_user(self, db_session: Session):
        """测试更新用户"""
        # 创建用户
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="SecurePass123"
        )
        user = create_user(db_session, user_data, "hashed_password")
        
        # 更新用户
        update_data = UserUpdate(email="new@example.com")
        updated_user = update_user(db_session, user, update_data)
        
        assert updated_user.email == "new@example.com"
    
    def test_delete_user(self, db_session: Session):
        """测试删除用户"""
        # 创建用户
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="SecurePass123"
        )
        user = create_user(db_session, user_data, "hashed_password")
        
        # 删除用户
        result = delete_user(db_session, user.id)
        
        assert result is True
        assert get_user(db_session, user.id) is None


class TestTaskCRUD:
    """任务 CRUD 测试"""
    
    def test_create_task(self, db_session: Session):
        """测试创建任务"""
        task_data = TaskCreate(
            title="测试任务",
            priority="high"
        )
        
        task = create_task(db_session, task_data, owner_id=1)
        
        assert task.id is not None
        assert task.title == "测试任务"
        assert task.priority == "high"
    
    def test_get_task(self, db_session: Session):
        """测试获取任务"""
        # 创建任务
        task_data = TaskCreate(
            title="测试任务",
            priority="medium"
        )
        created_task = create_task(db_session, task_data, owner_id=1)
        
        # 获取任务
        task = get_task(db_session, created_task.id)
        
        assert task is not None
        assert task.title == "测试任务"
    
    def test_update_task(self, db_session: Session):
        """测试更新任务"""
        # 创建任务
        task_data = TaskCreate(
            title="测试任务",
            priority="low"
        )
        task = create_task(db_session, task_data, owner_id=1)
        
        # 更新任务
        from app.models.task import TaskStatus
        update_data = TaskUpdate(
            title="更新后的任务",
            status=TaskStatus.COMPLETED
        )
        updated_task = update_task(db_session, task, update_data)
        
        assert updated_task.title == "更新后的任务"
    
    def test_delete_task(self, db_session: Session):
        """测试删除任务"""
        # 创建任务
        task_data = TaskCreate(
            title="测试任务",
            priority="medium"
        )
        task = create_task(db_session, task_data, owner_id=1)
        
        # 删除任务
        result = delete_task(db_session, task.id)
        
        assert result is True
        assert get_task(db_session, task.id) is None
```

---

## 第四部分：API 集成测试

### 文件：tests/test_api.py

```python
"""
API 集成测试
"""

import pytest
from fastapi.testclient import TestClient


class TestHealthAPI:
    """健康检查 API 测试"""
    
    def test_health_check(self, client: TestClient):
        """测试健康检查端点"""
        response = client.get("/health")
        
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
    
    def test_root(self, client: TestClient):
        """测试根端点"""
        response = client.get("/")
        
        assert response.status_code == 200
        assert "message" in response.json()


class TestUserAPI:
    """用户 API 测试"""
    
    def test_create_user(self, client: TestClient, sample_user):
        """测试创建用户"""
        response = client.post(
            "/api/v1/users",
            json=sample_user
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == sample_user["username"]
        assert data["email"] == sample_user["email"]
        assert "id" in data
    
    def test_create_duplicate_user(self, client: TestClient, sample_user):
        """测试创建重复用户"""
        # 第一次创建
        client.post("/api/v1/users", json=sample_user)
        
        # 第二次创建（应该失败）
        response = client.post("/api/v1/users", json=sample_user)
        
        assert response.status_code == 400
    
    def test_get_user(self, client: TestClient, sample_user):
        """测试获取用户"""
        # 先创建用户
        create_response = client.post("/api/v1/users", json=sample_user)
        user_id = create_response.json()["id"]
        
        # 获取用户
        response = client.get(f"/api/v1/users/{user_id}")
        
        assert response.status_code == 200
        assert response.json()["username"] == sample_user["username"]
    
    def test_get_nonexistent_user(self, client: TestClient):
        """测试获取不存在的用户"""
        response = client.get("/api/v1/users/999")
        
        assert response.status_code == 404
    
    def test_list_users(self, client: TestClient, sample_user):
        """测试获取用户列表"""
        # 创建几个用户
        for i in range(3):
            user_data = sample_user.copy()
            user_data["username"] = f"user{i}"
            user_data["email"] = f"user{i}@example.com"
            client.post("/api/v1/users", json=user_data)
        
        # 获取列表
        response = client.get("/api/v1/users")
        
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert len(data["users"]) == 3
    
    def test_update_user(self, client: TestClient, sample_user):
        """测试更新用户"""
        # 先创建用户
        create_response = client.post("/api/v1/users", json=sample_user)
        user_id = create_response.json()["id"]
        
        # 更新用户
        update_data = {"email": "newemail@example.com"}
        response = client.put(f"/api/v1/users/{user_id}", json=update_data)
        
        assert response.status_code == 200
        assert response.json()["email"] == update_data["email"]
    
    def test_delete_user(self, client: TestClient, sample_user):
        """测试删除用户"""
        # 先创建用户
        create_response = client.post("/api/v1/users", json=sample_user)
        user_id = create_response.json()["id"]
        
        # 删除用户
        response = client.delete(f"/api/v1/users/{user_id}")
        
        assert response.status_code == 204
        
        # 验证用户已删除
        get_response = client.get(f"/api/v1/users/{user_id}")
        assert get_response.status_code == 404


class TestTaskAPI:
    """任务 API 测试"""
    
    def test_create_task(self, client: TestClient, sample_user, sample_task):
        """测试创建任务"""
        # 先创建用户
        user_response = client.post("/api/v1/users", json=sample_user)
        user_id = user_response.json()["id"]
        
        # 创建任务
        response = client.post(
            f"/api/v1/users/{user_id}/tasks",
            json=sample_task
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == sample_task["title"]
    
    def test_list_tasks(self, client: TestClient, sample_user, sample_task):
        """测试获取任务列表"""
        # 先创建用户
        user_response = client.post("/api/v1/users", json=sample_user)
        user_id = user_response.json()["id"]
        
        # 创建几个任务
        for i in range(3):
            task_data = sample_task.copy()
            task_data["title"] = f"任务{i}"
            client.post(f"/api/v1/users/{user_id}/tasks", json=task_data)
        
        # 获取列表
        response = client.get(f"/api/v1/users/{user_id}/tasks")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 3
    
    def test_update_task(self, client: TestClient, sample_user, sample_task):
        """测试更新任务"""
        # 先创建用户和任务
        user_response = client.post("/api/v1/users", json=sample_user)
        user_id = user_response.json()["id"]
        
        task_response = client.post(
            f"/api/v1/users/{user_id}/tasks",
            json=sample_task
        )
        task_id = task_response.json()["id"]
        
        # 更新任务
        update_data = {"title": "更新后的任务", "status": "completed"}
        response = client.put(f"/api/v1/tasks/{task_id}", json=update_data)
        
        assert response.status_code == 200
        assert response.json()["title"] == update_data["title"]
    
    def test_delete_task(self, client: TestClient, sample_user, sample_task):
        """测试删除任务"""
        # 先创建用户和任务
        user_response = client.post("/api/v1/users", json=sample_user)
        user_id = user_response.json()["id"]
        
        task_response = client.post(
            f"/api/v1/users/{user_id}/tasks",
            json=sample_task
        )
        task_id = task_response.json()["id"]
        
        # 删除任务
        response = client.delete(f"/api/v1/tasks/{task_id}")
        
        assert response.status_code == 204
        
        # 验证任务已删除
        get_response = client.get(f"/api/v1/tasks/{task_id}")
        assert get_response.status_code == 404


class TestAuthAPI:
    """认证 API 测试"""
    
    def test_register(self, client: TestClient, sample_user):
        """测试用户注册"""
        response = client.post(
            "/api/v1/auth/register",
            json=sample_user
        )
        
        assert response.status_code == 201
        assert response.json()["username"] == sample_user["username"]
    
    def test_login(self, client: TestClient, sample_user):
        """测试用户登录"""
        # 先注册
        client.post("/api/v1/auth/register", json=sample_user)
        
        # 登录
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": sample_user["username"],
                "password": sample_user["password"]
            }
        )
        
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert "refresh_token" in response.json()
    
    def test_protected_endpoint(self, client: TestClient, sample_user):
        """测试受保护端点"""
        # 先注册
        client.post("/api/v1/auth/register", json=sample_user)
        
        # 登录获取令牌
        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": sample_user["username"],
                "password": sample_user["password"]
            }
        )
        token = login_response.json()["access_token"]
        
        # 访问受保护端点
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        assert response.json()["username"] == sample_user["username"]
    
    def test_protected_endpoint_without_token(self, client: TestClient):
        """测试无令牌访问受保护端点"""
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == 403
```

---

## 第五部分：运行测试

### 运行所有测试

```bash
# 运行所有测试
pytest

# 运行详细模式
pytest -v

# 运行特定文件
pytest tests/test_models.py -v

# 运行特定类
pytest tests/test_api.py::TestUserAPI -v

# 运行特定测试
pytest tests/test_api.py::TestUserAPI::test_create_user -v

# 生成覆盖率报告
pytest --cov=app --cov-report=html
```

### 预期输出

```
============================= test session starts ==============================
...
tests/test_models.py::TestUserSchemas::test_create_user_valid PASSED        [ 11%]
tests/test_models.py::TestUserSchemas::test_create_user_short_username PASSED [ 22%]
tests/test_models.py::TestUserSchemas::test_create_user_weak_password PASSED [ 33%]
tests/test_models.py::TestUserSchemas::test_update_user_partial PASSED      [ 44%]
...
tests/test_api.py::TestUserAPI::test_create_user PASSED                     [ 55%]
tests/test_api.py::TestUserAPI::test_get_user PASSED                        [ 66%]
tests/test_api.py::TestUserAPI::test_update_user PASSED                     [ 77%]
tests/test_api.py::TestUserAPI::test_delete_user PASSED                     [ 88%]
...
============================== 15 passed in 2.34s ===============================
```

---

## 第六部分：Week 2 复盘

### 复盘报告模板

```python
"""
Week 2 复盘报告生成器
"""

from datetime import datetime
from dataclasses import dataclass, field
from typing import List, Dict


@dataclass
class DailyRecord:
    """每日记录"""
    day: int
    topic: str
    completed: bool
    key_learnings: List[str]
    challenges: List[str]
    rating: int  # 1-5


class Week2Review:
    """Week 2 复盘"""
    
    def __init__(self):
        self.records: List[DailyRecord] = []
        self.goals = [
            "FastAPI 入门 + Pydantic v2 模型",
            "路由设计 + 请求验证 + 错误处理",
            "数据库 ORM（SQLAlchemy 2.0）+ CRUD",
            "JWT 认证 + 中间件",
            "WebSocket 实时通信",
            "结构化输出：JSON Mode + Pydantic Schema",
            "测试 + 复盘"
        ]
    
    def add_record(self, record: DailyRecord):
        """添加记录"""
        self.records.append(record)
    
    def calculate_stats(self) -> Dict:
        """计算统计"""
        total = len(self.records)
        completed = sum(1 for r in self.records if r.completed)
        avg_rating = sum(r.rating for r in self.records) / total if total > 0 else 0
        
        return {
            "total_days": total,
            "completed_days": completed,
            "completion_rate": completed / total * 100 if total > 0 else 0,
            "average_rating": avg_rating
        }
    
    def generate_report(self) -> str:
        """生成报告"""
        stats = self.calculate_stats()
        
        report = f"""# Week 2 复盘报告
生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 学习统计
- 完成天数: {stats['completed_days']}/{stats['total_days']}
- 完成率: {stats['completion_rate']:.1f}%
- 平均评分: {stats['average_rating']:.1f}/5

## 学习目标完成情况

"""
        
        for i, goal in enumerate(self.goals, 1):
            if i <= len(self.records):
                record = self.records[i-1]
                status = "完成" if record.completed else "未完成"
                rating = "★" * record.rating + "☆" * (5 - record.rating)
                report += f"{i}. [{status}] {goal} {rating}\n"
            else:
                report += f"{i}. [未完成] {goal}\n"
        
        report += "\n## 每日学习记录\n\n"
        
        for record in self.records:
            status = "完成" if record.completed else "未完成"
            report += f"### Day {record.day}: {record.topic}\n"
            report += f"- 状态: {status}\n"
            report += f"- 评分: {'★' * record.rating}/5\n"
            report += "- 主要收获:\n"
            for learning in record.key_learnings:
                report += f"  - {learning}\n"
            report += "- 遇到的挑战:\n"
            for challenge in record.challenges:
                report += f"  - {challenge}\n"
            report += "\n"
        
        report += """## 技术收获

### FastAPI
- 高性能的 Python Web 框架
- 自动生成 API 文档
- 类型安全的数据验证

### SQLAlchemy 2.0
- 现代化的 ORM
- 支持异步操作
- 类型注解支持

### JWT 认证
- 无状态的认证机制
- 访问令牌 + 刷新令牌
- 安全的密码哈希

### WebSocket
- 实时双向通信
- 连接管理
- 广播和私聊

### 结构化输出
- Pydantic Schema 验证
- JSON Mode
- LLM 输出规范化

## 改进点

1. **时间管理**: 合理分配每天的学习时间
2. **代码实践**: 增加动手实践的时间
3. **测试覆盖**: 提高测试覆盖率
4. **文档编写**: 及时编写技术文档

## Week 3 计划

### 学习主题
- NLP 基础
- Transformer 架构
- 大模型概览
- 提示工程
- Agent 判断框架
- LLM API 工程

### 学习策略
1. 概念先行，理解原理
2. 动手实践，代码演示
3. 对比学习，加深理解
4. 问题驱动，高效学习
"""
        
        return report


def create_sample_review():
    """创建示例复盘数据"""
    review = Week2Review()
    
    records = [
        DailyRecord(
            day=1,
            topic="FastAPI 入门 + Pydantic v2 模型",
            completed=True,
            key_learnings=[
                "掌握了 FastAPI 基础用法",
                "理解了 Pydantic v2 的数据验证",
                "能创建简单的 API 端点"
            ],
            challenges=["Pydantic v2 语法变化"],
            rating=4
        ),
        DailyRecord(
            day=2,
            topic="路由设计 + 请求验证 + 错误处理",
            completed=True,
            key_learnings=[
                "设计了 RESTful 风格的路由",
                "实现了复杂的请求验证",
                "构建了全局错误处理系统"
            ],
            challenges=["路由冲突问题"],
            rating=4
        ),
        DailyRecord(
            day=3,
            topic="数据库 ORM（SQLAlchemy 2.0）+ CRUD",
            completed=True,
            key_learnings=[
                "掌握 SQLAlchemy 2.0 新语法",
                "实现了完整的 CRUD 操作",
                "理解了 ORM 的工作原理"
            ],
            challenges=["异步数据库操作"],
            rating=4
        ),
        DailyRecord(
            day=4,
            topic="JWT 认证 + 中间件",
            completed=True,
            key_learnings=[
                "理解 JWT 的工作原理",
                "实现了用户认证系统",
                "创建了自定义中间件"
            ],
            challenges=["令牌刷新机制"],
            rating=5
        ),
        DailyRecord(
            day=5,
            topic="WebSocket 实时通信",
            completed=True,
            key_learnings=[
                "理解 WebSocket 协议",
                "实现了多人聊天室",
                "掌握了连接管理"
            ],
            challenges=["连接稳定性"],
            rating=4
        ),
        DailyRecord(
            day=6,
            topic="结构化输出：JSON Mode + Pydantic Schema",
            completed=True,
            key_learnings=[
                "掌握 JSON Mode 使用",
                "理解 Pydantic Schema",
                "能验证结构化数据"
            ],
            challenges=["模型输出格式控制"],
            rating=4
        ),
        DailyRecord(
            day=7,
            topic="测试 + 复盘",
            completed=True,
            key_learnings=[
                "编写了完整的测试用例",
                "掌握了 FastAPI 测试方法",
                "完成了 Week 2 复盘"
            ],
            challenges=["测试覆盖率不足"],
            rating=4
        ),
    ]
    
    for record in records:
        review.add_record(record)
    
    return review


if __name__ == "__main__":
    # 创建复盘数据
    review = create_sample_review()
    
    # 生成报告
    report = review.generate_report()
    
    # 打印报告
    print(report)
    
    # 保存报告
    with open("week2_review.md", "w", encoding="utf-8") as f:
        f.write(report)
    
    print("\n复盘报告已保存到 week2_review.md")
```

---

## 验证清单

完成今日学习后，检查以下项目：

- [ ] 安装了测试依赖
- [ ] 配置了测试数据库
- [ ] 编写了模型测试
- [ ] 编写了 CRUD 测试
- [ ] 编写了 API 测试
- [ ] 所有测试通过
- [ ] 完成了 Week 2 复盘报告
- [ ] 制定了 Week 3 学习计划

---

## Week 2 总结

### 技术栈

- **FastAPI**: 高性能 Web 框架
- **Pydantic**: 数据验证和序列化
- **SQLAlchemy 2.0**: ORM 数据库操作
- **JWT**: 无状态认证
- **WebSocket**: 实时通信
- **Pytest**: 测试框架

### 核心概念

1. **RESTful API**: 基于资源的 API 设计
2. **依赖注入**: 自动管理依赖关系
3. **中间件**: 请求/响应处理管道
4. **结构化输出**: LLM 输出规范化
5. **测试驱动**: 测试是代码质量的保证

### 项目成果

- 完整的任务管理 API
- 用户认证系统
- 实时聊天应用
- 结构化输出服务
- 完整的测试套件

---

## Week 3 预告

### 学习主题

- NLP 基础和文本表示
- Transformer 架构
- 大模型概览
- 提示工程
- Agent 判断框架
- LLM API 工程

### 学习目标

1. 理解 NLP 基础概念
2. 了解 Transformer 架构
3. 对比主流大模型
4. 掌握提示工程技巧
5. 理解 Agent 适用场景
6. 掌握 LLM API 工程

---

## 参考资源

- [Pytest 文档](https://docs.pytest.org/)
- [FastAPI 测试教程](https://fastapi.tiangolo.com/tutorial/testing/)
- [SQLAlchemy 测试](https://docs.sqlalchemy.org/en/20/orm/testing.html)
