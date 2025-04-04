<template>
	<div class="bg-gray-50 min-h-screen min-w-screen">
		<UContainer class="flex-grow">
			<slot />
		</UContainer>
		<AppFooter />
	</div>
</template>

<script setup>
import AppFooter from '~/components/AppFooter.vue'
</script>
