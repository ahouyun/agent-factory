# 📅 Week 0 Day 5：Python 速通（变量/函数/类/模块）

## 🧭 今日方向
> 今天我们将快速回顾 Python 的核心概念：变量、函数、类和模块。这些是后续学习 Agent 开发的基础。

## 🎯 生活比喻
> Python 就像一门语言，变量是单词，函数是句子，类是段落，模块是章节。今天我们要快速掌握这门语言的基本语法。

## 📋 今日三件事
1. 掌握 Python 变量和数据类型
2. 理解函数定义和调用
3. 学习类和面向对象编程基础

## 🗺️ 手把手路线

### Step 1: 变量和数据类型
- **做什么**: 学习 Python 的基本数据类型和变量赋值
- **为什么**: 变量是存储数据的基本单位
- **成功标志**: 能正确定义和使用不同类型的变量

### Step 2: 函数定义和调用
- **做什么**: 学习如何定义函数、传递参数、返回值
- **为什么**: 函数是代码复用的基本单位
- **成功标志**: 能编写带参数和返回值的函数

### Step 3: 类和面向对象
- **做什么**: 学习类的定义、属性、方法
- **为什么**: 面向对象是 Python 的核心编程范式
- **成功标志**: 能定义类并创建对象实例

## 💻 代码区

```python
# 变量和数据类型示例

# 整数
age = 25
print(f"年龄: {age}, 类型: {type(age)}")

# 浮点数
height = 1.75
print(f"身高: {height}, 类型: {type(height)}")

# 字符串
name = "张三"
print(f"姓名: {name}, 类型: {type(name)}")

# 布尔值
is_student = True
print(f"是否学生: {is_student}, 类型: {type(is_student)}")

# 列表
scores = [85, 92, 78, 95]
print(f"成绩列表: {scores}, 类型: {type(scores)}")

# 字典
person = {
    "name": "李四",
    "age": 30,
    "city": "北京"
}
print(f"个人信息: {person}, 类型: {type(person)}")

# 元组（不可变列表）
coordinates = (116.404, 39.915)
print(f"坐标: {coordinates}, 类型: {type(coordinates)}")

# 集合（无重复元素）
unique_numbers = {1, 2, 3, 4, 5}
print(f"唯一数字: {unique_numbers}, 类型: {type(unique_numbers)}")
```

```python
# 函数定义和调用示例

def calculate_average(numbers: list[float]) -> float:
    """
    计算数字列表的平均值
    
    Args:
        numbers: 数字列表
        
    Returns:
        平均值
    """
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)

def greet_user(name: str, greeting: str = "你好") -> str:
    """
    向用户打招呼
    
    Args:
        name: 用户名
        greeting: 问候语（默认值：你好）
        
    Returns:
        问候字符串
    """
    return f"{greeting}, {name}!"

def process_data(data: dict, key: str, default=None):
    """
    安全地获取字典中的值
    
    Args:
        data: 数据字典
        key: 键名
        default: 默认值
        
    Returns:
        对应的值或默认值
    """
    return data.get(key, default)

# 测试函数
if __name__ == "__main__":
    # 测试平均值计算
    scores = [85, 92, 78, 95, 88]
    avg = calculate_average(scores)
    print(f"成绩平均值: {avg:.2f}")
    
    # 测试问候函数
    print(greet_user("小明"))
    print(greet_user("小红", "早上好"))
    
    # 测试数据处理
    user_info = {"name": "王五", "age": 28}
    print(process_data(user_info, "name"))
    print(process_data(user_info, "email", "未提供"))
```

```python
# 类和面向对象示例

class Student:
    """学生类"""
    
    def __init__(self, name: str, age: int, scores: list[float] = None):
        """
        初始化学生对象
        
        Args:
            name: 姓名
            age: 年龄
            scores: 成绩列表（可选）
        """
        self.name = name
        self.age = age
        self.scores = scores or []
    
    def add_score(self, score: float):
        """添加成绩"""
        self.scores.append(score)
    
    def get_average(self) -> float:
        """获取平均成绩"""
        if not self.scores:
            return 0.0
        return sum(self.scores) / len(self.scores)
    
    def is_passing(self, threshold: float = 60.0) -> bool:
        """判断是否及格"""
        return self.get_average() >= threshold
    
    def __str__(self) -> str:
        """字符串表示"""
        return f"学生: {self.name}, 年龄: {self.age}, 平均分: {self.get_average():.1f}"

# 继承示例
class GraduateStudent(Student):
    """研究生类，继承自学生类"""
    
    def __init__(self, name: str, age: int, research_topic: str, scores: list[float] = None):
        """
        初始化研究生对象
        
        Args:
            name: 姓名
            age: 年龄
            research_topic: 研究课题
            scores: 成绩列表（可选）
        """
        super().__init__(name, age, scores)
        self.research_topic = research_topic
    
    def __str__(self) -> str:
        """字符串表示"""
        return f"研究生: {self.name}, 课题: {self.research_topic}, 平均分: {self.get_average():.1f}"

# 测试类
if __name__ == "__main__":
    # 创建学生对象
    student1 = Student("张三", 20, [85, 92, 78])
    student1.add_score(95)
    print(student1)
    print(f"是否及格: {student1.is_passing()}")
    
    # 创建研究生对象
    grad_student = GraduateStudent("李四", 25, "AI Agent 研究", [90, 88, 92])
    print(grad_student)
```

```python
# 模块导入示例

# 标准库模块
import os
import sys
from datetime import datetime, timedelta
from collections import defaultdict, Counter

# 第三方模块（需要安装）
# import requests
# import pandas as pd

# 本地模块
# from src.agent_factory import main

def demonstrate_modules():
    """演示模块的使用"""
    
    # os 模块：操作系统相关功能
    current_dir = os.getcwd()
    print(f"当前目录: {current_dir}")
    
    # sys 模块：Python 解释器相关
    print(f"Python 版本: {sys.version}")
    
    # datetime 模块：日期时间处理
    now = datetime.now()
    print(f"当前时间: {now}")
    
    tomorrow = now + timedelta(days=1)
    print(f"明天时间: {tomorrow}")
    
    # collections 模块：高级数据结构
    words = ["apple", "banana", "apple", "orange", "banana", "apple"]
    word_count = Counter(words)
    print(f"单词计数: {word_count}")
    
    # defaultdict：带默认值的字典
    groups = defaultdict(list)
    students = [("A", "张三"), ("B", "李四"), ("A", "王五")]
    for group, name in students:
        groups[group].append(name)
    print(f"分组: {dict(groups)}")

if __name__ == "__main__":
    demonstrate_modules()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 变量未定义错误 | 确保变量在使用前已定义 |
| 2 | 函数参数错误 | 检查函数签名，确保参数类型和数量正确 |
| 3 | 类属性访问错误 | 确保使用 `self.属性名` 访问实例属性 |
| 4 | 模块导入失败 | 检查模块是否安装，导入路径是否正确 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| 变量 | 存储数据的命名空间 |
| 函数 | 可重用的代码块 |
| 类 | 创建对象的蓝图 |
| 模块 | 包含 Python 代码的文件 |
| 实例 | 类创建的具体对象 |
| 方法 | 类中的函数 |
| 继承 | 子类继承父类的属性和方法 |

## ✅ 验收清单
- [ ] 能正确定义和使用各种数据类型
- [ ] 能编写带参数和返回值的函数
- [ ] 能定义类并创建对象实例
- [ ] 理解模块导入的基本方法

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
