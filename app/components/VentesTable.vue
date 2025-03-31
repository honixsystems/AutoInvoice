<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useFactures, type FactureVente } from '~/composables/useFactures'

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UModal = resolveComponent('UModal')

const props = withDefaults(defineProps<{
  factures: FactureVente[]
  isLoading?: boolean
}>(), {
  isLoading: false
})

const emit = defineEmits<{
  (e: 'edit', facture: FactureVente): void
  (e: 'delete', facture: FactureVente): void
}>()

const showDeleteModal = ref(false)
const factureToDelete = ref<FactureVente | null>(null)

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

const handleDeleteClick = (facture: FactureVente) => {
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

const columns: TableColumn<FactureVente>[] = [
  {
    accessorKey: 'clientName',
    header: 'Client'
  },
  {
    accessorKey: 'vehicleBrand',
    header: 'Marque'
  },
  {
    accessorKey: 'vehicleModel',
    header: 'Modèle'
  },
  {
    accessorKey: 'vehiclePrice',
    header: () => h('div', { class: 'text-right' }, 'Prix'),
    cell: ({ row }) => {
      const price = row.getValue('vehiclePrice') as number
      return h('div', { class: 'text-right font-medium' }, formatPrice(price))
    }
  },
  {
    accessorKey: 'dateCreation',
    header: 'Date de création',
    cell: ({ row }) => formatDate(row.getValue('dateCreation'))
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
const columnFilters = ref([
  {
    id: 'clientName',
    value: ''
  },
  {
    id: 'vehicleBrand',
    value: ''
  },
  {
    id: 'vehicleModel',
    value: ''
  }
])
</script>

<template>
  <div class="flex flex-col flex-1 w-full">
    <div class="flex px-4 py-3.5 border-b border-(--ui-border-accented) gap-4">
      <UInput
        :model-value="table?.tableApi?.getColumn('clientName')?.getFilterValue() as string"
        class="max-w-sm"
        placeholder="Rechercher par client..."
        @update:model-value="table?.tableApi?.getColumn('clientName')?.setFilterValue($event)"
      />
      <UInput
        :model-value="table?.tableApi?.getColumn('vehicleBrand')?.getFilterValue() as string"
        class="max-w-sm"
        placeholder="Rechercher par marque..."
        @update:model-value="table?.tableApi?.getColumn('vehicleBrand')?.setFilterValue($event)"
      />
      <UInput
        :model-value="table?.tableApi?.getColumn('vehicleModel')?.getFilterValue() as string"
        class="max-w-sm"
        placeholder="Rechercher par modèle..."
        @update:model-value="table?.tableApi?.getColumn('vehicleModel')?.setFilterValue($event)"
      />
    </div>

    <UTable
      ref="table"
      v-model:column-filters="columnFilters"
      :data="factures"
      :columns="columns"
      :loading="isLoading"
    >
      <template #empty>
        <div class="flex flex-col gap-1 items-center justify-center h-full">
          <UIcon name="i-heroicons-document-text" class="text-gray-500 text-2xl" />
          <p class="text-gray-500">Aucune facture de vente disponible</p>
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
                color="gray"
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