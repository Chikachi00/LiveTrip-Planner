# LiveTrip Planner

## 中文说明

LiveTrip Planner 是一个演唱会远征规划器前端 MVP。它帮助用户记录演出计划、预算拆分、体力压力、住宿体验和主观评分，并自动生成总预算与 0-100 的“值得去指数”。

### v0.2 功能

- Dashboard：展示全部演出远征计划卡片、计划总预算、平均指数、下一场和当前最优选择。
- 新建 / 编辑计划：填写并修改演出日期、城市、场馆、票价、手续费、交通、酒店、餐饮、周边、本地交通、喜欢程度、稀有程度、疲劳程度、座位满意度、酒店安静程度、后悔风险和时间线字段。
- 删除计划：详情页删除前会确认，删除后从 localStorage 移除并返回 Dashboard。
- 值得去指数解释：展示最终分数、建议文字和分数拆解，包括喜欢程度、稀有程度、座位满意度、酒店安静程度、疲劳程度、后悔风险和预算压力。
- 预算图表：使用 Recharts 展示票价、手续费、交通、酒店、餐饮、周边和本地交通的预算拆分。
- 时间线：根据已有字段生成出发、到达演出城市、酒店入住、前往场馆、入场、开演、结束、返回酒店或返程。
- 比较页排序：支持按值得去指数、总预算、演出日期、喜欢程度和稀有程度排序。
- 本地保存：所有数据仍保存在浏览器 localStorage。
- 示例数据：内置 GKSS Day1 横滨、GKSS Day2 横滨、Ado 横滨三条示例计划。

### 技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
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

- Cloudflare D1 云端同步
- Markdown 行程导出
- AI 行程建议
- 场馆数据库
- 多币种与汇率手动配置

## English

LiveTrip Planner is a frontend MVP for planning concert travel. It helps users capture trip details, budget items, fatigue, lodging quality, and subjective ratings, then calculates the total cost and a 0-100 worth score.

### v0.2 Features

- Dashboard: shows all concert trip cards, total budget, average score, next trip, and the strongest current option.
- Create / Edit Plans: capture and update date, city, venue, ticket price, service fee, transportation, hotel, food, merch, local transit, preference, rarity, fatigue, seat satisfaction, hotel quietness, regret risk, and timeline fields.
- Delete Plans: detail page asks for confirmation before removing a plan from localStorage and returning to the Dashboard.
- Worth Score Explanation: shows the final score, advice, and breakdown items for preference, rarity, seat satisfaction, hotel quietness, fatigue, regret risk, and budget pressure.
- Budget Chart: uses Recharts to visualize ticket, service fee, transportation, hotel, food, merch, and local transit costs.
- Timeline: generates departure, city arrival, hotel check-in, venue travel, entry, show start, show end, and return steps from available fields.
- Compare Sorting: supports sorting by worth score, total budget, show date, preference, and rarity.
- Local persistence: stores all data in browser localStorage.
- Sample plans: includes GKSS Day1 Yokohama, GKSS Day2 Yokohama, and Ado Yokohama.

### Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
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

- Cloudflare D1 cloud sync
- Markdown itinerary export
- AI itinerary suggestions
- Venue database
- Manual multi-currency settings
