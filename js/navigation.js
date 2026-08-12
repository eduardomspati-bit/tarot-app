// Variable global para capturar la pregunta personalizada
window.preguntaCustomSeleccionada = "";

// Funcion principal para cambiar de pantalla
window.mostrarPantalla = function(idPantalla) {
    var pantallas = document.querySelectorAll('.screen');
    pantallas.forEach(function(p) {
        p.style.display = 'none';
        p.classList.add('hidden');
    });

    var destino = document.getElementById(idPantalla);
    if (destino) {
        destino.style.display = 'block';
        destino.classList.remove('hidden');
        window.scrollTo(0, 0);
    } else {
        console.error("Pantalla no encontrada: " + idPantalla);
    }
};

// Entrar a la app completa (desde landing)
window.entrarAppCompleta = function() {
    if (document.getElementById('screen-auth')) {
        window.mostrarPantalla('screen-auth');
    } else {
        window.mostrarPantalla('screen-portada');
    }
};

// Volver a landing
window.volverALanding = function() {
    window.mostrarPantalla('screen-landing');
};

// Seleccion de Estilo Automatico
window.seleccionarEstiloAutomatico = function(estilo) {
    window.estiloSeleccionado = estilo;
    window.modoFisicoActivo = false;
    window.preguntaCustomSeleccionada = "";
    console.log("Modo Automatico Activado: " + estilo);
    window.mostrarPantalla('screen-selector');
};

// Modulo Profesional
window.abrirModuloProfesional = function() {
    window.mostrarPantalla('screen-modulo-profesional');
};

// Abrir Mazo Fisico desde Modulo Profesional
window.abrirSeleccionFisico = function(submodo) {
    window.modoFisicoActivo = true;
    window.submodoFisicoActual = submodo;

    if (typeof window.cargarSelectoresFisicos === 'function') {
        window.cargarSelectoresFisicos();
    }

    window.mostrarPantalla('screen-fisico');
};

// Confirmar Mazo Fisico y pasar a los Temas
window.irAlEjeFisico = function() {
    var c1 = document.getElementById('fisico-carta1');
    var c2 = document.getElementById('fisico-carta2');
    var c3 = document.getElementById('fisico-carta3');
    var c4 = document.getElementById('fisico-carta4');

    if (!c1 || !c2 || !c3 || !c4) {
        alert("Por favor selecciona las 4 cartas de tu mazo fisico.");
        return;
    }

    var v1 = c1.value;
    var v2 = c2.value;
    var v3 = c3.value;
    var v4 = c4.value;

    if (!v1 || !v2 || !v3 || !v4) {
        alert("Por favor selecciona las 4 cartas de tu mazo fisico.");
        return;
    }

    var seleccionadas = [v1, v2, v3, v4];
    var unicas = {};
    var todasUnicas = true;
    for (var i = 0; i < seleccionadas.length; i++) {
        if (unicas[seleccionadas[i]]) {
            todasUnicas = false;
            break;
        }
        unicas[seleccionadas[i]] = true;
    }

    if (!todasUnicas) {
        alert("No podes repetir cartas en una misma tirada.");
        return;
    }

    window.mostrarPantalla('screen-selector');
};

// Pregunta Especifica
window.abrirPantallaPregunta = function() {
    var txtArea = document.getElementById('texto-pregunta-usuario');
    if (txtArea) txtArea.value = "";
    window.mostrarPantalla('screen-pregunta');
};

window.confirmarPreguntaYEjecutar = function() {
    var txtArea = document.getElementById('texto-pregunta-usuario');
    window.preguntaCustomSeleccionada = txtArea ? txtArea.value.trim() : "";

    if (!window.preguntaCustomSeleccionada) {
        alert("Por favor escribe tu pregunta antes de continuar.");
        return;
    }

    window.ejecutarLecturaSegunModo('Pregunta Especifica');
};

// Ejecucion de la lectura
window.ejecutarLecturaSegunModo = function(tema) {
    if (typeof window.procesarTiradaCompleta === 'function') {
        window.procesarTiradaCompleta(tema, window.preguntaCustomSeleccionada);
    } else {
        console.error("Error: No existe procesarTiradaCompleta");
    }
};

// Navegacion de regreso
window.volverAPortada = function() {
    window.modoFisicoActivo = false;
    window.mostrarPantalla('screen-portada');
};

window.volverInicio = function() {
    window.volverAPortada();
};

window.abrirGuiaLectura = function() {
    window.mostrarPantalla('screen-guia-lectura');
};

window.volverAlModuloProfesional = function() {
    window.mostrarPantalla('screen-modulo-profesional');
};

// Historial
window.abrirHistorial = function() {
    if (typeof window.cargarHistorial === 'function') {
        window.cargarHistorial();
    }
    window.mostrarPantalla('screen-historial');
};

// Boton de email / usuario
window.pedirEmailAlUsuario = function() {
    if (typeof window.mostrarMenuUsuario === 'function') {
        window.mostrarMenuUsuario();
    } else if (document.getElementById('screen-auth')) {
        window.mostrarPantalla('screen-auth');
    } else {
        var email = prompt("Ingresa tu correo electronico para vincular tu cuenta:");
        if (email && email.includes('@')) {
            localStorage.setItem('tarotia_email_usuario', email);
            alert("Correo " + email + " vinculado correctamente.");
        }
    }
};

// Carta del Dia
window.tirarCartaDiaria = function() {
    var mazo = [
        "El Loco", "El Mago", "La Sacerdotisa", "La Emperatriz", "El Emperador",
        "Los Enamorados", "El Carro", "La Justicia", "El Ermitanio", "La Rueda de la Fortuna",
        "La Fuerza", "El Colgado", "La Muerte", "La Templanza", "El Diablo",
        "La Torre", "La Estrella", "La Luna", "El Sol", "El Juicio", "El Mundo"
    ];
    var carta = mazo[Math.floor(Math.random() * mazo.length)];
    alert("Tu Carta del Dia es: " + carta + "\n\nReflexiona sobre su mensaje durante el dia.");
};
