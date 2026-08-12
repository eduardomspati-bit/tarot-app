// ==========================================
// BASE DE DATOS LOCAL - SIGNIFICADOS DE DUPLAS
// ==========================================
// Formato: "Carta A|Carta B" (EL ORDEN IMPORTA)
// "La Muerte|El Sol" es DISTINTO de "El Sol|La Muerte"
// Si querés ambas combinaciones, cargalas por separado.
//
// Con 78 cartas hay 78 x 77 = 6.006 duplas ordenadas posibles.
// Agregá de a poco las que más uses.

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
    }
    // Agregá más respetando el orden exacto de cada dupla
};
