# 📅 Week 1 Day 1：虚拟环境 + 包管理 + 项目结构

## 🧭 今日方向
> 今天我们将学习 Python 项目的最佳实践：使用虚拟环境隔离依赖、掌握包管理工具、理解标准化的项目结构。

## 🎯 生享比喻
> 虚拟环境就像为每个项目准备独立的"工作台"，包管理就是工具箱的管理员，项目结构就是工作台的布局图。

## 📋 今日三件事
1. 学习虚拟环境的创建和管理
2. 掌握 pip 和 pyproject.toml 的使用
3. 建立标准化的项目结构

## 🗺️ 手把手路线

### Step 1: 创建虚拟环境
- **做什么**: 使用 `python -m venv` 创建虚拟环境
- **为什么**: 隔离项目依赖，避免版本冲突
- **成功标志**: 能成功创建并激活虚拟环境

### Step 2: 包管理基础
- **做什么**: 学习 pip 命令和 requirements.txt
- **为什么**: 管理项目依赖是开发的基础
- **成功标志**: 能安装、卸载、导出依赖

### Step 3: 项目结构规范
- **做什么**: 建立符合 Python 最佳实践的项目结构
- **为什么**: 清晰的结构让项目易于维护
- **成功标志**: 项目结构符合标准

## 💻 代码区

```bash
# 虚拟环境操作脚本

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境 (Windows)
venv\Scripts\activate

# 激活虚拟环境 (Linux/Mac)
source venv/bin/activate

# 查看 Python 路径（应该是虚拟环境中的）
which python

# 退出虚拟环境
deactivate
```

```python
# 包管理工具 - requirements.txt 示例

# 创建 requirements.txt
requirements_content = """
# Web 框架
fastapi==0.104.1
uvicorn[standard]==0.24.0

# 数据库
sqlalchemy==2.0.23
alembic==1.13.0

# HTTP 客户端
httpx==0.25.2
requests==2.31.0

# 数据验证
pydantic==2.5.2

# 环境变量
python-dotenv==1.0.0

# 测试
pytest==7.4.3
pytest-asyncio==0.23.2

# 开发工具
black==23.12.0
ruff==0.1.8
mypy==1.7.1
"""

# 保存 requirements.txt
with open("requirements.txt", "w", encoding="utf-8") as f:
    f.write(requirements_content.strip())

print("✅ requirements.txt 已创建")
```

```python
# pyproject.toml 示例 - 现代 Python 项目配置

pyproject_content = """
[build-system]
requires = ["setuptools>=68.0", "wheel"]
build-backend = "setuptools.backends._legacy:_Backend"

[project]
name = "agent-factory"
version = "0.1.0"
description = "AI Agent 开发学习项目"
readme = "README.md"
license = {text = "MIT"}
requires-python = ">=3.10"
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "sqlalchemy>=2.0.0",
    "httpx>=0.25.0",
    "pydantic>=2.0.0",
    "python-dotenv>=1.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.23.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
    "mypy>=1.0.0",
]

[tool.black]
line-length = 88
target-version = ["py310"]

[tool.ruff]
line-length = 88
select = ["E", "F", "I", "N", "W", "UP"]
ignore = ["E501"]

[tool.mypy]
python_version = "3.10"
warn_return_any = true
warn_unused_ignores = true
"""

# 保存 pyproject.toml
with open("pyproject.toml", "w", encoding="utf-8") as f:
    f.write(pyproject_content.strip())

print("✅ pyproject.toml 已创建")
```

```python
# 项目结构创建脚本

import os
from pathlib import Path

def create_project_structure(project_name: str):
    """创建标准化的 Python 项目结构"""
    
    # 定义目录结构
    directories = [
        f"{project_name}",
        f"{project_name}/src",
        f"{project_name}/src/{project_name.replace('-', '_')}",
        f"{project_name}/tests",
        f"{project_name}/tests/unit",
        f"{project_name}/tests/integration",
        f"{project_name}/docs",
        f"{project_name}/scripts",
        f"{project_name}/data",
        f"{project_name}/logs",
    ]
    
    # 创建目录
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"📁 创建目录: {directory}")
    
    # 创建必要的文件
    files = {
        f"{project_name}/src/{project_name.replace('-', '_')}/__init__.py": 
            '"""Agent Factory 包"""\n\n__version__ = "0.1.0"\n',
        
        f"{project_name}/tests/__init__.py": "",
        f"{project_name}/tests/unit/__init__.py": "",
        f"{project_name}/tests/integration/__init__.py": "",
        
        f"{project_name}/.gitignore": """
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# 虚拟环境
venv/
env/
ENV/
env.bak/
venv.bak/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# 日志
logs/
*.log

# 环境变量
.env
.env.local
""",
        
        f"{project_name}/.env.example": """
# API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# 数据库
DATABASE_URL=sqlite:///./app.db

# 开发设置
DEBUG=true
LOG_LEVEL=INFO
""",
        
        f"{project_name}/setup.py": """
from setuptools import setup, find_packages

setup(
    name="agent-factory",
    version="0.1.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.10",
)
""",
    }
    
    # 创建文件
    for file_path, content in files.items():
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"📄 创建文件: {file_path}")
    
    print(f"\n🎉 项目 '{project_name}' 结构创建完成！")

if __name__ == "__main__":
    create_project_structure("agent-factory")
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 虚拟环境激活失败 | 确保使用正确的激活命令，检查 Python 版本 |
| 2 | pip 安装超时 | 使用国内镜像源：`pip install -i https://pypi.tuna.tsinghua.edu.cn/simple` |
| 3 | 项目结构混乱 | 参考标准结构重新组织，使用脚本自动创建 |
| 4 | .env 文件泄露 | 确保 .gitignore 包含 .env，已提交的 .env 要从历史中删除 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| 虚拟环境 | 隔离的 Python 环境，每个项目独立 |
| pip | Python 包管理工具 |
| requirements.txt | 列出项目依赖的文件 |
| pyproject.toml | 现代 Python 项目配置文件 |
| 包 (Package) | 包含 __init__.py 的 Python 模块目录 |
| 模块 (Module) | 单个 Python 文件 |

## ✅ 验收清单
- [ ] 能成功创建和激活虚拟环境
- [ ] 理解 pip 的基本命令
- [ ] 能使用 requirements.txt 管理依赖
- [ ] 项目结构符合 Python 最佳实践

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
