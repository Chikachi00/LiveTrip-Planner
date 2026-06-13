# LiveTrip Planner

## 中文

### 项目简介

LiveTrip Planner 是一个面向演唱会、Live、展会联动和跨城远征的轻量 full-stack 规划器。它把“这场到底值不值得去？”拆成计划、预算、场馆、城市、个人偏好、值得去指数、智能建议、导出备份和手动云端同步。

### 在线体验

Live Demo: https://livetrip-planner.pages.dev

### 项目解决的问题

演出远征通常同时包含票务、交通、住宿、餐饮、周边预算、座位体验、体力恢复、散场压力和后悔风险。普通备忘录很难比较多个场次，也很难解释“为什么值得去”。LiveTrip Planner 通过结构化数据、规则评分和本地优先同步，把冲动决策变成可复盘的规划流程。

### 核心功能

- Trip Plans：创建、编辑、删除演出远征计划
- Worth Score：0-100 值得去指数和 Score Breakdown
- Smart Advice Engine：规则驱动的预算、交通、住宿、票务、场馆、城市和偏好建议
- Venue Library：内置场馆库 + 用户自定义场馆
- City Guide：城市住宿区域和夜间返程建议
- User Preferences：常驻城市、默认预算、地图偏好、预算/疲劳/安静敏感度
- Cloud Sync：匿名 Sync Space 手动同步计划、自定义场馆和用户偏好
- Export：Markdown 行程导出、JSON 备份与导入
- Compare：多计划排序比较
- v0.9 Polish：首次使用引导、Toast 反馈、Error Boundary、未保存提醒、路由级代码拆分和 Vitest 核心测试

### 产品工作流程

1. 在 Dashboard 查看所有演出远征计划。
2. 新建计划，填写演出、预算、交通、住宿、座位和偏好评分。
3. 查看详情页中的预算图表、值得去指数、智能建议、时间线、场馆提示和城市建议。
4. 在 Compare 页面横向比较多个计划。
5. 在 Venues 页面维护自定义场馆知识库。
6. 在 Settings 页面配置用户偏好、导入导出 JSON、创建 Sync Space 并手动上传或拉取云端数据。

### 技术架构

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- Routing: React Router + `React.lazy` route splitting
- Charts: Recharts，按详情页异步加载
- Persistence: localStorage 本地优先
- Backend: Cloudflare Pages Functions
- Database: Cloudflare D1
- Testing: Vitest

### 数据流说明

本地数据始终优先写入 localStorage：

- `livetrip-planner:plans`
- `livetrip-planner:custom-venues`
- `livetrip-planner:user-preferences`
- `livetrip-planner:sync-credentials`

JSON 备份包含：

- `tripPlans`
- `customVenues`
- `userPreferences`

导入时会校验和规范化旧数据，避免坏 JSON、缺失字段、字符串数字、无效评分和重复 id 导致页面崩溃。

### Cloud Sync 架构

Cloud Sync 使用匿名 Sync Space，不做注册、登录、OAuth 或邮箱验证。

1. `POST /api/sync-spaces` 创建 `syncSpaceId` 和一次性 `syncToken`。
2. 服务端只保存 `syncToken` 的 SHA-256 hash。
3. `POST /api/sync/push` 手动上传 plans、customVenues、preferences。
4. `GET /api/sync/pull` 手动拉取云端数据。
5. 前端按 `updatedAt` 合并冲突；无法判断时保留本地版本。

### 关键设计决策

- 本地优先：没有云端配置时仍完整可用。
- 手动同步：避免静默覆盖和复杂实时冲突。
- 匿名 Sync Space：降低使用门槛，不保存身份数据。
- 不接地图 API：只生成外部搜索链接，避免 API Key、配额和隐私成本。
- 不接 AI API：Smart Advice Engine 以可解释规则为核心。
- 路由级拆包：降低首屏 bundle，Recharts 不进入主入口。
- Error Boundary：页面异常不会白屏。
- Toast 反馈：统一成功、错误、警告和信息提示。

### 页面截图

截图待补充。当前仅预留目录，不引用不存在的图片以避免破损展示。

预留路径：

- `docs/screenshots/dashboard.png`
- `docs/screenshots/plan-detail.png`
- `docs/screenshots/compare.png`
- `docs/screenshots/venues.png`
- `docs/screenshots/settings.png`
- `docs/screenshots/mobile.png`

### 本地运行

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
```

测试：

```bash
npm run test:run
```

### Cloudflare 部署

- Build command: `npm run build`
- Build output directory: `dist`
- Pages Functions path: `functions/api/[[route]].ts`
- D1 binding name: `DB`
- D1 database name: `live-trip-planner-db`

`wrangler.toml`:

```toml
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "live-trip-planner-db"
```

### D1 Migration

```bash
wrangler d1 migrations apply live-trip-planner-db
```

当前 migration：

- `migrations/0001_init.sql`: `sync_spaces`, `cloud_trip_plans`
- `migrations/0002_add_custom_venues_and_preferences.sql`: `cloud_custom_venues`, `cloud_user_preferences`

### 测试方式

Vitest 覆盖核心纯逻辑：

- 预算计算
- 值得去指数
- Smart Advice Engine
- 云端拉取合并逻辑
- JSON 导入与数据规范化

测试不依赖真实 Cloudflare D1，也不会调用线上 API。

### 项目结构

```text
functions/api/[[route]].ts       # Pages Functions API
migrations/                      # D1 schema migrations
public/                          # favicon, OG image, Pages routing
src/components/                  # UI components
src/data/                        # venues, city guides, sample plans
src/hooks/                       # document title and dirty-warning hooks
src/lib/                         # sync, advice, preferences, custom venues
src/pages/                       # lazy-loaded route pages
src/utils/                       # calculations, storage, merge, markdown
src/__tests__/                   # Vitest tests
docs/ARCHITECTURE.md             # architecture notes
CHANGELOG.md                     # version history
```

### 版本历程

详见 [CHANGELOG.md](CHANGELOG.md)。

### 后续计划

- 自定义 City Guide 同步
- 云端软删除与恢复
- 多币种手动汇率
- PWA 离线体验
- AI summary layer，仅用于总结规则建议

## English

### Overview

LiveTrip Planner is a lightweight full-stack planner for concert and event travel. It structures trip plans, budgets, venues, city guides, preferences, worth scoring, advice, exports, backups, and manual cloud sync.

Live Demo: https://livetrip-planner.pages.dev

### Problem

Concert travel decisions involve tickets, transport, hotels, food, merch, seats, fatigue, crowd risk, and regret risk. A note app is not enough for comparing options or explaining why a trip is worth it. LiveTrip Planner turns those factors into a reusable decision workflow.

### Core Features

- Trip plan CRUD
- 0-100 worth score with explainable breakdown
- Rule-driven Smart Advice Engine
- Built-in and custom venue library
- City Guide templates
- User Preferences
- Anonymous Sync Space cloud sync
- Markdown export and JSON backup
- Multi-plan comparison
- v0.9 polish: onboarding, toasts, error boundary, unsaved-change guard, route splitting, and Vitest tests

### Workflow

1. Review plans on Dashboard.
2. Create a trip plan with event, budget, transport, hotel, seat, and rating data.
3. Open details for budget charts, score, advice, timeline, venue insight, and city guide.
4. Compare multiple plans.
5. Manage custom venues.
6. Configure preferences, backup JSON, and manually sync through Settings.

### Architecture

- React + TypeScript + Vite
- Tailwind CSS
- React Router with `React.lazy`
- Recharts loaded through detail-page chunks
- localStorage-first persistence
- Cloudflare Pages Functions
- Cloudflare D1
- Vitest

### Data Flow

The app writes first to localStorage. Cloud Sync is manual. Pull conflicts are merged by `updatedAt`; when uncertain, local data wins. JSON imports are normalized for older versions and malformed fields.

### Cloud Sync

Sync Spaces avoid full accounts:

- `POST /api/sync-spaces`
- `POST /api/sync/push`
- `GET /api/sync/pull`
- Auth headers: `x-sync-space-id`, `x-sync-token`
- Tokens are hashed server-side with SHA-256

### Deployment

- Build command: `npm run build`
- Build output directory: `dist`
- D1 binding name: `DB`
- D1 database name: `live-trip-planner-db`

Apply migrations:

```bash
wrangler d1 migrations apply live-trip-planner-db
```

### Tests

```bash
npm run test:run
```

Tests cover budget logic, worth scoring, advice rules, cloud merge behavior, and JSON normalization. They do not use real D1 or external APIs.

### Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Changelog](CHANGELOG.md)

### Roadmap

- Custom City Guide sync
- Cloud soft-delete recovery
- Manual multi-currency settings
- PWA offline support
- AI summary layer on top of the rule engine
