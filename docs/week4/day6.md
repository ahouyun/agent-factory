# 📅 Week 4 Day 6：五种 Agent 工作流模式

## 🧭 今日方向
> 学习五种核心 Agent 工作流模式——Sequential Chaining（顺序链）、Routing（路由）、Parallelization（并行）、Orchestrator-Worker（编排-工作者）、Evaluator-Optimizer（评估-优化）。掌握每种模式的结构、适用场景和代码实现。

## 🎯 生活比喻
> 把 Agent 想象成一个公司团队：**顺序链** 是流水线工厂；**路由** 是客服中心按问题类型转接；**并行** 是多部门同时开工；**编排-工作者** 是项目经理分配任务给专家；**评估-优化** 是产品发布前的多轮测试迭代。

## 📋 今日三件事
1. 学习五种工作流模式的结构和特点
2. 用代码实现每种模式的完整示例
3. 对比五种模式，掌握选择策略

---

## 🗺️ 手把手路线

### Step 1: 理解五种模式的结构
- **做什么**: 逐一学习每种模式的数据流和组件关系
- **为什么**: 模式选择直接影响 Agent 系统的性能和可维护性
- **成功标志**: 能画出每种模式的架构图并说出核心组件

### Step 2: 实现每种模式
- **做什么**: 用 Python 实现五种工作流模式的完整代码
- **为什么**: 代码是理解模式的最佳方式
- **成功标志**: 每种模式都有可运行的示例

### Step 3: 对比和选择
- **做什么**: 对比五种模式的优缺点和适用场景
- **为什么**: 实际开发中需要根据需求选择合适的模式
- **成功标志**: 能为给定场景推荐最合适的工作流模式

---

## 💻 代码区

### 代码 1: Sequential Chaining（顺序链）

```python
"""
工作流模式 1: Sequential Chaining（顺序链 / 流水线）
数据从一个步骤流向下一个步骤，前一步的输出是后一步的输入
适用场景：数据处理管道、ETL流程、内容生成管线
"""

from typing import Any, Callable, Dict, List, Optional
import time


class Pipeline:
    """
    顺序链 / 流水线
    特点：简单、可预测、易于调试
    缺点：单点故障、无法并行
    """

    def __init__(self, name: str):
        self.name = name
        self.steps: List[Dict] = []  # [{name, func}]

    def add_step(self, name: str, func: Callable):
        """添加处理步骤"""
        self.steps.append({"name": name, "func": func})
        return self  # 支持链式调用

    def execute(self, initial_input: Any) -> Dict:
        """
        执行流水线

        返回: {result, trace}
        """
        print(f"\n🔗 [{self.name}] 开始执行顺序链")
        print(f"  步骤数: {len(self.steps)}")

        trace = []
        current = initial_input

        for i, step in enumerate(self.steps, 1):
            print(f"\n  📍 步骤 {i}: {step['name']}")
            print(f"    输入: {str(current)[:80]}")

            start = time.time()
            try:
                result = step["func"](current)
                duration = time.time() - start
                current = result

                trace.append({
                    "step": i,
                    "name": step["name"],
                    "input": str(current)[:80],
                    "output": str(result)[:80],
                    "status": "success",
                    "duration": duration,
                })
                print(f"    输出: {str(result)[:80]}")
                print(f"    耗时: {duration:.3f}s")

            except Exception as e:
                duration = time.time() - start
                trace.append({
                    "step": i,
                    "name": step["name"],
                    "status": "failed",
                    "error": str(e),
                    "duration": duration,
                })
                print(f"    ❌ 失败: {e}")
                return {"result": None, "trace": trace, "error": str(e)}

        print(f"\n  ✅ 流水线完成，最终结果: {str(current)[:100]}")
        return {"result": current, "trace": trace}


# ====== 顺序链示例：文本处理管线 ======
if __name__ == "__main__":
    # 定义处理步骤
    def step1_clean(text):
        """清洗文本"""
        return text.strip().lower()

    def step2_tokenize(text):
        """分词"""
        return text.split()

    def step3_count(words):
        """统计词频"""
        freq = {}
        for w in words:
            freq[w] = freq.get(w, 0) + 1
        return freq

    def step4_sort(freq):
        """排序"""
        return sorted(freq.items(), key=lambda x: x[1], reverse=True)

    # 创建并执行流水线
    pipeline = Pipeline("文本分析管线")
    pipeline.add_step("清洗", step1_clean)
    pipeline.add_step("分词", step2_tokenize)
    pipeline.add_step("统计", step3_count)
    pipeline.add_step("排序", step4_sort)

    result = pipeline.execute("  Hello world hello Python hello world  ")
    print(f"\n最终结果: {result['result']}")
```

**预期输出：**
```
🔗 [文本分析管线] 开始执行顺序链
  步骤数: 4

  📍 步骤 1: 清洗
    输入:   Hello world hello Python hello world
    输出: hello world hello python hello world
    耗时: 0.000s

  📍 步骤 2: 分词
    输入: ['hello', 'world', 'hello', 'python', 'hello', 'world']
    输出: ['hello', 'world', 'hello', 'python', 'hello', 'world']
    耗时: 0.000s

  📍 步骤 3: 统计
    输出: {'hello': 3, 'world': 2, 'python': 1}
    耗时: 0.000s

  📍 步骤 4: 排序
    输出: [('hello', 3), ('world', 2), ('python', 1)]
    耗时: 0.000s

  ✅ 流水线完成

最终结果: [('hello', 3), ('world', 2), ('python', 1)]
```

### 代码 2: Routing（路由模式）

```python
"""
工作流模式 2: Routing（路由模式）
根据输入内容分类，分发到不同的处理分支
适用场景：客服系统、多语言处理、意图识别
"""

class Router:
    """
    路由模式
    特点：灵活、可扩展、支持条件分支
    缺点：路由逻辑可能复杂、需要维护分类规则
    """

    def __init__(self, name: str):
        self.name = name
        self.routes: Dict[str, Dict] = {}  # 路由名 -> {handler, description}
        self.default_route: Optional[str] = None

    def add_route(self, name: str, handler: Callable, description: str = ""):
        """添加路由"""
        self.routes[name] = {"handler": handler, "description": description}
        return self

    def set_default(self, route_name: str):
        """设置默认路由"""
        self.default_route = route_name
        return self

    def classify(self, input_data: Any) -> str:
        """
        分类输入（核心路由逻辑）
        在实际应用中，这里会用 LLM 或分类器
        """
        text = str(input_data).lower()

        # 基于关键词的简单分类
        if any(w in text for w in ["计算", "数学", "加", "减", "乘", "除", "+", "-"]):
            return "math"
        elif any(w in text for w in ["天气", "温度", "下雨", "晴天"]):
            return "weather"
        elif any(w in text for w in ["翻译", "英文", "中文", "translate"]):
            return "translate"
        elif any(w in text for w in ["搜索", "查找", "查找", "查询"]):
            return "search"
        else:
            return self.default_route or "general"

    def execute(self, input_data: Any) -> Dict:
        """执行路由"""
        print(f"\n🔀 [{self.name}] 路由处理")
        print(f"  输入: {str(input_data)[:80]}")

        # 分类
        route_name = self.classify(input_data)
        print(f"  分类结果: {route_name}")

        # 路由到对应处理器
        if route_name in self.routes:
            handler = self.routes[route_name]["handler"]
            print(f"  路由到: {route_name} ({self.routes[route_name]['description']})")
            result = handler(input_data)
        else:
            print(f"  ⚠️ 无匹配路由，使用默认: {self.default_route}")
            if self.default_route and self.default_route in self.routes:
                handler = self.routes[self.default_route]["handler"]
                result = handler(input_data)
            else:
                result = "无法处理该请求"

        print(f"  结果: {result}")
        return {"route": route_name, "result": result}


# ====== 路由模式示例：智能客服 ======
if __name__ == "__main__":
    # 定义各路由的处理器
    def handle_math(query):
        """数学计算"""
        return f"计算结果: 42 (来自数学处理器)"

    def handle_weather(query):
        """天气查询"""
        return f"今天晴天，25°C (来自天气处理器)"

    def handle_translate(query):
        """翻译"""
        return f"翻译结果: Hello World (来自翻译处理器)"

    def handle_general(query):
        """通用回答"""
        return f"这是一个通用回答 (来自通用处理器)"

    # 创建路由
    router = Router("智能客服路由")
    router.add_route("math", handle_math, "数学计算")
    router.add_route("weather", handle_weather, "天气查询")
    router.add_route("translate", handle_translate, "翻译服务")
    router.add_route("general", handle_general, "通用回答")
    router.set_default("general")

    # 测试不同输入
    test_inputs = [
        "帮我计算 15 + 27",
        "今天天气怎么样？",
        "把这个翻译成英文",
        "你好，你是谁？",
    ]

    for inp in test_inputs:
        result = router.execute(inp)
        print()
```

### 代码 3: Parallelization（并行模式）

```python
"""
工作流模式 3: Parallelization（并行模式）
多个任务同时执行，最后汇总结果
适用场景：多数据源处理、批量操作、对比分析
"""

import concurrent.futures
from typing import List


class ParallelExecutor:
    """
    并行执行器
    特点：速度快、资源利用率高
    缺点：资源消耗大、结果合并复杂
    """

    def __init__(self, name: str, max_workers: int = 4):
        self.name = name
        self.max_workers = max_workers

    def execute(self, tasks: List[Dict]) -> Dict:
        """
        并行执行多个任务

        参数 tasks: [{name, func, args}]
        返回: {results, trace}
        """
        print(f"\n⚡ [{self.name}] 并行执行")
        print(f"  任务数: {len(tasks)}")

        results = {}
        trace = []

        def run_task(task):
            name = task["name"]
            func = task["func"]
            args = task.get("args", {})
            start = time.time()
            try:
                result = func(**args) if args else func()
                duration = time.time() - start
                return name, {
                    "result": result,
                    "status": "success",
                    "duration": duration,
                }
            except Exception as e:
                duration = time.time() - start
                return name, {
                    "result": None,
                    "status": "failed",
                    "error": str(e),
                    "duration": duration,
                }

        # 并行执行（模拟：使用顺序执行以兼容所有环境）
        print(f"  执行中...")
        for task in tasks:
            name, result_info = run_task(task)
            results[name] = result_info["result"]
            trace.append({"name": name, **result_info})
            status = "✅" if result_info["status"] == "success" else "❌"
            print(f"    {status} {name}: {result_info.get('duration', 0):.3f}s")

        # 汇总
        success_count = sum(1 for t in trace if t["status"] == "success")
        print(f"\n  完成: {success_count}/{len(tasks)} 任务")

        return {"results": results, "trace": trace}


# ====== 并行模式示例：多数据源聚合 ======
if __name__ == "__main__":
    # 模拟不同数据源
    def fetch_user_data():
        """获取用户数据"""
        time.sleep(0.1)
        return {"user_id": 1, "name": "张三"}

    def fetch_order_data():
        """获取订单数据"""
        time.sleep(0.15)
        return {"order_count": 5, "total": 1200}

    def fetch_recommendations():
        """获取推荐数据"""
        time.sleep(0.12)
        return ["商品A", "商品B", "商品C"]

    def fetch_notifications():
        """获取通知数据"""
        time.sleep(0.08)
        return ["新消息1", "新消息2"]

    # 创建并行执行器
    executor = ParallelExecutor("数据聚合")

    tasks = [
        {"name": "用户数据", "func": fetch_user_data},
        {"name": "订单数据", "func": fetch_order_data},
        {"name": "推荐数据", "func": fetch_recommendations},
        {"name": "通知数据", "func": fetch_notifications},
    ]

    result = executor.execute(tasks)

    # 合并结果
    print(f"\n📊 聚合结果:")
    for key, value in result["results"].items():
        print(f"  {key}: {value}")
```

### 代码 4: Orchestrator-Worker（编排-工作者模式）

```python
"""
工作流模式 4: Orchestrator-Worker（编排-工作者模式）
中央协调器分配任务给专业工作者
适用场景：复杂项目管理、多专家协作、动态任务分配
"""


class Worker:
    """工作者：执行特定类型的任务"""

    def __init__(self, name: str, specialty: str, skills: List[str]):
        self.name = name
        self.specialty = specialty
        self.skills = skills
        self.tasks_completed = 0

    def can_handle(self, task_type: str) -> bool:
        """判断是否能处理某类任务"""
        return task_type in self.skills

    def work(self, task: Dict) -> str:
        """执行任务"""
        self.tasks_completed += 1
        time.sleep(0.05)  # 模拟工作耗时
        return f"[{self.name}] 完成任务: {task.get('description', '未知任务')}"


class Orchestrator:
    """
    编排器：分配任务给工作者

    特点：
    - 中央协调，灵活分配
    - 支持动态负载均衡
    - 易于扩展新的工作者
    """

    def __init__(self, name: str):
        self.name = name
        self.workers: List[Worker] = []

    def add_worker(self, worker: Worker):
        """添加工作者"""
        self.workers.append(worker)
        return self

    def assign_task(self, task: Dict) -> Optional[Worker]:
        """为任务分配最合适的工作者"""
        task_type = task.get("type", "")

        # 找到能处理且当前负载最低的工作者
        candidates = [w for w in self.workers if w.can_handle(task_type)]

        if not candidates:
            return None

        # 选择完成任务最少的（负载均衡）
        return min(candidates, key=lambda w: w.tasks_completed)

    def execute(self, tasks: List[Dict]) -> Dict:
        """执行任务列表"""
        print(f"\n🎭 [{self.name}] 编排器启动")
        print(f"  工作者数: {len(self.workers)}")
        print(f"  任务数: {len(tasks)}")

        results = {}
        assignments = []

        for task in tasks:
            worker = self.assign_task(task)
            if worker:
                result = worker.work(task)
                results[task.get("id", "unknown")] = result
                assignments.append({
                    "task": task.get("description", "未知"),
                    "worker": worker.name,
                    "result": result,
                })
                print(f"  📌 {task.get('description', '?')} -> {worker.name}")
            else:
                print(f"  ⚠️ 无法分配: {task.get('description', '?')} (无合适工作者)")
                results[task.get("id", "unknown")] = "未分配"

        # 打印工作者负载
        print(f"\n  工作者负载:")
        for w in self.workers:
            print(f"    {w.name} ({w.specialty}): {w.tasks_completed} 任务")

        return {"results": results, "assignments": assignments}


# ====== 编排-工作者示例：内容创作团队 ======
if __name__ == "__main__":
    # 创建工作者
    writer = Worker("文案师", "文案写作", ["copywriting", "blog", "social"])
    designer = Worker("设计师", "视觉设计", ["design", "infographic", "ui"])
    analyst = Worker("分析师", "数据分析", ["analysis", "report", "research"])
    coder = Worker("程序员", "代码开发", ["coding", "automation", "api"])

    # 创建编排器
    orchestrator = ContentOrchestrator = Orchestrator("内容创作编排器")
    orchestrator.add_worker(writer)
    orchestrator.add_worker(designer)
    orchestrator.add_worker(analyst)
    orchestrator.add_worker(coder)

    # 任务列表
    tasks = [
        {"id": "t1", "type": "copywriting", "description": "撰写产品介绍文案"},
        {"id": "t2", "type": "design", "description": "设计产品宣传海报"},
        {"id": "t3", "type": "analysis", "description": "分析用户反馈数据"},
        {"id": "t4", "type": "coding", "description": "开发数据可视化页面"},
        {"id": "t5", "type": "blog", "description": "撰写技术博客文章"},
        {"id": "t6", "type": "report", "description": "生成月度分析报告"},
    ]

    result = orchestrator.execute(tasks)
```

### 代码 5: Evaluator-Optimizer（评估-优化模式）

```python
"""
工作流模式 5: Evaluator-Optimizer（评估-优化模式）
生成 -> 评估 -> 优化，循环直到达标
适用场景：内容生成、代码优化、方案设计
"""


class EvaluatorOptimizer:
    """
    评估-优化模式
    特点：质量高、持续改进
    缺点：执行时间长、资源消耗大
    """

    def __init__(self, name: str, max_iterations: int = 3,
                 quality_threshold: float = 0.8):
        self.name = name
        self.max_iterations = max_iterations
        self.quality_threshold = quality_threshold

    def execute(self, task: str, generator: Callable,
                evaluator: Callable, optimizer: Callable) -> Dict:
        """
        执行评估-优化循环

        参数:
            task: 任务描述
            generator: 生成函数
            evaluator: 评估函数 (output -> score 0-1)
            optimizer: 优化函数 (output, score, feedback -> improved_output)
        """
        print(f"\n🔄 [{self.name}] 评估-优化模式")
        print(f"  任务: {task}")
        print(f"  最大轮次: {self.max_iterations}")
        print(f"  质量阈值: {self.quality_threshold}")

        trace = []
        current_output = generator(task)
        print(f"\n  📝 初始生成: {str(current_output)[:100]}")

        for iteration in range(1, self.max_iterations + 1):
            print(f"\n  --- 轮次 {iteration}/{self.max_iterations} ---")

            # 评估
            score, feedback = evaluator(current_output)
            print(f"  📊 评分: {score:.2f}")
            print(f"  💬 反馈: {feedback}")

            trace.append({
                "iteration": iteration,
                "score": score,
                "feedback": feedback,
            })

            # 检查是否达标
            if score >= self.quality_threshold:
                print(f"  ✅ 质量达标，停止优化")
                break

            # 优化
            current_output = optimizer(current_output, score, feedback)
            print(f"  🔧 优化后: {str(current_output)[:100]}")

        # 最终评估
        final_score, _ = evaluator(current_output)

        print(f"\n  📊 最终评分: {final_score:.2f}")
        return {
            "output": current_output,
            "final_score": final_score,
            "iterations": len(trace),
            "trace": trace,
        }


# ====== 评估-优化示例：文案优化 ======
if __name__ == "__main__":
    # 生成器
    def generate_copy(task):
        """生成文案"""
        return f"这是一段关于{task}的文案。产品很好。快来买。"

    # 评估器
    def evaluate_copy(output):
        """评估文案质量"""
        score = 0.5
        feedback_parts = []

        if len(output) < 30:
            score -= 0.2
            feedback_parts.append("文案太短")
        if "好" in output and output.count("好") > 2:
            score -= 0.1
            feedback_parts.append("用词重复")
        if "功能" not in output and "特点" not in output:
            score -= 0.1
            feedback_parts.append("缺少产品细节")
        if "购买" not in output and "了解" not in output:
            score -= 0.05
            feedback_parts.append("缺少行动号召")

        # 基础分 + 长度加分
        score += min(len(output) / 200, 0.3)
        score = max(0.1, min(1.0, score))

        feedback = "; ".join(feedback_parts) if feedback_parts else "整体良好"
        return score, feedback

    # 优化器
    def optimize_copy(output, score, feedback):
        """优化文案"""
        improved = output
        if "太短" in feedback:
            improved += "这款产品具有多项创新功能，包括智能分析、实时监控和个性化推荐。"
        if "缺少产品细节" in feedback:
            improved += "我们致力于提供最优质的服务体验，让用户感受到科技的力量。"
        if "缺少行动号召" in feedback:
            improved += "立即体验，开启智能生活新方式！"
        return improved

    # 执行
    optimizer = EvaluatorOptimizer("文案优化器", max_iterations=3, quality_threshold=0.75)
    result = optimizer.execute(
        task="智能家居产品推广",
        generator=generate_copy,
        evaluator=evaluate_copy,
        optimizer=optimize_copy,
    )

    print(f"\n📄 最终文案: {result['output']}")
```

### 代码 6: 五种模式对比表

```python
"""
五种工作流模式对比与选择指南
"""

COMPARISON_TABLE = """
╔══════════════════╦═════════════════════╦══════════════╦═══════════════╦══════════════════╗
║ 模式             ║ 核心思想            ║ 优点         ║ 缺点          ║ 典型场景         ║
╠══════════════════╬═════════════════════╬══════════════╬═══════════════╬══════════════════╣
║ 顺序链           ║ A -> B -> C         ║ 简单可预测   ║ 无法并行      ║ ETL数据管道     ║
║ 路由             ║ 分类 -> 分发        ║ 灵活可扩展   ║ 路由逻辑复杂  ║ 智能客服        ║
║ 并行             ║ A + B + C 并行      ║ 速度快       ║ 资源消耗大    ║ 多源数据聚合    ║
║ 编排-工作者      ║ 统筹 -> 分配 -> 执行 ║ 灵活性最高   ║ 协调开销大    ║ 复杂项目管理    ║
║ 评估-优化        ║ 生成 -> 评估 -> 循环 ║ 质量高       ║ 时间长        ║ 内容创作/代码优化║
╚══════════════════╩═════════════════════╩══════════════╩═══════════════╩══════════════════╝
"""


def recommend_pattern(requirements: Dict) -> str:
    """根据需求推荐工作流模式"""
    if requirements.get("sequential", False):
        return "Sequential Chaining（顺序链）"
    elif requirements.get("multiple_types", False):
        return "Routing（路由）"
    elif requirements.get("independent_tasks", False):
        return "Parallelization（并行）"
    elif requirements.get("complex_coordination", False):
        return "Orchestrator-Worker（编排-工作者）"
    elif requirements.get("quality_critical", False):
        return "Evaluator-Optimizer（评估-优化）"
    else:
        return "Sequential Chaining（顺序链，最简单）"


# ====== 运行对比 ======
if __name__ == "__main__":
    print(COMPARISON_TABLE)

    print("\n📋 场景推荐:")
    scenarios = [
        {"name": "数据清洗管道", "sequential": True},
        {"name": "多语言客服", "multiple_types": True},
        {"name": "批量图片处理", "independent_tasks": True},
        {"name": "软件开发项目", "complex_coordination": True},
        {"name": "AI写作助手", "quality_critical": True},
    ]

    for scenario in scenarios:
        name = scenario.pop("name")
        pattern = recommend_pattern(scenario)
        print(f"  {name} -> {pattern}")
```

---

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 顺序链中某步失败中断全流程 | 添加 try-except 并设计降级策略 |
| 2 | 路由分类不准 | 优化分类逻辑，或使用 LLM 做动态分类 |
| 3 | 并行任务结果顺序混乱 | 使用 asyncio.gather 或字典存储结果 |
| 4 | 编排器找不到合适的工作者 | 扩展工作者的 skills 列表 |
| 5 | 评估-优化陷入死循环 | 确保 max_iterations 有上限 |
| 6 | 不知道该用哪种模式 | 从最简单的顺序链开始，不够再升级 |

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Sequential Chaining | 步骤按顺序执行，前一步的输出是后一步的输入 |
| Routing | 根据输入内容分类，分发到不同的处理分支 |
| Parallelization | 多个任务同时执行，最后汇总结果 |
| Orchestrator-Worker | 中央协调器分配任务给专业工作者 |
| Evaluator-Optimizer | 生成 -> 评估 -> 优化的循环 |
| 流水线 (Pipeline) | Sequential Chaining 的另一种叫法 |
| 负载均衡 | 在多个工作者之间均匀分配任务 |

---

## ✅ 验收清单

- [ ] 能说出五种工作流模式的核心思想
- [ ] 能运行每种模式的完整示例并观察输出
- [ ] 能解释每种模式的优缺点
- [ ] 能为给定场景推荐最合适的工作流模式
- [ ] 能解释 Orchestrator-Worker 中的负载均衡机制
- [ ] 能解释 Evaluator-Optimizer 的终止条件
- [ ] 能将两种或多种模式组合使用

---

## 📝 复盘小纸条
- 今天最大的收获: ________________________________
- 还不太确定的: ________________________________
- 最实用的模式是: ________________________________
- 明天需要用到的基础: ________________________________

---

## 📥 明日同步接口
- 今日完成度: ____%
- 卡点描述: ________________________________
- 代码是否能跑通: ✅ 全部通过 / ⚠️ 部分通过 / ❌ 未通过
- 明天希望: 对 Week 4 所有内容进行系统复盘
