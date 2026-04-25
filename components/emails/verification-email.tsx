// components/emails/verification-email.tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
} from "@react-email/components";

interface VerificationEmailProps {
  confirmLink: string;
}

export const VerificationEmail = ({ confirmLink }: VerificationEmailProps) => {
  return (
    <Html>
      <Head>
        <Preview>Confirm your email address</Preview>
        <title>Email Verification</title>
      </Head>

      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Verify Your Email</Heading>

          <Text style={paragraph}>
            Please click the button below to confirm your email address and
            activate your account.
          </Text>

          <Button href={confirmLink} style={button}>
            Confirm Email
          </Button>

          <Text style={paragraph}>
            If you didn&apos;t request this, please ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Style constants
const body = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,.1)",
};

const heading = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#32325d",
  padding: "0 40px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.4",
  color: "#525f7f",
  padding: "0 40px",
};

const button = {
  backgroundColor: "#007bff",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "200px",
  padding: "12px",
  margin: "20px auto",
};
