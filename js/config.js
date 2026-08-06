// ==========================================
// CONFIGURACIÓN GLOBAL DE TAROTIA
// ==========================================

// URL base del servidor backend en Render
const API_URL = typeof window.API_URL !== 'undefined' ? window.API_URL : 'https://tarot-613b.onrender.com';

// Estado global de la aplicación y permisos del usuario
window.esUsuarioPremium = window.esUsuarioPremium || false;
window.modoFisicoActivo = window.modoFisicoActivo || false;
window.estiloSeleccionado = window.estiloSeleccionado || 'magico';

// Contexto global de la lectura activa para repreguntas e historial
window.ultimasCartasElegidasContexto = window.ultimasCartasElegidasContexto || null;
window.ultimaLecturaGuardadaContexto = window.ultimaLecturaGuardadaContexto || "";

// Inicializar estado premium desde localStorage (coordina con kkadmin.html)
(function() {
    const simulado = localStorage.getItem('simularPremium') === 'true';
    if (simulado) {
        window.esUsuarioPremium = true;
        console.log('✨ [config.js] Modo Premium activado desde localStorage');
    }
})();
