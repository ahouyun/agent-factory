# 📅 Week 0 Day 6：Python 数据结构 + 类型提示

## 🧭 今日方向
> 今天我们将深入学习 Python 的高级数据结构和类型提示系统。掌握这些能让你的代码更专业、更易维护。

## 🎯 生活比喻
> 如果说基础数据类型是积木，那么高级数据结构就是预制的组件。类型提示就像是给积木贴上标签，让别人一眼就知道这是什么、能做什么。

## 📋 今日三件事
1. 掌握列表、字典、集合的高级用法
2. 学习 Python 的类型提示系统
3. 实践类型提示在实际项目中的应用

## 🗺️ 手把手路线

### Step 1: 高级数据结构
- **做什么**: 学习列表推导式、字典推导式、集合操作
- **为什么**: 这些是 Pythonic 代码的标志
- **成功标志**: 能用推导式简化代码

### Step 2: 类型提示基础
- **做什么**: 学习基本类型注解和常用类型
- **为什么**: 类型提示让代码更清晰，IDE 支持更好
- **成功标志**: 能为函数和变量添加类型提示

### Step 3: 高级类型提示
- **做什么**: 学习泛型、Optional、Union 等高级类型
- **为什么**: 处理复杂数据结构时需要更精确的类型定义
- **成功标志**: 能定义复杂的类型提示

## 💻 代码区

```python
# 高级数据结构示例

# 列表推导式
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# 传统方式
squares = []
for num in numbers:
    if num % 2 == 0:
        squares.append(num ** 2)

# 推导式方式
squares = [num ** 2 for num in numbers if num % 2 == 0]
print(f"偶数平方: {squares}")

# 字典推导式
names = ["张三", "李四", "王五"]
ages = [25, 30, 28]

# 创建字典
name_age = {name: age for name, age in zip(names, ages)}
print(f"姓名年龄: {name_age}")

# 集合操作
set_a = {1, 2, 3, 4, 5}
set_b = {4, 5, 6, 7, 8}

print(f"交集: {set_a & set_b}")
print(f"并集: {set_a | set_b}")
print(f"差集: {set_a - set_b}")
print(f"对称差集: {set_a ^ set_b}")

# 默认字典
from collections import defaultdict

# 统计单词出现次数
text = "apple banana apple orange banana apple"
words = text.split()
word_count = defaultdict(int)
for word in words:
    word_count[word] += 1
print(f"单词计数: {dict(word_count)}")

# 有序字典
from collections import OrderedDict

ordered_dict = OrderedDict()
ordered_dict["first"] = 1
ordered_dict["second"] = 2
ordered_dict["third"] = 3
print(f"有序字典: {ordered_dict}")
```

```python
# 类型提示基础示例

from typing import List, Dict, Tuple, Set, Optional, Union

# 基本类型注解
def greet(name: str) -> str:
    """问候函数"""
    return f"你好, {name}!"

# 列表类型
def process_numbers(numbers: List[int]) -> List[int]:
    """处理数字列表"""
    return [num * 2 for num in numbers]

# 字典类型
def create_user_dict(names: List[str], ages: List[int]) -> Dict[str, int]:
    """创建用户字典"""
    return {name: age for name, age in zip(names, ages)}

# 元组类型
def get_coordinates() -> Tuple[float, float]:
    """获取坐标"""
    return (116.404, 39.915)

# 集合类型
def find_unique_elements(list1: List[int], list2: List[int]) -> Set[int]:
    """查找唯一元素"""
    return set(list1) ^ set(list2)

# 可选类型
def find_user(user_id: int) -> Optional[Dict]:
    """查找用户，可能返回 None"""
    users = {1: {"name": "张三"}, 2: {"name": "李四"}}
    return users.get(user_id)

# 联合类型
def process_value(value: Union[int, str]) -> str:
    """处理不同类型的数据"""
    if isinstance(value, int):
        return f"数字: {value}"
    else:
        return f"字符串: {value}"

# 测试类型提示
if __name__ == "__main__":
    print(greet("小明"))
    
    numbers = [1, 2, 3, 4, 5]
    doubled = process_numbers(numbers)
    print(f"加倍后: {doubled}")
    
    names = ["张三", "李四", "王五"]
    ages = [25, 30, 28]
    user_dict = create_user_dict(names, ages)
    print(f"用户字典: {user_dict}")
    
    coords = get_coordinates()
    print(f"坐标: {coords}")
    
    list1 = [1, 2, 3, 4]
    list2 = [3, 4, 5, 6]
    unique = find_unique_elements(list1, list2)
    print(f"唯一元素: {unique}")
    
    user = find_user(1)
    print(f"找到用户: {user}")
    
    print(process_value(42))
    print(process_value("hello"))
```

```python
# 高级类型提示示例

from typing import Callable, Iterator, Generator, Any, TypeVar, Generic
from dataclasses import dataclass
from enum import Enum

# 泛型类型
T = TypeVar('T')

class Stack(Generic[T]):
    """泛型栈类"""
    
    def __init__(self):
        self.items: List[T] = []
    
    def push(self, item: T) -> None:
        """添加元素"""
        self.items.append(item)
    
    def pop(self) -> T:
        """移除并返回最后一个元素"""
        if not self.items:
            raise IndexError("栈为空")
        return self.items.pop()
    
    def peek(self) -> T:
        """查看最后一个元素"""
        if not self.items:
            raise IndexError("栈为空")
        return self.items[-1]
    
    def is_empty(self) -> bool:
        """检查栈是否为空"""
        return len(self.items) == 0

# 函数类型
def apply_operation(x: int, y: int, operation: Callable[[int, int], int]) -> int:
    """应用操作到两个数字"""
    return operation(x, y)

# 生成器类型
def fibonacci_generator(n: int) -> Generator[int, None, None]:
    """斐波那契数列生成器"""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# 数据类
@dataclass
class Student:
    """学生数据类"""
    name: str
    age: int
    scores: List[float] = None
    
    def __post_init__(self):
        if self.scores is None:
            self.scores = []
    
    def average_score(self) -> float:
        """计算平均分"""
        if not self.scores:
            return 0.0
        return sum(self.scores) / len(self.scores)

# 枚举类
class Color(Enum):
    """颜色枚举"""
    RED = "红色"
    GREEN = "绿色"
    BLUE = "蓝色"

# 测试高级类型
if __name__ == "__main__":
    # 测试泛型栈
    int_stack: Stack[int] = Stack()
    int_stack.push(1)
    int_stack.push(2)
    int_stack.push(3)
    print(f"栈顶元素: {int_stack.peek()}")
    
    str_stack: Stack[str] = Stack()
    str_stack.push("hello")
    str_stack.push("world")
    print(f"字符串栈顶: {str_stack.peek()}")
    
    # 测试函数类型
    def add(x: int, y: int) -> int:
        return x + y
    
    def multiply(x: int, y: int) -> int:
        return x * y
    
    print(f"加法: {apply_operation(5, 3, add)}")
    print(f"乘法: {apply_operation(5, 3, multiply)}")
    
    # 测试生成器
    fib_list = list(fibonacci_generator(10))
    print(f"斐波那契数列: {fib_list}")
    
    # 测试数据类
    student = Student("张三", 20, [85, 92, 78])
    print(f"学生信息: {student}")
    print(f"平均分: {student.average_score():.1f}")
    
    # 测试枚举
    print(f"颜色: {Color.RED.value}")
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 类型提示报错 | 确保导入 `typing` 模块中的类型 |
| 2 | 泛型使用错误 | 确保定义 TypeVar 并正确传递类型参数 |
| 3 | 数据类属性错误 | 使用 `@dataclass` 装饰器，检查字段定义 |
| 4 | 生成器不工作 | 确保使用 `yield` 而不是 `return` |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| 列表推导式 | 用简洁语法创建列表的方法 |
| 类型提示 | 为变量和函数添加类型信息的语法 |
| 泛型 | 可以处理多种类型的类或函数 |
| Optional | 表示值可以是 None |
| Union | 表示值可以是多种类型之一 |
| Callable | 可调用对象（如函数）的类型 |
| Generator | 使用 yield 的生成器函数 |
| Dataclass | 自动生成 __init__ 等方法的类 |

## ✅ 验收清单
- [ ] 能熟练使用列表和字典推导式
- [ ] 能为函数和变量添加基本类型提示
- [ ] 理解 Optional 和 Union 的用法
- [ ] 能使用 dataclass 简化类定义

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
