export type ComplexityOption = { id: string; label: string };
export type ComplexityCriterion = {
  id: string;
  title: string;
  expected: string;
  explanation: string;
};
export type ComplexityDefinition = {
  variables: string;
  options: readonly ComplexityOption[];
  criteria: readonly ComplexityCriterion[];
};
export type ComplexityChoices = Record<string, string>;
