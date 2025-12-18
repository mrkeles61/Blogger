import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import { api, ActivityLog, Notification } from "~/utils/api";

@Module({
  name: "feed",
  stateFactory: true,
  namespaced: true,
})
export default class FeedModule extends VuexModule {
  activities: ActivityLog[] = [];
  notifications: Notification[] = [];
  loading = false;

  @Mutation
  setActivities(activities: ActivityLog[]) {
    this.activities = activities;
  }

  @Mutation
  setNotifications(notifications: Notification[]) {
    this.notifications = notifications;
  }

  @Mutation
  setLoading(loading: boolean) {
    this.loading = loading;
  }

  @Mutation
  markNotificationRead(notificationId: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
    );
  }

  @Action
  async loadFeed(limit = 20) {
    this.context.commit("setLoading", true);
    try {
      const activities = await api.getFeed(limit);
      this.context.commit("setActivities", activities);
    } finally {
      this.context.commit("setLoading", false);
    }
  }

  @Action
  async loadNotifications(unreadOnly = false) {
    try {
      const notifications = await api.getNotifications(unreadOnly);
      this.context.commit("setNotifications", notifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }

  @Action
  async markAsRead(notificationId: string) {
    try {
      await api.markNotificationAsRead(notificationId);
      this.context.commit("markNotificationRead", notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  @Action
  async markAllAsRead() {
    try {
      await api.markAllNotificationsAsRead();
      this.notifications = this.notifications.map((n) => ({
        ...n,
        readAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.readAt).length;
  }
}

