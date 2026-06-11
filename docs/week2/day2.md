# Day 2: 路由设计 + 请求验证 + 错误处理

## 今日学习目标

1. 掌握 RESTful 路由设计原则
2. 实现复杂的请求验证逻辑
3. 构建全局错误处理系统
4. 创建完整的 CRUD API 示例
5. 理解 HTTP 方法和状态码的正确使用

---

## 第一部分：RESTful 路由设计

### 什么是 RESTful？

**类比理解：**
RESTful 就像餐厅的菜单设计：
- GET `/dishes` = 看菜单（获取所有菜品）
- POST `/orders` = 下单（创建新订单）
- GET `/orders/123` = 查看订单状态
- PUT `/orders/123` = 修改订单
- DELETE `/orders/123` = 取消订单

### HTTP 方法对照表

| 方法 | 用途 | 幂等性 | 安全性 | 示例 |
|------|------|--------|--------|------|
| GET | 获取资源 | 是 | 是 | 获取用户列表 |
| POST | 创建资源 | 否 | 否 | 创建新用户 |
| PUT | 替换资源 | 是 | 否 | 更新整个用户信息 |
| PATCH | 部分更新 | 否 | 否 | 修改用户邮箱 |
| DELETE | 删除资源 | 是 | 否 | 删除用户 |

### 状态码使用规范

```python
# 状态码分类
"""
2xx 成功
200 OK - 请求成功
201 Created - 创建成功
204 No Content - 删除成功，无返回内容

3xx 重定向
301 Moved Permanently - 永久重定向
304 Not Modified - 资源未修改

4xx 客户端错误
400 Bad Request - 请求格式错误
401 Unauthorized - 未认证
403 Forbidden - 无权限
404 Not Found - 资源不存在
409 Conflict - 冲突（如用户名已存在）
422 Unprocessable Entity - 验证失败

5xx 服务端错误
500 Internal Server Error - 服务器内部错误
502 Bad Gateway - 网关错误
503 Service Unavailable - 服务不可用
"""
```

---

## 第二部分：完整 CRUD API 示例

### 文件：app/main.py（完整代码）

```python
"""
Agent Factory API - 完整 CRUD 示例
"""

from fastapi import FastAPI, HTTPException, Query, Path, Body, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import re

# 创建应用
app = FastAPI(
    title="Agent Factory API",
    description="智能体工厂的后端 API 服务",
    version="0.1.0"
)


# ==================== 数据模型 ====================

class TaskStatus(str, Enum):
    """任务状态枚举"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(int, Enum):
    """任务优先级枚举"""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    URGENT = 4


class TaskCreate(BaseModel):
    """创建任务的请求模型"""
    title: str = Field(
        ..., 
        min_length=1, 
        max_length=100,
        description="任务标题",
        examples=["学习 FastAPI"]
    )
    description: Optional[str] = Field(
        None, 
        max_length=500,
        description="任务描述",
        examples=["完成 Day 2 的学习内容"]
    )
    priority: TaskPriority = Field(
        default=TaskPriority.MEDIUM,
        description="任务优先级"
    )
    tags: List[str] = Field(
        default_factory=list,
        description="任务标签",
        examples=[["学习", "Python"]]
    )
    due_date: Optional[datetime] = Field(
        None,
        description="截止日期"
    )

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        """验证标题不包含特殊字符"""
        if re.search(r'[<>{}]', v):
            raise ValueError('标题不能包含 < > { } 字符')
        return v.strip()


class TaskUpdate(BaseModel):
    """更新任务的请求模型（所有字段可选）"""
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    """任务响应模型"""
    id: int = Field(..., description="任务ID")
    title: str = Field(..., description="任务标题")
    description: Optional[str] = Field(None, description="任务描述")
    status: TaskStatus = Field(..., description="任务状态")
    priority: TaskPriority = Field(..., description="任务优先级")
    tags: List[str] = Field(default_factory=list, description="任务标签")
    due_date: Optional[datetime] = Field(None, description="截止日期")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

    class Config:
        from_attributes = True


class PaginatedResponse(BaseModel):
    """分页响应模型"""
    items: List[TaskResponse] = Field(..., description="数据列表")
    total: int = Field(..., description="总数")
    page: int = Field(..., description="当前页")
    page_size: int = Field(..., description="每页数量")
    total_pages: int = Field(..., description="总页数")


# ==================== 模拟数据库 ====================

tasks_db: Dict[int, dict] = {}
task_id_counter = 1


def get_task(task_id: int) -> Optional[dict]:
    """获取单个任务"""
    return tasks_db.get(task_id)


def get_tasks(
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10
) -> tuple[List[dict], int]:
    """获取任务列表（带过滤和分页）"""
    tasks = list(tasks_db.values())
    
    # 按状态过滤
    if status:
        tasks = [t for t in tasks if t["status"] == status]
    
    # 按优先级过滤
    if priority:
        tasks = [t for t in tasks if t["priority"] == priority]
    
    # 按标签过滤
    if tag:
        tasks = [t for t in tasks if tag in t.get("tags", [])]
    
    # 搜索标题
    if search:
        tasks = [t for t in tasks if search.lower() in t["title"].lower()]
    
    # 计算总数
    total = len(tasks)
    
    # 分页
    start = (page - 1) * page_size
    end = start + page_size
    tasks = tasks[start:end]
    
    return tasks, total


# ==================== 路由定义 ====================

@app.get("/")
async def root():
    """根端点 - API 健康检查"""
    return {
        "message": "Agent Factory API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


# ==================== 任务 CRUD ====================

@app.post(
    "/api/v1/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="创建新任务",
    description="创建一个新的任务，返回创建的任务信息",
    responses={
        201: {"description": "任务创建成功"},
        422: {"description": "验证错误"}
    }
)
async def create_task(task: TaskCreate = Body(...)):
    """
    创建新任务
    
    - **title**: 任务标题（必填，1-100字符）
    - **description**: 任务描述（可选）
    - **priority**: 优先级（默认：中）
    - **tags**: 标签列表（可选）
    - **due_date**: 截止日期（可选）
    """
    global task_id_counter
    
    now = datetime.now()
    new_task = {
        "id": task_id_counter,
        "title": task.title,
        "description": task.description,
        "status": TaskStatus.PENDING,
        "priority": task.priority,
        "tags": task.tags,
        "due_date": task.due_date,
        "created_at": now,
        "updated_at": now
    }
    
    tasks_db[task_id_counter] = new_task
    task_id_counter += 1
    
    return new_task


@app.get(
    "/api/v1/tasks",
    response_model=PaginatedResponse,
    summary="获取任务列表",
    description="获取任务列表，支持过滤、搜索和分页"
)
async def list_tasks(
    status: Optional[TaskStatus] = Query(None, description="按状态过滤"),
    priority: Optional[TaskPriority] = Query(None, description="按优先级过滤"),
    tag: Optional[str] = Query(None, description="按标签过滤"),
    search: Optional[str] = Query(None, description="搜索标题"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量")
):
    """
    获取任务列表
    
    支持以下过滤和排序：
    - 按状态过滤
    - 按优先级过滤
    - 按标签过滤
    - 搜索标题
    - 分页
    """
    tasks, total = get_tasks(
        status=status,
        priority=priority,
        tag=tag,
        search=search,
        page=page,
        page_size=page_size
    )
    
    total_pages = (total + page_size - 1) // page_size
    
    return PaginatedResponse(
        items=tasks,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@app.get(
    "/api/v1/tasks/{task_id}",
    response_model=TaskResponse,
    summary="获取单个任务",
    description="根据任务ID获取任务详情",
    responses={
        200: {"description": "任务详情"},
        404: {"description": "任务不存在"}
    }
)
async def get_task_by_id(
    task_id: int = Path(..., title="任务ID", description="任务的唯一标识")
):
    """根据ID获取任务"""
    task = get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"任务ID {task_id} 不存在"
        )
    return task


@app.put(
    "/api/v1/tasks/{task_id}",
    response_model=TaskResponse,
    summary="更新任务",
    description="更新任务的所有或部分字段",
    responses={
        200: {"description": "任务更新成功"},
        404: {"description": "任务不存在"},
        422: {"description": "验证错误"}
    }
)
async def update_task(
    task_id: int,
    task_update: TaskUpdate = Body(...)
):
    """
    更新任务
    
    只会更新提供的字段，未提供的字段保持不变。
    """
    task = get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"任务ID {task_id} 不存在"
        )
    
    # 只更新提供的字段
    update_data = task_update.model_dump(exclude_unset=True)
    task.update(update_data)
    task["updated_at"] = datetime.now()
    
    return task


@app.patch(
    "/api/v1/tasks/{task_id}/status",
    response_model=TaskResponse,
    summary="更新任务状态",
    description="只更新任务的状态字段"
)
async def update_task_status(
    task_id: int,
    status: TaskStatus = Body(..., embed=True)
):
    """更新任务状态（部分更新）"""
    task = get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"任务ID {task_id} 不存在"
        )
    
    task["status"] = status
    task["updated_at"] = datetime.now()
    
    return task


@app.delete(
    "/api/v1/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="删除任务",
    description="删除指定的任务"
)
async def delete_task(
    task_id: int = Path(..., title="任务ID", description="任务的唯一标识")
):
    """删除任务"""
    if task_id not in tasks_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"任务ID {task_id} 不存在"
        )
    
    del tasks_db[task_id]
    return None


# ==================== 批量操作 ====================

@app.post(
    "/api/v1/tasks/batch",
    response_model=List[TaskResponse],
    status_code=status.HTTP_201_CREATED,
    summary="批量创建任务",
    description="一次性创建多个任务"
)
async def batch_create_tasks(tasks: List[TaskCreate] = Body(...)):
    """批量创建任务"""
    global task_id_counter
    created_tasks = []
    
    for task in tasks:
        now = datetime.now()
        new_task = {
            "id": task_id_counter,
            "title": task.title,
            "description": task.description,
            "status": TaskStatus.PENDING,
            "priority": task.priority,
            "tags": task.tags,
            "due_date": task.due_date,
            "created_at": now,
            "updated_at": now
        }
        
        tasks_db[task_id_counter] = new_task
        created_tasks.append(new_task)
        task_id_counter += 1
    
    return created_tasks


@app.delete(
    "/api/v1/tasks/batch",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="批量删除任务",
    description="根据ID列表批量删除任务"
)
async def batch_delete_tasks(task_ids: List[int] = Body(...)):
    """批量删除任务"""
    for task_id in task_ids:
        if task_id in tasks_db:
            del tasks_db[task_id]
    
    return None


# ==================== 统计端点 ====================

@app.get(
    "/api/v1/tasks/stats",
    summary="获取任务统计",
    description="获取任务的各种统计数据"
)
async def get_task_stats():
    """获取任务统计信息"""
    all_tasks = list(tasks_db.values())
    
    stats = {
        "total": len(all_tasks),
        "by_status": {},
        "by_priority": {},
        "by_tag": {}
    }
    
    for task in all_tasks:
        # 按状态统计
        status = task["status"].value
        stats["by_status"][status] = stats["by_status"].get(status, 0) + 1
        
        # 按优先级统计
        priority = task["priority"].value
        stats["by_priority"][priority] = stats["by_priority"].get(priority, 0) + 1
        
        # 按标签统计
        for tag in task.get("tags", []):
            stats["by_tag"][tag] = stats["by_tag"].get(tag, 0) + 1
    
    return stats


# ==================== 错误处理 ====================

@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """值错误处理器"""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)}
    )


# ==================== 启动 ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 第三部分：测试所有端点

### 创建任务

```bash
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "学习 FastAPI",
    "description": "完成 Day 2 的学习内容",
    "priority": 3,
    "tags": ["学习", "Python"],
    "due_date": "2024-01-20T23:59:59"
  }'
```

**预期输出：**
```json
{
  "id": 1,
  "title": "学习 FastAPI",
  "description": "完成 Day 2 的学习内容",
  "status": "pending",
  "priority": 3,
  "tags": ["学习", "Python"],
  "due_date": "2024-01-20T23:59:59",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

### 获取任务列表

```bash
# 获取所有任务
curl http://localhost:8000/api/v1/tasks

# 按状态过滤
curl "http://localhost:8000/api/v1/tasks?status=pending"

# 按优先级过滤
curl "http://localhost:8000/api/v1/tasks?priority=3"

# 搜索
curl "http://localhost:8000/api/v1/tasks?search=FastAPI"

# 分页
curl "http://localhost:8000/api/v1/tasks?page=1&page_size=5"
```

### 更新任务状态

```bash
curl -X PATCH http://localhost:8000/api/v1/tasks/1/status \
  -H "Content-Type: application/json" \
  -d '"in_progress"'
```

### 删除任务

```bash
curl -X DELETE http://localhost:8000/api/v1/tasks/1
```

### 批量操作

```bash
# 批量创建
curl -X POST http://localhost:8000/api/v1/tasks/batch \
  -H "Content-Type: application/json" \
  -d '[
    {"title": "任务1", "priority": 1},
    {"title": "任务2", "priority": 2},
    {"title": "任务3", "priority": 3}
  ]'

# 批量删除
curl -X DELETE http://localhost:8000/api/v1/tasks/batch \
  -H "Content-Type: application/json" \
  -d '[1, 2, 3]'
```

### 获取统计信息

```bash
curl http://localhost:8000/api/v1/tasks/stats
```

---

## 第四部分：错误处理最佳实践

### 自定义异常类

```python
"""
自定义异常类
"""

from fastapi import HTTPException, status
from typing import Any, Optional


class APIError(HTTPException):
    """API 基础异常"""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: Optional[str] = None,
        headers: Optional[dict] = None
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code
        self.headers = headers


class NotFoundError(APIError):
    """未找到错误"""
    
    def __init__(self, resource: str, resource_id: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} ID {resource_id} 不存在",
            error_code="NOT_FOUND"
        )


class ValidationError(APIError):
    """验证错误"""
    
    def __init__(self, field: str, message: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"字段 '{field}' 验证失败: {message}",
            error_code="VALIDATION_ERROR"
        )


class ConflictError(APIError):
    """冲突错误"""
    
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=message,
            error_code="CONFLICT"
        )


class UnauthorizedError(APIError):
    """未授权错误"""
    
    def __init__(self, message: str = "未授权访问"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            error_code="UNAUTHORIZED",
            headers={"WWW-Authenticate": "Bearer"}
        )


class ForbiddenError(APIError):
    """禁止访问错误"""
    
    def __init__(self, message: str = "无权限访问"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=message,
            error_code="FORBIDDEN"
        )


class RateLimitError(APIError):
    """请求频率限制错误"""
    
    def __init__(self, retry_after: int = 60):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"请求过于频繁，请 {retry_after} 秒后重试",
            error_code="RATE_LIMITED",
            headers={"Retry-After": str(retry_after)}
        )
```

### 全局异常处理器

```python
"""
全局异常处理器
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from datetime import datetime


def setup_exception_handlers(app: FastAPI):
    """设置全局异常处理器"""
    
    @app.exception_handler(APIError)
    async def api_error_handler(request: Request, exc: APIError):
        """API 错误处理器"""
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.error_code,
                    "message": exc.detail,
                    "timestamp": datetime.now().isoformat(),
                    "path": str(request.url)
                }
            },
            headers=exc.headers
        )
    
    @app.exception_handler(Exception)
    async def general_error_handler(request: Request, exc: Exception):
        """通用错误处理器"""
        # 记录日志
        print(f"未处理的异常: {type(exc).__name__}: {exc}")
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "服务器内部错误",
                    "timestamp": datetime.now().isoformat(),
                    "path": str(request.url)
                }
            }
        )
```

---

## 第五部分：实战练习

### 练习：创建博客文章 API

创建文件 `app/schemas/article.py`：

```python
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ArticleStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ArticleCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="文章标题")
    content: str = Field(..., min_length=10, description="文章内容")
    summary: Optional[str] = Field(None, max_length=500, description="文章摘要")
    tags: List[str] = Field(default_factory=list, description="文章标签")
    category: str = Field(..., description="文章分类")


class ArticleResponse(ArticleCreate):
    id: int
    status: ArticleStatus
    author_id: int
    view_count: int = 0
    like_count: int = 0
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ArticleUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=10)
    summary: Optional[str] = Field(None, max_length=500)
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    status: Optional[ArticleStatus] = None
```

---

## 验证清单

完成今日学习后，检查以下项目：

- [ ] 理解 RESTful 路由设计原则
- [ ] 能正确使用 HTTP 方法（GET/POST/PUT/PATCH/DELETE）
- [ ] 能正确使用状态码（200/201/204/400/404/422）
- [ ] 实现了完整的 CRUD 操作
- [ ] 实现了分页和过滤功能
- [ ] 实现了批量操作
- [ ] 使用了自定义异常类
- [ ] 实现了全局错误处理器
- [ ] 完成了至少一个实战练习

---

## 今日小结

| 概念 | 关键点 |
|------|--------|
| RESTful | 基于资源的 API 设计风格 |
| HTTP 方法 | GET/POST/PUT/PATCH/DELETE |
| 状态码 | 2xx成功/4xx客户端错误/5xx服务端错误 |
| 路径参数 | 资源的唯一标识 |
| 查询参数 | 过滤、排序、分页 |
| 请求体 | 创建/更新的数据 |
| 分页 | 避免一次返回太多数据 |
| 批量操作 | 提高效率，减少请求次数 |

---

## 明日预告

明天我们将学习：
- SQLAlchemy ORM 基础
- 数据库模型定义
- 数据库 CRUD 操作
- FastAPI 与数据库集成

---

## 参考资源

- [RESTful API 设计指南](https://restfulapi.net/)
- [HTTP 状态码完整列表](https://httpstatuses.com/)
- [FastAPI 高级用法](https://fastapi.tiangolo.com/advanced/)
