use mac_address::get_mac_address as get_system_mac_address;
use serde::Serialize;

#[derive(Serialize)]
pub struct MacAddressResponse {
    address: Option<String>,
    error: Option<String>,
}

#[tauri::command]
pub fn get_mac_address() -> MacAddressResponse {
    match get_system_mac_address() {
        Ok(Some(ma)) => MacAddressResponse {
            address: Some(ma.to_string()),
            error: None,
        },
        Ok(None) => MacAddressResponse {
            address: None,
            error: Some("Aucune adresse MAC trouvée".to_string()),
        },
        Err(e) => MacAddressResponse {
            address: None,
            error: Some(format!("Erreur: {}", e)),
        },
    }
}
