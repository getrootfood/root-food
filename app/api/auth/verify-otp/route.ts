import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const { phoneNumber, otp } = await request.json();

  if (!phoneNumber || !otp) {
    return NextResponse.json(
      { error: "Phone number and OTP are required." },
      { status: 400 }
    );
  }

  const otpRecord = await db.otp.findFirst({
    where: {
      phoneNumber,
      otp,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otpRecord) {
    return NextResponse.json(
      { error: "Invalid or expired OTP." },
      { status: 400 }
    );
  }

  let user = await db.user.findUnique({
    where: { phoneNumber },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        phoneNumber,
      },
    });
  }

  await db.otp.deleteMany({
    where: {
      phoneNumber,
      otp,
    },
  });

  try {
    const sessionToken = await createSession(user.id);
    return NextResponse.json(
      { message: "Authenticated successfully.", sessionToken },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session." },
      { status: 500 }
    );
  }
}
