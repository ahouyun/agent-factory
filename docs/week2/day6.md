# 📅 Week 2 Day 6：结构化输出：JSON Mode + Pydantic Schema

## 🧭 今日方向
> 今天我们将学习如何让大模型输出结构化数据，使用 JSON Mode 和 Pydantic Schema 确保输出格式正确。

## 🎯 生活比喻
> 如果说大模型是一个自由发挥的作家，那么 JSON Mode 和 Pydantic Schema 就是写作大纲和格式要求，确保输出符合预期。

## 📋 今日三件事
1. 理解结构化输出的重要性
2. 学习 JSON Mode 的使用方法
3. 掌握 Pydantic Schema 的定义和验证

## 🗺️ 手把手路线

### Step 1: 结构化输出基础
- **做什么**: 理解为什么需要结构化输出
- **为什么**: Agent 需要可靠的格式化数据来执行操作
- **成功标志**: 能解释结构化输出的优势

### Step 2: JSON Mode
- **做什么**: 学习使用 OpenAI/Anthropic 的 JSON Mode
- **为什么**: JSON Mode 确保模型输出有效的 JSON
- **成功标志**: 能配置和使用 JSON Mode

### Step 3: Pydantic Schema
- **做什么**: 使用 Pydantic 定义输出模式并验证
- **为什么**: Pydantic 提供强大的数据验证能力
- **成功标志**: 能定义复杂的输出模式

## 💻 代码区

```python
# 结构化输出基础

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# 1. 定义输出模式
class SentimentType(str, Enum):
    """情感类型"""
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class SentimentResult(BaseModel):
    """情感分析结果"""
    text: str = Field(..., description="原始文本")
    sentiment: SentimentType = Field(..., description="情感类型")
    confidence: float = Field(..., ge=0, le=1, description="置信度")
    keywords: List[str] = Field(default_factory=list, description="关键词")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "这个产品非常好用",
                "sentiment": "positive",
                "confidence": 0.95,
                "keywords": ["产品", "好用"]
            }
        }

class EntityInfo(BaseModel):
    """实体信息"""
    name: str = Field(..., description="实体名称")
    entity_type: str = Field(..., description="实体类型")
    start_pos: int = Field(..., description="开始位置")
    end_pos: int = Field(..., description="结束位置")

class TextAnalysisResult(BaseModel):
    """文本分析结果"""
    original_text: str = Field(..., description="原始文本")
    sentiment: SentimentResult = Field(..., description="情感分析")
    entities: List[EntityInfo] = Field(default_factory=list, description="实体列表")
    summary: str = Field(..., description="文本摘要")
    language: str = Field(default="zh", description="语言")

# 2. 使用示例
def create_sample_result():
    """创建示例结果"""
    result = TextAnalysisResult(
        original_text="张三在北京的公司工作，他觉得Python很好用。",
        sentiment=SentimentResult(
            text="张三在北京的公司工作，他觉得Python很好用。",
            sentiment=SentimentType.POSITIVE,
            confidence=0.9,
            keywords=["Python", "好用"]
        ),
        entities=[
            EntityInfo(name="张三", entity_type="PERSON", start_pos=0, end_pos=2),
            EntityInfo(name="北京", entity_type="LOCATION", start_pos=3, end_pos=5),
            EntityInfo(name="Python", entity_type="TECHNOLOGY", start_pos=15, end_pos=21)
        ],
        summary="张三在北京工作，对Python评价积极。",
        language="zh"
    )
    return result

if __name__ == "__main__":
    result = create_sample_result()
    print("结构化输出示例:")
    print(result.model_dump_json(indent=2))
```

```python
# JSON Mode 使用示例

import json
from pydantic import BaseModel, Field
from typing import List, Optional

# 1. OpenAI JSON Mode 示例
openai_json_mode_example = """
# OpenAI JSON Mode 使用方法

import openai

# 方法 1: 使用 response_format
response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo-1106",
    messages=[
        {"role": "system", "content": "你是一个数据分析助手。请以 JSON 格式输出结果。"},
        {"role": "user", "content": "分析以下销售数据：1月100万，2月150万，3月120万"}
    ],
    response_format={"type": "json_object"}  # 启用 JSON Mode
)

# 解析响应
data = json.loads(response.choices[0].message.content)
print(data)

# 方法 2: 使用函数调用
functions = [
    {
        "name": "analyze_sales_data",
        "description": "分析销售数据",
        "parameters": {
            "type": "object",
            "properties": {
                "monthly_data": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "month": {"type": "string"},
                            "amount": {"type": "number"}
                        }
                    }
                },
                "total": {"type": "number"},
                "average": {"type": "number"},
                "trend": {"type": "string", "enum": ["increasing", "decreasing", "stable"]}
            },
            "required": ["monthly_data", "total", "average", "trend"]
        }
    }
]

response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo-0613",
    messages=[
        {"role": "user", "content": "分析销售数据：1月100万，2月150万，3月120万"}
    ],
    functions=functions,
    function_call="auto"
)
"""

# 2. Anthropic 结构化输出示例
anthropic_structured_output_example = """
# Anthropic 结构化输出方法

import anthropic
import json

client = anthropic.Anthropic()

# 方法 1: 在提示中明确要求 JSON 格式
response = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": \"\"\"
请分析以下文本，并以 JSON 格式输出结果：

文本：这个产品非常好用，但价格有点贵。

请输出以下格式的 JSON：
{
    "sentiment": "positive/negative/neutral",
    "confidence": 0.0-1.0,
    "aspects": [
        {"aspect": "方面", "sentiment": "positive/negative", "text": "相关文本"}
    ]
}
\"\"\"}
    ]
)

# 解析响应
result = json.loads(response.content[0].text)
print(result)
"""

# 3. Pydantic Schema 生成
class SalesAnalysis(BaseModel):
    """销售数据分析结果"""
    monthly_data: List[dict] = Field(..., description="月度数据")
    total: float = Field(..., description="总销售额")
    average: float = Field(..., description="平均销售额")
    trend: str = Field(..., pattern="^(increasing|decreasing|stable)$", description="趋势")
    growth_rate: Optional[float] = Field(None, description="增长率")
    
    class Config:
        json_schema_extra = {
            "example": {
                "monthly_data": [
                    {"month": "1月", "amount": 100},
                    {"month": "2月", "amount": 150},
                    {"month": "3月", "amount": 120}
                ],
                "total": 370,
                "average": 123.33,
                "trend": "increasing",
                "growth_rate": 0.2
            }
        }

# 生成 JSON Schema
def generate_schema():
    """生成 Pydantic 模型的 JSON Schema"""
    schema = SalesAnalysis.model_json_schema()
    print("JSON Schema:")
    print(json.dumps(schema, indent=2, ensure_ascii=False))
    return schema

if __name__ == "__main__":
    # 生成 Schema
    schema = generate_schema()
    
    # 使用 Schema 验证数据
    sample_data = {
        "monthly_data": [
            {"month": "1月", "amount": 100},
            {"month": "2月", "amount": 150},
            {"month": "3月", "amount": 120}
        ],
        "total": 370,
        "average": 123.33,
        "trend": "increasing"
    }
    
    validated = SalesAnalysis(**sample_data)
    print("\n验证后的数据:")
    print(validated.model_dump_json(indent=2))
```

```python
# 完整的结构化输出服务

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from enum import Enum
import json
import asyncio

app = FastAPI(title="结构化输出服务")

# 1. 定义各种输出模式
class AnalysisType(str, Enum):
    """分析类型"""
    SENTIMENT = "sentiment"
    ENTITY = "entity"
    SUMMARY = "summary"
    CLASSIFICATION = "classification"

class SentimentAnalysis(BaseModel):
    """情感分析结果"""
    text: str
    sentiment: str = Field(..., pattern="^(positive|negative|neutral)$")
    confidence: float = Field(..., ge=0, le=1)
    keywords: List[str] = Field(default_factory=list)

class EntityExtraction(BaseModel):
    """实体抽取结果"""
    text: str
    entities: List[Dict[str, Any]] = Field(default_factory=list)
    relations: List[Dict[str, Any]] = Field(default_factory=list)

class TextClassification(BaseModel):
    """文本分类结果"""
    text: str
    category: str
    subcategory: Optional[str] = None
    confidence: float = Field(..., ge=0, le=1)
    labels: List[str] = Field(default_factory=list)

class AnalysisResult(BaseModel):
    """统一分析结果"""
    analysis_type: AnalysisType
    result: Dict[str, Any]
    metadata: Dict[str, Any] = Field(default_factory=dict)

# 2. 模拟大模型调用
async def call_llm_with_structured_output(
    text: str,
    output_schema: BaseModel,
    instructions: str = ""
) -> Dict[str, Any]:
    """
    模拟调用大模型获取结构化输出
    
    实际应用中会调用真实的 API
    """
    # 模拟响应
    if "情感" in instructions or "sentiment" in instructions.lower():
        return {
            "text": text,
            "sentiment": "positive",
            "confidence": 0.9,
            "keywords": ["好", "喜欢"]
        }
    elif "实体" in instructions or "entity" in instructions.lower():
        return {
            "text": text,
            "entities": [
                {"name": "张三", "type": "PERSON"},
                {"name": "北京", "type": "LOCATION"}
            ],
            "relations": []
        }
    else:
        return {
            "text": text,
            "category": "其他",
            "confidence": 0.8,
            "labels": ["未分类"]
        }

# 3. API 端点
@app.post("/api/v1/analyze", response_model=AnalysisResult)
async def analyze_text(
    text: str,
    analysis_type: AnalysisType,
    instructions: str = ""
):
    """分析文本并返回结构化结果"""
    
    # 根据分析类型选择输出模式
    schema_map = {
        AnalysisType.SENTIMENT: SentimentAnalysis,
        AnalysisType.ENTITY: EntityExtraction,
        AnalysisType.CLASSIFICATION: TextClassification,
    }
    
    output_schema = schema_map.get(analysis_type)
    if not output_schema:
        raise HTTPException(status_code=400, detail="不支持的分析类型")
    
    # 调用大模型
    raw_result = await call_llm_with_structured_output(
        text=text,
        output_schema=output_schema,
        instructions=instructions
    )
    
    # 验证和转换结果
    try:
        validated_result = output_schema(**raw_result)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"结果验证失败: {str(e)}"
        )
    
    # 构建统一结果
    result = AnalysisResult(
        analysis_type=analysis_type,
        result=validated_result.model_dump(),
        metadata={
            "model": "gpt-3.5-turbo",
            "processing_time": 0.5
        }
    )
    
    return result

@app.post("/api/v1/batch-analyze")
async def batch_analyze(
    texts: List[str],
    analysis_type: AnalysisType
):
    """批量分析文本"""
    results = []
    
    for text in texts:
        result = await analyze_text(
            text=text,
            analysis_type=analysis_type
        )
        results.append(result)
    
    return {"results": results, "count": len(results)}

@app.get("/api/v1/schema/{analysis_type}")
async def get_schema(analysis_type: AnalysisType):
    """获取分析结果的 JSON Schema"""
    schema_map = {
        AnalysisType.SENTIMENT: SentimentAnalysis,
        AnalysisType.ENTITY: EntityExtraction,
        AnalysisType.CLASSIFICATION: TextClassification,
    }
    
    schema = schema_map[analysis_type].model_json_schema()
    return schema

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | JSON 解析失败 | 检查模型输出格式，确保是有效 JSON |
| 2 | 验证错误 | 检查字段类型和约束条件 |
| 3 | Schema 生成失败 | 确保 Pydantic 模型定义正确 |
| 4 | 模型不支持 JSON Mode | 使用提示工程引导输出格式 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| 结构化输出 | 按预定格式输出的数据 |
| JSON Mode | 强制模型输出有效 JSON 的模式 |
| Pydantic Schema | 数据模型的 JSON Schema 描述 |
| 字段验证 | 检查字段值是否符合约束 |
| 模型验证 | 检查整个数据对象是否有效 |
| 类型安全 | 确保数据类型正确的机制 |

## ✅ 验收清单
- [ ] 理解结构化输出的重要性
- [ ] 能使用 JSON Mode 获取结构化输出
- [ ] 能定义和使用 Pydantic Schema
- [ ] 能验证和转换结构化数据

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
