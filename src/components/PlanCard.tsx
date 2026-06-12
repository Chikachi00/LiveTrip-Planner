import { Calendar, MapPin, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import type { TripPlan } from "../types";
import { calculateTotalCost, calculateWorthScore } from "../utils/calculations";
import { formatCurrency, formatDate } from "../utils/format";
import { ScoreRing } from "./ScoreRing";

type PlanCardProps = {
  plan: TripPlan;
};

export const PlanCard = ({ plan }: PlanCardProps) => {
  const total = calculateTotalCost(plan);
  const score = calculateWorthScore(plan);

  return (
    <Link
      to={`/plans/${plan.id}`}
      className="group block rounded-lg border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-flight/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-flight">{plan.artist}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal text-ink">
            {plan.title}
          </h2>
        </div>
        <ScoreRing score={score} size="sm" />
      </div>

      <div className="mt-5 space-y-3 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <Calendar size={16} className="text-moss" />
          {formatDate(plan.date)}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={16} className="text-coral" />
          {plan.city} · {plan.venue}
        </p>
        <p className="flex items-center gap-2">
          <WalletCards size={16} className="text-sun" />
          总预算 {formatCurrency(total)}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span>喜欢 {plan.preference}/10</span>
        <span>稀有 {plan.rarity}/10</span>
        <span>座位 {plan.seatSatisfaction}/10</span>
      </div>
    </Link>
  );
};
