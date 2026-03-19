import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  title: string;
  subject: string;
  grade: string;
  dueDate: Date;
  questionTypes: {
    type: string;
    count: number;
    marks: number;
  }[];
  totalMarks: number;
  difficulty: string;
  additionalInstructions?: string;
  fileContent?: string;
  status: "pending" | "processing" | "completed" | "failed";
  generatedPaper?: {
    title: string;
    subject: string;
    grade: string;
    totalMarks: number;
    duration: string;
    sections: {
      title: string;
      instruction: string;
      questions: {
        questionNumber: number;
        text: string;
        type: string;
        difficulty: string;
        marks: number;
        options?: string[];
      }[];
    }[];
    generatedAt: string;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    dueDate: { type: Date, required: true },
    questionTypes: [
      {
        type: { type: String, required: true },
        count: { type: Number, required: true },
        marks: { type: Number, required: true },
      },
    ],
    totalMarks: { type: Number, required: true },
    difficulty: { type: String, required: true },
    additionalInstructions: { type: String },
    fileContent: { type: String },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    generatedPaper: { type: Schema.Types.Mixed },
    error: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>("Assignment", AssignmentSchema);
