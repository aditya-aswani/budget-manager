// Format number with commas
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
};

// Parse number from formatted string
export const parseNumber = (str) => {
  return parseFloat(String(str).replace(/,/g, '')) || 0;
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
