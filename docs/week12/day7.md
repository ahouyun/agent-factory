# 📅 Day 7 - Week 12 复盘：生产部署总结

> **Week 12 . 生产部署** | **日期**: 2026-06-21

---

## 今日方向

今天我们对 Week 12 的生产部署内容进行全面复盘。回顾 Docker 容器化、CI/CD、模型 Fallback、成本优化、限流熔断和监控告警六大模块，梳理知识体系，总结最佳实践，制定改进计划。

---

## 生活比喻

> 复盘就像**飞行员的航后分析**。每次飞行结束后，飞行员都会回顾飞行数据：哪些操作完美，哪些可以改进，哪些需要警惕。即使安全着陆，也不会忽略任何异常数据。学习也是一样，复盘是提升的关键环节。

---

## 今日三件事

1. **回顾本周知识点** -- 画出知识图谱，标注掌握程度
2. **整理问题清单** -- 梳理遇到的问题和解决方案
3. **制定生产部署清单** -- 可直接复用的上线检查表

---

## 手把手路线

### 阶段一：知识回顾

```
Day 1: Docker 容器化 + Docker Compose + 密钥管理
       核心: 多阶段 Dockerfile、compose 编排、Docker secrets

Day 2: CI/CD with GitHub Actions
       核心: 工作流编写、矩阵测试、Docker 缓存、自动部署

Day 3: Model Fallback + vLLM
       核心: 多供应商降级、健康检查、本地推理部署

Day 4: Cost optimization + Prompt caching
       核心: Token 计数、智能路由、语义缓存

Day 5: Rate limiting/circuit breaker + Sandbox
       核心: 令牌桶限流、三状态熔断、沙箱隔离执行

Day 6: Monitoring and alerting
       核心: Prometheus 指标、Grafana 仪表盘、告警规则
```

### 阶段二：问题梳理

### 阶段三：知识图谱

### 阶段四：生产部署清单

---

## 代码区

### 1. 知识图谱生成器

```python
# review/knowledge_graph.py
"""Week 12 知识图谱"""
from dataclasses import dataclass, field
from typing import Dict, List
from enum import Enum


class MasteryLevel(Enum):
    """掌握程度"""
    LEARNING = "learning"     # 学习中
    FAMILIAR = "familiar"     # 熟悉
    MASTERED = "mastered"     # 精通


@dataclass
class KnowledgeNode:
    """知识节点"""
    name: str
    description: str
    day: int
    importance: str  # high / medium / low
    mastery: MasteryLevel
    connections: List[str] = field(default_factory=list)
    key_takeaway: str = ""


class KnowledgeGraph:
    """知识图谱"""

    def __init__(self):
        self.nodes: Dict[str, KnowledgeNode] = {}

    def add_node(self, node: KnowledgeNode):
        self.nodes[node.name] = node

    def add_connection(self, from_name: str, to_name: str):
        if from_name in self.nodes:
            self.nodes[from_name].connections.append(to_name)
        if to_name in self.nodes:
            self.nodes[to_name].connections.append(from_name)

    def get_by_day(self, day: int) -> List[KnowledgeNode]:
        return [n for n in self.nodes.values() if n.day == day]

    def get_weak_areas(self) -> List[KnowledgeNode]:
        return [n for n in self.nodes.values() if n.mastery == MasteryLevel.LEARNING]

    def get_strong_areas(self) -> List[KnowledgeNode]:
        return [n for n in self.nodes.values() if n.mastery == MasteryLevel.MASTERED]

    def visualize(self) -> str:
        """可视化知识图谱"""
        day_names = {
            1: "Docker 容器化",
            2: "CI/CD 流水线",
            3: "模型 Fallback",
            4: "成本优化",
            5: "限流熔断",
            6: "监控告警",
            7: "复盘总结",
        }

        status_icons = {
            MasteryLevel.LEARNING: "[学习中]",
            MasteryLevel.FAMILIAR: "[熟悉]",
            MasteryLevel.MASTERED: "[精通]",
        }

        graph = "=" * 60 + "\n"
        graph += "Week 12 知识图谱\n"
        graph += "=" * 60 + "\n\n"

        for day in range(1, 8):
            nodes = self.get_by_day(day)
            if nodes:
                graph += f"Day {day}: {day_names.get(day, '')}\n"
                graph += "-" * 40 + "\n"
                for node in nodes:
                    icon = status_icons[node.mastery]
                    graph += f"  {icon} {node.name}\n"
                    graph += f"        {node.description}\n"
                    if node.key_takeaway:
                        graph += f"        >> {node.key_takeaway}\n"
                    if node.connections:
                        graph += f"        -> 关联: {', '.join(node.connections[:3])}\n"
                graph += "\n"

        return graph


def create_week12_graph() -> KnowledgeGraph:
    """创建 Week 12 知识图谱"""
    graph = KnowledgeGraph()

    # Day 1: Docker 容器化
    graph.add_node(KnowledgeNode(
        "Docker", "容器化技术基础", 1, "high", MasteryLevel.FAMILIAR,
        ["Docker Compose", "Dockerfile"], "镜像只读，容器可写"
    ))
    graph.add_node(KnowledgeNode(
        "Dockerfile", "镜像构建脚本", 1, "high", MasteryLevel.FAMILIAR,
        ["多阶段构建"], "多阶段构建减小镜像体积"
    ))
    graph.add_node(KnowledgeNode(
        "Docker Compose", "多容器编排", 1, "high", MasteryLevel.FAMILIAR,
        ["Docker", "网络", "卷"], "声明式定义服务拓扑"
    ))
    graph.add_node(KnowledgeNode(
        "Docker Secrets", "密钥管理", 1, "high", MasteryLevel.FAMILIAR,
        [".env"], "永远不要把密钥写入镜像"
    ))

    # Day 2: CI/CD
    graph.add_node(KnowledgeNode(
        "GitHub Actions", "CI/CD 自动化平台", 2, "high", MasteryLevel.FAMILIAR,
        ["工作流", "矩阵测试"], "YAML 定义自动化流程"
    ))
    graph.add_node(KnowledgeNode(
        "矩阵测试", "多环境并行测试", 2, "medium", MasteryLevel.LEARNING,
        ["GitHub Actions"], "同时测试多个 Python 版本"
    ))
    graph.add_node(KnowledgeNode(
        "Docker 缓存", "加速镜像构建", 2, "medium", MasteryLevel.LEARNING,
        ["GitHub Actions"], "利用 GHA 缓存 Docker 层"
    ))

    # Day 3: 模型 Fallback
    graph.add_node(KnowledgeNode(
        "Fallback 链", "多供应商降级", 3, "high", MasteryLevel.FAMILIAR,
        ["健康检查"], "按优先级自动切换供应商"
    ))
    graph.add_node(KnowledgeNode(
        "健康检查", "服务状态监控", 3, "high", MasteryLevel.FAMILIAR,
        ["Fallback 链", "熔断器"], "成功率 + 延迟双维度判断"
    ))
    graph.add_node(KnowledgeNode(
        "vLLM", "高性能推理引擎", 3, "medium", MasteryLevel.LEARNING,
        ["Fallback 链"], "本地部署降低延迟和成本"
    ))

    # Day 4: 成本优化
    graph.add_node(KnowledgeNode(
        "Token 计数", "成本精确追踪", 4, "high", MasteryLevel.FAMILIAR,
        ["模型路由"], "区分输入/输出 token 分别计价"
    ))
    graph.add_node(KnowledgeNode(
        "模型路由", "智能选择模型", 4, "high", MasteryLevel.LEARNING,
        ["Token 计数", "复杂度评估"], "简单任务用便宜模型"
    ))
    graph.add_node(KnowledgeNode(
        "语义缓存", "避免重复调用", 4, "high", MasteryLevel.LEARNING,
        ["Token 计数"], "相似查询返回缓存结果"
    ))

    # Day 5: 限流熔断
    graph.add_node(KnowledgeNode(
        "限流器", "请求频率控制", 5, "high", MasteryLevel.FAMILIAR,
        ["令牌桶"], "防止系统过载"
    ))
    graph.add_node(KnowledgeNode(
        "熔断器", "防止级联故障", 5, "high", MasteryLevel.FAMILIAR,
        ["关闭/打开/半开", "健康检查"], "三状态自动恢复"
    ))
    graph.add_node(KnowledgeNode(
        "沙箱", "隔离代码执行", 5, "medium", MasteryLevel.LEARNING,
        ["资源限制"], "安全执行不受信任的代码"
    ))

    # Day 6: 监控告警
    graph.add_node(KnowledgeNode(
        "Prometheus", "指标收集", 6, "high", MasteryLevel.FAMILIAR,
        ["Grafana", "告警规则"], "四种指标类型"
    ))
    graph.add_node(KnowledgeNode(
        "Grafana", "可视化仪表盘", 6, "high", MasteryLevel.FAMILIAR,
        ["Prometheus"], "丰富的图表组件"
    ))
    graph.add_node(KnowledgeNode(
        "告警规则", "异常自动通知", 6, "high", MasteryLevel.LEARNING,
        ["Prometheus", "Alertmanager"], "分级告警避免风暴"
    ))

    # 添加关联
    connections = [
        ("Docker", "Docker Compose"),
        ("Fallback 链", "健康检查"),
        ("Token 计数", "模型路由"),
        ("限流器", "熔断器"),
        ("Prometheus", "Grafana"),
        ("Prometheus", "告警规则"),
        ("熔断器", "健康检查"),
    ]
    for from_node, to_node in connections:
        graph.add_connection(from_node, to_node)

    return graph
```

### 2. 问题梳理清单

```python
# review/problem_list.py
"""问题梳理清单"""
from dataclasses import dataclass
from typing import List


@dataclass
class Problem:
    """问题记录"""
    id: int
    day: int
    category: str  # concept / code / config
    question: str
    solution: str
    status: str  # solved / partial / unsolved
    lesson: str = ""


def create_problem_list() -> List[Problem]:
    """创建问题清单"""
    return [
        # Day 1: Docker
        Problem(1, 1, "config", "Docker secrets 文件权限错误",
                "chmod 600 secrets/*.txt", "solved",
                "密钥文件权限是安全基线"),
        Problem(2, 1, "concept", "容器间无法通信",
                "确保所有服务在同一个 Docker 网络中", "solved",
                "Docker 网络是容器通信的基础"),
        Problem(3, 1, "code", "镜像过大 (>1GB)",
                "使用多阶段构建 + slim 基础镜像", "solved",
                "多阶段构建是标准实践"),

        # Day 2: CI/CD
        Problem(4, 2, "config", "GitHub Actions Secrets 未配置",
                "在 Settings -> Secrets 中配置", "solved",
                "CI/CD 密钥不能硬编码"),
        Problem(5, 2, "code", "测试在 CI 中失败但本地通过",
                "添加 pythonpath 配置", "solved",
                "CI 环境和本地环境可能不同"),

        # Day 3: 模型 Fallback
        Problem(6, 3, "concept", "所有供应商都不可用",
                "检查 API 密钥、网络、健康状态", "partial",
                "需要本地 vLLM 作为最终降级方案"),
        Problem(7, 3, "code", "vLLM GPU 内存不足",
                "使用量化模型或减少 max-model-len", "solved",
                "量化是生产部署的关键"),

        # Day 4: 成本优化
        Problem(8, 4, "concept", "Token 计数不准确",
                "使用 tiktoken 库而非空格分割", "solved",
                "准确计费是成本优化的前提"),
        Problem(9, 4, "code", "缓存命中率低",
                "增强查询归一化 + 调整缓存策略", "partial",
                "语义相似度是更精确的匹配方式"),

        # Day 5: 限流熔断
        Problem(10, 5, "code", "熔断器频繁打开",
                "增大失败阈值和恢复超时", "solved",
                "阈值需要根据实际负载调整"),
        Problem(11, 5, "concept", "沙箱中无法导入第三方库",
                "将库加入白名单或使用子进程隔离", "solved",
                "安全性和功能性需要平衡"),

        # Day 6: 监控
        Problem(12, 6, "config", "Prometheus 无法抓取指标",
                "检查网络连通性和 metrics 端点", "solved",
                "监控系统的自监控很重要"),
        Problem(13, 6, "concept", "告警风暴",
                "配置分组和抑制规则", "solved",
                "告警质量比数量更重要"),
    ]
```

### 3. 生产部署清单

```python
# review/deployment_checklist.py
"""生产部署清单"""
from dataclasses import dataclass, field
from typing import List
from enum import Enum


class ChecklistStatus(Enum):
    """清单状态"""
    PENDING = "pending"
    DONE = "done"
    SKIPPED = "skipped"


@dataclass
class ChecklistItem:
    """清单项"""
    category: str
    item: str
    description: str
    status: ChecklistStatus = ChecklistStatus.PENDING
    command: str = ""


def create_deployment_checklist() -> List[ChecklistItem]:
    """创建生产部署清单"""
    return [
        # 容器化
        ChecklistItem("容器化", "多阶段 Dockerfile",
                      "使用多阶段构建减小镜像体积",
                      command="docker build --target runtime ."),
        ChecklistItem("容器化", "非 root 用户",
                      "容器内使用非 root 用户运行",
                      command="docker run --user agent:agent"),
        ChecklistItem("容器化", "健康检查",
                      "配置 HEALTHCHECK 指令",
                      command="curl -f http://localhost:8000/health"),
        ChecklistItem("容器化", "资源限制",
                      "配置 CPU 和内存限制",
                      command="docker compose 配置 deploy.resources"),
        ChecklistItem("容器化", ".dockerignore",
                      "排除不必要的文件",
                      command="cat .dockerignore"),

        # 密钥管理
        ChecklistItem("密钥管理", "环境变量",
                      "敏感信息通过环境变量注入",
                      command="echo $API_KEY"),
        ChecklistItem("密钥管理", "Docker Secrets",
                      "使用 Docker Secrets 管理密钥",
                      command="docker secret ls"),
        ChecklistItem("密钥管理", "密钥轮换",
                      "定期更换 API 密钥",
                      command="schedule: quarterly"),

        # CI/CD
        ChecklistItem("CI/CD", "自动测试",
                      "每次提交自动运行测试",
                      command="pytest tests/"),
        ChecklistItem("CI/CD", "代码检查",
                      "Lint 和类型检查",
                      command="ruff check src/ tests/"),
        ChecklistItem("CI/CD", "自动构建",
                      "测试通过后自动构建镜像",
                      command="docker compose build"),
        ChecklistItem("CI/CD", "自动部署",
                      "合并到 main 后自动部署",
                      command="github actions deploy"),

        # 模型服务
        ChecklistItem("模型服务", "Fallback 链",
                      "配置多供应商降级策略",
                      command="python -m app.fallback_demo"),
        ChecklistItem("模型服务", "健康检查",
                      "监控模型供应商健康状态",
                      command="curl http://localhost:8000/health"),
        ChecklistItem("模型服务", "vLLM 备用",
                      "本地推理作为最终降级方案",
                      command="docker compose up vllm"),

        # 成本控制
        ChecklistItem("成本控制", "Token 计数",
                      "追踪每次 API 调用的 token 使用",
                      command="查看 Token 统计"),
        ChecklistItem("成本控制", "成本限制",
                      "设置每日/每月成本上限",
                      command="配置 cost_limits"),
        ChecklistItem("成本控制", "语义缓存",
                      "相似查询返回缓存结果",
                      command="查看缓存命中率"),

        # 稳定性
        ChecklistItem("稳定性", "限流器",
                      "控制请求频率",
                      command="配置 TokenBucketRateLimiter"),
        ChecklistItem("稳定性", "熔断器",
                      "防止级联故障",
                      command="配置 CircuitBreaker"),
        ChecklistItem("稳定性", "重试策略",
                      "带指数退避的自动重试",
                      command="配置 RetryConfig"),
        ChecklistItem("稳定性", "沙箱",
                      "隔离执行不受信任的代码",
                      command="配置 PythonSandbox"),

        # 监控告警
        ChecklistItem("监控告警", "Prometheus",
                      "指标收集和存储",
                      command="curl http://localhost:9090"),
        ChecklistItem("监控告警", "Grafana",
                      "可视化仪表盘",
                      command="open http://localhost:3000"),
        ChecklistItem("监控告警", "告警规则",
                      "异常自动通知",
                      command="curl http://localhost:9090/api/v1/alerts"),
        ChecklistItem("监控告警", "日志聚合",
                      "Loki + Promtail 日志收集",
                      command="curl http://localhost:3100"),
    ]
```

### 4. 主复盘脚本

```python
# review/main_review.py
"""Week 12 复盘主脚本"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from knowledge_graph import create_week12_graph, MasteryLevel
from problem_list import create_problem_list
from deployment_checklist import create_deployment_checklist, ChecklistStatus


def main():
    print("=" * 60)
    print("Week 12 复盘：生产部署总结")
    print("=" * 60)

    # ===== 1. 知识图谱 =====
    graph = create_week12_graph()
    print(graph.visualize())

    # 掌握度统计
    mastery_stats = {}
    for node in graph.nodes.values():
        level = node.mastery.value
        mastery_stats[level] = mastery_stats.get(level, 0) + 1

    print("掌握度统计:")
    for level, count in mastery_stats.items():
        print(f"  {level}: {count} 个知识点")

    # ===== 2. 问题清单 =====
    problems = create_problem_list()
    solved = sum(1 for p in problems if p.status == "solved")
    partial = sum(1 for p in problems if p.status == "partial")
    unsolved = sum(1 for p in problems if p.status == "unsolved")

    print(f"\n问题清单:")
    print(f"  总问题数: {len(problems)}")
    print(f"  已解决: {solved}")
    print(f"  部分解决: {partial}")
    print(f"  未解决: {unsolved}")

    print("\n关键经验教训:")
    for p in problems:
        if p.lesson:
            print(f"  [{p.day}] {p.lesson}")

    # ===== 3. 部署清单 =====
    checklist = create_deployment_checklist()
    categories = {}
    for item in checklist:
        if item.category not in categories:
            categories[item.category] = []
        categories[item.category].append(item)

    print(f"\n生产部署清单:")
    for category, items in categories.items():
        print(f"\n  {category} ({len(items)} 项):")
        for item in items:
            print(f"    [ ] {item.item}: {item.description}")

    # ===== 4. 总结 =====
    print("\n" + "=" * 60)
    print("Week 12 核心收获")
    print("=" * 60)
    print("""
1. Docker 容器化是生产部署的基础
   - 多阶段构建减小镜像
   - Docker Compose 编排多服务
   - Docker Secrets 管理密钥

2. CI/CD 是质量保证的自动化手段
   - GitHub Actions 实现自动化流水线
   - 矩阵测试覆盖多环境
   - 自动部署减少人为错误

3. Fallback 链是高可用的关键
   - 多供应商自动降级
   - 健康检查驱动切换
   - vLLM 本地推理作为兜底

4. 成本优化需要系统性思维
   - Token 计数追踪成本
   - 智能路由选择模型
   - 语义缓存避免重复调用

5. 限流熔断是稳定性的保障
   - 限流防止系统过载
   - 熔断防止级联故障
   - 沙箱隔离不安全代码

6. 监控告警是运维的眼睛
   - Prometheus 收集指标
   - Grafana 可视化展示
   - 分级告警避免风暴
""")

    print("=" * 60)
    print("Week 12 复盘完成!")
    print("=" * 60)


if __name__ == "__main__":
    main()
```

---

## 预期输出

```bash
$ python review/main_review.py
============================================================
Week 12 复盘：生产部署总结
============================================================

============================================================
Week 12 知识图谱
============================================================

Day 1: Docker 容器化
----------------------------------------
  [熟悉] Docker
        容器化技术基础
        >> 镜像只读，容器可写
        -> 关联: Docker Compose, Dockerfile
  [熟悉] Dockerfile
        镜像构建脚本
        >> 多阶段构建减小镜像体积
        -> 关联: 多阶段构建
  [熟悉] Docker Compose
        多容器编排
        >> 声明式定义服务拓扑
        -> 关联: Docker, 网络, 卷
  [熟悉] Docker Secrets
        密钥管理
        >> 永远不要把密钥写入镜像

Day 2: CI/CD 流水线
----------------------------------------
  [熟悉] GitHub Actions
        CI/CD 自动化平台
        >> YAML 定义自动化流程
  [学习中] 矩阵测试
        多环境并行测试
  [学习中] Docker 缓存
        加速镜像构建

Day 3: 模型 Fallback
----------------------------------------
  [熟悉] Fallback 链
        多供应商降级
        >> 按优先级自动切换供应商
  [熟悉] 健康检查
        服务状态监控
        >> 成功率 + 延迟双维度判断
  [学习中] vLLM
        高性能推理引擎

Day 4: 成本优化
----------------------------------------
  [熟悉] Token 计数
        成本精确追踪
        >> 区分输入/输出 token 分别计价
  [学习中] 模型路由
        智能选择模型
  [学习中] 语义缓存
        避免重复调用

Day 5: 限流熔断
----------------------------------------
  [熟悉] 限流器
        请求频率控制
  [熟悉] 熔断器
        防止级联故障
        >> 三状态自动恢复
  [学习中] 沙箱
        隔离代码执行

Day 6: 监控告警
----------------------------------------
  [熟悉] Prometheus
        指标收集
  [熟悉] Grafana
        可视化仪表盘
  [学习中] 告警规则
        异常自动通知

掌握度统计:
  familiar: 12 个知识点
  learning: 8 个知识点

问题清单:
  总问题数: 13
  已解决: 11
  部分解决: 2
  未解决: 0

关键经验教训:
  [1] 密钥文件权限是安全基线
  [1] Docker 网络是容器通信的基础
  [1] 多阶段构建是标准实践
  [2] CI/CD 密钥不能硬编码
  [2] CI 环境和本地环境可能不同
  [3] 需要本地 vLLM 作为最终降级方案
  [3] 量化是生产部署的关键
  [4] 准确计费是成本优化的前提
  [4] 语义相似度是更精确的匹配方式
  [5] 阈值需要根据实际负载调整
  [5] 安全性和功能性需要平衡
  [6] 监控系统的自监控很重要
  [6] 告警质量比数量更重要

生产部署清单:

  容器化 (5 项):
    [ ] 多阶段 Dockerfile: 使用多阶段构建减小镜像体积
    [ ] 非 root 用户: 容器内使用非 root 用户运行
    [ ] 健康检查: 配置 HEALTHCHECK 指令
    [ ] 资源限制: 配置 CPU 和内存限制
    [ ] .dockerignore: 排除不必要的文件

  密钥管理 (3 项):
    [ ] 环境变量: 敏感信息通过环境变量注入
    [ ] Docker Secrets: 使用 Docker Secrets 管理密钥
    [ ] 密钥轮换: 定期更换 API 密钥

  CI/CD (4 项):
    [ ] 自动测试: 每次提交自动运行测试
    [ ] 代码检查: Lint 和类型检查
    [ ] 自动构建: 测试通过后自动构建镜像
    [ ] 自动部署: 合并到 main 后自动部署

  ...

============================================================
Week 12 核心收获
============================================================

1. Docker 容器化是生产部署的基础
2. CI/CD 是质量保证的自动化手段
3. Fallback 链是高可用的关键
4. 成本优化需要系统性思维
5. 限流熔断是稳定性的保障
6. 监控告警是运维的眼睛

============================================================
Week 12 复盘完成!
============================================================
```

---

## 常见错误和解决方案

### 错误 1: 知识点太多记不住

**解决方案**: 用思维导图整理，抓核心概念，不要追求记住所有细节。

### 错误 2: 遗留问题太多

**解决方案**: 按优先级排序：
1. 影响生产安全的 -> 立即解决
2. 影响可用性的 -> 本周解决
3. 优化类的 -> 后续迭代

### 错误 3: 不知道如何开始复盘

**解决方案**: 按时间顺序回顾每天内容，每天空出 30 分钟专注复盘。

---

## 每日挑战

### 挑战 1: 知识梳理

1. 画出 Week 12 的知识图谱（手绘或工具）
2. 标注每个知识点的掌握程度
3. 找出知识点之间的关联关系

### 挑战 2: 问题整理

1. 整理本周遇到的所有问题
2. 为每个问题写一句话总结
3. 总结出 5 条以上的经验教训

### 挑战 3: 部署实战

1. 使用生产部署清单，为你的 Agent 项目做一次完整的上线检查
2. 记录哪些项已完成，哪些需要补充
3. 制定下周的改进计划

---

> **下周预告**: Week 13 我们将进入 Deep Dive 选修方向，可以选择 LLM 深度优化、Agent 框架实战或多模态 Agent 中的一个方向深入学习。
