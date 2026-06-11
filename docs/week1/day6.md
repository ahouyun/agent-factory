# Day 6: 日志系统 + 错误处理 + .env 管理

> 今天的目标：为 Agent Factory 添加专业的日志系统、健壮的错误处理和安全的环境变量管理。这些是构建生产级应用的基础。

---

## 1. 为什么要学这个？

你的 Agent 程序可能会遇到各种问题：

- API 调用失败了，但你不知道是什么原因
- 程序突然崩溃了，但你不知道是在哪里崩溃的
- 你的 API Key 被别人看到了（因为你写在了代码里）

**日志系统** = 飞机的黑匣子，记录一切，出问题时可以回溯
**错误处理** = 安全带，保护程序不崩溃
**环境变量管理** = 保险箱，保管重要的密钥

---

## 2. 日志系统：logging 模块

### 2.1 为什么不用 print？

```python
# print 的问题
print("开始调用 API")        # 看起来没问题
print("API 调用成功")        # 但你不知道是什么时候调用的
print("出错了")              # 也不知道是哪里出错了

# 而且，print 无法：
# 1. 区分重要程度（这是警告还是错误？）
# 2. 同时输出到文件和控制台
# 3. 控制输出格式
# 4. 在生产环境中关闭调试信息
```

### 2.2 logging 基础

```python
"""
Day 6 示例：logging 基础
"""

import logging

# ============================================
# 示例 1：最简单的 logging
# ============================================

# 配置 logging
logging.basicConfig(
    level=logging.DEBUG,          # 最低级别
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# 获取 logger
logger = logging.getLogger(__name__)

# 记录不同级别的日志
logger.debug("调试信息：变量 x = 42")          # 最详细，调试用
logger.info("信息：程序启动成功")               # 一般信息
logger.warning("警告：配置文件不存在，使用默认值")  # 警告，但不影响运行
logger.error("错误：API 调用失败")              # 错误，功能受影响
logger.critical("严重错误：数据库连接失败")       # 最严重，程序可能崩溃
```

### 2.3 五个日志级别

| 级别 | 用途 | 类比 |
|------|------|------|
| **DEBUG** | 调试信息，开发时看 | 工程师的笔记 |
| **INFO** | 一般信息，确认程序正常运行 | 航班正常起飞的通知 |
| **WARNING** | 警告，但不影响运行 | 天气预报说明天可能下雨 |
| **ERROR** | 错误，功能受影响 | 航班延误的通知 |
| **CRITICAL** | 严重错误，程序可能崩溃 | 航班取消的通知 |

### 2.4 专业日志系统：输出到文件

```python
"""
Day 6 示例：输出到文件的日志系统
"""

import logging
from pathlib import Path
from datetime import datetime

def setup_logger(
    name: str,
    log_dir: str = "logs",
    level: int = logging.INFO
) -> logging.Logger:
    """
    设置专业的日志系统

    Args:
        name: 日志记录器名称
        log_dir: 日志目录
        level: 日志级别

    Returns:
        配置好的日志记录器
    """
    # 创建日志目录
    Path(log_dir).mkdir(exist_ok=True)

    # 创建日志记录器
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # 避免重复添加处理器
    if logger.handlers:
        return logger

    # 日志格式
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # 控制台处理器（输出到屏幕）
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # 文件处理器（输出到文件）
    today = datetime.now().strftime("%Y-%m-%d")
    log_file = Path(log_dir) / f"{name.lower()}_{today}.log"
    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setLevel(level)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger

# 使用示例
if __name__ == "__main__":
    # 创建 logger
    logger = setup_logger("AgentFactory")

    # 记录日志
    logger.info("系统启动")
    logger.info("加载配置", )
    logger.warning("配置文件不存在，使用默认配置")

    try:
        result = 1 / 0
    except Exception as e:
        logger.error("计算错误", exc_info=True)

    logger.info("系统运行正常")

    # 查看日志文件
    import os
    log_files = os.listdir("logs")
    print(f"\n日志文件: {log_files}")
```

### 2.5 日志格式详解

```python
# 日志格式中的占位符
format = "%(asctime)s | %(name)s | %(levelname)s | %(message)s"

# %(asctime)s  -->  2024-01-15 10:30:45  (时间戳)
# %(name)s     -->  AgentFactory         (logger 名称)
# %(levelname)s -->  INFO                (日志级别)
# %(message)s  -->  系统启动              (日志消息)

# 更多有用的占位符
format = "%(asctime)s | %(name)s | %(levelname)s | %(filename)s:%(lineno)d | %(message)s"
# %(filename)s  -->  main.py             (文件名)
# %(lineno)d    -->  42                  (行号)
# %(funcName)s  -->  start_system        (函数名)
```

---

## 3. 错误处理：自定义异常

### 3.1 Python 内置异常层次

```
BaseException
├── SystemExit
├── KeyboardInterrupt
├── GeneratorExit
└── Exception
    ├── ValueError
    ├── TypeError
    ├── FileNotFoundError
    ├── requests.exceptions.RequestException
    └── ...
```

### 3.2 自定义异常类

```python
"""
Day 6 示例：自定义异常
"""

from typing import Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

class ErrorCode(Enum):
    """错误码"""
    SUCCESS = 0
    VALIDATION_ERROR = 1001
    NOT_FOUND = 1002
    API_ERROR = 1003
    RATE_LIMITED = 1004
    NETWORK_ERROR = 1005

# ============================================
# 自定义异常类
# ============================================

class AgentException(Exception):
    """Agent 基础异常类"""

    def __init__(
        self,
        code: ErrorCode = ErrorCode.VALIDATION_ERROR,
        message: str = "未知错误",
        details: Optional[Dict[str, Any]] = None
    ):
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

    def __str__(self):
        return f"[{self.code.name}] {self.message}"

class ValidationError(AgentException):
    """验证错误"""

    def __init__(self, message: str, field: str = None):
        details = {"field": field} if field else None
        super().__init__(
            code=ErrorCode.VALIDATION_ERROR,
            message=message,
            details=details
        )

class APIError(AgentException):
    """API 错误"""

    def __init__(self, message: str, provider: str = None, status_code: int = None):
        details = {}
        if provider:
            details["provider"] = provider
        if status_code:
            details["status_code"] = status_code
        super().__init__(
            code=ErrorCode.API_ERROR,
            message=message,
            details=details
        )

class RateLimitError(AgentException):
    """速率限制错误"""

    def __init__(self, retry_after: int = 60, provider: str = None):
        details = {"retry_after": retry_after}
        if provider:
            details["provider"] = provider
        super().__init__(
            code=ErrorCode.RATE_LIMITED,
            message=f"请求过于频繁，请在 {retry_after} 秒后重试",
            details=details
        )

# ============================================
# 使用示例
# ============================================

if __name__ == "__main__":
    # 测试 ValidationError
    try:
        raise ValidationError("用户名不能为空", field="username")
    except AgentException as e:
        print(f"捕获异常: {e}")
        print(f"错误码: {e.code}")
        print(f"详情: {e.details}")

    print()

    # 测试 APIError
    try:
        raise APIError("模型不存在", provider="OpenAI", status_code=404)
    except AgentException as e:
        print(f"捕获异常: {e}")
        print(f"详情: {e.details}")

    print()

    # 测试 RateLimitError
    try:
        raise RateLimitError(retry_after=30, provider="DeepSeek")
    except AgentException as e:
        print(f"捕获异常: {e}")
        print(f"详情: {e.details}")
```

### 3.3 错误处理装饰器

```python
"""
Day 6 示例：错误处理装饰器
"""

import time
import logging
from functools import wraps
from typing import Callable, Type

logger = logging.getLogger(__name__)

def retry_on_error(
    max_retries: int = 3,
    delay: float = 1.0,
    exceptions: tuple = (Exception,)
):
    """
    错误重试装饰器

    Args:
        max_retries: 最大重试次数
        delay: 重试延迟（秒）
        exceptions: 需要重试的异常类型
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None

            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_retries:
                        logger.warning(
                            f"第 {attempt + 1} 次尝试失败，{delay} 秒后重试: {e}"
                        )
                        time.sleep(delay)
                    else:
                        logger.error(f"所有 {max_retries + 1} 次尝试都失败")

            raise last_exception
        return wrapper
    return decorator

# 使用示例
@retry_on_error(max_retries=3, delay=0.5, exceptions=(ConnectionError, TimeoutError))
def call_unstable_api():
    """调用不稳定的 API"""
    import random
    if random.random() < 0.7:
        raise ConnectionError("网络连接失败")
    return "成功"

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    try:
        result = call_unstable_api()
        print(f"结果: {result}")
    except ConnectionError as e:
        print(f"最终失败: {e}")
```

---

## 4. 环境变量管理：.env + python-dotenv

### 4.1 为什么需要 .env？

```python
# 危险！API Key 写在代码里
api_key = "sk-proj-abc123def456..."  # 如果上传到 GitHub，别人就能用你的 Key

# 安全！API Key 存在 .env 里
import os
api_key = os.getenv("OPENAI_API_KEY")  # 从环境变量读取
```

### 4.2 安装 python-dotenv

```bash
pip install python-dotenv
```

### 4.3 创建 .env 文件

在项目根目录创建 `.env` 文件：

```bash
# .env 文件内容
# 这是真正的配置文件，包含真实密钥
# 绝对不能提交到 Git！

OPENAI_API_KEY=sk-proj-your-actual-openai-key
ANTHROPIC_API_KEY=sk-ant-your-actual-anthropic-key
DEEPSEEK_API_KEY=your-deepseek-key

DEFAULT_MODEL=gpt-4o-mini
LOG_LEVEL=INFO
DEBUG=false
```

### 4.4 创建 .env.example 文件

```bash
# .env.example 文件内容
# 这是模板文件，不包含真实密钥
# 可以提交到 Git，告诉协作者需要哪些配置

OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
DEEPSEEK_API_KEY=your-deepseek-key-here

DEFAULT_MODEL=gpt-4o-mini
LOG_LEVEL=INFO
DEBUG=false
```

### 4.5 在代码中使用 .env

```python
"""
Day 6 示例：使用 .env 管理配置
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from dataclasses import dataclass
from typing import Optional

# ============================================
# 加载 .env 文件
# ============================================

# 方法 1：自动查找 .env 文件（推荐）
load_dotenv()

# 方法 2：指定 .env 文件路径
# load_dotenv(".env.local")

# 方法 3：覆盖已有的环境变量
# load_dotenv(override=True)

# ============================================
# 读取环境变量
# ============================================

# 简单读取
api_key = os.getenv("OPENAI_API_KEY")
print(f"API Key: {api_key[:10]}..." if api_key else "API Key 未设置")

# 带默认值
log_level = os.getenv("LOG_LEVEL", "INFO")
print(f"日志级别: {log_level}")

# 转换类型
debug = os.getenv("DEBUG", "false").lower() == "true"
print(f"调试模式: {debug}")

# ============================================
# 使用 dataclass 管理配置（推荐）
# ============================================

@dataclass
class Config:
    """应用配置"""
    # API 密钥
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    deepseek_api_key: Optional[str] = None

    # 应用配置
    default_model: str = "gpt-4o-mini"
    log_level: str = "INFO"
    debug: bool = False

    # 重试配置
    max_retries: int = 3
    retry_delay: float = 1.0

    @classmethod
    def from_env(cls) -> "Config":
        """从环境变量创建配置"""
        return cls(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
            deepseek_api_key=os.getenv("DEEPSEEK_API_KEY"),
            default_model=os.getenv("DEFAULT_MODEL", "gpt-4o-mini"),
            log_level=os.getenv("LOG_LEVEL", "INFO"),
            debug=os.getenv("DEBUG", "false").lower() == "true",
            max_retries=int(os.getenv("MAX_RETRIES", "3")),
            retry_delay=float(os.getenv("RETRY_DELAY", "1.0")),
        )

    def validate(self):
        """验证配置"""
        errors = []

        if not self.openai_api_key:
            errors.append("未设置 OPENAI_API_KEY")
        if not self.anthropic_api_key and not self.deepseek_api_key:
            errors.append("未设置 ANTHROPIC_API_KEY 或 DEEPSEEK_API_KEY")

        if self.log_level not in ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]:
            errors.append(f"无效的日志级别: {self.log_level}")

        return {
            "valid": len(errors) == 0,
            "errors": errors
        }

# ============================================
# 使用示例
# ============================================

if __name__ == "__main__":
    # 创建配置
    config = Config.from_env()

    # 打印配置（注意：不要打印 API Key！）
    print(f"默认模型: {config.default_model}")
    print(f"日志级别: {config.log_level}")
    print(f"调试模式: {config.debug}")
    print(f"OpenAI Key: {'已设置' if config.openai_api_key else '未设置'}")

    # 验证配置
    validation = config.validate()
    if validation["valid"]:
        print("配置验证通过！")
    else:
        print("配置验证失败:")
        for error in validation["errors"]:
            print(f"  - {error}")
```

### 4.6 .gitignore 中的 .env 规则

确保 `.gitignore` 文件中包含：

```gitignore
# 环境变量（包含密钥！）
.env
.env.local
.env.*.local
```

### 4.7 安全检查清单

- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] `.env` 文件从未被提交到 Git（用 `git log` 检查）
- [ ] 代码中没有硬编码的 API Key
- [ ] `.env.example` 不包含真实密钥
- [ ] 日志中不打印 API Key

---

## 5. 完整实战：将三者结合起来

```python
"""
Day 6 完整实战：日志 + 错误处理 + 配置管理
文件：examples/day6_complete.py
"""

import os
import logging
from pathlib import Path
from dataclasses import dataclass
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# ============================================
# 1. 配置管理
# ============================================

load_dotenv()

@dataclass
class Config:
    openai_api_key: Optional[str] = None
    log_level: str = "INFO"
    debug: bool = False

    @classmethod
    def from_env(cls):
        return cls(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            log_level=os.getenv("LOG_LEVEL", "INFO"),
            debug=os.getenv("DEBUG", "false").lower() == "true",
        )

# ============================================
# 2. 日志系统
# ============================================

def setup_logger(name: str, level: str = "INFO") -> logging.Logger:
    """设置日志系统"""
    Path("logs").mkdir(exist_ok=True)

    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level))

    if not logger.handlers:
        formatter = logging.Formatter(
            "%(asctime)s | %(name)s | %(levelname)s | %(message)s"
        )

        # 控制台
        console = logging.StreamHandler()
        console.setFormatter(formatter)
        logger.addHandler(console)

        # 文件
        file_handler = logging.FileHandler("logs/app.log", encoding="utf-8")
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger

# ============================================
# 3. 错误处理
# ============================================

class AppError(Exception):
    def __init__(self, message: str, code: int = 1):
        self.message = message
        self.code = code
        super().__init__(message)

# ============================================
# 4. 主程序
# ============================================

def main():
    # 初始化
    config = Config.from_env()
    logger = setup_logger("AgentFactory", config.log_level)

    logger.info("程序启动")
    logger.info(f"配置加载完成: debug={config.debug}")

    # 验证配置
    if not config.openai_api_key:
        logger.warning("未设置 OPENAI_API_KEY")

    # 模拟业务逻辑
    try:
        logger.info("开始处理任务...")

        # 模拟可能失败的操作
        if config.debug:
            logger.debug("调试模式：跳过 API 调用")
        else:
            logger.info("调用 API...")
            # 这里可以放真实的 API 调用

        logger.info("任务完成")

    except Exception as e:
        logger.error(f"任务失败: {e}", exc_info=True)
        raise

    logger.info("程序结束")

if __name__ == "__main__":
    main()
```

---

## 6. 常见错误和解决方案

### 错误 1：日志重复输出

```python
# 症状：同一行日志输出了两次
# 原因：多次调用 basicConfig 或重复添加 handler

# 解决：检查 handler 数量
logger = logging.getLogger("my_logger")
print(f"Handler 数量: {len(logger.handlers)}")
```

### 错误 2：.env 文件没生效

```python
# 症状：os.getenv() 返回 None

# 原因：
# 1. .env 文件路径不对
# 2. 没有调用 load_dotenv()
# 3. 变量名拼写错误

# 解决：
from dotenv import load_dotenv
load_dotenv()  # 确保调用了

# 检查 .env 文件是否在正确位置
from pathlib import Path
print(f"当前目录: {Path.cwd()}")
print(f".env 文件是否存在: {Path('.env').exists()}")
```

### 错误 3：异常没有被记录

```python
# 症状：程序崩溃但日志中没有错误信息

# 原因：没有在 except 块中调用 logger

# 解决：
try:
    risky_operation()
except Exception as e:
    logger.error(f"操作失败: {e}", exc_info=True)  # exc_info=True 记录堆栈
    raise
```

---

## 7. 今日小结

| 知识点 | 要点 |
|--------|------|
| logging 比 print 好 | 支持级别、格式、文件输出 |
| 日志级别 | DEBUG < INFO < WARNING < ERROR < CRITICAL |
| 自定义异常 | 继承 Exception，添加 code 和 details |
| 重试装饰器 | 自动重试失败的操作 |
| .env 文件 | 存放敏感配置，不提交到 Git |
| load_dotenv() | 加载 .env 文件 |
| Config dataclass | 用类型安全的方式管理配置 |

---

## 8. 课后练习

1. 创建一个日志系统，同时输出到控制台和文件
2. 创建三个自定义异常类：ValidationError、APIError、NotFoundError
3. 编写一个重试装饰器，支持指定最大重试次数和延迟时间
4. 创建 .env 和 .env.example 文件，用 python-dotenv 加载配置
5. 将日志、错误处理、配置管理结合起来，写一个完整的程序

---

> **明天预告**：Day 7 我们将进行代码重构、编写测试、完成 Week 1 的复盘总结。
