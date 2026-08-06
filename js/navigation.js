// ==========================================
// GESTIÓN DE PANTALLAS Y NAVEGACIÓN
// ==========================================

// Variables globales de estado de navegación
window.submodoFisicoActual = window.submodoFisicoActual || 'predictivo_fisico';

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
        if (typeof window.verificarAccesoTarotista === 'function') {
            window.verificarAccesoTarotista();
        } else if (typeof verificarAccesoTarotista === 'function') {
            verificarAccesoTarotista();
        }
        return;
    }

    // Usamos el ID EXACTO del HTML: "screen-selector"
    mostrarPantalla('screen-selector'); 
}

// Alias para los botones de la portada onclick="irAlEjeConsulta('magico')"
function irAlEjeConsulta(estilo = 'magico') {
    seleccionarEstilo(estilo);
}

// ==========================================
// GESTIÓN DE MAZO FÍSICO
// ==========================================

// 1. Abre la pantalla del Mazo Físico (screen-fisico) registrando el submodo recibido
function abrirSeleccionFisico(submodo = 'predictivo_fisico') {
    window.submodoFisicoActual = submodo;
    window.modoFisicoActivo = true;
    
    // Si la función para poblar los selectores con los 78 arcanos existe, la ejecutamos
    if (typeof window.cargarSelectoresFisicos === 'function') {
        window.cargarSelectoresFisicos();
    } else if (typeof cargarSelectoresFisicos === 'function') {
        cargarSelectoresFisicos();
    }
    
    mostrarPantalla('screen-fisico');
}

// Alias de retrocompatibilidad
function abrirModoFisico() {
    abrirSeleccionFisico('predictivo_fisico');
}

// 2. Valida las 4 cartas seleccionadas en screen-fisico antes de avanzar al eje de consulta
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

    // Si las cartas están elegidas, mostramos la pantalla para elegir el Eje
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
    if (typeof window.procesarTiradaCompleta === 'function') {
        window.procesarTiradaCompleta(tema, null);
    } else if (typeof procesarTiradaCompleta === 'function') {
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

    if (typeof window.procesarTiradaCompleta === 'function') {
        window.procesarTiradaCompleta("Consulta Personalizada", preguntaText);
        if (inputPregunta) inputPregunta.value = ''; // Limpia el cuadro tras procesar
    } else if (typeof procesarTiradaCompleta === 'function') {
        procesarTiradaCompleta("Consulta Personalizada", preguntaText);
        if (inputPregunta) inputPregunta.value = ''; // Limpia el cuadro tras procesar
    }
}

// ==========================================
// EXPORTACIÓN EXPLÍCITA AL OBJETO WINDOW
// ==========================================
window.ocultarTodasLasPantallas = ocultarTodasLasPantallas;
window.mostrarPantalla = mostrarPantalla;
window.seleccionarEstilo = seleccionarEstilo;
window.irAlEjeConsulta = irAlEjeConsulta;
window.abrirSeleccionFisico = abrirSeleccionFisico;
window.abrirModoFisico = abrirModoFisico;
window.irAlEjeFisico = irAlEjeFisico;
window.volverAPortada = volverAPortada;
window.volverInicio = volverInicio;
window.abrirModuloProfesional = abrirModuloProfesional;
window.volverAlModuloProfesional = volverAlModuloProfesional;
window.abrirGuiaLectura = abrirGuiaLectura;
window.abrirPantallaPregunta = abrirPantallaPregunta;
window.pedirEmailAlUsuario = pedirEmailAlUsuario;
window.ejecutarLecturaSegunModo = ejecutarLecturaSegunModo;
window.confirmarPreguntaYEjecutar = confirmarPreguntaYEjecutar;
