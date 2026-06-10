# 📅 Week 1 Day 7：重构 + 测试 + 复盘

## 🧭 今日方向
> 今天是 Week 1 的最后一天，我们将对本周学习的内容进行重构优化，编写测试用例，并进行全面的复盘总结。

## 🎯 生活比喻
> 就像厨师在完成一道菜后会进行摆盘和品尝，今天我们也要对代码进行"摆盘"（重构）和"品尝"（测试），确保一切完美。

## 📋 今日三件事
1. 重构本周的代码，提高代码质量
2. 为关键功能编写测试用例
3. 完成 Week 1 的复盘总结

## 🗺️ 手把手路线

### Step 1: 代码重构
- **做什么**: 优化代码结构，提高可读性和可维护性
- **为什么**: 好的代码应该清晰、简洁、易于理解
- **成功标志**: 代码符合 Python 最佳实践

### Step 2: 编写测试
- **做什么**: 使用 pytest 为关键功能编写测试
- **为什么**: 测试是代码质量的保证
- **成功标志**: 核心功能都有测试覆盖

### Step 3: Week 1 复盘
- **做什么**: 总结本周学习内容，制定改进计划
- **为什么**: 复盘是学习的重要环节
- **成功标志**: 有完整的复盘报告

## 💻 代码区

```python
# 重构示例：HTTP 客户端

# 重构前（有问题的代码）
def bad_http_client():
    """不好的 HTTP 客户端实现"""
    import requests
    
    def get_data(url):
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()
        else:
            return None
    
    def post_data(url, data):
        response = requests.post(url, json=data)
        return response.json()

# 重构后（改进的代码）
import requests
from typing import Dict, Any, Optional
from dataclasses import dataclass
from contextlib import contextmanager

@dataclass
class HTTPConfig:
    """HTTP 配置"""
    base_url: str
    timeout: int = 30
    max_retries: int = 3
    headers: Optional[Dict[str, str]] = None

class HTTPClient:
    """改进的 HTTP 客户端"""
    
    def __init__(self, config: HTTPConfig):
        self.config = config
        self.session = requests.Session()
        
        # 设置默认头
        if config.headers:
            self.session.headers.update(config.headers)
    
    def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> Dict[str, Any]:
        """发送请求"""
        url = f"{self.config.base_url}/{endpoint.lstrip('/')}"
        
        for attempt in range(self.config.max_retries):
            try:
                response = self.session.request(
                    method=method,
                    url=url,
                    timeout=self.config.timeout,
                    **kwargs
                )
                response.raise_for_status()
                return response.json()
            
            except requests.exceptions.RequestException as e:
                if attempt == self.config.max_retries - 1:
                    raise
                continue
    
    def get(self, endpoint: str, params: Dict = None) -> Dict[str, Any]:
        """GET 请求"""
        return self._request("GET", endpoint, params=params)
    
    def post(self, endpoint: str, data: Dict = None) -> Dict[str, Any]:
        """POST 请求"""
        return self._request("POST", endpoint, json=data)
    
    def put(self, endpoint: str, data: Dict = None) -> Dict[str, Any]:
        """PUT 请求"""
        return self._request("PUT", endpoint, json=data)
    
    def delete(self, endpoint: str) -> Dict[str, Any]:
        """DELETE 请求"""
        return self._request("DELETE", endpoint)
    
    def close(self):
        """关闭会话"""
        self.session.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
        return False

# 使用示例
if __name__ == "__main__":
    # 创建配置
    config = HTTPConfig(
        base_url="https://api.example.com",
        timeout=10,
        headers={"Authorization": "Bearer token123"}
    )
    
    # 使用上下文管理器
    with HTTPClient(config) as client:
        # GET 请求
        data = client.get("/users")
        print(f"用户数据: {data}")
        
        # POST 请求
        new_user = client.post("/users", {"name": "张三", "age": 25})
        print(f"创建用户: {new_user}")
```

```python
# 测试示例：使用 pytest

# test_http_client.py
import pytest
from unittest.mock import Mock, patch, MagicMock
from http_client import HTTPClient, HTTPConfig

class TestHTTPClient:
    """HTTP 客户端测试类"""
    
    def setup_method(self):
        """测试前设置"""
        self.config = HTTPConfig(
            base_url="https://api.test.com",
            timeout=5,
            max_retries=3
        )
        self.client = HTTPClient(self.config)
    
    def teardown_method(self):
        """测试后清理"""
        self.client.close()
    
    @patch('http_client.requests.Session')
    def test_get_request(self, mock_session):
        """测试 GET 请求"""
        # 设置模拟响应
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"id": 1, "name": "test"}
        mock_response.raise_for_status = Mock()
        
        mock_session.return_value.request.return_value = mock_response
        
        # 执行请求
        result = self.client.get("/users/1")
        
        # 验证结果
        assert result == {"id": 1, "name": "test"}
        mock_session.return_value.request.assert_called_once()
    
    @patch('http_client.requests.Session')
    def test_post_request(self, mock_session):
        """测试 POST 请求"""
        # 设置模拟响应
        mock_response = Mock()
        mock_response.status_code = 201
        mock_response.json.return_value = {"id": 2, "name": "new user"}
        mock_response.raise_for_status = Mock()
        
        mock_session.return_value.request.return_value = mock_response
        
        # 执行请求
        result = self.client.post("/users", {"name": "new user"})
        
        # 验证结果
        assert result == {"id": 2, "name": "new user"}
    
    @patch('http_client.requests.Session')
    def test_retry_on_failure(self, mock_session):
        """测试失败重试"""
        import requests
        
        # 设置模拟响应：前两次失败，第三次成功
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"success": True}
        mock_response.raise_for_status = Mock()
        
        mock_session.return_value.request.side_effect = [
            requests.exceptions.ConnectionError(),
            requests.exceptions.ConnectionError(),
            mock_response
        ]
        
        # 执行请求
        result = self.client.get("/users")
        
        # 验证结果
        assert result == {"success": True}
        assert mock_session.return_value.request.call_count == 3

# test_config_manager.py
import pytest
from config_manager import ConfigManager, Config

class TestConfigManager:
    """配置管理器测试类"""
    
    def test_load_config(self):
        """测试配置加载"""
        manager = ConfigManager()
        config = manager.get_config()
        
        assert isinstance(config, Config)
        assert config.app_name == "Agent Factory"
    
    def test_validate_config(self):
        """测试配置验证"""
        manager = ConfigManager()
        validation = manager.validate()
        
        assert "valid" in validation
        assert "errors" in validation
        assert "config" in validation

if __name__ == "__main__":
    # 运行测试
    pytest.main([__file__, "-v"])
```

```python
# Week 1 复盘脚本

from datetime import datetime
from typing import Dict, List, Any
from dataclasses import dataclass

@dataclass
class LearningRecord:
    """学习记录"""
    day: int
    topic: str
    completed: bool
    notes: str
    rating: int  # 1-5

class Week1Review:
    """Week 1 复盘类"""
    
    def __init__(self):
        self.records: List[LearningRecord] = []
        self.goals = [
            "掌握虚拟环境和包管理",
            "学习 HTTP 协议和 requests/httpx",
            "调用大模型 API",
            "学习异步编程",
            "构建 CLI 工具",
            "掌握日志和错误处理"
        ]
    
    def add_record(self, record: LearningRecord):
        """添加学习记录"""
        self.records.append(record)
    
    def generate_report(self) -> str:
        """生成复盘报告"""
        report = f"""# Week 1 复盘报告
生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 学习目标完成情况

"""
        
        for i, goal in enumerate(self.goals, 1):
            completed = "✅" if i <= len(self.records) and self.records[i-1].completed else "❌"
            report += f"{i}. {completed} {goal}\n"
        
        report += "\n## 每日学习记录\n\n"
        
        total_rating = 0
        for record in self.records:
            status = "✅" if record.completed else "❌"
            report += f"### Day {record.day}: {record.topic}\n"
            report += f"- 状态: {status}\n"
            report += f"- 评分: {'⭐' * record.rating}/5\n"
            report += f"- 笔记: {record.notes}\n\n"
            total_rating += record.rating
        
        avg_rating = total_rating / len(self.records) if self.records else 0
        report += f"## 总体评分: {avg_rating:.1f}/5\n\n"
        
        # 改进建议
        report += """## 改进建议

1. **理论与实践结合**: 每个概念都要有代码实践
2. **及时复习**: 定期回顾学过的内容
3. **深入理解**: 不仅要会用，还要理解原理
4. **记录问题**: 遇到的问题要及时记录和解决

## 下周计划

### Week 2: FastAPI
- FastAPI 入门 + Pydantic v2 模型
- 路由设计 + 请求验证 + 错误处理
- 数据库 ORM（SQLAlchemy 2.0）+ CRUD
- JWT 认证 + 中间件
- WebSocket 实时通信
- 结构化输出：JSON Mode + Pydantic Schema
- 测试 + 复盘
"""
        
        return report

def create_review_data():
    """创建复盘数据"""
    review = Week1Review()
    
    # 添加每日记录
    records = [
        LearningRecord(1, "虚拟环境 + 包管理", True, "掌握了 venv 和 pip 的使用", 4),
        LearningRecord(2, "HTTP 协议 + requests/httpx", True, "理解了 HTTP 协议基础", 4),
        LearningRecord(3, "大模型 API 调用", True, "学会了 OpenAI 和 Anthropic API", 5),
        LearningRecord(4, "异步编程 asyncio", True, "理解了异步编程的概念", 3),
        LearningRecord(5, "CLI 工具搭建", True, "使用 typer 构建了 CLI 工具", 4),
        LearningRecord(6, "日志 + 错误处理", True, "掌握了专业日志系统搭建", 4),
        LearningRecord(7, "重构 + 测试 + 复盘", True, "完成了代码重构和测试", 4),
    ]
    
    for record in records:
        review.add_record(record)
    
    return review

if __name__ == "__main__":
    # 创建复盘数据
    review = create_review_data()
    
    # 生成报告
    report = review.generate_report()
    
    # 保存报告
    with open("week1_review.md", "w", encoding="utf-8") as f:
        f.write(report)
    
    print("✅ Week 1 复盘报告已生成")
    print(report)
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 重构后功能失效 | 重构前先写测试，重构后运行测试验证 |
| 2 | 测试用例不通过 | 检查模拟对象设置，确保测试环境隔离 |
| 3 | 代码质量差 | 使用 linter（如 black, ruff）自动格式化 |
| 4 | 复盘内容空洞 | 结合具体代码示例，记录真实的学习过程 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| 重构 | 在不改变外部行为的前提下改善代码结构 |
| 测试 | 验证代码功能正确性的自动化检查 |
| pytest | Python 的测试框架 |
| 模拟对象 | 用于替代真实对象的测试替身 |
| 代码覆盖率 | 测试覆盖的代码比例 |
| 复盘 | 回顾总结，找出成功经验和改进点 |

## ✅ 验收清单
- [ ] 完成代码重构，符合 Python 最佳实践
- [ ] 编写至少 5 个测试用例
- [ ] 所有测试通过
- [ ] 生成完整的复盘报告

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
