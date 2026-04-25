import React from "react";
import { MBPrintMetadata } from "./types";

interface CoverPageProps {
  metadata: MBPrintMetadata;
}

export const CoverPage: React.FC<CoverPageProps> = ({ metadata }) => {
  return (
    <div className="page-container">
      <div className="page-border" style={{ position: "relative", backgroundColor: "#fff", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        
        <div style={{ position: "absolute", top: "20px", right: "20px", fontWeight: "bold", fontSize: "12px" }}>
          Page 1
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: "40px" }}>
          
          <div style={{ textAlign: "center", width: "85%", margin: "0 auto", border: "2px solid #000", padding: "20px", borderRadius: "2px", marginBottom: "40px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: "900", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px 0", fontFamily: "serif" }}>
              Measurement Book
            </h1>
            <div style={{ width: "60px", height: "2px", backgroundColor: "#000", margin: "10px auto" }}></div>
            <h2 style={{ fontSize: "15px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", margin: "0" }}>
              No. 3 Dhalpara Gram Panchayat
            </h2>
          </div>

          <div style={{ fontSize: "14px", fontWeight: "bold", display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: "60px", width: "100%" }}>
            <span style={{ marginRight: "10px", letterSpacing: "1px" }}>MB NO. :</span>
            <span style={{ borderBottom: "1.5px dashed #000", width: "150px", textAlign: "center", paddingBottom: "2px", fontSize: "16px" }}>
              {metadata.mbNumber || "\u00A0"}
            </span>
          </div>

          <div style={{ width: "85%", margin: "0 auto", textAlign: "justify", fontSize: "12px", lineHeight: "2", fontWeight: "bold", fontFamily: "serif" }}>
            <p style={{ textIndent: "40px", margin: 0 }}>
              This is to certify that this Measurement Book contains pages from <strong style={{ fontSize: "13px" }}>01</strong> to <strong style={{ fontSize: "13px" }}>25</strong> and
              is issued to the <strong>Nirman Sahayak</strong> of No.- 3 Dhalpara Gram Panchayat
              on <span style={{ display: "inline-block", width: "160px", borderBottom: "1.5px dotted #000", position: "relative", top: "4px" }} /> .
            </p>
          </div>
        </div>

        <div style={{ marginTop: "auto", paddingTop: "50px", display: "flex", flexDirection: "column", alignItems: "flex-end", paddingRight: "20px" }}>
          <div style={{ textAlign: "center", width: "180px" }}>
            <div style={{ borderTop: "1.5px solid #000", paddingTop: "5px", fontSize: "12px", fontWeight: "bold", letterSpacing: "1px" }}>
              Prodhan
            </div>
            <div style={{ fontSize: "10px", fontWeight: "bold", marginTop: "2px", textTransform: "uppercase", letterSpacing: "1px" }}>
              No.- 3 Dhalpara<br/>Gram Panchayat
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
