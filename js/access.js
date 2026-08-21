// ==========================================
// ACCESS.JS v11.0 - Registro obligatorio + Modal Premium + Contador
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
            _lsSet('tarotia_muestras_backup', data.muestrasRestantes);
            return data.muestrasRestantes;
        }
    } catch (e) {
        console.warn("[access] Servidor offline, usando backup local.");
    }

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
            actualizarContadorMuestras();
            return data.muestrasRestantes;
        } else if (resp.status === 403 || resp.status === 429) {
            _lsSet('tarotia_muestras_backup', 0);
            actualizarContadorMuestras();
            return -1;
        } else {
            return 0;
        }
    } catch (e) {
        console.error("[access] Error de red:", e);
        const backup = parseInt(_lsGet('tarotia_muestras_backup') || '0', 10);
        if (backup > 0) {
            _lsSet('tarotia_muestras_backup', backup - 1);
            actualizarContadorMuestras();
            return backup - 1;
        }
        return -1;
    }
}

// ==========================================
// CONTADOR DE MUESTRAS (NUEVO)
// ==========================================

async function actualizarContadorMuestras() {
    const contenedor = document.getElementById('muestras-texto');
    if (!contenedor) return;
    
    const token = window.obtenerToken ? window.obtenerToken() : null;
    
    if (!token) {
        contenedor.textContent = '🔓 Registrate para acceder al Tarot Completo';
        contenedor.style.color = '#a78bfa';
        return;
    }
    
    if (window.esUsuarioPremium) {
        contenedor.textContent = '✨ Plan Premium - Lecturas Ilimitadas ✨';
        contenedor.style.color = '#ffd700';
        return;
    }
    
    const restantes = await obtenerMuestrasRestantesGlobal();
    
    if (restantes > 0) {
        const emoji = restantes === 1 ? '🎴' : '🎴';
        contenedor.textContent = `${emoji} Te quedan ${restantes} lectura${restantes > 1 ? 's' : ''} gratis de ${TIRADAS_POR_REGISTRO}`;
        contenedor.style.color = '#60a5fa';
    } else {
        contenedor.textContent = '🔒 Sin muestras gratis - Hacé Upgrade a Premium';
        contenedor.style.color = '#ef4444';
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
                await actualizarContadorMuestras();
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
// ABRIR MODO
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

// ==========================================
// 🎯 MURO DE PAGO CON MODAL BONITO (NUEVO)
// ==========================================

function lanzarMuroDePago() {
    // Si ya hay un modal abierto, no crear otro
    if (document.getElementById('modal-premium')) return;
    
    const modalHTML = `
        <div id="modal-premium" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(10px); animation:fadeIn 0.3s ease;">
            <div style="background:linear-gradient(145deg, #1a0f2e, #2d1b4e); padding:40px 30px; border-radius:24px; max-width:420px; width:90%; border:1px solid rgba(168,85,247,0.3); text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.8); position:relative; max-height:90vh; overflow-y:auto;">
                
                <!-- Botón cerrar -->
                <button onclick="cerrarModalPremium()" style="position:absolute; top:12px; right:16px; background:transparent; border:none; color:rgba(255,255,255,0.4); font-size:1.5rem; cursor:pointer; transition:0.2s;">
                    ✕
                </button>
                
                <!-- Icono -->
                <div style="font-size:4rem; margin-bottom:5px;">💎</div>
                
                <h2 style="color:#ffd700; margin:0; font-size:1.8rem;">¡Excelente!</h2>
                <p style="color:rgba(255,255,255,0.5); margin:5px 0 15px 0; font-size:0.95rem;">
                    Ya usaste tus <strong style="color:#a78bfa;">${TIRADAS_POR_REGISTRO} lecturas gratis</strong>.
                </p>
                
                <!-- Plan Premium -->
                <div style="background:rgba(168,85,247,0.08); padding:20px; border-radius:16px; margin:15px 0; border:1px solid rgba(168,85,247,0.15);">
                    <h3 style="color:#a78bfa; margin:0; font-size:1.1rem;">Plan Premium</h3>
                    <p style="color:#ffd700; font-size:2rem; font-weight:bold; margin:5px 0;">$1.999</p>
                    <p style="color:rgba(255,255,255,0.4); font-size:0.8rem; margin:0;">Pago único · Acceso permanente</p>
                    
                    <div style="text-align:left; margin:15px 0 0 0; color:rgba(255,255,255,0.6); font-size:0.85rem; line-height:1.8;">
                        ✓ 🔮 Lecturas ilimitadas<br>
                        ✓ 🧘‍♂️ Todos los estilos (Mágico, Filosófico, Profesional)<br>
                        ✓ 🃏 Mazo Físico incluido<br>
                        ✓ 📜 Historial ilimitado<br>
                        ✓ 🎙️ Voz en todas las lecturas
                    </div>
                </div>
                
                <!-- Botones -->
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">
                    <button onclick="window.abrirMercadoPago()" style="padding:16px; background:linear-gradient(135deg, #009ee3, #0073a8); border:none; border-radius:14px; color:white; font-weight:bold; font-size:1.05rem; cursor:pointer; transition:0.3s; box-shadow:0 4px 20px rgba(0,158,227,0.3);">
                        💳 Comprar Ahora
                    </button>
                    <button onclick="cerrarModalPremium(); ingresarCodigoPremium()" style="padding:12px; background:transparent; border:1px solid rgba(255,255,255,0.15); border-radius:14px; color:rgba(255,255,255,0.5); cursor:pointer; font-size:0.9rem; transition:0.3s;">
                        🔑 Tengo un código de acceso
                    </button>
                    <button onclick="cerrarModalPremium()" style="padding:8px; background:transparent; border:none; color:rgba(255,255,255,0.25); cursor:pointer; font-size:0.8rem; text-decoration:underline;">
                        Volver al menú
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Agregar el modal al DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Agregar estilo para la animación si no existe
    if (!document.getElementById('modal-premium-style')) {
        const style = document.createElement('style');
        style.id = 'modal-premium-style';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
}

function cerrarModalPremium() {
    const modal = document.getElementById('modal-premium');
    if (modal) modal.remove();
}

// Función para ingresar código desde el modal
function ingresarCodigoPremium() {
    const codigo = prompt("🔑 Ingresá tu código de acceso Premium:");
    if (codigo && codigo.trim()) {
        canjearCodigoPremium(codigo.trim());
    }
}

// ==========================================
// CÓDIGOS PREMIUM
// ==========================================

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
        actualizarContadorMuestras();
        cerrarModalPremium();
        window.mostrarPantalla('screen-portada');
    } else {
        alert('❌ Código inválido.');
        // Reabrir el modal si estaba cerrado
        if (!document.getElementById('modal-premium')) {
            lanzarMuroDePago();
        }
    }
}

// ==========================================
// MERCADO PAGO
// ==========================================

window.abrirMercadoPago = function() {
    window.open('https://link.mercadopago.com.ar/TULINKDEMP', '_blank');
    alert('💳 Después de completar el pago, tu acceso se activará automáticamente.\n\nSi ya pagaste y no ves tu acceso, hacé clic en "Tengo un código" e ingresá el código que recibiste por email.');
};

// ==========================================
// EXPOSICIÓN GLOBAL
// ==========================================

window.verificarAccesoFisico = (submodo) => verificarAccesoGlobal('fisico', submodo);
window.verificarAccesoEstilo = (estilo) => verificarAccesoGlobal('selector', estilo);
window.verificarAccesoPortada = () => window.mostrarPantalla('screen-portada');

// ==========================================
// INICIALIZACIÓN
// ==========================================

// Observar cambios de pantalla para actualizar el contador
const observer = new MutationObserver(() => {
    const portada = document.getElementById('screen-portada');
    if (portada && portada.style.display !== 'none' && !portada.classList.contains('hidden')) {
        actualizarContadorMuestras();
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const token = window.obtenerToken ? window.obtenerToken() : null;
    if (token) {
        try {
            const API_BASE = (window.SERVIDOR_URL || 'https://tarot-613b.onrender.com').replace('/tirada', '').replace(/\/$/, '');
            const resp = await fetch(`${API_BASE}/api/auth/perfil`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!resp.ok) {
                localStorage.removeItem('tarotia_token');
                localStorage.removeItem('tarotia_email_usuario');
            }
        } catch (e) {
            // Servidor durmiendo, dejar token por ahora
        }
    }
    await actualizarBadgeGlobal();
    await actualizarContadorMuestras();
    
    // Observar cambios en display de las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        observer.observe(screen, { attributes: true, attributeFilter: ['style', 'class'] });
    });
});

console.log("[access] ✅ v11.0 cargado - Modal Premium + Contador de muestras");
