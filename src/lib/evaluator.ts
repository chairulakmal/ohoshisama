// src/lib/evaluator.ts

type Operator = '+' | '-' | '*' | '/' | '^' | '%'
type Node = number | { op: Operator; left: Node; right: Node }

function tokenize(input: string): string[] {
    console.log(input)
    return []
}

function parse(tokens: string[]): Node {
    console.log(tokens)
    return 0
}

export function evaluate(input: string): number {
    console.log(parse(tokenize(input)))
    return 0
}