import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { log } from "console";
// import { sendOtpViaSms } from "@/lib/otpService"; // Mock service for sending OTPs

export async function POST(req: NextRequest) {
  const { phoneNumber } = await req.json();

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = new Date(
    Date.now() +
      //  5 * 60 * 1000
      15 * 1000
  );

  const data = await prisma.otp.findFirst({
    where: {
      phoneNumber,
    },
  });

  if (data) {
    await prisma.otp.delete({
      where: {
        id: data.id,
      },
    });
  }

  const res = await prisma.otp.create({
    data: {
      phoneNumber,
      otp,
      expiresAt,
    },
  });

  const success = true;

  if (success) {
    return NextResponse.json({ message: "OTP sent", data: res });
  } else {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
