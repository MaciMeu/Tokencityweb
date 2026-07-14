// theme-init.js
// Debe cargarse de forma síncrona en <head>, antes del primer paint,
// para evitar un flash del tema equivocado. Misma lógica en toda la web:
// localStorage('themePreference') tiene prioridad; si no existe, se decide
// por preferencia del sistema + hora del día (noche = oscuro).
(function () {
    const savedTheme = localStorage.getItem('themePreference');
    let isLight;
    if (savedTheme) {
        isLight = savedTheme === 'light';
    } else {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const hour = new Date().getHours();
        const nightTime = (hour >= 19 || hour < 7);
        isLight = !systemDark && !nightTime;
    }

    if (isLight) {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }
    window.__isThemeLight = isLight;
})();
