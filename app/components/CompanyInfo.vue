<script setup lang="ts">
import { Store } from '@tauri-apps/plugin-store'
import { ref, onMounted } from 'vue'
import type { CompanySettings } from '~/types/settings'

const settings = ref<CompanySettings | null>(null)

onMounted(async () => {
  try {
    const store = await Store.load('company-settings.json')
    const savedSettings = await store.get('settings')
    if (savedSettings) {
      settings.value = savedSettings as CompanySettings
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error)
  }
})
</script>

<template>
  <div v-if="settings">
    <h2 class="text-primary font-bold text-md">{{ settings.companyName }}</h2>
    <div class="text-neutral-500 text-xs">
      <p v-html="settings.address.replace(/\n/g, '<br>')"></p>
      <p>Tél: {{ settings.phoneNumber }}</p>
      <p>TVA: {{ settings.vatNumber }}</p>
    </div>
  </div>
</template>