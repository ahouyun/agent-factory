# 📅 Day 1 - Docker 容器化 + Docker Compose + 密钥管理

> **Week 12 . 生产部署** | **日期**: 2026-06-15

---

## 今日方向

今天我们把之前开发的 Agent 项目"装箱打包"——用 Docker 容器化整个应用，用 Docker Compose 编排多个服务，并学习如何安全管理生产环境中的密钥和敏感信息。这是从开发环境迈向生产环境的第一步。

---

## 生活比喻

> 想象你要搬家。你的 Agent 项目就像一屋子的家具和物品。Docker 就是你买的**标准化搬家箱**——不管新家（服务器）的地板是什么材质、水压多大，箱子里的东西永远完好。Docker Compose 就是你的**搬家清单**——列明哪个箱子放卧室、哪个放厨房，先搬哪个后搬哪个。而密钥管理就像**把贵重珠宝锁进保险箱**，而不是随便放在纸箱里寄出去。

---

## 今日三件事

1. **编写多阶段 Dockerfile** -- 让镜像更小、构建更快
2. **编写 docker-compose.yml** -- 编排 Agent 服务 + Redis + 数据库
3. **管理密钥与环境变量** -- Docker secrets + .env 文件最佳实践

---

## 手把手路线

### 阶段一：项目结构准备

```
agent-project/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── agent.py
│   └── config.py
├── tests/
│   └── test_agent.py
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .dockerignore
├── requirements.txt
└── scripts/
    ├── setup-secrets.sh
    └── build-and-run.sh
```

### 阶段二：理解 Docker 核心概念

| 概念 | 一句话解释 | 生活类比 |
|------|-----------|---------|
| Docker Image | 只读的软件模板 | 搬家箱的尺寸标准 |
| Container | 镜像的运行实例 | 实际装了东西的箱子 |
| Dockerfile | 构建镜像的脚本 | 打包操作手册 |
| Volume | 数据持久化存储 | 箱子里加了锁的抽屉 |
| Network | 容器间通信网络 | 搬家公司内部的对讲机 |
| Secret | 敏感信息管理 | 保险箱 |

### 阶段三：编写多阶段 Dockerfile

### 阶段四：编写 docker-compose.yml

### 阶段五：密钥管理与 .env 配置

### 阶段六：构建并验证

---

## 代码区

### 1. 应用配置模块

```python
# app/config.py
"""应用配置模块 -- 从环境变量读取配置"""
import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class AppConfig:
    """应用核心配置"""
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False

    # 数据库配置
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "agent_db"
    db_user: str = "agent_user"
    db_password: str = ""

    # Redis 配置
    redis_host: str = "localhost"
    redis_port: int = 6379

    # API 密钥（必须从环境变量读取）
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # Agent 配置
    agent_model: str = "gpt-4"
    max_tokens: int = 4096
    temperature: float = 0.7

    # 安全配置
    secret_key: str = ""

    @classmethod
    def from_env(cls) -> "AppConfig":
        """从环境变量加载配置"""
        config = cls(
            host=os.getenv("APP_HOST", "0.0.0.0"),
            port=int(os.getenv("APP_PORT", "8000")),
            debug=os.getenv("APP_DEBUG", "false").lower() == "true",
            db_host=os.getenv("DB_HOST", "db"),
            db_port=int(os.getenv("DB_PORT", "5432")),
            db_name=os.getenv("DB_NAME", "agent_db"),
            db_user=os.getenv("DB_USER", "agent_user"),
            db_password=os.getenv("DB_PASSWORD", ""),
            redis_host=os.getenv("REDIS_HOST", "redis"),
            redis_port=int(os.getenv("REDIS_PORT", "6379")),
            openai_api_key=os.getenv("OPENAI_API_KEY", ""),
            anthropic_api_key=os.getenv("ANTHROPIC_API_KEY", ""),
            agent_model=os.getenv("AGENT_MODEL", "gpt-4"),
            max_tokens=int(os.getenv("MAX_TOKENS", "4096")),
            temperature=float(os.getenv("TEMPERATURE", "0.7")),
            secret_key=os.getenv("SECRET_KEY", ""),
        )

        # 验证必填配置
        missing = []
        if not config.db_password:
            missing.append("DB_PASSWORD")
        if not config.secret_key:
            missing.append("SECRET_KEY")
        if missing:
            raise ValueError(f"缺少必要的环境变量: {', '.join(missing)}")
        return config


# 全局配置单例
_config: Optional[AppConfig] = None


def get_config() -> AppConfig:
    """获取全局配置"""
    global _config
    if _config is None:
        _config = AppConfig.from_env()
    return _config
```

### 2. Agent 核心模块

```python
# app/agent.py
"""Agent 核心逻辑"""
import logging
from datetime import datetime
from typing import Any

logger = logging.getLogger(__name__)


class Agent:
    """生产级 Agent 类"""

    def __init__(self, config):
        self.config = config
        self.name = "AgentFactory-Bot"
        self.version = "1.0.0"
        logger.info(f"Agent {self.name} v{self.version} 初始化完成")

    async def process(self, message: str) -> dict[str, Any]:
        """处理用户消息"""
        logger.info(f"收到消息: {message[:50]}...")
        start_time = datetime.now()

        result = {
            "agent": self.name,
            "version": self.version,
            "input": message,
            "output": f"Echo: {message}",
            "model": self.config.agent_model,
            "tokens_used": len(message.split()),
            "timestamp": datetime.now().isoformat(),
            "latency_ms": int(
                (datetime.now() - start_time).total_seconds() * 1000
            ),
        }
        logger.info(f"处理完成, 耗时: {result['latency_ms']}ms")
        return result

    def health_check(self) -> dict[str, Any]:
        """健康检查"""
        return {
            "status": "healthy",
            "agent": self.name,
            "version": self.version,
            "model": self.config.agent_model,
            "timestamp": datetime.now().isoformat(),
        }
```

### 3. FastAPI 应用入口

```python
# app/main.py
"""应用主入口"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .config import get_config
from .agent import Agent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

agent: Agent = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    global agent
    config = get_config()
    agent = Agent(config)
    logger.info("Agent 应用启动完成")
    yield
    logger.info("Agent 应用关闭")


app = FastAPI(
    title="Agent Factory API",
    description="生产级 AI Agent 服务",
    version="1.0.0",
    lifespan=lifespan,
)


class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"


class ChatResponse(BaseModel):
    agent: str
    version: str
    input: str
    output: str
    model: str
    tokens_used: int
    timestamp: str
    latency_ms: int


@app.get("/health")
async def health_check():
    return agent.health_check()


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="消息不能为空")
    result = await agent.process(request.message)
    return ChatResponse(**result)


@app.get("/")
async def root():
    config = get_config()
    return {
        "service": "Agent Factory",
        "version": "1.0.0",
        "model": config.agent_model,
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    config = get_config()
    uvicorn.run(
        "app.main:app",
        host=config.host,
        port=config.port,
        reload=config.debug,
    )
```

### 4. 依赖文件

```txt
# requirements.txt
fastapi==0.115.0
uvicorn[standard]==0.30.0
pydantic==2.9.0
httpx==0.27.0
redis==5.0.0
python-dotenv==1.0.0
```

### 5. 多阶段 Dockerfile

```dockerfile
# Dockerfile -- 多阶段构建
# ===== 阶段一：构建阶段 =====
FROM python:3.12-slim as builder

WORKDIR /build

# 安装构建依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件（利用 Docker 缓存层）
COPY requirements.txt .

# 创建虚拟环境并安装依赖
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# ===== 阶段二：运行阶段 =====
FROM python:3.12-slim as runtime

LABEL maintainer="agent-factory"
LABEL description="Agent Factory 生产镜像"

# 安装运行时依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 从构建阶段复制虚拟环境
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 创建非 root 用户（安全最佳实践）
RUN groupadd -r agent && useradd -r -g agent -d /app -s /sbin/nologin agent

WORKDIR /app
COPY app/ ./app/
COPY pyproject.toml .

RUN chown -R agent:agent /app
USER agent

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    APP_HOST=0.0.0.0 \
    APP_PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### 6. .dockerignore

```txt
.git
.gitignore
.env
.env.*
!.env.example
__pycache__
*.pyc
*.pyo
.pytest_cache
.mypy_cache
.coverage
htmlcov/
dist/
build/
*.egg-info
.venv/
venv/
node_modules/
*.md
docker-compose*.yml
Dockerfile*
.vscode/
.idea/
```

### 7. docker-compose.yml

```yaml
# docker-compose.yml
version: "3.9"

services:
  # ===== Agent 主服务 =====
  agent-api:
    build:
      context: .
      dockerfile: Dockerfile
      target: runtime
    container_name: agent-api
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - APP_HOST=0.0.0.0
      - APP_PORT=8000
      - APP_DEBUG=false
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=${DB_NAME:-agent_db}
      - DB_USER=${DB_USER:-agent_user}
      - DB_PASSWORD_FILE=/run/secrets/db_password
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - SECRET_KEY_FILE=/run/secrets/secret_key
      - AGENT_MODEL=${AGENT_MODEL:-gpt-4}
      - MAX_TOKENS=${MAX_TOKENS:-4096}
      - TEMPERATURE=${TEMPERATURE:-0.7}
    secrets:
      - db_password
      - secret_key
    volumes:
      - agent-logs:/app/logs
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - agent-network
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 2G
        reservations:
          cpus: "0.5"
          memory: 512M

  # ===== PostgreSQL 数据库 =====
  db:
    image: postgres:16-alpine
    container_name: agent-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=${DB_NAME:-agent_db}
      - POSTGRES_USER=${DB_USER:-agent_user}
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - agent-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-agent_user} -d ${DB_NAME:-agent_db}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ===== Redis 缓存 =====
  redis:
    image: redis:7-alpine
    container_name: agent-redis
    restart: unless-stopped
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - agent-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

# ===== Docker Secrets =====
secrets:
  db_password:
    file: ./secrets/db_password.txt
  secret_key:
    file: ./secrets/secret_key.txt

# ===== 持久化卷 =====
volumes:
  postgres-data:
  redis-data:
  agent-logs:

# ===== 网络 =====
networks:
  agent-network:
    driver: bridge
```

### 8. 密钥管理脚本

```bash
#!/bin/bash
# scripts/setup-secrets.sh
# 初始化 Docker secrets 目录和文件
set -euo pipefail

SECRETS_DIR="./secrets"

echo "=== Agent Factory 密钥管理工具 ==="
echo ""

mkdir -p "$SECRETS_DIR"
chmod 700 "$SECRETS_DIR"

# 检查是否已有密钥文件
check_secret() {
    local name="$1"
    local file="$SECRETS_DIR/$name.txt"
    if [ -f "$file" ]; then
        echo "[已存在] $name -> $file"
        read -p "  是否覆盖? (y/N): " overwrite
        if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
            echo "  跳过 $name"
            return 0
        fi
    fi
    read -s -p "  请输入 $name: " value
    echo ""
    echo -n "$value" > "$file"
    chmod 600 "$file"
    echo "[已保存] $name -> $file"
}

# 生成随机密钥
generate_secret() {
    local name="$1"
    local file="$SECRETS_DIR/$name.txt"
    if [ -f "$file" ]; then
        echo "[已存在] $name -> $file"
        return 0
    fi
    value=$(openssl rand -base64 32 | tr -d '\n')
    echo -n "$value" > "$file"
    chmod 600 "$file"
    echo "[已生成] $name -> $file"
}

echo "步骤 1: 生成 SECRET_KEY"
generate_secret "secret_key"

echo ""
echo "步骤 2: 配置数据库密码"
check_secret "db_password"

echo ""
echo "=== 密钥配置完成 ==="
echo "所有密钥文件位于: $SECRETS_DIR/"
echo "警告: 请勿将 secrets/ 目录提交到 Git!"
```

### 9. .gitignore

```gitignore
# 密钥文件
secrets/
.env
.env.local
.env.production

# Python
__pycache__/
*.py[cod]
.venv/
venv/

# Docker
docker-compose.override.yml

# IDE
.vscode/
.idea/
```

### 10. 构建与运行脚本

```bash
#!/bin/bash
# scripts/build-and-run.sh
set -euo pipefail

echo "=== Agent Factory 构建工具 ==="

# 检查密钥文件
echo "检查密钥文件..."
for secret in db_password secret_key; do
    if [ ! -f "./secrets/$secret.txt" ]; then
        echo "  缺少密钥: $secret"
        echo "  请先运行: bash scripts/setup-secrets.sh"
        exit 1
    fi
done
echo "  所有密钥文件已就绪"

# 检查 .env 文件
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
DB_NAME=agent_db
DB_USER=agent_user
AGENT_MODEL=gpt-4
MAX_TOKENS=4096
TEMPERATURE=0.7
EOF
    echo "  已创建 .env"
fi

# 构建镜像
echo ""
echo "步骤 1: 构建 Docker 镜像..."
docker compose build --no-cache

# 启动服务
echo ""
echo "步骤 2: 启动服务..."
docker compose up -d

# 等待并检查健康状态
echo ""
echo "步骤 3: 等待服务就绪..."
sleep 5
for i in {1..12}; do
    if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
        echo "  Agent API 已就绪!"
        curl -s http://localhost:8000/health | python -m json.tool
        break
    fi
    echo "  等待中... ($i/12)"
    sleep 5
done

echo ""
echo "=== Agent Factory 启动完成 ==="
echo "API: http://localhost:8000"
echo "文档: http://localhost:8000/docs"
echo "日志: docker compose logs -f agent-api"
echo "停止: docker compose down"
```

---

## 预期输出

### 构建输出

```bash
$ docker compose build agent-api
[+] Building 45.2s (15/15) FINISHED
 => [builder 1/5] FROM python:3.12-slim                                          12.3s
 => [builder 2/5] RUN apt-get update && apt-get install -y --no-install-recomm    3.2s
 => [builder 3/5] COPY requirements.txt .                                         0.1s
 => [builder 4/5] RUN python -m venv /opt/venv                                   18.5s
 => [builder 5/5] RUN pip install --no-cache-dir -r requirements.txt              8.1s
 => [runtime 1/4] COPY --from=builder /opt/venv /opt/venv                         0.3s
 => [runtime 2/4] RUN apt-get update && apt-get install -y --no-install-recomm    2.1s
 => [runtime 3/4] COPY app/ ./app/                                                0.1s
 => [runtime 4/4] RUN chown -R agent:agent /app                                   0.2s
 => => naming to docker.io/library/agent-factory_agent-api                        0.0s
```

### 启动输出

```bash
$ docker compose up -d
[+] Running 4/4
 ✔ Network agent-factory_agent-network  Created    0.2s
 ✔ Container agent-redis                Healthy    12.3s
 ✔ Container agent-db                   Healthy    15.1s
 ✔ Container agent-api                  Started    16.5s
```

### 健康检查输出

```bash
$ curl http://localhost:8000/health
{
    "status": "healthy",
    "agent": "AgentFactory-Bot",
    "version": "1.0.0",
    "model": "gpt-4",
    "timestamp": "2026-06-15T10:30:00.000000"
}
```

### API 测试输出

```bash
$ curl -X POST http://localhost:8000/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello Agent Factory!"}'
{
    "agent": "AgentFactory-Bot",
    "version": "1.0.0",
    "input": "Hello Agent Factory!",
    "output": "Echo: Hello Agent Factory!",
    "model": "gpt-4",
    "tokens_used": 3,
    "timestamp": "2026-06-15T10:30:05.123456",
    "latency_ms": 1
}
```

---

## 常见错误和解决方案

### 错误 1: 密钥文件不存在

```
错误: 缺少密钥: db_password
  请先运行: bash scripts/setup-secrets.sh
```

**原因**: Docker Compose 引用了 secrets 目录中的文件，但文件不存在。

**解决方案**:
```bash
bash scripts/setup-secrets.sh
# 或手动创建
mkdir -p secrets
echo -n "your-password" > secrets/db_password.txt
chmod 600 secrets/db_password.txt
```

### 错误 2: 容器无法连接到数据库

```
psycopg2.OperationalError: could not translate host name "db" to address
```

**原因**: 应用容器无法解析服务名 `db`，可能不在同一网络中。

**解决方案**:
```bash
# 检查网络
docker network inspect agent-factory_agent-network
# 确保所有服务在同一个 docker-compose.yml 中定义
docker compose ps
```

### 错误 3: 权限被拒绝

```
PermissionError: [Errno 13] Permission denied: '/app/logs'
```

**原因**: 容器中非 root 用户没有写入权限。

**解决方案**: 在 docker-compose.yml 中使用命名卷
```yaml
volumes:
  - agent-logs:/app/logs
```

### 错误 4: 镜像过大

```
$ docker images
REPOSITORY        TAG       SIZE
agent-factory     latest    1.2GB
```

**原因**: 没有使用多阶段构建，包含了编译工具和缓存。

**解决方案**: 使用本文的多阶段 Dockerfile，最终镜像应在 200-400MB。

### 错误 5: 健康检查失败

```
service "agent-api" is unhealthy
```

**解决方案**:
```bash
# 查看容器日志
docker compose logs agent-api
# 检查端口是否被占用
netstat -tlnp | grep 8000
# 手动测试健康端点
curl http://localhost:8000/health
```

---

## 每日挑战

### 挑战 1: 基础练习

1. 创建一个最小的 Dockerfile，只包含一个 Python "Hello World" 应用
2. 构建镜像: `docker build -t hello .`
3. 运行容器: `docker run -p 8000:8000 hello`
4. 验证: `curl http://localhost:8000`

### 挑战 2: 进阶练习

1. 为 Agent 项目添加一个 **日志收集服务**（使用 `fluentd` 或 `vector`）
2. 修改 `docker-compose.yml`，将所有服务的日志发送到日志收集服务
3. 验证日志可以在收集服务中查看

### 挑战 3: 生产加固

1. 为 `agent-api` 服务添加 **资源限制**（CPU 和内存）
2. 配置 **自动重启策略**（`unless-stopped`）
3. 添加 **容器标签** 用于监控和路由
4. 测试当内存超过限制时容器的行为

---

> **明天预告**: Day 2 我们将学习使用 GitHub Actions 实现 CI/CD，让每次代码提交都能自动测试、构建和部署。
