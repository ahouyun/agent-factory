# 📅 Week 8 Day 1：MCP 协议 —— Agent 的 USB 接口

## 🎯 今日方向

> MCP（Model Context Protocol）是 Anthropic 提出的开放标准协议，为 LLM 应用提供统一的方式来连接外部数据源和工具。今天我们将深入理解 MCP 的 Host/Client/Server 三层架构，并动手实现一个天气查询 MCP Server。

## 🏠 生活比喻

> 想象你去餐厅吃饭：
> - **Host（宿主）** = 你本人，发起需求（"我想吃饭"）
> - **Client（客户端）** = 服务员，负责与后厨沟通
> - **Server（服务端）** = 厨房，真正准备食物的地方
>
> 你不需要知道厨房怎么运作，只需要告诉服务员你要什么，服务员去厨房下单，厨房把做好的菜端回来。MCP 就是这套"点餐系统"的标准流程。

## 📋 今日三件事

1. **理解 MCP 架构** —— Host/Client/Server 的职责和交互方式
2. **掌握核心概念** —— Tools、Resources、Prompts 的区别和用途
3. **动手写 MCP Server** —— 用 Python 实现一个天气查询服务

## 🗺️ 手把手路线

### Step 1: MCP 架构理解（15 分钟）

- 做什么: 画出 MCP 的三层架构图，理解各层职责
- 为什么: 理解全局才能正确实现
- 成功标志: 能说出 Host、Client、Server 各自做什么

### Step 2: 安装环境（10 分钟）

- 做什么: 安装 Python MCP SDK 和依赖
- 为什么: 为编写代码做准备
- 成功标志: `import mcp` 不报错

### Step 3: 实现天气查询 MCP Server（30 分钟）

- 做什么: 用 Python 构建一个提供天气查询的 MCP Server
- 为什么: 动手实践是掌握协议的最佳方式
- 成功标志: Server 能被 Client 发现和调用

### Step 4: 本地测试验证（15 分钟）

- 做什么: 编写测试脚本，模拟 Client 调用 Server
- 为什么: 确保代码正确运行
- 成功标志: 所有测试通过，输出预期结果

## 💻 代码区

### 代码 1：MCP 架构图解与消息格式

```python
"""
Week 8 Day 1: MCP 协议原理与实现
安装依赖: pip install mcp httpx
"""

import json

# ========== 1. MCP 架构概览 ==========
print("=" * 60)
print("1. MCP 架构（三层模型）")
print("=" * 60)

architecture = """
┌─────────────────────────────────────────────────────┐
│                    Host (宿主)                        │
│            Claude Desktop / IDE / App                │
│         负责运行 LLM，发起用户请求                      │
├─────────────────────────────────────────────────────┤
│                   Client (客户端)                     │
│              协议转换 + 连接管理                        │
│         将 LLM 请求转为 MCP 协议消息                    │
├─────────────────────────────────────────────────────┤
│                   Server (服务端)                     │
│            提供 Tools / Resources / Prompts           │
│         实现具体的工具逻辑和数据访问                     │
└─────────────────────────────────────────────────────┘

三大核心概念:
  Tools (工具): 可被 LLM 调用的函数（如搜索、计算、发邮件）
  Resources (资源): 可被 LLM 读取的数据（如文件、数据库记录）
  Prompts (提示): 预定义的提示词模板（如代码审查模板）

传输模式:
  stdio: 标准输入输出（Claude Desktop 使用）
  SSE: Server-Sent Events（Web 应用使用）
"""
print(architecture)

# ========== 2. MCP 协议消息格式 ==========
print("=" * 60)
print("2. MCP 消息格式（基于 JSON-RPC 2.0）")
print("=" * 60)

# MCP 请求示例
request_example = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
}

# MCP 响应示例
response_example = {
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
        "tools": [
            {
                "name": "get_weather",
                "description": "获取天气信息",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string", "description": "城市名"}
                    },
                    "required": ["city"]
                }
            }
        ]
    }
}

print("请求示例 (tools/list):")
print(json.dumps(request_example, indent=2, ensure_ascii=False))
print("\n响应示例:")
print(json.dumps(response_example, indent=2, ensure_ascii=False))

# MCP 工具调用请求
call_request = {
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
        "name": "get_weather",
        "arguments": {"city": "北京"}
    }
}

call_response = {
    "jsonrpc": "2.0",
    "id": 2,
    "result": {
        "content": [
            {"type": "text", "text": "北京: 晴, 25°C, 湿度 40%"}
        ]
    }
}

print("\n工具调用请求 (tools/call):")
print(json.dumps(call_request, indent=2, ensure_ascii=False))
print("\n工具调用响应:")
print(json.dumps(call_response, indent=2, ensure_ascii=False))
```

### 代码 2：完整的 MCP Server 实现

```python
"""
Week 8 Day 1: 天气查询 MCP Server 完整实现
使用 Python mcp 库构建符合 MCP 协议的工具服务
安装依赖: pip install mcp httpx
"""

import asyncio
import json
import logging
from datetime import datetime
from dataclasses import dataclass

import httpx

# ========== 天气数据模块 ==========
print("=" * 60)
print("天气数据模块")
print("=" * 60)


@dataclass
class WeatherResult:
    """天气查询结果"""
    city: str
    temperature: float
    humidity: float
    wind_speed: float
    description: str


# 城市坐标映射
CITY_COORDINATES: dict[str, dict[str, float]] = {
    "北京": {"latitude": 39.9042, "longitude": 116.4074},
    "上海": {"latitude": 31.2304, "longitude": 121.4737},
    "广州": {"latitude": 23.1291, "longitude": 113.2644},
    "深圳": {"latitude": 22.5431, "longitude": 114.0579},
    "杭州": {"latitude": 30.2741, "longitude": 120.1551},
    "成都": {"latitude": 30.5728, "longitude": 104.0668},
    "武汉": {"latitude": 30.5928, "longitude": 114.3055},
    "南京": {"latitude": 32.0603, "longitude": 118.7969},
    "重庆": {"latitude": 29.4316, "longitude": 106.9123},
    "西安": {"latitude": 34.3416, "longitude": 108.9398},
}

# WMO 天气代码转中文描述
WMO_DESCRIPTIONS: dict[int, str] = {
    0: "晴朗", 1: "大部晴朗", 2: "局部多云", 3: "阴天",
    45: "有雾", 48: "沉积雾凇",
    51: "小毛毛雨", 53: "中毛毛雨", 55: "大毛毛雨",
    61: "小雨", 63: "中雨", 65: "大雨",
    71: "小雪", 73: "中雪", 75: "大雪",
    80: "小阵雨", 81: "中阵雨", 82: "大阵雨",
    95: "雷暴", 96: "雷暴伴冰雹", 99: "强雷暴伴冰雹",
}


async def get_weather(city: str) -> WeatherResult:
    """
    获取指定城市的当前天气（使用 Open-Meteo 免费 API）
    """
    if city not in CITY_COORDINATES:
        available = "、".join(CITY_COORDINATES.keys())
        raise ValueError(f"不支持的城市: {city}。目前支持: {available}")

    coords = CITY_COORDINATES[city]
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": coords["latitude"],
        "longitude": coords["longitude"],
        "current_weather": "true",
        "hourly": "relative_humidity_2m",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    current = data["current_weather"]
    humidity = data["hourly"]["relative_humidity_2m"][0]
    weather_code = current["weathercode"]
    description = WMO_DESCRIPTIONS.get(weather_code, f"未知天气码: {weather_code}")

    return WeatherResult(
        city=city,
        temperature=current["temperature"],
        humidity=humidity,
        wind_speed=current["windspeed"],
        description=description,
    )


def list_supported_cities() -> list[str]:
    """返回支持的城市列表"""
    return list(CITY_COORDINATES.keys())


print(f"支持的城市: {', '.join(list_supported_cities())}")
print(f"共 {len(CITY_COORDINATES)} 个城市")


# ========== MCP Server 实现 ==========
print("\n" + "=" * 60)
print("MCP Server 实现")
print("=" * 60)

# 注意：以下代码展示了完整的 MCP Server 结构
# 在实际运行时，需要使用 stdio 传输模式启动

from mcp.server import Server
from mcp.types import Tool, TextContent

# 创建 MCP Server 实例
app = Server("weather-server")


@app.list_tools()
async def list_tools() -> list[Tool]:
    """声明此 Server 提供的工具列表"""
    return [
        Tool(
            name="get_weather",
            description="获取指定城市的当前天气信息，包括温度、湿度、风速和天气状况",
            inputSchema={
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "城市名称，支持: 北京、上海、广州、深圳、杭州、成都、武汉、南京、重庆、西安",
                    }
                },
                "required": ["city"],
            },
        ),
        Tool(
            name="list_cities",
            description="列出所有支持查询天气的城市",
            inputSchema={
                "type": "object",
                "properties": {},
            },
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """工具调用入口"""
    if name == "get_weather":
        city = arguments.get("city", "")
        if not city:
            return [TextContent(
                type="text",
                text=json.dumps({"error": "请提供城市名称"}, ensure_ascii=False),
            )]
        try:
            weather = await get_weather(city)
            result = {
                "城市": weather.city,
                "温度": f"{weather.temperature}°C",
                "湿度": f"{weather.humidity}%",
                "风速": f"{weather.wind_speed} km/h",
                "天气状况": weather.description,
                "查询时间": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            }
            return [TextContent(
                type="text",
                text=json.dumps(result, ensure_ascii=False, indent=2),
            )]
        except ValueError as e:
            return [TextContent(
                type="text",
                text=json.dumps({"error": str(e)}, ensure_ascii=False),
            )]
        except Exception as e:
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"查询失败: {str(e)}"}, ensure_ascii=False),
            )]
    elif name == "list_cities":
        cities = list_supported_cities()
        return [TextContent(
            type="text",
            text=json.dumps({"支持的城市": cities, "总计": f"{len(cities)} 个城市"}, ensure_ascii=False, indent=2),
        )]
    else:
        return [TextContent(
            type="text",
            text=json.dumps({"error": f"未知工具: {name}"}, ensure_ascii=False),
        )]


async def main():
    """启动 MCP Server"""
    from mcp.server.stdio import stdio_server
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


# ========== 本地测试（不启动 Server）==========
print("\n" + "=" * 60)
print("本地测试（模拟 Client 调用）")
print("=" * 60)

async def local_test():
    """本地测试：直接调用函数验证逻辑"""
    # 测试 list_cities
    print("\n[测试1] list_cities 工具:")
    tools = await list_tools()
    for tool in tools:
        print(f"  - {tool.name}: {tool.description}")

    # 测试 get_weather（北京）
    print("\n[测试2] get_weather 北京:")
    result = await call_tool("get_weather", {"city": "北京"})
    print(f"  {result[0].text}")

    # 测试 get_weather（上海）
    print("\n[测试3] get_weather 上海:")
    result = await call_tool("get_weather", {"city": "上海"})
    print(f"  {result[0].text}")

    # 测试错误处理
    print("\n[测试4] 错误处理（火星）:")
    result = await call_tool("get_weather", {"city": "火星"})
    print(f"  {result[0].text}")

    # 测试 list_cities 工具
    print("\n[测试5] list_cities 工具:")
    result = await call_tool("list_cities", {})
    print(f"  {result[0].text}")


asyncio.run(local_test())

print("\n" + "=" * 60)
print("代码执行完成！")
print("=" * 60)
```

### 代码 3：Claude Desktop 配置与测试脚本

```python
"""
Week 8 Day 1: MCP Server 测试脚本
使用 mcp ClientSession 模拟真实 MCP 协议交互
安装依赖: pip install mcp
"""

import asyncio
import json
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def test_weather_server():
    """测试天气查询 MCP Server"""
    print("=" * 50)
    print("MCP 天气 Server 本地测试")
    print("=" * 50)

    # 配置 Server 参数
    server_params = StdioServerParameters(
        command="python",
        args=["-c", """
import asyncio
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import json

app = Server("weather-server")

@app.list_tools()
async def list_tools():
    return [
        Tool(
            name="get_weather",
            description="获取天气信息",
            inputSchema={
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名"}
                },
                "required": ["city"]
            }
        ),
    ]

@app.call_tool()
async def call_tool(name, arguments):
    if name == "get_weather":
        city = arguments.get("city", "北京")
        data = {
            "北京": {"temp": 25, "condition": "晴", "humidity": 40},
            "上海": {"temp": 28, "condition": "多云", "humidity": 65},
        }
        info = data.get(city, {"temp": 20, "condition": "未知", "humidity": 50})
        result = f"{city}: {info['condition']}, {info['temp']}°C, 湿度 {info['humidity']}%"
        return [TextContent(type="text", text=result)]
    return [TextContent(type="text", text=f"未知工具: {name}")]

async def main():
    from mcp.server.stdio import stdio_server
    async with stdio_server() as (read, write):
        await app.run(read, write, app.create_initialization_options())

asyncio.run(main())
"""],
    )

    try:
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                # 步骤 1：初始化
                print("\n[1] 初始化连接...")
                await session.initialize()
                print("  连接成功！")

                # 步骤 2：列出可用工具
                print("\n[2] 查询可用工具...")
                tools = await session.list_tools()
                for tool in tools.tools:
                    print(f"  - {tool.name}: {tool.description}")

                # 步骤 3：查询北京天气
                print("\n[3] 查询北京天气...")
                result = await session.call_tool("get_weather", {"city": "北京"})
                print(f"  结果: {result.content[0].text}")

                # 步骤 4：查询上海天气
                print("\n[4] 查询上海天气...")
                result = await session.call_tool("get_weather", {"city": "上海"})
                print(f"  结果: {result.content[0].text}")

                # 步骤 5：测试错误处理
                print("\n[5] 测试错误处理...")
                result = await session.call_tool("get_weather", {"city": "火星"})
                print(f"  结果: {result.content[0].text}")

    except Exception as e:
        print(f"测试出错: {e}")
        print("提示: 如果是连接错误，请确保 Python 环境正确配置")

    print("\n" + "=" * 50)
    print("测试完成！")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(test_weather_server())
```

### Claude Desktop 配置文件

```json
{
  "mcpServers": {
    "weather": {
      "command": "python",
      "args": ["/你的路径/weather_server.py"],
      "env": {}
    }
  }
}
```

**配置文件位置：**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

## 📤 预期输出

运行天气数据模块的输出：

```
============================================================
天气数据模块
============================================================
支持的城市: 北京、上海、广州、深圳、杭州、成都、武汉、南京、重庆、西安
共 10 个城市

============================================================
MCP Server 实现
============================================================
```

运行本地测试的输出：

```
============================================================
本地测试（模拟 Client 调用）
============================================================

[测试1] list_cities 工具:
  - get_weather: 获取指定城市的当前天气信息，包括温度、湿度、风速和天气状况
  - list_cities: 列出所有支持查询天气的城市

[测试2] get_weather 北京:
  {
    "城市": "北京",
    "温度": "28.5°C",
    "湿度": "65%",
    "风速": "12.3 km/h",
    "天气状况": "局部多云",
    "查询时间": "2026-06-11 10:30:15"
  }

[测试3] get_weather 上海:
  {
    "城市": "上海",
    "温度": "31.2°C",
    "湿度": "78%",
    "风速": "8.7 km/h",
    "天气状况": "大部晴朗",
    "查询时间": "2026-06-11 10:30:16"
  }

[测试4] 错误处理（火星）:
  {"error": "不支持的城市: 火星。目前支持: 北京、上海、广州、深圳、杭州、成都、武汉、南京、重庆、西安"}

[测试5] list_cities 工具:
  {
    "支持的城市": ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "重庆", "西安"],
    "总计": "10 个城市"
  }
```

## ⚠️ 常见错误与解决方案

| # | 错误信息 | 原因 | 解决方案 |
|---|---------|------|---------|
| 1 | `ModuleNotFoundError: No module named 'mcp'` | MCP SDK 未安装 | 运行 `pip install mcp` |
| 2 | `httpx.ConnectTimeout` | 网络连接超时 | 检查网络，或设置代理 `export HTTP_PROXY=http://proxy:port` |
| 3 | `JSONDecodeError: Expecting value` | API 返回非 JSON | 添加 `response.raise_for_status()` 检查 |
| 4 | Claude Desktop 无法连接 Server | 配置文件路径错误 | 检查配置文件位置和格式 |
| 5 | `RuntimeError: Event loop is closed` | 异步循环管理问题 | 使用 `asyncio.run()` 启动 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| MCP | Model Context Protocol，LLM 与外部工具的通信标准 |
| Host | 运行 LLM 的应用程序（如 Claude Desktop） |
| Client | MCP 客户端，负责协议转换和连接管理 |
| Server | MCP 服务端，提供工具、资源和提示词 |
| Tools | 可被 LLM 调用的函数 |
| Resources | 可被 LLM 读取的数据源 |
| Prompts | 预定义的提示词模板 |
| JSON-RPC | MCP 使用的通信协议格式 |
| stdio | 标准输入输出传输模式 |

## 🏋️ 每日挑战

### 挑战 1：扩展城市数据库（难度：⭐）

在 `CITY_COORDINATES` 中添加 5 个新的中国城市。提示：使用搜索查找城市的经纬度。

### 挑战 2：添加空气质量工具（难度：⭐⭐）

为 MCP Server 添加 `get_air_quality` 工具，使用 Open-Meteo 空气质量 API。

参考 API：
```
https://air-quality-api.open-meteo.com/v1/air-quality?latitude=39.9&longitude=116.4&current=pm2_5,pm10
```

### 挑战 3：添加天气预报工具（难度：⭐⭐⭐）

实现 `get_forecast` 工具，返回未来 3 天的天气预报，包括最高/最低温度。

### 挑战 4：MCP 资源端点（难度：⭐⭐⭐）

实现 `list_resources()` 和 `read_resource()` 端点，将天气数据作为资源暴露出来。

## ✅ 验收清单

- [ ] 能说出 MCP 三层架构的职责
- [ ] 能区分 Tools、Resources、Prompts
- [ ] 能实现一个简单的 MCP Server
- [ ] 能本地测试 MCP Server
- [ ] 理解 MCP 的传输模式（stdio/SSE）
- [ ] 代码能正确运行并输出预期结果

## 📝 复盘小纸条

- 今天最大的收获: ...
- 还不太确定的: ...

---

> 💡 **学习建议**：建议阅读 [MCP 官方文档](https://modelcontextprotocol.io/) 和 [MCP 规范](https://spec.modelcontextprotocol.io/)，深入理解协议细节。
