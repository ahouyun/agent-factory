# 📅 Week 4 Day 4：Reflection 范式：自我反思

## 🧭 今日方向
> 今天我们将学习 Reflection（反思）范式，这是一种让 Agent 能够自我评估和改进的设计模式。

## 🎯 生活比喻
> 反思就像照镜子：Agent 完成任务后，会"照镜子"看看自己做得怎么样，然后思考如何改进。就像学生做完作业后检查答案一样。

## 📋 今日三件事
1. 理解反思范式的工作原理
2. 学习自我评估和改进机制
3. 通过代码实践反思模式

## 🗺️ 手把手路线

### Step 1: 反思原理
- **做什么**: 理解 Agent 如何进行自我评估
- **为什么**: 反思是持续改进的关键
- **成功标志**: 能解释反思的工作流程

### Step 2: 评估机制
- **做什么**: 学习如何设计评估标准
- **为什么**: 好的评估标准才能有效改进
- **成功标志**: 能设计合理的评估指标

### Step 3: 实践应用
- **做什么**: 通过实际案例应用反思模式
- **为什么**: 实践是最好的学习方式
- **成功标志**: 能实现带反思功能的 Agent

## 💻 代码区

```python
# Reflection 范式实现

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from enum import Enum
import json

class FeedbackType(str, Enum):
    """反馈类型"""
    POSITIVE = "positive"  # 正面
    NEGATIVE = "negative"  # 负面
    NEUTRAL = "neutral"    # 中性
    SUGGESTION = "suggestion"  # 建议

@dataclass
class Feedback:
    """反馈"""
    feedback_type: FeedbackType
    content: str
    score: float  # 0-1
    category: str
    suggestions: List[str] = field(default_factory=list)

@dataclass
class ReflectionResult:
    """反思结果"""
    original_output: str
    feedback: List[Feedback]
    improved_output: Optional[str]
    improvement_score: float
    lessons_learned: List[str]

class Evaluator:
    """评估器"""
    
    def __init__(self):
        self.evaluation_criteria = {
            "accuracy": "准确性",
            "completeness": "完整性",
            "clarity": "清晰度",
            "relevance": "相关性",
            "efficiency": "效率"
        }
    
    def evaluate(self, output: str, task: str) -> List[Feedback]:
        """评估输出"""
        feedbacks = []
        
        # 简化的评估逻辑
        # 准确性评估
        accuracy_score = self._evaluate_accuracy(output, task)
        feedbacks.append(Feedback(
            feedback_type=FeedbackType.POSITIVE if accuracy_score > 0.7 else FeedbackType.NEGATIVE,
            content=f"准确性评估: {'良好' if accuracy_score > 0.7 else '需要改进'}",
            score=accuracy_score,
            category="accuracy"
        ))
        
        # 完整性评估
        completeness_score = self._evaluate_completeness(output, task)
        feedbacks.append(Feedback(
            feedback_type=FeedbackType.POSITIVE if completeness_score > 0.7 else FeedbackType.SUGGESTION,
            content=f"完整性评估: {'覆盖全面' if completeness_score > 0.7 else '可以补充更多细节'}",
            score=completeness_score,
            category="completeness"
        ))
        
        # 清晰度评估
        clarity_score = self._evaluate_clarity(output)
        feedbacks.append(Feedback(
            feedback_type=FeedbackType.POSITIVE if clarity_score > 0.7 else FeedbackType.NEGATIVE,
            content=f"清晰度评估: {'表达清晰' if clarity_score > 0.7 else '需要简化表达'}",
            score=clarity_score,
            category="clarity"
        ))
        
        return feedbacks
    
    def _evaluate_accuracy(self, output: str, task: str) -> float:
        """评估准确性"""
        # 简化的评估逻辑
        if len(output) > 10:
            return 0.8
        return 0.5
    
    def _evaluate_completeness(self, output: str, task: str) -> float:
        """评估完整性"""
        # 简化的评估逻辑
        if len(output) > 20:
            return 0.9
        return 0.6
    
    def _evaluate_clarity(self, output: str) -> float:
        """评估清晰度"""
        # 简化的评估逻辑
        if len(output) < 100:
            return 0.8
        return 0.7

class Reflector:
    """反思器"""
    
    def __init__(self):
        self.history: List[ReflectionResult] = []
    
    def reflect(self, output: str, task: str, evaluator: Evaluator) -> ReflectionResult:
        """进行反思"""
        print(f"\n🔍 开始反思...")
        
        # 1. 评估输出
        feedbacks = evaluator.evaluate(output, task)
        
        # 2. 分析反馈
        analysis = self._analyze_feedback(feedbacks)
        
        # 3. 生成改进建议
        suggestions = self._generate_suggestions(feedbacks)
        
        # 4. 改进输出
        improved_output = self._improve_output(output, suggestions)
        
        # 5. 记录经验教训
        lessons = self._extract_lessons(feedbacks, analysis)
        
        result = ReflectionResult(
            original_output=output,
            feedback=feedbacks,
            improved_output=improved_output,
            improvement_score=analysis["improvement_score"],
            lessons_learned=lessons
        )
        
        self.history.append(result)
        
        return result
    
    def _analyze_feedback(self, feedbacks: List[Feedback]) -> Dict:
        """分析反馈"""
        scores = [f.score for f in feedbacks]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        return {
            "average_score": avg_score,
            "improvement_score": 1 - avg_score,
            "feedback_count": len(feedbacks),
            "categories": [f.category for f in feedbacks]
        }
    
    def _generate_suggestions(self, feedbacks: List[Feedback]) -> List[str]:
        """生成改进建议"""
        suggestions = []
        
        for feedback in feedbacks:
            if feedback.score < 0.7:
                suggestions.append(f"改进{feedback.category}: {feedback.content}")
        
        return suggestions
    
    def _improve_output(self, output: str, suggestions: List[str]) -> str:
        """改进输出"""
        if not suggestions:
            return output
        
        improved = output + "\n\n改进内容:\n"
        for suggestion in suggestions:
            improved += f"- {suggestion}\n"
        
        return improved
    
    def _extract_lessons(self, feedbacks: List[Feedback], analysis: Dict) -> List[str]:
        """提取经验教训"""
        lessons = []
        
        if analysis["average_score"] < 0.7:
            lessons.append("需要提高输出质量")
        
        for feedback in feedbacks:
            if feedback.score < 0.5:
                lessons.append(f"{feedback.category} 是薄弱环节")
        
        return lessons
    
    def get_improvement_history(self) -> List[Dict]:
        """获取改进历史"""
        return [
            {
                "iteration": i + 1,
                "original_score": sum(f.score for f in r.feedback) / len(r.feedback),
                "improvement_score": r.improvement_score,
                "lessons": r.lessons_learned
            }
            for i, r in enumerate(self.history)
        ]

class ReflectionAgent:
    """反思智能体"""
    
    def __init__(self, name: str, max_iterations: int = 3):
        self.name = name
        self.max_iterations = max_iterations
        self.evaluator = Evaluator()
        self.reflector = Reflector()
    
    def solve(self, task: str) -> Dict:
        """解决问题（带反思）"""
        print(f"\n{'='*60}")
        print(f"🤖 {self.name} 开始解决问题")
        print(f"任务: {task}")
        print(f"{'='*60}")
        
        # 初始输出
        current_output = self._generate_initial_output(task)
        print(f"\n初始输出: {current_output[:100]}...")
        
        # 反思循环
        for iteration in range(self.max_iterations):
            print(f"\n--- 反思轮次 {iteration + 1} ---")
            
            # 进行反思
            reflection = self.reflector.reflect(
                current_output, task, self.evaluator
            )
            
            print(f"  评估分数: {reflection.improvement_score:.2f}")
            print(f"  经验教训: {reflection.lessons_learned}")
            
            # 如果改进不明显，停止
            if reflection.improvement_score < 0.1:
                print("  改进不明显，停止反思")
                break
            
            # 使用改进后的输出
            if reflection.improved_output:
                current_output = reflection.improved_output
        
        # 最终总结
        summary = self._generate_summary(task, current_output)
        
        return {
            "task": task,
            "final_output": current_output,
            "iterations": self.reflector.get_improvement_history(),
            "summary": summary
        }
    
    def _generate_initial_output(self, task: str) -> str:
        """生成初始输出"""
        return f"针对任务 '{task}' 的解决方案:\n1. 分析问题\n2. 制定策略\n3. 执行方案"
    
    def _generate_summary(self, task: str, output: str) -> str:
        """生成总结"""
        history = self.reflector.get_improvement_history()
        
        summary = f"""
反思总结:
- 任务: {task}
- 反思轮次: {len(history)}
- 最终输出: {output[:200]}...
"""
        
        if history:
            initial_score = history[0]["original_score"]
            final_score = 1 - history[-1]["improvement_score"]
            summary += f"- 初始分数: {initial_score:.2f}\n"
            summary += f"- 最终分数: {final_score:.2f}\n"
            summary += f"- 提升幅度: {final_score - initial_score:.2f}\n"
        
        return summary

# 使用示例
if __name__ == "__main__":
    # 创建 Agent
    agent = ReflectionAgent(
        name="反思助手",
        max_iterations=3
    )
    
    # 解决问题
    result = agent.solve("如何提高编程效率")
    
    # 打印结果
    print(result["summary"])
```

```python
# 反思评估标准

EVALUATION_CRITERIA = """
反思评估标准
===========

1. 准确性（Accuracy）
   - 信息是否正确
   - 结论是否合理
   - 数据是否可靠

2. 完整性（Completeness）
   - 是否覆盖所有要点
   - 是否有遗漏
   - 细节是否充分

3. 清晰度（Clarity）
   - 表达是否清晰
   - 逻辑是否连贯
   - 是否易于理解

4. 相关性（Relevance）
   - 是否针对问题
   - 是否有偏题
   - 是否有价值

5. 效率（Efficiency）
   - 是否简洁
   - 是否冗余
   - 是否高效

6. 创新性（Innovation）
   - 是否有新意
   - 是否有创意
   - 是否有独特见解

7. 可行性（Feasibility）
   - 是否可执行
   - 是否有风险
   - 是否有资源
"""

print(EVALUATION_CRITERIA)

# 反思提示模板
REFLECTION_PROMPT = """
请对以下输出进行反思和改进：

原始输出：
{original_output}

任务要求：
{task}

请从以下方面进行评估：
1. 准确性：信息是否正确
2. 完整性：是否覆盖所有要点
3. 清晰度：表达是否清晰
4. 相关性：是否针对问题
5. 效率：是否简洁

请提供：
1. 评估结果
2. 改进建议
3. 改进后的输出
"""

print(REFLECTION_PROMPT)
```

```python
# 反思实战：写作改进

class WritingReflector:
    """写作反思器"""
    
    def __init__(self):
        self.writing_standards = {
            "grammar": "语法正确",
            "vocabulary": "词汇丰富",
            "structure": "结构清晰",
            "argument": "论证有力",
            "creativity": "有创意"
        }
    
    def reflect_on_writing(self, text: str, writing_type: str) -> Dict:
        """反思写作"""
        print(f"\n📝 写作反思: {writing_type}")
        print("=" * 50)
        
        # 评估
        evaluation = self._evaluate_writing(text, writing_type)
        
        # 分析
        analysis = self._analyze_writing(text, evaluation)
        
        # 改进建议
        suggestions = self._generate_writing_suggestions(evaluation)
        
        # 改进版本
        improved_version = self._improve_writing(text, suggestions)
        
        return {
            "original": text,
            "evaluation": evaluation,
            "analysis": analysis,
            "suggestions": suggestions,
            "improved_version": improved_version
        }
    
    def _evaluate_writing(self, text: str, writing_type: str) -> Dict:
        """评估写作"""
        evaluation = {}
        
        for standard, description in self.writing_standards.items():
            # 简化的评估逻辑
            score = 0.7  # 默认分数
            if standard == "grammar" and len(text) > 0:
                score = 0.8
            elif standard == "vocabulary" and len(set(text.split())) > 5:
                score = 0.9
            
            evaluation[standard] = {
                "description": description,
                "score": score,
                "feedback": f"{description}：{'良好' if score > 0.7 else '需要改进'}"
            }
        
        return evaluation
    
    def _analyze_writing(self, text: str, evaluation: Dict) -> Dict:
        """分析写作"""
        avg_score = sum(item["score"] for item in evaluation.values()) / len(evaluation)
        
        return {
            "average_score": avg_score,
            "strengths": [k for k, v in evaluation.items() if v["score"] > 0.8],
            "weaknesses": [k for k, v in evaluation.items() if v["score"] < 0.7]
        }
    
    def _generate_writing_suggestions(self, evaluation: Dict) -> List[str]:
        """生成写作建议"""
        suggestions = []
        
        for standard, item in evaluation.items():
            if item["score"] < 0.7:
                suggestions.append(f"改进{standard}: {item['feedback']}")
        
        return suggestions
    
    def _improve_writing(self, text: str, suggestions: List[str]) -> str:
        """改进写作"""
        improved = text + "\n\n改进版本:\n"
        
        for suggestion in suggestions:
            improved += f"- {suggestion}\n"
        
        return improved

# 使用示例
if __name__ == "__main__":
    reflector = WritingReflector()
    
    result = reflector.reflect_on_writing(
        "这是一个关于AI的文章。AI很有趣。",
        "说明文"
    )
    
    print("\n评估结果:")
    for standard, item in result["evaluation"].items():
        print(f"  {standard}: {item['score']:.2f} - {item['feedback']}")
    
    print(f"\n平均分: {result['analysis']['average_score']:.2f}")
    print(f"优势: {result['analysis']['strengths']}")
    print(f"弱点: {result['analysis']['weaknesses']}")
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 反思流于表面 | 设计更具体的评估标准 |
| 2 | 改进不明显 | 增加反思轮次，细化反馈 |
| 3 | 评估标准主观 | 使用客观指标，多人评估 |
| 4 | 反思耗时过长 | 设置时间限制，优化流程 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| Reflection | Agent 的自我反思和改进机制 |
| 评估器 | 评估输出质量的组件 |
| 反思器 | 分析反馈并生成改进建议的组件 |
| 改进分数 | 衡量改进程度的指标 |
| 经验教训 | 从反思中提取的知识 |
| 反思轮次 | 进行反思的次数 |

## ✅ 验收清单
- [ ] 理解反思范式的工作原理
- [ ] 能设计评估标准
- [ ] 能实现反思器
- [ ] 能通过反思改进输出

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
