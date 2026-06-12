# LiveTrip Planner

## 中文

### 项目简介

LiveTrip Planner 是一个面向演唱会、Live、展会联动和跨城远征的轻量 full-stack 规划工具。它把“这场到底值不值得去？”拆成可记录、可比较、可解释、可导出、可备份和可手动同步的决策流程。

- Live Demo: https://livetrip-planner.pages.dev
- 当前版本：v0.7
- 默认存储：浏览器 `localStorage`
- 可选云端同步：Cloudflare Pages Functions + Cloudflare D1
- D1 binding name: `DB`
- D1 database name: `live-trip-planner-db`

### 项目动机

演出远征不是单纯买一张票，而是一次小型旅行决策。票价、手续费、交通、酒店、餐饮、周边、座位体验、体力恢复、稀有程度、后悔风险、场馆散场压力和住宿区域都会影响最终体验。LiveTrip Planner 的目标是把这些主观和客观因素结构化，帮助用户更理性地决定是否出发，也能沉淀自己的演出远征知识库。

### 核心功能

- 创建、编辑、删除演出远征计划
- 自动计算总预算和 0-100 的“值得去指数”
- Score Breakdown：展示喜欢程度、稀有程度、座位满意度、酒店安静程度、疲劳、后悔风险和预算压力的影响
- Smart Advice Engine：基于规则生成预算、交通、住宿、票务、场馆和城市建议，不依赖 AI API
- Recharts 预算拆分图表
- 基础行程时间线
- 多计划比较，并支持按值得去指数、总预算、演出日期、喜欢程度、稀有程度排序
- Markdown 行程导出，支持复制和下载 `.md`
- JSON 备份和导入，v0.7 起包含 `tripPlans` 和 `customVenues`
- 示例数据加载和清空本地数据
- Cloudflare D1 手动云端同步：创建 Sync Space、上传本地计划、从云端拉取计划
- 内置场馆数据库、场馆风险评分和住宿区域建议
- 用户自定义场馆管理，保存到 localStorage
- 城市模板 / City Guide：提供推荐住宿区域、性价比区域、交通提示和夜间返程提示
- 外部地图搜索跳转：Google Maps、Apple Maps，中国场馆支持百度地图和高德地图搜索链接

### v0.7：个人场馆知识库

v0.7 将项目从内置场馆知识库扩展为个人可维护的远征知识库：

- 新增 `/venues` 场馆库页面
- 内置场馆和自定义场馆统一搜索、筛选和展示
- 自定义场馆支持新增、编辑、删除
- 新建 / 编辑计划时可以选择内置场馆或自定义场馆
- 如果只是手动输入场馆名，也可以一键“保存为自定义场馆”
- 详情页展示场馆提示和 City Guide 城市建议
- Smart Advice Engine 会结合场馆风险和城市模板生成更具体的建议
- Markdown 导出包含场馆提示、城市建议和外部地图搜索链接
- JSON 备份包含自定义场馆，导入时不会覆盖已有数据或重复 id

自定义场馆目前只保存在 localStorage，不写入 D1。这样可以保持 v0.7 范围清晰，不扩大数据库结构和同步冲突处理。后续版本可以把自定义场馆、城市偏好和个人备注纳入 Cloud Sync。

### 场馆数据库

内置场馆数据位于 `src/data/venues.ts`，本阶段不接地图 API、不接实时酒店价格、不接交通实时查询。重点是提供稳定、可解释、可维护的远征决策参考。

已内置场馆包括：

- 日本：K-Arena Yokohama、Yokohama Arena、Nissan Stadium、Zepp Yokohama、Tokyo Dome、Makuhari Messe、Saitama Super Arena、Osaka-jō Hall、Pia Arena MM、Pacifico Yokohama
- 中国：上海梅赛德斯-奔驰文化中心、杭州奥体中心体育馆、长沙贺龙体育中心、北京凯迪拉克中心、广州宝能观致文化中心

每个场馆包含 1-5 分静态评分：

- 交通便利度：越高代表交通越方便
- 散场风险：越高代表散场拥挤风险越高
- 住宿难度：越高代表住宿越难或越贵
- 当天往返难度：越高代表越不推荐当天往返

### 城市模板 / City Guide

城市模板位于 `src/data/cityGuides.ts`，用于补充场馆之外的城市级判断。当前包含 Yokohama、Tokyo、Chiba / Makuhari、Saitama、Osaka、Shanghai、Hangzhou、Changsha、Beijing、Guangzhou。

每个城市模板包含：

- 推荐住宿区域
- 性价比区域
- 交通方便区域
- 不太推荐区域
- 交通提示
- 酒店提示
- 夜间返程提示
- 演出远征提示

### 为什么不接地图 API / 酒店 API / AI API

- 保持项目无需 API Key，适合公开展示和 Cloudflare Pages 部署
- 避免实时价格、地图授权、隐私和配额成本
- 让建议逻辑保持可解释、可测试、可维护
- v0.7 的重点是个人知识沉淀，而不是实时信息平台
- 后续可以加入地图跳转增强、用户自定义城市模板、Cloud Sync 扩展或 AI summary layer

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
  0001_init.sql        # D1 schema
public/
  _redirects           # SPA fallback
  _routes.json         # Pages Functions route include
src/
  components/          # UI components
  data/
    cityGuides.ts      # static city templates
    samplePlans.ts     # sample trip plans
    venues.ts          # built-in venue database
  lib/
    adviceEngine.ts    # Smart Advice Engine
    cloudSync.ts       # Cloud Sync API client
    customVenues.ts    # localStorage custom venue helpers
  pages/               # Dashboard, detail, edit, new, compare, venues, settings
  utils/               # calculations, storage, markdown, maps, data management
  types.ts             # TripPlan types
docs/screenshots/      # README screenshot placeholders
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
- 个人知识库：内置场馆、用户自定义场馆和城市模板共同服务远征决策
- 外部地图跳转：只生成搜索链接，不接地图 API，也不需要 API Key
- 评分可解释：最终指数拆成加分和扣分项
- 建议可解释：使用规则算法，而不是黑盒模型
- 数据可带走：Markdown 适合分享，JSON 适合备份迁移，D1 适合跨设备恢复
- UI 克制：接近 Notion + Google Flights 的轻量工具感，避免过度二次元或过度商务

### 后续计划

- Cloud Sync 支持自定义场馆和城市偏好
- 用户自定义城市模板
- 场馆详情页和更丰富的地图跳转
- 云端删除同步和软删除 UI
- Markdown 行程模板自定义
- AI summary layer，用于总结规则建议，不替代规则引擎
- 多币种与汇率手动配置
- PWA 离线访问

## English

### Overview

LiveTrip Planner is a lightweight full-stack planning tool for concert, live event, convention, and cross-city trip decisions. It turns a vague “should I go?” question into structured plans with budget, comparison, explainable scoring, export, backup, and optional manual cloud sync.

- Live Demo: https://livetrip-planner.pages.dev
- Current version: v0.7
- Primary storage: browser `localStorage`
- Optional cloud sync: Cloudflare Pages Functions + Cloudflare D1
- D1 binding name: `DB`
- D1 database name: `live-trip-planner-db`

### Motivation

A concert trip is not just a ticket purchase. Ticket price, service fees, transport, hotels, meals, merch, seat quality, fatigue, rarity, regret risk, venue crowd flow, and hotel areas all affect the final experience. LiveTrip Planner structures those factors so users can make calmer decisions and build a personal trip knowledge base over time.

### Core Features

- Create, edit, and delete trip plans
- Calculate total budget and a 0-100 worth score
- Score breakdown for preference, rarity, seat satisfaction, hotel quietness, fatigue, regret risk, and budget pressure
- Rule-driven Smart Advice Engine for budget, travel, hotel, ticket, venue, and city advice
- Recharts budget breakdown chart
- Basic trip timeline
- Multi-plan comparison with sorting by worth score, budget, date, preference, and rarity
- Markdown export with copy and `.md` download
- JSON backup and import, including `tripPlans` and `customVenues` since v0.7
- Sample data loading and local data reset
- Cloudflare D1 manual sync through anonymous Sync Spaces
- Built-in venue database with venue risk scores and hotel area suggestions
- User-managed custom venues stored in localStorage
- City Guide templates for hotel areas, transport notes, and late-night return advice
- External map search links for Google Maps, Apple Maps, and China-specific map searches where applicable

### v0.7: Personal Venue Knowledge Base

v0.7 expands the project from a built-in venue database into a personal trip knowledge base:

- New `/venues` page
- Unified search, filtering, and display for built-in and custom venues
- Custom venues can be created, edited, and deleted
- Plan forms can select both built-in and custom venues
- Manually typed venue names can be saved as custom venues
- Detail pages show both Venue Insight and City Guide cards
- Smart Advice Engine uses venue risks and city templates for more specific advice
- Markdown export includes venue insight, city guide content, and map search links
- JSON backup includes custom venues without overwriting existing user data

Custom venues are localStorage-only in v0.7 and are not synced to D1 yet. This keeps the database scope and conflict model simple. A later version can extend Cloud Sync to include custom venues, city preferences, and personal notes.

### Venue Database

Built-in venue data lives in `src/data/venues.ts`. This version does not use map APIs, real-time hotel prices, or real-time transit queries. The goal is stable, explainable, maintainable decision support.

Built-in venues include:

- Japan: K-Arena Yokohama, Yokohama Arena, Nissan Stadium, Zepp Yokohama, Tokyo Dome, Makuhari Messe, Saitama Super Arena, Osaka-jō Hall, Pia Arena MM, Pacifico Yokohama
- China: Mercedes-Benz Arena Shanghai, Hangzhou Olympic Sports Center Gymnasium, Changsha Helong Sports Center, Cadillac Arena Beijing, Guangzhou Baoneng Qoros Arena

Each venue has static 1-5 scores:

- Access score: higher means easier access
- Crowd risk score: higher means more crowd pressure after events
- Hotel difficulty score: higher means hotels are harder or more expensive
- Day-trip difficulty score: higher means same-day return is less recommended

### City Guide

City templates live in `src/data/cityGuides.ts` and add city-level planning context beyond venue-specific advice. Current guides include Yokohama, Tokyo, Chiba / Makuhari, Saitama, Osaka, Shanghai, Hangzhou, Changsha, Beijing, and Guangzhou.

Each guide includes recommended hotel areas, budget areas, convenient areas, avoid areas, transport notes, hotel notes, late-night notes, event tips, and general notes.

### Why No Map, Hotel, or AI API

- No API keys are required, which keeps the project easy to deploy and safe to showcase
- It avoids real-time pricing, map licensing, privacy, and quota concerns
- Advice remains explainable, testable, and maintainable
- v0.7 focuses on personal knowledge capture instead of real-time search
- Future versions can add richer map links, custom city templates, Cloud Sync expansion, or an AI summary layer

### Cloud Sync

LiveTrip Planner supports Cloudflare D1 sync while staying local-first:

- No registration
- No login system
- No OAuth
- No email verification
- No real-time sync
- Anonymous Sync Space model
- `localStorage` remains the primary store
- Cloud sync only happens when the user manually pushes or pulls

A Sync Space returns:

- `syncSpaceId`, for example `space_xxxxxxxx`
- `syncToken`, for example `token_xxxxxxxxxxxxxxxxxxxx`

The token is shown only once. The server stores only a SHA-256 `token_hash`, not the plain token. Sync requests authenticate with:

```text
x-sync-space-id: space_xxxxxxxx
x-sync-token: token_xxxxxxxxxxxxxxxxxxxx
```

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
  data/
    cityGuides.ts      # static city templates
    samplePlans.ts     # sample trip plans
    venues.ts          # built-in venue database
  lib/
    adviceEngine.ts    # Smart Advice Engine
    cloudSync.ts       # Cloud Sync API client
    customVenues.ts    # localStorage custom venue helpers
  pages/               # Dashboard, detail, edit, new, compare, venues, settings
  utils/               # calculations, storage, markdown, maps, data management
  types.ts             # TripPlan types
docs/screenshots/      # README screenshot placeholders
```

### Screenshots

Screenshots are reserved at:

- Dashboard: `docs/screenshots/dashboard.png`
- Detail: `docs/screenshots/detail.png`
- Compare: `docs/screenshots/compare.png`

### Design Highlights

- Local-first: the app is fully usable without cloud setup
- Manual sync: avoids silent overwrites and complicated real-time conflicts
- Anonymous sync: Sync Spaces provide portability without accounts
- Personal knowledge base: built-in venues, custom venues, and city guides support trip decisions
- External map links: search links only, no map API or API key
- Explainable scoring: final scores are broken into positive and negative factors
- Explainable advice: rule-based recommendations instead of a black-box model
- Portable data: Markdown for sharing, JSON for backup, D1 for cross-device recovery
- Calm UI: a lightweight Notion + Google Flights feel, without becoming too anime-styled or too corporate

### Roadmap

- Cloud Sync for custom venues and city preferences
- User-defined City Guides
- Venue detail pages and richer map links
- Cloud delete sync and soft-delete UI
- Custom Markdown itinerary templates
- AI summary layer on top of the rule engine
- Manual multi-currency and exchange-rate settings
- PWA offline access
