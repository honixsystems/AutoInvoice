<script setup lang="ts">
import { useClients } from '~/composables/useClients'
import type { Client } from '~/composables/useClients'

const props = defineProps<{
  clientId: string
}>()

const { getClient } = useClients()
const client = ref<Client | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    isLoading.value = true
    const clientData = await getClient(props.clientId)
    if (clientData) {
      client.value = clientData
    } else {
      error.value = 'Client non trouvé'
    }
  } catch (e) {
    console.error('Erreur lors du chargement du client:', e)
    error.value = 'Une erreur est survenue lors du chargement du client'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <UCard class="p-0">
    <div v-if="isLoading" class="flex justify-center py-4">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
    </div>
    <div v-else-if="error" class="text-red-500 text-sm">
      {{ error }}
    </div>
    <div v-else-if="client" class="flex items-center gap-4">
      <div class="flex-shrink-0">
        <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <span class="text-primary-600 text-lg font-semibold">
            {{ client.name.charAt(0) }}
          </span>
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-medium text-gray-900 truncate">
          {{ client.name }}
        </h3>
        <p v-if="client.email" class="text-sm text-gray-500 truncate">{{ client.email }}</p>
        <p v-if="client.phone" class="text-xs text-gray-400 truncate">
          {{ client.phone }}
        </p>
      </div>
      <div class="flex-shrink-0">
        <UButton color="primary" variant="ghost" icon="i-heroicons-arrow-top-right-on-square" @click="navigateTo(`/clients/${client.id}`)" />
      </div>
    </div>
  </UCard>
</template> 