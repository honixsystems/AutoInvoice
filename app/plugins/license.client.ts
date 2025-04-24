import { validateStoredLicense } from '~/utils/license';

export default defineNuxtPlugin(async (nuxtApp) => {
  const isLicenseValid = useState<boolean | null>('isLicenseValid', () => null);
  const licenseMessage = useState<string | null>('licenseMessage', () => null);

  if (!isLicenseValid.value) {
    try {
      const { valid, message } = await validateStoredLicense();
      isLicenseValid.value = valid;
      licenseMessage.value = message;
    } catch (error) {
      isLicenseValid.value = false;
      licenseMessage.value = `Erreur lors de la validation de la licence: ${error}`;
      console.error('Erreur lors de la validation de la licence:', error);
    }
  }

  return {
    provide: {
      license: {
        isValid: isLicenseValid.value,
        message: licenseMessage.value
      }
    }
  };
});