# 📅 Week 11 Day 2：行业基准：SWE-bench / HumanEval / GAIA

## 🧭 今日方向
> 了解业界主流的 Agent 评估基准，理解它们的设计思路和适用场景。

## 🎯 生活比喻
> 行业基准就像各种标准化考试：高考考察综合能力，托福考察英语能力，驾照考试考察驾驶能力。SWE-bench 考察"修 bug"能力，HumanEval 考察"写代码"能力，GAIA 考察"综合推理"能力。了解这些考试，才能知道自己的 Agent 在行业中的水平。

## 📋 今日三件事
1. 了解 SWE-bench：软件工程任务基准
2. 了解 HumanEval：代码生成基准
3. 了解 GAIA：通用 AI 助手基准

## 🗺️ 手把手路线

### Step 1：SWE-bench 理解
- 做什么: 学习 SWE-bench 的任务定义和评估方式
- 为什么: 这是评估代码 Agent 的权威基准
- 成功标志: 能解释 SWE-bench 的评估流程

### Step 2：HumanEval 理解
- 做什么: 学习 HumanEval 的函数级代码生成任务
- 为什么: 代码生成是 Agent 的核心能力之一
- 成功标志: 能解释 pass@k 指标

### Step 3：GAIA 理解
- 做什么: 学习 GAIA 的多步骤推理任务
- 为什么: 综合推理能力是通用 Agent 的关键
- 成功标志: 能解释 GAIA 的三个难度级别

### Step 4：代码实践
- 做什么: 实现一个简化版的基准测试 runner
- 为什么: 代码是最好的理解方式
- 成功标志: 代码跑通

## 💻 代码区

```python
"""
行业基准测试：SWE-bench / HumanEval / GAIA
模拟实现核心评估逻辑
"""
from dataclasses import dataclass, field
from typing import List, Dict, Callable, Any
from enum import Enum
import ast
import time

# ========== 1. SWE-bench 模拟 ==========

@dataclass
class SWEBenchTask:
    """SWE-bench 任务"""
    task_id: str
    repo: str
    problem_statement: str
    hints: str
    test_patch: str
    gold_patch: str
    created_at: str = ""


class SWEBenchEvaluator:
    """SWE-bench 评估器"""
    
    def __init__(self):
        self.tasks: List[SWEBenchTask] = []
    
    def load_sample_tasks(self):
        """加载示例任务"""
        self.tasks = [
            SWEBenchTask(
                task_id="django__django-11099",
                repo="django/django",
                problem_statement="Fix the bug in the login view that causes a 500 error when invalid form data is submitted.",
                hints="Look at the login view in django/contrib/auth/views.py",
                test_patch="--- a/django/contrib/auth/tests/test_views.py\n+++ b/django/contrib/auth/tests/test_views.py\n@@ -100,6 +100,12 @@\n+    def test_invalid_login(self):\n+        response = self.client.post('/login/', {'username': 'invalid', 'password': 'invalid'})\n+        self.assertEqual(response.status_code, 200)",
                gold_patch="--- a/django/contrib/auth/views.py\n+++ b/django/contrib/auth/views.py\n@@ -50,7 +50,8 @@\n-    if form.is_valid():\n+    try:\n+        if form.is_valid():\n+            ...",
                created_at="2024-01-15"
            ),
            SWEBenchTask(
                task_id="sympy__sympy-20049",
                repo="sympy/sympy",
                problem_statement="Fix the issue where simplify() fails to simplify expressions with nested radicals.",
                hints="Check the simplify function in sympy/simplify/simplify.py",
                test_patch="--- a/sympy/simplify/tests/test_simplify.py\n+++ b/sympy/simplify/tests/test_simplify.py\n@@ -200,6 +200,10 @@\n+    def test_nested_radicals(self):\n+        expr = sqrt(2 + sqrt(3))\n+        result = simplify(expr)\n+        assert result == (sqrt(6) + sqrt(2))/2",
                gold_patch="--- a/sympy/simplify/simplify.py\n+++ b/sympy/simplify/simplify.py\n@@ -150,5 +150,8 @@\n+    # Handle nested radicals\n+    if isinstance(expr, Pow) and expr.exp == S.Half:\n+        ...",
                created_at="2024-02-20"
            ),
        ]
    
    def evaluate_patch(self, task: SWEBenchTask, generated_patch: str) -> Dict:
        """评估生成的补丁"""
        # 简化评估：检查补丁是否包含关键修改
        has_fix = "try:" in generated_patch or "except" in generated_patch
        has_test = "test_" in generated_patch
        
        return {
            "task_id": task.task_id,
            "patch_generated": bool(generated_patch),
            "has_error_handling": has_fix,
            "has_test_updates": has_test,
            "resolves_issue": has_fix,  # 简化判断
        }
    
    def run_benchmark(self, agent_func: Callable) -> Dict:
        """运行 SWE-bench 基准测试"""
        results = []
        for task in self.tasks:
            try:
                generated_patch = agent_func(task)
                result = self.evaluate_patch(task, generated_patch)
                results.append(result)
            except Exception as e:
                results.append({
                    "task_id": task.task_id,
                    "error": str(e),
                    "resolves_issue": False
                })
        
        resolved = sum(1 for r in results if r.get("resolves_issue", False))
        return {
            "benchmark": "SWE-bench (simulated)",
            "total_tasks": len(results),
            "resolved": resolved,
            "resolution_rate": resolved / max(len(results), 1),
            "results": results
        }


# ========== 2. HumanEval 模拟 ==========

@dataclass
class HumanEvalTask:
    """HumanEval 任务"""
    task_id: str
    prompt: str
    entry_point: str
    test_cases: str
    canonical_solution: str
    difficulty: str = "easy"


class HumanEvalEvaluator:
    """HumanEval 评估器"""
    
    def __init__(self, k_values: List[int] = [1, 5, 10]):
        self.k_values = k_values
        self.tasks: List[HumanEvalTask] = []
    
    def load_sample_tasks(self):
        """加载示例任务"""
        self.tasks = [
            HumanEvalTask(
                task_id="HumanEval/0",
                prompt='def has_close_elements(numbers: List[float], threshold: float) -> bool:\n    """Check if in given list of numbers, are any two numbers close to each other.\n    >>> has_close_elements([1.0, 2.0, 3.0], 0.5)\n    False\n    >>> has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3)\n    True\n    """',
                entry_point="has_close_elements",
                test_cases="assert has_close_elements([1.0, 2.0, 3.0], 0.5) == False\nassert has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3) == True",
                canonical_solution="    for i in range(len(numbers)):\n        for j in range(i + 1, len(numbers)):\n            if abs(numbers[i] - numbers[j]) < threshold:\n                return True\n    return False",
                difficulty="easy"
            ),
            HumanEvalTask(
                task_id="HumanEval/1",
                prompt='def separate_paren_groups(paren_string: str) -> List[str]:\n    """Input to this function is a string containing multiple groups of nested parentheses.\n    Your goal is to separate those groups into separate strings and return the list.\n    >>> separate_paren_groups('(()) ((())) () (()())')\n    ['(())', '((()))', '()', '(()())']\n    """',
                entry_point="separate_paren_groups",
                test_cases="assert separate_paren_groups('(()) ((())) () (()())') == ['(())', '((()))', '()', '(()())']",
                canonical_solution="    result = []\n    current = []\n    depth = 0\n    for c in paren_string:\n        if c == '(':\n            depth += 1\n            current.append(c)\n        elif c == ')':\n            depth -= 1\n            current.append(c)\n            if depth == 0:\n                result.append(''.join(current))\n                current = []\n    return result",
                difficulty="easy"
            ),
        ]
    
    def execute_code(self, code: str, test_cases: str) -> bool:
        """执行代码并运行测试"""
        try:
            # 创建执行环境
            exec_env = {}
            exec(code, exec_env)
            exec(test_cases, exec_env)
            return True
        except Exception as e:
            return False
    
    def pass_at_k(self, n: int, c: int, k: int) -> float:
        """
        计算 pass@k
        n: 总生成次数
        c: 成功次数
        k: top-k
        """
        if n - c < k:
            return 1.0
        return 1.0 - np.prod(1.0 - k / np.arange(n - c + 1, n + 1))
    
    def evaluate_solution(self, task: HumanEvalTask, generated_code: str) -> Dict:
        """评估生成的代码"""
        full_code = f"{task.prompt}\n{generated_code}\n"
        passes = self.execute_code(full_code, task.test_cases)
        
        return {
            "task_id": task.task_id,
            "passes_tests": passes,
            "difficulty": task.difficulty,
        }
    
    def run_benchmark(self, agent_func: Callable) -> Dict:
        """运行 HumanEval 基准测试"""
        results = []
        for task in self.tasks:
            try:
                generated_code = agent_func(task)
                result = self.evaluate_solution(task, generated_code)
                results.append(result)
            except Exception as e:
                results.append({
                    "task_id": task.task_id,
                    "error": str(e),
                    "passes_tests": False
                })
        
        passed = sum(1 for r in results if r.get("passes_tests", False))
        
        # 计算 pass@k (简化)
        pass_at_1 = passed / max(len(results), 1)
        
        return {
            "benchmark": "HumanEval (simulated)",
            "total_tasks": len(results),
            "passed": passed,
            "pass_at_1": pass_at_1,
            "results": results
        }


# ========== 3. GAIA 模拟 ==========

class GAIALevel(Enum):
    """GAIA 难度级别"""
    LEVEL1 = 1  # 简单：直接检索或简单推理
    LEVEL2 = 2  # 中等：多步骤推理或工具调用
    LEVEL3 = 3  # 困难：复杂推理链或专业领域知识


@dataclass
class GAIATask:
    """GAIA 任务"""
    task_id: str
    question: str
    level: GAIALevel
    final_answer: str
    tools: List[str]
    metadata: Dict = field(default_factory=dict)


class GAIABenchmark:
    """GAIA 基准测试"""
    
    def __init__(self):
        self.tasks: List[GAIATask] = []
    
    def load_sample_tasks(self):
        """加载示例任务"""
        self.tasks = [
            GAIATask(
                task_id="gaia_001",
                question="What is the population of the capital of France?",
                level=GAIALevel.LEVEL1,
                final_answer="2161000",
                tools=["search"]
            ),
            GAIATask(
                task_id="gaia_002",
                question="If I have 5 apples and give 2 to my friend, then buy 3 more, how many apples do I have?",
                level=GAIALevel.LEVEL1,
                final_answer="6",
                tools=["calculate"]
            ),
            GAIATask(
                task_id="gaia_003",
                question="What is the square root of the sum of the first 10 prime numbers?",
                level=GAIALevel.LEVEL2,
                final_answer="6.78",
                tools=["search", "calculate"]
            ),
            GAIATask(
                task_id="gaia_004",
                question="Based on the current weather in Tokyo and the exchange rate between JPY and USD, how much would a $100 item cost in yen?",
                level=GAIALevel.LEVEL3,
                final_answer="15000",
                tools=["search", "calculate"],
                metadata={"requires_web_access": True}
            ),
        ]
    
    def evaluate_answer(self, task: GAIATask, predicted_answer: str) -> Dict:
        """评估答案"""
        # 简化评估：检查答案是否匹配
        match = predicted_answer.strip() == task.final_answer.strip()
        
        # 部分匹配（数字近似）
        try:
            pred_num = float(predicted_answer)
            true_num = float(task.final_answer)
            approx_match = abs(pred_num - true_num) / max(abs(true_num), 1) < 0.1
        except:
            approx_match = False
        
        return {
            "task_id": task.task_id,
            "exact_match": match,
            "approximate_match": approx_match,
            "level": task.level.value,
            "tools_required": len(task.tools)
        }
    
    def run_benchmark(self, agent_func: Callable) -> Dict:
        """运行 GAIA 基准测试"""
        results = []
        for task in self.tasks:
            try:
                predicted_answer = agent_func(task)
                result = self.evaluate_answer(task, predicted_answer)
                results.append(result)
            except Exception as e:
                results.append({
                    "task_id": task.task_id,
                    "error": str(e),
                    "exact_match": False
                })
        
        # 按级别统计
        by_level = {}
        for level in GAIALevel:
            level_results = [r for r in results if r.get("level") == level.value]
            if level_results:
                by_level[f"level_{level.value}"] = {
                    "total": len(level_results),
                    "exact_matches": sum(1 for r in level_results if r.get("exact_match", False)),
                    "accuracy": sum(1 for r in level_results if r.get("exact_match", False)) / len(level_results)
                }
        
        return {
            "benchmark": "GAIA (simulated)",
            "total_tasks": len(results),
            "overall_accuracy": sum(1 for r in results if r.get("exact_match", False)) / max(len(results), 1),
            "by_level": by_level,
            "results": results
        }


# ========== 4. 基准对比 ==========

def compare_benchmarks():
    """对比各基准测试"""
    comparison = """
行业基准测试对比
================

1. SWE-bench
   - 任务类型: 修复 GitHub issues
   - 评估指标: Resolution Rate (解决问题的比例)
   - 难度: 高
   - 适用场景: 评估代码修复能力
   - 代表模型: Devin, SWE-agent, CodeR

2. HumanEval
   - 任务类型: 函数级代码生成
   - 评估指标: pass@k (生成 k 次至少一次通过的概率)
   - 难度: 中等
   - 适用场景: 评估代码生成能力
   - 代表模型: GPT-4, Claude, Codex

3. GAIA
   - 任务类型: 多步骤推理问题
   - 评估指标: Accuracy (答案准确率)
   - 难度: 分三个级别
   - 适用场景: 评估综合推理能力
   - 代表模型: GPT-4, Claude, Gemini

选择建议:
  - 代码 Agent → SWE-bench + HumanEval
  - 通用助手 → GAIA
  - 综合评估 → 三者结合
"""
    print(comparison)


# ========== 5. 主函数 ==========

import numpy as np

def main():
    """主函数"""
    print("=" * 60)
    print("行业基准测试模拟")
    print("=" * 60)
    
    # 示例 Agent 函数
    def sample_agent_for_swe(task):
        return "--- a/file.py\n+++ b/file.py\n@@ -1,3 +1,4 @@\n+try:\n     existing code\n+except Exception:\n+    pass"
    
    def sample_agent_for_humaneval(task):
        return "    for i in range(len(numbers)):\n        for j in range(i + 1, len(numbers)):\n            if abs(numbers[i] - numbers[j]) < threshold:\n                return True\n    return False"
    
    def sample_agent_for_gaia(task):
        return task.final_answer  # 简化：直接返回正确答案
    
    # 运行 SWE-bench
    print("\n1. SWE-bench 测试:")
    swe = SWEBenchEvaluator()
    swe.load_sample_tasks()
    swe_results = swe.run_benchmark(sample_agent_for_swe)
    print(f"   解决率: {swe_results['resolution_rate']*100:.1f}%")
    
    # 运行 HumanEval
    print("\n2. HumanEval 测试:")
    humaneval = HumanEvalEvaluator()
    humaneval.load_sample_tasks()
    humaneval_results = humaneval.run_benchmark(sample_agent_for_humaneval)
    print(f"   Pass@1: {humaneval_results['pass_at_1']*100:.1f}%")
    
    # 运行 GAIA
    print("\n3. GAIA 测试:")
    gaia = GAIABenchmark()
    gaia.load_sample_tasks()
    gaia_results = gaia.run_benchmark(sample_agent_for_gaia)
    print(f"   准确率: {gaia_results['overall_accuracy']*100:.1f}%")
    
    # 对比
    print("\n4. 基准对比:")
    compare_benchmarks()
    
    print("\n" + "=" * 60)
    print("基准测试演示完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 不知道选哪个基准 | 根据 Agent 类型选择对应的基准 |
| 2 | SWE-bench 太难 | 从 HumanEval 开始，逐步提升 |
| 3 | 评估结果差 | 分析 bad case，针对性改进 |
| 4 | 没有真实评测环境 | 使用模拟版本理解原理 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| SWE-bench | 修复 GitHub issues 的软件工程基准 |
| HumanEval | 函数级代码生成基准 |
| GAIA | 多步骤推理的通用 AI 助手基准 |
| pass@k | 生成 k 次至少一次通过的概率 |
| Resolution Rate | 问题被成功解决的比例 |
| Benchmark | 标准化的评估测试套件 |

## ✅ 验收清单
- [ ] 能解释三大基准的任务类型和评估指标
- [ ] 理解 pass@k 的计算方式
- [ ] 能根据 Agent 类型选择合适的基准
- [ ] 代码能跑通

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
