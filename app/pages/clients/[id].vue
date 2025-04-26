<script setup lang="ts">
import { useClients } from '~/composables/useClients'
import { useFactures } from '~/composables/useFactures'
import type { Client } from '~/types/client'
import type { Facture } from '~/types/facture/common'
import ClientDisplay from '~/components/ClientDisplay.vue'
import ClientFactures from '~/components/ClientFactures.vue'

const route = useRoute()
const router = useRouter()
const { getClient } = useClients()
const { loadFactures, deleteFacture } = useFactures()

const client = ref<Client | null>(null)
const facturesRef = ref<Facture[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const toast = useToast()
const showEditModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalFactures = ref(0)

// Charger les données du client
const loadClientData = async () => {
  try {
    const clientId = (route.params as { id: string }).id
    const clientData = await getClient(clientId)
    
    if (!clientData) {
      error.value = 'Client non trouvé'
      return
    }

    client.value = clientData
  } catch (e) {
    console.error('Erreur lors du chargement du client:', e)
    error.value = 'Une erreur est survenue lors du chargement du client'
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors du chargement du client',
      color: 'error'
    })
  }
}

// Charger les factures du client
const loadFacturesData = async (page: number = 1) => {
  try {
    isLoading.value = true
    const clientId = (route.params as { id: string }).id
    const { factures: factures, total: total } = await loadFactures(page, itemsPerPage.value, { client_id: clientId })
    facturesRef.value = [...factures]
    totalFactures.value = total
  } catch (e) {
    console.error('Erreur lors du chargement des factures:', e)
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors du chargement des factures',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Charger les données initiales
onMounted(async () => {
  await loadClientData()
  await loadFacturesData(1)
})

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadFacturesData(page)
}

const handleShowFacture = (facture: Facture) => {
  navigateTo(`/facture/${facture.id}`)
}

const handleDeleteFacture = async (facture: Facture) => {
  try {
    await deleteFacture(facture.id)
    facturesRef.value = facturesRef.value.filter(f => f.id !== facture.id)
    toast.add({
      title: 'Succès',
      description: 'La facture a été supprimée avec succès',
      color: 'success'
    })
  } catch (e) {
    console.error('Erreur lors de la suppression de la facture:', e)
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la suppression de la facture',
      color: 'error'
    })
  }
}

const handleEditClient = () => {
  showEditModal.value = true
}

const handleClientUpdated = async () => {
  if (client.value) {
    const updatedClient = await getClient(client.value.id)
    if (updatedClient) {
      client.value = updatedClient
    }
  }
  showEditModal.value = false
  toast.add({
    title: 'Succès',
    description: 'Le client a été mis à jour avec succès',
    color: 'success'
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Détails du client</h1>
        <div class="space-x-4 flex items-center">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-pencil-square"
            @click="handleEditClient"
          >
            Modifier le client
          </UButton>
          <UButton
            color="primary"
            @click="router.back()"
            icon="i-heroicons-arrow-left"
          >
            Retour
          </UButton>
        </div>
      </div>

      <div v-if="error" class="mb-8">
        <UAlert
          color="error"
          :title="error"
        />
      </div>

      <div v-else-if="isLoading && !client" class="flex justify-center items-center h-64">
        <UIcon name="i-heroicons-arrow-path" class="text-4xl animate-spin" />
      </div>

      <div v-else-if="client" class="space-y-8">
        <ClientDisplay :client="client" />
        <ClientFactures
          :factures="facturesRef"
          :is-loading="isLoading"
          :total="totalFactures"
          :items-per-page="itemsPerPage"
          @show="handleShowFacture"
          @delete="handleDeleteFacture"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <UModal v-model:open="showEditModal">
      <template #content>
        <ClientForm
          v-if="client"
          v-model="client.id"
          :client="client"
          @success="handleClientUpdated"
          @update:model-value="handleClientUpdated"
          submit-button
        />
      </template>
    </UModal>
  </div>
</template> 