# 📅 Week 13 Day 7：选修方向 G-I + 本周复盘

## 🧭 今日方向
> 学习选修方向（Agent 辩论、本地 Agent、DevOps），并复盘整个 Week 13 的学习内容。

## 🎯 生活比喻
> 今天的选修就像自助餐。你可以选择"甜点"（Agent 辩论 - 趣味性强）、"主食"（本地 Agent - 实用性强）或"沙拉"（DevOps - 基础设施）。然后，我们会坐下来回顾这顿"大餐"，记下哪些好吃，哪些不合口味。

## 📋 今日三件事
1. 了解选修方向的核心内容
2. 选择一个方向深入学习
3. 复盘整个 Week 13

## 🗺️ 手把手路线

### Step 1：选修方向概览
- 做什么: 快速了解 G、H、I 三个选修方向
- 为什么: 知道有哪些选择
- 成功标志: 能说出每个方向的核心

### Step 2：选择深入方向
- 做什么: 选择一个方向深入
- 为什么: 深度比广度更重要
- 成功标志: 完成该方向的核心实践

### Step 3：本周复盘
- 做什么: 回顾 Week 13 所有内容
- 为什么: 复盘是学习的闭环
- 成功标志: 完成知识图谱和自我评估

## 💻 代码区

```python
"""
选修方向 G-I + 本周复盘
Agent 辩论 / 本地 Agent / DevOps
"""
from dataclasses import dataclass, field
from typing import Dict, List, Any
from enum import Enum

# ========== 1. 选修方向概览 ==========

class ElectiveDirection(Enum):
    """选修方向"""
    AGENT_DEBATE = "G - Agent 辩论"
    LOCAL_AGENT = "H - 本地 Agent"
    DEVOPS = "I - DevOps"


@dataclass
class DirectionInfo:
    """方向信息"""
    name: str
    description: str
    difficulty: str
    time_required: str
    prerequisites: List[str]
    skills_gained: List[str]
    project_idea: str


DIRECTIONS = {
    ElectiveDirection.AGENT_DEBATE: DirectionInfo(
        name="Agent 辩论",
        description="多个 Agent 就同一话题进行辩论，展示不同观点",
        difficulty: "中等",
        time_required: "2-3 小时",
        prerequisites=["基础 Agent 框架", "对话系统"],
        skills_gained=["多 Agent 协调", "观点生成", "辩论逻辑"],
        project_idea="构建一个 AI 辩论系统，让两个 Agent 就热点话题辩论"
    ),
    ElectiveDirection.LOCAL_AGENT: DirectionInfo(
        name="本地 Agent",
        description="在本地运行的 Agent，保护隐私且无需网络",
        difficulty: "中等",
        time_required: "3-4 小时",
        prerequisites=["Ollama/llama.cpp", "Python 基础"],
        skills_gained=["本地模型部署", "隐私保护", "离线推理"],
        project_idea="构建一个完全本地运行的个人助手 Agent"
    ),
    ElectiveDirection.DEVOPS: DirectionInfo(
        name="Agent DevOps",
        description="Agent 系统的持续集成、部署和运维",
        difficulty: "较高",
        time_required: "4-5 小时",
        prerequisites=["Docker", "CI/CD", "监控"],
        skills_gained=["自动化部署", "监控告警", "性能优化"],
        project_idea="为 Agent 项目搭建完整的 DevOps 流水线"
    ),
}


# ========== 2. Agent 辩论实现 ==========

@dataclass
class DebateArgument:
    """辩论论点"""
    agent_name: str
    stance: str  # for/against
    argument: str
    evidence: List[str] = field(default_factory=list)
    rebuttal: str = ""


class DebateAgent:
    """辩论 Agent"""
    
    def __init__(self, name: str, stance: str):
        self.name = name
        self.stance = stance
        self.arguments: List[DebateArgument] = []
    
    def generate_argument(self, topic: str, context: str = "") -> DebateArgument:
        """生成论点"""
        # 模拟论点生成
        if self.stance == "for":
            argument = f"支持观点: {topic} 有诸多优点"
            evidence = ["数据支持", "专家观点", "实际案例"]
        else:
            argument = f"反对观点: {topic} 存在明显问题"
            evidence = ["风险分析", "反面案例", "专家警告"]
        
        debate_arg = DebateArgument(
            agent_name=self.name,
            stance=self.stance,
            argument=argument,
            evidence=evidence
        )
        
        self.arguments.append(debate_arg)
        return debate_arg
    
    def rebut(self, opponent_argument: DebateArgument) -> str:
        """反驳"""
        return f"反驳 {opponent_argument.agent_name}: {opponent_argument.argument} 的论据不够充分"


class DebateModerator:
    """辩论主持人"""
    
    def __init__(self, topic: str):
        self.topic = topic
        self.rounds: List[List[DebateArgument]] = []
        self.agents: List[DebateAgent] = []
    
    def add_agent(self, agent: DebateAgent):
        self.agents.append(agent)
    
    def run_round(self) -> List[DebateArgument]:
        """运行一轮辩论"""
        round_arguments = []
        
        for agent in self.agents:
            arg = agent.generate_argument(self.topic)
            round_arguments.append(arg)
        
        self.rounds.append(round_arguments)
        return round_arguments
    
    def get_summary(self) -> Dict:
        """获取辩论摘要"""
        return {
            "topic": self.topic,
            "rounds": len(self.rounds),
            "total_arguments": sum(len(r) for r in self.rounds),
            "agents": [(a.name, a.stance) for a in self.agents]
        }


# ========== 3. 本地 Agent ==========

class LocalAgent:
    """本地 Agent"""
    
    def __init__(self, model_name: str = "llama2"):
        self.model_name = model_name
        self.conversation_history: List[Dict] = []
        self.is_local = True
    
    def chat(self, message: str) -> str:
        """对话"""
        self.conversation_history.append({"role": "user", "content": message})
        
        # 模拟本地推理
        response = f"[本地模型 {self.model_name}] {message[:50]}..."
        
        self.conversation_history.append({"role": "assistant", "content": response})
        return response
    
    def get_privacy_info(self) -> Dict:
        """获取隐私信息"""
        return {
            "is_local": self.is_local,
            "data_stays_on_device": True,
            "no_internet_required": True,
            "model": self.model_name
        }


# ========== 4. Agent DevOps ==========

class AgentDevOps:
    """Agent DevOps"""
    
    def __init__(self, project_name: str):
        self.project_name = project_name
        self.pipelines: List[Dict] = []
    
    def create_pipeline(self, name: str, steps: List[str]) -> Dict:
        """创建流水线"""
        pipeline = {
            "name": name,
            "steps": steps,
            "status": "created",
            "last_run": None
        }
        self.pipelines.append(pipeline)
        return pipeline
    
    def run_pipeline(self, name: str) -> Dict:
        """运行流水线"""
        for pipeline in self.pipelines:
            if pipeline["name"] == name:
                pipeline["status"] = "running"
                # 模拟运行
                pipeline["status"] = "success"
                pipeline["last_run"] = "2024-01-01"
                return pipeline
        return {"error": f"Pipeline {name} not found"}
    
    def get_status(self) -> Dict:
        """获取状态"""
        return {
            "project": self.project_name,
            "pipelines": len(self.pipelines),
            "last_deployment": "2024-01-01"
        }


# ========== 5. 本周知识图谱 ==========

def create_week13_graph() -> Dict:
    """创建 Week 13 知识图谱"""
    return {
        "Day 1 - 从零搭建 LLM": {
            "topics": ["Transformer", "Multi-Head Attention", "位置编码"],
            "mastery": "familiar"
        },
        "Day 2 - Agent 框架": {
            "topics": ["Agent 接口", "Tool 系统", "Memory"],
            "mastery": "familiar"
        },
        "Day 3 - 多模态 Agent": {
            "topics": ["模态编码", "模态融合", "多模态处理"],
            "mastery": "learning"
        },
        "Day 4 - GUI/Web Agent": {
            "topics": ["屏幕理解", "操作执行", "界面交互"],
            "mastery": "learning"
        },
        "Day 5 - Agent 自进化": {
            "topics": ["经验存储", "策略优化", "自我改进"],
            "mastery": "learning"
        },
        "Day 6 - 案例分析": {
            "topics": ["成功案例", "失败案例", "最佳实践"],
            "mastery": "familiar"
        },
        "Day 7 - 选修方向": {
            "topics": ["Agent 辩论", "本地 Agent", "DevOps"],
            "mastery": "learning"
        }
    }


# ========== 6. 主函数 ==========

def main():
    print("=" * 60)
    print("Week 13 Day 7：选修方向 + 本周复盘")
    print("=" * 60)
    
    # 1. 选修方向概览
    print("\n1. 选修方向概览:")
    print("-" * 40)
    
    for direction, info in DIRECTIONS.items():
        print(f"\n  {info.name}")
        print(f"    描述: {info.description}")
        print(f"    难度: {info.difficulty}")
        print(f"    时间: {info.time_required}")
        print(f"    技能: {', '.join(info.skills_gained[:3])}")
    
    # 2. Agent 辩论示例
    print("\n2. Agent 辩论示例:")
    print("-" * 40)
    
    topic = "AI 是否会取代程序员"
    moderator = DebateModerator(topic)
    
    agent_for = DebateAgent("Alice", "for")
    agent_against = DebateAgent("Bob", "against")
    
    moderator.add_agent(agent_for)
    moderator.add_agent(agent_against)
    
    # 运行辩论
    for round_num in range(2):
        print(f"\n  Round {round_num + 1}:")
        arguments = moderator.run_round()
        for arg in arguments:
            print(f"    {arg.agent_name} ({arg.stance}): {arg.argument}")
    
    # 3. 本地 Agent 示例
    print("\n3. 本地 Agent 示例:")
    print("-" * 40)
    
    local_agent = LocalAgent("llama2-7b")
    response = local_agent.chat("你好，请介绍一下自己")
    print(f"  用户: 你好，请介绍一下自己")
    print(f"  Agent: {response}")
    print(f"  隐私信息: {local_agent.get_privacy_info()}")
    
    # 4. DevOps 示例
    print("\n4. Agent DevOps 示例:")
    print("-" * 40)
    
    devops = AgentDevOps("my-agent-project")
    
    # 创建流水线
    pipeline = devops.create_pipeline(
        "deploy",
        ["test", "build", "push", "deploy"]
    )
    print(f"  创建流水线: {pipeline['name']}")
    
    # 运行流水线
    result = devops.run_pipeline("deploy")
    print(f"  运行结果: {result['status']}")
    
    # 5. 本周复盘
    print("\n5. 本周复盘:")
    print("-" * 40)
    
    graph = create_week13_graph()
    
    for day, info in graph.items():
        status = {"learning": "●", "familiar": "◐", "mastered": "○"}
        print(f"\n  {day}")
        print(f"    掌握度: {status[info['mastery']]} {info['mastery']}")
        print(f"    主题: {', '.join(info['topics'])}")
    
    # 6. 自我评估
    print("\n6. 自我评估:")
    print("-" * 40)
    print("""
  本周收获:
    + 从零实现了 Transformer 和 LLM
    + 构建了基础 Agent 框架
    + 了解了多模态和 GUI Agent
    + 学习了 Agent 自进化机制
    + 分析了真实世界案例
  
  待改进:
    - 多模态 Agent 的深度实践
    - 本地 Agent 的部署经验
    - Agent 辩论的实现细节
""")
    
    print("=" * 60)
    print("Week 13 完成！准备进入项目实战阶段")
    print("=" * 60)


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 不知道选哪个方向 | 选择与项目最相关的方向 |
| 2 | Agent 辩论逻辑混乱 | 使用结构化的辩论框架 |
| 3 | 本地模型运行慢 | 使用量化版本，减少参数 |
| 4 | DevOps 配置复杂 | 使用模板和脚本自动化 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Agent Debate | 多 Agent 辩论系统 |
| Local Agent | 本地运行的 Agent |
| DevOps | 开发运维一体化 |
| Ollama | 本地模型运行工具 |
| Pipeline | 自动化流水线 |

## ✅ 验收清单
- [ ] 了解三个选修方向
- [ ] 选择并完成一个方向
- [ ] 完成 Week 13 复盘
- [ ] 准备进入项目实战

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## ✍️ 如何写出好的 Skill

### Skill 设计原则

| 原则 | 说明 | 示例 |
|------|------|------|
| 单一职责 | 一个 Skill 只做一件事 | "翻译"而不是"翻译+摘要+改写" |
| 明确输入输出 | 定义清晰的输入格式和输出格式 | 输入：文本，输出：翻译结果 |
| 可组合性 | Skill 之间可以组合使用 | 翻译 Skill + 摘要 Skill = 翻译摘要 |
| 错误处理 | 优雅地处理异常情况 | 翻译失败时返回原文 |
| 可测试性 | 可以用单元测试验证 | 输入 A 应该输出 B |

### Skill 结构模板

```markdown
# Skill 名称

## 描述
一句话说明这个 Skill 做什么

## 输入
- 参数 1: 类型，说明
- 参数 2: 类型，说明

## 输出
- 返回值: 类型，说明

## 使用示例
输入 → 输出 的具体例子

## 错误情况
- 错误 1: 触发条件 + 处理方式
- 错误 2: 触发条件 + 处理方式
```

### 常见 Skill 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| 转换类 | 输入 → 输出 | 翻译、格式转换、摘要 |
| 检索类 | 查询 → 结果 | 知识检索、数据库查询 |
| 生成类 | 提示 → 内容 | 写作、代码生成、图像生成 |
| 验证类 | 输入 → 判断 | 内容审核、格式检查 |
| 编排类 | 多个 Skill 组合 | 工作流编排 |

## ⚠️ Agent 开发常见踩坑

### 坑 1：过度设计

**症状**：一上来就想做"万能 Agent"
**解决**：从最小可用 Agent 开始，逐步添加功能

### 坑 2：忽视错误处理

**症状**：Agent 遇到异常就崩溃
**解决**：每个工具调用都要有 try-except，提供优雅降级

### 坑 3：上下文窗口溢出

**症状**：对话太长导致 LLM 忘记前面的内容
**解决**：实现摘要压缩、滑动窗口、重要信息提取

### 坑 4：工具调用无限循环

**症状**：Agent 反复调用同一个工具
**解决**：设置最大调用次数，检测重复调用

### 坑 5：Prompt 注入漏洞

**症状**：用户输入恶意内容导致 Agent 行为异常
**解决**：输入验证 + Guardrails + 沙箱隔离

### 坑 6：成本失控

**症状**：API 调用费用远超预期
**解决**：设置 token 限制 + 成本告警 + 缓存策略

### 坑 7：调试困难

**症状**：Agent 行为不符合预期，不知道哪里出错
**解决**：添加详细的日志 + 使用 LangSmith 追踪

> 经验之谈：90% 的 Agent 问题都出在 Prompt 设计和错误处理上，而不是模型能力上。

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
