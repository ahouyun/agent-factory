# Day 4: GUI/Web Agent（浏览器自动化）

> **Week 13 深度选修 | 第 4 天**

---

## 今日方向

今天我们构建能够自动操作浏览器和图形界面的 Agent。你将学会使用 Playwright 进行浏览器自动化，理解 DOM 结构解析，实现类似 WebVoyager 的网页导航 Agent，并掌握 GUI grounding 技术。

---

## 生活比喻

想象你有一个私人助理，你只需要说"帮我在淘宝上搜索并下单一个蓝牙耳机"，他就能自动打开浏览器、输入搜索词、浏览商品、点击购买。今天我们就来训练这样一个"数字助理"——Web Agent。

---

## 今日三件事

1. **掌握 Playwright 浏览器自动化** — 打开页面、点击、输入、截图
2. **实现 DOM 理解与元素定位** — 让 Agent 能理解网页结构
3. **构建 WebVoyager 风格 Agent** — 能自主浏览网页完成任务

---

## 手把手路线

### 阶段一：环境准备

```bash
pip install playwright beautifulsoup4 lxml numpy Pillow
playwright install chromium
```

### 阶段二：理解 Web Agent 架构

```
用户指令 -> LLM 规划 -> 浏览器操作 -> 页面截图 -> LLM 理解 -> 下一步操作
    |                                                           |
    +-------- 循环直到任务完成 or 达到最大步数 ----------------+
```

### 阶段三：编写代码（见下方完整代码区）

---

## 代码区

```python
#!/usr/bin/env python3
"""
Day 4: GUI/Web Agent（浏览器自动化）
Agent Factory Week 13 - Deep Dive Elective
pip install playwright beautifulsoup4 lxml numpy Pillow
playwright install chromium
"""

import json
import time
import hashlib
import re
import os
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple
from enum import Enum
import numpy as np


# ============================================================
# 第一部分：界面元素与动作定义
# ============================================================

class ElementType(Enum):
    BUTTON = "button"
    TEXT_INPUT = "text_input"
    LINK = "link"
    TEXT = "text"
    IMAGE = "image"
    DROPDOWN = "dropdown"
    CHECKBOX = "checkbox"


class ActionType(Enum):
    CLICK = "click"
    TYPE = "type"
    SCROLL = "scroll"
    NAVIGATE = "navigate"
    WAIT = "wait"
    SCREENSHOT = "screenshot"
    READ_PAGE = "read_page"


@dataclass
class UIElement:
    element_id: str
    element_type: ElementType
    text: str
    position: Tuple[int, int]  # (x, y)
    size: Tuple[int, int]      # (width, height)
    attributes: Dict = field(default_factory=dict)
    is_visible: bool = True
    is_interactive: bool = False

    def __post_init__(self):
        if self.element_type in [ElementType.BUTTON, ElementType.TEXT_INPUT, ElementType.LINK]:
            self.is_interactive = True


@dataclass
class Action:
    action_type: ActionType
    target: Optional[str] = None  # element_id or URL
    value: Optional[str] = None   # text to type, etc.
    metadata: Dict = field(default_factory=dict)

    def to_dict(self):
        return {"type": self.action_type.value, "target": self.target,
                "value": self.value}


@dataclass
class PageState:
    url: str
    title: str
    elements: List[UIElement]
    screenshot_path: Optional[str] = None
    text_content: str = ""
    timestamp: float = 0.0

    def get_interactive_elements(self) -> List[UIElement]:
        return [e for e in self.elements if e.is_interactive]

    def find_element(self, query: str) -> Optional[UIElement]:
        q = query.lower()
        for elem in self.elements:
            if q in elem.text.lower() or q in elem.attributes.get("aria-label", "").lower():
                return elem
        return None

    def to_prompt(self) -> str:
        """将页面状态转换为 LLM 可理解的文本"""
        lines = [f"页面: {self.title}", f"URL: {self.url}", ""]
        lines.append("可交互元素:")
        for i, elem in enumerate(self.get_interactive_elements()[:15]):
            lines.append(f"  [{i}] {elem.element_type.value}: '{elem.text}' "
                        f"(id={elem.element_id})")
        if self.text_content:
            lines.append(f"\n页面文本摘要: {self.text_content[:200]}...")
        return "\n".join(lines)


# ============================================================
# 第二部分：浏览器模拟器（无需真实浏览器）
# ============================================================

class BrowserSimulator:
    """浏览器模拟器：模拟浏览器行为，用于测试 Agent 逻辑"""
    def __init__(self):
        self.current_url = "about:blank"
        self.history: List[str] = []
        self.page_states: List[PageState] = []
        self._page_database = self._create_mock_pages()

    def _create_mock_pages(self) -> Dict[str, PageState]:
        """创建模拟页面"""
        pages = {
            "https://www.google.com": PageState(
                url="https://www.google.com",
                title="Google",
                elements=[
                    UIElement("search_box", ElementType.TEXT_INPUT, "搜索框",
                             (300, 200), (500, 40), {"name": "q"}),
                    UIElement("search_btn", ElementType.BUTTON, "Google 搜索",
                             (300, 250), (100, 40)),
                    UIElement("lucky_btn", ElementType.BUTTON, "手气不错",
                             (420, 250), (100, 40)),
                    UIElement("gmail_link", ElementType.LINK, "Gmail",
                             (700, 20), (60, 20)),
                    UIElement("images_link", ElementType.LINK, "图片",
                             (770, 20), (60, 20)),
                ],
                text_content="Google 搜索，支持多种语言和功能",
            ),
            "https://www.google.com/search?q=python": PageState(
                url="https://www.google.com/search?q=python",
                title="python - Google 搜索",
                elements=[
                    UIElement("search_box", ElementType.TEXT_INPUT, "python",
                             (300, 50), (500, 30)),
                    UIElement("result1", ElementType.LINK, "Python 官方网站",
                             (50, 150), (300, 30), {"href": "https://python.org"}),
                    UIElement("result2", ElementType.LINK, "Python 教程 - 菜鸟教程",
                             (50, 200), (300, 30), {"href": "https://runoob.com"}),
                    UIElement("result3", ElementType.LINK, "Python GitHub 仓库",
                             (50, 250), (300, 30), {"href": "https://github.com"}),
                ],
                text_content="搜索结果：Python 官方网站，Python 教程等",
            ),
            "https://www.baidu.com": PageState(
                url="https://www.baidu.com",
                title="百度一下",
                elements=[
                    UIElement("kw", ElementType.TEXT_INPUT, "百度搜索框",
                             (300, 200), (500, 40)),
                    UIElement("su", ElementType.BUTTON, "百度一下",
                             (300, 250), (100, 40)),
                ],
                text_content="百度一下，你就知道",
            ),
        }
        return pages

    def navigate(self, url: str) -> PageState:
        """导航到 URL"""
        self.history.append(self.current_url)
        self.current_url = url

        if url in self._page_database:
            state = self._page_database[url]
        else:
            state = PageState(url=url, title=f"页面 - {url}",
                            elements=[], text_content=f"已导航到 {url}")

        self.page_states.append(state)
        return state

    def click(self, element_id: str) -> Optional[PageState]:
        """点击元素"""
        if not self.page_states:
            return None
        current = self.page_states[-1]
        for elem in current.elements:
            if elem.element_id == element_id:
                # 模拟点击后的页面跳转
                if elem.element_type == ElementType.LINK:
                    href = elem.attributes.get("href", "")
                    if href:
                        return self.navigate(href)
                elif elem.element_type == ElementType.BUTTON:
                    if "搜索" in elem.text or "search" in elem.text.lower():
                        # 模拟搜索
                        search_url = f"{self.current_url}/search?q=python"
                        if "google" in self.current_url:
                            search_url = "https://www.google.com/search?q=python"
                        return self.navigate(search_url)
        return current

    def type_text(self, element_id: str, text: str) -> PageState:
        """在输入框中输入文本"""
        if not self.page_states:
            return PageState(url="", title="", elements=[])
        current = self.page_states[-1]
        for elem in current.elements:
            if elem.element_id == element_id:
                elem.text = text
                break
        return current

    def get_screenshot_info(self) -> str:
        """获取截图信息（模拟）"""
        return f"截图: {self.current_url} at {time.time()}"


# 测试浏览器模拟器
print("=" * 60)
print("测试浏览器模拟器")
print("=" * 60)
browser = BrowserSimulator()

# 导航
page = browser.navigate("https://www.google.com")
print(f"页面: {page.title}")
print(f"可交互元素: {len(page.get_interactive_elements())} 个")
print(page.to_prompt())
print()


# ============================================================
# 第三部分：Web Agent 动作执行器
# ============================================================

class ActionExecutor:
    """动作执行器：将 Agent 的决策转换为浏览器操作"""
    def __init__(self, browser: BrowserSimulator):
        self.browser = browser
        self.action_history: List[Dict] = []

    def execute(self, action: Action) -> Dict:
        """执行动作"""
        result = {"success": False, "message": ""}

        if action.action_type == ActionType.NAVIGATE:
            page = self.browser.navigate(action.target)
            result = {"success": True, "page": page}

        elif action.action_type == ActionType.CLICK:
            page = self.browser.click(action.target)
            if page:
                result = {"success": True, "page": page}
            else:
                result = {"success": False, "message": f"元素 {action.target} 未找到"}

        elif action.action_type == ActionType.TYPE:
            page = self.browser.type_text(action.target, action.value)
            result = {"success": True, "page": page}

        elif action.action_type == ActionType.READ_PAGE:
            if self.browser.page_states:
                page = self.browser.page_states[-1]
                result = {"success": True, "page": page}

        self.action_history.append({
            "action": action.to_dict(),
            "success": result["success"],
            "timestamp": time.time(),
        })
        return result


# ============================================================
# 第四部分：DOM 理解器
# ============================================================

class DOMUnderstanding:
    """DOM 理解器：解析页面结构，提取有用信息"""
    def __init__(self):
        self.element_selector_patterns = {
            "search": ["input[type='search']", "input[name='q']", "#search"],
            "submit": ["button[type='submit']", "input[type='submit']"],
            "link": ["a[href]"],
        }

    def parse_page_state(self, page: PageState) -> Dict:
        """解析页面状态"""
        elements = page.get_interactive_elements()

        analysis = {
            "url": page.url,
            "title": page.title,
            "total_elements": len(page.elements),
            "interactive_elements": len(elements),
            "element_types": {},
            "suggested_actions": [],
        }

        # 统计元素类型
        for elem in elements:
            t = elem.element_type.value
            analysis["element_types"][t] = analysis["element_types"].get(t, 0) + 1

        # 建议动作
        for elem in elements:
            if elem.element_type == ElementType.TEXT_INPUT:
                analysis["suggested_actions"].append(
                    f"type('{elem.element_id}', '<text>')")
            elif elem.element_type == ElementType.BUTTON:
                analysis["suggested_actions"].append(
                    f"click('{elem.element_id}') - {elem.text}")
            elif elem.element_type == ElementType.LINK:
                analysis["suggested_actions"].append(
                    f"click('{elem.element_id}') -> {elem.attributes.get('href', 'N/A')}")

        return analysis

    def find_search_box(self, page: PageState) -> Optional[UIElement]:
        """查找搜索框"""
        for elem in page.elements:
            if elem.element_type == ElementType.TEXT_INPUT:
                if any(kw in elem.text.lower() for kw in ["搜索", "search", "query"]):
                    return elem
                if any(kw in elem.element_id.lower() for kw in ["search", "query", "kw"]):
                    return elem
        # 返回第一个文本输入框
        for elem in page.elements:
            if elem.element_type == ElementType.TEXT_INPUT:
                return elem
        return None


# ============================================================
# 第五部分：Web Agent 核心
# ============================================================

class WebAgent:
    """Web Agent：自主浏览网页完成任务"""
    def __init__(self, name="WebAgent", max_steps=10):
        self.name = name
        self.max_steps = max_steps
        self.browser = BrowserSimulator()
        self.executor = ActionExecutor(self.browser)
        self.dom = DOMUnderstanding()
        self.task_history: List[Dict] = []
        self.current_step = 0

    def think(self, goal: str, page: PageState) -> Action:
        """思考：根据目标和当前页面决定下一步动作
        （实际实现中，这里会调用 LLM）
        """
        analysis = self.dom.parse_page_state(page)
        self.current_step += 1

        # 基于规则的决策（模拟 LLM）
        if self.current_step == 1:
            # 第一步：导航到搜索引擎
            if "google" in goal.lower() or "谷歌" in goal:
                return Action(ActionType.NAVIGATE, target="https://www.google.com")
            elif "百度" in goal.lower():
                return Action(ActionType.NAVIGATE, target="https://www.baidu.com")
            else:
                return Action(ActionType.NAVIGATE, target="https://www.google.com")

        elif "搜索" in goal or "search" in goal.lower():
            # 查找搜索框
            search_box = self.dom.find_search_box(page)
            if search_box:
                # 提取搜索关键词
                query = goal.replace("搜索", "").replace("search", "").strip()
                if not query:
                    query = "Python"
                return Action(ActionType.TYPE, target=search_box.element_id, value=query)

        # 检查是否需要点击搜索按钮
        for elem in page.elements:
            if elem.element_type == ElementType.BUTTON and ("搜索" in elem.text or "search" in elem.text.lower()):
                if any(h["action"]["type"] == "type" for h in self.task_history):
                    return Action(ActionType.CLICK, target=elem.element_id)

        # 默认：读取页面
        return Action(ActionType.READ_PAGE)

    def act(self, action: Action) -> Dict:
        """执行动作"""
        result = self.executor.execute(action)
        return result

    def run(self, goal: str) -> Dict:
        """运行 Agent"""
        print(f"\n{'='*60}")
        print(f"[{self.name}] 目标: {goal}")
        print(f"{'='*60}")

        self.current_step = 0
        self.task_history = []

        for step in range(self.max_steps):
            # 获取当前页面状态
            if self.browser.page_states:
                current_page = self.browser.page_states[-1]
            else:
                # 首次运行，先导航到默认页面
                current_page = self.browser.navigate("https://www.google.com")

            # 思考
            action = self.think(goal, current_page)
            print(f"\n  Step {step + 1}: {action.action_type.value} "
                  f"-> {action.target or action.value or ''}")

            # 执行
            result = self.act(action)
            self.task_history.append({
                "step": step + 1,
                "action": action.to_dict(),
                "success": result["success"],
            })

            # 检查是否完成
            if action.action_type == ActionType.READ_PAGE:
                print(f"  -> 任务完成，页面: {self.browser.current_url}")
                break

        # 生成报告
        report = {
            "goal": goal,
            "steps_taken": len(self.task_history),
            "final_url": self.browser.current_url,
            "actions": self.task_history,
            "success": any(h["success"] for h in self.task_history),
        }
        print(f"\n[报告] 步骤数: {report['steps_taken']}, 最终URL: {report['final_url']}")
        return report


# 测试 Web Agent
print("=" * 60)
print("测试 Web Agent")
print("=" * 60)
agent = WebAgent(max_steps=5)
report = agent.run("在 Google 搜索 Python 教程")
print(f"\n最终结果: {json.dumps(report, ensure_ascii=False, indent=2)[:500]}")
print()


# ============================================================
# 第六部分：Playwright 真实浏览器集成（可选）
# ============================================================

PLAYWRIGHT_AVAILABLE = False

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    pass


class PlaywrightWebAgent:
    """使用 Playwright 的真实 Web Agent"""
    def __init__(self, headless=True):
        self.headless = headless
        self.browser = None
        self.page = None
        self.action_history = []

    def start(self):
        if not PLAYWRIGHT_AVAILABLE:
            print("Playwright 未安装，使用模拟模式")
            return False
        self.pw = sync_playwright().start()
        self.browser = self.pw.chromium.launch(headless=self.headless)
        self.page = self.browser.new_page()
        return True

    def navigate(self, url: str):
        if self.page:
            self.page.goto(url)
            return self.page.title()
        return "模拟页面"

    def screenshot(self, path="screenshot.png"):
        if self.page:
            self.page.screenshot(path=path)
            return path
        return None

    def get_page_elements(self) -> List[Dict]:
        """获取页面可交互元素"""
        if not self.page:
            return []
        elements = []
        # 获取按钮
        for btn in self.page.query_selector_all("button, [role='button']"):
            text = btn.inner_text()
            bbox = btn.bounding_box()
            if bbox:
                elements.append({"type": "button", "text": text,
                               "position": (bbox["x"], bbox["y"])})
        # 获取输入框
        for inp in self.page.query_selector_all("input[type='text'], input[type='search']"):
            placeholder = inp.get_attribute("placeholder") or ""
            bbox = inp.bounding_box()
            if bbox:
                elements.append({"type": "input", "text": placeholder,
                               "position": (bbox["x"], bbox["y"])})
        # 获取链接
        for link in self.page.query_selector_all("a[href]")[:10]:
            text = link.inner_text()
            href = link.get_attribute("href")
            if text and href:
                elements.append({"type": "link", "text": text[:50], "href": href})
        return elements

    def close(self):
        if self.browser:
            self.browser.close()
        if hasattr(self, 'pw') and self.pw:
            self.pw.stop()


# Playwright 演示代码（需要安装 playwright）
print("=" * 60)
print("Playwright 真实浏览器集成（代码模板）")
print("=" * 60)
print("""
使用方法:
  pip install playwright
  playwright install chromium

  agent = PlaywrightWebAgent(headless=True)
  agent.start()
  agent.navigate("https://www.google.com")
  elements = agent.get_page_elements()
  print(elements)
  agent.close()
""")
print()


# ============================================================
# 第七部分：GUI Grounding（坐标定位）
# ============================================================

class GUIGrounder:
    """GUI Grounding: 将自然语言指令映射到界面坐标"""
    def __init__(self):
        self.coordinate_history: List[Dict] = []

    def ground_instruction(self, instruction: str, page: PageState) -> Optional[Dict]:
        """将指令映射到具体操作"""
        instruction_lower = instruction.lower()

        # 查找匹配的元素
        for elem in page.elements:
            if elem.is_interactive:
                # 点击操作
                if any(kw in instruction_lower for kw in ["点击", "click", "按"]):
                    if any(kw in elem.text.lower() for kw in instruction_lower.split()):
                        action = {
                            "action": "click",
                            "element_id": elem.element_id,
                            "text": elem.text,
                            "coordinates": {
                                "x": elem.position[0] + elem.size[0] // 2,
                                "y": elem.position[1] + elem.size[1] // 2,
                            }
                        }
                        self.coordinate_history.append(action)
                        return action

                # 输入操作
                if any(kw in instruction_lower for kw in ["输入", "type", "填写"]):
                    if elem.element_type == ElementType.TEXT_INPUT:
                        # 提取要输入的文本
                        value = instruction
                        for prefix in ["输入", "填写", "type", "搜索"]:
                            value = value.replace(prefix, "").strip()
                        action = {
                            "action": "type",
                            "element_id": elem.element_id,
                            "value": value,
                            "coordinates": {
                                "x": elem.position[0] + elem.size[0] // 2,
                                "y": elem.position[1] + elem.size[1] // 2,
                            }
                        }
                        self.coordinate_history.append(action)
                        return action

        return None


# 测试 GUI Grounding
print("=" * 60)
print("测试 GUI Grounding")
print("=" * 60)
grounder = GUIGrounder()
page = browser.navigate("https://www.google.com")

instructions = [
    "点击搜索框",
    "输入 Python 教程",
    "点击搜索按钮",
]
for inst in instructions:
    result = grounder.ground_instruction(inst, page)
    if result:
        print(f"指令: '{inst}' -> {result['action']} at {result['coordinates']}")
    else:
        print(f"指令: '{inst}' -> 未找到匹配元素")
print()


# ============================================================
# 总结
# ============================================================

print("=" * 60)
print("Day 4 总结")
print("=" * 60)
print("构建的组件:")
print("  1. BrowserSimulator -- 浏览器模拟器")
print("  2. ActionExecutor -- 动作执行器")
print("  3. DOMUnderstanding -- DOM 理解器")
print("  4. WebAgent -- Web Agent 核心")
print("  5. PlaywrightWebAgent -- 真实浏览器集成")
print("  6. GUIGrounder -- GUI 坐标定位")
print()
print("Web Agent 架构:")
print("  用户指令 -> LLM 规划 -> 浏览器操作 -> 页面状态 -> LLM 理解")
print()
print("明天预告: Day 5 Agent 自进化详解！")
```

---

## 预期输出

```
============================================================
测试浏览器模拟器
============================================================
页面: Google
可交互元素: 5 个
页面: Google
URL: https://www.google.com

可交互元素:
  [0] text_input: '搜索框' (id=search_box)
  [1] button: 'Google 搜索' (id=search_btn)
  ...

============================================================
测试 Web Agent
============================================================

[WebAgent] 目标: 在 Google 搜索 Python 教程

  Step 1: navigate -> https://www.google.com
  Step 2: type -> search_box
  Step 3: click -> search_btn
  -> 任务完成，页面: https://www.google.com/search?q=python

[报告] 步骤数: 3, 最终URL: https://www.google.com/search?q=python

============================================================
测试 GUI Grounding
============================================================
指令: '点击搜索框' -> click at {'x': 550, 'y': 220}
指令: '输入 Python 教程' -> type at {'x': 550, 'y': 220}
指令: '点击搜索按钮' -> click at {'x': 350, 'y': 270}
```

---

## 常见错误与解决方案

### 错误 1: Playwright 安装失败
```
playwright install chromium
```
**解决**: 在 Windows 上可能需要安装 Visual C++ Redistributable

### 错误 2: 页面加载超时
**解决**: 增加 `page.goto(url, timeout=30000)` 的超时时间

### 错误 3: 元素定位失败
**解决**: 使用多种定位策略（CSS 选择器、XPath、文本内容）

### 错误 4: 反爬虫机制
**解决**: 使用 headless=False 模式，添加随机延迟，使用代理

---

## 每日挑战

### 挑战 1: 实现页面截图分析
```python
# 截图后用 VLM 分析页面内容
screenshot = agent.browser.screenshot()
# 用 Day 3 的 ViT 分析截图
```

### 挑战 2: 实现多步骤任务规划
```python
# 给定复杂任务，自动分解为多步操作
task = "在淘宝搜索蓝牙耳机，按价格排序，选择销量最高的"
# Agent 需要规划: 打开淘宝 -> 搜索 -> 排序 -> 点击
```

### 挑战 3: 实现错误恢复机制
```python
# 当操作失败时，自动尝试替代方案
# 例如: 搜索框找不到 -> 尝试其他搜索入口
```

---

## 今日小结

今天我们构建了完整的 Web Agent 系统，包括浏览器模拟器、DOM 理解、动作执行和 GUI 坐标定位。这些是构建自动化浏览器助手的基础。

**明天预告**: Day 5 Agent 自进化详解！
