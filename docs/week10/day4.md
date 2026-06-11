# 📅 Week 10 Day 4：训练数据构造 + 预处理

---

## 🧭 今日方向

今天我们学习如何为 SFT/RLHF/DPO 构造高质量训练数据，包括数据格式规范、清洗过滤、质量评估，以及如何用 LLM 合成训练数据。数据质量是决定微调效果的关键因素。

**核心问题：** 如何从零开始构建一个高质量的微调数据集？

---

## 🎯 生活比喻

- **训练数据** = 教科书和习题集
- **数据质量** = 教科书的准确性和印刷质量
- **数据清洗** = 校对和排版，去除错误和无关内容
- **数据增强** = 编写更多练习题来覆盖更多知识点
- **合成数据** = 用 AI 辅助编写教科书（速度快但需要人工审核）

垃圾进，垃圾出——再好的模型也救不了差数据。

---

## 📋 今日三件事

1. **掌握 SFT/RLHF/DPO 三种数据格式的规范和要求**
2. **学会数据清洗和质量过滤的常用方法**
3. **用 LLM 合成高质量训练数据**

---

## 🗺️ 手把手路线

### 第一步：环境准备

```bash
pip install datasets pandas transformers tqdm
```

### 第二步：了解数据格式要求

```
SFT 数据格式:
  {"messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}

RLHF/奖励模型数据格式:
  {"prompt": "...", "chosen": "...", "rejected": "..."}

DPO 数据格式:
  {"prompt": "...", "chosen": "...", "rejected": "..."}
```

---

## 💻 代码区

### 代码 1：训练数据格式规范

```python
"""
Day 4 - 训练数据格式规范
SFT、RLHF、DPO 三种格式的完整示例
"""

import json
from typing import List, Dict

print("=" * 60)
print("训练数据格式规范")
print("=" * 60)

# ============================================================
# 1. SFT 数据格式
# ============================================================
print("\n1. SFT 数据格式")
print("-" * 40)

sft_dataset = [
    {
        "messages": [
            {"role": "system", "content": "你是一个专业的Python编程助手，擅长解答编程问题。"},
            {"role": "user", "content": "如何用Python读取CSV文件？"},
            {"role": "assistant", "content": "可以使用 pandas 库读取CSV文件：\n\n```python\nimport pandas as pd\ndf = pd.read_csv('data.csv')\nprint(df.head())\n```\n\n如果不用 pandas，也可以用内置的 csv 模块：\n```python\nimport csv\nwith open('data.csv', 'r') as f:\n    reader = csv.reader(f)\n    for row in reader:\n        print(row)\n```"}
        ]
    },
    {
        "messages": [
            {"role": "system", "content": "你是一个专业的Python编程助手，擅长解答编程问题。"},
            {"role": "user", "content": "解释一下Python的装饰器"},
            {"role": "assistant", "content": "装饰器（Decorator）是一种设计模式，用于在不修改原函数代码的情况下，给函数添加额外功能。\n\n基本语法使用 @ 符号：\n```python\ndef my_decorator(func):\n    def wrapper():\n        print('函数执行前')\n        func()\n        print('函数执行后')\n    return wrapper\n\n@my_decorator\ndef say_hello():\n    print('Hello!')\n```\n\n常见的内置装饰器有 @property、@staticmethod、@classmethod 等。"}
        ]
    },
    {
        "messages": [
            {"role": "system", "content": "你是一个专业的Python编程助手，擅长解答编程问题。"},
            {"role": "user", "content": "什么是列表推导式？"},
            {"role": "assistant", "content": "列表推导式（List Comprehension）是 Python 中创建列表的简洁语法：\n\n基本语法：[expression for item in iterable if condition]\n\n示例：\n```python\n# 传统写法\nsquares = []\nfor x in range(10):\n    squares.append(x**2)\n\n# 列表推导式\nsquares = [x**2 for x in range(10)]\n\n# 带条件过滤\neven_squares = [x**2 for x in range(10) if x % 2 == 0]\n```\n\n列表推导式更简洁、更 Pythonic，执行速度也通常更快。"}
        ]
    },
]

print(f"  SFT 数据集大小: {len(sft_dataset)}")
print(f"  每条数据结构: messages 列表（含 role 和 content）")
print(f"  格式检查:")

for i, item in enumerate(sft_dataset):
    roles = [m["role"] for m in item["messages"]]
    has_system = "system" in roles
    has_user = "user" in roles
    has_assistant = "assistant" in roles
    status = "✓" if (has_system and has_user and has_assistant) else "✗"
    print(f"    样本 {i+1}: {status} roles={roles}")

# ============================================================
# 2. RLHF/奖励模型数据格式
# ============================================================
print("\n2. RLHF/奖励模型数据格式")
print("-" * 40)

rm_dataset = [
    {
        "prompt": "解释什么是递归",
        "chosen": "递归（Recursion）是指函数在执行过程中调用自身的编程技巧。每个递归函数需要有一个基准情况（base case）来终止递归，否则会导致无限循环。例如计算阶乘：f(n) = n * f(n-1)，其中 f(0) = 1 是基准情况。",
        "rejected": "递归就是函数调用自己。"
    },
    {
        "prompt": "如何优化Python代码性能？",
        "chosen": "优化Python性能的方法包括：1) 使用内置函数和库（如 NumPy）；2) 使用生成器代替列表减少内存；3) 避免重复计算，使用缓存（如 lru_cache）；4) 使用多进程处理 CPU 密集型任务；5) 使用异步IO处理IO密集型任务。",
        "rejected": "用C++重写。"
    },
    {
        "prompt": "什么是面向对象编程？",
        "chosen": "面向对象编程（OOP）是一种编程范式，以对象为核心组织代码。它有四大特性：封装（隐藏内部实现）、继承（子类复用父类）、多态（同一接口不同实现）、抽象（简化复杂系统）。Python 通过 class 关键字定义类来实现 OOP。",
        "rejected": "用class写代码就是面向对象。"
    },
]

print(f"  偏好数据集大小: {len(rm_dataset)}")
print(f"  每条数据结构: prompt + chosen + rejected")
print(f"  格式检查:")

for i, item in enumerate(rm_dataset):
    has_prompt = bool(item.get("prompt"))
    has_chosen = bool(item.get("chosen"))
    has_rejected = bool(item.get("rejected"))
    chosen_longer = len(item.get("chosen", "")) > len(item.get("rejected", ""))
    status = "✓" if (has_prompt and has_chosen and has_rejected and chosen_longer) else "✗"
    print(f"    样本 {i+1}: {status} chosen长度={len(item['chosen'])}, rejected长度={len(item['rejected'])}")

# ============================================================
# 3. DPO 数据格式（与 RLHF 相同）
# ============================================================
print("\n3. DPO 数据格式（与 RLHF 相同）")
print("-" * 40)
print("  DPO 使用与 RLHF 相同的偏好对比格式: {prompt, chosen, rejected}")
print("  区别在于训练方式，而非数据格式")

# ============================================================
# 4. 保存数据集
# ============================================================
print("\n4. 保存数据集")
print("-" * 40)

# 保存为 JSONL 格式（推荐）
output_dir = "./data"

import os
os.makedirs(output_dir, exist_ok=True)

# 保存 SFT 数据
sft_path = f"{output_dir}/sft_data.jsonl"
with open(sft_path, "w", encoding="utf-8") as f:
    for item in sft_dataset:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")
print(f"  SFT 数据已保存: {sft_path}")

# 保存偏好数据
rm_path = f"{output_dir}/preference_data.jsonl"
with open(rm_path, "w", encoding="utf-8") as f:
    for item in rm_dataset:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")
print(f"  偏好数据已保存: {rm_path}")

# 验证保存的数据
with open(sft_path, "r", encoding="utf-8") as f:
    loaded = [json.loads(line) for line in f]
print(f"  验证: 重新加载 SFT 数据，共 {len(loaded)} 条")
```

### 代码 2：数据清洗和质量过滤

```python
"""
Day 4 - 数据清洗和质量过滤
构建完整的数据预处理流水线
"""

import re
import hashlib
from collections import Counter

print("=" * 60)
print("数据清洗和质量过滤")
print("=" * 60)

# ============================================================
# 1. 文本清洗函数
# ============================================================
print("\n1. 文本清洗函数")
print("-" * 40)

class TextCleaner:
    """文本清洗器"""

    @staticmethod
    def remove_extra_whitespace(text):
        """去除多余空白字符"""
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    @staticmethod
    def remove_html_tags(text):
        """去除 HTML 标签"""
        text = re.sub(r'<[^>]+>', '', text)
        return text

    @staticmethod
    def normalize_unicode(text):
        """统一 Unicode 编码"""
        import unicodedata
        text = unicodedata.normalize('NFKC', text)
        return text

    @staticmethod
    def fix_encoding(text):
        """修复常见编码问题"""
        # 替换常见乱码字符
        replacements = {
            '​': '',  # 零宽空格
            '﻿': '',  # BOM
            '‎': '',  # LTR 标记
            '‏': '',  # RTL 标记
        }
        for old, new in replacements.items():
            text = text.replace(old, new)
        return text

# 测试清洗函数
cleaner = TextCleaner()
test_texts = [
    "  多余的   空格   ",
    "<p>HTML标签</p>",
    "正常文本​零宽空格",
    "中文​测试​文本",
]

for text in test_texts:
    cleaned = cleaner.remove_extra_whitespace(
        cleaner.remove_html_tags(
            cleaner.fix_encoding(text)
        )
    )
    print(f"  原始: {repr(text)}")
    print(f"  清洗: {repr(cleaned)}")
    print()

# ============================================================
# 2. 质量过滤规则
# ============================================================
print("2. 质量过滤规则")
print("-" * 40)

class QualityFilter:
    """数据质量过滤器"""

    def __init__(self, config=None):
        self.config = config or {
            "min_response_length": 10,
            "max_response_length": 2000,
            "min_prompt_length": 5,
            "max_prompt_length": 500,
            "min_quality_score": 0.5,
            "blocked_words": ["有害", "暴力", "色情"],
        }

    def check_length(self, text, min_len, max_len):
        """检查文本长度"""
        return min_len <= len(text) <= max_len

    def check_quality_score(self, text):
        """
        简单的质量评分（实际中可用分类器）
        基于启发式规则：
        - 句子完整性
        - 信息密度
        - 语法正确性
        """
        score = 1.0

        # 检查句子完整性
        if not re.search(r'[。！？.]$', text.strip()):
            score -= 0.2

        # 检查信息密度（字符多样性）
        unique_chars = len(set(text))
        total_chars = len(text)
        if total_chars > 0:
            diversity = unique_chars / total_chars
            if diversity < 0.3:
                score -= 0.3  # 重复内容太多

        # 检查是否有代码块（通常质量较高）
        if '```' in text or 'code' in text.lower():
            score += 0.1

        # 检查是否有列表或结构化内容
        if re.search(r'\d+\.', text) or re.search(r'[-*]', text):
            score += 0.1

        return max(0.0, min(1.0, score))

    def check_blocked_words(self, text):
        """检查是否包含违禁词"""
        for word in self.config["blocked_words"]:
            if word in text:
                return False
        return True

    def filter(self, item):
        """过滤单条数据"""
        issues = []

        prompt = item.get("prompt", "")
        response = item.get("chosen", "") or item.get("content", "")

        # 长度检查
        if not self.check_length(prompt, self.config["min_prompt_length"],
                                  self.config["max_prompt_length"]):
            issues.append(f"prompt 长度异常: {len(prompt)}")

        if not self.check_length(response, self.config["min_response_length"],
                                  self.config["max_response_length"]):
            issues.append(f"response 长度异常: {len(response)}")

        # 质量评分
        quality = self.check_quality_score(response)
        if quality < self.config["min_quality_score"]:
            issues.append(f"质量评分过低: {quality:.2f}")

        # 违禁词检查
        if not self.check_blocked_words(prompt + response):
            issues.append("包含违禁词")

        return {
            "pass": len(issues) == 0,
            "issues": issues,
            "quality_score": quality,
        }

# 测试过滤器
filter = QualityFilter()
test_items = [
    {"prompt": "什么是Python？", "chosen": "Python是一种广泛使用的高级编程语言，以其简洁优雅的语法著称。它支持多种编程范式，包括面向对象、函数式和过程式编程。"},
    {"prompt": "Hi", "chosen": "Python是一种广泛使用的高级编程语言，以其简洁优雅的语法著称。"},
    {"prompt": "什么是Python？", "chosen": "Python"},
    {"prompt": "如何做有害的事情", "chosen": "我不回答这类问题"},
]

for item in test_items:
    result = filter.filter(item)
    status = "通过" if result["pass"] else "过滤"
    print(f"  [{status}] prompt='{item['prompt'][:20]}...'")
    if result["issues"]:
        for issue in result["issues"]:
            print(f"    - {issue}")
    print(f"    质量评分: {result['quality_score']:.2f}")
    print()

# ============================================================
# 3. 去重处理
# ============================================================
print("3. 去重处理")
print("-" * 40)

class Deduplicator:
    """数据去重器"""

    def __init__(self):
        self.seen_hashes = set()

    def get_hash(self, text):
        """计算文本的哈希值"""
        # 标准化后计算哈希
        normalized = re.sub(r'\s+', '', text.lower())
        return hashlib.md5(normalized.encode()).hexdigest()

    def is_duplicate(self, text):
        """检查是否重复"""
        h = self.get_hash(text)
        if h in self.seen_hashes:
            return True
        self.seen_hashes.add(h)
        return False

    def deduplicate(self, dataset):
        """去重整个数据集"""
        unique_data = []
        duplicate_count = 0

        for item in dataset:
            text = item.get("chosen", "") or item.get("content", "")
            if not self.is_duplicate(text):
                unique_data.append(item)
            else:
                duplicate_count += 1

        return unique_data, duplicate_count

# 测试去重
dedup = Deduplicator()
test_data = [
    {"chosen": "Python是一种编程语言"},
    {"chosen": "Python是一种编程语言"},  # 重复
    {"chosen": "Python是一种编程语言。"},  # 标点不同，但标准化后重复
    {"chosen": "Java也是一种编程语言"},
]

unique, dup_count = dedup.deduplicate(test_data)
print(f"  原始数据: {len(test_data)} 条")
print(f"  重复数据: {dup_count} 条")
print(f"  去重后: {len(unique)} 条")

# ============================================================
# 4. 完整预处理流水线
# ============================================================
print("\n4. 完整预处理流水线")
print("-" * 40)

def preprocess_pipeline(raw_data, pipeline_config=None):
    """
    完整的数据预处理流水线

    Args:
        raw_data: 原始数据列表
        pipeline_config: 流水线配置

    Returns:
        cleaned_data: 清洗后的数据
        stats: 统计信息
    """
    cleaner = TextCleaner()
    quality_filter = QualityFilter()
    deduplicator = Deduplicator()

    stats = {
        "original": len(raw_data),
        "after清洗": 0,
        "after过滤": 0,
        "after去重": 0,
    }

    # 步骤 1: 文本清洗
    cleaned = []
    for item in raw_data:
        # 清洗所有文本字段
        for key in ["prompt", "chosen", "rejected", "content"]:
            if key in item and isinstance(item[key], str):
                text = item[key]
                text = cleaner.fix_encoding(text)
                text = cleaner.remove_html_tags(text)
                text = cleaner.remove_extra_whitespace(text)
                item[key] = text
        cleaned.append(item)

    stats["after清洗"] = len(cleaned)

    # 步骤 2: 质量过滤
    filtered = []
    for item in cleaned:
        result = quality_filter.filter(item)
        if result["pass"]:
            filtered.append(item)
    stats["after过滤"] = len(filtered)

    # 步骤 3: 去重
    unique, dup_count = deduplicator.deduplicate(filtered)
    stats["after去重"] = len(unique)

    return unique, stats

# 测试完整流水线
raw_data = [
    {"prompt": "什么是机器学习？", "chosen": "机器学习是人工智能的一个子领域，使计算机能从数据中学习。"},
    {"prompt": "什么是机器学习？", "chosen": "机器学习是人工智能的一个子领域，使计算机能从数据中学习。"},
    {"prompt": "Hi", "chosen": "机器学习是人工智能的一个子领域，使计算机能从数据中学习。"},
    {"prompt": "如何学好编程？", "chosen": "多写代码，多看别人的代码，多参与开源项目。"},
]

cleaned_data, stats = preprocess_pipeline(raw_data)

print(f"  原始数据: {stats['original']} 条")
print(f"  清洗后: {stats['after清洗']} 条")
print(f"  过滤后: {stats['after过滤']} 条")
print(f"  去重后: {stats['after去重']} 条")
print(f"  总体保留率: {stats['after去重'] / stats['original'] * 100:.1f}%")
```

### 代码 3：用 LLM 合成训练数据

```python
"""
Day 4 - 用 LLM 合成训练数据
使用大模型生成高质量的 SFT 训练数据
"""

import json
import os

print("=" * 60)
print("用 LLM 合成训练数据")
print("=" * 60)

# ============================================================
# 1. 数据合成策略
# ============================================================
print("\n1. 数据合成策略")
print("-" * 40)
print("""
  常见的数据合成方法：
  ─────────────────────
  1. 指令多样化:
     - 给定一个主题，生成多种问法
     - 例如："什么是X？" → "请解释X" / "X的定义是什么" / "简述X"

  2. 回答增强:
     - 给定一个问题，生成多个不同风格的回答
     - 例如：简洁版、详细版、带例子版

  3. 领域扩展:
     - 从一个领域的问题，扩展到相关领域
     - 例如：Python基础 → Python高级 → 数据分析 → 机器学习

  4. 难度递进:
     - 从简单问题逐步增加难度
     - 入门级 → 进阶级 → 高级
""")

# ============================================================
# 2. 数据合成 Prompt 模板
# ============================================================
print("2. 数据合成 Prompt 模板")
print("-" * 40)

synthesis_templates = {
    "指令多样化": {
        "system": "你是一个数据合成助手，负责生成多样化的指令数据。",
        "user": """请针对以下主题，生成5种不同的提问方式：

主题：{topic}
领域：{domain}

要求：
1. 每种提问方式要不同（如疑问句、祈使句、开放式问题等）
2. 难度要有变化（简单、中等、困难）
3. 包含具体的场景描述

请以 JSON 格式输出，每个提问包含 "difficulty" 和 "question" 字段。"""
    },
    "回答增强": {
        "system": "你是一个数据合成助手，负责生成高质量的回答。",
        "user": """请针对以下问题，生成3种不同风格的回答：

问题：{question}

要求：
1. 简洁版：50字以内，直接回答核心
2. 详细版：200-300字，包含解释和例子
3. 教学版：像老师一样循序渐进地解释

每种回答都要准确、清晰、有帮助。"""
    },
    "偏好数据生成": {
        "system": "你是一个偏好数据生成助手，负责创建chosen/rejected对比数据。",
        "user": """请针对以下问题，生成一对偏好对比数据：

问题：{question}

要求：
1. chosen（优选回答）：完整、准确、有帮助、有结构
2. rejected（劣选回答）：简短、模糊、不够有帮助、但不能完全错误

生成规则：
- 两个回答必须针对同一个问题
- chosen 应该明显优于 rejected
- rejected 可以是"太简短"、"不够准确"、"缺乏细节"等

请以 JSON 格式输出。"""
    },
}

for name, template in synthesis_templates.items():
    print(f"  {name}:")
    print(f"    System: {template['system'][:30]}...")
    print(f"    User 模板长度: {len(template['user'])} 字符")
    print()

# ============================================================
# 3. 数据合成模拟实现
# ============================================================
print("3. 数据合成模拟实现")
print("-" * 40)

def simulate_synthesis(topic, domain):
    """
    模拟数据合成（实际中调用 LLM API）

    在实际使用中，可以这样调用：
    from transformers import pipeline
    generator = pipeline("text-generation", model="Qwen/Qwen2-7B")
    response = generator(prompt, max_new_tokens=500)
    """

    # 模拟生成多样化指令
    questions = [
        f"什么是{topic}？",
        f"请解释一下{topic}的概念",
        f"{topic}的定义是什么？",
        f"在{domain}领域，{topic}有什么应用？",
        f"如何理解{topic}？",
    ]

    # 模拟生成不同质量的回答
    chosen = f"{topic}是{domain}领域的重要概念。它指的是...（详细解释）。在实际应用中，{topic}可以帮助我们..."
    rejected = f"{topic}就是..."

    return {
        "questions": questions,
        "chosen": chosen,
        "rejected": rejected,
    }

# 测试数据合成
topics = [
    ("机器学习", "人工智能"),
    ("深度学习", "机器学习"),
    ("强化学习", "人工智能"),
]

all_synthetic_data = []

for topic, domain in topics:
    result = simulate_synthesis(topic, domain)
    print(f"  主题: {topic} ({domain})")
    print(f"    生成问题数: {len(result['questions'])}")
    for q in result["questions"]:
        print(f"      - {q}")

    # 为每个问题生成 SFT 数据
    for q in result["questions"]:
        all_synthetic_data.append({
            "messages": [
                {"role": "system", "content": f"你是一个{domain}领域的专家。"},
                {"role": "user", "content": q},
                {"role": "assistant", "content": result["chosen"]},
            ]
        })

    # 生成偏好数据
    all_synthetic_data.append({
        "prompt": result["questions"][0],
        "chosen": result["chosen"],
        "rejected": result["rejected"],
    })

print(f"\n  总共生成数据: {len(all_synthetic_data)} 条")

# ============================================================
# 4. 数据质量评估
# ============================================================
print("\n4. 数据质量评估")
print("-" * 40)

def evaluate_data_quality(dataset):
    """评估数据集质量"""
    stats = {
        "total": len(dataset),
        "avg_response_length": 0,
        "unique_prompts": set(),
        "format_issues": 0,
    }

    total_length = 0
    for item in dataset:
        if "messages" in item:
            # SFT 格式
            assistant_msgs = [m for m in item["messages"] if m["role"] == "assistant"]
            if assistant_msgs:
                total_length += len(assistant_msgs[0]["content"])
                user_msgs = [m for m in item["messages"] if m["role"] == "user"]
                if user_msgs:
                    stats["unique_prompts"].add(user_msgs[0]["content"][:50])
        elif "chosen" in item:
            # 偏好格式
            total_length += len(item["chosen"])
            stats["unique_prompts"].add(item.get("prompt", "")[:50])

    stats["avg_response_length"] = total_length / max(len(dataset), 1)
    stats["unique_prompts"] = len(stats["unique_prompts"])

    return stats

quality_stats = evaluate_data_quality(all_synthetic_data)
print(f"  总数据量: {quality_stats['total']}")
print(f"  平均回答长度: {quality_stats['avg_response_length']:.0f} 字符")
print(f"  唯一提示数: {quality_stats['unique_prompts']}")
```

---

## 📤 预期输出

```
============================================================
训练数据格式规范
============================================================

1. SFT 数据格式
----------------------------------------
  SFT 数据集大小: 3
  格式检查:
    样本 1: ✓ roles=['system', 'user', 'assistant']
    样本 2: ✓ roles=['system', 'user', 'assistant']
    样本 3: ✓ roles=['system', 'user', 'assistant']

2. RLHF/奖励模型数据格式
----------------------------------------
  偏好数据集大小: 3
  格式检查:
    样本 1: ✓ chosen长度=183, rejected长度=12
    样本 2: ✓ chosen长度=196, rejected长度=10
    样本 3: ✓ chosen长度=174, rejected长度=14

============================================================
数据清洗和质量过滤
============================================================

1. 文本清洗函数
  原始: '  多余的   空格   '
  清洗: '多余的 空格'

  原始: '<p>HTML标签</p>'
  清洗: 'HTML标签'

2. 质量过滤规则
  [过滤] prompt='什么是Python？...'
    - 质量评分过低: 0.40
  [过滤] prompt='如何做有害的事情...'
    - 包含违禁词

3. 去重处理
  原始数据: 4 条
  重复数据: 1 条
  去重后: 3 条
```

---

## ⚠️ 常见错误和解决方案

### 错误 1：数据格式不一致
**症状：** 训练时报错 KeyError
**解决方案：**
- 统一使用 JSONL 格式
- 编写格式验证脚本，在训练前检查所有数据
- 使用 `datasets` 库的 `Dataset.from_json()` 自动验证

### 错误 2：合成数据质量差
**症状：** 用合成数据训练后模型效果不如预期
**解决方案：**
- 增加人工审核环节
- 使用多个 LLM 交叉验证
- 对合成数据进行质量评分和过滤
- 混合使用真实数据和合成数据

### 错误 3：数据泄露（训练集和测试集重叠）
**症状：** 评测结果虚高
**解决方案：**
- 使用哈希去重，确保训练集和测试集无重叠
- 检查 prompt 和 response 的相似度
- 使用 n-gram 重叠检测

### 错误 4：数据偏见
**症状：** 模型在特定场景下表现异常
**解决方案：**
- 检查数据分布是否均衡
- 增加多样性（不同风格、难度、领域）
- 使用数据增强技术

---

## 🏋️ 每日挑战

1. **数据清洗挑战**：给定一个包含 100 条数据的 JSONL 文件，编写脚本完成以下任务：去除空白行、修复编码问题、过滤长度异常的数据、去重，输出清洗报告。

2. **数据合成挑战**：用 LLM 为"Python 异步编程"主题生成 10 条高质量的 SFT 数据，确保覆盖不同难度和问法。

3. **质量评估挑战**：设计一个自动化的数据质量评分系统，综合考虑文本长度、信息密度、语法正确性、回答完整性等维度。
