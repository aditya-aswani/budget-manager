// Test script to verify PDF calculations
import { generateBudgetPDF } from './src/utils/pdfGenerator.js';

// Test data with different numbers than defaults
const testData = {
  budget: {
    total: 500000,
    reserves: 80000,
    tuition: 270000,
    fundraising: 150000
  },
  incomeItems: {
    tuition: 310000,
    scholarships: 40000
  },
  expenseItems: {
    staffSalaries: 180000,  // Should match beforeSemester + duringSemester
    otherExpenses: 100000    // Should match sum of all other expense items
  },
  expenseDetails: {
    staffSalaries: {
      beforeSemester: 80000,
      duringSemester: 100000,  // Should match sum of duringDetails
      duringDetails: {
        leadsOtherRoles: { quantity: 3, rate: 8000 },      // = 24000
        residentialFaculty: { quantity: 2, rate: 10000 },  // = 20000
        ras: { quantity: 4, rate: 6000 },                  // = 24000
        retreatTeacher: { quantity: 1, rate: 7000 },       // = 7000
        daylongVisitingTeacher: { quantity: 2, rate: 4000 }, // = 8000
        weeklongVisitingTeacher: { quantity: 1, rate: 9000 }, // = 9000
        headCook: { quantity: 1, rate: 4000 },             // = 4000
        assistantCook: { quantity: 1, rate: 4000 }         // = 4000
        // Total = 100000
      }
    },
    otherExpenses: {
      rent: 25000,  // Should match sum of rentDetails
      food: 15000,
      legalAccountingInsurance: 12000,
      suppliesSubscriptions: 10000,
      it: 8000,
      travel: 20000,
      otherOverhead: 10000,
      // Total = 100000
      rentDetails: {
        csCohort2Program: 10000,
        alumniProgram: 8000,
        donorRetreat: 7000
        // Total = 25000
      }
    }
  },
  income: 500000,
  expenses: 280000,
  balance: 220000
};

console.log('Testing PDF generation with custom data...');
console.log('\nExpected values:');
console.log('Staff Salaries total:', testData.expenseItems.staffSalaries);
console.log('  Before Semester:', testData.expenseDetails.staffSalaries.beforeSemester);
console.log('  During Semester:', testData.expenseDetails.staffSalaries.duringSemester);
console.log('  Sum:', testData.expenseDetails.staffSalaries.beforeSemester + testData.expenseDetails.staffSalaries.duringSemester);
console.log('\nOther Expenses total:', testData.expenseItems.otherExpenses);
console.log('  Rent:', testData.expenseDetails.otherExpenses.rent);
console.log('  Other items sum:',
  testData.expenseDetails.otherExpenses.food +
  testData.expenseDetails.otherExpenses.legalAccountingInsurance +
  testData.expenseDetails.otherExpenses.suppliesSubscriptions +
  testData.expenseDetails.otherExpenses.it +
  testData.expenseDetails.otherExpenses.travel +
  testData.expenseDetails.otherExpenses.otherOverhead
);
console.log('  Total:',
  testData.expenseDetails.otherExpenses.rent +
  testData.expenseDetails.otherExpenses.food +
  testData.expenseDetails.otherExpenses.legalAccountingInsurance +
  testData.expenseDetails.otherExpenses.suppliesSubscriptions +
  testData.expenseDetails.otherExpenses.it +
  testData.expenseDetails.otherExpenses.travel +
  testData.expenseDetails.otherExpenses.otherOverhead
);

console.log('\nGenerating PDF...');
try {
  generateBudgetPDF(testData);
  console.log('PDF generated successfully!');
  console.log('Please check the Downloads folder for the PDF and verify the calculations.');
} catch (error) {
  console.error('Error generating PDF:', error);
}
