# 📅 Week 1 Day 2：HTTP 协议 + requests/httpx

## 🧭 今日方向
> 今天我们将深入理解 HTTP 协议，并学习如何使用 Python 的 requests 和 httpx 库进行网络请求。这是与大模型 API 交互的基础。

## 🎯 生活比喻
> HTTP 就像寄快递：请求是包裹，响应是回执。requests 是普通快递，httpx 是高铁快递（支持异步）。

## 📋 今日三件事
1. 理解 HTTP 协议的基本概念
2. 使用 requests 库发送 HTTP 请求
3. 学习 httpx 库及其异步支持

## 🗺️ 手把手路线

### Step 1: HTTP 协议基础
- **做什么**: 学习 HTTP 方法、状态码、请求/响应结构
- **为什么**: 理解协议才能更好地使用 API
- **成功标志**: 能解释 GET/POST 的区别，识别常见状态码

### Step 2: requests 库实战
- **做什么**: 使用 requests 发送各种 HTTP 请求
- **为什么**: requests 是最常用的 HTTP 客户端库
- **成功标志**: 能完成 GET/POST 请求并处理响应

### Step 3: httpx 异步请求
- **做什么**: 学习 httpx 的同步和异步用法
- **为什么**: 异步请求能提高并发性能
- **成功标志**: 能使用 httpx 发送异步请求

## 💻 代码区

```python
# requests 库基础用法

import requests
import json

# 1. GET 请求
def basic_get_request():
    """基础 GET 请求"""
    # 获取 GitHub API 信息
    response = requests.get("https://api.github.com")
    
    print(f"状态码: {response.status_code}")
    print(f"响应头: {dict(response.headers)}")
    print(f"响应内容: {response.json()}")
    
    return response

# 2. 带参数的 GET 请求
def get_with_params():
    """带查询参数的 GET 请求"""
    url = "https://httpbin.org/get"
    params = {
        "name": "张三",
        "age": 25,
        "city": "北京"
    }
    
    response = requests.get(url, params=params)
    print(f"请求 URL: {response.url}")
    print(f"响应: {response.json()}")
    
    return response

# 3. POST 请求
def post_request():
    """发送 POST 请求"""
    url = "https://httpbin.org/post"
    
    # JSON 数据
    json_data = {
        "name": "李四",
        "message": "你好世界",
        "numbers": [1, 2, 3, 4, 5]
    }
    
    response = requests.post(url, json=json_data)
    print(f"状态码: {response.status_code}")
    print(f"服务器收到的数据: {response.json()['json']}")
    
    return response

# 4. 自定义请求头
def custom_headers():
    """自定义请求头"""
    url = "https://httpbin.org/headers"
    
    headers = {
        "User-Agent": "Agent-Factory/1.0",
        "Authorization": "Bearer your-token-here",
        "Content-Type": "application/json"
    }
    
    response = requests.get(url, headers=headers)
    print(f"服务器收到的头信息: {response.json()['headers']}")
    
    return response

# 5. 错误处理
def error_handling():
    """请求错误处理"""
    try:
        # 故意访问不存在的 URL
        response = requests.get("https://httpbin.org/status/404", timeout=5)
        response.raise_for_status()  # 如果状态码不是 2xx，抛出异常
    except requests.exceptions.HTTPError as e:
        print(f"HTTP 错误: {e}")
    except requests.exceptions.ConnectionError as e:
        print(f"连接错误: {e}")
    except requests.exceptions.Timeout as e:
        print(f"超时错误: {e}")
    except requests.exceptions.RequestException as e:
        print(f"请求错误: {e}")

# 6. 会话对象
def session_example():
    """使用会话对象保持连接"""
    with requests.Session() as session:
        # 设置默认头
        session.headers.update({
            "User-Agent": "Agent-Factory/1.0"
        })
        
        # 第一次请求
        response1 = session.get("https://httpbin.org/cookies/set/session_id/abc123")
        print(f"设置 cookie: {response1.json()}")
        
        # 第二次请求（自动携带 cookie）
        response2 = session.get("https://httpbin.org/cookies")
        print(f"获取 cookie: {response2.json()}")

if __name__ == "__main__":
    print("=== 1. 基础 GET 请求 ===")
    basic_get_request()
    
    print("\n=== 2. 带参数的 GET 请求 ===")
    get_with_params()
    
    print("\n=== 3. POST 请求 ===")
    post_request()
    
    print("\n=== 4. 自定义请求头 ===")
    custom_headers()
    
    print("\n=== 5. 错误处理 ===")
    error_handling()
    
    print("\n=== 6. 会话对象 ===")
    session_example()
```

```python
# httpx 库 - 同步和异步用法

import httpx
import asyncio
import time

# 1. 同步请求
def sync_httpx_example():
    """httpx 同步请求"""
    print("=== httpx 同步请求 ===")
    
    with httpx.Client() as client:
        # GET 请求
        response = client.get("https://httpbin.org/get")
        print(f"状态码: {response.status_code}")
        print(f"响应时间: {response.elapsed.total_seconds():.3f} 秒")
        
        # POST 请求
        response = client.post(
            "https://httpbin.org/post",
            json={"message": "Hello from httpx"}
        )
        print(f"POST 响应: {response.json()['json']}")

# 2. 异步请求
async def async_httpx_example():
    """httpx 异步请求"""
    print("\n=== httpx 异步请求 ===")
    
    async with httpx.AsyncClient() as client:
        # 异步 GET 请求
        response = await client.get("https://httpbin.org/get")
        print(f"异步 GET 状态码: {response.status_code}")
        
        # 异步 POST 请求
        response = await client.post(
            "https://httpbin.org/post",
            json={"message": "Hello async httpx"}
        )
        print(f"异步 POST 响应: {response.json()['json']}")

# 3. 并发请求
async def concurrent_requests():
    """并发多个请求"""
    print("\n=== 并发请求 ===")
    
    urls = [
        "https://httpbin.org/delay/1",
        "https://httpbin.org/delay/2",
        "https://httpbin.org/delay/1",
    ]
    
    start_time = time.time()
    
    async with httpx.AsyncClient() as client:
        # 创建任务列表
        tasks = [client.get(url) for url in urls]
        
        # 并发执行
        responses = await asyncio.gather(*tasks)
        
        for i, response in enumerate(responses):
            print(f"请求 {i+1}: 状态码 {response.status_code}")
    
    end_time = time.time()
    print(f"总耗时: {end_time - start_time:.3f} 秒")

# 4. 超时和重试
def timeout_retry_example():
    """超时和重试配置"""
    print("\n=== 超时和重试 ===")
    
    # 设置超时
    client = httpx.Client(
        timeout=httpx.Timeout(5.0),  # 5秒超时
        limits=httpx.Limits(
            max_connections=10,
            max_keepalive_connections=5
        )
    )
    
    try:
        response = client.get("https://httpbin.org/delay/3")
        print(f"响应: {response.status_code}")
    except httpx.TimeoutException:
        print("请求超时")
    finally:
        client.close()

# 5. 文件上传
async def file_upload_example():
    """文件上传示例"""
    print("\n=== 文件上传 ===")
    
    # 创建临时文件
    with open("test_file.txt", "w") as f:
        f.write("这是测试文件内容")
    
    async with httpx.AsyncClient() as client:
        with open("test_file.txt", "rb") as f:
            files = {"file": ("test_file.txt", f, "text/plain")}
            response = await client.post(
                "https://httpbin.org/post",
                files=files
            )
            print(f"上传响应: {response.status_code}")
    
    # 清理临时文件
    import os
    os.remove("test_file.txt")

if __name__ == "__main__":
    # 同步示例
    sync_httpx_example()
    timeout_retry_example()
    
    # 异步示例
    asyncio.run(async_httpx_example())
    asyncio.run(concurrent_requests())
    asyncio.run(file_upload_example())
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 连接超时 | 检查网络，增加 timeout 参数，或使用代理 |
| 2 | SSL 证书错误 | 临时解决方案：`verify=False`（不推荐生产使用） |
| 3 | 编码问题 | 检查响应编码：`response.encoding = 'utf-8'` |
| 4 | 异步请求报错 | 确保在 async 函数中使用 await，事件循环正确 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| HTTP | 超文本传输协议，Web 的基础协议 |
| GET | 获取资源的 HTTP 方法 |
| POST | 提交数据的 HTTP 方法 |
| 状态码 | 表示请求结果的数字代码（如 200, 404） |
| 请求头 | 请求的元数据信息 |
| JSON | 轻量级数据交换格式 |
| 异步 | 不阻塞主线程的并发执行方式 |
| 会话 | 保持连接状态的请求对象 |

## ✅ 验收清单
- [ ] 理解 HTTP 协议的基本概念
- [ ] 能使用 requests 发送 GET/POST 请求
- [ ] 能处理 HTTP 响应和错误
- [ ] 理解 httpx 的异步用法

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
