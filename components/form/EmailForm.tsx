/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useReducer, useCallback, useEffect } from "react";
import { EmailCombobox } from "@/components/EmailCombobox";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  sendEmail,
  type EmailData,
  validateEmailWithMessage,
} from "@/lib/emailutils";

type FormState = {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  content: string;
  attachments: File[];
  isSending: boolean;
  emailSuggestions: string[];
};

type FormAction =
  | {
      type: "SET_FIELD";
      field: keyof Omit<FormState, "isSending" | "emailSuggestions">;
      value: any;
    }
  | { type: "SET_SUGGESTIONS"; suggestions: string[] }
  | { type: "SET_SENDING"; isSending: boolean }
  | { type: "RESET_FORM" };

const initialState: FormState = {
  to: "",
  cc: "",
  bcc: "",
  subject: "",
  content: "",
  attachments: [],
  isSending: false,
  emailSuggestions: [],
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_SUGGESTIONS":
      return { ...state, emailSuggestions: action.suggestions };
    case "SET_SENDING":
      return { ...state, isSending: action.isSending };
    case "RESET_FORM":
      return { ...initialState, emailSuggestions: state.emailSuggestions };
    default:
      return state;
  }
}

const AttachmentItem = React.memo(
  ({
    file,
    index,
    onRemove,
  }: {
    file: File;
    index: number;
    onRemove: (index: number) => void;
  }) => (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
      <div className="flex items-center space-x-2 max-w-[80%]">
        <span className="text-sm truncate">{file.name}</span>
        <span className="text-xs text-gray-500">
          ({(file.size / 1024).toFixed(1)} KB)
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(index)}
        className="h-8 w-8 p-0 hover:bg-red-100"
      >
        <X className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  ),
);

AttachmentItem.displayName = "AttachmentItem";

export const EmailForm = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [errors, setErrors] = React.useState<{
    to?: string;
    cc?: string;
    bcc?: string;
  }>({});

  const handleInputChange = useCallback(
    (field: keyof Omit<FormState, "isSending" | "emailSuggestions">) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: "SET_FIELD", field, value: e.target.value });
        // Clear error when user starts typing
        if (errors[field as keyof typeof errors]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      },
    [errors],
  );

  const handleComboboxChange = useCallback(
    (value: string) => {
      dispatch({ type: "SET_FIELD", field: "to", value });
      // Clear error when user selects an email
      if (errors.to) {
        setErrors((prev) => ({ ...prev, to: undefined }));
      }
    },
    [errors],
  );

  const handleContentChange = useCallback((value: string) => {
    dispatch({ type: "SET_FIELD", field: "content", value });
  }, []);

  const fetchEmailSuggestions = useCallback(async () => {
    try {
      const response = await fetch("/api/email/suggestions");
      if (!response.ok) throw new Error("Failed to fetch email suggestions");
      const data = await response.json();
      dispatch({ type: "SET_SUGGESTIONS", suggestions: data });
    } catch (error) {
      console.error("Error fetching email suggestions:", error);
      toast.error("Failed to load email suggestions");
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: {
      to?: string;
      cc?: string;
      bcc?: string;
    } = {};

    // Validate required 'to' field
    if (!state.to.trim()) {
      newErrors.to = "Recipient email is required";
    } else {
      const toError = validateEmailWithMessage(state.to);
      if (toError) newErrors.to = toError;
    }

    // Validate optional cc field
    if (state.cc.trim()) {
      const ccError = validateEmailWithMessage(state.cc);
      if (ccError) newErrors.cc = ccError;
    }

    // Validate optional bcc field
    if (state.bcc.trim()) {
      const bccError = validateEmailWithMessage(state.bcc);
      if (bccError) newErrors.bcc = bccError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [state.to, state.cc, state.bcc]);

  const handleSendEmail = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before sending");
      return;
    }

    dispatch({ type: "SET_SENDING", isSending: true });
    try {
      const emailData: EmailData = {
        to: state.to.trim(),
        cc: state.cc.trim(),
        bcc: state.bcc.trim(),
        subject: state.subject.trim(),
        content: state.content,
        attachments: state.attachments,
      };
      await sendEmail(emailData);
      dispatch({ type: "RESET_FORM" });
      setErrors({});
      toast.success("Email sent successfully!");
    } catch (error: any) {
      toast.error(`Failed to send email: ${error.message}`);
    } finally {
      dispatch({ type: "SET_SENDING", isSending: false });
    }
  };

  const handleAttachmentRemove = useCallback(
    (index: number) => {
      const newAttachments = [...state.attachments];
      newAttachments.splice(index, 1);
      dispatch({
        type: "SET_FIELD",
        field: "attachments",
        value: newAttachments,
      });
    },
    [state.attachments],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSendEmail();
    },
    [handleSendEmail],
  );

  useEffect(() => {
    fetchEmailSuggestions();
  }, [fetchEmailSuggestions]);

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <div className="space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        {/* Header Section */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-semibold text-gray-800">New Message</h2>
          <p className="text-sm text-gray-500 mt-1">
            Compose your email message
          </p>
        </div>

        <div className="space-y-6">
          {/* Recipients Section */}
          <div className="space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Label
                  htmlFor="to"
                  className="text-sm font-medium text-gray-700 mb-1 block"
                >
                  To <span className="text-red-500">*</span>
                </Label>
                <EmailCombobox
                  value={state.to}
                  onChange={handleComboboxChange}
                  suggestions={state.emailSuggestions}
                  placeholder="Recipient's email"
                />
                {errors.to && (
                  <p className="mt-1 text-sm text-red-600">{errors.to}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="cc"
                    className="text-sm font-medium text-gray-700 mb-1 block"
                  >
                    CC
                  </Label>
                  <Input
                    id="cc"
                    type="email"
                    value={state.cc}
                    onChange={handleInputChange("cc")}
                    placeholder="CC email address"
                    className={`w-full border-gray-300 focus:ring-blue-500 ${
                      errors.cc ? "border-red-500" : ""
                    }`}
                  />
                  {errors.cc && (
                    <p className="mt-1 text-sm text-red-600">{errors.cc}</p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="bcc"
                    className="text-sm font-medium text-gray-700 mb-1 block"
                  >
                    BCC
                  </Label>
                  <Input
                    id="bcc"
                    type="email"
                    value={state.bcc}
                    onChange={handleInputChange("bcc")}
                    placeholder="BCC email address"
                    className={`w-full border-gray-300 focus:ring-blue-500 ${
                      errors.bcc ? "border-red-500" : ""
                    }`}
                  />
                  {errors.bcc && (
                    <p className="mt-1 text-sm text-red-600">{errors.bcc}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Subject Field */}
            <div>
              <Label
                htmlFor="subject"
                className="text-sm font-medium text-gray-700 mb-1 block"
              >
                Subject
              </Label>
              <Input
                id="subject"
                type="text"
                value={state.subject}
                onChange={handleInputChange("subject")}
                placeholder="Email subject"
                className="w-full border-gray-300 focus:ring-blue-500"
              />
            </div>

            {/* Rich Text Editor */}
            <div className="space-y-2">
              <Label
                htmlFor="content"
                className="text-sm font-medium text-gray-700"
              >
                Message
              </Label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <RichTextEditor
                  value={state.content}
                  onChange={handleContentChange}
                />
              </div>
            </div>

            {/* Attachments Section */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <Label
                htmlFor="attachments"
                className="text-sm font-medium text-gray-700"
              >
                Attachments
              </Label>
              <div className="space-y-3">
                {/* File Upload Area */}
                <label
                  htmlFor="attachments"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, XLS, Images (max. 5MB each)
                    </p>
                  </div>
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files);
                        // Validate file size (5MB limit)
                        const validFiles = files.filter(
                          (file) => file.size <= 5 * 1024 * 1024,
                        );
                        if (validFiles.length !== files.length) {
                          toast.error(
                            "Some files were skipped as they exceed 5MB limit",
                          );
                        }
                        dispatch({
                          type: "SET_FIELD",
                          field: "attachments",
                          value: validFiles,
                        });
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {/* Attachment List */}
                {state.attachments.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {state.attachments.map((file, index) => (
                      <AttachmentItem
                        key={index}
                        file={file}
                        index={index}
                        onRemove={handleAttachmentRemove}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            className="px-6"
            onClick={() => {
              dispatch({ type: "RESET_FORM" });
              setErrors({});
            }}
          >
            Discard
          </Button>
          <Button
            type="submit"
            disabled={state.isSending}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {state.isSending ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Sending...</span>
              </div>
            ) : (
              "Send Message"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
