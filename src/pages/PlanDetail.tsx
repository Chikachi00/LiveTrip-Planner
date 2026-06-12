import { ArrowLeft, CalendarClock, CheckCircle2, MapPin, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BudgetBreakdown } from "../components/BudgetBreakdown";
import { ScoreRing } from "../components/ScoreRing";
import type { TripPlan } from "../types";
import {
  calculateTotalCost,
  calculateWorthScore,
  getWorthAdvice,
} from "../utils/calculations";
import { formatCurrency, formatDate } from "../utils/format";

type PlanDetailProps = {
  plans: TripPlan[];
  onDelete: (id: string) => void;
};

export const PlanDetail = ({ plans, onDelete }: PlanDetailProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const plan = plans.find((item) => item.id === id);

  if (!plan) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-semibold">没有找到这个计划</h1>
        <Link
          to="/"
          className="mt-5 inline-flex rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white"
        >
          返回首页
        </Link>
      </div>
    );
  }

  const score = calculateWorthScore(plan);
  const timeline = [
    `确认 ${formatDate(plan.date)} 的请假、签证或证件安排。`,
    `把交通和酒店锁定在 ${formatCurrency(
      plan.transportCost + plan.hotelCost,
    )} 左右。`,
    `提前查看 ${plan.venue} 入场口、物贩区和退场动线。`,
    plan.fatigue >= 7
      ? "给第二天留出恢复时间，减少连续转场。"
      : "行程疲劳可控，可以加入轻量城市散步。",
  ];

  const handleDelete = () => {
    onDelete(plan.id);
    navigate("/");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-ink"
          >
            <ArrowLeft size={16} />
            返回首页
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">{plan.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <CalendarClock size={16} className="text-flight" />
              {formatDate(plan.date)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} className="text-coral" />
              {plan.city} · {plan.venue}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <Trash2 size={16} />
          删除
        </button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-5">
            <ScoreRing score={score} />
            <div>
              <p className="text-sm font-medium text-slate-500">值得去指数</p>
              <h2 className="mt-1 text-2xl font-semibold">{score}/100</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {getWorthAdvice(score)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["喜欢", plan.preference],
              ["稀有", plan.rarity],
              ["疲劳", plan.fatigue],
              ["座位", plan.seatSatisfaction],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-semibold">{value}/10</p>
              </div>
            ))}
          </div>
        </div>

        <BudgetBreakdown plan={plan} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">基础建议</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>
              当前总预算为 {formatCurrency(calculateTotalCost(plan))}。如果想降低成本，
              优先检查交通和酒店，它们通常决定远征预算的上限。
            </p>
            <p>
              {plan.seatSatisfaction >= 8
                ? "座位满意度较高，这场更适合作为主力场次。"
                : "座位满意度还有提升空间，可以继续关注换票或追加抽选。"}
            </p>
            <p>
              {plan.rarity >= 8
                ? "稀有度较高，错过后短期内可能不容易复现。"
                : "稀有度中等，适合和其他场次一起比较后再决定。"}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">行程时间线</h2>
          <ol className="mt-4 space-y-4">
            {timeline.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm text-slate-600">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mist text-moss">
                  <CheckCircle2 size={15} />
                </span>
                <span>
                  <span className="block text-xs font-semibold text-slate-400">
                    Step {index + 1}
                  </span>
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {plan.notes ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">备注</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {plan.notes}
          </p>
        </section>
      ) : null}
    </div>
  );
};
