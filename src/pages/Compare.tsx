import { ArrowDownAZ, GitCompare, Plus, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { findVenueForPlan, type Venue } from "../data/venues";
import { generateTripAdvice } from "../lib/adviceEngine";
import type { UserPreferences } from "../lib/userPreferences";
import type { TripPlan } from "../types";
import { calculateTotalCost, calculateWorthScore } from "../utils/calculations";
import { formatCurrency, formatDate } from "../utils/format";

type CompareProps = {
  plans: TripPlan[];
  customVenues?: Venue[];
  userPreferences?: UserPreferences;
};

type SortKey = "worth" | "cost" | "date" | "preference" | "rarity";

const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "worth", label: "值得去指数" },
  { key: "cost", label: "总预算" },
  { key: "date", label: "演出日期" },
  { key: "preference", label: "喜欢程度" },
  { key: "rarity", label: "稀有程度" },
];

const venueValue = (
  plan: TripPlan,
  key: "crowdRiskScore" | "hotelDifficultyScore" | "dayTripDifficultyScore",
  customVenues: Venue[],
) => {
  const venue = findVenueForPlan(plan, customVenues);
  return venue ? `${venue[key]}/5` : "未收录";
};

const sortPlans = (plans: TripPlan[], sortKey: SortKey) => {
  return [...plans].sort((a, b) => {
    if (sortKey === "cost") {
      return calculateTotalCost(a) - calculateTotalCost(b);
    }

    if (sortKey === "date") {
      return a.date.localeCompare(b.date);
    }

    if (sortKey === "preference") {
      return b.preference - a.preference;
    }

    if (sortKey === "rarity") {
      return b.rarity - a.rarity;
    }

    return calculateWorthScore(b) - calculateWorthScore(a);
  });
};

export const Compare = ({
  plans,
  customVenues = [],
  userPreferences,
}: CompareProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    sortPlans(plans, "worth")
      .slice(0, 3)
      .map((plan) => plan.id),
  );
  const [sortKey, setSortKey] = useState<SortKey>("worth");

  const selectedPlans = useMemo(
    () => sortPlans(plans.filter((plan) => selectedIds.includes(plan.id)), sortKey),
    [plans, selectedIds, sortKey],
  );

  const bestPlan = selectedPlans.length
    ? [...selectedPlans].sort(
        (a, b) => calculateWorthScore(b) - calculateWorthScore(a),
      )[0]
    : undefined;
  const rows = [
    ["日期", (plan: TripPlan) => formatDate(plan.date)],
    ["城市", (plan: TripPlan) => plan.city],
    ["场馆", (plan: TripPlan) => plan.venue],
    [
      "建议摘要",
      (plan: TripPlan) =>
        generateTripAdvice(plan, customVenues, userPreferences).summary,
    ],
    ["散场风险", (plan: TripPlan) => venueValue(plan, "crowdRiskScore", customVenues)],
    ["住宿难度", (plan: TripPlan) => venueValue(plan, "hotelDifficultyScore", customVenues)],
    ["当天往返难度", (plan: TripPlan) => venueValue(plan, "dayTripDifficultyScore", customVenues)],
    ["座位类型", (plan: TripPlan) => plan.seatType || "未填写"],
    ["交通方式", (plan: TripPlan) => plan.transportMode || "未填写"],
    ["酒店区域", (plan: TripPlan) => plan.hotelArea || "未填写"],
    ["总预算", (plan: TripPlan) => formatCurrency(calculateTotalCost(plan))],
    ["值得去指数", (plan: TripPlan) => calculateWorthScore(plan).toString()],
    ["喜欢程度", (plan: TripPlan) => `${plan.preference}/10`],
    ["稀有程度", (plan: TripPlan) => `${plan.rarity}/10`],
    ["疲劳程度", (plan: TripPlan) => `${plan.fatigue}/10`],
    ["座位满意度", (plan: TripPlan) => `${plan.seatSatisfaction}/10`],
    ["酒店安静程度", (plan: TripPlan) => `${plan.hotelQuietness}/10`],
    ["后悔风险", (plan: TripPlan) => `${plan.regretRisk}/10`],
  ] as const;

  const togglePlan = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  if (plans.length < 2) {
    return (
      <div className="space-y-6">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-flight">
            <GitCompare size={16} />
            Compare
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            横向比较演出计划
          </h1>
        </div>
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-soft">
          <h2 className="text-xl font-semibold">至少需要两个计划才能比较</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            现在还没有足够的演出计划。创建更多计划后，可以按值得去指数、预算、日期和场馆风险排序比较。
          </p>
          <Link
            to="/new"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} />
            新建计划
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">选择要比较的计划</h2>
            <p className="mt-1 text-sm text-slate-500">
              默认按值得去指数从高到低排序，也可以切换排序方式。
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <ArrowDownAZ size={16} />
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sortPlans(plans, sortKey).map((plan) => {
            const venue = findVenueForPlan(plan, customVenues);

            return (
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
                    {plan.city} · {calculateWorthScore(plan)} 分 ·{" "}
                    {formatCurrency(calculateTotalCost(plan))}
                  </span>
                  {venue ? (
                    <span className="mt-1 block text-xs text-flight">
                      已收录场馆 · 散场风险 {venue.crowdRiskScore}/5 · 住宿难度{" "}
                      {venue.hotelDifficultyScore}/5
                    </span>
                  ) : null}
                  <span className="mt-2 block text-xs leading-5 text-slate-500">
                    {generateTripAdvice(plan, customVenues, userPreferences).summary}
                  </span>
                </span>
              </label>
            );
          })}
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
            <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
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
