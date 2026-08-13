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
