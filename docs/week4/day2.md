# 📅 Week 4 Day 2：ReAct 范式：推理 + 行动交替

## 🧭 今日方向
> 今天我们将深入学习 ReAct（Reasoning + Acting）范式，这是目前最流行的 Agent 框架之一。

## 🎯 生活比喻
> ReAct 就像一个侦探办案：先思考（Reasoning），再调查（Acting），然后根据新证据继续思考，如此循环直到破案。

## 📋 今日三件事
1. 理解 ReAct 范式的原理
2. 学习 ReAct 的实现方法
3. 通过代码实践 ReAct 模式

## 🗺️ 手把手路线

### Step 1: ReAct 原理
- **做什么**: 理解推理和行动如何交替进行
- **为什么**: ReAct 是 Agent 的核心范式
- **成功标志**: 能解释 ReAct 的工作流程

### Step 2: ReAct 实现
- **做什么**: 学习如何实现 ReAct 模式
- **为什么**: 理论需要转化为代码
- **成功标志**: 能编写基本的 ReAct Agent

### Step 3: 实践应用
- **做什么**: 通过实际案例应用 ReAct
- **为什么**: 实践是最好的学习方式
- **成功标志**: 能用 ReAct 解决实际问题

## 💻 代码区

```python
# ReAct 范式实现

from dataclasses import dataclass
from typing import List, Dict, Any, Optional, Callable
from enum import Enum
import json

class ActionType(str, Enum):
    """动作类型"""
    THINK = "think"      # 思考
    ACT = "act"          # 行动
    OBSERVE = "observe"  # 观察
    FINISH = "finish"    # 完成

@dataclass
class ReActStep:
    """ReAct 步骤"""
    action_type: ActionType
    content: str
    thought: Optional[str] = None
    action: Optional[str] = None
    observation: Optional[str] = None

class ReActAgent:
    """ReAct 智能体"""
    
    def __init__(
        self,
        name: str,
        tools: Dict[str, Callable],
        max_steps: int = 10
    ):
        self.name = name
        self.tools = tools
        self.max_steps = max_steps
        self.steps: List[ReActStep] = []
        self.context: List[Dict] = []
    
    def think(self, observation: str) -> str:
        """思考阶段"""
        # 在实际应用中，这里会调用 LLM
        # 这里简化为基于规则的思考
        
        thought = f"根据观察 '{observation}'，我需要..."
        
        # 分析是否需要更多信息
        if "不知道" in observation or "不确定" in observation:
            thought += "获取更多信息来做出判断。"
        elif "完成" in observation or "成功" in observation:
            thought += "总结结果并完成任务。"
        else:
            thought += "分析情况并决定下一步行动。"
        
        return thought
    
    def decide_action(self, thought: str) -> tuple[str, Dict]:
        """决定行动"""
        # 在实际应用中，这里会调用 LLM
        # 这里简化为基于规则的决策
        
        if "搜索" in thought or "查找" in thought:
            return "search", {"query": "相关信息"}
        elif "计算" in thought:
            return "calculate", {"expression": "1+1"}
        elif "完成" in thought or "总结" in thought:
            return "finish", {"result": "任务完成"}
        else:
            return "search", {"query": "默认查询"}
    
    def act(self, action: str, params: Dict) -> str:
        """执行行动"""
        if action in self.tools:
            try:
                result = self.tools[action](**params)
                return str(result)
            except Exception as e:
                return f"执行错误: {str(e)}"
        else:
            return f"未知动作: {action}"
    
    def run(self, task: str) -> str:
        """运行 ReAct 循环"""
        print(f"\n{'='*50}")
        print(f"🤖 {self.name} 开始执行任务: {task}")
        print(f"{'='*50}\n")
        
        # 初始观察
        observation = f"任务: {task}"
        
        for step_num in range(self.max_steps):
            print(f"\n--- 步骤 {step_num + 1} ---")
            
            # 1. 思考
            thought = self.think(observation)
            print(f"💭 思考: {thought}")
            
            # 2. 决定行动
            action, params = self.decide_action(thought)
            print(f"🎯 行动: {action}")
            print(f"   参数: {params}")
            
            # 3. 执行行动
            if action == "finish":
                result = params.get("result", "任务完成")
                print(f"\n✅ 完成: {result}")
                return result
            
            observation = self.act(action, params)
            print(f"👀 观察: {observation}")
            
            # 记录步骤
            self.steps.append(ReActStep(
                action_type=ActionType.THINK,
                content=thought,
                thought=thought
            ))
            self.steps.append(ReActStep(
                action_type=ActionType.ACT,
                content=action,
                action=f"{action}({params})"
            ))
            self.steps.append(ReActStep(
                action_type=ActionType.OBSERVE,
                content=observation,
                observation=observation
            ))
        
        return "达到最大步数限制，任务未完成"
    
    def get_history(self) -> List[Dict]:
        """获取执行历史"""
        return [
            {
                "step": i // 3 + 1,
                "thought": self.steps[i].thought,
                "action": self.steps[i+1].action if i+1 < len(self.steps) else None,
                "observation": self.steps[i+2].observation if i+2 < len(self.steps) else None
            }
            for i in range(0, len(self.steps), 3)
        ]

# 工具函数
def search(query: str) -> str:
    """搜索工具"""
    return f"搜索 '{query}' 的结果: 找到相关信息"

def calculate(expression: str) -> str:
    """计算工具"""
    try:
        result = eval(expression)
        return f"计算结果: {result}"
    except Exception as e:
        return f"计算错误: {str(e)}"

def get_weather(city: str) -> str:
    """获取天气工具"""
    return f"{city}的天气: 晴天，温度25°C"

# 创建工具集
tools = {
    "search": search,
    "calculate": calculate,
    "get_weather": get_weather
}

# 使用示例
if __name__ == "__main__":
    # 创建 ReAct Agent
    agent = ReActAgent(
        name="研究助手",
        tools=tools,
        max_steps=5
    )
    
    # 执行任务
    result = agent.run("帮我查找北京的天气信息")
    
    # 打印历史
    print("\n执行历史:")
    for record in agent.get_history():
        print(f"步骤 {record['step']}:")
        if record['thought']:
            print(f"  思考: {record['thought']}")
        if record['action']:
            print(f"  行动: {record['action']}")
        if record['observation']:
            print(f"  观察: {record['observation']}")
```

```python
# ReAct 提示模板

REACT_PROMPT_TEMPLATE = """
你是一个能够使用工具解决问题的AI助手。

你可以使用以下工具：
{tools}

请使用以下格式进行推理和行动：

Thought: 我需要思考如何解决这个问题...
Action: 工具名称
Action Input: 工具输入参数

Observation: 工具返回的结果

... (这个Thought/Action/Action Input/Observation可以重复N次) ...

Thought: 我现在知道最终答案了
Final Answer: 最终答案

现在开始！

Question: {question}
Thought: 
"""

# 工具描述生成
def generate_tool_descriptions(tools: Dict[str, Callable]) -> str:
    """生成工具描述"""
    descriptions = []
    for name, func in tools.items():
        doc = func.__doc__ or "无描述"
        descriptions.append(f"- {name}: {doc}")
    return "\n".join(descriptions)

# ReAct 解析器
class ReActParser:
    """ReAct 输出解析器"""
    
    @staticmethod
    def parse(text: str) -> List[Dict]:
        """解析 ReAct 输出"""
        steps = []
        lines = text.strip().split("\n")
        
        current_step = {}
        for line in lines:
            line = line.strip()
            
            if line.startswith("Thought:"):
                if current_step:
                    steps.append(current_step)
                current_step = {"thought": line[8:].strip()}
            
            elif line.startswith("Action:"):
                current_step["action"] = line[7:].strip()
            
            elif line.startswith("Action Input:"):
                current_step["action_input"] = line[13:].strip()
            
            elif line.startswith("Observation:"):
                current_step["observation"] = line[12:].strip()
            
            elif line.startswith("Final Answer:"):
                current_step["final_answer"] = line[13:].strip()
        
        if current_step:
            steps.append(current_step)
        
        return steps

# 使用示例
if __name__ == "__main__":
    # 生成工具描述
    tool_desc = generate_tool_descriptions(tools)
    print("工具描述:")
    print(tool_desc)
    
    # 示例 ReAct 输出
    react_output = """
Thought: 我需要查找北京的天气信息
Action: search
Action Input: 北京天气
Observation: 北京今天晴天，温度25°C

Thought: 我现在知道了北京的天气
Final Answer: 北京今天是晴天，温度25°C
"""
    
    # 解析输出
    parser = ReActParser()
    steps = parser.parse(react_output)
    
    print("\n解析结果:")
    for i, step in enumerate(steps, 1):
        print(f"\n步骤 {i}:")
        for key, value in step.items():
            print(f"  {key}: {value}")
```

```python
# ReAct 实战：数学问题求解

class MathProblemSolver:
    """数学问题求解器（基于 ReAct）"""
    
    def __init__(self):
        self.steps = []
    
    def solve(self, problem: str) -> str:
        """解决数学问题"""
        print(f"\n问题: {problem}")
        print("=" * 50)
        
        # 模拟 ReAct 过程
        steps = [
            {
                "thought": "我需要理解这个问题并分解为子问题",
                "action": "分析问题",
                "observation": "问题已分解为可管理的子问题"
            },
            {
                "thought": "我需要执行计算",
                "action": "计算",
                "observation": "计算完成"
            },
            {
                "thought": "我需要验证结果",
                "action": "验证",
                "observation": "结果正确"
            }
        ]
        
        for i, step in enumerate(steps, 1):
            print(f"\n步骤 {i}:")
            print(f"  Thought: {step['thought']}")
            print(f"  Action: {step['action']}")
            print(f"  Observation: {step['observation']}")
        
        return "问题解决完成"

# 使用示例
if __name__ == "__main__":
    solver = MathProblemSolver()
    solver.solve("计算 15 × 23 + 47")
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 无限循环 | 设置最大步数限制 |
| 2 | 思考不准确 | 优化提示模板 |
| 3 | 工具调用失败 | 检查工具参数和实现 |
| 4 | 输出格式错误 | 使用解析器验证输出 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| ReAct | 推理和行动交替的 Agent 范式 |
| Thought | 智能体的思考过程 |
| Action | 智能体执行的动作 |
| Observation | 动作的结果反馈 |
| Final Answer | 最终答案 |
| 工具 | 智能体可以调用的外部函数 |

## ✅ 验收清单
- [ ] 理解 ReAct 的工作原理
- [ ] 能实现基本的 ReAct Agent
- [ ] 理解工具使用机制
- [ ] 能解析 ReAct 输出

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
