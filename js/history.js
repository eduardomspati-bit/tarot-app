// ==========================================
// HISTORIAL DE LECTURAS LOCALES
// ==========================================

const HISTORIAL_KEY = 'tarotia_historial_lecturas';
const MAX_HISTORIAL_ITEMS = 10;

function guardarEnHistorialLocal(eje, cartas, lecturaHtml) {
    try {
        let historial = obtenerHistorialLocal();

        const nuevaLectura = {
            id: Date.now(),
            fecha: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            eje: eje,
            cartas: cartas,
            lecturaHtml: lecturaHtml
        };

        historial.unshift(nuevaLectura);

        if (historial.length > MAX_HISTORIAL_ITEMS) {
            historial = historial.slice(0, MAX_HISTORIAL_ITEMS);
        }

        localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
    } catch (e) {
        console.error("Error al guardar en el historial local:", e);
    }
}

function obtenerHistorialLocal() {
    try {
        const data = localStorage.getItem(HISTORIAL_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error al leer el historial:", e);
        return [];
    }
}

function cargarHistorial() {
    const contenedor = document.getElementById('lista-historial-contenedor');
    if (!contenedor) return;

    const historial = obtenerHistorialLocal();

    if (historial.length === 0) {
        contenedor.innerHTML = "<p style='color: var(--muted-text); text-align: center; padding: 20px;'>Aun no tienes lecturas guardadas en este dispositivo.</p>";
        return;
    }

    contenedor.innerHTML = historial.map(item => `
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 10px; padding: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem; color: #a855f7;">
                <span><b>Eje:</b> ${item.eje}</span>
                <span>📅 ${item.fecha}</span>
            </div>
            <p style="font-size: 0.9rem; margin: 5px 0; color: #ffd700;">
                🃏 <b>Cartas:</b> ${item.cartas.a}, ${item.cartas.b} | ${item.cartas.c}, ${item.cartas.d}
            </p>
            <details style="margin-top: 10px; cursor: pointer; color: #ccc; font-size: 0.9rem;">
                <summary style="outline: none; font-weight: bold; color: #a78bfa;">Ver interpretacion</summary>
                <div style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 6px; line-height: 1.5;">
                    ${item.lecturaHtml}
                </div>
            </details>
        </div>
    `).join('');
}

function abrirHistorial() {
    if (typeof mostrarPantalla === 'function') {
        mostrarPantalla('screen-historial');
    }
    cargarHistorial();
}
