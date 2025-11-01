// @ts-nocheck
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { parsePDF } from "@/lib/parsers/pdf-parser";
import { extractTechnologies } from "@/lib/parsers/tech-extractor";
import { parseExperience } from "@/lib/parsers/experience-parser";
import { parseProjects } from "@/lib/parsers/project-parser";
import { calculateATSScore } from "@/lib/analyzers/ats-scorer";
import { generateDetailedSuggestions } from "@/lib/analyzers/suggestion-generator";
import { extractSection } from "@/lib/utils/text-extractor";
import { SECTION_HEADERS } from "@/lib/constants/section-headers";

export async function POST(req: Request) {
  try {
    console.log("📄 API /extract-tech triggered");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let pdfResult;
    try {
      pdfResult = await parsePDF(buffer);
      console.log("✅ PDF parsed successfully");
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || "Failed to parse PDF. File might be corrupted or password-protected." },
        { status: 422 }
      );
    }

    const { text: originalText, numPages } = pdfResult;

    const detected = extractTechnologies(originalText);

    const experienceText = extractSection(originalText, SECTION_HEADERS.experience);
    const experiences = parseExperience(experienceText);

    const projectText = extractSection(originalText, SECTION_HEADERS.projects);
    const projects = parseProjects(projectText);

    console.log(`✅ Extracted ${experiences.length} experience entries`);
    console.log(`✅ Extracted ${projects.length} projects`);

    const ats = calculateATSScore(originalText, detected);

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
      suggestions: detailedSuggestions,
      stats: {
        textLength: originalText.length,
        totalFound: ats.matched,
        pages: numPages,
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
