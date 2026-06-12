import { findCityGuideForPlan } from "../data/cityGuides";
import { findVenueForPlan, type Venue } from "../data/venues";
import type { UserPreferences } from "./userPreferences";
import type { TripPlan } from "../types";
import { calculateTotalCost, calculateWorthScoreDetails } from "../utils/calculations";
import { formatCurrency } from "../utils/format";

export type RecommendationLevel = "strong_go" | "go" | "consider" | "skip";

export type TripAdviceResult = {
  summary: string;
  recommendationLevel: RecommendationLevel;
  highlights: string[];
  risks: string[];
  suggestions: string[];
  budgetAdvice: string[];
  travelAdvice: string[];
  hotelAdvice: string[];
  ticketAdvice: string[];
};

const limit = (items: string[], max = 4) => items.filter(Boolean).slice(0, max);

const normalizeText = (value?: string) => value?.trim().toLowerCase() ?? "";

const parseDurationHours = (value?: string) => {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hour|hours|小时|小時)/);
  const minuteMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:m|min|minute|minutes|分钟|分鐘)/);
  const plainNumber = text.match(/(\d+(?:\.\d+)?)/);

  if (hourMatch) {
    return Number(hourMatch[1]) + (minuteMatch ? Number(minuteMatch[1]) / 60 : 0);
  }

  if (minuteMatch) {
    return Number(minuteMatch[1]) / 60;
  }

  return plainNumber ? Number(plainNumber[1]) : null;
};

const parseCommuteMinutes = (value?: string) => {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hour|hours|小时|小時)/);
  const minuteMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:m|min|minute|minutes|分钟|分鐘)/);

  if (hourMatch) {
    return Number(hourMatch[1]) * 60 + (minuteMatch ? Number(minuteMatch[1]) : 0);
  }

  if (minuteMatch) {
    return Number(minuteMatch[1]);
  }

  const plainNumber = text.match(/(\d+(?:\.\d+)?)/);
  return plainNumber ? Number(plainNumber[1]) : null;
};

const isDifferentCity = (plan: TripPlan) => {
  return Boolean(
    plan.departureCity &&
      plan.city &&
      normalizeText(plan.departureCity) !== normalizeText(plan.city),
  );
};

const areaMatches = (hotelArea: string | undefined, recommendedAreas: string[]) => {
  const target = normalizeText(hotelArea);

  if (!target) {
    return true;
  }

  return recommendedAreas.some((area) => {
    const normalizedArea = normalizeText(area);
    return target.includes(normalizedArea) || normalizedArea.includes(target);
  });
};

export const getRecommendationLabel = (level: RecommendationLevel) => {
  const labels: Record<RecommendationLevel, string> = {
    strong_go: "强烈推荐",
    go: "推荐",
    consider: "可以考虑",
    skip: "不太建议",
  };

  return labels[level];
};

export const generateTripAdvice = (
  plan: TripPlan,
  customVenues: Venue[] = [],
  preferences?: UserPreferences,
): TripAdviceResult => {
  const score = calculateWorthScoreDetails(plan).finalScore;
  const totalCost = calculateTotalCost(plan);
  const durationHours = parseDurationHours(plan.oneWayDuration);
  const commuteMinutes = parseCommuteMinutes(plan.venueCommuteTime);
  const transportMode = normalizeText(plan.transportMode);
  const longFlight = transportMode.includes("飞机") || transportMode.includes("flight");
  const noHotelForTrip = (plan.hotelNights ?? 0) === 0 && isDifferentCity(plan);
  const venue = findVenueForPlan(plan, customVenues);
  const cityGuide = findCityGuideForPlan(plan);
  const prefersQuietHotel = (preferences?.hotelQuietPreference ?? 3) >= 4;
  const fatigueSensitive = (preferences?.fatigueSensitivity ?? 3) >= 4;
  const budgetSensitive = (preferences?.budgetSensitivity ?? 3) >= 4;

  const recommendationLevel: RecommendationLevel =
    score >= 85 ? "strong_go" : score >= 70 ? "go" : score >= 55 ? "consider" : "skip";

  const highlights: string[] = [];
  const risks: string[] = [];
  const suggestions: string[] = [];
  const budgetAdvice: string[] = [];
  const travelAdvice: string[] = [];
  const hotelAdvice: string[] = [];
  const ticketAdvice: string[] = [];

  if (score >= 85) {
    highlights.push("值得去指数很高，主观热爱和体验预期足以支撑这次远征。");
  } else if (score >= 70) {
    highlights.push("整体值得去，但需要提前控制预算、体力和交通风险。");
  } else if (score >= 55) {
    suggestions.push("这场可以继续观察，建议等座位、交通或酒店信息更明确后再定。");
  } else {
    risks.push("当前分数偏低，预算、疲劳或后悔风险可能明显影响体验。");
  }

  if (totalCost <= 3500) {
    budgetAdvice.push(`总预算 ${formatCurrency(totalCost)}，性价比较高，可以保留一定周边弹性。`);
    highlights.push("预算压力较低，决策重点可以放在座位和行程体验上。");
  } else if (totalCost <= 6500) {
    budgetAdvice.push(`总预算 ${formatCurrency(totalCost)}，属于可接受区间，建议锁定交通和酒店价格。`);
  } else if (totalCost <= 9500) {
    budgetAdvice.push(`总预算 ${formatCurrency(totalCost)}，预算压力偏高，建议复查酒店、交通和周边上限。`);
    risks.push("预算已经进入偏高区间，需要确认这场的不可替代性。");
  } else {
    budgetAdvice.push(`总预算 ${formatCurrency(totalCost)} 很高，建议优先压缩酒店、周边或交通成本。`);
    risks.push("预算压力很高，如果喜欢程度或稀有度不足，后悔风险会放大。");
  }

  if (plan.preference >= 8) {
    highlights.push("喜欢程度很高，这场对你有明确的情绪价值。");
  } else if (plan.preference <= 5 && totalCost > 6500) {
    risks.push("喜欢程度不高但预算偏高，建议谨慎下单。");
  }

  if (plan.rarity >= 8) {
    highlights.push("稀有程度较高，错过成本值得认真考虑。");
  } else if (plan.rarity <= 5) {
    suggestions.push("稀有程度不高，不必强冲，可以等待更近城市或更好座位。");
  }

  if (!plan.seatType) {
    ticketAdvice.push("座位类型未填写，体验存在不确定性，建议补充票务信息。");
  }

  if (plan.seatSatisfaction >= 8) {
    ticketAdvice.push("座位满意度较高，现场观感预期不错。");
    highlights.push("座位条件能够支撑这场的体验回报。");
  } else if (plan.seatSatisfaction <= 5) {
    ticketAdvice.push("座位满意度偏低，可能影响观感和投入回报。");
    risks.push("座位预期偏弱，如果预算较高，需要重新评估是否值得。");
  }

  if (plan.fatigue >= 8) {
    travelAdvice.push("疲劳程度很高，建议减少额外观光、展会或连续转场。");
    risks.push("体力风险偏高，演出后恢复时间需要优先保证。");
  } else if (plan.fatigue >= 5) {
    travelAdvice.push("疲劳程度中等，建议至少预留半天缓冲和稳定睡眠。");
  } else {
    travelAdvice.push("疲劳压力较低，可以考虑安排轻量顺路旅行。");
  }

  if (durationHours !== null && durationHours >= 6) {
    travelAdvice.push("单程耗时较长，建议提前一天到达，避免交通延误影响入场。");
    risks.push("长距离交通会放大晚点和体力恢复风险。");
  } else if (durationHours !== null && durationHours >= 3.5) {
    travelAdvice.push("单程耗时不短，建议把到达时间安排在开演前至少 4 小时。");
  }

  if (longFlight) {
    travelAdvice.push("涉及飞行，建议预留落地后的恢复、取行李和转乘时间。");
  }

  if (noHotelForTrip) {
    hotelAdvice.push("异地演出但住宿晚数为 0，请确认当天返程、夜间交通或临时住宿安排。");
    risks.push("没有住宿缓冲，当天往返风险较高。");
  }

  if (plan.hotelQuietness <= 5 && (plan.hotelNights ?? 0) > 0) {
    hotelAdvice.push("酒店安静程度偏低，睡眠质量可能影响第二天状态。");
    risks.push("住宿安静度不足，连续行程时恢复风险更明显。");
  } else if (plan.hotelQuietness >= 8) {
    hotelAdvice.push("酒店安静程度较高，适合作为演出后恢复点。");
  }

  if (commuteMinutes !== null && commuteMinutes >= 45) {
    hotelAdvice.push("酒店到场馆通勤偏长，演出后返程压力较大，建议确认末班车或打车方案。");
    risks.push("场馆通勤时间偏长，退场高峰可能拉长返程。");
  }

  if ((plan.hotelNightlyPrice ?? 0) >= 1400) {
    hotelAdvice.push("每晚酒店价格偏高，可以比较临近车站或下一站区域。");
    budgetAdvice.push("酒店单价偏高，是优先优化的预算项。");
  }

  if (venue) {
    highlights.push(`已匹配内置场馆 ${venue.name}，可以参考静态场馆风险和住宿区域建议。`);

    if (venue.crowdRiskScore >= 4) {
      risks.push(`${venue.name} 散场风险 ${venue.crowdRiskScore}/5，建议预留离场和换乘缓冲。`);
    }

    if (venue.hotelDifficultyScore >= 4) {
      hotelAdvice.push("该场馆住宿难度偏高，建议提前锁定可取消酒店，避免临近涨价。");
      budgetAdvice.push("住宿可能是这场的主要压力项，建议先定区域再比价格。");
    }

    if (venue.dayTripDifficultyScore >= 4) {
      travelAdvice.push("该场馆当天往返难度偏高，异地远征更建议留宿一晚。");
    }

    if (venue.accessScore <= 3) {
      travelAdvice.push("场馆交通便利度一般，建议比普通场次多预留 30-45 分钟。");
    }

    if (venue.recommendedHotelAreas.length) {
      hotelAdvice.push(`推荐优先比较 ${venue.recommendedHotelAreas.slice(0, 4).join("、")} 等区域。`);
    }

    if (!areaMatches(plan.hotelArea, venue.recommendedHotelAreas)) {
      hotelAdvice.push("当前酒店区域不在推荐区域内，建议复核到场馆和散场后的通勤时间。");
    }

    if (
      commuteMinutes !== null &&
      commuteMinutes >= 35 &&
      venue.crowdRiskScore >= 4
    ) {
      risks.push("通勤时间偏长且场馆散场风险较高，演出结束后的返程压力会被放大。");
    }
  }

  if (cityGuide) {
    if (!plan.hotelArea?.trim()) {
      hotelAdvice.push(
        `酒店区域未填写，可以先参考 ${cityGuide.recommendedAreas.slice(0, 4).join("、")}。`,
      );
    }

    if (plan.hotelArea?.trim() && areaMatches(plan.hotelArea, cityGuide.avoidAreas)) {
      risks.push("当前酒店区域接近城市模板中的不推荐区域，建议复核通勤、安全和夜间便利性。");
    }

    if (plan.showEndTime && plan.showEndTime >= "21:00") {
      travelAdvice.push(cityGuide.lateNightNotes);
    }

    if (/住宿.*(难|贵)|涨价|房量|提前/.test(cityGuide.hotelNotes)) {
      hotelAdvice.push("该城市演出期间住宿波动可能较明显，建议优先选择可取消房型。");
    }

    const venueAreas = venue?.recommendedHotelAreas ?? [];
    const combinedAreas = [...venueAreas, ...cityGuide.recommendedAreas].filter(
      (area, index, array) => array.indexOf(area) === index,
    );

    if (combinedAreas.length) {
      hotelAdvice.push(`综合场馆和城市建议，可优先比较 ${combinedAreas.slice(0, 4).join("、")}。`);
    }
  }

  if (preferences) {
    if (preferences.homeCity) {
      travelAdvice.push(`常驻/出发城市是 ${preferences.homeCity}，建议优先确认从该城市出发的最稳路线和返程余量。`);
    }

    if (prefersQuietHotel && plan.hotelQuietness <= 6 && (plan.hotelNights ?? 0) > 0) {
      risks.push("你对酒店安静度偏敏感，当前酒店安静评分不高，睡眠恢复风险需要优先处理。");
      hotelAdvice.push("建议优先选择可取消、评价中明确提到安静和隔音的住宿。");
    }

    if (
      fatigueSensitive &&
      ((durationHours !== null && durationHours >= 3.5) ||
        (venue?.dayTripDifficultyScore ?? 0) >= 4)
    ) {
      risks.push("你的疲劳敏感度较高，长交通或高当天往返难度会明显放大体力压力。");
      travelAdvice.push("建议减少额外行程，并尽量安排提前到达或多住一晚。");
    }

    if (budgetSensitive && totalCost >= 6500) {
      risks.push("你的预算敏感度较高，而这次总预算偏高，建议设置明确的酒店和周边上限。");
      budgetAdvice.push("可优先压缩酒店、周边或本地交通弹性支出，避免现场临时加码。");
    }

    if (preferences.preferStayNearVenue && commuteMinutes !== null && commuteMinutes >= 30) {
      hotelAdvice.push("你偏好住场馆附近，当前通勤时间不短，建议比较更靠近场馆或直达线路的区域。");
    }

    if (
      preferences.avoidLateNightReturn &&
      ((plan.showEndTime && plan.showEndTime >= "21:00") ||
        (venue?.crowdRiskScore ?? 0) >= 4)
    ) {
      travelAdvice.push("你倾向避免深夜返程，这场建议优先安排住宿或确认末班车后的备选方案。");
      risks.push("深夜散场和返程不确定性较高，不建议把行程压到极限。");
    }
  }

  if (!suggestions.length) {
    suggestions.push("优先确认票务、交通和住宿三件事，再决定是否追加周边预算。");
  }

  if (recommendationLevel === "strong_go") {
    suggestions.push("如果档期允许，可以把这场作为主力远征计划推进。");
  } else if (recommendationLevel === "skip") {
    suggestions.push("建议等待更近城市、更好座位或预算更轻的机会。");
  }

  const summaryBase = getRecommendationLabel(recommendationLevel);
  const pressure =
    venue && venue.crowdRiskScore >= 4
      ? "场馆散场风险较高"
      : totalCost > 9500
        ? "预算很高"
        : totalCost > 6500
          ? "预算偏高"
          : plan.fatigue >= 8
            ? "疲劳风险较大"
            : plan.seatSatisfaction <= 5
              ? "座位风险较高"
              : "整体条件较平衡";

  return {
    summary: `${summaryBase}：${pressure}，值得去指数 ${score}/100。`,
    recommendationLevel,
    highlights: limit(highlights),
    risks: limit(risks),
    suggestions: limit(suggestions),
    budgetAdvice: limit(budgetAdvice),
    travelAdvice: limit(travelAdvice),
    hotelAdvice: limit(hotelAdvice),
    ticketAdvice: limit(ticketAdvice),
  };
};
