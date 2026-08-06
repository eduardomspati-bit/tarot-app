// ==========================================
// CONTROL DE ACCESOS Y MUESTRAS FÍSICAS
// ==========================================

const MAX_MUESTRAS = 5;

// Códigos premium válidos
const CODIGOS_PREMIUM_VALIDOS = [
    'ADMIN2026',
    'PASEMISTICO',
    'TAROTGRATIS'
];

// Inicializar estado premium desde localStorage al cargar
(function inicializarEstadoPremium() {
    const simulado = localStorage.getItem('simularPremium') === 'true';
    if (simulado) {
        window.esUsuarioPremium = true;
        console.log('✨ Modo Premium activado desde localStorage');
    }
})();

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
