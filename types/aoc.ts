import { Prisma } from "@prisma/client";

export type aoctype = Prisma.AOCGetPayload<{
    include:{
        WorksDetail:{
            include: {
                ApprovedActionPlanDetails:true,
                nitDetails:true
            }
        }
    }
}>
