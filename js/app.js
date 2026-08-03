// ==========================================
// NÚCLEO DE LA TIRADA
// ==========================================

async function procesarTiradaCompleta(tema, preguntaEspecifica = null) {
    ocultarTodasLasPantallas();
    
    const screenResult = document.getElementById('screen-result');
    if (!screenResult) return;
    
    mostrarPantalla('screen-result');

    document.getElementById('reading-theme-title').innerText = `Consultando Oráculo: Eje ${tema}`;
    document.getElementById('interpretation-text').innerHTML = "<p class='loading-cosmico'>✨ Conectando con los planos superiores del Tarot... Interpretando arquetipos...</p>";
    
    document.getElementById('voice-controls')?.classList.add('hidden');
    document.getElementById('contenedor-repregunta')?.classList.add('hidden');

    let a, b, c, d;

    if (window.modoFisicoActivo) {
        const c1 = document.getElementById('fisico-carta1')?.value;
        const c2 = document.getElementById('fisico-carta2')?.value;
        const c3 = document.getElementById('fisico-carta3')?.value;
        const c4 = document.getElementById('fisico-carta4')?.value;

        if (!c1 || !c2 || !c3 || !c4) {
            document.getElementById('interpretation-text').innerHTML = "<p style='color:#ef4444; text-align:center;'>❌ Error: No se seleccionaron las 4 cartas físicas.</p>";
            return;
        }
        [a, b, c, d] = [c1, c2, c3, c4];
    } else {
        if (typeof arcanosCompleto === 'undefined' || !Array.isArray(arcanosCompleto)) {
            document.getElementById('interpretation-text').innerHTML = "<p style='color:#ef4444; text-align:center;'>Error: Mazo de arcanos no cargado en arcanos.js</p>";
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

    document.getElementById('name-a').innerText = a;
    document.getElementById('name-b').innerText = b;
    document.getElementById('name-c').innerText = c;
    document.getElementById('name-d').innerText = d;
    
    const urlBaseCartas = "https://tarotia-app-psi.github.io/tarot-app/cartas/";
    const formatearNombre = (nombre) => nombre.toLowerCase().trim().replace(/ /g, "_");

    document.getElementById('img-a').innerHTML = `<img src="${urlBaseCartas}${formatearNombre(a)}.jpg" alt="${a}" class="img-carta-tarot" onerror="this.src='reverso_filosofico.jpg'">`;
    document.getElementById('img-b').innerHTML = `<img src="${urlBaseCartas}${formatearNombre(b)}.jpg" alt="${b}" class="img-carta-tarot" onerror="this.src='reverso_filosofico.jpg'">`;
    document.getElementById('img-c').innerHTML = `<img src="${urlBaseCartas}${formatearNombre(c)}.jpg" alt="${c}" class="img-carta-tarot" onerror="this.src='reverso_filosofico.jpg'">`;
    document.getElementById('img-d').innerHTML = `<img src="${urlBaseCartas}${formatearNombre(d)}.jpg" alt="${d}" class="img-carta-tarot" onerror="this.src='reverso_filosofico.jpg'">`;
    
    ultimasCartasElegidasContexto = { a, b, c, d };

    try {
        const response = await fetch(`${API_URL}/tirada`, {
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
            document.getElementById('interpretation-text').innerHTML = datos.lectura;
            ultimaLecturaGuardadaContexto = datos.lectura;

            if (window.estiloSeleccionado !== 'manual') {
                document.getElementById('voice-controls')?.classList.remove('hidden');
            }

            if (window.esUsuarioPremium) {
                document.getElementById('contenedor-repregunta')?.classList.remove('hidden');
                const textRepregunta = document.getElementById('texto-repregunta');
                if (textRepregunta) textRepregunta.value = "";
            }
            
            if (window.modoFisicoActivo) {
                registrarUsoTiradaFisica();
            }
            
            guardarEnHistorialLocal(tema, { a, b, c, d }, datos.lectura);
        } else {
            throw new Error("Respuesta vacía del servidor");
        }

    } catch (err) {
        console.error("Error capturado:", err);
        document.getElementById('interpretation-text').innerHTML = "<p style='color:#ef4444; text-align:center;'>❌ La tormenta magnética interrumpió la conexión espiritual. Por favor, verifica que tu servidor de Render esté encendido.</p>";
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
        const response = await fetch(`${API_URL}/repregunta`, {
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
                <h3 style="color: #ffd700;">🔮 Respuesta de Tara a tu Duda:</h3>
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
