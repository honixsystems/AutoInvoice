<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-8">
    <div class="max-w-4xl w-full text-center">
      <div class="relative mb-12">
        <UIcon name="i-heroicons-check-circle" class="w-24 h-24 text-success-500" />
      </div>

      <h1 class="text-4xl font-bold text-gray-900 mb-6">Configuration terminée avec succès</h1>
      <p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        Votre application est maintenant configurée et prête à être utilisée. Vous pouvez commencer à créer des factures et gérer votre entreprise.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
        <div class="p-8 rounded-2xl bg-primary-50/20 border border-primary-100 text-start">
          <div class="flex items-center gap-4 mb-4">
            <UIcon name="i-heroicons-building-office" class="w-8 h-8 text-primary-500" />
            <h2 class="text-xl font-semibold text-gray-900">Informations entreprise</h2>
          </div>
          <p class="text-lg text-gray-700 font-semibold">{{ companySettings?.companyName }}</p>
          <p class="text-lg text-gray-700">{{ companySettings?.address }}</p>
        </div>

        <div class="p-8 rounded-2xl bg-success-50 border border-success-100">
          <div class="flex items-center gap-4 mb-4">
            <UIcon name="i-heroicons-cog-6-tooth" class="w-8 h-8 text-success-500" />
            <h2 class="text-xl font-semibold text-gray-900">Fonctionnalités activées</h2>
          </div>
          <ul class="text-lg text-gray-700 space-y-3">
            <li v-if="appSettings?.enableVente" class="flex items-center gap-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-success-500" />
              Facturation de vente
            </li>
            <li v-if="appSettings?.enableTransport" class="flex items-center gap-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-success-500" />
              Facturation de transport
            </li>
          </ul>
        </div>
      </div>

      <div class="flex flex-col items-center gap-6">
        <p class="text-base text-gray-500">Vous pouvez modifier ces paramètres à tout moment dans les réglages de l'application.</p>
        <UButton
          size="xl"
          color="primary"
          class="w-full max-w-md flex justify-center items-center"
          to="/"
        >
          Commencer à utiliser AutoInvoice
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Store } from '@tauri-apps/plugin-store'
import type { CompanySettings, AppSettings } from '~/types/settings'

const router = useRouter()
const companySettings = ref<CompanySettings | null>(null)
const appSettings = ref<AppSettings | null>(null)

onMounted(async () => {
  try {
    const companyStore = await Store.load('company-settings.json')
    const appStore = await Store.load('app-settings.json')
    
    companySettings.value = await companyStore.get('settings')
    appSettings.value = await appStore.get('settings')

    if (!companySettings.value || !appSettings.value) {
      router.push('/setup')
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error)
    router.push('/setup')
  }
})
</script> 