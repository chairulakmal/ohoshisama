import { describe, it, expect } from 'vitest'
import { evaluate } from './evaluator'

describe('evaluate', () => {
  it('evaluates addition', () => {
    expect(evaluate('(+ 1 2)')).toBe(3)
  })

  it('evaluates subtraction with decimals', () => {
    expect(evaluate('(- 5 3.5)')).toBe(1.5)
  })

  it('evaluates nested division and subtraction', () => {
    expect(evaluate('(/ (- 10 2) 4)')).toBe(2)
  })

  it('evaluates nested multiplication and addition', () => {
    expect(evaluate('(* (+ 1 2) 3)')).toBe(9)
  })

  it('evaluates addition of nested subtraction and multiplication', () => {
    expect(evaluate('(+ (- 5 2) (* 3 7))')).toBe(24)
  })

  it('evaluates a deeply nested expression using all operators', () => {
    const result = evaluate('(* (+ (^ 3 4) (% 11 3)) (/ (- 15 5) 2))')
    expect(result).toBe(415)
  })
})
