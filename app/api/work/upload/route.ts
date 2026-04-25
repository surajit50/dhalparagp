import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";

interface ExcelRow {
  financialYear: string;
  themeName: string;
  activityCode: string | number;
  activityName: string;
  activityDescription?: string;
  activityFor?: string;
  sector?: string;
  locationofAsset?: string;
  estimatedCost?: string | number;
  totalduration?: string;
  schemeName?: string;
  generalFund?: string | number;
  scFund?: string | number;
  stFund?: string | number;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

    // Track duplicate activity codes
    const duplicateActivityCodes: string[] = [];
    const processedActivityCodes = new Set<string>();

    // First pass: Check for duplicates in the uploaded file
    for (const row of data) {
      const activityCode = row.activityCode.toString();
      if (processedActivityCodes.has(activityCode)) {
        duplicateActivityCodes.push(activityCode);
      }
      processedActivityCodes.add(activityCode);
    }

    if (duplicateActivityCodes.length > 0) {
      return NextResponse.json(
        {
          error: `Duplicate activity codes found in the file: ${duplicateActivityCodes.join(
            ", "
          )}`,
          duplicateCodes: duplicateActivityCodes,
        },
        { status: 400 }
      );
    }

    // Second pass: Check for existing activity codes in database
    const existingActivityCodes = await db.approvedActionPlanDetails.findMany({
      where: {
        activityCode: {
          in: Array.from(processedActivityCodes),
        },
      },
      select: {
        activityCode: true,
      },
    });

    const existingCodes = existingActivityCodes.map(
      (item) => item.activityCode
    );
    if (existingCodes.length > 0) {
      return NextResponse.json(
        {
          error: `Activity codes already exist in database: ${existingCodes.join(
            ", "
          )}`,
          existingCodes: existingCodes,
        },
        { status: 400 }
      );
    }

    // Process each row and insert into database
    for (const row of data) {
      // Validate required fields
      if (
        !row.financialYear ||
        !row.themeName ||
        !row.activityCode ||
        !row.activityName
      ) {
        throw new Error(
          `Missing required fields in row: ${JSON.stringify(row)}`
        );
      }

      // Convert numeric fields
      const activityCode = row.activityCode.toString();
      const estimatedCost = parseInt(row.estimatedCost?.toString() || "0");
      const generalFund = parseInt(row.generalFund?.toString() || "0");
      const scFund = parseInt(row.scFund?.toString() || "0");
      const stFund = parseInt(row.stFund?.toString() || "0");

      await db.approvedActionPlanDetails.create({
        data: {
          financialYear: row.financialYear,
          themeName: row.themeName,
          activityCode: activityCode,
          activityName: row.activityName,
          activityDescription: row.activityDescription || "",
          activityFor: row.activityFor || "",
          sector: row.sector || "",
          locationofAsset: row.locationofAsset || "",
          estimatedCost: estimatedCost,
          totalduration: row.totalduration || "",
          schemeName: row.schemeName || "",
          generalFund: generalFund,
          scFund: scFund,
          stFund: stFund,
          isPublish: false, // Default to false for new uploads
        },
      });
    }

    return NextResponse.json(
      { message: "File processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error processing file",
      },
      { status: 500 }
    );
  }
}
