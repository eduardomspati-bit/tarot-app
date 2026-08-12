// ==========================================
// CONTROL DE ACCESOS Y MUESTRAS FÍSICAS
// ==========================================

const MAX_MUESTRAS = 5;

// Códigos premium válidos (fallback local)
const CODIGOS_PREMIUM_VALIDOS = [
    'ADMIN2026',
    'PASEMISTICO',
    'TAROTGRATIS'
];

// ==========================================
// VERIFICAR ACCESO A MAZO FÍSICO
// ==========================================
window.verificarAccesoFisico = async function() {
    console.log('🔍 verificarAccesoFisico llamado');
    console.log('  tarotiaToken:', !!window.tarotiaToken);
    console.log('  tarotiaUsuario:', window.tarotiaUsuario);

    // 1. Si NO hay sesión de servidor, usar sistema local (fallback)
    if (!window.tarotiaToken) {
        console.log('  → No hay token, usando sistema local');
        verificarAccesoFisicoLocal();
        return;
    }

    // 2. Hay token: intentar verificar en servidor
    try {
        console.log('  → Hay token, consultando servidor...');
        await window.cargarPerfil();

        if (!window.tarotiaUsuario) {
            console.log('  → Perfil no cargado, fallback local');
            verificarAccesoFisicoLocal();
            return;
        }

        // Es Premium
        if (window.tarotiaUsuario.plan === 'Premium') {
            console.log('  → Usuario Premium, acceso directo');
            abrirModoFisico();
            return;
        }

        // Es Gratis: verificar muestras
        const muestras = window.tarotiaUsuario.muestrasFisicasRestantes || 0;
        console.log('  → Muestras restantes:', muestras);

        if (muestras > 0) {
            abrirModoFisico();
        } else {
            const codigo = prompt("🔒 Has agotado tus 5 muestras gratuitas de Mazo Físico.\n\nIngresa tu código de acceso Premium:");
            if (codigo) {
                const ok = await window.canjearCodigoPremiumServer(codigo);
                if (ok) abrirModoFisico();
            }
        }
    } catch (error) {
        console.error('  → Error con servidor:', error);
        console.log('  → Fallback a sistema local');
        verificarAccesoFisicoLocal();
    }
};

// ==========================================
// FALLBACK LOCAL (sin servidor)
// ==========================================
function verificarAccesoFisicoLocal() {
    console.log('🔍 verificarAccesoFisicoLocal');

    // Verificar premium local
    const esPremiumLocal = localStorage.getItem('simularPremium') === 'true';
    if (esPremiumLocal) {
        console.log('  → Premium local activado');
        abrirModoFisico();
        return;
    }

    // Verificar muestras locales
    const muestras = obtenerMuestrasFisicasRestantes();
    console.log('  → Muestras locales restantes:', muestras);

    if (muestras > 0) {
        abrirModoFisico();
    } else {
        const codigo = prompt("🔒 Has agotado tus 5 muestras gratuitas de Mazo Físico.\n\nIngresa tu código de acceso Premium:");
        if (codigo) {
            const ok = canjearCodigoPremiumLocal(codigo);
            if (ok) abrirModoFisico();
        }
    }
}

function obtenerMuestrasFisicasRestantes() {
    let muestras = localStorage.getItem('muestrasFisicasTarot');
    if (muestras === null) {
        localStorage.setItem('muestrasFisicasTarot', MAX_MUESTRAS.toString());
        return MAX_MUESTRAS;
    }
    return parseInt(muestras, 10) || 0;
}

function registrarUsoTiradaFisicaLocal() {
    if (localStorage.getItem('simularPremium') === 'true') return;
    let actuales = obtenerMuestrasFisicasRestantes();
    if (actuales > 0) {
        actuales--;
        localStorage.setItem('muestrasFisicasTarot', actuales.toString());
        actualizarBadgeMuestrasFisicas();
    }
}

function canjearCodigoPremiumLocal(codigo) {
    if (!codigo) return false;
    const codigoLimpio = codigo.trim().toUpperCase();
    if (CODIGOS_PREMIUM_VALIDOS.includes(codigoLimpio)) {
        localStorage.setItem('simularPremium', 'true');
        alert('✨ ¡Código premium activado con éxito!');
        actualizarBadgeMuestrasFisicas();
        return true;
    } else {
        alert('❌ Código inválido o expirado.');
        return false;
    }
}

// ==========================================
// ABRIR MODO FÍSICO
// ==========================================
function abrirModoFisico() {
    console.log('🔍 abrirModoFisico');
    if (typeof window.abrirSeleccionFisico === 'function') {
        console.log('  → Llamando abrirSeleccionFisico');
        window.abrirSeleccionFisico('predictivo_fisico');
    } else if (typeof window.mostrarPantalla === 'function') {
        console.log('  → Llamando mostrarPantalla(screen-fisico)');
        window.mostrarPantalla('screen-fisico');
    } else {
        console.error('  → ERROR: No existe mostrarPantalla ni abrirSeleccionFisico');
        alert('Error: No se pudo abrir el mazo físico. Recargá la página.');
    }
}

// ==========================================
// REGISTRAR USO DE TIRADA FÍSICA
// ==========================================
window.registrarUsoTiradaFisica = async function() {
    // Intentar servidor primero
    if (window.tarotiaToken && window.tarotiaUsuario && window.tarotiaUsuario.plan !== 'Premium') {
        try {
            const data = await window.usarMuestraFisicaServer();
            if (window.tarotiaUsuario && data.muestrasRestantes !== undefined) {
                window.tarotiaUsuario.muestrasFisicasRestantes = data.muestrasRestantes;
            }
            return;
        } catch (e) {
            console.log('Error servidor, usando local:', e);
        }
    }
    // Fallback local
    registrarUsoTiradaFisicaLocal();
};

// ==========================================
// ACTUALIZAR BADGE
// ==========================================
window.actualizarBadgeMuestrasFisicas = function() {
    const badge = document.getElementById('badge-physic-muestra-prof')
               || document.getElementById('badge-fisico-muestra-prof')
               || document.getElementById('badge-fisico-muestra');

    if (!badge) return;

    // Prioridad: servidor
    if (window.tarotiaUsuario) {
        if (window.tarotiaUsuario.plan === 'Premium') {
            badge.innerText = "Ilimitado ✨";
            badge.style.borderColor = "#a78bfa";
        } else {
            const restantes = window.tarotiaUsuario.muestrasFisicasRestantes || 0;
            badge.innerText = restantes > 0 ? `${restantes} Muestras` : "Agotado 🔒";
        }
        return;
    }

    // Fallback local
    if (localStorage.getItem('simularPremium') === 'true') {
        badge.innerText = "Ilimitado ✨";
        badge.style.borderColor = "#a78bfa";
    } else {
        const restantes = obtenerMuestrasFisicasRestantes();
        badge.innerText = restantes > 0 ? `${restantes} Muestras` : "Agotado 🔒";
    }
};

// ==========================================
// CANJEAR CÓDIGO PREMIUM (unificado)
// ==========================================
window.canjearCodigoPremium = async function(codigo) {
    if (!codigo) return false;

    // Si hay sesión de servidor, intentar ahí primero
    if (window.tarotiaToken) {
        return await window.canjearCodigoPremiumServer(codigo);
    }

    // Fallback local
    return canjearCodigoPremiumLocal(codigo);
};

// ==========================================
// MERCADO PAGO
// ==========================================
window.abrirMercadoPago = function() {
    alert('🛒 Próximamente: enlace de pago por Mercado Pago.\n\nContactá al administrador para adquirir tu Pase Místico.');
};

// ==========================================
// PUENTES / ALIAS
// ==========================================
window.verificarAccesoTarotistaFisico = function() {
    window.verificarAccesoFisico();
};

window.verificarAccesoTarotista = async function() {
    // Si hay sesión premium en servidor
    if (window.tarotiaUsuario && window.tarotiaUsuario.plan === 'Premium') {
        if (typeof window.irAlEjeConsulta === 'function') window.irAlEjeConsulta('manual');
        return;
    }
    // Fallback local
    if (localStorage.getItem('simularPremium') === 'true') {
        if (typeof window.irAlEjeConsulta === 'function') window.irAlEjeConsulta('manual');
        return;
    }

    const codigo = prompt("✨ El Modo Tarotista es exclusivo de TarotIA Premium.\nPor favor, ingresa tu código de acceso:");
    if (codigo) {
        const ok = await window.canjearCodigoPremium(codigo);
        if (ok && typeof window.irAlEjeConsulta === 'function') {
            window.irAlEjeConsulta('manual');
        }
    }
};

// Inicializar badges al cargar
document.addEventListener('DOMContentLoaded', () => {
    actualizarBadgeMuestrasFisicas();
});
