// ==========================================
// CONFIGURACIÓN Y LISTA DE ARCANOS
// ==========================================

window.arcanosCompleto = [
    "El Loco", "El Mago", "La Sacerdotisa", "La Emperatriz", "El Emperador", "El Papa", 
    "Los Enamorados", "El Carro", "La Justicia", "El Ermitaño", "La Rueda de la Fortuna", 
    "La Fuerza", "El Colgado", "La Muerte", "La Templanza", "El Diablo", "La Torre", 
    "La Estrella", "La Luna", "El Sol", "El Juicio", "El Mundo",
    "As de Bastos", "2 de Bastos", "3 de Bastos", "4 de Bastos", "5 de Bastos", 
    "6 de Bastos", "7 de Bastos", "8 de Bastos", "9 de Bastos", "10 de Bastos", 
    "Sota de Bastos", "Caballero de Bastos", "Reina de Bastos", "Rey de Bastos",
    "As de Copas", "2 de Copas", "3 de Copas", "4 de Copas", "5 de Copas", 
    "6 de Copas", "7 de Copas", "8 de Copas", "9 de Copas", "10 de Copas", 
    "Sota de Copas", "Caballero de Copas", "Reina de Copas", "Rey de Copas",
    "As de Espadas", "2 de Espadas", "3 de Espadas", "4 de Espadas", "5 de Espadas", 
    "6 de Espadas", "7 de Espadas", "8 de Espadas", "9 de Espadas", "10 de Espadas", 
    "Sota de Espadas", "Caballero de Espadas", "Reina de Espadas", "Rey de Espadas",
    "As de Oros", "2 de Oros", "3 de Oros", "4 de Oros", "5 de Oros", 
    "6 de Oros", "7 de Oros", "8 de Oros", "9 de Oros", "10 de Oros", 
    "Sota de Oros", "Caballero de Oros", "Reina de Oros", "Rey de Oros"
];

window.SERVIDOR_URL = "https://tarot-613b.onrender.com/tirada";

// ==========================================
// FUNCIONES GLOBALES PRINCIPALES
// ==========================================

// 1. Generación de 4 cartas aleatorias
window.obtenerCuatroCartasAleatorias = function() {
    const mazo = window.arcanosCompleto || [];
    if (mazo.length === 0) {
        return ["El Loco", "El Mago", "La Sacerdotisa", "El Emperador"];
    }
    const mazoMezclado = [...mazo].sort(() => 0.5 - Math.random());
    return mazoMezclado.slice(0, 4);
};

// 2. Poblado de selectores físicos
window.cargarSelectoresFisicos = function() {
    const idsSelects = ['fisico-carta1', 'fisico-carta2', 'fisico-carta3', 'fisico-carta4'];
    const mazo = window.arcanosCompleto || [];

    if (mazo.length === 0) {
        console.error("⚠️ No se encontró el array arcanosCompleto");
        return;
    }

    idsSelects.forEach((id, index) => {
        const select = document.getElementById(id);
        if (!select) return;

        select.innerHTML = `<option value="">-- Selecciona Carta ${index + 1} --</option>`;

        mazo.forEach(nombreCarta => {
            const option = document.createElement('option');
            option.value = nombreCarta;
            option.textContent = nombreCarta;
            select.appendChild(option);
        });
    });
};

// 3. Renderizar Duplas en Pantalla
window.renderizarMesaDuplas = function(cartas, tema) {
    const tituloTema = document.getElementById('reading-theme-title');
    if (tituloTema) {
        tituloTema.textContent = `🔮 Lectura por Duplas (${window.estiloSeleccionado || 'Mágico'}): ${tema}`;
    }

    // Dupla 1 (Presente / Estado Inicial)
    const nameA = document.getElementById('name-a');
    const nameB = document.getElementById('name-b');
    if (nameA) nameA.textContent = cartas[0];
    if (nameB) nameB.textContent = cartas[1];

    // Dupla 2 (Futuro / Evolución)
    const nameC = document.getElementById('name-c');
    const nameD = document.getElementById('name-d');
    if (nameC) nameC.textContent = cartas[2];
    if (nameD) nameD.textContent = cartas[3];
};

// 4. Enviar Petición POST al Backend de Render
window.enviarPeticionRender = async function(cartas, tema, preguntaCustom) {
    const contenedorTexto = document.getElementById('interpretation-text');
    if (contenedorTexto) {
        contenedorTexto.innerHTML = `<p style="color: #ffd700; text-align: center;">✨ Conectando con los arcanos y generando interpretación (${window.estiloSeleccionado || 'mágico'})...</p>`;
    }

    try {
        const payload = {
            dupla1: [cartas[0], cartas[1]],
            dupla2: [cartas[2], cartas[3]],
            tema: tema,
            pregunta: preguntaCustom || "",
            estilo: window.estiloSeleccionado || 'filosofico',
            esFisico: window.modoFisicoActivo || false,
            submodoFisico: window.submodoFisicoActual || 'predictivo_fisico'
        };

        const respuesta = await fetch(window.SERVIDOR_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await respuesta.json();

        if (contenedorTexto) {
            contenedorTexto.innerHTML = data.resultado || data.interpretacion || data.respuesta || "Lectura completada con éxito.";
        }

    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        if (contenedorTexto) {
            contenedorTexto.innerHTML = `<p style="color: #ff6b6b; text-align: center;">❌ Hubo un problema al conectar con el servidor. Intenta nuevamente.</p>`;
        }
    }
};

// 5. Procesamiento general de la tirada
window.procesarTiradaCompleta = async function(tema, preguntaCustom) {
    let cartasElegidas = [];

    if (window.modoFisicoActivo) {
        // MAZO FÍSICO
        const c1 = document.getElementById('fisico-carta1')?.value;
        const c2 = document.getElementById('fisico-carta2')?.value;
        const c3 = document.getElementById('fisico-carta3')?.value;
        const c4 = document.getElementById('fisico-carta4')?.value;

        if (!c1 || !c2 || !c3 || !c4) {
            alert("⚠️ Por favor, selecciona las 4 cartas de tu mazo físico.");
            return;
        }

        cartasElegidas = [c1, c2, c3, c4];
    } else {
        // MAZO AUTOMÁTICO
        cartasElegidas = window.obtenerCuatroCartasAleatorias();
    }

    // Dibujar pantalla de resultado
    if (typeof window.mostrarPantalla === 'function') {
        window.mostrarPantalla('screen-result');
    }
    
    window.renderizarMesaDuplas(cartasElegidas, tema);

    // Enviar a Render
    await window.enviarPeticionRender(cartasElegidas, tema, preguntaCustom);
};

// Carga de selectores cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    window.cargarSelectoresFisicos();
});
