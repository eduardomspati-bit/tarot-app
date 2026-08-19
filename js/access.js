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
    return !!localStorage.getItem(TOKEN_KEY);
};

window.cerrarSesion = function() {
    // Detener voz si está sonando
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem('simularPremium');
    window.esUsuarioPremium = false;
    
    // Volver al landing
    if (typeof window.mostrarPantalla === 'function') {
        window.mostrarPantalla('screen-landing');
    }
    
    alert('👋 Sesión cerrada correctamente.');
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
            badge.innerText = "♾️ Ilimitado";
            badge.style.borderColor = "#a78bfa";
        } else {
            const restantes = obtenerMuestrasFisicasRestantes();
            badge.innerText = restantes > 0 ? `🔮 ${restantes} Muestras` : "🔒 Agotado";
        }
    }
}

// ==========================================
// CANJEAR CÓDIGO PREMIUM
// ==========================================
window.canjearCodigoPremium = function(codigo) {
    if (!codigo) return;
    const codigoLimpio = codigo.trim().toUpperCase();

    if (CODIGOS_PREMIUM_VALIDOS.includes(codigoLimpio)) {
        window.esUsuarioPremium = true;
        localStorage.setItem('simularPremium', 'true');
        alert('✨ ¡Código premium activado con éxito! Ahora tenés acceso ilimitado a todas las funciones.');
        actualizarBadgeMuestrasFisicas();
        return true;
    } else {
        alert('❌ Código inválido o expirado. Probá con otro o contactá al administrador.');
        return false;
    }
};

// ==========================================
// MERCADO PAGO (STUB - Integrar con Mercado Pago real)
// ==========================================
window.abrirMercadoPago = function() {
    alert('🛒 Próximamente: enlace de pago por Mercado Pago.\n\nContactá al administrador para adquirir tu Pase Místico.');
};

// ==========================================
// ACCESO A MAZO FÍSICO (CORREGIDO)
// ==========================================
window.verificarAccesoFisico = function() {
    // 1. Si es usuario Premium, abre directamente la carga de cartas físicas
    if (window.esUsuarioPremium) {
        if (typeof window.abrirModoFisico === 'function') {
            window.abrirModoFisico();
        } else if (typeof window.mostrarPantalla === 'function') {
            window.mostrarPantalla('screen-fisico');
        }
        return;
    }

    // 2. Si es usuario gratuito, verificar las muestras restantes
    const muestrasRestantes = obtenerMuestrasFisicasRestantes();

    if (muestrasRestantes > 0) {
        if (typeof window.abrirModoFisico === 'function') {
            window.abrirModoFisico();
        } else if (typeof window.mostrarPantalla === 'function') {
            window.mostrarPantalla('screen-fisico');
        }
    } else {
        // 3. Muestras agotadas: Solicita código Premium o redirige a suscripción
        const opcion = confirm("🔒 Has agotado tus 5 muestras gratuitas de Mazo Físico.\n\n¿Quieres ingresar un código Premium? (Aceptar = Sí, Cancelar = Ver suscripción)");
        if (opcion) {
            const codigo = prompt("Ingresa tu código de acceso Premium:");
            if (codigo && typeof window.canjearCodigoPremium === 'function') {
                const exito = window.canjearCodigoPremium(codigo);
                if (exito && typeof window.abrirModoFisico === 'function') {
                    window.abrirModoFisico();
                }
            }
        } else {
            window.abrirMercadoPago();
        }
    }
};

// ==========================================
// PUENTE / ALIAS PARA EVITAR EL REFERENCE ERROR
// ==========================================
window.verificarAccesoTarotistaFisico = function() {
    window.verificarAccesoFisico();
};

window.verificarAccesoTarotista = function() {
    if (window.esUsuarioPremium) {
        if (typeof window.irAlEjeConsulta === 'function') {
            window.irAlEjeConsulta('manual');
        } else {
            alert("⚠️ Función 'irAlEjeConsulta' no definida.");
        }
    } else {
        const opcion = confirm("✨ El Modo Tarotista es exclusivo de TarotIA Premium.\n\n¿Quieres ingresar un código Premium?");
        if (opcion) {
            const codigo = prompt("Ingresa tu código de acceso:");
            if (codigo && typeof window.canjearCodigoPremium === 'function') {
                window.canjearCodigoPremium(codigo);
            }
        } else {
            window.abrirMercadoPago();
        }
    }
};

// ==========================================
// INICIAR SESIÓN (desde la pantalla de auth)
// ==========================================

window.iniciarSesion = async function() {
    const nombreInput = document.getElementById('auth-nombre');
    const emailInput = document.getElementById('auth-email');
    const errorDiv = document.getElementById('auth-error');

    const nombre = nombreInput ? nombreInput.value.trim() : 'Consultante';
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email || !email.includes('@')) {
        if (errorDiv) {
            errorDiv.textContent = '⚠️ Ingresá un correo válido.';
            errorDiv.style.display = 'block';
        }
        return;
    }

    if (errorDiv) errorDiv.style.display = 'none';

    const resultado = await window.autenticarUsuario(nombre, email);

    if (resultado.exito) {
        // Actualizar badge de muestras
        if (typeof actualizarBadgeMuestrasFisicas === 'function') {
            actualizarBadgeMuestrasFisicas();
        }
        // Ir a la portada
        if (typeof window.mostrarPantalla === 'function') {
            window.mostrarPantalla('screen-portada');
        }
    } else {
        if (errorDiv) {
            errorDiv.textContent = '❌ ' + (resultado.error || 'Error al iniciar sesión.');
            errorDiv.style.display = 'block';
        }
    }
};

// ==========================================
// ABRIR MODO FÍSICO
// ==========================================

window.abrirModoFisico = function() {
    if (typeof window.cargarSelectoresFisicos === 'function') {
        window.cargarSelectoresFisicos();
    }
    if (typeof window.mostrarPantalla === 'function') {
        window.mostrarPantalla('screen-fisico');
    }
};

// ==========================================
// FORZAR FLUJO DE AUTENTICACIÓN
// ==========================================

// Redirigir a auth si no está logueado y trata de entrar a la app completa
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

// ==========================================
// VERIFICAR ACCESO PREMIUM
// ==========================================

window.verificarAccesoPremium = function() {
    if (window.esUsuarioPremium) {
        return true;
    } else {
        const opcion = confirm("🔒 Esta función es exclusiva para TarotIA Premium.\n\n¿Quieres ingresar un código Premium? (Aceptar = Sí, Cancelar = Ver suscripción)");
        if (opcion) {
            const codigo = prompt("Ingresa tu código de acceso Premium:");
            if (codigo && typeof window.canjearCodigoPremium === 'function') {
                return window.canjearCodigoPremium(codigo);
            }
        } else {
            window.abrirMercadoPago();
        }
        return false;
    }
};

// ==========================================
// MOSTRAR PLAN DEL USUARIO EN LA PORTADA
// ==========================================

window.mostrarPlanUsuario = function() {
    const email = localStorage.getItem(EMAIL_KEY) || 'No logueado';
    const plan = window.esUsuarioPremium ? '⭐ PREMIUM' : '🃏 GRATIS';
    const muestras = window.esUsuarioPremium ? '♾️ Ilimitadas' : `${obtenerMuestrasFisicasRestantes()} de ${MAX_MUESTRAS}`;
    
    return `<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,215,0,0.1); border-radius: 10px; padding: 12px; margin-bottom: 20px; font-size: 0.9rem;">
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
            <span>📧 ${email}</span>
            <span style="color: ${window.esUsuarioPremium ? '#ffd700' : '#a78bfa'};">${plan}</span>
        </div>
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-top: 4px; color: var(--muted-text);">
            <span>🔮 Muestras físicas: ${muestras}</span>
        </div>
    </div>`;
};

// ==========================================
// INICIALIZACIÓN
// ==========================================

// Al cargar la página, actualizar badges
document.addEventListener('DOMContentLoaded', function() {
    actualizarBadgeMuestrasFisicas();
    
    // Si hay un email guardado, mostrarlo en el placeholder del auth
    const emailInput = document.getElementById('auth-email');
    if (emailInput) {
        const emailGuardado = localStorage.getItem(EMAIL_KEY);
        if (emailGuardado) {
            emailInput.value = emailGuardado;
        }
    }
    
    console.log('[access.js] Módulo de acceso inicializado');
    console.log('[access.js] Usuario Premium:', window.esUsuarioPremium);
});

console.log("[access.js] Módulo de control de acceso cargado");
