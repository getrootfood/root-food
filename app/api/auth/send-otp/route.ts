import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addMinutes } from "date-fns";

export async function POST(request: NextRequest) {
  const { phoneNumber } = await request.json();

  if (!phoneNumber) {
    return NextResponse.json(
      { error: "Phone number is required." },
      { status: 400 }
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = addMinutes(new Date(), 10);

  const existingOtp = await db.otp.findFirst({
    where: {
      phoneNumber,
    },
  });

  if (existingOtp) {
    await db.otp.delete({
      where: {
        id: existingOtp.id,
      },
    });
  }
  await db.otp.create({
    data: {
      phoneNumber,
      otp,
      expiresAt,
    },
  });

  try {
    return NextResponse.json(
      { message: "OTP sent successfully.", otp },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP." }, { status: 500 });
  }
}
