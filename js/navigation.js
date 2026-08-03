
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
    }
}

// Resuelve la llamada de los botones onclick="volverAPortada()"
function volverAPortada() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    window.modoFisicoActivo = false;
    mostrarPantalla('screen-portada');
}

// Alias de respaldo para botones que llamen a volverInicio()
function volverInicio() {
    volverAPortada();
}

function abrirModuloProfesional() {
    mostrarPantalla('screen-modulo-profesional');
}

function abrirPantallaPregunta() {
    mostrarPantalla('screen-pregunta');
}
// ==========================================
// SELECCIÓN DE ESTILO Y NAVEGACIÓN
// ==========================================

// Función que se ejecuta cuando hacés clic en "Estilo Mágico", "Filosófico", etc.
function seleccionarEstilo(estilo) {
    // 1. Guardamos el estilo en la variable global
    window.estiloSeleccionado = estilo;
    window.modoFisicoActivo = false;

    // 2. Si es estilo manual/tarotista, validamos acceso
    if (estilo === 'manual') {
        if (typeof verificarAccesoTarotista === 'function') {
            verificarAccesoTarotista();
        }
        return;
    }

    // 3. Abrimos la pantalla con la lista de Ejes Temáticos
    mostrarPantalla('screen-ejes');
}

// Función auxiliar para ir a los ejes temáticos (por si tus botones la llaman directo)
function irAlEjeConsulta(estilo = 'magico') {
    seleccionarEstilo(estilo);
}
