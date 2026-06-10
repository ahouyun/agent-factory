# 📅 Week 2 Day 4：JWT 认证 + 中间件

## 🧭 今日方向
> 今天我们将学习 JWT 认证机制和 FastAPI 中间件，为 API 添加安全防护和横切关注点处理。

## 🎯 生活比喻
> JWT 就像身份证，证明你是你；中间件就像安检系统，每个进出的人都要经过检查。

## 📋 今日三件事
1. 实现 JWT 令牌生成和验证
2. 构建用户认证系统
3. 创建自定义中间件

## 🗺️ 手把手路线

### Step 1: JWT 基础
- **做什么**: 学习 JWT 的结构和工作原理
- **为什么**: JWT 是现代 Web 应用最常用的认证方式
- **成功标志**: 能生成和验证 JWT 令牌

### Step 2: 认证系统
- **做什么**: 实现完整的用户登录和令牌刷新
- **为什么**: 安全的认证系统是 API 的基础
- **成功标志**: 能完成登录、注册、令牌刷新

### Step 3: 中间件
- **做什么**: 创建自定义中间件处理日志、限流等
- **为什么**: 中间件是处理横切关注点的好方法
- **成功标志**: 能创建和使用自定义中间件

## 💻 代码区

```python
# JWT 认证实现

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

# 配置
SECRET_KEY = "your-secret-key-keep-it-secret"  # 实际应用中应从环境变量获取
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# 密码哈希
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 安全方案
security = HTTPBearer()

# 数据模型
class Token(BaseModel):
    """令牌模型"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """令牌数据"""
    username: Optional[str] = None
    user_id: Optional[int] = None

class UserCreate(BaseModel):
    """创建用户"""
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    """用户响应"""
    id: int
    username: str
    email: str

# 模拟用户数据库
users_db = {}
user_id_counter = 1

# JWT 工具函数
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """获取密码哈希"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建访问令牌"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """创建刷新令牌"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> TokenData:
    """验证令牌"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的认证凭证"
            )
        
        return TokenData(username=username, user_id=user_id)
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭证"
        )

# 依赖注入
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """获取当前用户"""
    token = credentials.credentials
    token_data = verify_token(token)
    
    user = users_db.get(token_data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在"
        )
    
    return user

# FastAPI 应用
app = FastAPI(title="Agent Factory API - JWT 认证")

@app.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    """用户注册"""
    global user_id_counter
    
    # 检查用户名是否已存在
    if user.username in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    # 创建用户
    hashed_password = get_password_hash(user.password)
    new_user = {
        "id": user_id_counter,
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password
    }
    
    users_db[user.username] = new_user
    user_id_counter += 1
    
    return new_user

@app.post("/auth/login", response_model=Token)
async def login(username: str, password: str):
    """用户登录"""
    user = users_db.get(username)
    
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )
    
    # 创建令牌
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": username, "user_id": user["id"]},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": username, "user_id": user["id"]}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/auth/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    """刷新令牌"""
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的刷新令牌"
            )
        
        username = payload.get("sub")
        user = users_db.get(username)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户不存在"
            )
        
        # 创建新令牌
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        new_access_token = create_access_token(
            data={"sub": username, "user_id": user["id"]},
            expires_delta=access_token_expires
        )
        new_refresh_token = create_refresh_token(
            data={"sub": username, "user_id": user["id"]}
        )
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的刷新令牌"
        )

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """获取当前用户信息"""
    return current_user

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

```python
# 自定义中间件

import time
import logging
from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable, Dict
from collections import defaultdict
from datetime import datetime, timedelta

# 日志配置
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 1. 日志中间件
class LoggingMiddleware(BaseHTTPMiddleware):
    """日志中间件"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # 请求开始时间
        start_time = time.time()
        
        # 记录请求信息
        logger.info(f"请求开始: {request.method} {request.url.path}")
        
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

# 2. 限流中间件
class RateLimitMiddleware(BaseHTTPMiddleware):
    """限流中间件"""
    
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, list] = defaultdict(list)
    
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

# 3. CORS 中间件配置
from fastapi.middleware.cors import CORSMiddleware

# 创建应用
app = FastAPI(title="Agent Factory API - 中间件示例")

# 添加中间件
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware, max_requests=100, window_seconds=60)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 测试端点
@app.get("/")
async def root():
    return {"message": "中间件测试"}

@app.get("/slow")
async def slow_endpoint():
    """慢端点测试"""
    import asyncio
    await asyncio.sleep(1)
    return {"message": "慢响应完成"}

@app.get("/fast")
async def fast_endpoint():
    """快端点测试"""
    return {"message": "快响应完成"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

```python
# 中间件组合使用示例

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import time
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

# 1. 安全头中间件
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """安全头中间件"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # 添加安全头
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

# 2. 请求 ID 中间件
class RequestIDMiddleware(BaseHTTPMiddleware):
    """请求 ID 中间件"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        import uuid
        
        # 生成请求 ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # 处理请求
        response = await call_next(request)
        
        # 添加请求 ID 头
        response.headers["X-Request-ID"] = request_id
        
        return response

# 3. 性能监控中间件
class PerformanceMiddleware(BaseHTTPMiddleware):
    """性能监控中间件"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        
        # 记录慢请求
        if process_time > 1.0:
            logger.warning(
                f"慢请求: {request.method} {request.url.path} "
                f"耗时: {process_time:.4f}s"
            )
        
        return response

# 添加所有中间件
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(PerformanceMiddleware)

@app.get("/api/v1/data")
async def get_data():
    """获取数据端点"""
    return {"data": "示例数据"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理器"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "服务器内部错误",
            "request_id": getattr(request.state, "request_id", None)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | JWT 令牌无效 | 检查密钥是否正确，令牌是否过期 |
| 2 | 密码验证失败 | 确保使用正确的哈希算法 |
| 3 | 中间件不生效 | 检查中间件添加顺序，后添加的先执行 |
| 4 | 限流不准确 | 检查时间窗口计算，确保清理过期记录 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| JWT | JSON Web Token，用于安全传输信息 |
| 访问令牌 | 短期有效的认证令牌 |
| 刷新令牌 | 长期有效的令牌，用于获取新访问令牌 |
| 中间件 | 在请求/响应处理管道中插入的处理程序 |
| CORS | 跨源资源共享，处理跨域请求 |
| 限流 | 限制客户端请求频率 |

## ✅ 验收清单
- [ ] 能生成和验证 JWT 令牌
- [ ] 实现完整的用户认证流程
- [ ] 创建自定义中间件
- [ ] 理解中间件执行顺序

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
