# Week 0 Day 6: Python 数据结构 + 类型提示

> 今天我们将学习 Python 的进阶数据操作（推导式、f-string 高级用法）和类型提示系统。这些是写出现代、专业 Python 代码的关键技能。

---

## 一、准备工作

```powershell
# 激活虚拟环境
cd D:\claude-workspace\agent-factory
venv\Scripts\activate

# 创建今天的练习文件
code day6_practice.py
```

---

## 二、列表推导式

列表推导式是 Python 最优雅的特性之一，可以用一行代码替代多行循环。

### 2.1 基本语法

```python
# 传统写法：创建偶数平方列表
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
squares = []
for num in numbers:
    if num % 2 == 0:
        squares.append(num ** 2)
print(squares)  # [4, 16, 36, 64, 100]

# 推导式写法（一行搞定）
squares = [num ** 2 for num in numbers if num % 2 == 0]
print(squares)  # [4, 16, 36, 64, 100]

# 语法: [表达式 for 变量 in 可迭代对象 if 条件]
```

### 2.2 实用示例

```python
# 提取字符串中的数字
text = "abc123def456"
digits = [char for char in text if char.isdigit()]
print(digits)  # ['1', '2', '3', '4', '5', '6']
print("".join(digits))  # "123456"

# 将字符串列表转为小写
names = ["Alice", "Bob", "Charlie"]
lower_names = [name.lower() for name in names]
print(lower_names)  # ['alice', 'bob', 'charlie']

# 过滤并转换
scores = [85, 42, 92, 55, 78, 30, 96]
passed = [score for score in scores if score >= 60]
print(f"及格成绩: {passed}")  # [85, 92, 78, 96]
print(f"及格人数: {len(passed)}")  # 4

# 嵌套推导式（展平二维列表）
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [num for row in matrix for num in row]
print(flat)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

---

## 三、字典推导式

```python
# 基本字典推导式
names = ["张三", "李四", "王五"]
scores = [85, 92, 78]

name_score = {name: score for name, score in zip(names, scores)}
print(name_score)  # {'张三': 85, '李四': 92, '王五': 78}

# 反转字典
reversed_dict = {score: name for name, score in name_score.items()}
print(reversed_dict)  # {85: '张三', 92: '李四', 78: '王五'}

# 条件过滤
high_scores = {name: score for name, score in name_score.items() if score >= 80}
print(f"高分同学: {high_scores}")  # {'张三': 85, '李四': 92}

# 字符串长度统计
words = ["hello", "world", "python", "ai"]
lengths = {word: len(word) for word in words}
print(lengths)  # {'hello': 5, 'world': 5, 'python': 6, 'ai': 2}
```

---

## 四、集合操作

```python
# 集合去重
numbers = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
unique = set(numbers)
print(f"去重: {unique}")  # {1, 2, 3, 4}
print(f"元素个数: {len(unique)}")  # 4

# 集合运算
python_students = {"张三", "李四", "王五", "赵六"}
java_students = {"李四", "王五", "钱七", "孙八"}

# 同时学两种语言
both = python_students & java_students  # 交集
print(f"同时学: {both}")  # {'李四', '王五'}

# 只学了 Python
python_only = python_students - java_students  # 差集
print(f"只学 Python: {python_only}")  # {'张三', '赵六'}

# 至少学了一种
all_students = python_students | java_students  # 并集
print(f"所有人: {all_students}")

# 只学了一种（不是两种都学）
exclusive = python_students ^ java_students  # 对称差集
print(f"只学一种: {exclusive}")
```

---

## 五、f-string 高级用法

f-string 是 Python 3.6+ 引入的字符串格式化方式，非常强大。

```python
# 基本用法
name = "张三"
age = 25
print(f"我叫{name}，今年{age}岁")

# 表达式
print(f"明年{age + 1}岁")  # 明年26岁
print(f"{'成年' if age >= 18 else '未成年'}")  # 成年

# 格式化数字
pi = 3.14159265
print(f"保留两位小数: {pi:.2f}")  # 3.14
print(f"百分比: {0.856:.1%}")     # 85.6%
print(f"千分位: {1234567:,}")     # 1,234,567
print(f"科学计数法: {1234567:.2e}")  # 1.23e+06

# 对齐和填充
items = [("苹果", 5), ("香蕉", 12), ("橙子", 100)]
for name, count in items:
    print(f"{name:>5}: {'#' * count}")
# 苹果: #####
# 香蕉: ############
#  橙子: ####################################################################################################

# 多行 f-string
data = {"name": "张三", "age": 25, "city": "北京"}
info = (
    f"姓名: {data['name']}\n"
    f"年龄: {data['age']}\n"
    f"城市: {data['city']}"
)
print(info)
```

---

## 六、类型提示（Type Hints）

类型提示不会影响代码运行，但它能让代码更清晰，IDE 也能提供更好的自动补全和错误检查。

### 6.1 基本类型提示

```python
# 变量类型提示
name: str = "张三"
age: int = 25
height: float = 1.75
is_student: bool = True

# 函数类型提示
def add(a: int, b: int) -> int:
    """两数相加"""
    return a + b

def greet(name: str) -> str:
    """打招呼"""
    return f"Hello, {name}!"

# 无返回值的函数用 -> None
def print_hello() -> None:
    print("Hello")
```

### 6.2 复杂类型提示

```python
from typing import Optional, Union

# 列表类型
def process_numbers(numbers: list[int]) -> list[int]:
    """处理数字列表"""
    return [num * 2 for num in numbers]

# Python 3.9+ 可以直接用 list、dict 等小写形式
# Python 3.8 及以下需要 from typing import List, Dict

# 字典类型
def create_mapping(keys: list[str], values: list[int]) -> dict[str, int]:
    """创建键值映射"""
    return {k: v for k, v in zip(keys, values)}

# 可选类型（值可能是 None）
def find_user(user_id: int) -> Optional[dict]:
    """查找用户，找不到返回 None"""
    users = {1: {"name": "张三"}, 2: {"name": "李四"}}
    return users.get(user_id)

# 联合类型（值可以是多种类型之一）
def process_value(value: Union[int, str]) -> str:
    """处理不同类型的数据"""
    if isinstance(value, int):
        return f"数字: {value}"
    return f"字符串: {value}"

# Python 3.10+ 可以用 | 代替 Union
def process_value_v2(value: int | str) -> str:
    if isinstance(value, int):
        return f"数字: {value}"
    return f"字符串: {value}"
```

### 6.3 函数类型

```python
from typing import Callable

# 函数作为参数
def apply(func: Callable[[int, int], int], a: int, b: int) -> int:
    """将函数应用到两个参数"""
    return func(a, b)

def add(x: int, y: int) -> int:
    return x + y

def multiply(x: int, y: int) -> int:
    return x * y

print(apply(add, 3, 5))       # 8
print(apply(multiply, 3, 5))  # 15
```

---

## 七、dataclass 数据类

`@dataclass` 装饰器能自动生成 `__init__`、`__repr__`、`__eq__` 等方法，大幅简化类的定义。

```python
from dataclasses import dataclass, field


@dataclass
class Student:
    """学生数据类"""
    name: str
    age: int
    scores: list[float] = field(default_factory=list)

    def average(self) -> float:
        """计算平均分"""
        if not self.scores:
            return 0.0
        return sum(self.scores) / len(self.scores)


# dataclass 自动生成了 __init__，所以可以直接传参数创建
s1 = Student("张三", 20, [85, 92, 78])
s2 = Student("李四", 22, [90, 88, 95])

# 自动生成了 __repr__，print 时输出可读的信息
print(s1)  # Student(name='张三', age=20, scores=[85, 92, 78])

# 自动生成了 __eq__，可以直接比较
print(s1 == s2)  # False（name 不同）

# 使用自定义方法
print(f"{s1.name} 的平均分: {s1.average():.1f}")  # 张三 的平均分: 85.0
```

### 使用 Pydantic（进阶）

Pydantic 是一个更强大的数据验证库，常用于 API 开发。

```bash
# 先安装 pydantic
pip install pydantic
```

```python
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    """用户档案（带数据验证）"""
    name: str = Field(..., min_length=1, max_length=50)
    age: int = Field(..., ge=0, le=150)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')

    class Config:
        json_schema_extra = {
            "example": {
                "name": "张三",
                "age": 25,
                "email": "zhangsan@example.com"
            }
        }


# 正常创建
user = UserProfile(name="张三", age=25, email="zhangsan@example.com")
print(user.model_dump())  # {'name': '张三', 'age': 25, 'email': 'zhangsan@example.com'}

# Pydantic 会自动验证数据
try:
    # 名字为空字符串，会报错
    bad_user = UserProfile(name="", age=25, email="invalid")
except Exception as e:
    print(f"验证失败: {e}")

try:
    # 年龄为负数，会报错
    bad_user = UserProfile(name="张三", age=-5, email="test@example.com")
except Exception as e:
    print(f"验证失败: {e}")
```

---

## 八、enumerate 和 zip

```python
# enumerate: 同时获取索引和值
fruits = ["苹果", "香蕉", "橙子"]
for i, fruit in enumerate(fruits):
    print(f"{i + 1}. {fruit}")
# 1. 苹果
# 2. 香蕉
# 3. 橙子

# zip: 将多个列表"拉链"在一起
names = ["张三", "李四", "王五"]
ages = [25, 30, 28]
cities = ["北京", "上海", "广州"]

for name, age, city in zip(names, ages, cities):
    print(f"{name}, {age}岁, 来自{city}")
# 张三, 25岁, 来自北京
# 李四, 30岁, 来自上海
# 王五, 28岁, 来自广州
```

---

## 九、综合练习

写一个简单的学生成绩分析系统：

```python
"""
学生成绩分析系统
综合练习：推导式、字典操作、类型提示、dataclass
"""
from dataclasses import dataclass, field


@dataclass
class Student:
    """学生"""
    name: str
    scores: dict[str, float] = field(default_factory=dict)

    def add_score(self, subject: str, score: float) -> None:
        self.scores[subject] = score

    def average(self) -> float:
        if not self.scores:
            return 0.0
        return sum(self.scores.values()) / len(self.scores)

    def highest_subject(self) -> str:
        if not self.scores:
            return "无"
        return max(self.scores, key=self.scores.get)

    def lowest_subject(self) -> str:
        if not self.scores:
            return "无"
        return min(self.scores, key=self.scores.get)

    def passed_subjects(self) -> list[str]:
        return [subject for subject, score in self.scores.items() if score >= 60]


def analyze_class(students: list[Student]) -> dict:
    """分析全班成绩"""
    if not students:
        return {}

    # 用推导式计算各种统计
    averages = {s.name: s.average() for s in students}
    class_average = sum(averages.values()) / len(averages)

    # 找出最高分和最低分的学生
    best_student = max(students, key=lambda s: s.average())
    worst_student = min(students, key=lambda s: s.average())

    return {
        "班级平均分": round(class_average, 1),
        "个人平均分": averages,
        "最高分学生": best_student.name,
        "最低分学生": worst_student.name,
    }


def main():
    # 创建学生
    students = [
        Student("张三", {"数学": 85, "英语": 92, "物理": 78}),
        Student("李四", {"数学": 55, "英语": 68, "物理": 42}),
        Student("王五", {"数学": 90, "英语": 88, "物理": 95}),
    ]

    # 打印每个学生的信息
    for student in students:
        print(f"\n{student.name}:")
        print(f"  各科成绩: {student.scores}")
        print(f"  平均分: {student.average():.1f}")
        print(f"  最强科目: {student.highest_subject()}")
        print(f"  最弱科目: {student.lowest_subject()}")
        print(f"  及格科目: {student.passed_subjects()}")

    # 班级分析
    report = analyze_class(students)
    print(f"\n{'=' * 40}")
    print(f"班级平均分: {report['班级平均分']}")
    print(f"最高分学生: {report['最高分学生']}")
    print(f"最低分学生: {report['最低分学生']}")


if __name__ == "__main__":
    main()
```

**运行结果：**
```
张三:
  各科成绩: {'数学': 85, '英语': 92, '物理': 78}
  平均分: 85.0
  最强科目: 英语
  最弱科目: 物理
  及格科目: ['数学', '英语', '物理']

李四:
  各科成绩: {'数学': 55, '英语': 68, '物理': 42}
  平均分: 55.0
  最强科目: 英语
  最弱科目: 物理
  及格科目: ['英语']

王五:
  各科成绩: {'数学': 90, '英语': 88, '物理': 95}
  平均分: 91.0
  最强科目: 物理
  最弱科目: 英语
  及格科目: ['数学', '英语', '物理']

========================================
班级平均分: 77.0
最高分学生: 王五
最低分学生: 李四
```

---

## 十、今日验收清单

- [ ] 能熟练使用列表推导式
- [ ] 能熟练使用字典推导式
- [ ] 能为函数和变量添加类型提示
- [ ] 理解 Optional 和 Union 的用法
- [ ] 能使用 @dataclass 简化类定义
- [ ] 能使用 enumerate 和 zip 简化循环
- [ ] 完成综合练习并运行成功

---

## 十一、常见错误

**错误 1：推导式语法错误**
```python
# 错误: 条件放在了前面
[num for if num % 2 == 0 num in numbers]

# 正确: 条件放在最后
[num for num in numbers if num % 2 == 0]
```

**错误 2：类型提示和实际类型不匹配**
```python
def add(a: int, b: int) -> int:
    return a + b

result = add("hello", " world")  # 运行时不报错，但类型检查会警告
```

**错误 3：@dataclass 忘记导入**
```python
# 需要先导入
from dataclasses import dataclass
```

---

## 十二、今日复盘

- 推导式你觉得方便吗？哪些场景会用到？
- 类型提示对代码可读性有帮助吗？
- Pydantic 的数据验证你觉得实用吗？

---

## 十三、明日预告

明天是 Week 0 的最后一天——**周复盘 + 环境检查**。我们将回顾本周所有内容，运行完整的环境检查脚本，确保一切就绪。
