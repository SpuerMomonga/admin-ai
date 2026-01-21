# JavaScript/TypeScript 编程规范

本规范面向现代 JS/TS（Node.js 或浏览器运行时均适用），强调：类型与运行时校验一致、错误语义稳定、模块边界清晰、测试可重复。

## 目录

- [1. 编码风格](#1-编码风格)
- [2. 命名约定](#2-命名约定)
- [3. 模块组织](#3-模块组织)
- [4. 错误处理](#4-错误处理)
- [5. 性能优化](#5-性能优化)
- [6. 安全编码](#6-安全编码)
- [7. 可维护性标准](#7-可维护性标准)
- [8. 测试要求](#8-测试要求)
- [9. 实施检查清单](#9-实施检查清单)

## 1. 编码风格

- 统一格式化与静态检查（Formatter + Linter），避免“风格争论”进入评审。
- 只在必要时使用 `any`：
  - `unknown` 优先于 `any`
  - 边界处（I/O）用运行时校验把 `unknown` 收敛为可靠类型
- 使用 `const` 优先；需要重绑定才用 `let`；避免 `var`。
- 避免隐式类型转换导致的歧义：
  - 只用 `===` / `!==`
  - 显式处理 `null`/`undefined` 与空字符串/0 的区分

示例（可读的类型收敛）：

```ts
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export function normalizeUserId(value: unknown): string {
  if (!isNonEmptyString(value)) {
    throw new ValidationError("USER_ID_INVALID", "userId must be a non-empty string")
  }
  return value.trim()
}
```

## 2. 命名约定

- 变量与函数：`camelCase`；类/类型：`PascalCase`；常量：`UPPER_SNAKE_CASE`。
- 布尔：`is*` / `has*` / `can*` / `should*`（避免 `flag`、`ok` 等语义不清）。
- 集合：复数（`users`, `orderItems`）；计数：`*Count`；映射：`*ById` / `*Map`。
- 事件/回调：`onUserCreated`, `handleSubmit`（区分订阅与处理）。
- 避免过度缩写；允许且统一的缩写：`id`, `url`, `api`, `db`。

示例（命名体现语义）：

```ts
const retryCount = 3
const isEligible = user.age >= 18
const usersById = new Map<string, User>()

async function fetchUserById(userId: string): Promise<User | null> {
  // ...
  return null
}
```

## 3. 模块组织

- 按功能特性分包（feature-first），避免“技术层目录”导致跨模块耦合。
- 明确边界入口（public API）：
  - 每个模块仅暴露 `index.ts`
  - 模块内部文件不允许被外部直接 import（防止耦合内部实现）
- I/O 与纯逻辑拆分：
  - `domain/`：纯逻辑（可单测）
  - `infra/`：外部依赖（HTTP/DB/缓存）
  - `api/`：请求/响应 DTO 与路由适配

示例（模块导出边界）：

```ts
// users/index.ts (public API)
export { getUserById } from "./service/getUserById"
export type { User } from "./domain/user"
export { UserNotFoundError } from "./errors"
```

## 4. 错误处理

- 不要 `throw "string"`；只抛出 `Error`（或继承 `Error` 的自定义错误）。
- 错误语义稳定：
  - 用 `code` 区分可机器处理的错误类型
  - `message` 面向开发者可读，但不泄露敏感信息
- 在“边界层”统一映射错误：
  - 内部错误 → API 错误响应（状态码/错误码/请求 ID）
  - 避免把第三方 SDK/DB 的原始报错直接透传给用户
- 对外部依赖调用必须有超时；重试只用于幂等操作，并带退避与上限。

示例（自定义错误 + 映射）：

```ts
export class AppError extends Error {
  public readonly code: string
  public readonly cause?: unknown

  constructor(code: string, message: string, cause?: unknown) {
    super(message)
    this.code = code
    this.cause = cause
  }
}

export class ValidationError extends AppError {}
export class NotFoundError extends AppError {}

export function toHttpStatus(error: unknown): number {
  if (error instanceof ValidationError) return 400
  if (error instanceof NotFoundError) return 404
  return 500
}
```

## 5. 性能优化

- 不阻塞事件循环：
  - 大量 CPU 计算使用 worker/任务切分
  - 任何同步 I/O（本地文件、加密等）都要评估对延迟的影响
- 控制并发与背压：
  - 批量请求要限制并发（避免把上游/数据库打爆）
  - 对流式处理使用 `async iterator` / stream 并处理 backpressure
- 避免无意义的中间对象创建：
  - 热路径上少用 `map/filter` 链式创建大量数组（按需优化）
  - 先确保可读，再在确证瓶颈后做改写

示例（并发限制）：

```ts
async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = []
  let index = 0

  async function worker(): Promise<void> {
    while (index < items.length) {
      const current = index++
      results[current] = await fn(items[current])
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
  return results
}
```

## 6. 安全编码

- 输入校验必须在边界完成（HTTP body、query、环境变量、第三方回调）：
  - 运行时校验优先（schema/validator），不要“只靠 TS 类型”
- Web 安全：
  - 浏览器侧：避免 XSS（输出编码、避免 `innerHTML` 拼接）
  - 服务端：不要拼接执行代码（禁用 `eval`/`Function`），避免反序列化执行
- Node.js 生态风险：
  - 依赖最小化；锁定依赖与供应链审计
  - 防范原型污染（合并对象时避免把未知 key 合入原型链）
- 日志脱敏：请求头、Token、Cookie、个人信息默认不记录；需要时只记录哈希或部分掩码。

示例（避免原型污染的对象合并）：

```ts
function safeAssign(target: Record<string, unknown>, patch: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(patch)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") continue
    target[key] = value
  }
}
```

## 7. 可维护性标准

- 类型设计可演进：
  - API DTO 与内部模型分离（避免内部字段外泄）
  - 使用判别联合（discriminated union）表达状态机，替代多处布尔分支
- 避免隐式依赖：
  - 不直接读取全局环境变量散落各处；集中配置加载与校验
  - 通过构造函数/参数注入依赖（client/repo/logger/clock）
- 可观测性：
  - 每个请求生成/传递 `requestId`
  - 错误日志包含“脱敏后的关键上下文 + requestId”

示例（判别联合替代布尔参数）：

```ts
type Payment =
  | { kind: "card"; token: string }
  | { kind: "bankTransfer"; accountId: string }

function pay(payment: Payment): void {
  if (payment.kind === "card") {
    // ...
    return
  }
  // ...
}
```

## 8. 测试要求

- 单元测试覆盖：
  - 纯逻辑、边界条件、错误映射、幂等/重试策略（对幂等写入尤其重要）
- 集成测试覆盖：
  - DB 约束与迁移、外部 HTTP 契约、关键链路（最小冒烟 + 回归集）
- 测试可重复：
  - 时间/随机数/ID 生成全部可注入或可控
  - 禁止测试依赖真实线上数据

示例（可注入时钟便于测试）：

```ts
export interface Clock {
  now(): Date
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date()
  }
}
```

## 9. 实施检查清单

- 编码风格：无 `var`；`unknown` 边界收敛；无隐式类型转换歧义
- 命名约定：布尔/集合/计数/映射命名语义清晰
- 模块组织：只从模块 `index.ts` 导入；I/O 与纯逻辑分离
- 错误处理：只抛 `Error`；错误码稳定；边界层统一映射；外部调用有超时/重试策略
- 性能：无阻塞事件循环的热路径；批量 I/O 有并发限制
- 安全：边界输入做运行时校验；禁用动态执行；日志脱敏；依赖风险可控
- 可维护性：DTO/内部模型分离；依赖注入；requestId 可追踪
- 测试：新增/修复逻辑有对应用例；关键链路有集成覆盖；测试可重复

