import * as z from "zod";

export const leaveSchema = z.object({
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
  }),
  leaveType: z
    .string({
      required_error: "Leave type is required.",
    })
    .min(1, "Please select a leave type."),
  reason: z
    .string({
      required_error: "Reason is required.",
    })
    .min(1, "Please provide a reason for your leave."),
});
