# 📅 Week 9 Day 3：RAG 检索服务集成

## 🧭 今日方向
> 将 Week 5 学习的 RAG 技术集成到项目中。实现文档解析、向量化、检索的完整流程。

## 🎯 生生活比喻
> 今天的工作就像"给图书馆安装检索系统"。书（文档）已经在书架上了，现在需要安装标签系统（向量化）和搜索引擎（检索），让读者能快速找到想要的书。

## 📋 今日三件事
1. 实现文档解析和分块
2. 集成向量数据库
3. 实现检索服务

## 🗺️ 手把手路线

### Step 1: 文档解析
- 做什么: 支持 PDF/DOCX/MD 格式的文档解析
- 为什么: 不同格式需要不同的解析方式
- 成功标志: 能成功解析三种格式

### Step 2: 向量化存储
- 做什么: 将文档块转换为向量并存入 Chroma
- 为什么: 向量是语义检索的基础
- 成功标志: 文档能成功向量化并存储

### Step 3: 检索服务
- 做什么: 实现语义检索 API
- 为什么: 这是 RAG 的核心功能
- 成功标志: 能根据查询检索相关文档

## 💻 代码区

```python
"""
Week 9 Day 3: RAG 检索服务集成
"""

from typing import List, Optional
from dataclasses import dataclass
import hashlib

# ========== 1. 文档解析器 ==========
print("=== 1. 文档解析器 ===")

@dataclass
class ParsedDocument:
    """解析后的文档"""
    name: str
    content: str
    file_type: str
    metadata: dict

class DocumentParser:
    """文档解析器"""

    @staticmethod
    def parse_txt(file_path: str) -> ParsedDocument:
        """解析 TXT 文件"""
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return ParsedDocument(
            name=file_path.split("/")[-1],
            content=content,
            file_type="txt",
            metadata={"char_count": len(content)}
        )

    @staticmethod
    def parse_markdown(file_path: str) -> ParsedDocument:
        """解析 Markdown 文件"""
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return ParsedDocument(
            name=file_path.split("/")[-1],
            content=content,
            file_type="md",
            metadata={"char_count": len(content)}
        )

    @staticmethod
    def parse_pdf(file_path: str) -> ParsedDocument:
        """解析 PDF 文件"""
        # 实际使用 pypdf
        # from pypdf import PdfReader
        # reader = PdfReader(file_path)
        # content = "\n".join([page.extract_text() for page in reader.pages])
        content = f"[PDF 内容模拟] {file_path}"
        return ParsedDocument(
            name=file_path.split("/")[-1],
            content=content,
            file_type="pdf",
            metadata={"pages": 10}
        )

    @staticmethod
    def parse_docx(file_path: str) -> ParsedDocument:
        """解析 DOCX 文件"""
        # 实际使用 python-docx
        # from docx import Document
        # doc = Document(file_path)
        # content = "\n".join([para.text for para in doc.paragraphs])
        content = f"[DOCX 内容模拟] {file_path}"
        return ParsedDocument(
            name=file_path.split("/")[-1],
            content=content,
            file_type="docx",
            metadata={"paragraphs": 20}
        )

    @classmethod
    def parse(cls, file_path: str) -> ParsedDocument:
        """根据文件类型自动解析"""
        if file_path.endswith(".txt"):
            return cls.parse_txt(file_path)
        elif file_path.endswith(".md"):
            return cls.parse_markdown(file_path)
        elif file_path.endswith(".pdf"):
            return cls.parse_pdf(file_path)
        elif file_path.endswith(".docx"):
            return cls.parse_docx(file_path)
        else:
            raise ValueError(f"不支持的文件格式: {file_path}")

# 测试解析器
print("文档解析器支持格式: TXT, MD, PDF, DOCX")

# ========== 2. 文档分块器 ==========
print("\n=== 2. 文档分块器 ===")

from typing import List

class TextChunker:
    """文本分块器"""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk(self, text: str) -> List[str]:
        """将文本分块"""
        chunks = []
        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + self.chunk_size

            # 尝试在句号处切分
            if end < text_length:
                # 向前找句号
                period_pos = text.rfind("。", start, end)
                if period_pos > start:
                    end = period_pos + 1

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            # 下一块的起始位置
            start = end - self.chunk_overlap

        return chunks

# 测试分块器
chunker = TextChunker(chunk_size=100, chunk_overlap=20)
sample_text = "这是一个测试文本。" * 20
chunks = chunker.chunk(sample_text)
print(f"原始文本长度: {len(sample_text)}")
print(f"分块数量: {len(chunks)}")
print(f"第一块: {chunks[0][:50]}...")

# ========== 3. 向量存储服务 ==========
print("\n=== 3. 向量存储服务 ===")

class VectorStoreService:
    """向量存储服务"""

    def __init__(self, collection_name: str = "documents"):
        self.collection_name = collection_name
        self._store = {}  # 模拟向量存储

    def add_documents(self, chunks: List[str], metadata: dict = None):
        """添加文档块"""
        for i, chunk in enumerate(chunks):
            doc_id = hashlib.md5(chunk.encode()).hexdigest()[:8]
            self._store[doc_id] = {
                "content": chunk,
                "metadata": metadata or {},
                "embedding": None  # 实际需要计算 embedding
            }
        print(f"  添加了 {len(chunks)} 个文档块")

    def search(self, query: str, k: int = 3) -> List[dict]:
        """搜索相关文档"""
        # 实际需要计算 query 的 embedding 并进行相似度搜索
        # 这里模拟返回
        results = []
        for doc_id, doc in list(self._store.items())[:k]:
            results.append({
                "id": doc_id,
                "content": doc["content"],
                "score": 0.9,  # 模拟分数
                "metadata": doc["metadata"]
            })
        return results

    def get_stats(self) -> dict:
        """获取统计信息"""
        return {
            "total_documents": len(self._store),
            "collection": self.collection_name
        }

# 测试向量存储
vector_store = VectorStoreService()
vector_store.add_documents(chunks[:3], {"source": "test"})
print(f"存储统计: {vector_store.get_stats()}")

# ========== 4. RAG 服务 ==========
print("\n=== 4. RAG 服务 ===")

class RAGService:
    """RAG 检索服务"""

    def __init__(self):
        self.parser = DocumentParser()
        self.chunker = TextChunker()
        self.vector_store = VectorStoreService()

    def ingest_document(self, file_path: str) -> dict:
        """摄入文档"""
        # 1. 解析文档
        doc = self.parser.parse(file_path)
        print(f"  解析文档: {doc.name}")

        # 2. 分块
        chunks = self.chunker.chunk(doc.content)
        print(f"  分块数量: {len(chunks)}")

        # 3. 向量化存储
        self.vector_store.add_documents(chunks, {
            "source": doc.name,
            "file_type": doc.file_type,
            **doc.metadata
        })

        return {
            "document": doc.name,
            "chunks": len(chunks),
            "status": "success"
        }

    def retrieve(self, query: str, k: int = 3) -> List[dict]:
        """检索相关文档"""
        return self.vector_store.search(query, k)

    def get_stats(self) -> dict:
        """获取服务统计"""
        return self.vector_store.get_stats()

# 测试 RAG 服务
rag_service = RAGService()

# 创建测试文件
with open("test_doc.md", "w", encoding="utf-8") as f:
    f.write("# AI Agent 概述\n\nAI Agent 是一种能够自主决策和执行任务的智能系统。")

# 摄入文档
result = rag_service.ingest_document("test_doc.md")
print(f"摄入结果: {result}")

# 检索
results = rag_service.retrieve("什么是 AI Agent")
print(f"检索结果: {len(results)} 条")

# ========== 5. API 集成 ==========
print("\n=== 5. API 集成 ===")

print("""
API 端点:

POST /api/rag/ingest
  - 上传并摄入文档
  - 请求: multipart/form-data (file)
  - 响应: { document, chunks, status }

GET /api/rag/search
  - 搜索相关文档
  - 参数: query (str), k (int, default=3)
  - 响应: [{ id, content, score, metadata }]

GET /api/rag/stats
  - 获取 RAG 服务统计
  - 响应: { total_documents, collection }
""")

# 模拟 API 调用
print("\n--- API 调用示例 ---")
print("摄入文档: POST /api/rag/ingest")
print("搜索文档: GET /api/rag/search?query=AI+Agent&k=3")

print("""
=== RAG 服务最佳实践 ===

1. 文档处理:
   - 支持多种格式
   - 合理的分块策略
   - 保留元数据

2. 向量化:
   - 选择合适的 Embedding 模型
   - 考虑多语言支持
   - 缓存 embedding 结果

3. 检索优化:
   - 混合检索（向量 + 关键词）
   - Reranking 提升精度
   - 缓存热门查询

4. 监控:
   - 跟踪检索质量
   - 记录查询日志
   - 定期评估效果
""")
```

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | PDF 解析失败 | 检查 pypdf 安装，扫描件需要 OCR |
| 2 | 分块质量差 | 调整 chunk_size 和分隔符 |
| 3 | 检索不准 | 换用更好的 Embedding 模型 |
| 4 | 内存不足 | 使用持久化存储，分批处理 |

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| 文档解析 | 将 PDF/DOCX 等格式转换为纯文本 |
| 文本分块 | 将长文本切分为适当大小的片段 |
| 向量化 | 将文本转换为数字向量 |
| 语义检索 | 基于语义相似度搜索文档 |
| RAG 服务 | 检索增强生成的完整服务 |
| 元数据 | 文档的附加信息（来源、类型等）|

## ✅ 验收清单
- [ ] 能解析 PDF/DOCX/MD 格式
- [ ] 能将文档分块
- [ ] 能存储向量并检索
- [ ] RAG 服务能正常工作
- [ ] API 能正常调用
- [ ] 理解 RAG 服务的最佳实践

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
