import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { NextRequest } from "next/server";
import { User } from "@prisma/client";
import { addMinutes } from "date-fns";

const secretKey = process.env.SESSION_SECRET || "local_secret";

if (!secretKey) {
  throw new Error("SESSION_SECRET is not defined in environment variables");
}

const encoder = new TextEncoder();
const encodedKey = encoder.encode(secretKey);

export async function encrypt(payload: {
  sessionId: string;
  userId: number;
  expiresAt: Date;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(
  session: string | undefined = ""
): Promise<{ sessionId: string; userId: number; expiresAt: Date } | undefined> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as { sessionId: string; userId: number; expiresAt: Date };
  } catch (error) {
    console.error("Failed to verify session:", error);
    return undefined;
  }
}

export async function createSession(userId: number): Promise<string> {
  const expiresAt = addMinutes(new Date(), 7 * 24 * 60);

  const sessionId = uuidv4();

  const session = await db.session.create({
    data: {
      sessionToken: sessionId,
      userId,
      expiresAt,
    },
  });

  const encryptedSessionToken = await encrypt({
    sessionId: session.sessionToken,
    userId: session.userId,
    expiresAt: session.expiresAt,
  });

  await db.session.update({
    where: { id: session.id },
    data: { sessionToken: encryptedSessionToken },
  });

  return encryptedSessionToken;
}

export interface SessionPayload {
  sessionId: string;
  userId: number;
  expiresAt: Date;
}

export interface SessionPayload {
  sessionId: string;
  userId: number;
  expiresAt: Date;
}

export interface GetSessionInfoResponse {
  session: SessionPayload | null;
  user?: User | null;
}

export const getSessionInfo = async (
  req: NextRequest,
  { getUserDetails }: { getUserDetails: boolean }
): Promise<GetSessionInfoResponse> => {
  const authorizationHeader = req.headers.get("Authorization");

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return {
      session: null,
      user: null,
    };
  }

  const sessionToken = authorizationHeader.split(" ")[1];
  const session: SessionPayload | undefined = await decrypt(sessionToken);

  if (!session) {
    return {
      session: null,
      user: null,
    };
  }

  if (!getUserDetails) {
    return { session };
  }

  const user: User | null = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      userDetails: true,
    },
  });

  return { session, user };
};
