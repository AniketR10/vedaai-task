export interface QuestionType {
  type: "mcq" | "short_answer" | "long_answer" | "true_false" | "fill_in_blank";
  count: number;
  marks: number;
}

export interface AssignmentInput {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: QuestionType[];
  totalMarks: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  additionalInstructions?: string;
  fileContent?: string;
}

export interface GeneratedQuestion {
  questionNumber: number;
  text: string;
  type: "mcq" | "short_answer" | "long_answer" | "true_false" | "fill_in_blank";
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  options?: string[];
}

export interface Section {
  title: string;
  instruction: string;
  questions: GeneratedQuestion[];
}

export interface GeneratedPaper {
  title: string;
  subject: string;
  grade: string;
  totalMarks: number;
  duration: string;
  sections: Section[];
  generatedAt: string;
}

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface WSMessage {
  type: "job_status" | "job_progress" | "job_complete" | "job_error";
  assignmentId: string;
  data: Record<string, unknown>;
}
