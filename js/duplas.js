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
const RENDER_URL = "https://tarot-613b.onrender.com"; 

// Buscar dupla (Busca en tu backend primero evitando caché, usa la local como fallback)
window.buscarDupla = async function(cartaA, cartaB) {
    const keyLocal = cartaA + "|" + cartaB;
    const keyInversaLocal = cartaB + "|" + cartaA;

    // 1. BUSCAR EN RENDER (Evitando caché con Date.now())
    try {
        const response = await fetch(
            `${RENDER_URL}/api/duplas/buscar?a=${encodeURIComponent(cartaA)}&b=${encodeURIComponent(cartaB)}&_t=${Date.now()}`
        );
        const data = await response.json();

        if (data.encontrada) {
            console.log("✅ Dupla traída desde Render con éxito");
            return { ...data, orden: data.orden || 'directo' };
        }
    } catch (error) {
        console.warn("❌ Render no responde, activando fallback local:", error);
    }

    // 2. FALLBACK LOCAL (Revisa ambos sentidos también en local)
    console.log("⚠️ Buscando en base local de emergencia...");
    if (window.baseDeDatosDuplas[keyLocal]) {
        return { 
            encontrada: true, 
            ...window.baseDeDatosDuplas[keyLocal], 
            orden: 'directo' 
        };
    }
    if (window.baseDeDatosDuplas[keyInversaLocal]) {
        return { 
            encontrada: true, 
            ...window.baseDeDatosDuplas[keyInversaLocal], 
            orden: 'inverso' 
        };
    }
    
    return { 
        encontrada: false, 
        mensaje: `Dupla "${cartaA} | ${cartaB}" no cargada aún.` 
    };
};

// Agregar dupla localmente (para testear)
window.agregarDuplaLocal = function(cartaA, cartaB, significado, keywords) {
    const key = cartaA + "|" + cartaB;
    window.baseDeDatosDuplas[key] = { significado, keywords: keywords || [] };
};

console.log("[duplas.js] Base local y conexión a Render configuradas correctamente.");
