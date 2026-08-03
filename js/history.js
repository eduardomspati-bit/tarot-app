
// ==========================================
// ALMACENAMIENTO E HISTORIAL LOCAL
// ==========================================

const CLAVE_HISTORIAL = 'tarotHistorialLocal';

function guardarEnHistorialLocal(tema, cartas, lecturaHtml) {
    try {
        let historial = JSON.parse(localStorage.getItem(CLAVE_HISTORIAL)) || [];
        const nuevaLectura = {
            id: Date.now(),
            fecha: new Date().toLocaleDateString('es-AR'),
            tema: tema,
            cartas: cartas,
            lectura: lecturaHtml
        };
        historial.unshift(nuevaLectura);
        if (historial.length > 10) historial.pop(); 
        localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial));
    } catch (e) {
        console.error("Error guardando historial:", e);
    }
}

function abrirHistorial() {
    ocultarTodasLasPantallas();
    
    const screenHistorial = document.getElementById('screen-historial');
    const contenedor = document.getElementById('lista-historial-contenedor');
    
    if (screenHistorial && contenedor) {
        contenedor.innerHTML = "";
        const historial = JSON.parse(localStorage.getItem(CLAVE_HISTORIAL)) || [];
        
        if (historial.length === 0) {
            contenedor.innerHTML = "<p style='color:var(--muted-text, #888); text-align:center;'>No posees lecturas guardadas en este dispositivo.</p>";
        } else {
            historial.forEach(item => {
                const bloque = document.createElement('div');
                bloque.className = 'history-item';
                bloque.style.cssText = "background:rgba(255,255,255,0.02); padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); margin-bottom:10px;";
                
                // Sanitización del título del tema para evitar rupturas de sintaxis en el HTML
                const temaEscape = (item.tema || '').replace(/'/g, "\\'");

                bloque.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.85rem; color:#a855f7;">
                        <span>📅 ${item.fecha}</span>
                        <span>🔮 Eje: ${item.tema}</span>
                    </div>
                    <p style="font-size:0.9rem; margin: 0 0 10px 0; color:#ffd700;">🃏 ${item.cartas?.a || ''} • ${item.cartas?.b || ''} • ${item.cartas?.c || ''} • ${item.cartas?.d || ''}</p>
                    <button class="btn-revisar-historial" style="background:rgba(168,85,247,0.1); border:1px solid #a855f7; color:#fff; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.85rem;">Revisar Interpretación</button>
                `;

                // Asignación limpia mediante evento en lugar de onclick inline
                bloque.querySelector('.btn-revisar-historial').addEventListener('click', () => {
                    cargarLecturaHistorial(item.lectura, item.tema);
                });

                contenedor.appendChild(bloque);
            });
        }
        mostrarPantalla('screen-historial');
    }
}

function cargarLecturaHistorial(lecturaHtml, tema) {
    ocultarTodasLasPantallas();
    
    const screenResult = document.getElementById('screen-result');
    if (screenResult) {
        const titleEl = document.getElementById('reading-theme-title');
        const textEl = document.getElementById('interpretation-text');
        
        if (titleEl) titleEl.innerText = `Historial: Eje ${tema}`;
        if (textEl) textEl.innerHTML = lecturaHtml;
        
        ['name-a', 'name-b', 'name-c', 'name-d'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = "Guardada";
        });
        
        document.getElementById('voice-controls')?.classList.add('hidden');
        document.getElementById('contenedor-repregunta')?.classList.add('hidden');
        
        mostrarPantalla('screen-result');
    }
}
