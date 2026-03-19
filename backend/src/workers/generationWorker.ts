import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { cacheRedis } from "../config/redis";
import { connectDB } from "../config/db";
import { Assignment } from "../models/Assignment";
import { generateQuestionPaper } from "../services/aiService";
import { notifyClient } from "../services/websocket";
import { AssignmentInput } from "../types";
import { env } from "../config/env";
import dotenv from "dotenv";

dotenv.config();

async function processGeneration(job: Job) {
  const { assignmentId } = job.data;

  await connectDB();

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  // update status to processing
  assignment.status = "processing";
  await assignment.save();

  notifyClient({
    type: "job_status",
    assignmentId,
    data: { status: "processing", message: "Generating questions..." },
  });

  // check cache
  const cacheKey = `paper:${assignment.subject}:${assignment.grade}:${assignment.totalMarks}:${assignment.difficulty}:${JSON.stringify(assignment.questionTypes)}`;
  const cached = await cacheRedis.get(cacheKey);

  if (cached) {
    const paper = JSON.parse(cached);
    assignment.generatedPaper = paper;
    assignment.status = "completed";
    await assignment.save();

    notifyClient({
      type: "job_complete",
      assignmentId,
      data: { status: "completed", paper },
    });
    return;
  }

  notifyClient({
    type: "job_progress",
    assignmentId,
    data: { status: "processing", progress: 30, message: "Calling ai model..." },
  });

  const input: AssignmentInput = {
    title: assignment.title,
    subject: assignment.subject,
    grade: assignment.grade,
    dueDate: assignment.dueDate.toISOString(),
    questionTypes: assignment.questionTypes.map((qt) => ({
      type: qt.type as AssignmentInput["questionTypes"][0]["type"],
      count: qt.count,
      marks: qt.marks,
    })),
    totalMarks: assignment.totalMarks,
    difficulty: assignment.difficulty as AssignmentInput["difficulty"],
    additionalInstructions: assignment.additionalInstructions,
    fileContent: assignment.fileContent,
  };

  const paper = await generateQuestionPaper(input);

  notifyClient({
    type: "job_progress",
    assignmentId,
    data: { status: "processing", progress: 80, message: "Saving results..." },
  });

  // cache for 1 hr
  await cacheRedis.setex(cacheKey, 3600, JSON.stringify(paper));

  assignment.generatedPaper = paper;
  assignment.status = "completed";
  await assignment.save();

  notifyClient({
    type: "job_complete",
    assignmentId,
    data: { status: "completed", paper },
  });
}

const worker = new Worker("question-generation", processGeneration, {
  connection: redis,
  concurrency: 3,
});

worker.on("failed", async (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);

  if (job) {
    const { assignmentId } = job.data;
    try {
      await connectDB();
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: "failed",
        error: err.message,
      });
      notifyClient({
        type: "job_error",
        assignmentId,
        data: { status: "failed", error: err.message },
      });
    } catch {}
  }
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

console.log("Generation worker started");
