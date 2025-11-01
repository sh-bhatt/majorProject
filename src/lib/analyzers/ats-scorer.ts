import { DetectedTechnologies } from "@/lib/parsers/tech-extractor";
import { TECH_KEYWORDS } from "@/lib/constants/tech-keywords";

export interface ATSScore {
  score: number;
  feedback: string;
  suggestions: string[];
  breakdown: {
    keywords: number;
    diversity: number;
    sections: number;
    quality: number;
  };
  matched: number;
  totalPossible: number;
  sectionsFound: string[];
}

export function calculateATSScore(text: string, detected: DetectedTechnologies): ATSScore {
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
    contact: /\b(email|phone|linkedin|github|portfolio)\b/i.test(lowerText) || /@/.test(text)
  };
  
  const sectionsPresent = Object.values(sections).filter(Boolean).length;
  const sectionScore = (sectionsPresent / 5) * 25;

  let qualityScore = 0;
  if (/@[a-z0-9.-]+\.[a-z]{2,}/i.test(text)) qualityScore += 2;
  if (/\d+%|\d+\+|increased|decreased|improved|reduced/i.test(lowerText)) qualityScore += 2;
  const actionVerbs = /\b(developed|created|built|designed|implemented|managed|led|improved|optimized|automated|deployed|integrated)\b/i;
  if (actionVerbs.test(lowerText)) qualityScore += 2;
  if (text.length >= 500) qualityScore += 2;
  if (/https?:\/\/|github\.com|linkedin\.com/i.test(text)) qualityScore += 2;

  let totalScore = keywordScore + diversityScore + sectionScore + qualityScore;
  totalScore = Math.min(Math.round(totalScore), 100);

  let feedback = "";
  let suggestions: string[] = [];

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
