# LiveTrip Planner

## 中文

### 项目简介

LiveTrip Planner 是一个面向演唱会、Live、展会联动远征的前端规划工具。它帮助用户把“想不想冲”拆成可比较的计划：预算、交通、住宿、座位、体力、后悔风险和时间线都放在同一个界面里。

当前版本是 v0.3，数据保存在浏览器 `localStorage`，适合作为公开展示、作品集和后续云端同步版本的基础。

### 项目动机

演出远征常常不是单纯买一张票，而是一次小型旅行决策：票价、手续费、酒店、交通、周边预算、座位视野、第二天体力恢复都会影响体验。LiveTrip Planner 的目标是让这些主观和客观因素都能被记录、解释和导出。

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

### 技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- lucide-react
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

### Cloudflare Pages 部署

- Build command: `npm run build`
- Build output directory: `dist`

### 项目结构

```text
src/
  components/        # 复用 UI 组件：卡片、表单、图表、导出、数据管理
  data/              # 示例数据
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

- 评分不是黑盒：最终指数会拆成加分和扣分项，适合解释“为什么值得去”。
- 预算不是纯列表：图表和百分比同时展示，快速看出压力来源。
- 数据可带走：Markdown 适合分享行程，JSON 适合备份和迁移。
- 本地优先：不依赖数据库、登录、地图 API 或 AI API，启动成本低。
- UI 风格克制：接近 Notion + Google Flights 的轻量工具感，避免过度二次元或过度商务。

### 后续计划

- Cloudflare D1 云端同步
- Markdown 行程模板自定义
- AI 行程建议
- 场馆数据库
- 多币种与汇率手动配置
- PWA 离线访问

## English

### Overview

LiveTrip Planner is a frontend planning tool for concert, live event, and event-combo travel. It turns a vague “should I go?” decision into a structured plan with budget, transportation, lodging, seats, fatigue, regret risk, and timeline details.

The current version is v0.3. Data is stored in browser `localStorage`, making it a strong base for portfolio demos, public showcases, and future cloud-sync iterations.

### Motivation

A concert trip is rarely just about buying a ticket. Ticket price, service fees, hotels, transportation, merch budget, seat quality, and post-show fatigue all shape the experience. LiveTrip Planner records both objective costs and subjective tradeoffs so each trip can be compared, explained, and exported.

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

### Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- lucide-react
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

### Project Structure

```text
src/
  components/        # Reusable UI: cards, forms, charts, export, data management
  data/              # Sample data
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

- Explainable scoring: the final score is broken down into positive and negative factors.
- Budget clarity: charts and percentages make cost pressure easy to scan.
- Portable data: Markdown for itinerary sharing, JSON for backup and migration.
- Local-first: no database, login, map API, or AI API required.
- Calm product UI: a lightweight Notion + Google Flights feel without becoming overly anime-styled or corporate.

### Roadmap

- Cloudflare D1 cloud sync
- Custom Markdown itinerary templates
- AI itinerary suggestions
- Venue database
- Manual multi-currency settings
- PWA offline access
