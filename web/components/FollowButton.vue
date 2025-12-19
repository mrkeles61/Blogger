<template>
  <button
    @click="handleClick"
    :disabled="loading || isOwnProfile"
    class="px-4 py-2 rounded-lg transition"
    :class="
      isFollowing
        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        : 'bg-blue-600 text-white hover:bg-blue-700'
    "
  >
    {{ isFollowing ? "Following" : "Follow" }}
  </button>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "FollowButton",
  props: {
    userId: {
      type: String,
      required: true,
    },
    isOwnProfile: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    isAuthenticated(): boolean {
      return this.$store.getters["auth/isAuthenticated"];
    },
    isFollowing(): boolean {
      return this.$store.getters["social/isFollowingUser"](this.userId);
    },
  },
  async mounted() {
    if (this.isAuthenticated && !this.isOwnProfile) {
      await this.$store.dispatch("social/checkFollowStatus", this.userId);
    }
  },
  methods: {
    async handleClick() {
      if (!this.isAuthenticated) {
        this.$router.push("/login");
        return;
      }

      this.loading = true;
      try {
        await this.$store.dispatch("social/toggleFollow", this.userId);
        this.$emit("followed");
      } catch (err: any) {
        alert(`Failed to ${this.isFollowing ? "unfollow" : "follow"}: ${err.message}`);
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>
