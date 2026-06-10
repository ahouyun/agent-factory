# Phase 0：预备周 —— 磨刀不误砍柴工

> **目标**：完成所有环境搭建、工具上手、知识库初始化，为后续 8 周学习打下坚实地基。
> **周期**：Week 0，共 7 天

---

## 📅 Day 1：学习路线总览 + 工具链搭建

### 🧭 今日方向
认识整个 Agent Factory 学习项目的全貌，完成 Git、VS Code、Python 三件套的安装与配置。

### 🎯 生活比喻
就像盖房子之前要先量地基、搬建材。今天我们把"砖头水泥"（开发工具）全部搬到工地上。

### 📋 今日三件事
1. 通读项目学习路线图，建立全局认知
2. 安装 Git 并完成基础配置
3. 安装 VS Code + Python，并验证一切正常

---

### 🗺️ 手把手路线

#### 第一步：通读学习路线总览

**做什么**：打开 `docs/README.md`（本项目的主索引），快速浏览 Phase 0 到 Phase 4 的标题和简介。

**为什么**：先看森林，再看树木。知道终点在哪里，走路才不慌。

**成功标志**：能用自己的话说出"我要在 8 周内从零搭建一个 Agent 系统"。

---

#### 第二步：安装 Git

**做什么**：
1. 访问 [https://git-scm.com/downloads](https://git-scm.com/downloads)，下载对应系统的 Git 安装包。
2. 安装时一路默认即可（Windows 用户注意选择 "Git from the command line and also from 3rd-party software"）。
3. 安装完成后打开终端（Windows 用 PowerShell，Mac/Linux 用 Terminal），输入：
   ```bash
   git --version
   ```
4. 配置身份信息：
   ```bash
   git config --global user.name "你的名字"
   git config --global user.email "你的邮箱"
   ```

**为什么**：Git 是代码版本管理的基石，后续所有项目都依赖它。

**成功标志**：终端输出 `git version x.x.x`，`git config --global user.name` 能显示你的名字。

---

#### 第三步：安装 VS Code

**做什么**：
1. 访问 [https://code.visualstudio.com/](https://code.visualstudio.com/) 下载并安装。
2. 安装后打开，按 `Ctrl+Shift+X`（Mac 为 `Cmd+Shift+X`），搜索并安装以下扩展：
   - **Python**（Microsoft 出品）
   - **Pylance**（类型检查）
   - **GitLens**（Git 可视化）
   - **Markdown Preview Enhanced**（Markdown 预览）

**为什么**：VS Code 是目前最主流的轻量级 IDE，生态丰富、插件强大。

**成功标志**：打开任意 `.py` 文件，右下角显示 Python 版本号，语法有高亮。

---

#### 第四步：安装 Python

**做什么**：
1. 访问 [https://www.python.org/downloads/](https://www.python.org/downloads/)，下载 Python 3.11 或 3.12（推荐 3.12）。
2. **Windows 用户**：安装时务必勾选 **"Add Python to PATH"**。
3. 安装完成后打开终端验证：
   ```bash
   python --version
   pip --version
   ```

**为什么**：Python 是本项目的核心语言，贯穿全部阶段。

**成功标志**：终端输出 `Python 3.12.x` 和 `pip 24.x`。

---

### 💻 代码区：第一个验证脚本

创建文件 `hello.py`，运行以下代码确认环境正常：

```python
# hello.py —— 环境验证脚本
import sys  # 导入系统模块，用于获取 Python 版本信息

def main():
    """打印环境信息，验证安装是否成功"""
    print("=" * 50)
    print("  Agent Factory 环境验证")
    print("=" * 50)
    print(f"  Python 版本: {sys.version}")          # 输出 Python 版本
    print(f"  Python 路径: {sys.executable}")        # 输出 Python 安装路径
    print(f"  当前操作系统: {sys.platform}")          # 输出操作系统平台
    print("=" * 50)
    print("  ✅ 环境验证通过！准备就绪。")
    print("=" * 50)

if __name__ == "__main__":
    main()  # 直接运行此文件时执行 main 函数
```

运行方式：
```bash
python hello.py
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| `git` 不是内部命令 | 检查 Git 是否加入 PATH，重启终端重试 |
| `python` 不是内部命令 | Windows 安装时未勾选 "Add to PATH"，重新安装并勾选 |
| VS Code 打开 .py 文件无高亮 | 检查 Python 扩展是否安装并启用 |
| pip 安装包报权限错误 | 使用 `pip install --user 包名` 或使用虚拟环境（Day 5 学习） |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| Git | 分布式版本控制系统 | 代码的"时光机"，随时可以回到过去 |
| VS Code | 轻量级代码编辑器 | 你的代码工作室 |
| Python | 编程语言 | 你的"母语"，后面写 Agent 都用它 |
| PATH | 系统环境变量 | 告诉电脑"去哪里找命令" |
| pip | Python 包管理器 | Python 的"应用商店" |
| Terminal / 终端 | 命令行界面 | 和电脑"对话"的窗口 |

---

### ✅ 验收清单

- [ ] Git 安装成功，`git --version` 正常输出
- [ ] VS Code 安装成功，扩展已安装
- [ ] Python 3.12 安装成功，`python --version` 正常输出
- [ ] `hello.py` 运行成功，输出环境信息
- [ ] 已通读项目学习路线图

---

### 📝 复盘小纸条

> **今天我学到了什么？**
>
> 
>
> **哪里卡住了？怎么解决的？**
>
> 
>
> **明天我想重点攻克什么？**
>
> 

---

### 📥 明日同步接口

- 输入：今天的工具已全部安装就绪
- 输出：准备开始 Day 2 的 AI 编程工具上手
- 关键交接物：Git、VS Code、Python 三者均可正常运行

---

## 📅 Day 2：Claude Code / Codex CLI 上手

### 🧭 今日方向
体验 AI 辅助编程的威力——用 Claude Code 或 Codex CLI 生成你的第一个 Python 脚本。

### 🎯 生活比喻
今天我们请了一位"编程家教"（AI），看看它能不能帮你写作业。重点是学会怎么给家教提需求。

### 📋 今日三件事
1. 了解 Claude Code 和 Codex CLI 是什么、能干什么
2. 安装并配置至少一个 AI 编程工具
3. 用 AI 生成第一个可运行的 Python 脚本

---

### 🗺️ 手把手路线

#### 第一步：了解 AI 编程工具

**做什么**：花 10 分钟阅读以下资料（任选其一）：
- Claude Code 官方文档：[https://docs.anthropic.com/en/docs/claude-code](https://docs.anthropic.com/en/docs/claude-code)
- OpenAI Codex CLI：[https://github.com/openai/codex](https://github.com/openai/codex)

**为什么**：工欲善其事，必先利其器。AI 编程工具是后续 Agent 开发的核心效率倍增器。

**成功标志**：能说出 Claude Code 和 Codex CLI 各自是什么、有什么区别。

---

#### 第二步：安装 Claude Code 或 Codex CLI

**做什么（Claude Code 方式）**：
```bash
# 需要先安装 Node.js 18+
npm install -g @anthropic-ai/claude-code

# 启动
claude
```

**做什么（Codex CLI 方式）**：
```bash
# 需要先安装 Node.js 18+ 和 OpenAI API Key
npm install -g @openai/codex

# 设置 API Key
export OPENAI_API_KEY="你的key"

# 启动
codex
```

**为什么**：只有安装好了，才能真正上手体验。

**成功标志**：工具成功启动，出现交互界面。

---

#### 第三步：用 AI 生成第一个脚本

**做什么**：在终端中对 AI 工具说：

> 帮我写一个 Python 脚本，功能是：输入一个人的出生年份，计算出他今年多少岁，并用友好的中文输出结果。

**为什么**：这是你第一次和 AI 协作编程，体验"描述需求 → AI 生成代码 → 你运行验证"的完整闭环。

**成功标志**：AI 生成代码，你复制到文件中运行成功。

---

### 💻 代码区：AI 生成的"年龄计算器"

```python
# age_calculator.py —— AI 辅助生成的年龄计算器
import datetime  # 导入日期时间模块，用于获取当前年份

def calculate_age(birth_year: int) -> int:
    """
    根据出生年份计算年龄
    
    参数:
        birth_year: 出生年份（整数）
    
    返回:
        年龄（整数）
    """
    current_year = datetime.datetime.now().year  # 获取当前年份
    age = current_year - birth_year              # 简单相减得到年龄
    return age

def main():
    """主函数：获取用户输入并输出结果"""
    print("🎂 年龄计算器")
    print("-" * 30)
    
    try:
        year_input = input("请输入你的出生年份: ")  # 获取用户输入
        birth_year = int(year_input)                 # 转换为整数
        age = calculate_age(birth_year)              # 计算年龄
        
        print(f"\n你出生于 {birth_year} 年")
        print(f"到 {datetime.datetime.now().year} 年，你 {age} 岁了！")
    except ValueError:
        print("❌ 输入无效，请输入一个数字年份，例如 1995")

if __name__ == "__main__":
    main()  # 运行主函数
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| Claude Code / Codex CLI 安装失败 | 确认 Node.js 版本 >= 18，`node --version` 检查 |
| AI 生成的代码运行报错 | 把错误信息贴给 AI，让它修复——这也是 AI 辅助编程的正确用法 |
| 不知道怎么描述需求 | 从简单开始：说清楚"输入是什么、输出是什么、做什么处理" |
| API Key 问题 | 检查环境变量是否设置正确，密钥是否有效 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| Claude Code | Anthropic 的 AI 编程助手 CLI | 终端里的 AI 程序员 |
| Codex CLI | OpenAI 的 AI 编程助手 CLI | 终端里的另一个 AI 程序员 |
| Prompt | 给 AI 的指令/提示 | 你对家教说的"要求" |
| API Key | API 访问密钥 | AI 服务的"门禁卡" |
| CLI | 命令行界面 | 用文字而非鼠标操作程序 |
| REPL | 读取-执行-打印循环 | 写一行代码立刻看到结果 |

---

### ✅ 验收清单

- [ ] 能说出 Claude Code 和 Codex CLI 的区别
- [ ] 至少一个 AI 编程工具安装成功并能启动
- [ ] 成功用 AI 生成了一个 Python 脚本
- [ ] 生成的脚本运行正常
- [ ] 体验了"描述需求 → AI 生成 → 运行验证"的完整流程

---

### 📝 复盘小纸条

> **今天我学到了什么？**
>
> 
>
> **AI 生成的代码我理解了吗？哪些地方有疑问？**
>
> 
>
> **我给 AI 的 prompt 怎样写更高效？**
>
> 

---

### 📥 明日同步接口

- 输入：AI 编程工具已安装并体验过
- 输出：准备初始化项目仓库 + 配置 CLAUDE.md
- 关键交接物：对 AI 辅助编程有了初步体感

---

## 📅 Day 3：项目仓库初始化 + CLAUDE.md 配置

### 🧭 今日方向
创建 Agent Factory 项目的 Git 仓库，并配置 CLAUDE.md 让 AI 工具理解你的项目。

### 🎯 生活比喻
就像给新家挂上门牌号、贴好标签——让所有来帮忙的人（包括 AI）都知道这间屋子是干什么的。

### 📋 今日三件事
1. 在本地初始化 Git 仓库并推送到 GitHub
2. 创建项目目录结构
3. 编写 CLAUDE.md 项目说明文件

---

### 🗺️ 手把手路线

#### 第一步：创建 GitHub 仓库

**做什么**：
1. 登录 [https://github.com](https://github.com)
2. 点击右上角 "+" → "New repository"
3. 仓库名：`agent-factory`
4. 描述：`Agent Factory - 从零到一学习 AI Agent 开发`
5. 选择 Public 或 Private
6. **不要**勾选 "Add a README file"（我们本地创建）
7. 点击 "Create repository"

**为什么**：远程仓库是代码的"云备份"，也是团队协作的基础。

**成功标志**：GitHub 上能看到空仓库页面。

---

#### 第二步：本地初始化仓库

**做什么**：
```bash
# 创建项目目录
mkdir agent-factory
cd agent-factory

# 初始化 Git 仓库
git init

# 创建目录结构
mkdir -p docs/phase0 docs/phase1 src tests

# 创建 .gitignore 文件
```

**为什么**：良好的目录结构是项目可维护性的基础。

**成功标志**：`ls` 能看到完整的目录结构。

---

#### 第三步：编写 CLAUDE.md

**做什么**：创建 `CLAUDE.md` 文件，内容参考下方代码区。

**为什么**：CLAUDE.md 是 AI 编程工具的"项目说明书"，告诉 AI 项目的结构、约定和规范。

**成功标志**：文件创建完成，内容包含项目简介、目录结构、编码规范。

---

### 💻 代码区

#### .gitignore 文件

```gitignore
# .gitignore —— Git 忽略文件列表
# Python 虚拟环境
venv/
.venv/
env/

# Python 缓存
__pycache__/
*.pyc
*.pyo

# IDE 配置
.vscode/
.idea/

# 环境变量（敏感信息！）
.env
.env.local

# 操作系统文件
.DS_Store
Thumbs.db
```

#### CLAUDE.md 文件

```markdown
# Agent Factory

从零到一学习 AI Agent 开发的学习项目。

## 项目结构

agent-factory/
├── CLAUDE.md          # 本文件 - AI 项目说明
├── docs/              # 学习文档
│   ├── phase0/        # Phase 0: 预备周
│   └── phase1/        # Phase 1: 基础构建
├── src/               # 源代码
│   └── agent/         # Agent 核心代码
└── tests/             # 测试代码

## 技术栈

- Python 3.12+
- FastAPI (Web 框架)
- SQLAlchemy (ORM)
- OpenAI / Anthropic SDK (LLM 接口)

## 编码规范

- 使用 type hints（类型提示）
- 所有函数必须有 docstring
- 变量命名使用 snake_case
- 文件编码统一 UTF-8

## 常用命令

```bash
# 激活虚拟环境
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt

# 运行测试
pytest tests/ -v

# 启动开发服务器
uvicorn src.agent.main:app --reload
```
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| `git push` 失败 | 检查远程仓库 URL 是否正确：`git remote -v` |
| GitHub 认证失败 | 使用 GitHub CLI `gh auth login` 或配置 SSH Key |
| 目录已存在 | 使用 `git init` 在已有目录中初始化即可 |
| CLAUDE.md 不生效 | 确保文件在项目根目录，且拼写正确（全大写） |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| 仓库 (Repository) | 项目的完整历史记录 | 代码的"档案馆" |
| CLAUDE.md | AI 工具的项目说明 | 给 AI 的"项目说明书" |
| .gitignore | Git 忽略规则 | 告诉 Git "这些东西别管" |
| commit | 代码快照 | 给代码拍一张"存档照片" |
| push | 推送到远程 | 把本地存档"上传到云端" |
| remote | 远程仓库 | GitHub 上的代码副本 |

---

### ✅ 验收清单

- [ ] GitHub 远程仓库创建成功
- [ ] 本地仓库初始化完成，`git status` 正常
- [ ] 项目目录结构创建完成
- [ ] `.gitignore` 文件创建并生效
- [ ] `CLAUDE.md` 文件编写完成
- [ ] 至少一次 commit + push 成功

---

### 📝 复盘小纸条

> **今天我学到了什么？**
>
> 
>
> **Git 操作中哪里不太熟练？**
>
> 
>
> **CLAUDE.md 我觉得还需要补充什么？**
>
> 

---

### 📥 明日同步接口

- 输入：项目仓库和目录结构已就绪
- 输出：准备搭建 Obsidian 知识库
- 关键交接物：可正常 push/pull 的 Git 仓库

---

## 📅 Day 4：Obsidian 知识库搭建

### 🧭 今日方向
搭建个人知识管理系统，用 Obsidian 记录学习笔记、建立知识关联。

### 🎯 生活比喻
如果说 Git 管理的是"代码"，那 Obsidian 管理的就是"知识"。今天我们建一个属于自己的"知识图书馆"。

### 📋 今日三件事
1. 安装 Obsidian 并创建知识库 Vault
2. 设计笔记模板和目录结构
3. 创建第一批笔记，体验双向链接

---

### 🗺️ 手把手路线

#### 第一步：安装 Obsidian

**做什么**：
1. 访问 [https://obsidian.md/](https://obsidian.md/) 下载安装
2. 打开后选择 "Create new vault"
3. 命名为 `Agent-Factory-KB`（知识库）
4. 存放位置建议：`D:/Agent-Factory-KB` 或你习惯的笔记目录

**为什么**：Obsidian 是基于 Markdown 的本地知识管理工具，支持双向链接和知识图谱。

**成功标志**：Obsidian 打开空 Vault，能看到文件列表界面。

---

#### 第二步：设计笔记目录

**做什么**：在 Vault 中创建以下目录：
```
Agent-Factory-KB/
├── 00-索引/           # 各阶段的索引页
├── 01-Phase0/         # 预备周笔记
├── 02-Phase1/         # 基础构建笔记
├── 03-Phase2/         # Agent 核心笔记
├── 04-Phase3/         # 进阶实战笔记
├── 05-Phase4/         # 总结毕业笔记
├── Templates/         # 笔记模板
└── Attachments/       # 图片等附件
```

**为什么**：清晰的目录结构让知识检索事半功倍。

**成功标志**：Obsidian 左侧面板能看到完整的目录树。

---

#### 第三步：创建笔记模板

**做什么**：在 `Templates/` 目录中创建每日笔记模板。

**为什么**：统一模板保证笔记质量一致，减少重复劳动。

**成功标志**：能用模板快速创建新笔记。

---

### 💻 代码区：笔记模板

#### 每日学习笔记模板

```markdown
# {{date:YYYY-MM-DD}} {{title}}

## 🎯 今日目标


## 📝 学习内容

### 核心概念


### 关键代码


## ❓ 疑问与待解决


## 🔗 关联笔记
- [[]]

## 📌 重要摘录


## ✅ 今日完成
- [ ] 
```

#### 概念笔记模板

```markdown
# {{title}} — 概念卡片

## 一句话定义


## 详细解释


## 生活类比


## 代码示例

```python

```

## 相关概念
- [[]]

## 常见误区


## 参考资料
- 
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| Obsidian 打不开 | 检查系统是否为 Windows 10+ / macOS 10.15+ |
| 模板不生效 | 确认 Settings → Core plugins → Templates 已启用 |
| 双向链接 `[[ ]]` 不识别 | 在设置中确认 Markdown → Wiki links 已启用 |
| 笔记太多找不到 | 使用 Obsidian 的全文搜索 `Ctrl+Shift+F` |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| Vault | Obsidian 的知识库 | 你的"图书馆" |
| 双向链接 | `[[笔记名]]` 格式的关联 | 知识之间的"桥梁" |
| 知识图谱 | 笔记关联的可视化 | 知识的"地图" |
| 模板 | 预定义的笔记格式 | 笔记的"样板间" |
| Tag | 标签分类 | 给笔记"贴标签"方便搜索 |
| Markdown | 轻量级标记语言 | 用纯文本写格式化文档 |

---

### ✅ 验收清单

- [ ] Obsidian 安装成功，Vault 创建完成
- [ ] 目录结构设计完成
- [ ] 至少创建了 2 个笔记模板
- [ ] 用模板创建了第一篇学习笔记
- [ ] 体验了双向链接功能
- [ ] 能打开知识图谱查看笔记关联

---

### 📝 复盘小纸条

> **今天我学到了什么？**
>
> 
>
> **Obsidian 的哪些功能让我觉得有用？**
>
> 
>
> **我的笔记系统还需要哪些改进？**
>
> 

---

### 📥 明日同步接口

- 输入：Obsidian 知识库已搭建，模板就绪
- 输出：准备开始 Python 速通学习
- 关键交接物：可用的笔记系统 + 第一批笔记模板

---

## 📅 Day 5：Python 速通——变量 / 函数 / 类 / 模块

### 🧭 今日方向
快速掌握 Python 的四大核心概念：变量、函数、类、模块。不需要精通，但要能读懂、能写出来。

### 🎯 生乐比喻
变量是"盒子"（装东西），函数是"流水线"（处理东西），类是"图纸"（批量生产东西），模块是"工具箱"（打包好的一组工具）。

### 📋 今日三件事
1. 理解变量和数据类型
2. 学会定义和调用函数
3. 理解类和模块的基本用法

---

### 🗺️ 手把手路线

#### 第一步：变量与数据类型

**做什么**：运行下方"变量篇"代码，逐行理解每种数据类型的用法。

**为什么**：变量是所有程序的基本组成单元。

**成功标志**：能区分 int、float、str、bool、None 五种基本类型。

---

#### 第二步：函数

**做什么**：运行"函数篇"代码，重点理解参数、返回值、类型提示。

**为什么**：函数是代码复用的基本单位，写好函数 = 写好"零件"。

**成功标志**：能自己写一个接受参数并返回结果的函数。

---

#### 第三步：类与模块

**做什么**：运行"类与模块篇"代码，理解类的定义、实例化、方法。

**为什么**：类是面向对象编程的核心，Agent 开发中大量使用类来组织代码。

**成功标志**：能定义一个简单的类，创建实例并调用方法。

---

### 💻 代码区

#### 变量篇

```python
# variables.py —— Python 变量速通

# === 基本数据类型 ===
name = "Agent 学员"          # str 字符串 —— 用引号包裹的文本
age = 25                     # int 整数 —— 没有小数点的数字
height = 175.5               # float 浮点数 —— 有小数点的数字
is_student = True            # bool 布尔值 —— 只有 True 或 False
nothing = None               # NoneType —— 表示"空"或"没有值"

# === 类型检查 ===
print(f"名字的类型: {type(name)}")         # <class 'str'>
print(f"年龄的类型: {type(age)}")          # <class 'int'>
print(f"身高的类型: {type(height)}")       # <class 'float'>
print(f"是否学生: {type(is_student)}")     # <class 'bool'>
print(f"空值的类型: {type(nothing)}")      # <class 'NoneType'>

# === 类型转换 ===
age_str = str(age)              # int → str: "25"
price = float("99.9")           # str → float: 99.9
count = int(3.7)                # float → int: 3（截断，不是四舍五入）

# === 格式化字符串（f-string）===
print(f"我叫 {name}，今年 {age} 岁")       # 用 f"..." 插入变量
print(f"身高 {height:.1f} 厘米")            # :.1f 表示保留 1 位小数
```

#### 函数篇

```python
# functions.py —— Python 函数速通

# === 基本函数定义 ===
def greet(name: str) -> str:
    """
    向某人打招呼
    
    参数:
        name: 要打招呼的人的名字
    返回:
        打招呼的字符串
    """
    return f"你好，{name}！欢迎来到 Agent Factory！"

# 调用函数
message = greet("小明")
print(message)  # 输出: 你好，小明！欢迎来到 Agent Factory！

# === 带默认值的参数 ===
def power(base: float, exponent: float = 2) -> float:
    """
    计算幂运算
    
    参数:
        base: 底数
        exponent: 指数，默认为 2（平方）
    """
    return base ** exponent

print(power(3))       # 9.0（默认平方）
print(power(2, 10))   # 1024.0（2 的 10 次方）

# === 多返回值 ===
def divide(a: float, b: float) -> tuple[float, float]:
    """
    返回商和余数
    """
    quotient = a // b    # 整除
    remainder = a % b    # 取余
    return quotient, remainder

q, r = divide(17, 5)    # 解包多个返回值
print(f"17 ÷ 5 = {q} 余 {r}")  # 17 ÷ 5 = 3 余 2

# === *args 和 **kwargs（可变参数）===
def print_info(*args, **kwargs):
    """
    打印任意位置参数和关键字参数
    *args: 接收任意数量的位置参数（元组）
    **kwargs: 接收任意数量的关键字参数（字典）
    """
    print("位置参数:", args)
    print("关键字参数:", kwargs)

print_info("hello", 42, name="Agent", version=1)
```

#### 类与模块篇

```python
# classes.py —— Python 类速通

class Dog:
    """一只狗 —— 类的基本示例"""
    
    # 类属性（所有实例共享）
    species = "犬科"
    
    def __init__(self, name: str, age: int):
        """
        构造方法 —— 创建实例时自动调用
        
        参数:
            name: 狗的名字
            age: 狗的年龄
        """
        # 实例属性（每个实例独有）
        self.name = name
        self.age = age
    
    def bark(self) -> str:
        """实例方法 —— 狗叫"""
        return f"{self.name} 说：汪汪！"
    
    def get_info(self) -> str:
        """获取狗的信息"""
        return f"{self.name}，{self.age} 岁，属于{self.species}"
    
    def __str__(self) -> str:
        """定义打印实例时的显示内容"""
        return f"Dog({self.name}, {self.age}岁)"

# 创建实例（实例化）
my_dog = Dog("旺财", 3)
your_dog = Dog("小白", 5)

# 调用方法
print(my_dog.bark())          # 旺财 说：汪汪！
print(your_dog.get_info())    # 小白，5 岁，属于犬科
print(my_dog)                 # Dog(旺财, 3岁)

# === 继承 ===
class GuideDog(Dog):
    """导盲犬 —— 继承自 Dog 类"""
    
    def __init__(self, name: str, age: int, owner: str):
        super().__init__(name, age)    # 调用父类构造方法
        self.owner = owner             # 新增属性
    
    def guide(self) -> str:
        """导盲犬专属方法"""
        return f"{self.name} 正在引导 {self.owner} 前行"

guide = GuideDog("大黄", 4, "小红")
print(guide.bark())     # 继承的方法: 大黄 说：汪汪！
print(guide.guide())    # 独有方法: 大黄 正在引导 小红 前行
```

```python
# mymodule.py —— 自定义模块示例
"""这是一个简单的模块，包含工具函数"""

def add(a: int, b: int) -> int:
    """两数相加"""
    return a + b

def multiply(a: int, b: int) -> int:
    """两数相乘"""
    return a * b

PI = 3.14159  # 模块级常量
```

```python
# use_module.py —— 使用自定义模块
import mymodule                      # 导入整个模块
from mymodule import add, PI          # 从模块导入特定内容

print(mymodule.add(3, 5))            # 8
print(add(3, 5))                     # 8（直接使用导入的函数）
print(f"圆周率 = {PI}")              # 圆周率 = 3.14159

# 导入标准库模块
import os                            # 操作系统相关
import json                          # JSON 处理
from datetime import datetime        # 日期时间

print(f"当前时间: {datetime.now()}")
print(f"当前目录: {os.getcwd()}")
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| `IndentationError` | Python 用缩进表示代码块，统一用 4 个空格 |
| `NameError: name 'x' is not defined` | 变量未定义就使用了，先赋值 |
| `TypeError` | 类型不匹配，检查变量类型 |
| `self` 不理解 | `self` 代表"实例自己"，就像说"我的名字"中的"我" |
| `import` 找不到模块 | 检查文件是否在同一目录，或模块名拼写是否正确 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| 变量 | 存储数据的命名空间 | 贴了标签的"盒子" |
| 函数 | 可复用的代码块 | 一条"流水线" |
| 类 | 对象的蓝图/模板 | 一批产品的"图纸" |
| 实例 | 类的具体对象 | 按图纸造出来的"产品" |
| 方法 | 类中的函数 | 产品能执行的"动作" |
| 模块 | 一个 .py 文件 | 一个"工具箱" |
| `self` | 实例自身引用 | "我自己" |
| `__init__` | 构造方法 | 产品出厂时的"初始化设置" |
| 类型提示 | `x: int` 这样的标注 | 给变量贴"类型标签"，帮助理解和检查 |

---

### ✅ 验收清单

- [ ] 能区分 5 种基本数据类型
- [ ] 能定义带参数和返回值的函数
- [ ] 能定义类、创建实例、调用方法
- [ ] 理解继承的基本概念
- [ ] 能用 `import` 导入模块
- [ ] 运行了所有代码区的示例代码

---

### 📝 复盘小纸条

> **今天哪个概念最难理解？**
>
> 
>
> **`self` 我理解了吗？用自己的话解释一下：**
>
> 
>
> **明天我想在哪些方面多练习？**
>
> 

---

### 📥 明日同步接口

- 输入：Python 基础语法已了解
- 输出：准备学习 Python 数据结构和类型提示
- 关键交接物：能读懂和编写基本的 Python 类和函数

---

## 📅 Day 6：Python 数据结构 + 类型提示

### 🧭 今日方向
掌握 Python 四大内置数据结构（列表、字典、元组、集合），并学习类型提示和 Pydantic 基础。

### 🎯 生活比喻
列表是"购物清单"（有序可变），字典是"通讯录"（键值对查找），元组是"快递单号"（有序不可变），集合是"不重复的签到表"。

### 📋 今日三件事
1. 掌握列表和字典的常用操作
2. 了解元组和集合的特点
3. 学习类型提示和 Pydantic 数据验证

---

### 🗺️ 手把手路线

#### 第一步：列表与字典

**做什么**：运行"列表与字典篇"代码，重点掌握增删改查操作。

**为什么**：列表和字典是 Python 中使用频率最高的数据结构，Agent 开发中到处都是。

**成功标志**：能熟练使用列表推导式和字典推导式。

---

#### 第二步：元组与集合

**做什么**：运行"元组与集合篇"代码，理解它们与列表的区别。

**为什么**：元组用于不可变数据，集合用于去重和集合运算。

**成功标志**：能说清 list vs tuple、list vs set 的区别。

---

#### 第三步：类型提示与 Pydantic

**做什么**：安装 Pydantic，运行"类型提示篇"代码。

**为什么**：类型提示让代码更清晰、更安全，Pydantic 是 FastAPI 的数据验证核心。

**成功标志**：能用 Pydantic 定义数据模型并进行验证。

---

### 💻 代码区

#### 列表与字典篇

```python
# data_structures.py —— 数据结构速通

# === 列表 (list) —— 有序、可变、可重复 ===
fruits = ["苹果", "香蕉", "橙子"]       # 创建列表
fruits.append("葡萄")                   # 末尾添加元素
fruits.insert(1, "草莓")               # 在索引 1 处插入
fruits.remove("香蕉")                   # 删除指定元素
popped = fruits.pop()                   # 弹出末尾元素
print(f"水果列表: {fruits}")            # ['苹果', '草莓', '橙子']
print(f"弹出的: {popped}")              # 葡萄

# 列表切片
numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print(numbers[2:5])     # [2, 3, 4] —— 取索引 2 到 4
print(numbers[::2])     # [0, 2, 4, 6, 8] —— 每隔一个取
print(numbers[::-1])    # [9, 8, 7, 6, 5, 4, 3, 2, 1, 0] —— 反转

# 列表推导式（优雅的循环创建方式）
squares = [x ** 2 for x in range(10)]
print(f"平方数: {squares}")  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

even_squares = [x ** 2 for x in range(10) if x % 2 == 0]
print(f"偶数平方: {even_squares}")  # [0, 4, 16, 36, 64]

# === 字典 (dict) —— 键值对、有序（Python 3.7+）、键不重复 ===
person = {
    "name": "张三",            # 键: 值
    "age": 28,
    "skills": ["Python", "AI"]
}
person["email"] = "zhangsan@example.com"   # 添加新键值对
del person["age"]                           # 删除键值对
person["age"] = 29                          # 修改值

# 安全访问（避免 KeyError）
phone = person.get("phone", "未设置")       # 键不存在时返回默认值

# 遍历字典
for key, value in person.items():
    print(f"  {key}: {value}")

# 字典推导式
word = "hello"
char_count = {ch: word.count(ch) for ch in set(word)}
print(f"字符统计: {char_count}")  # {'h': 1, 'e': 1, 'l': 2, 'o': 1}

# === 嵌套结构 ===
students = [
    {"name": "小明", "scores": [90, 85, 92]},
    {"name": "小红", "scores": [88, 95, 90]},
    {"name": "小刚", "scores": [78, 82, 85]},
]

# 计算每个学生的平均分
for student in students:
    avg = sum(student["scores"]) / len(student["scores"])
    print(f"{student['name']} 平均分: {avg:.1f}")
```

#### 元组与集合篇

```python
# tuple_set.py —— 元组和集合

# === 元组 (tuple) —— 有序、不可变、可重复 ===
point = (3, 4)                    # 创建元组
x, y = point                      # 解包
print(f"坐标: x={x}, y={y}")     # 坐标: x=3, y=4

# 元组不可修改（取消注释会报错）
# point[0] = 5  # TypeError!

# 元组用作字典的键（因为不可变）
locations = {
    (35.6895, 139.6917): "东京",
    (40.7128, -74.0060): "纽约",
    (31.2304, 121.4737): "上海",
}

# 命名元组（更清晰的元组）
from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])    # 定义命名元组类型
p = Point(3, 4)                             # 创建实例
print(f"({p.x}, {p.y})")                   # (3, 4) —— 比 p[0] 更清晰

# === 集合 (set) —— 无序、不重复 ===
colors = {"红", "绿", "蓝", "红"}   # 自动去重
print(f"颜色: {colors}")            # {'红', '绿', '蓝'}（顺序可能不同）

# 集合运算
a = {1, 2, 3, 4, 5}
b = {4, 5, 6, 7, 8}

print(f"交集: {a & b}")       # {4, 5} —— 两者都有
print(f"并集: {a | b}")       # {1, 2, 3, 4, 5, 6, 7, 8} —— 所有元素
print(f"差集: {a - b}")       # {1, 2, 3} —— a 有但 b 没有

# 快速去重
names = ["张三", "李四", "张三", "王五", "李四"]
unique_names = list(set(names))
print(f"去重后: {unique_names}")  # ['张三', '李四', '王五']（顺序可能不同）
```

#### 类型提示与 Pydantic 篇

```python
# type_hints.py —— 类型提示与 Pydantic 基础

from typing import Optional          # 旧版可选类型（Python 3.9 前）
from pydantic import BaseModel, Field, ValidationError  # 数据验证

# === 内置类型提示 ===
def calculate_bmi(weight: float, height: float) -> float:
    """
    计算 BMI 指数
    
    参数:
        weight: 体重（千克）
        height: 身高（米）
    返回:
        BMI 值
    """
    return weight / (height ** 2)

# === 复合类型提示 ===
def get_top_students(
    students: list[dict[str, int]],     # 参数类型：字典列表
    top_n: int = 3                       # 默认参数
) -> list[str]:                          # 返回类型：字符串列表
    """
    获取成绩最高的 N 名学生
    
    参数:
        students: 学生列表，每个元素是 {"name": "名字", "score": 分数}
        top_n: 返回前 N 名
    返回:
        学生名字列表
    """
    # 按分数排序，取前 N 个
    sorted_students = sorted(students, key=lambda s: s["score"], reverse=True)
    return [s["name"] for s in sorted_students[:top_n]]

# === Pydantic 数据模型 ===
class Student(BaseModel):
    """学生数据模型 —— Pydantic 自动验证数据"""
    name: str = Field(..., min_length=1, max_length=50)   # 必填，1-50 字符
    age: int = Field(..., ge=0, le=150)                    # 必填，0-150 岁
    email: Optional[str] = None                            # 可选
    scores: list[float] = Field(default_factory=list)      # 默认空列表
    
    @property
    def average_score(self) -> float:
        """计算平均分"""
        if not self.scores:
            return 0.0
        return sum(self.scores) / len(self.scores)

# 使用 Pydantic —— 正确数据
try:
    student = Student(
        name="小明",
        age=20,
        email="xiaoming@example.com",
        scores=[90, 85, 92]
    )
    print(f"学生: {student.name}")
    print(f"平均分: {student.average_score:.1f}")
except ValidationError as e:
    print(f"数据验证失败: {e}")

# 使用 Pydantic —— 错误数据（自动报错）
try:
    bad_student = Student(name="", age=-5)   # 名字空，年龄负数
except ValidationError as e:
    print(f"\n数据验证失败（预期的错误）:")
    print(e)

# === TypedDict（更轻量的类型提示）===
from typing import TypedDict

class AgentConfig(TypedDict):
    """Agent 配置类型"""
    name: str
    model: str
    temperature: float
    max_tokens: int

config: AgentConfig = {
    "name": "my-agent",
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2048,
}
print(f"\nAgent 配置: {config['name']}, 模型: {config['model']}")
```

安装 Pydantic：
```bash
pip install pydantic
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| `KeyError` | 用 `dict.get(key, default)` 安全访问 |
| `IndexError` | 检查列表长度，使用 `len()` |
| Pydantic 安装失败 | 确保 Python >= 3.8，使用 `pip install pydantic` |
| 类型提示报错但能运行 | 类型提示是"建议"不是强制，用 Pylance 检查 |
| 嵌套数据结构看不懂 | 从内往外读：先理解最内层的类型 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| 列表 list | 有序可变序列 | 可编辑的"购物清单" |
| 字典 dict | 键值对映射 | 快速查找的"通讯录" |
| 元组 tuple | 有序不可变序列 | 不能修改的"快递单号" |
| 集合 set | 无序不重复集合 | 不重复的"签到表" |
| 类型提示 | `x: int` 这样的标注 | 变量的"类型标签" |
| Pydantic | 数据验证库 | 自动检查数据是否"合格" |
| TypedDict | 字典的类型提示 | 给字典也贴"类型标签" |
| 推导式 | `[x for x in ...]` | 一行代码完成"循环+创建" |
| Optional | `Optional[str]` | 表示"可以是 str 或 None" |
| Field | Pydantic 的字段配置 | 给数据加上"验证规则" |

---

### ✅ 验收清单

- [ ] 能熟练使用列表的增删改查操作
- [ ] 能使用列表推导式和字典推导式
- [ ] 能区分 list/tuple/set 的使用场景
- [ ] 理解嵌套数据结构的访问方式
- [ ] 能编写带类型提示的函数
- [ ] 能用 Pydantic 定义数据模型并做验证
- [ ] 运行了所有代码区的示例代码

---

### 📝 复盘小纸条

> **今天哪个数据结构我用得最多？**
>
> 
>
> **类型提示对我的代码有帮助吗？体现在哪里？**
>
> 
>
> **Pydantic 的数据验证解决了什么问题？**
>
> 

---

### 📥 明日同步接口

- 输入：Python 基础 + 数据结构已掌握
- 输出：准备进行周复盘和环境检查
- 关键交接物：能使用列表、字典、类型提示和 Pydantic

---

## 📅 Day 7：周复盘 + 环境检查清单

### 🧭 今日方向
回顾 Phase 0 的全部内容，确保环境就绪、知识扎实，为 Phase 1 做好万全准备。

### 🎯 生活比喻
登山之前要检查装备：绳子够不够结实？水带够了没？今天的复盘就是"装备检查"。

### 📋 今日三件事
1. 回顾本周 6 天的所有学习内容
2. 完成环境检查清单
3. 在 Obsidian 中写下本周复盘笔记

---

### 🗺️ 手把手路线

#### 第一步：回顾知识

**做什么**：打开 Obsidian 知识库，快速翻阅本周创建的所有笔记。

**为什么**：复习是学习之母，快速回顾能巩固记忆。

**成功标志**：对每个概念都能想起大概含义。

---

#### 第二步：环境检查

**做什么**：逐项运行下方检查脚本。

**为什么**：Phase 1 会涉及更多依赖，提前发现环境问题。

**成功标志**：所有检查项显示 ✅。

---

#### 第三步：写下复盘

**做什么**：在 Obsidian 中创建本周复盘笔记，回答下方的复盘问题。

**为什么**：输出倒逼输入，写下来才是真正的掌握。

**成功标志**：完成一篇完整的周复盘笔记。

---

### 💻 代码区：环境检查脚本

```python
# env_check.py —— Phase 0 环境检查清单
import sys
import os
import subprocess

def check(name: str, command: str = None, func=None) -> bool:
    """
    执行一项检查并打印结果
    
    参数:
        name: 检查项名称
        command: 要执行的终端命令
        func: 自定义检查函数
    返回:
        是否通过
    """
    try:
        if func:
            result = func()
        elif command:
            result = subprocess.run(
                command, shell=True, capture_output=True, text=True, timeout=10
            )
            result = result.returncode == 0
        else:
            result = True
        
        status = "✅" if result else "❌"
        print(f"  {status} {name}")
        return result
    except Exception as e:
        print(f"  ❌ {name} (错误: {e})")
        return False

def main():
    print("=" * 50)
    print("  Phase 0 环境检查清单")
    print("=" * 50)
    
    passed = 0
    total = 0
    
    # Python 环境
    print("\n🐍 Python 环境:")
    total += 1
    if check("Python 版本 >= 3.11", func=lambda: sys.version_info >= (3, 11)):
        passed += 1
    total += 1
    if check("pip 可用", command="pip --version"):
        passed += 1
    
    # Git
    print("\n📦 Git:")
    total += 1
    if check("Git 已安装", command="git --version"):
        passed += 1
    
    # 项目结构
    print("\n📁 项目结构:")
    project_dirs = ["docs", "src", "tests"]
    for d in project_dirs:
        total += 1
        if check(f"目录 {d}/ 存在", func=lambda d=d: os.path.isdir(d)):
            passed += 1
    
    total += 1
    if check("CLAUDE.md 存在", func=lambda: os.path.isfile("CLAUDE.md")):
        passed += 1
    
    # 关键依赖
    print("\n📚 关键依赖:")
    dependencies = ["pydantic", "fastapi"]
    for dep in dependencies:
        total += 1
        if check(f"{dep} 已安装", command=f"pip show {dep}"):
            passed += 1
    
    # 总结
    print("\n" + "=" * 50)
    print(f"  结果: {passed}/{total} 项通过")
    if passed == total:
        print("  🎉 所有检查通过！准备进入 Phase 1！")
    else:
        print(f"  ⚠️  有 {total - passed} 项未通过，请修复后重试。")
    print("=" * 50)

if __name__ == "__main__":
    main()
```

---

### 🆘 急救包

| 问题 | 解决方案 |
|------|----------|
| 某个检查未通过 | 根据错误信息，回到对应 Day 的文档重新配置 |
| 不确定某个工具版本 | 在终端运行对应命令的 `--version` 参数 |
| 忘记某个概念 | 在 Obsidian 中搜索相关笔记 |

---

### 📖 概念对照表

| 术语 | 含义 | 一句话理解 |
|------|------|-----------|
| 复盘 | 回顾总结经验教训 | "打完仗复盘战术" |
| 环境检查 | 验证所有工具安装正确 | "出发前检查装备" |
| 依赖 | 项目需要的第三方包 | "盖房子需要的材料" |
| 版本兼容性 | 工具之间的版本匹配 | "零件之间的配合" |

---

### ✅ 验收清单

- [ ] 回顾了本周所有学习笔记
- [ ] 环境检查脚本所有项通过
- [ ] 在 Obsidian 中创建了周复盘笔记
- [ ] 能用自己的话总结 Phase 0 的核心收获
- [ ] 对 Phase 1 的内容有了初步了解

---

### 📝 复盘小纸条

> **Phase 0 最大的收获是什么？**
>
> 
>
> **哪些内容还需要巩固？**
>
> 
>
> **我对 Phase 1 的期待是什么？**
>
> 

---

### 📥 明日同步接口

- 输入：Phase 0 全部完成，环境就绪
- 输出：正式进入 Phase 1 Week 1 学习
- 关键交接物：稳定的开发环境 + 完善的笔记系统 + 扎实的 Python 基础
