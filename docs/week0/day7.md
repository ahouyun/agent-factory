# 📅 Week 0 Day 7：周复盘 + 环境检查清单

## 🧭 今日方向
> 今天是 Week 0 的最后一天，我们将回顾本周的学习内容，检查环境配置，为下周的学习做好准备。

## 🎯 生活比喻
> 就像马拉松比赛前的热身，今天我们要检查装备、调整状态，确保下周的正式学习能够顺利进行。

## 📋 今日三件事
1. 回顾 Week 0 的学习内容
2. 执行完整的环境检查
3. 制定下周的学习计划

## 🗺️ 手把手路线

### Step 1: 回顾学习内容
- **做什么**: 整理本周的学习笔记，总结关键知识点
- **为什么**: 复盘是巩固学习的重要环节
- **成功标志**: 能清晰地讲述本周学到的内容

### Step 2: 环境检查
- **做什么**: 运行环境检查脚本，确保所有工具正常工作
- **为什么**: 良好的环境是顺利学习的前提
- **成功标志**: 所有检查项目都通过

### Step 3: 制定下周计划
- **做什么**: 根据本周学习情况，调整下周的学习计划
- **为什么**: 计划让学习更有方向性
- **成功标志**: 有明确的学习目标和时间安排

## 💻 代码区

```python
# 环境检查脚本
import subprocess
import sys
import os
from pathlib import Path

def check_python_environment():
    """检查 Python 环境"""
    print("🐍 Python 环境检查")
    print("-" * 40)
    
    # 检查 Python 版本
    version = sys.version_info
    if version.major >= 3 and version.minor >= 10:
        print(f"✅ Python 版本: {version.major}.{version.minor}.{version.micro}")
    else:
        print(f"❌ Python 版本过低: {version.major}.{version.minor}.{version.micro}")
        return False
    
    # 检查 pip
    try:
        result = subprocess.run([sys.executable, "-m", "pip", "--version"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ pip 已安装")
        else:
            print("❌ pip 未安装")
            return False
    except Exception as e:
        print(f"❌ pip 检查失败: {e}")
        return False
    
    return True

def check_development_tools():
    """检查开发工具"""
    print("\n🛠️ 开发工具检查")
    print("-" * 40)
    
    tools = [
        ("git", "Git"),
        ("code", "VS Code"),
        ("python", "Python"),
    ]
    
    all_ok = True
    for tool, name in tools:
        try:
            result = subprocess.run([tool, "--version"], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                version = result.stdout.split('\n')[0] if result.stdout else "已安装"
                print(f"✅ {name}: {version}")
            else:
                print(f"❌ {name}: 未安装或未在 PATH 中")
                all_ok = False
        except FileNotFoundError:
            print(f"❌ {name}: 未安装")
            all_ok = False
    
    return all_ok

def check_project_structure():
    """检查项目结构"""
    print("\n📁 项目结构检查")
    print("-" * 40)
    
    required_dirs = [
        "src/agent_factory",
        "tests",
        "docs",
        "scripts",
        "data",
        "logs"
    ]
    
    required_files = [
        "src/agent_factory/__init__.py",
        "src/agent_factory/main.py",
        "tests/__init__.py",
        "CLAUDE.md",
        "README.md",
        ".gitignore",
        "requirements.txt"
    ]
    
    all_ok = True
    
    # 检查目录
    for dir_path in required_dirs:
        if os.path.exists(dir_path):
            print(f"✅ 目录: {dir_path}")
        else:
            print(f"❌ 目录缺失: {dir_path}")
            all_ok = False
    
    # 检查文件
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ 文件: {file_path}")
        else:
            print(f"❌ 文件缺失: {file_path}")
            all_ok = False
    
    return all_ok

def check_git_repository():
    """检查 Git 仓库"""
    print("\n📦 Git 仓库检查")
    print("-" * 40)
    
    try:
        # 检查是否是 Git 仓库
        result = subprocess.run(["git", "status"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ 是有效的 Git 仓库")
            
            # 检查提交历史
            result = subprocess.run(["git", "log", "--oneline", "-5"], 
                                  capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip():
                print(f"✅ 提交历史: {len(result.stdout.strip().split(chr(10)))} 个提交")
            else:
                print("⚠️ 暂无提交历史")
        else:
            print("❌ 不是 Git 仓库")
            return False
    except Exception as e:
        print(f"❌ Git 检查失败: {e}")
        return False
    
    return True

def run_comprehensive_check():
    """运行综合检查"""
    print("🔍 Agent Factory 环境综合检查")
    print("=" * 50)
    
    checks = [
        ("Python 环境", check_python_environment),
        ("开发工具", check_development_tools),
        ("项目结构", check_project_structure),
        ("Git 仓库", check_git_repository),
    ]
    
    results = []
    for check_name, check_func in checks:
        print(f"\n📋 {check_name}")
        try:
            result = check_func()
            results.append((check_name, result))
        except Exception as e:
            print(f"❌ {check_name} 检查出错: {e}")
            results.append((check_name, False))
    
    # 汇总结果
    print("\n" + "=" * 50)
    print("📊 检查结果汇总")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for check_name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{check_name}: {status}")
    
    print(f"\n总计: {passed}/{total} 项通过")
    
    if passed == total:
        print("\n🎉 恭喜！环境配置完整，可以开始学习了！")
    else:
        print("\n⚠️ 部分检查未通过，请根据上述提示进行修复")
    
    return passed == total

if __name__ == "__main__":
    run_comprehensive_check()
```

```python
# Week 0 复盘脚本
import json
from datetime import datetime

def create_week_review():
    """创建 Week 0 复盘报告"""
    
    review_data = {
        "week": 0,
        "title": "基础准备",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "learning_goals": [
            "理解 Agent Factory 学习路线",
            "搭建基础开发环境",
            "掌握 Python 基础知识"
        ],
        "completed_tasks": [
            "安装 Git、VS Code、Python",
            "配置 Claude Code / Codex CLI",
            "创建项目仓库和 CLAUDE.md",
            "搭建 Obsidian 知识库",
            "复习 Python 基础语法",
            "学习类型提示系统"
        ],
        "key_concepts": [
            "版本控制 (Git)",
            "AI 辅助编程",
            "项目结构",
            "Python 数据类型",
            "函数和类",
            "类型提示"
        ],
        "challenges": [
            "环境配置问题",
            "工具使用不熟练",
            "Python 语法生疏"
        ],
        "next_week_plan": {
            "week": 1,
            "title": "Python + HTTP",
            "goals": [
                "掌握虚拟环境和包管理",
                "学习 HTTP 协议和 requests",
                "调用大模型 API"
            ]
        }
    }
    
    # 生成 Markdown 报告
    md_content = f"""# 📅 Week 0 复盘报告

## 📊 学习概览
- **周次**: Week {review_data['week']} - {review_data['title']}
- **日期**: {review_data['date']}

## 🎯 学习目标
"""
    for goal in review_data['learning_goals']:
        md_content += f"- {goal}\n"
    
    md_content += "\n## ✅ 完成任务\n"
    for task in review_data['completed_tasks']:
        md_content += f"- {task}\n"
    
    md_content += "\n## 🧠 核心概念\n"
    for concept in review_data['key_concepts']:
        md_content += f"- {concept}\n"
    
    md_content += "\n## 😅 遇到的挑战\n"
    for challenge in review_data['challenges']:
        md_content += f"- {challenge}\n"
    
    md_content += f"""
## 🚀 下周计划
### Week {review_data['next_week_plan']['week']} - {review_data['next_week_plan']['title']}
**学习目标**:
"""
    for goal in review_data['next_week_plan']['goals']:
        md_content += f"- {goal}\n"
    
    md_content += """
## 💡 经验总结
1. **环境配置**: 确保所有工具版本兼容
2. **学习方法**: 理论与实践相结合
3. **时间管理**: 每天安排固定学习时间
4. **知识管理**: 使用 Obsidian 记录和整理笔记

## 📝 下周改进建议
- 提前预习下周内容
- 增加代码实践时间
- 及时记录问题和解决方案
"""
    
    return md_content, review_data

if __name__ == "__main__":
    # 生成复盘报告
    md_content, review_data = create_week_review()
    
    # 保存报告
    with open("week0_review.md", "w", encoding="utf-8") as f:
        f.write(md_content)
    
    # 保存 JSON 数据
    with open("week0_review.json", "w", encoding="utf-8") as f:
        json.dump(review_data, f, ensure_ascii=False, indent=2)
    
    print("✅ Week 0 复盘报告已生成")
    print("📄 Markdown 报告: week0_review.md")
    print("📊 JSON 数据: week0_review.json")
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 环境检查失败 | 根据错误提示安装缺失的工具 |
| 2 | 项目结构不完整 | 参考 Day 3 的项目结构脚本重新创建 |
| 3 | Git 仓库有问题 | 重新初始化或修复 `.git` 目录 |
| 4 | 复盘不知道写什么 | 回顾每天的学习笔记，提取关键点 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| 复盘 | 回顾总结，找出成功经验和改进点 |
| 环境检查 | 验证开发工具和配置是否正确 |
| 学习路线 | 系统化的学习计划和路径 |
| 知识管理 | 整理、存储和检索知识的方法 |

## ✅ 验收清单
- [ ] 完成环境检查，所有项目通过
- [ ] 整理 Week 0 学习笔记
- [ ] 生成复盘报告
- [ ] 制定 Week 1 学习计划

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
