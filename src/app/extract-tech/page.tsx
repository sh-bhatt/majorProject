"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsOverview } from "@/components/resume/StatsOverview";
import { ATSScoreSection } from "@/components/resume/ATSScoreSection";
import { ExperienceSection } from "@/components/resume/ExperienceSection";
import { ProjectsSection } from "@/components/resume/ProjectsSection";
import { SkillsSection } from "@/components/resume/SkillsSection";
import { SuggestionsSection } from "@/components/resume/SuggestionsSection";
import { TipsSection } from "@/components/resume/TipsSection";
import { useResumeData } from "@/hooks/useResumeData";

export default function TechStackPage() {
  const { data, isLoading, error } = useResumeData();

  if (isLoading) return <LoadingState />;
  if (error || !data.techData) return <ErrorState message={error || "No data found"} />;

  const totalTechCount = Object.values(data.techData).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          totalSkills={totalTechCount}
          pages={data.stats?.pages || 0}
          experienceCount={data.experience?.count || 0}
          projectsCount={data.projects?.count || 0}
        />

        <StatsOverview
          totalSkills={totalTechCount}
          experienceCount={data.experience?.count || 0}
          projectsCount={data.projects?.count || 0}
          atsScore={data.ats?.score || 0}
        />

        {data.ats && data.ats.score > 0 && <ATSScoreSection ats={data.ats} />}

        {data.experience && <ExperienceSection experience={data.experience} />}

        {data.projects && <ProjectsSection projects={data.projects} />}

        <SkillsSection skills={data.techData} />

        {data.ats?.suggestions && <SuggestionsSection suggestions={data.ats.suggestions} />}

        <TipsSection />

        <div className="mt-10 flex justify-center gap-4">
          <Link href="/resume">
            <Button variant="outline" size="lg">
              Upload New Resume
            </Button>
          </Link>
          <Button
            size="lg"
            onClick={() => {
              const exportData = {
                skills: data.techData,
                experience: data.experience,
                projects: data.projects,
                ats: data.ats,
                stats: data.stats,
              };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "resume-analysis.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export Analysis
          </Button>
          <Link href="/interview">
            <Button size="lg" className="flex items-center gap-2">
              <Play size={20} />
              Next
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
