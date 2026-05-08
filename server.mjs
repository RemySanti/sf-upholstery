import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function json(res, status, data) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.writeHead(status).end(JSON.stringify(data));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function handleAiChat(req, res) {
  try {
    const body = await readJsonBody(req);
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return json(res, 200, {
        message:
          "AI backend is running, but OPENAI_API_KEY is not set. Add your key to environment variables to enable live model responses.",
        source: "local-server",
      });
    }

    const systemPrompt = `You are Milan's AI assistant.
You help users:
- book services
- understand branding
- learn about projects
- answer questions
- guide visitors toward conversion
Tone: Luxury, cinematic, intelligent, minimal.`;

    const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.6,
      }),
    });

    if (!openAiRes.ok) {
      const errText = await openAiRes.text();
      return json(res, 502, {
        message: "OpenAI request failed.",
        error: errText.slice(0, 600),
      });
    }

    const data = await openAiRes.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    return json(res, 200, {
      message:
        content ||
        "I am online and ready. Ask about services, strategy, or booking.",
      source: "openai",
    });
  } catch (err) {
    return json(res, 500, {
      message: "AI route error.",
      error: String(err?.message || err),
    });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/ai-chat") {
      return handleAiChat(req, res);
    }

    let urlPath = req.url.split("?")[0];
    if (urlPath === "/" || urlPath === "") urlPath = "/index.html";
    const filePath = path.normalize(path.join(__dirname, decodeURIComponent(urlPath)));
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    res.writeHead(200).end(data);
  } catch {
    res.writeHead(404).end("Not found");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`San Francisco Upholstery Group — local preview:`);
  console.log(`  http://localhost:${PORT}/`);
  console.log(`  http://localhost:${PORT}/index.html`);
});
