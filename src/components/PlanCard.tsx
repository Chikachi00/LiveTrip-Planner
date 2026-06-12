import { Calendar, MapPin, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import type { TripPlan } from "../types";
import { calculateTotalCost, calculateWorthScoreDetails } from "../utils/calculations";
import { formatCurrency, formatDate } from "../utils/format";
import { ScoreRing } from "./ScoreRing";

type PlanCardProps = {
  plan: TripPlan;
};

export const PlanCard = ({ plan }: PlanCardProps) => {
  const total = calculateTotalCost(plan);
  const score = calculateWorthScoreDetails(plan);

  return (
    <Link
      to={`/plans/${plan.id}`}
      className="group block rounded-lg border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-flight/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-flight">{plan.artist}</p>
          <h2 className="mt-1 line-clamp-2 text-xl font-semibold tracking-normal text-ink">
            {plan.title}
          </h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {score.advice}
          </p>
        </div>
        <ScoreRing score={score.finalScore} size="sm" />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600">
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

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span className="rounded-md bg-slate-50 px-2 py-2">
          喜欢 <strong className="text-ink">{plan.preference}</strong>
        </span>
        <span className="rounded-md bg-slate-50 px-2 py-2">
          稀有 <strong className="text-ink">{plan.rarity}</strong>
        </span>
        <span className="rounded-md bg-slate-50 px-2 py-2">
          疲劳 <strong className="text-ink">{plan.fatigue}</strong>
        </span>
      </div>
    </Link>
  );
};
