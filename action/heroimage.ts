"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";

export const addheroImage = async (
  description: string,
  imagekey: string,
  imageUrl: string
) => {
  try {
    const image = await db.heroSectionImage.create({
      data: {
        heroImageDescription: description,
        imageKey: imagekey,
        imageUrl,
      },
    });
    revalidateTag("dashboard/addheroimage", 'max');
    return { success: "image upload sucessfully" };
  } catch (error) {
    return { error: "fail to upload" };
  }
};

export const allheroImage = async () => {
  try {
    const image = await db.heroSectionImage.findMany();
    return image;
  } catch (error) {
    console.log(error);
  }
};

export const deleteheroImage = async (imageKey: string) => {
  try {
  
    await db.heroSectionImage.findUnique({
      where: {
        imageKey,
      },
    });
    revalidateTag("dashboard/addheroimage", 'max');
    return { success: "Delete Suceffuly" };
  } catch (error) {
    console.log(error);
  }
};

export const deleteheorImages = async (formdata: FormData) => {
  const imageKey = formdata.get("imageKey") as string;
  if (imageKey === "") {
    return { error: "somthing went wrong" };
  }

  try {
   
    await db.heroSectionImage.delete({
      where: {
        imageKey,
      },
    });
    revalidateTag("dashboard/addheroimage", 'max');
    return { success: "Delete Suceffuly" };
  } catch (error) {
    console.log(error);
  }
};
