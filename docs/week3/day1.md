# Day 1: NLP 基础 + 文本表示演进

## 今日学习目标

1. 了解 NLP 的基本概念和应用
2. 学习文本表示的演进历程
3. 理解词向量和 Embedding 的原理
4. 动手实现简单的文本表示方法
5. 理解现代 NLP 的核心概念

---

## 第一部分：什么是 NLP？

### NLP 定义

**类比理解：**
NLP（自然语言处理）就像教计算机学外语：
- 计算机原本只懂 0 和 1
- NLP 让计算机能够"理解"人类语言
- 就像你学英语一样，计算机也需要学习语言的规律

### NLP 应用场景

```
日常应用：
├── 搜索引擎（理解搜索意图）
├── 语音助手（Siri、小爱同学）
├── 机器翻译（Google 翻译）
├── 情感分析（评论分析）
├── 文本摘要（新闻摘要）
├── 问答系统（智能客服）
├── 代码生成（GitHub Copilot）
└── 对话系统（ChatGPT）
```

### NLP 处理流程

```
原始文本
    ↓
预处理（分词、去停用词）
    ↓
文本表示（向量化）
    ↓
模型处理（特征提取、分类）
    ↓
输出结果
```

---

## 第二部分：文本预处理

### 文件：app/nlp/preprocessing.py

```python
"""
文本预处理工具
"""

import re
from typing import List, Dict
from collections import Counter


class TextPreprocessor:
    """文本预处理器"""
    
    def __init__(self):
        # 中文标点符号
        self.chinese_punctuation = set('，。！？、；：""''（）【】《》…—')
        # 英文标点符号
        self.english_punctuation = set('.,!?;:\'"()[]{}')
        # 停用词（简化版）
        self.stopwords = set(['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'])
    
    def clean_text(self, text: str) -> str:
        """清洗文本"""
        # 去除 HTML 标签
        text = re.sub(r'<[^>]+>', '', text)
        # 去除 URL
        text = re.sub(r'http\S+|www.\S+', '', text)
        # 去除多余空白
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def tokenize_chinese(self, text: str) -> List[str]:
        """
        中文分词（简化版）
        
        实际应用中应该使用 jieba 等专业分词工具
        """
        # 简单按字分（实际应用应该用 jieba）
        tokens = []
        current_word = []
        
        for char in text:
            if '一' <= char <= '鿿':  # 中文字符
                if current_word:
                    tokens.append(''.join(current_word))
                    current_word = []
                tokens.append(char)
            elif char.isalnum():  # 英文或数字
                current_word.append(char)
            else:
                if current_word:
                    tokens.append(''.join(current_word))
                    current_word = []
        
        if current_word:
            tokens.append(''.join(current_word))
        
        return tokens
    
    def tokenize_english(self, text: str) -> List[str]:
        """英文分词"""
        # 转小写
        text = text.lower()
        # 分词
        tokens = text.split()
        # 去除标点
        tokens = [token.strip(self.english_punctuation) for token in tokens]
        # 去除空字符串
        tokens = [token for token in tokens if token]
        return tokens
    
    def remove_stopwords(self, tokens: List[str]) -> List[str]:
        """去除停用词"""
        return [token for token in tokens if token not in self.stopwords]
    
    def preprocess(self, text: str, language: str = "chinese") -> Dict:
        """
        完整的预处理流程
        
        Args:
            text: 原始文本
            language: 语言（chinese/english）
        
        Returns:
            预处理结果
        """
        # 清洗文本
        cleaned_text = self.clean_text(text)
        
        # 分词
        if language == "chinese":
            tokens = self.tokenize_chinese(cleaned_text)
        else:
            tokens = self.tokenize_english(cleaned_text)
        
        # 去除停用词
        filtered_tokens = self.remove_stopwords(tokens)
        
        return {
            "original": text,
            "cleaned": cleaned_text,
            "tokens": tokens,
            "filtered_tokens": filtered_tokens,
            "token_count": len(tokens),
            "unique_tokens": list(set(tokens))
        }


# 使用示例
if __name__ == "__main__":
    preprocessor = TextPreprocessor()
    
    # 中文示例
    chinese_text = "自然语言处理是人工智能的重要方向！"
    result = preprocessor.preprocess(chinese_text, "chinese")
    
    print("=== 中文预处理 ===")
    print(f"原始文本: {result['original']}")
    print(f"清洗后: {result['cleaned']}")
    print(f"分词结果: {result['tokens']}")
    print(f"去停用词后: {result['filtered_tokens']}")
    print(f"词数: {result['token_count']}")
    
    # 英文示例
    english_text = "Natural Language Processing is an important direction of AI!"
    result = preprocessor.preprocess(english_text, "english")
    
    print("\n=== 英文预处理 ===")
    print(f"原始文本: {result['original']}")
    print(f"分词结果: {result['tokens']}")
    print(f"去停用词后: {result['filtered_tokens']}")
```

---

## 第三部分：文本表示方法

### 文件：app/nlp/representations.py

```python
"""
文本表示方法
"""

import numpy as np
from typing import List, Dict
from collections import defaultdict


class OneHotEncoder:
    """
    One-Hot 编码器
    
    原理：每个词用一个稀疏向量表示，向量长度等于词表大小，
    只有对应词的位置为 1，其他位置为 0
    
    优点：简单直观
    缺点：维度灾难，无法表示词之间的关系
    """
    
    def __init__(self):
        self.vocab = {}
        self.vocab_size = 0
    
    def fit(self, texts: List[str]):
        """构建词表"""
        words = set()
        for text in texts:
            words.update(text.split())
        
        self.vocab = {word: idx for idx, word in enumerate(sorted(words))}
        self.vocab_size = len(self.vocab)
        
        print(f"词表大小: {self.vocab_size}")
        print(f"词表: {list(self.vocab.keys())[:10]}...")
    
    def encode(self, text: str) -> np.ndarray:
        """编码文本"""
        tokens = text.split()
        encoding = np.zeros((len(tokens), self.vocab_size))
        
        for i, token in enumerate(tokens):
            if token in self.vocab:
                encoding[i, self.vocab[token]] = 1
        
        return encoding
    
    def decode(self, encoding: np.ndarray) -> List[str]:
        """解码向量"""
        tokens = []
        for i in range(encoding.shape[0]):
            idx = np.argmax(encoding[i])
            for word, word_idx in self.vocab.items():
                if word_idx == idx:
                    tokens.append(word)
                    break
        return tokens


class TFIDFVectorizer:
    """
    TF-IDF 向量化器
    
    TF (Term Frequency): 词频，一个词在文档中出现的频率
    IDF (Inverse Document Frequency): 逆文档频率，一个词在所有文档中的稀有程度
    
    TF-IDF = TF × IDF
    
    优点：考虑了词的重要性
    缺点：无法捕获语义信息
    """
    
    def __init__(self):
        self.vocab = {}
        self.idf = {}
    
    def fit(self, texts: List[str]):
        """计算 IDF 值"""
        # 构建词表
        all_words = set()
        for text in texts:
            all_words.update(text.split())
        
        self.vocab = {word: idx for idx, word in enumerate(sorted(all_words))}
        
        # 计算 IDF
        n_docs = len(texts)
        word_doc_count = defaultdict(int)
        
        for text in texts:
            unique_words = set(text.split())
            for word in unique_words:
                word_doc_count[word] += 1
        
        # IDF = log(N / (df + 1))
        for word in self.vocab:
            df = word_doc_count.get(word, 0)
            self.idf[word] = np.log(n_docs / (df + 1))
    
    def transform(self, texts: List[str]) -> np.ndarray:
        """转换文本为 TF-IDF 向量"""
        n_docs = len(texts)
        n_features = len(self.vocab)
        
        tfidf_matrix = np.zeros((n_docs, n_features))
        
        for i, text in enumerate(texts):
            words = text.split()
            word_count = len(words)
            
            # 计算 TF
            tf = defaultdict(int)
            for word in words:
                if word in self.vocab:
                    tf[word] += 1
            
            # 计算 TF-IDF
            for word, count in tf.items():
                if word in self.vocab:
                    tf_value = count / word_count
                    tfidf_matrix[i, self.vocab[word]] = tf_value * self.idf[word]
        
        return tfidf_matrix


class SimpleWord2Vec:
    """
    简化版 Word2Vec
    
    原理：将词映射为稠密向量，语义相似的词在向量空间中距离相近
    
    优点：捕获语义信息，维度较低
    缺点：需要大量训练数据
    """
    
    def __init__(self, vector_size: int = 100, window_size: int = 2):
        self.vector_size = vector_size
        self.window_size = window_size
        self.word_vectors = {}
    
    def train(self, texts: List[str]):
        """训练词向量（简化版：随机初始化）"""
        # 收集所有词汇
        vocab = set()
        for text in texts:
            vocab.update(text.split())
        
        # 随机初始化词向量
        np.random.seed(42)
        for word in vocab:
            self.word_vectors[word] = np.random.randn(self.vector_size)
            # 归一化
            self.word_vectors[word] /= np.linalg.norm(self.word_vectors[word])
        
        print(f"词向量训练完成，词表大小: {len(vocab)}")
    
    def get_vector(self, word: str) -> np.ndarray:
        """获取词向量"""
        return self.word_vectors.get(word, np.zeros(self.vector_size))
    
    def similarity(self, word1: str, word2: str) -> float:
        """计算词相似度"""
        vec1 = self.get_vector(word1)
        vec2 = self.get_vector(word2)
        
        # 余弦相似度
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
    
    def most_similar(self, word: str, top_k: int = 5) -> List[tuple]:
        """查找最相似的词"""
        if word not in self.word_vectors:
            return []
        
        similarities = []
        for other_word, vector in self.word_vectors.items():
            if other_word != word:
                sim = self.similarity(word, other_word)
                similarities.append((other_word, sim))
        
        # 按相似度排序
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        return similarities[:top_k]


# 使用示例
if __name__ == "__main__":
    # 测试数据
    texts = [
        "我 爱 学习",
        "学习 很 快乐",
        "我 爱 编程",
        "编程 是 艺术"
    ]
    
    print("=== One-Hot 编码 ===")
    onehot = OneHotEncoder()
    onehot.fit(texts)
    
    for text in texts:
        encoding = onehot.encode(text)
        print(f"文本: {text}")
        print(f"编码形状: {encoding.shape}")
        print(f"非零元素: {np.count_nonzero(encoding)}")
        print()
    
    print("=== TF-IDF ===")
    tfidf = TFIDFVectorizer()
    tfidf.fit(texts)
    
    tfidf_matrix = tfidf.transform(texts)
    print(f"TF-IDF 矩阵形状: {tfidf_matrix.shape}")
    print(f"词汇表大小: {len(tfidf.vocab)}")
    print(f"词汇表: {list(tfidf.vocab.keys())}")
    
    print("\n=== Word2Vec（简化版）===")
    w2v = SimpleWord2Vec(vector_size=50)
    w2v.train(texts)
    
    print(f"词向量维度: {w2v.vector_size}")
    print(f"词汇表大小: {len(w2v.word_vectors)}")
    
    # 计算相似度
    if "学习" in w2v.word_vectors and "编程" in w2v.word_vectors:
        sim = w2v.similarity("学习", "编程")
        print(f"'学习' 和 '编程' 的相似度: {sim:.4f}")
    
    # 查找相似词
    if "学习" in w2v.word_vectors:
        similar = w2v.most_similar("学习", top_k=3)
        print(f"与 '学习' 最相似的词: {similar}")
```

---

## 第四部分：Embedding 原理

### 什么是 Embedding？

**类比理解：**
Embedding 就像给每个词一个"GPS 坐标"：
- 每个词在向量空间中有一个位置
- 语义相似的词，位置相近
- 可以通过坐标计算距离（相似度）

### Embedding 演进

```
文本表示方法演进：
    
One-Hot (1950s)
    ↓ 稀疏，无法表示语义
TF-IDF (1970s)
    ↓ 考虑词的重要性
Word2Vec (2013)
    ↓ 捕获语义信息
GloVe (2014)
    ↓ 全局统计信息
BERT Embedding (2018)
    ↓ 上下文相关
Transformer Embedding (2017-)
    ↓ 现代 NLP 的基础
LLM Embedding (2020-)
    → 强大的语言理解
```

### 文件：app/nlp/embeddings.py

```python
"""
Embedding 生成器
"""

import numpy as np
from typing import List, Optional


class EmbeddingGenerator:
    """Embedding 生成器"""
    
    def __init__(self, model_name: str = "paraphrase-multilingual-MiniLM-L12-v2"):
        """
        初始化 Embedding 生成器
        
        Args:
            model_name: 预训练模型名称
        """
        self.model_name = model_name
        self.model = None
        
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(model_name)
            print(f"成功加载模型: {model_name}")
        except ImportError:
            print("sentence-transformers 未安装，使用模拟模式")
        except Exception as e:
            print(f"模型加载失败: {e}，使用模拟模式")
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        生成文本 Embedding
        
        Args:
            texts: 文本列表
        
        Returns:
            Embedding 矩阵
        """
        if self.model:
            # 使用真实模型
            return self.model.encode(texts, show_progress_bar=False)
        else:
            # 模拟模式
            return np.random.randn(len(texts), 384)
    
    def compute_similarity(self, text1: str, text2: str) -> float:
        """计算两个文本的相似度"""
        embeddings = self.generate_embeddings([text1, text2])
        
        # 余弦相似度
        dot_product = np.dot(embeddings[0], embeddings[1])
        norm1 = np.linalg.norm(embeddings[0])
        norm2 = np.linalg.norm(embeddings[1])
        
        return dot_product / (norm1 * norm2)
    
    def find_similar_texts(
        self,
        query: str,
        texts: List[str],
        top_k: int = 3
    ) -> List[dict]:
        """查找相似文本"""
        all_texts = [query] + texts
        embeddings = self.generate_embeddings(all_texts)
        
        query_embedding = embeddings[0]
        text_embeddings = embeddings[1:]
        
        # 计算相似度
        similarities = []
        for i, text_emb in enumerate(text_embeddings):
            sim = np.dot(query_embedding, text_emb) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(text_emb)
            )
            similarities.append({"text": texts[i], "similarity": float(sim)})
        
        # 按相似度排序
        similarities.sort(key=lambda x: x["similarity"], reverse=True)
        
        return similarities[:top_k]


# 使用示例
if __name__ == "__main__":
    print("=== Embedding 生成器 ===\n")
    
    generator = EmbeddingGenerator()
    
    # 生成 Embedding
    texts = [
        "今天天气很好",
        "我喜欢编程",
        "机器学习很有趣",
        "深度学习是人工智能的分支"
    ]
    
    embeddings = generator.generate_embeddings(texts)
    print(f"生成 {len(embeddings)} 个 Embedding")
    print(f"每个 Embedding 维度: {embeddings.shape[1]}")
    
    # 计算相似度
    print("\n=== 文本相似度 ===")
    sim = generator.compute_similarity("我喜欢编程", "编程很有趣")
    print(f"'我喜欢编程' 和 '编程很有趣' 的相似度: {sim:.4f}")
    
    # 查找相似文本
    print("\n=== 相似文本查找 ===")
    query = "人工智能技术"
    candidates = [
        "机器学习是AI的重要部分",
        "今天天气不错",
        "深度学习推动了AI发展",
        "Python是编程语言"
    ]
    
    results = generator.find_similar_texts(query, candidates, top_k=2)
    print(f"查询: {query}")
    for result in results:
        print(f"  - {result['text']} (相似度: {result['similarity']:.4f})")
```

---

## 第五部分：可视化

### 文件：app/nlp/visualization.py

```python
"""
NLP 可视化工具
"""

import numpy as np
from typing import List


def visualize_onehot(texts: List[str], vocab: dict):
    """可视化 One-Hot 编码"""
    print("=== One-Hot 编码可视化 ===\n")
    
    # 打印词表
    print("词表:")
    for word, idx in vocab.items():
        print(f"  {word}: {idx}")
    print()
    
    # 打印编码
    for text in texts:
        tokens = text.split()
        print(f"文本: {text}")
        print("编码:")
        for token in tokens:
            if token in vocab:
                encoding = [0] * len(vocab)
                encoding[vocab[token]] = 1
                print(f"  {token}: {encoding}")
        print()


def visualize_tfidf(tfidf_matrix: np.ndarray, vocab: dict, texts: List[str]):
    """可视化 TF-IDF"""
    print("=== TF-IDF 可视化 ===\n")
    
    vocab_list = sorted(vocab.keys())
    
    # 打印表头
    print("文本".ljust(20), end="")
    for word in vocab_list[:10]:
        print(f"{word:>8}", end="")
    print()
    print("-" * 100)
    
    # 打印每行
    for i, text in enumerate(texts):
        print(text[:18].ljust(20), end="")
        for j in range(min(10, len(vocab_list))):
            value = tfidf_matrix[i, vocab[vocab_list[j]]]
            print(f"{value:>8.3f}", end="")
        print()


def visualize_attention(words: List[str], attention_weights: np.ndarray):
    """可视化注意力权重"""
    print("=== 注意力权重可视化 ===\n")
    
    # 打印表头
    print("     ", end="")
    for word in words:
        print(f"{word:>8}", end="")
    print()
    print("-" * (8 * len(words) + 6))
    
    # 打印每行
    for i, word in enumerate(words):
        print(f"{word:>4} |", end="")
        for j in range(len(words)):
            weight = attention_weights[i, j]
            # 用星号表示权重大小
            stars = int(weight * 20)
            print(f"{'*' * stars:>8}", end="")
        print()
    
    print("\n注: 星号越多表示注意力权重越大")


def print_embedding_info(embeddings: np.ndarray, texts: List[str]):
    """打印 Embedding 信息"""
    print("=== Embedding 信息 ===\n")
    
    print(f"Embedding 数量: {len(embeddings)}")
    print(f"Embedding 维度: {embeddings.shape[1]}")
    print()
    
    for i, text in enumerate(texts):
        print(f"文本 {i+1}: {text}")
        print(f"  维度: {embeddings[i].shape}")
        print(f"  均值: {embeddings[i].mean():.4f}")
        print(f"  标准差: {embeddings[i].std():.4f}")
        print()


# 使用示例
if __name__ == "__main__":
    # One-Hot 可视化
    texts = ["我 爱 学习", "学习 很 快乐"]
    vocab = {"我": 0, "爱": 1, "学习": 2, "很": 3, "快乐": 4}
    visualize_onehot(texts, vocab)
    
    # TF-IDF 可视化
    tfidf_matrix = np.random.rand(2, 5)
    visualize_tfidf(tfidf_matrix, vocab, texts)
    
    # 注意力可视化
    words = ["我", "喜欢", "编程"]
    attention = np.random.rand(3, 3)
    attention = attention / attention.sum(axis=-1, keepdims=True)
    visualize_attention(words, attention)
```

---

## 验证清单

完成今日学习后，检查以下项目：

- [ ] 理解 NLP 的基本概念
- [ ] 能解释文本预处理的步骤
- [ ] 理解 One-Hot 编码的原理
- [ ] 理解 TF-IDF 的原理
- [ ] 理解 Word2Vec 的原理
- [ ] 理解 Embedding 的作用
- [ ] 能使用预训练模型生成 Embedding
- [ ] 完成了可视化练习

---

## 今日小结

| 概念 | 关键点 |
|------|--------|
| NLP | 自然语言处理，让计算机理解人类语言 |
| 分词 | 将文本切分成词语 |
| One-Hot | 稀疏向量表示，无法表示语义 |
| TF-IDF | 考虑词的重要性，基于统计 |
| Word2Vec | 稠密向量，捕获语义信息 |
| Embedding | 将离散对象映射为连续向量 |
| 余弦相似度 | 衡量两个向量方向相似性的指标 |

---

## 明日预告

明天我们将学习：
- Transformer 架构
- 自注意力机制
- 位置编码
- 多头注意力

---

## 参考资源

- [NLP 入门教程](https://nlp.stanford.edu/)
- [Word2Vec 原论文](https://arxiv.org/abs/1301.3781)
- [Embedding 可视化](https://projector.tensorflow.org/)
