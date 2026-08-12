// ==========================================
// CONTROL DE ACCESOS Y MUESTRAS FISICAS (SOLO LOCAL)
// ==========================================

var MAX_MUESTRAS = 5;

var CODIGOS_PREMIUM_VALIDOS = [
    'ADMIN2026',
    'PASEMISTICO',
    'TAROTGRATIS'
];

// ==========================================
// VERIFICAR ACCESO A MAZO FISICO
// ==========================================
window.verificarAccesoFisico = function() {
    console.log('verificarAccesoFisico llamado');

    var esPremium = localStorage.getItem('simularPremium') === 'true';
    var muestras = obtenerMuestrasFisicasRestantes();

    if (esPremium) {
        console.log('Premium activo, acceso directo');
        abrirModoFisico();
        return;
    }

    if (muestras > 0) {
        console.log('Muestras restantes: ' + muestras);
        abrirModoFisico();
    } else {
        var codigo = prompt("Has agotado tus 5 muestras gratuitas de Mazo Fisico.\n\nIngresa tu codigo de acceso Premium:");
        if (codigo) {
            var ok = canjearCodigoPremium(codigo);
            if (ok) abrirModoFisico();
        }
    }
};

function obtenerMuestrasFisicasRestantes() {
    var muestras = localStorage.getItem('muestrasFisicasTarot');
    if (muestras === null) {
        localStorage.setItem('muestrasFisicasTarot', MAX_MUESTRAS.toString());
        return MAX_MUESTRAS;
    }
    return parseInt(muestras, 10) || 0;
}

function registrarUsoTiradaFisica() {
    if (localStorage.getItem('simularPremium') === 'true') return;
    var actuales = obtenerMuestrasFisicasRestantes();
    if (actuales > 0) {
        actuales--;
        localStorage.setItem('muestrasFisicasTarot', actuales.toString());
        actualizarBadgeMuestrasFisicas();
    }
}

function canjearCodigoPremium(codigo) {
    if (!codigo) return false;
    var codigoLimpio = codigo.trim().toUpperCase();
    if (CODIGOS_PREMIUM_VALIDOS.indexOf(codigoLimpio) !== -1) {
        localStorage.setItem('simularPremium', 'true');
        alert('Codigo premium activado con exito. Ahora tenes acceso ilimitado.');
        actualizarBadgeMuestrasFisicas();
        return true;
    } else {
        alert('Codigo invalido o expirado.');
        return false;
    }
}

function abrirModoFisico() {
    console.log('abrirModoFisico');
    if (typeof window.abrirSeleccionFisico === 'function') {
        window.abrirSeleccionFisico('predictivo_fisico');
    } else if (typeof window.mostrarPantalla === 'function') {
        window.mostrarPantalla('screen-fisico');
    } else {
        console.error('ERROR: No existe mostrarPantalla');
    }
}

// ==========================================
// ACTUALIZAR BADGE
// ==========================================
window.actualizarBadgeMuestrasFisicas = function() {
    var badge = document.getElementById('badge-physic-muestra-prof')
               || document.getElementById('badge-fisico-muestra-prof')
               || document.getElementById('badge-fisico-muestra');

    if (!badge) return;

    if (localStorage.getItem('simularPremium') === 'true') {
        badge.innerText = "Ilimitado";
        badge.style.borderColor = "#a78bfa";
    } else {
        var restantes = obtenerMuestrasFisicasRestantes();
        badge.innerText = restantes > 0 ? restantes + " Muestras" : "Agotado";
    }
};

// ==========================================
// MERCADO PAGO
// ==========================================
window.abrirMercadoPago = function() {
    alert('Proximamente: enlace de pago por Mercado Pago.\n\nContacta al administrador para adquirir tu Pase Mistico.');
};

// ==========================================
// PUENTES / ALIAS
// ==========================================
window.verificarAccesoTarotistaFisico = function() {
    window.verificarAccesoFisico();
};

window.verificarAccesoTarotista = function() {
    if (localStorage.getItem('simularPremium') === 'true') {
        if (typeof window.irAlEjeConsulta === 'function') window.irAlEjeConsulta('manual');
    } else {
        var codigo = prompt("El Modo Tarotista es exclusivo de TarotIA Premium.\nPor favor, ingresa tu codigo de acceso:");
        if (codigo) {
            var ok = canjearCodigoPremium(codigo);
            if (ok && typeof window.irAlEjeConsulta === 'function') {
                window.irAlEjeConsulta('manual');
            }
        }
    }
};

window.irAlEjeConsulta = function(modo) {
    window.modoFisicoActivo = (modo === 'manual');
    if (typeof window.mostrarPantalla === 'function') {
        window.mostrarPantalla('screen-selector');
    }
};

// Inicializar badges al cargar
document.addEventListener('DOMContentLoaded', function() {
    actualizarBadgeMuestrasFisicas();
});
