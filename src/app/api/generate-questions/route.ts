// @ts-nocheck
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { skills, experience, projects } = await req.json();

    const prompt = buildPrompt(skills, experience, projects);

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured. Please add GROQ_API_KEY to your .env.local file" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert technical interviewer. Generate interview questions in valid JSON format only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API Error:", errorData);
      return NextResponse.json(
        { 
          error: "Failed to generate questions", 
          details: errorData.error?.message || "Unknown error",
          hint: "Check if your GROQ_API_KEY is valid"
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("Unexpected API response:", data);
      return NextResponse.json(
        { error: "Invalid response from Model", details: "No content generated" },
        { status: 500 }
      );
    }

    const generatedContent = data.choices[0].message.content;
    console.log("Generated content:", generatedContent.substring(0, 200));

    const questions = parseAIResponse(generatedContent);

    if (questions.length === 0) {
      return NextResponse.json(
        { 
          error: "Failed to parse  response",
          generatedContent: generatedContent.substring(0, 500),
          hint: "The response format was unexpected"
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      questions: questions,
      total: questions.length,
    });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate questions", 
        details: error.message
      },
      { status: 500 }
    );
  }
}

function buildPrompt(skills: any, experience: any, projects: any) {
  const allSkills = [
    ...(skills.programming_languages || []),
    ...(skills.technologies || []),
    ...(skills.tools || []),
  ].slice(0, 15);

  const projectNames = projects?.entries?.map((p: any) => p.name).slice(0, 3) || [];
  const experienceRoles = experience?.entries?.map((e: any) => e.position).slice(0, 2) || [];

  return `You are an expert technical interviewer. Generate 20 interview questions in VALID JSON format ONLY.

Candidate Profile:
- Skills: ${allSkills.join(", ")}
- Projects: ${projectNames.join(", ") || "None"}
- Experience: ${experienceRoles.join(", ") || "Entry Level"}

Return ONLY this JSON array with NO markdown, NO backticks, NO extra text:

[
  {
    "category": "Technical",
    "topic": "JavaScript",
    "question": "Explain closures",
    "answer": "A closure is a function that has access to variables in its outer scope...",
    "difficulty": "Medium"
  }
]

Generate 20 questions total:
- 10 Technical (covering: ${allSkills.slice(0, 5).join(", ")})
- 3 Behavioral
- 2 System Design
- 3 Project-specific
- 2 Experience-based

Difficulty levels: 6 Easy, 10 Medium, 4 Hard

RETURN ONLY VALID JSON ARRAY. No markdown, no backticks, no explanation.`;
}

function parseAIResponse(content: string): any[] {
  try {
    let cleanedContent = content.trim();
    
    const codeBlockStart = "```"
    const codeBlockEnd = "```";
    
    if (cleanedContent.startsWith(codeBlockStart)) {
      cleanedContent = cleanedContent
        .replace(new RegExp(`^${codeBlockStart}\\n?`), "")
        .replace(new RegExp(`${codeBlockEnd}\\n?$`), "");
    } else if (cleanedContent.startsWith(codeBlockEnd)) {
      cleanedContent = cleanedContent
        .replace(new RegExp(`^${codeBlockEnd}\\n?`), "")
        .replace(new RegExp(`${codeBlockEnd}\\n?$`), "");
    }
    
    cleanedContent = cleanedContent.trim();

    const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      console.error("No JSON array found in response");
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(parsed)) {
      console.error("Parsed content is not an array");
      return [];
    }

    return parsed
      .filter((q: any) => q.question && q.answer)
      .map((q: any, index: number) => ({
        id: index + 1,
        category: q.category || "General",
        topic: q.topic || "Interview Question",
        question: q.question || "",
        answer: q.answer || "",
        difficulty: q.difficulty || "Medium",
      }));
  } catch (error) {
    console.error("Error parsing AI response:", error);
    console.error("Content that failed to parse:", content.substring(0, 500));
    return [];
  }
}
