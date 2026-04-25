import React from "react";
import { db } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";

export const Warishdocument = async ({
  warishApplicationId,
}: {
  warishApplicationId: string;
}) => {
  const documents = await db.warishDocument.findMany({
    where: {
      warishId: warishApplicationId,
    },
    include: {
      User: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!documents.length) {
    return <div className="text-gray-500">No documents found</div>;
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div key={doc.id} className="border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{doc.documentType}</h3>
              <a
                href={doc.cloudinaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Document
              </a>
            </div>
            <div className="text-sm text-gray-500">
              <p>Uploaded by: {doc.User?.name || "Unknown"}</p>
              <p>{formatDistanceToNow(doc.createdAt, { addSuffix: true })}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
