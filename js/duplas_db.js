// ==========================================
// BASE DE DATOS LOCAL - SIGNIFICADOS DE DUPLAS
// ==========================================
// Formato: "Carta A|Carta B" (EL ORDEN IMPORTA)
// "La Muerte|El Sol" es DISTINTO de "El Sol|La Muerte"
// Si querés ambas combinaciones, cargalas por separado.
//
// Con 78 cartas hay 78 x 77 = 6.006 duplas ordenadas posibles.
// Agregá de a poco las que más uses.
//
// Cuando subas a MongoDB, el servidor ya tiene los endpoints:
//   GET /api/duplas/buscar?a=Carta1&b=Carta2
//   POST /api/admin/duplas (requiere token admin)

window.baseDeDatosDuplas = {
    // Dupla ordenada: Carta de la izquierda | Carta de la derecha
    "El Loco|El Mago": {
        significado: "<p><strong>Inicio potenciado.</strong> El impulso del Loco encuentra en El Mago la herramienta concreta para canalizarlo. Acción creativa sin miedo.</p>",
        keywords: ["inicio", "potencial", "acción"]
    },
    "El Mago|El Loco": {
        significado: "<p><strong>Recursos desperdiciados.</strong> Tenés todas las herramientas (El Mago) pero el impulso errático del Loco te hace dispersar la energía sin dirección.</p>",
        keywords: ["dispersión", "falta de foco", "potencial mal usado"]
    },
    "El Loco|La Sacerdotisa": {
        significado: "<p><strong>Misterio en el camino.</strong> El impulso del Loco se frena por la intuición de La Sacerdotisa. Hay información oculta que conviene escuchar antes de actuar.</p>",
        keywords: ["intuición", "paciencia", "oculto"]
    },
    "El Loco|El Mago": {
        significado: "<p>La combinación del Loco y el Mago representa el inicio de un viaje con todas las herramientas necesarias. Es el momento de actuar con confianza, aprovechando la energía creativa y la voluntad personal. Indica que tenés el potencial para manifestar tus deseos, pero necesitás mantener el equilibrio entre la audacia y la estrategia.</p>",
        keywords: ["inicio", "potencial", "manifestación", "audacia"]
    },
    "La Muerte|La Torre": {
        significado: "<p>Dupla de transformación radical. La Muerte y la Torre juntas indican un cambio inevitable y profundo. Estructuras que se derrumban para dar paso a algo nuevo. Aunque el proceso puede ser intenso, es necesario para la evolución personal. Resistirse solo prolonga el sufrimiento.</p>",
        keywords: ["transformación", "cambio", "destrucción creativa", "renacimiento"]
    },
    "Los Enamorados|La Sacerdotisa": {
        significado: "<p>La unión de los Enamorados y la Sacerdotisa habla de decisiones del corazón guiadas por la intuición profunda. Sugiere que una elección amorosa o de valores está siendo influenciada por sabiduría interior. Es momento de escuchar la voz del alma antes que la razón pura.</p>",
        keywords: ["intuición", "elección", "amor", "misterio"]
    },
    "El Sol|La Estrella": {
        significado: "<p>Dupla de luz y esperanza. El Sol y la Estrella juntas prometen claridad, éxito y renovación de la fe. Indica que después de un período oscuro, llega la iluminación. Es un momento de optimismo genuino donde los proyectos florecen y la energía vital está en su punto máximo.</p>",
        keywords: ["esperanza", "éxito", "claridad", "optimismo"]
    },
    "El Diablo|La Luna": {
        significado: "<p>Combinación de ilusiones, miedos y ataduras. El Diablo y la Luna juntas advierten sobre engaños, posiblemente auto-impuestos. Puede indicar adicciones, dependencias emocionales o situaciones donde la percepción está nublada por el deseo o el temor. Es llamado a enfrentar las propias sombras.</p>",
        keywords: ["ilusiones", "miedos", "sombra", "dependencia"]
    },
    "La Justicia|La Templanza": {
        significado: "<p>Dupla de equilibrio y armonía. La Justicia y la Templanza sugieren que se están restableciendo los equilibrios de forma justa y mesurada. Indica resolución de conflictos mediante la moderación, la paciencia y la objetividad. Es un buen momento para acuerdos y negociaciones.</p>",
        keywords: ["equilibrio", "justicia", "moderación", "armonía"]
    },
    "El Carro|La Fuerza": {
        significado: "<p>La combinación del Carro y la Fuerza es de victoria mediante el dominio de la voluntad. Indica avance decidido hacia una meta, sostenido por coraje interior. No es fuerza bruta, sino determinación inteligente. Los obstáculos se superan con persistencia y confianza.</p>",
        keywords: ["victoria", "determinación", "coraje", "avance"]
    },
    "El Emperador|El Papa": {
        significado: "<p>Dupla de autoridad y estructura. El Emperador y el Papa juntos representan el orden establecido, las reglas y la tradición. Puede indicar la necesidad de seguir protocolos, respetar jerarquías o buscar consejo de figuras de autoridad. También habla de construcción sólida a largo plazo.</p>",
        keywords: ["autoridad", "estructura", "tradición", "orden"]
    },
    "La Emperatriz|La Reina de Copas": {
        significado: "<p>Combinación de abundancia emocional y creativa. La Emperatriz y la Reina de Copas juntas hablan de fertilidad en todos los sentidos: proyectos, relaciones, creatividad. Es una energía nutricia, protectora y profundamente intuitiva. Momento ideal para crear, cuidar y amar.</p>",
        keywords: ["abundancia", "nutrición", "creatividad", "intuición"]
    },
    "As de Espadas|3 de Espadas": {
        significado: "<p>Dupla de verdad dolorosa. El As de Espadas y el 3 de Espadas juntos indican una claridad que llega a través del sufrimiento. Puede ser la revelación de una traición o la aceptación de una realidad difícil. Aunque duela, la verdad es necesaria para la sanación.</p>",
        keywords: ["verdad", "dolor", "claridad", "sanación"]
    }
};

// Función para buscar en la base local (fallback offline)
window.buscarDuplaLocal = function(cartaA, cartaB) {
    const key1 = cartaA + "|" + cartaB;
    const key2 = cartaB + "|" + cartaA; // orden inverso por si acaso

    if (window.baseDeDatosDuplas[key1]) {
        return { encontrada: true, ...window.baseDeDatosDuplas[key1], orden: 'directo' };
    }
    if (window.baseDeDatosDuplas[key2]) {
        return { encontrada: true, ...window.baseDeDatosDuplas[key2], orden: 'inverso' };
    }
    return { encontrada: false, mensaje: 'Dupla no encontrada en base local.' };
};

// Función para agregar duplas locales (útil para testear)
window.agregarDuplaLocal = function(cartaA, cartaB, significado, keywords) {
    const key = cartaA + "|" + cartaB;
    window.baseDeDatosDuplas[key] = { significado, keywords: keywords || [] };
};
