'use server';

import { z } from 'zod';
import { db } from "@/lib/db";

// Replicate the same schema for server-side validation
const formSchema = z.object({
  gpname: z.string().min(2, "Name must be at least 2 characters"),
  gpaddress: z.string().min(5, "Address must be at least 5 characters"),
  nameinprodhan: z.string().min(2, "Prodhan name must be at least 2 characters"),
  gpcode: z.string().min(2, "GP code must be at least 2 characters"),
  gpnameinshort: z.string().min(2, "Short name must be at least 2 characters"),
  blockname: z.string().min(2, "Block name must be at least 2 characters"),
  gpshortname: z.string().min(2, "Short name must be at least 2 characters"),
  prodhanMessage: z.string().optional(),
});

export async function saveGPProfile(data: z.infer<typeof formSchema>) {
  try {
    // Server-side validation
    const validatedData = formSchema.parse(data);
    
    // Find existing profile
    const existingProfile = await db.gPProfile.findFirst();

    if (existingProfile) {
      await db.gPProfile.update({
        where: { id: existingProfile.id },
        data: validatedData,
      });
    } else {
      await db.gPProfile.create({
        data: validatedData,
      });
    }
    
    return { 
      success: true, 
      message: 'GP Profile saved successfully!' 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return {
      success: false,
      message: 'Database error: Failed to save GP Profile'
    };
  }
}
