import express from "express";
import cors from "cors";
import session from "express-session";
import memoryStore from "memorystore";
import { sessionMiddleware } from "./middlewares/sessionMiddleware";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import { config } from "./config";
import { DatabaseProvider } from "./database";
import bodyParser from "body-parser";

DatabaseProvider.configure({
  region: process.env.AWS_REGION || "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  ssl: !!process.env.USE_SSL,
});

const connection = DatabaseProvider.getConnection();
if (!connection) {
  throw new Error("Could not connect to database");
}
console.log("Connected to database");

const app = express();
const MemoryStore = memoryStore(session);

app.use(express.static(__dirname + "/public/"));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));
app.enable("trust proxy");
app.set('trust proxy', 1);
app.use(sessionMiddleware(session, MemoryStore, config));

/**
 * If the words "metadata statements" mean anything to you, you'll want to enable this route. It
 * contains an example of a more complex deployment of SimpleWebAuthn with support enabled for the
 * FIDO Metadata Service. This enables greater control over the types of authenticators that can
 * interact with the Rely Party (a.k.a. "RP", a.k.a. "this server").
 */
if (config.ENABLE_CONFORMANCE) {
  import("./fido-conformance").then(
    ({ fidoRouteSuffix, fidoConformanceRouter }) => {
      app.use(fidoRouteSuffix, fidoConformanceRouter);
    }
  );
}

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

export default app;
