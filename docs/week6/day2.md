# 📅 Week 6 Day 2：LangChain 核心概念

## 🧭 今日方向
> 掌握 LangChain 的四大核心模块（Model、Prompt、Chain、OutputParser），学习 LCEL 表达式语言的管道式编程，并构建一个完整的 RAG 链。LangChain 是构建 LLM 应用最流行的框架，理解它是后续学习 Agent 框架的基础。

## 🎯 生活比喻
> LangChain 就像一条流水线工厂。原材料（用户输入）经过不同的工位（Model → Prompt → Chain → OutputParser），每个工位负责一道工序，最终产出成品（高质量回答）。LCEL 就是把这些工位用传送带（`|` 管道符）串起来的自动化系统——你只需要定义好每个工位的职责，传送带会自动把半成品传给下一个工位。

## 📋 今日三件事
1. 理解 LangChain 架构和四大核心模块的职责
2. 掌握 LCEL（LangChain Expression Language）管道语法和核心 Runnable 组件
3. 实现一个完整的 RAG 链（文档加载 → 切分 → 向量化 → 检索 → 生成）

## 🗺️ 手把手路线

### Step 1：认识四大核心模块
- **做什么**: 了解 Model、Prompt、Chain、OutputParser 各自的职责和输入输出
- **为什么**: 这是 LangChain 的骨架，不理解就无法组合使用
- **成功标志**: 能解释每个模块的输入和输出分别是什么，能画出模块关系图

### Step 2：掌握 LCEL 管道语法
- **做什么**: 学习用 `|` 连接 Runnable 组件，使用 RunnablePassthrough、RunnableLambda、RunnableParallel
- **为什么**: LCEL 是 LangChain 推荐的编程范式，比旧版 Chain 更灵活、更强大
- **成功标志**: 能用 LCEL 组合出 3 步以上的处理链

### Step 3：实现完整的 RAG 链
- **做什么**: 把文档加载、切分、向量化、检索、生成串成一条可运行的链
- **为什么**: RAG 是 LLM 应用最核心的模式之一，几乎所有知识问答类应用都依赖它
- **成功标志**: 输入一个问题，从文档中检索相关内容并生成准确回答

## 💻 代码区

### 示例 1：四大核心模块演示

```python
"""
LangChain 四大核心模块演示
Model → Prompt → Chain → OutputParser

安装依赖: pip install langchain langchain-openai
设置环境变量: export OPENAI_API_KEY="your-key-here"
"""
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_core.messages import HumanMessage, SystemMessage

# ========== 1. Model 模块 ==========
# Model 负责与 LLM API 交互，是 LangChain 的核心组件
llm = ChatOpenAI(
    model="gpt-4o-mini",          # 选择模型（推荐 gpt-4o-mini 性价比高）
    temperature=0.7,                # 创造性程度（0=确定性，1=最随机）
    max_tokens=200                  # 最大输出长度
)

# 最简单的调用方式
response = llm.invoke([
    SystemMessage(content="你是一个有帮助的编程助手"),
    HumanMessage(content="用一句话解释什么是 LangChain")
])
print(f"[Model 直接调用] {response.content}")


# ========== 2. Prompt 模块 ==========
# Prompt 负责构建提示词模板，支持变量替换
# ChatPromptTemplate 是最常用的消息模板
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个{role}，请用{style}的风格回答问题"),
    ("human", "{question}")
])

# 格式化提示词（生成实际发送给 LLM 的消息）
formatted = prompt.invoke({
    "role": "编程老师",
    "style": "通俗易懂",
    "question": "什么是变量？"
})
print(f"\n[Prompt 模板] 系统消息: {formatted.messages[0].content}")
print(f"[Prompt 模板] 用户消息: {formatted.messages[1].content}")


# ========== 3. OutputParser 模块 ==========
# OutputParser 负责将 LLM 的原始输出解析为结构化数据

# StrOutputParser: 最简单，直接提取字符串
str_parser = StrOutputParser()

# JsonOutputParser: 解析 JSON 格式输出
json_parser = JsonOutputParser()

# 演示：用 StrOutputParser 解析 LLM 输出
chain_for_parse = prompt | llm | str_parser
result = chain_for_parse.invoke({
    "role": "编程老师",
    "style": "简洁",
    "question": "什么是递归？"
})
print(f"\n[StrOutputParser 结果] {result}")
print(f"[输出类型] {type(result)}")  # str


# ========== 4. Chain 组合 ==========
# 用管道符 | 把模块串起来（LCEL 语法）
# 顺序：Prompt → LLM → OutputParser
chain = prompt | llm | str_parser

# 执行链
result = chain.invoke({
    "role": "编程老师",
    "style": "幽默风趣",
    "question": "什么是递归？"
})
print(f"\n[Chain 执行结果] {result}")
```

**预期输出（示例）：**
```
[Model 直接调用] LangChain 是一个用于构建 LLM 应用的开发框架。

[Prompt 模板] 系统消息: 你是一个编程老师，请用通俗易懂的风格回答问题
[Prompt 模板] 用户消息: 什么是变量？

[StrOutputParser 结果] 递归就像俄罗斯套娃——你打开一个盒子，里面还有一个盒子，直到最里面没有盒子为止。
[输出类型] <class 'str'>

[Chain 执行结果] 递归就是函数调用自己，就像你问朋友"什么是递归"，朋友说"看看上面那句话"。
```

### 示例 2：LCEL 管道语法详解

```python
"""
LCEL（LangChain Expression Language）详解
核心：用 | 管道符连接 Runnable 组件

LCEL 的关键组件：
- RunnablePassthrough: 直通，原样传递输入
- RunnableLambda: 将普通函数包装成 Runnable
- RunnableParallel: 并行执行多个 Runnable
"""
from langchain_core.runnables import (
    RunnablePassthrough,
    RunnableLambda,
    RunnableParallel
)
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# ========== 1. RunnablePassthrough: 直通组件 ==========
# 将输入原样传递给下一个组件，不做任何修改
passthrough = RunnablePassthrough()

result = passthrough.invoke("直接透传这个字符串")
print(f"[Passthrough] {result}")
# 输出: 直接透传这个字符串


# ========== 2. RunnableLambda: 函数组件 ==========
# 将普通 Python 函数包装成 Runnable，可以接入管道
def word_count(text: str) -> dict:
    """统计字数并返回"""
    return {
        "text": text,
        "char_count": len(text),
        "is_long": len(text) > 50
    }

count_chain = RunnableLambda(word_count)
result = count_chain.invoke("这是一段测试文本，用来演示 RunnableLambda 的用法")
print(f"[Lambda] {result}")
# 输出: {'text': '...', 'char_count': 24, 'is_long': False}


# ========== 3. RunnableParallel: 并行组件 ==========
# 同时执行多个 Runnable，返回字典结果
# 适合需要同时获取多种输出的场景
parallel = RunnableParallel(
    # 分支1：翻译成英文（需要 LLM）
    english=(
        ChatPromptTemplate.from_template("将以下中文翻译成英文: {text}")
        | llm
        | StrOutputParser()
    ),
    # 分支2：统计字数（不需要 LLM）
    stats=RunnableLambda(lambda x: {
        "char_count": len(x["text"]),
        "word_count": len(x["text"].split())
    })
)

result = parallel.invoke({"text": "人工智能正在改变世界"})
print(f"\n[Parallel 结果]")
print(f"  英文翻译: {result['english']}")
print(f"  字数统计: {result['stats']}")


# ========== 4. 管道组合实战: 多步骤处理链 ==========
# 组合一个"输入 → 润色 → 翻译 → 统计"的链

# 第一步：润色
polish_prompt = ChatPromptTemplate.from_template(
    "请润色以下文本，使其更加通顺流畅：\n{text}"
)

# 第二步：翻译
translate_prompt = ChatPromptTemplate.from_template(
    "将以下文本翻译成英文：\n{text}"
)

# 完整管道
full_chain = (
    RunnablePassthrough.assign(
        polished=polish_prompt | llm | StrOutputParser()
    )
    | RunnablePassthrough.assign(
        translated=lambda x: (
            translate_prompt | llm | StrOutputParser()
        ).invoke({"text": x["polished"]})
    )
    | RunnablePassthrough.assign(
        stats=lambda x: {
            "original_len": len(x["text"]),
            "polished_len": len(x["polished"]),
            "translated_len": len(x["translated"])
        }
    )
)

result = full_chain.invoke({"text": "这个东西很好用，推荐大家购买"})
print(f"\n[多步骤链结果]")
print(f"  原文: {result['text']}")
print(f"  润色: {result['polished']}")
print(f"  翻译: {result['translated']}")
print(f"  统计: {result['stats']}")
```

**预期输出（示例）：**
```
[Passthrough] 直接透传这个字符串
[Lambda] {'text': '这是一段测试文本...', 'char_count': 24, 'is_long': False}

[Parallel 结果]
  英文翻译: Artificial intelligence is changing the world.
  字数统计: {'char_count': 9, 'word_count': 1}

[多步骤链结果]
  原文: 这个东西很好用，推荐大家购买
  润色: 这款产品非常实用，强烈推荐大家选购。
  翻译: This product is very practical and highly recommended for purchase.
  统计: {'original_len': 13, 'polished_len': 17, 'translated_len': 57}
```

### 示例 3：完整的 RAG 链

```python
"""
完整的 RAG（检索增强生成）链
流程：文档加载 → 切分 → 向量化 → 存储 → 检索 → 生成

RAG 的核心思想：先检索相关文档，再让 LLM 基于文档回答
这样可以避免 LLM "幻觉"，确保回答有据可依
"""
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

# ========== 第一步：准备文档 ==========
# 模拟一些知识文档（实际项目中从文件加载）
documents = [
    Document(
        page_content="Python 是一种高级编程语言，由 Guido van Rossum 于 1991 年创建。Python 以其简洁的语法和强大的库生态系统而闻名，广泛应用于 Web 开发、数据分析、人工智能等领域。",
        metadata={"source": "python_intro.txt", "topic": "Python"}
    ),
    Document(
        page_content="机器学习是人工智能的一个子领域，它使计算机能够从数据中学习而不需要显式编程。常见的机器学习算法包括线性回归、决策树、随机森林、支持向量机和神经网络。",
        metadata={"source": "ml_basics.txt", "topic": "机器学习"}
    ),
    Document(
        page_content="LangChain 是一个用于构建大语言模型应用的开源框架。它提供了模型集成、提示词管理、链式调用、检索增强生成（RAG）、Agent 等核心功能。",
        metadata={"source": "langchain_intro.txt", "topic": "LangChain"}
    ),
    Document(
        page_content="向量数据库用于存储和检索高维向量数据。常见的向量数据库包括 Pinecone、Weaviate、ChromaDB 和 Milvus。向量数据库是 RAG 系统的核心组件，负责存储文档的向量表示并支持相似度检索。",
        metadata={"source": "vector_db.txt", "topic": "向量数据库"}
    ),
    Document(
        page_content="Transformer 是一种基于自注意力机制的深度学习架构，由 Google 于 2017 年在论文《Attention Is All You Need》中提出。GPT、BERT、LLaMA 等大语言模型都基于 Transformer 架构。",
        metadata={"source": "transformer.txt", "topic": "Transformer"}
    )
]

print(f"[第一步] 加载文档: 共 {len(documents)} 篇")


# ========== 第二步：文档切分 ==========
# 长文档需要切分成小块，才能有效向量化和检索
splitter = RecursiveCharacterTextSplitter(
    chunk_size=200,       # 每块最大 200 字符
    chunk_overlap=50,     # 块之间重叠 50 字符（保持上下文连贯）
    length_function=len,
    separators=["\n\n", "\n", "。", "！", "？", "，", " "]
)

splits = splitter.split_documents(documents)
print(f"[第二步] 切分文档: {len(documents)} 篇 → {len(splits)} 块")


# ========== 第三步：向量化并存储 ==========
# 使用 OpenAI Embeddings 将文本转换为向量
# InMemoryVectorStore 适合开发测试，生产环境用 ChromaDB/Pinecone
embeddings = OpenAIEmbeddings()
vectorstore = InMemoryVectorStore.from_documents(
    documents=splits,
    embedding=embeddings
)
print(f"[第三步] 向量存储: 已存储 {vectorstore.index.ntotal} 个向量")


# ========== 第四步：创建检索器 ==========
# 检索器负责根据查询找到最相关的文档
retriever = vectorstore.as_retriever(
    search_type="similarity",    # 相似度检索（还有 mmr 多样性检索）
    search_kwargs={"k": 3}       # 返回最相关的 3 个文档
)

# 测试检索
test_docs = retriever.invoke("什么是 LangChain？")
print(f"[第四步] 检索测试: 找到 {len(test_docs)} 个相关文档")
for i, doc in enumerate(test_docs, 1):
    print(f"  文档{i}: {doc.page_content[:60]}...")


# ========== 第五步：构建 RAG 链 ==========
# RAG 提示词模板
rag_prompt = ChatPromptTemplate.from_template("""你是一个知识助手。请根据以下检索到的上下文来回答问题。
如果上下文中没有相关信息，请说"我没有找到相关信息"，不要编造答案。

上下文:
{context}

问题: {question}

请用中文回答，回答要准确、简洁:""")

# 辅助函数：将检索到的文档格式化为文本
def format_docs(docs):
    """将文档列表格式化为单个字符串"""
    formatted = []
    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get("source", "未知")
        formatted.append(f"[文档{i}] (来源: {source})\n{doc.page_content}")
    return "\n\n".join(formatted)

# 初始化 LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 组装完整的 RAG 链（使用 LCEL 管道语法）
rag_chain = (
    {
        "context": retriever | format_docs,  # 检索 + 格式化
        "question": RunnablePassthrough()     # 直接透传问题
    }
    | rag_prompt    # 填充提示词模板
    | llm           # 调用 LLM
    | StrOutputParser()  # 解析输出为字符串
)

print(f"\n[RAG 链构建完成]")
print(f"[链的类型] {type(rag_chain)}")


# ========== 第六步：执行 RAG 链 ==========
question = "什么是 LangChain？它有什么用？"
print(f"\n[用户问题] {question}")
print("-" * 50)

answer = rag_chain.invoke(question)
print(f"[回答] {answer}")
```

**预期输出（示例）：**
```
[第一步] 加载文档: 共 5 篇
[第二步] 切分文档: 5 篇 → 8 块
[第三步] 向量存储: 已存储 8 个向量
[第四步] 检索测试: 找到 3 个相关文档
  文档1: LangChain 是一个用于构建大语言模型应用的开源框架...
  文档2: 向量数据库用于存储和检索高维向量数据...
  文档3: Python 是一种高级编程语言...

[RAG 链构建完成]
[链的类型] <class 'langchain_core.runnables.pipe.RunnableSequence'>

[用户问题] 什么是 LangChain？它有什么用？
--------------------------------------------------
[回答] LangChain 是一个用于构建大语言模型应用的开源框架。它提供了模型集成、提示词管理、链式调用、检索增强生成（RAG）、Agent 等核心功能。
```

### 示例 4：错误处理最佳实践

```python
"""
LangChain 错误处理最佳实践
生产环境中必须考虑各种异常情况
"""
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
prompt = ChatPromptTemplate.from_template("回答问题: {question}")
chain = prompt | llm | StrOutputParser()


# ========== 1. 带重试的调用 ==========
def invoke_with_retry(chain, input_data, max_retries=3):
    """带重试机制的链调用"""
    for attempt in range(max_retries):
        try:
            result = chain.invoke(input_data)
            return {"success": True, "result": result, "attempts": attempt + 1}
        except Exception as e:
            error_msg = str(e)
            if attempt < max_retries - 1:
                print(f"  [重试] 第 {attempt + 1} 次失败，准备重试...")
            else:
                return {
                    "success": False,
                    "error": error_msg,
                    "attempts": max_retries
                }


# ========== 2. 输入验证 ==========
def validate_input(data: dict) -> dict:
    """验证输入数据是否合法"""
    if "question" not in data:
        raise ValueError("缺少必需字段: question")
    if not isinstance(data["question"], str):
        raise TypeError("question 必须是字符串")
    if len(data["question"].strip()) == 0:
        raise ValueError("question 不能为空")
    if len(data["question"]) > 1000:
        raise ValueError("question 长度不能超过 1000 字符")
    return data


# ========== 3. 输出验证 ==========
def validate_output(data: str) -> str:
    """验证输出结果是否有效"""
    if not data or len(data.strip()) == 0:
        raise ValueError("模型返回了空内容")
    return data


# ========== 4. 构建带错误处理的链 ==========
safe_chain = (
    RunnableLambda(validate_input)  # 输入验证
    | prompt
    | llm
    | StrOutputParser()
    | RunnableLambda(validate_output)  # 输出验证
)

# 测试各种情况
import json

print("=== 测试 1: 正常调用 ===")
result = invoke_with_retry(safe_chain, {"question": "1+1等于几？"})
print(f"结果: {json.dumps(result, ensure_ascii=False, indent=2)}")

print("\n=== 测试 2: 空输入 ===")
result = invoke_with_retry(safe_chain, {"question": ""})
print(f"结果: {json.dumps(result, ensure_ascii=False, indent=2)}")

print("\n=== 测试 3: 缺少字段 ===")
result = invoke_with_retry(safe_chain, {})
print(f"结果: {json.dumps(result, ensure_ascii=False, indent=2)}")
```

**预期输出（示例）：**
```
=== 测试 1: 正常调用 ===
结果: {
  "success": true,
  "result": "1+1=2",
  "attempts": 1
}

=== 测试 2: 空输入 ===
结果: {
  "success": false,
  "error": "question 不能为空",
  "attempts": 1
}

=== 测试 3: 缺少字段 ===
结果: {
  "success": false,
  "error": "缺少必需字段: question",
  "attempts": 1
}
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | `ModuleNotFoundError: No module named 'langchain'` | 运行 `pip install langchain langchain-openai langchain-community langchain-text-splitters` |
| 2 | API Key 报错 | 确保设置了 `OPENAI_API_KEY` 环境变量，或在代码中显式传入 |
| 3 | `\|` 管道符报语法错误 | 确保 Python 版本 >= 3.9，且使用了正确的 import |
| 4 | RAG 检索结果不相关 | 调整 `chunk_size`、`search_kwargs.k`、或换用 `search_type="mmr"` 多样性检索 |
| 5 | 内存不足（文档太多） | 改用 ChromaDB 或 FAISS 等持久化向量数据库 |
| 6 | 链的执行顺序不对 | LCEL 管道从左到右执行，检查每个 Runnable 的输入输出类型是否匹配 |
| 7 | RunnableParallel 结果缺少字段 | 确保所有并行分支的输入格式一致 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| LangChain | 用于构建 LLM 应用的开源框架，提供模块化组件 |
| LCEL | LangChain Expression Language，用管道符 `\|` 组合组件的语法 |
| Runnable | LangChain 中可调用的基础组件，统一了 invoke/batch/stream 接口 |
| RunnablePassthrough | 直通组件，将输入原样传递给下一个组件 |
| RunnableLambda | 函数组件，将普通 Python 函数包装成 Runnable |
| RunnableParallel | 并行组件，同时执行多个 Runnable，返回字典结果 |
| RAG | 检索增强生成（Retrieval-Augmented Generation），用外部知识增强 LLM 回答 |
| Prompt Template | 提示词模板，支持变量替换和消息格式化 |
| Output Parser | 输出解析器，将 LLM 原始输出解析为结构化数据 |
| Chain | 多个组件的组合，现在推荐用 LCEL 管道代替旧版 Chain |

## ✅ 验收清单
- [ ] 能解释 LangChain 四大模块（Model/Prompt/Chain/Parser）各自的职责
- [ ] 能用 LCEL 管道符 `|` 组合组件
- [ ] 能使用 RunnablePassthrough、RunnableLambda、RunnableParallel
- [ ] 能构建完整的 RAG 链（加载 → 切分 → 向量化 → 检索 → 生成）
- [ ] 能处理链执行中的常见错误（输入验证、输出验证、重试）
- [ ] 能解释 RAG 和直接调用 LLM 的区别

## 📝 复盘小纸条
- 今天最大的收获: _______________
- 还不太确定的: _______________

## 📥 明日同步接口
- 今日完成度: _______________
- 卡点描述: _______________
- 代码是否能跑通: _______________
- 明天希望: _______________
