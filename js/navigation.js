
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
