export default defineNuxtRouteMiddleware((to, from) => {
    const isLicenseValid = useState('isLicenseValid');

    if (!isLicenseValid.value && to.path !== '/setup') {
        return navigateTo('/setup');
    }
})
