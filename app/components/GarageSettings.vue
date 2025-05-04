<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useServices } from '~/composables/useServices'
import type { Service } from '~/types/service'
import ServiceCardSettings from '~/components/ServiceCardSettings.vue'
import EmptyState from '~/components/EmptyState.vue'

const { loadServices, loadDeletedServices, addService, updateService, deleteService, restoreService } = useServices()
const services = ref<Service[]>([])
const deletedServices = ref<Service[]>([])
const isNewServiceModalOpen = ref(false)
const isDeleteConfirmModalOpen = ref(false)
const serviceToDelete = ref<string | null>(null)
const editingServiceId = ref<string | undefined>(undefined)
const toast = useToast()

onMounted(async () => {
  await loadAllServices()
})

const loadAllServices = async () => {
  services.value = await loadServices()
  deletedServices.value = await loadDeletedServices()
}

const handleServiceCreated = () => {
  isNewServiceModalOpen.value = false
  editingServiceId.value = undefined
  loadServices().then(loadedServices => {
    services.value = loadedServices
  })
}

const handleEditService = (serviceId: string) => {
  editingServiceId.value = serviceId
  isNewServiceModalOpen.value = true
}

const handleDeleteService = async (id: string) => {
  serviceToDelete.value = id
  isDeleteConfirmModalOpen.value = true
}

const confirmDeleteService = async () => {
  if (!serviceToDelete.value) return
  
  try {
    await deleteService(serviceToDelete.value)
    await loadAllServices()
    toast.add({
      title: 'Succès',
      description: 'Le service a été supprimé',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la suppression du service',
      color: 'error'
    })
  } finally {
    isDeleteConfirmModalOpen.value = false
    serviceToDelete.value = null
  }
}

const handleRestoreService = async (id: string) => {
  try {
    await restoreService(id)
    await loadAllServices()
    toast.add({
      title: 'Succès',
      description: 'Le service a été restauré',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la restauration du service',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="space-y-16">
    <div class="grid grid-cols-1 gap-12">
      <!-- Section Services -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <h3 class="text-lg font-semibold text-gray-900">Services</h3>
            <p class="text-sm text-gray-500">Gérez les services proposés par votre garage</p>
          </div>
          <UButton
            icon="i-heroicons-plus"
            @click="isNewServiceModalOpen = true"
          >
            Nouveau service
          </UButton>
        </div>

        <div class="grid gap-4">
          <EmptyState
            v-if="services.length === 0"
            icon="i-heroicons-wrench-screwdriver"
            title="Aucun service"
            description="Commencez par ajouter votre premier service pour votre garage"
          />
          <ServiceCardSettings
            v-for="service in services"
            :key="service.id"
            :service="service"
            @edit="handleEditService"
            @delete="handleDeleteService"
          />
        </div>

        <!-- Services supprimés -->
        <UCollapsible 
          class="flex flex-col gap-2"
          v-if="deletedServices.length > 0"
        >
          <UButton
            class="group"
            label="Services supprimés"
            color="neutral"
            variant="subtle"
            trailing-icon="i-heroicons-chevron-down"
            :ui="{
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
            }"
            block
          />

          <template #content>
            <div class="grid gap-4 mt-4">
              <ServiceCardSettings
                v-for="service in deletedServices"
                :key="service.id"
                :service="service"
                :is-deleted="true"
                @restore="handleRestoreService"
              />
            </div>
          </template>
        </UCollapsible>
      </div>
    </div>

    <UModal v-model:open="isNewServiceModalOpen">
      <template #content>
        <ServiceForm
          :model-value="editingServiceId"
          submit-button
          @success="handleServiceCreated"
        />
      </template>
    </UModal>

    <UModal v-model:open="isDeleteConfirmModalOpen">
      <template #content>
        <div class="p-4 space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
          <p class="text-gray-600">
            Êtes-vous sûr de vouloir supprimer ce service ? 
            Il restera disponible sur les factures existantes, mais ne pourra plus être utilisé pour les nouvelles factures.
          </p>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isDeleteConfirmModalOpen = false"
            >
              Annuler
            </UButton>
            <UButton
              color="error"
              @click="confirmDeleteService"
            >
              Supprimer
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template> 