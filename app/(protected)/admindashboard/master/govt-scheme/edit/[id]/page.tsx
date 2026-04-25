import SchemeUploadForm from "@/components/form/SchemeUploadForm";
import React from "react";

const editpage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <div>
      <SchemeUploadForm schemeId={id} />
    </div>
  );
};

export default editpage;
