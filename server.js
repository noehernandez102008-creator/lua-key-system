const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Guardamos las keys en memoria.
// IMPORTANTE: si Render reinicia el servicio, estas keys se perderán.
const keys = new Map();

function generateKey() {
  const part1 = crypto.randomBytes(4).toString("hex").toUpperCase();
  const part2 = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `KYAMI-${part1}-${part2}`;
}

// Generar key pública
app.post("/api/public/generate", (req, res) => {
  const key = generateKey();

  keys.set(key, {
    activated: false,
    activatedAt: null,
    createdAt: Date.now()
  });

  res.json({
    success: true,
    key
  });
});

// Generar key desde administración
app.post("/api/admin/generate", (req, res) => {
  if (!ADMIN_PASSWORD || req.body.password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      error: "Contraseña incorrecta"
    });
  }

  const key = generateKey();

  keys.set(key, {
    activated: false,
    activatedAt: null,
    createdAt: Date.now()
  });

  res.json({
    success: true,
    key
  });
});

// Verificar key
app.post("/api/verify", (req, res) => {
  const key = String(req.body.key || "").trim();

  if (!key) {
    return res.status(400).json({
      valid: false,
      error: "Falta la key"
    });
  }

  const data = keys.get(key);

  if (!data) {
    return res.status(404).json({
      valid: false,
      error: "Key inválida"
    });
  }

  const now = Date.now();

  // La cuenta de 8 horas comienza al primer uso.
  if (!data.activated) {
    data.activated = true;
    data.activatedAt = now;
  }

  const expiresAt = data.activatedAt + (8 * 60 * 60 * 1000);

  if (now >= expiresAt) {
    keys.delete(key);

    return res.status(403).json({
      valid: false,
      error: "Key expirada"
    });
  }

  const remainingMs = expiresAt - now;
  const remainingHours = remainingMs / (60 * 60 * 1000);

  res.json({
    valid: true,
    message: "Key válida",
    expiresAt,
    remainingHours
  });
});

// Estado de una key
app.get("/api/key/:key", (req, res) => {
  const key = req.params.key;
  const data = keys.get(key);

  if (!data) {
    return res.status(404).json({
      success: false,
      error: "Key no encontrada"
    });
  }

  let expiresAt = null;

  if (data.activated) {
    expiresAt = data.activatedAt + (8 * 60 * 60 * 1000);
  }

  res.json({
    success: true,
    activated: data.activated,
    activatedAt: data.activatedAt,
    expiresAt
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(PORT, () => {
  console.log(`KYAMI Key System funcionando en puerto ${PORT}`);
});
