<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useFactures, type Facture } from '~/composables/useFactures'

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UModal = resolveComponent('UModal')

const props = withDefaults(defineProps<{
  factures: Facture[]
  isLoading?: boolean
}>(), {
  isLoading: false
})

const emit = defineEmits<{
  (e: 'edit', facture: Facture): void
  (e: 'delete', facture: Facture): void
}>()

const showDeleteModal = ref(false)
const factureToDelete = ref<Facture | null>(null)

const getFactureTypeLabel = (type: 'vente' | 'transport') => {
  return type === 'vente' ? 'Vente' : 'Transport'
}

const getFactureTypeColor = (type: 'vente' | 'transport') => {
  return type === 'vente' ? 'green' : 'blue'
}

const handleDeleteClick = (facture: Facture) => {
  factureToDelete.value = facture
  showDeleteModal.value = true
}

const handleDeleteConfirm = () => {
  if (factureToDelete.value) {
    emit('delete', factureToDelete.value)
    showDeleteModal.value = false
    factureToDelete.value = null
  }
}

const columns: TableColumn<Facture>[] = [
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as 'vente' | 'transport'
      return h(UBadge, {
        color: getFactureTypeColor(type),
        variant: 'subtle'
      }, () => getFactureTypeLabel(type))
    }
  },
  {
    accessorKey: 'clientName',
    header: 'Client'
  },
  {
    accessorKey: 'dateCreation',
    header: 'Date de création',
    cell: ({ row }) => formatDate(row.getValue('dateCreation'))
  },
  {
    accessorKey: 'dateModification',
    header: 'Dernière modification',
    cell: ({ row }) => formatDate(row.getValue('dateModification'))
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const facture = row.original
      return h('div', { class: 'flex gap-2' }, [
        h(UButton, {
          color: 'neutral',
          variant: 'ghost',
          icon: 'i-heroicons-pencil-square',
          onClick: () => emit('edit', facture)
        }, () => 'Éditer'),
        h(UButton, {
          color: 'error',
          variant: 'ghost',
          icon: 'i-heroicons-trash',
          onClick: () => handleDeleteClick(facture)
        }, () => 'Supprimer')
      ])
    }
  }
]

const table = useTemplateRef('table')
</script>

<template>
  <div class="flex flex-col flex-1 w-full">
    <UTable
      ref="table"
      :data="factures"
      :columns="columns"
      :loading="isLoading"
    >
    <template #empty>
      <div class="flex flex-col gap-1 items-center justify-center h-full">
        <UIcon name="i-heroicons-document-text" class="text-gray-500 text-2xl" />
        <p class="text-gray-500">Aucune facture disponible</p>
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
            Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.
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
</template> 