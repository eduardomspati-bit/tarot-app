// ==========================================
// CONTROL DE ACCESOS Y MUESTRAS FÍSICAS (SERVER-SIDE)
// ==========================================

const MAX_MUESTRAS = 5;

// Códigos premium válidos (fallback local si el servidor no responde)
const CODIGOS_PREMIUM_VALIDOS = [
    'ADMIN2026',
    'PASEMISTICO',
    'TAROTGRATIS'
];

// ==========================================
// VERIFICAR ACCESO A MAZO FÍSICO (SERVER-SIDE)
// ==========================================
window.verificarAccesoFisico = async function() {
    // 1. Verificar si hay sesión
    if (!window.tarotiaToken) {
        alert('🔒 Debes iniciar sesión para usar el Mazo Físico.');
        if (typeof window.mostrarPantalla === 'function') {
            window.mostrarPantalla('screen-auth');
        }
        return;
    }

    // 2. Cargar perfil actualizado
    await window.cargarPerfil();

    if (!window.tarotiaUsuario) {
        alert('❌ Error al verificar tu cuenta. Intentá de nuevo.');
        return;
    }

    // 3. Si es Premium, acceso directo
    if (window.tarotiaUsuario.plan === 'Premium') {
        abrirModoFisico();
        return;
    }

    // 4. Si es Gratis, verificar muestras restantes
    const muestras = window.tarotiaUsuario.muestrasFisicasRestantes || 0;

    if (muestras > 0) {
        abrirModoFisico();
    } else {
        // Muestras agotadas
        const codigo = prompt("🔒 Has agotado tus 5 muestras gratuitas de Mazo Físico.\n\nIngresa tu código de acceso Premium para continuar:");
        if (codigo) {
            const ok = await window.canjearCodigoPremiumServer(codigo);
            if (ok) {
                abrirModoFisico();
            }
        }
    }
};

// ==========================================
// ABRIR MODO FÍSICO (después de verificar acceso)
// ==========================================
function abrirModoFisico() {
    if (typeof window.abrirSeleccionFisico === 'function') {
        // Determinar submodo según el botón que se clickeó
        // Por defecto predictivo
        window.abrirSeleccionFisico('predictivo_fisico');
    } else if (typeof window.mostrarPantalla === 'function') {
        window.mostrarPantalla('screen-fisico');
    }
}

// ==========================================
// REGISTRAR USO DE TIRADA FÍSICA
// ==========================================
window.registrarUsoTiradaFisica = async function() {
    if (!window.tarotiaToken) return;
    if (window.tarotiaUsuario && window.tarotiaUsuario.plan === 'Premium') return;

    try {
        const data = await window.usarMuestraFisicaServer();
        if (window.tarotiaUsuario && data.muestrasRestantes !== undefined) {
            window.tarotiaUsuario.muestrasFisicasRestantes = data.muestrasRestantes;
        }
    } catch (e) {
        console.error('Error registrando uso:', e);
    }
};

// ==========================================
// ACTUALIZAR BADGE DE MUESTRAS
// ==========================================
window.actualizarBadgeMuestrasFisicas = function() {
    const badge = document.getElementById('badge-physic-muestra-prof')
               || document.getElementById('badge-fisico-muestra-prof')
               || document.getElementById('badge-fisico-muestra');

    if (!badge) return;

    if (window.tarotiaUsuario && window.tarotiaUsuario.plan === 'Premium') {
        badge.innerText = "Ilimitado ✨";
        badge.style.borderColor = "#a78bfa";
    } else if (window.tarotiaUsuario) {
        const restantes = window.tarotiaUsuario.muestrasFisicasRestantes || 0;
        badge.innerText = restantes > 0 ? `${restantes} Muestras` : "Agotado 🔒";
    } else {
        badge.innerText = "5 Muestras";
    }
};

// ==========================================
// CANJEAR CÓDIGO PREMIUM (wrapper compatible)
// ==========================================
window.canjearCodigoPremium = async function(codigo) {
    if (!codigo) return;

    // Si hay sesión, usar servidor
    if (window.tarotiaToken) {
        return await window.canjearCodigoPremiumServer(codigo);
    }

    // Fallback local (sin servidor)
    const codigoLimpio = codigo.trim().toUpperCase();
    if (CODIGOS_PREMIUM_VALIDOS.includes(codigoLimpio)) {
        localStorage.setItem('simularPremium', 'true');
        alert('✨ ¡Código premium activado! (modo local)');
        return true;
    } else {
        alert('❌ Código inválido.');
        return false;
    }
};

// ==========================================
// MERCADO PAGO (STUB)
// ==========================================
window.abrirMercadoPago = function() {
    alert('🛒 Próximamente: enlace de pago por Mercado Pago.\n\nContactá al administrador para adquirir tu Pase Místico.');
};

// ==========================================
// IR AL EJE CONSULTA
// ==========================================
window.irAlEjeConsulta = function(modo) {
    window.modoFisicoActivo = (modo === 'manual');
    if (typeof window.mostrarPantalla === 'function') {
        window.mostrarPantalla('screen-selector');
    }
};

// ==========================================
// PUENTE / ALIAS PARA EVITAR EL REFERENCE ERROR
// ==========================================
window.verificarAccesoTarotistaFisico = function() {
    window.verificarAccesoFisico();
};

window.verificarAccesoTarotista = async function() {
    if (window.tarotiaUsuario && window.tarotiaUsuario.plan === 'Premium') {
        if (typeof window.irAlEjeConsulta === 'function') window.irAlEjeConsulta('manual');
    } else {
        const codigo = prompt("✨ El Modo Tarotista es exclusivo de TarotIA Premium.\nPor favor, ingresa tu código de acceso:");
        if (codigo) {
            const ok = await window.canjearCodigoPremium(codigo);
            if (ok && typeof window.irAlEjeConsulta === 'function') {
                window.irAlEjeConsulta('manual');
            }
        }
    }
};

// Inicializar badges al cargar
document.addEventListener('DOMContentLoaded', () => {
    if (window.tarotiaUsuario) {
        actualizarBadgeMuestrasFisicas();
    }
});        localStorage.setItem('muestrasFisicasTarot', actuales.toString());
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
// IR AL EJE CONSULTA (STUB)
// ==========================================
function irAlEjeConsulta(modo) {
    window.modoFisicoActivo = (modo === 'manual');
    if (typeof mostrarPantalla === 'function') {
        mostrarPantalla('screen-selector');
    }
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
