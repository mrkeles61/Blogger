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
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
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
import { Component, Vue } from "nuxt-property-decorator";

@Component
export default class LoginPage extends Vue {
  form = {
    email: "",
    password: "",
  };
  loading = false;
  error: string | null = null;

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
      this.error = err.message || "Failed to login. Please check your credentials.";
    } finally {
      this.loading = false;
    }
  }
}
</script>

