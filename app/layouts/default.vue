<template>
	<div class="bg-gray-50 min-h-screen min-w-screen">
		<AppCommandPalette />
		<UContainer class="flex-grow">
			<slot />
		</UContainer>
		<AppFooter />
	</div>
</template>

<script setup>
import AppFooter from '~/components/AppFooter.vue'

const router = useRouter()

defineShortcuts({
  'Escape': () => {
    router.back()
  }
})
</script>
