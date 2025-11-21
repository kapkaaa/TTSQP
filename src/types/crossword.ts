// types/crossword.ts
export interface Level {
  id: number;
  title: string;
  description: string | null;
  width: number;
  height: number;
  timer: number;
  created_at: string;
}

export interface Clue {
  id: number;
  level_id: number;
  number: number;
  direction: 'across' | 'down';
  clue_text: string;
  answer: string;
  start_row: number;
  start_col: number;
  length: number;
  created_at: string;
}

export interface Cell {
  id: number;
  level_id: number;
  row: number;
  col: number;
  type: 'blank' | 'block';
  solution_letter: string | null;
  clue_across_id: number | null;
  clue_down_id: number | null;
  created_at: string;
}

export interface Leader {
  id: number;
  username: string;
  score_total: number;
}