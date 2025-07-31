import { readFile, writeFile, mkdir } from "fs/promises";
import { createServer } from "http";
import crypto from "crypto";
import path from "path";
import { existsSync } from "fs";

const PORT = 3300;
const DATA_DIR = "data";
const DATA_FILE = path.join(DATA_DIR, "links.json");

const serveFile = async (res, filePath, contentType) => {
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 page not found");
  }
};

const loadLinks = async () => {
  try {
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR);
    }

    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeFile(DATA_FILE, JSON.stringify({}));
      return {};
    }
    throw error;
  }
};

const saveLinks = async (links) => {
  await writeFile(DATA_FILE, JSON.stringify(links));
};

const server = createServer(async (req, res) => {
  if (req.method === "GET") {
    if (req.url === "/") {
      return serveFile(res, path.join("public", "index.html"), "text/html");
    } else if (req.url === "/style.css") {
      return serveFile(res, path.join("public", "style.css"), "text/css");
    } else {
      const links = await loadLinks();
      const shortCode = req.url.slice(1);
      const originalUrl = links[shortCode];

      if (originalUrl) {
        res.writeHead(302, { Location: originalUrl });
        return res.end();
      }
    }
  }

  if (req.method === "POST" && req.url === "/shortend") {
    const links = await loadLinks();

    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { url, shortCode } = JSON.parse(body);
        if (!url) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          return res.end("URL is required");
        }

        const finalShortCode =
          shortCode || crypto.randomBytes(4).toString("hex");

        if (links[finalShortCode]) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          return res.end("Short code already exists");
        }

        links[finalShortCode] = url;
        await saveLinks(links);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, shortCode: finalShortCode }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid request");
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
