export const emailConfig = {
  // Maximum file size for attachments (5MB)
  maxAttachmentSize: 5 * 1024 * 1024,

  // Allowed file types for attachments
  allowedFileTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
  ],

  // Maximum number of attachments allowed
  maxAttachments: 5,

  // Maximum number of recipients (to + cc + bcc)
  maxRecipients: 10,

  // Email validation regex
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Default email settings
  defaultFrom: process.env.EMAIL_FROM || "onboarding@resend.dev",

  // Rate limiting (emails per hour)
  rateLimit: {
    max: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
};
