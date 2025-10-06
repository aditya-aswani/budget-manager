import React from 'react';
import { formatCurrency } from '../../utils/budgetHelpers';

const BudgetSummary = ({ balance, isBalanced }) => {
  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
      <p className="text-lg font-semibold">
        {isBalanced ? (
          <span className="text-green-600">✓ Budget Balanced</span>
        ) : balance > 0 ? (
          <>
            <span className="text-blue-600">Budget Surplus: {formatCurrency(balance)}</span>
            <span className="block text-sm text-gray-600 mt-1">
              Surplus goes to next Contemplative Semester
            </span>
          </>
        ) : (
          <span className="text-red-600">Budget Deficit: {formatCurrency(Math.abs(balance))}</span>
        )}
      </p>
    </div>
  );
};

export default BudgetSummary;
