import { z } from "zod";

// model TenderPublish {
//     id               String   @id @default(auto()) @map("_id") @db.ObjectId
//     title            String
//     description      String
//     publishAuthority String
//     startdate        DateTime
//     enddate          DateTime
//     documentUrl      String
//     documentKey      String
//     createdAt        DateTime @default(now())
//     updatedAt        DateTime @updatedAt
//   }
export const uploadtenderForm = z.object({
  title: z.string(),
  description: z.string(),
  publishAuthority: z.string(),
  startdate: z.date({
    required_error: "A date of birth is required.",
  }),
  enddate: z.date({
    required_error: "A date of birth is required.",
  }),
  documentUrl: z.union([z.instanceof(File), z.string()]).optional(),
});

export type uploadtenderFormType = z.infer<typeof uploadtenderForm>;
