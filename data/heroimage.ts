import { allheroImage } from "@/action/heroimage";

export const herosectionImage = async () => {
  try {
    const image = await allheroImage();
    return image;
  } catch (error) {
    console.log(error);
  }
};
