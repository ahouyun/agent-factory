# 📅 Week 6 Day 1：Function Calling / Tool Use

## 🧭 今日方向
> 理解 Function Calling（函数调用）/ Tool Use（工具使用）的核心机制，掌握如何让 LLM 不再"空谈"，而是真正调用外部工具来完成任务。这是 Agent 从"只会说"到"能做事"的关键能力。

## 🎯 生活比喻
> 想象你是一个公司的 CEO。你很聪明，知道该做什么，但你不会亲自去写代码、查数据库、发邮件。你会把任务分配给专业的下属（工具），然后根据他们返回的结果做决策。Function Calling 就是让 LLM 从"只会说"变成"能做事"的桥梁——LLM 负责理解意图和选择工具，工具负责真正执行操作。

## 📋 今日三件事
1. 理解 Function Calling / Tool Use 的定义和完整工作流程
2. 掌握 OpenAI 的函数调用格式（JSON Schema 定义工具、参数校验）
3. 实现完整的工具注册、调用、解析的代码示例（5 个工具 + 工具注册中心）

## 🗺️ 手把手路线

### Step 1：理解 Tool Use 的工作流程
- **做什么**: 了解 LLM 如何决定调用哪个工具、传什么参数
- **为什么**: 这是整个 Function Calling 的基础，不理解流程就无法正确实现
- **成功标志**: 能画出完整的调用流程图（用户请求 → LLM 决策 → 工具调用 → 结果返回 → LLM 总结）

### Step 2：掌握工具定义格式
- **做什么**: 学习用 JSON Schema 定义工具的 name、description、parameters
- **为什么**: 工具定义是 LLM 理解工具用途的唯一依据，定义不好 LLM 就调不对
- **成功标志**: 能为任意功能手写出符合规范的工具定义

### Step 3：实现完整的 Tool Calling 循环
- **做什么**: 写出工具注册、请求发送、响应解析、工具执行的完整代码
- **为什么**: 只有端到端跑通才算真正掌握
- **成功标志**: 代码能正确路由到对应工具并返回结果，支持多轮工具调用

## 💻 代码区

### 示例 1：最简单的 Function Calling

```python
"""
最简单的 Function Calling 示例
演示 LLM 如何决定调用工具并返回结果

安装依赖: pip install openai
设置环境变量: export OPENAI_API_KEY="your-key-here"
"""
import json
from openai import OpenAI

# 初始化客户端
client = OpenAI()

# 第一步：定义工具（JSON Schema 格式）
# 每个工具包含 name（名称）、description（描述）、parameters（参数定义）
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定城市的当前天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "城市名称，例如：北京、上海、深圳"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "温度单位，默认摄氏度"
                    }
                },
                "required": ["city"]  # city 是必填参数
            }
        }
    }
]

# 第二步：发送带有工具定义的请求
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？"}
    ],
    tools=tools,
    tool_choice="auto"  # auto=模型决定 | required=必须调用 | none=不调用
)

# 第三步：解析响应
message = response.choices[0].message
print(f"模型是否决定调用工具: {message.tool_calls is not None}")

# 如果模型决定调用工具
if message.tool_calls:
    tool_call = message.tool_calls[0]
    print(f"调用的工具: {tool_call.function.name}")
    print(f"传入的参数: {tool_call.function.arguments}")

    # 第四步：执行工具（这里是模拟实现）
    args = json.loads(tool_call.function.arguments)
    # 模拟天气查询结果
    weather_result = {
        "city": args["city"],
        "temperature": "25°C",
        "condition": "晴朗",
        "humidity": "45%"
    }

    # 第五步：将工具结果返回给模型
    messages = [
        {"role": "user", "content": "北京今天天气怎么样？"},
        # 注意：这里要包含 assistant 的 tool_calls 消息
        {
            "role": "assistant",
            "content": message.content,
            "tool_calls": [
                {
                    "id": tool_call.id,
                    "type": "function",
                    "function": {
                        "name": tool_call.function.name,
                        "arguments": tool_call.function.arguments
                    }
                }
            ]
        },
        # 工具执行结果
        {
            "role": "tool",
            "tool_call_id": tool_call.id,  # 必须与 tool_call.id 匹配
            "content": json.dumps(weather_result, ensure_ascii=False)
        }
    ]

    # 让模型根据工具结果生成最终回复
    final_response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages
    )
    print(f"\n最终回复: {final_response.choices[0].message.content}")
```

**预期输出：**
```
模型是否决定调用工具: True
调用的工具: get_weather
传入的参数: {"city": "北京"}

最终回复: 北京今天天气晴朗，气温25°C，湿度45%，非常适合外出活动。
```

**常见错误：**
- `tool_call_id` 不匹配：每个 tool_call 都有唯一 id，必须用 `tool_call.id` 对应
- 消息顺序错误：必须先放 assistant 消息（含 tool_calls），再放 tool 消息

### 示例 2：工具注册中心模式（Tool Registry）

```python
"""
工具注册中心模式 —— 管理多个工具的最佳实践
就像一个公司的部门通讯录，每个部门负责不同的业务

本示例定义 5 个工具：计算器、网络搜索、天气查询、文件读取、数据库查询
"""
import json
from typing import Any, Callable, Dict, List


class ToolRegistry:
    """
    工具注册中心
    统一管理工具的定义（给 LLM 看）和执行函数（Python 实际调用）
    """
    def __init__(self):
        self.definitions: List[Dict] = []     # 工具定义列表
        self.executors: Dict[str, Callable] = {}  # 工具执行函数映射

    def register(self, name: str, description: str, parameters: Dict,
                 executor: Callable) -> None:
        """注册一个新工具"""
        self.definitions.append({
            "type": "function",
            "function": {
                "name": name,
                "description": description,
                "parameters": parameters
            }
        })
        self.executors[name] = executor
        print(f"[注册] 工具 '{name}' 已注册")

    def execute(self, name: str, arguments: str) -> str:
        """执行指定工具，返回 JSON 字符串"""
        if name not in self.executors:
            return json.dumps({"error": f"未知工具: {name}"}, ensure_ascii=False)
        try:
            args = json.loads(arguments)
            result = self.executors[name](**args)
            return json.dumps(result, ensure_ascii=False)
        except Exception as e:
            return json.dumps({"error": str(e)}, ensure_ascii=False)

    def get_definitions(self) -> List[Dict]:
        """获取所有工具定义（传给 LLM）"""
        return self.definitions

    def list_tools(self) -> List[str]:
        """列出所有已注册工具名"""
        return [d["function"]["name"] for d in self.definitions]


# ========== 定义 5 个工具的执行函数 ==========

def calculator(expression: str) -> dict:
    """计算器工具 —— 执行数学计算"""
    try:
        # 注意：生产环境应使用 sympy 或 ast.literal_eval 等安全方式
        result = eval(expression)
        return {"result": result, "expression": expression}
    except Exception as e:
        return {"error": f"计算错误: {str(e)}"}


def web_search(query: str) -> dict:
    """模拟网络搜索工具"""
    # 实际项目中调用搜索引擎 API（如 Google、Bing）
    return {
        "results": [
            {"title": f"关于'{query}'的搜索结果1", "url": "https://example.com/1"},
            {"title": f"关于'{query}'的搜索结果2", "url": "https://example.com/2"}
        ],
        "total_results": 2,
        "query": query
    }


def get_weather(city: str, unit: str = "celsius") -> dict:
    """模拟天气查询工具"""
    # 实际项目中调用天气 API（如和风天气、OpenWeatherMap）
    mock_data = {
        "北京": {"temp": "25°C", "condition": "晴", "wind": "东北风3级"},
        "上海": {"temp": "28°C", "condition": "多云", "wind": "东南风2级"},
        "深圳": {"temp": "32°C", "condition": "阵雨", "wind": "南风4级"},
    }
    data = mock_data.get(city, {"temp": "20°C", "condition": "未知", "wind": "无"})
    return {"city": city, **data, "unit": unit}


def read_file(file_path: str) -> dict:
    """模拟文件读取工具"""
    # 实际项目中使用 open() 读取文件
    import os
    # 模拟返回
    return {
        "file_path": file_path,
        "content": f"这是 {file_path} 的模拟内容...",
        "size": "2.3KB",
        "exists": True
    }


def database_query(sql: str) -> dict:
    """模拟数据库查询工具"""
    # 实际项目中连接真实数据库执行 SQL
    return {
        "sql": sql,
        "rows": [
            {"id": 1, "name": "张三", "department": "技术部"},
            {"id": 2, "name": "李四", "department": "产品部"}
        ],
        "row_count": 2,
        "execution_time": "0.02s"
    }


# ========== 注册所有工具 ==========
registry = ToolRegistry()

# 注册计算器
registry.register(
    name="calculator",
    description="执行数学计算，支持基本运算（加减乘除）和数学函数",
    parameters={
        "type": "object",
        "properties": {
            "expression": {
                "type": "string",
                "description": "数学表达式，例如：'2 + 3 * 4' 或 'sqrt(144)'"
            }
        },
        "required": ["expression"]
    },
    executor=calculator
)

# 注册网络搜索
registry.register(
    name="web_search",
    description="在互联网上搜索信息，返回相关网页链接和摘要",
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "搜索关键词，例如：'Python 教程'"
            }
        },
        "required": ["query"]
    },
    executor=web_search
)

# 注册天气查询
registry.register(
    name="get_weather",
    description="查询指定城市的实时天气信息，包括温度、天气状况、风力",
    parameters={
        "type": "object",
        "properties": {
            "city": {
                "type": "string",
                "description": "城市名称，例如：'北京'、'上海'"
            },
            "unit": {
                "type": "string",
                "enum": ["celsius", "fahrenheit"],
                "description": "温度单位，默认摄氏度"
            }
        },
        "required": ["city"]
    },
    executor=get_weather
)

# 注册文件读取
registry.register(
    name="read_file",
    description="读取本地文件的内容，支持文本文件",
    parameters={
        "type": "object",
        "properties": {
            "file_path": {
                "type": "string",
                "description": "文件的完整路径，例如：'/home/user/data.txt'"
            }
        },
        "required": ["file_path"]
    },
    executor=read_file
)

# 注册数据库查询
registry.register(
    name="database_query",
    description="执行 SQL 数据库查询，返回查询结果",
    parameters={
        "type": "object",
        "properties": {
            "sql": {
                "type": "string",
                "description": "SQL 查询语句，例如：'SELECT * FROM users LIMIT 10'"
            }
        },
        "required": ["sql"]
    },
    executor=database_query
)

# 验证注册结果
print(f"\n已注册 {len(registry.definitions)} 个工具")
print(f"工具列表: {registry.list_tools()}")
```

**预期输出：**
```
[注册] 工具 'calculator' 已注册
[注册] 工具 'web_search' 已注册
[注册] 工具 'get_weather' 已注册
[注册] 工具 'read_file' 已注册
[注册] 工具 'database_query' 已注册

已注册 5 个工具
工具列表: ['calculator', 'web_search', 'get_weather', 'read_file', 'database_query']
```

### 示例 3：完整的 Agent Loop（多轮工具调用）

```python
"""
完整的 Agent Loop —— 持续调用工具直到模型给出最终答案
这是 Function Calling 最核心的使用模式

流程: 用户提问 → LLM 思考 → 调用工具 → 拿到结果 → LLM 再思考 → ... → 最终回答
"""
import json
from openai import OpenAI

client = OpenAI()


# --- 工具定义（传给 LLM 的 JSON Schema）---
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "calculator",
            "description": "执行数学计算，支持加减乘除",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "数学表达式"}
                },
                "required": ["expression"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取城市天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名"}
                },
                "required": ["city"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "搜索互联网信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "搜索关键词"}
                },
                "required": ["query"]
            }
        }
    }
]


# --- 工具执行器（模拟实现）---
def execute_tool(name: str, args: dict) -> str:
    """根据工具名执行对应函数，返回 JSON 字符串"""
    if name == "calculator":
        try:
            result = eval(args["expression"])
            return json.dumps({"result": result, "expression": args["expression"]})
        except:
            return json.dumps({"error": "计算错误"})
    elif name == "get_weather":
        mock = {
            "北京": {"temp": "26°C", "condition": "晴"},
            "上海": {"temp": "24°C", "condition": "多云"},
            "广州": {"temp": "30°C", "condition": "阵雨"}
        }
        data = mock.get(args["city"], {"temp": "20°C", "condition": "未知"})
        return json.dumps({"city": args["city"], **data})
    elif name == "web_search":
        return json.dumps({
            "results": [f"关于'{args['query']}'的搜索结果"],
            "source": "模拟搜索引擎"
        })
    return json.dumps({"error": f"未知工具: {name}"})


def agent_loop(user_input: str, max_iterations: int = 5, verbose: bool = True):
    """
    Agent 循环：持续处理直到模型不再调用工具
    这是 Function Calling 的核心模式，也是 Agent 的基础
    """
    messages = [
        {"role": "system", "content": "你是一个有用的助手，可以使用工具来回答问题。请用中文回答。"},
        {"role": "user", "content": user_input}
    ]

    for iteration in range(max_iterations):
        if verbose:
            print(f"\n--- 第 {iteration + 1} 轮 ---")

        # 调用 LLM
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=TOOLS,
            tool_choice="auto"
        )

        assistant_message = response.choices[0].message

        # 检查：如果模型不再调用工具，说明它准备好最终回答了
        if not assistant_message.tool_calls:
            if verbose:
                print(f"[完成] 模型给出最终回复")
                print(f"回复: {assistant_message.content}")
            return assistant_message.content

        # 有工具调用，逐一执行
        # 关键：必须先将 assistant 消息加入历史
        messages.append(assistant_message)

        for tool_call in assistant_message.tool_calls:
            func_name = tool_call.function.name
            func_args = tool_call.function.arguments

            if verbose:
                print(f"[调用工具] {func_name}({func_args})")

            # 执行工具
            result = execute_tool(func_name, json.loads(func_args))

            if verbose:
                print(f"[工具结果] {result}")

            # 将工具执行结果加入消息历史
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,  # 必须匹配 tool_call 的 id
                "content": result
            })

    return "达到最大迭代次数，停止循环"


# --- 运行示例 ---
if __name__ == "__main__":
    # 用户问了一个需要多步计算的问题
    answer = agent_loop(
        "帮我计算一下：北京今天的温度是26度，上海是24度，温差是多少？"
        "如果我有100万，按温差的倍数来算，我最终有多少钱？"
    )
    print(f"\n=== 最终答案 ===\n{answer}")
```

**预期输出：**
```
--- 第 1 轮 ---
[调用工具] get_weather({"city": "北京"})
[工具结果] {"city": "北京", "temp": "26°C", "condition": "晴"}
[调用工具] get_weather({"city": "上海"})
[工具结果] {"city": "上海", "temp": "24°C", "condition": "多云"}

--- 第 2 轮 ---
[调用工具] calculator({"expression": "26 - 24"})
[工具结果] {"result": 2, "expression": "26 - 24"}

--- 第 3 轮 ---
[调用工具] calculator({"expression": "1000000 * 2"})
[工具结果] {"result": 2000000, "expression": "1000000 * 2"}

--- 第 4 轮 ---
[完成] 模型给出最终回复

=== 最终答案 ===
北京和上海的温度差是2度（26°C - 24°C = 2°C）。如果你有100万，按温差的倍数（2倍）计算，你最终有200万元。
```

### 示例 4：使用 LangChain 简化 Tool Calling

```python
"""
使用 LangChain 的 @tool 装饰器简化工具定义
LangChain 将 JSON Schema 生成、参数校验等步骤自动化

安装依赖: pip install langchain langchain-openai
"""
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, ToolMessage
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

# 初始化 LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)


# ========== 使用 @tool 装饰器定义工具 ==========
# LangChain 会自动从函数签名和文档字符串生成 JSON Schema

@tool
def get_weather(city: str, unit: str = "celsius") -> str:
    """获取指定城市的天气信息。

    Args:
        city: 城市名称，如 '北京'、'上海'
        unit: 温度单位，celsius 或 fahrenheit
    """
    mock_data = {
        "北京": {"temp": 25, "condition": "晴", "humidity": 40},
        "上海": {"temp": 28, "condition": "多云", "humidity": 65},
        "深圳": {"temp": 32, "condition": "阵雨", "humidity": 80},
    }
    data = mock_data.get(city, {"temp": 20, "condition": "未知", "humidity": 50})
    return f"{city}天气: {data['condition']}, {data['temp']}°C, 湿度{data['humidity']}%"


@tool
def search_products(keyword: str) -> str:
    """搜索产品数据库。

    Args:
        keyword: 搜索关键词
    """
    mock_products = [
        {"name": "Python 编程入门", "price": 59},
        {"name": "机器学习实战", "price": 79},
        {"name": "AI Agent 开发指南", "price": 89},
    ]
    results = [p for p in mock_products if keyword.lower() in p["name"].lower()]
    if not results:
        return "未找到相关产品"
    return "\n".join([f"- {p['name']}: ¥{p['price']}" for p in results])


@tool
def calculate(expression: str) -> str:
    """计算数学表达式。

    Args:
        expression: 数学表达式，如 '2 + 3 * 4'
    """
    try:
        allowed_chars = "0123456789+-*/.() "
        if all(c in allowed_chars for c in expression):
            result = eval(expression)
            return f"{expression} = {result}"
        return "不支持的表达式"
    except Exception as e:
        return f"计算错误: {str(e)}"


# ========== 方式1：手动处理工具调用 ==========
print("=== 方式1：手动处理工具调用 ===")
tools = [get_weather, search_products, calculate]
llm_with_tools = llm.bind_tools(tools)

# 发送请求
response = llm_with_tools.invoke("北京今天天气怎么样？")
print(f"LLM 决定调用: {[tc['name'] for tc in response.tool_calls]}")

# 手动执行工具并回传
if response.tool_calls:
    tool_map = {t.name: t for t in tools}
    for tc in response.tool_calls:
        result = tool_map[tc["name"]].invoke(tc["args"])
        print(f"工具结果: {result}")

        # 回传结果给 LLM
        final = llm_with_tools.invoke([
            HumanMessage(content="北京今天天气怎么样？"),
            response,
            ToolMessage(content=result, tool_call_id=tc["id"])
        ])
        print(f"最终回答: {final.content}")


# ========== 方式2：使用 AgentExecutor 自动执行 ==========
print("\n=== 方式2：AgentExecutor 自动执行 ===")

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有用的助手。可以使用工具来回答问题。"),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,       # 打印详细执行过程
    max_iterations=5    # 防止无限循环
)

result = executor.invoke({"input": "北京和上海哪个更热？温度差多少？"})
print(f"\n最终回答: {result['output']}")
```

**预期输出（示例）：**
```
=== 方式1：手动处理工具调用 ===
LLM 决定调用: ['get_weather']
工具结果: 北京天气: 晴, 25°C, 湿度40%
最终回答: 北京今天天气晴朗，气温25°C...

=== 方式2：AgentExecutor 自动执行 ===

> Entering new AgentExecutor chain...
Invoking: `get_weather` with `{'city': '北京'}`
北京天气: 晴, 25°C, 湿度40%
Invoking: `get_weather` with `{'city': '上海'}`
上海天气: 多云, 28°C, 湿度65%

> Finished chain.
最终回答: 上海更热。上海28°C，北京25°C，温差3°C。
```

### 示例 5：错误处理最佳实践

```python
"""
Function Calling 错误处理最佳实践
生产环境中必须考虑各种异常情况
"""
import json
from typing import Any, Callable


class SafeToolExecutor:
    """安全的工具执行器"""

    def __init__(self):
        self.tools: dict[str, Callable] = {}
        self.log: list[dict] = []

    def register(self, name: str, func: Callable):
        """注册工具"""
        self.tools[name] = func

    def execute(self, name: str, arguments: str) -> str:
        """
        安全执行工具
        - 捕获所有异常
        - 记录执行日志
        - 返回友好的错误信息
        """
        log_entry = {"tool": name, "args": arguments, "status": "unknown"}

        # 检查工具是否存在
        if name not in self.tools:
            log_entry["status"] = "error"
            log_entry["error"] = f"未知工具: {name}"
            self.log.append(log_entry)
            return json.dumps({"error": f"未知工具: {name}"}, ensure_ascii=False)

        try:
            # 解析参数
            args = json.loads(arguments)
        except json.JSONDecodeError as e:
            log_entry["status"] = "error"
            log_entry["error"] = f"参数解析失败: {str(e)}"
            self.log.append(log_entry)
            return json.dumps({"error": f"参数格式错误: {str(e)}"}, ensure_ascii=False)

        try:
            # 执行工具
            result = self.tools[name](**args)
            log_entry["status"] = "success"
            log_entry["result_preview"] = str(result)[:100]
            self.log.append(log_entry)
            return json.dumps(result, ensure_ascii=False)
        except TypeError as e:
            # 参数类型不匹配
            log_entry["status"] = "error"
            log_entry["error"] = f"参数错误: {str(e)}"
            self.log.append(log_entry)
            return json.dumps({"error": f"参数类型错误: {str(e)}"}, ensure_ascii=False)
        except Exception as e:
            # 其他异常
            log_entry["status"] = "error"
            log_entry["error"] = str(e)
            self.log.append(log_entry)
            return json.dumps({"error": f"执行失败: {str(e)}"}, ensure_ascii=False)

    def print_log(self):
        """打印执行日志"""
        print("\n=== 工具执行日志 ===")
        for entry in self.log:
            status_icon = "✓" if entry["status"] == "success" else "✗"
            print(f"  [{status_icon}] {entry['tool']}: {entry['status']}")
            if "error" in entry:
                print(f"      错误: {entry['error']}")


# --- 使用示例 ---
executor = SafeToolExecutor()

# 注册工具
executor.register("calculate", lambda expression: {"result": eval(expression)})
executor.register("greet", lambda name: {"message": f"你好，{name}！"})

# 正常执行
print(executor.execute("calculate", '{"expression": "2 + 3"}'))

# 参数错误
print(executor.execute("calculate", '{"wrong_key": "2 + 3"}'))

# 未知工具
print(executor.execute("unknown_tool", '{}'))

# JSON 格式错误
print(executor.execute("calculate", 'not valid json'))

# 打印日志
executor.print_log()
```

**预期输出：**
```
{"result": 5}
{"error": "参数类型错误: calculate() missing a required argument: 'expression'"}
{"error": "未知工具: unknown_tool"}
{"error": "参数格式错误: Expecting value: line 1 column 1 (char 0)"}

=== 工具执行日志 ===
  [✓] calculate: success
  [✗] calculate: error
      错误: 参数类型错误: calculate() missing a required argument: 'expression'
  [✗] unknown_tool: error
      错误: 未知工具: unknown_tool
  [✗] calculate: error
      错误: 参数格式错误: Expecting value: line 1 column 1 (char 0)
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 模型不调用工具，直接回答 | 检查 `tool_choice` 是否为 `"auto"`；检查工具的 `description` 是否清晰到让模型知道该用工具 |
| 2 | `json.loads` 解析参数报错 | LLM 有时会生成不合法的 JSON，加 try-except 处理 |
| 3 | 工具调用了但结果没传回去 | 确保 messages 中先 append assistant 消息（含 tool_calls），再 append tool 消息 |
| 4 | `tool_call_id` 不匹配 | 每个 tool_call 都有唯一 id，必须用 `tool_call.id` 对应 |
| 5 | 模型反复调用同一个工具 | 设置 `max_iterations` 上限，避免无限循环 |
| 6 | 工具定义参数类型错误 | 检查 JSON Schema 是否正确，特别是 `type` 和 `enum` 字段 |
| 7 | `bind_tools` 报错 | 确保使用 gpt-4o 或 gpt-4o-mini（支持 function calling 的模型） |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Function Calling | LLM 决定调用哪个函数、传什么参数的能力 |
| Tool Use | Function Calling 的另一种叫法，更通用 |
| JSON Schema | 描述数据结构的标准格式，LLM 用它理解工具参数 |
| tool_choice | 控制模型调用工具的策略：auto / required / none |
| tool_call_id | 每次工具调用的唯一标识，用于匹配请求和响应 |
| Tool Registry | 工具注册中心，集中管理所有工具的定义和执行 |
| Agent Loop | 持续循环调用工具直到模型给出最终答案的模式 |
| bind_tools | LangChain 中将工具定义绑定到 LLM 的方法 |
| ToolMessage | LangChain 中将工具执行结果回传给 LLM 的消息类型 |

## ✅ 验收清单
- [ ] 能解释 Function Calling 的完整 5 步工作流程
- [ ] 能手写一个符合规范的工具定义（JSON Schema）
- [ ] 能实现工具注册中心模式管理 5+ 个工具
- [ ] 能正确解析工具调用并执行（包括错误处理）
- [ ] 能实现 Agent Loop 多轮工具调用
- [ ] 能用 LangChain 的 @tool 装饰器简化实现
- [ ] 能处理工具调用中的常见错误

## 📝 复盘小纸条
- 今天最大的收获: _______________
- 还不太确定的: _______________

## 📥 明日同步接口
- 今日完成度: _______________
- 卡点描述: _______________
- 代码是否能跑通: _______________
- 明天希望: _______________
