import { Calendar, ExternalLink, Tag } from "lucide-react";
import { ProjectEntry } from "@/lib/types/resume.types";

interface ProjectCardProps {
  project: ProjectEntry;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white border-t-4 border-purple-500 rounded-lg shadow-md hover:shadow-xl transition-all p-6 flex flex-col">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
          {project.links.length > 0 && (
            <ExternalLink size={20} className="text-purple-600 flex-shrink-0" />
          )}
        </div>

        {project.duration !== "Not specified" && (
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <Calendar size={16} />
            <span className="text-sm">{project.duration}</span>
          </div>
        )}

        <p className="text-gray-700 leading-relaxed mb-4">{project.description}</p>
      </div>

      {project.technologies.length > 0 && (
        <div className="pt-4 border-t border-gray-200 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag size={16} className="text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">Tech Stack:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium border border-purple-200 capitalize"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {project.links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.links.map((link, i) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <ExternalLink size={14} />
              View Project
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
