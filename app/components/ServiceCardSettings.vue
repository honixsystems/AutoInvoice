<script setup lang="ts">
import type { Service } from '~/types/service'

const props = defineProps<{
  service: Service
  isDeleted?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
  (e: 'restore', id: string): void
}>()
</script>

<template>
  <UCard :class="{ 'bg-gray-50 mx-4 mb-1': isDeleted }">
    <div class="flex items-start justify-between">
      <div class="space-y-1">
        <h4 class="font-semibold text-gray-900">{{ service.name }}</h4>
        <p class="text-sm text-gray-500">{{ service.description }}</p>
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <span>{{ service.price }}{{ service.pricing_type === 'hourly' ? '€/h' : '€' }}</span>
          <span class="px-2 py-1 text-xs rounded-full" :class="{
            'bg-green-100 text-green-800': service.pricing_type === 'fixed',
            'bg-blue-100 text-blue-800': service.pricing_type === 'hourly'
          }">
            {{ service.pricing_type === 'fixed' ? 'Prix fixe' : 'Taux horaire' }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <template v-if="!isDeleted">
          <UButton
            color="primary"
            variant="ghost"
            icon="i-heroicons-pencil"
            size="sm"
            @click="emit('edit', service.id)"
          />
          <UButton
            color="error"
            variant="ghost"
            icon="i-heroicons-trash"
            size="sm"
            @click="emit('delete', service.id)"
          />
        </template>
        <template v-else>
          <UButton
            color="primary"
            variant="ghost"
            icon="i-heroicons-arrow-path"
            size="sm"
            @click="emit('restore', service.id)"
          >
            Restaurer
          </UButton>
        </template>
      </div>
    </div>
  </UCard>
</template> 