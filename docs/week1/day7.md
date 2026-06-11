# Day 7: 重构 + 测试 + 复盘

> 今天是 Week 1 的最后一天。我们将对本周的代码进行重构优化，学习编写测试，并对整个 Week 1 进行全面复盘。

---

## 1. 为什么要重构和测试？

### 1.1 用一个生活中的类比

想象你在写一篇论文：

- **第一稿**：先把想法写下来，不管格式和错别字
- **重构**：调整段落顺序、删除多余内容、让逻辑更清晰
- **测试**：检查有没有错别字、引用是否正确、逻辑是否通顺
- **最终稿**：提交给老师

代码也是一样：
- **第一稿**：先把功能实现出来
- **重构**：让代码更清晰、更易读、更易维护
- **测试**：验证代码是否正确
- **最终版**：可以放心使用

### 1.2 重构的原则

**重构 = 在不改变外部行为的前提下，改善代码结构**

```python
# 重构前（能跑，但不好）
def process(data):
    result = []
    for item in data:
        if item.get("active"):
            if item.get("score", 0) > 60:
                result.append({"name": item["name"], "score": item["score"]})
    return result

# 重构后（功能相同，但更清晰）
def filter_active_students(students: list) -> list:
    """筛选出活跃且成绩及格的学生"""
    return [
        {"name": s["name"], "score": s["score"]}
        for s in students
        if s.get("active") and s.get("score", 0) > 60
    ]
```

---

## 2. 重构实战

### 2.1 重构前：散乱的代码

```python
"""
重构前：所有功能都在一个文件里，没有模块化
文件：examples/day7_before.py
"""

import requests
import json
import logging
import os
from dotenv import load_dotenv

load_dotenv()

def call_llm(prompt, model="gpt-4o-mini"):
    api_key = os.getenv("OPENAI_API_KEY")
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}]
        }
    )
    return response.json()["choices"][0]["message"]["content"]

def process_data(data):
    result = []
    for item in data:
        if item.get("type") == "text":
            result.append(item["content"])
    return result

def save_to_file(data, filename):
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)

def main():
    prompt = "用 Python 写一个快速排序"
    response = call_llm(prompt)
    print(response)

if __name__ == "__main__":
    main()
```

### 2.2 重构后：模块化、可测试

```python
"""
重构后：模块化、有类型注解、有错误处理、有日志
文件：examples/day7_after.py
"""

import os
import json
import logging
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

import requests
from dotenv import load_dotenv

# ============================================
# 配置管理
# ============================================

load_dotenv()

@dataclass
class LLMConfig:
    """LLM 配置"""
    api_key: str
    model: str = "gpt-4o-mini"
    temperature: float = 0.7
    max_tokens: int = 1000
    timeout: int = 30

    @classmethod
    def from_env(cls) -> "LLMConfig":
        """从环境变量创建配置"""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("未设置 OPENAI_API_KEY 环境变量")
        return cls(api_key=api_key)

# ============================================
# 日志系统
# ============================================

def setup_logger(name: str) -> logging.Logger:
    """设置日志系统"""
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        formatter = logging.Formatter(
            "%(asctime)s | %(name)s | %(levelname)s | %(message)s"
        )
        handler = logging.StreamHandler()
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger

logger = setup_logger("AgentFactory")

# ============================================
# 自定义异常
# ============================================

class LLMError(Exception):
    """LLM 调用错误"""
    def __init__(self, message: str, status_code: int = None):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

# ============================================
# LLM 客户端
# ============================================

class LLMClient:
    """LLM 客户端"""

    def __init__(self, config: LLMConfig):
        self.config = config
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {config.api_key}",
            "Content-Type": "application/json"
        })

    def chat(self, prompt: str, system: Optional[str] = None) -> str:
        """发送聊天请求"""
        messages = [{"role": "user", "content": prompt}]
        if system:
            messages.insert(0, {"role": "system", "content": system})

        try:
            response = self.session.post(
                "https://api.openai.com/v1/chat/completions",
                json={
                    "model": self.config.model,
                    "messages": messages,
                    "temperature": self.config.temperature,
                    "max_tokens": self.config.max_tokens
                },
                timeout=self.config.timeout
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]

        except requests.exceptions.HTTPError as e:
            raise LLMError(f"HTTP 错误: {e}", status_code=response.status_code)
        except requests.exceptions.RequestException as e:
            raise LLMError(f"请求错误: {e}")

    def close(self):
        """关闭会话"""
        self.session.close()

# ============================================
# 数据处理
# ============================================

def filter_text_items(items: List[Dict[str, Any]]) -> List[str]:
    """筛选文本类型的内容"""
    return [item["content"] for item in items if item.get("type") == "text"]

def save_to_json(data: Any, filepath: str) -> None:
    """保存数据到 JSON 文件"""
    Path(filepath).parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    logger.info(f"数据已保存到: {filepath}")

# ============================================
# 主程序
# ============================================

def main():
    """主函数"""
    logger.info("程序启动")

    try:
        # 创建配置
        config = LLMConfig.from_env()
        logger.info(f"配置加载完成: model={config.model}")

        # 创建客户端
        client = LLMClient(config)

        # 调用 LLM
        prompt = "用一句话解释什么是人工智能"
        logger.info(f"发送请求: {prompt[:50]}...")

        response = client.chat(prompt)
        logger.info(f"收到回复: {response[:50]}...")

        print(f"\n回复: {response}")

        # 清理
        client.close()

    except Exception as e:
        logger.error(f"程序出错: {e}", exc_info=True)
        raise

    logger.info("程序结束")

if __name__ == "__main__":
    main()
```

### 2.3 重构的改进点

| 改进 | 重构前 | 重构后 |
|------|--------|--------|
| 模块化 | 所有代码在一个文件 | 按功能分成不同的类和函数 |
| 类型注解 | 没有 | 有完整的类型注解 |
| 错误处理 | 没有 | 有自定义异常和错误处理 |
| 日志 | 用 print | 用 logging |
| 配置管理 | 硬编码 | 用 dataclass + .env |
| 可测试性 | 很难测试 | 每个函数都可以独立测试 |

---

## 3. 测试基础：pytest

### 3.1 安装 pytest

```bash
pip install pytest pytest-asyncio

# 验证安装
pytest --version
```

### 3.2 第一个测试

创建文件 `tests/test_basic.py`：

```python
"""
Day 7 示例：第一个测试
"""

# ============================================
# 被测试的函数
# ============================================

def add(a: int, b: int) -> int:
    """两数相加"""
    return a + b

def multiply(a: int, b: int) -> int:
    """两数相乘"""
    return a * b

def divide(a: float, b: float) -> float:
    """两数相除"""
    if b == 0:
        raise ValueError("除数不能为零")
    return a / b

# ============================================
# 测试函数
# ============================================

def test_add():
    """测试加法"""
    assert add(1, 2) == 3
    assert add(-1, 1) == 0
    assert add(0, 0) == 0

def test_multiply():
    """测试乘法"""
    assert multiply(2, 3) == 6
    assert multiply(-1, 3) == -3
    assert multiply(0, 5) == 0

def test_divide():
    """测试除法"""
    assert divide(6, 3) == 2.0
    assert divide(5, 2) == 2.5

def test_divide_by_zero():
    """测试除以零"""
    try:
        divide(1, 0)
        assert False, "应该抛出 ValueError"
    except ValueError as e:
        assert "除数不能为零" in str(e)
```

### 3.3 运行测试

```bash
# 运行所有测试
pytest

# 运行特定文件
pytest tests/test_basic.py

# 运行特定函数
pytest tests/test_basic.py::test_add

# 显示详细输出
pytest -v

# 显示 print 输出
pytest -s

# 只运行失败的测试
pytest --lf

# 运行后停止（遇到第一个失败就停止）
pytest -x
```

### 3.4 pytest 的规则

pytest 会自动发现测试，规则是：

1. 文件名以 `test_` 开头（如 `test_basic.py`）
2. 函数名以 `test_` 开头（如 `test_add`）
3. 类名以 `Test` 开头（如 `TestCalculator`）

### 3.5 使用类组织测试

```python
"""
使用类组织测试
"""

class TestMathOperations:
    """数学运算测试类"""

    def test_add(self):
        """测试加法"""
        assert add(1, 2) == 3

    def test_subtract(self):
        """测试减法"""
        assert add(5, -3) == 2

    def test_large_numbers(self):
        """测试大数"""
        assert add(1000000, 2000000) == 3000000
```

---

## 4. 为 Agent Factory 编写测试

### 4.1 测试数据处理函数

创建文件 `tests/test_utils.py`：

```python
"""
测试工具函数
"""

import pytest
from examples.day7_after import filter_text_items

class TestFilterTextItems:
    """测试文本筛选函数"""

    def test_filter_basic(self):
        """基本筛选"""
        items = [
            {"type": "text", "content": "hello"},
            {"type": "image", "content": "url1"},
            {"type": "text", "content": "world"}
        ]
        result = filter_text_items(items)
        assert result == ["hello", "world"]

    def test_filter_empty(self):
        """空列表"""
        result = filter_text_items([])
        assert result == []

    def test_filter_no_text(self):
        """没有文本类型"""
        items = [
            {"type": "image", "content": "url1"},
            {"type": "video", "content": "url2"}
        ]
        result = filter_text_items(items)
        assert result == []

    def test_filter_all_text(self):
        """全是文本类型"""
        items = [
            {"type": "text", "content": "a"},
            {"type": "text", "content": "b"}
        ]
        result = filter_text_items(items)
        assert result == ["a", "b"]
```

### 4.2 测试配置类

```python
"""
测试配置管理
"""

import os
import pytest
from examples.day7_after import LLMConfig

class TestLLMConfig:
    """测试 LLM 配置"""

    def test_config_creation(self):
        """测试配置创建"""
        config = LLMConfig(api_key="test-key")
        assert config.api_key == "test-key"
        assert config.model == "gpt-4o-mini"
        assert config.temperature == 0.7

    def test_config_custom_values(self):
        """测试自定义配置值"""
        config = LLMConfig(
            api_key="test-key",
            model="gpt-4",
            temperature=0.5,
            max_tokens=500
        )
        assert config.model == "gpt-4"
        assert config.temperature == 0.5
        assert config.max_tokens == 500

    def test_config_from_env(self):
        """测试从环境变量创建配置"""
        os.environ["OPENAI_API_KEY"] = "test-env-key"
        config = LLMConfig.from_env()
        assert config.api_key == "test-env-key"
        del os.environ["OPENAI_API_KEY"]

    def test_config_from_env_missing_key(self):
        """测试缺少环境变量"""
        if "OPENAI_API_KEY" in os.environ:
            del os.environ["OPENAI_API_KEY"]
        with pytest.raises(ValueError, match="未设置 OPENAI_API_KEY"):
            LLMConfig.from_env()
```

### 4.3 测试异常类

```python
"""
测试异常类
"""

import pytest
from examples.day7_after import LLMError

class TestLLMError:
    """测试 LLM 异常"""

    def test_error_message(self):
        """测试错误消息"""
        error = LLMError("测试错误")
        assert str(error) == "测试错误"
        assert error.status_code is None

    def test_error_with_status_code(self):
        """测试带状态码的错误"""
        error = LLMError("API 错误", status_code=404)
        assert error.status_code == 404
```

### 4.4 运行所有测试

```bash
# 运行所有测试
pytest tests/ -v

# 输出示例：
# tests/test_basic.py::test_add PASSED
# tests/test_basic.py::test_multiply PASSED
# tests/test_basic.py::test_divide PASSED
# tests/test_basic.py::test_divide_by_zero PASSED
# tests/test_utils.py::TestFilterTextItems::test_filter_basic PASSED
# tests/test_utils.py::TestFilterTextItems::test_filter_empty PASSED
# tests/test_utils.py::TestFilterTextItems::test_filter_no_text PASSED
# tests/test_utils.py::TestFilterTextItems::test_filter_all_text PASSED
# tests/test_utils.py::TestLLMConfig::test_config_creation PASSED
# tests/test_utils.py::TestLLMConfig::test_config_custom_values PASSED
# tests/test_utils.py::TestLLMConfig::test_config_from_env PASSED
# tests/test_utils.py::TestLLMConfig::test_config_from_env_missing_key PASSED
# tests/test_utils.py::TestLLMError::test_error_message PASSED
# tests/test_utils.py::TestLLMError::test_error_with_status_code PASSED
#
# ============= 14 passed in 0.05s =============
```

---

## 5. 测试覆盖率

### 5.1 什么是测试覆盖率？

测试覆盖率表示你的测试覆盖了多少代码。比如：

- 如果代码有 100 行，测试执行了 80 行，覆盖率就是 80%
- 覆盖率越高，代码质量越有保障

### 5.2 安装 coverage

```bash
pip install pytest-cov
```

### 5.3 查看覆盖率

```bash
# 运行测试并查看覆盖率
pytest --cov=examples --cov-report=term-missing

# 输出示例：
# Name                         Stmts   Miss  Cover   Missing
# ----------------------------------------------------------
# examples/day7_after.py          45     15    67%   30-35, 50-55, 70-75
# ----------------------------------------------------------
# TOTAL                           45     15    67%
```

---

## 6. Week 1 复盘

### 6.1 我们学了什么？

```
Week 1 知识图谱
├── Day 1: 虚拟环境 + 包管理 + 项目结构
│   ├── python -m venv venv
│   ├── pip install / freeze
│   ├── requirements.txt
│   └── 标准项目结构
│
├── Day 2: HTTP 协议 + requests/httpx
│   ├── HTTP 请求/响应
│   ├── GET/POST/PUT/DELETE
│   ├── requests 库
│   └── httpx 异步请求
│
├── Day 3: 大模型 API 调用
│   ├── OpenAI API
│   ├── Anthropic API
│   ├── 国内替代方案
│   └── 流式响应
│
├── Day 4: 异步编程 asyncio
│   ├── async/await
│   ├── asyncio.gather
│   └── 并发 API 调用
│
├── Day 5: CLI 工具搭建
│   ├── typer 基础
│   ├── 命令和选项
│   └── 子命令组
│
├── Day 6: 日志 + 错误处理 + .env
│   ├── logging 模块
│   ├── 自定义异常
│   └── python-dotenv
│
└── Day 7: 重构 + 测试 + 复盘
    ├── 代码重构
    ├── pytest 测试
    └── 复盘总结
```

### 6.2 自我评估

在下面的表格中，给自己打分（1-5 分）：

| 天数 | 主题 | 掌握程度 (1-5) | 笔记 |
|------|------|---------------|------|
| Day 1 | 虚拟环境 + 包管理 | _ | |
| Day 2 | HTTP 协议 + requests | _ | |
| Day 3 | 大模型 API 调用 | _ | |
| Day 4 | 异步编程 asyncio | _ | |
| Day 5 | CLI 工具搭建 | _ | |
| Day 6 | 日志 + 错误处理 | _ | |
| Day 7 | 重构 + 测试 | _ | |

### 6.3 遇到的问题和解决方案

```
问题 1: ...
解决方案: ...

问题 2: ...
解决方案: ...

问题 3: ...
解决方案: ...
```

### 6.4 Week 2 预告

Week 2 我们将学习 **FastAPI + 数据库**：

| 天数 | 主题 |
|------|------|
| Day 8 | FastAPI 入门 + Pydantic v2 |
| Day 9 | 路由设计 + 请求验证 |
| Day 10 | 数据库 ORM (SQLAlchemy 2.0) |
| Day 11 | CRUD 操作 |
| Day 12 | JWT 认证 |
| Day 13 | WebSocket 实时通信 |
| Day 14 | 测试 + 复盘 |

FastAPI 是目前最流行的 Python Web 框架，Week 2 学完后，你就能构建一个完整的 API 服务！

---

## 7. 今日小结

| 知识点 | 要点 |
|--------|------|
| 重构 | 在不改变行为的前提下改善代码结构 |
| 测试 | 验证代码正确性的自动化检查 |
| pytest | Python 测试框架，约定 test_ 前缀 |
| assert | 断言，检查条件是否为 True |
| 测试覆盖率 | 测试覆盖了多少代码 |
| 复盘 | 回顾总结，找出改进点 |

---

## 8. 课后练习

1. 对 Day 3 的 LLM 客户端代码进行重构，添加类型注解和错误处理
2. 为重构后的代码编写至少 5 个测试用例
3. 运行 pytest，确保所有测试通过
4. 填写上面的自我评估表格
5. 写下 Week 1 遇到的 3 个问题和解决方案

---

> **恭喜你完成了 Week 1！** 下周我们将学习 FastAPI，开始构建真正的 API 服务。See you next week!
