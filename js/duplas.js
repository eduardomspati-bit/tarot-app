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

// Buscar dupla (servidor primero, esto es fallback)
window.buscarDuplaLocal = function(cartaA, cartaB) {
    const key1 = cartaA + "|" + cartaB;
    const key2 = cartaB + "|" + cartaA;

    if (window.baseDeDatosDuplas[key1]) {
        return { encontrada: true, ...window.baseDeDatosDuplas[key1], orden: 'directo' };
    }
    if (window.baseDeDatosDuplas[key2]) {
        return { encontrada: true, ...window.baseDeDatosDuplas[key2], orden: 'inverso' };
    }
    return { encontrada: false, mensaje: 'Dupla no encontrada en base local.' };
};

// Agregar dupla localmente (para testear)
window.agregarDuplaLocal = function(cartaA, cartaB, significado, keywords) {
    const key = cartaA + "|" + cartaB;
    window.baseDeDatosDuplas[key] = { significado, keywords: keywords || [] };
};

console.log("[duplas.js] Base local cargada:", Object.keys(window.baseDeDatosDuplas).length, "duplas");
