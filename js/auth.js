// ==========================================
// AUTH - Autenticación y Gestión de Usuarios
// ==========================================

console.log("[auth.js] Módulo de autenticación cargado");

// ==========================================
// CONSTANTES
// ==========================================
const TOKEN_KEY = 'tarotia_token';
const EMAIL_KEY = 'tarotia_email_usuario';
const USER_DATA_KEY = 'tarotia_usuario_data';

// ==========================================
// GESTIÓN DE TOKEN
// ==========================================

window.obtenerToken = function() {
    return localStorage.getItem(TOKEN_KEY);
};

window.guardarToken = function(token) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
};

window.eliminarToken = function() {
    localStorage.removeItem(TOKEN_KEY);
};

window.estaLogueado = function() {
    return !!localStorage.getItem(TOKEN_KEY);
};

// ==========================================
// GESTIÓN DE DATOS DEL USUARIO
// ==========================================

window.guardarDatosUsuario = function(usuario) {
    if (usuario) {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(usuario));
        if (usuario.email) {
            localStorage.setItem(EMAIL_KEY, usuario.email);
        }
    }
};

window.obtenerDatosUsuario = function() {
    try {
        const data = localStorage.getItem(USER_DATA_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error("[auth.js] Error al leer datos de usuario:", e);
        return null;
    }
};

window.obtenerEmailUsuario = function() {
    return localStorage.getItem(EMAIL_KEY) || '';
};

window.obtenerPlanUsuario = function() {
    const usuario = window.obtenerDatosUsuario();
    return usuario ? usuario.plan : 'Gratis';
};

window.esUsuarioPremium = function() {
    // Verificar primero si está forzado por admin
    if (localStorage.getItem('simularPremium') === 'true') {
        return true;
    }
    const usuario = window.obtenerDatosUsuario();
    return usuario ? usuario.plan === 'Premium' : false;
};

// ==========================================
// REGISTRO / LOGIN
// ==========================================

window.autenticarUsuario = async function(nombre, email) {
    const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined')
        ? window.SERVIDOR_URL.replace('/tirada', '')
        : 'https://tarot-613b.onrender.com';

    // Validaciones básicas
    if (!email || !email.includes('@')) {
        return { exito: false, error: 'Email inválido.' };
    }

    const nombreLimpio = (nombre && typeof nombre === 'string') ? nombre.trim() : 'Consultante';
    const emailLimpio = email.toLowerCase().trim();

    try {
        console.log("[auth.js] Autenticando usuario:", emailLimpio);

        const resp = await fetch(`${API_BASE}/api/auth/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nombre: nombreLimpio, 
                email: emailLimpio 
            })
        });

        const data = await resp.json();
        console.log("[auth.js] Respuesta del servidor:", data);

        if (resp.ok && data.token) {
            // Guardar token
            window.guardarToken(data.token);
            
            // Guardar datos del usuario
            if (data.usuario) {
                window.guardarDatosUsuario(data.usuario);
                localStorage.setItem(EMAIL_KEY, emailLimpio);
            }

            // Actualizar estado premium global
            if (data.usuario && data.usuario.plan === 'Premium') {
                window.esUsuarioPremium = true;
                localStorage.setItem('simularPremium', 'true');
            } else {
                window.esUsuarioPremium = false;
                localStorage.removeItem('simularPremium');
            }

            return { 
                exito: true, 
                usuario: data.usuario,
                token: data.token
            };
        }

        return { 
            exito: false, 
            error: data.error || 'Error desconocido en el servidor.' 
        };

    } catch (error) {
        console.error("[auth.js] Error en autenticación:", error);
        return { 
            exito: false, 
            error: 'Error de conexión. Verifica tu internet.' 
        };
    }
};

// ==========================================
// INICIAR SESIÓN (DESDE EL FORMULARIO)
// ==========================================

window.iniciarSesion = async function() {
    const nombreInput = document.getElementById('auth-nombre');
    const emailInput = document.getElementById('auth-email');
    const errorDiv = document.getElementById('auth-error');

    const nombre = nombreInput ? nombreInput.value.trim() : 'Consultante';
    const email = emailInput ? emailInput.value.trim() : '';

    // Validar email
    if (!email || !email.includes('@')) {
        if (errorDiv) {
            errorDiv.textContent = '⚠️ Ingresá un correo electrónico válido.';
            errorDiv.style.display = 'block';
        }
        return;
    }

    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }

    // Mostrar estado de carga
    const btn = document.querySelector('.btn-consulta-gratis');
    if (btn) {
        btn.textContent = '⏳ Conectando...';
        btn.disabled = true;
    }

    try {
        const resultado = await window.autenticarUsuario(nombre, email);

        if (resultado.exito) {
            // Actualizar badge de muestras
            if (typeof actualizarBadgeMuestrasFisicas === 'function') {
                actualizarBadgeMuestrasFisicas();
            }

            // Actualizar info en portada
            if (typeof actualizarInfoUsuario === 'function') {
                actualizarInfoUsuario();
            }

            // Ir a la portada
            if (typeof window.mostrarPantalla === 'function') {
                window.mostrarPantalla('screen-portada');
            }

            // Mostrar mensaje de bienvenida
            const nombreUsuario = resultado.usuario?.nombre || 'Consultante';
            console.log(`[auth.js] ✅ Bienvenido ${nombreUsuario}!`);

        } else {
            if (errorDiv) {
                errorDiv.textContent = '❌ ' + (resultado.error || 'Error al iniciar sesión.');
                errorDiv.style.display = 'block';
            }
        }

    } catch (error) {
        console.error("[auth.js] Error en inicio de sesión:", error);
        if (errorDiv) {
            errorDiv.textContent = '❌ Ocurrió un error inesperado. Intenta de nuevo.';
            errorDiv.style.display = 'block';
        }
    } finally {
        // Restaurar botón
        if (btn) {
            btn.textContent = '🔮 Entrar al Tarot Completo';
            btn.disabled = false;
        }
    }
};

// ==========================================
// CERRAR SESIÓN
// ==========================================

window.cerrarSesion = function() {
    // Detener voz si está sonando
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    // Limpiar datos locales
    window.eliminarToken();
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem('simularPremium');
    window.esUsuarioPremium = false;

    // Volver al landing
    if (typeof window.mostrarPantalla === 'function') {
        window.mostrarPantalla('screen-landing');
    }

    console.log("[auth.js] 👋 Sesión cerrada correctamente.");
    
    // Limpiar campos de auth si existen
    const emailInput = document.getElementById('auth-email');
    const nombreInput = document.getElementById('auth-nombre');
    if (emailInput) emailInput.value = '';
    if (nombreInput) nombreInput.value = '';

    // Mostrar mensaje (opcional)
    alert('👋 Sesión cerrada correctamente.');
};

// ==========================================
// VERIFICAR SESIÓN AL CARGAR LA PÁGINA
// ==========================================

window.verificarSesionAlCargar = function() {
    const token = window.obtenerToken();
    const usuario = window.obtenerDatosUsuario();

    if (token && usuario) {
        console.log("[auth.js] 🔐 Sesión activa:", usuario.email);
        // Actualizar estado premium
        if (usuario.plan === 'Premium' || localStorage.getItem('simularPremium') === 'true') {
            window.esUsuarioPremium = true;
        } else {
            window.esUsuarioPremium = false;
        }
        return true;
    }

    console.log("[auth.js] 🔓 No hay sesión activa");
    return false;
};

// ==========================================
// CANJEAR CÓDIGO PREMIUM
// ==========================================

window.canjearCodigoPremium = function(codigo) {
    if (!codigo) return false;

    const codigoLimpio = codigo.trim().toUpperCase();
    
    // Lista de códigos válidos (también se validan en el servidor)
    const CODIGOS_VALIDOS = [
        'ADMIN2026',
        'PASEMISTICO',
        'TAROTGRATIS'
    ];

    if (CODIGOS_VALIDOS.includes(codigoLimpio)) {
        // Actualizar estado local
        window.esUsuarioPremium = true;
        localStorage.setItem('simularPremium', 'true');

        // Actualizar datos del usuario
        const usuario = window.obtenerDatosUsuario();
        if (usuario) {
            usuario.plan = 'Premium';
            window.guardarDatosUsuario(usuario);
        }

        // Actualizar UI
        if (typeof actualizarBadgeMuestrasFisicas === 'function') {
            actualizarBadgeMuestrasFisicas();
        }
        if (typeof actualizarInfoUsuario === 'function') {
            actualizarInfoUsuario();
        }

        alert('✨ ¡Código premium activado con éxito! Ahora tenés acceso a todas las funciones.');
        return true;
    } else {
        alert('❌ Código inválido. Verificá que esté bien escrito.');
        return false;
    }
};

// ==========================================
// INICIALIZACIÓN
// ==========================================

// Verificar sesión al cargar
document.addEventListener('DOMContentLoaded', function() {
    const tieneSesion = window.verificarSesionAlCargar();
    
    // Si hay sesión y estamos en el landing, redirigir a portada?
    // (No lo hacemos automáticamente para no interrumpir la experiencia)
    
    // Cargar email guardado en el campo de auth si existe
    const emailInput = document.getElementById('auth-email');
    if (emailInput) {
        const email = window.obtenerEmailUsuario();
        if (email) {
            emailInput.value = email;
        }
    }

    console.log('[auth.js] ✅ Inicialización completa');
});

// ==========================================
// EXPONER FUNCIONES GLOBALES
// ==========================================

window.auth = {
    obtenerToken: window.obtenerToken,
    guardarToken: window.guardarToken,
    eliminarToken: window.eliminarToken,
    estaLogueado: window.estaLogueado,
    autenticarUsuario: window.autenticarUsuario,
    iniciarSesion: window.iniciarSesion,
    cerrarSesion: window.cerrarSesion,
    obtenerDatosUsuario: window.obtenerDatosUsuario,
    obtenerEmailUsuario: window.obtenerEmailUsuario,
    obtenerPlanUsuario: window.obtenerPlanUsuario,
    esUsuarioPremium: window.esUsuarioPremium,
    canjearCodigoPremium: window.canjearCodigoPremium,
    verificarSesionAlCargar: window.verificarSesionAlCargar
};

console.log("[auth.js] Módulo de autenticación listo");
