# 📅 Week 4 Day 2：ReAct 范式——推理与行动交替

## 🧭 今日方向
> 深入学习 ReAct（Reasoning + Acting）范式——目前最流行的 Agent 设计模式之一。从零实现一个完整的 ReAct Agent，掌握 Thought -> Action -> Observation 的循环机制。

## 🎯 生活比喻
> ReAct 就像侦探办案：**Thought（推理）** 是"根据目前线索，凶手可能是……"；**Action（行动）** 是"去搜查嫌疑人住所"；**Observation（观察）** 是"在住所发现了凶器"；然后回到 Thought 继续推理，直到破案。

## 📋 今日三件事
1. 理解 ReAct 的 Thought -> Action -> Observation 循环原理
2. 从零实现一个带工具注册、行动执行、观察处理的完整 ReAct Agent
3. 运行完整示例，观察每一步的推理日志

---

## 🗺️ 手把手路线

### Step 1: 理解 ReAct 循环
- **做什么**: 掌握 Thought -> Action -> Observation 三步循环
- **为什么**: 这是 Agent 将推理和行动结合的核心机制
- **成功标志**: 能画出 ReAct 的工作流程图并解释每一步

### Step 2: 实现工具注册与执行
- **做什么**: 设计工具注册表，实现工具调用和结果返回
- **为什么**: Agent 需要工具来与外部世界交互
- **成功标志**: 能注册工具并成功调用

### Step 3: 组装完整 ReAct Agent
- **做什么**: 将推理、工具调用、观察整合为一个完整的循环
- **为什么**: 只有完整运行才能真正理解 ReAct
- **成功标志**: 运行示例，能看到完整的推理链日志

---

## 💻 代码区

### 代码 1: ReAct Agent 完整实现

```python
"""
ReAct Agent 从零实现
包含：工具注册、推理循环、日志追踪
"""

import json
import re
from typing import Any, Callable, Dict, List, Optional

# ============ 工具注册表 ============
class ToolRegistry:
    """
    工具注册表
    管理所有可用工具，负责调用和结果返回
    """

    def __init__(self):
        self._tools: Dict[str, Dict] = {}  # 工具名 -> {func, description}

    def register(self, name: str, func: Callable, description: str):
        """注册一个新工具"""
        self._tools[name] = {
            "func": func,
            "description": description,
        }
        print(f"  [工具注册] {name}: {description}")

    def call(self, tool_name: str, **kwargs) -> str:
        """调用指定工具"""
        if tool_name not in self._tools:
            return f"错误: 未知工具 '{tool_name}'。可用工具: {list(self._tools.keys())}"
        try:
            result = self._tools[tool_name]["func"](**kwargs)
            return str(result)
        except Exception as e:
            return f"工具调用出错: {e}"

    def get_descriptions(self) -> str:
        """获取所有工具的描述，用于提示"""
        lines = []
        for name, info in self._tools.items():
            lines.append(f"  - {name}: {info['description']}")
        return "\n".join(lines)

    def list_tools(self) -> List[str]:
        """列出所有工具名"""
        return list(self._tools.keys())


# ============ ReAct Agent ============
class ReActAgent:
    """
    ReAct Agent：推理(Reasoning) + 行动(Acting) 循环

    每一步执行:
    1. Thought: 根据当前信息进行推理
    2. Action: 选择并执行一个工具
    3. Observation: 获取工具返回的结果
    4. 重复直到得出最终答案
    """

    def __init__(self, name: str, tools: ToolRegistry,
                 max_steps: int = 10, llm_func: Optional[Callable] = None):
        """
        参数:
            name: Agent 名称
            tools: 工具注册表
            max_steps: 最大循环次数（防止无限循环）
            llm_func: 可选的LLM调用函数，为None时使用规则推理
        """
        self.name = name
        self.tools = tools
        self.max_steps = max_steps
        self.llm_func = llm_func
        self.trace: List[Dict] = []  # 推理轨迹

    def _rule_based_think(self, task: str, history: List[Dict]) -> Dict:
        """
        基于规则的推理（模拟LLM推理）
        在实际应用中，这里会调用真正的LLM

        返回格式:
        {
            "thought": "我的推理过程...",
            "action": "工具名",
            "action_input": {"参数名": "值"},
            "finished": False  # 是否已完成
        }
        """
        # 分析当前状态
        if not history:
            # 第一步：分析任务
            return {
                "thought": f"我需要解决以下任务: {task}。让我先分析一下需要什么信息。",
                "action": "search",
                "action_input": {"query": task},
                "finished": False,
            }

        last = history[-1]
        last_obs = last.get("observation", "")

        # 如果搜索到了结果，尝试计算或总结
        if "找到" in last_obs or "结果" in last_obs or "信息" in last_obs:
            return {
                "thought": f"我已经获得了相关信息: {last_obs}。现在来总结答案。",
                "action": "finish",
                "action_input": {"result": f"根据查询结果: {last_obs}"},
                "finished": True,
            }

        # 如果工具调用失败，换一个工具
        if "错误" in last_obs or "失败" in last_obs:
            return {
                "thought": f"上一步失败了: {last_obs}。让我尝试其他方法。",
                "action": "search",
                "action_input": {"query": task},
                "finished": False,
            }

        # 默认：继续搜索
        return {
            "thought": f"让我继续收集信息。上一步结果: {last_obs}",
            "action": "search",
            "action_input": {"query": task},
            "finished": False,
        }

    def run(self, task: str) -> str:
        """
        运行 ReAct 循环

        参数 task: 要完成的任务描述
        返回: 最终答案
        """
        print(f"\n{'=' * 60}")
        print(f"🤖 [{self.name}] 开始执行任务")
        print(f"📝 任务: {task}")
        print(f"🔧 可用工具: {self.tools.list_tools()}")
        print(f"{'=' * 60}")

        self.trace = []  # 清空轨迹
        history = []     # 历史记录

        for step in range(1, self.max_steps + 1):
            print(f"\n{'─' * 50}")
            print(f"  📍 步骤 {step}/{self.max_steps}")

            # 1. Thought（推理）
            if self.llm_func:
                reasoning = self.llm_func(task, history)
            else:
                reasoning = self._rule_based_think(task, history)

            thought = reasoning["thought"]
            print(f"  💭 Thought: {thought}")

            # 如果已经完成
            if reasoning.get("finished", False):
                result = reasoning["action_input"].get("result", "任务完成")
                print(f"\n  ✅ Final Answer: {result}")
                self.trace.append({
                    "step": step,
                    "thought": thought,
                    "action": "finish",
                    "observation": result,
                })
                return result

            # 2. Action（选择行动）
            action = reasoning["action"]
            action_input = reasoning["action_input"]
            print(f"  🎯 Action: {action}({action_input})")

            # 3. Observation（执行并观察）
            observation = self.tools.call(action, **action_input)
            print(f"  👀 Observation: {observation}")

            # 记录这一步
            step_record = {
                "step": step,
                "thought": thought,
                "action": f"{action}({action_input})",
                "observation": observation,
            }
            self.trace.append(step_record)
            history.append(step_record)

        # 达到最大步数
        print(f"\n  ⚠️ 达到最大步数 {self.max_steps}，任务未完成")
        return "任务超时：未能在限定步骤内完成"

    def print_trace(self):
        """打印完整的推理轨迹"""
        print(f"\n{'=' * 60}")
        print(f"📋 [{self.name}] 完整推理轨迹")
        print(f"{'=' * 60}")
        for step in self.trace:
            print(f"\n  步骤 {step['step']}:")
            print(f"    💭 {step['thought']}")
            print(f"    🎯 {step['action']}")
            print(f"    👀 {step['observation']}")


# ============ 内置工具函数 ============
def search_tool(query: str) -> str:
    """模拟搜索工具"""
    # 在实际应用中，这里会调用真实的搜索引擎API
    mock_results = {
        "天气": "北京今天晴天，温度25°C，空气质量良好",
        "Python": "Python是一种高级编程语言，最新版本3.12",
        "Agent": "Agent是能自主感知环境并采取行动的AI实体",
        "default": f"搜索'{query}'的结果: 找到了相关信息",
    }
    for key, value in mock_results.items():
        if key in query:
            return value
    return mock_results["default"]


def calculator_tool(expression: str) -> str:
    """计算器工具（安全版本）"""
    # 只允许基本数学运算
    allowed_chars = set("0123456789+-*/().% ")
    if not all(c in allowed_chars for c in expression):
        return "错误: 表达式包含不允许的字符"
    try:
        result = eval(expression)
        return f"计算结果: {expression} = {result}"
    except Exception as e:
        return f"计算错误: {e}"


def finish_tool(result: str) -> str:
    """结束工具：返回最终答案"""
    return f"最终答案: {result}"


# ============ 创建并运行 ReAct Agent ============
if __name__ == "__main__":
    # 1. 创建工具注册表
    print(">>> 初始化工具注册表")
    tools = ToolRegistry()
    tools.register("search", search_tool, "搜索信息，输入关键词")
    tools.register("calculate", calculator_tool, "数学计算，输入表达式如 '2+3*4'")
    tools.register("finish", finish_tool, "结束任务并返回答案")

    # 2. 创建 ReAct Agent
    print("\n>>> 创建 ReAct Agent")
    agent = ReActAgent(
        name="研究助手",
        tools=tools,
        max_steps=5,
    )

    # 3. 执行任务
    answer = agent.run("帮我查一下北京的天气")

    # 4. 打印完整轨迹
    agent.print_trace()
```

**预期输出：**
```
>>> 初始化工具注册表
  [工具注册] search: 搜索信息，输入关键词
  [工具注册] calculate: 数学计算，输入表达式如 '2+3*4'
  [工具注册] finish: 结束任务并返回答案

>>> 创建 ReAct Agent

============================================================
🤖 [研究助手] 开始执行任务
📝 任务: 帮我查一下北京的天气
🔧 可用工具: ['search', 'calculate', 'finish']
============================================================

──────────────────────────────────────────────────
  📍 步骤 1/5
  💭 Thought: 我需要解决以下任务: 帮我查一下北京的天气。让我先分析一下需要什么信息。
  🎯 Action: search({'query': '帮我查一下北京的天气'})
  👀 Observation: 北京今天晴天，温度25°C，空气质量良好

──────────────────────────────────────────────────
  📍 步骤 2/5
  💭 Thought: 我已经获得了相关信息: 北京今天晴天，温度25°C，空气质量良好。现在来总结答案。
  🎯 Action: finish({'result': '根据查询结果: 北京今天晴天，温度25°C，空气质量良好'})
  ✅ Final Answer: 根据查询结果: 北京今天晴天，温度25°C，空气质量良好

============================================================
📋 [研究助手] 完整推理轨迹
============================================================

  步骤 1:
    💭 我需要解决以下任务: 帮我查一下北京的天气...
    🎯 search({'query': '帮我查一下北京的天气'})
    👀 北京今天晴天，温度25°C，空气质量良好

  步骤 2:
    💭 我已经获得了相关信息...
    🎯 finish({'result': '...'})
    👀 最终答案: ...
```

### 代码 2: ReAct 多步推理示例

```python
"""
ReAct 多步推理：需要多次工具调用才能完成的复杂任务
"""

if __name__ == "__main__":
    # 创建工具
    tools = ToolRegistry()
    tools.register("search", search_tool, "搜索信息")
    tools.register("calculate", calculator_tool, "数学计算")
    tools.register("finish", finish_tool, "结束任务")

    # 任务：需要搜索 + 计算的复合任务
    agent = ReActAgent(name="分析助手", tools=tools, max_steps=8)

    # 运行一个多步任务
    print("\n>>> 多步推理示例")
    answer = agent.run("Python的最新版本号是多少？请计算它乘以2的结果")

    agent.print_trace()
```

### 代码 3: ReAct 输出解析器

```python
"""
ReAct 输出解析器
用于解析 LLM 生成的 ReAct 格式文本
"""

class ReActParser:
    """
    解析 ReAct 格式的文本输出
    格式:
        Thought: ...
        Action: ...
        Action Input: ...
        Observation: ...
    """

    @staticmethod
    def parse(text: str) -> List[Dict]:
        """解析 ReAct 格式的文本"""
        steps = []
        current = {}

        for line in text.strip().split("\n"):
            line = line.strip()
            if line.startswith("Thought:"):
                if current:
                    steps.append(current)
                current = {"thought": line[len("Thought:"):].strip()}
            elif line.startswith("Action:"):
                current["action"] = line[len("Action:"):].strip()
            elif line.startswith("Action Input:"):
                current["action_input"] = line[len("Action Input:"):].strip()
            elif line.startswith("Observation:"):
                current["observation"] = line[len("Observation:"):].strip()
            elif line.startswith("Final Answer:"):
                current["final_answer"] = line[len("Final Answer:"):].strip()

        if current:
            steps.append(current)
        return steps

    @staticmethod
    def validate(text: str) -> tuple:
        """验证 ReAct 格式是否正确"""
        steps = ReActParser.parse(text)
        errors = []

        for i, step in enumerate(steps):
            if "thought" not in step:
                errors.append(f"步骤 {i+1}: 缺少 Thought")
            if "final_answer" not in step and "action" not in step:
                errors.append(f"步骤 {i+1}: 缺少 Action 或 Final Answer")

        return len(errors) == 0, errors


# ====== 运行解析器测试 ======
if __name__ == "__main__":
    # 示例 ReAct 输出
    react_output = """
Thought: 我需要查找北京的天气信息
Action: search
Action Input: 北京天气
Observation: 北京今天晴天，温度25°C

Thought: 我知道了北京的天气，但还需要计算温度华氏度
Action: calculate
Action Input: 25 * 9/5 + 32
Observation: 计算结果: 77.0

Thought: 我现在有完整信息了
Final Answer: 北京今天晴天，温度25°C（77°F）
"""

    # 解析
    parser = ReActParser()
    steps = parser.parse(react_output)

    print("解析结果:")
    for i, step in enumerate(steps, 1):
        print(f"\n  步骤 {i}:")
        for key, value in step.items():
            print(f"    {key}: {value}")

    # 验证
    is_valid, errors = parser.validate(react_output)
    print(f"\n格式验证: {'✅ 有效' if is_valid else '❌ 无效'}")
    if errors:
        for e in errors:
            print(f"  错误: {e}")
```

**预期输出：**
```
解析结果:

  步骤 1:
    thought: 我需要查找北京的天气信息
    action: search
    action_input: 北京天气
    observation: 北京今天晴天，温度25°C

  步骤 2:
    thought: 我知道了北京的天气，但还需要计算温度华氏度
    action: calculate
    action_input: 25 * 9/5 + 32
    observation: 计算结果: 77.0

  步骤 3:
    thought: 我现在有完整信息了
    final_answer: 北京今天晴天，温度25°C（77°F）

格式验证: ✅ 有效
```

### 代码 4: ReAct 提示模板

```python
"""
ReAct 提示模板
用于指导 LLM 按照 ReAct 格式输出
"""

REACT_PROMPT_TEMPLATE = """你是一个能够使用工具解决问题的AI助手。

你可以使用以下工具：
{tools}

请严格使用以下格式进行推理和行动：

Thought: 我需要思考如何解决这个问题...
Action: 工具名称
Action Input: 工具输入参数（JSON格式）

Observation: 工具返回的结果（由系统自动填入）

... (Thought/Action/Action Input/Observation 可以重复N次) ...

Thought: 我现在知道最终答案了
Final Answer: 最终答案

重要规则：
1. 每次只能执行一个 Action
2. 必须等待 Observation 后才能继续
3. 确定答案后用 Final Answer 结束

现在开始！

Question: {question}
Thought:"""


def format_prompt(question: str, tools: ToolRegistry) -> str:
    """格式化 ReAct 提示"""
    tool_desc = tools.get_descriptions()
    return REACT_PROMPT_TEMPLATE.format(tools=tool_desc, question=question)


# ====== 测试提示模板 ======
if __name__ == "__main__":
    tools = ToolRegistry()
    tools.register("search", search_tool, "搜索信息")
    tools.register("calculate", calculator_tool, "数学计算")

    prompt = format_prompt("今天天气怎么样？", tools)
    print("生成的提示:")
    print(prompt)
```

---

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | Agent 陷入无限循环 | 检查 max_steps 设置，确保有合理的上限；检查 finish 条件是否能触发 |
| 2 | 工具调用报 "未知工具" | 用 `tools.list_tools()` 检查已注册的工具名是否拼写正确 |
| 3 | Thought 内容空洞 | 优化推理逻辑，让 Agent 在 Thought 中引用 Observation 的具体结果 |
| 4 | 无法触发 finish | 检查 `_rule_based_think` 的终止条件，确保 Observation 包含关键词 |
| 5 | 解析器报格式错误 | 确保 LLM 输出严格遵循 `Thought:` / `Action:` / `Observation:` 格式 |
| 6 | 计算器工具报错 | 检查表达式是否只包含数字和运算符，不支持变量 |

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| ReAct | Reasoning + Acting，推理和行动交替的 Agent 范式 |
| Thought | Agent 的推理过程，分析当前状况和下一步计划 |
| Action | Agent 选择并执行的工具调用 |
| Observation | 工具返回的结果，作为下一步推理的输入 |
| Final Answer | Agent 得出的最终答案，结束循环 |
| 工具 (Tool) | Agent 可以调用的外部函数（搜索、计算等） |
| 推理轨迹 (Trace) | 完整的 Thought-Action-Observation 序列记录 |
| 最大步数 (Max Steps) | 防止无限循环的安全限制 |

---

## ✅ 验收清单

- [ ] 能解释 Thought -> Action -> Observation 循环的每一步
- [ ] 能使用 ToolRegistry 注册和调用自定义工具
- [ ] 能运行 ReAct Agent 并观察完整的推理日志
- [ ] 能解释为什么需要 max_steps 限制
- [ ] 能使用 ReActParser 解析 LLM 输出
- [ ] 能为 ReAct Agent 添加一个新工具（如天气查询）
- [ ] 能说出 ReAct 相比直接输出答案的优势

---

## 📝 复盘小纸条
- 今天最大的收获: ________________________________
- 还不太确定的: ________________________________
- ReAct 最适合的场景是: ________________________________
- 明天需要用到的基础: ________________________________

---

## 📥 明日同步接口
- 今日完成度: ____%
- 卡点描述: ________________________________
- 代码是否能跑通: ✅ 全部通过 / ⚠️ 部分通过 / ❌ 未通过
- 明天希望: 学习 Plan-and-Solve 如何将复杂任务拆解为子任务
