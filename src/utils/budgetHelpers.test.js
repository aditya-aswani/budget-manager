import { describe, it, expect } from 'vitest';
import { formatNumber, parseNumber, formatCurrency } from './budgetHelpers';

describe('budgetHelpers', () => {
  describe('formatNumber', () => {
    it('should format positive numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(123456789)).toBe('123,456,789');
    });

    it('should format zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should format negative numbers with commas', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
      expect(formatNumber(-1000000)).toBe('-1,000,000');
    });

    it('should round decimal numbers', () => {
      expect(formatNumber(1000.4)).toBe('1,000');
      expect(formatNumber(1000.5)).toBe('1,001');
      expect(formatNumber(1000.9)).toBe('1,001');
    });

    it('should handle small numbers', () => {
      expect(formatNumber(1)).toBe('1');
      expect(formatNumber(99)).toBe('99');
      expect(formatNumber(100)).toBe('100');
    });
  });

  describe('parseNumber', () => {
    it('should parse formatted numbers with commas', () => {
      expect(parseNumber('1,000')).toBe(1000);
      expect(parseNumber('1,000,000')).toBe(1000000);
      expect(parseNumber('123,456,789')).toBe(123456789);
    });

    it('should parse plain numbers', () => {
      expect(parseNumber('1000')).toBe(1000);
      expect(parseNumber('0')).toBe(0);
      expect(parseNumber('999')).toBe(999);
    });

    it('should parse negative numbers', () => {
      expect(parseNumber('-1,000')).toBe(-1000);
      expect(parseNumber('-1000')).toBe(-1000);
    });

    it('should parse decimal numbers', () => {
      expect(parseNumber('1,000.50')).toBe(1000.50);
      expect(parseNumber('999.99')).toBe(999.99);
    });

    it('should handle invalid input', () => {
      expect(parseNumber('')).toBe(0);
      expect(parseNumber('abc')).toBe(0);
      expect(parseNumber(null)).toBe(0);
      expect(parseNumber(undefined)).toBe(0);
    });

    it('should handle numeric input', () => {
      expect(parseNumber(1000)).toBe(1000);
      expect(parseNumber(0)).toBe(0);
      expect(parseNumber(-500)).toBe(-500);
    });
  });

  describe('formatCurrency', () => {
    it('should format positive amounts with dollar sign', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(1000000)).toBe('$1,000,000');
      expect(formatCurrency(123456789)).toBe('$123,456,789');
    });

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('should format negative amounts', () => {
      expect(formatCurrency(-1000)).toBe('-$1,000');
      expect(formatCurrency(-500)).toBe('-$500');
    });

    it('should round to nearest dollar (no decimals)', () => {
      expect(formatCurrency(1000.49)).toBe('$1,000');
      expect(formatCurrency(1000.50)).toBe('$1,001');
      expect(formatCurrency(999.99)).toBe('$1,000');
    });

    it('should handle small amounts', () => {
      expect(formatCurrency(1)).toBe('$1');
      expect(formatCurrency(99)).toBe('$99');
      expect(formatCurrency(100)).toBe('$100');
    });
  });
});
