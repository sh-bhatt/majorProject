interface BreakdownItemProps {
  label: string;
  value: number;
  max: number;
}

export function BreakdownItem({ label, value, max }: BreakdownItemProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-gray-800">
        {value}<span className="text-sm text-gray-500">/{max}</span>
      </div>
      <div className="text-xs text-gray-600 mb-2">{label}</div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
