# Week 12：生产部署

> **Phase 3 第三周** — 从"能跑"到"能用"到"好用"

---

## Day 1：Docker 容器化

### 📅 Day 1：Docker 容器化 — 给应用穿上"标准工作服"

### 🧭 今日方向
学习 Docker 基础，将 Agent 应用容器化，实现"一次构建，到处运行"。

### 🎯 生俗比喻
Docker 容器就像集装箱。在集装箱出现之前，不同货物需要不同的装载方式，费时费力。集装箱标准化后，不管里面装的是什么，起重机都能用同样的方式装卸。Docker 对应用也是一样——打包成容器后，不管部署到哪里都能正常运行。

### 📋 今日三件事
1. 编写 Dockerfile 打包 Agent 应用
2. 使用 Docker Compose 编排多服务
3. 优化镜像大小和构建速度

### 🗺️ 手把手路线

#### Step 1：编写 Dockerfile
**做什么**：为 Agent 应用创建 Dockerfile
**为什么**：Dockerfile 是容器化的基础
**成功标志**：能构建出可运行的 Docker 镜像

#### Step 2：Docker Compose 编排
**做什么**：用 docker-compose.yml 管理多个服务
**为什么**：Agent 系统通常包含多个组件
**成功标志**：一个命令启动所有服务

#### Step 3：镜像优化
**做什么**：使用多阶段构建减小镜像大小
**为什么**：小镜像部署更快、更安全
**成功标志**：镜像大小减少 50% 以上

### 💻 代码区

```python
"""
Week 12 Day 1：Docker 容器化
以下是项目需要的 Docker 相关文件
"""

# ========== Dockerfile ==========

dockerfile_content = """
# ========== 多阶段构建 ==========
# 阶段1：构建
FROM python:3.11-slim as builder

WORKDIR /app

# 安装构建依赖
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# 阶段2：运行
FROM python:3.11-slim

WORKDIR /app

# 从构建阶段复制依赖
COPY --from=builder /install /usr/local

# 复制应用代码
COPY app/ ./app/
COPY .env.example .env

# 创建非 root 用户
RUN groupadd -r agent && useradd -r -g agent agent
USER agent

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
"""
print("Dockerfile：")
print(dockerfile_content)

# ========== docker-compose.yml ==========

docker_compose_content = """
version: '3.8'

services:
  # Agent API 服务
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CHROMA_PERSIST_DIR=/data/chroma
      - REDIS_URL=redis://redis:6379
    volumes:
      - chroma_data:/data/chroma
    depends_on:
      redis:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'

  # Redis（缓存和消息队列）
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: unless-stopped

  # Streamlit 前端
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "8501:8501"
    environment:
      - API_URL=http://api:8000
    depends_on:
      - api
    restart: unless-stopped

volumes:
  chroma_data:
  redis_data:
"""
print("\ndocker-compose.yml：")
print(docker_compose_content)

# ========== .dockerignore ==========

dockerignore_content = """
__pycache__
*.pyc
*.pyo
.env
.git
.gitignore
.vscode
.idea
node_modules
*.md
tests/
*.log
.DS_Store
chroma_db/
"""
print("\n.dockerignore：")
print(dockerignore_content)

# ========== Docker 操作命令 ==========

commands = """
# 构建镜像
docker build -t agent-factory:latest .

# 运行容器
docker run -d \\
    --name agent-api \\
    -p 8000:8000 \\
    -e OPENAI_API_KEY=sk-xxx \\
    agent-factory:latest

# 使用 Compose 启动
docker-compose up -d

# 查看日志
docker-compose logs -f api

# 停止服务
docker-compose down

# 重新构建
docker-compose build --no-cache api

# 进入容器调试
docker exec -it agent-api bash

# 查看容器资源使用
docker stats
"""
print("\nDocker 命令参考：")
print(commands)

# ========== 镜像大小优化 ==========

optimization_tips = """
镜像优化技巧：

1. **使用 slim 基础镜像**
   python:3.11（900MB）→ python:3.11-slim（150MB）

2. **多阶段构建**
   构建阶段安装编译工具，运行阶段只复制结果

3. **清理缓存**
   pip install --no-cache-dir
   rm -rf /var/lib/apt/lists/*

4. **使用 .dockerignore**
   排除不需要的文件

5. **合并 RUN 指令**
   减少镜像层数

优化前后对比：
  优化前：~1.5 GB
  优化后：~300 MB
  减少：80%
"""
print(optimization_tips)
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| 镜像构建失败 | 检查 Dockerfile 语法和路径 |
| 容器启动后退出 | 查看日志：`docker logs <container>` |
| 网络连接问题 | 检查 docker-compose 的网络配置 |
| 权限问题 | 检查文件权限和用户设置 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Dockerfile | 构建镜像的脚本 | 装配说明书 |
| Image | 可运行的模板 | 标准集装箱 |
| Container | 运行中的实例 | 装了货的集装箱 |
| Compose | 多容器编排 | 港口调度系统 |
| Volume | 持久化存储 | 集装箱里的货物 |

### ✅ 验收清单
- [ ] Dockerfile 能成功构建镜像
- [ ] 容器能正常启动并提供服务
- [ ] Docker Compose 能一键启动所有服务
- [ ] 镜像大小经过优化

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 2 将学习 CI/CD 流水线，实现自动化测试和部署。

---

## Day 2：CI/CD 流水线

### 📅 Day 2：CI/CD — 代码到生产的"自动传送带"

### 🧭 今日方向
学习 CI/CD 的核心概念，用 GitHub Actions 搭建自动化测试和部署流水线。

### 🎯 生俗比喻
CI/CD 就像工厂的自动化生产线：
- **CI（持续集成）**：每个工人（开发者）提交的零件（代码）都自动经过质检（测试）
- **CD（持续部署）**：质检合格的零件自动进入装配线（构建），最终产品自动出厂（部署）

### 📋 今日三件事
1. 编写 GitHub Actions 工作流
2. 配置自动化测试和代码检查
3. 实现自动构建和部署

### 🗺️ 手把手路线

#### Step 1：CI 工作流
**做什么**：配置代码推送时自动运行测试和 lint
**为什么**：尽早发现代码问题
**成功标志**：Push 后自动触发测试

#### Step 2：CD 工作流
**做什么**：配置通过测试后自动构建和部署
**为什么**：减少手动部署的错误
**成功标志**：合并到 main 后自动部署

#### Step 3：环境管理
**做什么**：区分开发、测试、生产环境
**为什么**：不同环境有不同配置
**成功标志**：环境隔离且配置正确

### 💻 代码区

```python
"""
Week 12 Day 2：CI/CD 流水线
"""

# ========== GitHub Actions 工作流 ==========

github_actions_ci = """
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Cache pip
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Lint with ruff
        run: |
          ruff check app/
          ruff format --check app/

      - name: Type check with mypy
        run: mypy app/

      - name: Run tests
        env:
          OPENAI_API_KEY: ${{ secrets.TEST_OPENAI_API_KEY }}
        run: |
          pytest tests/ -v --cov=app --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
"""
print("CI 工作流 (.github/workflows/ci.yml)：")
print(github_actions_ci)

github_actions_cd = """
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
    types: [closed]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: |
          docker build -t agent-factory:${{ github.sha }} .
          docker tag agent-factory:${{ github.sha }} agent-factory:latest

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Push to registry
        run: |
          docker push agent-factory:${{ github.sha }}
          docker push agent-factory:latest

      - name: Deploy to production
        run: |
          ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} \\
            "cd /opt/agent-factory && \\
             docker-compose pull && \\
             docker-compose up -d"
"""
print("\nCD 工作流 (.github/workflows/deploy.yml)：")
print(github_actions_cd)

# ========== pre-commit 配置 ==========

pre_commit_config = """
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.3.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]

  - repo: https://github.com/commitizen-tools/commitizen
    rev: v3.13.0
    hooks:
      - id: commitizen
        stages: [commit-msg]
"""
print("\npre-commit 配置：")
print(pre_commit_config)

# ========== 分支策略 ==========

branch_strategy = """
分支策略（Git Flow 简化版）：

main          ← 生产环境，只接受 release 分支的合并
  ↑
release/*     ← 发布分支，准备发布时创建
  ↑
develop       ← 开发主线，所有功能合并到这里
  ↑
feature/*     ← 功能分支，每个功能一个分支

规则：
1. 功能开发在 feature/* 分支
2. 完成后提 PR 合并到 develop
3. CI 自动运行测试
4. 发布时从 develop 创建 release/* 分支
5. 测试通过后合并到 main 并自动部署
"""
print(branch_strategy)
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| GitHub Actions 超时 | 检查 job 执行时间，优化步骤 |
| Secret 未配置 | 在 Settings → Secrets 中添加 |
| Docker 推送失败 | 检查 Docker Hub 凭证 |
| 测试在 CI 中失败 | 确保测试不依赖本地环境 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| CI | 挔续集成 | 自动质检线 |
| CD | 持续部署 | 自动出厂线 |
| Workflow | 工作流定义 | 生产线蓝图 |
| Secret | 敏感配置 | 保险柜密码 |
| Pre-commit | 提交前检查 | 上岗前培训 |

### ✅ 验收清单
- [ ] CI 工作流能自动运行测试
- [ ] CD 工作流能自动构建和部署
- [ ] pre-commit 配置正确
- [ ] 理解分支策略

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 3 将学习模型 Fallback 和成本优化策略。

---

## Day 3：模型 Fallback + 成本优化

### 📅 Day 3：Fallback 与成本 — 不把鸡蛋放一个篮子

### 🧭 今日方向
实现模型 Fallback 策略（主模型不可用时自动切换备选模型）和 LLM 调用的成本优化。

### 🎯 生俗比喻
Fallback 就像你只有一家供应商——如果它断货了，你就没得卖。如果你有备选供应商，主供应商断货时可以立刻切换。LLM Fallback 也一样：GPT-4o 挂了就切到 Claude，Claude 挂了就切到开源模型。成本优化就像购物比价——同样的需求，选性价比最高的方案。

### 📋 今日三件事
1. 实现多模型 Fallback 链
2. 实现 Token 使用量监控
3. 设计成本优化策略

### 🗺️ 手把手路线

#### Step 1：Fallback 链设计
**做什么**：定义模型优先级和切换逻辑
**为什么**：保证服务高可用
**成功标志**：主模型不可用时自动切换到备选

#### Step 2：Token 监控
**做什么**：统计和限制 Token 使用量
**为什么**：LLM 按 Token 计费
**成功标志**：能实时查看 Token 消耗

#### Step 3：成本优化
**做什么**：实现缓存、路由优化等策略
**为什么**：降低运营成本
**成功标志**：Token 消耗降低 30% 以上

### 💻 代码区

```python
"""
Week 12 Day 3：模型 Fallback + 成本优化
"""
import time
import json
from dataclasses import dataclass, field
from typing import Optional
from collections import defaultdict
from datetime import datetime, timedelta

# ========== 模型 Fallback 系统 ==========

@dataclass
class ModelConfig:
    """模型配置"""
    name: str
    provider: str              # openai, anthropic, local
    model_id: str              # gpt-4o, claude-3-sonnet, etc.
    priority: int              # 优先级，数字越小越优先
    max_tokens: int = 2000
    cost_per_1k_input: float = 0.0   # 每 1K input token 成本
    cost_per_1k_output: float = 0.0  # 每 1K output token 成本
    is_available: bool = True

class FallbackChain:
    """模型 Fallback 链"""

    def __init__(self):
        self.models: list[ModelConfig] = []
        self.health_status: dict[str, bool] = {}

    def add_model(self, config: ModelConfig):
        """添加模型"""
        self.models.append(config)
        self.models.sort(key=lambda m: m.priority)
        self.health_status[config.name] = True

    def get_model(self) -> Optional[ModelConfig]:
        """获取可用的最优模型"""
        for model in self.models:
            if self.health_status.get(model.name, False) and model.is_available:
                return model
        return None

    def mark_unhealthy(self, model_name: str):
        """标记模型为不健康"""
        self.health_status[model_name] = False
        print(f"  ⚠️ 模型 {model_name} 标记为不可用")

    def mark_healthy(self, model_name: str):
        """标记模型为健康"""
        self.health_status[model_name] = True
        print(f"  ✅ 模型 {model_name} 恢复可用")

    def call_with_fallback(self, messages: list[dict], **kwargs) -> dict:
        """带 Fallback 的 LLM 调用"""
        errors = []

        for model in self.models:
            if not self.health_status.get(model.name, False):
                continue

            try:
                print(f"  尝试模型：{model.name} ({model.model_id})")
                # 模拟 LLM 调用
                # 实际项目中替换为真实的 API 调用
                result = self._mock_call(model, messages)
                return {
                    "success": True,
                    "model_used": model.name,
                    "response": result
                }
            except Exception as e:
                errors.append({"model": model.name, "error": str(e)})
                self.mark_unhealthy(model.name)
                print(f"  ❌ {model.name} 调用失败：{e}")

        return {
            "success": False,
            "error": "所有模型均不可用",
            "details": errors
        }

    def _mock_call(self, model: ModelConfig, messages: list[dict]) -> str:
        """模拟 LLM 调用"""
        if model.name == "gpt4o-fail":
            raise Exception("API 超时")
        return f"[{model.name}] 这是来自 {model.model_id} 的回答"

# ========== Token 使用量监控 ==========

@dataclass
class TokenUsage:
    """Token 使用记录"""
    timestamp: str
    model: str
    input_tokens: int
    output_tokens: int
    cost: float
    operation: str = ""

class TokenMonitor:
    """Token 使用量监控"""

    def __init__(self):
        self.usages: list[TokenUsage] = []
        self.budget_limit: float = 100.0  # 每日预算（美元）
        self.alert_threshold: float = 0.8  # 80% 时告警

    def record(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int,
        cost_per_1k_input: float,
        cost_per_1k_output: float,
        operation: str = ""
    ):
        """记录 Token 使用"""
        cost = (input_tokens / 1000 * cost_per_1k_input +
                output_tokens / 1000 * cost_per_1k_output)

        usage = TokenUsage(
            timestamp=datetime.now().isoformat(),
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost=cost,
            operation=operation
        )
        self.usages.append(usage)

        # 检查预算
        daily_cost = self.get_daily_cost()
        if daily_cost > self.budget_limit * self.alert_threshold:
            print(f"  ⚠️ 预警：今日费用已达 ${daily_cost:.2f} / ${self.budget_limit}")

    def get_daily_cost(self) -> float:
        """获取今日总费用"""
        today = datetime.now().date()
        return sum(
            u.cost for u in self.usages
            if datetime.fromisoformat(u.timestamp).date() == today
        )

    def get_summary(self) -> dict:
        """获取使用汇总"""
        if not self.usages:
            return {"total_cost": 0, "total_tokens": 0}

        total_input = sum(u.input_tokens for u in self.usages)
        total_output = sum(u.output_tokens for u in self.usages)
        total_cost = sum(u.cost for u in self.usages)

        by_model = defaultdict(lambda: {"count": 0, "cost": 0})
        for u in self.usages:
            by_model[u.model]["count"] += 1
            by_model[u.model]["cost"] += u.cost

        return {
            "total_input_tokens": total_input,
            "total_output_tokens": total_output,
            "total_cost": round(total_cost, 4),
            "by_model": dict(by_model),
            "daily_budget_remaining": round(self.budget_limit - self.get_daily_cost(), 2)
        }

# ========== 成本优化策略 ==========

class CostOptimizer:
    """成本优化器"""

    def __init__(self):
        self.cache: dict[str, str] = {}  # 简单缓存
        self.cache_hits = 0
        self.cache_misses = 0

    def get_cache_key(self, messages: list[dict]) -> str:
        """生成缓存键"""
        content = json.dumps(messages, sort_keys=True)
        return str(hash(content))

    def check_cache(self, messages: list[dict]) -> Optional[str]:
        """检查缓存"""
        key = self.get_cache_key(messages)
        if key in self.cache:
            self.cache_hits += 1
            return self.cache[key]
        self.cache_misses += 1
        return None

    def store_cache(self, messages: list[dict], response: str):
        """存储到缓存"""
        key = self.get_cache_key(messages)
        self.cache[key] = response

    def should_use_lightweight_model(self, query: str) -> bool:
        """判断是否可以用轻量模型"""
        # 简单问题用小模型
        simple_patterns = ["你好", "谢谢", "是什么", "定义"]
        return any(p in query for p in simple_patterns)

    def get_cache_stats(self) -> dict:
        """获取缓存统计"""
        total = self.cache_hits + self.cache_misses
        hit_rate = self.cache_hits / total if total > 0 else 0
        return {
            "hits": self.cache_hits,
            "misses": self.cache_misses,
            "hit_rate": f"{hit_rate:.1%}",
            "estimated_savings": f"${self.cache_hits * 0.001:.4f}"
        }


# ========== 集成测试 ==========

print("="*60)
print("Fallback 链测试")
print("="*60)

# 创建 Fallback 链
chain = FallbackChain()
chain.add_model(ModelConfig("gpt4o", "openai", "gpt-4o", 1, 0.01, 0.03))
chain.add_model(ModelConfig("claude3", "anthropic", "claude-3-sonnet", 2, 0.01, 0.03))
chain.add_model(ModelConfig("llama3", "local", "llama-3-8b", 3, 0, 0))

# 正常调用
result = chain.call_with_fallback([{"role": "user", "content": "你好"}])
print(f"正常调用：{result}")

# 模拟主模型故障
chain.mark_unhealthy("gpt4o")
result = chain.call_with_fallback([{"role": "user", "content": "你好"}])
print(f"Fallback 调用：{result}")

print("\n" + "="*60)
print("Token 监控测试")
print("="*60)

monitor = TokenMonitor()
monitor.record("gpt-4o", 1000, 500, 0.01, 0.03, "chat")
monitor.record("gpt-4o-mini", 800, 300, 0.00015, 0.0006, "simple_query")

summary = monitor.get_summary()
print(f"使用汇总：{json.dumps(summary, ensure_ascii=False, indent=2)}")

print("\n" + "="*60)
print("成本优化测试")
print("="*60)

optimizer = CostOptimizer()

# 测试缓存
messages = [{"role": "user", "content": "什么是Python？"}]
cached = optimizer.check_cache(messages)
print(f"缓存查询：{'命中' if cached else '未命中'}")

optimizer.store_cache(messages, "Python是一种编程语言")
cached = optimizer.check_cache(messages)
print(f"再次查询：{'命中' if cached else '未命中'}")

print(f"缓存统计：{optimizer.get_cache_stats()}")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| 所有模型都不可用 | 检查网络和 API Key |
| 缓存数据不一致 | 设置缓存过期时间 |
| Token 超预算 | 降低 budget_limit 或优化调用 |
| Fallback 切换太慢 | 增加健康检查频率 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Fallback | 备选方案自动切换 | 备用供应商 |
| Token Budget | Token 预算限制 | 采购预算 |
| Cache Hit | 缓存命中 | 仓库有现货 |
| Cost Optimization | 成本优化 | 购物比价 |

### ✅ 验收清单
- [ ] Fallback 链能在模型故障时自动切换
- [ ] Token 使用量能被监控和统计
- [ ] 缓存能有效减少重复调用
- [ ] 成本优化策略有效果

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 4 将学习限流熔断和监控告警系统。

---

## Day 4：限流熔断 + 监控告警

### 📅 Day 4：限流熔断 — 给系统装上"保险丝"

### 🧭 今日方向
实现 API 限流、熔断器和监控告警系统，保护系统在异常情况下不崩溃。

### 🎯 生俗比喻
- **限流**：高速公路入口的限流闸——车太多时放慢放行速度，避免堵死
- **熔断**：电路的保险丝——电流过大时自动断开，保护电器不被烧毁
- **告警**：火灾报警器——检测到异常时自动通知

### 📋 今日三件事
1. 实现 API 限流器（Rate Limiter）
2. 实现熔断器（Circuit Breaker）
3. 设计监控告警规则

### 🗺️ 手把手路线

#### Step 1：限流器
**做什么**：实现基于令牌桶或滑动窗口的限流
**为什么**：保护系统免受流量冲击
**成功标志**：超过限流的请求被正确拒绝

#### Step 2：熔断器
**做什么**：实现状态机模式的熔断器
**为什么**：防止故障级联
**成功标志**：连续失败时自动熔断

#### Step 3：告警规则
**做什么**：定义告警条件和通知方式
**为什么**：及时发现和处理问题
**成功标志**：异常时能收到告警通知

### 💻 代码区

```python
"""
Week 12 Day 4：限流熔断 + 监控告警
"""
import time
import threading
from collections import deque
from enum import Enum
from dataclasses import dataclass, field

# ========== 限流器（滑动窗口） ==========

class SlidingWindowRateLimiter:
    """滑动窗口限流器"""

    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, deque] = {}
        self.lock = threading.Lock()

    def allow(self, client_id: str) -> bool:
        """检查是否允许请求"""
        with self.lock:
            now = time.time()

            if client_id not in self.requests:
                self.requests[client_id] = deque()

            # 清理过期请求
            window_start = now - self.window_seconds
            while self.requests[client_id] and self.requests[client_id][0] < window_start:
                self.requests[client_id].popleft()

            # 检查是否超过限制
            if len(self.requests[client_id]) >= self.max_requests:
                return False

            # 记录新请求
            self.requests[client_id].append(now)
            return True

    def get_usage(self, client_id: str) -> dict:
        """获取使用情况"""
        now = time.time()
        window_start = now - self.window_seconds

        if client_id not in self.requests:
            return {"current": 0, "limit": self.max_requests}

        valid = [t for t in self.requests[client_id] if t >= window_start]
        return {
            "current": len(valid),
            "limit": self.max_requests,
            "remaining": max(0, self.max_requests - len(valid))
        }


# ========== 熔断器 ==========

class CircuitState(Enum):
    CLOSED = "closed"         # 正常
    OPEN = "open"             # 熔断
    HALF_OPEN = "half_open"   # 试探

class CircuitBreaker:
    """熔断器"""

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 30.0,
        half_open_max: int = 3
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_max = half_open_max

        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = 0
        self.lock = threading.Lock()

    def can_execute(self) -> bool:
        """检查是否可以执行"""
        with self.lock:
            if self.state == CircuitState.CLOSED:
                return True

            if self.state == CircuitState.OPEN:
                # 检查是否到了恢复时间
                if time.time() - self.last_failure_time >= self.recovery_timeout:
                    self.state = CircuitState.HALF_OPEN
                    self.success_count = 0
                    print("  🔄 熔断器：OPEN → HALF_OPEN")
                    return True
                return False

            if self.state == CircuitState.HALF_OPEN:
                return self.success_count < self.half_open_max

            return False

    def record_success(self):
        """记录成功"""
        with self.lock:
            if self.state == CircuitState.HALF_OPEN:
                self.success_count += 1
                if self.success_count >= self.half_open_max:
                    self.state = CircuitState.CLOSED
                    self.failure_count = 0
                    print("  ✅ 熔断器：HALF_OPEN → CLOSED")
            else:
                self.failure_count = 0

    def record_failure(self):
        """记录失败"""
        with self.lock:
            self.failure_count += 1
            self.last_failure_time = time.time()

            if self.state == CircuitState.HALF_OPEN:
                self.state = CircuitState.OPEN
                print("  🔴 熔断器：HALF_OPEN → OPEN")
            elif self.failure_count >= self.failure_threshold:
                self.state = CircuitState.OPEN
                print("  🔴 熔断器：CLOSED → OPEN")

    def get_status(self) -> dict:
        return {
            "state": self.state.value,
            "failure_count": self.failure_count,
            "success_count": self.success_count
        }


# ========== 监控告警 ==========

class AlertLevel(Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

@dataclass
class Alert:
    level: AlertLevel
    title: str
    message: str
    timestamp: float = field(default_factory=time.time)
    resolved: bool = False

class MonitoringSystem:
    """监控告警系统"""

    def __init__(self):
        self.alerts: list[Alert] = []
        self.metrics: dict[str, list[float]] = {}
        self.rules: list[dict] = []

    def add_rule(self, name: str, condition: callable, level: AlertLevel, message: str):
        """添加告警规则"""
        self.rules.append({
            "name": name,
            "condition": condition,
            "level": level,
            "message": message
        })

    def record_metric(self, name: str, value: float):
        """记录指标"""
        if name not in self.metrics:
            self.metrics[name] = []
        self.metrics[name].append(value)

        # 检查告警规则
        for rule in self.rules:
            if rule["condition"](self.metrics.get(name, [])):
                self._trigger_alert(rule["level"], rule["name"], rule["message"])

    def _trigger_alert(self, level: AlertLevel, title: str, message: str):
        """触发告警"""
        alert = Alert(level=level, title=title, message=message)
        self.alerts.append(alert)

        icons = {AlertLevel.INFO: "ℹ️", AlertLevel.WARNING: "⚠️", AlertLevel.CRITICAL: "🔴"}
        print(f"  {icons[level]} 告警 [{level.value.upper()}]: {title} - {message}")

    def get_active_alerts(self) -> list[dict]:
        return [
            {"level": a.level.value, "title": a.title, "message": a.message}
            for a in self.alerts if not a.resolved
        ]


# ========== 集成测试 ==========

print("="*60)
print("限流器测试")
print("="*60)

limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=10)

for i in range(5):
    allowed = limiter.allow("client-1")
    usage = limiter.get_usage("client-1")
    print(f"  请求 {i+1}: {'允许' if allowed else '拒绝'} (使用: {usage['current']}/{usage['limit']})")

print("\n" + "="*60)
print("熔断器测试")
print("="*60)

breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=5)

for i in range(8):
    can_run = breaker.can_execute()
    if can_run:
        # 模拟失败
        if i < 5:
            breaker.record_failure()
            print(f"  请求 {i+1}: 执行 → 失败 (失败计数: {breaker.failure_count})")
        else:
            breaker.record_success()
            print(f"  请求 {i+1}: 执行 → 成功")
    else:
        print(f"  请求 {i+1}: 被熔断器拒绝")

print("\n" + "="*60)
print("监控告警测试")
print("="*60)

monitor = MonitoringSystem()

# 添加告警规则
monitor.add_rule(
    "high_error_rate",
    lambda values: len(values) > 0 and values[-1] > 0.1,
    AlertLevel.WARNING,
    "错误率超过 10%"
)

monitor.add_rule(
    "critical_error_rate",
    lambda values: len(values) > 0 and values[-1] > 0.5,
    AlertLevel.CRITICAL,
    "错误率超过 50%"
)

# 模拟指标
for rate in [0.05, 0.08, 0.12, 0.55, 0.6]:
    monitor.record_metric("error_rate", rate)

print(f"\n活跃告警：{len(monitor.get_active_alerts())}")
for alert in monitor.get_active_alerts():
    print(f"  [{alert['level']}] {alert['title']}: {alert['message']}")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| 限流误拦截正常请求 | 调整 `max_requests` 和 `window_seconds` |
| 熔断器不恢复 | 检查 `recovery_timeout` 设置 |
| 告警太多（告警疲劳） | 调整告警阈值，合并相关告警 |
| 并发性能问题 | 使用 Redis 实现分布式限流 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Rate Limiter | 限流器 | 高速入口限流 |
| Circuit Breaker | 熔断器 | 电路保险丝 |
| Alert | 告警 | 火灾报警器 |
| Sliding Window | 滑动窗口 | 移动监控窗口 |

### ✅ 验收清单
- [ ] 限流器能正确限制请求频率
- [ ] 熔断器能在故障时自动断开
- [ ] 告警系统能检测异常并通知
- [ ] 熔断器能自动恢复

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 5 将进行完整的生产环境部署实战。

---

## Day 5：端到端部署实战

### 📅 Day 5：部署实战 — 从代码到生产的最后一公里

### 🧭 今日方向
完成从代码到生产部署的完整流程：环境准备 → 配置管理 → 部署执行 → 验证上线。

### 🎯 生俗比喻
前面学了 Docker、CI/CD、Fallback、限流...就像学了开车的各个技能。今天是"上路实操"——把所有技能综合运用，完成一次完整的"驾驶"。

### 📋 今日三件事
1. 完成生产环境配置
2. 执行部署流程
3. 上线验证和回滚准备

### 🗺️ 手把手路线

#### Step 1：生产配置
**做什么**：准备生产环境的配置文件和密钥
**为什么**：生产环境需要更严格的配置
**成功标志**：所有配置项已就绪

#### Step 2：部署执行
**做什么**：按标准流程执行部署
**为什么**：规范的部署流程减少出错
**成功标志**：应用成功部署到生产环境

#### Step 3：上线验证
**做什么**：验证服务健康、功能正常
**为什么**：确保用户能正常使用
**成功标志**：所有健康检查通过

### 💻 代码区

```python
"""
Week 12 Day 5：端到端部署实战
"""
import json
import time
from dataclasses import dataclass

# ========== 部署清单 ==========

deployment_checklist = {
    "部署前检查": [
        "所有测试通过",
        "代码已合并到 main 分支",
        "Docker 镜像构建成功",
        "环境变量已配置",
        "数据库迁移已准备",
        "回滚方案已准备",
    ],
    "部署执行": [
        "拉取最新镜像",
        "停止旧服务",
        "启动新服务",
        "健康检查通过",
        "流量切换",
    ],
    "部署后验证": [
        "API 响应正常",
        "RAG 检索正常",
        "Agent 工具调用正常",
        "日志和监控正常",
        "无错误日志",
    ],
    "回滚条件": [
        "健康检查失败",
        "错误率 > 5%",
        "响应时间 > 10s",
        "关键功能不可用",
    ]
}

print("部署清单：")
for phase, items in deployment_checklist.items():
    print(f"\n{phase}:")
    for i, item in enumerate(items, 1):
        print(f"  {i}. [ ] {item}")


# ========== 部署脚本 ==========

deploy_script = """#!/bin/bash
# deploy.sh - 生产部署脚本

set -e  # 任何错误立即退出

echo "========================================="
echo "Agent Factory 生产部署"
echo "========================================="

# 1. 检查环境
echo "[1/6] 检查环境..."
docker --version
docker-compose --version

# 2. 备份当前版本
echo "[2/6] 备份当前版本..."
CURRENT_VERSION=$(docker inspect --format='{{.Config.Image}}' agent-factory-api)
echo "当前版本: $CURRENT_VERSION"
docker tag agent-factory-api:latest "agent-factory-api:backup-$(date +%Y%m%d%H%M%S)"

# 3. 拉取新镜像
echo "[3/6] 拉取新镜像..."
docker-compose pull

# 4. 执行数据库迁移（如果有）
echo "[4/6] 数据库迁移..."
# docker-compose run api python manage.py migrate

# 5. 滚动更新
echo "[5/6] 滚动更新..."
docker-compose up -d --force-recreate api

# 6. 健康检查
echo "[6/6] 健康检查..."
for i in {1..30}; do
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ 健康检查通过！"
        break
    fi
    echo "等待服务启动... ($i/30)"
    sleep 2
done

echo "========================================="
echo "部署完成！"
echo "========================================="
"""
print("\n部署脚本 (deploy.sh)：")
print(deploy_script)


# ========== 回滚脚本 ==========

rollback_script = """#!/bin/bash
# rollback.sh - 紧急回滚脚本

echo "⚠️ 执行紧急回滚..."

# 停止当前服务
docker-compose down

# 恢复备份版本
BACKUP_TAG=$(docker images agent-factory-api --format "{{.Tag}}" | grep backup | head -1)
if [ -z "$BACKUP_TAG" ]; then
    echo "❌ 未找到备份版本"
    exit 1
fi

docker tag "agent-factory-api:$BACKUP_TAG" agent-factory-api:latest
docker-compose up -d

echo "✅ 回滚到版本: $BACKUP_TAG"
"""
print("\n回滚脚本 (rollback.sh)：")
print(rollback_script)


# ========== 健康检查配置 ==========

health_check_config = """
# 健康检查配置

GET /health 返回：
{
    "status": "healthy",
    "version": "1.0.0",
    "uptime": "2h 30m",
    "components": {
        "api": "ok",
        "llm": "ok",
        "vector_db": "ok",
        "cache": "ok"
    },
    "metrics": {
        "requests_per_minute": 120,
        "avg_response_time_ms": 450,
        "error_rate": 0.02,
        "active_sessions": 15
    }
}
"""
print(health_check_config)


# ========== 监控仪表盘 ==========

monitoring_dashboard = """
生产监控仪表盘

┌─────────────────────────────────────────────────────┐
│                 Agent Factory 监控                    │
├──────────────┬──────────────┬───────────────────────┤
│   请求量      │   错误率      │   响应时间            │
│   120/min    │   0.02%      │   P50: 350ms         │
│              │              │   P95: 800ms         │
│              │              │   P99: 1200ms        │
├──────────────┼──────────────┼───────────────────────┤
│   LLM 调用   │   Token 消耗  │   缓存命中率          │
│   95/min     │   50K/hour   │   35%                │
├──────────────┴──────────────┴───────────────────────┤
│   服务状态                                           │
│   ✅ API Server    ✅ Redis    ✅ ChromaDB          │
└─────────────────────────────────────────────────────┘
"""
print(monitoring_dashboard)


# ========== 部署日志模板 ==========

deploy_log_template = {
    "deployment_id": "deploy-20240101-001",
    "version": "v1.2.0",
    "start_time": "2024-01-01T10:00:00Z",
    "end_time": "2024-01-01T10:05:00Z",
    "duration_seconds": 300,
    "status": "success",
    "steps": [
        {"step": "pre_check", "status": "passed", "duration": 30},
        {"step": "pull_image", "status": "passed", "duration": 60},
        {"step": "database_migration", "status": "passed", "duration": 45},
        {"step": "service_update", "status": "passed", "duration": 90},
        {"step": "health_check", "status": "passed", "duration": 60},
        {"step": "traffic_switch", "status": "passed", "duration": 15},
    ],
    "rollback_available": True,
    "deployed_by": "ci-cd-pipeline",
}

print("\n部署日志模板：")
print(json.dumps(deploy_log_template, ensure_ascii=False, indent=2))
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| 部署后健康检查失败 | 查看日志：`docker-compose logs api` |
| 流量切换后出错 | 立即执行回滚脚本 |
| 数据库迁移失败 | 手动回滚数据库并重试 |
| 监控数据异常 | 检查监控组件是否正常 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Blue-Green Deploy | 蓝绿部署 | 两套系统切换 |
| Rolling Update | 滚动更新 | 逐个替换零件 |
| Rollback | 回滚 | 撤销操作 |
| Health Check | 健康检查 | 定期体检 |

### ✅ 验收清单
- [ ] 部署清单所有项已完成
- [ ] 应用成功部署到生产环境
- [ ] 健康检查全部通过
- [ ] 回滚脚本已测试

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Week 12 结束！下周将进行深度技术探索，选择感兴趣的高级主题深入研究。

---

## 📚 本周总结

| Day | 主题 | 核心技能 |
|-----|------|---------|
| 1 | Docker 容器化 | Dockerfile、Compose、镜像优化 |
| 2 | CI/CD 流水线 | GitHub Actions、自动化测试和部署 |
| 3 | 模型 Fallback + 成本 | 多模型切换、Token 监控、缓存 |
| 4 | 限流熔断 + 监控 | Rate Limiter、Circuit Breaker、告警 |
| 5 | 端到端部署 | 部署流程、健康检查、回滚方案 |

### 🎯 本周产出
- [x] Docker 化的应用
- [x] CI/CD 自动化流水线
- [x] 模型 Fallback 系统
- [x] 限流熔断系统
- [x] 监控告警系统
- [x] 完整的部署方案

### 📖 推荐阅读
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Circuit Breaker Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)
- [LLM Cost Optimization Guide](https://www.anthropic.com/pricing)
