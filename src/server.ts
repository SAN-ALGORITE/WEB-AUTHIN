import http from "http";
import https from "https";
import fs from "fs";
import app from "./app";
import { config } from "./config";
import "reflect-metadata";

const { ENABLE_HTTPS, RP_ID } = config;

let expectedOrigin: string[];

if (ENABLE_HTTPS) {
  const port = 8000;
  const host = "127.0.0.1";
  expectedOrigin = [`http://localhost:${port}`, process.env.BASE_URL as string];

  https
    .createServer(
      {
        key: fs.readFileSync("/home/ubuntu/CERT/nginx-selfsigned.key"),
        cert: fs.readFileSync("/home/ubuntu/CERT/nginx-selfsigned.crt"),
      },
      app
    )
    .listen(port, () => {
      console.log(`🚀 Server ready at ${expectedOrigin} (${host}:${port})`);
    });
} else {
  const host = "127.0.0.1";
  const port = 8000;
  expectedOrigin = [`http://localhost:${port}`, process.env.BASE_URL as string];

  http.createServer(app).listen(port, () => {
    console.log(`🚀 Server ready at ${expectedOrigin} (${host}:${port})`);
  });
}
