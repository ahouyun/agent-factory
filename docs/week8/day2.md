# 📅 Week 8 Day 2：A2A + NLWeb 协议：三大协议

## 🧭 今日方向
> 除了 MCP，还有 Google 的 A2A（Agent-to-Agent）和 NLWeb 协议。今天对比三大协议的定位和差异，理解"协议生态"全貌。

## 🎯 生乐比喻
> 三大协议就像三种通信方式：
> - **MCP** = 电话（LLM 直接调用工具）
> - **A2A** = 对讲机（Agent 之间对话协作）
> - **NLWeb** = 网站（用自然语言访问 Web 服务）

## 📋 今日三件事
1. 理解 A2A 协议：Agent 间通信标准
2. 理解 NLWeb 协议：自然语言 Web 接口
3. 对比三大协议的适用场景

## 🗺️ 手把手路线

### Step 1: A2A 协议
- 做什么: 理解 Agent 间如何发现和协作
- 为什么: 多 Agent 系统需要标准化通信
- 成功标志: 能说出 A2A 的核心流程

### Step 2: NLWeb 协议
- 做什么: 理解如何让网站支持自然语言交互
- 为什么: Web 是最大的信息源
- 成功标志: 能说出 NLWeb 的工作原理

### Step 3: 三大协议对比
- 做什么: 制作对比表格，理解各自定位
- 为什么: 正确选型需要理解差异
- 成功标志: 能根据场景选择合适的协议

## 💻 代码区

```python
"""
Week 8 Day 2: A2A + NLWeb 协议
"""

import json
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime

# ========== 1. A2A 协议（Agent-to-Agent）==========
print("=== 1. A2A 协议 ===")

print("""
A2A (Agent-to-Agent) 协议:
由 Google 提出，用于 Agent 之间的通信和协作。

核心概念:
- Agent Card: Agent 的"名片"，描述能力
- Task: Agent 间协作的任务单元
- Message: Agent 间的通信消息
- Artifact: 任务产出的结果

工作流程:
1. 发现: Agent 通过 Agent Card 发现其他 Agent
2. 协商: Agent 间协商任务分工
3. 执行: 各 Agent 执行自己的任务
4. 交付: 返回结果（Artifact）
""")

@dataclass
class AgentCard:
    """Agent 名片（A2A 核心概念）"""
    name: str
    description: str
    url: str
    capabilities: List[str]
    skills: List[Dict]

    def to_dict(self):
        return {
            "name": self.name,
            "description": self.description,
            "url": self.url,
            "capabilities": self.capabilities,
            "skills": self.skills
        }

@dataclass
class A2ATask:
    """A2A 任务"""
    task_id: str
    status: str  # pending/running/completed/failed
    messages: List[Dict]
    artifacts: List[Dict]
    created_at: str

class A2AAgent:
    """A2A Agent 实现"""

    def __init__(self, name: str, description: str, skills: List[Dict]):
        self.name = name
        self.description = description
        self.skills = skills
        self.tasks = {}

    def get_agent_card(self) -> AgentCard:
        """获取 Agent 名片"""
        return AgentCard(
            name=self.name,
            description=self.description,
            url=f"http://localhost:8080/agents/{self.name}",
            capabilities=["text_generation", "task_execution"],
            skills=self.skills
        )

    def create_task(self, skill_name: str, input_data: dict) -> A2ATask:
        """创建任务"""
        task_id = f"task_{len(self.tasks) + 1}"
        task = A2ATask(
            task_id=task_id,
            status="pending",
            messages=[{"role": "user", "content": json.dumps(input_data)}],
            artifacts=[],
            created_at=datetime.now().isoformat()
        )
        self.tasks[task_id] = task
        return task

    def execute_task(self, task_id: str) -> A2ATask:
        """执行任务"""
        task = self.tasks[task_id]
        task.status = "running"

        # 模拟执行
        task.artifacts.append({
            "type": "text",
            "content": f"任务 {task_id} 已完成"
        })
        task.status = "completed"

        return task

# 创建 A2A Agent
research_agent = A2AAgent(
    name="researcher",
    description="研究和信息收集 Agent",
    skills=[
        {"name": "web_search", "description": "搜索网页信息"},
        {"name": "summarize", "description": "总结文档内容"}
    ]
)

# 获取 Agent 名片
card = research_agent.get_agent_card()
print("Agent Card:")
print(json.dumps(card.to_dict(), indent=2, ensure_ascii=False))

# 创建和执行任务
task = research_agent.create_task("web_search", {"query": "Python 最新版本"})
print(f"\n创建任务: {task.task_id}")
task = research_agent.execute_task(task.task_id)
print(f"任务状态: {task.status}")
print(f"结果: {task.artifacts}")

# ========== 2. NLWeb 协议 ==========
print("\n=== 2. NLWeb 协议 ===")

print("""
NLWeb (Natural Language Web) 协议:
让网站支持自然语言交互的标准。

核心思想:
- 网站通过结构化数据（JSON-LD）暴露能力
- LLM 通过自然语言理解网站功能
- 用户可以用对话方式与网站交互

工作流程:
1. 网站提供 NLWeb 描述文件
2. LLM 解析描述，理解网站能力
3. 用户用自然语言提出需求
4. LLM 将需求转换为 API 调用
5. 返回结果给用户
""")

@dataclass
class NLWebEndpoint:
    """NLWeb 端点描述"""
    name: str
    description: str
    url: str
    method: str
    parameters: List[Dict]
    examples: List[Dict]

class NLWebSite:
    """NLWeb 网站实现"""

    def __init__(self, name: str, base_url: str):
        self.name = name
        self.base_url = base_url
        self.endpoints = []

    def add_endpoint(self, endpoint: NLWebEndpoint):
        """添加端点"""
        self.endpoints.append(endpoint)

    def generate_nlweb_manifest(self) -> dict:
        """生成 NLWeb 清单文件"""
        return {
            "@context": "https://nlweb.io/context",
            "@type": "WebSite",
            "name": self.name,
            "url": self.base_url,
            "endpoints": [
                {
                    "name": ep.name,
                    "description": ep.description,
                    "url": f"{self.base_url}{ep.url}",
                    "method": ep.method,
                    "parameters": ep.parameters,
                    "examples": ep.examples
                }
                for ep in self.endpoints
            ]
        }

# 创建 NLWeb 网站
bookstore = NLWebSite("在线书店", "https://api.bookstore.com")

# 添加端点
bookstore.add_endpoint(NLWebEndpoint(
    name="search_books",
    description="搜索书籍",
    url="/books/search",
    method="GET",
    parameters=[
        {"name": "query", "type": "string", "description": "搜索关键词"},
        {"name": "category", "type": "string", "description": "书籍类别"}
    ],
    examples=[
        {"query": "Python", "category": "编程"},
        {"query": "小说", "category": "文学"}
    ]
))

bookstore.add_endpoint(NLWebEndpoint(
    name="get_book_details",
    description="获取书籍详情",
    url="/books/{id}",
    method="GET",
    parameters=[
        {"name": "id", "type": "string", "description": "书籍 ID"}
    ],
    examples=[{"id": "book_123"}]
))

# 生成清单
manifest = bookstore.generate_nlweb_manifest()
print("NLWeb Manifest:")
print(json.dumps(manifest, indent=2, ensure_ascii=False))

# ========== 3. 三大协议对比 ==========
print("\n=== 3. 三大协议对比 ===")

comparison = {
    "维度": ["全称", "提出者", "定位", "通信模式", "主要用途", "发现机制", "类比"],
    "MCP": [
        "Model Context Protocol",
        "Anthropic",
        "LLM ↔ 工具",
        "请求-响应",
        "调用外部工具和资源",
        "配置文件",
        "电话（直接调用）"
    ],
    "A2A": [
        "Agent-to-Agent",
        "Google",
        "Agent ↔ Agent",
        "异步协作",
        "多 Agent 任务协作",
        "Agent Card",
        "对讲机（对话协作）"
    ],
    "NLWeb": [
        "Natural Language Web",
        "Microsoft",
        "LLM ↔ Web 服务",
        "自然语言接口",
        "用对话访问网站",
        "结构化数据",
        "网站（信息浏览）"
    ]
}

# 打印对比表
print("\n" + "="*60)
for i, dimension in enumerate(comparison["维度"]):
    mcp_val = comparison["MCP"][i]
    a2a_val = comparison["A2A"][i]
    nlweb_val = comparison["NLWeb"][i]
    print(f"{dimension:10} | MCP: {mcp_val:20} | A2A: {a2a_val:20} | NLWeb: {nlweb_val}")

# ========== 4. 协议选型指南 ==========
print("\n=== 4. 协议选型指南 ===")

print("""
场景 → 推荐协议:

1. 让 LLM 调用你的 API
   → MCP（最成熟，Claude 原生支持）

2. 构建多 Agent 协作系统
   → A2A（专门设计，支持 Agent 发现）

3. 让网站支持自然语言交互
   → NLWeb（结构化数据，易于集成）

4. 混合场景
   → MCP + A2A（工具调用 + Agent 协作）

5. 快速原型
   → MCP（生态最完善，文档最多）
""")

# ========== 5. 协议集成示例 ==========
print("\n=== 5. 协议集成示例 ===")

class MultiProtocolAgent:
    """支持多协议的 Agent"""

    def __init__(self, name: str):
        self.name = name
        self.mcp_servers = {}  # MCP 工具
        self.a2a_agents = {}   # A2A 协作 Agent
        self.nlweb_sites = {}  # NLWeb 网站

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

    def call_mcp_tool(self, server: str, tool: str, args: dict):
        """调用 MCP 工具"""
        if server in self.mcp_servers:
            # 模拟调用
            return {"result": f"MCP 工具 {tool} 执行成功"}
        return {"error": f"服务器 {server} 不存在"}

    def collaborate_with_agent(self, agent_name: str, task: str):
        """与 A2A Agent 协作"""
        if agent_name in self.a2a_agents:
            card = self.a2a_agents[agent_name]
            return {"status": "collaborating", "agent": card.name}
        return {"error": f"Agent {agent_name} 不存在"}

    def query_nlweb_site(self, site_name: str, endpoint: str, params: dict):
        """查询 NLWeb 网站"""
        if site_name in self.nlweb_sites:
            return {"result": f"NLWeb 查询 {endpoint} 成功"}
        return {"error": f"网站 {site_name} 不存在"}

# 使用多协议 Agent
agent = MultiProtocolAgent("MultiAgent")

# 注册各种协议
agent.register_mcp_server("weather", [{"name": "get_weather"}])
agent.register_a2a_agent("researcher", research_agent.get_agent_card())
agent.register_nlweb_site("bookstore", manifest)

# 测试
print("\n测试多协议调用:")
print(agent.call_mcp_tool("weather", "get_weather", {"city": "北京"}))
print(agent.collaborate_with_agent("researcher", "搜索 Python 信息"))
print(agent.query_nlweb_site("bookstore", "/books/search", {"query": "Python"}))

print("""
=== 协议发展趋势 ===

1. MCP: 生态最完善，Claude 原生支持，社区活跃
2. A2A: Google 推动，多 Agent 场景前景广阔
3. NLWeb: Web 集成方向，但生态还在早期

未来趋势:
- 三大协议可能走向融合
- 标准化是必然趋势
- 选择哪个取决于具体场景
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | A2A 概念混淆 | 记住：A2A 是 Agent 间通信，不是 Agent 与用户 |
| 2 | NLWeb 理解困难 | 先理解结构化数据（JSON-LD）的概念 |
| 3 | 三大协议搞混 | MCP=工具，A2A=Agent，NLWeb=Web |
| 4 | 不知道选哪个 | 优先 MCP（最成熟），多 Agent 用 A2A |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| MCP | LLM 与工具的通信标准（Anthropic）|
| A2A | Agent 间通信标准（Google）|
| NLWeb | 自然语言 Web 接口标准（Microsoft）|
| Agent Card | A2A 中 Agent 的"名片"，描述能力 |
| Task | A2A 中 Agent 间协作的任务单元 |
| Artifact | 任务产出的结果 |
| NLWeb Manifest | 网站的自然语言接口描述文件 |
| JSON-LD | 基于 JSON 的结构化数据格式 |

## ✅ 验收清单
- [ ] 能说出三大协议的定位和区别
- [ ] 理解 A2A 的 Agent Card 和 Task 概念
- [ ] 理解 NLWeb 的工作原理
- [ ] 能根据场景选择合适的协议
- [ ] 理解多协议集成的思路
- [ ] 能说出至少 2 个协议的发展趋势

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
