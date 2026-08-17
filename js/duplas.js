// ==========================================
// BASE DE DATOS LOCAL - SIGNIFICADOS DE DUPLAS
// Fallback offline cuando no hay servidor
// ==========================================
window.baseDeDatosDuplas = {
    "El Loco|El Loco": { significado: "<p>next</p>", keywords: [] },
    "El Loco|El Mago": { significado: "<p>next</p>", keywords: [] },
    "El Loco|La Sacerdotisa": { significado: "<p>next</p>", keywords: [] },
    "El Loco|La Emperatriz": { significado: "<p>next</p>", keywords: [] },
    "El Loco|El Emperador": { significado: "<p>next</p>", keywords: [] },
    "El Loco|El Papa": { significado: "<p>next</p>", keywords: [] },
    "El Loco|Los Enamorados": { significado: "<p>next</p>", keywords: [] },
    "El Loco|El Carro": { significado: "<p>next</p>", keywords: [] },
    "El Loco|La Justicia": { significado: "<p>next</p>", keywords: [] },
    "El Loco|El Ermitaño": { significado: "<p>next</p>", keywords: [] },
    "El Loco|La Rueda de la Fortuna": { significado: "<p>next</p>", keywords: [] },
    "El Loco|La Fuerza": { significado: "<p>next</p>", keywords: [] },
    "El Loco|El Colgado": { significado: "<p>next</p>", keywords: [] },
    "El Loco|La Muerte": { significado: "<p>next</p>", keywords: [] },
    "El Loco|La Templanza": { significado: "<p>next</p>", keywords: [] },
    "El Loco|El Diablo": { significado: "<p>next</p>", keywords: [] },
    "El Loco|La Torre": { significado: "<p>next</p>", keywords: [] },
    "El Loco|La Estrella": { significado: "<p>next</p>", keywords: [] },
    "El Loco|La Luna": { significado: "<p>next</p>", keywords: [] },
    "El Loco|El Sol": { significado: "<p>next</p>", keywords: [] },
    "El Loco|El Juicio": { significado: "<p>next</p>", keywords: [] },
    "El Loco|El Mundo": { significado: "<p>next</p>", keywords: [] },
    "El Mago|El Loco": { significado: "<p>next</p>", keywords: [] },
    "El Mago|El Mago": { significado: "<p>next</p>", keywords: [] },
    "El Mago|La Sacerdotisa": { significado: "<p>next</p>", keywords: [] },


};

// ==========================================
// CONFIGURACIÓN DE TU BACKEND EN RENDER
// ==========================================
// Reemplaza esto con la URL real de tu backend en Render
const RENDER_URL = "https://tarot-613b.onrender.com"; 

// Buscar dupla (Busca en tu backend primero, usa la local como fallback)
window.buscarDupla = async function(cartaA, cartaB) {
    const key1 = cartaA + "|" + cartaB;
    const key2 = cartaB + "|" + cartaA;

    // 1. BUSCAR EN TU SERVIDOR DE RENDER
    try {
        // Intentamos buscar en orden directo
        let response = await fetch(`${RENDER_URL}/api/duplas/buscar?a=${encodeURIComponent(cartaA)}&b=${encodeURIComponent(cartaB)}`);
        let data = await response.json();

        if (data.encontrada) {
            console.log("✅ ¡Dupla traída desde tu backend en Render!");
            return { ...data, orden: 'directo' };
        }

        // Si no se encontró en orden directo, intentamos inverso
        response = await fetch(`${RENDER_URL}/api/duplas/buscar?a=${encodeURIComponent(cartaB)}&b=${encodeURIComponent(cartaA)}`);
        data = await response.json();

        if (data.encontrada) {
            console.log("✅ ¡Dupla traída desde tu backend en Render (orden inverso)!");
            return { ...data, orden: 'inverso' };
        }

    } catch (error) {
        console.warn("❌ Error al consultar el servidor Render, activando fallback local:", error);
    }

    // 2. FALLBACK A LA BASE LOCAL SI FALLA EL SERVIDOR O NO SE ENCUENTRA
    console.log("⚠️ Buscando en base local de emergencia...");
    if (window.baseDeDatosDuplas[key1]) {
        return { encontrada: true, ...window.baseDeDatosDuplas[key1], orden: 'directo' };
    }
    if (window.baseDeDatosDuplas[key2]) {
        return { encontrada: true, ...window.baseDeDatosDuplas[key2], orden: 'inverso' };
    }
    
    return { encontrada: false, mensaje: 'Dupla no encontrada en ninguna base de datos.' };
};

// Agregar dupla localmente (para testear)
window.agregarDuplaLocal = function(cartaA, cartaB, significado, keywords) {
    const key = cartaA + "|" + cartaB;
    window.baseDeDatosDuplas[key] = { significado, keywords: keywords || [] };
};

console.log("[duplas.js] Base local y conexión a Render cargadas.");
