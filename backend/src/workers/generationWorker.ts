import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { cacheRedis, redisPub } from "../config/redis";
import { connectDB } from "../config/db";
import { Assignment } from "../models/Assignment";
import { generateQuestionPaper } from "../services/aiService";
import { AssignmentInput, WSMessage } from "../types";
import { env } from "../config/env";
import dotenv from "dotenv";

dotenv.config();

const workerConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
}) as any;

function publish(message: WSMessage) {
  redisPub.publish("ws:notifications", JSON.stringify(message));
}

async function processGeneration(job: Job) {
  const { assignmentId } = job.data;
  console.log(`[Worker] Processing job ${job.id} for assignment ${assignmentId}`);

  await connectDB();

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  // update status to processing
  assignment.status = "processing";
  await assignment.save();

  publish({
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

    publish({
      type: "job_complete",
      assignmentId,
      data: { status: "completed", paper },
    });
    return;
  }

  publish({
    type: "job_progress",
    assignmentId,
    data: { status: "processing", progress: 30, message: "Calling AI model..." },
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

  console.log(`[Worker] Calling Groq API for assignment ${assignmentId}...`);
  const paper = await generateQuestionPaper(input);
  console.log(`[Worker] Groq API responded for assignment ${assignmentId}`);

  publish({
    type: "job_progress",
    assignmentId,
    data: { status: "processing", progress: 80, message: "Saving results..." },
  });

  // cache for 1 hr
  await cacheRedis.setex(cacheKey, 3600, JSON.stringify(paper));

  assignment.generatedPaper = paper;
  assignment.status = "completed";
  // update assignment with ai-inferred title/subject/grade
  if (paper.title) assignment.title = paper.title;
  if (paper.subject) assignment.subject = paper.subject;
  if (paper.grade) assignment.grade = paper.grade;
  await assignment.save();

  publish({
    type: "job_complete",
    assignmentId,
    data: { status: "completed", paper },
  });
}

const worker = new Worker("question-generation", processGeneration, {
  connection: workerConnection,
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
      publish({
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
