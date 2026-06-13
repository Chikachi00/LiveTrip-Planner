import { Building2, Edit3, MapPin, Plus, Search, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { venues as builtInVenues, formatVenueType, type Venue } from "../data/venues";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useUnsavedChangesWarning } from "../hooks/useUnsavedChangesWarning";
import {
  createCustomVenue,
  defaultVenueInput,
  type VenueInput,
} from "../lib/customVenues";
import { createMapSearchLinks } from "../utils/mapLinks";

type VenuesProps = {
  customVenues: Venue[];
  onCreate: (venue: Venue) => void;
  onUpdate: (id: string, input: VenueInput) => void;
  onDelete: (id: string) => void;
};

type Draft = VenueInput & {
  nearestStationsText: string;
  recommendedHotelAreasText: string;
  avoidHotelAreasText: string;
};

type FieldKey = "name" | "nameJa" | "city" | "country" | "area";
type ScoreKey =
  | "accessScore"
  | "crowdRiskScore"
  | "hotelDifficultyScore"
  | "dayTripDifficultyScore";
type ListKey =
  | "nearestStationsText"
  | "recommendedHotelAreasText"
  | "avoidHotelAreasText";
type TextAreaKey =
  | "transportAdvice"
  | "arrivalAdvice"
  | "leavingAdvice"
  | "hotelAdvice"
  | "notes";

const venueTypes: Venue["venueType"][] = [
  "arena",
  "stadium",
  "hall",
  "livehouse",
  "exhibition",
  "theater",
  "other",
];

const splitList = (value: string) =>
  value
    .split(/[,，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const joinList = (value?: string[]) => (value ?? []).join("、");

const toVenueInput = (venue: Venue): VenueInput => ({
  name: venue.name,
  nameJa: venue.nameJa ?? "",
  city: venue.city,
  country: venue.country,
  area: venue.area,
  nearestStations: venue.nearestStations,
  capacity: venue.capacity,
  venueType: venue.venueType,
  accessScore: venue.accessScore,
  crowdRiskScore: venue.crowdRiskScore,
  hotelDifficultyScore: venue.hotelDifficultyScore,
  dayTripDifficultyScore: venue.dayTripDifficultyScore,
  recommendedHotelAreas: venue.recommendedHotelAreas,
  avoidHotelAreas: venue.avoidHotelAreas ?? [],
  arrivalAdvice: venue.arrivalAdvice,
  leavingAdvice: venue.leavingAdvice,
  hotelAdvice: venue.hotelAdvice,
  transportAdvice: venue.transportAdvice,
  notes: venue.notes ?? "",
});

const createDraft = (venue?: Venue): Draft => {
  const input = venue ? toVenueInput(venue) : defaultVenueInput;

  return {
    ...input,
    nearestStationsText: joinList(input.nearestStations),
    recommendedHotelAreasText: joinList(input.recommendedHotelAreas),
    avoidHotelAreasText: joinList(input.avoidHotelAreas),
  };
};

const toInput = (draft: Draft): VenueInput => ({
  name: draft.name.trim(),
  nameJa: draft.nameJa?.trim(),
  city: draft.city.trim(),
  country: draft.country.trim(),
  area: draft.area.trim(),
  nearestStations: splitList(draft.nearestStationsText),
  capacity: draft.capacity ? Number(draft.capacity) : undefined,
  venueType: draft.venueType,
  accessScore: Number(draft.accessScore),
  crowdRiskScore: Number(draft.crowdRiskScore),
  hotelDifficultyScore: Number(draft.hotelDifficultyScore),
  dayTripDifficultyScore: Number(draft.dayTripDifficultyScore),
  recommendedHotelAreas: splitList(draft.recommendedHotelAreasText),
  avoidHotelAreas: splitList(draft.avoidHotelAreasText),
  arrivalAdvice: draft.arrivalAdvice.trim(),
  leavingAdvice: draft.leavingAdvice.trim(),
  hotelAdvice: draft.hotelAdvice.trim(),
  transportAdvice: draft.transportAdvice.trim(),
  notes: draft.notes?.trim(),
});

const ScorePill = ({ label, value }: { label: string; value: number }) => (
  <span className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600">
    {label} <strong className="text-ink">{value}/5</strong>
  </span>
);

const VenueCard = ({
  venue,
  isCustom,
  onEdit,
  onDelete,
}: {
  venue: Venue;
  isCustom: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) => {
  const mapLinks = createMapSearchLinks({
    name: venue.name,
    city: venue.city,
    country: venue.country,
  });

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-flight">
            {isCustom ? "自定义场馆" : "内置场馆"}
          </p>
          <h2 className="mt-1 text-lg font-semibold">{venue.name}</h2>
          {venue.nameJa ? (
            <p className="mt-1 text-xs text-slate-500">{venue.nameJa}</p>
          ) : null}
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={15} className="text-coral" />
            {venue.city} · {venue.area} · {formatVenueType(venue.venueType)}
          </p>
        </div>
        {isCustom ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              data-testid="venue-edit-button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:text-flight"
              aria-label="编辑自定义场馆"
            >
              <Edit3 size={15} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              data-testid="venue-delete-button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              aria-label="删除自定义场馆"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ScorePill label="交通" value={venue.accessScore} />
        <ScorePill label="散场" value={venue.crowdRiskScore} />
        <ScorePill label="住宿" value={venue.hotelDifficultyScore} />
        <ScorePill label="往返" value={venue.dayTripDifficultyScore} />
      </div>

      <div className="mt-4 text-sm leading-6 text-slate-600">
        <p>最近车站：{venue.nearestStations.join("、") || "未填写"}</p>
        <p>推荐住宿区域：{venue.recommendedHotelAreas.join("、") || "未填写"}</p>
      </div>

      {mapLinks.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {mapLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-flight/40 hover:text-flight"
            >
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
};

export const Venues = ({ customVenues, onCreate, onUpdate, onDelete }: VenuesProps) => {
  useDocumentTitle("Venues");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [city, setCity] = useState("all");
  const [type, setType] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => createDraft());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useUnsavedChangesWarning(
    isFormOpen && isDirty,
    "自定义场馆存在未保存内容，确定离开吗？",
  );

  const allVenues = useMemo(
    () => [
      ...builtInVenues.map((venue) => ({ venue, isCustom: false })),
      ...customVenues.map((venue) => ({ venue, isCustom: true })),
    ],
    [customVenues],
  );

  const countries = Array.from(new Set(allVenues.map((item) => item.venue.country))).sort();
  const cities = Array.from(new Set(allVenues.map((item) => item.venue.city))).sort();

  const filtered = allVenues.filter(({ venue }) => {
    const haystack = [
      venue.name,
      venue.nameJa,
      venue.city,
      venue.country,
      venue.area,
      venue.nearestStations.join(" "),
      venue.recommendedHotelAreas.join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
    const matchesCountry = country === "all" || venue.country === country;
    const matchesCity = city === "all" || venue.city === city;
    const matchesType = type === "all" || venue.venueType === type;

    return matchesQuery && matchesCountry && matchesCity && matchesType;
  });

  const startCreate = () => {
    setEditingId(null);
    setDraft(createDraft());
    setIsDirty(false);
    setIsFormOpen(true);
  };

  const startEdit = (venue: Venue) => {
    setEditingId(venue.id);
    setDraft(createDraft(venue));
    setIsDirty(false);
    setIsFormOpen(true);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = toInput(draft);

    if (!input.name || !input.city) {
      return;
    }

    if (editingId) {
      onUpdate(editingId, input);
    } else {
      onCreate(createCustomVenue(input));
    }

    setIsFormOpen(false);
    setEditingId(null);
    setDraft(createDraft());
    setIsDirty(false);
  };

  const cancelForm = () => {
    if (isDirty && !window.confirm("自定义场馆存在未保存内容，确定取消吗？")) {
      return;
    }

    setIsFormOpen(false);
    setIsDirty(false);
  };

  const handleDelete = (venue: Venue) => {
    const confirmed = window.confirm(`确定删除自定义场馆「${venue.name}」吗？`);

    if (confirmed) {
      onDelete(venue.id);
    }
  };

  const textFields: Array<[FieldKey, string, string]> = [
    ["name", "场馆名称", "例如：My Favorite Hall"],
    ["nameJa", "日文 / 别名", "可选"],
    ["city", "城市", "横滨"],
    ["country", "国家", "日本"],
    ["area", "区域", "Minato Mirai"],
  ];

  const scoreFields: Array<[ScoreKey, string]> = [
    ["accessScore", "交通便利度"],
    ["crowdRiskScore", "散场风险"],
    ["hotelDifficultyScore", "住宿难度"],
    ["dayTripDifficultyScore", "当天往返难度"],
  ];

  const listFields: Array<[ListKey, string]> = [
    ["nearestStationsText", "最近车站"],
    ["recommendedHotelAreasText", "推荐住宿区域"],
    ["avoidHotelAreasText", "不太推荐区域"],
  ];

  const adviceFields: Array<[TextAreaKey, string]> = [
    ["transportAdvice", "交通建议"],
    ["arrivalAdvice", "到达建议"],
    ["leavingAdvice", "散场建议"],
    ["hotelAdvice", "住宿建议"],
    ["notes", "备注"],
  ];

  return (
    <div data-testid="venues-page" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-flight">
            <Building2 size={16} />
            Venues
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">场馆库</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            管理内置场馆和你的个人自定义场馆。自定义场馆保存在 localStorage，暂不参与 D1 同步。
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          data-testid="venue-add-button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white"
        >
          <Plus size={16} />
          新增自定义场馆
        </button>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Search size={14} />
              搜索
            </span>
            <input
              value={query}
              data-testid="venue-search-input"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="场馆、城市、车站或住宿区域"
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">国家</span>
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">全部国家</option>
              {countries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">城市</span>
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">全部城市</option>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">类型</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">全部类型</option>
              {venueTypes.map((item) => (
                <option key={item} value={item}>
                  {formatVenueType(item)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {isFormOpen ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">
            {editingId ? "编辑自定义场馆" : "新增自定义场馆"}
          </h2>
          <form
            onSubmit={submit}
            onChange={() => setIsDirty(true)}
            data-testid="venue-form"
            className="mt-5 grid gap-4 md:grid-cols-2"
          >
            {textFields.map(([key, label, placeholder]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  {label}
                </span>
                <input
                  required={key === "name" || key === "city"}
                  data-testid={`venue-${key}-input`}
                  value={String(draft[key] ?? "")}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  placeholder={placeholder}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
                />
              </label>
            ))}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">类型</span>
              <select
                value={draft.venueType}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    venueType: event.target.value as Venue["venueType"],
                  }))
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
              >
                {venueTypes.map((item) => (
                  <option key={item} value={item}>
                    {formatVenueType(item)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">容量</span>
              <input
                type="number"
                min="0"
                data-testid="venue-capacity-input"
                value={draft.capacity ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    capacity: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
              />
            </label>

            {scoreFields.map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  {label}
                </span>
                <input
                  type="number"
                  min="1"
                  max="5"
                  data-testid={`venue-${key}-input`}
                  value={draft[key]}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [key]: Number(event.target.value),
                    }))
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
                />
              </label>
            ))}

            {listFields.map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  {label}
                </span>
                <input
                  value={draft[key]}
                  data-testid={`venue-${key}-input`}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  placeholder="用顿号、逗号或换行分隔"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
                />
              </label>
            ))}

            {adviceFields.map(([key, label]) => (
              <label key={key} className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  {label}
                </span>
                <textarea
                  value={String(draft[key] ?? "")}
                  data-testid={`venue-${key}-input`}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-flight focus:ring-4 focus:ring-blue-100"
                />
              </label>
            ))}

            <div className="flex flex-wrap gap-2 md:col-span-2">
              <button
                type="submit"
                data-testid="venue-save-button"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-ink px-4 text-sm font-semibold text-white"
              >
                保存自定义场馆
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600"
              >
                取消
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">场馆列表</h2>
          <p className="text-sm text-slate-500">
            内置 {builtInVenues.length} 个 · 自定义 {customVenues.length} 个
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ venue, isCustom }) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              isCustom={isCustom}
              onEdit={isCustom ? () => startEdit(venue) : undefined}
              onDelete={isCustom ? () => handleDelete(venue) : undefined}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
