import { ref } from 'vue'
import Database from '@tauri-apps/plugin-sql'

export interface Client {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  vat?: string
  dateCreation: string
  dateModification: string
}

interface ClientDB {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  vat?: string
  date_creation: string
  date_modification: string
}

export function useClients() {
  const db = ref<Database | null>(null)

  // Initialiser la connexion à la base de données
  const initDatabase = async () => {
    try {
      db.value = await Database.load('sqlite:autoinvoice.db')
    } catch (e) {
      console.error('Erreur lors de l\'initialisation de la base de données:', e)
      throw e
    }
  }

  // Charger les clients depuis la base de données
  const loadClients = async (): Promise<Client[]> => {
    try {

      if (!db.value) {
        await initDatabase()
      }

      const result = await db.value!.select<ClientDB[]>(
        "SELECT * FROM clients ORDER BY name ASC"
      )

      return result.map(client => ({
        ...client,
        dateCreation: client.date_creation,
        dateModification: client.date_modification
      }))
    } catch (e) {
      console.error('Erreur lors du chargement des clients:', e)
      return []
    }
  }

  // Ajouter un nouveau client
  const addClient = async (client: Omit<Client, 'id' | 'dateCreation' | 'dateModification'>): Promise<string> => {
    try {
      if (!db.value) {
        await initDatabase()
      }

      const id = crypto.randomUUID()
      const now = new Date().toISOString()

      await db.value!.execute(
        `INSERT INTO clients (
          id, name, phone, email, address, vat, date_creation, date_modification
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          client.name,
          client.phone,
          client.email,
          client.address,
          client.vat,
          now,
          now
        ]
      )

      return id
    } catch (e) {
      console.error('Erreur lors de l\'ajout du client:', e)
      throw e
    }
  }

  // Mettre à jour un client existant
  const updateClient = async (id: string, client: Omit<Client, 'id' | 'dateCreation' | 'dateModification'>) => {
    try {
      if (!db.value) {
        await initDatabase()
      }

      const now = new Date().toISOString()

      await db.value!.execute(
        `UPDATE clients SET
          name = ?, phone = ?, email = ?, address = ?, vat = ?, date_modification = ?
        WHERE id = ?`,
        [
          client.name,
          client.phone,
          client.email,
          client.address,
          client.vat,
          now,
          id
        ]
      )

    } catch (e) {
      console.error('Erreur lors de la mise à jour du client:', e)
      throw e
    }
  }

  // Supprimer un client
  const deleteClient = async (id: string) => {
    try {
      if (!db.value) {
        await initDatabase()
      }

      await db.value!.execute("DELETE FROM clients WHERE id = ?", [id])
      await loadClients()
    } catch (e) {
      console.error('Erreur lors de la suppression du client:', e)
      throw e
    }
  }

  // Récupérer un client par son ID
  const getClient = async (id: string): Promise<Client | undefined> => {
    try {
      if (!db.value) {
        await initDatabase()
      }

      const result = await db.value!.select<ClientDB[]>(
        "SELECT * FROM clients WHERE id = ?",
        [id]
      )

      if (result.length === 0) return undefined

      const client = result[0]
      return {
        ...client,
        dateCreation: client!.date_creation,
        dateModification: client!.date_modification
      }
    } catch (e) {
      console.error('Erreur lors de la récupération du client:', e)
      return undefined
    }
  }

  return {
    loadClients,
    addClient,
    updateClient,
    deleteClient,
    getClient
  }
} 