<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <InitialSetup v-if="!isConfigured" />
      <div v-else class="text-center py-12">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-warning-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Configuration déjà effectuée</h1>
        <p class="text-gray-600 mb-6">L'application est déjà configurée. Vous pouvez modifier les paramètres dans les réglages.</p>
        <UButton
          color="primary"
          to="/"
          icon="i-heroicons-arrow-left"
        >
          Retour à l'accueil
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Store } from '@tauri-apps/plugin-store'
import type { CompanySettings, AppSettings } from '~/types/settings'

const isConfigured = ref(false)

onMounted(async () => {
  /*
  try {
    // Vérifier si les paramètres de l'entreprise existent
    const companyStore = await Store.load('company-settings.json')
    const companySettings = await companyStore.get('settings') as CompanySettings | null

    // Vérifier si les paramètres de l'application existent
    const appStore = await Store.load('app-settings.json')
    const appSettings = await appStore.get('settings') as AppSettings | null

    // Si les deux configurations existent, on considère que l'application est configurée
    isConfigured.value = !!(companySettings && appSettings)
  } catch (error) {
    console.error('Erreur lors de la vérification de la configuration:', error)
    // En cas d'erreur, on considère que l'application n'est pas configurée
    isConfigured.value = false
  }
  */
})
</script> 