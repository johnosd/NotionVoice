const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3456;
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DB_ID = (process.env.NOTION_DB_ID || "").replace(/-/g, "");

if (!NOTION_TOKEN || !NOTION_DB_ID) {
  console.error("\n❌ NOTION_TOKEN e NOTION_DB_ID são obrigatórios.");
  console.error("   Defina as variáveis de ambiente antes de iniciar.\n");
  process.exit(1);
}

function notionRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

const HEADERS = {
  "Authorization": "Bearer " + NOTION_TOKEN,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28"
};

// Busca o nome da propriedade title uma vez ao iniciar
let titleProp = null;

async function detectTitleProp() {
  const res = await notionRequest({
    hostname: "api.notion.com",
    path: "/v1/databases/" + NOTION_DB_ID,
    method: "GET",
    headers: HEADERS
  });
  if (res.status !== 200) throw new Error("Erro ao acessar database: " + JSON.stringify(res.body));
  const props = res.body.properties;
  const found = Object.keys(props).find(k => props[k].type === "title");
  if (!found) throw new Error("Nenhuma propriedade title encontrada no database.");
  return found;
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  if (req.method === "GET" && req.url === "/") {
    serveFile(res, path.join(__dirname, "index.html"), "text/html");
    return;
  }

  if (req.method === "POST" && req.url === "/notion") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      let payload;
      try { payload = JSON.parse(body); } catch {
        res.writeHead(400); res.end(JSON.stringify({ error: "JSON inválido" })); return;
      }

      const { text } = payload;
      if (!text || !text.trim()) {
        res.writeHead(400); res.end(JSON.stringify({ error: "Campo text é obrigatório." })); return;
      }

      try {
        const requestBody = JSON.stringify({
          parent: { database_id: NOTION_DB_ID },
          properties: {
            [titleProp]: { title: [{ text: { content: text.trim() } }] }
          }
        });

        const pageRes = await notionRequest({
          hostname: "api.notion.com",
          path: "/v1/pages",
          method: "POST",
          headers: { ...HEADERS, "Content-Length": Buffer.byteLength(requestBody) }
        }, requestBody);

        res.writeHead(pageRes.status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(pageRes.body));
      } catch (e) {
        res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404); res.end("Not found");
});

// Inicia só depois de detectar a propriedade title
detectTitleProp().then(prop => {
  titleProp = prop;
  console.log(`\nPropriedade title detectada: "${titleProp}"`);
  server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}\n`);
  });
}).catch(err => {
  console.error("\n❌ " + err.message);
  process.exit(1);
});