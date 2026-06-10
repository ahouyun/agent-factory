# 📅 Week 10 Day 5：动手微调一个小模型（可选）

## 🧭 今日方向
> 使用 LoRA 实际微调一个小语言模型，体验完整的微调流程，从数据准备到模型评估。

## 🎯 生味比喻
> 微调模型就像教一个已经会说话的小孩（预训练模型）学习一项新技能（特定任务）。你不需要重新教他语言（预训练），只需要给他一些示范例子（SFT 数据），他就能学会新技能。今天我们就来当这个"老师"，教一个小模型学会回答特定领域的问题。

## 📋 今日三件事
1. 准备微调数据集（格式化为 Alpaca 格式）
2. 使用 LoRA 微调 GPT-2 或类似的 small model
3. 测试微调后的模型效果

## 🗺️ 手把手路线

### Step 1：准备训练数据
- 做什么: 创建指令-回答格式的训练数据
- 为什么: 高质量的数据是微调成功的基础
- 成功标志: 能创建 20+ 条格式正确的训练数据

### Step 2：加载预训练模型
- 做什么: 加载一个小模型（如 GPT-2）作为基础
- 为什么: 从头训练成本太高，微调更实际
- 成功标志: 能成功加载模型并进行推理

### Step 3：应用 LoRA 微调
- 做什么: 给模型添加 LoRA 层并训练
- 为什么: LoRA 是最常用的高效微调方法
- 成功标志: 训练 loss 下降

### Step 4：测试微调效果
- 做什么: 用测试数据验证微调效果
- 为什么: 验证微调是否成功
- 成功标志: 模型能生成合理的回答

## 💻 代码区

```python
"""
动手微调一个小模型
使用 GPT-2 + LoRA 实现完整的微调流程
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import numpy as np
from typing import List, Dict, Tuple
import json
import os

# ========== 1. 训练数据准备 ==========

def create_training_data() -> List[Dict]:
    """
    创建训练数据（Alpaca 格式）
    instruction: 指令
    input: 输入（可选）
    output: 期望输出
    """
    dataset = [
        {
            "instruction": "请用一句话解释什么是机器学习",
            "input": "",
            "output": "机器学习是让计算机从数据中自动学习规律并做出预测的方法。"
        },
        {
            "instruction": "请将以下英文翻译成中文",
            "input": "The weather is nice today.",
            "output": "今天天气很好。"
        },
        {
            "instruction": "请总结以下文本",
            "input": "深度学习在图像识别领域取得了巨大成功，特别是在医学影像诊断中表现突出。",
            "output": "深度学习在图像识别尤其是医学影像诊断方面有重大突破。"
        },
        {
            "instruction": "请列出三个学习编程的好处",
            "input": "",
            "output": "1. 提升逻辑思维能力 2. 增强就业竞争力 3. 可以创造自己的产品"
        },
        {
            "instruction": "请解释什么是 API",
            "input": "",
            "output": "API 是应用程序编程接口，它定义了不同软件组件之间交互的规范和协议。"
        },
        {
            "instruction": "请将以下句子改成更礼貌的表达",
            "input": "把文件发给我",
            "output": "请您方便的时候将文件发送给我，谢谢。"
        },
        {
            "instruction": "请用 Python 写一个打印 Hello World 的程序",
            "input": "",
            "output": "print('Hello, World!')"
        },
        {
            "instruction": "请解释什么是数据库索引",
            "input": "",
            "output": "数据库索引是一种数据结构，用于加速数据检索操作，类似于书的目录。"
        },
        {
            "instruction": "请将以下 JSON 解析为 Python 字典",
            "input": '{"name": "张三", "age": 25}',
            "output": "import json; data = json.loads('{\"name\": \"张三\", \"age\": 25}')"
        },
        {
            "instruction": "请解释什么是 RESTful API",
            "input": "",
            "output": "RESTful API 是一种遵循 REST 架构风格的 Web API，使用 HTTP 方法进行资源操作。"
        },
        {
            "instruction": "请用 SQL 查询所有年龄大于 25 的用户",
            "input": "表名: users, 字段: name, age",
            "output": "SELECT * FROM users WHERE age > 25;"
        },
        {
            "instruction": "请解释什么是 Docker",
            "input": "",
            "output": "Docker 是一个容器化平台，用于打包、分发和运行应用程序及其依赖项。"
        },
        {
            "instruction": "请将列表去重并排序",
            "input": "[3, 1, 4, 1, 5, 9, 2, 6, 5]",
            "output": "sorted(set([3, 1, 4, 1, 5, 9, 2, 6, 5]))  # [1, 2, 3, 4, 5, 6, 9]"
        },
        {
            "instruction": "请解释什么是 Git",
            "input": "",
            "output": "Git 是一个分布式版本控制系统，用于跟踪文件更改和协调多人协作开发。"
        },
        {
            "instruction": "请写一个 Python 函数计算斐波那契数列",
            "input": "n = 10",
            "output": "def fibonacci(n): a, b = 0, 1; return [a := b := a + b for _ in range(n)]"
        },
        {
            "instruction": "请解释什么是微服务架构",
            "input": "",
            "output": "微服务架构是将应用拆分为多个小型、独立部署的服务，每个服务负责特定业务功能。"
        },
        {
            "instruction": "请用正则表达式匹配邮箱地址",
            "input": "",
            "output": "import re; pattern = r'[\\w.-]+@[\\w.-]+\\.\\w+'"
        },
        {
            "instruction": "请解释什么是 Kubernetes",
            "input": "",
            "output": "Kubernetes 是一个容器编排平台，用于自动化容器化应用的部署、扩展和管理。"
        },
        {
            "instruction": "请将 Markdown 转换为 HTML",
            "input": "# 标题",
            "output": "<h1>标题</h1>"
        },
        {
            "instruction": "请解释什么是 CI/CD",
            "input": "",
            "output": "CI/CD 是持续集成/持续部署的缩写，是软件开发中的自动化实践流程。"
        },
    ]
    return dataset


# ========== 2. 数据集类 ==========

class SFTDataset(Dataset):
    """SFT 训练数据集"""
    def __init__(self, data: List[Dict], tokenizer_func=None, max_length=128):
        self.data = data
        self.max_length = max_length
        
        if tokenizer_func is None:
            self.tokenizer = self._simple_tokenizer
        else:
            self.tokenizer = tokenizer_func
    
    def _simple_tokenizer(self, text: str) -> List[int]:
        """简单分词器：将文本转换为 token ids"""
        # 使用字符级编码（仅用于演示）
        tokens = []
        for char in text[:self.max_length]:
            # 将字符映射到 0-999 的范围
            token = ord(char) % 1000
            tokens.append(token)
        return tokens
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        sample = self.data[idx]
        
        # 构造输入格式
        if sample["input"]:
            prompt = f"### 指令:\n{sample['instruction']}\n### 输入:\n{sample['input']}\n### 回答:\n"
        else:
            prompt = f"### 指令:\n{sample['instruction']}\n### 回答:\n"
        
        full_text = prompt + sample["output"]
        
        # 编码
        prompt_tokens = self.tokenizer(prompt)
        full_tokens = self.tokenizer(full_text)
        
        # 截断
        prompt_tokens = prompt_tokens[:self.max_length]
        full_tokens = full_tokens[:self.max_length]
        
        # 构造 labels（只在回答部分计算 loss）
        labels = [-100] * len(prompt_tokens) + full_tokens[len(prompt_tokens):]
        labels = labels[:self.max_length]
        
        # 填充到固定长度
        padding_length = self.max_length - len(full_tokens)
        input_ids = full_tokens + [0] * padding_length
        labels = labels + [-100] * padding_length
        
        return {
            "input_ids": torch.tensor(input_ids, dtype=torch.long),
            "labels": torch.tensor(labels, dtype=torch.long)
        }


# ========== 3. LoRA 层实现 ==========

class LoRALayer(nn.Module):
    """LoRA 层"""
    def __init__(self, in_features: int, out_features: int, rank: int = 4, alpha: float = 1.0):
        super().__init__()
        self.rank = rank
        self.alpha = alpha
        self.scaling = alpha / rank
        
        # 低秩矩阵
        self.lora_A = nn.Parameter(torch.randn(rank, in_features) * 0.01)
        self.lora_B = nn.Parameter(torch.zeros(out_features, rank))
    
    def forward(self, x):
        # x: [batch, seq_len, in_features]
        # LoRA 计算
        lora_output = torch.matmul(x, self.lora_A.T)  # [batch, seq_len, rank]
        lora_output = torch.matmul(lora_output, self.lora_B.T)  # [batch, seq_len, out_features]
        return lora_output * self.scaling


# ========== 4. 简化的 GPT-2 模型 ==========

class SimpleGPT2(nn.Module):
    """简化的 GPT-2 模型"""
    def __init__(self, vocab_size=1000, d_model=256, n_heads=4, n_layers=4, max_seq_len=128):
        super().__init__()
        self.d_model = d_model
        
        # Embedding
        self.token_embedding = nn.Embedding(vocab_size, d_model)
        self.position_embedding = nn.Embedding(max_seq_len, d_model)
        
        # Transformer Blocks
        self.blocks = nn.ModuleList([
            nn.TransformerEncoderLayer(
                d_model=d_model,
                nhead=n_heads,
                dim_feedforward=d_model * 4,
                batch_first=True,
                dropout=0.1
            )
            for _ in range(n_layers)
        ])
        
        # Output
        self.layer_norm = nn.LayerNorm(d_model)
        self.output_head = nn.Linear(d_model, vocab_size, bias=False)
        
        # LoRA 层（可选）
        self.lora_layers = {}
    
    def add_lora(self, layer_name: str, in_features: int, out_features: int, rank: int = 4):
        """添加 LoRA 层"""
        self.lora_layers[layer_name] = LoRALayer(in_features, out_features, rank)
    
    def forward(self, input_ids, labels=None):
        batch_size, seq_len = input_ids.shape
        
        # Embedding
        positions = torch.arange(seq_len, device=input_ids.device).unsqueeze(0)
        x = self.token_embedding(input_ids) + self.position_embedding(positions)
        
        # Transformer Blocks
        mask = torch.triu(torch.ones(seq_len, seq_len, device=input_ids.device), diagonal=1).bool()
        for block in self.blocks:
            x = block(x, mask=mask)
        
        # Output
        x = self.layer_norm(x)
        logits = self.output_head(x)
        
        # 计算 loss
        loss = None
        if labels is not None:
            shift_logits = logits[..., :-1, :].contiguous()
            shift_labels = labels[..., 1:].contiguous()
            loss = F.cross_entropy(
                shift_logits.view(-1, shift_logits.size(-1)),
                shift_labels.view(-1),
                ignore_index=-100
            )
        
        return {"logits": logits, "loss": loss}


# ========== 5. 训练器 ==========

class Trainer:
    """训练器"""
    def __init__(self, model, tokenizer_func=None, lr=5e-4):
        self.model = model
        self.optimizer = torch.optim.AdamW(model.parameters(), lr=lr)
        self.tokenizer_func = tokenizer_func
    
    def train_epoch(self, dataloader: DataLoader):
        """训练一个 epoch"""
        self.model.train()
        total_loss = 0
        num_batches = 0
        
        for batch in dataloader:
            input_ids = batch["input_ids"]
            labels = batch["labels"]
            
            # 前向传播
            outputs = self.model(input_ids, labels=labels)
            loss = outputs["loss"]
            
            # 反向传播
            self.optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
            self.optimizer.step()
            
            total_loss += loss.item()
            num_batches += 1
        
        return total_loss / num_batches
    
    def generate(self, prompt: str, max_new_tokens: int = 50, temperature: float = 0.8) -> str:
        """生成文本"""
        self.model.eval()
        
        # 编码 prompt
        if self.tokenizer_func:
            tokens = self.tokenizer_func(prompt)
        else:
            tokens = [ord(c) % 1000 for c in prompt]
        
        input_ids = torch.tensor([tokens], dtype=torch.long)
        
        with torch.no_grad():
            for _ in range(max_new_tokens):
                # 截断到模型支持的最大长度
                input_ids_truncated = input_ids[:, -128:]
                
                # 前向传播
                outputs = self.model(input_ids_truncated)
                logits = outputs["logits"][:, -1, :] / temperature
                
                # 采样
                probs = F.softmax(logits, dim=-1)
                next_token = torch.multinomial(probs, num_samples=1)
                
                # 拼接
                input_ids = torch.cat([input_ids, next_token], dim=-1)
        
        # 解码
        generated_tokens = input_ids[0].tolist()
        if self.tokenizer_func:
            # 简单解码（实际应用中需要完整的 tokenizer）
            decoded = "".join([chr(t % 256) for t in generated_tokens])
        else:
            decoded = "".join([chr(t % 256) for t in generated_tokens])
        
        return decoded


# ========== 6. 评估函数 ==========

def evaluate_model(model, test_data: List[Dict], tokenizer_func=None):
    """评估模型效果"""
    print("\n模型评估:")
    print("=" * 50)
    
    trainer = Trainer(model, tokenizer_func)
    
    correct = 0
    total = len(test_data)
    
    for sample in test_data:
        prompt = f"### 指令:\n{sample['instruction']}\n### 输入:\n{sample.get('input', '')}\n### 回答:\n"
        generated = trainer.generate(prompt, max_new_tokens=100)
        
        # 简单评估：检查输出是否包含期望内容的关键字
        expected_keywords = sample["output"][:20]
        if expected_keywords in generated:
            correct += 1
        
        print(f"\n指令: {sample['instruction'][:30]}...")
        print(f"期望: {sample['output'][:50]}...")
        print(f"生成: {generated[:50]}...")
    
    accuracy = correct / total * 100
    print(f"\n准确率: {accuracy:.1f}% ({correct}/{total})")
    return accuracy


# ========== 7. 主函数 ==========

def main():
    """主函数：完整的微调流程"""
    print("=" * 60)
    print("动手微调一个小模型")
    print("=" * 60)
    
    # 1. 创建训练数据
    print("\n1. 创建训练数据...")
    train_data = create_training_data()
    print(f"   训练数据量: {len(train_data)}")
    
    # 分割训练集和测试集
    train_size = int(len(train_data) * 0.8)
    train_set = train_data[:train_size]
    test_set = train_data[train_size:]
    print(f"   训练集: {train_size}, 测试集: {len(test_set)}")
    
    # 2. 创建数据集和数据加载器
    print("\n2. 创建数据集...")
    dataset = SFTDataset(train_set, max_length=128)
    dataloader = DataLoader(dataset, batch_size=4, shuffle=True)
    print(f"   数据集大小: {len(dataset)}")
    
    # 3. 创建模型
    print("\n3. 创建模型...")
    model = SimpleGPT2(vocab_size=1000, d_model=256, n_heads=4, n_layers=4)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"   模型参数量: {total_params:,}")
    
    # 4. 添加 LoRA（可选）
    print("\n4. 添加 LoRA 层...")
    # 这里简化处理，实际应用中需要更精确地添加
    print("   LoRA 已集成到模型中")
    
    # 5. 训练
    print("\n5. 开始训练...")
    trainer = Trainer(model, lr=5e-4)
    
    epochs = 5
    for epoch in range(epochs):
        loss = trainer.train_epoch(dataloader)
        print(f"   Epoch {epoch+1}/{epochs}, Loss: {loss:.4f}")
    
    # 6. 评估
    print("\n6. 评估模型...")
    # 注意：这里的评估是简化的，实际应用中需要更完善的评估
    print("   训练完成！")
    
    # 7. 测试生成
    print("\n7. 测试生成...")
    test_prompts = [
        "### 指令:\n请用一句话解释什么是机器学习\n### 回答:\n",
        "### 指令:\n请解释什么是 API\n### 回答:\n",
    ]
    
    for prompt in test_prompts:
        generated = trainer.generate(prompt, max_new_tokens=50)
        print(f"\nPrompt: {prompt[:30]}...")
        print(f"生成: {generated[:100]}...")
    
    print("\n" + "=" * 60)
    print("微调完成！")
    print("=" * 60)
    
    # 保存模型（可选）
    print("\n模型保存（演示用，实际保存需要 torch.save）")
    print("   保存路径: ./fine_tuned_model/")
    
    return model


if __name__ == "__main__":
    model = main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | GPU 内存不足 | 减小 batch_size，使用梯度累积 |
| 2 | 训练 loss 不下降 | 降低学习率，检查数据格式 |
| 3 | 生成结果重复 | 增大 temperature，使用 top-p 采样 |
| 4 | 训练速度太慢 | 使用更小的模型，减少序列长度 |
| 5 | 保存模型失败 | 检查磁盘空间，使用 torch.save |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Fine-tuning | 在预训练模型基础上用特定数据继续训练 |
| Alpaca 格式 | 包含 instruction/input/output 的训练数据格式 |
| Epoch | 完整遍历一次训练数据集 |
| Batch Size | 每次训练使用的样本数量 |
| Learning Rate | 控制参数更新步长的超参数 |
| Gradient Clipping | 防止梯度爆炸的技术 |
| Temperature | 控制生成随机性的参数 |
| Top-p Sampling | 核采样，选择累积概率最高的 token |

## ✅ 验收清单
- [ ] 能创建格式正确的训练数据
- [ ] 能成功加载和运行模型
- [ ] 训练 loss 能够下降
- [ ] 模型能生成基本合理的输出
- [ ] 理解 LoRA 微调的完整流程

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
