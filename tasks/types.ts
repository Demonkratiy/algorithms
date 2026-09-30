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
  calls: { instance: number; method: string; args: JsonValue[]; expected: JsonValue }[];
};
export type ClassRunner = { kind: 'class'; entryPoint: string; cases: ClassCase[] };
export type TaskDefinition = {
  id: string;
  title: string;
  starter: string;
  complexity: ComplexityDefinition;
  runner: FunctionRunner | ClassRunner;
};
