import { ArrowLeft, Building2, Save, Search } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllVenues, type Venue } from "../data/venues";
import { useUnsavedChangesWarning } from "../hooks/useUnsavedChangesWarning";
import { createVenueFromPlanText } from "../lib/customVenues";
import type { TripPlanInput } from "../types";
import { RatingInput } from "./RatingInput";

const today = new Date().toISOString().slice(0, 10);

export const defaultPlanInput: TripPlanInput = {
  title: "",
  artist: "",
  date: today,
  city: "",
  venue: "",
  venueId: "",
  seatType: "",
  departureCity: "",
  transportMode: "",
  oneWayDuration: "",
  hotelArea: "",
  hotelNightlyPrice: 0,
  hotelNights: 1,
  venueCommuteTime: "",
  ticketPrice: 800,
  serviceFee: 80,
  transportCost: 1500,
  hotelCost: 900,
  foodBudget: 400,
  merchBudget: 500,
  localTransitCost: 200,
  preference: 7,
  rarity: 6,
  fatigue: 5,
  seatSatisfaction: 7,
  hotelQuietness: 7,
  regretRisk: 4,
  departureTime: "",
  arrivalTime: "",
  hotelCheckInTime: "",
  venueArrivalTime: "",
  entryTime: "",
  showStartTime: "",
  showEndTime: "",
  returnTime: "",
  notes: "",
};

const moneyFields = [
  ["ticketPrice", "票价"],
  ["serviceFee", "手续费"],
  ["transportCost", "交通费"],
  ["hotelCost", "酒店总价"],
  ["foodBudget", "餐饮预算"],
  ["merchBudget", "周边预算"],
  ["localTransitCost", "本地交通"],
] as const;

const timeFields = [
  ["departureTime", "出发"],
  ["arrivalTime", "到达演出城市"],
  ["hotelCheckInTime", "酒店入住"],
  ["venueArrivalTime", "前往场馆"],
  ["entryTime", "入场"],
  ["showStartTime", "开演"],
  ["showEndTime", "结束"],
  ["returnTime", "返回酒店或返程"],
] as const;

type PlanFormProps = {
  initialValue?: TripPlanInput;
  title: string;
  subtitle: string;
  submitLabel: string;
  customVenues?: Venue[];
  onCreateCustomVenue?: (venue: Venue) => void;
  onSubmit: (value: TripPlanInput) => void;
};

export const PlanForm = ({
  initialValue = defaultPlanInput,
  title,
  subtitle,
  submitLabel,
  customVenues = [],
  onCreateCustomVenue,
  onSubmit,
}: PlanFormProps) => {
  const [form, setForm] = useState<TripPlanInput>({
    ...defaultPlanInput,
    ...initialValue,
  });
  const [venueSearch, setVenueSearch] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useUnsavedChangesWarning(isDirty, "当前页面存在未保存内容，确定离开吗？");

  const allVenues = useMemo(() => getAllVenues(customVenues), [customVenues]);

  const filteredVenues = useMemo(() => {
    const query = venueSearch.trim().toLowerCase();

    if (!query) {
      return allVenues;
    }

    return allVenues.filter((venue) =>
      [venue.name, venue.nameJa, venue.city, venue.country, venue.area]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [allVenues, venueSearch]);

  const updateField = <Key extends keyof TripPlanInput>(
    key: Key,
    value: TripPlanInput[Key],
  ) => {
    setIsDirty(true);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleVenueChange = (venueId: string) => {
    if (!venueId) {
      setIsDirty(true);
      setForm((current) => ({ ...current, venueId: "" }));
      return;
    }

    const selected = allVenues.find((venue) => venue.id === venueId);

    if (!selected) {
      return;
    }

    setIsDirty(true);
    setForm((current) => ({
      ...current,
      venueId: selected.id,
      city: selected.city,
      venue: selected.name,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setIsDirty(false);
    onSubmit({
      ...form,
      title: form.title.trim(),
      artist: form.artist.trim(),
      city: form.city.trim(),
      venue: form.venue.trim(),
      venueId: form.venueId?.trim(),
      seatType: form.seatType?.trim(),
      departureCity: form.departureCity?.trim(),
      transportMode: form.transportMode?.trim(),
      oneWayDuration: form.oneWayDuration?.trim(),
      hotelArea: form.hotelArea?.trim(),
      venueCommuteTime: form.venueCommuteTime?.trim(),
      notes: form.notes?.trim(),
    });
    window.setTimeout(() => setIsSaving(false), 250);
  };

  const selectedVenue = allVenues.find((venue) => venue.id === form.venueId);
  const typedVenueKnown = allVenues.some(
    (venue) =>
      venue.name.trim().toLowerCase() === form.venue.trim().toLowerCase() ||
      venue.nameJa?.trim().toLowerCase() === form.venue.trim().toLowerCase(),
  );
  const canSaveTypedVenue =
    onCreateCustomVenue &&
    form.city.trim() &&
    form.venue.trim() &&
    !form.venueId &&
    !typedVenueKnown;

  const saveTypedVenue = () => {
    if (!canSaveTypedVenue) {
      return;
    }

    const venue = createVenueFromPlanText(form.city, form.venue);
    onCreateCustomVenue(venue);
    setIsDirty(true);
    setForm((current) => ({
      ...current,
      venueId: venue.id,
      city: venue.city,
      venue: venue.name,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="plan-form"
      className="mx-auto max-w-6xl space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-ink"
          >
            <ArrowLeft size={16} />
            返回首页
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          data-testid="plan-submit-button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} />
          {isSaving ? "保存中..." : submitLabel}
        </button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">演出信息</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                计划名称
              </span>
              <input
                required
                data-testid="plan-title-input"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="例如：GKSS Day1 横滨"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                艺人 / 演出
              </span>
              <input
                required
                data-testid="plan-artist-input"
                value={form.artist}
                onChange={(event) => updateField("artist", event.target.value)}
                placeholder="Ado"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                演出日期
              </span>
              <input
                required
                type="date"
                data-testid="plan-date-input"
                value={form.date}
                onChange={(event) => updateField("date", event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Building2 size={16} className="text-flight" />
                选择场馆
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                可选择已收录场馆自动填充城市和场馆名，也可以保持自定义场馆并手动填写。
              </p>
              <label className="mt-3 block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Search size={14} />
                  搜索场馆
                </span>
                <input
                  value={venueSearch}
                  data-testid="plan-venue-search-input"
                  onChange={(event) => setVenueSearch(event.target.value)}
                  placeholder="按场馆、城市或国家搜索"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="mt-3 block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  内置场馆数据库
                </span>
                <select
                  value={form.venueId ?? ""}
                  data-testid="plan-venue-select"
                  onChange={(event) => handleVenueChange(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">自定义场馆</option>
                  {filteredVenues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} · {venue.city} · {venue.country}
                      {venue.id.startsWith("custom_") ? " · 自定义" : " · 内置"}
                    </option>
                  ))}
                </select>
              </label>
              {selectedVenue ? (
                <p className="mt-3 rounded-md bg-white px-3 py-2 text-xs leading-5 text-slate-600">
                  已收录场馆 · 散场风险 {selectedVenue.crowdRiskScore}/5 · 推荐住宿区域{" "}
                  {selectedVenue.recommendedHotelAreas.length} 个
                </p>
              ) : null}
              {canSaveTypedVenue ? (
                <button
                  type="button"
                  onClick={saveTypedVenue}
                  className="mt-3 inline-flex h-9 items-center rounded-lg border border-flight/30 bg-white px-3 text-xs font-semibold text-flight transition hover:bg-blue-50"
                >
                  保存为自定义场馆
                </button>
              ) : null}
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                城市
              </span>
              <input
                required
                data-testid="plan-city-input"
                value={form.city}
                onChange={(event) => {
                  updateField("city", event.target.value);
                  updateField("venueId", "");
                }}
                placeholder="横滨"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                场馆
              </span>
              <input
                required
                data-testid="plan-venue-input"
                value={form.venue}
                onChange={(event) => {
                  updateField("venue", event.target.value);
                  updateField("venueId", "");
                }}
                placeholder="K-Arena Yokohama"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                座位类型
              </span>
              <input
                value={form.seatType ?? ""}
                data-testid="plan-seat-type-input"
                onChange={(event) => updateField("seatType", event.target.value)}
                placeholder="Arena / Stand / Standing"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                备注
              </span>
              <textarea
                value={form.notes}
                data-testid="plan-notes-input"
                onChange={(event) => updateField("notes", event.target.value)}
                rows={4}
                placeholder="记录抽票、同行、请假、换乘或其他提醒。"
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">预算</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {moneyFields.map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  {label}
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  data-testid={`money-${key}`}
                  value={form[key]}
                  onChange={(event) => updateField(key, Number(event.target.value))}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
                />
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">交通信息</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                出发城市
              </span>
              <input
                value={form.departureCity ?? ""}
                data-testid="plan-departure-city-input"
                onChange={(event) => updateField("departureCity", event.target.value)}
                placeholder="上海"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                交通方式
              </span>
              <input
                value={form.transportMode ?? ""}
                data-testid="plan-transport-mode-input"
                onChange={(event) => updateField("transportMode", event.target.value)}
                placeholder="飞机 + JR"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                单程耗时
              </span>
              <input
                value={form.oneWayDuration ?? ""}
                data-testid="plan-one-way-duration-input"
                onChange={(event) => updateField("oneWayDuration", event.target.value)}
                placeholder="约 6 小时"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">住宿信息</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                酒店区域
              </span>
              <input
                value={form.hotelArea ?? ""}
                data-testid="plan-hotel-area-input"
                onChange={(event) => updateField("hotelArea", event.target.value)}
                placeholder="横滨站 / 樱木町"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                每晚价格
              </span>
              <input
                type="number"
                min="0"
                data-testid="plan-hotel-nightly-price-input"
                value={form.hotelNightlyPrice ?? 0}
                onChange={(event) =>
                  updateField("hotelNightlyPrice", Number(event.target.value))
                }
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                住宿晚数
              </span>
              <input
                type="number"
                min="0"
                data-testid="plan-hotel-nights-input"
                value={form.hotelNights ?? 0}
                onChange={(event) => updateField("hotelNights", Number(event.target.value))}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                到场馆通勤时间
              </span>
              <input
                value={form.venueCommuteTime ?? ""}
                data-testid="plan-venue-commute-input"
                onChange={(event) => updateField("venueCommuteTime", event.target.value)}
                placeholder="约 15 分钟"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold">体验评分</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <RatingInput
            label="喜欢程度"
            name="preference"
            value={form.preference}
            hint="这场对你有多重要。"
            onChange={(value) => updateField("preference", value)}
          />
          <RatingInput
            label="稀有程度"
            name="rarity"
            value={form.rarity}
            hint="复刻难度、巡演稀缺性或特殊场次。"
            onChange={(value) => updateField("rarity", value)}
          />
          <RatingInput
            label="疲劳程度"
            name="fatigue"
            value={form.fatigue}
            hint="数字越高，行程越紧。"
            onChange={(value) => updateField("fatigue", value)}
          />
          <RatingInput
            label="座位满意度"
            name="seatSatisfaction"
            value={form.seatSatisfaction}
            hint="视野、距离、音响区域和入场便利度。"
            onChange={(value) => updateField("seatSatisfaction", value)}
          />
          <RatingInput
            label="酒店安静程度"
            name="hotelQuietness"
            value={form.hotelQuietness}
            hint="睡眠质量、噪音、位置和退房压力。"
            onChange={(value) => updateField("hotelQuietness", value)}
          />
          <RatingInput
            label="后悔风险"
            name="regretRisk"
            value={form.regretRisk}
            hint="数字越高，越担心不值、赶场或体验落差。"
            onChange={(value) => updateField("regretRisk", value)}
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold">时间线</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {timeFields.map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {label}
              </span>
              <input
                type="time"
                value={form[key] ?? ""}
                onChange={(event) => updateField(key, event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>
          ))}
        </div>
      </section>
    </form>
  );
};
