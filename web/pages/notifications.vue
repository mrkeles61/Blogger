<template>
  <div class="min-h-screen bg-gray-50 font-inter">
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-playfair font-bold text-gray-900">Bildirimler</h1>
        <button
          v-if="unreadCount > 0"
          @click="handleMarkAllRead"
          :disabled="markingAllRead"
          class="px-4 py-2 bg-accent-orange text-white rounded-lg hover:bg-opacity-90 transition-soft font-medium disabled:opacity-50"
        >
          {{ markingAllRead ? "İşleniyor..." : "Tümünü Oku" }}
        </button>
      </div>

      <!-- Filter Chips -->
      <div class="mb-6 flex gap-2 overflow-x-auto pb-2">
        <PillButton
          v-for="filter in filters"
          :key="filter.value"
          :variant="activeFilter === filter.value ? 'primary' : 'secondary'"
          @click="setActiveFilter(filter.value)"
          class="flex-shrink-0"
        >
          {{ filter.label }}
        </PillButton>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <ShimmerPlaceholder v-for="n in 5" :key="n" class="h-20 rounded-xl" />
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredNotifications.length === 0" class="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <p class="text-gray-500 text-lg mb-2">Bildirim yok</p>
        <p class="text-gray-400">Yeni bildirimler burada görünecek</p>
      </div>

      <!-- Notifications List -->
      <div v-else class="space-y-3">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-soft cursor-pointer border-l-4"
          :class="notification.readAt ? 'border-transparent' : 'border-accent-orange'"
          @click="handleNotificationClick(notification)"
        >
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div
              class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
              :class="notification.readAt ? 'bg-gray-100' : 'bg-accent-orange bg-opacity-20'"
            >
              <svg
                v-if="notification.type === 'like'"
                class="w-6 h-6"
                :class="notification.readAt ? 'text-gray-600' : 'text-accent-orange'"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <svg
                v-else-if="notification.type === 'comment'"
                class="w-6 h-6"
                :class="notification.readAt ? 'text-gray-600' : 'text-accent-orange'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <svg
                v-else-if="notification.type === 'follow'"
                class="w-6 h-6"
                :class="notification.readAt ? 'text-gray-600' : 'text-accent-orange'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <svg
                v-else
                class="w-6 h-6"
                :class="notification.readAt ? 'text-gray-600' : 'text-accent-orange'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p
                class="text-gray-900 font-medium mb-1"
                :class="{ 'font-semibold': !notification.readAt }"
              >
                {{ getNotificationText(notification) }}
              </p>
              <p class="text-sm text-gray-500">{{ formatDate(notification.createdAt) }}</p>
            </div>

            <!-- Read Indicator -->
            <div
              v-if="!notification.readAt"
              class="flex-shrink-0 w-3 h-3 bg-accent-blue rounded-full"
            ></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import { api, Notification } from "~/utils/api";
import PillButton from "~/components/PillButton.vue";
import ShimmerPlaceholder from "~/components/ShimmerPlaceholder.vue";

type NotificationFilter = "all" | "like" | "comment" | "follow" | "system";

@Component({
  components: {
    PillButton,
    ShimmerPlaceholder,
  },
  middleware: "auth",
})
export default class NotificationsPage extends Vue {
  notifications: Notification[] = [];
  loading = true;
  markingAllRead = false;
  activeFilter: NotificationFilter = "all";

  filters = [
    { label: "Tümü", value: "all" },
    { label: "Beğeniler", value: "like" },
    { label: "Yorumlar", value: "comment" },
    { label: "Takip", value: "follow" },
    { label: "Sistem", value: "system" },
  ];

  async fetch() {
    await this.loadNotifications();
  }

  async loadNotifications() {
    this.loading = true;
    try {
      this.notifications = await api.getNotifications(false);
      await this.$store.dispatch("feed/loadNotifications", false);
    } catch (err: any) {
      console.error("Failed to load notifications:", err);
    } finally {
      this.loading = false;
    }
  }

  async handleMarkAllRead() {
    this.markingAllRead = true;
    try {
      await api.markAllNotificationsAsRead();
      await this.$store.dispatch("feed/markAllNotificationsAsRead");
      await this.loadNotifications();
    } catch (err: any) {
      console.error("Failed to mark all as read:", err);
    } finally {
      this.markingAllRead = false;
    }
  }

  async handleNotificationClick(notification: Notification) {
    if (!notification.readAt) {
      try {
        await api.markNotificationAsRead(notification.id);
        await this.loadNotifications();
      } catch (err: any) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    // Navigate based on notification type
    try {
      const payload = JSON.parse(notification.payload);
      if (payload.articleId) {
        this.$router.push(`/articles/${payload.articleId}`);
      } else if (payload.userId) {
        this.$router.push(`/users/${payload.userId}`);
      }
    } catch {
      // Invalid payload, ignore
    }
  }

  setActiveFilter(filter: NotificationFilter) {
    this.activeFilter = filter;
  }

  get filteredNotifications(): Notification[] {
    if (this.activeFilter === "all") {
      return this.notifications;
    }
    return this.notifications.filter((n) => n.type === this.activeFilter);
  }

  getNotificationText(notification: Notification): string {
    try {
      const payload = JSON.parse(notification.payload);
      switch (notification.type) {
        case "like":
          return `${payload.likerName || "Birisi"} makalenizi beğendi`;
        case "comment":
          return `${payload.commenterName || "Birisi"} makalenize yorum yaptı`;
        case "follow":
          return `${payload.followerName || "Birisi"} sizi takip etmeye başladı`;
        default:
          return "Yeni bir bildiriminiz var";
      }
    } catch {
      return "Yeni bir bildiriminiz var";
    }
  }


  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "az önce";
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.readAt).length;
  }
}
</script>
