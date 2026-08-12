const express = require("express");
const crypto = require("crypto");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================================================
// CONFIGURACIÓN
// ======================================================

const WHATSAPP_URL =
  "https://whatsapp.com/channel/0029Vb7HbHUJ93wRQ6TZSE0g";

const YOUTUBE_URL =
  "https://youtube.com/@kyami-modz90?si=XotEIvlfTQvGOSz1";

// ======================================================
// DATOS EN MEMORIA
// ======================================================

const sessions = new Map();
const keys = new Map();

// ======================================================
// FUNCIONES
// ======================================================

function randomId(bytes = 24) {
  return crypto.randomBytes(bytes).toString("hex");
}

function generateKey() {
  const a = crypto.randomBytes(4).toString("hex").toUpperCase();
  const b = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `KYAMI-${a}-${b}`;
}

function cleanup() {
  const now = Date.now();

  // Sesiones de más de 30 minutos
  for (const [id, session] of sessions) {
    if (now - session.createdAt > 30 * 60 * 1000) {
      sessions.delete(id);
    }
  }

  // Keys expiradas
  for (const [key, data] of keys) {
    if (
      data.expiresAt &&
      now >= data.expiresAt
    ) {
      keys.delete(key);
    }
  }
}

setInterval(cleanup, 60 * 1000);

// ======================================================
// ARCHIVOS DE LA WEB
// ======================================================

const publicDir = path.join(__dirname, "public");

app.use(express.static(publicDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// ======================================================
// INFORMACIÓN PÚBLICA
// ======================================================

app.get("/api/info", (req, res) => {
  res.json({
    success: true,
    whatsapp: WHATSAPP_URL,
    youtube: YOUTUBE_URL
  });
});

// ======================================================
// CREAR SESIÓN
// ======================================================

app.post("/api/session", (req, res) => {
  const sessionId = randomId();

  sessions.set(sessionId, {
    createdAt: Date.now(),
    whatsapp: false,
    youtube: false
  });

  res.json({
    success: true,
    sessionId
  });
});

// ======================================================
// MARCAR WHATSAPP
// ======================================================

app.post("/api/session/whatsapp", (req, res) => {
  const { sessionId } = req.body;

  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: "Sesión inválida o expirada."
    });
  }

  session.whatsapp = true;

  res.json({
    success: true,
    whatsapp: session.whatsapp,
    youtube: session.youtube,
    ready: session.whatsapp && session.youtube
  });
});

// ======================================================
// MARCAR YOUTUBE
// ======================================================

app.post("/api/session/youtube", (req, res) => {
  const { sessionId } = req.body;

  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: "Sesión inválida o expirada."
    });
  }

  session.youtube = true;

  res.json({
    success: true,
    whatsapp: session.whatsapp,
    youtube: session.youtube,
    ready: session.whatsapp && session.youtube
  });
});

// ======================================================
// COMPROBAR ESTADO
// ======================================================

app.get("/api/session/:sessionId", (req, res) => {
  const session =
    sessions.get(req.params.sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: "Sesión inválida o expirada."
    });
  }

  res.json({
    success: true,
    whatsapp: session.whatsapp,
    youtube: session.youtube,
    ready:
      session.whatsapp &&
      session.youtube
  });
});

// ======================================================
// GENERAR KEY
// ======================================================

app.post("/api/key/generate", (req, res) => {
  const { sessionId } = req.body;

  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: "Sesión inválida o expirada."
    });
  }

  // BLOQUEO DEL SERVIDOR
  if (!session.whatsapp || !session.youtube) {
    return res.status(403).json({
      success: false,
      blocked: true,
      error:
        "Debes completar los dos pasos antes de generar la Key.",
      whatsapp: session.whatsapp,
      youtube: session.youtube
    });
  }

  const key = generateKey();

  keys.set(key, {
    createdAt: Date.now(),
    activatedAt: null,
    expiresAt: null
  });

  res.json({
    success: true,
    key
  });
});

// ======================================================
// VERIFICAR KEY
// ======================================================

app.post("/api/key/verify", (req, res) => {
  const key =
    String(req.body?.key || "")
      .trim()
      .toUpperCase();

  if (!key) {
    return res.status(400).json({
      success: false,
      valid: false,
      error: "Introduce una Key."
    });
  }

  const data = keys.get(key);

  if (!data) {
    return res.status(404).json({
      success: false,
      valid: false,
      error: "Key inválida o inexistente."
    });
  }

  const now = Date.now();

  // Las 8 horas comienzan al primer uso
  if (!data.activatedAt) {
    data.activatedAt = now;
    data.expiresAt =
      now + 8 * 60 * 60 * 1000;
  }

  if (now >= data.expiresAt) {
    keys.delete(key);

    return res.status(410).json({
      success: false,
      valid: false,
      expired: true,
      error: "Esta Key ha expirado."
    });
  }

  const remaining =
    data.expiresAt - now;

  res.json({
    success: true,
    valid: true,
    key,
    expiresAt: data.expiresAt,
    remainingMs: remaining
  });
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {
  res.json({
    online: true,
    service: "KYAMI MODZ KEY SYSTEM"
  });
});

// ======================================================
// ERROR 404 PARA API
// ======================================================

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint no encontrado."
  });
});

// ======================================================
// ERROR GENERAL
// ======================================================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    error: "Error interno del servidor."
  });
});

// ======================================================
// INICIAR
// ======================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("====================================");
  console.log("       KYAMI MODZ KEY SYSTEM");
  console.log("====================================");
  console.log(`Servidor: puerto ${PORT}`);
  console.log("Sistema iniciado correctamente");
  console.log("====================================");
});
