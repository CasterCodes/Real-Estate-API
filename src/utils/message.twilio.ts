import { get } from "lodash";

const accountSid = "AC3c83d7ca977b32d217e83d45ed9ce147";
const authToken = "bcceb8abfa077b23bb506ba7f536a7a8";
const serviceId = "VA712bc949e8f7cbc74e511d1cacbf8e95";
const client = require("twilio")(accountSid, authToken);

export const sendConfirmPhoneNumber = async (to: string) => {
  try {
    return await client.verify
      .services(serviceId)
      .verifications.create({ to: to, channel: "sms" });
  } catch (error) {
    return get(error, "message");
  }
};

export const confirmPhoneNumberCode = async (to: string, code: string) => {
  return client.verify
    .services(serviceId)
    .verificationChecks.create({ to: to, code: code });
};
