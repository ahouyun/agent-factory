# Day 1: 虚拟环境 + 包管理 + 项目结构

> 今天的目标：搭建一个干净、可复现的 Python 项目环境。这是后续 6 天所有开发的地基。

---

## 1. 为什么要学这个？

你可能有这样的经历：

- 在自己的电脑上运行得好好的代码，换台电脑就报错
- 项目 A 需要 `requests==2.28.0`，项目 B 需要 `requests==2.31.0`，两个项目互相冲突
- 不小心用 `pip install` 装了一堆东西到全局，系统 Python 被搞得乱七八糟

**虚拟环境**就是解决这些问题的"隔离房间"。每个项目有自己的独立环境，互不干扰。

---

## 2. 什么是虚拟环境？

### 2.1 用一个生活中的类比

想象你是一位厨师，有多个菜要做：

- **没有虚拟环境** = 你把所有菜的食材全堆在一个大盘子里。做红烧肉的时候混进了蛋糕粉，整个厨房乱成一团。
- **有了虚拟环境** = 你给每道菜准备一个独立的案板和调料架。红烧肉的案板上只有红烧肉的食材，蛋糕的案板上只有蛋糕的食材。互不污染。

在 Python 世界里，虚拟环境就是为每个项目创建一个**独立的 Python 解释器副本**和**独立的包安装目录**。

### 2.2 虚拟环境做了什么？

```
你的电脑
├── 系统 Python（全局）         <-- 不要在这里乱装包
├── project-a/venv/            <-- 项目 A 的虚拟环境
│   ├── bin/python             <-- 独立的 Python 解释器
│   └── lib/site-packages/     <-- 独立的包目录（只有项目 A 需要的包）
├── project-b/venv/            <-- 项目 B 的虚拟环境
│   ├── bin/python             <-- 独立的 Python 解释器
│   └── lib/site-packages/     <-- 独立的包目录（只有项目 B 需要的包）
└── ...
```

**关键概念：**
- 虚拟环境不是"复制一份 Python"，它只是创建了一个轻量级的链接结构
- 每个虚拟环境通常只有几 MB，创建/删除都很快速
- 虚拟环境只影响当前终端窗口，关掉终端就回到全局环境

---

## 3. 创建虚拟环境：手把手教程

### 3.1 前置检查：确保安装了 Python

打开终端（Windows 用 PowerShell 或 CMD，Mac/Linux 用 Terminal），输入：

```bash
python --version
```

期望输出：
```
Python 3.10.12
```

> **注意**：如果你看到 `python: command not found`，说明 Python 没有安装或者没有添加到 PATH。请先去 [python.org](https://www.python.org/downloads/) 下载安装 Python 3.10+，安装时务必勾选 **"Add Python to PATH"**。

### 3.2 创建项目文件夹

```bash
# 创建项目根目录
mkdir agent-factory

# 进入项目目录
cd agent-factory

# 查看当前目录（应该是空的）
ls -la    # Mac/Linux
dir       # Windows CMD
ls        # Windows PowerShell
```

### 3.3 创建虚拟环境

```bash
# 使用 Python 内置的 venv 模块创建虚拟环境
# "venv" 是虚拟环境的文件夹名，你可以取任何名字，但约定俗成用 "venv"
python -m venv venv
```

这条命令做了什么？

```
python       <-- 调用 Python 解释器
-m venv      <-- 使用内置的 venv 模块（venv = virtual environment 的缩写）
venv         <-- 虚拟环境文件夹的名称（第二个 venv）
```

执行完毕后，你的项目目录下会多出一个 `venv` 文件夹：

```
agent-factory/
└── venv/                <-- 刚刚创建的虚拟环境
    ├── Scripts/         <-- Windows 上的可执行文件
    │   ├── activate     <-- 激活脚本
    │   ├── activate.bat <-- CMD 用的激活脚本
    │   ├── deactivate.bat
    │   ├── python.exe   <-- 虚拟环境的 Python
    │   └── pip.exe      <-- 虚拟环境的 pip
    ├── Lib/             <-- 安装的包会放在这里（Windows）
    │   └── site-packages/
    ├── Include/
    └── pyvenv.cfg       <-- 虚拟环境的配置文件
```

> **Mac/Linux 用户注意**：目录结构略有不同，可执行文件在 `bin/` 而不是 `Scripts/`，即 `bin/activate`、`bin/python` 等。

### 3.4 激活虚拟环境

创建虚拟环境后，你需要**激活**它，告诉终端："从现在开始，用这个虚拟环境里的 Python 和 pip"。

```bash
# ===== Windows (PowerShell) =====
venv\Scripts\Activate.ps1

# ===== Windows (CMD) =====
venv\Scripts\activate.bat

# ===== Mac/Linux =====
source venv/bin/activate
```

**激活成功后，你的终端提示符会发生变化**：

```
# 激活前：
C:\Users\yourname\agent-factory>

# 激活后：
(venv) C:\Users\yourname\agent-factory>
```

> 注意前面多了 `(venv)` 前缀，这说明你现在处于虚拟环境中。**如果看不到这个前缀，说明激活没成功，需要检查命令是否正确。**

### 3.5 验证虚拟环境

```bash
# 查看 Python 路径（应该指向 venv 目录）
which python          # Mac/Linux
where python          # Windows

# 预期输出类似：
# /Users/you/agent-factory/venv/bin/python    (Mac/Linux)
# C:\Users\you\agent-factory\venv\Scripts\python.exe  (Windows)

# 查看 Python 版本
python --version
# 输出：Python 3.10.12

# 查看已安装的包（应该非常干净，只有几个基础包）
pip list
```

预期 `pip list` 输出：
```
Package    Version
---------- -------
pip        23.2.1
setuptools 68.0.0
wheel      0.41.2
```

> 只有 3 个包！这就是虚拟环境的"干净"——全局环境可能装了上百个包，但虚拟环境从零开始。

### 3.6 退出虚拟环境

当你完成工作，可以退出虚拟环境回到全局 Python：

```bash
deactivate
```

```
# 退出后：
C:\Users\yourname\agent-factory>    <-- (venv) 前缀消失了
```

> **常见错误**：忘记激活虚拟环境就开始 `pip install`，结果包装到了全局。养成习惯：每次打开终端，先激活虚拟环境。

---

## 4. 包管理：pip 的核心操作

### 4.1 安装包

```bash
# 确保虚拟环境已激活！
# 安装最新版本
pip install requests

# 安装指定版本（精确版本）
pip install requests==2.31.0

# 安装最低版本
pip install "requests>=2.28.0"

# 安装多个包（用空格分隔）
pip install requests httpx typer

# 从 requirements.txt 文件安装
pip install -r requirements.txt
```

### 4.2 查看已安装的包

```bash
# 列出所有已安装的包
pip list

# 输出示例：
# Package            Version
# ------------------ ---------
# certifi            2023.7.22
# charset-normalizer 3.2.0
# idna               3.4
# requests           2.31.0
# urllib3            2.0.4

# 查看某个包的详细信息
pip show requests

# 输出示例：
# Name: requests
# Version: 2.31.0
# Summary: Python HTTP for Humans.
# Home-page: https://requests.readthedocs.io
# Author: Kenneth Reitz
# License: Apache 2.0
# Location: /path/to/venv/lib/python3.10/site-packages
# Requires: certifi, charset-normalizer, idna, urllib3
# Required-by:
```

### 4.3 卸载包

```bash
pip uninstall requests

# 卸载时不提示确认
pip uninstall requests -y
```

### 4.4 生成 requirements.txt

`requirements.txt` 是项目的"购物清单"，记录了项目依赖的所有包及其版本。别人拿到你的代码后，只需运行 `pip install -r requirements.txt` 就能复现你的环境。

```bash
# 导出当前环境的所有包到 requirements.txt
pip freeze > requirements.txt
```

生成的 `requirements.txt` 内容类似：
```
certifi==2023.7.22
charset-normalizer==3.2.0
httpx==0.24.1
idna==3.4
requests==2.31.0
urllib3==2.0.4
```

> **最佳实践**：每次安装新包后都运行一次 `pip freeze > requirements.txt`，保持清单与实际一致。

### 4.5 从 requirements.txt 安装

```bash
# 先确保虚拟环境已激活
pip install -r requirements.txt
```

这会读取文件中的每一行，逐个安装指定版本的包。如果某个包已经安装且版本匹配，会跳过。

### 4.6 解决安装问题

**问题 1：pip 版本太旧**

```bash
# 升级 pip 到最新版本
python -m pip install --upgrade pip
```

**问题 2：网络问题（国内用户）**

```bash
# 使用清华镜像源安装（临时）
pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple

# 永久设置默认镜像源（以后每次 install 自动走镜像）
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

**问题 3：安装时报错 "Microsoft Visual C++ 14.0 is required"**

某些包（如 `numpy` 的某些版本）需要 C++ 编译器。解决办法：
- 安装预编译的 wheel 包：`pip install numpy --only-binary=:all:`
- 或者安装 Visual Studio Build Tools

---

## 5. 标准项目结构

一个规范的 Python 项目应该有这样的目录结构：

```
agent-factory/
│
├── venv/                    # 虚拟环境（不要提交到 Git！）
│
├── src/                     # 源代码目录
│   └── agent_factory/       # 包名（Python 可识别的包）
│       ├── __init__.py      # 标记为 Python 包（可以为空）
│       ├── __main__.py      # 允许 python -m agent_factory 运行
│       ├── cli.py           # 命令行入口（Day 5 会详细讲）
│       ├── llm.py           # 大模型调用逻辑（Day 3 会详细讲）
│       └── utils.py         # 工具函数
│
├── tests/                   # 测试代码目录
│   ├── __init__.py
│   └── test_llm.py          # 测试文件（Day 7 会详细讲）
│
├── docs/                    # 文档目录
│   └── week1/               # 本周课程文档
│
├── examples/                # 示例代码
│   └── hello_world.py
│
├── .gitignore               # Git 忽略规则
├── .env.example             # 环境变量模板（不要放真实密钥！）
├── pyproject.toml           # 项目元数据和构建配置
├── requirements.txt         # 依赖清单
├── README.md                # 项目说明
└── LICENSE                  # 开源协议（可选）
```

### 5.1 每个文件/目录的作用

| 路径 | 作用 | 是否提交到 Git |
|------|------|---------------|
| `venv/` | 虚拟环境 | **不提交**（太大、每台电脑不同） |
| `src/agent_factory/` | 核心源代码 | 提交 |
| `tests/` | 测试代码 | 提交 |
| `docs/` | 文档 | 提交 |
| `.gitignore` | 告诉 Git 哪些文件不要追踪 | 提交 |
| `.env` | 真实的密钥和配置 | **绝不提交** |
| `.env.example` | .env 的模板 | 提交 |
| `requirements.txt` | 依赖清单 | 提交 |
| `pyproject.toml` | 项目配置 | 提交 |

### 5.2 创建目录结构

```bash
# 确保在项目根目录下
cd agent-factory

# 创建目录结构
mkdir -p src/agent_factory
mkdir -p tests
mkdir -p docs/week1
mkdir -p examples

# 创建 Python 包标记文件
touch src/agent_factory/__init__.py
touch src/agent_factory/__main__.py
touch tests/__init__.py

# 创建其他文件
touch src/agent_factory/cli.py
touch src/agent_factory/llm.py
touch src/agent_factory/utils.py
touch .gitignore
touch .env.example
touch pyproject.toml
touch requirements.txt
touch README.md
```

> **Windows 用户**：如果没有 `touch` 命令，可以用以下 PowerShell 替代：
> ```powershell
> New-Item -ItemType File -Path "src/agent_factory/__init__.py"
> ```
> 或者在 CMD 中：
> ```cmd
> type nul > src\agent_factory\__init__.py
> ```

### 5.3 关键文件内容

#### `src/agent_factory/__init__.py`

这个文件告诉 Python："这个文件夹是一个 Python 包"。通常为空，或者放一些版本信息：

```python
"""Agent Factory - 从零构建 AI Agent"""

__version__ = "0.1.0"
```

#### `src/agent_factory/__main__.py`

这个文件让你可以运行 `python -m agent_factory`：

```python
"""允许通过 python -m agent_factory 运行程序"""

from agent_factory.cli import main

if __name__ == "__main__":
    main()
```

#### `examples/hello_world.py`

一个简单的示例文件，验证环境是否正常：

```python
"""第一个示例：验证环境是否正常工作"""

import sys

def main():
    print(f"Python 版本: {sys.version}")
    print("Agent Factory 环境搭建成功！")
    print("你可以开始构建 AI Agent 了。")

if __name__ == "__main__":
    main()
```

运行验证：

```bash
python examples/hello_world.py
```

预期输出：

```
Python 版本: 3.10.12 (main, Jun  7 2023, 10:13:09) [GCC 12.2.0]
Agent Factory 环境搭建成功！
你可以开始构建 AI Agent 了。
```

---

## 6. .gitignore 文件

`.gitignore` 告诉 Git："这些文件/目录不要追踪"。

```gitignore
# ===== 虚拟环境 =====
venv/
.venv/
env/
ENV/

# ===== Python 缓存 =====
__pycache__/
*.py[cod]
*$py.class
*.so

# ===== 发行版分发 =====
dist/
build/
*.egg-info/
*.egg

# ===== 环境变量（包含密钥！） =====
.env

# ===== IDE 配置 =====
.vscode/
.idea/
*.swp
*.swo

# ===== 操作系统文件 =====
.DS_Store          # Mac
Thumbs.db          # Windows

# ===== 测试和覆盖率 =====
.pytest_cache/
.coverage
htmlcov/

# ===== 日志文件 =====
*.log
logs/
```

---

## 7. pyproject.toml 文件

这是 Python 项目的"身份证"，定义了项目的基本信息：

```toml
[build-system]
requires = ["setuptools>=68.0", "wheel"]
build-backend = "setuptools.backends._legacy:_Backend"

[project]
name = "agent-factory"
version = "0.1.0"
description = "从零构建 AI Agent - Week 1 学习笔记"
readme = "README.md"
license = {text = "MIT"}
requires-python = ">=3.10"

dependencies = [
    "requests>=2.28.0",
    "httpx>=0.24.0",
    "typer>=0.9.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
]

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
```

---

## 8. .env.example 文件

这个文件是 `.env` 的模板，告诉协作者需要哪些环境变量，但不包含真实值：

```bash
# ===== 大模型 API 配置 =====

# OpenAI API
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_BASE_URL=https://api.openai.com/v1

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# DeepSeek API（国内替代）
DEEPSEEK_API_KEY=your-deepseek-key-here

# ===== 应用配置 =====
DEFAULT_MODEL=gpt-4o-mini
LOG_LEVEL=INFO
```

> **安全规则**：`.env` 文件包含真实密钥，**绝对不能**提交到 Git。`.gitignore` 中已经包含了 `.env` 规则。

---

## 9. 完整实战：从零搭建环境

让我们把上面学到的所有知识串起来，做一个完整的实战。

### 步骤 1：创建项目并初始化

```bash
# 创建项目目录
mkdir agent-factory
cd agent-factory

# 初始化 Git 仓库
git init
```

### 步骤 2：创建并激活虚拟环境

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows PowerShell:
venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# Mac/Linux:
source venv/bin/activate

# 验证
python --version
pip --version
```

### 步骤 3：安装基础依赖

```bash
# 升级 pip
python -m pip install --upgrade pip

# 安装项目依赖
pip install requests httpx typer python-dotenv

# 安装开发依赖
pip install pytest pytest-asyncio

# 导出依赖
pip freeze > requirements.txt
```

### 步骤 4：创建项目结构

```bash
mkdir -p src/agent_factory
mkdir -p tests
mkdir -p examples

touch src/agent_factory/__init__.py
touch src/agent_factory/__main__.py
touch src/agent_factory/cli.py
touch src/agent_factory/llm.py
touch src/agent_factory/utils.py
touch tests/__init__.py
touch examples/hello_world.py
```

### 步骤 5：创建配置文件

创建 `src/agent_factory/__init__.py`，内容为：
```python
"""Agent Factory - 从零构建 AI Agent"""
__version__ = "0.1.0"
```

创建 `examples/hello_world.py`，内容为：
```python
import sys

def main():
    print(f"Python 版本: {sys.version}")
    print("Agent Factory 环境搭建成功！")

if __name__ == "__main__":
    main()
```

### 步骤 6：验证一切正常

```bash
# 运行示例
python examples/hello_world.py

# 预期输出：
# Python 版本: 3.10.12 (main, Jun  7 2023, 10:13:09) [GCC 12.2.0]
# Agent Factory 环境搭建成功！
```

### 步骤 7：提交到 Git

```bash
# 添加 .gitignore 内容后

git add .
git commit -m "Initial project setup: virtual env, project structure"
```

---

## 10. 常见问题 FAQ

### Q1：每次都要创建虚拟环境吗？
**是的**。每个项目都应该有自己的虚拟环境。好在创建很快（几秒钟），而且有 `requirements.txt`，安装依赖也很快。

### Q2：venv 文件夹要不要提交到 Git？
**不要**。`venv/` 只包含你本机的 Python 副本，别人用不了。只需提交 `requirements.txt`，别人自己创建虚拟环境后 `pip install -r requirements.txt` 即可。

### Q3：我忘记激活虚拟环境就装了包，怎么办？
```bash
# 查看包安装在哪里
pip show requests

# 如果 Location 不是 venv 路径，说明装到了全局
# 那么先卸载
pip uninstall requests

# 激活虚拟环境后重新安装
source venv/bin/activate  # 或 Windows 命令
pip install requests
```

### Q4：IDE（如 VS Code）怎么知道用哪个 Python？
在 VS Code 中：
1. 按 `Ctrl+Shift+P`（Mac: `Cmd+Shift+P`）
2. 输入 "Python: Select Interpreter"
3. 选择你项目的 venv 对应的 Python 路径

### Q5：requirements.txt 和 pyproject.toml 有什么区别？
- `requirements.txt`：简单直接，只有包名和版本号
- `pyproject.toml`：更现代，包含项目元数据、构建配置、依赖分组等
- 两者都要保留，`requirements.txt` 给用户一键安装，`pyproject.toml` 给工具链使用

---

## 11. 今日小结

| 知识点 | 要点 |
|--------|------|
| 虚拟环境 | 每个项目独立的 Python 隔离空间 |
| `python -m venv venv` | 创建虚拟环境 |
| `source venv/bin/activate` | 激活虚拟环境（注意提示符变化） |
| `pip install` / `pip freeze` | 安装包 / 导出依赖 |
| `requirements.txt` | 依赖清单，提交到 Git |
| `.gitignore` | 排除 venv、__pycache__、.env 等 |
| 项目结构 | `src/` 放代码、`tests/` 放测试、`docs/` 放文档 |

---

## 12. 课后练习

1. 在你的电脑上创建一个新的虚拟环境，安装 `requests` 和 `httpx`，然后导出 `requirements.txt`
2. 创建完整的项目结构（按照上面的目录树）
3. 运行 `examples/hello_world.py`，确认环境正常
4. 思考题：为什么 Python 要用 `requirements.txt` 而不是直接在代码里 `import` 就行了？

---

> **明天预告**：Day 2 我们将学习 HTTP 协议和 `requests`/`httpx` 库——这是与大模型 API 通信的基础。
