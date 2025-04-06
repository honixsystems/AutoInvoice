<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { Client } from '~/composables/useClients'
import type { TableColumn } from '#ui/types'

const UButton = resolveComponent('UButton')
const UModal = resolveComponent('UModal')
const UInput = resolveComponent('UInput')

const props = defineProps<{
  clients: Client[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', client: Client): void
  (e: 'delete', client: Client): void
}>()

const showDeleteModal = ref(false)
const clientToDelete = ref<Client | null>(null)
const searchQuery = ref('')

const filteredClients = computed(() => {
  if (!searchQuery.value) return props.clients

  const query = searchQuery.value.toLowerCase()
  return props.clients.filter(client => 
    client.name.toLowerCase().includes(query) ||
    (client.email && client.email.toLowerCase().includes(query)) ||
    (client.phone && client.phone.toLowerCase().includes(query)) ||
    (client.vat && client.vat.toLowerCase().includes(query))
  )
})

const handleDeleteClick = (client: Client) => {
  clientToDelete.value = client
  showDeleteModal.value = true
}

const handleDeleteConfirm = () => {
  if (clientToDelete.value) {
    emit('delete', clientToDelete.value)
    showDeleteModal.value = false
    clientToDelete.value = null
  }
}

const columns: TableColumn<Client>[] = [
  {
    accessorKey: 'name',
    header: 'Nom'
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'phone',
    header: 'Téléphone'
  },
  {
    accessorKey: 'vat',
    header: 'Numéro de TVA',
    cell: ({ row }) => row.getValue('vat') || '-'
  },
  {
    accessorKey: 'date_creation',
    header: 'Date de création',
    cell: ({ row }) => formatDate(row.getValue('date_creation'))
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const client = row.original
      return h('div', { class: 'flex gap-2' }, [
        h(UButton, {
          color: 'primary',
          variant: 'ghost',
          icon: 'i-heroicons-eye',
          to: `/clients/${client.id}`,
        }, () => 'Voir'),
        h(UButton, {
          color: 'neutral',
          variant: 'ghost',
          icon: 'i-heroicons-pencil-square',
          onClick: () => emit('edit', client)
        }, () => 'Éditer'),
        h(UButton, {
          color: 'error',
          variant: 'ghost',
          icon: 'i-heroicons-trash',
          onClick: () => handleDeleteClick(client)
        }, () => 'Supprimer')
      ])
    }
  }
]
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-start">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Rechercher un client..."
        class="w-64"
      />
    </div>

    <div class="overflow-x-auto">
      <UTable
        :loading="isLoading"
        :columns="columns"
        :data="filteredClients"
      >
        <template #empty>
          <div class="flex flex-col gap-1 items-center justify-center h-full">
            <UIcon name="i-heroicons-user-group" class="text-gray-500 text-2xl" />
            <p class="text-gray-500">Aucun client disponible</p>
          </div>
        </template>
      </UTable>

      <UModal v-model:open="showDeleteModal">
        <template #content>
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Confirmer la suppression</h3>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-x-mark"
                  @click="showDeleteModal = false"
                />
              </div>
            </template>

            <p class="text-gray-500">
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action supprimera également toutes les factures et données associées à ce client. Cette action est irréversible.
            </p>

            <template #footer>
              <div class="flex justify-end gap-3">
                <UButton
                  color="neutral"
                  variant="ghost"
                  @click="showDeleteModal = false"
                >
                  Annuler
                </UButton>
                <UButton
                  color="error"
                  variant="solid"
                  @click="handleDeleteConfirm"
                >
                  Supprimer
                </UButton>
              </div>
            </template>
          </UCard>
        </template>
      </UModal>
    </div>
  </div>
</template> 