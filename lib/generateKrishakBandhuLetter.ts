type ApplicantRow = {
  applicantName: string;
  deceasedName: string;
  village: string;
  postOffice: string;
  policeStation: string;
  district: string;
};

export function generateKrishakBandhuLetter(params: {
  memoNo: string;
  letterDate: string; // ISO date
  toOffice: string;
  blockName: string;
  applicants: ApplicantRow[];
  enclosureCount?: string;
}) {
  const { memoNo, letterDate, toOffice, blockName, applicants, enclosureCount = "01(One)" } = params;

  const dateStr = letterDate ? new Date(letterDate).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }) : "";

  const tableRows = applicants
    .map((row, idx) =>
      `<tr>
        <td style="border:1px solid #000; padding:6px; text-align:center;">${idx + 1}</td>
        <td style="border:1px solid #000; padding:6px;">${escapeHtml(row.applicantName)}</td>
        <td style="border:1px solid #000; padding:6px;">${escapeHtml(row.deceasedName)}</td>
        <td style="border:1px solid #000; padding:6px;">Vill-${escapeHtml(row.village)}<br/>P.O-${escapeHtml(row.postOffice)}<br/>P.S-${escapeHtml(row.policeStation)}<br/>Dist-${escapeHtml(row.district)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Krishak Bandhu Letter</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; color: #000; }
        .heading { text-align: center; font-weight: bold; }
        .sub { text-align: left; margin-top: 12px; }
        .meta { margin-top: 8px; display: flex; justify-content: space-between; }
        table { border-collapse: collapse; width: 100%; margin-top: 12px; }
        .small { font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="heading">
        GOVERNMENT OF WEST BENGAL<br/>
        OFFICE OF THE ASSISTANT DIRECTOR OF AGRICULTURE<br/>
        ${escapeHtml(blockName)}
      </div>
      <div class="meta">
        <div>Memo No. ${escapeHtml(memoNo)}</div>
        <div>Dated: ${escapeHtml(dateStr)}</div>
      </div>
      <div style="margin-top:16px;">
        To,<br/>
        ${escapeHtml(toOffice)}<br/>
        ${escapeHtml(blockName)}
      </div>
      <div class="sub">
        <strong>Sub:</strong> Submission of ${padTwo(applicants.length)} application form(s) regarding Krishak Bandhu (Death Benefit)
      </div>
      <p class="small">In connection to the subject cited above the undersigned is sending herewith ${padTwo(applicants.length)} number application form in duplicate under Krishak Bandhu (Death Benefit) scheme. The details of the applicant(s) is given below:</p>
      <table>
        <thead>
          <tr>
            <th style="border:1px solid #000; padding:6px; width:60px;">Sl. No</th>
            <th style="border:1px solid #000; padding:6px;">Name of the applicant(s)</th>
            <th style="border:1px solid #000; padding:6px;">Name of the Deceased Person</th>
            <th style="border:1px solid #000; padding:6px;">Address</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <p class="small" style="margin-top:12px;">This is for your kind information and taking necessary action.<br/>Thanking you,</p>
      <div style="margin-top:24px; text-align:right;">
        Assistant Director of Agriculture<br/>
        ${escapeHtml(blockName)}
      </div>
      <div style="margin-top:24px;" class="small">
        Enclo: ${escapeHtml(enclosureCount)} application in duplicate.
      </div>
      <div style="margin-top:16px;" class="small">
        Copy forwarded for information to:<br/>
        1. The Sabhapati, Hili Panchayat Samiti, ${escapeHtml(blockName)}<br/>
        2. The Assistant Director of Agriculture (Admn.), Balurghat Sub-division, Dakshin Dinajpur<br/>
        3. The Deputy Director of Agriculture (Admn.), Dakshin Dinajpur, Balurghat<br/>
        4. Office Copy
      </div>
    </body>
  </html>`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function escapeHtml(input: string): string {
  return (input || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function padTwo(num: number): string {
  return num < 10 ? `0${num}` : String(num);
}


