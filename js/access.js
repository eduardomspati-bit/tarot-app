// ==========================================
// ACCESS.JS v9 - Control de accesos ROBUSTO
// ==========================================

const TIRADAS_LIBRES_SIN_REGISTRO = 2;
const TIRADAS_POR_REGISTRO = 5;
const MAX_MUESTRAS_FISICAS = 5;

// ==========================================
// CONTADOR EN MEMORIA (backup si localStorage falla)
// ==========================================
window._tarotiaMemoria = window._tarotiaMemoria || {
    libresUsadas: 0,
    registradasUsadas: 0
};

// ==========================================
// LOCALSTORAGE ROBUSTO
// ==========================================

function _lsSet(key, value) {
    try {
        localStorage.setItem(key, String(value));
        return true;
    } catch (e) {
        console.warn("[access] localStorage bloqueado/lleno:", key);
        return false;
    }
}

function _lsGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        return null;
    }
}

function _lsRemove(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {}
}

// ==========================================
// CONTADORES LOCALES
// ==========================================

function obtenerTiradasLibresLocalesUsadas() {
    const val = _lsGet('tarotia_libres_usadas');
    if (val !== null) {
        const n = parseInt(val, 10);
        if (!isNaN(n)) return n;
    }
    // Fallback a memoria
    return window._tarotiaMemoria.libresUsadas || 0;
}

function registrarTiradaLibreLocalUsada() {
    const actuales = obtenerTiradasLibresLocalesUsadas();
    const nuevo = actuales + 1;
    const guardado = _lsSet('tarotia_libres_usadas', nuevo);
    if (!guardado) {
        window._tarotiaMemoria.libresUsadas = nuevo;
    }
    console.log('[access] Tirada libre registrada:', nuevo, '/', TIRADAS_LIBRES_SIN_REGISTRO);
    return nuevo;
}

function obtenerTiradasRegistradasUsadas() {
    const val = _lsGet('tarotia_registradas_usadas');
    if (val !== null) {
        const n = parseInt(val, 10);
        if (!isNaN(n)) return n;
    }
    return window._tarotiaMemoria.registradasUsadas || 0;
}

function registrarTiradaRegistradaUsada() {
    const actuales = obtenerTiradasRegistradasUsadas();
    const nuevo = actuales + 1;
    const guardado = _lsSet('tarotia_registradas_usadas', nuevo);
    if (!guardado) {
        window._tarotiaMemoria.registradasUsadas = nuevo;
    }
    return nuevo;
}

// ==========================================
// MUESTRAS RESTANTES
// ==========================================

async function obtenerMuestrasRestantesGlobal() {
    if (window.esUsuarioPremium) return 999;

    const token = window.obtenerToken ? window.obtenerToken() : null;
    const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined' && window.SERVIDOR_URL)
        ? window.SERVIDOR_URL.replace('/tirada', '').replace(/\/$/, '')
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
            console.warn("[access] Servidor offline, usando contador local.");
        }
    }

    const libresRestantes = Math.max(0, TIRADAS_LIBRES_SIN_REGISTRO - obtenerTiradasLibresLocalesUsadas());
    return libresRestantes;
}

// ==========================================
// REGISTRAR USO (ESTRICTO)
// ==========================================

// ==========================================
// VERIFICACIÓN ESTRICTA DESDE EL SERVIDOR
// ==========================================

async function verificarEstadoReal() {
    const token = window.obtenerToken ? window.obtenerToken() : null;
    
    // Por defecto, asumimos que NO es premium hasta que el servidor diga lo contrario
    window.esUsuarioPremium = false; 

    if (!token) {
        await actualizarBadgeGlobal();
        return;
    }

    try {
        const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined' && window.SERVIDOR_URL)
            ? window.SERVIDOR_URL.replace('/tirada', '').replace(/\/$/, '')
            : 'https://tarot-613b.onrender.com';

        const resp = await fetch(`${API_BASE}/api/auth/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resp.ok) {
            const data = await resp.json();
            // El servidor decide si sigue siendo Premium según la base de datos
            window.esUsuarioPremium = (data.usuario?.plan === 'Premium');
        } else {
            // Si el token expiró o el servidor rechaza la sesión, chau privilegios
            window.esUsuarioPremium = false;
        }
    } catch (e) {
        console.warn("[access] Sin conexión con el servidor. Por seguridad, se niega el estatus premium local.");
        window.esUsuarioPremium = false; // Nunca regales acceso si no se puede validar con la nube
    }

    await actualizarBadgeGlobal();
}

// ==========================================
// BADGE
// ==========================================

async function actualizarBadgeGlobal() {
    const badges = [
        document.getElementById('badge-magico'),
        document.getElementById('badge-filosofico'),
        document.getElementById('badge-profesional'),
        document.getElementById('badge-fisico-muestra')
    ].filter(Boolean);

    const restantes = await obtenerMuestrasRestantesGlobal();
    const token = window.obtenerToken ? window.obtenerToken() : null;

    let texto = "";
    let color = "";

    if (window.esUsuarioPremium) {
        texto = "Ilimitado ✨";
        color = "#a78bfa";
    } else if (token) {
        texto = `📧 ${restantes} lecturas`;
        color = "#60a5fa";
    } else {
        texto = restantes > 0 ? `🃏 ${restantes} gratis` : "Sin muestras 🔒";
        color = restantes > 0 ? "#fbbf24" : "#ef4444";
    }

    badges.forEach(badge => {
        badge.innerText = texto;
        badge.style.borderColor = color;
    });
}

// ==========================================
// FLUJO PRINCIPAL (ESTRICTO)
// ==========================================

async function verificarAccesoGlobal(modo, submodo) {
    console.log(`[access] verificarAccesoGlobal: modo=${modo}, submodo=${submodo}`);

    // 1. Premium = pase directo
    if (window.esUsuarioPremium) {
        console.log('[access] Usuario Premium, acceso directo');
        abrirModo(modo, submodo);
        return;
    }

    const token = window.obtenerToken ? window.obtenerToken() : null;

    // 2. Con token: consultar servidor
    if (token) {
        const restantes = await registrarUsoTiradaGlobal();
        if (restantes >= 0) {
            abrirModo(modo, submodo);
            return;
        } else if (restantes === -2) {
            // Sin conexión: usar contador local como fallback temporal
            console.warn('[access] Sin conexión, usando contador local temporal');
            const libresUsadas = obtenerTiradasLibresLocalesUsadas();
            if (libresUsadas < TIRADAS_LIBRES_SIN_REGISTRO) {
                registrarTiradaLibreLocalUsada();
                abrirModo(modo, submodo);
                return;
            }
        }
        lanzarMuroDePago();
        return;
    }

    // 3. Sin token: contador local estricto
    const libresUsadas = obtenerTiradasLibresLocalesUsadas();
    console.log(`[access] Tiradas usadas: ${libresUsadas}/${TIRADAS_LIBRES_SIN_REGISTRO}`);

    if (libresUsadas < TIRADAS_LIBRES_SIN_REGISTRO) {
        const nuevo = registrarTiradaLibreLocalUsada();
        console.log(`[access] Acceso permitido. Quedan: ${TIRADAS_LIBRES_SIN_REGISTRO - nuevo}`);
        abrirModo(modo, submodo);
    } else {
        // Agotadas
        console.log('[access] Muestras agotadas. Mostrando muro.');
        const quiereRegistrarse = confirm(
            "🔒 Has usado tus 2 lecturas gratuitas.\n\n" +
            "¿Querés registrarte con tu email para obtener 5 lecturas más?\n\n" +
            "✅ Aceptar → Registrarte\n" +
            "❌ Cancelar → Volver al menú"
        );
        if (quiereRegistrarse) {
            await pedirEmailYRegistrar(modo, submodo);
        } else {
            window.mostrarPantalla('screen-portada');
        }
    }
}

// ==========================================
// REGISTRO
// ==========================================

async function pedirEmailYRegistrar(modo, submodo) {
    const emailInput = prompt(
        "📧 ¡Bienvenido a TarotIA!\n\n" +
        "Ingresa tu correo electrónico para desbloquear 5 lecturas gratuitas:"
    );

    if (!emailInput || emailInput === null) {
        window.mostrarPantalla('screen-portada');
        return;
    }

    if (!emailInput.includes('@') || !emailInput.includes('.')) {
        alert("⚠️ Correo inválido.");
        await pedirEmailYRegistrar(modo, submodo);
        return;
    }

    if (typeof window.autenticarUsuario === 'function') {
        try {
            const resultado = await window.autenticarUsuario("Consultante", emailInput.trim().toLowerCase());
            if (resultado && resultado.exito) {
                alert("✅ ¡Correo registrado! Tienes 5 lecturas gratuitas.");
                await actualizarBadgeGlobal();
                await verificarAccesoGlobal(modo, submodo);
            } else {
                alert("❌ No se pudo registrar: " + (resultado?.mensaje || "Error desconocido"));
                window.mostrarPantalla('screen-portada');
            }
        } catch (e) {
            console.error("Error al autenticar:", e);
            alert("❌ Error de conexión. Intenta de nuevo.");
            window.mostrarPantalla('screen-portada');
        }
    } else {
        alert("⚠️ Sistema de autenticación no disponible.");
        window.mostrarPantalla('screen-portada');
    }
}

// ==========================================
// ABRIR MODO
// ==========================================

function abrirModo(modo, submodo) {
    console.log(`[access] abrirModo: ${modo}, ${submodo}`);

    if (modo === 'fisico') {
        window.modoFisicoActivo = true;
        window.submodoFisicoActual = submodo || 'predictivo_fisico';
        localStorage.setItem('tarotia_submodo_fisico', submodo || 'predictivo_fisico');
        window.cartasFisicoSeleccionadas = null;
        window.preguntaCustomSeleccionada = "";
        if (typeof window.cargarSelectoresFisicos === 'function') window.cargarSelectoresFisicos();
        window.mostrarPantalla('screen-fisico');
    } else if (modo === 'selector') {
        window.modoFisicoActivo = false;
        window.estiloSeleccionado = submodo || 'magico';
        window.preguntaCustomSeleccionada = "";
        window.mostrarPantalla('screen-selector');
    } else if (modo === 'portada') {
        window.mostrarPantalla('screen-portada');
    }
}

// ==========================================
// MURO DE PAGO
// ==========================================

function lanzarMuroDePago() {
    const codigo = prompt(
        "🔒 Has agotado tus lecturas gratuitas.\n\n" +
        "Ingresá tu código de acceso Premium, o dejalo vacío para comprar:"
    );

    if (codigo === null) {
        window.mostrarPantalla('screen-portada');
        return;
    }

    if (codigo.trim()) {
        canjearCodigoPremium(codigo.trim());
    } else {
        window.abrirMercadoPago();
    }
}

function canjearCodigoPremium(codigo) {
    if (!codigo) return;
    const codigoLimpio = codigo.trim().toUpperCase();
    const CODIGOS_VALIDOS = ['ADMIN2026', 'PASEMISTICO', 'TAROTGRATIS'];

    if (CODIGOS_VALIDOS.includes(codigoLimpio)) {
        window.esUsuarioPremium = true;
        try {
            localStorage.setItem('simularPremium', 'true');
            localStorage.setItem('tarotia_plan_premium', 'true');
        } catch (e) {}
        alert('✨ ¡Código premium activado! Acceso ilimitado.');
        actualizarBadgeGlobal();
        window.mostrarPantalla('screen-portada');
    } else {
        alert('❌ Código inválido o expirado.');
        lanzarMuroDePago();
    }
}

window.abrirMercadoPago = function() {
    window.open('https://link.mercadopago.com.ar/TULINKDEMP', '_blank');
};

// ==========================================
// EXPUESTAS AL HTML
// ==========================================

window.verificarAccesoFisico = function(submodo) {
    verificarAccesoGlobal('fisico', submodo);
};

window.verificarAccesoEstilo = function(estilo) {
    verificarAccesoGlobal('selector', estilo);
};

window.verificarAccesoPortada = function() {
    const token = window.obtenerToken ? window.obtenerToken() : null;
    if (token) {
        window.mostrarPantalla('screen-portada');
    } else {
        verificarAccesoGlobal('portada', null);
    }
};

window.verificarAccesoTarotista = function() {
    if (window.esUsuarioPremium) {
        if (typeof irAlEjeConsulta === 'function') irAlEjeConsulta('manual');
    } else {
        const codigo = prompt("✨ Modo Tarotista exclusivo Premium.\nIngresa tu código:");
        if (codigo) canjearCodigoPremium(codigo);
    }
};

window.verificarAccesoTarotistaFisico = function() {
    verificarAccesoGlobal('fisico', 'tarotista_fisico');
};

// ==========================================
// DEBUG - Ver estado de muestras
// ==========================================

window.debugMuestras = function() {
    const token = window.obtenerToken ? window.obtenerToken() : null;
    const libresUsadas = obtenerTiradasLibresLocalesUsadas();
    const libresRestantes = Math.max(0, TIRADAS_LIBRES_SIN_REGISTRO - libresUsadas);
    const premium = window.esUsuarioPremium;
    const plan = _lsGet('tarotia_plan_premium');

    console.log('=== DEBUG MUESTRAS ===');
    console.log('Token:', token ? 'Sí' : 'No');
    console.log('Premium (window):', premium);
    console.log('Premium (localStorage):', plan);
    console.log('Tiradas libres usadas:', libresUsadas);
    console.log('Tiradas libres restantes:', libresRestantes);
    console.log('Memoria backup:', window._tarotiaMemoria);
    console.log('======================');

    alert(
        `🔍 Estado de muestras:\n` +
        `Premium: ${premium ? 'Sí ✨' : 'No'}\n` +
        `Token: ${token ? 'Sí' : 'No'}\n` +
        `Gratis usadas: ${libresUsadas}/${TIRADAS_LIBRES_SIN_REGISTRO}\n` +
        `Gratis restantes: ${libresRestantes}\n\n` +
        `Abrí la consola (F12) para más detalles.`
    );
};

// ==========================================
// INICIALIZACIÓN
// ==========================================

async function verificarEstadoReal() {
    const token = window.obtenerToken ? window.obtenerToken() : null;
    if (!token) return;

    try {
        const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined' && window.SERVIDOR_URL)
            ? window.SERVIDOR_URL.replace('/tirada', '').replace(/\/$/, '')
            : 'https://tarot-613b.onrender.com';

        const resp = await fetch(`${API_BASE}/api/auth/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resp.ok) {
            const data = await resp.json();
            window.esUsuarioPremium = (data.usuario?.plan === 'Premium');
            await actualizarBadgeGlobal();
        }
    } catch (e) {
        console.warn("[access] No se pudo verificar estado en servidor.");
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("[access] v9 inicializando...");
    await verificarEstadoReal();
    await actualizarBadgeGlobal();

    // Si hay token viejo pero no es premium, mostrar estado real
    const token = window.obtenerToken ? window.obtenerToken() : null;
    if (token && !window.esUsuarioPremium) {
        console.log('[access] Usuario logueado pero no premium. Contador en servidor.');
    }
});

console.log("[access] ✅ v9 cargado - control estricto de muestras");
