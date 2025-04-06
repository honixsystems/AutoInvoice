<script setup lang="ts">
import type { Client } from '~/composables/useClients'

defineProps<{
  client: Client
}>()
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Informations du client</h2>
      </div>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <div>
          <h3 class="text-sm font-medium text-gray-500">Nom</h3>
          <p class="mt-1 text-lg">{{ client.name }}</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500">Email</h3>
          <p class="mt-1 text-lg">{{ client.email || 'Non renseigné' }}</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500">Téléphone</h3>
          <p class="mt-1 text-lg">{{ client.phone || 'Non renseigné' }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <h3 class="text-sm font-medium text-gray-500">Numéro de TVA</h3>
          <p class="mt-1 text-lg">{{ client.vat || 'Non renseigné' }}</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500">Adresse</h3>
          <p class="mt-1 text-lg">{{ client.address || 'Non renseignée' }}</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500">Date de création</h3>
          <p class="mt-1 text-lg">{{ formatDate(client.date_creation) }}</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500">Dernière modification</h3>
          <p class="mt-1 text-lg">{{ formatDate(client.date_modification) }}</p>
        </div>
      </div>
    </div>
  </UCard>
</template> 