# Sistema de Keys para Lua — 8 horas

## Requisitos

- Node.js 18+
- Lua + LuaSocket
- dkjson para el ejemplo Lua

## 1. Instalar servidor

```bash
npm install
```

Copia `.env.example` como `.env` y cambia `ADMIN_PASSWORD`.

También puedes exportar las variables directamente en el entorno. El ejemplo incluido usa valores por defecto.

## 2. Arrancar

```bash
npm start
```

Abre:

http://localhost:3000

## 3. Generar una key

Introduce la contraseña de administrador y pulsa "Generar key".

La key NO empieza a contar las 8 horas al generarse. Empieza a contar cuando se verifica por primera vez.

## 4. Lua

Instala LuaSocket y dkjson, y cambia:

`API_URL = "http://localhost:3000/api/verify"`

por la URL pública HTTPS de tu servidor.

## Importante para producción

- Usa HTTPS.
- Cambia ADMIN_PASSWORD por una contraseña fuerte.
- No pongas la contraseña de administrador dentro del Lua.
- El servidor es quien decide la hora de expiración.
- El endpoint `/api/verify` es público por diseño.
- Añade rate limiting/CAPTCHA si esperas abuso.
- Si alojas el servidor en Internet, usa un proxy HTTPS como Nginx/Caddy o el HTTPS de tu plataforma.
