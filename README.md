# LiveTrip Planner

## 中文说明

LiveTrip Planner 是一个演唱会远征规划器前端 MVP。它帮助用户记录演出计划、预算拆分和主观体验评分，并自动生成总预算与 0-100 的“值得去指数”。

### 功能

- 首页 Dashboard：展示全部演出远征计划卡片、总预算、平均指数和当前最优选择。
- 新建计划页：填写演出日期、城市、场馆、票价、交通费、酒店费、餐饮预算、周边预算、喜欢程度、稀有程度、疲劳程度和座位满意度。
- 计划详情页：展示预算拆分、值得去指数、基础建议、备注和行程时间线。
- 比较页：横向比较多个演出计划，快速判断哪一场更值得去。
- 本地保存：所有数据保存在浏览器 localStorage。
- 示例数据：内置 GKSS Day1 横滨、GKSS Day2 横滨、Ado 横滨三条示例计划。

### 技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- lucide-react
- localStorage

### 运行方式

```bash
npm install
npm run dev
```

构建检查：

```bash
npm run build
```

### 后续计划

- 支持编辑已有计划。
- 增加按城市、日期和分数筛选。
- 增加预算上限提醒。
- 增加导出 CSV 或图片分享功能。
- 增加多币种和汇率手动配置。

## English

LiveTrip Planner is a frontend MVP for planning concert travel. It helps users capture trip details, budget items, and subjective experience ratings, then calculates the total cost and a 0-100 worth score.

### Features

- Dashboard: shows all concert trip cards, total budget, average score, and the strongest current option.
- New Plan: captures date, city, venue, ticket price, transportation, hotel, food, merch, preference, rarity, fatigue, and seat satisfaction.
- Plan Detail: shows budget breakdown, worth score, basic advice, notes, and a trip timeline.
- Compare: compares multiple plans side by side.
- Local persistence: stores data in browser localStorage.
- Sample plans: includes GKSS Day1 Yokohama, GKSS Day2 Yokohama, and Ado Yokohama.

### Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- lucide-react
- localStorage

### Getting Started

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

### Roadmap

- Edit existing plans.
- Filter by city, date, and score.
- Add budget limit reminders.
- Export to CSV or shareable images.
- Add manual multi-currency settings.
