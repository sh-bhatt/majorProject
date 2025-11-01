import { DATE_PATTERNS } from "@/lib/constants/date-patterns";
import { extractTechnologiesFromText } from "./tech-extractor";

export interface ProjectEntry {
  name: string;
  duration: string;
  description: string;
  technologies: string[];
  links: string[];
}

export function parseProjects(projectText: string | null): ProjectEntry[] {
  if (!projectText) return [];

  const projects: ProjectEntry[] = [];
  const lines = projectText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    const hasLinkSymbol = line.includes('↗') || line.includes('🔗');
    const hasPipeSeparator = line.includes('|');
    
    const looksLikeTitle = (
      hasLinkSymbol ||
      hasPipeSeparator ||
      /\|\s*(HTML|CSS|JavaScript|React|Python|Java|Node|API|Tkinter|MySQL|Streamlit|scikit-learn|sklearn|NLP|TF-IDF|Cosine|Similarity)/i.test(line) ||
      (line.match(/^[A-Z][a-zA-Z\s-]+/) && !line.match(/^[•\-\*]/) && line.length < 150 && line.length > 5)
    );
    
    if (looksLikeTitle) {
      let projectName = line;
      let technologiesLine = "";
      let duration = "Not specified";
      
      projectName = projectName.replace(/↗|🔗/g, '').trim();
      
      if (line.includes('|')) {
        const parts = line.split('|');
        projectName = parts[0].replace(/↗|🔗/g, '').trim();
        
        const secondPart = parts[1]?.trim() || "";
        if (/\b(19|20)\d{2}\b/.test(secondPart)) {
          duration = secondPart;
        } else {
          technologiesLine = secondPart;
        }
      }
      
      const yearMatch = projectName.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        duration = yearMatch[0];
        projectName = projectName.replace(/\b(19|20)\d{2}\b/, '').trim();
      }
      
      if (duration === "Not specified" && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const nextLineYear = nextLine.match(/^\s*(19|20)\d{2}\s*$/);
        if (nextLineYear) {
          duration = nextLineYear[0].trim();
        }
      }
      
      const descriptionLines = [];
      let j = i + 1;
      
      while (j < lines.length) {
        const nextLine = lines[j];
        
        const nextIsHeader = (
          nextLine.includes('↗') || 
          nextLine.includes('🔗') ||
          /\|\s*(HTML|CSS|JavaScript|React|Python|Java|Node|API|Tkinter|MySQL|Streamlit|scikit-learn|sklearn|NLP|TF-IDF)/i.test(nextLine) ||
          (nextLine.match(/^[A-Z][a-zA-Z\s-]+\s*\|/) && !nextLine.match(/^[•\-\*]/))
        );
        
        if (nextIsHeader) break;
        
        if (nextLine.match(/^\s*(19|20)\d{2}\s*$/)) {
          j++;
          continue;
        }
        
        if (nextLine.match(/^[•\-\*]/)) {
          descriptionLines.push(nextLine.replace(/^[•\-\*]\s*/, ''));
        } else if (nextLine.length > 15 && !nextLine.includes('|') && !nextLine.match(/^\s*(19|20)\d{2}\s*$/)) {
          descriptionLines.push(nextLine);
        }
        
        j++;
      }
      
      const description = descriptionLines.join(' ').trim();
      
      const fullText = projectName + " " + technologiesLine + " " + description;
      const technologies = extractTechnologiesFromText(fullText);
      
      const urlPattern = /(https?:\/\/[^\s]+)/gi;
      const links = [...fullText.matchAll(urlPattern)].map(m => m[0]);
      
      const dateMatches = [...fullText.matchAll(DATE_PATTERNS.dateRange)];
      if (dateMatches.length > 0) {
        duration = dateMatches[0][0];
      }
      
      if (projectName.length > 3 && projectName.toLowerCase() !== 'projects') {
        projects.push({
          name: projectName,
          duration,
          description: description || "No description provided",
          technologies: technologies,
          links: links.length > 0 ? links : []
        });
      }
      
      i = j;
    } else {
      i++;
    }
  }

  return projects;
}
