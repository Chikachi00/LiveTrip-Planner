# LiveTrip Planner

## 中文

### 项目简介

LiveTrip Planner 是一个面向演唱会、Live、展会联动远征的轻量 full-stack 规划工具。它把“这场到底值不值得冲？”拆成可记录、可比较、可解释的计划：预算、交通、住宿、座位、疲劳、后悔风险、场馆风险、时间线、Markdown 导出、本地备份和 Cloudflare D1 云端同步。

- Live Demo: https://livetrip-planner.pages.dev
- 当前版本：v0.6
- 默认主存储：浏览器 `localStorage`
- 可选云同步：Cloudflare Pages Functions + Cloudflare D1
- D1 binding name: `DB`
- D1 database name: `live-trip-planner-db`

### 项目动机

演出远征通常不是单纯买一张票，而是一次小型旅行决策。票价、手续费、酒店、交通、周边预算、座位体验、第二天体力恢复、稀有程度、场馆散场压力和住宿区域都会影响最终体验。LiveTrip Planner 的目标是把这些主观和客观因素结构化，让用户能够理性比较、导出、备份，并在需要时手动同步到云端。

### 核心功能

- 创建、编辑、删除演出远征计划
- 从内置场馆数据库选择场馆，自动填充城市和场馆名
- 场馆提示：交通便利度、散场风险、住宿难度、当天往返难度
- 城市住宿区域建议和静态场馆交通建议
- 自动计算总预算
- 生成 0-100 的“值得去指数”
- Score Breakdown：喜欢程度、稀有程度、座位满意度、酒店安静程度、疲劳、后悔风险、预算压力
- Smart Advice Engine：基于规则生成预算、交通、住宿、票务和场馆风险建议
- 使用 Recharts 展示预算拆分图表
- 自动生成基础行程时间线
- 多计划横向比较，并支持按值得去指数、总预算、演出日期、喜欢程度、稀有程度排序
- 计划详情导出 Markdown，可复制到剪贴板或下载 `.md` 文件
- 全部计划导出 JSON 备份，从 JSON 文件导入计划
- 加载示例数据，不覆盖用户已有计划
- Cloudflare D1 云端同步：匿名 Sync Space、手动上传、手动拉取、断开同步

### v0.6 场馆数据库

v0.6 新增本地静态场馆数据库，数据位于 `src/data/venues.ts`。本阶段不接地图 API、不接实时酒店价格、不接交通实时查询，重点是提供稳定、可解释的远征决策参考。

内置场馆数据包含：

- 日本：K-Arena Yokohama、Yokohama Arena、Nissan Stadium、Zepp Yokohama、Tokyo Dome、Makuhari Messe、Saitama Super Arena、Osaka-jō Hall、Pia Arena MM、Pacifico Yokohama
- 中国：上海梅赛德斯-奔驰文化中心、杭州奥体中心体育馆、长沙贺龙体育中心、北京凯迪拉克中心、广州宝能观致文化中心

每个场馆包含 1-5 分静态评分：

- 交通便利度：越高代表交通越方便
- 散场风险：越高代表散场拥挤风险越高
- 住宿难度：越高代表住宿越难或越贵
- 当天往返难度：越高代表越不推荐当天往返

场馆数据会用于：

- 新建 / 编辑计划时选择内置场馆
- 详情页展示 Venue Insight / 场馆提示
- Dashboard 卡片展示“已收录场馆”和散场风险
- 比较页展示散场风险、住宿难度、当天往返难度
- Markdown 导出中的场馆提示区块
- Smart Advice Engine 的场馆风险建议

本阶段不接地图 API / 酒店 API 的原因：

- 保持项目无需 API Key，适合公开展示和 Cloudflare Pages 部署
- 避免实时价格、地图授权和隐私成本
- 让建议逻辑保持可解释、可测试、可维护
- 静态场馆知识已经足够支撑 MVP 级决策辅助

后续可以加入用户自定义场馆数据库、地图跳转链接、人工维护的城市模板，或在静态建议之上加入更自然的 AI summary layer。

### v0.5 Smart Advice Engine

Smart Advice Engine 是纯前端、规则驱动的建议模块，不依赖任何外部 AI API。它会根据 `TripPlan` 的值得去指数、预算、喜欢程度、稀有程度、座位满意度、疲劳程度、交通耗时、住宿价格、酒店安静程度、通勤时间和场馆风险，生成更具体的建议。

建议结果包含：

- 推荐等级：强烈推荐、推荐、可以考虑、不太建议
- Summary：一句话总览
- 推荐理由、风险提示、优化建议
- 预算建议、交通建议、住宿建议、票务建议

### v0.4 云端同步

LiveTrip Planner 使用 Cloudflare D1 云端同步，但仍然保持本地优先设计：

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
  data/
    venues.ts          # static venue database
    samplePlans.ts     # sample trip plans
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
- 场馆知识本地化：无需地图或酒店 API，也能给出稳定的远征建议。
- 评分可解释：最终指数拆成加分和扣分项。
- 智能建议可解释：使用规则算法，而不是黑盒模型。
- 数据可带走：Markdown 适合分享行程，JSON 适合备份迁移，D1 适合跨设备恢复。
- UI 克制：接近 Notion + Google Flights 的轻量工具感，避免过度二次元或过度商务。

### 后续计划

- 用户自定义场馆数据库
- 场馆详情页或地图跳转链接
- 云端删除同步和软删除 UI
- Markdown 行程模板自定义
- AI summary layer，用于总结规则建议
- 多币种与汇率手动配置
- PWA 离线访问

## English

### Overview

LiveTrip Planner is a lightweight full-stack planning tool for concert, live event, and event-combo travel. It turns a vague “should I go?” decision into structured plans with budget, transportation, lodging, seats, fatigue, regret risk, venue risk, timelines, Markdown export, local backup, and optional Cloudflare D1 sync.

- Live Demo: https://livetrip-planner.pages.dev
- Current version: v0.6
- Primary storage: browser `localStorage`
- Optional cloud sync: Cloudflare Pages Functions + Cloudflare D1
- D1 binding name: `DB`
- D1 database name: `live-trip-planner-db`

### Motivation

A concert trip is rarely just about buying a ticket. Ticket price, service fees, hotels, transportation, merch budget, seat quality, next-day recovery, rarity, venue crowd flow, and hotel area all shape the experience. LiveTrip Planner records both objective costs and subjective tradeoffs so each trip can be compared, explained, exported, backed up, and manually synced when needed.

### Core Features

- Create, edit, and delete concert trip plans
- Select venues from a built-in static venue database
- Auto-fill city and venue name after choosing a known venue
- Venue Insight: access score, crowd risk, hotel difficulty, and day-trip difficulty
- Recommended hotel areas and static venue travel advice
- Automatically calculate total budget
- Generate a 0-100 worth score
- Explain the worth score with preference, rarity, seat satisfaction, hotel quietness, fatigue, regret risk, and budget pressure
- Smart Advice Engine with rule-driven budget, travel, hotel, ticket, and venue risk advice
- Visualize budget breakdown with Recharts
- Generate a basic itinerary timeline
- Compare multiple plans with sorting by worth score, total budget, date, preference, and rarity
- Export a single plan as Markdown
- Export and import JSON backups
- Cloudflare D1 sync with anonymous Sync Space, manual push, manual pull, and disconnect

### v0.6 Venue Database

v0.6 adds a local static venue database in `src/data/venues.ts`. This version does not use map APIs, real-time hotel prices, real-time transit queries, or AI APIs. The goal is product-quality decision support rather than real-time travel search.

Built-in venues include:

- Japan: K-Arena Yokohama, Yokohama Arena, Nissan Stadium, Zepp Yokohama, Tokyo Dome, Makuhari Messe, Saitama Super Arena, Osaka-jō Hall, Pia Arena MM, Pacifico Yokohama
- China: Mercedes-Benz Arena Shanghai, Hangzhou Olympic Sports Center Gymnasium, Changsha Helong Sports Center, Beijing Cadillac Arena, Guangzhou Baoneng Guanzhi Cultural Center

Each venue uses 1-5 static scores:

- Access score: higher means easier access
- Crowd risk score: higher means more difficult post-show crowd flow
- Hotel difficulty score: higher means harder or more expensive lodging
- Day-trip difficulty score: higher means day trips are less recommended

Venue data powers:

- Venue selection in create/edit forms
- Venue Insight cards on detail pages
- Venue badges on Dashboard cards
- Venue risk fields in comparison
- Venue Insight sections in Markdown export
- Venue-aware Smart Advice

Why no map or hotel API at this stage:

- Public deployment without API keys
- Lower privacy and cost risk
- Explainable, testable, and maintainable recommendations
- Static venue knowledge already covers MVP-level trip decisions

Future versions can add user-defined venues, map jump links, manually curated city templates, or an AI summary layer on top of the rule engine.

### v0.5 Smart Advice Engine

The Smart Advice Engine is a pure front-end, rule-driven module. It evaluates the worth score, budget, preference, rarity, seat satisfaction, fatigue, travel duration, hotel price, hotel quietness, commute time, and venue risks.

The result includes:

- Recommendation level: strong go, go, consider, or skip
- Summary
- Highlights, risks, and suggestions
- Budget, travel, hotel, and ticket advice

### v0.4 Cloud Sync

LiveTrip Planner keeps cloud sync local-first:

- No user registration
- No login system
- No OAuth
- No email verification
- No real-time sync
- Anonymous Sync Space mechanism
- `localStorage` remains the primary storage
- Cloud sync only runs when the user clicks push or pull

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
    venues.ts          # static venue database
    samplePlans.ts     # sample trip plans
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
- Local venue knowledge: useful trip advice without map or hotel APIs.
- Explainable scoring: final scores are broken down into positive and negative factors.
- Explainable smart advice: transparent rules instead of a black-box model.
- Portable data: Markdown for sharing, JSON for backup, D1 for cross-device recovery.
- Restrained UI: a lightweight Notion + Google Flights style.

### Roadmap

- User-defined venue database
- Venue detail pages or map jump links
- Cloud delete sync and soft-delete UI
- Custom Markdown itinerary templates
- AI summary layer for rule-based advice
- Manual multi-currency and exchange-rate settings
- PWA offline access
