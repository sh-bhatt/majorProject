// @ts-nocheck
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { interviewScore, skills } = await req.json();

    console.log("🎯 Fetching jobs from ALL sources...");

    const level = interviewScore >= 80 ? "Senior" : 
                  interviewScore >= 60 ? "Mid-Level" : "Junior";

    const skillsList = [
      ...(skills.programming_languages || []),
      ...(skills.technologies || []),
      ...(skills.tools || [])
    ];

    // ✅ Fetch from ALL 4 APIs in parallel
    const [adzunaJobs, remotiveJobs, museJobs, arbeitnowJobs] = await Promise.all([
      fetchAdzunaJobs(skillsList, level, interviewScore),
      fetchRemotiveJobs(skillsList, level, interviewScore),
      fetchTheMuseJobs(skillsList, level, interviewScore),
      fetchArbeitnowJobs(skillsList, level, interviewScore)
    ]);

    console.log(`📊 Job Sources:`);
    console.log(`  - Adzuna: ${adzunaJobs.length} jobs`);
    console.log(`  - Remotive: ${remotiveJobs.length} jobs`);
    console.log(`  - The Muse: ${museJobs.length} jobs`);
    console.log(`  - Arbeitnow: ${arbeitnowJobs.length} jobs`);

    // Combine all sources
    let allJobs = [...adzunaJobs, ...remotiveJobs, ...museJobs, ...arbeitnowJobs];

    // Remove duplicates
    allJobs = removeDuplicateJobs(allJobs);

    // Rank by score and relevance
    allJobs = rankJobsByScore(allJobs, interviewScore, skillsList);

    if (allJobs.length === 0) {
      return NextResponse.json({
        success: false,
        jobs: [],
        source: "multiple-apis",
        message: "No jobs found matching your profile"
      });
    }

    console.log(`✅ Total unique jobs: ${allJobs.length}`);

    return NextResponse.json({ 
      success: true, 
      jobs: allJobs.slice(0, 20), // Top 20 jobs
      source: "multi-api",
      stats: {
        adzuna: adzunaJobs.length,
        remotive: remotiveJobs.length,
        themuse: museJobs.length,
        arbeitnow: arbeitnowJobs.length,
        total: allJobs.length,
        afterDedup: allJobs.length
      }
    });

  } catch (error: any) {
    console.error("❌ Error fetching jobs:", error);
    return NextResponse.json({
      success: false,
      jobs: [],
      source: "error",
      message: "API failed to fetch jobs",
      error: error.message
    }, { status: 500 });
  }
}

// ===== API 1: ADZUNA (India-specific) =====
async function fetchAdzunaJobs(skills: string[], level: string, interviewScore: number) {
  try {
    const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
    const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
      console.warn("⚠️ Adzuna API keys not configured");
      return [];
    }

    const searchQuery = skills.slice(0, 3).join(" OR ");
    const experienceQuery = level === "Senior" ? "senior" : 
                           level === "Mid-Level" ? "mid level" : "junior";

    const locations = ["Bangalore", "Hyderabad", "Pune"];
    const allJobs: any[] = [];

    for (const location of locations) {
      try {
        const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&what=${encodeURIComponent(searchQuery + " developer")}&where=${encodeURIComponent(location)}&results_per_page=8&sort_by=date`;

        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          const jobs = data.results || [];
          
          jobs.forEach((job: any, index: number) => {
            allJobs.push({
              id: `adzuna-${location}-${index}-${Date.now()}`,
              title: job.title,
              company: job.company?.display_name || "Company",
              location: job.location?.display_name || `${location}, India`,
              salary: job.salary_min ? `₹${formatIndianSalary(job.salary_min)}-${formatIndianSalary(job.salary_max || job.salary_min * 1.5)} LPA` : "Competitive",
              type: job.contract_type || "Full-time",
              experience: extractExperience(job.description) || "Not specified",
              skills: extractSkills(job.description, skills),
              matchScore: calculateMatchScore(job, skills),
              description: cleanDescription(job.description),
              url: job.redirect_url,
              source: "adzuna",
              postedDate: job.created || new Date().toISOString()
            });
          });
        }
      } catch (error) {
        console.error(`Error fetching from ${location}:`, error);
      }
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    return removeDuplicateJobs(allJobs);
  } catch (error) {
    console.error("Adzuna error:", error);
    return [];
  }
}

// ===== API 2: REMOTIVE (Remote jobs) =====
async function fetchRemotiveJobs(skills: string[], level: string, interviewScore: number) {
  try {
    const searchQuery = skills.slice(0, 2).join(" ");
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(searchQuery)}&limit=10`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    const jobs = data.jobs || [];

    return jobs
      .filter((job: any) => {
        const jobText = (job.title + " " + job.description).toLowerCase();
        return skills.some(skill => jobText.includes(skill.toLowerCase()));
      })
      .slice(0, 8)
      .map((job: any, index: number) => ({
        id: `remotive-${index}-${Date.now()}`,
        title: job.title,
        company: job.company_name || "Remote Company",
        location: job.candidate_required_location || "Remote (Worldwide)",
        salary: job.salary || "Competitive",
        type: job.job_type || "Full-time",
        experience: extractExperience(job.description) || "Not specified",
        skills: extractSkills(job.description, skills),
        matchScore: calculateMatchScore({ title: job.title, description: job.description }, skills),
        description: cleanDescription(job.description),
        url: job.url,
        source: "remotive",
        postedDate: job.publication_date || new Date().toISOString()
      }));
  } catch (error) {
    console.error("Remotive error:", error);
    return [];
  }
}

// ===== API 3: THE MUSE (Tech/Creative jobs) =====
async function fetchTheMuseJobs(skills: string[], level: string, interviewScore: number) {
  try {
    const searchQuery = skills.slice(0, 2).join(" ");
    const url = `https://www.themuse.com/api/public/jobs?category=Software%20Engineering&location=Remote&page=1`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    const jobs = data.results || [];

    return jobs
      .filter((job: any) => {
        const jobText = (job.name + " " + (job.contents || "")).toLowerCase();
        return skills.some(skill => jobText.includes(skill.toLowerCase()));
      })
      .slice(0, 6)
      .map((job: any, index: number) => ({
        id: `muse-${index}-${Date.now()}`,
        title: job.name,
        company: job.company?.name || "Company",
        location: job.locations?.[0]?.name || "Remote",
        salary: "Competitive",
        type: job.type || "Full-time",
        experience: job.levels?.[0]?.name || "Not specified",
        skills: extractSkills(job.contents || "", skills),
        matchScore: calculateMatchScore({ title: job.name, description: job.contents }, skills),
        description: cleanDescription(job.contents || "View full description on The Muse"),
        url: job.refs?.landing_page,
        source: "themuse",
        postedDate: job.publication_date || new Date().toISOString()
      }));
  } catch (error) {
    console.error("The Muse error:", error);
    return [];
  }
}

// ===== API 4: ARBEITNOW (Startup jobs) =====
async function fetchArbeitnowJobs(skills: string[], level: string, interviewScore: number) {
  try {
    const url = `https://www.arbeitnow.com/api/job-board-api`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    const jobs = data.data || [];

    return jobs
      .filter((job: any) => {
        const jobText = (job.title + " " + job.description).toLowerCase();
        const hasSkills = skills.some(skill => jobText.includes(skill.toLowerCase()));
        const isRemoteOrIndia = job.location?.toLowerCase().includes("remote") || 
                                job.location?.toLowerCase().includes("india");
        return hasSkills && isRemoteOrIndia;
      })
      .slice(0, 6)
      .map((job: any, index: number) => ({
        id: `arbeit-${index}-${Date.now()}`,
        title: job.title,
        company: job.company_name || "Company",
        location: job.location || "Remote",
        salary: "Competitive",
        type: job.job_types?.[0] || "Full-time",
        experience: "Not specified",
        skills: extractSkills(job.description, skills),
        matchScore: calculateMatchScore(job, skills),
        description: cleanDescription(job.description),
        url: job.url,
        source: "arbeitnow",
        postedDate: job.created_at || new Date().toISOString()
      }));
  } catch (error) {
    console.error("Arbeitnow error:", error);
    return [];
  }
}

// ===== HELPER FUNCTIONS =====

function removeDuplicateJobs(jobs: any[]): any[] {
  const seen = new Set();
  return jobs.filter(job => {
    const key = `${job.title.toLowerCase().trim()}-${job.company.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function cleanDescription(description: string): string {
  if (!description) return "No description available";
  const cleaned = description
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&amp;|&lt;|&gt;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > 250 ? cleaned.substring(0, 250) + "..." : cleaned;
}

function formatIndianSalary(annualSalary: number): string {
  return (annualSalary / 100000).toFixed(1);
}

function extractExperience(description: string): string {
  if (!description) return "";
  const patterns = [
    /(\d+)\s*[-to]+\s*(\d+)\s*(years?|yrs?)/i,
    /(\d+)\+?\s*(years?|yrs?)/i,
  ];
  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      return match[2] ? `${match[1]}-${match[2]} years` : `${match[1]}+ years`;
    }
  }
  return "";
}

function extractSkills(description: string, candidateSkills: string[]): string[] {
  if (!description) return [];
  const lowerDesc = description.toLowerCase();
  const foundSkills: string[] = [];
  
  candidateSkills.forEach(skill => {
    if (lowerDesc.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  const commonSkills = [
    "React", "Angular", "Vue", "Node.js", "Python", "Java",
    "JavaScript", "TypeScript", "AWS", "Docker", "MongoDB", "SQL"
  ];
  
  commonSkills.forEach(skill => {
    if (lowerDesc.includes(skill.toLowerCase()) && !foundSkills.includes(skill)) {
      foundSkills.push(skill);
    }
  });

  return foundSkills.slice(0, 8);
}

function calculateMatchScore(job: any, candidateSkills: string[]): number {
  const jobText = ((job.title || "") + " " + (job.description || "")).toLowerCase();
  let matchCount = 0;

  candidateSkills.forEach(skill => {
    if (jobText.includes(skill.toLowerCase())) {
      matchCount++;
    }
  });

  if (candidateSkills.length === 0) return 50;
  const matchPercentage = (matchCount / candidateSkills.length) * 100;
  return Math.min(95, Math.round(40 + (matchPercentage * 0.55)));
}

function rankJobsByScore(jobs: any[], interviewScore: number, skills: string[]) {
  return jobs
    .map(job => ({
      ...job,
      adjustedMatchScore: Math.min(100, job.matchScore + (interviewScore / 10))
    }))
    .sort((a, b) => {
      if (b.adjustedMatchScore !== a.adjustedMatchScore) {
        return b.adjustedMatchScore - a.adjustedMatchScore;
      }
      return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    })
    .map(job => ({
      ...job,
      matchScore: Math.round(job.adjustedMatchScore)
    }));
}
nm