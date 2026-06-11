# 📅 Week 10 Day 5：动手微调实验（可选）

---

## 🧭 今日方向

今天我们进行完整的微调实验：使用 Hugging Face TRL 库，基于 LoRA/QLoRA 在自定义数据上微调一个小语言模型。这是理论到实践的关键一步。

**核心问题：** 如何从零开始完成一个完整的模型微调流程？

---

## 🎯 生活比喻

- **微调实验** = 实际做一道菜
- 今天之前我们都在学习理论（菜谱、食材、厨具）
- 今天我们要真正下厨，从备料（数据准备）到烹饪（训练）到上菜（推理）

---

## 📋 今日三件事

1. **准备训练数据**——构造一个小型 SFT 数据集
2. **配置微调参数**——LoRA + 训练超参数
3. **运行训练并监控**——观察 loss 曲线和模型输出变化

---

## 🗺️ 手把手路线

### 第一步：环境准备

```bash
# 基础依赖
pip install torch transformers datasets accelerate

# PEFT 和 TRL
pip install peft trl

# 可选：用于监控训练
pip install wandb tensorboard

# 可选：量化支持（需要 NVIDIA GPU）
pip install bitsandbytes
```

### 第二步：检查硬件环境

```bash
# 检查 GPU 是否可用
python -c "import torch; print(f'CUDA: {torch.cuda.is_available()}, Device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"CPU\"}')"
```

---

## 💻 代码区

### 代码 1：准备训练数据

```python
"""
Day 5 - 准备 SFT 训练数据
构造一个小型但高质量的训练数据集
"""

import json
import os

print("=" * 60)
print("准备 SFT 训练数据")
print("=" * 60)

# ============================================================
# 1. 构造训练数据
# ============================================================
training_data = [
    {
        "messages": [
            {"role": "system", "content": "你是一个Python编程助手，擅长解答编程问题。"},
            {"role": "user", "content": "如何用Python读取JSON文件？"},
            {"role": "assistant", "content": "使用 json 模块可以轻松读取 JSON 文件：\n\n```python\nimport json\n\n# 读取 JSON 文件\nwith open('data.json', 'r', encoding='utf-8') as f:\n    data = json.load(f)\n\nprint(data)\n```\n\n如果 JSON 文件很大，可以使用流式读取：\n```python\nimport ijson  # 需要安装: pip install ijson\n\nwith open('large.json', 'rb') as f:\n    for item in ijson.items(f, 'item'):\n        process(item)\n```"}
        ]
    },
    {
        "messages": [
            {"role": "system", "content": "你是一个Python编程助手，擅长解答编程问题。"},
            {"role": "user", "content": "解释Python的异常处理机制"},
            {"role": "assistant", "content": "Python 的异常处理使用 try-except-finally 语句：\n\n```python\ntry:\n    # 可能出错的代码\n    result = 10 / 0\nexcept ZeroDivisionError as e:\n    # 处理特定异常\n    print(f\"除零错误: {e}\")\nexcept Exception as e:\n    # 处理其他异常\n    print(f\"未知错误: {e}\")\nelse:\n    # 没有异常时执行\n    print(\"操作成功\")\nfinally:\n    # 无论如何都执行\n    print(\"清理资源\")\n```\n\n最佳实践：\n1. 捕获具体异常，不要用裸 except\n2. 使用 else 处理成功情况\n3. 使用 finally 清理资源"}
        ]
    },
    {
        "messages": [
            {"role": "system", "content": "你是一个Python编程助手，擅长解答编程问题。"},
            {"role": "user", "content": "Python中如何实现单例模式？"},
            {"role": "assistant", "content": "Python 中有多种实现单例模式的方法：\n\n方法1：使用 __new__ 方法\n```python\nclass Singleton:\n    _instance = None\n    \n    def __new__(cls):\n        if cls._instance is None:\n            cls._instance = super().__new__(cls)\n        return cls._instance\n```\n\n方法2：使用装饰器\n```python\ndef singleton(cls):\n    instances = {}\n    def get_instance(*args, **kwargs):\n        if cls not in instances:\n            instances[cls] = cls(*args, **kwargs)\n        return instances[cls]\n    return get_instance\n\n@singleton\nclass MyClass:\n    pass\n```\n\n方法3：使用模块（推荐）\n```python\n# singleton.py\nclass _Singleton:\n    pass\n\ninstance = _Singleton()\n```\n\n在 Python 中，通常直接使用模块级变量即可实现单例效果。"}
        ]
    },
    {
        "messages": [
            {"role": "system", "content": "你是一个Python编程助手，擅长解答编程问题。"},
            {"role": "user", "content": "解释Python的GIL（全局解释器锁）"},
            {"role": "assistant", "content": "GIL（Global Interpreter Lock）是 CPython 解释器中的一个机制，它确保同一时刻只有一个线程执行 Python 字节码。\n\n影响：\n1. 多线程无法利用多核 CPU 进行并行计算\n2. CPU 密集型任务建议使用 multiprocessing\n3. IO 密集型任务使用多线程仍然有效\n\n解决方案：\n```python\n# CPU 密集型：使用多进程\nfrom multiprocessing import Pool\n\nwith Pool(4) as p:\n    results = p.map(cpu_intensive_func, data)\n\n# IO 密集型：使用多线程\nfrom concurrent.futures import ThreadPoolExecutor\n\nwith ThreadPoolExecutor(max_workers=4) as executor:\n    results = list(executor.map(io_intensive_func, urls))\n```\n\n注意：PyPy 和其他 Python 实现可能没有 GIL，或者可以禁用 GIL（Python 3.12+ 支持）。"}
        ]
    },
    {
        "messages": [
            {"role": "system", "content": "你是一个Python编程助手，擅长解答编程问题。"},
            {"role": "user", "content": "Python中如何进行性能优化？"},
            {"role": "assistant", "content": "Python 性能优化可以从多个层面进行：\n\n1. 算法优化：选择合适的算法和数据结构\n```python\n# 使用 set 进行 O(1) 查找\nif item in large_set:  # O(1)\n    pass\n\n# 避免在循环中重复计算\nresult = expensive_func()\nfor item in data:\n    process(item, result)  # 只计算一次\n```\n\n2. 使用内置函数和库\n```python\n# 使用 map/filter 代替循环\nsquared = list(map(lambda x: x**2, data))\n\n# 使用 NumPy 进行数值计算\nimport numpy as np\nresult = np.dot(a, b)  # 比纯 Python 快 10-100 倍\n```\n\n3. 使用生成器减少内存\n```python\n# 生成器表达式\nsum(x**2 for x in range(1000000))\n\n# 而不是列表推导式\nsum([x**2 for x in range(1000000)])  # 占用更多内存\n```\n\n4. 缓存重复计算\n```python\nfrom functools import lru_cache\n\n@lru_cache(maxsize=128)\ndef fibonacci(n):\n    if n < 2:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n```"}
        ]
    },
]

print(f"训练数据: {len(training_data)} 条")

# 保存数据
os.makedirs("./train_data", exist_ok=True)
with open("./train_data/sft_data.jsonl", "w", encoding="utf-8") as f:
    for item in training_data:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")

print(f"数据已保存到: ./train_data/sft_data.jsonl")
print()

# 显示数据统计
total_chars = 0
for item in training_data:
    for msg in item["messages"]:
        if msg["role"] == "assistant":
            total_chars += len(msg["content"])

print(f"数据统计:")
print(f"  总样本数: {len(training_data)}")
print(f"  平均回答长度: {total_chars / len(training_data):.0f} 字符")
print(f"  主题覆盖: JSON读取、异常处理、单例模式、GIL、性能优化")
```

### 代码 2：配置和运行微调

```python
"""
Day 5 - 配置和运行微调
使用 Hugging Face TRL + PEFT 进行 SFT 微调
"""

import torch
import json
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
)
from peft import LoraConfig, get_peft_model, TaskType
from trl import SFTTrainer, SFTConfig
from datasets import Dataset

print("=" * 60)
print("配置和运行微调")
print("=" * 60)

# ============================================================
# 步骤 1: 加载训练数据
# ============================================================
print("\n步骤 1: 加载训练数据")
print("-" * 40)

data_path = "./train_data/sft_data.jsonl"
training_examples = []
with open(data_path, "r", encoding="utf-8") as f:
    for line in f:
        training_examples.append(json.loads(line.strip()))

dataset = Dataset.from_list(training_examples)
print(f"  加载数据: {len(dataset)} 条")

# ============================================================
# 步骤 2: 加载模型
# ============================================================
print("\n步骤 2: 加载模型")
print("-" * 40)

# 根据硬件选择模型
model_name = "Qwen/Qwen2-0.5B"  # 小模型，适合演示
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"  设备: {device}")
print(f"  模型: {model_name}")

try:
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        device_map="auto" if device == "cuda" else None,
        trust_remote_code=True,
    )
    print(f"  模型参数量: {sum(p.numel() for p in model.parameters()) / 1e6:.1f}M")
    model_loaded = True
except Exception as e:
    print(f"  模型加载失败: {e}")
    print("  提示：请确保网络连接正常，或使用本地模型路径")
    model_loaded = False

# ============================================================
# 步骤 3: 配置 LoRA
# ============================================================
print("\n步骤 3: 配置 LoRA")
print("-" * 40)

lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=8,                          # LoRA 秩
    lora_alpha=32,                # 缩放因子
    lora_dropout=0.1,             # Dropout
    target_modules=["q_proj", "v_proj"],  # 目标模块
)

print(f"  秩 (r): {lora_config.r}")
print(f"  缩放因子 (alpha): {lora_config.lora_alpha}")
print(f"  目标模块: {lora_config.target_modules}")

if model_loaded:
    peft_model = get_peft_model(model, lora_config)
    peft_model.print_trainable_parameters()
else:
    peft_model = None
    print("  跳过 LoRA 配置（模型未加载）")

# ============================================================
# 步骤 4: 配置训练参数
# ============================================================
print("\n步骤 4: 配置训练参数")
print("-" * 40)

training_args = SFTConfig(
    output_dir="./sft_output",
    num_train_epochs=3,              # 训练轮数
    per_device_train_batch_size=1,   # 批大小（小模型可用更大值）
    gradient_accumulation_steps=2,   # 梯度累积
    learning_rate=2e-4,              # 学习率
    weight_decay=0.01,               # 权重衰减
    warmup_ratio=0.1,                # 预热比例
    logging_steps=1,                 # 日志间隔
    save_strategy="epoch",           # 保存策略
    fp16=(device == "cuda"),         # 混合精度
    report_to="none",                # 不上报到 wandb
    max_seq_length=512,              # 最大序列长度
    dataloader_num_workers=0,        # 数据加载线程数
)

print(f"  输出目录: {training_args.output_dir}")
print(f"  训练轮数: {training_args.num_train_epochs}")
print(f"  学习率: {training_args.learning_rate}")
print(f"  批大小: {training_args.per_device_train_batch_size}")
print(f"  梯度累积: {training_args.gradient_accumulation_steps}")
print(f"  有效批大小: {training_args.per_device_train_batch_size * training_args.gradient_accumulation_steps}")

# ============================================================
# 步骤 5: 开始训练
# ============================================================
print("\n步骤 5: 开始训练")
print("-" * 40)

if peft_model is not None:
    trainer = SFTTrainer(
        model=peft_model,
        args=training_args,
        train_dataset=dataset,
        processing_class=tokenizer,
    )

    print("  开始训练...")
    train_result = trainer.train()

    print(f"\n  训练完成！")
    print(f"  训练损失: {train_result.training_loss:.4f}")
    print(f"  训练步数: {train_result.global_step}")

    # 保存模型
    trainer.save_model("./sft_model_final")
    tokenizer.save_pretrained("./sft_model_final")
    print(f"  模型已保存到: ./sft_model_final")
else:
    print("  跳过训练（模型未加载）")
    print("  实际运行时，请确保有 GPU 并能下载模型")

# ============================================================
# 步骤 6: 用微调后的模型推理
# ============================================================
print("\n步骤 6: 模型推理测试")
print("-" * 40)

if peft_model is not None:
    peft_model.eval()

    test_prompts = [
        "如何用Python读取JSON文件？",
        "解释Python的异常处理机制",
        "Python中如何实现单例模式？",
    ]

    for prompt in test_prompts:
        messages = [
            {"role": "system", "content": "你是一个Python编程助手，擅长解答编程问题。"},
            {"role": "user", "content": prompt},
        ]

        # 使用 tokenizer 的 chat 模板
        text = tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )

        inputs = tokenizer(text, return_tensors="pt").to(peft_model.device)

        with torch.no_grad():
            outputs = peft_model.generate(
                **inputs,
                max_new_tokens=150,
                temperature=0.7,
                do_sample=True,
                top_p=0.9,
                repetition_penalty=1.1,
            )

        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        # 提取助手的回答部分
        response = response.split("assistant\n")[-1].strip()

        print(f"\n  问题: {prompt}")
        print(f"  回答: {response[:200]}...")
else:
    print("  跳过推理测试（模型未加载）")
```

### 代码 3：训练监控和可视化

```python
"""
Day 5 - 训练监控和可视化
分析训练日志和 loss 曲线
"""

import json
import os

print("=" * 60)
print("训练监控和可视化")
print("=" * 60)

# ============================================================
# 1. 模拟训练日志
# ============================================================
print("\n1. 训练日志分析")
print("-" * 40)

# 模拟训练日志
training_log = [
    {"epoch": 1.0, "step": 1, "loss": 2.3456, "learning_rate": 2e-4},
    {"epoch": 1.0, "step": 2, "loss": 2.1234, "learning_rate": 2e-4},
    {"epoch": 1.0, "step": 3, "loss": 1.9876, "learning_rate": 2e-4},
    {"epoch": 2.0, "step": 4, "loss": 1.6543, "learning_rate": 1.8e-4},
    {"epoch": 2.0, "step": 5, "loss": 1.4321, "learning_rate": 1.6e-4},
    {"epoch": 2.0, "step": 6, "loss": 1.2345, "learning_rate": 1.4e-4},
    {"epoch": 3.0, "step": 7, "loss": 0.9876, "learning_rate": 1.2e-4},
    {"epoch": 3.0, "step": 8, "loss": 0.8765, "learning_rate": 1.0e-4},
    {"epoch": 3.0, "step": 9, "loss": 0.7654, "learning_rate": 8e-5},
]

print("  训练日志:")
print(f"  {'Step':>5} {'Epoch':>7} {'Loss':>8} {'LR':>10}")
print("  " + "-" * 35)

for log in training_log:
    print(f"  {log['step']:>5} {log['epoch']:>7.1f} {log['loss']:>8.4f} {log['learning_rate']:>10.2e}")

# ============================================================
# 2. Loss 曲线分析
# ============================================================
print("\n2. Loss 曲线分析")
print("-" * 40)

losses = [log["loss"] for log in training_log]
steps = [log["step"] for log in training_log]

# 计算 loss 下降趋势
loss_diff = [losses[i] - losses[i-1] for i in range(1, len(losses))]
avg_loss_diff = sum(loss_diff) / len(loss_diff)

print(f"  初始 loss: {losses[0]:.4f}")
print(f"  最终 loss: {losses[-1]:.4f}")
print(f"  总下降: {losses[0] - losses[-1]:.4f}")
print(f"  平均每步下降: {avg_loss_diff:.4f}")

# 判断训练是否正常
if avg_loss_diff < 0:
    print("  状态: ✓ 训练正常，loss 持续下降")
elif avg_loss_diff > 0.1:
    print("  状态: ✗ 训练异常，loss 在上升")
else:
    print("  状态: ⚠ 训练可能收敛，loss 下降变慢")

# ============================================================
# 3. 文本 ASCII 可视化
# ============================================================
print("\n3. Loss 曲线 ASCII 可视化")
print("-" * 40)

# 归一化 loss 到 0-20 的范围
max_loss = max(losses)
min_loss = min(losses)
normalized = [(l - min_loss) / (max_loss - min_loss + 1e-8) for l in losses]

chart_height = 15
for row in range(chart_height, -1, -1):
    threshold = row / chart_height
    line = f"  {row * (max_loss - min_loss) / chart_height + min_loss:>6.2f} |"
    for i, val in enumerate(normalized):
        if val >= threshold:
            line += " ██ "
        else:
            line += "    "
    print(line)

print("       +" + "----" * len(losses))
step_labels = "        "
for s in steps:
    step_labels += f" {s:>3}"
print(step_labels)

# ============================================================
# 4. 训练建议
# ============================================================
print("\n4. 训练优化建议")
print("-" * 40)

suggestions = """
  常见训练问题及解决方案：
  ─────────────────────────────────────────────────
  问题: Loss 不下降
  → 降低学习率（从 2e-4 → 1e-4 → 5e-5）
  → 检查数据格式是否正确
  → 确认 labels 设置正确

  问题: Loss 震荡剧烈
  → 增大 batch_size
  → 使用 gradient_accumulation_steps
  → 检查数据是否有噪声

  问题: Loss 下降到一定程度后不变
  → 增大模型容量（更多 LoRA 层或更大 rank）
  → 增加训练数据多样性
  → 调整学习率调度器

  问题: 过拟合（训练 loss 低但效果差）
  → 增加 dropout
  → 减少训练轮数
  → 增加训练数据
"""
print(suggestions)

# ============================================================
# 5. 保存训练配置
# ============================================================
print("5. 保存训练配置")
print("-" * 40)

config = {
    "model_name": "Qwen/Qwen2-0.5B",
    "lora_config": {
        "r": 8,
        "lora_alpha": 32,
        "lora_dropout": 0.1,
        "target_modules": ["q_proj", "v_proj"],
    },
    "training_config": {
        "num_train_epochs": 3,
        "per_device_train_batch_size": 1,
        "gradient_accumulation_steps": 2,
        "learning_rate": 2e-4,
        "weight_decay": 0.01,
    },
    "results": {
        "initial_loss": losses[0],
        "final_loss": losses[-1],
        "total_steps": len(training_log),
    }
}

os.makedirs("./training_config", exist_ok=True)
config_path = "./training_config/config.json"
with open(config_path, "w", encoding="utf-8") as f:
    json.dump(config, f, indent=2, ensure_ascii=False)

print(f"  配置已保存到: {config_path}")
print(f"  训练配置摘要:")
print(f"    模型: {config['model_name']}")
print(f"    LoRA rank: {config['lora_config']['r']}")
print(f"    训练轮数: {config['training_config']['num_train_epochs']}")
print(f"    最终 loss: {config['results']['final_loss']:.4f}")
```

---

## 📤 预期输出

```
============================================================
准备 SFT 训练数据
============================================================
训练数据: 5 条
数据已保存到: ./train_data/sft_data.jsonl
数据统计:
  总样本数: 5
  平均回答长度: 385 字符
  主题覆盖: JSON读取、异常处理、单例模式、GIL、性能优化

============================================================
配置和运行微调
============================================================

步骤 1: 加载训练数据
  加载数据: 5 条

步骤 2: 加载模型
  设备: cuda
  模型: Qwen/Qwen2-0.5B
  模型参数量: 494.0M

步骤 3: 配置 LoRA
  trainable params: 294,912 || all params: 494,266,880 || trainable%: 0.0597

步骤 5: 开始训练
  训练完成！
  训练损失: 0.7654
  训练步数: 9

步骤 6: 模型推理测试
  问题: 如何用Python读取JSON文件？
  回答: 使用 json 模块可以轻松读取 JSON 文件：...
```

---

## ⚠️ 常见错误和解决方案

### 错误 1：模型下载超时
```
ConnectionError: HTTPSConnectionPool... Read timed out
```
**解决方案：**
- 设置 HuggingFace 镜像：`export HF_ENDPOINT=https://hf-mirror.com`
- 使用国内镜像源：`pip install -i https://pypi.tuna.tsinghua.edu.cn/simple`

### 错误 2：训练时 loss 为 NaN
**解决方案：**
- 降低学习率
- 检查数据中是否有异常值
- 确认 `torch_dtype` 设置正确

### 错误 3：显存不足
```
CUDA out of memory
```
**解决方案：**
- 减小 batch_size 到 1
- 增大 gradient_accumulation_steps
- 启用 QLoRA（需要 GPU + bitsandbytes）
- 减小 max_seq_length

### 错误 4：训练后模型输出质量差
**解决方案：**
- 增加训练数据量
- 提高数据质量
- 调整 LoRA rank（从 8 → 16 → 32）
- 增加训练轮数

---

## 🏋️ 每日挑战

1. **完整实验**：在你自己的数据上运行一次完整的微调实验，记录训练过程中的 loss 变化。

2. **对比实验**：分别用 rank=4, 8, 16 训练，比较最终效果和训练时间。

3. **进阶挑战**：尝试使用 QLoRA（4-bit 量化）微调一个 3B 模型，对比全精度训练的效果差异。
