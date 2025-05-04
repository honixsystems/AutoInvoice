<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  description: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 text-center">
    <div v-if="icon" class="mb-4">
      <UIcon :name="icon" class="w-12 h-12 text-gray-400" />
    </div>
    <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
    <p class="mt-2 text-sm text-gray-500">{{ description }}</p>
  </div>
</template> 