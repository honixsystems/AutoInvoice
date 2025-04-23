import type { TemplateBiller, TemplateRecipient, TemplateConfig } from "./common";

export interface TemplateVehicle {
    brandModel: string;
    vin: string;
    mileage: number;
    color: string;
    type: string;
    firstRegistration: string;
    deliveredWith: string[];
}

export interface TemplateVente {
    config: TemplateConfig;
    biller: TemplateBiller;
    recipient: TemplateRecipient;
    vehicle: TemplateVehicle;
    total: number;
    deposit: number;
    notes: string;
}