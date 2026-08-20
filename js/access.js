// ==========================================
// CONTROL DE ACCESOS, AUTENTICACIÓN Y MUESTRAS FÍSICAS
// ==========================================

const MAX_MUESTRAS = 5;
const TOKEN_KEY = 'tarotia_token';
const EMAIL_KEY = 'tarotia_email_usuario';

// Códigos premium válidos
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
    if (simulado) {
        window.esUsuarioPremium = true;
        console.log('✨ Modo Premium activado desde localStorage');
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
    return !!localStorage.getItem(TOKEN_KEY);
};

window.cerrarSesion = function() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem('simularPremium');
    window.esUsuarioPremium = false;
    alert('Sesión cerrada.');
};

// Registro/Login contra el servidor
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
            if (data.usuario && data.usuario.plan === 'Premium') {
                window.esUsuarioPremium = true;
                localStorage.setItem('simularPremium', 'true');
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
    if (!token) return { premium: false, muestrasRestantes: obtenerMuestrasFisicasRestantes() };

    const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined')
        ? window.SERVIDOR_URL.replace('/tirada', '')
        : 'https://tarot-613b.onrender.com';

    try {
        const resp = await fetch(`${API_BASE}/api/tiradas/muestras`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resp.ok) return await resp.json();
        return { premium: false, muestrasRestantes: obtenerMuestrasFisicasRestantes() };
    } catch (e) {
        return { premium: false, muestrasRestantes: obtenerMuestrasFisicasRestantes() };
    }
};

// ==========================================
// MUESTRAS FÍSICAS (LOCAL)
// ==========================================
function obtenerMuestrasFisicasRestantes() {
    let muestras = localStorage.getItem('muestrasFisicasTarot');
    if (muestras === null) {
        localStorage.setItem('muestrasFisicasTarot', MAX_MUESTRAS.toString());
        return MAX_MUESTRAS;
    }
    return parseInt(muestras, 10) || 0;
}

function registrarUsoTiradaFisica() {
    if (window.esUsuarioPremium) return;
    let actuales = obtenerMuestrasFisicasRestantes();
    if (actuales > 0) {
        actuales--;
        localStorage.setItem('muestrasFisicasTarot', actuales.toString());
        actualizarBadgeMuestrasFisicas();
    }
}

function actualizarBadgeMuestrasFisicas() {
    const badge = document.getElementById('badge-physic-muestra-prof')
               || document.getElementById('badge-fisico-muestra-prof')
               || document.getElementById('badge-fisico-muestra');

    if (badge) {
        if (window.esUsuarioPremium) {
            badge.innerText = "Ilimitado ✨";
            badge.style.borderColor = "#a78bfa";
        } else {
            const restantes = obtenerMuestrasFisicasRestantes();
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
        alert('✨ ¡Código premium activado con éxito! Ahora tenés acceso ilimitado.');
        actualizarBadgeMuestrasFisicas();
    } else {
        alert('❌ Código inválido o expirado. Probá con otro o contactá al administrador.');
    }
}

// ==========================================
// MERCADO PAGO (STUB)
// ==========================================
function abrirMercadoPago() {
    alert('🛒 Próximamente: enlace de pago por Mercado Pago.\n\nContactá al administrador para adquirir tu Pase Místico.');
}

// ==========================================
// ACCESO A MAZO FÍSICO (CORREGIDO)
// ==========================================
function verificarAccesoFisico() {
    // 1. Si es usuario Premium, abre directamente la carga de cartas físicas
    if (window.esUsuarioPremium) {
        if (typeof abrirModoFisico === 'function') {
            abrirModoFisico();
        } else if (typeof mostrarPantalla === 'function') {
            mostrarPantalla('screen-fisico');
        }
        return;
    }

    // 2. Si es usuario gratuito, verificar las muestras restantes
    const muestrasRestantes = obtenerMuestrasFisicasRestantes();

    if (muestrasRestantes > 0) {
        if (typeof abrirModoFisico === 'function') {
            abrirModoFisico();
        } else if (typeof mostrarPantalla === 'function') {
            mostrarPantalla('screen-fisico');
        }
    } else {
        // 3. Muestras agotadas: Solicita código Premium o redirige a suscripción
        const codigo = prompt("🔒 Has agotado tus 5 muestras gratuitas de Mazo Físico.\n\nIngresa tu código de acceso Premium para continuar o adquiere tu Pase Místico:");
        if (codigo && typeof canjearCodigoPremium === 'function') {
            canjearCodigoPremium(codigo);
        } else if (typeof abrirMercadoPago === 'function') {
            abrirMercadoPago();
        }
    }
}

// ==========================================
// PUENTE / ALIAS PARA EVITAR EL REFERENCE ERROR
// ==========================================
function verificarAccesoTarotistaFisico() {
    verificarAccesoFisico();
}

function verificarAccesoTarotista() {
    if (window.esUsuarioPremium) {
        if (typeof irAlEjeConsulta === 'function') irAlEjeConsulta('manual');
    } else {
        const codigo = prompt("✨ El Modo Tarotista es exclusivo de TarotIA Premium.\nPor favor, ingresa tu código de acceso:");
        if (codigo && typeof canjearCodigoPremium === 'function') {
            canjearCodigoPremium(codigo);
        }
    }
}

// Inicializar el estado de los badges al cargar el módulo
document.addEventListener('DOMContentLoaded', () => {
    actualizarBadgeMuestrasFisicas();
});
