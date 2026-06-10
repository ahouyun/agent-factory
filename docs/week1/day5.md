# 📅 Week 1 Day 5：CLI 工具搭建（typer）

## 🧭 今日方向
> 今天我们将学习如何使用 typer 构建命令行工具。CLI 工具是 Agent 开发中常用的交互方式，能让你的程序更专业、更易用。

## 🎯 生活比喻
> CLI 工具就像一个智能遥控器，你可以通过简单的命令来控制复杂的程序。typer 就是帮你设计这个遥控器的工具。

## 📋 今日三件事
1. 了解 typer 的基本用法
2. 构建一个完整的 CLI 工具
3. 学习命令参数和选项的处理

## 🗺️ 手把手路线

### Step 1: typer 基础
- **做什么**: 安装 typer 并编写第一个 CLI 程序
- **为什么**: typer 是构建现代 CLI 工具的优秀框架
- **成功标志**: 能运行 typer 程序并显示帮助信息

### Step 2: 命令和参数
- **做什么**: 学习如何定义命令、参数和选项
- **为什么**: 命令行工具的核心是接收用户输入
- **成功标志**: 能处理各种类型的命令行参数

### Step 3: 完整 CLI 工具
- **做什么**: 构建一个功能完整的 CLI 工具
- **为什么**: 实践是最好的学习方式
- **成功标志**: CLI 工具能完成指定功能

## 💻 代码区

```python
# typer 基础示例

import typer
from typing import Optional
from pathlib import Path

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

```python
# 命令参数和选项示例

import typer
from typing import Optional, List
from enum import Enum

app = typer.Typer()

# 枚举类型
class OutputFormat(str, Enum):
    """输出格式"""
    JSON = "json"
    TEXT = "text"
    CSV = "csv"

@app.command()
def process(
    input_file: Path,
    output_file: Optional[Path] = None,
    format: OutputFormat = OutputFormat.TEXT,
    verbose: bool = False
):
    """
    处理文件
    
    Args:
        input_file: 输入文件路径
        output_file: 输出文件路径（可选）
        format: 输出格式
        verbose: 是否显示详细信息
    """
    if verbose:
        typer.echo(f"输入文件: {input_file}")
        typer.echo(f"输出文件: {output_file}")
        typer.echo(f"输出格式: {format.value}")
    
    # 检查输入文件是否存在
    if not input_file.exists():
        typer.echo(f"错误: 文件 {input_file} 不存在", err=True)
        raise typer.Exit(code=1)
    
    # 处理文件
    typer.echo(f"正在处理文件: {input_file}")
    typer.echo(f"处理完成，格式: {format.value}")

@app.command()
def analyze(
    urls: List[str],
    max_concurrent: int = typer.Option(5, help="最大并发数"),
    timeout: float = typer.Option(30.0, help="超时时间（秒）"),
    output: Optional[str] = typer.Option(None, help="输出文件")
):
    """
    分析多个 URL
    
    Args:
        urls: 要分析的 URL 列表
        max_concurrent: 最大并发数
        timeout: 超时时间
        output: 输出文件
    """
    typer.echo(f"分析 {len(urls)} 个 URL")
    typer.echo(f"最大并发: {max_concurrent}")
    typer.echo(f"超时时间: {timeout} 秒")
    
    for url in urls:
        typer.echo(f"  - {url}")

if __name__ == "__main__":
    app()
```

```python
# 完整 CLI 工具：Agent Factory 命令行工具

import typer
import asyncio
from typing import Optional, List
from pathlib import Path
from datetime import datetime

# 创建主应用
app = typer.Typer(
    name="agent-factory",
    help="Agent Factory - AI Agent 开发工具集",
    add_completion=False
)

# 子命令组
chat_app = typer.Typer(help="聊天相关命令")
app.add_typer(chat_app, name="chat")

task_app = typer.Typer(help="任务管理命令")
app.add_typer(task_app, name="task")

@app.command()
def init(
    project_name: str,
    template: str = typer.Option("basic", help="项目模板"),
    git: bool = typer.Option(True, help="初始化 Git 仓库")
):
    """初始化新项目"""
    typer.echo(f"🚀 创建项目: {project_name}")
    typer.echo(f"📋 模板: {template}")
    typer.echo(f"📦 Git: {'是' if git else '否'}")
    
    # 创建目录结构
    from init_project import create_project_structure
    create_project_structure(project_name)
    
    typer.echo("✅ 项目创建完成！")

@app.command()
def info():
    """显示系统信息"""
    import sys
    import platform
    
    typer.echo("📊 Agent Factory 系统信息")
    typer.echo("=" * 40)
    typer.echo(f"Python 版本: {sys.version}")
    typer.echo(f"平台: {platform.platform()}")
    typer.echo(f"当前时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

@chat_app.command("send")
def chat_send(
    message: str,
    model: str = typer.Option("gpt-3.5-turbo", help="模型名称"),
    temperature: float = typer.Option(0.7, help="温度参数")
):
    """发送聊天消息"""
    typer.echo(f"💬 发送消息: {message}")
    typer.echo(f"🤖 模型: {model}")
    typer.echo(f"🌡️ 温度: {temperature}")
    
    # 模拟 AI 响应
    response = f"这是对 '{message}' 的模拟响应。"
    typer.echo(f"🤖 响应: {response}")

@chat_app.command("history")
def chat_history(
    limit: int = typer.Option(10, help="显示条数"),
    user: Optional[str] = typer.Option(None, help="过滤用户")
):
    """查看聊天历史"""
    typer.echo(f"📜 聊天历史 (最近 {limit} 条)")
    if user:
        typer.echo(f"👤 过滤用户: {user}")
    
    # 模拟历史记录
    for i in range(min(5, limit)):
        typer.echo(f"  {i+1}. 用户{i}: 这是第{i+1}条消息")

@task_app.command("create")
def task_create(
    title: str,
    description: Optional[str] = None,
    priority: int = typer.Option(1, help="优先级 (1-5)")
):
    """创建新任务"""
    typer.echo(f"📝 创建任务: {title}")
    if description:
        typer.echo(f"📋 描述: {description}")
    typer.echo(f"⭐ 优先级: {priority}")
    
    typer.echo("✅ 任务创建成功！")

@task_app.command("list")
def task_list(
    status: Optional[str] = typer.Option(None, help="过滤状态"),
    sort_by: str = typer.Option("created_at", help="排序字段")
):
    """列出任务"""
    typer.echo(f"📋 任务列表")
    if status:
        typer.echo(f"🔍 状态过滤: {status}")
    typer.echo(f"📊 排序: {sort_by}")
    
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
    typer.echo(f"✅ 标记任务 {task_id} 为完成")
    typer.echo("任务状态已更新！")

if __name__ == "__main__":
    app()
```

```python
# CLI 工具测试脚本

import subprocess
import sys

def run_command(command: str):
    """运行命令并显示结果"""
    print(f"\n🔧 执行命令: {command}")
    print("-" * 40)
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            encoding='utf-8'
        )
        
        if result.stdout:
            print("输出:")
            print(result.stdout)
        
        if result.stderr:
            print("错误:")
            print(result.stderr)
        
        print(f"返回码: {result.returncode}")
        
    except Exception as e:
        print(f"执行错误: {e}")

if __name__ == "__main__":
    # 测试各种命令
    commands = [
        "python cli_tool.py --help",
        "python cli_tool.py init my-project --template basic",
        "python cli_tool.py info",
        "python cli_tool.py chat send '你好世界'",
        "python cli_tool.py task create '学习 typer' --priority 3",
        "python cli_tool.py task list"
    ]
    
    for command in commands:
        run_command(command)
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | typer 未安装 | 运行 `pip install typer[all]` |
| 2 | 命令不识别 | 检查 `@app.command()` 装饰器是否正确 |
| 3 | 参数类型错误 | 检查参数类型注解，确保与 typer 兼容 |
| 4 | 子命令不工作 | 确保使用 `app.add_typer()` 添加子命令组 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| CLI | 命令行界面 |
| typer | Python CLI 框架，基于 Click |
| 命令 | CLI 中可执行的操作 |
| 参数 | 命令的输入值 |
| 选项 | 以 -- 开头的可选参数 |
| 子命令 | 命令的子操作（如 git commit） |

## ✅ 验收清单
- [ ] 能安装并运行 typer 程序
- [ ] 能定义命令、参数和选项
- [ ] 能创建子命令组
- [ ] 理解 CLI 工具的设计原则

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
