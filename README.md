# LiveTrip Planner

## 中文

### 项目简介

LiveTrip Planner 是一个面向演唱会、Live、展会联动远征的轻量 full-stack 规划工具。它把“这场到底值不值得冲？”拆成可记录、可比较、可解释的计划：预算、交通、住宿、座位、疲劳、后悔风险、时间线、Markdown 导出、本地备份和 Cloudflare D1 云端同步。

- Live Demo: https://livetrip-planner.pages.dev
- 当前版本：v0.5
- 默认主存储：浏览器 `localStorage`
- 可选云同步：Cloudflare Pages Functions + Cloudflare D1
- D1 binding name: `DB`
- D1 database name: `live-trip-planner-db`

### 项目动机

演出远征通常不是单纯买一张票，而是一次小型旅行决策。票价、手续费、酒店、交通、周边预算、座位体验、第二天体力恢复、稀有程度和错过成本都会影响最终体验。LiveTrip Planner 的目标是把这些主观和客观因素结构化，让用户能够理性比较、导出、备份，并在需要时手动同步到云端。

### 核心功能

- 创建、编辑、删除演出远征计划
- 自动计算总预算
- 生成 0-100 的“值得去指数”
- 展示 Score Breakdown：喜欢程度、稀有程度、座位满意度、酒店安静程度、疲劳、后悔风险、预算压力
- v0.5 Smart Advice Engine：基于规则生成行程与决策建议
- 使用 Recharts 展示票价、手续费、交通、酒店、餐饮、周边、本地交通预算拆分
- 自动生成基础行程时间线
- 多计划横向比较，并支持按值得去指数、总预算、演出日期、喜欢程度、稀有程度排序
- 计划详情导出 Markdown，可复制到剪贴板或下载 `.md` 文件
- 全部计划导出 JSON 备份
- 从 JSON 文件导入计划，并校验基本结构
- 加载示例数据，不覆盖用户已有计划
- 清空本地数据，带确认提示
- Cloudflare D1 云端同步：匿名 Sync Space、手动上传、手动拉取、断开同步

### v0.5 Smart Advice Engine

v0.5 增加了纯前端、规则驱动的 Smart Advice Engine，不依赖任何外部 AI API。它会根据每个 `TripPlan` 的值得去指数、预算、喜欢程度、稀有程度、座位满意度、疲劳程度、交通耗时、住宿价格、酒店安静程度和通勤时间，生成更具体的建议。

建议结果包含：

- 推荐等级：强烈推荐、推荐、可以考虑、不太建议
- Summary：一句话总览
- 推荐理由
- 风险提示
- 优化建议
- 预算建议
- 交通建议
- 住宿建议
- 票务建议

本阶段不接 AI API 的原因：

- 保持项目可公开部署，无需 API Key
- 降低用户隐私和成本风险
- 确保离线和本地优先场景可用
- 让建议逻辑可解释、可测试、可维护

后续可以在规则建议之上加入 AI summary layer，用于把结构化建议润色成更自然的行程摘要，但核心决策逻辑仍应保持可解释。

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

`syncToken` 只显示一次。服务端不会保存明文 token，只保存 SHA-256 后的 `token_hash`。后续同步接口通过请求头鉴权：

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
    [[route]].ts       # Cloudflare Pages Functions API
migrations/
  0001_init.sql        # D1 schema
public/
  _redirects           # SPA fallback
  _routes.json         # Pages Functions route include
src/
  components/          # UI components
  data/                # sample plans
  lib/
    adviceEngine.ts    # Smart Advice Engine
    cloudSync.ts       # Cloud Sync API client
  pages/               # Dashboard, detail, edit, new, compare
  utils/               # calculations, storage, markdown, data management
  types.ts             # TripPlan types
docs/screenshots/      # README screenshot placeholders
```

### 功能截图

> 截图待补充，预留路径如下：

- Dashboard: `docs/screenshots/dashboard.png`
- Detail: `docs/screenshots/detail.png`
- Compare: `docs/screenshots/compare.png`

### 设计亮点

- 本地优先：没有云端配置时，应用仍然完整可用。
- 手动同步：避免静默覆盖和复杂实时冲突。
- 匿名同步：不做账号系统，用 Sync Space 降低使用门槛。
- 评分可解释：最终指数拆成加分和扣分项。
- 智能建议可解释：v0.5 使用规则算法，而不是黑盒模型。
- 数据可带走：Markdown 适合分享行程，JSON 适合备份迁移，D1 适合跨设备恢复。
- UI 克制：接近 Notion + Google Flights 的轻量工具感，避免过度二次元或过度商务。

### 后续计划

- 云端删除同步和软删除 UI
- Markdown 行程模板自定义
- AI summary layer，用于总结规则建议
- 场馆数据库
- 多币种与汇率手动配置
- PWA 离线访问

## English

### Overview

LiveTrip Planner is a lightweight full-stack planning tool for concert, live event, and event-combo travel. It turns a vague “should I go?” decision into structured plans with budget, transportation, lodging, seats, fatigue, regret risk, timelines, Markdown export, local backup, and optional Cloudflare D1 sync.

- Live Demo: https://livetrip-planner.pages.dev
- Current version: v0.5
- Primary storage: browser `localStorage`
- Optional cloud sync: Cloudflare Pages Functions + Cloudflare D1
- D1 binding name: `DB`
- D1 database name: `live-trip-planner-db`

### Motivation

A concert trip is rarely just about buying a ticket. Ticket price, service fees, hotels, transportation, merch budget, seat quality, next-day recovery, rarity, and regret risk all shape the experience. LiveTrip Planner records both objective costs and subjective tradeoffs so each trip can be compared, explained, exported, backed up, and manually synced when needed.

### Core Features

- Create, edit, and delete concert trip plans
- Automatically calculate total budget
- Generate a 0-100 worth score
- Explain the worth score with preference, rarity, seat satisfaction, hotel quietness, fatigue, regret risk, and budget pressure
- v0.5 Smart Advice Engine with rule-driven trip and decision advice
- Visualize budget breakdown with Recharts
- Generate a basic itinerary timeline
- Compare multiple plans with sorting by worth score, total budget, date, preference, and rarity
- Export a single plan as Markdown, with clipboard copy and `.md` download
- Export all plans as a JSON backup
- Import plans from a JSON file with basic validation
- Append sample data without overwriting existing plans
- Clear all local data with confirmation
- Cloudflare D1 sync with anonymous Sync Space, manual push, manual pull, and disconnect

### v0.5 Smart Advice Engine

v0.5 adds a pure front-end, rule-driven Smart Advice Engine. It does not call any external AI API. For each `TripPlan`, it evaluates the worth score, total budget, preference, rarity, seat satisfaction, fatigue, travel duration, hotel price, hotel quietness, and commute time.

The result includes:

- Recommendation level: strong go, go, consider, or skip
- Summary
- Highlights
- Risks
- Suggestions
- Budget advice
- Travel advice
- Hotel advice
- Ticket advice

Why no AI API at this stage:

- The project can be deployed publicly without API keys
- User privacy and running cost stay low
- Local-first usage remains reliable
- Advice remains explainable, testable, and maintainable

A future AI summary layer can be added on top of the rule engine to rewrite structured advice into more natural itinerary summaries, while keeping the core decision logic explainable.

### v0.4 Cloud Sync

LiveTrip Planner v0.4 added Cloudflare D1 cloud sync while keeping the app local-first:

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

The project uses Cloudflare Pages Functions rather than a standalone Worker. The API entry lives at:

```text
functions/api/[[route]].ts
```

Available endpoints:

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

### Cloudflare Pages Deployment

- Build command: `npm run build`
- Build output directory: `dist`
- D1 binding name: `DB`
- D1 database name: `live-trip-planner-db`
- Pages Functions path: `functions/api/[[route]].ts`

Key `wrangler.toml` settings:

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
    [[route]].ts       # Cloudflare Pages Functions API
migrations/
  0001_init.sql        # D1 schema
public/
  _redirects           # SPA fallback
  _routes.json         # Pages Functions route include
src/
  components/          # UI components
  data/                # sample plans
  lib/
    adviceEngine.ts    # Smart Advice Engine
    cloudSync.ts       # Cloud Sync API client
  pages/               # Dashboard, detail, edit, new, compare
  utils/               # calculations, storage, markdown, data management
  types.ts             # TripPlan types
docs/screenshots/      # README screenshot placeholders
```

### Screenshots

> Screenshots are placeholders for now:

- Dashboard: `docs/screenshots/dashboard.png`
- Detail: `docs/screenshots/detail.png`
- Compare: `docs/screenshots/compare.png`

### Design Highlights

- Local-first: the app remains fully usable without cloud setup.
- Manual sync: avoids silent overwrites and complex real-time conflicts.
- Anonymous sync: Sync Space avoids a full account system.
- Explainable scoring: final scores are broken down into positive and negative factors.
- Explainable smart advice: v0.5 uses transparent rules instead of a black-box model.
- Portable data: Markdown for sharing, JSON for backup, D1 for cross-device recovery.
- Restrained UI: a lightweight Notion + Google Flights style, without leaning too anime or too corporate.

### Roadmap

- Cloud delete sync and soft-delete UI
- Custom Markdown itinerary templates
- AI summary layer for rule-based advice
- Venue database
- Manual multi-currency and exchange-rate settings
- PWA offline access
