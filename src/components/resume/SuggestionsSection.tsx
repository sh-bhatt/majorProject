import { TrendingUp, AlertCircle } from "lucide-react";

interface SuggestionsSectionProps {
  suggestions: string[];
}

export function SuggestionsSection({ suggestions }: SuggestionsSectionProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="text-blue-600" size={26} />
        <h2 className="text-2xl font-semibold text-gray-800">Improvement Suggestions</h2>
      </div>
      <ul className="space-y-3">
        {suggestions.map((suggestion, i) => (
          <li key={i} className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
            <span className="text-gray-700 leading-relaxed">{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
