import { AlertCircle } from "lucide-react";
import React from "react";

interface SkillCategoryCardProps {
  icon: React.ReactNode;
  title: string;
  list: string[];
  color: "blue" | "green" | "orange" | "purple";
}

export function SkillCategoryCard({ icon, title, list, color }: SkillCategoryCardProps) {
  const colorClasses = {
    blue: "border-blue-200 hover:border-blue-400 hover:shadow-blue-100",
    green: "border-green-200 hover:border-green-400 hover:shadow-green-100",
    orange: "border-orange-200 hover:border-orange-400 hover:shadow-orange-100",
    purple: "border-purple-200 hover:border-purple-400 hover:shadow-purple-100",
  };

  return (
    <div
      className={`bg-white shadow-md rounded-2xl p-6 border-2 transition-all duration-300 ${colorClasses[color]} hover:shadow-xl`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </h2>
        <span className="text-sm font-bold px-3 py-1 rounded-full border bg-gray-50 text-gray-800">
          {list?.length || 0}
        </span>
      </div>

      {list?.length > 0 ? (
        <ul className="space-y-2">
          {list.map((item, i) => (
            <li
              key={i}
              className="text-base text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:bg-gray-100 capitalize"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">None detected</p>
        </div>
      )}
    </div>
  );
}
