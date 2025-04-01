<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { Store } from '@tauri-apps/plugin-store'

const schema = z.object({
  autoUpdate: z.boolean()
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  autoUpdate: true
})

const toast = useToast()

onMounted(async () => {
  try {
    const store = await Store.load('app-settings.json')
    const savedSettings = await store.get('settings')
    if (savedSettings) {
      Object.assign(state, savedSettings)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error)
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const store = await Store.load('app-settings.json')
    await store.set('settings', event.data)
    await store.save()

    toast.add({
      title: 'Succès',
      description: 'Les paramètres de l\'application ont été enregistrés.',
      color: 'success'
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la sauvegarde.',
      color: 'error'
    })
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <div class="grid grid-cols-1 gap-6">
      <UFormField label="Mises à jour automatiques" name="autoUpdate">
        <USwitch v-model="state.autoUpdate" />
      </UFormField>
    </div>

    <div class="mt-6">
      <UButton type="submit" color="primary" block>
        Enregistrer les modifications
      </UButton>
    </div>
  </UForm>
</template>
