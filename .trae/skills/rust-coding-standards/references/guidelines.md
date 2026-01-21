# Rust 编程规范

本规范面向稳定版 Rust。目标是用所有权/类型系统把“正确性与边界”前置到编译期，并通过显式错误语义与最小 unsafe 保证可维护性与安全性。

## 目录

- [1. 语言特定编码风格](#1-语言特定编码风格)
- [2. 所有权与借用规则](#2-所有权与借用规则)
- [3. 并发处理](#3-并发处理)
- [4. 错误处理](#4-错误处理)
- [5. 性能优化](#5-性能优化)
- [6. 安全编码](#6-安全编码)
- [7. 可维护性标准](#7-可维护性标准)
- [8. 测试要求](#8-测试要求)
- [9. 实施检查清单](#9-实施检查清单)

## 1. 语言特定编码风格

- 格式化与静态检查：
  - 统一使用 `rustfmt` 格式化
  - 使用 `clippy` 作为评审前的必过项（优先修复 lint，而不是 `allow`）
- 命名约定：
  - 模块/函数/变量：`snake_case`
  - 类型/trait/enum：`PascalCase`
  - 常量：`SCREAMING_SNAKE_CASE`
- 文档注释使用 rustdoc（`///`），公共 API 必须有最小示例与错误说明。

示例（rustdoc + 示例可被 doctest 验证）：

```rust
/// Parse a positive integer from string.
///
/// # Errors
/// Returns `ParseError::Invalid` when input is not a positive integer.
///
/// ```
/// use my_crate::parse_positive_i64;
/// assert_eq!(parse_positive_i64("42").unwrap(), 42);
/// ```
pub fn parse_positive_i64(input: &str) -> Result<i64, ParseError> {
    let value: i64 = input.parse().map_err(|_| ParseError::Invalid)?;
    if value <= 0 {
        return Err(ParseError::Invalid);
    }
    Ok(value)
}
```

## 2. 所有权与借用规则

- 默认借用：优先传 `&T` / `&mut T`，只有在确实需要所有权时才 `T`。
- 控制 `clone()`：
  - `clone()` 出现时必须能回答“为什么需要复制”
  - 优先通过借用、切片（`&[T]`）、`Cow`、或改变数据流减少复制
- 明确生命周期边界：
  - 公共 API 尽量避免复杂生命周期参数；必要时用拥有型结构（`String`/`Vec`）换取易用性
- 避免共享可变状态：
  - 用所有权转移、消息传递或局部可变替代全局可变

示例（用借用替代复制）：

```rust
pub fn total_len(parts: &[String]) -> usize {
    parts.iter().map(|s| s.len()).sum()
}
```

## 3. 并发处理

- 先选择并发模型：
  - CPU 密集：线程池/并行迭代（关注工作窃取与粒度）
  - I/O 密集：异步运行时（明确 `.await` 边界与取消语义）
- 避免过度锁：
  - 优先无共享设计（channel、工作队列、actor）
  - 必须共享时，缩小锁范围，避免在持锁期间执行 I/O 或长计算
- `Send`/`Sync` 视为 API 契约的一部分：
  - 在类型层面标注线程安全的边界
  - 跨线程传递尽量使用不可变数据或消息

示例（消息传递替代共享写入）：

```rust
use std::sync::mpsc;
use std::thread;

pub fn run_workers(jobs: Vec<u32>) -> u32 {
    let (tx, rx) = mpsc::channel::<u32>();
    for job in jobs {
        let tx = tx.clone();
        thread::spawn(move || {
            let _ = tx.send(job * 2);
        });
    }
    drop(tx);
    rx.iter().sum()
}
```

## 4. 错误处理

- 禁止用 `panic!` 表达可预期错误：
  - `panic!` 仅用于不可恢复的编程错误（违反不变量）
- 公共 API 使用 `Result<T, E>`：
  - `E` 是稳定的错误类型（enum），并可映射为错误码/HTTP 状态码
- 不使用 `unwrap()`/`expect()` 作为常规控制流：
  - 测试中允许；生产代码只有在“有证明的不变量”下使用，并用注释与类型保证
- 错误应携带足够上下文，但不泄露敏感信息：
  - 记录时附上 requestId/关键参数的脱敏形式

示例（错误枚举 + 透明转换）：

```rust
#[derive(Debug)]
pub enum ParseError {
    Invalid,
}

pub fn parse_user_id(input: &str) -> Result<u64, ParseError> {
    input.parse::<u64>().map_err(|_| ParseError::Invalid)
}
```

## 5. 性能优化

- 优先减少分配与拷贝：
  - 多用切片与迭代器；用 `with_capacity` 预分配
  - 热路径避免 `String` 反复拼接；用 `String::push_str` 或 `fmt::Write`
- 选择合适的数据结构：
  - 读多写少：考虑 `Vec` + 二分；写多查多：考虑 `HashMap`
- 只有在需要时才“手动优化”：
  - 先用基准测试证明瓶颈，再做 unsafe 或复杂化

示例（预分配减少 reallocation）：

```rust
pub fn collect_ids(items: &[u64]) -> Vec<u64> {
    let mut ids = Vec::with_capacity(items.len());
    ids.extend_from_slice(items);
    ids
}
```

## 6. 安全编码

- `unsafe` 最小化与边界化：
  - `unsafe` 必须被封装在最小作用域内，并在模块层提供安全包装
  - 每个 `unsafe` 块需要明确不变量（安全前提条件）并在测试中覆盖
- FFI 边界当作不可信输入：
  - 校验指针、长度、编码；避免把外部内存直接当作安全引用长期持有
- 依赖安全：
  - 避免引入不维护的 crate；定期做依赖审计（漏洞、许可证）
- 密码学与随机数：
  - 使用成熟库与系统熵源；不要自实现加密协议

示例（把 unsafe 收敛在边界并提供安全 API）：

```rust
pub fn read_u32_le(bytes: &[u8]) -> Option<u32> {
    if bytes.len() < 4 {
        return None;
    }
    Some(u32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]))
}
```

## 7. 可维护性标准

- 模块与可见性：
  - 默认私有；只对外暴露稳定 API
  - 用 `pub(crate)` 控制 crate 内可见性，减少外部耦合
- 用类型表达状态与不变量：
  - 用 `enum` 表达状态机与互斥分支
  - 用 newtype（`struct UserId(u64);`）避免参数混用
- 依赖注入与可测性：
  - 通过 trait 抽象外部依赖（存储、时钟、网络），以便替换 fake/mock

示例（newtype 防止参数混用）：

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct UserId(pub u64);

pub fn get_user(user_id: UserId) {
    let _ = user_id;
}
```

## 8. 测试要求

- 单元测试覆盖：
  - 纯逻辑与不变量（尤其是所有权边界与状态机）
  - 错误分支与边界条件（空输入、溢出、格式错误）
- 集成测试覆盖：
  - crate 对外契约（公开 API 的关键组合行为）
  - 与外部系统交互时的失败模式（超时、重试、幂等；如适用）
- 属性测试（可选但推荐）：
  - 适合解析、序列化/反序列化、状态机与算法正确性

示例（基础单元测试）：

```rust
#[test]
fn parse_user_id_rejects_invalid() {
    assert!(parse_user_id("abc").is_err());
}
```

## 9. 实施检查清单

- 风格：rustfmt 通过；clippy 无关键告警；公共 API 有 rustdoc 与示例
- 所有权：参数优先借用；`clone()` 有充分理由；无共享可变全局状态
- 并发：锁范围最小；不在持锁期间做 I/O；跨线程类型边界清晰（Send/Sync）
- 错误：公共 API 返回 `Result`；无常规 `unwrap/expect`；panic 仅用于不变量破坏
- 性能：热路径减少分配；必要处预分配；优化前有基准证据
- 安全：unsafe 已封装且不变量明确；FFI 输入被当作不可信处理；依赖可审计
- 可维护性：可见性收敛；newtype/enum 表达不变量；外部依赖可替换
- 测试：错误/边界覆盖齐；关键公开 API 有回归用例；必要时增加属性测试

