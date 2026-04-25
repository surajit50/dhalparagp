import { NextRequest, NextResponse } from "next/server";
import { generateMBBook } from "@/utils/generateMBBook";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // pdfme returns Uint8Array
    const pdfUint8 = await generateMBBook(data);

    // Convert to Buffer (IMPORTANT)
    const pdfBuffer = Buffer.from(pdfUint8);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="measurement-book.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("MB Generate Error:", error);
    return NextResponse.json(
      { error: "Failed to generate MB" },
      { status: 500 }
    );
  }
}
       