import { initDatabase } from '~/composables/useDatabase'

export default defineNuxtPlugin(async () => {
  try {
    await initDatabase()
    console.log('Base de données initialisée avec succès')
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error)
  }
}) 