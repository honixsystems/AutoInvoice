export class Client {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    vat?: string;
    date_creation: string;
    date_modification: string;

    constructor(data: Partial<Client>) {
        this.id = data.id || '';
        this.name = data.name || '';
        this.phone = data.phone;
        this.email = data.email;
        this.address = data.address;
        this.vat = data.vat;
        this.date_creation = data.date_creation || new Date().toISOString();
        this.date_modification = data.date_modification || new Date().toISOString();
    }

    toDb(): ClientDB {
        return {
            id: this.id,
            name: this.name,
            phone: this.phone,
            email: this.email,
            address: this.address,
            vat: this.vat,
            date_creation: this.date_creation,
            date_modification: this.date_modification
        };
    }
}

export interface ClientDB {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    vat?: string;
    date_creation: string;
    date_modification: string;
} 