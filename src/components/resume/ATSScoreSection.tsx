import { Gauge, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BreakdownItem } from "@/components/ui/BreakdownItem";
import { ATSData } from "@/lib/types/resume.types";

interface ATSScoreSectionProps {
  ats: ATSData;
}

export function ATSScoreSection({ ats }: ATSScoreSectionProps) {
  const { score, feedback, breakdown, sectionsFound, matched, totalPossible } = ats;

  const atsTextColor =
    score >= 85
      ? "text-green-600"
      : score >= 70
        ? "text-blue-600"
        : score >= 55
          ? "text-yellow-600"
          : "text-red-600";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Gauge className={atsTextColor} size={28} />
        <h2 className="text-2xl font-semibold text-gray-800">
          Applicant Tracking System (ATS) Score
        </h2>
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-700 font-medium">{feedback}</span>
          <span className={`font-bold text-lg ${atsTextColor}`}>{score}/100</span>
        </div>
        <Progress value={score} className="h-3 w-full" />
      </div>

      {breakdown && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <BreakdownItem label="Keywords" value={breakdown.keywords} max={40} />
          <BreakdownItem label="Diversity" value={breakdown.diversity} max={25} />
          <BreakdownItem label="Sections" value={breakdown.sections} max={25} />
          <BreakdownItem label="Quality" value={breakdown.quality} max={10} />
        </div>
      )}

      {sectionsFound && sectionsFound.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-600" />
            Sections Detected ({sectionsFound.length}/5)
          </h3>
          <div className="flex flex-wrap gap-2">
            {sectionsFound.map((section, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200 capitalize"
              >
                {section.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {matched !== undefined && totalPossible !== undefined && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">{matched}</span> technical keywords matched out of{" "}
            <span className="font-semibold text-gray-800">{totalPossible}</span> possible
          </p>
        </div>
      )}
    </div>
  );
}
