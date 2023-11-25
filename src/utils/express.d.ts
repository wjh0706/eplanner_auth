import { Session } from "express-session";

declare module "express-session" {
  interface SessionData {
    jwt?: string;
  }
}

declare global {
    namespace Express {
      interface Request {
        currentUser?: UserPayload;
      }
    }
  }