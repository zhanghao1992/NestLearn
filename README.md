# TaskFlow 🚀

> 全栈团队任务协作平台 · 学习项目
> 前端 Next.js + 后端 NestJS + 数据库 PostgreSQL

详细需求见 [docs/PRD.md](./docs/PRD.md)，学习路线见 [docs/ROADMAP.md](./docs/ROADMAP.md)。

---

## 项目结构

```
taskflow/
├── apps/
│   ├── api/          # NestJS 后端 (端口 3001)
│   └── web/          # Next.js 前端 (端口 3000)
├── packages/
│   └── shared/       # 前后端共享类型 / DTO / 枚举
├── docker/           # docker-compose (PostgreSQL)
└── docs/             # PRD + 学习路线
```

## 环境要求

- Node.js ≥ 20（推荐 24）
- pnpm ≥ 9
- Docker（运行本地数据库）

## 快速开始

```bash
# 1. 安装所有依赖（根目录执行）
pnpm install

# 2. 启动 PostgreSQL 数据库
pnpm db:up

# 3. 复制环境变量配置
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 4. 同时启动前后端
pnpm dev
# 或分开启动:
#   pnpm dev:api   # 后端 http://localhost:3001
#   pnpm dev:web   # 前端 http://localhost:3000
```

## 访问地址

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:3000 |
| 后端 API | http://localhost:3001/api/v1 |
| Swagger 文档 | http://localhost:3001/docs |
| 健康检查 | http://localhost:3001/api/v1/health |

## 常用命令

```bash
pnpm dev          # 启动前后端开发服务器
pnpm db:up        # 启动数据库
pnpm db:down      # 停止数据库
pnpm db:logs      # 查看数据库日志
pnpm build        # 构建所有包
pnpm lint         # 全量类型检查
```

## 当前进度

- [x] Sprint 0: Monorepo 骨架 + Docker 数据库
- [x] Sprint 1: 认证全栈（JWT + 登录注册）✅
- [x] Sprint 2: 核心 CRUD（工作空间/项目/任务）✅
- [x] Sprint 3: 协作权限（RBAC + 看板拖拽 + 评论）✅
- [ ] Sprint 4: 实时与生产化（WebSocket + 部署）
