export const QUESTIONS = [
  { label: "5 questions", value: 5 },
  { label: "10 questions", value: 10 },
  { label: "15 questions", value: 15 },
  { label: "20 questions", value: 20 },
];

export const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export const QUESTION_COST = Number(process.env.NEXT_PUBLIC_TOKENS_PER_QUESTION || 5)
