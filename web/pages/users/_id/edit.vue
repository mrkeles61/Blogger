<template>
  <div class="min-h-screen bg-gray-50 font-inter">
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <ShimmerPlaceholder class="h-96 rounded-xl" />
      </div>

      <div v-else-if="error || !canEdit" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <p class="text-yellow-800 mb-4">{{ error || "Bu profili düzenleme yetkiniz yok." }}</p>
        <nuxt-link
          :to="`/users/${$route.params.id}`"
          class="inline-block px-6 py-3 bg-accent-orange text-white rounded-full font-semibold hover:bg-opacity-90 transition-soft"
        >
          Profile Dön
        </nuxt-link>
      </div>

      <div v-else>
        <div class="mb-6">
          <nuxt-link
            :to="`/users/${$route.params.id}`"
            class="text-gray-600 hover:text-accent-orange transition-soft inline-flex items-center gap-2 mb-4"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Profile Dön
          </nuxt-link>
          <h1 class="text-3xl font-playfair font-bold text-gray-900">Profili Düzenle</h1>
        </div>

        <!-- Validation Errors -->
        <div v-if="validationErrors.length > 0" class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 class="font-semibold text-red-800 mb-2">Doğrulama Hataları:</h3>
          <ul class="list-disc list-inside text-red-700 space-y-1">
            <li v-for="error in validationErrors" :key="error">{{ error }}</li>
          </ul>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Basic Info Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
            <h2 class="text-xl font-playfair font-bold mb-6 text-gray-900">Temel Bilgiler</h2>
            <div class="space-y-6">
              <div>
                <label for="displayName" class="block text-sm font-semibold text-gray-700 mb-2">
                  Görünen Ad
                </label>
                <input
                  id="displayName"
                  v-model="form.displayName"
                  type="text"
                  maxlength="100"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-soft"
                  placeholder="Görünen adınız"
                />
              </div>

              <div>
                <label for="username" class="block text-sm font-semibold text-gray-700 mb-2">
                  Kullanıcı Adı (3-30 karakter, alfanumerik, tire, alt çizgi)
                </label>
                <input
                  id="username"
                  v-model="form.username"
                  type="text"
                  minlength="3"
                  maxlength="30"
                  pattern="[a-zA-Z0-9_-]+"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-soft"
                  placeholder="kullanici_adi"
                />
                <p class="mt-1 text-sm text-gray-500">
                  Benzersiz kullanıcı adınız. Sadece harf, rakam, tire ve alt çizgi içerebilir.
                </p>
              </div>

              <div>
                <label for="headline" class="block text-sm font-semibold text-gray-700 mb-2">
                  Başlık
                </label>
                <input
                  id="headline"
                  v-model="form.headline"
                  type="text"
                  maxlength="150"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-soft"
                  placeholder="örn: Full Stack Developer"
                />
              </div>
            </div>
          </div>

          <!-- Bio Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
            <h2 class="text-xl font-playfair font-bold mb-6 text-gray-900">Hakkında</h2>
            <div>
              <label for="bio" class="block text-sm font-semibold text-gray-700 mb-2">
                Biyografi
              </label>
              <textarea
                id="bio"
                v-model="form.bio"
                rows="6"
                maxlength="500"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-soft resize-none"
                placeholder="Kendiniz hakkında kısa bir açıklama..."
              />
              <p class="mt-1 text-sm text-gray-500">{{ (form.bio || "").length }}/500 karakter</p>
            </div>
          </div>

          <!-- Location & Website Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
            <h2 class="text-xl font-playfair font-bold mb-6 text-gray-900">İletişim Bilgileri</h2>
            <div class="space-y-6">
              <div>
                <label for="location" class="block text-sm font-semibold text-gray-700 mb-2">
                  Konum
                </label>
                <input
                  id="location"
                  v-model="form.location"
                  type="text"
                  maxlength="100"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-soft"
                  placeholder="Şehir, Ülke"
                />
              </div>

              <div>
                <label for="website" class="block text-sm font-semibold text-gray-700 mb-2">
                  Website
                </label>
                <input
                  id="website"
                  v-model="form.website"
                  type="url"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-soft"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          <!-- Avatar Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
            <h2 class="text-xl font-playfair font-bold mb-6 text-gray-900">Profil Fotoğrafı</h2>
            <div>
              <label for="avatarUrl" class="block text-sm font-semibold text-gray-700 mb-2">
                Avatar URL
              </label>
              <input
                id="avatarUrl"
                v-model="form.avatarUrl"
                type="url"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-soft"
                placeholder="https://example.com/avatar.jpg"
              />
              <p class="mt-1 text-sm text-gray-500">
                Profil fotoğrafınızın URL'si. Boş bırakırsanız varsayılan avatar kullanılacak.
              </p>
              <div v-if="form.avatarUrl" class="mt-4">
                <img
                  :src="form.avatarUrl"
                  alt="Preview"
                  class="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  @error="handleImageError"
                />
              </div>
            </div>
          </div>

          <!-- Social Links Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
            <h2 class="text-xl font-playfair font-bold mb-6 text-gray-900">Sosyal Medya</h2>
            <div>
              <label for="socialLinks" class="block text-sm font-semibold text-gray-700 mb-2">
                Sosyal Medya Linkleri (JSON formatında)
              </label>
              <textarea
                id="socialLinks"
                v-model="form.socialLinks"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-soft resize-none font-mono text-sm"
                placeholder='{"twitter": "https://twitter.com/username", "github": "https://github.com/username"}'
              />
              <p class="mt-1 text-sm text-gray-500">
                Sosyal medya linklerinizi JSON formatında girin.
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-4 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <button
              type="submit"
              :disabled="submitting"
              class="px-8 py-3 bg-gradient-to-r from-accent-orange to-accent-blue text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {{ submitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet" }}
            </button>
            <nuxt-link
              :to="`/users/${$route.params.id}`"
              class="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-soft font-medium inline-block"
            >
              İptal
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
import ShimmerPlaceholder from "~/components/ShimmerPlaceholder.vue";

@Component({
  components: {
    ShimmerPlaceholder,
  },
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
    socialLinks: "",
  };

  async fetch() {
    const id = this.$route.params.id;
    const currentUserId = this.$store.state.auth.user?.id;
    const isAdmin = this.$store.getters["auth/isAdmin"];

    // Check authorization
    if (id !== currentUserId && !isAdmin) {
      this.error = "Bu profili düzenleme yetkiniz yok";
      this.loading = false;
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
        socialLinks: this.profile.socialLinks || "",
      };
    } catch (err: any) {
      this.error = err.message || "Profil yüklenemedi";
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
      if (this.form.socialLinks !== this.profile?.socialLinks)
        payload.socialLinks = this.form.socialLinks || null;

      await api.updateProfile(this.$route.params.id, payload);
      alert("Profil başarıyla güncellendi!");
      this.$router.push(`/users/${this.$route.params.id}`);
    } catch (err: any) {
      if (err.details && Array.isArray(err.details)) {
        this.validationErrors = err.details.map((d: any) => `${d.path}: ${d.message}`);
      } else {
        this.validationErrors = [err.message || "Profil güncellenemedi"];
      }
      console.error("Error updating profile:", err);
    } finally {
      this.submitting = false;
    }
  }

  handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.style.display = "none";
  }

  get canEdit() {
    if (!this.profile) return false;
    const currentUserId = this.$store.state.auth.user?.id;
    const isAdmin = this.$store.getters["auth/isAdmin"];
    return this.profile.id === currentUserId || isAdmin;
  }
}
</script>
