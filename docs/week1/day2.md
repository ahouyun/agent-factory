# Day 2: HTTP 协议 + requests/httpx

> 今天的目标：理解 HTTP 协议的基本原理，学会用 Python 的 requests 和 httpx 库发送网络请求。这是与大模型 API 交互的基础。

---

## 1. 为什么要学这个？

AI Agent 的核心能力之一就是**调用外部 API**。无论是调用大模型（OpenAI、Claude）、查询数据库、还是获取实时信息，本质上都是在发送 HTTP 请求。不理解 HTTP，你就不知道请求为什么失败、响应为什么不对。

---

## 2. 什么是 HTTP？

### 2.1 用一封信来类比

HTTP（HyperText Transfer Protocol，超文本传输协议）就像**寄信**：

| 寄信 | HTTP |
|------|------|
| 你写一封信 | 你构造一个请求 |
| 信封上写地址（寄给谁） | URL（目标服务器地址） |
| 信的内容 | 请求体（body） |
| 信封上的标签（平信/挂号/加急） | HTTP 方法（GET/POST/PUT/DELETE） |
| 邮局把信送到 | 网络传输 |
| 对方回一封信 | 服务器返回响应 |
| 回信的内容 | 响应体（body） |
| 回信上的状态（收到/地址错误/拒收） | 状态码（200/404/403） |

### 2.2 HTTP 请求的结构

一个完整的 HTTP 请求包含四个部分：

```
1. 请求行    -->  方法 + URL + HTTP版本
               POST https://api.example.com/chat HTTP/1.1

2. 请求头    -->  元数据（认证信息、内容类型等）
               Content-Type: application/json
               Authorization: Bearer sk-xxx

3. 空行      -->  分隔请求头和请求体

4. 请求体    -->  发送的数据（GET 请求通常没有）
               {"message": "你好", "model": "gpt-4"}
```

### 2.3 HTTP 响应的结构

```
1. 状态行    -->  HTTP版本 + 状态码 + 状态描述
               HTTP/1.1 200 OK

2. 响应头    -->  元数据
               Content-Type: application/json
               X-Request-Id: abc123

3. 空行

4. 响应体    -->  服务器返回的数据
               {"reply": "你好！有什么可以帮你的？"}
```

### 2.4 四种常用的 HTTP 方法

| 方法 | 用途 | 类比 | 有请求体？ |
|------|------|------|-----------|
| **GET** | 获取数据 | 读信 | 通常没有 |
| **POST** | 发送/创建数据 | 寄一封新信 | 有 |
| **PUT** | 更新数据 | 修改已有的信 | 有 |
| **DELETE** | 删除数据 | 销毁一封信 | 通常没有 |

### 2.5 常见的状态码

| 状态码 | 含义 | 类比 | 你需要做什么 |
|--------|------|------|-------------|
| **200** | 成功 | 信顺利送达，对方回信了 | 处理响应数据 |
| **201** | 创建成功 | 新信已创建 | 处理响应数据 |
| **301** | 永久重定向 | 地址搬迁了，去新地址 | 跟随新 URL |
| **302** | 临时重定向 | 暂时在另一个地址 | 跟随新 URL |
| **400** | 请求错误 | 信写得不清楚 | 检查请求参数 |
| **401** | 未授权 | 没有通行证 | 检查 API Key |
| **403** | 禁止访问 | 有通行证但被拒 | 检查权限 |
| **404** | 未找到 | 地址不存在 | 检查 URL |
| **429** | 请求过多 | 寄信太频繁 | 等待后重试 |
| **500** | 服务器错误 | 对方内部出问题 | 稍后重试或联系客服 |

---

## 3. requests 库：Python HTTP 的瑞士军刀

### 3.1 安装 requests

```bash
# 确保虚拟环境已激活！
pip install requests

# 验证安装
pip show requests
```

### 3.2 第一个 GET 请求

创建文件 `examples/day2_requests.py`，写入以下内容：

```python
"""
Day 2 示例：使用 requests 库发送 HTTP 请求
"""

import requests

# ============================================
# 示例 1：最简单的 GET 请求
# ============================================

print("=== 示例 1：基础 GET 请求 ===")

# 发送 GET 请求
response = requests.get("https://httpbin.org/get")

# 查看状态码
print(f"状态码: {response.status_code}")  # 应该是 200

# 查看响应内容（字符串格式）
# print(f"响应内容: {response.text[:200]}")

# 查看响应内容（字典格式，自动解析 JSON）
data = response.json()
print(f"响应 JSON: {data}")

# 查看响应头
print(f"Content-Type: {response.headers['Content-Type']}")
```

运行结果：

```
=== 示例 1：基础 GET 请求 ===
状态码: 200
响应 JSON: {'headers': {'Accept': '*/*', 'Accept-Encoding': 'gzip, deflate', ...}, ...}
Content-Type: application/json
```

### 3.3 带参数的 GET 请求

```python
# ============================================
# 示例 2：带查询参数的 GET 请求
# ============================================

print("\n=== 示例 2：带查询参数 ===")

# 方法一：直接拼接 URL（不推荐）
# url = "https://httpbin.org/get?name=张三&age=25"

# 方法二：使用 params 参数（推荐）
params = {
    "name": "张三",
    "age": 25,
    "city": "北京"
}

response = requests.get("https://httpbin.org/get", params=params)

print(f"实际请求 URL: {response.url}")
# 输出: https://httpbin.org/get?name=%E5%BC%A0%E4%B8%89&age=25&city=%E5%8C%97%E4%BA%AC
# 注意：中文会被自动 URL 编码

print(f"服务器收到的参数: {response.json()['args']}")
# 输出: {'name': '张三', 'age': '25', 'city': '北京'}
```

### 3.4 POST 请求：发送 JSON 数据

```python
# ============================================
# 示例 3：POST 请求发送 JSON 数据
# ============================================

print("\n=== 示例 3：POST 请求 ===")

# 准备要发送的数据
payload = {
    "name": "李四",
    "message": "你好世界",
    "numbers": [1, 2, 3, 4, 5]
}

# 使用 json 参数（自动设置 Content-Type 为 application/json）
response = requests.post("https://httpbin.org/post", json=payload)

print(f"状态码: {response.status_code}")
print(f"服务器收到的数据: {response.json()['json']}")
# 输出: {'name': '李四', 'message': '你好世界', 'numbers': [1, 2, 3, 4, 5]}
```

> **注意**：`json=payload` 和 `data=payload` 的区别：
> - `json=payload`：自动将 Python 字典转为 JSON 字符串，自动设置 `Content-Type: application/json`
> - `data=payload`：发送原始数据，需要手动设置 Content-Type

### 3.5 自定义请求头

```python
# ============================================
# 示例 4：自定义请求头
# ============================================

print("\n=== 示例 4：自定义请求头 ===")

headers = {
    "User-Agent": "Agent-Factory/1.0",       # 标识你的程序
    "Authorization": "Bearer your-token",     # 认证信息
    "Accept": "application/json",             # 期望的响应格式
    "X-Custom-Header": "my-value"             # 自定义头
}

response = requests.get("https://httpbin.org/headers", headers=headers)

print("服务器收到的头信息:")
for key, value in response.json()["headers"].items():
    print(f"  {key}: {value}")
```

### 3.6 错误处理（非常重要的部分）

```python
# ============================================
# 示例 5：错误处理
# ============================================

print("\n=== 示例 5：错误处理 ===")

# 场景 1：处理 404 错误
try:
    response = requests.get("https://httpbin.org/status/404", timeout=5)
    response.raise_for_status()  # 如果状态码不是 2xx，抛出异常
except requests.exceptions.HTTPError as e:
    print(f"HTTP 错误: {e}")
    # 输出: HTTP 错误: 404 Client Error

# 场景 2：处理连接超时
try:
    response = requests.get("https://httpbin.org/delay/10", timeout=3)
except requests.exceptions.Timeout as e:
    print(f"超时错误: {e}")
    # 输出: 超时错误: Request timed out

# 场景 3：处理网络错误
try:
    response = requests.get("https://this-domain-does-not-exist-12345.com")
except requests.exceptions.ConnectionError as e:
    print(f"连接错误: {e}")

# 场景 4：通用错误处理
try:
    response = requests.get("https://httpbin.org/status/500", timeout=5)
    response.raise_for_status()
except requests.exceptions.RequestException as e:
    # RequestException 是所有请求异常的父类，可以捕获所有错误
    print(f"请求出错: {type(e).__name__}: {e}")
```

### 3.7 检查响应状态的最佳实践

```python
# ============================================
# 示例 6：响应状态检查
# ============================================

print("\n=== 示例 6：响应状态检查 ===")

response = requests.get("https://httpbin.org/get", timeout=5)

# 方法 1：检查状态码是否为 200
if response.status_code == 200:
    print("请求成功！")

# 方法 2：使用 ok 属性（200-299 返回 True）
if response.ok:
    print("请求成功！（ok 属性）")

# 方法 3：使用 raise_for_status()（推荐）
try:
    response.raise_for_status()
    print("请求成功！（raise_for_status）")
except requests.exceptions.HTTPError:
    print("请求失败！")
```

---

## 4. httpx 库：现代化的 HTTP 客户端

### 4.1 为什么需要 httpx？

- `requests` 是最流行的 HTTP 库，但它**不支持异步**
- `httpx` 兼容 `requests` 的 API，同时**支持异步**
- 后续 Day 4 学异步编程时，httpx 会非常重要

### 4.2 安装 httpx

```bash
pip install httpx
```

### 4.3 httpx 同步用法（和 requests 几乎一样）

```python
"""
Day 2 示例：使用 httpx 库
"""

import httpx
import asyncio
import time

# ============================================
# 示例 1：httpx 同步请求（和 requests 类似）
# ============================================

print("=== 示例 1：httpx 同步请求 ===")

# 使用上下文管理器（推荐，会自动关闭连接）
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
```

### 4.4 httpx 异步用法

```python
# ============================================
# 示例 2：httpx 异步请求
# ============================================

print("\n=== 示例 2：httpx 异步请求 ===")

async def async_httpx_demo():
    """异步 HTTP 请求示例"""
    # 使用 async with 上下文管理器
    async with httpx.AsyncClient() as client:
        # 异步 GET 请求（注意 await）
        response = await client.get("https://httpbin.org/get")
        print(f"异步 GET 状态码: {response.status_code}")

        # 异步 POST 请求
        response = await client.post(
            "https://httpbin.org/post",
            json={"message": "Hello async httpx"}
        )
        print(f"异步 POST 响应: {response.json()['json']}")

# 运行异步函数
asyncio.run(async_httpx_demo())
```

### 4.5 并发请求：同时发送多个请求

这是 httpx + asyncio 最强大的能力。想象你要同时问 3 个大模型同一个问题：

```python
# ============================================
# 示例 3：并发请求（同时发送多个请求）
# ============================================

print("\n=== 示例 3：并发请求 ===")

async def concurrent_demo():
    """并发请求示例 - 同时发送多个请求"""

    urls = [
        "https://httpbin.org/delay/1",   # 模拟 1 秒延迟
        "https://httpbin.org/delay/2",   # 模拟 2 秒延迟
        "https://httpbin.org/delay/1",   # 模拟 1 秒延迟
    ]

    start_time = time.time()

    async with httpx.AsyncClient() as client:
        # 创建任务列表
        tasks = [client.get(url) for url in urls]

        # 并发执行（所有请求同时发出！）
        responses = await asyncio.gather(*tasks)

        for i, response in enumerate(responses):
            print(f"请求 {i+1}: 状态码 {response.status_code}")

    end_time = time.time()
    total_time = end_time - start_time
    print(f"总耗时: {total_time:.3f} 秒")

    # 如果是串行执行（一个一个来），需要 1+2+1=4 秒
    # 并发执行只需要最慢的那个 = 2 秒
    print("（如果串行执行需要 4 秒，并发只要 2 秒！）")

asyncio.run(concurrent_demo())
```

### 4.6 设置超时

```python
# ============================================
# 示例 4：超时设置
# ============================================

print("\n=== 示例 4：超时设置 ===")

# 方法 1：使用 httpx.Timeout
client = httpx.Client(
    timeout=httpx.Timeout(5.0),  # 总超时 5 秒
    limits=httpx.Limits(
        max_connections=10,           # 最大连接数
        max_keepalive_connections=5   # 最大保持连接数
    )
)

try:
    response = client.get("https://httpbin.org/delay/3")
    print(f"响应: {response.status_code}")
except httpx.TimeoutException:
    print("请求超时！")
finally:
    client.close()

# 方法 2：直接传 timeout 参数
try:
    with httpx.Client(timeout=5.0) as client:
        response = client.get("https://httpbin.org/delay/1")
        print(f"响应: {response.status_code}")
except httpx.TimeoutException:
    print("请求超时！")
```

---

## 5. requests vs httpx 对照表

| 特性 | requests | httpx |
|------|----------|-------|
| 同步请求 | 支持 | 支持 |
| 异步请求 | **不支持** | **支持** |
| API 风格 | `requests.get()` | `client.get()` |
| 连接池 | 内置 Session | 内置 Client |
| HTTP/2 | 不支持 | **支持** |
| 超时控制 | `timeout=5` | `timeout=httpx.Timeout(5.0)` |
| 社区成熟度 | 非常成熟 | 快速增长 |

**建议**：
- 如果只做同步请求，用 `requests`（生态更成熟）
- 如果需要异步请求（如并发调用多个 API），用 `httpx`
- 两个都装上，按需使用

---

## 6. 实用技巧：封装一个通用的 HTTP 客户端

在实际项目中，我们不会每次都写 `requests.get()`，而是封装一个通用的客户端类：

```python
"""
通用 HTTP 客户端封装
文件：src/agent_factory/http_client.py
"""

import requests
from typing import Dict, Any, Optional
from dataclasses import dataclass, field

@dataclass
class HTTPClient:
    """通用 HTTP 客户端"""

    base_url: str = ""
    timeout: int = 30
    headers: Dict[str, str] = field(default_factory=dict)
    max_retries: int = 3

    def __post_init__(self):
        """初始化后创建 Session"""
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> Dict[str, Any]:
        """发送请求（带重试）"""
        url = f"{self.base_url}{endpoint}"

        for attempt in range(self.max_retries):
            try:
                response = self.session.request(
                    method=method,
                    url=url,
                    timeout=self.timeout,
                    **kwargs
                )
                response.raise_for_status()
                return response.json()

            except requests.exceptions.RequestException as e:
                if attempt == self.max_retries - 1:
                    raise
                print(f"请求失败，第 {attempt + 1} 次重试...")
                continue

    def get(self, endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """GET 请求"""
        return self._request("GET", endpoint, params=params)

    def post(self, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """POST 请求"""
        return self._request("POST", endpoint, json=data)

    def close(self):
        """关闭会话"""
        self.session.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
        return False


# 使用示例
if __name__ == "__main__":
    # 创建客户端
    client = HTTPClient(
        base_url="https://httpbin.org",
        headers={"User-Agent": "Agent-Factory/1.0"}
    )

    # 使用上下文管理器
    with client:
        # GET 请求
        result = client.get("/get")
        print(f"GET 响应: {result}")

        # POST 请求
        result = client.post("/post", {"name": "test"})
        print(f"POST 响应: {result}")
```

---

## 7. 常见错误和解决方案

### 错误 1：ConnectionError - 连接失败

```python
# 症状
requests.exceptions.ConnectionError: HTTPSConnectionPool(host='xxx', port=443): Max retries exceeded

# 原因：网络不通、DNS 解析失败、服务器宕机
# 解决：
# 1. 检查网络连接
# 2. 检查 URL 是否正确
# 3. 增加超时时间
```

### 错误 2：Timeout - 请求超时

```python
# 症状
requests.exceptions.Timeout: Request timed out

# 原因：服务器响应太慢
# 解决：
response = requests.get(url, timeout=30)  # 增加超时时间
```

### 错误 3：HTTPError 401 - 未授权

```python
# 症状
requests.exceptions.HTTPError: 401 Client Error: Unauthorized

# 原因：API Key 错误或过期
# 解决：
headers = {"Authorization": "Bearer your-correct-api-key"}
response = requests.get(url, headers=headers)
```

### 错误 4：JSONDecodeError - 响应不是 JSON

```python
# 症状
json.decoder.JSONDecodeError: Expecting value

# 原因：服务器返回的不是 JSON（可能是 HTML 错误页面）
# 解决：
response = requests.get(url)
print(response.text[:500])  # 先看看返回了什么
if response.headers.get("Content-Type", "").startswith("application/json"):
    data = response.json()
else:
    print("返回的不是 JSON")
```

---

## 8. 今日小结

| 知识点 | 要点 |
|--------|------|
| HTTP 协议 | 请求-响应模型，像寄信一样 |
| GET/POST/PUT/DELETE | 四种基本操作方法 |
| 状态码 | 200 成功、404 未找到、500 服务器错误 |
| requests.get/post | 发送同步 HTTP 请求 |
| response.json() | 解析 JSON 响应 |
| response.raise_for_status() | 非 2xx 状态码抛出异常 |
| httpx.AsyncClient | 异步 HTTP 客户端 |
| asyncio.gather | 并发执行多个异步请求 |
| timeout | 超时设置（防止程序卡死） |

---

## 9. 课后练习

1. 使用 requests 向 `https://httpbin.org/get` 发送一个 GET 请求，带上 `name` 和 `age` 参数，打印响应
2. 使用 requests 向 `https://httpbin.org/post` 发送一个 POST 请求，发送 JSON 数据 `{"prompt": "你好"}`
3. 使用 httpx 并发向 `https://httpbin.org/delay/1` 发送 5 个请求，对比串行和并发的耗时
4. 尝试访问一个不存在的 URL，观察错误信息，然后用 try/except 处理它

---

> **明天预告**：Day 3 我们将学习如何调用大模型 API（OpenAI、Anthropic、DeepSeek）——这是构建 AI Agent 的核心技能。
