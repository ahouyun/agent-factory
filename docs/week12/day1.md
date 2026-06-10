# 📅 Week 12 Day 1：Docker 容器化 + Docker Compose 编排

## 🔐 生产环境密钥管理

**永远不要把 API Key 硬编码在代码中！** 生产环境需要专业的密钥管理：

| 方案 | 适用场景 | 说明 |
|------|---------|------|
| .env 文件 | 开发环境 | 本地开发使用，不要提交到 Git |
| Docker Secrets | Docker 部署 | Docker 原生支持 |
| HashiCorp Vault | 企业级 | 专业的密钥管理服务 |
| 云厂商 KMS | 云部署 | AWS Secrets Manager / 阿里云 KMS |

**最佳实践**：
1. 开发环境：使用 `.env` + `.gitignore`
2. Docker 部署：使用 `docker-compose.yml` 的 `secrets` 配置
3. 生产环境：使用云厂商密钥管理服务
4. 轮换策略：定期更换 API Key

## 🧭 今日方向
> 学习如何使用 Docker 容器化 Agent 应用，以及使用 Docker Compose 编排多服务系统。

## 🎯 生活比喻
> Docker 就像集装箱。在 Docker 出现之前，运输货物需要针对不同港口、不同船只做适配；Docker 出现后，所有货物都装进标准集装箱，不管运到哪里都能直接用。容器化 Agent 也是一样：你的 Agent 打包成容器后，可以在任何支持 Docker 的环境上运行，无需担心依赖问题。

## 📋 今日三件事
1. 理解 Docker 的核心概念（镜像、容器、仓库）
2. 编写 Agent 应用的 Dockerfile
3. 使用 Docker Compose 编排多服务 Agent 系统

## 🗺️ 手把手路线

### Step 1：理解 Docker 核心概念
- 做什么: 学习镜像、容器、仓库的关系
- 为什么: 这是容器化的基础
- 成功标志: 能解释镜像和容器的区别

### Step 2：编写 Dockerfile
- 做什么: 为 Agent 应用编写 Dockerfile
- 为什么: Dockerfile 是构建镜像的蓝图
- 成功标志: 能写出一个完整的 Dockerfile

### Step 3：Docker Compose 编排
- 做什么: 学习 docker-compose.yml 的编写
- 为什么: Agent 系统通常包含多个服务
- 成功标志: 能编写一个完整的 compose 文件

### Step 4：代码实践
- 做什么: 实现一个完整的容器化 Agent 示例
- 为什么: 代码是最好的理解方式
- 成功标志: 代码和配置能跑通

## 💻 代码区

```python
"""
Docker 容器化 + Docker Compose 编排
Agent 应用容器化示例
"""
from dataclasses import dataclass
from typing import Dict, List
import json

# ========== 1. Agent 应用代码 ==========

# agent_app.py - Agent 应用主文件

AGENT_APP_CODE = '''
"""
Agent 应用主文件
可容器化部署的 Agent 服务
"""
from flask import Flask, request, jsonify
import os
import logging
from datetime import datetime

app = Flask(__name__)

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 环境变量配置
MODEL_ENDPOINT = os.getenv('MODEL_ENDPOINT', 'http://localhost:8000')
API_KEY = os.getenv('API_KEY', '')
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

class AgentService:
    """Agent 服务类"""
    
    def __init__(self):
        self.model_endpoint = MODEL_ENDPOINT
        self.request_count = 0
        logger.info(f"Agent 服务初始化，模型端点: {self.model_endpoint}")
    
    def process(self, task: str) -> dict:
        """处理任务"""
        self.request_count += 1
        start_time = datetime.now()
        
        # 模拟处理
        result = {
            "task": task,
            "response": f"处理完成: {task}",
            "timestamp": start_time.isoformat(),
            "request_id": self.request_count
        }
        
        logger.info(f"处理任务 #{self.request_count}: {task[:50]}...")
        return result

agent = AgentService()

@app.route('/health', methods=['GET'])
def health():
    """健康检查"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """预测接口"""
    data = request.get_json()
    if not data or 'task' not in data:
        return jsonify({"error": "缺少 task 参数"}), 400
    
    result = agent.process(data['task'])
    return jsonify(result)

@app.route('/stats', methods=['GET'])
def stats():
    """统计信息"""
    return jsonify({
        "total_requests": agent.request_count,
        "model_endpoint": agent.model_endpoint
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=os.getenv('DEBUG', 'false').lower() == 'true')
'''

# ========== 2. Dockerfile ==========

DOCKERFILE_CONTENT = '''
# 多阶段构建
# 阶段1: 构建阶段
FROM python:3.11-slim as builder

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --user --no-cache-dir -r requirements.txt

# 阶段2: 运行阶段
FROM python:3.11-slim

WORKDIR /app

# 从构建阶段复制依赖
COPY --from=builder /root/.local /root/.local

# 设置环境变量
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:5000/health || exit 1

# 启动命令
CMD ["python", "agent_app.py"]
'''

# ========== 3. requirements.txt ==========

REQUIREMENTS_CONTENT = '''
flask==3.0.0
gunicorn==21.2.0
requests==2.31.0
python-dotenv==1.0.0
'''

# ========== 4. docker-compose.yml ==========

DOCKER_COMPOSE_CONTENT = '''
version: '3.8'

services:
  # Agent 主服务
  agent:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: agent-service
    ports:
      - "5000:5000"
    environment:
      - MODEL_ENDPOINT=http://model-service:8000
      - API_KEY=${API_KEY:-}
      - LOG_LEVEL=INFO
      - DEBUG=false
    volumes:
      - ./logs:/app/logs
    networks:
      - agent-network
    depends_on:
      - redis
      - model-service
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: redis-cache
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - agent-network
    command: redis-server --appendonly yes

  # 模型服务
  model-service:
    image: python:3.11-slim
    container_name: model-service
    working_dir: /app
    volumes:
      - ./model-service:/app
    networks:
      - agent-network
    command: python model_server.py
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - agent-network
    depends_on:
      - agent

networks:
  agent-network:
    driver: bridge

volumes:
  redis-data:
    driver: local
'''

# ========== 5. nginx.conf ==========

NGINX_CONF_CONTENT = '''
events {
    worker_connections 1024;
}

http {
    upstream agent_backend {
        server agent:5000;
    }

    server {
        listen 80;
        server_name localhost;

        # 日志配置
        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;

        # 代理配置
        location / {
            proxy_pass http://agent_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # 超时配置
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # 健康检查
        location /health {
            proxy_pass http://agent_backend/health;
            access_log off;
        }

        # 限制请求大小
        client_max_body_size 10M;
    }
}
'''

# ========== 6. .env.example ==========

ENV_EXAMPLE_CONTENT = '''
# API 密钥
API_KEY=your-api-key-here

# 模型配置
MODEL_ENDPOINT=http://model-service:8000

# 日志级别
LOG_LEVEL=INFO

# 调试模式
DEBUG=false

# Redis 配置
REDIS_URL=redis://redis:6379/0
'''

# ========== 7. 文档生成 ==========

def generate_docker_files():
    """生成所有 Docker 相关文件"""
    files = {
        "agent_app.py": AGENT_APP_CODE,
        "Dockerfile": DOCKERFILE_CONTENT,
        "requirements.txt": REQUIREMENTS_CONTENT,
        "docker-compose.yml": DOCKER_COMPOSE_CONTENT,
        "nginx/nginx.conf": NGINX_CONF_CONTENT,
        ".env.example": ENV_EXAMPLE_CONTENT
    }
    
    print("=" * 60)
    print("Docker 容器化 + Docker Compose 编排")
    print("=" * 60)
    
    for filename, content in files.items():
        print(f"\n{'='*40}")
        print(f"文件: {filename}")
        print('='*40)
        print(content.strip())
    
    # 使用说明
    print("\n" + "=" * 60)
    print("使用说明")
    print("=" * 60)
    print("""
1. 构建并启动所有服务:
   docker-compose up -d --build

2. 查看服务状态:
   docker-compose ps

3. 查看日志:
   docker-compose logs -f agent

4. 停止所有服务:
   docker-compose down

5. 扩展服务实例:
   docker-compose up -d --scale agent=3

6. 进入容器调试:
   docker-compose exec agent bash
""")
    
    return files


# ========== 8. 主函数 ==========

def main():
    """主函数"""
    files = generate_docker_files()
    
    print("\n" + "=" * 60)
    print("容器化 Agent 架构图")
    print("=" * 60)
    print("""
    ┌─────────────────────────────────────────────────┐
    │                    Nginx                         │
    │              (反向代理/负载均衡)                    │
    └─────────────────────┬───────────────────────────┘
                          │
    ┌─────────────────────▼───────────────────────────┐
    │                Agent Service                     │
    │              (Flask 应用容器)                      │
    │  ┌─────────────┐  ┌─────────────┐               │
    │  │  任务处理    │  │  健康检查    │               │
    │  └─────────────┘  └─────────────┘               │
    └──────────┬──────────────────┬───────────────────┘
               │                  │
    ┌──────────▼──────┐  ┌───────▼───────────────────┐
    │     Redis       │  │     Model Service          │
    │   (缓存/队列)   │  │      (模型推理)             │
    └─────────────────┘  └───────────────────────────┘
""")
    
    print("\n关键配置说明:")
    print("  - 多阶段构建: 减小镜像体积")
    print("  - 健康检查: 确保服务可用")
    print("  - 资源限制: 防止资源耗尽")
    print("  - 网络隔离: 服务间安全通信")
    print("  - 数据持久化: Redis 数据保存")


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 镜像构建失败 | 检查 Dockerfile 语法，查看构建日志 |
| 2 | 容器无法启动 | 检查端口冲突，查看容器日志 |
| 3 | 服务间无法通信 | 检查网络配置和服务名 |
| 4 | 数据丢失 | 使用 volumes 持久化数据 |
| 5 | 镜像太大 | 使用多阶段构建，选择 slim 基础镜像 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Docker Image | 可执行的软件包模板 |
| Container | 运行中的镜像实例 |
| Dockerfile | 构建镜像的脚本 |
| Docker Compose | 多容器编排工具 |
| Volume | 数据持久化存储 |
| Network | 容器间通信网络 |
| Health Check | 服务健康状态检查 |
| Multi-stage Build | 多阶段构建减小镜像 |

## ✅ 验收清单
- [ ] 能解释 Docker 核心概念
- [ ] 能编写 Agent 应用的 Dockerfile
- [ ] 能编写 docker-compose.yml
- [ ] 理解多服务编排的架构设计
- [ ] 配置文件能正确生成

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
