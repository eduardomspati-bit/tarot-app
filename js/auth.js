// ==========================================
// AUTH - Gestión de Autenticación y Sesión
// ==========================================

const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined')
    ? window.SERVIDOR_URL.replace('/tirada', '')
    : 'https://tarot-613b.onrender.com';

// ==========================================
// PROTECCIÓN PARA MODO INCÓGNITO (FALLBACK)
// ==========================================

(function() {
    try {
        const test = 'test_' + Date.now();
        localStorage.setItem(test, 'ok');
        localStorage.removeItem(test);
        console.log("[auth.js] ✅ localStorage disponible");
    } catch (e) {
        console.warn("[auth.js] ⚠️ localStorage NO disponible (modo incógnito)");
        // Crear un localStorage falso en memoria
        const memoryStorage = {};
        const originalSetItem = localStorage.setItem;
        const originalGetItem = localStorage.getItem;
        const originalRemoveItem = localStorage.removeItem;
        
        localStorage.setItem = function(key, value) {
            try {
                originalSetItem.call(localStorage, key, value);
            } catch (e) {
                memoryStorage[key] = String(value);
                console.log("[auth.js] 📝 Guardado en memoria:", key);
            }
        };
        
        localStorage.getItem = function(key) {
            try {
                return originalGetItem.call(localStorage, key);
            } catch (e) {
                return memoryStorage[key] || null;
            }
        };
        
        localStorage.removeItem = function(key) {
            try {
                originalRemoveItem.call(localStorage, key);
            } catch (e) {
                delete memoryStorage[key];
            }
        };
    }
})();

// ==========================================
// MÓDULO PRINCIPAL DE AUTENTICACIÓN
// ==========================================

const AuthModule = {
    // Iniciar sesión con email desde la pantalla de auth
    iniciarSesion: async function() {
        const emailInput = document.getElementById('auth-email');
        const nombreInput = document.getElementById('auth-nombre');
        const errorElement = document.getElementById('auth-error');

        if (!emailInput || !errorElement) return;

        const email = emailInput.value.trim().toLowerCase();
        const nombre = nombreInput ? nombreInput.value.trim() : '';

        if (!email || !email.includes('@') || !email.includes('.')) {
            errorElement.textContent = "⚠️ Por favor, ingresa un correo electrónico válido.";
            errorElement.style.display = 'block';
            return;
        }

        errorElement.style.display = 'none';

        const resultado = await this.autenticarUsuario(nombre || 'Consultante', email);
        if (resultado.exito) {
            // Actualizar badge global
            if (typeof window.actualizarBadgeGlobal === 'function') {
                await window.actualizarBadgeGlobal();
            }
            if (typeof window.mostrarPantalla === 'function') {
                window.mostrarPantalla('screen-portada');
            }
        } else {
            errorElement.textContent = resultado.mensaje || "Error al registrar. Intenta de nuevo.";
            errorElement.style.display = 'block';
        }
    },

    // Registra o loguea al usuario en el backend y guarda el token JWT
    autenticarUsuario: async function(nombre, email) {
        try {
            console.log("[auth.js] Registrando usuario:", email);
            
            const response = await fetch(`${API_BASE}/api/auth/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nombre || 'Consultante', email })
            });

            const data = await response.json();
            console.log("[auth.js] Respuesta del servidor:", data);

            if (response.ok && data.token) {
                // Guardar token y datos
                localStorage.setItem('tarotia_token', data.token);
                localStorage.setItem('tarotia_email_usuario', email);
                localStorage.setItem('tarotia_nombre_usuario', data.usuario?.nombre || nombre);
                
                // Guardar plan
                if (data.usuario?.plan === 'Premium') {
                    localStorage.setItem('tarotia_plan_premium', 'true');
                    window.esUsuarioPremium = true;
                } else {
                    localStorage.setItem('tarotia_plan_premium', 'false');
                    window.esUsuarioPremium = false;
                }

                // Guardar cuántas muestras tiene en la nube (para el badge)
                if (data.usuario?.muestrasFisicasRestantes !== undefined) {
                    localStorage.setItem('tarotia_muestras_restantes', data.usuario.muestrasFisicasRestantes);
                }

                // Actualizar badge global si existe
                if (typeof window.actualizarBadgeGlobal === 'function') {
                    setTimeout(() => window.actualizarBadgeGlobal(), 100);
                }

                console.log("[auth.js] ✅ Usuario autenticado:", email, "Plan:", data.usuario?.plan || 'Gratis');
                return { 
                    exito: true, 
                    token: data.token, 
                    usuario: data.usuario,
                    muestrasRestantes: data.usuario?.muestrasFisicasRestantes || 5
                };
            } else {
                console.warn("[auth.js] Error del servidor:", data.error);
                return { exito: false, mensaje: data.error || 'Error del servidor' };
            }
        } catch (error) {
            console.error("[auth.js] Error de red:", error);
            return { exito: false, mensaje: 'Sin conexión al servidor. Intenta más tarde.' };
        }
    },

    // Verificar si hay una sesión activa (token válido guardado)
    verificarSesionActiva: function() {
        try {
            const token = localStorage.getItem('tarotia_token');
            const email = localStorage.getItem('tarotia_email_usuario');
            return Boolean(token && email && email.includes('@'));
        } catch (e) {
            return false;
        }
    },

    // Obtener información del usuario actual
    obtenerUsuario: function() {
        try {
            return {
                email: localStorage.getItem('tarotia_email_usuario') || '',
                nombre: localStorage.getItem('tarotia_nombre_usuario') || 'Consultante',
                esPremium: localStorage.getItem('tarotia_plan_premium') === 'true'
            };
        } catch (e) {
            return { email: '', nombre: 'Consultante', esPremium: false };
        }
    },

    // Obtener muestras restantes (desde localStorage o servidor)
    obtenerMuestrasRestantes: function() {
        try {
            const restantes = localStorage.getItem('tarotia_muestras_restantes');
            return restantes ? parseInt(restantes, 10) : 5;
        } catch (e) {
            return 5;
        }
    },

    // Cerrar sesión completa
    cerrarSesion: function() {
        try {
            localStorage.removeItem('tarotia_token');
            localStorage.removeItem('tarotia_email_usuario');
            localStorage.removeItem('tarotia_nombre_usuario');
            localStorage.removeItem('tarotia_plan_premium');
            localStorage.removeItem('tarotia_libres_usadas');
            localStorage.removeItem('tarotia_submodo_fisico');
            localStorage.removeItem('tarotia_muestras_restantes');
            window.esUsuarioPremium = false;

            if (typeof window.mostrarPantalla === 'function') {
                window.mostrarPantalla('screen-auth');
            }
        } catch (e) {
            console.warn("[auth.js] Error al cerrar sesión:", e);
        }
    },

    // Verificar estado del usuario en el servidor
    verificarEstadoEnServidor: async function() {
        const token = this.obtenerToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE}/api/auth/perfil`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const esPremium = data.usuario?.plan === 'Premium';
                const muestrasRestantes = data.usuario?.muestrasFisicasRestantes || 0;
                
                // Actualizar localStorage
                localStorage.setItem('tarotia_plan_premium', esPremium ? 'true' : 'false');
                localStorage.setItem('tarotia_muestras_restantes', muestrasRestantes);
                window.esUsuarioPremium = esPremium;
                
                return { esPremium, muestrasRestantes, usuario: data.usuario };
            } else {
                // Token inválido → cerrar sesión
                this.cerrarSesion();
                return null;
            }
        } catch (e) {
            console.warn("[auth.js] No se pudo verificar en el servidor:", e);
            return null;
        }
    }
};

// ==========================================
// EXPOSICIÓN GLOBAL DE FUNCIONES
// ==========================================

// Función para iniciar sesión desde la UI
window.iniciarSesion = function() {
    AuthModule.iniciarSesion();
};

// Función para autenticar usuario (usada por access.js)
window.autenticarUsuario = async function(nombre, email) {
    return await AuthModule.autenticarUsuario(nombre, email);
};

// Obtener token JWT
window.obtenerToken = function() {
    try {
        return localStorage.getItem('tarotia_token');
    } catch (e) {
        return null;
    }
};

// Verificar si hay sesión activa
window.verificarSesionActiva = function() {
    return AuthModule.verificarSesionActiva();
};

// Obtener usuario actual
window.obtenerUsuarioActual = function() {
    return AuthModule.obtenerUsuario();
};

// Obtener muestras restantes
window.obtenerMuestrasRestantes = function() {
    return AuthModule.obtenerMuestrasRestantes();
};

// Verificar estado en el servidor
window.verificarEstadoServidor = async function() {
    return await AuthModule.verificarEstadoEnServidor();
};

// Cerrar sesión
window.cerrarSesionTarot = function() {
    AuthModule.cerrarSesion();
};

// ==========================================
// INICIALIZACIÓN AUTOMÁTICA
// ==========================================

// Cuando el DOM esté listo, verificar sesión
document.addEventListener('DOMContentLoaded', async () => {
    console.log("[auth.js] DOM listo, verificando sesión...");
    
    // Si hay token, verificar estado en el servidor
    if (window.obtenerToken()) {
        const estado = await AuthModule.verificarEstadoEnServidor();
        if (estado) {
            console.log("[auth.js] ✅ Sesión activa:", estado.usuario?.email, "Plan:", estado.esPremium ? 'Premium' : 'Gratis');
            // Actualizar badge global
            if (typeof window.actualizarBadgeGlobal === 'function') {
                await window.actualizarBadgeGlobal();
            }
        }
    } else {
        console.log("[auth.js] ℹ️ No hay sesión activa");
    }
});

console.log("[auth.js] ✅ Módulo de autenticación cargado (versión con 5 lecturas gratuitas)");
