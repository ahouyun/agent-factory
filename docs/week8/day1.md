# 📅 Week 8 Day 1：MCP（Model Context Protocol）原理与实现

## 🧭 今日方向
> MCP 是 Anthropic 提出的开放标准，让 LLM 能以统一方式访问外部数据和工具。今天理解 MCP 的架构，掌握 Server/Client 模式，动手实现一个 MCP Server。

## 🎯 生活比喻
> MCP 就像 USB 接口标准。以前每个设备都有自己的接口（ proprietary 协议），MCP 定义了一个通用接口，让任何 LLM（电脑）都能连接任何工具（外设）。只要双方都遵守 MCP 标准，就能"即插即用"。

## 📋 今日三件事
1. 理解 MCP 的架构：Host / Client / Server
2. 掌握 MCP 的核心概念：Tools、Resources、Prompts
3. 用 Python 实现一个 MCP Server

## 🗺️ 手把手路线

### Step 1: MCP 架构
- 做什么: 画出 MCP 的三层架构图
- 为什么: 理解全局才能正确实现
- 成功标志: 能说出 Host、Client、Server 的职责

### Step 2: MCP 核心概念
- 做什么: 理解 Tools、Resources、Prompts 的区别
- 为什么: 这是 MCP 的三大支柱
- 成功标志: 能区分三种概念的用途

### Step 3: 实现 MCP Server
- 做什么: 用 Python 构建一个提供天气查询的 MCP Server
- 为什么: 动手实践是掌握协议的最佳方式
- 成功标志: Server 能被 MCP Client 发现和调用

## 💻 代码区

```python
"""
Week 8 Day 1: MCP（Model Context Protocol）原理与实现
安装依赖: pip install mcp
"""

# ========== 1. MCP 架构概览 ==========
print("=== 1. MCP 架构 ===")

print("""
MCP 架构（三层模型）:

┌─────────────────────────────────────────────────────┐
│                    Host (宿主)                        │
│            Claude Desktop / IDE / App                │
├─────────────────────────────────────────────────────┤
│                   Client (客户端)                     │
│              协议转换 + 连接管理                        │
├─────────────────────────────────────────────────────┤
│                   Server (服务端)                     │
│            提供 Tools / Resources / Prompts           │
└─────────────────────────────────────────────────────┘

Host: 运行 LLM 的应用程序（如 Claude Desktop）
Client: 负责与 Server 通信，管理连接
Server: 提供具体的工具、资源和提示词

三大核心概念:
- Tools (工具): 可被 LLM 调用的函数（如搜索、计算）
- Resources (资源): 可被 LLM 读取的数据（如文件、数据库）
- Prompts (提示): 预定义的提示词模板
""")

# ========== 2. MCP 协议消息格式 ==========
print("=== 2. MCP 消息格式 ===")

# MCP 使用 JSON-RPC 2.0 协议
# 请求示例
request_example = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
}

# 响应示例
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

# ========== 3. 实现 MCP Server ==========
print("\n=== 3. 实现 MCP Server ===")

# 使用 mcp 库实现
from mcp.server import Server
from mcp.types import Tool, TextContent
import mcp.server.stdio

# 创建 MCP Server
server = Server("weather-server")

# 定义工具
@server.list_tools()
async def list_tools():
    """列出所有可用工具"""
    return [
        Tool(
            name="get_weather",
            description="获取指定城市的天气信息",
            inputSchema={
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "城市名称，如 '北京'、'上海'"
                    }
                },
                "required": ["city"]
            }
        ),
        Tool(
            name="get_forecast",
            description="获取未来几天的天气预报",
            inputSchema={
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "城市名称"
                    },
                    "days": {
                        "type": "integer",
                        "description": "预报天数（1-7）",
                        "default": 3
                    }
                },
                "required": ["city"]
            }
        )
    ]

# 实现工具逻辑
@server.call_tool()
async def call_tool(name: str, arguments: dict):
    """处理工具调用"""
    if name == "get_weather":
        city = arguments.get("city", "北京")
        # 模拟天气数据
        weather_data = {
            "北京": {"temp": 25, "condition": "晴", "humidity": 40},
            "上海": {"temp": 28, "condition": "多云", "humidity": 65},
            "深圳": {"temp": 32, "condition": "阵雨", "humidity": 80},
        }
        data = weather_data.get(city, {"temp": 20, "condition": "未知", "humidity": 50})
        result = f"{city}天气: {data['condition']}, 温度: {data['temp']}°C, 湿度: {data['humidity']}%"
        return [TextContent(type="text", text=result)]

    elif name == "get_forecast":
        city = arguments.get("city", "北京")
        days = arguments.get("days", 3)
        forecast = f"{city}未来{days}天天气预报:\n"
        for i in range(days):
            forecast += f"第{i+1}天: 晴转多云, 20-28°C\n"
        return [TextContent(type="text", text=forecast)]

    return [TextContent(type="text", text=f"未知工具: {name}")]

print("MCP Server 已定义，包含以下工具:")
print("  1. get_weather - 获取天气信息")
print("  2. get_forecast - 获取天气预报")

# ========== 4. MCP Client 模拟 ==========
print("\n=== 4. MCP Client 模拟 ===")

class MCPClientSimulator:
    """MCP Client 模拟器"""

    def __init__(self):
        self.server = server
        self.tools = []

    async def connect(self):
        """连接到 Server"""
        print("  [Client] 连接到 MCP Server...")
        # 实际使用中会建立 stdio 或 SSE 连接

    async def list_tools(self):
        """获取工具列表"""
        print("  [Client] 获取工具列表...")
        self.tools = await list_tools()
        for tool in self.tools:
            print(f"    - {tool.name}: {tool.description}")
        return self.tools

    async def call_tool(self, name: str, arguments: dict):
        """调用工具"""
        print(f"  [Client] 调用工具: {name}({arguments})")
        result = await call_tool(name, arguments)
        return result

# 模拟 Client 操作
client = MCPClientSimulator()

async def demo_client():
    await client.connect()
    tools = await client.list_tools()
    result = await client.call_tool("get_weather", {"city": "北京"})
    print(f"  结果: {result[0].text}")

import asyncio
asyncio.run(demo_client())

# ========== 5. MCP 资源（Resources）==========
print("\n=== 5. MCP Resources ===")

# 资源定义
resources = [
    {
        "uri": "file:///docs/readme.md",
        "name": "README 文件",
        "description": "项目的 README 文档",
        "mimeType": "text/markdown"
    },
    {
        "uri": "database://users",
        "name": "用户数据库",
        "description": "用户信息表",
        "mimeType": "application/json"
    }
]

@server.list_resources()
async def list_resources():
    """列出所有资源"""
    return resources

@server.read_resource()
async def read_resource(uri: str):
    """读取资源"""
    if uri == "file:///docs/readme.md":
        return "# MCP Demo\n这是一个 MCP Server 示例。"
    elif uri == "database://users":
        return json.dumps({"users": [{"name": "张三"}, {"name": "李四"}]})
    return "资源不存在"

print("MCP Resources:")
for r in resources:
    print(f"  - {r['name']} ({r['uri']})")

# ========== 6. 启动 MCP Server ==========
print("\n=== 6. 启动 MCP Server ===")

print("""
启动方式:

1. stdio 模式（Claude Desktop 使用）:
   在 Claude Desktop 的配置文件中添加:
   {
     "mcpServers": {
       "weather": {
         "command": "python",
         "args": ["mcp_server.py"]
       }
     }
   }

2. SSE 模式（Web 应用使用）:
   mcp_server.py --transport sse --port 8080

3. 直接运行:
   python mcp_server.py
""")

print("""
=== MCP 最佳实践 ===

1. 工具设计:
   - 命名清晰（snake_case）
   - 描述准确完整
   - 参数有类型和说明

2. 资源设计:
   - URI 格式统一
   - 提供 MIME 类型
   - 支持分页（大数据集）

3. 错误处理:
   - 返回有意义的错误信息
   - 遵循 JSON-RPC 错误格式
   - 区分可恢复和不可恢复错误

4. 安全性:
   - 验证所有输入
   - 限制资源访问权限
   - 记录所有操作日志
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | `mcp` 安装失败 | `pip install mcp`，需要 Python 3.10+ |
| 2 | Server 无法启动 | 检查端口占用，或换用 stdio 模式 |
| 3 | Client 无法连接 | 检查传输协议配置（stdio/SSE）|
| 4 | 工具调用报错 | 检查参数格式是否符合 JSON Schema |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| MCP | Model Context Protocol，LLM 与外部工具的通信标准 |
| Host | 运行 LLM 的应用程序（如 Claude Desktop）|
| Client | MCP 客户端，负责协议转换和连接管理 |
| Server | MCP 服务端，提供工具、资源和提示词 |
| Tools | 可被 LLM 调用的函数 |
| Resources | 可被 LLM 读取的数据源 |
| Prompts | 预定义的提示词模板 |
| JSON-RPC | MCP 使用的通信协议格式 |
| stdio | 标准输入输出传输模式 |
| SSE | Server-Sent Events 传输模式 |

## ✅ 验收清单
- [ ] 能说出 MCP 三层架构的职责
- [ ] 能区分 Tools、Resources、Prompts
- [ ] 能实现一个简单的 MCP Server
- [ ] 能列出和调用 MCP 工具
- [ ] 理解 MCP 的传输模式（stdio/SSE）
- [ ] 能说出 MCP 的最佳实践

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
