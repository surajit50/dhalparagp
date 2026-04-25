import { z } from "zod";

export const measurementSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  nos: z.number().min(0),
  length: z.number().min(0),
  breadth: z.number().min(0),
  depth: z.number().min(0),
  quantity: z.number(),
});

export const subItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0),
  unit: z.string().min(1, "Unit is required"),
  rate: z.number().min(0),
  amount: z.number(),
});

export const estimateItemSchema = z.object({
  schedulePageNo: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  nos: z.string().default("1"),
  length: z.string().default("0"),
  breadth: z.string().default("0"),
  depth: z.string().default("0"),
  quantity: z.string().default("0"),
  unit: z.string().min(1, "Unit is required"),
  rate: z.string().default("0"),
  measurements: z.array(measurementSchema).default([]),
  subItems: z.array(subItemSchema).default([]),
  lengthParamKey: z.string().optional(),
  breadthParamKey: z.string().optional(),
  depthParamKey: z.string().optional(),
  compactionFactor: z.string().optional(),
});

export type EstimateItemFormValues = z.infer<typeof estimateItemSchema>;
