# 📅 Week 6 Day 1：Function Calling / Tool Use 原理与实现

## 🧭 今日方向
> Function Calling 是 Agent 的"手脚"——让 LLM 从"只能说话"进化到"能做事"。理解其工作原理，掌握 OpenAI 和 LangChain 两种实现方式。

## 🎯 生活比喻
> Function Calling 就像给 LLM 配了一个"万能遥控器"。以前它只能跟你聊天，现在它可以按下遥控器上的按钮（调用函数）来查天气、查数据库、发邮件。LLM 的职责是"决定按哪个按钮"，真正的操作由外部函数执行。

## 📋 今日三件事
1. 理解 Function Calling 的完整流程（定义→选择→调用→回传）
2. 用原生 OpenAI API 实现 Function Calling
3. 用 LangChain 的 `@tool` 装饰器简化实现

## 🗺️ 手把手路线

### Step 1: Function Calling 原理
- 做什么: 画出 Function Calling 的交互流程图
- 为什么: 理解 LLM 不是"执行函数"，而是"输出函数调用指令"
- 成功标志: 能说出 4 步流程（用户提问→LLM 选择函数→执行→回传结果）

### Step 2: 原生 API 实现
- 做什么: 用 OpenAI 原生 API 定义工具并处理函数调用
- 为什么: 理解底层原理，不依赖框架
- 成功标志: LLM 能正确选择并调用定义的函数

### Step 3: LangChain 简化实现
- 做什么: 用 `@tool` 装饰器快速定义工具
- 为什么: 生产环境中框架能大幅简化代码
- 成功标志: 5 分钟内定义一个新工具并投入使用

## 💻 代码区

```python
"""
Week 6 Day 1: Function Calling / Tool Use
安装依赖: pip install langchain langchain-openai
"""

import json
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, SystemMessage

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# ========== 1. 原生 OpenAI Function Calling ==========
print("=== 1. 原生 OpenAI Function Calling ===")

# Step 1: 定义工具（JSON Schema 格式）
tools_definition = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定城市的天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "城市名称，如 '北京'、'上海'"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "温度单位"
                    }
                },
                "required": ["city"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_database",
            "description": "搜索产品数据库",
            "parameters": {
                "type": "object",
                "properties": {
                    "keyword": {
                        "type": "string",
                        "description": "搜索关键词"
                    },
                    "category": {
                        "type": "string",
                        "enum": ["electronics", "clothing", "food"],
                        "description": "产品类别"
                    }
                },
                "required": ["keyword"]
            }
        }
    }
]

# Step 2: 模拟函数执行（真实项目中是实际的 API 调用）
def get_weather(city: str, unit: str = "celsius") -> dict:
    """模拟天气 API"""
    mock_data = {
        "北京": {"temp": 25, "condition": "晴", "humidity": 40},
        "上海": {"temp": 28, "condition": "多云", "humidity": 65},
        "深圳": {"temp": 32, "condition": "阵雨", "humidity": 80},
    }
    data = mock_data.get(city, {"temp": 20, "condition": "未知", "humidity": 50})
    return {"city": city, **data, "unit": unit}

def search_database(keyword: str, category: str = None) -> dict:
    """模拟数据库搜索"""
    mock_products = [
        {"name": "Python 编程入门", "price": 59, "category": "electronics"},
        {"name": "机器学习实战", "price": 79, "category": "electronics"},
        {"name": "AI Agent 开发指南", "price": 89, "category": "electronics"},
    ]
    results = [p for p in mock_products if keyword.lower() in p["name"].lower()]
    return {"results": results, "total": len(results)}

# Step 3: 调用 LLM（不自动执行函数）
from openai import OpenAI
# 注意：这里用 LangChain 封装，但原理相同

# ========== 2. LangChain Function Calling ==========
print("\n=== 2. LangChain Function Calling ===")

# 用 @tool 装饰器定义工具（自动提取文档和参数类型）
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
    return json.dumps({"city": city, **data, "unit": unit}, ensure_ascii=False)

@tool
def search_products(keyword: str, category: str = None) -> str:
    """搜索产品数据库。

    Args:
        keyword: 搜索关键词
        category: 产品类别（可选）
    """
    mock_products = [
        {"name": "Python 编程入门", "price": 59, "category": "电子书"},
        {"name": "机器学习实战", "price": 79, "category": "电子书"},
        {"name": "AI Agent 开发指南", "price": 89, "category": "电子书"},
        {"name": "机械键盘", "price": 299, "category": "外设"},
    ]
    results = [p for p in mock_products if keyword.lower() in p["name"].lower()]
    return json.dumps({"results": results, "total": len(results)}, ensure_ascii=False)

@tool
def calculate(expression: str) -> str:
    """计算数学表达式。

    Args:
        expression: 数学表达式，如 '2 + 3 * 4'
    """
    try:
        # 安全的数学计算（生产环境应用 ast.literal_eval 或 sympy）
        allowed_chars = "0123456789+-*/.() "
        if all(c in allowed_chars for c in expression):
            result = eval(expression)
            return json.dumps({"expression": expression, "result": result})
        return json.dumps({"error": "不支持的表达式"})
    except Exception as e:
        return json.dumps({"error": str(e)})

# 绑定工具到 LLM
tools = [get_weather, search_products, calculate]
llm_with_tools = llm.bind_tools(tools)

# 测试 1：需要调用工具
print("--- 测试 1: 天气查询 ---")
response = llm_with_tools.invoke("北京今天天气怎么样？")
print(f"LLM 决定调用: {response.tool_calls}")

# 模拟执行工具并回传结果
if response.tool_calls:
    for tool_call in response.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]

        # 执行对应的工具
        tool_map = {t.name: t for t in tools}
        result = tool_map[tool_name].invoke(tool_args)
        print(f"工具结果: {result}")

        # 将结果回传给 LLM
        from langchain_core.messages import ToolMessage
        final_response = llm_with_tools.invoke([
            HumanMessage(content="北京今天天气怎么样？"),
            response,
            ToolMessage(content=result, tool_call_id=tool_call["id"])
        ])
        print(f"最终回答: {final_response.content}")

# ========== 3. 自动工具执行（LangChain Agent）==========
print("\n=== 3. 自动工具执行 ===")

from langchain.agents import create_tool_calling_agent, AgentExecutor

# 定义 Prompt
from langchain.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有用的助手。可以使用工具来回答问题。"),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# 创建 Agent
agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True, max_iterations=5)

# 测试自动执行
print("--- 测试: 多步工具调用 ---")
result = executor.invoke({"input": "北京和上海哪个更热？"})
print(f"最终回答: {result['output']}")

# ========== 4. 错误处理 ==========
print("\n=== 4. 工具调用错误处理 ===")

@tool
def risky_tool(query: str) -> str:
    """一个可能出错的工具。"""
    if "error" in query.lower():
        raise ValueError("模拟的工具执行错误")
    return f"成功处理: {query}"

# 包装工具执行，捕获错误
def safe_tool_executor(tool_func, args):
    """安全的工具执行器"""
    try:
        result = tool_func.invoke(args)
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e), "tool": tool_func.name}

# 测试
print(safe_tool_executor(risky_tool, {"query": "hello"}))
print(safe_tool_executor(risky_tool, {"query": "trigger error"}))

print("""
=== Function Calling 最佳实践 ===

1. 工具命名: 使用 snake_case，名称要清晰描述功能
2. 工具描述: 写清楚什么时候应该用这个工具
3. 参数设计: 必填参数放 required，可选参数给默认值
4. 错误处理: 工具内部要捕获异常，返回友好的错误信息
5. 安全性: 永远不要直接 eval 用户输入
6. 日志记录: 记录每次工具调用的输入输出
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | `tool_calls` 为空 | 检查工具描述是否清晰，LLM 可能认为不需要工具 |
| 2 | 工具参数类型错误 | 确保 `@tool` 的类型注解正确 |
| 3 | Agent 陷入循环 | 设置 `max_iterations` 限制 |
| 4 | `bind_tools` 报错 | 确保使用 `gpt-4o` 或 `gpt-4o-mini`（支持 function calling） |
| 5 | 工具执行超时 | 给工具设置超时机制，或用异步执行 |
| 6 | 模型不支持 function calling | 检查模型列表，gpt-3.5-turbo 也支持但效果较差 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Function Calling | LLM 输出函数调用指令，由外部系统执行 |
| Tool | 可被 LLM 调用的外部函数/服务 |
| bind_tools | 将工具定义绑定到 LLM，使其知道有哪些工具可用 |
| tool_calls | LLM 返回的工具调用列表（名称 + 参数） |
| ToolMessage | 将工具执行结果回传给 LLM 的消息类型 |
| Agent | 能自主决定调用哪些工具的智能体 |
| AgentExecutor | 自动执行 Agent 决定的工具调用的执行器 |
| JSON Schema | 描述函数参数结构的 JSON 格式标准 |
| 参数校验 | LLM 根据 Schema 生成符合格式的参数 |
| 工具编排 | 多个工具的调用顺序和协作策略 |

## ✅ 验收清单
- [ ] 能说出 Function Calling 的 4 步流程
- [ ] 能用 `@tool` 装饰器定义工具
- [ ] 能用 `bind_tools` 绑定工具到 LLM
- [ ] 理解 `tool_calls` 和 `ToolMessage` 的关系
- [ ] 能实现工具调用的错误处理
- [ ] 能用 `AgentExecutor` 实现自动工具执行

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
