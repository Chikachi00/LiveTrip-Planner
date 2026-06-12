import { buildTimeline } from "../components/TripTimeline";
import { findVenueForPlan } from "../data/venues";
import {
  generateTripAdvice,
  getRecommendationLabel,
} from "../lib/adviceEngine";
import type { TripPlan } from "../types";
import {
  calculateTotalCost,
  calculateWorthScoreDetails,
} from "./calculations";
import { formatCurrency, formatDate } from "./format";

const safe = (value: unknown, fallback = "未填写") => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
};

const row = (label: string, value: unknown) => `| ${label} | ${safe(value)} |`;

const list = (items: string[]) => {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- 暂无";
};

export const createMarkdownFileName = (plan: TripPlan) => {
  const slug = plan.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `live-trip-${slug || "plan"}-${plan.date}.md`;
};

export const generateTripMarkdown = (plan: TripPlan) => {
  const score = calculateWorthScoreDetails(plan);
  const advice = generateTripAdvice(plan);
  const timeline = buildTimeline(plan);
  const venue = findVenueForPlan(plan);
  const budgetRows = [
    row("票价", formatCurrency(plan.ticketPrice)),
    row("手续费", formatCurrency(plan.serviceFee)),
    row("交通", formatCurrency(plan.transportCost)),
    row("酒店", formatCurrency(plan.hotelCost)),
    row("餐饮", formatCurrency(plan.foodBudget)),
    row("周边", formatCurrency(plan.merchBudget)),
    row("本地交通", formatCurrency(plan.localTransitCost)),
    row("总预算", formatCurrency(calculateTotalCost(plan))),
  ].join("\n");

  const breakdown = score.breakdown
    .map(
      (item) =>
        `- ${item.label}: ${item.value > 0 ? "+" : ""}${item.value} (${item.description})`,
    )
    .join("\n");

  const timelineText = timeline
    .map((item) => `- **${item.label}** (${safe(item.time, "待定")}): ${item.description}`)
    .join("\n");

  const venueSection = venue
    ? `
## 场馆提示 / Venue Insight

| 项目 | 内容 |
| --- | --- |
${row("场馆名称", `${venue.name}${venue.nameJa ? ` / ${venue.nameJa}` : ""}`)}
${row("城市 / 区域", `${venue.city} / ${venue.area}`)}
${row("最近车站", venue.nearestStations.join("、"))}
${row("推荐住宿区域", venue.recommendedHotelAreas.join("、"))}
${row("交通便利度", `${venue.accessScore}/5`)}
${row("散场风险", `${venue.crowdRiskScore}/5`)}
${row("住宿难度", `${venue.hotelDifficultyScore}/5`)}
${row("当天往返难度", `${venue.dayTripDifficultyScore}/5`)}

- 交通建议：${venue.transportAdvice}
- 散场建议：${venue.leavingAdvice}
- 住宿建议：${venue.hotelAdvice}
`
    : "";

  return `# ${safe(plan.title, "Live Trip Plan")}

## 基本信息

| 项目 | 内容 |
| --- | --- |
${row("演出名称", plan.title)}
${row("艺人", plan.artist)}
${row("城市", plan.city)}
${row("场馆", plan.venue)}
${row("日期", formatDate(plan.date))}
${row("开始时间", plan.showStartTime)}
${row("结束时间", plan.showEndTime)}

## 票务信息

| 项目 | 内容 |
| --- | --- |
${row("票价", formatCurrency(plan.ticketPrice))}
${row("手续费", formatCurrency(plan.serviceFee))}
${row("座位类型", plan.seatType)}
${row("座位满意度", `${plan.seatSatisfaction}/10`)}

## 交通信息

| 项目 | 内容 |
| --- | --- |
${row("出发城市", plan.departureCity)}
${row("交通方式", plan.transportMode)}
${row("交通费用", formatCurrency(plan.transportCost))}
${row("单程耗时", plan.oneWayDuration)}

## 住宿信息

| 项目 | 内容 |
| --- | --- |
${row("酒店区域", plan.hotelArea)}
${row("每晚价格", plan.hotelNightlyPrice ? formatCurrency(plan.hotelNightlyPrice) : "")}
${row("住宿晚数", plan.hotelNights)}
${row("到场馆通勤时间", plan.venueCommuteTime)}
${row("安静程度", `${plan.hotelQuietness}/10`)}

## 预算拆分

| 项目 | 金额 |
| --- | --- |
${budgetRows}

## 值得去指数

- 最终分数：**${score.finalScore}/100**
- 建议：${score.advice}

### 评分拆解

${breakdown}

${venueSection}
## 智能建议 / Smart Advice

- 推荐等级：${getRecommendationLabel(advice.recommendationLevel)}
- Summary：${advice.summary}

### Highlights

${list(advice.highlights)}

### Risks

${list(advice.risks)}

### Suggestions

${list(advice.suggestions)}

## 时间线

${timelineText}

## 备注

${safe(plan.notes, "暂无备注")}
`;
};

export const downloadTextFile = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};
