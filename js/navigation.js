// ==========================================
// NAVEGACIÓN Y CONTROL DE FLUJO
// ==========================================

// Variable global para capturar la pregunta personalizada si la hay
window.preguntaCustomSeleccionada = "";

// Función principal para cambiar de pantalla
window.mostrarPantalla = function(idPantalla) {
    const pantallas = document.querySelectorAll('.screen');
    pantallas.forEach(p => {
        p.style.display = 'none';
        p.classList.add('hidden');
    });

    const destino = document.getElementById(idPantalla);
    if (destino) {
        destino.style.display = 'block';
        destino.classList.remove('hidden');
        window.scrollTo(0, 0);
    } else {
        console.error(`❌ No se encontró la pantalla: ${idPantalla}`);
    }
};

// 1. Selección de Estilo Automático desde la Portada (Mágico / Filosófico)
window.seleccionarEstiloAutomatico = function(estilo) {
    window.estiloSeleccionado = estilo;
    window.modoFisicoActivo = false;
    window.preguntaCustomSeleccionada = "";
    window.cartasFisicoSeleccionadas = null;
    window.submodoFisicoActual = null;

    console.log(`✨ Modo Automático Activado: ${estilo}`);
    window.mostrarPantalla('screen-selector');
};

// 2. Módulo Profesional
window.abrirModuloProfesional = function() {
    window.mostrarPantalla('screen-modulo-profesional');
};

// 3. Abrir Mazo Físico desde Módulo Profesional
window.abrirSeleccionFisico = function(submodo) {
    window.modoFisicoActivo = true;
    window.submodoFisicoActual = submodo; // 'predictivo_fisico' o 'tarotista_fisico'
    window.cartasFisicoSeleccionadas = null;
    window.preguntaCustomSeleccionada = "";

    if (typeof window.cargarSelectoresFisicos === 'function') {
        window.cargarSelectoresFisicos();
    }

    window.mostrarPantalla('screen-fisico');
};

// 4. Confirmar Mazo Físico
window.irAlEjeFisico = function() {
    const c1 = document.getElementById('fisico-carta1')?.value;
    const c2 = document.getElementById('fisico-carta2')?.value;
    const c3 = document.getElementById('fisico-carta3')?.value;
    const c4 = document.getElementById('fisico-carta4')?.value;

    if (!c1 || !c2 || !c3 || !c4) {
        alert("⚠️ Por favor selecciona las 4 cartas de tu mazo físico.");
        return;
    }

    const seleccionadas = [c1, c2, c3, c4];
    if (new Set(seleccionadas).size !== 4) {
        alert("⚠️ No podés repetir cartas en una misma tirada.");
        return;
    }

    // Guardar las cartas en variable global ANTES de cambiar de pantalla
    window.cartasFisicoSeleccionadas = [c1, c2, c3, c4];
    console.log("🃏 Cartas físicas guardadas:", window.cartasFisicoSeleccionadas);

    // ==========================================
    // MODO ESTRUCTURAL/TÉCNICO: va DIRECTO al resultado
    // ==========================================
    if (window.submodoFisicoActual === 'tarotista_fisico') {
        window.mostrarPantalla('screen-result');
        if (typeof window.procesarTiradaEstructural === 'function') {
            window.procesarTiradaEstructural();
        } else {
            alert("⚠️ Error: no se cargó el módulo estructural.");
        }
        return;
    }

    // ==========================================
    // MODO PREDICTIVO: va a elegir tema como siempre
    // ==========================================
    window.mostrarPantalla('screen-selector');
};

// 5. Pregunta Específica
window.abrirPantallaPregunta = function() {
    const txtArea = document.getElementById('texto-pregunta-usuario');
    if (txtArea) txtArea.value = "";
    window.mostrarPantalla('screen-pregunta');
};

window.confirmarPreguntaYEjecutar = function() {
    const txtArea = document.getElementById('texto-pregunta-usuario');
    window.preguntaCustomSeleccionada = txtArea ? txtArea.value.trim() : "";

    if (!window.preguntaCustomSeleccionada) {
        alert("⚠️ Por favor escribe tu pregunta antes de continuar.");
        return;
    }

    window.ejecutarLecturaSegunModo('Pregunta Específica');
};

// 6. Ejecución de la lectura según el tema presionado
window.ejecutarLecturaSegunModo = function(tema) {
    if (typeof window.procesarTiradaCompleta === 'function') {
        window.procesarTiradaCompleta(tema, window.preguntaCustomSeleccionada);
    } else {
        console.error("❌ Error: No existe procesarTiradaCompleta en app.js");
    }
};

// Navegación de regreso e Historial
window.volverAPortada = function() {
    window.modoFisicoActivo = false;
    window.submodoFisicoActual = null;
    window.cartasFisicoSeleccionadas = null;
    window.preguntaCustomSeleccionada = "";
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

window.abrirHistorial = function() {
    if (typeof window.cargarHistorial === 'function') {
        window.cargarHistorial();
    } else if (typeof cargarHistorial === 'function') {
        cargarHistorial();
    }
    window.mostrarPantalla('screen-historial');
};

window.pedirEmailAlUsuario = function() {
    const email = prompt("📧 Ingresá tu correo electrónico para vincular tu cuenta:");
    if (email && email.includes('@')) {
        alert(`✅ Correo ${email} vinculado correctamente (modo local).`);
        localStorage.setItem('tarotia_email_usuario', email);
    } else if (email) {
        alert("⚠️ Por favor ingresá un correo válido.");
    }
};

// Stub para Carta del Día (evita ReferenceError)
window.tirarCartaDiaria = function() {
    const mazo = [
        "El Loco", "El Mago", "La Sacerdotisa", "La Emperatriz", "El Emperador",
        "Los Enamorados", "El Carro", "La Justicia", "El Ermitaño", "La Rueda de la Fortuna",
        "La Fuerza", "El Colgado", "La Muerte", "La Templanza", "El Diablo",
        "La Torre", "La Estrella", "La Luna", "El Sol", "El Juicio", "El Mundo"
    ];
    const carta = mazo[Math.floor(Math.random() * mazo.length)];
    alert(`🔮 Tu Carta del Día es: ${carta}\n\nReflexioná sobre su mensaje durante el día.`);
};
