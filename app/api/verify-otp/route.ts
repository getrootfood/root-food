import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { phoneNumber, otp } = await req.json();

  const otpRecord = await prisma.otp.findFirst({
    where: {
      phoneNumber,
    },
  });

  if (otpRecord) {
    await prisma.otp.delete({
      where: {
        id: otpRecord.id,
      },
    });

    if (new Date(otpRecord.expiresAt).getTime() < new Date().getTime()) {
      return NextResponse.json(
        { success: false, message: "Expired OTP" },
        { status: 401 }
      );
    } else if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { success: false, messge: "Invalid OTP" },
        { status: 401 }
      );
    } else {
      let user = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (!user) {
        user = await prisma.user.create({
          data: { phoneNumber },
        });
        return NextResponse.json({
          success: true,
          user,
          messge: "New User Created",
        });
      }

      return NextResponse.json({
        success: true,
        user,
        messge: "Existing User Login",
      });
    }
  } else {
    return NextResponse.json(
      { error: "Please Genrate OTP first" },
      { status: 401 }
    );
  }
}
