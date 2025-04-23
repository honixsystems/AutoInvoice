<script setup lang="ts">
import { useFactures } from '~/composables/useFactures'

const { getMonthlyStats } = useFactures()
const stats = ref<{
  currentMonth: {
    ventes: number;
    transport: number;
  };
  previousMonth: {
    ventes: number;
    transport: number;
  };
}>({
  currentMonth: { ventes: 0, transport: 0 },
  previousMonth: { ventes: 0, transport: 0 }
})

const isLoading = ref(true)

const getDifference = (current: number, previous: number) => {
  if (previous === 0) return current
  return current - previous
}

const getTrendIcon = (difference: number) => {
  if (difference > 0) return 'i-heroicons-arrow-trending-up'
  if (difference < 0) return 'i-heroicons-arrow-trending-down'
  return 'i-heroicons-minus'
}

const getTrendColor = (difference: number) => {
  if (difference > 0) return 'text-green-500'
  if (difference < 0) return 'text-red-500'
  return 'text-gray-500'
}

onMounted(async () => {
  try {
    stats.value = await getMonthlyStats()
  } catch (e) {
    console.error('Erreur lors du chargement des statistiques:', e)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Statistiques du mois</h2>
      </div>
    </template>

    <div v-if="isLoading" class="flex justify-center py-4">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
    </div>

    <div v-else class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <h3 class="text-lg font-medium">Ventes</h3>
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold">{{ stats.currentMonth.ventes }}</span>
          <div class="flex items-center gap-1">
            <UIcon
              :name="getTrendIcon(getDifference(stats.currentMonth.ventes, stats.previousMonth.ventes))"
              :class="getTrendColor(getDifference(stats.currentMonth.ventes, stats.previousMonth.ventes))"
            />
            <span :class="getTrendColor(getDifference(stats.currentMonth.ventes, stats.previousMonth.ventes))">
              {{ Math.abs(getDifference(stats.currentMonth.ventes, stats.previousMonth.ventes)) }}
            </span>
          </div>
        </div>
        <p class="text-sm text-gray-500">vs mois précédent</p>
      </div>

      <div class="space-y-2">
        <h3 class="text-lg font-medium">Transports</h3>
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold">{{ stats.currentMonth.transport }}</span>
          <div class="flex items-center gap-1">
            <UIcon
              :name="getTrendIcon(getDifference(stats.currentMonth.transport, stats.previousMonth.transport))"
              :class="getTrendColor(getDifference(stats.currentMonth.transport, stats.previousMonth.transport))"
            />
            <span :class="getTrendColor(getDifference(stats.currentMonth.transport, stats.previousMonth.transport))">
              {{ Math.abs(getDifference(stats.currentMonth.transport, stats.previousMonth.transport)) }}
            </span>
          </div>
        </div>
        <p class="text-sm text-gray-500">vs mois précédent</p>
      </div>
    </div>
  </UCard>
</template> 