import type { Client } from "~/types/client";
import type { FactureVente } from "./vente";
import type { FactureTransport } from "./transport";
import type { TemplateConfig, TemplateBiller, TemplateRecipient } from "~/types/typst/common";
import type { CompanySettings } from "~/types/settings";
import { formatDateForTypst } from "~/utils/date";
export class FactureBase {
    id: string;
    type: 'vente' | 'transport';
    client?: Client;
    client_id?: string;
    date_creation: string;
    date_modification: string;
    additional_notes?: string;
    id_comptable: string;
    cancelled: number;

    constructor(data: Partial<FactureBase>) {
        this.id = data.id || '';
        this.type = data.type || 'vente';
        this.client = data.client;
        this.client_id = data.client_id;
        this.date_creation = data.date_creation || new Date().toISOString();
        this.date_modification = data.date_modification || new Date().toISOString();
        this.additional_notes = data.additional_notes;
        this.id_comptable = data.id_comptable || '';
        this.cancelled = data.cancelled || 0;
    }

    toDb(): FactureBaseDB {
        return {
            id: this.id,
            type: this.type,
            client_id: this.client_id,
            date_creation: this.date_creation,
            date_modification: this.date_modification,
            additional_notes: this.additional_notes,
            id_comptable: this.id_comptable,
            cancelled: this.cancelled
        };
    }

    toTypst(companySettings: CompanySettings, vatSettings?: { displayVAT: boolean; vatRate: number }): { config: TemplateConfig; biller: TemplateBiller; recipient: TemplateRecipient } {
        // Utiliser les paramètres TVA spécifiques si fournis, sinon utiliser des valeurs par défaut
        const displayVat = vatSettings?.displayVAT ?? true
        const vatRate = vatSettings?.vatRate ?? 20
        
        return {
            config: {
                language: 'fr',
                currency: '€',
                primaryColor: companySettings.primaryColor,
                date: formatDateForTypst(new Date(this.date_creation)),
                invoiceId: this.id_comptable,
                displayVat,
                vatRate,
                cancellation: this.cancelled === 1,
                footerText: companySettings.footerNote || '',
                cgv: companySettings.cgv || ''
            },
            biller: {
                logo: companySettings.logoData || new Uint8Array(),
                name: companySettings.companyName,
                vat: companySettings.vatNumber,
                bic: companySettings.bic,
                iban: companySettings.iban,
                address: companySettings.address,
                phone: companySettings.phoneNumber
            },
            recipient: {
                name: this.client?.name || '',
                phone: this.client?.phone || '',
                email: this.client?.email || '',
                address: this.client?.address || '',
                vat: this.client?.vat || ''
            }
        };
    }
}

export interface FactureBaseDB {
    id: string;
    type: 'vente' | 'transport';
    client_id?: string;
    date_creation: string;
    date_modification: string;
    additional_notes?: string;
    id_comptable: string;
    cancelled: number;
}

export type Facture = FactureVente | FactureTransport; 