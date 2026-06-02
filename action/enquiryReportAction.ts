"use server";


import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function saveEnquiryReport(data: {
  warishApplicationId?: string;
  personName?: string;
  fatherName?: string;
  villageName?: string;
  postOffice?: string;
  reportType?: string;
  memoNo: string;
  memoDate: Date;
  refMemoNo: string;
  refMemoDate: Date;
  bdoTitle: string;
  blockName: string;
  district: string;
  policeStation: string;
  gramPanchayat: string;
  docsDetails: any;
}) {
  const user = await currentUser();
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  if (data.warishApplicationId) {
    // Upsert linked to WarishApplication
    return await db.enquiryReport.upsert({
      where: {
        warishApplicationId: data.warishApplicationId,
      },
      update: {
        personName: data.personName,
        fatherName: data.fatherName,
        villageName: data.villageName,
        postOffice: data.postOffice,
        reportType: data.reportType || "combined",
        memoNo: data.memoNo,
        memoDate: data.memoDate,
        refMemoNo: data.refMemoNo,
        refMemoDate: data.refMemoDate,
        bdoTitle: data.bdoTitle,
        blockName: data.blockName,
        district: data.district,
        policeStation: data.policeStation,
        gramPanchayat: data.gramPanchayat,
        docsDetails: data.docsDetails,
      },
      create: {
        warishApplicationId: data.warishApplicationId,
        personName: data.personName,
        fatherName: data.fatherName,
        villageName: data.villageName,
        postOffice: data.postOffice,
        reportType: data.reportType || "combined",
        memoNo: data.memoNo,
        memoDate: data.memoDate,
        refMemoNo: data.refMemoNo,
        refMemoDate: data.refMemoDate,
        bdoTitle: data.bdoTitle,
        blockName: data.blockName,
        district: data.district,
        policeStation: data.policeStation,
        gramPanchayat: data.gramPanchayat,
        docsDetails: data.docsDetails,
      },
    });
  } else {
    // Create new standalone report
    return await db.enquiryReport.create({
      data: {
        personName: data.personName,
        fatherName: data.fatherName,
        villageName: data.villageName,
        postOffice: data.postOffice,
        reportType: data.reportType || "residence",
        memoNo: data.memoNo,
        memoDate: data.memoDate,
        refMemoNo: data.refMemoNo,
        refMemoDate: data.refMemoDate,
        bdoTitle: data.bdoTitle,
        blockName: data.blockName,
        district: data.district,
        policeStation: data.policeStation,
        gramPanchayat: data.gramPanchayat,
        docsDetails: data.docsDetails,
      }
    });
  }
}

export async function getEnquiryReport(warishApplicationId: string) {
  const user = await currentUser();
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  const report = await db.enquiryReport.findUnique({
    where: {
      warishApplicationId,
    },
  });

  return report;
}

export async function getEnquiryReportById(id: string) {
  const user = await currentUser();
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  const report = await db.enquiryReport.findUnique({
    where: { id },
  });

  return report;
}

export async function getAllSavedEnquiryReports() {
  const user = await currentUser();
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  const reports = await db.enquiryReport.findMany({
    include: {
      warishApplication: {
        select: {
          acknowlegment: true,
          applicantName: true,
          nameOfDeceased: true,
          warishRefNo: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return reports;
}
