import { Plane, Plus, Sparkles, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { CloudSyncPanel } from "../components/CloudSyncPanel";
import { DataManager } from "../components/DataManager";
import { PlanCard } from "../components/PlanCard";
import type { Venue } from "../data/venues";
import type { TripPlan } from "../types";
import { calculateTotalCost, calculateWorthScore } from "../utils/calculations";
import { formatCurrency, formatDate } from "../utils/format";

type DashboardProps = {
  plans: TripPlan[];
  customVenues: Venue[];
  onImportJson: (raw: string) => {
    importedPlans: number;
    importedCustomVenues: number;
  };
  onLoadSamples: () => number;
  onClearAll: () => void;
  onPullCloudPlans: (cloudPlans: TripPlan[]) => {
    added: number;
    updated: number;
    keptLocal: number;
    total: number;
  };
};

export const Dashboard = ({
  plans,
  customVenues,
  onImportJson,
  onLoadSamples,
  onClearAll,
  onPullCloudPlans,
}: DashboardProps) => {
  const topPlan = [...plans].sort(
    (a, b) => calculateWorthScore(b) - calculateWorthScore(a),
  )[0];
  const totalBudget = plans.reduce((sum, plan) => sum + calculateTotalCost(plan), 0);
  const averageScore = plans.length
    ? Math.round(
        plans.reduce((sum, plan) => sum + calculateWorthScore(plan), 0) /
          plans.length,
      )
    : 0;
  const nextPlan = [...plans].sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-flight">演唱会远征规划器</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink">
                把冲动远征变成清醒心动
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                记录场次、预算、交通、住宿和体力风险，把每一次远征都整理成可比较、可导出、可手动同步的计划。
              </p>
            </div>
            <Link
              to="/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <Plus size={18} />
              新建计划
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-mist p-4">
              <WalletCards size={18} className="text-moss" />
              <p className="mt-3 text-xs text-slate-500">计划总预算</p>
              <p className="mt-1 text-xl font-semibold">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <Sparkles size={18} className="text-flight" />
              <p className="mt-3 text-xs text-slate-500">平均值得去指数</p>
              <p className="mt-1 text-xl font-semibold">{averageScore}</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-4">
              <Plane size={18} className="text-coral" />
              <p className="mt-3 text-xs text-slate-500">下一场</p>
              <p className="mt-1 truncate text-xl font-semibold">
                {nextPlan ? formatDate(nextPlan.date) : "暂无"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-ink p-6 text-white shadow-soft">
          <p className="text-sm text-slate-300">当前最优选择</p>
          {topPlan ? (
            <>
              <h2 className="mt-3 text-2xl font-semibold">{topPlan.title}</h2>
              <p className="mt-2 text-sm text-slate-300">
                {topPlan.city} · {topPlan.venue}
              </p>
              <div className="mt-8 flex items-end justify-between gap-4">
                <span className="text-6xl font-semibold">
                  {calculateWorthScore(topPlan)}
                </span>
                <Link
                  to={`/plans/${topPlan.id}`}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink"
                >
                  查看详情
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-8">
              <p className="text-sm leading-6 text-slate-300">
                还没有计划。创建第一条远征计划后，这里会显示最值得去的一场。
              </p>
              <button
                type="button"
                onClick={onLoadSamples}
                className="mt-5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink"
              >
                加载示例数据
              </button>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">所有演出计划</h2>
          <Link to="/compare" className="text-sm font-medium text-flight">
            横向比较
          </Link>
        </div>

        {plans.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} customVenues={customVenues} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h3 className="text-lg font-semibold">创建第一个演出远征计划</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              先从一场你正在犹豫的 Live 开始。也可以加载示例数据，快速体验预算、指数和时间线。
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <Link
                to="/new"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus size={16} />
                创建第一个计划
              </Link>
              <button
                type="button"
                onClick={onLoadSamples}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-flight/40 hover:text-flight"
              >
                加载示例数据
              </button>
            </div>
          </div>
        )}
      </section>

      <CloudSyncPanel plans={plans} onPullPlans={onPullCloudPlans} />

      <DataManager
        plans={plans}
        customVenues={customVenues}
        onImportJson={onImportJson}
        onLoadSamples={onLoadSamples}
        onClearAll={onClearAll}
      />
    </div>
  );
};
