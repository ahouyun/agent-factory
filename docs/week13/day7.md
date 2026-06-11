# Day 7: Skill 编写 + Agent 辩论 + 本地 Agent + DevOps

> **Week 13 深度选修 | 第 7 天（最后一天）**

---

## 今日方向

今天我们完成 Week 13 的收官之作：学习如何编写可复用的 Agent Skill，实现多 Agent 辩论模式，掌握本地 Agent 部署（Ollama），以及 Agent DevOps 实践。最后进行完整的周复盘。

---

## 生活比喻

想象你开了一家连锁餐厅。前六天你学会了做菜（构建组件）、开分店（案例分析），今天你要做三件事：编写标准菜谱（Skill 编写），让两个厨师互相点评菜色（Agent 辩论），把厨房搬到家门口（本地部署），最后建立标准化的供应链（DevOps）。

---

## 今日三件事

1. **学习 Skill 编写规范** — 创建可复用、可组合的 Agent 技能
2. **实现 Agent 辩论模式** — 多 Agent 观点碰撞与共识达成
3. **掌握本地 Agent + DevOps** — Ollama 部署与 CI/CD 实践

---

## 手把手路线

### 阶段一：环境准备

```bash
# 本地 Agent（可选）
# 下载并安装 Ollama: https://ollama.ai
# ollama pull llama3.1:8b

# Python 依赖
pip install pyyaml requests
```

### 阶段二：编写代码（见下方完整代码区）

---

## 代码区

```python
#!/usr/bin/env python3
"""
Day 7: Skill 编写 + Agent 辩论 + 本地 Agent + DevOps
Agent Factory Week 13 - Deep Dive Elective
"""

import json
import time
import hashlib
import yaml
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple
from enum import Enum
import os


# ============================================================
# 第一部分：Skill 编写规范
# ============================================================

@dataclass
class SkillDefinition:
    """Skill 定义"""
    name: str
    description: str
    version: str = "1.0.0"
    author: str = ""
    inputs: Dict[str, Dict] = field(default_factory=dict)
    outputs: Dict[str, Dict] = field(default_factory=dict)
    examples: List[Dict] = field(default_factory=list)
    error_handling: Dict[str, str] = field(default_factory=dict)
    tags: List[str] = field(default_factory=list)

    def to_yaml(self) -> str:
        """导出为 YAML 格式"""
        data = {
            "name": self.name,
            "description": self.description,
            "version": self.version,
            "author": self.author,
            "inputs": self.inputs,
            "outputs": self.outputs,
            "examples": self.examples,
            "error_handling": self.error_handling,
            "tags": self.tags,
        }
        return yaml.dump(data, allow_unicode=True, default_flow_style=False)

    @classmethod
    def from_yaml(cls, yaml_str: str) -> 'SkillDefinition':
        """从 YAML 加载"""
        data = yaml.safe_load(yaml_str)
        return cls(**data)

    def validate_input(self, **kwargs) -> List[str]:
        """验证输入参数"""
        errors = []
        for param_name, param_def in self.inputs.items():
            required = param_def.get("required", False)
            if required and param_name not in kwargs:
                errors.append(f"缺少必需参数: {param_name}")
        return errors

    def to_prompt(self) -> str:
        """生成 Skill 描述（用于 LLM）"""
        lines = [
            f"Skill: {self.name}",
            f"描述: {self.description}",
            f"版本: {self.version}",
            "\n输入参数:",
        ]
        for name, desc in self.inputs.items():
            req = "[必需]" if desc.get("required") else "[可选]"
            lines.append(f"  - {name} ({desc.get('type', 'any')}): {desc.get('description', '')} {req}")

        lines.append("\n输出:")
        for name, desc in self.outputs.items():
            lines.append(f"  - {name}: {desc.get('description', '')}")

        if self.examples:
            lines.append("\n示例:")
            for ex in self.examples[:2]:
                lines.append(f"  输入: {ex.get('input', '')}")
                lines.append(f"  输出: {ex.get('output', '')}")

        return "\n".join(lines)


class SkillRegistry:
    """Skill 注册表"""
    def __init__(self):
        self.skills: Dict[str, SkillDefinition] = {}
        self.functions: Dict[str, Callable] = {}

    def register(self, skill_def: SkillDefinition, func: Callable):
        """注册 Skill"""
        self.skills[skill_def.name] = skill_def
        self.functions[skill_def.name] = func
        print(f"  已注册 Skill: {skill_def.name} v{skill_def.version}")

    def execute(self, skill_name: str, **kwargs) -> Dict:
        """执行 Skill"""
        if skill_name not in self.skills:
            return {"success": False, "error": f"Skill '{skill_name}' 不存在"}

        skill = self.skills[skill_name]
        errors = skill.validate_input(**kwargs)
        if errors:
            return {"success": False, "errors": errors}

        try:
            result = self.functions[skill_name](**kwargs)
            return {"success": True, "result": result}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def list_skills(self) -> List[str]:
        return list(self.skills.keys())

    def get_skill(self, name: str) -> Optional[SkillDefinition]:
        return self.skills.get(name)


# 创建示例 Skills
print("=" * 60)
print("Skill 编写规范")
print("=" * 60)

# Skill 1: 翻译
translate_skill = SkillDefinition(
    name="translate",
    description="将文本翻译为目标语言",
    version="1.0.0",
    author="Agent Factory",
    inputs={
        "text": {"type": "str", "description": "要翻译的文本", "required": True},
        "target_lang": {"type": "str", "description": "目标语言代码", "required": True, "default": "en"},
        "source_lang": {"type": "str", "description": "源语言代码", "required": False, "default": "auto"},
    },
    outputs={
        "translated_text": {"type": "str", "description": "翻译后的文本"},
        "source_lang": {"type": "str", "description": "检测到的源语言"},
    },
    examples=[
        {"input": {"text": "你好世界", "target_lang": "en"},
         "output": {"translated_text": "Hello World", "source_lang": "zh"}},
    ],
    error_handling={
        "unsupported_language": "返回原文并标记错误",
        "text_too_long": "分段翻译后拼接",
    },
    tags=["text", "translation", "nlp"],
)

# Skill 2: 代码审查
review_skill = SkillDefinition(
    name="code_review",
    description="审查代码质量并提供建议",
    version="1.0.0",
    inputs={
        "code": {"type": "str", "description": "要审查的代码", "required": True},
        "language": {"type": "str", "description": "编程语言", "required": False, "default": "python"},
        "focus": {"type": "str", "description": "关注点(security/style/performance)", "required": False},
    },
    outputs={
        "issues": {"type": "list", "description": "发现的问题列表"},
        "suggestions": {"type": "list", "description": "改进建议"},
        "score": {"type": "float", "description": "代码质量评分 0-100"},
    },
    examples=[
        {"input": {"code": "def add(a,b): return a+b", "language": "python"},
         "output": {"issues": ["缺少类型注解"], "suggestions": ["添加类型注解"], "score": 70}},
    ],
    tags=["code", "review", "quality"],
)

# 注册 Skills
registry = SkillRegistry()
registry.register(translate_skill, lambda **kw: {"translated_text": f"[翻译] {kw.get('text', '')}", "source_lang": "zh"})
registry.register(review_skill, lambda **kw: {"issues": ["示例问题"], "suggestions": ["示例建议"], "score": 85})

print()
print(translate_skill.to_prompt())
print()

# 执行示例
result = registry.execute("translate", text="Agent Factory", target_lang="zh")
print(f"执行结果: {result}")
print()


# ============================================================
# 第二部分：Agent 辩论模式
# ============================================================

class DebateStance(Enum):
    FOR = "支持"
    AGAINST = "反对"
    NEUTRAL = "中立"


@dataclass
class DebateArgument:
    agent_name: str
    stance: DebateStance
    argument: str
    evidence: List[str] = field(default_factory=list)
    confidence: float = 0.8
    round_num: int = 0


@dataclass
class DebateVerdict:
    topic: str
    winner: Optional[str]
    consensus: str
    arguments_for: int
    arguments_against: int
    total_rounds: int


class DebateAgent:
    """辩论 Agent"""
    def __init__(self, name: str, stance: DebateStance, expertise: str = ""):
        self.name = name
        self.stance = stance
        self.expertise = expertise
        self.arguments: List[DebateArgument] = []

    def generate_argument(self, topic: str, round_num: int = 1,
                          opponent_args: List[DebateArgument] = None) -> DebateArgument:
        """生成论点"""
        # 模拟 LLM 生成论点
        if self.stance == DebateStance.FOR:
            argument = f"支持 '{topic}': 有充分的证据表明这是正确的方向"
            evidence = ["数据支持", "成功案例", "专家共识"]
        elif self.stance == DebateStance.AGAINST:
            argument = f"反对 '{topic}': 存在明显的风险和局限"
            evidence = ["失败案例", "风险分析", "成本问题"]
        else:
            argument = f"关于 '{topic}': 需要平衡考虑两方面观点"
            evidence = ["综合分析", "折中方案"]

        # 如果有对方论点，进行反驳
        if opponent_args:
            last_arg = opponent_args[-1]
            argument += f"。回应 {last_arg.agent_name}: {last_arg.argument} 的论据有待商榷"

        debate_arg = DebateArgument(
            agent_name=self.name, stance=self.stance,
            argument=argument, evidence=evidence,
            confidence=random.uniform(0.6, 0.95), round_num=round_num
        )
        self.arguments.append(debate_arg)
        return debate_arg


class DebateModerator:
    """辩论主持人"""
    def __init__(self, topic: str, max_rounds: int = 3):
        self.topic = topic
        self.max_rounds = max_rounds
        self.agents: List[DebateAgent] = []
        self.rounds: List[List[DebateArgument]] = []

    def add_agent(self, agent: DebateAgent):
        self.agents.append(agent)

    def run_debate(self) -> DebateVerdict:
        """运行完整辩论"""
        print(f"\n{'='*60}")
        print(f"辩论主题: {self.topic}")
        print(f"{'='*60}")

        for round_num in range(1, self.max_rounds + 1):
            print(f"\n--- 第 {round_num} 轮 ---")
            round_args = []

            for agent in self.agents:
                # 获取对方论点
                opponent_args = []
                for other in self.agents:
                    if other.name != agent.name and other.arguments:
                        opponent_args.extend(other.arguments)

                arg = agent.generate_argument(self.topic, round_num, opponent_args)
                round_args.append(arg)
                print(f"\n  {agent.name} ({agent.stance.value}):")
                print(f"    论点: {arg.argument}")
                print(f"    证据: {', '.join(arg.evidence)}")
                print(f"    置信度: {arg.confidence:.2f}")

            self.rounds.append(round_args)

        # 生成裁决
        return self._generate_verdict()

    def _generate_verdict(self) -> DebateVerdict:
        """生成辩论裁决"""
        all_args = [arg for round_args in self.rounds for arg in round_args]
        for_args = [a for a in all_args if a.stance == DebateStance.FOR]
        against_args = [a for a in all_args if a.stance == DebateStance.AGAINST]

        # 计算平均置信度
        avg_for = sum(a.confidence for a in for_args) / max(len(for_args), 1)
        avg_against = sum(a.confidence for a in against_args) / max(len(against_args), 1)

        if avg_for > avg_against + 0.1:
            winner = "支持方"
        elif avg_against > avg_for + 0.1:
            winner = "反对方"
        else:
            winner = "平局"

        consensus = (f"经过 {len(self.rounds)} 轮辩论，"
                    f"平均置信度: 支持={avg_for:.2f}, 反对={avg_against:.2f}")

        return DebateVerdict(
            topic=self.topic, winner=winner, consensus=consensus,
            arguments_for=len(for_args), arguments_against=len(against_args),
            total_rounds=len(self.rounds)
        )


import random  # 用于辩论中的随机性

# 运行辩论
moderator = DebateModerator("AI Agent 是否会取代传统软件开发", max_rounds=2)
moderator.add_agent(DebateAgent("Alice", DebateStance.FOR, "AI 研究"))
moderator.add_agent(DebateAgent("Bob", DebateStance.AGAINST, "软件工程"))
moderator.add_agent(DebateAgent("Carol", DebateStance.NEUTRAL, "产品管理"))

verdict = moderator.run_debate()

print(f"\n辩论结果:")
print(f"  胜方: {verdict.winner}")
print(f"  共识: {verdict.consensus}")
print(f"  支持论点: {verdict.arguments_for}, 反对论点: {verdict.arguments_against}")
print()


# ============================================================
# 第三部分：本地 Agent（Ollama 集成）
# ============================================================

class OllamaClient:
    """Ollama 本地模型客户端"""
    def __init__(self, base_url="http://localhost:11434", model="llama3.1:8b"):
        self.base_url = base_url
        self.model = model
        self.is_available = False
        self._check_availability()

    def _check_availability(self):
        """检查 Ollama 是否可用"""
        try:
            import urllib.request
            req = urllib.request.Request(f"{self.base_url}/api/tags")
            with urllib.request.urlopen(req, timeout=3) as response:
                self.is_available = True
                data = json.loads(response.read())
                models = [m["name"] for m in data.get("models", [])]
                print(f"  Ollama 可用，已安装模型: {models}")
        except Exception:
            self.is_available = False
            print("  Ollama 不可用，使用模拟模式")

    def chat(self, messages: List[Dict], temperature=0.7, max_tokens=500) -> str:
        """发送对话请求"""
        if not self.is_available:
            return self._simulate_chat(messages)

        try:
            import urllib.request
            payload = json.dumps({
                "model": self.model,
                "messages": messages,
                "stream": False,
                "options": {"temperature": temperature, "num_predict": max_tokens},
            }).encode("utf-8")

            req = urllib.request.Request(
                f"{self.base_url}/api/chat",
                data=payload,
                headers={"Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=30) as response:
                data = json.loads(response.read())
                return data["message"]["content"]
        except Exception as e:
            return f"调用失败: {e}"

    def _simulate_chat(self, messages: List[Dict]) -> str:
        """模拟对话（Ollama 不可用时）"""
        last_msg = messages[-1]["content"] if messages else ""
        return f"[模拟响应] 关于 '{last_msg[:50]}...' 的回复：这是一个本地模型的模拟输出。"

    def list_models(self) -> List[str]:
        """列出可用模型"""
        if not self.is_available:
            return ["simulated-model"]
        try:
            import urllib.request
            req = urllib.request.Request(f"{self.base_url}/api/tags")
            with urllib.request.urlopen(req, timeout=3) as response:
                data = json.loads(response.read())
                return [m["name"] for m in data.get("models", [])]
        except Exception:
            return []


class LocalAgent:
    """本地 Agent：使用 Ollama 运行"""
    def __init__(self, name="LocalAgent", model="llama3.1:8b"):
        self.name = name
        self.client = OllamaClient(model=model)
        self.conversation_history: List[Dict] = []
        self.system_prompt = """你是一个有用的 AI 助手。
请用中文回答问题，保持简洁和准确。"""

    def chat(self, user_message: str) -> str:
        """对话"""
        self.conversation_history.append({"role": "user", "content": user_message})

        messages = [{"role": "system", "content": self.system_prompt}]
        messages.extend(self.conversation_history[-10:])  # 保留最近 10 条

        response = self.client.chat(messages)
        self.conversation_history.append({"role": "assistant", "content": response})
        return response

    def get_privacy_info(self) -> Dict:
        """获取隐私信息"""
        return {
            "model": self.client.model,
            "is_local": True,
            "data_stays_on_device": True,
            "no_internet_required": True,
            "api_calls_to_external": 0,
        }


# 测试本地 Agent
print("=" * 60)
print("本地 Agent (Ollama)")
print("=" * 60)
local_agent = LocalAgent(model="llama3.1:8b")
response = local_agent.chat("请用一句话解释什么是 Agent")
print(f"用户: 请用一句话解释什么是 Agent")
print(f"Agent: {response}")
print(f"隐私信息: {local_agent.get_privacy_info()}")
print()


# ============================================================
# 第四部分：Agent DevOps
# ============================================================

class PipelineStage(Enum):
    LINT = "lint"
    TEST = "test"
    BUILD = "build"
    DEPLOY = "deploy"
    MONITOR = "monitor"


@dataclass
class PipelineResult:
    stage: PipelineStage
    success: bool
    duration: float
    message: str
    logs: List[str] = field(default_factory=list)


class AgentDevOps:
    """Agent DevOps: CI/CD for Agent Systems"""
    def __init__(self, project_name: str):
        self.project_name = project_name
        self.pipelines: Dict[str, List[PipelineStage]] = {}
        self.results: List[PipelineResult] = []

    def create_pipeline(self, name: str, stages: List[PipelineStage]):
        """创建流水线"""
        self.pipelines[name] = stages
        print(f"  创建流水线 '{name}': {[s.value for s in stages]}")

    def run_pipeline(self, name: str) -> List[PipelineResult]:
        """运行流水线"""
        if name not in self.pipelines:
            return [PipelineResult(PipelineStage.LINT, False, 0, f"流水线 '{name}' 不存在")]

        stages = self.pipelines[name]
        results = []

        print(f"\n  运行流水线 '{name}':")
        for stage in stages:
            start = time.time()
            success, message, logs = self._run_stage(stage)
            duration = time.time() - start

            result = PipelineResult(stage, success, duration, message, logs)
            results.append(result)
            self.results.append(result)

            status = "OK" if success else "FAILED"
            print(f"    [{status}] {stage.value}: {message} ({duration:.2f}s)")

            if not success:
                print(f"    流水线在 {stage.value} 阶段失败，终止")
                break

        return results

    def _run_stage(self, stage: PipelineStage) -> Tuple[bool, str, List[str]]:
        """运行单个阶段"""
        logs = []

        if stage == PipelineStage.LINT:
            logs.append("检查代码规范...")
            logs.append("检查类型注解...")
            return True, "代码规范检查通过", logs

        elif stage == PipelineStage.TEST:
            logs.append("运行单元测试...")
            logs.append("运行集成测试...")
            logs.append("覆盖率: 85%")
            return True, "所有测试通过 (85% 覆盖率)", logs

        elif stage == PipelineStage.BUILD:
            logs.append("构建 Docker 镜像...")
            logs.append("推送镜像到仓库...")
            return True, "镜像构建成功: agent:v1.0.0", logs

        elif stage == PipelineStage.DEPLOY:
            logs.append("部署到生产环境...")
            logs.append("健康检查...")
            return True, "部署成功，服务正常运行", logs

        elif stage == PipelineStage.MONITOR:
            logs.append("启动监控...")
            logs.append("设置告警规则...")
            return True, "监控已配置", logs

        return True, f"阶段 {stage.value} 完成", logs

    def get_report(self) -> str:
        """生成报告"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r.success)
        total_time = sum(r.duration for r in self.results)

        lines = [
            f"\nDevOps 报告 - {self.project_name}",
            f"{'='*40}",
            f"总阶段数: {total}",
            f"通过: {passed}, 失败: {total - passed}",
            f"总耗时: {total_time:.2f}s",
            f"成功率: {passed/max(total,1)*100:.1f}%",
        ]
        return "\n".join(lines)


# 测试 DevOps
print("=" * 60)
print("Agent DevOps")
print("=" * 60)
devops = AgentDevOps("agent-factory-project")
devops.create_pipeline("ci", [PipelineStage.LINT, PipelineStage.TEST])
devops.create_pipeline("cd", [PipelineStage.BUILD, PipelineStage.DEPLOY, PipelineStage.MONITOR])

devops.run_pipeline("ci")
devops.run_pipeline("cd")
print(devops.get_report())
print()


# ============================================================
# 第五部分：Week 13 复盘
# ============================================================

def week13_review():
    """Week 13 完整复盘"""
    print("=" * 60)
    print("Week 13 完整复盘")
    print("=" * 60)

    days = [
        {"day": 1, "topic": "从零构建 LLM", "key_skills": ["RMSNorm", "RoPE", "SwiGLU", "GQA", "BPE"],
         "mastery": 0.7},
        {"day": 2, "topic": "从零构建 Agent 框架", "key_skills": ["工具注册", "记忆系统", "规划", "反思"],
         "mastery": 0.75},
        {"day": 3, "topic": "多模态 + 语音 Agent", "key_skills": ["ViT", "投影层", "音频编码", "TTS"],
         "mastery": 0.6},
        {"day": 4, "topic": "GUI/Web Agent", "key_skills": ["Playwright", "DOM 理解", "GUI Grounding"],
         "mastery": 0.65},
        {"day": 5, "topic": "Agent 自进化", "key_skills": ["经验回放", "Reflexion", "Prompt 进化", "元学习"],
         "mastery": 0.7},
        {"day": 6, "topic": "案例分析 + 踩坑", "key_skills": ["Cursor", "Devin", "AutoGPT", "反模式"],
         "mastery": 0.8},
        {"day": 7, "topic": "Skill + 辩论 + DevOps", "key_skills": ["Skill 编写", "辩论模式", "Ollama", "CI/CD"],
         "mastery": 0.7},
    ]

    print("\n每日学习成果:")
    print("-" * 60)
    for d in days:
        bar_len = int(d["mastery"] * 20)
        bar = "=" * bar_len + "-" * (20 - bar_len)
        print(f"  Day {d['day']}: {d['topic']}")
        print(f"    技能: {', '.join(d['key_skills'])}")
        print(f"    掌握度: [{bar}] {d['mastery']*100:.0f}%")

    # 核心收获
    print("\n核心收获:")
    print("-" * 60)
    takeaways = [
        "理解了 LLM 的底层架构（LLaMA2 风格）",
        "掌握了从零构建 Agent 框架的方法",
        "了解了多模态 Agent 的架构设计",
        "学会了 Web Agent 的浏览器自动化",
        "理解了 Agent 自进化的机制",
        "分析了真实产品的成功与失败",
        "掌握了 Skill 编写和 DevOps 实践",
    ]
    for i, t in enumerate(takeaways, 1):
        print(f"  {i}. {t}")

    # 技能矩阵
    print("\n技能矩阵:")
    print("-" * 60)
    skills = {
        "模型构建": ["Transformer", "LLaMA2", "BPE"],
        "Agent 设计": ["工具系统", "记忆", "规划", "反思"],
        "多模态": ["ViT", "音频处理", "VLM"],
        "浏览器自动化": ["Playwright", "DOM", "GUI"],
        "自我进化": ["经验回放", "Reflexion", "元学习"],
        "工程实践": ["DevOps", "Skill 编写", "本地部署"],
    }
    for category, items in skills.items():
        print(f"  {category}: {', '.join(items)}")

    # 下一步建议
    print("\n下一步建议:")
    print("-" * 60)
    suggestions = [
        "选择一个方向深入（多模态 / Web / 自进化）",
        "构建一个完整的 Agent 项目",
        "部署到生产环境，收集真实反馈",
        "持续优化和迭代",
    ]
    for i, s in enumerate(suggestions, 1):
        print(f"  {i}. {s}")

    print("\n" + "=" * 60)
    print("Week 13 完成！准备进入项目实战阶段！")
    print("=" * 60)


week13_review()
```

---

## 预期输出

```
============================================================
Skill 编写规范
============================================================
  已注册 Skill: translate v1.0.0
  已注册 Skill: code_review v1.0.0

Skill: translate
描述: 将文本翻译为目标语言
版本: 1.0.0

输入参数:
  - text (str): 要翻译的文本 [必需]
  - target_lang (str): 目标语言代码 [必需]

执行结果: {'success': True, 'result': {'translated_text': '[翻译] Agent Factory', 'source_lang': 'zh'}}

============================================================
辩论主题: AI Agent 是否会取代传统软件开发
============================================================

--- 第 1 轮 ---

  Alice (支持):
    论点: 支持 'AI Agent...': 有充分的证据表明这是正确的方向
    置信度: 0.87

  Bob (反对):
    论点: 反对 'AI Agent...': 存在明显的风险和局限
    置信度: 0.72

辩论结果:
  胜方: 支持方
  共识: 经过 2 轮辩论，平均置信度: 支持=0.83, 反对=0.69

============================================================
本地 Agent (Ollama)
============================================================
  Ollama 不可用，使用模拟模式
用户: 请用一句话解释什么是 Agent
Agent: [模拟响应] 关于 '请用一句话解释什么是 Agent' 的回复：...

============================================================
Week 13 完整复盘
============================================================

每日学习成果:
  Day 1: 从零构建 LLM
    技能: RMSNorm, RoPE, SwiGLU, GQA, BPE
    掌握度: [==============------] 70%
  ...
```

---

## 常见错误与解决方案

### 错误 1: Ollama 安装失败
**解决**: Windows 用户从 https://ollama.ai 下载安装包，确保端口 11434 未被占用

### 错误 2: Skill 定义不规范
**解决**: 遵循 SkillDefinition 的结构，确保输入输出都有明确的类型和描述

### 错误 3: 辩论陷入死循环
**解决**: 设置最大轮数限制，每轮生成不同的论点

### 错误 4: DevOps 流水线卡住
**解决**: 为每个阶段设置超时时间，实现健康检查

---

## 每日挑战

### 挑战 1: 编写一个完整的 Skill
```yaml
# 创建一个自定义 Skill 并发布
# 例如: 图像描述 Skill
name: image_caption
description: 为图像生成文字描述
inputs:
  image: {type: str, description: "图像路径", required: true}
outputs:
  caption: {type: str, description: "图像描述"}
```

### 挑战 2: 实现 Agent 共识机制
```python
# 在辩论后，让多个 Agent 达成共识
# 而不是简单地判定胜负
```

### 挑战 3: 部署一个本地 Agent
```bash
# 使用 Ollama + Streamlit 搭建本地聊天界面
# pip install streamlit
# streamlit run app.py
```

---

## 今日小结

Week 13 圆满结束！今天我们学习了 Skill 编写规范、Agent 辩论模式、本地 Agent 部署和 DevOps 实践。回顾整个 Week 13，我们从模型构建到 Agent 框架，从多模态到自进化，从案例分析到工程实践，建立了一个完整的 Agent 开发知识体系。

**下一步**: 将所学知识应用到实际项目中，构建你自己的 Agent 产品！
