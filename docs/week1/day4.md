# Day 4: 异步编程 asyncio

> 今天的目标：理解 Python 异步编程的核心概念，学会用 asyncio + httpx 并发调用多个 API。这是让 Agent 同时处理多个任务的关键技术。

---

## 1. 为什么要学异步编程？

想象你是一个客服，有 3 个客户同时打来电话：

**同步（一个一个来）**：
1. 接客户 A 的电话，等他讲完（5 分钟）
2. 接客户 B 的电话，等他讲完（3 分钟）
3. 接客户 C 的电话，等他讲完（4 分钟）
4. 总共花了 12 分钟

**异步（同时处理）**：
1. 接客户 A 的电话，他说要等一下查资料
2. 在等的时候，接客户 B 的电话
3. 在等的时候，接客户 C 的电话
4. A 查完了，回来告诉 A
5. 总共花了约 5 分钟

在 AI Agent 开发中，异步编程非常关键：

- 你的 Agent 可能需要同时调用 3 个大模型（OpenAI + Claude + DeepSeek）来比较结果
- 同时查询多个数据库
- 同时处理多个用户的请求

---

## 2. 同步 vs 异步：代码对比

### 2.1 同步代码：一个一个来

```python
"""
Day 4 示例：同步 vs 异步对比
"""

import time
import asyncio

# ============================================
# 同步版本：一个一个执行
# ============================================

def sync_fetch_data(url: str, delay: float) -> str:
    """同步获取数据（模拟网络请求）"""
    print(f"开始获取: {url}")
    time.sleep(delay)  # 同步等待（整个程序卡住）
    print(f"完成获取: {url}")
    return f"来自 {url} 的数据"

def sync_example():
    """同步示例"""
    print("=== 同步版本 ===")
    start = time.time()

    # 串行执行：一个一个来
    result1 = sync_fetch_data("API-1", 2)
    result2 = sync_fetch_data("API-2", 1)
    result3 = sync_fetch_data("API-3", 3)

    end = time.time()
    print(f"结果: {result1}, {result2}, {result3}")
    print(f"总耗时: {end - start:.1f} 秒")  # 应该是 2+1+3=6 秒

sync_example()
```

运行结果：

```
=== 同步版本 ===
开始获取: API-1
完成获取: API-1
开始获取: API-2
完成获取: API-2
开始获取: API-3
完成获取: API-3
结果: 来自 API-1 的数据, 来自 API-2 的数据, 来自 API-3 的数据
总耗时: 6.0 秒
```

### 2.2 异步代码：同时执行

```python
# ============================================
# 异步版本：同时执行
# ============================================

async def async_fetch_data(url: str, delay: float) -> str:
    """异步获取数据（模拟网络请求）"""
    print(f"开始获取: {url}")
    await asyncio.sleep(delay)  # 异步等待（不阻塞其他任务）
    print(f"完成获取: {url}")
    return f"来自 {url} 的数据"

async def async_example():
    """异步示例"""
    print("\n=== 异步版本 ===")
    start = time.time()

    # 并发执行：同时进行
    results = await asyncio.gather(
        async_fetch_data("API-1", 2),
        async_fetch_data("API-2", 1),
        async_fetch_data("API-3", 3)
    )

    end = time.time()
    print(f"结果: {results}")
    print(f"总耗时: {end - start:.1f} 秒")  # 应该是 max(2,1,3)=3 秒

asyncio.run(async_example())
```

运行结果：

```
=== 异步版本 ===
开始获取: API-1
开始获取: API-2
开始获取: API-3
完成获取: API-2
完成获取: API-1
完成获取: API-3
结果: ['来自 API-1 的数据', '来自 API-2 的数据', '来自 API-3 的数据']
总耗时: 3.0 秒
```

> **关键区别**：同步花了 6 秒，异步只花了 3 秒！因为异步是同时发出三个请求，只等最慢的那个。

---

## 3. asyncio 核心概念

### 3.1 什么是协程（Coroutine）？

协程就是用 `async def` 定义的函数。它和普通函数的区别：

```python
# 普通函数
def normal_func():
    return "hello"

# 协程函数
async def async_func():
    return "hello"
```

**关键规则**：
- 协程函数**必须用 `await` 调用**
- 协程函数**必须在异步上下文中运行**

```python
# 错误！这样调用不会执行协程
result = async_func()    # result 是一个协程对象，不是字符串！

# 正确！用 await 调用
result = await async_func()    # result 是 "hello"

# 或者用 asyncio.run() 启动
result = asyncio.run(async_func())    # result 是 "hello"
```

### 3.2 什么是 await？

`await` 的意思是"等待这个异步操作完成"。在等待的时候，**程序可以去执行其他任务**。

```python
async def make_coffee():
    print("开始煮咖啡...")
    await asyncio.sleep(3)    # 等 3 秒，但不阻塞！
    print("咖啡好了！")

async def make_toast():
    print("开始烤面包...")
    await asyncio.sleep(2)    # 等 2 秒，但不阻塞！
    print("面包好了！")

async def main():
    # 同时开始做咖啡和烤面包
    await asyncio.gather(
        make_coffee(),
        make_toast()
    )

asyncio.run(main())
```

输出：

```
开始煮咖啡...
开始烤面包...
面包好了！      <-- 面包先好（2秒）
咖啡好了！      <-- 咖啡后好（3秒）
```

### 3.3 什么是事件循环（Event Loop）？

事件循环就像一个**调度员**，它：

1. 检查有哪些协程需要执行
2. 调度它们执行
3. 当一个协程等待（await）时，切换去执行其他协程
4. 当等待完成时，回来继续执行

```python
# asyncio.run() 就是启动事件循环
asyncio.run(main())
```

### 3.4 asyncio.gather() vs asyncio.create_task()

```python
# ============================================
# 方式 1：asyncio.gather（推荐用于简单场景）
# ============================================

async def main():
    results = await asyncio.gather(
        fetch_data("url1"),
        fetch_data("url2"),
        fetch_data("url3")
    )
    # results 是一个列表，按顺序对应输入

# ============================================
# 方式 2：asyncio.create_task（推荐用于复杂场景）
# ============================================

async def main():
    # 创建任务（任务会立即开始执行）
    task1 = asyncio.create_task(fetch_data("url1"))
    task2 = asyncio.create_task(fetch_data("url2"))
    task3 = asyncio.create_task(fetch_data("url3"))

    # 等待所有任务完成
    results = await asyncio.gather(task1, task2, task3)

    # 在等待过程中，可以做其他事情
    print("所有任务都在进行中...")
```

---

## 4. 用 asyncio + httpx 并发调用 API

### 4.1 并发调用大模型 API

这是实际项目中最常见的场景：

```python
"""
Day 4 示例：并发调用多个大模型 API
"""

import asyncio
import time
import httpx
from typing import List, Dict
from dataclasses import dataclass
from dotenv import load_dotenv
import os

load_dotenv()

@dataclass
class LLMResponse:
    """LLM 响应"""
    provider: str
    content: str
    latency: float
    tokens: int

async def call_openai(
    client: httpx.AsyncClient,
    prompt: str
) -> LLMResponse:
    """异步调用 OpenAI"""
    start = time.time()

    response = await client.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
            "Content-Type": "application/json"
        },
        json={
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 200
        },
        timeout=30.0
    )

    data = response.json()
    latency = time.time() - start

    return LLMResponse(
        provider="OpenAI",
        content=data["choices"][0]["message"]["content"],
        latency=latency,
        tokens=data["usage"]["total_tokens"]
    )

async def call_anthropic(
    client: httpx.AsyncClient,
    prompt: str
) -> LLMResponse:
    """异步调用 Anthropic"""
    start = time.time()

    response = await client.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": os.getenv("ANTHROPIC_API_KEY"),
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        },
        json={
            "model": "claude-sonnet-4-20250514",
            "max_tokens": 200,
            "messages": [{"role": "user", "content": prompt}]
        },
        timeout=30.0
    )

    data = response.json()
    latency = time.time() - start

    return LLMResponse(
        provider="Anthropic",
        content=data["content"][0]["text"],
        latency=latency,
        tokens=data["usage"]["input_tokens"] + data["usage"]["output_tokens"]
    )

async def call_deepseek(
    client: httpx.AsyncClient,
    prompt: str
) -> LLMResponse:
    """异步调用 DeepSeek"""
    start = time.time()

    response = await client.post(
        "https://api.deepseek.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {os.getenv('DEEPSEEK_API_KEY')}",
            "Content-Type": "application/json"
        },
        json={
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 200
        },
        timeout=30.0
    )

    data = response.json()
    latency = time.time() - start

    return LLMResponse(
        provider="DeepSeek",
        content=data["choices"][0]["message"]["content"],
        latency=latency,
        tokens=data["usage"]["total_tokens"]
    )

async def compare_llms(prompt: str) -> List[LLMResponse]:
    """并发调用多个 LLM 并比较结果"""
    print(f"Prompt: {prompt}\n")

    async with httpx.AsyncClient() as client:
        start = time.time()

        # 并发调用三个 LLM
        tasks = [
            call_openai(client, prompt),
            call_anthropic(client, prompt),
            call_deepseek(client, prompt)
        ]

        responses = await asyncio.gather(*tasks, return_exceptions=True)

        total_time = time.time() - start

        # 处理结果
        results = []
        for response in responses:
            if isinstance(response, Exception):
                print(f"错误: {response}")
            else:
                results.append(response)
                print(f"[{response.provider}]")
                print(f"  回复: {response.content[:100]}...")
                print(f"  延迟: {response.latency:.2f}s")
                print(f"  Token: {response.tokens}")
                print()

        print(f"总耗时: {total_time:.2f}s")

        return results

# 运行
if __name__ == "__main__":
    asyncio.run(compare_llms("用一句话解释什么是人工智能"))
```

### 4.2 并发调用的错误处理

当并发调用多个 API 时，某个 API 可能失败。我们需要优雅地处理：

```python
# ============================================
# 带错误处理的并发调用
# ============================================

async def safe_call_api(client, url, payload, provider_name):
    """安全地调用 API（带错误处理）"""
    try:
        response = await client.post(url, json=payload, timeout=30.0)
        response.raise_for_status()
        return {
            "provider": provider_name,
            "success": True,
            "data": response.json()
        }
    except httpx.TimeoutException:
        return {
            "provider": provider_name,
            "success": False,
            "error": "请求超时"
        }
    except httpx.HTTPStatusError as e:
        return {
            "provider": provider_name,
            "success": False,
            "error": f"HTTP 错误: {e.response.status_code}"
        }
    except Exception as e:
        return {
            "provider": provider_name,
            "success": False,
            "error": f"未知错误: {str(e)}"
        }

async def compare_with_error_handling():
    """带错误处理的并发调用"""
    async with httpx.AsyncClient() as client:
        # 创建任务（每个 API 都有错误处理）
        tasks = [
            safe_call_api(client, "https://api.openai.com/v1/chat/completions",
                         {"model": "gpt-4o-mini", "messages": [{"role": "user", "content": "hi"}]},
                         "OpenAI"),
            safe_call_api(client, "https://httpbin.org/delay/1",
                         {}, "SlowAPI"),
            safe_call_api(client, "https://httpbin.org/status/500",
                         {}, "BrokenAPI"),
        ]

        results = await asyncio.gather(*tasks)

        for result in results:
            if result["success"]:
                print(f"{result['provider']}: 成功")
            else:
                print(f"{result['provider']}: 失败 - {result['error']}")

asyncio.run(compare_with_error_handling())
```

输出：

```
OpenAI: 成功
SlowAPI: 成功
BrokenAPI: 失败 - HTTP 错误: 500
```

### 4.3 使用信号量控制并发数量

如果你同时调用 100 个 API，可能会触发限流。用 `Semaphore` 控制同时最多几个：

```python
# ============================================
# 使用 Semaphore 控制并发
# ============================================

async def controlled_concurrent_calls():
    """控制并发数量"""
    # 最多同时 5 个请求
    semaphore = asyncio.Semaphore(5)

    async def limited_fetch(client, url, task_id):
        async with semaphore:  # 获取信号量（限制并发）
            print(f"任务 {task_id} 开始")
            response = await client.get(url)
            print(f"任务 {task_id} 完成")
            return response.status_code

    urls = [f"https://httpbin.org/delay/1" for _ in range(20)]

    async with httpx.AsyncClient() as client:
        tasks = [limited_fetch(client, url, i) for i, url in enumerate(urls)]
        results = await asyncio.gather(*tasks)

    print(f"所有 {len(results)} 个任务完成")

asyncio.run(controlled_concurrent_calls())
```

---

## 5. 常见错误和解决方案

### 错误 1：协程不执行

```python
# 症状：程序什么都不输出

# 原因：忘记 await 或 asyncio.run()

# 错误写法
async def main():
    fetch_data()    # 不会执行！

# 正确写法
async def main():
    await fetch_data()

asyncio.run(main())    # 启动事件循环
```

### 错误 2：在同步函数中调用 await

```python
# 症状：SyntaxError: 'await' outside async function

# 错误写法
def normal_func():
    await asyncio.sleep(1)    # 错误！

# 正确写法
async def async_func():
    await asyncio.sleep(1)
```

### 错误 3：在异步代码中使用 time.sleep

```python
# 症状：程序卡住，无法并发

# 错误写法（time.sleep 会阻塞整个事件循环）
async def bad_func():
    time.sleep(3)    # 阻塞！

# 正确写法
async def good_func():
    await asyncio.sleep(3)    # 异步等待，不阻塞
```

---

## 6. 今日小结

| 知识点 | 要点 |
|--------|------|
| 同步 vs 异步 | 同步一个一个来，异步同时进行 |
| `async def` | 定义协程函数 |
| `await` | 等待异步操作完成 |
| `asyncio.run()` | 启动事件循环 |
| `asyncio.gather()` | 并发执行多个协程 |
| `asyncio.Semaphore` | 控制并发数量 |
| httpx.AsyncClient | 异步 HTTP 客户端 |
| **不要**用 time.sleep | 在异步代码中用 asyncio.sleep |

---

## 7. 课后练习

1. 编写同步和异步版本的程序，对比执行时间
2. 使用 httpx.AsyncClient 并发调用 `https://httpbin.org/delay/1` 10 次，验证并发效果
3. 使用 Semaphore 限制并发数量为 3，调用 10 个 API
4. 尝试用 asyncio.gather 同时调用 OpenAI 和 DeepSeek API（如果有的话）

---

> **明天预告**：Day 5 我们将学习使用 typer 构建命令行工具——这是让你的 Agent 变得更专业、更易用的关键。
