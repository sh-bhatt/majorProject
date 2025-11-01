import { Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  totalSkills: number;
  pages: number;
  experienceCount: number;
  projectsCount: number;
}

export function PageHeader({ totalSkills, pages, experienceCount, projectsCount }: PageHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
          Resume Tech & ATS Insights
        </h1>
        <p className="text-gray-600">
          {totalSkills} skills detected • {pages || "?"} pages analyzed
          {experienceCount > 0 && ` • ${experienceCount} experience entries`}
          {projectsCount > 0 && ` • ${projectsCount} projects`}
        </p>
      </div>
      <Link href="/resume">
        <Button variant="outline" size="lg" className="flex items-center gap-2">
          <Home size={20} /> Upload New Resume
        </Button>
      </Link>
    </header>
  );
}
