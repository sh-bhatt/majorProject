import { TECH_ALIASES } from "@/lib/constants/tech-keywords";

export function keywordExists(keyword: string, text: string): boolean {
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

export function findTechKeywords(text: string, keywords: string[]): string[] {
  const found = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const kw of keywords) {
    if (keywordExists(kw, lowerText)) {
      found.add(kw);
      continue;
    }

    const aliases = TECH_ALIASES[kw] || [];
    for (const alias of aliases) {
      if (keywordExists(alias, lowerText)) {
        found.add(kw);
        break;
      }
    }
  }

  return Array.from(found).sort();
}
