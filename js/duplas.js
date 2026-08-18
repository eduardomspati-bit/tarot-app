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

// Buscar dupla (Con orden exacto estricto + anti-caché aleatorio)
window.buscarDupla = async function(cartaA, cartaB) {
    const keyLocal = cartaA + "|" + cartaB;
    const randomCacheKill = Math.random();

    // 1. BUSCAR EN RENDER (ORDEN EXACTO + ANTI-CACHÉ)
    try {
        const urlPeticion = `${RENDER_URL}/api/duplas/buscar?a=${encodeURIComponent(cartaA)}&b=${encodeURIComponent(cartaB)}&_nc=${randomCacheKill}`;
        console.log("🔍 Consultando URL exacta:", urlPeticion);

        const response = await fetch(urlPeticion);
        const data = await response.json();

        console.log("📥 Respuesta cruda de Render:", data);

        if (data && data.encontrada === true) {
            console.log("✅ Dupla encontrada en MongoDB (orden exacto):", keyLocal);
            return { ...data, orden: 'directo' };
        } else {
            console.log("⚠️ Render respondió pero la dupla figura como no encontrada o vacía:", data);
        }
    } catch (error) {
        console.warn("❌ Error de red conectando a Render, usando fallback local:", error);
    }

    // 2. FALLBACK LOCAL (ORDEN EXACTO)
    console.log("⚠️ Buscando en base local (orden exacto) para:", keyLocal);
    if (window.baseDeDatosDuplas[keyLocal]) {
        return { 
            encontrada: true, 
            ...window.baseDeDatosDuplas[keyLocal], 
            orden: 'directo' 
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

console.log("[duplas.js] Base local y conexión estricta a Render cargadas con depuración.");
