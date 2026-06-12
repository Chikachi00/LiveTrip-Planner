type ScoreRingProps = {
  score: number;
  size?: "sm" | "lg";
};

export const ScoreRing = ({ score, size = "lg" }: ScoreRingProps) => {
  const normalized = Math.max(0, Math.min(score, 100));
  const color =
    normalized >= 80
      ? "#3F7D58"
      : normalized >= 60
        ? "#2563EB"
        : normalized >= 45
          ? "#F5B041"
          : "#F9735B";
  const dimensions = size === "lg" ? "h-28 w-28" : "h-20 w-20";
  const textSize = size === "lg" ? "text-3xl" : "text-2xl";

  return (
    <div
      className={`${dimensions} grid shrink-0 place-items-center rounded-full`}
      style={{
        background: `conic-gradient(${color} ${normalized * 3.6}deg, #E2E8F0 0deg)`,
      }}
      aria-label={`值得去指数 ${score}`}
    >
      <div className="grid h-[78%] w-[78%] place-items-center rounded-full bg-white">
        <span className={`${textSize} font-semibold tabular-nums`}>{score}</span>
      </div>
    </div>
  );
};
