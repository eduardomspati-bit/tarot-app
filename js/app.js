// ==========================================
// APP.JS DEFINITIVO - Solo lógica de la app
// SIN funciones de navegación (están inline en index.html)
// ==========================================
console.log("[app.js] Cargado - versión definitiva");

// ==========================================
// FUNCIONES DE MANEJO DE CARTAS
// ==========================================

window.obtenerCuatroCartasAleatorias = function() {
    const mazo = window.obtenerMazoActivo ? window.obtenerMazoActivo() : [];
    console.log("[app.js] Mazo length:", mazo ? mazo.length : 0);

    if (!mazo || !mazo.length) {
        console.error("❌ [app.js] Mazo vacío. Verificá arcanos.js");
        return [];
    }

    const mezclado = [...mazo];
    for (let i = mezclado.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mezclado[i], mezclado[j]] = [mezclado[j], mezclado[i]];
    }
    const resultado = mezclado.slice(0, 4);
    console.log("[app.js] Cartas aleatorias:", resultado);
    return resultado;
};

window.cargarSelectoresFisicos = function() {
    const idsSelects = ['fisico-carta1', 'fisico-carta2', 'fisico-carta3', 'fisico-carta4'];
    const mazo = window.obtenerMazoActivo ? window.obtenerMazoActivo() : [];

    if (!mazo || !mazo.length) {
        console.warn("⚠️ [app.js] Mazo no disponible para selectores");
        return;
    }

    idsSelects.forEach((id, index) => {
        const select = document.getElementById(id);
        if (!select) return;

        select.innerHTML = `<option value="">-- Selecciona Carta ${index + 1} --</option>`;

        mazo.forEach(carta => {
            const nombreCarta = typeof carta === 'string' ? carta : (carta.nombre || carta.name || String(carta));
            const option = document.createElement('option');
            option.value = nombreCarta;
            option.textContent = nombreCarta;
            select.appendChild(option);
        });
    });
    console.log("[app.js] Selectores cargados:", mazo.length, "cartas");
};

function nombreAImagen(nombre) {
    if (!nombre || typeof nombre !== 'string') {
        console.warn("[app.js] nombre inválido:", nombre);
        return 'cartas/desconocida.jpg';
    }
    const slug = nombre.toLowerCase()
        .replace(/ /g, '_')
        .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
        .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
        .replace(/[^a-z0-9_]/g, '');
    if (!slug) return 'cartas/desconocida.jpg';
    return `cartas/${slug}.jpg`;
}

window.renderizarMesaDuplas = function(cartas, tema) {
    console.log("[app.js] renderizarMesaDuplas:", cartas);
    if (!cartas || cartas.length < 4) {
        console.error("❌ [app.js] Cartas insuficientes");
        return;
    }

    const tituloTema = document.getElementById('reading-theme-title');
    if (tituloTema) {
        const estiloTxt = (window.estiloSeleccionado || 'Mágico').toUpperCase();
        const modoTxt = window.submodoFisicoActual === 'tarotista_fisico' ? 'ESTRUCTURAL' : estiloTxt;
        tituloTema.textContent = `🔮 Lectura por Duplas (${modoTxt}): ${tema}`;
    }

    const idsNombres = ['name-a', 'name-b', 'name-c', 'name-d'];
    const idsImagenes = ['img-a', 'img-b', 'img-c', 'img-d'];

    cartas.forEach((cartaNombre, i) => {
        const elNombre = document.getElementById(idsNombres[i]);
        const elImg = document.getElementById(idsImagenes[i]);

        if (elNombre) {
            elNombre.textContent = cartaNombre || '???';
            elNombre.style.display = 'block';
        }
        if (elImg) {
            const imgUrl = nombreAImagen(cartaNombre);
            elImg.innerHTML = `<img src="${imgUrl}" alt="${cartaNombre || 'carta'}" onerror="this.parentElement.innerHTML='🃏'" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
        }
    });
};

// ==========================================
// CONSULTA GRATIS
// ==========================================

window.consultaGratis = async function() {
    const input = document.getElementById('input-pregunta-gratis');
    const pregunta = input ? input.value.trim() : '';

    if (!pregunta) {
        alert('✨ Escribí tu pregunta');
        return;
    }

    if (typeof mostrarPantalla === 'function') mostrarPantalla('screen-gratis-result');

    const preguntaMostrar = document.getElementById('gratis-pregunta-mostrar');
    if (preguntaMostrar) preguntaMostrar.textContent = pregunta;

    const cartas = window.obtenerCuatroCartasAleatorias();
    if (!cartas || cartas.length < 4) {
        alert('⚠️ Error al cargar el mazo');
        return;
    }

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
                <p style="color:#a78bfa; margin-top:15px;">Consultando las cartas...</p>
            </div>
        `;
    }

    try {
        const payload = {
            a: cartas[0], b: cartas[1], c: cartas[2], d: cartas[3],
            tema: 'Consulta Gratis', pregunta: pregunta,
            estilo: 'magico', modo: 'gratis'
        };
        console.log("[app.js] 📤 Consulta gratis:", payload);

        const urlEndpoint = window.SERVIDOR_URL.endsWith('/') ? `${window.SERVIDOR_URL}tirada` : `${window.SERVIDOR_URL}/tirada`;
        const respuesta = await fetch(urlEndpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await respuesta.json();
        if (!respuesta.ok) throw new Error(data.error || 'Error servidor');

        let texto = data.lectura || data.respuesta || data.texto || '';
        if (!texto) texto = '<p>El Oráculo no pudo responder.</p>';
        if (contenedorRespuesta) contenedorRespuesta.innerHTML = texto;

    } catch (error) {
        console.error('❌ [app.js] Error consulta gratis:', error);
        if (contenedorRespuesta) {
            contenedorRespuesta.innerHTML = `<div style="color:#ff6b6b; text-align:center; padding:20px;">❌ ${error.message}</div>`;
        }
    }
};

window.nuevaConsultaGratis = function() {
    const input = document.getElementById('input-pregunta-gratis');
    if (input) input.value = '';
    if (typeof mostrarPantalla === 'function') mostrarPantalla('screen-landing');
};

window.entrarAppCompleta = function() {
    if (typeof mostrarPantalla === 'function') mostrarPantalla('screen-portada');
};

// ==========================================
// PETICIÓN AL SERVIDOR (APP COMPLETA)
// ==========================================

window.enviarPeticionRender = async function(cartas, tema, preguntaCustom) {
    console.log("[app.js] enviarPeticionRender cartas:", cartas);

    const contenedorTexto = document.getElementById('interpretation-text');
    if (contenedorTexto) {
        contenedorTexto.innerHTML = `<div style="text-align:center; padding:20px; color:#a78bfa;">✨ Conectando con el Oráculo...</div>`;
    }

    try {
        const payload = {
            a: cartas[0], b: cartas[1], c: cartas[2], d: cartas[3],
            tema: tema || 'General', pregunta: preguntaCustom || "",
            estilo: window.estiloSeleccionado || 'filosofico'
        };
        console.log("[app.js] 📤 Enviando:", payload);

        const urlEndpoint = window.SERVIDOR_URL.endsWith('/') ? `${window.SERVIDOR_URL}tirada` : `${window.SERVIDOR_URL}/tirada`;
        const respuesta = await fetch(urlEndpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await respuesta.json();
        console.log("[app.js] 📥 Respuesta:", data);

        if (!respuesta.ok) throw new Error(data.error || `HTTP ${respuesta.status}`);

        if (contenedorTexto) {
            let texto = data.lectura || data.resultado || data.interpretacion || data.respuesta || data.texto || data.mensaje || data.reading || (data.choices && data.choices[0]?.message?.content);
            if (!texto) texto = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            contenedorTexto.innerHTML = texto;
            if (typeof guardarEnHistorialLocal === 'function') {
                guardarEnHistorialLocal(tema, {a:cartas[0],b:cartas[1],c:cartas[2],d:cartas[3]}, texto);
            }
        }
    } catch (error) {
        console.error("❌ [app.js] Error:", error);
        if (contenedorTexto) {
            contenedorTexto.innerHTML = `<div style="color:#ff6b6b; text-align:center; padding:20px;">❌ ${error.message}</div>`;
        }
    }
};

// ==========================================
// FLUJO PRINCIPAL DE LA TIRADA
// ==========================================

window.procesarTiradaCompleta = async function(tema, preguntaCustom) {
    let cartasElegidas = [];

    if (window.modoFisicoActivo) {
        if (window.cartasFisicoSeleccionadas && window.cartasFisicoSeleccionadas.length === 4
            && window.cartasFisicoSeleccionadas.every(c => c && c.trim() !== '')) {
            cartasElegidas = window.cartasFisicoSeleccionadas;
            console.log("[app.js] Usando cartas físicas guardadas:", cartasElegidas);
        } else {
            cartasElegidas = [
                document.getElementById('fisico-carta1')?.value,
                document.getElementById('fisico-carta2')?.value,
                document.getElementById('fisico-carta3')?.value,
                document.getElementById('fisico-carta4')?.value
            ];
            console.log("[app.js] Leyendo del DOM:", cartasElegidas);
        }
    } else {
        cartasElegidas = window.obtenerCuatroCartasAleatorias();
    }

    if (!cartasElegidas || cartasElegidas.length < 4 || !cartasElegidas[0] || !cartasElegidas[1] || !cartasElegidas[2] || !cartasElegidas[3]) {
        console.error("❌ [app.js] Cartas incompletas:", cartasElegidas);
        if (window.modoFisicoActivo) {
            alert("⚠️ No se detectaron las cartas físicas. Volvé a seleccionarlas.");
            if (typeof mostrarPantalla === 'function') mostrarPantalla('screen-fisico');
        } else {
            alert("⚠️ Error al obtener las cartas.");
        }
        return;
    }

    if (typeof window.mostrarPantalla === 'function') window.mostrarPantalla('screen-result');
    window.renderizarMesaDuplas(cartasElegidas, tema);
    await window.enviarPeticionRender(cartasElegidas, tema, preguntaCustom);
};
// ==========================================
// CONTROL DE PANEL DE VOZ SEGÚN MODO
// ==========================================

window.mostrarPanelVozSegunModo = function() {
    const panelMagico = document.getElementById('voice-panel-magico-filosofico');
    const panelProfesional = document.getElementById('voice-panel-profesional');
    
    // Verificar si estamos en modo estructural/técnico (profesional)
    const esModoProfesional = window.submodoFisicoActual === 'tarotista_fisico';
    
    // Ocultar ambos primero
    if (panelMagico) panelMagico.style.display = 'none';
    if (panelProfesional) panelProfesional.style.display = 'none';
    
    // Mostrar el que corresponde
    if (esModoProfesional) {
        if (panelProfesional) panelProfesional.style.display = 'grid';
        console.log("[UI] Panel profesional (Dupla 1 y Dupla 2)");
    } else {
        if (panelMagico) panelMagico.style.display = 'grid';
        console.log("[UI] Panel mágico/filosófico (Leer todo, Conclusión, Predicciones)");
    }
};
// ==========================================
// TIRADA ESTRUCTURAL / TÉCNICA
// ==========================================

window.procesarTiradaEstructural = async function() {
    const cartas = window.cartasFisicoSeleccionadas;
    console.log("[app.js] procesarTiradaEstructural cartas:", cartas);

    if (!cartas || cartas.length !== 4 || cartas.some(c => !c || !c.trim())) {
        alert("⚠️ Error: cartas no seleccionadas correctamente.");
        return;
    }

    const [c1, c2, c3, c4] = cartas;
    window.renderizarMesaDuplas(cartas, 'Análisis Estructural');

    const contenedorTexto = document.getElementById('interpretation-text');
    if (contenedorTexto) {
        contenedorTexto.innerHTML = `
            <div style="text-align:center; padding:30px;">
                <div class="spinner"></div>
                <p style="color:#a78bfa; margin-top:15px;">Consultando base de duplas...</p>
            </div>
        `;
    }

    // Ocultar el panel de voz al inicio
    window.mostrarPanelVozSegunModo();

    try {
        const API_BASE = window.SERVIDOR_URL.replace('/tirada', '');
        console.log("[app.js] Consultando duplas en:", API_BASE);

        const url1 = `${API_BASE}/api/duplas/buscar?a=${encodeURIComponent(c1)}&b=${encodeURIComponent(c2)}`;
        const url2 = `${API_BASE}/api/duplas/buscar?a=${encodeURIComponent(c3)}&b=${encodeURIComponent(c4)}`;
        
        console.log("🔗 URL Dupla 1:", url1);
        console.log("🔗 URL Dupla 2:", url2);

        const [resp1, resp2] = await Promise.all([
            fetch(url1),
            fetch(url2)
        ]);

        const data1 = await resp1.json();
        const data2 = await resp2.json();
        console.log("[app.js] Dupla 1 respuesta:", data1, "Dupla 2 respuesta:", data2);

        let html = '';

        html += `<div class="reading-section resaltado-místico"><h3>🔮 Dupla 1: ${c1} + ${c2}</h3>`;
        if (data1.encontrada) {
            html += data1.significado;
            if (data1.keywords && data1.keywords.length > 0) html += `<p style="margin-top:10px; font-size:0.85rem; color:#a78bfa;">🏷️ Keywords: ${data1.keywords.join(', ')}</p>`;
        } else {
            const local1 = window.buscarDuplaLocal ? window.buscarDuplaLocal(c1, c2) : { encontrada: false };
            if (local1.encontrada) {
                html += local1.significado;
                if (local1.keywords && local1.keywords.length > 0) html += `<p style="margin-top:10px; font-size:0.85rem; color:#a78bfa;">🏷️ Keywords: ${local1.keywords.join(', ')}</p>`;
            } else {
                html += `<p style="color:#ff6b6b;">⚠️ Combinación sin interpretación cargada.<br><small>${c1} | ${c2}</small></p>`;
            }
        }
        html += `</div>`;

        html += `<div class="reading-section resaltado-místico"><h3>🔮 Dupla 2: ${c3} + ${c4}</h3>`;
        if (data2.encontrada) {
            html += data2.significado;
            if (data2.keywords && data2.keywords.length > 0) html += `<p style="margin-top:10px; font-size:0.85rem; color:#a78bfa;">🏷️ Keywords: ${data2.keywords.join(', ')}</p>`;
        } else {
            const local2 = window.buscarDuplaLocal ? window.buscarDuplaLocal(c3, c4) : { encontrada: false };
            if (local2.encontrada) {
                html += local2.significado;
                if (local2.keywords && local2.keywords.length > 0) html += `<p style="margin-top:10px; font-size:0.85rem; color:#a78bfa;">🏷️ Keywords: ${local2.keywords.join(', ')}</p>`;
            } else {
                html += `<p style="color:#ff6b6b;">⚠️ Combinación sin interpretación cargada.<br><small>${c3} | ${c4}</small></p>`;
            }
        }
        html += `</div>`;

        if (contenedorTexto) contenedorTexto.innerHTML = html;

        // ==========================================
        // ALMACENAR TEXTOS PARA VOZ Y MOSTRAR PANEL
        // ==========================================
        
        // Almacenar textos de duplas para voz
        window.textoDupla1 = data1.encontrada ? 
            `Dupla 1: ${c1} y ${c2}. ${data1.significado?.replace(/<[^>]*>/g, '').replace(/🔮|✨/g, '').trim()}` : 
            `Dupla 1: ${c1} y ${c2}. Sin interpretación cargada.`;

        window.textoDupla2 = data2.encontrada ? 
            `Dupla 2: ${c3} y ${c4}. ${data2.significado?.replace(/<[^>]*>/g, '').replace(/🔮|✨/g, '').trim()}` : 
            `Dupla 2: ${c3} y ${c4}. Sin interpretación cargada.`;

        // Mostrar el panel de voz SOLO si hay al menos una dupla encontrada
        // Mostrar el panel de voz SOLO si hay al menos una dupla encontrada
if (data1.encontrada || data2.encontrada) {
    window.mostrarPanelVozSegunModo();
}

        // Guardar en historial
        if (typeof guardarEnHistorialLocal === 'function') {
            const resumen = `Dupla 1 (${c1}+${c2}): ${data1.encontrada?'OK':'Sin datos'} | Dupla 2 (${c3}+${c4}): ${data2.encontrada?'OK':'Sin datos'}`;
            guardarEnHistorialLocal('Análisis Estructural', {a:c1,b:c2,c:c3,d:c4}, resumen);
        }

    } catch (error) {
        console.error("❌ [app.js] Error consultando duplas:", error);
        if (contenedorTexto && window.buscarDuplaLocal) {
            let html = '';
            const local1 = window.buscarDuplaLocal(c1, c2);
            const local2 = window.buscarDuplaLocal(c3, c4);
            html += `<div class="reading-section resaltado-místico"><h3>🔮 Dupla 1: ${c1} + ${c2}</h3>${local1.encontrada ? local1.significado : '<p style="color:#ff6b6b;">⚠️ Sin datos</p>'}</div>`;
            html += `<div class="reading-section resaltado-místico"><h3>🔮 Dupla 2: ${c3} + ${c4}</h3>${local2.encontrada ? local2.significado : '<p style="color:#ff6b6b;">⚠️ Sin datos</p>'}</div>`;
            html += `<p style="text-align:center; color:#eab308; font-size:0.85rem; margin-top:15px;">⚠️ Modo offline</p>`;
            contenedorTexto.innerHTML = html;
        } else if (contenedorTexto) {
            contenedorTexto.innerHTML = `<div style="color:#ff6b6b; text-align:center; padding:20px;">❌ ${error.message}</div>`;
        }
    }
};
