import { NextResponse } from "next/server";
import { Resend } from "resend";
import { emailConfig } from "../config";
import { storeEmailData } from "@/lib/emailStorage";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

function validateEmail(email: string): boolean {
  return emailConfig.emailRegex.test(email);
}

function validateAttachments(files: File[]): string | null {
  if (files.length > emailConfig.maxAttachments) {
    return `Maximum ${emailConfig.maxAttachments} attachments allowed`;
  }

  for (const file of files) {
    if (file.size > emailConfig.maxAttachmentSize) {
      return `File ${file.name} exceeds maximum size of ${
        emailConfig.maxAttachmentSize / (1024 * 1024)
      }MB`;
    }
    if (!emailConfig.allowedFileTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }
  }

  return null;
}

function validateRecipients(
  to: string,
  cc?: string | null,
  bcc?: string | null
): string | null {
  const recipients = [to];
  if (cc) recipients.push(cc);
  if (bcc) recipients.push(bcc);

  if (recipients.length > emailConfig.maxRecipients) {
    return `Maximum ${emailConfig.maxRecipients} recipients allowed`;
  }

  for (const email of recipients) {
    if (!validateEmail(email)) {
      return `Invalid email address: ${email}`;
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Extract email data from formData
    const to = formData.get("to") as string;
    const cc = formData.get("cc") as string | null;
    const bcc = formData.get("bcc") as string | null;
    const subject = formData.get("subject") as string;
    const content = formData.get("content") as string;

    // Validate recipients
    const recipientError = validateRecipients(to, cc, bcc);
    if (recipientError) {
      return NextResponse.json({ error: recipientError }, { status: 400 });
    }

    // Get and validate attachments
    const attachments: { filename: string; content: Buffer }[] = [];
    const files: File[] = [];

    // Use Array.from instead of for...of
    await Promise.all(
      Array.from(formData.entries()).map(async ([key, value]) => {
        if (key.startsWith("attachment") && value instanceof File) {
          files.push(value);
          const arrayBuffer = await value.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          attachments.push({
            filename: value.name,
            content: buffer,
          });
        }
      })
    );

    const attachmentError = validateAttachments(files);
    if (attachmentError) {
      return NextResponse.json({ error: attachmentError }, { status: 400 });
    }

    // Send email using Resend with properly processed attachments
    const data = await resend.emails.send({
      from: "dhalparagp<admin@dhalparagp.in>",
      to: [to, ...(cc ? [cc] : []), ...(bcc ? [bcc] : [])],
      subject: subject,
      html: content,
      attachments: attachments.map((file) => ({
        filename: file.filename,
        content: file.content,
        contentType: "application/octet-stream",
      })),
    });

    console.log("Email sent successfully", data);

    // Store email data after successful sending
    await storeEmailData(
      {
        to: [to, ...(cc ? [cc] : []), ...(bcc ? [bcc] : [])],
        cc: cc ? [cc] : [],
        bcc: bcc ? [bcc] : [],
        subject,
        content,
        from: "dhalparagp<admin@dhalparagp.in>",
      },
      attachments
    );

    return NextResponse.json(
      { message: "Email sent successfully", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
