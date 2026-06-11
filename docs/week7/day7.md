# 📅 Week 7 Day 7：周复盘：记忆系统总结

## 🧭 今日方向
> 回顾 Week 7（上下文工程 + 记忆系统 + Persona + LangGraph + 错误处理）的全部内容，梳理知识脉络，查漏补缺，为 Week 8 做好准备。

## 🎯 生活比喻
> 复盘就像"整理工具箱"。Week 7 学了很多"工具"（上下文管理、记忆系统、Persona 设计、工作流、错误处理），今天要把它们分类整理好，贴上标签，方便下周随时取用。

## 📋 今日三件事
1. 回顾 Week 7 六天的核心知识点
2. 完成综合练习：构建带记忆的智能 Agent
3. 整理代码片段和最佳实践笔记

## 🗺️ 手把手路线

### Step 1: 知识回顾
- **做什么**: 用思维导图整理 Week 7 的知识脉络
- **为什么**: 系统化记忆更有效
- **成功标志**: 能画出完整的知识图谱

### Step 2: 综合练习
- **做什么**: 构建一个带完整记忆系统的 Agent
- **为什么**: 综合练习检验真实掌握程度
- **成功标志**: 完整项目能跑通

### Step 3: 自我评估
- **做什么**: 完成自测题，评估学习成果
- **为什么**: 了解自己的掌握程度
- **成功标志**: 能正确回答大部分问题

## 💻 代码区

### 3.1 Week 7 知识回顾清单

```python
"""
Week 7 知识回顾清单
"""

knowledge_checklist = {
    "Day 1: 上下文工程": {
        "核心概念": [
            "Token 是 LLM 处理文本的基本单位",
            "上下文窗口是 LLM 一次能处理的最大 Token 数",
            "Token 计算是管理上下文的基础",
        ],
        "技能": [
            "能用 Token 计数器计算文本大小",
            "能实现滑动窗口策略管理对话历史",
            "能实现摘要压缩减少 Token 占用",
            "能构建智能上下文管理器",
        ],
        "最佳实践": [
            "Token 预算分配: 系统提示 10-15%, 历史 40-50%, 新消息 10-20%",
            "短对话用滑动窗口，长对话用摘要压缩",
            "缓存 Token 计算结果提高性能",
        ]
    },
    "Day 2: 记忆架构": {
        "核心概念": [
            "四种记忆类型: 工作记忆、情景记忆、语义记忆、程序记忆",
            "MemGPT 三层模型: Core/Archival/Recall",
            "记忆衰减和修剪策略",
        ],
        "技能": [
            "能实现 WorkingMemory（优先级队列）",
            "能实现 EpisodicMemory（时间/标签索引）",
            "能实现 SemanticMemory（键值存储）",
            "能实现 ProceduralMemory（技能注册表）",
        ],
        "最佳实践": [
            "工作记忆保持小容量，高优先级",
            "语义记忆使用向量数据库实现语义搜索",
            "定期修剪过期记忆释放空间",
        ]
    },
    "Day 3: 记忆实现": {
        "核心概念": [
            "MemoryManager 统一管理四种记忆",
            "信息提取: 从对话中自动识别关键信息",
            "记忆整合: 多种记忆协同工作",
        ],
        "技能": [
            "能构建完整的 MemoryManager",
            "能实现自动信息提取",
            "能查询记忆系统获取上下文",
        ],
        "最佳实践": [
            "每条消息同时更新多种记忆",
            "信息提取用规则+LLM混合方案",
            "为不同记忆设置合适的容量上限",
        ]
    },
    "Day 4: Agent Persona": {
        "核心概念": [
            "Persona 五大维度: 名称、角色、性格、目标、风格",
            "System Prompt 模板化生成",
            "行为一致性检查",
        ],
        "技能": [
            "能设计完整的 Persona 配置",
            "能根据 Persona 生成 System Prompt",
            "能实现一致性检查器",
        ],
        "最佳实践": [
            "Persona 描述要具体，避免模糊",
            "添加示例用语和禁止行为",
            "定期检查输出一致性",
        ]
    },
    "Day 5: LangGraph 整合": {
        "核心概念": [
            "StateGraph: 用节点和边描述工作流",
            "节点: 每个处理步骤",
            "条件边: 根据状态动态路由",
        ],
        "技能": [
            "能设计完整的工作流状态图",
            "能实现记忆检索、Agent 思考等节点",
            "能构建带条件边的工作流",
        ],
        "最佳实践": [
            "先设计再实现，避免返工",
            "每个节点职责单一",
            "添加错误处理节点",
        ]
    },
    "Day 6: 错误处理": {
        "核心概念": [
            "错误分类: 暂时性、永久性、限流、超时等",
            "指数退避重试: 每次间隔翻倍+抖动",
            "优雅降级: 提供替代方案",
        ],
        "技能": [
            "能实现重试装饰器",
            "能设计降级策略",
            "能构建监控告警系统",
        ],
        "最佳实践": [
            "暂时性错误重试，永久性错误降级",
            "添加抖动避免雪崩效应",
            "设置合理的告警阈值",
        ]
    }
}

# 打印回顾清单
print("=" * 60)
print("Week 7 知识回顾清单")
print("=" * 60)

for day, content in knowledge_checklist.items():
    print(f"\n{'='*50}")
    print(f" {day}")
    print(f"{'='*50}")
    
    for section, items in content.items():
        print(f"\n  {section}:")
        for item in items:
            print(f"    [ ] {item}")
```

**预期输出：**
```
============================================================
Week 7 知识回顾清单
============================================================

==================================================
 Day 1: 上下文工程
==================================================

  核心概念:
    [ ] Token 是 LLM 处理文本的基本单位
    [ ] 上下文窗口是 LLM 一次能处理的最大 Token 数
    [ ] Token 计算是管理上下文的基础

  技能:
    [ ] 能用 Token 计数器计算文本大小
    ...

==================================================
 Day 2: 记忆架构
==================================================
...
```

### 3.2 综合练习：带记忆的智能 Agent

```python
"""
综合练习：带记忆的智能 Agent
整合 Week 7 所学：上下文管理 + 记忆系统 + Persona + 错误处理
"""

from typing import List, Dict, Optional
from datetime import datetime
import json
import time


# ===== 1. 简化版记忆系统 =====
class SimpleMemorySystem:
    """简化版记忆系统"""
    
    def __init__(self):
        self.conversation = []
        self.user_info = {}
        self.knowledge = {
            "python": "Python 是一种解释型编程语言",
            "agent": "AI Agent 是能够自主决策的智能体",
        }
    
    def add_message(self, role: str, content: str):
        """添加消息"""
        self.conversation.append({"role": role, "content": content})
        if len(self.conversation) > 20:
            self.conversation = self.conversation[-20:]
    
    def search(self, query: str) -> List[str]:
        """搜索知识"""
        results = []
        for key, value in self.knowledge.items():
            if query.lower() in key or query.lower() in value.lower():
                results.append(value)
        return results
    
    def get_context(self) -> str:
        """获取对话上下文"""
        recent = self.conversation[-8:]
        parts = []
        for msg in recent:
            role = "用户" if msg["role"] == "user" else "助手"
            parts.append(f"{role}: {msg['content'][:50]}")
        return "\n".join(parts) if parts else "无对话历史"
    
    def update_user_info(self, key: str, value: str):
        """更新用户信息"""
        self.user_info[key] = value
    
    def get_user_info(self) -> str:
        """获取用户信息"""
        if not self.user_info:
            return "暂无用户信息"
        return json.dumps(self.user_info, ensure_ascii=False)


# ===== 2. Persona =====
class SimplePersona:
    """简化版 Persona"""
    
    def __init__(self, name: str = "小智"):
        self.name = name
        self.system_prompt = (
            f"你是{name}，一个友好、耐心的 AI 助手。"
            f"你善于用简洁清晰的中文回答问题。"
            f"你能记住用户的信息和之前的对话。"
        )


# ===== 3. 简化版 LLM =====
class SimpleLLM:
    """简化版 LLM"""
    
    def invoke(self, messages: List[Dict]) -> str:
        """模拟 LLM 调用"""
        user_input = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_input = msg.get("content", "")
                break
        
        # 根据关键词生成回复
        if "python" in user_input.lower():
            return "Python 是一种广泛使用的编程语言，语法简洁，库生态丰富。"
        elif "agent" in user_input.lower():
            return "AI Agent 是能够自主决策和执行任务的智能体。"
        elif "你好" in user_input:
            return "你好！很高兴见到你。有什么我可以帮助你的吗？"
        elif "我叫" in user_input:
            name = user_input.split("我叫")[-1].split("，")[0].split("。")[0][:10]
            return f"你好 {name}！很高兴认识你。"
        else:
            return f"收到你的问题。关于'{user_input[:20]}'，让我为你解答。"


# ===== 4. 完整 Agent =====
class SmartAgent:
    """带记忆的智能 Agent"""
    
    def __init__(self, name: str = "小智"):
        self.memory = SimpleMemorySystem()
        self.persona = SimplePersona(name)
        self.llm = SimpleLLM()
    
    def chat(self, user_input: str) -> Dict:
        """与用户对话"""
        start_time = time.time()
        
        try:
            # 1. 记录用户消息
            self.memory.add_message("user", user_input)
            
            # 2. 提取用户信息
            if "我叫" in user_input:
                name = user_input.split("我叫")[-1].split("，")[0].split("。")[0][:10]
                if name:
                    self.memory.update_user_info("name", name)
            
            # 3. 构建上下文
            context = self.memory.get_context()
            knowledge = self.memory.search(user_input)
            
            # 4. 构建消息
            messages = [
                {"role": "system", "content": self.persona.system_prompt},
                {"role": "system", "content": f"对话历史:\n{context}"},
            ]
            if knowledge:
                messages.append({"role": "system", "content": f"相关知识: {'; '.join(knowledge)}"})
            messages.append({"role": "user", "content": user_input})
            
            # 5. 调用 LLM
            response = self.llm.invoke(messages)
            
            # 6. 记录助手回复
            self.memory.add_message("assistant", response)
            
            response_time = time.time() - start_time
            
            return {
                "success": True,
                "response": response,
                "response_time": response_time
            }
        
        except Exception as e:
            response_time = time.time() - start_time
            return {
                "success": False,
                "response": "抱歉，处理过程中出现错误。请稍后重试。",
                "error": str(e),
                "response_time": response_time
            }
    
    def get_status(self) -> Dict:
        """获取 Agent 状态"""
        return {
            "conversation_length": len(self.memory.conversation),
            "user_info": self.memory.user_info,
            "knowledge_count": len(self.memory.knowledge)
        }


# ===== 运行综合练习 =====
print("\n" + "=" * 60)
print("综合练习：带记忆的智能 Agent")
print("=" * 60)

agent = SmartAgent("小智")

# 模拟多轮对话
test_conversations = [
    "你好！",
    "我叫张三",
    "什么是 Python？",
    "AI Agent 是什么？",
    "我之前说了什么？",
    "你能记住我的名字吗？",
]

for user_input in test_conversations:
    print(f"\n用户: {user_input}")
    result = agent.chat(user_input)
    print(f"小智: {result['response']}")
    print(f"[耗时: {result['response_time']:.3f}s]")

# 打印状态
print(f"\n--- Agent 状态 ---")
status = agent.get_status()
for key, value in status.items():
    print(f"  {key}: {value}")

# 打印对话历史
print(f"\n--- 对话历史 ---")
for msg in agent.memory.conversation:
    role = "用户" if msg["role"] == "user" else "助手"
    print(f"  {role}: {msg['content'][:60]}")
```

**预期输出：**
```
============================================================
综合练习：带记忆的智能 Agent
============================================================

用户: 你好！
小智: 你好！很高兴见到你。有什么我可以帮助你的吗？
[耗时: 0.001s]

用户: 我叫张三
小智: 你好 张三！很高兴认识你。
[耗时: 0.000s]

用户: 什么是 Python？
小智: Python 是一种广泛使用的编程语言，语法简洁，库生态丰富。
[耗时: 0.000s]

用户: AI Agent 是什么？
小智: AI Agent 是能够自主决策和执行任务的智能体。
[耗时: 0.000s]

用户: 我之前说了什么？
小智: 收到你的问题。关于'我之前说了什么'，让我为你解答。
[耗时: 0.000s]

用户: 你能记住我的名字吗？
小智: 收到你的问题。关于'你能记住我的名字吗'，让我为你解答。
[耗时: 0.000s]

--- Agent 状态 ---
  conversation_length: 12
  user_info: {'name': '张三'}
  knowledge_count: 2

--- 对话历史 ---
  用户: 你好！
  助手: 你好！很高兴见到你。有什么我可以帮助你的吗？
  用户: 我叫张三
  助手: 你好 张三！很高兴认识你。
  ...
```

### 3.3 自我评估测试

```python
"""
Week 7 自我评估测试
"""

quiz = [
    {
        "question": "1. Token 是什么？",
        "options": [
            "A. LLM 的一种模型",
            "B. LLM 处理文本的基本单位",
            "C. 一种编程语言",
            "D. 数据库的一种"
        ],
        "answer": "B"
    },
    {
        "question": "2. 滑动窗口策略的特点是？",
        "options": [
            "A. 保留所有历史消息",
            "B. 保留最近 N 条消息，丢弃旧消息",
            "C. 只保留用户消息",
            "D. 使用向量搜索"
        ],
        "answer": "B"
    },
    {
        "question": "3. MemGPT 的三层记忆模型包括？",
        "options": [
            "A. 短期/中期/长期记忆",
            "B. Core/Archival/Recall Memory",
            "C. 工作/情景/语义记忆",
            "D. 输入/处理/输出记忆"
        ],
        "answer": "B"
    },
    {
        "question": "4. 指数退避重试的特点是？",
        "options": [
            "A. 每次重试间隔相同",
            "B. 每次重试间隔翻倍",
            "C. 间隔随机",
            "D. 间隔递减"
        ],
        "answer": "B"
    },
    {
        "question": "5. 优雅降级的目的是？",
        "options": [
            "A. 提高系统性能",
            "B. 减少代码量",
            "C. 系统故障时仍能提供基本服务",
            "D. 增加系统功能"
        ],
        "answer": "C"
    }
]

print("\n" + "=" * 60)
print("Week 7 自我评估测试")
print("=" * 60)

for q in quiz:
    print(f"\n{q['question']}")
    for option in q["options"]:
        print(f"  {option}")

print("\n" + "=" * 60)
print("参考答案")
print("=" * 60)

for q in quiz:
    print(f"\n{q['question']}")
    print(f"  答案: {q['answer']}")
```

**预期输出：**
```
============================================================
Week 7 自我评估测试
============================================================

1. Token 是什么？
  A. LLM 的一种模型
  B. LLM 处理文本的基本单位
  C. 一种编程语言
  D. 数据库的一种

2. 滑动窗口策略的特点是？
  A. 保留所有历史消息
  B. 保留最近 N 条消息，丢弃旧消息
  ...

============================================================
参考答案
============================================================

1. Token 是什么？
  答案: B

2. 滑动窗口策略的特点是？
  答案: B
...
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 记忆系统占用内存高 | 设置容量上限，定期清理过期数据 |
| 2 | 检索结果不相关 | 改进搜索算法，添加更多索引 |
| 3 | Agent 行为不一致 | 检查 Persona 配置和 System Prompt |
| 4 | 工作流报错 | 逐步调试，确保每个节点正常 |
| 5 | 降级策略未触发 | 检查错误分类是否正确 |

## 📖 Week 7 核心概念速查

| 概念 | 一句话解释 |
|------|-----------|
| Token | LLM 处理文本的基本单位 |
| 上下文窗口 | LLM 能处理的最大 Token 数量 |
| 滑动窗口 | 保留最近 N 条对话的简单策略 |
| 摘要压缩 | 用 LLM 将长对话压缩为简短摘要 |
| 工作记忆 | 当前任务的短期上下文 |
| 情景记忆 | 带时间戳的事件记录 |
| 语义记忆 | 事实和知识的键值存储 |
| 程序记忆 | 可执行的技能注册表 |
| Core Memory | MemGPT 核心记忆，始终加载 |
| Archival Memory | MemGPT 档案记忆，长期存储 |
| Recall Memory | MemGPT 回忆记忆，最近对话 |
| Agent Persona | Agent 的角色设定和行为约束 |
| System Prompt | 定义 Agent 核心行为的系统提示词 |
| 指数退避 | 每次重试等待时间翻倍的策略 |
| 优雅降级 | 系统故障时仍能提供基本服务 |

## ✅ 验收清单
- [ ] 能完成知识回顾清单中的所有项目
- [ ] 综合练习代码能正常运行
- [ ] 能说出 Week 7 每天的核心知识点
- [ ] 能正确回答自我评估测试的大部分问题
- [ ] 理解记忆系统各组件的关系和数据流
- [ ] 对 Week 8 的内容有基本了解

## 📝 复盘小纸条
- 本周最大的收获: _______________________
- 还不太确定的: _________________________
- 下周学习重点: _________________________

## 📥 明日同步接口
- 本周完成度: [ ] 100%  [ ] 80%  [ ] 60%  [ ] 其他___
- 主要卡点: _________________________
- 代码仓库状态: [ ] 完整  [ ] 部分  [ ] 需要整理
- 下周期望: _________________________

## 🎉 Week 7 完成

恭喜你完成了 Week 7 的学习！你已经掌握了:

1. **上下文工程**: Token 计算、滑动窗口、摘要压缩
2. **记忆架构**: 四种记忆类型、MemGPT 三层模型
3. **记忆实现**: 完整的 MemoryManager
4. **Agent Persona**: 角色设计、System Prompt、一致性检查
5. **LangGraph 整合**: 完整工作流设计和实现
6. **错误处理**: 重试、降级、监控告警

### 下周预告

Week 8 将学习:
- MCP（Model Context Protocol）
- A2A + NLWeb 协议
- 多 Agent 架构设计
- Handoff 模式
- CrewAI

继续加油！
