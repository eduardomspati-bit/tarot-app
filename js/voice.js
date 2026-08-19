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
        const textoCompleto = contenedorTexto.innerText;
        const textoLower = textoCompleto.toLowerCase();

        // Marcas de inicio de la sección de predicciones
        const marcasInicio = [
            'predicciones del oráculo',
            'predicciones del oraculo',
            'predicciones:'
        ];

        let inicio = -1;
        let marcaEncontrada = "";
        for (const marca of marcasInicio) {
            inicio = textoLower.indexOf(marca);
            if (inicio !== -1) {
                marcaEncontrada = marca;
                break;
            }
        }

        if (inicio !== -1) {
            // Buscamos si hay un título posterior que marque el inicio de la conclusión o consejo para cortar ahí
            const marcasFin = [
                'consejo y conclusión',
                'consejo y conclusion',
                'conclusión',
                'conclusion',
                'consejo final',
                'síntesis',
                'sintesis'
            ];

            let fin = -1;
            // Buscamos solo después de haber encontrado el inicio de las predicciones
            for (const marcaFin of marcasFin) {
                const idx = textoLower.indexOf(marcaFin, inicio + marcaEncontrada.length);
                if (idx !== -1 && (fin === -1 || idx < fin)) {
                    fin = idx;
                }
            }

            // Si encontramos dónde empieza el siguiente bloque, cortamos antes. Si no, leemos un trecho prudente.
            if (fin !== -1) {
                textoALeer = textoCompleto.substring(inicio, fin);
            } else {
                textoALeer = textoCompleto.substring(inicio);
            }
        } else {
            // Fallback si no encuentra la etiqueta exacta
            textoALeer = textoCompleto;
        }
    }

    if (!textoALeer.trim()) return;

    // Limpiar emojis
    textoALeer = textoALeer.replace(/🔮|✨|🃏|💫|🚀|💖|💼|⬅|📖|📜|📧|⚠️|❌|📌/g, '');

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

window.textoDupla1 = "";
window.textoDupla2 = "";

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
