# Day 5: WebSocket 实时通信

## 今日学习目标

1. 理解 WebSocket 协议原理
2. 掌握 HTTP vs WebSocket 的区别
3. 使用 FastAPI 实现 WebSocket 服务
4. 构建简单的聊天应用
5. 理解连接管理的重要性

---

## 第一部分：WebSocket 基础

### HTTP vs WebSocket

**类比理解：**
- HTTP 就像寄信：你写信寄出去，等待回信，一来一回
- WebSocket 就像打电话：建立连接后，双方可以随时说话，实时听到对方的回应

### 对比表

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 连接方式 | 短连接 | 长连接 |
| 通信方向 | 单向（客户端发起） | 双向 |
| 数据格式 | 文本 | 文本/二进制 |
| 延迟 | 较高（每次握手） | 低（建立后直接通信） |
| 适用场景 | 请求-响应 | 实时通信 |

### WebSocket 工作流程

```
1. 客户端发起 WebSocket 握手请求
   ↓
2. 服务器响应 101 Switching Protocols
   ↓
3. 连接建立成功
   ↓
4. 双方可以随时发送消息
   ↓
5. 一方关闭连接
   ↓
6. 连接断开
```

---

## 第二部分：基础 WebSocket 示例

### 文件：app/api/websocket.py

```python
"""
WebSocket 基础示例
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio
from datetime import datetime

app = FastAPI(title="WebSocket 示例")


# ==================== 1. 基础 WebSocket 端点 ====================

@app.websocket("/ws/basic")
async def websocket_basic(websocket: WebSocket):
    """
    基础 WebSocket 端点
    
    客户端连接后，可以发送消息，服务器会回显
    """
    # 接受连接
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


# ==================== 2. 带时间戳的 WebSocket ====================

@app.websocket("/ws/timestamp")
async def websocket_timestamp(websocket: WebSocket):
    """
    带时间戳的 WebSocket
    
    每条消息都会附加时间戳
    """
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
            
            # 发送 JSON 响应
            await websocket.send_json(response)
    
    except WebSocketDisconnect:
        print("客户端断开连接")


# ==================== 3. 心跳检测 WebSocket ====================

@app.websocket("/ws/heartbeat")
async def websocket_heartbeat(websocket: WebSocket):
    """
    带心跳检测的 WebSocket
    
    服务器定期发送心跳，检测客户端是否在线
    """
    await websocket.accept()
    
    try:
        while True:
            # 发送心跳
            await websocket.send_json({
                "type": "heartbeat",
                "timestamp": datetime.now().isoformat()
            })
            
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


# ==================== 4. 广播 WebSocket ====================

class ConnectionManager:
    """连接管理器 - 管理所有 WebSocket 连接"""
    
    def __init__(self):
        # 存储所有活跃连接
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        """接受新连接"""
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"新连接，当前连接数: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """断开连接"""
        self.active_connections.remove(websocket)
        print(f"连接断开，当前连接数: {len(self.active_connections)}")
    
    async def broadcast(self, message: str):
        """广播消息给所有连接"""
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                # 连接已断开，移除
                self.active_connections.remove(connection)


# 创建连接管理器
manager = ConnectionManager()


@app.websocket("/ws/broadcast/{username}")
async def websocket_broadcast(websocket: WebSocket, username: str):
    """
    广播 WebSocket
    
    一个用户发送的消息会广播给所有连接的用户
    """
    await manager.connect(websocket)
    
    try:
        # 发送欢迎消息
        await manager.broadcast(f"用户 {username} 加入了聊天室")
        
        while True:
            # 接收消息
            data = await websocket.receive_text()
            
            # 广播消息
            message = f"{username}: {data}"
            await manager.broadcast(message)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"用户 {username} 离开了聊天室")
```

---

## 第三部分：完整聊天应用

### 文件：app/api/chat.py

```python
"""
完整聊天应用
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from typing import List, Dict, Set
from dataclasses import dataclass, field
from datetime import datetime
import json

app = FastAPI(title="聊天应用")


# ==================== 数据模型 ====================

@dataclass
class Message:
    """消息数据类"""
    username: str
    content: str
    timestamp: datetime = field(default_factory=datetime.now)
    message_type: str = "text"  # text, system, private
    
    def to_dict(self) -> dict:
        return {
            "username": self.username,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "message_type": self.message_type
        }


class ChatRoom:
    """聊天室"""
    
    def __init__(self, name: str, max_users: int = 100):
        self.name = name
        self.max_users = max_users
        self.active_connections: Dict[WebSocket, str] = {}  # websocket -> username
        self.message_history: List[dict] = []
        self.max_history = 100
    
    async def connect(self, websocket: WebSocket, username: str):
        """用户加入聊天室"""
        # 检查用户数量
        if len(self.active_connections) >= self.max_users:
            await websocket.close(code=1013, reason="聊天室已满")
            return False
        
        # 检查用户名是否已存在
        if username in self.active_connections.values():
            await websocket.send_json({
                "type": "error",
                "message": "用户名已存在"
            })
            await websocket.close()
            return False
        
        # 接受连接
        await websocket.accept()
        self.active_connections[websocket] = username
        
        # 发送欢迎消息
        welcome = Message(
            username="系统",
            content=f"{username} 加入了聊天室",
            message_type="system"
        )
        await self.broadcast(welcome)
        
        # 发送历史消息（最近20条）
        for msg in self.message_history[-20:]:
            await websocket.send_json(msg)
        
        print(f"{username} 加入聊天室 {self.name}，当前在线: {len(self.active_connections)}")
        return True
    
    def disconnect(self, websocket: WebSocket):
        """用户离开聊天室"""
        username = self.active_connections.pop(websocket, None)
        if username:
            print(f"{username} 离开聊天室 {self.name}，当前在线: {len(self.active_connections)}")
    
    async def broadcast(self, message: Message):
        """广播消息"""
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
    
    async def send_personal(self, websocket: WebSocket, message: Message):
        """发送私人消息"""
        await websocket.send_json(message.to_dict())
    
    def get_online_users(self) -> List[str]:
        """获取在线用户列表"""
        return list(self.active_connections.values())
    
    def get_user_count(self) -> int:
        """获取在线用户数量"""
        return len(self.active_connections)


# ==================== 聊天室管理 ====================

# 存储所有聊天室
chat_rooms: Dict[str, ChatRoom] = {}


def get_or_create_room(room_name: str) -> ChatRoom:
    """获取或创建聊天室"""
    if room_name not in chat_rooms:
        chat_rooms[room_name] = ChatRoom(room_name)
    return chat_rooms[room_name]


# ==================== WebSocket 端点 ====================

@app.websocket("/ws/chat/{room_name}/{username}")
async def websocket_chat(
    websocket: WebSocket, 
    room_name: str, 
    username: str
):
    """
    聊天 WebSocket 端点
    
    连接地址: ws://localhost:8000/ws/chat/{room_name}/{username}
    """
    # 获取或创建聊天室
    room = get_or_create_room(room_name)
    
    # 连接
    connected = await room.connect(websocket, username)
    if not connected:
        return
    
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
            
            # 处理特殊命令
            if content.startswith("/"):
                await handle_command(room, websocket, username, content)
            else:
                # 广播普通消息
                message = Message(
                    username=username,
                    content=content,
                    message_type=message_type
                )
                await room.broadcast(message)
    
    except WebSocketDisconnect:
        room.disconnect(websocket)
        # 发送离开消息
        leave = Message(
            username="系统",
            content=f"{username} 离开了聊天室",
            message_type="system"
        )
        await room.broadcast(leave)


async def handle_command(
    room: ChatRoom, 
    websocket: WebSocket, 
    username: str, 
    command: str
):
    """处理聊天命令"""
    cmd = command.lower().strip()
    
    if cmd == "/online":
        # 获取在线用户
        users = room.get_online_users()
        response = Message(
            username="系统",
            content=f"在线用户 ({len(users)}): {', '.join(users)}",
            message_type="system"
        )
        await room.send_personal(websocket, response)
    
    elif cmd == "/help":
        # 显示帮助
        help_text = """
可用命令:
/online - 查看在线用户
/help - 显示帮助信息
/clear - 清空聊天记录
/rooms - 查看所有聊天室
"""
        response = Message(
            username="系统",
            content=help_text,
            message_type="system"
        )
        await room.send_personal(websocket, response)
    
    elif cmd == "/clear":
        # 清空聊天记录
        room.message_history.clear()
        response = Message(
            username="系统",
            content="聊天记录已清空",
            message_type="system"
        )
        await room.broadcast(response)
    
    elif cmd == "/rooms":
        # 查看所有聊天室
        rooms = list(chat_rooms.keys())
        response = Message(
            username="系统",
            content=f"所有聊天室: {', '.join(rooms)}",
            message_type="system"
        )
        await room.send_personal(websocket, response)
    
    else:
        # 未知命令
        response = Message(
            username="系统",
            content=f"未知命令: {command}，输入 /help 查看帮助",
            message_type="system"
        )
        await room.send_personal(websocket, response)


# ==================== REST API 端点 ====================

@app.get("/api/chat/rooms")
async def list_rooms():
    """获取所有聊天室"""
    rooms = []
    for name, room in chat_rooms.items():
        rooms.append({
            "name": name,
            "users": room.get_user_count(),
            "messages": len(room.message_history)
        })
    return {"rooms": rooms}


@app.get("/api/chat/rooms/{room_name}/online")
async def get_online_users(room_name: str):
    """获取聊天室在线用户"""
    if room_name not in chat_rooms:
        return {"error": "聊天室不存在"}
    
    room = chat_rooms[room_name]
    return {
        "room": room_name,
        "users": room.get_online_users(),
        "count": room.get_user_count()
    }


@app.get("/api/chat/rooms/{room_name}/history")
async def get_message_history(room_name: str, limit: int = 50):
    """获取聊天历史"""
    if room_name not in chat_rooms:
        return {"error": "聊天室不存在"}
    
    room = chat_rooms[room_name]
    return {
        "room": room_name,
        "messages": room.message_history[-limit:]
    }


# ==================== WebSocket 客户端示例 ====================

CLIENT_EXAMPLE = """
// WebSocket 客户端示例（JavaScript）

// 连接到聊天室
const roomName = "general";
const username = "testuser";
const ws = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/${username}`);

// 连接成功
ws.onopen = function() {
    console.log("已连接到聊天室");
    
    // 发送消息
    ws.send(JSON.stringify({
        content: "你好！",
        type: "text"
    }));
};

// 接收消息
ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log(`[${data.username}] ${data.content}`);
};

// 连接关闭
ws.onclose = function() {
    console.log("已断开连接");
};

// 连接错误
ws.onerror = function(error) {
    console.error("WebSocket 错误:", error);
};

// 发送消息
function sendMessage(content) {
    ws.send(JSON.stringify({
        content: content,
        type: "text"
    }));
}

// 执行命令
function sendCommand(command) {
    ws.send(command);
}

// 示例：发送消息
sendMessage("Hello, everyone!");
sendCommand("/online");
sendCommand("/help");
"""

print(CLIENT_EXAMPLE)


# ==================== 启动 ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 第四部分：测试 WebSocket

### 测试脚本

```python
"""
WebSocket 测试脚本
"""

import asyncio
import websockets
import json
from datetime import datetime


async def test_basic_websocket():
    """测试基础 WebSocket"""
    print("=== 测试基础 WebSocket ===\n")
    
    uri = "ws://localhost:8000/ws/basic"
    
    async with websockets.connect(uri) as websocket:
        # 发送测试消息
        messages = ["你好", "今天天气怎么样", "再见"]
        
        for msg in messages:
            await websocket.send(msg)
            response = await websocket.recv()
            print(f"发送: {msg}")
            print(f"接收: {response}\n")


async def test_chat():
    """测试聊天功能"""
    print("=== 测试聊天功能 ===\n")
    
    room = "test-room"
    username = "testuser"
    uri = f"ws://localhost:8000/ws/chat/{room}/{username}"
    
    async with websockets.connect(uri) as websocket:
        # 等待接收历史消息
        await asyncio.sleep(1)
        
        # 发送测试消息
        messages = ["大家好！", "今天学习 WebSocket", "感觉很有趣"]
        
        for msg in messages:
            await websocket.send(json.dumps({
                "content": msg,
                "type": "text"
            }))
            print(f"发送: {msg}")
            await asyncio.sleep(0.5)
        
        # 测试命令
        await websocket.send("/online")
        print("发送命令: /online")
        
        await websocket.send("/help")
        print("发送命令: /help")
        
        # 等待接收响应
        await asyncio.sleep(2)
        
        print("\n测试完成")


async def test_multiple_users():
    """测试多用户聊天"""
    print("=== 测试多用户聊天 ===\n")
    
    room = "multi-user-room"
    
    async def user_session(username: str, messages: list):
        """用户会话"""
        uri = f"ws://localhost:8000/ws/chat/{room}/{username}"
        
        async with websockets.connect(uri) as websocket:
            await asyncio.sleep(0.5)
            
            for msg in messages:
                await websocket.send(json.dumps({
                    "content": msg,
                    "type": "text"
                }))
                print(f"{username} 发送: {msg}")
                await asyncio.sleep(0.3)
            
            # 等待接收其他用户的消息
            await asyncio.sleep(1)
    
    # 创建多个用户会话
    tasks = [
        user_session("用户1", ["你好", "我是用户1"]),
        user_session("用户2", ["大家好", "我是用户2"]),
        user_session("用户3", ["Hi", "我是用户3"]),
    ]
    
    await asyncio.gather(*tasks)
    print("\n多用户测试完成")


if __name__ == "__main__":
    # 运行测试
    asyncio.run(test_basic_websocket())
    asyncio.run(test_chat())
    asyncio.run(test_multiple_users())
```

---

## 第五部分：WebSocket 最佳实践

### 连接管理

```python
"""
连接管理最佳实践
"""

class ConnectionManager:
    """连接管理器"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_metadata: Dict[str, dict] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str, metadata: dict = None):
        """连接"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        if metadata:
            self.user_metadata[user_id] = metadata
    
    def disconnect(self, user_id: str):
        """断开连接"""
        self.active_connections.pop(user_id, None)
        self.user_metadata.pop(user_id, None)
    
    async def send_personal(self, user_id: str, message: str):
        """发送私人消息"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(message)
            except Exception:
                self.disconnect(user_id)
    
    async def broadcast(self, message: str, exclude: str = None):
        """广播消息"""
        disconnected = []
        for user_id, connection in self.active_connections.items():
            if user_id != exclude:
                try:
                    await connection.send_text(message)
                except Exception:
                    disconnected.append(user_id)
        
        for user_id in disconnected:
            self.disconnect(user_id)
    
    def is_connected(self, user_id: str) -> bool:
        """检查用户是否在线"""
        return user_id in self.active_connections
    
    def get_online_users(self) -> List[str]:
        """获取在线用户列表"""
        return list(self.active_connections.keys())
```

### 错误处理

```python
"""
WebSocket 错误处理
"""

from fastapi import WebSocket, WebSocketDisconnect
import traceback


async def safe_websocket_handler(websocket: WebSocket):
    """安全的 WebSocket 处理器"""
    try:
        await websocket.accept()
        
        while True:
            try:
                data = await websocket.receive_text()
                # 处理消息...
                await websocket.send_text(f"Echo: {data}")
            
            except json.JSONDecodeError as e:
                await websocket.send_json({
                    "type": "error",
                    "message": "无效的 JSON 格式"
                })
            
            except Exception as e:
                print(f"处理消息时出错: {e}")
                traceback.print_exc()
    
    except WebSocketDisconnect:
        print("客户端断开连接")
    
    except Exception as e:
        print(f"WebSocket 错误: {e}")
        traceback.print_exc()
    
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
```

---

## 验证清单

完成今日学习后，检查以下项目：

- [ ] 理解 WebSocket 和 HTTP 的区别
- [ ] 能创建基础 WebSocket 端点
- [ ] 实现了消息广播功能
- [ ] 实现了连接管理
- [ ] 实现了聊天命令
- [ ] 测试了多用户聊天
- [ ] 理解了心跳检测
- [ ] 理解了错误处理

---

## 今日小结

| 概念 | 关键点 |
|------|--------|
| WebSocket | 全双工通信协议 |
| 连接管理 | 管理所有活跃连接 |
| 广播 | 向所有连接发送消息 |
| 心跳 | 检测连接是否存活 |
| 命令 | 特殊格式的消息处理 |
| 历史记录 | 存储和发送历史消息 |
| 错误处理 | 优雅地处理断开和错误 |

---

## 明日预告

明天我们将学习：
- JSON Mode 和结构化输出
- Pydantic Schema 验证
- LLM 结构化输出
- 实战应用示例

---

## 参考资源

- [WebSocket 协议](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [FastAPI WebSocket 教程](https://fastapi.tiangolo.com/advanced/websockets/)
- [WebSockets 最佳实践](https://websockets.readthedocs.io/)
