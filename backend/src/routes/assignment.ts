import { Router, Request, Response } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { z } from "zod";
import { Assignment } from "../models/Assignment";
import { generationQueue } from "../services/queue";
import { cacheRedis } from "../config/redis";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and text files are allowed"));
    }
  },
});

const questionTypeSchema = z.object({
  type: z.enum(["mcq", "short_answer", "long_answer", "true_false", "fill_in_blank"]),
  count: z.number().int().min(1).max(50),
  marks: z.number().min(1).max(20),
});

const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subject: z.string().min(1, "Subject is required").max(100),
  grade: z.string().min(1, "Grade is required").max(50),
  dueDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date"),
  questionTypes: z.array(questionTypeSchema).min(1, "At least one question type required"),
  totalMarks: z.number().int().min(1).max(500),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  additionalInstructions: z.string().max(1000).optional(),
});

// create assignment and queue generation
router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const body =
      typeof req.body.data === "string" ? JSON.parse(req.body.data) : req.body;

    const parsed = createAssignmentSchema.safeParse(body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    let fileContent: string | undefined;
    if (req.file) {
      if (req.file.mimetype === "application/pdf") {
        const pdfData = await pdfParse(req.file.buffer);
        fileContent = pdfData.text;
      } else {
        fileContent = req.file.buffer.toString("utf-8");
      }
    }

    const assignment = new Assignment({
      ...parsed.data,
      dueDate: new Date(parsed.data.dueDate),
      fileContent,
      status: "pending",
    });

    await assignment.save();

    // add to queue
    const job = await generationQueue.add(
      "generate",
      { assignmentId: assignment._id.toString() },
      { jobId: `gen-${assignment._id}` }
    );
    console.log(`[API] Job queued: ${job.id} for assignment ${assignment._id}`);

    res.status(201).json({
      id: assignment._id,
      status: "queued",
      message: "Assignment created. Question generation started.",
    });
  } catch (err: any) {
    console.error("Create assignment error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// get assignment by :id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    res.json(assignment);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// get all assignments
router.get("/", async (_req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find()
      .select("-generatedPaper -fileContent")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(assignments);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// delete assignment
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    res.json({ message: "Assignment deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// regenerate questions
router.post("/:id/regenerate", async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    // clear cache
    const cacheKey = `paper:${assignment.subject}:${assignment.grade}:${assignment.totalMarks}:${assignment.difficulty}:${JSON.stringify(assignment.questionTypes)}`;
    await cacheRedis.del(cacheKey);

    assignment.status = "pending";
    assignment.generatedPaper = undefined;
    assignment.error = undefined;
    await assignment.save();

    await generationQueue.add(
      "generate",
      { assignmentId: assignment._id.toString() },
      { jobId: `gen-${assignment._id}-${Date.now()}` }
    );

    res.json({ status: "queued", message: "Regeneration started" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
