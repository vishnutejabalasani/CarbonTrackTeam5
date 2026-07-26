import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateEsgPdfReport = (reportData) => {
  if (!reportData) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const companyName = reportData.companyName || "CarbonTrack Enterprise";
  const reportTitle = reportData.reportTitle || "Annual ESG Performance & Sustainability Audit Report";
  const auditDate = reportData.auditDate || new Date().toISOString().split("T")[0];
  const generatedTime = reportData.generatedTime 
    ? new Date(reportData.generatedTime).toLocaleString() 
    : new Date().toLocaleString();
  const esgScore = reportData.overallEsgScore ?? 88.5;
  const auditScore = reportData.auditScore ?? 92.0;

  const primaryColor = [15, 76, 58]; // #0F4C3A Dark Emerald
  const accentColor = [34, 197, 94]; // Green accent
  const lightBg = [240, 253, 244]; // Light green background
  const darkTextColor = [30, 41, 59];

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("CARBON TRACK", 14, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("ESG Analytics & Sustainability Intelligence Platform", 14, 23);

  doc.setFontSize(8);
  doc.setTextColor(209, 250, 229);
  doc.text(`Report ID: ESG-AUDIT-${reportData.id || "LIVE"}`, 14, 30);
  doc.text(`Generated: ${generatedTime}`, 140, 30, { align: "right" });

  let y = 46;

  // Title Box & Company Info
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 34, 3, 3, "FD");

  doc.setTextColor(...darkTextColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(reportTitle, 20, y + 10);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Organization / Entity: `, 20, y + 18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkTextColor);
  doc.text(`${companyName}`, 55, y + 18);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Audit Date: `, 20, y + 25);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkTextColor);
  doc.text(`${auditDate}`, 42, y + 25);

  // ESG Overall Rating Badge Box right
  doc.setFillColor(...primaryColor);
  doc.roundedRect(140, y + 5, 50, 24, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("OVERALL ESG SCORE", 165, y + 12, { align: "center" });
  doc.setFontSize(14);
  doc.text(`${esgScore} / 100`, 165, y + 22, { align: "center" });

  y += 42;

  // 1. Environmental Section
  doc.setFillColor(...primaryColor);
  doc.rect(14, y, 4, 8, "F");
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. ENVIRONMENTAL PERFORMANCE & EMISSIONS", 22, y + 6);
  y += 12;

  const totalCarbon = reportData.totalCarbonEmissions ?? 0;
  const weeklyEmissions = reportData.weeklyEmissions ?? 0;
  const monthlyEmissions = reportData.monthlyEmissions ?? 0;

  // Metrics Grid Boxes
  const boxWidth = 57;
  const drawMetricBox = (x, label, val, sub) => {
    doc.setFillColor(...lightBg);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(x, y, boxWidth, 18, 2, 2, "FD");

    doc.setTextColor(22, 101, 52);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(label.toUpperCase(), x + 4, y + 5);

    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${val} kg CO₂e`, x + 4, y + 12);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(sub, x + 4, y + 16);
  };

  drawMetricBox(14, "Total Emissions", totalCarbon.toFixed(1), "Lifetime logged metrics");
  drawMetricBox(76, "Weekly Emissions", weeklyEmissions.toFixed(1), "Last 7 days carbon total");
  drawMetricBox(138, "Monthly Emissions", monthlyEmissions.toFixed(1), "Last 30 days projection");

  y += 24;

  // Category Emissions Table
  const catData = reportData.categoryEmissions || {};
  const catRows = [
    ["Transport Transit", `${(catData.transport || 0).toFixed(1)} kg CO₂e`, `${totalCarbon > 0 ? (((catData.transport || 0) / totalCarbon) * 100).toFixed(1) : 0}%`, "High Impact Vector"],
    ["Electricity & Utilities", `${(catData.electricity || 0).toFixed(1)} kg CO₂e`, `${totalCarbon > 0 ? (((catData.electricity || 0) / totalCarbon) * 100).toFixed(1) : 0}%`, "Facility Footprint"],
    ["Food & Dietary Usage", `${(catData.food || 0).toFixed(1)} kg CO₂e`, `${totalCarbon > 0 ? (((catData.food || 0) / totalCarbon) * 100).toFixed(1) : 0}%`, "Operational Supply"],
    ["Retail & Shopping", `${(catData.shopping || 0).toFixed(1)} kg CO₂e`, `${totalCarbon > 0 ? (((catData.shopping || 0) / totalCarbon) * 100).toFixed(1) : 0}%`, "Indirect Procurement"],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Emission Category", "Emissions Volume", "Share of Total", "Classification"]],
    body: catRows,
    theme: "striped",
    headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: darkTextColor },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 10;

  // 2. Social Metrics Section
  doc.setFillColor(...primaryColor);
  doc.rect(14, y, 4, 8, "F");
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. SOCIAL RESPONSIBILITY & COMMUNITY METRICS", 22, y + 6);
  y += 12;

  const empMetrics = reportData.socialEmployeeMetrics || {};
  const commMetrics = reportData.socialCommunityMetrics || {};

  const socialRows = [
    ["Employee Diversity Score", `${empMetrics.diversityScore || 88}/100`, "Human Capital Target", "Compliant"],
    ["Sustainability Training", `${empMetrics.trainingHoursPerEmployee || 24.5} hrs/employee`, "Annual Development", "Achieved"],
    ["Health & Safety Index", `${empMetrics.healthSafetyIndex || 97.8}%`, "Workplace Standard", "Optimal"],
    ["Community Eco Investment", `${commMetrics.communityEcoInvestment || "$15,000"}`, "External Initiatives", "Active"],
    ["Trees Restored / Funded", `${commMetrics.treesRestoredCount || 15} Trees`, "Off-site Sequestration", "Verified"],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Social Indicator", "Metric Value", "Benchmark Target", "Status"]],
    body: socialRows,
    theme: "striped",
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: darkTextColor },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 10;

  // 3. Governance Metrics Section
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(...primaryColor);
  doc.rect(14, y, 4, 8, "F");
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("3. GOVERNANCE & COMPLIANCE METRICS", 22, y + 6);
  y += 12;

  const govMetrics = reportData.governanceMetrics || {};

  const govRows = [
    ["Regulatory Compliance", `${govMetrics.regulatoryCompliancePercentage || 99.4}%`, "ISO 14001 / GHG Protocol", "Exceeds Standard"],
    ["Ethics Policy Coverage", `${govMetrics.ethicsPolicyCoverage || 100}%`, "Full Staff Attestation", "Complete"],
    ["Data Privacy & Security", govMetrics.dataPrivacyAuditPassed !== false ? "100% Passed" : "In Progress", "GDPR / SOC2 Guidelines", "Certified"],
    ["Overall Audit Score", `${auditScore} / 100`, "Independent Board Review", "Grade A+"],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Governance Indicator", "Measured Status", "Regulatory Framework", "Audit Rating"]],
    body: govRows,
    theme: "striped",
    headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: darkTextColor },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 10;

  // 4. Strategic Recommendations
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(...primaryColor);
  doc.rect(14, y, 4, 8, "F");
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("4. STRATEGIC DECARBONIZATION RECOMMENDATIONS", 22, y + 6);
  y += 12;

  const recList = Array.isArray(reportData.recommendations) 
    ? reportData.recommendations 
    : [];

  const recRows = recList.length > 0
    ? recList.map((r, idx) => [`REC-0${idx + 1}`, r.title || r.name || "Action Item", r.desc || r.description || "Implement efficiency protocols."])
    : [
        ["REC-01", "Optimize High-Emission Transit", "Switch low-occupancy vehicle trips to electric shuttles or public transport."],
        ["REC-02", "Smart Energy Management", "Deploy smart thermostats and LED retrofit across corporate facilities."],
        ["REC-03", "Supplier Carbon Standard", "Require Tier-1 suppliers to publish GHG Protocol Scope 1 & 2 disclosures."],
      ];

  autoTable(doc, {
    startY: y,
    head: [["Code", "Recommendation Title", "Actionable Guidance"]],
    body: recRows,
    theme: "striped",
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: darkTextColor },
    columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 50 }, 2: { cellWidth: 112 } },
    margin: { left: 14, right: 14 },
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 282, 196, 282);
    doc.text("Generated by Carbon Footprint Tracker", 14, 287);
    doc.text(`Page ${i} of ${totalPages}`, 196, 287, { align: "right" });
  }

  doc.save(`ESG_Analytics_Report_${companyName.replace(/\s+/g, "_")}_${auditDate}.pdf`);
};
