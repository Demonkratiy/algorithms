export type ComplexityOption = { id: string; label: string };
export type ComplexityCriterion = {
  id: string;
  title: string;
  expected: string;
  accepted?: readonly string[];
  explanation: string;
};
export type ComplexityDefinition = {
  variables: string;
  options: readonly ComplexityOption[];
  criteria: readonly ComplexityCriterion[];
};
export type ComplexityChoices = Record<string, string>;

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type Comparison = 'exact' | 'unordered' | 'nested-unordered';
export type FunctionCase = { name: string; args: JsonValue[]; expected: JsonValue };
export type FunctionRunner = {
  kind: 'function';
  entryPoint: string;
  output: { kind: 'return' } | { kind: 'argument'; index: number };
  comparison: Comparison;
  preserveArgs?: number[];
  freshArray?: boolean;
  cases: FunctionCase[];
};
export type ClassCase = {
  name: string;
  instances: JsonValue[][];
  calls: ClassCall[];
};
export type ClassCall = { instance: number; method: string; args: JsonValue[] } & (
  { expected: JsonValue; ignoreReturn?: never } | { ignoreReturn: true; expected?: never }
);
export type ClassRunner = { kind: 'class'; entryPoint: string; cases: ClassCase[] };
export type ListInput = { values: number[]; cycleAt?: number };
export type NodeReference = { list: number; index: number };
export type ListExpectation =
  | { kind: 'value'; value: JsonValue }
  | { kind: 'node'; node: NodeReference | null }
  | { kind: 'list'; values: number[]; reuseNodes?: boolean; nodeOrder?: NodeReference[] };
export type LinkedListCase = {
  name: string;
  lists: ListInput[];
  args?: JsonValue[];
  entryPoint?: string;
  expected: ListExpectation;
};
export type LinkedListRunner = {
  kind: 'linked-list';
  entryPoint: string;
  preserveInputs?: boolean;
  cases: LinkedListCase[];
};
export type TaskDefinition = {
  id: string;
  title: string;
  starter: string;
  complexity: ComplexityDefinition;
  runner: FunctionRunner | ClassRunner | LinkedListRunner;
};
