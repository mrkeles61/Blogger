import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(8, "Title must be at least 8 characters").max(120, "Title must be at most 120 characters"),
  summary: z
    .string()
    .min(20, "Summary must be at least 20 characters")
    .max(280, "Summary must be at most 280 characters"),
  content: z.string().min(1, "Content is required"),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const updateArticleSchema = createArticleSchema.partial().extend({
  title: z.string().min(8).max(120).optional(),
  summary: z.string().min(20).max(280).optional(),
  content: z.string().min(1).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
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

