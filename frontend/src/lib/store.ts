import { create } from "zustand";

export interface QuestionTypeConfig {
  type: "mcq" | "short_answer" | "long_answer" | "true_false" | "fill_in_blank";
  count: number;
  marks: number;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  totalMarks: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  additionalInstructions: string;
  file: File | null;
}

export interface GeneratedQuestion {
  questionNumber: number;
  text: string;
  type: string;
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

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  status: "pending" | "processing" | "completed" | "failed";
  totalMarks: number;
  generatedPaper?: GeneratedPaper;
  error?: string;
  createdAt: string;
}

type JobStatus = "idle" | "queued" | "processing" | "completed" | "failed";

interface AppState {
  // Form state
  form: AssignmentFormData;
  setFormField: <K extends keyof AssignmentFormData>(
    key: K,
    value: AssignmentFormData[K]
  ) => void;
  resetForm: () => void;
  addQuestionType: () => void;
  removeQuestionType: (index: number) => void;
  updateQuestionType: (index: number, field: keyof QuestionTypeConfig, value: any) => void;

  // Job state
  currentAssignmentId: string | null;
  jobStatus: JobStatus;
  jobProgress: number;
  jobMessage: string;
  setJobStatus: (status: JobStatus, message?: string) => void;
  setJobProgress: (progress: number, message?: string) => void;
  setCurrentAssignment: (id: string | null) => void;

  // Result state
  generatedPaper: GeneratedPaper | null;
  setGeneratedPaper: (paper: GeneratedPaper | null) => void;

  // Assignments list
  assignments: Assignment[];
  setAssignments: (assignments: Assignment[]) => void;
}

const defaultForm: AssignmentFormData = {
  title: "",
  subject: "",
  grade: "",
  dueDate: "",
  questionTypes: [{ type: "mcq", count: 5, marks: 1 }],
  totalMarks: 50,
  difficulty: "medium",
  additionalInstructions: "",
  file: null,
};

export const useAppStore = create<AppState>((set) => ({
  form: { ...defaultForm },
  setFormField: (key, value) =>
    set((state) => ({ form: { ...state.form, [key]: value } })),
  resetForm: () => set({ form: { ...defaultForm } }),
  addQuestionType: () =>
    set((state) => ({
      form: {
        ...state.form,
        questionTypes: [
          ...state.form.questionTypes,
          { type: "short_answer", count: 3, marks: 2 },
        ],
      },
    })),
  removeQuestionType: (index) =>
    set((state) => ({
      form: {
        ...state.form,
        questionTypes: state.form.questionTypes.filter((_, i) => i !== index),
      },
    })),
  updateQuestionType: (index, field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        questionTypes: state.form.questionTypes.map((qt, i) =>
          i === index ? { ...qt, [field]: value } : qt
        ),
      },
    })),

  currentAssignmentId: null,
  jobStatus: "idle",
  jobProgress: 0,
  jobMessage: "",
  setJobStatus: (status, message) =>
    set({ jobStatus: status, jobMessage: message || "" }),
  setJobProgress: (progress, message) =>
    set({ jobProgress: progress, ...(message ? { jobMessage: message } : {}) }),
  setCurrentAssignment: (id) => set({ currentAssignmentId: id }),

  generatedPaper: null,
  setGeneratedPaper: (paper) => set({ generatedPaper: paper }),

  assignments: [],
  setAssignments: (assignments) => set({ assignments }),
}));
