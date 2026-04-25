import React from "react";

interface BlankPageProps {
  pageNo: number;
}

export const BlankPage: React.FC<BlankPageProps> = ({ pageNo }) => {
  return (
    <div className="page-container" key={`blank-${pageNo}`}>
      <div
        className="page-border"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <div className="page-number">Page {pageNo}</div>
      </div>
    </div>
  );
};
