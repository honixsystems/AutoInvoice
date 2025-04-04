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
  <div v-if="settings" class="company-info">
    <h2>{{ settings.companyName }}</h2>
    <p v-html="settings.address.replace(/\n/g, '<br>')"></p>
    <p>Tél: {{ settings.phoneNumber }}</p>
    <p>TVA: {{ settings.vatNumber }}</p>
  </div>
</template>

<style scoped>
.company-info h2 {
  color: v-bind('settings?.primaryColor || "#EC6714"');
  font-size: 24px;
  font-weight: 600;
}

.company-info p {
  margin: 3px 0;
  color: #666;
  line-height: 1.3;
}
</style> 