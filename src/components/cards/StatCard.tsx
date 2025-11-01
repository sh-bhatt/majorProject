
interface StatCardProps {
  label: string;
  value: string | number;
  color: "blue" | "green" | "purple" | "orange";
}

export function StatCard({ label, value, color }: StatCardProps) {
  const colorMap = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  };

  return (
    <div className="text-center">
      <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
