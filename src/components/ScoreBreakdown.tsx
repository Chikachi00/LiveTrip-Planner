import type { WorthScoreResult } from "../types";

type ScoreBreakdownProps = {
  result: WorthScoreResult;
};

export const ScoreBreakdown = ({ result }: ScoreBreakdownProps) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">值得去指数解释</h2>
          <p className="mt-1 text-sm text-slate-500">
            基准 35 分，加分和扣分共同生成最终指数。
          </p>
        </div>
        <span className="text-2xl font-semibold tabular-nums">
          {result.finalScore}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {result.breakdown.map((item) => {
          const percent = Math.min(
            Math.round((Math.abs(item.value) / item.maxAbsValue) * 100),
            100,
          );
          const tone =
            item.type === "positive"
              ? "bg-moss text-moss"
              : "bg-coral text-coral";

          return (
            <div key={item.label}>
              <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-md bg-opacity-10 px-2 py-1 text-sm font-semibold tabular-nums ${tone}`}
                >
                  {item.value > 0 ? "+" : ""}
                  {item.value}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full ${
                    item.type === "positive" ? "bg-moss" : "bg-coral"
                  }`}
                  style={{ width: `${Math.max(percent, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
