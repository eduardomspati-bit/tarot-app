// ==========================================
// SÍNTESIS DE VOZ (TEXT-TO-SPEECH)
// ==========================================

function reproducirVoz(tipo = 'todo') {
    if (!('speechSynthesis' in window)) {
        alert("⚠️ Tu navegador no soporta la lectura por voz.");
        return;
    }

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

// ==========================================
// VOZ PARA DUPLAS (MODO ESTRUCTURAL)
// ==========================================

// Variables para almacenar el texto de cada dupla
window.textoDupla1 = "";
window.textoDupla2 = "";

// Función para reproducir una dupla específica
window.reproducirVozDupla = function(numero) {
    if (!('speechSynthesis' in window)) {
        alert("⚠️ Tu navegador no soporta la lectura por voz.");
        return;
    }

    window.speechSynthesis.cancel();

    let texto = "";
    if (numero === 1) {
        texto = window.textoDupla1;
    } else if (numero === 2) {
        texto = window.textoDupla2;
    }

    if (!texto || !texto.trim()) {
        alert("⚠️ No hay texto para leer en esta dupla.");
        return;
    }

    const mensaje = new SpeechSynthesisUtterance(texto);
    mensaje.lang = 'es-ES';
    mensaje.rate = 0.95;
    mensaje.pitch = 1.0;

    const voces = window.speechSynthesis.getVoices();
    const vozEspanol = voces.find(v => v.lang.startsWith('es'));
    if (vozEspanol) mensaje.voice = vozEspanol;

    window.speechSynthesis.speak(mensaje);
};

// Precargar voces
if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
}
