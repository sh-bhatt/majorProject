import { FolderGit2 } from "lucide-react";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { ProjectsData } from "@/lib/types/resume.types";

interface ProjectsSectionProps {
  projects: ProjectsData;
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (!projects.found || projects.entries.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <FolderGit2 className="text-purple-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Projects</h2>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
          {projects.count}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.entries.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </div>
  );
}
