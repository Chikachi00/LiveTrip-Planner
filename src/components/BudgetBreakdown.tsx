import type { TripPlan } from "../types";
import { calculateTotalCost } from "../utils/calculations";
import { formatCurrency } from "../utils/format";

const budgetFields = [
  ["ticketPrice", "票价"],
  ["transportCost", "交通"],
  ["hotelCost", "酒店"],
  ["foodBudget", "餐饮"],
  ["merchBudget", "周边"],
] as const;

type BudgetBreakdownProps = {
  plan: TripPlan;
};

export const BudgetBreakdown = ({ plan }: BudgetBreakdownProps) => {
  const total = calculateTotalCost(plan);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">预算拆分</h2>
        <span className="text-lg font-semibold text-flight">
          {formatCurrency(total)}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {budgetFields.map(([key, label]) => {
          const value = plan[key];
          const percent = total ? Math.round((value / total) * 100) : 0;

          return (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-medium">
                  {formatCurrency(value)} · {percent}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-flight"
                  style={{ width: `${Math.max(percent, 3)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
