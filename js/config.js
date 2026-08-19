// ==========================================
// CONFIGURACIÓN GLOBAL
// ==========================================

console.log("[config.js] Cargando configuración...");

// ==========================================
// URL DEL SERVIDOR
// ==========================================

// URL base limpia de tu backend en Render
const API_BASE_URL = (typeof window.API_URL !== 'undefined' && window.API_URL) 
    ? window.API_URL 
    : 'https://tarot-613b.onrender.com';

// URL para el endpoint de tiradas
window.SERVIDOR_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;

// URL para otras API (admin, auth, duplas, etc.)
window.API_BASE_URL = API_BASE_URL;

console.log("[config.js] ✅ SERVIDOR_URL:", window.SERVIDOR_URL);
console.log("[config.js] ✅ API_BASE_URL:", window.API_BASE_URL);

// ==========================================
// OBTENER MAZO ACTIVO
// ==========================================

window.obtenerMazoActivo = function() {
    // 1. Intentar con arcanosCompleto global (declarado en arcanos.js)
    if (typeof arcanosCompleto !== 'undefined' && 
        Array.isArray(arcanosCompleto) && 
        arcanosCompleto.length > 0) {
        console.log("[config.js] ✅ Mazo encontrado vía arcanosCompleto global:", arcanosCompleto.length);
        return arcanosCompleto;
    }

    // 2. Intentar con window.arcanosCompleto
    if (window.arcanosCompleto && 
        Array.isArray(window.arcanosCompleto) && 
        window.arcanosCompleto.length > 0) {
        console.log("[config.js] ✅ Mazo encontrado vía window.arcanosCompleto:", window.arcanosCompleto.length);
        return window.arcanosCompleto;
    }

    // 3. Intentar con window.mazoCompleto (fallback)
    if (window.mazoCompleto && 
        Array.isArray(window.mazoCompleto) && 
        window.mazoCompleto.length > 0) {
        console.log("[config.js] ✅ Mazo encontrado vía window.mazoCompleto:", window.mazoCompleto.length);
        return window.mazoCompleto;
    }

    // 4. Fallback de emergencia con 22 Arcanos Mayores
    console.warn("[config.js] ⚠️ No se encontró el mazo completo. Usando fallback de emergencia (22 Arcanos Mayores).");
    return [
        "El Loco", "El Mago", "La Sacerdotisa", "La Emperatriz", "El Emperador",
        "El Papa", "Los Enamorados", "El Carro", "La Justicia", "El Ermitaño",
        "La Rueda de la Fortuna", "La Fuerza", "El Colgado", "La Muerte",
        "La Templanza", "El Diablo", "La Torre", "La Estrella", "La Luna",
        "El Sol", "El Juicio", "El Mundo"
    ];
};

// ==========================================
// CONSTANTES DE CONFIGURACIÓN
// ==========================================

// Máximo de muestras físicas para usuarios gratuitos
window.MAX_MUESTRAS_FISICAS = 5;

// Máximo de consultas gratis por día
window.MAX_CONSULTAS_GRATIS_DIA = 3;

// Clave para guardar el token en localStorage
window.TOKEN_KEY = 'tarotia_token';

// Clave para guardar el email del usuario
window.EMAIL_KEY = 'tarotia_email_usuario';

// Clave para guardar los datos del usuario
window.USER_DATA_KEY = 'tarotia_usuario_data';

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

// Verificar si el usuario está en modo offline
window.estaOffline = function() {
    return !navigator.onLine;
};

// Obtener la URL completa para una API específica
window.obtenerUrlAPI = function(endpoint) {
    const base = window.API_BASE_URL || 'https://tarot-613b.onrender.com';
    // Asegurar que no haya doble barra
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${cleanBase}${cleanEndpoint}`;
};

// Obtener la URL para el endpoint de tiradas
window.obtenerUrlTirada = function() {
    return window.obtenerUrlAPI('/tirada');
};

// ==========================================
// VERIFICAR CONEXIÓN CON EL SERVIDOR
// ==========================================

window.verificarConexionServidor = async function() {
    try {
        const url = window.obtenerUrlAPI('/api/auth/status');
        const response = await fetch(url, { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // Timeout de 5 segundos
            signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
            console.log("[config.js] ✅ Servidor conectado correctamente.");
            return true;
        } else {
            console.warn("[config.js] ⚠️ Servidor respondió pero con error:", response.status);
            return false;
        }
    } catch (error) {
        console.warn("[config.js] ❌ No se pudo conectar al servidor:", error.message);
        return false;
    }
};

// ==========================================
// INICIALIZACIÓN AL CARGAR
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("[config.js] ✅ Configuración cargada correctamente.");
    
    // Verificar conexión con el servidor (sin bloquear)
    setTimeout(() => {
        window.verificarConexionServidor();
    }, 2000);
});

// ==========================================
// EXPONER FUNCIONES GLOBALES
// ==========================================

window.config = {
    SERVIDOR_URL: window.SERVIDOR_URL,
    API_BASE_URL: window.API_BASE_URL,
    MAX_MUESTRAS_FISICAS: window.MAX_MUESTRAS_FISICAS,
    MAX_CONSULTAS_GRATIS_DIA: window.MAX_CONSULTAS_GRATIS_DIA,
    TOKEN_KEY: window.TOKEN_KEY,
    EMAIL_KEY: window.EMAIL_KEY,
    USER_DATA_KEY: window.USER_DATA_KEY,
    obtenerMazoActivo: window.obtenerMazoActivo,
    obtenerUrlAPI: window.obtenerUrlAPI,
    obtenerUrlTirada: window.obtenerUrlTirada,
    verificarConexionServidor: window.verificarConexionServidor,
    estaOffline: window.estaOffline
};

console.log("[config.js] ✅ Módulo de configuración listo");
