// @ts-nocheck
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import pdfParse from "@cedrugs/pdf-parse";

/* -------------------------------------------------------
   🔹 Categorized Tech Keyword Groups (4 Buckets)
-------------------------------------------------------- */
const TECH_KEYWORDS = {
  programming_languages: [
    "python", "java", "c++" ,"C++", "c", "javascript", "typescript",
    "html", "css", "sql", "go", "ruby", "php", "swift", "kotlin",
    "rust", "scala", "perl", "bash", "shell", "dart", "objective-c",
    "powershell", "matlab", "r"
  ],

  technologies: [
    "react", "reactjs", "react.js", "angular", "vue", "next.js", "nextjs", 
    "svelte", "nuxt.js", "astro", "jquery", "bootstrap", "tailwind", 
    "tailwindcss", "material ui", "chakra ui", "ant design",
    "node.js", "express", "spring", "spring boot", "flask", "django", 
    "fastapi", "laravel", "rails", ".net", "dotnet", "asp.net", 
    "nest.js", "adonisjs", "hapi", "fiber",
    "flutter", "react native", "ionic", "xamarin", "cordova",
    "tensorflow", "keras", "pytorch", "scikit-learn", "sklearn", "huggingface",
    "openai gym", "spacy", "opencv", "yolo",
    "aws", "azure", "gcp", "firebase", "supabase", "heroku", "vercel",
    "netlify", "digital ocean", "docker", "kubernetes", "terraform", 
    "ansible", "api integration", "rest api", "graphql",
    "streamlit", "tkinter", "mysql", "nlp", "tf-idf", "naive bayes",
    "cosine similarity", "google colab"
  ],

  tools: [
    "git", "github", "gitlab", "bitbucket", "jenkins", "circleci",
    "travisci", "azure devops", "teamcity",
    "vscode", "visual studio", "intellij", "pycharm", "eclipse",
    "android studio", "xcode",
    "figma", "canva", "adobe xd", "sketch", "notion", "slack",
    "trello", "asana", "clickup", "jira", "monday.com", "miro",
    "postman", "swagger", "insomnia",
    "npm", "yarn", "pnpm", "webpack", "babel", "vite", "gulp", "gradle", "maven",
    "prometheus", "grafana", "datadog", "pm2", "vagrant"
  ],

  coursework: [
    "data structures", "algorithms", "operating systems", "computer networks",
    "database management", "dbms", "machine learning", "deep learning",
    "artificial intelligence", "computer architecture", "software engineering",
    "object oriented programming", "oop", "web development", "mobile development",
    "data science", "cyber security", "cloud computing", "big data analytics",
    "computer vision", "nlp", "natural language processing"
  ]
};

/* -------------------------------------------------------
   🔹 Keyword Aliases
-------------------------------------------------------- */
const TECH_ALIASES = {
  "node.js": ["nodejs", "node js"],
  "next.js": ["nextjs", "next js"],
  "react": ["reactjs", "react js", "react.js"],
  "c++": ["cpp", "c plus plus", "c + +", "c⁺⁺"],
  ".net": ["dotnet", "dot net", "asp.net"],
  "aws": ["amazon web services"],
  "html": ["html5"],
  "css": ["css3"],
  "vscode": ["vs code", "visual studio code"],
  "github": ["git hub"],
  "tensorflow": ["tf"],
  "pytorch": ["torch"],
  "npm": ["node package manager"],
  "machine learning": ["ml"],
  "artificial intelligence": ["ai"],
  "javascript": ["js"],
  "scikit-learn": ["sklearn", "scikit learn"],
  "mysql": ["my sql"],
  "nlp": ["natural language processing"]
};

/* -------------------------------------------------------
   🔹 Section Headers for Experience & Projects
-------------------------------------------------------- */
const SECTION_HEADERS = {
  experience: [
    "work experience", "professional experience", "employment history",
    "experience", "work history", "career history", "relevant experience",
    "professional background", "employment"
  ],
  projects: [
    "projects", "personal projects", "academic projects", "key projects",
    "project work", "portfolio", "project experience", "notable projects",
    "technical projects"
  ]
};

/* -------------------------------------------------------
   🔹 Date Pattern Extraction
-------------------------------------------------------- */
const DATE_PATTERNS = {
  dateRange: /((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4}|(?:\d{1,2}\/\d{4})|(?:\d{4}))\s*(?:-|–|to|until)\s*((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4}|(?:\d{1,2}\/\d{4})|(?:\d{4})|Present|Current|Now)/gi
};

/* -------------------------------------------------------
   🔹 Extract Sections from Resume Text
-------------------------------------------------------- */
function extractSection(text, sectionKeywords) {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  let startIndex = -1;
  let endIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    for (const keyword of sectionKeywords) {
      if (line.includes(keyword) && line.length < 100) {
        startIndex = i + 1;
        break;
      }
    }
    if (startIndex !== -1) break;
  }

  if (startIndex === -1) return null;

  const allHeaders = [
    ...SECTION_HEADERS.experience, 
    ...SECTION_HEADERS.projects, 
    "education", "skills", "certifications", "awards", "achievements"
  ];
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    for (const header of allHeaders) {
      if (line.includes(header) && line.length < 100 && i !== startIndex - 1) {
        endIndex = i;
        break;
      }
    }
    if (endIndex !== lines.length) break;
  }

  return lines.slice(startIndex, endIndex).join('\n');
}

/* -------------------------------------------------------
   🔹 Extract Technologies from Text Block
-------------------------------------------------------- */
function extractTechnologiesFromText(text) {
  const found = new Set();
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

/* -------------------------------------------------------
   🔹 Parse Experience Entries
-------------------------------------------------------- */
function parseExperience(experienceText) {
  if (!experienceText) return [];

  const experiences = [];
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

/* -------------------------------------------------------
   🔹 Parse Project Entries
-------------------------------------------------------- */
function parseProjects(projectText) {
  if (!projectText) return [];

  const projects = [];
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
        
        if (nextIsHeader) {
          break;
        }
        
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

/* -------------------------------------------------------
   🔹 Keyword Matching Logic
-------------------------------------------------------- */
function keywordExists(keyword, text) {
  const normalized = text
    .replace(/c\s*\+\s*\+/gi, "c++")
    .replace(/c\s*⁺\s*⁺/gi, "c++");

  if (keyword === "c++") return /\bc\+\+\b/i.test(normalized);
  if (keyword === "r")
    return /\br\b(?=\s*(language|programming|developer|project|script|code))/i.test(normalized);
  if (keyword === "go")
    return /\bgo\b(?=\s*(language|programming|developer|backend|code|project))/i.test(normalized);

  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "i");
  return regex.test(normalized);
}

/* -------------------------------------------------------
   🔹 ATS Scoring Logic
-------------------------------------------------------- */
function calculateATSScore(text, detected) {
  const originalText = text;
  const lowerText = text.toLowerCase();
  
  const categoryStats = Object.entries(detected).map(([category, keywords]) => ({
    category,
    count: keywords.length,
    hasAny: keywords.length > 0
  }));
  
  const totalDetected = Object.values(detected).flat().length;
  const categoriesWithKeywords = categoryStats.filter(c => c.hasAny).length;
  const totalCategories = Object.keys(detected).length;

  let keywordScore = 0;
  if (totalDetected >= 20) keywordScore = 40;
  else if (totalDetected >= 15) keywordScore = 35;
  else if (totalDetected >= 10) keywordScore = 30;
  else if (totalDetected >= 7) keywordScore = 25;
  else if (totalDetected >= 5) keywordScore = 20;
  else if (totalDetected >= 3) keywordScore = 15;
  else keywordScore = totalDetected * 5;

  const diversityScore = (categoriesWithKeywords / totalCategories) * 25;

  const sections = {
    experience: /\b(experience|work history|employment|professional experience)\b/i.test(lowerText),
    projects: /\b(project(s)?|portfolio|work samples|github)\b/i.test(lowerText),
    education: /\b(education|academic|qualification(s)?|degree)\b/i.test(lowerText),
    skills: /\b(skills?|technical skills|competenc(y|ies)|proficienc(y|ies))\b/i.test(lowerText),
    contact: /\b(email|phone|linkedin|github|portfolio)\b/i.test(lowerText) || /@/.test(originalText)
  };
  
  const sectionsPresent = Object.values(sections).filter(Boolean).length;
  const sectionScore = (sectionsPresent / 5) * 25;

  let qualityScore = 0;
  if (/@[a-z0-9.-]+\.[a-z]{2,}/i.test(originalText)) qualityScore += 2;
  if (/\d+%|\d+\+|increased|decreased|improved|reduced/i.test(lowerText)) qualityScore += 2;
  const actionVerbs = /\b(developed|created|built|designed|implemented|managed|led|improved|optimized|automated|deployed|integrated)\b/i;
  if (actionVerbs.test(lowerText)) qualityScore += 2;
  if (text.length >= 500) qualityScore += 2;
  if (/https?:\/\/|github\.com|linkedin\.com/i.test(originalText)) qualityScore += 2;

  let totalScore = keywordScore + diversityScore + sectionScore + qualityScore;
  totalScore = Math.min(Math.round(totalScore), 100);

  let feedback = "";
  let suggestions = [];

  if (totalScore >= 85) {
    feedback = "Excellent – Highly ATS-friendly!";
  } else if (totalScore >= 70) {
    feedback = "Good – Strong resume with room for minor improvements";
    if (totalDetected < 15) suggestions.push("Add more relevant technical skills");
    if (!sections.contact) suggestions.push("Ensure contact information is clearly visible");
  } else if (totalScore >= 55) {
    feedback = "Average – Needs improvement for better ATS performance";
    if (totalDetected < 10) suggestions.push("Include more technical keywords relevant to your field");
    if (categoriesWithKeywords < 3) suggestions.push("Add skills from different categories (languages, tools, frameworks)");
    if (!sections.experience) suggestions.push("Add a clear 'Experience' or 'Work History' section");
    if (!sections.projects) suggestions.push("Include a 'Projects' section to showcase your work");
  } else {
    feedback = "Needs significant improvement for ATS systems";
    if (totalDetected < 5) suggestions.push("Add significantly more technical skills and keywords");
    if (!sections.skills) suggestions.push("Create a dedicated 'Skills' section");
    if (!sections.experience && !sections.projects) suggestions.push("Add 'Experience' and/or 'Projects' sections");
    if (!sections.education) suggestions.push("Include an 'Education' section");
    if (!sections.contact) suggestions.push("Add clear contact information (email, phone, LinkedIn)");
  }

  return {
    score: totalScore,
    feedback,
    suggestions,
    breakdown: {
      keywords: Math.round(keywordScore),
      diversity: Math.round(diversityScore),
      sections: Math.round(sectionScore),
      quality: Math.round(qualityScore)
    },
    matched: totalDetected,
    totalPossible: Object.values(TECH_KEYWORDS).flat().length,
    sectionsFound: Object.entries(sections)
      .filter(([_, present]) => present)
      .map(([name, _]) => name)
  };
}

/* -------------------------------------------------------
   🔹 NEW: Generate Detailed Resume Improvement Suggestions
-------------------------------------------------------- */
function generateDetailedSuggestions(originalText, detected, experiences, projects, ats) {
  const suggestions = {
    critical: [],
    important: [],
    contentQuality: [],
    keywordOptimization: [],
    formattingTips: []
  };

  const lowerText = originalText.toLowerCase();
  const totalKeywords = Object.values(detected).flat().length;

  // CRITICAL ISSUES
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

  if (!experiences || experiences.length === 0) {
    if (!/\b(experience|work history|employment)\b/i.test(lowerText)) {
      suggestions.critical.push({
        issue: "No work experience section detected",
        impact: "Critical - ATS may reject your resume",
        fix: "Add a clearly labeled 'Work Experience' or 'Professional Experience' section",
        priority: 1
      });
    }
  }

  if (!projects || projects.length === 0) {
    if (!/\b(project|portfolio)\b/i.test(lowerText)) {
      suggestions.critical.push({
        issue: "No projects section detected",
        impact: "High - Missing opportunity to showcase practical skills",
        fix: "Add a 'Projects' section with 2-3 relevant projects including technologies used",
        priority: 1
      });
    }
  }

  // IMPORTANT IMPROVEMENTS
  if (totalKeywords < 15) {
    const missingCategories = [];
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

  // CONTENT QUALITY CHECKS
  if (projects && projects.length > 0) {
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
  }

  if (experiences && experiences.length > 0) {
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
  }

  // KEYWORD OPTIMIZATION
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

  // FORMATTING TIPS
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
    critical: suggestions.critical,
    important: suggestions.important,
    contentQuality: suggestions.contentQuality,
    keywordOptimization: suggestions.keywordOptimization,
    formattingTips: suggestions.formattingTips,
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

/* -------------------------------------------------------
   🔹 PDF Tech Extraction Endpoint
-------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    console.log("📄 API /extract-tech triggered");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    if (file.type !== "application/pdf")
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let pdfData;
    try {
      pdfData = await pdfParse(buffer);
      console.log("✅ PDF parsed successfully");
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to parse PDF. File might be corrupted or password-protected." },
        { status: 422 }
      );
    }

    let originalText = (pdfData.text || "")
      .replace(/[\r\n]+/g, "\n")
      .trim();

    let text = originalText.toLowerCase();

    if (!text || text.length < 10)
      return NextResponse.json(
        { error: "PDF appears empty or contains only images" },
        { status: 422 }
      );

    const detected = Object.fromEntries(
      Object.entries(TECH_KEYWORDS).map(([category, keywords]) => {
        const found = new Set();
        for (const kw of keywords) {
          if (keywordExists(kw, text)) {
            found.add(kw);
            continue;
          }
          const aliases = TECH_ALIASES[kw] || [];
          for (const alias of aliases) {
            if (keywordExists(alias, text)) {
              found.add(kw);
              break;
            }
          }
        }
        return [category, Array.from(found).sort()];
      })
    );

    const experienceText = extractSection(originalText, SECTION_HEADERS.experience);
    const experiences = parseExperience(experienceText);

    const projectText = extractSection(originalText, SECTION_HEADERS.projects);
    const projects = parseProjects(projectText);

    console.log(`✅ Extracted ${experiences.length} experience entries`);
    console.log(`✅ Extracted ${projects.length} projects`);

    const ats = calculateATSScore(originalText, detected);

    // ✅ NEW: Generate detailed improvement suggestions
    const detailedSuggestions = generateDetailedSuggestions(
      originalText,
      detected,
      experiences,
      projects,
      ats
    );

    return NextResponse.json({
      success: true,
      data: detected,
      experience: {
        found: experiences.length > 0,
        count: experiences.length,
        entries: experiences
      },
      projects: {
        found: projects.length > 0,
        count: projects.length,
        entries: projects
      },
      ats,
      suggestions: detailedSuggestions, // NEW!
      stats: {
        textLength: originalText.length,
        totalFound: ats.matched,
        pages: pdfData.numpages || 1,
      },
    });
  } catch (error: any) {
    console.error("❌ Server error:", error);
    return NextResponse.json(
      { error: "Server error while processing PDF", details: error.message },
      { status: 500 }
    );
  }
}
