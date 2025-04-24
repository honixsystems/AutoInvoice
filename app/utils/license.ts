import { appDataDir } from '@tauri-apps/api/path';
import { activateLicense, validateLicense, deactivateLicense } from './license-api';
import type { LicenseResponse } from './license-api';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

interface LicenseData {
  licenseKey: string | null;
}

async function getLicenseFilePath(): Promise<string> {
  return `${await appDataDir()}/license.json`;
}

async function readLicenseFile(): Promise<LicenseData> {
  try {
    const filePath = await getLicenseFilePath();
    const content = await readTextFile(filePath);
    return JSON.parse(content);
  } catch {
    return { licenseKey: null };
  }
}

async function writeLicenseFile(data: LicenseData): Promise<void> {
  const filePath = await getLicenseFilePath();
  await writeTextFile(filePath, JSON.stringify(data, null, 2));
}

export async function getLicenseKey(): Promise<string | null> {
  const data = await readLicenseFile();
  return data.licenseKey;
}

export async function setLicenseKey(key: string): Promise<LicenseResponse> {
  try {
    // Tente d'activer la licence
    const activationResult = await activateLicense(key);
    if (!activationResult.valid) {
      const isLicenseValid = useState('isLicenseValid');
      const licenseMessage = useState('licenseMessage');
      isLicenseValid.value = false;
      licenseMessage.value = activationResult.message;
      return activationResult;
    }

    await writeLicenseFile({ licenseKey: key });
    const isLicenseValid = useState('isLicenseValid');
    const licenseMessage = useState('licenseMessage');
    isLicenseValid.value = true;
    licenseMessage.value = "Licence activée avec succès";

    return {
      valid: true,
      message: "Licence activée avec succès"
    };
  } catch (error) {
    const isLicenseValid = useState('isLicenseValid');
    const licenseMessage = useState('licenseMessage');
    isLicenseValid.value = false;
    licenseMessage.value = `Erreur lors de l'enregistrement de la licence: ${error}`;
    return {
      valid: false,
      message: `Erreur lors de l'enregistrement de la licence: ${error}`
    };
  }
}

export async function validateStoredLicense(): Promise<LicenseResponse> {
  const licenseKey = await getLicenseKey();
  if (!licenseKey) {
    return {
      valid: false,
      message: "Aucune licence trouvée"
    };
  }

  return await validateLicense(licenseKey);
}

export async function deactivateStoredLicense(): Promise<LicenseResponse> {
  const licenseKey = await getLicenseKey();
  if (!licenseKey) {
    const isLicenseValid = useState('isLicenseValid');
    const licenseMessage = useState('licenseMessage');
    isLicenseValid.value = false;
    licenseMessage.value = "Aucune licence trouvée";
    return {
      valid: false,
      message: "Aucune licence trouvée"
    };
  }

  const deactivationResult = await deactivateLicense(licenseKey);
  if (deactivationResult.valid) {
    await writeLicenseFile({ licenseKey: null });
    const isLicenseValid = useState('isLicenseValid');
    const licenseMessage = useState('licenseMessage');
    isLicenseValid.value = false;
    licenseMessage.value = "Licence désactivée avec succès";
  } else {
    const isLicenseValid = useState('isLicenseValid');
    const licenseMessage = useState('licenseMessage');
    isLicenseValid.value = false;
    licenseMessage.value = deactivationResult.message;
  }

  return deactivationResult;
} 