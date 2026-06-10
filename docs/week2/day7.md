# 📅 Week 2 Day 7：测试 + 复盘

## 🧭 今日方向
> 今天是 Week 2 的最后一天，我们将对 FastAPI 应用进行全面测试，然后进行本周的复盘总结。

## 🎯 生活比喻
> 如果说开发是建造房子，那么测试就是质量检查，复盘就是总结经验教训。只有经过严格检查的房子才能安心入住。

## 📋 今日三件事
1. 为 FastAPI 应用编写测试用例
2. 执行测试并修复问题
3. 完成 Week 2 的复盘总结

## 🗺️ 手把手路线

### Step 1: 测试策略
- **做什么**: 制定测试计划，确定测试范围
- **为什么**: 好的测试策略能提高测试效率
- **成功标志**: 有清晰的测试计划

### Step 2: 编写测试用例
- **做什么**: 为 API 端点编写单元测试和集成测试
- **为什么**: 测试是代码质量的保证
- **成功标志**: 核心功能都有测试覆盖

### Step 3: 复盘总结
- **做什么**: 总结本周学习内容，记录经验和教训
- **为什么**: 复盘是持续改进的关键
- **成功标志**: 有完整的复盘报告

## 💻 代码区

```python
# FastAPI 测试示例

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# 测试数据库配置
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 导入应用
from main import app, get_db, Base

# 测试客户端
client = TestClient(app)

# 测试前准备
@pytest.fixture(scope="function")
def setup_database():
    """设置测试数据库"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """获取测试数据库会话"""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

# 1. 基础端点测试
def test_root_endpoint():
    """测试根端点"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_health_check():
    """测试健康检查端点"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

# 2. 用户 API 测试
class TestUserAPI:
    """用户 API 测试类"""
    
    def test_create_user(self, setup_database):
        """测试创建用户"""
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }
        
        response = client.post("/users/", json=user_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["username"] == user_data["username"]
        assert data["email"] == user_data["email"]
        assert "id" in data
    
    def test_create_duplicate_user(self, setup_database):
        """测试创建重复用户"""
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }
        
        # 第一次创建
        client.post("/users/", json=user_data)
        
        # 第二次创建（应该失败）
        response = client.post("/users/", json=user_data)
        assert response.status_code == 400
    
    def test_get_user(self, setup_database):
        """测试获取用户"""
        # 先创建用户
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }
        create_response = client.post("/users/", json=user_data)
        user_id = create_response.json()["id"]
        
        # 获取用户
        response = client.get(f"/users/{user_id}")
        assert response.status_code == 200
        assert response.json()["username"] == user_data["username"]
    
    def test_get_nonexistent_user(self, setup_database):
        """测试获取不存在的用户"""
        response = client.get("/users/999")
        assert response.status_code == 404
    
    def test_update_user(self, setup_database):
        """测试更新用户"""
        # 先创建用户
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }
        create_response = client.post("/users/", json=user_data)
        user_id = create_response.json()["id"]
        
        # 更新用户
        update_data = {"email": "newemail@example.com"}
        response = client.put(f"/users/{user_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["email"] == update_data["email"]
    
    def test_delete_user(self, setup_database):
        """测试删除用户"""
        # 先创建用户
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }
        create_response = client.post("/users/", json=user_data)
        user_id = create_response.json()["id"]
        
        # 删除用户
        response = client.delete(f"/users/{user_id}")
        assert response.status_code == 200
        
        # 验证用户已删除
        get_response = client.get(f"/users/{user_id}")
        assert get_response.status_code == 404

# 3. 任务 API 测试
class TestTaskAPI:
    """任务 API 测试类"""
    
    def test_create_task(self, setup_database):
        """测试创建任务"""
        # 先创建用户
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }
        user_response = client.post("/users/", json=user_data)
        user_id = user_response.json()["id"]
        
        # 创建任务
        task_data = {
            "title": "测试任务",
            "description": "这是一个测试任务",
            "priority": 3
        }
        response = client.post(f"/tasks/?owner_id={user_id}", json=task_data)
        assert response.status_code == 201
        assert response.json()["title"] == task_data["title"]
    
    def test_get_tasks(self, setup_database):
        """测试获取任务列表"""
        # 先创建用户和任务
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }
        user_response = client.post("/users/", json=user_data)
        user_id = user_response.json()["id"]
        
        # 创建多个任务
        for i in range(3):
            task_data = {"title": f"任务{i+1}", "priority": i+1}
            client.post(f"/tasks/?owner_id={user_id}", json=task_data)
        
        # 获取任务列表
        response = client.get(f"/tasks/?owner_id={user_id}")
        assert response.status_code == 200
        assert len(response.json()) == 3
    
    def test_update_task_status(self, setup_database):
        """测试更新任务状态"""
        # 先创建用户和任务
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }
        user_response = client.post("/users/", json=user_data)
        user_id = user_response.json()["id"]
        
        task_data = {"title": "测试任务", "priority": 2}
        task_response = client.post(f"/tasks/?owner_id={user_id}", json=task_data)
        task_id = task_response.json()["id"]
        
        # 更新状态
        response = client.patch(
            f"/tasks/{task_id}/status",
            json={"status": "completed"}
        )
        assert response.status_code == 200
        assert response.json()["status"] == "completed"

# 4. 认证测试
class TestAuthentication:
    """认证测试类"""
    
    def test_register_user(self, setup_database):
        """测试用户注册"""
        user_data = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "password123"
        }
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == 201
    
    def test_login_user(self, setup_database):
        """测试用户登录"""
        # 先注册
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }
        client.post("/auth/register", json=user_data)
        
        # 登录
        response = client.post(
            "/auth/login",
            params={"username": "testuser", "password": "password123"}
        )
        assert response.status_code == 200
        assert "access_token" in response.json()
    
    def test_protected_endpoint(self, setup_database):
        """测试受保护端点"""
        # 先注册和登录
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }
        client.post("/auth/register", json=user_data)
        
        login_response = client.post(
            "/auth/login",
            params={"username": "testuser", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        
        # 访问受保护端点
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200

if __name__ == "__main__":
    # 运行测试
    pytest.main([__file__, "-v", "--tb=short"])
```

```python
# Week 2 复盘脚本

from datetime import datetime
from typing import Dict, List, Any
from dataclasses import dataclass, field

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
    """Week 2 复盘类"""
    
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
        """添加每日记录"""
        self.records.append(record)
    
    def calculate_stats(self) -> Dict[str, Any]:
        """计算统计数据"""
        total_days = len(self.records)
        completed_days = sum(1 for r in self.records if r.completed)
        avg_rating = sum(r.rating for r in self.records) / total_days if total_days > 0 else 0
        
        all_challenges = []
        for record in self.records:
            all_challenges.extend(record.challenges)
        
        return {
            "total_days": total_days,
            "completed_days": completed_days,
            "completion_rate": completed_days / total_days * 100 if total_days > 0 else 0,
            "average_rating": avg_rating,
            "total_challenges": len(all_challenges),
            "unique_challenges": list(set(all_challenges))
        }
    
    def generate_report(self) -> str:
        """生成复盘报告"""
        stats = self.calculate_stats()
        
        report = f"""# Week 2 复盘报告
生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 📊 学习统计
- 总天数: {stats['total_days']}
- 完成天数: {stats['completed_days']}
- 完成率: {stats['completion_rate']:.1f}%
- 平均评分: {stats['average_rating']:.1f}/5
- 遇到的挑战数: {stats['total_challenges']}

## 🎯 学习目标完成情况

"""
        
        for i, goal in enumerate(self.goals, 1):
            if i <= len(self.records):
                record = self.records[i-1]
                status = "✅" if record.completed else "❌"
                rating = "⭐" * record.rating
                report += f"{i}. {status} {goal} {rating}\n"
            else:
                report += f"{i}. ❌ {goal}\n"
        
        report += "\n## 📅 每日学习记录\n\n"
        
        for record in self.records:
            status = "✅" if record.completed else "❌"
            report += f"### Day {record.day}: {record.topic}\n"
            report += f"- 状态: {status}\n"
            report += f"- 评分: {'⭐' * record.rating}/5\n"
            report += "- 主要收获:\n"
            for learning in record.key_learnings:
                report += f"  - {learning}\n"
            report += "- 遇到的挑战:\n"
            for challenge in record.challenges:
                report += f"  - {challenge}\n"
            report += "\n"
        
        report += f"""## 🔍 问题与挑战

### 主要挑战
"""
        for challenge in stats['unique_challenges']:
            report += f"- {challenge}\n"
        
        report += """
### 解决方案
1. **FastAPI 学习**: 通过官方文档和示例代码快速上手
2. **SQLAlchemy 2.0**: 理解新语法，参考迁移指南
3. **JWT 认证**: 学习 OAuth 2.0 规范，理解令牌机制
4. **WebSocket**: 实践实时通信，处理连接管理

## 💡 经验总结

### 技术收获
1. **FastAPI**: 现代化的 Python Web 框架，性能优秀
2. **Pydantic v2**: 强大的数据验证，自动生成文档
3. **SQLAlchemy 2.0**: 新的异步支持，更简洁的语法
4. **JWT**: 安全的认证机制，适合无状态 API
5. **WebSocket**: 实时通信的关键技术

### 最佳实践
1. **代码组织**: 使用路由模块化组织代码
2. **错误处理**: 统一的错误响应格式
3. **测试策略**: 单元测试 + 集成测试
4. **文档生成**: 自动 API 文档，降低维护成本

## 🚀 下周计划

### Week 3: LLM 基础
- NLP 基础 + 文本表示演进
- Transformer 架构：自注意力机制（概念级）
- 大模型概览：GPT/Claude/LLaMA 架构对比
- 提示工程：Few-shot / CoT / 结构化输出
- "When NOT to build agents" 判断框架
- LLM API 工程实践：流式调用 + Token 管理
- 复盘

### 学习建议
1. **理论与实践结合**: 每个概念都要有代码实践
2. **深入理解原理**: 不仅会用，还要理解为什么
3. **记录学习笔记**: 使用 Obsidian 整理知识
4. **定期复习**: 巩固学过的内容
"""
        
        return report

def create_week2_review():
    """创建 Week 2 复盘数据"""
    review = Week2Review()
    
    # 添加每日记录
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
    review = create_week2_review()
    
    # 生成报告
    report = review.generate_report()
    
    # 保存报告
    with open("week2_review.md", "w", encoding="utf-8") as f:
        f.write(report)
    
    print("✅ Week 2 复盘报告已生成")
    print("\n报告预览:")
    print(report[:1000] + "...")
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 测试数据库问题 | 使用 SQLite 内存数据库，测试后清理 |
| 2 | 测试用例不通过 | 检查测试数据，确保隔离性 |
| 3 | 复盘内容空洞 | 结合具体代码示例，记录真实过程 |
| 4 | 时间管理不当 | 优先测试核心功能，逐步完善 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| 单元测试 | 测试单个函数或方法 |
| 集成测试 | 测试多个组件协同工作 |
| 测试覆盖率 | 测试覆盖的代码比例 |
| Mock | 模拟对象，用于隔离测试 |
| Fixture | 测试前的准备和清理工作 |
| 复盘 | 回顾总结，找出改进点 |

## ✅ 验收清单
- [ ] 编写完整的测试用例
- [ ] 所有测试通过
- [ ] 生成完整的复盘报告
- [ ] 制定 Week 3 学习计划

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
