# Day 3: 大模型 API 最小调用

> 今天的目标：学会调用大模型 API（OpenAI、Anthropic、国内替代方案），掌握消息格式、流式响应、错误处理。这是构建 AI Agent 的核心技能。

---

## 1. 什么是 API Key？

### 1.1 用一个生活中的类比

API Key 就像你的**银行卡密码**：

- 你在银行（API 服务商）注册了一个账号
- 银行给你一张卡和密码（API Key）
- 你用卡和密码去 ATM 机（API 端点）取钱（调用模型）
- ATM 会验证你的密码是否正确，然后给你服务
- 如果密码错了，ATM 拒绝服务
- 如果余额不足，ATM 也会拒绝

**关键规则**：
- API Key 不能给别人看（就像密码不能告诉别人）
- API Key 不能写在代码里（万一代码上传到 GitHub，别人就能用了）
- API Key 要存在 `.env` 文件里（Day 6 会详细讲）

### 1.2 API Key 的格式

不同的服务商，API Key 长得不一样：

```
OpenAI:    sk-proj-abc123def456...     (很长，以 sk- 开头)
Anthropic: sk-ant-api03-abc123...      (以 sk-ant- 开头)
DeepSeek:  sk-abc123def456...          (以 sk- 开头)
```

---

## 2. OpenAI API 调用

### 2.1 注册并获取 API Key

1. 打开 https://platform.openai.com/
2. 注册账号（需要信用卡，最低充 $5）
3. 进入 API Keys 页面：https://platform.openai.com/api-keys
4. 点击 "Create new secret key"
5. 复制 Key（只显示一次！）

### 2.2 安装 OpenAI SDK

```bash
# 确保虚拟环境已激活
pip install openai

# 验证安装
pip show openai
```

### 2.3 设置环境变量

创建 `.env` 文件（在项目根目录）：

```bash
# .env 文件内容
OPENAI_API_KEY=sk-your-actual-api-key-here
```

> **安全提醒**：`.env` 文件要放在 `.gitignore` 里，绝对不能提交到 Git。

### 2.4 第一次调用 OpenAI API

创建文件 `examples/day3_openai.py`：

```python
"""
Day 3 示例：OpenAI API 最小调用
"""

import os
from openai import OpenAI
from dotenv import load_dotenv

# 加载 .env 文件中的环境变量
load_dotenv()

# 创建客户端
# 方式 1：从环境变量自动读取（推荐）
client = OpenAI()
# 方式 2：手动指定
# client = OpenAI(api_key="sk-xxx", base_url="https://api.openai.com/v1")

# ============================================
# 示例 1：最简单的聊天补全
# ============================================

print("=== 示例 1：最简单的聊天 ===")

response = client.chat.completions.create(
    model="gpt-4o-mini",                    # 使用的模型
    messages=[                               # 消息列表
        {"role": "user", "content": "用一句话介绍你自己"}
    ],
    temperature=0.7,                         # 随机性（0=确定，1=随机）
    max_tokens=100                           # 最多生成多少个 token
)

# 获取回复
reply = response.choices[0].message.content
print(f"AI 回复: {reply}")

# 查看使用情况
print(f"Token 使用: {response.usage}")
# 输出类似: CompletionUsage(prompt_tokens=12, completion_tokens=25, total_tokens=37)
```

### 2.5 理解消息格式（messages）

大模型 API 使用**消息列表**来对话。每条消息有两个字段：

```python
messages = [
    {"role": "system", "content": "你是..."},    # 系统消息（设定角色）
    {"role": "user", "content": "你好"},          # 用户消息
    {"role": "assistant", "content": "你好！"},   # AI 回复
    {"role": "user", "content": "再见"}           # 用户又说了一句
]
```

| 角色 | 谁说的 | 作用 |
|------|--------|------|
| `system` | 开发者 | 设定 AI 的角色、行为、限制 |
| `user` | 用户 | 用户说的话 |
| `assistant` | AI | AI 的回复 |

### 2.6 系统消息（System Message）

系统消息就像给 AI 一个"人设"：

```python
# ============================================
# 示例 2：使用系统消息
# ============================================

print("\n=== 示例 2：系统消息 ===")

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "system",
            "content": "你是一位专业的 Python 编程老师，用简单易懂的语言解释概念，给出代码示例。"
        },
        {
            "role": "user",
            "content": "什么是列表推导式？"
        }
    ],
    temperature=0.7,
    max_tokens=500
)

reply = response.choices[0].message.content
print(f"AI 回复:\n{reply}")
```

### 2.7 多轮对话

多轮对话的关键：**每次请求都要把之前的对话历史一起发送**。

```python
# ============================================
# 示例 3：多轮对话
# ============================================

print("\n=== 示例 3：多轮对话 ===")

# 初始化对话历史
messages = [
    {"role": "system", "content": "你是一个有帮助的助手。"}
]

def chat(user_message: str) -> str:
    """发送消息并获取回复"""
    # 添加用户消息到历史
    messages.append({"role": "user", "content": user_message})

    # 调用 API
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.7
    )

    # 获取回复
    assistant_reply = response.choices[0].message.content

    # 添加 AI 回复到历史
    messages.append({"role": "assistant", "content": assistant_reply})

    return assistant_reply

# 第一轮对话
reply1 = chat("你好，我叫小明")
print(f"小明: 你好，我叫小明")
print(f"AI: {reply1}\n")

# 第二轮对话（AI 应该记得我叫小明）
reply2 = chat("你还记得我叫什么吗？")
print(f"小明: 你还记得我叫什么吗？")
print(f"AI: {reply2}\n")

# 第三轮对话
reply3 = chat("帮我写一个 Python 函数，计算斐波那契数列")
print(f"小明: 帮我写一个 Python 函数，计算斐波那契数列")
print(f"AI: {reply3}")
```

### 2.8 流式响应（Streaming）

流式响应让 AI **边生成边返回**，就像 ChatGPT 的打字效果：

```python
# ============================================
# 示例 4：流式响应
# ============================================

print("\n=== 示例 4：流式响应 ===")

# 创建流式请求
stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "用 Python 写一个快速排序算法，加注释"}
    ],
    temperature=0.7,
    stream=True  # 关键：开启流式
)

# 逐块读取响应
print("AI: ", end="")
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
print()  # 换行
```

### 2.9 错误处理

```python
# ============================================
# 示例 5：错误处理
# ============================================

print("\n=== 示例 5：错误处理 ===")

from openai import (
    APIConnectionError,
    RateLimitError,
    APIStatusError,
    AuthenticationError
)

try:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "你好"}],
        max_tokens=100
    )
    print(f"成功: {response.choices[0].message.content}")

except AuthenticationError as e:
    print(f"认证错误（API Key 无效）: {e}")

except RateLimitError as e:
    print(f"请求过于频繁: {e}")

except APIConnectionError as e:
    print(f"网络连接错误: {e}")

except APIStatusError as e:
    print(f"API 错误 (状态码 {e.status_code}): {e}")

except Exception as e:
    print(f"未知错误: {type(e).__name__}: {e}")
```

### 2.10 费用估算

OpenAI 的价格（2024 年参考价）：

| 模型 | 输入价格 | 输出价格 |
|------|---------|---------|
| gpt-4o-mini | $0.15 / 1M tokens | $0.60 / 1M tokens |
| gpt-4o | $2.50 / 1M tokens | $10.00 / 1M tokens |
| gpt-4-turbo | $10.00 / 1M tokens | $30.00 / 1M tokens |

**换算**：
- 1 个英文单词约 1.3 个 token
- 1 个中文字约 2 个 token
- 一次简单对话约 100-500 tokens
- gpt-4o-mini 一次对话约 $0.0001 - $0.001（不到一分钱人民币）

---

## 3. Anthropic API 调用

### 3.1 注册并获取 API Key

1. 打开 https://console.anthropic.com/
2. 注册账号（需要信用卡）
3. 进入 API Keys 页面
4. 点击 "Create Key"

### 3.2 安装 Anthropic SDK

```bash
pip install anthropic
```

### 3.3 设置环境变量

在 `.env` 文件中添加：

```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

### 3.4 第一次调用 Claude API

创建文件 `examples/day3_anthropic.py`：

```python
"""
Day 3 示例：Anthropic (Claude) API 调用
"""

import os
import anthropic
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 创建客户端
client = anthropic.Anthropic()  # 从 ANTHROPIC_API_KEY 环境变量读取

# ============================================
# 示例 1：基础调用
# ============================================

print("=== 示例 1：基础 Claude 调用 ===")

response = client.messages.create(
    model="claude-sonnet-4-20250514",       # 使用的模型
    max_tokens=100,                          # 最多生成多少 token
    messages=[                               # 消息列表（注意：没有 system 角色在这里）
        {"role": "user", "content": "用一句话介绍你自己"}
    ]
)

# 获取回复
reply = response.content[0].text
print(f"Claude 回复: {reply}")
```

### 3.5 理解 Claude 和 OpenAI 的 API 差异

| 特性 | OpenAI | Anthropic |
|------|--------|-----------|
| 消息格式 | `messages=[{"role": "user", "content": "..."}]` | 相同 |
| 系统消息 | 在 messages 里用 `role: "system"` | 用单独的 `system` 参数 |
| 响应格式 | `response.choices[0].message.content` | `response.content[0].text` |
| 流式响应 | `stream=True` | `stream=True` |
| SDK 包名 | `openai` | `anthropic` |

### 3.6 Claude 的系统消息

```python
# ============================================
# 示例 2：带系统消息的 Claude 调用
# ============================================

print("\n=== 示例 2：系统消息 ===")

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=500,
    system="你是一位专业的 Python 编程老师，用简单易懂的语言解释概念。",  # 单独的 system 参数！
    messages=[
        {"role": "user", "content": "解释一下 Python 的装饰器"}
    ]
)

reply = response.content[0].text
print(f"Claude 回复:\n{reply}")
```

### 3.7 Claude 多轮对话

```python
# ============================================
# 示例 3：Claude 多轮对话
# ============================================

print("\n=== 示例 3：Claude 多轮对话 ===")

messages = []  # 注意：Claude 的 messages 不包含 system

def claude_chat(user_message: str, system: str = "你是一个有帮助的助手。") -> str:
    """Claude 多轮对话"""
    messages.append({"role": "user", "content": user_message})

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system=system,
        messages=messages
    )

    assistant_reply = response.content[0].text
    messages.append({"role": "assistant", "content": assistant_reply})

    return assistant_reply

# 对话
reply1 = claude_chat("你好，我想学习 Python")
print(f"用户: 你好，我想学习 Python")
print(f"Claude: {reply1[:200]}...\n")

reply2 = claude_chat("推荐一个入门项目")
print(f"用户: 推荐一个入门项目")
print(f"Claude: {reply2[:200]}...")
```

### 3.8 Claude 流式响应

```python
# ============================================
# 示例 4：Claude 流式响应
# ============================================

print("\n=== 示例 4：Claude 流式响应 ===")

with client.messages.stream(
    model="claude-sonnet-4-20250514",
    max_tokens=500,
    messages=[
        {"role": "user", "content": "用 Python 写一个简单的 Web 服务器"}
    ]
) as stream:
    print("Claude: ", end="")
    for text in stream.text_stream:
        print(text, end="", flush=True)
    print()
```

---

## 4. 国内模型替代方案

如果你无法访问 OpenAI 或 Anthropic 的 API，可以使用以下国内模型。它们同样强大，且注册和使用更加方便。

### 4.1 主要选项

| 模型提供商 | 地址 | 特点 |
|-----------|------|------|
| **DeepSeek** | https://platform.deepseek.com/ | 兼容 OpenAI SDK，性价比极高 |
| **通义千问** | https://dashscope.aliyun.com/ | 阿里云提供，生态完善 |
| **Moonshot (月之暗面)** | https://platform.moonshot.cn/ | Kimi 背后的公司，长文本能力强 |
| **智谱** | https://open.bigmodel.cn/ | GLM 系列，清华系背景 |
| **Ollama 本地部署** | https://ollama.com/ | 完全免费，无需联网 |

### 4.2 DeepSeek API（推荐国内用户）

DeepSeek 的 API 与 OpenAI **完全兼容**，只需修改 `base_url` 和 `api_key`：

```python
"""
Day 3 示例：DeepSeek API（兼容 OpenAI SDK）
"""

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# 创建 DeepSeek 客户端
client = OpenAI(
    api_key="your-deepseek-key",                    # 你的 DeepSeek API Key
    base_url="https://api.deepseek.com"             # DeepSeek 的 API 地址
)

# 调用方式和 OpenAI 完全一样！
response = client.chat.completions.create(
    model="deepseek-chat",                          # DeepSeek 的模型名
    messages=[
        {"role": "system", "content": "你是一个有帮助的助手。"},
        {"role": "user", "content": "什么是人工智能？"}
    ],
    temperature=0.7,
    max_tokens=500
)

print(response.choices[0].message.content)
```

> **重要**：如果你使用 DeepSeek，安装 `openai` 包即可，不需要额外安装其他包。

### 4.3 Ollama 本地部署（完全免费）

如果你想完全免费地使用大模型，可以在本地运行：

```bash
# 1. 安装 Ollama（https://ollama.com/ 下载安装包）

# 2. 下载并运行模型
ollama run qwen2.5:7b       # 通义千问 7B
ollama run deepseek-r1:8b   # DeepSeek 8B
ollama run glm4:9b          # 智谱 GLM4 9B
```

```python
# Ollama 本地模型调用（兼容 OpenAI SDK）
from openai import OpenAI

client = OpenAI(
    api_key="ollama",                          # Ollama 不需要真实密钥
    base_url="http://localhost:11434/v1"       # Ollama 的本地地址
)

response = client.chat.completions.create(
    model="qwen2.5:7b",                       # 使用你下载的模型
    messages=[
        {"role": "user", "content": "用Python写一个快速排序算法"}
    ],
    temperature=0.7
)

print(response.choices[0].message.content)
```

---

## 5. 统一封装：兼容多提供商的 LLM 客户端

在实际项目中，我们会封装一个统一的客户端，支持多个提供商：

```python
"""
统一的 LLM 客户端封装
文件：src/agent_factory/llm.py
"""

import os
from typing import List, Dict, Optional, Generator
from dataclasses import dataclass
from enum import Enum

class LLMProvider(str, Enum):
    """LLM 提供商"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    DEEPSEEK = "deepseek"

@dataclass
class LLMMessage:
    """消息格式"""
    role: str       # "system", "user", "assistant"
    content: str

@dataclass
class LLMResponse:
    """LLM 响应"""
    content: str                    # 回复内容
    model: str                      # 使用的模型
    usage: Dict[str, int]           # Token 使用情况
    provider: LLMProvider           # 提供商

class LLMClient:
    """统一的 LLM 客户端"""

    def __init__(self, provider: LLMProvider = LLMProvider.OPENAI):
        self.provider = provider
        self._init_client()

    def _init_client(self):
        """初始化客户端"""
        if self.provider == LLMProvider.OPENAI:
            from openai import OpenAI
            self.client = OpenAI()
            self.default_model = "gpt-4o-mini"

        elif self.provider == LLMProvider.ANTHROPIC:
            import anthropic
            self.client = anthropic.Anthropic()
            self.default_model = "claude-sonnet-4-20250514"

        elif self.provider == LLMProvider.DEEPSEEK:
            from openai import OpenAI
            self.client = OpenAI(
                api_key=os.getenv("DEEPSEEK_API_KEY"),
                base_url="https://api.deepseek.com"
            )
            self.default_model = "deepseek-chat"

    def chat(
        self,
        messages: List[LLMMessage],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> LLMResponse:
        """发送聊天请求"""
        model = model or self.default_model

        if self.provider in (LLMProvider.OPENAI, LLMProvider.DEEPSEEK):
            return self._chat_openai(messages, model, temperature, max_tokens)
        elif self.provider == LLMProvider.ANTHROPIC:
            return self._chat_anthropic(messages, model, temperature, max_tokens)

    def _chat_openai(self, messages, model, temperature, max_tokens):
        """OpenAI/DeepSeek 调用"""
        formatted = [{"role": m.role, "content": m.content} for m in messages]

        response = self.client.chat.completions.create(
            model=model,
            messages=formatted,
            temperature=temperature,
            max_tokens=max_tokens
        )

        return LLMResponse(
            content=response.choices[0].message.content,
            model=model,
            usage={
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            },
            provider=self.provider
        )

    def _chat_anthropic(self, messages, model, temperature, max_tokens):
        """Anthropic 调用"""
        # 提取 system 消息
        system_msg = ""
        formatted = []
        for m in messages:
            if m.role == "system":
                system_msg = m.content
            else:
                formatted.append({"role": m.role, "content": m.content})

        response = self.client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_msg,
            messages=formatted
        )

        return LLMResponse(
            content=response.content[0].text,
            model=model,
            usage={
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            },
            provider=self.provider
        )


# 使用示例
if __name__ == "__main__":
    # 选择提供商
    client = LLMClient(provider=LLMProvider.OPENAI)
    # client = LLMClient(provider=LLMProvider.DEEPSEEK)
    # client = LLMClient(provider=LLMProvider.ANTHROPIC)

    # 发送消息
    response = client.chat(
        messages=[
            LLMMessage(role="system", content="你是一个有帮助的助手。"),
            LLMMessage(role="user", content="用一句话解释量子计算")
        ],
        temperature=0.7,
        max_tokens=200
    )

    print(f"回复: {response.content}")
    print(f"模型: {response.model}")
    print(f"Token 使用: {response.usage}")
```

---

## 6. 常见错误和解决方案

### 错误 1：AuthenticationError - API Key 无效

```python
# OpenAI 错误
openai.AuthenticationError: Incorrect API key provided

# 原因：
# 1. API Key 复制错了
# 2. API Key 过期了
# 3. 环境变量没加载

# 解决：
# 1. 检查 .env 文件中的 Key 是否正确
# 2. 确认 load_dotenv() 被调用了
# 3. 打印 os.getenv("OPENAI_API_KEY") 看看值是否为空
```

### 错误 2：RateLimitError - 请求太频繁

```python
# 错误信息
openai.RateLimitError: Rate limit reached

# 解决：
# 1. 等待几秒后重试
# 2. 减少请求频率
# 3. 使用流式响应（减少单次请求的 token 数）
```

### 错误 3：模型不存在

```python
# 错误信息
openai.NotFoundError: The model 'gpt-5' does not exist

# 解决：
# 检查模型名称拼写
# OpenAI 模型: gpt-4o, gpt-4o-mini, gpt-4-turbo
# Anthropic 模型: claude-sonnet-4-20250514, claude-opus-4-20250514
```

### 错误 4：Token 超限

```python
# 错误信息
openai.BadRequestError: This model's maximum context length is 128000 tokens

# 解决：
# 1. 减少输入长度（缩短 messages）
# 2. 减少 max_tokens
# 3. 使用支持更长上下文的模型
```

---

## 7. 今日小结

| 知识点 | 要点 |
|--------|------|
| API Key | 类似银行卡密码，不能泄露 |
| OpenAI SDK | `client.chat.completions.create()` |
| Anthropic SDK | `client.messages.create()` |
| 消息格式 | system 设定角色，user 用户说话，assistant AI 回复 |
| 流式响应 | `stream=True`，边生成边返回 |
| 错误处理 | 捕获 AuthenticationError、RateLimitError 等 |
| 国内替代 | DeepSeek 兼容 OpenAI SDK，Ollama 完全免费 |

---

## 8. 课后练习

1. 安装 `openai` 和 `anthropic` 包，配置 API Key
2. 使用 OpenAI API 发送一条消息，打印回复
3. 使用 Claude API 发送一条消息，对比两者的响应
4. 如果你在国内，尝试用 DeepSeek API 发送消息
5. 尝试使用流式响应，观察输出效果

---

> **明天预告**：Day 4 我们将学习 Python 异步编程（asyncio）——这是让 Agent 同时处理多个任务的关键技术。
