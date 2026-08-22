// ==========================================
// HISTORIAL DE LECTURAS LOCALES v2
// Guarda resumen de texto plano (no HTML crudo)
// ==========================================

const HISTORIAL_KEY = 'tarotia_historial_lecturas';
const MAX_HISTORIAL_ITEMS = 10;

// Inyectar estilos del historial si no existen
(function inyectarEstilosHistorial() {
    if (document.getElementById('historial-styles-v2')) return;
    const style = document.createElement('style');
    style.id = 'historial-styles-v2';
    style.textContent = `
        .historial-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(168,85,247,0.15);
            border-radius: 12px;
            padding: 16px;
            transition: all 0.3s ease;
            margin-bottom: 12px;
        }
        .historial-card:hover {
            border-color: rgba(168,85,247,0.3);
            background: rgba(255,255,255,0.05);
        }
        .historial-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            font-size: 0.85rem;
        }
        .historial-eje {
            color: #ffd700;
            font-weight: bold;
        }
        .historial-fecha {
            color: rgba(255,255,255,0.4);
            font-size: 0.75rem;
        }
        .historial-cartas {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin: 10px 0;
        }
        .historial-dupla {
            display: flex;
            gap: 8px;
            justify-content: center;
        }
        .carta-mini {
            background: rgba(168,85,247,0.08);
            border: 1px solid rgba(168,85,247,0.2);
            border-radius: 6px;
            padding: 4px 10px;
            font-size: 0.8rem;
            color: #a78bfa;
        }
        .historial-resumen {
            font-size: 0.85rem;
            color: rgba(255,255,255,0.5);
            margin: 8px 0 0 0;
            line-height: 1.4;
            font-style: italic;
        }
        .historial-empty {
            text-align: center;
            padding: 40px 20px;
            color: var(--muted-text, #b3a7c4);
        }
        .historial-empty-icon {
            font-size: 3rem;
            margin-bottom: 10px;
        }
        .btn-borrar-historial {
            margin-top: 15px;
            background: rgba(255,100,100,0.1);
            border: 1px solid rgba(255,100,100,0.3);
            color: #ff6b6b;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            font-size: 0.9rem;
            transition: all 0.3s;
        }
        .btn-borrar-historial:hover {
            background: rgba(255,100,100,0.2);
        }
    `;
    document.head.appendChild(style);
})();

function guardarEnHistorialLocal(eje, cartas, lecturaHtml) {
    try {
        let historial = obtenerHistorialLocal();

        // NO guardamos el HTML completo, solo un resumen de texto plano
        // Esto evita que localStorage se llene y pese megas
        let resumenTexto = '';
        if (typeof lecturaHtml === 'string') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = lecturaHtml;
            resumenTexto = tempDiv.textContent || tempDiv.innerText || '';
            resumenTexto = resumenTexto.replace(/\s+/g, ' ').trim().slice(0, 300);
        }

        const nuevaLectura = {
            id: Date.now(),
            fecha: new Date().toLocaleDateString('es-AR', { 
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
            }),
            eje: eje,
            cartas: cartas,
            resumen: resumenTexto,
            tieneDetalle: !!lecturaHtml && lecturaHtml.length > 50
        };

        historial.unshift(nuevaLectura);
        if (historial.length > MAX_HISTORIAL_ITEMS) {
            historial = historial.slice(0, MAX_HISTORIAL_ITEMS);
        }

        localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
    } catch (e) {
        console.error("[history] Error al guardar en el historial:", e);
    }
}

function obtenerHistorialLocal() {
    try {
        const data = localStorage.getItem(HISTORIAL_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("[history] Error al leer el historial:", e);
        return [];
    }
}

function cargarHistorial() {
    const contenedor = document.getElementById('lista-historial-contenedor');
    if (!contenedor) return;

    const historial = obtenerHistorialLocal();

    if (historial.length === 0) {
        contenedor.innerHTML = `
            <div class="historial-empty">
                <div class="historial-empty-icon">📜</div>
                <p>Aún no tenés lecturas guardadas</p>
            </div>`;
        return;
    }

    contenedor.innerHTML = historial.map(item => `
        <div class="historial-card">
            <div class="historial-header">
                <span class="historial-eje">${item.eje}</span>
                <span class="historial-fecha">📅 ${item.fecha}</span>
            </div>
            <div class="historial-cartas">
                <div class="historial-dupla">
                    <span class="carta-mini">🃏 ${item.cartas.a}</span>
                    <span class="carta-mini">🃏 ${item.cartas.b}</span>
                </div>
                <div style="text-align: center; color: rgba(255,255,255,0.2); font-size: 0.7rem; margin: 4px 0;">⬇</div>
                <div class="historial-dupla">
                    <span class="carta-mini">🃏 ${item.cartas.c}</span>
                    <span class="carta-mini">🃏 ${item.cartas.d}</span>
                </div>
            </div>
            ${item.resumen ? `<p class="historial-resumen">${item.resumen}...</p>` : ''}
        </div>
    `).join('') + `
        <button onclick="limpiarHistorial()" class="btn-borrar-historial">
            🗑️ Borrar historial
        </button>
    `;
}

function limpiarHistorial() {
    if (confirm('¿Borrar todo el historial local?')) {
        localStorage.removeItem(HISTORIAL_KEY);
        cargarHistorial();
    }
}

console.log("[history.js] ✅ v2 cargado - Resumen de texto plano + UI limpia");
