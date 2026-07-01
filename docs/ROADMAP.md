# TaskFlow 全栈学习路线图

> 前端 Next.js + 后端 NestJS + 数据库 PostgreSQL 双线并进
> 面向：10 年经验的前端工程师，目标成为全栈开发者

---

## 一、学习哲学

```
        ┌─────────────────────────────────────────────┐
        │           双线并进，闭环驱动                   │
        │                                             │
        │   后端写 API  ──→  前端消费 API  ──→  完整功能  │
        │      ▲                                        │
        │      └──────── 验证反馈 ────────────────────┘
        └─────────────────────────────────────────────┘
```

**核心理念：每个功能模块都「后端先做半步 → 前端紧跟消费 → 跑通闭环」**

为什么这样设计（针对你的优势）：
1. 你是前端老兵，用自己写的页面调自己写的 API，**反馈周期极短**
2. 每完成一个模块就有一个**看得见的功能**，学习动机强
3. 前后端的 TypeScript 类型天然共享，**类型即文档**
4. 避免「先学完枯燥的后端再接触前端」导致的遗忘和脱节

---

## 二、技术栈总览

| 层级 | 技术选型 | 你的学习重点 |
|------|---------|-------------|
| **前端框架** | Next.js 14+（App Router） | RSC、Server Components、Server Actions |
| **UI** | Tailwind CSS + shadcn/ui | 你已熟悉，快速搭建 |
| **状态管理** | Zustand / TanStack Query | 客户端状态 + 服务端缓存 |
| **后端框架** | NestJS | DI、模块化、Guard、管道、装饰器 |
| **数据库** | PostgreSQL 15+ | SQL、关系建模、索引、事务 |
| **ORM** | Prisma | Schema 建模、Migration、查询 |
| **认证** | JWT（后端签发）+ Next.js middleware | 前后端鉴权联动 |
| **实时** | Socket.IO / NestJS Gateway | WebSocket |
| **部署** | Vercel（前端）+ Railway/Render（后端） | 全栈部署 |
| **工程化** | TypeScript Monorepo（pnpm workspaces） | 类型共享、统一构建 |

---

## 三、8 周学习节奏（4 个 Sprint）

> 每个 Sprint = 2 周。后端任务打 🟦，前端任务打 🟧，全栈结合点打 🔗

---

### 🏁 Sprint 0：环境搭建（第 1 周）

**目标：前后端项目跑起来，数据库连通，建立 Monorepo 结构**

#### 🟦 后端任务
- 用 NestJS CLI 创建项目
- 安装并配置 PostgreSQL（Docker 或本地）
- 初始化 Prisma，连接数据库
- 搭建配置模块（`@nestjs/config`，多环境 `.env`）
- 全局响应拦截器 + 异常过滤器（统一返回格式）
- Swagger 文档接入

#### 🟧 前端任务
- 用 `create-next-app` 创建项目（App Router + TypeScript + Tailwind）
- 理解 App Router 目录结构（`app/`、`layout.tsx`、`page.tsx`）
- 接入 shadcn/ui 组件库
- 创建 API 请求封装（fetch + token 注入）
- 配置环境变量（`NEXT_PUBLIC_API_URL`）

#### 🔗 全栈结合点
- 搭建 **pnpm workspaces** Monorepo：
  ```
  taskflow/
  ├── apps/
  │   ├── web/        # Next.js 前端
  │   └── api/        # NestJS 后端
  └── packages/
      └── shared/     # 共享类型/DTO
  ```
- 配置 CORS（后端允许前端域名）

#### ✅ 检查点
- [ ] 后端 `/health` 接口返回正常
- [ ] Swagger 文档可访问
- [ ] 前端首页能渲染
- [ ] 前端能成功请求后端（哪怕只是 `/health`）

---

### 🔐 Sprint 1：认证全栈（第 2 周）

**目标：用户能注册、登录，前端有登录态，受保护页面**

#### 🟦 后端任务
- User 实体 + Prisma migration
- Auth 模块：`register` / `login` / `me`
- bcrypt 密码哈希
- JWT 签发与校验（`@nestjs/jwt` + Passport JWT 策略）
- 自定义 `@CurrentUser()` 装饰器
- 全局 `JwtAuthGuard` 或按需 `@UseGuards`

#### 🟧 前端任务（Next.js 重点学习！）
- **理解 Server vs Client Components**：
  - 登录/注册表单 → Client Component（`'use client'`）
  - 首页、SEO 页面 → Server Component
- 登录/注册页面 + 表单校验（React Hook Form + Zod）
- JWT 存储策略（httpOnly cookie 或 localStorage 的取舍）
- `middleware.ts` 守卫：未登录跳转登录页
- 封装带 token 的 fetch / 创建 Axios 拦截器
- 登录态管理（Context / Zustand）

#### 🔗 全栈结合点
- 认证流程闭环：
  ```
  前端登录 → 后端签 JWT → 前端存 token
  → 后续请求带 Authorization Header → 后端校验
  ```
- **类型共享**：把后端 DTO 放到 `packages/shared`，前端复用类型
- 统一错误码处理

#### ✅ 检查点
- [ ] 能注册、登录、获取当前用户
- [ ] 前端登录态持久化，刷新不丢失
- [ ] 未登录访问受保护页面自动跳转
- [ ] 前后端共享 User 类型

---

### 📋 Sprint 2：核心功能全栈（第 3-4 周）

**目标：工作空间、项目、任务的完整 CRUD，前端能管理任务**

#### 🟦 后端任务
- Workspace / Project / Task 实体建模 + Migration
- 三个模块的 CRUD（Controller + Service + DTO）
- 分页查询（offset / 游标）
- 数据校验（class-validator）+ 业务异常
- 关联查询（Workspace → Projects → Tasks）

#### 🟧 前端任务（Next.js 重点学习！）
- **数据获取三剑客对比**（重点）：
  - Server Components 中 `fetch()` 直接取数据（SSR）
  - TanStack Query 客户端缓存 + 乐观更新
  - Server Actions 提交表单（无 API 路由）
- 列表页（Server Component 渲染初始数据）
- 任务详情页（动态路由 `[id]`）
- 创建/编辑表单（Server Action 或 API 路由）
- 加载态（`loading.tsx`、Suspense）
- 404 处理（`not-found.tsx`）

#### 🔗 全栈结合点
- 用 Swagger 生成的 OpenAPI → 前端类型（`openapi-typescript`）
- 或手动维护 `packages/shared` 的类型定义
- 分页协议前后端统一（`meta` 字段）

#### ✅ 检查点
- [ ] 能创建工作空间/项目/任务
- [ ] 任务列表分页正常
- [ ] 表单提交后数据实时更新
- [ ] 首屏 SSR 渲染（查看页面源代码有内容）

---

### 👥 Sprint 3：协作与权限全栈（第 5-6 周）

**目标：多人协作、RBAC 权限、看板拖拽、评论**

#### 🟦 后端任务
- RBAC 权限系统（OWNER / ADMIN / MEMBER）
- 自定义 `RolesGuard` + `@Roles()` 装饰器
- 成员邀请、角色修改、移除
- Board / Column 模块 + 任务拖拽排序（`position` 字段）
- Comment / Label 模块（多对多）
- 文件上传（Multer）头像 + 附件
- 复杂筛选查询（多条件组合）

#### 🟧 前端任务（Next.js 重点学习！）
- 看板 UI + 拖拽（`@dnd-kit/core`）
- 乐观更新（Optimistic UI）+ 失败回滚
- 权限控制渲染（按钮根据角色显隐）
- 评论列表 + 无限滚动
- 文件上传组件（拖拽上传、进度）
- 复杂筛选 UI（表单 + URL Query 同步）

#### 🔗 全栈结合点
- 权限信息从前端 UI 到后端 Guard 的全链路
- WebSocket 实时同步（多人拖拽看板）
- 拖拽排序的事务一致性（后端重排 position）

#### ✅ 检查点
- [ ] 能邀请成员并分配角色
- [ ] 不同角色权限边界正确
- [ ] 看板可拖拽，刷新后位置保持
- [ ] 评论和附件功能正常

---

### 🚀 Sprint 4：实时与生产化（第 7-8 周）

**目标：实时协作、通知、测试、生产部署**

#### 🟦 后端任务
- WebSocket Gateway（NestJS `@WebSocketGateway`）
- 通知系统（任务指派、@提及）
- 全文搜索（PostgreSQL `tsvector`）
- 活动日志（Audit Log）
- Jest 单元测试 + e2e 测试
- Docker 化（Dockerfile + docker-compose）
- 结构化日志（Pino）

#### 🟧 前端任务（Next.js 重点学习！）
- WebSocket 客户端（socket.io-client）
- 实时数据同步（任务状态变更推送）
- 通知中心（Toast + 通知列表）
- 搜索功能（防抖 + 高亮）
- `next.config` 生产配置（图片域名、环境变量）
- Vercel 部署 + 环境变量配置

#### 🔗 全栈结合点
- WebSocket 鉴权（token 验证连接）
- 前后端事件协议定义（放在 `packages/shared`）
- 全栈部署联调（前端 Vercel → 后端 Railway）

#### ✅ 检查点
- [ ] 多人同时操作看板，实时同步
- [ ] 通知系统工作正常
- [ ] 测试覆盖率 > 60%
- [ ] `docker-compose up` 一键启动
- [ ] 前端上线 Vercel，可公网访问

---

## 四、Next.js 学习重点清单（针对资深前端）

> 这些是你作为前端老兵需要**特别关注的新概念**，其余 React 基础可跳过

| 概念 | 为什么重要 | 在哪个 Sprint 学 |
|------|-----------|-----------------|
| **App Router** | 全新路由架构，取代 Pages Router | Sprint 0 |
| **Server Components** | React 18 核心，服务端渲染组件 | Sprint 1-2 |
| **Client Components** | `'use client'` 边界划分 | Sprint 1-2 |
| **Server Actions** | 表单提交新范式，无需 API 路由 | Sprint 2 |
| **数据获取与缓存** | `fetch` 缓存、`revalidate`、`tags` | Sprint 2 |
| **middleware.ts** | 边缘中间件，鉴权守卫 | Sprint 1 |
| **loading.tsx / error.tsx** | 约定式加载态和错误边界 | Sprint 2 |
| **Streaming / Suspense** | 流式渲染，提升首屏体验 | Sprint 3 |
| **Metadata API** | SEO，取代 next/head | Sprint 2 |

---

## 五、全栈工程实践（贯穿全程）

### 1. 类型共享方案（三选一）

```
方案 A（推荐新手）：手动维护 packages/shared
  └── 简单直接，DTO 手写一遍，前端复用

方案 B：OpenAPI 自动生成
  └── 后端 Swagger → openapi-typescript → 前端类型

方案 C：Monorepo + tRPC 风格
  └── 直接 import 后端类型（需要同仓库）
```

### 2. 认证联动

```
登录：前端 POST /auth/login → 后端签 JWT
存储：httpOnly cookie（推荐，防 XSS）或 localStorage
请求：fetch 自动带 cookie / 手动注入 Authorization
守卫：Next.js middleware（前端）+ NestJS Guard（后端）双重校验
刷新：Refresh Token 机制（进阶）
```

### 3. 环境变量管理

```
前端：NEXT_PUBLIC_API_URL（暴露给浏览器）
后端：DATABASE_URL、JWT_SECRET、CORS_ORIGIN（仅服务端）
部署：Vercel / Railway 各自的环境变量面板
```

---

## 六、每日学习建议

| 时间 | 安排 |
|------|------|
| 工作日 | 每天 1.5-2 小时（1h 看文档 + 0.5-1h 写代码） |
| 周末 | 3-5 小时（集中做 Sprint 任务） |
| **节奏** | 后端先行 → 当天/次日前端跟上消费 |

**学习顺序建议（每个模块）**：
1. 看后端官方文档相关章节（30 分钟）
2. 写后端 API + 用 Swagger/Postman 测通（1 小时）
3. 写前端页面消费 API（1 小时）
4. 回顾 + 记笔记（15 分钟）

---

## 七、推荐学习资源

**Next.js**
- 官方文档（App Router 部分，必读）
- Next.js Learn 交互式教程
- Vercel 官方 YouTube 频道

**NestJS**
- 官方文档（按章节逐步看）
- NestJS 官方 Crash Course（YouTube）

**PostgreSQL + Prisma**
- Prisma 官方文档（极友好）
- PostgreSQL 官方教程（基础 SQL）
- use-the-index-luke.com（索引优化，进阶）

---

> 💡 记住：你最大的优势是**前端直觉**。每次设计 API 时，先问自己：
> "如果我是前端，我希望这个接口返回什么？"
> 这样设计出来的后端 API 天然就是优秀的。
