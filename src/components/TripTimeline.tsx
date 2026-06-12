import { CheckCircle2 } from "lucide-react";
import type { TripPlan } from "../types";
import { formatDate } from "../utils/format";

export type TimelineItem = {
  label: string;
  time?: string;
  description: string;
};

const fallbackTime = "待定";

export const buildTimeline = (plan: TripPlan): TimelineItem[] => [
  {
    label: "出发",
    time: plan.departureTime,
    description: `从 ${plan.departureCity || "出发地"} 前往 ${plan.city}，提前确认交通票据和证件。`,
  },
  {
    label: "到达演出城市",
    time: plan.arrivalTime,
    description: `抵达 ${plan.city || "演出城市"} 后优先处理行李、交通卡和补给。`,
  },
  {
    label: "酒店入住",
    time: plan.hotelCheckInTime,
    description:
      plan.hotelCost > 0
        ? `入住 ${plan.hotelArea || "酒店区域待定"}，预留充电和休息时间。`
        : "未填写酒店预算，可按当天返程或朋友住宿处理。",
  },
  {
    label: "前往场馆",
    time: plan.venueArrivalTime,
    description: `预留去 ${plan.venue || "场馆"} 的排队、换乘和物贩时间。`,
  },
  {
    label: "入场",
    time: plan.entryTime,
    description: "检查票券、座位、寄存和洗手间动线。",
  },
  {
    label: "开演",
    time: plan.showStartTime,
    description: `${plan.artist || "演出"} 的主场时刻，把手机电量和周边收好。`,
  },
  {
    label: "结束",
    time: plan.showEndTime,
    description: "根据退场人流决定是否稍等再离场。",
  },
  {
    label: "返回酒店或返程",
    time: plan.returnTime,
    description:
      plan.fatigue >= 7
        ? "疲劳度偏高，优先保证休息和第二天恢复。"
        : "体力压力可控，可以安排轻量夜宵或返程。",
  },
];

type TripTimelineProps = {
  plan: TripPlan;
};

export const TripTimeline = ({ plan }: TripTimelineProps) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">行程时间线</h2>
          <p className="mt-1 text-sm text-slate-500">{formatDate(plan.date)}</p>
        </div>
      </div>

      <ol className="mt-5 space-y-4">
        {buildTimeline(plan).map((item) => (
          <li key={item.label} className="flex gap-3 text-sm text-slate-600">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mist text-moss">
              <CheckCircle2 size={16} />
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-semibold text-ink">{item.label}</span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-500">
                  {item.time || fallbackTime}
                </span>
              </span>
              <span className="mt-1 block leading-6">{item.description}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};
