# 📅 Week 0 Day 1：学习路线总览 + 工具链搭建

## 🧭 今日方向
> 今天是 Agent Factory 学习旅程的第一步。我们将搭建基础开发环境，安装必要的工具，并理解整个学习路线的全貌。

## 🎯 生活比喻
> 学习 Agent 开发就像组装一台精密的机器人。今天我们要准备工具箱（安装软件）、画出设计图纸（理解路线图），并确保所有基础零件都已到位。

## 📋 今日三件事
1. 理解 Agent Factory 的学习路线和目标
2. 安装 Git、VS Code、Python 等基础工具
3. 验证所有工具安装成功并能正常工作

## 🗺️ 手把手路线

### Step 1: 理解学习路线
- **做什么**: 阅读项目 README，了解 Week 0-4 的学习计划
- **为什么**: 知道自己要去哪里，才能更好地规划路径
- **成功标志**: 能用自己的话解释每周的学习重点

### Step 2: 安装 Git
- **做什么**: 从 git-scm.com 下载并安装 Git
- **为什么**: 版本控制是协作开发的基础，也是记录学习进度的好工具
- **成功标志**: 终端输入 `git --version` 显示版本号

### Step 3: 安装 VS Code
- **做什么**: 从 code.visualstudio.com 下载并安装 VS Code
- **为什么**: 现代化的代码编辑器，支持 Python、Git 等丰富插件
- **成功标志**: 能打开 VS Code 并创建新文件

### Step 4: 安装 Python
- **做什么**: 从 python.org 下载 Python 3.10+ 版本
- **为什么**: Python 是 Agent 开发的主要语言，生态丰富
- **成功标志**: 终端输入 `python --version` 显示 Python 3.10+

## 💻 代码区

```python
# 工具安装验证脚本
import subprocess
import sys

def check_git():
    """检查 Git 是否安装"""
    try:
        result = subprocess.run(['git', '--version'], capture_output=True, text=True)
        print(f"✅ Git 已安装: {result.stdout.strip()}")
        return True
    except FileNotFoundError:
        print("❌ Git 未安装")
        return False

def check_python():
    """检查 Python 版本"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 10:
        print(f"✅ Python 版本: {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"❌ Python 版本过低: {version.major}.{version.minor}.{version.micro}")
        return False

def check_vscode():
    """检查 VS Code 是否在 PATH 中"""
    try:
        result = subprocess.run(['code', '--version'], capture_output=True, text=True)
        version = result.stdout.split('\n')[0] if result.stdout else "未知"
        print(f"✅ VS Code 已安装: {version}")
        return True
    except FileNotFoundError:
        print("⚠️ VS Code 未在 PATH 中（可能已安装但未添加到环境变量）")
        return False

if __name__ == "__main__":
    print("🔍 检查开发环境...\n")
    results = [check_git(), check_python(), check_vscode()]
    
    if all(results):
        print("\n🎉 所有基础工具安装成功！")
    else:
        print("\n⚠️ 部分工具未安装，请按照上述提示进行安装")
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | Git 安装后无法识别命令 | 重启终端，或检查环境变量 PATH 是否包含 Git |
| 2 | Python 版本不对 | 卸载旧版本，重新安装 Python 3.10+ |
| 3 | VS Code 打不开 | 检查是否以管理员权限运行，或重新安装 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Git | 分布式版本控制系统，用于跟踪代码变更 |
| VS Code | 微软开发的免费代码编辑器，支持多种语言 |
| Python | 高级编程语言，Agent 开发的主流选择 |
| 终端 | 命令行界面，用于执行系统命令 |

## ✅ 验收清单
- [ ] 能解释 Agent Factory 学习路线
- [ ] Git 安装成功并能执行基本命令
- [ ] VS Code 安装成功并能打开项目
- [ ] Python 3.10+ 安装成功并能运行脚本

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 🪟 Windows 用户注意

如果你使用的是 Windows 系统，以下几点需要特别注意：

### PowerShell vs cmd vs WSL 的区别

| 终端 | 特点 | 推荐度 |
|------|------|--------|
| **PowerShell** | Windows 默认终端，功能强大，支持现代命令 | ⭐⭐⭐⭐⭐ |
| **cmd** | 老式命令提示符，功能有限，部分命令不兼容 | ⭐⭐ |
| **WSL** | Windows 子系统 for Linux，可运行完整 Linux 环境 | ⭐⭐⭐⭐ |

**建议**: 日常开发推荐使用 **PowerShell** 或 **WSL**。如果你主要跟随本教程学习，PowerShell 即可满足需求。如果你需要与 Linux 环境保持一致（如后续部署），可以考虑安装 WSL。

### 虚拟环境激活方式不同

在 Windows 上，激活 Python 虚拟环境的命令与 macOS/Linux 不同：

```bash
# macOS / Linux 的激活方式
source venv/bin/activate

# Windows PowerShell 的激活方式
venv\Scripts\activate

# Windows cmd 的激活方式
venv\Scripts\activate.bat
```

**常见问题**: 如果在 PowerShell 中遇到执行策略错误，可以先运行以下命令：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Docker Desktop 在 Windows 上的注意事项

- 下载并安装 **Docker Desktop for Windows**（不是 Linux 版本）
- 安装前需要开启 **WSL 2** 或 **Hyper-V** 虚拟化功能
- Docker Desktop 安装包较大（约 500MB），请确保网络通畅
- 首次启动较慢，需要等待 Docker 引擎初始化完成
- 如果使用 WSL 2 后端，建议分配至少 **4GB 内存**给 Docker

### 路径分隔符差异

Windows 使用反斜杠 `\` 作为路径分隔符，而 macOS/Linux 使用正斜杠 `/`：

```python
# Windows 路径
path = "C:\\Users\\username\\project\\data\\file.txt"

# macOS / Linux 路径
path = "/home/username/project/data/file.txt"

# Python 推荐写法（跨平台兼容）
from pathlib import Path
path = Path("project") / "data" / "file.txt"
```

**建议**: 在 Python 代码中尽量使用 `pathlib.Path`，它会自动处理不同操作系统的路径分隔符，避免跨平台兼容问题。

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
