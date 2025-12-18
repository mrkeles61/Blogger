import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Validation errors from Zod
  if (err instanceof ZodError) {
    return res.status(422).json({
      message: "Validation error",
      details: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Not found errors
  if (err.message === "Article not found") {
    return res.status(404).json({
      message: err.message,
    });
  }

  // Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    return res.status(400).json({
      message: "Database error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  // Default error
  console.error("Error:", err);
  res.status(500).json({
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

