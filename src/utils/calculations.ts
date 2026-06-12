import type { TripPlan } from "../types";

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const calculateTotalCost = (plan: TripPlan): number => {
  return (
    plan.ticketPrice +
    plan.transportCost +
    plan.hotelCost +
    plan.foodBudget +
    plan.merchBudget
  );
};

export const calculateWorthScore = (plan: TripPlan): number => {
  const totalCost = calculateTotalCost(plan);
  const costScore = clamp(10 - ((totalCost - 2500) / 9500) * 10, 0, 10);
  const fatigueScore = 10 - clamp(plan.fatigue, 1, 10);

  const weighted =
    clamp(plan.preference, 1, 10) * 0.32 +
    clamp(plan.rarity, 1, 10) * 0.24 +
    clamp(plan.seatSatisfaction, 1, 10) * 0.2 +
    costScore * 0.14 +
    fatigueScore * 0.1;

  return Math.round(clamp(weighted * 10, 0, 100));
};

export const getWorthAdvice = (score: number): string => {
  if (score >= 85) {
    return "强烈推荐。综合热爱程度、稀有度和座位体验都很突出，预算压力也值得接受。";
  }

  if (score >= 70) {
    return "值得认真考虑。整体回报不错，可以重点确认交通和休息安排。";
  }

  if (score >= 55) {
    return "可以观望。建议和其他场次比较，看看是否有更好的座位或更低的行程成本。";
  }

  if (score >= 40) {
    return "谨慎安排。疲劳或预算可能会明显影响体验，除非这场有特别意义。";
  }

  return "暂不推荐。当前投入和体验预期不太平衡，可以等待更近的城市或更合适的票价。";
};
