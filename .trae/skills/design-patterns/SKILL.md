---
name: design-patterns
description: 常用设计模式的实现示例、选型决策树与反模式识别。用于做架构/模块设计、重构、降低耦合、提升可扩展性与可测试性。
license: Complete terms in LICENSE.txt
---

本技能提供一套“可执行”的设计模式选型与落地方法：先识别变化点与边界，再选择最小足够的模式，并用反模式清单做校验。

## 快速开始

1. 先画边界：模块职责、输入输出契约、依赖方向。
2. 找变化点：哪一部分经常变？策略/创建/适配/编排/副作用？
3. 选最小模式：能解决当前问题且不引入过度抽象。
4. 用反模式自检：是否引入了隐式依赖、全局状态、过度继承、布尔参数分支等。

## 参考文档

- 常用设计模式实现示例：references/patterns.md
- 模式选择决策树：references/decision-tree.md
- 反模式识别指南：references/anti-patterns.md

