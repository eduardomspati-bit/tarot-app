// ==========================================
// AUTH - Gestión de Autenticación y Sesión
// ==========================================

const API_BASE = (typeof window.SERVIDOR_URL !== 'undefined')
    ? window.SERVIDOR_URL.replace('/tirada', '')
    : 'https://tarot-613b.onrender.com';

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
            const response = await fetch(`${API_BASE}/api/auth/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nombre || 'Consultante', email })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem('tarotia_token', data.token);
                localStorage.setItem('tarotia_email_usuario', email);
                localStorage.setItem('tarotia_nombre_usuario', data.usuario?.nombre || nombre);
                if (data.usuario?.plan === 'Premium') {
                    localStorage.setItem('tarotia_plan_premium', 'true');
                    window.esUsuarioPremium = true;
                }
                if (typeof window.actualizarBadgeMuestrasFisicas === 'function') {
                    window.actualizarBadgeMuestrasFisicas();
                }
                return { exito: true, token: data.token, usuario: data.usuario };
            } else {
                return { exito: false, mensaje: data.error || 'Error del servidor' };
            }
        } catch (error) {
            console.warn("⚠️ Error de red al autenticar:", error);
            return { exito: false, mensaje: 'Sin conexión al servidor. Intenta más tarde.' };
        }
    },

    // Verificar si hay una sesión activa (token válido guardado)
    verificarSesionActiva: function() {
        const token = localStorage.getItem('tarotia_token');
        const email = localStorage.getItem('tarotia_email_usuario');
        return Boolean(token && email && email.includes('@'));
    },

    // Obtener información del usuario actual
    obtenerUsuario: function() {
        return {
            email: localStorage.getItem('tarotia_email_usuario') || '',
            nombre: localStorage.getItem('tarotia_nombre_usuario') || 'Consultante',
            esPremium: localStorage.getItem('tarotia_plan_premium') === 'true'
        };
    },

    // Cerrar sesión completa
    cerrarSesion: function() {
        localStorage.removeItem('tarotia_token');
        localStorage.removeItem('tarotia_email_usuario');
        localStorage.removeItem('tarotia_nombre_usuario');
        localStorage.removeItem('tarotia_plan_premium');
        localStorage.removeItem('tarotia_libres_usadas');
        localStorage.removeItem('tarotia_submodo_fisico');
        window.esUsuarioPremium = false;

        if (typeof window.mostrarPantalla === 'function') {
            window.mostrarPantalla('screen-auth');
        }
    }
};

// ==========================================
// EXPOSICIÓN GLOBAL DE FUNCIONES
// ==========================================

window.iniciarSesion = function() {
    AuthModule.iniciarSesion();
};

window.autenticarUsuario = async function(nombre, email) {
    return await AuthModule.autenticarUsuario(nombre, email);
};

window.obtenerToken = function() {
    return localStorage.getItem('tarotia_token');
};

window.verificarSesionActiva = function() {
    return AuthModule.verificarSesionActiva();
};

window.obtenerUsuarioActual = function() {
    return AuthModule.obtenerUsuario();
};

window.cerrarSesionTarot = function() {
    AuthModule.cerrarSesion();
};

console.log("[auth.js] Módulo de autenticación corregido y cargado");
