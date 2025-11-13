// @ts-nocheck
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { skills, experience, projects } = await req.json();

    if (!skills) {
      return NextResponse.json(
        { error: "No skills data provided" },
        { status: 400 }
      );
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    console.log("🎯 Generating VERBAL interview questions (no coding required)...");

    // Extract skills data
    const programmingLanguages = skills.programming_languages || [];
    const technologies = skills.technologies || [];
    const tools = skills.tools || [];
    const coursework = skills.coursework || [];

    // Build context
    let context = `Generate 20 VERBAL INTERVIEW QUESTIONS (no coding/typing required) for a candidate with:\n\n`;
    
    if (programmingLanguages.length > 0) {
      context += `Programming Languages: ${programmingLanguages.join(", ")}\n`;
    }
    if (technologies.length > 0) {
      context += `Technologies: ${technologies.join(", ")}\n`;
    }
    if (tools.length > 0) {
      context += `Tools: ${tools.join(", ")}\n`;
    }
    if (coursework.length > 0) {
      context += `Coursework: ${coursework.join(", ")}\n`;
    }

    // Add experience context
    if (experience && experience.found && experience.entries) {
      context += `\nWork Experience:\n`;
      experience.entries.forEach((exp: any, index: number) => {
        context += `${index + 1}. ${exp.title || 'Position'} at ${exp.company || 'Company'}\n`;
        if (exp.description) context += `   ${exp.description.substring(0, 150)}...\n`;
      });
    }

    // Add projects context
    if (projects && projects.found && projects.entries) {
      context += `\nProjects:\n`;
      projects.entries.forEach((proj: any, index: number) => {
        context += `${index + 1}. ${proj.name || 'Project'}\n`;
        if (proj.description) context += `   ${proj.description.substring(0, 150)}...\n`;
      });
    }

    const randomSeed = Date.now();

    const prompt = `${context}

**CRITICAL REQUIREMENTS - VERBAL QUESTIONS ONLY:**

1. Generate questions that can be answered VERBALLY (spoken out loud)
2. NO questions requiring code snippets, typing, or writing code
3. Focus on EXPLANATION, CONCEPTS, SCENARIOS, and DISCUSSION
4. Questions should test understanding through VERBAL EXPLANATION

**Question Types to Include:**
- "Explain how..." (concept explanation)
- "What is the difference between..." (comparison)
- "Describe a scenario where..." (real-world application)
- "Walk me through your thought process for..." (problem-solving approach)
- "How would you approach..." (methodology discussion)
- "What are the advantages and disadvantages of..." (analysis)
- "Tell me about a time when..." (experience-based)
- "Why would you use X over Y?" (decision-making)
- "How does X work internally?" (deep understanding)
- "What factors would you consider when..." (architectural thinking)

**AVOID:**
- "Write a function to..."
- "Implement..."
- "Code a solution for..."
- Questions requiring syntax or code examples
- Algorithm implementation questions
- Any question needing a code editor

**Distribution:**
- 6 Easy (fundamental concepts, definitions, basic comparisons)
- 11 Medium (scenarios, trade-offs, design decisions, problem-solving approaches)
- 3 Hard (complex system design, architectural decisions, advanced concepts)

**Uniqueness Seed:** ${randomSeed}

Return ONLY valid JSON:
[
  {
    "id": 1,
    "category": "Technical" | "Behavioral" | "System Design" | "Project-Specific" | "Experience-Based",
    "topic": "Brief topic",
    "question": "Verbal question that can be spoken and answered without typing code",
    "answer": "Expected verbal answer with key concepts and explanation",
    "difficulty": "Easy" | "Medium" | "Hard"
  }
]

Generate 20 UNIQUE verbal questions NOW:`;

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
            content: "You are an expert technical interviewer who creates VERBAL interview questions that test understanding through spoken explanation. NEVER ask questions requiring code writing or typing. Focus on conceptual understanding, problem-solving approaches, and real-world scenarios that can be explained verbally."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 1.2,
        max_tokens: 4000,
        top_p: 0.95,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", errorText);
      throw new Error("Failed to generate questions");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log("📝 Raw AI response (first 200 chars):", content.substring(0, 200));

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON found in response");
      throw new Error("Invalid response format");
    }

    let questions = JSON.parse(jsonMatch[0]);

    if (questions.length < 20) {
      console.warn(`Only got ${questions.length} questions, expected 20`);
    }

    questions = questions.map((q: any, index: number) => ({
      ...q,
      id: index + 1
    }));

    console.log(`✅ Generated ${questions.length} VERBAL questions (no coding required)`);
    console.log("📊 Categories:", [...new Set(questions.map((q: any) => q.category))].join(", "));

    return NextResponse.json({
      success: true,
      questions: questions,
      stats: {
        total: questions.length,
        easy: questions.filter((q: any) => q.difficulty === "Easy").length,
        medium: questions.filter((q: any) => q.difficulty === "Medium").length,
        hard: questions.filter((q: any) => q.difficulty === "Hard").length,
        categories: [...new Set(questions.map((q: any) => q.category))],
        type: "verbal-only" // ✅ Indicates these are verbal questions
      }
    });

  } catch (error: any) {
    console.error("❌ Error generating questions:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate questions", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
