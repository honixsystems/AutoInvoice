<template>
	<div class="min-h-screen min-w-screen">
		<!-- <TitleBar /> -->
		<AppCommandPalette />
		<UContainer class="flex-grow pt-10">
			<slot />
		</UContainer>
		<AppFooter />
	</div>
</template>

<script setup>
import AppFooter from '~/components/AppFooter.vue'
import TitleBar from '~/components/TitleBar.vue'

const router = useRouter()

defineShortcuts({
  'Escape': () => {
    router.back()
  }
})
</script>
