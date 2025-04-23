export interface CompanySettings {
    companyName: string
    phoneNumber: string
    address: string
    footerNote?: string
    primaryColor: string
    vatRate: number
    vatNumber: string
    displayVAT: boolean
    logoUrl?: string
    logoData?: Uint8Array
    iban: string
    bic: string
}

export interface AppSettings {
    autoUpdate: boolean
    enableVente: boolean
    enableTransport: boolean
}

// Type pour les fonctionnalités disponibles
export interface Feature {
    name: keyof AppSettings
    label: string
    description: string
    icon: string
    color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
}