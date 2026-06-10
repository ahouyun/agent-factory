# 📅 Week 2 Day 2：路由设计 + 请求验证 + 错误处理

## 🧭 今日方向
> 今天我们将深入学习 FastAPI 的路由设计、请求验证和错误处理机制，构建更加健壮的 API。

## 🎯 生享比喻
> 路由设计就像城市的交通规划，请求验证是安检系统，错误处理是应急预案。三者结合才能让 API 安全、高效地运行。

## 📋 今日三件事
1. 设计 RESTful 风格的路由
2. 实现复杂的请求验证
3. 构建全局错误处理系统

## 🗺️ 手把手路线

### Step 1: 路由设计
- **做什么**: 设计符合 RESTful 规范的路由结构
- **为什么**: 好的路由设计让 API 更易理解和使用
- **成功标志**: 路由结构清晰、语义明确

### Step 2: 请求验证
- **做什么**: 实现复杂的请求参数验证
- **为什么**: 严格的验证防止无效数据进入系统
- **成功标志**: 能处理各种验证场景

### Step 3: 错误处理
- **做什么**: 构建全局错误处理和自定义异常
- **为什么**: 统一的错误处理让 API 更专业
- **成功标志**: 错误响应格式统一、信息明确

## 💻 代码区

```python
# RESTful 路由设计

from fastapi import FastAPI, HTTPException, Query, Path, Body
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

app = FastAPI(title="Agent Factory API - 路由设计示例")

# 枚举类型
class TaskStatus(str, Enum):
    """任务状态"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TaskPriority(int, Enum):
    """任务优先级"""
    LOW = 1
    MEDIUM = 2
    HIGH = 3

# 数据模型
class TaskBase(BaseModel):
    """任务基础模型"""
    title: str = Field(..., min_length=1, max_length=100, description="任务标题")
    description: Optional[str] = Field(None, max_length=500, description="任务描述")
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM, description="优先级")

class TaskCreate(TaskBase):
    """创建任务"""
    pass

class TaskUpdate(BaseModel):
    """更新任务"""
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None

class TaskResponse(TaskBase):
    """任务响应"""
    id: int
    status: TaskStatus
    created_at: str
    updated_at: str

# 模拟数据库
tasks_db: List[dict] = []

# 路由设计 - 任务管理
@app.get("/api/v1/tasks", response_model=List[TaskResponse])
async def list_tasks(
    status: Optional[TaskStatus] = Query(None, description="按状态过滤"),
    priority: Optional[TaskPriority] = Query(None, description="按优先级过滤"),
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(10, ge=1, le=100, description="返回数量")
):
    """
    获取任务列表
    
    支持按状态和优先级过滤，支持分页
    """
    filtered_tasks = tasks_db
    
    # 过滤
    if status:
        filtered_tasks = [t for t in filtered_tasks if t["status"] == status]
    if priority:
        filtered_tasks = [t for t in filtered_tasks if t["priority"] == priority]
    
    # 分页
    return filtered_tasks[skip:skip + limit]

@app.post("/api/v1/tasks", response_model=TaskResponse, status_code=201)
async def create_task(task: TaskCreate = Body(...)):
    """创建新任务"""
    from datetime import datetime
    
    new_task = {
        "id": len(tasks_db) + 1,
        **task.model_dump(),
        "status": TaskStatus.PENDING,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    tasks_db.append(new_task)
    return new_task

@app.get("/api/v1/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int = Path(..., title="任务ID", description="任务的唯一标识")
):
    """根据ID获取任务"""
    for task in tasks_db:
        if task["id"] == task_id:
            return task
    raise HTTPException(status_code=404, detail="任务不存在")

@app.put("/api/v1/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate
):
    """更新任务"""
    from datetime import datetime
    
    for i, task in enumerate(tasks_db):
        if task["id"] == task_id:
            update_data = task_update.model_dump(exclude_unset=True)
            tasks_db[i].update(update_data)
            tasks_db[i]["updated_at"] = datetime.now().isoformat()
            return tasks_db[i]
    
    raise HTTPException(status_code=404, detail="任务不存在")

@app.delete("/api/v1/tasks/{task_id}")
async def delete_task(task_id: int):
    """删除任务"""
    for i, task in enumerate(tasks_db):
        if task["id"] == task_id:
            del tasks_db[i]
            return {"message": "任务已删除"}
    
    raise HTTPException(status_code=404, detail="任务不存在")

@app.patch("/api/v1/tasks/{task_id}/status")
async def update_task_status(
    task_id: int,
    status: TaskStatus = Body(..., embed=True)
):
    """更新任务状态（部分更新）"""
    from datetime import datetime
    
    for i, task in enumerate(tasks_db):
        if task["id"] == task_id:
            tasks_db[i]["status"] = status
            tasks_db[i]["updated_at"] = datetime.now().isoformat()
            return tasks_db[i]
    
    raise HTTPException(status_code=404, detail="任务不存在")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

```python
# 高级请求验证

from fastapi import FastAPI, Query, Path, Body, Header, Cookie
from pydantic import BaseModel, Field, validator, model_validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
import re

app = FastAPI()

# 1. 自定义验证器
class StrongPassword(BaseModel):
    """强密码模型"""
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('密码长度至少8位')
        if not re.search(r'[A-Z]', v):
            raise ValueError('密码必须包含大写字母')
        if not re.search(r'[a-z]', v):
            raise ValueError('密码必须包含小写字母')
        if not re.search(r'\d', v):
            raise ValueError('密码必须包含数字')
        return v

# 2. 复杂嵌套验证
class Address(BaseModel):
    """地址"""
    street: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    country: str = Field(default="中国")
    postal_code: Optional[str] = Field(None, regex=r'^\d{6}$')

class UserProfile(BaseModel):
    """用户资料"""
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    birthday: Optional[date] = None
    addresses: List[Address] = Field(default_factory=list)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    
    @model_validator(mode='after')
    def validate_user(self):
        """模型级验证"""
        # 验证邮箱格式
        if '@' not in self.email:
            raise ValueError('邮箱格式不正确')
        
        # 验证生日
        if self.birthday and self.birthday > date.today():
            raise ValueError('生日不能是未来日期')
        
        return self

# 3. 查询参数验证
@app.get("/api/v1/search")
async def search_items(
    q: str = Query(..., min_length=1, max_length=100, description="搜索关键词"),
    category: Optional[str] = Query(None, description="分类"),
    min_price: float = Query(0.0, ge=0, description="最低价格"),
    max_price: float = Query(float('inf'), ge=0, description="最高价格"),
    sort_by: str = Query("created_at", regex="^(created_at|price|name)$", description="排序字段"),
    order: str = Query("desc", regex="^(asc|desc)$", description="排序方向"),
    page: int = Query(1, ge=1, description="页码"),
    per_page: int = Query(20, ge=1, le=100, description="每页数量")
):
    """
    搜索物品
    
    支持多种过滤和排序选项
    """
    return {
        "query": q,
        "filters": {
            "category": category,
            "min_price": min_price,
            "max_price": max_price
        },
        "sort": {"by": sort_by, "order": order},
        "pagination": {"page": page, "per_page": per_page}
    }

# 4. 请求头验证
@app.get("/api/v1/protected")
async def protected_endpoint(
    authorization: str = Header(..., description="认证令牌"),
    user_agent: str = Header(None, description="用户代理"),
    x_request_id: Optional[str] = Header(None, description="请求ID")
):
    """需要认证的端点"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="无效的认证格式")
    
    return {
        "message": "访问成功",
        "token": authorization[7:],
        "user_agent": user_agent,
        "request_id": x_request_id
    }

# 5. Cookie 验证
@app.get("/api/v1/session")
async def session_endpoint(
    session_id: str = Cookie(..., description="会话ID"),
    csrf_token: Optional[str] = Cookie(None, description="CSRF令牌")
):
    """会话验证端点"""
    return {
        "session_id": session_id,
        "csrf_token": csrf_token
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

```python
# 全局错误处理

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime
from enum import Enum

# 自定义异常类
class ErrorCode(str, Enum):
    """错误码"""
    VALIDATION_ERROR = "VALIDATION_ERROR"
    NOT_FOUND = "NOT_FOUND"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    RATE_LIMITED = "RATE_LIMITED"
    INTERNAL_ERROR = "INTERNAL_ERROR"

class APIError(Exception):
    """API 基础异常"""
    
    def __init__(
        self,
        code: ErrorCode,
        message: str,
        details: Optional[dict] = None,
        status_code: int = 400
    ):
        self.code = code
        self.message = message
        self.details = details or {}
        self.status_code = status_code
        super().__init__(message)

class NotFoundError(APIError):
    """未找到错误"""
    
    def __init__(self, resource: str, resource_id: Any = None):
        details = {"resource": resource, "id": resource_id}
        super().__init__(
            code=ErrorCode.NOT_FOUND,
            message=f"{resource} 未找到",
            details=details,
            status_code=404
        )

class ValidationError(APIError):
    """验证错误"""
    
    def __init__(self, field: str, message: str):
        details = {"field": field}
        super().__init__(
            code=ErrorCode.VALIDATION_ERROR,
            message=message,
            details=details,
            status_code=422
        )

# 创建应用
app = FastAPI(title="Agent Factory API - 错误处理示例")

# 全局异常处理器
@app.exception_handler(APIError)
async def api_error_handler(request: Request, exc: APIError):
    """API 错误处理器"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code.value,
                "message": exc.message,
                "details": exc.details,
                "timestamp": datetime.now().isoformat(),
                "path": str(request.url)
            }
        }
    )

@app.exception_handler(Exception)
async def general_error_handler(request: Request, exc: Exception):
    """通用错误处理器"""
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "服务器内部错误",
                "details": {"exception_type": type(exc).__name__},
                "timestamp": datetime.now().isoformat(),
                "path": str(request.url)
            }
        }
    )

# 使用示例端点
@app.get("/api/v1/items/{item_id}")
async def get_item(item_id: int):
    """获取物品"""
    # 模拟未找到
    if item_id == 0:
        raise NotFoundError("物品", item_id)
    
    # 模拟验证错误
    if item_id < 0:
        raise ValidationError("item_id", "物品ID不能为负数")
    
    return {"id": item_id, "name": f"物品{item_id}"}

@app.get("/api/v1/error-demo")
async def error_demo():
    """错误演示端点"""
    # 触发不同的错误
    error_type = "not_found"
    
    if error_type == "not_found":
        raise NotFoundError("用户", 123)
    elif error_type == "validation":
        raise ValidationError("email", "邮箱格式不正确")
    else:
        raise APIError(
            code=ErrorCode.RATE_LIMITED,
            message="请求过于频繁",
            details={"retry_after": 60},
            status_code=429
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 路由冲突 | 检查路由顺序，具体路由放在前面 |
| 2 | 验证错误信息不明确 | 使用 Field 的 description 参数 |
| 3 | 异常处理器不生效 | 确保异常处理器在路由之前定义 |
| 4 | 嵌套验证失败 | 检查嵌套模型的字段定义 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| RESTful | 基于 HTTP 的 API 设计风格 |
| 路由 | URL 到处理函数的映射 |
| 查询参数 | URL 中 ? 后面的参数 |
| 路径参数 | URL 路径中的动态部分 |
| 请求体 | POST/PUT 请求中的数据 |
| 异常处理 | 捕获和处理错误的机制 |
| 中间件 | 请求/响应处理管道 |

## ✅ 验收清单
- [ ] 设计符合 RESTful 规范的路由
- [ ] 实现复杂的请求验证逻辑
- [ ] 构建全局错误处理系统
- [ ] 理解各种验证器的用法

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
