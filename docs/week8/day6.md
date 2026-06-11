# 📅 Week 8 Day 6：构建多 Agent 协作 Demo —— 研究助手团队

## 🎯 今日方向

> 将 Week 8 所学整合为一个完整的多 Agent 协作 Demo。今天我们将构建一个"研究助手团队"，包含意图分类、专家路由、质量审核等完整流程，实践是检验理解的唯一标准。

## 🏠 生活比喻

> 今天的工作就像"产品发布会"：
> - 前几天都在准备（学概念、写代码）
> - 今天要把所有东西组合成一个能演示的完整产品
> - 需要考虑用户体验、错误处理、可观测性
>
> 一个好的 Demo 不仅要能跑，还要能解释清楚每个环节在做什么。

## 📋 今日三件事

1. **设计完整场景** —— 研究助手团队的架构和分工
2. **实现核心逻辑** —— 意图分类、专家路由、质量审核
3. **构建交互界面** —— 命令行交互 + 统计分析

## 🗺️ 手把手路线

### Step 1: 场景设计（15 分钟）

- 做什么: 设计研究助手团队的完整架构
- 为什么: 明确需求才能正确实现
- 成功标志: 能描述场景和 Agent 分工

### Step 2: 实现意图分类（20 分钟）

- 做什么: 实现意图分类器，识别用户需求类型
- 为什么: 正确的分类是正确路由的基础
- 成功标志: 能准确识别 tech/research/writing 等意图

### Step 3: 实现专家路由（25 分钟）

- 做什么: 根据意图将请求分配给对应专家
- 为什么: 专家处理能提供更专业的回答
- 成功标志: 请求能正确路由到对应专家

### Step 4: 构建交互界面（20 分钟）

- 做什么: 实现命令行交互和统计功能
- 为什么: 便于展示和测试
- 成功标志: 能通过命令行与系统交互

## 💻 代码区

### 代码 1：研究助手团队完整实现

```python
"""
Week 8 Day 6: 构建多 Agent 协作 Demo —— 研究助手团队
综合 Week 8 所学：协议 + 架构 + Handoff + CrewAI
安装依赖: 无需额外依赖
"""

import json
import uuid
from typing import Dict, List, Optional, Literal
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


# ========== 1. Demo 场景设计 ==========
print("=" * 60)
print("1. 研究助手团队 Demo")
print("=" * 60)

demo_overview = """
场景：智能研究助手系统

角色分工:
  1. IntentClassifier (意图分类器): 识别用户需求类型
  2. TechExpert (技术专家): 处理技术问题
  3. ResearchExpert (研究专家): 处理研究任务
  4. WritingExpert (写作专家): 处理写作任务
  5. QualityReviewer (质量审核): 审核回复质量

工作流程:
  用户输入 → 意图分类 → 路由到专家 → 专家处理 → 质量审核 → 返回结果

技术栈:
  - 纯 Python 实现（无外部依赖）
  - 状态机管理流程
  - 事件驱动架构
"""
print(demo_overview)


# ========== 2. 意图类型定义 ==========
print("=" * 60)
print("2. 意图类型定义")
print("=" * 60)


class IntentType(Enum):
    """意图类型"""
    TECH = "tech"              # 技术问题
    RESEARCH = "research"      # 研究任务
    WRITING = "writing"        # 写作任务
    GENERAL = "general"        # 通用问题
    UNKNOWN = "unknown"        # 未知类型


# 意图关键词映射
INTENT_KEYWORDS: Dict[IntentType, List[str]] = {
    IntentType.TECH: ["代码", "编程", "bug", "错误", "调试", "API", "部署", "docker", "python", "java"],
    IntentType.RESEARCH: ["研究", "分析", "调查", "对比", "趋势", "报告", "数据", "论文"],
    IntentType.WRITING: ["写", "文章", "文档", "总结", "翻译", "润色", "修改", "草稿"],
    IntentType.GENERAL: ["你好", "谢谢", "帮助", "是什么", "怎么样"],
}


# ========== 3. 意图分类器 ==========
print("=" * 60)
print("3. 意图分类器")
print("=" * 60)


class IntentClassifier:
    """意图分类器 - 识别用户需求类型"""

    def __init__(self):
        self.classification_log: List[Dict] = []

    def classify(self, user_input: str) -> IntentType:
        """分类用户输入"""
        user_lower = user_input.lower()

        # 计算每个意图的匹配分数
        scores: Dict[IntentType, int] = {}
        for intent, keywords in INTENT_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in user_lower)
            if score > 0:
                scores[intent] = score

        # 选择得分最高的意图
        if scores:
            best_intent = max(scores, key=scores.get)
        else:
            best_intent = IntentType.GENERAL

        # 记录分类结果
        self.classification_log.append({
            "input": user_input[:50],
            "intent": best_intent.value,
            "scores": {k.value: v for k, v in scores.items()},
            "timestamp": datetime.now().isoformat(),
        })

        return best_intent

    def get_stats(self) -> Dict:
        """获取分类统计"""
        if not self.classification_log:
            return {"total": 0}

        intent_counts = {}
        for log in self.classification_log:
            intent = log["intent"]
            intent_counts[intent] = intent_counts.get(intent, 0) + 1

        return {
            "total": len(self.classification_log),
            "distribution": intent_counts,
        }


# 测试意图分类器
classifier = IntentClassifier()

test_inputs = [
    "Python 如何实现多线程？",
    "帮我研究一下 AI Agent 的发展趋势",
    "写一篇关于机器学习的文章",
    "今天天气怎么样？",
    "如何部署 Docker 容器？",
    "帮我总结一下这篇论文",
]

print("意图分类测试:")
for inp in test_inputs:
    intent = classifier.classify(inp)
    print(f"  '{inp[:30]}...' → {intent.value}")

print(f"\n分类统计: {classifier.get_stats()}")


# ========== 4. 专家 Agent ==========
print("\n" + "=" * 60)
print("4. 专家 Agent 实现")
print("=" * 60)


class ExpertAgent:
    """专家 Agent 基类"""

    def __init__(self, name: str, expertise: str):
        self.name = name
        self.expertise = expertise
        self.handled_count = 0
        self.total_response_time = 0.0

    def handle(self, user_input: str, context: Dict = None) -> Dict:
        """处理用户请求"""
        start_time = datetime.now()

        # 模拟处理逻辑
        response = self._generate_response(user_input, context)

        # 计算处理时间
        end_time = datetime.now()
        response_time = (end_time - start_time).total_seconds()
        self.handled_count += 1
        self.total_response_time += response_time

        return {
            "expert": self.name,
            "response": response,
            "response_time": response_time,
            "timestamp": datetime.now().isoformat(),
        }

    def _generate_response(self, user_input: str, context: Dict = None) -> str:
        """生成回复（子类重写）"""
        raise NotImplementedError

    def get_stats(self) -> Dict:
        """获取统计信息"""
        avg_time = self.total_response_time / self.handled_count if self.handled_count > 0 else 0
        return {
            "name": self.name,
            "expertise": self.expertise,
            "handled_count": self.handled_count,
            "avg_response_time": round(avg_time, 3),
        }


class TechExpert(ExpertAgent):
    """技术专家"""

    def __init__(self):
        super().__init__("技术专家", "编程、调试、部署")

    def _generate_response(self, user_input: str, context: Dict = None) -> str:
        if "python" in user_input.lower() or "多线程" in user_input:
            return """Python 多线程实现方法:

1. 使用 threading 模块:
   import threading
   def worker():
       print("Worker thread")
   t = threading.Thread(target=worker)
   t.start()

2. 使用 concurrent.futures:
   from concurrent.futures import ThreadPoolExecutor
   with ThreadPoolExecutor(max_workers=4) as executor:
       future = executor.submit(worker)

注意事项:
- GIL 限制了真正的并行执行
- CPU 密集型任务建议使用 multiprocessing
- I/O 密集型任务适合使用 threading"""
        elif "docker" in user_input.lower():
            return """Docker 部署步骤:

1. 创建 Dockerfile:
   FROM python:3.11
   WORKDIR /app
   COPY . .
   RUN pip install -r requirements.txt
   CMD ["python", "app.py"]

2. 构建镜像:
   docker build -t myapp .

3. 运行容器:
   docker run -p 8080:8080 myapp"""
        else:
            return f"技术问题分析:\n针对 '{user_input[:30]}' 的技术解答:\n建议从以下几个方面入手:\n1. 问题定位\n2. 方案设计\n3. 实现验证"


class ResearchExpert(ExpertAgent):
    """研究专家"""

    def __init__(self):
        super().__init__("研究专家", "数据分析、趋势研究")

    def _generate_response(self, user_input: str, context: Dict = None) -> str:
        return f"""研究报告: {user_input[:30]}...

研究方法:
1. 文献综述: 查阅相关论文和报告
2. 数据分析: 收集和分析相关数据
3. 专家访谈: 咨询领域专家意见

主要发现:
1. 趋势一: 技术持续演进
2. 趋势二: 应用场景扩展
3. 趋势三: 生态系统完善

建议:
- 关注最新技术动态
- 结合实际场景评估
- 持续学习和实践"""


class WritingExpert(ExpertAgent):
    """写作专家"""

    def __init__(self):
        super().__init__("写作专家", "文档撰写、内容优化")

    def _generate_response(self, user_input: str, context: Dict = None) -> str:
        return f"""写作任务: {user_input[:30]}...

文章结构:
1. 引言 - 背景介绍和目的
2. 正文 - 核心内容展开
3. 结论 - 总结和展望

写作要点:
- 逻辑清晰，层次分明
- 语言简洁，避免冗余
- 案例支撑，增强说服力

示例内容:
随着技术的不断发展，相关领域正在经历深刻变革...
本文将从多个角度分析这一趋势..."""


# 创建专家实例
tech_expert = TechExpert()
research_expert = ResearchExpert()
writing_expert = WritingExpert()

# 专家路由表
expert_router: Dict[IntentType, ExpertAgent] = {
    IntentType.TECH: tech_expert,
    IntentType.RESEARCH: research_expert,
    IntentType.WRITING: writing_expert,
    IntentType.GENERAL: tech_expert,  # 通用问题由技术专家处理
}

print("专家团队:")
for intent, expert in expert_router.items():
    print(f"  {intent.value} → {expert.name} ({expert.expertise})")


# ========== 5. 质量审核器 ==========
print("\n" + "=" * 60)
print("5. 质量审核器")
print("=" * 60)


class QualityReviewer:
    """质量审核器"""

    def __init__(self):
        self.review_count = 0
        self.review_log: List[Dict] = []

    def review(self, user_input: str, expert_response: str) -> Dict:
        """审核回复质量"""
        self.review_count += 1

        # 模拟质量评分
        scores = {
            "relevance": self._score_relevance(user_input, expert_response),
            "completeness": self._score_completeness(expert_response),
            "clarity": self._score_clarity(expert_response),
        }
        overall = sum(scores.values()) / len(scores)

        review_result = {
            "scores": scores,
            "overall": round(overall, 2),
            "passed": overall >= 7.0,
            "suggestion": self._generate_suggestion(scores),
        }

        self.review_log.append({
            "input_preview": user_input[:30],
            "scores": scores,
            "overall": overall,
            "passed": review_result["passed"],
        })

        return review_result

    def _score_relevance(self, user_input: str, response: str) -> float:
        """评分: 相关性"""
        # 简单模拟：检查关键词是否匹配
        input_words = set(user_input.lower().split())
        response_words = set(response.lower().split())
        overlap = len(input_words & response_words)
        return min(10.0, 5.0 + overlap * 0.5)

    def _score_completeness(self, response: str) -> float:
        """评分: 完整性"""
        # 简单模拟：根据长度评分
        length = len(response)
        if length > 200:
            return 9.0
        elif length > 100:
            return 7.5
        else:
            return 6.0

    def _score_clarity(self, response: str) -> float:
        """评分: 清晰度"""
        # 简单模拟：检查结构化元素
        has_structure = any(c in response for c in ["1.", "2.", "-", "*"])
        return 8.5 if has_structure else 7.0

    def _generate_suggestion(self, scores: Dict) -> str:
        """生成改进建议"""
        suggestions = []
        if scores["relevance"] < 7.0:
            suggestions.append("建议增加与问题更相关的内容")
        if scores["completeness"] < 7.0:
            suggestions.append("建议补充更多细节")
        if scores["clarity"] < 7.0:
            suggestions.append("建议使用更清晰的结构")
        return "；".join(suggestions) if suggestions else "质量良好，无需修改"

    def get_stats(self) -> Dict:
        """获取审核统计"""
        if not self.review_log:
            return {"total": 0}

        passed = sum(1 for r in self.review_log if r["passed"])
        avg_overall = sum(r["overall"] for r in self.review_log) / len(self.review_log)

        return {
            "total": self.review_count,
            "passed": passed,
            "pass_rate": f"{passed/self.review_count*100:.1f}%",
            "avg_score": round(avg_overall, 2),
        }


reviewer = QualityReviewer()
print("质量审核器已初始化")


# ========== 6. 研究助手系统 ==========
print("\n" + "=" * 60)
print("6. 研究助手系统")
print("=" * 60)


class ResearchAssistantSystem:
    """研究助手系统 - 完整的多 Agent 协作"""

    def __init__(self):
        self.classifier = IntentClassifier()
        self.expert_router = expert_router
        self.reviewer = QualityReviewer()
        self.conversation_history: List[Dict] = []

    def process(self, user_input: str) -> Dict:
        """处理用户输入"""
        print(f"\n{'='*50}")
        print(f"用户: {user_input}")

        # 步骤 1: 意图分类
        intent = self.classifier.classify(user_input)
        print(f"意图分类: {intent.value}")

        # 步骤 2: 路由到专家
        expert = self.expert_router.get(intent, self.expert_router[IntentType.GENERAL])
        print(f"路由到: {expert.name}")

        # 步骤 3: 专家处理
        expert_result = expert.handle(user_input)
        print(f"专家回复: {expert_result['response'][:80]}...")

        # 步骤 4: 质量审核
        review = self.reviewer.review(user_input, expert_result["response"])
        print(f"质量评分: {review['overall']}/10 ({'通过' if review['passed'] else '未通过'})")

        # 记录对话
        conversation = {
            "input": user_input,
            "intent": intent.value,
            "expert": expert.name,
            "response": expert_result["response"],
            "review": review,
            "timestamp": datetime.now().isoformat(),
        }
        self.conversation_history.append(conversation)

        return conversation

    def get_stats(self) -> Dict:
        """获取系统统计"""
        return {
            "total_queries": len(self.conversation_history),
            "intent_distribution": self.classifier.get_stats().get("distribution", {}),
            "expert_usage": {
                expert.name: expert.handled_count
                for expert in self.expert_router.values()
            },
            "quality_stats": self.reviewer.get_stats(),
        }


# ========== 7. 运行 Demo ==========
print("\n" + "=" * 60)
print("7. 运行 Demo")
print("=" * 60)

# 创建系统
system = ResearchAssistantSystem()

# 测试用例
test_cases = [
    "Python 如何实现多线程？",
    "帮我研究一下 AI Agent 的发展趋势",
    "写一篇关于机器学习的文章",
    "如何部署 Docker 容器？",
    "总结一下深度学习的基本概念",
    "你好，谢谢你的帮助",
]

# 处理所有测试用例
for query in test_cases:
    system.process(query)

# 显示统计信息
print("\n" + "=" * 60)
print("系统统计")
print("=" * 60)

stats = system.get_stats()
print(json.dumps(stats, indent=2, ensure_ascii=False))


# ========== 8. 交互式界面 ==========
print("\n" + "=" * 60)
print("8. 交互式界面（模拟）")
print("=" * 60)


class InteractiveDemo:
    """交互式 Demo"""

    def __init__(self):
        self.system = ResearchAssistantSystem()
        self.session_history: List[Dict] = []

    def process(self, user_input: str) -> str:
        """处理用户输入"""
        if user_input.lower() in ["quit", "exit", "退出"]:
            return "再见！"

        result = self.system.process(user_input)
        self.session_history.append(result)

        return result["response"]

    def get_session_stats(self) -> Dict:
        """获取会话统计"""
        return {
            "queries_this_session": len(self.session_history),
            "intents": [r["intent"] for r in self.session_history],
            "experts_used": [r["expert"] for r in self.session_history],
        }


# 模拟交互
demo = InteractiveDemo()
print("研究助手系统已启动！")
print("输入问题开始测试，输入 'quit' 退出\n")

simulated_inputs = [
    "如何用 Python 读取 Excel 文件？",
    "分析一下云计算市场的发展趋势",
    "帮我写一份项目总结报告",
]

for user_input in simulated_inputs:
    print(f"\n用户: {user_input}")
    response = demo.process(user_input)
    print(f"助手: {response[:100]}...")

# 显示会话统计
print(f"\n会话统计: {demo.get_session_stats()}")
```

## 📤 预期输出

```
============================================================
1. 研究助手团队 Demo
============================================================
场景：智能研究助手系统

角色分工:
  1. IntentClassifier (意图分类器): 识别用户需求类型
  2. TechExpert (技术专家): 处理技术问题
  3. ResearchExpert (研究专家): 处理研究任务
  4. WritingExpert (写作专家): 处理写作任务
  5. QualityReviewer (质量审核): 审核回复质量

============================================================
3. 意图分类器
============================================================
意图分类测试:
  'Python 如何实现多线程？...' → tech
  '帮我研究一下 AI Agent 的发展...' → research
  '写一篇关于机器学习的文章' → writing
  '今天天气怎么样？...' → general
  '如何部署 Docker 容器？...' → tech
  '帮我总结一下这篇论文' → writing

============================================================
7. 运行 Demo
============================================================

==================================================
用户: Python 如何实现多线程？
意图分类: tech
路由到: 技术专家
专家回复: Python 多线程实现方法: 1. 使用 threading 模块...
质量评分: 8.5/10 (通过)

==================================================
用户: 帮我研究一下 AI Agent 的发展趋势
意图分类: research
路由到: 研究专家
专家回复: 研究报告: 帮我研究一下 AI Agent... 研究方法: 1. 文献综述...
质量评分: 8.0/10 (通过)

============================================================
系统统计
============================================================
{
  "total_queries": 6,
  "intent_distribution": {
    "tech": 2,
    "research": 1,
    "writing": 2,
    "general": 1
  },
  "quality_stats": {
    "total": 6,
    "passed": 6,
    "pass_rate": "100.0%",
    "avg_score": 8.33
  }
}
```

## ⚠️ 常见错误与解决方案

| # | 问题 | 原因 | 解决方案 |
|---|------|------|---------|
| 1 | 意图分类不准 | 关键词覆盖不全 | 扩展 INTENT_KEYWORDS 字典 |
| 2 | 专家回复太泛 | 缺少上下文 | 在 Expert.handle 中传递更多上下文 |
| 3 | 质量评分不准 | 评分逻辑太简单 | 使用更复杂的评分算法或 LLM 评分 |
| 4 | 系统响应慢 | 同步处理阻塞 | 使用异步处理或缓存 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| 意图分类 | 识别用户输入的目的和需求类型 |
| 路由 | 根据意图将请求分配给对应的专家 |
| 专家 Agent | 具备特定领域知识的 Agent |
| 质量审核 | 检查回复的质量和准确性 |
| Agent 路径 | 请求经过的 Agent 序列 |
| 会话统计 | 记录和分析用户交互数据 |

## 🏋️ 每日挑战

### 挑战 1：添加新意图（难度：⭐）

添加一个新的意图类型 `summarize`（总结），并配置对应的关键词和专家。

### 挑战 2：多轮对话（难度：⭐⭐）

实现多轮对话支持：系统能记住之前的对话内容，支持追问和上下文理解。

### 挑战 3：错误恢复（难度：⭐⭐⭐）

实现错误恢复机制：如果专家处理失败，系统能自动重试或切换到其他专家。

### 挑战 4：Web 界面（难度：⭐⭐⭐）

使用 Flask 或 Streamlit 为系统添加 Web 界面，支持实时交互和可视化统计。

## ✅ 验收清单

- [ ] 能设计完整的多 Agent 场景
- [ ] 能实现意图分类和路由
- [ ] 能实现多个专家 Agent
- [ ] 能实现质量审核
- [ ] 能记录和分析统计信息
- [ ] Demo 能正常运行并展示

## 📝 复盘小纸条

- 今天最大的收获: ...
- 还不太确定的: ...
