<script setup lang="ts">
import { useHead } from '#imports'
import { check } from '@tauri-apps/plugin-updater'

interface UpdateResult {
	version: string
	date: string
	body: string
	downloadAndInstall: (callback?: (progress: { event: 'Started' | 'Progress' | 'Finished', data?: { contentLength?: number, chunkLength?: number } }) => void) => Promise<void>
}

useHead({
	title: 'AutoInvoice',
})

const colorMode = useColorMode()
colorMode.value = 'light'

const showUpdateModal = ref(false)
const updateInfo = ref<UpdateResult | null>(null)

onMounted(async () => {
	try {
		const update = await check()
		if (update) {
			updateInfo.value = {
				version: update.version || 'N/A',
				date: update.date || 'N/A',
				body: update.body || '',
				downloadAndInstall: update.downloadAndInstall
			}
			showUpdateModal.value = true
		}
	} catch (error) {
		console.error('Error checking for updates:', error)
	}
})
</script>

<template>
	<Html class="overflow-x-hidden">
		<Body class="font-sans antialiased">
			<UApp>
				<NuxtLayout>
					<NuxtPage />
				</NuxtLayout>
			</UApp>
			<UpdateModal
				v-model:show="showUpdateModal"
				:update="updateInfo"
			/>
		</Body>
	</Html>
</template>
