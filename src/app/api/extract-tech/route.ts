// @ts-nocheck
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import pdfParse from "@cedrugs/pdf-parse"; // ✅ ESM-compatible import

const TECH_KEYWORDS = {
  languages: [
    "python", "java", "c++","C++", "c", "javascript", "typescript",
    "html", "css", "sql", "go", "ruby", "php", "swift",
    "kotlin", "rust", "scala", "perl", "bash", "shell"
  ],
  frameworks: [
    "react", "angular", "vue", "next.js", "nextjs", "node.js", "nodejs",
    "express","expressjs", "spring", "flask", "django", "tensorflow", "pytorch",
    "bootstrap", "tailwind", "tailwindcss", "graphql", "prisma",
    "fastapi", "laravel", "rails", ".net", "dotnet"
  ],
  tools: [
    "git", "github", "docker", "kubernetes", "jenkins", "gitlab",
    "vscode", "vs code", "eclipse", "android studio", "figma", 
    "postman", "vercel", "aws", "azure", "gcp", "jira", "npm", "yarn","chrome dev tools"
  ],
  databases: [
    "mysql", "mongodb", "postgresql", "postgres", "firebase", 
    "oracle", "redis", "sqlite", "dynamodb", "cassandra"
  ],
};

export async function POST(req: Request) {
  try {
    console.log("📄 API /extract-tech hit");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.log("❌ No file in request");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      console.log("❌ Invalid file type:", file.type);
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    console.log("📄 Processing file:", file.name, "Size:", file.size);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ pdf-parse compatible syntax
    let pdfData;
    try {
      pdfData = await pdfParse(buffer);
      console.log("✅ PDF parsed successfully");
    } catch (parseError) {
      console.error("❌ PDF parsing failed:", parseError);
      return NextResponse.json(
        { error: "Failed to parse PDF. File might be corrupted or password-protected." },
        { status: 422 }
      );
    }

    // `@cedrugs/pdf-parse` sometimes returns `textContent` instead of `text`
    const text = (pdfData.text || pdfData.textContent || "").toLowerCase();

    if (!text || text.trim().length === 0) {
      console.log("⚠️ PDF text is empty");
      return NextResponse.json(
        { error: "PDF appears to be empty or contains only images" },
        { status: 422 }
      );
    }

    console.log("📝 Extracted text length:", text.length);

    // Extract matches with regex word boundaries
    const detected = Object.fromEntries(
      Object.entries(TECH_KEYWORDS).map(([category, keywords]) => {
        const found = keywords.filter((kw) => {
          const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
          return regex.test(text);
        });
        return [category, found];
      })
    );

    console.log("✅ Extraction complete:", detected);

    return NextResponse.json({
      success: true,
      data: detected,
      stats: {
        textLength: text.length,
      },
    });
  } catch (error: any) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { 
        error: "Server error while processing PDF",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
