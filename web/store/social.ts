import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import { api, Like, Comment, Bookmark, Follow } from "~/utils/api";

@Module({
  name: "social",
  stateFactory: true,
  namespaced: true,
})
export default class SocialModule extends VuexModule {
  likes: Record<string, boolean> = {};
  bookmarks: Record<string, boolean> = {};
  following: Record<string, boolean> = {};
  comments: Record<string, Comment[]> = {};

  @Mutation
  setLiked(payload: { articleId: string; liked: boolean }) {
    this.likes = { ...this.likes, [payload.articleId]: payload.liked };
  }

  @Mutation
  setBookmarked(payload: { articleId: string; bookmarked: boolean }) {
    this.bookmarks = { ...this.bookmarks, [payload.articleId]: payload.bookmarked };
  }

  @Mutation
  setFollowing(payload: { userId: string; following: boolean }) {
    this.following = { ...this.following, [payload.userId]: payload.following };
  }

  @Mutation
  setComments(articleId: string, comments: Comment[]) {
    this.comments = { ...this.comments, [articleId]: comments };
  }

  @Mutation
  addComment(articleId: string, comment: Comment) {
    const existing = this.comments[articleId] || [];
    this.comments = {
      ...this.comments,
      [articleId]: [...existing, comment],
    };
  }

  @Mutation
  removeComment(articleId: string, commentId: string) {
    const existing = this.comments[articleId] || [];
    this.comments = {
      ...this.comments,
      [articleId]: existing.filter((c) => c.id !== commentId),
    };
  }

  @Action
  async toggleLike(articleId: string) {
    const currentlyLiked = this.likes[articleId];
    this.context.commit("setLiked", { articleId, liked: !currentlyLiked });

    try {
      if (currentlyLiked) {
        await api.unlikeArticle(articleId);
      } else {
        await api.likeArticle(articleId);
      }
    } catch (error) {
      // Revert on error
      this.context.commit("setLiked", { articleId, liked: currentlyLiked });
      throw error;
    }
  }

  @Action
  async checkLikeStatus(articleId: string) {
    try {
      const { liked } = await api.hasUserLiked(articleId);
      this.context.commit("setLiked", { articleId, liked });
    } catch (error) {
      // Not authenticated or error
      this.context.commit("setLiked", { articleId, liked: false });
    }
  }

  @Action
  async checkBookmarkStatus(articleId: string) {
    // Note: API doesn't have a direct check endpoint, so we'll infer from bookmarks list
    // For now, we'll just set to false and let toggle handle it
    this.context.commit("setBookmarked", { articleId, bookmarked: false });
  }

  @Action
  async toggleBookmark(articleId: string) {
    const currentlyBookmarked = this.bookmarks[articleId];
    this.context.commit("setBookmarked", { articleId, bookmarked: !currentlyBookmarked });

    try {
      if (currentlyBookmarked) {
        await api.unbookmarkArticle(articleId);
      } else {
        await api.bookmarkArticle(articleId);
      }
    } catch (error) {
      this.context.commit("setBookmarked", { articleId, bookmarked: currentlyBookmarked });
      throw error;
    }
  }

  @Action
  async toggleFollow(userId: string) {
    const currentlyFollowing = this.following[userId];
    this.context.commit("setFollowing", { userId, following: !currentlyFollowing });

    try {
      if (currentlyFollowing) {
        await api.unfollowUser(userId);
      } else {
        await api.followUser(userId);
      }
    } catch (error) {
      this.context.commit("setFollowing", { userId, following: currentlyFollowing });
      throw error;
    }
  }

  @Action
  async checkFollowStatus(userId: string) {
    try {
      const { following } = await api.isFollowing(userId);
      this.context.commit("setFollowing", { userId, following });
    } catch (error) {
      this.context.commit("setFollowing", { userId, following: false });
    }
  }

  @Action
  async loadComments(articleId: string) {
    const comments = await api.getArticleComments(articleId);
    this.context.commit("setComments", articleId, comments);
  }

  @Action
  async addComment({ articleId, content }: { articleId: string; content: string }) {
    const comment = await api.addComment(articleId, content);
    this.context.commit("addComment", articleId, comment);
  }

  @Action
  async deleteComment({ articleId, commentId }: { articleId: string; commentId: string }) {
    await api.deleteComment(commentId);
    this.context.commit("removeComment", articleId, commentId);
  }

  get isLiked() {
    return (articleId: string) => this.likes[articleId] || false;
  }

  get isBookmarked() {
    return (articleId: string) => this.bookmarks[articleId] || false;
  }

  get isFollowingUser() {
    return (userId: string) => this.following[userId] || false;
  }

  get getComments() {
    return (articleId: string) => this.comments[articleId] || [];
  }
}

