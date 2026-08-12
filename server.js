<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>KYAMI MODZ • Key System</title>

<style>
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

:root {
    --red: #ff3030;
    --red-dark: #b81717;
    --bg: #050507;
    --card: #0d0d12;
    --card2: #14141b;
    --text: #ffffff;
    --muted: #92929d;
    --green: #29e68a;
}

body {
    min-height: 100vh;
    font-family: Arial, Helvetica, sans-serif;
    color: var(--text);
    background:
        radial-gradient(circle at 50% -10%, #681414 0%, transparent 38%),
        radial-gradient(circle at 0% 100%, #241010 0%, transparent 35%),
        var(--bg);
    overflow-x: hidden;
}

body::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image:
        linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
    background-size: 35px 35px;
    mask-image: linear-gradient(to bottom, black, transparent);
}

.container {
    width: min(94%, 560px);
    margin: 0 auto;
    padding: 35px 0 50px;
    position: relative;
    z-index: 1;
}

.logo {
    text-align: center;
    margin-bottom: 8px;
    font-size: clamp(34px, 10vw, 55px);
    font-weight: 1000;
    letter-spacing: -2px;
    text-shadow: 0 0 25px rgba(255,48,48,.45);
}

.logo span {
    color: var(--red);
}

.subtitle {
    text-align: center;
    color: var(--muted);
    font-size: 13px;
    margin-bottom: 25px;
}

.card {
    background: linear-gradient(145deg, rgba(20,20,27,.96), rgba(8,8,12,.97));
    border: 1px solid rgba(255,48,48,.22);
    border-radius: 22px;
    padding: 22px;
    margin-bottom: 16px;
    box-shadow: 0 15px 50px rgba(0,0,0,.35);
}

.card-title {
    font-size: 18px;
    font-weight: 900;
    margin-bottom: 5px;
}

.card-description {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.5;
    margin-bottom: 18px;
}

.step {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 15px;
    background: var(--card2);
    border: 1px solid #24242d;
    border-radius: 15px;
    margin-top: 10px;
    transition: .25s ease;
}

.step.done {
    border-color: rgba(41,230,138,.5);
    box-shadow: 0 0 20px rgba(41,230,138,.08);
}

.icon {
    width: 43px;
    height: 43px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: #241012;
    font-size: 20px;
}

.step.done .icon {
    background: rgba(41,230,138,.12);
}

.step-info {
    flex: 1;
}

.step-name {
    font-size: 14px;
    font-weight: 900;
}

.step-status {
    color: var(--red);
    font-size: 11px;
    margin-top: 4px;
    font-weight: 700;
}

.step.done .step-status {
    color: var(--green);
}

.step-button {
    border: 0;
    border-radius: 10px;
    padding: 10px 13px;
    color: white;
    background: #25252e;
    font-weight: 800;
    cursor: pointer;
    transition: .2s;
}

.step-button:hover {
    background: #353540;
    transform: translateY(-1px);
}

.step.done .step-button {
    background: rgba(41,230,138,.12);
    color: var(--green);
}

.check-button,
.generate-button {
    width: 100%;
    border: 0;
    border-radius: 14px;
    padding: 16px;
    margin-top: 15px;
    color: white;
    font-weight: 1000;
    font-size: 14px;
    cursor: pointer;
    transition: .2s;
}

.check-button {
    background: #25252d;
}

.check-button:hover {
    background: #34343e;
}

.generate-button {
    background: linear-gradient(135deg, var(--red), var(--red-dark));
    box-shadow: 0 10px 30px rgba(255,48,48,.2);
}

.generate-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(255,48,48,.3);
}

.generate-button:disabled {
    cursor: not-allowed;
    opacity: .35;
    box-shadow: none;
}

.result {
    display: none;
    margin-top: 16px;
    padding: 16px;
    border-radius: 14px;
    background: #09090d;
    border: 1px solid rgba(41,230,138,.35);
}

.result.show {
    display: block;
    animation: pop .3s ease;
}

.result-title {
    color: var(--green);
    font-weight: 900;
    font-size: 13px;
    margin-bottom: 9px;
}

.key-box {
    display: flex;
    gap: 8px;
}

.key {
    flex: 1;
    min-width: 0;
    padding: 13px;
    background: #15151c;
    border-radius: 10px;
    color: white;
    font-family: monospace;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.copy {
    border: 0;
    border-radius: 10px;
    padding: 0 15px;
    color: white;
    background: #282831;
    font-weight: 900;
    cursor: pointer;
}

.message {
    margin-top: 13px;
    min-height: 18px;
    text-align: center;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.4;
}

.message.error {
    color: #ff5555;
}

.message.success {
    color: var(--green);
}

.footer {
    text-align: center;
    color: #5e5e68;
    font-size: 10px;
    margin-top: 25px;
}

.loading {
    display: inline-block;
    width: 13px;
    height: 13px;
    border: 2px solid rgba(255,255,255,.2);
    border-top-color: white;
    border-radius: 50%;
    animation: spin .7s linear infinite;
    vertical-align: -2px;
    margin-right: 5px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@keyframes pop {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media(max-width:430px) {
    .container {
        padding-top: 25px;
    }

    .card {
        padding: 17px;
    }

    .step {
        padding: 12px;
    }

    .step-button {
        padding: 9px 10px;
        font-size: 11px;
    }
}
</style>
</head>

<body>

<div class="container">

    <div class="logo">
        KYAMI<span>MODZ</span>
    </div>

    <div class="subtitle">
        🔐 KEY SYSTEM • V4
    </div>

    <!-- BLOQUEADOR -->
    <div class="card">

        <div class="card-title">
            🔒 Verificación requerida
        </div>

        <div class="card-description">
            Completa los dos pasos y después pulsa
            <b>Comprobar</b> para desbloquear la generación de tu Key.
        </div>

        <!-- WHATSAPP -->
        <div class="step" id="whatsappStep">

            <div class="icon">📱</div>

            <div class="step-info">
                <div class="step-name">
                    Canal de WhatsApp
                </div>

                <div class="step-status" id="whatsappStatus">
                    🔴 NO COMPLETADO
                </div>
            </div>

            <button
                class="step-button"
                id="whatsappButton"
                onclick="openWhatsApp()">
                ABRIR
            </button>

        </div>

        <!-- YOUTUBE -->
        <div class="step" id="youtubeStep">

            <div class="icon">▶️</div>

            <div class="step-info">
                <div class="step-name">
                    Canal de YouTube
                </div>

                <div class="step-status" id="youtubeStatus">
                    🔴 NO COMPLETADO
                </div>
            </div>

            <button
                class="step-button"
                id="youtubeButton"
                onclick="openYouTube()">
                ABRIR
            </button>

        </div>

        <button
            class="check-button"
            id="checkButton"
            onclick="checkSteps()">
            🔎 COMPROBAR
        </button>

        <div
            class="message"
            id="message">
            Abre los dos enlaces y después pulsa Comprobar.
        </div>

    </div>

    <!-- GENERADOR -->
    <div class="card">

        <div class="card-title">
            🔑 Generador de Key
        </div>

        <div class="card-description">
            El botón se desbloqueará cuando el servidor registre
            los dos pasos.
        </div>

        <button
            class="generate-button"
            id="generateButton"
            disabled
            onclick="generateKey()">
            🔒 GENERAR KEY BLOQUEADO
        </button>

        <div
            class="result"
            id="result">

            <div class="result-title">
                ✅ KEY GENERADA
            </div>

            <div class="key-box">

                <div
                    class="key"
                    id="keyValue">
                </div>

                <button
                    class="copy"
                    onclick="copyKey()">
                    COPIAR
                </button>

            </div>

        </div>

    </div>

    <div class="footer">
        KYAMI MODZ • Sistema de Keys
    </div>

</div>

<script>
const WHATSAPP_URL =
    "https://whatsapp.com/channel/0029Vb7HbHUJ93wRQ6TZSE0g";

const YOUTUBE_URL =
    "https://youtube.com/@kyami-modz90";

let gateId = null;

let state = {
    whatsapp: false,
    youtube: false
};

// ======================================
// INICIAR SESIÓN
// ======================================

async function startGate() {

    try {

        const response =
            await fetch("/api/gate/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({})
            });

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.error || "No se pudo iniciar."
            );
        }

        gateId = data.gateId;

    } catch (error) {

        showMessage(
            "No se pudo conectar con el servidor.",
            true
        );

        console.error(error);
    }
}

// ======================================
// ABRIR WHATSAPP
// ======================================

function openWhatsApp() {

    if (!gateId) {
        showMessage(
            "Espera a que conecte con el servidor.",
            true
        );
        return;
    }

    window.open(
        WHATSAPP_URL,
        "_blank",
        "noopener,noreferrer"
    );

    // Registramos que el usuario abrió el paso.
    registerStep("whatsapp");
}

// ======================================
// ABRIR YOUTUBE
// ======================================

function openYouTube() {

    if (!gateId) {
        showMessage(
            "Espera a que conecte con el servidor.",
            true
        );
        return;
    }

    window.open(
        YOUTUBE_URL,
        "_blank",
        "noopener,noreferrer"
    );

    // Registramos que el usuario abrió el paso.
    registerStep("youtube");
}

// ======================================
// REGISTRAR PASO
// ======================================

async function registerStep(type) {

    const endpoint =
        type === "whatsapp"
            ? "/api/gate/whatsapp"
            : "/api/gate/youtube";

    try {

        const response =
            await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    gateId
                })
            });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.error || "Error registrando paso."
            );
        }

        state.whatsapp = !!data.whatsapp;
        state.youtube = !!data.youtube;

        updateUI();

        showMessage(
            "Paso registrado. Pulsa COMPROBAR cuando termines.",
            false
        );

    } catch (error) {

        showMessage(
            error.message,
            true
        );

        console.error(error);
    }
}

// ======================================
// COMPROBAR
// ======================================

async function checkSteps() {

    if (!gateId) {
        showMessage(
            "La sesión todavía no está lista.",
            true
        );
        return;
    }

    const button =
        document.getElementById("checkButton");

    button.disabled = true;
    button.innerHTML =
        '<span class="loading"></span>COMPROBANDO...';

    try {

        const response =
            await fetch(
                "/api/gate/status/" +
                encodeURIComponent(gateId)
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.error || "No se pudo comprobar."
            );
        }

        state.whatsapp = !!data.whatsapp;
        state.youtube = !!data.youtube;

        updateUI();

        if (data.unlocked) {

            showMessage(
                "✅ Los dos pasos están completos. Ya puedes generar tu Key.",
                false
            );

        } else {

            const missing = [];

            if (!state.whatsapp)
                missing.push("WhatsApp");

            if (!state.youtube)
                missing.push("YouTube");

            showMessage(
                "Falta completar: " + missing.join(" y ") + ".",
                true
            );
        }

    } catch (error) {

        showMessage(
            error.message,
            true
        );

    } finally {

        button.disabled = false;
        button.textContent = "🔎 COMPROBAR";
    }
}

// ======================================
// ACTUALIZAR INTERFAZ
// ======================================

function updateUI() {

    const whatsappStep =
        document.getElementById("whatsappStep");

    const youtubeStep =
        document.getElementById("youtubeStep");

    const whatsappStatus =
        document.getElementById("whatsappStatus");

    const youtubeStatus =
        document.getElementById("youtubeStatus");

    const whatsappButton =
        document.getElementById("whatsappButton");

    const youtubeButton =
        document.getElementById("youtubeButton");

    const generateButton =
        document.getElementById("generateButton");

    // WhatsApp

    if (state.whatsapp) {

        whatsappStep.classList.add("done");

        whatsappStatus.textContent =
            "🟢 COMPLETADO";

        whatsappButton.textContent =
            "✓ LISTO";

    } else {

        whatsappStep.classList.remove("done");

        whatsappStatus.textContent =
            "🔴 NO COMPLETADO";

        whatsappButton.textContent =
            "ABRIR";
    }

    // YouTube

    if (state.youtube) {

        youtubeStep.classList.add("done");

        youtubeStatus.textContent =
            "🟢 COMPLETADO";

        youtubeButton.textContent =
            "✓ LISTO";

    } else {

        youtubeStep.classList.remove("done");

        youtubeStatus.textContent =
            "🔴 NO COMPLETADO";

        youtubeButton.textContent =
            "ABRIR";
    }

    // Generador

    const unlocked =
        state.whatsapp &&
        state.youtube;

    generateButton.disabled =
        !unlocked;

    if (unlocked) {

        generateButton.textContent =
            "🔑 GENERAR KEY";

    } else {

        generateButton.textContent =
            "🔒 GENERAR KEY BLOQUEADO";
    }
}

// ======================================
// GENERAR KEY
// ======================================

async function generateKey() {

    if (!state.whatsapp || !state.youtube) {

        showMessage(
            "Completa los dos pasos primero.",
            true
        );

        return;
    }

    const button =
        document.getElementById("generateButton");

    button.disabled = true;

    button.innerHTML =
        '<span class="loading"></span>GENERANDO...';

    try {

        const response =
            await fetch("/api/public/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    gateId
                })
            });

        const data =
            await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.error || "No se pudo generar la Key."
            );
        }

        document.getElementById("keyValue")
            .textContent = data.key;

        document.getElementById("result")
            .classList.add("show");

        showMessage(
            "🎉 Tu Key fue generada correctamente.",
            false
        );

        button.textContent =
            "✅ KEY GENERADA";

    } catch (error) {

        showMessage(
            error.message,
            true
        );

        button.disabled = false;
        button.textContent =
            "🔑 GENERAR KEY";
    }
}

// ======================================
// COPIAR KEY
// ======================================

async function copyKey() {

    const key =
        document.getElementById("keyValue")
            .textContent;

    if (!key) return;

    try {

        await navigator.clipboard.writeText(key);

        showMessage(
            "📋 Key copiada al portapapeles.",
            false
        );

    } catch {

        showMessage(
            "No se pudo copiar automáticamente.",
            true
        );
    }
}

// ======================================
// MENSAJES
// ======================================

function showMessage(text, error) {

    const element =
        document.getElementById("message");

    element.textContent = text;

    element.classList.toggle(
        "error",
        !!error
    );

    element.classList.toggle(
        "success",
        !error
    );
}

// ======================================
// INICIO
// ======================================

startGate();
updateUI();
</script>

</body>
</html>
