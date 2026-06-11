# Week 0 Day 7: 周复盘 + 环境检查清单

> 今天是 Week 0 的最后一天。我们将做三件事：回顾本周学到的所有内容、运行完整的环境检查脚本确认一切就绪、制定 Week 1 的学习计划。

---

## 一、本周学了什么

### 1.1 每日内容回顾

```
Day 1: 工具链搭建
  - 安装 Git、VS Code、Python
  - 配置 Git 用户信息
  - 创建虚拟环境
  - 运行环境检查脚本

Day 2: AI 编程助手
  - 安装 Claude Code / Codex CLI
  - 体验 AI 辅助写代码
  - 学会向 AI 描述需求

Day 3: 项目仓库初始化
  - 创建项目目录结构
  - 初始化 Git 仓库
  - 编写 .gitignore、README.md、CLAUDE.md
  - 完成第一次 Git 提交

Day 4: Obsidian 知识库
  - 安装 Obsidian 并创建 Vault
  - 搭建笔记目录结构
  - 创建每日笔记模板
  - 学会使用双向链接

Day 5: Python 速通
  - 变量和数据类型（int, float, str, bool, None）
  - 数据结构（list, dict, tuple, set）
  - 函数（参数、返回值、默认值、可变参数、lambda）
  - 类和继承
  - 模块导入

Day 6: 数据结构 + 类型提示
  - 列表推导式和字典推导式
  - 集合操作
  - f-string 高级用法
  - 类型提示（基本、复杂、函数类型）
  - @dataclass 和 Pydantic

Day 7: 周复盘（今天）
  - 回顾总结
  - 环境检查
  - 制定下周计划
```

### 1.2 关键概念清单

| 概念 | 一句话解释 | 你在本课程中的用途 |
|------|-----------|-------------------|
| Git | 版本控制工具 | 记录代码修改，随时回退 |
| VS Code | 代码编辑器 | 编写和调试代码 |
| Python | 编程语言 | 开发 Agent 的主要语言 |
| 虚拟环境 | 项目隔离空间 | 避免不同项目的依赖冲突 |
| Claude Code | AI 编程助手 | 辅助写代码、调试、学习 |
| Obsidian | 知识管理工具 | 整理学习笔记和知识体系 |
| CLAUDE.md | AI 工具配置文件 | 让 AI 了解你的项目 |
| 类型提示 | 给变量加类型标签 | 让代码更清晰，IDE 支持更好 |
| 推导式 | 一行代码创建新列表/字典 | 写出更 Pythonic 的代码 |
| dataclass | 自动生成样板代码的类 | 简化数据类的定义 |

---

## 二、完整环境检查脚本

把以下代码保存为 `week0_check.py` 并运行。它会检查 Week 0 涉及的所有工具和配置。

```python
"""
Week 0 完整环境检查脚本
用法: python week0_check.py
"""
import subprocess
import sys
import os
from pathlib import Path


def run_command(command: list[str], timeout: int = 10) -> tuple[bool, str]:
    """运行命令并返回结果"""
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        if result.returncode == 0:
            output = result.stdout.strip().split("\n")[0] if result.stdout else "OK"
            return True, output
        else:
            error = result.stderr.strip().split("\n")[0] if result.stderr else "Unknown error"
            return False, error
    except FileNotFoundError:
        return False, "Command not found"
    except subprocess.TimeoutExpired:
        return False, "Command timed out"
    except Exception as e:
        return False, str(e)


def check_python() -> bool:
    """检查 Python 环境"""
    print("\n[Python 环境]")
    print("-" * 40)

    # Python 版本
    ok, output = run_command([sys.executable, "--version"])
    if ok:
        print(f"  [OK] Python: {output}")
    else:
        print(f"  [FAIL] Python: {output}")
        return False

    # pip
    ok, output = run_command([sys.executable, "-m", "pip", "--version"])
    if ok:
        print(f"  [OK] pip: {output[:50]}...")
    else:
        print(f"  [FAIL] pip: {output}")
        return False

    # 虚拟环境
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print(f"  [OK] 虚拟环境: 已激活 ({sys.prefix})")
    else:
        print(f"  [WARN] 虚拟环境: 未激活（建议在虚拟环境中运行）")

    return True


def check_git() -> bool:
    """检查 Git"""
    print("\n[Git]")
    print("-" * 40)

    # Git 版本
    ok, output = run_command(["git", "--version"])
    if ok:
        print(f"  [OK] Git: {output}")
    else:
        print(f"  [FAIL] Git: {output}")
        return False

    # Git 用户名
    ok, output = run_command(["git", "config", "global", "user.name"])
    if ok and output:
        print(f"  [OK] 用户名: {output}")
    else:
        print(f"  [WARN] 用户名: 未配置")

    # Git 邮箱
    ok, output = run_command(["git", "config", "global", "user.email"])
    if ok and output:
        print(f"  [OK] 邮箱: {output}")
    else:
        print(f"  [WARN] 邮箱: 未配置")

    return True


def check_vscode() -> bool:
    """检查 VS Code"""
    print("\n[VS Code]")
    print("-" * 40)

    ok, output = run_command(["code", "--version"])
    if ok:
        version = output.split("\n")[0] if output else "unknown"
        print(f"  [OK] VS Code: {version}")
        return True
    else:
        print(f"  [WARN] VS Code: 未安装或不在 PATH 中")
        return False  # 非必须


def check_nodejs() -> bool:
    """检查 Node.js（Claude Code 依赖）"""
    print("\n[Node.js]")
    print("-" * 40)

    ok, output = run_command(["node", "--version"])
    if ok:
        print(f"  [OK] Node.js: {output}")
    else:
        print(f"  [WARN] Node.js: 未安装（Claude Code 需要）")
        return False

    ok, output = run_command(["npm", "--version"])
    if ok:
        print(f"  [OK] npm: {output}")
    else:
        print(f"  [WARN] npm: 未安装")

    return True


def check_claude_code() -> bool:
    """检查 Claude Code"""
    print("\n[Claude Code]")
    print("-" * 40)

    ok, output = run_command(["claude", "--version"])
    if ok:
        print(f"  [OK] Claude Code: {output}")
        return True
    else:
        print(f"  [WARN] Claude Code: 未安装（可选）")
        return False


def check_project_structure() -> bool:
    """检查项目结构"""
    print("\n[项目结构]")
    print("-" * 40)

    required_items = [
        ("src/agent_factory/__init__.py", "Python 包"),
        ("src/agent_factory/main.py", "主入口文件"),
        ("tests/__init__.py", "测试包"),
        ("CLAUDE.md", "AI 配置文件"),
        ("README.md", "项目说明"),
        (".gitignore", "Git 忽略文件"),
        ("requirements.txt", "依赖列表"),
    ]

    all_ok = True
    for path, desc in required_items:
        if os.path.exists(path):
            print(f"  [OK] {desc}: {path}")
        else:
            print(f"  [MISS] {desc}: {path}")
            all_ok = False

    return all_ok


def check_obsidian_vault() -> bool:
    """检查 Obsidian Vault"""
    print("\n[Obsidian Vault]")
    print("-" * 40)

    # 这个检查比较宽松，因为 Vault 可能在不同位置
    vault_path = Path.home() / "Documents" / "Agent Factory 学习笔记"
    if vault_path.exists():
        print(f"  [OK] Vault 目录: {vault_path}")
        return True
    else:
        print(f"  [INFO] 未在默认位置找到 Vault（可能在其他位置，这是正常的）")
        return True  # 不算失败


def main():
    """运行所有检查"""
    print("=" * 50)
    print("  Week 0 环境检查")
    print("=" * 50)

    checks = [
        ("Python 环境", check_python),
        ("Git", check_git),
        ("VS Code", check_vscode),
        ("Node.js", check_nodejs),
        ("Claude Code", check_claude_code),
        ("项目结构", check_project_structure),
        ("Obsidian Vault", check_obsidian_vault),
    ]

    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"  [ERROR] {name}: {e}")
            results.append((name, False))

    # 汇总
    print("\n" + "=" * 50)
    print("  检查结果汇总")
    print("=" * 50)

    required_passed = 0
    required_total = 0
    for name, ok in results:
        # Python、Git 是必须的，其他是可选的
        is_required = name in ("Python 环境", "Git")
        if is_required:
            required_total += 1
            if ok:
                required_passed += 1

        status = "[OK]" if ok else "[--]"
        tag = " (必须)" if is_required else " (可选)"
        print(f"  {status} {name}{tag}")

    print()
    if required_passed == required_total:
        print("  核心环境检查通过！可以开始 Week 1 的学习了。")
    else:
        print("  部分必须项未通过，请先完成安装。")

    print()


if __name__ == "__main__":
    main()
```

**运行方法：**

```powershell
# 激活虚拟环境
cd D:\claude-workspace\agent-factory
venv\Scripts\activate

# 运行检查
python week0_check.py
```

**预期输出（全部通过）：**
```
==================================================
  Week 0 环境检查
==================================================

[Python 环境]
----------------------------------------
  [OK] Python: Python 3.12.4
  [OK] pip: pip 24.0 from C:\Python312\Lib\site-packages\pip (python 3.12)
  [OK] 虚拟环境: 已激活

[Git]
----------------------------------------
  [OK] Git: git version 2.45.0
  [OK] 用户名: 你的名字
  [OK] 邮箱: 你的邮箱

[VS Code]
----------------------------------------
  [OK] VS Code: 1.90.0

[Node.js]
----------------------------------------
  [OK] Node.js: v20.14.0
  [OK] npm: 10.8.1

[Claude Code]
----------------------------------------
  [OK] Claude Code: 1.0.x

[项目结构]
----------------------------------------
  [OK] Python 包: src/agent_factory/__init__.py
  [OK] 主入口文件: src/agent_factory/main.py
  [OK] 测试包: tests/__init__.py
  [OK] AI 配置文件: CLAUDE.md
  [OK] 项目说明: README.md
  [OK] Git 忽略文件: .gitignore
  [OK] 依赖列表: requirements.txt

[Obsidian Vault]
----------------------------------------
  [OK] Vault 目录: ...

==================================================
  检查结果汇总
==================================================
  [OK] Python 环境 (必须)
  [OK] Git (必须)
  [OK] VS Code (可选)
  [OK] Node.js (可选)
  [OK] Claude Code (可选)
  [OK] 项目结构 (必须)
  [OK] Obsidian Vault (可选)

  核心环境检查通过！可以开始 Week 1 的学习了。
```

---

## 三、自评清单

请逐项检查，标记自己是否掌握：

### 工具使用
- [ ] 能独立安装 Python、Git、VS Code
- [ ] 能创建和激活虚拟环境
- [ ] 能使用 Git 基本命令（init, add, commit, status, log）
- [ ] 能使用 Claude Code 辅助写代码
- [ ] 能使用 Obsidian 创建和链接笔记

### Python 基础
- [ ] 理解并能使用 Python 基本数据类型
- [ ] 能操作列表、字典、元组、集合
- [ ] 能定义和调用函数
- [ ] 能定义类和使用继承
- [ ] 能使用模块导入

### Python 进阶
- [ ] 能使用列表推导式和字典推导式
- [ ] 能为代码添加类型提示
- [ ] 能使用 @dataclass
- [ ] 理解 f-string 的高级用法

### 项目管理
- [ ] 理解项目的目录结构
- [ ] 能编写 CLAUDE.md 配置文件
- [ ] 理解 .gitignore 的作用

**评分标准：**
- 全部打勾：Week 0 掌握得很好，可以直接进入 Week 1
- 打勾 15-20 个：基本掌握，建议快速回顾未打勾的部分
- 打勾少于 15 个：建议多花几天巩固 Week 0 的内容

---

## 四、Week 0 知识图谱

```
Week 0: 基础准备
    |
    ├── 工具链
    │   ├── Git ──── 版本控制 ──── 提交/回退/分支
    │   ├── VS Code ── 代码编辑 ──── 插件/调试
    │   ├── Python ── 编程语言 ──── 语法/标准库
    │   └── Obsidian ── 知识管理 ── 笔记/链接/图谱
    |
    ├── AI 辅助
    │   ├── Claude Code ── AI 编程助手
    │   └── Codex CLI ── AI 编程助手（备选）
    |
    └── Python 核心
        ├── 变量/类型 ──── int, float, str, bool, None
        ├── 数据结构 ──── list, dict, tuple, set
        ├── 函数 ──── 参数/返回值/lambda
        ├── 类 ──── 属性/方法/继承
        ├── 模块 ──── import/package
        └── 进阶 ──── 推导式/类型提示/dataclass
```

---

## 五、Week 1 预告

Week 1 的主题是 **Python + HTTP**，你将学到：

| 天数 | 内容 | 关键技能 |
|------|------|----------|
| Day 1 | pip 包管理 + requirements.txt | 安装/卸载/锁定依赖 |
| Day 2 | HTTP 协议基础 | GET/POST 请求 |
| Day 3 | requests 库实战 | 调用 API |
| Day 4 | JSON 数据处理 | 解析 API 返回 |
| Day 5 | 调用第一个大模型 API | 发送 Prompt，接收回复 |
| Day 6 | API 错误处理 | 异常处理、重试机制 |
| Day 7 | 周复盘 | 总结 + 环境检查 |

**Week 1 的前提条件（Week 0 必须完成的）：**
- Python 3.10+ 安装成功
- 虚拟环境能正常创建和激活
- pip 能正常使用
- Git 基本命令会用
- 项目仓库已创建

---

## 六、给初学者的建议

1. **不要追求完美**：先把环境搭起来，代码能跑就行，后面再优化。
2. **多动手**：光看教程不写代码，等于没学。每个示例都自己敲一遍。
3. **善用 AI**：遇到不懂的语法、报错，直接问 Claude Code。
4. **做笔记**：用 Obsidian 记录学到的东西，哪怕只是复制粘贴代码。
5. **遇到报错别慌**：报错是学习的一部分。仔细读错误信息，通常能找到原因。
6. **保持节奏**：每天 1-2 小时，比突击一天然后放弃好得多。

---

## 七、今日复盘

请在 Obsidian 中新建一篇笔记，记录以下内容：

### 本周最大收获


### 本周遇到的问题和解决方案


### 需要继续学习的内容


### 下周学习计划


---

恭喜你完成了 Week 0 的全部内容！你已经为 Agent 开发之旅打下了坚实的基础。下周我们将正式开始学习 Python + HTTP，动手调用 API。加油！
