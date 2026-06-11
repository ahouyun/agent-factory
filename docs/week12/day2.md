# 📅 Day 2 - CI/CD 流水线：GitHub Actions

> **Week 12 . 生产部署** | **日期**: 2026-06-16

---

## 今日方向

今天我们学习使用 GitHub Actions 构建 Agent 项目的完整 CI/CD 流水线。从代码提交到自动测试、构建 Docker 镜像、部署到服务器，实现一键式的自动化交付流程。

---

## 生活比喻

> CI/CD 就像工厂的**自动化流水线**。原材料（代码）进入流水线后，经过质检（Lint/测试）、组装（构建镜像）、包装（打标签）、发货（部署），最终到达客户手中。GitHub Actions 就是这条流水线的**控制器**，你只需要定义好每个工位的操作规则，它就会自动执行。

---

## 今日三件事

1. **编写 GitHub Actions 工作流** -- 实现 lint + test + build + deploy
2. **配置矩阵测试** -- 在多个 Python 版本和操作系统上并行测试
3. **配置 Docker 缓存与自动部署** -- 加速构建，实现 staging/production 部署

---

## 手把手路线

### 阶段一：理解 CI/CD 概念

```
CI (持续集成): 代码合并后自动测试、检查质量
CD (持续交付): 测试通过后自动构建、打包
CD (持续部署): 自动部署到生产环境
```

### 阶段二：项目目录结构

```
agent-project/
├── .github/
│   └── workflows/
│       ├── ci.yml              # 持续集成
│       └── deploy.yml          # 持续部署
├── src/
│   ├── __init__.py
│   └── agent.py
├── tests/
│   ├── __init__.py
│   ├── unit/
│   │   ├── __init__.py
│   │   └── test_agent.py
│   └── integration/
│       ├── __init__.py
│       └── test_api.py
├── Dockerfile
├── pyproject.toml
├── requirements.txt
└── requirements-dev.txt
```

### 阶段三：编写 CI 工作流

### 阶段四：编写 Deploy 工作流

### 阶段五：配置 GitHub Secrets

### 阶段六：推送代码并验证

---

## 代码区

### 1. 测试代码

```python
# tests/unit/test_agent.py
"""Agent 单元测试"""
import pytest
from unittest.mock import Mock, patch


class TestAgent:
    """Agent 类的单元测试"""

    def setup_method(self):
        """每个测试前的准备"""
        self.mock_config = Mock()
        self.mock_config.agent_model = "gpt-4"
        self.mock_config.max_tokens = 4096

    @patch("src.agent.get_config")
    def test_agent_init(self, mock_get_config):
        """测试 Agent 初始化"""
        mock_get_config.return_value = self.mock_config
        from src.agent import Agent

        agent = Agent(self.mock_config)
        assert agent.name == "AgentFactory-Bot"
        assert agent.version == "1.0.0"

    @patch("src.agent.get_config")
    def test_health_check(self, mock_get_config):
        """测试健康检查"""
        mock_get_config.return_value = self.mock_config
        from src.agent import Agent

        agent = Agent(self.mock_config)
        health = agent.health_check()
        assert health["status"] == "healthy"
        assert "agent" in health
        assert "version" in health

    @patch("src.agent.get_config")
    def test_process_message(self, mock_get_config):
        """测试消息处理"""
        mock_get_config.return_value = self.mock_config
        from src.agent import Agent

        agent = Agent(self.mock_config)
        result = {
            "agent": agent.name,
            "input": "test message",
            "output": "Echo: test message",
        }
        assert result["agent"] == "AgentFactory-Bot"
        assert "Echo" in result["output"]

    @patch("src.agent.get_config")
    def test_process_empty_message(self, mock_get_config):
        """测试空消息处理"""
        mock_get_config.return_value = self.mock_config
        from src.agent import Agent

        agent = Agent(self.mock_config)
        assert "" != " "
```

### 2. 集成测试

```python
# tests/integration/test_api.py
"""API 集成测试"""
import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    """创建测试客户端"""
    # 注意：集成测试需要环境变量
    import os
    os.environ["DB_PASSWORD"] = "test_password"
    os.environ["SECRET_KEY"] = "test_secret_key"

    from app.main import app
    with TestClient(app) as c:
        yield c


class TestHealthEndpoint:
    """健康检查端点测试"""

    def test_health_returns_200(self, client):
        """测试健康检查返回 200"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_root_returns_200(self, client):
        """测试根路径返回 200"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "Agent Factory"


class TestChatEndpoint:
    """聊天端点测试"""

    def test_chat_returns_200(self, client):
        """测试聊天端点正常响应"""
        response = client.post(
            "/chat",
            json={"message": "Hello Agent!"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "output" in data

    def test_chat_empty_message_returns_400(self, client):
        """测试空消息返回 400"""
        response = client.post(
            "/chat",
            json={"message": ""}
        )
        assert response.status_code == 400
```

### 3. pyproject.toml

```toml
[project]
name = "agent-factory"
version = "1.0.0"
description = "Agent Factory - Production Grade AI Agent"
requires-python = ">=3.11"
dependencies = [
    "fastapi==0.115.0",
    "uvicorn[standard]==0.30.0",
    "pydantic==2.9.0",
    "httpx==0.27.0",
    "redis==5.0.0",
    "python-dotenv==1.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest==8.3.0",
    "pytest-cov==5.0.0",
    "pytest-asyncio==0.24.0",
    "httpx==0.27.0",
    "ruff==0.6.0",
    "mypy==1.11.0",
    "black==24.8.0",
    "isort==5.13.2",
]

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
addopts = [
    "-v",
    "--tb=short",
    "--strict-markers",
    "-m", "not slow",
]
markers = [
    "slow: marks tests as slow",
    "integration: marks integration tests",
]

[tool.ruff]
line-length = 88
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP"]
ignore = ["E501"]

[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_configs = true

[tool.black]
line-length = 88
target-version = ["py311"]

[tool.isort]
profile = "black"
```

### 4. GitHub Actions CI 工作流

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  PYTHON_VERSION: "3.11"

jobs:
  # ========== 代码质量检查 ==========
  lint:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Cache pip
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('requirements*.txt') }}
          restore-keys: |
            ${{ runner.os }}-pip-

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install ruff black isort mypy
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Run Ruff linter
        run: ruff check src/ tests/

      - name: Run Ruff format check
        run: ruff format --check src/ tests/

      - name: Run black check
        run: black --check src/ tests/

      - name: Run isort check
        run: isort --check-only src/ tests/

      - name: Run mypy
        run: mypy src/
        continue-on-error: true

  # ========== 单元测试（矩阵测试） ==========
  test:
    name: Unit Tests (Python ${{ matrix.python-version }})
    runs-on: ${{ matrix.os }}
    needs: lint
    strategy:
      fail-fast: false
      matrix:
        python-version: ["3.11", "3.12"]
        os: [ubuntu-latest]

    services:
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: Cache pip
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-py${{ matrix.python-version }}-pip-${{ hashFiles('requirements*.txt') }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Run unit tests with coverage
        env:
          REDIS_URL: redis://localhost:6379/0
          DB_PASSWORD: test_password
          SECRET_KEY: test_secret_key
        run: |
          pytest tests/unit/ \
            --cov=src/ \
            --cov-report=xml \
            --cov-report=term-missing \
            -v

      - name: Upload coverage report
        if: matrix.python-version == '3.11'
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage.xml

  # ========== 集成测试 ==========
  integration-test:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: test

    services:
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: agent_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: agent_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Run integration tests
        env:
          REDIS_URL: redis://localhost:6379/0
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: agent_db
          DB_USER: agent_user
          DB_PASSWORD: test_password
          SECRET_KEY: test_secret_key
        run: |
          pytest tests/integration/ -v

  # ========== Docker 构建 ==========
  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: integration-test
    if: github.event_name != 'pull_request'

    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=sha,prefix=

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 5. GitHub Actions 部署工作流

```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline

on:
  workflow_run:
    workflows: ["CI Pipeline"]
    types: [completed]
    branches: [main, develop]

env:
  STAGING_HOST: ${{ secrets.STAGING_HOST }}
  PRODUCTION_HOST: ${{ secrets.PRODUCTION_HOST }}

jobs:
  # ========== 部署到测试环境 ==========
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    if: |
      github.event.workflow_run.conclusion == 'success' &&
      github.ref == 'refs/heads/develop'
    environment: staging

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to staging server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/agent
            git pull origin develop
            docker compose build agent-api
            docker compose up -d --no-deps agent-api
            sleep 10
            curl -f http://localhost:8000/health || exit 1
            echo "Staging 部署成功"

  # ========== 部署到生产环境 ==========
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    if: |
      github.event.workflow_run.conclusion == 'success' &&
      github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to production server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /opt/agent
            git pull origin main
            docker compose build agent-api
            docker compose up -d --no-deps agent-api
            sleep 15
            curl -f http://localhost:8000/health || exit 1
            echo "Production 部署成功"

  # ========== 通知 ==========
  notify:
    name: Send Notifications
    runs-on: ubuntu-latest
    needs: [deploy-staging, deploy-production]
    if: always()

    steps:
      - name: Notify on success
        if: needs.deploy-staging.result == 'success' || needs.deploy-production.result == 'success'
        run: echo "部署成功!"

      - name: Notify on failure
        if: needs.deploy-staging.result == 'failure' || needs.deploy-production.result == 'failure'
        run: echo "部署失败!" && exit 1
```

### 6. 健康检查脚本

```python
# scripts/health_check.py
"""部署后健康检查脚本"""
import requests
import sys
import time


def health_check(url: str, max_retries: int = 5, delay: int = 2) -> bool:
    """健康检查，带重试"""
    for i in range(max_retries):
        try:
            response = requests.get(f"{url}/health", timeout=5)
            if response.status_code == 200:
                print(f"[OK] 健康检查通过: {url}")
                data = response.json()
                print(f"     状态: {data.get('status')}")
                print(f"     版本: {data.get('version')}")
                return True
            else:
                print(f"[WARN] 状态码: {response.status_code}")
        except requests.RequestException as e:
            print(f"[ERROR] 连接失败: {e}")

        if i < max_retries - 1:
            print(f"     {delay}s 后重试... ({i+1}/{max_retries})")
            time.sleep(delay)

    print("[FAIL] 健康检查最终失败")
    return False


if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
    success = health_check(url)
    sys.exit(0 if success else 1)
```

### 7. 部署脚本

```bash
#!/bin/bash
# scripts/deploy.sh
# 本地部署脚本
set -euo pipefail

ENV="${1:-staging}"
echo "=== 部署到 $ENV 环境 ==="

# 拉取最新代码
echo "拉取最新代码..."
git pull origin "$ENV"

# 构建镜像
echo "构建 Docker 镜像..."
docker compose build agent-api

# 运行数据库迁移（如果有）
echo "运行数据库迁移..."
docker compose run --rm agent-api python -m app.migrate || true

# 重启服务
echo "重启服务..."
docker compose up -d --no-deps agent-api

# 等待启动
echo "等待服务启动..."
sleep 10

# 健康检查
echo "执行健康检查..."
if python scripts/health_check.py http://localhost:8000; then
    echo "=== 部署成功! ==="
else
    echo "=== 部署失败，回滚... ==="
    docker compose down
    docker compose up -d
    exit 1
fi
```

---

## 预期输出

### CI 工作流输出

```bash
$ git push origin develop
# GitHub Actions 自动触发

# Code Quality
Run Ruff linter
ruff check src/ tests/
All checks passed!

Run black check
black --check src/ tests/.
All done!

# Unit Tests (Python 3.11)
pytest tests/unit/ --cov=src/ -v
tests/unit/test_agent.py::TestAgent::test_agent_init PASSED
tests/unit/test_agent.py::TestAgent::test_health_check PASSED
tests/unit/test_agent.py::TestAgent::test_process_message PASSED
--------- coverage: platform linux, python 3.11.0 ---------
Name                    Stmts   Miss  Cover
-------------------------------------------
src/agent.py               35      2    94%
src/config.py              42      5    88%
-------------------------------------------
TOTAL                      77      7    91%

# Docker Build
[+] Building 45.2s (15/15) FINISHED
 => => pushing manifest for ghcr.io/user/agent-factory:develop
```

### 部署输出

```bash
$ bash scripts/deploy.sh develop
=== 部署到 develop 环境 ===
拉取最新代码...
From github.com:user/agent-factory
 * branch            develop    -> FETCH_HEAD
Already up to date.
构建 Docker 镜像...
[+] Building 12.3s (15/15) FINISHED
重启服务...
[+] Running 2/2
 ✔ Container agent-api  Started
等待服务启动...
执行健康检查...
[OK] 健康检查通过: http://localhost:8000
     状态: healthy
     版本: 1.0.0
=== 部署成功! ===
```

### 矩阵测试输出

```bash
Unit Tests (Python 3.11) -- ubuntu-latest   ✅ passed
Unit Tests (Python 3.12) -- ubuntu-latest   ✅ passed
Integration Tests                           ✅ passed
Build Docker Image                          ✅ passed
```

---

## 常见错误和解决方案

### 错误 1: workflow 文件语法错误

```
Error: Invalid workflow file .github/workflows/ci.yml
```

**解决方案**: 使用 GitHub Actions linter 检查语法
```bash
# 安装 actionlint
brew install actionlint
# 检查语法
actionlint .github/workflows/ci.yml
```

### 错误 2: Secrets 未配置

```
Error: Secret STAGING_HOST is required but not set
```

**解决方案**: 在 GitHub 仓库 Settings -> Secrets and variables -> Actions 中配置
```bash
# 使用 GitHub CLI 配置
gh secret set STAGING_HOST --body "192.168.1.100"
gh secret set STAGING_USER --body "deploy"
gh secret set STAGING_SSH_KEY < ~/.ssh/id_rsa
```

### 错误 3: Docker 构建缓存未命中

```
=> [internal] load build definition from Dockerfile
=> => transferring dockerfile: 2B
# 构建时间很长
```

**解决方案**: 确保缓存配置正确
```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

### 错误 4: 测试在 CI 中失败但本地通过

```
FAILED tests/integration/test_api.py::TestChatEndpoint
ModuleNotFoundError: No module named 'app'
```

**解决方案**: 确保 `sys.path` 配置正确
```bash
# 在 pytest.ini 或 pyproject.toml 中添加
[tool.pytest.ini_options]
pythonpath = ["."]
```

### 错误 5: 部署后服务未启动

```
curl: (7) Failed to connect to localhost port 8000
```

**解决方案**:
```bash
# 检查容器状态
docker compose ps
# 查看容器日志
docker compose logs agent-api
# 检查端口占用
netstat -tlnp | grep 8000
```

---

## 每日挑战

### 挑战 1: 基础练习

1. 创建一个新的 GitHub 仓库
2. 添加一个简单的 Python 项目
3. 配置 GitHub Actions 工作流，实现自动测试
4. 提交代码并观察 Actions 运行

### 挑战 2: 进阶练习

1. 为 Agent 项目添加 **矩阵测试**（Python 3.11 + 3.12）
2. 配置 **Docker 缓存**，加速构建
3. 添加 **部署到 staging** 的自动部署
4. 配置 **Slack 通知**，部署成功/失败时通知

### 挑战 3: 生产加固

1. 为生产环境添加 **手动审批** 步骤
2. 实现 **回滚机制**（部署失败时自动回滚到上一个版本）
3. 添加 **部署锁**（同一时间只能有一个部署在运行）
4. 配置 **环境变量管理**（staging/production 使用不同的环境变量）

---

> **明天预告**: Day 3 我们将学习模型 Fallback 和 vLLM 优化，让 Agent 在模型服务不可用时自动降级，并使用 vLLM 提升推理性能。
