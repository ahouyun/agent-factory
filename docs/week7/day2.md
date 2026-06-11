# 📅 Week 7 Day 2：记忆架构：四层记忆 + MemGPT 三层模型

## 🧭 今日方向
> 让 Agent 拥有"记忆"：从认知科学的四种记忆类型到 MemGPT 的三层架构，理解如何设计一个完整的记忆系统。

## 🎯 生活比喻
> 人的记忆就像一个多层仓库：
> - **工作记忆** = 你的工作台，只能同时处理几件事
> - **情景记忆** = 相册，记录"那天发生了什么"
> - **语义记忆** = 百科全书，存储知识和事实
> - **程序记忆** = 肌肉记忆，"知道怎么做"某件事

## 📋 今日三件事
1. 理解认知科学的四种记忆类型及其在 Agent 中的对应实现
2. 理解 MemGPT 的三层记忆模型（Core/Archival/Recall）
3. 实现每种记忆类型的代码，并理解它们的区别和联系

## 🗺️ 手把手路线

### Step 1: 四种记忆类型
- **做什么**: 学习工作记忆、情景记忆、语义记忆、程序记忆的定义和区别
- **为什么**: 这是记忆系统的理论基础，理解了才能正确设计
- **成功标志**: 能说出四种记忆的区别，并类比到 Agent 实现

### Step 2: MemGPT 三层模型
- **做什么**: 学习 Core Memory、Archival Memory、Recall Memory 的设计
- **为什么**: 这是实际工程中最常用的记忆架构
- **成功标志**: 能画出三层记忆的架构图和数据流

### Step 3: 实现每种记忆类型
- **做什么**: 用 Python 实现四种记忆类型和 MemGPT 三层模型
- **为什么**: 理论结合实践，加深理解
- **成功标志**: 每种记忆类型的代码能独立运行

## 💻 代码区

### 3.1 认知科学四种记忆类型

```python
"""
四种记忆类型实现
基于认知科学理论，对应 Agent 中的记忆机制
"""

import json
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from collections import deque


# ===== 1. 工作记忆 (Working Memory) =====
class WorkingMemory:
    """
    工作记忆: 当前任务的短期上下文
    类比: 人的工作台，同时处理的信息
    实现: 固定大小的队列，支持优先级
    """
    
    def __init__(self, capacity: int = 5):
        """
        Args:
            capacity: 最大容量（能同时"记住"几件事）
        """
        self.capacity = capacity
        self.items = deque(maxlen=capacity)
        self.metadata = {}  # 附加信息
    
    def add(self, item: str, priority: int = 0, category: str = "default"):
        """添加项目到工作记忆"""
        entry = {
            "content": item,
            "priority": priority,
            "category": category,
            "timestamp": datetime.now().isoformat()
        }
        
        # 如果满了，移除优先级最低的
        if len(self.items) >= self.capacity:
            # 按优先级排序，移除最低的
            sorted_items = sorted(self.items, key=lambda x: x["priority"])
            if sorted_items[0]["priority"] < priority:
                self.items.remove(sorted_items[0])
            else:
                return  # 新项目优先级不够，不添加
        
        self.items.append(entry)
    
    def get_all(self) -> List[Dict]:
        """获取所有工作记忆"""
        return list(self.items)
    
    def get_by_category(self, category: str) -> List[Dict]:
        """按类别获取"""
        return [item for item in self.items if item["category"] == category]
    
    def clear(self):
        """清空工作记忆"""
        self.items.clear()
    
    def to_prompt(self) -> str:
        """转换为 Prompt 格式"""
        if not self.items:
            return "当前没有工作记忆。"
        
        parts = ["当前工作记忆:"]
        for item in sorted(self.items, key=lambda x: x["priority"], reverse=True):
            parts.append(f"- [{item['category']}] {item['content']}")
        return "\n".join(parts)


# ===== 2. 情景记忆 (Episodic Memory) =====
class EpisodicMemory:
    """
    情景记忆: 过去的经历和事件
    类比: 相册，记录"那天发生了什么"
    实现: 带时间戳的事件存储，支持时间范围搜索
    """
    
    def __init__(self):
        self.episodes = []
    
    def add(self, event: str, importance: float = 1.0, tags: List[str] = None):
        """记录一个事件"""
        episode = {
            "id": len(self.episodes) + 1,
            "event": event,
            "importance": importance,
            "tags": tags or [],
            "timestamp": datetime.now(),
            "access_count": 0
        }
        self.episodes.append(episode)
    
    def search_by_time(self, start: datetime = None, end: datetime = None) -> List[Dict]:
        """按时间范围搜索"""
        results = []
        for ep in self.episodes:
            ts = ep["timestamp"]
            if start and ts < start:
                continue
            if end and ts > end:
                continue
            results.append(ep)
        return results
    
    def search_by_tag(self, tag: str) -> List[Dict]:
        """按标签搜索"""
        return [ep for ep in self.episodes if tag in ep["tags"]]
    
    def get_recent(self, k: int = 5) -> List[Dict]:
        """获取最近的 k 个事件"""
        return self.episodes[-k:]
    
    def get_important(self, threshold: float = 0.7) -> List[Dict]:
        """获取重要事件"""
        return [ep for ep in self.episodes if ep["importance"] >= threshold]
    
    def to_prompt(self) -> str:
        """转换为 Prompt 格式"""
        if not self.episodes:
            return "没有历史事件记录。"
        
        parts = ["历史事件记录:"]
        for ep in self.get_recent(5):
            ts = ep["timestamp"].strftime("%m-%d %H:%M")
            parts.append(f"  [{ts}] {ep['event'][:60]}")
        return "\n".join(parts)


# ===== 3. 语义记忆 (Semantic Memory) =====
class SemanticMemory:
    """
    语义记忆: 事实和知识
    类比: 百科全书，存储"Python 是编程语言"这样的知识
    实现: 键值存储 + 简单的语义搜索
    """
    
    def __init__(self):
        self.knowledge = {}  # key -> {content, category, confidence, timestamp}
    
    def add(self, key: str, content: str, category: str = "general", confidence: float = 1.0):
        """添加知识"""
        self.knowledge[key] = {
            "content": content,
            "category": category,
            "confidence": confidence,
            "timestamp": datetime.now(),
            "access_count": 0
        }
    
    def get(self, key: str) -> Optional[Dict]:
        """获取知识"""
        if key in self.knowledge:
            self.knowledge[key]["access_count"] += 1
            return self.knowledge[key]
        return None
    
    def search(self, query: str) -> List[Dict]:
        """简单关键词搜索"""
        results = []
        query_lower = query.lower()
        
        for key, data in self.knowledge.items():
            # 搜索 key 和 content
            if (query_lower in key.lower() or 
                query_lower in data["content"].lower()):
                results.append({"key": key, **data})
        
        return results
    
    def get_by_category(self, category: str) -> List[Dict]:
        """按类别获取"""
        return [
            {"key": k, **v} 
            for k, v in self.knowledge.items() 
            if v["category"] == category
        ]
    
    def to_prompt(self) -> str:
        """转换为 Prompt 格式"""
        if not self.knowledge:
            return "没有已存储的知识。"
        
        parts = ["已知知识:"]
        for key, data in list(self.knowledge.items())[:10]:
            parts.append(f"  - {key}: {data['content'][:60]}")
        return "\n".join(parts)


# ===== 4. 程序记忆 (Procedural Memory) =====
class ProceduralMemory:
    """
    程序记忆: 技能和操作流程
    类比: 肌肉记忆，"知道怎么做"某件事
    实现: 技能注册表，存储可执行的操作
    """
    
    def __init__(self):
        self.skills = {}  # skill_name -> {description, steps, handler}
    
    def register(self, name: str, description: str, steps: List[str], handler=None):
        """注册一个技能"""
        self.skills[name] = {
            "description": description,
            "steps": steps,
            "handler": handler,
            "usage_count": 0,
            "last_used": None
        }
    
    def execute(self, name: str, **kwargs) -> str:
        """执行一个技能"""
        if name not in self.skills:
            return f"技能 '{name}' 不存在"
        
        skill = self.skills[name]
        skill["usage_count"] += 1
        skill["last_used"] = datetime.now()
        
        if skill["handler"]:
            try:
                return skill["handler"](**kwargs)
            except Exception as e:
                return f"执行出错: {str(e)}"
        
        return f"技能 '{name}' 执行完成（无处理器）"
    
    def list_skills(self) -> List[Dict]:
        """列出所有技能"""
        return [
            {"name": name, "description": data["description"], "usage": data["usage_count"]}
            for name, data in self.skills.items()
        ]
    
    def to_prompt(self) -> str:
        """转换为 Prompt 格式"""
        if not self.skills:
            return "没有已注册的技能。"
        
        parts = ["已掌握的技能:"]
        for name, data in self.skills.items():
            parts.append(f"  - {name}: {data['description']}")
        return "\n".join(parts)


# ===== 测试四种记忆类型 =====
print("=" * 60)
print("四种记忆类型演示")
print("=" * 60)

# 工作记忆
print("\n--- 工作记忆 ---")
working = WorkingMemory(capacity=3)
working.add("用户正在问 Python 问题", priority=2, category="task")
working.add("上次回答提到了 pandas", priority=1, category="context")
working.add("用户偏好中文回答", priority=3, category="user")
print(working.to_prompt())

# 情景记忆
print("\n--- 情景记忆 ---")
episodic = EpisodicMemory()
episodic.add("用户首次询问 Python 基础", importance=0.8, tags=["python", "beginner"])
episodic.add("用户询问了数据分析相关问题", importance=0.7, tags=["python", "data"])
episodic.add("用户表示对 AI 感兴趣", importance=0.9, tags=["ai", "interest"])
print(episodic.to_prompt())

# 语义记忆
print("\n--- 语义记忆 ---")
semantic = SemanticMemory()
semantic.add("python", "Python 是一种解释型编程语言", "programming", 0.95)
semantic.add("pandas", "pandas 是 Python 的数据分析库", "library", 0.9)
semantic.add("langchain", "LangChain 是 LLM 应用开发框架", "framework", 0.85)
print(semantic.to_prompt())

# 程序记忆
print("\n--- 程序记忆 ---")
procedural = ProceduralMemory()
procedural.register(
    "python_qa",
    "回答 Python 相关问题",
    ["理解问题", "检索知识", "组织回答", "检查准确性"],
    handler=lambda **kw: f"已回答关于 {kw.get('topic', 'Python')} 的问题"
)
procedural.register(
    "code_review",
    "审查代码质量",
    ["检查语法", "检查逻辑", "检查性能", "给出建议"]
)
print(procedural.to_prompt())
```

**预期输出：**
```
============================================================
四种记忆类型演示
============================================================

--- 工作记忆 ---
当前工作记忆:
  - [user] 用户偏好中文回答
  - [task] 用户正在问 Python 问题
  - [context] 上次回答提到了 pandas

--- 情景记忆 ---
历史事件记录:
  [06-11 10:30] 用户首次询问 Python 基础
  [06-11 10:30] 用户询问了数据分析相关问题
  [06-11 10:30] 用户表示对 AI 感兴趣

--- 语义记忆 ---
已知知识:
  - python: Python 是一种解释型编程语言
  - pandas: pandas 是 Python 的数据分析库
  - langchain: LangChain 是 LLM 应用开发框架

--- 程序记忆 ---
已掌握的技能:
  - python_qa: 回答 Python 相关问题
  - code_review: 审查代码质量
```

### 3.2 MemGPT 三层记忆模型

```python
"""
MemGPT 三层记忆模型实现
Core Memory / Archival Memory / Recall Memory
"""


class CoreMemory:
    """
    核心记忆: Agent 的身份和关键信息
    类比: 你的性格和价值观，始终影响你的行为
    特点: 小容量，始终加载到上下文
    """
    
    def __init__(self, agent_name: str = "Assistant"):
        self.agent_name = agent_name
        self.data = {
            "persona": f"我是 {agent_name}，一个 helpful 的助手。",
            "user_profile": {},
            "preferences": {},
            "key_facts": {}
        }
        self.last_updated = datetime.now()
    
    def update(self, category: str, key: str, value: str):
        """更新核心记忆"""
        if category in self.data:
            self.data[category][key] = value
            self.last_updated = datetime.now()
            print(f"  [Core] 更新: {category}.{key} = {value}")
    
    def get(self, category: str = None, key: str = None) -> str:
        """获取核心记忆"""
        if category and key:
            return self.data.get(category, {}).get(key, "")
        elif category:
            return json.dumps(self.data.get(category, {}), ensure_ascii=False)
        else:
            return json.dumps(self.data, ensure_ascii=False)
    
    def to_prompt(self) -> str:
        """转换为 Prompt 格式"""
        parts = [f"Agent: {self.agent_name}"]
        if self.data["user_profile"]:
            parts.append(f"用户信息: {json.dumps(self.data['user_profile'], ensure_ascii=False)}")
        if self.data["preferences"]:
            parts.append(f"偏好: {json.dumps(self.data['preferences'], ensure_ascii=False)}")
        if self.data["key_facts"]:
            parts.append(f"关键事实: {json.dumps(self.data['key_facts'], ensure_ascii=False)}")
        return "\n".join(parts)


class ArchivalMemory:
    """
    档案记忆: 长期知识存储
    类比: 你的知识库，需要时可以查阅
    特点: 大容量，按需检索
    """
    
    def __init__(self):
        self.entries = []
        self.index = {}  # 简单的关键词索引
    
    def add(self, content: str, metadata: dict = None):
        """添加记忆"""
        entry_id = len(self.entries) + 1
        entry = {
            "id": entry_id,
            "content": content,
            "metadata": metadata or {},
            "timestamp": datetime.now(),
            "access_count": 0
        }
        self.entries.append(entry)
        
        # 建立关键词索引
        for word in content.lower().split():
            if word not in self.index:
                self.index[word] = []
            self.index[word].append(entry_id)
    
    def search(self, query: str, k: int = 3) -> List[Dict]:
        """搜索相关记忆"""
        query_words = query.lower().split()
        scores = {}
        
        for word in query_words:
            if word in self.index:
                for entry_id in self.index[word]:
                    scores[entry_id] = scores.get(entry_id, 0) + 1
        
        # 按相关性排序
        sorted_ids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)[:k]
        
        results = []
        for eid in sorted_ids:
            entry = self.entries[eid - 1]
            entry["access_count"] += 1
            results.append(entry)
        
        return results
    
    def to_prompt(self, query: str = "", k: int = 3) -> str:
        """获取相关记忆并转换为 Prompt"""
        if query:
            memories = self.search(query, k)
        else:
            memories = self.entries[-k:]
        
        if not memories:
            return "没有相关的档案记忆。"
        
        parts = ["相关档案记忆:"]
        for mem in memories:
            parts.append(f"  - {mem['content'][:80]}")
        return "\n".join(parts)


class RecallMemory:
    """
    回忆记忆: 最近的对话历史
    类比: 最近发生的事，可以随时回想
    特点: 中等容量，时间衰减
    """
    
    def __init__(self, max_messages: int = 50, decay_factor: float = 0.95):
        self.max_messages = max_messages
        self.decay_factor = decay_factor
        self.messages = []
    
    def add(self, role: str, content: str):
        """添加消息"""
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now(),
            "importance": 1.0
        })
        
        # 超出容量时修剪
        if len(self.messages) > self.max_messages:
            self._prune()
    
    def _prune(self):
        """修剪不重要的消息"""
        now = datetime.now()
        for msg in self.messages:
            age_hours = (now - msg["timestamp"]).total_seconds() / 3600
            msg["importance"] *= (self.decay_factor ** age_hours)
        
        self.messages.sort(key=lambda x: x["importance"], reverse=True)
        self.messages = self.messages[:self.max_messages]
    
    def search(self, query: str, k: int = 5) -> List[Dict]:
        """搜索相关消息"""
        query_lower = query.lower()
        scored = []
        
        for msg in self.messages:
            content_lower = msg["content"].lower()
            relevance = sum(1 for word in query_lower.split() if word in content_lower)
            if relevance > 0:
                scored.append({**msg, "relevance": relevance * msg["importance"]})
        
        scored.sort(key=lambda x: x["relevance"], reverse=True)
        return scored[:k]
    
    def get_recent(self, k: int = 10) -> List[Dict]:
        """获取最近的消息"""
        return self.messages[-k:]
    
    def to_prompt(self, k: int = 10) -> str:
        """获取最近对话转换为 Prompt"""
        recent = self.get_recent(k)
        if not recent:
            return "没有最近的对话记录。"
        
        parts = ["最近的对话:"]
        for msg in recent:
            role = "用户" if msg["role"] == "user" else "助手"
            parts.append(f"  {role}: {msg['content'][:60]}")
        return "\n".join(parts)


# ===== 测试 MemGPT 三层模型 =====
print("\n" + "=" * 60)
print("MemGPT 三层记忆模型演示")
print("=" * 60)

# Core Memory
print("\n--- Core Memory ---")
core = CoreMemory("小智")
core.update("user_profile", "name", "张三")
core.update("user_profile", "role", "Python 开发者")
core.update("preferences", "language", "中文")
core.update("key_facts", "project", "正在开发 AI Agent 系统")
print(f"\nCore Prompt:\n{core.to_prompt()}")

# Archival Memory
print("\n--- Archival Memory ---")
archival = ArchivalMemory()
archival.add("Python 3.12 引入了新的类型参数语法（PEP 695）", {"topic": "python"})
archival.add("FastAPI 是一个高性能的 Python Web 框架", {"topic": "fastapi"})
archival.add("Docker 是一种容器化技术", {"topic": "docker"})
archival.add("Redis 是高性能内存数据库", {"topic": "redis"})
print(f"\n搜索 'Python':")
print(archival.to_prompt("Python"))

# Recall Memory
print("\n--- Recall Memory ---")
recall = RecallMemory(max_messages=20)
for i in range(10):
    recall.add("user", f"问题 {i+1}: 关于 Python 的第 {i+1} 个方面")
    recall.add("assistant", f"回答 {i+1}: 这是关于第 {i+1} 个方面的解答。")
print(f"消息数量: {len(recall.messages)}")
print(f"\n{recall.to_prompt(5)}")
```

**预期输出：**
```
============================================================
MemGPT 三层记忆模型演示
============================================================

--- Core Memory ---
  [Core] 更新: user_profile.name = 张三
  [Core] 更新: user_profile.role = Python 开发者
  [Core] 更新: preferences.language = 中文
  [Core] 更新: key_facts.project = 正在开发 AI Agent 系统

Core Prompt:
Agent: 小智
用户信息: {"name": "张三", "role": "Python 开发者"}
偏好: {"language": "中文"}
关键事实: {"project": "正在开发 AI Agent 系统"}

--- Archival Memory ---
搜索 'Python':
相关档案记忆:
  - Python 3.12 引入了新的类型参数语法（PEP 695）
  - FastAPI 是一个高性能的 Python Web 框架

--- Recall Memory ---
消息数量: 20

最近的对话:
  用户: 问题 10: 关于 Python 的第 10 个方面
  助手: 回答 10: 这是关于第 10 个方面的解答。
  ...
```

### 3.3 四种记忆类型对比表

| 记忆类型 | 容量 | 访问方式 | 持久化 | Agent 中的对应 |
|---------|------|---------|--------|--------------|
| 工作记忆 | 小 (KB) | 即时访问 | 内存 | 当前对话上下文、任务状态 |
| 情景记忆 | 中 (MB) | 时间/标签索引 | 文件/DB | 对话历史、事件日志 |
| 语义记忆 | 大 (GB) | 语义检索 | 向量DB | 知识库、FAQ |
| 程序记忆 | 中 (MB) | 名称查找 | 文件 | 工具注册表、技能库 |

| MemGPT 层 | 对应认知类型 | 容量 | 访问频率 |
|-----------|------------|------|---------|
| Core Memory | 工作记忆 | 小 | 每次对话 |
| Archival Memory | 语义记忆 | 大 | 按需检索 |
| Recall Memory | 情景记忆 | 中 | 每次对话 |

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 工作记忆容量不够 | 增大 `capacity`，或实现优先级淘汰策略 |
| 2 | 情景记忆搜索太慢 | 建立时间索引或标签索引，避免全量扫描 |
| 3 | 语义记忆搜索不准 | 使用向量数据库（如 ChromaDB）替代简单关键词搜索 |
| 4 | 程序记忆技能找不到 | 检查技能名称拼写，确保技能已注册 |
| 5 | 三层记忆不同步 | 确保每条消息同时更新 Recall 和 Archival |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| 工作记忆 | 当前任务的短期上下文，容量有限 |
| 情景记忆 | 过去的经历和事件，带时间戳 |
| 语义记忆 | 事实和知识，支持语义搜索 |
| 程序记忆 | 技能和操作流程，可执行 |
| Core Memory | MemGPT 核心记忆，始终加载的关键信息 |
| Archival Memory | MemGPT 档案记忆，长期知识存储 |
| Recall Memory | MemGPT 回忆记忆，最近对话历史 |
| 记忆衰减 | 记忆随时间推移重要性降低 |
| 记忆修剪 | 删除不重要的记忆以释放空间 |

## ✅ 验收清单
- [ ] 能说出四种记忆类型的区别和各自职责
- [ ] 能实现 WorkingMemory 并使用优先级管理
- [ ] 能实现 EpisodicMemory 并按时间/标签搜索
- [ ] 能实现 SemanticMemory 并存储和检索知识
- [ ] 能实现 ProceduralMemory 并注册和执行技能
- [ ] 理解 MemGPT 三层模型的设计思想
- [ ] 能说出 Core/Archival/Recall 的区别和关系

## 📝 复盘小纸条
- 今天最大的收获: _______________________
- 还不太确定的: _________________________

## 📥 明日同步接口
- 今日完成度: [ ] 100%  [ ] 80%  [ ] 60%  [ ] 其他___
- 卡点描述: _________________________
- 代码是否能跑通: [ ] 完全可以  [ ] 部分可以  [ ] 有问题
- 明天希望: _________________________
