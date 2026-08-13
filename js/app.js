// ==========================================
// CONFIGURACIÓN DE SERVIDOR Y ARCANOS
// ==========================================

window.SERVIDOR_URL = (typeof window.API_URL !== 'undefined' ? window.API_URL : 'https://tarot-613b.onrender.com') + '/tirada';

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

// ==========================================
// FUNCIONES DE MANEJO DE CARTAS
// ==========================================

window.obtenerCuatroCartasAleatorias = function() {
    const mazo = obtenerMazoActivo();
    const mezclado = [...mazo];
    for (let i = mezclado.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mezclado[i], mezclado[j]] = [mezclado[j], mezclado[i]];
    }
    return mezclado.slice(0, 4);
};

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

function nombreAImagen(nombre) {
    const slug = nombre.toLowerCase()
        .replace(/ /g, '_')
        .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
        .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
        .replace(/[^a-z0-9_]/g, '');
    return `cartas/${slug}.jpg`;
}

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
            const imgUrl = nombreAImagen(cartaNombre);
            elImg.innerHTML = `<img src="${imgUrl}" alt="${cartaNombre}" onerror="this.parentElement.innerHTML='🃏'" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
        }
    });
};

// ==========================================
// CONSULTA GRATIS (LANDING PAGE)
// ==========================================

window.consultaGratis = async function() {
    const input = document.getElementById('input-pregunta-gratis');
    const pregunta = input ? input.value.trim() : '';

    if (!pregunta) {
        alert('✨ Escribí tu pregunta para recibir una respuesta');
        return;
    }

    if (typeof mostrarPantalla === 'function') {
        mostrarPantalla('screen-gratis-result');
    }

    const preguntaMostrar = document.getElementById('gratis-pregunta-mostrar');
    if (preguntaMostrar) preguntaMostrar.textContent = pregunta;

    const cartas = window.obtenerCuatroCartasAleatorias();

    const contenedorCartas = document.getElementById('gratis-cartas-visuales');
    if (contenedorCartas) {
        contenedorCartas.innerHTML = cartas.map(c => `
            <div class="mini-carta" style="animation:none;">
                <img src="${nombreAImagen(c)}" alt="${c}" onerror="this.parentElement.innerHTML='🃏'" 
                     style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
            </div>
        `).join('');
    }

    const contenedorRespuesta = document.getElementById('gratis-respuesta-contenedor');
    if (contenedorRespuesta) {
        contenedorRespuesta.innerHTML = `
            <div style="text-align:center; padding:30px;">
                <div class="spinner"></div>
                <p style="color:#a78bfa; margin-top:15px;">El Oráculo está consultando las cartas...</p>
            </div>
        `;
    }

    try {
        const payload = {
            a: cartas[0],
            b: cartas[1],
            c: cartas[2],
            d: cartas[3],
            tema: 'Consulta Gratis',
            pregunta: pregunta,
            estilo: 'magico',
            modo: 'gratis'
        };

        console.log("📤 Consulta gratis:", payload);

        const respuesta = await fetch(window.SERVIDOR_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(data.error || 'Error en el servidor');
        }

        let texto = data.lectura || data.respuesta || data.texto || '';
        if (!texto) texto = '<p>El Oráculo no pudo responder en este momento. Intentá de nuevo.</p>';

        if (contenedorRespuesta) {
            contenedorRespuesta.innerHTML = texto;
        }

    } catch (error) {
        console.error('❌ Error consulta gratis:', error);
        if (contenedorRespuesta) {
            contenedorRespuesta.innerHTML = `
                <div style="color: #ff6b6b; text-align: center; padding: 20px;">
                    ❌ ${error.message}<br><br>
                    <small>El servidor puede estar despertando. Probá de nuevo en 30 segundos.</small>
                </div>
            `;
        }
    }
};

window.nuevaConsultaGratis = function() {
    const input = document.getElementById('input-pregunta-gratis');
    if (input) input.value = '';
    if (typeof mostrarPantalla === 'function') {
        mostrarPantalla('screen-landing');
    }
};

window.entrarAppCompleta = function() {
    if (typeof mostrarPantalla === 'function') {
        mostrarPantalla('screen-portada');
    }
};

// ==========================================
// PETICIÓN AL SERVIDOR (APP COMPLETA)
// ==========================================

window.enviarPeticionRender = async function(cartas, tema, preguntaCustom) {
    const contenedorTexto = document.getElementById('interpretation-text');
    if (contenedorTexto) {
        contenedorTexto.innerHTML = `
            <div style="text-align:center; padding:20px; color:#a78bfa;">
                ✨ Conectando con el Oráculo... Generando lectura por Duplas (${window.estiloSeleccionado || 'filosofico'})...
            </div>
        `;
    }

    try {
        const payload = {
            a: cartas[0],
            b: cartas[1],
            c: cartas[2],
            d: cartas[3],
            tema: tema || 'General',
            pregunta: preguntaCustom || "",
            estilo: window.estiloSeleccionado || 'filosofico'
        };

        console.log("📤 Enviando datos al servidor:", payload);

        const respuesta = await fetch(window.SERVIDOR_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await respuesta.json();
        console.log("📥 Respuesta del servidor:", data);

        if (!respuesta.ok) {
            throw new Error(data.error || data.mensaje || `Error HTTP ${respuesta.status}`);
        }

        if (contenedorTexto) {
            let texto = data.lectura ||
                data.resultado ||
                data.interpretacion ||
                data.respuesta ||
                data.texto ||
                data.mensaje ||
                data.reading ||
                (data.choices && data.choices[0]?.message?.content);

            if (!texto) {
                texto = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            }

            contenedorTexto.innerHTML = texto;

            if (typeof guardarEnHistorialLocal === 'function') {
                guardarEnHistorialLocal(tema, 
                    {a: cartas[0], b: cartas[1], c: cartas[2], d: cartas[3]}, 
                    texto);
            }
        }

    } catch (error) {
        console.error("❌ Error en la llamada al servidor:", error);
        if (contenedorTexto) {
            contenedorTexto.innerHTML = `
                <div style="color: #ff6b6b; text-align: center; padding: 20px;">
                    ❌ Error: ${error.message}<br><br>
                    <small>Si el servidor está dormido en Render, esperá 30 segundos y probá de nuevo.</small>
                </div>
            `;
        }
    }
};

// ==========================================
// FLUJO PRINCIPAL DE LA TIRADA (CORREGIDO)
// ==========================================

window.procesarTiradaCompleta = async function(tema, preguntaCustom) {
    let cartasElegidas = [];

    if (window.modoFisicoActivo) {
        // Prioridad 1: usar cartas guardadas al confirmar
        if (window.cartasFisicoSeleccionadas && window.cartasFisicoSeleccionadas.length === 4
            && window.cartasFisicoSeleccionadas.every(c => c && c.trim() !== '')) {
            
            cartasElegidas = window.cartasFisicoSeleccionadas;
            console.log("🃏 Usando cartas físicas guardadas:", cartasElegidas);
        
        } else {
            // Fallback: leer del DOM (puede fallar si la pantalla está oculta)
            cartasElegidas = [
                document.getElementById('fisico-carta1')?.value,
                document.getElementById('fisico-carta2')?.value,
                document.getElementById('fisico-carta3')?.value,
                document.getElementById('fisico-carta4')?.value
            ];
            console.log("🃏 Leyendo cartas del DOM (fallback):", cartasElegidas);
        }
    } else {
        cartasElegidas = window.obtenerCuatroCartasAleatorias();
    }

    // Validación de seguridad
    if (!cartasElegidas[0] || !cartasElegidas[1] || !cartasElegidas[2] || !cartasElegidas[3]) {
        console.error("❌ Cartas incompletas:", cartasElegidas);
        
        if (window.modoFisicoActivo) {
            alert("⚠️ No se detectaron las cartas físicas. Volvé a seleccionarlas.");
            if (typeof mostrarPantalla === 'function') mostrarPantalla('screen-fisico');
        } else {
            alert("⚠️ Error al obtener las cartas. Intentá de nuevo.");
        }
        return;
    }

    if (typeof window.mostrarPantalla === 'function') {
        window.mostrarPantalla('screen-result');
    }

    window.renderizarMesaDuplas(cartasElegidas, tema);
    await window.enviarPeticionRender(cartasElegidas, tema, preguntaCustom);
};

// ==========================================
// TIRADA ESTRUCTURAL / TÉCNICA (BASE DE DATOS EN SERVIDOR)
// ==========================================

window.procesarTiradaEstructural = async function() {
    const cartas = window.cartasFisicoSeleccionadas;

    if (!cartas || cartas.length !== 4) {
        alert("⚠️ Error: no se encontraron las cartas seleccionadas.");
        return;
    }

    const [c1, c2, c3, c4] = cartas;

    // Renderizar las cartas en la mesa
    window.renderizarMesaDuplas(cartas, 'Análisis Estructural');

    const contenedorTexto = document.getElementById('interpretation-text');
    if (contenedorTexto) {
        contenedorTexto.innerHTML = `
            <div style="text-align:center; padding:30px;">
                <div class="spinner"></div>
                <p style="color:#a78bfa; margin-top:15px;">Consultando la base de duplas...</p>
            </div>
        `;
    }

    try {
        const API_BASE = window.SERVIDOR_URL.replace('/tirada', '');

        // Consultar ambas duplas al servidor (orden IMPORTA)
        const [resp1, resp2] = await Promise.all([
            fetch(`${API_BASE}/api/duplas/buscar?a=${encodeURIComponent(c1)}&b=${encodeURIComponent(c2)}`),
            fetch(`${API_BASE}/api/duplas/buscar?a=${encodeURIComponent(c3)}&b=${encodeURIComponent(c4)}`)
        ]);

        const data1 = await resp1.json();
        const data2 = await resp2.json();

        let html = '';

        // Dupla 1
        html += `<div class="reading-section resaltado-místico">`;
        html += `<h3>🔮 Dupla 1: ${c1} + ${c2}</h3>`;
        if (data1.encontrada) {
            html += data1.significado;
            if (data1.keywords && data1.keywords.length > 0) {
                html += `<p style="margin-top:10px; font-size:0.85rem; color:#a78bfa;">🏷️ Keywords: ${data1.keywords.join(', ')}</p>`;
            }
        } else {
            html += `<p style="color:#ff6b6b;">⚠️ Esta combinación aún no tiene interpretación cargada.<br><small style="color:#aaa;">${c1} | ${c2}</small></p>`;
        }
        html += `</div>`;

        // Dupla 2
        html += `<div class="reading-section resaltado-místico">`;
        html += `<h3>🔮 Dupla 2: ${c3} + ${c4}</h3>`;
        if (data2.encontrada) {
            html += data2.significado;
            if (data2.keywords && data2.keywords.length > 0) {
                html += `<p style="margin-top:10px; font-size:0.85rem; color:#a78bfa;">🏷️ Keywords: ${data2.keywords.join(', ')}</p>`;
            }
        } else {
            html += `<p style="color:#ff6b6b;">⚠️ Esta combinación aún no tiene interpretación cargada.<br><small style="color:#aaa;">${c3} | ${c4}</small></p>`;
        }
        html += `</div>`;

        if (contenedorTexto) contenedorTexto.innerHTML = html;

        // Guardar en historial local
        if (typeof guardarEnHistorialLocal === 'function') {
            const textoResumen = `Dupla 1 (${c1}+${c2}): ${data1.encontrada ? 'OK' : 'Sin datos'} | Dupla 2 (${c3}+${c4}): ${data2.encontrada ? 'OK' : 'Sin datos'}`;
            guardarEnHistorialLocal('Análisis Estructural', 
                {a: c1, b: c2, c: c3, d: c4}, 
                textoResumen);
        }

    } catch (error) {
        console.error("❌ Error al consultar duplas:", error);
        if (contenedorTexto) {
            contenedorTexto.innerHTML = `
                <div style="color: #ff6b6b; text-align: center; padding: 20px;">
                    ❌ Error de conexión con la base de duplas.<br>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.cargarSelectoresFisicos();
});
