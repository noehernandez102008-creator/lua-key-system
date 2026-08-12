const password = () => document.getElementById("adminPassword").value;

function date(ts) {
  return ts ? new Date(ts * 1000).toLocaleString() : "-";
}

async function api(url, options = {}) {
  options.headers = {
    "Content-Type": "application/json",
    "x-admin-password": password(),
    ...(options.headers || {})
  };
  const r = await fetch(url, options);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function loadKeys() {
  const tbody = document.getElementById("keys");
  try {
    const data = await api("/api/admin/keys");
    tbody.innerHTML = data.keys.map(k => {
      const status = k.revoked ? "REVOCADA"
        : !k.activated_at ? "SIN ACTIVAR"
        : Date.now()/1000 >= k.expires_at ? "EXPIRADA"
        : "ACTIVA";
      return `<tr>
        <td><code>${k.key}</code></td>
        <td>${date(k.created_at)}</td>
        <td>${date(k.activated_at)}</td>
        <td>${date(k.expires_at)}</td>
        <td>${status}</td>
        <td>${k.revoked ? "" : `<button onclick="revokeKey('${k.key}')">Revocar</button>`}</td>
      </tr>`;
    }).join("");
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6">${e.message}</td></tr>`;
  }
}

async function revokeKey(key) {
  if (!confirm("¿Revocar esta key?")) return;
  try {
    await api("/api/admin/revoke", {
      method: "POST",
      body: JSON.stringify({ key })
    });
    await loadKeys();
  } catch (e) {
    alert(e.message);
  }
}

document.getElementById("generate").onclick = async () => {
  try {
    const data = await api("/api/admin/generate", { method: "POST" });
    document.getElementById("newKey").textContent = data.key;
    document.getElementById("message").textContent = `Key generada. Caduca ${data.hours} horas después de su primera activación.`;
    await loadKeys();
  } catch (e) {
    document.getElementById("message").textContent = e.message;
  }
};

document.getElementById("refresh").onclick = loadKeys;
