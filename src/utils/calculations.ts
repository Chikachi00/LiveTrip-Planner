import type { TripPlan, WorthScoreResult } from "../types";

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const calculateTotalCost = (plan: TripPlan): number => {
  return (
    plan.ticketPrice +
    plan.serviceFee +
    plan.transportCost +
    plan.hotelCost +
    plan.foodBudget +
    plan.merchBudget +
    plan.localTransitCost
  );
};

export const getWorthAdvice = (score: number): string => {
  if (score >= 85) {
    return "强烈推荐。喜欢程度、稀有度和体验预期都很突出，预算压力也值得接受。";
  }

  if (score >= 70) {
    return "值得认真考虑。整体回报不错，建议重点确认交通、酒店和体力恢复。";
  }

  if (score >= 55) {
    return "可以观望。建议和其他场次比较，看看是否有更好的座位或更低的行程成本。";
  }

  if (score >= 40) {
    return "谨慎安排。疲劳、预算或后悔风险可能会明显影响体验。";
  }

  return "暂不推荐。当前投入和体验预期不太平衡，可以等待更近的城市或更合适的票价。";
};

export const calculateWorthScoreDetails = (plan: TripPlan): WorthScoreResult => {
  const totalCost = calculateTotalCost(plan);
  const preference = clamp(plan.preference, 1, 10);
  const rarity = clamp(plan.rarity, 1, 10);
  const seat = clamp(plan.seatSatisfaction, 1, 10);
  const hotelQuietness = clamp(plan.hotelQuietness, 1, 10);
  const fatigue = clamp(plan.fatigue, 1, 10);
  const regretRisk = clamp(plan.regretRisk, 1, 10);
  const budgetPressure = clamp(((totalCost - 3000) / 9000) * 10, 0, 10);

  const breakdown = [
    {
      label: "喜欢程度加分",
      value: Math.round(preference * 3.1),
      maxAbsValue: 31,
      type: "positive" as const,
      description: "越喜欢，越能抵消远征成本和疲劳。",
    },
    {
      label: "稀有程度加分",
      value: Math.round(rarity * 2.3),
      maxAbsValue: 23,
      type: "positive" as const,
      description: "限定场、巡演稀缺或复刻难度越高，加分越多。",
    },
    {
      label: "座位满意度加分",
      value: Math.round(seat * 1.8),
      maxAbsValue: 18,
      type: "positive" as const,
      description: "视野、距离和音响区域会直接影响现场回报。",
    },
    {
      label: "酒店安静程度加分",
      value: Math.round(hotelQuietness * 0.8),
      maxAbsValue: 8,
      type: "positive" as const,
      description: "休息质量越稳定，第二天的体感越好。",
    },
    {
      label: "疲劳程度扣分",
      value: -Math.round(fatigue * 1.1),
      maxAbsValue: 11,
      type: "negative" as const,
      description: "转场、请假、红眼交通和连续行程都会拉低体验。",
    },
    {
      label: "后悔风险扣分",
      value: -Math.round(regretRisk * 0.9),
      maxAbsValue: 9,
      type: "negative" as const,
      description: "如果担心票价、座位或行程不值，风险会扣分。",
    },
    {
      label: "预算压力扣分",
      value: -Math.round(budgetPressure * 1.2),
      maxAbsValue: 12,
      type: "negative" as const,
      description: "预算越高，越需要更强的喜欢程度和稀有度支撑。",
    },
  ];

  const rawScore = breakdown.reduce((sum, item) => sum + item.value, 35);
  const finalScore = Math.round(clamp(rawScore, 0, 100));

  return {
    finalScore,
    breakdown,
    advice: getWorthAdvice(finalScore),
  };
};

export const calculateWorthScore = (plan: TripPlan): number => {
  return calculateWorthScoreDetails(plan).finalScore;
};
