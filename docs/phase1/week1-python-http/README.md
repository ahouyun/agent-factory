# Phase 1 Week 1：Python 工程化 + HTTP 基础

> **目标**：掌握 Python 工程化开发规范和 HTTP 通信基础，为后续 FastAPI 和 Agent 开发做好准备。
> **周期**：Week 1，共 7 天

---

## 📅 Day 1：虚拟环境与包管理

### 🧭 今日方向
学习 Python 项目的核心工程化实践——虚拟环境和依赖管理。

### 🎯 生活比喻
每个项目就像一栋独立的房子，虚拟环境就是每栋房子自己的"水电系统"——互不干扰，各自独立。

### 📋 今日三件事
1. 理解为什么需要虚拟环境
2. 创建并使用虚拟环境
3. 学会用 `requirements.txt` 管理依赖

---

### 🗺️ 手把手路线

#### 第一步：理解虚拟环境的必要性

**做什么**：思考一个问题——如果你有两个项目，一个需要 requests 2.28，另一个需要 requests 2.31，怎么办？

**为什么**：虚拟环境为每个项目创建独立的 Python 包安装空间，避免版本冲突。

**成功标志**：能用自己的话说出"虚拟环境 = 项目的隔离沙箱"。

---

#### 第二步：创建虚拟环境

**做什么**：
```bash
# 在项目根目录创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 激活后终端前面会出现 (venv) 标识
```

**为什么**：激活后，所有 `pip install` 只安装到当前项目的虚拟环境中。

**成功标志**：终端显示 `(venv)` 前缀，`which python`（Linux/Mac）或 `where python`（Windows）指向 venv 目录。

---

#### 第三步：管理依赖

**做什么**：
```bash
# 安装包
pip install requests fastapi pydantic

# 导出依赖列表
pip freeze > requirements.txt

# 从依赖列表安装（在新环境中）
pip install -r requirements.txt
```

**为什么**：`requirements.txt` 是项目的"材料清单"，让其他开发者（包括你自己）能一键复现环境。

**成功标志**：能生成 `requirements.txt` 并在新环境中成功安装。

---

### 💻 代码区

#### 依赖管理脚本

```python
# setup_env.py —— 虚拟环境和依赖管理指南

# 这不是直接运行的脚本，而是操作指南的代码化记录
# 请在终端中执行以下命令

commands = {
    "创建虚拟环境": "python -m venv venv",
    "激活 (Windows)": r"venv\Scripts\activate",
    "激活 (Linux/Mac)": "source venv/bin/activate",
    "安装依赖": "pip install -r requirements.txt",
    "导出依赖": "pip freeze > requirements.txt",
    "退出虚拟环境": "deactivate",
}

print("=" * 50)
print("  虚拟环境操作指南")
print("=" * 50)
for step, cmd in commands.items():
    print(f"\n  {step}:")
    print(f"    $ {cmd}")
print("\n" + "=" * 50)
```

#### requirements.txt 示例

```
# requirements.txt —— 项目依赖列表
# 使用 pip install -r requirements.txt 安装

# Web 框架
fastapi==0.115.0
uvicorn[standard]==0.30.0

# 数据验证
pydantic==2.9.0

# HTTP 客户端
httpx==0.27.0
requests==2.32.0

# 数据库
sqlalchemy==2.0.35

# 测试
pytest==8.3.0
pytest-asyncio==0.24.0
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| `python -m venv` 报错 | 确保 Python 安装时勾选了 pip，或运行 `python -m ensurepip` |
| 激活虚拟环境失败（Windows） | 检查执行策略：`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `pip freeze` 输出为空 | 确认已在激活的虚拟环境中，且已安装包 |
| 忘记激活虚拟环境 | 检查终端前缀是否有 `(venv)` |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| 虚拟环境 (venv) | Python 包的隔离空间 | 项目的"独立沙箱" |
| pip | Python 包管理器 | Python 的"应用商店" |
| requirements.txt | 依赖列表 | 项目的"材料清单" |
| freeze | 导出当前环境的包列表 | "拍照记录"当前安装了什么 |
| 激活 (activate) | 进入虚拟环境 | "进入沙箱工作模式" |
| 依赖冲突 | 不同包需要不同版本的同一包 | "两个人要同一件东西" |

---

### ✅ 验收清单

- [ ] 能创建并激活虚拟环境
- [ ] 能在虚拟环境中安装包
- [ ] 能生成 `requirements.txt`
- [ ] 能在新环境中用 `requirements.txt` 复现环境
- [ ] 理解虚拟环境的隔离原理

---

### 📝 复盘小纸条

> **虚拟环境解决了什么问题？**
>
> 
>
> **操作过程中哪里容易出错？**
>
> 
>
> **明天我想重点学习什么？**
>
> 

---

### 📥 明日同步接口

- 输入：虚拟环境和依赖管理已掌握
- 输出：准备学习 HTTP 基础
- 关键交接物：可用的虚拟环境 + requirements.txt

---

## 📅 Day 2：HTTP 基础——请求、响应、状态码

### 🧭 今日方向
理解 HTTP 协议的核心概念——请求方法、响应状态码、请求/响应头。

### 🎯 生活比喻
HTTP 就像"寄快递"：你写一封信（请求），邮局处理后给你回信（响应）。信封上写着地址（URL）、寄送方式（GET/POST）和状态（200 OK / 404 Not Found）。

### 📋 今日三件事
1. 理解 HTTP 请求的组成部分
2. 掌握 GET 和 POST 请求的区别
3. 记住常用的状态码

---

### 🗺️ 手把手路线

#### 第一步：理解 HTTP 请求结构

**做什么**：阅读下方代码区中的 HTTP 概念说明，重点理解 URL、方法、头、体四个部分。

**为什么**：几乎所有 Web 开发都基于 HTTP，理解它是后续一切的基础。

**成功标志**：能画出一个 HTTP 请求的四个组成部分。

---

#### 第二步：用 Python 发送 HTTP 请求

**做什么**：运行代码区中的示例代码，用 `requests` 库发送真实的 HTTP 请求。

**为什么**：理论结合实践，亲手发请求才能真正理解。

**成功标志**：能成功请求一个公开 API 并解析响应。

---

#### 第三步：理解状态码

**做什么**：记住最常用的状态码（200、301、400、401、403、404、500）。

**为什么**：状态码是服务器告诉你"请求结果"的密码。

**成功标志**：看到状态码能立刻知道大概含义。

---

### 💻 代码区

```python
# http_basics.py —— HTTP 基础学习

import requests  # HTTP 客户户端库

# === HTTP 请求的四个组成部分 ===
"""
1. URL（地址）: https://api.github.com/users/octocat
2. 方法（Method）: GET（获取）、POST（创建）、PUT（更新）、DELETE（删除）
3. 请求头（Headers）: 元数据，如 Content-Type、Authorization
4. 请求体（Body）: POST/PUT 时发送的数据（GET 通常没有）
"""

# === 发送 GET 请求 ===
print("=== GET 请求示例 ===")
response = requests.get("https://httpbin.org/get")

print(f"状态码: {response.status_code}")          # 200 表示成功
print(f"响应头: {dict(response.headers)}")         # 服务器返回的元数据
print(f"响应体: {response.json()}")               # 解析 JSON 响应

# === 发送带参数的 GET 请求 ===
print("\n=== 带查询参数的 GET 请求 ===")
params = {
    "name": "Agent 学员",
    "course": "Python"
}
response = requests.get("https://httpbin.org/get", params=params)
print(f"请求 URL: {response.url}")                 # 参数已拼接到 URL
print(f"响应: {response.json()}")

# === 发送 POST 请求（带请求体）===
print("\n=== POST 请求示例 ===")
data = {
    "username": "agent_learner",
    "message": "Hello, Agent Factory!"
}
response = requests.post("https://httpbin.org/post", json=data)
print(f"状态码: {response.status_code}")
print(f"服务器收到的数据: {response.json()['json']}")

# === 常用状态码速查 ===
status_codes = {
    200: "OK - 请求成功",
    201: "Created - 资源创建成功",
    301: "Moved Permanently - 永久重定向",
    302: "Found - 临时重定向",
    400: "Bad Request - 请求格式错误",
    401: "Unauthorized - 未认证（需要登录）",
    403: "Forbidden - 无权限访问",
    404: "Not Found - 资源不存在",
    429: "Too Many Requests - 请求太频繁",
    500: "Internal Server Error - 服务器内部错误",
    502: "Bad Gateway - 网关错误",
    503: "Service Unavailable - 服务不可用",
}

print("\n=== 常用状态码 ===")
for code, meaning in status_codes.items():
    print(f"  {code}: {meaning}")

# === 错误处理 ===
print("\n=== 错误处理示例 ===")
try:
    # 请求一个不存在的地址（会返回 404）
    response = requests.get("https://httpbin.org/status/404")
    response.raise_for_status()  # 如果状态码 >= 400，抛出异常
except requests.exceptions.HTTPError as e:
    print(f"HTTP 错误: {e}")
except requests.exceptions.ConnectionError:
    print("连接错误: 无法连接到服务器")
except requests.exceptions.Timeout:
    print("超时错误: 请求超时")
except requests.exceptions.RequestException as e:
    print(f"请求异常: {e}")
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| `ModuleNotFoundError: No module named 'requests'` | 运行 `pip install requests` |
| 请求超时 | 检查网络连接，或添加 `timeout=10` 参数 |
| SSL 证书错误 | 检查系统时间，或使用 `verify=False`（仅调试用） |
| 403 Forbidden | 检查是否需要认证头，或被反爬机制拦截 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| HTTP | 超文本传输协议 | Web 世界的"通信语言" |
| GET | 获取资源 | "我要看这个" |
| POST | 创建资源 | "我要提交这个" |
| PUT | 更新资源 | "我要修改这个" |
| DELETE | 删除资源 | "我要删除这个" |
| 状态码 | 响应结果的数字编码 | 服务器的"回复暗号" |
| 请求头 | 请求的元数据 | 信封上的"备注信息" |
| 请求体 | 请求携带的数据 | 信封里的"内容" |
| JSON | 数据交换格式 | Web 世界的"通用数据格式" |
| API | 应用程序接口 | 程序之间的"对话方式" |

---

### ✅ 验收清单

- [ ] 能说出 HTTP 请求的四个组成部分
- [ ] 能用 `requests` 发送 GET 和 POST 请求
- [ ] 能处理请求响应和异常
- [ ] 记住了至少 8 个常用状态码
- [ ] 运行了所有代码区的示例代码

---

### 📝 复盘小纸条

> **HTTP 协议中最难理解的部分是什么？**
>
> 
>
> **GET 和 POST 我现在能区分了吗？**
>
> 
>
> **明天我想深入学习什么？**
>
> 

---

### 📥 明日同步接口

- 输入：HTTP 基础知识已掌握
- 输出：准备学习 asyncio 异步编程
- 关键交接物：能发送 HTTP 请求并处理响应

---

## 📅 Day 3：asyncio 异步编程基础

### 🧭 今日方向
理解异步编程的核心概念，学会用 `asyncio` 处理并发任务。

### 🎯 生活比喻
同步就像在餐厅"点一个菜等上桌再点下一个"，异步就像"一口气点五个菜，哪个先做好先吃哪个"——效率大大提升。

### 📋 今日三件事
1. 理解同步 vs 异步的区别
2. 掌握 `async/await` 基本语法
3. 用 `asyncio` 并发执行多个 HTTP 请求

---

### 🗺️ 手把手路线

#### 第一步：理解同步与异步

**做什么**：运行代码区中的同步版本，观察执行时间；然后运行异步版本，对比差异。

**为什么**：Agent 开发中经常需要同时调用多个 API，异步编程是必备技能。

**成功标志**：能说出"异步 = 在等待时去做别的事"。

---

#### 第二步：掌握 async/await 语法

**做什么**：理解三个关键概念：
- `async def`：定义一个异步函数（协程）
- `await`：等待一个异步操作完成
- `asyncio.run()`：启动异步事件循环

**为什么**：这是 Python 异步编程的核心语法，必须熟练掌握。

**成功标志**：能写出一个简单的异步函数并成功运行。

---

#### 第三步：并发 HTTP 请求

**做什么**：用 `asyncio` + `httpx` 并发请求多个 API。

**为什么**：实际项目中经常需要同时调用多个服务，并发能大幅提高效率。

**成功标志**：看到多个请求并发执行，总时间接近单个请求的时间。

---

### 💻 代码区

```python
# async_basics.py —— asyncio 异步编程基础

import asyncio        # 异步编程标准库
import time           # 时间模块

# === 同步版本 ===
def fetch_data_sync(name: str, delay: float) -> str:
    """
    同步获取数据（模拟网络请求）
    
    参数:
        name: 数据名称
        delay: 模拟延迟时间（秒）
    返回:
        获取到的数据
    """
    print(f"  [同步] 开始获取 {name}...")
    time.sleep(delay)                   # 模拟网络延迟（阻塞！）
    print(f"  [同步] {name} 获取完成")
    return f"{name}_data"

def sync_example():
    """同步执行示例 —— 一个一个来"""
    print("=== 同步执行 ===")
    start = time.time()
    
    result1 = fetch_data_sync("用户信息", 1.0)    # 等 1 秒
    result2 = fetch_data_sync("订单数据", 1.5)    # 再等 1.5 秒
    result3 = fetch_data_sync("商品列表", 1.0)    # 再等 1 秒
    
    elapsed = time.time() - start
    print(f"  总耗时: {elapsed:.1f} 秒")  # 约 3.5 秒
    return [result1, result2, result3]

# === 异步版本 ===
async def fetch_data_async(name: str, delay: float) -> str:
    """
    异步获取数据（模拟网络请求）
    
    参数:
        name: 数据名称
        delay: 模拟延迟时间（秒）
    返回:
        获取到的数据
    """
    print(f"  [异步] 开始获取 {name}...")
    await asyncio.sleep(delay)          # 异步等待（不阻塞！）
    print(f"  [异步] {name} 获取完成")
    return f"{name}_data"

async def async_example():
    """异步执行示例 —— 同时进行"""
    print("\n=== 异步执行 ===")
    start = time.time()
    
    # 同时启动三个任务
    results = await asyncio.gather(
        fetch_data_async("用户信息", 1.0),
        fetch_data_async("订单数据", 1.5),
        fetch_data_async("商品列表", 1.0),
    )
    
    elapsed = time.time() - start
    print(f"  总耗时: {elapsed:.1f} 秒")  # 约 1.5 秒（取最长的那个）
    return results

# === 异步 HTTP 请求 ===
async def fetch_url(url: str) -> dict:
    """
    异步获取 URL 内容
    
    参数:
        url: 要请求的 URL
    返回:
        响应数据
    """
    import httpx  # 异步 HTTP 客户端
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return {
            "url": url,
            "status": response.status_code,
            "length": len(response.text),
        }

async def fetch_multiple_urls():
    """并发请求多个 URL"""
    urls = [
        "https://httpbin.org/delay/1",
        "https://httpbin.org/delay/2",
        "https://httpbin.org/delay/1",
    ]
    
    print("\n=== 并发 HTTP 请求 ===")
    start = time.time()
    
    # 并发请求所有 URL
    results = await asyncio.gather(*[fetch_url(url) for url in urls])
    
    elapsed = time.time() - start
    for r in results:
        print(f"  {r['url']}: 状态 {r['status']}, 长度 {r['length']}")
    print(f"  总耗时: {elapsed:.1f} 秒")  # 约 2 秒，不是 4 秒

# === 运行示例 ===
if __name__ == "__main__":
    # 运行同步示例
    sync_example()
    
    # 运行异步示例
    asyncio.run(async_example())
    
    # 运行并发 HTTP 请求（需要 httpx: pip install httpx）
    # asyncio.run(fetch_multiple_urls())
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| `SyntaxError: 'await' outside async function` | `await` 只能在 `async def` 函数中使用 |
| `RuntimeError: This event loop is already running` | 不要在已运行的事件循环中调用 `asyncio.run()` |
| `ModuleNotFoundError: No module named 'httpx'` | 运行 `pip install httpx` |
| 异步代码没有加速效果 | 确认使用了 `asyncio.gather()` 并发执行，而非顺序 `await` |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| 同步 (sync) | 一个任务完成后才做下一个 | "排队等候" |
| 异步 (async) | 在等待时切换到其他任务 | "同时做多件事" |
| 协程 (coroutine) | 异步函数 | 可以暂停和恢复的函数 |
| await | 等待异步操作完成 | "先做别的，好了叫我" |
| asyncio | Python 异步框架 | 异步编程的"调度中心" |
| 事件循环 | 管理异步任务的引擎 | "任务调度器" |
| gather | 并发执行多个协程 | "同时派多个人干活" |
| 阻塞 (blocking) | 程序停下来等待 | "干等着不动" |

---

### ✅ 验收清单

- [ ] 能说出同步和异步的区别
- [ ] 能用 `async def` 定义异步函数
- [ ] 能用 `await` 等待异步操作
- [ ] 能用 `asyncio.gather()` 并发执行任务
- [ ] 理解为什么异步能提高效率
- [ ] 运行了同步和异步对比示例

---

### 📝 复盘小纸条

> **异步编程中最难理解的概念是什么？**
>
> 
>
> **什么场景下适合用异步？什么场景不适合？**
>
> 
>
> **明天我想继续深入什么？**
>
> 

---

### 📥 明日同步接口

- 输入：asyncio 基础已掌握
- 输出：准备学习 CLI 命令行工具开发
- 关键交接物：能编写和运行异步 Python 代码

---

## 📅 Day 4：CLI 命令行工具开发

### 🧭 今日方向
学习用 Python 开发专业的命令行工具，使用 `argparse` 和 `click` 库。

### 🎯 生活比喻
CLI 工具就像"遥控器"——每个按钮（参数）控制一个功能，按对组合就能完成复杂任务。

### 📋 今日三件事
1. 用 `argparse` 创建基础 CLI 工具
2. 用 `click` 创建更优雅的 CLI 工具
3. 学习 CLI 工具的最佳实践

---

### 🗺️ 手把手路线

#### 第一步：argparse 基础

**做什么**：运行代码区中的 argparse 示例，理解位置参数、可选参数、子命令。

**为什么**：`argparse` 是 Python 标准库，所有 CLI 工具的基础。

**成功标志**：能用 argparse 创建一个带多个参数的 CLI 工具。

---

#### 第二步：click 进阶

**做什么**：安装 click 并运行示例代码，体验装饰器驱动的 CLI 开发。

**为什么**：click 比 argparse 更优雅、功能更强大，是现代 Python CLI 的首选。

**成功标志**：能用 click 创建带子命令、选项、参数的 CLI 工具。

---

#### 第三步：CLI 最佳实践

**做什么**：了解帮助信息、错误处理、彩色输出等专业实践。

**为什么**：好的 CLI 工具应该"自解释"——用户不看文档也能用。

**成功标志**：运行 `--help` 能看到清晰的帮助信息。

---

### 💻 代码区

```python
# cli_argparse.py —— 用 argparse 创建 CLI 工具

import argparse  # 命令行参数解析标准库

def main():
    # 创建解析器
    parser = argparse.ArgumentParser(
        description="Agent Factory - 智能助手工具",
        epilog="示例: python cli_argparse.py greet --name 小明 --count 3"
    )
    
    # 添加子命令
    subparsers = parser.add_subparsers(dest="command", help="可用命令")
    
    # === 子命令: greet ===
    greet_parser = subparsers.add_parser("greet", help="打招呼")
    greet_parser.add_argument(
        "--name", "-n",
        type=str,
        default="World",
        help="要打招呼的人的名字（默认: World）"
    )
    greet_parser.add_argument(
        "--count", "-c",
        type=int,
        default=1,
        help="打招呼的次数（默认: 1）"
    )
    
    # === 子命令: info ===
    info_parser = subparsers.add_parser("info", help="显示系统信息")
    info_parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="显示详细信息"
    )
    
    # 解析参数
    args = parser.parse_args()
    
    # 执行对应命令
    if args.command == "greet":
        for i in range(args.count):
            print(f"你好，{args.name}！（第 {i + 1} 次）")
    elif args.command == "info":
        import sys
        print(f"Python 版本: {sys.version}")
        if args.verbose:
            print(f"平台: {sys.platform}")
            print(f"执行路径: {sys.executable}")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
```

```python
# cli_click.py —— 用 click 创建优雅的 CLI 工具
# 需要安装: pip install click

import click  # 优雅的 CLI 框架

@click.group()
@click.version_option(version="1.0.0", prog_name="Agent CLI")
def cli():
    """Agent Factory - 智能助手工具集"""
    pass

@cli.command()
@click.option("--name", "-n", default="World", help="要打招呼的人的名字")
@click.option("--count", "-c", default=1, type=int, help="打招呼的次数")
@click.option("--excited", is_flag=True, help="添加感叹号")
def greet(name: str, count: int, excited: bool):
    """向某人打招呼"""
    message = f"你好，{name}"
    if excited:
        message += "！！！"
    else:
        message += "。"
    
    for _ in range(count):
        click.echo(message)  # click.echo 自动处理编码问题

@cli.command()
@click.option("--format", "-f", type=click.Choice(["json", "text"]), default="text")
def info(format: str):
    """显示系统信息"""
    import sys
    import platform
    
    data = {
        "python": sys.version,
        "platform": platform.system(),
        "machine": platform.machine(),
    }
    
    if format == "json":
        import json
        click.echo(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        click.echo(f"Python: {data['python']}")
        click.echo(f"平台: {data['platform']}")
        click.echo(f"机器: {data['machine']}")

@cli.command()
@click.argument("text")
@click.option("--upper", is_flag=True, help="转换为大写")
@click.option("--reverse", is_flag=True, help="反转文本")
def transform(text: str, upper: bool, reverse: bool):
    """文本转换工具"""
    result = text
    if upper:
        result = result.upper()
    if reverse:
        result = result[::-1]
    click.echo(f"结果: {result}")

if __name__ == "__main__":
    cli()
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| `click` 安装失败 | 运行 `pip install click` |
| argparse 帮助信息不清晰 | 使用 `formatter_class=argparse.RawDescriptionHelpFormatter` |
| 中文参数乱码 | Windows 终端运行 `chcp 65001` 切换 UTF-8 |
| 子命令不工作 | 检查 `dest="command"` 是否正确设置 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| CLI | 命令行界面 | 用文字操作程序 |
| argparse | 标准库 CLI 框架 | "够用但不优雅" |
| click | 第三方 CLI 框架 | "优雅且功能强大" |
| 位置参数 | 必须提供的参数 | "不加任何标志直接输入" |
| 可选参数 | 可以省略的参数 | "用 --xxx 指定" |
| 子命令 | 主命令下的子功能 | "git commit" 中的 "commit" |
| 帮助信息 | `--help` 显示的说明 | 工具的"使用说明书" |

---

### ✅ 验收清单

- [ ] 能用 argparse 创建带子命令的 CLI 工具
- [ ] 能用 click 创建优雅的 CLI 工具
- [ ] 理解位置参数和可选参数的区别
- [ ] 能为 CLI 工具编写清晰的帮助信息
- [ ] 运行了所有代码区的示例代码

---

### 📝 复盘小纸条

> **argparse 和 click 我更喜欢哪个？为什么？**
>
> 
>
> **一个好的 CLI 工具应该具备哪些特点？**
>
> 
>
> **明天我想学什么？**
>
> 

---

### 📥 明日同步接口

- 输入：CLI 工具开发能力已具备
- 输出：准备学习 Python 日志系统
- 关键交接物：能用 argparse 或 click 创建 CLI 工具

---

## 📅 Day 5：Python 日志系统

### 🧭 今日方向
掌握 Python `logging` 模块的使用，学会输出结构化、分级别的日志。

### 🎯 生活比喻
`print` 是"随口说"，`logging` 是"写日记"——有时间戳、有级别、有格式，出了问题能"回放"。

### 📋 今日三件事
1. 理解为什么需要日志系统
2. 掌握 logging 的基本配置
3. 学会在项目中规范使用日志

---

### 🗺️ 手把手路线

#### 第一步：理解日志级别

**做什么**：记住 5 个日志级别的含义和使用场景。

**为什么**：不同级别的日志有不同的用途——调试用 DEBUG，正常运行用 INFO，出问题用 WARNING/ERROR。

**成功标志**：能说出每个级别适合什么场景。

---

#### 第二步：配置日志系统

**做什么**：运行代码区中的日志配置示例，学会自定义格式和输出目标。

**为什么**：默认配置太简陋，实际项目需要自定义格式、输出到文件、按大小轮转等。

**成功标志**：能配置带时间戳、级别、模块名的日志格式。

---

#### 第三步：在项目中使用日志

**做什么**：将之前的 `print` 语句替换为 `logging` 调用。

**为什么**：日志是程序的"黑匣子"，出了问题能回溯。

**成功标志**：能用日志替代所有 `print` 语句。

---

### 💻 代码区

```python
# logging_basics.py —— Python 日志系统

import logging        # 日志标准库
import sys

# === 基本配置 ===
logging.basicConfig(
    level=logging.DEBUG,                    # 最低日志级别
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",  # 格式
    datefmt="%Y-%m-%d %H:%M:%S",           # 时间格式
    handlers=[
        logging.StreamHandler(sys.stdout),  # 输出到终端
    ]
)

# 创建 logger
logger = logging.getLogger("agent_factory")  # 创建命名 logger

# === 日志级别演示 ===
def demonstrate_levels():
    """演示 5 个日志级别的使用"""
    logger.debug("🔍 调试信息 - 用于开发时的详细排查")
    logger.info("ℹ️  运行信息 - 程序正常运行的关键节点")
    logger.warning("⚠️  警告信息 - 不影响运行但需要注意")
    logger.error("❌ 错误信息 - 某个功能执行失败")
    logger.critical("💀 严重错误 - 程序可能无法继续运行")

# === 实际使用示例 ===
def process_user_data(user_data: dict) -> dict:
    """
    处理用户数据的函数（展示日志的实际使用）
    
    参数:
        user_data: 用户原始数据
    返回:
        处理后的数据
    """
    logger.info(f"开始处理用户数据: {user_data.get('name', '未知')}")
    
    # 数据验证
    if not user_data.get("name"):
        logger.warning("用户数据缺少 name 字段，使用默认值")
        user_data["name"] = "匿名用户"
    
    if not user_data.get("age"):
        logger.error("用户数据缺少 age 字段，无法处理")
        raise ValueError("age 字段是必需的")
    
    # 处理数据
    try:
        result = {
            "name": user_data["name"].strip(),      # 去除首尾空格
            "age": int(user_data["age"]),            # 转换为整数
            "is_adult": int(user_data["age"]) >= 18, # 判断是否成年
        }
        logger.info(f"数据处理完成: {result}")
        return result
    except (ValueError, TypeError) as e:
        logger.error(f"数据处理失败: {e}", exc_info=True)  # exc_info 记录堆栈
        raise

# === 高级配置：输出到文件 ===
def setup_file_logging():
    """配置日志同时输出到文件和终端"""
    from logging.handlers import RotatingFileHandler
    
    # 获取根 logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    
    # 文件 handler（最大 5MB，保留 3 个备份）
    file_handler = RotatingFileHandler(
        "app.log",
        maxBytes=5*1024*1024,  # 5MB
        backupCount=3,
        encoding="utf-8"
    )
    file_handler.setLevel(logging.WARNING)  # 文件只记录 WARNING 及以上
    
    # 终端 handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)  # 终端显示 INFO 及以上
    
    # 格式
    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s:%(lineno)d - %(message)s"
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

# === 运行示例 ===
if __name__ == "__main__":
    # 演示日志级别
    demonstrate_levels()
    
    print("\n--- 处理用户数据 ---")
    # 正常数据
    process_user_data({"name": "张三", "age": 25})
    
    # 缺少 name
    process_user_data({"age": 20})
    
    # 缺少 age（会报错）
    try:
        process_user_data({"name": "李四"})
    except ValueError as e:
        logger.info(f"预期的错误: {e}")
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| 日志没有输出 | 检查 `basicConfig` 是否在第一次日志调用前执行 |
| 日志重复输出 | 检查是否多次调用 `basicConfig`，或 logger 有多个 handler |
| 文件日志乱码 | 确保 `encoding="utf-8"` 参数正确设置 |
| 日志太多太杂 | 使用 `logging.getLogger("具体模块名")` 分模块管理 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| DEBUG | 调试级别 | 开发时的"详细记录" |
| INFO | 信息级别 | 正常运行的"关键节点" |
| WARNING | 警告级别 | "注意，有点不对劲" |
| ERROR | 错误级别 | "出事了，但还能活" |
| CRITICAL | 严重级别 | "快不行了！" |
| Logger | 日志记录器 | "日记本" |
| Handler | 日志处理器 | "日记的去向"（文件/终端） |
| Formatter | 日志格式器 | "日记的格式模板" |
| exc_info | 记录异常堆栈 | "把错误的完整信息记下来" |

---

### ✅ 验收清单

- [ ] 能说出 5 个日志级别的含义
- [ ] 能用 `logging.basicConfig()` 配置日志
- [ ] 能创建命名 logger
- [ ] 能配置日志输出到文件
- [ ] 能用 `exc_info=True` 记录异常堆栈
- [ ] 理解 print 和 logging 的区别

---

### 📝 复盘小纸条

> **日志系统解决了 print 的什么问题？**
>
> 
>
> **在什么场景下用什么日志级别？**
>
> 
>
> **明天我想学什么？**
>
> 

---

### 📥 明日同步接口

- 输入：日志系统已掌握
- 输出：准备学习 Python 测试
- 关键交接物：能在项目中规范使用日志

---

## 📅 Day 6：pytest 测试基础

### 🧭 今日方向
掌握 Python 测试的基本概念和 pytest 的使用，学会为代码编写和运行测试。

### 🎯 生活比喻
测试就像"质检员"——产品出厂前检查每个零件是否合格，确保交付给客户的是好东西。

### 📋 今日三件事
1. 理解为什么需要测试
2. 学会用 pytest 编写单元测试
3. 掌握测试的组织和运行

---

### 🗺️ 手把手路线

#### 第一步：理解测试的价值

**做什么**：思考——如果改了一行代码，怎么确保没有破坏其他功能？

**为什么**：测试是代码质量的保障网，让你敢改代码、敢重构。

**成功标志**：能说出"测试让我改代码时心里有底"。

---

#### 第二步：编写第一个测试

**做什么**：运行代码区中的测试示例，理解 `test_` 开头的函数就是测试用例。

**为什么**：pytest 自动发现 `test_` 开头的函数并执行。

**成功标志**：能运行 `pytest` 并看到测试结果。

---

#### 第三步：测试组织与高级用法

**做什么**：学习 fixture、参数化、测试分组等高级用法。

**为什么**：实际项目的测试需要组织和复用。

**成功标志**：能用 fixture 共享测试资源，用参数化减少重复代码。

---

### 💻 代码区

```python
# src/calculator.py —— 被测试的代码

def add(a: float, b: float) -> float:
    """两数相加"""
    return a + b

def divide(a: float, b: float) -> float:
    """两数相除"""
    if b == 0:
        raise ValueError("除数不能为零")
    return a / b

def is_even(n: int) -> bool:
    """判断是否为偶数"""
    return n % 2 == 0

def process_numbers(numbers: list[int]) -> dict:
    """
    处理数字列表，返回统计信息
    
    参数:
        numbers: 整数列表
    返回:
        包含统计信息的字典
    """
    if not numbers:
        return {"count": 0, "sum": 0, "average": 0}
    
    return {
        "count": len(numbers),
        "sum": sum(numbers),
        "average": sum(numbers) / len(numbers),
    }
```

```python
# tests/test_calculator.py —— 测试用例

import pytest                        # 测试框架
import sys
import os

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.calculator import add, divide, is_even, process_numbers

# === 基本测试 ===
def test_add_positive():
    """测试两个正数相加"""
    assert add(2, 3) == 5           # assert 断言：条件为真则通过

def test_add_negative():
    """测试负数相加"""
    assert add(-1, -1) == -2

def test_add_zero():
    """测试加零"""
    assert add(5, 0) == 5

# === 测试异常 ===
def test_divide_by_zero():
    """测试除以零应抛出异常"""
    with pytest.raises(ValueError, match="除数不能为零"):
        divide(10, 0)

# === 参数化测试（减少重复代码）===
@pytest.mark.parametrize("a, b, expected", [
    (1, 1, 2),          # 测试用例 1
    (2, 3, 5),          # 测试用例 2
    (-1, 1, 0),         # 测试用例 3
    (0, 0, 0),          # 测试用例 4
    (100, -100, 0),     # 测试用例 5
])
def test_add_parametrized(a: int, b: int, expected: int):
    """参数化测试 add 函数"""
    assert add(a, b) == expected

# === Fixture（测试前的准备工作）===
@pytest.fixture
def sample_numbers():
    """提供测试用的数字列表"""
    return [1, 2, 3, 4, 5]

def test_process_numbers_count(sample_numbers):
    """测试数字处理 - 数量"""
    result = process_numbers(sample_numbers)
    assert result["count"] == 5

def test_process_numbers_sum(sample_numbers):
    """测试数字处理 - 总和"""
    result = process_numbers(sample_numbers)
    assert result["sum"] == 15

def test_process_numbers_average(sample_numbers):
    """测试数字处理 - 平均值"""
    result = process_numbers(sample_numbers)
    assert result["average"] == 3.0

# === 测试空列表 ===
def test_process_empty_list():
    """测试空列表的处理"""
    result = process_numbers([])
    assert result["count"] == 0
    assert result["sum"] == 0
    assert result["average"] == 0

# === fixture: 临时文件 ===
@pytest.fixture
def temp_file(tmp_path):
    """创建临时文件用于测试"""
    file = tmp_path / "test_data.txt"
    file.write_text("hello\nworld\n", encoding="utf-8")
    return file

def test_read_file(temp_file):
    """测试读取文件"""
    content = temp_file.read_text(encoding="utf-8")
    assert "hello" in content
    assert "world" in content
```

运行测试：
```bash
# 运行所有测试
pytest

# 运行指定文件
pytest tests/test_calculator.py

# 运行带详细输出
pytest -v

# 运行指定测试函数
pytest tests/test_calculator.py::test_add_positive

# 显示测试覆盖率（需要 pip install pytest-cov）
pytest --cov=src --cov-report=term-missing
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| `pytest` 未找到 | 运行 `pip install pytest` |
| 测试找不到模块 | 检查 `sys.path` 配置，或在项目根目录运行 |
| `AssertionError` | 说明测试不通过，检查代码逻辑是否正确 |
| fixture 不生效 | 确保 fixture 函数名作为参数传入测试函数 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| 单元测试 | 测试最小功能单元 | "检查每个零件" |
| pytest | Python 测试框架 | "质检员的工作手册" |
| assert | 断言语句 | "检查是否合格的标准" |
| fixture | 测试前置/后置操作 | "质检前的准备工作" |
| 参数化 | 用不同数据运行同一测试 | "用不同批次检查同一条线" |
| 覆盖率 | 测试覆盖了多少代码 | "检查了多少个零件" |
| 测试用例 | 一个具体的测试场景 | "一次质检操作" |
| 红绿重构 | 先写失败测试 → 让它通过 → 优化代码 | "测试驱动开发" |

---

### ✅ 验收清单

- [ ] 能用 pytest 运行测试
- [ ] 能编写带 `assert` 的测试用例
- [ ] 能用 `pytest.raises` 测试异常
- [ ] 能用参数化减少重复测试代码
- [ ] 能用 fixture 共享测试资源
- [ ] 所有测试用例通过

---

### 📝 复盘小纸条

> **测试给我带来的安全感体现在哪里？**
>
> 
>
> **什么代码最值得写测试？**
>
> 
>
> **明天我想学什么？**
>
> 

---

### 📥 明日同步接口

- 输入：pytest 测试基础已掌握
- 输出：准备进行周复盘和总结
- 关键交接物：能为代码编写和运行测试

---

## 📅 Day 7：周复盘 + 项目整合

### 🧭 今日方向
回顾 Week 1 的所有内容，整合成一个完整的项目，确保知识串联。

### 🎯 生活比喻
今天我们把一周学的所有"零件"组装成一台"完整的机器"——一个有虚拟环境、日志、测试、CLI 的 Python 项目。

### 📋 今日三件事
1. 回顾本周 6 天的所有学习内容
2. 整合所有知识到一个完整项目
3. 在 Obsidian 中写下周复盘笔记

---

### 🗺️ 手把手路线

#### 第一步：回顾知识

**做什么**：打开 Obsidian 知识库，快速翻阅本周创建的所有笔记。

**为什么**：复习是学习之母，快速回顾能巩固记忆。

**成功标志**：对每个概念都能想起大概含义和使用场景。

---

#### 第二步：项目整合

**做什么**：运行下方的整合项目代码，把虚拟环境、日志、测试、CLI 全部串起来。

**为什么**：单独的知识点不如串联的项目有价值。

**成功标志**：项目能正常运行，所有功能（CLI、日志、测试）都工作正常。

---

#### 第三步：写下复盘

**做什么**：在 Obsidian 中创建本周复盘笔记，回答下方的复盘问题。

**为什么**：输出倒逼输入，写下来才是真正的掌握。

**成功标志**：完成一篇完整的周复盘笔记。

---

### 💻 代码区：Week 1 整合项目

```python
# src/__init__.py —— 包初始化文件（空文件即可）

# src/greeter.py —— 核心业务逻辑

import logging

logger = logging.getLogger(__name__)

class Greeter:
    """问候生成器 —— Week 1 整合示例"""
    
    def __init__(self, language: str = "zh"):
        """
        初始化问候生成器
        
        参数:
            language: 语言代码（zh/en/ja）
        """
        self.language = language
        self.greetings = {
            "zh": "你好",
            "en": "Hello",
            "ja": "こんにちは",
        }
        logger.info(f"初始化 Greeter，语言: {language}")
    
    def greet(self, name: str) -> str:
        """
        生成问候语
        
        参数:
            name: 要问候的人的名字
        返回:
            问候字符串
        """
        greeting = self.greetings.get(self.language, "Hello")
        result = f"{greeting}, {name}!"
        logger.info(f"生成问候: {result}")
        return result
    
    def batch_greet(self, names: list[str]) -> list[str]:
        """
        批量生成问候语
        
        参数:
            names: 名字列表
        返回:
            问候语列表
        """
        logger.info(f"批量生成 {len(names)} 条问候")
        return [self.greet(name) for name in names]
```

```python
# src/cli.py —— CLI 入口

import argparse
import logging
from greeter import Greeter

def setup_logging(verbose: bool = False):
    """配置日志"""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )

def main():
    parser = argparse.ArgumentParser(description="Agent Factory - 问候工具")
    parser.add_argument("--name", "-n", default="World", help="名字")
    parser.add_argument("--language", "-l", default="zh", choices=["zh", "en", "ja"])
    parser.add_argument("--verbose", "-v", action="store_true", help="详细日志")
    args = parser.parse_args()
    
    setup_logging(args.verbose)
    
    greeter = Greeter(language=args.language)
    print(greeter.greet(args.name))

if __name__ == "__main__":
    main()
```

```python
# tests/test_greeter.py —— 测试用例

import pytest
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.greeter import Greeter

@pytest.fixture
def zh_greeter():
    """中文问候生成器"""
    return Greeter(language="zh")

@pytest.fixture
def en_greeter():
    """英文问候生成器"""
    return Greeter(language="en")

def test_zh_greet(zh_greeter):
    """测试中文问候"""
    assert zh_greeter.greet("小明") == "你好, 小明!"

def test_en_greet(en_greeter):
    """测试英文问候"""
    assert en_greeter.greet("Alice") == "Hello, Alice!"

def test_batch_greet(zh_greeter):
    """测试批量问候"""
    names = ["小明", "小红", "小刚"]
    results = zh_greeter.batch_greet(names)
    assert len(results) == 3
    assert "小明" in results[0]

def test_unknown_language():
    """测试未知语言回退"""
    greeter = Greeter(language="xx")
    # 未知语言应回退到 "Hello"
    assert "Hello" in greeter.greet("test")
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| 模块导入失败 | 检查 `__init__.py` 文件是否存在，`sys.path` 是否正确 |
| 测试找不到代码 | 在项目根目录运行 `pytest`，或配置 `sys.path` |
| 日志输出混乱 | 使用命名 logger，避免使用 root logger |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| 项目整合 | 把各部分知识串联 | "组装完整机器" |
| 代码复用 | 同一代码多处使用 | "一次编写，到处运行" |
| 模块化 | 把代码拆成独立模块 | "分而治之" |
| 关注点分离 | 每个模块负责一件事 | "各司其职" |

---

### ✅ 验收清单

- [ ] 回顾了本周所有学习笔记
- [ ] 整合项目运行正常
- [ ] 测试全部通过
- [ ] CLI 工具能正常使用
- [ ] 在 Obsidian 中创建了周复盘笔记
- [ ] 能用自己的话说出 Week 1 的核心收获

---

### 📝 复盘小纸条

> **Week 1 最大的收获是什么？**
>
> 
>
> **哪个知识点还需要巩固？**
>
> 
>
> **我对 Week 2（FastAPI）的期待是什么？**
>
> 

---

### 📥 明日同步接口

- 输入：Week 1 全部完成
- 输出：正式进入 Week 2 FastAPI 学习
- 关键交接物：完整的 Python 工程化知识 + HTTP 基础 + asyncio + CLI + 日志 + 测试
