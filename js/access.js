// ==========================================
// CONTROL DE ACCESOS, AUTENTICACIÓN Y MUESTRAS FÍSICAS
// ==========================================

const TIRADAS_LIBRES_LOCALES = 2;

function obtenerTiradasLibresLocalesUsadas() {
    let usadas = localStorage.getItem('tarotia_libres_usadas');
    return usadas ? parseInt(usadas, 10) : 0;
}

function registrarTiradaLibreLocalUsada() {
    let usadas = obtenerTiradasLibresLocalesUsadas();
    localStorage.setItem('tarotia_libres_usadas', usadas + 1);
}

async function obtenerMuestrasFisicasRestantes() {
    if (window.esUsuarioPremium) return 999;

    const token = window.obtenerToken ? window.obtenerToken() : null;
    const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined')
        ? window.SERVIDOR_URL.replace('/tirada', '')
        : 'https://tarot-613b.onrender.com';

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

    const libresRestantes = Math.max(0, TIRADAS_LIBRES_LOCALES - obtenerTiradasLibresLocalesUsadas());
    return libresRestantes;
}

async function registrarUsoTiradaFisica() {
    if (window.esUsuarioPremium) return 999;

    const token = window.obtenerToken ? window.obtenerToken() : null;
    const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined')
        ? window.SERVIDOR_URL.replace('/tirada', '')
        : 'https://tarot-613b.onrender.com';

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
            } else {
                const data = await resp.json().catch(() => ({}));
                console.warn("⚠️ Servidor respondió:", resp.status, data.error);
                return -1;
            }
        } catch (e) {
            console.error("Error al registrar muestra en MongoDB:", e);
            return -1;
        }
    }
    return -1;
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

function canjearCodigoPremium(codigo) {
    if (!codigo) return;
    const codigoLimpio = codigo.trim().toUpperCase();

    if (typeof CODIGOS_PREMIUM_VALIDOS !== 'undefined' && CODIGOS_PREMIUM_VALIDOS.includes(codigoLimpio)) {
        window.esUsuarioPremium = true;
        localStorage.setItem('simularPremium', 'true');
        localStorage.setItem('tarotia_plan_premium', 'true');
        alert('✨ ¡Código premium activado con éxito! Ahora tenés acceso ilimitado.');
        actualizarBadgeMuestrasFisicas();
    } else {
        alert('❌ Código inválido o expirado. Probá con otro o contactá al administrador.');
    }
}

window.abrirMercadoPago = function() {
    window.open('https://link.mercadopago.com.ar/TULINKDEMP', '_blank');
};

// ==========================================
// ACCESO A MAZO FÍSICO (NÚCLEO DEL EMBUDO)
// ==========================================
async function verificarAccesoFisico(submodo) {
    if (window.esUsuarioPremium) {
        abrirPantallaFisico(submodo);
        return;
    }

    // 1. ¿Le quedan tiradas libres locales (las primeras 2 sin registro)?
    const libresUsadas = obtenerTiradasLibresLocalesUsadas();
    if (libresUsadas < TIRADAS_LIBRES_LOCALES) {
        registrarTiradaLibreLocalUsada();
        console.log(`✨ Tirada libre local usada (${libresUsadas + 1}/${TIRADAS_LIBRES_LOCALES})`);
        abrirPantallaFisico(submodo);
        return;
    }

    // 2. Ya gastó las 2 libres. ¿Tiene token (dejó su email)?
    const token = window.obtenerToken ? window.obtenerToken() : null;
    if (!token) {
        const emailInput = prompt("✨ ¡Has disfrutado tus 2 lecturas de cortesía!\n\nIngresa tu correo electrónico para desbloquear 3 tiradas gratuitas adicionales y continuar:");
        if (emailInput && emailInput.includes('@') && emailInput.includes('.')) {
            if (typeof window.autenticarUsuario === 'function') {
                const resultado = await window.autenticarUsuario("Consultante", emailInput.trim().toLowerCase());
                if (resultado && resultado.exito) {
                    alert("¡Correo registrado con éxito! Tienes 3 tiradas adicionales en la nube.");
                    abrirPantallaFisico(submodo);
                } else {
                    alert("No se pudo registrar el correo. Intenta de nuevo.");
                }
            } else {
                alert("⚠️ Sistema de autenticación no disponible. Recarga la página.");
            }
        } else if (emailInput !== null) {
            alert("Se requiere un correo válido para continuar con las lecturas gratuitas.");
        }
        return;
    }

    // 3. Ya tiene token: consultamos y descontamos en MongoDB (las 3 de la nube)
    const muestrasRestantes = await registrarUsoTiradaFisica();
    if (muestrasRestantes >= 0) {
        abrirPantallaFisico(submodo);
    } else {
        lanzarMuroDePago();
    }
}

function abrirPantallaFisico(submodo) {
    window.modoFisicoActivo = true;
    window.submodoFisicoActual = submodo;
    localStorage.setItem('tarotia_submodo_fisico', submodo);
    window.cartasFisicoSeleccionadas = null;
    window.preguntaCustomSeleccionada = "";
    if (typeof window.cargarSelectoresFisicos === 'function') window.cargarSelectoresFisicos();
    if (typeof window.mostrarPantalla === 'function') window.mostrarPantalla('screen-fisico');
}

function lanzarMuroDePago() {
    const codigo = prompt("🔒 Has agotado tus muestras gratuitas totales.\n\nIngresa tu código de acceso Premium o pulsa Aceptar para adquirir tu Pase Místico por Mercado Pago:");
    if (codigo) {
        canjearCodigoPremium(codigo);
    } else {
        window.abrirMercadoPago();
    }
}

function verificarAccesoTarotistaFisico() {
    verificarAccesoFisico('tarotista_fisico');
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
    const token = window.obtenerToken ? window.obtenerToken() : null;
    if (!token) return;

    try {
        const API_BASE = 'https://tarot-613b.onrender.com';
        const resp = await fetch(`${API_BASE}/api/auth/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resp.ok) {
            const data = await resp.json();
            window.esUsuarioPremium = (data.usuario.plan === 'Premium');
            actualizarBadgeMuestrasFisicas();
        }
    } catch (e) {
        console.warn("No se pudo verificar el estado en el servidor.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    verificarEstadoReal(); 
    actualizarBadgeMuestrasFisicas(); 
});

console.log("[access.js] Flujo progresivo (2 libres -> Email -> Cloud -> Pago) sincronizado correctamente");
