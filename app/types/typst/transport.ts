import type { TemplateBiller, TemplateConfig, TemplateRecipient } from "./common";

export interface TemplateTransportDetails {
    from: string;
    to: string;
    distance: number;
}

export interface TemplateTransport {
    config: TemplateConfig;
    biller: TemplateBiller;
    recipient: TemplateRecipient;
    transport: TemplateTransportDetails;
    pricePerKm: number;
    pickupPrice: number;
    notes: string;
}
