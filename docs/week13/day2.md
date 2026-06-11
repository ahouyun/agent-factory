# Day 2: 从零构建 Agent 框架 — 工具注册 + 规划循环 + 记忆 + 反思

> **Week 13 深度选修 | 第 2 天**

---

## 今日方向

今天我们不使用 LangChain、CrewAI 等任何现成框架，而是从零构建一个完整的 Agent 框架。你将亲手实现工具注册系统、规划循环、记忆管理和反思机制。理解这些底层组件后，你就能设计出真正可控的 Agent 系统。

---

## 生活比喻

想象你在开一家餐厅。昨天你学会了如何制作食材（构建 LLM），今天你要搭建整个餐厅的运营系统：
- **工具注册** = 菜单设计（知道有哪些菜可以做）
- **规划循环** = 后厨调度（先做什么菜，后做什么菜）
- **记忆系统** = 客户档案（记住老客户的口味偏好）
- **反思机制** = 服务复盘（哪里做得好，哪里需要改进）

---

## 今日三件事

1. **构建工具注册系统** — 让 Agent 能发现和调用外部工具
2. **实现规划循环** — 让 Agent 能分解任务并逐步执行
3. **添加记忆与反思** — 让 Agent 能从经验中学习

---

## 手把手路线

### 阶段一：环境准备

```bash
pip install rich pydantic typing-extensions
```

### 阶段二：架构设计

```
Agent 框架核心组件:
+-- ToolRegistry   -- 工具注册与发现
+-- Memory         -- 短期 + 长期记忆
+-- Planner        -- 任务分解与规划
+-- Reactor        -- 反思与经验积累
+-- Agent          -- 整合所有组件的主循环
```

### 阶段三：核心循环

```
Think -> Act -> Observe
  |       |       |
 分析    执行    反思
 计划    工具    改进
```

---

## 代码区

```python
#!/usr/bin/env python3
"""
Day 2: 从零构建 Agent 框架
Agent Factory Week 13 - Deep Dive Elective
pip install pydantic
"""

import json
import hashlib
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum
import os


# ============================================================
# 第一部分：工具注册系统
# ============================================================

@dataclass
class Tool:
    """工具定义"""
    name: str
    description: str
    function: Callable
    parameters: Dict[str, Any] = field(default_factory=dict)

    def execute(self, **kwargs) -> str:
        try:
            result = self.function(**kwargs)
            return json.dumps({"success": True, "result": result}, ensure_ascii=False)
        except Exception as e:
            return json.dumps({"success": False, "error": str(e)}, ensure_ascii=False)

    def to_schema(self) -> Dict:
        return {"name": self.name, "description": self.description, "parameters": self.parameters}


class ToolRegistry:
    """工具注册表：管理所有可用工具"""
    def __init__(self):
        self._tools: Dict[str, Tool] = {}
        self._categories: Dict[str, List[str]] = {}

    def register(self, name=None, description="", parameters=None, category="general"):
        """装饰器注册工具"""
        def decorator(func):
            tool_name = name or func.__name__
            tool = Tool(name=tool_name, description=description or func.__doc__ or "",
                       function=func, parameters=parameters or {})
            self._tools[tool_name] = tool
            self._categories.setdefault(category, []).append(tool_name)
            return func
        return decorator

    def register_direct(self, tool: Tool):
        self._tools[tool.name] = tool
        self._categories.setdefault("general", []).append(tool.name)

    def get_tool(self, name):
        return self._tools.get(name)

    def list_tools(self):
        return [t.to_schema() for t in self._tools.values()]

    def search(self, query):
        q = query.lower()
        return [t for t in self._tools.values()
                if q in t.name.lower() or q in t.description.lower()]

    def execute(self, tool_name, **kwargs):
        tool = self.get_tool(tool_name)
        if not tool:
            return json.dumps({"success": False, "error": f"工具 '{tool_name}' 不存在"})
        return tool.execute(**kwargs)

    def to_prompt(self) -> str:
        lines = ["可用工具:"]
        for cat, names in self._categories.items():
            lines.append(f"\n[{cat}]")
            for n in names:
                lines.append(f"  - {n}: {self._tools[n].description}")
        return "\n".join(lines)


# 创建全局注册表并注册工具
registry = ToolRegistry()


@registry.register(name="calculator", description="执行数学计算",
                   parameters={"expression": {"type": "string"}}, category="math")
def calculator(expression: str) -> float:
    allowed = set("0123456789+-*/.() ")
    if not all(c in allowed for c in expression):
        raise ValueError("表达式包含不允许的字符")
    return eval(expression)


@registry.register(name="web_search", description="搜索网络信息",
                   parameters={"query": {"type": "string"}}, category="search")
def web_search(query: str) -> str:
    return f"搜索 '{query}' 的结果: [结果1, 结果2, 结果3]"


@registry.register(name="get_current_time", description="获取当前时间",
                   parameters={}, category="system")
def get_current_time() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


@registry.register(name="read_file", description="读取文件内容",
                   parameters={"path": {"type": "string"}}, category="file")
def read_file(path: str) -> str:
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    return f"文件不存在: {path}"


# 测试工具注册
print("=" * 60)
print("测试工具注册系统")
print("=" * 60)
print(registry.to_prompt())
print()
print(f"计算结果: {registry.execute('calculator', expression='2 + 3 * 4')}")
print(f"当前时间: {registry.execute('get_current_time')}")
print(f"搜索结果: {registry.execute('web_search', query='Python Agent')}")
print()

# 测试工具搜索
results = registry.search("计算")
print(f"搜索 '计算' 找到 {len(results)} 个工具: {[t.name for t in results]}")
print()


# ============================================================
# 第二部分：记忆系统
# ============================================================

class MemoryType(Enum):
    SHORT_TERM = "short_term"
    LONG_TERM = "long_term"
    EPISODIC = "episodic"
    SEMANTIC = "semantic"


@dataclass
class MemoryItem:
    content: str
    memory_type: MemoryType
    importance: float = 0.5
    metadata: Dict = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)
    access_count: int = 0

    def to_dict(self):
        return {"content": self.content, "type": self.memory_type.value,
                "importance": self.importance, "timestamp": self.timestamp.isoformat()}


class Memory:
    """多类型记忆系统"""
    def __init__(self, short_term_limit=20, long_term_limit=1000):
        self.short_term: List[MemoryItem] = []
        self.long_term: List[MemoryItem] = []
        self.episodic: List[MemoryItem] = []
        self.semantic: List[MemoryItem] = []
        self.short_term_limit = short_term_limit
        self.long_term_limit = long_term_limit

    def add(self, content, memory_type=MemoryType.SHORT_TERM, importance=0.5, metadata=None):
        item = MemoryItem(content=content, memory_type=memory_type,
                         importance=importance, metadata=metadata or {})
        if memory_type == MemoryType.SHORT_TERM:
            self.short_term.append(item)
            if len(self.short_term) > self.short_term_limit:
                self._consolidate()
        elif memory_type == MemoryType.LONG_TERM:
            self.long_term.append(item)
        elif memory_type == MemoryType.EPISODIC:
            self.episodic.append(item)
        elif memory_type == MemoryType.SEMANTIC:
            self.semantic.append(item)
        return item

    def _consolidate(self):
        """短期记忆整理：重要记忆转移到长期"""
        self.short_term.sort(key=lambda x: x.importance, reverse=True)
        keep = self.short_term[:self.short_term_limit // 2]
        for item in self.short_term[self.short_term_limit // 2:]:
            item.memory_type = MemoryType.LONG_TERM
            self.long_term.append(item)
        self.short_term = keep

    def search(self, query, memory_type=None, top_k=5):
        results = []
        all_mem = self._get_all(memory_type)
        q_words = set(query.lower().split())
        for item in all_mem:
            c_words = set(item.content.lower().split())
            score = len(q_words & c_words) / max(len(q_words), 1)
            if score > 0:
                item.access_count += 1
                results.append((score, item))
        results.sort(key=lambda x: x[0], reverse=True)
        return [item for _, item in results[:top_k]]

    def _get_all(self, memory_type=None):
        if memory_type is None:
            return self.short_term + self.long_term + self.episodic + self.semantic
        return getattr(self, memory_type.value, [])

    def get_context(self) -> str:
        lines = ["记忆上下文:"]
        if self.short_term:
            lines.append("\n[短期记忆]")
            for item in self.short_term[-5:]:
                lines.append(f"  - {item.content}")
        if self.episodic:
            lines.append("\n[情景记忆]")
            for item in self.episodic[-3:]:
                lines.append(f"  - [{item.timestamp.strftime('%m-%d')}] {item.content}")
        if self.semantic:
            lines.append("\n[语义记忆]")
            for item in self.semantic[:3]:
                lines.append(f"  - {item.content}")
        return "\n".join(lines)

    def stats(self):
        return {"short_term": len(self.short_term), "long_term": len(self.long_term),
                "episodic": len(self.episodic), "semantic": len(self.semantic)}


# 测试记忆系统
print("=" * 60)
print("测试记忆系统")
print("=" * 60)
memory = Memory()
memory.add("用户正在学习 Agent 开发", MemoryType.SHORT_TERM, importance=0.7)
memory.add("用户偏好 Python", MemoryType.SEMANTIC, importance=0.8)
memory.add("昨天完成了 Day 1", MemoryType.EPISODIC, importance=0.6)
memory.add("LLaMA2 使用 RMSNorm", MemoryType.SEMANTIC, importance=0.9)

results = memory.search("Agent 开发")
print(f"搜索 'Agent 开发' 找到 {len(results)} 条:")
for item in results:
    print(f"  - {item.content}")
print(f"统计: {memory.stats()}")
print()


# ============================================================
# 第三部分：规划系统
# ============================================================

class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Task:
    id: str
    description: str
    status: TaskStatus = TaskStatus.PENDING
    subtasks: List['Task'] = field(default_factory=list)
    result: Optional[str] = None
    tools_used: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)


class Planner:
    """规划器：将目标分解为可执行的子任务"""
    def __init__(self):
        self.plans: List[Task] = []

    def decompose(self, goal: str) -> Task:
        task = Task(id=hashlib.md5(goal.encode()).hexdigest()[:8], description=goal)
        for desc in self._decompose(goal):
            subtask = Task(id=hashlib.md5(desc.encode()).hexdigest()[:8], description=desc)
            task.subtasks.append(subtask)
        self.plans.append(task)
        return task

    def _decompose(self, goal):
        if "搜索" in goal or "查找" in goal:
            return ["理解搜索需求", "执行搜索", "整理结果"]
        elif "计算" in goal:
            return ["解析表达式", "执行计算", "返回结果"]
        elif "写" in goal or "创建" in goal:
            return ["理解需求", "设计结构", "编写内容", "检查质量"]
        return ["理解任务", "执行任务", "验证结果"]

    def get_next(self, task):
        for s in task.subtasks:
            if s.status == TaskStatus.PENDING:
                return s
        return None

    def to_prompt(self, task, indent=0):
        prefix = "  " * indent
        icons = {TaskStatus.PENDING: "[待执行]", TaskStatus.IN_PROGRESS: "[执行中]",
                 TaskStatus.COMPLETED: "[已完成]", TaskStatus.FAILED: "[失败]"}
        lines = [f"{prefix}{icons.get(task.status, '[未知]')} {task.description}"]
        for s in task.subtasks:
            lines.append(self.to_prompt(s, indent + 1))
        return "\n".join(lines)


# 测试规划系统
print("=" * 60)
print("测试规划系统")
print("=" * 60)
planner = Planner()
plan = planner.decompose("帮我搜索 Python Agent 开发资料")
print(f"目标: {plan.description}")
print("分解计划:")
print(planner.to_prompt(plan))
print()


# ============================================================
# 第四部分：反思系统
# ============================================================

@dataclass
class Reflection:
    task_description: str
    success: bool
    what_went_well: List[str] = field(default_factory=list)
    what_went_wrong: List[str] = field(default_factory=list)
    lessons_learned: List[str] = field(default_factory=list)
    suggestions: List[str] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.now)


class Reactor:
    """反思系统：从执行结果中提取经验"""
    def __init__(self):
        self.reflections: List[Reflection] = []
        self.experience_pool: List[Dict] = []

    def reflect(self, task: Task, logs: List[str]) -> Reflection:
        ref = Reflection(task_description=task.description,
                        success=(task.status == TaskStatus.COMPLETED))
        for log in logs:
            if "成功" in log or "完成" in log:
                ref.what_went_well.append(log)
            elif "失败" in log or "错误" in log:
                ref.what_went_wrong.append(log)
            elif "使用" in log:
                ref.lessons_learned.append(log)

        if ref.what_went_wrong:
            ref.suggestions.append(f"添加错误处理: {', '.join(ref.what_went_wrong[:2])}")
        if not ref.lessons_learned:
            ref.suggestions.append("记录更多执行细节")

        self.reflections.append(ref)
        self._extract_experience(ref)
        return ref

    def _extract_experience(self, ref):
        pattern = "search" if "搜索" in ref.task_description else \
                  "calc" if "计算" in ref.task_description else "general"
        self.experience_pool.append({
            "task_pattern": pattern, "success": ref.success,
            "learnings": ref.lessons_learned[:3],
            "improvements": ref.suggestions[:2],
        })

    def get_similar(self, task_desc):
        pattern = "search" if "搜索" in task_desc else \
                  "calc" if "计算" in task_desc else "general"
        return [e for e in self.experience_pool if e["task_pattern"] == pattern]

    def to_prompt(self):
        if not self.reflections:
            return "暂无历史反思。"
        lines = ["历史经验:"]
        for exp in self.experience_pool[-5:]:
            s = "成功" if exp["success"] else "失败"
            lines.append(f"  - [{s}] {exp['task_pattern']}任务")
        return "\n".join(lines)


# 测试反思系统
print("=" * 60)
print("测试反思系统")
print("=" * 60)
reactor = Reactor()
test_task = Task(id="t1", description="搜索 Python 资料", status=TaskStatus.COMPLETED)
ref = reactor.reflect(test_task, ["使用工具 web_search", "成功获取结果", "整理完成"])
print(f"成功: {ref.success}")
print(f"做得好的: {ref.what_went_well}")
print(f"改进建议: {ref.suggestions}")
print(f"\n{reactor.to_prompt()}")
print()


# ============================================================
# 第五部分：Agent 主体
# ============================================================

class Agent:
    """Agent 主体：整合工具、记忆、规划、反思"""
    def __init__(self, name="Agent"):
        self.name = name
        self.registry = ToolRegistry()
        self.memory = Memory()
        self.planner = Planner()
        self.reactor = Reactor()
        self.execution_log: List[str] = []
        self.current_task: Optional[Task] = None

    def think(self, goal: str) -> str:
        """思考：分析目标，制定计划"""
        self.execution_log.append(f"思考: 分析目标 '{goal}'")
        relevant = self.memory.search(goal, top_k=3)
        if relevant:
            self.execution_log.append(f"找到 {len(relevant)} 条相关记忆")

        task = self.planner.decompose(goal)
        self.current_task = task
        return self.planner.to_prompt(task)

    def act(self, task: Task) -> str:
        """行动：执行任务"""
        self.execution_log.append(f"行动: 执行 '{task.description}'")
        task.status = TaskStatus.IN_PROGRESS

        if "搜索" in task.description:
            result = self.registry.execute("web_search", query=task.description)
            task.tools_used.append("web_search")
        elif "计算" in task.description:
            result = self.registry.execute("calculator", expression="2 + 3")
            task.tools_used.append("calculator")
        else:
            result = f"任务 '{task.description}' 执行完成"

        task.result = result
        task.status = TaskStatus.COMPLETED
        self.execution_log.append(f"完成: {task.description}")
        return result

    def observe(self):
        """观察：记录经验，进行反思"""
        if self.current_task:
            self.memory.add(f"完成: {self.current_task.description}",
                          MemoryType.EPISODIC, importance=0.6)
            ref = self.reactor.reflect(self.current_task, self.execution_log)
            if ref.success:
                self.memory.add(f"成功经验: {self.current_task.description}",
                              MemoryType.SEMANTIC, importance=0.8)

    def run(self, goal: str) -> str:
        """完整循环: Think -> Act -> Observe"""
        print(f"\n{'='*60}")
        print(f"[{self.name}] 目标: {goal}")
        print(f"{'='*60}")

        plan = self.think(goal)
        print(f"\n[计划]\n{plan}")

        if self.current_task:
            for sub in self.current_task.subtasks:
                result = self.act(sub)
                print(f"\n[执行] {sub.description}: {result[:80]}...")

        self.observe()

        report = (f"记忆: {self.memory.stats()} | "
                  f"经验池: {len(self.reactor.experience_pool)} | "
                  f"日志条数: {len(self.execution_log)}")
        print(f"\n[报告] {report}")

        self.execution_log = []
        self.current_task = None
        return report

    def get_state(self):
        return {"name": self.name, "memory": self.memory.stats(),
                "tools": len(self.registry._tools),
                "reflections": len(self.reactor.reflections)}


# 测试完整 Agent
print("=" * 60)
print("测试完整 Agent")
print("=" * 60)
agent = Agent(name="学习助手")
agent.registry.register_direct(Tool(name="calculator", description="数学计算", function=calculator))
agent.registry.register_direct(Tool(name="web_search", description="搜索", function=web_search))

agent.run("帮我计算 123 * 456")
agent.run("搜索 Python Agent 开发资料")
print(f"\nAgent 最终状态: {agent.get_state()}")
print()


# ============================================================
# 第六部分：状态持久化
# ============================================================

class AgentPersistence:
    @staticmethod
    def save(agent, path):
        state = {
            "name": agent.name,
            "memory_stats": agent.memory.stats(),
            "experience_pool": agent.reactor.experience_pool,
            "reflection_count": len(agent.reactor.reflections),
        }
        with open(path, "w", encoding="utf-8") as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
        print(f"状态已保存: {path}")

    @staticmethod
    def load(agent, path):
        with open(path, "r", encoding="utf-8") as f:
            state = json.load(f)
        agent.name = state["name"]
        agent.reactor.experience_pool = state.get("experience_pool", [])
        print(f"状态已加载: {path}")


AgentPersistence.save(agent, "agent_state.json")
print()


# ============================================================
# 总结
# ============================================================

print("=" * 60)
print("Day 2 总结")
print("=" * 60)
print("构建的组件:")
print("  1. ToolRegistry -- 工具注册与发现")
print("  2. Memory -- 多类型记忆系统")
print("  3. Planner -- 任务分解规划器")
print("  4. Reactor -- 反思与经验积累")
print("  5. Agent -- 整合所有组件的主体")
print("  6. AgentPersistence -- 状态持久化")
print()
print("核心循环: Think -> Act -> Observe")
print("关键收获:")
print("  1. 工具注册让 Agent 能发现和使用外部能力")
print("  2. 记忆系统让 Agent 能积累和利用经验")
print("  3. 规划系统让 Agent 能处理复杂任务")
print("  4. 反思系统让 Agent 能自我改进")

if os.path.exists("agent_state.json"):
    os.remove("agent_state.json")
```

---

## 预期输出

```
============================================================
测试工具注册系统
============================================================
可用工具:

[math]
  - calculator: 执行数学计算
[search]
  - web_search: 搜索网络信息
...

计算结果: {"success": true, "result": 14}
当前时间: {"success": true, "result": "2026-06-11 10:30:00"}

============================================================
测试记忆系统
============================================================
搜索 'Agent 开发' 找到 1 条:
  - 用户正在学习 Agent 开发
统计: {'short_term': 1, 'long_term': 1, 'episodic': 1, 'semantic': 2}

============================================================
测试完整 Agent
============================================================

[学习助手] 目标: 搜索 Python Agent 开发资料

[计划]
[待执行] 搜索 Python Agent 开发资料
  [待执行] 理解搜索需求
  [待执行] 执行搜索
  [待执行] 整理结果

[执行] 理解搜索需求: 任务 '理解搜索需求' 执行完成...
[执行] 执行搜索: {"success": true, "result": "搜索 '...' 的结果"}...
```

---

## 常见错误与解决方案

### 错误 1: 工具函数参数不匹配
```
TypeError: calculator() got an unexpected keyword argument 'expr'
```
**解决**: 确保 `execute()` 传入的参数名与函数签名一致

### 错误 2: 记忆搜索无结果
```
搜索 'Python' 找到 0 条
```
**解决**: 搜索使用的是简单关键词匹配，确保记忆内容包含搜索词

### 错误 3: Agent 无限循环
**解决**: 为 `run()` 添加 `max_steps` 参数限制

### 错误 4: JSON 序列化失败
```
TypeError: Object of type datetime is not JSON serializable
```
**解决**: 在 `to_dict()` 中将 datetime 转为 ISO 格式字符串

---

## 每日挑战

### 挑战 1: 添加向量记忆检索
```python
# 使用 sentence-transformers 实现语义搜索
# pip install sentence-transformers
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
```

### 挑战 2: 实现多 Agent 协作
```python
class MultiAgentSystem:
    def __init__(self):
        self.agents = []
    def add_agent(self, agent):
        self.agents.append(agent)
    def run_task(self, task):
        # 分配任务给不同 Agent
        pass
```

### 挑战 3: 添加 Agent 可观测性
```python
# 记录每个步骤的耗时、token 使用量等
import time
class AgentTracer:
    def trace_step(self, step_name, duration, tokens_used):
        pass
```

---

## 今日小结

今天我们从零构建了完整的 Agent 框架，核心循环为 Think -> Act -> Observe。这套框架不依赖任何第三方 Agent 库，所有组件都可以自由定制。

**明天预告**: Day 3 多模态 + 语音 Agent + VLM 微调！
