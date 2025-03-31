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
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const downloading = ref(false)
const progress = ref(0)

const handleUpdate = async () => {
  if (!props.update) return
  
  downloading.value = true
  let downloaded = 0
  let contentLength = 0

  try {
    await props.update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          contentLength = event.data?.contentLength || 0
          console.log(`started downloading ${event.data?.contentLength} bytes`)
          break
        case 'Progress':
          downloaded += event.data?.chunkLength || 0
          progress.value = (downloaded / contentLength) * 100
          console.log(`downloaded ${downloaded} from ${contentLength}`)
          break
        case 'Finished':
          console.log('download finished')
          break
      }
    })

    console.log('update installed')
    await relaunch()
  } catch (error) {
    console.error('Error during update:', error)
  }
}

const closeModal = () => {
  emit('update:show', false)
}
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
          <UProgress :value="progress" />
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Téléchargement en cours... {{ Math.round(progress) }}%
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