// core calculator for s-expressions

const OPERATORS = ['+', '-', '*', '/', '^', '%'] as const
type Operator = (typeof OPERATORS)[number]
type Node = number | { op: Operator; left: Node; right: Node }

function isOperator(token: string | undefined): token is Operator {
  return (OPERATORS as readonly string[]).includes(token as string)
}

export function tokenize(input: string): string[] {
  return input.match(/[()]|[^\s()]+/g) ?? []
}

export function parse(tokens: string[]): Node {
  // parser should throw error when the tokens item is not valid
  // parentheses () operators +_*?^% and operands; arity and unbalanced parens
  const cursor = { index: 0 }
  const node = parseExpression(tokens, cursor)

  if (cursor.index !== tokens.length) {
    throw new Error(`Unexpected trailing token "${tokens[cursor.index]}"`)
  }
  return node
}

function nextToken(tokens: string[], cursor: { index: number }): string | undefined {
  const token = tokens[cursor.index]
  cursor.index++
  return token
}

function parseExpression(tokens: string[], cursor: { index: number }): Node {
  const token = tokens[cursor.index]

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

  const left = parseOperand(tokens, cursor)
  const right = parseOperand(tokens, cursor)

  // consume ')'
  const closeToken = nextToken(tokens, cursor)
  if (closeToken !== ')') {
    throw new Error(`Expected ")" but got "${closeToken}"`)
  }

  return { op: opToken, left, right }
}

function parseOperand(tokens: string[], cursor: { index: number }): Node {
  if (tokens[cursor.index] === '(') {
    return parseExpression(tokens, cursor)
  }

  // consume valid operand (number)
  const operandToken = nextToken(tokens, cursor)
  const value = Number(operandToken)
  // check value is not NaN or Infinity
  // also rejects Hex literal 0x, 0b/0o forms
  if (
    operandToken === undefined ||
    !Number.isFinite(value) ||
    /^[+-]?0[xXbBoO]/.test(operandToken)
  ) {
    throw new Error(`Invalid number "${operandToken}"`)
  }
  return value
}

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

function calculate(node: Node): number {
  if (typeof node === 'number') return node

  const left = calculate(node.left)
  const right = calculate(node.right)

  const result = computeOp(node.op, left, right)
  if (!Number.isFinite(result)) throw new Error('Result is not a finite number')
  return result
}

export function evaluate(input: string): number {
  return calculate(parse(tokenize(input)))
}
