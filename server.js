const express = require("express");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "cambia-esta-clave";

// =====================================================
// UBICACIÓN DE LA WEB
// Busca public/ o src/public/
// =====================================================

const possiblePublicFolders = [
    path.join(__dirname, "public"),
    path.join(__dirname, "src", "public")
];

const PUBLIC_DIR =
    possiblePublicFolders.find(folder =>
        fs.existsSync(path.join(folder, "index.html"))
    ) || possiblePublicFolders[0];

console.log("======================================");
console.log(" KYAMI MODZ - KEY SYSTEM");
console.log("======================================");
console.log("Public directory:", PUBLIC_DIR);

// Servir archivos de la web
app.use(express.static(PUBLIC_DIR));

// =====================================================
// BASE DE DATOS TEMPORAL
// =====================================================

const keys = new Map();

// =====================================================
// CONFIGURACIÓN
// =====================================================

const KEY_DURATION = 8 * 60 * 60 * 1000; // 8 horas

// =====================================================
// GENERAR KEY
// =====================================================

function generateKey() {

    const part1 = crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

    const part2 = crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

    return `KYAMI-${part1}-${part2}`;
}

// =====================================================
// CREAR KEY
// =====================================================

function createKey() {

    const key = generateKey();

    keys.set(key, {
        activated: false,
        activatedAt: null,
        createdAt: Date.now()
    });

    return key;
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

app.get("/", (req, res) => {

    const indexPath = path.join(PUBLIC_DIR, "index.html");

    if (!fs.existsSync(indexPath)) {

        return res.status(500).send(`
            <h1>KYAMI MODZ</h1>
            <p>No se encontró public/index.html</p>
            <p>Ruta buscada:</p>
            <pre>${indexPath}</pre>
        `);
    }

    res.sendFile(indexPath);
});

// =====================================================
// GENERAR KEY PÚBLICA
// =====================================================

app.post("/api/public/generate", (req, res) => {

    try {

        const key = createKey();

        console.log("Nueva key pública:", key);

        return res.json({
            success: true,
            key: key,
            duration: "8 horas"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: "No se pudo generar la key"
        });
    }
});

// =====================================================
// GENERAR KEY ADMIN
// =====================================================

app.post("/api/admin/generate", (req, res) => {

    const password = String(req.body.password || "");

    if (
        !ADMIN_PASSWORD ||
        password !== ADMIN_PASSWORD
    ) {

        return res.status(401).json({
            success: false,
            error: "Contraseña incorrecta"
        });
    }

    const key = createKey();

    return res.json({
        success: true,
        key: key,
        duration: "8 horas"
    });
});

// =====================================================
// VERIFICAR KEY
// =====================================================

app.post("/api/verify", (req, res) => {

    const key = String(req.body.key || "").trim();

    if (!key) {

        return res.status(400).json({
            valid: false,
            error: "Falta la key"
        });
    }

    const data = keys.get(key);

    // -----------------------------------------------
    // KEY NO EXISTE
    // -----------------------------------------------

    if (!data) {

        return res.status(404).json({
            valid: false,
            error: "Key inválida"
        });
    }

    const now = Date.now();

    // -----------------------------------------------
    // PRIMER USO
    // -----------------------------------------------

    if (!data.activated) {

        data.activated = true;
        data.activatedAt = now;

        keys.set(key, data);

        console.log("Key activada:", key);
    }

    // -----------------------------------------------
    // COMPROBAR EXPIRACIÓN
    // -----------------------------------------------

    const expiresAt =
        data.activatedAt + KEY_DURATION;

    if (now >= expiresAt) {

        keys.delete(key);

        return res.status(403).json({
            valid: false,
            error: "Key expirada"
        });
    }

    // -----------------------------------------------
    // TIEMPO RESTANTE
    // -----------------------------------------------

    const remaining =
        expiresAt - now;

    const remainingSeconds =
        Math.floor(remaining / 1000);

    return res.json({
        valid: true,
        key: key,
        activatedAt: data.activatedAt,
        expiresAt: expiresAt,
        remainingSeconds: remainingSeconds
    });
});

// =====================================================
// INFORMACIÓN DE UNA KEY
// =====================================================

app.post("/api/key/info", (req, res) => {

    const key = String(req.body.key || "").trim();

    const data = keys.get(key);

    if (!data) {

        return res.status(404).json({
            success: false,
            error: "Key no encontrada"
        });
    }

    let expiresAt = null;
    let remainingSeconds = null;

    if (data.activated) {

        expiresAt =
            data.activatedAt + KEY_DURATION;

        remainingSeconds =
            Math.max(
                0,
                Math.floor(
                    (expiresAt - Date.now()) / 1000
                )
            );
    }

    return res.json({
        success: true,
        key: key,
        activated: data.activated,
        createdAt: data.createdAt,
        activatedAt: data.activatedAt,
        expiresAt: expiresAt,
        remainingSeconds: remainingSeconds
    });
});

// =====================================================
// REVOCAR KEY
// =====================================================

app.post("/api/admin/revoke", (req, res) => {

    const password = String(req.body.password || "");
    const key = String(req.body.key || "").trim();

    if (password !== ADMIN_PASSWORD) {

        return res.status(401).json({
            success: false,
            error: "Contraseña incorrecta"
        });
    }

    if (!keys.has(key)) {

        return res.status(404).json({
            success: false,
            error: "Key no encontrada"
        });
    }

    keys.delete(key);

    console.log("Key revocada:", key);

    return res.json({
        success: true,
        message: "Key revocada correctamente"
    });
});

// =====================================================
// ESTADO DEL SERVIDOR
// =====================================================

app.get("/api/status", (req, res) => {

    return res.json({
        online: true,
        system: "KYAMI MODZ",
        keys: keys.size,
        uptime: process.uptime()
    });
});

// =====================================================
// 404
// =====================================================

app.use((req, res) => {

    res.status(404).json({
        error: "Ruta no encontrada"
    });
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, "0.0.0.0", () => {

    console.log("======================================");
    console.log(`Servidor iniciado en puerto ${PORT}`);
    console.log(`Web: http://localhost:${PORT}`);
    console.log("======================================");

});
