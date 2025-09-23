import { FactureBase, type FactureBaseDB } from "~/types/facture/common";
import type { TemplateConfig, TemplateBiller, TemplateRecipient } from "~/types/typst/common";
import type { TemplateVehicle, TemplateVente } from "~/types/typst/vente";
import type { CompanySettings } from "~/types/settings";

export class FactureVente extends FactureBase {
    override type: 'vente';
    vehicle_brand: string;
    vehicle_model: string;
    vehicle_chassis: string;
    vehicle_mileage: number;
    vehicle_color?: string;
    vehicle_type: string;
    vehicle_first_registration?: string;
    vehicle_price: number;
    deposit?: number;
    delivered_with: string[];

    constructor(data: Partial<FactureVente>) {
        super(data);
        this.type = 'vente';
        this.vehicle_brand = data.vehicle_brand || '';
        this.vehicle_model = data.vehicle_model || '';
        this.vehicle_chassis = data.vehicle_chassis || '';
        this.vehicle_mileage = data.vehicle_mileage || 0;
        this.vehicle_color = data.vehicle_color;
        this.vehicle_type = data.vehicle_type || '';
        this.vehicle_first_registration = data.vehicle_first_registration;
        this.vehicle_price = data.vehicle_price || 0;
        this.deposit = data.deposit;
        this.delivered_with = data.delivered_with || [];
    }

    override toDb(): FactureBaseDB & FactureVenteDB {
        return {
            ...super.toDb(),
            facture_id: this.id_comptable,
            vehicle_brand: this.vehicle_brand,
            vehicle_model: this.vehicle_model,
            vehicle_chassis: this.vehicle_chassis,
            vehicle_mileage: this.vehicle_mileage,
            vehicle_color: this.vehicle_color,
            vehicle_type: this.vehicle_type,
            vehicle_first_registration: this.vehicle_first_registration,
            vehicle_price: this.vehicle_price,
            deposit: this.deposit,
            delivered_with: JSON.stringify(this.delivered_with)
        };
    }

    override toTypst(companySettings: CompanySettings, vatSettings?: { displayVAT: boolean; vatRate: number }): TemplateVente {
        const base = super.toTypst(companySettings, vatSettings);
        return {
            ...base,
            vehicle: {
                brandModel: `${this.vehicle_brand} ${this.vehicle_model}`,
                vin: this.vehicle_chassis,
                mileage: this.vehicle_mileage,
                color: this.vehicle_color || '',
                type: this.vehicle_type,
                firstRegistration: this.vehicle_first_registration || '',
                deliveredWith: this.delivered_with
            },
            total: this.vehicle_price,
            deposit: this.deposit || 0,
            notes: this.additional_notes || ''
        };
    }
}

export interface FactureVenteDB {
    facture_id: string;
    vehicle_brand: string;
    vehicle_model: string;
    vehicle_chassis: string;
    vehicle_mileage: number;
    vehicle_color?: string;
    vehicle_type: string;
    vehicle_first_registration?: string;
    vehicle_price: number;
    deposit?: number;
    delivered_with: string;
} 