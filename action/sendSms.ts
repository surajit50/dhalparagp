"use server";

import { PublishCommand } from "@aws-sdk/client-sns";
import { snsClient } from "@/lib/sns";

export async function sendSms(phone: string, message: string) {
  const command = new PublishCommand({
    PhoneNumber: phone,
    Message: message,
  });

  return snsClient.send(command);
}
