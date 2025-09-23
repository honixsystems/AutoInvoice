export interface CompanySettings {
    companyName: string
    phoneNumber: string
    address: string
    footerNote?: string
    primaryColor: string
    vatNumber: string
    logoUrl?: string
    logoData?: Uint8Array
    iban: string
    bic: string
    cgv?: string
}

export interface AppSettings {
    enableVente: boolean
    enableTransport: boolean
    enableGarage: boolean
    transportSettings?: TransportSettings
    venteSettings?: VenteSettings
    garageSettings?: GarageSettings
}

// Type pour les fonctionnalités disponibles
export interface Feature {
    name: 'enableVente' | 'enableTransport' | 'enableGarage'
    label: string
    description: string
    icon: string
    color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

export interface VATSettings {
    vatRate: number
    displayVAT: boolean
}

export interface TransportSettings {
    pricePerKm: number
    defaultMention: string
    vat: VATSettings
}

export interface VenteSettings {
    defaultMention: string
    vat: VATSettings
}

export interface GarageSettings {
    defaultMention: string
    vat: VATSettings
}