<script setup lang="ts">
import type { Facture } from '~/types/facture/common'
import { h, resolveComponent, ref, computed } from 'vue'
import type { TableColumn } from '#ui/types'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { templateRef } from '@vueuse/core'
import type { PaginationState } from '@tanstack/vue-table'

const UButton = resolveComponent('UButton')
const UModal = resolveComponent('UModal')

const props = defineProps<{
  factures: Facture[]
  isLoading: boolean
  total: number
  itemsPerPage: number
}>()

const emit = defineEmits<{
  (e: 'show', facture: Facture): void
  (e: 'delete', facture: Facture): void
  (e: 'page-change', page: number): void
}>()

const showDeleteModal = ref(false)
const factureToDelete = ref<Facture | null>(null)
const sorting = ref([{ id: 'date_creation', desc: true }])
const tableRef = templateRef<HTMLTableElement>('table')
const pagination = ref<PaginationState>({
  pageIndex: 0,
  pageSize: props.itemsPerPage
})

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
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

const handlePageChange = (page: number) => {
  emit('page-change', page)
}

const columns: TableColumn<Facture>[] = [
  {
    accessorKey: 'type',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Type',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return type === 'vente' ? 'Vente' : 'Transport'
    }
  },
  {
    accessorKey: 'date_creation',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Date',
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
    accessorKey: 'vehicle_brand',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Véhicule',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      const facture = row.original
      if (facture.type === 'vente') {
        return `${facture.vehicle_brand || ''} ${facture.vehicle_model || ''}`
      } else {
        return '-'
      }
    }
  },
  {
    accessorKey: 'trajet',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Trajet',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      const facture = row.original
      if (facture.type === 'transport') {
        return `${facture.departure_location || ''} → ${facture.arrival_location || ''}`
      } else {
        return '-'
      }
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
          label: 'Montant',
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
      const facture = row.original
      if (facture.type === 'vente') {
        return h('div', { class: 'text-right font-medium' }, formatPrice(facture.vehicle_price))
      } else {
        const total = (facture.distance * facture.price_per_km) + facture.pickup_price
        return h('div', { class: 'text-right font-medium' }, formatPrice(total))
      }
    }
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
          onClick: () => emit("show", facture)
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
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Factures</h2>
      </div>
    </template>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:sort="sorting"
      :loading="isLoading"
      :columns="columns"
      :data="factures"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel()
      }"
      class="flex-1"
    >
      <template #empty>
        <div class="flex flex-col gap-1 items-center justify-center h-full">
          <UIcon name="i-heroicons-document-text" class="text-gray-500 text-2xl" />
          <p class="text-gray-500">Aucune facture disponible</p>
        </div>
      </template>
    </UTable>

    <div class="flex justify-end pt-4">
      <UPagination
        :default-page="1"
        :items-per-page="itemsPerPage"
        :total="total"
        @update:page="handlePageChange"
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
  </UCard>
</template> 