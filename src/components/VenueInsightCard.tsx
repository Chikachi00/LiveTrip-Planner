import { Building2, Hotel, TrainFront } from "lucide-react";
import { formatVenueType, type Venue } from "../data/venues";

type VenueInsightCardProps = {
  venue: Venue;
};

const scoreItems = (venue: Venue) => [
  ["交通便利度", venue.accessScore],
  ["散场风险", venue.crowdRiskScore],
  ["住宿难度", venue.hotelDifficultyScore],
  ["当天往返难度", venue.dayTripDifficultyScore],
] as const;

export const VenueInsightCard = ({ venue }: VenueInsightCardProps) => {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-flight">
            <Building2 size={16} />
            Venue Insight
          </p>
          <h2 className="mt-2 text-xl font-semibold">场馆提示</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {venue.name}
            {venue.nameJa ? ` / ${venue.nameJa}` : ""} · {venue.city} · {venue.area}
          </p>
        </div>
        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700">
          {formatVenueType(venue.venueType)}
          {venue.capacity ? ` · ${venue.capacity.toLocaleString()} 人` : ""}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {scoreItems(venue).map(([label, score]) => (
          <div key={label} className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-semibold text-ink">{score}/5</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg bg-slate-50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <TrainFront size={16} className="text-flight" />
            最近车站
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {venue.nearestStations.map((station) => (
              <span
                key={station}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                {station}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Hotel size={16} className="text-moss" />
            推荐住宿区域
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {venue.recommendedHotelAreas.map((area) => (
              <span
                key={area}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-ink">交通建议</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {venue.transportAdvice}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {venue.arrivalAdvice}
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-ink">散场建议</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {venue.leavingAdvice}
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-ink">住宿建议</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {venue.hotelAdvice}
          </p>
        </div>
        {venue.notes ? (
          <div className="rounded-lg border border-slate-100 p-4">
            <h3 className="text-sm font-semibold text-ink">备注</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{venue.notes}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
};
