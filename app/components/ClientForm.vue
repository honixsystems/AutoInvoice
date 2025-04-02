<script lang="ts" setup>
import * as z from 'zod'
import type { Client } from '~/composables/useClients'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = withDefaults(defineProps<{
  modelValue?: string
  submitButton?: boolean
}>(), {
  submitButton: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const clients = useClients()
const toast = useToast()

const clientSchema: z.ZodType<Partial<Client>> = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  vat: z.string().optional()
})

const isLoading = ref(false)
const clientFormRef = ref()

defineExpose({
  submitForm,
  validate
})

let state = reactive<Omit<Client, 'id' | 'dateCreation' | 'dateModification'>>({
  name: '',
  phone: '',
  email: '',
  address: '',
  vat: ''
})

type Schema = z.output<typeof clientSchema>

function submitForm() {
  return clientFormRef.value?.submit()
}

function validate() {
  return clientFormRef.value?.validate()
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (props.modelValue) {
    await updateClient()
  } else {
    await addClient()
  }
}

const addClient = async () => {
  try {
    isLoading.value = true

    const clientId = await clients.addClient(state)
    emit('update:modelValue', clientId)
    toast.add({
      title: 'Client ajouté avec succès',
      description: 'Le client a été ajouté avec succès',
      color: 'success'
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Erreur lors de l\'ajout du client',
      description: 'Une erreur est survenue lors de l\'ajout du client',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const updateClient = async () => {
  try {
    isLoading.value = true

    if (!props.modelValue) {
      throw new Error('Le client n\'a pas été trouvé')
    }

    await clients.updateClient(props.modelValue, state)
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Erreur lors de la modification du client',
      description: 'Une erreur est survenue lors de la modification du client',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const getClient = async (id: string) => {
  try {
    isLoading.value = true
    const selectedClient = await clients.getClient(id)
    if (selectedClient) {
      Object.assign(state, selectedClient)
    }
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Erreur lors de la récupération du client',
      description: 'Une erreur est survenue lors de la récupération du client',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (props.modelValue) {
    await getClient(props.modelValue)
  }
})

watch(() => props.modelValue, async (newVal) => {
  if (newVal) {
    await getClient(newVal)
  } else {
    Object.assign(state, {
      name: '',
      phone: '',
      email: '',
      address: '',
      vat: ''
    })
  }
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <UCard class="mb-4">
      <template #header>
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          {{ modelValue ? 'Modifier le client' : 'Nouveau client' }}
        </h3>
      </template>
      <UForm ref="clientFormRef" :schema="clientSchema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
        <UFormField label="Nom du client" name="name">
          <UInput v-model="state.name" placeholder="Nom complet" class="w-full" />
        </UFormField>
        <UFormField label="Téléphone" name="phone">
          <UInput v-model="state.phone" placeholder="Numéro de téléphone" class="w-full" />
        </UFormField>
        <UFormField label="Email" name="email">
          <UInput v-model="state.email" type="email" placeholder="Adresse email" class="w-full" />
        </UFormField>
        <UFormField label="Adresse" name="address">
          <UTextarea v-model="state.address" placeholder="Adresse complète" class="w-full" />
        </UFormField>
        <UFormField label="Numéro de TVA" name="vat">
          <UInput v-model="state.vat" placeholder="Numéro de TVA" class="w-full" />
        </UFormField>
        <div class="flex justify-end" v-if="submitButton">
          <UButton :disabled="isLoading" type="submit">
            {{ modelValue ? 'Modifier' : 'Ajouter' }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>