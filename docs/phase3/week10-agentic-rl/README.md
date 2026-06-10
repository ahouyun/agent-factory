# Week 10：Agentic RL 基础

> **Phase 3 第一周** — 从"提示工程"到"训练模型"

---

## Day 1：SFT 到 RLHF — 训练范式的演进

### 📅 Day 1：SFT 到 RLHF — 从"教"到"练"的进化

### 🧭 今日方向
理解大模型训练的三个阶段：预训练 → SFT（监督微调）→ RLHF（人类反馈强化学习），以及 Agentic RL 的核心思想。

### 🎯 生活比喻
- **预训练**：让一个婴儿广泛地阅读所有书籍，获得基础知识
- **SFT**：像老师手把手教学生做题，给标准答案让它模仿
- **RLHF**：像训练一只导盲犬——做对了给奖励，做错了不给，它会自己摸索出最佳策略
- **Agentic RL**：让 Agent 在真实环境中反复尝试，从交互中学习如何更好地完成任务

### 📋 今日三件事
1. 理解 SFT、RLHF、DPO 三种训练范式的区别
2. 了解 Agentic RL 的独特之处
3. 设计一个简单的训练数据格式

### 🗺️ 手把手路线

#### Step 1：理解训练范式
**做什么**：对比 SFT、RLHF、DPO、GRPO 的原理和适用场景
**为什么**：选择合适的训练范式是成功的第一步
**成功标志**：能画出四种范式的流程对比图

#### Step 2：设计数据格式
**做什么**：为 SFT 和 RLHF 设计训练数据格式
**为什么**：数据格式决定了训练方式
**成功标志**：能写出符合 OpenAI 和 HuggingFace 格式的训练数据

#### Step 3：搭建训练环境
**做什么**：安装必要的训练库（transformers、peft、trl）
**为什么**：训练需要特定的工具链
**成功标志**：能导入所有必要的库

### 💻 代码区

```python
"""
Week 10 Day 1：SFT 到 RLHF — 训练范式概览
"""
# ========== 训练范式对比 ==========

training_paradigms = """
┌─────────────────────────────────────────────────────────────────┐
│                    大模型训练范式演进                              │
├──────────────┬──────────────┬──────────────┬──────────────────┤
│    预训练     │     SFT      │    RLHF      │   Agentic RL     │
│  (Pre-train) │ (Supervised  │ (Reinforcement│ (Agent在环境中   │
│              │  Fine-Tune)  │  Learning     │  自主学习)       │
│              │              │  from Human   │                  │
│              │              │  Feedback)    │                  │
├──────────────┼──────────────┼──────────────┼──────────────────┤
│ 海量无标注文本│ 标注的问答对  │ 人类偏好排序   │ 环境+奖励信号    │
│ 学习语言规律  │ 学习任务格式  │ 对齐人类偏好   │ 学习决策策略      │
│ 计算成本极高  │ 成本中等      │ 成本较高      │ 需要模拟环境      │
│ 不针对特定任务│ 针对特定任务  │ 提升回答质量   │ 提升Agent能力     │
└──────────────┴──────────────┴──────────────┴──────────────────┘
"""
print(training_paradigms)

# ========== SFT 训练数据格式 ==========

import json

# SFT 数据格式（OpenAI 微调格式）
sft_data_openai = [
    {
        "messages": [
            {"role": "system", "content": "你是一个智能助手，擅长回答技术问题。"},
            {"role": "user", "content": "什么是 RAG？"},
            {"role": "assistant", "content": "RAG（Retrieval-Augmented Generation）是一种将检索系统与大语言模型结合的技术。它的核心思想是：先从外部知识库中检索相关信息，然后将检索结果作为上下文提供给 LLM，让 LLM 基于这些信息生成回答。RAG 的优势在于能有效减少幻觉问题，让模型的回答更加准确和有据可依。"}
        ]
    },
    {
        "messages": [
            {"role": "system", "content": "你是一个智能助手，擅长回答技术问题。"},
            {"role": "user", "content": "LangChain 是什么？"},
            {"role": "assistant", "content": "LangChain 是一个用于构建 LLM 应用的开源框架。它提供了一套标准化的接口和组件，帮助开发者快速搭建基于大语言模型的应用，包括：对话系统、RAG、Agent、工具调用等。LangChain 的核心概念包括：Model（模型封装）、Prompt（提示词模板）、Chain（处理链）、Tool（工具）、Agent（智能体）等。"}
        ]
    }
]

print("\nSFT 训练数据示例（OpenAI 格式）：")
print(json.dumps(sft_data_openai[0], ensure_ascii=False, indent=2))

# SFT 数据格式（HuggingFace 格式）
sft_data_hf = [
    {
        "instruction": "你是一个智能助手。",
        "input": "什么是 RAG？",
        "output": "RAG（Retrieval-Augmented Generation）是一种将检索系统与大语言模型结合的技术..."
    }
]

print("\nSFT 训练数据示例（HuggingFace 格式）：")
print(json.dumps(sft_data_hf[0], ensure_ascii=False, indent=2))

# ========== RLHF 训练数据格式 ==========

# RLHF 需要偏好数据：chosen（好的回答）vs rejected（差的回答）
rlhf_data = [
    {
        "prompt": "什么是机器学习？",
        "chosen": "机器学习是人工智能的一个分支，它使计算机能够从数据中学习模式和规律，而无需被显式编程。常见的机器学习方法包括监督学习、无监督学习和强化学习。",
        "rejected": "机器学习就是让计算机学习。（过于简略，缺乏准确性）"
    },
    {
        "prompt": "Python 的 GIL 是什么？",
        "chosen": "GIL（Global Interpreter Lock）是 Python 的全局解释器锁，它确保同一时刻只有一个线程执行 Python 字节码。这限制了 Python 多线程的并行性能，但对于 I/O 密集型任务影响较小。要实现真正的并行计算，可以使用 multiprocessing 模块。",
        "rejected": "GIL 就是一个锁，让 Python 变慢了。（不准确且不完整）"
    }
]

print("\nRLHF 偏好数据示例：")
print(json.dumps(rlhf_data[0], ensure_ascii=False, indent=2))

# ========== DPO 训练数据格式 ==========

# DPO（Direct Preference Optimization）简化了 RLHF
# 不需要训练奖励模型，直接用偏好数据优化
dpo_data = [
    {
        "prompt": "解释什么是 Transformer 架构。",
        "chosen": "Transformer 是一种基于自注意力机制的深度学习架构，由 Vaswani 等人在 2017 年提出。它的核心创新是 Self-Attention 机制，允许模型在处理序列数据时关注输入的不同部分。Transformer 由 Encoder 和 Decoder 两部分组成，广泛应用于 NLP 任务，是 GPT、BERT 等模型的基础。",
        "rejected": "Transformer 是一种神经网络，用来做 NLP 的。它很厉害。"
    }
]

print("\nDPO 训练数据示例：")
print(json.dumps(dpo_data[0], ensure_ascii=False, indent=2))

# ========== GRPO 概念 ==========

grpo_concept = """
GRPO（Group Relative Policy Optimization）的核心思想：
1. 对同一个 prompt，生成一组（Group）候选回答
2. 对这组回答进行排序（可以用 LLM 做评判）
3. 用相对排序（而非绝对分数）来优化策略

优势：
- 不需要标注绝对分数，只需要相对排序
- 比 RLHF 更简单，不需要训练奖励模型
- 比 DPO 更灵活，可以处理更多场景
"""
print(grpo_concept)


# ========== 安装环境检查 ==========

def check_training_env():
    """检查训练环境"""
    libs = {}

    try:
        import torch
        libs["torch"] = torch.__version__
        libs["cuda"] = torch.cuda.is_available()
        if torch.cuda.is_available():
            libs["gpu"] = torch.cuda.get_device_name(0)
    except ImportError:
        libs["torch"] = "未安装"

    try:
        import transformers
        libs["transformers"] = transformers.__version__
    except ImportError:
        libs["transformers"] = "未安装"

    try:
        import peft
        libs["peft"] = peft.__version__
    except ImportError:
        libs["peft"] = "未安装"

    try:
        import trl
        libs["trl"] = trl.__version__
    except ImportError:
        libs["trl"] = "未安装"

    try:
        import datasets
        libs["datasets"] = datasets.__version__
    except ImportError:
        libs["datasets"] = "未安装"

    print("\n训练环境检查：")
    for lib, version in libs.items():
        status = "✅" if version != "未安装" else "❌"
        print(f"  {status} {lib}: {version}")

    return libs

check_training_env()
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| torch 安装失败 | 使用 `pip install torch --index-url https://download.pytorch.org/whl/cu121` |
| CUDA 不可用 | 检查 NVIDIA 驱动版本，使用 `nvidia-smi` 查看 |
| transformers 版本冲突 | 锁定版本：`pip install transformers==4.38.0` |
| GPU 显存不足 | 使用 4-bit 量化（QLoRA）减少显存占用 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| SFT | 用标注数据监督微调 | 老师手把手教 |
| RLHF | 用人类反馈做强化学习 | 训练导盲犬 |
| DPO | 直接偏好优化（简化版RLHF） | 只告诉好坏，不打分 |
| GRPO | 组相对策略优化 | 让一组学生互相对比 |
| LoRA | 低秩适配（参数高效微调） | 只改一小部分 |
| Reward Model | 奖励模型（RLHF中评判回答质量） | 考试评分员 |

### ✅ 验收清单
- [ ] 能解释 SFT、RLHF、DPO、GRPO 的区别
- [ ] 能写出三种格式的训练数据
- [ ] 训练环境检查通过
- [ ] 理解 Agentic RL 的核心思想

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 2 将学习 LoRA 和 QLoRA 参数高效微调技术，请确保已安装 `peft` 和 `bitsandbytes`。

---

## Day 2：LoRA / QLoRA 参数高效微调

### 📅 Day 2：LoRA / QLoRA — 只改"一点点"就能大变样

### 🧭 今日方向
学习 LoRA（低秩适配）和 QLoRA（量化 LoRA）——用极少的参数实现模型微调，大幅降低训练成本。

### 🎯 生活比喻
全量微调就像把整栋房子重新装修——成本高、耗时长。LoRA 就像只换家具和墙纸——效果差不多，但成本和时间大大降低。QLoRA 更进一步：先把房子"压缩"（量化），然后在压缩后的房子里换家具。

### 📋 今日三件事
1. 理解 LoRA 的数学原理（低秩分解）
2. 实现 LoRA 微调的完整流程
3. 用 QLoRA 在消费级 GPU 上微调模型

### 🗺️ 手把手路线

#### Step 1：LoRA 原理
**做什么**：理解低秩矩阵分解和 LoRA 的工作方式
**为什么**：理解原理才能正确使用
**成功标志**：能解释 LoRA 如何将 7B 参数的微调降低到几百 MB

#### Step 2：LoRA 微调实战
**做什么**：用 PEFT 库对 GPT-2 做 LoRA 微调
**为什么**：动手实践是最好的学习方式
**成功标志**：微调后的模型在特定任务上表现提升

#### Step 3：QLoRA 量化微调
**做什么**：用 4-bit 量化 + LoRA 微调更大的模型
**为什么**：QLoRA 让在消费级 GPU 上微调大模型成为可能
**成功标志**：能在 8GB 显存的 GPU 上微调 7B 模型

### 💻 代码区

```python
"""
Week 10 Day 2：LoRA / QLoRA 参数高效微调
"""
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    BitsAndBytesConfig,
)
from peft import LoraConfig, get_peft_model, TaskType
from trl import SFTTrainer
from datasets import Dataset

# ========== LoRA 原理说明 ==========

lora_explanation = """
LoRA（Low-Rank Adaptation）核心思想：

原始权重矩阵 W (d × d)  →  分解为 A (d × r) 和 B (r × d)
其中 r << d（通常 r=8 或 16）

前向传播：
  原始：h = Wx
  LoRA：h = Wx + BAx = (W + BA)x

参数量对比：
  全量微调：d × d = 4096 × 4096 = 16,777,216 个参数
  LoRA (r=8)：4096 × 8 + 8 × 4096 = 65,536 个参数
  节省了 99.6% 的参数！

训练时只更新 A 和 B，原始权重 W 冻结不动。
"""
print(lora_explanation)

# ========== 基础 LoRA 微调 ==========

def basic_lora_finetune():
    """基础 LoRA 微调示例（使用 GPT-2）"""

    model_name = "gpt2"
    print(f"加载模型：{model_name}")

    # 加载模型和分词器
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(model_name)

    # 配置 LoRA
    lora_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,  # 因果语言模型
        r=8,                           # 低秩维度
        lora_alpha=32,                 # 缩放因子
        lora_dropout=0.1,              # Dropout
        target_modules=["c_attn", "c_proj"],  # 应用 LoRA 的层
    )

    # 应用 LoRA
    model = get_peft_model(model, lora_config)

    # 打印可训练参数量
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"可训练参数：{trainable_params:,} / {total_params:,} ({100*trainable_params/total_params:.2f}%)")

    # 准备训练数据
    train_texts = [
        "Q: 什么是机器学习？ A: 机器学习是人工智能的一个分支，使计算机能从数据中学习。",
        "Q: Python 是什么？ A: Python 是一种高级编程语言，以简洁易读著称。",
        "Q: 什么是深度学习？ A: 深度学习是机器学习的子集，使用多层神经网络。",
    ]

    train_dataset = Dataset.from_dict({"text": train_texts})

    def tokenize_function(examples):
        return tokenizer(
            examples["text"],
            truncation=True,
            padding="max_length",
            max_length=128
        )

    train_dataset = train_dataset.map(tokenize_function, batched=True)

    # 训练参数
    training_args = TrainingArguments(
        output_dir="./lora_output",
        num_train_epochs=3,
        per_device_train_batch_size=2,
        learning_rate=2e-4,
        logging_steps=10,
        save_strategy="epoch",
        fp16=torch.cuda.is_available(),
    )

    # 训练
    trainer = SFTTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        tokenizer=tokenizer,
    )

    print("开始 LoRA 微调...")
    trainer.train()
    print("微调完成！")

    # 保存 LoRA 权重（很小！）
    model.save_pretrained("./lora_adapter")
    print("LoRA 适配器已保存")

    return model, tokenizer


# ========== QLoRA 量化微调 ==========

def qlora_finetune():
    """QLoRA 微调示例（需要 GPU）"""

    if not torch.cuda.is_available():
        print("⚠️ QLoRA 需要 GPU，跳过此示例")
        return

    model_name = "Qwen/Qwen2-0.5B"  # 使用小模型演示

    # 4-bit 量化配置
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,                    # 4-bit 量化
        bnb_4bit_quant_type="nf4",            # NF4 量化类型
        bnb_4bit_compute_dtype=torch.float16, # 计算精度
        bnb_4bit_use_double_quant=True,       # 双重量化
    )

    print(f"加载量化模型：{model_name}")
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        device_map="auto"
    )
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    # QLoRA 配置
    lora_config = LoraConfig(
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
        task_type=TaskType.CAUSAL_LM,
    )

    model = get_peft_model(model, lora_config)

    # 打印显存使用
    if torch.cuda.is_available():
        mem_allocated = torch.cuda.memory_allocated() / 1024**3
        print(f"GPU 显存使用：{mem_allocated:.2f} GB")

    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total = sum(p.numel() for p in model.parameters())
    print(f"可训练参数：{trainable:,} ({100*trainable/total:.2f}%)")

    print("QLoRA 微调环境准备就绪！")


# ========== LoRA 合并与推理 ==========

def merge_and_inference():
    """LoRA 权重合并与推理"""
    from peft import PeftModel

    # 加载基础模型
    base_model = AutoModelForCausalLM.from_pretrained("gpt2")

    # 加载 LoRA 适配器
    model = PeftModel.from_pretrained(base_model, "./lora_adapter")

    # 合并 LoRA 权重到基础模型
    merged_model = model.merge_and_unload()
    print("LoRA 权重已合并到基础模型")

    # 合并后的模型可以正常推理
    tokenizer = AutoTokenizer.from_pretrained("gpt2")
    inputs = tokenizer("Q: 什么是深度学习？ A:", return_tensors="pt")

    outputs = merged_model.generate(**inputs, max_new_tokens=50)
    print(f"生成结果：{tokenizer.decode(outputs[0], skip_special_tokens=True)}")


# 运行基础 LoRA 微调
# basic_lora_finetune()  # 取消注释以运行

# 运行 QLoRA 演示
qlora_finetune()
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| GPU 显存不足 (OOM) | 降低 batch_size 或使用 QLoRA |
| LoRA 适配器加载失败 | 确认 `target_modules` 与模型结构匹配 |
| 训练 loss 不下降 | 调整 learning_rate（尝试 1e-4 到 5e-4） |
| 量化速度慢 | 确认安装了 `bitsandbytes` 和 CUDA 版本匹配 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| LoRA | 低秩适配，只训练小矩阵 | 只换家具不拆墙 |
| QLoRA | 量化 + LoRA | 压缩房子后换家具 |
| rank (r) | 低秩矩阵的维度 | 换家具的预算 |
| target_modules | 应用 LoRA 的模型层 | 哪些房间可以改造 |
| merge_and_unload | 合并 LoRA 权重到基础模型 | 装修完拆除脚手架 |

### ✅ 验收清单
- [ ] 理解 LoRA 的低秩分解原理
- [ ] 能配置 LoRA 参数（r、alpha、target_modules）
- [ ] 能运行 LoRA 微调并查看参数量对比
- [ ] 理解 QLoRA 的量化原理

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 3 将学习 DPO 和 GRPO 训练方法，请确保已理解 LoRA 的概念。

---

## Day 3：DPO / GRPO 训练

### 📅 Day 3：DPO / GRPO — 不用奖励模型也能做 RLHF

### 🧭 今日方向
学习 DPO（Direct Preference Optimization）和 GRPO（Group Relative Policy Optimization）——更简单的对齐方法。

### 🎯 生俗比喻
- **RLHF**：请 100 个老师给学生的回答打分，然后训练一个评分模型，再用评分模型训练学生。费时费力。
- **DPO**：只告诉学生"这个回答比那个好"，学生自己摸索出什么是好的。省去了评分模型。
- **GRPO**：让学生写 5 个版本的答案，互相排名，最好的留下来改进。更灵活。

### 📋 今日三件事
1. 理解 DPO 的数学原理
2. 实现 DPO 训练流程
3. 了解 GRPO 的概念和优势

### 🗺️ 手把手路线

#### Step 1：DPO 原理
**做什么**：理解 DPO 如何直接用偏好数据优化策略
**为什么**：DPO 是目前最流行的对齐方法之一
**成功标志**：能解释 DPO 为什么不需要奖励模型

#### Step 2：DPO 训练实战
**做什么**：用 TRL 库实现 DPO 训练
**为什么**：实践是理解的最好方式
**成功标志**：模型在 chosen/rejected 上的得分差增大

#### Step 3：GRPO 概念
**做什么**：理解 GRPO 的分组排序思想
**为什么**：GRPO 在某些场景下比 DPO 更灵活
**成功标志**：能解释 GRPO 的工作流程

### 💻 代码区

```python
"""
Week 10 Day 3：DPO / GRPO 训练
"""
import json
from datasets import Dataset

# ========== DPO 训练数据 ==========

# 构建 DPO 偏好数据集
preference_data = [
    {
        "prompt": "请解释什么是大语言模型。",
        "chosen": "大语言模型（LLM）是一种基于 Transformer 架构的深度学习模型，通过在海量文本数据上进行预训练，学习语言的统计规律和语义关系。它能够执行多种自然语言处理任务，如文本生成、翻译、问答等。代表模型包括 GPT 系列、Claude、Llama 等。",
        "rejected": "大语言模型就是一个很大的模型。（过于简略，没有实质内容）"
    },
    {
        "prompt": "Python 中的列表推导式是什么？",
        "chosen": "列表推导式（List Comprehension）是 Python 中创建列表的简洁语法。基本格式为 [expression for item in iterable if condition]。例如 [x**2 for x in range(10) if x % 2 == 0] 会生成 [0, 4, 16, 36, 64]。它比传统的 for 循环更简洁、更快。",
        "rejected": "就是用方括号写一个循环。（不准确且不完整）"
    },
    {
        "prompt": "如何提高代码质量？",
        "chosen": "提高代码质量的方法包括：1) 遵循编码规范（如 PEP 8）；2) 编写清晰的注释和文档；3) 进行代码审查；4) 编写单元测试；5) 使用类型注解；6) 保持函数短小精悍；7) 避免重复代码（DRY 原则）；8) 使用静态分析工具如 mypy、pylint。",
        "rejected": "写注释。（太简单）"
    },
    {
        "prompt": "什么是 REST API？",
        "chosen": "REST（Representational State Transfer）API 是一种基于 HTTP 协议的 Web 服务架构风格。它使用标准的 HTTP 方法（GET、POST、PUT、DELETE）来操作资源，通过 URL 标识资源，使用 JSON 或 XML 传输数据。REST API 的核心原则包括：无状态、统一接口、可缓存、分层系统。",
        "rejected": "就是网页接口。（过于简略）"
    },
    {
        "prompt": "解释数据库索引的作用。",
        "chosen": "数据库索引类似于书的目录，它通过创建额外的数据结构（如 B-Tree、Hash）来加速数据检索。索引可以大幅减少查询时需要扫描的数据量，将查询从 O(n) 降低到 O(log n)。但索引也有代价：占用存储空间、降低写入速度。因此需要根据查询模式合理创建索引。",
        "rejected": "索引让查询变快。（缺少原理和权衡分析）"
    }
]

dataset = Dataset.from_list(preference_data)
print(f"偏好数据集大小：{len(dataset)}")
print(f"数据格式示例：")
print(json.dumps(preference_data[0], ensure_ascii=False, indent=2))

# ========== DPO 训练 ==========

def train_with_dpo():
    """使用 TRL 进行 DPO 训练"""
    try:
        from transformers import AutoModelForCausalLM, AutoTokenizer
        from trl import DPOTrainer, DPOConfig
        import torch

        model_name = "gpt2"
        print(f"\n加载模型：{model_name}")

        model = AutoModelForCausalLM.from_pretrained(model_name)
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        tokenizer.pad_token = tokenizer.eos_token

        # DPO 训练配置
        training_args = DPOConfig(
            output_dir="./dpo_output",
            num_train_epochs=1,
            per_device_train_batch_size=2,
            learning_rate=5e-5,
            beta=0.1,  # DPO 的 KL 散度权重
            logging_steps=10,
            remove_unused_columns=False,
            report_to="none",  # 不上报到 wandb
        )

        # 创建 DPO Trainer
        trainer = DPOTrainer(
            model=model,
            args=training_args,
            train_dataset=dataset,
            tokenizer=tokenizer,
        )

        print("开始 DPO 训练...")
        trainer.train()
        print("DPO 训练完成！")

        # 保存模型
        trainer.save_model("./dpo_model")
        print("模型已保存")

    except Exception as e:
        print(f"DPO 训练演示（需要安装 trl）：{e}")
        print("\n安装命令：pip install trl[deepspeed]")


# ========== GRPO 概念演示 ==========

def grpo_concept_demo():
    """GRPO 概念演示"""

    grpo_explanation = """
    GRPO（Group Relative Policy Optimization）工作流程：
    
    1. 给定一个 prompt
    2. 从当前策略中采样一组（Group）G 个回答：{y1, y2, ..., yG}
    3. 用某种方式给这组回答打分/排序
    4. 用相对排序来更新策略
    
    数学公式简化版：
    L(θ) = -E[Σ rank(yi) * log σ(rθ(yi) - rθ(yj))]
    
    其中：
    - yi 是较好的回答
    - yj 是较差的回答  
    - rθ 是策略模型的评分函数
    - σ 是 sigmoid 函数
    
    GRPO 的优势：
    1. 不需要训练单独的奖励模型
    2. 组内排序比绝对打分更容易
    3. 可以用 LLM-as-Judge 做排序
    4. 在代码生成等场景效果很好（DeepSeek-Math 论文）
    """
    print(grpo_explanation)

    # 模拟 GRPO 评分过程
    prompt = "计算 2 + 3 * 4 的值"

    # 生成一组候选回答
    candidates = [
        {"response": "2 + 3 * 4 = 14", "score": None},
        {"response": "14", "score": None},
        {"response": "2 + 3 * 4 = (2 + 3) * 4 = 20", "score": None},
        {"response": "结果是14，先乘后加", "score": None},
    ]

    # 模拟 LLM-as-Judge 评分
    judge_scores = [5, 3, 1, 4]  # 手动模拟评分
    for i, score in enumerate(judge_scores):
        candidates[i]["score"] = score

    # 排序
    sorted_candidates = sorted(candidates, key=lambda x: x["score"], reverse=True)

    print(f"\nPrompt: {prompt}")
    print("\n候选回答排序：")
    for i, c in enumerate(sorted_candidates):
        print(f"  {i+1}. [分数:{c['score']}] {c['response']}")

    print("\n训练信号：")
    print(f"  正样本：{sorted_candidates[0]['response']}")
    print(f"  负样本：{sorted_candidates[-1]['response']}")


# ========== 构建训练数据的工具函数 ==========

def create_preference_data(
    prompts: list[str],
    model,
    tokenizer,
    num_samples: int = 4
) -> list[dict]:
    """
    自动构建偏好数据的工具函数
    用同一个模型生成多个回答，用 LLM 做评判排序
    """
    import torch

    preference_pairs = []

    for prompt in prompts:
        # 生成多个候选回答
        candidates = []
        inputs = tokenizer(prompt, return_tensors="pt")

        for _ in range(num_samples):
            outputs = model.generate(
                **inputs,
                max_new_tokens=100,
                temperature=0.8,
                do_sample=True
            )
            response = tokenizer.decode(outputs[0], skip_special_tokens=True)
            candidates.append(response)

        # 这里应该用 LLM-as-Judge 排序
        # 简化处理：按长度排序（实际应该用更好的评判标准）
        candidates.sort(key=len, reverse=True)

        preference_pairs.append({
            "prompt": prompt,
            "chosen": candidates[0],
            "rejected": candidates[-1]
        })

    return preference_pairs


# 运行演示
train_with_dpo()
grpo_concept_demo()
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| DPO loss 不下降 | 调整 beta 参数（0.1-0.5） |
| chosen/rejected 太相似 | 增加偏好差异 |
| GRPO 评分不一致 | 使用更稳定的 LLM-as-Judge |
| 内存不足 | 减小 batch_size 或使用 QLoRA |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| DPO | 直接偏好优化 | 只比好坏不打分 |
| GRPO | 组相对策略优化 | 小组互评 |
| Chosen | 好的回答（正样本） | 范文 |
| Rejected | 差的回答（负样本） | 反面教材 |
| Beta | KL散度权重 | 保持原始能力的力度 |

### ✅ 验收清单
- [ ] 理解 DPO 不需要奖励模型的原因
- [ ] 能构建 DPO 偏好数据集
- [ ] 理解 GRPO 的分组排序机制
- [ ] 能运行 DPO 训练

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 4 将学习如何构造高质量的训练数据，请确保已理解 DPO 数据格式。

---

## Day 4：训练数据构造

### 📅 Day 4：训练数据构造 — "垃圾进，垃圾出"的解药

### 🧭 今日方向
学习如何构造高质量的 SFT、DPO 训练数据，包括数据来源、质量控制、数据增强。

### 🎯 生俗比喻
训练数据就像做菜的食材。如果你用的是新鲜蔬菜和优质肉类，做出来的菜自然好吃。如果你用的是过期食材和地沟油，再好的厨师也做不出好菜。数据构造就是要确保你用的"食材"是高质量的。

### 📋 今日三件事
1. 设计训练数据的采集和标注流程
2. 实现数据质量验证工具
3. 用 LLM 生成合成训练数据

### 🗺️ 手把手路线

#### Step 1：数据采集策略
**做什么**：确定数据来源（人工标注、公开数据集、合成生成）
**为什么**：数据来源决定了数据质量的上限
**成功标志**：有明确的数据采集计划

#### Step 2：质量验证
**做什么**：实现数据格式检查、内容质量评估
**为什么**：垃圾数据会毁掉训练效果
**成功标志**：能自动检测和过滤低质量数据

#### Step 3：合成数据生成
**做什么**：用 LLM 生成训练数据并人工审核
**为什么**：合成数据可以快速扩充数据集
**成功标志**：生成的数据通过质量检查

### 💻 代码区

```python
"""
Week 10 Day 4：训练数据构造
"""
import json
import re
from typing import Optional
from dataclasses import dataclass

# ========== 数据质量检查器 ==========

@dataclass
class QualityReport:
    """质量检查报告"""
    passed: bool
    issues: list[str]
    score: float  # 0-1

class TrainingDataValidator:
    """训练数据质量验证器"""

    def __init__(self):
        self.min_response_length = 20
        self.max_response_length = 2000
        self.min_prompt_length = 5

    def validate_sft(self, data: dict) -> QualityReport:
        """验证 SFT 数据"""
        issues = []

        # 检查格式
        if "messages" not in data:
            issues.append("缺少 messages 字段")
            return QualityReport(False, issues, 0)

        messages = data["messages"]
        if len(messages) < 2:
            issues.append("messages 至少需要 2 条")
            return QualityReport(False, issues, 0)

        # 检查角色
        roles = [m["role"] for m in messages]
        if "assistant" not in roles:
            issues.append("缺少 assistant 回复")

        # 检查内容质量
        for msg in messages:
            if not msg.get("content"):
                issues.append(f"消息内容为空：role={msg['role']}")
            elif msg["role"] == "assistant":
                content = msg["content"]
                if len(content) < self.min_response_length:
                    issues.append(f"回复过短：{len(content)} 字符")
                elif len(content) > self.max_response_length:
                    issues.append(f"回复过长：{len(content)} 字符")

        # 检查语言一致性
        assistant_msgs = [m for m in messages if m["role"] == "assistant"]
        if assistant_msgs:
            content = assistant_msgs[-1]["content"]
            has_chinese = bool(re.search(r'[一-鿿]', content))
            has_english = bool(re.search(r'[a-zA-Z]{3,}', content))
            if has_chinese and has_english:
                pass  # 混合语言可能是正常的（技术文档）
            elif not has_chinese and not has_english:
                issues.append("回复内容语言不明确")

        score = max(0, 1 - len(issues) * 0.2)
        return QualityReport(len(issues) == 0, issues, score)

    def validate_preference(self, data: dict) -> QualityReport:
        """验证偏好数据（DPO/RLHF）"""
        issues = []

        required_fields = ["prompt", "chosen", "rejected"]
        for field in required_fields:
            if field not in data:
                issues.append(f"缺少 {field} 字段")

        if issues:
            return QualityReport(False, issues, 0)

        # 检查 chosen 比 rejected 好
        chosen_len = len(data["chosen"])
        rejected_len = len(data["rejected"])

        if chosen_len < self.min_response_length:
            issues.append(f"chosen 过短：{chosen_len} 字符")
        if rejected_len < 5:
            issues.append(f"rejected 过短：{rejected_len} 字符")

        # 检查 chosen 和 rejected 不同
        if data["chosen"] == data["rejected"]:
            issues.append("chosen 和 rejected 内容相同")

        # 检查长度差异合理性
        if chosen_len > rejected_len * 5:
            issues.append("chosen 比 rejected 长太多，可能质量差异不大")

        score = max(0, 1 - len(issues) * 0.25)
        return QualityReport(len(issues) == 0, issues, score)


# ========== 合成数据生成器 ==========

class SyntheticDataGenerator:
    """用 LLM 生成合成训练数据"""

    def __init__(self):
        try:
            from openai import OpenAI
            self.client = OpenAI()
            self.use_llm = True
        except Exception:
            self.use_llm = False
            print("⚠️ OpenAI 未配置，使用模板生成")

    def generate_sft_pair(
        self,
        system_prompt: str,
        topic: str,
        difficulty: str = "medium"
    ) -> dict:
        """生成一对 SFT 数据"""

        if self.use_llm:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": f"""请生成一个关于"{topic}"的问答对。
难度：{difficulty}
要求：
- 问题要自然、具体
- 回答要准确、详细（200-500字）
- 使用中文

输出 JSON 格式：
{{"question": "...", "answer": "..."}}"""},
                ],
                temperature=0.7
            )

            import json
            try:
                result = json.loads(response.choices[0].message.content)
                return {
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": result["question"]},
                        {"role": "assistant", "content": result["answer"]}
                    ]
                }
            except json.JSONDecodeError:
                pass

        # Fallback：模板生成
        return {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"请解释{topic}的概念和应用。"},
                {"role": "assistant", "content": f"{topic}是一个重要的技术概念...（模板回复）"}
            ]
        }

    def generate_preference_pair(
        self,
        topic: str,
        good_quality: str = "detailed",
    ) -> dict:
        """生成偏好数据对"""

        if self.use_llm:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "user", "content": f"""请为"{topic}"生成一对回答。

要求：
1. chosen（好的回答）：详细、准确、有结构（200-400字）
2. rejected（差的回答）：简略、不准确、缺乏信息（20-50字）

输出 JSON 格式：
{{"chosen": "...", "rejected": "..."}}"""},
                ],
                temperature=0.7
            )

            try:
                result = json.loads(response.choices[0].message.content)
                return {
                    "prompt": f"请解释{topic}。",
                    "chosen": result["chosen"],
                    "rejected": result["rejected"]
                }
            except json.JSONDecodeError:
                pass

        # Fallback
        return {
            "prompt": f"请解释{topic}。",
            "chosen": f"{topic}是一个重要的概念，它有很多应用...",
            "rejected": f"{topic}就是那个东西。"
        }

    def generate_batch(
        self,
        topics: list[str],
        data_type: str = "sft",
        count_per_topic: int = 2
    ) -> list[dict]:
        """批量生成训练数据"""
        results = []
        for topic in topics:
            for _ in range(count_per_topic):
                if data_type == "sft":
                    data = self.generate_sft_pair(
                        "你是一个技术专家。", topic
                    )
                else:
                    data = self.generate_preference_pair(topic)
                results.append(data)
        return results


# ========== 使用示例 ==========

# 创建验证器
validator = TrainingDataValidator()

# 验证 SFT 数据
print("="*50)
print("SFT 数据验证：")
sft_data = {
    "messages": [
        {"role": "system", "content": "你是一个助手"},
        {"role": "user", "content": "什么是Python？"},
        {"role": "assistant", "content": "Python是一种高级编程语言，由Guido van Rossum于1991年发布。它以简洁易读的语法著称，支持多种编程范式，包括面向对象、函数式和过程式编程。Python拥有庞大的生态系统，在Web开发、数据科学、人工智能等领域广泛应用。"}
    ]
}
report = validator.validate_sft(sft_data)
print(f"  通过：{report.passed}，分数：{report.score}，问题：{report.issues}")

# 验证偏好数据
print("\n偏好数据验证：")
pref_data = {
    "prompt": "什么是机器学习？",
    "chosen": "机器学习是AI的一个分支，让计算机从数据中学习。",
    "rejected": "就是AI。"
}
report = validator.validate_preference(pref_data)
print(f"  通过：{report.passed}，分数：{report.score}，问题：{report.issues}")

# 批量生成数据
print("\n批量生成训练数据：")
generator = SyntheticDataGenerator()
topics = ["RAG技术", "向量数据库", "Agent架构"]
batch_data = generator.generate_batch(topics, data_type="sft", count_per_topic=1)
print(f"  生成了 {len(batch_data)} 条 SFT 数据")

batch_pref = generator.generate_batch(topics, data_type="preference", count_per_topic=1)
print(f"  生成了 {len(batch_pref)} 条偏好数据")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| 生成的数据质量差 | 增加 prompt 中的约束条件 |
| 数据格式不一致 | 使用 Pydantic 做格式校验 |
| 偏好差异不明显 | 明确要求 chosen 和 rejected 的质量差距 |
| 批量生成太慢 | 并行调用 API 或减少数量 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Synthetic Data | 合成数据，用LLM生成的训练数据 | 人工合成食材 |
| Quality Validation | 数据质量检查 | 食材质检 |
| Data Augmentation | 数据增强 | 同一种食材的不同做法 |
| Ground Truth | 标准答案 | 参考答案 |

### ✅ 验收清单
- [ ] 能检查训练数据的格式和质量
- [ ] 能用 LLM 生成合成训练数据
- [ ] 能批量生成并验证数据
- [ ] 理解数据质量对训练效果的影响

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 5 将进行微调实验，在真实数据上训练模型并评估效果。

---

## Day 5：微调实验

### 📅 Day 5：微调实验 — 把理论变成现实

### 🧭 今日方向
完成一个完整的微调实验：数据准备 → 训练 → 评估 → 对比，验证微调效果。

### 🎯 生俗比喻
前四天是"学菜谱"，今天是"下厨"。你将亲手做一道菜（微调模型），然后品尝（评估）它的味道，和没加工的食材（原始模型）做对比。

### 📋 今日三件事
1. 准备实验数据集
2. 运行 LoRA 微调训练
3. 对比微调前后的模型表现

### 🗺️ 手把手路线

#### Step 1：数据准备
**做什么**：构建 50-100 条高质量训练数据
**为什么**：数据是微调的基础
**成功标志**：通过质量检查的训练数据集

#### Step 2：训练执行
**做什么**：运行 LoRA 微调，记录训练曲线
**为什么**：观察训练过程是理解模型的关键
**成功标志**：训练 loss 正常下降

#### Step 3：效果评估
**做什么**：用相同的 prompt 测试微调前后的模型
**为什么**：对比才能看出微调效果
**成功标志**：微调后的模型在目标任务上明显更好

### 💻 代码区

```python
"""
Week 10 Day 5：微调实验
完整流程：数据准备 → 训练 → 评估 → 对比
"""
import json
import time
from dataclasses import dataclass

# ========== 实验配置 ==========

@dataclass
class ExperimentConfig:
    """实验配置"""
    model_name: str = "gpt2"
    output_dir: str = "./experiment_output"
    num_epochs: int = 3
    batch_size: int = 4
    learning_rate: float = 2e-4
    lora_r: int = 8
    lora_alpha: int = 32
    max_seq_length: int = 256

config = ExperimentConfig()
print("实验配置：")
for k, v in config.__dict__.items():
    print(f"  {k}: {v}")


# ========== Step 1: 准备数据 ==========

training_data = [
    {
        "messages": [
            {"role": "system", "content": "你是一个Python编程助手。"},
            {"role": "user", "content": "如何反转一个列表？"},
            {"role": "assistant", "content": "反转列表有几种方法：\n1. 使用切片：reversed_list = my_list[::-1]\n2. 使用 reversed()：reversed_list = list(reversed(my_list))\n3. 使用 .reverse() 方法（原地修改）：my_list.reverse()\n\n推荐使用切片方式，简洁且不修改原列表。"}
        ]
    },
    {
        "messages": [
            {"role": "system", "content": "你是一个Python编程助手。"},
            {"role": "user", "content": "什么是装饰器？"},
            {"role": "assistant", "content": "装饰器（Decorator）是一种设计模式，用于在不修改原函数代码的情况下扩展函数功能。它本质上是一个高阶函数，接收一个函数作为参数，返回一个新函数。\n\n基本语法：\n@decorator\ndef function():\n    pass\n\n常用场景：日志记录、性能测试、权限校验、缓存等。"}
        ]
    },
    {
        "messages": [
            {"role": "system", "content": "你是一个Python编程助手。"},
            {"role": "user", "content": "Python 中的 *args 和 **kwargs 是什么？"},
            {"role": "assistant", "content": "*args 和 **kwargs 是 Python 中的可变参数：\n\n*args：接收任意数量的位置参数，存储为元组。例如 def func(*args) 可以调用 func(1, 2, 3)。\n\n**kwargs：接收任意数量的关键字参数，存储为字典。例如 def func(**kwargs) 可以调用 func(name='Alice', age=25)。\n\n它们常用于装饰器和需要灵活参数的函数中。"}
        ]
    },
    {
        "messages": [
            {"role": "system", "content": "你是一个Python编程助手。"},
            {"role": "user", "content": "什么是生成器？"},
            {"role": "assistant", "content": "生成器（Generator）是一种特殊的迭代器，使用 yield 关键字返回值。与普通函数不同，生成器函数在每次 yield 后暂停执行，下次调用时从暂停处继续。\n\n优点：\n1. 内存效率高：不需要一次性生成所有数据\n2. 惰性计算：只在需要时生成值\n\n示例：\ndef count_up_to(n):\n    i = 0\n    while i < n:\n        yield i\n        i += 1"}
        ]
    },
    {
        "messages": [
            {"role": "system", "content": "你是一个Python编程助手。"},
            {"role": "user", "content": "Python 的 GIL 是什么？它有什么影响？"},
            {"role": "assistant", "content": "GIL（Global Interpreter Lock）是 Python 的全局解释器锁。它确保同一时刻只有一个线程执行 Python 字节码。\n\n影响：\n1. 多线程无法利用多核 CPU 进行 CPU 密集型并行计算\n2. 对 I/O 密集型任务影响较小（I/O 等待时会释放 GIL）\n\n解决方案：\n1. 使用 multiprocessing 模块实现多进程并行\n2. 使用 C 扩展（如 NumPy）绕过 GIL\n3. 使用 asyncio 处理 I/O 密集型任务"}
        ]
    }
]

print(f"\n训练数据：{len(training_data)} 条")


# ========== Step 2: 训练 ==========

def run_training():
    """运行微调训练"""
    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
        from peft import LoraConfig, get_peft_model, TaskType
        from trl import SFTTrainer
        from datasets import Dataset

        # 加载模型
        print(f"\n加载模型：{config.model_name}")
        tokenizer = AutoTokenizer.from_pretrained(config.model_name)
        tokenizer.pad_token = tokenizer.eos_token
        model = AutoModelForCausalLM.from_pretrained(config.model_name)

        # LoRA 配置
        lora_config = LoraConfig(
            task_type=TaskType.CAUSAL_LM,
            r=config.lora_r,
            lora_alpha=config.lora_alpha,
            lora_dropout=0.1,
            target_modules=["c_attn", "c_proj"],
        )
        model = get_peft_model(model, lora_config)

        # 打印参数信息
        trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
        total = sum(p.numel() for p in model.parameters())
        print(f"可训练参数：{trainable:,} / {total:,} ({100*trainable/total:.2f}%)")

        # 准备数据集
        texts = []
        for item in training_data:
            text = ""
            for msg in item["messages"]:
                text += f"<|{msg['role']}|>\n{msg['content']}\n"
            texts.append(text)

        dataset = Dataset.from_dict({"text": texts})

        def tokenize(examples):
            return tokenizer(examples["text"], truncation=True, padding="max_length", max_length=config.max_seq_length)

        dataset = dataset.map(tokenize, batched=True)

        # 训练参数
        training_args = TrainingArguments(
            output_dir=config.output_dir,
            num_train_epochs=config.num_epochs,
            per_device_train_batch_size=config.batch_size,
            learning_rate=config.learning_rate,
            logging_steps=5,
            save_strategy="epoch",
            fp16=torch.cuda.is_available(),
            report_to="none",
        )

        # 训练
        trainer = SFTTrainer(
            model=model,
            args=training_args,
            train_dataset=dataset,
            tokenizer=tokenizer,
        )

        print("\n开始训练...")
        start_time = time.time()
        trainer.train()
        elapsed = time.time() - start_time
        print(f"训练完成！耗时：{elapsed:.1f}秒")

        # 保存
        model.save_pretrained(f"{config.output_dir}/lora_adapter")
        tokenizer.save_pretrained(f"{config.output_dir}/tokenizer")
        print(f"模型已保存到 {config.output_dir}")

        return model, tokenizer

    except ImportError as e:
        print(f"需要安装依赖：{e}")
        print("pip install transformers peft trl datasets torch")
        return None, None


# ========== Step 3: 评估对比 ==========

def evaluate_model(model, tokenizer, test_prompts: list[str]):
    """评估模型"""
    if model is None:
        print("模型未加载，使用模拟评估")
        for prompt in test_prompts:
            print(f"\nQ: {prompt}")
            print(f"A: （模拟回答：基于{config.model_name}的微调模型）")
        return

    import torch
    for prompt in test_prompts:
        inputs = tokenizer(prompt, return_tensors="pt")
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=150,
                temperature=0.7,
                do_sample=True
            )
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print(f"\nQ: {prompt}")
        print(f"A: {response[len(prompt):]}")


# ========== 运行实验 ==========

# 训练
print("="*60)
print("Step 2: 运行训练")
model, tokenizer = run_training()

# 评估
print("\n" + "="*60)
print("Step 3: 评估模型")
test_prompts = [
    "如何反转一个列表？",
    "什么是装饰器？",
    "解释 Python 的 GIL。",
]
evaluate_model(model, tokenizer, test_prompts)

# ========== 实验记录 ==========

experiment_log = {
    "date": "2024-XX-XX",
    "model": config.model_name,
    "training_data_size": len(training_data),
    "epochs": config.num_epochs,
    "lora_r": config.lora_r,
    "results": {
        "training_loss": "已记录",
        "eval_metrics": "待评估",
        "qualitative_analysis": "待分析"
    },
    "conclusions": "待填写"
}

print("\n" + "="*60)
print("实验记录模板：")
print(json.dumps(experiment_log, ensure_ascii=False, indent=2))
```

### 🆘 怑救包
| 问题 | 解决方案 |
|------|---------|
| 训练 loss 不下降 | 增加数据量或调整学习率 |
| 模型过拟合 | 增加 dropout、减少 epoch |
| 生成质量没有提升 | 检查训练数据质量和格式 |
| 训练太慢 | 减小模型或使用 GPU |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Training Loss | 训练损失，越低越好 | 考试分数 |
| Overfitting | 过拟合，死记硬背 | 背答案但不理解 |
| Epoch | 训练轮次 | 做题的遍数 |
| Learning Rate | 学习率，控制更新幅度 | 学习速度 |

### ✅ 验收清单
- [ ] 成功运行 LoRA 微调训练
- [ ] 训练 loss 正常下降
- [ ] 能对比微调前后的模型表现
- [ ] 记录了完整的实验日志

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Week 10 结束！下周将学习 Agent 评估和可观测性。

---

## 📚 本周总结

| Day | 主题 | 核心技能 |
|-----|------|---------|
| 1 | SFT 到 RLHF | 训练范式对比、数据格式设计 |
| 2 | LoRA / QLoRA | 参数高效微调、量化训练 |
| 3 | DPO / GRPO | 偏好对齐、相对排序优化 |
| 4 | 训练数据构造 | 数据质量验证、合成数据生成 |
| 5 | 微调实验 | 完整实验流程、效果评估 |

### 🎯 本周产出
- [x] 四种训练范式的对比文档
- [x] LoRA 微调实验
- [x] DPO 偏好数据集
- [x] 训练数据验证工具
- [x] 微调实验报告

### 📖 推荐阅读
- [LoRA Paper](https://arxiv.org/abs/2106.09685)
- [QLoRA Paper](https://arxiv.org/abs/2305.14314)
- [DPO Paper](https://arxiv.org/abs/2305.18290)
- [TRL Documentation](https://huggingface.co/docs/trl/)
