// ==========================================
// AUTH - Gestión de Autenticación y Sesión
// ==========================================

const AuthModule = {
    // Iniciar sesión con email y nombre opcional desde la interfaz
    iniciarSesion: function() {
        const emailInput = document.getElementById('auth-email');
        const nombreInput = document.getElementById('auth-nombre');
        const errorElement = document.getElementById('auth-error');

        if (!emailInput || !errorElement) return;

        const email = emailInput.value.trim().toLowerCase();
        const nombre = nombreInput ? nombreInput.value.trim() : '';

        // Validación básica de correo electrónico
        if (!email || !email.includes('@') || !email.includes('.')) {
            errorElement.textContent = "⚠️ Por favor, ingresa un correo electrónico válido.";
            errorElement.style.display = 'block';
            return;
        }

        errorElement.style.display = 'none';

        // Guardar credenciales en el almacenamiento local
        localStorage.setItem('tarotia_email_usuario', email);
        if (nombre) {
            localStorage.setItem('tarotia_nombre_usuario', nombre);
        }

        // Sincronizar o registrar el usuario en tu backend (MongoDB / Render)
        this.sincronizarUsuarioBackend(email, nombre);

        // Redirigir a la portada principal de la app
        if (typeof window.mostrarPantalla === 'function') {
            window.mostrarPantalla('screen-portada');
        }
    },

    // Sincronización asíncrona con tu backend
    sincronizarUsuarioBackend: async function(email, nombre) {
        try {
            // Reemplaza o ajusta la URL base de tu backend en Render si es necesario
            const backendUrl = window.BACKEND_URL || '';
            if (!backendUrl) return;

            const response = await fetch(`${backendUrl}/api/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, nombre })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.premium) {
                    localStorage.setItem('tarotia_plan_premium', 'true');
                }
            }
        } catch (error) {
            console.warn("⚠️ Modo offline o sin conexión al backend de usuarios:", error);
        }
    },

    // Verificar si hay una sesión activa
    verificarSesionActiva: function() {
        const email = localStorage.getItem('tarotia_email_usuario');
        return Boolean(email && email.includes('@'));
    },

    // Obtener información del usuario actual
    obtenerUsuario: function() {
        return {
            email: localStorage.getItem('tarotia_email_usuario') || '',
            nombre: localStorage.getItem('tarotia_nombre_usuario') || 'Consultante',
            esPremium: localStorage.getItem('tarotia_plan_premium') === 'true'
        };
    },

    // Cerrar sesión
    cerrarSesion: function() {
        localStorage.removeItem('tarotia_email_usuario');
        localStorage.removeItem('tarotia_nombre_usuario');
        localStorage.removeItem('tarotia_plan_premium');
        
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

window.verificarSesionActiva = function() {
    return AuthModule.verificarSesionActiva();
};

window.obtenerUsuarioActual = function() {
    return AuthModule.obtenerUsuario();
};

window.cerrarSesionTarot = function() {
    AuthModule.cerrarSesion();
};

console.log("[auth.js] Módulo de autenticación avanzado cargado correctamente");
