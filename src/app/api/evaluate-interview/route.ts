// @ts-nocheck
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { answers } = await req.json();

    if (!answers || answers.length === 0) {
      return NextResponse.json(
        { error: "No answers provided" },
        { status: 400 }
      );
    }

    console.log("📊 API received", answers.length, "answers for evaluation");

    // Generate AI-powered feedback using Groq
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      console.log("⚠️ No Groq API key, using basic feedback");
      const basicFeedback = generateBasicFeedback(answers);
      return NextResponse.json({ feedback: basicFeedback });
    }

    // Call Groq API for intelligent feedback
    const feedback = await generateAIFeedback(answers, GROQ_API_KEY);
    
    return NextResponse.json({ 
      success: true,
      feedback 
    });

  } catch (error: any) {
    console.error("❌ Error evaluating interview:", error);
    
    // Fallback to basic feedback on error
    const basicFeedback = generateBasicFeedback(req.body?.answers || []);
    return NextResponse.json({ 
      feedback: basicFeedback 
    });
  }
}

async function generateAIFeedback(answers: any[], apiKey: string) {
  const feedback = [];

  for (const answer of answers) {
    // Skip if no answer provided
    const userAnswer = answer.userAnswer || "";
    const isEmpty = !userAnswer || userAnswer.trim() === "" || userAnswer.trim().length === 0;

    if (isEmpty) {
      feedback.push(generateSingleFeedback(answer));
      continue;
    }

    const prompt = `You are an expert technical interviewer. Evaluate this interview answer:

Question: ${answer.question}
Expected Answer: ${answer.expectedAnswer}
User's Answer: ${answer.userAnswer}

Provide a JSON response with this structure:
{
  "score": [0-100 score based on accuracy and completeness],
  "feedback": "[2-3 sentence overall feedback]",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"]
}

Be constructive, fair, and specific. If the answer is empty or very poor, give a low score (0-30).`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are an expert technical interviewer providing constructive feedback. Give fair scores based on answer quality."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Try to parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const evaluation = JSON.parse(jsonMatch[0]);
          
          feedback.push({
            questionId: answer.questionId,
            question: answer.question,
            userAnswer: answer.userAnswer,
            expectedAnswer: answer.expectedAnswer,
            score: evaluation.score || 0,
            feedback: evaluation.feedback || "No feedback provided.",
            strengths: evaluation.strengths || ["Participated in interview"],
            improvements: evaluation.improvements || ["Review the topic thoroughly"]
          });
        } else {
          feedback.push(generateSingleFeedback(answer));
        }
      } else {
        feedback.push(generateSingleFeedback(answer));
      }
    } catch (err) {
      console.error("Error calling AI API:", err);
      feedback.push(generateSingleFeedback(answer));
    }
  }

  return feedback;
}

function generateBasicFeedback(answers: any[]) {
  return answers.map(answer => generateSingleFeedback(answer));
}

function generateSingleFeedback(answer: any) {
  const userAnswer = answer.userAnswer || "";
  
  // STRICT checking for empty answers
  const isEmpty = !userAnswer || 
                  userAnswer.trim() === "" || 
                  userAnswer.trim().length === 0;
  
  let score = 0;
  let feedback = "";
  let strengths: string[] = [];
  let improvements: string[] = [];

  // If completely empty - score is 0
  if (isEmpty) {
    console.log(`  Question ${answer.questionId}: Empty answer - Score: 0`);
    return {
      questionId: answer.questionId,
      question: answer.question,
      userAnswer: "No answer provided",
      expectedAnswer: answer.expectedAnswer,
      score: 0,
      feedback: "No answer provided for this question.",
      strengths: ["Participated in the interview"],
      improvements: [
        "Ensure you answer each question",
        "Take time to think before responding",
        "Practice explaining technical concepts"
      ]
    };
  }

  const trimmedAnswer = userAnswer.trim();
  
  // Answer too short
  if (trimmedAnswer.length < 10) {
    console.log(`  Question ${answer.questionId}: Too short (${trimmedAnswer.length} chars) - Score: 15`);
    return {
      questionId: answer.questionId,
      question: answer.question,
      userAnswer: userAnswer,
      expectedAnswer: answer.expectedAnswer,
      score: 15,
      feedback: "Answer is too brief. Provide more detailed explanation.",
      strengths: ["Attempted to answer"],
      improvements: [
        "Expand your answer significantly",
        "Explain concepts in detail",
        "Include examples"
      ]
    };
  }

  // Valid answer - calculate score
  console.log(`  Question ${answer.questionId}: Valid answer - Calculating score`);
  
  // Base score for having an answer
  score = 35;
  
  // Word count scoring
  const words = trimmedAnswer.split(/\s+/).filter(word => word.length > 2);
  const wordCount = words.length;
  
  console.log(`    Word count: ${wordCount}`);
  
  if (wordCount > 100) score += 30;
  else if (wordCount > 70) score += 25;
  else if (wordCount > 50) score += 20;
  else if (wordCount > 30) score += 15;
  else if (wordCount > 15) score += 10;
  else score += 5;
  
  // Keyword matching
  const expectedWords = answer.expectedAnswer.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4);
  
  const userWordsLower = trimmedAnswer.toLowerCase();
  
  const matchedKeywords = expectedWords.filter(word => 
    userWordsLower.includes(word)
  );
  
  const matchCount = matchedKeywords.length;
  const totalKeywords = expectedWords.length;
  const matchPercentage = totalKeywords > 0 ? (matchCount / totalKeywords) * 100 : 0;
  
  console.log(`    Keyword match: ${matchCount}/${totalKeywords} (${matchPercentage.toFixed(1)}%)`);
  
  // Keyword scoring
  if (matchPercentage > 60) score += 35;
  else if (matchPercentage > 40) score += 25;
  else if (matchPercentage > 25) score += 15;
  else if (matchPercentage > 10) score += 8;
  else if (matchPercentage > 0) score += 3;

  score = Math.min(Math.max(score, 0), 100);
  
  console.log(`    Final score: ${score}%`);

  // Generate feedback based on score
  if (score >= 85) {
    feedback = "Excellent answer! You demonstrated strong understanding and provided relevant details.";
    strengths = [
      "Comprehensive explanation",
      "Good technical terminology",
      "Well-structured response",
      "Covered key concepts"
    ];
    improvements = [
      "Consider adding real-world examples",
      "Could mention edge cases"
    ];
  } else if (score >= 70) {
    feedback = "Very good answer. You covered the main points with good detail.";
    strengths = [
      "Good understanding",
      "Covered main concepts",
      "Reasonable detail"
    ];
    improvements = [
      "Add more specific technical details",
      "Include practical examples"
    ];
  } else if (score >= 55) {
    feedback = "Good attempt. Your answer shows understanding but needs more depth.";
    strengths = [
      "Understood core concept",
      "Provided reasonable explanation"
    ];
    improvements = [
      "Add more technical depth",
      "Include specific examples",
      "Use more precise terminology"
    ];
  } else if (score >= 40) {
    feedback = "Your answer shows some understanding but lacks depth and clarity.";
    strengths = [
      "Attempted to answer",
      "Showed basic awareness"
    ];
    improvements = [
      "Study topic more thoroughly",
      "Practice explaining concepts",
      "Add concrete examples"
    ];
  } else {
    feedback = "This answer needs significant improvement. The response was too brief or lacked relevant content.";
    strengths = [
      "Participated in interview"
    ];
    improvements = [
      "Study fundamentals thoroughly",
      "Practice similar questions",
      "Provide detailed explanations"
    ];
  }

  return {
    questionId: answer.questionId,
    question: answer.question,
    userAnswer: userAnswer,
    expectedAnswer: answer.expectedAnswer,
    score,
    feedback,
    strengths,
    improvements
  };
}
