"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Cpu,
  Code,
  Wrench,
  BookOpen,
  Home,
  AlertCircle,
  Loader2,
  Gauge,
  CheckCircle2,

  TrendingUp,
  Briefcase,
  FolderGit2,
  Calendar,
  Building2,
  ExternalLink,
  Tag,
  Play,
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface TechData {
  programming_languages: string[];
  technologies: string[];
  tools: string[];
  coursework: string[];
}

interface ExperienceEntry {
  position: string;
  company: string;
  duration: string;
  description: string;
  technologies: string[];
}

interface ProjectEntry {
  name: string;
  duration: string;
  description: string;
  technologies: string[];
  links: string[];
}

interface ExperienceData {
  found: boolean;
  count: number;
  entries: ExperienceEntry[];
}

interface ProjectsData {
  found: boolean;
  count: number;
  entries: ProjectEntry[];
}

interface ATSData {
  score: number;
  feedback: string;
  suggestions?: string[];
  breakdown?: {
    keywords: number;
    diversity: number;
    sections: number;
    quality: number;
  };
  matched?: number;
  totalPossible?: number;
  sectionsFound?: string[];
}

interface TechStats {
  pages?: number;
  textLength?: number;
  totalFound?: number;
}

export default function TechStackPage() {
  const [data, setData] = useState<TechData | null>(null);
  const [experience, setExperience] = useState<ExperienceData | null>(null);
  const [projects, setProjects] = useState<ProjectsData | null>(null);
  const [stats, setStats] = useState<TechStats | null>(null);
  const [ats, setAts] = useState<ATSData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem("techData");
      const storedStats = sessionStorage.getItem("techStats");
      const storedATS = sessionStorage.getItem("atsData");
      const storedExperience = sessionStorage.getItem("experienceData");
      const storedProjects = sessionStorage.getItem("projectsData");

      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const parsedStats = storedStats ? JSON.parse(storedStats) : {};
        const parsedATS = storedATS ? JSON.parse(storedATS) : null;
        const parsedExperience = storedExperience ? JSON.parse(storedExperience) : null;
        const parsedProjects = storedProjects ? JSON.parse(storedProjects) : null;

        setData(parsedData);
        setStats(parsedStats);
        setAts(parsedATS);
        setExperience(parsedExperience);
        setProjects(parsedProjects);
      } else {
        setError("No tech stack data found. Please upload your resume first.");
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data. Please re-upload your resume.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const totalTechCount = data
    ? Object.values(data).reduce((sum, arr) => sum + arr.length, 0)
    : 0;


  if (isLoading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-xl text-gray-600">Analyzing your resume...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100 text-center">
        <AlertCircle className="w-14 h-14 text-red-500 mb-4" />
        <p className="text-xl font-semibold text-gray-800 mb-2">{error}</p>
        <Link href="/resume">
          <Button size="lg" className="mt-2 flex items-center gap-2">
            <Home size={20} /> Go Back to Upload
          </Button>
        </Link>
      </div>
    );
  }


  const atsScore = ats?.score ?? 0;
  const atsFeedback = ats?.feedback ?? "Not available";
  const breakdown = ats?.breakdown;
  const suggestions = ats?.suggestions ?? [];
  const sectionsFound = ats?.sectionsFound ?? [];

  const atsColor =
    atsScore >= 85
      ? "bg-green-500"
      : atsScore >= 70
        ? "bg-blue-500"
        : atsScore >= 55
          ? "bg-yellow-500"
          : "bg-red-500";

  const atsTextColor =
    atsScore >= 85
      ? "text-green-600"
      : atsScore >= 70
        ? "text-blue-600"
        : atsScore >= 55
          ? "text-yellow-600"
          : "text-red-600";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              Resume Tech & ATS Insights
            </h1>
            <p className="text-gray-600">
              {totalTechCount} skills detected • {stats?.pages || "?"} pages analyzed
              {experience && experience.count > 0 && ` • ${experience.count} experience entries`}
              {projects && projects.count > 0 && ` • ${projects.count} projects`}
            </p>
          </div>
          <Link href="/resume">
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <Home size={20} /> Upload New Resume
            </Button>
          </Link>
        </header>


        <div className="bg-white rounded-xl shadow p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <StatCard label="Total Skills" value={totalTechCount} color="blue" />
          <StatCard label="Experience" value={experience?.count || 0} color="purple" />
          <StatCard label="Projects" value={projects?.count || 0} color="green" />
          <StatCard label="ATS Score" value={`${atsScore}/100`} color="orange" />
        </div>


        {atsScore > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Gauge className={atsTextColor} size={28} />
              <h2 className="text-2xl font-semibold text-gray-800">
                Applicant Tracking System (ATS) Score
              </h2>
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium">{atsFeedback}</span>
                <span className={`font-bold text-lg ${atsTextColor}`}>
                  {atsScore}/100
                </span>
              </div>
              <Progress value={atsScore} className="h-3 w-full" />
            </div>


            {breakdown && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                <BreakdownItem label="Keywords" value={breakdown.keywords} max={40} />
                <BreakdownItem label="Diversity" value={breakdown.diversity} max={25} />
                <BreakdownItem label="Sections" value={breakdown.sections} max={25} />
                <BreakdownItem label="Quality" value={breakdown.quality} max={10} />
              </div>
            )}


            {sectionsFound.length > 0 && (
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


            {ats?.matched !== undefined && ats?.totalPossible !== undefined && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">{ats.matched}</span> technical keywords matched out of{" "}
                  <span className="font-semibold text-gray-800">{ats.totalPossible}</span> possible
                </p>
              </div>
            )}
          </div>
        )}


        {experience && experience.found && experience.entries.length > 0 && (
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
        )}


        {projects && projects.found && projects.entries.length > 0 && (
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
        )}


        <div>
          <h1 className="text-4xl font-bold mb-6">Technical Skills</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Category
              icon={<Code className="text-blue-600" size={28} />}
              title="Programming Languages"
              list={data.programming_languages}
              color="blue"
            />
            <Category
              icon={<Cpu className="text-green-600" size={28} />}
              title="Technologies"
              list={data.technologies}
              color="green"
            />
            <Category
              icon={<Wrench className="text-orange-600" size={28} />}
              title="Tools"
              list={data.tools}
              color="orange"
            />
            <Category
              icon={<BookOpen className="text-purple-600" size={28} />}
              title="Coursework"
              list={data.coursework}
              color="purple"
            />
          </div>
        </div>


        {suggestions.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-blue-600" size={26} />
              <h2 className="text-2xl font-semibold text-gray-800">
                Improvement Suggestions
              </h2>
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
        )}


        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {/* Grammar Tips */}
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              ✍️ Grammar & Writing Quality Tips
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
              <li>
                Use strong action verbs like <span className="font-semibold">"engineered," "optimized,"</span> or{" "}
                <span className="font-semibold">"delivered"</span> instead of passive phrases.
              </li>
              <li>
                Maintain consistent verb tense: past tense for completed roles, present for current positions.
              </li>
              <li>
                Keep bullet points concise and action-oriented to capture recruiter attention quickly.
              </li>
            </ul>
          </div>

          {/* Resume Optimization */}
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              💼 Resume Optimization Tips
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
              <li>
                Add quantifiable outcomes (e.g., <span className="font-semibold">"Reduced latency by 30%"</span>) to make achievements measurable.
              </li>
              <li>
                Place "Technical Skills" or "Projects" near the top to align with recruiter scanning patterns for tech roles.
              </li>
              <li>
                Ensure consistent formatting and adequate spacing to enhance both readability and ATS compatibility.
              </li>
            </ul>
          </div>
        </div>

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
                skills: data,
                experience: experience,
                projects: projects,
                ats: ats,
                stats: stats
              };
              const blob = new Blob(
                [JSON.stringify(exportData, null, 2)],
                { type: "application/json" }
              );
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
              Schedule Interview
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: any;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  };

  return (
    <div className="text-center">
      <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function BreakdownItem({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = (value / max) * 100;

  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-gray-800">{value}<span className="text-sm text-gray-500">/{max}</span></div>
      <div className="text-xs text-gray-600 mb-2">{label}</div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ExperienceCard({ experience }: { experience: ExperienceEntry }) {
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

function ProjectCard({ project }: { project: ProjectEntry }) {
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

function Category({
  icon,
  title,
  list,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  list: string[];
  color: "blue" | "green" | "orange" | "purple";
}) {
  const colorClasses = {
    blue: "border-blue-200 hover:border-blue-400 hover:shadow-blue-100",
    green: "border-green-200 hover:border-green-400 hover:shadow-green-100",
    orange: "border-orange-200 hover:border-orange-400 hover:shadow-orange-100",
    purple: "border-purple-200 hover:border-purple-400 hover:shadow-purple-100",
  };

  return (
    <div
      className={`bg-white shadow-md rounded-2xl p-6 border-2 transition-all duration-300 ${colorClasses[color]} hover:shadow-xl`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </h2>
        <span className="text-sm font-bold px-3 py-1 rounded-full border bg-gray-50 text-gray-800">
          {list?.length || 0}
        </span>
      </div>

      {list?.length > 0 ? (
        <ul className="space-y-2">
          {list.map((item, i) => (
            <li
              key={i}
              className="text-base text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:bg-gray-100 capitalize"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">None detected</p>
        </div>
      )}
    </div>
  );
}
