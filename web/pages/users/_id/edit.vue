<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nuxt-link
          :to="`/users/${$route.params.id}`"
          class="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to profile
        </nuxt-link>
        <h1 class="text-3xl font-bold text-gray-900">Edit Profile</h1>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500">Loading profile...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-else class="bg-white rounded-lg shadow p-6">
        <div v-if="validationErrors.length > 0" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 class="font-semibold text-red-800 mb-2">Validation Errors:</h3>
          <ul class="list-disc list-inside text-red-700">
            <li v-for="error in validationErrors" :key="error">{{ error }}</li>
          </ul>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              id="displayName"
              v-model="form.displayName"
              type="text"
              maxlength="100"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your display name"
            />
          </div>

          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
              Username (3-30 characters, alphanumeric, hyphens, underscores)
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              minlength="3"
              maxlength="30"
              pattern="[a-zA-Z0-9_-]+"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="username"
            />
            <p class="mt-1 text-sm text-gray-500">
              Your unique username. Can only contain letters, numbers, hyphens, and underscores.
            </p>
          </div>

          <div>
            <label for="headline" class="block text-sm font-medium text-gray-700 mb-1">
              Headline
            </label>
            <input
              id="headline"
              v-model="form.headline"
              type="text"
              maxlength="150"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Full Stack Developer"
            />
          </div>

          <div>
            <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              v-model="form.bio"
              rows="4"
              maxlength="500"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell us about yourself..."
            />
            <p class="mt-1 text-sm text-gray-500">{{ (form.bio || "").length }}/500 characters</p>
          </div>

          <div>
            <label for="avatarUrl" class="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              v-model="form.avatarUrl"
              type="url"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/avatar.jpg"
            />
            <p class="mt-1 text-sm text-gray-500">
              URL to your profile picture. Leave empty to remove.
            </p>
          </div>

          <div>
            <label for="location" class="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              id="location"
              v-model="form.location"
              type="text"
              maxlength="100"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City, Country"
            />
          </div>

          <div>
            <label for="website" class="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              id="website"
              v-model="form.website"
              type="url"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="submitting"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? "Saving..." : "Save Changes" }}
            </button>
            <nuxt-link
              :to="`/users/${$route.params.id}`"
              class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition inline-block"
            >
              Cancel
            </nuxt-link>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import { api, User } from "~/utils/api";

@Component({
  middleware: "auth",
})
export default class EditProfilePage extends Vue {
  profile: User | null = null;
  loading = true;
  submitting = false;
  error: string | null = null;
  validationErrors: string[] = [];

  form = {
    displayName: "",
    username: "",
    headline: "",
    bio: "",
    avatarUrl: "",
    location: "",
    website: "",
  };

  async fetch() {
    const id = this.$route.params.id;
    const currentUserId = this.$store.state.auth.user?.id;
    const isAdmin = this.$store.getters["auth/isAdmin"];

    // Check authorization
    if (id !== currentUserId && !isAdmin) {
      this.$router.push("/");
      return;
    }

    await this.loadProfile(id);
  }

  async loadProfile(id: string) {
    this.loading = true;
    this.error = null;
    try {
      this.profile = await api.getUser(id);
      this.form = {
        displayName: this.profile.displayName || "",
        username: this.profile.username || "",
        headline: this.profile.headline || "",
        bio: this.profile.bio || "",
        avatarUrl: this.profile.avatarUrl || "",
        location: this.profile.location || "",
        website: this.profile.website || "",
      };
    } catch (err: any) {
      this.error = err.message || "Failed to load profile";
    } finally {
      this.loading = false;
    }
  }

  async handleSubmit() {
    this.validationErrors = [];
    this.submitting = true;

    try {
      const payload: any = {};
      if (this.form.displayName !== this.profile?.displayName)
        payload.displayName = this.form.displayName || null;
      if (this.form.username !== this.profile?.username)
        payload.username = this.form.username || null;
      if (this.form.headline !== this.profile?.headline)
        payload.headline = this.form.headline || null;
      if (this.form.bio !== this.profile?.bio) payload.bio = this.form.bio || null;
      if (this.form.avatarUrl !== this.profile?.avatarUrl)
        payload.avatarUrl = this.form.avatarUrl || null;
      if (this.form.location !== this.profile?.location)
        payload.location = this.form.location || null;
      if (this.form.website !== this.profile?.website)
        payload.website = this.form.website || null;

      await api.updateProfile(this.$route.params.id, payload);
      alert("Profile updated successfully!");
      this.$router.push(`/users/${this.$route.params.id}`);
    } catch (err: any) {
      if (err.details && Array.isArray(err.details)) {
        this.validationErrors = err.details.map((d: any) => `${d.path}: ${d.message}`);
      } else {
        this.validationErrors = [err.message || "Failed to update profile"];
      }
      console.error("Error updating profile:", err);
    } finally {
      this.submitting = false;
    }
  }
}
</script>

