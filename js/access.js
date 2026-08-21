// ==========================================
// CONTROL DE ACCESOS, AUTENTICACIÓN Y MUESTRAS FÍSICAS
// ==========================================

// ==========================================
// CONFIGURACIÓN GLOBAL
// ==========================================

const TIRADAS_LIBRES_SIN_REGISTRO = 2;    // Tiradas gratis sin email
const TIRADAS_POR_REGISTRO = 5;           // Tiradas gratis CON email
const MAX_MUESTRAS_FISICAS = 5;           // Mismas 5 del backend

// ==========================================
// FUNCIONES DE ACCESO LOCAL
// ==========================================

function obtenerTiradasLibresLocalesUsadas() {
    try {
        let usadas = localStorage.getItem('tarotia_libres_usadas');
        return usadas ? parseInt(usadas, 10) : 0;
    } catch (e) {
        return 0;
    }
}

function registrarTiradaLibreLocalUsada() {
    try {
        let usadas = obtenerTiradasLibresLocalesUsadas();
        localStorage.setItem('tarotia_libres_usadas', usadas + 1);
    } catch (e) {
        console.warn("No se pudo guardar en localStorage");
    }
}

function obtenerTiradasRegistradasUsadas() {
    try {
        let usadas = localStorage.getItem('tarotia_registradas_usadas');
        return usadas ? parseInt(usadas, 10) : 0;
    } catch (e) {
        return 0;
    }
}

function registrarTiradaRegistradaUsada() {
    try {
        let usadas = obtenerTiradasRegistradasUsadas();
        localStorage.setItem('tarotia_registradas_usadas', usadas + 1);
    } catch (e) {
        console.warn("No se pudo guardar en localStorage");
    }
}

// ==========================================
// VERIFICAR MUESTRAS RESTANTES (GLOBAL)
// ==========================================

async function obtenerMuestrasRestantesGlobal() {
    // 1. Si es Premium → ilimitado
    if (window.esUsuarioPremium) return 999;

    const token = window.obtenerToken ? window.obtenerToken() : null;
    const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined')
        ? window.SERVIDOR_URL.replace('/tirada', '')
        : 'https://tarot-613b.onrender.com';

    // 2. Si tiene token → consultar en el servidor
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

    // 3. Si NO tiene token → usar las 2 locales
    const libresRestantes = Math.max(0, TIRADAS_LIBRES_SIN_REGISTRO - obtenerTiradasLibresLocalesUsadas());
    return libresRestantes;
}

// ==========================================
// REGISTRAR USO DE TIRADA (GLOBAL)
// ==========================================

async function registrarUsoTiradaGlobal() {
    // 1. Si es Premium → ilimitado
    if (window.esUsuarioPremium) return 999;

    const token = window.obtenerToken ? window.obtenerToken() : null;
    const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined')
        ? window.SERVIDOR_URL.replace('/tirada', '')
        : 'https://tarot-613b.onrender.com';

    // 2. Si tiene token → usar backend
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
                return -1;
            }
        } catch (e) {
            console.error("Error al registrar en MongoDB:", e);
            return -1;
        }
    }

    // 3. Si NO tiene token → usar las 2 locales
    const libresUsadas = obtenerTiradasLibresLocalesUsadas();
    if (libresUsadas < TIRADAS_LIBRES_SIN_REGISTRO) {
        registrarTiradaLibreLocalUsada();
        const restantes = TIRADAS_LIBRES_SIN_REGISTRO - (libresUsadas + 1);
        return restantes;
    }
    
    return -1; // Sin muestras disponibles
}

// ==========================================
// BADGE GLOBAL
// ==========================================

async function actualizarBadgeGlobal() {
    // Buscar cualquier badge de muestras en la UI
    const badges = document.querySelectorAll('[id*="badge-fisico"], [id*="badge-muestra"], [id*="badge-physic"]');
    const badge = badges[0] || document.getElementById('badge-fisico-muestra');

    if (badge) {
        if (window.esUsuarioPremium) {
            badge.innerText = "Ilimitado ✨";
            badge.style.borderColor = "#a78bfa";
        } else {
            const restantes = await obtenerMuestrasRestantesGlobal();
            const token = window.obtenerToken ? window.obtenerToken() : null;
            
            if (token) {
                badge.innerText = `📧 ${restantes} lecturas`;
                badge.style.borderColor = "#60a5fa";
            } else {
                badge.innerText = restantes > 0 ? `🃏 ${restantes} gratis` : "Regístrate 🔓";
                badge.style.borderColor = "#fbbf24";
            }
        }
    }
}

// ==========================================
// FLUJO PRINCIPAL: VERIFICAR ACCESO (TODOS LOS MODOS)
// ==========================================

async function verificarAccesoGlobal(modo, submodo) {
    console.log(`[access.js] verificarAccesoGlobal: modo=${modo}, submodo=${submodo}`);
    
    // 1. Si es Premium → acceso directo
    if (window.esUsuarioPremium) {
        abrirModo(modo, submodo);
        return;
    }

    const token = window.obtenerToken ? window.obtenerToken() : null;
    
    // 2. Si TIENE token → usar las 5 lecturas de la nube
    if (token) {
        const restantes = await registrarUsoTiradaGlobal();
        if (restantes >= 0) {
            abrirModo(modo, submodo);
            return;
        } else {
            // Sin muestras en la nube → ofrecer Premium
            lanzarMuroDePago();
            return;
        }
    }

    // 3. NO tiene token → preguntar si quiere registrarse
    const quiereRegistrarse = confirm(
        "🔮 Para acceder a las lecturas de Tarot necesitás registrarte con tu email.\n\n" +
        "✅ 'Aceptar' → Registrarte y obtener 5 lecturas gratuitas.\n" +
        "❌ 'Cancelar' → Usar 2 lecturas gratuitas SIN registro (solo en este dispositivo)."
    );

    if (quiereRegistrarse) {
        await pedirEmailYRegistrar(modo, submodo);
    } else {
        // Usar las 2 gratis locales
        const libresUsadas = obtenerTiradasLibresLocalesUsadas();
        if (libresUsadas < TIRADAS_LIBRES_SIN_REGISTRO) {
            registrarTiradaLibreLocalUsada();
            console.log(`✨ Tirada libre local usada (${libresUsadas + 1}/${TIRADAS_LIBRES_SIN_REGISTRO})`);
            abrirModo(modo, submodo);
        } else {
            // Ya gastó las 2 gratis → ahora SÍ o SÍ debe registrarse
            alert("🔒 Has agotado tus 2 lecturas gratuitas locales.\n\nPara continuar, debes registrarte con tu email.");
            await pedirEmailYRegistrar(modo, submodo);
        }
    }
}

// ==========================================
// PEDIR EMAIL Y REGISTRAR
// ==========================================

async function pedirEmailYRegistrar(modo, submodo) {
    const emailInput = prompt(
        "📧 ¡Bienvenido a TarotIA!\n\n" +
        "Ingresa tu correo electrónico para desbloquear 5 lecturas gratuitas:\n\n" +
        "(Tu correo solo se usa para guardar tu progreso y activar tu cuenta)"
    );
    
    if (!emailInput || emailInput === null) {
        alert("⚠️ El correo es necesario para continuar.");
        // Preguntar si quiere usar las 2 gratis locales
        const usarGratis = confirm("¿Querés usar 2 lecturas gratuitas sin registrarte?");
        if (usarGratis) {
            const libresUsadas = obtenerTiradasLibresLocalesUsadas();
            if (libresUsadas < TIRADAS_LIBRES_SIN_REGISTRO) {
                registrarTiradaLibreLocalUsada();
                abrirModo(modo, submodo);
                return;
            }
        }
        // Si no quiere o ya no tiene gratis, reintentar
        await pedirEmailYRegistrar(modo, submodo);
        return;
    }
    
    if (!emailInput.includes('@') || !emailInput.includes('.')) {
        alert("⚠️ Por favor, ingresa un correo electrónico válido.");
        await pedirEmailYRegistrar(modo, submodo);
        return;
    }

    // Registrar en el backend
    if (typeof window.autenticarUsuario === 'function') {
        try {
            const resultado = await window.autenticarUsuario("Consultante", emailInput.trim().toLowerCase());
            if (resultado && resultado.exito) {
                alert("✅ ¡Correo registrado con éxito! Tienes 5 lecturas gratuitas.\n\n🔮 ¡A disfrutar!");
                // Actualizar badge
                await actualizarBadgeGlobal();
                // Reintentar el acceso (ahora tiene token)
                await verificarAccesoGlobal(modo, submodo);
            } else {
                alert("❌ No se pudo registrar el correo. Error: " + (resultado?.mensaje || "desconocido"));
                await pedirEmailYRegistrar(modo, submodo);
            }
        } catch (e) {
            console.error("Error al autenticar:", e);
            alert("❌ Error de conexión. Intenta de nuevo.");
            await pedirEmailYRegistrar(modo, submodo);
        }
    } else {
        alert("⚠️ Sistema de autenticación no disponible. Recarga la página.");
    }
}

// ==========================================
// ABRIR MODO SEGÚN EL TIPO
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
        if (typeof window.mostrarPantalla === 'function') window.mostrarPantalla('screen-fisico');
    } else if (modo === 'selector') {
        window.modoFisicoActivo = false;
        window.estiloSeleccionado = submodo || 'magico';
        window.preguntaCustomSeleccionada = "";
        if (typeof window.mostrarPantalla === 'function') window.mostrarPantalla('screen-selector');
    } else if (modo === 'portada') {
        if (typeof window.mostrarPantalla === 'function') window.mostrarPantalla('screen-portada');
    }
}

// ==========================================
// MURO DE PAGO
// ==========================================

function lanzarMuroDePago() {
    const codigo = prompt(
        "🔒 Has agotado tus lecturas gratuitas.\n\n" +
        "Opciones:\n" +
        "1. Ingresá tu código Premium\n" +
        "2. Pulsá 'Aceptar' para adquirir tu Pase Místico\n" +
        "3. Pulsá 'Cancelar' para volver"
    );
    
    if (codigo === null) {
        // Canceló → volver a portada
        if (typeof window.mostrarPantalla === 'function') window.mostrarPantalla('screen-portada');
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

    // Códigos válidos (también se validan en el backend)
    const CODIGOS_VALIDOS = ['ADMIN2026', 'PASEMISTICO', 'TAROTGRATIS'];
    
    if (CODIGOS_VALIDOS.includes(codigoLimpio)) {
        window.esUsuarioPremium = true;
        try {
            localStorage.setItem('simularPremium', 'true');
            localStorage.setItem('tarotia_plan_premium', 'true');
        } catch (e) {}
        alert('✨ ¡Código premium activado con éxito! Ahora tenés acceso ilimitado.');
        actualizarBadgeGlobal();
        // Volver a abrir el modo
        if (typeof window.mostrarPantalla === 'function') window.mostrarPantalla('screen-portada');
    } else {
        alert('❌ Código inválido o expirado. Probá con otro o contactá al administrador.');
        lanzarMuroDePago();
    }
}

window.abrirMercadoPago = function() {
    window.open('https://link.mercadopago.com.ar/TULINKDEMP', '_blank');
};

// ==========================================
// FUNCIONES EXPUESTAS PARA EL HTML
// ==========================================

// Para el Módulo Profesional → Mazo Físico
window.verificarAccesoFisico = function(submodo) {
    verificarAccesoGlobal('fisico', submodo);
};

// Para los estilos automáticos (Mágico, Filosófico)
window.verificarAccesoEstilo = function(estilo) {
    verificarAccesoGlobal('selector', estilo);
};

// Para la portada (ya registrado)
window.verificarAccesoPortada = function() {
    const token = window.obtenerToken ? window.obtenerToken() : null;
    if (token) {
        // Ya tiene token, mostrar portada
        if (typeof window.mostrarPantalla === 'function') window.mostrarPantalla('screen-portada');
    } else {
        // No tiene token, pedir registro
        verificarAccesoGlobal('portada', null);
    }
};

// Para el Tarotista (Premium)
window.verificarAccesoTarotista = function() {
    if (window.esUsuarioPremium) {
        if (typeof irAlEjeConsulta === 'function') irAlEjeConsulta('manual');
    } else {
        const codigo = prompt("✨ El Modo Tarotista es exclusivo de TarotIA Premium.\nPor favor, ingresa tu código de acceso:");
        if (codigo) {
            canjearCodigoPremium(codigo);
        }
    }
};

// Para el Mazo Físico Tarotista (Premium)
window.verificarAccesoTarotistaFisico = function() {
    verificarAccesoGlobal('fisico', 'tarotista_fisico');
};

// ==========================================
// VERIFICACIÓN DE ESTADO AL INICIAR
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
            await actualizarBadgeGlobal();
        }
    } catch (e) {
        console.warn("No se pudo verificar el estado en el servidor.");
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log("[access.js] Inicializando sistema de acceso global...");
    await verificarEstadoReal();
    await actualizarBadgeGlobal();
});

console.log("[access.js] ✅ Flujo global cargado: TODOS los modos piden email al inicio");
