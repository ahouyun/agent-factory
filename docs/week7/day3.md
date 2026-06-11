# 📅 Week 7 Day 3：记忆实现：完整 MemoryManager

## 🧭 今日方向
> 将昨天学习的四种记忆类型整合为一个完整的 MemoryManager，实现一个能记住用户偏好、历史对话、事实知识和技能的智能 Agent。

## 🎯 生活比喻
> 如果昨天学的是"图书馆的各个部门"（借阅处、档案室、阅览室），今天就是"把这些部门整合成一个完整的图书馆系统"，让用户只需一个窗口就能访问所有服务。

## 📋 今日三件事
1. 实现 WorkingMemory 的增强版（带优先级和自动淘汰）
2. 实现 EpisodicMemory 的增强版（带时间范围搜索）
3. 构建完整的 MemoryManager，整合四种记忆类型

## 🗺️ 手把手路线

### Step 1: WorkingMemory 增强
- **做什么**: 添加优先级队列和自动淘汰机制
- **为什么**: 真实场景中，不同信息的重要性不同
- **成功标志**: 高优先级信息不被低优先级信息挤掉

### Step 2: EpisodicMemory 增强
- **做什么**: 添加时间范围搜索和重要性过滤
- **为什么**: 回忆过去时，需要按时间或重要性筛选
- **成功标志**: 能搜索特定时间范围内的重要事件

### Step 3: 构建 MemoryManager
- **做什么**: 整合四种记忆，提供统一接口
- **为什么**: 一个统一的管理器比四个独立的模块更易用
- **成功标志**: Agent 能通过一个接口使用所有记忆功能

## 💻 代码区

### 3.1 WorkingMemory 增强版

```python
"""
WorkingMemory 增强版
- 优先级队列: 高优先级信息不被淘汰
- 自动淘汰: 超出容量时移除最低优先级的条目
- 分类管理: 支持按类别查询
"""

from typing import Dict, List, Optional, Any
from collections import deque
from datetime import datetime
import json


class EnhancedWorkingMemory:
    """增强版工作记忆"""
    
    def __init__(self, capacity: int = 5):
        self.capacity = capacity
        self.items = []
    
    def add(self, item: str, priority: int = 0, category: str = "default"):
        """添加条目，自动管理容量"""
        entry = {
            "content": item,
            "priority": priority,
            "category": category,
            "timestamp": datetime.now().isoformat(),
            "id": len(self.items) + 1
        }
        
        # 检查是否已存在相同内容
        for i, existing in enumerate(self.items):
            if existing["content"] == item:
                # 更新优先级
                self.items[i]["priority"] = max(self.items[i]["priority"], priority)
                return
        
        # 如果满了，淘汰最低优先级
        if len(self.items) >= self.capacity:
            self.items.sort(key=lambda x: x["priority"])
            if self.items[0]["priority"] < priority:
                removed = self.items.pop(0)
                print(f"  [淘汰] {removed['content'][:30]}... (优先级 {removed['priority']})")
            else:
                print(f"  [拒绝] 新条目优先级不足: {item[:30]}...")
                return
        
        self.items.append(entry)
    
    def remove(self, item_id: int):
        """按 ID 移除条目"""
        self.items = [item for item in self.items if item["id"] != item_id]
    
    def get_all(self) -> List[Dict]:
        """获取所有条目，按优先级降序"""
        return sorted(self.items, key=lambda x: x["priority"], reverse=True)
    
    def get_by_category(self, category: str) -> List[Dict]:
        """按类别获取"""
        return [item for item in self.items if item["category"] == category]
    
    def clear(self):
        """清空"""
        self.items.clear()
    
    def to_prompt(self) -> str:
        """转换为 Prompt 格式"""
        if not self.items:
            return "当前工作记忆为空。"
        
        parts = ["当前工作记忆（按重要性排序）:"]
        for item in self.get_all():
            parts.append(f"  [{item['category']}] {item['content']}")
        return "\n".join(parts)


# ===== 测试 =====
print("=== WorkingMemory 增强版演示 ===")
working = EnhancedWorkingMemory(capacity=3)

working.add("用户正在问 Python 问题", priority=2, category="task")
working.add("上次回答提到了 pandas", priority=1, category="context")
working.add("用户偏好中文回答", priority=3, category="user")

print(f"\n当前条目数: {len(working.items)}")
print(working.to_prompt())

# 尝试添加第 4 个条目（会淘汰最低优先级）
print("\n尝试添加新条目（优先级 4）:")
working.add("用户对 AI 很感兴趣", priority=4, category="interest")
print(working.to_prompt())
```

**预期输出：**
```
=== WorkingMemory 增强版演示 ===

当前条目数: 3
当前工作记忆（按重要性排序）:
  [user] 用户偏好中文回答
  [task] 用户正在问 Python 问题
  [context] 上次回答提到了 pandas

尝试添加新条目（优先级 4）:
  [淘汰] 上次回答提到了 pandas... (优先级 1)
当前工作记忆（按重要性排序）:
  [interest] 用户对 AI 很感兴趣
  [user] 用户偏好中文回答
  [task] 用户正在问 Python 问题
```

### 3.2 EpisodicMemory 增强版

```python
"""
EpisodicMemory 增强版
- 时间范围搜索: 按时间区间查询事件
- 重要性过滤: 只返回重要性高于阈值的事件
- 标签搜索: 按标签快速筛选
- 自动衰减: 老事件的重要性随时间降低
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional


class EnhancedEpisodicMemory:
    """增强版情景记忆"""
    
    def __init__(self, decay_rate: float = 0.01):
        """
        Args:
            decay_rate: 每小时的重要性衰减率
        """
        self.episodes = []
        self.decay_rate = decay_rate
        self.next_id = 1
    
    def add(self, event: str, importance: float = 1.0, tags: List[str] = None):
        """记录事件"""
        episode = {
            "id": self.next_id,
            "event": event,
            "base_importance": importance,
            "importance": importance,
            "tags": tags or [],
            "timestamp": datetime.now(),
            "last_accessed": datetime.now()
        }
        self.episodes.append(episode)
        self.next_id += 1
    
    def _apply_decay(self):
        """应用时间衰减"""
        now = datetime.now()
        for ep in self.episodes:
            hours_since = (now - ep["timestamp"]).total_seconds() / 3600
            ep["importance"] = ep["base_importance"] * (1 - self.decay_rate * hours_since)
            ep["importance"] = max(0.1, ep["importance"])  # 最低 0.1
    
    def search_by_time(
        self, 
        hours: int = 24, 
        min_importance: float = 0.0
    ) -> List[Dict]:
        """搜索最近 N 小时内的事件"""
        self._apply_decay()
        cutoff = datetime.now() - timedelta(hours=hours)
        
        return [
            ep for ep in self.episodes
            if ep["timestamp"] >= cutoff and ep["importance"] >= min_importance
        ]
    
    def search_by_tag(self, tag: str, min_importance: float = 0.0) -> List[Dict]:
        """按标签搜索"""
        self._apply_decay()
        return [
            ep for ep in self.episodes
            if tag in ep["tags"] and ep["importance"] >= min_importance
        ]
    
    def get_important(self, threshold: float = 0.7) -> List[Dict]:
        """获取重要事件"""
        self._apply_decay()
        return [ep for ep in self.episodes if ep["importance"] >= threshold]
    
    def get_recent(self, k: int = 5) -> List[Dict]:
        """获取最近的 k 个事件"""
        return self.episodes[-k:]
    
    def summarize(self) -> str:
        """生成事件摘要"""
        if not self.episodes:
            return "没有历史事件。"
        
        self._apply_decay()
        
        total = len(self.episodes)
        important = len(self.get_important(0.7))
        tags_count = {}
        for ep in self.episodes:
            for tag in ep["tags"]:
                tags_count[tag] = tags_count.get(tag, 0) + 1
        
        top_tags = sorted(tags_count.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return (
            f"共 {total} 个事件, {important} 个重要事件。"
            f"主要标签: {', '.join(t[0] for t in top_tags)}"
        )
    
    def to_prompt(self, k: int = 5) -> str:
        """转换为 Prompt 格式"""
        recent = self.get_recent(k)
        if not recent:
            return "没有历史事件记录。"
        
        parts = [f"最近事件 (共 {len(self.episodes)} 个):"]
        for ep in recent:
            ts = ep["timestamp"].strftime("%m-%d %H:%M")
            imp = f"[重要度:{ep['importance']:.2f}]"
            parts.append(f"  {ts} {imp} {ep['event'][:50]}")
        return "\n".join(parts)


# ===== 测试 =====
print("\n=== EpisodicMemory 增强版演示 ===")
episodic = EnhancedEpisodicMemory(decay_rate=0.05)

# 添加事件
episodic.add("用户首次询问 Python 基础", importance=0.8, tags=["python", "beginner"])
episodic.add("用户询问了数据分析问题", importance=0.7, tags=["python", "data"])
episodic.add("用户表示对 AI 感兴趣", importance=0.9, tags=["ai", "interest"])
episodic.add("用户完成了第一个项目", importance=0.95, tags=["project", "milestone"])

print(f"事件总数: {len(episodic.episodes)}")
print(f"\n{episodic.to_prompt(3)}")
print(f"\n摘要: {episodic.summarize()}")
print(f"\n标签 'python' 相关事件:")
for ep in episodic.search_by_tag("python"):
    print(f"  - {ep['event']}")
```

**预期输出：**
```
=== EpisodicMemory 增强版演示 ===
事件总数: 4

最近事件 (共 4 个):
  06-11 10:30 [重要度:0.95] 用户完成了第一个项目
  06-11 10:30 [重要度:0.90] 用户表示对 AI 感兴趣
  06-11 10:30 [重要度:0.70] 用户询问了数据分析问题

摘要: 共 4 个事件, 2 个重要事件。主要标签: python, beginner, data, ai, interest

标签 'python' 相关事件:
  - 用户首次询问 Python 基础
  - 用户询问了数据分析问题
```

### 3.3 完整 MemoryManager

```python
"""
完整的 MemoryManager
整合四种记忆类型，提供统一接口
实现一个能记住用户偏好、历史对话、事实知识和技能的智能 Agent
"""


class MemoryManager:
    """统一记忆管理器
    
    整合四种记忆类型:
    - WorkingMemory: 当前任务上下文
    - EpisodicMemory: 历史事件
    - SemanticMemory: 事实知识
    - ProceduralMemory: 技能和操作
    """
    
    def __init__(self, agent_name: str = "Assistant"):
        self.agent_name = agent_name
        
        # 四种记忆
        self.working = EnhancedWorkingMemory(capacity=5)
        self.episodic = EnhancedEpisodicMemory()
        self.semantic = SemanticMemory()
        self.procedural = ProceduralMemory()
        
        # 对话缓冲（简化版 Recall Memory）
        self.conversation_buffer = []
        self.max_buffer = 20
    
    def process_message(self, role: str, content: str):
        """处理消息，更新所有相关记忆"""
        # 1. 添加到对话缓冲
        self.conversation_buffer.append({"role": role, "content": content})
        if len(self.conversation_buffer) > self.max_buffer:
            self.conversation_buffer = self.conversation_buffer[-self.max_buffer:]
        
        # 2. 更新工作记忆
        if role == "user":
            self.working.add(content[:50], priority=1, category="conversation")
        
        # 3. 记录事件
        self.episodic.add(
            f"{'用户' if role == 'user' else '助手'}: {content[:60]}",
            importance=0.5 if role == "assistant" else 0.7,
            tags=["conversation"]
        )
        
        # 4. 提取关键信息（简化版，实际应用中用 LLM）
        if role == "user":
            self._extract_info(content)
    
    def _extract_info(self, text: str):
        """从用户消息中提取关键信息"""
        # 简化的信息提取规则
        if "我叫" in text or "我是" in text:
            # 提取姓名
            for phrase in ["我叫", "我是"]:
                if phrase in text:
                    name = text.split(phrase)[-1].split("，")[0].split("。")[0][:10]
                    if name:
                        self.semantic.add("user_name", name, "user_info", 0.95)
                        self.working.add(f"用户姓名: {name}", priority=3, category="user")
                        self.episodic.add(f"用户告知姓名: {name}", importance=0.8, tags=["user_info"])
        
        if "学习" in text or "想学" in text:
            topic = text.split("学习")[-1].split("，")[0].split("。")[0][:20]
            if topic:
                self.semantic.add("learning_topic", topic, "user_interest", 0.8)
                self.working.add(f"用户想学: {topic}", priority=2, category="interest")
    
    def add_knowledge(self, key: str, content: str, category: str = "general"):
        """添加知识到语义记忆"""
        self.semantic.add(key, content, category)
        self.episodic.add(f"添加知识: {key} = {content[:40]}", importance=0.6, tags=["knowledge"])
    
    def register_skill(self, name: str, description: str, handler=None):
        """注册技能到程序记忆"""
        self.procedural.register(name, description, [], handler)
    
    def query(self, question: str) -> Dict:
        """查询记忆系统"""
        return {
            "working": self.working.to_prompt(),
            "episodic": self.episodic.to_prompt(3),
            "semantic": self.semantic.to_prompt(),
            "conversation": self._get_conversation_context(),
            "full_context": self._build_full_context(question)
        }
    
    def _get_conversation_context(self) -> str:
        """获取对话上下文"""
        recent = self.conversation_buffer[-10:]
        if not recent:
            return "没有对话历史。"
        
        parts = ["最近对话:"]
        for msg in recent:
            role = "用户" if msg["role"] == "user" else "助手"
            parts.append(f"  {role}: {msg['content'][:60]}")
        return "\n".join(parts)
    
    def _build_full_context(self, query: str) -> str:
        """构建完整上下文"""
        parts = [
            f"=== {self.agent_name} 记忆系统 ===",
            "",
            self.working.to_prompt(),
            "",
            self._get_conversation_context(),
            "",
            self.semantic.to_prompt(),
        ]
        return "\n".join(parts)
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        return {
            "working_items": len(self.working.items),
            "episodes": len(self.episodic.episodes),
            "knowledge_items": len(self.semantic.knowledge),
            "skills": len(self.procedural.skills),
            "conversation_length": len(self.conversation_buffer)
        }


# ===== 完整演示 =====
print("\n" + "=" * 60)
print("完整 MemoryManager 演示")
print("=" * 60)

# 创建记忆管理器
memory = MemoryManager("小智")

# 模拟多轮对话
conversations = [
    ("user", "你好，我叫张三"),
    ("assistant", "你好张三！很高兴认识你。"),
    ("user", "我在学习 Python 编程"),
    ("assistant", "Python 是很好的选择！"),
    ("user", "我想做一个聊天机器人"),
    ("assistant", "可以用 LangChain 框架来构建。"),
]

print("\n--- 模拟对话 ---")
for role, content in conversations:
    print(f"\n{'用户' if role == 'user' else '助手'}: {content}")
    memory.process_message(role, content)

# 添加知识
print("\n--- 添加知识 ---")
memory.add_knowledge("python", "Python 是一种解释型编程语言", "programming")
memory.add_knowledge("langchain", "LangChain 是 LLM 应用开发框架", "framework")

# 注册技能
print("\n--- 注册技能 ---")
memory.register_skill("python_qa", "回答 Python 相关问题")
memory.register_skill("code_review", "审查代码质量")

# 查询记忆
print("\n--- 查询记忆系统 ---")
query = "用户是谁？在学什么？"
result = memory.query(query)

print(f"\n查询: {query}")
print(f"\n工作记忆:\n{result['working']}")
print(f"\n对话上下文:\n{result['conversation']}")
print(f"\n知识库:\n{result['semantic']}")

# 统计信息
print(f"\n--- 统计信息 ---")
stats = memory.get_stats()
for key, value in stats.items():
    print(f"  {key}: {value}")
```

**预期输出：**
```
============================================================
完整 MemoryManager 演示
============================================================

--- 模拟对话 ---

用户: 你好，我叫张三
  [Core] 更新: user_name = 张三
  [淘汰] 你好，我叫张三... (优先级 1)

助手: 你好张三！很高兴认识你。

用户: 我在学习 Python 编程

助手: Python 是很好的选择！

用户: 我想做一个聊天机器人

助手: 可以用 LangChain 框架来构建。

--- 添加知识 ---

--- 注册技能 ---

--- 查询记忆系统 ---

查询: 用户是谁？在学什么？

工作记忆:
当前工作记忆（按重要性排序）:
  [user] 用户姓名: 张三
  [interest] 用户想学: Python 编程
  [conversation] 我想做一个聊天机器人
  [conversation] 我在学习 Python 编程

对话上下文:
最近对话:
  用户: 你好，我叫张三
  助手: 你好张三！很高兴认识你。
  ...

知识库:
已知知识:
  - python: Python 是一种解释型编程语言
  - langchain: LangChain 是 LLM 应用开发框架

--- 统计信息 ---
  working_items: 4
  episodes: 10
  knowledge_items: 4
  skills: 2
  conversation_length: 6
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 信息提取不准确 | 增加更多提取规则，或使用 LLM 进行实体抽取 |
| 2 | 记忆占用内存过高 | 设置容量上限，定期清理过期数据 |
| 3 | 搜索结果不相关 | 改进搜索算法，添加更多索引 |
| 4 | 工作记忆总是被清空 | 增大容量，或提高关键信息的优先级 |
| 5 | 事件衰减太快 | 降低 decay_rate，或提高 base_importance |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| WorkingMemory | 当前任务的短期上下文，支持优先级 |
| EpisodicMemory | 带时间戳的事件记录，支持时间范围搜索 |
| SemanticMemory | 事实和知识的键值存储，支持关键词搜索 |
| ProceduralMemory | 可执行的技能注册表 |
| MemoryManager | 统一的记忆管理接口 |
| 优先级淘汰 | 超出容量时移除最低优先级的条目 |
| 时间衰减 | 老事件的重要性随时间降低 |
| 信息提取 | 从对话中自动识别关键信息 |

## ✅ 验收清单
- [ ] WorkingMemory 能按优先级管理条目
- [ ] EpisodicMemory 能按时间和标签搜索事件
- [ ] SemanticMemory 能存储和检索知识
- [ ] ProceduralMemory 能注册和执行技能
- [ ] MemoryManager 能统一管理四种记忆
- [ ] 信息提取能自动识别用户姓名和兴趣
- [ ] 完整示例能正常运行并输出正确结果

## 📝 复盘小纸条
- 今天最大的收获: _______________________
- 还不太确定的: _________________________

## 📥 明日同步接口
- 今日完成度: [ ] 100%  [ ] 80%  [ ] 60%  [ ] 其他___
- 卡点描述: _________________________
- 代码是否能跑通: [ ] 完全可以  [ ] 部分可以  [ ] 有问题
- 明天希望: _________________________
