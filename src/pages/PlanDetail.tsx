import {
  ArrowLeft,
  CalendarClock,
  Edit3,
  MapPin,
  Trash2,
  WalletCards,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BudgetBreakdown } from "../components/BudgetBreakdown";
import { CityGuideCard } from "../components/CityGuideCard";
import { MarkdownExportPanel } from "../components/MarkdownExportPanel";
import { ScoreBreakdown } from "../components/ScoreBreakdown";
import { ScoreRing } from "../components/ScoreRing";
import { SmartAdvicePanel } from "../components/SmartAdvicePanel";
import { TripTimeline } from "../components/TripTimeline";
import { VenueInsightCard } from "../components/VenueInsightCard";
import { findCityGuideForPlan } from "../data/cityGuides";
import { findVenueForPlan, type Venue } from "../data/venues";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { generateTripAdvice } from "../lib/adviceEngine";
import type { UserPreferences } from "../lib/userPreferences";
import type { TripPlan } from "../types";
import {
  calculateTotalCost,
  calculateWorthScoreDetails,
} from "../utils/calculations";
import { formatCurrency, formatDate } from "../utils/format";
import { createMapSearchLinks } from "../utils/mapLinks";

type PlanDetailProps = {
  plans: TripPlan[];
  customVenues: Venue[];
  userPreferences: UserPreferences;
  onDelete: (id: string) => void;
};

export const PlanDetail = ({
  plans,
  customVenues,
  userPreferences,
  onDelete,
}: PlanDetailProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const plan = plans.find((item) => item.id === id);
  useDocumentTitle(plan?.title);

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

  const scoreResult = calculateWorthScoreDetails(plan);
  const smartAdvice = generateTripAdvice(plan, customVenues, userPreferences);
  const venue = findVenueForPlan(plan, customVenues);
  const cityGuide = findCityGuideForPlan(plan);
  const mapLinks = createMapSearchLinks({
    name: venue?.name ?? plan.venue,
    city: venue?.city ?? plan.city,
    country: venue?.country,
    preferredProvider: userPreferences.preferredMapProvider,
  });

  const handleDelete = () => {
    const confirmed = window.confirm(
      `确定删除「${plan.title}」吗？删除后将从本地计划中移除。`,
    );

    if (!confirmed) {
      return;
    }

    onDelete(plan.id);
    navigate("/");
  };

  return (
    <div data-testid="plan-detail-page" className="space-y-6">
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
            <span className="inline-flex items-center gap-2">
              <WalletCards size={16} className="text-sun" />
              {formatCurrency(calculateTotalCost(plan))}
            </span>
          </p>
          {mapLinks.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {mapLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-flight/40 hover:text-flight"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={`/plans/${plan.id}/edit`}
            data-testid="plan-edit-link"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-flight/40 hover:text-flight"
          >
            <Edit3 size={16} />
            编辑
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            data-testid="plan-delete-button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={16} />
            删除
          </button>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <ScoreRing score={scoreResult.finalScore} />
            <div>
              <p className="text-sm font-medium text-slate-500">值得去指数</p>
              <h2 className="mt-1 text-2xl font-semibold">
                {scoreResult.finalScore}/100
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {scoreResult.advice}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["喜欢", plan.preference],
              ["稀有", plan.rarity],
              ["疲劳", plan.fatigue],
              ["座位", plan.seatSatisfaction],
              ["安静", plan.hotelQuietness],
              ["后悔风险", plan.regretRisk],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-semibold">{value}/10</p>
              </div>
            ))}
          </div>
        </div>

        <ScoreBreakdown result={scoreResult} />
      </section>

      {venue ? (
        <VenueInsightCard
          venue={venue}
          preferredMapProvider={userPreferences.preferredMapProvider}
        />
      ) : null}

      {cityGuide ? <CityGuideCard guide={cityGuide} /> : null}

      <SmartAdvicePanel advice={smartAdvice} />

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <BudgetBreakdown plan={plan} />
        <TripTimeline plan={plan} />
      </section>

      <MarkdownExportPanel
        plan={plan}
        customVenues={customVenues}
        userPreferences={userPreferences}
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">基础建议</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>
              当前总预算为 {formatCurrency(calculateTotalCost(plan))}。如果想降低成本，
              优先检查交通、酒店和本地交通，它们通常决定远征预算上限。
            </p>
            <p>
              {plan.seatSatisfaction >= 8
                ? "座位满意度较高，这场更适合作为主力场次。"
                : "座位满意度还有提升空间，可以继续关注换票、升级或更适合的场次。"}
            </p>
            <p>
              {plan.hotelQuietness >= 8
                ? "住宿休息质量预期不错，连续远征时会更稳。"
                : "酒店安静程度偏一般，建议确认隔音、交通距离和退房时间。"}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">备注</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {plan.notes || "还没有备注。可以在编辑页补充抽票、同行、请假和换乘提醒。"}
          </p>
        </div>
      </section>
    </div>
  );
};
