# 📅 Week 0 Day 4：Obsidian 知识库搭建

## 🧭 今日方向
> 今天我们将搭建 Obsidian 知识库，用于记录学习笔记、整理知识体系。好的知识管理工具能让学习事半功倍。

## 🎯 生活比喻
> 学习就像收集散落的珍珠，Obsidian 就是那根能把珍珠串成项链的线。今天我们要学会如何用 Obsidian 把零散的知识点连接成完整的知识网络。

## 📋 今日三件事
1. 安装并配置 Obsidian
2. 创建 Agent Factory 学习笔记模板
3. 建立知识链接体系

## 🗺️ 手把手路线

### Step 1: 安装 Obsidian
- **做什么**: 从 obsidian.md 下载并安装 Obsidian
- **为什么**: Obsidian 是强大的知识管理工具，支持双向链接
- **成功标志**: 能成功创建新的 Vault（知识库）

### Step 2: 创建学习 Vault
- **做什么**: 创建 Agent Factory 学习 Vault，设计目录结构
- **为什么**: 专门的 Vault 让学习内容井然有序
- **成功标志**: Vault 结构清晰，包含必要的模板文件

### Step 3: 建立笔记模板
- **做什么**: 创建每日学习笔记模板
- **为什么**: 模板能确保笔记格式统一，节省时间
- **成功标志**: 能使用模板快速创建新笔记

## 💻 代码区

```markdown
# Obsidian Vault 目录结构

```
agent-factory-vault/
├── 00-学习路线/
│   ├── Week 0 基础准备.md
│   ├── Week 1 Python+HTTP.md
│   ├── Week 2 FastAPI.md
│   ├── Week 3 LLM基础.md
│   └── Week 4 Agent范式.md
├── 01-每日笔记/
│   ├── Templates/
│   │   └── 每日学习模板.md
│   └── 2024/
│       ├── 01/
│       │   └── 2024-01-01.md
├── 02-概念笔记/
│   ├── Python基础.md
│   ├── HTTP协议.md
│   ├── 大模型API.md
│   └── Agent概念.md
├── 03-代码片段/
│   ├── Python常用函数.md
│   └── API调用示例.md
├── 04-复盘笔记/
│   ├── Week 0 复盘.md
│   └── Week 1 复盘.md
└── 05-资源链接/
    ├── 学习资料.md
    └── 工具链接.md
```
```

```markdown
# 每日学习模板（保存为 Templates/每日学习模板.md）

---

date: {{date}}
week: 
day: 
topic: 
status: "进行中"
tags: [学习, Agent, {{date}}]
---

# 📅 {{date}} 学习笔记

## 🎯 今日目标
> [!tip] 目标
> 

## 📝 学习内容
### 知识点1
> [!info] 说明
> 

### 知识点2
> [!info] 说明
> 

## 💻 代码实践
```python
# 代码示例
```

## 🔗 相关链接
- [[概念1]]
- [[概念2]]

## ❓ 问题与思考
> [!question] 待解决
> 

## ✅ 今日完成
- [ ] 任务1
- [ ] 任务2

## 📊 学习进度
| 项目 | 状态 | 备注 |
|------|------|------|
| 理论学习 | ✅ | |
| 代码实践 | ✅ | |
| 笔记整理 | ✅ | |

## 📝 复盘
> [!summary] 今日收获
> 

> [!warning] 待改进
> 
```

```python
# Obsidian 批量创建笔记脚本
import os
from datetime import datetime, timedelta

def create_obsidian_structure(vault_path: str):
    """创建 Obsidian Vault 目录结构"""
    directories = [
        "00-学习路线",
        "01-每日笔记/Templates",
        "02-概念笔记",
        "03-代码片段",
        "04-复盘笔记",
        "05-资源链接"
    ]
    
    for directory in directories:
        full_path = os.path.join(vault_path, directory)
        os.makedirs(full_path, exist_ok=True)
        print(f"✅ 创建目录: {directory}")

def create_weekly_plan(vault_path: str):
    """创建周计划笔记"""
    weeks = [
        "Week 0 基础准备",
        "Week 1 Python+HTTP",
        "Week 2 FastAPI",
        "Week 3 LLM基础",
        "Week 4 Agent范式"
    ]
    
    for i, week in enumerate(weeks):
        filename = os.path.join(vault_path, "00-学习路线", f"{week}.md")
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"# {week}\n\n")
            f.write("## 学习目标\n")
            f.write("- [ ] 目标1\n")
            f.write("- [ ] 目标2\n\n")
            f.write("## 每日计划\n")
            for day in range(1, 8):
                f.write(f"- Day {day}: \n")
        print(f"✅ 创建周计划: {week}")

if __name__ == "__main__":
    vault_path = "agent-factory-vault"
    create_obsidian_structure(vault_path)
    create_weekly_plan(vault_path)
    print("\n🎉 Obsidian Vault 创建完成！")
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | Obsidian 打不开 Vault | 检查路径是否正确，确保有读写权限 |
| 2 | 双向链接不生效 | 确保使用 `[[]]` 语法，文件名正确 |
| 3 | 模板变量不替换 | 检查模板语法，确保使用 `{{变量}}` 格式 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Obsidian | 基于 Markdown 的知识管理工具 |
| Vault | Obsidian 中的知识库，包含所有笔记 |
| 双向链接 | 用 `[[]]` 创建笔记间的相互引用 |
| 标签 | 用 `#标签` 对笔记进行分类 |
| 模板 | 预定义的笔记格式，可重复使用 |

## ✅ 验收清单
- [ ] Obsidian 安装成功并能创建 Vault
- [ ] Vault 目录结构完整合理
- [ ] 能使用模板创建新笔记
- [ ] 理解双向链接的用法

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
