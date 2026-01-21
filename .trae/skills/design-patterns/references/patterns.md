# 常用设计模式实现示例

以下示例以“结构与职责”为核心，使用伪代码表达，便于在不同语言中映射实现。

## Strategy（策略）

**适用**：同一目标行为有多种可替换实现（计费规则、排序策略、鉴权方式）。

**结构**：

- `Strategy`：定义接口（`execute(input) -> output`）
- `ConcreteStrategy*`：多种实现
- `Context`：根据配置/输入选择策略并调用

**最小示例**：

```text
interface PricingStrategy { price(order) }

class VipPricing implements PricingStrategy { price(order) }
class RegularPricing implements PricingStrategy { price(order) }

class PricingService {
  constructor(strategy: PricingStrategy)
  quote(order) -> strategy.price(order)
}
```

## Factory（工厂）

**适用**：对象创建复杂，或需要按配置/环境/类型创建不同实现（支付网关、导出器、客户端）。

**结构**：

- `Factory`：封装创建逻辑
- `Product`：产物接口
- `ConcreteProduct*`：具体实现

**最小示例**：

```text
interface Notifier { send(message) }

class EmailNotifier implements Notifier { send(message) }
class SmsNotifier implements Notifier { send(message) }

class NotifierFactory {
  create(type) -> Notifier
}
```

## Adapter（适配器）

**适用**：对接第三方库/遗留接口，想在内部保持统一契约。

**结构**：

- `Target`：内部期望的接口
- `Adaptee`：第三方/遗留对象
- `Adapter`：把 Adaptee 转成 Target

**最小示例**：

```text
interface PaymentGateway { charge(request) -> result }

class StripeSdk { pay(amount, currency, token) }

class StripeGatewayAdapter implements PaymentGateway {
  constructor(stripeSdk: StripeSdk)
  charge(request) -> stripeSdk.pay(request.amount, request.currency, request.token)
}
```

## Decorator（装饰器）

**适用**：在不改动核心实现的情况下叠加横切能力（缓存、重试、限流、指标）。

**结构**：

- `Component`：核心接口
- `ConcreteComponent`：核心实现
- `Decorator`：持有 `Component` 并增强

**最小示例**：

```text
interface UserRepository { getById(id) }

class DbUserRepository implements UserRepository { getById(id) }

class CachedUserRepository implements UserRepository {
  constructor(inner: UserRepository, cache)
  getById(id) -> cache.getOrSet(id, () => inner.getById(id))
}
```

## Observer / Event（观察者 / 事件）

**适用**：核心流程与副作用解耦（下单成功后发通知、写审计、更新指标）。

**结构**：

- `Event`：稳定载荷
- `Publisher`：发布事件
- `Subscriber`：订阅并处理

**最小示例**：

```text
event OrderCreated { orderId, userId }

class OrderService {
  constructor(eventBus)
  createOrder(cmd) -> { ...; eventBus.publish(OrderCreated(...)) }
}

class SendEmailOnOrderCreated {
  handle(event: OrderCreated) -> ...
}
```

## Command（命令）

**适用**：把“请求”封装成对象，便于排队、重试、审计、撤销（任务系统、批处理）。

**最小示例**：

```text
interface Command { execute() }

class CreateInvoiceCommand implements Command { execute() }
class RetryableJobRunner { run(cmd: Command) }
```

## Repository（仓储）

**适用**：隔离数据访问细节，让业务层依赖稳定接口。

**最小示例**：

```text
interface OrderRepository {
  getById(id)
  save(order)
}
```

## Dependency Injection（依赖注入）

**适用**：降低耦合、提升可测试性、替换实现（mock/fake）。

**落地要点**：

- 注入边界依赖：Repository、Client、Clock、IdGenerator
- 避免 Service Locator（隐式全局查找依赖）

