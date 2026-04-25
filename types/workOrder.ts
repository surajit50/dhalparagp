import { Prisma } from "@prisma/client";

export type WorkOrder = Prisma.workorderdetailsGetPayload<{
  include: {
    awardofcontractdetails: true;
    Bidagency: {
      include: {
        agencydetails: true;
        WorksDetail: {
          include: {
            AwardofContract:{
              include:{
                workorderdetails:{
                  include:{
                    Bidagency:true
                  }
                }
              }
            }
            ApprovedActionPlanDetails: true;
            nitDetails: true;
            
          };
        };
      };
    };
  };
}>;


// const workOrders = await db.workorderdetails.findMany({
//   where: {
//     Bidagency: {
//       WorksDetail: {
//         workStatus: {
//           in: ["workorder", "yettostart"],
//         },
//         tenderStatus: {
//           in: ["AOC"],
//         },
//       },
//     },
//   },
//   include: {
//     awardofcontractdetails: true,
//     Bidagency: {
//       include: {
//         WorksDetail: {
//           include: {
//             AwardofContract: {
//               include: {
//                 workorderdetails: {
//                   include: {
//                     Bidagency: true,
//                   },
//                 },
//               },
//             },
//           },
//         },
//         agencydetails: true,
//       },
//     },
//   },
// });
