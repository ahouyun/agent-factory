# 📅 Week 8 Day 2：A2A + NLWeb 协议 —— Agent 之间的对话桥梁

## 🎯 今日方向

> 除了 MCP，还有 Google 的 A2A（Agent-to-Agent）和 NLWeb 协议。今天我们将深入理解这两大协议的设计理念，实现一个 A2A Agent 和一个 NLWeb 服务，并对比三大协议的定位和差异。

## 🏠 生活比喻

> 三大协议就像三种通信方式：
> - **MCP** = 电话（LLM 直接调用工具，点对点）
> - **A2A** = 对讲机（Agent 之间对话协作，多方通信）
> - **NLWeb** = 网站（用自然语言访问 Web 服务，信息浏览）
>
> MCP 让 LLM 能"打电话"给工具；A2A 让 Agent 能"对话"；NLWeb 让网站能"听懂人话"。

## 📋 今日三件事

1. **理解 A2A 协议** —— Agent 间如何发现和协作
2. **理解 NLWeb 协议** —— 网站如何支持自然语言交互
3. **对比三大协议** —— 制作对比表格，理解各自定位

## 🗺️ 手把手路线

### Step 1: A2A 协议基础（20 分钟）

- 做什么: 理解 Agent Card、Task、Message、Artifact 等核心概念
- 为什么: 多 Agent 系统需要标准化通信
- 成功标志: 能说出 A2A 的核心流程

### Step 2: 实现 A2A Agent（25 分钟）

- 做什么: 用 Python 实现一个支持 A2A 协议的 Agent
- 为什么: 动手实践理解协议细节
- 成功标志: Agent 能创建任务、执行任务、返回结果

### Step 3: NLWeb 协议与实现（20 分钟）

- 做什么: 理解 NLWeb 的工作原理并实现一个示例
- 为什么: Web 是最大的信息源
- 成功标志: 能生成 NLWeb 清单文件

### Step 4: 三大协议对比（15 分钟）

- 做什么: 制作对比表格，理解各自定位
- 为什么: 正确选型需要理解差异
- 成功标志: 能根据场景选择合适的协议

## 💻 代码区

### 代码 1：A2A 协议核心概念与实现

```python
"""
Week 8 Day 2: A2A（Agent-to-Agent）协议实现
理解 Agent 间如何发现和协作
"""

import json
import uuid
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime


# ========== 1. A2A 核心概念 ==========
print("=" * 60)
print("1. A2A 协议核心概念")
print("=" * 60)

a2a_overview = """
A2A (Agent-to-Agent) 协议:
  由 Google 提出，用于 Agent 之间的通信和协作。

核心概念:
  Agent Card: Agent 的"名片"，描述能力和技能
  Task: Agent 间协作的任务单元（有状态）
  Message: Agent 间的通信消息（包含 Part）
  Artifact: 任务产出的结果（包含 Part）

工作流程:
  1. 发现: Agent 通过 Agent Card 发现其他 Agent 的能力
  2. 协商: Agent 间协商任务分工和执行计划
  3. 执行: 各 Agent 执行自己的任务
  4. 交付: 返回结果（Artifact）给请求方

与 MCP 的区别:
  MCP: LLM ↔ 工具（单向调用）
  A2A: Agent ↔ Agent（双向协作）
"""
print(a2a_overview)


# ========== 2. Agent Card 实现 ==========
print("=" * 60)
print("2. Agent Card（Agent 名片）")
print("=" * 60)


@dataclass
class AgentSkill:
    """Agent 技能描述"""
    id: str
    name: str
    description: str
    tags: List[str] = field(default_factory=list)
    examples: List[str] = field(default_factory=list)


@dataclass
class AgentCard:
    """Agent 名片（A2A 核心概念）"""
    name: str
    description: str
    url: str
    version: str = "1.0.0"
    capabilities: List[str] = field(default_factory=list)
    skills: List[AgentSkill] = field(default_factory=list)
    authentication: Optional[Dict] = None

    def to_dict(self) -> dict:
        """转换为字典格式"""
        return {
            "name": self.name,
            "description": self.description,
            "url": self.url,
            "version": self.version,
            "capabilities": self.capabilities,
            "skills": [
                {
                    "id": skill.id,
                    "name": skill.name,
                    "description": skill.description,
                    "tags": skill.tags,
                    "examples": skill.examples,
                }
                for skill in self.skills
            ],
            "authentication": self.authentication,
        }

    def to_json(self) -> str:
        """转换为 JSON 字符串"""
        return json.dumps(self.to_dict(), indent=2, ensure_ascii=False)


# 创建研究 Agent 的名片
research_card = AgentCard(
    name="researcher",
    description="专业的研究和信息收集 Agent，擅长搜索、分析和总结",
    url="http://localhost:8080/agents/researcher",
    capabilities=["text_generation", "web_search", "summarization"],
    skills=[
        AgentSkill(
            id="web_search",
            name="网页搜索",
            description="搜索互联网获取最新信息",
            tags=["search", "web", "information"],
            examples=["搜索 Python 最新版本", "查找 AI 论文"],
        ),
        AgentSkill(
            id="summarize",
            name="文档总结",
            description="总结长文档的核心要点",
            tags=["summary", "analysis"],
            examples=["总结这篇论文", "概括会议记录"],
        ),
    ],
)

print("Agent Card 示例:")
print(research_card.to_json())


# ========== 3. A2A Task 实现 ==========
print("\n" + "=" * 60)
print("3. A2A Task（任务管理）")
print("=" * 60)


@dataclass
class TaskPart:
    """任务消息的一部分"""
    type: str  # text, data, file
    content: str
    metadata: Dict = field(default_factory=dict)


@dataclass
class A2AMessage:
    """A2A 消息"""
    role: str  # user, agent
    parts: List[TaskPart]
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class A2ATask:
    """A2A 任务（有状态）"""
    task_id: str
    status: str  # pending, working, completed, failed, canceled
    messages: List[A2AMessage] = field(default_factory=list)
    artifacts: List[Dict] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> dict:
        return {
            "task_id": self.task_id,
            "status": self.status,
            "messages_count": len(self.messages),
            "artifacts": self.artifacts,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    def add_user_message(self, text: str):
        """添加用户消息"""
        msg = A2AMessage(
            role="user",
            parts=[TaskPart(type="text", content=text)],
        )
        self.messages.append(msg)
        self.updated_at = datetime.now().isoformat()

    def add_agent_message(self, text: str):
        """添加 Agent 消息"""
        msg = A2AMessage(
            role="agent",
            parts=[TaskPart(type="text", content=text)],
        )
        self.messages.append(msg)
        self.updated_at = datetime.now().isoformat()

    def complete(self, result: str):
        """完成任务"""
        self.status = "completed"
        self.artifacts.append({
            "type": "text",
            "content": result,
        })
        self.add_agent_message(f"任务完成: {result}")
        self.updated_at = datetime.now().isoformat()

    def fail(self, error: str):
        """任务失败"""
        self.status = "failed"
        self.artifacts.append({
            "type": "error",
            "content": error,
        })
        self.add_agent_message(f"任务失败: {error}")
        self.updated_at = datetime.now().isoformat()


# 创建任务示例
task = A2ATask(
    task_id=str(uuid.uuid4())[:8],
    status="pending",
)
task.add_user_message("搜索 Python 3.12 的新特性")

print("创建任务:")
print(json.dumps(task.to_dict(), indent=2, ensure_ascii=False))

# 模拟执行
task.status = "working"
task.add_agent_message("正在搜索...")
task.complete("Python 3.12 引入了改进的错误消息、性能优化等新特性")
print("\n任务完成:")
print(json.dumps(task.to_dict(), indent=2, ensure_ascii=False))
```

### 代码 2：完整的 A2A Agent 实现

```python
"""
Week 8 Day 2: A2A Agent 完整实现
实现一个支持 A2A 协议的研究 Agent
"""

import json
import uuid
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class AgentCard:
    """Agent 名片"""
    name: str
    description: str
    url: str
    capabilities: List[str] = field(default_factory=list)
    skills: List[Dict] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "url": self.url,
            "capabilities": self.capabilities,
            "skills": self.skills,
        }


@dataclass
class Task:
    """A2A 任务"""
    task_id: str
    status: str
    messages: List[Dict] = field(default_factory=list)
    artifacts: List[Dict] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())


class A2AAgent:
    """A2A Agent 实现"""

    def __init__(self, name: str, description: str, skills: List[Dict]):
        self.name = name
        self.description = description
        self.skills = skills
        self.tasks: Dict[str, Task] = {}

    def get_agent_card(self) -> AgentCard:
        """获取 Agent 名片"""
        return AgentCard(
            name=self.name,
            description=self.description,
            url=f"http://localhost:8080/agents/{self.name}",
            capabilities=["text_generation", "task_execution"],
            skills=self.skills,
        )

    def create_task(self, skill_name: str, input_data: dict) -> Task:
        """创建任务"""
        task_id = f"task_{uuid.uuid4().hex[:8]}"
        task = Task(
            task_id=task_id,
            status="pending",
            messages=[{"role": "user", "content": json.dumps(input_data, ensure_ascii=False)}],
        )
        self.tasks[task_id] = task
        return task

    def execute_task(self, task_id: str) -> Task:
        """执行任务（模拟）"""
        task = self.tasks[task_id]
        task.status = "working"

        # 模拟根据技能执行不同逻辑
        input_data = json.loads(task.messages[0]["content"])

        if "query" in input_data:
            result = f"搜索结果: 关于 '{input_data['query']}' 的信息已收集完成"
        elif "text" in input_data:
            result = f"总结: {input_data['text'][:50]}..."
        else:
            result = "任务执行完成"

        task.artifacts.append({"type": "text", "content": result})
        task.status = "completed"
        return task

    def get_task(self, task_id: str) -> Optional[Task]:
        """获取任务"""
        return self.tasks.get(task_id)

    def list_tasks(self) -> List[Task]:
        """列出所有任务"""
        return list(self.tasks.values())


# ========== 创建 A2A Agent ==========
print("=" * 60)
print("A2A Agent 实现")
print("=" * 60)

# 创建研究 Agent
research_agent = A2AAgent(
    name="researcher",
    description="专业的研究和信息收集 Agent",
    skills=[
        {"name": "web_search", "description": "搜索网页信息"},
        {"name": "summarize", "description": "总结文档内容"},
    ],
)

# 获取 Agent 名片
card = research_agent.get_agent_card()
print("\nAgent 名片:")
print(json.dumps(card.to_dict(), indent=2, ensure_ascii=False))

# 创建并执行任务
print("\n--- 创建并执行任务 ---")

# 任务1: 搜索
task1 = research_agent.create_task("web_search", {"query": "Python 3.12 新特性"})
print(f"\n任务1 创建: {task1.task_id}")
task1 = research_agent.execute_task(task1.task_id)
print(f"任务1 状态: {task1.status}")
print(f"任务1 结果: {task1.artifacts[0]['content']}")

# 任务2: 总结
task2 = research_agent.create_task("summarize", {"text": "这是一篇关于人工智能发展的长文档，涵盖了从早期规则系统到现代深度学习的演进历程"})
print(f"\n任务2 创建: {task2.task_id}")
task2 = research_agent.execute_task(task2.task_id)
print(f"任务2 状态: {task2.status}")
print(f"任务2 结果: {task2.artifacts[0]['content']}")

# 列出所有任务
print(f"\n总任务数: {len(research_agent.list_tasks())}")
```

### 代码 3：NLWeb 协议实现

```python
"""
Week 8 Day 2: NLWeb 协议实现
让网站支持自然语言交互
"""

import json
from typing import Dict, List, Optional
from dataclasses import dataclass, field


# ========== 1. NLWeb 核心概念 ==========
print("=" * 60)
print("1. NLWeb 协议核心概念")
print("=" * 60)

nlweb_overview = """
NLWeb (Natural Language Web) 协议:
  让网站支持自然语言交互的标准（Microsoft 提出）。

核心思想:
  - 网站通过结构化数据（JSON-LD）暴露能力
  - LLM 通过自然语言理解网站功能
  - 用户可以用对话方式与网站交互

工作流程:
  1. 网站提供 NLWeb 清单文件（描述端点和能力）
  2. LLM 解析清单，理解网站能做什么
  3. 用户用自然语言提出需求
  4. LLM 将需求转换为 API 调用
  5. 返回结果给用户

与 MCP 的区别:
  MCP: 工具调用（函数级）
  NLWeb: 自然语言接口（网站级）
"""
print(nlweb_overview)


# ========== 2. NLWeb 端点描述 ==========
print("=" * 60)
print("2. NLWeb 端点与清单")
print("=" * 60)


@dataclass
class NLWebParameter:
    """NLWeb 参数描述"""
    name: str
    type: str  # string, number, boolean
    description: str
    required: bool = True
    default: Optional[str] = None


@dataclass
class NLWebEndpoint:
    """NLWeb 端点描述"""
    name: str
    description: str
    url: str
    method: str  # GET, POST
    parameters: List[NLWebParameter] = field(default_factory=list)
    examples: List[Dict] = field(default_factory=list)
    response_example: Optional[Dict] = None

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "url": self.url,
            "method": self.method,
            "parameters": [
                {
                    "name": p.name,
                    "type": p.type,
                    "description": p.description,
                    "required": p.required,
                    "default": p.default,
                }
                for p in self.parameters
            ],
            "examples": self.examples,
            "response_example": self.response_example,
        }


@dataclass
class NLWebManifest:
    """NLWeb 清单文件"""
    name: str
    description: str
    base_url: str
    version: str = "1.0.0"
    endpoints: List[NLWebEndpoint] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "@context": "https://nlweb.io/context",
            "@type": "WebAPI",
            "name": self.name,
            "description": self.description,
            "url": self.base_url,
            "version": self.version,
            "endpoints": [ep.to_dict() for ep in self.endpoints],
        }

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2, ensure_ascii=False)


# ========== 3. 创建在线书店 NLWeb 服务 ==========
print("=" * 60)
print("3. 在线书店 NLWeb 服务")
print("=" * 60)

bookstore = NLWebManifest(
    name="在线书店",
    description="提供书籍搜索、详情查询和订购服务的在线书店",
    base_url="https://api.bookstore.com",
)

# 添加搜索端点
bookstore.endpoints.append(NLWebEndpoint(
    name="search_books",
    description="根据关键词搜索书籍",
    url="/books/search",
    method="GET",
    parameters=[
        NLWebParameter(name="query", type="string", description="搜索关键词"),
        NLWebParameter(name="category", type="string", description="书籍类别", required=False),
        NLWebParameter(name="limit", type="number", description="返回数量", required=False, default="10"),
    ],
    examples=[
        {"query": "Python", "category": "编程"},
        {"query": "三体", "limit": "5"},
    ],
    response_example={
        "books": [
            {"id": "book_001", "title": "Python 编程从入门到实践", "price": 79.0, "rating": 4.8},
            {"id": "book_002", "title": "流畅的 Python", "price": 108.0, "rating": 4.9},
        ],
        "total": 2,
    },
))

# 添加详情端点
bookstore.endpoints.append(NLWebEndpoint(
    name="get_book_details",
    description="获取书籍的详细信息",
    url="/books/{id}",
    method="GET",
    parameters=[
        NLWebParameter(name="id", type="string", description="书籍 ID"),
    ],
    examples=[{"id": "book_001"}],
    response_example={
        "id": "book_001",
        "title": "Python 编程从入门到实践",
        "author": "Eric Matthes",
        "price": 79.0,
        "rating": 4.8,
        "description": "适合初学者的 Python 编程入门书籍",
    },
))

# 添加订购端点
bookstore.endpoints.append(NLWebEndpoint(
    name="order_book",
    description="订购一本书",
    url="/orders",
    method="POST",
    parameters=[
        NLWebParameter(name="book_id", type="string", description="书籍 ID"),
        NLWebParameter(name="quantity", type="number", description="数量", required=False, default="1"),
        NLWebParameter(name="address", type="string", description="收货地址"),
    ],
    examples=[{"book_id": "book_001", "quantity": "2", "address": "北京市朝阳区"}],
    response_example={
        "order_id": "order_12345",
        "status": "confirmed",
        "total": 158.0,
    },
))

print("NLWeb 清单文件:")
print(bookstore.to_json())


# ========== 4. NLWeb 模拟执行 ==========
print("\n" + "=" * 60)
print("4. NLWeb 模拟执行")
print("=" * 60)


class NLWebSimulator:
    """NLWeb 模拟器"""

    def __init__(self, manifest: NLWebManifest):
        self.manifest = manifest
        self.endpoint_map = {ep.name: ep for ep in manifest.endpoints}

    def understand_request(self, user_input: str) -> Dict:
        """模拟 LLM 理解用户请求"""
        user_lower = user_input.lower()

        if "搜索" in user_input or "search" in user_lower:
            return {"endpoint": "search_books", "params": {"query": user_input}}
        elif "详情" in user_input or "detail" in user_lower:
            return {"endpoint": "get_book_details", "params": {"id": "book_001"}}
        elif "订购" in user_input or "order" in user_lower:
            return {"endpoint": "order_book", "params": {"book_id": "book_001", "address": "北京市"}}
        else:
            return {"endpoint": None, "error": "无法理解的请求"}

    def execute(self, endpoint_name: str, params: Dict) -> Dict:
        """执行端点调用"""
        if endpoint_name not in self.endpoint_map:
            return {"error": f"端点不存在: {endpoint_name}"}

        endpoint = self.endpoint_map[endpoint_name]

        # 模拟响应
        if endpoint.response_example:
            return {"status": "success", "data": endpoint.response_example}
        return {"status": "success", "data": {}}

    def process(self, user_input: str) -> Dict:
        """处理用户自然语言请求"""
        print(f"\n  用户输入: {user_input}")

        # 步骤1: 理解请求
        intent = self.understand_request(user_input)
        print(f"  意图识别: {intent}")

        if intent.get("error"):
            return {"error": intent["error"]}

        # 步骤2: 执行调用
        result = self.execute(intent["endpoint"], intent["params"])
        print(f"  执行结果: {json.dumps(result, ensure_ascii=False, indent=4)}")

        return result


# 使用模拟器
simulator = NLWebSimulator(bookstore)

# 测试自然语言请求
simulator.process("帮我搜索 Python 相关的书")
simulator.process("查看书籍详情")
simulator.process("我要订购一本书")
simulator.process("今天天气怎么样")  # 无法理解的请求
```

### 代码 5：三大协议对比与集成

```python
"""
Week 8 Day 2: 三大协议对比与多协议集成
"""

import json
from typing import Dict, List
from dataclasses import dataclass, field


# ========== 1. 三大协议对比 ==========
print("=" * 60)
print("1. 三大协议对比")
print("=" * 60)

comparison_data = [
    {"维度": "全称", "MCP": "Model Context Protocol", "A2A": "Agent-to-Agent", "NLWeb": "Natural Language Web"},
    {"维度": "提出者", "MCP": "Anthropic", "A2A": "Google", "NLWeb": "Microsoft"},
    {"维度": "定位", "MCP": "LLM ↔ 工具", "A2A": "Agent ↔ Agent", "NLWeb": "LLM ↔ Web 服务"},
    {"维度": "通信模式", "MCP": "请求-响应", "A2A": "异步协作", "NLWeb": "自然语言接口"},
    {"维度": "主要用途", "MCP": "调用外部工具和资源", "A2A": "多 Agent 任务协作", "NLWeb": "用对话访问网站"},
    {"维度": "发现机制", "MCP": "配置文件", "A2A": "Agent Card", "NLWeb": "结构化数据"},
    {"维度": "状态管理", "MCP": "无状态", "A2A": "有状态", "NLWeb": "无状态"},
    {"维度": "成熟度", "MCP": "高（Claude 原生支持）", "A2A": "中（Google 推动）", "NLWeb": "低（早期阶段）"},
    {"维度": "类比", "MCP": "电话（直接调用）", "A2A": "对讲机（对话协作）", "NLWeb": "网站（信息浏览）"},
]

# 打印对比表
print(f"\n{'维度':<10} | {'MCP':<25} | {'A2A':<25} | {'NLWeb':<25}")
print("-" * 90)
for row in comparison_data:
    print(f"{row['维度']:<10} | {row['MCP']:<25} | {row['A2A']:<25} | {row['NLWeb']:<25}")


# ========== 2. 协议选型指南 ==========
print("\n" + "=" * 60)
print("2. 协议选型指南")
print("=" * 60)

selection_guide = """
场景 → 推荐协议:

1. 让 LLM 调用你的 API
   → MCP（最成熟，Claude 原生支持）

2. 构建多 Agent 协作系统
   → A2A（专门设计，支持 Agent 发现）

3. 让网站支持自然语言交互
   → NLWeb（结构化数据，易于集成）

4. 混合场景（工具调用 + Agent 协作）
   → MCP + A2A

5. 快速原型开发
   → MCP（生态最完善，文档最多）
"""
print(selection_guide)


# ========== 3. 多协议集成示例 ==========
print("=" * 60)
print("3. 多协议集成示例")
print("=" * 60)


@dataclass
class AgentCard:
    """Agent 名片"""
    name: str
    description: str
    url: str
    capabilities: List[str] = field(default_factory=list)
    skills: List[Dict] = field(default_factory=list)


class MultiProtocolAgent:
    """支持多协议的 Agent"""

    def __init__(self, name: str):
        self.name = name
        self.mcp_servers: Dict[str, List[Dict]] = {}
        self.a2a_agents: Dict[str, AgentCard] = {}
        self.nlweb_sites: Dict[str, dict] = {}

    def register_mcp_server(self, name: str, tools: List[Dict]):
        """注册 MCP 服务器"""
        self.mcp_servers[name] = tools
        print(f"  [MCP] 注册服务器: {name}, 工具数: {len(tools)}")

    def register_a2a_agent(self, name: str, card: AgentCard):
        """注册 A2A Agent"""
        self.a2a_agents[name] = card
        print(f"  [A2A] 注册 Agent: {name}")

    def register_nlweb_site(self, name: str, manifest: dict):
        """注册 NLWeb 网站"""
        self.nlweb_sites[name] = manifest
        print(f"  [NLWeb] 注册网站: {name}")

    def call_mcp_tool(self, server: str, tool: str, args: dict) -> dict:
        """调用 MCP 工具"""
        if server in self.mcp_servers:
            return {"result": f"MCP 工具 {tool} 执行成功", "args": args}
        return {"error": f"服务器 {server} 不存在"}

    def collaborate_with_agent(self, agent_name: str, task: str) -> dict:
        """与 A2A Agent 协作"""
        if agent_name in self.a2a_agents:
            card = self.a2a_agents[agent_name]
            return {"status": "collaborating", "agent": card.name, "task": task}
        return {"error": f"Agent {agent_name} 不存在"}

    def query_nlweb_site(self, site_name: str, endpoint: str, params: dict) -> dict:
        """查询 NLWeb 网站"""
        if site_name in self.nlweb_sites:
            return {"result": f"NLWeb 查询 {endpoint} 成功", "params": params}
        return {"error": f"网站 {site_name} 不存在"}


# 使用多协议 Agent
agent = MultiProtocolAgent("MultiAgent")

# 注册各种协议
print("\n注册协议:")
agent.register_mcp_server("weather", [{"name": "get_weather"}, {"name": "get_forecast"}])
agent.register_a2a_agent("researcher", AgentCard(
    name="researcher",
    description="研究 Agent",
    url="http://localhost:8080/researcher",
))
agent.register_nlweb_site("bookstore", {"name": "在线书店"})

# 测试多协议调用
print("\n测试多协议调用:")
print(json.dumps(agent.call_mcp_tool("weather", "get_weather", {"city": "北京"}), ensure_ascii=False))
print(json.dumps(agent.collaborate_with_agent("researcher", "搜索 Python 信息"), ensure_ascii=False))
print(json.dumps(agent.query_nlweb_site("bookstore", "/books/search", {"query": "Python"}), ensure_ascii=False))


# ========== 4. 协议发展趋势 ==========
print("\n" + "=" * 60)
print("4. 协议发展趋势")
print("=" * 60)

trends = """
当前状态:
  MCP: 生态最完善，Claude 原生支持，社区活跃
  A2A: Google 推动，多 Agent 场景前景广阔
  NLWeb: Web 集成方向，但生态还在早期

未来趋势:
  1. 三大协议可能走向融合
  2. 标准化是必然趋势
  3. MCP 可能成为事实标准
  4. A2A 在企业级应用中有巨大潜力
  5. NLWeb 可能与 MCP 整合

选型建议:
  - 初学者: 从 MCP 开始
  - 多 Agent 场景: 考虑 A2A
  - Web 集成: 考虑 NLWeb
  - 生产环境: 优先 MCP（成熟度最高）
"""
print(trends)
```

## 📤 预期输出

运行完整代码的关键输出：

```
============================================================
1. A2A 协议核心概念
============================================================
A2A (Agent-to-Agent) 协议:
  由 Google 提出，用于 Agent 之间的通信和协作。

核心概念:
  Agent Card: Agent 的"名片"，描述能力和技能
  Task: Agent 间协作的任务单元（有状态）
  Message: Agent 间的通信消息（包含 Part）
  Artifact: 任务产出的结果（包含 Part）

============================================================
2. Agent Card（Agent 名片）
============================================================
Agent Card 示例:
{
  "name": "researcher",
  "description": "专业的研究和信息收集 Agent...",
  "url": "http://localhost:8080/agents/researcher",
  "capabilities": ["text_generation", "web_search", "summarization"],
  "skills": [...]
}

============================================================
3. 三大协议对比
============================================================
维度       | MCP                      | A2A                      | NLWeb
----------------------------------------------------------------------
全称       | Model Context Protocol   | Agent-to-Agent           | Natural Language Web
提出者     | Anthropic                | Google                   | Microsoft
定位       | LLM ↔ 工具              | Agent ↔ Agent            | LLM ↔ Web 服务
成熟度     | 高（Claude 原生支持）    | 中（Google 推动）        | 低（早期阶段）
```

## ⚠️ 常见错误与解决方案

| # | 错误信息 | 原因 | 解决方案 |
|---|---------|------|---------|
| 1 | A2A 概念混淆 | Agent Card 与 Task 概念不清 | 记住：Card 是名片，Task 是任务单元 |
| 2 | NLWeb 理解困难 | 不熟悉结构化数据 | 先学习 JSON-LD 基础 |
| 3 | 三大协议搞混 | 定位不清晰 | MCP=工具，A2A=Agent，NLWeb=Web |
| 4 | 不知道选哪个 | 缺乏选型经验 | 优先 MCP（最成熟），多 Agent 用 A2A |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| MCP | LLM 与工具的通信标准（Anthropic） |
| A2A | Agent 间通信标准（Google） |
| NLWeb | 自然语言 Web 接口标准（Microsoft） |
| Agent Card | A2A 中 Agent 的"名片"，描述能力 |
| Task | A2A 中 Agent 间协作的任务单元 |
| Artifact | 任务产出的结果 |
| NLWeb Manifest | 网站的自然语言接口描述文件 |

## 🏋️ 每日挑战

### 挑战 1：扩展 A2A Agent（难度：⭐）

创建一个新的 A2A Agent，比如"翻译 Agent"，支持中英翻译和中日翻译。

### 挑战 2：添加 NLWeb 端点（难度：⭐⭐）

为在线书店添加一个 `get_recommendations` 端点，根据用户喜好推荐书籍。

### 挑战 3：实现 Agent 间协作（难度：⭐⭐⭐）

实现两个 A2A Agent 之间的实际协作流程：研究 Agent 搜索信息，总结 Agent 整理结果。

### 挑战 4：协议选择练习（难度：⭐）

为以下场景选择合适的协议并说明理由：
- 让 AI 助手读取你的邮件
- 构建一个由多个专家组成的 AI 团队
- 让 AI 能直接在电商网站下单

## ✅ 验收清单

- [ ] 能说出三大协议的定位和区别
- [ ] 理解 A2A 的 Agent Card 和 Task 概念
- [ ] 能实现一个 A2A Agent
- [ ] 理解 NLWeb 的工作原理
- [ ] 能根据场景选择合适的协议
- [ ] 代码能正确运行并输出预期结果

## 📝 复盘小纸条

- 今天最大的收获: ...
- 还不太确定的: ...

---

> 💡 **学习建议**：A2A 协议仍在快速演进中，建议关注 Google 官方的 [A2A GitHub 仓库](https://github.com/google/A2A) 获取最新信息。
