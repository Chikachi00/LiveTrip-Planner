type RatingInputProps = {
  label: string;
  name: string;
  value: number;
  hint: string;
  onChange: (value: number) => void;
};

export const RatingInput = ({
  label,
  name,
  value,
  hint,
  onChange,
}: RatingInputProps) => {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold tabular-nums text-slate-700">
          {value}/10
        </span>
      </div>
      <input
        name={name}
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-flight"
      />
      <span className="mt-1 block text-xs text-slate-500">{hint}</span>
    </label>
  );
};
