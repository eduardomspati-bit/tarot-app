// Carga los 78 arcanos en los 4 selectores del Mazo Físico
function cargarSelectoresFisicos() {
    const ids = ['fisico-carta1', 'fisico-carta2', 'fisico-carta3', 'fisico-carta4'];
    
    // Verificamos que exista la lista global de arcanos
    const mazo = window.arcanos || window.mazoTarot || [];
    if (mazo.length === 0) return;

    ids.forEach(id => {
        const select = document.getElementById(id);
        if (select && select.children.length <= 1) {
            select.innerHTML = '<option value="">-- Selecciona una Carta --</option>';
            mazo.forEach(carta => {
                const opt = document.createElement('option');
                opt.value = carta.nombre || carta;
                opt.textContent = carta.nombre || carta;
                select.appendChild(opt);
            });
        }
    });
}

// Función principal que procesa y lanza la lectura
async function procesarTiradaCompleta(tema, preguntaCustom) {
    let cartasElegidas = [];

    if (window.modoFisicoActivo) {
        // ==========================================
        // CAMINO A: MAZO FÍSICO (Obtiene de los 4 <select>)
        // ==========================================
        const c1 = document.getElementById('fisico-carta1')?.value;
        const c2 = document.getElementById('fisico-carta2')?.value;
        const c3 = document.getElementById('fisico-carta3')?.value;
        const c4 = document.getElementById('fisico-carta4')?.value;

        if (!c1 || !c2 || !c3 || !c4) {
            alert("⚠️ Selecciona las 4 cartas físicas antes de continuar.");
            return;
        }
        cartasElegidas = [c1, c2, c3, c4];

    } else {
        // ==========================================
        // CAMINO B: TIRADA AUTOMÁTICA (Saca 4 aleatorias)
        // ==========================================
        if (typeof obtenerCuatroCartasAleatorias === 'function') {
            cartasElegidas = obtenerCuatroCartasAleatorias();
        } else {
            console.error("No se encontró la función obtenerCuatroCartasAleatorias.");
            return;
        }
    }

    // Cambiar a la mesa de resultados y solicitar interpretación
    mostrarPantalla('screen-result');
    
    // Llamada a tu servidor / IA enviando la información consolidada
    if (typeof solicitarInterpretacionIA === 'function') {
        await solicitarInterpretacionIA(cartasElegidas, tema, preguntaCustom);
    }
}

// Exportar globalmente
window.cargarSelectoresFisicos = cargarSelectoresFisicos;
window.procesarTiradaCompleta = procesarTiradaCompleta;
