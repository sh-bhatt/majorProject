import { DATE_PATTERNS } from "@/lib/constants/date-patterns";
import { extractTechnologiesFromText } from "./tech-extractor";

export interface ExperienceEntry {
  position: string;
  company: string;
  duration: string;
  description: string;
  technologies: string[];
}

export function parseExperience(experienceText: string | null): ExperienceEntry[] {
  if (!experienceText) return [];

  const experiences: ExperienceEntry[] = [];
  const blocks = experienceText.split(/\n\n+/);

  for (const block of blocks) {
    if (block.trim().length < 20) continue;

    const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) continue;

    const dateMatches = [...block.matchAll(DATE_PATTERNS.dateRange)];
    const duration = dateMatches.length > 0 ? dateMatches[0][0] : "Not specified";

    const firstLine = lines[0];
    let position = null;
    let company = null;

    if (firstLine.includes(' at ')) {
      const parts = firstLine.split(' at ');
      position = parts[0].trim();
      company = parts[1].trim();
    } else if (firstLine.includes(' - ')) {
      const parts = firstLine.split(' - ');
      company = parts[0].trim();
      position = parts[1].trim();
    } else if (firstLine.includes('|')) {
      const parts = firstLine.split('|');
      position = parts[0].trim();
      company = parts[1].trim();
    } else {
      position = firstLine;
      company = lines.length > 1 ? lines[1] : "Not specified";
    }

    const descStartIndex = (position && company !== "Not specified") ? 2 : 1;
    const description = lines.slice(descStartIndex).join(' ').trim();

    experiences.push({
      position: position || "Not specified",
      company: company || "Not specified",
      duration,
      description: description || "No description provided",
      technologies: extractTechnologiesFromText(block)
    });
  }

  return experiences;
}
