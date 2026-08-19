
access_js = '''// ==========================================
// ACCESS.JS - Control de Accesos, Muestras Físicas y Premium
// ==========================================

console.log("[access.js] Módulo de control de acceso cargado");

const MAX_MUESTRAS = 5;

// Códigos premium válidos (redundante con auth.js, pero mantiene compatibilidad)
const CODIGOS_PREMIUM_VALIDOS = [
    'ADMIN2026',
    'PASEMISTICO',
    'TAROTGRATIS'
];

// ==========================================
// MUESTRAS FÍSICAS (LOCAL)
// ==========================================

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
    const badge = document.getElementById('badge-physic-muestra-prof')
               || document.getElementById('badge-fisico-muestra-prof')
               || document.getElementById('badge-fisico-muestra');

    if (badge) {
        if (window.esUsuarioPremium) {
            badge.innerText = "♾️ Ilimitado";
            badge.style.borderColor = "#a78bfa";
        } else {
            const restantes = obtenerMuestrasFisicasRestantes();
            badge.innerText = restantes > 0 ? `🔮 ${restantes} Muestras` : "🔒 Agotado";
        }
    }
}

// ==========================================
// ACCESO A MAZO FÍSICO
// ==========================================

window.verificarAccesoFisico = function() {
    if (window.esUsuarioPremium) {
        if (typeof window.abrirModoFisico === 'function') {
            window.abrirModoFisico();
        } else if (typeof window.mostrarPantalla === 'function') {
            window.mostrarPantalla('screen-fisico');
        }
        return;
    }

    const muestrasRestantes = obtenerMuestrasFisicasRestantes();

    if (muestrasRestantes > 0) {
        if (typeof window.abrirModoFisico === 'function') {
            window.abrirModoFisico();
        } else if (typeof window.mostrarPantalla === 'function') {
            window.mostrarPantalla('screen-fisico');
        }
    } else {
        const opcion = confirm("🔒 Has agotado tus 5 muestras gratuitas de Mazo Físico.\\n\\n¿Quieres ingresar un código Premium? (Aceptar = Sí, Cancelar = Ver suscripción)");
        if (opcion) {
            const codigo = prompt("Ingresa tu código de acceso Premium:");
            if (codigo && typeof window.canjearCodigoPremium === 'function') {
                const exito = window.canjearCodigoPremium(codigo);
                if (exito && typeof window.abrirModoFisico === 'function') {
                    window.abrirModoFisico();
                }
            }
        } else {
            if (typeof window.abrirMercadoPago === 'function') {
                window.abrirMercadoPago();
            }
        }
    }
};

// Alias para compatibilidad
window.verificarAccesoTarotistaFisico = function() {
    window.verificarAccesoFisico();
};

window.verificarAccesoTarotista = function() {
    if (window.esUsuarioPremium) {
        if (typeof window.irAlEjeConsulta === 'function') {
            window.irAlEjeConsulta('manual');
        } else {
            alert("⚠️ Función 'irAlEjeConsulta' no definida.");
        }
    } else {
        const opcion = confirm("✨ El Modo Tarotista es exclusivo de TarotIA Premium.\\n\\n¿Quieres ingresar un código Premium?");
        if (opcion) {
            const codigo = prompt("Ingresa tu código de acceso:");
            if (codigo && typeof window.canjearCodigoPremium === 'function') {
                window.canjearCodigoPremium(codigo);
            }
        } else {
            if (typeof window.abrirMercadoPago === 'function') {
                window.abrirMercadoPago();
            }
        }
    }
};

// ==========================================
// ABRIR MODO FÍSICO
// ==========================================

window.abrirModoFisico = function() {
    if (typeof window.cargarSelectoresFisicos === 'function') {
        window.cargarSelectoresFisicos();
    }
    if (typeof window.mostrarPantalla === 'function') {
        window.mostrarPantalla('screen-fisico');
    }
};

// ==========================================
// VERIFICAR ACCESO PREMIUM
// ==========================================

window.verificarAccesoPremium = function() {
    if (window.esUsuarioPremium) {
        return true;
    } else {
        const opcion = confirm("🔒 Esta función es exclusiva para TarotIA Premium.\\n\\n¿Quieres ingresar un código Premium? (Aceptar = Sí, Cancelar = Ver suscripción)");
        if (opcion) {
            const codigo = prompt("Ingresa tu código de acceso Premium:");
            if (codigo && typeof window.canjearCodigoPremium === 'function') {
                return window.canjearCodigoPremium(codigo);
            }
        } else {
            if (typeof window.abrirMercadoPago === 'function') {
                window.abrirMercadoPago();
            }
        }
        return false;
    }
};

// ==========================================
// MERCADO PAGO (STUB)
// ==========================================

window.abrirMercadoPago = function() {
    alert('🛒 Próximamente: enlace de pago por Mercado Pago.\\n\\nContactá al administrador para adquirir tu Pase Místico.');
};

// ==========================================
// MOSTRAR PLAN DEL USUARIO
// ==========================================

window.mostrarPlanUsuario = function() {
    const email = localStorage.getItem('tarotia_email_usuario') || 'No logueado';
    const plan = window.esUsuarioPremium ? '⭐ PREMIUM' : '🃏 GRATIS';
    const muestras = window.esUsuarioPremium ? '♾️ Ilimitadas' : `${obtenerMuestrasFisicasRestantes()} de ${MAX_MUESTRAS}`;

    return `<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,215,0,0.1); border-radius: 10px; padding: 12px; margin-bottom: 20px; font-size: 0.9rem;">
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
            <span>📧 ${email}</span>
            <span style="color: ${window.esUsuarioPremium ? '#ffd700' : '#a78bfa'};">${plan}</span>
        </div>
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-top: 4px; color: var(--muted-text);">
            <span>🔮 Muestras físicas: ${muestras}</span>
        </div>
    </div>`;
};

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    actualizarBadgeMuestrasFisicas();
    console.log('[access.js] ✅ Módulo de acceso inicializado');
    console.log('[access.js] Usuario Premium:', window.esUsuarioPremium);
});

console.log("[access.js] Módulo de control de acceso cargado");
'''

with open('/mnt/agents/output/access_corregido.js', 'w', encoding='utf-8') as f:
    f.write(access_js)

print("✅ access_corregido.js creado")
