import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title must be at most 500 characters"),
  summary: z
    .string()
    .min(1, "Summary is required")
    .max(500, "Summary must be at most 500 characters"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["Draft", "Published", "Scheduled"]).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledFor: z.string().datetime().optional().nullable(),
  isFeatured: z.boolean().optional(),
});

export const updateArticleSchema = createArticleSchema.partial().extend({
  title: z.string().min(1).max(500).optional(),
  summary: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  status: z.enum(["Draft", "Published", "Scheduled"]).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledFor: z.string().datetime().optional().nullable(),
  isFeatured: z.boolean().optional(),
});

export const reportSchema = z.object({
  type: z.enum(["Article", "Comment"]),
  itemId: z.string().min(1, "Item ID is required"),
  reason: z.string().min(1, "Reason is required").max(500, "Reason too long"),
});

export const createCollaboratorSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["CoAuthor", "Reviewer"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().nullable(),
  headline: z.string().max(150).optional(),
  socialLinks: z.string().optional(), // JSON string
});

export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CommentInput = z.infer<typeof commentSchema>;

