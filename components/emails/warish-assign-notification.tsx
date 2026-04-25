import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WarishAssignNotificationProps {
  staffName: string;
  ackonolegementNo: string;
  assignDate: Date;
}

export const WarishAssignNotification = ({
  staffName,
  ackonolegementNo,
  assignDate,
}: WarishAssignNotificationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Warish Assignment Notification</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Heading style={h1}>Warish Assignment Notification</Heading>
            <Text style={text}>Dear {staffName},</Text>
            <Text style={text}>
              You have been assigned a warish with acknowledgement number:{" "}
              <strong>{ackonolegementNo}</strong>
            </Text>
            <Text style={text}>
              Assignment Date: {assignDate.toLocaleDateString()}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const section = {
  padding: "0 48px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "16px 0",
};

const text = {
  color: "#1a1a1a",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "16px 0",
};

export default WarishAssignNotification;
