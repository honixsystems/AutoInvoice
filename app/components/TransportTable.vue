<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { type FactureTransport } from '~/types/facture/transport'
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { openPath } from '@tauri-apps/plugin-opener';

const UButton = resolveComponent('UButton')
const UModal = resolveComponent('UModal')
const UInput = resolveComponent('UInput')

const props = defineProps<{
  factures: FactureTransport[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'show', facture: FactureTransport): void
  (e: 'delete', facture: FactureTransport): void
}>()

const showDeleteModal = ref(false)
const factureToDelete = ref<FactureTransport | null>(null)

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const exportToCSV = async () => {
  try {
    const arr = await exportToCsv(
      props.factures.map(facture => ({
        client: facture.client?.name ?? 'N/A',
        date: formatDate(facture.transport_date),
        route: `${facture.departure_location} -> ${facture.arrival_location}`,
        distance: facture.distance,
        pickup_price: formatPrice(facture.pickup_price),
        price_per_km: formatPrice(facture.price_per_km),
        total: formatPrice(facture.pickup_price + (facture.distance * facture.price_per_km))
      })),
      ['Client', 'Date de transport', 'Trajet', 'Distance (km)', 'Prix de prise en charge', 'Prix par km', 'Total'])
    const selected = await save({
      title: 'Export des transports',
      defaultPath: `export_transports_${new Date().toISOString().split('T')[0]}.csv`,
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    })

    if (selected) {
      await writeFile(selected, arr)
      await openPath(selected)
    }
  } catch (error) {
    console.error('Erreur lors de l\'export CSV:', error)
  }
}

const handleDeleteClick = (facture: FactureTransport) => {
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

const columns: TableColumn<FactureTransport>[] = [
  {
    accessorKey: 'client.name',
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
    }
  },
  {
    accessorKey: 'transport_date',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Date de transport',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => formatDate(row.getValue('transport_date'))
  },
  {
    accessorKey: 'route',
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
      const departure = row.original.departure_location
      const arrival = row.original.arrival_location
      if (!departure || !arrival) return '-'
      return `${departure} → ${arrival}`
    }
  },
  {
    accessorKey: 'distance',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Distance (km)',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => row.original.distance || 0
  },
  {
    accessorKey: 'total',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h('div', { class: 'flex justify-end' }, [
        h(UButton, {
          color: 'neutral',
          variant: 'ghost',
          label: 'Total',
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
      const distance = Number(row.original.distance) || 0
      const pricePerKm = Number(row.original.price_per_km) || 0
      const pickupPrice = Number(row.original.pickup_price) || 0
      const total = (distance * pricePerKm) + pickupPrice
      return h('div', { class: 'text-right font-medium' }, formatPrice(total))
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
const columnFilters = ref([])

const sorting = ref([{ id: 'transport_date', desc: true }])
const page = ref(1)
const itemsPerPage = ref(10)
</script>

<template>
  <div class="flex flex-col flex-1 w-full">
    <div class="flex px-4 py-3.5 border-b border-(--ui-border-accented) gap-4">
      <UInput
        :model-value="table?.tableApi?.getColumn('client.name')?.getFilterValue() as string"
        class="max-w-sm"
        placeholder="Rechercher par client..."
        @update:model-value="table?.tableApi?.getColumn('client.name')?.setFilterValue($event)"
      />
      <UInput
        :model-value="table?.tableApi?.getColumn('route')?.getFilterValue() as string"
        class="max-w-sm"
        placeholder="Rechercher par trajet..."
        @update:model-value="table?.tableApi?.getColumn('route')?.setFilterValue($event)"
      />
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-heroicons-arrow-down-tray"
        class="ml-auto"
        @click="exportToCSV"
      >
        Exporter en CSV
      </UButton>
    </div>

    <UTable
      ref="table"
      v-model:column-filters="columnFilters"
      v-model:sort="sorting"
      v-model:page="page"
      :rows-per-page="itemsPerPage"
      :data="factures"
      :columns="columns"
      :loading="isLoading"
      class="flex-1"
    >
      <template #empty>
        <div class="flex flex-col gap-1 items-center justify-center h-full">
          <UIcon name="i-heroicons-document-text" class="text-gray-500 text-2xl" />
          <p class="text-gray-500">Aucune facture de transport disponible</p>
        </div>
      </template>
    </UTable>
    <UModal v-model:open="showDeleteModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Confirmer la suppression</h3>
              <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showDeleteModal = false" />
            </div>
          </template>

          <p class="text-gray-500">
            Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.
          </p>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton color="neutral" variant="ghost" @click="showDeleteModal = false">
                Annuler
              </UButton>
              <UButton color="error" variant="solid" @click="handleDeleteConfirm">
                Supprimer
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>