/**
 * Utilities for redistributing values when items are locked
 */

export const findUnlockedItems = (items, currentKey, locks) => {
  return Object.keys(items).filter(key =>
    key !== currentKey && !locks[key]
  );
};

export const canRedistribute = (unlockedItems, currentValues, adjustment) => {
  return unlockedItems.every(key =>
    currentValues[key] - adjustment >= 0
  );
};

export const redistributeProportionally = (items, unlockedKeys, totalAdjustment) => {
  const newItems = { ...items };
  const unlockedTotal = unlockedKeys.reduce((sum, k) => sum + items[k], 0);

  unlockedKeys.forEach(k => {
    const ratio = unlockedTotal > 0
      ? items[k] / unlockedTotal
      : 1 / unlockedKeys.length;
    newItems[k] = Math.max(0, items[k] + totalAdjustment * ratio);
  });

  return newItems;
};

export const redistributeEvenly = (items, unlockedKeys, diff) => {
  const newItems = { ...items };
  const adjustment = diff / unlockedKeys.length;

  unlockedKeys.forEach(k => {
    newItems[k] = Math.max(0, items[k] - adjustment);
  });

  return newItems;
};

export const getRedistributionError = (lockedItemName, lockedTotal, attemptedChange) => {
  const action = attemptedChange > 0 ? 'increase' : 'decrease';

  return `⚠️ Cannot ${action} ${lockedItemName} total when it is locked.\n\n` +
         `${lockedItemName} is currently locked at: $${lockedTotal.toLocaleString()}\n` +
         `This change would make the total: $${attemptedChange.toLocaleString()}\n\n` +
         `All other items are locked, so redistribution is not possible.\n\n` +
         `To make this change:\n` +
         `1. Unlock ${lockedItemName}, OR\n` +
         `2. Unlock another item to allow redistribution`;
};

export const getIncomeRedistributionError = (lockedTotal, newTotal) => {
  const action = newTotal > lockedTotal ? 'increase' : 'decrease';

  return `⚠️ Cannot ${action} Total Income when Total Budget is locked.\n\n` +
         `Total Budget is currently locked at: $${lockedTotal.toLocaleString()}\n` +
         `This change would make Total Income: $${newTotal.toLocaleString()}\n\n` +
         `All other income sources are locked, so redistribution is not possible.\n\n` +
         `To make this change:\n` +
         `1. Unlock Total Budget, OR\n` +
         `2. Unlock another income source to allow redistribution`;
};
