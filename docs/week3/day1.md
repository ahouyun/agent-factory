# 📅 Week 3 Day 1：NLP 基础 + 文本表示演进

## 🧭 今日方向
> 今天我们将进入 LLM 基础学习，从 NLP 的基本概念开始，了解文本表示方法的演进历程。

## 🎯 生活比喻
> 如果把语言比作音乐，那么文本表示就是乐谱。从简单的简谱（One-Hot）到复杂的交响乐谱（Embedding），我们见证了"记谱法"的进步。

## 📋 今日三件事
1. 了解 NLP 的基本概念和应用
2. 学习文本表示的演进历程
3. 理解词向量和 Embedding 的原理

## 🗺️ 手把手路线

### Step 1: NLP 基础
- **做什么**: 了解自然语言处理的定义、任务和应用
- **为什么**: NLP 是大模型的技术基础
- **成功标志**: 能列举 5 个 NLP 应用场景

### Step 2: 文本表示方法
- **做什么**: 学习 One-Hot、TF-IDF、词向量等方法
- **为什么**: 理解文本如何被计算机处理
- **成功标志**: 能解释不同文本表示方法的优缺点

### Step 3: Embedding 原理
- **做什么**: 深入理解词嵌入和句子嵌入
- **为什么**: Embedding 是现代 NLP 的核心
- **成功标志**: 能使用预训练模型生成 Embedding

## 💻 代码区

```python
# NLP 基础概念

from typing import List, Dict
from collections import Counter

# 1. 文本预处理基础
def basic_text_preprocessing(text: str) -> Dict[str, any]:
    """
    基础文本预处理
    
    Args:
        text: 原始文本
        
    Returns:
        预处理结果
    """
    # 转小写
    text_lower = text.lower()
    
    # 简单分词（中文按字分，英文按空格分）
    if any('一' <= char <= '鿿' for char in text):
        # 中文文本
        tokens = list(text)  # 按字分
    else:
        # 英文文本
        tokens = text_lower.split()
    
    # 去除标点
    tokens = [token for token in tokens if token.isalnum()]
    
    return {
        "original": text,
        "lowercase": text_lower,
        "tokens": tokens,
        "token_count": len(tokens),
        "unique_tokens": list(set(tokens))
    }

# 2. 词频统计
def word_frequency_analysis(texts: List[str]) -> Dict[str, int]:
    """
    词频分析
    
    Args:
        texts: 文本列表
        
    Returns:
        词频统计
    """
    all_words = []
    for text in texts:
        # 简单分词
        words = text.lower().split()
        all_words.extend(words)
    
    # 统计词频
    word_freq = Counter(all_words)
    
    return dict(word_freq.most_common(10))

# 使用示例
if __name__ == "__main__":
    # 文本预处理示例
    sample_text = "自然语言处理是人工智能的重要方向！"
    result = basic_text_preprocessing(sample_text)
    print("文本预处理结果:")
    for key, value in result.items():
        print(f"  {key}: {value}")
    
    # 词频分析示例
    texts = [
        "人工智能改变世界",
        "机器学习是人工智能的分支",
        "深度学习推动人工智能发展"
    ]
    freq = word_frequency_analysis(texts)
    print("\n词频统计:")
    for word, count in freq.items():
        print(f"  {word}: {count}")
```

```python
# 文本表示方法演进

import numpy as np
from typing import List, Dict
from collections import defaultdict

# 1. One-Hot 编码
class OneHotEncoder:
    """One-Hot 编码器"""
    
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
    
    def encode(self, text: str) -> np.ndarray:
        """编码文本"""
        tokens = text.split()
        encoding = np.zeros((len(tokens), self.vocab_size))
        
        for i, token in enumerate(tokens):
            if token in self.vocab:
                encoding[i, self.vocab[token]] = 1
        
        return encoding

# 2. TF-IDF 实现
class TFIDFVectorizer:
    """TF-IDF 向量化器"""
    
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

# 3. 词向量（简化版 Word2Vec）
class SimpleWord2Vec:
    """简化版 Word2Vec"""
    
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

# 使用示例
if __name__ == "__main__":
    # One-Hot 编码示例
    print("=== One-Hot 编码 ===")
    texts = ["我 爱 学习", "学习 很 快乐", "我 爱 编程"]
    
    onehot = OneHotEncoder()
    onehot.fit(texts)
    
    for text in texts:
        encoding = onehot.encode(text)
        print(f"文本: {text}")
        print(f"编码形状: {encoding.shape}")
        print(f"非零元素: {np.count_nonzero(encoding)}")
        print()
    
    # TF-IDF 示例
    print("=== TF-IDF ===")
    tfidf = TFIDFVectorizer()
    tfidf.fit(texts)
    
    tfidf_matrix = tfidf.transform(texts)
    print(f"TF-IDF 矩阵形状: {tfidf_matrix.shape}")
    print(f"词汇表大小: {len(tfidf.vocab)}")
    
    # 词向量示例
    print("\n=== 词向量（简化版） ===")
    w2v = SimpleWord2Vec(vector_size=50)
    w2v.train(texts)
    
    print(f"词向量维度: {w2v.vector_size}")
    print(f"词汇表大小: {len(w2v.word_vectors)}")
    
    # 计算相似度
    if "学习" in w2v.word_vectors and "编程" in w2v.word_vectors:
        sim = w2v.similarity("学习", "编程")
        print(f"'学习' 和 '编程' 的相似度: {sim:.4f}")
```

```python
# 使用预训练模型生成 Embedding

from typing import List, Optional
import numpy as np

# 注意：需要安装 sentence-transformers
# pip install sentence-transformers

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
            print(f"✅ 成功加载模型: {model_name}")
        except ImportError:
            print("⚠️ sentence-transformers 未安装，使用模拟模式")
        except Exception as e:
            print(f"⚠️ 模型加载失败: {e}，使用模拟模式")
    
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
        """
        计算两个文本的相似度
        
        Args:
            text1: 文本1
            text2: 文本2
            
        Returns:
            相似度分数
        """
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
        """
        查找相似文本
        
        Args:
            query: 查询文本
            texts: 候选文本列表
            top_k: 返回前 k 个结果
            
        Returns:
            相似文本列表
        """
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
    print("=== Embedding 生成器 ===")
    
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

## 🆘 急救包
| # | 症状 | 解法 |
|---|------|------|
| 1 | 中文分词问题 | 使用 jieba 等专业分词工具 |
| 2 | 内存不足 | 使用小规模模型或降采样 |
| 3 | 模型下载失败 | 使用本地模型或模拟模式 |
| 4 | 向量维度不匹配 | 检查模型输出维度，统一处理 |

## 📖 概念对照表
| 术语 | 一句话解释 |
|------|-----------|
| NLP | 自然语言处理，让计算机理解人类语言 |
| Token | 文本的基本单位（词、字、子词） |
| One-Hot | 用稀疏向量表示词汇的方法 |
| TF-IDF | 词频-逆文档频率，衡量词的重要性 |
| Word2Vec | 将词映射为稠密向量的方法 |
| Embedding | 将离散对象映射为连续向量 |
| 余弦相似度 | 衡量两个向量方向相似性的指标 |

## ✅ 验收清单
- [ ] 理解 NLP 的基本概念
- [ ] 能解释不同文本表示方法的原理
- [ ] 理解 Embedding 的作用
- [ ] 能使用预训练模型生成 Embedding

## 📝 复盘小纸条
- 今天最大的收获: ...
- 还不太确定的: ...

## 📥 明日同步接口
- 今日完成度: ...
- 卡点描述: ...
- 代码是否能跑通: ...
- 明天希望: ...
