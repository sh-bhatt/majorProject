import { SECTION_HEADERS } from "@/lib/constants/section-headers";

export function extractSection(text: string, sectionKeywords: string[]): string | null {
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
