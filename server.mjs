import http from "node:http";
import worker from "./worker.mjs";

const port = Number(process.env.PORT || 3000);

const context = {
  waitUntil(promise) {
    Promise.resolve(promise).catch(console.error);
  },
  passThroughOnException() {},
};

http.createServer(async (req, res) => {
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);

    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        headers.set(name, Array.isArray(value) ? value.join(", ") : value);
      }
    }

    const options = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      options.body = Buffer.concat(chunks);
    }

    const request = new Request(
      new URL(req.url || "/", `http://${req.headers.host || "localhost"}`),
      options,
    );

    const response = await worker.fetch(
      request,
      { ...process.env },
      context,
    );

    res.writeHead(
      response.status,
      Object.fromEntries(response.headers.entries()),
    );
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`ScanBIM MCP listening on port ${port}`);
});
