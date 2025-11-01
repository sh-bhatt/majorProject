import { Calendar, Building2, Tag } from "lucide-react";
import { ExperienceEntry } from "@/lib/types/resume.types";

interface ExperienceCardProps {
  experience: ExperienceEntry;
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow-md hover:shadow-xl transition-all p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{experience.position}</h3>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Building2 size={18} />
            <span className="font-medium">{experience.company}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
          <Calendar size={16} />
          <span className="text-sm font-medium">{experience.duration}</span>
        </div>
      </div>

      <p className="text-gray-700 leading-relaxed mb-4">{experience.description}</p>

      {experience.technologies.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Technologies Used:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {experience.technologies.map((tech, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200 capitalize"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
