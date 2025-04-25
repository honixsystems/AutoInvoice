export default defineNuxtRouteMiddleware((to, from) => {
    console.log('middleware license');
    const isLicenseValid = useState('isLicenseValid');
    console.log('isLicenseValid', isLicenseValid.value);

    if (!isLicenseValid.value && to.path !== '/setup') {
        return navigateTo('/setup');
    }
})
