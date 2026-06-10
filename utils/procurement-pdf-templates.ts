import { Template } from "@pdfme/common";

export const niqTemplate: Template = {
  basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] as [number, number, number, number] },
  schemas: [
    [
      {
        name: "gpName",
        type: "text",
        position: { x: 20, y: 20 },
        width: 170,
        height: 10,
        alignment: "center",
        fontSize: 16,
        fontWeight: "bold",
      },
      {
        name: "gpAddress",
        type: "text",
        position: { x: 20, y: 30 },
        width: 170,
        height: 10,
        alignment: "center",
        fontSize: 10,
      },
      {
        name: "nitNo",
        type: "text",
        position: { x: 20, y: 50 },
        width: 80,
        height: 10,
        fontSize: 10,
      },
      {
        name: "nitDate",
        type: "text",
        position: { x: 130, y: 50 },
        width: 60,
        height: 10,
        alignment: "right",
        fontSize: 10,
      },
      {
        name: "title",
        type: "text",
        position: { x: 20, y: 70 },
        width: 170,
        height: 10,
        alignment: "center",
        fontSize: 12,
        fontWeight: "bold",
      },
      {
        name: "body",
        type: "text",
        position: { x: 20, y: 90 },
        width: 170,
        height: 100,
        fontSize: 10,
      },
      {
        name: "qrCode",
        type: "qrcode",
        position: { x: 20, y: 240 },
        width: 30,
        height: 30,
      },
      {
        name: "signature",
        type: "text",
        position: { x: 130, y: 240 },
        width: 60,
        height: 20,
        alignment: "center",
        fontSize: 10,
      }
    ]
  ]
};
