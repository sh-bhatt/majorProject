import { DetectedTechnologies } from "@/lib/parsers/tech-extractor";
import { ExperienceEntry } from "@/lib/parsers/experience-parser";
import { ProjectEntry } from "@/lib/parsers/project-parser";
import { ATSScore } from "./ats-scorer";

export interface Suggestion {
  issue: string;
  impact: string;
  fix: string;
  priority: number;
}

export interface DetailedSuggestions {
  critical: Suggestion[];
  important: Suggestion[];
  contentQuality: Suggestion[];
  keywordOptimization: Suggestion[];
  formattingTips: Suggestion[];
  summary: {
    totalIssues: number;
    criticalCount: number;
    importantCount: number;
    optionalCount: number;
  };
}

export function generateDetailedSuggestions(
  originalText: string,
  detected: DetectedTechnologies,
  experiences: ExperienceEntry[],
  projects: ProjectEntry[],
  ats: ATSScore
): DetailedSuggestions {
  const suggestions: Omit<DetailedSuggestions, 'summary'> = {
    critical: [],
    important: [],
    contentQuality: [],
    keywordOptimization: [],
    formattingTips: []
  };

  const lowerText = originalText.toLowerCase();
  const totalKeywords = Object.values(detected).flat().length;

  // Critical Issues
  if (!/@[a-z0-9.-]+\.[a-z]{2,}/i.test(originalText)) {
    suggestions.critical.push({
      issue: "Missing email address",
      impact: "High - Recruiters cannot contact you",
      fix: "Add a professional email address at the top of your resume (e.g., yourname@email.com)",
      priority: 1
    });
  }

  if (!/\b(linkedin\.com|github\.com)\b/i.test(originalText)) {
    suggestions.critical.push({
      issue: "Missing professional links",
      impact: "High - No way to verify your projects or professional network",
      fix: "Add LinkedIn profile and GitHub portfolio links in your contact section",
      priority: 1
    });
  }

  if (experiences.length === 0) {
    if (!/\b(experience|work history|employment)\b/i.test(lowerText)) {
      suggestions.critical.push({
        issue: "No work experience section detected",
        impact: "Critical - ATS may reject your resume",
        fix: "Add a clearly labeled 'Work Experience' or 'Professional Experience' section",
        priority: 1
      });
    }
  }

  if (projects.length === 0) {
    if (!/\b(project|portfolio)\b/i.test(lowerText)) {
      suggestions.critical.push({
        issue: "No projects section detected",
        impact: "High - Missing opportunity to showcase practical skills",
        fix: "Add a 'Projects' section with 2-3 relevant projects including technologies used",
        priority: 1
      });
    }
  }

  // Important Improvements
  if (totalKeywords < 15) {
    const missingCategories: string[] = [];
    Object.entries(detected).forEach(([category, keywords]) => {
      if (keywords.length === 0) {
        missingCategories.push(category.replace(/_/g, ' '));
      }
    });

    suggestions.important.push({
      issue: `Only ${totalKeywords} technical keywords detected (target: 15+)`,
      impact: "Medium - Lower ATS match scores for job postings",
      fix: `Add more relevant skills in these areas: ${missingCategories.join(', ')}. Examples: cloud platforms (AWS, Azure), testing frameworks, databases (PostgreSQL, MongoDB)`,
      priority: 2
    });
  }

  const weakVerbs = originalText.match(/\b(responsible for|duties include|worked on|helped with|tasked with)/gi);
  if (weakVerbs && weakVerbs.length > 2) {
    suggestions.important.push({
      issue: "Weak action verbs detected",
      impact: "Medium - Reduces impact of your achievements",
      fix: "Replace phrases like 'responsible for' with strong action verbs: Developed, Engineered, Architected, Optimized, Implemented",
      priority: 2
    });
  }

  const hasMetrics = /\d+%|\d+\+|increased|decreased|improved|reduced by \d+/i.test(originalText);
  if (!hasMetrics) {
    suggestions.important.push({
      issue: "No quantifiable achievements found",
      impact: "Medium - Cannot demonstrate measurable impact",
      fix: "Add metrics to your achievements: 'Improved performance by 30%', 'Reduced load time by 2 seconds', 'Managed team of 5 developers'",
      priority: 2
    });
  }

  // Content Quality
  projects.forEach((project) => {
    if (project.description.length < 50) {
      suggestions.contentQuality.push({
        issue: `Project "${project.name}" has insufficient description`,
        impact: "Low - Missing opportunity to showcase skills",
        fix: "Expand description to 80-120 characters including problem solved, technologies, and outcomes",
        priority: 3
      });
    }

    if (project.technologies.length < 3) {
      suggestions.contentQuality.push({
        issue: `Project "${project.name}" lists only ${project.technologies.length} technologies`,
        impact: "Low - Missing keyword opportunities",
        fix: "Add more specific technologies: frameworks, libraries, databases, and tools used",
        priority: 3
      });
    }

    if (project.links.length === 0) {
      suggestions.contentQuality.push({
        issue: `Project "${project.name}" has no GitHub link or live demo`,
        impact: "Medium - Cannot verify your work",
        fix: "Add GitHub repository link or live demo URL to showcase your project",
        priority: 2
      });
    }
  });

  experiences.forEach((exp) => {
    if (exp.description.length < 100) {
      suggestions.contentQuality.push({
        issue: `Experience at "${exp.company}" has brief description`,
        impact: "Medium - Not showcasing full scope of work",
        fix: "Expand to 3-5 bullet points with specific achievements and quantifiable results",
        priority: 2
      });
    }

    if (!/\b(developed|created|built|designed|implemented|managed|led|improved|optimized)\b/i.test(exp.description)) {
      suggestions.contentQuality.push({
        issue: `Experience at "${exp.company}" lacks strong action verbs`,
        impact: "Medium - Weakens impact of achievements",
        fix: "Start each bullet point with action verbs: Developed, Led, Architected, Optimized",
        priority: 2
      });
    }
  });

  // Keyword Optimization
  const detectedLangs = detected.programming_languages || [];
  const detectedTech = detected.technologies || [];
  
  if (detectedLangs.includes('python') && !detectedTech.some(t => /django|flask|fastapi/i.test(t))) {
    suggestions.keywordOptimization.push({
      issue: "Python detected but no frameworks mentioned",
      impact: "Low - Missing related keyword opportunities",
      fix: "If you've used Python frameworks, add them: Django, Flask, FastAPI, or Pandas",
      priority: 3
    });
  }

  if (detectedLangs.includes('javascript') && !detectedTech.some(t => /react|vue|angular|node/i.test(t))) {
    suggestions.keywordOptimization.push({
      issue: "JavaScript detected but no frameworks mentioned",
      impact: "Low - Missing related keyword opportunities",
      fix: "Add JavaScript frameworks you've used: React, Vue, Angular, Node.js, Express",
      priority: 3
    });
  }

  if (!detectedTech.some(t => /aws|azure|gcp|cloud/i.test(t))) {
    suggestions.keywordOptimization.push({
      issue: "No cloud platforms detected",
      impact: "Medium - Cloud skills are highly valued",
      fix: "If you have cloud experience, add: AWS, Azure, GCP, or services like S3, Lambda, EC2",
      priority: 2
    });
  }

  if (!lowerText.includes('database') && !/(mongodb|postgresql|mysql|redis|firebase)/i.test(originalText)) {
    suggestions.keywordOptimization.push({
      issue: "No database technologies detected",
      impact: "Medium - Databases are essential for most roles",
      fix: "Add database technologies: MongoDB, PostgreSQL, MySQL, Redis, Firebase",
      priority: 2
    });
  }

  // Formatting Tips
  if (originalText.length < 800) {
    suggestions.formattingTips.push({
      issue: "Resume content is too brief",
      impact: "Medium - Not enough information for ATS and recruiters",
      fix: "Aim for 800-1200 characters. Expand descriptions with specific details and outcomes",
      priority: 2
    });
  } else if (originalText.length > 2500) {
    suggestions.formattingTips.push({
      issue: "Resume content may be too lengthy",
      impact: "Low - Risk of important details being overlooked",
      fix: "Consider condensing to 1-2 pages. Focus on most relevant experiences",
      priority: 3
    });
  }

  const bulletCount = (originalText.match(/[•\-\*]/g) || []).length;
  if (bulletCount < 5) {
    suggestions.formattingTips.push({
      issue: "Too few bullet points detected",
      impact: "Low - May appear unstructured",
      fix: "Use bullet points to organize achievements (3-5 per job/project)",
      priority: 3
    });
  }

  return {
    ...suggestions,
    summary: {
      totalIssues: suggestions.critical.length + suggestions.important.length + 
                   suggestions.contentQuality.length + suggestions.keywordOptimization.length + 
                   suggestions.formattingTips.length,
      criticalCount: suggestions.critical.length,
      importantCount: suggestions.important.length,
      optionalCount: suggestions.contentQuality.length + suggestions.keywordOptimization.length + 
                     suggestions.formattingTips.length
    }
  };
}
