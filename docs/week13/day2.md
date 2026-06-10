# 📅 Week 13 Day 2：方向B - 从零构建 Agent 框架

## 🧭 今日方向
> 从零开始构建一个简单的 Agent 框架，理解 Agent 系统的核心组件和设计模式。

## 🎯 生活比喻
> 构建 Agent 框架就像搭建一个机器人系统。大脑（LLM）负责思考，眼睛（观察器）负责感知环境，手脚（工具调用）负责执行动作，神经系统（消息总线）负责传递信息。今天我们就来搭建这个"机器人"的基础架构。

## 📋 今日三件事
1. 设计 Agent 框架的核心接口
2. 实现 Agent、Tool、Memory 等核心组件
3. 实现一个完整的 Agent 运行循环

## 🗺️ 手把手路线

### Step 1：设计核心接口
- 做什么: 定义 Agent、Tool、Memory 等抽象接口
- 为什么: 好的接口设计是框架的基础
- 成功标志: 能定义清晰的接口

### Step 2：实现核心组件
- 做什么: 实现 Agent、Tool、Memory 等组件
- 为什么: 这些是框架的核心
- 成功标志: 各组件能独立工作

### Step 3：实现运行循环
- 做什么: 实现 Agent 的思考-行动-观察循环
- 为什么: 这是 Agent 的核心行为模式
- 成功标志: Agent 能完成简单任务

## 💻 代码区

```python
"""
从零构建 Agent 框架
完整的 Agent 系统实现
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Callable, Any
from enum import Enum
from abc import ABC, abstractmethod
import json

# ========== 1. 核心接口定义 ==========

class AgentState(Enum):
    """Agent 状态"""
    IDLE = "idle"
    THINKING = "thinking"
    ACTING = "acting"
    OBSERVING = "observing"
    FINISHED = "finished"
    ERROR = "error"


@dataclass
class AgentAction:
    """Agent 动作"""
    action_type: str  # think, act, observe, answer
    content: str
    tool_name: Optional[str] = None
    tool_input: Optional[str] = None


@dataclass
class AgentObservation:
    """Agent 观察"""
    content: str
    source: str = ""
    metadata: Dict = field(default_factory=dict)


# ========== 2. 工具接口 ==========

class Tool(ABC):
    """工具基类"""
    
    @property
    @abstractmethod
    def name(self) -> str:
        pass
    
    @property
    @abstractmethod
    def description(self) -> str:
        pass
    
    @abstractmethod
    def execute(self, input_text: str) -> str:
        pass
    
    def to_dict(self) -> Dict:
        return {
            "name": self.name,
            "description": self.description
        }


class SearchTool(Tool):
    """搜索工具"""
    
    @property
    def name(self) -> str:
        return "search"
    
    @property
    def description(self) -> str:
        return "搜索信息"
    
    def execute(self, input_text: str) -> str:
        # 模拟搜索
        return f"搜索结果: 关于 '{input_text}' 的信息"


class CalculatorTool(Tool):
    """计算器工具"""
    
    @property
    def name(self) -> str:
        return "calculator"
    
    @property
    def description(self) -> str:
        return "执行数学计算"
    
    def execute(self, input_text: str) -> str:
        try:
            result = eval(input_text)
            return f"计算结果: {result}"
        except Exception as e:
            return f"计算错误: {e}"


# ========== 3. 记忆系统 ==========

class Memory(ABC):
    """记忆基类"""
    
    @abstractmethod
    def add(self, content: str, metadata: Dict = None):
        pass
    
    @abstractmethod
    def get_recent(self, n: int) -> List[str]:
        pass
    
    @abstractmethod
    def search(self, query: str, n: int = 5) -> List[str]:
        pass


class SimpleMemory(Memory):
    """简单记忆（列表存储）"""
    
    def __init__(self, max_size: int = 100):
        self.items: List[Dict] = []
        self.max_size = max_size
    
    def add(self, content: str, metadata: Dict = None):
        self.items.append({
            "content": content,
            "metadata": metadata or {}
        })
        if len(self.items) > self.max_size:
            self.items.pop(0)
    
    def get_recent(self, n: int) -> List[str]:
        return [item["content"] for item in self.items[-n:]]
    
    def search(self, query: str, n: int = 5) -> List[str]:
        # 简单的关键词匹配
        results = []
        for item in self.items:
            if query.lower() in item["content"].lower():
                results.append(item["content"])
        return results[:n]


# ========== 4. Agent 核心 ==========

class BaseAgent(ABC):
    """Agent 基类"""
    
    def __init__(self, name: str = "Agent"):
        self.name = name
        self.state = AgentState.IDLE
        self.tools: Dict[str, Tool] = {}
        self.memory = SimpleMemory()
        self.history: List[Dict] = []
    
    def register_tool(self, tool: Tool):
        """注册工具"""
        self.tools[tool.name] = tool
    
    def think(self, task: str) -> str:
        """思考（由子类实现）"""
        return f"我在思考: {task}"
    
    def act(self, action: AgentAction) -> AgentObservation:
        """执行动作"""
        if action.tool_name and action.tool_name in self.tools:
            tool = self.tools[action.tool_name]
            result = tool.execute(action.tool_input or "")
            return AgentObservation(content=result, source=action.tool_name)
        return AgentObservation(content=f"执行: {action.content}")
    
    def observe(self, observation: AgentObservation) -> str:
        """处理观察"""
        self.memory.add(observation.content, {"source": observation.source})
        return observation.content
    
    def run(self, task: str, max_steps: int = 10) -> str:
        """运行 Agent"""
        self.state = AgentState.THINKING
        self.history.append({"role": "user", "content": task})
        
        for step in range(max_steps):
            # 思考
            self.state = AgentState.THINKING
            thought = self.think(task)
            self.history.append({"role": "assistant", "content": thought})
            self.memory.add(thought)
            
            # 检查是否完成
            if "完成" in thought or "回答" in thought:
                self.state = AgentState.FINISHED
                return thought
            
            # 行动（简化：根据关键词选择工具）
            self.state = AgentState.ACTING
            if "搜索" in task:
                action = AgentAction(
                    action_type="act",
                    content="搜索信息",
                    tool_name="search",
                    tool_input=task
                )
            elif "计算" in task:
                action = AgentAction(
                    action_type="act",
                    content="计算",
                    tool_name="calculator",
                    tool_input="2 + 2"
                )
            else:
                action = AgentAction(
                    action_type="answer",
                    content=thought
                )
            
            # 执行并观察
            self.state = AgentState.OBSERVING
            observation = self.act(action)
            self.observe(observation)
            
            self.history.append({
                "role": "tool",
                "content": observation.content
            })
        
        self.state = AgentState.FINISHED
        return self.history[-1]["content"]


# ========== 5. 具体 Agent 实现 ==========

class SimpleAgent(BaseAgent):
    """简单 Agent"""
    
    def __init__(self, name: str = "SimpleAgent"):
        super().__init__(name)
        self.register_tool(SearchTool())
        self.register_tool(CalculatorTool())
    
    def think(self, task: str) -> str:
        """简单的思考逻辑"""
        recent_memory = self.memory.get_recent(3)
        
        if not recent_memory:
            return f"收到任务: {task}。我需要先分析任务需求。"
        elif len(recent_memory) < 2:
            return f"我已经有一些信息了。让我继续处理任务: {task}"
        else:
            return f"根据已有信息，我可以回答任务: {task}"


# ========== 6. Agent 管理器 ==========

class AgentManager:
    """Agent 管理器"""
    
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
    
    def register_agent(self, agent: BaseAgent):
        self.agents[agent.name] = agent
    
    def run_task(self, agent_name: str, task: str) -> Dict:
        """运行任务"""
        if agent_name not in self.agents:
            return {"error": f"Agent {agent_name} 不存在"}
        
        agent = self.agents[agent_name]
        result = agent.run(task)
        
        return {
            "agent": agent_name,
            "task": task,
            "result": result,
            "state": agent.state.value,
            "steps": len(agent.history)
        }
    
    def list_agents(self) -> List[Dict]:
        """列出所有 Agent"""
        return [
            {"name": a.name, "state": a.state.value, "tools": list(a.tools.keys())}
            for a in self.agents.values()
        ]


# ========== 7. 主函数 ==========

def main():
    print("=" * 60)
    print("从零构建 Agent 框架")
    print("=" * 60)
    
    # 1. 创建 Agent
    print("\n1. 创建 Agent...")
    agent = SimpleAgent("MyAgent")
    print(f"   Agent 名称: {agent.name}")
    print(f"   注册工具: {list(agent.tools.keys())}")
    
    # 2. 运行任务
    print("\n2. 运行任务...")
    tasks = [
        "搜索 Python 的最新版本",
        "计算 2 + 2 等于多少",
        "完成一个简单任务"
    ]
    
    for task in tasks:
        print(f"\n   任务: {task}")
        result = agent.run(task)
        print(f"   结果: {result}")
        print(f"   状态: {agent.state.value}")
    
    # 3. 查看历史
    print("\n3. 对话历史:")
    for entry in agent.history[-6:]:
        print(f"   [{entry['role']}] {entry['content'][:50]}...")
    
    # 4. 管理器
    print("\n4. Agent 管理器:")
    manager = AgentManager()
    manager.register_agent(agent)
    print(f"   注册的 Agent: {manager.list_agents()}")
    
    # 5. 架构图
    print("\n5. Agent 框架架构:")
    print("-" * 40)
    print("""
    ┌─────────────────────────────────────────┐
    │              Agent Framework             │
    │  ┌─────────────────────────────────┐   │
    │  │           Agent                  │   │
    │  │  ┌─────────┐  ┌─────────┐     │   │
    │  │  │  Think  │→│   Act   │     │   │
    │  │  └─────────┘  └─────────┘     │   │
    │  │       ↑              ↓          │   │
    │  │  ┌─────────┐  ┌─────────┐     │   │
    │  │  │ Observe │←│  Memory  │     │   │
    │  │  └─────────┘  └─────────┘     │   │
    │  └─────────────────────────────────┘   │
    │                    │                      │
    │  ┌─────────────────▼─────────────────┐   │
    │  │           Tools                    │   │
    │  │  ┌─────────┐  ┌─────────┐       │   │
    │  │  │ Search  │  │Calculator│       │   │
    │  │  └─────────┘  └─────────┘       │   │
    │  └───────────────────────────────────┘   │
    └─────────────────────────────────────────┘
""")
    
    print("\n6. 设计模式:")
    print("-" * 40)
    print("  1. Think-Act-Observe 循环")
    print("  2. 工具注册与调用")
    print("  3. 记忆系统")
    print("  4. 状态管理")
    print("  5. 历史记录")


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | Agent 不执行工具 | 检查工具注册和调用逻辑 |
| 2 | 记忆不工作 | 检查内存存储和检索 |
| 3 | 循环不结束 | 添加终止条件 |
| 4 | 框架难以扩展 | 使用抽象基类定义接口 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Agent | 能自主决策和行动的智能体 |
| Tool | Agent 可调用的外部工具 |
| Memory | Agent 的记忆存储系统 |
| Think-Act-Observe | Agent 的核心行为循环 |
| State | Agent 的当前状态 |

## ✅ 验收清单
- [ ] 能定义 Agent 核心接口
- [ ] 能实现 Tool、Memory 等组件
- [ ] 能实现 Agent 运行循环
- [ ] 代码能跑通

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
