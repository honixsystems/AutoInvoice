<script setup lang="ts">
import { useClients } from '~/composables/useClients'
import { useFactures } from '~/composables/useFactures'
import type { Client } from '~/composables/useClients'
import type { Facture } from '~/composables/useFactures'
import ClientDisplay from '~/components/ClientDisplay.vue'
import ClientFactures from '~/components/ClientFactures.vue'

const route = useRoute()
const router = useRouter()
const { getClient } = useClients()
const { loadFactures, deleteFacture } = useFactures()

const client = ref<Client | null>(null)
const factures = ref<Facture[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const toast = useToast()
const showEditModal = ref(false)

// Charger les données du client et ses factures
onMounted(async () => {
  try {
    isLoading.value = true
    const clientId = route.params.id as string
    const clientData = await getClient(clientId)
    
    if (!clientData) {
      error.value = 'Client non trouvé'
      return
    }

    client.value = clientData
    factures.value = await loadFactures()
    factures.value = factures.value.filter(f => f.client_id === clientId)
  } catch (e) {
    console.error('Erreur lors du chargement des données:', e)
    error.value = 'Une erreur est survenue lors du chargement des données'
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors du chargement des données',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
})

const handleEditFacture = (facture: Facture) => {
  const route = facture.type === 'vente' ? '/vente/' : '/transport/'
  navigateTo(route + facture.id)
}

const handleDeleteFacture = async (facture: Facture) => {
  try {
    await deleteFacture(facture.id)
    factures.value = factures.value.filter(f => f.id !== facture.id)
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

  if (client.value) {
    const clientData = await getClient(client.value.id)
    if (clientData) {
      client.value = clientData
    }
  }
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

      <div v-else-if="isLoading" class="flex justify-center items-center h-64">
        <UIcon name="i-heroicons-arrow-path" class="text-4xl animate-spin" />
      </div>

      <div v-else-if="client" class="space-y-8">
        <ClientDisplay :client="client" />
        <ClientFactures
          :factures="factures"
          :is-loading="isLoading"
          @edit="handleEditFacture"
          @delete="handleDeleteFacture"
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