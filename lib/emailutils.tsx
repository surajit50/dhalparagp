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

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || "Failed to send email");
    }

    toast({
      title: "Success",
      description: "Email sent successfully",
    });

    return responseData;
  } catch (error) {
    console.error("Error sending email:", error);
    toast({
      title: "Error",
      description:
        error instanceof Error
          ? error.message
          : "Failed to send email. Please try again.",
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
