import jwt, { SignOptions } from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required. Please check your .env file.");
  }
  return secret;
}

export interface JwtPayload {
  userId: string;
  role: string;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, getJwtSecret(), options);
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

