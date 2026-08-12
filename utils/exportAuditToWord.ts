/**
 * Exports the Annexure 7 Quarterly Internal Audit Report data into a formatted Microsoft Word document (.doc)
 * strictly formatted according to the official Annexure 7 standard template shown in official guidelines.
 */
export function exportAuditReportToWord(report: any) {
  if (!report) return;

  const pastObs = report.pastObservations && report.pastObservations.length > 0
    ? report.pastObservations
    : [
        { type: "Financial- High", totalFindings: "", findingsResolved: "", findingsPending: "" },
        { type: "Procedural- High", totalFindings: "", findingsResolved: "", findingsPending: "" },
        { type: "Procedural- Low", totalFindings: "", findingsResolved: "", findingsPending: "" },
        { type: "Documentary- High", totalFindings: "", findingsResolved: "", findingsPending: "" },
        { type: "Documentary-Low", totalFindings: "", findingsResolved: "", findingsPending: "" },
      ];

  // Calculate totals for Part II
  const totalPastFindings = pastObs.reduce((sum: number, o: any) => sum + (Number(o.totalFindings) || 0), 0) || "";
  const totalPastResolved = pastObs.reduce((sum: number, o: any) => sum + (Number(o.findingsResolved) || 0), 0) || "";
  const totalPastPending = pastObs.reduce((sum: number, o: any) => sum + (Number(o.findingsPending) || 0), 0) || "";

  const pendingCompliances = report.pendingCompliances || [];
  const reportSummaries = report.reportSummaries || [];
  const observations = report.observations || [];
  const gpMembers = report.gpMembersCount || {};
  
  const upaSamiti = report.upaSamitiDetails && report.upaSamitiDetails.length > 0
    ? report.upaSamitiDetails
    : [
        { name: "Artha O Parikalpana", directMembers: "", designatedMembers: "", sanchalakName: "", meetingsHeld: "" },
        { name: "Krishi O Pranisampad Bikas", directMembers: "", designatedMembers: "", sanchalakName: "", meetingsHeld: "" },
        { name: "Siksha O Janasasthya", directMembers: "", designatedMembers: "", sanchalakName: "", meetingsHeld: "" },
        { name: "Nari, Sishu Unnayan O Samaj Kalyan", directMembers: "", designatedMembers: "", sanchalakName: "", meetingsHeld: "" },
        { name: "Shilpa O Parikathama", directMembers: "", designatedMembers: "", sanchalakName: "", meetingsHeld: "" },
      ];

  const gpStaff = report.gpStaffDetails && report.gpStaffDetails.length > 0
    ? report.gpStaffDetails
    : [
        { designation: "Gram Panchayat", maleName: "", femaleName: "", salary: "" },
        { designation: "Executive Assistant", maleName: "", femaleName: "", salary: "" },
        { designation: "Secretary", maleName: "", femaleName: "", salary: "" },
        { designation: "Nirman Sahayak", maleName: "", femaleName: "", salary: "" },
        { designation: "Sahayak (1)", maleName: "", femaleName: "", salary: "" },
        { designation: "Sahayak (2)", maleName: "", femaleName: "", salary: "" },
        { designation: "Gram Panchayat Karmee (2 Nos)", maleName: "", femaleName: "", salary: "" },
      ];

  const fundUsage = report.fundUsage || {};
  const procurementList = report.procurementList || [];
  const otherExpenditure = report.otherExpenditureList || [];
  const propertyTax = report.propertyTaxOSR || {};
  const tradeLicence = report.tradeLicenceOSR || {};
  const otherInfo = report.otherInfoStats || {};

  // Part III Pending rows (pad to min 4 rows if empty or small)
  let pendingRowsHtml = "";
  const maxPendingRows = Math.max(pendingCompliances.length, 4);
  for (let i = 0; i < maxPendingRows; i++) {
    const item = pendingCompliances[i] || {};
    pendingRowsHtml += `
      <tr>
        <td style="text-align:center; border:1px solid #000; padding:3px;">${i + 1}</td>
        <td style="border:1px solid #000; padding:3px;">${item.reportNoAndYear || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.findingNo || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.description || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.type || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.importance || ''}</td>
        <td style="border:1px solid #000; padding:3px; text-align:right;">${item.amount || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.actionToBeTaken || ''}</td>
      </tr>
    `;
  }

  // Part IV Summary rows (pad to min 4 rows if empty)
  let summaryRowsHtml = "";
  const maxSummaryRows = Math.max(reportSummaries.length, 4);
  for (let i = 0; i < maxSummaryRows; i++) {
    const item = reportSummaries[i] || {};
    summaryRowsHtml += `
      <tr>
        <td style="text-align:center; border:1px solid #000; padding:3px;">${item.findingNo || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.area || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.title || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.type || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.importance || ''}</td>
        <td style="border:1px solid #000; padding:3px; text-align:right;">${item.amount || ''}</td>
      </tr>
    `;
  }

  // Format observations section exactly matching Image 1 (right page)
  let globalFindingCounter = 1;
  const renderObservationCategory = (categoryName: string, categoryType: string, minEmptyCount: number = 1) => {
    const filtered = observations.filter((o: any) => o.type === categoryType);
    let html = `<div style="font-weight:bold; text-align:center; font-size:9.5pt; margin-top:8px; margin-bottom:4px;">${categoryName}</div>`;

    if (filtered.length > 0) {
      filtered.forEach((obs: any) => {
        html += `
          <table style="width:100%; border-collapse:collapse; margin-bottom:8px; border:1px solid #000;">
            <tr>
              <td style="width:6%; border-right:1px solid #000; border-bottom:1px solid #000; font-weight:bold; text-align:center; vertical-align:middle; font-size:10pt;">${globalFindingCounter++}</td>
              <td style="padding:0; border-bottom:1px solid #000;">
                <table style="width:100%; border-collapse:collapse; border:none;">
                  <tr><td style="width:25%; border-bottom:1px solid #000; border-right:1px solid #000; padding:3px; font-weight:bold;">Title:</td><td style="border-bottom:1px solid #000; padding:3px;">${obs.title || ''}</td></tr>
                  <tr><td style="border-bottom:1px solid #000; border-right:1px solid #000; padding:3px; font-weight:bold;">Area:</td><td style="border-bottom:1px solid #000; padding:3px;">${obs.area || ''}</td></tr>
                  <tr><td style="border-bottom:1px solid #000; border-right:1px solid #000; padding:3px; font-weight:bold;">Importance:</td><td style="border-bottom:1px solid #000; padding:3px;">${obs.importance || ''}</td></tr>
                  <tr><td style="border-bottom:1px solid #000; border-right:1px solid #000; padding:3px; font-weight:bold;">Description of the finding:</td><td style="border-bottom:1px solid #000; padding:3px;">${obs.description || ''}</td></tr>
                  <tr><td style="border-bottom:1px solid #000; border-right:1px solid #000; padding:3px; font-weight:bold;">Corrective action to be taken:</td><td style="border-bottom:1px solid #000; padding:3px;">${obs.correctiveAction || ''}</td></tr>
                  <tr><td style="border-right:1px solid #000; padding:3px; font-weight:bold;">GP Response:</td><td style="padding:3px;">${obs.gpResponse || ''}</td></tr>
                </table>
              </td>
            </tr>
          </table>
        `;
      });
    } else {
      for (let k = 0; k < minEmptyCount; k++) {
        html += `
          <table style="width:100%; border-collapse:collapse; margin-bottom:8px; border:1px solid #000;">
            <tr>
              <td style="width:6%; border-right:1px solid #000; border-bottom:1px solid #000; font-weight:bold; text-align:center; vertical-align:middle; font-size:10pt;">${globalFindingCounter++}</td>
              <td style="padding:0; border-bottom:1px solid #000;">
                <table style="width:100%; border-collapse:collapse; border:none;">
                  <tr><td style="width:25%; border-bottom:1px solid #000; border-right:1px solid #000; padding:3px; font-weight:bold;">Title:</td><td style="border-bottom:1px solid #000; padding:3px;">&nbsp;</td></tr>
                  <tr><td style="border-bottom:1px solid #000; border-right:1px solid #000; padding:3px; font-weight:bold;">Area:</td><td style="border-bottom:1px solid #000; padding:3px;">&nbsp;</td></tr>
                  <tr><td style="border-bottom:1px solid #000; border-right:1px solid #000; padding:3px; font-weight:bold;">Importance:</td><td style="border-bottom:1px solid #000; padding:3px;">&nbsp;</td></tr>
                  <tr><td style="border-bottom:1px solid #000; border-right:1px solid #000; padding:3px; font-weight:bold;">Description of the finding:</td><td style="border-bottom:1px solid #000; padding:3px;">&nbsp;</td></tr>
                  <tr><td style="border-bottom:1px solid #000; border-right:1px solid #000; padding:3px; font-weight:bold;">Corrective action to be taken:</td><td style="border-bottom:1px solid #000; padding:3px;">&nbsp;</td></tr>
                  <tr><td style="border-right:1px solid #000; padding:3px; font-weight:bold;">GP Response:</td><td style="padding:3px;">&nbsp;</td></tr>
                </table>
              </td>
            </tr>
          </table>
        `;
      }
    }
    return html;
  };

  // Procurement Rows (min 5 rows)
  let procurementRowsHtml = "";
  const maxProcurementRows = Math.max(procurementList.length, 5);
  for (let i = 0; i < maxProcurementRows; i++) {
    const item = procurementList[i] || {};
    procurementRowsHtml += `
      <tr>
        <td style="text-align:center; border:1px solid #000; padding:3px;">${i + 1}</td>
        <td style="border:1px solid #000; padding:3px;">${item.fund || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.nitNo || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.nitDate || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.activityName || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.typeOfProcurement || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.typeOfWork || ''}</td>
        <td style="border:1px solid #000; padding:3px; text-align:right;">${item.estimatedValue !== undefined ? item.estimatedValue : ''}</td>
        <td style="border:1px solid #000; padding:3px; text-align:right;">${item.contractValue !== undefined ? item.contractValue : ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.contractDate || ''}</td>
        <td style="border:1px solid #000; padding:3px; text-align:right;">${item.billValue !== undefined ? item.billValue : ''}</td>
        <td style="border:1px solid #000; padding:3px; text-align:right;">${item.planPlusValue !== undefined ? item.planPlusValue : ''}</td>
        <td style="border:1px solid #000; padding:3px; text-align:center;">${item.sample || ''}</td>
      </tr>
    `;
  }

  // Other Expenditure Rows (min 10 rows matching Image 2 right page)
  let otherExpRowsHtml = "";
  const maxOtherExpRows = Math.max(otherExpenditure.length, 10);
  for (let i = 0; i < maxOtherExpRows; i++) {
    const item = otherExpenditure[i] || {};
    otherExpRowsHtml += `
      <tr>
        <td style="text-align:center; border:1px solid #000; padding:3px;">${i + 1}</td>
        <td style="border:1px solid #000; padding:3px;">${item.fund || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.voucherNo || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.voucherDate || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.expenditureType || ''}</td>
        <td style="border:1px solid #000; padding:3px;">${item.description || ''}</td>
        <td style="border:1px solid #000; padding:3px; text-align:right;">${item.amount !== undefined ? item.amount : ''}</td>
        <td style="border:1px solid #000; padding:3px; text-align:center;">${item.sample || ''}</td>
      </tr>
    `;
  }

  // Member totals
  const maleElected = Number(gpMembers.maleElected || 0);
  const femaleElected = Number(gpMembers.femaleElected || 0);
  const maleExOfficio = Number(gpMembers.maleExOfficio || 0);
  const femaleExOfficio = Number(gpMembers.femaleExOfficio || 0);
  const totalElected = maleElected + femaleElected;
  const totalExOfficio = maleExOfficio + femaleExOfficio;
  const totalMale = maleElected + maleExOfficio;
  const totalFemale = femaleElected + femaleExOfficio;
  const grandTotalMembers = totalElected + totalExOfficio;

  const wordDocumentHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Annexure 7: Format of Internal Audit Report</title>
      <style>
        @page {
          size: 8.5in 11.0in;
          margin: 0.5in 0.5in 0.5in 0.5in;
        }
        body { font-family: 'Times New Roman', serif; font-size: 9pt; color: #000; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 8px; }
        th, td { border: 1px solid #000; padding: 3px 4px; font-size: 8.5pt; vertical-align: middle; }
        th { font-weight: bold; text-align: center; background-color: #ffffff; }
        .bold { font-weight: bold; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
      </style>
    </head>
    <body>
      <table style="border:none; width:100%; margin-bottom:10px;">
        <tr style="border:none;">
          <td style="border:none; font-weight:bold; font-size:10pt; text-align:left; width:30%;">Annexure 7:</td>
          <td style="border:none; font-weight:bold; font-size:12pt; text-decoration:underline; text-align:center; width:70%;">Format of Internal Audit Report</td>
        </tr>
      </table>

      <!-- Part I -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:12px;">
        <thead>
          <tr style="background-color:#ffffff;">
            <th colspan="3" style="border:1px solid black; padding:4px; font-weight:bold; text-align:center; font-size:9.5pt;">Part I: General Information (Optional)</th>
          </tr>
          <tr style="background-color:#ffffff;">
            <th colspan="3" style="border:1px solid black; padding:3px; font-weight:bold; text-align:left;">Auditee's Profile</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="width:5%; text-align:center; border:1px solid black;">1</td><td style="width:40%; border:1px solid black;">Report No.</td><td style="border:1px solid black;">${report.reportNo || ''}</td></tr>
          <tr><td style="text-align:center; border:1px solid black;">2</td><td style="border:1px solid black;">Name of the GP</td><td style="border:1px solid black;">${report.gpName || ''}</td></tr>
          <tr><td style="text-align:center; border:1px solid black;">3</td><td style="border:1px solid black;">Block and district</td><td style="border:1px solid black;">${report.blockAndDistrict || ''}</td></tr>
          <tr><td style="text-align:center; border:1px solid black;">4</td><td style="border:1px solid black;">Risk Category of the GP</td><td style="border:1px solid black;">${report.riskCategory || ''}</td></tr>
          <tr><td style="text-align:center; border:1px solid black;">5</td><td style="border:1px solid black;">Address & Telephone no. of GP</td><td style="border:1px solid black;">${report.gpAddressAndPhone || ''}</td></tr>

          <tr style="background-color:#ffffff;"><td colspan="3" style="border:1px solid black; padding:3px; font-weight:bold; text-align:left;">Auditor's Profile</td></tr>
          <tr><td style="text-align:center; border:1px solid black;">1</td><td style="border:1px solid black;">Name of audit party members</td><td style="border:1px solid black;">${report.auditPartyMembers || ''}</td></tr>
          <tr><td style="text-align:center; border:1px solid black;">2</td><td style="border:1px solid black;">Contact no. of audit party members</td><td style="border:1px solid black;">${report.auditPartyContact || ''}</td></tr>
          <tr><td style="text-align:center; border:1px solid black;">3</td><td style="border:1px solid black;">E-Mail ID of audit party members</td><td style="border:1px solid black;">${report.auditPartyEmail || ''}</td></tr>

          <tr style="background-color:#ffffff;"><td colspan="3" style="border:1px solid black; padding:3px; font-weight:bold; text-align:left;">Audit Profile</td></tr>
          <tr><td style="text-align:center; border:1px solid black;">1</td><td style="border:1px solid black;">Audit Period</td><td style="border:1px solid black;">${report.auditPeriod || `${report.quarter || ''} (${report.financialYear || ''})`}</td></tr>
          <tr><td style="text-align:center; border:1px solid black;">2</td><td style="border:1px solid black;">Duration of audit</td><td style="border:1px solid black;">${report.auditDuration || ''}</td></tr>
          <tr><td style="text-align:center; border:1px solid black;">3</td><td style="border:1px solid black;">Total findings</td><td style="border:1px solid black; font-weight:bold;">${report.totalFindings !== undefined ? report.totalFindings : (observations.length || 0)}</td></tr>
        </tbody>
      </table>

      <!-- Part II -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:12px;">
        <thead>
          <tr style="background-color:#ffffff;">
            <th colspan="4" style="border:1px solid black; padding:4px; font-weight:bold; text-align:center; font-size:9.5pt;">Part II: Summary of past observations</th>
          </tr>
          <tr>
            <th style="border:1px solid black; padding:3px; width:40%;">Types</th>
            <th style="border:1px solid black; padding:3px; width:20%;">Total findings</th>
            <th style="border:1px solid black; padding:3px; width:20%;">Findings resolved</th>
            <th style="border:1px solid black; padding:3px; width:20%;">Findings pending for compliance</th>
          </tr>
        </thead>
        <tbody>
          ${pastObs.map((obs: any) => `
            <tr>
              <td style="border:1px solid black; padding:3px;">${obs.type}</td>
              <td style="border:1px solid black; padding:3px; text-align:center;">${obs.totalFindings !== undefined ? obs.totalFindings : ''}</td>
              <td style="border:1px solid black; padding:3px; text-align:center;">${obs.findingsResolved !== undefined ? obs.findingsResolved : ''}</td>
              <td style="border:1px solid black; padding:3px; text-align:center;">${obs.findingsPending !== undefined ? obs.findingsPending : ''}</td>
            </tr>
          `).join("")}
          <tr style="font-weight:bold;">
            <td style="border:1px solid black; padding:3px;">Total</td>
            <td style="border:1px solid black; padding:3px; text-align:center;">${totalPastFindings}</td>
            <td style="border:1px solid black; padding:3px; text-align:center;">${totalPastResolved}</td>
            <td style="border:1px solid black; padding:3px; text-align:center;">${totalPastPending}</td>
          </tr>
        </tbody>
      </table>

      <!-- Part III -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:12px;">
        <thead>
          <tr style="background-color:#ffffff;">
            <th colspan="8" style="border:1px solid black; padding:4px; font-weight:bold; text-align:center; font-size:9.5pt;">Part III: Pending Internal and ELA Audit Compliance</th>
          </tr>
          <tr>
            <th style="border:1px solid black; padding:3px; width:5%;">S. No.</th>
            <th style="border:1px solid black; padding:3px; width:12%;">Report no & year</th>
            <th style="border:1px solid black; padding:3px; width:10%;">Finding No.</th>
            <th style="border:1px solid black; padding:3px; width:30%;">Brief Description of Finding</th>
            <th style="border:1px solid black; padding:3px; width:10%;">Type</th>
            <th style="border:1px solid black; padding:3px; width:10%;">Importance</th>
            <th style="border:1px solid black; padding:3px; width:10%;">Amount</th>
            <th style="border:1px solid black; padding:3px; width:13%;">Action to be taken</th>
          </tr>
        </thead>
        <tbody>
          ${pendingRowsHtml}
        </tbody>
      </table>

      <!-- Part IV -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:12px;">
        <thead>
          <tr style="background-color:#ffffff;">
            <th colspan="6" style="border:1px solid black; padding:4px; font-weight:bold; text-align:center; font-size:9.5pt;">Part IV: Report Summary Form</th>
          </tr>
          <tr>
            <th style="border:1px solid black; padding:3px; width:12%;">Finding No.</th>
            <th style="border:1px solid black; padding:3px; width:23%;">Area (procurement/ revenue/ BOA etc.)</th>
            <th style="border:1px solid black; padding:3px; width:30%;">Title</th>
            <th style="border:1px solid black; padding:3px; width:15%;">Type (Financial/ procedural/ documentary)</th>
            <th style="border:1px solid black; padding:3px; width:10%;">Importance (High/Low)</th>
            <th style="border:1px solid black; padding:3px; width:10%;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${summaryRowsHtml}
        </tbody>
      </table>

      <!-- Part V: Observations -->
      <div style="font-weight:bold; text-align:center; padding:4px; border:1px solid #000; text-transform:uppercase; margin-top:10px; margin-bottom:6px; font-size:9.5pt;">Part V: Observations</div>
      ${renderObservationCategory("Financial finding", "Financial finding", 2)}
      ${renderObservationCategory("Procedural finding", "Procedural finding", 2)}
      ${renderObservationCategory("Documentary finding", "Documentary finding", 1)}

      <!-- Part V: Additional Information -->
      <div style="font-weight:bold; text-align:center; padding:4px; border:1px solid #000; text-transform:uppercase; margin-top:10px; margin-bottom:6px; font-size:9.5pt;">Part V: Additional Information</div>
      
      <p class="bold" style="margin-top:8px; margin-bottom:3px;">1. Total number of members in GP</p>
      <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
        <thead>
          <tr>
            <th style="text-align:left; width:40%;">Category</th>
            <th style="width:20%;">Male</th>
            <th style="width:20%;">Female</th>
            <th style="width:20%;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Directly Elected Member</td>
            <td class="text-center">${maleElected || ''}</td>
            <td class="text-center">${femaleElected || ''}</td>
            <td class="text-center bold">${totalElected || ''}</td>
          </tr>
          <tr>
            <td>Ex-Officio Member</td>
            <td class="text-center">${maleExOfficio || ''}</td>
            <td class="text-center">${femaleExOfficio || ''}</td>
            <td class="text-center bold">${totalExOfficio || ''}</td>
          </tr>
          <tr class="bold">
            <td>Total</td>
            <td class="text-center">${totalMale || ''}</td>
            <td class="text-center">${totalFemale || ''}</td>
            <td class="text-center">${grandTotalMembers || ''}</td>
          </tr>
        </tbody>
      </table>

      <p class="bold" style="margin-top:8px; margin-bottom:3px;">2. Details of Upa-Samiti</p>
      <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
        <thead>
          <tr>
            <th style="text-align:left; width:30%;">Upa-Samiti</th>
            <th style="width:20%;">No. of Members Directly nominated</th>
            <th style="width:15%;">No. of Designated Member</th>
            <th style="text-align:left; width:20%;">Name of Sanchalak</th>
            <th style="width:15%;">No. of meetings held</th>
          </tr>
        </thead>
        <tbody>
          ${upaSamiti.map((item: any) => `
            <tr>
              <td>${item.name || ''}</td>
              <td class="text-center">${item.directMembers !== undefined ? item.directMembers : ''}</td>
              <td class="text-center">${item.designatedMembers !== undefined ? item.designatedMembers : ''}</td>
              <td>${item.sanchalakName || ''}</td>
              <td class="text-center">${item.meetingsHeld !== undefined ? item.meetingsHeld : ''}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <p class="bold" style="margin-top:8px; margin-bottom:3px;">3. Designation-wise details of GP staff</p>
      <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
        <thead>
          <tr>
            <th style="text-align:left; width:35%;">Gram Panchayat</th>
            <th style="text-align:left; width:25%;">Male-Name</th>
            <th style="text-align:left; width:25%;">Female- Name</th>
            <th style="width:15%;">Salary(optional)</th>
          </tr>
        </thead>
        <tbody>
          ${gpStaff.map((staff: any) => `
            <tr>
              <td>${staff.designation || ''}</td>
              <td>${staff.maleName || ''}</td>
              <td>${staff.femaleName || ''}</td>
              <td class="text-center">${staff.salary || ''}</td>
            </tr>
          `).join("")}
          <tr class="bold">
            <td>Total</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <p class="bold" style="margin-top:8px; margin-bottom:3px;">4. Use of fund in the audit year</p>
      <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
        <thead>
          <tr>
            <th style="width:25%;">Tied Fund</th>
            <th style="width:25%;">Untied Fund</th>
            <th style="width:25%;">Amount utilised</th>
            <th style="width:25%;">Percentage of amount utilised</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">${fundUsage.tiedFund !== undefined ? fundUsage.tiedFund : ''}</td>
            <td class="text-center">${fundUsage.untiedFund !== undefined ? fundUsage.untiedFund : ''}</td>
            <td class="text-center">${fundUsage.amountUtilised !== undefined ? fundUsage.amountUtilised : ''}</td>
            <td class="text-center bold">${fundUsage.percentageUtilised ? fundUsage.percentageUtilised + '%' : ''}</td>
          </tr>
        </tbody>
      </table>

      <p class="bold" style="margin-top:8px; margin-bottom:3px;">5. Procurement</p>
      <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
        <thead>
          <tr>
            <th style="width:4%;">Sl No.</th>
            <th style="width:7%;">Fund</th>
            <th style="width:7%;">NIT No.</th>
            <th style="width:8%;">Date of NIT</th>
            <th style="width:15%;">Activity Name</th>
            <th style="width:8%;">Type of procurement (Goods/ Services/ Works)</th>
            <th style="width:8%;">Type of Work (Roads/ Building etc.)</th>
            <th style="width:8%;">Estimated Value (including GST & Labour Cess)</th>
            <th style="width:8%;">Contract Value (including GST & Labour)</th>
            <th style="width:8%;">Contract Date</th>
            <th style="width:8%;">Bill Value (including GST & Labour Cess)</th>
            <th style="width:6%;">Plan Plus Value</th>
            <th style="width:3%;">Sample (Y/N)</th>
          </tr>
        </thead>
        <tbody>
          ${procurementRowsHtml}
        </tbody>
      </table>

      <p class="bold" style="margin-top:8px; margin-bottom:3px;">6. Other expenditure (Optional)</p>
      <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
        <thead>
          <tr>
            <th style="width:5%;">Sl No</th>
            <th style="width:10%;">Fund</th>
            <th style="width:10%;">Voucher No.</th>
            <th style="width:10%;">Voucher Date</th>
            <th style="width:15%;">Expenditure type</th>
            <th style="width:25%;">Description</th>
            <th style="width:15%;">Amount</th>
            <th style="width:10%;">Sample (Y/N)</th>
          </tr>
        </thead>
        <tbody>
          ${otherExpRowsHtml}
        </tbody>
      </table>

      <p class="bold" style="margin-top:8px; margin-bottom:3px;">7. Own source revenue- Property Tax</p>
      <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
        <thead>
          <tr>
            <th>No. of Assesses</th>
            <th>Arrears (Rs.)</th>
            <th>Current Year Demand (Rs.)</th>
            <th>Total Receivable (Rs.)</th>
            <th>Arrears collected (Rs.)</th>
            <th>CY demand collected (Rs.)</th>
            <th>Total collection (Rs.)</th>
            <th>Pending amount (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">${propertyTax.noOfAssesses !== undefined ? propertyTax.noOfAssesses : ''}</td>
            <td class="text-center">${propertyTax.arrears !== undefined ? propertyTax.arrears : ''}</td>
            <td class="text-center">${propertyTax.currentYearDemand !== undefined ? propertyTax.currentYearDemand : ''}</td>
            <td class="text-center bold">${propertyTax.totalReceivable !== undefined ? propertyTax.totalReceivable : ''}</td>
            <td class="text-center">${propertyTax.arrearsCollected !== undefined ? propertyTax.arrearsCollected : ''}</td>
            <td class="text-center">${propertyTax.cyDemandCollected !== undefined ? propertyTax.cyDemandCollected : ''}</td>
            <td class="text-center bold">${propertyTax.totalCollection !== undefined ? propertyTax.totalCollection : ''}</td>
            <td class="text-center bold">${propertyTax.pendingAmount !== undefined ? propertyTax.pendingAmount : ''}</td>
          </tr>
        </tbody>
      </table>

      <p class="bold" style="margin-top:8px; margin-bottom:3px;">8. Own source revenue- Tradelicence</p>
      <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
        <thead>
          <tr>
            <th>No. of Assesses</th>
            <th>Arrears (Rs.)</th>
            <th>Current Year Demand (Rs.)</th>
            <th>Total Receivable (Rs.)</th>
            <th>Arrears collected (Rs.)</th>
            <th>CY demand collected (Rs.)</th>
            <th>Total collection (Rs.)</th>
            <th>Pending amount (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">${tradeLicence.noOfAssesses !== undefined ? tradeLicence.noOfAssesses : ''}</td>
            <td class="text-center">${tradeLicence.arrears !== undefined ? tradeLicence.arrears : ''}</td>
            <td class="text-center">${tradeLicence.currentYearDemand !== undefined ? tradeLicence.currentYearDemand : ''}</td>
            <td class="text-center bold">${tradeLicence.totalReceivable !== undefined ? tradeLicence.totalReceivable : ''}</td>
            <td class="text-center">${tradeLicence.arrearsCollected !== undefined ? tradeLicence.arrearsCollected : ''}</td>
            <td class="text-center">${tradeLicence.cyDemandCollected !== undefined ? tradeLicence.cyDemandCollected : ''}</td>
            <td class="text-center bold">${tradeLicence.totalCollection !== undefined ? tradeLicence.totalCollection : ''}</td>
            <td class="text-center bold">${tradeLicence.pendingAmount !== undefined ? tradeLicence.pendingAmount : ''}</td>
          </tr>
        </tbody>
      </table>

      <p class="bold" style="margin-top:8px; margin-bottom:3px;">9. Other information (Optional)</p>
      <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
        <tbody>
          <tr><td style="width:60%;" class="bold">Total population</td><td class="text-center">${otherInfo.totalPopulation !== undefined ? otherInfo.totalPopulation : ''}</td></tr>
          <tr><td class="bold">No. of death certificate issued</td><td class="text-center">${otherInfo.deathCertificatesIssued !== undefined ? otherInfo.deathCertificatesIssued : ''}</td></tr>
          <tr><td class="bold">No. of birth certificate issued</td><td class="text-center">${otherInfo.birthCertificatesIssued !== undefined ? otherInfo.birthCertificatesIssued : ''}</td></tr>
          <tr><td class="bold">No. of trade licence issued</td><td class="text-center">${otherInfo.tradeLicencesIssued !== undefined ? otherInfo.tradeLicencesIssued : ''}</td></tr>
        </tbody>
      </table>

      <!-- Footer Signatures -->
      <div style="margin-top:30px; page-break-inside:avoid;">
        <table style="width:100%; border:none;">
          <tr style="border:none;">
            <td style="width:50%; border:none; vertical-align:bottom; font-weight:bold;">
              Signature of the Internal Audit Officer
            </td>
            <td style="width:50%; border:none; text-align:right;">
              <strong>Designation:</strong> ${report.auditorDesignation || "Internal Audit Officer"}<br/><br/>
              <strong>Office Address:</strong> ${report.auditorOfficeAddress || "Office of the BDO, Hilli"}
            </td>
          </tr>
        </table>
      </div>

    </body>
    </html>
  `;

  // Create downloadable Word document blob
  const blob = new Blob(["\ufeff", wordDocumentHtml], {
    type: "application/msword",
  });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  const cleanReportNo = (report.reportNo || "Report").replace(/[\/\\?%*:|"<>]/g, "_");
  downloadLink.href = url;
  downloadLink.download = `Annexure_7_Internal_Audit_Report_${cleanReportNo}.doc`;

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
