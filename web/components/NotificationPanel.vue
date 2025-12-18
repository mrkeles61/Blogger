<template>
  <transition name="slide-over">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-hidden"
      @click.self="$emit('close')"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <!-- Panel -->
      <div class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div class="flex flex-col h-full">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 class="text-xl font-playfair font-bold text-gray-900">Bildirimler</h2>
            <button
              @click="$emit('close')"
              class="p-2 hover:bg-gray-100 rounded-full transition-soft"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto">
            <div v-if="loading" class="p-4 space-y-4">
              <div v-for="i in 3" :key="i" class="animate-pulse">
                <div class="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
            
            <div v-else-if="notifications.length === 0" class="p-8 text-center text-gray-500">
              <p>No notifications</p>
            </div>
            
            <div v-else class="divide-y divide-gray-100">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="p-4 hover:bg-gray-50 transition-soft cursor-pointer"
                :class="{ 'bg-blue-50': !notification.readAt }"
                @click="handleNotificationClick(notification)"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full bg-accent-orange bg-opacity-20 flex items-center justify-center">
                    <component :is="getNotificationIcon(notification.type)" class="w-5 h-5 text-accent-orange" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900">
                      {{ getNotificationText(notification) }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ formatDate(notification.createdAt) }}
                    </p>
                  </div>
                  <div
                    v-if="!notification.readAt"
                    class="flex-shrink-0 w-2 h-2 bg-accent-blue rounded-full"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div v-if="unreadCount > 0" class="p-4 border-t border-gray-200">
            <button
              @click="$emit('mark-all-read')"
              class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-soft text-sm font-medium"
            >
              Tümünü Oku
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "nuxt-property-decorator";
import { Notification } from "~/utils/api";

@Component
export default class NotificationPanel extends Vue {
  @Prop({ required: true }) isOpen!: boolean;
  @Prop({ default: () => [] }) notifications!: Notification[];
  @Prop({ default: false }) loading!: boolean;

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.readAt).length;
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

  getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      like: "svg-heart",
      comment: "svg-comment",
      follow: "svg-user-plus",
    };
    return iconMap[type] || "svg-bell";
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleDateString();
  }

  handleNotificationClick(notification: Notification) {
    this.$emit("notification-click", notification);
  }
}
</script>

<style scoped>
.slide-over-enter-active,
.slide-over-leave-active {
  transition: opacity 0.3s ease;
}

.slide-over-enter,
.slide-over-leave-to {
  opacity: 0;
}

.slide-over-enter-active .bg-white,
.slide-over-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.slide-over-enter .bg-white,
.slide-over-leave-to .bg-white {
  transform: translateX(100%);
}
</style>

