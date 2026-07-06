// core calculator for s-expressions

type Operator = '+' | '-' | '*' | '/' | '^' | '%'
const OPERATORS: readonly Operator[] = ['+', '-', '*', '/', '^', '%']
type Node = number | { op: Operator; left: Node; right: Node }

function isOperator(token: string): token is Operator {
  return (OPERATORS as readonly string[]).includes(token)
}

function tokenize(input: string): string[] {
  return input.match(/[()]|[^\s()]+/g) ?? []
}

function parse(tokens: string[]): Node {
  // parser should throw error when the tokens item is not valid
  // parentheses () operators +_*?^% and operands; arity and unbalanced parens
  const cursor = { index: 0 }
  const node = parseExpression(tokens, cursor)

  if (cursor.index !== tokens.length) {
    throw new Error(`Unexpected trailing token "${tokens[cursor.index]}"`)
  }
  return node
}

function parseExpression(tokens: string[], cursor: { index: number }): Node {
  const token = tokens[cursor.index]

  if (token !== '(') {
    return parseOperand(tokens, cursor)
  }

  cursor.index++ // consumes '('

  const opToken = tokens[cursor.index]
  if (!isOperator(opToken)) {
    throw new Error(`Invalid operator "${opToken}"`)
  }
  cursor.index++ // consume operator

  const left = parseOperand(tokens, cursor)
  const right = parseOperand(tokens, cursor)

  if (tokens[cursor.index] !== ')') {
    throw new Error(`Expected ")" but got "${tokens[cursor.index]}"`)
  }
  cursor.index++ // consume ')'

  return { op: opToken, left, right }
}

function parseOperand(tokens: string[], cursor: { index: number }): Node {
  if (tokens[cursor.index] === '(') {
    return parseExpression(tokens, cursor)
  }

  const value = Number(tokens[cursor.index])
  if (Number.isNaN(value)) {
    throw new Error(`Invalid number "${tokens[cursor.index]}"`)
  }
  cursor.index++ // consume valid operand (number)
  return value
}

function calculate(node: Node): number {
  if (typeof node === 'number') return node

  const left = calculate(node.left)
  const right = calculate(node.right)

  switch (node.op) {
    case '+':
      return left + right
    case '-':
      return left - right
    case '*':
      return left * right
    case '/':
      return left / right
    case '^':
      return left ** right
    case '%':
      return left % right
  }
}

export function evaluate(input: string): number {
  return calculate(parse(tokenize(input)))
}
