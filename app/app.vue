<script setup lang="ts">
import { useHead } from '#imports'
import { check, Update } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { Store } from '@tauri-apps/plugin-store'
import type { AppSettings, CompanySettings } from '~/types/settings'
import { useRouter } from 'vue-router'

interface UpdateResult {
	version: string
	date: string
	body: string
	downloadAndInstall: () => Promise<void>
}

useHead({
	title: 'AutoInvoice',
})

const colorMode = useColorMode()
colorMode.value = 'light'
colorMode.preference = 'light'
colorMode.forced = true

const showUpdateModal = ref(false)
const updateInfo = ref<UpdateResult | null>(null)
const downloadProgress = ref(0)
const totalSize = ref(0)
const router = useRouter()

onMounted(async () => {
	try {
		// Vérifier si l'application est configurée
		const companyStore = await Store.load('company-settings.json')
		const companySettings = await companyStore.get('settings') as CompanySettings | null
		const appStore = await Store.load('app-settings.json')
		const appSettings = await appStore.get('settings') as AppSettings | null

		// Si aucune configuration n'est détectée, rediriger vers la page de setup
		if (!companySettings || !appSettings) {
			router.push('/setup')
			return
		}

		// Vérifier les paramètres d'auto-update
		const autoUpdate = appSettings.autoUpdate ?? true // Par défaut true si non défini

		if (autoUpdate) {
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
		}
	} catch (error) {
		console.error('Error checking for updates:', error)
		// En cas d'erreur, rediriger vers la page de setup
		router.push('/setup')
	}
})

const handleUpdate = async () => {
	if (!updateInfo.value) return
	const update = await check()
	if (!update) return

	try {
		await update.downloadAndInstall((event) => {
			console.log(event)
			switch (event.event) {
				case 'Started':
					totalSize.value = event.data?.contentLength || 0
					console.log(`Démarrage du téléchargement de ${totalSize.value} bytes`)
					break
				case 'Progress':
					downloadProgress.value += event.data?.chunkLength || 0
					console.log(`Téléchargé ${downloadProgress.value} sur ${totalSize.value}`)
					break
				case 'Finished':
					console.log('Téléchargement terminé')
					break
			}
		})

		console.log('Mise à jour installée')
		await relaunch()
	} catch (error) {
		console.log(error)
		console.error('Erreur pendant la mise à jour:', error)
	}
}
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
				:progress="downloadProgress"
				:total-size="totalSize"
				@update="handleUpdate"
			/>
		</Body>
	</Html>
</template>
