window.SERVIDOR_URL = "https://tarot-613b.onrender.com/tirada";

// Obtención del mazo
function obtenerMazoActivo() {
    if (typeof arcanosCompleto !== 'undefined' && Array.isArray(arcanosCompleto) && arcanosCompleto.length > 0) {
        return arcanosCompleto;
    }
    if (window.arcanosCompleto && Array.isArray(window.arcanosCompleto) && window.arcanosCompleto.length > 0) {
        return window.arcanosCompleto;
    }
    return [
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
}

// Generar 4 cartas aleatorias
window.obtenerCuatroCartasAleatorias = function() {
    const mazo = obtenerMazoActivo();
    const mazoMezclado = [...mazo].sort(() => 0.5 - Math.random());
    return mazoMezclado.slice(0, 4);
};

// Cargar selectores desplegables de mazo físico
window.cargarSelectoresFisicos = function() {
    const idsSelects = ['fisico-carta1', 'fisico-carta2', 'fisico-carta3', 'fisico-carta4'];
    const mazo = obtenerMazoActivo();

    idsSelects.forEach((id, index) => {
        const select = document.getElementById(id);
        if (!select) return;

        select.innerHTML = `<option value="">-- Selecciona Carta ${index + 1} --</option>`;

        mazo.forEach(carta => {
            const nombreCarta = typeof carta === 'string' ? carta : (carta.nombre || carta.name);
            const option = document.createElement('option');
            option.value = nombreCarta;
            option.textContent = nombreCarta;
            select.appendChild(option);
        });
    });
};

// Dibujar las cartas en pantalla
window.renderizarMesaDuplas = function(cartas, tema) {
    if (!cartas || cartas.length < 4) return;

    const tituloTema = document.getElementById('reading-theme-title');
    if (tituloTema) {
        const estiloTxt = (window.estiloSeleccionado || 'Mágico').toUpperCase();
        tituloTema.textContent = `🔮 Lectura por Duplas (${estiloTxt}): ${tema}`;
    }

    const idsNombres = ['name-a', 'name-b', 'name-c', 'name-d'];
    const idsImagenes = ['img-a', 'img-b', 'img-c', 'img-d'];

    cartas.forEach((cartaNombre, i) => {
        const elNombre = document.getElementById(idsNombres[i]);
        const elImg = document.getElementById(idsImagenes[i]);

        if (elNombre) {
            elNombre.textContent = cartaNombre;
            elNombre.style.display = 'block';
        }
        
        if (elImg) {
            elImg.innerHTML = `<div style="padding: 12px; background: rgba(168,85,247,0.15); border: 1px solid #a855f7; border-radius: 8px; text-align: center; font-size: 1.5rem; margin-bottom: 5px;">🃏</div>`;
        }
    });
};

// Enviar datos al servidor y mostrar interpretación
window.enviarPeticionRender = async function(cartas, tema, preguntaCustom) {
    const contenedorTexto = document.getElementById('interpretation-text');
    if (contenedorTexto) {
        contenedorTexto.innerHTML = `<p style="color: #ffd700; text-align: center; font-weight: bold;">✨ Conectando con los arcanos... Generando interpretación en estilo ${window.estiloSeleccionado || 'mágico'}...</p>`;
    }

    try {
        const payload = {
            dupla1: [cartas[0], cartas[1]],
            dupla2: [cartas[2], cartas[3]],
            tema: tema,
            pregunta: preguntaCustom || "",
            estilo: window.estiloSeleccionado || 'magico',
            esFisico: window.modoFisicoActivo || false,
            submodoFisico: window.submodoFisicoActual || 'predictivo_fisico'
        };

        console.log("📤 Enviando a Render:", payload);

        const respuesta = await fetch(window.SERVIDOR_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await respuesta.json();
        console.log("📥 Respuesta Render:", data);

        if (contenedorTexto) {
            let texto = data.resultado || 
                        data.interpretacion || 
                        data.respuesta || 
                        data.texto || 
                        data.mensaje || 
                        data.reading ||
                        (data.choices && data.choices[0]?.message?.content);

            if (!texto) {
                texto = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            }

            contenedorTexto.innerHTML = `<div class="interpretacion-contenido" style="line-height: 1.6; text-align: left; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 10px;">${texto}</div>`;
        }

    } catch (error) {
        console.error("❌ Error en backend:", error);
        if (contenedorTexto) {
            contenedorTexto.innerHTML = `<p style="color: #ff6b6b; text-align: center;">❌ Error de conexión con el servidor de lectura.</p>`;
        }
    }
};

// Proceso general
window.procesarTiradaCompleta = async function(tema, preguntaCustom) {
    let cartasElegidas = [];

    if (window.modoFisicoActivo) {
        cartasElegidas = [
            document.getElementById('fisico-carta1')?.value,
            document.getElementById('fisico-carta2')?.value,
            document.getElementById('fisico-carta3')?.value,
            document.getElementById('fisico-carta4')?.value
        ];
    } else {
        cartasElegidas = window.obtenerCuatroCartasAleatorias();
    }

    if (typeof window.mostrarPantalla === 'function') {
        window.mostrarPantalla('screen-result');
    }

    window.renderizarMesaDuplas(cartasElegidas, tema);
    await window.enviarPeticionRender(cartasElegidas, tema, preguntaCustom);
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    window.cargarSelectoresFisicos();
});
