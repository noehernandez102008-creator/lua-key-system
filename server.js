const express = require("express");
const crypto = require("crypto");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "cambia-esta-clave";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir la página pública
app.use(express.static(path.join(__dirname, "public")));

// Guardamos las keys en memoria.
// IMPORTANTE: en Render se pierden si el servicio se reinicia.
const keys = new Map();

// Generador de keys
function generateKey() {
  const part1 = crypto.randomBytes(4).toString("hex").toUpperCase();
  const part2 = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `KYAMI-${part1}-${part2}`;
}

// Generar Key pública
app.post("/api/public/generate", (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error generando key:", error);

    res.status(500).json({
      success: false,
      error: "No se pudo generar la key"
    });
  }
});

// Generar Key desde administración
app.post("/api/generate", (req, res) => {
  const password = String(req.body?.password || "");

  if (password !== ADMIN_PASSWORD) {
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

// Comprobar Key
app.post("/api/verify", (req, res) => {
  const key = String(req.body?.key || "").trim();

  if (!key) {
    return res.status(400).json({
      valid: false,
      error: "Introduce una key"
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

  // Las 8 horas empiezan cuando la key se usa por primera vez
  if (!data.activated) {
    data.activated = true;
    data.activatedAt = now;
  }

  const expiresAt = data.activatedAt + (8 * 60 * 60 * 1000);
  const remaining = expiresAt - now;

  if (remaining <= 0) {
    keys.delete(key);

    return res.status(410).json({
      valid: false,
      expired: true,
      error: "La key ha expirado"
    });
  }

  res.json({
    valid: true,
    expired: false,
    key,
    activated: data.activated,
    activatedAt: data.activatedAt,
    expiresAt,
    remainingMs: remaining,
    remainingHours: remaining / (60 * 60 * 1000)
  });
});

// Estado del servidor
app.get("/api/status", (req, res) => {
  res.json({
    online: true,
    service: "KYAMI MODZ KEY SYSTEM",
    keys: keys.size
  });
});

// Cualquier otra ruta devuelve el index
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Arrancar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log("======================================");
  console.log("       KYAMI MODZ KEY SYSTEM");
  console.log("======================================");
  console.log(`Servidor iniciado en el puerto ${PORT}`);
  console.log("API pública: /api/public/generate");
  console.log("API verificar: /api/verify");
  console.log("======================================");
});
