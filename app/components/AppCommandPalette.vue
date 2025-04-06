<script setup lang="ts">
const open = ref(false)

defineShortcuts({
  'meta_k': () => {
    open.value = !open.value
  }
})

const factures = useFactures()

const loadedFactures = await factures.loadFactures(1, 10)

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
  items: loadedFactures.map(facture => ({
    icon: facture.type === 'vente' ? 'i-lucide-credit-card' : 'i-lucide-truck',
    label: facture.type === 'vente' ? `${facture.vehicle_brand} ${facture.vehicle_model}` : `${facture.departure_location} - ${facture.arrival_location}`,
    suffix: `${facture.client?.name} (${formatDate(facture.date_modification)})`,
    to: `/${facture.type === 'vente' ? 'vente' : 'transport'}/${facture.id}`
  }))
}])

const handleSelect = (value: string) => {
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
