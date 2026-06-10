# 📅 Week 0 Day 2：Claude Code / Codex CLI 上手

## 🧭 今日方向
> 今天我们将接触 AI 辅助编程工具，了解 Claude Code 和 Codex CLI 的使用方法。这些工具将成为我们后续开发 Agent 的得力助手。

## 🎯 生活比喻
> 如果说编程是写文章，那么 AI 辅助工具就是你的智能写作助手。今天我们要学会如何与这位助手高效沟通，让它帮你快速完成初稿。

## 📋 今日三件事
1. 了解 Claude Code 的功能和使用方法
2. 了解 Codex CLI 的功能和使用方法
3. 通过实际操作体验 AI 辅助编程的流程

## 🗺️ 手把手路线

### Step 1: 了解 Claude Code
- **做什么**: 阅读 Claude Code 文档，了解其核心功能
- **为什么**: Claude Code 是 Anthropic 官方的 AI 编程工具，理解其能力边界很重要
- **成功标志**: 能列出 Claude Code 的 3 个主要功能

### Step 2: 配置 Claude Code
- **做什么**: 安装并配置 Claude Code，设置 API 密钥
- **为什么**: 工具只有配置好才能使用
- **成功标志**: 能成功运行 `claude` 命令并获得响应

### Step 3: 体验 Codex CLI
- **做什么**: 了解 OpenAI Codex CLI 的基本用法
- **为什么**: 不同的 AI 工具有不同的特点，了解多种工具可以拓宽思路
- **成功标志**: 能用 Codex CLI 完成一个简单的编程任务

## 💻 代码区

```python
# 使用 Claude Code 的示例工作流
# 假设我们正在开发一个简单的天气查询 Agent

# 步骤 1: 用自然语言描述需求
# 在 Claude Code 中输入：
# "帮我写一个 Python 函数，接收城市名，返回该城市的天气信息"

# 步骤 2: Claude Code 会生成代码
import requests

def get_weather(city: str) -> dict:
    """
    获取指定城市的天气信息
    
    Args:
        city: 城市名称
        
    Returns:
        天气信息字典
    """
    # 这里使用模拟数据，实际开发中会调用天气 API
    weather_data = {
        "北京": {"temp": "25°C", "condition": "晴朗"},
        "上海": {"temp": "28°C", "condition": "多云"},
        "广州": {"temp": "32°C", "condition": "阵雨"}
    }
    
    return weather_data.get(city, {"temp": "未知", "condition": "未知"})

# 步骤 3: 测试生成的代码
if __name__ == "__main__":
    # 测试不同城市
    cities = ["北京", "上海", "广州", "深圳"]
    
    for city in cities:
        weather = get_weather(city)
        print(f"{city}: {weather['temp']}, {weather['condition']}")
```

```python
# 使用 Codex CLI 的示例工作流
# 假设我们正在开发一个简单的文本处理工具

def count_words(text: str) -> dict:
    """
    统计文本中的单词数量
    
    Args:
        text: 要统计的文本
        
    Returns:
        包含单词数和字符数的字典
    """
    words = text.split()
    return {
        "word_count": len(words),
        "char_count": len(text),
        "avg_word_length": sum(len(word) for word in words) / len(words) if words else 0
    }

# 测试函数
if __name__ == "__main__":
    test_text = "人工智能正在改变我们的世界"
    result = count_words(test_text)
    print(f"文本: {test_text}")
    print(f"单词数: {result['word_count']}")
    print(f"字符数: {result['char_count']}")
    print(f"平均单词长度: {result['avg_word_length']:.2f}")
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | Claude Code 无法连接 | 检查 API 密钥是否正确，网络是否正常 |
| 2 | 生成的代码有错误 | 将错误信息反馈给 AI，让它修正 |
| 3 | 不知道如何描述需求 | 尝试用更具体的语言，提供输入输出示例 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| AI 辅助编程 | 使用人工智能工具来提高编程效率的方法 |
| Claude Code | Anthropic 开发的 AI 编程助手 |
| Codex CLI | OpenAI 开发的命令行编程工具 |
| 提示工程 | 设计有效的输入提示以获得更好的 AI 输出 |

## ✅ 验收清单
- [ ] 理解 Claude Code 和 Codex CLI 的区别
- [ ] 能成功运行 AI 辅助编程工具
- [ ] 完成至少一个简单的编程任务
- [ ] 理解如何有效描述编程需求

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
