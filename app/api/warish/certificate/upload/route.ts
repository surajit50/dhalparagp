import { NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/app/lib/cloudinary'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { fileName, fileType, base64, warishId, digitallySigned } = await req.json()

    if (!fileName || !fileType || !base64 || !warishId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const { url, public_id } = await uploadToCloudinary(base64, 'warish_certificates')

    await db.warishDocument.create({
      data: {
        warishId,
        documentType: 'WarishCertificate',
        cloudinaryUrl: url,
        cloudinaryPublicId: public_id,
        verified: true,
        digitallySigned: digitallySigned || false,
      },
    })

    if (digitallySigned) {
      await db.warishApplication.update({
        where: { id: warishId },
        data: { digitallySigned: true },
      })
    }

    return NextResponse.json({ success: true, url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

