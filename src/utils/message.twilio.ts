import { get } from "lodash";

const accountSid = "";
const authToken = "";
const serviceId = "";
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
