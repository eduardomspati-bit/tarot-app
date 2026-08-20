// ==========================================
// CONTROL DE ACCESOS, AUTENTICACIÓN Y MUESTRAS FÍSICAS
// ==========================================

const MAX_MUESTRAS = 5;
const TOKEN_KEY = 'tarotia_token';
const EMAIL_KEY = 'tarotia_email_usuario';

// Códigos premium válidos (Respaldo por si el servidor no responde)
const CODIGOS_PREMIUM_VALIDOS = [
    'ADMIN2026',
    'PASEMISTICO',
    'TAROTGRATIS'
];

// ==========================================
// ESTADO PREMIUM
// ==========================================
(function inicializarEstadoPremium() {
    const simulado = localStorage.getItem('simularPremium') === 'true';
    const planLocal = localStorage.getItem('tarotia_plan_premium') === 'true';
    if (simulado || planLocal) {
        window.esUsuarioPremium = true;
        console.log('✨ Modo Premium activado');
    } else {
        window.esUsuarioPremium = false;
    }
})();

// ==========================================
// TOKEN / AUTH
// ==========================================
window.obtenerToken = function() {
    return localStorage.getItem(TOKEN_KEY);
};

window.guardarToken = function(token) {
    localStorage.setItem(TOKEN_KEY, token);
};

window.estaLogueado = function() {
    return !!localStorage.getItem(TOKEN_KEY) || !!localStorage.getItem(EMAIL_KEY);
};

window.cerrarSesion = function() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem('simularPremium');
    localStorage.removeItem('tarotia_plan_premium');
    window.esUsuarioPremium = false;
    alert('Sesión cerrada.');
    if (typeof window.mostrarPantalla === 'function') {
        window.mostrarPantalla('screen-auth');
    }
};

// ==========================================
// INTEGRACIÓN CON LA PANTALLA DE AUTH DEL HTML
// ==========================================
window.iniciarSesion = async function() {
    const emailInput = document.getElementById('auth-email');
    const nombreInput = document.getElementById('auth-nombre');
    const errorElement = document.getElementById('auth-error');

    if (!emailInput) return;

    const email = emailInput.value.trim().toLowerCase();
    const nombre = nombreInput ? nombreInput.value.trim() : 'Consultante';

    if (!email || !email.includes('@') || !email.includes('.')) {
        if (errorElement) {
            errorElement.textContent = "⚠️ Por favor, ingresá un correo electrónico válido.";
            errorElement.style.display = 'block';
        }
        return;
    }

    if (errorElement) errorElement.style.display = 'none';

    // Llamamos a tu función de autenticación con el servidor
    const resultado = await window.autenticarUsuario(nombre, email);

    if (resultado.exito) {
        localStorage.setItem(EMAIL_KEY, email);
        if (nombre && nombre !== 'Consultante') {
            localStorage.setItem('tarotia_nombre_usuario', nombre);
        }
        
        // Si todo va bien, pasamos a la portada de la app
        if (typeof window.mostrarPantalla === 'function') {
            window.mostrarPantalla('screen-portada');
        }
    } else {
        // Fallback offline o si el servidor tarda: permitimos el acceso con almacenamiento local
        console.warn("⚠️ Servidor no disponible, permitiendo acceso local con email:", email);
        localStorage.setItem(EMAIL_KEY, email);
        if (typeof window.mostrarPantalla === 'function') {
            window.mostrarPantalla('screen-portada');
        }
    }
};

// Función principal de enlace desde la landing ("Entrar al Tarot Completo")
window.entrarAppCompleta = function() {
    if (window.estaLogueado()) {
        if (typeof window.mostrarPantalla === 'function') {
            window.mostrarPantalla('screen-portada');
        }
    } else {
        if (typeof window.mostrarPantalla === 'function') {
            window.mostrarPantalla('screen-auth');
        }
    }
};

// Registro/Login contra el servidor (Tu lógica original mejorada)
window.autenticarUsuario = async function(nombre, email) {
    const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined')
        ? window.SERVIDOR_URL.replace('/tirada', '')
        : 'https://tarot-613b.onrender.com';

    try {
        const resp = await fetch(`${API_BASE}/api/auth/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email })
        });
        const data = await resp.json();
        if (resp.ok && data.token) {
            window.guardarToken(data.token);
            localStorage.setItem(EMAIL_KEY, email);
            if (data.usuario && (data.usuario.plan === 'Premium' || data.usuario.esPremium)) {
                window.esUsuarioPremium = true;
                localStorage.setItem('simularPremium', 'true');
                localStorage.setItem('tarotia_plan_premium', 'true');
            }
            return { exito: true, usuario: data.usuario };
        }
        return { exito: false, error: data.error || 'Error desconocido' };
    } catch (e) {
        return { exito: false, error: e.message };
    }
};

// Verificar muestras físicas restantes desde servidor
window.consultarMuestras = async function() {
    const token = window.obtenerToken();
    if (!token) return { premium: window.esUsuarioPremium, muestrasRestantes: obtenerMuestrasFisicasRestantes() };

    const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined')
        ? window.SERVIDOR_URL.replace('/tirada', '')
        : 'https://tarot-613b.onrender.com';

    try {
        const resp = await fetch(`${API_BASE}/api/tiradas/muestras`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resp.ok) return await resp.json();
        return { premium: window.esUsuarioPremium, muestrasRestantes: obtenerMuestrasFisicasRestantes() };
    } catch (e) {
        return { premium: window.esUsuarioPremium, muestrasRestantes: obtenerMuestrasFisicasRestantes() };
    }
};

// ==========================================
// MUESTRAS FÍSICAS (SINCRONIZADAS CON BACKEND)
// ==========================================

// Obtener muestras (Intenta primero del servidor, si falla usa caché local)
async function obtenerMuestrasFisicasRestantes() {
    if (window.esUsuarioPremium) return 999;

    const token = window.obtenerToken();
    const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined')
        ? window.SERVIDOR_URL.replace('/tirada', '')
        : 'https://tarot-613b.onrender.com';

    // Si hay token, consultamos al servidor de Render/MongoDB
    if (token) {
        try {
            const resp = await fetch(`${API_BASE}/api/tiradas/muestras`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                // Sincronizamos con localStorage por velocidad visual
                localStorage.setItem('muestrasFisicasTarot', data.muestrasRestantes.toString());
                return data.muestrasRestantes;
            }
        } catch (e) {
            console.warn("⚠️ Servidor desconectado, usando contador local temporal.");
        }
    }

    // Fallback local si no hay token o falló el fetch
    let muestras = localStorage.getItem('muestrasFisicasTarot');
    if (muestras === null) {
        localStorage.setItem('muestrasFisicasTarot', MAX_MUESTRAS.toString());
        return MAX_MUESTRAS;
    }
    return parseInt(muestras, 10) || 0;
}

// Registrar uso de tirada restando en el servidor
async function registrarUsoTiradaFisica() {
    if (window.esUsuarioPremium) return;

    const token = window.obtenerToken();
    const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined')
        ? window.SERVIDOR_URL.replace('/tirada', '')
        : 'https://tarot-613b.onrender.com';

    if (token) {
        try {
            const resp = await fetch(`${API_BASE}/api/tiradas/gastar-muestra`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });
            if (resp.ok) {
                const data = await resp.json();
                localStorage.setItem('muestrasFisicasTarot', data.muestrasRestantes.toString());
                actualizarBadgeMuestrasFisicas();
                return;
            }
        } catch (e) {
            console.error("Error al registrar muestra en servidor:", e);
        }
    }

    // Fallback local si el servidor no responde
    let actuales = await obtenerMuestrasFisicasRestantes();
    if (actuales > 0) {
        actuales--;
        localStorage.setItem('muestrasFisicasTarot', actuales.toString());
        actualizarBadgeMuestrasFisicas();
    }
}

async function actualizarBadgeMuestrasFisicas() {
    const badge = document.getElementById('badge-physic-muestra-prof')
               || document.getElementById('badge-fisico-muestra-prof')
               || document.getElementById('badge-fisico-muestra');

    if (badge) {
        if (window.esUsuarioPremium) {
            badge.innerText = "Ilimitado ✨";
            badge.style.borderColor = "#a78bfa";
        } else {
            const restantes = await obtenerMuestrasFisicasRestantes();
            badge.innerText = restantes > 0 ? `${restantes} Muestras` : "Agotado 🔒";
        }
    }
}

// ==========================================
// CANJEAR CÓDIGO PREMIUM
// ==========================================
function canjearCodigoPremium(codigo) {
    if (!codigo) return;
    const codigoLimpio = codigo.trim().toUpperCase();

    if (CODIGOS_PREMIUM_VALIDOS.includes(codigoLimpio)) {
        window.esUsuarioPremium = true;
        localStorage.setItem('simularPremium', 'true');
        localStorage.setItem('tarotia_plan_premium', 'true');
        alert('✨ ¡Código premium activado con éxito! Ahora tenés acceso ilimitado.');
        actualizarBadgeMuestrasFisicas();
    } else {
        alert('❌ Código inválido o expirado. Probá con otro o contactá al administrador.');
    }
}

// ==========================================
// MERCADO PAGO 
// ==========================================
window.abrirMercadoPago = function() {
    // Aquí puedes abrir tu link de pago directo o redirigir
    window.open('https://link.mercadopago.com.ar/TULINKDEMP', '_blank');
};

// ==========================================
// ACCESO A MAZO FÍSICO
// ==========================================
function verificarAccesoFisico() {
    if (window.esUsuarioPremium) {
        if (typeof abrirModoFisico === 'function') {
            abrirModoFisico();
        } else if (typeof mostrarPantalla === 'function') {
            mostrarPantalla('screen-fisico');
        }
        return;
    }

    const muestrasRestantes = obtenerMuestrasFisicasRestantes();

    if (muestrasRestantes > 0) {
        if (typeof abrirModoFisico === 'function') {
            abrirModoFisico();
        } else if (typeof mostrarPantalla === 'function') {
            mostrarPantalla('screen-fisico');
        }
    } else {
        const codigo = prompt("🔒 Has agotado tus 5 muestras gratuitas de Mazo Físico.\n\nIngresa tu código de acceso Premium o pulsa Aceptar para adquirir tu Pase Místico por Mercado Pago:");
        if (codigo) {
            canjearCodigoPremium(codigo);
        } else {
            window.abrirMercadoPago();
        }
    }
}

function verificarAccesoTarotistaFisico() {
    verificarAccesoFisico();
}

function verificarAccesoTarotista() {
    if (window.esUsuarioPremium) {
        if (typeof irAlEjeConsulta === 'function') irAlEjeConsulta('manual');
    } else {
        const codigo = prompt("✨ El Modo Tarotista es exclusivo de TarotIA Premium.\nPor favor, ingresa tu código de acceso:");
        if (codigo) {
            canjearCodigoPremium(codigo);
        }
    }
}

// Inicializar el estado de los badges al cargar el módulo
document.addEventListener('DOMContentLoaded', () => {
    actualizarBadgeMuestrasFisicas();
});

console.log("[access.js] Módulo de control de accesos y muestras físicas sincronizado correctamente");
