# Week 9：项目实战入门

> **Phase 2 第五周** — 从"学"到"做"，构建你的第一个 Agent 产品

---

## Day 1：项目选型与需求分析

### 📅 Day 1：项目选型 — 选择一个"刚刚好"的项目

### 🧭 今日方向
确定项目方向、定义 MVP 功能范围、制定技术选型和开发计划。

### 🎯 生活比喻
选项目就像选健身计划。如果你刚开始健身，不应该选"马拉松训练计划"——那是给专业选手的。你应该选一个"30天入门计划"：目标明确、难度适中、能看到成果。选项目也是一样：不要贪大，选一个能在 2 周内完成 MVP 的项目。

### 📋 今日三件事
1. 确定项目方向和核心价值
2. 定义 MVP 功能列表
3. 完成技术选型和架构设计

### 🗺️ 手把手路线

#### Step 1：项目方向评估
**做什么**：评估 3 个候选项目方向，选出最适合的
**为什么**：方向选错了，后面越努力越偏
**成功标志**：明确选定一个项目方向

#### Step 2：MVP 定义
**做什么**：定义最小可行产品的功能列表
**为什么**：MVP 保证你能在有限时间内交付可用产品
**成功标志**：功能列表不超过 5 个核心功能

#### Step 3：技术选型
**做什么**：选择技术栈并画出架构图
**为什么**：技术选型决定开发效率和可维护性
**成功标志**：画出清晰的系统架构图

### 💻 代码区

```python
"""
Week 9 Day 1：项目选型与需求分析
功能：项目选型评估框架 + 技术选型清单
"""

# ========== 项目选型评估 ==========

evaluation_criteria = {
    "学习价值": {
        "weight": 0.3,
        "description": "项目是否能覆盖课程知识点"
    },
    "可行性": {
        "weight": 0.25,
        "description": "2周内能否完成MVP"
    },
    "实用性": {
        "weight": 0.2,
        "description": "项目是否有实际使用价值"
    },
    "差异化": {
        "weight": 0.15,
        "description": "项目是否有独特性"
    },
    "展示价值": {
        "weight": 0.1,
        "description": "项目是否适合在简历/作品集中展示"
    }
}

# 候选项目评估
projects = {
    "智能客服系统": {
        "学习价值": 8, "可行性": 7, "实用性": 9, "差异化": 6, "展示价值": 8
    },
    "知识库问答助手": {
        "学习价值": 9, "可行性": 8, "实用性": 8, "差异化": 7, "展示价值": 8
    },
    "多Agent协作平台": {
        "学习价值": 10, "可行性": 5, "实用性": 7, "差异化": 9, "展示价值": 9
    }
}

print("="*60)
print("项目选型评估")
print("="*60)

for project_name, scores in projects.items():
    total = sum(
        scores[criterion] * evaluation_criteria[criterion]["weight"]
        for criterion in evaluation_criteria
    )
    print(f"\n{project_name}：")
    for criterion, score in scores.items():
        weight = evaluation_criteria[criterion]["weight"]
        print(f"  {criterion}：{score}/10 (权重{weight*100:.0f}%)")
    print(f"  总分：{total:.1f}")

# ========== 推荐项目：智能知识助手 ==========

recommended_project = {
    "name": "智能知识助手 (Smart Knowledge Assistant)",
    "description": "基于 RAG + Agent 的智能问答系统，支持文档上传、知识检索、多轮对话",
    "core_features": [
        "文档上传与解析（PDF/TXT/Markdown）",
        "向量化存储与检索（RAG）",
        "多轮对话与上下文记忆",
        "工具调用（计算器、搜索、数据库查询）",
        "对话历史管理"
    ],
    "tech_stack": {
        "后端": "FastAPI + Python 3.11+",
        "LLM": "OpenAI GPT-4o-mini",
        "向量数据库": "ChromaDB",
        "前端": "Streamlit（快速原型）",
        "部署": "Docker"
    }
}

print("\n" + "="*60)
print("推荐项目方案")
print("="*60)
print(f"项目名称：{recommended_project['name']}")
print(f"项目描述：{recommended_project['description']}")
print(f"\n核心功能：")
for i, feature in enumerate(recommended_project['core_features'], 1):
    print(f"  {i}. {feature}")
print(f"\n技术栈：")
for key, value in recommended_project['tech_stack'].items():
    print(f"  {key}: {value}")

# ========== 开发计划 ==========

dev_plan = {
    "Week 9": {
        "Day 1": "项目选型、需求分析",
        "Day 2": "后端骨架搭建（FastAPI + 项目结构）",
        "Day 3": "RAG 集成（文档解析 + 向量存储）",
        "Day 4": "Agent 逻辑实现（工具调用 + 多轮对话）",
        "Day 5": "安全层 + 前端界面",
    },
    "Week 10-11": {
        "Day 1-5": "端到端联调、Bug 修复、功能完善",
    }
}

print("\n" + "="*60)
print("开发计划")
print("="*60)
for week, days in dev_plan.items():
    print(f"\n{week}:")
    for day, task in days.items():
        print(f"  {day}: {task}")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| 项目范围太大 | 砍掉非核心功能，聚焦 MVP |
| 技术栈不熟悉 | 选择课程中已学过的框架 |
| 时间不够 | 使用 Streamlit 快速搭建前端 |
| 数据不足 | 使用公开数据集或模拟数据 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| MVP | 最小可行产品 | 先做原型再完善 |
| Tech Stack | 技术栈 | 建房子的材料清单 |
| Architecture | 系统架构 | 建筑设计图 |
| Backlog | 待办事项列表 | 购物清单 |

### ✅ 验收清单
- [ ] 明确了项目方向和核心价值
- [ ] MVP 功能列表不超过 5 个
- [ ] 技术选型已确定
- [ ] 画出了系统架构图

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 2 将搭建 FastAPI 后端骨架，请确保已安装 FastAPI、uvicorn 等依赖。

---

## Day 2：后端骨架搭建

### 📅 Day 2：后端骨架 — 搭建项目的"地基和框架"

### 🧭 今日方向
用 FastAPI 搭建项目后端骨架，包括目录结构、路由定义、配置管理。

### 🎯 生活比喻
盖房子不能直接砌墙，要先打地基、立框架。后端骨架就是项目的"钢筋混凝土框架"——虽然还没装修，但结构已经立起来了，后续的工作都是往框架里填充内容。

### 📋 今日三件事
1. 创建标准项目目录结构
2. 搭建 FastAPI 应用骨架
3. 实现配置管理和环境变量

### 🗺️ 手把手路线

#### Step 1：创建项目结构
**做什么**：按最佳实践创建目录和文件
**为什么**：好的项目结构让代码易于维护
**成功标志**：目录结构清晰，每个文件职责明确

#### Step 2：FastAPI 应用骨架
**做什么**：创建主应用、路由模块、数据模型
**为什么**：这是 API 服务的基础
**成功标志**：`uvicorn` 能启动，`/docs` 能看到 API 文档

#### Step 3：配置管理
**做什么**：用 Pydantic Settings 管理配置
**为什么**：不同环境（开发/测试/生产）需要不同配置
**成功标志**：配置能从环境变量读取

### 💻 代码区

```python
"""
Week 9 Day 2：FastAPI 后端骨架
以下是项目的核心文件结构和代码
"""
# ========== 项目结构 ==========
# smart-knowledge-assistant/
# ├── app/
# │   ├── __init__.py
# │   ├── main.py              # FastAPI 主应用
# │   ├── config.py            # 配置管理
# │   ├── models/
# │   │   ├── __init__.py
# │   │   └── schemas.py       # Pydantic 数据模型
# │   ├── routers/
# │   │   ├── __init__.py
# │   │   ├── chat.py          # 对话路由
#   │   │   └── documents.py   # 文档管理路由
# │   ├── services/
# │   │   ├── __init__.py
# │   │   ├── rag.py           # RAG 服务
# │   │   └── agent.py         # Agent 服务
# │   └── utils/
# │       ├── __init__.py
# │       └── helpers.py       # 工具函数
# ├── tests/
# ├── requirements.txt
# ├── Dockerfile
# └── README.md


# ========== 文件1: app/config.py ==========

from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """应用配置"""
    # 应用基本配置
    APP_NAME: str = "Smart Knowledge Assistant"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # LLM 配置
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_TEMPERATURE: float = 0

    # 向量数据库配置
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    CHROMA_COLLECTION: str = "knowledge_base"

    # RAG 配置
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    RETRIEVAL_K: int = 3

    # 安全配置
    MAX_INPUT_LENGTH: int = 2000
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()


# ========== 文件2: app/models/schemas.py ==========

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ChatRequest(BaseModel):
    """对话请求"""
    message: str = Field(..., min_length=1, max_length=2000, description="用户消息")
    session_id: Optional[str] = Field(None, description="会话ID")
    use_tools: bool = Field(True, description="是否启用工具调用")

class ChatResponse(BaseModel):
    """对话响应"""
    response: str = Field(..., description="助手回复")
    session_id: str = Field(..., description="会话ID")
    sources: list[str] = Field(default_factory=list, description="引用来源")
    tools_used: list[str] = Field(default_factory=list, description="使用的工具")
    timestamp: datetime = Field(default_factory=datetime.now)

class DocumentUpload(BaseModel):
    """文档上传响应"""
    doc_id: str
    filename: str
    chunk_count: int
    status: str

class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str
    version: str
    components: dict


# ========== 文件3: app/main.py ==========

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import get_settings
from app.routers import chat, documents

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    print("正在初始化服务...")
    settings = get_settings()
    print(f"应用名称：{settings.APP_NAME}")
    print(f"模型：{settings.OPENAI_MODEL}")
    yield
    # 关闭时
    print("正在关闭服务...")

app = FastAPI(
    title="Smart Knowledge Assistant",
    description="基于 RAG + Agent 的智能知识问答系统",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(chat.router, prefix="/api/chat", tags=["对话"])
app.include_router(documents.router, prefix="/api/documents", tags=["文档"])

@app.get("/health")
async def health_check():
    settings = get_settings()
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "components": {
            "api": "ok",
            "llm": "ok" if settings.OPENAI_API_KEY else "no_key",
            "vector_db": "ok"
        }
    }


# ========== 文件4: app/routers/chat.py ==========

from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.config import get_settings
import uuid

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """对话接口"""
    settings = get_settings()

    # 输入验证
    if len(request.message) > settings.MAX_INPUT_LENGTH:
        raise HTTPException(status_code=400, detail="输入过长")

    # 生成或使用会话ID
    session_id = request.session_id or str(uuid.uuid4())

    # TODO: 集成 RAG 和 Agent 逻辑
    response_text = f"收到消息：{request.message}（RAG + Agent 逻辑待集成）"

    return ChatResponse(
        response=response_text,
        session_id=session_id,
        sources=[],
        tools_used=[]
    )


# ========== 文件5: app/routers/documents.py ==========

from fastapi import APIRouter, UploadFile, File
from app.models.schemas import DocumentUpload
import uuid

router = APIRouter()

@router.post("/upload", response_model=DocumentUpload)
async def upload_document(file: UploadFile = File(...)):
    """上传文档"""
    content = await file.read()
    # TODO: 集成文档解析和向量化
    return DocumentUpload(
        doc_id=str(uuid.uuid4()),
        filename=file.filename,
        chunk_count=0,
        status="pending"
    )

@router.get("/")
async def list_documents():
    """列出所有文档"""
    return {"documents": [], "total": 0}


# ========== requirements.txt 示例 ==========
# fastapi==0.110.0
# uvicorn[standard]==0.27.0
# pydantic==2.6.0
# pydantic-settings==2.1.0
# langchain==0.2.0
# langchain-openai==0.1.0
# chromadb==0.4.22
# python-multipart==0.0.9
# tiktoken==0.6.0
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| `uvicorn` 启动报错 | 确认在项目根目录运行：`uvicorn app.main:app --reload` |
| 导入路径错误 | 确认 `__init__.py` 文件存在 |
| `.env` 配置不生效 | 确认文件名是 `.env`（不是 `env.txt`） |
| CORS 错误 | 检查 `allow_origins` 配置 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| FastAPI | 高性能 Python Web 框架 | 建筑的钢筋框架 |
| Router | API 路由，处理不同 URL 的请求 | 楼层的房间 |
| Schema | 数据模型定义 | 图纸标注 |
| Lifespan | 应用启动和关闭的生命周期 | 建筑的开工和竣工 |

### ✅ 验收清单
- [ ] 项目目录结构清晰
- [ ] FastAPI 能启动并访问 `/docs`
- [ ] 配置能从 `.env` 读取
- [ ] 所有路由能返回基本响应

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 3 将集成 RAG 功能，请确保 ChromaDB 和 LangChain 已安装。

---

## Day 3：RAG 集成

### 📅 Day 3：RAG 集成 — 让系统学会"查资料再回答"

### 🧭 今日方向
将 Week 5 学到的 RAG 技术集成到项目中：文档上传解析、向量化存储、检索增强生成。

### 🎯 生俗比喻
如果说 Day 2 搭建的是"办公室"，那今天就是给办公室配上"图书馆"和"资料检索系统"。用户上传的文档会被拆解、分类、编号存入图书馆（向量库），当用户提问时，系统先去图书馆找相关资料，再根据资料回答问题。

### 📋 今日三件事
1. 实现文档解析和分块
2. 集成 ChromaDB 向量存储
3. 实现 RAG 检索和生成

### 🗺️ 手把手路线

#### Step 1：文档处理服务
**做什么**：实现支持多种格式的文档解析
**为什么**：用户可能上传 PDF、TXT、Markdown 等格式
**成功标志**：能正确解析多种格式的文档并分块

#### Step 2：向量存储服务
**做什么**：将文档块向量化并存入 ChromaDB
**为什么**：向量化是语义检索的基础
**成功标志**：文档能被正确向量化和检索

#### Step 3：RAG 问答服务
**做什么**：实现检索-增强-生成的完整流程
**为什么**：这是系统的核心功能
**成功标志**：能基于文档内容回答用户问题

### 💻 代码区

```python
"""
Week 9 Day 3：RAG 集成
"""
import os
from typing import Optional
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# ========== 文档处理服务 ==========

class DocumentProcessor:
    """文档解析和分块"""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", "。", "！", "？", "，", " "]
        )

    def process_text(self, text: str, metadata: dict = None) -> list[Document]:
        """处理纯文本"""
        doc = Document(page_content=text, metadata=metadata or {})
        return self.text_splitter.split_documents([doc])

    def process_file(self, file_path: str) -> list[Document]:
        """处理文件"""
        ext = os.path.splitext(file_path)[1].lower()
        metadata = {"source": file_path, "type": ext}

        if ext == ".txt" or ext == ".md":
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
            return self.process_text(text, metadata)

        elif ext == ".pdf":
            # PDF 解析需要额外库
            # 这里简化处理
            return self.process_text("PDF 内容待解析", metadata)

        else:
            raise ValueError(f"不支持的文件格式：{ext}")


# ========== 向量存储服务 ==========

class VectorStore:
    """ChromaDB 向量存储"""

    def __init__(
        self,
        collection_name: str = "knowledge_base",
        persist_dir: str = "./chroma_db"
    ):
        self.embeddings = OpenAIEmbeddings()
        self.persist_dir = persist_dir
        self.collection_name = collection_name
        self._store: Optional[Chroma] = None

    @property
    def store(self) -> Chroma:
        if self._store is None:
            self._store = Chroma(
                collection_name=self.collection_name,
                embedding_function=self.embeddings,
                persist_directory=self.persist_dir
            )
        return self._store

    def add_documents(self, documents: list[Document]) -> int:
        """添加文档到向量库"""
        if not documents:
            return 0
        self.store.add_documents(documents)
        return len(documents)

    def search(self, query: str, k: int = 3) -> list[Document]:
        """语义检索"""
        return self.store.similarity_search(query, k=k)

    def search_with_scores(self, query: str, k: int = 3) -> list[tuple]:
        """带分数的语义检索"""
        return self.store.similarity_search_with_relevance_scores(query, k=k)

    def count(self) -> int:
        """文档总数"""
        return self.store._collection.count()


# ========== RAG 问答服务 ==========

class RAGService:
    """RAG 问答服务"""

    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        self.prompt = ChatPromptTemplate.from_template(
            """你是一个智能知识助手。请基于以下参考资料回答用户的问题。

规则：
1. 只使用参考资料中的信息来回答
2. 如果参考资料中没有相关信息，请坦诚说"我没有找到相关信息"
3. 回答要准确、简洁、有帮助

参考资料：
{context}

用户问题：{question}

回答："""
        )

    def query(self, question: str, k: int = 3) -> dict:
        """执行 RAG 查询"""
        # Step 1: 检索相关文档
        docs = self.vector_store.search(question, k=k)
        context = "\n\n".join([doc.page_content for doc in docs])
        sources = [doc.metadata.get("source", "unknown") for doc in docs]

        # Step 2: 生成回答
        chain = self.prompt | self.llm | StrOutputParser()
        answer = chain.invoke({
            "context": context,
            "question": question
        })

        return {
            "answer": answer,
            "sources": sources,
            "context": context,
            "doc_count": len(docs)
        }


# ========== 集成到 FastAPI ==========

# 在 app/services/rag.py 中实现以下代码

"""
from app.config import get_settings
from app.services.rag import DocumentProcessor, VectorStore, RAGService

settings = get_settings()

# 初始化服务
processor = DocumentProcessor(
    chunk_size=settings.CHUNK_SIZE,
    chunk_overlap=settings.CHUNK_OVERLAP
)

vector_store = VectorStore(
    collection_name=settings.CHROMA_COLLECTION,
    persist_dir=settings.CHROMA_PERSIST_DIR
)

rag_service = RAGService(vector_store)


# 在 routers/chat.py 中使用

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    # 使用 RAG 查询
    result = rag_service.query(request.message, k=settings.RETRIEVAL_K)

    return ChatResponse(
        response=result["answer"],
        session_id=session_id,
        sources=result["sources"],
        tools_used=[]
    )


# 在 routers/documents.py 中使用

@router.post("/upload", response_model=DocumentUpload)
async def upload_document(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8")

    # 处理文档
    chunks = processor.process_text(
        text,
        metadata={"filename": file.filename}
    )

    # 存入向量库
    count = vector_store.add_documents(chunks)

    return DocumentUpload(
        doc_id=str(uuid.uuid4()),
        filename=file.filename,
        chunk_count=count,
        status="completed"
    )
"""


# ========== 测试 ==========

if __name__ == "__main__":
    # 初始化
    processor = DocumentProcessor()
    vector_store = VectorStore(collection_name="test_kb")
    rag = RAGService(vector_store)

    # 添加测试文档
    test_docs = [
        "Python 3.12 引入了类型参数语法的重大改进。",
        "FastAPI 是一个高性能的 Python Web 框架。",
        "Django 提供了完整的 Web 开发解决方案。",
        "ChromaDB 是一个轻量级的向量数据库。",
        "RAG 通过检索外部知识来增强 LLM 的回答。",
    ]

    for text in test_docs:
        chunks = processor.process_text(text, metadata={"source": "test"})
        vector_store.add_documents(chunks)

    print(f"向量库中已有 {vector_store.count()} 个文档块")

    # 测试查询
    result = rag.query("Python 的 Web 框架有哪些？")
    print(f"\n问题：Python 的 Web 框架有哪些？")
    print(f"回答：{result['answer']}")
    print(f"引用：{result['sources']}")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| ChromaDB 集合冲突 | 使用不同的 `collection_name` |
| 文档分块效果差 | 调整 `chunk_size` 和分隔符 |
| 检索结果不相关 | 增大 `k` 值或优化文档质量 |
| LLM 回答出现幻觉 | 在 prompt 中强调"只使用参考资料" |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Document Processor | 文档解析器 | 图书馆的拆书机 |
| Vector Store | 向量数据库 | 按内容分类的书架 |
| RAG Chain | 检索增强生成链 | 图书馆员帮你找书并总结 |
| Chunk | 文档块 | 书中的一个章节 |

### ✅ 验收清单
- [ ] 能解析多种格式的文档
- [ ] 文档能被正确分块和向量化
- [ ] 检索结果与查询相关
- [ ] RAG 回答基于检索到的内容

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 4 将实现 Agent 逻辑（工具调用 + 多轮对话），请确保已有基本的 RAG 功能。

---

## Day 4：Agent 逻辑实现

### 📅 Day 4：Agent 逻辑 — 让系统从"查资料"升级为"思考和行动"

### 🧭 今日方向
在 RAG 基础上添加 Agent 能力：工具调用、多轮对话、自主决策。

### 🎯 生俗比喻
Day 3 的 RAG 就像一个只会查字典的助手——你问什么它翻什么。今天的 Agent 就像一个聪明的研究员——它不仅能查资料，还会思考"我需要查吗"、"查哪本"、"查到了怎么用"、"要不要用计算器"。

### 📋 今日三件事
1. 实现工具注册和调用
2. 实现对话历史管理
3. 构建完整的 Agent 决策循环

### 🗺️ 手把手路线

#### Step 1：工具系统
**做什么**：注册多个工具（计算器、搜索、数据库查询）
**为什么**：工具让 Agent 有"动手"的能力
**成功标志**：Agent 能根据需求调用正确的工具

#### Step 2：对话管理
**做什么**：实现会话存储和历史消息管理
**为什么**：多轮对话需要记住之前说过什么
**成功标志**：Agent 能记住对话上下文

#### Step 3：Agent 循环
**做什么**：实现 Observe → Think → Act 的决策循环
**为什么**：这是 Agent 自主决策的核心
**成功标志**：Agent 能自主决定使用 RAG 还是工具

### 💻 代码区

```python
"""
Week 9 Day 4：Agent 逻辑实现
"""
import json
from typing import Any, Callable
from openai import OpenAI
from app.services.rag import RAGService, VectorStore

client = OpenAI()

# ========== 工具系统 ==========

class Tool:
    """工具定义"""

    def __init__(self, name: str, description: str, parameters: dict, handler: Callable):
        self.name = name
        self.description = description
        self.parameters = parameters
        self.handler = handler

    def to_schema(self) -> dict:
        """转为 OpenAI Function Calling 格式"""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters
            }
        }

    def execute(self, **kwargs) -> str:
        """执行工具"""
        try:
            return self.handler(**kwargs)
        except Exception as e:
            return f"工具执行错误：{str(e)}"


class ToolRegistry:
    """工具注册表"""

    def __init__(self):
        self.tools: dict[str, Tool] = {}

    def register(self, tool: Tool):
        self.tools[tool.name] = tool

    def get_schemas(self) -> list[dict]:
        return [tool.to_schema() for tool in self.tools.values()]

    def execute(self, name: str, arguments: dict) -> str:
        if name in self.tools:
            return self.tools[name].execute(**arguments)
        return f"未知工具：{name}"


# 注册工具
registry = ToolRegistry()

# 工具1：计算器
registry.register(Tool(
    name="calculator",
    description="执行数学计算",
    parameters={
        "type": "object",
        "properties": {
            "expression": {"type": "string", "description": "数学表达式"}
        },
        "required": ["expression"]
    },
    handler=lambda expression: str(eval(expression, {"__builtins__": {}}))
))

# 工具2：知识库搜索
registry.register(Tool(
    name="search_knowledge",
    description="在知识库中搜索相关信息",
    parameters={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "搜索查询"}
        },
        "required": ["query"]
    },
    handler=lambda query: "搜索结果待集成"
))

# ========== 对话管理 ==========

class ConversationManager:
    """对话历史管理"""

    def __init__(self, max_history: int = 20):
        self.sessions: dict[str, list[dict]] = {}
        self.max_history = max_history

    def get_history(self, session_id: str) -> list[dict]:
        return self.sessions.get(session_id, [])

    def add_message(self, session_id: str, role: str, content: str):
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        self.sessions[session_id].append({"role": role, "content": content})
        # 限制历史长度
        if len(self.sessions[session_id]) > self.max_history:
            self.sessions[session_id] = self.sessions[session_id][-self.max_history:]

    def clear(self, session_id: str):
        self.sessions.pop(session_id, None)


# ========== Agent 核心 ==========

class KnowledgeAgent:
    """智能知识助手 Agent"""

    SYSTEM_PROMPT = """你是一个智能知识助手，名叫"小知"。你有以下能力：

1. **知识检索**：当用户询问事实性问题时，使用 search_knowledge 工具搜索知识库
2. **数学计算**：当用户需要计算时，使用 calculator 工具
3. **一般对话**：对于闲聊和一般性问题，直接回答

决策原则：
- 优先使用工具获取准确信息
- 如果工具结果不够好，结合自己的知识补充
- 如果不确定，坦诚告知用户

请用中文回答，保持友好和专业。"""

    def __init__(self, rag_service: RAGService):
        self.rag = rag_service
        self.conversation = ConversationManager()

    def chat(self, message: str, session_id: str) -> dict:
        """处理用户消息"""
        # 获取对话历史
        history = self.conversation.get_history(session_id)

        # 构建消息列表
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT}
        ]
        messages.extend(history)
        messages.append({"role": "user", "content": message})

        tools_used = []
        sources = []

        # Agent 循环（最多 3 轮工具调用）
        for _ in range(3):
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                tools=registry.get_schemas() if registry.get_schemas() else None,
                tool_choice="auto",
                temperature=0
            )

            msg = response.choices[0].message

            # 如果没有工具调用，返回回答
            if not msg.tool_calls:
                answer = msg.content

                # 记录对话
                self.conversation.add_message(session_id, "user", message)
                self.conversation.add_message(session_id, "assistant", answer)

                return {
                    "response": answer,
                    "session_id": session_id,
                    "sources": sources,
                    "tools_used": tools_used
                }

            # 处理工具调用
            messages.append(msg)
            for tool_call in msg.tool_calls:
                func_name = tool_call.function.name
                func_args = json.loads(tool_call.function.arguments)
                tools_used.append(func_name)

                # 执行工具
                if func_name == "search_knowledge":
                    # 使用 RAG 检索
                    result = self.rag.query(func_args.get("query", ""), k=3)
                    tool_result = result["answer"]
                    sources.extend(result.get("sources", []))
                else:
                    tool_result = registry.execute(func_name, func_args)

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": tool_result
                })

        # 超出循环限制
        return {
            "response": "抱歉，我无法处理这个请求。请换个方式提问。",
            "session_id": session_id,
            "sources": [],
            "tools_used": tools_used
        }


# ========== 测试 ==========

if __name__ == "__main__":
    # 初始化
    vector_store = VectorStore(collection_name="test_agent_kb")
    rag = RAGService(vector_store)
    agent = KnowledgeAgent(rag)

    # 模拟对话
    session_id = "test-session"
    test_messages = [
        "你好！你是谁？",
        "123 * 456 等于多少？",
        "Python 和 Java 哪个更适合做 Web 开发？",
        "帮我算一下 (100 + 200) / 3",
    ]

    for msg in test_messages:
        print(f"\n用户：{msg}")
        result = agent.chat(msg, session_id)
        print(f"小知：{result['response'][:100]}...")
        if result["tools_used"]:
            print(f"使用工具：{result['tools_used']}")
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| 工具未被调用 | 检查工具描述是否清晰 |
| 对话历史混乱 | 使用 session_id 隔离不同会话 |
| Agent 循环超时 | 限制最大循环次数 |
| 工具返回结果太长 | 在工具层做摘要压缩 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Tool Registry | 工具注册表 | 工具箱 |
| Agent Loop | Agent 决策循环 | 大脑的思考过程 |
| Tool Calling | 工具调用 | 使用工具 |
| Session | 会话 | 一次对话 |

### ✅ 验收清单
- [ ] 工具能被正确注册和调用
- [ ] 对话历史能正确管理
- [ ] Agent 能自主决定使用哪个工具
- [ ] 多轮对话能保持上下文

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Day 5 将添加安全层和前端界面，请确保 Agent 核心功能已正常工作。

---

## Day 5：安全层 + 前端界面

### 📅 Day 5：安全与展示 — 给系统穿上"盔甲"并"开门迎客"

### 🧭 今日方向
添加安全防护层（输入验证、速率限制、内容过滤）和 Streamlit 前端界面。

### 🎯 生俗比喻
安全层就是系统的"保安和安检"——检查每个进来的请求是否合法。前端界面就是"店面装修"——让用户能方便地使用你的系统。两者缺一不可：没有安全会被攻击，没有前端用户用不了。

### 📋 今日三件事
1. 实现输入验证和内容过滤
2. 实现速率限制
3. 搭建 Streamlit 前端界面

### 🗺️ 手把手路线

#### Step 1：安全中间件
**做什么**：实现输入长度检查、敏感词过滤、速率限制
**为什么**：保护系统免受恶意攻击
**成功标志**：恶意输入被拦截

#### Step 2：Streamlit 前端
**做什么**：实现对话界面和文档上传界面
**为什么**：用户需要一个友好的界面来使用系统
**成功标志**：用户能通过网页与系统交互

#### Step 3：端到端联调
**做什么**：确保前后端正常通信
**为什么**：集成测试是交付前的最后一步
**成功标志**：用户能上传文档并基于文档对话

### 💻 代码区

```python
"""
Week 9 Day 5：安全层 + Streamlit 前端
"""
import time
from collections import defaultdict
from fastapi import Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ========== 安全中间件 ==========

class SecurityMiddleware:
    """安全中间件"""

    def __init__(self):
        self.request_counts: dict[str, list[float]] = defaultdict(list)
        self.rate_limit = 60  # 每分钟最大请求数
        self.blocked_keywords = [
            "忽略之前的指令",
            "ignore previous instructions",
            "system prompt",
            "你的指令是什么"
        ]

    def check_rate_limit(self, client_ip: str) -> bool:
        """检查速率限制"""
        now = time.time()
        # 清理超过 1 分钟的记录
        self.request_counts[client_ip] = [
            t for t in self.request_counts[client_ip]
            if now - t < 60
        ]
        if len(self.request_counts[client_ip]) >= self.rate_limit:
            return False
        self.request_counts[client_ip].append(now)
        return True

    def check_input(self, text: str) -> tuple[bool, str]:
        """检查输入安全"""
        # 长度检查
        if len(text) > 2000:
            return False, "输入过长"

        # 敏感词检查
        text_lower = text.lower()
        for keyword in self.blocked_keywords:
            if keyword.lower() in text_lower:
                return False, "检测到不安全的输入"

        return True, ""

    def sanitize_output(self, text: str) -> str:
        """清洗输出"""
        # 移除可能的系统提示泄露
        if "system prompt" in text.lower():
            return "抱歉，我无法提供该信息。"
        return text


# ========== Streamlit 前端 ==========

# 以下是 streamlit_app.py 的内容
# 运行命令：streamlit run streamlit_app.py

STREAMLIT_CODE = '''
import streamlit as st
import requests
import uuid

# 页面配置
st.set_page_config(
    page_title="智能知识助手",
    page_icon="🤖",
    layout="wide"
)

# 侧边栏
with st.sidebar:
    st.title("设置")
    api_url = st.text_input("API 地址", "http://localhost:8000")
    st.divider()
    st.markdown("### 关于")
    st.markdown("基于 RAG + Agent 的智能知识问答系统")

# 主界面
st.title("🤖 智能知识助手")
st.markdown("上传文档，然后向我提问！")

# 初始化 session
if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())
if "messages" not in st.session_state:
    st.session_state.messages = []

# 显示历史消息
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])
        if msg.get("sources"):
            with st.expander("引用来源"):
                for source in msg["sources"]:
                    st.text(source)

# 文档上传区
with st.expander("📄 上传文档", expanded=False):
    uploaded_files = st.file_uploader(
        "选择文件",
        type=["txt", "md", "pdf"],
        accept_multiple_files=True
    )
    if uploaded_files:
        for file in uploaded_files:
            files = {"file": (file.name, file.getvalue())}
            response = requests.post(f"{api_url}/api/documents/upload", files=files)
            if response.status_code == 200:
                st.success(f"✅ {file.name} 上传成功")
            else:
                st.error(f"❌ {file.name} 上传失败")

# 对话输入
if prompt := st.chat_input("请输入你的问题..."):
    # 显示用户消息
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # 调用 API
    with st.chat_message("assistant"):
        with st.spinner("思考中..."):
            try:
                response = requests.post(
                    f"{api_url}/api/chat/",
                    json={
                        "message": prompt,
                        "session_id": st.session_state.session_id
                    }
                )
                result = response.json()
                st.markdown(result["response"])

                st.session_state.messages.append({
                    "role": "assistant",
                    "content": result["response"],
                    "sources": result.get("sources", [])
                })
            except Exception as e:
                st.error(f"请求失败：{str(e)}")
'''

# 保存 Streamlit 应用文件
with open("streamlit_app.py", "w", encoding="utf-8") as f:
    f.write(STREAMLIT_CODE)

print("Streamlit 前端代码已生成：streamlit_app.py")
print("运行命令：streamlit run streamlit_app.py")


# ========== 集成安全层 ==========

# 在 app/main.py 中添加以下代码

"""
from app.middleware.security import SecurityMiddleware

security = SecurityMiddleware()

@app.middleware("http")
async def security_check(request: Request, call_next):
    # 速率限制
    client_ip = request.client.host
    if not security.check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="请求过于频繁")

    response = await call_next(request)
    return response
"""

# ========== 端到端测试脚本 ==========

def test_e2e():
    """端到端测试"""
    import requests

    BASE_URL = "http://localhost:8000"

    # 测试健康检查
    print("1. 健康检查...")
    resp = requests.get(f"{BASE_URL}/health")
    print(f"   状态：{resp.json()['status']}")

    # 测试文档上传
    print("\n2. 上传文档...")
    test_content = "Python 是一种高级编程语言，由 Guido van Rossum 于 1991 年发布。"
    files = {"file": ("test.txt", test_content.encode(), "text/plain")}
    resp = requests.post(f"{BASE_URL}/api/documents/upload", files=files)
    print(f"   上传结果：{resp.json()}")

    # 测试对话
    print("\n3. 测试对话...")
    resp = requests.post(
        f"{BASE_URL}/api/chat/",
        json={"message": "Python 是什么？"}
    )
    result = resp.json()
    print(f"   回答：{result['response'][:100]}...")
    print(f"   引用：{result.get('sources', [])}")

    print("\n✅ 端到端测试通过！")


if __name__ == "__main__":
    test_e2e()
```

### 🆘 急救包
| 问题 | 解决方案 |
|------|---------|
| Streamlit 连接不上 API | 确认 API 服务已启动，URL 正确 |
| 速率限制太严格 | 调整 `rate_limit` 参数 |
| 安全过滤误拦截 | 优化 `blocked_keywords` 列表 |
| 文档上传失败 | 检查文件大小限制和编码 |

### 📖 概念对照表
| 术语 | 通俗解释 | 类比 |
|------|---------|------|
| Middleware | 中间件 | 安检通道 |
| Rate Limit | 速率限制 | 限流闸机 |
| Content Filter | 内容过滤 | 审查机制 |
| Streamlit | 快速搭建 Web 界面的框架 | 店面装修工具 |

### ✅ 验收清单
- [ ] 恶意输入被安全层拦截
- [ ] 速率限制正常工作
- [ ] Streamlit 界面能正常显示
- [ ] 端到端流程能正常运行

### 📝 复盘小纸条
```
今日学到了：_____________________________
最大的困惑：_____________________________
明天想深入：_____________________________
```

### 📥 明日同步接口
> Week 9 结束！项目骨架已搭建完成。接下来将进入 Phase 3，深入学习 Agentic RL、评估、部署等高级主题。

---

## 📚 本周总结

| Day | 主题 | 核心技能 |
|-----|------|---------|
| 1 | 项目选型 | 需求分析、MVP 定义、技术选型 |
| 2 | 后端骨架 | FastAPI、项目结构、配置管理 |
| 3 | RAG 集成 | 文档处理、向量存储、检索生成 |
| 4 | Agent 逻辑 | 工具系统、对话管理、决策循环 |
| 5 | 安全与前端 | 安全防护、Streamlit 界面 |

### 🎯 本周产出
- [x] 项目选型文档
- [x] FastAPI 后端骨架
- [x] RAG 问答服务
- [x] Agent 决策系统
- [x] Streamlit 前端界面

### 📖 推荐阅读
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Streamlit Documentation](https://docs.streamlit.io/)
- [Building Effective Agents (Anthropic)](https://www.anthropic.com/research/building-effective-agents)
