# Week 0 Day 1: 学习路线总览 + 工具链搭建

> 今天是 Agent Factory 学习旅程的第一天。我们将完成两件大事：理解整个学习路线的全貌，以及搭建好开发所需的全部工具。请跟着教程一步步操作，每一步都会给出具体的命令和预期输出。

---

## 一、Agent Factory 是什么？

Agent Factory 是一个**从零开始学习 AI Agent 开发**的实战课程。

**什么是 AI Agent？** 简单来说，Agent 是一个能**自主思考、规划、行动**的 AI 程序。比如：
- 你告诉它"帮我查一下明天北京的天气"，它会自己调用天气 API、解析结果、回复你
- 你告诉它"帮我写一篇关于 AI 的文章"，它会先想提纲、再逐段撰写、最后润色

**本课程你会学到什么？**

| 周次 | 主题 | 你会掌握的技能 |
|------|------|----------------|
| Week 0 | 基础准备 | Python 基础、开发工具、AI 编程助手 |
| Week 1 | Python + HTTP | 虚拟环境、包管理、HTTP 请求、调用 API |
| Week 2 | FastAPI Web 框架 | 构建 Web 服务、路由、请求处理 |
| Week 3 | LLM 基础 | 大模型原理、Prompt 工程、对话系统 |
| Week 4 | Agent 范式 | ReAct、工具调用、多步推理、完整 Agent |

**适合谁学？** 有基本编程概念（知道什么是变量、函数），但不一定熟悉 Python 的开发者。零基础也能跟着走，只是可能需要多花些时间。

---

## 二、Week 0 学习路线图

```
Week 0: 基础准备（7 天）
========================

Day 1 ── 学习路线总览 + 工具链搭建（今天）
  │     安装 Git、VS Code、Python
  │     验证所有工具正常工作
  │
Day 2 ── Claude Code / Codex CLI 上手
  │     安装 AI 编程助手
  │     体验 AI 辅助写代码
  │
Day 3 ── 项目仓库初始化
  │     创建项目结构
  │     配置 CLAUDE.md
  │
Day 4 ── Obsidian 知识库搭建
  │     安装 Obsidian
  │     建立笔记体系
  │
Day 5 ── Python 速通
  │     变量、函数、类、模块
  │     每个概念都有可运行的代码
  │
Day 6 ── Python 数据结构 + 类型提示
  │     列表、字典、元组、集合
  │     类型提示、Pydantic
  │
Day 7 ── 周复盘 + 环境检查
        总结本周学习
        检查所有工具是否就绪
```

---

## 三、工具安装：Git

Git 是**版本控制工具**，用来记录代码的每一次修改。就像游戏的存档系统，随时可以回到之前的状态。

### 3.1 安装 Git

**Windows 用户（推荐方式）：**

打开 PowerShell（按 `Win + X`，选择"Windows PowerShell"或"终端"），输入：

```powershell
# 使用 winget 安装 Git（Windows 10/11 自带的包管理器）
winget install Git.Git
```

安装过程中可能弹出安装向导界面，一路点"Next"即可，保持默认选项。

**或者手动下载：**
1. 打开浏览器，访问 https://git-scm.com/download/win
2. 点击"Download for Windows"
3. 运行下载的安装程序
4. 安装过程中所有选项保持默认，一路点"Next"

### 3.2 验证安装

安装完成后，**关闭并重新打开** PowerShell（重要！），然后输入：

```powershell
git --version
```

**预期输出：**
```
git version 2.45.0
```
（版本号可能不同，只要显示了版本号就说明安装成功）

### 3.3 配置用户信息

Git 需要知道你是谁，这样每次提交代码时才会记录是谁做的修改。在 PowerShell 中输入：

```powershell
# 把"你的名字"替换成你的名字，比如 "Zhang San"
git config --global user.name "你的名字"

# 把"你的邮箱"替换成你的邮箱，比如 "zhangsan@example.com"
git config --global user.email "你的邮箱"
```

**验证配置是否生效：**

```powershell
git config --global user.name
# 预期输出: 你的名字

git config --global user.email
# 预期输出: 你的邮箱
```

### 3.4 常见错误

**错误 1：`git` 不是内部或外部命令**
```
git : 无法将"git"项识别为 cmdlet、函数、脚本文件或可运行程序的名称。
```
**解决方法：** 关闭并重新打开 PowerShell。如果还不行，说明安装时没有勾选"Add to PATH"，需要重新安装 Git。

**错误 2：`winget` 命令不可用**
```
winget : 无法将"winget"项识别为 cmdlet、函数...
```
**解决方法：** `winget` 是 Windows 10 1709 以后版本自带的。如果不可用，请使用上面的"手动下载"方式安装。

---

## 四、工具安装：VS Code

VS Code 是微软开发的**免费代码编辑器**，是目前最受欢迎的编程工具之一。

### 4.1 安装 VS Code

**Windows 用户：**

```powershell
# 使用 winget 安装
winget install Microsoft.VisualStudioCode
```

**或者手动下载：**
1. 打开浏览器，访问 https://code.visualstudio.com/
2. 点击蓝色的"Download for Windows"按钮
3. 运行下载的安装程序
4. 安装时**务必勾选以下选项**（在"选择附加任务"页面）：
   - [x] 将"通过 Code 打开"操作添加到文件上下文菜单
   - [x] 将"通过 Code 打开"操作添加到目录上下文菜单
   - [x] 将 Code 注册为受支持的文件类型的编辑器
   - [x] 添加到 PATH（从命令行启动时使用）
5. 点击"安装"

### 4.2 验证安装

```powershell
code --version
```

**预期输出：**
```
1.90.0
some-commit-id
```

### 4.3 安装推荐插件

打开 VS Code 后，按 `Ctrl+Shift+X` 打开插件市场，搜索并安装：

1. **Python**（微软出品）- 搜索 "Python"，安装第一个
2. **Pylance** - 搜索 "Pylance"，安装第一个
3. **GitLens** - 搜索 "GitLens"，增强 Git 功能

安装完成后，VS Code 左下角会显示 Python 版本号（如果已安装 Python）。

---

## 五、工具安装：Python

Python 是本课程使用的**编程语言**。Agent 开发主要用 Python，因为它的生态最丰富。

### 5.1 安装 Python

**Windows 用户：**

```powershell
# 使用 winget 安装 Python 3.12
winget install Python.Python.3.12
```

**或者手动下载：**
1. 打开浏览器，访问 https://www.python.org/downloads/
2. 点击黄色的"Download Python 3.12.x"按钮（最新版本）
3. 运行下载的安装程序
4. **最重要的一步：** 在安装界面底部，**务必勾选** "Add python.exe to PATH"
5. 然后点击"Install Now"

> **警告：** 如果忘记勾选"Add to PATH"，后面很多命令都会报错。如果已经安装了但没勾选，需要卸载重新安装。

### 5.2 验证安装

**关闭并重新打开** PowerShell，然后输入：

```powershell
python --version
```

**预期输出：**
```
Python 3.12.4
```

### 5.3 验证 pip

pip 是 Python 的**包管理工具**，用来安装第三方库。Python 3.12 通常自带 pip。

```powershell
pip --version
```

**预期输出：**
```
pip 24.0 from C:\Python312\Lib\site-packages\pip (python 3.12)
```

如果提示 pip 未安装，手动安装：

```powershell
python -m ensurepip --upgrade
```

### 5.4 创建虚拟环境

虚拟环境是 Python 项目的"隔离空间"，不同项目可以使用不同版本的库，互不干扰。

```powershell
# 先创建一个项目目录（如果还没有的话）
mkdir D:\claude-workspace\agent-factory
cd D:\claude-workspace\agent-factory

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境（Windows PowerShell）
venv\Scripts\activate
```

激活成功后，命令行前面会出现 `(venv)` 标记：

```
(venv) PS D:\claude-workspace\agent-factory>
```

**注意：** 每次打开新的 PowerShell 窗口，都需要重新激活虚拟环境。

### 5.5 常见错误

**错误 1：`python` 不是内部或外部命令**
```
python : 无法将"python"项识别为 cmdlet、函数...
```
**解决方法：** 重新安装 Python，务必勾选 "Add python.exe to PATH"。或者手动将 Python 安装目录添加到 PATH 环境变量。

**错误 2：Windows 上激活虚拟环境报错**
```
无法加载文件 D:\...\venv\Scripts\Activate.ps1，因为在此系统上禁止运行脚本。
```
**解决方法：** 在 PowerShell 中运行以下命令（只需运行一次）：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**错误 3：Python 版本过低**
如果 `python --version` 显示 3.9 或更低，建议卸载旧版本后重新安装 3.12。

---

## 六、环境验证脚本

下面这个 Python 脚本会自动检查所有工具是否安装成功。把以下代码保存为 `check_env.py` 文件并运行。

```python
"""
Agent Factory 环境检查脚本
用法: python check_env.py
"""
import subprocess
import sys
import shutil


def check(name: str, command: list[str], min_version: tuple[int, ...] | None = None) -> bool:
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

    # 检查 Python
    print("[1] 检查 Python")
    py_ok = check("Python", ["python", "--version"])
    results.append(("Python", py_ok))

    # 检查 pip
    print("[2] 检查 pip")
    pip_ok = check("pip", [sys.executable, "-m", "pip", "--version"])
    results.append(("pip", pip_ok))

    # 检查 Git
    print("[3] 检查 Git")
    git_ok = check("Git", ["git", "--version"])
    results.append(("Git", git_ok))

    # 检查 VS Code
    print("[4] 检查 VS Code")
    vscode_ok = check("VS Code", ["code", "--version"])
    results.append(("VS Code", vscode_ok))

    # 汇总
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
        print("  Some checks failed. 部分工具未安装，请参考教程完成安装。")
    print()


if __name__ == "__main__":
    main()
```

**运行方法：**

```powershell
python check_env.py
```

**预期输出（如果全部安装成功）：**
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

---

## 七、Windows 用户注意事项

### 7.1 PowerShell vs cmd vs WSL

| 终端 | 特点 | 推荐度 |
|------|------|--------|
| **PowerShell** | Windows 默认终端，功能强大，支持现代命令 | 推荐 |
| **cmd** | 老式命令提示符，功能有限，部分命令不兼容 | 不推荐 |
| **WSL** | Windows 子系统 for Linux，可运行完整 Linux 环境 | 进阶用 |

**建议：** 本教程使用 PowerShell 即可满足所有需求。

### 7.2 路径分隔符

Windows 使用反斜杠 `\`，而 Mac/Linux 使用正斜杠 `/`：

```python
# Windows 路径
path = "C:\\Users\\username\\project\\file.txt"

# Mac/Linux 路径
path = "/home/username/project/file.txt"

# Python 推荐写法（跨平台兼容）
from pathlib import Path
path = Path("project") / "file.txt"
```

**建议：** 在 Python 代码中始终使用 `pathlib.Path`，它会自动处理不同系统的路径差异。

### 7.3 三种打开 PowerShell 的方式

1. **方式一（推荐）：** 按 `Win + X`，选择"终端"或"Windows PowerShell"
2. **方式二：** 按 `Win + R`，输入 `powershell`，回车
3. **方式三：** 在文件资源管理器的地址栏输入 `powershell`，回车（会在当前目录打开）

---

## 八、今日验收清单

完成今天的学习后，请逐项检查：

- [ ] 能用自己的话解释什么是 Agent Factory
- [ ] 能说出 Week 0-4 每周学什么
- [ ] Git 安装成功，`git --version` 能输出版本号
- [ ] Git 用户信息已配置，`git config --global user.name` 能输出名字
- [ ] VS Code 安装成功，`code --version` 能输出版本号
- [ ] Python 3.10+ 安装成功，`python --version` 能输出版本号
- [ ] pip 安装成功，`pip --version` 能输出版本号
- [ ] 虚拟环境能正常创建和激活
- [ ] 环境检查脚本所有项目 PASS

---

## 九、常见问题 FAQ

**Q: 安装软件时需要管理员权限吗？**
A: 通常不需要。如果遇到权限问题，可以右键安装程序，选择"以管理员身份运行"。

**Q: 可以同时安装多个 Python 版本吗？**
A: 可以，但不建议初学者这样做。建议只保留一个 Python 3.12 版本。

**Q: VS Code 打开后是英文界面，怎么改成中文？**
A: 按 `Ctrl+Shift+P`，输入 "Configure Display Language"，选择 "zh-cn"，重启即可。

**Q: 这些工具需要联网才能使用吗？**
A: 安装过程需要联网下载。安装完成后，Git、VS Code、Python 都可以离线使用。

---

## 十、今日复盘

请在 Obsidian 或笔记本中记录：

- 今天最大的收获是什么？
- 安装过程中遇到了什么问题？怎么解决的？
- 还有什么不确定的地方？

---

## 十一、明日预告

明天我们将安装 **Claude Code** 和 **Codex CLI** —— 两个 AI 编程助手。它们可以在你写代码时提供实时帮助，大幅提高开发效率。

> 提前准备：确保今天所有工具安装完成并验证通过。
