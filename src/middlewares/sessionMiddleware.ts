import { RequestHandler } from "express";
import session from "express-session";
import memoryStore from "memorystore";

export const sessionMiddleware = (
  authSession: typeof session,
  MemoryStore: ReturnType<typeof memoryStore>,
  config: { SESSION_SECRET: string }
): RequestHandler => {
  return authSession({
    secret: config.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    proxy: true,
    // proxy: true,
    cookie: {
      maxAge: 86400000,
      secure: true,
      // sameSite: true,
      sameSite: "none",
      httpOnly: true, // Ensure to not expose session cookies to clientside scripts
    },
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
  });
};
