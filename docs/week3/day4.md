# 📅 Week 3 Day 4：提示工程：Few-shot / CoT / 结构化输出

## 🧭 今日方向
> 今天我们将深入学习提示工程（Prompt Engineering），这是与大模型交互的核心技能。

## 🎯 生活比喻
> 提示工程就像和一个聪明但需要明确指示的助手沟通。好的提示就像好的问题，能引导出最好的答案。

## 📋 今日三件事
1. 学习基础提示技巧
2. 掌握 Few-shot 和 CoT 方法
3. 实践结构化输出提示

## 🗺️ 手把手路线

### Step 1: 提示工程基础
- **做什么**: 了解提示的基本结构和原则
- **为什么**: 好的提示是获得好结果的基础
- **成功标志**: 能设计有效的基础提示

### Step 2: Few-shot 学习
- **做什么**: 学习通过示例引导模型
- **为什么**: 示例能让模型更好理解任务
- **成功标志**: 能使用 Few-shot 提高输出质量

### Step 3: Chain-of-Thought
- **做什么**: 学习思维链提示方法
- **为什么**: CoT 能提高复杂推理任务的表现
- **成功标志**: 能使用 CoT 解决复杂问题

## 💻 代码区

```python
# 提示工程基础

from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum

class PromptStyle(str, Enum):
    """提示风格"""
    BASIC = "basic"
    FEW_SHOT = "few_shot"
    CHAIN_OF_THOUGHT = "chain_of_thought"
    STRUCTURED = "structured"

@dataclass
class PromptTemplate:
    """提示模板"""
    name: str
    style: PromptStyle
    template: str
    description: str
    examples: Optional[List[Dict]] = None

# 1. 基础提示模板
BASIC_TEMPLATES = {
    "classification": PromptTemplate(
        name="文本分类",
        style=PromptStyle.BASIC,
        template="请将以下文本分类为[正面/负面/中性]：\n\n文本：{text}\n\n分类：",
        description="简单的文本分类提示"
    ),
    "summarization": PromptTemplate(
        name="文本摘要",
        style=PromptStyle.BASIC,
        template="请用一句话总结以下文本：\n\n{text}\n\n摘要：",
        description="简单的文本摘要提示"
    ),
    "extraction": PromptTemplate(
        name="信息抽取",
        style=PromptStyle.BASIC,
        template="请从以下文本中提取人名：\n\n{text}\n\n人名列表：",
        description="简单的信息抽取提示"
    )
}

# 2. Few-shot 提示模板
FEW_SHOT_TEMPLATES = {
    "sentiment": PromptTemplate(
        name="情感分析（Few-shot）",
        style=PromptStyle.FEW_SHOT,
        template="""请分析以下文本的情感。

示例1：
文本：这个产品非常好用，我很满意！
情感：正面

示例2：
文本：服务太差了，再也不来了。
情感：负面

示例3：
文本：今天天气一般。
情感：中性

现在请分析：
文本：{text}
情感：""",
        description="使用示例引导的情感分析",
        examples=[
            {"text": "这个产品非常好用", "sentiment": "正面"},
            {"text": "服务太差了", "sentiment": "负面"},
            {"text": "今天天气一般", "sentiment": "中性"}
        ]
    ),
    "translation": PromptTemplate(
        name="翻译（Few-shot）",
        style=PromptStyle.FEW_SHOT,
        template="""请将中文翻译成英文。

示例1：
中文：今天天气很好。
英文：The weather is nice today.

示例2：
中文：我喜欢编程。
英文：I like programming.

现在请翻译：
中文：{text}
英文：""",
        description="使用示例引导的翻译"
    )
}

# 3. Chain-of-Thought 提示模板
COT_TEMPLATES = {
    "math_reasoning": PromptTemplate(
        name="数学推理（CoT）",
        style=PromptStyle.CHAIN_OF_THOUGHT,
        template="""请一步一步地解决这个数学问题。

问题：{question}

让我们一步一步思考：
1. 首先，我需要理解问题...
2. 然后，我需要...
3. 接下来，...
4. 最后，答案是...

请按照上述格式，展示你的推理过程，然后给出最终答案。""",
        description="使用思维链进行数学推理"
    ),
    "logic_reasoning": PromptTemplate(
        name="逻辑推理（CoT）",
        style=PromptStyle.CHAIN_OF_THOUGHT,
        template="""请分析以下逻辑问题，展示你的推理过程。

问题：{question}

推理过程：
1. 首先，分析已知条件...
2. 然后，根据逻辑规则...
3. 接下来，得出结论...
4. 最终答案是...

请展示完整的推理链条。""",
        description="使用思维链进行逻辑推理"
    )
}

# 4. 结构化输出提示模板
STRUCTURED_TEMPLATES = {
    "json_output": PromptTemplate(
        name="JSON 输出",
        style=PromptStyle.STRUCTURED,
        template="""请分析以下文本，并以JSON格式输出结果。

文本：{text}

请严格按照以下JSON格式输出：
{{
    "sentiment": "正面/负面/中性",
    "confidence": 0.0-1.0,
    "keywords": ["关键词1", "关键词2"],
    "summary": "一句话摘要"
}}""",
        description="要求模型输出JSON格式"
    ),
    "table_output": PromptTemplate(
        name="表格输出",
        style=PromptStyle.STRUCTURED,
        template="""请分析以下文本，并以Markdown表格格式输出结果。

文本：{text}

请按以下格式输出表格：
| 维度 | 内容 |
|------|------|
| 情感 | ... |
| 关键词 | ... |
| 摘要 | ... |""",
        description="要求模型输出表格格式"
    )
}

def get_prompt_template(
    category: str,
    template_name: str
) -> Optional[PromptTemplate]:
    """获取提示模板"""
    all_templates = {
        **BASIC_TEMPLATES,
        **FEW_SHOT_TEMPLATES,
        **COT_TEMPLATES,
        **STRUCTURED_TEMPLATES
    }
    return all_templates.get(template_name)

def list_templates_by_style(style: PromptStyle) -> List[str]:
    """按风格列出模板"""
    all_templates = {
        **BASIC_TEMPLATES,
        **FEW_SHOT_TEMPLATES,
        **COT_TEMPLATES,
        **STRUCTURED_TEMPLATES
    }
    
    return [
        name for name, template in all_templates.items()
        if template.style == style
    ]

# 使用示例
if __name__ == "__main__":
    print("=== 提示工程模板库 ===\n")
    
    # 列出所有模板
    for style in PromptStyle:
        templates = list_templates_by_style(style)
        print(f"{style.value} 风格模板:")
        for template_name in templates:
            print(f"  - {template_name}")
        print()
    
    # 使用模板
    sentiment_template = FEW_SHOT_TEMPLATES["sentiment"]
    print("情感分析模板:")
    print(sentiment_template.template)
    
    # 填充模板
    text = "这个产品真的很好用，强烈推荐！"
    filled_prompt = sentiment_template.template.format(text=text)
    print(f"\n填充后的提示:\n{filled_prompt}")
```

```python
# 提示工程最佳实践

class PromptEngineeringGuide:
    """提示工程指南"""
    
    @staticmethod
    def basic_principles() -> str:
        """基础原则"""
        return """
提示工程基础原则
================

1. 明确性 (Clarity)
   - 用清晰的语言表达需求
   - 避免模糊和歧义
   - 明确指出期望的输出格式

2. 具体性 (Specificity)
   - 提供具体的上下文和约束
   - 指定输出的长度和格式
   - 定义角色和任务

3. 结构化 (Structure)
   - 使用清晰的结构组织提示
   - 使用分隔符区分不同部分
   - 提供示例说明期望

4. 迭代优化 (Iteration)
   - 从简单提示开始
   - 根据结果调整
   - 逐步增加复杂性

5. 测试验证 (Testing)
   - 测试多种输入
   - 验证边界情况
   - 确保一致性
"""
    
    @staticmethod
    def few_shot_guide() -> str:
        """Few-shot 指南"""
        return """
Few-shot 学习指南
================

什么是 Few-shot？
- 通过提供少量示例来引导模型
- 让模型从示例中学习模式
- 无需重新训练模型

使用场景：
1. 分类任务（情感分析、主题分类）
2. 格式转换（数据提取、格式化）
3. 风格模仿（写作风格、语气）
4. 特定任务（翻译、摘要）

最佳实践：
1. 示例数量：3-5个通常足够
2. 示例多样性：覆盖不同情况
3. 示例质量：确保正确性和一致性
4. 示例顺序：从简单到复杂

注意事项：
- 避免示例偏见
- 保持示例格式一致
- 不要过度依赖示例
"""
    
    @staticmethod
    def chain_of_thought_guide() -> str:
        """Chain-of-Thought 指南"""
        return """
Chain-of-Thought (CoT) 指南
==========================

什么是 CoT？
- 让模型展示推理过程
- 将复杂问题分解为步骤
- 提高推理和数学能力

适用场景：
1. 数学问题
2. 逻辑推理
3. 复杂分析
4. 多步骤任务

CoT 变体：
1. Zero-shot CoT: 添加"让我们一步一步思考"
2. Few-shot CoT: 提供带推理过程的示例
3. Self-consistency: 多次采样，选择最一致的答案

提示模板：
"请一步一步地思考这个问题：
1. 首先，...
2. 然后，...
3. 接下来，...
4. 最后，..."

效果：
- 数学问题准确率提高 20-30%
- 逻辑推理能力显著提升
- 可解释性增强
"""
    
    @staticmethod
    def structured_output_guide() -> str:
        """结构化输出指南"""
        return """
结构化输出指南
=============

为什么需要结构化输出？
1. 便于程序解析
2. 确保输出格式一致
3. 提高可靠性
4. 便于后续处理

常用结构化格式：
1. JSON - 最常用，易于解析
2. XML - 层次清晰
3. Markdown - 可读性好
4. CSV - 表格数据
5. YAML - 配置文件格式

JSON 输出提示示例：
"请以JSON格式输出，包含以下字段：
{
    "field1": "值1",
    "field2": ["值2", "值3"],
    "field3": {
        "nested1": "值4"
    }
}"

最佳实践：
1. 明确指定字段和类型
2. 提供示例格式
3. 处理可能的错误
4. 验证输出格式
"""

# 使用示例
if __name__ == "__main__":
    guide = PromptEngineeringGuide()
    
    print(guide.basic_principles())
    print(guide.few_shot_guide())
    print(guide.chain_of_thought_guide())
    print(guide.structured_output_guide())
```

```python
# 实战：构建提示管理系统

from typing import Dict, List, Any
from dataclasses import dataclass
import json

@dataclass
class PromptConfig:
    """提示配置"""
    name: str
    template: str
    variables: List[str]
    model: str = "gpt-3.5-turbo"
    temperature: float = 0.7
    max_tokens: int = 1000

class PromptManager:
    """提示管理器"""
    
    def __init__(self):
        self.prompts: Dict[str, PromptConfig] = {}
    
    def register_prompt(self, config: PromptConfig):
        """注册提示配置"""
        self.prompts[config.name] = config
    
    def get_prompt(self, name: str, **kwargs) -> str:
        """获取填充后的提示"""
        if name not in self.prompts:
            raise ValueError(f"提示 '{name}' 不存在")
        
        config = self.prompts[name]
        
        # 检查必要的变量
        for var in config.variables:
            if var not in kwargs:
                raise ValueError(f"缺少必要变量: {var}")
        
        # 填充模板
        return config.template.format(**kwargs)
    
    def get_config(self, name: str) -> PromptConfig:
        """获取提示配置"""
        return self.prompts.get(name)
    
    def list_prompts(self) -> List[str]:
        """列出所有提示"""
        return list(self.prompts.keys())
    
    def export_prompts(self, filepath: str):
        """导出提示配置"""
        data = {}
        for name, config in self.prompts.items():
            data[name] = {
                "template": config.template,
                "variables": config.variables,
                "model": config.model,
                "temperature": config.temperature,
                "max_tokens": config.max_tokens
            }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

# 创建提示管理器实例
prompt_manager = PromptManager()

# 注册一些提示
prompt_manager.register_prompt(PromptConfig(
    name="sentiment_analysis",
    template="""请分析以下文本的情感。

文本：{text}

请输出JSON格式：
{{
    "sentiment": "正面/负面/中性",
    "confidence": 0.0-1.0,
    "reason": "分析原因"
}}""",
    variables=["text"],
    model="gpt-3.5-turbo",
    temperature=0.3
))

prompt_manager.register_prompt(PromptConfig(
    name="code_review",
    template="""请审查以下代码，并提供改进建议。

代码：
```{language}
{code}
```

审查要点：
1. 代码质量
2. 性能优化
3. 安全性
4. 可维护性

请提供详细的审查报告。""",
    variables=["code", "language"],
    model="gpt-4",
    temperature=0.5
))

# 使用示例
if __name__ == "__main__":
    print("=== 提示管理系统 ===\n")
    
    # 列出所有提示
    print("可用提示:")
    for name in prompt_manager.list_prompts():
        config = prompt_manager.get_config(name)
        print(f"  - {name}: {config.variables}")
    
    # 使用提示
    print("\n使用情感分析提示:")
    prompt = prompt_manager.get_prompt(
        "sentiment_analysis",
        text="这个产品真的很好用，强烈推荐！"
    )
    print(prompt)
    
    # 导出提示配置
    prompt_manager.export_prompts("prompts_config.json")
    print("\n提示配置已导出到 prompts_config.json")
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 输出不符合预期 | 优化提示，提供更多示例 |
| 2 | CoT 不工作 | 尝试更明确的步骤指示 |
| 3 | JSON 解析失败 | 提供更详细的格式说明 |
| 4 | 模型忽略指令 | 使用更强的强调，如全大写 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Prompt Engineering | 设计有效提示的技术 |
| Few-shot | 通过示例引导模型学习 |
| Chain-of-Thought | 让模型展示推理过程 |
| Zero-shot | 不提供示例，直接提问 |
| Temperature | 控制输出随机性的参数 |
| Token | 模型处理文本的基本单位 |
| Context Window | 模型能处理的最大文本长度 |

## ✅ 验收清单
- [ ] 理解提示工程的基本原则
- [ ] 能使用 Few-shot 提示
- [ ] 能使用 CoT 进行推理
- [ ] 能设计结构化输出提示

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
