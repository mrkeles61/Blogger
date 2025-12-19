import { Router, Response } from "express";
import {
  createReport,
  getReports,
  updateReportStatus,
  getModerationAudit,
  getReportContext,
} from "../services/moderationService";
import { reportSchema } from "../lib/validation";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate, requireRole, AuthenticatedRequest } from "../middleware/auth";

export const moderationRouter = Router();

// POST /api/reports
moderationRouter.post(
  "/reports",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedData = reportSchema.parse(req.body);
    const reporterId = req.user!.id;
    const report = await createReport(
      validatedData.type,
      validatedData.itemId,
      reporterId,
      validatedData.reason
    );
    res.status(201).json(report);
  })
);

// GET /api/moderation/reports
moderationRouter.get(
  "/reports",
  authenticate,
  requireRole("Admin"),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const status = req.query.status as "Open" | "InReview" | "Resolved" | undefined;
    const type = req.query.type as any;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getReports(status, type, page, limit);
    res.json(result);
  })
);

// GET /api/moderation/reports/:id
moderationRouter.get(
  "/reports/:id",
  authenticate,
  requireRole("Admin"),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const context = await getReportContext(id);
    res.json(context);
  })
);

// PUT /api/moderation/reports/:id
moderationRouter.put(
  "/reports/:id",
  authenticate,
  requireRole("Admin"),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;
    const adminId = req.user!.id;

    if (!status || !["Open", "InReview", "Resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const report = await updateReportStatus(id, status, resolutionNotes, adminId);
    res.json(report);
  })
);

// GET /api/moderation/audit
moderationRouter.get(
  "/audit",
  authenticate,
  requireRole("Admin"),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const audit = await getModerationAudit(limit);
    res.json(audit);
  })
);

