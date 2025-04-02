use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "
                -- Table pour les factures de base (commune aux ventes et transports)
                CREATE TABLE IF NOT EXISTS factures (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL CHECK (type IN ('vente', 'transport')),
                    client_name TEXT NOT NULL,
                    client_phone TEXT,
                    client_email TEXT,
                    client_address TEXT,
                    client_vat TEXT,
                    date_creation TEXT NOT NULL,
                    date_modification TEXT NOT NULL,
                    additional_notes TEXT
                );

                -- Table pour les factures de vente
                CREATE TABLE IF NOT EXISTS factures_vente (
                    facture_id TEXT PRIMARY KEY,
                    vehicle_brand TEXT NOT NULL,
                    vehicle_model TEXT NOT NULL,
                    vehicle_chassis TEXT NOT NULL,
                    vehicle_mileage INTEGER NOT NULL,
                    vehicle_color TEXT,
                    vehicle_type TEXT NOT NULL,
                    vehicle_first_registration TEXT,
                    vehicle_price REAL NOT NULL,
                    deposit REAL,
                    FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE
                );

                -- Table pour les factures de transport
                CREATE TABLE IF NOT EXISTS factures_transport (
                    facture_id TEXT PRIMARY KEY,
                    transport_date TEXT NOT NULL,
                    departure_location TEXT NOT NULL,
                    arrival_location TEXT NOT NULL,
                    distance REAL NOT NULL,
                    price_per_km REAL NOT NULL,
                    pickup_price REAL NOT NULL,
                    FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE
                );
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_indexes",
            sql: "
                -- Index pour améliorer les performances des recherches
                CREATE INDEX IF NOT EXISTS idx_factures_type ON factures(type);
                CREATE INDEX IF NOT EXISTS idx_factures_client_name ON factures(client_name);
                CREATE INDEX IF NOT EXISTS idx_factures_date_creation ON factures(date_creation);
                CREATE INDEX IF NOT EXISTS idx_factures_vente_vehicle_brand ON factures_vente(vehicle_brand);
                CREATE INDEX IF NOT EXISTS idx_factures_vente_vehicle_model ON factures_vente(vehicle_model);
                CREATE INDEX IF NOT EXISTS idx_factures_transport_date ON factures_transport(transport_date);
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_clients_table",
            sql: "
                -- Table pour les clients
                CREATE TABLE IF NOT EXISTS clients (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    phone TEXT,
                    email TEXT,
                    address TEXT,
                    vat TEXT,
                    date_creation TEXT NOT NULL,
                    date_modification TEXT NOT NULL
                );

                -- Ajout de la colonne client_id dans la table factures
                ALTER TABLE factures ADD COLUMN client_id TEXT REFERENCES clients(id);

                -- Index pour la recherche de clients
                CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
            ",
            kind: MigrationKind::Up,
        }
    ]
}
