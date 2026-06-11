# Day 4: 提示工程 - Few-shot / CoT / 结构化输出

## 今日学习目标

1. 掌握提示工程的基本原则
2. 学习 Few-shot 提示方法
3. 掌握 Chain-of-Thought 推理
4. 设计结构化输出提示
5. 构建提示管理系统

---

## 第一部分：提示工程基础

### 什么是提示工程？

**类比理解：**
提示工程就像和聪明但需要明确指示的助手沟通：
- 好的提示 = 好的问题，能引导出最好的答案
- 差的提示 = 模糊的指令，得到模糊的回答

### 提示的基本结构

```
系统提示 (System Prompt)
    ↓ 定义 AI 的角色和行为
用户提示 (User Prompt)
    ↓ 具体的任务和要求
示例 (Examples)
    ↓ 展示期望的输入输出格式
输出要求 (Output Requirements)
    → 指定期望的格式和约束
```

---

## 第二部分：Few-shot 学习

### 什么是 Few-shot？

**类比理解：**
Few-shot 就像给孩子看例题：
- 给几个例子（3-5个）
- 孩子从例子中学习模式
- 然后应用到新的问题

### 文件：app/prompt/few_shot.py

```python
"""
Few-shot 提示模板
"""

from typing import List, Dict, Optional
from dataclasses import dataclass


@dataclass
class FewShotExample:
    """Few-shot 示例"""
    input_text: str
    output_text: str


class FewShotPromptBuilder:
    """Few-shot 提示构建器"""
    
    def __init__(self, task_description: str):
        """
        初始化
        
        Args:
            task_description: 任务描述
        """
        self.task_description = task_description
        self.examples: List[FewShotExample] = []
    
    def add_example(self, input_text: str, output_text: str) -> 'FewShotPromptBuilder':
        """添加示例"""
        self.examples.append(FewShotExample(input_text, output_text))
        return self
    
    def build(self, input_text: str) -> str:
        """构建提示"""
        parts = [self.task_description, ""]
        
        # 添加示例
        if self.examples:
            parts.append("示例：")
            parts.append("")
            
            for i, example in enumerate(self.examples, 1):
                parts.append(f"输入 {i}: {example.input_text}")
                parts.append(f"输出 {i}: {example.output_text}")
                parts.append("")
        
        # 添加当前输入
        parts.append("现在请处理：")
        parts.append(f"输入: {input_text}")
        parts.append("输出:")
        
        return "\n".join(parts)


# ==================== 情感分析 Few-shot ====================

class SentimentFewShot:
    """情感分析 Few-shot 提示"""
    
    @staticmethod
    def build_prompt(text: str) -> str:
        """构建情感分析提示"""
        builder = FewShotPromptBuilder(
            "请分析以下文本的情感。"
        )
        
        builder.add_example(
            "这个产品非常好用，我很满意！",
            "正面 (积极情感)"
        )
        builder.add_example(
            "服务太差了，再也不来了。",
            "负面 (消极情感)"
        )
        builder.add_example(
            "今天天气一般。",
            "中性 (无明显情感)"
        )
        
        return builder.build(text)


# ==================== 分类 Few-shot ====================

class ClassificationFewShot:
    """文本分类 Few-shot 提示"""
    
    @staticmethod
    def build_prompt(text: str) -> str:
        """构建分类提示"""
        builder = FewShotPromptBuilder(
            "请将文本分类为以下类别：技术、科学、商业、娱乐、体育"
        )
        
        builder.add_example(
            "Python 是一种流行的编程语言",
            "技术"
        )
        builder.add_example(
            "今天的股市大涨",
            "商业"
        )
        builder.add_example(
            "世界杯决赛今晚举行",
            "体育"
        )
        builder.add_example(
            "新上映的电影票房破纪录",
            "娱乐"
        )
        
        return builder.build(text)


# ==================== 翻译 Few-shot ====================

class TranslationFewShot:
    """翻译 Few-shot 提示"""
    
    @staticmethod
    def build_prompt(text: str, direction: str = "zh_to_en") -> str:
        """构建翻译提示"""
        if direction == "zh_to_en":
            builder = FewShotPromptBuilder(
                "请将中文翻译成英文。"
            )
            
            builder.add_example(
                "今天天气很好。",
                "The weather is nice today."
            )
            builder.add_example(
                "我喜欢编程。",
                "I like programming."
            )
            builder.add_example(
                "人工智能改变世界。",
                "Artificial intelligence is changing the world."
            )
        else:
            builder = FewShotPromptBuilder(
                "Please translate English to Chinese."
            )
            
            builder.add_example(
                "The weather is nice today.",
                "今天天气很好。"
            )
            builder.add_example(
                "I like programming.",
                "我喜欢编程。"
            )
        
        return builder.build(text)


# 使用示例
if __name__ == "__main__":
    print("=== 情感分析 Few-shot ===\n")
    prompt = SentimentFewShot.build_prompt("这个服务真的很棒！")
    print(prompt)
    
    print("\n=== 分类 Few-shot ===\n")
    prompt = ClassificationFewShot.build_prompt("机器学习是AI的重要分支")
    print(prompt)
    
    print("\n=== 翻译 Few-shot ===\n")
    prompt = TranslationFewShot.build_prompt("深度学习技术发展迅速")
    print(prompt)
```

---

## 第三部分：Chain-of-Thought (CoT)

### 什么是 CoT？

**类比理解：**
CoT 就像让孩子展示解题过程：
- 不只要答案，还要步骤
- 帮助理清思路
- 减少错误

### CoT 的优势

```
传统提示：
Q: 小明有5个苹果，给了小红3个，又买了2个，现在有几个？
A: 4个

CoT 提示：
Q: 小明有5个苹果，给了小红3个，又买了2个，现在有几个？
A: 让我们一步一步思考：
1. 小明开始有5个苹果
2. 给了小红3个，剩下 5 - 3 = 2个
3. 又买了2个，现在有 2 + 2 = 4个
答案: 4个
```

### 文件：app/prompt/cot.py

```python
"""
Chain-of-Thought 提示模板
"""

from typing import List, Optional
from dataclasses import dataclass


@dataclass
class CoTExample:
    """CoT 示例"""
    question: str
    reasoning: List[str]
    answer: str


class CoTPromptBuilder:
    """CoT 提示构建器"""
    
    def __init__(self, task_description: str):
        self.task_description = task_description
        self.examples: List[CoTExample] = []
    
    def add_example(
        self, 
        question: str, 
        reasoning: List[str], 
        answer: str
    ) -> 'CoTPromptBuilder':
        """添加示例"""
        self.examples.append(CoTExample(question, reasoning, answer))
        return self
    
    def build(self, question: str) -> str:
        """构建提示"""
        parts = [self.task_description, ""]
        
        # 添加示例
        if self.examples:
            parts.append("示例：")
            parts.append("")
            
            for i, example in enumerate(self.examples, 1):
                parts.append(f"问题 {i}: {example.question}")
                parts.append("推理过程:")
                for step in example.reasoning:
                    parts.append(f"  {step}")
                parts.append(f"答案: {example.answer}")
                parts.append("")
        
        # 添加当前问题
        parts.append("现在请回答：")
        parts.append(f"问题: {question}")
        parts.append("让我们一步一步思考:")
        
        return "\n".join(parts)


# ==================== 数学推理 CoT ====================

class MathCoT:
    """数学推理 CoT"""
    
    @staticmethod
    def build_prompt(question: str) -> str:
        """构建数学推理提示"""
        builder = CoTPromptBuilder(
            "请一步一步地解决这个数学问题。"
        )
        
        builder.add_example(
            "小明有5个苹果，给了小红3个，又买了2个，现在有几个？",
            [
                "1. 小明开始有5个苹果",
                "2. 给了小红3个，剩下 5 - 3 = 2个",
                "3. 又买了2个，现在有 2 + 2 = 4个"
            ],
            "4个"
        )
        
        builder.add_example(
            "一个长方形的长是8cm，宽是5cm，面积是多少？",
            [
                "1. 长方形面积公式: 面积 = 长 × 宽",
                "2. 代入数值: 面积 = 8 × 5",
                "3. 计算结果: 面积 = 40"
            ],
            "40平方厘米"
        )
        
        return builder.build(question)


# ==================== 逻辑推理 CoT ====================

class LogicCoT:
    """逻辑推理 CoT"""
    
    @staticmethod
    def build_prompt(question: str) -> str:
        """构建逻辑推理提示"""
        builder = CoTPromptBuilder(
            "请分析以下逻辑问题，展示你的推理过程。"
        )
        
        builder.add_example(
            "所有的猫都是动物，Tom是一只猫，Tom是什么？",
            [
                "1. 已知条件: 所有的猫都是动物",
                "2. 已知条件: Tom是一只猫",
                "3. 根据三段论推理: 如果所有A都是B，且C是A，那么C是B",
                "4. 应用推理: 所有的猫(Tom)都是动物，所以Tom是动物"
            ],
            "Tom是动物"
        )
        
        return builder.build(question)


# ==================== 代码推理 CoT ====================

class CodeCoT:
    """代码推理 CoT"""
    
    @staticmethod
    def build_prompt(question: str) -> str:
        """构建代码推理提示"""
        builder = CoTPromptBuilder(
            "请分析以下编程问题，展示你的推理过程。"
        )
        
        builder.add_example(
            "如何判断一个数是否是偶数？",
            [
                "1. 偶数的定义: 能被2整除的数",
                "2. 判断方法: 用这个数除以2，看余数是否为0",
                "3. 代码实现: 使用取模运算符 %",
                "4. 示例: 4 % 2 == 0, 所以4是偶数"
            ],
            "使用 n % 2 == 0 判断"
        )
        
        return builder.build(question)


# 使用示例
if __name__ == "__main__":
    print("=== 数学推理 CoT ===\n")
    prompt = MathCoT.build_prompt("小华有10块钱，买了3本书，每本2块钱，还剩多少钱？")
    print(prompt)
    
    print("\n=== 逻辑推理 CoT ===\n")
    prompt = LogicCoT.build_prompt("如果今天是星期三，那么后天是星期几？")
    print(prompt)
    
    print("\n=== 代码推理 CoT ===\n")
    prompt = CodeCoT.build_prompt("如何反转一个字符串？")
    print(prompt)
```

---

## 第四部分：结构化输出提示

### 文件：app/prompt/structured.py

```python
"""
结构化输出提示模板
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import json


@dataclass
class StructuredOutputTemplate:
    """结构化输出模板"""
    name: str
    description: str
    output_schema: Dict[str, Any]
    example_output: Dict[str, Any]
    instructions: str


class StructuredOutputPromptBuilder:
    """结构化输出提示构建器"""
    
    def __init__(self):
        self.templates: Dict[str, StructuredOutputTemplate] = {}
    
    def register_template(self, template: StructuredOutputTemplate):
        """注册模板"""
        self.templates[template.name] = template
    
    def build_prompt(
        self, 
        template_name: str, 
        text: str,
        additional_instructions: str = ""
    ) -> str:
        """构建提示"""
        template = self.templates.get(template_name)
        if not template:
            raise ValueError(f"模板 '{template_name}' 不存在")
        
        prompt_parts = [
            template.description,
            "",
            "任务:",
            template.instructions,
            "",
            "输入文本:",
            text,
            "",
            "请严格按照以下JSON格式输出:",
            json.dumps(template.output_schema, indent=2, ensure_ascii=False),
            "",
            "示例输出:",
            json.dumps(template.example_output, indent=2, ensure_ascii=False),
        ]
        
        if additional_instructions:
            prompt_parts.extend([
                "",
                "额外说明:",
                additional_instructions
            ])
        
        return "\n".join(prompt_parts)


# 创建模板构建器
builder = StructuredOutputPromptBuilder()

# 注册情感分析模板
builder.register_template(StructuredOutputTemplate(
    name="sentiment_analysis",
    description="分析文本的情感倾向",
    output_schema={
        "sentiment": "positive/negative/neutral",
        "confidence": "0.0-1.0",
        "keywords": ["关键词列表"],
        "reason": "分析原因"
    },
    example_output={
        "sentiment": "positive",
        "confidence": 0.95,
        "keywords": ["好用", "满意"],
        "reason": "文本表达了积极的情绪"
    },
    instructions="分析文本的情感倾向，输出JSON格式"
))

# 注册实体抽取模板
builder.register_template(StructuredOutputTemplate(
    name="entity_extraction",
    description="从文本中提取实体信息",
    output_schema={
        "entities": [
            {
                "text": "实体文本",
                "type": "PERSON/ORG/LOC/DATE",
                "start_pos": 0,
                "end_pos": 10
            }
        ],
        "entity_count": "实体数量"
    },
    example_output={
        "entities": [
            {"text": "张三", "type": "PERSON", "start_pos": 0, "end_pos": 2},
            {"text": "北京", "type": "LOC", "start_pos": 5, "end_pos": 7}
        ],
        "entity_count": 2
    },
    instructions="从文本中提取人名、组织、地点、日期等实体"
))

# 注册摘要模板
builder.register_template(StructuredOutputTemplate(
    name="summarization",
    description="生成文本摘要",
    output_schema={
        "summary": "一句话摘要",
        "key_points": ["关键点列表"],
        "word_count": "摘要字数"
    },
    example_output={
        "summary": "本文讨论了人工智能的发展趋势",
        "key_points": ["AI技术进步", "应用领域扩展", "伦理问题"],
        "word_count": 15
    },
    instructions="生成简洁的文本摘要，包含关键点"
))


# 使用示例
if __name__ == "__main__":
    print("=== 情感分析提示 ===\n")
    prompt = builder.build_prompt(
        "sentiment_analysis",
        "这个产品非常好用，我很满意！"
    )
    print(prompt)
    
    print("\n=== 实体抽取提示 ===\n")
    prompt = builder.build_prompt(
        "entity_extraction",
        "张三在北京的公司工作，他觉得Python很好用。"
    )
    print(prompt)
    
    print("\n=== 摘要提示 ===\n")
    prompt = builder.build_prompt(
        "summarization",
        "人工智能技术正在快速发展，已经应用到各个领域。从医疗到教育，从金融到制造，AI都在发挥着重要作用。然而，随着AI的普及，也带来了一些伦理问题，比如隐私保护、就业影响等。"
    )
    print(prompt)
```

---

## 第五部分：提示工程最佳实践

### 文件：app/prompt/best_practices.py

```python
"""
提示工程最佳实践
"""

from typing import List, Dict


class PromptBestPractices:
    """提示工程最佳实践"""
    
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
    \"field1\": \"值1\",
    \"field2\": [\"值2\", \"值3\"],
    \"field3\": {
        \"nested1\": \"值4\"
    }
}"

最佳实践：
1. 明确指定字段和类型
2. 提供示例格式
3. 处理可能的错误
4. 验证输出格式
"""
    
    @staticmethod
    def common_mistakes() -> str:
        """常见错误"""
        return """
提示工程常见错误
===============

1. 提示太模糊
   错误: "帮我分析一下"
   正确: "请分析以下文本的情感，输出JSON格式"

2. 缺少示例
   错误: "分类文本"
   正确: 提供3-5个分类示例

3. 格式要求不明确
   错误: "输出结果"
   正确: "输出JSON格式，包含sentiment和confidence字段"

4. 约束条件不清晰
   错误: "写一段话"
   正确: "用50-100字写一段关于AI的介绍"

5. 忽略边界情况
   错误: 只测试正常输入
   正确: 测试空输入、超长输入、特殊字符等

6. 不迭代优化
   错误: 一次性写出完美提示
   正确: 从简单开始，逐步优化
"""


# 使用示例
if __name__ == "__main__":
    practices = PromptBestPractices()
    
    print(practices.basic_principles())
    print(practices.few_shot_guide())
    print(practices.chain_of_thought_guide())
    print(practices.structured_output_guide())
    print(practices.common_mistakes())
```

---

## 第六部分：实战 - 构建提示管理系统

### 文件：app/prompt/manager.py

```python
"""
提示管理系统
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
import json
from datetime import datetime


@dataclass
class PromptConfig:
    """提示配置"""
    name: str
    description: str
    template: str
    variables: List[str]
    examples: List[Dict[str, str]] = field(default_factory=list)
    model: str = "gpt-3.5-turbo"
    temperature: float = 0.7
    max_tokens: int = 1000
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


class PromptManager:
    """提示管理器"""
    
    def __init__(self):
        self.prompts: Dict[str, PromptConfig] = {}
        self.version_history: Dict[str, List[PromptConfig]] = {}
    
    def register_prompt(self, config: PromptConfig):
        """注册提示配置"""
        # 保存版本历史
        if config.name in self.prompts:
            if config.name not in self.version_history:
                self.version_history[config.name] = []
            self.version_history[config.name].append(self.prompts[config.name])
        
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
    
    def get_config(self, name: str) -> Optional[PromptConfig]:
        """获取提示配置"""
        return self.prompts.get(name)
    
    def list_prompts(self) -> List[str]:
        """列出所有提示"""
        return list(self.prompts.keys())
    
    def list_prompts_with_info(self) -> List[Dict[str, Any]]:
        """列出所有提示（带详细信息）"""
        result = []
        for name, config in self.prompts.items():
            result.append({
                "name": name,
                "description": config.description,
                "variables": config.variables,
                "model": config.model,
                "temperature": config.temperature,
                "created_at": config.created_at.isoformat()
            })
        return result
    
    def update_prompt(self, name: str, **kwargs):
        """更新提示配置"""
        if name not in self.prompts:
            raise ValueError(f"提示 '{name}' 不存在")
        
        config = self.prompts[name]
        
        for key, value in kwargs.items():
            if hasattr(config, key):
                setattr(config, key, value)
        
        config.updated_at = datetime.now()
    
    def delete_prompt(self, name: str):
        """删除提示"""
        if name not in self.prompts:
            raise ValueError(f"提示 '{name}' 不存在")
        
        del self.prompts[name]
    
    def export_prompts(self, filepath: str):
        """导出提示配置"""
        data = {}
        for name, config in self.prompts.items():
            data[name] = {
                "description": config.description,
                "template": config.template,
                "variables": config.variables,
                "examples": config.examples,
                "model": config.model,
                "temperature": config.temperature,
                "max_tokens": config.max_tokens
            }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def import_prompts(self, filepath: str):
        """导入提示配置"""
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for name, config_data in data.items():
            config = PromptConfig(
                name=name,
                description=config_data.get("description", ""),
                template=config_data["template"],
                variables=config_data["variables"],
                examples=config_data.get("examples", []),
                model=config_data.get("model", "gpt-3.5-turbo"),
                temperature=config_data.get("temperature", 0.7),
                max_tokens=config_data.get("max_tokens", 1000)
            )
            self.register_prompt(config)


# 使用示例
if __name__ == "__main__":
    # 创建管理器
    manager = PromptManager()
    
    # 注册提示
    manager.register_prompt(PromptConfig(
        name="sentiment_analysis",
        description="情感分析提示",
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
    
    manager.register_prompt(PromptConfig(
        name="code_review",
        description="代码审查提示",
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
    
    # 列出提示
    print("=== 提示管理系统 ===\n")
    print("可用提示:")
    for info in manager.list_prompts_with_info():
        print(f"  - {info['name']}: {info['description']}")
    
    # 使用提示
    print("\n使用情感分析提示:")
    prompt = manager.get_prompt(
        "sentiment_analysis",
        text="这个产品真的很好用，强烈推荐！"
    )
    print(prompt)
    
    # 导出配置
    manager.export_prompts("prompts_config.json")
    print("\n提示配置已导出到 prompts_config.json")
```

---

## 验证清单

完成今日学习后，检查以下项目：

- [ ] 理解提示工程的基本原则
- [ ] 能使用 Few-shot 提示
- [ ] 能使用 CoT 进行推理
- [ ] 能设计结构化输出提示
- [ ] 构建了提示管理系统
- [ ] 了解了常见错误和最佳实践

---

## 今日小结

| 概念 | 关键点 |
|------|--------|
| 提示工程 | 设计有效提示的技术 |
| Few-shot | 通过示例引导模型学习 |
| Chain-of-Thought | 让模型展示推理过程 |
| Zero-shot | 不提供示例，直接提问 |
| 结构化输出 | 指定输出格式（JSON等） |
| 提示管理 | 版本控制、模板化、可复用 |

---

## 明日预告

明天我们将学习：
- "When NOT to build agents" 判断框架
- Agent 适用性分析
- 替代方案选择
- 案例分析

---

## 参考资源

- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [OpenAI Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)
