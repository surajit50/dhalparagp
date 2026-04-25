'use server';

import { z } from 'zod';

// Replicate the same schema for server-side validation
const formSchema = z.object({
  gpname: z.string().min(2, "Name must be at least 2 characters"),
  gpaddress: z.string().min(5, "Address must be at least 5 characters"),
  nameinprodhan: z.string().min(2, "Prodhan name must be at least 2 characters"),
  gpcode: z.string().min(2, "GP code must be at least 2 characters"),
  gpnameinshort: z.string().min(2, "Short name must be at least 2 characters"),
  blockname: z.string().min(2, "Block name must be at least 2 characters"),
  gpshortname: z.string().min(2, "Short name must be at least 2 characters"),
});

export async function saveGPProfile(data: z.infer<typeof formSchema>) {
  try {
    // Server-side validation
    const validatedData = formSchema.parse(data);
    
    // Database operation simulation (replace with your actual DB call)
    console.log('Saving to database:', validatedData);
    
    // Actual database operation would look like:
    // await db.gpProfile.upsert({ ...validatedData });
    
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
