import { describe, it, expect } from 'vitest'
import { formatResult } from './format'

describe('formatResult', () => {
  it('collapses binary floating-point artifacts', () => {
    // the motivating case: 0.1 + 0.2 is 0.30000000000000004 as a double
    expect(formatResult(0.1 + 0.2)).toBe('0.3')
    expect(formatResult(1.1 * 3)).toBe('3.3')
    expect(formatResult(0.3 - 0.1)).toBe('0.2')
  })

  it.each([
    [3, '3'],
    [-5, '-5'],
    [0, '0'],
    // -0 must not render as "-0"
    [-0, '0'],
    // large exact integers must not be rounded to 12 significant figures
    [123456789012345, '123456789012345']
  ])('renders the integer %d verbatim', (value, expected) => {
    expect(formatResult(value)).toBe(expected)
  })

  it('keeps genuine fractional precision up to 12 significant figures', () => {
    expect(formatResult(1 / 3)).toBe('0.333333333333')
    expect(formatResult(-2 / 3)).toBe('-0.666666666667')
  })

  it('preserves small and large magnitudes via exponential notation', () => {
    expect(formatResult(1e-7)).toBe('1e-7')
    expect(formatResult(1e21)).toBe('1e+21')
  })

  it('leaves short decimals untouched', () => {
    expect(formatResult(1.5)).toBe('1.5')
    expect(formatResult(-3.25)).toBe('-3.25')
  })
})
