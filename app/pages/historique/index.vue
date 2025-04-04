<script setup lang="ts">
import { useFactures } from '~/composables/useFactures'
import VentesTable from '~/components/VentesTable.vue'
import TransportTable from '~/components/TransportTable.vue'
import { Store } from '@tauri-apps/plugin-store'
import type { AppSettings } from '~/types/settings'

const { loadFactures, deleteFacture } = useFactures()
const isLoading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()
const router = useRouter()
const factures = ref<Facture[]>([])
const appSettings = ref<AppSettings>({
  autoUpdate: true,
  enableVente: true,
  enableTransport: true
})

const facturesVente = computed(() => factures.value.filter(f => f.type === 'vente'))
const facturesTransport = computed(() => factures.value.filter(f => f.type === 'transport'))

onMounted(async () => {
  try {
    isLoading.value = true
    // Charger les paramètres de l'application
    const appStore = await Store.load('app-settings.json')
    const savedAppSettings = await appStore.get('settings') as AppSettings | null
    if (savedAppSettings) {
      appSettings.value = savedAppSettings
    }
    // Charger les factures
    factures.value = await loadFactures()
  } catch (e) {
    error.value = 'Erreur lors du chargement des données'
    console.error('Erreur lors du chargement:', e)
  } finally {
    isLoading.value = false
  }
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const getFactureTypeLabel = (type: 'vente' | 'transport') => {
  return type === 'vente' ? 'Vente' : 'Transport'
}

const getFactureTypeColor = (type: 'vente' | 'transport') => {
  return type === 'vente' ? 'green' : 'blue'
}

const editFacture = (facture: any) => {
  const route = facture.type === 'vente' ? '/vente/' : '/transport/'
  navigateTo(route + facture.id)
}

const handleDeleteFacture = async (facture: any) => {
  try {
    await deleteFacture(facture.id)
    factures.value = await loadFactures()
    toast.add({
      title: 'Succès',
      description: 'La facture a été supprimée avec succès.',
      color: 'success'
    })
  } catch (e) {
    console.error('Erreur lors de la suppression de la facture:', e)
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la suppression de la facture.',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Historique des factures</h1>
      <UButton
        color="primary"
        @click="router.back()"
        icon="i-heroicons-arrow-left"
      >
        Retour
      </UButton>
    </div>

    <div class="space-y-8">
      <UCard v-if="appSettings.enableVente">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Factures de vente</h2>
          </div>
        </template>

        <VentesTable
          :factures="facturesVente"
          :is-loading="isLoading"
          @edit="editFacture"
          @delete="handleDeleteFacture"
        />
      </UCard>

      <UCard v-if="appSettings.enableTransport">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Factures de transport</h2>
          </div>
        </template>

        <TransportTable
          :factures="facturesTransport"
          :is-loading="isLoading"
          @edit="editFacture"
          @delete="handleDeleteFacture"
        />
      </UCard>

      <div v-if="!appSettings.enableVente && !appSettings.enableTransport" class="text-center py-8">
        <p class="text-gray-500">Aucune fonctionnalité n'est activée. Veuillez activer au moins une fonctionnalité dans les paramètres.</p>
      </div>
    </div>
  </div>
</template> 