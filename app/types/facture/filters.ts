
export interface FactureFilters {
  client_id?: string;
}

export interface FactureVenteFilters {
  client_id?: string;
  client?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
}

export interface FactureTransportFilters {
  client_id?: string;
  client?: string;
  departure_location?: string;
  arrival_location?: string;
} 