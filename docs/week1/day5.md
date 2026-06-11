# Day 5: CLI 工具搭建（typer）

> 今天的目标：学习使用 typer 构建命令行工具。CLI 工具是 Agent 开发中常用的交互方式，能让你的程序更专业、更易用。

---

## 1. 什么是 CLI 工具？

### 1.1 用一个生活中的类比

CLI（Command Line Interface，命令行界面）工具就像一个**智能遥控器**：

- 你按下不同的按钮（输入不同的命令）
- 电视执行不同的操作（程序执行不同的功能）

```
# 这就是 CLI 工具
git commit -m "修复 bug"        <-- 告诉 git：提交代码
python train.py --epochs 10     <-- 告诉程序：训练 10 轮
agent chat "你好"               <-- 告诉 Agent：发送消息
```

### 1.2 为什么 Agent 需要 CLI？

- **快速测试**：输入命令就能和 Agent 对话
- **自动化**：可以写脚本批量调用 Agent
- **专业感**：比直接运行 Python 脚本更像一个"产品"
- **可复用**：别人只需要知道命令，不需要看代码

---

## 2. 安装 typer

```bash
# 确保虚拟环境已激活
pip install "typer[all]"

# 验证安装
pip show typer
```

> **为什么用 typer 而不是 argparse？**
> - argparse：Python 内置，功能够用但写法啰嗦
> - typer：基于 Click，用类型注解自动生成帮助文档，写法简洁

---

## 3. 第一个 CLI 程序

创建文件 `examples/day5_cli.py`：

```python
"""
Day 5 示例：第一个 CLI 程序
"""

import typer

# 创建应用
app = typer.Typer()

@app.command()
def hello(name: str):
    """向用户打招呼"""
    typer.echo(f"你好, {name}!")

@app.command()
def goodbye(name: str, formal: bool = False):
    """向用户道别"""
    if formal:
        typer.echo(f"再见, 尊敬的 {name} 先生/女士。")
    else:
        typer.echo(f"拜拜, {name}!")

if __name__ == "__main__":
    app()
```

### 运行和测试

```bash
# 查看帮助（自动从 docstring 生成！）
python examples/day5_cli.py --help

# 输出：
# Usage: day5_cli.py [OPTIONS] COMMAND [ARGS]...
#
#   向用户打招呼
#
# Options:
#   --help  Show this message and exit.
#
# Commands:
#   goodbye  向用户道别
#   hello    向用户打招呼

# 运行 hello 命令
python examples/day5_cli.py hello "小明"
# 输出：你好, 小明!

# 运行 goodbye 命令
python examples/day5_cli.py goodbye "小明"
# 输出：拜拜, 小明!

# 使用 --formal 选项
python examples/day5_cli.py goodbye "小明" --formal
# 输出：再见, 尊敬的 小明 先生/女士。
```

> **注意**：typer 自动把函数名变成了命令名，把参数变成了命令行参数，把 docstring 变成了帮助文档。非常方便！

---

## 4. 参数和选项

### 4.1 位置参数 vs 选项

```python
"""
Day 5 示例：参数和选项
"""

import typer
from typing import Optional
from pathlib import Path

app = typer.Typer()

@app.command()
def process(
    input_file: Path,                                          # 位置参数（必填）
    output_file: Optional[Path] = None,                        # 可选位置参数
    format: str = "json",                                      # 选项（有默认值）
    verbose: bool = False,                                     # 布尔选项
    max_retries: int = typer.Option(3, help="最大重试次数"),    # 带帮助的选项
):
    """
    处理文件

    输入文件会被处理并转换为指定格式。
    """
    typer.echo(f"输入文件: {input_file}")
    typer.echo(f"输出文件: {output_file}")
    typer.echo(f"格式: {format}")
    typer.echo(f"详细模式: {verbose}")
    typer.echo(f"最大重试: {max_retries}")

    # 检查输入文件是否存在
    if not input_file.exists():
        typer.echo(f"错误: 文件 {input_file} 不存在", err=True)
        raise typer.Exit(code=1)

    typer.echo("处理完成！")

if __name__ == "__main__":
    app()
```

运行测试：

```bash
# 查看帮助
python day5_cli.py process --help

# 输出：
# Usage: day5_cli.py process [OPTIONS] INPUT_FILE [OUTPUT_FILE]
#
#   处理文件
#
#   输入文件会被处理并转换为指定格式。
#
# Arguments:
#   INPUT_FILE   [required]
#   OUTPUT_FILE  [optional]
#
# Options:
#   --format TEXT          [default: json]
#   --verbose / --no-verbose  [default: False]
#   --max-retries INTEGER  最大重试次数  [default: 3]
#   --help                 Show this message and exit.

# 使用示例
python day5_cli.py process data.txt result.txt --format csv --verbose --max-retries 5
```

### 4.2 枚举参数

```python
"""
Day 5 示例：枚举参数
"""

import typer
from enum import Enum

app = typer.Typer()

class OutputFormat(str, Enum):
    """输出格式"""
    JSON = "json"
    TEXT = "text"
    CSV = "csv"

@app.command()
def export(
    data: str,
    format: OutputFormat = OutputFormat.JSON
):
    """导出数据"""
    typer.echo(f"数据: {data}")
    typer.echo(f"格式: {format.value}")

if __name__ == "__main__":
    app()
```

运行：

```bash
# 查看可选值
python day5_cli.py export --help
# 输出：--format [json|text|csv]

# 使用
python day5_cli.py export "一些数据" --format csv
# 输出：格式: csv
```

---

## 5. 完整 CLI 工具：Agent Factory 命令行工具

让我们构建一个功能完整的 CLI 工具：

```python
"""
Agent Factory 命令行工具
文件：examples/day5_agent_cli.py
"""

import typer
import asyncio
from typing import Optional
from pathlib import Path
from datetime import datetime

# ============================================
# 创建主应用
# ============================================

app = typer.Typer(
    name="agent-factory",
    help="Agent Factory - AI Agent 开发工具集",
    add_completion=False
)

# ============================================
# 子命令组
# ============================================

chat_app = typer.Typer(help="聊天相关命令")
app.add_typer(chat_app, name="chat")

task_app = typer.Typer(help="任务管理命令")
app.add_typer(task_app, name="task")

# ============================================
# 主命令
# ============================================

@app.command()
def info():
    """显示系统信息"""
    import sys
    import platform

    typer.echo("Agent Factory 系统信息")
    typer.echo("=" * 40)
    typer.echo(f"Python 版本: {sys.version}")
    typer.echo(f"平台: {platform.platform()}")
    typer.echo(f"当前时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

@app.command()
def init(
    project_name: str,
    template: str = typer.Option("basic", help="项目模板"),
    git: bool = typer.Option(True, help="初始化 Git 仓库")
):
    """初始化新项目"""
    typer.echo(f"创建项目: {project_name}")
    typer.echo(f"模板: {template}")
    typer.echo(f"Git: {'是' if git else '否'}")

    # 创建目录
    try:
        Path(project_name).mkdir(exist_ok=True)
        Path(f"{project_name}/src").mkdir(exist_ok=True)
        Path(f"{project_name}/tests").mkdir(exist_ok=True)

        typer.echo(f"项目 {project_name} 创建成功！")
        typer.echo(f"目录结构:")
        typer.echo(f"  {project_name}/")
        typer.echo(f"  ├── src/")
        typer.echo(f"  └── tests/")

    except Exception as e:
        typer.echo(f"创建失败: {e}", err=True)
        raise typer.Exit(code=1)

# ============================================
# 聊天子命令
# ============================================

@chat_app.command("send")
def chat_send(
    message: str,
    model: str = typer.Option("gpt-4o-mini", help="模型名称"),
    temperature: float = typer.Option(0.7, help="温度参数")
):
    """发送聊天消息"""
    typer.echo(f"发送消息: {message}")
    typer.echo(f"模型: {model}")
    typer.echo(f"温度: {temperature}")

    # 这里可以调用真实的 LLM API
    # 目前用模拟响应
    response = f"这是对 '{message}' 的模拟响应。"
    typer.echo(f"AI: {response}")

@chat_app.command("history")
def chat_history(
    limit: int = typer.Option(10, help="显示条数"),
    user: Optional[str] = typer.Option(None, help="过滤用户")
):
    """查看聊天历史"""
    typer.echo(f"聊天历史 (最近 {limit} 条)")
    if user:
        typer.echo(f"过滤用户: {user}")

    # 模拟历史记录
    for i in range(min(5, limit)):
        typer.echo(f"  {i+1}. 用户{i}: 这是第{i+1}条消息")

# ============================================
# 任务子命令
# ============================================

@task_app.command("create")
def task_create(
    title: str,
    description: Optional[str] = None,
    priority: int = typer.Option(1, help="优先级 (1-5)")
):
    """创建新任务"""
    typer.echo(f"创建任务: {title}")
    if description:
        typer.echo(f"描述: {description}")
    typer.echo(f"优先级: {priority}")
    typer.echo("任务创建成功！")

@task_app.command("list")
def task_list(
    status: Optional[str] = typer.Option(None, help="过滤状态"),
    sort_by: str = typer.Option("created_at", help="排序字段")
):
    """列出任务"""
    typer.echo("任务列表")
    if status:
        typer.echo(f"状态过滤: {status}")

    # 模拟任务列表
    tasks = [
        {"id": 1, "title": "学习 typer", "status": "completed"},
        {"id": 2, "title": "构建 CLI 工具", "status": "in_progress"},
        {"id": 3, "title": "编写测试", "status": "pending"}
    ]

    for task in tasks:
        if status is None or task["status"] == status:
            typer.echo(f"  [{task['id']}] {task['title']} - {task['status']}")

@task_app.command("complete")
def task_complete(task_id: int):
    """完成任务"""
    typer.echo(f"标记任务 {task_id} 为完成")
    typer.echo("任务状态已更新！")

# ============================================
# 运行
# ============================================

if __name__ == "__main__":
    app()
```

### 运行测试

```bash
# 查看主帮助
python examples/day5_agent_cli.py --help

# 输出：
# Usage: day5_agent_cli.py [OPTIONS] COMMAND [ARGS]...
#
#   Agent Factory - AI Agent 开发工具集
#
# Options:
#   --help  Show this message and exit.
#
# Commands:
#   chat  聊天相关命令
#   info  显示系统信息
#   init  初始化新项目
#   task  任务管理命令

# 查看系统信息
python examples/day5_agent_cli.py info

# 创建项目
python examples/day5_agent_cli.py init my-project

# 查看聊天子命令
python examples/day5_agent_cli.py chat --help

# 发送消息
python examples/day5_agent_cli.py chat send "你好世界"

# 查看聊天历史
python examples/day5_agent_cli.py chat history --limit 5

# 查看任务子命令
python examples/day5_agent_cli.py task --help

# 创建任务
python examples/day5_agent_cli.py task create "学习 typer" --priority 3

# 列出任务
python examples/day5_agent_cli.py task list

# 完成任务
python examples/day5_agent_cli.py task complete 1
```

---

## 6. 使用 Rich 美化输出

typer 可以搭配 Rich 库来美化输出：

```bash
pip install rich
```

```python
"""
使用 Rich 美化输出
"""

import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

app = typer.Typer()
console = Console()

@app.command()
def dashboard():
    """显示仪表板"""
    # 面板
    console.print(Panel.fit(
        "欢迎使用 Agent Factory",
        title="Dashboard",
        border_style="green"
    ))

    # 表格
    table = Table(title="任务列表")
    table.add_column("ID", style="cyan")
    table.add_column("标题", style="white")
    table.add_column("状态", style="green")
    table.add_column("优先级", style="yellow")

    table.add_row("1", "学习 typer", "完成", "高")
    table.add_row("2", "构建 CLI", "进行中", "中")
    table.add_row("3", "编写测试", "待开始", "低")

    console.print(table)

if __name__ == "__main__":
    app()
```

---

## 7. 将 CLI 工具安装为命令

你可以把 CLI 工具安装到系统中，这样就可以直接用命令名调用：

```bash
# 方法 1：使用 pip install -e（开发模式安装）
pip install -e .

# 方法 2：使用 python -m
python -m agent_factory.cli

# 方法 3：在 pyproject.toml 中配置入口点
# [project.scripts]
# agent-factory = "agent_factory.cli:app"
```

在 `pyproject.toml` 中添加：

```toml
[project.scripts]
agent-factory = "agent_factory.cli:app"
```

然后安装：

```bash
pip install -e .
```

现在可以直接运行：

```bash
agent-factory --help
agent-factory info
agent-factory chat send "你好"
```

---

## 8. 今日小结

| 知识点 | 要点 |
|--------|------|
| CLI 工具 | 命令行界面，像遥控器一样控制程序 |
| `@app.command()` | 定义一个命令 |
| 位置参数 | 函数参数自动变成命令行参数 |
| `typer.Option()` | 定义选项（带默认值和帮助） |
| 子命令组 | `app.add_typer()` 创建子命令 |
| `--help` | 自动生成帮助文档 |
| `raise typer.Exit(code=1)` | 错误退出 |

---

## 9. 课后练习

1. 创建一个 CLI 工具，包含 `greet` 和 `farewell` 两个命令
2. 为 `greet` 命令添加 `--times` 选项，控制打招呼的次数
3. 创建一个子命令组 `config`，包含 `get` 和 `set` 两个子命令
4. 尝试使用 Rich 美化输出

---

> **明天预告**：Day 6 我们将学习日志系统、错误处理和 .env 管理——这是让 Agent 变得更可靠、更安全的关键。
