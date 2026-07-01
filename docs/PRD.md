# TaskFlow - 全栈团队任务协作平台

> 实战项目需求文档（PRD）
> 前端 Next.js + 后端 NestJS + 数据库 PostgreSQL
> 目标：通过构建一个类 Trello / Linear 的全栈任务管理平台，系统学习全栈开发

---

## 一、项目概述

**TaskFlow** 是一个轻量级团队任务协作平台，支持创建工作空间、项目、看板、任务卡片，并提供评论、标签、成员协作等功能。

作为前端工程师，你对这类产品（Jira、Linear、Trello）的使用体验非常熟悉，这正是优势——你知道什么样的 API、数据结构、交互对前端友好。

### 为什么选这个项目？

| 知识点 | 在本项目中的体现 |
|--------|-----------------|
| 认证授权 | 用户注册登录、JWT、工作空间成员权限（RBAC） |
| 数据库设计 | 多层嵌套关系（用户→工作空间→项目→看板→任务→评论） |
| ORM 使用 | Prisma 实体关联、迁移管理 |
| 复杂查询 | 任务筛选、排序、分页、多表联查 |
| 文件上传 | 头像、任务附件 |
| 实时通信 | 任务状态变更实时推送（WebSocket） |
| 搜索 | 全文搜索、标签筛选 |
| 通知系统 | 任务分配、评论 @提醒 |
| **Next.js 全栈** | **App Router、Server Components、Server Actions、SSR/SEO** |

---

## 二、技术栈（全栈）

```
全栈架构：   Next.js（前端）+ NestJS（后端）+ PostgreSQL（数据库）
项目管理：   pnpm workspaces（Monorepo）

▸ 后端（apps/api）
后端框架：   NestJS + TypeScript
数据库：     PostgreSQL 15+
ORM：        Prisma（推荐）或 TypeORM
认证：       JWT + Passport
校验：       class-validator + class-transformer
文档：       Swagger / OpenAPI
实时：       Socket.IO（NestJS Gateway）
部署：       Railway / Render / Docker

▸ 前端（apps/web）
前端框架：   Next.js 14+（App Router）+ TypeScript
UI 组件：    Tailwind CSS + shadcn/ui
状态管理：   Zustand + TanStack Query
表单校验：   React Hook Form + Zod
拖拽交互：   @dnd-kit/core
部署：       Vercel

▸ 共享（packages/shared）
类型定义：   DTO、API 响应类型、事件协议（前后端复用）
```

### Monorepo 结构

```
taskflow/
├── apps/
│   ├── web/              # Next.js 前端
│   └── api/              # NestJS 后端
├── packages/
│   └── shared/           # 共享类型 / DTO / 常量
├── docker-compose.yml    # 本地开发：PostgreSQL + Redis
├── pnpm-workspace.yaml
└── docs/
    ├── PRD.md            # 本文档（需求）
    └── ROADMAP.md        # 学习路线图
```

---

## 三、前端架构（Next.js App Router）

### 路由规划

```
app/
├── (auth)/                    # 路由组：未登录可访问
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/               # 路由组：需登录（middleware 守卫）
│   ├── layout.tsx             # 侧边栏 + 顶栏
│   ├── workspaces/
│   │   └── [workspaceId]/
│   │       ├── page.tsx              # 工作空间概览（Server Component）
│   │       ├── projects/[projectId]/
│   │       │   ├── page.tsx          # 项目看板（Server Component + 拖拽）
│   │       │   └── tasks/[taskId]/
│   │       │       └── page.tsx      # 任务详情
│   │       ├── members/page.tsx      # 成员管理
│   │       └── settings/page.tsx     # 设置
│   └── notifications/page.tsx
├── middleware.ts              # 鉴权守卫（重定向未登录）
├── layout.tsx                 # 根布局
└── page.tsx                   # 落地页（SSG，SEO）
```

### Server / Client Components 划分原则

| 类型 | 用谁 | 原因 |
|------|------|------|
| 数据展示（列表、详情） | **Server Component** | 服务端取数，减少客户端 JS，利于 SEO |
| 表单、交互（拖拽、输入） | **Client Component** | 需要 `'use client'`，有事件和状态 |
| 提交数据 | **Server Action** 或 API 路由 | 渐进增强，减少手写 fetch |
| 布局（Sidebar、Header） | **Server Component** | 静态结构，复用 layout |

### 数据流

```
首屏渲染：  Server Component  ──fetch──→  NestJS API  ──→  PostgreSQL
                                              │
交互更新：  Client Component  ──mutation──→  NestJS API
                 ▲                               │
                 └──── TanStack Query 缓存更新 ──┘
                 
实时推送：  NestJS WebSocket  ──push──→  前端 socket 客户端  ──→  UI 更新
```

---

## 四、数据模型设计（核心实体关系）

```
┌─────────┐     ┌──────────────┐     ┌──────────┐
│  User   │────<│ Workspace    │>────│ Project  │
│  用户   │     │ 工作空间/团队 │     │ 项目     │
└─────────┘     │  (多对多)    │     └──────────┘
     │          └──────────────┘          │
     │                │                   │
     │          ┌─────┴──────┐            ▼
     │          ▼            ▼      ┌──────────┐
     │    ┌──────────┐  ┌────────┐  │  Board   │
     │    │Workspace │  │ Invite │  │ 看板     │
     │    │ Member   │  │ 邀请   │  └──────────┘
     │    │(角色权限)│  └────────┘       │
     │    └──────────┘                   ▼
     │                            ┌──────────┐
     │                            │   Task   │
     │    ┌──────────┐            │ 任务卡片 │
     └───<│  Comment │>───────────└──────────┘
     │    │  评论    │                 │
     │    └──────────┘            ┌────┴─────┐
     │                            ▼          ▼
     │                       ┌────────┐ ┌─────────┐
     └──────────────────────<│ Label  │ │Attachment│
                             │ 标签   │ │ 附件     │
                             └────────┘ └─────────┘
```

### 核心实体字段说明

**User（用户）**
- `id` UUID 主键
- `email` 唯一
- `password` 哈希存储（bcrypt）
- `name`、`avatarUrl`
- `createdAt`、`updatedAt`

**Workspace（工作空间）**
- `id`、`name`、`ownerId`
- 一个用户可创建/加入多个工作空间

**WorkspaceMember（工作空间成员）** — 多对多中间表
- `userId`、`workspaceId`
- `role`：OWNER（所有者）/ ADMIN（管理员）/ MEMBER（普通成员）
- 这是 RBAC 权限控制的核心

**Project（项目）** → 属于工作空间
**Board（看板）** → 属于项目，包含列（Column）
**Task（任务）** → 属于看板列
  - `title`、`description`、`status`、`priority`
  - `assigneeId`（指派人）、`dueDate`（截止日期）
  - `position`（拖拽排序）
**Comment（评论）** → 属于任务
**Label（标签）** → 任务多对多关联
**Attachment（附件）** → 属于任务

---

## 五、功能需求（分三阶段实现）

> 设计理念：每个阶段都是**可独立运行的完整产品**，逐步增加复杂度。
> 每个模块：🟦 后端 API + 🟧 前端页面 + 🔗 全栈结合

---

### 🟢 阶段一：MVP（核心 CRUD + 认证）

**目标：跑通「注册登录 → 创建任务 → 管理」的完整闭环**
**预计：2-3 周**

#### 功能清单

**1. 用户认证模块**
- POST `/auth/register` — 注册（邮箱+密码）
- POST `/auth/login` — 登录，返回 JWT
- GET `/auth/me` — 获取当前用户信息
- 密码使用 bcrypt 哈希
- JWT 签发与校验（Access Token）

**2. 工作空间模块**
- POST `/workspaces` — 创建工作空间（创建者自动成为 OWNER）
- GET `/workspaces` — 获取我加入的工作空间列表
- GET `/workspaces/:id` — 工作空间详情
- PATCH `/workspaces/:id` — 更新工作空间信息
- DELETE `/workspaces/:id` — 删除工作空间（仅 OWNER）

**3. 项目模块**
- CRUD 项目（属于工作空间）
- GET `/workspaces/:id/projects` — 工作空间下的项目列表

**4. 任务模块**
- CRUD 任务（属于项目）
- GET `/projects/:id/tasks` — 项目的任务列表（支持分页）
- PATCH `/tasks/:id` — 更新任务状态/优先级
- 支持 `status`：TODO / IN_PROGRESS / DONE
- 支持 `priority`：LOW / MEDIUM / HIGH / URGENT

#### 🟧 前端配套
- 登录/注册页面（Client Component + React Hook Form + Zod）
- `middleware.ts` 登录守卫
- 工作空间/项目/任务的列表页与表单页
- 列表页用 **Server Component** 首屏 SSR 取数

#### 阶段一学到什么
- 🟦 NestJS 模块/控制器/服务、依赖注入、JWT 认证、Prisma CRUD、Swagger
- 🟧 Next.js App Router、Server/Client Components 边界、middleware 守卫、数据获取
- 🔗 类型共享（packages/shared）、CORS 配置

---

### 🟡 阶段二：协作与权限（进阶）

**目标：多人协作 + 细粒度权限 + 文件上传**
**预计：2-3 周**

#### 功能清单

**5. 成员与权限模块（RBAC）**
- POST `/workspaces/:id/invite` — 邀请成员（通过邮箱）
- GET `/workspaces/:id/members` — 成员列表
- PATCH `/workspaces/:id/members/:userId` — 修改成员角色
- DELETE `/workspaces/:id/members/:userId` — 移除成员
- 实现自定义 Guard：根据角色判断是否有权限操作
  - OWNER：所有权限 + 危险操作
  - ADMIN：管理项目和成员（不能移除 OWNER）
  - MEMBER：只能操作自己有权限的内容

**6. 看板模块（Board + Column）**
- 看板的增删改查
- 看板列（Column）管理（待办/进行中/已完成等自定义列）
- 任务在不同列之间移动（拖拽排序，更新 `position`）

**7. 评论模块**
- 任务下发表评论
- 编辑/删除评论（仅作者或管理员）
- 评论列表分页

**8. 标签模块**
- 创建工作空间级别的标签
- 给任务打多个标签
- 按标签筛选任务

**9. 文件上传**
- POST `/upload/avatar` — 用户头像上传
- POST `/tasks/:id/attachments` — 任务附件上传
- 文件类型与大小校验
- 本地存储（阶段二）→ S3（阶段三可选）

**10. 任务高级筛选**
- 按指派人、标签、优先级、状态组合筛选
- 按创建时间、截止日期、优先级排序
- 分页（游标分页 / offset 分页）

#### 🟧 前端配套
- 看板拖拽 UI（`@dnd-kit/core`）+ 乐观更新
- 权限控制渲染（按钮根据角色显隐）
- 评论列表（无限滚动）
- 文件上传组件（拖拽上传、进度条）
- 筛选 UI（表单 + URL Query 同步）
- **Server Actions** 提交表单（无 API 路由范式）

#### 阶段二学到什么
- 🟦 RBAC 权限系统、多对多关系、文件上传、复杂查询、软删除
- 🟧 拖拽交互、乐观更新、Server Actions、TanStack Query 缓存
- 🔗 权限全链路（前端 UI 显隐 + 后端 Guard 双重校验）

---

### 🔴 阶段三：实时与生产化（高级）

**目标：实时协作 + 通知 + 生产级部署**
**预计：2 周**

#### 功能清单

**11. 实时更新（WebSocket）**
- 任务状态变更实时推送（Socket.IO / NestJS Gateway）
- 看板视图实时同步（多人同时操作）
- 用户在线状态

**12. 通知系统**
- 任务被指派时通知
- 评论 @某人时通知
- 通知列表、已读/未读
- （可选）邮件通知

**13. 搜索功能**
- 全文搜索任务标题和描述
- PostgreSQL 全文检索（tsvector）或 LIKE 模糊匹配

**14. 活动日志（Audit Log）**
- 记录关键操作（谁在什么时候做了什么）
- 任务的操作历史时间线

**15. 工程化与部署**
- 完善的单元测试（Jest）+ 集成测试（Supertest）
- 结构化日志（Pino / Winston）
- Docker 容器化（docker-compose 含 NestJS + PostgreSQL）
- 健康检查接口 `/health`
- 环境变量管理（多环境配置）
- API 限流（Throttler）

#### 🟧 前端配套
- WebSocket 客户端（socket.io-client）实时同步
- 通知中心（Toast + 通知列表）
- 搜索（防抖 + 高亮）
- `next.config` 生产配置（图片域名、环境变量）
- Vercel 部署上线

#### 阶段三学到什么
- 🟦 WebSocket、事件驱动、全文搜索、审计日志、TDD、Docker 部署
- 🟧 实时数据同步、通知交互、生产配置、Vercel 部署
- 🔗 WebSocket 鉴权、前后端事件协议（packages/shared）、全栈联调上线

---

## 六、API 设计规范

### RESTful 风格约定

```
GET    /api/v1/resources          # 列表
POST   /api/v1/resources          # 创建
GET    /api/v1/resources/:id      # 详情
PATCH  /api/v1/resources/:id      # 部分更新
DELETE /api/v1/resources/:id      # 删除
```

### 统一响应格式

```typescript
// 成功
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}

// 列表（带分页）
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}

// 错误
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "邮箱格式不正确",
    "details": [ ... ]
  }
}
```

### 认证方式
```
Authorization: Bearer <access_token>
```

---

## 七、验收标准（每阶段）

### 阶段一验收 ✅
- [ ] 能用前端页面完成注册→登录→创建任务全流程
- [ ] JWT 认证生效，未登录无法访问受保护页面与接口
- [ ] Swagger 文档可访问且准确
- [ ] 数据正确持久化到 PostgreSQL
- [ ] 列表页首屏 SSR（查看源代码有内容）

### 阶段二验收 ✅
- [ ] 能邀请用户加入工作空间并设置角色
- [ ] 不同角色的权限边界正确（MEMBER 不能删除工作空间等）
- [ ] 看板任务可拖拽排序（前端实现，后端正确更新 position）
- [ ] 文件上传功能正常

### 阶段三验收 ✅
- [ ] 多人同时操作看板，状态实时同步
- [ ] 通知系统正常工作
- [ ] 搜索功能可用
- [ ] Docker 一键启动（`docker-compose up`）
- [ ] 测试覆盖率 > 60%
- [ ] 前端上线 Vercel，可公网访问

---

## 八、学习路线对照

```
阶段一 MVP        →  NestJS 基础 + 认证 + Prisma + Next.js SSR
       │
       ▼
阶段二 协作权限    →  RBAC + 复杂查询 + 拖拽 + Server Actions
       │
       ▼
阶段三 实时生产化  →  WebSocket + 测试 + Docker + Vercel 部署
```

> 详细的双线学习节奏见 `docs/ROADMAP.md`

---

> 💡 提示：你最大的优势是**前端直觉**。设计 API 时先问自己：
> "如果我是前端，我希望这个接口返回什么？"——这样设计出来的后端 API 天然就是优秀的。
