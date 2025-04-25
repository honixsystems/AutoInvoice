import { invoke } from '@tauri-apps/api/core';
import { fetch } from '@tauri-apps/plugin-http';

export interface LicenseResponse {
  valid: boolean;
  message: string;
}

export interface MacAddressResponse {
  address: string;
  error: boolean;
}

export async function activateLicense(licenseKey: string): Promise<LicenseResponse> {
  try {
    const macAddress = await invoke<MacAddressResponse>('get_mac_address');
    if (macAddress.error) {
      return {
        valid: false,
        message: "Impossible de récupérer l'adresse MAC"
      };
    }

    const response = await fetch('https://autoinvoice-license.azurewebsites.net/api/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        license_key: licenseKey,
        mac_address: macAddress.address
      })
    });

    const data = await response.json();
    console.log(data);
    return {
      valid: data.valid,
      message: data.message || 'Erreur lors de l\'activation de la licence'
    };
  } catch (error) {
    return {
      valid: false,
      message: `Erreur lors de l'activation: ${error}`
    };
  }
}

export async function validateLicense(licenseKey: string): Promise<LicenseResponse> {
  try {
    const macAddress = await invoke<MacAddressResponse>('get_mac_address');
    if (macAddress.error) {
      return {
        valid: false,
        message: "Impossible de récupérer l'adresse MAC"
      };
    }

    const response = await fetch('https://autoinvoice-license.azurewebsites.net/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        license_key: licenseKey,
        mac_address: macAddress.address
      })
    });

    const data = await response.json();
    return {
      valid: data.valid,
      message: data.message || 'Erreur lors de la validation de la licence'
    };
  } catch (error) {
    return {
      valid: false,
      message: `Erreur lors de la validation: ${error}`
    };
  }
}

export async function deactivateLicense(licenseKey: string): Promise<LicenseResponse> {
  try {
    const macAddress = await invoke<MacAddressResponse>('get_mac_address');
    if (macAddress.error) {
      return {
        valid: false,
        message: "Impossible de récupérer l'adresse MAC"
      };
    }

    const response = await fetch('https://autoinvoice-license.azurewebsites.net/api/deactivate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        license_key: licenseKey,
        mac_address: macAddress.address
      })
    });

    const data = await response.json();
    return {
      valid: data.valid,
      message: data.message || 'Erreur lors de la désactivation de la licence'
    };
  } catch (error) {
    return {
      valid: false,
      message: `Erreur lors de la désactivation: ${error}`
    };
  }
} 