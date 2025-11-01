export interface TechData {
  programming_languages: string[];
  technologies: string[];
  tools: string[];
  coursework: string[];
}

export interface ExperienceEntry {
  position: string;
  company: string;
  duration: string;
  description: string;
  technologies: string[];
}

export interface ProjectEntry {
  name: string;
  duration: string;
  description: string;
  technologies: string[];
  links: string[];
}

export interface ExperienceData {
  found: boolean;
  count: number;
  entries: ExperienceEntry[];
}

export interface ProjectsData {
  found: boolean;
  count: number;
  entries: ProjectEntry[];
}

export interface ATSData {
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

export interface TechStats {
  pages?: number;
  textLength?: number;
  totalFound?: number;
}

export interface ResumeData {
  techData: TechData | null;
  experience: ExperienceData | null;
  projects: ProjectsData | null;
  stats: TechStats | null;
  ats: ATSData | null;
}
