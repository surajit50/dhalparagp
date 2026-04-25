import React from "react";

export const RulesPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-border" style={{ padding: "20px", backgroundColor: "#fff" }}>
        <div style={{ textAlign: "right", fontWeight: "bold", marginBottom: "15px", fontSize: "12px" }}>Page 2</div>
        <h2 style={{ textAlign: "center", fontSize: "14px", fontWeight: "bold", letterSpacing: "1px", borderBottom: "1px solid #000", paddingBottom: "5px", marginBottom: "20px", display: "inline-block", position: "relative", left: "50%", transform: "translateX(-50%)" }}>
          INSTRUCTIONS & RULES
        </h2>
        
        <div style={{ fontSize: "10px", textAlign: "justify", lineHeight: "1.6", fontWeight: "bold" }}>
          <ol style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "5px" }}>
              The measurement book is the basis of all accounts of quantities
              whether of work done by daily labour or by piece-work or contract
              or of materials received which have to be counted or measured, and
              should be so kept up that the transaction may be readily traceable
              in the bill. The measurements effected should then be cancelled by
              cross red lines being drawn across the page or pages.
            </li>
            <li style={{ marginBottom: "5px" }}>
              All measurements are to be neatly taken down in this book and in
              no others. The description of the situation of work must be lucid,
              so as to admit of easy identification and check.
            </li>
            <li style={{ marginBottom: "5px" }}>
              The entries in the measurement book should if possible be made in
              ink, but when this is not possible the entries have to be recorded
              in pencil. The pencil entries should not be inked over but left
              untouched. The contents or area should however be invariably inked
              by the officer who has taken the measurement. No page of the book
              should on any account be torn out. No entry should be erased or
              effaced so as to be illegible. No erasers are allowed. If a
              mistake is made it should be corrected by drawing the pen through
              the incorrect entry and inserting the correct one in red ink
              between the lines. Every such correction should be initialed by the
              officer measuring the work. A reliable record is the object to be
              aimed at as it may have to be produced as evidence in a court of
              law.
            </li>
            <li style={{ marginBottom: "5px" }}>
              For large work, a separate measurement book should be specially set
              apart for each contractor and for each different class of work
              executed by the same contractor.
            </li>
            <li style={{ marginBottom: "5px" }}>
              The measurement books must be looked upon as important records.
              They should be carefully checked by the Executive Engineer to see
              that they are properly kept up and measurements duly recorded and
              that they are a complete record of each kind of work for which
              certificates have been granted. The eventual return of all books
              to the divisional office for record should be insisted upon. They
              must be carefully preserved for 20 years.
            </li>
            <li style={{ marginBottom: "5px" }}>
              Before detailing the measurement relating to a work, the following
              information should invariably be given at the top of the first
              page of such measurements: (a) Name of work. (b) Situation of work.
              (c) Date of measurement. (d) Period during which work was executed or
              supplied.
            </li>
            <li style={{ marginBottom: "5px" }}>
              For facility of reference and to assist in carrying out the
              instructions given in para 4 above, an Index has been provided for.
            </li>
            <li style={{ marginBottom: "5px" }}>
              A Register of measurement books should be maintained showing their
              receipts and disposal.
            </li>
            <li style={{ marginBottom: "5px" }}>
              A Register of transit of measurement books should be maintained by
              each Executive Engineer.
            </li>
            <li>
              Measurement books when not in use must be kept under lock and key.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
