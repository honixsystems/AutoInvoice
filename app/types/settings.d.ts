export interface CompanySettings {
    companyName: string
    accountNumber: string
    phoneNumber: string
    address: string
    footerNote?: string
    primaryColor: string
    vatRate: number
    vatNumber: string
    displayVAT: boolean
}

export interface AppSettings {
    autoUpdate: boolean
    enableVente: boolean
    enableTransport: boolean
}