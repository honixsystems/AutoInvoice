export interface TemplateConfig {
    language: string;
    currency: string;
    primaryColor: string;
    date: string;
    invoiceId: string;
    displayVat: boolean;
    vatRate: number;
    cancellation: boolean;
    footerText: string;
    cgv: string;
}

export interface TemplateBiller {
    logo: Uint8Array;
    name: string;
    vat: string;
    bic: string;
    iban: string;
    address: string;
    phone: string;
}

export interface TemplateRecipient {
    name: string;
    phone: string;
    email: string;
    address: string;
    vat: string;
}

