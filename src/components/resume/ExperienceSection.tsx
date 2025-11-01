import { Briefcase } from "lucide-react";
import { ExperienceCard } from "@/components/cards/ExperienceCard";
import { ExperienceData } from "@/lib/types/resume.types";

interface ExperienceSectionProps {
  experience: ExperienceData;
}

export function ExperienceSection({ experience }: ExperienceSectionProps) {
  if (!experience.found || experience.entries.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="text-blue-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Work Experience</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
          {experience.count}
        </span>
      </div>
      <div className="space-y-6">
        {experience.entries.map((exp, index) => (
          <ExperienceCard key={index} experience={exp} />
        ))}
      </div>
    </div>
  );
}
