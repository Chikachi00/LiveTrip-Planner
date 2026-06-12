import { Lightbulb } from "lucide-react";
import type { TripAdviceResult } from "../lib/adviceEngine";
import { getRecommendationLabel } from "../lib/adviceEngine";

type SmartAdvicePanelProps = {
  advice: TripAdviceResult;
};

const levelTone = {
  strong_go: "bg-emerald-50 text-emerald-700 border-emerald-200",
  go: "bg-blue-50 text-blue-700 border-blue-200",
  consider: "bg-amber-50 text-amber-700 border-amber-200",
  skip: "bg-red-50 text-red-700 border-red-200",
};

const AdviceList = ({ title, items }: { title: string; items: string[] }) => {
  if (!items.length) {
    return null;
  }

  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-flight" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const SmartAdvicePanel = ({ advice }: SmartAdvicePanelProps) => {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-flight">
            <Lightbulb size={16} />
            Smart Advice
          </p>
          <h2 className="mt-2 text-xl font-semibold">智能建议</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {advice.summary}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-sm font-semibold ${levelTone[advice.recommendationLevel]}`}
        >
          {getRecommendationLabel(advice.recommendationLevel)}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdviceList title="推荐理由" items={advice.highlights} />
        <AdviceList title="风险提示" items={advice.risks} />
        <AdviceList title="优化建议" items={advice.suggestions} />
        <AdviceList title="预算建议" items={advice.budgetAdvice} />
        <AdviceList title="交通建议" items={advice.travelAdvice} />
        <AdviceList title="住宿建议" items={advice.hotelAdvice} />
        <AdviceList title="票务建议" items={advice.ticketAdvice} />
      </div>
    </section>
  );
};
