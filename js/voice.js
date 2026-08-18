// ==========================================
// SÍNTESIS DE VOZ (TEXT-TO-SPEECH)
// ==========================================

function reproducirVoz(tipo = 'todo') {
    if (!('speechSynthesis' in window)) {
        alert("⚠️ Tu navegador no soporta la lectura por voz.");
        return;
    }

    // Detener cualquier lectura activa previa
    window.speechSynthesis.cancel();

    const contenedorTexto = document.getElementById('interpretation-text');
    if (!contenedorTexto) return;

    let textoALeer = "";

    if (tipo === 'todo') {
        textoALeer = contenedorTexto.innerText;
    } else if (tipo === 'conclusion') {
        const parrafos = contenedorTexto.querySelectorAll('p');
        if (parrafos.length > 0) {
            textoALeer = parrafos[parrafos.length - 1].innerText;
        } else {
            textoALeer = contenedorTexto.innerText;
        }
    } else if (tipo === 'predicciones') {
        const secciones = contenedorTexto.querySelectorAll('div, section, p');
        let encontrado = false;
        secciones.forEach(sec => {
            if (sec.innerText.toLowerCase().includes('futuro') || sec.innerText.toLowerCase().includes('predicción')) {
                textoALeer += " " + sec.innerText;
                encontrado = true;
            }
        });
        if (!encontrado) textoALeer = contenedorTexto.innerText;
    }

    if (!textoALeer.trim()) return;

    // Limpiar texto para TTS
    textoALeer = textoALeer.replace(/🔮|✨|🃏|💫|🚀|💖|💼|⬅|📖|📜|📧|⚠️|❌/g, '');

    const mensaje = new SpeechSynthesisUtterance(textoALeer);
    mensaje.lang = 'es-ES';
    mensaje.rate = 0.95;
    mensaje.pitch = 1.0;

    const voces = window.speechSynthesis.getVoices();
    const vozEspanol = voces.find(v => v.lang.startsWith('es'));
    if (vozEspanol) mensaje.voice = vozEspanol;

    window.speechSynthesis.speak(mensaje);
}

// Precargar voces (algunos navegadores las cargan asíncronamente)
if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
}

// ==========================================
// 🆕 VOZ PARA DUPLAS (MODO ESTRUCTURAL)
// ==========================================

// Variable para almacenar el texto de cada dupla
window.textoDupla1 = "";
window.textoDupla2 = "";

// Función para extraer texto de cada dupla
function extraerTextoDupla(numero) {
    const contenedor = document.getElementById('interpretation-text');
    if (!contenedor) return "";

    const secciones = contenedor.querySelectorAll('.reading-section.resaltado-místico');
    if (secciones.length < numero) return "";

    const seccion = secciones[numero - 1];
    // Extraer texto limpio (sin emojis ni HTML)
    let texto = seccion.innerText || seccion.textContent || "";
    
    // Limpiar emojis y caracteres especiales
    texto = texto.replace(/🔮|✨|🃏|💫|🚀|💖|💼|⬅|📖|📜|📧|⚠️|❌|✅|🎉|🔍|📊|📂|🏷️/g, '');
    texto = texto.replace(/\s+/g, ' ').trim();
    
    return texto;
}

// Función para reproducir una dupla específica
window.reproducirVozDupla = function(numero) {
    if (!('speechSynthesis' in window)) {
        alert("⚠️ Tu navegador no soporta la lectura por voz.");
        return;
    }

    // Detener cualquier lectura activa
    window.speechSynthesis.cancel();

    let texto = "";
    if (numero === 1) {
        texto = window.textoDupla1 || extraerTextoDupla(1);
    } else if (numero === 2) {
        texto = window.textoDupla2 || extraerTextoDupla(2);
    }

    if (!texto.trim()) {
        alert("⚠️ No hay texto para leer en esta dupla.");
        return;
    }

    // Crear el mensaje de voz
    const mensaje = new SpeechSynthesisUtterance(texto);
    mensaje.lang = 'es-ES';
    mensaje.rate = 0.95;
    mensaje.pitch = 1.0;

    // Buscar voz en español
    const voces = window.speechSynthesis.getVoices();
    const vozEspanol = voces.find(v => v.lang.startsWith('es'));
    if (vozEspanol) mensaje.voice = vozEspanol;

    window.speechSynthesis.speak(mensaje);
};

// Función para reproducir ambas duplas seguidas
window.reproducirVozAmbasDuplas = function() {
    if (!('speechSynthesis' in window)) {
        alert("⚠️ Tu navegador no soporta la lectura por voz.");
        return;
    }

    window.speechSynthesis.cancel();

    const texto1 = window.textoDupla1 || extraerTextoDupla(1);
    const texto2 = window.textoDupla2 || extraerTextoDupla(2);

    if (!texto1.trim() && !texto2.trim()) {
        alert("⚠️ No hay texto para leer.");
        return;
    }

    // Leer dupla 1
    if (texto1.trim()) {
        const mensaje1 = new SpeechSynthesisUtterance("Dupla uno. " + texto1);
        mensaje1.lang = 'es-ES';
        mensaje1.rate = 0.95;
        mensaje1.pitch = 1.0;
        
        const voces = window.speechSynthesis.getVoices();
        const vozEspanol = voces.find(v => v.lang.startsWith('es'));
        if (vozEspanol) mensaje1.voice = vozEspanol;

        // Cuando termine la dupla 1, leer la dupla 2
        mensaje1.onend = function() {
            if (texto2.trim()) {
                const mensaje2 = new SpeechSynthesisUtterance("Dupla dos. " + texto2);
                mensaje2.lang = 'es-ES';
                mensaje2.rate = 0.95;
                mensaje2.pitch = 1.0;
                if (vozEspanol) mensaje2.voice = vozEspanol;
                window.speechSynthesis.speak(mensaje2);
            }
        };

        window.speechSynthesis.speak(mensaje1);
    } else if (texto2.trim()) {
        // Solo dupla 2
        const mensaje2 = new SpeechSynthesisUtterance("Dupla dos. " + texto2);
        mensaje2.lang = 'es-ES';
        mensaje2.rate = 0.95;
        mensaje2.pitch = 1.0;
        const voces = window.speechSynthesis.getVoices();
        const vozEspanol = voces.find(v => v.lang.startsWith('es'));
        if (vozEspanol) mensaje2.voice = vozEspanol;
        window.speechSynthesis.speak(mensaje2);
    }
};

// Función para mostrar el panel de voz cuando hay duplas
window.mostrarPanelVozDuplas = function() {
    const panel = document.getElementById('voice-duplas-panel');
    if (panel) {
        panel.style.display = 'block';
    }
};

// Función para ocultar el panel de voz
window.ocultarPanelVozDuplas = function() {
    const panel = document.getElementById('voice-duplas-panel');
    if (panel) {
        panel.style.display = 'none';
    }
};

// Precargar voces (adicional para las duplas)
if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
}
