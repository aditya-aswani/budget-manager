export const INITIAL_BUDGET = {
  total: 366000,
  reserves: 50000,
  tuition: 216000,
  fundraising: 100000,
  variableCosts: 200000,
  fixedCosts: 100000
};

export const INITIAL_INCOME_ITEMS = {
  scholarships: 40000,
  tuition: 256000
};

export const INITIAL_EXPENSE_ITEMS = {
  staffSalaries: 120000,
  otherExpenses: 80000
};

export const INITIAL_EXPENSE_DETAILS = {
  staffSalaries: {
    beforeSemester: 60000,
    duringSemester: 60000,
    duringDetails: {
      leadsOtherRoles: { quantity: 2, rate: 5000 },
      residentialFaculty: { quantity: 2, rate: 5000 },
      ras: { quantity: 2, rate: 5000 },
      retreatTeacher: { quantity: 1, rate: 5000 },
      daylongVisitingTeacher: { quantity: 1, rate: 5000 },
      weeklongVisitingTeacher: { quantity: 2, rate: 5000 },
      headCook: { quantity: 1, rate: 5000 },
      assistantCook: { quantity: 1, rate: 5000 }
    }
  },
  otherExpenses: {
    rent: 10000,
    food: 10000,
    legalAccountingInsurance: 10000,
    suppliesSubscriptions: 10000,
    it: 10000,
    travel: 10000,
    otherOverhead: 10000,
    rentDetails: {
      csCohort2Program: 3333,
      alumniProgram: 3333,
      donorRetreat: 3334
    }
  }
};

export const INITIAL_LOCKS = {
  total: false,
  reserves: true, // Locked by default
  tuition: false,
  fundraising: false,
  expenses: false,
  // Individual item locks
  staffSalaries: false,
  otherExpenses: false,
  scholarships: false,
  tuitionItem: false,
  // Staff salary sub-items
  beforeSemester: false,
  duringSemester: false,
  leadsOtherRoles: false,
  residentialFaculty: false,
  ras: false,
  retreatTeacher: false,
  daylongVisitingTeacher: false,
  weeklongVisitingTeacher: false,
  headCook: false,
  assistantCook: false
};

export const INITIAL_EXPANDED = {
  expenses: false,
  tuitionScholarships: false
};
