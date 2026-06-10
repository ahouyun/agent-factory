# 📅 Week 2 Day 1：FastAPI 入门 + Pydantic v2 模型

## 🧭 今日方向
> 今天我们将开始学习 FastAPI，这是现代 Python Web 框架的代表。同时学习 Pydantic v2 用于数据验证和序列化。

## 🎯 生活比喻
> FastAPI 就像一个智能餐厅：Pydantic 是点菜系统（确保你点的菜有效），FastAPI 是厨房（快速做出美味的菜）。

## 📋 今日三件事
1. 搭建 FastAPI 项目基础
2. 学习 Pydantic v2 数据模型
3. 创建第一个 API 端点

## 🗺️ 手把手路线

### Step 1: FastAPI 基础
- **做什么**: 安装 FastAPI 并创建第一个应用
- **为什么**: FastAPI 是构建 API 的现代选择
- **成功标志**: 能运行 FastAPI 应用并访问文档

### Step 2: Pydantic v2
- **做什么**: 学习 Pydantic v2 的数据模型定义
- **为什么**: Pydantic 是 FastAPI 的核心依赖
- **成功标志**: 能定义和使用 Pydantic 模型

### Step 3: 创建 API 端点
- **做什么**: 编写 GET/POST 端点
- **为什么**: API 端点是 Web 服务的核心
- **成功标志**: 能创建和测试 API 端点

## 💻 代码区

```python
# FastAPI 基础应用

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# 创建 FastAPI 应用
app = FastAPI(
    title="Agent Factory API",
    description="AI Agent 开发学习项目",
    version="0.1.0"
)

# Pydantic 模型 - 用户数据
class UserBase(BaseModel):
    """用户基础模型"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: str = Field(..., description="邮箱地址")
    age: Optional[int] = Field(None, ge=0, le=150, description="年龄")
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "zhangsan",
                "email": "zhangsan@example.com",
                "age": 25
            }
        }

class UserCreate(UserBase):
    """创建用户模型"""
    password: str = Field(..., min_length=8, description="密码")

class UserResponse(UserBase):
    """用户响应模型"""
    id: int = Field(..., description="用户ID")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    is_active: bool = Field(default=True, description="是否激活")
    
    class Config:
        from_attributes = True

# 模拟数据库
users_db: List[dict] = [
    {"id": 1, "username": "admin", "email": "admin@example.com", "age": 30, "is_active": True},
    {"id": 2, "username": "user1", "email": "user1@example.com", "age": 25, "is_active": True},
]

# API 端点
@app.get("/")
async def root():
    """根端点"""
    return {"message": "欢迎使用 Agent Factory API"}

@app.get("/users", response_model=List[UserResponse])
async def get_users():
    """获取所有用户"""
    return users_db

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """根据ID获取用户"""
    for user in users_db:
        if user["id"] == user_id:
            return user
    raise HTTPException(status_code=404, detail="用户不存在")

@app.post("/users", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate):
    """创建新用户"""
    # 检查用户名是否已存在
    for existing_user in users_db:
        if existing_user["username"] == user.username:
            raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 创建新用户
    new_user = {
        "id": len(users_db) + 1,
        "username": user.username,
        "email": user.email,
        "age": user.age,
        "is_active": True,
        "created_at": datetime.now().isoformat()
    }
    users_db.append(new_user)
    
    return new_user

@app.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user: UserBase):
    """更新用户信息"""
    for i, existing_user in enumerate(users_db):
        if existing_user["id"] == user_id:
            users_db[i].update(user.model_dump())
            return users_db[i]
    raise HTTPException(status_code=404, detail="用户不存在")

@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    """删除用户"""
    for i, user in enumerate(users_db):
        if user["id"] == user_id:
            del users_db[i]
            return {"message": "用户已删除"}
    raise HTTPException(status_code=404, detail="用户不存在")

# 运行应用
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

```python
# Pydantic v2 高级用法

from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# 1. 枚举类型
class UserRole(str, Enum):
    """用户角色"""
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

# 2. 带验证器的模型
class AdvancedUser(BaseModel):
    """高级用户模型"""
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., description="邮箱地址")
    age: int = Field(..., ge=0, le=150)
    role: UserRole = Field(default=UserRole.USER, description="用户角色")
    tags: List[str] = Field(default_factory=list, description="用户标签")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="元数据")
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """验证邮箱格式"""
        if '@' not in v:
            raise ValueError('邮箱格式不正确')
        return v.lower()
    
    @model_validator(mode='after')
    def validate_model(self):
        """模型级验证"""
        if self.age < 18 and self.role == UserRole.ADMIN:
            raise ValueError('管理员年龄不能小于18岁')
        return self

# 3. 嵌套模型
class Address(BaseModel):
    """地址模型"""
    street: str
    city: str
    country: str = "中国"
    postal_code: Optional[str] = None

class UserWithAddress(BaseModel):
    """带地址的用户模型"""
    username: str
    address: Address
    previous_addresses: List[Address] = Field(default_factory=list)

# 4. 模型序列化和反序列化
class SerializationExample(BaseModel):
    """序列化示例"""
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# 使用示例
if __name__ == "__main__":
    # 创建用户
    user = AdvancedUser(
        username="zhangsan",
        email="ZhangSan@Example.com",
        age=25,
        role=UserRole.ADMIN,
        tags=["python", "fastapi"],
        metadata={"department": "技术部"}
    )
    
    print(f"用户: {user.model_dump()}")
    print(f"JSON: {user.model_dump_json(indent=2)}")
    
    # 带地址的用户
    user_with_address = UserWithAddress(
        username="lisi",
        address=Address(street="中关村大街1号", city="北京"),
        previous_addresses=[
            Address(street="五道口", city="北京")
        ]
    )
    
    print(f"\n带地址的用户: {user_with_address.model_dump()}")
    
    # 验证错误示例
    try:
        invalid_user = AdvancedUser(
            username="ab",  # 太短
            email="invalid-email",  # 格式错误
            age=-5,  # 无效年龄
            role=UserRole.ADMIN
        )
    except Exception as e:
        print(f"\n验证错误: {e}")
```

```python
# FastAPI 依赖注入示例

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# 安全方案
security = HTTPBearer()

# 依赖注入函数
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """获取当前用户（依赖注入）"""
    token = credentials.credentials
    
    # 模拟验证 token
    if token == "invalid-token":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭证"
        )
    
    # 模拟用户信息
    return {"id": 1, "username": "admin", "role": "admin"}

async def verify_admin_role(current_user: dict = Depends(get_current_user)):
    """验证管理员角色"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足"
        )
    return current_user

# 使用依赖注入的端点
@app.get("/protected")
async def protected_endpoint(current_user: dict = Depends(get_current_user)):
    """需要认证的端点"""
    return {"message": f"你好, {current_user['username']}"}

@app.get("/admin")
async def admin_endpoint(admin: dict = Depends(verify_admin_role)):
    """需要管理员权限的端点"""
    return {"message": f"管理员 {admin['username']}，欢迎访问"}

# 运行应用
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | FastAPI 未安装 | 运行 `pip install fastapi[all]` |
| 2 | Pydantic 验证失败 | 检查字段定义和验证器 |
| 3 | 422 错误 | 请求数据格式不正确，检查 JSON 结构 |
| 4 | 依赖注入不工作 | 检查函数签名和参数类型 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| FastAPI | 现代高性能 Python Web 框架 |
| Pydantic | 数据验证和序列化库 |
| 路由 | URL 到处理函数的映射 |
| 端点 | API 的具体接口 |
| 依赖注入 | 自动提供函数所需依赖的机制 |
| 中间件 | 请求/响应处理管道 |
| OpenAPI | API 文档标准 |

## ✅ 验收清单
- [ ] 能创建 FastAPI 应用
- [ ] 理解 Pydantic v2 模型定义
- [ ] 能创建 GET/POST 端点
- [ ] 能访问自动生成的 API 文档

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
