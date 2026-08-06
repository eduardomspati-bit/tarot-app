// ==========================================
// GESTIÓN DE PANTALLAS Y ESTADOS GLOBALES
// ==========================================

// Variables de estado del sistema
window.estiloSeleccionado = 'magico';          // 'magico' o 'filosofico'
window.modoFisicoActivo = false;              // false = Automático | true = Mazo Físico
window.submodoFisicoActual = 'predictivo_fisico'; // 'predictivo_fisico' o 'tarotista_fisico'

// Oculta todas las pantallas activas
function ocultarTodasLasPantallas() {
    const pantallas = document.querySelectorAll('.screen');
    pantallas.forEach(p => {
        p.classList.add('hidden');
        p.style.display = 'none';
    });
}

// Muestra una pantalla específica por su ID
function mostrarPantalla(idPantalla) {
    ocultarTodasLasPantallas();
    const pantalla = document.getElementById(idPantalla);
    if (pantalla) {
        pantalla.classList.remove('hidden');
        pantalla.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.error(`La pantalla con ID '${idPantalla}' no existe.`);
    }
}

// ==========================================
// RUTAS Y FLUJOS DE LECTURA
// ==========================================

// 1. FLUJO AUTOMÁTICO: Estilo Mágico o Filosófico (Gratis)
function seleccionarEstiloAutomatico(estilo) {
    window.estiloSeleccionado = estilo;
    window.modoFisicoActivo = false; // Fuerza el modo automático (cartas aleatorias)
    
    mostrarPantalla('screen-selector'); // Pasa directo a elegir tema (Amor, Negocios, etc.)
}

// 2. FLUJO MAZO FÍSICO: Menú de Selección de 4 Cartas (Módulo Profesional)
function abrirSeleccionFisico(submodo = 'predictivo_fisico') {
    window.submodoFisicoActual = submodo;
    window.modoFisicoActivo = true; // Activa la lectura desde los selectores manuales
    
    // Poblamos los selectores con las 78 cartas si la función está lista
    if (typeof window.cargarSelectoresFisicos === 'function') {
        window.cargarSelectoresFisicos();
    }
    
    mostrarPantalla('screen-fisico'); // Abre el menú para elegir las 4 cartas
}

// 3. Confirmación del Mazo Físico
function irAlEjeFisico() {
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
// NAVEGACIÓN GENERAL Y MODALES
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

function abrirHistorial() {
    mostrarPantalla('screen-historial');
    if (typeof window.renderizarHistorialUI === 'function') {
        window.renderizarHistorialUI();
    }
}

function abrirPantallaPregunta() {
    mostrarPantalla('screen-pregunta');
    const inputPregunta = document.getElementById('texto-pregunta-usuario');
    if (inputPregunta) {
        inputPregunta.value = '';
        setTimeout(() => inputPregunta.focus(), 100);
    }
}

// Disparadores de lectura desde la pantalla de ejes/temas
function ejecutarLecturaSegunModo(tema) {
    if (typeof window.procesarTiradaCompleta === 'function') {
        window.procesarTiradaCompleta(tema, null);
    }
}

function confirmarPreguntaYEjecutar() {
    const inputPregunta = document.getElementById('texto-pregunta-usuario');
    const preguntaText = inputPregunta ? inputPregunta.value.trim() : "";
    
    if (!preguntaText) {
        alert("✨ Por favor, escribe tu pregunta antes de continuar.");
        return;
    }

    if (typeof window.procesarTiradaCompleta === 'function') {
        window.procesarTiradaCompleta("Consulta Personalizada", preguntaText);
        if (inputPregunta) inputPregunta.value = '';
    }
}

async function pedirEmailAlUsuario() {
    const email = prompt("📧 Ingresa tu correo electrónico para vincular tu cuenta y respaldar tus lecturas:");
    if (email && email.includes('@')) {
        const emailLimpio = email.trim().toLowerCase();
        localStorage.setItem('tarotUserEmail', emailLimpio);
        alert(`¡Gracias! Tu correo (${emailLimpio}) ha sido guardado exitosamente.`);
    } else if (email) {
        alert("❌ Por favor, ingresa un correo electrónico válido.");
    }
}

// Exportación explícita a window para compatibilidad total con el HTML
window.ocultarTodasLasPantallas = ocultarTodasLasPantallas;
window.mostrarPantalla = mostrarPantalla;
window.seleccionarEstiloAutomatico = seleccionarEstiloAutomatico;
window.abrirSeleccionFisico = abrirSeleccionFisico;
window.irAlEjeFisico = irAlEjeFisico;
window.volverAPortada = volverAPortada;
window.volverInicio = volverInicio;
window.abrirModuloProfesional = abrirModuloProfesional;
window.volverAlModuloProfesional = volverAlModuloProfesional;
window.abrirGuiaLectura = abrirGuiaLectura;
window.abrirHistorial = abrirHistorial;
window.abrirPantallaPregunta = abrirPantallaPregunta;
window.ejecutarLecturaSegunModo = ejecutarLecturaSegunModo;
window.confirmarPreguntaYEjecutar = confirmarPreguntaYEjecutar;
window.pedirEmailAlUsuario = pedirEmailAlUsuario;
