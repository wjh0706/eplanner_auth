import "express-session";
import jwt from "jsonwebtoken";

interface UserPayload {
    id: string;
    email: string;
}

declare module "express-session" {
  interface Session {
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