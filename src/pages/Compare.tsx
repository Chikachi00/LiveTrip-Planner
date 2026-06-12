import { GitCompare, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { TripPlan } from "../types";
import { calculateTotalCost, calculateWorthScore } from "../utils/calculations";
import { formatCurrency, formatDate } from "../utils/format";

type CompareProps = {
  plans: TripPlan[];
};

const rows = [
  ["日期", (plan: TripPlan) => formatDate(plan.date)],
  ["城市", (plan: TripPlan) => plan.city],
  ["场馆", (plan: TripPlan) => plan.venue],
  ["总预算", (plan: TripPlan) => formatCurrency(calculateTotalCost(plan))],
  ["值得去指数", (plan: TripPlan) => calculateWorthScore(plan).toString()],
  ["喜欢程度", (plan: TripPlan) => `${plan.preference}/10`],
  ["稀有程度", (plan: TripPlan) => `${plan.rarity}/10`],
  ["疲劳程度", (plan: TripPlan) => `${plan.fatigue}/10`],
  ["座位满意度", (plan: TripPlan) => `${plan.seatSatisfaction}/10`],
] as const;

export const Compare = ({ plans }: CompareProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    plans.slice(0, 3).map((plan) => plan.id),
  );

  const selectedPlans = useMemo(
    () => plans.filter((plan) => selectedIds.includes(plan.id)),
    [plans, selectedIds],
  );

  const bestPlan = selectedPlans.length
    ? [...selectedPlans].sort(
        (a, b) => calculateWorthScore(b) - calculateWorthScore(a),
      )[0]
    : undefined;

  const togglePlan = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-flight">
            <GitCompare size={16} />
            Compare
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            横向比较演出计划
          </h1>
        </div>
        <Link
          to="/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-ink px-4 text-sm font-semibold text-white"
        >
          新建计划
        </Link>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold">选择要比较的计划</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <label
              key={plan.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-flight/50"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(plan.id)}
                onChange={() => togglePlan(plan.id)}
                className="mt-1 h-4 w-4 accent-flight"
              />
              <span>
                <span className="block font-semibold">{plan.title}</span>
                <span className="mt-1 block text-sm text-slate-500">
                  {plan.city} · {calculateWorthScore(plan)} 分
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {bestPlan ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <p className="flex items-center gap-2 text-sm font-medium text-moss">
            <Trophy size={16} />
            当前比较结果
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{bestPlan.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            以值得去指数排序暂时领先，分数为 {calculateWorthScore(bestPlan)}，
            总预算 {formatCurrency(calculateTotalCost(bestPlan))}。
          </p>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        {selectedPlans.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="w-36 px-4 py-3 font-semibold text-slate-600">项目</th>
                  {selectedPlans.map((plan) => (
                    <th key={plan.id} className="px-4 py-3 font-semibold">
                      <Link to={`/plans/${plan.id}`} className="hover:text-flight">
                        {plan.title}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, getValue]) => (
                  <tr key={label} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-500">{label}</td>
                    {selectedPlans.map((plan) => (
                      <td key={plan.id} className="px-4 py-3 text-slate-700">
                        {getValue(plan)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">
            至少选择一个计划进行比较。
          </div>
        )}
      </section>
    </div>
  );
};
