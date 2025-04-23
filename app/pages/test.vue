<template>
  <div>
    <button @click="testFunc">Test</button>
    <pre>{{ res }}</pre>
  </div>
</template>

<script lang="ts" setup>
import { useTypst } from '~/composables/useTypst'
definePageMeta({
  layout: false,
})

const res = ref<string>('')

const { test } = useTypst()

const testFunc = async () => {
  res.value = await test()
}
</script>