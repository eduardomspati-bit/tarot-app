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

// Confirmación para avanzar desde Mazo Físico al Selector de Eje
function irAlEjeFisico() {
    window.modoFisicoActivo = true;
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

function pedirEmailAlUsuario() {
    const email = prompt("📧 Ingresa tu correo electrónico para vincular tu cuenta y respaldar tus lecturas:");
    if (email && email.includes('@')) {
        localStorage.setItem('tarotUserEmail', email.trim().toLowerCase());
        alert(`¡Gracias! Tu correo (${email.trim()}) ha sido vinculado exitosamente.`);
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
