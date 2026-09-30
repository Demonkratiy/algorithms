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
export type Comparison = 'exact' | 'unordered' | 'nested-unordered' | 'unordered-tuples' | 'closest-points' | 'approximate' | 'topological-order';
export type FunctionCase = { name: string; args: JsonValue[] } & (
  { expected: JsonValue; expectedUndefined?: never } | { expectedUndefined: true; expected?: never }
);
export type FunctionRunner = {
  kind: 'function';
  entryPoint: string;
  output: { kind: 'return' } | { kind: 'argument'; index: number };
  comparison: Comparison;
  preserveArgs?: number[];
  freshArray?: boolean;
  tolerance?: { absolute: number; relative: number };
  cases: FunctionCase[];
};
export type ClassCase = {
  name: string;
  instances: JsonValue[][];
  calls: ClassCall[];
  factories?: ComparatorFactory[];
};
export type ComparatorFactory = { instance: number; argument: number; direction: 'asc' | 'desc' } & (
  { kind: 'number'; property?: never } | { kind: 'property'; property: string }
);
export type ClassCall = { instance: number } & (
  { method: string; args: JsonValue[]; property?: never } | { property: string; method?: never; args?: never }
) & (
  { expected: JsonValue; ignoreReturn?: never; expectedUndefined?: never }
  | { ignoreReturn: true; expected?: never; expectedUndefined?: never }
  | { expectedUndefined: true; expected?: never; ignoreReturn?: never }
);
export type ClassRunner = {
  kind: 'class';
  entryPoint: string;
  factoryMethod?: string;
  preserveArgs?: number[];
  cases: ClassCase[];
};
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
export type TreeExpectation =
  | { kind: 'value'; value: JsonValue }
  | { kind: 'node'; index: number | null }
  | { kind: 'tree'; values: (number | null)[]; reuseNodes?: boolean };
export type BinaryTreeCase = {
  name: string;
  tree: (number | null)[];
  nodeArgs?: number[];
  args?: JsonValue[];
  expected: TreeExpectation;
};
export type BinaryTreeRunner = {
  kind: 'binary-tree';
  entryPoint: string;
  preserveInput?: boolean;
  cases: BinaryTreeCase[];
};
export type GraphCloneCase = {
  name: string;
  adjacency: number[][];
  values?: number[];
  start?: number;
};
export type GraphCloneRunner = {
  kind: 'graph-clone';
  entryPoint: string;
  cases: GraphCloneCase[];
};
export type TaskDefinition = {
  id: string;
  title: string;
  starter: string;
  complexity: ComplexityDefinition;
  verificationNote?: string;
  runner: FunctionRunner | ClassRunner | LinkedListRunner | BinaryTreeRunner | GraphCloneRunner;
};
