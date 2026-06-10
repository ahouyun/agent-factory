# Phase 1 Week 3：LLM 原理与应用基础

> **目标**：理解大语言模型（LLM）的基本原理，掌握提示工程和 API 工程实践，为后续 Agent 开发打下理论基础。
> **周期**：Week 3，共 7 天

---

## 📅 Day 1：NLP 基础概念

### 🧭 今日方向
了解自然语言处理（NLP）的基础概念，理解 LLM 在 NLP 领域的位置。

### 🎯 生活比喻
NLP 就像"教电脑学外语"——让机器能看懂文字、听懂话、会写文章。LLM 是这个领域最厉害的"学生"。

### 📋 今日三件事
1. 了解 NLP 的定义和应用场景
2. 理解文本预处理的基本方法
3. 认识词向量和语义理解

---

### 🗺️ 手把手路线

#### 第一步：NLP 是什么

**做什么**：阅读下方概念说明，了解 NLP 的定义、任务类型和发展历程。

**为什么**：LLM 是 NLP 的产物，理解 NLP 背景才能更好理解 LLM。

**成功标志**：能说出 NLP 的 3 个典型应用场景。

---

#### 第二步：文本预处理

**做什么**：运行代码区中的文本预处理代码，理解分词、去除停用词等操作。

**为什么**：原始文本需要预处理才能被模型理解。

**成功标志**：能对一段中文文本进行基本的预处理。

---

#### 第三步：词向量入门

**做什么**：理解词向量的概念——把词语转换为数字向量。

**为什么**：词向量是连接"文字"和"数学"的桥梁。

**成功标志**：能用自己的话说出"词向量就是把词语变成一串数字"。

---

### 💻 代码区

```python
# nlp_basics.py —— NLP 基础概念

# === NLP 典型任务 ===
"""
1. 文本分类：判断文本属于哪个类别（情感分析、垃圾邮件检测）
2. 命名实体识别（NER）：识别文本中的人名、地名、机构名
3. 机器翻译：将一种语言翻译成另一种语言
4. 文本摘要：提取文本的核心内容
5. 问答系统：根据问题和文档回答问题
6. 对话系统：聊天机器人
"""

# === 文本预处理 ===
import re

def preprocess_text(text: str) -> dict:
    """
    文本预处理函数
    
    参数:
        text: 原始文本
    返回:
        预处理结果字典
    """
    # 1. 去除多余空白
    cleaned = text.strip()
    cleaned = re.sub(r'\s+', ' ', cleaned)  # 多个空白替换为一个
    
    # 2. 去除标点符号（保留中文标点）
    no_punct = re.sub(r'[^\w\s一-鿿，。！？、；：""''（）]', '', cleaned)
    
    # 3. 简单分词（按空格分割，中文需要专门的分词工具）
    words = no_punct.split()
    
    # 4. 小写转换（英文）
    lower_words = [w.lower() for w in words]
    
    return {
        "original": text,
        "cleaned": cleaned,
        "no_punctuation": no_punct,
        "words": lower_words,
        "word_count": len(lower_words),
    }

# 示例
text = "  Hello, 这是一个 NLP 基础示例！  让我们  学习  自然语言处理。  "
result = preprocess_text(text)
print("=== 文本预处理 ===")
for key, value in result.items():
    print(f"  {key}: {value}")

# === 词向量概念演示 ===
"""
词向量（Word Embedding）是将词语映射到高维空间的向量表示。

核心思想：语义相近的词，向量也相近。
例如：
  "国王" - "男人" + "女人" ≈ "女王"
  "北京" - "中国" + "日本" ≈ "东京"
"""

# 简化的词向量示例（实际使用需要预训练模型）
word_vectors = {
    "猫": [0.8, 0.2, 0.9, 0.1],     # 4 维向量
    "狗": [0.7, 0.3, 0.8, 0.2],
    "汽车": [0.1, 0.9, 0.2, 0.8],
    "飞机": [0.2, 0.8, 0.3, 0.9],
}

def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    """
    计算余弦相似度
    
    参数:
        vec1: 向量 1
        vec2: 向量 2
    返回:
        相似度（-1 到 1，越接近 1 越相似）
    """
    import math
    
    # 计算点积
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    
    # 计算模长
    norm1 = math.sqrt(sum(a ** 2 for a in vec1))
    norm2 = math.sqrt(sum(b ** 2 for b in vec2))
    
    # 避免除零
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return dot_product / (norm1 * norm2)

print("\n=== 词向量相似度 ===")
print(f"  猫 vs 狗: {cosine_similarity(word_vectors['猫'], word_vectors['狗']):.3f}")
print(f"  猫 vs 汽车: {cosine_similarity(word_vectors['猫'], word_vectors['汽车']):.3f}")
print(f"  汽车 vs 飞机: {cosine_similarity(word_vectors['汽车'], word_vectors['飞机']):.3f}")

# === NLP 发展历程 ===
print("\n=== NLP 发展历程 ===")
milestones = [
    ("1950s", "图灵测试", "提出机器智能的概念"),
    ("1980s", "规则方法", "基于语法规则的 NLP"),
    ("2000s", "统计方法", "使用概率模型"),
    ("2013", "Word2Vec", "词向量的突破"),
    ("2017", "Transformer", "注意力机制的革命"),
    ("2018", "BERT", "预训练语言模型"),
    ("2020", "GPT-3", "大语言模型时代"),
    ("2022", "ChatGPT", "LLM 的大众化"),
]

for year, name, desc in milestones:
    print(f"  {year}: {name} — {desc}")
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| 中文分词不准确 | 使用 jieba 等专业分词库：`pip install jieba` |
| 词向量计算结果不直观 | 这是简化示例，实际词向量需要大量数据训练 |
| 概念太多记不住 | 先记住核心概念，细节后面会反复遇到 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| NLP | 自然语言处理 | "教电脑学语言" |
| 文本分类 | 把文本归类 | "给文章贴标签" |
| 分词 | 把句子切成词语 | "给句子断句" |
| 词向量 | 词语的数字表示 | "词语的身份证号" |
| 语义 | 文字的含义 | "文字背后的意思" |
| 预处理 | 数据清洗 | "把菜洗好切好再炒" |
| 余弦相似度 | 衡量向量相似程度 | "两个词语有多像" |
| 停用词 | 无实际意义的词 | "的、了、是、在" |

---

### ✅ 验收清单

- [ ] 能说出 NLP 的定义和 3 个应用场景
- [ ] 能对文本进行基本的预处理
- [ ] 理解词向量的概念
- [ ] 能计算简单的余弦相似度
- [ ] 了解 NLP 的发展历程

---

### 📝 复盘小纸条

> **NLP 最让我感兴趣的应用是什么？**
>
> 
>
> **词向量的概念我理解了吗？**
>
> 
>
> **明天我想深入学习什么？**
>
> 

---

### 📥 明日同步接口

- 输入：NLP 基础概念已了解
- 输出：准备学习 Transformer 架构
- 关键交接物：理解 NLP 的基本概念和词向量

---

## 📅 Day 2：Transformer 架构概念

### 🧭 今日方向
理解 Transformer 架构的核心思想——自注意力机制，以及它如何改变了 NLP。

### 🎯 生活比喻
Transformer 就像一个"超级阅读器"——读一句话时，它会自动关注最重要的词，而不是一个字一个字地读。

### 📋 今日三件事
1. 理解注意力机制的核心思想
2. 了解 Transformer 的基本结构
3. 认识编码器和解码器

---

### 🗺️ 手把手路线

#### 第一步：注意力机制

**做什么**：阅读代码区中的注意力机制说明，理解"关注"的含义。

**为什么**：注意力机制是 Transformer 的核心创新。

**成功标志**：能说出"注意力就是让模型自动找到最重要的信息"。

---

#### 第二步：Transformer 结构

**做什么**：了解 Transformer 的编码器-解码器结构。

**为什么**：这是所有现代 LLM 的基础架构。

**成功标志**：能画出 Transformer 的简化结构图。

---

#### 第三步：预训练模型

**做什么**：了解 BERT（编码器）和 GPT（解码器）的区别。

**为什么**：这两种架构分别代表了 LLM 的两大流派。

**成功标志**：能说出 BERT 和 GPT 的主要区别。

---

### 💻 代码区

```python
# transformer_concepts.py —— Transformer 概念理解

# === 注意力机制的核心思想 ===
"""
注意力机制（Attention Mechanism）的核心思想：

传统方法：按顺序处理每个词，像流水线一样。
注意力机制：同时看所有词，自动找出哪些词之间有关联。

例子："小明去北京看电影"
  - "看" 应该关注 "电影"（看什么？看电影）
  - "去" 应该关注 "北京"（去哪里？去北京）
  - "小明" 应该关注 "看"（谁在看？小明在看）
"""

# 简化的注意力计算（概念演示）
import math

def simple_attention(query: list[float], keys: list[list[float]], values: list[list[float]]) -> list[float]:
    """
    简化的自注意力机制
    
    参数:
        query: 查询向量（当前词）
        keys: 所有词的键向量
        values: 所有词的值向量
    返回:
        加权后的输出向量
    """
    # 1. 计算注意力分数（query 和每个 key 的点积）
    scores = []
    for key in keys:
        score = sum(q * k for q, k in zip(query, key))
        scores.append(score)
    
    # 2. 缩放（除以维度的平方根）
    d_k = len(query)
    scaled_scores = [s / math.sqrt(d_k) for s in scores]
    
    # 3. Softmax 归一化（转换为概率分布）
    exp_scores = [math.exp(s) for s in scaled_scores]
    sum_exp = sum(exp_scores)
    attention_weights = [e / sum_exp for e in exp_scores]
    
    # 4. 加权求和
    output = [0.0] * len(values[0])
    for weight, value in zip(attention_weights, values):
        for i, v in enumerate(value):
            output[i] += weight * v
    
    return output, attention_weights

# 示例：3 个词的注意力计算
words = ["我", "喜欢", "猫"]
# 简化的 3 维向量
word_keys = [
    [1.0, 0.0, 0.5],    # "我"
    [0.5, 1.0, 0.0],    # "喜欢"
    [0.0, 0.5, 1.0],    # "猫"
]
word_values = [
    [1.0, 0.0],
    [0.5, 0.5],
    [0.0, 1.0],
]

# 计算 "喜欢" 对其他词的注意力
query = word_keys[1]  # "喜欢" 的向量
output, weights = simple_attention(query, word_keys, word_values)

print("=== 注意力机制演示 ===")
print(f"  句子: {' '.join(words)}")
print(f"  以 '喜欢' 为中心的注意力权重:")
for word, weight in zip(words, weights):
    bar = "█" * int(weight * 20)
    print(f"    {word}: {weight:.3f} {bar}")

# === Transformer 架构 ===
print("\n=== Transformer 架构 ===")
architecture = """
┌─────────────────────────────────────────────────┐
│                Transformer 架构                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐       ┌─────────────┐         │
│  │   编码器     │       │   解码器     │         │
│  │  (Encoder)  │       │  (Decoder)  │         │
│  │             │       │             │         │
│  │ ┌─────────┐ │       │ ┌─────────┐ │         │
│  │ │ 多头注意力│ │       │ │ 掩码注意力│ │         │
│  │ └────┬────┘ │       │ └────┬────┘ │         │
│  │      ↓      │       │      ↓      │         │
│  │ ┌─────────┐ │       │ ┌─────────┐ │         │
│  │ │ 前馈网络 │ │       │ │ 交叉注意力│ │         │
│  │ └─────────┘ │       │ └────┬────┘ │         │
│  │             │       │      ↓      │         │
│  └─────────────┘       │ ┌─────────┐ │         │
│                        │ │ 前馈网络 │ │         │
│                        │ └─────────┘ │         │
│                        └─────────────┘         │
│                                                 │
│  BERT: 只用编码器（理解型）                       │
│  GPT:  只用解码器（生成型）                       │
│  T5:   编码器 + 解码器（理解 + 生成）             │
└─────────────────────────────────────────────────┘
"""
print(architecture)

# === BERT vs GPT ===
print("=== BERT vs GPT 对比 ===")
comparison = {
    "架构": {
        "BERT": "编码器 (Encoder)",
        "GPT": "解码器 (Decoder)",
    },
    "训练方式": {
        "BERT": "掩码语言模型 (MLM)",
        "GPT": "自回归语言模型 (ARM)",
    },
    "擅长任务": {
        "BERT": "理解、分类、问答",
        "GPT": "生成、对话、创作",
    },
    "上下文方向": {
        "BERT": "双向（看前后文）",
        "GPT": "单向（只看前文）",
    },
    "代表模型": {
        "BERT": "BERT, RoBERTa, ALBERT",
        "GPT": "GPT-3, GPT-4, LLaMA",
    },
}

for aspect, models in comparison.items():
    print(f"\n  {aspect}:")
    print(f"    BERT: {models['BERT']}")
    print(f"    GPT:  {models['GPT']}")

# === 多头注意力的概念 ===
print("\n=== 多头注意力 (Multi-Head Attention) ===")
"""
单头注意力：只从一个角度关注信息。
多头注意力：从多个角度同时关注信息。

就像阅读时：
  - 语法头：关注词与词之间的语法关系
  - 语义头：关注词与词之间的语义关系
  - 位置头：关注词的位置信息
"""
print("  多头注意力 = 多个注意力头并行工作")
print("  每个头关注不同的信息维度")
print("  最后拼接所有头的输出")
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| 注意力计算太抽象 | 用"阅读时自动关注重点"来类比 |
| 编码器和解码器分不清 | 编码器=理解，解码器=生成 |
| 概念太多记不住 | 先记住核心：注意力机制 + 编码器/解码器 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| 注意力机制 | 自动关注重要信息 | "阅读时自动划重点" |
| 自注意力 | 词与词之间的注意力 | "句子里每个词关注其他词" |
| 多头注意力 | 多个注意力并行 | "从多个角度划重点" |
| 编码器 | 理解输入 | "读懂题目" |
| 解码器 | 生成输出 | "写出答案" |
| 预训练 | 在大量数据上先训练 | "上大学前先读 12 年书" |
| 微调 | 在特定任务上调整 | "入职后的岗位培训" |
| BERT | 编码器架构模型 | "理解型选手" |
| GPT | 解码器架构模型 | "生成型选手" |

---

### ✅ 验收清单

- [ ] 理解注意力机制的核心思想
- [ ] 能说出 Transformer 的编码器和解码器的作用
- [ ] 能区分 BERT 和 GPT 的主要差异
- [ ] 理解多头注意力的概念
- [ ] 运行了代码区的示例代码

---

### 📝 复盘小纸条

> **注意力机制最让我惊讶的地方是什么？**
>
> 
>
> **BERT 和 GPT 我更想深入了解哪个？为什么？**
>
> 
>
> **明天我想学习什么？**
>
> 

---

### 📥 明日同步接口

- 输入：Transformer 概念已了解
- 输出：准备学习 LLM 对比和选型
- 关键交接物：理解 Transformer 的核心思想

---

## 📅 Day 3：主流 LLM 对比与选型

### 🧭 今日方向
对比主流的 LLM 服务（OpenAI、Anthropic、开源模型），学会根据需求选择合适的模型。

### 🎯 生活比喻
选 LLM 就像"选车"——有便宜的代步车（小模型），有豪华轿车（大模型），有自己组装的（开源模型），看你要去哪里、预算多少。

### 📋 今日三件事
1. 了解主流 LLM 服务的特点
2. 理解模型参数、上下文窗口等关键指标
3. 学会根据场景选择模型

---

### 🗺️ 手把手路线

#### 第一步：了解主流 LLM

**做什么**：阅读代码区中的 LLM 对比表格，了解各家的特点。

**为什么**：不同 LLM 有不同的优势和适用场景。

**成功标志**：能说出 3 个主流 LLM 的主要区别。

---

#### 第二步：理解关键指标

**做什么**：理解参数量、上下文窗口、推理速度等概念。

**为什么**：这些指标决定了模型的能力和成本。

**成功标志**：能根据需求描述选择合适的模型规格。

---

#### 第三步：API 调用实践

**做什么**：运行代码区中的 API 调用示例，体验不同 LLM 的使用。

**为什么**：亲手调用才能真正理解差异。

**成功标志**：能成功调用至少一个 LLM API。

---

### 💻 代码区

```python
# llm_comparison.py —— LLM 对比与选型

# === 主流 LLM 服务对比 ===
llm_providers = {
    "OpenAI": {
        "代表模型": ["GPT-4o", "GPT-4 Turbo", "GPT-3.5 Turbo"],
        "优势": ["生态最完善", "功能全面", "文档丰富"],
        "劣势": ["价格较高", "需要翻墙"],
        "适合场景": ["通用场景", "复杂推理", "多模态"],
        "价格区间": ["$5/1M input", "$15/1M output"],
    },
    "Anthropic": {
        "代表模型": ["Claude 3.5 Sonnet", "Claude 3 Opus", "Claude 3 Haiku"],
        "优势": ["安全性高", "长文本处理强", "代码能力强"],
        "劣势": ["生态较小", "功能相对单一"],
        "适合场景": ["长文档分析", "代码生成", "安全敏感场景"],
        "价格区间": ["$3/1M input", "$15/1M output"],
    },
    "Google": {
        "代表模型": ["Gemini 1.5 Pro", "Gemini 1.5 Flash"],
        "优势": ["多模态强", "上下文窗口大", "搜索集成"],
        "劣势": ["API 稳定性一般"],
        "适合场景": ["多模态任务", "超长文本", "搜索增强"],
        "价格区间": ["$1.25/1M input", "$5/1M output"],
    },
    "开源模型": {
        "代表模型": ["LLaMA 3", "Mistral", "Qwen 2.5"],
        "优势": ["可本地部署", "成本可控", "可定制"],
        "劣势": ["需要算力", "效果可能不如商业模型"],
        "适合场景": ["隐私敏感", "离线部署", "定制化需求"],
        "价格区间": ["免费（自部署）"],
    },
}

print("=== 主流 LLM 服务对比 ===")
for provider, info in llm_providers.items():
    print(f"\n{provider}:")
    print(f"  代表模型: {', '.join(info['代表模型'])}")
    print(f"  优势: {', '.join(info['优势'])}")
    print(f"  适合场景: {', '.join(info['适合场景'])}")

# === 关键指标解释 ===
print("\n=== 关键指标 ===")
metrics = {
    "参数量": "模型中可学习参数的数量，通常以 B（十亿）为单位。参数越多，模型越强大，但成本也越高。",
    "上下文窗口": "模型能处理的最大 token 数量。GPT-4 Turbo 支持 128K，Claude 支持 200K。",
    "推理速度": "生成每个 token 所需的时间，以 tokens/second 表示。速度越快，响应越流畅。",
    "价格": "通常按输入/输出的 token 数计费。输入 token 和输出 token 价格不同。",
    "多模态": "模型是否支持处理图像、音频等非文本数据。",
}

for metric, explanation in metrics.items():
    print(f"\n  {metric}:")
    print(f"    {explanation}")

# === 场景选型指南 ===
print("\n=== 场景选型指南 ===")
scenarios = {
    "简单问答/聊天": "GPT-3.5 Turbo 或 Claude Haiku（便宜快速）",
    "复杂推理/分析": "GPT-4o 或 Claude Sonnet（效果好）",
    "长文档处理": "Claude（200K 上下文）或 Gemini（1M 上下文）",
    "代码生成": "Claude（代码能力强）或 GPT-4（通用性好）",
    "图像理解": "GPT-4o 或 Gemini（多模态强）",
    "隐私敏感": "开源模型本地部署（如 LLaMA 3）",
    "成本敏感": "GPT-3.5 Turbo 或开源模型",
    "实时应用": "GPT-3.5 Turbo 或 Gemini Flash（速度快）",
}

for scenario, recommendation in scenarios.items():
    print(f"  {scenario}:")
    print(f"    推荐: {recommendation}")

# === API 调用示例（OpenAI 风格）===
print("\n=== API 调用示例 ===")
"""
# OpenAI API 调用
import openai

client = openai.OpenAI(api_key="your-api-key")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是一个有帮助的助手。"},
        {"role": "user", "content": "解释什么是 Transformer？"},
    ],
    temperature=0.7,      # 创造性（0-1，越高越随机）
    max_tokens=1000,      # 最大输出 token 数
)

print(response.choices[0].message.content)
"""

# === Anthropic API 调用示例 ===
"""
# Anthropic API 调用
import anthropic

client = anthropic.Anthropic(api_key="your-api-key")

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": "解释什么是 Transformer？"},
    ],
)

print(message.content[0].text)
"""
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| 不知道选哪个模型 | 从 GPT-3.5 Turbo 或 Claude Haiku 开始，便宜快速 |
| API 调用失败 | 检查 API Key 是否正确，余额是否充足 |
| 成本太高 | 降低 max_tokens，使用更便宜的模型 |
| 中文效果不好 | 尝试 GPT-4o 或 Claude，它们中文能力更强 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| 参数量 | 模型的"脑容量" | 越大越聪明，但越贵 |
| 上下文窗口 | 模型的"短期记忆" | 一次能处理多少文字 |
| Token | 模型处理的最小单位 | 约 0.75 个英文单词 |
| Temperature | 创造性控制 | 越高越有创意，越低越稳定 |
| 多模态 | 支持多种数据类型 | 能看图、听声音 |
| 推理 | 模型生成回答的过程 | "思考和回答" |
| 流式输出 | 逐字返回结果 | "边想边说" |
| API | 应用程序接口 | "程序之间的对话方式" |

---

### ✅ 验收清单

- [ ] 能说出 3 个主流 LLM 服务的特点
- [ ] 理解参数量、上下文窗口等关键指标
- [ ] 能根据场景推荐合适的模型
- [ ] 了解 API 调用的基本方式
- [ ] 运行了代码区的示例代码

---

### 📝 复盘小纸条

> **哪个 LLM 最适合我的需求？为什么？**
>
> 
>
> **成本和效果之间如何平衡？**
>
> 
>
> **明天我想深入学习什么？**
>
> 

---

### 📥 明日同步接口

- 输入：LLM 对比和选型已了解
- 输出：准备学习提示工程
- 关键交接物：能根据需求选择合适的 LLM

---

## 📅 Day 4：提示工程（Prompt Engineering）

### 🧭 今日方向
掌握提示工程的核心技巧，学会编写高质量的提示词。

### 🎯 生活比喻
提示工程就像"给 AI 下指令"——说清楚你要什么，AI 才能给你想要的结果。就像点菜时说"少辣、多醋、不要香菜"比"随便来一份"效果好多了。

### 📋 今日三件事
1. 理解提示工程的核心原则
2. 掌握 Few-shot、Chain-of-Thought 等技巧
3. 实践不同场景的提示模板

---

### 🗺️ 手把手路线

#### 第一步：基础提示技巧

**做什么**：运行代码区中的基础提示示例，理解角色设定、指令明确等原则。

**为什么**：好的提示 = 好的结果，这是 AI 应用的核心技能。

**成功标志**：能说出 3 个提示工程的基本原则。

---

#### 第二步：高级提示技巧

**做什么**：学习 Few-shot（少样本）和 Chain-of-Thought（思维链）技巧。

**为什么**：这些技巧能显著提升 AI 的输出质量。

**成功标志**：能用思维链技巧让 AI 解释推理过程。

---

#### 第三步：实践不同场景

**做什么**：为不同任务设计提示模板。

**为什么**：不同任务需要不同的提示策略。

**成功标志**：能为 3 个不同任务设计有效的提示。

---

### 💻 代码区

```python
# prompt_engineering.py —— 提示工程技巧

# === 基础提示原则 ===
principles = {
    "角色设定": "给 AI 一个明确的角色，让它进入状态",
    "指令明确": "清楚说明你要什么，不要含糊",
    "格式要求": "指定输出格式（JSON、列表、表格等）",
    "示例引导": "给几个例子，让 AI 理解你的期望",
    "约束条件": "设定限制条件（长度、风格、范围等）",
}

print("=== 提示工程基本原则 ===")
for principle, description in principles.items():
    print(f"  {principle}: {description}")

# === 不同场景的提示模板 ===
prompt_templates = {
    "角色扮演": """
你是一位{角色}，擅长{技能}。
请用{风格}的方式回答以下问题：
{问题}
""",
    "Few-shot 学习": """
请根据以下示例，完成类似的任务：

示例 1：
输入：{input_1}
输出：{output_1}

示例 2：
输入：{input_2}
输出：{output_2}

现在请处理：
输入：{new_input}
输出：
""",
    "Chain-of-Thought": """
请一步一步思考以下问题：

问题：{question}

让我们一步步来：
1. 首先，分析问题的关键信息...
2. 然后，确定需要哪些知识...
3. 接着，逐步推理...
4. 最后，得出结论...

请按照这个结构回答。
""",
    "结构化输出": """
请将以下信息整理成{格式}格式：

{原始信息}

要求：
- 使用{语言}回答
- 保持{风格}
- 输出格式：{格式}
""",
}

print("\n=== 提示模板 ===")
for template_name, template in prompt_templates.items():
    print(f"\n  {template_name}:")
    print(f"    {template[:100]}...")

# === 实际示例 ===
print("\n=== 实际示例 ===")

# 示例 1：翻译任务
translation_prompt = """
你是一位专业的中英翻译。
请将以下中文翻译成英文，保持专业术语准确：

输入：大语言模型（LLM）是基于 Transformer 架构的人工智能模型。
要求：
- 保持技术术语准确
- 句子通顺自然
- 直接输出翻译结果，不需要解释
"""

print("示例 1 - 翻译任务提示:")
print(translation_prompt)

# 示例 2：代码生成
code_prompt = """
你是一位 Python 开发专家。
请编写一个 Python 函数，功能如下：

要求：
- 函数名：calculate_fibonacci
- 输入：整数 n
- 输出：第 n 个斐波那契数
- 使用动态规划实现
- 包含类型提示和文档字符串
- 添加注释解释关键步骤
"""

print("\n示例 2 - 代码生成提示:")
print(code_prompt)

# 示例 3：分析任务
analysis_prompt = """
你是一位数据分析师。
请分析以下数据并给出见解：

数据：{数据}

分析要求：
1. 识别主要趋势
2. 找出异常值
3. 给出 3 条具体建议
4. 使用图表说明（如适用）

输出格式：
- 趋势分析：...
- 异常发现：...
- 建议：...
"""

print("\n示例 3 - 分析任务提示:")
print(analysis_prompt)

# === 提示优化对比 ===
print("\n=== 提示优化对比 ===")
print("\n  差的提示:")
print("    写个函数")
print("\n  好的提示:")
print("    请编写一个 Python 函数，名为 `merge_sorted_lists`，")
print("    功能是合并两个已排序的列表并返回一个新的排序列表。")
print("    要求：时间复杂度 O(n+m)，包含类型提示和文档字符串。")

# === 常见错误 ===
print("\n=== 常见提示错误 ===")
common_mistakes = [
    ("太模糊", "帮我写点东西", "请写一篇关于 AI 的 500 字博客文章"),
    ("缺少上下文", "这个函数有问题", "这个 Python 函数在处理空列表时会报 IndexError"),
    ("没有格式要求", "分析这段数据", "将分析结果整理成 JSON 格式，包含 trend 和 suggestions 字段"),
    ("角色不明确", "回答这个问题", "作为一位资深 Python 开发者，请回答..."),
]

for mistake, bad_example, good_example in common_mistakes:
    print(f"\n  {mistake}:")
    print(f"    差: {bad_example}")
    print(f"    好: {good_example}")
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| AI 输出不符合预期 | 增加示例、明确格式要求、添加约束条件 |
| AI 回答太长 | 在提示中指定"用 3 句话概括"或"限制在 100 字以内" |
| AI 幻觉（编造事实） | 要求 AI 只使用提供的信息，或添加"如果不确定请说不知道" |
| 代码生成质量差 | 提供更详细的函数签名、输入输出示例、约束条件 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| 提示工程 | 设计高质量提示词 | "给 AI 说人话" |
| Few-shot | 少样本学习 | "给几个例子" |
| Chain-of-Thought | 思维链 | "让 AI 展示推理过程" |
| Zero-shot | 零样本 | "不给例子直接做" |
| 角色设定 | 给 AI 设定身份 | "让 AI 扮演专家" |
| 温度 (Temperature) | 创造性控制 | "越低越稳，越高越浪" |
| 幻觉 | AI 编造不存在的信息 | "AI 在胡说八道" |
| 格式化输出 | 指定输出结构 | "让 AI 按格式回答" |

---

### ✅ 验收清单

- [ ] 能说出 3 个提示工程的基本原则
- [ ] 能用 Few-shot 技巧设计提示
- [ ] 能用 Chain-of-Thought 让 AI 展示推理过程
- [ ] 能为不同任务设计有效的提示模板
- [ ] 能识别和避免常见的提示错误

---

### 📝 复盘小纸条

> **提示工程中最重要的技巧是什么？**
>
> 
>
> **我在提示设计中常犯的错误是什么？**
>
> 
>
> **明天我想学习什么？**
>
> 

---

### 📥 明日同步接口

- 输入：提示工程技巧已掌握
- 输出：准备学习 LLM API 工程实践
- 关键交接物：能设计高质量的提示词

---

## 📅 Day 5：LLM API 工程实践

### 🧭 今日方向
学习 LLM API 的实际调用方式，包括错误处理、流式输出、成本控制。

### 🎯 生活比喻
API 调用就像"打电话给客服"——你要知道号码（端点）、带上身份证（API Key）、说清楚问题（提示），还要学会处理占线（错误）。

### 📋 今日三件事
1. 掌握 OpenAI/Anthropic API 的基本调用
2. 学会流式输出和错误处理
3. 理解成本控制策略

---

### 🗺️ 手把手路线

#### 第一步：API 基础调用

**做什么**：运行代码区中的 API 调用示例，理解请求和响应结构。

**为什么**：这是实际使用 LLM 的第一步。

**成功标志**：能成功调用 API 并获取响应。

---

#### 第二步：流式输出

**做什么**：学习如何实现逐字输出（流式响应）。

**为什么**：流式输出让用户体验更好，不用等整个回答生成完。

**成功标志**：能实现逐字显示的流式输出。

---

#### 第三步：错误处理和成本控制

**做什么**：学习重试机制、速率限制处理、token 计数。

**为什么**：生产环境需要健壮的错误处理和成本控制。

**成功标志**：能实现带重试的 API 调用。

---

### 💻 代码区

```python
# llm_api_practice.py —— LLM API 工程实践

import os
import time
from typing import Generator

# === 基础 API 调用 ===
def basic_api_call():
    """
    OpenAI API 基础调用示例
    
    注意：实际运行需要安装 openai 库和有效的 API Key
    """
    # 安装：pip install openai
    # import openai
    
    # 设置 API Key（建议从环境变量读取）
    # client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    # 构建请求
    """
    response = client.chat.completions.create(
        model="gpt-4o",                          # 模型选择
        messages=[                                # 对话历史
            {"role": "system", "content": "你是一个有帮助的助手。"},
            {"role": "user", "content": "解释什么是 API？"},
        ],
        temperature=0.7,                          # 创造性控制
        max_tokens=500,                           # 最大输出长度
        top_p=1.0,                               # 采样参数
        frequency_penalty=0.0,                    # 频率惩罚
        presence_penalty=0.0,                     # 存在惩罚
    )
    
    # 处理响应
    message = response.choices[0].message.content
    token_usage = response.usage
    
    print(f"回答: {message}")
    print(f"Token 使用: 输入 {token_usage.prompt_tokens}, 输出 {token_usage.completion_tokens}")
    print(f"费用估算: ~${token_usage.total_tokens * 0.00001:.4f}")
    """
    pass

# === 流式输出 ===
def streaming_api_call():
    """
    流式输出示例 —— 逐字返回结果
    """
    """
    stream = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": "写一首关于编程的短诗"},
        ],
        stream=True,  # 启用流式输出
    )
    
    # 逐块处理响应
    full_response = ""
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            content = chunk.choices[0].delta.content
            print(content, end="", flush=True)  # 逐字打印
            full_response += content
    
    print()  # 换行
    return full_response
    """
    pass

# === Anthropic API 调用 ===
def anthropic_api_call():
    """
    Anthropic Claude API 调用示例
    """
    # 安装：pip install anthropic
    # import anthropic
    
    # client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    """
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        system="你是一个有帮助的助手。",
        messages=[
            {"role": "user", "content": "解释什么是 API？"},
        ],
    )
    
    print(message.content[0].text)
    """
    pass

# === 带重试的 API 调用 ===
def api_call_with_retry(
    func,
    *args,
    max_retries: int = 3,
    retry_delay: float = 1.0,
    **kwargs,
):
    """
    带指数退避重试的 API 调用
    
    参数:
        func: 要调用的函数
        max_retries: 最大重试次数
        retry_delay: 初始重试延迟（秒）
    """
    last_exception = None
    
    for attempt in range(max_retries + 1):
        try:
            result = func(*args, **kwargs)
            return result
        except Exception as e:
            last_exception = e
            error_msg = str(e)
            
            # 判断是否需要重试
            retryable_errors = [
                "rate_limit_exceeded",
                "server_error",
                "timeout",
                "502", "503", "504",
            ]
            
            should_retry = any(err in error_msg.lower() for err in retryable_errors)
            
            if not should_retry or attempt == max_retries:
                raise
            
            # 指数退避
            wait_time = retry_delay * (2 ** attempt)
            print(f"  重试 {attempt + 1}/{max_retries}，等待 {wait_time:.1f} 秒...")
            time.sleep(wait_time)
    
    raise last_exception

# === Token 计数和成本估算 ===
class TokenCounter:
    """Token 计数器（简化版，实际应使用 tiktoken 库）"""
    
    # 简化的 token 价格（美元/1M tokens）
    PRICING = {
        "gpt-4o": {"input": 2.50, "output": 10.00},
        "gpt-4-turbo": {"input": 10.00, "output": 30.00},
        "gpt-3.5-turbo": {"input": 0.50, "output": 1.50},
        "claude-3-5-sonnet": {"input": 3.00, "output": 15.00},
        "claude-3-haiku": {"input": 0.25, "output": 1.25},
    }
    
    @classmethod
    def estimate_tokens(cls, text: str) -> int:
        """
        估算 token 数量（简化：英文约 4 字符/token，中文约 2 字符/token）
        """
        # 简化估算
        chinese_chars = sum(1 for c in text if '一' <= c <= '鿿')
        other_chars = len(text) - chinese_chars
        return (chinese_chars // 2) + (other_chars // 4)
    
    @classmethod
    def estimate_cost(cls, model: str, input_tokens: int, output_tokens: int) -> float:
        """
        估算 API 调用成本
        """
        if model not in cls.PRICING:
            return 0.0
        
        pricing = cls.PRICING[model]
        cost = (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1_000_000
        return cost

# 使用示例
text = "请解释什么是 API，用简单的语言描述。"
estimated_tokens = TokenCounter.estimate_tokens(text)
estimated_cost = TokenCounter.estimate_cost("gpt-4o", estimated_tokens, 200)

print("=== Token 计数和成本估算 ===")
print(f"  文本长度: {len(text)} 字符")
print(f"  预估 token 数: {estimated_tokens}")
print(f"  预估成本 (GPT-4o): ${estimated_cost:.6f}")

# === 成本控制策略 ===
print("\n=== 成本控制策略 ===")
strategies = {
    "选择合适模型": "简单任务用小模型（GPT-3.5），复杂任务用大模型（GPT-4）",
    "限制输出长度": "设置 max_tokens，避免生成过长内容",
    "优化提示": "更短更精确的提示 = 更少的输入 token",
    "缓存响应": "相同请求缓存结果，避免重复调用",
    "批量处理": "合并多个小请求为一个大请求",
    "监控用量": "设置 token 使用量告警",
}

for strategy, description in strategies.items():
    print(f"  {strategy}:")
    print(f"    {description}")
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| API Key 无效 | 检查环境变量是否正确设置，密钥是否过期 |
| 速率限制 | 实现重试机制，降低请求频率 |
| 响应太慢 | 使用流式输出，或选择更快的模型 |
| 成本太高 | 优化提示、限制输出、使用更便宜的模型 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| 流式输出 | 逐字返回结果 | "边想边说" |
| 速率限制 | API 调用频率限制 | "不能打太多电话" |
| Token | 计费单位 | "按字收费" |
| 重试机制 | 失败后自动重试 | "电话占线就重拨" |
| 指数退避 | 重试间隔逐渐增加 | "越来越有耐心" |
| 上下文管理 | 管理对话历史 | "记住之前说了什么" |
| 温度 | 创造性控制 | "越低越稳，越高越创意" |

---

### ✅ 验收清单

- [ ] 能调用 OpenAI 或 Anthropic API
- [ ] 能实现流式输出
- [ ] 能实现带重试的 API 调用
- [ ] 能估算 API 调用成本
- [ ] 了解成本控制策略

---

### 📝 复盘小纸条

> **API 调用中最容易出错的地方是什么？**
>
> 
>
> **流式输出对用户体验有什么提升？**
>
> 
>
> **明天我想学习什么？**
>
> 

---

### 📥 明日同步接口

- 输入：LLM API 工程实践已掌握
- 输出：准备学习 LLM 应用模式
- 关键交接物：能稳定调用 LLM API

---

## 📅 Day 6：LLM 应用模式

### 🧭 今日方向
学习 LLM 的常见应用模式，如 RAG、Agent、多轮对话等。

### 🎯 生活比喻
LLM 的应用模式就像"工具箱"——不同任务用不同工具。RAG 是"查字典"，Agent 是"带助手工作"，多轮对话是"聊天"。

### 📋 今日三件事
1. 了解 RAG（检索增强生成）的概念
2. 理解 Agent 的基本架构
3. 学习多轮对话的实现

---

### 🗺️ 手把手路线

#### 第一步：RAG 概念

**做什么**：理解 RAG 如何让 LLM 访问外部知识。

**为什么**：RAG 是解决 LLM "知识过时"问题的关键技术。

**成功标志**：能画出 RAG 的基本流程图。

---

#### 第二步：Agent 概念

**做什么**：了解 Agent 的定义和基本架构。

**为什么**：这是后续课程的核心内容。

**成功标志**：能说出 Agent 和普通 LLM 调用的区别。

---

#### 第三步：多轮对话

**做什么**：学习如何维护对话历史。

**为什么**：多轮对话是大多数 LLM 应用的基础。

**成功标志**：能实现一个简单的多轮对话系统。

---

### 💻 代码区

```python
# llm_app_patterns.py —— LLM 应用模式

# === RAG（检索增强生成）===
print("=== RAG 概念 ===")
rag_flow = """
RAG (Retrieval-Augmented Generation) 检索增强生成

传统 LLM 的问题：
  - 知识截止到训练数据时间
  - 无法访问私有数据
  - 可能产生幻觉

RAG 的解决方案：
  1. 用户提问
  2. 从知识库中检索相关文档
  3. 将文档作为上下文提供给 LLM
  4. LLM 基于上下文生成回答

流程图：
  用户问题 → 检索器 → 相关文档 → LLM → 有依据的回答
"""
print(rag_flow)

# 简化的 RAG 模拟
class SimpleRAG:
    """简化的 RAG 演示"""
    
    def __init__(self):
        # 模拟知识库
        self.knowledge_base = [
            {"id": 1, "content": "FastAPI 是一个现代、快速的 Python Web 框架。"},
            {"id": 2, "content": "Pydantic 用于数据验证和设置管理。"},
            {"id": 3, "content": "SQLAlchemy 是 Python 的 ORM 工具。"},
            {"id": 4, "content": "JWT 用于无状态的身份认证。"},
            {"id": 5, "content": "WebSocket 提供实时双向通信。"},
        ]
    
    def retrieve(self, query: str, top_k: int = 2) -> list[dict]:
        """
        检索相关文档（简化：基于关键词匹配）
        """
        results = []
        query_words = set(query.lower().split())
        
        for doc in self.knowledge_base:
            content_words = set(doc["content"].lower().split())
            overlap = len(query_words & content_words)
            if overlap > 0:
                results.append({"doc": doc, "score": overlap})
        
        # 按分数排序
        results.sort(key=lambda x: x["score"], reverse=True)
        return [r["doc"] for r in results[:top_k]]
    
    def generate(self, query: str) -> str:
        """
        生成回答（模拟 LLM）
        """
        # 检索相关文档
        relevant_docs = self.retrieve(query)
        
        # 构建上下文
        context = "\n".join([doc["content"] for doc in relevant_docs])
        
        # 模拟 LLM 生成（实际应调用 API）
        response = f"""基于以下信息回答问题：

上下文：
{context}

问题：{query}

回答：根据知识库，{relevant_docs[0]['content'] if relevant_docs else '抱歉，没有找到相关信息'}"""
        
        return response

# 使用示例
rag = SimpleRAG()
query = "什么是 FastAPI？"
print(f"\n问题: {query}")
print(f"回答:\n{rag.generate(query)}")

# === Agent 概念 ===
print("\n=== Agent 概念 ===")
agent_concept = """
Agent = LLM + 工具 + 记忆 + 规划

与普通 LLM 调用的区别：
  普通 LLM: 用户 → LLM → 回答
  Agent:    用户 → Agent → 规划 → 选择工具 → 执行 → 观察 → ... → 回答

Agent 的核心能力：
  1. 推理：理解任务并制定计划
  2. 工具使用：调用外部工具（搜索引擎、计算器、API 等）
  3. 记忆：记住之前的交互和结果
  4. 反思：评估结果并调整策略
"""
print(agent_concept)

# Agent 的简化实现框架
class SimpleAgent:
    """简化的 Agent 框架"""
    
    def __init__(self, name: str):
        self.name = name
        self.memory: list[dict] = []         # 记忆
        self.tools: dict[str, callable] = {}  # 工具集
    
    def register_tool(self, name: str, func: callable):
        """注册工具"""
        self.tools[name] = func
    
    def think(self, task: str) -> str:
        """思考/规划（模拟 LLM 推理）"""
        plan = f"任务: {task}\n可用工具: {list(self.tools.keys())}\n计划: 先分析任务，选择合适工具执行"
        self.memory.append({"role": "plan", "content": plan})
        return plan
    
    def act(self, tool_name: str, *args) -> str:
        """执行工具"""
        if tool_name not in self.tools:
            return f"工具 {tool_name} 不存在"
        
        result = self.tools[tool_name](*args)
        self.memory.append({"role": "action", "tool": tool_name, "result": result})
        return result
    
    def observe(self, result: str) -> str:
        """观察结果"""
        observation = f"执行结果: {result}"
        self.memory.append({"role": "observation", "content": observation})
        return observation
    
    def run(self, task: str) -> str:
        """执行任务"""
        print(f"\n{self.name} 开始执行任务: {task}")
        
        # 思考
        plan = self.think(task)
        print(f"思考: {plan}")
        
        # 执行（简化：假设使用第一个可用工具）
        if self.tools:
            tool_name = list(self.tools.keys())[0]
            result = self.act(tool_name, task)
            print(f"执行: {result}")
            
            # 观察
            observation = self.observe(result)
            print(f"观察: {observation}")
            
            return result
        
        return "没有可用工具"

# 使用示例
agent = SimpleAgent("学习助手")

# 注册工具
agent.register_tool("search", lambda q: f"搜索结果: 关于 '{q}' 的信息")
agent.register_tool("calculate", lambda expr: f"计算结果: {eval(expr)}")

# 执行任务
agent.run("什么是 Agent？")

# === 多轮对话 ===
print("\n=== 多轮对话 ===")

class ChatSession:
    """多轮对话会话管理"""
    
    def __init__(self, system_prompt: str = "你是一个有帮助的助手。"):
        self.history: list[dict] = [
            {"role": "system", "content": system_prompt}
        ]
    
    def add_message(self, role: str, content: str):
        """添加消息到历史"""
        self.history.append({"role": role, "content": content})
    
    def get_messages(self) -> list[dict]:
        """获取完整对话历史"""
        return self.history.copy()
    
    def clear_history(self):
        """清空历史（保留 system prompt）"""
        self.history = [self.history[0]]

# 使用示例
session = ChatSession("你是一个 Python 专家。")
session.add_message("user", "什么是列表推导式？")
session.add_message("assistant", "列表推导式是 Python 创建列表的简洁语法...")
session.add_message("user", "能给个例子吗？")

print("对话历史:")
for msg in session.get_messages():
    print(f"  [{msg['role']}]: {msg['content'][:50]}...")
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| RAG 检索效果差 | 改进检索算法，使用向量数据库 |
| Agent 工具调用失败 | 检查工具参数是否正确 |
| 对话历史太长 | 实现历史截断或摘要 |
| Token 超出限制 | 减少历史消息数量，或使用更长上下文的模型 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| RAG | 检索增强生成 | "查字典后再回答" |
| Agent | 自主决策系统 | "带助手工作" |
| 工具调用 | Agent 使用外部工具 | "使用工具箱" |
| 记忆 | Agent 的历史信息 | "笔记本" |
| 规划 | Agent 制定执行计划 | "先想好怎么做" |
| 多轮对话 | 保持上下文的连续对话 | "聊天" |
| System Prompt | 系统提示 | "给 AI 定规矩" |
| 上下文窗口 | 模型能处理的最大长度 | "短期记忆容量" |

---

### ✅ 验收清单

- [ ] 理解 RAG 的基本原理和流程
- [ ] 能说出 Agent 的核心能力
- [ ] 能实现简单的 Agent 框架
- [ ] 能实现多轮对话管理
- [ ] 运行了代码区的示例代码

---

### 📝 复盘小纸条

> **RAG 解决了 LLM 的什么问题？**
>
> 
>
> **Agent 和普通 LLM 调用最大的区别是什么？**
>
> 
>
> **明天我想学习什么？**
>
> 

---

### 📥 明日同步接口

- 输入：LLM 应用模式已了解
- 输出：准备进行周复盘和总结
- 关键交接物：理解 RAG、Agent、多轮对话的概念

---

## 📅 Day 7：周复盘 + 项目整合

### 🧭 今日方向
回顾 Week 3 的所有内容，整合成一个完整的 LLM 应用项目。

### 🎯 生活比喻
今天我们把一周学的"零件"组装成一台"完整的机器"——一个带 RAG、Agent、多轮对话的 LLM 应用。

### 📋 今日三件事
1. 回顾本周 6 天的所有学习内容
2. 整合所有知识到一个完整项目
3. 在 Obsidian 中写下周复盘笔记

---

### 🗺️ 手把手路线

#### 第一步：回顾知识

**做什么**：打开 Obsidian 知识库，快速翻阅本周创建的所有笔记。

**为什么**：复习是学习之母，快速回顾能巩固记忆。

**成功标志**：对每个概念都能想起大概含义和使用场景。

---

#### 第二步：项目整合

**做什么**：运行下方的整合项目代码，把 NLP、Transformer、LLM API、应用模式全部串起来。

**为什么**：单独的知识点不如串联的项目有价值。

**成功标志**：项目能正常运行，所有功能都工作正常。

---

#### 第三步：写下复盘

**做什么**：在 Obsidian 中创建本周复盘笔记，回答下方的复盘问题。

**为什么**：输出倒逼输入，写下来才是真正的掌握。

**成功标志**：完成一篇完整的周复盘笔记。

---

### 💻 代码区：Week 3 整合项目

```python
# src/llm_agent.py —— Week 3 整合示例

"""
一个简单的 LLM Agent 框架
整合了：提示工程 + API 调用 + RAG + Agent 模式
"""

from dataclasses import dataclass, field
from typing import Callable, Any
import json

# === 数据模型 ===
@dataclass
class Message:
    """消息数据模型"""
    role: str                    # system/user/assistant/tool
    content: str
    metadata: dict = field(default_factory=dict)

@dataclass
class Tool:
    """工具数据模型"""
    name: str
    description: str
    function: Callable
    parameters: dict = field(default_factory=dict)

# === Agent 框架 ===
class LLMAgent:
    """
    简化的 LLM Agent 框架
    
    整合了 Week 3 学习的所有概念
    """
    
    def __init__(
        self,
        name: str,
        system_prompt: str,
        model: str = "gpt-4o",
    ):
        self.name = name
        self.system_prompt = system_prompt
        self.model = model
        self.tools: dict[str, Tool] = {}
        self.memory: list[Message] = []
        self.max_memory = 20  # 最大记忆条数
        
        # 添加系统提示到记忆
        self.memory.append(Message(role="system", content=system_prompt))
    
    def register_tool(self, tool: Tool):
        """注册工具"""
        self.tools[tool.name] = tool
    
    def build_tools_description(self) -> str:
        """构建工具描述（用于提示）"""
        if not self.tools:
            return "当前没有可用工具。"
        
        descriptions = []
        for tool in self.tools.values():
            desc = f"- {tool.name}: {tool.description}"
            if tool.parameters:
                desc += f"\n  参数: {json.dumps(tool.parameters, ensure_ascii=False)}"
            descriptions.append(desc)
        
        return "\n".join(descriptions)
    
    def build_prompt(self, user_input: str) -> list[dict]:
        """构建完整的提示"""
        # 添加用户输入到记忆
        self.memory.append(Message(role="user", content=user_input))
        
        # 截断过长的记忆
        if len(self.memory) > self.max_memory:
            # 保留 system prompt 和最近的消息
            self.memory = [self.memory[0]] + self.memory[-(self.max_memory-1):]
        
        # 构建 messages 列表
        messages = [{"role": msg.role, "content": msg.content} for msg in self.memory]
        
        # 添加工具描述
        tools_desc = self.build_tools_description()
        if tools_desc != "当前没有可用工具。":
            # 在最后一条用户消息前插入工具描述
            messages.insert(-1, {
                "role": "system",
                "content": f"可用工具:\n{tools_desc}\n\n如果你需要使用工具，请在回答中明确说明。"
            })
        
        return messages
    
    def process_response(self, response: str) -> str:
        """处理响应，检查是否需要调用工具"""
        # 简化：检查响应中是否包含工具调用指令
        for tool_name, tool in self.tools.items():
            if tool_name in response.lower():
                # 模拟工具调用
                result = tool.function(response)
                return f"{response}\n\n[工具 {tool_name} 执行结果: {result}]"
        
        return response
    
    def chat(self, user_input: str) -> str:
        """
        与 Agent 对话
        
        参数:
            user_input: 用户输入
        返回:
            Agent 的回答
        """
        print(f"\n{'='*50}")
        print(f"用户: {user_input}")
        
        # 构建提示
        messages = self.build_prompt(user_input)
        
        # 模拟 LLM 调用（实际应调用 API）
        response = f"[{self.name}] 基于 {len(self.memory)} 条记忆，回答: {user_input}"
        
        # 处理工具调用
        response = self.process_response(response)
        
        # 添加到记忆
        self.memory.append(Message(role="assistant", content=response))
        
        print(f"助手: {response}")
        return response
    
    def get_stats(self) -> dict:
        """获取 Agent 统计信息"""
        return {
            "name": self.name,
            "model": self.model,
            "tools": len(self.tools),
            "memory_size": len(self.memory),
        }

# === 使用示例 ===
if __name__ == "__main__":
    # 创建 Agent
    agent = LLMAgent(
        name="学习助手",
        system_prompt="你是一个专业的 AI 学习助手，帮助用户理解 LLM 和 Agent 概念。",
        model="gpt-4o",
    )
    
    # 注册工具
    agent.register_tool(Tool(
        name="search",
        description="搜索知识库获取信息",
        function=lambda q: f"搜索结果: 关于 '{q}' 的 3 条相关记录",
        parameters={"query": "搜索关键词"},
    ))
    
    agent.register_tool(Tool(
        name="calculate",
        description="执行数学计算",
        function=lambda expr: f"计算结果: {expr}",
        parameters={"expression": "数学表达式"},
    ))
    
    # 对话
    agent.chat("什么是 Agent？")
    agent.chat("Agent 和普通 LLM 有什么区别？")
    agent.chat("帮我搜索一下 RAG 的资料")
    
    # 查看统计
    print(f"\nAgent 统计: {agent.get_stats()}")
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| Agent 不调用工具 | 改进提示，明确工具使用规则 |
| 记忆太长导致 Token 超限 | 实现记忆截断或摘要 |
| 工具调用结果不准确 | 改进工具实现，添加验证逻辑 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| Agent 框架 | 组织 Agent 代码的结构 | "Agent 的骨架" |
| 工具注册 | 将工具添加到 Agent | "给助手配备工具箱" |
| 记忆管理 | 管理对话历史 | "整理笔记本" |
| 提示构建 | 组装完整的提示 | "写好台词" |

---

### ✅ 验收清单

- [ ] 回顾了本周所有学习笔记
- [ ] 整合项目运行正常
- [ ] 在 Obsidian 中创建了周复盘笔记
- [ ] 能用自己的话说出 Week 3 的核心收获

---

### 📝 复盘小纸条

> **Week 3 最大的收获是什么？**
>
> 
>
> **哪个概念还需要巩固？**
>
> 
>
> **我对 Week 4（Agent 经典范式）的期待是什么？**
>
> 

---

### 📥 明日同步接口

- 输入：Week 3 全部完成
- 输出：正式进入 Week 4 Agent 经典范式学习
- 关键交接物：理解 LLM 原理 + 掌握 API 工程 + 了解 Agent 基础概念
