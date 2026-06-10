# 📅 Week 1 Day 6：日志系统 + 错误处理 + .env 管理

## 🧭 今日方向
> 今天我们将学习如何为 Agent Factory 添加专业的日志系统、健壮的错误处理和安全的环境变量管理。这些是构建生产级应用的基础。

## 🎯 生活比喻
> 日志系统就像飞机的黑匣子，记录一切；错误处理就像安全带，保护你不受意外伤害；环境变量管理就像保险箱，保管重要的密钥。

## 📋 今日三件事
1. 搭建专业的日志系统
2. 实现健壮的错误处理机制
3. 安全管理环境变量

## 🗺️ 手把手路线

### Step 1: 日志系统
- **做什么**: 使用 Python 的 logging 模块搭建日志系统
- **为什么**: 日志是调试和监控的重要工具
- **成功标志**: 能配置不同级别的日志输出

### Step 2: 错误处理
- **做什么**: 实现自定义异常和错误处理策略
- **为什么**: 健壮的错误处理让程序更可靠
- **成功标志**: 能优雅地处理各种异常情况

### Step 3: 环境变量管理
- **做什么**: 使用 python-dotenv 安全管理配置
- **为什么**: 敏感信息不应硬编码在代码中
- **成功标志**: 能安全地加载和使用环境变量

## 💻 代码区

```python
# 专业日志系统搭建

import logging
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional

def setup_logger(
    name: str,
    log_file: Optional[str] = None,
    level: int = logging.INFO,
    log_dir: str = "logs"
) -> logging.Logger:
    """
    设置专业日志系统
    
    Args:
        name: 日志记录器名称
        log_file: 日志文件名
        level: 日志级别
        log_dir: 日志目录
        
    Returns:
        配置好的日志记录器
    """
    # 创建日志目录
    Path(log_dir).mkdir(exist_ok=True)
    
    # 创建日志记录器
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # 清除现有的处理器
    logger.handlers.clear()
    
    # 日志格式
    formatter = logging.Formatter(
        fmt='%(asctime)s | %(name)s | %(levelname)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # 控制台处理器
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # 文件处理器（如果指定了日志文件）
    if log_file:
        log_path = Path(log_dir) / log_file
        file_handler = logging.FileHandler(log_path, encoding='utf-8')
        file_handler.setLevel(level)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger

class AgentLogger:
    """Agent 专用日志类"""
    
    def __init__(self, name: str, log_dir: str = "logs"):
        self.logger = setup_logger(
            name=name,
            log_file=f"{name.lower()}.log",
            log_dir=log_dir
        )
        self.name = name
    
    def info(self, message: str, **kwargs):
        """记录信息日志"""
        extra_info = " | ".join(f"{k}={v}" for k, v in kwargs.items())
        if extra_info:
            message = f"{message} [{extra_info}]"
        self.logger.info(message)
    
    def warning(self, message: str, **kwargs):
        """记录警告日志"""
        extra_info = " | ".join(f"{k}={v}" for k, v in kwargs.items())
        if extra_info:
            message = f"{message} [{extra_info}]"
        self.logger.warning(message)
    
    def error(self, message: str, error: Exception = None, **kwargs):
        """记录错误日志"""
        extra_info = " | ".join(f"{k}={v}" for k, v in kwargs.items())
        if extra_info:
            message = f"{message} [{extra_info}]"
        
        if error:
            message = f"{message} | 错误: {str(error)}"
        
        self.logger.error(message, exc_info=True)
    
    def debug(self, message: str, **kwargs):
        """记录调试日志"""
        extra_info = " | ".join(f"{k}={v}" for k, v in kwargs.items())
        if extra_info:
            message = f"{message} [{extra_info}]"
        self.logger.debug(message)

# 使用示例
if __name__ == "__main__":
    # 创建日志记录器
    logger = AgentLogger("AgentFactory")
    
    # 记录不同级别的日志
    logger.info("系统启动")
    logger.info("加载配置", config_file="config.yaml")
    logger.warning("配置文件不存在，使用默认配置")
    
    try:
        # 模拟错误
        result = 1 / 0
    except Exception as e:
        logger.error("计算错误", error=e, operation="division")
    
    logger.debug("调试信息", variable="test_value")
```

```python
# 健壮的错误处理机制

from typing import Any, Optional, Dict, Type
from dataclasses import dataclass
from enum import Enum

class ErrorCode(Enum):
    """错误码枚举"""
    SUCCESS = 0
    UNKNOWN_ERROR = 1000
    VALIDATION_ERROR = 1001
    NOT_FOUND = 1002
    PERMISSION_DENIED = 1003
    RATE_LIMITED = 1004
    API_ERROR = 1005
    DATABASE_ERROR = 1006
    NETWORK_ERROR = 1007

@dataclass
class ErrorResponse:
    """错误响应数据类"""
    code: ErrorCode
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            from datetime import datetime
            self.timestamp = datetime.now().isoformat()

class AgentException(Exception):
    """Agent 基础异常类"""
    
    def __init__(
        self,
        code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
        message: str = "未知错误",
        details: Optional[Dict[str, Any]] = None
    ):
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "code": self.code.value,
            "message": self.message,
            "details": self.details
        }

class ValidationError(AgentException):
    """验证错误"""
    
    def __init__(self, message: str, field: str = None):
        details = {"field": field} if field else None
        super().__init__(
            code=ErrorCode.VALIDATION_ERROR,
            message=message,
            details=details
        )

class NotFoundError(AgentException):
    """未找到错误"""
    
    def __init__(self, resource: str, resource_id: Any = None):
        details = {"resource": resource, "id": resource_id}
        super().__init__(
            code=ErrorCode.NOT_FOUND,
            message=f"{resource} 未找到",
            details=details
        )

class APIError(AgentException):
    """API 错误"""
    
    def __init__(self, message: str, status_code: int = None, response: Any = None):
        details = {"status_code": status_code, "response": response}
        super().__init__(
            code=ErrorCode.API_ERROR,
            message=message,
            details=details
        )

class RateLimitError(AgentException):
    """速率限制错误"""
    
    def __init__(self, retry_after: int = 60):
        details = {"retry_after": retry_after}
        super().__init__(
            code=ErrorCode.RATE_LIMITED,
            message=f"请求过于频繁，请在 {retry_after} 秒后重试",
            details=details
        )

# 错误处理器
class ErrorHandler:
    """错误处理器"""
    
    def __init__(self, logger=None):
        self.logger = logger
    
    def handle(self, exception: Exception) -> ErrorResponse:
        """
        处理异常
        
        Args:
            exception: 异常对象
            
        Returns:
            错误响应
        """
        if isinstance(exception, AgentException):
            error_response = ErrorResponse(
                code=exception.code,
                message=exception.message,
                details=exception.details
            )
        else:
            error_response = ErrorResponse(
                code=ErrorCode.UNKNOWN_ERROR,
                message=str(exception),
                details={"exception_type": type(exception).__name__}
            )
        
        # 记录日志
        if self.logger:
            self.logger.error(
                f"错误处理: {error_response.message}",
                error=exception,
                code=error_response.code.value
            )
        
        return error_response
    
    def retry_on_error(
        self,
        func,
        max_retries: int = 3,
        delay: int = 1,
        exceptions: tuple = (Exception,)
    ):
        """
        错误重试装饰器
        
        Args:
            func: 要重试的函数
            max_retries: 最大重试次数
            delay: 重试延迟（秒）
            exceptions: 需要重试的异常类型
            
        Returns:
            函数执行结果
        """
        import time
        
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    
                    if attempt < max_retries:
                        if self.logger:
                            self.logger.warning(
                                f"第 {attempt + 1} 次尝试失败，{delay} 秒后重试",
                                error=e
                            )
                        time.sleep(delay)
            
            # 所有重试都失败
            raise last_exception
        
        return wrapper

# 使用示例
if __name__ == "__main__":
    # 创建错误处理器
    logger = AgentLogger("ErrorHandler")
    error_handler = ErrorHandler(logger)
    
    # 测试验证错误
    try:
        raise ValidationError("用户名不能为空", field="username")
    except Exception as e:
        response = error_handler.handle(e)
        print(f"错误响应: {response}")
    
    # 测试未找到错误
    try:
        raise NotFoundError("用户", user_id=123)
    except Exception as e:
        response = error_handler.handle(e)
        print(f"错误响应: {response}")
    
    # 测试重试
    @error_handler.retry_on_error(max_retries=3, delay=1)
    def unstable_function():
        import random
        if random.random() < 0.7:
            raise APIError("API 调用失败")
        return "成功"
    
    try:
        result = unstable_function()
        print(f"函数结果: {result}")
    except Exception as e:
        print(f"最终失败: {e}")
```

```python
# 环境变量安全管理

import os
from pathlib import Path
from typing import Optional, Dict, Any
from dataclasses import dataclass
from dotenv import load_dotenv, dotenv_values

@dataclass
class Config:
    """配置数据类"""
    # API 密钥
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    
    # 数据库配置
    database_url: str = "sqlite:///./app.db"
    
    # 应用配置
    debug: bool = False
    log_level: str = "INFO"
    max_retries: int = 3
    
    # 其他配置
    app_name: str = "Agent Factory"
    version: str = "0.1.0"

class ConfigManager:
    """配置管理器"""
    
    def __init__(self, env_file: str = ".env"):
        self.env_file = env_file
        self.config = Config()
        self._load_config()
    
    def _load_config(self):
        """加载配置"""
        # 加载 .env 文件
        if Path(self.env_file).exists():
            load_dotenv(self.env_file)
        
        # 从环境变量读取配置
        self.config.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.config.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.config.database_url = os.getenv("DATABASE_URL", self.config.database_url)
        self.config.debug = os.getenv("DEBUG", "false").lower() == "true"
        self.config.log_level = os.getenv("LOG_LEVEL", self.config.log_level)
        self.config.max_retries = int(os.getenv("MAX_RETRIES", self.config.max_retries))
    
    def get_config(self) -> Config:
        """获取配置"""
        return self.config
    
    def get_secret(self, key: str) -> Optional[str]:
        """获取敏感配置（不打印日志）"""
        return os.getenv(key)
    
    def validate(self) -> Dict[str, Any]:
        """验证配置"""
        errors = []
        
        # 检查必要的 API 密钥
        if not self.config.openai_api_key:
            errors.append("未设置 OPENAI_API_KEY")
        
        # 验证数据库 URL
        if not self.config.database_url:
            errors.append("未设置 DATABASE_URL")
        
        # 验证日志级别
        valid_log_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if self.config.log_level not in valid_log_levels:
            errors.append(f"无效的日志级别: {self.config.log_level}")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "config": {
                "app_name": self.config.app_name,
                "version": self.config.version,
                "debug": self.config.debug,
                "log_level": self.config.log_level,
                "has_openai_key": bool(self.config.openai_api_key),
                "has_anthropic_key": bool(self.config.anthropic_api_key),
            }
        }

def create_env_template():
    """创建 .env 模板文件"""
    template = """# Agent Factory 配置文件
# 请复制此文件为 .env 并填入真实值

# API 密钥
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# 数据库配置
DATABASE_URL=sqlite:///./app.db

# 应用配置
DEBUG=false
LOG_LEVEL=INFO
MAX_RETRIES=3

# 其他配置
APP_NAME=Agent Factory
VERSION=0.1.0
"""
    
    with open(".env.example", "w", encoding="utf-8") as f:
        f.write(template)
    
    print("✅ .env.example 文件已创建")

# 使用示例
if __name__ == "__main__":
    # 创建配置管理器
    config_manager = ConfigManager()
    
    # 获取配置
    config = config_manager.get_config()
    print(f"应用名称: {config.app_name}")
    print(f"版本: {config.version}")
    print(f"调试模式: {config.debug}")
    
    # 验证配置
    validation = config_manager.validate()
    print(f"配置验证: {'通过' if validation['valid'] else '失败'}")
    
    if validation['errors']:
        for error in validation['errors']:
            print(f"  - {error}")
    
    # 创建 .env 模板
    create_env_template()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 日志文件不生成 | 检查日志目录权限，确保路径正确 |
| 2 | 异常被捕获但未记录 | 确保在 except 块中调用日志记录 |
| 3 | 环境变量未加载 | 检查 .env 文件路径，确保使用 load_dotenv() |
| 4 | 敏感信息泄露 | 不要在日志中打印 API 密钥等敏感信息 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| 日志 | 程序运行时的记录信息 |
| 日志级别 | 日志的重要程度（DEBUG, INFO, WARNING, ERROR） |
| 异常 | 程序运行时的错误 |
| 错误处理 | 捕获和处理异常的机制 |
| 环境变量 | 操作系统级别的配置变量 |
| .env | 存储环境变量的文件 |
| 重试机制 | 遇到错误时自动重试的策略 |

## ✅ 验收清单
- [ ] 能配置专业的日志系统
- [ ] 能实现自定义异常类
- [ ] 能安全管理环境变量
- [ ] 理解错误处理最佳实践

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
