# Week 8：通信协议 + 多 Agent 协作

> **Phase 2 第四周** — 让 Agent 学会"打电话"和"开会"

---

## Day 1：MCP 协议基础

### 📅 Day 1：MCP（Model Context Protocol）— Agent 的"USB 接口标准"

### 🧭 今日方向
理解 MCP（Anthropic 提出的模型上下文协议），学习如何用 MCP 让 Agent 连接外部工具和数据源。

### 🎯 生活比喻
MCP 就像 USB 接口标准。以前每个设备都有自己的接口（串口、并口、PS/2），插错就用不了。USB 统一了接口，任何设备只要支持 USB 就能插上电脑用。MCP 对 AI Agent 也是一样的——它定义了一个标准协议，让 Agent 可以连接到任何支持 MCP 的工具和数据源，不用担心兼容性问题。

### 📋 今日三件事
1. 理解 MCP 的架构（Host、Client、Server）
2. 实现一个简单的 MCP Server
3. 用 MCP Client 连接 Server 并调用工具

### 🗺️ 手把手路线

#### Step 1：理解 MCP 架构
**做什么**：画出 Host → Client → Server 的三层架构图
**为什么**：理解架构才能正确实现
**成功标志**：能解释每个组件的职责

#### Step 2：实现 MCP Server
**做什么**：用 Python 实现一个暴露工具的 MCP Server
**为什么**：Server 是 MCP 的核心，提供工具和数据
**成功标志**：Server 能正确响应工具列表和调用请求

#### Step 3：实现 MCP Client
**做什么**：用 MCP Client 连接 Server 并调用工具
**为什么**：验证 Server 的实现是否正确
**成功标志**：Client 能发现工具并成功调用

### 💻 代码区

```python
"""
Week 8 Day 1：MCP 协议基础
注意：需要安装 `pip install mcp`
"""
import json
import asyncio
from typing import Any

# ========== Part 1：理解 MCP 消息格式 ==========

# MCP 使用 JSON-RPC 2.0 协议
# 所有消息都是 JSON 格式

# 请求示例：列出工具
list_tools_request = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
}

# 响应示例：工具列表
list_tools_response = {
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
        "tools": [
            {
                "name": "calculator",
                "description": "执行数学计算",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "expression": {
                            "type": "string",
                            "description": "数学表达式"
                        }
                    },
                    "required": ["expression"]
                }
            }
        ]
    }
}

# 请求示例：调用工具
call_tool_request = {
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
        "name": "calculator",
        "arguments": {"expression": "2 + 3 * 4"}
    }
}

print("MCP 消息格式示例已定义")

# ========== Part 2：简化的 MCP Server ==========

class SimpleMCPServer:
    """简化版 MCP Server"""

    def __init__(self, name: str):
        self.name = name
        self.tools: dict[str, dict] = {}
        self.resources: dict[str, dict] = {}

    def tool(self, name: str, description: str, input_schema: dict):
        """装饰器：注册工具"""
        def decorator(func):
            self.tools[name] = {
                "name": name,
                "description": description,
                "inputSchema": input_schema,
                "handler": func
            }
            return func
        return decorator

    def resource(self, uri: str, name: str, description: str):
        """装饰器：注册资源"""
        def decorator(func):
            self.resources[uri] = {
                "uri": uri,
                "name": name,
                "description": description,
                "handler": func
            }
            return func
        return decorator

    def handle_request(self, request: dict) -> dict:
        """处理 JSON-RPC 请求"""
        method = request.get("method")
        params = request.get("params", {})
        request_id = request.get("id")

        if method == "tools/list":
            tools_list = [
                {k: v for k, v in tool.items() if k != "handler"}
                for tool in self.tools.values()
            ]
            return {"jsonrpc": "2.0", "id": request_id, "result": {"tools": tools_list}}

        elif method == "tools/call":
            tool_name = params.get("name")
            arguments = params.get("arguments", {})
            if tool_name in self.tools:
                try:
                    result = self.tools[tool_name]["handler"](**arguments)
                    return {
                        "jsonrpc": "2.0",
                        "id": request_id,
                        "result": {
                            "content": [{"type": "text", "text": str(result)}]
                        }
                    }
                except Exception as e:
                    return {
                        "jsonrpc": "2.0",
                        "id": request_id,
                        "error": {"code": -1, "message": str(e)}
                    }
            else:
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "error": {"code": -32601, "message": f"工具不存在: {tool_name}"}
                }

        elif method == "resources/list":
            resources_list = [
                {k: v for k, v in res.items() if k != "handler"}
                for res in self.resources.values()
            ]
            return {"jsonrpc": "2.0", "id": request_id, "result": {"resources": resources_list}}

        return {"jsonrpc": "2.0", "id": request_id, "error": {"code": -32601, "message": "未知方法"}}


# ========== 创建示例 Server ==========

server = SimpleMCPServer("demo-server")

@server.tool(
    name="calculator",
    description="执行数学计算",
    input_schema={
        "type": "object",
        "properties": {
            "expression": {"type": "string", "description": "数学表达式"}
        },
        "required": ["expression"]
    }
)
def calculator(expression: str) -> str:
    try:
        result = eval(expression, {"__builtins__": {}})
        return f"{expression} = {result}"
    except Exception as e:
        return f"计算错误：{str(e)}"

@server.tool(
    name="get_time",
    description="获取当前时间",
    input_schema={
        "type": "object",
        "properties": {},
        "required": []
    }
)
def get_time() -> str:
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

@server.tool(
    name="search_docs",
    description="搜索文档库",
    input_schema={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "搜索关键词"}
        },
        "required": ["query"]
    }
)
def search_docs(query: str) -> str:
    # 模拟搜索
    return f"搜索 '{query}' 的结果：找到 3 篇相关文档"

# ========== MCP Client ==========

class SimpleMCPClient:
    """简化版 MCP Client"""

    def __init__(self, server: SimpleMCPServer):
        self.server = server
        self._request_id = 0

    def _next_id(self) -> int:
        self._request_id += 1
        return self._request_id

    def list_tools(self) -> list[dict]:
        """获取工具列表"""
        request = {
            "jsonrpc": "2.0",
            "id": self._next_id(),
            "method": "tools/list",
            "params": {}
        }
        response = self.server.handle_request(request)
        return response.get("result", {}).get("tools", [])

    def call_tool(self, name: str, arguments: dict) -> dict:
        """调用工具"""
        request = {
            "jsonrpc": "2.0",
            "id": self._next_id(),
            "method": "tools/call",
            "params": {"name": name, "arguments": arguments}
        }
        response = self.server.handle_request(request)
        return response

# ========== 测试 ==========

client = SimpleMCPClient(server)

# 测试1：列出工具
print("\n=== 工具列表 ===")
tools = client.list_tools()
for tool in tools:
    print(f"  {tool['name']}: {tool['description']}")

# 测试2：调用计算器
print("\n=== 调用计算器 ===")
result = client.call_tool("calculator", {"expression": "(10 + 20) * 3"})
print(f"  结果：{result}")

# 测试3：获取时间
print("\n=== 获取时间 ===")
result = client.call_tool("get_time", {})
print(f"  结果：{result}")

# 测试4：搜索文档
print("\n=== 搜索文档 ===")
result = client.call_tool("search_docs", {"query": "RAG 技术"})
print(f"  结果：{result}")

# 测试5：调用不存在的工具
print("\n=== 错误处理 ===")
result = client.call_tool("nonexistent", {})
print(f"  结果：{result}")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| MCP 包安装失败 | 尝试 `pip install mcp[cli]` |
| Server 不响应 | 检查 JSON-RPC 格式是否正确 |
| 工具参数类型错误 | 对照 inputSchema 检查参数 |
| 资源 URI 格式错误 | 使用标准的 URI 格式（如 `file:///path`） |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| MCP | 模型上下文协议，Agent 的标准接口 | USB 接口标准 |
| Host | 使用 MCP 的应用程序 | 电脑主机 |
| Client | 管理与 Server 连接的组件 | USB 控制器 |
| Server | 提供工具和数据的服务端 | USB 设备 |
| Tool | Server 提供的可调用功能 | U盘的存储功能 |
| Resource | Server 提供的数据资源 | U盘里的文件 |

### ✅ 验收清单
- [ ] 理解 MCP 的三层架构
- [ ] 能实现一个简单的 MCP Server
- [ ] Client 能发现并调用工具
- [ ] 理解 JSON-RPC 消息格式

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 2 将学习 A2A（Agent-to-Agent）协议和 NLWeb，让 Agent 之间能互相通信。

---

## Day 2：A2A + NLWeb 协议

### 📅 Day 2：A2A + NLWeb — Agent 之间的"电话"和"网页"

### 🧭 今日方向
学习 A2A（Agent-to-Agent，Google 提出）和 NLWeb 协议，理解 Agent 间通信和 Agent-Web 交互。

### 🎯 生俗比喻
如果说 MCP 是 Agent 连接工具的"USB 接口"，那 A2A 就是 Agent 之间的"电话系统"——让一个 Agent 可以打电话给另一个 Agent，委托它完成任务。NLWeb 则是 Agent 浏览网页的"浏览器"——让 Agent 能像人一样读取和理解网页内容。

### 📋 今日三件事
1. 理解 A2A 协议的核心概念（Agent Card、Task、Message）
2. 实现 Agent 间的基本通信
3. 理解 NLWeb 的工作原理

### 🗺️ 手把手路线

#### Step 1：理解 A2A 架构
**做什么**：学习 Agent Card、Task 生命周期、Message 格式
**为什么**：A2A 是多 Agent 协作的基础设施
**成功标志**：能画出 A2A 的通信流程图

#### Step 2：实现 A2A 通信
**做什么**：实现两个 Agent 之间的任务委托
**为什么**：这是 A2A 的核心用例
**成功标志**：Agent A 能委托 Agent B 完成任务并获取结果

#### Step 3：了解 NLWeb
**做什么**：理解 NLWeb 如何让 Agent 访问网页内容
**为什么**：Web 是最大的信息源
**成功标志**：能解释 NLWeb 的工作流程

### 💻 代码区

```python
"""
Week 8 Day 2：A2A 协议与 NLWeb 概念
"""
import json
import time
from typing import Any
from enum import Enum

# ========== Part 1：A2A 协议实现 ==========

class TaskState(str, Enum):
    """任务状态"""
    SUBMITTED = "submitted"      # 已提交
    WORKING = "working"          # 处理中
    COMPLETED = "completed"      # 已完成
    FAILED = "failed"            # 失败

class AgentCard:
    """
    Agent 名片 — 描述 Agent 的能力
    类似于公司的"营业执照"，告诉别人"我能做什么"
    """

    def __init__(
        self,
        name: str,
        description: str,
        url: str,
        capabilities: list[str],
        input_types: list[str],
        output_types: list[str]
    ):
        self.name = name
        self.description = description
        self.url = url
        self.capabilities = capabilities
        self.input_types = input_types
        self.output_types = output_types

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "url": self.url,
            "capabilities": self.capabilities,
            "inputTypes": self.input_types,
            "outputTypes": self.output_types,
        }

    def can_handle(self, task_type: str) -> bool:
        """检查是否能处理某种任务"""
        return task_type in self.capabilities


class A2AMessage:
    """A2A 消息"""

    def __init__(self, role: str, content: str, metadata: dict = None):
        self.role = role  # "user" 或 "agent"
        self.content = content
        self.metadata = metadata or {}
        self.timestamp = time.time()

    def to_dict(self) -> dict:
        return {
            "role": self.role,
            "content": self.content,
            "metadata": self.metadata,
            "timestamp": self.timestamp
        }


class A2ATask:
    """A2A 任务"""

    def __init__(self, task_id: str, message: A2AMessage, state: TaskState = TaskState.SUBMITTED):
        self.task_id = task_id
        self.message = message
        self.state = state
        self.artifacts: list[dict] = []
        self.history: list[dict] = []

    def update_state(self, new_state: TaskState):
        self.state = new_state
        self.history.append({
            "state": new_state.value,
            "timestamp": time.time()
        })

    def add_artifact(self, artifact: dict):
        self.artifacts.append(artifact)

    def to_dict(self) -> dict:
        return {
            "task_id": self.task_id,
            "state": self.state.value,
            "message": self.message.to_dict(),
            "artifacts": self.artifacts,
            "history": self.history
        }


class A2AAgent:
    """支持 A2A 协议的 Agent"""

    def __init__(self, card: AgentCard):
        self.card = card
        self.tasks: dict[str, A2ATask] = {}

    def handle_task(self, task: A2ATask) -> A2ATask:
        """处理收到的任务"""
        print(f"  [{self.card.name}] 收到任务 {task.task_id}")
        task.update_state(TaskState.WORKING)

        # 根据任务类型处理
        content = task.message.content.lower()

        if "翻译" in content or "translate" in content:
            result = self._handle_translation(content)
        elif "计算" in content or "calculate" in content:
            result = self._handle_calculation(content)
        elif "摘要" in content or "summary" in content:
            result = self._handle_summary(content)
        else:
            result = f"{self.card.name} 收到任务：{content}"

        task.add_artifact({
            "type": "text",
            "content": result,
            "producedBy": self.card.name
        })
        task.update_state(TaskState.COMPLETED)

        print(f"  [{self.card.name}] 任务完成")
        return task

    def _handle_translation(self, content: str) -> str:
        return f"[翻译结果] {content} → （模拟翻译输出）"

    def _handle_calculation(self, content: str) -> str:
        return f"[计算结果] （模拟计算输出）"

    def _handle_summary(self, content: str) -> str:
        return f"[摘要结果] （模拟摘要输出）"

    def discover(self) -> dict:
        """返回 Agent 名片（用于服务发现）"""
        return self.card.to_dict()


class A2ARegistry:
    """A2A 服务注册表 — 让 Agent 能找到彼此"""

    def __init__(self):
        self.agents: dict[str, A2AAgent] = {}

    def register(self, agent: A2AAgent):
        """注册 Agent"""
        self.agents[agent.card.name] = agent
        print(f"  [注册] Agent '{agent.card.name}' 已注册")

    def find_agent(self, capability: str) -> list[A2AAgent]:
        """根据能力查找 Agent"""
        return [
            agent for agent in self.agents.values()
            if agent.card.can_handle(capability)
        ]

    def list_agents(self) -> list[dict]:
        """列出所有注册的 Agent"""
        return [agent.discover() for agent in self.agents.values()]


# ========== Part 2：NLWeb 概念 ==========

class NLWebSimulator:
    """
    NLWeb 模拟器
    NLWeb 让 Agent 能像人一样理解和导航网页
    """

    def __init__(self):
        # 模拟网页内容
        self.web_pages = {
            "https://docs.python.org": {
                "title": "Python 官方文档",
                "content": "Python 是一种解释型、面向对象的高级编程语言...",
                "links": ["https://docs.python.org/tutorial", "https://docs.python.org/library"]
            },
            "https://docs.python.org/tutorial": {
                "title": "Python 教程",
                "content": "本教程向你介绍 Python 语言的基本概念和功能...",
                "links": ["https://docs.python.org/tutorial/classes"]
            }
        }

    def fetch_page(self, url: str) -> dict:
        """获取网页内容"""
        return self.web_pages.get(url, {
            "title": "页面未找到",
            "content": f"无法访问 {url}",
            "links": []
        })

    def search(self, query: str) -> list[dict]:
        """搜索网页"""
        results = []
        for url, page in self.web_pages.items():
            if query.lower() in page["content"].lower() or query.lower() in page["title"].lower():
                results.append({
                    "url": url,
                    "title": page["title"],
                    "snippet": page["content"][:100]
                })
        return results

    def extract_content(self, url: str) -> str:
        """提取网页的文本内容（类似 readability）"""
        page = self.fetch_page(url)
        return f"标题：{page['title']}\n内容：{page['content']}"


# ========== 测试 ==========

# 创建 Agent
translator = A2AAgent(AgentCard(
    name="翻译专家",
    description="支持多语言翻译",
    url="http://localhost:8001",
    capabilities=["翻译", "translate"],
    input_types=["text"],
    output_types=["text"]
))

calculator = A2AAgent(AgentCard(
    name="计算专家",
    description="执行数学计算",
    url="http://localhost:8002",
    capabilities=["计算", "calculate"],
    input_types=["text"],
    output_types=["text"]
))

summarizer = A2AAgent(AgentCard(
    name="摘要专家",
    description="文本摘要和总结",
    url="http://localhost:8003",
    capabilities=["摘要", "summary"],
    input_types=["text"],
    output_types=["text"]
))

# 注册 Agent
registry = A2ARegistry()
registry.register(translator)
registry.register(calculator)
registry.register(summarizer)

# 列出所有 Agent
print("\n=== 已注册的 Agent ===")
for agent_info in registry.list_agents():
    print(f"  {agent_info['name']}: {agent_info['description']}")
    print(f"    能力：{agent_info['capabilities']}")

# 查找能翻译的 Agent
print("\n=== 查找翻译 Agent ===")
translation_agents = registry.find_agent("翻译")
for agent in translation_agents:
    print(f"  找到：{agent.card.name}")

# 创建并处理任务
print("\n=== A2A 任务处理 ===")
task = A2ATask(
    task_id="task-001",
    message=A2AMessage(role="user", content="请翻译这段文字：Hello World")
)
result = translator.handle_task(task)
print(f"任务状态：{result.state.value}")
print(f"结果：{result.artifacts}")

# NLWeb 测试
print("\n=== NLWeb 测试 ===")
nlweb = NLWebSimulator()
results = nlweb.search("Python")
for r in results:
    print(f"  {r['title']}: {r['snippet'][:50]}...")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| Agent 间通信失败 | 检查 Agent Card 是否正确注册 |
| 任务状态不对 | 检查 `update_state` 调用顺序 |
| NLWeb 返回空 | 检查搜索关键词是否匹配 |
| 并发任务冲突 | 为每个任务分配唯一 task_id |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| A2A | Agent-to-Agent 协议 | Agent 之间的电话系统 |
| Agent Card | Agent 的能力名片 | 公司营业执照 |
| Task | A2A 中的任务单元 | 工单 |
| NLWeb | 让 Agent 理解网页的协议 | Agent 的浏览器 |
| Registry | Agent 服务注册表 | 黄页电话簿 |

### ✅ 验收清单
- [ ] 理解 A2A 的核心概念
- [ ] 能实现 Agent 间的基本通信
- [ ] 理解 NLWeb 的作用
- [ ] Agent 能通过 Registry 发现彼此

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 3 将学习多 Agent 架构模式（中心化、去中心化、分层），请确保已理解 A2A 的通信基础。

---

## Day 3：多 Agent 架构模式

### 📅 Day 3：多 Agent 架构 — 从"单打独斗"到"团队作战"

### 🧭 今日方向
学习三种多 Agent 架构模式：中心化（Orchestrator）、去中心化（Peer-to-Peer）、分层（Hierarchical）。

### 🎯 生活比喻
- **中心化**：军队的指挥系统，将军（Orchestrator）下达命令，士兵（Worker Agent）执行
- **去中心化**：开源社区，每个人都是平等的贡献者，通过协商达成共识
- **分层**：公司组织架构，CEO → VP → Manager → Engineer，层层分派

### 📋 今日三件事
1. 实现中心化 Orchestrator 模式
2. 实现去中心化 Peer-to-Peer 模式
3. 对比三种架构的优劣

### 🗺️ 手把手路线

#### Step 1：中心化架构
**做什么**：实现一个 Orchestrator 管理多个 Worker Agent
**为什么**：这是最常用的多 Agent 模式
**成功标志**：Orchestrator 能分派任务给合适的 Worker

#### Step 2：去中心化架构
**做什么**：实现 Agent 之间直接通信协商
**为什么**：某些场景需要 Agent 自主协作
**成功标志**：Agent 能通过消息传递协作完成任务

#### Step 3：对比分析
**做什么**：列出三种架构的适用场景和优缺点
**为什么**：选择合适的架构是设计多 Agent 系统的关键
**成功标志**：能根据需求选择合适的架构

### 💻 代码区

```python
"""
Week 8 Day 3：多 Agent 架构模式
"""
from dataclasses import dataclass, field
from typing import Any
import json

# ========== 基础 Agent 定义 ==========

@dataclass
class Message:
    sender: str
    receiver: str
    content: Any
    msg_type: str = "task"  # task, result, info

class BaseAgent:
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.inbox: list[Message] = []

    def receive(self, message: Message):
        self.inbox.append(message)

    def process(self) -> list[Message]:
        raise NotImplementedError

# ========== 模式1：中心化 Orchestrator ==========

class OrchestratorAgent:
    """中心调度器 — 任务的分派和汇总"""

    def __init__(self):
        self.workers: dict[str, BaseAgent] = {}
        self.results: dict[str, Any] = {}

    def register_worker(self, worker: BaseAgent):
        self.workers[worker.name] = worker
        print(f"  [Orchestrator] 注册 Worker: {worker.name} ({worker.role})")

    def dispatch(self, task: str, target_role: str = None) -> dict:
        """分派任务"""
        # 找到合适的 Worker
        target = None
        for worker in self.workers.values():
            if target_role is None or target_role in worker.role:
                target = worker
                break

        if not target:
            return {"error": f"没有找到角色为 {target_role} 的 Worker"}

        print(f"  [Orchestrator] 分派任务给 {target.name}: {task[:50]}...")

        # 发送任务
        msg = Message(sender="Orchestrator", receiver=target.name, content=task)
        target.receive(msg)

        # Worker 处理
        responses = target.process()

        # 收集结果
        for resp in responses:
            self.results[target.name] = resp.content

        return {"worker": target.name, "result": responses[0].content if responses else None}

    def coordinate(self, subtasks: list[dict]) -> dict:
        """协调多个子任务"""
        results = {}
        for subtask in subtasks:
            result = self.dispatch(subtask["task"], subtask.get("role"))
            results[subtask["task"][:20]] = result
        return results


class WorkerAgent(BaseAgent):
    """工作 Agent"""

    def __init__(self, name: str, role: str, skills: list[str]):
        super().__init__(name, role)
        self.skills = skills

    def process(self) -> list[Message]:
        responses = []
        for msg in self.inbox:
            result = self.execute(msg.content)
            responses.append(Message(
                sender=self.name,
                receiver=msg.sender,
                content=result,
                msg_type="result"
            ))
        self.inbox.clear()
        return responses

    def execute(self, task: str) -> str:
        return f"{self.name} 完成了任务：{task[:30]}..."


# ========== 模式2：去中心化 Peer-to-Peer ==========

class PeerAgent:
    """对等 Agent — 直接与其他 Agent 通信"""

    def __init__(self, name: str, expertise: str):
        self.name = name
        self.expertise = expertise
        self.knowledge: dict[str, str] = {}
        self.peers: dict[str, 'PeerAgent'] = {}
        self.mailbox: list[Message] = []

    def connect(self, peer: 'PeerAgent'):
        """连接到另一个 Agent"""
        self.peers[peer.name] = peer
        peer.peers[self.name] = self

    def send(self, receiver_name: str, content: str, msg_type: str = "info"):
        """直接发送消息给另一个 Agent"""
        if receiver_name in self.peers:
            msg = Message(sender=self.name, receiver=receiver_name, content=content, msg_type=msg_type)
            self.peers[receiver_name].mailbox.append(msg)

    def broadcast(self, content: str, msg_type: str = "info"):
        """广播消息给所有连接的 Agent"""
        for peer_name in self.peers:
            self.send(peer_name, content, msg_type)

    def process_mailbox(self) -> list[Message]:
        """处理邮箱中的消息"""
        responses = []
        for msg in self.mailbox:
            response = self.handle_message(msg)
            if response:
                responses.append(response)
        self.mailbox.clear()
        return responses

    def handle_message(self, msg: Message) -> Message | None:
        """处理收到的消息"""
        content = msg.content.lower()

        # 如果是我擅长的领域，提供帮助
        if self.expertise.lower() in content:
            result = f"{self.name}（{self.expertise}专家）处理了：{msg.content[:30]}..."
            return Message(sender=self.name, receiver=msg.sender, content=result, msg_type="result")

        # 如果不擅长，转发给可能知道的 Peer
        for peer_name, peer in self.peers.items():
            if peer.expertise.lower() in content:
                self.send(peer_name, msg.content, "task")
                return None

        return None


# ========== 模式3：分层 Hierarchical ==========

class HierarchicalAgent:
    """分层 Agent"""

    def __init__(self, name: str, level: int):
        self.name = name
        self.level = level
        self.subordinates: list['HierarchicalAgent'] = []
        self.parent: 'HierarchicalAgent' = None

    def add_subordinate(self, agent: 'HierarchicalAgent'):
        agent.parent = self
        self.subordinates.append(agent)

    def delegate(self, task: str) -> dict:
        """下派任务"""
        if not self.subordinates:
            # 叶子节点，自己执行
            return {self.name: f"执行：{task[:30]}..."}

        # 分配给下属
        results = {}
        tasks_per_agent = task  # 简化：每个下属都收到完整任务

        for sub in self.subordinates:
            print(f"  [{self.name}] → [{sub.name}] 下派任务")
            results.update(sub.delegate(tasks_per_agent))

        return results

    def report(self, results: dict) -> dict:
        """汇总上报"""
        return {
            f"{self.name}_汇总": {
                "下属数量": len(self.subordinates),
                "结果": results
            }
        }


# ========== 测试三种架构 ==========

print("="*60)
print("模式1：中心化 Orchestrator")
print("="*60)

orch = OrchestratorAgent()
orch.register_worker(WorkerAgent("W1", "数据采集", ["爬虫", "API"]))
orch.register_worker(WorkerAgent("W2", "数据分析", ["统计", "可视化"]))
orch.register_worker(WorkerAgent("W3", "报告撰写", ["写作", "排版"]))

# 协调多个子任务
result = orch.coordinate([
    {"task": "从网站采集数据", "role": "数据采集"},
    {"task": "分析用户行为数据", "role": "数据分析"},
    {"task": "撰写分析报告", "role": "报告撰写"},
])
print(f"协调结果：{json.dumps(result, ensure_ascii=False, indent=2)}")


print("\n" + "="*60)
print("模式2：去中心化 Peer-to-Peer")
print("="*60)

# 创建 Agent
p1 = PeerAgent("Alice", "Python")
p2 = PeerAgent("Bob", "JavaScript")
p3 = PeerAgent("Charlie", "Python")

# 连接
p1.connect(p2)
p1.connect(p3)
p2.connect(p3)

# Alice 遇到一个 JavaScript 问题
p1.send("Bob", "如何在 JavaScript 中实现异步编程？")
print("Alice → Bob: JavaScript 异步问题")

# Bob 处理
responses = p2.process_mailbox()
for r in responses:
    print(f"  {r.sender} → {r.receiver}: {r.content[:50]}...")

# Charlie 广播
p3.broadcast("大家好，我刚学会了 Python 的新特性！")
for name, peer in [("Alice", p1), ("Bob", p2)]:
    responses = peer.process_mailbox()
    for r in responses:
        print(f"  {r.sender} → {r.receiver}: {r.content[:50]}...")


print("\n" + "="*60)
print("模式3：分层 Hierarchical")
print("="*60)

# CEO → VP → Manager → Engineer
ceo = HierarchicalAgent("CEO", 1)
vp_eng = HierarchicalAgent("VP-Engineering", 2)
vp_product = HierarchicalAgent("VP-Product", 2)
mgr_backend = HierarchicalAgent("Manager-Backend", 3)
mgr_frontend = HierarchicalAgent("Manager-Frontend", 3)

ceo.add_subordinate(vp_eng)
ceo.add_subordinate(vp_product)
vp_eng.add_subordinate(mgr_backend)
vp_eng.add_subordinate(mgr_frontend)

# CEO 下达任务
results = ceo.delegate("开发一个新功能：用户推荐系统")
print(f"\n最终结果：{json.dumps(results, ensure_ascii=False, indent=2)}")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| 消息未送达 | 检查 Agent 是否已注册/连接 |
| 死循环转发 | 设置消息的 TTL（生存时间） |
| 分层太深 | 控制层级在 3-4 层以内 |
| 并发冲突 | 使用消息队列串行处理 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Orchestrator | 中心调度器 | 项目经理 |
| Peer-to-Peer | 对等通信 | 同事之间直接沟通 |
| Hierarchical | 分层架构 | 公司组织架构 |
| Delegation | 任务委派 | 上级分配工作 |

### ✅ 验收清单
- [ ] 能实现中心化 Orchestrator
- [ ] 能实现去中心化 P2P 通信
- [ ] 能实现分层架构
- [ ] 理解三种架构的优劣和适用场景

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 4 将学习 Agent Handoff（任务交接）机制，让 Agent 之间能平滑地移交任务。

---

## Day 4：Agent Handoff 机制

### 📅 Day 4：Agent Handoff — Agent 之间的"工作交接"

### 🧭 今日方向
实现 Agent 之间的任务交接（Handoff），包括上下文传递、状态同步、失败回退。

### 🎯 生活比喻
想象你在客服中心。你接到了一个技术问题，但你不是技术人员，你需要把这通电话"转接"给技术支持。转接时你要告诉对方：客户叫什么、问了什么、已经说了什么、你承诺了什么。这就是 Handoff——不仅要交接任务，还要交接完整的上下文。

### 📋 今日三件事
1. 设计 Handoff 的上下文格式
2. 实现平滑的任务交接
3. 实现交接失败的回退机制

### 🗺️ 手把手路线

#### Step 1：定义 Handoff 上下文
**做什么**：设计包含任务、历史、承诺等信息的交接格式
**为什么**：没有上下文的交接等于重新开始
**成功标志**：交接格式包含所有必要信息

#### Step 2：实现 Handoff 流程
**做什么**：让 Agent 能主动将任务移交给其他 Agent
**为什么**：处理不了的任务应该移交而不是硬撑
**成功标志**：任务能平滑地从一个 Agent 移交到另一个

#### Step 3：实现 Fallback 回退
**做什么**：当接收方也处理不了时，回退给原 Agent
**为什么**：避免任务陷入无人处理的状态
**成功标志**：能形成完整的交接-回退链

### 💻 代码区

```python
"""
Week 8 Day 4：Agent Handoff 机制
"""
import json
import time
from dataclasses import dataclass, field
from typing import Any, Callable

# ========== Handoff 上下文 ==========

@dataclass
class HandoffContext:
    """交接上下文 — 传递给下一个 Agent 的完整信息"""
    task_id: str                          # 任务 ID
    original_query: str                   # 原始用户问题
    conversation_history: list[dict]      # 对话历史
    current_summary: str                  # 当前进展摘要
    promises: list[str]                   # 已向用户承诺的事
    failed_attempts: list[dict]           # 之前的失败尝试
    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "task_id": self.task_id,
            "original_query": self.original_query,
            "conversation_history": self.conversation_history,
            "current_summary": self.current_summary,
            "promises": self.promises,
            "failed_attempts": self.failed_attempts,
            "metadata": self.metadata,
        }

    def __str__(self):
        return f"""交接上下文：
任务ID：{self.task_id}
原始问题：{self.original_query}
当前摘要：{self.current_summary}
已承诺：{', '.join(self.promises) if self.promises else '无'}
失败尝试：{len(self.failed_attempts)} 次"""


# ========== 可交接的 Agent ==========

class HandoffableAgent:
    """支持任务交接的 Agent"""

    def __init__(self, name: str, expertise: list[str]):
        self.name = name
        self.expertise = expertise
        self.capabilities: list[str] = []
        self.handoff_targets: list[str] = []
        self.received_handoffs: list[HandoffContext] = []

    def can_handle(self, query: str) -> bool:
        """检查是否能处理这个查询"""
        query_lower = query.lower()
        return any(exp.lower() in query_lower for exp in self.expertise)

    def process(self, query: str, context: HandoffContext = None) -> dict:
        """处理查询"""
        if not self.can_handle(query):
            return self._initiate_handoff(query, context)

        # 模拟处理
        return {
            "status": "completed",
            "agent": self.name,
            "response": f"[{self.name}] 已处理：{query[:50]}...",
            "context": context
        }

    def _initiate_handoff(self, query: str, context: HandoffContext = None) -> dict:
        """发起任务交接"""
        # 创建或更新交接上下文
        if context is None:
            context = HandoffContext(
                task_id=f"task-{int(time.time())}",
                original_query=query,
                conversation_history=[],
                current_summary="",
                promises=[],
                failed_attempts=[]
            )

        # 记录失败尝试
        context.failed_attempts.append({
            "agent": self.name,
            "reason": f"{self.name} 无法处理：超出专业范围",
            "timestamp": time.time()
        })

        context.current_summary += f" {self.name} 尝试处理但失败了。"

        return {
            "status": "handoff_required",
            "from_agent": self.name,
            "context": context,
            "reason": f"超出 {self.name} 的专业范围"
        }

    def receive_handoff(self, context: HandoffContext) -> dict:
        """接收任务交接"""
        self.received_handoffs.append(context)
        print(f"  [{self.name}] 收到交接任务 {context.task_id}")
        print(f"  原始问题：{context.original_query[:50]}...")
        print(f"  已失败 {len(context.failed_attempts)} 次")

        return self.process(context.original_query, context)


# ========== Handoff 路由器 ==========

class HandoffRouter:
    """管理 Agent 间的交接路由"""

    def __init__(self):
        self.agents: dict[str, HandoffableAgent] = {}
        self.handoff_chains: list[list[str]] = []  # 交接链记录

    def register(self, agent: HandoffableAgent):
        self.agents[agent.name] = agent

    def route(self, query: str, max_handoffs: int = 3) -> dict:
        """路由查询，支持多次交接"""
        context = HandoffContext(
            task_id=f"task-{int(time.time())}",
            original_query=query,
            conversation_history=[],
            current_summary="",
            promises=[],
            failed_attempts=[]
        )

        chain = []  # 交接链
        current_agent = None

        # 找第一个能处理的 Agent
        for agent in self.agents.values():
            if agent.can_handle(query):
                current_agent = agent
                break

        if not current_agent:
            # 没有 Agent 能处理
            return {"status": "unhandled", "reason": "没有 Agent 能处理此查询"}

        handoff_count = 0
        while current_agent and handoff_count < max_handoffs:
            chain.append(current_agent.name)
            result = current_agent.process(query, context)

            if result["status"] == "completed":
                return {
                    "status": "completed",
                    "chain": chain,
                    "result": result
                }
            elif result["status"] == "handoff_required":
                handoff_count += 1
                # 找下一个 Agent
                next_agent = self._find_next_agent(
                    current_agent.name, query, context
                )
                if next_agent:
                    current_agent = next_agent
                else:
                    return {
                        "status": "handoff_failed",
                        "chain": chain,
                        "reason": "没有可用的交接目标"
                    }

        return {
            "status": "max_handoffs_exceeded",
            "chain": chain,
            "reason": f"超过最大交接次数 ({max_handoffs})"
        }

    def _find_next_agent(self, current_name: str, query: str, context: HandoffContext):
        """找到下一个合适的 Agent"""
        failed_agents = {e["agent"] for e in context.failed_attempts}
        for agent in self.agents.values():
            if agent.name != current_name and agent.name not in failed_agents:
                if agent.can_handle(query):
                    return agent
        return None


# ========== 测试 ==========

# 创建 Agent
general = HandoffableAgent("通用助手", ["你好", "帮助"])
general.handoff_targets = ["技术专家", "业务顾问"]

tech = HandoffableAgent("技术专家", ["Python", "API", "数据库", "代码"])
tech.handoff_targets = ["数据专家"]

data = HandoffableAgent("数据专家", ["数据分析", "机器学习", "统计"])
data.handoff_targets = []

business = HandoffableAgent("业务顾问", ["定价", "合同", "商务"])
business.handoff_targets = ["法务顾问"]

# 注册
router = HandoffRouter()
router.register(general)
router.register(tech)
router.register(data)
router.register(business)

# 测试1：直接处理
print("="*50)
print("测试1：技术问题（技术专家直接处理）")
result = router.route("帮我分析这段 Python 代码的性能问题")
print(f"结果：{result['status']}")
print(f"交接链：{result.get('chain', [])}")

# 测试2：需要交接
print("\n" + "="*50)
print("测试2：数据问题（需要交接）")
result = router.route("如何用机器学习预测用户流失？")
print(f"结果：{result['status']}")
print(f"交接链：{result.get('chain', [])}")

# 测试3：无法处理
print("\n" + "="*50)
print("测试3：无人能处理的问题")
result = router.route("明天天气怎么样？")
print(f"结果：{result['status']}")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| 交接上下文丢失 | 确保 HandoffContext 完整传递 |
| 无限交接循环 | 设置 `max_handoffs` 上限 |
| 接收方无法处理 | 记录在 `failed_attempts` 中避免重复 |
| 交接链太长 | 优化 Agent 的专业范围划分 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Handoff | Agent 间的任务交接 | 电话转接 |
| HandoffContext | 交接时传递的完整信息 | 转接时的客户信息 |
| Fallback | 交接失败时的回退 | 转接失败后转回原客服 |
| Handoff Chain | 任务经过的 Agent 链 | 电话转接链 |

### ✅ 验收清单
- [ ] 理解 Handoff 的完整流程
- [ ] HandoffContext 包含必要信息
- [ ] 任务能在 Agent 间平滑交接
- [ ] 交接失败时有回退机制

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 5 将学习 CrewAI 框架，用声明式的方式定义多 Agent 团队。

---

## Day 5：CrewAI 多 Agent 团队

### 📅 Day 5：CrewAI — 声明式多 Agent 协作框架

### 🧭 今日方向
学习 CrewAI 框架，用声明式的方式定义 Agent、Task、Crew（团队），快速构建多 Agent 协作系统。

### 🎯 生俗比喻
CrewAI 就像一个"人才招聘平台"——你不需要自己去一个个找人、谈分工。你只需要描述"我需要什么团队"，CrewAI 帮你把 Agent 组织起来，分配任务，协调合作。你定义"谁做什么"，CrewAI 负责"怎么合作"。

### 📋 今日三件事
1. 理解 CrewAI 的核心概念（Agent、Task、Crew、Tool）
2. 用 CrewAI 构建一个内容创作团队
3. 实现团队内的任务分配和结果汇总

### 🗺️ 手把手路线

#### Step 1：定义 Agent
**做什么**：为每个 Agent 定义角色、目标、背景故事
**为什么**：Agent 的定义决定了它的能力和行为
**成功标志**：能创建具有不同专长的 Agent

#### Step 2：定义 Task
**做什么**：为每个 Task 定义描述、期望输出、负责 Agent
**为什么**：Task 是团队工作的基本单位
**成功标志**：Task 能正确分配给指定 Agent

#### Step 3：组建 Crew 并运行
**做什么**：将 Agent 和 Task 组成 Crew 并执行
**为什么**：Crew 是多 Agent 协作的容器
**成功标志**：Crew 能端到端完成任务

### 💻 代码区

```python
"""
Week 8 Day 5：CrewAI 多 Agent 团队
注意：需要安装 `pip install crewai crewai-tools`
"""
# 注意：如果 crewai 未安装，以下代码展示的是 CrewAI 的概念和用法
# 实际运行需要先安装：pip install crewai

# ========== 概念演示：不依赖 crewai 包的简化实现 ==========

from dataclasses import dataclass, field
from typing import Any
from openai import OpenAI

client = OpenAI()

# ========== 模拟 CrewAI 核心概念 ==========

@dataclass
class AgentDefinition:
    """Agent 定义（对应 CrewAI 的 Agent）"""
    role: str
    goal: str
    backstory: str
    verbose: bool = True
    tools: list = field(default_factory=list)

@dataclass
class TaskDefinition:
    """Task 定义（对应 CrewAI 的 Task）"""
    description: str
    expected_output: str
    agent: AgentDefinition

@dataclass
class CrewDefinition:
    """Crew 定义（对应 CrewAI 的 Crew）"""
    agents: list[AgentDefinition]
    tasks: list[TaskDefinition]
    verbose: bool = True
    process: str = "sequential"  # sequential 或 hierarchical

    def run(self) -> dict:
        """执行 Crew 任务"""
        results = {}
        context = ""

        for i, task in enumerate(self.tasks):
            print(f"\n{'='*40}")
            print(f"执行 Task {i+1}: {task.description[:50]}...")
            print(f"负责 Agent: {task.agent.role}")

            # 调用 LLM 模拟 Agent 执行
            system_prompt = f"""你是{task.agent.role}。

目标：{task.agent.goal}

背景：{task.agent.backstory}

请完成以下任务：
{task.description}

期望输出格式：{task.expected_output}

{"之前的任务结果：" + context if context else ""}"""

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "system", "content": system_prompt}],
                temperature=0.3,
                max_tokens=500
            )

            result = response.choices[0].message.content
            results[task.agent.role] = result
            context += f"\n{task.agent.role} 的结果：{result[:200]}"

            if self.verbose:
                print(f"结果：{result[:100]}...")

        return results


# ========== 实际应用：内容创作团队 ==========

# 定义 Agent
researcher = AgentDefinition(
    role="资深研究员",
    goal="深入调研指定主题，收集准确、全面的信息",
    backstory="""你是一位有10年经验的研究员，擅长从多个来源收集信息，
    并将其整理成结构化的研究报告。你注重信息的准确性和时效性。"""
)

writer = AgentDefinition(
    role="内容创作者",
    goal="将研究结果转化为引人入胜的文章",
    backstory="""你是一位专业的内容创作者，擅长将复杂的技术概念
    用通俗易懂的语言表达。你的文章既专业又有趣。"""
)

editor = AgentDefinition(
    role="资深编辑",
    goal="确保文章质量，修正错误，优化表达",
    backstory="""你是一位严谨的编辑，对文字有极高的要求。
    你会检查事实准确性、逻辑连贯性、语法错误，并提出改进建议。"""
)

# 定义 Task
task1 = TaskDefinition(
    description="调研 RAG（检索增强生成）技术的最新发展，包括主流框架、最佳实践和常见挑战。",
    expected_output="一份包含技术概述、主流框架对比、最佳实践和挑战的调研报告。",
    agent=researcher
)

task2 = TaskDefinition(
    description="基于研究结果，撰写一篇面向技术人员的科普文章，介绍 RAG 技术。",
    expected_output="一篇1500字左右的文章，包含标题、引言、正文和总结。",
    agent=writer
)

task3 = TaskDefinition(
    description="审阅文章，修正错误，优化表达，确保文章质量。",
    expected_output="修改意见列表和最终优化后的文章。",
    agent=editor
)

# 组建 Crew
content_team = CrewDefinition(
    agents=[researcher, writer, editor],
    tasks=[task1, task2, task3],
    verbose=True,
    process="sequential"
)

# 执行
print("🚀 启动内容创作团队...")
print("团队成员：研究员 → 写手 → 编辑")
results = content_team.run()

# 汇总结果
print("\n" + "="*60)
print("团队协作完成！结果汇总：")
for role, result in results.items():
    print(f"\n{role}:")
    print(f"  {result[:200]}...")


# ========== 另一个例子：技术支持团队 ==========

print("\n" + "="*60)
print("示例2：技术支持团队")

tier1 = AgentDefinition(
    role="一线技术支持",
    goal="快速响应用户问题，解决常见问题",
    backstory="你是一线技术支持工程师，熟悉产品的常见问题和解决方案。"
)

tier2 = AgentDefinition(
    role="高级技术支持",
    goal="解决复杂的技术问题，提供深入的技术方案",
    backstory="你是高级技术支持工程师，精通系统架构和底层原理。"
)

support_team = CrewDefinition(
    agents=[tier1, tier2],
    tasks=[
        TaskDefinition(
            description="用户报告：'API 调用返回 500 错误，已经持续 2 小时了。'",
            expected_output="问题分析和初步解决方案。",
            agent=tier1
        ),
        TaskDefinition(
            description="基于一线支持的分析，深入排查 API 500 错误的根本原因。",
            expected_output="根本原因分析和详细的修复步骤。",
            agent=tier2
        )
    ],
    verbose=True
)

print("启动技术支持团队...")
results = support_team.run()
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| crewai 安装失败 | 尝试 `pip install crewai --no-deps` 后单独安装依赖 |
| Agent 输出不理想 | 优化 backstory 和 goal 的描述 |
| 任务间上下文丢失 | 确保 process="sequential" 以传递上下文 |
| 成本过高 | 使用 gpt-4o-mini 而非 gpt-4o |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Agent | 有角色和目标的智能体 | 团队成员 |
| Task | 需要完成的具体工作 | 工作任务 |
| Crew | Agent 和 Task 的集合 | 项目团队 |
| Process | 任务执行的顺序 | 工作流程 |
| Tool | Agent 可以使用的工具 | 员工的工具箱 |

### ✅ 验收清单
- [ ] 能定义 Agent 的角色、目标、背景
- [ ] 能定义 Task 的描述和期望输出
- [ ] Crew 能按顺序执行多个 Task
- [ ] 理解 sequential 和 hierarchical 的区别

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Week 8 结束！下周将进入项目实战，用前三周学到的知识构建一个完整的 RAG + Agent 系统。

---

## 📚 本周总结

| Day | 主题 | 核心技能 |
|-----|------|---------|
| 1 | MCP 协议 | Agent 的标准接口协议 |
| 2 | A2A + NLWeb | Agent 间通信和 Web 交互 |
| 3 | 多 Agent 架构 | 中心化、去中心化、分层模式 |
| 4 | Agent Handoff | 任务交接和上下文传递 |
| 5 | CrewAI | 声明式多 Agent 协作框架 |

### 🎯 本周产出
- [x] MCP Server/Client 实现
- [x] A2A 通信协议实现
- [x] 三种多 Agent 架构实现
- [x] Agent Handoff 机制
- [x] CrewAI 团队原型

### 📖 推荐阅读
- [MCP Specification](https://modelcontextprotocol.io/)
- [A2A Protocol (Google)](https://github.com/google/A2A)
- [CrewAI Documentation](https://docs.crewai.com/)
- [Multi-Agent Systems Survey](https://arxiv.org/abs/2308.08155)
