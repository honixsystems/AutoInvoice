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

const downloading = ref(false)

const handleUpdate = () => {
  downloading.value = true
  emit('update')
}

const closeModal = () => {
  emit('update:show', false)
}

const progressPercentage = computed(() => {
  if (props.totalSize === 0) return 0
  return (props.progress / props.totalSize) * 100
})
</script>

<template>
  <UModal :open="show" @update:open="closeModal">
    <template #content>
      <div class="space-y-4 p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Mise à jour disponible</h3>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            @click="closeModal"
          />
        </div>

        <p>
          Une nouvelle version ({{ update?.version }}) est disponible depuis le {{ update?.date }}.
        </p>

        <div v-if="update?.body" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 class="font-medium mb-2">Notes de version :</h4>
          <p class="whitespace-pre-line">{{ update.body }}</p>
        </div>

        <div v-if="downloading" class="space-y-2">
          <UProgress :value="progressPercentage" />
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Téléchargement en cours... {{ Math.round(progressPercentage) }}%
          </p>
        </div>

        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            @click="closeModal"
            :disabled="downloading"
          >
            Plus tard
          </UButton>
          <UButton
            color="primary"
            @click="handleUpdate"
            :loading="downloading"
            :disabled="downloading"
          >
            Mettre à jour
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template> 