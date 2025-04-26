<script setup lang="ts">
import type { CommandPaletteItem } from '#ui/types'
import type { FactureVente } from '~/types/facture/vente'
import type { FactureTransport } from '~/types/facture/transport'

const open = ref(false)

defineShortcuts({
  'meta_k': () => {
    open.value = !open.value
  }
})

const factures = useFactures()

const loadedFacturesVente = await factures.loadFacturesVente(1, 5)
const loadedFacturesTransport = await factures.loadFacturesTransport(1, 5)

const groups = computed(() => [{
  id: 'menus',
  items: [
    {
      label: 'Accueil',
      icon: 'i-lucide-home',
      kbds: ['meta', 'h'],
      to: '/'
    },
    {
      label: 'Mes clients',
      icon: 'i-lucide-user',
      kbds: ['meta', 'c'],
      to: '/clients'
    },
    {
      label: 'Mes factures',
      icon: 'i-lucide-credit-card',
      kbds: ['meta', 'f'],
      to: '/historique'
    },
    {
      label: 'Mes paramètres',
      icon: 'i-lucide-settings',
      kbds: ['meta', 's'],
      to: '/settings'
    }
  ]
}, {
  id: 'recent-invoices',
  label: 'Factures récentes',
  slot: 'factures' as const,
  items: [
    ...loadedFacturesVente.factures.map((facture: FactureVente) => ({
      icon: 'i-lucide-credit-card',
      label: `${facture.vehicle_brand} ${facture.vehicle_model}`,
      suffix: `${facture.client?.name} (${formatDate(facture.date_modification)})`,
      to: `/vente/${facture.id}`
    })),
    ...loadedFacturesTransport.factures.map((facture: FactureTransport) => ({
      icon: 'i-lucide-truck',
      label: `${facture.departure_location} - ${facture.arrival_location}`,
      suffix: `${facture.client?.name} (${formatDate(facture.date_modification)})`,
      to: `/transport/${facture.id}`
    }))
  ]
}])

const handleSelect = (value: CommandPaletteItem) => {
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCommandPalette placeholder="Rechercher une facture" :groups="groups" class="flex-1 h-80" @update:model-value="handleSelect">
        <template #users-leading="{ item }">
          <UAvatar :src="`https://github.com/${item.suffix}.png`" size="2xs" />
        </template>

        <template #billing-label="{ item }">
          {{ item.label }}

          <UBadge variant="subtle" size="sm">
            50% off
          </UBadge>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>
