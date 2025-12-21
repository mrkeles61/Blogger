<template>
  <button
    @click="handleClick"
    :disabled="loading || isOwnProfile"
    class="px-6 py-3 rounded-lg transition-all duration-300 font-semibold whitespace-nowrap"
    :class="
      isFollowing
        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
        : 'bg-accent-purple text-white hover:bg-purple-700 hover:shadow-lg transform hover:-translate-y-0.5'
    "
  >
    {{ isFollowing ? "Takip Ediliyor" : "Takip Et" }}
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
