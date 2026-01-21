---
name: pnpm-workspace-standards
description: pnpm 工作区项目管理规范与命令验证（pnpm ls / pnpm run / scripts 递归检查 / workspace 协议校验）。用于创建或审查新技能模块与执行命令前的 pnpm 兼容性检查。
license: Complete terms in LICENSE.txt
---

本技能用于在执行任何命令前，按 pnpm workspace 规范完成“可执行脚本清点 + 合规性校验 + 执行建议输出”，并对不符合规则的命令给出明确错误提示。

## 标准检查流程（必须按顺序）

1. `pnpm ls`：确认依赖树结构（workspace 与共享依赖是否按预期聚合）
2. `pnpm run`：查看根目录可用脚本列表
3. 检查根目录 `package.json` 的 `scripts`
4. 递归检查所有子项目 `package.json` 的 `scripts`

## 自动化验证脚本

使用 `scripts/audit-pnpm-workspace.mjs` 生成“完整可执行命令列表”，并附带：

- 每条命令来源（package.json 路径）
- 是否符合 pnpm workspace 规则（`-r/--filter`、`--parallel` 等）
- workspace 协议引用检查（`workspace:`）
- 执行建议与注意事项

执行方式（在仓库根目录）：

```bash
node ./.trae/skills/pnpm-workspace-standards/scripts/audit-pnpm-workspace.mjs --format md
```

可选参数：

- `--format md|json`：输出格式（默认 md）
- `--skip-pnpm`：跳过 `pnpm ls` 与 `pnpm run`（仅做静态检查）
- `--root <path>`：指定仓库根目录（默认自动向上查找 pnpm-workspace.yaml）

