import { ref } from 'vue'
import Database from '@tauri-apps/plugin-sql'
import { Service } from '~/types/service'
import type { ServiceDB } from '~/types/service'

export function useServices() {
  const db = ref<Database | null>(null)

  const initDatabase = async () => {
    try {
      db.value = await Database.load('sqlite:autoinvoice.db')
    } catch (e) {
      console.error('Erreur lors de l\'initialisation de la base de données:', e)
      throw e
    }
  }

  const loadServices = async (): Promise<Service[]> => {
    try {
      if (!db.value) {
        await initDatabase()
      }

      const result = await db.value!.select<ServiceDB[]>(
        "SELECT * FROM garage_services WHERE date_deletion IS NULL ORDER BY name ASC"
      )

      return result.map(service => new Service(service))
    } catch (e) {
      console.error('Erreur lors du chargement des services:', e)
      return []
    }
  }

  const loadDeletedServices = async (): Promise<Service[]> => {
    try {
      if (!db.value) {
        await initDatabase()
      } 

      const result = await db.value!.select<ServiceDB[]>(
        "SELECT * FROM garage_services WHERE date_deletion IS NOT NULL ORDER BY name ASC"
      )

      return result.map(service => new Service(service))
    } catch (e) {
      console.error('Erreur lors du chargement des services supprimés:', e)
      return []
    }
  }
  

  const addService = async (service: Omit<Service, 'id' | 'date_creation' | 'date_modification'>): Promise<string> => {
    try {
      if (!db.value) {
        await initDatabase()
      }

      const id = crypto.randomUUID()
      const now = new Date().toISOString()

      await db.value!.execute(
        `INSERT INTO garage_services (
          id, name, description, price, pricing_type, date_creation, date_modification
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?
        )`,
        [
          id,
          service.name,
          service.description,
          service.price,
          service.pricing_type,
          now,
          now
        ]
      )

      return id
    } catch (e) {
      console.error('Erreur lors de l\'ajout du service:', e)
      throw e
    }
  }

  const updateService = async (id: string, service: Omit<Service, 'id' | 'date_creation' | 'date_modification'>) => {
    try {
      if (!db.value) {
        await initDatabase()
      }

      const now = new Date().toISOString()

      await db.value!.execute(
        `UPDATE garage_services SET
          name = ?,
          description = ?,
          price = ?,
          pricing_type = ?,
          date_modification = ?
        WHERE id = ?`,
        [
          service.name,
          service.description,
          service.price,
          service.pricing_type,
          now,
          id
        ]
      )
    } catch (e) {
      console.error('Erreur lors de la mise à jour du service:', e)
      throw e
    }
  }

  const deleteService = async (id: string) => {
    try {
      if (!db.value) {
        await initDatabase()
      }

      await db.value!.execute(
        `UPDATE garage_services SET date_deletion = ? WHERE id = ?`,
        [new Date().toISOString(), id]
      )
      await loadServices()
    } catch (e) {
      console.error('Erreur lors de la suppression du service:', e)
      throw e
    }
  }

  const restoreService = async (id: string) => {
    try {
      if (!db.value) {
        await initDatabase()
      }

      await db.value!.execute(
        `UPDATE garage_services SET date_deletion = NULL WHERE id = ?`,
        [id]
      )
    } catch (e) {
      console.error('Erreur lors de la restauration du service:', e)
      throw e
    }
  }
  const getService = async (id: string): Promise<Service | undefined> => {
    try {
      if (!db.value) {
        await initDatabase()
      }

      const result = await db.value!.select<ServiceDB[]>(
        `SELECT * FROM garage_services WHERE id = ? AND date_deletion IS NULL`,
        [id]
      )

      if (result.length === 0 || !result[0]) return undefined

      return new Service(result[0])
    } catch (e) {
      console.error('Erreur lors de la récupération du service:', e)
      throw e
    }
  }

  return {
    loadServices,
    loadDeletedServices,
    addService,
    updateService,
    deleteService,
    getService,
    restoreService
  }
}