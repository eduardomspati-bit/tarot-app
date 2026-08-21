// ==========================================
// APP.JS v1 - Lógica principal del Tarot
// ==========================================

console.log("[app.js] Cargando...");

// ==========================================
// PROCESAR TIRADA COMPLETA
// ==========================================

window.procesarTiradaCompleta = async function(tema, preguntaCustom) {
    console.log("[app] 🔮 procesarTiradaCompleta - tema:", tema, "pregunta:", preguntaCustom);
    
    // Mostrar pantalla de resultados
    window.mostrarPantalla('screen-result');
    
    const output = document.getElementById('interpretation-text');
    if (output) {
        output.innerHTML = '<div style="text-align:center; padding:30px; color:#a78bfa;">🔮 Las cartas están hablando...<br><span style="font-size:0.8rem;color:#666;">Consultando al oráculo</span></div>';
    }
    
    try {
        // 1. Obtener las cartas
        let cartas = window.cartasFisicoSeleccionadas;
        
        if (!cartas || cartas.length < 4) {
            // Generar cartas aleatorias
            const mazo = window.arcanosCompleto || obtenerMazoFallback();
            cartas = [];
            const indices = [];
            while (indices.length < 4) {
                const idx = Math.floor(Math.random() * mazo.length);
                if (!indices.includes(idx)) {
                    indices.push(idx);
                    cartas.push(mazo[idx]);
                }
            }
            window.cartasFisicoSeleccionadas = cartas;
        }
        
        const [a, b, c, d] = cartas;
        console.log("[app] Cartas:", { a, b, c, d });
        
        // 2. Mostrar cartas en pantalla
        mostrarCartasEnPantalla(a, b, c, d, tema, preguntaCustom);
        
        // 3. Determinar estilo
        let estilo = window.estiloSeleccionado || 'filosofico';
        const submodo = localStorage.getItem('tarotia_submodo_fisico');
        if (submodo === 'tarotista_fisico' || submodo === 'predictivo_fisico') {
            estilo = 'manual';
        }
        
        // 4. Llamar a la API
        const API_BASE = window.SERVIDOR_URL || 'https://tarot-613b.onrender.com';
        console.log("[app] Llamando a API:", API_BASE);
        
        const response = await fetch(`${API_BASE}/tirada`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tema: tema,
                a: a,
                b: b,
                c: c,
                d: d,
                estilo: estilo,
                pregunta: preguntaCustom || '',
                modo: window.modoFisicoActivo ? 'fisico' : 'auto'
            })
        });
        
        const data = await response.json();
        console.log("[app] Respuesta:", data);
        
        if (!response.ok || data.error) {
            throw new Error(data.error || data.detalle || 'Error del servidor');
        }
        
        // 5. Mostrar interpretación
        if (output && data.lectura) {
            output.innerHTML = data.lectura;
        } else if (output) {
            output.innerHTML = '<p style="color:#ef4444;">No se pudo obtener la interpretación.</p>';
        }
        
        // 6. Guardar en historial
        if (typeof window.guardarEnHistorialLocal === 'function') {
            window.guardarEnHistorialLocal(tema, { a, b, c, d }, output ? output.innerHTML : '');
        }
        
        // 7. Mostrar panel de voz
        if (typeof window.mostrarPanelVozSegunModo === 'function') {
            setTimeout(window.mostrarPanelVozSegunModo, 300);
        }
        
        console.log("[app] ✅ Tirada completada");
        
    } catch (error) {
        console.error("[app] ❌ Error:", error);
        if (output) {
            output.innerHTML = `
                <div style="text-align:center; padding:20px; color:#ef4444; background: rgba(239,68,68,0.1); border-radius:12px;">
                    <p>⚠️ Error al realizar la tirada</p>
                    <p style="font-size:0.9rem; color:#94a3b8;">${error.message || 'Intenta de nuevo'}</p>
                    <button onclick="window.volverAPortada()" style="margin-top:15px; padding:10px 20px; background:#a855f7; border:none; border-radius:8px; color:white; cursor:pointer;">
                        🔄 Volver al menú
                    </button>
                </div>
            `;
        }
    }
};

// ==========================================
// MOSTRAR CARTAS EN PANTALLA
// ==========================================

function mostrarCartasEnPantalla(a, b, c, d, tema, preguntaCustom) {
    const cartas = [a, b, c, d];
    const ids = ['img-a', 'name-a', 'img-b', 'name-b', 'img-c', 'name-c', 'img-d', 'name-d'];
    
    cartas.forEach((carta, i) => {
        const imgEl = document.getElementById(ids[i * 2]);
        const nameEl = document.getElementById(ids[i * 2 + 1]);
        if (imgEl) {
            imgEl.textContent = '🃏';
            imgEl.style.fontSize = '3.5rem';
            imgEl.style.textAlign = 'center';
        }
        if (nameEl) {
            nameEl.textContent = carta;
            nameEl.style.color = '#ffd700';
            nameEl.style.fontWeight = 'bold';
            nameEl.style.fontSize = '1.1rem';
            nameEl.style.textAlign = 'center';
            nameEl.style.marginTop = '5px';
        }
    });
    
    const title = document.getElementById('reading-theme-title');
    if (title) {
        const texto = preguntaCustom && preguntaCustom.length > 0 
            ? `🔮 "${preguntaCustom}"` 
            : `🔮 ${tema || 'Lectura de Tarot'}`;
        title.textContent = texto;
        title.style.color = '#a78bfa';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
    }
}

// ==========================================
// CONSULTA GRATIS
// ==========================================

window.consultaGratis = async function() {
    const input = document.getElementById('input-pregunta-gratis');
    const pregunta = input ? input.value.trim() : '';
    
    if (!pregunta) {
        alert('⚠️ Escribí tu pregunta primero.');
        return;
    }
    
    window.mostrarPantalla('screen-gratis-result');
    
    const mostrar = document.getElementById('gratis-pregunta-mostrar');
    if (mostrar) mostrar.textContent = pregunta;
    
    const mazo = window.arcanosCompleto || obtenerMazoFallback();
    const cartas = [];
    const indices = [];
    while (indices.length < 4) {
        const idx = Math.floor(Math.random() * mazo.length);
        if (!indices.includes(idx)) {
            indices.push(idx);
            cartas.push(mazo[idx]);
        }
    }
    const [a, b, c, d] = cartas;
    
    const visualContainer = document.getElementById('gratis-cartas-visuales');
    if (visualContainer) {
        visualContainer.innerHTML = cartas.map(c => `
            <div style="width:60px;height:90px;background:linear-gradient(135deg,#1a0f2e,#2d1b4e);border:1px solid rgba(168,85,247,0.3);border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:0.6rem;color:#ffd700;text-align:center;padding:5px;word-wrap:break-word;">
                🃏<br>${c.slice(0,12)}
            </div>
        `).join('');
    }
    
    const output = document.getElementById('gratis-respuesta-contenedor');
    if (output) {
        output.innerHTML = '<div style="text-align:center;padding:20px;color:#a78bfa;">🔮 Consultando al oráculo...</div>';
    }
    
    try {
        const API_BASE = window.SERVIDOR_URL || 'https://tarot-613b.onrender.com';
        const response = await fetch(`${API_BASE}/tirada`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tema: 'Consulta Gratis',
                a: a,
                b: b,
                c: c,
                d: d,
                estilo: 'magico',
                pregunta: pregunta,
                modo: 'gratis'
            })
        });
        
        const data = await response.json();
        
        if (output) {
            if (data.lectura) {
                output.innerHTML = data.lectura;
            } else {
                output.innerHTML = `<p style="color:#ef4444;">⚠️ No se pudo obtener respuesta.</p>`;
            }
        }
    } catch (error) {
        console.error("[app] Error:", error);
        if (output) {
            output.innerHTML = `
                <p style="color:#ef4444;">⚠️ Error de conexión. Intenta de nuevo.</p>
                <p style="font-size:0.8rem;color:#666;">${error.message}</p>
            `;
        }
    }
};

window.nuevaConsultaGratis = function() {
    const input = document.getElementById('input-pregunta-gratis');
    if (input) input.value = '';
    window.mostrarPantalla('screen-landing');
};

// ==========================================
// ENTRAR APP COMPLETA
// ==========================================

window.entrarAppCompleta = function() {
    console.log("[app] Entrar al Tarot Completo");
    const token = window.obtenerToken ? window.obtenerToken() : null;
    
    if (token) {
        window.mostrarPantalla('screen-portada');
        if (typeof window.actualizarBadgeGlobal === 'function') {
            window.actualizarBadgeGlobal();
        }
    } else {
        window.mostrarPantalla('screen-auth');
    }
};

// ==========================================
// VOZ (placeholder)
// ==========================================

window.reproducirVoz = function(seccion) {
    console.log("[voz] Reproducir:", seccion);
    alert(`🔊 Función de voz para: ${seccion} (implementar en voice.js)`);
};

window.reproducirVozDupla = function(numero) {
    console.log("[voz] Reproducir dupla:", numero);
    alert(`🔊 Función de voz para dupla ${numero} (implementar en voice.js)`);
};

window.mostrarPanelVozSegunModo = function() {
    const panelMagico = document.getElementById('voice-panel-magico-filosofico');
    const panelProfesional = document.getElementById('voice-panel-profesional');
    const submodo = localStorage.getItem('tarotia_submodo_fisico');
    
    if (submodo === 'tarotista_fisico' || submodo === 'predictivo_fisico') {
        if (panelMagico) panelMagico.style.display = 'none';
        if (panelProfesional) panelProfesional.style.display = 'flex';
    } else {
        if (panelMagico) panelMagico.style.display = 'flex';
        if (panelProfesional) panelProfesional.style.display = 'none';
    }
};

// ==========================================
// SELECTORES FÍSICOS
// ==========================================

window.cargarSelectoresFisicos = function() {
    const mazo = window.arcanosCompleto || obtenerMazoFallback();
    const selects = ['fisico-carta1', 'fisico-carta2', 'fisico-carta3', 'fisico-carta4'];
    
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = '<option value="">Seleccionar carta...</option>' + 
                mazo.map(c => `<option value="${c}">${c}</option>`).join('');
        }
    });
};

// ==========================================
// FALLBACK
// ==========================================

function obtenerMazoFallback() {
    return [
        "El Loco", "El Mago", "La Sacerdotisa", "La Emperatriz", "El Emperador",
        "El Papa", "Los Enamorados", "El Carro", "La Justicia", "El Ermitaño",
        "La Rueda", "La Fuerza", "El Colgado", "La Muerte", "La Templanza",
        "El Diablo", "La Torre", "La Estrella", "La Luna", "El Sol",
        "El Juicio", "El Mundo"
    ];
}

console.log("[app.js] ✅ Módulo principal cargado");
