import { FactureBase, type FactureBaseDB } from "~/types/facture/common";

export class FactureTransport extends FactureBase {
    override type: 'transport';
    transport_date: string;
    departure_location: string;
    arrival_location: string;
    distance: number;
    price_per_km: number;
    pickup_price: number;

    constructor(data: Partial<FactureTransport>) {
        super(data);
        this.type = 'transport';
        this.transport_date = data.transport_date || new Date().toISOString();
        this.departure_location = data.departure_location || '';
        this.arrival_location = data.arrival_location || '';
        this.distance = data.distance || 0;
        this.price_per_km = data.price_per_km || 0;
        this.pickup_price = data.pickup_price || 0;
    }

    override toDb(): FactureBaseDB & FactureTransportDB {
        return {
            ...super.toDb(),
            facture_id: this.id,
            transport_date: this.transport_date,
            departure_location: this.departure_location,
            arrival_location: this.arrival_location,
            distance: this.distance,
            price_per_km: this.price_per_km,
            pickup_price: this.pickup_price
        };
    }
}

export interface FactureTransportDB {
    facture_id: string;
    transport_date: string;
    departure_location: string;
    arrival_location: string;
    distance: number;
    price_per_km: number;
    pickup_price: number;
} 