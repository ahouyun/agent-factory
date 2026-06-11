# 🏆 Day 2: 业界基准测试 — 看看"别人家的孩子"考多少分

## 今日方向

> "站在巨人的肩膀上。" —— Isaac Newton

今天我们来了解业界公认的 Agent 评估基准测试（Benchmarks）。这些基准测试就像高考、托福一样，是衡量 AI Agent 能力的标准考试。了解它们，你才能知道自己的 Agent 在什么水平。

## 生活比喻

想象你要评估一辆车的性能：

- **SWE-bench** = 实际道路测试（解决真实的 GitHub Issue）
- **HumanEval** = 编程考试（写代码解决问题）
- **GAIA** = 综合能力测试（需要多步推理）
- **MMLU** = 百科知识竞赛（测试知识广度）

每种测试都有不同的侧重点，今天我们来逐一了解。

## 今日三件事

1. **理解主流基准测试**：SWE-bench、HumanEval、GAIA、MMLU
2. **学会运行基准测试**：使用现有工具评测你的 Agent
3. **解读评测结果**：如何分析和对比评测数据

---

## 手把手路线

### 第一步：安装依赖

```bash
pip install datasets pandas tabulate
```

### 第二步：了解 SWE-bench

```python
# swe_bench_intro.py
"""SWE-bench 基准测试介绍与运行"""

import json
import time
from typing import Dict, List
from dataclasses import dataclass, field


@dataclass
class SWEBenchTask:
    """SWE-bench 任务"""
    task_id: str
    repo: str
    instance_id: str
    problem_statement: str
    base_commit: str
    patch: str = ""

    def to_dict(self) -> dict:
        return {
            "task_id": self.task_id,
            "repo": self.repo,
            "instance_id": self.instance_id,
            "problem_statement": self.problem_statement[:200] + "...",
        }


class SWEBenchEvaluator:
    """SWE-bench 评估器"""

    def __init__(self):
        self.tasks = self._load_sample_tasks()

    def _load_sample_tasks(self) -> List[SWEBenchTask]:
        """加载示例任务"""
        return [
            SWEBenchTask(
                task_id="django__django-11099",
                repo="django/django",
                instance_id="django__django-11099",
                problem_statement="Fix the issue where model field validation does not work properly...",
                base_commit="abc123",
                patch="--- a/models.py\n+++ b/models.py\n@@ -10, +10 @@\n-old_code\n+new_code",
            ),
            SWEBenchTask(
                task_id="scikit-learn__scikit-learn-13496",
                repo="scikit-learn/scikit-learn",
                instance_id="scikit-learn__scikit-learn-13496",
                problem_statement="Fix the bug in cross-validation where...",
                base_commit="def456",
                patch="--- a/utils.py\n+++ b/utils.py\n@@ -5, +5 @@\n-old\n+new",
            ),
        ]

    def explain_task(self, task: SWEBenchTask):
        """解释 SWE-bench 任务"""
        print(f"\n{'='*60}")
        print(f"任务 ID: {task.task_id}")
        print(f"仓库: {task.repo}")
        print(f"问题描述: {task.problem_statement}")
        print(f"{'='*60}")

    def evaluate_patch(self, task: SWEBenchTask, generated_patch: str) -> Dict:
        """评估生成的 patch"""
        is_correct = generated_patch.strip() == task.patch.strip()
        return {
            "task_id": task.task_id,
            "passed": is_correct,
            "metrics": {
                "exact_match": is_correct,
                "patch_length": len(generated_patch),
                "reference_length": len(task.patch),
            },
        }


if __name__ == "__main__":
    evaluator = SWEBenchEvaluator()

    print("SWE-bench 基准测试介绍")
    print("=" * 60)
    print("""
SWE-bench 是什么？
- 由 Princeton 大学开发
- 包含 2294 个真实的 GitHub Issue
- 来自 12 个流行的 Python 仓库
- 评估 Agent 解决真实软件工程问题的能力

评估指标：
- Pass@1: 一次尝试就通过测试的比例
- Pass@k: k 次尝试中至少一次通过的比例
""")

    for task in evaluator.tasks:
        evaluator.explain_task(task)

    result = evaluator.evaluate_patch(
        evaluator.tasks[0],
        "--- a/models.py\n+++ b/models.py\n@@ -10, +10 @@\n-old_code\n+new_code",
    )
    print(f"\n评估结果: {json.dumps(result, indent=2)}")
```

### 第三步：了解 HumanEval

```python
# humaneval_intro.py
"""HumanEval 基准测试介绍与运行"""

import json
from typing import List, Dict
from dataclasses import dataclass, field


@dataclass
class HumanEvalTask:
    """HumanEval 任务"""
    task_id: str
    prompt: str
    canonical_solution: str
    test: str
    entry_point: str

    def to_dict(self) -> dict:
        return {
            "task_id": self.task_id,
            "entry_point": self.entry_point,
            "prompt": self.prompt[:100] + "...",
        }


class HumanEvalEvaluator:
    """HumanEval 评估器"""

    def __init__(self):
        self.tasks = self._load_sample_tasks()

    def _load_sample_tasks(self) -> List[HumanEvalTask]:
        """加载示例任务"""
        return [
            HumanEvalTask(
                task_id="HumanEval/0",
                prompt='''def has_close_elements(numbers: list, threshold: float) -> bool:
    """Check if in given list of numbers, are any two numbers close to each other.
    >>> has_close_elements([1.0, 2.0, 3.0], 0.5)
    False
    >>> has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3)
    True
    """''',
                canonical_solution='''    for i in range(len(numbers)):
        for j in range(i + 1, len(numbers)):
            if abs(numbers[i] - numbers[j]) < threshold:
                return True
    return False''',
                test='''def check(candidate):
    assert candidate([1.0, 2.0, 3.9, 4.0, 5.0, 2.2], 0.3) == True
    assert candidate([1.0, 2.0, 3.9, 4.0, 5.0, 2.2], 0.05) == False
    assert candidate([1.0, 2.0, 5.9, 4.0, 5.0], 0.95) == True''',
                entry_point="has_close_elements",
            ),
            HumanEvalTask(
                task_id="HumanEval/1",
                prompt='''def separate_paren_groups(paren_string: str) -> list:
    """Separate balanced parentheses groups.
    >>> separate_paren_groups('(()) ((())) () (()())')
    ['(())', '((()))', '()', '(()())']''',
                canonical_solution='''    result = []
    current_string = []
    depth = 0
    for c in paren_string:
        if c == '(':
            depth += 1
            current_string.append(c)
        elif c == ')':
            depth -= 1
            current_string.append(c)
            if depth == 0:
                result.append(''.join(current_string))
                current_string = []
    return result''',
                test='''def check(candidate):
    assert candidate('(()()) ((())) () (()())') == ['(()())', '((()))', '()', '(()())']''',
                entry_point="separate_paren_groups",
            ),
        ]

    def explain_task(self, task: HumanEvalTask):
        """解释 HumanEval 任务"""
        print(f"\n{'='*60}")
        print(f"任务 ID: {task.task_id}")
        print(f"函数名: {task.entry_point}")
        print(f"函数签名和文档:")
        print(f"{task.prompt}")
        print(f"{'='*60}")

    def run_code(self, task: HumanEvalTask, generated_code: str) -> Dict:
        """运行生成的代码并检查是否通过"""
        try:
            full_code = f"""
from typing import List

{task.prompt}

{generated_code}

{task.test}
check({task.entry_point})
print("测试通过!")
"""
            exec(full_code)
            return {"passed": True, "error": None}
        except AssertionError as e:
            return {"passed": False, "error": f"断言失败: {e}"}
        except Exception as e:
            return {"passed": False, "error": f"执行错误: {e}"}


if __name__ == "__main__":
    evaluator = HumanEvalEvaluator()

    print("HumanEval 基准测试介绍")
    print("=" * 60)
    print("""
HumanEval 是什么？
- 由 OpenAI 开发
- 包含 164 个 Python 编程问题
- 评估代码生成能力

评估指标：
- Pass@1: 生成一个代码样本，一次通过测试的概率
- Pass@10: 生成 10 个样本，至少一个通过的概率
- Pass@100: 生成 100 个样本，至少一个通过的概率
""")

    for task in evaluator.tasks:
        evaluator.explain_task(task)

    task = evaluator.tasks[0]
    result = evaluator.run_code(task, task.canonical_solution)
    print(f"\n参考答案测试结果: {result}")
```

### 第四步：了解 GAIA 和 MMLU

```python
# gaia_mmlu_intro.py
"""GAIA 和 MMLU 基准测试介绍"""

import json
from typing import List, Dict
from dataclasses import dataclass, field


@dataclass
class GAIATask:
    """GAIA 任务"""
    task_id: str
    question: str
    level: int
    final_answer: str
    tools: List[str]

    def to_dict(self) -> dict:
        return {
            "task_id": self.task_id,
            "question": self.question[:100] + "...",
            "level": self.level,
            "tools": self.tools,
        }


@dataclass
class MMLUTask:
    """MMLU 任务"""
    task_id: str
    question: str
    choices: List[str]
    answer: str
    subject: str

    def to_dict(self) -> dict:
        return {
            "task_id": self.task_id,
            "question": self.question[:100] + "...",
            "subject": self.subject,
            "choices_count": len(self.choices),
        }


class BenchmarkExplainer:
    """基准测试解释器"""

    def __init__(self):
        self.gaia_tasks = self._load_gaia_samples()
        self.mmlu_tasks = self._load_mmlu_samples()

    def _load_gaia_samples(self) -> List[GAIATask]:
        """加载 GAIA 示例"""
        return [
            GAIATask("GAIA/1", "What is the capital of France?", 1, "Paris", ["web_search"]),
            GAIATask("GAIA/2", "Find the latest GDP of Japan...", 2, "4.23 trillion",
                     ["web_search", "calculator"]),
            GAIATask("GAIA/3", "Analyze the sentiment of this review...", 3, "Positive",
                     ["web_search", "code_execution"]),
        ]

    def _load_mmlu_samples(self) -> List[MMLUTask]:
        """加载 MMLU 示例"""
        return [
            MMLUTask("MMLU/1", "What is the powerhouse of the cell?",
                     ["A. Nucleus", "B. Mitochondria", "C. Ribosome", "D. Golgi apparatus"],
                     "B", "biology"),
            MMLUTask("MMLU/2", "Which planet is known as the Red Planet?",
                     ["A. Venus", "B. Jupiter", "C. Mars", "D. Saturn"],
                     "C", "astronomy"),
            MMLUTask("MMLU/3", "What is the time complexity of binary search?",
                     ["A. O(n)", "B. O(n^2)", "C. O(log n)", "D. O(1)"],
                     "C", "computer_science"),
        ]

    def explain_gaia(self):
        """解释 GAIA 基准测试"""
        print("\n" + "=" * 70)
        print("GAIA 基准测试")
        print("=" * 70)
        print("""
GAIA 是什么？
- 由 Meta、HuggingFace 等联合开发
- General AI Assistants 基准测试
- 评估 AI 助手解决真实世界问题的能力
- 包含 466 个问题，分为 3 个难度等级

特点：
- Level 1: 单步推理，简单工具使用
- Level 2: 多步推理，工具组合
- Level 3: 复杂推理，多工具协作

评估指标：
- Accuracy: 正确回答的比例
- 按难度等级分别统计
""")
        print("\n示例任务：")
        for task in self.gaia_tasks:
            print(f"\n  Level {task.level}: {task.question}")
            print(f"  需要工具: {', '.join(task.tools)}")
            print(f"  答案: {task.final_answer}")

    def explain_mmlu(self):
        """解释 MMLU 基准测试"""
        print("\n" + "=" * 70)
        print("MMLU 基准测试")
        print("=" * 70)
        print("""
MMLU 是什么？
- Measuring Massive Multitask Language Understanding
- 由 UC Berkeley 开发
- 包含 57 个学科的 14,000+ 问题
- 评估模型的知识广度和深度

学科分类：
- STEM: 物理、化学、计算机科学等
- 人文: 历史、哲学、法律等
- 社会科学: 经济、心理等
- 其他: 日常知识等

评估指标：
- Overall Accuracy: 总体准确率
- Per-subject Accuracy: 各学科准确率
""")
        print("\n示例任务：")
        for task in self.mmlu_tasks:
            print(f"\n  学科: {task.subject}")
            print(f"  问题: {task.question}")
            for choice in task.choices:
                print(f"    {choice}")
            print(f"  正确答案: {task.answer}")

    def compare_benchmarks(self):
        """对比各基准测试"""
        print("\n" + "=" * 70)
        print("基准测试对比")
        print("=" * 70)
        print("""
+-------------+------------+--------------+-----------+-----------+
|   基准测试   |   评估能力  |   数据集大小  |  难度等级  |   主要用途  |
+-------------+------------+--------------+-----------+-----------+
|  SWE-bench  |  软件工程   |   2294 tasks |   中-高   | 代码修复   |
|  HumanEval  |  代码生成   |   164 tasks  |   中等    | 函数实现   |
|    GAIA     |  综合推理   |   466 tasks  |   1-3级   | 真实问题   |
|    MMLU     |  知识理解   |  14,000+     |   中等    | 学科知识   |
+-------------+------------+--------------+-----------+-----------+
""")


if __name__ == "__main__":
    explainer = BenchmarkExplainer()
    explainer.explain_gaia()
    explainer.explain_mmlu()
    explainer.compare_benchmarks()
```

### 第五步：运行基准测试

```python
# run_benchmark.py
"""运行基准测试的完整示例"""

import json
import time
from typing import List, Dict, Callable
from dataclasses import dataclass, field, asdict


@dataclass
class BenchmarkResult:
    """基准测试结果"""
    benchmark_name: str
    total_tasks: int
    passed_tasks: int
    accuracy: float
    avg_latency: float
    details: List[Dict] = field(default_factory=list)
    timestamp: str = ""

    def to_dict(self) -> dict:
        return asdict(self)


class SimpleBenchmarkRunner:
    """简单的基准测试运行器"""

    def __init__(self, agent_func: Callable):
        self.agent_func = agent_func
        self.results: List[BenchmarkResult] = []

    def run_swe_bench_sample(self, tasks: List[Dict]) -> BenchmarkResult:
        """运行 SWE-bench 样本"""
        results = []
        total = len(tasks)
        passed = 0
        total_latency = 0

        for task in tasks:
            start_time = time.time()
            try:
                response = self.agent_func(task["problem"])
                is_correct = self._check_response(task, response)
            except Exception as e:
                response = str(e)
                is_correct = False

            latency = time.time() - start_time
            total_latency += latency
            if is_correct:
                passed += 1
            results.append({"task_id": task["id"], "passed": is_correct,
                           "latency": round(latency, 3)})

        return BenchmarkResult(
            benchmark_name="SWE-bench (Sample)",
            total_tasks=total, passed_tasks=passed,
            accuracy=round(passed / total, 4) if total > 0 else 0,
            avg_latency=round(total_latency / total, 3) if total > 0 else 0,
            details=results, timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
        )

    def run_human_eval_sample(self, tasks: List[Dict]) -> BenchmarkResult:
        """运行 HumanEval 样本"""
        results = []
        total = len(tasks)
        passed = 0
        total_latency = 0

        for task in tasks:
            start_time = time.time()
            try:
                code_response = self.agent_func(task["prompt"])
                is_correct = self._run_test(code_response, task["test"])
            except Exception as e:
                code_response = str(e)
                is_correct = False

            latency = time.time() - start_time
            total_latency += latency
            if is_correct:
                passed += 1
            results.append({"task_id": task["id"], "passed": is_correct,
                           "latency": round(latency, 3)})

        return BenchmarkResult(
            benchmark_name="HumanEval (Sample)",
            total_tasks=total, passed_tasks=passed,
            accuracy=round(passed / total, 4) if total > 0 else 0,
            avg_latency=round(total_latency / total, 3) if total > 0 else 0,
            details=results, timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
        )

    def _check_response(self, task: Dict, response: str) -> bool:
        """检查 SWE-bench 响应"""
        expected_keywords = task.get("expected_keywords", [])
        return all(kw.lower() in response.lower() for kw in expected_keywords)

    def _run_test(self, code: str, test_code: str) -> bool:
        """执行代码并运行测试"""
        try:
            full_code = f"{code}\n\n{test_code}\nprint('PASSED')"
            exec(full_code)
            return True
        except Exception:
            return False


# 模拟 Agent 函数
def mock_agent(query: str) -> str:
    """模拟的 Agent 函数"""
    time.sleep(0.05)
    return f"这是对 '{query[:20]}...' 的回答"


# 测试数据
SWE_BENCH_TASKS = [
    {"id": "django-1", "problem": "Fix the timezone issue", "expected_keywords": ["timezone"]},
    {"id": "django-2", "problem": "Add null check for user", "expected_keywords": ["null"]},
    {"id": "flask-1", "problem": "Fix route parameter parsing", "expected_keywords": ["route"]},
]

HUMANEVAL_TASKS = [
    {"id": "HE-1", "prompt": "def add(a, b): return a + b",
     "test": "assert add(1, 2) == 3"},
    {"id": "HE-2", "prompt": "def multiply(a, b): return a * b",
     "test": "assert multiply(2, 3) == 6"},
    {"id": "HE-3", "prompt": "def factorial(n): return 1 if n <= 1 else n * factorial(n-1)",
     "test": "assert factorial(5) == 120"},
]


if __name__ == "__main__":
    print("基准测试运行示例")
    print("=" * 60)

    runner = SimpleBenchmarkRunner(mock_agent)

    print("\n运行 SWE-bench 测试...")
    swe_result = runner.run_swe_bench_sample(SWE_BENCH_TASKS)
    print(f"结果: {json.dumps(swe_result.to_dict(), indent=2, ensure_ascii=False)}")

    print("\n运行 HumanEval 测试...")
    he_result = runner.run_human_eval_sample(HUMANEVAL_TASKS)
    print(f"结果: {json.dumps(he_result.to_dict(), indent=2, ensure_ascii=False)}")

    print("\n" + "=" * 60)
    print("汇总结果")
    print("=" * 60)
    print(f"SWE-bench 准确率: {swe_result.accuracy * 100:.1f}%")
    print(f"HumanEval 准确率: {he_result.accuracy * 100:.1f}%")
    print(f"平均延迟: {(swe_result.avg_latency + he_result.avg_latency) / 2:.3f}秒")
```

---

## 预期输出

### 运行 swe_bench_intro.py

```
SWE-bench 基准测试介绍
============================================================

SWE-bench 是什么？
- 由 Princeton 大学开发
- 包含 2294 个真实的 GitHub Issue
- 来自 12 个流行的 Python 仓库

============================================================
任务 ID: django__django-11099
仓库: django/django
============================================================
```

### 运行 humaneval_intro.py

```
HumanEval 基准测试介绍
============================================================

HumanEval 是什么？
- 由 OpenAI 开发
- 包含 164 个 Python 编程问题

============================================================
任务 ID: HumanEval/0
函数名: has_close_elements
============================================================

参考答案测试结果: {'passed': True, 'error': None}
```

### 运行 run_benchmark.py

```
基准测试运行示例
============================================================

运行 SWE-bench 测试...
结果: {
  "benchmark_name": "SWE-bench (Sample)",
  "total_tasks": 3,
  "passed_tasks": 3,
  "accuracy": 1.0,
  "avg_latency": 0.05
}

运行 HumanEval 测试...
结果: {
  "benchmark_name": "HumanEval (Sample)",
  "total_tasks": 3,
  "passed_tasks": 3,
  "accuracy": 1.0
}

============================================================
汇总结果
============================================================
SWE-bench 准确率: 100.0%
HumanEval 准确率: 100.0%
平均延迟: 0.050秒
```

---

## 常见错误及解决方案

### 错误 1: 数据集下载失败

```
ConnectionError: Failed to download dataset
```

**解决方案：**

```python
# 使用缓存
from datasets import load_dataset
dataset = load_dataset("openai_humaneval", cache_dir="./cache")
```

### 错误 2: 内存不足

```
MemoryError: Unable to allocate array
```

**解决方案：** 分批处理数据集。

### 错误 3: 代码执行超时

```
TimeoutError: Code execution timed out
```

**解决方案：**

```python
import signal

def timeout_handler(signum, frame):
    raise TimeoutError("代码执行超时")

signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(5)  # 5秒超时
```

---

## 每日挑战

### 挑战 1: 运行真实基准测试

使用 datasets 库加载真实的小规模数据集，并运行你的 Agent。

### 挑战 2: 对比不同模型

使用相同的测试集，对比两个不同模型的表现。

### 挑战 3: 创建自定义基准测试

基于你的 Agent 的特定场景，创建一个小型的自定义基准测试。

---

## 今日小结

今天我们了解了业界主流的 Agent 基准测试：

1. **SWE-bench**：真实软件工程问题，评估代码修复能力
2. **HumanEval**：编程问题，评估代码生成能力
3. **GAIA**：综合能力测试，评估多步推理能力
4. **MMLU**：知识理解测试，评估学科知识广度

**关键要点：**

- 选择合适的基准测试取决于你的 Agent 的目标场景
- 基准测试结果可以横向对比不同 Agent 的能力
- 实际项目中通常需要自定义评估维度

---

*明天见！我们将一起构建自动化评估流水线。*
