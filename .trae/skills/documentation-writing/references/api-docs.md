# API 文档规范

## 目标

- 让调用方可以无沟通完成集成
- 明确鉴权、幂等、错误语义与版本演进方式
- 让排障可执行：能从错误快速定位到原因与解决路径

## 结构要求（每个 API 或资源组）

1. 概览：用途、受众、权限范围
2. 基础信息：
   - Base URL
   - 认证方式（Header/Cookie/Token 类型）
   - 速率限制与配额（如有）
3. 资源与端点清单（按资源分组）
4. 公共约定：
   - 分页、排序、过滤
   - 幂等与重试
   - 错误格式
   - 版本化与兼容性
5. 端点详情（模板如下）

## 端点详情模板

### {{方法}} {{路径}}

**说明**：一句话描述用途。

**权限**：

- 需要的角色/Scope：`...`

**请求**

- Headers：
  - `Authorization: Bearer <token>`
  - `Idempotency-Key: <uuid>`（如适用）
- Path Params：
  - `id`：string，必填
- Query Params：
  - `page`：number，默认 1
- Body（JSON）：

```json
{
  "fieldA": "string",
  "fieldB": 123
}
```

**响应**

- 成功：`200 OK`

```json
{
  "data": {
    "id": "string"
  }
}
```

- 失败：见 [错误格式](#错误格式)

**示例**

- cURL / HTTP 示例（可选）

## 错误格式

错误必须可机器处理 + 可人工排障。

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "fieldB must be positive",
    "requestId": "string",
    "details": {
      "field": "fieldB"
    }
  }
}
```

约定：

- `code`：稳定枚举（可用于分支处理）
- `message`：面向开发者的可读说明，不泄露敏感信息
- `requestId`：用于日志/追踪关联
- `details`：可选，提供字段级错误或上下文信息

## 幂等与重试

- 写操作如需支持重试，应支持 `Idempotency-Key` 或服务端去重机制
- 文档中明确：哪些接口幂等，哪些不可重试

## 版本化与兼容性

- 新增字段：向后兼容
- 变更语义/删除字段：需要废弃周期与明确版本策略（路径版本或 header 版本）

## 文档质量检查清单

- 每个端点都有权限、请求、响应、错误码说明
- 错误码可枚举且与实际实现一致
- 至少包含一个完整的成功响应与一个典型失败响应示例

