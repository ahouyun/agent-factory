# 🛠️ Day 5: LangSmith / Arize Phoenix 实践 — 专业级 LLM 可观测性

## 今日方向

> "工欲善其事，必先利其器。" -- 《论语》

今天我们来学习两个专业的 LLM 可观测性工具：LangSmith 和 Arize Phoenix。它们就像是 Agent 的"专业体检设备"，能帮你深入分析 Agent 的行为。

## 生活比喻

- **LangSmith** = 高端体检中心（全面的检查项目，详细的报告）
- **Arize Phoenix** = 专家会诊系统（多维度分析，发现潜在问题）

## 今日三件事

1. **设置 LangSmith 追踪**：配置和使用 LangSmith 跟踪 Agent 执行
2. **使用 Arize Phoenix**：部署和使用 Phoenix 进行 LLM 可观测性
3. **仪表化 Agent**：为 Agent 添加完整的追踪和监控

---

## 手把手路线

### 第一步：安装依赖

```bash
pip install langsmith arize-phoenix openinference-instrumentation-openai
```

### 第二步：设置 LangSmith

```python
# langsmith_setup.py
"""LangSmith 设置和使用"""

import os
import json
import time
import uuid
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class LangSmithRun:
    """LangSmith 运行记录"""
    run_id: str
    trace_id: str
    name: str
    run_type: str  # "chain", "llm", "tool"
    inputs: Dict[str, Any]
    outputs: Dict[str, Any] = field(default_factory=dict)
    error: str = ""
    start_time: str = ""
    end_time: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)
    tags: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "run_id": self.run_id, "trace_id": self.trace_id,
            "name": self.name, "run_type": self.run_type,
            "inputs": self.inputs, "outputs": self.outputs,
            "error": self.error, "start_time": self.start_time,
            "end_time": self.end_time, "metadata": self.metadata,
            "tags": self.tags,
        }


class LangSmithTracker:
    """LangSmith 追踪器"""

    def __init__(self, project_name: str = "default"):
        self.project_name = project_name
        self.runs: List[LangSmithRun] = []
        self._current_trace_id = None
        self._run_stack: List[LangSmithRun] = []

    def create_run(self, name: str, run_type: str = "chain",
                   inputs: Dict = None, metadata: Dict = None,
                   tags: List[str] = None) -> str:
        """创建新的运行"""
        run_id = str(uuid.uuid4())
        trace_id = self._current_trace_id or str(uuid.uuid4())
        if not self._current_trace_id:
            self._current_trace_id = trace_id

        run = LangSmithRun(
            run_id=run_id, trace_id=trace_id, name=name,
            run_type=run_type, inputs=inputs or {},
            start_time=datetime.now().isoformat(),
            metadata=metadata or {}, tags=tags or [],
        )
        self._run_stack.append(run)
        self.runs.append(run)
        return run_id

    def end_run(self, run_id: str, outputs: Dict = None, error: str = ""):
        """结束运行"""
        for run in self._run_stack:
            if run.run_id == run_id:
                run.end_time = datetime.now().isoformat()
                run.outputs = outputs or {}
                run.error = error
                self._run_stack.remove(run)
                break

    def log_llm_call(self, model: str, prompt: str, completion: str,
                     tokens_used: int = 0, latency: float = 0):
        """记录 LLM 调用"""
        run_id = self.create_run(
            name=f"LLM Call ({model})",
            run_type="llm",
            inputs={"model": model, "prompt": prompt[:200]},
            outputs={"completion": completion[:200], "tokens_used": tokens_used},
            metadata={"latency": latency, "model": model},
        )
        self.end_run(run_id)
        return run_id

    def get_trace(self, trace_id: str = None) -> List[Dict]:
        """获取追踪"""
        if trace_id:
            runs = [r for r in self.runs if r.trace_id == trace_id]
        else:
            runs = self.runs
        return [r.to_dict() for r in runs]

    def get_project_runs(self) -> List[Dict]:
        """获取项目的所有运行"""
        return [r.to_dict() for r in self.runs]

    def export_to_langsmith_format(self, filepath: str):
        """导出为 LangSmith 格式"""
        data = {
            "project": self.project_name,
            "runs": self.get_project_runs(),
            "export_time": datetime.now().isoformat(),
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"LangSmith 数据已导出到: {filepath}")


# 模拟 LangSmith 客户端
class LangSmithClient:
    """模拟 LangSmith 客户端"""

    def __init__(self, api_key: str = None, project_name: str = "default"):
        self.api_key = api_key
        self.project_name = project_name
        self.tracker = LangSmithTracker(project_name)
        print(f"LangSmith 客户端初始化完成 (项目: {project_name})")

    def create_run(self, **kwargs) -> str:
        return self.tracker.create_run(**kwargs)

    def update_run(self, run_id: str, **kwargs):
        self.tracker.end_run(run_id, **kwargs)

    def get_runs(self) -> List[Dict]:
        return self.tracker.get_project_runs()


def setup_langsmith():
    """设置 LangSmith 环境变量"""
    # 实际使用时需要设置真实的 API Key
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_API_KEY"] = "your-api-key-here"
    os.environ["LANGCHAIN_PROJECT"] = "agent-evaluation"
    print("LangSmith 环境变量已设置")
    print("注意: 实际使用时需要替换为真实的 API Key")


if __name__ == "__main__":
    print("LangSmith 设置和使用示例")
    print("=" * 60)

    setup_langsmith()

    # 创建追踪器
    tracker = LangSmithTracker("my-agent-project")

    # 模拟 Agent 执行
    run_id = tracker.create_run(
        name="agent_query",
        run_type="chain",
        inputs={"query": "什么是机器学习？"},
        tags=["research", "ai"],
    )

    # 模拟 LLM 调用
    tracker.log_llm_call(
        model="gpt-4",
        prompt="什么是机器学习？",
        completion="机器学习是人工智能的一个分支...",
        tokens_used=150,
        latency=0.8,
    )

    # 结束运行
    tracker.end_run(run_id, outputs={"response": "机器学习是..."})

    # 查看结果
    print("\n追踪结果:")
    for run in tracker.get_project_runs():
        print(f"  {run['name']} ({run['run_type']}): {run.get('start_time', 'N/A')}")

    tracker.export_to_langsmith_format("langsmith_export.json")
```

### 第三步：使用 Arize Phoenix

```python
# phoenix_setup.py
"""Arize Phoenix 设置和使用"""

import json
import time
import uuid
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class TraceSpan:
    """Phoenix 追踪跨度"""
    span_id: str
    trace_id: str
    name: str
    span_type: str  # "CHAIN", "LLM", "RETRIEVER", "TOOL"
    start_time: str
    end_time: str = ""
    status: str = "UNSET"  # "OK", "ERROR", "UNSET"
    attributes: Dict[str, Any] = field(default_factory=dict)
    events: List[Dict] = field(default_factory=list)
    parent_span_id: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "span_id": self.span_id, "trace_id": self.trace_id,
            "name": self.name, "span_type": self.span_type,
            "start_time": self.start_time, "end_time": self.end_time,
            "status": self.status, "attributes": self.attributes,
            "parent_span_id": self.parent_span_id,
        }


class PhoenixTracker:
    """Arize Phoenix 追踪器"""

    def __init__(self, project_name: str = "default"):
        self.project_name = project_name
        self.spans: List[TraceSpan] = []
        self._span_stack: List[TraceSpan] = []

    def start_span(self, name: str, span_type: str = "CHAIN",
                   attributes: Dict = None) -> str:
        """开始新的跨度"""
        span_id = str(uuid.uuid4())[:8]
        trace_id = self._span_stack[0].trace_id if self._span_stack else str(uuid.uuid4())[:8]

        parent_id = self._span_stack[-1].span_id if self._span_stack else None

        span = TraceSpan(
            span_id=span_id, trace_id=trace_id, name=name,
            span_type=span_type,
            start_time=datetime.now().isoformat(),
            attributes=attributes or {}, parent_span_id=parent_id,
        )
        self._span_stack.append(span)
        self.spans.append(span)
        return span_id

    def end_span(self, span_id: str, status: str = "OK", attributes: Dict = None):
        """结束跨度"""
        for span in reversed(self._span_stack):
            if span.span_id == span_id:
                span.end_time = datetime.now().isoformat()
                span.status = status
                if attributes:
                    span.attributes.update(attributes)
                self._span_stack.remove(span)
                break

    def record_llm_call(self, model: str, prompt: str, completion: str,
                        tokens: Dict = None):
        """记录 LLM 调用"""
        span_id = self.start_span(f"LLM ({model})", "LLM", {
            "model": model, "prompt": prompt[:100],
        })
        self.end_span(span_id, "OK", {
            "completion": completion[:100],
            "tokens": tokens or {},
        })
        return span_id

    def record_retrieval(self, query: str, documents: List[str]):
        """记录检索调用"""
        span_id = self.start_span("Retriever", "RETRIEVER", {
            "query": query, "document_count": len(documents),
        })
        self.end_span(span_id, "OK", {
            "documents": [d[:50] for d in documents[:5]],
        })
        return span_id

    def get_trace(self, trace_id: str) -> List[Dict]:
        """获取追踪"""
        spans = [s for s in self.spans if s.trace_id == trace_id]
        return [s.to_dict() for s in spans]

    def get_all_traces(self) -> Dict[str, List[Dict]]:
        """获取所有追踪"""
        traces = {}
        for span in self.spans:
            if span.trace_id not in traces:
                traces[span.trace_id] = []
            traces[span.trace_id].append(span.to_dict())
        return traces

    def export_traces(self, filepath: str):
        """导出追踪数据"""
        data = {
            "project": self.project_name,
            "traces": self.get_all_traces(),
            "total_spans": len(self.spans),
            "export_time": datetime.now().isoformat(),
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Phoenix 数据已导出到: {filepath}")


# 模拟 Phoenix 客户端
class PhoenixClient:
    """模拟 Phoenix 客户端"""

    def __init__(self, endpoint: str = "http://localhost:6006"):
        self.endpoint = endpoint
        self.tracker = PhoenixTracker()
        print(f"Phoenix 客户端初始化完成 (端点: {endpoint})")

    def launch_app(self):
        print(f"Phoenix 应用已启动: {self.endpoint}")

    def get_tracker(self) -> PhoenixTracker:
        return self.tracker


if __name__ == "__main__":
    print("Arize Phoenix 设置和使用示例")
    print("=" * 60)

    # 创建 Phoenix 客户端
    phoenix = PhoenixClient()
    phoenix.launch_app()

    tracker = phoenix.get_tracker()

    # 模拟 Agent 执行
    trace_id = None

    # 1. 开始追踪
    root_id = tracker.start_span("Agent Query", "CHAIN", {"query": "什么是RAG？"})
    trace_id = tracker.spans[-1].trace_id

    # 2. 记录检索
    tracker.record_retrieval(
        query="什么是RAG？",
        documents=["RAG是检索增强生成的缩写...", "RAG结合了检索和生成..."],
    )

    # 3. 记录 LLM 调用
    tracker.record_llm_call(
        model="gpt-4",
        prompt="根据以下文档回答问题：...",
        completion="RAG（检索增强生成）是一种...",
        tokens={"input": 200, "output": 150},
    )

    # 4. 结束追踪
    tracker.end_span(root_id, "OK", {"response_length": 350})

    # 查看结果
    print("\n追踪结果:")
    for span in tracker.get_trace(trace_id):
        print(f"  [{span['span_type']}] {span['name']}: {span['status']}")

    tracker.export_traces("phoenix_traces.json")
```

### 第四步：完整仪表化 Agent

```python
# instrumented_agent.py
"""完整仪表化的 Agent"""

import json
import time
import uuid
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime


class InstrumentedAgent:
    """带有完整可观测性的 Agent"""

    def __init__(self, name: str = "my-agent"):
        self.name = name
        self.traces = []
        self.metrics = {"total_queries": 0, "success": 0, "errors": 0}

    def query(self, user_input: str) -> Dict:
        """处理用户查询（带追踪）"""
        trace_id = str(uuid.uuid4())[:8]
        start_time = time.time()

        # 记录开始
        self.metrics["total_queries"] += 1
        trace = {
            "trace_id": trace_id, "start_time": datetime.now().isoformat(),
            "query": user_input, "spans": [], "status": "running",
        }

        try:
            # 步骤 1: 解析输入
            span1 = self._trace_span(trace_id, "parse_input", "输入解析")
            parsed = self._parse_input(user_input)
            self._end_span(span1, {"parsed_tokens": len(parsed.split())})

            # 步骤 2: 检索相关信息
            span2 = self._trace_span(trace_id, "retrieve", "信息检索")
            docs = self._retrieve_docs(user_input)
            self._end_span(span2, {"doc_count": len(docs)})

            # 步骤 3: 生成回答
            span3 = self._trace_span(trace_id, "generate", "回答生成")
            response = self._generate_response(user_input, docs)
            self._end_span(span3, {"response_length": len(response)})

            # 记录成功
            self.metrics["success"] += 1
            trace["status"] = "success"
            trace["response"] = response

        except Exception as e:
            self.metrics["errors"] += 1
            trace["status"] = "error"
            trace["error"] = str(e)
            response = f"处理错误: {e}"

        trace["end_time"] = datetime.now().isoformat()
        trace["latency_ms"] = round((time.time() - start_time) * 1000, 2)
        self.traces.append(trace)

        return {
            "response": response, "trace_id": trace_id,
            "latency_ms": trace["latency_ms"],
        }

    def _parse_input(self, text: str) -> str:
        """解析输入"""
        time.sleep(0.02)
        return text.strip().lower()

    def _retrieve_docs(self, query: str) -> List[str]:
        """检索文档"""
        time.sleep(0.05)
        return [f"文档1: 关于 {query[:10]}...", f"文档2: 相关信息..."]

    def _generate_response(self, query: str, docs: List[str]) -> str:
        """生成回答"""
        time.sleep(0.1)
        return f"根据文档分析，关于'{query[:20]}'的回答是..."

    def _trace_span(self, trace_id: str, span_type: str, name: str) -> Dict:
        """创建追踪跨度"""
        span = {
            "span_id": str(uuid.uuid4())[:8],
            "trace_id": trace_id, "type": span_type,
            "name": name, "start_time": datetime.now().isoformat(),
        }
        self.traces[-1]["spans"].append(span)
        return span

    def _end_span(self, span: Dict, attributes: Dict = None):
        """结束追踪跨度"""
        span["end_time"] = datetime.now().isoformat()
        if attributes:
            span["attributes"] = attributes

    def get_metrics(self) -> Dict:
        """获取指标"""
        return self.metrics.copy()

    def get_trace(self, trace_id: str) -> Optional[Dict]:
        """获取追踪"""
        for trace in self.traces:
            if trace["trace_id"] == trace_id:
                return trace
        return None

    def export_all(self, filepath: str):
        """导出所有数据"""
        data = {
            "agent": self.name,
            "metrics": self.metrics,
            "traces": self.traces,
            "export_time": datetime.now().isoformat(),
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"数据已导出到: {filepath}")


if __name__ == "__main__":
    print("完整仪表化 Agent 示例")
    print("=" * 60)

    agent = InstrumentedAgent("demo-agent")

    # 运行测试查询
    queries = [
        "什么是机器学习？",
        "Python如何读取文件？",
        "解释一下Docker",
    ]

    for query in queries:
        result = agent.query(query)
        print(f"\n查询: {query}")
        print(f"回答: {result['response'][:50]}...")
        print(f"延迟: {result['latency_ms']}ms")
        print(f"追踪ID: {result['trace_id']}")

    # 查看指标
    print("\n" + "=" * 60)
    print("Agent 指标:")
    print(json.dumps(agent.get_metrics(), indent=2))

    # 导出数据
    agent.export_all("agent_traces.json")
```

---

## 预期输出

### 运行 LangSmith 设置

```bash
python langsmith_setup.py
```

```
LangSmith 设置和使用示例
============================================================
LangSmith 环境变量已设置
注意: 实际使用时需要替换为真实的 API Key

追踪结果:
  agent_query (chain): 2026-06-04T10:30:00
  LLM Call (gpt-4) (llm): 2026-06-04T10:30:00
LangSmith 数据已导出到: langsmith_export.json
```

### 运行 Phoenix 设置

```bash
python phoenix_setup.py
```

```
Arize Phoenix 设置和使用示例
============================================================
Phoenix 客户端初始化完成 (端点: http://localhost:6006)
Phoenix 应用已启动

追踪结果:
  [CHAIN] Agent Query: OK
  [RETRIEVER] Retriever: OK
  [LLM] LLM (gpt-4): OK
Phoenix 数据已导出到: phoenix_traces.json
```

### 运行仪表化 Agent

```bash
python instrumented_agent.py
```

```
完整仪表化 Agent 示例
============================================================

查询: 什么是机器学习？
回答: 根据文档分析，关于'什么是机器学习？'的回答是...
延迟: 170.23ms
追踪ID: a1b2c3d4

查询: Python如何读取文件？
回答: 根据文档分析，关于'Python如何读取文件？'的回答是...
延迟: 170.15ms
追踪ID: e5f6g7h8

Agent 指标:
{
  "total_queries": 3,
  "success": 3,
  "errors": 0
}
```

---

## 常见错误及解决方案

### 错误 1: LangSmith API Key 未设置

```
Error: LANGCHAIN_API_KEY not set
```

**解决方案：**

```python
import os
os.environ["LANGCHAIN_API_KEY"] = "your-real-api-key"
```

### 错误 2: Phoenix 端口被占用

```
OSError: [Errno 98] Address already in use
```

**解决方案：** 更换端口或停止占用进程。

### 错误 3: 追踪数据过大

**解决方案：** 限制追踪数量或实现采样。

---

## 每日挑战

### 挑战 1: 集成真实 LangSmith

使用真实的 LangSmith API 追踪你的 Agent。

### 挑战 2: 部署 Phoenix 仪表板

在本地部署 Phoenix 并可视化追踪数据。

### 挑战 3: 创建自定义仪表板

基于追踪数据创建自定义的监控仪表板。

---

## 今日小结

今天我们学习了专业的 LLM 可观测性工具：

1. **LangSmith**：LangChain 的官方追踪平台
2. **Arize Phoenix**：开源的 LLM 可观测性工具
3. **完整仪表化**：为 Agent 添加追踪、指标、日志

**工具对比：**

| 特性 | LangSmith | Arize Phoenix |
|------|-----------|---------------|
| 类型 | 商业平台 | 开源工具 |
| 部署 | 云服务 | 本地/云 |
| 功能 | 追踪、评估、监控 | 追踪、分析、可视化 |
| 适用 | LangChain 项目 | 任何 LLM 项目 |

---

*明天见！我们将学习如何用评估结果驱动迭代优化。*
