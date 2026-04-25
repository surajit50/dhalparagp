import { Resend } from "resend";
import AuthenticatedTemp from "@/components/emails/user-authenticate";
import AwardNotificationEmail from "@/components/emails/AwardNotificationEmail";
import WorkOrderConfirmation from "@/components/emails/work-order-confirmation";
import StartWorkNoticeEmail from "@/components/emails/StartWorkNoticeEmail";
import WarishAssignNotification from "@/components/emails/warish-assign-notification";
import { VerificationEmail } from "@/components/emails/verification-email";
import { LoginAttemptAlertEmail } from "@/components/emails/LoginAttemptAlertEmail"; // new import

const resend = new Resend(process.env.RESEND_API_KEY);
const ROOT_URL = process.env.HOST_NAME_ROOT;

import { toast } from "@/components/ui/use-toast";

export interface EmailData {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  content: string;
  attachments?: File[];
}

export const sendEmail = async (emailData: EmailData) => {
  try {
    // Create FormData to handle file attachments
    const formData = new FormData();
    formData.append("to", emailData.to);
    if (emailData.cc) formData.append("cc", emailData.cc);
    if (emailData.bcc) formData.append("bcc", emailData.bcc);
    formData.append("subject", emailData.subject);
    formData.append("content", emailData.content);

    // Append attachments if any
    if (emailData.attachments && emailData.attachments.length > 0) {
      emailData.attachments.forEach((file, index) => {
        formData.append(`attachment${index}`, file);
      });
    }

    // Replace this with your actual API endpoint
    const response = await fetch("/api/email/send", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    const data = await response.json();

    toast({
      title: "Success",
      description: "Email sent successfully",
    });

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    toast({
      title: "Error",
      description: "Failed to send email. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

// Helper function to validate email addresses
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to format email addresses for display
export const formatEmailAddress = (email: string): string => {
  const [username, domain] = email.split("@");
  return `${username}@${domain}`;
};

// Helper function to check if an email is valid and return error message if not
export const validateEmailWithMessage = (email: string): string | null => {
  if (!email) return null;
  if (!validateEmail(email)) {
    return "Please enter a valid email address";
  }
  return null;
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLinkAddress = `${ROOT_URL}/auth/new-verify?token=${token}`;

  await resend.emails.send({
    from: "dhalparagp <noreply@dhalparagp.in>",
    to: email,
    subject: "Confirm your email address",
    react: VerificationEmail({ confirmLink: confirmLinkAddress }),
  });
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  try {
    if (!ROOT_URL) {
      throw new Error("ROOT_URL environment variable is not defined");
    }

    const resetLink = `${ROOT_URL}/auth/new-password?token=${encodeURIComponent(
      token,
    )}`;
    const expirationTime = "1 hour";

    const emailData = {
      from: "dhalparagp <noreply@dhalparagp.in>",
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>We received a password reset request for your account.</p>
        <p>This link will expire in ${expirationTime}:</p>
        <p><a href="${resetLink}" style="font-weight: bold;">Reset Password</a></p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      text: `Password Reset Link (valid for ${expirationTime}):\n${resetLink}`,
    };

    console.log("Attempting to send password reset email to:", email);
    const response = await resend.emails.send(emailData);
    console.log("Password reset email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
    throw new Error("Failed to send password reset email");
  }
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: "dhalparagp <noreply@dhalparagp.in>",
    to: email,
    subject: "2FA Code",
    react: <AuthenticatedTemp validationCode={token} />,
  });
};

export const sentAwardedNotification = async (
  email: string,
  nitNumber: number,
  nitDate: Date,
  workslno: number,
  biddername: string,
) => {
  await resend.emails.send({
    from: "dhalparagp <noreply@dhalparagp.in>",
    to: email,
    subject: "Work order Issued Confirmation",
    react: (
      <AwardNotificationEmail
        nitNumber={nitNumber}
        nitDate={nitDate}
        workslno={workslno}
        biddername={biddername}
      />
    ),
  });
};

export const sentWorkOrderConfirmation = async (
  email: string,
  agencyName: string,
  workOrderNumber: string,
  workOrderDate: string,
  nitNumber: string,
  workDescription: string,
  estimatedAmount: string,
  completionPeriod: string,
) => {
  await resend.emails.send({
    from: "dhalparagp <noreply@dhalparagp.in>",
    to: email,
    subject: "Work order Issued Confirmation",
    react: (
      <WorkOrderConfirmation
        agencyName={agencyName}
        workOrderNumber={workOrderNumber}
        workOrderDate={workOrderDate}
        nitNumber={nitNumber}
        workDescription={workDescription}
        estimatedAmount={estimatedAmount}
        completionPeriod={completionPeriod}
      />
    ),
  });
};

export const sentStartWorkNoticeEmail = async (
  email: string,
  agencyName: string,
  workOrderNumber: string,
  workDescription: string,
  startDate: string,
  completionDate: string,
) => {
  await resend.emails.send({
    from: "dhalparagp <noreply@dhalparagp.in>",
    to: email,
    subject: "Start Work Notice",
    react: (
      <StartWorkNoticeEmail
        agencyName={agencyName}
        workOrderNumber={workOrderNumber}
        workDescription={workDescription}
        startDate={startDate}
        completionDate={completionDate}
      />
    ),
  });
};

export const sentWarishAssignNotification = async (
  email: string,
  staffName: string,
  ackonolegementNo: string,
  assignDate: Date,
) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    console.log("Sending email with Resend...");
    const response = await resend.emails.send({
      from: "dhalparagp <noreply@dhalparagp.in>",
      to: email,
      subject: "Warish Assign Notification",
      react: (
        <WarishAssignNotification
          staffName={staffName}
          ackonolegementNo={ackonolegementNo}
          assignDate={assignDate}
        />
      ),
    });

    console.log("Resend API response:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// NEW: Send login attempt alert email when account gets locked
export const sendLoginAttemptAlertEmail = async (
  email: string,
  userName: string,
  ipAddress: string,
  loginTime: Date,
  location: string,
  userAgent: string | undefined,
  isAccountLocked: boolean, // Add this parameter
) => {
  try {
    const formattedTime = loginTime.toLocaleString();
    const subject = isAccountLocked
      ? "🚨 Security Alert: Your Account Has Been Locked"
      : "Suspicious Login Attempt Detected";

    await resend.emails.send({
      from: "dhalparagp <admin@dhalparagp.in>",
      to: email,
      subject: subject,
      react: LoginAttemptAlertEmail({
        userName,
        loginTime: formattedTime,
        ipAddress,
        location,
        userAgent,
        isAccountLocked, // Pass this to the template
        resetLink: `${ROOT_URL}/auth/reset?email=${email}`,
        supportLink: `${ROOT_URL}/support`,
      }),
    });
  } catch (error) {
    console.error("Failed to send login alert email:", error);
    // Optional: Add more robust error handling here
  }
};
