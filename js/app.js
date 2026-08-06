// ==========================================
// POBLAR SELECTORES DEL MAZO FÍSICO
// ==========================================

function obtenerListaArcanos() {
    // Busca el mazo en las variables globales más comunes
    if (Array.isArray(window.arcanos) && window.arcanos.length > 0) return window.arcanos;
    if (Array.isArray(window.mazoTarot) && window.mazoTarot.length > 0) return window.mazoTarot;
    if (Array.isArray(window.MAZO) && window.MAZO.length > 0) return window.MAZO;
    return [];
}

function cargarSelectoresFisicos() {
    const idsSelects = ['fisico-carta1', 'fisico-carta2', 'fisico-carta3', 'fisico-carta4'];
    const mazo = obtenerListaArcanos();

    if (mazo.length === 0) {
        console.error("❌ No se encontró la lista de arcanos en arcanos.js");
        return;
    }

    idsSelects.forEach((id, index) => {
        const select = document.getElementById(id);
        if (!select) return;

        // Limpiamos y colocamos la opción por defecto
        select.innerHTML = `<option value="">-- Selecciona Carta ${index + 1} --</option>`;

        mazo.forEach(carta => {
            // Saca el nombre de la carta según cómo esté estructurado en arcanos.js
            const nombreCarta = typeof carta === 'string' ? carta : (carta.nombre || carta.name || carta.titulo);
            
            if (nombreCarta) {
                const option = document.createElement('option');
                option.value = nombreCarta;
                option.textContent = nombreCarta;
                select.appendChild(option);
            }
        });
    });
}

// ==========================================
// GENERACIÓN DE CARTAS ALEATORIAS (AUTOMÁTICO)
// ==========================================

function obtenerCuatroCartasAleatorias() {
    const mazo = obtenerListaArcanos();
    if (mazo.length === 0) return ["El Loco", "El Mago", "La Sacerdotisa", "El Emperador"];

    // Copia superficial y mezcla (Fisher-Yates)
    const mazoMezclado = [...mazo].sort(() => 0.5 - Math.random());
    
    // Extraemos 4 cartas
    return mazoMezclado.slice(0, 4).map(carta => 
        typeof carta === 'string' ? carta : (carta.nombre || carta.name || carta.titulo)
    );
}

// ==========================================
// NÚCLEO Y EJECUCIÓN DE TIRADAS POR DUPLAS
// ==========================================

async function procesarTiradaCompleta(tema, preguntaCustom) {
    let cartasElegidas = [];

    if (window.modoFisicoActivo) {
        // MAZO FÍSICO: Leemos las 2 Duplas
        const c1 = document.getElementById('fisico-carta1')?.value;
        const c2 = document.getElementById('fisico-carta2')?.value;
        const c3 = document.getElementById('fisico-carta3')?.value;
        const c4 = document.getElementById('fisico-carta4')?.value;

        if (!c1 || !c2 || !c3 || !c4) {
            alert("⚠️ Por favor, selecciona las 4 cartas de tu mazo antes de continuar.");
            return;
        }

        // Dupla 1 (Presente): [c1, c2] | Dupla 2 (Futuro): [c3, c4]
        cartasElegidas = [c1, c2, c3, c4];

    } else {
        // TIRADA AUTOMÁTICA
        cartasElegidas = obtenerCuatroCartasAleatorias();
    }

    // Dibujar los resultados en pantalla
    mostrarPantalla('screen-result');
    renderizarMesaDuplas(cartasElegidas, tema);

    // Enviar solicitud a la IA o motor de interpretación
    await solicitarInterpretacionIA({
        dupla1: [cartasElegidas[0], cartasElegidas[1]], // Presente / Situación Actual
        dupla2: [cartasElegidas[2], cartasElegidas[3]], // Futuro / Evolución
        tema: tema,
        pregunta: preguntaCustom,
        estilo: window.estiloSeleccionado,
        esFisico: window.modoFisicoActivo,
        submodoFisico: window.submodoFisicoActual
    });
}

// Visualización clara por Duplas en screen-result
function renderizarMesaDuplas(cartas, tema) {
    const tituloTema = document.getElementById('reading-theme-title');
    if (tituloTema) {
        tituloTema.textContent = `🔮 Lectura por Duplas: ${tema}`;
    }

    // Dupla 1 (Estado Inicial / Presente)
    const nameA = document.getElementById('name-a');
    const nameB = document.getElementById('name-b');
    if (nameA) nameA.textContent = cartas[0];
    if (nameB) nameB.textContent = cartas[1];

    // Dupla 2 (Evolución / Futuro)
    const nameC = document.getElementById('name-c');
    const nameD = document.getElementById('name-d');
    if (nameC) nameC.textContent = cartas[2];
    if (nameD) nameD.textContent = cartas[3];
}

// Mock/Envío a servidor para interpretación
async function solicitarInterpretacionIA(datosLectura) {
    const contenedorTexto = document.getElementById('interpretation-text');
    if (!contenedorTexto) return;

    contenedorTexto.innerHTML = `<p style="color: #ffd700; text-align: center;">✨ Interpretando Dupla 1 (${datosLectura.dupla1.join(' + ')}) y Dupla 2 (${datosLectura.dupla2.join(' + ')})...</p>`;

    // Aquí conecta con tu backend o API de Render/MongoDB si corresponde
}

// Exportación al objeto global
window.cargarSelectoresFisicos = cargarSelectoresFisicos;
window.obtenerCuatroCartasAleatorias = obtenerCuatroCartasAleatorias;
window.procesarTiradaCompleta = procesarTiradaCompleta;
