<script setup lang="ts">
import { ref } from 'vue'
import type { TabsItem } from '@nuxt/ui'

const items = ref<TabsItem[]>([
  {
    label: 'Mon entreprise',
    slot: 'company'
  },
  {
    label: 'Application',
    slot: 'app'
  }
])
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Paramètres</h1>
      <UButton
        color="primary"
        to="/"
        icon="i-heroicons-arrow-left"
      >
        Retour
      </UButton>
    </div>

    <div class="flex gap-8">
      <UTabs
        orientation="vertical"
        variant="link"
        :items="items"
        class="w-full items-start gap-8"
      >
        <template #company="{ item }">
          <div class="flex-1">
            <h2 class="text-2xl font-bold mb-6">{{ item.label }}</h2>
            <CompanySettings />
          </div>
        </template>
        <template #app="{ item }">
          <div class="flex-1">
            <h2 class="text-2xl font-bold mb-6">{{ item.label }}</h2>
            <AppSettings />
          </div>
        </template>
      </UTabs>
    </div>
  </div>
</template> 