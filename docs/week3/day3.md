# Day 3: 大模型概览 - GPT/Claude/LLaMA 对比

## 今日学习目标

1. 了解主流大模型的发展历程
2. 对比不同模型的架构和特点
3. 理解开源 vs 闭源模型的差异
4. 学会根据场景选择合适的模型
5. 了解模型的能力和局限性

---

## 第一部分：大模型发展史

### 关键里程碑

```
大模型发展时间线：
    
2018: GPT-1 (OpenAI)
    ↓ 1.17亿参数
2019: GPT-2 (OpenAI)
    ↓ 15亿参数
2020: GPT-3 (OpenAI)
    ↓ 1750亿参数
2022: ChatGPT (OpenAI)
    ↓ 对话式AI的突破
2023: GPT-4 (OpenAI)
    ↓ 多模态，更强推理
2023: Claude 2 (Anthropic)
    ↓ 更安全，更诚实
2023: LLaMA (Meta)
    ↓ 开源大模型
2024: LLaMA 3 (Meta)
    ↓ 更强的开源模型
2024: Claude 3 (Anthropic)
    ↓ 超长上下文
```

---

## 第二部分：主流大模型对比

### 文件：app/llm/models.py

```python
"""
大模型信息数据库
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
from enum import Enum


class ModelType(str, Enum):
    """模型类型"""
    CLOSED = "closed"      # 闭源
    OPEN = "open"          # 开源
    SEMI_OPEN = "semi_open"  # 半开源


@dataclass
class ModelInfo:
    """模型信息"""
    name: str
    company: str
    release_date: str
    model_type: ModelType
    parameters: Optional[str]  # 参数量
    context_window: str  # 上下文窗口
    key_features: List[str]  # 主要特点
    strengths: List[str]  # 优势
    weaknesses: List[str]  # 劣势
    best_for: List[str]  # 最佳应用场景
    pricing: Dict[str, float] = field(default_factory=dict)  # 价格


# 主流大模型数据库
MODELS_DB = {
    "gpt-4": ModelInfo(
        name="GPT-4",
        company="OpenAI",
        release_date="2023-03",
        model_type=ModelType.CLOSED,
        parameters="未公开（估计1T+）",
        context_window="8K/32K/128K",
        key_features=["多模态", "强大的推理能力", "长上下文"],
        strengths=["性能最强", "生态完善", "API稳定"],
        weaknesses=["闭源", "价格昂贵", "可能产生幻觉"],
        best_for=["复杂推理", "代码生成", "创意写作"],
        pricing={"input": 30.0, "output": 60.0}
    ),
    "gpt-4-turbo": ModelInfo(
        name="GPT-4 Turbo",
        company="OpenAI",
        release_date="2024-01",
        model_type=ModelType.CLOSED,
        parameters="未公开",
        context_window="128K",
        key_features=["更长上下文", "更新的知识", "更便宜"],
        strengths=["性价比高", "上下文长", "性能强"],
        weaknesses=["闭源", "可能产生幻觉"],
        best_for=["长文档处理", "复杂推理", "代码生成"],
        pricing={"input": 10.0, "output": 30.0}
    ),
    "gpt-3.5-turbo": ModelInfo(
        name="GPT-3.5 Turbo",
        company="OpenAI",
        release_date="2022-11",
        model_type=ModelType.CLOSED,
        parameters="175B",
        context_window="4K/16K",
        key_features=["快速", "便宜", "广泛应用"],
        strengths=["性价比高", "速度快", "生态好"],
        weaknesses=["推理能力有限", "上下文窗口小"],
        best_for=["简单对话", "文本分类", "快速原型"],
        pricing={"input": 0.5, "output": 1.5}
    ),
    "claude-3-opus": ModelInfo(
        name="Claude 3 Opus",
        company="Anthropic",
        release_date="2024-03",
        model_type=ModelType.CLOSED,
        parameters="未公开",
        context_window="200K",
        key_features=["超长上下文", "安全可靠", "深度推理"],
        strengths=["安全", "长文本处理", "诚实"],
        weaknesses=["价格高", "API限制", "创意性稍弱"],
        best_for=["长文档分析", "安全敏感任务", "研究"],
        pricing={"input": 15.0, "output": 75.0}
    ),
    "claude-3-sonnet": ModelInfo(
        name="Claude 3 Sonnet",
        company="Anthropic",
        release_date="2024-03",
        model_type=ModelType.CLOSED,
        parameters="未公开",
        context_window="200K",
        key_features=["平衡性能", "高性价比", "快速"],
        strengths=["速度快", "价格适中", "质量好"],
        weaknesses=["不如Opus强大", "闭源"],
        best_for=["日常任务", "API应用", "平衡性能"],
        pricing={"input": 3.0, "output": 15.0}
    ),
    "claude-3-haiku": ModelInfo(
        name="Claude 3 Haiku",
        company="Anthropic",
        release_date="2024-03",
        model_type=ModelType.CLOSED,
        parameters="未公开",
        context_window="200K",
        key_features=["最快", "最便宜", "长上下文"],
        strengths=["速度极快", "价格极低", "上下文长"],
        weaknesses=["能力有限", "闭源"],
        best_for=["快速响应", "简单任务", "批量处理"],
        pricing={"input": 0.25, "output": 1.25}
    ),
    "llama-3": ModelInfo(
        name="LLaMA 3",
        company="Meta",
        release_date="2024-04",
        model_type=ModelType.OPEN,
        parameters="8B/70B/405B",
        context_window="8K",
        key_features=["开源", "可本地部署", "社区活跃"],
        strengths=["完全开源", "可定制", "无API费用"],
        weaknesses=["需要自行部署", "小模型性能有限"],
        best_for=["研究学习", "本地部署", "定制开发"],
        pricing={"input": 0.0, "output": 0.0}
    ),
    "llama-2": ModelInfo(
        name="LLaMA 2",
        company="Meta",
        release_date="2023-07",
        model_type=ModelType.OPEN,
        parameters="7B/13B/70B",
        context_window="4K",
        key_features=["开源", "可商用", "社区支持"],
        strengths=["免费使用", "可商用", "研究友好"],
        weaknesses=["性能不如闭源模型", "需要GPU资源"],
        best_for=["学术研究", "小型项目", "学习"],
        pricing={"input": 0.0, "output": 0.0}
    ),
    "qwen-2": ModelInfo(
        name="Qwen 2",
        company="阿里云",
        release_date="2024-06",
        model_type=ModelType.OPEN,
        parameters="0.5B-72B",
        context_window="128K",
        key_features=["中文优化", "多模态", "完全开源"],
        strengths=["中文能力强", "多模态支持", "可商用"],
        weaknesses=["国际生态较弱", "部分版本限制"],
        best_for=["中文任务", "国内部署", "多模态应用"],
        pricing={"input": 0.0, "output": 0.0}
    ),
    "gemini-pro": ModelInfo(
        name="Gemini Pro",
        company="Google",
        release_date="2023-12",
        model_type=ModelType.CLOSED,
        parameters="未公开",
        context_window="32K",
        key_features=["多模态", "Google生态", "长上下文"],
        strengths=["多模态能力强", "Google集成", "性能好"],
        weaknesses=["API限制", "部分功能受限"],
        best_for=["Google生态", "多模态任务", "搜索增强"],
        pricing={"input": 0.125, "output": 0.375}
    )
}


def get_model_info(model_name: str) -> Optional[ModelInfo]:
    """获取模型信息"""
    return MODELS_DB.get(model_name)


def list_all_models() -> List[str]:
    """列出所有模型"""
    return list(MODELS_DB.keys())


def compare_models(model1: str, model2: str) -> Dict:
    """对比两个模型"""
    info1 = get_model_info(model1)
    info2 = get_model_info(model2)
    
    if not info1 or not info2:
        return {"error": "模型不存在"}
    
    return {
        "model1": {
            "name": info1.name,
            "company": info1.company,
            "type": info1.model_type.value,
            "parameters": info1.parameters,
            "context_window": info1.context_window,
            "strengths": info1.strengths,
            "weaknesses": info1.weaknesses
        },
        "model2": {
            "name": info2.name,
            "company": info2.company,
            "type": info2.model_type.value,
            "parameters": info2.parameters,
            "context_window": info2.context_window,
            "strengths": info2.strengths,
            "weaknesses": info2.weaknesses
        }
    }


def find_best_model(task: str) -> List[str]:
    """根据任务推荐模型"""
    recommendations = []
    
    for model_name, info in MODELS_DB.items():
        if task in info.best_for:
            recommendations.append(model_name)
    
    return recommendations


def get_pricing_comparison() -> Dict:
    """获取价格对比"""
    pricing = {}
    
    for model_name, info in MODELS_DB.items():
        if info.pricing:
            pricing[info.name] = {
                "input": info.pricing.get("input", 0),
                "output": info.pricing.get("output", 0)
            }
    
    return pricing


# 使用示例
if __name__ == "__main__":
    print("=== 大模型信息数据库 ===\n")
    
    # 列出所有模型
    models = list_all_models()
    print(f"可用模型: {', '.join(models)}\n")
    
    # 查看特定模型
    print("GPT-4 信息:")
    gpt4_info = get_model_info("gpt-4")
    if gpt4_info:
        print(f"  公司: {gpt4_info.company}")
        print(f"  发布日期: {gpt4_info.release_date}")
        print(f"  类型: {gpt4_info.model_type.value}")
        print(f"  参数量: {gpt4_info.parameters}")
        print(f"  上下文窗口: {gpt4_info.context_window}")
        print(f"  主要特点: {', '.join(gpt4_info.key_features)}")
    
    # 对比模型
    print("\nGPT-4 vs Claude 3 Opus:")
    comparison = compare_models("gpt-4", "claude-3-opus")
    print(f"  GPT-4 优势: {comparison['model1']['strengths']}")
    print(f"  Claude 3 Opus 优势: {comparison['model2']['strengths']}")
    
    # 推荐模型
    print("\n复杂推理任务推荐:")
    recommended = find_best_model("复杂推理")
    for model in recommended:
        info = get_model_info(model)
        print(f"  - {info.name} ({info.company})")
    
    # 价格对比
    print("\n价格对比 (每1M tokens):")
    pricing = get_pricing_comparison()
    for model_name, prices in pricing.items():
        print(f"  {model_name}: 输入 ${prices['input']}, 输出 ${prices['output']}")
```

---

## 第三部分：开源 vs 闭源分析

### 文件：app/llm/comparison.py

```python
"""
开源 vs 闭源对比分析
"""

from typing import Dict, List


class ModelComparison:
    """模型对比分析"""
    
    @staticmethod
    def open_vs_closed_analysis() -> str:
        """开源 vs 闭源分析"""
        return """
开源 vs 闭源大模型对比分析
==========================

一、闭源模型（如 GPT-4, Claude）
-------------------------------

优点:
1. 性能最强: 通常拥有最好的性能和质量
2. 易于使用: 提供简单的 API，无需部署
3. 持续更新: 公司持续优化和改进
4. 技术支持: 有专业的技术支持团队
5. 生态完善: 丰富的工具和集成

缺点:
1. 成本高: API 调用费用昂贵
2. 数据隐私: 数据需要发送到第三方服务器
3. 定制性差: 无法修改模型本身
4. 依赖性: 依赖服务提供商的可用性
5. 限制多: 可能有使用限制和审查

适用场景:
- 商业应用
- 对性能要求高的场景
- 缺乏技术团队的公司
- 需要快速原型开发

二、开源模型（如 LLaMA, Qwen）
-------------------------------

优点:
1. 完全控制: 可以自由修改和部署
2. 数据隐私: 数据可以留在本地
3. 成本低: 无 API 调用费用
4. 可定制: 可以针对特定任务微调
5. 透明性: 可以查看和理解模型

缺点:
1. 部署复杂: 需要技术能力部署和维护
2. 资源需求: 需要 GPU 等硬件资源
3. 性能差距: 通常不如顶级闭源模型
4. 维护成本: 需要持续维护和更新
5. 文档较少: 可能缺乏完善的文档

适用场景:
- 学术研究
- 数据敏感场景
- 需要定制化
- 预算有限
- 学习和实验

三、选择建议
-----------

1. 如果是商业产品，预算充足: 选闭源
2. 如果是研究项目，需要透明: 选开源
3. 如果数据敏感，不能外传: 选开源
4. 如果需要快速原型: 选闭源 API
5. 如果需要深度定制: 选开源 + 微调
6. 如果在国内部署: 考虑 Qwen 等国产模型
"""
    
    @staticmethod
    def model_selection_guide() -> str:
        """模型选择指南"""
        return """
模型选择指南
==========

根据任务类型选择:

1. 文本生成（写作、创作）
   推荐: GPT-4 > Claude 3 Opus > GPT-3.5 Turbo
   原因: 需要强大的语言生成能力

2. 代码生成和理解
   推荐: GPT-4 > Claude 3 Sonnet > Code LLaMA
   原因: 需要强大的逻辑推理能力

3. 文本分析和理解
   推荐: Claude 3 Opus > GPT-4 > Gemini Pro
   原因: 需要深度理解能力

4. 中文任务
   推荐: Qwen 2 > GPT-4 > Claude 3
   原因: 中文模型对中文优化更好

5. 多模态任务（图文理解）
   推荐: GPT-4V > Gemini Pro > Claude 3
   原因: 需要多模态理解能力

6. 长文本处理
   推荐: Claude 3 Opus (200K) > GPT-4 (128K) > Gemini Pro
   原因: 需要大上下文窗口

7. 预算敏感场景
   推荐: GPT-3.5 Turbo > Claude 3 Haiku > 开源模型
   原因: 性价比优先

8. 本地部署/数据隐私
   推荐: LLaMA 3 > Qwen 2 > Mistral
   原因: 开源模型可以本地部署

9. 研究和学习
   推荐: LLaMA 3 > Qwen 2 > GPT-3.5 Turbo
   原因: 开源模型更适合研究

10. 快速原型开发
    推荐: GPT-3.5 Turbo > Claude 3 Haiku > Gemini Pro
    原因: API 易用，成本低
"""
    
    @staticmethod
    def cost_comparison() -> str:
        """成本对比"""
        return """
API 调用成本对比 (每1M tokens)
============================

1. GPT-4 Turbo
   输入: $10.00
   输出: $30.00
   
2. GPT-3.5 Turbo
   输入: $0.50
   输出: $1.50

3. Claude 3 Opus
   输入: $15.00
   输出: $75.00

4. Claude 3 Sonnet
   输入: $3.00
   输出: $15.00

5. Claude 3 Haiku
   输入: $0.25
   输出: $1.25

6. Gemini Pro
   输入: $0.125 (128K以下)
   输出: $0.375

7. Qwen 2 (阿里云)
   价格因地区而异
   通常比国际模型便宜

8. 开源模型 (本地部署)
   成本: 仅硬件和电费
   需要: GPU 服务器

成本估算示例:
- GPT-4 Turbo: 1000次对话 ≈ $5-10
- GPT-3.5 Turbo: 1000次对话 ≈ $0.5-1
- 开源模型: 1000次对话 ≈ $0.01-0.1 (电费)
"""
    
    @staticmethod
    def api_comparison() -> str:
        """API 使用对比"""
        return """
主流大模型 API 对比
==================

1. OpenAI API (GPT-4/GPT-3.5)
   基础URL: https://api.openai.com/v1
   认证方式: API Key (Bearer Token)
   请求格式:
   {
     "model": "gpt-4",
     "messages": [
       {"role": "system", "content": "你是一个助手"},
       {"role": "user", "content": "你好"}
     ],
     "temperature": 0.7
   }
   
   特点:
   - 最大的生态系统
   - 支持函数调用
   - 支持视觉理解 (GPT-4V)
   - 流式响应支持好

2. Anthropic API (Claude)
   基础URL: https://api.anthropic.com/v1
   认证方式: API Key (x-api-key header)
   请求格式:
   {
     "model": "claude-3-opus-20240229",
     "max_tokens": 1000,
     "system": "你是一个助手",
     "messages": [
       {"role": "user", "content": "你好"}
     ]
   }
   
   特点:
   - 超长上下文 (200K)
   - 安全可靠
   - 诚实度高
   - 支持系统提示

3. Meta API (LLaMA - 通过云服务)
   提供商: AWS, Azure, 等
   特点:
   - 可以部署开源模型
   - 成本可控
   - 需要自行管理

4. 阿里云 API (Qwen)
   基础URL: https://dashscope.aliyuncs.com/api/v1
   认证方式: API Key
   特点:
   - 中文优化
   - 多模态支持
   - 国内访问快
"""


# 使用示例
if __name__ == "__main__":
    comparison = ModelComparison()
    
    print(comparison.open_vs_closed_analysis())
    print(comparison.model_selection_guide())
    print(comparison.cost_comparison())
    print(comparison.api_comparison())
```

---

## 第四部分：模型能力评估

### 文件：app/llm/evaluation.py

```python
"""
模型能力评估
"""

from dataclasses import dataclass
from typing import List, Dict
from enum import Enum


class Capability(str, Enum):
    """能力维度"""
    REASONING = "reasoning"          # 推理能力
    CREATIVE_WRITING = "creative_writing"  # 创意写作
    CODE_GENERATION = "code_generation"    # 代码生成
    MATH = "math"                          # 数学能力
    MULTILINGUAL = "multilingual"          # 多语言能力
    LONG_CONTEXT = "long_context"          # 长文本处理
    SAFETY = "safety"                      # 安全性
    COST_EFFICIENCY = "cost_efficiency"    # 性价比


@dataclass
class ModelCapability:
    """模型能力评估"""
    model_name: str
    capabilities: Dict[Capability, float]  # 0-10 分
    overall_score: float
    
    def get_strongest(self) -> List[Capability]:
        """获取最强能力"""
        sorted_caps = sorted(
            self.capabilities.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return [cap for cap, score in sorted_caps[:3]]
    
    def get_weakest(self) -> List[Capability]:
        """获取最弱能力"""
        sorted_caps = sorted(
            self.capabilities.items(),
            key=lambda x: x[1]
        )
        return [cap for cap, score in sorted_caps[:3]]


# 模型能力数据库
MODEL_CAPABILITIES = {
    "gpt-4": ModelCapability(
        model_name="GPT-4",
        capabilities={
            Capability.REASONING: 9.5,
            Capability.CREATIVE_WRITING: 9.0,
            Capability.CODE_GENERATION: 9.5,
            Capability.MATH: 9.0,
            Capability.MULTILINGUAL: 9.0,
            Capability.LONG_CONTEXT: 8.5,
            Capability.SAFETY: 8.0,
            Capability.COST_EFFICIENCY: 6.0
        },
        overall_score=8.6
    ),
    "claude-3-opus": ModelCapability(
        model_name="Claude 3 Opus",
        capabilities={
            Capability.REASONING: 9.0,
            Capability.CREATIVE_WRITING: 9.5,
            Capability.CODE_GENERATION: 9.0,
            Capability.MATH: 8.5,
            Capability.MULTILINGUAL: 9.0,
            Capability.LONG_CONTEXT: 9.5,
            Capability.SAFETY: 9.5,
            Capability.COST_EFFICIENCY: 5.0
        },
        overall_score=8.7
    ),
    "gpt-3.5-turbo": ModelCapability(
        model_name="GPT-3.5 Turbo",
        capabilities={
            Capability.REASONING: 7.0,
            Capability.CREATIVE_WRITING: 7.5,
            Capability.CODE_GENERATION: 7.5,
            Capability.MATH: 7.0,
            Capability.MULTILINGUAL: 7.5,
            Capability.LONG_CONTEXT: 6.0,
            Capability.SAFETY: 7.5,
            Capability.COST_EFFICIENCY: 9.5
        },
        overall_score=7.4
    ),
    "llama-3-70b": ModelCapability(
        model_name="LLaMA 3 70B",
        capabilities={
            Capability.REASONING: 8.0,
            Capability.CREATIVE_WRITING: 8.0,
            Capability.CODE_GENERATION: 8.0,
            Capability.MATH: 7.5,
            Capability.MULTILINGUAL: 8.0,
            Capability.LONG_CONTEXT: 7.0,
            Capability.SAFETY: 7.0,
            Capability.COST_EFFICIENCY: 10.0
        },
        overall_score=8.0
    )
}


def get_capability_name(cap: Capability) -> str:
    """获取能力的中文名称"""
    names = {
        Capability.REASONING: "推理能力",
        Capability.CREATIVE_WRITING: "创意写作",
        Capability.CODE_GENERATION: "代码生成",
        Capability.MATH: "数学能力",
        Capability.MULTILINGUAL: "多语言能力",
        Capability.LONG_CONTEXT: "长文本处理",
        Capability.SAFETY: "安全性",
        Capability.COST_EFFICIENCY: "性价比"
    }
    return names.get(cap, cap.value)


def print_model_comparison(model1: str, model2: str):
    """打印模型对比"""
    cap1 = MODEL_CAPABILITIES.get(model1)
    cap2 = MODEL_CAPABILITIES.get(model2)
    
    if not cap1 or not cap2:
        print("模型不存在")
        return
    
    print(f"\n=== {cap1.model_name} vs {cap2.model_name} ===\n")
    
    print("能力对比:")
    print("-" * 60)
    
    for cap in Capability:
        score1 = cap1.capabilities.get(cap, 0)
        score2 = cap2.capabilities.get(cap, 0)
        
        bar1 = "█" * int(score1)
        bar2 = "█" * int(score2)
        
        print(f"{get_capability_name(cap):<12}")
        print(f"  {cap1.model_name}: {bar1} {score1:.1f}")
        print(f"  {cap2.model_name}: {bar2} {score2:.1f}")
        print()
    
    print(f"综合评分: {cap1.model_name} {cap1.overall_score:.1f} vs {cap2.model_name} {cap2.overall_score:.1f}")


# 使用示例
if __name__ == "__main__":
    print_model_comparison("gpt-4", "claude-3-opus")
    print_model_comparison("gpt-4", "gpt-3.5-turbo")
```

---

## 验证清单

完成今日学习后，检查以下项目：

- [ ] 了解大模型的发展历程
- [ ] 能对比主流大模型的特点
- [ ] 理解开源 vs 闭源的差异
- [ ] 能根据场景选择合适的模型
- [ ] 了解模型的能力和局限性
- [ ] 理解模型定价策略

---

## 今日小结

| 概念 | 关键点 |
|------|--------|
| GPT | OpenAI 的生成式预训练模型系列 |
| Claude | Anthropic 的大语言模型 |
| LLaMA | Meta 的开源大语言模型 |
| Qwen | 阿里云的通义千问模型 |
| 开源 | 代码公开，可自由使用和修改 |
| 闭源 | 代码私有，只能通过 API 使用 |
| 上下文窗口 | 模型能处理的最大文本长度 |
| 微调 | 在特定数据上进一步训练模型 |

---

## 明日预告

明天我们将学习：
- 提示工程基础
- Few-shot 学习
- Chain-of-Thought
- 结构化输出

---

## 参考资源

- [OpenAI 官网](https://openai.com/)
- [Anthropic 官网](https://www.anthropic.com/)
- [Meta AI 官网](https://ai.meta.com/)
- [大模型排行榜](https://huggingface.co/spaces/lmarena-ai/chatbot-arena-leaderboard)
