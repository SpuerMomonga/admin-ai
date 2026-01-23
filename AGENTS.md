# 项目概述

admin-ai 是一个后台管理系统，集成Agents可以实现系统自动化管理

## 项目结构

`apps/web` 是项目的前端应用，负责展示管理界面和与用户交互。它基于 SvelteKit 框架，使用 TailwindCSS 进行样式化。

## 开发命令

前端项目开发命令
前端安装、启动等命令都使用pnpm，安装依赖禁止用npx、npm

```bash

pnpm i # 安装依赖
pnpm dev # 启动开发服务器
pnpm build # 构建项目
pnpm lint # 检查代码格式
pnpm lint:fix # 检查代码格式并格式化代码
pnpm typecheck # 检查类型错误

```

## 开发规范

### 前端规范

- 完成一个模块、代码修改后需要运行 `pnpm format` 检查代码格式并格式化代码和`pnpm typecheck`检查类型错误
- 保持页面和UI库风格一致性，配色使用蓝白配色
- 新增颜色时使用css变量并在`app/src/routes/layout.css`中配置，并且同时配置tailwindcss的颜色变量
- 前端开发使用shadcn-svelte组件库
