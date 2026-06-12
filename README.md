# LiveTrip Planner

## 中文

### 项目简介

LiveTrip Planner 是一个面向演唱会、Live、展会联动和跨城远征的轻量 full-stack 规划工具。它把“这场到底值不值得去？”拆成可记录、可比较、可解释、可导出、可备份和可手动同步的决策流程。

- Live Demo: https://livetrip-planner.pages.dev
- 当前版本：v0.8
- 默认存储：浏览器 `localStorage`
- 云端同步：Cloudflare Pages Functions + Cloudflare D1
- D1 binding name: `DB`
- D1 database name: `live-trip-planner-db`

### 项目动机

演出远征不是单纯买一张票，而是一次小型旅行决策。票价、手续费、交通、酒店、餐饮、周边、座位体验、体力恢复、稀有程度、后悔风险、场馆散场压力和住宿区域都会影响最终体验。LiveTrip Planner 的目标是把这些因素结构化，帮助用户理性决定是否出发，并沉淀自己的演出远征知识库。

### 核心功能

- 创建、编辑、删除演出远征计划
- 自动计算总预算和 0-100 的“值得去指数”
- Score Breakdown：展示喜欢程度、稀有程度、座位满意度、酒店安静程度、疲劳、后悔风险和预算压力
- Smart Advice Engine：基于规则生成预算、交通、住宿、票务、场馆、城市和用户偏好建议
- Recharts 预算拆分图表
- 基础行程时间线
- 多计划比较，并支持按值得去指数、总预算、演出日期、喜欢程度、稀有程度排序
- Markdown 行程导出，支持复制和下载 `.md`
- JSON 备份和导入，包含 `tripPlans`、`customVenues` 和 `userPreferences`
- 示例数据加载和清空本地数据
- Cloudflare D1 手动云端同步：计划、自定义场馆和用户偏好
- 内置场馆数据库、场馆风险评分和住宿区域建议
- 用户自定义场馆管理
- 城市模板 / City Guide
- 外部地图搜索跳转：Google Maps、Apple Maps，中国场馆支持百度地图和高德地图

### v0.8：同步个人知识库

v0.8 增强了 Cloud Sync，使 Sync Space 不只同步 Trip Plans，也能同步个人知识库数据：

- 自定义场馆云端同步
- 用户偏好设置
- 偏好驱动的智能建议
- Cloud Sync 数据范围扩展为 `tripPlans`、`customVenues`、`userPreferences`
- JSON 备份包含 `userPreferences`
- D1 新增 `cloud_custom_venues` 和 `cloud_user_preferences`
- 仍然保持匿名 Sync Space，不做完整账号系统

### 用户偏好设置

用户偏好保存在 localStorage，并可通过 Sync Space 手动同步。当前包含：

- 出发城市 / 常驻城市
- 默认货币：`JPY`、`CNY`、`USD`、`MYR`
- 默认餐饮预算
- 默认本地交通预算
- 默认周边预算
- 默认地图服务：Google Maps、Apple Maps、百度地图、高德地图
- 酒店安静偏好
- 疲劳敏感度
- 预算敏感度
- 是否优先住场馆附近
- 是否避免深夜返程
- 备注

新建计划时会自动应用常驻城市和默认预算。Smart Advice Engine 会参考偏好，例如安静偏好高时提醒睡眠风险，疲劳敏感度高时提醒长交通和当天往返风险，预算敏感度高时提醒控制高预算场次。

### Cloud Sync

LiveTrip Planner 使用 Cloudflare D1 提供手动云端同步，但仍然保持本地优先：

- 不做用户注册
- 不做登录系统
- 不做 OAuth
- 不做邮箱验证
- 不做实时同步
- 使用匿名 Sync Space 机制
- `localStorage` 仍然是主存储
- 云端同步只在用户点击上传或拉取时发生

创建 Sync Space 后会返回：

- `syncSpaceId`：例如 `space_xxxxxxxx`
- `syncToken`：例如 `token_xxxxxxxxxxxxxxxxxxxx`

`syncToken` 只显示一次。服务端不保存明文 token，只保存 SHA-256 后的 `token_hash`。同步接口通过请求头鉴权：

```text
x-sync-space-id: space_xxxxxxxx
x-sync-token: token_xxxxxxxxxxxxxxxxxxxx
```

### D1 表结构

`migrations/0001_init.sql`:

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

`migrations/0002_add_custom_venues_and_preferences.sql`:

```sql
CREATE TABLE IF NOT EXISTS cloud_custom_venues (
  id TEXT PRIMARY KEY,
  sync_space_id TEXT NOT NULL,
  venue_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (sync_space_id) REFERENCES sync_spaces(id)
);

CREATE TABLE IF NOT EXISTS cloud_user_preferences (
  sync_space_id TEXT PRIMARY KEY,
  preferences_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

`POST /api/sync/push` 支持：

```json
{
  "plans": [],
  "customVenues": [],
  "preferences": {}
}
```

`GET /api/sync/pull` 返回：

```json
{
  "ok": true,
  "plans": [],
  "customVenues": [],
  "preferences": {}
}
```

健康检查返回：

```json
{
  "ok": true,
  "service": "LiveTrip Planner API"
}
```

### 场馆数据库与城市模板

内置场馆数据位于 `src/data/venues.ts`，城市模板位于 `src/data/cityGuides.ts`。本阶段不接地图 API、不接实时酒店价格、不接交通实时查询，重点是提供稳定、可解释、可维护的远征决策参考。

内置场馆包含日本和中国的常见演出场馆，例如 K-Arena Yokohama、Yokohama Arena、Nissan Stadium、Tokyo Dome、Makuhari Messe、Saitama Super Arena、上海梅赛德斯-奔驰文化中心、杭州奥体中心体育馆、长沙贺龙体育中心、北京凯迪拉克中心和广州宝能观致文化中心。

### 为什么仍然不做完整账号系统

- Sync Space 已能满足个人跨设备恢复和轻量共享
- 不需要注册、登录、OAuth 或邮箱验证，降低使用门槛
- 不保存身份信息，减少隐私和安全负担
- 更适合 Cloudflare Pages + D1 的轻量部署模型
- 后续如果需要多人协作，可以在 Sync Space 之上扩展权限模型

### 为什么不接地图 API / 酒店 API / AI API

- 项目无需 API Key，适合公开展示和部署
- 避免实时价格、地图授权、隐私和配额成本
- 建议逻辑保持可解释、可测试、可维护
- 外部地图只使用普通搜索链接
- AI 可以作为后续 summary layer，但不替代当前规则引擎

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

新增 migration 后，需要在 Cloudflare D1 上执行迁移，例如：

```bash
wrangler d1 migrations apply live-trip-planner-db
```

`wrangler.toml` 关键配置：

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
  0001_init.sql
  0002_add_custom_venues_and_preferences.sql
public/
  _redirects
  _routes.json
src/
  components/
  data/
    cityGuides.ts
    samplePlans.ts
    venues.ts
  lib/
    adviceEngine.ts
    cloudSync.ts
    customVenues.ts
    userPreferences.ts
  pages/
  utils/
docs/screenshots/
```

### 功能截图

截图待补充，预留路径如下：

- Dashboard: `docs/screenshots/dashboard.png`
- Detail: `docs/screenshots/detail.png`
- Compare: `docs/screenshots/compare.png`

### 设计亮点

- 本地优先：没有云端配置时，应用仍然完整可用
- 手动同步：避免静默覆盖和复杂实时冲突
- 匿名同步：不做账号系统，用 Sync Space 降低使用门槛
- 个人知识库：计划、自定义场馆和用户偏好都可以沉淀
- 偏好驱动建议：建议会结合用户对预算、疲劳、酒店安静度和深夜返程的敏感度
- 外部地图跳转：只生成搜索链接，不接地图 API，也不需要 API Key
- 数据可带走：Markdown 适合分享，JSON 适合备份迁移，D1 适合跨设备恢复

### 后续计划

- 自定义城市模板同步
- 城市偏好和常用路线模板
- 云端删除同步和软删除 UI
- Markdown 行程模板自定义
- AI summary layer，用于总结规则建议
- 多币种与汇率手动配置
- PWA 离线访问

## English

### Overview

LiveTrip Planner is a lightweight full-stack planning tool for concert, live event, convention, and cross-city trip decisions. It turns a vague “should I go?” question into structured plans with budget, comparison, explainable scoring, export, backup, and manual cloud sync.

- Live Demo: https://livetrip-planner.pages.dev
- Current version: v0.8
- Primary storage: browser `localStorage`
- Cloud sync: Cloudflare Pages Functions + Cloudflare D1
- D1 binding name: `DB`
- D1 database name: `live-trip-planner-db`

### Motivation

A concert trip is more than a ticket purchase. Ticket prices, service fees, transport, hotels, meals, merch, seats, fatigue, rarity, regret risk, venue crowd flow, and hotel areas all shape the final experience. LiveTrip Planner structures those factors so users can make calmer decisions and build a personal trip knowledge base.

### Core Features

- Create, edit, and delete trip plans
- Calculate total budget and a 0-100 worth score
- Explainable score breakdown
- Rule-driven Smart Advice Engine for budget, travel, hotel, ticket, venue, city, and preference-aware advice
- Recharts budget breakdown chart
- Basic trip timeline
- Multi-plan comparison with sorting
- Markdown export
- JSON backup and import with `tripPlans`, `customVenues`, and `userPreferences`
- Sample data loading and local reset
- Cloudflare D1 manual sync for plans, custom venues, and user preferences
- Built-in venue database
- User-managed custom venues
- City Guide templates
- External map search links without API keys

### v0.8: Sync the Personal Knowledge Base

v0.8 expands Cloud Sync beyond Trip Plans:

- Cloud sync for custom venues
- User Preferences
- Preference-aware Smart Advice
- Sync payload now includes `tripPlans`, `customVenues`, and `userPreferences`
- JSON backups include `userPreferences`
- New D1 tables: `cloud_custom_venues` and `cloud_user_preferences`
- The app still uses anonymous Sync Spaces instead of a full account system

### User Preferences

User Preferences are stored in localStorage and can be synced manually through a Sync Space. They include home city, preferred currency, default food/local transport/merch budgets, preferred map provider, hotel quietness preference, fatigue sensitivity, budget sensitivity, stay-near-venue preference, late-night return preference, and notes.

New trip plans use the home city and default budgets automatically. The advice engine uses preferences to flag sleep, fatigue, budget, commute, and late-night return risks.

### Cloud Sync

LiveTrip Planner uses Cloudflare D1 sync while staying local-first:

- No registration
- No login system
- No OAuth
- No email verification
- No real-time sync
- Anonymous Sync Space model
- `localStorage` remains the primary store
- Cloud sync happens only when the user manually pushes or pulls

A Sync Space returns:

- `syncSpaceId`, for example `space_xxxxxxxx`
- `syncToken`, for example `token_xxxxxxxxxxxxxxxxxxxx`

The token is shown only once. The server stores only a SHA-256 `token_hash`, not the plain token. Sync requests authenticate with:

```text
x-sync-space-id: space_xxxxxxxx
x-sync-token: token_xxxxxxxxxxxxxxxxxxxx
```

### D1 Schema

`migrations/0001_init.sql` creates `sync_spaces` and `cloud_trip_plans`.

`migrations/0002_add_custom_venues_and_preferences.sql` creates:

```sql
CREATE TABLE IF NOT EXISTS cloud_custom_venues (
  id TEXT PRIMARY KEY,
  sync_space_id TEXT NOT NULL,
  venue_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (sync_space_id) REFERENCES sync_spaces(id)
);

CREATE TABLE IF NOT EXISTS cloud_user_preferences (
  sync_space_id TEXT PRIMARY KEY,
  preferences_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sync_space_id) REFERENCES sync_spaces(id)
);
```

### Pages Functions API

The project uses Cloudflare Pages Functions instead of a standalone Worker:

```text
functions/api/[[route]].ts
```

Current endpoints:

- `GET /api/health`
- `POST /api/sync-spaces`
- `POST /api/sync/push`
- `GET /api/sync/pull`

Health response:

```json
{
  "ok": true,
  "service": "LiveTrip Planner API"
}
```

### Venue Database and City Guides

Built-in venue data lives in `src/data/venues.ts`. City templates live in `src/data/cityGuides.ts`. This version does not use map APIs, real-time hotel prices, real-time transit queries, or AI APIs. The goal is stable, explainable decision support.

### Why No Full Account System

- Sync Spaces already support personal cross-device recovery
- No registration, login, OAuth, or email verification keeps the product lightweight
- The app stores no identity data
- The model fits Cloudflare Pages + D1 well
- Collaboration permissions can be layered onto Sync Spaces later if needed

### Why No Map, Hotel, or AI API

- No API keys are required
- It avoids pricing, licensing, privacy, and quota concerns
- Advice remains explainable and testable
- Map actions are plain search links
- AI may be added later as a summary layer, not as a replacement for the rules engine

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

After adding the v0.8 migration, apply D1 migrations:

```bash
wrangler d1 migrations apply live-trip-planner-db
```

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
    [[route]].ts
migrations/
  0001_init.sql
  0002_add_custom_venues_and_preferences.sql
public/
  _redirects
  _routes.json
src/
  components/
  data/
    cityGuides.ts
    samplePlans.ts
    venues.ts
  lib/
    adviceEngine.ts
    cloudSync.ts
    customVenues.ts
    userPreferences.ts
  pages/
  utils/
docs/screenshots/
```

### Screenshots

Screenshots are reserved at:

- Dashboard: `docs/screenshots/dashboard.png`
- Detail: `docs/screenshots/detail.png`
- Compare: `docs/screenshots/compare.png`

### Design Highlights

- Local-first storage
- Manual sync to avoid silent overwrites
- Anonymous Sync Spaces instead of accounts
- Personal knowledge base for plans, custom venues, and preferences
- Preference-aware advice
- External map links without map APIs
- Portable data through Markdown, JSON, and D1

### Roadmap

- Sync custom city guides
- City preferences and common route templates
- Cloud delete sync and soft-delete UI
- Custom Markdown itinerary templates
- AI summary layer on top of the rule engine
- Manual multi-currency support
- PWA offline access
