import { db } from "@/lib/db";
import { File, FileText } from "lucide-react";
import React from "react";

const warishdocumentupload = async ({
  applicantid,
}: {
  applicantid: string;
}) => {
  const document = await db.warishDocument.findMany({
    where: {
      warishId: applicantid,
    },
  });
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-blue-700">
        <FileText className="h-6 w-6" />
        4. Upload Document / ডকুমেন্ট আপলোড
      </h2>
      {document.map((document) => (
        <div key={document.id}>
          <p>{document.documentType}</p>

          {/* // link to cloudinary url */}
          {/* // show icon */}
          <a href={document.cloudinaryUrl} target="_blank">
            <File className="h-6 w-6" />
          </a>
        </div>
      ))}
    </div>
  );
};
export default warishdocumentupload;
