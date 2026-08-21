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
// ACCESO A MAZO FÍSICO (NÚCLEO DEL EMBUDO) - CORREGIDO
// ==========================================

async function verificarAccesoFisico(submodo) {
    console.log("[access.js] verificarAccesoFisico llamado, submodo:", submodo);
    
    if (window.esUsuarioPremium) {
        abrirPantallaFisico(submodo);
        return;
    }

    // ==========================================
    // PASO 1: Verificar si tiene token (ya se registró)
    // ==========================================
    const token = window.obtenerToken ? window.obtenerToken() : null;
    console.log("[access.js] Token encontrado:", token ? "SI" : "NO");
    
    if (token) {
        // Ya tiene token, usar las muestras de la nube
        const muestrasRestantes = await registrarUsoTiradaFisica();
        if (muestrasRestantes >= 0) {
            abrirPantallaFisico(submodo);
        } else {
            lanzarMuroDePago();
        }
        return;
    }

    // ==========================================
    // PASO 2: NO tiene token → PEDIR EMAIL
    // ==========================================
    console.log("[access.js] No hay token, pidiendo email...");
    
    // Preguntar si el usuario quiere registrarse (opcional: dar 2 gratis si dice que no)
    const respuesta = confirm(
        "🔮 Para acceder al Mazo Físico necesitás registrarte con tu email.\n\n" +
        "✅ 'Aceptar' → Ingresar tu email y obtener 5 tiradas gratuitas en la nube.\n" +
        "❌ 'Cancelar' → Usar 2 tiradas gratuitas sin registro (solo en este dispositivo)."
    );
    
    if (!respuesta) {
        // Usuario eligió NO registrarse → dar 2 tiradas locales
        const libresUsadas = obtenerTiradasLibresLocalesUsadas();
        if (libresUsadas < TIRADAS_LIBRES_LOCALES) {
            registrarTiradaLibreLocalUsada();
            console.log(`✨ Tirada libre local usada (${libresUsadas + 1}/${TIRADAS_LIBRES_LOCALES})`);
            abrirPantallaFisico(submodo);
        } else {
            // Ya gastó las 2 gratis, ahora SÍ o SÍ debe registrarse
            alert("🔒 Has agotado tus 2 tiradas gratuitas locales.\n\nPara continuar, debes registrarte con tu email.");
            await pedirEmailYRegistrar(submodo);
        }
        return;
    }

    // Usuario aceptó registrarse
    await pedirEmailYRegistrar(submodo);
}

// ==========================================
// FUNCIÓN AUXILIAR: Pedir email y registrar
// ==========================================

async function pedirEmailYRegistrar(submodo) {
    const emailInput = prompt(
        "📧 Ingresa tu correo electrónico para desbloquear 5 tiradas gratuitas:\n\n" +
        "(Tu correo solo se usa para guardar tu progreso y activar tu cuenta)"
    );
    
    if (!emailInput) {
        alert("⚠️ El correo es necesario para continuar con las lecturas gratuitas.");
        // Volver a intentar
        await pedirEmailYRegistrar(submodo);
        return;
    }
    
    if (!emailInput.includes('@') || !emailInput.includes('.')) {
        alert("⚠️ Por favor, ingresa un correo electrónico válido.");
        await pedirEmailYRegistrar(submodo);
        return;
    }

    // Registrar en el backend
    if (typeof window.autenticarUsuario === 'function') {
        try {
            const resultado = await window.autenticarUsuario("Consultante", emailInput.trim().toLowerCase());
            if (resultado && resultado.exito) {
                alert("✅ ¡Correo registrado con éxito! Tienes 5 tiradas gratuitas en la nube.");
                // Ahora tiene token, reintentar el acceso
                await verificarAccesoFisico(submodo);
            } else {
                alert("❌ No se pudo registrar el correo. Error: " + (resultado?.mensaje || "desconocido"));
                // Reintentar
                await pedirEmailYRegistrar(submodo);
            }
        } catch (e) {
            console.error("Error al autenticar:", e);
            alert("❌ Error de conexión. Intenta de nuevo.");
            await pedirEmailYRegistrar(submodo);
        }
    } else {
        alert("⚠️ Sistema de autenticación no disponible. Recarga la página.");
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

console.log("[access.js] Flujo progresivo corregido: PRIMERO pide email, después da gratis si rechaza");
