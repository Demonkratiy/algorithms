export type QuizOption = { id: string; label: string };
export type QuizQuestion = { id: string; options: QuizOption[]; answerId: string };
export type QuizDefinition = { id: string; title: string; questions: QuizQuestion[] };
export type QuizAnswers = Record<string, string>;
