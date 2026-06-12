# LiveTrip Planner

## 中文

### 项目简介

LiveTrip Planner 是一个面向演唱会、Live、展会联动远征的轻量 full-stack 规划工具。它帮助用户把“想不想冲”拆成可比较的计划：预算、交通、住宿、座位、体力、后悔风险、时间线和云端备份都放在同一个产品里。

- Live Demo: https://livetrip-planner.pages.dev
- 当前版本：v0.4
- 默认主存储：浏览器 `localStorage`
- 可选云同步：Cloudflare Pages Functions + Cloudflare D1

### 项目动机

演出远征常常不是单纯买一张票，而是一次小型旅行决策：票价、手续费、酒店、交通、周边预算、座位视野、第二天体力恢复都会影响体验。LiveTrip Planner 的目标是让这些主观和客观因素都能被记录、解释、比较、导出，并在需要时手动同步到云端。

### 核心功能

- 创建、编辑、删除演出远征计划
- 自动计算总预算
- 生成 0-100 的“值得去指数”
- 展示值得去指数拆解：喜欢程度、稀有程度、座位满意度、酒店安静程度、疲劳、后悔风险、预算压力
- 使用 Recharts 展示预算拆分图表
- 自动生成基础行程时间线
- 多计划横向比较，并支持按值得去指数、总预算、日期、喜欢程度、稀有程度排序
- 单个计划导出 Markdown，可复制到剪贴板或下载 `.md` 文件
- 全部计划导出 JSON 备份
- 从 JSON 文件导入计划，并校验基本结构
- 追加示例数据，不覆盖已有计划
- 一键清空本地数据，带确认提示
- Cloudflare D1 云端同步：手动上传、手动拉取、断开同步

### v0.4 云端同步

LiveTrip Planner v0.4 增加了 Cloudflare D1 云端同步，但仍然保持本地优先设计：

- 不做用户注册
- 不做登录系统
- 不做 OAuth
- 不做邮箱验证
- 不做实时同步
- 使用匿名 Sync Space 机制
- `localStorage` 仍然是主存储
- 云端同步只在用户点击“上传”或“拉取”时发生

#### Sync Space 匿名同步机制

用户可以创建一个 Sync Space，系统会返回：

- `syncSpaceId`：同步空间 ID，例如 `space_xxxxxxxx`
- `syncToken`：同步令牌，例如 `token_xxxxxxxxxxxxxxxxxxxx`

`syncToken` 只显示一次。服务端不会保存明文 token，只会保存 SHA-256 后的 `token_hash`。后续同步接口通过请求头鉴权：

```text
x-sync-space-id: space_xxxxxxxx
x-sync-token: token_xxxxxxxxxxxxxxxxxxxx
```

#### 手动上传 / 手动拉取

- 上传：把当前本地 `TripPlan[]` 上传到 D1，同 id 计划执行 upsert。
- 拉取：从 D1 拉取该 Sync Space 下的计划，并与本地计划合并。
- 合并规则：id 不同直接追加；id 相同则优先保留 `updatedAt` 较新的版本；无法判断时保留本地版本。

### D1 表结构

```sql
CREATE TABLE IF NOT EXISTS sync_spaces (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cloud_trip_plans (
  id TEXT PRIMARY KEY,
  sync_space_id TEXT NOT NULL,
  plan_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (sync_space_id) REFERENCES sync_spaces(id)
);
```

### Pages Functions API

项目使用 Cloudflare Pages Functions，而不是独立 Worker。API 文件位于：

```text
functions/api/[[route]].ts
```

当前接口：

- `GET /api/health`
- `POST /api/sync-spaces`
- `POST /api/sync/push`
- `GET /api/sync/pull`

健康检查返回：

```json
{
  "ok": true,
  "service": "LiveTrip Planner API"
}
```

### 技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- lucide-react
- Cloudflare Pages
- Cloudflare Pages Functions
- Cloudflare D1
- localStorage

### 本地运行方式

```bash
npm install
npm run dev
```

构建检查：

```bash
npm run build
```

### Cloudflare Pages 部署和绑定

- Build command: `npm run build`
- Build output directory: `dist`
- D1 binding name: `DB`
- D1 database name: `live-trip-planner-db`
- Pages Functions path: `functions/api/[[route]].ts`

`wrangler.toml` 中的关键配置：

```toml
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "live-trip-planner-db"
```

### 项目结构

```text
functions/
  api/
    [[route]].ts     # Cloudflare Pages Functions API
migrations/
  0001_init.sql      # D1 schema
public/
  _redirects         # SPA fallback
  _routes.json       # Pages Functions route include
src/
  components/        # 复用 UI：卡片、表单、图表、导出、数据管理、云同步
  data/              # 示例数据
  lib/               # Cloud Sync API client
  pages/             # Dashboard、详情、编辑、新建、比较页
  utils/             # 计算、格式化、存储、Markdown、JSON 管理
  types.ts           # TripPlan 类型和评分结果类型
docs/screenshots/    # README 预留截图目录
```

### 功能截图

> 截图待补充，预留路径如下：

- Dashboard: `docs/screenshots/dashboard.png`
- Detail: `docs/screenshots/detail.png`
- Compare: `docs/screenshots/compare.png`

### 设计亮点

- 本地优先：没有云端配置时，应用仍然完整可用。
- 手动同步：避免误覆盖和复杂实时冲突。
- 匿名同步：不做账号体系，用 Sync Space 降低使用门槛。
- 评分可解释：最终指数拆成加分和扣分项，适合解释“为什么值得去”。
- 数据可带走：Markdown 适合分享行程，JSON 适合备份迁移，D1 适合跨设备恢复。
- UI 风格克制：接近 Notion + Google Flights 的轻量工具感，避免过度二次元或过度商务。

### 后续计划

- 云端删除同步和软删除 UI
- Markdown 行程模板自定义
- AI 行程建议
- 场馆数据库
- 多币种与汇率手动配置
- PWA 离线访问

## English

### Overview

LiveTrip Planner is a lightweight full-stack planning tool for concert, live event, and event-combo travel. It turns a vague “should I go?” decision into structured plans with budget, transportation, lodging, seats, fatigue, regret risk, timelines, export tools, and optional cloud sync.

- Live Demo: https://livetrip-planner.pages.dev
- Current version: v0.4
- Default primary storage: browser `localStorage`
- Optional cloud sync: Cloudflare Pages Functions + Cloudflare D1

### Motivation

A concert trip is rarely just about buying a ticket. Ticket price, service fees, hotels, transportation, merch budget, seat quality, and post-show fatigue all shape the experience. LiveTrip Planner records both objective costs and subjective tradeoffs so each trip can be compared, explained, exported, and manually synced when needed.

### Core Features

- Create, edit, and delete concert trip plans
- Automatically calculate total budget
- Generate a 0-100 worth score
- Explain the worth score with preference, rarity, seat satisfaction, hotel quietness, fatigue, regret risk, and budget pressure
- Visualize budget breakdown with Recharts
- Generate a basic itinerary timeline
- Compare multiple plans with sorting by worth score, total budget, date, preference, and rarity
- Export a single plan as Markdown, with clipboard copy and `.md` download
- Export all plans as a JSON backup
- Import plans from a JSON file with basic validation
- Append sample data without overwriting existing plans
- Clear all local data with confirmation
- Cloudflare D1 sync with manual push, manual pull, and disconnect

### v0.4 Cloud Sync

LiveTrip Planner v0.4 adds Cloudflare D1 cloud sync while keeping the app local-first:

- No user registration
- No login system
- No OAuth
- No email verification
- No real-time sync
- Anonymous Sync Space mechanism
- `localStorage` remains the primary storage
- Cloud sync only runs when the user clicks push or pull

#### Anonymous Sync Space

Users can create a Sync Space. The API returns:

- `syncSpaceId`, for example `space_xxxxxxxx`
- `syncToken`, for example `token_xxxxxxxxxxxxxxxxxxxx`

The `syncToken` is shown only once. The server never stores it in plain text; it stores only the SHA-256 `token_hash`. Sync endpoints authenticate with request headers:

```text
x-sync-space-id: space_xxxxxxxx
x-sync-token: token_xxxxxxxxxxxxxxxxxxxx
```

#### Manual Push / Pull

- Push: uploads the current local `TripPlan[]` to D1 and upserts plans by id.
- Pull: downloads plans from D1 for the connected Sync Space and merges them with local plans.
- Merge rule: different ids are appended; matching ids keep the newer `updatedAt`; if freshness cannot be determined, the local version is kept.

### D1 Schema

```sql
CREATE TABLE IF NOT EXISTS sync_spaces (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cloud_trip_plans (
  id TEXT PRIMARY KEY,
  sync_space_id TEXT NOT NULL,
  plan_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (sync_space_id) REFERENCES sync_spaces(id)
);
```

### Pages Functions API

The project uses Cloudflare Pages Functions, not a standalone Worker. API code lives at:

```text
functions/api/[[route]].ts
```

Current endpoints:

- `GET /api/health`
- `POST /api/sync-spaces`
- `POST /api/sync/push`
- `GET /api/sync/pull`

Health check response:

```json
{
  "ok": true,
  "service": "LiveTrip Planner API"
}
```

### Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- lucide-react
- Cloudflare Pages
- Cloudflare Pages Functions
- Cloudflare D1
- localStorage

### Local Development

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

### Cloudflare Pages Deployment and Binding

- Build command: `npm run build`
- Build output directory: `dist`
- D1 binding name: `DB`
- D1 database name: `live-trip-planner-db`
- Pages Functions path: `functions/api/[[route]].ts`

Important `wrangler.toml` settings:

```toml
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "live-trip-planner-db"
```

### Project Structure

```text
functions/
  api/
    [[route]].ts     # Cloudflare Pages Functions API
migrations/
  0001_init.sql      # D1 schema
public/
  _redirects         # SPA fallback
  _routes.json       # Pages Functions route include
src/
  components/        # Reusable UI: cards, forms, charts, export, data management, cloud sync
  data/              # Sample data
  lib/               # Cloud Sync API client
  pages/             # Dashboard, detail, edit, new, compare pages
  utils/             # Calculations, formatting, storage, Markdown, JSON management
  types.ts           # TripPlan and score result types
docs/screenshots/    # Reserved README screenshot directory
```

### Screenshots

> Screenshots are reserved for future updates:

- Dashboard: `docs/screenshots/dashboard.png`
- Detail: `docs/screenshots/detail.png`
- Compare: `docs/screenshots/compare.png`

### Design Highlights

- Local-first: the app remains fully usable without cloud configuration.
- Manual sync: avoids accidental overwrites and complex real-time conflicts.
- Anonymous sync: no account system, lower usage friction with Sync Space.
- Explainable scoring: the final score is broken down into positive and negative factors.
- Portable data: Markdown for itinerary sharing, JSON for backup and migration, D1 for cross-device recovery.
- Calm product UI: a lightweight Notion + Google Flights feel without becoming overly anime-styled or corporate.

### Roadmap

- Cloud delete sync and soft-delete UI
- Custom Markdown itinerary templates
- AI itinerary suggestions
- Venue database
- Manual multi-currency settings
- PWA offline access
