import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { NoticeSchema } from '@/schema';
import { db } from '@/lib/db';



export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Parse form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const department = formData.get('department') as string;
    const type = formData.get('type') as string;
    const reference = formData.get('reference') as string;
    const filesData = formData.get('files') as string;

    // Validate notice data
    const noticeData = NoticeSchema.parse({
      title,
      description,
      department,
      type,
      reference,
    });

    // Check for existing notice with same reference
    const existingNotice = await db.notice.findUnique({
      where: { reference },
    });

    if (existingNotice) {
      return NextResponse.json(
        { success: false, error: "A notice with this reference number already exists" },
        { status: 400 }
      );
    }

    // Create notice
    const notice = await db.notice.create({
      data: {
        ...noticeData,
        files: {
          create: [],
        },
      },
    });

    // Handle file uploads if any
    if (filesData) {
      try {
        const files = JSON.parse(filesData);
        const uploadPromises = files.map(async (file: any) => {
          const uploadResult = await uploadToCloudinary(file);
          if (!uploadResult.success) {
            throw new Error(uploadResult.error);
          }
          return uploadResult.data;
        });

        const uploadedFiles = await Promise.all(uploadPromises);

        // Update notice with file information
        await db.notice.update({
          where: { id: notice.id },
          data: {
            files: {
              create: uploadedFiles.map(file => ({
                name: file.name,
                type: file.type,
                url: file.url,
                public_id: file.public_id,
              })),
            },
          },
        });
      } catch (error) {
        // If file upload fails, delete the notice
        await db.notice.delete({
          where: { id: notice.id },
        });
        throw error;
      }
    }

    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    console.error('Error creating notice:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create notice" 
      },
      { status: 500 }
    );
  }
} 