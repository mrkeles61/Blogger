import { API_BASE } from "../config/api";

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string | null;
}

export interface ArticlesResponse {
  items: Article[];
  total: number;
}

export const api = {
  async getArticles(): Promise<ArticlesResponse> {
    const response = await fetch(`${API_BASE}/api/articles`);
    if (!response.ok) {
      throw new Error("Failed to fetch articles");
    }
    return response.json();
  },

  async getArticle(id: string): Promise<Article> {
    const response = await fetch(`${API_BASE}/api/articles/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch article");
    }
    return response.json();
  },
};

