<script setup lang="ts">
import { Store } from '@tauri-apps/plugin-store'
import type { CompanySettings, AppSettings } from '~/types/settings'
const router = useRouter()
const companyName = ref('AutoInvoice')
const appSettings = ref<AppSettings>({
  enableVente: true,
  enableTransport: true,
  enableGarage: true
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
    },
    {
      type: 'garage',
      title: 'Facture Garage',
      description: 'Générez une facture pour votre garage (service, révision, etc.)',
      icon: 'i-heroicons-wrench-screwdriver',
      color: 'red',
      gradient: 'from-red-500 to-red-600',
      enabled: appSettings.value.enableGarage
    }
  ]
  return types.filter(type => type.enabled)
})

const navigateTo = (type: 'transport' | 'vente' | 'garage') => {
  router.push(`/${type}`)
}
</script>

<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 pb-8">
      <!-- Header avec navigation -->
      <header class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <CompanyLogo class="w-16 h-16" />
        </div>
        <UButton color="neutral" variant="ghost" to="/settings" size="sm"
          class="group hover:bg-gray-100 transition-colors duration-200">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-cog-6-tooth"
              class="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
            <span class="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
              Paramètres
            </span>
          </div>
        </UButton>
      </header>

      <!-- Section principale -->
      <main class="space-y-12">
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Bienvenue, <span class="text-primary-500">{{ companyName
              }}</span>.</h2>
          <p class="text-gray-600">
            Sélectionnez le type de facture à générer pour commencer
          </p>
        </div>

        <!-- Cartes de type de facture -->
        <div :class="[
          'grid gap-6',
          factureTypes.length === 1 ? 'grid-cols-1' :
            factureTypes.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        ]">
          <template v-for="facture in factureTypes" :key="facture.type">
            <UCard
              class="group cursor-pointer transition-all duration-300 hover:scale-105 overflow-hidden relative h-full"
              @click="navigateTo(facture.type as 'transport' | 'vente' | 'garage')">
              <div
                :class="`absolute inset-0 bg-gradient-to-br ${facture.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`" />
              <div class="p-8 relative z-10 h-full flex flex-col">
                <div class="flex flex-col items-center text-center gap-6">
                  <div
                    :class="`p-4 rounded-full group-hover:scale-110 transition-transform duration-300 bg-${facture.color}-50`">
                    <UIcon :name="facture.icon" :class="`w-12 h-12 text-${facture.color}-600`" />
                  </div>
                  <div class="space-y-2">
                    <h3 class="text-2xl font-semibold text-gray-900">{{ facture.title }}</h3>
                    <p class="text-base text-gray-600 max-w-md">{{ facture.description }}</p>
                  </div>
                </div>
              </div>
            </UCard>
          </template>
        </div>

        <!-- Autres menus -->
        <div class="pt-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Gérer mes factures</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UCard
              class="group cursor-pointer transition-all duration-300 hover:scale-105 overflow-hidden relative h-full"
              to="/historique" @click="router.push('/historique')">
              <div
                class="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <div class="p-6 relative z-10 h-full flex flex-col">
                <div class="flex items-start gap-4">
                  <UIcon name="i-heroicons-clock" class="w-8 h-8 text-primary-500" />
                  <div class="space-y-2">
                    <h3 class="text-xl font-semibold text-gray-900">Historique des factures</h3>
                    <p class="text-base text-gray-600">Consultez et gérez l'historique de toutes vos factures</p>
                  </div>
                </div>
              </div>
            </UCard>
            <UCard
              class="group cursor-pointer transition-all duration-300 hover:scale-105 overflow-hidden relative h-full"
              to="/clients" @click="router.push('/clients')">
              <div
                class="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <div class="p-6 relative z-10 h-full flex flex-col">
                <div class="flex items-start gap-4">
                  <UIcon name="i-heroicons-users" class="w-8 h-8 text-primary-500" />
                  <div class="space-y-2">
                    <h3 class="text-xl font-semibold text-gray-900">Gérer mes clients</h3>
                    <p class="text-base text-gray-600">Ajoutez et gérez vos clients et leurs informations</p>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>