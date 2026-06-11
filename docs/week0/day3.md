# Week 0 Day 3: 项目仓库初始化

> 今天我们将创建 Agent Factory 的项目仓库，搭建标准的项目目录结构，并配置 CLAUDE.md 文件。好的项目结构是成功的一半。

---

## 一、今天的目标

1. 理解为什么需要版本控制和项目结构
2. 创建项目目录并初始化 Git 仓库
3. 编写 CLAUDE.md 配置文件
4. 完成第一次 Git 提交

---

## 二、创建项目目录

### 2.1 确定项目位置

首先决定项目放在哪里。本课程建议放在 `D:\claude-workspace\agent-factory`。

```powershell
# 创建项目目录（如果还没有的话）
mkdir D:\claude-workspace\agent-factory

# 进入项目目录
cd D:\claude-workspace\agent-factory

# 确认当前目录
pwd
# 预期输出: D:\claude-workspace\agent-factory
```

### 2.2 创建目录结构

一个规范的 Python 项目应该有这样的结构：

```
agent-factory/
├── src/                    # 源代码目录
│   └── agent_factory/      # Python 包
│       ├── __init__.py     # 包初始化文件
│       └── main.py         # 主入口文件
├── tests/                  # 测试文件目录
│   ├── __init__.py
│   └── test_main.py        # 测试文件
├── docs/                   # 文档目录
├── scripts/                # 脚本工具目录
├── data/                   # 数据文件目录
├── logs/                   # 日志文件目录
├── CLAUDE.md               # AI 工具配置文件
├── README.md               # 项目说明文件
├── requirements.txt        # Python 依赖列表
└── .gitignore              # Git 忽略文件列表
```

**手动创建（一步一步来）：**

```powershell
# 确保在项目根目录
cd D:\claude-workspace\agent-factory

# 创建子目录
mkdir src
mkdir src\agent_factory
mkdir tests
mkdir docs
mkdir scripts
mkdir data
mkdir logs

# 创建空文件（用 New-Item 命令）
New-Item -Path "src\agent_factory\__init__.py" -ItemType File -Force
New-Item -Path "src\agent_factory\main.py" -ItemType File -Force
New-Item -Path "tests\__init__.py" -ItemType File -Force
New-Item -Path "tests\test_main.py" -ItemType File -Force
New-Item -Path "CLAUDE.md" -ItemType File -Force
New-Item -Path "README.md" -ItemType File -Force
New-Item -Path "requirements.txt" -ItemType File -Force
New-Item -Path ".gitignore" -ItemType File -Force
```

**验证目录结构：**

```powershell
# 查看目录树（PowerShell）
tree /F
```

---

## 三、初始化 Git 仓库

### 3.1 什么是 Git 仓库？

Git 仓库就像一个**时间机器**，它记录了你项目的每一次修改。你可以随时回到任何一个历史版本。

### 3.2 初始化仓库

```powershell
# 确保在项目根目录
cd D:\claude-workspace\agent-factory

# 初始化 Git 仓库
git init
```

**预期输出：**
```
Initialized empty Git repository in D:/claude-workspace/agent-factory/.git/
```

初始化后，目录中会多一个 `.git` 隐藏文件夹，这就是 Git 仓库的数据存储位置。**不要手动修改这个文件夹。**

### 3.3 查看仓库状态

```powershell
git status
```

**预期输出：**
```
On branch master

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .gitignore
        CLAUDE.md
        README.md
        requirements.txt
        data/
        docs/
        logs/
        scripts/
        src/
        tests/

nothing added to commit but untracked files present
```

这个输出告诉我们：
- 当前在 `master` 分支
- 还没有任何提交
- 有一些未跟踪的文件（就是我们刚创建的文件和目录）

---

## 四、编写 .gitignore 文件

`.gitignore` 告诉 Git 哪些文件不需要跟踪。比如 Python 编译产生的临时文件、虚拟环境、敏感信息等。

把以下内容写入 `.gitignore` 文件：

```gitignore
# Python 编译文件
__pycache__/
*.py[cod]
*$py.class
*.so

# Python 虚拟环境
venv/
env/
ENV/

# IDE 配置
.vscode/
.idea/
*.swp
*.swo
*~

# 日志文件
logs/
*.log

# 环境变量（敏感信息，绝不能提交）
.env
.env.local

# 操作系统文件
.DS_Store
Thumbs.db

# 分发/打包
dist/
build/
*.egg-info/
```

**如何写入文件：** 在 PowerShell 中，可以用以下命令：

```powershell
# 方法一：用 VS Code 打开并编辑
code .gitignore

# 方法二：用记事本打开
notepad .gitignore
```

把上面的内容粘贴进去，保存关闭。

---

## 五、编写 README.md

README.md 是项目的"门面"，告诉别人（包括未来的你）这个项目是什么、怎么用。

```markdown
# Agent Factory

从零开始学习 AI Agent 开发的实战课程。

## 课程结构

- Week 0: 基础准备
- Week 1: Python + HTTP
- Week 2: FastAPI Web 框架
- Week 3: LLM 基础
- Week 4: Agent 范式

## 快速开始

1. 克隆仓库: `git clone <仓库地址>`
2. 创建虚拟环境: `python -m venv venv`
3. 激活虚拟环境: `venv\Scripts\activate`（Windows）
4. 安装依赖: `pip install -r requirements.txt`

## 技术栈

- Python 3.12+
- FastAPI
- Claude Code / Codex CLI
```

同样用 `code README.md` 打开编辑，粘贴内容后保存。

---

## 六、编写 CLAUDE.md

CLAUDE.md 是 Claude Code 的**项目配置文件**。当你在项目目录中使用 Claude Code 时，它会自动读取这个文件来了解项目信息。

```markdown
# Agent Factory

## 项目概述

这是一个从零开始学习 AI Agent 开发的实战项目。

## 技术栈

- Python 3.12+
- FastAPI（Web 框架，Week 2 使用）
- 大模型 API（Claude / OpenAI）

## 项目结构

- src/agent_factory/: 源代码
- tests/: 测试文件
- docs/: 文档
- scripts/: 工具脚本
- data/: 数据文件
- logs/: 日志文件

## 编码规范

1. 使用 Python 类型提示
2. 所有函数必须有文档字符串（docstring）
3. 使用中文注释说明关键逻辑
4. 遵循 PEP 8 代码风格

## 开发约定

- 使用虚拟环境，不要污染系统 Python
- 每次修改后运行测试确认没有破坏
- Git 提交信息用中文描述
```

---

## 七、第一次 Git 提交

### 7.1 添加文件到暂存区

```powershell
# 添加所有文件到暂存区
git add .

# 查看状态
git status
```

**预期输出：**
```
On branch master

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   .gitignore
        new file:   CLAUDE.md
        new file:   README.md
        new file:   requirements.txt
        new file:   data/
        new file:   docs/
        new file:   logs/
        new file:   scripts/
        new file:   src/agent_factory/__init__.py
        new file:   src/agent_factory/main.py
        new file:   tests/__init__.py
        new file:   tests/test_main.py
```

### 7.2 提交代码

```powershell
# 提交代码，-m 后面是提交信息
git commit -m "初始化项目结构"
```

**预期输出：**
```
[master (root-commit) a1b2c3d] 初始化项目结构
 12 files changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 .gitignore
 create mode 100644 CLAUDE.md
 ...
```

### 7.3 查看提交历史

```powershell
git log --oneline
```

**预期输出：**
```
a1b2c3d 初始化项目结构
```

### 7.4 Git 基础命令速查

| 命令 | 作用 | 示例 |
|------|------|------|
| `git init` | 初始化仓库 | `git init` |
| `git add .` | 添加所有修改到暂存区 | `git add .` |
| `git add <file>` | 添加指定文件 | `git add README.md` |
| `git commit -m "信息"` | 提交暂存区的修改 | `git commit -m "修复bug"` |
| `git status` | 查看当前状态 | `git status` |
| `git log` | 查看提交历史 | `git log --oneline` |
| `git diff` | 查看未暂存的修改 | `git diff` |
| `git checkout -- <file>` | 撤销文件修改 | `git checkout -- main.py` |

---

## 八、Git 提交信息规范

好的提交信息能让项目历史清晰可读。推荐格式：

```
<类型>: <简短描述>
```

常用的类型：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 只修改了文档
- `style`: 代码格式修改（不影响逻辑）
- `refactor`: 重构代码

示例：
```bash
git commit -m "feat: 添加天气查询功能"
git commit -m "fix: 修复日期格式错误"
git commit -m "docs: 更新 README 安装说明"
```

---

## 九、今日验收清单

- [ ] 项目目录结构正确（包含 src、tests、docs 等目录）
- [ ] Git 仓库初始化成功（`git init` 执行成功）
- [ ] `.gitignore` 文件内容正确
- [ ] `README.md` 文件已创建
- [ ] `CLAUDE.md` 文件已创建
- [ ] 第一次 Git 提交成功（`git log` 能看到提交记录）
- [ ] 能理解 `git add`、`git commit`、`git status` 的作用

---

## 十、常见问题

**Q: `git init` 提示 "fatal: bad default branch name"**
A: 这通常不影响使用。如果想指定默认分支名，可以用 `git init --initial-branch=main`。

**Q: 不小心把敏感信息（如 API Key）提交了怎么办？**
A: 立即修改 API Key，然后从 Git 历史中删除。初学者建议用 `.gitignore` 预防。

**Q: `git commit` 提示需要先配置用户信息？**
A: 按照提示运行：
```powershell
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

---

## 十一、今日复盘

- 项目目录结构你理解了吗？每个目录的作用是什么？
- Git 的 add 和 commit 有什么区别？
- 你觉得 Git 最有用的功能是什么？

---

## 十二、明日预告

明天我们将安装 **Obsidian** 知识管理工具，搭建学习笔记体系。请确保今天的项目仓库已经创建并提交成功。
