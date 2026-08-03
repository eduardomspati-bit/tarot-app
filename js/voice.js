
// ==========================================
// SINTETIZADOR DE VOZ
// ==========================================

function reproducirVoz(tipo) {
    if (!window.speechSynthesis) {
        alert("Tu navegador no soporta síntesis de voz.");
        return;
    }
    window.speechSynthesis.cancel();
    
    const contenedor = document.getElementById('interpretation-text');
    if (!contenedor) return;

    let textoA_Leer = "";

    if (tipo === 'todo') {
        textoA_Leer = contenedor.innerText;
    } else if (tipo === 'conclusion') {
        const elementos = contenedor.querySelectorAll('h3, p, li');
        let banderaEncontrado = false;
        
        elementos.forEach(el => {
            const textoLimpio = el.innerText.toLowerCase();
            if (el.tagName === 'H3' && (textoLimpio.includes('conclusión') || textoLimpio.includes('síntesis') || textoLimpio.includes('consejo final') || textoLimpio.includes('resumen'))) {
                banderaEncontrado = true;
            }
            if (banderaEncontrado) textoA_Leer += " " + el.innerText;
        });

        if (!textoA_Leer.trim()) {
            const ps = contenedor.querySelectorAll('p, li');
            if (ps.length > 0) textoA_Leer = ps[ps.length - 1].innerText;
        }
    } else if (tipo === 'predicciones') {
        const elementos = contenedor.querySelectorAll('h3, p, li');
        let capturar = false;

        for (let i = 0; i < elementos.length; i++) {
            const el = elementos[i];
            const textoLimpio = el.innerText.toLowerCase();
            
            if (el.tagName === 'H3' && (textoLimpio.includes('predicciones') || textoLimpio.includes('predicción') || textoLimpio.includes('proyección'))) {
                capturar = true;
                textoA_Leer += " " + el.innerText;
                continue;
            } 
            
            if (capturar && el.tagName === 'H3' && (textoLimpio.includes('conclusión') || textoLimpio.includes('consejo') || textoLimpio.includes('síntesis') || textoLimpio.includes('resumen'))) {
                capturar = false;
                break;
            }

            if (capturar) textoA_Leer += " " + el.innerText;
        }

        if (!textoA_Leer.trim()) {
            const ps = contenedor.querySelectorAll('p');
            if (ps.length >= 3) textoA_Leer = ps[ps.length - 2].innerText;
        }
    }

    if (!textoA_Leer.trim()) textoA_Leer = contenedor.innerText; 

    // Limpieza de emojis y formato para voz fluida
    textoA_Leer = textoA_Leer.replace(/[❌✨🔮🌗🌿🏆⚔️🪙🧙‍♂️💼🚀📚🔍🌓]/g, '').replace(/\s+/g, ' ').trim(); 

    const utterance = new SpeechSynthesisUtterance(textoA_Leer);
    utterance.lang = 'es-AR'; 
    utterance.rate = 1.05;    
    utterance.pitch = 1.05;   

    window.speechSynthesis.speak(utterance);
}
