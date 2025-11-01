import { Code, Cpu, Wrench, BookOpen } from "lucide-react";
import { SkillCategoryCard } from "@/components/cards/SkillCategoryCard";
import { TechData } from "@/lib/types/resume.types";

interface SkillsSectionProps {
  skills: TechData;
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Technical Skills</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SkillCategoryCard
          icon={<Code className="text-blue-600" size={28} />}
          title="Programming Languages"
          list={skills.programming_languages}
          color="blue"
        />
        <SkillCategoryCard
          icon={<Cpu className="text-green-600" size={28} />}
          title="Technologies"
          list={skills.technologies}
          color="green"
        />
        <SkillCategoryCard
          icon={<Wrench className="text-orange-600" size={28} />}
          title="Tools"
          list={skills.tools}
          color="orange"
        />
        <SkillCategoryCard
          icon={<BookOpen className="text-purple-600" size={28} />}
          title="Coursework"
          list={skills.coursework}
          color="purple"
        />
      </div>
    </div>
  );
}
