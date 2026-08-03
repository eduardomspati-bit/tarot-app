
// ==========================================
// CONFIGURACIÓN GLOBAL DE TAROTIA
// ==========================================

// URL de tu servidor backend en Render
const API_URL = typeof window.API_URL !== 'undefined' ? window.API_URL : "https://tu-servidor.onrender.com";

// Estado global de usuario (evita ReferenceError)
window.esUsuarioPremium = window.esUsuarioPremium || false;
window.modoFisicoActivo = window.modoFisicoActivo || false;
window.estiloSeleccionado = window.estiloSeleccionado || 'magico';

// Contexto de lectura activa
let ultimasCartasElegidasContexto = null;
let ultimaLecturaGuardadaContexto = "";
