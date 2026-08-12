-- Ejemplo genérico usando LuaSocket.
-- Instala LuaSocket y cambia API_URL por la dirección pública de tu servidor.

local http = require("socket.http")
local ltn12 = require("ltn12")
local json = require("dkjson")

local API_URL = "http://localhost:3000/api/verify"

local function verify_key(key)
    local response = {}

    local body = json.encode({ key = key })

    local _, code = http.request{
        url = API_URL,
        method = "POST",
        headers = {
            ["Content-Type"] = "application/json",
            ["Content-Length"] = tostring(#body)
        },
        source = ltn12.source.string(body),
        sink = ltn12.sink.table(response)
    }

    local raw = table.concat(response)
    local data = json.decode(raw)

    if code == 200 and data and data.valid then
        print("Key válida.")
        print("Segundos restantes: " .. tostring(data.remainingSeconds))
        return true, data
    end

    print("Key inválida: " .. tostring(data and data.error or "Error de conexión"))
    return false, data
end

io.write("Introduce tu key: ")
local key = io.read("*l")

local ok = verify_key(key)

if not ok then
    os.exit(1)
end

-- TU SCRIPT VA DESPUÉS DE ESTA COMPROBACIÓN.
print("Acceso concedido.")
