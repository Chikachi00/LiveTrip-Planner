import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import type { TripPlanInput } from "../types";
import { RatingInput } from "./RatingInput";

const today = new Date().toISOString().slice(0, 10);

export const defaultPlanInput: TripPlanInput = {
  title: "",
  artist: "",
  date: today,
  city: "",
  venue: "",
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
  ["transportCost", "大交通"],
  ["hotelCost", "酒店"],
  ["foodBudget", "餐饮"],
  ["merchBudget", "周边"],
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
  onSubmit: (value: TripPlanInput) => void;
};

export const PlanForm = ({
  initialValue = defaultPlanInput,
  title,
  subtitle,
  submitLabel,
  onSubmit,
}: PlanFormProps) => {
  const [form, setForm] = useState<TripPlanInput>({
    ...defaultPlanInput,
    ...initialValue,
  });

  const updateField = <Key extends keyof TripPlanInput>(
    key: Key,
    value: TripPlanInput[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      ...form,
      title: form.title.trim(),
      artist: form.artist.trim(),
      city: form.city.trim(),
      venue: form.venue.trim(),
      notes: form.notes?.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6">
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
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <Save size={18} />
          {submitLabel}
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
                value={form.date}
                onChange={(event) => updateField("date", event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                城市
              </span>
              <input
                required
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
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
                value={form.venue}
                onChange={(event) => updateField("venue", event.target.value)}
                placeholder="K-Arena Yokohama"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                备注
              </span>
              <textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                rows={4}
                placeholder="记录抽票、同行、请假、换乘或其他小提醒"
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
                  value={form[key]}
                  onChange={(event) => updateField(key, Number(event.target.value))}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-flight focus:ring-4 focus:ring-blue-100"
                />
              </label>
            ))}
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
            hint="数字越高，行程越累。"
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
