import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateBudgetPDF = (budgetData) => {
  const { budget, incomeItems, expenseItems, expenseDetails, income, expenses, balance } = budgetData;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Budget Report', pageWidth / 2, 20, { align: 'center' });

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Generated: ${dateStr}`, pageWidth / 2, 28, { align: 'center' });

  let yPosition = 40;

  // Summary Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text('Executive Summary', 14, yPosition);
  yPosition += 10;

  // Summary table
  autoTable(doc, {
    startY: yPosition,
    head: [['Category', 'Amount']],
    body: [
      ['Total Budget', `$${budget.total.toLocaleString()}`],
      ['Total Income', `$${income.toLocaleString()}`],
      ['Total Expenses', `$${expenses.toLocaleString()}`],
      ['Balance', `$${balance.toLocaleString()}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 11, fontStyle: 'bold' },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'right', cellWidth: 'auto' }
    },
    margin: { left: 14 }
  });

  yPosition = (doc.lastAutoTable?.finalY || yPosition + 40) + 15;

  // Income Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94); // Green color
  doc.text('Income Breakdown', 14, yPosition);
  yPosition += 10;

  const incomeData = [
    ['Reserves', '', `$${budget.reserves.toLocaleString()}`],
    ['Tuition & Scholarships', '', ''],
    ['', 'Tuition (Gross)', `$${incomeItems.tuition.toLocaleString()}`],
    ['', 'Scholarships', `($${incomeItems.scholarships.toLocaleString()})`],
    ['', 'Net Tuition', `$${budget.tuition.toLocaleString()}`],
    ['Fundraising', '', `$${budget.fundraising.toLocaleString()}`]
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Category', 'Sub-Item', 'Amount']],
    body: incomeData,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94], fontSize: 11, fontStyle: 'bold' },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 60 },
      2: { halign: 'right', cellWidth: 'auto' }
    },
    margin: { left: 14 },
    didParseCell: function(data) {
      // Make indented items lighter
      if (data.column.index === 0 && data.cell.raw === '') {
        data.cell.styles.fillColor = [248, 250, 252];
      }
      // Bold the net tuition row
      if (data.column.index === 1 && data.cell.raw === 'Net Tuition') {
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  yPosition = (doc.lastAutoTable?.finalY || yPosition + 50) + 15;

  // Check if we need a new page
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  // Expense Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(249, 115, 22); // Orange color
  doc.text('Expense Breakdown', 14, yPosition);
  yPosition += 10;

  const staffDetails = expenseDetails.staffSalaries;
  const otherDetails = expenseDetails.otherExpenses;

  const expenseData = [
    ['Staff Salaries', '', `$${expenseItems.staffSalaries.toLocaleString()}`],
    ['', 'Before Semester', `$${staffDetails.beforeSemester.toLocaleString()}`],
    ['', 'During Semester', `$${staffDetails.duringSemester.toLocaleString()}`],
    ['', '  • Leads/Other Roles', `$${(staffDetails.duringDetails.leadsOtherRoles.quantity * staffDetails.duringDetails.leadsOtherRoles.rate).toLocaleString()} (${staffDetails.duringDetails.leadsOtherRoles.quantity} × $${staffDetails.duringDetails.leadsOtherRoles.rate.toLocaleString()})`],
    ['', '  • Residential Faculty', `$${(staffDetails.duringDetails.residentialFaculty.quantity * staffDetails.duringDetails.residentialFaculty.rate).toLocaleString()} (${staffDetails.duringDetails.residentialFaculty.quantity} × $${staffDetails.duringDetails.residentialFaculty.rate.toLocaleString()})`],
    ['', '  • RAs', `$${(staffDetails.duringDetails.ras.quantity * staffDetails.duringDetails.ras.rate).toLocaleString()} (${staffDetails.duringDetails.ras.quantity} × $${staffDetails.duringDetails.ras.rate.toLocaleString()})`],
    ['', '  • Retreat Teacher', `$${(staffDetails.duringDetails.retreatTeacher.quantity * staffDetails.duringDetails.retreatTeacher.rate).toLocaleString()} (${staffDetails.duringDetails.retreatTeacher.quantity} × $${staffDetails.duringDetails.retreatTeacher.rate.toLocaleString()})`],
    ['', '  • Daylong Visiting Teacher', `$${(staffDetails.duringDetails.daylongVisitingTeacher.quantity * staffDetails.duringDetails.daylongVisitingTeacher.rate).toLocaleString()} (${staffDetails.duringDetails.daylongVisitingTeacher.quantity} × $${staffDetails.duringDetails.daylongVisitingTeacher.rate.toLocaleString()})`],
    ['', '  • Weeklong Visiting Teacher', `$${(staffDetails.duringDetails.weeklongVisitingTeacher.quantity * staffDetails.duringDetails.weeklongVisitingTeacher.rate).toLocaleString()} (${staffDetails.duringDetails.weeklongVisitingTeacher.quantity} × $${staffDetails.duringDetails.weeklongVisitingTeacher.rate.toLocaleString()})`],
    ['', '  • Head Cook', `$${(staffDetails.duringDetails.headCook.quantity * staffDetails.duringDetails.headCook.rate).toLocaleString()} (${staffDetails.duringDetails.headCook.quantity} × $${staffDetails.duringDetails.headCook.rate.toLocaleString()})`],
    ['', '  • Assistant Cook', `$${(staffDetails.duringDetails.assistantCook.quantity * staffDetails.duringDetails.assistantCook.rate).toLocaleString()} (${staffDetails.duringDetails.assistantCook.quantity} × $${staffDetails.duringDetails.assistantCook.rate.toLocaleString()})`],
    ['Other Expenses', '', `$${expenseItems.otherExpenses.toLocaleString()}`],
    ['', 'Rent', `$${otherDetails.rent.toLocaleString()}`],
    ['', '  • CS Cohort 2 Program', `$${otherDetails.rentDetails.csCohort2Program.toLocaleString()}`],
    ['', '  • Alumni Program', `$${otherDetails.rentDetails.alumniProgram.toLocaleString()}`],
    ['', '  • Donor Retreat', `$${otherDetails.rentDetails.donorRetreat.toLocaleString()}`],
    ['', 'Food', `$${otherDetails.food.toLocaleString()}`],
    ['', 'Legal, Accounting, Insurance', `$${otherDetails.legalAccountingInsurance.toLocaleString()}`],
    ['', 'Supplies and Subscriptions', `$${otherDetails.suppliesSubscriptions.toLocaleString()}`],
    ['', 'IT', `$${otherDetails.it.toLocaleString()}`],
    ['', 'Travel', `$${otherDetails.travel.toLocaleString()}`],
    ['', 'Other Overhead', `$${otherDetails.otherOverhead.toLocaleString()}`]
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Category', 'Sub-Item', 'Amount']],
    body: expenseData,
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22], fontSize: 11, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 60 },
      2: { halign: 'right', cellWidth: 'auto' }
    },
    margin: { left: 14 },
    didParseCell: function(data) {
      // Make indented items lighter
      if (data.column.index === 0 && data.cell.raw === '') {
        data.cell.styles.fillColor = [254, 243, 199];
      }
      // Style sub-sub-items (with bullets)
      if (data.column.index === 1 && typeof data.cell.raw === 'string' && data.cell.raw.startsWith('  •')) {
        data.cell.styles.fontSize = 8;
        data.cell.styles.textColor = [107, 114, 128];
      }
    }
  });

  yPosition = (doc.lastAutoTable?.finalY || yPosition + 30) + 15;

  // Balance Section
  const balanceColor = balance >= 0 ? [34, 197, 94] : [239, 68, 68]; // Green if positive, red if negative
  const balanceText = balance >= 0 ? 'Budget Surplus' : 'Budget Deficit';

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);

  // Create a box for the balance
  doc.setDrawColor(balanceColor[0], balanceColor[1], balanceColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(14, yPosition - 5, pageWidth - 28, 20);

  doc.text(balanceText, pageWidth / 2, yPosition + 3, { align: 'center' });
  doc.setFontSize(18);
  doc.text(`$${Math.abs(balance).toLocaleString()}`, pageWidth / 2, yPosition + 12, { align: 'center' });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.setFont('helvetica', 'italic');
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount} | Contemplative Semester Budget`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF using blob method for better browser compatibility
  try {
    const filename = `budget-report-${new Date().toISOString().split('T')[0]}.pdf`;

    // Get the PDF as a blob
    const pdfBlob = doc.output('blob');

    // Create a download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';

    // Append to body and trigger download
    document.body.appendChild(link);

    // Try to trigger download
    requestAnimationFrame(() => {
      link.click();
    });

    // Fallback: If download doesn't work, open in new tab after 1 second
    setTimeout(() => {
      window.open(url, '_blank');
    }, 1000);

    // Clean up after 3 seconds
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 3000);
  } catch (error) {
    console.error('Error saving PDF:', error);
    throw error;
  }
};
