import http from "http";
import https from "https";
import fs from "fs";
import app from "./app";
import { config } from "./config";
import "reflect-metadata";

const { ENABLE_HTTPS, RP_ID } = config;

let expectedOrigin: string[];

if (ENABLE_HTTPS) {
  const host = "0.0.0.0";
  const port = 443;
  expectedOrigin = [`https://${RP_ID}`];

  https
    .createServer(
      {
        key: fs.readFileSync(`./${RP_ID}.key`),
        cert: fs.readFileSync(`./${RP_ID}.crt`),
      },
      app
    )
    .listen(port, host, () => {
      console.log(`🚀 Server ready at ${expectedOrigin} (${host}:${port})`);
    });
} else {
  const host = "127.0.0.1";
  const port = 8000;
  expectedOrigin = [`http://localhost:${port}`, `http://localhost:3000`];

  http.createServer(app).listen(port, host, () => {
    console.log(`🚀 Server ready at ${expectedOrigin} (${host}:${port})`);
  });
}
