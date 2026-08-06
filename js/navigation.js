// ==========================================
// GESTIÓN DE PANTALLAS Y NAVEGACIÓN
// ==========================================

function ocultarTodasLasPantallas() {
    const pantallas = document.querySelectorAll('.screen');
    pantallas.forEach(p => {
        p.classList.add('hidden');
        p.style.display = 'none';
    });
}

function mostrarPantalla(idPantalla) {
    ocultarTodasLasPantallas();
    const pantalla = document.getElementById(idPantalla);
    if (pantalla) {
        pantalla.classList.remove('hidden');
        pantalla.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Asegura que la pantalla abra desde arriba
    } else {
        console.error(`La pantalla con ID '${idPantalla}' no existe en el HTML.`);
    }
}

// Resuelve la selección de Estilo Mágico, Filosófico, etc.
function seleccionarEstilo(estilo) {
    window.estiloSeleccionado = estilo;
    window.modoFisicoActivo = false;

    if (estilo === 'manual') {
        if (typeof verificarAccesoTarotista === 'function') {
            verificarAccesoTarotista();
        }
        return;
    }

    // Usamos el ID EXACTO del HTML: "screen-selector"
    mostrarPantalla('screen-selector'); 
}

// Alias para los botones de tu portada onclick="irAlEjeConsulta('magico')"
function irAlEjeConsulta(estilo = 'magico') {
    seleccionarEstilo(estilo);
}

// 1. Abre el selector de cartas físicas sin disparar la lectura
function abrirModoFisico() {
    window.modoFisicoActivo = true;
    mostrarPantalla('screen-fisico');
}

// 2. Valida las cartas seleccionadas antes de pasar al Eje de Consulta
function irAlEjeFisico() {
    window.modoFisicoActivo = true;

    // Verificar si el usuario ya seleccionó las 4 cartas físicas
    const c1 = document.getElementById('fisico-carta1')?.value;
    const c2 = document.getElementById('fisico-carta2')?.value;
    const c3 = document.getElementById('fisico-carta3')?.value;
    const c4 = document.getElementById('fisico-carta4')?.value;

    if (!c1 || !c2 || !c3 || !c4) {
        alert("⚠️ Por favor, selecciona las 4 cartas físicas antes de continuar.");
        return;
    }

    mostrarPantalla('screen-selector');
}

// ==========================================
// RUTAS Y SUBPANTALLAS
// ==========================================

function volverAPortada() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    window.modoFisicoActivo = false;
    mostrarPantalla('screen-portada');
}

function volverInicio() {
    volverAPortada();
}

function abrirModuloProfesional() {
    mostrarPantalla('screen-modulo-profesional');
}

function volverAlModuloProfesional() {
    mostrarPantalla('screen-modulo-profesional');
}

function abrirGuiaLectura() {
    mostrarPantalla('screen-guia-lectura');
}

function abrirPantallaPregunta() {
    mostrarPantalla('screen-pregunta');
    const inputPregunta = document.getElementById('texto-pregunta-usuario');
    if (inputPregunta) {
        inputPregunta.value = ''; // Limpia el texto de preguntas previas
        setTimeout(() => inputPregunta.focus(), 100);
    }
}

// ==========================================
// FUNCIONES AUXILIARES / UTILIDADES
// ==========================================

async function pedirEmailAlUsuario() {
    const email = prompt("📧 Ingresa tu correo electrónico para vincular tu cuenta y respaldar tus lecturas:");
    
    if (email && email.includes('@')) {
        const emailLimpio = email.trim().toLowerCase();
        
        // 1. Guardar localmente
        localStorage.setItem('tarotUserEmail', emailLimpio);

        // 2. Enviar a MongoDB Atlas a través de Render
        try {
            const respuesta = await fetch('https://tarot-613b.onrender.com/api/usuarios/registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: 'Consultante Místico',
                    email: emailLimpio
                })
            });

            const data = await respuesta.json();
            console.log('✅ Usuario registrado exitosamente en MongoDB:', data);
            
            alert(`¡Gracias! Tu correo (${emailLimpio}) ha sido vinculado exitosamente.`);
        } catch (error) {
            console.error('❌ Error al guardar en el servidor:', error);
            alert(`¡Gracias! Tu correo (${emailLimpio}) ha sido guardado localmente.`);
        }

    } else if (email) {
        alert("❌ Por favor, ingresa un correo electrónico válido.");
    }
}

// Lógica para ejecutar la lectura según si es pregunta fija (Amor, Negocios, etc.)
function ejecutarLecturaSegunModo(tema) {
    if (typeof procesarTiradaCompleta === 'function') {
        procesarTiradaCompleta(tema, null);
    }
}

// Lógica cuando el usuario hace una Pregunta Específica Custom
function confirmarPreguntaYEjecutar() {
    const inputPregunta = document.getElementById('texto-pregunta-usuario');
    const preguntaText = inputPregunta ? inputPregunta.value.trim() : "";
    
    if (!preguntaText) {
        alert("✨ Por favor, escribe tu pregunta antes de continuar.");
        return;
    }

    if (typeof procesarTiradaCompleta === 'function') {
        procesarTiradaCompleta("Consulta Personalizada", preguntaText);
        if (inputPregunta) inputPregunta.value = ''; // Limpia el cuadro tras procesar
    }
}
