import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";


export const sendOtp = async (phoneNumber: string, otp: string): Promise<{ error: boolean; message: string; otp?: string }> => {
    try {
        const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "authorization": process.env.SMS_API_KEY!,
            },
            body: new URLSearchParams({
                variables_values: otp,
                route: "otp",
                numbers: phoneNumber,
            }).toString(),
        });

        const data = await response.json();

        if (data.return) {
            return { error: false, message: "OTP sent successfully", otp: otp };
        } else {
            throw new Error("Failed to send OTP");
        }
    } catch (error) {
        console.error(error);
        return { error: true, message: "Failed to send OTP" };
    }
};


const sendOTP = httpAction(async (ctx, request) => {

    const { phoneNumber, otp } = await request.json();


    // if (!apiKey) {
    //     return res.status(400).json({ error: true, message: "OTP_IDOOTA_API_KEY is required" });
    // }

    if (!phoneNumber || !otp) {
        return new Response(JSON.stringify({ error: true, message: "Phone number and OTP are required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const response = await sendOtp(phoneNumber, otp);

    return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
});

const http = httpRouter();

http.route({
    path: "/send-otp",
    method: "POST",
    handler: sendOTP,
});

export default http;
