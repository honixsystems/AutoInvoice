<script setup lang="ts">
import { useHead } from '#imports'

useHead({
	title: 'Olivautos',
})

const colorMode = useColorMode()

colorMode.value = 'light'
</script>

<template>
	<Html class="overflow-x-hidden">
		<Body class="font-sans antialiased">
			<UApp>
				<NuxtLayout>
					<NuxtPage />
				</NuxtLayout>
			</UApp>
		</Body>
	</Html>
</template>
