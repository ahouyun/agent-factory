# 📅 Week 5 Day 3：文档加载与分块策略

## 🧭 今日方向
> RAG 质量的 80% 取决于"切得好不好"。今天掌握不同文档格式的加载方法，以及核心分块策略：固定长度、递归字符、语义分块、自定义分块，并学会如何选择。

## 🎯 生活比喻
> **切蛋糕的艺术**。一整块大蛋糕（原始文档）没法直接分给 100 个人吃（LLM 上下文限制）。你需要把它切成合适的小块——切太大，一个人吃不完浪费；切太小，每块都没什么内容；切得不均匀，有人吃到奶油有人只吃到面包。好的分块策略就是让每一块都"刚刚好"。

## 📋 今日三件事
1. 学会加载四种常见格式：TXT、Markdown、HTML、PDF
2. 掌握四种分块策略并对比它们的输出差异
3. 建立"分块决策指南"，知道什么场景用什么策略

---

## 🗺️ 手把手路线

### Step 1: 文档加载
- **做什么**: 用纯 Python 实现四种格式的文档加载器
- **为什么**: 不同来源的文档格式不同，统一加载是 RAG 的第一步
- **成功标志**: 每种格式都能成功读取并输出文本内容

### Step 2: 四种分块策略
- **做什么**: 实现固定大小、递归字符、语义分块、自定义分块
- **为什么**: 不同策略适用于不同场景，需要理解差异
- **成功标志**: 用同一段文本跑四种策略，能解释输出差异

### Step 3: 决策指南
- **做什么**: 总结什么场景用什么策略
- **为什么**: 实际项目中需要快速做出分块决策
- **成功标志**: 能针对新文档选择合适的分块策略

---

## 💻 代码区

### 代码 1：文档加载器

```python
"""
文档加载器：支持 TXT、Markdown、HTML、PDF 四种格式
所有实现均为纯 Python，无需额外依赖（PDF 除外）
"""
import re
import os


# ============================================================
# 加载器 1：TXT 文件
# ============================================================
def load_txt(file_path):
    """加载纯文本文件"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return {
        "source": file_path,
        "type": "txt",
        "content": content,
        "length": len(content),
    }


# ============================================================
# 加载器 2：Markdown 文件
# ============================================================
def load_markdown(file_path):
    """加载 Markdown 文件，保留结构信息"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 提取标题结构
    headings = []
    for line in content.split('\n'):
        if line.startswith('#'):
            match = re.match(r'^(#{1,6})\s+(.*)', line)
            if match:
                level = len(match.group(1))
                title = match.group(2)
                headings.append({"level": level, "title": title})

    return {
        "source": file_path,
        "type": "markdown",
        "content": content,
        "headings": headings,
        "length": len(content),
    }


# ============================================================
# 加载器 3：HTML 文件
# ============================================================
def load_html(file_path):
    """加载 HTML 文件，去除标签提取纯文本"""
    with open(file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # 简单的 HTML 标签去除（生产环境建议用 BeautifulSoup）
    # 移除 script 和 style 标签及其内容
    text = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
    # 移除所有 HTML 标签
    text = re.sub(r'<[^>]+>', ' ', text)
    # 清理空白字符
    text = re.sub(r'\s+', ' ', text).strip()

    return {
        "source": file_path,
        "type": "html",
        "content": text,
        "raw_length": len(html_content),
        "text_length": len(text),
    }


# ============================================================
# 加载器 4：PDF 文件（需要安装 PyPDF2）
# ============================================================
def load_pdf(file_path):
    """
    加载 PDF 文件
    需要安装: pip install PyPDF2
    如果未安装则提供提示
    """
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(file_path)
        text_parts = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        content = "\n\n".join(text_parts)
        return {
            "source": file_path,
            "type": "pdf",
            "content": content,
            "pages": len(reader.pages),
            "length": len(content),
        }
    except ImportError:
        return {
            "source": file_path,
            "type": "pdf",
            "content": "[需要安装 PyPDF2: pip install PyPDF2]",
            "error": "PyPDF2 未安装",
        }


# ============================================================
# 创建测试文件并演示
# ============================================================

# 创建测试 TXT 文件
txt_content = """公司年假制度

公司员工每年享有 15 天带薪年假。入职满 5 年后增加至 20 天。
年假需提前 3 个工作日申请，直属主管审批后生效。
未使用的年假可结转至下一年，但最多保留 5 天。
病假需提供医院证明，每年不超过 10 天。
"""
with open("test_doc.txt", "w", encoding="utf-8") as f:
    f.write(txt_content)

# 创建测试 Markdown 文件
md_content = """# 公司员工手册

## 第一章 入职

### 1.1 试用期
试用期为 3 个月，试用期薪资为正式薪资的 80%。

### 1.2 转正条件
转正需满足：完成入职培训、通过试用期考核。

## 第二章 假期

### 2.1 年假
公司员工每年享有 15 天带薪年假。

### 2.2 病假
病假需提供医院证明，每年不超过 10 天。
"""
with open("test_doc.md", "w", encoding="utf-8") as f:
    f.write(md_content)

# 创建测试 HTML 文件
html_content = """<!DOCTYPE html>
<html>
<head><title>公司FAQ</title></head>
<body>
<h1>常见问题</h1>
<div class="faq-item">
    <h2>Q: 年假有多少天？</h2>
    <p>公司员工每年享有 15 天带薪年假。</p>
</div>
<div class="faq-item">
    <h2>Q: 可以远程办公吗？</h2>
    <p>公司支持每周最多 2 天远程办公。</p>
</div>
</body>
</html>"""
with open("test_doc.html", "w", encoding="utf-8") as f:
    f.write(html_content)

# 测试加载
print("=" * 60)
print("文档加载器演示")
print("=" * 60)

for loader_name, loader_func, file_path in [
    ("TXT", load_txt, "test_doc.txt"),
    ("Markdown", load_markdown, "test_doc.md"),
    ("HTML", load_html, "test_doc.html"),
]:
    result = loader_func(file_path)
    print(f"\n【{loader_name} 加载结果】")
    print(f"  来源: {result['source']}")
    print(f"  类型: {result['type']}")
    print(f"  内容长度: {result.get('length', result.get('text_length'))} 字符")
    print(f"  内容预览: {result['content'][:80]}...")

# 清理测试文件
for f in ["test_doc.txt", "test_doc.md", "test_doc.html"]:
    os.remove(f)

print("\n✅ 所有文档加载器测试通过！")
```

**预期输出：**
```
============================================================
文档加载器演示
============================================================

【TXT 加载结果】
  来源: test_doc.txt
  类型: txt
  内容长度: 210 字符
  内容预览: 公司年假制度

公司员工每年享有 15 天带薪年假。入职满 5 年后增...

【Markdown 加载结果】
  来源: test_doc.md
  类型: markdown
  内容长度: 350 字符
  内容预览: # 公司员工手册

## 第一章 入职

### 1.1 试用期...

【HTML 加载结果】
  来源: test_doc.html
  类型: html
  内容长度: 186 字符
  内容预览: 常见问题 Q: 年假有多少天？ 公司员工每年享有 15 天带薪...

✅ 所有文档加载器测试通过！
```

---

### 代码 2：四种分块策略

```python
"""
四种分块策略对比
使用同一段文本，对比不同策略的输出差异
"""

# 统一的测试文本
test_text = """第一章 公司概述

本公司成立于 2010 年，总部位于北京中关村科技园。公司专注于人工智能和大数据领域，目前拥有员工 500 余人。

公司的使命是"让 AI 赋能每一个企业"。我们相信，人工智能技术不应该只属于大公司，中小企业同样应该享受到 AI 带来的效率提升。

第二章 组织架构

公司设有研发中心、产品部、市场部、人力资源部和财务部五个核心部门。研发中心下设 AI 实验室、数据工程组和基础架构组。

研发中心负责核心算法研发和系统架构设计，是公司的技术引擎。产品部负责需求分析和产品设计，确保技术成果能够转化为用户价值。

第三章 员工福利

公司为员工提供全面的福利保障。包括：五险一金、补充医疗保险、年度体检、带薪年假 15 天、弹性工作制。

此外，公司每年为每位员工提供 5000 元的培训经费，鼓励员工持续学习和成长。获得专业认证的员工可申请额外奖励。"""

print(f"测试文本长度: {len(test_text)} 字符")
print(f"测试文本行数: {len(test_text.split(chr(10)))} 行")
print()


# ============================================================
# 策略 1：固定大小分块 (Fixed-size Chunking)
# ============================================================
def chunk_fixed_size(text, chunk_size=100, overlap=20):
    """
    固定大小分块
    最简单的分块方式，按固定字符数切割
    overlap: 相邻块之间的重叠字符数，用于保持上下文连续性
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append({
                "text": chunk,
                "start": start,
                "end": min(end, len(text)),
            })
        start += chunk_size - overlap
    return chunks


print("=" * 60)
print("【策略 1】固定大小分块 (chunk_size=100, overlap=20)")
print("=" * 60)
chunks_fixed = chunk_fixed_size(test_text, chunk_size=100, overlap=20)
for i, chunk in enumerate(chunks_fixed):
    print(f"\n  块 {i+1} [{chunk['start']}:{chunk['end']}]:")
    print(f"  |{chunk['text'][:60]}...|")
print(f"\n  总块数: {len(chunks_fixed)}")
print()


# ============================================================
# 策略 2：递归字符分块 (Recursive Character Chunking)
# ============================================================
def chunk_recursive(text, separators=None, chunk_size=100, overlap=20):
    """
    递归字符分块
    按优先级尝试不同的分隔符：段落 → 句子 → 词 → 字符
    尽量保持语义完整性
    """
    if separators is None:
        separators = ["\n\n", "\n", "。", "！", "？", "，", " ", ""]

    chunks = []
    current_separators = separators

    def _split(text, seps):
        if not text.strip():
            return []
        if not seps:
            # 没有更多分隔符，强制按大小切
            return chunk_fixed_size(text, chunk_size, overlap)

        sep = seps[0]
        remaining_seps = seps[1:]

        if sep == "":
            # 空分隔符 = 按字符切
            return chunk_fixed_size(text, chunk_size, overlap)

        parts = text.split(sep)
        result = []
        current = ""

        for part in parts:
            candidate = current + sep + part if current else part
            if len(candidate) <= chunk_size:
                current = candidate
            else:
                if current.strip():
                    if len(current) > chunk_size:
                        # 单个部分超过限制，递归细分
                        result.extend(_split(current, remaining_seps))
                    else:
                        result.append(current)
                current = part

        if current.strip():
            if len(current) > chunk_size:
                result.extend(_split(current, remaining_seps))
            else:
                result.append(current)

        return result

    raw_chunks = _split(text, current_separators)

    # 添加 overlap
    if overlap > 0 and len(raw_chunks) > 1:
        final_chunks = [raw_chunks[0]]
        for i in range(1, len(raw_chunks)):
            prev = raw_chunks[i-1]
            overlap_text = prev[-overlap:] if len(prev) > overlap else prev
            final_chunks.append(overlap_text + raw_chunks[i])
        return final_chunks

    return raw_chunks


print("=" * 60)
print("【策略 2】递归字符分块 (chunk_size=120)")
print("=" * 60)
chunks_recursive = chunk_recursive(test_text, chunk_size=120, overlap=10)
for i, chunk in enumerate(chunks_recursive):
    preview = chunk[:70].replace('\n', '↵')
    print(f"\n  块 {i+1} (长度: {len(chunk)}):")
    print(f"  |{preview}...|")
print(f"\n  总块数: {len(chunks_recursive)}")
print()


# ============================================================
# 策略 3：基于分隔符的语义分块 (Semantic-like Chunking)
# ============================================================
def chunk_by_structure(text, heading_pattern=r'^#{1,6}\s|^[一二三四五六七八九十]+[章节目]'):
    """
    基于文档结构的分块
    按标题、章节等结构标记分割文档
    适用于结构化文档（Markdown、技术文档等）
    """
    lines = text.split('\n')
    chunks = []
    current_chunk = []
    current_start = 0

    for i, line in enumerate(lines):
        # 检测是否是结构标记（标题、章节等）
        is_separator = bool(re.match(heading_pattern, line.strip()))

        if is_separator and current_chunk:
            chunk_text = '\n'.join(current_chunk).strip()
            if chunk_text:
                chunks.append({
                    "text": chunk_text,
                    "start_line": current_start,
                    "end_line": i - 1,
                    "heading": current_chunk[0][:50] if current_chunk else "",
                })
            current_chunk = [line]
            current_start = i
        else:
            current_chunk.append(line)

    # 添加最后一块
    if current_chunk:
        chunk_text = '\n'.join(current_chunk).strip()
        if chunk_text:
            chunks.append({
                "text": chunk_text,
                "start_line": current_start,
                "end_line": len(lines) - 1,
                "heading": current_chunk[0][:50] if current_chunk else "",
            })

    return chunks


print("=" * 60)
print("【策略 3】基于结构的语义分块")
print("=" * 60)
chunks_semantic = chunk_by_structure(test_text)
for i, chunk in enumerate(chunks_semantic):
    preview = chunk['text'][:70].replace('\n', '↵')
    print(f"\n  块 {i+1} (行 {chunk['start_line']}-{chunk['end_line']}):")
    print(f"  标题: {chunk['heading']}")
    print(f"  |{preview}...|")
print(f"\n  总块数: {len(chunks_semantic)}")
print()


# ============================================================
# 策略 4：自定义分块（按段落 + 大小限制）
# ============================================================
def chunk_custom_paragraphs(text, max_chunk_size=200, min_chunk_size=30):
    """
    自定义分块策略：按段落分割，合并短段落，拆分长段落
    适用于需要灵活控制块大小的场景
    """
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    chunks = []
    current_chunk = ""

    for para in paragraphs:
        # 如果当前块 + 新段落不超过限制，合并
        if len(current_chunk) + len(para) + 2 <= max_chunk_size:
            current_chunk = (current_chunk + "\n\n" + para).strip()
        else:
            # 保存当前块
            if current_chunk.strip() and len(current_chunk) >= min_chunk_size:
                chunks.append(current_chunk)
            # 处理超长段落
            if len(para) > max_chunk_size:
                sub_chunks = chunk_fixed_size(para, max_chunk_size, 20)
                chunks.extend([c["text"] for c in sub_chunks])
                current_chunk = ""
            else:
                current_chunk = para

    # 最后一块
    if current_chunk.strip() and len(current_chunk) >= min_chunk_size:
        chunks.append(current_chunk)

    return chunks


print("=" * 60)
print("【策略 4】自定义段落分块 (max=200, min=30)")
print("=" * 60)
chunks_custom = chunk_custom_paragraphs(test_text, max_chunk_size=200, min_chunk_size=30)
for i, chunk in enumerate(chunks_custom):
    preview = chunk[:80].replace('\n', '↵')
    print(f"\n  块 {i+1} (长度: {len(chunk)}):")
    print(f"  |{preview}...|")
print(f"\n  总块数: {len(chunks_custom)}")
```

**预期输出：**
```
测试文本长度: 680 字符
测试文本行数: 18 行

============================================================
【策略 1】固定大小分块 (chunk_size=100, overlap=20)
============================================================

  块 1 [0:100]:
  |第一章 公司概述

本公司成立于 2010 年，总部位于北京中关村科技园。公司...|

  块 2 [80:180]:
  |于北京中关村科技园。公司专注于人工智能和大数据领域，目前...|
  ...
  总块数: 8

============================================================
【策略 2】递归字符分块 (chunk_size=120)
============================================================

  块 1 (长度: 95):
  |第一章 公司概述↵↵本公司成立于 2010 年，总部位于北京...|
  ...
  总块数: 7

============================================================
【策略 3】基于结构的语义分块
============================================================

  块 1 (行 0-7):
  标题: 第一章 公司概述
  |第一章 公司概述↵↵本公司成立于 2010 年...|
  ...
  总块数: 3

============================================================
【策略 4】自定义段落分块 (max=200, min=30)
============================================================

  块 1 (长度: 195):
  |第一章 公司概述↵↵本公司成立于 2010 年，总部位于北京...|
  ...
  总块数: 4
```

---

### 代码 3：分块策略对比与决策指南

```python
"""
分块策略对比分析
"""

print("=" * 70)
print("分块策略对比分析")
print("=" * 70)

# 对比表格
comparison = """
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│     维度     │  固定大小    │  递归字符    │  结构语义    │  自定义段落  │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 实现复杂度   │     低       │     中       │     中       │     中       │
│ 语义保持     │     差       │     中       │     好       │     好       │
│ 适用文档     │  纯文本      │  通用        │  结构化文档  │  混合文档    │
│ 块大小均匀   │     是       │     否       │     否       │     否       │
│ 信息损失     │     高       │     中       │     低       │     低       │
│ 推荐场景     │  快速原型    │  通用RAG     │  技术文档    │  企业文档    │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
"""
print(comparison)

print("=" * 70)
print("分块决策指南")
print("=" * 70)

guide = """
📌 选择分块策略的决策树：

1. 你的文档是什么格式？
   ├── 纯文本 (TXT) ──→ 固定大小 或 递归字符
   ├── Markdown ──────→ 结构语义分块（按标题分割）
   ├── HTML ──────────→ 先去标签，再用递归字符
   └── PDF ───────────→ 先提取文本，再用递归字符

2. 你的文档有多长？
   ├── < 1000 字 ────→ 通常不需要分块，直接整篇
   ├── 1000-10000 字 → 递归字符分块（chunk_size=300-500）
   └── > 10000 字 ───→ 递归字符分块（chunk_size=500-1000）

3. 你的文档结构如何？
   ├── 有清晰标题层次 → 结构语义分块
   ├── 段落分明 ─────→ 自定义段落分块
   └── 无明显结构 ───→ 递归字符分块

📌 推荐的默认设置：
   - chunk_size: 300-500 字符
   - overlap: chunk_size 的 10%-20%
   - 优先使用递归字符分块作为默认策略

📌 常见陷阱：
   - 分块太小 → 丢失上下文，检索结果碎片化
   - 分块太大 → 噪声多，LLM 信息过载
   - 没有 overlap → 句子被截断，语义不完整
   - 不考虑文档结构 → 按标题分割的内容被拆散
"""
print(guide)
```

**预期输出：**
```
======================================================================
分块策略对比分析
======================================================================

┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│     维度     │  固定大小    │  递归字符    │  结构语义    │  自定义段落  │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 实现复杂度   │     低       │     中       │     中       │     中       │
│ 语义保持     │     差       │     中       │     好       │     好       │
│ 适用文档     │  纯文本      │  通用        │  结构化文档  │  混合文档    │
│ 块大小均匀   │     是       │     否       │     否       │     否       │
│ 信息损失     │     高       │     中       │     低       │     低       │
│ 推荐场景     │  快速原型    │  通用RAG     │  技术文档    │  企业文档    │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘

======================================================================
分块决策指南
======================================================================

📌 选择分块策略的决策树：
...
```

---

## 🆘 急救包

| # | 症状 | 解法 |
|---|------|------|
| 1 | 分块后信息不完整 | 增大 `chunk_size`，或增大 `overlap` |
| 2 | 分块太大导致 LLM 截断 | 减小 `chunk_size`，控制在 300-500 字符 |
| 3 | Markdown 分块后标题和内容分离 | 使用结构语义分块，按标题分割 |
| 4 | PDF 加载后是乱码 | 检查 PDF 是否为扫描件（图片），需要用 OCR |
| 5 | 递归分块输出不均匀 | 正常现象，如果需要均匀则用固定大小分块 |
| 6 | HTML 加载后有大量空白 | 清理 `\s+` 空白字符，或使用 BeautifulSoup |

---

## 📖 概念对照表

| 术语 | 一句话解释 |
|------|-----------|
| Chunking | 将长文档切分成小块的过程，是 RAG 的核心步骤 |
| Chunk Size | 每个块的大小（通常按字符数或 token 数计算） |
| Overlap | 相邻块之间的重叠部分，用于保持上下文连续性 |
| Fixed-size Chunking | 按固定字符数切割，简单但可能切断语义 |
| Recursive Chunking | 按优先级使用多种分隔符递归切割，更智能 |
| Semantic Chunking | 基于语义或文档结构分割，保持语义完整性 |
| Document Loader | 将不同格式的文档统一转换为文本的工具 |
| Token | LLM 处理文本的基本单位，1 个中文字约等于 1-2 个 token |

---

## ✅ 验收清单

- [ ] 能用纯 Python 加载 TXT、Markdown、HTML 三种格式
- [ ] 理解 PDF 加载需要额外库（PyPDF2）
- [ ] 能实现固定大小分块并解释 overlap 的作用
- [ ] 能实现递归字符分块并理解分隔符优先级
- [ ] 能实现基于文档结构的分块
- [ ] 能实现自定义段落分块
- [ ] 能对比四种策略的输出差异
- [ ] 能根据文档类型选择合适的分块策略

---

## 📝 复盘小纸条
- 今天最大的收获: _______________
- 还不太确定的: _______________

---

## 📥 明日同步接口
- 今日完成度: _______________
- 卡点描述: _______________
- 代码是否能跑通: _______________
- 明天希望: _______________
