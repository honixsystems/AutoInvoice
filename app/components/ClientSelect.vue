<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Client } from '~/composables/useClients'
import { useClients } from '~/composables/useClients'
import { useToast } from '#imports'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void
  (e: 'select-client', client: Client | undefined): void
  (e: 'edit-client'): void
}>()

const clients = ref<Client[]>([])
const isLoading = ref(false)

const { loadClients } = useClients()
const toast = useToast()

onMounted(async () => {
  isLoading.value = true
  try {
    clients.value = await loadClients()
    if (props.modelValue) {
      const client = clients.value.find(c => c.id === props.modelValue)
      if (client) {
        selectedClient.value = { label: client.name, value: client.id }
      }
    }
  } catch (error) {
    toast.add({
      title: 'Erreur lors du chargement des clients',
      description: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
})

const selectedClient = ref<{ label: string; value: string } | undefined>(
  props.modelValue ? { label: '', value: props.modelValue } : undefined
)

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const client = clients.value.find(c => c.id === newValue)
    if (client) {
      selectedClient.value = {
        label: client.name,
        value: client.id
      }
    }
  } else {
    selectedClient.value = undefined
  }
})

watch(selectedClient, (newValue) => {
  emit('update:modelValue', newValue?.value)
  const selectedClientData = clients.value.find(c => c.id === newValue?.value)
  emit('select-client', selectedClientData)
})

const clientItems = computed(() => {
  return clients.value.map(client => ({
    label: client.name,
    value: client.id
  }))
})
</script>

<template>
  <UCard class="flex flex-col gap-2">
    <template #header>
      <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
        Client existant
      </h3>
    </template>
    <div class="flex gap-2">
      <USelectMenu v-model="selectedClient" :items="clientItems" :loading="isLoading"
        placeholder="Sélectionner un client existant" value-attribute="value" option-attribute="label"
        icon="i-lucide-user" searchable class="w-full" clearable>
        <template #empty>
          <span>Aucun client trouvé</span>
        </template>
      </USelectMenu>
      <UButton
        v-if="selectedClient"
        color="primary"
        variant="soft"
        icon="i-lucide-pencil"
        @click="emit('edit-client')"
        class="rounded-md"
      />
      <UButton
        v-if="selectedClient"
        color="error"
        variant="soft"
        icon="i-lucide-x"
        @click="selectedClient = undefined"
        class="rounded-md"
      />
    </div>
  </UCard>
</template>