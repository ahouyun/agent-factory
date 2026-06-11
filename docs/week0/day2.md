# Week 0 Day 2: Claude Code / Codex CLI 上手

> 今天我们将安装两个 AI 编程助手：Claude Code 和 Codex CLI。它们能帮你写代码、调试错误、解释代码，是后续学习的得力助手。

---

## 一、什么是 AI 编程助手？

AI 编程助手是基于大语言模型（LLM）的工具，你可以用**自然语言**告诉它你想做什么，它会帮你生成代码。

**生活比喻：** 如果编程是写作文，AI 编程助手就像一个随时在线的写作导师——你告诉它"帮我写一段关于春天的描写"，它会给你一段文字，你再告诉它"改成更活泼的风格"，它会帮你修改。

**本课程主要使用 Claude Code**，它是 Anthropic 官方出品的命令行 AI 编程工具，直接在终端中运行，非常高效。

---

## 二、安装 Claude Code

### 2.1 安装 Node.js（Claude Code 的运行环境）

Claude Code 基于 Node.js 运行，所以需要先安装 Node.js。

**Windows 用户：**

```powershell
# 使用 winget 安装 Node.js
winget install OpenJS.NodeJS.LTS
```

**或者手动下载：**
1. 访问 https://nodejs.org/
2. 下载 LTS（长期支持）版本
3. 运行安装程序，一路 Next

**验证安装：**

```powershell
node --version
# 预期输出: v20.x.x

npm --version
# 预期输出: 10.x.x
```

> npm 是 Node.js 的包管理工具，安装 Node.js 时会自动安装。

### 2.2 安装 Claude Code

```powershell
# 全局安装 Claude Code
npm install -g @anthropic-ai/claude-code
```

安装完成后，验证：

```powershell
claude --version
```

**预期输出：**
```
1.0.x
```

### 2.3 首次启动和配置

```powershell
# 启动 Claude Code
claude
```

首次启动时，Claude Code 会要求你登录 Anthropic 账号并配置 API Key。按照屏幕提示操作：

1. 它会打开浏览器，让你登录 Anthropic 账号
2. 登录后会自动配置 API Key
3. 看到命令行出现 `claude>` 提示符就说明配置成功

### 2.4 Claude Code 基本用法

进入 Claude Code 后，你可以直接用自然语言与它对话：

```
claude> 帮我写一个 Python 函数，输入一个列表，返回所有偶数
```

Claude Code 会生成代码并询问是否要创建文件。你可以：
- 输入 `y` 确认创建
- 输入 `n` 取消
- 输入 `e` 编辑后创建

**其他常用命令：**

| 命令 | 作用 |
|------|------|
| `/help` | 查看帮助信息 |
| `/clear` | 清空当前对话 |
| `exit` | 退出 Claude Code |
| `Ctrl+C` | 中断当前操作 |

### 2.5 实战示例：让 Claude 写一个天气查询脚本

在 Claude Code 中输入：

```
claude> 写一个 Python 脚本，定义一个字典存储三个城市的天气信息，
       然后写一个函数，输入城市名，返回天气信息。
       如果城市不存在，返回"未找到该城市的天气信息"。
```

Claude 会生成类似这样的代码：

```python
"""
天气查询脚本 - 由 Claude Code 生成
用法: python weather.py
"""


def get_weather(city: str) -> str:
    """查询指定城市的天气信息"""
    weather_data = {
        "北京": "晴天, 25°C",
        "上海": "多云, 28°C",
        "广州": "阵雨, 30°C",
    }
    return weather_data.get(city, "未找到该城市的天气信息")


def main():
    """主函数"""
    # 测试查询
    cities = ["北京", "上海", "广州", "深圳"]
    for city in cities:
        result = get_weather(city)
        print(f"{city}: {result}")


if __name__ == "__main__":
    main()
```

**运行验证：**

```powershell
python weather.py
```

**预期输出：**
```
北京: 晴天, 25°C
上海: 多云, 28°C
广州: 阵雨, 30°C
深圳: 未找到该城市的天气信息
```

---

## 三、安装 Codex CLI（可选）

Codex CLI 是 OpenAI 出品的命令行编程工具。功能和 Claude Code 类似，但使用 OpenAI 的模型。**你可以在两者中选择一个使用，也可以都安装。**

### 3.1 安装 Codex CLI

```powershell
# 全局安装 Codex CLI
npm install -g @openai/codex
```

**验证安装：**

```powershell
codex --version
```

### 3.2 配置 Codex CLI

使用 Codex CLI 需要 OpenAI API Key。如果你有 OpenAI 的 API Key：

```powershell
# 设置环境变量（Windows PowerShell）
$env:OPENAI_API_KEY = "你的OpenAI-API-Key"

# 如果要永久保存，需要在系统环境变量中设置
[System.Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "你的OpenAI-API-Key", "User")
```

### 3.3 使用 Codex CLI

```powershell
# 启动 Codex CLI 交互模式
codex

# 或者直接给任务
codex "写一个 Python 函数计算斐波那契数列"
```

---

## 四、Claude Code vs Codex CLI 对比

| 特性 | Claude Code | Codex CLI |
|------|-------------|-----------|
| 出品方 | Anthropic | OpenAI |
| 默认模型 | Claude Sonnet | GPT-4o |
| 安装方式 | npm install -g @anthropic-ai/claude-code | npm install -g @openai/codex |
| 需要 API Key | 是（Anthropic） | 是（OpenAI） |
| 命令行交互 | 是 | 是 |
| 推荐度 | 本课程推荐 | 可选 |

---

## 五、用 Claude Code 辅助学习 Python

Claude Code 不仅能写代码，还能帮你**学习和理解**代码。下面是一些实用场景：

### 场景 1：解释代码

在 Claude Code 中输入：

```
claude> 解释以下代码每一行的作用：
def greet(name: str = "World") -> str:
    return f"Hello, {name}!"
```

Claude 会详细解释每个语法点：函数定义、类型提示、默认参数、f-string、返回类型等。

### 场景 2：修复错误

假设你写了这样的代码，但运行报错：

```python
def add(a, b):
    return a + b

result = add(1)  # 少传了一个参数
print(result)
```

运行报错：
```
TypeError: add() missing 1 required positional argument: 'b'
```

把错误信息发给 Claude Code：

```
claude> 这段代码报错了，帮我修复：
def add(a, b):
    return a + b
result = add(1)
错误信息: TypeError: add() missing 1 required positional argument: 'b'
```

Claude 会告诉你问题在于调用 `add(1)` 时只传了一个参数，但函数需要两个参数。

### 场景 3：学习新概念

```
claude> 用简单的例子解释 Python 中的装饰器是什么
```

---

## 六、今日验收清单

- [ ] Node.js 安装成功，`node --version` 能输出版本号
- [ ] Claude Code 安装成功，`claude --version` 能输出版本号
- [ ] 能成功启动 Claude Code 并看到提示符
- [ ] 用 Claude Code 完成了至少一个编程任务（写代码/修 bug/解释代码）
- [ ] （可选）Codex CLI 安装成功并能使用

---

## 七、常见问题

**Q: Claude Code 启动后提示 API Key 无效？**
A: 检查你的 Anthropic 账号是否有 API 访问权限。如果没有，需要在 https://console.anthropic.com/ 注册并获取 API Key。

**Q: npm install -g 报权限错误？**
A: Windows 上通常不会遇到这个问题。如果遇到，以管理员身份运行 PowerShell。

**Q: Claude Code 和 ChatGPT 有什么区别？**
A: Claude Code 是在命令行中运行的编程助手，可以直接操作你的文件和项目。ChatGPT 是网页对话工具，主要用于问答。

---

## 八、今日复盘

- 今天用 AI 编程助手完成了什么任务？
- AI 生成的代码是否正确？你做了哪些修改？
- 你觉得 AI 编程助手最有用的场景是什么？

---

## 九、明日预告

明天我们将**初始化项目仓库**，创建标准的项目目录结构，配置 CLAUDE.md 文件。请确保今天 AI 编程助手已经可以正常使用。
