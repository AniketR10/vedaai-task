import Groq from "groq-sdk";
import { env } from "../config/env";
import { AssignmentInput, GeneratedPaper, Section } from "../types";

const groq = new Groq({ apiKey: env.GROQ_API_KEY, timeout: 60000 });

function buildPrompt(input: AssignmentInput): string {
  const questionTypeDescriptions = input.questionTypes
    .map(
      (qt) =>
        `- ${qt.count} ${qt.type.replace("_", " ")} question(s), each worth ${qt.marks} marks`
    )
    .join("\n");

  return `You are an expert exam paper creator. Generate a structured question paper based on the following specifications.

TOTAL MARKS: ${input.totalMarks}
DIFFICULTY LEVEL: ${input.difficulty}

QUESTION BREAKDOWN:
${questionTypeDescriptions}

${input.additionalInstructions ? `ADDITIONAL INSTRUCTIONS FROM TEACHER: ${input.additionalInstructions}` : ""}
${input.fileContent ? `REFERENCE CONTENT (extracted from uploaded PDF/file):\n${input.fileContent.substring(0, 3000)}` : ""}

CRITICAL: You MUST infer the subject, class/grade, and an appropriate title from the reference content and/or additional instructions provided above. If no subject or grade can be determined, make a reasonable guess based on the content's complexity and topic.

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown, no code blocks, no extra text.

The JSON must follow this exact structure:
{
  "title": "inferred title based on the content, e.g. Chapter 5 - Laws of Motion Test",
  "subject": "inferred subject, e.g. Physics",
  "grade": "inferred class/grade, e.g. Class 11",
  "totalMarks": ${input.totalMarks},
  "duration": "appropriate duration like 2 Hours",
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "questionNumber": 1,
          "text": "question text here",
          "type": "mcq",
          "difficulty": "easy",
          "marks": 1,
          "options": ["A) option1", "B) option2", "C) option3", "D) option4"]
        }
      ]
    }
  ]
}

RULES:
1. Group questions into logical sections (Section A, B, C, etc.)
2. Each question MUST have: questionNumber, text, type, difficulty (easy/medium/hard), marks
3. MCQ questions MUST have an "options" array with 4 options prefixed with A), B), C), D)
4. true_false questions should have options: ["A) True", "B) False"]
5. Difficulty should be "${input.difficulty}" overall, but vary individual questions
6. Questions should be academically rigorous and grade-appropriate
7. Total marks of all questions must equal ${input.totalMarks}
8. The title, subject, and grade MUST be inferred from the provided content — do NOT use generic placeholders
9. Return ONLY the JSON object, nothing else`;
}

export async function generateQuestionPaper(
  input: AssignmentInput
): Promise<GeneratedPaper> {
  const prompt = buildPrompt(input);

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a structured data generator. You output only valid JSON. No markdown, no code blocks, no explanations.",
      },
      { role: "user", content: prompt },
    ],
    model: "openai/gpt-oss-120b",
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from ai");
  }

  const parsed = JSON.parse(content) as GeneratedPaper;

  // Validate and fix structure
  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error("Invalid response structure: missing sections");
  }

  let globalQuestionNum = 1;
  parsed.sections = parsed.sections.map((section: Section) => ({
    title: section.title || "Section",
    instruction: section.instruction || "Attempt all questions",
    questions: (section.questions || []).map((q) => ({
      questionNumber: globalQuestionNum++,
      text: q.text || "",
      type: q.type || "short_answer",
      difficulty: q.difficulty || "medium",
      marks: q.marks || 1,
      ...(q.options ? { options: q.options } : {}),
    })),
  }));

  parsed.generatedAt = new Date().toISOString();
  parsed.totalMarks = input.totalMarks;
  if (input.subject && input.subject !== "General") parsed.subject = input.subject;
  if (input.grade && input.grade !== "10") parsed.grade = input.grade;
  if (input.title && input.title !== "Untitled Assignment") parsed.title = input.title;

  return parsed;
}
