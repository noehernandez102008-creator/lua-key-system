const express = require("express");
const Database = require("better-sqlite3");
const crypto = require("crypto");
const path = require("path");

const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/app.js", (req, res) => {
  res.sendFile(path.join(__dirname, "app.js"));
});

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, "style.css"));
});

const PORT = Number(process.env.PORT || 3000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-this-password";
const KEY_HOURS = Number(process.env.KEY_HOURS || 8);
const DB_FILE = process.env.DATABASE_FILE || "./keys.db";

if (ADMIN_PASSWORD === "change-this-password") {
  console.warn("WARNING: Set ADMIN_PASSWORD before deploying this server.");
}

const db = new Database(DB_FILE);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  activated_at INTEGER,
  expires_at INTEGER,
  revoked INTEGER NOT NULL DEFAULT 0
);
`);

function makeKey() {
  return crypto.randomBytes(18).toString("base64url").toUpperCase();
}

function admin(req, res, next) {
  const supplied = req.get("x-admin-password");
  if (!supplied || !crypto.timingSafeEqual(
    Buffer.from(supplied),
    Buffer.from(ADMIN_PASSWORD)
  )) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  next();
}

app.post("/api/admin/generate", admin, (req, res) => {
  let key;
  do {
    key = makeKey();
  } while (db.prepare("SELECT 1 FROM keys WHERE key=?").get(key));

  const now = Math.floor(Date.now() / 1000);
  db.prepare(`
    INSERT INTO keys (key, created_at)
    VALUES (?, ?)
  `).run(key, now);

  res.json({ ok: true, key, hours: KEY_HOURS });
});

app.get("/api/admin/keys", admin, (req, res) => {
  const rows = db.prepare(`
    SELECT id, key, created_at, activated_at, expires_at, revoked
    FROM keys
    ORDER BY id DESC
  `).all();

  res.json({ ok: true, keys: rows, keyHours: KEY_HOURS });
});

app.post("/api/admin/revoke", admin, (req, res) => {
  const { key } = req.body || {};
  if (typeof key !== "string" || !key) {
    return res.status(400).json({ ok: false, error: "Key required" });
  }

  const result = db.prepare("UPDATE keys SET revoked=1 WHERE key=?").run(key);
  if (!result.changes) {
    return res.status(404).json({ ok: false, error: "Key not found" });
  }

  res.json({ ok: true });
});

app.post("/api/verify", (req, res) => {
  const { key } = req.body || {};

  if (typeof key !== "string" || key.length < 10) {
    return res.status(400).json({ ok: false, valid: false, error: "Invalid key format" });
  }

  const row = db.prepare("SELECT * FROM keys WHERE key=?").get(key);
  if (!row) {
    return res.status(404).json({ ok: false, valid: false, error: "Key not found" });
  }

  if (row.revoked) {
    return res.status(403).json({ ok: false, valid: false, error: "Key revoked" });
  }

  const now = Math.floor(Date.now() / 1000);

  if (!row.activated_at) {
    const expires = now + KEY_HOURS * 60 * 60;
    db.prepare(`
      UPDATE keys
      SET activated_at=?, expires_at=?
      WHERE id=? AND activated_at IS NULL
    `).run(now, expires, row.id);

    return res.json({
      ok: true,
      valid: true,
      activated: true,
      expiresAt: expires,
      remainingSeconds: KEY_HOURS * 60 * 60
    });
  }

  if (now >= row.expires_at) {
    return res.status(403).json({
      ok: false,
      valid: false,
      error: "Key expired",
      expiresAt: row.expires_at
    });
  }

  res.json({
    ok: true,
    valid: true,
    activated: false,
    expiresAt: row.expires_at,
    remainingSeconds: row.expires_at - now
  });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Key server running on http://localhost:${PORT}`);
});
