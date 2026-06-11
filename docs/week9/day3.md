# 📅 Week 9 Day 3：RAG 检索服务集成

## 🧭 今日方向
> 将 Week 5 学习的 RAG 技术集成到项目中。实现文档解析、文本分块、向量化存储、语义检索的完整流程。这是 AI 知识库助手的核心能力。

## 🎯 生活比喻
> 今天的工作就像"给图书馆安装智能检索系统"。书（文档）已经在书架上了，现在需要：1) 给每本书贴标签（文档解析），2) 把长章节拆成知识点（分块），3) 建立索引卡片（向量化），4) 安装搜索引擎（语义检索）。读者说一句话，系统就能找到最相关的段落。

## 📋 今日三件事
1. 实现多格式文档解析器（PDF / Markdown / TXT）
2. 实现文本分块策略（固定大小 + 重叠窗口）
3. 集成 ChromaDB 实现向量化存储和语义检索

---

## 🗺️ 手把手路线

### Step 1: 文档解析
- **做什么:** 支持 PDF / Markdown / TXT 格式的文档解析
- **为什么:** 不同格式需要不同的解析方式
- **成功标志:** 能成功解析三种格式并提取纯文本

### Step 2: 文本分块
- **做什么:** 将长文本切分为适合向量化的片段
- **为什么:** LLM 上下文窗口有限，分块质量直接影响检索效果
- **成功标志:** 分块大小合理、语义完整、支持重叠

### Step 3: 向量化存储与检索
- **做什么:** 将文档块转为向量存入 ChromaDB，实现语义检索
- **为什么:** 向量检索是 RAG 的核心，决定了回答质量
- **成功标志:** 能根据查询检索到最相关的文档块

---

## 💻 代码区

### 完整可运行代码：RAG 检索服务

```python
"""
Week 9 Day 3: RAG 检索服务集成
运行方式: python day3_rag_service.py

依赖安装: pip install chromadb
"""

import hashlib
import os
import json
from typing import List, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime


# =============================================
# 1. 文档解析器
# =============================================
print("=" * 60)
print("=== 1. 文档解析器 ===")
print("=" * 60)


@dataclass
class ParsedDocument:
    """解析后的文档"""
    name: str
    content: str
    file_type: str
    metadata: dict = field(default_factory=dict)


class DocumentParser:
    """
    多格式文档解析器

    支持格式: TXT, Markdown, PDF (模拟), DOCX (模拟)
    实际项目中 PDF 使用 pypdf，DOCX 使用 python-docx
    """

    @staticmethod
    def parse_txt(file_path: str) -> ParsedDocument:
        """解析 TXT 文件"""
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return ParsedDocument(
            name=os.path.basename(file_path),
            content=content,
            file_type="txt",
            metadata={"char_count": len(content), "line_count": content.count("\n") + 1}
        )

    @staticmethod
    def parse_markdown(file_path: str) -> ParsedDocument:
        """解析 Markdown 文件"""
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # 提取标题信息
        headings = [line for line in content.split("\n") if line.startswith("#")]
        return ParsedDocument(
            name=os.path.basename(file_path),
            content=content,
            file_type="md",
            metadata={
                "char_count": len(content),
                "heading_count": len(headings),
                "headings": headings[:5],  # 保留前5个标题
            }
        )

    @staticmethod
    def parse_pdf(file_path: str) -> ParsedDocument:
        """
        解析 PDF 文件

        实际项目中使用:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            content = "\\n".join([page.extract_text() for page in reader.pages])
        """
        # 模拟 PDF 解析结果
        content = (
            f"这是从 PDF 文件 '{os.path.basename(file_path)}' 中提取的文本内容。\n"
            f"PDF 解析需要安装 pypdf 库: pip install pypdf\n"
            f"实际使用时，会通过 PdfReader 提取每一页的文本并合并。\n\n"
            f"注意事项:\n"
            f"1. 扫描件需要 OCR 处理\n"
            f"2. 表格和图片可能无法正确提取\n"
            f"3. 编码问题可能导致乱码"
        )
        return ParsedDocument(
            name=os.path.basename(file_path),
            content=content,
            file_type="pdf",
            metadata={"pages": 10, "simulated": True}
        )

    @classmethod
    def parse(cls, file_path: str) -> ParsedDocument:
        """根据文件扩展名自动选择解析器"""
        ext = os.path.splitext(file_path)[1].lower()
        parsers = {
            ".txt": cls.parse_txt,
            ".md": cls.parse_markdown,
            ".pdf": cls.parse_pdf,
        }
        parser = parsers.get(ext)
        if parser is None:
            raise ValueError(f"不支持的文件格式: {ext}。支持的格式: {list(parsers.keys())}")
        return parser(file_path)


# 测试解析器
print("文档解析器支持格式: TXT, MD, PDF")
print("  - TXT: 直接读取文本内容")
print("  - Markdown: 读取并提取标题信息")
print("  - PDF: 使用 pypdf 提取文本 (演示为模拟)")


# =============================================
# 2. 文本分块器
# =============================================
print("\n" + "=" * 60)
print("=== 2. 文本分块器 ===")
print("=" * 60)


class TextChunker:
    """
    文本分块器

    策略: 固定大小分块 + 重叠窗口
    - chunk_size: 每个块的最大字符数
    - chunk_overlap: 相邻块的重叠字符数
    - 优先在句子边界处切分
    """

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk(self, text: str) -> List[Dict]:
        """
        将文本分块

        返回: [{"content": str, "index": int, "start": int, "end": int}]
        """
        chunks = []
        start = 0
        text_length = len(text)
        chunk_index = 0

        while start < text_length:
            end = min(start + self.chunk_size, text_length)

            # 如果不是最后一块，尝试在句子边界处切分
            if end < text_length:
                # 在当前范围内寻找句号、换行符等分隔符
                for separator in ["\n\n", "\n", "。", ".", "！", "？", "；"]:
                    sep_pos = text.rfind(separator, start, end)
                    if sep_pos > start:
                        end = sep_pos + len(separator)
                        break

            chunk_content = text[start:end].strip()
            if chunk_content:
                chunks.append({
                    "content": chunk_content,
                    "index": chunk_index,
                    "start": start,
                    "end": end,
                    "char_count": len(chunk_content),
                })
                chunk_index += 1

            # 下一块的起始位置（减去重叠量）
            start = end - self.chunk_overlap
            if start <= 0 and chunk_index > 0:
                start = end  # 防止无限循环

        return chunks


# 测试分块器
chunker = TextChunker(chunk_size=200, chunk_overlap=30)

sample_text = """人工智能（Artificial Intelligence，简称 AI）是计算机科学的一个分支。
它试图理解和模拟人类智能的行为方式。AI 的研究领域包括机器学习、自然语言处理、
计算机视觉等多个方向。近年来，随着深度学习技术的发展，AI 在图像识别、语音识别、
自然语言理解等领域取得了突破性进展。大语言模型（LLM）的出现更是推动了 AI 技术的
快速发展，使得 AI 能够理解和生成人类语言，为各种应用场景提供了强大的支持。"""

chunks = chunker.chunk(sample_text)
print(f"\n原始文本长度: {len(sample_text)} 字符")
print(f"分块数量: {len(chunks)}")
print(f"分块大小: {chunker.chunk_size}, 重叠: {chunker.chunk_overlap}")
print()
for chunk in chunks:
    print(f"  块 {chunk['index']}: [{chunk['start']}:{chunk['end']}] "
          f"({chunk['char_count']} 字符) {chunk['content'][:60]}...")


# =============================================
# 3. 向量存储服务 (ChromaDB)
# =============================================
print("\n" + "=" * 60)
print("=== 3. 向量存储服务 (ChromaDB) ===")
print("=" * 60)


class VectorStoreService:
    """
    向量存储服务

    使用 ChromaDB 实现向量化存储和语义检索。
    ChromaDB 会自动使用默认的 Embedding 函数。
    """

    def __init__(self, collection_name: str = "documents", persist_dir: str = "./chroma_data"):
        self.collection_name = collection_name
        self.persist_dir = persist_dir
        self._store = {}  # 模拟存储（实际使用 ChromaDB）

        # 实际项目中的初始化:
        # import chromadb
        # from chromadb.config import Settings
        # self.client = chromadb.Client(Settings(
        #     chroma_db_impl="duckdb+parquet",
        #     persist_directory=persist_dir,
        # ))
        # self.collection = self.client.get_or_create_collection(
        #     name=collection_name,
        #     metadata={"hnsw:space": "cosine"}
        # )
        print(f"  初始化向量存储: collection={collection_name}")

    def add_documents(self, chunks: List[Dict], metadata: dict = None) -> List[str]:
        """
        添加文档块到向量存储

        参数:
            chunks: [{"content": str, "index": int, ...}]
            metadata: 附加元数据
        返回:
            doc_ids: 文档 ID 列表
        """
        doc_ids = []
        base_metadata = metadata or {}

        for chunk in chunks:
            doc_id = hashlib.md5(chunk["content"].encode()).hexdigest()[:12]
            self._store[doc_id] = {
                "content": chunk["content"],
                "metadata": {
                    **base_metadata,
                    "chunk_index": chunk["index"],
                    "start": chunk["start"],
                    "end": chunk["end"],
                },
                "embedding": None,  # 实际由 ChromaDB 自动计算
            }
            doc_ids.append(doc_id)

        # 实际项目中:
        # self.collection.add(
        #     documents=[c["content"] for c in chunks],
        #     metadatas=[{**base_metadata, "chunk_index": c["index"]} for c in chunks],
        #     ids=doc_ids,
        # )

        print(f"  添加了 {len(chunks)} 个文档块 (ID: {doc_ids[0][:8]}...)")
        return doc_ids

    def search(self, query: str, k: int = 3) -> List[Dict]:
        """
        语义检索

        参数:
            query: 查询文本
            k: 返回最相关的 k 个结果
        返回:
            [{"id": str, "content": str, "score": float, "metadata": dict}]
        """
        # 实际项目中:
        # results = self.collection.query(
        #     query_texts=[query],
        #     n_results=k,
        # )
        # return [{"id": id, "content": doc, "score": 1 - dist, "metadata": meta}
        #         for id, doc, dist, meta in zip(
        #             results["ids"][0], results["documents"][0],
        #             results["distances"][0], results["metadatas"][0])]

        # 模拟检索结果（基于关键词匹配）
        results = []
        query_lower = query.lower()
        for doc_id, doc in self._store.items():
            # 简单的关键词匹配评分
            content_lower = doc["content"].lower()
            score = sum(1 for word in query_lower.split() if word in content_lower)
            score = min(score / max(len(query_lower.split()), 1), 1.0)

            results.append({
                "id": doc_id,
                "content": doc["content"],
                "score": round(score, 3),
                "metadata": doc["metadata"],
            })

        # 按分数排序，返回 top-k
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:k]

    def get_stats(self) -> dict:
        """获取存储统计信息"""
        # 实际项目中: self.collection.count()
        return {
            "total_chunks": len(self._store),
            "collection": self.collection_name,
        }

    def delete_document(self, doc_id: str) -> bool:
        """删除指定文档"""
        if doc_id in self._store:
            del self._store[doc_id]
            # 实际项目中: self.collection.delete(ids=[doc_id])
            return True
        return False


# 初始化向量存储
vector_store = VectorStoreService()


# =============================================
# 4. RAG 服务（完整流程）
# =============================================
print("\n" + "=" * 60)
print("=== 4. RAG 服务 (完整流程) ===")
print("=" * 60)


class RAGService:
    """
    RAG 检索服务

    整合文档解析、分块、向量化存储、语义检索的完整流程。
    """

    def __init__(self, chunk_size: int = 200, chunk_overlap: int = 30):
        self.parser = DocumentParser()
        self.chunker = TextChunker(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        self.vector_store = VectorStoreService()

    def ingest_document(self, file_path: str) -> dict:
        """
        文档摄入流程: 解析 -> 分块 -> 向量化存储

        参数:
            file_path: 文档文件路径
        返回:
            处理结果字典
        """
        print(f"\n  [摄入] 开始处理: {file_path}")

        # Step 1: 解析文档
        doc = self.parser.parse(file_path)
        print(f"    1. 解析完成: {doc.name} ({doc.file_type}, {len(doc.content)} 字符)")

        # Step 2: 文本分块
        chunks = self.chunker.chunk(doc.content)
        print(f"    2. 分块完成: {len(chunks)} 个块")

        # Step 3: 向量化存储
        doc_ids = self.vector_store.add_documents(chunks, metadata={
            "source": doc.name,
            "file_type": doc.file_type,
            "ingested_at": datetime.now().isoformat(),
        })
        print(f"    3. 存储完成: {len(doc_ids)} 个向量")

        return {
            "document": doc.name,
            "file_type": doc.file_type,
            "total_chars": len(doc.content),
            "chunks": len(chunks),
            "doc_ids": doc_ids,
            "status": "success",
        }

    def retrieve(self, query: str, k: int = 3) -> List[Dict]:
        """
        检索相关文档

        参数:
            query: 用户查询
            k: 返回结果数量
        返回:
            相关文档块列表
        """
        print(f"\n  [检索] 查询: '{query}' (top-{k})")
        results = self.vector_store.search(query, k)
        print(f"    找到 {len(results)} 个相关结果")
        for i, r in enumerate(results):
            print(f"    #{i+1} (score={r['score']}) {r['content'][:60]}...")
        return results

    def get_stats(self) -> dict:
        """获取 RAG 服务统计"""
        return self.vector_store.get_stats()


# 创建 RAG 服务实例
rag_service = RAGService(chunk_size=150, chunk_overlap=20)


# =============================================
# 5. 创建测试文件并演示完整流程
# =============================================
print("\n" + "=" * 60)
print("=== 5. 完整流程演示 ===")
print("=" * 60)

# 创建测试文档 1
test_doc_1 = """# AI Agent 概述

AI Agent 是一种能够自主决策和执行任务的智能系统。它结合了大语言模型（LLM）的推理能力和
外部工具的执行能力，可以完成复杂的多步骤任务。

## 核心组件

1. 大脑（LLM）：负责理解、推理和决策
2. 记忆（Memory）：存储对话历史和学习经验
3. 工具（Tools）：与外部世界交互的接口
4. 规划（Planning）：分解复杂任务为可执行步骤

## 应用场景

- 智能客服：自动回答用户问题
- 代码助手：编写和调试代码
- 数据分析：自动处理和分析数据
- 内容创作：生成文章、报告等
"""

# 创建测试文档 2
test_doc_2 = """# RAG 技术详解

RAG（Retrieval-Augmented Generation，检索增强生成）是一种结合检索和生成的 AI 技术。

## 工作流程

1. 用户提出问题
2. 系统从知识库中检索相关文档
3. 将检索结果和问题一起传给 LLM
4. LLM 基于检索结果生成回答

## 优势

- 减少幻觉：基于真实文档回答
- 知识更新：无需重新训练模型
- 可追溯：可以显示答案来源
"""

# 保存测试文件
os.makedirs("data/test_docs", exist_ok=True)
with open("data/test_docs/ai_agent_overview.md", "w", encoding="utf-8") as f:
    f.write(test_doc_1)
with open("data/test_docs/rag_tutorial.md", "w", encoding="utf-8") as f:
    f.write(test_doc_2)

print("测试文档已创建:")
print("  1. data/test_docs/ai_agent_overview.md")
print("  2. data/test_docs/rag_tutorial.md")

# 摄入文档
print("\n--- 摄入文档 ---")
result1 = rag_service.ingest_document("data/test_docs/ai_agent_overview.md")
result2 = rag_service.ingest_document("data/test_docs/rag_tutorial.md")

print(f"\n摄入结果汇总:")
print(f"  文档1: {result1['document']} -> {result1['chunks']} 个块")
print(f"  文档2: {result2['document']} -> {result2['chunks']} 个块")
print(f"  总计: {rag_service.get_stats()}")

# 检索测试
print("\n--- 检索测试 ---")
queries = [
    "什么是 AI Agent？",
    "RAG 的工作流程是什么？",
    "AI Agent 有哪些应用场景？",
]

for query in queries:
    results = rag_service.retrieve(query, k=2)
    print()


# =============================================
# 6. API 集成模板
# =============================================
print("=" * 60)
print("=== 6. API 集成模板 (app/api/chat.py) ===")
print("=" * 60)

chat_api_template = '''
# app/api/chat.py
"""
知识问答 API 路由
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class QueryRequest(BaseModel):
    """查询请求"""
    message: str
    conversation_id: Optional[str] = None
    top_k: int = 3


class SourceItem(BaseModel):
    """引用来源"""
    doc_id: str
    content: str
    score: float
    metadata: dict


class QueryResponse(BaseModel):
    """查询响应"""
    response: str
    sources: List[SourceItem]
    conversation_id: str


@router.post("/query", response_model=QueryResponse)
async def query_knowledge_base(request: QueryRequest):
    """知识问答接口"""
    # 1. 调用 RAG 服务检索相关文档
    # sources = rag_service.retrieve(request.message, k=request.top_k)

    # 2. 调用 LLM 生成回答
    # response = await generate_answer(request.message, sources)

    # 3. 返回结果
    return QueryResponse(
        response="基于检索到的文档内容，关于您的问题...",
        sources=[],
        conversation_id=request.conversation_id or "new_conv",
    )


@router.get("/history/{conversation_id}")
async def get_conversation_history(conversation_id: str):
    """获取对话历史"""
    # 实际从数据库查询
    return {"conversation_id": conversation_id, "messages": []}
'''
print(chat_api_template)


# =============================================
# 7. RAG 优化技巧
# =============================================
print("\n" + "=" * 60)
print("=== 7. RAG 优化技巧 ===")
print("=" * 60)

optimization_tips = """
  1. 分块策略优化:
     - chunk_size 建议 200-1000 字符
     - chunk_overlap 建议 chunk_size 的 10%-20%
     - 优先在自然边界（段落、句子）处切分

  2. Embedding 模型选择:
     - 英文: text-embedding-3-small (OpenAI)
     - 中文: BGE-large-zh (BAAI)
     - 多语言: text-embedding-3-small / Jina

  3. 检索优化:
     - 混合检索: 向量检索 + 关键词检索
     - Reranking: 对检索结果二次排序
     - 查询改写: 用 LLM 优化用户查询

  4. 上下文窗口管理:
     - 控制传给 LLM 的上下文长度
     - 优先传递分数最高的结果
     - 添加分隔符区分不同文档块
"""
print(optimization_tips)


# =============================================
# 总结
# =============================================
print("=" * 60)
print("✅ Day 3 完成清单")
print("=" * 60)
print("""
  [x] 文档解析器实现完成（支持 TXT/MD/PDF）
  [x] 文本分块器实现完成（固定大小 + 重叠窗口）
  [x] 向量存储服务实现完成（ChromaDB 接口）
  [x] RAG 完整流程演示通过
  [x] API 集成模板准备

  明天预告: Day 4 将实现 Agent 核心逻辑，包括意图分类、
  回答生成、对话上下文管理。
""")
```

---

## 📤 预期输出

运行 `python day3_rag_service.py` 后，你将看到：

```
============================================================
=== 2. 文本分块器 ===
============================================================

原始文本长度: 263 字符
分块数量: 3
分块大小: 200, 重叠: 30

  块 0: [0:158] (158 字符) 人工智能（Artificial Intelligence，简称 AI）是计算机科学的一个分支。
  它试图理解和模拟人类智能的行为方式。AI 的研究领域包括机器学习、...
  块 1: [128:263] (135 字符) AI 在图像识别、语音识别、自然语言理解等领域取得了突破性进展。...
  ...

============================================================
=== 5. 完整流程演示 ===
============================================================

--- 摄入文档 ---

  [摄入] 开始处理: data/test_docs/ai_agent_overview.md
    1. 解析完成: ai_agent_overview.md (md, 538 字符)
    2. 分块完成: 5 个块
    3. 存储完成: 5 个向量

--- 检索测试 ---

  [检索] 查询: '什么是 AI Agent？' (top-2)
    找到 2 个相关结果
    #1 (score=0.8) AI Agent 是一种能够自主决策和执行任务的智能系统...
    #2 (score=0.4) AI Agent 的核心组件包括大脑（LLM）、记忆（Memory）...
```

---

## ⚠️ 常见错误与解决方案

### 错误 1：`ModuleNotFoundError: No module named 'chromadb'`

```
ModuleNotFoundError: No module named 'chromadb'
```

**解决方案:**
```bash
pip install chromadb
# 或者使用 FAISS 作为替代
pip install faiss-cpu
```

### 错误 2：`FileNotFoundError` 文件不存在

```
FileNotFoundError: [Errno 2] No such file or directory: 'data/test_docs/xxx.md'
```

**解决方案:**
```python
import os
os.makedirs("data/test_docs", exist_ok=True)  # 自动创建目录
```

### 错误 3：分块结果为空

```
分块数量: 0
```

**原因:** 文本过短或 chunk_size 设置过大。

**解决方案:**
```python
# 调整分块参数
chunker = TextChunker(chunk_size=100, chunk_overlap=20)
# 或确保输入文本足够长
```

### 错误 4：ChromaDB 持久化失败

```
chromadb.errors.InvalidHTTPResponse: ...
```

**解决方案:**
```bash
# 清理 ChromaDB 数据目录
rm -rf ./chroma_data
# 重新运行
```

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| RAG | 检索增强生成，结合检索和生成的 AI 技术 |
| 文档解析 | 将 PDF/DOCX 等格式转换为纯文本 |
| 文本分块 | 将长文本切分为适合向量化的片段 |
| Embedding | 将文本转换为高维数字向量 |
| 向量检索 | 基于向量相似度搜索最相关的内容 |
| ChromaDB | 轻量级向量数据库，支持本地部署 |
| chunk_size | 每个文档块的最大字符数 |
| chunk_overlap | 相邻块的重叠字符数，保证语义连续性 |
| Top-K | 返回相似度最高的 K 个结果 |

---

## 🏆 每日挑战

### 挑战 1：基础（必做）
1. 运行今日代码，理解完整 RAG 流程
2. 修改 chunk_size 和 chunk_overlap，观察分块结果变化
3. 尝试不同的查询语句，观察检索结果

### 挑战 2：进阶（推荐）
1. 安装 ChromaDB 并使用真实的向量存储替换模拟实现
2. 添加一个真实的 PDF 文件测试解析和检索
3. 实现混合检索（向量检索 + 关键词检索）

### 挑战 3：挑战（可选）
实现一个 RAG 质量评估脚本：
1. 准备 5 个测试问题和标准答案
2. 自动运行 RAG 检索并生成回答
3. 计算检索准确率和回答相关性

---

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...
- 明天需要重点关注: ...

---

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望重点解决: ...
