# 📅 Week 13 Day 4：方向D - GUI/Web Agent

## 🧭 今日方向
> 学习如何构建能够操作图形界面和网页的 Agent 系统。

## 🎯 生活比喻
> GUI/Web Agent 就像一个会用电脑的机器人。它能"看到"屏幕上的按钮和文字（视觉理解），能"点击"按钮（操作执行），能"输入"文字（键盘操作）。就像一个能帮你自动完成电脑任务的助手。

## 📋 今日三件事
1. 理解 GUI Agent 的工作原理
2. 实现简单的屏幕理解和操作模拟
3. 构建一个 Web Agent 示例

## 🗺️ 手把手路线

### Step 1：GUI Agent 原理
- 做什么: 学习 GUI Agent 如何理解界面
- 为什么: 这是 GUI Agent 的核心
- 成功标志: 能解释 GUI Agent 的工作流程

### Step 2：界面元素识别
- 做什么: 学习如何识别界面元素
- 为什么: 识别是操作的前提
- 成功标志: 能实现简单的元素识别

### Step 3：操作执行
- 做什么: 学习如何执行点击、输入等操作
- 为什么: 这是 Agent 的输出
- 成功标志: 能模拟操作执行

## 💻 代码区

```python
"""
GUI/Web Agent
图形界面和网页操作
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from enum import Enum
import time

# ========== 1. 界面元素 ==========

class ElementType(Enum):
    """界面元素类型"""
    BUTTON = "button"
    TEXT_INPUT = "text_input"
    LINK = "link"
    TEXT = "text"
    IMAGE = "image"
    MENU = "menu"


@dataclass
class UIElement:
    """界面元素"""
    element_id: str
    element_type: ElementType
    text: str
    position: tuple  # (x, y)
    size: tuple  # (width, height)
    attributes: Dict = field(default_factory=dict)
    children: List['UIElement'] = field(default_factory=list)


# ========== 2. 屏幕状态 ==========

@dataclass
class ScreenState:
    """屏幕状态"""
    width: int
    height: int
    elements: List[UIElement]
    url: str = ""
    title: str = ""
    timestamp: float = 0.0


# ========== 3. 屏幕理解器 ==========

class ScreenUnderstanding:
    """屏幕理解器"""
    
    def __init__(self):
        self.history: List[ScreenState] = []
    
    def analyze(self, screen: ScreenState) -> Dict:
        """分析屏幕"""
        # 按类型统计元素
        element_counts = {}
        for elem in screen.elements:
            elem_type = elem.element_type.value
            element_counts[elem_type] = element_counts.get(elem_type, 0) + 1
        
        # 查找可交互元素
        interactive = [
            e for e in screen.elements
            if e.element_type in [ElementType.BUTTON, ElementType.TEXT_INPUT, ElementType.LINK]
        ]
        
        # 查找文本内容
        texts = [e.text for e in screen.elements if e.text]
        
        analysis = {
            "element_counts": element_counts,
            "interactive_count": len(interactive),
            "texts": texts[:5],  # 最多 5 个
            "interactive_elements": [
                {"id": e.element_id, "type": e.element_type.value, "text": e.text}
                for e in interactive[:5]
            ]
        }
        
        self.history.append(screen)
        return analysis
    
    def find_element(self, screen: ScreenState, query: str) -> Optional[UIElement]:
        """查找元素"""
        query_lower = query.lower()
        for elem in screen.elements:
            if query_lower in elem.text.lower():
                return elem
        return None


# ========== 4. 动作执行器 ==========

class ActionExecutor:
    """动作执行器"""
    
    def __init__(self):
        self.action_history: List[Dict] = []
    
    def click(self, element: UIElement) -> Dict:
        """点击操作"""
        action = {
            "type": "click",
            "element_id": element.element_id,
            "element_text": element.text,
            "position": element.position,
            "timestamp": time.time()
        }
        self.action_history.append(action)
        return {"success": True, "message": f"点击了: {element.text}"}
    
    def type_text(self, element: UIElement, text: str) -> Dict:
        """输入文字"""
        action = {
            "type": "type",
            "element_id": element.element_id,
            "text": text,
            "timestamp": time.time()
        }
        self.action_history.append(action)
        return {"success": True, "message": f"输入了: {text}"}
    
    def scroll(self, direction: str, amount: int = 100) -> Dict:
        """滚动操作"""
        action = {
            "type": "scroll",
            "direction": direction,
            "amount": amount,
            "timestamp": time.time()
        }
        self.action_history.append(action)
        return {"success": True, "message": f"滚动了: {direction} {amount}px"}
    
    def get_history(self) -> List[Dict]:
        return self.action_history


# ========== 5. GUI Agent ==========

class GUIAgent:
    """GUI Agent"""
    
    def __init__(self, name: str = "GUIAgent"):
        self.name = name
        self.understanding = ScreenUnderstanding()
        self.executor = ActionExecutor()
        self.current_screen: Optional[ScreenState] = None
        self.goal: str = ""
        self.plan: List[str] = []
    
    def set_goal(self, goal: str):
        """设置目标"""
        self.goal = goal
        self.plan = self._create_plan(goal)
    
    def _create_plan(self, goal: str) -> List[str]:
        """创建计划"""
        # 简化：根据关键词创建计划
        plan = ["分析当前屏幕"]
        
        if "搜索" in goal:
            plan.append("找到搜索框")
            plan.append("输入搜索内容")
            plan.append("点击搜索按钮")
        elif "登录" in goal:
            plan.append("找到用户名输入框")
            plan.append("输入用户名")
            plan.append("找到密码输入框")
            plan.append("输入密码")
            plan.append("点击登录按钮")
        else:
            plan.append("理解目标")
            plan.append("执行操作")
        
        plan.append("确认结果")
        return plan
    
    def observe(self, screen: ScreenState):
        """观察屏幕"""
        self.current_screen = screen
        analysis = self.understanding.analyze(screen)
        return analysis
    
    def think(self, analysis: Dict) -> str:
        """思考"""
        if not self.plan:
            return "没有设置目标"
        
        current_step = self.plan[0]
        return f"当前计划: {current_step}\n屏幕分析: 发现 {analysis['interactive_count']} 个可交互元素"
    
    def act(self) -> Optional[Dict]:
        """执行动作"""
        if not self.current_screen or not self.plan:
            return None
        
        current_step = self.plan[0]
        
        # 根据步骤执行动作
        if "搜索框" in current_step:
            element = self.understanding.find_element(self.current_screen, "搜索")
            if element:
                result = self.executor.click(element)
                self.plan.pop(0)
                return result
        
        elif "输入" in current_step:
            # 查找输入框
            for elem in self.current_screen.elements:
                if elem.element_type == ElementType.TEXT_INPUT:
                    result = self.executor.type_text(elem, "示例输入")
                    self.plan.pop(0)
                    return result
        
        # 默认：移除当前步骤
        if self.plan:
            self.plan.pop(0)
        
        return {"success": True, "message": "执行了默认动作"}
    
    def step(self) -> Dict:
        """执行一步"""
        if not self.current_screen:
            return {"error": "没有屏幕数据"}
        
        # 分析
        analysis = self.observe(self.current_screen)
        
        # 思考
        thought = self.think(analysis)
        
        # 行动
        action_result = self.act()
        
        return {
            "thought": thought,
            "action": action_result,
            "remaining_plan": len(self.plan),
            "goal": self.goal
        }
    
    def run(self, screen: ScreenState, max_steps: int = 10) -> List[Dict]:
        """运行 Agent"""
        self.observe(screen)
        results = []
        
        for _ in range(max_steps):
            if not self.plan:
                break
            
            result = self.step()
            results.append(result)
        
        return results


# ========== 6. 示例运行 ==========

def create_sample_screen() -> ScreenState:
    """创建示例屏幕"""
    elements = [
        UIElement("btn_search", ElementType.BUTTON, "搜索", (100, 50), (80, 30)),
        UIElement("input_query", ElementType.TEXT_INPUT, "搜索框", (100, 100), (200, 30)),
        UIElement("link_home", ElementType.LINK, "首页", (10, 10), (50, 20)),
        UIElement("text_title", ElementType.TEXT, "示例网页", (100, 20), (200, 40)),
    ]
    
    return ScreenState(
        width=800,
        height=600,
        elements=elements,
        url="https://example.com",
        title="示例网页",
        timestamp=time.time()
    )


def main():
    print("=" * 60)
    print("GUI/Web Agent")
    print("=" * 60)
    
    # 1. 创建 Agent
    agent = GUIAgent("WebAgent")
    
    # 2. 设置目标
    print("\n1. 设置目标...")
    agent.set_goal("搜索 Python 教程")
    print(f"   目标: {agent.goal}")
    print(f"   计划: {agent.plan}")
    
    # 3. 创建示例屏幕
    screen = create_sample_screen()
    
    # 4. 运行 Agent
    print("\n2. 运行 Agent...")
    results = agent.run(screen, max_steps=5)
    
    for i, result in enumerate(results):
        print(f"\n   Step {i+1}:")
        print(f"     思考: {result['thought'][:50]}...")
        if result['action']:
            print(f"     动作: {result['action'].get('message', '')}")
    
    # 5. 查看操作历史
    print("\n3. 操作历史:")
    for action in agent.executor.get_history():
        print(f"   {action['type']}: {action.get('element_text', '')}")
    
    # 6. 架构图
    print("\n4. GUI Agent 架构:")
    print("-" * 40)
    print("""
    ┌─────────────────────────────────────────┐
    │              GUI Agent                   │
    │  ┌─────────────────────────────────┐   │
    │  │         屏幕理解                 │   │
    │  │    (Screen Understanding)       │   │
    │  └───────────────┬─────────────────┘   │
    │                  │                      │
    │  ┌───────────────▼───────────────┐   │
    │  │         思考与规划             │   │
    │  │    (Think & Plan)             │   │
    │  └───────────────┬───────────────┘   │
    │                  │                      │
    │  ┌───────────────▼───────────────┐   │
    │  │         动作执行               │   │
    │  │    (Action Execution)         │   │
    │  │  ┌─────┐  ┌─────┐  ┌─────┐ │   │
    │  │  │点击 │  │输入 │  │滚动 │ │   │
    │  │  └─────┘  └─────┘  └─────┘ │   │
    │  └───────────────────────────────┘   │
    └─────────────────────────────────────────┘
""")
    
    print("\n5. GUI Agent 应用场景:")
    print("-" * 40)
    print("  1. 自动化测试")
    print("  2. 网页数据抓取")
    print("  3. 自动表单填写")
    print("  4. UI 自动化操作")


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 元素识别失败 | 优化 OCR 和元素定位 |
| 2 | 操作执行延迟 | 使用异步操作 |
| 3 | 页面变化导致失败 | 实时监控页面状态 |
| 4 | 无法处理动态内容 | 使用 JavaScript 注入 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| GUI Agent | 能操作图形界面的 Agent |
| Screen Understanding | 理解屏幕内容 |
| Element Recognition | 识别界面元素 |
| Action Execution | 执行操作（点击、输入等） |
| OCR | 光学字符识别 |

## ✅ 验收清单
- [ ] 理解 GUI Agent 工作原理
- [ ] 能实现界面元素识别
- [ ] 能模拟操作执行
- [ ] 代码能跑通

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
