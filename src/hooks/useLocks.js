import { useState } from 'react';
import { INITIAL_LOCKS } from '../config/initialBudget';

export const useLocks = () => {
  const [locks, setLocks] = useState(INITIAL_LOCKS);

  const toggleLock = (component) => {
    setLocks(prev => ({ ...prev, [component]: !prev[component] }));
  };

  const isLocked = (component) => {
    return locks[component] || false;
  };

  return {
    locks,
    toggleLock,
    isLocked
  };
};
