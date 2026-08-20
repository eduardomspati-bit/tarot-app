// ==========================================
// CONTROL DE ACCESOS, AUTENTICACIÓN Y MUESTRAS FÍSICAS
// ==========================================

const MAX_MUESTRAS = 5;
const TOKEN_KEY = 'tarotia_token';
const EMAIL_KEY = 'tarotia_email_usuario';

// Arrancamos por defecto en falso. El servidor dirá la verdad después.
window.esUsuarioPremium = false;

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
// MUESTRAS FÍSICAS (SINCRONIZADAS CON MONGODB)
// ==========================================

async function obtenerMuestrasFisicasRestantes() {
    if (window.esUsuarioPremium) return 999;

    const token = window.obtenerToken();
    const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined')
        ? window.SERVIDOR_URL.replace('/tirada', '')
        : 'https://tarot-613b.onrender.com';

    // Si hay token, le preguntamos directamente a tu servidor de Render/MongoDB
    if (token) {
        try {
            const resp = await fetch(`${API_BASE}/api/tiradas/muestras`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                return data.muestrasRestantes;
            }
        } catch (e) {
            console.warn("⚠️ Servidor offline, consultando caché local.");
        }
    }

    // Fallback local por si acaso
    let muestras = localStorage.getItem('muestrasFisicasTarot');
    if (muestras === null) {
        localStorage.setItem('muestrasFisicasTarot', '5');
        return 5;
    }
    return parseInt(muestras, 10) || 0;
}

async function registrarUsoTiradaFisica() {
    if (window.esUsuarioPremium) return;

    const token = window.obtenerToken();
    const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined')
        ? window.SERVIDOR_URL.replace('/tirada', '')
        : 'https://tarot-613b.onrender.com';

    // Llamamos al endpoint que ya tienes en tu server.js: app.post('/api/tiradas/usar-muestra')
    if (token) {
        try {
            const resp = await fetch(`${API_BASE}/api/tiradas/usar-muestra`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });
            if (resp.ok) {
                const data = await resp.json();
                actualizarBadgeMuestrasFisicas();
                return data.muestrasRestantes;
            }
        } catch (e) {
            console.error("Error al registrar muestra en MongoDB:", e);
        }
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

    // Aquí llamamos a la versión asíncrona que conecta con MongoDB
    obtenerMuestrasFisicasRestantes().then(muestrasRestantes => {
        if (muestrasRestantes > 0) {
            if (typeof abrirModoFisico === 'function') {
                abrirModoFisico();
            } else if (typeof mostrarPantalla === 'function') {
                mostrarPantalla('screen-fisico');
            }
        } else {
            const codigo = prompt("🔒 Has agotado tus muestras gratuitas de Mazo Físico.\n\nIngresa tu código de acceso Premium o pulsa Aceptar para adquirir tu Pase Místico por Mercado Pago:");
            if (codigo) {
                canjearCodigoPremium(codigo);
            } else {
                window.abrirMercadoPago();
            }
        }
    });
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

// ==========================================
// VERIFICACIÓN DE SEGURIDAD Y MÓDULO DE INICIO
// ==========================================
async function verificarEstadoReal() {
    const token = window.obtenerToken();
    if (!token) return;

    try {
        const API_BASE = 'https://tarot-613b.onrender.com';
        const resp = await fetch(`${API_BASE}/api/auth/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (resp.ok) {
            const data = await resp.json();
            // Esto es lo que realmente traba o libera la app
            window.esUsuarioPremium = (data.usuario.plan === 'Premium');
            actualizarBadgeMuestrasFisicas();
        }
    } catch (e) {
        console.warn("No se pudo verificar el estado en el servidor.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    verificarEstadoReal(); // Verifica si eres Premium real en la BD
    actualizarBadgeMuestrasFisicas(); // Actualiza el contador visual
});

console.log("[access.js] Módulo de control de accesos y muestras físicas sincronizado correctamente");
