# 变更记录格式要求（CHANGELOG）

## 目标

- 让使用者快速了解每个版本“变了什么、是否有破坏性、如何升级”
- 让发布与回滚可追踪

## 建议格式

建议采用 Keep a Changelog 风格（按版本 + 分类），并使用语义化版本号（SemVer）。

## 模板

```markdown
# Changelog

## [Unreleased]

### Added

- ...

### Changed

- ...

### Fixed

- ...

### Deprecated

- ...

### Removed

- ...

### Security

- ...

## [1.2.3] - 2026-01-21

### Added

- ...
```

## 书写规则

- 每条变更用动词开头，描述用户可感知的行为变化
- 破坏性变更必须显式标注，并提供迁移指引
- 安全相关变更放在 Security 分类
- 内部重构若对外无影响，可合并为一条简述（避免噪音）

## 发布检查清单

- Unreleased 已清空并落入本次版本
- 破坏性变更有迁移步骤与回滚提示
- 版本号符合变更级别（major/minor/patch）
