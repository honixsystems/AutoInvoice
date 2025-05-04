export class Service {
  id: string
  name: string
  description?: string
  price: number
  pricing_type: 'fixed' | 'hourly'
  date_creation?: string
  date_modification?: string

  constructor(data: Partial<Service>) {
    this.id = data.id || ''
    this.name = data.name || ''
    this.description = data.description
    this.price = data.price || 0
    this.pricing_type = data.pricing_type || 'fixed'
    this.date_creation = data.date_creation || new Date().toISOString()
    this.date_modification = data.date_modification || new Date().toISOString()
  }

  toDb(): ServiceDB {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      pricing_type: this.pricing_type,
      date_creation: this.date_creation,
      date_modification: this.date_modification
    }
  }
}

export interface ServiceDB {
  id: string
  name: string
  description?: string
  price: number
  pricing_type: 'fixed' | 'hourly'
  date_creation?: string
  date_modification?: string
}