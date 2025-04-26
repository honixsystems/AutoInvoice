<script setup lang="ts">
import { Store } from '@tauri-apps/plugin-store'
import type { CompanySettings, AppSettings } from '~/types/settings'
const router = useRouter()
const companyName = ref('AutoInvoice')
const appSettings = ref<AppSettings>({
  autoUpdate: true,
  enableVente: true,
  enableTransport: true
})

onMounted(async () => {
  try {
    // Charger les paramètres de l'entreprise
    const companyStore = await Store.load('company-settings.json')
    const savedCompanySettings = await companyStore.get('settings') as CompanySettings | null
    if (savedCompanySettings?.companyName) {
      companyName.value = savedCompanySettings.companyName
    }

    // Charger les paramètres de l'application
    const appStore = await Store.load('app-settings.json')
    const savedAppSettings = await appStore.get('settings') as AppSettings | null
    if (savedAppSettings) {
      appSettings.value = savedAppSettings
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error)
  }
})

const factureTypes = computed(() => {
  const types = [
    {
      type: 'transport',
      title: 'Facture Transport',
      description: 'Générez une facture pour le transport de véhicules',
      icon: 'i-heroicons-truck',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      enabled: appSettings.value.enableTransport
    },
    {
      type: 'vente',
      title: 'Facture Vente',
      description: 'Générez une facture pour la vente de véhicules',
      icon: 'i-heroicons-credit-card',
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      enabled: appSettings.value.enableVente
    }
  ]
  return types.filter(type => type.enabled)
})

const navigateTo = (type: 'transport' | 'vente') => {
  router.push(`/${type}`)
}
</script>

<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Header avec navigation -->
      <header class="flex justify-between items-center mb-12">
        <CompanyLogo class="w-24 h-24" />
        <UButton
          color="neutral"
          variant="soft"
          to="/settings"
          size="sm"
          class="hover:bg-gray-100"
        >
          <UIcon name="i-heroicons-cog-6-tooth" class="mr-2" />
          Paramètres
        </UButton>
      </header>

      <!-- Section principale -->
      <main>
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 mb-2">Bienvenue, {{ companyName }}</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Sélectionnez le type de facture à générer pour commencer
          </p>
        </div>
        
        <!-- Cartes de type de facture -->
        <div :class="[
          'grid gap-8 max-w-4xl mx-auto mb-16',
          factureTypes.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
        ]">
          <template v-for="facture in factureTypes" :key="facture.type">
            <UCard
              class="group cursor-pointer transition-all duration-300 hover:scale-105 overflow-hidden relative"
              @click="navigateTo(facture.type as 'transport' | 'vente')"
            >
              <div :class="`absolute inset-0 bg-gradient-to-r ${facture.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`" />
              <div class="p-8 relative z-10">
                <div class="flex flex-col items-center text-center">
                  <div :class="`p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300`">
                    <UIcon
                      :name="facture.icon"
                      class="w-12 h-12"
                    />
                  </div>
                  <h3 class="text-2xl font-semibold text-gray-900 mb-3">{{ facture.title }}</h3>
                  <p class="text-gray-600">{{ facture.description }}</p>
                </div>
              </div>
            </UCard>
          </template>
        </div>

        <!-- Actions rapides -->
        <div class="max-w-4xl mx-auto">
          <h3 class="text-xl font-semibold text-gray-900 mb-6 text-center">Actions rapides</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UButton
              color="primary"
              variant="soft"
              to="/historique"
              size="lg"
              class="w-full justify-center py-6 hover:bg-primary-50"
            >
              <UIcon name="i-heroicons-clock" class="mr-2 w-5 h-5" />
              <span class="font-medium">Historique des factures</span>
            </UButton>
            <UButton
              color="primary"
              variant="soft"
              to="/clients"
              size="lg"
              class="w-full justify-center py-6 hover:bg-primary-50"
            >
              <UIcon name="i-heroicons-users" class="mr-2 w-5 h-5" />
              <span class="font-medium">Gérer mes clients</span>
            </UButton>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>