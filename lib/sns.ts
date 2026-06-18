import { SNSClient } from "@aws-sdk/client-sns";

export const snsClient = new SNSClient({
  region: process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy-key",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy-secret",
  },
});
