import { api, Comment } from "~/utils/api";

export const state = () => ({
  likes: {} as Record<string, boolean>,
  bookmarks: {} as Record<string, boolean>,
  following: {} as Record<string, boolean>,
  comments: {} as Record<string, Comment[]>,
});

export type SocialState = ReturnType<typeof state>;

export const mutations = {
  setLiked(state: SocialState, payload: { articleId: string; liked: boolean }) {
    state.likes = { ...state.likes, [payload.articleId]: payload.liked };
  },
  setBookmarked(state: SocialState, payload: { articleId: string; bookmarked: boolean }) {
    state.bookmarks = { ...state.bookmarks, [payload.articleId]: payload.bookmarked };
  },
  clearBookmarks(state: SocialState) {
    state.bookmarks = {};
  },
  setFollowing(state: SocialState, payload: { userId: string; following: boolean }) {
    state.following = { ...state.following, [payload.userId]: payload.following };
  },
  setComments(state: SocialState, payload: { articleId: string; comments: Comment[] }) {
    state.comments = { ...state.comments, [payload.articleId]: payload.comments };
  },
  addComment(state: SocialState, payload: { articleId: string; comment: Comment }) {
    const existing = state.comments[payload.articleId] || [];
    // If it's a reply, find parent and add it there
    if (payload.comment.parentId) {
      const updated = existing.map((c: Comment & { replies?: Comment[] }) => {
        if (c.id === payload.comment.parentId) {
          return { ...c, replies: [...(c.replies || []), payload.comment] };
        }
        return c;
      });
      state.comments = {
        ...state.comments,
        [payload.articleId]: updated,
      };
    } else {
      state.comments = {
        ...state.comments,
        [payload.articleId]: [...existing, payload.comment],
      };
    }
  },
  removeComment(state: SocialState, payload: { articleId: string; commentId: string }) {
    const existing = state.comments[payload.articleId] || [];
    state.comments = {
      ...state.comments,
      [payload.articleId]: existing.filter((c) => c.id !== payload.commentId),
    };
  },
};

export const actions = {
  async toggleLike({ commit, state }: any, articleId: string) {
    const currentlyLiked = state.likes[articleId];
    commit("setLiked", { articleId, liked: !currentlyLiked });

    try {
      if (currentlyLiked) {
        await api.unlikeArticle(articleId);
      } else {
        await api.likeArticle(articleId);
      }
    } catch (error) {
      // Revert on error
      commit("setLiked", { articleId, liked: currentlyLiked });
      throw error;
    }
  },
  async checkLikeStatus({ commit }: any, articleId: string) {
    try {
      const { liked } = await api.hasUserLiked(articleId);
      commit("setLiked", { articleId, liked });
    } catch (error) {
      // Not authenticated or error
      commit("setLiked", { articleId, liked: false });
    }
  },
  async loadBookmarks({ commit }: any) {
    try {
      const bookmarks = await api.getBookmarks();
      // Update store with bookmark statuses for all bookmarked articles
      for (const bookmark of bookmarks) {
        commit("setBookmarked", {
          articleId: bookmark.article.id,
          bookmarked: true,
        });
      }
      return bookmarks;
    } catch (error) {
      // Not authenticated or error - clear all bookmarks
      commit("clearBookmarks");
      throw error;
    }
  },
  async checkBookmarkStatus({ commit }: any, articleId: string) {
    // Note: API doesn't have a direct check endpoint, so we'll infer from bookmarks list
    // For now, we'll just set to false and let toggle handle it
    commit("setBookmarked", { articleId, bookmarked: false });
  },
  async toggleBookmark({ commit, state }: any, articleId: string) {
    const currentlyBookmarked = state.bookmarks[articleId] || false;
    // Optimistic update - update UI immediately
    commit("setBookmarked", { articleId, bookmarked: !currentlyBookmarked });

    try {
      if (currentlyBookmarked) {
        await api.unbookmarkArticle(articleId);
      } else {
        await api.bookmarkArticle(articleId);
      }
      // Success - state already updated optimistically
    } catch (error) {
      // Revert on error
      commit("setBookmarked", { articleId, bookmarked: currentlyBookmarked });
      throw error;
    }
  },
  async toggleFollow({ commit, state }: any, userId: string) {
    const currentlyFollowing = state.following[userId];
    commit("setFollowing", { userId, following: !currentlyFollowing });

    try {
      if (currentlyFollowing) {
        await api.unfollowUser(userId);
      } else {
        await api.followUser(userId);
      }
    } catch (error) {
      commit("setFollowing", { userId, following: currentlyFollowing });
      throw error;
    }
  },
  async checkFollowStatus({ commit }: any, userId: string) {
    try {
      const { following } = await api.isFollowing(userId);
      commit("setFollowing", { userId, following });
    } catch (error) {
      commit("setFollowing", { userId, following: false });
    }
  },
  async loadComments({ commit }: any, articleId: string) {
    const comments = await api.getArticleComments(articleId);
    commit("setComments", { articleId, comments });
  },
  async addComment({ commit }: any, payload: { articleId: string; content: string; parentId?: string | null }) {
    const result = await api.addComment(payload.articleId, payload.content, payload.parentId);
    const { articleCommentCount, ...comment } = result;
    commit("addComment", { articleId: payload.articleId, comment });
    return { comment, articleCommentCount };
  },
  async deleteComment({ commit }: any, payload: { articleId: string; commentId: string }) {
    const result = await api.deleteComment(payload.commentId);
    commit("removeComment", payload);
    return result;
  },
};

export const getters = {
  isLiked: (state: SocialState) => (articleId: string) => state.likes[articleId] || false,
  isBookmarked: (state: SocialState) => (articleId: string) => state.bookmarks[articleId] || false,
  isFollowingUser: (state: SocialState) => (userId: string) => state.following[userId] || false,
  getComments: (state: SocialState) => (articleId: string) => state.comments[articleId] || [],
};
