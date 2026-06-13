import { Cloud, ListPlus, Settings, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";

type FirstRunOnboardingProps = {
  onLoadSamples: () => void;
  onDismiss: () => void;
};

export const FirstRunOnboarding = ({
  onLoadSamples,
  onDismiss,
}: FirstRunOnboardingProps) => {
  return (
    <section className="rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-flight">
            <Sparkles size={16} />
            首次使用引导
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ink">
            把演出远征变成一张可比较的决策表
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            LiveTrip Planner 可以记录演出计划、预算、交通、住宿、场馆风险和个人偏好，并生成值得去指数、智能建议、Markdown 行程和可手动同步的云端备份。
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white text-slate-500 hover:text-ink"
          aria-label="关闭首次使用引导"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4">
          <ListPlus size={17} className="text-flight" />
          <h3 className="mt-2 text-sm font-semibold">创建演出远征计划</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            从票价、交通、酒店、疲劳和座位体验开始，生成完整计划。
          </p>
        </div>
        <div className="rounded-lg bg-white p-4">
          <Settings size={17} className="text-moss" />
          <h3 className="mt-2 text-sm font-semibold">配置用户偏好</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            设置常驻城市、默认预算、地图偏好和风险敏感度。
          </p>
        </div>
        <div className="rounded-lg bg-white p-4">
          <Cloud size={17} className="text-coral" />
          <h3 className="mt-2 text-sm font-semibold">了解 Cloud Sync</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            使用匿名 Sync Space 手动上传和拉取计划、场馆与偏好。
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          to="/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-ink px-4 text-sm font-semibold text-white"
        >
          创建第一个计划
        </Link>
        <button
          type="button"
          onClick={onLoadSamples}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-blue-200 bg-white px-4 text-sm font-semibold text-flight"
        >
          加载示例数据
        </button>
        <Link
          to="/settings"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-blue-200 bg-white px-4 text-sm font-semibold text-slate-700"
        >
          配置偏好
        </Link>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-slate-600 hover:bg-white/70"
        >
          稍后再说
        </button>
      </div>
    </section>
  );
};
