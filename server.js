const express = require("express");
const crypto = require("crypto");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "cambia-esta-clave";

// ================================
// CONFIGURACIÓN
// ================================

const WHATSAPP_CHANNEL =
  "https://whatsapp.com/channel/0029Vb7HbHUJ93wRQ6TZSE0g";

const YOUTUBE_CHANNEL =
  "https://youtube.com/@kyami-modz90";

// ================================
// ARCHIVOS PÚBLICOS
// ================================

// Render puede ejecutar el proyecto desde diferentes rutas.
// Usamos la carpeta public del proyecto.
const publicDir = path.join(__dirname, "public");

app.use(express.static(publicDir));

// Página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// ================================
// MEMORIA
// ================================

const keys = new Map();
const gates = new Map();

// ================================
// GENERADOR DE KEY
// ================================

function generateKey() {
  const part1 = crypto.randomBytes(4).toString("hex").toUpperCase();
  const part2 = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `KYAMI-${part1}-${part2}`;
}

// ================================
// ID DE GATE
// ================================

function generateGateId() {
  return crypto.randomBytes(24).toString("hex");
}

// ================================
// CREAR GATE
// ================================

app.post("/api/gate/start", (req, res) => {
  const gateId = generateGateId();

  gates.set(gateId, {
    whatsapp: false,
    youtube: false,
    createdAt: Date.now()
  });

  res.json({
    success: true,
    gateId,
    links: {
      whatsapp: WHATSAPP_CHANNEL,
      youtube: YOUTUBE_CHANNEL
    }
  });
});

// ================================
// COMPLETAR WHATSAPP
// ================================

app.post("/api/gate/whatsapp", (req, res) => {
  const { gateId } = req.body;

  const gate = gates.get(gateId);

  if (!gate) {
    return res.status(404).json({
      success: false,
      error: "Sesión de bloqueo inválida"
    });
  }

  gate.whatsapp = true;

  res.json({
    success: true,
    whatsapp: true,
    youtube: gate.youtube,
    unlocked: gate.whatsapp && gate.youtube
  });
});

// ================================
// COMPLETAR YOUTUBE
// ================================

app.post("/api/gate/youtube", (req, res) => {
  const { gateId } = req.body;

  const gate = gates.get(gateId);

  if (!gate) {
    return res.status(404).json({
      success: false,
      error: "Sesión de bloqueo inválida"
    });
  }

  gate.youtube = true;

  res.json({
    success: true,
    whatsapp: gate.whatsapp,
    youtube: true,
    unlocked: gate.whatsapp && gate.youtube
  });
});

// ================================
// ESTADO DEL BLOQUEO
// ================================

app.get("/api/gate/status/:gateId", (req, res) => {
  const gate = gates.get(req.params.gateId);

  if (!gate) {
    return res.status(404).json({
      success: false,
      error: "Sesión no encontrada"
    });
  }

  res.json({
    success: true,
    whatsapp: gate.whatsapp,
    youtube: gate.youtube,
    unlocked: gate.whatsapp && gate.youtube
  });
});

// ================================
// GENERAR KEY PÚBLICA
// ================================

app.post("/api/public/generate", (req, res) => {
  const { gateId } = req.body;

  if (!gateId) {
    return res.status(403).json({
      success: false,
      blocked: true,
      error: "Completa los pasos para generar tu key."
    });
  }

  const gate = gates.get(gateId);

  if (!gate) {
    return res.status(403).json({
      success: false,
      blocked: true,
      error: "Sesión de bloqueo inválida."
    });
  }

  // LOS DOS PASOS SON OBLIGATORIOS
  if (!gate.whatsapp || !gate.youtube) {
    return res.status(403).json({
      success: false,
      blocked: true,
      whatsapp: gate.whatsapp,
      youtube: gate.youtube,
      error: "Debes completar los dos pasos antes de generar la key."
    });
  }

  const key = generateKey();

  keys.set(key, {
    activated: false,
    activatedAt: null,
    createdAt: new Date()
  });

  res.json({
    success: true,
    key,
    message: "Key generada correctamente."
  });
});

// ================================
// VERIFICAR KEY
// ================================

app.post("/api/verify", (req, res) => {
  const key = String(req.body.key || "").trim().toUpperCase();

  if (!key) {
    return res.status(400).json({
      valid: false,
      error: "Falta la key."
    });
  }

  const data = keys.get(key);

  if (!data) {
    return res.status(404).json({
      valid: false,
      error: "Key inválida."
    });
  }

  const now = new Date();

  // La cuenta de 8 horas comienza
  // cuando la key se utiliza por primera vez.
  if (!data.activated) {
    data.activated = true;
    data.activatedAt = now;
  }

  const expiresAt =
    new Date(data.activatedAt.getTime() + 8 * 60 * 60 * 1000);

  if (now >= expiresAt) {
    return res.status(403).json({
      valid: false,
      expired: true,
      error: "Esta key ha expirado."
    });
  }

  const remaining =
    expiresAt.getTime() - now.getTime();

  res.json({
    valid: true,
    key,
    activatedAt: data.activatedAt,
    expiresAt,
    remainingMs: remaining,
    remainingSeconds: Math.floor(remaining / 1000)
  });
});

// ================================
// ADMIN: GENERAR KEY
// ================================

app.post("/api/admin/generate", (req, res) => {
  const password = String(req.body.password || "");

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      error: "Contraseña incorrecta."
    });
  }

  const key = generateKey();

  keys.set(key, {
    activated: false,
    activatedAt: null,
    createdAt: new Date()
  });

  res.json({
    success: true,
    key
  });
});

// ================================
// ADMIN: LISTAR KEYS
// ================================

app.post("/api/admin/keys", (req, res) => {
  const password = String(req.body.password || "");

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      error: "Contraseña incorrecta."
    });
  }

  const result = [];

  for (const [key, data] of keys.entries()) {
    result.push({
      key,
      activated: data.activated,
      activatedAt: data.activatedAt,
      createdAt: data.createdAt
    });
  }

  res.json({
    success: true,
    count: result.length,
    keys: result
  });
});

// ================================
// ELIMINAR KEYS EXPIRADAS
// ================================

setInterval(() => {
  const now = Date.now();

  for (const [key, data] of keys.entries()) {
    if (
      data.activated &&
      data.activatedAt &&
      now - data.activatedAt.getTime() >= 8 * 60 * 60 * 1000
    ) {
      keys.delete(key);
    }
  }

  // Limpiar sesiones de gate antiguas
  for (const [gateId, gate] of gates.entries()) {
    if (now - gate.createdAt > 30 * 60 * 1000) {
      gates.delete(gateId);
    }
  }
}, 60 * 1000);

// ================================
// ERRORES
// ================================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    error: "Error interno del servidor."
  });
});

// ================================
// INICIAR SERVIDOR
// ================================

app.listen(PORT, "0.0.0.0", () => {
  console.log("======================================");
  console.log("      KYAMI MODZ KEY SYSTEM");
  console.log("======================================");
  console.log(`Servidor iniciado en puerto ${PORT}`);
  console.log(`WhatsApp: ${WHATSAPP_CHANNEL}`);
  console.log(`YouTube: ${YOUTUBE_CHANNEL}`);
  console.log("======================================");
});
