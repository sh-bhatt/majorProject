import { TECH_KEYWORDS, TECH_ALIASES } from "@/lib/constants/tech-keywords";
import { keywordExists, findTechKeywords } from "@/lib/utils/keyword-matcher";

export interface DetectedTechnologies {
  programming_languages: string[];
  technologies: string[];
  tools: string[];
  coursework: string[];
}

export function extractTechnologies(text: string): DetectedTechnologies {
  const lowerText = text.toLowerCase();

  return {
    programming_languages: findTechKeywords(lowerText, TECH_KEYWORDS.programming_languages),
    technologies: findTechKeywords(lowerText, TECH_KEYWORDS.technologies),
    tools: findTechKeywords(lowerText, TECH_KEYWORDS.tools),
    coursework: findTechKeywords(lowerText, TECH_KEYWORDS.coursework)
  };
}

export function extractTechnologiesFromText(text: string): string[] {
  const found = new Set<string>();
  const lowerText = text.toLowerCase();

  const techListMatch = text.match(/\|\s*([^•\n]+)/);
  if (techListMatch) {
    const techList = techListMatch[1];
    const potentialTechs = techList.split(/,|and/).map(t => t.trim().toLowerCase());
    
    for (const tech of potentialTechs) {
      if (!tech) continue;
      
      for (const category of Object.values(TECH_KEYWORDS)) {
        for (const keyword of category) {
          if (tech === keyword.toLowerCase() || tech.includes(keyword.toLowerCase())) {
            found.add(keyword);
          }
          
          const aliases = TECH_ALIASES[keyword] || [];
          for (const alias of aliases) {
            if (tech === alias.toLowerCase() || tech.includes(alias.toLowerCase())) {
              found.add(keyword);
            }
          }
        }
      }
    }
  }

  for (const category of Object.values(TECH_KEYWORDS)) {
    for (const tech of category) {
      if (keywordExists(tech, lowerText)) {
        found.add(tech);
      }
      
      const aliases = TECH_ALIASES[tech] || [];
      for (const alias of aliases) {
        if (keywordExists(alias, lowerText)) {
          found.add(tech);
        }
      }
    }
  }

  return Array.from(found);
}
