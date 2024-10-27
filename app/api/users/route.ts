import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionInfo } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const { user, session } = await getSessionInfo(req, {
      getUserDetails: true,
    });

    if (!session || !user) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const users = await db.user.findMany({
      include: {
        userDetails: true,
      },
    });

    return NextResponse.json({ users, session, user });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch users", error },
      { status: 500 }
    );
  }
}
