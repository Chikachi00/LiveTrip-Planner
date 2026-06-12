import { Building2, Moon, TrainFront } from "lucide-react";
import type { CityGuide } from "../data/cityGuides";

type CityGuideCardProps = {
  guide: CityGuide;
};

const AreaList = ({ title, items }: { title: string; items: string[] }) => (
  <div className="rounded-lg bg-slate-50 p-4">
    <h3 className="text-sm font-semibold text-ink">{title}</h3>
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600"
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

export const CityGuideCard = ({ guide }: CityGuideCardProps) => {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-flight">
          <Building2 size={16} />
          City Guide
        </p>
        <h2 className="mt-2 text-xl font-semibold">城市建议</h2>
        <p className="mt-2 text-sm text-slate-600">
          {guide.city} · {guide.country}
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AreaList title="推荐住宿区域" items={guide.recommendedAreas} />
        <AreaList title="性价比区域" items={guide.budgetAreas} />
        <AreaList title="交通方便区域" items={guide.convenientAreas} />
        <AreaList title="不太推荐区域" items={guide.avoidAreas} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-100 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <TrainFront size={16} className="text-flight" />
            交通提示
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {guide.transportNotes}
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-ink">酒店提示</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {guide.hotelNotes}
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Moon size={16} className="text-coral" />
            夜间返程提示
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {guide.lateNightNotes}
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-ink">演出远征提示</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {guide.eventTips}
          </p>
        </div>
      </div>
    </section>
  );
};
