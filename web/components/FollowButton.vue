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
import { Component, Vue, Prop } from "nuxt-property-decorator";

@Component
export default class FollowButton extends Vue {
  @Prop({ required: true }) userId!: string;
  @Prop({ default: false }) isOwnProfile!: boolean;

  loading = false;

  async mounted() {
    if (this.isAuthenticated && !this.isOwnProfile) {
      await this.$store.dispatch("social/checkFollowStatus", this.userId);
    }
  }

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
  }

  get isAuthenticated() {
    return this.$store.getters["auth/isAuthenticated"];
  }

  get isFollowing() {
    return this.$store.getters["social/isFollowingUser"](this.userId);
  }
}
</script>

