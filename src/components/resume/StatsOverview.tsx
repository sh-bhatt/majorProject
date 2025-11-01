import { StatCard } from "@/components/cards/StatCard";

interface StatsOverviewProps {
  totalSkills: number;
  experienceCount: number;
  projectsCount: number;
  atsScore: number;
}

export function StatsOverview({ totalSkills, experienceCount, projectsCount, atsScore }: StatsOverviewProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <StatCard label="Total Skills" value={totalSkills} color="blue" />
      <StatCard label="Experience" value={experienceCount} color="purple" />
      <StatCard label="Projects" value={projectsCount} color="green" />
      <StatCard label="ATS Score" value={`${atsScore}/100`} color="orange" />
    </div>
  );
}
