interface ToggleButtonGroupProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: { key: T; label: string; sublabel?: string }[];
  size?: 'sm' | 'md';
}

export default function ToggleButtonGroup<T extends string | number>({
  value,
  onChange,
  options,
  size = 'md',
}: ToggleButtonGroupProps<T>) {
  const padding = size === 'sm' ? 'px-3 py-1.5 text-[12px]' : 'px-4 py-2 text-[13px]';

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={String(opt.key)}
          onClick={() => onChange(opt.key)}
          className={`rounded-lg border font-medium transition-all ${padding} ${
            value === opt.key
              ? 'border-white bg-white text-black'
              : 'border-border bg-surface-2 text-gray-400 hover:border-gray-500 hover:text-white'
          }`}
        >
          {opt.label}
          {opt.sublabel && <span className="ml-1 text-[10px] opacity-60">{opt.sublabel}</span>}
        </button>
      ))}
    </div>
  );
}
