# 📅 Week 13 Day 1：方向A - 从零搭建 LLM

## 🧭 今日方向
> 深入学习如何从零搭建一个小型语言模型，理解 Transformer 架构的实现细节。

## 🎯 生活比喻
> 从零搭建 LLM 就像从零开始建一栋大楼。你不是简单地买一套现成的房子（使用预训练模型），而是要亲手设计图纸（架构设计）、打地基（Embedding）、砌墙（Attention 层）、封顶（输出层）。虽然你建的可能是小平房（小模型），但过程能让你真正理解摩天大楼是怎么建成的。

## 📋 今日三件事
1. 实现一个完整的 Transformer 块
2. 搭建一个可训练的小型语言模型
3. 在小数据集上训练并验证

## 🗺️ 手把手路线

### Step 1：Transformer 核心组件
- 做什么: 实现 Multi-Head Attention、Feed-Forward 网络、Layer Norm
- 为什么: 这是 LLM 的核心组件
- 成功标志: 能实现完整的 Transformer Block

### Step 2：模型组装
- 做什么: 组装完整的语言模型
- 为什么: 理解各组件如何协同工作
- 成功标志: 能搭建完整的模型

### Step 3：训练验证
- 做什么: 在小数据集上训练并验证
- 为什么: 验证模型能学习
- 成功标志: 训练 loss 下降

## 💻 代码区

```python
"""
从零搭建 LLM：完整实现 Transformer
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
import math
from typing import Optional

# ========== 1. Multi-Head Attention ==========

class MultiHeadAttention(nn.Module):
    """多头注意力机制"""
    
    def __init__(self, d_model: int, n_heads: int, dropout: float = 0.1):
        super().__init__()
        assert d_model % n_heads == 0
        
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        
        self.dropout = nn.Dropout(dropout)
    
    def forward(
        self,
        query: torch.Tensor,
        key: torch.Tensor,
        value: torch.Tensor,
        mask: Optional[torch.Tensor] = None
    ) -> torch.Tensor:
        batch_size = query.size(0)
        
        # 线性变换并分头
        Q = self.W_q(query).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        K = self.W_k(key).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        V = self.W_v(value).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        
        # 注意力分数
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        
        # 应用 mask
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        
        # Softmax
        attn_weights = F.softmax(scores, dim=-1)
        attn_weights = self.dropout(attn_weights)
        
        # 加权求和
        context = torch.matmul(attn_weights, V)
        
        # 合并多头
        context = context.transpose(1, 2).contiguous().view(batch_size, -1, self.d_model)
        
        return self.W_o(context)


# ========== 2. Feed-Forward Network ==========

class FeedForward(nn.Module):
    """前馈神经网络"""
    
    def __init__(self, d_model: int, d_ff: int, dropout: float = 0.1):
        super().__init__()
        self.linear1 = nn.Linear(d_model, d_ff)
        self.linear2 = nn.Linear(d_ff, d_model)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.linear2(self.dropout(F.relu(self.linear1(x))))


# ========== 3. Transformer Block ==========

class TransformerBlock(nn.Module):
    """Transformer 块"""
    
    def __init__(self, d_model: int, n_heads: int, d_ff: int, dropout: float = 0.1):
        super().__init__()
        self.attention = MultiHeadAttention(d_model, n_heads, dropout)
        self.norm1 = nn.LayerNorm(d_model)
        self.ff = FeedForward(d_model, d_ff, dropout)
        self.norm2 = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)
    
    def forward(
        self,
        x: torch.Tensor,
        mask: Optional[torch.Tensor] = None
    ) -> torch.Tensor:
        # 自注意力 + 残差连接
        attn_output = self.attention(x, x, x, mask)
        x = self.norm1(x + self.dropout(attn_output))
        
        # 前馈网络 + 残差连接
        ff_output = self.ff(x)
        x = self.norm2(x + self.dropout(ff_output))
        
        return x


# ========== 4. 完整的语言模型 ==========

class MiniLLM(nn.Module):
    """迷你语言模型"""
    
    def __init__(
        self,
        vocab_size: int = 1000,
        d_model: int = 128,
        n_heads: int = 4,
        n_layers: int = 4,
        d_ff: int = 512,
        max_seq_len: int = 256,
        dropout: float = 0.1
    ):
        super().__init__()
        
        # Token Embedding
        self.token_embedding = nn.Embedding(vocab_size, d_model)
        
        # Position Embedding
        self.position_embedding = nn.Embedding(max_seq_len, d_model)
        
        # Transformer Blocks
        self.blocks = nn.ModuleList([
            TransformerBlock(d_model, n_heads, d_ff, dropout)
            for _ in range(n_layers)
        ])
        
        # 输出层
        self.norm = nn.LayerNorm(d_model)
        self.output_head = nn.Linear(d_model, vocab_size)
        
        # Dropout
        self.dropout = nn.Dropout(dropout)
        
        # 初始化权重
        self._init_weights()
    
    def _init_weights(self):
        for p in self.parameters():
            if p.dim() > 1:
                nn.init.xavier_uniform_(p)
    
    def forward(
        self,
        input_ids: torch.Tensor,
        targets: Optional[torch.Tensor] = None
    ) -> dict:
        batch_size, seq_len = input_ids.shape
        
        # Embedding
        positions = torch.arange(seq_len, device=input_ids.device).unsqueeze(0)
        x = self.dropout(
            self.token_embedding(input_ids) + 
            self.position_embedding(positions)
        )
        
        # 因果掩码
        mask = torch.triu(torch.ones(seq_len, seq_len, device=input_ids.device), diagonal=1).bool()
        mask = ~mask  # 反转，让可访问的位置为 True
        
        # Transformer Blocks
        for block in self.blocks:
            x = block(x, mask)
        
        # 输出
        x = self.norm(x)
        logits = self.output_head(x)
        
        # 计算 loss
        loss = None
        if targets is not None:
            loss = F.cross_entropy(
                logits.view(-1, logits.size(-1)),
                targets.view(-1),
                ignore_index=-100
            )
        
        return {"logits": logits, "loss": loss}
    
    def count_parameters(self) -> int:
        return sum(p.numel() for p in self.parameters() if p.requires_grad)


# ========== 5. 训练器 ==========

class Trainer:
    """训练器"""
    
    def __init__(self, model: MiniLLM, lr: float = 3e-4):
        self.model = model
        self.optimizer = torch.optim.AdamW(model.parameters(), lr=lr)
        self.device = next(model.parameters()).device
    
    def train_epoch(self, train_data: torch.Tensor, batch_size: int = 32) -> float:
        self.model.train()
        total_loss = 0
        n_batches = 0
        
        for i in range(0, len(train_data) - 1, batch_size):
            batch = train_data[i:i+batch_size].to(self.device)
            
            # 输入和目标
            inputs = batch[:, :-1]
            targets = batch[:, 1:]
            
            # 前向传播
            outputs = self.model(inputs, targets)
            loss = outputs["loss"]
            
            # 反向传播
            self.optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
            self.optimizer.step()
            
            total_loss += loss.item()
            n_batches += 1
        
        return total_loss / max(n_batches, 1)
    
    def generate(
        self,
        prompt_ids: torch.Tensor,
        max_new_tokens: int = 50,
        temperature: float = 0.8,
        top_k: int = 50
    ) -> torch.Tensor:
        self.model.eval()
        
        for _ in range(max_new_tokens):
            # 截断
            prompt_cond = prompt_ids[:, -256:]
            
            # 前向传播
            with torch.no_grad():
                outputs = self.model(prompt_cond)
                logits = outputs["logits"][:, -1, :] / temperature
            
            # Top-k 采样
            if top_k > 0:
                values, _ = torch.topk(logits, min(top_k, logits.size(-1)))
                logits[logits < values[:, [-1]]] = -float('inf')
            
            probs = F.softmax(logits, dim=-1)
            next_token = torch.multinomial(probs, num_samples=1)
            
            prompt_ids = torch.cat([prompt_ids, next_token], dim=1)
        
        return prompt_ids


# ========== 6. 主函数 ==========

def main():
    print("=" * 60)
    print("从零搭建 LLM")
    print("=" * 60)
    
    # 1. 创建模型
    print("\n1. 创建模型...")
    model = MiniLLM(
        vocab_size=1000,
        d_model=128,
        n_heads=4,
        n_layers=4,
        d_ff=512,
        max_seq_len=256
    )
    print(f"   模型参数量: {model.count_parameters():,}")
    
    # 2. 创建训练数据
    print("\n2. 创建训练数据...")
    train_data = torch.randint(0, 1000, (32, 128))  # 32 个样本，长度 128
    print(f"   数据形状: {train_data.shape}")
    
    # 3. 训练
    print("\n3. 训练...")
    trainer = Trainer(model, lr=3e-4)
    
    for epoch in range(5):
        loss = trainer.train_epoch(train_data, batch_size=8)
        print(f"   Epoch {epoch+1}/5, Loss: {loss:.4f}")
    
    # 4. 生成
    print("\n4. 文本生成...")
    prompt = torch.randint(0, 1000, (1, 10))
    generated = trainer.generate(prompt, max_new_tokens=20)
    print(f"   输入长度: {prompt.size(1)}")
    print(f"   生成长度: {generated.size(1)}")
    
    # 5. 模型结构
    print("\n5. 模型结构:")
    print(model)
    
    print("\n" + "=" * 60)
    print("从零搭建 LLM 完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 模型不收敛 | 降低学习率，检查数据格式 |
| 2 | GPU 内存不足 | 减小 d_model 或 batch_size |
| 3 | 生成结果重复 | 增大 temperature，使用 top-k 采样 |
| 4 | 训练太慢 | 使用更小的模型，减少层数 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Multi-Head Attention | 多头注意力，捕获不同维度的关系 |
| Position Encoding | 位置编码，让模型感知序列位置 |
| Residual Connection | 残差连接，缓解梯度消失 |
| Layer Normalization | 层归一化，稳定训练 |
| Causal Mask | 因果掩码，防止看到未来信息 |

## ✅ 验收清单
- [ ] 能实现 Multi-Head Attention
- [ ] 能搭建完整的 Transformer Block
- [ ] 能训练模型并观察 loss 下降
- [ ] 能理解各组件的作用

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
