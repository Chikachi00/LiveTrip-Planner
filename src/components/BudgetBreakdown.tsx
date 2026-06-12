import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TripPlan } from "../types";
import { calculateTotalCost } from "../utils/calculations";
import { formatCurrency } from "../utils/format";

const budgetFields = [
  ["ticketPrice", "票价"],
  ["serviceFee", "手续费"],
  ["transportCost", "交通"],
  ["hotelCost", "酒店"],
  ["foodBudget", "餐饮"],
  ["merchBudget", "周边"],
  ["localTransitCost", "本地交通"],
] as const;

type BudgetBreakdownProps = {
  plan: TripPlan;
};

export const BudgetBreakdown = ({ plan }: BudgetBreakdownProps) => {
  const total = calculateTotalCost(plan);
  const data = budgetFields
    .map(([key, label]) => ({
      key,
      name: label,
      value: plan[key],
      percent: total ? Math.round((plan[key] / total) * 100) : 0,
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">预算拆分</h2>
          <p className="mt-1 text-sm text-slate-500">票务、住宿和交通的成本结构</p>
        </div>
        <span className="text-lg font-semibold text-flight">
          {formatCurrency(total)}
        </span>
      </div>

      <div className="mt-5 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 12 }} />
            <YAxis
              width={58}
              tick={{ fill: "#64748B", fontSize: 12 }}
              tickFormatter={(value) => `¥${value}`}
            />
            <Tooltip
              cursor={{ fill: "#F1F5F9" }}
              formatter={(value) => [
                formatCurrency(Number(value ?? 0)),
                "金额",
              ]}
              labelStyle={{ color: "#1E293B" }}
            />
            <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 space-y-4">
        {data.map((item) => (
          <div key={item.key}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-600">{item.name}</span>
              <span className="font-medium">
                {formatCurrency(item.value)} · {item.percent}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-flight"
                style={{ width: `${Math.max(item.percent, 3)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
