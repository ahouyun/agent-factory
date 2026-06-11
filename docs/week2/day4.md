# Day 4: JWT 认证 + 中间件

## 今日学习目标

1. 理解 JWT（JSON Web Token）的工作原理
2. 实现用户认证系统
3. 创建自定义中间件
4. 保护 API 端点
5. 理解 CORS 配置

---

## 第一部分：JWT 基础

### 什么是 JWT？

**类比理解：**
JWT 就像身份证：
- 包含你的身份信息（payload）
- 由权威机构签发（签名）
- 在有效期内有效（过期时间）
- 携带方便，随时可以验证

### JWT 结构

```
JWT = Header.Payload.Signature

Header（头部）:
{
  "alg": "HS256",      // 签名算法
  "typ": "JWT"         // 令牌类型
}

Payload（载荷）:
{
  "sub": "1234567890", // 用户ID
  "name": "John Doe",  // 用户名
  "iat": 1516239022,   // 签发时间
  "exp": 1516242622    // 过期时间
}

Signature（签名）:
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### JWT 流程

```
1. 用户登录
   ↓
2. 服务器验证用户名密码
   ↓
3. 服务器生成 JWT
   ↓
4. 返回 JWT 给客户端
   ↓
5. 客户端存储 JWT（localStorage/Cookie）
   ↓
6. 后续请求携带 JWT（Authorization 头）
   ↓
7. 服务器验证 JWT
   ↓
8. 处理请求并返回响应
```

---

## 第二部分：环境配置

### 安装依赖

```bash
# 安装认证相关依赖
pip install python-jose[cryptography] passlib[bcrypt]

# 验证安装
pip list | grep -i "jose\|passlib"
```

**预期输出：**
```
python-jose              3.3.0
passlib                  1.7.4
```

---

## 第三部分：完整认证系统

### 文件：app/core/security.py

```python
"""
安全相关工具函数
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

# ==================== 配置 ====================

# 密钥（实际应用中应从环境变量获取）
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-keep-it-secret-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# ==================== 密码哈希 ====================

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """获取密码哈希"""
    return pwd_context.hash(password)


# ==================== JWT 令牌 ====================

def create_access_token(
    data: dict, 
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    创建访问令牌
    
    Args:
        data: 令牌数据
        expires_delta: 过期时间增量
    
    Returns:
        JWT 令牌字符串
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """
    创建刷新令牌
    
    Args:
        data: 令牌数据
    
    Returns:
        JWT 令牌字符串
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """
    解码 JWT 令牌
    
    Args:
        token: JWT 令牌字符串
    
    Returns:
        令牌数据字典，如果无效则返回 None
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_token_data(token: str) -> Optional[dict]:
    """
    获取令牌数据
    
    Args:
        token: JWT 令牌字符串
    
    Returns:
        包含用户信息的字典
    """
    payload = decode_token(token)
    if payload is None:
        return None
    
    # 检查令牌类型
    if payload.get("type") != "access":
        return None
    
    return {
        "user_id": payload.get("sub"),
        "username": payload.get("username")
    }
```

### 文件：app/core/deps.py

```python
"""
FastAPI 依赖注入函数
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.crud.user import get_user, get_user_by_username
from app.core.security import get_token_data

# 安全方案
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    获取当前认证用户
    
    用法：
    @app.get("/protected")
    async def protected_endpoint(current_user: User = Depends(get_current_user)):
        return {"user": current_user.username}
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证凭证",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    token_data = get_token_data(token)
    
    if token_data is None:
        raise credentials_exception
    
    user = get_user(db, user_id=token_data["user_id"])
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    获取当前激活用户
    
    用法：
    @app.get("/active")
    async def active_endpoint(user: User = Depends(get_current_active_user)):
        return {"user": user.username}
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户未激活"
        )
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    获取当前超级管理员
    
    用法：
    @app.get("/admin")
    async def admin_endpoint(admin: User = Depends(get_current_superuser)):
        return {"admin": admin.username}
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    return current_user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    获取可选的当前用户（不强制认证）
    
    用法：
    @app.get("/optional")
    async def optional_endpoint(user: Optional[User] = Depends(get_optional_user)):
        if user:
            return {"user": user.username}
        return {"user": None}
    """
    if credentials is None:
        return None
    
    token = credentials.credentials
    token_data = get_token_data(token)
    
    if token_data is None:
        return None
    
    return get_user(db, user_id=token_data["user_id"])
```

### 文件：app/api/auth.py

```python
"""
认证 API 路由
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.crud.user import (
    get_user_by_username, 
    create_user,
    update_last_login
)
from app.core.security import (
    verify_password, 
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["认证"])


# ==================== 请求/响应模型 ====================

class TokenResponse(BaseModel):
    """令牌响应"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    """刷新令牌请求"""
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    """修改密码请求"""
    old_password: str
    new_password: str


# ==================== 认证端点 ====================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="用户注册"
)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """用户注册"""
    # 检查用户名是否已存在
    if get_user_by_username(db, user_in.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    # 创建用户
    password_hash = get_password_hash(user_in.password)
    user = create_user(db, user_in, password_hash)
    
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="用户登录"
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """用户登录"""
    # 获取用户
    user = get_user_by_username(db, form_data.username)
    
    # 验证用户名和密码
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # 检查用户是否激活
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户未激活"
        )
    
    # 创建令牌
    from datetime import timedelta
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "username": user.username},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "username": user.username}
    )
    
    # 更新最后登录时间
    update_last_login(db, user)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="刷新令牌"
)
async def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """使用刷新令牌获取新的访问令牌"""
    from datetime import timedelta
    
    # 解码刷新令牌
    payload = decode_token(request.refresh_token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的刷新令牌"
        )
    
    # 检查令牌类型
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的令牌类型"
        )
    
    # 获取用户
    user_id = payload.get("sub")
    user = get_user_by_username(db, payload.get("username"))
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在"
        )
    
    # 创建新令牌
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "username": user.username},
        expires_delta=access_token_expires
    )
    new_refresh_token = create_refresh_token(
        data={"sub": str(user.id), "username": user.username}
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="获取当前用户信息"
)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """获取当前登录用户的信息"""
    return current_user


@router.post(
    "/change-password",
    summary="修改密码"
)
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """修改当前用户的密码"""
    # 验证旧密码
    if not verify_password(request.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="旧密码错误"
        )
    
    # 更新密码
    new_password_hash = get_password_hash(request.new_password)
    current_user.password_hash = new_password_hash
    current_user.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "密码修改成功"}
```

### 文件：app/main.py（更新版本）

```python
"""
Agent Factory API - 带认证的完整版本
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db
from app.api import auth, users, tasks


# 应用生命周期
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    print("正在启动应用...")
    init_db()
    print("数据库初始化完成")
    
    yield
    
    # 关闭时
    print("正在关闭应用...")


# 创建应用
app = FastAPI(
    title="Agent Factory API",
    description="智能体工厂的后端 API 服务",
    version="0.1.0",
    lifespan=lifespan
)

# ==================== 中间件配置 ====================

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== 注册路由 ====================

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")


# 根端点
@app.get("/")
async def root():
    """根端点"""
    return {
        "message": "Agent Factory API",
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}
```

---

## 第四部分：中间件

### 文件：app/middleware/logging.py

```python
"""
日志中间件
"""

import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """日志中间件 - 记录所有请求和响应"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # 请求开始时间
        start_time = time.time()
        
        # 记录请求信息
        logger.info(f"请求开始: {request.method} {request.url.path}")
        logger.info(f"客户端IP: {request.client.host}")
        
        # 处理请求
        response = await call_next(request)
        
        # 计算处理时间
        process_time = time.time() - start_time
        
        # 记录响应信息
        logger.info(
            f"请求完成: {request.method} {request.url.path} "
            f"状态码: {response.status_code} "
            f"耗时: {process_time:.4f}s"
        )
        
        # 添加处理时间头
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
```

### 文件：app/middleware/rate_limit.py

```python
"""
限流中间件
"""

import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable, Dict, List
from collections import defaultdict
from datetime import datetime, timedelta


class RateLimitMiddleware(BaseHTTPMiddleware):
    """限流中间件 - 限制请求频率"""
    
    def __init__(
        self, 
        app, 
        max_requests: int = 100, 
        window_seconds: int = 60
    ):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[datetime]] = defaultdict(list)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # 获取客户端 IP
        client_ip = request.client.host
        
        # 清理过期请求
        now = datetime.now()
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if now - req_time < timedelta(seconds=self.window_seconds)
        ]
        
        # 检查是否超过限制
        if len(self.requests[client_ip]) >= self.max_requests:
            return Response(
                content="请求过于频繁，请稍后再试",
                status_code=429,
                headers={"Retry-After": str(self.window_seconds)}
            )
        
        # 记录请求
        self.requests[client_ip].append(now)
        
        # 处理请求
        response = await call_next(request)
        
        # 添加限流信息头
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(
            self.max_requests - len(self.requests[client_ip])
        )
        
        return response
```

### 文件：app/middleware/request_id.py

```python
"""
请求 ID 中间件
"""

import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable


class RequestIDMiddleware(BaseHTTPMiddleware):
    """请求 ID 中间件 - 为每个请求生成唯一 ID"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # 生成请求 ID
        request_id = str(uuid.uuid4())
        
        # 存储到 request.state
        request.state.request_id = request_id
        
        # 处理请求
        response = await call_next(request)
        
        # 添加请求 ID 头
        response.headers["X-Request-ID"] = request_id
        
        return response
```

### 文件：app/middleware/__init__.py

```python
"""
中间件包
"""

from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.request_id import RequestIDMiddleware

__all__ = ["LoggingMiddleware", "RateLimitMiddleware", "RequestIDMiddleware"]
```

---

## 第五部分：测试认证流程

### 完整测试脚本

```bash
#!/bin/bash
# test_auth.sh - 认证测试脚本

BASE_URL="http://localhost:8000/api/v1"

echo "=== 1. 用户注册 ==="
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "full_name": "Test User",
    "password": "SecurePass123"
  }' | jq .

echo -e "\n=== 2. 用户登录 ==="
LOGIN_RESPONSE=$(curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=SecurePass123")

echo $LOGIN_RESPONSE | jq .

# 提取令牌
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.refresh_token')

echo -e "\n=== 3. 获取当前用户信息 ==="
curl -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .

echo -e "\n=== 4. 访问受保护端点（需要认证）==="
curl -X GET "$BASE_URL/users/1" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .

echo -e "\n=== 5. 刷新令牌 ==="
curl -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}" | jq .

echo -e "\n=== 6. 修改密码 ==="
curl -X POST "$BASE_URL/auth/change-password" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "SecurePass123",
    "new_password": "NewSecurePass456"
  }' | jq .

echo -e "\n=== 7. 重新登录 ==="
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=NewSecurePass456" | jq .
```

---

## 验证清单

完成今日学习后，检查以下项目：

- [ ] 理解 JWT 的结构和工作原理
- [ ] 实现了密码哈希功能
- [ ] 实现了用户注册端点
- [ ] 实现了用户登录端点
- [ ] 实现了令牌刷新端点
- [ ] 创建了认证依赖注入函数
- [ ] 创建了自定义中间件
- [ ] 测试了完整的认证流程
- [ ] 理解了 CORS 配置

---

## 今日小结

| 概念 | 关键点 |
|------|--------|
| JWT | JSON Web Token，无状态认证 |
| 访问令牌 | 短期有效，用于 API 访问 |
| 刷新令牌 | 长期有效，用于获取新访问令牌 |
| 密码哈希 | bcrypt 单向加密 |
| 中间件 | 请求/响应处理管道 |
| CORS | 跨源资源共享配置 |
| 依赖注入 | 自动提供认证用户 |

---

## 明日预告

明天我们将学习：
- WebSocket 基础
- 实时通信
- 聊天应用实现
- 连接管理

---

## 参考资源

- [JWT 官方文档](https://jwt.io/)
- [FastAPI 安全教程](https://fastapi.tiangolo.com/tutorial/security/)
- [OAuth 2.0 规范](https://oauth.net/2/)
