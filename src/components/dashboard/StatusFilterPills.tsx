export function StatusFilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-colors ${
            value === opt
              ? "bg-brand-blue text-white"
              : "bg-secondary text-muted-foreground hover:bg-secondary/70"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
