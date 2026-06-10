# 📅 Week 12 Day 2：CI/CD 流水线：GitHub Actions

## 🧭 今日方向
> 学习使用 GitHub Actions 构建 Agent 项目的 CI/CD 流水线，实现自动化测试、构建和部署。

## 🎯 生活比喻
> CI/CD 就像工厂的自动化生产线。代码提交（原料入库）→ 自动测试（质量检测）→ 自动构建（组装产品）→ 自动部署（发货上线）。GitHub Actions 就是这条生产线的控制器，你只需要定义规则，它就会自动执行。

## 📋 今日三件事
1. 理解 CI/CD 的核心概念和流程
2. 编写 Agent 项目的 GitHub Actions 工作流
3. 实现自动化测试、构建和部署

## 🗺️ 手把手路线

### Step 1：理解 CI/CD
- 做什么: 学习持续集成和持续部署的概念
- 为什么: 这是现代软件开发的核心实践
- 成功标志: 能解释 CI 和 CD 的区别

### Step 2：GitHub Actions 基础
- 做什么: 学习工作流文件的编写
- 为什么: GitHub Actions 是最流行的 CI/CD 工具之一
- 成功标志: 能编写一个简单的 GitHub Actions 工作流

### Step 3：Agent 项目 CI/CD
- 做什么: 为 Agent 项目设计完整的流水线
- 为什么: Agent 项目有特殊的测试和部署需求
- 成功标志: 能设计适合 Agent 项目的 CI/CD 流程

### Step 4：代码实践
- 做什么: 编写完整的 GitHub Actions 配置
- 为什么: 代码是最好的理解方式
- 成功标志: 配置文件语法正确

## 💻 代码区

```python
"""
CI/CD 流水线：GitHub Actions
Agent 项目的完整 CI/CD 配置
"""
from dataclasses import dataclass
from typing import Dict, List
import json
import yaml

# ========== 1. GitHub Actions 工作流 ==========

MAIN_WORKFLOW = '''
name: Agent CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  release:
    types: [created]

env:
  PYTHON_VERSION: '3.11'
  DOCKER_REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ========== 代码质量检查 ==========
  lint:
    name: Code Quality
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install flake8 black isort mypy
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      
      - name: Run flake8
        run: flake8 src/ tests/
      
      - name: Run black check
        run: black --check src/ tests/
      
      - name: Run isort check
        run: isort --check-only src/ tests/
      
      - name: Run mypy
        run: mypy src/

  # ========== 单元测试 ==========
  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint
    
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
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      
      - name: Run tests with coverage
        env:
          REDIS_URL: redis://localhost:6379/0
        run: |
          pytest tests/ \\
            --cov=src/ \\
            --cov-report=xml \\
            --cov-report=html \\
            -v
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
          flags: unittests

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
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
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
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      
      - name: Run integration tests
        env:
          REDIS_URL: redis://localhost:6379/0
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
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
          registry: ${{ env.DOCKER_REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.DOCKER_REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=sha
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ========== 部署到测试环境 ==========
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy to staging server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/agent
            docker-compose pull
            docker-compose up -d
            docker-compose exec -T agent python health_check.py

  # ========== 部署到生产环境 ==========
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy to production server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /opt/agent
            docker-compose pull
            docker-compose up -d --no-deps agent
            sleep 10
            docker-compose exec -T agent python health_check.py

  # ========== 通知 ==========
  notify:
    name: Send Notifications
    runs-on: ubuntu-latest
    needs: [lint, test, integration-test, build]
    if: always()
    
    steps:
      - name: Send Slack notification
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Agent CI/CD Pipeline: ${{ job.status }}",
              "attachments": [
                {
                  "color": "${{ job.status == 'success' && '#36a64f' || '#ff0000' }}",
                  "fields": [
                    { "title": "Repository", "value": "${{ github.repository }}", "short": true },
                    { "title": "Branch", "value": "${{ github.ref_name }}", "short": true },
                    { "title": "Commit", "value": "${{ github.sha }}", "short": true },
                    { "title": "Status", "value": "${{ job.status }}", "short": true }
                  ]
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
'''

# ========== 2. 测试配置 ==========

PYTEST_CONFIG = '''
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = [
    "-v",
    "--tb=short",
    "--strict-markers",
    "--disable-warnings"
]
markers = [
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
    "integration: marks integration tests",
    "e2e: marks end-to-end tests"
]
'''

# ========== 3. 项目结构说明 ==========

PROJECT_STRUCTURE = '''
agent-project/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions 工作流
├── src/
│   ├── __init__.py
│   ├── agent.py               # Agent 主逻辑
│   ├── models/                # 数据模型
│   ├── services/              # 业务服务
│   └── utils/                 # 工具函数
├── tests/
│   ├── unit/                  # 单元测试
│   ├── integration/           # 集成测试
│   └── e2e/                   # 端到端测试
├── docker/
│   ├── Dockerfile             # 生产环境镜像
│   └── Dockerfile.dev         # 开发环境镜像
├── docker-compose.yml         # 本地开发编排
├── docker-compose.prod.yml    # 生产环境编排
├── requirements.txt           # 生产依赖
├── requirements-dev.txt       # 开发依赖
├── pyproject.toml             # 项目配置
├── .env.example               # 环境变量模板
└── README.md                  # 项目文档
'''

# ========== 4. 辅助脚本 ==========

HEALTH_CHECK_SCRIPT = '''
"""
健康检查脚本
用于 CI/CD 部署后验证
"""
import requests
import sys
import time

def health_check(url: str, max_retries: int = 5, delay: int = 2) -> bool:
    """健康检查"""
    for i in range(max_retries):
        try:
            response = requests.get(f"{url}/health", timeout=5)
            if response.status_code == 200:
                print(f"✓ 健康检查通过: {url}")
                return True
            else:
                print(f"✗ 健康检查失败: 状态码 {response.status_code}")
        except requests.RequestException as e:
            print(f"✗ 连接失败: {e}")
        
        if i < max_retries - 1:
            time.sleep(delay)
    
    return False

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    success = health_check(url)
    sys.exit(0 if success else 1)
'''

DEPLOY_SCRIPT = '''
#!/bin/bash
# deploy.sh - 部署脚本

set -e

echo "开始部署..."

# 1. 拉取最新代码
git pull origin main

# 2. 构建镜像
docker-compose build

# 3. 运行数据库迁移
docker-compose run --rm agent python manage.py migrate

# 4. 重启服务
docker-compose up -d --no-deps agent

# 5. 等待服务启动
sleep 10

# 6. 健康检查
if python scripts/health_check.py; then
    echo "✓ 部署成功"
else
    echo "✗ 部署失败，回滚..."
    docker-compose down
    docker-compose up -d
    exit 1
fi

echo "部署完成！"
'''

# ========== 5. 主函数 ==========

def main():
    """主函数"""
    print("=" * 60)
    print("CI/CD 流水线：GitHub Actions")
    print("=" * 60)
    
    # 1. 展示工作流文件
    print("\n1. GitHub Actions 工作流:")
    print("-" * 40)
    print(MAIN_WORKFLOW)
    
    # 2. 展示项目结构
    print("\n2. 项目结构:")
    print("-" * 40)
    print(PROJECT_STRUCTURE)
    
    # 3. 展示辅助脚本
    print("\n3. 辅助脚本:")
    print("-" * 40)
    print("健康检查脚本 (health_check.py):")
    print(HEALTH_CHECK_SCRIPT)
    
    print("\n部署脚本 (deploy.sh):")
    print(DEPLOY_SCRIPT)
    
    # 4. CI/CD 流程图
    print("\n4. CI/CD 流程图:")
    print("-" * 40)
    print("""
    代码提交
        │
        ▼
    ┌─────────────────┐
    │   Lint Check    │  代码质量检查
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │   Unit Tests    │  单元测试
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Integration     │  集成测试
    │ Tests           │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Build Docker    │  构建镜像
    │ Image           │
    └────────┬────────┘
             │
     ┌───────┴───────┐
     ▼               ▼
    Staging        Production
    (测试环境)      (生产环境)
""")
    
    print("\n5. 关键配置:")
    print("-" * 40)
    print("  - 多环境支持: staging/production")
    print("  - 并行执行: lint/test/build")
    print("  - 缓存优化: Docker layer caching")
    print("  - 自动回滚: 健康检查失败时回滚")
    print("  - 通知集成: Slack/Email 通知")


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 工作流语法错误 | 使用 GitHub Actions linter 检查 |
| 2 | 测试在 CI 中失败 | 检查环境变量和依赖配置 |
| 3 | Docker 构建太慢 | 使用多阶段构建和缓存 |
| 4 | 部署后服务异常 | 检查健康检查和日志 |
| 5 | Secrets 配置错误 | 在 GitHub Settings 中检查 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| CI | 持续集成：代码合并后自动测试 |
| CD | 持续部署：测试通过后自动部署 |
| GitHub Actions | GitHub 的 CI/CD 平台 |
| Workflow | 工作流：定义自动化流程 |
| Job | 任务：工作流中的一个步骤组 |
| Step | 步骤：任务中的单个操作 |
| Runner | 运行器：执行工作流的环境 |
| Secrets | 密钥：敏感配置信息 |

## ✅ 验收清单
- [ ] 能解释 CI/CD 的核心概念
- [ ] 能编写 GitHub Actions 工作流
- [ ] 理解 Agent 项目的 CI/CD 特殊需求
- [ ] 配置文件语法正确

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
