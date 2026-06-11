# Week 0 Day 5: Python 速通

> 今天我们将快速学习 Python 的核心语法。每个知识点都附带完整的、可直接复制运行的代码示例。建议你打开 VS Code，新建一个 Python 文件，边看边敲边运行。

---

## 一、准备工作

在开始之前，确保：

1. 已安装 Python 3.10+
2. 已创建虚拟环境并激活
3. 打开 VS Code，进入项目目录

在终端输入以下命令来准备环境：

```powershell
# 激活虚拟环境（如果还没激活）
cd D:\claude-workspace\agent-factory
venv\Scripts\activate
```

你应该看到终端提示符前面出现 `(venv)` 前缀。

然后创建今天的练习文件：

```powershell
# 创建练习文件
New-Item -Path "day5_practice.py" -ItemType File -Force

# 用 VS Code 打开
code day5_practice.py
```

---

## 二、变量和数据类型

Python 是**动态类型语言**，变量不需要声明类型，直接赋值即可。就像给盒子贴标签——你不需要提前告诉 Python "这个盒子要装数字"，直接放进去就行。

### 2.1 数字类型

把以下代码复制到 `day5_practice.py` 中，保存后在终端运行 `python day5_practice.py`：

```python
# 整数（int）
age = 25
print(f"年龄: {age}, 类型: {type(age)}")
# 输出: 年龄: 25, 类型: <class 'int'>

# 浮点数（float）
height = 1.75
print(f"身高: {height}, 类型: {type(height)}")
# 输出: 身高: 1.75, 类型: <class 'float'>

# 大整数（Python 自动支持）
population = 1_400_000_000  # 14 亿，下划线方便阅读
print(f"人口: {population}")
# 输出: 人口: 1400000000

# 数学运算
a = 10
b = 3
print(f"加法: {a + b}")    # 13
print(f"减法: {a - b}")    # 7
print(f"乘法: {a * b}")    # 30
print(f"除法: {a / b}")    # 3.3333...（总是返回浮点数）
print(f"整除: {a // b}")   # 3
print(f"取余: {a % b}")    # 1
print(f"幂运算: {a ** b}")  # 1000
```

### 🙋 动动手

现在请你动手试试：

**练习 1**: 修改上面的代码，把自己的真实年龄赋值给 `age` 变量，然后打印出来。

**练习 2**: 尝试以下运算，猜猜输出是什么，然后运行验证：
```python
print(7 / 2)     # 除法
print(7 // 2)    # 整除
print(7 % 2)     # 取余
print(2 ** 10)   # 幂运算
```

**练习 3**: 创建一个变量 `price = 99.9`，再创建一个 `quantity = 3`，计算总价并打印：
```python
price = 99.9
quantity = 3
total = price * quantity
print(f"单价: {price}, 数量: {quantity}, 总价: {total}")
```

### 2.2 字符串（str）

```python
# 字符串定义
name = "张三"
greeting = '你好'
multiline = """这是
多行
字符串"""

# f-string 格式化（推荐方式）
age = 25
print(f"我叫{name}，今年{age}岁")
# 输出: 我叫张三，今年25岁

# 常用字符串方法
text = "Hello, World!"
print(text.lower())        # hello, world!
print(text.upper())        # HELLO, WORLD!
print(text.replace("World", "Python"))  # Hello, Python!
print(text.split(","))     # ['Hello', ' World!']
print(len(text))           # 13

# 字符串拼接
first_name = "张"
last_name = "三"
full_name = first_name + last_name
print(full_name)  # 张三

# 字符串切片
text = "Python"
print(text[0:3])   # Pyt（从索引 0 到 2）
print(text[-3:])   # hon（最后 3 个字符）
print(text[::-1])  # nohtyP（反转）
```

### 🙋 动动手

现在请你动手试试：

**练习 1**: 用 f-string 打印你自己的信息：
```python
name = "你的名字"
city = "你所在的城市"
hobby = "你的爱好"
print(f"我叫{name}，住在{city}，喜欢{hobby}")
```

**练习 2**: 尝试以下字符串操作，看看输出是什么：
```python
text = "Agent Factory"
print(text.lower())
print(text.upper())
print(text.replace("Factory", "Studio"))
print(len(text))
```

**练习 3**: 用切片获取字符串 "Python" 的前两个字符和后三个字符：
```python
text = "Python"
print(text[:2])   # 前两个字符
print(text[-3:])  # 后三个字符
```

### 2.3 布尔值（bool）

```python
is_student = True
is_graduated = False

print(f"是学生: {is_student}, 类型: {type(is_student)}")
# 输出: 是学生: True, 类型: <class 'bool'>

# 比较运算符返回布尔值
print(10 > 5)    # True
print(10 == 5)   # False
print(10 != 5)   # True
print(10 <= 5)   # False

# 逻辑运算符
print(True and False)   # False（与）
print(True or False)    # True（或）
print(not True)         # False（非）
```

### 🙋 动动手

现在请你动手试试：

**练习 1**: 创建两个布尔变量，表示你今天是否完成了作业和是否吃了早饭，然后用 `and` 运算符判断"两件事都做了吗"：
```python
did_homework = True
had_breakfast = False
print(f"两件事都做了: {did_homework and had_breakfast}")
```

**练习 2**: 猜猜以下代码的输出，然后运行验证：
```python
print(5 > 3 and 2 > 4)
print(5 > 3 or 2 > 4)
print(not (5 > 3))
```

### 2.4 None 类型

```python
# None 表示"没有值"
result = None
print(result)       # None
print(type(result))  # <class 'NoneType'>

# 判断是否为 None
if result is None:
    print("result 是空的")
# 输出: result 是空的

# 注意：不要用 == 判断 None，用 is
# 错误写法: if result == None
# 正确写法: if result is None
```

### 📝 小结（变量和数据类型）

Python 有四种基本数据类型：`int`（整数）、`float`（浮点数）、`str`（字符串）、`bool`（布尔值）。另外还有 `None` 表示"没有值"。Python 是动态类型语言，变量不需要声明类型，直接赋值即可。用 `type()` 可以查看变量类型，用 `is None` 判断空值。

---

## 三、数据结构

### 3.1 列表（list）—— 有序、可变

```python
# 创建列表
fruits = ["苹果", "香蕉", "橙子"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", True, 3.14]  # 可以混合类型

# 访问元素（从 0 开始计数）
print(fruits[0])    # 苹果
print(fruits[-1])   # 橙子（最后一个）

# 修改元素
fruits[0] = "草莓"
print(fruits)  # ['草莓', '香蕉', '橙子']

# 添加元素
fruits.append("葡萄")
print(fruits)  # ['草莓', '香蕉', '橙子', '葡萄']

# 删除元素
fruits.remove("香蕉")
print(fruits)  # ['草莓', '橙子', '葡萄']

# 列表长度
print(len(fruits))  # 3

# 切片
numbers = [0, 1, 2, 3, 4, 5]
print(numbers[1:4])   # [1, 2, 3]
print(numbers[:3])    # [0, 1, 2]
print(numbers[2:])    # [2, 3, 4, 5]

# 遍历列表
for fruit in fruits:
    print(f"水果: {fruit}")

# 带索引遍历
for i, fruit in enumerate(fruits):
    print(f"{i + 1}. {fruit}")
```

### 3.2 字典（dict）—— 键值对

```python
# 创建字典
person = {
    "name": "张三",
    "age": 25,
    "city": "北京"
}

# 访问值
print(person["name"])  # 张三

# 安全访问（键不存在时返回默认值）
print(person.get("email", "未提供"))  # 未提供

# 修改/添加
person["age"] = 26
person["email"] = "zhangsan@example.com"
print(person)

# 删除
del person["email"]

# 遍历字典
for key, value in person.items():
    print(f"{key}: {value}")

# 检查键是否存在
if "name" in person:
    print("person 有 name 字段")
```

### 3.3 元组（tuple）—— 有序、不可变

```python
# 创建元组
coordinates = (116.404, 39.915)
colors = ("红", "绿", "蓝")

# 访问（和列表一样）
print(coordinates[0])  # 116.404

# 不能修改
# coordinates[0] = 100  # 这会报错！

# 元组解包
x, y = coordinates
print(f"经度: {x}, 纬度: {y}")

# 交换变量（Python 特有的优雅写法）
a, b = 1, 2
a, b = b, a
print(f"a={a}, b={b}")  # a=2, b=1
```

### 3.4 集合（set）—— 无序、不重复

```python
# 创建集合
unique_numbers = {1, 2, 3, 4, 5}

# 添加元素
unique_numbers.add(6)

# 删除元素
unique_numbers.remove(3)

# 集合运算
set_a = {1, 2, 3, 4, 5}
set_b = {4, 5, 6, 7, 8}

print(f"交集: {set_a & set_b}")    # {4, 5}
print(f"并集: {set_a | set_b}")    # {1, 2, 3, 4, 5, 6, 7, 8}
print(f"差集: {set_a - set_b}")    # {1, 2, 3}

# 去重
numbers = [1, 2, 2, 3, 3, 3]
unique = list(set(numbers))
print(f"去重后: {unique}")  # [1, 2, 3]（顺序可能不同）
```

---

## 四、函数

函数是代码复用的基本单位。

### 4.1 基本函数

```python
# 无参数、无返回值
def say_hello():
    print("Hello!")

say_hello()  # 输出: Hello!


# 有参数、有返回值
def add(a: int, b: int) -> int:
    """两个数相加"""
    return a + b

result = add(3, 5)
print(f"3 + 5 = {result}")  # 3 + 5 = 8
```

### 4.2 默认参数和关键字参数

```python
# 默认参数
def greet(name: str, greeting: str = "你好") -> str:
    """向某人打招呼"""
    return f"{greeting}, {name}!"

print(greet("张三"))          # 你好, 张三!
print(greet("张三", "早上好"))  # 早上好, 张三!


# 关键字参数（调用时指定参数名）
def create_profile(name: str, age: int, city: str) -> dict:
    """创建用户档案"""
    return {"name": name, "age": age, "city": city}

# 使用关键字参数，顺序无关
profile = create_profile(city="上海", name="李四", age=30)
print(profile)  # {'name': '李四', 'age': 30, 'city': '上海'}
```

### 4.3 可变参数

```python
# *args：接收任意数量的位置参数
def total(*numbers: float) -> float:
    """计算总和"""
    return sum(numbers)

print(total(1, 2, 3))        # 6
print(total(1, 2, 3, 4, 5))  # 15


# **kwargs：接收任意数量的关键字参数
def print_info(**kwargs):
    """打印所有参数"""
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="张三", age=25, city="北京")
# 输出:
# name: 张三
# age: 25
# city: 北京
```

### 4.4 Lambda 函数

```python
# Lambda 是匿名函数，适合简单的操作
square = lambda x: x ** 2
print(square(5))  # 25

# 常见用法：作为排序的 key
students = [("张三", 85), ("李四", 92), ("王五", 78)]
students.sort(key=lambda s: s[1], reverse=True)
print(students)  # [('李四', 92), ('张三', 85), ('王五', 78)]
```

---

## 五、类（面向对象编程）

### 5.1 基本类定义

```python
class Dog:
    """一只狗"""

    # 类属性（所有实例共享）
    species = "犬科"

    def __init__(self, name: str, age: int):
        """初始化方法，创建实例时自动调用"""
        self.name = name    # 实例属性
        self.age = age

    def bark(self) -> str:
        """狗叫"""
        return f"{self.name} 说: 汪汪！"

    def describe(self) -> str:
        """描述这只狗"""
        return f"{self.name}, {self.age} 岁, {self.species}"

    def __str__(self) -> str:
        """print() 时调用"""
        return f"Dog({self.name}, {self.age})"


# 创建实例
my_dog = Dog("旺财", 3)
print(my_dog.bark())      # 旺财 说: 汪汪！
print(my_dog.describe())  # 旺财, 3 岁, 犬科
print(my_dog)             # Dog(旺财, 3)
```

### 5.2 继承

```python
class Animal:
    """动物基类"""

    def __init__(self, name: str):
        self.name = name

    def speak(self) -> str:
        raise NotImplementedError("子类必须实现 speak 方法")


class Cat(Animal):
    """猫类，继承自 Animal"""

    def speak(self) -> str:
        return f"{self.name} 说: 喵喵！"


class Duck(Animal):
    """鸭类，继承自 Animal"""

    def speak(self) -> str:
        return f"{self.name} 说: 嘎嘎！"


# 多态：同一个方法，不同类有不同的行为
animals = [Cat("咪咪"), Duck("唐老鸭")]
for animal in animals:
    print(animal.speak())
# 输出:
# 咪咪 说: 喵喵！
# 唐老鸭 说: 嘎嘎！
```

---

## 六、模块

模块就是 `.py` 文件，用来组织代码。

### 6.1 使用标准库模块

```python
# os 模块：操作系统相关
import os

print(f"当前工作目录: {os.getcwd()}")
print(f"目录中的文件: {os.listdir('.')}")

# datetime 模块：日期时间
from datetime import datetime, timedelta

now = datetime.now()
print(f"当前时间: {now}")
print(f"明天: {now + timedelta(days=1)}")

# random 模块：随机数
import random

print(f"随机整数: {random.randint(1, 100)}")
print(f"随机选择: {random.choice(['苹果', '香蕉', '橙子'])}")

# json 模块：JSON 处理
import json

data = {"name": "张三", "age": 25}
json_str = json.dumps(data, ensure_ascii=False)
print(f"JSON 字符串: {json_str}")

parsed = json.loads(json_str)
print(f"解析后: {parsed['name']}")
```

### 6.2 创建自己的模块

创建一个文件 `utils.py`：

```python
"""
工具函数模块
用法: from utils import greet, add
"""


def greet(name: str) -> str:
    """打招呼"""
    return f"Hello, {name}!"


def add(a: int, b: int) -> int:
    """两数相加"""
    return a + b
```

在另一个文件中使用：

```python
# 从 utils 模块导入函数
from utils import greet, add

print(greet("World"))  # Hello, World!
print(add(3, 5))       # 8
```

---

## 七、综合练习

把今天学的知识综合起来，写一个简单的学生成绩管理程序：

```python
"""
学生成绩管理程序
综合练习：变量、列表、字典、函数、类
"""


class Student:
    """学生类"""

    def __init__(self, name: str):
        self.name = name
        self.scores: dict[str, float] = {}

    def add_score(self, subject: str, score: float):
        """添加成绩"""
        self.scores[subject] = score

    def average(self) -> float:
        """计算平均分"""
        if not self.scores:
            return 0.0
        return sum(self.scores.values()) / len(self.scores)

    def is_passing(self, threshold: float = 60.0) -> bool:
        """是否全部及格"""
        return all(score >= threshold for score in self.scores.values())

    def report(self) -> str:
        """生成成绩报告"""
        lines = [f"学生: {self.name}"]
        for subject, score in self.scores.items():
            status = "及格" if score >= 60 else "不及格"
            lines.append(f"  {subject}: {score:.1f} ({status})")
        lines.append(f"  平均分: {self.average():.1f}")
        lines.append(f"  是否全部及格: {'是' if self.is_passing() else '否'}")
        return "\n".join(lines)


def main():
    # 创建学生
    zhang_san = Student("张三")
    zhang_san.add_score("数学", 85)
    zhang_san.add_score("英语", 92)
    zhang_san.add_score("物理", 78)

    li_si = Student("李四")
    li_si.add_score("数学", 55)
    li_si.add_score("英语", 68)
    li_si.add_score("物理", 42)

    # 打印报告
    print(zhang_san.report())
    print()
    print(li_si.report())


if __name__ == "__main__":
    main()
```

**运行结果：**
```
学生: 张三
  数学: 85.0 (及格)
  英语: 92.0 (及格)
  物理: 78.0 (及格)
  平均分: 85.0
  是否全部及格: 是

学生: 李四
  数学: 55.0 (不及格)
  英语: 68.0 (及格)
  物理: 42.0 (不及格)
  平均分: 55.0
  是否全部及格: 否
```

---

## 八、今日验收清单

- [ ] 能定义和使用各种数据类型（int、float、str、bool、None）
- [ ] 能操作列表、字典、元组、集合
- [ ] 能编写带参数和返回值的函数
- [ ] 能定义类并创建对象实例
- [ ] 能使用 `import` 导入标准库模块
- [ ] 完成综合练习并运行成功

---

## 九、常见错误

**错误 1：`IndentationError: unexpected indent`**
Python 用缩进表示代码层级，必须用 4 个空格（或 1 个 Tab），不能混用。

**错误 2：`NameError: name 'xxx' is not defined`**
变量在使用前必须先赋值。检查变量名是否拼写正确。

**错误 3：`TypeError: unsupported operand type(s) for +`**
不能对不同类型的值做运算，比如 `"hello" + 10` 会报错。需要先转换类型：`"hello" + str(10)`。

---

## 十、今日复盘

- 哪个 Python 概念你觉得最容易理解？
- 哪个概念还需要多练习？
- 综合练习中的 `all()` 函数你能理解吗？

---

## 十一、明日预告

明天我们将深入学习 **Python 数据结构**和**类型提示**，包括列表推导式、字典推导式、Pydantic 等进阶内容。
