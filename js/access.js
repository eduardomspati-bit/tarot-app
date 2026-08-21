// ==========================================
// ACCESS.JS v8 - Control de accesos corregido
// ==========================================

const TIRADAS_LIBRES_SIN_REGISTRO = 2;
const TIRADAS_POR_REGISTRO = 5;
const MAX_MUESTRAS_FISICAS = 5;

function obtenerTiradasLibresLocalesUsadas() {
    try {
        let usadas = localStorage.getItem('tarotia_libres_usadas');
        return usadas ? parseInt(usadas, 10) : 0;
    } catch (e) { return 0; }
}

function registrarTiradaLibreLocalUsada() {
    try {
        let usadas = obtenerTiradasLibresLocalesUsadas();
        localStorage.setItem('tarotia_libres_usadas', usadas + 1);
    } catch (e) { console.warn("No se pudo guardar en localStorage"); }
}

function obtenerTiradasRegistradasUsadas() {
    try {
        let usadas = localStorage.getItem('tarotia_registradas_usadas');
        return usadas ? parseInt(usadas, 10) : 0;
    } catch (e) { return 0; }
}

function registrarTiradaRegistradaUsada() {
    try {
        let usadas = obtenerTiradasRegistradasUsadas();
        localStorage.setItem('tarotia_registradas_usadas', usadas + 1);
    } catch (e) { console.warn("No se pudo guardar en localStorage"); }
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
            console.warn("⚠️ Servidor offline, usando caché local.");
        }
    }

    const libresRestantes = Math.max(0, TIRADAS_LIBRES_SIN_REGISTRO - obtenerTiradasLibresLocalesUsadas());
    return libresRestantes;
}

// ==========================================
// REGISTRAR USO
// ==========================================

async function registrarUsoTiradaGlobal() {
    if (window.esUsuarioPremium) return 999;

    const token = window.obtenerToken ? window.obtenerToken() : null;
    const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined' && window.SERVIDOR_URL)
        ? window.SERVIDOR_URL.replace('/tirada', '').replace(/\/$/, '')
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
                actualizarBadgeGlobal();
                return data.muestrasRestantes;
            } else {
                console.warn("⚠️ Servidor respondió error:", resp.status);
                // Si el servidor falla, no bloquear al usuario
                return 1;
            }
        } catch (e) {
            console.error("Error al registrar en MongoDB:", e);
            // Fallback: no bloquear si el servidor no responde
            return 1;
        }
    }

    const libresUsadas = obtenerTiradasLibresLocalesUsadas();
    if (libresUsadas < TIRADAS_LIBRES_SIN_REGISTRO) {
        registrarTiradaLibreLocalUsada();
        return TIRADAS_LIBRES_SIN_REGISTRO - (libresUsadas + 1);
    }
    
    return -1;
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
        texto = restantes > 0 ? `🃏 ${restantes} gratis` : "Regístrate 🔓";
        color = "#fbbf24";
    }

    badges.forEach(badge => {
        badge.innerText = texto;
        badge.style.borderColor = color;
    });
}

// ==========================================
// FLUJO PRINCIPAL
// ==========================================

async function verificarAccesoGlobal(modo, submodo) {
    console.log(`[access.js] verificarAccesoGlobal: modo=${modo}, submodo=${submodo}`);
    
    if (window.esUsuarioPremium) {
        abrirModo(modo, submodo);
        return;
    }

    const token = window.obtenerToken ? window.obtenerToken() : null;
    
    if (token) {
        const restantes = await registrarUsoTiradaGlobal();
        if (restantes >= 0) {
            abrirModo(modo, submodo);
            return;
        } else {
            lanzarMuroDePago();
            return;
        }
    }

    // Sin token: usar tiradas locales o registrar
    const libresUsadas = obtenerTiradasLibresLocalesUsadas();
    if (libresUsadas < TIRADAS_LIBRES_SIN_REGISTRO) {
        // Aún tiene gratis locales: dejar pasar directo
        registrarTiradaLibreLocalUsada();
        console.log(`✨ Tirada libre local usada (${libresUsadas + 1}/${TIRADAS_LIBRES_SIN_REGISTRO})`);
        abrirModo(modo, submodo);
    } else {
        // Se agotaron: pedir registro
        const quiereRegistrarse = confirm(
            "🔮 Has usado tus 2 lecturas gratuitas.\n\n" +
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
    console.log(`[access.js] abrirModo: ${modo}, ${submodo}`);
    
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
        "Ingresá tu código Premium, o dejalo vacío para comprar:"
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
        alert('❌ Código inválido.');
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
        console.warn("No se pudo verificar el estado en el servidor.");
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("[access.js] Inicializando...");
    await verificarEstadoReal();
    await actualizarBadgeGlobal();
});

console.log("[access.js] ✅ Flujo v8 cargado");
