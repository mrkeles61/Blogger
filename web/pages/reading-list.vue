<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-3xl font-bold text-gray-900">Reading List</h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow p-6">
        <p class="text-gray-500">Your reading list will appear here...</p>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";

@Component
export default class ReadingListPage extends Vue {}
</script>

