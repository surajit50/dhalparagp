// components/emails/LoginAttemptAlertEmail.tsx
import {
  Html,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Hr,
  Preview,
  Tailwind,
} from "@react-email/components";

interface LoginAttemptAlertEmailProps {
  userName?: string;
  loginTime: string;
  ipAddress: string;
  location?: string;
  userAgent?: string;
  resetLink?: string;
  supportLink?: string;
  isAccountLocked?: boolean; // Add this to distinguish between a failed attempt and a lockout
}

const baseUrl = process.env.BASE_URL || "https://yourdomain.com";

export const LoginAttemptAlertEmail = ({
  userName = "there",
  loginTime,
  ipAddress,
  location = "Unknown location",
  userAgent = "Unknown device",
  resetLink = `${baseUrl}/auth/reset`,
  supportLink = `${baseUrl}/support`,
  isAccountLocked = false, // Default to false for a standard alert
}: LoginAttemptAlertEmailProps) => {
  const previewText = isAccountLocked
    ? "Your account has been locked due to suspicious activity"
    : `New login attempt to your account from ${location} – was this you?`;

  const headingText = isAccountLocked
    ? "🚨 Account Locked"
    : "🔐 Suspicious Login Attempt";

  const mainText = isAccountLocked
    ? "Your account has been temporarily locked after multiple failed login attempts. To protect your account, we require you to secure it."
    : "We noticed a login attempt to your account from a device or location we haven't seen before. If this was you, you can safely ignore this email. If not, please secure your account immediately.";

  return (
    <Html>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans p-4">
          <Container className="max-w-lg mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
            <Section className="p-6">
              <Heading className="text-2xl font-bold text-center text-gray-800">
                {headingText}
              </Heading>
              <Text className="text-gray-600 text-center mt-2">
                Hi {userName},
              </Text>
              <Text className="text-gray-600 mt-4">{mainText}</Text>

              <Section className="bg-gray-50 rounded-md p-4 my-6 border border-gray-200">
                <Text className="text-sm text-gray-700 m-0">
                  <strong>Time:</strong> {loginTime}
                </Text>
                <Text className="text-sm text-gray-700 m-0 mt-2">
                  <strong>IP Address:</strong> {ipAddress}
                </Text>
                {location && (
                  <Text className="text-sm text-gray-700 m-0 mt-2">
                    <strong>Location:</strong> {location}
                  </Text>
                )}
                {userAgent && (
                  <Text className="text-sm text-gray-700 m-0 mt-2">
                    <strong>Device/Browser:</strong> {userAgent}
                  </Text>
                )}
              </Section>

              <Button
                href={resetLink}
                className="bg-orange-600 text-white rounded-md px-6 py-3 text-center font-semibold w-full block"
              >
                Secure My Account
              </Button>

              <Text className="text-gray-500 text-sm mt-6 text-center">
                If you didn&apos;t attempt to log in, your password may be
                compromised. We recommend changing it immediately and enabling
                two-factor authentication.
              </Text>

              <Hr className="my-6 border-gray-200" />

              <Text className="text-gray-400 text-xs text-center">
                Need help?{" "}
                <a href={supportLink} className="text-orange-600 underline">
                  Contact support
                </a>
                .<br />
                This is an automated message, please do not reply.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default LoginAttemptAlertEmail;
