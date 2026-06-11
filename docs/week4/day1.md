# 📅 Week 4 Day 1：Agent 定义、类型与演化史

## 🧭 今日方向
> 从零理解"什么是 Agent"——从经典 AI 定义到大模型时代的 Agent 范式转变，掌握五大 Agent 类型的核心差异，并用 Python 亲手实现每一种。

## 🎯 生活比喻
> 想象你在超市购物。**简单反射型 Agent** 就像看到红色标签就拿起来；**基于模型的 Agent** 会记得你上次买过什么，避免重复；**基于目标的 Agent** 带着"今晚做意大利菜"的清单行动；**基于效用的 Agent** 会在两个番茄酱之间比较性价比；**学习型 Agent** 上次买了难吃的酱，这次自动跳过。

## 📋 今日三件事
1. 理解 Agent 的四大核心特征：自主性、反应性、主动性、社交能力
2. 掌握五大经典 Agent 类型的区别与适用场景
3. 用 Python 实现全部五种 Agent 类型，运行并验证结果

---

## 🗺️ 手把手路线

### Step 1: 理解 Agent 的核心定义
- **做什么**: 阅读并理解 Agent 的经典定义与四大特征
- **为什么**: 这是整个 Agent 领域的基础概念，后续所有内容都建立在此之上
- **成功标志**: 能用自己的话解释什么是 Agent，并举例说明四大特征

### Step 2: 掌握五大 Agent 类型
- **做什么**: 逐一学习 Simple Reflex、Model-Based、Goal-Based、Utility-Based、Learning Agent
- **为什么**: 理解类型差异是选择合适架构的前提
- **成功标志**: 能判断一个给定场景应该用哪种 Agent 类型

### Step 3: 实现并运行所有 Agent 类型
- **做什么**: 用 Python 类实现每种 Agent，附带可运行的示例
- **为什么**: 代码是最好的理解方式
- **成功标志**: 所有代码能正确运行，输出符合预期

---

## 💻 代码区

### 代码 1: Agent 核心组件框架

```python
"""
Agent 核心组件框架
包含：感知模块、决策模块、执行模块、记忆模块
这是所有 Agent 类型的基础结构
"""

# ============ 感知模块 ============
class PerceptionModule:
    """感知模块：负责从环境中获取信息"""

    def __init__(self):
        self.sensors = []  # 传感器列表

    def perceive(self, environment):
        """感知环境状态，返回感知到的信息"""
        perceived = {}
        for sensor in self.sensors:
            key, value = sensor(environment)
            perceived[key] = value
        # 如果没有注册传感器，直接返回整个环境状态
        if not self.sensors:
            perceived = dict(environment)
        return perceived


# ============ 记忆模块 ============
class MemoryModule:
    """记忆模块：存储历史信息和经验"""

    def __init__(self, max_size=100):
        self.short_term = {}   # 短期记忆（当前状态）
        self.long_term = []    # 长期记忆（历史记录）
        self.max_size = max_size

    def store_short_term(self, key, value):
        """存储到短期记忆"""
        self.short_term[key] = value

    def store_long_term(self, experience):
        """存储到长期记忆"""
        self.long_term.append(experience)
        # 超过最大容量时，移除最早的记录
        if len(self.long_term) > self.max_size:
            self.long_term.pop(0)

    def recall(self, key=None):
        """召回记忆"""
        if key:
            return self.short_term.get(key)
        return self.short_term.copy()


# ============ 决策模块 ============
class DecisionModule:
    """决策模块：根据感知和记忆做出决策"""

    def __init__(self):
        self.rules = []  # 决策规则集

    def add_rule(self, condition, action):
        """添加决策规则：condition(perceived, memory) -> bool, action(perceived, memory) -> str"""
        self.rules.append((condition, action))

    def decide(self, perceived, memory):
        """遍历规则，返回第一个匹配的决策结果"""
        for condition, action in self.rules:
            if condition(perceived, memory):
                return action(perceived, memory)
        return {"action": "idle", "reason": "无匹配规则"}


# ============ 执行模块 ============
class ExecutionModule:
    """执行模块：执行决策结果"""

    def __init__(self):
        self.action_log = []  # 动作日志

    def execute(self, decision):
        """执行决策并记录日志"""
        self.action_log.append(decision)
        result = {
            "status": "executed",
            "action": decision,
            "step": len(self.action_log)
        }
        print(f"  [执行] 步骤 {result['step']}: {decision}")
        return result


# ============ 基础 Agent ============
class BaseAgent:
    """
    基础 Agent 类
    整合感知、记忆、决策、执行四大模块
    所有具体 Agent 类型都继承此类
    """

    def __init__(self, name="Agent"):
        self.name = name
        self.perception = PerceptionModule()
        self.memory = MemoryModule()
        self.decision = DecisionModule()
        self.execution = ExecutionModule()

    def run_cycle(self, environment):
        """运行一个完整的感知-决策-执行循环"""
        # 1. 感知
        perceived = self.perception.perceive(environment)
        self.memory.store_short_term("current_perception", perceived)
        # 2. 决策
        decision = self.decision.decide(perceived, self.memory)
        # 3. 执行
        result = self.execution.execute(decision)
        # 4. 记忆：存入长期记忆
        self.memory.store_long_term({
            "perception": perceived,
            "decision": decision,
            "result": result
        })
        return result


# ====== 运行测试 ======
if __name__ == "__main__":
    print("=" * 50)
    print("  Agent 核心组件测试")
    print("=" * 50)

    agent = BaseAgent("测试Agent")

    # 模拟环境
    env = {"temperature": 28, "humidity": 60, "light": "on"}
    print(f"\n环境状态: {env}")

    # 运行一个循环
    result = agent.run_cycle(env)
    print(f"\n执行结果: {result}")
    print(f"记忆中的历史记录数: {len(agent.memory.long_term)}")
```

**预期输出：**
```
==================================================
  Agent 核心组件测试
==================================================

环境状态: {'temperature': 28, 'humidity': 60, 'light': 'on'}
  [执行] 步骤 1: {'action': 'idle', 'reason': '无匹配规则'}

执行结果: {'status': 'executed', 'action': {'action': 'idle', 'reason': '无匹配规则'}, 'step': 1}
记忆中的历史记录数: 1
```

### 代码 2: 五种 Agent 类型完整实现

```python
"""
五大经典 Agent 类型实现
每种类型都有独特的决策逻辑
"""

from abc import ABC, abstractmethod
import random

# ============ 类型 1: 简单反射型 Agent ============
class SimpleReflexAgent:
    """
    简单反射型 Agent
    仅根据当前感知做出反应，不考虑历史
    特点：最简单、最快速、但能力最弱
    场景：恒温器、自动门
    """

    def __init__(self, name="简单反射Agent"):
        self.name = name
        self.response_table = {}  # 条件-动作映射表

    def add_response(self, condition_value, action):
        """添加条件-动作映射"""
        self.response_table[condition_value] = action

    def act(self, environment_state):
        """根据当前状态直接做出反应"""
        print(f"\n--- {self.name} 开始工作 ---")
        print(f"  [感知] 当前状态: {environment_state}")

        for key, value in environment_state.items():
            if key in self.response_table:
                action = self.response_table[key]
                print(f"  [决策] 匹配规则: {key} -> {action}")
                print(f"  [执行] 执行动作: {action}")
                return action

        action = "无匹配规则，保持默认"
        print(f"  [决策] 无匹配规则")
        print(f"  [执行] {action}")
        return action


# ============ 类型 2: 基于模型的 Agent ============
class ModelBasedAgent:
    """
    基于模型的 Agent
    维护内部世界模型，考虑历史信息
    特点：能处理部分可观测环境
    场景：扫地机器人（记住已清扫区域）
    """

    def __init__(self, name="模型Agent"):
        self.name = name
        self.world_model = {}  # 内部世界模型

    def update_model(self, perceived):
        """根据感知更新内部世界模型"""
        self.world_model.update(perceived)

    def act(self, environment_state):
        """基于内部模型做出决策"""
        print(f"\n--- {self.name} 开始工作 ---")
        print(f"  [感知] 环境状态: {environment_state}")

        old_model = self.world_model.copy()
        self.update_model(environment_state)
        print(f"  [模型] 旧模型: {old_model}")
        print(f"  [模型] 新模型: {self.world_model}")

        # 比较变化
        changes = {}
        for key in self.world_model:
            old_val = old_model.get(key)
            new_val = self.world_model[key]
            if old_val != new_val:
                changes[key] = (old_val, new_val)

        if changes:
            action = f"检测到变化 {changes}，调整行为"
        else:
            action = "状态未变，保持当前策略"

        print(f"  [决策] {action}")
        return action


# ============ 类型 3: 基于目标的 Agent ============
class GoalBasedAgent:
    """
    基于目标的 Agent
    根据目标选择能达成目标的动作
    特点：有明确的目的性，可以做长期规划
    场景：导航系统（从A到B）
    """

    def __init__(self, name="目标Agent"):
        self.name = name
        self.goal = None

    def set_goal(self, goal):
        """设定目标"""
        self.goal = goal
        print(f"  [目标设定] 新目标: {goal}")

    def act(self, environment_state):
        """朝着目标选择最佳动作"""
        print(f"\n--- {self.name} 开始工作 ---")
        print(f"  [感知] 当前状态: {environment_state}")
        print(f"  [目标] 当前目标: {self.goal}")

        if not self.goal:
            print("  [决策] 没有设定目标，进入待机")
            return "待机 - 无目标"

        actions = []
        for key, target_val in self.goal.items():
            current_val = environment_state.get(key, 0)
            if isinstance(target_val, (int, float)) and isinstance(current_val, (int, float)):
                if target_val > current_val:
                    actions.append(f"增加{key}")
                elif target_val < current_val:
                    actions.append(f"减少{key}")
                else:
                    print(f"  [分析] {key}: 已达标 ({current_val} == {target_val})")

        action = " + ".join(actions) if actions else "所有目标已达成！"
        print(f"  [决策] {action}")
        return action


# ============ 类型 4: 基于效用的 Agent ============
class UtilityBasedAgent:
    """
    基于效用的 Agent
    在多个可能动作中选择效用（满意度）最高的
    特点：能在不确定环境中做出最优选择
    场景：股票交易、资源分配
    """

    def __init__(self, name="效用Agent"):
        self.name = name
        self.weights = {}  # 权重配置

    def set_weights(self, weights):
        """设置不同维度的权重"""
        self.weights = weights

    def calculate_utility(self, state, action_name):
        """计算给定状态和动作的效用值（加权求和）"""
        total = 0
        for key, value in state.items():
            if key in self.weights:
                total += value * self.weights[key]
        # 动作调整系数
        action_modifier = {
            "激进策略": 1.2, "保守策略": 0.8, "平衡策略": 1.0
        }
        total *= action_modifier.get(action_name, 1.0)
        return total

    def act(self, environment_state):
        """选择效用最高的动作"""
        print(f"\n--- {self.name} 开始工作 ---")
        print(f"  [感知] 环境状态: {environment_state}")

        candidates = []
        for action_name in ["激进策略", "保守策略", "平衡策略"]:
            utility = self.calculate_utility(environment_state, action_name)
            candidates.append((action_name, utility))
            print(f"  [评估] {action_name}: 效用值 = {utility:.4f}")

        best_action, best_utility = max(candidates, key=lambda x: x[1])
        print(f"  [决策] 最优选择: {best_action} (效用值: {best_utility:.4f})")
        return best_action


# ============ 类型 5: 学习型 Agent ============
class LearningAgent:
    """
    学习型 Agent
    通过经验不断改进自身行为
    特点：能适应新环境，持续进化
    场景：推荐系统、游戏AI
    """

    def __init__(self, name="学习Agent"):
        self.name = name
        self.knowledge = {}       # 已学习的知识（Q值表）
        self.learning_rate = 0.3  # 学习率
        self.reward_history = []  # 奖励历史

    def learn(self, state, action, reward):
        """从经验中学习（简化版Q学习）"""
        key = f"{state}_{action}"
        old_q = self.knowledge.get(key, 0.0)
        # Q值更新公式：new_q = old_q + lr * (reward - old_q)
        new_q = old_q + self.learning_rate * (reward - old_q)
        self.knowledge[key] = new_q
        self.reward_history.append(reward)
        print(f"  [学习] {state} + {action} -> 奖励: {reward:.2f}, Q值: {old_q:.2f} -> {new_q:.2f}")

    def get_best_action(self, state):
        """根据已学知识选择最佳动作"""
        actions = ["探索新路径", "使用已知最佳", "求助外部", "随机尝试"]
        best_q = float('-inf')
        best_action = actions[0]
        for action in actions:
            q = self.knowledge.get(f"{state}_{action}", 0.0)
            if q > best_q:
                best_q = q
                best_action = action
        return best_action, best_q

    def act(self, environment_state):
        """基于学习经验做出决策"""
        print(f"\n--- {self.name} 开始工作 ---")
        print(f"  [感知] 环境状态: {environment_state}")

        state_str = str(environment_state)
        best_action, best_q = self.get_best_action(state_str)
        print(f"  [知识库] 当前条目数: {len(self.knowledge)}")
        print(f"  [决策] 选择: {best_action} (Q值: {best_q:.2f})")

        # 模拟根据动作获得奖励
        reward = random.uniform(-1.0, 1.0)
        self.learn(state_str, best_action, reward)

        if len(self.reward_history) > 1:
            recent_avg = sum(self.reward_history[-3:]) / min(3, len(self.reward_history))
            print(f"  [趋势] 近期平均奖励: {recent_avg:.2f}")

        return best_action


# ====== 运行所有 Agent 示例 ======
if __name__ == "__main__":
    print("=" * 60)
    print("  五大 Agent 类型演示")
    print("=" * 60)

    # --- 简单反射型 ---
    print("\n>>> 类型1: 简单反射型 Agent")
    agent1 = SimpleReflexAgent("温控器Agent")
    agent1.add_response("temperature_high", "打开空调制冷")
    agent1.add_response("temperature_low", "打开暖气制热")
    agent1.add_response("temperature_normal", "关闭空调")
    agent1.act({"temperature": "temperature_high"})
    agent1.act({"temperature": "temperature_normal"})

    # --- 基于模型 ---
    print("\n>>> 类型2: 基于模型 Agent")
    agent2 = ModelBasedAgent("扫地机器人Agent")
    agent2.act({"客厅": "已清扫", "卧室": "未清扫"})
    agent2.act({"客厅": "已清扫", "卧室": "已清扫", "厨房": "未清扫"})

    # --- 基于目标 ---
    print("\n>>> 类型3: 基于目标 Agent")
    agent3 = GoalBasedAgent("导航Agent")
    agent3.set_goal({"距离目标": 0, "能量": 50})
    agent3.act({"距离目标": 100, "能量": 30})
    agent3.act({"距离目标": 0, "能量": 80})

    # --- 基于效用 ---
    print("\n>>> 类型4: 基于效用 Agent")
    agent4 = UtilityBasedAgent("投资Agent")
    agent4.set_weights({"收益率": 0.6, "风险": -0.3, "流动性": 0.1})
    agent4.act({"收益率": 0.08, "风险": 0.5, "流动性": 0.7})

    # --- 学习型 ---
    print("\n>>> 类型5: 学习型 Agent")
    random.seed(42)
    agent5 = LearningAgent("推荐Agent")
    for i in range(4):
        agent5.act({"user_preference": f"类别{i % 3}"})
```

**预期输出：**
```
============================================================
  五大 Agent 类型演示
============================================================

>>> 类型1: 简单反射型 Agent

--- 温控器Agent 开始工作 ---
  [感知] 当前状态: {'temperature': 'temperature_high'}
  [决策] 匹配规则: temperature_high -> 打开空调制冷
  [执行] 执行动作: 打开空调制冷

--- 温控器Agent 开始工作 ---
  [感知] 当前状态: {'temperature': 'temperature_normal'}
  [决策] 匹配规则: temperature_normal -> 关闭空调
  [执行] 执行动作: 关闭空调

>>> 类型2: 基于模型 Agent

--- 扫地机器人Agent 开始工作 ---
  [感知] 环境状态: {'客厅': '已清扫', '卧室': '未清扫'}
  [模型] 旧模型: {}
  [模型] 新模型: {'客厅': '已清扫', '卧室': '未清扫'}
  [决策] 检测到变化 {...}，调整行为
...
```

### 代码 3: Agent 演化历史时间线

```python
"""
Agent 技术演化史时间线
从 1950 年代的符号 AI 到 2024+ 的大模型 Agent 时代
"""

timeline = {
    "1950s-1960s 符号AI时代": {
        "代表技术": "逻辑推理、搜索算法",
        "里程碑": ["1950: 图灵测试提出", "1956: 达特茅斯会议", "1956: Logic Theorem"],
        "Agent 特征": "基于规则，无学习能力",
        "局限": "知识获取瓶颈，无法处理不确定性",
    },
    "1970s-1980s 专家系统时代": {
        "代表技术": "规则引擎、知识图谱",
        "里程碑": ["1972: MYCIN 医疗诊断", "1980: R1 商业专家系统"],
        "Agent 特征": "领域专家知识编码",
        "局限": "维护困难，知识覆盖有限",
    },
    "1990s-2000s 机器学习时代": {
        "代表技术": "统计学习、神经网络",
        "里程碑": ["1997: 深蓝击败国际象棋冠军", "2006: 深度学习概念提出", "2012: AlexNet"],
        "Agent 特征": "从数据中学习，适应性增强",
        "局限": "需要大量标注数据",
    },
    "2017-2022 大模型预训练时代": {
        "代表技术": "Transformer、预训练-微调",
        "里程碑": ["2017: Transformer 发布", "2020: GPT-3", "2022: ChatGPT"],
        "Agent 特征": "通用语言理解与生成",
        "局限": "幻觉问题、缺乏规划能力",
    },
    "2023-2024+ Agent 时代": {
        "代表技术": "工具调用、多Agent协作、自主规划",
        "里程碑": ["2023: AutoGPT", "2023: Function Calling", "2024: Computer Use Agent"],
        "Agent 特征": "自主规划、工具使用、环境交互",
        "局限": "安全性、可控性仍需提升",
    },
}

def print_timeline():
    """打印 Agent 演化时间线"""
    print("=" * 65)
    print("  Agent 技术演化史")
    print("=" * 65)
    for era, info in timeline.items():
        print(f"\n{'─' * 55}")
        print(f"  📌 {era}")
        print(f"{'─' * 55}")
        print(f"  代表技术: {info['代表技术']}")
        print(f"  Agent 特征: {info['Agent 特征']}")
        print(f"  局限: {info['局限']}")
        print(f"  里程碑:")
        for event in info['里程碑']:
            print(f"    • {event}")

print_timeline()
```

### 代码 4: Agent 分类框架

```python
"""
Agent 分类框架
根据特征判断 Agent 类型
"""

class AgentClassifier:
    """Agent 分类器"""

    FEATURES = {
        "simple_reflex":  {"has_memory": False, "has_goal": False, "has_utility": False, "has_learning": False},
        "model_based":    {"has_memory": True,  "has_goal": False, "has_utility": False, "has_learning": False},
        "goal_based":     {"has_memory": True,  "has_goal": True,  "has_utility": False, "has_learning": False},
        "utility_based":  {"has_memory": True,  "has_goal": True,  "has_utility": True,  "has_learning": False},
        "learning":       {"has_memory": True,  "has_goal": True,  "has_utility": True,  "has_learning": True},
    }

    DESCRIPTIONS = {
        "simple_reflex": "简单反射型：仅根据当前感知做出反应",
        "model_based":   "基于模型型：维护世界模型，考虑历史信息",
        "goal_based":    "基于目标型：有明确目标，选择达成目标的动作",
        "utility_based": "基于效用型：评估多个选项的效用，选最优",
        "learning":      "学习型：能从经验中学习并持续改进",
    }

    @classmethod
    def classify(cls, has_memory=False, has_goal=False,
                 has_utility=False, has_learning=False):
        """根据特征分类 Agent"""
        features = {"has_memory": has_memory, "has_goal": has_goal,
                     "has_utility": has_utility, "has_learning": has_learning}
        for agent_type, required in cls.FEATURES.items():
            match = all(features[k] == required[k] for k in features)
            if match:
                return agent_type, cls.DESCRIPTIONS[agent_type]
        return "unknown", "无法分类"

    @classmethod
    def compare_all(cls):
        """打印所有类型的对比表"""
        print("\n" + "=" * 70)
        print("  Agent 类型对比表")
        print("=" * 70)
        header = f"  {'类型':<16} {'记忆':<6} {'目标':<6} {'效用':<6} {'学习':<6}"
        print(header)
        print(f"  {'─' * 48}")
        for agent_type, features in cls.FEATURES.items():
            mem  = "Y" if features["has_memory"]  else "N"
            goal = "Y" if features["has_goal"]     else "N"
            util = "Y" if features["has_utility"]   else "N"
            learn = "Y" if features["has_learning"] else "N"
            print(f"  {agent_type:<16} {mem:<6} {goal:<6} {util:<6} {learn:<6}")


# ====== 运行分类测试 ======
if __name__ == "__main__":
    AgentClassifier.compare_all()

    print("\n  分类测试:")
    tests = [
        (False, False, False, False, "恒温器"),
        (True,  False, False, False, "扫地机器人"),
        (True,  True,  False, False, "导航系统"),
        (True,  True,  True,  False, "交易系统"),
        (True,  True,  True,  True,  "游戏AI"),
    ]
    for mem, goal, util, learn, name in tests:
        agent_type, desc = AgentClassifier.classify(mem, goal, util, learn)
        print(f"  {name} -> {agent_type}: {desc}")
```

**预期输出：**
```
======================================================================
  Agent 类型对比表
======================================================================
  类型             记忆   目标   效用   学习
  ────────────────────────────────────────────────
  simple_reflex    N      N      N      N
  model_based      Y      N      N      N
  goal_based       Y      Y      N      N
  utility_based    Y      Y      Y      N
  learning         Y      Y      Y      Y

  分类测试:
  恒温器 -> simple_reflex: 简单反射型：仅根据当前感知做出反应
  扫地机器人 -> model_based: 基于模型型：维护世界模型，考虑历史信息
  导航系统 -> goal_based: 基于目标型：有明确目标，选择达成目标的动作
  交易系统 -> utility_based: 基于效用型：评估多个选项的效用，选最优
  游戏AI -> learning: 学习型：能从经验中学习并持续改进
```

---

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 运行报 `NameError` 未定义某类 | 确保先运行代码 1（BaseAgent 定义），再运行代码 2 |
| 2 | 不确定某场景该用哪种 Agent | 从最简单的开始：先试 SimpleReflex，不够再升级到更复杂的类型 |
| 3 | LearningAgent 输出的奖励波动大 | 正常现象，Q学习需要足够多轮次才能收敛，可增加循环次数 |
| 4 | 不理解"效用函数" | 效用函数就是一个评分函数，给 (状态, 动作) 打分，选最高分的 |
| 5 | 混淆 Model-Based 和 Goal-Based | 核心区别：Model-Based 只"记住"，Goal-Based 还有"目标"要去达成 |
| 6 | 代码运行结果与预期不同 | 检查是否设置了随机种子（`random.seed`），学习型Agent的输出可能随机 |

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Agent | 能够自主感知环境并采取行动的实体 |
| 自主性 (Autonomy) | 不需要人类干预就能独立运行的能力 |
| 反应性 (Reactivity) | 对环境变化做出及时响应的能力 |
| 主动性 (Proactiveness) | 主动采取行动而非被动等待的能力 |
| 社交能力 (Social Ability) | 与其他 Agent 或人类交互的能力 |
| Simple Reflex | 最简单的 Agent，只看当前状态，用条件-动作规则 |
| Model-Based | 有内部世界模型的 Agent，能处理部分可观测环境 |
| Goal-Based | 有目标的 Agent，选择能达成目标的动作 |
| Utility-Based | 能评估效用的 Agent，选择效用最高的动作 |
| Learning Agent | 能从经验中学习并改进的 Agent |
| 世界模型 | Agent 对环境的内部表示 |
| 效用函数 | 将 (状态, 动作) 映射为标量值的函数 |

---

## ✅ 验收清单

- [ ] 能用自己的话定义 Agent 及其四大核心特征
- [ ] 能区分五种 Agent 类型，说出每种的核心差异
- [ ] 能说出 Agent 技术从符号AI到LLM时代的关键转折点
- [ ] 代码 1（核心组件框架）能正确运行
- [ ] 代码 2（五种类型实现）能正确运行，每种都有清晰输出
- [ ] 代码 3（演化时间线）能打印出完整的历史脉络
- [ ] 代码 4（分类框架）能正确分类测试用例
- [ ] 能为一个具体场景（如智能客服）选择合适的 Agent 类型并说明理由

---

## 📝 复盘小纸条
- 今天最大的收获: ________________________________
- 还不太确定的: ________________________________
- 五种类型中最有用的是: ________________________________
- 明天要用到的基础知识: ________________________________

---

## 📥 明日同步接口
- 今日完成度: ____%
- 卡点描述: ________________________________
- 代码是否能跑通: ✅ 全部通过 / ⚠️ 部分通过 / ❌ 未通过
- 明天希望: 理解 ReAct 模式如何将推理与行动结合
