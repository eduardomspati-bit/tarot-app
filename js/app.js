// ==========================================================
// VARIABLES GLOBALES DE ESTADO Y CONFIGURACIÓN
// ==========================================================
let estiloSeleccionado = 'magico';
let modoFisicoActivo = false;
let cartasFisicasElegidas = [];
let ultimasCartasElegidasContexto = null;
let ultimaLecturaGuardadaContexto = '';

// Definición única de la API backend
if (typeof API_URL === 'undefined') {
    var API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://tarot-613b.onrender.com';
}

// ==========================================================
// REGISTRO Y SEGUIMIENTO DE USUARIOS EN MONGODB ATLAS
// ==========================================================

function obtenerIdentidadConsultante() {
    let idUsuario = localStorage.getItem('usuario_tarot_id');
    let nombreUsuario = localStorage.getItem('usuario_tarot_nombre');
    let emailUsuario = localStorage.getItem('usuario_tarot_email');

    if (!idUsuario) {
        idUsuario = 'user_' + Math.random().toString(36).substr(2, 9);
        nombreUsuario = 'Consultante #' + Math.floor(1000 + Math.random() * 9000);

        localStorage.setItem('usuario_tarot_id', idUsuario);
        localStorage.setItem('usuario_tarot_nombre', nombreUsuario);
    }

    return {
        id: idUsuario,
        nombre: nombreUsuario,
        email: emailUsuario ? emailUsuario : `${idUsuario}@consultante.tarot`
    };
}

function registrarConsumoEnServidor() {
    const usuario = obtenerIdentidadConsultante();

    fetch(`${API_URL}/api/usuarios/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre: usuario.nombre,
            email: usuario.email
        })
    })
    .then(res => res.json())
    .then(data => console.log("🔮 Registro actualizado en MongoDB Atlas:", data))
    .catch(err => console.error("⚠️ No se pudo registrar en backend:", err));
}

function registrarEmailUsuario(emailIngresado) {
    if (!emailIngresado || !emailIngresado.includes('@')) {
        alert("🧙‍♂️ Por favor, ingresa un correo electrónico válido.");
        return;
    }

    localStorage.setItem('usuario_tarot_email', emailIngresado);
    registrarConsumoEnServidor();
    alert("✨ ¡Tu correo electrónico ha sido vinculado exitosamente!");
}

function pedirEmailAlUsuario() {
    const emailActual = localStorage.getItem('usuario_tarot_email') || '';
    const nuevoEmail = prompt("🧙‍♂️ Ingresa tu correo electrónico para vincular tu cuenta y tus lecturas:", emailActual);

    if (nuevoEmail) {
        registrarEmailUsuario(nuevoEmail.trim());
    }
}

// ==========================================
// CONTROLADOR DE ADQUISICIÓN PREMIUM
// ==========================================

function adquirirPasePremium() {
    let emailGuardado = localStorage.getItem('usuario_tarot_email') || '';

    if (!emailGuardado || emailGuardado.includes('@consultante.tarot')) {
        const correoIngresado = prompt("🧙‍♂️ Ingresa tu correo electrónico para asociar tu compra Premium a tu cuenta:");
        if (correoIngresado && correoIngresado.includes('@')) {
            localStorage.setItem('usuario_tarot_email', correoIngresado.trim());
            registrarConsumoEnServidor();
        } else if (correoIngresado !== null) {
            alert("⚠️ Se requiere un mail válido para identificar tu cuenta Premium.");
            return;
        }
    }

    const LINK_DE_PAGO_REAL = "https://mpago.la/2rDcjLS"; 
    window.open(LINK_DE_PAGO_REAL, '_blank');
}

// ==========================================
// GESTIÓN DE VISTAS Y NAVEGACIÓN
// ==========================================

function ocultarTodasLasPantallas() {
    const screens = [
        'screen-portada', 
        'screen-fisico', 
        'screen-selector', 
        'screen-pregunta', 
        'screen-result', 
        'screen-historial', 
        'screen-modulo-profesional',
        'screen-guia-lectura'
    ];
    
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.style.display = 'none';
        }
    });
}

function irAlEjeConsulta(estilo) {
    estiloSeleccionado = estilo;
    modoFisicoActivo = false;

    ocultarTodasLasPantallas();

    const screenSelector = document.getElementById('screen-selector');
    if (screenSelector) {
        screenSelector.classList.remove('hidden');
        screenSelector.style.display = 'block';

        const tituloEje = document.getElementById('titulo-eje-estilo');
        if (tituloEje) {
            if (estilo === 'magico') tituloEje.innerText = "🔮 Módulo Mágico: Selecciona tu Eje";
            else if (estilo === 'filosofico') tituloEje.innerText = "📜 Módulo Filosófico: Selecciona tu Eje";
            else if (estilo === 'manual') tituloEje.innerText = "📖 Manual Tarotista: Selecciona el Eje";
            else tituloEje.innerText = "Selecciona el Eje de tu Consulta:";
        }
    }
}

function abrirGuiaLectura() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    ocultarTodasLasPantallas();
    
    const screenGuia = document.getElementById('screen-guia-lectura');
    if (screenGuia) {
        screenGuia.classList.remove('hidden');
        screenGuia.style.display = 'block';
    }
}

function volverAlModuloProfesional() {
    ocultarTodasLasPantallas();
    const modProf = document.getElementById('screen-modulo-profesional');
    if (modProf) {
        modProf.classList.remove('hidden');
        modProf.style.display = 'block';
    }
}

// ==========================================
// ACCESOS Y FLUJO DE MAZO FÍSICO
// ==========================================

function verificarAccesoTarotista() {
    irAlEjeConsulta('manual');
}

function verificarAccesoTarotistaFisico() {
    estiloSeleccionado = 'manual'; 
    modoFisicoActivo = true; 
    cartasFisicasElegidas = [];
    inicializarYMostrarPantallaFisica();
}

function verificarAccesoFisico() {
    const esPremium = typeof esUsuarioPremium !== 'undefined' && esUsuarioPremium;
    if (!esPremium && obtenerMuestrasFisicasRestantes() <= 0) {
        alert("🧙‍♂️ Has agotado tus 5 muestras gratuitas de mazo físico. Adquiere el Pase Premium para continuar.");
        return;
    }
    estiloSeleccionado = 'magico';
    modoFisicoActivo = true;
    cartasFisicasElegidas = [];
    inicializarYMostrarPantallaFisica();
}

function inicializarYMostrarPantallaFisica() {
    const esPremium = typeof esUsuarioPremium !== 'undefined' && esUsuarioPremium;
    if (!esPremium) {
        const restantes = obtenerMuestrasFisicasRestantes();
        if (restantes <= 0) {
            alert("🔮 Has alcanzado el límite de lecturas con Mazo Físico del modo gratuito.\n\nDesbloquea Tarotia Premium para realizar tiradas de mazo físico ilimitadas y re-preguntar al oráculo.");
            if (typeof abrirModalSuscripcion === 'function') {
                abrirModalSuscripcion();
            }
            return;
        }
    }

    ocultarTodasLasPantallas();
    const screenFisico = document.getElementById('screen-fisico');
    if (screenFisico) {
        screenFisico.classList.remove('hidden');
        screenFisico.style.display = 'block';
    }
    
    if (typeof arcanosCompleto === 'undefined' || !Array.isArray(arcanosCompleto)) {
        alert("❌ Error: No se encontró la lista de cartas 'arcanosCompleto'.");
        return;
    }
    
    const idsSelects = ['fisico-carta1', 'fisico-carta2', 'fisico-carta3', 'fisico-carta4'];
    idsSelects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = ""; 

            let optDefault = document.createElement('option');
            optDefault.value = "";
            optDefault.innerText = "🔍 Selecciona una carta...";
            optDefault.disabled = true;
            optDefault.selected = true;
            select.appendChild(optDefault);
            
            const grupos = [
                { nombre: "✨ Arcanos Mayores", inicio: 0, fin: 21 },
                { nombre: "🌿 Palo de Bastos", inicio: 22, fin: 35 },
                { nombre: "🏆 Palo de Copas", inicio: 36, fin: 49 },
                { nombre: "⚔️ Palo de Espadas", inicio: 50, fin: 63 },
                { nombre: "🪙 Palo de Oros", inicio: 64, fin: 77 }
            ];

            grupos.forEach(g => {
                let grupoElemento = document.createElement('optgroup');
                grupoElemento.label = g.nombre;
                
                for (let i = g.inicio; i <= g.fin; i++) {
                    if (arcanosCompleto[i]) {
                        let opt = document.createElement('option');
                        opt.value = arcanosCompleto[i]; 
                        opt.innerText = arcanosCompleto[i];
                        grupoElemento.appendChild(opt);
                    }
                }
                select.appendChild(grupoElemento);
            });
        }
    });

    actualizarBadgeMuestrasFisicas();
}

function irAlEjeFisico() {
    const c1 = document.getElementById('fisico-carta1')?.value;
    const c2 = document.getElementById('fisico-carta2')?.value;
    const c3 = document.getElementById('fisico-carta3')?.value;
    const c4 = document.getElementById('fisico-carta4')?.value;

    if (!c1 || !c2 || !c3 || !c4) {
        alert("🧙‍♂️ Por favor, selecciona las 4 cartas de tus duplas físicas antes de continuar.");
        return;
    }

    cartasFisicasElegidas = [c1, c2, c3, c4];

    const btnPregunta = document.getElementById('btn-pregunta-especifica');
    if (btnPregunta) {
        btnPregunta.style.display = 'none'; 
    }

    ocultarTodasLasPantallas();
    const screenSelector = document.getElementById('screen-selector');
    if (screenSelector) {
        const tituloEje = document.getElementById('titulo-eje-estilo');
        if (tituloEje) {
            tituloEje.innerText = (estiloSeleccionado === 'manual') 
                ? "Manual Tarotista: Selecciona el eje de estudio:" 
                : "Mazo Físico: Selecciona el eje de tu consulta:";
        }
        screenSelector.classList.remove('hidden');
        screenSelector.style.display = 'block';
    }
}

// ==========================================
// DESPACHO Y NÚCLEO DE LA TIRADA
// ==========================================

function ejecutarLecturaSegunModo(tema) {
    if (tema === 'Pregunta Específica') {
        if (typeof abrirPantallaPregunta === 'function') abrirPantallaPregunta();
        return;
    }

    registrarConsumoEnServidor();
    procesarTiradaCompleta(tema, null);
}

function confirmarPreguntaYEjecutar() {
    const preguntaTexto = document.getElementById('texto-pregunta-usuario')?.value.trim();
    if (!preguntaTexto) {
        alert("🧙‍♂️ Por favor, escribe tu duda o consulta mística antes de continuar.");
        return;
    }

    registrarConsumoEnServidor();
    procesarTiradaCompleta('Pregunta Específica', preguntaTexto);
}

async function procesarTiradaCompleta(tema, preguntaEspecifica = null) {
    ocultarTodasLasPantallas();
    const screenResult = document.getElementById('screen-result');
    if (!screenResult) return;
    
    screenResult.classList.remove('hidden');
    screenResult.style.display = 'block';

    document.getElementById('reading-theme-title').innerText = `Consultando Oráculo: Eje ${tema}`;
    document.getElementById('interpretation-text').innerHTML = "<p class='loading-cosmico'>✨ Conectando con los planos superiores del Tarot... Interpretando arquetipos...</p>";
    
    document.getElementById('voice-controls')?.classList.add('hidden');
    document.getElementById('contenedor-repregunta')?.classList.add('hidden');

    let a, b, c, d;

    if (modoFisicoActivo) {
        const c1 = document.getElementById('fisico-carta1')?.value;
        const c2 = document.getElementById('fisico-carta2')?.value;
        const c3 = document.getElementById('fisico-carta3')?.value;
        const c4 = document.getElementById('fisico-carta4')?.value;

        if (!c1 || !c2 || !c3 || !c4) {
            document.getElementById('interpretation-text').innerHTML = "<p style='color:#ef4444; text-align:center;'>❌ Error: No se seleccionaron las 4 cartas físicas.</p>";
            return;
        }
        cartasFisicasElegidas = [c1, c2, c3, c4];
        [a, b, c, d] = cartasFisicasElegidas;
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
                estilo: estiloSeleccionado
            })
        });

        if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);

        const datos = await response.json();

        if (datos.lectura) {
            document.getElementById('interpretation-text').innerHTML = datos.lectura;
            ultimaLecturaGuardadaContexto = datos.lectura;

            if (estiloSeleccionado !== 'manual') {
                document.getElementById('voice-controls')?.classList.remove('hidden');
            }

            if (typeof esUsuarioPremium !== 'undefined' && esUsuarioPremium) {
                document.getElementById('contenedor-repregunta')?.classList.remove('hidden');
                const textRepregunta = document.getElementById('texto-repregunta');
                if (textRepregunta) textRepregunta.value = "";
            }
            
            if (modoFisicoActivo) {
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
                estilo: estiloSeleccionado
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

// =========================================================
// GESTIÓN DE MUESTRAS FÍSICAS Y HISTORIAL LOCAL
// =========================================================

function obtenerMuestrasFisicasRestantes() {
    let muestras = localStorage.getItem('muestrasFisicasTarot');
    if (muestras === null) {
        localStorage.setItem('muestrasFisicasTarot', '5');
        return 5;
    }
    return parseInt(muestras, 10) || 0;
}

function registrarUsoTiradaFisica() {
    if (typeof esUsuarioPremium !== 'undefined' && esUsuarioPremium) return;
    let actuales = obtenerMuestrasFisicasRestantes();
    if (actuales > 0) {
        actuales--;
        localStorage.setItem('muestrasFisicasTarot', actuales.toString());
        actualizarBadgeMuestrasFisicas();
    }
}

function actualizarBadgeMuestrasFisicas() {
    const badge = document.getElementById('badge-physic-muestra-prof') || document.getElementById('badge-fisico-muestra-prof');
    if (badge) {
        if (typeof esUsuarioPremium !== 'undefined' && esUsuarioPremium) {
            badge.innerText = "Ilimitado ✨";
            badge.style.borderColor = "#a78bfa";
        } else {
            const restantes = obtenerMuestrasFisicasRestantes();
            badge.innerText = `${restantes} Muestras`;
        }
    }
}

function guardarEnHistorialLocal(tema, cartas, lecturaHtml) {
    try {
        let historial = JSON.parse(localStorage.getItem('tarotHistorialLocal')) || [];
        const nuevaLectura = {
            id: Date.now(),
            fecha: new Date().toLocaleDateString('es-AR'),
            tema: tema,
            cartas: cartas,
            lectura: lecturaHtml
        };
        historial.unshift(nuevaLectura);
        if (historial.length > 10) historial.pop(); 
        localStorage.setItem('tarotHistorialLocal', JSON.stringify(historial));
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
        let historial = JSON.parse(localStorage.getItem('tarotHistorialLocal')) || [];
        
        if (historial.length === 0) {
            contenedor.innerHTML = "<p style='color:var(--muted-text); text-align:center;'>No posees lecturas guardadas en este dispositivo.</p>";
        } else {
            historial.forEach(item => {
                const bloque = document.createElement('div');
                bloque.className = 'history-item';
                bloque.style.cssText = "background:rgba(255,255,255,0.02); padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); margin-bottom:10px;";
                bloque.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.85rem; color:#a855f7;">
                        <span>📅 ${item.fecha}</span>
                        <span>🔮 Eje: ${item.tema}</span>
                    </div>
                    <p style="font-size:0.9rem; margin: 0 0 10px 0; color:#ffd700;">🃏 ${item.cartas.a} • ${item.cartas.b} • ${item.cartas.c} • ${item.cartas.d}</p>
                    <button onclick="cargarLecturaHistorial(${item.id})" style="background:rgba(168,85,247,0.1); border:1px solid #a855f7; color:#fff; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.85rem;">Revisar Interpretación</button>
                `;
                contenedor.appendChild(bloque);
            });
        }
        screenHistorial.classList.remove('hidden');
        screenHistorial.style.display = 'block';
    }
}

function cargarLecturaHistorial(idItem) {
    let historial = JSON.parse(localStorage.getItem('tarotHistorialLocal')) || [];
    const item = historial.find(element => element.id === idItem);

    if (!item) {
        alert("No se encontró la lectura seleccionada.");
        return;
    }

    ocultarTodasLasPantallas();
    const screenResult = document.getElementById('screen-result');
    if (screenResult) {
        document.getElementById('reading-theme-title').innerText = `Historial: Eje ${item.tema}`;
        document.getElementById('interpretation-text').innerHTML = item.lectura;
        
        document.getElementById('name-a').innerText = item.cartas.a || "Guardada";
        document.getElementById('name-b').innerText = item.cartas.b || "Guardada";
        document.getElementById('name-c').innerText = item.cartas.c || "Guardada";
        document.getElementById('name-d').innerText = item.cartas.d || "Guardada";
        
        document.getElementById('voice-controls')?.classList.add('hidden');
        document.getElementById('contenedor-repregunta')?.classList.add('hidden');
        
        screenResult.classList.remove('hidden');
        screenResult.style.display = 'block';
    }
}

// ==========================================
// SINTETIZADOR DE VOZ
// ==========================================

function reproducirVoz(tipo) {
    if (!window.speechSynthesis) {
        alert("Tu navegador no soporta síntesis de voz.");
        return;
    }
    window.speechSynthesis.cancel();
    
    let contenedor = document.getElementById('interpretation-text');
    if (!contenedor) return;

    let textoA_Leer = "";

    if (tipo === 'todo') {
        textoA_Leer = contenedor.innerText;
    } else if (tipo === 'conclusion') {
        let elementos = contenedor.querySelectorAll('h3, p, li');
        let banderaEncontrado = false;
        
        elementos.forEach(el => {
            const textoLimpio = el.innerText.toLowerCase();
            if (el.tagName === 'H3' && (textoLimpio.includes('conclusión') || textoLimpio.includes('síntesis') || textoLimpio.includes('consejo final') || textoLimpio.includes('resumen'))) {
                banderaEncontrado = true;
            }
            if (banderaEncontrado) {
                textoA_Leer += " " + el.innerText;
            }
        });

        if (!textoA_Leer.trim()) {
            let ps = contenedor.querySelectorAll('p, li');
            if (ps.length > 0) {
                textoA_Leer = ps[ps.length - 1].innerText;
            }
        }
    } else if (tipo === 'predicciones') {
        let elementos = contenedor.querySelectorAll('h3, p, li');
        let capturar = false;

        for (let i = 0; i < elementos.length; i++) {
            let el = elementos[i];
            const textoLimpio = el.innerText.toLowerCase();
            
            if (el.tagName === 'H3' && (textoLimpio.includes('predicciones') || textoLimpio.includes('predicción') || textoLimpio.includes('proyección'))) {
                capturar = true;
                textoA_Leer += " " + el.innerText;
                continue;
            } 
            
            if (capturar && el.tagName === 'H3' && (textoLimpio.includes('conclusión') || textoLimpio.includes('consejo') || textoLimpio.includes('síntesis') || textoLimpio.includes('resumen'))) {
                capturar = false;
                break;
            }

            if (capturar) {
                textoA_Leer += " " + el.innerText;
            }
        }

        if (!textoA_Leer.trim()) {
            let ps = contenedor.querySelectorAll('p');
            if (ps.length >= 3) {
                textoA_Leer = ps[ps.length - 2].innerText;
            }
        }
    }

    if (!textoA_Leer.trim()) {
        textoA_Leer = contenedor.innerText; 
    }

    textoA_Leer = textoA_Leer.replace(/[❌✨🔮🌗🌿🏆⚔️🪙🧙‍♂️💼🚀📚🔍🌓]/g, '');
    textoA_Leer = textoA_Leer.replace(/\s+/g, ' ').trim(); 

    let utterance = new SpeechSynthesisUtterance(textoA_Leer);
    utterance.lang = 'es-AR'; 
    utterance.rate = 1.05;    
    utterance.pitch = 1.05;   

    window.speechSynthesis.speak(utterance);
}
