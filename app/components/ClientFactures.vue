<script setup lang="ts">
import type { Facture } from '~/composables/useFactures'
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '#ui/types'
import FacturePreviewModal from './FacturePreviewModal.vue'

const UButton = resolveComponent('UButton')
const UModal = resolveComponent('UModal')

const props = defineProps<{
  factures: Facture[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'show', facture: Facture): void
  (e: 'delete', facture: Facture): void
}>()

const showDeleteModal = ref(false)
const factureToDelete = ref<Facture | null>(null)
const showPreviewModal = ref(false)
const selectedFactureId = ref<string>()

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

const handlePreview = (facture: Facture) => {
  selectedFactureId.value = facture.id
  showPreviewModal.value = true
}

const columns: TableColumn<Facture>[] = [
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => row.getValue('type') === 'vente' ? 'Vente' : 'Transport'
  },
  {
    accessorKey: 'date_creation',
    header: 'Date',
    cell: ({ row }) => formatDate(row.getValue('date_creation'))
  },
  {
    accessorKey: 'vehicle_brand',
    header: 'Véhicule',
    cell: ({ row }) => {
      const facture = row.original
      if (facture.type === 'vente') {
        return `${facture.vehicle_brand} ${facture.vehicle_model}`
      }
      return '-'
    }
  },
  {
    accessorKey: 'vehicle_price',
    header: 'Montant',
    cell: ({ row }) => {
      const facture = row.original
      if (facture.type === 'vente') {
        return formatPrice(facture.vehicle_price)
      } else {
        const total = (facture.distance * facture.price_per_km) + facture.pickup_price
        return formatPrice(total)
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
          color: 'neutral',
          variant: 'ghost',
          icon: 'i-heroicons-printer',
          onClick: () => handlePreview(facture)
        }, () => 'Imprimer'),
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
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Factures</h2>
      </div>
    </template>

    <UTable
      :loading="isLoading"
      :columns="columns"
      :data="factures"
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

    <FacturePreviewModal
      v-if="selectedFactureId"
      :facture-id="selectedFactureId"
      v-model="showPreviewModal"
    />
  </UCard>
</template> 