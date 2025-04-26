<script setup lang="ts">
import { useFactures } from '~/composables/useFactures'
import VentesTable from '~/components/VentesTable.vue'
import TransportTable from '~/components/TransportTable.vue'
import StatsCard from '~/components/StatsCard.vue'
import { Store } from '@tauri-apps/plugin-store'
import type { AppSettings } from '~/types/settings'
import type { Facture } from '~/types/facture/common'
import type { FactureVente } from '~/types/facture/vente'
import type { FactureTransport } from '~/types/facture/transport'
import type { FactureVenteFilters, FactureTransportFilters } from '~/types/facture/filters'

const { loadFacturesVente, loadFacturesTransport, deleteFacture } = useFactures()
const isLoading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()
const router = useRouter()
const facturesVente = ref<FactureVente[]>([])
const facturesTransport = ref<FactureTransport[]>([])
const totalFacturesVente = ref(0)
const totalFacturesTransport = ref(0)
const currentPageVente = ref(1)
const currentPageTransport = ref(1)
const itemsPerPage = ref(10)
const filtersVente = ref<FactureVenteFilters>({})
const filtersTransport = ref<FactureTransportFilters>({})

const appSettings = ref<AppSettings>({
  enableVente: true,
  enableTransport: true
})

const loadData = async () => {
  try {
    isLoading.value = true
    if (appSettings.value.enableVente) {
      const { factures: loadedFacturesVente, total: totalVente } = await loadFacturesVente(
        currentPageVente.value, 
        itemsPerPage.value,
        filtersVente.value
      )
      facturesVente.value = loadedFacturesVente
      totalFacturesVente.value = totalVente
    }
    if (appSettings.value.enableTransport) {
      const { factures: loadedFacturesTransport, total: totalTransport } = await loadFacturesTransport(
        currentPageTransport.value, 
        itemsPerPage.value,
        filtersTransport.value
      )
      facturesTransport.value = loadedFacturesTransport
      totalFacturesTransport.value = totalTransport
    }
  } catch (e) {
    error.value = 'Erreur lors du chargement des données'
    console.error('Erreur lors du chargement:', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    // Charger les paramètres de l'application
    const appStore = await Store.load('app-settings.json')
    const savedAppSettings = await appStore.get('settings') as AppSettings | null
    if (savedAppSettings) {
      appSettings.value = savedAppSettings
    }
    // Charger les factures
    await loadData()
  } catch (e) {
    error.value = 'Erreur lors du chargement des données'
    console.error('Erreur lors du chargement:', e)
  }
})

const showFacture = (facture: Facture) => {
  router.push(`/facture/${facture.id}`)
}

const handleDeleteFacture = async (facture: Facture) => {
  try {
    await deleteFacture(facture.id)
    await loadData()
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

const handlePageChangeVente = async (page: number) => {
  currentPageVente.value = page
  await loadData()
}

const handlePageChangeTransport = async (page: number) => {
  currentPageTransport.value = page
  await loadData()
}

const handleFilterChangeVente = (filters: FactureVenteFilters) => {
  filtersVente.value = filters
  currentPageVente.value = 1
  loadData()
}

const handleFilterChangeTransport = (filters: FactureTransportFilters) => {
  filtersTransport.value = filters
  currentPageTransport.value = 1
  loadData()
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
      <StatsCard />

      <UCard v-if="appSettings.enableVente">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Factures de vente</h2>
          </div>
        </template>

        <VentesTable
          :factures="facturesVente"
          :is-loading="isLoading"
          :total="totalFacturesVente"
          :items-per-page="itemsPerPage"
          @show="showFacture"
          @delete="handleDeleteFacture"
          @page-change="handlePageChangeVente"
          @filter-change="handleFilterChangeVente"
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
          :total="totalFacturesTransport"
          :items-per-page="itemsPerPage"
          @show="showFacture"
          @delete="handleDeleteFacture"
          @page-change="handlePageChangeTransport"
          @filter-change="handleFilterChangeTransport"
        />
      </UCard>

      <div v-if="!appSettings.enableVente && !appSettings.enableTransport" class="text-center py-8">
        <p class="text-gray-500">Aucune fonctionnalité n'est activée. Veuillez activer au moins une fonctionnalité dans les paramètres.</p>
      </div>
    </div>
  </div>
</template> 