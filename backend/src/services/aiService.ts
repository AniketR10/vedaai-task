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

  const totalQuestions = input.questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const expectedMarks = input.questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

  return `You are an expert exam paper creator. Generate a structured question paper with EXACT specifications below. Do NOT deviate from the counts or marks.

TOTAL MARKS: ${input.totalMarks}
DIFFICULTY LEVEL: ${input.difficulty}
TOTAL QUESTIONS: exactly ${totalQuestions}

EXACT QUESTION BREAKDOWN (you MUST follow this precisely):
${questionTypeDescriptions}

Expected marks sum from questions: ${expectedMarks}. Total paper marks: ${input.totalMarks}.

${input.additionalInstructions ? `ADDITIONAL INSTRUCTIONS FROM TEACHER: ${input.additionalInstructions}` : ""}
${input.fileContent ? `REFERENCE CONTENT (extracted from uploaded PDF/file):\n${input.fileContent.substring(0, 3000)}` : ""}

CRITICAL: Infer the subject, class/grade, and title from the reference content and/or additional instructions. If unclear, make a reasonable guess based on the content's complexity and topic.

Respond with ONLY valid JSON, no markdown, no code blocks.

JSON structure:
{
  "title": "inferred title, e.g. Chapter 5 - Laws of Motion Test",
  "subject": "inferred subject, e.g. Physics",
  "grade": "inferred class/grade, e.g. Class 11",
  "totalMarks": ${input.totalMarks},
  "duration": "appropriate duration like 2 Hours",
  "sections": [
    {
      "title": "Section A - Multiple Choice Questions",
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

STRICT RULES:
1. You MUST generate EXACTLY ${totalQuestions} questions total — no more, no less
2. For each question type, generate EXACTLY the count specified above
3. Each question's marks MUST match what is specified above for its type
4. Group questions by type into sections (e.g. Section A for MCQs, Section B for short answer, etc.)
5. Each question MUST have: questionNumber, text, type, difficulty (easy/medium/hard), marks
6. MCQ questions MUST have "options": ["A) ...", "B) ...", "C) ...", "D) ..."]
7. true_false questions MUST have "options": ["A) True", "B) False"]
8. Overall difficulty: "${input.difficulty}", but vary individual questions within that range
9. Questions must be academically rigorous and grade-appropriate
10. Return ONLY the JSON object`;
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
