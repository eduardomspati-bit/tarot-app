
// ==========================================
// CONTROL DE ACCESOS Y MUESTRAS FÍSICAS
// ==========================================

const MAX_MUESTRAS = 5;

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
    const badge = document.getElementById('badge-physic-muestra-prof') || document.getElementById('badge-fisico-muestra-prof') || document.getElementById('badge-fisico-muestra');
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

// ==========================================
// ACCESO A MAZO FÍSICO (SIN LÍMITE DE MUESTRAS)
// ==========================================

function verificarAccesoFisico() {
    // Ingreso directo sin validación de muestras gratis ni pase premium
    if (typeof inicializarYMostrarPantallaFisica === 'function') {
        inicializarYMostrarPantallaFisica();
    } else if (typeof mostrarPantalla === 'function') {
        mostrarPantalla('screen-selector');
    }
}

// Desactivar o limpiar la actualización del badge de muestras
function actualizarBadgeMuestrasFisicas() {
    const badge = document.getElementById('badge-physic-muestra-prof') 
               || document.getElementById('badge-fisico-muestra-prof') 
               || document.getElementById('badge-fisico-muestra');
               
    if (badge) {
        badge.style.display = 'none'; // Oculta la etiqueta de "5 Muestras" en la interfaz
    }
}
}

// ==========================================
// PUENTE / ALIAS PARA EVITAR EL REFERENCE ERROR
// ==========================================
function verificarAccesoTarotistaFisico() {
    // Redirige la llamada de tu index.html hacia la función de Mazo Físico
    verificarAccesoFisico();
}
