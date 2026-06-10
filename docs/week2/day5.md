# 📅 Week 2 Day 5：WebSocket 实时通信

## 🧭 今日方向
> 今天我们将学习 WebSocket 技术，实现实时双向通信，为 Agent 开发聊天功能奠定基础。

## 🎯 生活比喻
> HTTP 就像寄信：一来一回；WebSocket 就像打电话：随时可以说话，实时听到对方的回应。

## 📋 今日三件事
1. 理解 WebSocket 协议原理
2. 使用 FastAPI 实现 WebSocket 服务
3. 构建简单的聊天应用

## 🗺️ 手把手路线

### Step 1: WebSocket 基础
- **做什么**: 理解 WebSocket 的工作原理
- **为什么**: WebSocket 是实现实时通信的关键技术
- **成功标志**: 能解释 WebSocket 和 HTTP 的区别

### Step 2: FastAPI WebSocket
- **做什么**: 使用 FastAPI 创建 WebSocket 端点
- **为什么**: FastAPI 对 WebSocket 有很好的支持
- **成功标志**: 能建立 WebSocket 连接并收发消息

### Step 3: 聊天应用
- **做什么**: 构建支持多用户的聊天室
- **为什么**: 聊天是 Agent 最常见的交互方式
- **成功标志**: 能实现多人实时聊天

## 💻 代码区

```python
# WebSocket 基础示例

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio
from datetime import datetime

app = FastAPI(title="Agent Factory API - WebSocket 示例")

# 1. 基础 WebSocket 端点
@app.websocket("/ws/basic")
async def websocket_basic(websocket: WebSocket):
    """基础 WebSocket 端点"""
    await websocket.accept()
    
    try:
        while True:
            # 接收消息
            data = await websocket.receive_text()
            print(f"收到消息: {data}")
            
            # 发送响应
            response = f"服务器收到: {data}"
            await websocket.send_text(response)
    
    except WebSocketDisconnect:
        print("客户端断开连接")

# 2. 带时间戳的 WebSocket
@app.websocket("/ws/timestamp")
async def websocket_timestamp(websocket: WebSocket):
    """带时间戳的 WebSocket"""
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            
            # 添加时间戳
            timestamp = datetime.now().isoformat()
            response = {
                "message": data,
                "timestamp": timestamp,
                "server": "Agent Factory"
            }
            
            await websocket.send_json(response)
    
    except WebSocketDisconnect:
        print("客户端断开连接")

# 3. 心跳检测 WebSocket
@app.websocket("/ws/heartbeat")
async def websocket_heartbeat(websocket: WebSocket):
    """带心跳检测的 WebSocket"""
    await websocket.accept()
    
    try:
        while True:
            # 发送心跳
            await websocket.send_json({"type": "heartbeat"})
            
            # 等待客户端响应
            try:
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30.0
                )
                print(f"心跳响应: {data}")
            except asyncio.TimeoutError:
                print("心跳超时，关闭连接")
                break
    
    except WebSocketDisconnect:
        print("客户端断开连接")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

```python
# 多人聊天室实现

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List, Dict, Set
from dataclasses import dataclass, field
from datetime import datetime
import json

app = FastAPI(title="Agent Factory - 聊天室")

@dataclass
class Message:
    """消息数据类"""
    username: str
    content: str
    timestamp: datetime = field(default_factory=datetime.now)
    message_type: str = "text"
    
    def to_dict(self) -> dict:
        return {
            "username": self.username,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "message_type": self.message_type
        }

class ConnectionManager:
    """连接管理器"""
    
    def __init__(self):
        # 存储所有连接: {websocket: username}
        self.active_connections: Dict[WebSocket, str] = {}
        # 消息历史
        self.message_history: List[dict] = []
        # 最大历史消息数
        self.max_history = 100
    
    async def connect(self, websocket: WebSocket, username: str):
        """接受新连接"""
        await websocket.accept()
        self.active_connections[websocket] = username
        
        # 发送欢迎消息
        welcome_message = Message(
            username="系统",
            content=f"{username} 加入了聊天室",
            message_type="system"
        )
        await self.broadcast(welcome_message)
        
        # 发送历史消息
        for msg in self.message_history[-20:]:
            await websocket.send_json(msg)
        
        print(f"{username} 已连接，当前在线人数: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """断开连接"""
        username = self.active_connections.pop(websocket, None)
        if username:
            # 发送离开消息
            leave_message = Message(
                username="系统",
                content=f"{username} 离开了聊天室",
                message_type="system"
            )
            # 同步广播（因为已经在断开过程中）
            self.message_history.append(leave_message.to_dict())
            print(f"{username} 已断开，当前在线人数: {len(self.active_connections)}")
    
    async def broadcast(self, message: Message):
        """广播消息给所有连接"""
        message_dict = message.to_dict()
        self.message_history.append(message_dict)
        
        # 限制历史消息数量
        if len(self.message_history) > self.max_history:
            self.message_history = self.message_history[-self.max_history:]
        
        # 广播给所有连接
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message_dict)
            except Exception:
                disconnected.append(connection)
        
        # 清理断开的连接
        for connection in disconnected:
            self.disconnect(connection)
    
    async def send_personal_message(self, message: Message, websocket: WebSocket):
        """发送私人消息"""
        await websocket.send_json(message.to_dict())
    
    def get_online_users(self) -> List[str]:
        """获取在线用户列表"""
        return list(self.active_connections.values())
    
    def get_user_count(self) -> int:
        """获取在线用户数量"""
        return len(self.active_connections)

# 创建连接管理器
manager = ConnectionManager()

# WebSocket 端点
@app.websocket("/ws/chat/{username}")
async def websocket_chat(websocket: WebSocket, username: str):
    """聊天 WebSocket 端点"""
    await manager.connect(websocket, username)
    
    try:
        while True:
            # 接收消息
            data = await websocket.receive_text()
            
            # 解析消息
            try:
                message_data = json.loads(data)
                content = message_data.get("content", data)
                message_type = message_data.get("type", "text")
            except json.JSONDecodeError:
                content = data
                message_type = "text"
            
            # 创建消息对象
            message = Message(
                username=username,
                content=content,
                message_type=message_type
            )
            
            # 处理特殊命令
            if content.startswith("/"):
                await handle_command(message, websocket)
            else:
                # 广播普通消息
                await manager.broadcast(message)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # 发送离开消息
        leave_message = Message(
            username="系统",
            content=f"{username} 离开了聊天室",
            message_type="system"
        )
        await manager.broadcast(leave_message)

async def handle_command(message: Message, websocket: WebSocket):
    """处理聊天命令"""
    content = message.content.lower()
    
    if content == "/online":
        # 获取在线用户
        users = manager.get_online_users()
        response = Message(
            username="系统",
            content=f"在线用户 ({len(users)}): {', '.join(users)}",
            message_type="system"
        )
        await manager.send_personal_message(response, websocket)
    
    elif content == "/help":
        # 显示帮助信息
        help_text = """
可用命令:
/online - 查看在线用户
/help - 显示帮助信息
/clear - 清空聊天记录
"""
        response = Message(
            username="系统",
            content=help_text,
            message_type="system"
        )
        await manager.send_personal_message(response, websocket)
    
    elif content == "/clear":
        # 清空聊天记录
        manager.message_history.clear()
        response = Message(
            username="系统",
            content="聊天记录已清空",
            message_type="system"
        )
        await manager.broadcast(response)
    
    else:
        # 未知命令
        response = Message(
            username="系统",
            content=f"未知命令: {content}，输入 /help 查看帮助",
            message_type="system"
        )
        await manager.send_personal_message(response, websocket)

# REST API 端点
@app.get("/api/chat/online")
async def get_online_users():
    """获取在线用户列表"""
    return {
        "users": manager.get_online_users(),
        "count": manager.get_user_count()
    }

@app.get("/api/chat/history")
async def get_message_history(limit: int = 50):
    """获取聊天历史"""
    return {
        "messages": manager.message_history[-limit:]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

```python
# WebSocket 客户端示例

import asyncio
import websockets
import json
from datetime import datetime

async def chat_client(username: str, server_url: str = "ws://localhost:8000"):
    """聊天客户端"""
    uri = f"{server_url}/ws/chat/{username}"
    
    async with websockets.connect(uri) as websocket:
        print(f"已连接到聊天室，用户名: {username}")
        print("输入消息发送，输入 /quit 退出")
        
        # 启动接收消息的任务
        async def receive_messages():
            async for message in websocket:
                data = json.loads(message)
                timestamp = data.get("timestamp", "")
                username = data.get("username", "")
                content = data.get("content", "")
                msg_type = data.get("message_type", "text")
                
                if msg_type == "system":
                    print(f"[系统] {content}")
                else:
                    print(f"[{username}] {content}")
        
        # 启动接收任务
        receive_task = asyncio.create_task(receive_messages())
        
        try:
            while True:
                # 读取用户输入
                message = await asyncio.get_event_loop().run_in_executor(
                    None, input
                )
                
                if message.lower() == "/quit":
                    break
                
                # 发送消息
                await websocket.send(json.dumps({
                    "content": message,
                    "type": "text"
                }))
        
        except KeyboardInterrupt:
            pass
        finally:
            receive_task.cancel()
            print("已断开连接")

async def auto_chat_client(username: str, messages: list):
    """自动聊天客户端（用于测试）"""
    uri = f"ws://localhost:8000/ws/chat/{username}"
    
    async with websockets.connect(uri) as websocket:
        print(f"{username} 已连接")
        
        # 发送测试消息
        for message in messages:
            await websocket.send(json.dumps({
                "content": message,
                "type": "text"
            }))
            print(f"{username} 发送: {message}")
            await asyncio.sleep(1)
        
        # 等待接收消息
        await asyncio.sleep(5)
        print(f"{username} 断开连接")

if __name__ == "__main__":
    # 运行客户端
    # asyncio.run(chat_client("测试用户"))
    
    # 运行自动测试客户端
    asyncio.run(auto_chat_client("用户1", ["你好", "今天天气怎么样", "再见"]))
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | WebSocket 连接失败 | 检查服务器是否运行，URL 是否正确 |
| 2 | 消息接收不到 | 检查消息格式，确保使用 JSON |
| 3 | 连接频繁断开 | 实现心跳检测，定期发送 ping |
| 4 | 内存占用过高 | 限制消息历史数量，定期清理 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| WebSocket | 全双工通信协议，支持实时双向数据传输 |
| 连接管理器 | 管理所有 WebSocket 连接的类 |
| 广播 | 向所有连接的客户端发送消息 |
| 心跳 | 定期发送的探测消息，检测连接是否存活 |
| 断开连接 | 客户端主动或被动关闭连接 |
| 消息历史 | 存储的历史聊天记录 |

## ✅ 验收清单
- [ ] 理解 WebSocket 协议原理
- [ ] 能创建 WebSocket 端点
- [ ] 实现多人聊天室功能
- [ ] 理解连接管理的重要性

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
