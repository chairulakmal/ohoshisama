// core calculator for s-expressions

const OPERATORS = ['+', '-', '*', '/', '^', '%'] as const
type Operator = (typeof OPERATORS)[number]
// an expression tree: a leaf number or a binary operation on two subtrees
type Node = number | { op: Operator; left: Node; right: Node }

function isOperator(token: string | undefined): token is Operator {
  return (OPERATORS as readonly string[]).includes(token as string)
}

// split into "(", ")", and runs of anything else between whitespace/parens,
// so "(+ 1 2)" and "( +  1   2 )" tokenize the same
export function tokenize(input: string): string[] {
  return input.match(/[()]|[^\s()]+/g) ?? []
}

// grammar: expression = number | "(" operator expression expression ")"
// the input must be exactly one expression — anything left over is an error
export function parse(tokens: string[]): Node {
  if (tokens.length === 0) {
    throw new Error('Please input your s-expression')
  }

  // cursor is shared mutable state so recursive calls advance the same position
  const cursor = { index: 0 }
  const node = parseExpression(tokens, cursor)

  if (cursor.index !== tokens.length) {
    throw new Error(`Unexpected trailing token "${tokens[cursor.index]}"`)
  }
  return node
}

// consume and return the token under the cursor
// returns undefined past the end of input — callers must handle it
function nextToken(tokens: string[], cursor: { index: number }): string | undefined {
  const token = tokens[cursor.index]
  cursor.index++
  return token
}

function parseExpression(tokens: string[], cursor: { index: number }): Node {
  // peek without consuming — parseOperand needs the token if this isn't a "("
  const token = tokens[cursor.index]

  // no "(" means a bare number, e.g. "42"
  if (token !== '(') {
    return parseOperand(tokens, cursor)
  }

  // consumes '('
  nextToken(tokens, cursor)

  // consume operator
  const opToken = nextToken(tokens, cursor)
  if (!isOperator(opToken)) {
    throw new Error(`Invalid operator "${opToken}"`)
  }

  // exactly two operands — no unary or variadic forms
  const left = parseOperand(tokens, cursor)
  const right = parseOperand(tokens, cursor)

  // consume ')' — a third operand or missing paren ends up here
  const closeToken = nextToken(tokens, cursor)
  if (closeToken !== ')') {
    throw new Error(`Expected ")" but got "${closeToken}"`)
  }

  return { op: opToken, left, right }
}

function parseOperand(tokens: string[], cursor: { index: number }): Node {
  // an operand is either a nested expression or a plain number
  if (tokens[cursor.index] === '(') {
    return parseExpression(tokens, cursor)
  }

  // consume valid operand (number)
  const operandToken = nextToken(tokens, cursor)
  // a ")" or end of input here means the operand is missing
  if (operandToken === undefined || operandToken === ')') {
    throw new Error('Missing operand — an operator needs exactly two operands')
  }
  const value = Number(operandToken)
  // check value is not NaN or Infinity
  // also rejects hex 0x, binary 0b, and octal 0o forms, which Number() would
  // otherwise accept — operands must be plain decimal
  if (!Number.isFinite(value) || /^[+-]?0[xXbBoO]/.test(operandToken)) {
    throw new Error(`Invalid number "${operandToken}"`)
  }
  return value
}

// no default case — the switch is exhaustive over Operator, so adding an
// operator without handling it here is a compile error
function computeOp(op: Operator, left: number, right: number): number {
  switch (op) {
    case '+':
      return left + right
    case '-':
      return left - right
    case '*':
      return left * right
    case '/':
      if (right === 0) throw new Error('Division by zero')
      return left / right
    case '^':
      return left ** right
    case '%':
      if (right === 0) throw new Error('Modulo by zero')
      return left % right
  }
}

// evaluate the tree bottom-up: operands first, then the operation
function calculate(node: Node): number {
  if (typeof node === 'number') return node

  const left = calculate(node.left)
  const right = calculate(node.right)

  const result = computeOp(node.op, left, right)
  // catches overflow to Infinity, e.g. (* 1e308 1e308), rather than leaking it
  if (!Number.isFinite(result)) throw new Error('Result is not a finite number')
  return result
}

// the whole pipeline: raw input → tokens → tree → number
export function evaluate(input: string): number {
  return calculate(parse(tokenize(input)))
}
