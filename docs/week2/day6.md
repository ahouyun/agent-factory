# Day 6: JSON Mode + 结构化输出

## 今日学习目标

1. 理解结构化输出的重要性
2. 掌握 JSON Mode 的使用方法
3. 学习 Pydantic Schema 验证
4. 实现 LLM 结构化输出服务
5. 理解输出验证的最佳实践

---

## 第一部分：为什么需要结构化输出？

### 问题：LLM 输出的不确定性

```python
# 传统 LLM 调用的问题
"""
用户: 帮我分析这个文本的情感

LLM 可能返回:
1. "这个文本是正面的"（纯文本，难以解析）
2. "情感：正面"（格式不固定）
3. "我认为这个文本表达了积极的情感..."（冗长，难以提取）
"""
```

### 解决方案：结构化输出

```python
# 使用结构化输出
"""
用户: 帮我分析这个文本的情感

LLM 返回（JSON 格式）:
{
  "sentiment": "positive",
  "confidence": 0.95,
  "keywords": ["积极", "正面"],
  "reason": "文本表达了满意的情绪"
}

优点:
1. 格式固定，易于解析
2. 包含置信度，可评估质量
3. 包含关键词，便于后续处理
4. 包含原因，可解释性好
"""
```

---

## 第二部分：Pydantic Schema 定义

### 文件：app/schemas/llm.py

```python
"""
LLM 输出的 Pydantic 模型
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime


# ==================== 情感分析 ====================

class SentimentType(str, Enum):
    """情感类型"""
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    MIXED = "mixed"


class SentimentResult(BaseModel):
    """情感分析结果"""
    text: str = Field(..., description="原始文本")
    sentiment: SentimentType = Field(..., description="情感类型")
    confidence: float = Field(..., ge=0, le=1, description="置信度 0-1")
    keywords: List[str] = Field(default_factory=list, description="关键词")
    reason: Optional[str] = Field(None, description="分析原因")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "这个产品非常好用，我很满意！",
                "sentiment": "positive",
                "confidence": 0.95,
                "keywords": ["好用", "满意"],
                "reason": "文本表达了积极的情绪"
            }
        }


# ==================== 实体抽取 ====================

class EntityType(str, Enum):
    """实体类型"""
    PERSON = "PERSON"        # 人名
    ORGANIZATION = "ORG"     # 组织
    LOCATION = "LOC"         # 地点
    DATE = "DATE"            # 日期
    MONEY = "MONEY"          # 金钱
    TECH = "TECH"            # 技术


class Entity(BaseModel):
    """实体"""
    text: str = Field(..., description="实体文本")
    entity_type: EntityType = Field(..., description="实体类型")
    start_pos: int = Field(..., ge=0, description="开始位置")
    end_pos: int = Field(..., ge=0, description="结束位置")
    confidence: float = Field(..., ge=0, le=1, description="置信度")


class EntityExtractionResult(BaseModel):
    """实体抽取结果"""
    text: str = Field(..., description="原始文本")
    entities: List[Entity] = Field(default_factory=list, description="实体列表")
    entity_count: int = Field(..., ge=0, description="实体数量")


# ==================== 文本分类 ====================

class TextCategory(str, Enum):
    """文本分类"""
    TECH = "技术"
    SCIENCE = "科学"
    BUSINESS = "商业"
    ENTERTAINMENT = "娱乐"
    SPORTS = "体育"
    POLITICS = "政治"
    OTHER = "其他"


class ClassificationResult(BaseModel):
    """分类结果"""
    text: str = Field(..., description="原始文本")
    category: TextCategory = Field(..., description="分类")
    subcategory: Optional[str] = Field(None, description="子分类")
    confidence: float = Field(..., ge=0, le=1, description="置信度")
    tags: List[str] = Field(default_factory=list, description="标签")


# ==================== 代码分析 ====================

class CodeLanguage(str, Enum):
    """编程语言"""
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    JAVA = "java"
    GO = "go"
    RUST = "rust"
    OTHER = "other"


class CodeIssue(BaseModel):
    """代码问题"""
    line: int = Field(..., ge=1, description="行号")
    issue_type: str = Field(..., description="问题类型")
    description: str = Field(..., description="问题描述")
    suggestion: Optional[str] = Field(None, description="修复建议")
    severity: str = Field(..., pattern="^(low|medium|high|critical)$", description="严重程度")


class CodeAnalysisResult(BaseModel):
    """代码分析结果"""
    code: str = Field(..., description="原始代码")
    language: CodeLanguage = Field(..., description="编程语言")
    issues: List[CodeIssue] = Field(default_factory=list, description="问题列表")
    quality_score: float = Field(..., ge=0, le=10, description="质量评分 0-10")
    summary: str = Field(..., description="分析摘要")
    suggestions: List[str] = Field(default_factory=list, description="改进建议")


# ==================== 统一响应 ====================

class AnalysisType(str, Enum):
    """分析类型"""
    SENTIMENT = "sentiment"
    ENTITY = "entity"
    CLASSIFICATION = "classification"
    CODE_ANALYSIS = "code_analysis"


class AnalysisResponse(BaseModel):
    """统一分析响应"""
    analysis_type: AnalysisType = Field(..., description="分析类型")
    result: Dict[str, Any] = Field(..., description="分析结果")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="元数据")
    timestamp: datetime = Field(default_factory=datetime.now, description="时间戳")


# ==================== Schema 生成 ====================

def get_schema_for_type(analysis_type: AnalysisType) -> type:
    """根据分析类型获取对应的 Schema"""
    schema_map = {
        AnalysisType.SENTIMENT: SentimentResult,
        AnalysisType.ENTITY: EntityExtractionResult,
        AnalysisType.CLASSIFICATION: ClassificationResult,
    }
    return schema_map.get(analysis_type)


def generate_json_schema(analysis_type: AnalysisType) -> dict:
    """生成 JSON Schema"""
    schema_class = get_schema_for_type(analysis_type)
    if schema_class:
        return schema_class.model_json_schema()
    return {}


# 使用示例
if __name__ == "__main__":
    import json
    
    # 生成所有 Schema
    for analysis_type in AnalysisType:
        if analysis_type != AnalysisType.CODE_ANALYSIS:
            schema = generate_json_schema(analysis_type)
            print(f"\n{analysis_type.value} Schema:")
            print(json.dumps(schema, indent=2, ensure_ascii=False))
```

---

## 第三部分：结构化输出服务

### 文件：app/services/structured_output.py

```python
"""
结构化输出服务
"""

from typing import Optional, Dict, Any, Type
from pydantic import BaseModel
import json
import re

from app.schemas.llm import (
    SentimentResult,
    SentimentType,
    EntityExtractionResult,
    Entity,
    EntityType,
    ClassificationResult,
    TextCategory,
    AnalysisType,
    get_schema_for_type
)


class StructuredOutputService:
    """结构化输出服务"""
    
    def __init__(self):
        # LLM 提示模板
        self.prompts = {
            AnalysisType.SENTIMENT: """请分析以下文本的情感，并以 JSON 格式输出结果。

文本：{text}

请严格按照以下 JSON 格式输出：
{{
    "text": "原始文本",
    "sentiment": "positive/negative/neutral/mixed",
    "confidence": 0.0-1.0,
    "keywords": ["关键词1", "关键词2"],
    "reason": "分析原因"
}}""",
            
            AnalysisType.ENTITY: """请从以下文本中提取实体，并以 JSON 格式输出结果。

文本：{text}

请严格按照以下 JSON 格式输出：
{{
    "text": "原始文本",
    "entities": [
        {{
            "text": "实体文本",
            "entity_type": "PERSON/ORG/LOC/DATE/MONEY/TECH",
            "start_pos": 0,
            "end_pos": 10,
            "confidence": 0.0-1.0
        }}
    ],
    "entity_count": 实体数量
}}""",
            
            AnalysisType.CLASSIFICATION: """请对以下文本进行分类，并以 JSON 格式输出结果。

文本：{text}

请严格按照以下 JSON 格式输出：
{{
    "text": "原始文本",
    "category": "技术/科学/商业/娱乐/体育/政治/其他",
    "subcategory": "子分类（可选）",
    "confidence": 0.0-1.0,
    "tags": ["标签1", "标签2"]
}}"""
        }
    
    def get_prompt(self, analysis_type: AnalysisType, text: str) -> str:
        """获取提示"""
        template = self.prompts.get(analysis_type)
        if not template:
            raise ValueError(f"不支持的分析类型: {analysis_type}")
        return template.format(text=text)
    
    def validate_output(
        self, 
        output: dict, 
        analysis_type: AnalysisType
    ) -> Optional[BaseModel]:
        """验证输出"""
        schema_class = get_schema_for_type(analysis_type)
        if not schema_class:
            return None
        
        try:
            return schema_class(**output)
        except Exception as e:
            print(f"验证失败: {e}")
            return None
    
    def parse_json_response(self, response: str) -> Optional[dict]:
        """解析 JSON 响应"""
        try:
            # 尝试直接解析
            return json.loads(response)
        except json.JSONDecodeError:
            pass
        
        # 尝试从文本中提取 JSON
        json_pattern = r'\{[\s\S]*\}'
        match = re.search(json_pattern, response)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        
        return None
    
    async def analyze_text(
        self, 
        text: str, 
        analysis_type: AnalysisType,
        llm_call=None
    ) -> Dict[str, Any]:
        """
        分析文本并返回结构化结果
        
        Args:
            text: 输入文本
            analysis_type: 分析类型
            llm_call: LLM 调用函数（可选）
        
        Returns:
            结构化结果
        """
        # 获取提示
        prompt = self.get_prompt(analysis_type, text)
        
        # 调用 LLM（如果提供了）
        if llm_call:
            response = await llm_call(prompt)
        else:
            # 模拟 LLM 响应
            response = self._mock_llm_response(text, analysis_type)
        
        # 解析响应
        output = self.parse_json_response(response)
        if not output:
            return {
                "error": "无法解析 LLM 响应",
                "raw_response": response
            }
        
        # 验证输出
        validated = self.validate_output(output, analysis_type)
        if not validated:
            return {
                "error": "输出验证失败",
                "raw_output": output
            }
        
        return {
            "success": True,
            "data": validated.model_dump(),
            "analysis_type": analysis_type.value
        }
    
    def _mock_llm_response(self, text: str, analysis_type: AnalysisType) -> str:
        """模拟 LLM 响应"""
        if analysis_type == AnalysisType.SENTIMENT:
            # 简单的情感分析
            positive_words = ["好", "喜欢", "满意", "优秀", "棒", "赞"]
            negative_words = ["差", "讨厌", "失望", "糟糕", "坏"]
            
            pos_count = sum(1 for word in positive_words if word in text)
            neg_count = sum(1 for word in negative_words if word in text)
            
            if pos_count > neg_count:
                sentiment = "positive"
                confidence = min(0.9, 0.5 + pos_count * 0.1)
            elif neg_count > pos_count:
                sentiment = "negative"
                confidence = min(0.9, 0.5 + neg_count * 0.1)
            else:
                sentiment = "neutral"
                confidence = 0.6
            
            result = {
                "text": text,
                "sentiment": sentiment,
                "confidence": confidence,
                "keywords": [w for w in positive_words + negative_words if w in text],
                "reason": f"基于关键词分析"
            }
        
        elif analysis_type == AnalysisType.CLASSIFICATION:
            # 简单的分类
            tech_words = ["编程", "代码", "软件", "AI", "算法"]
            science_words = ["科学", "研究", "实验", "理论"]
            
            if any(word in text for word in tech_words):
                category = "技术"
                confidence = 0.8
            elif any(word in text for word in science_words):
                category = "科学"
                confidence = 0.7
            else:
                category = "其他"
                confidence = 0.5
            
            result = {
                "text": text,
                "category": category,
                "confidence": confidence,
                "tags": []
            }
        
        else:
            result = {"text": text, "error": "模拟响应不支持此类型"}
        
        return json.dumps(result, ensure_ascii=False)


# 创建服务实例
structured_output_service = StructuredOutputService()
```

---

## 第四部分：FastAPI 集成

### 文件：app/api/analysis.py

```python
"""
分析 API 路由
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.schemas.llm import AnalysisType, AnalysisResponse
from app.services.structured_output import structured_output_service

router = APIRouter(prefix="/analysis", tags=["分析"])


# ==================== 请求模型 ====================

class AnalyzeRequest(BaseModel):
    """分析请求"""
    text: str = Field(..., min_length=1, max_length=10000, description="输入文本")
    analysis_type: AnalysisType = Field(..., description="分析类型")


class BatchAnalyzeRequest(BaseModel):
    """批量分析请求"""
    texts: List[str] = Field(..., min_length=1, max_length=100, description="文本列表")
    analysis_type: AnalysisType = Field(..., description="分析类型")


# ==================== 端点 ====================

@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    summary="分析文本"
)
async def analyze_text(request: AnalyzeRequest):
    """分析文本并返回结构化结果"""
    result = await structured_output_service.analyze_text(
        text=request.text,
        analysis_type=request.analysis_type
    )
    
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result["error"]
        )
    
    return AnalysisResponse(
        analysis_type=request.analysis_type,
        result=result["data"],
        metadata={
            "model": "mock",
            "processing_time": 0.1
        }
    )


@router.post(
    "/batch-analyze",
    summary="批量分析"
)
async def batch_analyze(request: BatchAnalyzeRequest):
    """批量分析文本"""
    results = []
    
    for text in request.texts:
        result = await structured_output_service.analyze_text(
            text=text,
            analysis_type=request.analysis_type
        )
        results.append(result)
    
    return {
        "results": results,
        "count": len(results),
        "success_count": sum(1 for r in results if r.get("success"))
    }


@router.get(
    "/schema/{analysis_type}",
    summary="获取 Schema"
)
async def get_schema(analysis_type: AnalysisType):
    """获取分析结果的 JSON Schema"""
    from app.schemas.llm import generate_json_schema
    
    schema = generate_json_schema(analysis_type)
    return schema


@router.get(
    "/prompt/{analysis_type}",
    summary="获取提示模板"
)
async def get_prompt_template(analysis_type: AnalysisType):
    """获取分析的提示模板"""
    from app.schemas.llm import SentimentResult, EntityExtractionResult, ClassificationResult
    
    # 示例文本
    example_text = "这是一个示例文本"
    
    # 获取提示
    prompt = structured_output_service.get_prompt(analysis_type, example_text)
    
    return {
        "analysis_type": analysis_type.value,
        "prompt_template": structured_output_service.prompts.get(analysis_type, ""),
        "example_prompt": prompt
    }


# ==================== 演示端点 ====================

@router.post(
    "/demo",
    summary="演示结构化输出"
)
async def demo_structured_output():
    """演示结构化输出功能"""
    demos = []
    
    # 情感分析演示
    sentiment_result = await structured_output_service.analyze_text(
        text="这个产品非常好用，我很满意！",
        analysis_type=AnalysisType.SENTIMENT
    )
    demos.append({
        "type": "sentiment",
        "input": "这个产品非常好用，我很满意！",
        "output": sentiment_result
    })
    
    # 分类演示
    classification_result = await structured_output_service.analyze_text(
        text="Python 是一种流行的编程语言，广泛用于 AI 开发",
        analysis_type=AnalysisType.CLASSIFICATION
    )
    demos.append({
        "type": "classification",
        "input": "Python 是一种流行的编程语言，广泛用于 AI 开发",
        "output": classification_result
    })
    
    return {
        "demos": demos,
        "description": "结构化输出演示"
    }
```

---

## 第五部分：测试结构化输出

### 测试脚本

```bash
#!/bin/bash
# test_structured_output.sh

BASE_URL="http://localhost:8000/api/v1/analysis"

echo "=== 1. 情感分析 ==="
curl -X POST "$BASE_URL/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "这个产品非常好用，我很满意！",
    "analysis_type": "sentiment"
  }' | jq .

echo -e "\n=== 2. 文本分类 ==="
curl -X POST "$BASE_URL/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Python 是一种流行的编程语言，广泛用于 AI 开发",
    "analysis_type": "classification"
  }' | jq .

echo -e "\n=== 3. 获取 Schema ==="
curl "$BASE_URL/schema/sentiment" | jq .

echo -e "\n=== 4. 获取提示模板 ==="
curl "$BASE_URL/prompt/sentiment" | jq .

echo -e "\n=== 5. 演示模式 ==="
curl -X POST "$BASE_URL/demo" | jq .
```

---

## 第六部分：最佳实践

### 输出验证策略

```python
"""
输出验证最佳实践
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
import json


class RobustSentimentResult(BaseModel):
    """健壮的情感分析结果"""
    
    text: str = Field(..., description="原始文本")
    sentiment: str = Field(..., description="情感类型")
    confidence: float = Field(..., ge=0, le=1, description="置信度")
    keywords: list[str] = Field(default_factory=list, description="关键词")
    
    @field_validator('sentiment')
    @classmethod
    def validate_sentiment(cls, v: str) -> str:
        """验证情感类型"""
        valid_sentiments = ['positive', 'negative', 'neutral', 'mixed']
        v_lower = v.lower()
        
        if v_lower in valid_sentiments:
            return v_lower
        
        # 尝试映射
        sentiment_map = {
            '积极': 'positive',
            '正面': 'positive',
            '好': 'positive',
            '消极': 'negative',
            '负面': 'negative',
            '坏': 'negative',
            '中性': 'neutral',
        }
        
        return sentiment_map.get(v_lower, 'neutral')
    
    @field_validator('confidence')
    @classmethod
    def validate_confidence(cls, v: float) -> float:
        """验证置信度"""
        # 如果置信度异常，进行修正
        if v < 0:
            return 0.0
        if v > 1:
            return 1.0
        return v


def validate_llm_output(output: str, schema: type) -> dict:
    """
    验证 LLM 输出
    
    策略：
    1. 尝试直接解析
    2. 从文本中提取 JSON
    3. 使用 Pydantic 验证
    4. 处理异常情况
    """
    # 1. 尝试直接解析
    try:
        data = json.loads(output)
    except json.JSONDecodeError:
        # 2. 从文本中提取 JSON
        import re
        json_match = re.search(r'\{[\s\S]*\}', output)
        if json_match:
            try:
                data = json.loads(json_match.group())
            except json.JSONDecodeError:
                return {"error": "无法解析 JSON", "raw": output}
        else:
            return {"error": "未找到 JSON", "raw": output}
    
    # 3. 使用 Pydantic 验证
    try:
        validated = schema(**data)
        return {"success": True, "data": validated.model_dump()}
    except Exception as e:
        return {"error": f"验证失败: {e}", "data": data}
```

---

## 验证清单

完成今日学习后，检查以下项目：

- [ ] 理解结构化输出的重要性
- [ ] 能定义 Pydantic Schema
- [ ] 实现了输出验证
- [ ] 创建了分析 API
- [ ] 测试了情感分析
- [ ] 测试了文本分类
- [ ] 理解了 JSON 解析技巧
- [ ] 完成了最佳实践练习

---

## 今日小结

| 概念 | 关键点 |
|------|--------|
| 结构化输出 | LLM 按固定格式输出 |
| JSON Mode | 强制输出有效 JSON |
| Pydantic Schema | 数据验证和序列化 |
| 输出验证 | 确保 LLM 输出符合预期 |
| 错误处理 | 优雅地处理解析失败 |
| 提示工程 | 引导 LLM 输出正确格式 |

---

## 明日预告

明天我们将学习：
- "When NOT to build agents" 判断框架
- Agent 适用性分析
- 替代方案选择
- 案例分析

---

## 参考资源

- [Pydantic 文档](https://docs.pydantic.dev/)
- [JSON Schema](https://json-schema.org/)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
