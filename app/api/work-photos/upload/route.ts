import { NextRequest, NextResponse } from "next/server";
import { uploadWorkPhoto } from "@/action/work-photo-actions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const { worksDetailId, status, base64Image, fileName, fileType, latitude, longitude } = data;

    if (!worksDetailId || !status || !base64Image) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400, headers: corsHeaders });
    }

    const result = await uploadWorkPhoto({
      worksDetailId,
      status,
      base64Image,
      fileName: fileName || `work_${worksDetailId}_${Date.now()}`,
      fileType: fileType || "image/jpeg",
      latitude,
      longitude
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400, headers: corsHeaders });
    }

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    console.error("API Upload Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
