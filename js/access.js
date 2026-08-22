// ==========================================
// ACCESS.JS v12.0 - Flujo limpio + Banner Premium inteligente
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
// CONTADOR DE MUESTRAS (LIMPIO)
// ==========================================

async function actualizarContadorMuestras() {
    const bannerPremium = document.getElementById('banner-premium');
    const contenedorMuestras = document.getElementById('muestras-container');
    const textoMuestras = document.getElementById('muestras-texto');

    if (!bannerPremium || !contenedorMuestras) return;

    const token = window.obtenerToken ? window.obtenerToken() : null;

    // Sin token = mostrar banner premium (invitación a registrarse)
    if (!token) {
        bannerPremium.style.display = 'block';
        contenedorMuestras.style.display = 'none';
        return;
    }

    // Premium = nada de esto
    if (window.esUsuarioPremium) {
        bannerPremium.style.display = 'none';
        contenedorMuestras.style.display = 'none';
        return;
    }

    // Registrado, no premium: contador sutil
    const restantes = await obtenerMuestrasRestantesGlobal();

    if (restantes > 0) {
        bannerPremium.style.display = 'none';
        contenedorMuestras.style.display = 'block';
        textoMuestras.textContent = `🎴 ${restantes} lectura${restantes > 1 ? 's' : ''} gratuita${restantes > 1 ? 's' : ''} restante${restantes > 1 ? 's' : ''}`;
        textoMuestras.style.color = '#60a5fa';
    } else {
        // Se acabaron: mostrar banner de upgrade
        bannerPremium.style.display = 'block';
        contenedorMuestras.style.display = 'block';
        textoMuestras.textContent = 'Sin lecturas gratuitas';
        textoMuestras.style.color = '#ef4444';
    }
}

// ==========================================
// BADGE (ahora solo log, sin badges visuales en tarjetas)
// ==========================================

async function actualizarBadgeGlobal() {
    const token = window.obtenerToken ? window.obtenerToken() : null;

    if (window.esUsuarioPremium) {
        console.log("[access] Usuario Premium");
    } else if (token) {
        const restantes = await obtenerMuestrasRestantesGlobal();
        console.log("[access] Muestras restantes:", restantes);
    } else {
        console.log("[access] Sin sesión");
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

    // Sin token = Registro obligatorio
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

    // Con token: verificar muestras
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
// MURO DE PAGO CON MODAL LIMPIO
// ==========================================

function lanzarMuroDePago() {
    if (document.getElementById('modal-premium')) return;

    const modal = document.createElement('div');
    modal.id = 'modal-premium';
    modal.className = 'modal-premium-overlay';
    modal.innerHTML = `
        <div class="modal-premium-box">
            <button class="modal-premium-close" onclick="cerrarModalPremium()">✕</button>
            <div class="modal-premium-icon">💎</div>
            <h2 class="modal-premium-title">¡Excelente!</h2>
            <p class="modal-premium-subtitle">
                Ya usaste tus <strong>${TIRADAS_POR_REGISTRO} lecturas gratis</strong>.
            </p>
            <div class="modal-premium-plan">
                <h3>Plan Premium</h3>
                <p class="modal-premium-price">$7.000 ARS</p>
                <p class="modal-premium-note">Pago único · Acceso permanente</p>
                <ul class="modal-premium-features">
                    <li>🔮 Lecturas ilimitadas</li>
                    <li>🧘‍♂️ Todos los estilos (Mágico, Filosófico, Profesional)</li>
                    <li>🃏 Mazo Físico incluido</li>
                    <li>📜 Historial ilimitado</li>
                    <li>🎙️ Voz en todas las lecturas</li>
                </ul>
            </div>
            <div class="modal-premium-actions">
                <button class="btn-premium-buy" onclick="window.abrirMercadoPago()">
                    💳 Comprar Ahora
                </button>
                <button class="btn-premium-code" onclick="cerrarModalPremium(); ingresarCodigoPremium()">
                    🔑 Tengo un código de acceso
                </button>
                <button class="btn-premium-back" onclick="cerrarModalPremium()">
                    Volver al menú
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Inyectar estilos del modal si no existen
    if (!document.getElementById('modal-premium-style')) {
        const style = document.createElement('style');
        style.id = 'modal-premium-style';
        style.textContent = `
            .modal-premium-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.85); z-index: 9999;
                display: flex; justify-content: center; align-items: center;
                backdrop-filter: blur(10px);
                animation: fadeIn 0.3s ease;
            }
            .modal-premium-box {
                background: linear-gradient(145deg, #1a0f2e, #2d1b4e);
                padding: 40px 30px; border-radius: 24px; max-width: 420px; width: 90%;
                border: 1px solid rgba(168,85,247,0.3); text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.8); position: relative;
                max-height: 90vh; overflow-y: auto;
            }
            .modal-premium-close {
                position: absolute; top: 12px; right: 16px;
                background: transparent; border: none;
                color: rgba(255,255,255,0.4); font-size: 1.5rem; cursor: pointer;
            }
            .modal-premium-icon { font-size: 4rem; margin-bottom: 5px; }
            .modal-premium-title { color: #ffd700; margin: 0; font-size: 1.8rem; }
            .modal-premium-subtitle { color: rgba(255,255,255,0.5); margin: 5px 0 15px 0; font-size: 0.95rem; }
            .modal-premium-subtitle strong { color: #a78bfa; }
            .modal-premium-plan {
                background: rgba(168,85,247,0.08); padding: 20px; border-radius: 16px;
                margin: 15px 0; border: 1px solid rgba(168,85,247,0.15);
            }
            .modal-premium-plan h3 { color: #a78bfa; margin: 0; font-size: 1.1rem; }
            .modal-premium-price { color: #ffd700; font-size: 2rem; font-weight: bold; margin: 5px 0; }
            .modal-premium-note { color: rgba(255,255,255,0.4); font-size: 0.8rem; margin: 0; }
            .modal-premium-features {
                text-align: left; margin: 15px 0 0 0;
                color: rgba(255,255,255,0.6); font-size: 0.85rem; line-height: 1.8;
                list-style: none; padding: 0;
            }
            .modal-premium-features li { padding-left: 5px; }
            .modal-premium-actions {
                display: flex; flex-direction: column; gap: 10px; margin-top: 10px;
            }
            .btn-premium-buy {
                padding: 16px; background: linear-gradient(135deg, #009ee3, #0073a8);
                border: none; border-radius: 14px; color: white; font-weight: bold;
                font-size: 1.05rem; cursor: pointer; transition: 0.3s;
                box-shadow: 0 4px 20px rgba(0,158,227,0.3);
            }
            .btn-premium-buy:hover { transform: translateY(-2px); }
            .btn-premium-code {
                padding: 12px; background: transparent;
                border: 1px solid rgba(255,255,255,0.15); border-radius: 14px;
                color: rgba(255,255,255,0.5); cursor: pointer; font-size: 0.9rem;
            }
            .btn-premium-back {
                padding: 8px; background: transparent; border: none;
                color: rgba(255,255,255,0.25); cursor: pointer; font-size: 0.8rem;
                text-decoration: underline;
            }
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
        if (!document.getElementById('modal-premium')) {
            lanzarMuroDePago();
        }
    }
}

// ==========================================
// MERCADO PAGO
// ==========================================

window.abrirMercadoPago = function() {
    // 1. Abrimos PRIMERO la ventana (antes de cualquier alert o lógica)
    //    para que el navegador lo reconozca como "user gesture" válido.
    const mpWindow = window.open('https://mpago.la/2rDcjLS', '_blank');

    // 2. Cerramos el modal premium si está abierto
    cerrarModalPremium();

    // 3. Si el navegador bloqueó el popup, mpWindow será null o undefined
    if (!mpWindow || mpWindow.closed || typeof mpWindow.closed === 'undefined') {
        // Fallback: mostrar mensaje en UI en vez de alert bloqueante
        mostrarToastPremium('⚠️ Tu navegador bloqueó la ventana de pago. Permití los popups o usá el botón "Código" si ya pagaste.');
    } else {
        // Mensaje elegante después de un instante (no bloquea el thread)
        setTimeout(() => {
            mostrarToastPremium('💳 Después de pagar, tu acceso se activa automáticamente. Si ya pagaste, usá "Tengo un código".');
        }, 800);
    }
};

// Toast elegante (reemplaza los alert feos)
function mostrarToastPremium(mensaje) {
    // Remover toast anterior si existe
    const anterior = document.getElementById('toast-premium');
    if (anterior) anterior.remove();

    const toast = document.createElement('div');
    toast.id = 'toast-premium';
    toast.style.cssText = `
        position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
        background: rgba(20, 12, 35, 0.95); border: 1px solid rgba(168,85,247,0.4);
        color: #e0d5f0; padding: 14px 24px; border-radius: 12px;
        font-size: 0.9rem; z-index: 10000; max-width: 90%; text-align: center;
        box-shadow: 0 8px 30px rgba(0,0,0,0.6); backdrop-filter: blur(10px);
        animation: slideUp 0.4s ease;
    `;
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 6000);
}

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

    document.querySelectorAll('.screen').forEach(screen => {
        observer.observe(screen, { attributes: true, attributeFilter: ['style', 'class'] });
    });
});

console.log("[access] ✅ v12.0 cargado - Flujo limpio + Banner Premium inteligente");
