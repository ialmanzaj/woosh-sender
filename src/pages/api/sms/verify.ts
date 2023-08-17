// import type { NextApiRequest, NextApiResponse } from "next";
// import twilio from "twilio";
// import { env } from "~/env.mjs";

// export default function sendMessage(req: NextApiRequest, res: NextApiResponse) {
//   const accountSid = env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID;
//   const token = env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN;
//   const verifySid = "VA0119e70fd4af9ec3b0a8bc4903868f4d";
//   const client = twilio(accountSid, token);
//   const { phone } = req.body;

//   client.verify.v2
//     .services(verifySid)
//     .verifications.create({ to: "+523111095816", channel: "sms" })
//     .then((verification) => console.log(verification.status))
//     .then(() => {
//       const readline = require("readline").createInterface({
//         input: process.stdin,
//         output: process.stdout,
//       });
//       readline.question("Please enter the OTP:", (otpCode) => {
//         client.verify.v2
//           .services(verifySid)
//           .verificationChecks.create({ to: "+523111095816", code: otpCode })
//           .then((verification_check) => console.log(verification_check.status))
//           .then(() => readline.close());
//       });
//     })
//     .catch((error) => {
//       console.log(error);
//       res.json({
//         success: false,
//       });
//     });
// }
