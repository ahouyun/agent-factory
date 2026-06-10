# 📅 Week 9 Day 6：端到端联调

## 🧭 今日方向
> 将所有模块串联起来，进行端到端的联调测试。确保从用户输入到最终输出的完整流程能正常运行。

## 🎯 生活比喻
> 今天的工作就像"新车下线前的最终测试"。发动机（LLM）、变速箱（RAG）、刹车（安全）都已经装好了，现在要确保它们能协调工作。

## 📋 今日三件事
1. 整合所有服务模块
2. 进行端到端测试
3. 修复发现的问题

## 🗺️ 手把手路线

### Step 1: 模块整合
- 做什么: 将 RAG、Agent、安全层整合为完整系统
- 为什么: 各模块独立工作不代表整体正常
- 成功标志: 所有模块能协同工作

### Step 2: 测试场景
- 做什么: 设计和执行测试用例
- 为什么: 测试是发现问题的最有效方式
- 成功标志: 主要场景测试通过

### Step 3: 问题修复
- 做什么: 修复测试中发现的问题
- 为什么: 确保系统稳定可靠
- 成功标志: 系统能正常运行

## 💻 代码区

```python
"""
Week 9 Day 6: 端到端联调
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import json

# ========== 1. 系统整合 ==========
print("=== 1. 系统整合 ===")

@dataclass
class SystemConfig:
    """系统配置"""
    app_name: str = "AI Agent 知识助手"
    version: str = "1.0.0"
    debug: bool = False
    max_history: int = 10
    rag_top_k: int = 3

class IntegratedSystem:
    """集成系统"""

    def __init__(self, config: SystemConfig = None):
        self.config = config or SystemConfig()
        self.initialized = False

        # 模拟各模块
        self.rag_service = None
        self.agent = None
        self.security = None

    def initialize(self):
        """初始化系统"""
        print("  初始化 RAG 服务...")
        self.rag_service = MockRAGService()

        print("  初始化 Agent...")
        self.agent = MockAgent(self.rag_service)

        print("  初始化安全层...")
        self.security = MockSecurity()

        self.initialized = True
        print(f"  系统初始化完成: {self.config.app_name} v{self.config.version}")

    def process_request(self, user_id: str, message: str) -> dict:
        """处理请求"""
        if not self.initialized:
            return {"error": "系统未初始化", "status": 500}

        # 1. 安全检查
        security_check = self.security.check_input(message)
        if not security_check["valid"]:
            return {"error": "输入验证失败", "status": 400}

        # 2. Agent 处理
        response = self.agent.process(user_id, message)

        # 3. 输出过滤
        filtered_response = self.security.filter_output(response["message"])

        return {
            "status": 200,
            "response": filtered_response,
            "metadata": response.get("metadata", {})
        }

class MockRAGService:
    """模拟 RAG 服务"""
    def retrieve(self, query: str, k: int = 3) -> List[dict]:
        return [{"content": f"关于 '{query}' 的文档内容", "score": 0.9}]

class MockAgent:
    """模拟 Agent"""
    def __init__(self, rag_service):
        self.rag_service = rag_service
        self.conversations = {}

    def process(self, user_id: str, message: str) -> dict:
        # 获取或创建对话上下文
        if user_id not in self.conversations:
            self.conversations[user_id] = []

        # 记录用户消息
        self.conversations[user_id].append({"role": "user", "content": message})

        # 检索文档
        docs = self.rag_service.retrieve(message)

        # 生成回答
        answer = f"基于文档内容，关于 '{message}' 的回答：{docs[0]['content']}"

        # 记录助手消息
        self.conversations[user_id].append({"role": "assistant", "content": answer})

        return {
            "message": answer,
            "metadata": {"sources": docs, "conversation_length": len(self.conversations[user_id])}
        }

class MockSecurity:
    """模拟安全层"""
    def check_input(self, message: str) -> dict:
        if len(message) > 5000:
            return {"valid": False, "reason": "输入过长"}
        return {"valid": True}

    def filter_output(self, message: str) -> str:
        # 简单过滤
        return message

# 创建集成系统
system = IntegratedSystem()
system.initialize()

# ========== 2. 测试场景 ==========
print("\n=== 2. 测试场景 ===")

test_scenarios = [
    {
        "name": "基本问答",
        "user_id": "user_001",
        "message": "Python 是什么？",
        "expected": "应该返回相关文档内容"
    },
    {
        "name": "多轮对话",
        "user_id": "user_001",
        "message": "它有什么特点？",
        "expected": "应该基于上下文回答"
    },
    {
        "name": "新用户",
        "user_id": "user_002",
        "message": "你好",
        "expected": "应该返回欢迎信息"
    },
    {
        "name": "长输入",
        "user_id": "user_003",
        "message": "测试 " * 2000,
        "expected": "应该被安全层拦截"
    },
]

print("测试用例:")
for i, scenario in enumerate(test_scenarios, 1):
    print(f"  {i}. {scenario['name']}: {scenario['expected']}")

# ========== 3. 执行测试 ==========
print("\n=== 3. 执行测试 ===")

results = []
for scenario in test_scenarios:
    print(f"\n测试: {scenario['name']}")
    print(f"  输入: {scenario['message'][:50]}...")

    result = system.process_request(scenario["user_id"], scenario["message"])
    results.append({"scenario": scenario["name"], "result": result})

    print(f"  状态: {result['status']}")
    if result["status"] == 200:
        print(f"  响应: {result['response'][:80]}...")
    else:
        print(f"  错误: {result.get('error', '未知错误')}")

# ========== 4. 测试报告 ==========
print("\n=== 4. 测试报告 ===")

passed = sum(1 for r in results if r["result"]["status"] == 200)
failed = len(results) - passed

print(f"测试总数: {len(results)}")
print(f"通过: {passed}")
print(f"失败: {failed}")
print(f"通过率: {passed/len(results)*100:.1f}%")

print("\n详细结果:")
for r in results:
    status = "PASS" if r["result"]["status"] == 200 else "FAIL"
    print(f"  [{status}] {r['scenario']}")

# ========== 5. API 测试 ==========
print("\n=== 5. API 测试 ===")

print("""
API 端点测试:

1. 健康检查
   GET /api/health
   预期: { "status": "ok", "version": "1.0.0" }

2. 用户注册
   POST /api/auth/register
   预期: { "id": "user_xxx", "email": "..." }

3. 上传文档
   POST /api/documents
   预期: { "id": "doc_xxx", "name": "..." }

4. 发送消息
   POST /api/conversations/{id}/messages
   预期: { "response": "...", "sources": [...] }

5. 搜索文档
   GET /api/rag/search?query=xxx
   预期: [{ "content": "...", "score": 0.9 }]
""")

# ========== 6. 问题清单 ==========
print("\n=== 6. 问题清单 ===")

issues = [
    {"id": 1, "severity": "高", "description": "长输入处理超时", "status": "待修复"},
    {"id": 2, "severity": "中", "description": "对话历史未持久化", "status": "待优化"},
    {"id": 3, "severity": "低", "description": "错误提示不够友好", "status": "待改进"},
]

print("发现的问题:")
for issue in issues:
    print(f"  #{issue['id']} [{issue['severity']}] {issue['description']} - {issue['status']}")

# ========== 7. 修复计划 ==========
print("\n=== 7. 修复计划 ===")

fix_plan = """
修复优先级:

1. 高优先级:
   - 长输入处理: 添加超时机制
   - 安全检查优化: 缓存验证结果

2. 中优先级:
   - 对话持久化: 集成 Redis
   - 响应优化: 添加缓存

3. 低优先级:
   - 错误提示优化
   - 日志记录完善
"""
print(fix_plan)

# ========== 8. 部署准备 ==========
print("\n=== 8. 部署准备 ===")

print("""
部署检查清单:

环境准备:
  [ ] Python 3.10+
  [ ] PostgreSQL 数据库
  [ ] Redis 缓存
  [ ] OpenAI API 密钥

配置文件:
  [ ] .env 环境变量
  [ ] 数据库连接配置
  [ ] Redis 连接配置

依赖安装:
  [ ] pip install -r requirements.txt
  [ ] 数据库迁移: alembic upgrade head

启动命令:
  [ ] uvicorn app.main:app --host 0.0.0.0 --port 8000
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 模块间通信失败 | 检查接口定义和数据格式 |
| 2 | 测试超时 | 增加超时时间，或优化性能 |
| 3 | 内存溢出 | 限制并发数，添加缓存 |
| 4 | 错误信息不清晰 | 添加详细日志 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| 端到端测试 | 测试完整用户流程 |
| 集成测试 | 测试模块间协作 |
| 联调 | 多个团队/模块协同调试 |
| 测试用例 | 验证功能的测试场景 |
| 通过率 | 测试通过的比例 |
| 问题清单 | 发现的所有问题列表 |

## ✅ 验收清单
- [ ] 所有模块已整合
- [ ] 主要测试场景通过
- [ ] 问题已记录和分级
- [ ] 部署准备完成
- [ ] 系统能正常运行

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
