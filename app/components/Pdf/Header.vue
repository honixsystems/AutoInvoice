<template>
  <div class="flex flex-col mb-4 pb-1 border-b-2 border-primary">
    <div class="flex justify-between items-center text-right">
      <CompanyLogo />
      <CompanyInfo />
    </div>
    <h1 class="text-primary font-bold text-2xl mt-2">{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>