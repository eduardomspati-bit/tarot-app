// ==========================================
// ACCESS.JS v10.1 - Registro obligatorio + Backup offline
// ==========================================

const TIRADAS_POR_REGISTRO = 5;

// Backup en memoria si localStorage falla
window._tarotiaMemoria = window._tarotiaMemoria || { registradasUsadas: 0 };

function _lsGet(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
function _lsSet(key, val) { try { localStorage.setItem(key, String(val)); return true; } catch(e) { return false; } }

// ==========================================
// MUESTRAS RESTANTES
// ==========================================

async function obtenerMuestrasRestantesGlobal() {
    if (window.esUsuarioPremium) return 999;

    const token = window.obtenerToken ? window.obtenerToken() : null;
    const API_BASE = (window.SERVIDOR_URL || 'https://tarot-613b.onrender.com').replace('/tirada', '').replace(/\/$/, '');

    if (!token) return 0;

    try {
        const resp = await fetch(`${API_BASE}/api/tiradas/muestras`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resp.ok) {
            const data = await resp.json();
            // Guardar en local como backup
            _lsSet('tarotia_muestras_backup', data.muestrasRestantes);
            return data.muestrasRestantes;
        }
    } catch (e) {
        console.warn("[access] Servidor offline, usando backup local.");
    }

    // Fallback: usar último valor conocido
    const backup = _lsGet('tarotia_muestras_backup');
    return backup ? parseInt(backup, 10) : 0;
}

// ==========================================
// REGISTRAR USO
// ==========================================

async function registrarUsoTiradaGlobal() {
    if (window.esUsuarioPremium) return 999;

    const token = window.obtenerToken ? window.obtenerToken() : null;
    if (!token) return -1;

    const API_BASE = (window.SERVIDOR_URL || 'https://tarot-613b.onrender.com').replace('/tirada', '').replace(/\/$/, '');

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
            _lsSet('tarotia_muestras_backup', data.muestrasRestantes);
            actualizarBadgeGlobal();
            return data.muestrasRestantes;
        } else if (resp.status === 403 || resp.status === 429) {
            _lsSet('tarotia_muestras_backup', 0);
            return -1; // Agotadas
        } else {
            return 0; // Error del servidor, no sabemos
        }
    } catch (e) {
        console.error("[access] Error de red:", e);
        // ⚠️ NO retornar -2 que fuerza muro de pago
        // Usar backup local como fallback temporal
        const backup = parseInt(_lsGet('tarotia_muestras_backup') || '0', 10);
        if (backup > 0) {
            _lsSet('tarotia_muestras_backup', backup - 1);
            return backup - 1;
        }
        return -1; // Sin backup, sí al muro
    }
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

    const token = window.obtenerToken ? window.obtenerToken() : null;

    if (window.esUsuarioPremium) {
        badges.forEach(b => { b.innerText = "Ilimitado ✨"; b.style.borderColor = "#a78bfa"; });
    } else if (token) {
        const restantes = await obtenerMuestrasRestantesGlobal();
        const txt = restantes > 0 ? `📧 ${restantes} lecturas` : "Sin muestras 🔒";
        const color = restantes > 0 ? "#60a5fa" : "#ef4444";
        badges.forEach(b => { b.innerText = txt; b.style.borderColor = color; });
    } else {
        badges.forEach(b => { b.innerText = "🔒 Registro requerido"; b.style.borderColor = "#fbbf24"; });
    }
}

// ==========================================
// FLUJO PRINCIPAL (REGISTRO OBLIGATORIO)
// ==========================================

async function verificarAccesoGlobal(modo, submodo) {
    console.log(`[access] verificarAccesoGlobal: modo=${modo}, submodo=${submodo}`);

    if (window.esUsuarioPremium) {
        abrirModo(modo, submodo);
        return;
    }

    const token = window.obtenerToken ? window.obtenerToken() : null;

    // ⛔ SIN TOKEN = Registro obligatorio
    if (!token) {
        const quiereRegistrarse = confirm(
            "✨ Para acceder al Tarot Completo necesitamos tu email.\n\n" +
            "✅ Aceptar → Ingresar mi email\n" +
            "❌ Cancelar → Volver al inicio"
        );
        if (quiereRegistrarse) {
            await pedirEmailYRegistrar(modo, submodo);
        } else {
            window.mostrarPantalla('screen-portada');
        }
        return;
    }

    // ✅ CON TOKEN: verificar muestras
    const restantes = await registrarUsoTiradaGlobal();
    
    if (restantes >= 0) {
        abrirModo(modo, submodo);
    } else {
        lanzarMuroDePago();
    }
}

// ==========================================
// REGISTRO
// ==========================================

async function pedirEmailYRegistrar(modo, submodo) {
    const emailInput = prompt("📧 Ingresa tu correo para desbloquear tus lecturas:");

    if (!emailInput) {
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
                alert("✅ ¡Registro exitoso!");
                _lsSet('tarotia_muestras_backup', resultado.muestrasRestantes || 5);
                await actualizarBadgeGlobal();
                // Reintentar acceso (ahora con token)
                await verificarAccesoGlobal(modo, submodo);
            } else {
                alert("❌ Error: " + (resultado?.mensaje || "desconocido"));
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
// RESTO (abrirModo, muro, códigos, etc.)
// ==========================================

function abrirModo(modo, submodo) {
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

window.verificarAccesoFisico = (submodo) => verificarAccesoGlobal('fisico', submodo);
window.verificarAccesoEstilo = (estilo) => verificarAccesoGlobal('selector', estilo);
window.verificarAccesoPortada = () => window.mostrarPantalla('screen-portada');

// Verificar token al cargar
document.addEventListener('DOMContentLoaded', async () => {
    const token = window.obtenerToken ? window.obtenerToken() : null;
    if (token) {
        try {
            const API_BASE = (window.SERVIDOR_URL || 'https://tarot-613b.onrender.com').replace('/tirada', '').replace(/\/$/, '');
            const resp = await fetch(`${API_BASE}/api/auth/perfil`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!resp.ok) {
                // Token inválido, limpiar
                localStorage.removeItem('tarotia_token');
                localStorage.removeItem('tarotia_email_usuario');
            }
        } catch (e) {
            // Servidor durmiendo, dejar token por ahora
        }
    }
    await actualizarBadgeGlobal();
});

console.log("[access] ✅ v10.1 cargado - Registro obligatorio + backup offline");
