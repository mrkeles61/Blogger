<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">Notifications</h1>
          <button
            v-if="unreadCount > 0"
            @click="handleMarkAllRead"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500">Loading notifications...</p>
      </div>

      <div v-else-if="notifications.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
        <p class="text-gray-500 text-lg">No notifications</p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="bg-white rounded-lg shadow p-4"
          :class="{ 'bg-blue-50': !notification.readAt }"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-gray-900">{{ getNotificationText(notification) }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ formatDate(notification.createdAt) }}</p>
            </div>
            <button
              v-if="!notification.readAt"
              @click="handleMarkRead(notification.id)"
              class="ml-4 text-blue-600 hover:text-blue-700 text-sm"
            >
              Mark read
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import { api, Notification } from "~/utils/api";

@Component({
  middleware: "auth",
})
export default class NotificationsPage extends Vue {
  notifications: Notification[] = [];
  loading = true;

  async fetch() {
    await this.loadNotifications();
  }

  async loadNotifications() {
    this.loading = true;
    try {
      this.notifications = await api.getNotifications(false);
      this.$store.dispatch("feed/loadNotifications", false);
    } catch (err: any) {
      console.error("Failed to load notifications:", err);
    } finally {
      this.loading = false;
    }
  }

  async handleMarkRead(notificationId: string) {
    try {
      await api.markNotificationAsRead(notificationId);
      await this.loadNotifications();
    } catch (err: any) {
      console.error("Failed to mark notification as read:", err);
    }
  }

  async handleMarkAllRead() {
    try {
      await api.markAllNotificationsAsRead();
      await this.loadNotifications();
    } catch (err: any) {
      console.error("Failed to mark all as read:", err);
    }
  }

  getNotificationText(notification: Notification): string {
    try {
      const payload = JSON.parse(notification.payload);
      switch (notification.type) {
        case "like":
          return `${payload.likerName || "Someone"} liked your article`;
        case "comment":
          return `${payload.commenterName || "Someone"} commented on your article`;
        case "follow":
          return "Someone started following you";
        default:
          return "You have a new notification";
      }
    } catch {
      return "You have a new notification";
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.readAt).length;
  }
}
</script>

