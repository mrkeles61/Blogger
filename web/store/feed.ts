import { api, ActivityLog, Notification } from "~/utils/api";

export const state = () => ({
  activities: [] as ActivityLog[],
  notifications: [] as Notification[],
  loading: false,
});

export type FeedState = ReturnType<typeof state>;

export const mutations = {
  setActivities(state: FeedState, activities: ActivityLog[]) {
    state.activities = activities;
  },
  setNotifications(state: FeedState, notifications: Notification[]) {
    state.notifications = notifications;
  },
  setLoading(state: FeedState, loading: boolean) {
    state.loading = loading;
  },
  markNotificationRead(state: FeedState, notificationId: string) {
    state.notifications = state.notifications.map((n) =>
      n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
    );
  },
};

export const actions = {
  async loadFeed({ commit }: any, limit = 20) {
    commit("setLoading", true);
    try {
      const activities = await api.getFeed(limit);
      commit("setActivities", activities);
    } finally {
      commit("setLoading", false);
    }
  },
  async loadNotifications({ commit }: any, unreadOnly = false) {
    try {
      const notifications = await api.getNotifications(unreadOnly);
      commit("setNotifications", notifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  },
  async markAsRead({ commit }: any, notificationId: string) {
    try {
      await api.markNotificationAsRead(notificationId);
      commit("markNotificationRead", notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },
  async markAllAsRead({ commit, state }: any) {
    try {
      await api.markAllNotificationsAsRead();
      state.notifications = state.notifications.map((n: Notification) => ({
        ...n,
        readAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  },
};

export const getters = {
  unreadCount(state: FeedState): number {
    return state.notifications.filter((n) => !n.readAt).length;
  },
};
