<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to Bilfen Blog
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800 text-sm">{{ error }}</p>
        </div>

        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div class="relative">
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
            <button
              type="button"
              tabindex="-1"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors focus:outline-none z-20"
              @click.stop.prevent="showPassword = !showPassword"
              aria-label="Şifreyi göster/gizle"
            >
              <!-- Şifre gizliyken: Göz ikonu (göster) -->
              <svg
                v-if="!showPassword"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <!-- Şifre görünürken: Çizgili göz ikonu (gizle) -->
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L12 12m-5.71-5.71L12 12"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3l18 18"
                />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? "Signing in..." : "Sign in" }}
          </button>
        </div>
      </form>

      <div class="text-center text-sm text-gray-600">
        <p>Default admin credentials:</p>
        <p class="font-mono mt-1">admin@example.com / Admin123!</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "LoginPage",
  data() {
    return {
      form: {
        email: "",
        password: "",
      },
      loading: false,
      error: null as string | null,
      showPassword: false,
    };
  },
  methods: {
    async handleSubmit() {
      this.loading = true;
      this.error = null;

      try {
        await this.$store.dispatch("auth/login", {
          email: this.form.email,
          password: this.form.password,
        });
        this.$router.push("/");
      } catch (err: any) {
        // Better error handling for network errors
        console.error("Login error:", err);
        if (err.message && err.message.includes("timeout")) {
          this.error = "Backend sunucusu çalışmıyor. Lütfen backend'in başlatıldığından emin olun.";
        } else if (err.message && err.message.includes("Failed to fetch")) {
          this.error = "Backend sunucusuna bağlanılamıyor. Lütfen backend'in çalıştığından emin olun.";
        } else if (err.message && err.message.includes("Invalid email or password")) {
          this.error = "Geçersiz email veya şifre. Lütfen bilgilerinizi kontrol edin.";
        } else {
          this.error = err.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
        }
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>
