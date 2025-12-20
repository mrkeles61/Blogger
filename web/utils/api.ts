const API_BASE = process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000";

// Fetch options with credentials for cookie support
const fetchOptions: RequestInit = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  status?: "Draft" | "Published" | "Scheduled";
  publishedAt: string | null;
  scheduledFor?: string | null;
  isFeatured?: boolean;
  views?: number;
  createdAt: string;
  updatedAt: string;
  authorId?: string;
  author?: User;
  _count?: {
    likes: number;
    comments: number;
  };
}

export interface ArticlesResponse {
  items: Article[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface CreateArticlePayload {
  title: string;
  summary: string;
  content: string;
  status?: "Draft" | "Published" | "Scheduled";
  publishedAt?: string | null;
  scheduledFor?: string | null;
  isFeatured?: boolean;
}

export interface UpdateArticlePayload {
  title?: string;
  summary?: string;
  content?: string;
  status?: "Draft" | "Published" | "Scheduled";
  publishedAt?: string | null;
  scheduledFor?: string | null;
  isFeatured?: boolean;
}

export interface User {
  id: string;
  email: string;
  role: string;
  username?: string | null;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
  website?: string | null;
  headline?: string | null;
  socialLinks?: string | null;
  isVerified?: boolean;
  followersCount?: number;
  followingCount?: number;
  articlesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}

export interface UpdateProfilePayload {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string | null;
  location?: string;
  website?: string | null;
  headline?: string;
  socialLinks?: string;
}

export interface Comment {
  id: string;
  userId: string;
  articleId: string;
  parentId?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  replies?: Comment[];
}

export interface Like {
  id: string;
  userId: string;
  articleId: string;
  createdAt: string;
  user: User;
}

export interface Bookmark {
  id: string;
  userId: string;
  articleId: string;
  createdAt: string;
  article: Article;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  follower?: User;
  following?: User;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  payload: string;
  readAt: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: string;
  entityId: string | null;
  metadata: string | null;
  createdAt: string;
  user: User;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `HTTP error! status: ${response.status}`,
      errorData.details
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  // Only use AbortController in browser (not during SSR)
  let controller: AbortController | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  if (typeof window !== "undefined" && typeof AbortController !== "undefined") {
    controller = new AbortController();
    timeoutId = setTimeout(() => controller!.abort(), 12000); // 12 second timeout
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      ...options,
      signal: controller?.signal,
      headers: {
        ...fetchOptions.headers,
        ...options.headers,
      },
    });
    if (timeoutId) clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timeout - backend may be unavailable");
    }
    throw error;
  }
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetchWithAuth(`${API_BASE}/api/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(response);
  },

  async logout(): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE}/api/auth/logout`, {
      method: "POST",
    });
    await handleResponse<void>(response);
  },

  async getCurrentUser(): Promise<AuthResponse> {
    console.log("[AUTH DEBUG] api.getCurrentUser - making request to:", `${API_BASE}/api/auth/me`);
    console.log("[AUTH DEBUG] Request options:", { credentials: "include" });
    const response = await fetchWithAuth(`${API_BASE}/api/auth/me`);
    console.log("[AUTH DEBUG] Response status:", response.status);
    console.log("[AUTH DEBUG] Response headers:", Object.fromEntries(response.headers.entries()));
    const result = await handleResponse<AuthResponse>(response);
    console.log("[AUTH DEBUG] Response data:", result);
    return result;
  },

  // Articles
  async getArticles(search?: string, authorId?: string): Promise<ArticlesResponse> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (authorId) params.append("authorId", authorId);
    const url = `${API_BASE}/api/articles${params.toString() ? `?${params}` : ""}`;
    const response = await fetchWithAuth(url);
    return handleResponse<ArticlesResponse>(response);
  },

  async getMyArticles(): Promise<ArticlesResponse> {
    const response = await fetchWithAuth(`${API_BASE}/api/articles/my`);
    return handleResponse<ArticlesResponse>(response);
  },

  async getArticle(id: string): Promise<Article> {
    const response = await fetchWithAuth(`${API_BASE}/api/articles/${id}`);
    return handleResponse<Article>(response);
  },

  async createArticle(payload: CreateArticlePayload): Promise<Article> {
    const response = await fetchWithAuth(`${API_BASE}/api/articles`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return handleResponse<Article>(response);
  },

  async updateArticle(id: string, payload: UpdateArticlePayload): Promise<Article> {
    const response = await fetchWithAuth(`${API_BASE}/api/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return handleResponse<Article>(response);
  },

  async deleteArticle(id: string): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE}/api/articles/${id}`, {
      method: "DELETE",
    });
    await handleResponse<void>(response);
  },

  // Users
  async getUsers(search?: string, limit = 20, offset = 0): Promise<{ items: User[]; total: number }> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    const response = await fetchWithAuth(`${API_BASE}/api/users?${params}`);
    return handleResponse<{ items: User[]; total: number }>(response);
  },

  async getUser(idOrUsername: string): Promise<User> {
    const response = await fetchWithAuth(`${API_BASE}/api/users/${idOrUsername}`);
    return handleResponse<User>(response);
  },

  async getUserArticles(idOrUsername: string, includeDrafts = false): Promise<Article[]> {
    const params = includeDrafts ? "?includeDrafts=true" : "";
    const response = await fetchWithAuth(`${API_BASE}/api/users/${idOrUsername}/articles${params}`);
    return handleResponse<Article[]>(response);
  },

  async updateProfile(id: string, payload: UpdateProfilePayload): Promise<User> {
    const response = await fetchWithAuth(`${API_BASE}/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return handleResponse<User>(response);
  },

  async getUserFollowers(idOrUsername: string): Promise<Follow[]> {
    const response = await fetchWithAuth(`${API_BASE}/api/users/${idOrUsername}/followers`);
    return handleResponse<Follow[]>(response);
  },

  async getUserFollowing(idOrUsername: string): Promise<Follow[]> {
    const response = await fetchWithAuth(`${API_BASE}/api/users/${idOrUsername}/following`);
    return handleResponse<Follow[]>(response);
  },

  // Social - Likes
  async likeArticle(articleId: string): Promise<Like> {
    const response = await fetchWithAuth(`${API_BASE}/api/articles/${articleId}/like`, {
      method: "POST",
    });
    return handleResponse<Like>(response);
  },

  async unlikeArticle(articleId: string): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE}/api/articles/${articleId}/like`, {
      method: "DELETE",
    });
    await handleResponse<void>(response);
  },

  async getArticleLikes(articleId: string): Promise<Like[]> {
    const response = await fetchWithAuth(`${API_BASE}/api/articles/${articleId}/likes`);
    return handleResponse<Like[]>(response);
  },

  async hasUserLiked(articleId: string): Promise<{ liked: boolean }> {
    const response = await fetchWithAuth(`${API_BASE}/api/articles/${articleId}/liked`);
    return handleResponse<{ liked: boolean }>(response);
  },

  // Social - Comments
  async addComment(articleId: string, content: string, parentId?: string | null): Promise<Comment & { articleCommentCount?: number }> {
    const response = await fetchWithAuth(`${API_BASE}/api/articles/${articleId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, parentId: parentId || undefined }),
    });
    return handleResponse<Comment & { articleCommentCount?: number }>(response);
  },

  async getArticleComments(articleId: string): Promise<Comment[]> {
    const response = await fetchWithAuth(`${API_BASE}/api/articles/${articleId}/comments`);
    return handleResponse<Comment[]>(response);
  },

  async updateComment(commentId: string, content: string): Promise<Comment> {
    const response = await fetchWithAuth(`${API_BASE}/api/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    });
    return handleResponse<Comment>(response);
  },

  async deleteComment(commentId: string): Promise<{ articleId: string; commentCount: number }> {
    const response = await fetchWithAuth(`${API_BASE}/api/comments/${commentId}`, {
      method: "DELETE",
    });
    return handleResponse<{ articleId: string; commentCount: number }>(response);
  },

  // Social - Bookmarks
  async bookmarkArticle(articleId: string): Promise<Bookmark> {
    const response = await fetchWithAuth(`${API_BASE}/api/articles/${articleId}/bookmark`, {
      method: "POST",
    });
    return handleResponse<Bookmark>(response);
  },

  async unbookmarkArticle(articleId: string): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE}/api/articles/${articleId}/bookmark`, {
      method: "DELETE",
    });
    await handleResponse<void>(response);
  },

  async getBookmarks(): Promise<Bookmark[]> {
    const response = await fetchWithAuth(`${API_BASE}/api/bookmarks`);
    return handleResponse<Bookmark[]>(response);
  },

  // Social - Follows
  async followUser(userId: string): Promise<Follow> {
    const response = await fetchWithAuth(`${API_BASE}/api/users/${userId}/follow`, {
      method: "POST",
    });
    return handleResponse<Follow>(response);
  },

  async unfollowUser(userId: string): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE}/api/users/${userId}/follow`, {
      method: "DELETE",
    });
    await handleResponse<void>(response);
  },

  async isFollowing(userId: string): Promise<{ following: boolean }> {
    const response = await fetchWithAuth(`${API_BASE}/api/users/${userId}/following-status`);
    return handleResponse<{ following: boolean }>(response);
  },

  // Feed & Notifications
  async getFeed(limit = 20): Promise<ActivityLog[]> {
    const response = await fetchWithAuth(`${API_BASE}/api/feed?limit=${limit}`);
    return handleResponse<ActivityLog[]>(response);
  },

  async getNotifications(unreadOnly = false): Promise<Notification[]> {
    const params = unreadOnly ? "?unreadOnly=true" : "";
    const response = await fetchWithAuth(`${API_BASE}/api/feed/notifications${params}`);
    return handleResponse<Notification[]>(response);
  },

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    const response = await fetchWithAuth(`${API_BASE}/api/feed/notifications/${notificationId}/read`, {
      method: "PUT",
    });
    return handleResponse<Notification>(response);
  },

  async markAllNotificationsAsRead(): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE}/api/feed/notifications/read-all`, {
      method: "PUT",
    });
    await handleResponse<void>(response);
  },
};
