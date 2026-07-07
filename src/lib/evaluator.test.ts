import { describe, it, expect } from 'vitest'
import { evaluate, tokenize, parse } from './evaluator'

describe('spec examples', () => {
  it.each([
    ['(+ 1 2)', 3],
    ['(- 5 3.5)', 1.5],
    ['(/ (- 10 2) 4)', 2],
    ['(* (+ 1 2) 3)', 9],
    ['(+ (- 5 2) (* 3 7))', 24],
    ['(* (+ (^ 3 4) (% 11 3)) (/ (- 15 5) 2))', 415]
  ])('evaluates %s', (input, expected) => {
    expect(evaluate(input)).toBe(expected)
  })
})

describe('tokenize', () => {
  it.each([
    ['a flat expression', '(+ 1 2)', ['(', '+', '1', '2', ')']],
    ['nested expressions', '(* (+ 1 2) 3)', ['(', '*', '(', '+', '1', '2', ')', '3', ')']],
    [
      'irregular surrounding and inner whitespace',
      '  (   +  1    2 )  ',
      ['(', '+', '1', '2', ')']
    ],
    ['tabs and newlines as separators', '(+\n1\t2)', ['(', '+', '1', '2', ')']],
    ['decimal and negative numbers as single tokens', '(- 5.5 -3)', ['(', '-', '5.5', '-3', ')']],
    ['scientific notation as single tokens', '(* 1e3 2e-1)', ['(', '*', '1e3', '2e-1', ')']],
    [
      'leading- and trailing-dot numbers as single tokens',
      '(+ .5 5.)',
      ['(', '+', '.5', '5.', ')']
    ],
    ['empty input', '', []],
    ['whitespace-only input', '   ', []],
    ['empty parens', '()', ['(', ')']],
    ['doubled parens with no content', '(())', ['(', '(', ')', ')']],
    ['non-numeric operand tokens untouched', '(+ 1 abc)', ['(', '+', '1', 'abc', ')']]
  ])('tokenizes %s', (_desc, input, expected) => {
    expect(tokenize(input)).toEqual(expected)
  })
})

describe('parse', () => {
  it.each([
    ['a bare number without parentheses', '42', 42],
    ['a flat expression', '(+ 1 2)', { op: '+', left: 1, right: 2 }],
    ['a scientific-notation operand', '(+ 1e2 1)', { op: '+', left: 100, right: 1 }],
    [
      'a left-nested expression',
      '(* (+ 1 2) 3)',
      { op: '*', left: { op: '+', left: 1, right: 2 }, right: 3 }
    ],
    [
      'a right-nested expression',
      '(+ 1 (* 2 3))',
      { op: '+', left: 1, right: { op: '*', left: 2, right: 3 } }
    ],
    [
      'three levels of nesting',
      '(+ (- (* 2 3) 1) 4)',
      { op: '+', left: { op: '-', left: { op: '*', left: 2, right: 3 }, right: 1 }, right: 4 }
    ]
  ])('parses %s', (_desc, input, expected) => {
    expect(parse(tokenize(input))).toStrictEqual(expected)
  })

  it.each([
    ['a symbolic invalid operator', '(& 1 2)', /Invalid operator "&"/],
    ['a missing operator right after "("', '( 1 2)', /Invalid operator "1"/],
    ['an unknown multi-character operator', '(** 2 3)', /Invalid operator "\*\*"/],
    ['an operator missing entirely', '(', /Missing operator/],
    ['a non-numeric operand', '(+ 1 foo)', /Invalid number "foo"/],
    ['a missing operand', '(+ 1)', /Missing operand/],
    ['empty input', '', /Empty expression/],
    ['a missing closing parenthesis', '(+ 1 2', /Missing "\)"/],
    ['too many operands', '(+ 1 2 3)', /Expected "\)" but found "3"/],
    ['trailing tokens after a valid expression', '(+ 1 2) 3', /Unexpected "3" after the expression/]
  ])('throws on %s', (_desc, input, message) => {
    expect(() => parse(tokenize(input))).toThrow(message)
  })

  it('does not mutate the input token array', () => {
    const tokens = tokenize('(+ 1 2)')
    const copy = [...tokens]
    parse(tokens)
    expect(tokens).toEqual(copy)
  })
})

describe('evaluate', () => {
  it.each([
    ['a bare number', '42', 42],
    ['multiplication', '(* 4 3)', 12],
    ['division', '(/ 8 4)', 2],
    ['exponentiation', '(^ 2 5)', 32],
    ['modulo', '(% 11 3)', 2],
    ['scientific-notation operands', '(* 1e3 2e-1)', 200],
    ['leading- and trailing-dot operands', '(+ .5 5.)', 5.5],
    ['addition of negative operands', '(+ -1 -2)', -3],
    ['modulo with a negative dividend', '(% -7 3)', -1],
    ['modulo with a negative divisor', '(% 7 -3)', 1],
    ['a negative exponent', '(^ 2 -1)', 0.5],
    ['zero to the zero power', '(^ 0 0)', 1]
  ])('evaluates %s', (_desc, input, expected) => {
    expect(evaluate(input)).toBe(expected)
  })

  it('evaluates floating-point addition with imprecision', () => {
    expect(evaluate('(+ 0.1 0.2)')).toBeCloseTo(0.3)
  })

  // reject non-finite results and non-decimal literals instead of leaking
  // Infinity/NaN or trusting Number()'s loose parsing
  it.each([
    ['division by zero', '(/ 1 0)'],
    ['modulo by zero', '(% 1 0)'],
    ['zero divided by zero', '(/ 0 0)'],
    ['overflow', '(* 1e308 1e308)'],
    ['Infinity as an operand', '(+ Infinity 1)'],
    ['a hex literal operand', '(+ 0x10 1)'],
    ['a binary literal operand', '(+ 0b10 1)'],
    ['an octal literal operand', '(+ 0o10 1)']
  ])('throws on %s', (_desc, input) => {
    expect(() => evaluate(input)).toThrow()
  })
})
