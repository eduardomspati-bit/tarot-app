// ==========================================
// CONFIGURACIÓN GLOBAL DE TAROTIA
// ==========================================

// Reemplazá con tu URL real de Render
const API_URL = typeof window.API_URL !== 'undefined' ? window.API_URL : "https://tarotia-backend.onrender.com";

// Estado global de usuario (evita ReferenceError)
window.esUsuarioPremium = window.esUsuarioPremium || false;
window.modoFisicoActivo = window.modoFisicoActivo || false;
window.estiloSeleccionado = window.estiloSeleccionado || 'magico';

// Contexto de lectura activa
let ultimasCartasElegidasContexto = null;
let ultimaLecturaGuardadaContexto = "";
