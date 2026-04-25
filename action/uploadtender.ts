"use server";

import { uploadtenderFormType } from "@/schema/uploadtender-Schema";

export const uploadtendernotice = async(data: uploadtenderFormType) => {
  try {
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};
