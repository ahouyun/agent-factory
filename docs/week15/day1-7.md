# 📅 Week 15：项目实战第 2 周 - 功能开发与迭代

## 🧭 本周方向
> 在第 1 周的基础上，完成功能开发、集成测试和第一轮迭代。

## 🎯 生活比喻
> 第 2 周就像房子的主体施工阶段。地基已经打好（核心架构），现在要砌墙、封顶、安装门窗（完成功能）。到周末，你应该有一个可以"入住"的房子（可使用的系统），虽然装修还没完成（细节优化）。

## 📋 本周目标
1. 完成所有核心功能开发
2. 实现完整的用户界面
3. 完成集成测试
4. 进行第一轮用户反馈收集

## 🗺️ 每日计划

### Day 1：功能模块 A 开发
- 实现第一个核心功能模块
- 编写单元测试
- 代码审查

### Day 2：功能模块 B 开发
- 实现第二个核心功能模块
- 与模块 A 集成
- 编写集成测试

### Day 3：功能模块 C 开发
- 实现第三个核心功能模块
- 完成所有核心功能
- 端到端测试

### Day 4：用户界面开发
- 实现 Web UI
- 添加交互逻辑
- 前端测试

### Day 5：集成与联调
- 前后端联调
- API 测试
- 性能测试

### Day 6：第一轮迭代
- 收集反馈
- 修复 bug
- 优化体验

### Day 7：本周复盘
- 代码审查
- 文档更新
- 下周规划

## 💻 代码示例：功能迭代

```python
"""
功能迭代开发示例
"""
from dataclasses import dataclass
from typing import List, Dict
from datetime import datetime

@dataclass
class Feature:
    name: str
    description: str
    status: str  # planned, in_progress, completed
    priority: int  # 1-5
    estimated_hours: int
    actual_hours: int = 0

class SprintBoard:
    """迭代看板"""
    
    def __init__(self, sprint_name: str):
        self.sprint_name = sprint_name
        self.features: List[Feature] = []
    
    def add_feature(self, feature: Feature):
        self.features.append(feature)
    
    def update_status(self, feature_name: str, status: str, hours: int = 0):
        for feature in self.features:
            if feature.name == feature_name:
                feature.status = status
                feature.actual_hours = hours
                break
    
    def get_progress(self) -> Dict:
        total = len(self.features)
        completed = sum(1 for f in self.features if f.status == "completed")
        in_progress = sum(1 for f in self.features if f.status == "in_progress")
        
        return {
            "sprint": self.sprint_name,
            "total_features": total,
            "completed": completed,
            "in_progress": in_progress,
            "progress_pct": completed / max(total, 1) * 100
        }

# 使用示例
sprint = SprintBoard("Week 15 - Sprint 1")

sprint.add_feature(Feature("核心推理引擎", "实现 LLM 推理", "completed", 1, 16, 14))
sprint.add_feature(Feature("工具集成", "集成外部工具", "completed", 2, 12, 15))
sprint.add_feature(Feature("Web UI", "用户界面", "in_progress", 2, 20, 0))
sprint.add_feature(Feature("API 接口", "RESTful API", "planned", 3, 8, 0))

progress = sprint.get_progress()
print(f"迭代: {progress['sprint']}")
print(f"进度: {progress['completed']}/{progress['total_features']} ({progress['progress_pct']:.0f}%)")
```

## 📊 本周进度追踪

```python
"""
进度追踪模板
"""
import json
from datetime import datetime

def create_weekly_report(week: int, tasks: List[Dict]) -> str:
    """创建周报"""
    completed = [t for t in tasks if t["status"] == "completed"]
    in_progress = [t for t in tasks if t["status"] == "in_progress"]
    blocked = [t for t in tasks if t["status"] == "blocked"]
    
    report = f"""
Week {week} 进度报告
==================

完成任务: {len(completed)}
进行中: {len(in_progress)}
阻塞: {len(blocked)}

已完成:
"""
    for task in completed:
        report += f"  ✓ {task['name']}\n"
    
    report += "\n进行中:\n"
    for task in in_progress:
        report += f"  ○ {task['name']}\n"
    
    if blocked:
        report += "\n阻塞:\n"
        for task in blocked:
            report += f"  ✗ {task['name']}: {task.get('blocker', '未知原因')}\n"
    
    return report
```

## ✅ 本周验收清单
- [ ] 所有核心功能开发完成
- [ ] 用户界面可用
- [ ] 集成测试通过
- [ ] 收集到用户反馈
- [ ] 完成第一轮迭代
- [ ] 文档更新

## 📝 复盘小纸条
- 本周最大收获: ...
- 遇到的主要挑战: ...
- 用户反馈要点: ...
- 下周重点: ...
