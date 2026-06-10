# 📅 Week 1 Day 3：大模型 API 最小调用（OpenAI/Anthropic）

> 💡 提示：如果你还不了解 Transformer 和 LLM 的工作原理，不用担心。Week 3 会详细讲解这些概念。现在先学会调用 API，后面再深入理解原理。

## 🧭 今日方向
> 今天我们将学习如何调用 OpenAI 和 Anthropic 的大模型 API。这是构建 AI Agent 的核心技能。

## 🎯 生活比喻
> 大模型 API 就像一个超级智能的助手，你只需要用自然语言告诉它想要什么，它就会返回结果。今天我们要学会如何与这位助手高效沟通。

## 📋 今日三件事
1. 了解 OpenAI API 的基本用法
2. 学习 Anthropic API 的基本用法
3. 实践两种 API 的调用和对比

## 🗺️ 手把手路线

### Step 1: OpenAI API 调用
- **做什么**: 使用 openai 库调用 GPT 模型
- **为什么**: OpenAI 是目前最流行的大模型提供商之一
- **成功标志**: 能成功调用 API 并获得响应

### Step 2: Anthropic API 调用
- **做什么**: 使用 anthropic 库调用 Claude 模型
- **为什么**: Claude 是 Anthropic 的强大模型，适合各种任务
- **成功标志**: 能成功调用 Claude API

### Step 3: API 对比和最佳实践
- **做什么**: 对比两种 API 的特点，学习使用最佳实践
- **为什么**: 了解不同 API 的优劣，选择合适的工具
- **成功标志**: 能根据需求选择合适的 API

## 💻 代码区

```python
# OpenAI API 调用示例（新版 SDK，适用于 openai >= 1.0）

from openai import OpenAI
from typing import Optional

# 创建客户端（实际使用时应从环境变量获取 API 密钥）
# client = OpenAI(api_key="your-openai-api-key-here")
client = OpenAI()  # 从 OPENAI_API_KEY 环境变量自动读取

def basic_chat_completion(
    prompt: str,
    model: str = "gpt-3.5-turbo",
    max_tokens: int = 100
) -> str:
    """
    基础聊天补全
    
    Args:
        prompt: 用户输入
        model: 模型名称
        max_tokens: 最大生成 token 数
        
    Returns:
        模型响应
    """
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"OpenAI API 错误: {e}")
        return ""

def chat_with_system_message(
    user_message: str,
    system_message: str = "你是一个有帮助的助手。",
    model: str = "gpt-3.5-turbo"
) -> str:
    """
    带系统消息的聊天补全
    
    Args:
        user_message: 用户消息
        system_message: 系统消息（设定角色）
        model: 模型名称
        
    Returns:
        模型响应
    """
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"OpenAI API 错误: {e}")
        return ""

def multi_turn_conversation():
    """多轮对话示例"""
    messages = [
        {"role": "system", "content": "你是一个Python编程助手。"}
    ]
    
    # 第一轮对话
    user_input = "什么是列表推导式？"
    messages.append({"role": "user", "content": user_input})
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.7
    )
    
    assistant_response = response.choices[0].message.content.strip()
    messages.append({"role": "assistant", "content": assistant_response})
    
    print(f"用户: {user_input}")
    print(f"助手: {assistant_response}")
    
    # 第二轮对话
    user_input = "能给我一个例子吗？"
    messages.append({"role": "user", "content": user_input})
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.7
    )
    
    assistant_response = response.choices[0].message.content.strip()
    messages.append({"role": "assistant", "content": assistant_response})
    
    print(f"\n用户: {user_input}")
    print(f"助手: {assistant_response}")

# 测试函数（需要真实 API 密钥才能运行）
if __name__ == "__main__":
    print("=== OpenAI API 示例 ===")
    print("注意: 需要设置 OPENAI_API_KEY 环境变量")
    
    # 示例调用（注释掉，需要真实 API 密钥）
    # print(basic_chat_completion("你好，请介绍一下你自己"))
    # print(chat_with_system_message("用Python写一个快速排序", "你是一个Python专家"))
```

```python
# Anthropic API 调用示例

import anthropic
from typing import Optional, List

# 设置 API 密钥（实际使用时应从环境变量获取）
# client = anthropic.Anthropic(api_key="your-anthropic-api-key-here")

def basic_claude_call(
    prompt: str,
    model: str = "claude-3-sonnet-20240229",
    max_tokens: int = 100
) -> str:
    """
    基础 Claude 调用
    
    Args:
        prompt: 用户输入
        model: 模型名称
        max_tokens: 最大生成 token 数
        
    Returns:
        Claude 响应
    """
    try:
        client = anthropic.Anthropic()  # 从环境变量读取 API 密钥
        
        response = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.content[0].text
    
    except anthropic.APIError as e:
        print(f"Anthropic API 错误: {e}")
        return ""

def claude_with_system_message(
    user_message: str,
    system_message: str = "你是一个有帮助的助手。",
    model: str = "claude-3-sonnet-20240229"
) -> str:
    """
    带系统消息的 Claude 调用
    
    Args:
        user_message: 用户消息
        system_message: 系统消息
        model: 模型名称
        
    Returns:
        Claude 响应
    """
    try:
        client = anthropic.Anthropic()
        
        response = client.messages.create(
            model=model,
            max_tokens=1000,
            system=system_message,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )
        
        return response.content[0].text
    
    except anthropic.APIError as e:
        print(f"Anthropic API 错误: {e}")
        return ""

def claude_multi_turn():
    """Claude 多轮对话示例"""
    client = anthropic.Anthropic()
    
    messages = []
    
    # 第一轮
    user_input = "解释一下什么是机器学习"
    messages.append({"role": "user", "content": user_input})
    
    response = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=1000,
        system="你是一个AI专家，用简单的语言解释复杂概念。",
        messages=messages
    )
    
    assistant_response = response.content[0].text
    messages.append({"role": "assistant", "content": assistant_response})
    
    print(f"用户: {user_input}")
    print(f"Claude: {assistant_response[:200]}...")
    
    # 第二轮
    user_input = "它和深度学习有什么区别？"
    messages.append({"role": "user", "content": user_input})
    
    response = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=1000,
        system="你是一个AI专家，用简单的语言解释复杂概念。",
        messages=messages
    )
    
    assistant_response = response.content[0].text
    messages.append({"role": "assistant", "content": assistant_response})
    
    print(f"\n用户: {user_input}")
    print(f"Claude: {assistant_response[:200]}...")

# API 对比示例
def api_comparison():
    """OpenAI vs Anthropic API 对比"""
    comparison = """
    API 对比:
    
    1. 消息格式:
       - OpenAI: messages = [{"role": "user", "content": "..."}]
       - Anthropic: messages = [{"role": "user", "content": "..."}]
    
    2. 系统消息:
       - OpenAI: 在 messages 中使用 role: "system"
       - Anthropic: 使用单独的 system 参数
    
    3. 响应格式:
       - OpenAI: response.choices[0].message.content
       - Anthropic: response.content[0].text
    
    4. 流式响应:
       - OpenAI: stream=True, 返回生成器
       - Anthropic: stream=True, 返回事件流
    
    5. 模型名称:
       - OpenAI: gpt-3.5-turbo, gpt-4, gpt-4-turbo
       - Anthropic: claude-3-sonnet, claude-3-opus
    """
    print(comparison)

if __name__ == "__main__":
    print("=== Anthropic API 示例 ===")
    print("注意: 需要设置 ANTHROPIC_API_KEY 环境变量")
    
    # 示例调用（注释掉，需要真实 API 密钥）
    # print(basic_claude_call("用一句话解释量子计算"))
    # print(claude_with_system_message("写一首关于春天的诗", "你是一个诗人"))
    
    api_comparison()
```

```python
# 环境变量管理 - 最佳实践

import os
from pathlib import Path
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

def get_api_keys():
    """从环境变量获取 API 密钥"""
    openai_key = os.getenv("OPENAI_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    
    if not openai_key:
        print("⚠️ 警告: 未设置 OPENAI_API_KEY 环境变量")
    if not anthropic_key:
        print("⚠️ 警告: 未设置 ANTHROPIC_API_KEY 环境变量")
    
    return {
        "openai": openai_key,
        "anthropic": anthropic_key
    }

def create_env_file():
    """创建 .env 文件模板"""
    env_content = """# API 密钥配置
# 请将以下内容复制到 .env 文件中，并填入你的真实密钥

# OpenAI API 密钥
# 获取地址: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API 密钥
# 获取地址: https://console.anthropic.com/
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# 其他配置
MODEL_NAME=gpt-3.5-turbo
TEMPERATURE=0.7
MAX_TOKENS=1000
"""
    
    with open(".env.example", "w", encoding="utf-8") as f:
        f.write(env_content)
    
    print("✅ .env.example 文件已创建")

if __name__ == "__main__":
    # 获取 API 密钥
    keys = get_api_keys()
    print(f"API 密钥状态: {'已配置' if keys['openai'] else '未配置'}")
    
    # 创建 .env 模板
    create_env_file()
```

## 🇨🇳 国内模型替代方案

如果你无法访问 OpenAI 或 Anthropic 的 API，可以使用以下国内模型作为替代。它们同样强大，且注册和使用更加方便。

### 主要选项

| 模型提供商 | 地址 | 特点 |
|-----------|------|------|
| **DeepSeek** | https://platform.deepseek.com/ | 兼容 OpenAI SDK，性价比极高 |
| **通义千问** | https://dashscope.aliyun.com/ | 阿里云提供，生态完善 |
| **Moonshot (月之暗面)** | https://platform.moonshot.cn/ | Kimi 背后的公司，长文本能力强 |
| **智谱** | https://open.bigmodel.cn/ | GLM 系列，清华系背景 |
| **Ollama 本地部署** | https://ollama.com/ | 完全免费，无需联网 |

### DeepSeek API 使用示例

DeepSeek 的 API 与 OpenAI 完全兼容，只需修改 `base_url` 和 `api_key`：

```python
from openai import OpenAI

# 使用 DeepSeek API（兼容 OpenAI SDK）
client = OpenAI(
    api_key="your-deepseek-key",
    base_url="https://api.deepseek.com"
)

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "system", "content": "你是一个有帮助的助手。"},
        {"role": "user", "content": "什么是人工智能？"}
    ],
    temperature=0.7
)

print(response.choices[0].message.content)
```

### Ollama 本地部署示例

如果你想完全免费地使用大模型，可以使用 Ollama 在本地运行开源模型：

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
    api_key="ollama",  # Ollama 不需要真实密钥
    base_url="http://localhost:11434/v1"
)

response = client.chat.completions.create(
    model="qwen2.5:7b",  # 使用你下载的模型
    messages=[
        {"role": "user", "content": "用Python写一个快速排序算法"}
    ],
    temperature=0.7
)

print(response.choices[0].message.content)
```

> **提示**: 国内模型的 API 调用方式与 OpenAI 基本一致，只要支持 OpenAI 兼容接口，只需修改 `base_url` 和 `api_key` 即可无缝切换。

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | API 密钥错误 | 检查环境变量是否正确设置，密钥是否有效 |
| 2 | 请求超时 | 增加超时时间，或使用异步请求 |
| 3 | 模型不存在 | 检查模型名称拼写，确认是否有访问权限 |
| 4 | Token 超限 | 减少输入长度或 max_tokens，或使用更长上下文的模型 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| API | 应用程序编程接口 |
| Token | 大模型处理文本的基本单位 |
| Temperature | 控制输出随机性的参数（0-1） |
| System Message | 设定模型角色和行为的指令 |
| 流式响应 | 边生成边返回的响应方式 |
| Context Window | 模型能处理的最大文本长度 |

## ✅ 验收清单
- [ ] 理解 OpenAI 和 Anthropic API 的基本结构
- [ ] 能成功调用大模型 API
- [ ] 理解系统消息的作用
- [ ] 掌握环境变量管理最佳实践

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
