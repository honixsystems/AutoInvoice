<script setup lang="ts">
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'

interface UpdateResult {
  version: string
  date: string
  body: string
  downloadAndInstall: (callback?: (progress: { event: 'Started' | 'Progress' | 'Finished', data?: { contentLength?: number, chunkLength?: number } }) => void) => Promise<void>
}

const props = defineProps<{
  show: boolean
  update: UpdateResult | null
  progress: number
  totalSize: number
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'update'): void
}>()

// Lancer la mise à jour automatiquement quand le modal s'ouvre
watch(() => props.show, (newValue) => {
  if (newValue && props.update) {
    emit('update')
  }
})

const progressPercentage = computed(() => {
  if (props.totalSize === 0) return 0
  return (props.progress / props.totalSize) * 100
})

const formattedDate = computed(() => {
  if (!props.update?.date) return ''
  return new Date(props.update.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})
</script>

<template>
  <UModal :open="show">
    <template #content>
      <div class="space-y-4 p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Mise à jour en cours</h3>
        </div>

        <p>
          Installation de la version {{ update?.version }} disponible depuis le {{ formattedDate }}.
        </p>

        <div v-if="update?.body" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 class="font-medium mb-2">Notes de version :</h4>
          <p class="whitespace-pre-line">{{ update.body }}</p>
        </div>

        <div class="space-y-2">
          <UProgress :value="progressPercentage" />
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Téléchargement en cours... {{ Math.round(progressPercentage) }}%
          </p>
        </div>
      </div>
    </template>
  </UModal>
</template> 