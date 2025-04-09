<template>
  <div class="mt-4 pt-4 border-t border-gray-100 min-h-12">
    <p class="text-xs text-neutral-500 text-left" v-html="formattedFooter"></p>
    <div class="flex justify-between items-end">
      <p class="text-xs text-neutral-500/50">Page {{ current }} / {{ total }}</p>
      <DataMatrix :value="factureId" class="w-24 h-24" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  current: number
  total: number
  factureId: string
}>()

const { settings } = useSettings()

const formattedFooter = computed(() => {
  return settings.value?.footerNote?.replace(/\n/g, '<br>') || ''
})
</script>
