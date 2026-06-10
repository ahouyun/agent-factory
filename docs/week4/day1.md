# 📅 Week 4 Day 1：智能体定义、类型、发展史

## 🧭 今日方向
> 今天我们将进入 Agent 范式的学习，从智能体的定义、类型和发展史开始，建立对 Agent 的全面认识。

## 🎯 生活比喻
> 智能体就像不同类型的机器人：有些只能执行简单任务（简单反射型），有些能思考后行动（基于模型），有些能规划长远目标（目标导向）。

## 📋 今日三件事
1. 理解智能体的定义和核心特征
2. 了解智能体的分类方法
3. 学习智能体的发展历程

## 🗺️ 手把手路线

### Step 1: 智能体定义
- **做什么**: 理解什么是智能体，它的核心特征
- **为什么**: 只有理解定义，才能正确应用
- **成功标志**: 能用自己的话解释智能体

### Step 2: 智能体类型
- **做什么**: 了解不同类型智能体的特点
- **为什么**: 不同任务需要不同类型的智能体
- **成功标志**: 能分类和描述各种智能体

### Step 3: 发展历程
- **做什么**: 了解智能体技术的发展脉络
- **为什么**: 理解历史才能把握未来
- **成功标志**: 能讲述智能体发展的关键节点

## 💻 代码区

```python
# 智能体定义和类型

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Callable, Any
from enum import Enum
from abc import ABC, abstractmethod

class AgentType(str, Enum):
    """智能体类型"""
    SIMPLE_REFLEX = "simple_reflex"  # 简单反射型
    MODEL_BASED = "model_based"      # 基于模型型
    GOAL_BASED = "goal_based"        # 目标导向型
    UTILITY_BASED = "utility_based"  # 效用型
    LEARNING = "learning"            # 学习型

@dataclass
class AgentConfig:
    """智能体配置"""
    name: str
    agent_type: AgentType
    description: str
    capabilities: List[str] = field(default_factory=list)
    limitations: List[str] = field(default_factory=list)

# 智能体定义
AGENT_DEFINITIONS = """
智能体（Agent）定义
==================

1. 基本定义
   智能体是一个能够感知环境并采取行动以实现目标的实体。
   它具有自主性、反应性、主动性和社交能力。

2. 核心特征
   - 自主性（Autonomy）: 能独立决策和行动
   - 反应性（Reactivity）: 能感知环境并做出响应
   - 主动性（Pro-activeness）: 能主动采取行动实现目标
   - 社交能力（Social ability）: 能与其他智能体或人类交互

3. 智能体 vs 程序
   - 程序: 被动执行指令
   - 智能体: 主动感知和行动
   - 关键区别: 自主性和目标导向

4. 智能体的组成
   - 感知器: 获取环境信息
   - 决策器: 分析和决策
   - 执行器: 执行动作
   - 知识库: 存储经验和知识
"""

print(AGENT_DEFINITIONS)

# 智能体类型详解
AGENT_TYPES = """
智能体类型详解
=============

1. 简单反射型（Simple Reflex Agent）
   原理: 根据当前感知直接做出反应
   特点:
   - 无记忆，只看当前状态
   - 基于条件-动作规则
   - 实现简单，效率高
   适用: 简单的响应式任务
   示例: 恒温器、简单聊天机器人

2. 基于模型型（Model-Based Agent）
   原理: 维护内部世界模型
   特点:
   - 有记忆，能跟踪状态变化
   - 处理部分可观测环境
   - 需要更新内部模型
   适用: 需要状态跟踪的任务
   示例: 导航系统、游戏AI

3. 目标导向型（Goal-Based Agent）
   原理: 基于目标选择行动
   特点:
   - 有明确的目标
   - 能规划实现目标的路径
   - 需要搜索和规划算法
   适用: 需要规划的任务
   示例: 国际象棋AI、自动驾驶

4. 效用型（Utility-Based Agent）
   原理: 基于效用函数选择最优行动
   特点:
   - 考虑多个目标和权衡
   - 能处理不确定性
   - 需要效用函数
   适用: 复杂决策任务
   示例: 投资决策、资源分配

5. 学习型（Learning Agent）
   原理: 通过经验改进性能
   特点:
   - 能从经验中学习
   - 适应环境变化
   - 需要学习算法
   适用: 动态环境
   示例: 推荐系统、AlphaGo
"""

print(AGENT_TYPES)
```

```python
# 智能体发展史

DEVELOPMENT_HISTORY = """
智能体发展史
===========

第一阶段：早期探索（1950s-1970s）
---------------------------------
- 1950: 图灵测试提出
- 1956: AI 领域诞生
- 1960s: ELIZA 聊天程序
- 1970s: 专家系统出现
特点: 基于规则，简单反射型

第二阶段：知识驱动（1980s-1990s）
---------------------------------
- 1980s: 专家系统商业化
- 1986: 反向传播算法
- 1990s: 机器学习兴起
- 1997: IBM Deep Blue 击败国际象棋冠军
特点: 知识表示，推理能力

第三阶段：统计学习（2000s-2010s）
---------------------------------
- 2006: 深度学习突破
- 2011: Watson 问答系统
- 2012: AlexNet 图像识别
- 2014: GAN 生成对抗网络
特点: 统计学习，模式识别

第四阶段：大模型时代（2020s）
------------------------------
- 2020: GPT-3 发布
- 2022: ChatGPT 发布
- 2023: GPT-4, Claude 2, LLaMA
- 2024: 多模态大模型普及
特点: 大语言模型，通用智能

第五阶段：Agent 时代（2024+）
------------------------------
- Agent 框架兴起（LangChain, AutoGPT）
- 工具使用能力增强
- 多智能体协作
- 自主决策能力
特点: 自主行动，工具使用
"""

print(DEVELOPMENT_HISTORY)

# 智能体分类框架
class AgentClassification:
    """智能体分类框架"""
    
    @staticmethod
    def by_autonomy() -> Dict[str, str]:
        """按自主性分类"""
        return {
            "完全自主": "完全独立决策，无需人类干预",
            "半自主": "在人类监督下自主行动",
            "辅助型": "辅助人类完成任务",
            "被动型": "等待指令后执行"
        }
    
    @staticmethod
    def by_domain() -> Dict[str, str]:
        """按领域分类"""
        return {
            "对话Agent": "专注于自然语言对话",
            "任务Agent": "完成特定任务",
            "研究Agent": "收集和分析信息",
            "创作Agent": "生成创意内容",
            "代码Agent": "编写和调试代码",
            "数据Agent": "处理和分析数据"
        }
    
    @staticmethod
    def by_architecture() -> Dict[str, str]:
        """按架构分类"""
        return {
            "ReAct": "推理和行动交替",
            "Plan-and-Solve": "先规划后执行",
            "Reflection": "自我反思和改进",
            "Tool-use": "使用外部工具",
            "Multi-agent": "多智能体协作"
        }

# 使用示例
if __name__ == "__main__":
    print("\n=== 智能体分类框架 ===\n")
    
    classification = AgentClassification()
    
    print("按自主性分类:")
    for level, desc in classification.by_autonomy().items():
        print(f"  {level}: {desc}")
    
    print("\n按领域分类:")
    for domain, desc in classification.by_domain().items():
        print(f"  {domain}: {desc}")
    
    print("\n按架构分类:")
    for arch, desc in classification.by_architecture().items():
        print(f"  {arch}: {desc}")
```

```python
# 智能体核心组件

from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from abc import ABC, abstractmethod

class AgentComponent(ABC):
    """智能体组件基类"""
    
    @abstractmethod
    def process(self, input_data: Any) -> Any:
        """处理数据"""
        pass

class PerceptionModule(AgentComponent):
    """感知模块"""
    
    def __init__(self):
        self.sensors = []
    
    def add_sensor(self, sensor: str):
        """添加传感器"""
        self.sensors.append(sensor)
    
    def process(self, input_data: Any) -> Dict[str, Any]:
        """感知环境"""
        # 模拟感知过程
        perceived = {
            "raw_input": input_data,
            "sensors_active": self.sensors,
            "timestamp": "2024-01-01T00:00:00"
        }
        return perceived

class DecisionModule(AgentComponent):
    """决策模块"""
    
    def __init__(self):
        self.rules = []
        self.knowledge_base = {}
    
    def add_rule(self, rule: Dict):
        """添加决策规则"""
        self.rules.append(rule)
    
    def process(self, perception: Dict) -> str:
        """决策"""
        # 简化的决策逻辑
        for rule in self.rules:
            if self._match_rule(perception, rule):
                return rule["action"]
        return "default_action"
    
    def _match_rule(self, perception: Dict, rule: Dict) -> bool:
        """匹配规则"""
        # 简化实现
        return True

class ExecutionModule(AgentComponent):
    """执行模块"""
    
    def __init__(self):
        self.actions = {}
    
    def register_action(self, action_name: str, action_func):
        """注册动作"""
        self.actions[action_name] = action_func
    
    def process(self, decision: str) -> Any:
        """执行动作"""
        if decision in self.actions:
            return self.actions[decision]()
        return None

class MemoryModule(AgentComponent):
    """记忆模块"""
    
    def __init__(self, capacity: int = 1000):
        self.short_term = []
        self.long_term = {}
        self.capacity = capacity
    
    def store(self, key: str, value: Any):
        """存储信息"""
        self.short_term.append({"key": key, "value": value})
        
        # 短期记忆满时，转存到长期记忆
        if len(self.short_term) > self.capacity:
            old_item = self.short_term.pop(0)
            self.long_term[old_item["key"]] = old_item["value"]
    
    def retrieve(self, key: str) -> Optional[Any]:
        """检索信息"""
        # 先查短期记忆
        for item in reversed(self.short_term):
            if item["key"] == key:
                return item["value"]
        
        # 再查长期记忆
        return self.long_term.get(key)
    
    def process(self, input_data: Any) -> Any:
        """处理记忆"""
        self.store("last_input", input_data)
        return input_data

@dataclass
class Agent:
    """完整智能体"""
    name: str
    perception: PerceptionModule
    decision: DecisionModule
    execution: ExecutionModule
    memory: MemoryModule
    
    def run(self, environment_input: Any) -> Any:
        """运行智能体"""
        # 1. 感知
        perception_result = self.perception.process(environment_input)
        
        # 2. 决策
        decision = self.decision.process(perception_result)
        
        # 3. 执行
        execution_result = self.execution.process(decision)
        
        # 4. 记忆
        self.memory.store("last_action", decision)
        
        return execution_result

# 使用示例
if __name__ == "__main__":
    print("=== 智能体核心组件 ===\n")
    
    # 创建组件
    perception = PerceptionModule()
    perception.add_sensor("camera")
    perception.add_sensor("microphone")
    
    decision = DecisionModule()
    decision.add_rule({"condition": "obstacle", "action": "avoid"})
    
    execution = ExecutionModule()
    execution.register_action("avoid", lambda: "避开障碍物")
    execution.register_action("default_action", lambda: "继续前进")
    
    memory = MemoryModule(capacity=100)
    
    # 创建智能体
    agent = Agent(
        name="测试机器人",
        perception=perception,
        decision=decision,
        execution=execution,
        memory=memory
    )
    
    # 运行智能体
    result = agent.run("检测到前方有障碍物")
    print(f"智能体动作: {result}")
    
    # 检查记忆
    last_action = memory.retrieve("last_action")
    print(f"记忆中的动作: {last_action}")
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 概念混淆 | 对比不同类型的智能体 |
| 2 | 理论与实践脱节 | 通过代码示例加深理解 |
| 3 | 发展史记不住 | 关注关键节点，理解技术演进 |
| 4 | 组件关系不清 | 画架构图帮助理解 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| 智能体 | 能感知环境并采取行动的实体 |
| 自主性 | 独立决策和行动的能力 |
| 反应性 | 感知环境并做出响应 |
| 主动性 | 主动采取行动实现目标 |
| 感知模块 | 获取环境信息的组件 |
| 决策模块 | 分析和决策的组件 |
| 执行模块 | 执行动作的组件 |
| 记忆模块 | 存储经验和知识的组件 |

## ✅ 验收清单
- [ ] 理解智能体的定义和核心特征
- [ ] 能分类和描述各种智能体
- [ ] 了解智能体的发展历程
- [ ] 理解智能体的核心组件

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
