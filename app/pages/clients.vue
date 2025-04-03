<script setup lang="ts">
import { useClients } from '~/composables/useClients'
import type { Client } from '~/composables/useClients'
import ClientsTable from '~/components/ClientsTable.vue'
import ClientForm from '~/components/ClientForm.vue'

const { loadClients, deleteClient } = useClients()
const isLoading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()

const clients = ref<Client[]>([])
const showModal = ref(false)
const selectedClientId = ref<string | undefined>()

// Charger les clients au montage
onMounted(async () => {
  try {
    isLoading.value = true
    clients.value = await loadClients()
  } catch (e) {
    error.value = 'Erreur lors du chargement des clients'
    console.error('Erreur lors du chargement des clients:', e)
  } finally {
    isLoading.value = false
  }
})

const handleDeleteClient = async (client: Client) => {
  try {
    await deleteClient(client.id)
    clients.value = await loadClients()
    
    toast.add({
      title: 'Succès',
      description: 'Le client a été supprimé avec succès.',
      color: 'success'
    })
  } catch (e) {
    console.error('Erreur lors de la suppression du client:', e)
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la suppression du client.',
      color: 'error'
    })
  }
}

const openAddModal = () => {
  selectedClientId.value = undefined
  showModal.value = true
}

const openEditModal = (client: Client) => {
  selectedClientId.value = client.id
  showModal.value = true
}

const handleClientUpdated = async () => {
  clients.value = await loadClients()
  showModal.value = false
  selectedClientId.value = undefined
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gestion des Clients</h1>
        <div class="space-x-4 flex items-center">
          <UButton
            color="primary"
            to="/"
            icon="i-heroicons-arrow-left"
          >
            Retour
          </UButton>
          <UButton
            color="primary"
            variant="solid"
            @click="openAddModal"
          >
            <UIcon name="i-heroicons-plus" class="mr-2" />
            Nouveau Client
          </UButton>
        </div>
      </div>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Liste des clients</h2>
          </div>
        </template>

        <ClientsTable
          :clients="clients"
          :is-loading="isLoading"
          @edit="openEditModal"
          @delete="handleDeleteClient"
        />
      </UCard>
    </div>

    <UModal v-model:open="showModal">
      <template #content>
        <ClientForm
          v-model="selectedClientId"
          :submit-button="true"
          @update:model-value="handleClientUpdated"
          @success="handleClientUpdated"
        />
      </template>
    </UModal>
  </div>
</template> 