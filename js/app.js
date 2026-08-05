// ==========================================
// VARIABLES DE CONTEXTO GLOBAL
// ==========================================
window.ultimasCartasElegidasContexto = window.ultimasCartasElegidasContexto || null;
window.ultimaLecturaGuardadaContexto = window.ultimaLecturaGuardadaContexto || "";
// ==========================================
// NÚCLEO DE LA TIRADA
// ==========================================

async function procesarTiradaCompleta(tema, preguntaEspecifica = null) {
    if (typeof ocultarTodasLasPantallas === 'function') ocultarTodasLasPantallas();
    
    const screenResult = document.getElementById('screen-result');
    if (!screenResult) return;
    
    if (typeof mostrarPantalla === 'function') mostrarPantalla('screen-result');

    const themeTitle = document.getElementById('reading-theme-title');
    if (themeTitle) themeTitle.innerText = `Consultando Oráculo: Eje ${tema}`;

    const interpretationText = document.getElementById('interpretation-text');
    if (interpretationText) {
        interpretationText.innerHTML = "<p class='loading-cosmico'>✨ Conectando con los planos superiores del Tarot... Interpretando arquetipos...</p>";
    }
    
    document.getElementById('voice-controls')?.classList.add('hidden');
    
    const contenedorRepregunta = document.getElementById('contenedor-repregunta');
    if (contenedorRepregunta) {
        contenedorRepregunta.classList.add('hidden');
        contenedorRepregunta.style.display = 'none';
    }

    let a, b, c, d;

    if (window.modoFisicoActivo) {
        const c1 = document.getElementById('fisico-carta1')?.value;
        const c2 = document.getElementById('fisico-carta2')?.value;
        const c3 = document.getElementById('fisico-carta3')?.value;
        const c4 = document.getElementById('fisico-carta4')?.value;

        if (!c1 || !c2 || !c3 || !c4) {
            if (interpretationText) {
                interpretationText.innerHTML = "<p style='color:#ef4444; text-align:center;'>❌ Error: No se seleccionaron las 4 cartas físicas.</p>";
            }
            return;
        }
        [a, b, c, d] = [c1, c2, c3, c4];
    } else {
        if (typeof arcanosCompleto === 'undefined' || !Array.isArray(arcanosCompleto)) {
            if (interpretationText) {
                interpretationText.innerHTML = "<p style='color:#ef4444; text-align:center;'>Error: Mazo de arcanos no cargado en arcanos.js</p>";
            }
            return;
        }
        let baraja = [...arcanosCompleto];
        let elegidas = [];
        for (let i = 0; i < 4; i++) {
            let idx = Math.floor(Math.random() * baraja.length);
            elegidas.push(baraja.splice(idx, 1)[0]);
        }
        [a, b, c, d] = elegidas;
    }

    // Actualización de nombres de las cartas en el HTML
    const nameA = document.getElementById('name-a'); if (nameA) nameA.innerText = a;
    const nameB = document.getElementById('name-b'); if (nameB) nameB.innerText = b;
    const nameC = document.getElementById('name-c'); if (nameC) nameC.innerText = c;
    const nameD = document.getElementById('name-d'); if (nameD) nameD.innerText = d;
    
    const urlBaseCartas = "https://tarotia-app-psi.github.io/tarot-app/cartas/";
    const formatearNombre = (nombre) => nombre.toLowerCase().trim().replace(/ /g, "_");

    const imgA = document.getElementById('img-a'); if (imgA) imgA.innerHTML = `<img src="${urlBaseCartas}${formatearNombre(a)}.jpg" alt="${a}" class="img-carta-tarot" onerror="this.src='reverso_filosofico.jpg'">`;
    const imgB = document.getElementById('img-b'); if (imgB) imgB.innerHTML = `<img src="${urlBaseCartas}${formatearNombre(b)}.jpg" alt="${b}" class="img-carta-tarot" onerror="this.src='reverso_filosofico.jpg'">`;
    const imgC = document.getElementById('img-c'); if (imgC) imgC.innerHTML = `<img src="${urlBaseCartas}${formatearNombre(c)}.jpg" alt="${c}" class="img-carta-tarot" onerror="this.src='reverso_filosofico.jpg'">`;
    const imgD = document.getElementById('img-d'); if (imgD) imgD.innerHTML = `<img src="${urlBaseCartas}${formatearNombre(d)}.jpg" alt="${d}" class="img-carta-tarot" onerror="this.src='reverso_filosofico.jpg'">`;
    
    ultimasCartasElegidasContexto = { a, b, c, d };

    try {
        const endpointUrl = (typeof API_URL !== 'undefined') ? `${API_URL}/tirada` : '/tirada';
        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tema: tema,
                pregunta: preguntaEspecifica, 
                a: a, b: b, c: c, d: d,
                estilo: window.estiloSeleccionado
            })
        });

        if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);

        const datos = await response.json();

        if (datos.lectura) {
            if (interpretationText) interpretationText.innerHTML = datos.lectura;
            ultimaLecturaGuardadaContexto = datos.lectura;

            if (window.estiloSeleccionado !== 'manual') {
                document.getElementById('voice-controls')?.classList.remove('hidden');
            }

            if (window.esUsuarioPremium && contenedorRepregunta) {
                contenedorRepregunta.classList.remove('hidden');
                contenedorRepregunta.style.display = 'flex';
                const textRepregunta = document.getElementById('texto-repregunta');
                if (textRepregunta) textRepregunta.value = "";
            }
            
            if (window.modoFisicoActivo && typeof registrarUsoTiradaFisica === 'function') {
                registrarUsoTiradaFisica();
            }
            
            if (typeof guardarEnHistorialLocal === 'function') {
                guardarEnHistorialLocal(tema, { a, b, c, d }, datos.lectura);
            }
        } else {
            throw new Error("Respuesta vacía del servidor");
        }

    } catch (err) {
        console.error("Error capturado:", err);
        if (interpretationText) {
            interpretationText.innerHTML = "<p style='color:#ef4444; text-align:center;'>❌ La tormenta magnética interrumpió la conexión espiritual. Por favor, verifica que tu servidor de Render esté encendido.</p>";
        }
    }
}

// ==========================================
// ENVÍO DE RE-PREGUNTA PREMIUM
// ==========================================
async function enviarRepreguntaServidor() {
    const textoDuda = document.getElementById('texto-repregunta')?.value.trim();
    if (!textoDuda) {
        alert("🧙‍♂️ Escribe tu duda antes de enviársela al oráculo.");
        return;
    }

    const btn = document.getElementById('btn-enviar-repregunta');
    if (!btn) return;
    
    btn.disabled = true;
    btn.innerText = "Consultando al plano sutil... 🔮";

    const contenedorTexto = document.getElementById('interpretation-text');

    try {
        const endpointUrl = (typeof API_URL !== 'undefined') ? `${API_URL}/repregunta` : '/repregunta';
        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cartas: ultimasCartasElegidasContexto,
                lecturaAnterior: ultimaLecturaGuardadaContexto,
                repregunta: textoDuda,
                estilo: window.estiloSeleccionado
            })
        });

        if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);

        const datos = await response.json();

        if (datos.respuesta && contenedorTexto) {
            const nuevaSeccion = document.createElement('div');
            nuevaSeccion.className = 'reading-section';
            nuevaSeccion.style.borderLeft = '3px solid #ffd700';
            nuevaSeccion.style.background = 'rgba(255,215,0,0.02)';
            nuevaSeccion.style.paddingTop = '15px';
            nuevaSeccion.style.marginTop = '20px';
            
            nuevaSeccion.innerHTML = `
                <h3 style="color: #ffd700;">🔮 Respuesta a tu Duda:</h3>
                <p>${datos.respuesta}</p>
            `;
            
            contenedorTexto.appendChild(nuevaSeccion);
            
            const textRepregunta = document.getElementById('texto-repregunta');
            if (textRepregunta) textRepregunta.value = "";
            
            nuevaSeccion.scrollIntoView({ behavior: 'smooth' });
        } else {
            throw new Error("Respuesta inválida del oráculo");
        }
    } catch (error) {
        console.error("Error en re-pregunta:", error);
        alert("Hubo un corte en los planos sutiles. Intenta de nuevo.");
    } finally {
        if (btn) {
            btn.innerText = "Enviar Re-pregunta Premium 🔮";
            btn.disabled = false;
        }
    }
}

function tirarCartaDiaria() {
    alert("✨ Tu carta del día es El Mundo: Hoy el universo conspira a tu favor. Avanza con seguridad.");
}
