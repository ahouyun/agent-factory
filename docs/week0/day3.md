# 📅 Week 0 Day 3：项目仓库初始化 + CLAUDE.md 配置

## 🧭 今日方向
> 今天我们将创建 Agent Factory 的项目仓库，配置 CLAUDE.md 文件，建立项目的基础设施。良好的项目结构是成功的一半。

## 🎯 生活比喻
> 建造房子前要先打好地基、立好框架。今天我们要做的就是为 Agent Factory 项目打下坚实的基础，确保后续开发有条不紊。

## 📋 今日三件事
1. 创建 Git 仓库并初始化项目结构
2. 编写 CLAUDE.md 配置文件
3. 设置项目的基本配置（.gitignore, README 等）

## 🗺️ 手把手路线

### Step 1: 创建项目目录结构
- **做什么**: 创建标准的项目目录结构
- **为什么**: 清晰的目录结构让项目易于维护和扩展
- **成功标志**: 目录结构符合 Python 项目最佳实践

### Step 2: 初始化 Git 仓库
- **做什么**: 使用 `git init` 初始化仓库，创建首次提交
- **为什么**: 从第一天就养成版本控制的习惯
- **成功标志**: 能看到 `.git` 目录，提交历史正常

### Step 3: 编写 CLAUDE.md
- **做什么**: 创建 CLAUDE.md 文件，定义项目规范
- **为什么**: CLAUDE.md 是 AI 工具理解项目的关键配置
- **成功标志**: CLAUDE.md 包含项目的基本信息和规范

## 💻 代码区

```bash
# 项目初始化脚本
# 保存为 init_project.sh 并执行

#!/bin/bash

# 创建项目目录结构
mkdir -p agent-factory
cd agent-factory

# 创建标准目录
mkdir -p src/agent_factory
mkdir -p tests
mkdir -p docs
mkdir -p scripts
mkdir -p data
mkdir -p logs

# 创建 Python 包文件
touch src/agent_factory/__init__.py
touch src/agent_factory/main.py
touch tests/__init__.py
touch tests/test_main.py

# 创建配置文件
touch .gitignore
touch README.md
touch CLAUDE.md
touch requirements.txt
touch setup.py
touch pyproject.toml

# 初始化 Git
git init

# 创建 .gitignore
cat > .gitignore << 'EOF'
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
EOF

echo "✅ 项目结构创建完成！"
echo "📁 目录结构："
find . -type f -not -path "./.git/*" | sort
```

```python
# CLAUDE.md 配置文件示例
# 保存为 CLAUDE.md

"""
# Agent Factory

## 项目概述
这是一个学习 AI Agent 开发的实践项目，目标是构建一个完整的 Agent 系统。

## 技术栈
- Python 3.10+
- FastAPI (Web 框架)
- SQLAlchemy (数据库 ORM)
- OpenAI/Anthropic API (大模型接口)

## 项目结构
```
agent-factory/
├── src/
│   └── agent_factory/
│       ├── __init__.py
│       └── main.py
├── tests/
├── docs/
├── scripts/
├── data/
├── logs/
├── CLAUDE.md
└── README.md
```

## 编码规范
1. 使用 Python 类型提示
2. 所有函数必须有文档字符串
3. 遵循 PEP 8 代码风格
4. 使用中文注释说明关键逻辑

## 开发流程
1. 先写测试，再写实现
2. 每个功能模块独立开发
3. 使用 Git 进行版本控制
4. 定期复盘学习进度

## AI 工具使用规范
1. 使用 Claude Code 辅助开发
2. 生成的代码必须经过测试
3. 保持代码可读性和可维护性
"""
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | git init 报错 | 确保当前目录不存在 .git 文件夹，或使用 `git init --initial-branch=main` |
| 2 | 目录结构混乱 | 参考标准 Python 项目结构重新组织 |
| 3 | CLAUDE.md 格式错误 | 使用 Markdown 语法，确保格式正确 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Git 仓库 | 存储项目历史和版本信息的数据库 |
| CLAUDE.md | AI 工具的项目配置文件，定义项目规范 |
| .gitignore | 指定 Git 忽略跟踪的文件列表 |
| 项目结构 | 代码文件的组织方式 |

## ✅ 验收清单
- [ ] 项目目录结构清晰合理
- [ ] Git 仓库初始化成功
- [ ] CLAUDE.md 文件内容完整
- [ ] 能执行 `git status` 查看仓库状态

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
