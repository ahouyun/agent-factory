# 📅 Day 1：学习路线总览 + 工具链搭建

## 🧭 今日方向
> 今天是 Phase 0 预备周的第一天，目标是**搭建好开发环境**，让你后续每天都能顺畅地写代码、调 API、用 AI 辅助开发。这是整个 20 周学习的地基——地基不稳，后面全白搭。

## 🎯 生活比喻
> 搭工具链就像**装修厨房前先通水通电**。你不会在没水没电的厨房里做饭，同理，没有 Python、Git、编辑器、AI 工具的环境，写 Agent 就像空手炒菜。

## 📋 今日三件事（最多 3 件）
1. **安装并验证 Python 3.10+ 环境** — 验收标准: 终端执行 `python --version` 显示 3.10+
2. **安装并配置 Git + VS Code / Cursor** — 验收标准: `git --version` 能输出版本号，编辑器能打开项目文件夹
3. **安装 Claude Code 并成功运行第一个 AI 辅助脚本** — 验收标准: 用 Claude Code 生成一个 Python 脚本并成功运行

## 🗺️ 手把手路线（预计 2-3 小时）

### Step 1: 安装 Python 3.10+
- **做什么**: 下载安装 Python 3.10 或更高版本（推荐 3.12）
- **为什么**: Agent 项目依赖 Python 生态（FastAPI、LangChain、OpenAI SDK 等），3.10+ 是最低要求
- **成功标志**: 终端执行以下命令，输出版本号
  ```bash
  python --version
  # 预期输出: Python 3.12.x

  pip --version
  # 预期输出: pip 24.x from ...
  ```
- **Windows 用户注意**:
  - 从 [python.org](https://www.python.org/downloads/) 下载安装包
  - 安装时 **务必勾选 "Add Python to PATH"**
  - 或使用 `winget install Python.Python.3.12`

### Step 2: 安装 Git
- **做什么**: 安装 Git 版本控制工具
- **为什么**: 后续所有代码管理、协作、CI/CD 都依赖 Git
- **成功标志**:
  ```bash
  git --version
  # 预期输出: git version 2.x.x
  ```
- **Windows 用户**:
  - `winget install Git.Git`
  - 或从 [git-scm.com](https://git-scm.com/) 下载

### Step 3: 安装编辑器（VS Code 或 Cursor）
- **做什么**: 安装代码编辑器，推荐 VS Code 或 Cursor
- **为什么**: 后续 Claude Code 会以扩展形式集成到编辑器中
- **推荐扩展**:
  - Python (Microsoft)
  - Pylance
  - GitLens
  - Claude Code (如果是 Cursor 则内置)

### Step 4: 配置 Python 虚拟环境
- **做什么**: 学会使用 `venv` 创建隔离的 Python 环境
- **为什么**: 不同项目依赖不同版本的包，虚拟环境避免冲突（就像每个厨房有自己的调料架）
- **成功标志**:
  ```bash
  # 在项目目录下创建虚拟环境
  python -m venv .venv

  # 激活虚拟环境（Windows）
  .venv\Scripts\activate

  # 激活虚拟环境（Mac/Linux）
  source .venv/bin/activate

  # 确认激活成功（终端前缀应出现 (.venv)）
  which python
  # 应指向 .venv 目录下的 python
  ```

### Step 5: 安装 Claude Code
- **做什么**: 安装 Anthropic 的 Claude Code CLI 工具
- **为什么**: 这是我们的核心 AI 辅助开发工具，后续每天都会用到
- **成功标志**:
  ```bash
  # 安装 Claude Code
  npm install -g @anthropic-ai/claude-code

  # 验证安装
  claude --version

  # 运行 Claude Code
  claude
  ```
- **前提**: 需要先安装 [Node.js](https://nodejs.org/)（推荐 LTS 版本）

### Step 6: 用 Claude Code 生成并运行第一个脚本
- **做什么**: 用 Claude Code 生成一个简单的 Python 脚本并运行
- **为什么**: 验证整个工具链是否打通（Python + 编辑器 + AI 工具）
- **成功标志**: 在 Claude Code 中输入以下提示，生成并运行脚本
  ```
  帮我写一个 Python 脚本，打印 "Hello Agent Factory!" 并显示当前日期时间
  ```
  运行后应看到类似输出：
  ```
  Hello Agent Factory!
  当前时间: 2026-06-11 xx:xx:xx
  ```

## 💻 代码区

### 验证环境的最小脚本 `check_env.py`
```python
"""
环境检查脚本 —— 验证所有工具是否安装正确
运行方式: python check_env.py
"""

import sys
import subprocess
import shutil


def check_python():
    """检查 Python 版本"""
    version = sys.version_info
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    if version.minor < 10:
        print("   ⚠️  警告: 建议使用 Python 3.10+")
    return version.minor >= 10


def check_pip():
    """检查 pip 是否可用"""
    try:
        import pip
        print(f"✅ pip {pip.__version__}")
        return True
    except ImportError:
        print("❌ pip 未安装")
        return False


def check_git():
    """检查 Git 是否安装"""
    git_path = shutil.which("git")
    if git_path:
        result = subprocess.run(
            ["git", "--version"],
            capture_output=True,
            text=True,
        )
        print(f"✅ {result.stdout.strip()}")
        return True
    else:
        print("❌ Git 未安装")
        return False


def check_node():
    """检查 Node.js 是否安装（Claude Code 依赖）"""
    node_path = shutil.which("node")
    if node_path:
        result = subprocess.run(
            ["node", "--version"],
            capture_output=True,
            text=True,
        )
        print(f"✅ Node.js {result.stdout.strip()}")
        return True
    else:
        print("❌ Node.js 未安装（Claude Code 需要）")
        return False


def check_venv():
    """检查是否在虚拟环境中"""
    in_venv = (
        hasattr(sys, "real_prefix")
        or (hasattr(sys, "base_prefix") and sys.base_prefix != sys.prefix)
    )
    if in_venv:
        print(f"✅ 虚拟环境已激活: {sys.prefix}")
    else:
        print("⚠️  未在虚拟环境中（建议运行 python -m venv .venv）")
    return in_venv


def main():
    """运行所有检查"""
    print("=" * 50)
    print("🔧 Agent Factory 环境检查")
    print("=" * 50)

    checks = [
        ("Python", check_python),
        ("pip", check_pip),
        ("Git", check_git),
        ("Node.js", check_node),
        ("虚拟环境", check_venv),
    ]

    results = []
    for name, check_fn in checks:
        try:
            results.append(check_fn())
        except Exception as e:
            print(f"❌ {name} 检查失败: {e}")
            results.append(False)

    print("=" * 50)
    passed = sum(results)
    total = len(results)
    print(f"📊 检查结果: {passed}/{total} 通过")

    if passed == total:
        print("🎉 所有环境检查通过！准备开始学习！")
    elif passed >= 3:
        print("⚠️  部分工具缺失，但可以先开始，后续补齐。")
    else:
        print("❌ 多数工具未安装，请先完成环境搭建。")

    print("=" * 50)


if __name__ == "__main__":
    main()
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | `python` 命令找不到 | Windows: 检查是否勾选了 "Add Python to PATH"，或尝试 `py` 命令 |
| 2 | `pip` 命令找不到 | 运行 `python -m ensurepip --upgrade` |
| 3 | `git` 命令找不到 | 重启终端，或手动添加 Git 到 PATH |
| 4 | 虚拟环境激活失败 (Windows PowerShell) | 运行 `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| 5 | Claude Code 安装报错 | 确认 Node.js 已安装，尝试 `npm install -g @anthropic-ai/claude-code --force` |
| 6 | Python 版本太低 | 卸载旧版本，从 python.org 重新安装 3.12 |

## 📖 概念对照表

| 术语 | 一句话解释 | Obsidian 链接 |
|------|-----------|--------------|
| **虚拟环境 (venv)** | Python 的独立空间，每个项目有自己的包，互不干扰 | [[venv]] |
| **pip** | Python 的包管理器，类似手机的应用商店 | [[pip]] |
| **Git** | 代码版本控制工具，记录每次修改，可以回退 | [[git-basics]] |
| **Claude Code** | Anthropic 的 AI 编程助手，能在终端里帮你写代码 | [[claude-code]] |
| **PATH** | 操作系统查找程序的目录列表，命令能找到 = 在 PATH 里 | [[system-path]] |

## ✅ 验收清单

- [ ] `python --version` 输出 3.10+
- [ ] `pip --version` 能正常输出
- [ ] `git --version` 能正常输出
- [ ] 编辑器（VS Code / Cursor）已安装并能打开文件
- [ ] 虚拟环境创建成功（`python -m venv .venv`）
- [ ] 虚拟环境激活成功（终端前缀出现 `.venv`）
- [ ] Node.js 已安装（`node --version`）
- [ ] Claude Code 已安装（`claude --version`）
- [ ] 用 Claude Code 生成并运行了第一个 Python 脚本
- [ ] `check_env.py` 脚本运行通过（4/5 以上）

## 📝 复盘小纸条

- 今天最大的收获: _______________
- 还不太确定的: _______________
- 遇到的坑: _______________

## 📥 明日同步接口

- 今日完成度: {全部完成 / 部分完成 / 卡住了}
- 卡点描述: {具体问题}
- 代码是否能跑通: {是 / 否}
- 明天希望: {继续推进 / 复习巩固 / 加难挑战}

> **明天预告**: Day 2 将学习 Claude Code / Codex CLI 的进阶用法——学会用 AI 生成代码、调试代码、重构代码，真正实现 "用 Agent 的方式学 Agent"。
