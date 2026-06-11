# 📅 Day 1：学习路线总览 + 工具链搭建

## 🧭 今日方向
> 今天是 Phase 0 预备周的第一天，也是整个 20 周学习旅程的起点。目标有两个：**理解学习路线全貌** + **搭建好全部开发工具**。后续每天写代码、调 API、用 AI 辅助开发，都依赖今天搭好的环境。地基不稳，后面全白搭。

## 🎯 生活比喻
> 搭工具链就像**装修厨房前先通水通电**。你不会在没水没电的厨房里做饭。同理，没有 Python、Git、编辑器、AI 工具的环境，写 Agent 就像空手炒菜——工具到位了，后面才能专注于"做菜"本身。

## 📋 今日三件事（最多 3 件）
1. **安装并验证 Python 3.10+、Git、VS Code** — 验收标准: 三个命令各自输出版本号
2. **配置 Git 用户信息 + Python 虚拟环境** — 验收标准: `git config` 输出名字，终端前缀出现 `(venv)`
3. **运行环境检查脚本，所有项目 PASS** — 验收标准: `python check_env.py` 输出 4/4 PASS

## 🗺️ 手把手路线（预计 2-3 小时）

### Step 1: 理解 Agent Factory 学习路线（10 分钟）
- **做什么**: 浏览 Week 0-4 每周主题，建立整体认知
- **为什么**: 知道自己要去哪，才不会在中途迷路
- **成功标志**: 能用自己的话说出"这 20 周我要学什么"

**Week 0-4 速览：**

| 周次 | 主题 | 你会掌握的技能 |
|------|------|----------------|
| Week 0 | 基础准备 | Python 基础、开发工具、AI 编程助手 |
| Week 1 | Python + HTTP | 虚拟环境、包管理、HTTP 请求、调用 API |
| Week 2 | FastAPI Web 框架 | 构建 Web 服务、路由、请求处理 |
| Week 3 | LLM 基础 | 大模型原理、Prompt 工程、对话系统 |
| Week 4 | Agent 范式 | ReAct、工具调用、多步推理、完整 Agent |

**Week 0 路线图：**
```
Day 1 ── 学习路线总览 + 工具链搭建（今天）
Day 2 ── Claude Code / Codex CLI 上手
Day 3 ── 项目仓库初始化
Day 4 ── Obsidian 知识库搭建
Day 5 ── Python 速通（变量/函数/类/模块）
Day 6 ── Python 数据结构 + 类型提示
Day 7 ── 周复盘 + 环境检查
```

### 🙋 动动手

现在请你动手试试：

**练习 1**: 在纸上或备忘录里写下你对以下问题的回答：
- "Week 0 我要做什么？"
- "Week 4 结束后，我能做出什么东西？"

**练习 2**: 打开 VS Code，按 `Ctrl+Shift+P`，输入 "Git: Clone"，看看会出现什么界面（不需要真的 clone，只是熟悉一下）。

**练习 3**: 在终端输入以下命令，看看输出什么：
```bash
git --version
```

### 📝 小结

今天的学习路线涵盖 5 个阶段：基础准备 -> Python + HTTP -> FastAPI -> LLM -> Agent。Week 0 是打地基的阶段，今天先把工具装好，后面才能顺利推进。记住：**不要跳过 Week 0**，地基不稳后面全白搭。

---

### Step 2: 安装 Git（20 分钟）
- **做什么**: 安装版本控制工具 Git
- **为什么**: 后续所有代码管理、协作、CI/CD 都依赖 Git，就像游戏的存档系统
- **成功标志**: `git --version` 输出版本号

**Windows 安装：**

在终端输入以下命令：

```powershell
# 方式一：使用 winget（推荐）
winget install Git.Git
```

你应该看到安装进度条，等待完成即可。

如果 `winget` 不可用，可以手动下载：访问 https://git-scm.com/download/win ，下载安装包，一路 Next 即可。

**验证安装（关闭并重新打开 PowerShell 后执行）：**

在终端输入：

```powershell
git --version
```

你应该看到类似这样的输出：

```
git version 2.45.0
```

如果显示了版本号，说明安装成功 ✅

**配置用户信息：**

在终端依次输入以下命令（把"你的名字"和"你的邮箱"替换成你自己的）：

```powershell
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

验证配置是否生效：

```powershell
git config --global user.name
```

你应该看到你刚才设置的名字。

### 🙋 动动手

现在请你动手试试：

**练习 1**: 在终端输入以下命令，看看 Git 版本号：
```powershell
git --version
```

**练习 2**: 配置你的 Git 用户信息（替换成你自己的名字和邮箱）：
```powershell
git config --global user.name "张三"
git config --global user.email "zhangsan@example.com"
```

**练习 3**: 验证配置结果：
```powershell
git config --global user.name
git config --global user.email
```

### 📝 小结

Git 是代码的"存档系统"，安装后记得配置用户名和邮箱。这两个信息会出现在你每次提交代码的记录里，方便别人知道是谁做了修改。

---

### Step 3: 安装 VS Code（15 分钟）
- **做什么**: 安装代码编辑器
- **为什么**: 写代码、调试、装插件都靠它
- **成功标志**: `code --version` 输出版本号

**Windows 安装：**

在终端输入：

```powershell
winget install Microsoft.VisualStudioCode
```

**验证安装：**

安装完成后，在终端输入：

```powershell
code --version
```

你应该看到类似这样的输出：

```
1.90.0
b16654234183b414857eb365d73afbb147db5ab7
x64
```

如果显示了版本号，说明安装成功 ✅

**安装推荐插件：**

1. 打开 VS Code
2. 按 `Ctrl+Shift+X` 打开插件市场
3. 搜索并安装以下插件：
   - **Python**（微软出品）— 搜索 "Python"，安装第一个
   - **Pylance** — 搜索 "Pylance"，提供 Python 智能提示
   - **GitLens** — 搜索 "GitLens"，增强 Git 功能

**中文界面设置：**

按 `Ctrl+Shift+P`，输入 "Configure Display Language"，选择 `zh-cn`，重启 VS Code 即可。

### 🙋 动动手

现在请你动手试试：

**练习 1**: 在终端输入以下命令，看看能否启动 VS Code：
```powershell
code --version
```

**练习 2**: 打开 VS Code，按 `Ctrl+Shift+X`，搜索 "Python"，安装微软官方的 Python 插件。

**练习 3**: 在 VS Code 中按 `Ctrl+Shift+P`，输入 "Preferences: Open Settings (JSON)"，看看 settings.json 文件的内容（不需要修改，只是看看）。

### 📝 小结

VS Code 是我们写代码的主战场。安装好后记得装 Python 插件，它会提供语法高亮、自动补全、错误提示等功能，让你写代码更高效。

---

### Step 4: 安装 Python 3.12（20 分钟）
- **做什么**: 安装 Python 编程语言
- **为什么**: Agent 开发主要用 Python，生态最丰富（FastAPI、LangChain、OpenAI SDK 等）
- **成功标志**: `python --version` 输出 3.10+

**Windows 安装：**

在终端输入：

```powershell
winget install Python.Python.3.12
```

> ⚠️ **最重要的一步：** 如果手动安装，在安装界面底部**务必勾选** "Add python.exe to PATH"，否则后面很多命令都会报错。这一步非常关键，请务必确认！

**验证安装（关闭并重新打开 PowerShell）：**

在终端输入：

```powershell
python --version
```

你应该看到类似这样的输出：

```
Python 3.12.4
```

如果显示 Python 3.10 或更高版本，说明安装成功 ✅

再验证 pip（Python 的包管理器）：

```powershell
pip --version
```

你应该看到类似这样的输出：

```
pip 24.0 from C:\Python312\Lib\site-packages\pip (python 3.12)
```

### 🙋 动动手

现在请你动手试试：

**练习 1**: 在终端输入以下命令，确认 Python 已安装：
```powershell
python --version
```

**练习 2**: 在终端输入以下命令，确认 pip 已安装：
```powershell
pip --version
```

**练习 3**: 在终端输入以下命令，启动 Python 交互模式（输入 `exit()` 退出）：
```powershell
python
```

进入交互模式后，输入以下内容并按回车：
```python
>>> print("Hello, Agent Factory!")
```

你应该看到输出：
```
Hello, Agent Factory!
```

输入 `exit()` 退出交互模式。

### 📝 小结

Python 是本课程的核心语言。安装后有两个关键验证：`python --version` 确认 Python 可用，`pip --version` 确认包管理器可用。如果 Python 命令找不到，99% 是因为安装时没有勾选"Add to PATH"。

---

### Step 5: 创建 Python 虚拟环境（10 分钟）
- **做什么**: 在项目目录下创建隔离的 Python 环境
- **为什么**: 不同项目依赖不同版本的包，虚拟环境避免冲突——就像每个厨房有自己的调料架
- **成功标志**: 终端前缀出现 `(venv)`

**进入项目目录：**

```powershell
cd E:\Agent Study\agent-factory
```

**创建虚拟环境：**

在终端输入：

```powershell
python -m venv venv
```

这条命令做了什么？
```
python       <-- 调用 Python 解释器
-m venv      <-- 使用内置的 venv 模块（venv = virtual environment 的缩写）
venv         <-- 虚拟环境文件夹的名称（第二个 venv）
```

执行完毕后，项目目录下会多出一个 `venv` 文件夹。

**激活虚拟环境：**

在终端输入：

```powershell
venv\Scripts\activate
```

你应该看到终端提示符前面多了 `(venv)` 前缀：

```
# 激活前：
PS E:\Agent Study\agent-factory>

# 激活后：
(venv) PS E:\Agent Study\agent-factory>
```

如果看到了 `(venv)` 前缀，说明激活成功 ✅

> ⚠️ 每次打开新的 PowerShell 窗口，都需要重新激活虚拟环境。

### 🙋 动动手

现在请你动手试试：

**练习 1**: 进入项目目录并创建虚拟环境：
```powershell
cd E:\Agent Study\agent-factory
python -m venv venv
```

**练习 2**: 激活虚拟环境，观察终端提示符的变化：
```powershell
venv\Scripts\activate
```

**练习 3**: 确认你在虚拟环境中（Python 路径应该指向 venv 目录）：
```powershell
where python
```

你应该看到类似这样的输出（路径中包含 `venv`）：
```
E:\Agent Study\agent-factory\venv\Scripts\python.exe
C:\Python312\python.exe
```

**练习 4**: 退出虚拟环境：
```powershell
deactivate
```

### 📝 小结

虚拟环境是 Python 项目的"隔离房间"，每个项目有自己的包版本，互不干扰。关键步骤：创建 -> 激活 -> 使用 -> 退出。养成习惯：每次打开终端先激活虚拟环境。

---

### Step 6: 运行环境检查脚本（5 分钟）
- **做什么**: 用 Python 脚本一键验证所有工具是否安装正确
- **为什么**: 手动逐个检查容易遗漏，脚本自动检查更可靠
- **成功标志**: 所有检查项显示 `[OK]`，汇总显示 `All passed!`

把以下代码保存为 `check_env.py` 并运行：

```python
"""
Agent Factory 环境检查脚本
用法: python check_env.py
"""
import subprocess
import sys


def check(name: str, command: list[str]) -> bool:
    """检查一个工具是否安装成功"""
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode == 0:
            version_str = result.stdout.strip().split("\n")[0]
            print(f"  [OK] {name}: {version_str}")
            return True
        else:
            print(f"  [FAIL] {name}: 命令执行失败")
            return False
    except FileNotFoundError:
        print(f"  [FAIL] {name}: 未找到，请先安装")
        return False
    except subprocess.TimeoutExpired:
        print(f"  [FAIL] {name}: 命令超时")
        return False
    except Exception as e:
        print(f"  [FAIL] {name}: {e}")
        return False


def main():
    print("=" * 50)
    print("  Agent Factory 环境检查")
    print("=" * 50)
    print()

    results = []

    print("[1] 检查 Python")
    results.append(("Python", check("Python", ["python", "--version"])))

    print("[2] 检查 pip")
    results.append(("pip", check("pip", [sys.executable, "-m", "pip", "--version"])))

    print("[3] 检查 Git")
    results.append(("Git", check("Git", ["git", "--version"])))

    print("[4] 检查 VS Code")
    results.append(("VS Code", check("VS Code", ["code", "--version"])))

    print()
    print("=" * 50)
    print("  检查结果汇总")
    print("=" * 50)
    all_ok = True
    for name, ok in results:
        status = "PASS" if ok else "FAIL"
        print(f"  {name}: {status}")
        if not ok:
            all_ok = False

    print()
    if all_ok:
        print("  All passed! 所有工具安装成功！")
        print("  你可以开始 Agent Factory 的学习之旅了。")
    else:
        print("  Some checks failed. 部分工具未安装，请参考上方教程完成安装。")
    print()


if __name__ == "__main__":
    main()
```

**运行：**

在终端输入：

```powershell
python check_env.py
```

你应该看到类似这样的输出：

```
==================================================
  Agent Factory 环境检查
==================================================

[1] 检查 Python
  [OK] Python: Python 3.12.4
[2] 检查 pip
  [OK] pip: pip 24.0 from C:\Python312\Lib\site-packages\pip (python 3.12)
[3] 检查 Git
  [OK] Git: git version 2.45.0
[4] 检查 VS Code
  [OK] VS Code: 1.90.0

==================================================
  检查结果汇总
==================================================
  Python: PASS
  pip: PASS
  Git: PASS
  VS Code: PASS

  All passed! 所有工具安装成功！
  你可以开始 Agent Factory 的学习之旅了。
```

如果所有检查项都显示 `[OK]`，说明环境搭建完成 ✅

### 🙋 动动手

现在请你动手试试：

**练习 1**: 把上面的 `check_env.py` 代码复制到 VS Code 中，保存为 `check_env.py` 文件。

**练习 2**: 在终端运行环境检查脚本：
```powershell
python check_env.py
```

**练习 3**: 如果有检查项显示 `[FAIL]`，根据上方的急救包找到解决方法，修复后再次运行脚本，直到全部 PASS。

### 📝 小结

环境检查脚本可以一键验证所有工具是否安装正确。如果全部 PASS，恭喜你完成了 Day 1 的所有任务！今天的地基打好了，明天我们将安装 AI 编程助手。

## 💻 代码区

> 今天的代码就是上面的 `check_env.py` 环境检查脚本。把它保存到项目目录下运行即可。

## 🆘 急救包

遇到问题别慌，以下是最常见的问题和解决方法：

**Q: python 命令找不到怎么办？**

A: 这通常是因为 Python 没有添加到 PATH 环境变量。解决方法：
1. 重新运行 Python 安装程序
2. 勾选 "Add Python to PATH"（在安装界面底部）
3. 关闭并重新打开终端
4. 再次输入 `python --version` 验证

**Q: pip 命令找不到怎么办？**

A: 在终端输入以下命令，手动启用 pip：
```powershell
python -m ensurepip --upgrade
```
然后再试 `pip --version`。

**Q: git 命令找不到怎么办？**

A: 先关闭并重新打开 PowerShell，再试一次。如果仍然报错，可能是 Git 没有添加到 PATH，重新安装 Git 并确保勾选"Add to PATH"。

**Q: winget 命令不可用怎么办？**

A: winget 需要 Windows 10 1709 或更高版本。如果版本不够，请手动从 https://git-scm.com/download/win 下载安装包。

**Q: 虚拟环境激活时报错"禁止运行脚本"怎么办？**

A: 这是 Windows 的执行策略限制。在终端输入以下命令（只需执行一次）：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
然后重新激活虚拟环境。

**Q: VS Code 的 code 命令找不到怎么办？**

A: 重新安装 VS Code，在安装时勾选"添加到 PATH"选项。或者在 VS Code 中按 `Ctrl+Shift+P`，输入 "Shell Command: Install 'code' command in PATH"。

**Q: Python 版本显示 3.9 或更低怎么办？**

A: 旧版本可能与新项目不兼容。请卸载旧版本，重新安装 Python 3.12。

## 📖 概念对照表

| 术语 | 一句话解释 | Obsidian 链接 |
|------|-----------|--------------|
| **Git** | 代码版本控制工具，记录每次修改，可以像游戏存档一样回退 | [[git-basics]] |
| **VS Code** | 微软出品的免费代码编辑器，支持海量插件 | [[vscode-setup]] |
| **Python** | 本课程使用的编程语言，Agent 开发生态最丰富 | [[python-basics]] |
| **pip** | Python 的包管理器，类似手机的应用商店，用来安装第三方库 | [[pip]] |
| **虚拟环境 (venv)** | Python 项目的隔离空间，每个项目有自己的包版本，互不干扰 | [[venv]] |
| **PATH** | 操作系统查找程序的目录列表，命令能找到 = 在 PATH 里 | [[system-path]] |
| **winget** | Windows 自带的包管理器，一行命令安装软件 | [[winget]] |

## ✅ 验收清单

- [ ] 能用自己的话解释什么是 Agent Factory 以及 Week 0-4 每周学什么
- [ ] Git 安装成功：`git --version` 输出版本号
- [ ] Git 用户信息已配置：`git config --global user.name` 输出名字
- [ ] VS Code 安装成功：`code --version` 输出版本号
- [ ] VS Code 插件已安装：Python、Pylance、GitLens
- [ ] Python 3.10+ 安装成功：`python --version` 输出版本号
- [ ] pip 可用：`pip --version` 输出版本号
- [ ] 虚拟环境创建成功：`python -m venv venv` 无报错
- [ ] 虚拟环境激活成功：终端前缀出现 `(venv)`
- [ ] 环境检查脚本全部 PASS：`python check_env.py` 输出 4/4 OK

## 📝 复盘小纸条

- 今天最大的收获: _______________
- 安装过程中遇到的问题: _______________
- 还不太确定的: _______________

## 📥 明日同步接口

- 今日完成度: {全部完成 / 部分完成 / 卡住了}
- 卡点描述: {具体问题}
- 代码是否能跑通: {是 / 否}
- 明天希望: {继续推进 / 复习巩固 / 加难挑战}

> **明天预告（Day 2）**: 安装 Claude Code / Codex CLI —— 两个 AI 编程助手。它们可以在你写代码时提供实时帮助，大幅提高开发效率。提前准备：确保今天所有工具安装完成并验证通过。
