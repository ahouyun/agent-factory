# 📅 Week 1 Day 4：异步编程 asyncio + 并发调用

## 🧭 今日方向
> 今天我们将学习 Python 的异步编程，掌握 asyncio 的核心概念，以及如何在 AI Agent 开发中应用并发技术。

## 🎯 生活比喻
> 异步编程就像同时做多件事：你可以一边煮咖啡，一边烤面包，而不是等咖啡煮好再烤面包。asyncio 就是那个帮你安排任务的"调度员"。

## 📋 今日三件事
1. 理解异步编程的基本概念
2. 掌握 asyncio 的核心用法
3. 实践并发 API 调用

## 🗺️ 手把手路线

### Step 1: 异步编程基础
- **做什么**: 理解同步 vs 异步、阻塞 vs 非阻塞
- **为什么**: 异步是提高程序效率的关键技术
- **成功标志**: 能解释异步编程的优势

### Step 2: asyncio 核心语法
- **做什么**: 学习 async/await、事件循环、协程
- **为什么**: 这是 Python 异步编程的基础
- **成功标志**: 能编写基本的异步程序

### Step 3: 并发 API 调用
- **做什么**: 使用 asyncio 并发调用多个 API
- **为什么**: 提高 AI Agent 的响应速度
- **成功标志**: 能同时发起多个 API 请求

## 💻 代码区

```python
# 异步编程基础

import asyncio
import time
from typing import List

# 1. 同步 vs 异步对比
def sync_example():
    """同步示例：串行执行"""
    print("=== 同步示例 ===")
    
    start_time = time.time()
    
    def slow_task(name: str, duration: int):
        print(f"开始任务: {name}")
        time.sleep(duration)  # 模拟耗时操作
        print(f"完成任务: {name}")
    
    # 串行执行
    slow_task("任务1", 2)
    slow_task("任务2", 2)
    slow_task("任务3", 2)
    
    end_time = time.time()
    print(f"总耗时: {end_time - start_time:.2f} 秒\n")

async def async_example():
    """异步示例：并发执行"""
    print("=== 异步示例 ===")
    
    start_time = time.time()
    
    async def slow_task(name: str, duration: int):
        print(f"开始任务: {name}")
        await asyncio.sleep(duration)  # 异步等待
        print(f"完成任务: {name}")
    
    # 并发执行
    await asyncio.gather(
        slow_task("任务1", 2),
        slow_task("任务2", 2),
        slow_task("任务3", 2)
    )
    
    end_time = time.time()
    print(f"总耗时: {end_time - start_time:.2f} 秒")

# 2. 协程基础
async def coroutine_example():
    """协程基础示例"""
    print("\n=== 协程基础 ===")
    
    async def fetch_data(url: str, delay: int) -> str:
        """模拟异步数据获取"""
        print(f"开始获取: {url}")
        await asyncio.sleep(delay)  # 模拟网络请求
        return f"从 {url} 获取的数据"
    
    # 顺序执行
    result1 = await fetch_data("http://api1.com", 1)
    result2 = await fetch_data("http://api2.com", 1)
    print(f"顺序结果: {result1}, {result2}")
    
    # 并发执行
    results = await asyncio.gather(
        fetch_data("http://api3.com", 1),
        fetch_data("http://api4.com", 1)
    )
    print(f"并发结果: {results}")

# 3. 任务管理
async def task_management():
    """任务管理示例"""
    print("\n=== 任务管理 ===")
    
    async def worker(name: str, work_time: int):
        """工作进程"""
        print(f"工人 {name} 开始工作")
        await asyncio.sleep(work_time)
        print(f"工人 {name} 完成工作")
        return f"{name} 的工作成果"
    
    # 创建任务
    tasks = [
        asyncio.create_task(worker("Alice", 2)),
        asyncio.create_task(worker("Bob", 1)),
        asyncio.create_task(worker("Charlie", 3))
    ]
    
    # 等待所有任务完成
    results = await asyncio.gather(*tasks)
    print(f"所有结果: {results}")

if __name__ == "__main__":
    # 运行同步示例
    sync_example()
    
    # 运行异步示例
    asyncio.run(async_example())
    asyncio.run(coroutine_example())
    asyncio.run(task_management())
```

```python
# 并发 API 调用实战

import asyncio
import httpx
import time
from typing import List, Dict
from dataclasses import dataclass

@dataclass
class APIResponse:
    """API 响应数据类"""
    url: str
    status_code: int
    data: Dict
    response_time: float

async def fetch_api_data(
    client: httpx.AsyncClient,
    url: str,
    delay: float = 0.1
) -> APIResponse:
    """
    异步获取 API 数据
    
    Args:
        client: httpx 异步客户端
        url: API URL
        delay: 模拟延迟
        
    Returns:
        API 响应对象
    """
    start_time = time.time()
    
    try:
        # 模拟 API 请求
        await asyncio.sleep(delay)
        
        # 实际请求（取消注释使用真实 API）
        # response = await client.get(url)
        # return APIResponse(
        #     url=url,
        #     status_code=response.status_code,
        #     data=response.json(),
        #     response_time=time.time() - start_time
        # )
        
        # 模拟响应
        return APIResponse(
            url=url,
            status_code=200,
            data={"message": f"来自 {url} 的数据"},
            response_time=time.time() - start_time
        )
    
    except Exception as e:
        return APIResponse(
            url=url,
            status_code=500,
            data={"error": str(e)},
            response_time=time.time() - start_time
        )

async def concurrent_api_calls(urls: List[str]) -> List[APIResponse]:
    """
    并发调用多个 API
    
    Args:
        urls: API URL 列表
        
    Returns:
        响应列表
    """
    async with httpx.AsyncClient() as client:
        # 创建任务列表
        tasks = [fetch_api_data(client, url) for url in urls]
        
        # 并发执行
        responses = await asyncio.gather(*tasks)
        
        return responses

async def rate_limited_concurrent_calls(
    urls: List[str],
    max_concurrent: int = 5
) -> List[APIResponse]:
    """
    带并发限制的 API 调用
    
    Args:
        urls: API URL 列表
        max_concurrent: 最大并发数
        
    Returns:
        响应列表
    """
    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def limited_fetch(client: httpx.AsyncClient, url: str):
        async with semaphore:
            return await fetch_api_data(client, url)
    
    async with httpx.AsyncClient() as client:
        tasks = [limited_fetch(client, url) for url in urls]
        responses = await asyncio.gather(*tasks)
        return responses

# 实战示例：并发获取多个用户信息
async def fetch_user_profiles(user_ids: List[int]) -> List[Dict]:
    """并发获取多个用户信息"""
    
    async def fetch_user(user_id: int) -> Dict:
        # 模拟 API 调用
        await asyncio.sleep(0.1)
        return {
            "id": user_id,
            "name": f"用户{user_id}",
            "email": f"user{user_id}@example.com"
        }
    
    tasks = [fetch_user(user_id) for user_id in user_ids]
    users = await asyncio.gather(*tasks)
    return users

if __name__ == "__main__":
    # 测试并发 API 调用
    urls = [
        "https://api.example.com/user1",
        "https://api.example.com/user2",
        "https://api.example.com/user3",
        "https://api.example.com/user4",
        "https://api.example.com/user5"
    ]
    
    print("=== 并发 API 调用 ===")
    start_time = time.time()
    
    responses = asyncio.run(concurrent_api_calls(urls))
    
    for response in responses:
        print(f"URL: {response.url}, 状态: {response.status_code}, 耗时: {response.response_time:.3f}s")
    
    total_time = time.time() - start_time
    print(f"总耗时: {total_time:.3f} 秒")
    
    # 测试带限制的并发调用
    print("\n=== 带并发限制的调用 ===")
    responses = asyncio.run(rate_limited_concurrent_calls(urls, max_concurrent=2))
    
    for response in responses:
        print(f"URL: {response.url}, 状态: {response.status_code}")
```

```python
# 异步上下文管理器和生成器

import asyncio
from typing import AsyncGenerator, AsyncContextManager
from contextlib import asynccontextmanager

# 1. 异步上下文管理器
class AsyncDatabaseConnection:
    """异步数据库连接示例"""
    
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.connection = None
    
    async def __aenter__(self):
        """异步进入上下文"""
        print(f"连接到数据库: {self.db_url}")
        await asyncio.sleep(0.1)  # 模拟连接耗时
        self.connection = {"status": "connected", "url": self.db_url}
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步退出上下文"""
        print("关闭数据库连接")
        await asyncio.sleep(0.1)  # 模拟关闭耗时
        self.connection = None
        return False  # 不抑制异常
    
    async def query(self, sql: str):
        """执行查询"""
        if not self.connection:
            raise RuntimeError("数据库未连接")
        await asyncio.sleep(0.05)
        return {"sql": sql, "result": "查询结果"}

@asynccontextmanager
async def async_file_handler(filename: str):
    """异步文件处理器（使用装饰器）"""
    print(f"打开文件: {filename}")
    await asyncio.sleep(0.1)
    
    file_handler = {"filename": filename, "mode": "r"}
    
    try:
        yield file_handler
    finally:
        print(f"关闭文件: {filename}")
        await asyncio.sleep(0.1)

# 2. 异步生成器
async def async_number_generator(start: int, end: int) -> AsyncGenerator[int, None]:
    """异步数字生成器"""
    for i in range(start, end):
        await asyncio.sleep(0.1)  # 模拟异步操作
        yield i

async def async_data_stream():
    """异步数据流处理"""
    async for number in async_number_generator(1, 10):
        print(f"处理数字: {number}")

# 3. 异步迭代器
class AsyncDataProcessor:
    """异步数据处理器"""
    
    def __init__(self, data: list):
        self.data = data
        self.index = 0
    
    def __aiter__(self):
        return self
    
    async def __anext__(self):
        if self.index >= len(self.data):
            raise StopAsyncIteration
        
        await asyncio.sleep(0.1)  # 模拟异步处理
        item = self.data[self.index]
        self.index += 1
        return item

async def process_async_iterator():
    """使用异步迭代器"""
    data = [1, 2, 3, 4, 5]
    processor = AsyncDataProcessor(data)
    
    async for item in processor:
        print(f"处理项目: {item}")

if __name__ == "__main__":
    # 测试异步上下文管理器
    async def test_context_manager():
        async with AsyncDatabaseConnection("sqlite:///test.db") as db:
            result = await db.query("SELECT * FROM users")
            print(f"查询结果: {result}")
        
        async with async_file_handler("test.txt") as f:
            print(f"处理文件: {f}")
    
    asyncio.run(test_context_manager())
    
    # 测试异步生成器
    asyncio.run(async_data_stream())
    
    # 测试异步迭代器
    asyncio.run(process_async_iterator())
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 协程不执行 | 确保使用 `await` 或 `asyncio.run()` 启动 |
| 2 | 事件循环报错 | 检查是否在异步函数中使用 `await` |
| 3 | 并发任务阻塞 | 使用 `asyncio.gather()` 而不是顺序 `await` |
| 4 | 异步上下文管理器错误 | 实现 `__aenter__` 和 `__aexit__` 方法 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| 协程 | 用 async def 定义的异步函数 |
| 事件循环 | 管理和调度协程的执行器 |
| await | 等待协程完成的关键字 |
| asyncio.gather | 并发执行多个协程 |
| Semaphore | 控制并发数量的信号量 |
| 异步上下文管理器 | 支持 async with 的对象 |
| 异步生成器 | 使用 yield 的异步函数 |

## ✅ 验收清单
- [ ] 理解同步和异步的区别
- [ ] 能编写基本的异步程序
- [ ] 掌握 asyncio.gather 的用法
- [ ] 理解异步上下文管理器

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
