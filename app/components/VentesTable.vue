<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { type FactureVente } from '~/types/facture/vente'
import { type FactureVenteFilters } from '~/types/facture/filters'
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { openPath } from '@tauri-apps/plugin-opener';
import { exportToExcel } from '~/utils/xlsx';
import { getPaginationRowModel } from '@tanstack/vue-table'

const UButton = resolveComponent('UButton')
const UModal = resolveComponent('UModal')

const props = defineProps<{
  factures: FactureVente[]
  isLoading?: boolean
  total: number
  itemsPerPage?: number
}>()

const pagination = ref({
  pageIndex: 0,
  pageSize: props.itemsPerPage || 10
})

const emit = defineEmits<{
  (e: 'show', facture: FactureVente): void
  (e: 'delete', facture: FactureVente): void
  (e: 'page-change', page: number): void
  (e: 'filter-change', filters: FactureVenteFilters): void
}>()

const showDeleteModal = ref(false)
const factureToDelete = ref<FactureVente | null>(null)
const filters = ref<FactureVenteFilters>({})
const filterTimeout = ref<number | null>(null)

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const exportToCSV = async () => {
  try {
    const arr = await exportToExcel(
      props.factures.map(facture => ({
        client: facture.client?.name ?? 'N/A',
        marque: facture.vehicle_brand,
        modele: facture.vehicle_model,
        prix: formatPrice(facture.vehicle_price),
        date: formatDate(facture.date_creation)
      })),
      ['Client', 'Marque', 'Modèle', 'Prix', 'Date de création']
    )
    const selected = await save({
      title: 'Export des ventes',
      defaultPath: `export_ventes_${new Date().toISOString().split('T')[0]}.xlsx`,
      filters: [{ name: 'Excel', extensions: ['xlsx'] }]
    })

    if (selected) {
      await writeFile(selected, arr)
      await openPath(selected)
    }
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error)
  }
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

const handleFilterChange = (key: keyof FactureVenteFilters, value: string | number) => {
  filters.value[key] = value.toString()
  
  // Annuler le timeout précédent s'il existe
  if (filterTimeout.value !== null) {
    clearTimeout(filterTimeout.value)
  }
  
  // Créer un nouveau timeout pour éviter trop d'appels
  filterTimeout.value = window.setTimeout(() => {
    emit('filter-change', filters.value)
  }, 300)
}

const columns: TableColumn<FactureVente>[] = [
  {
    accessorKey: 'client',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Client',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => row.original.client?.name ?? 'N/A',
    sortingFn: (rowA, rowB) => {
      const nameA = rowA.original.client?.name ?? ''
      const nameB = rowB.original.client?.name ?? ''
      return nameA.localeCompare(nameB)
    },
    filterFn: (row, columnId, filterValue) => {
      const clientName = row.original.client?.name ?? ''
      return clientName.toLowerCase().includes(filterValue.toLowerCase())
    }
  },
  {
    accessorKey: 'vehicle_brand',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Marque',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'vehicle_model',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Modèle',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'vehicle_price',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h('div', { class: 'flex justify-end' }, [
        h(UButton, {
          color: 'neutral',
          variant: 'ghost',
          label: 'Prix',
          icon: isSorted
            ? isSorted === 'asc'
              ? 'i-lucide-arrow-up-narrow-wide'
              : 'i-lucide-arrow-down-wide-narrow'
            : 'i-lucide-arrow-up-down',
          class: '-mx-2.5',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        })
      ])
    },
    cell: ({ row }) => {
      const price = row.getValue('vehicle_price') as number
      return h('div', { class: 'text-right font-medium' }, formatPrice(price))
    }
  },
  {
    accessorKey: 'date_creation',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Date de création',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => formatDate(row.getValue('date_creation'))
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const facture = row.original
      return h('div', { class: 'flex gap-2' }, [
        h(UButton, {
          color: 'primary',
          variant: 'ghost',
          icon: 'i-heroicons-eye',
          onClick: () => emit('show', facture)
        }, () => 'Voir'),
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
    id: 'client',
    value: ''
  },
  {
    id: 'vehicle_brand',
    value: ''
  },
  {
    id: 'vehicle_model',
    value: ''
  }
])

const sorting = ref([{ id: 'date_creation', desc: true }])
</script>

<template>
  <div class="flex flex-col flex-1 w-full">
    <div class="flex px-4 py-3.5 border-b border-(--ui-border-accented) gap-4">
      <UInput
        :model-value="filters.client"
        class="max-w-sm"
        placeholder="Rechercher par client..."
        @update:model-value="(value) => handleFilterChange('client', value)"
      />
      <UInput
        :model-value="filters.vehicle_brand"
        class="max-w-sm"
        placeholder="Rechercher par marque..."
        @update:model-value="(value) => handleFilterChange('vehicle_brand', value)"
      />
      <UInput
        :model-value="filters.vehicle_model"
        class="max-w-sm"
        placeholder="Rechercher par modèle..."
        @update:model-value="(value) => handleFilterChange('vehicle_model', value)"
      />
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-heroicons-arrow-down-tray"
        class="ml-auto"
        @click="exportToCSV"
      >
        Exporter en Excel
      </UButton>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:column-filters="columnFilters"
      v-model:sort="sorting"
      :data="factures"
      :columns="columns"
      :loading="isLoading"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel()
      }"
      class="flex-1"
    >
      <template #empty>
        <div class="flex flex-col gap-1 items-center justify-center h-full">
          <UIcon name="i-heroicons-document-text" class="text-gray-500 text-2xl" />
          <p class="text-gray-500">Aucune facture de vente disponible</p>
        </div>
      </template>
    </UTable>

    <div class="flex justify-end pt-4">
      <UPagination
        :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="total"
        @update:page="(p) => emit('page-change', p)"
      />
    </div>

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