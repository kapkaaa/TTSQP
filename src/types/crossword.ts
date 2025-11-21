export interface Level {
  id: number;
  title: string;
  grid_json: string;
  clues_json: string;
}

export interface Clue {
  id: number;
  text: string;
  direction: 'across' | 'down';
  position: [number, number];
}

export interface Leader {
  id: number;
  username: string;
  score_total: number;
}